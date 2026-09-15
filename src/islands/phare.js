// islands/phare.js — Île du Phare · Astra · passe 4, village miniature cosy
// Base publique : 1c0d3e6. Coordonnées en mètres, Y vertical, mer Y=0.
// Centre {x:34,z:-18} ; rayon nominal 12, englobant 14.
// Enveloppe du relief : x∈[20,48], z∈[-32,-4].
// Ponton EXISTANT géré par archipel.js : centre (34,.60,-5),
// heading=Math.atan2(-38.2,20), 0 vers +Z. Aucun ponton construit ici.
// Apparition inchangée : {x:35.8,y:.56,z:-7.4,heading:Math.PI}.
// Raccord terre : (35.8,.56,-6.2). Crique sud-est conservée plane.
// Phare : pied (34,12.5,-25.3), galerie Y=18.7, foyer (34,19.45,-25.3).
// Gardien souhaité : {id:'gardien',x:33.2,y:12.5,z:-23.2,heading:.4,scale:1}.
// Chèvres souhaitées (positions sur paliers, adapter le leash aux chemins) :
//   {id:'chevre-1',x:37.9,y:3.6,z:-12.4,heading:2.2,scale:1}
//   {id:'chevre-2',x:32.2,y:7,z:-14.8,heading:-.4,scale:.85}
//   {id:'chevre-3',x:36.5,y:10.3,z:-19.3,heading:1.7,scale:.95}
//
// Branchements existants conservés : npcMeshes.gardien, goatMesh,
// gardienLanternDraw et phareLanternDraw (mode 7). Foyer et galerie inchangés.
// La passe reste dans la géométrie statique fusionnée de cette île : pas de
// nouveau draw call, de texture à charger ni de modification de la sauvegarde.
// Le vent existant anime les feuilles ; les couleurs du sol restent hors du
// seuil « feuillage » du shader et de la carte de hauteur.
// platforms est déjà rendu dans island.js : les nouveaux socles sont donc
// matérialisés explicitement ici ET déclarés pour la carte de hauteur.
// Validation GPU / parcours à effectuer dans Chrome avant commit : le navigateur
// de la session de préparation ne dispose pas de WebGL 2.
{
  const pharePreviousSeed = seed;
  seed = 341809;
  try {
    const CX = 34, CZ = -18;
    const chalk=color(0xd8c7a6);
    const radialSteps = 80, angularSteps = 128;
    const climb = [[35.8,.56,-8.8],[37.5,3.6,-12.5],[32.5,7,-15.5],
      [36.5,10.3,-20],[34,12.5,-23]];
    const landings = [
      {x:37.5,y:3.6,z:-12.5,r:1.35}, {x:32.5,y:7,z:-15.5,r:1.35},
      {x:36.5,y:10.3,z:-20,r:1.35}, {x:34,y:12.5,z:-23,r:1.65},
      {x:34,y:12.5,z:-25.3,r:1.8},
      {x:40,y:3.6,z:-12.8,r:2}, {x:29.7,y:7,z:-16,r:2},
      {x:39.8,y:10.3,z:-20.5,r:2.05}
    ];
    const paths = [climb,
      [[37.5,3.6,-12.5],[37.7,3.6,-10.9],[40,3.6,-11.15]],
      [[32.5,7,-15.5],[32,7,-14.25],[29.7,7,-14.25]],
      [[36.5,10.3,-20],[36.7,10.3,-18.6],[39.8,10.3,-18.75]]];
    const reservedDiscs=[
      [35.8,-7.4,1.1], [35.8,-6.2,1.1], [34,-5,2.5],
      [33.2,-23.2,1.4],
      [37.9,-12.4,1.9], [32.2,-14.8,1.9], [36.5,-19.3,1.9]
    ];
    // Bosquets composés : dense près du village, bas et espacés au sommet.
    // Chaque ellipse est une poche de plantation, jamais un semis sur toute l'île.
    const gardens = [
      [28.9,-13.25,2.1,.72], [40.65,-9.8,1.1,.58],
      [42.1,-16.9,.7,.9], [27.8,-21.1,1.55,.7],
      [30.2,-23.7,.7,.48], [38.5,-24.2,.7,.95],
      [32.3,-26.9,1.6,.40], [26.7,-13.45,.7,.45],
      [27.2,-10.2,1.1,.35], [26.5,-17.5,.65,.9],
      [29.7,-21.05,1.65,.55], [28.5,-23.8,1.1,.55],
      [39.2,-16.25,1.65,.40], [32.1,-10.25,.9,.28]
    ];
    const stoneLots = [];
    function nearestSegment(x,z,a,b) {
      const dx=b[0]-a[0],dz=b[2]-a[2];
      const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));
      return {d:Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz),y:a[1]+t*(b[1]-a[1])};
    }
    const smooth = t => { t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); };

    // Côte irrégulière et avancée sableuse au sud-est pour le futur ponton.
    function coastRadius(a) {
      const delta = Math.atan2(Math.sin(a-1.42), Math.cos(a-1.42));
      return 11.45 + .32*Math.sin(3*a+.7) + .22*Math.cos(5*a)
        + 1.70*Math.exp(-delta*delta/.15);
    }
    function surfaceY(x,z,r) {
      const inland = smooth((1-r)/.23);
      // Trois ruptures de pente : vires larges et fronts de roche resserrés.
      const terracesY = 3.04*smooth((-z-10.7)/1.6)
        + 3.4*smooth((-z-14.3)/1.4) + 3.3*smooth((-z-18.6)/1.5)
        + 2.2*smooth((-z-22)/1.1);
      let height = .56+terracesY*inland;
      height += .18*Math.sin(x*.83+z*.3)*Math.sin(terracesY*.75)*inland;
      height -= 1.36*smooth((r-.94)/.06);
      // Trois vires DANS le massif : bandes horizontales, raccords plus raides.
      // La marge protège aussi les triangles voisins des chemins et des PNJ.
      let sculpt=smooth((.94-r)/.07);
      for(const path of paths)for(let i=1;i<path.length;i++)
        sculpt=Math.min(sculpt,smooth((nearestSegment(x,z,path[i-1],path[i]).d-1.55)/.7));
      for(const p of landings)
        sculpt=Math.min(sculpt,smooth((Math.hypot(x-p.x,z-p.z)-p.r-.65)/.5));
      for(const [px,pz,pr] of reservedDiscs)
        sculpt=Math.min(sculpt,smooth((Math.hypot(x-px,z-pz)-pr-.55)/.5));
      for(const level of[1.65,5.15,8.55]){
        const d=height-level;
        height-=d*(1-smooth((Math.abs(d)-.36)/1.0))*sculpt;
      }
      // Tailler le massif SOUS les escaliers : le personnage ne disparaît pas
      // dans le relief même si la carte tamponne correctement les marches.
      for(const path of paths) for(let i=1;i<path.length;i++) {
        const q=nearestSegment(x,z,path[i-1],path[i]);
        if(q.d<1.05) height=Math.min(height,q.y-.12);
      }
      for(const p of landings) if(Math.hypot(x-p.x,z-p.z)<p.r+.15)
        height=Math.min(height,p.y-.04);
      return height;
    }
    function point(r,a) {
      const radius = coastRadius(a)*r;
      const x = CX+Math.cos(a)*radius, z = CZ+Math.sin(a)*radius;
      return [x,surfaceY(x,z,r),z];
    }
    function gardenCover(x,z) {
      let cover=0;
      for(const [cx,cz,rx,rz] of gardens)
        cover=Math.max(cover,Math.max(0,1-Math.hypot((x-cx)/(rx*1.35),(z-cz)/(rz*1.65))));
      return cover;
    }
    function paint(a,b,t) { return a.map((v,k)=>v+(b[k]-v)*t); }
    function material(p,r,up=1) {
      // Toutes ces teintes restent dans la même branche du shader existant :
      // val < .85, saturation > .25, hue > 35°, hors du seuil feuillage.
      // On évite ainsi une seconde cassure de matière à l'intérieur du dégradé.
      const band=.97+.02*Math.sin(p[1]*1.8+p[0]*.19+p[2]*.31);
      const stone=tint(color(0xcbb88a),band),sand=color(0xd6c699),turf=color(0x687d43);
      const shore=(1-smooth((p[1]-.48)/1.15))*Math.max(smooth((p[2]+12)/2),smooth((r-.86)/.10));
      const cover=smooth(gardenCover(p[0],p[2])*2.8)*smooth((up-.55)/.4);
      // Les jardins côtiers restent lisibles sur le sable, pas seulement en amont.
      return paint(paint(stone,sand,shore),turf,cover*.94);
    }
    function paintedTri(a,b,c,colors,normals) {
      const face=norm(cross(sub(b,a),sub(c,a)));
      // Lissage des sols ; transition 40–50°, normale de face au-delà de 50°.
      const sharp=smooth((Math.cos(40*PI/180)-face[1])/(Math.cos(40*PI/180)-Math.cos(50*PI/180)));
      const ns=normals.map(n=>dot(n,face)<.5?face:norm(paint(n,face,sharp)));
      const start=verts.length;tri(a,b,c,colors[0],ns);
      for(let i=0;i<3;i++)for(let k=0;k<3;k++)verts[start+i*9+6+k]=colors[i][k];
    }
    const rings = [];
    for(let j=0;j<=radialSteps;j++) {
      const r=j/radialSteps, row=[];
      for(let i=0;i<angularSteps;i++) row.push(point(r,i/angularSteps*TAU));
      rings.push(row);
    }
    // Winding vers +Y ; éventail central sans triangles dégénérés.
    const center = point(0,0);
    // Normales pondérées par l'aire du maillage réel : les différences finies
    // de l'ancien champ analytique traversaient les découpes des escaliers.
    const normals=rings.map(row=>row.map(()=>[0,0,0]));
    function addNormal(a,b,c) {
      const n=cross(sub(rings[b[0]][b[1]],rings[a[0]][a[1]]),sub(rings[c[0]][c[1]],rings[a[0]][a[1]]));
      for(const [j,i] of[a,b,c])normals[j][i]=add(normals[j][i],n);
    }
    for(let i=0;i<angularSteps;i++)addNormal([0,0],[1,(i+1)%angularSteps],[1,i]);
    for(let j=1;j<radialSteps;j++)for(let i=0;i<angularSteps;i++){
      const n=(i+1)%angularSteps;
      addNormal([j,i],[j,n],[j+1,n]);addNormal([j,i],[j+1,n],[j+1,i]);
    }
    for(const row of normals)for(let i=0;i<row.length;i++)row[i]=norm(row[i]);
    const colors=rings.map((row,j)=>row.map((p,i)=>material(p,j/radialSteps,normals[j][i][1])));
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps;
      paintedTri(center,rings[1][next],rings[1][i],
        [colors[0][0],colors[1][next],colors[1][i]],
        [normals[0][0],normals[1][next],normals[1][i]]);
    }
    for(let j=1;j<radialSteps;j++) for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[j][i], b=rings[j][next];
      const c=rings[j+1][next], d=rings[j+1][i];
      paintedTri(a,b,c,[colors[j][i],colors[j][next],colors[j+1][next]],
        [normals[j][i],normals[j][next],normals[j+1][next]]);
      paintedTri(a,c,d,[colors[j][i],colors[j+1][next],colors[j+1][i]],
        [normals[j][i],normals[j+1][next],normals[j+1][i]]);
    }
    // Socle immergé fermé, pour les vues rasantes depuis le bateau.
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[radialSteps][i], b=rings[radialSteps][next];
      quad(a,[a[0],-2.4,a[2]],[b[0],-2.4,b[2]],b,palette.rock);
      tri([CX,-2.4,CZ],[a[0],-2.4,a[2]],[b[0],-2.4,b[2]],palette.rock);
    }
    // Monolithes ancrés sur les flancs ; crique et plateau dégagés.
    for(const p of [
      [25.8,1.8,-17.7,2.1,3.0,3.4],
      [26.4,4.0,-22.2,1.8,4.1,2.5],
      [29.0,8.0,-26.2,2.1,4.0,2.1],
      [40.6,5.8,-25.5,1.5,4.6,1.8],
      [43.1,2.4,-20.5,1.3,3.4,2.0],
      [41.8,.9,-14.7,1.3,1.8,1.5],
      [28.2,.25,-11.6,1.0,.9,1.1]
    ]) {compatibleLimestone(...p);stoneLots.push(p);}
    // Éboulis périphériques : aucune pierre dans les accès ni sous les maisons.
    for(let i=0;i<45;i++) {
      const a=range(0,TAU),r=range(.73,.96),q=point(r,a),size=range(.22,.62);
      if(q[2]>-10 || landings.some(p=>Math.hypot(q[0]-p.x,q[2]-p.z)<p.r+size+.5))continue;
      if(paths.some(path=>path.slice(1).some((b,k)=>nearestSegment(q[0],q[2],path[k],b).d<1.2+size)))continue;
      compatibleLimestone(q[0],q[1]-.15,q[2],size,size*range(.8,1.8),size*.8);
      stoneLots.push([q[0],q[1],q[2],size,size*1.8,size*.8]);
    }
    for(const p of landings) {
      platforms.push(p);
      // Tailler aussi les socles, sans laisser un disque horizontal recouvrir
      // les dernières marches. La carte de hauteur utilise toujours le palier.
      const top=(r,a)=>{
        const x=p.x+r*Math.cos(a),z=p.z+r*Math.sin(a);let y=p.y;
        for(const path of paths)for(let k=1;k<path.length;k++){
          const q=nearestSegment(x,z,path[k-1],path[k]);
          if(q.d<.85)y=Math.min(y,q.y-.06);
        }
        return [x,y,z];
      };
      for(let ring=0;ring<12;ring++)for(let i=0;i<48;i++){
        const a=i/48*TAU,b=(i+1)/48*TAU,r0=p.r*ring/12,r1=p.r*(ring+1)/12;
        if(ring===0)tri(top(0,0),top(r1,b),top(r1,a),palette.rockLight);
        else quad(top(r0,a),top(r0,b),top(r1,b),top(r1,a),palette.rockLight);
        if(ring===11){const u=top(r1,a),v=top(r1,b);
          quad(u,v,[v[0],p.y-3.6,v[2]],[u[0],p.y-3.6,u[2]],palette.rock);}
      }
    }
    for(const path of paths)stairs(path,1.3,false,true);
    // Une courte liaison de plain-pied laisse la porte et le gardien accessibles.
    stairs([[34,12.5,-23],[33.2,12.5,-23.2]],1.1,false,false);
    // Constructeurs locaux : aucun changement des maisons d'Azura/Champs.
    const cosyStats=[];
    const ivory=color(0xf3e6d0),honey=color(0xc58b4e),coral=color(0xd9736f);
    const tileCosy=color(0xe8925c),sage=color(0x5e9c8f);
    // Surface de révolution à normales analytiques, sans faces aux pôles doublées.
    function softLathe(pos,profile,col,n=12,scale=[1,1,1]) {
      const P=(j,i)=>add(pos,[Math.cos(i/n*TAU)*profile[j][1]*scale[0],profile[j][0]*scale[1],Math.sin(i/n*TAU)*profile[j][1]*scale[2]]);
      const N=(j,i)=>{
        const a=profile[Math.max(0,j-1)],b=profile[Math.min(profile.length-1,j+1)];
        return norm([Math.cos(i/n*TAU)*(b[0]-a[0])/scale[0],-(b[1]-a[1])/scale[1],Math.sin(i/n*TAU)*(b[0]-a[0])/scale[2]]);
      };
      for(let j=0;j<profile.length-1;j++)for(let i=0;i<n;i++){
        if(profile[j][1]>0)tri(P(j,i),P(j+1,i+1),P(j,i+1),col,[N(j,i),N(j+1,i+1),N(j,i+1)]);
        if(profile[j+1][1]>0)tri(P(j,i),P(j+1,i),P(j+1,i+1),col,[N(j,i),N(j+1,i),N(j+1,i+1)]);
      }
    }
    function cosyBall(pos,size,col,n=8) {
      softLathe(pos,n<=6?[[-1,0],[0,1],[.65,.75],[.82,0]]:[[-1,0],[-.65,.76],[0,1],[.64,.78],[.82,.42],[.82,0]],col,n,size);
    }
    // Rectangle arrondi extrudé : trois points par coin, bourrelet haut et bas.
    function cushion(P,w,d,h,col,small=false) {
      const outline=[]; const steps=small?2:3; const r=Math.min(.18,w*.25,d*.25);
      for(let k=0;k<4;k++)for(let j=0;j<steps;j++){
        const a=k*Math.PI/2+j*Math.PI/(2*(steps-1));
        outline.push([(w/2-r)*Math.sign(Math.cos(k*Math.PI/2+Math.PI/4))+r*Math.cos(a),
          (d/2-r)*Math.sign(Math.sin(k*Math.PI/2+Math.PI/4))+r*Math.sin(a)]);
      }
      const bevel=Math.min(.10,h*.25);
      const rows=small?[[0,.9],[h,.9]]:[[0,.94],[bevel,1],[h-bevel,1],[h,.94]];
      for(let j=0;j<rows.length-1;j++)for(let i=0;i<outline.length;i++){
        const pt=(q,k)=>P([outline[k%outline.length][0]*rows[q][1],rows[q][0],outline[k%outline.length][1]*rows[q][1]]);
        quad(pt(j,i),pt(j+1,i),pt(j+1,i+1),pt(j,i+1),col);
      }
      for(let i=0;i<outline.length;i++)tri(P([0,h,0]),P([outline[(i+1)%outline.length][0]*.94,h,outline[(i+1)%outline.length][1]*.94]),P([outline[i][0]*.94,h,outline[i][1]*.94]),col);
    }
    // Porte/cadre : retour d'embrasure de 25 cm et contour arrondi épais.
    function cosyOpening(P,w,h,col,door=false) {
      const shape=[[-w/2,0],[w/2,0],[w/2,h-w/2]];
      for(let i=1;i<=6;i++){const a=i*Math.PI/6;shape.push([Math.cos(a)*w/2,h-w/2+Math.sin(a)*w/2]);}
      const back=shape.map(([x,y])=>P([x,y,0]));
      const rim=shape.map(([x,y])=>P([x*1.18,(y-h/2)*1.07+h/2,.25]));
      for(let i=0;i<shape.length;i++){
        const j=(i+1)%shape.length;
        tri(P([0,h/2,.008]),back[i],back[j],col);
        quad(back[i],rim[i],rim[j],back[j],ivory);
      }
      if(door)cosyBall(P([w*.3,h*.43,.09]),[.07,.07,.07],honey,6);
      else{
        cylinder(P([-w*.4,h*.45,.03]),P([w*.4,h*.45,.03]),.035,.035,ivory,5);
        cylinder(P([0,.08,.03]),P([0,h-.07,.03]),.035,.035,ivory,5);
      }
    }
    function cosyHouse(x,y,z,w,d,h,rot,variant) {
      const first=verts.length,count=triangles,chimneyStart=chimneys.length;
      // Garder l'aléa et les enregistrements exacts du constructeur existant.
      house(x,y,z,w,d,h,rot,false,false);verts.length=first;triangles=count;
      h=Math.min(h,w-.30);
      const P=q=>transform(q,[x,y,z],rot),shutter=[sage,color(0x7c8fc7),coral][variant];
      cushion(P,w-.30,d-.30,h,[ivory,color(0xf6dcc4),color(0xe9eedc)][variant]);
      // Toiture bombée : écailles arrondies partagées, débord 41 cm depuis le crépi (emprise historique conservée).
      const half=w/2+.26,depth=d/2+.26,rise=half*.64;
      const roofP=(side,t,z)=>P([side*t*half,h+rise*(1-t)+.10*Math.sin(Math.PI*t)+.06*Math.cos(z/depth*Math.PI/2),z]);
      for(const side of[-1,1]){
        for(let row=0;row<2;row++)for(let col=0;col<4;col++){
          const t=row/2,u=(row+1)/2,za=-depth+col*depth/2,zb=za+depth/2;
          const a=roofP(side,t,za),b=roofP(side,t,zb),c=roofP(side,u,zb),e=roofP(side,u,za);
          const m=add(roofP(side,(t+u)/2,(za+zb)/2),[0,.055,0]);
          const colour=(row+col)%3===0?color(0xd97b57):tileCosy;
          const edge=[a,b,roofP(side,u-.06,zb),roofP(side,u,zb-.075),roofP(side,u,za+.075),roofP(side,u-.06,za)];
          for(let k=0;k<edge.length;k++)tri(edge[k],m,edge[(k+1)%edge.length],colour);
        }
        quad(roofP(side,0,-depth),roofP(side,0,depth),roofP(side,1,depth),roofP(side,1,-depth),tileCosy);
        for(const zz of[-depth,depth]){
          const a=roofP(side,0,zz),b=roofP(side,1,zz);
          cylinder(a,b,.095,.095,tileCosy,6);
          tri(P([0,h,zz]),b,a,ivory);
        }
        cylinder(roofP(side,1,-depth),roofP(side,1,depth),.10,.10,tileCosy,6);
      }
      cylinder(P([0,h+rise,-depth]),P([0,h+rise,depth]),.13,.13,tileCosy,7);
      cosyOpening(q=>P([q[0]-.30,q[1],d/2-.145+q[2]]),1.2,2.1,shutter,true);
      // Grande fenêtre de côté ; cadres et volets épais, jardinière intégrée.
      for(const side of[-1,1]){
        const W=q=>P([side*(w/2-.142+q[2]),.8+q[1],q[0]]);
        cosyOpening(W,.65,.87,color(0x91bec5));
        for(const k of[-1,1])cushion(q=>W([q[0]+k*.48,q[1]+.08,q[2]+.03]),.20,.10,.68,shutter,true);
        cushion(q=>W([q[0],q[1]-.14,q[2]+.07]),.75,.18,.16,honey,true);
        for(const k of[-1,0,1])cosyBall(W([k*.21,.06,.09]),[.11,.11,.10],k===0?coral:color(0x8fbf6b),4);
      }
      // Nichoir au dos, dans l'emprise du mur ; pas de nouvel obstacle.
      cosyBall(P([0,1.45,-d/2+.12]),[.22,.29,.14],honey,6);
      cosyBall(P([0,1.47,-d/2+.00]),[.07,.08,.015],shutter,5);
      for(const c of chimneys.slice(chimneyStart)){
        softLathe(add(c,[0,-1.05,0]),[[0,.18],[.08,.23],[.90,.22],[.98,.28],[1.05,.24],[1.10,0]],ivory,6);
      }
      cosyStats.push({type:'maison',x,z,triangles:triangles-count});
    }
    cosyHouse(40,3.6,-12.8,2.5,2.1,2.25,-.05,0);
    cosyHouse(29.7,7,-16,2.4,2.1,2.15,.03,1);
    cosyHouse(39.8,10.3,-20.5,2.6,2.2,2.25,.03,2);

    // Phare bonbonnière : mêmes base, galerie et foyer dynamique mode 7.
    const lx=34,lz=-25.3,base=12.5,top=18.7;
    terraces.push({x:lx,y:base,z:lz,w:2.1,d:2.1,rot:0,round:true});
    houseLots.push([lx,lz,1.65]);
    const towerProfile=[[0,1.05],[.18,1.05],[1.2,1.02],[2.2,.98],[3.3,.94],[4.4,.86],[5.4,.80],[6.2,.80]];
    for(let j=0;j<towerProfile.length-1;j++)softLathe([lx,base,lz],towerProfile.slice(j,j+2),j===2||j===4?coral:ivory,28);
    cosyOpening(p=>[lx+p[0],base+p[1],lz+1.03+p[2]],1.2,2.1,sage,true);
    for(const y of[base+2.6,base+4.8])cosyOpening(p=>[lx+p[0],y+p[1],lz+.90+p[2]],.46,.78,color(0x91bec5));
    softLathe([lx,top,lz],[[-.24,1.35],[-.14,1.6],[0,1.6],[.07,1.44]],ivory,28);
    for(let i=0;i<16;i++){
      const a=i/16*TAU;
      softLathe([lx+Math.cos(a)*1.46,top,lz+Math.sin(a)*1.46],[[0,.085],[.14,.07],[.38,.11],[.64,.065],[.78,.085]],ivory,6);
    }
    // Anneau ouvert : ne pas fermer la galerie par un disque.
    softLathe([lx,top,lz],[[.72,1.46],[.76,1.53],[.84,1.46]],coral,32);
    for(let i=0;i<8;i++){
      const a=i/8*TAU;
      cylinder([lx+Math.cos(a)*.76,top,lz+Math.sin(a)*.76],[lx+Math.cos(a)*.76,top+1.55,lz+Math.sin(a)*.76],.07,.07,honey,8);
    }
    softLathe([lx,19.45,lz],[[-.37,.20],[-.28,.32],[.26,.32],[.37,.20]],color(0xf3c775),16);
    softLathe([lx,20.25,lz],[[0,.90],[.12,1.10],[.28,1.05],[.52,.76],[.78,.32],[.85,0]],coral,24);
    cosyBall([lx,21.35,lz],[.16,.30,.16],honey,8);

    // ---------- Passe 1 : paysage habité, sans déplacer le parcours ----------
    // L'aléa des maisons, marches et rochers précédents est déjà consommé.
    // Ce sous-flux ne peut donc changer ni leurs variantes ni les autres îles.
    seed = 341810;
    const leafBase=color(0x6fa35a),leafSun=color(0x8fbf6b),leafShade=color(0x4f7f45);
    const bark=color(0xc58b4e),rope=color(0xbba780);
    const protectedDiscs=reservedDiscs;
    const access=[...paths,[[35.8,.56,-6.2],climb[0]],
      [[34,12.5,-23],[33.2,12.5,-23.2]]];
    const decorBounds=[];
    function freeDisk(x,z,r) {
      if(x-r<20 || x+r>48 || z-r< -32 || z+r> -4)return false;
      if(protectedDiscs.some(p=>Math.hypot(x-p[0],z-p[1])<r+p[2]))return false;
      if(landings.some(p=>Math.hypot(x-p.x,z-p.z)<r+p.r+.15))return false;
      // 0,40 m de passage latéral + 0,13 m pour le débattement du vent.
      return !access.some(path=>path.slice(1).some((b,i)=>
        nearestSegment(x,z,path[i],b).d<r+.65+.4+.13));
    }
    function terrainAt(x,z) {
      const a=Math.atan2(z-CZ,x-CX),r=Math.hypot(x-CX,z-CZ)/coastRadius(a);
      return r<.99?surfaceY(x,z,r):-2.4;
    }
    function rooted(x,z,r=.18) {
      const y=terrainAt(x,z);
      if(y<.35 || !freeDisk(x,z,r))return null;
      if(stoneLots.some(p=>p[1]+p[4]*1.08>y+.06 &&
        Math.hypot((x-p[0])/(p[3]+r),(z-p[2])/(p[5]+r))<1.12))return null;
      for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r]])
        if(Math.abs(terrainAt(x+dx,z+dz)-y)>.16)return null;
      return y;
    }
    // Contrôle conservateur de l'objet ENTIER (canopée, rameaux, anses…).
    // Le disque englobant protège aussi les arêtes entre les sommets.
    function dress(label,fn) {
      const first=verts.length,nt=triangles;fn();
      if(first===verts.length)return false;
      const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
      for(let i=first;i<verts.length;i+=9)for(let k=0;k<3;k++){
        lo[k]=Math.min(lo[k],verts[i+k]);hi[k]=Math.max(hi[k],verts[i+k]);
      }
      const x=(lo[0]+hi[0])/2,z=(lo[2]+hi[2])/2;
      if(!freeDisk(x,z,Math.hypot(hi[0]-lo[0],hi[2]-lo[2])/2)){
        verts.length=first;triangles=nt;return false;
      }
      decorBounds.push({label,lo,hi,first,end:verts.length});return true;
    }
    // Petit calcaire à pans coupés : strates lisibles, pas de sphère ni de
    // rotation arbitraire. Les familles côtières suivent le même pendage.
    function limestoneStone(x,y,z,sx,sy,sz,heading=0,variant=0) {
      const outline=[[1,.45],[.48,1],[-.5,1],[-1,.42],[-1,-.48],[-.42,-1],[.5,-1],[1,-.4]]
        .map(p=>mul(p,.96/Math.hypot(...p)));
      const levels=[[-.4,.82],[.10,1],[.75,.84],[.94,.55]];
      const rows=levels.map(([h,r],j)=>outline.map(([a,b],i)=>
        transform([a*sx*r,sy*(h+(j>1?.05*Math.sin(i*1.7+variant):0)),b*sz*r],
          [x,y,z],heading)));
      for(let j=0;j<3;j++)for(let i=0;i<8;i++){
        const n=(i+1)%8;
        quad(rows[j][i],rows[j+1][i],rows[j+1][n],rows[j][n],
          tint(chalk,.87+j*.055+.025*Math.sin(i+variant)));
      }
      for(let i=0;i<8;i++){
        tri([x,y+sy*.94,z],rows[3][(i+1)%8],rows[3][i],tint(chalk,1.03));
        tri([x,y-sy*.4,z],rows[0][i],rows[0][(i+1)%8],tint(chalk,.8));
      }
    }
    function compatibleLimestone(x,y,z,sx,sy,sz) {
      // Consommer l'aléa exact de l'ancien rocher garde les maisons/cheminées
      // et les variantes des marches identiques. Géométrie provisoire supprimée
      // immédiatement, à la construction seulement ; rien de doublé sur le GPU.
      const first=verts.length,count=triangles;
      rock(x,y,z,sx,sy,sz);verts.length=first;triangles=count;
      // Emprise inscrite dans l'ancienne ellipse, sans rotation du grand axe.
      limestoneStone(x,y-.42*sy,z,sx,sy*1.4,sz,0,x*.7+z*.3);
    }
    function leaves(p,s,c) { ellipsoid(p,s,c,9,5,.10); }
    function coastalTree(x,y,z,h,r,olive=false) {
      const count=triangles;
      cylinder([x,y-.07,z],[x+.10,y+h*.52,z],.22,.15,bark,7);
      cosyBall([x,y+h*.52,z],[r*.91,h*.20,r*.80],leafShade,8);
      cosyBall([x+(olive?-.15:.15),y+h*.72,z-.06],[r*.81,h*.23,r*.74],leafBase,8);
      cosyBall([x-.08,y+h*.91,z],[r*.57,h*.16,r*.56],leafSun,8);
      cosyStats.push({type:'arbre',triangles:triangles-count});
    }
    function cypress(x,y,z,h) {
      const count=triangles;
      cylinder([x,y-.05,z],[x,y+h*.4,z],.15,.11,bark,6);
      cosyBall([x,y+h*.38,z],[.39,h*.29,.34],leafShade,8);
      cosyBall([x+.04,y+h*.68,z],[.31,h*.32,.28],leafBase,8);
      cosyStats.push({type:'cypres',triangles:triangles-count});
    }
    function herb(x,y,z,s,flower=false) {
      // Trois feuilles pliées par touffe ; les tiges restent courtes et fines.
      for(let j=0;j<3;j++){
        const a=j*2.4+.3,dx=Math.cos(a),dz=Math.sin(a),h=s*(.72+j*.12);
        const foot=[x+dx*s*.1,y-.025,z+dz*s*.1];
        const mid=[x+dx*s*.32,y+h*.55,z+dz*s*.32],tip=[x+dx*s*.48,y+h,z+dz*s*.48];
        const side=[-dz*s*.12,0,dx*s*.12];
        const col=j%2?leafSun:leafBase;
        // Le rendu statique est déjà double face (CULL_FACE désactivé).
        tri(foot,add(mid,side),tip,col);tri(foot,tip,sub(mid,side),col);
        if(flower){
          const hue=j%2?color(0xe5cd8e):color(0xc2afcb);
          for(let k=0;k<3;k++){
            const b=k/3*TAU,dx2=Math.cos(b)*s*.16,dz2=Math.sin(b)*s*.16;
            const A=add(tip,[dx2,.035,dz2]),B=add(tip,[-dz2,0,dx2]),D=add(tip,[dz2,0,-dx2]);
            tri(A,B,D,hue);
          }
        }
      }
    }
    function rosemary(x,y,z,s) {
      for(let j=0;j<3;j++){
        const a=j/3*TAU;
        leaves([x+Math.cos(a)*s*.25,y+s*.28,z+Math.sin(a)*s*.25],
          [s*.52,s*.38,s*.47],j===1?leafSun:leafBase);
      }
    }
    // Avant-plan bas à l'entrée de la crique ; le chenal reste ouvert.
    for(const [x,z,sx,sy,sz] of [[31.4,-8.6,.8,.6,.48],[41,-9.9,.45,.35,.4],
      [29.8,-9.6,.72,.8,.48],[42.1,-12.1,.5,.65,.55],
      [37.7,-28.4,.8,.48,.6],[31.1,-28.4,.7,.4,.42]]){
      const y=terrainAt(x,z);
      const cy=Math.max(-.1,y-.12);
      if(dress('calcaire',()=>limestoneStone(x,cy,z,sx,sy,sz,.22)))
        stoneLots.push([x,cy,z,Math.max(sx,sz)*1.2,sy,Math.max(sx,sz)*1.2]);
    }
    // Couronnes en bord de composition, jamais au-dessus de la montée.
    for(const [x,z,h,r,olive] of [[31,-10.25,3.4,1.05,false],
      [42.2,-16.7,2.9,.82,false],[27.8,-21.2,2.25,.8,true],
      [37.9,-24.4,1.9,.72,true]]){
      const y=rooted(x,z,.2);
      if(y!==null)dress('arbre',()=>coastalTree(x,y,z,h,r,olive));
    }
    for(const [x,z,h] of [[40.1,-23.4,2.5],[30.9,-24.3,2.1]]){
      const y=rooted(x,z,.18);
      if(y!==null)dress('cypres',()=>cypress(x,y,z,h));
    }
    // Densité graduée : herbes/fleurs aux marges, arbustes au cœur des poches.
    // Les plantes hautes s'arrêtent avant le belvédère.
    for(let g=0;g<gardens.length;g++){
      const [x,z,rx,rz]=gardens[g],count=g>4?14:22;
      for(let j=0;j<count;j++){
        const a=j*2.39996+g,r=Math.sqrt((j+.5)/count)*.88;
        const px=x+Math.cos(a)*r*rx,pz=z+Math.sin(a)*r*rz;
        const s=range(.12,g>4?.22:.31),y=rooted(px,pz,s*.65);
        if(y===null)continue;
        dress('herbe',()=>herb(px,y,pz,s,j%5===0));
      }
      for(const [dx,dz,s] of [[-.3,.1,.42],[.35,-.2,.34]]){
        const px=x+dx,pz=z+dz,y=rooted(px,pz,s);
        if(y!==null)dress('romarin',()=>rosemary(px,y-.02,pz,s));
      }
    }

    // Métiers et repos : objets modestes, placés sur le sol et hors des accès.
    function crate(x,y,z,rot=0) {
      const P=p=>transform(p,[x,y,z],rot);
      box(P([0,.035,0]),[.56,.07,.42],bark,rot);
      for(const side of[-1,1])for(let j=0;j<3;j++){
        box(P([0,.105+j*.09,side*.2]),[.56,.066,.028],palette.trim,rot);
        box(P([side*.265,.105+j*.09,0]),[.028,.066,.40],palette.trim,rot);
      }
      for(const a of[-1,1])for(const b of[-1,1])box(P([a*.25,.18,b*.18]),[.042,.34,.042],bark,rot);
    }
    function coil(x,y,z,r) {
      for(let ring=0;ring<3;ring++)for(let i=0;i<12;i++){
        const a=i/12*TAU,b=(i+1)/12*TAU,rr=r-ring*.028;
        cylinder([x+Math.cos(a)*rr,y,z+Math.sin(a)*rr],
          [x+Math.cos(b)*rr,y,z+Math.sin(b)*rr],.011,.011,rope,4);
      }
    }
    const harbour=[33,-9.55],harbourY=rooted(...harbour,.38);
    if(harbourY!==null)dress('peche',()=>{
      const [x,z]=harbour,y=harbourY;
      crate(x,y,z,.12);coil(x+.04,y+.08,z,.14);
      barrel(x-.55,y,z-.10,.19);
      cylinder([x-.6,y+.1,z+.27],[x+.6,y+.45,z+.3],.023,.019,bark,6);
      // Petits flotteurs terre cuite sur une ligne de cordage.
      for(let i=0;i<4;i++){
        const px=x-.46+i*.29,py=y+.14+i*.085;
        ellipsoid([px,py,z+.29],[.045,.064,.045],i%2?chalk:palette.tile,6,4,0);
      }
    });
    // Banc du gardien : tourné vers le sud-ouest et le panorama d'Azura.
    const seat=[31.15,-26.2],seatY=rooted(...seat,.35);
    if(seatY!==null)dress('banc',()=>{
      const P=p=>transform(p,[seat[0],seatY,seat[1]],-.65);
      for(const side of[-1,1]){
        box(P([side*.44,.2,0]),[.16,.40,.38],chalk,-.65);
        cylinder(P([side*.47,.36,-.16]),P([side*.47,.85,-.23]),.03,.03,bark,6);
      }
      for(let j=0;j<3;j++)box(P([0,.43,-.13+j*.13]),[1.17,.065,.115],palette.trim,-.65);
      for(let j=0;j<2;j++)box(P([0,.65+j*.15,-.21-j*.02]),[1.14,.11,.05],palette.trim,-.65);
    });

    // ---------- Passe 2 : fronts stratifiés et lisières composées ----------
    // La crête n'est pas découpée dans la carte de hauteur : ce sont des
    // formations fermées, ancrées dans le relief, loin des accès existants.
    seed=341811;
    const cliffFamilies=[
      [25.5,-16.1,1.05,2.6,1.2], [25.8,-20.2,1.15,3.0,1.2],
      [27.1,-24.1,1.05,2.7,1.1], [29.2,-26.8,1.0,2.3,1.1],
      [32.1,-28.1,1.25,2.0,.7], [35.8,-28.0,1.0,2.3,.8],
      [39.8,-25.1,1.05,2.8,1.0], [43.0,-18.2,.8,2.8,1.05],
      [42.1,-14.1,.7,1.8,.8], [29.9,-12.8,.65,1.45,.55]
    ];
    for(let i=0;i<cliffFamilies.length;i++){
      const [x,z,sx,h,sz]=cliffFamilies[i],y=terrainAt(x,z);
      if(y<.3)continue;
      const cy=y-h*.58;
      if(dress('strate',()=>{
        limestoneStone(x,cy,z,sx,h,sz,.12,i);
        // Corniche décalée et talon : même pendage, ruptures de largeur.
        limestoneStone(x-.10,y-.27,z+.08,sx*1.14,.28,sz*1.12,.12,i+1);
        limestoneStone(x+.12,cy-.20,z-.10,sx*.85,.8,sz*.9,.12,i+2);
        rosemary(x,y+h*.36-.04,z,.48);
      }))stoneLots.push([x,cy,z,sx*1.2,h,sz*1.2]);
    }
    // Groupes bas dans les creux, pins élancés à l'ouest ; aucune plantation
    // centrale devant la lanterne ou sur la couronne de circulation du phare.
    const groves=[
      [27.4,-10.15,3.8,1.02,false], [26.5,-12.9,3.5,1.0,false],
      [26.4,-17.6,3.8,1.08,false], [26.9,-20.9,3.4,.95,false],
      [29.8,-21.1,3.2,.9,false], [31,-21.1,2.6,.75,true],
      [28.3,-23.6,3.0,1.0,false], [30.1,-23.6,2.25,.7,true],
      [38.6,-16.25,3.4,.85,false], [40.1,-16.25,3.0,.78,true],
      [37.3,-25.85,2.2,.7,true]
    ];
    for(const [x,z,h,r,olive] of groves){
      const y=rooted(x,z,.2);
      if(y!==null)dress('arbre',()=>coastalTree(x,y,z,h,r,olive));
    }
    // Lisière décentrée : plusieurs tailles et hauteurs par poche, clairières
    // préservées aux passages. Le sommet garde des arbustes plus bas.
    for(let g=0;g<gardens.length;g++){
      const [x,z,rx,rz]=gardens[g];
      for(let j=0;j<7;j++){
        const a=j*2.399+g*.8,r=.3+(j%3)*.22;
        const px=x+Math.cos(a)*rx*r,pz=z+Math.sin(a)*rz*r;
        const s=range(.28,z< -23?.48:.62),y=rooted(px,pz,s*.55);
        if(y!==null)dress('maquis',()=>rosemary(px,y-.04,pz,s));
      }
    }

    // Dallage du belvédère : petits polygones irréguliers à 8 mm du sol.
    // Pas de disque vert/gris rapporté, ni de dalle sur les dernières marches.
    const pavingRecords=[];
    const summitPads=landings.slice(3,5);
    for(let row=0;row<17;row++)for(let col=0;col<13;col++){
      const z=-27.05+row*.32,x=31.95+col*.33+(row%2)*.165;
      const jitter=.024*Math.sin(row*9+col*13),px=x+jitter,pz=z-jitter*.6;
      if(!summitPads.some(p=>Math.hypot(px-p.x,pz-p.z)<p.r-.27))continue;
      if(Math.hypot(px-lx,pz-lz)<1.31)continue;
      if(access.some(path=>path.slice(1).some((b,k)=>nearestSegment(px,pz,path[k],b).d<.95)))continue;
      const poly=[[-.135,-.115],[.065,-.14],[.15,-.065],[.14,.11],[-.055,.14],[-.145,.045]];
      const points=poly.map(([dx,dz])=>[px+dx,12.508,pz+dz]);
      const colr=tint(color(0xc9bca0),.92+.07*(.5+.5*Math.sin(row*2.7+col*4.3)));
      const first=verts.length;
      for(let k=0;k<6;k++)tri([px,12.508,pz],points[(k+1)%6],points[k],colr);
      pavingRecords.push({first,end:verts.length});
    }
    // Vestiges de murets, ouverts côté mer. Aucune nouvelle emprise de maison.
    for(const [x,z,heading] of [[31.1,-25.3,.2],[36.7,-26.1,-.25]]){
      const y=rooted(x,z,.25);
      if(y===null)continue;
      dress('muret',()=>{
        for(let j=0;j<3;j++){
          const p=transform([(j-1)*.29,0,0],[x,y,z],heading);
          limestoneStone(p[0],y+.02,p[2],.18,.30,.19,heading,j);
          if(j!==1)limestoneStone(p[0]-.025,y+.26,p[2],.16,.25,.17,heading,j+1);
        }
      });
    }

    // ---------- Passe 3 : l'arrivée et la maison des pêcheurs ----------
    seed=341812;
    for(const [x,z,sx,h,sz] of [[29.2,-10.6,.6,1.25,.42],
      [30.3,-11.25,.55,1.45,.45],[41.1,-9.55,.34,1.1,.32]]){
      const y=terrainAt(x,z);
      if(y<.3)continue;
      dress('strate-sud',()=>{
        limestoneStone(x,y-.14,z,sx,h,sz,.10,x);
        limestoneStone(x-.06,y+h*.52,z+.06,sx*1.06,.22,sz*1.05,.10,z);
      });
    }
    // Console sous le premier palier. Contrôle vertical en plus de l'emprise :
    // le haut de chaque bloc reste au moins 28 cm sous les accès voisins.
    const underBounds=[];
    function belowLanding(fn) {
      const start=verts.length,count=triangles;fn();
      const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
      for(let i=start;i<verts.length;i+=9)for(let k=0;k<3;k++){
        lo[k]=Math.min(lo[k],verts[i+k]);hi[k]=Math.max(hi[k],verts[i+k]);
      }
      let valid=true;
      for(const path of access)for(let k=1;k<path.length;k++){
        const a=path[k-1],b=path[k],steps=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/.08);
        for(let j=0;j<=steps;j++){
          const p=add(a,mul(sub(b,a),j/steps));
          if(p[0]>=lo[0]-1.05&&p[0]<=hi[0]+1.05&&p[2]>=lo[2]-1.05&&p[2]<=hi[2]+1.05&&hi[1]>p[1]-.28)valid=false;
        }
      }
      if(!valid){verts.length=start;triangles=count;return;}
      underBounds.push({lo,hi,first:start,end:verts.length});
    }
    belowLanding(()=>{
      limestoneStone(39,1.15,-11.65,.38,2.1,.34,.10,3);
      limestoneStone(39.01,2.94,-11.65,.45,.20,.40,.10,4);
    });

    // Barque tirée au sec : coque ouverte, bancs, aviron et filet sur le plat-bord.
    // Pas de deuxième bateau interactif et aucun changement du voilier de Tomas.
    const boatX=39,boatZ=-8.45,boatY=terrainAt(boatX,boatZ),boatHeading=.72;
    if(boatY>.35)dress('barque',()=>{
      const P=p=>transform(p,[boatX,boatY,boatZ],boatHeading);
      const hull=color(0x62748a),inside=color(0xa48158),N=16;
      const edge=(i,t)=>{
        const a=i/N*TAU;
        return P([Math.sin(a)*(.13+.35*t),-.015+t*(.40+.08*Math.abs(Math.cos(a))),Math.cos(a)*(.68+.32*t)]);
      };
      for(let i=0;i<N;i++){
        for(let row=0;row<3;row++)quad(edge(i,row/3),edge(i+1,row/3),edge(i+1,(row+1)/3),edge(i,(row+1)/3),row===2?chalk:hull);
        tri(P([0,.045,0]),edge(i+1,0),edge(i,0),inside);
        cylinder(edge(i,1),edge(i+1,1),.024,.024,bark,5);
      }
      for(const z of[-.36,.36])box(P([0,.28,z]),[.7,.06,.16],inside,boatHeading);
      cylinder(P([-.26,.36,-.7]),P([.24,.39,.75]),.019,.024,bark,6);
      box(P([.23,.39,.71]),[.10,.034,.27],inside,boatHeading-.28);
      // Filet ajouré : mailles ouvertes, pas de panneau opaque.
      const net=(u,v)=>P([-.28+u*.43,.43-v*.22-.06*Math.sin(u*PI),-.72+v*.55]);
      for(let i=0;i<=5;i++)for(let j=0;j<5;j++){
        cylinder(net(i/5,j/5),net(i/5,(j+1)/5),.004,.004,rope,4);
        cylinder(net(j/5,i/5),net((j+1)/5,i/5),.004,.004,rope,4);
      }
    });
    const trapX=38,trapZ=-8.25,trapY=rooted(trapX,trapZ,.28);
    if(trapY!==null)dress('casier-bouee',()=>{
      crate(trapX,trapY,trapZ,.12);
      // Arceaux et mailles du casier au-dessus de sa caisse.
      for(let j=0;j<4;j++){
        const z=trapZ-.15+j*.1;
        for(let i=0;i<6;i++){
          const a=i/6*PI,b=(i+1)/6*PI;
          cylinder([trapX+Math.cos(a)*.22,trapY+.34+Math.sin(a)*.18,z],
            [trapX+Math.cos(b)*.22,trapY+.34+Math.sin(b)*.18,z],.009,.009,bark,4);
        }
      }
      for(let i=0;i<7;i++){
        const a=i/6*PI;
        cylinder([trapX+Math.cos(a)*.22,trapY+.34+Math.sin(a)*.18,trapZ-.15],
          [trapX+Math.cos(a)*.22,trapY+.34+Math.sin(a)*.18,trapZ+.15],.006,.006,rope,4);
      }
      // Bouée annulaire crème/terre cuite, posée contre le casier.
      const center=[trapX-.35,trapY+.23,trapZ+.10];
      const ring=(a,b)=>add(center,[Math.cos(a)*(.16+.035*Math.cos(b)),Math.sin(a)*(.16+.035*Math.cos(b)),.035*Math.sin(b)]);
      for(let i=0;i<16;i++)for(let j=0;j<6;j++){
        const a=i/16*TAU,b=(i+1)/16*TAU,u=j/6*TAU,v=(j+1)/6*TAU;
        quad(ring(a,u),ring(b,u),ring(b,v),ring(a,v),Math.floor(i/4)%2?palette.tile:chalk);
      }
    });

    // Les jardinières et volets sont désormais intégrés à cosyHouse.
  } finally {
    seed = pharePreviousSeed;
  }
}

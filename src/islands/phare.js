// islands/phare.js — Île du Phare · Astra · passe végétation / vie insulaire
// Base publique : b08a421. Coordonnées en mètres, Y vertical, mer Y=0.
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
    // Bosquets composés : dense près du village, bas et espacés au sommet.
    // Chaque ellipse est une poche de plantation, jamais un semis sur toute l'île.
    const gardens = [
      [28.9,-13.25,2.1,.72], [40.65,-9.8,1.1,.58],
      [42.1,-16.9,.7,.9], [27.8,-21.1,1.55,.7],
      [30.2,-23.7,.7,.48], [38.5,-24.2,.7,.95],
      [32.3,-26.9,1.6,.40], [26.7,-13.45,.7,.45]
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
        cover=Math.max(cover,Math.max(0,1-Math.hypot((x-cx)/rx,(z-cz)/rz)));
      return cover;
    }
    function paint(a,b,t) { return a.map((v,k)=>v+(b[k]-v)*t); }
    function material(p,r,up=1) {
      const north = smooth((-p[2]-10)/13);
      if(p[1]<.9 && (p[2]>-11 || r>.91)) return tint(palette.sand,.98);
      const band = .95+.035*Math.sin(p[1]*2.6)+.018*Math.sin(p[0]*1.3+p[2]*.6);
      const limestone=paint(palette.rock,palette.rockLight,.35+north*.65);
      if(up<.88 || r>.93)return tint(limestone,band);
      // Couleur seulement : aucune surépaisseur et aucune nouvelle marche.
      const cover=gardenCover(p[0],p[2]);
      const edge=.78+.22*Math.sin(p[0]*3.1+Math.sin(p[2]*2.2));
      const turf=color(0x989f65); // g < r*1.25 : sol fixe, jamais traité en feuille.
      return paint(tint(limestone,band),turf,smooth(cover*2.5)*edge*.85);
    }
    const rings = [];
    for(let j=0;j<=radialSteps;j++) {
      const r=j/radialSteps, row=[];
      for(let i=0;i<angularSteps;i++) row.push(point(r,i/angularSteps*TAU));
      rings.push(row);
    }
    // Winding vers +Y ; éventail central sans triangles dégénérés.
    const center = point(0,0);
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps;
      tri(center,rings[1][next],rings[1][i],material(center,0));
    }
    for(let j=1;j<radialSteps;j++) for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[j][i], b=rings[j][next];
      const c=rings[j+1][next], d=rings[j+1][i];
      const middle=[(a[0]+c[0])*.5,(a[1]+c[1])*.5,(a[2]+c[2])*.5];
      quad(a,b,c,d,material(middle,(j+.5)/radialSteps,norm(cross(sub(b,a),sub(c,a)))[1]));
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
    ]) {rock(...p);stoneLots.push(p);}
    // Éboulis périphériques : aucune pierre dans les accès ni sous les maisons.
    for(let i=0;i<45;i++) {
      const a=range(0,TAU),r=range(.73,.96),q=point(r,a),size=range(.22,.62);
      if(q[2]>-10 || landings.some(p=>Math.hypot(q[0]-p.x,q[2]-p.z)<p.r+size+.5))continue;
      if(paths.some(path=>path.slice(1).some((b,k)=>nearestSegment(q[0],q[2],path[k],b).d<1.2+size)))continue;
      rock(q[0],q[1]-.15,q[2],size,size*range(.8,1.8),size*.8);
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
    house(40,3.6,-12.8,2.5,2.1,2.25,-.05,false,false);
    house(29.7,7,-16,2.4,2.1,2.15,.03,false,false);
    house(39.8,10.3,-20.5,2.6,2.2,2.25,.03,false,false);

    // Phare effilé : emprise déclarée, galerie ouverte, cage à huit montants.
    const lx=34,lz=-25.3,base=12.5,top=18.7;
    terraces.push({x:lx,y:base,z:lz,w:2.1,d:2.1,rot:0,round:true});
    houseLots.push([lx,lz,1.65]);
    cylinder([lx,base,lz],[lx,top,lz],1.05,.80,palette.cream,28);
    for(const y of[base+.12,base+2.05,base+4.2,top-.2])
      cylinder([lx,y,lz],[lx,y+.15,lz],y>18?.9:1.025,y>18?.9:1.025,palette.rockLight,28);
    archDoor([lx,base,lz+1.065],.66,1.5,0);
    for(const y of[base+2.6,base+4.8])windowAt([lx,y,lz+.94],.34,.68,0,false);
    cylinder([lx,top-.15,lz],[lx,top,lz],1.6,1.6,palette.rockLight,32);
    for(let i=0;i<24;i++) {
      const a=i/24*TAU,b=(i+1)/24*TAU;
      const p=[lx+Math.cos(a)*1.48,top,lz+Math.sin(a)*1.48];
      beam(p,add(p,[0,.8,0]),.027,palette.dark);
      beam(add(p,[0,.8,0]),[lx+Math.cos(b)*1.48,top+.8,lz+Math.sin(b)*1.48],.024,palette.dark);
    }
    for(let i=0;i<8;i++) {
      const a=i/8*TAU;
      beam([lx+Math.cos(a)*.76,top,lz+Math.sin(a)*.76],
        [lx+Math.cos(a)*.76,top+1.55,lz+Math.sin(a)*.76],.045,palette.dark);
    }
    // Lentille ambre de secours ; le cœur dynamique mode 7 l'enveloppe une fois branché.
    cylinder([lx,19.08,lz],[lx,19.82,lz],.25,.25,color(0xdeab55),16);
    cylinder([lx,20.25,lz],[lx,20.38,lz],1.03,1.03,palette.trim,24);
    cylinder([lx,20.38,lz],[lx,21.10,lz],1.03,.06,palette.tile,24);
    beam([lx,21.1,lz],[lx,21.65,lz],.03,palette.dark);

    // ---------- Passe 1 : paysage habité, sans déplacer le parcours ----------
    // L'aléa des maisons, marches et rochers précédents est déjà consommé.
    // Ce sous-flux ne peut donc changer ni leurs variantes ni les autres îles.
    seed = 341810;
    const leafBase=color(0x6b964b),leafSun=color(0x7cac52),leafShade=color(0x567639);
    const bark=color(0x7b634b),rope=color(0xbba780),chalk=color(0xd8c7a6);
    const protectedDiscs=[
      [35.8,-7.4,1.1], [35.8,-6.2,1.1], [34,-5,2.5],
      [33.2,-23.2,1.4],
      [37.9,-12.4,1.9], [32.2,-14.8,1.9], [36.5,-19.3,1.9]
    ];
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
      const outline=[[1,.45],[.48,1],[-.5,1],[-1,.42],[-1,-.48],[-.42,-1],[.5,-1],[1,-.4]];
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
    function leaves(p,s,c) { ellipsoid(p,s,c,7,4,.08); }
    function coastalTree(x,y,z,h,r,olive=false) {
      const lean=olive?-.28:.38;
      const shoulder=[x+lean*.45,y+h*.52,z-.08];
      cylinder([x,y-.07,z],shoulder,.15,.105,bark,7);
      const crown=[x+lean,y+h*.84,z-.18];
      cylinder(shoulder,crown,.105,.055,bark,7);
      // Cinq masses asymétriques, couronne étalée de pin ou olivier plus bas.
      const lobes=[[-.58,.03,.12,.62],[.1,.21,-.4,.72],[.54,.06,.14,.65],
        [-.14,-.08,.5,.63],[.03,.34,.03,.72]];
      for(let i=0;i<lobes.length;i++){
        const [dx,dy,dz,s]=lobes[i],p=add(crown,[dx*r,dy*r,dz*r]);
        cylinder(shoulder,add(p,[0,-.14,0]),.055,.023,bark,6);
        leaves(p,[r*s,r*(olive?.42:.31),r*s*.83],i===3?leafShade:leafBase);
        leaves(add(p,[-.08,r*.17,-.04]),[r*s*.66,r*.16,r*s*.60],leafSun);
      }
    }
    function cypress(x,y,z,h) {
      cylinder([x,y-.05,z],[x+.07,y+h*.65,z],.075,.025,bark,6);
      for(let i=0;i<4;i++){
        const t=i/3,r=.42*(1-t*.64);
        leaves([x+.1*t,y+h*(.27+t*.57),z-.05*t],[r,h*.24,r*.85],i%2?leafBase:leafShade);
      }
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
    for(const [x,z,sx,sy,sz] of [[31.4,-8.6,.8,.6,.48],[38.7,-8.65,.65,.45,.55],
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

  } finally {
    seed = pharePreviousSeed;
  }
}

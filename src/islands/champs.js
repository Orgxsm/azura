// Île des Champs — Astra · passe 7 · base 458773d · décor de ferme, sans logique farm.js.
// Centre [-32,10], rayon nominal 11, englobant 14. Y vertical, mer Y=0.
// Enveloppe réservée x∈[-46,-18], z∈[-2,24].
// Apparition : {x:-23,y:.56,z:10,heading:-Math.PI/2}.
// Ponton NON construit : centre(-20,.60,10), heading=Math.atan2(15.8,2.6),
// len:4, width:1.6, build:true ; landing:[-21.97,9.68].
// Entrée à ajouter par Claude dans islands :
// {id:'champs',name:"L'Île des Champs",center:[-32,10],r:14,spawn:[-23,10],
//  dock:{x:-20,y:.6,z:10,heading:Math.atan2(15.8,2.6),len:4,width:1.6,build:true},
//  landing:[-21.97,9.68]}
// Zone cultivable garantie PLANE à Y=1.20 : x∈[-36,-28], z∈[6,14] (64 m²).
// Proposition FARM_AREAS : {island:'champs',x0:-36,z0:6,cols:8,rows:8,cell:1}.
// Aucune clôture, plante ni construction dans ce rectangle (clôtures à au moins .8 m).
// Maison : (-35,2.8,1.65), porche orienté +Z ; puits : (-38.2,1.2,10).
// Trois niveaux .56 / 1.20 / 2.80, raccordés par stairs + platforms.
// Pas de cultures statiques : emplacements et boutique appartiennent à Claude.
var champsCoopDesign; // factory différée, voir PASSE-7.md pour le branchement côté farm.js.
{
 const champsSeed=seed;seed=321009;
 try {
  const edits=[],stats=[];
  const ivory=color(0xf3e6d0),honey=color(0xc58b4e),coral=color(0xd9736f),tileCosy=color(0xe8925c),sage=color(0x5e9c8f);
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
    // Tube lissé sans bouchons : raccords masqués dans les montants/rives.
    function cosyRod(a,b,r,col,n=6) {
      const axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
      const N=i=>add(mul(u,Math.cos(i/n*TAU)),mul(v,Math.sin(i/n*TAU)));
      for(let i=0;i<n;i++){
        const na=N(i),nb=N(i+1),aa=add(a,mul(na,r)),ab=add(a,mul(nb,r)),ba=add(b,mul(na,r)),bb=add(b,mul(nb,r));
        tri(aa,ba,bb,col,[na,na,nb]);tri(aa,bb,ab,col,[na,nb,nb]);
      }
    }
    // Rectangle arrondi extrudé : trois points par coin, bourrelet haut et bas.
    function cushion(P,w,d,h,col,small=false) {
      const outline=[]; const steps=2; const r=Math.min(.18,w*.25,d*.25);
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
      if(door)cosyBall(P([w*.3,h*.43,.09]),[.07,.07,.07],honey,4);
      else{
        cosyRod(P([-w*.4,h*.45,.03]),P([w*.4,h*.45,.03]),.035,ivory,5);
        cosyRod(P([0,.08,.03]),P([0,h-.07,.03]),.035,ivory,5);
      }
    }
    function home(x,y,z,w,d,h,rot,wood,bal,smoke) {
      const count=triangles,originalH=h,variant=wood?1:Math.abs(Math.round(x))%3;
      h=h>3?h:Math.max(2.05,Math.min(h,2.4));
      const P=q=>transform(q,[x,y,z],rot),shutter=[sage,color(0x7c8fc7),coral][variant];
      cushion(P,w-.33,d-.33,h,[ivory,color(0xf6dcc4),color(0xe9eedc)][variant]);
      // Trois rangs décalés : une seule teinte, le relief dessine les écailles.
      const half=w/2+.235,depth=d/2+.235,rise=half*.64;
      const roofP=(side,t,z)=>P([side*t*half,h+rise*(1-t)+.12*Math.sin(Math.PI*t)+.10*(1-(z/depth)**2),z]);
      for(const side of[-1,1]){
        // Bandes continues : pas de creux ni de tuiles superposées.
        for(let row=0;row<3;row++)for(let j=0;j<4;j++){
          const za=-depth+j*depth/2,zb=za+depth/2,t=row/3,u=(row+1)/3;
          quad(roofP(side,t,za),roofP(side,t,zb),roofP(side,u,zb),roofP(side,u,za),tint(tileCosy,.94+row*.03));
        }
        for(const zz of[-depth,depth]){
          const a=roofP(side,0,zz),b=roofP(side,1,zz);
          cosyRod(a,b,.12,tileCosy);
          tri(P([0,h,zz]),b,a,ivory);
        }
        cosyRod(roofP(side,1,-depth),roofP(side,1,depth),.12,tileCosy);
      }
      // Faîtage courbe réel : flèche de 10 cm, quatre tronçons arrondis.
      for(let j=0;j<4;j++)cosyRod(roofP(1,0,-depth+j*depth/2),roofP(1,0,-depth+(j+1)*depth/2),.13,tileCosy,5);
      cosyOpening(q=>P([q[0]-.30,q[1],d/2-.160+q[2]]),1.0,1.9,shutter,true);
      // Façade d'accueil : fenêtre, jardinière, seuil dans l'emprise bloquée.
      const F=q=>P([q[0]+.62,q[1]+.90,d/2-.160+q[2]]);
      cosyOpening(F,.42,.64,color(0x91bec5));
      cushion(q=>F([q[0],q[1]-.14,q[2]+.055]),.49,.15,.13,honey,true);
      cosyBall(F([0,.025,.07]),[.15,.10,.08],coral,4);
      cushion(q=>P([q[0]-.30,q[1],d/2-.08+q[2]]),1.10,.22,.08,ivory,true);
      // Auvent incliné de 20 cm : ne dépasse pas le cadre ni les marches.
      const A=q=>P([q[0]-.30,1.99+q[1],d/2-.14+q[2]]);
      quad(A([-.58,.10,0]),A([.58,.10,0]),A([.58,0,.20]),A([-.58,0,.20]),honey);
      cosyRod(A([-.58,0,.20]),A([.58,0,.20]),.045,honey,5);
      // Grande fenêtre de côté ; cadres et volets épais, jardinière intégrée.
      for(const side of[1]){
        const W=q=>P([side*(w/2-.157+q[2]),.8+q[1],q[0]]);
        cosyOpening(W,.65,.87,color(0x91bec5));
        for(const k of[-1,1])cushion(q=>W([q[0]+k*.48,q[1]+.08,q[2]+.03]),.20,.10,.68,shutter,true);
        cushion(q=>W([q[0],q[1]-.14,q[2]+.07]),.75,.18,.16,honey,true);
        for(const k of[-1,0,1])cosyBall(W([k*.21,.06,.09]),[.11,.11,.10],k===0?coral:color(0x8fbf6b),4);
      }
      // Nichoir au dos, dans l'emprise du mur ; pas de nouvel obstacle.
      cosyBall(P([0,1.45,-d/2+.12]),[.22,.29,.14],honey,6);
      cosyBall(P([0,1.47,-d/2+.00]),[.07,.08,.015],shutter,5);
      for(const c of smoke){
        softLathe(add(c,[0,-1.05,0]),[[0,.18],[.08,.22],[.87,.22],[.95,.36],[1.07,.30],[1.10,0]],ivory,6);
      }
      if(originalH>3){
        cosyOpening(q=>P([q[0]-.35,q[1]+originalH*.57,d/2-.16+q[2]]),.58,.70,color(0x91bec5));
        if(bal){
          const B=q=>P([q[0],originalH*.48+q[1],d/2+.53+q[2]]),bw=w+.45,bd=1.23;
          // Tablier à la hauteur historique des planches : +0,075 m.
          const boards=Math.ceil(bw/.19),floorWidth=(boards-1)*.19+.17,floorX=-bw/2+(boards-1)*.095;
          box(B([floorX,.01,0]),[floorWidth,.13,bd],honey,rot);
          for(const xx of[-bw/2,0,bw/2])cosyRod(B([xx,0,bd/2]),B([xx,.8,bd/2]),.065,honey,5);
          cosyRod(B([-bw/2,.8,bd/2]),B([bw/2,.8,bd/2]),.055,honey,5);
          for(const xx of[-bw/2,bw/2]){
            cosyRod(B([xx,.8,-bd/2]),B([xx,.8,bd/2]),.055,honey,5);
            cosyRod(B([xx,-1.25,-bd/2]),B([xx,0,bd/2]),.095,honey,5);
          }
        }
      }
      stats.push({kind:'maison',x,z,triangles:triangles-count});
    }


  // Conserver les appels aléatoires et filtrer sur les emprises historiques.
  function remodel(kind,legacy,design){
   const start=verts.length;legacy();const end=verts.length,original=verts,nt=triangles,keepSeed=seed;
   verts=[];triangles=0;
   try{design();edits.push({kind,start,end,data:verts});}finally{verts=original;triangles=nt;seed=keepSeed;}
  }
  function roundTree(x,y,z,h,r){
   cylinder([x,y,z],[x+.08,y+h*.55,z],.20,.14,honey,7);
   for(const [t,scale,col] of[[.52,1,0x4f7f45],[.75,.80,0x6fa35a],[.96,.55,0x8fbf6b]])cosyBall([x,y+h*t,z],[r*.75*scale,h*.23,r*.68*scale],color(col),8);
  }
  function fieldTree(...a){remodel('arbre',()=>tree(...a),()=>roundTree(...a));}
  function fieldRock(...a){
   const first=verts.length;rock(...a);const end=verts.length;
   // Relief identique ; éclairage adouci pour lire les ellipsoïdes en galets.
   const [x,y,z,sx,sy,sz]=a;
   for(let i=first;i<end;i+=9){const n=norm([(verts[i]-x)/(sx*sx),(verts[i+1]-y)/(sy*sy),(verts[i+2]-z)/(sz*sz)]);for(let k=0;k<3;k++){verts[i+3+k]=n[k];verts[i+6+k]=color(0xd8c7a6)[k];}}
  }
  function fieldBush(x,y,z,r){remodel('buisson',()=>shrub(x,y,z,r),()=>{
   // Sommet réel à +0,58 m (0,32 + 0,82×0,32), au-dessus du seuil 0,45.
   cosyBall([x,y+.32,z],[r*.77,.32,r*.72],color(0x6fa35a),10);
   cosyBall([x+r*.18,y+.35,z],[r*.45,.25,r*.42],color(0x8fbf6b),8);
  });}
  // Littoral continu avec dessus bas et horizontal, estran incliné sous la mer.
  const cx=-32,cz=10,n=80;
  for(let i=0;i<n;i++){
   const a=i/n*TAU,b=(i+1)/n*TAU;
   const p=t=>[cx+Math.cos(t)*10.6,.56,cz+Math.sin(t)*10.6];
   const q=t=>[cx+Math.cos(t)*11.3,-.8,cz+Math.sin(t)*11.3];
   tri([cx,.56,cz],p(b),p(a),palette.sand);
   quad(p(a),p(b),q(b),q(a),palette.sand);
   quad(q(a),q(b),[q(b)[0],-2,q(b)[2]],[q(a)[0],-2,q(a)[2]],palette.rock);
  }
  // Plateaux en terre et soubassements de pierre, aucun bruit sur la surface.
  box([-32,.825,10],[12,.75,12],palette.rockLight);
  box([-32,1.17,10],[12,.06,12],color(0xc5ac78));
  // Réserver une encoche au débouché de l'escalier : aucune marche enterrée.
  for(const [x,z,w,d] of [[-34,2.2,8,4.6],[-28.1,2.2,.2,4.6],[-29.1,1.35,1.8,2.9]]){
   box([x,1.64,z],[w,2.28,d],palette.rock);
   box([x,2.77,z],[w,.06,d],palette.sand);
  }
  const pads=[{x:-25,y:.56,z:10,r:1},{x:-27,y:1.2,z:10,r:1.1},
   {x:-29.1,y:1.2,z:5.5,r:1},{x:-29.1,y:2.8,z:2.1,r:.65},
   {x:-35,y:2.8,z:3.6,r:1},{x:-38.2,y:1.2,z:10,r:1.15}];
  for(const p of pads){platforms.push(p);cylinder([p.x,p.y-1,p.z],[p.x,p.y,p.z],p.r,p.r,palette.rockLight,24);}
  stairs([[-24,.56,10],[-26,1.2,10]],1.4,false,false);
  stairs([[-29.1,1.2,5.5],[-29.1,2.8,2.8]],1.3,false,true);
  stairs([[-29.1,2.8,2.8],[-29.1,2.8,2.1],[-31,2.8,2.1],[-31,2.8,3.7],[-35,2.8,3.7]],1.2,false,false);
  stairs([[-36.9,1.2,10],[-38.2,1.2,10]],1.1,false,false);
  const smokeStart=chimneys.length;
  remodel('maison',()=>house(-35,2.8,1.65,2.8,2.3,2.2,0,false,false),()=>home(-35,2.8,1.65,2.8,2.3,2.2,0,false,false,chimneys.slice(smokeStart)));
  box([-35,2.7,3.32],[3.5,.20,1.2],palette.trim);
  for(const x of[-36.5,-33.5])cosyRod([x,2.8,3.75],[x,4.8,3.75],.095,honey,8);
  remodel('toit-porche',()=>roof([-35,4.8,3.35],3.6,1.3,.45,0),()=>{
   const P=(side,t,z)=>[-35+side*2.1*t,4.8+.45*(1-t)+.08*Math.sin(t*Math.PI)+.08*(1-(z/.95)**2),3.35+z];
   for(const side of[-1,1]){
    for(let j=0;j<3;j++)for(let k=0;k<4;k++){const a=-.95+k*.475,b=a+.475;quad(P(side,j/3,a),P(side,j/3,b),P(side,(j+1)/3,b),P(side,(j+1)/3,a),tint(tileCosy,.94+j*.03));}
    for(const z of[-.95,.95])cosyRod(P(side,0,z),P(side,1,z),.10,tileCosy,6);
    cosyRod(P(side,1,-.95),P(side,1,.95),.10,tileCosy,6);
   }
   for(let k=0;k<4;k++)cosyRod(P(1,0,-.95+k*.475),P(1,0,-.95+(k+1)*.475),.12,tileCosy,6);
  });
  remodel('puits',()=>{
  // Puits à l'écart des 64 m² de culture ; couronne et eau visibles.
  for(let i=0;i<16;i++){let a=i/16*TAU;box([-38.2+Math.cos(a)*.43,1.5,10+Math.sin(a)*.43],[.21,.6,.23],palette.rockLight,-a);}
  cylinder([-38.2,1.35,10],[-38.2,1.38,10],.34,.34,color(0x348d99),20);
  for(const x of[-38.72,-37.68])beam([x,1.2,10],[x,2.65,10],.07,palette.wood);
  beam([-38.72,2.65,10],[-37.68,2.65,10],.07,palette.trim);
  beam([-38.2,2.65,10],[-38.2,1.45,10],.014,palette.sand);
  },()=>{
   // Couronne creuse : aucun couvercle sur l'eau ni nouveau point de hauteur.
   for(let j=0;j<12;j++){
    const a=j/12*TAU,b=(j+1)/12*TAU,pt=(r,t,y)=>[-38.2+Math.cos(t)*r,y,10+Math.sin(t)*r];
    quad(pt(.53,a,1.2),pt(.53,b,1.2),pt(.53,b,1.8),pt(.53,a,1.8),ivory);
    quad(pt(.53,a,1.8),pt(.53,b,1.8),pt(.32,b,1.8),pt(.32,a,1.8),ivory);
    quad(pt(.32,a,1.8),pt(.32,b,1.8),pt(.32,b,1.38),pt(.32,a,1.38),ivory);
   }
   cylinder([-38.2,1.35,10],[-38.2,1.38,10],.31,.31,color(0x7fd8d3),20);
   for(const x of[-38.72,-37.68]){cosyRod([x,1.2,10],[x,2.65,10],.09,honey,8);cosyBall([x,2.66,10],[.12,.13,.12],coral,6);}
   cosyRod([-38.72,2.55,10],[-37.68,2.55,10],.09,honey,8);
   cosyRod([-38.2,2.55,10],[-38.2,1.48,10],.017,honey,5);
  });
  function oldFence(a,b){const len=Math.hypot(b[0]-a[0],b[2]-a[2]),steps=Math.ceil(len/1.4);for(let i=0;i<=steps;i++){const p=add(a,mul(sub(b,a),i/steps));beam(p,add(p,[0,.58,0]),.045,palette.trim);}for(const y of[.23,.47])beam(add(a,[0,y,0]),add(b,[0,y,0]),.034,palette.wood);}
  function fence(a,b){remodel('barriere',()=>oldFence(a,b),()=>{
   const steps=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/1.4);
   for(let j=0;j<=steps;j++){const p=add(a,mul(sub(b,a),j/steps));cosyRod(p,add(p,[0,.58,0]),.065,honey,6);cosyBall(add(p,[0,.60,0]),[.08,.07,.08],ivory,6);}
   for(const h of[.23,.47])cosyRod(add(a,[0,h,0]),add(b,[0,h,0]),.045,honey,6);
  });}
  // Portillons ouverts de 1.6 m aux axes de circulation.
  for(const x of[-37,-27]){fence([x,1.2,5.2],[x,1.2,9.2]);fence([x,1.2,10.8],[x,1.2,14.8]);}
  for(const z of[5.2,14.8]){fence([-37,1.2,z],[-32.8,1.2,z]);fence([-31.2,1.2,z],[-27,1.2,z]);}
  for(const p of[[-40,.5,14,2.8,1.2],[-24,.5,15,2.4,1.1],[-36,.5,18.8,2.7,1.3]])fieldTree(...p);
  for(const p of[[-40,.1,7,1.1,.7,1.1],[-31,.1,20,1.2,.6,1]])fieldRock(...p);
  // Lot 3 : placage mince des sols ; jamais dans une emprise de gameplay.
  // Les plaques restent à 6 mm du sol, sans modifier stairs/platforms.
  const paths=[
   [[-21.8,10],[-24,10]], [[-26,10],[-27,10]],
   [[-27,10],[-27,5.5],[-29.1,5.5]],
   [[-27,10],[-27,15.4],[-37.1,15.4],[-37.1,10],[-38.2,10]],
   [[-31,3.7],[-35,3.7]]
  ];
  const segDist=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
  const routeDist=(x,z)=>Math.min(...paths.flatMap(p=>p.slice(1).map((b,i)=>segDist(x,z,p[i],b))));
  const reserved=(x,z,m=0)=>(x>=-36-m&&x<=-28+m&&z>=6-m&&z<=14+m)
    ||Math.hypot(x+24,z-12.7)<=1.6+m||Math.hypot(x+35,z-3.55)<=.85+m;
  const onStairs=(x,z,m)=>stairDefs.some(s=>s.points.slice(1).some((b,i)=>segDist(x,z,[s.points[i][0],s.points[i][2]],[b[0],b[2]])<s.width/2+m));
  function ground(x,z){
   if(x>=-38&&x<=-28&&z>=-.1&&z<=4.5){
    if(x>-30&&x<-28.2&&z>2.8)return z>=4?1.2:.56;
    return 2.8;
   }
   if(x>=-38&&x<=-26&&z>=4&&z<=16)return 1.2;
   return .56;
  }
  // Petites facettes jointives : transitions herbe/sable/terre irrégulières,
  // aucun gros disque vert ou bruit de relief sur les zones de circulation.
  for(let x=-42;x<-21.5;x+=.24)for(let z=0;z<20.4;z+=.24){
   const xx=x+.12,zz=z+.12,y=ground(xx,zz);
   if(Math.hypot(xx+32,zz-10)>10.35||reserved(xx,zz,.18)||onStairs(xx,zz,.2))continue;
   if(terraces.some(p=>Math.hypot(xx-p.x,zz-p.z)<Math.max(p.w,p.d)*.72))continue;
   if(platforms.some(p=>Math.hypot(xx-p.x,zz-p.z)<p.r+.18))continue;
   if([[x,z],[x+.24,z],[x,z+.24],[x+.24,z+.24]].some(p=>ground(...p)!==y))continue;
   const noise=Math.sin(xx*1.8+Math.sin(zz*1.3))*Math.cos(zz*1.5)+.35*Math.sin(xx*4.1+zz*2);
   const dirt=routeDist(xx,zz)<.45+.09*Math.sin(xx*3+zz*2);
   const grass=!dirt&&noise>-.55&&Math.hypot(xx+32,zz-10)<9.8;
   const col=dirt?color(0xb79059):grass?color(0x799742):color(0xd7bd83);
   quad([x,y+.006,z],[x,y+.006,z+.24],[x+.24,y+.006,z+.24],[x+.24,y+.006,z],tint(col,.97+.025*noise));
  }
  // Contrôle de l'emprise entière : ni branches, ni feuilles, ni rochers dans
  // la ferme, le poulailler, l'entrée de la maison ou les passages.
  function decorate(fn){
   const first=verts.length,nt=triangles;fn();
   let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
   for(let i=first;i<verts.length;i+=9){x0=Math.min(x0,verts[i]);x1=Math.max(x1,verts[i]);z0=Math.min(z0,verts[i+2]);z1=Math.max(z1,verts[i+2]);}
   const cx=(x0+x1)/2,cz=(z0+z1)/2,r=Math.hypot(x1-x0,z1-z0)/2;
   if(reserved(cx,cz,r)||onStairs(cx,cz,r+.4)||routeDist(cx,cz)<r+.4){verts.length=first;triangles=nt;while(edits.length&&edits[edits.length-1].start>=first)edits.pop();}
  }
  for(const [x,z] of [[-39,5],[-39,8],[-39,12],[-39,16],[-37,17],[-33,17],[-29,17],[-25,17],[-25.5,5.5],[-27,1],[-38,1]]){
   decorate(()=>fieldRock(x,.5,z,.65,.55,.7));
  }
  for(const [x,z] of [[-37.5,5.6],[-37.5,13.5],[-26.4,7],[-26.5,14.4],[-37,3.6],[-31.8,.8],[-39,15.8],[-28.5,18]]){
   decorate(()=>fieldBush(x,ground(x,z),z,.35));
  }
  for(const [x,z] of [[-37.5,6.8],[-37.5,12.4],[-26.45,6.6],[-26.45,13.8],[-32,4.3],[-37.2,3.7],[-39.2,13],[-29,17.1]]){
   decorate(()=>{const y=ground(x,z);for(let j=0;j<5;j++){
    const a=j/5*TAU,px=x+Math.cos(a)*.16,pz=z+Math.sin(a)*.16,h=.15+(j%2)*.06;
    beam([px,y,pz],[px,y+h,pz],.009,palette.leaf);
    for(let k=0;k<5;k++){const b=k/5*TAU;ellipsoid([px+.038*Math.cos(b),y+h,pz+.038*Math.sin(b)],[.031,.015,.031],color(j%2?0xf6dc84:0xffe7d2),6,3,0);}
    ellipsoid([px,y+h+.012,pz],[.024,.014,.024],color(0xe4a441),6,3,0);
   }});
  }
  for(const [x,z,h,r] of [[-40,9.3,2.5,.9],[-30,18.5,2.6,1],[-25.2,4,2.3,.8]])decorate(()=>fieldTree(x,.56,z,h,r));

  // Lot 5 — marché de Basile. Centre de l'enveloppe (-23.6,7.4), Y=.56.
  // Enveloppe <=2.4×1.6 m, avant +Z. Accès : disque r=1 en (-23.6,8.6).
  // Comptoir reculé et toile échancrée : pas de rectangle bloquant l'accès.
  remodel('marche',()=>{
   const x=-23.6,y=.56,z=7.4,wood=color(0x997044),trim=color(0x654e38);
   // Les trois emprises incluent les marges de world.js (.3 / .15 m).
   terraces.push({x,y,z:z-.41,w:2.18,d:.5,rot:0});
   for(const side of[-1,1])terraces.push({x:x+side*1.13,y,z:z+.655,w:.08,d:.08,rot:0,round:true});
   for(const side of[-1,1]){
    beam([x+side*1.13,y,z-.665],[x+side*1.13,y+1.91,z-.665],.035,trim);
    beam([x+side*1.13,y,z+.655],[x+side*1.13,y+1.68,z+.655],.035,trim);
    beam([x+side*1.13,y+1.91,z-.665],[x+side*1.13,y+1.68,z+.655],.026,trim);
   }
   // Façade en lattes, plateau bas et étagère arrière.
   box([x,y+.65,z-.41],[2.18,.09,.5],wood);
   for(let j=0;j<10;j++)box([x-.98+j*.218,y+.34,z-.2],[.205,.58,.045],tint(wood,.92+(j%3)*.06));
   for(const side of[-1,1])box([x+side*.96,y+.30,z-.41],[.07,.60,.34],trim);
   box([x,y+.14,z-.46],[2,.055,.35],trim);
   // Toile rayée crème/sauge. Le bord avant suit l'extérieur du disque libre.
   const front=dx=>Math.min(z+.64,8.6-Math.sqrt(Math.max(0,1.1*1.1-dx*dx)));
   for(let j=0;j<16;j++){
    const a=-1.16+j*2.32/16,b=-1.16+(j+1)*2.32/16,col=color(j%2?0x728e72:0xf5e4ba);
    const za=front(a),zb=front(b),ya=y+1.68,yb=y+1.68;
    const A=[x+a,y+1.94,z-.68],B=[x+b,y+1.94,z-.68],C=[x+b,yb,zb],D=[x+a,ya,za];
    quad(A,D,C,B,col);quad(A,B,C,D,tint(col,.86));
    quad(D,C,[x+b,yb-.13,zb],[x+a,ya-.13,za],tint(col,.94));
   }
   // Cagettes ouvertes et récoltes ; toutes derrière la zone d'accueil.
   for(const [dx,fruit]of[[-.7,0xe66a45],[-.16,0x87a63e]]){
    const cx=x+dx,cz=z-.40;
    box([cx,y+.73,cz],[.46,.05,.32],wood);
    for(const side of[-1,1]){
     box([cx+side*.235,y+.81,cz],[.025,.16,.34],trim);
     box([cx,y+.81,cz+side*.16],[.47,.13,.025],wood);
    }
    for(let j=0;j<6;j++)ellipsoid([cx-.14+(j%3)*.14,y+.81,cz-.075+Math.floor(j/3)*.15],[.061,.059,.058],color(fruit),8,5,0);
   }
   const bx=x+.60,bz=z-.40;
   ellipsoid([bx,y+.77,bz],[.25,.09,.17],color(0xc19a62),10,5,0);
   cylinder([bx,y+.80,bz],[bx,y+.82,bz],.19,.19,color(0x785b38),12);
   for(let j=0;j<5;j++){const a=j/5*TAU;ellipsoid([bx+Math.cos(a)*.115,y+.855,bz+Math.sin(a)*.08],[.045,.059,.043],color(0xffebc8),8,5,0);}
  },()=>{
   const x=-23.6,y=.56,z=7.4;
   const P=p=>add([x,y,z],p);
   cushion(p=>P([p[0],p[1],p[2]-.41]),2.18,.5,.695,honey);
   for(const side of[-1,1]){
    cosyRod(P([side*1.13,0,-.665]),P([side*1.13,1.91,-.665]),.06,honey,8);
    cosyRod(P([side*1.13,0,.655]),P([side*1.13,1.68,.655]),.06,honey,8);
    cosyBall(P([side*1.13,1.72,.655]),[.07,.08,.07],coral,6);
   }
   const front=dx=>Math.min(z+.64,8.6-Math.sqrt(Math.max(0,1.1*1.1-dx*dx)));
   for(let j=0;j<16;j++){
    const a=-1.16+j*2.32/16,b=a+2.32/16,col=j%2?sage:ivory;
    for(let k=0;k<3;k++){
     const p=(dx,t)=>[x+dx,y+1.94-.26*t+.10*Math.sin(t*Math.PI),z-.68+(front(dx)-(z-.68))*t];
     quad(p(a,k/3),p(b,k/3),p(b,(k+1)/3),p(a,(k+1)/3),col);
    }
    quad([x+a,y+1.68,front(a)],[x+b,y+1.68,front(b)],[x+b,y+1.55,front(b)],[x+a,y+1.55,front(a)],col);
   }
   for(const [dx,col] of[[-.7,coral],[-.16,color(0x8fbf6b)]]){
    cushion(p=>P([p[0]+dx,p[1]+.70,p[2]-.4]),.47,.34,.12,ivory,true);
    for(let j=0;j<6;j++)cosyBall(P([dx-.14+j%3*.14,.84,-.475+Math.floor(j/3)*.15]),[.065,.07,.065],col,6);
   }
   cosyBall(P([.60,.78,-.4]),[.25,.10,.17],honey,8);
   for(let j=0;j<5;j++){const a=j/5*TAU;cosyBall(P([.6+Math.cos(a)*.11,.88,-.4+Math.sin(a)*.08]),[.045,.062,.043],ivory,6);}
  });

  // Sixième dôme, hors des parcours et des emprises agricoles.
  decorate(()=>fieldBush(-40,.56,12.7,.35));

  // Remplacer après les filtres : aucun objet rejeté ne revient par rétrécissement.
  const replacement=new Map(edits.map(e=>[e.start,e]));
  const clean=[];
  for(let i=0;i<verts.length;){const e=replacement.get(i);if(e){for(const v of e.data)clean.push(v);i=e.end;}else{for(let k=0;k<9;k++)clean.push(verts[i+k]);i+=9;}}
  triangles+=(clean.length-verts.length)/27;verts=clean;
  const retainedModels=edits.map(e=>({kind:e.kind,triangles:e.data.length/27}));
  edits.length=0;
  // Props hors du champ et des zones de promenade/interaction des animaux.
  const propRecords=[];
  function farmProp(x,z,r,draw){
   if(reserved(x,z,r)||onStairs(x,z,r+.4)||routeDist(x,z)<r+.4)return;
   if([[-31,18,2.6],[-34.5,17.2,2.6],[-27.6,17.6,2.6],[-23.6,8.9,1.4]].some(p=>Math.hypot(x-p[0],z-p[1])<r+p[2]))return;
   const first=verts.length;decorate(draw);if(verts.length>first)propRecords.push({x,z,triangles:(verts.length-first)/27});
  }
  farmProp(-32.8,1,.65,()=>{
   const P=q=>add([-32.8,2.8,1],q);
   cosyBall(P([0,.37,0]),[.31,.18,.41],sage,10);
   cosyBall(P([0,.47,0]),[.23,.05,.30],color(0xd4a761),8);
   for(const x of[-.25,.25]){cosyRod(P([x,.31,-.33]),P([x,.56,.56]),.035,honey,6);cosyRod(P([x,.26,.17]),P([x,-.02,.22]),.028,honey,6);}
   cosyBall(P([0,.14,-.36]),[.075,.16,.16],honey,8);
   cosyBall(P([.08,.14,-.36]),[.016,.065,.065],ivory,6);
  });
  farmProp(-39.5,17.4,.56,()=>{
   const P=q=>add([-39.5,.56,17.4],q),hay=color(0xe0ba70);
   cushion(P,.8,.6,.42,hay);
   cushion(q=>P([q[0]-.12,q[1]+.42,q[2]]),.56,.48,.30,hay);
   for(const x of[-.23,.23])cosyRod(P([x,.44,-.31]),P([x,.44,.31]),.016,honey,5);
  });
  farmProp(-38.8,3.6,.52,()=>{
   const P=q=>add([-38.8,.56,3.6],q);
   cosyRod(P([0,-.03,0]),P([0,1.1,0]),.05,honey,8);
   cosyRod(P([-.48,.8,0]),P([.48,.8,0]),.045,honey,8);
   cosyBall(P([0,.76,0]),[.22,.30,.15],coral,8);
   cosyBall(P([0,1.11,0]),[.15,.17,.14],ivory,8);
   softLathe(P([0,1.25,0]),[[0,.27],[.035,.27],[.05,.16],[.16,.13],[.18,0]],honey,10);
   for(const x of[-.045,.045])cosyBall(P([x,1.12,.135]),[.013,.015,.009],color(0x8f5f3a),4);
  });
  // Factory différée : le poulailler reste un maillage dynamique (pas de doublon
  // statique, pas de changement de cellH à l'initialisation des poules).
  champsCoopDesign=()=>new Float32Array(withBone(0,()=>{
   for(const x of[-.40,.40])for(const z of[-.33,.33])cosyRod([x,0,z],[x,.31,z],.055,honey,6);
   cushion(p=>add([0,.30,0],p),.96,.82,.62,ivory);
   const R=(side,t,z)=>[side*t*.82,.99+.36*(1-t)+.08*Math.sin(t*Math.PI),z];
   for(const side of[-1,1]){
    for(let j=0;j<3;j++)quad(R(side,j/3,-.78),R(side,j/3,.78),R(side,(j+1)/3,.78),R(side,(j+1)/3,-.78),tint(tileCosy,.94+j*.03));
    for(const z of[-.78,.78])cosyRod(R(side,0,z),R(side,1,z),.07,tileCosy,6);
   }
   cosyOpening(p=>[.49+p[2],.31+p[1],p[0]],.26,.34,sage,true);
   quad([.49,.30,-.15],[.49,.30,.15],[.90,.02,.20],[.90,.02,-.20],honey);
   for(let j=1;j<4;j++)cosyRod([.49+j*.10,.30-j*.068,-.16],[.49+j*.10,.30-j*.068,.16],.017,ivory,5);
  }));

 }finally{seed=champsSeed;}
}

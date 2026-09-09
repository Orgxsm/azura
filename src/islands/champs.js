// Île des Champs — Astra · base ab3c583 · décor de ferme, sans logique farm.js.
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
{
 const champsSeed=seed;seed=321009;
 try {
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
  house(-35,2.8,1.65,2.8,2.3,2.2,0,false,false);
  box([-35,2.7,3.32],[3.5,.20,1.2],palette.trim);
  for(const x of[-36.5,-33.5])beam([x,2.8,3.75],[x,4.8,3.75],.07,palette.wood);
  roof([-35,4.8,3.35],3.6,1.3,.45,0);
  // Puits à l'écart des 64 m² de culture ; couronne et eau visibles.
  for(let i=0;i<16;i++){let a=i/16*TAU;box([-38.2+Math.cos(a)*.43,1.5,10+Math.sin(a)*.43],[.21,.6,.23],palette.rockLight,-a);}
  cylinder([-38.2,1.35,10],[-38.2,1.38,10],.34,.34,color(0x348d99),20);
  for(const x of[-38.72,-37.68])beam([x,1.2,10],[x,2.65,10],.07,palette.wood);
  beam([-38.72,2.65,10],[-37.68,2.65,10],.07,palette.trim);
  beam([-38.2,2.65,10],[-38.2,1.45,10],.014,palette.sand);
  function fence(a,b){const len=Math.hypot(b[0]-a[0],b[2]-a[2]),steps=Math.ceil(len/1.4);for(let i=0;i<=steps;i++){const p=add(a,mul(sub(b,a),i/steps));beam(p,add(p,[0,.58,0]),.045,palette.trim);}for(const y of[.23,.47])beam(add(a,[0,y,0]),add(b,[0,y,0]),.034,palette.wood);}
  // Portillons ouverts de 1.6 m aux axes de circulation.
  for(const x of[-37,-27]){fence([x,1.2,5.2],[x,1.2,9.2]);fence([x,1.2,10.8],[x,1.2,14.8]);}
  for(const z of[5.2,14.8]){fence([-37,1.2,z],[-32.8,1.2,z]);fence([-31.2,1.2,z],[-27,1.2,z]);}
  for(const p of[[-40,.5,14,2.8,1.2],[-24,.5,15,2.4,1.1],[-36,.5,18.8,2.7,1.3]])tree(...p);
  for(const p of[[-40,.1,7,1.1,.7,1.1],[-24,.1,6,1,.8,1],[-31,.1,20,1.2,.6,1]])rock(...p);
 }finally{seed=champsSeed;}
}

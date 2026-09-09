// Île des Champs — Astra · base c6ff9e9 · décor de ferme, sans logique farm.js.
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
  for(const p of[[-40,.1,7,1.1,.7,1.1],[-31,.1,20,1.2,.6,1]])rock(...p);
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
   if(reserved(cx,cz,r)||onStairs(cx,cz,r+.4)||routeDist(cx,cz)<r+.4){verts.length=first;triangles=nt;}
  }
  for(const [x,z] of [[-39,5],[-39,8],[-39,12],[-39,16],[-37,17],[-33,17],[-29,17],[-25,17],[-25.5,5.5],[-27,1],[-38,1]]){
   decorate(()=>rock(x,.5,z,.65,.55,.7));
  }
  for(const [x,z] of [[-37.5,5.6],[-37.5,13.5],[-26.4,7],[-26.5,14.4],[-37,3.6],[-31.8,.8],[-39,15.8],[-28.5,18]]){
   decorate(()=>shrub(x,ground(x,z),z,.35));
  }
  for(const [x,z] of [[-37.5,6.8],[-37.5,12.4],[-26.45,6.6],[-26.45,13.8],[-32,4.3],[-37.2,3.7],[-39.2,13],[-29,17.1]]){
   decorate(()=>{const y=ground(x,z);for(let j=0;j<5;j++){
    const a=j/5*TAU,px=x+Math.cos(a)*.16,pz=z+Math.sin(a)*.16,h=.15+(j%2)*.06;
    beam([px,y,pz],[px,y+h,pz],.009,palette.leaf);
    for(let k=0;k<5;k++){const b=k/5*TAU;ellipsoid([px+.038*Math.cos(b),y+h,pz+.038*Math.sin(b)],[.031,.015,.031],color(j%2?0xf6dc84:0xffe7d2),6,3,0);}
    ellipsoid([px,y+h+.012,pz],[.024,.014,.024],color(0xe4a441),6,3,0);
   }});
  }
  for(const [x,z,h,r] of [[-40,9.3,2.5,.9],[-30,18.5,2.6,1],[-25.2,4,2.3,.8]])decorate(()=>tree(x,.56,z,h,r));

  // Lot 5 — marché de Basile. Centre de l'enveloppe (-23.6,7.4), Y=.56.
  // Enveloppe <=2.4×1.6 m, avant +Z. Accès : disque r=1 en (-23.6,8.6).
  // Comptoir reculé et toile échancrée : pas de rectangle bloquant l'accès.
  {
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
  }

 }finally{seed=champsSeed;}
}

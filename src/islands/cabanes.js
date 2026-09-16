// Île aux Cabanes — passe 9b, base 610c136. Habillage cosy, accès 9a conservés.
// Centre [-32,38], enveloppe x [-46,-18], z [24,52]. Mer y=0.
// Registre existant (Claude) : id cabanes, center [-32,38], r 14,
// spawn [-23,34], landing [-23,34],
// dock {x:-20.2,y:.65,z:30,heading:Math.atan2(3.5,-5),len:2.5,width:1.8,
//       build:false,via:[[-17,27]]}. Ponton, abri et pirogues déjà construits.
// Tous les helpers d'île sont préfixés : aucune déclaration Annex B homonyme.
{
 const cabanesPreviousSeed=seed;seed=323809;
 try {
  const cabanesGranite=color(0xb7b3a4),cabanesLight=color(0xcac6b6),cabanesSand=color(0xebddb4);
  const cabanesWood=color(0xc58b4e),cabanesBark=color(0x96704c),cabanesRope=color(0xd8c9a0);
  function cabanesFace(a,b,c,d,col,n){if(dot(cross(sub(b,a),sub(c,a)),n)<0)quad(d,c,b,a,col);else quad(a,b,c,d,col);}
  function cabanesRod(a,b,r,col,n=6){
   const axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
   const N=i=>add(mul(u,Math.cos(i/n*TAU)),mul(v,Math.sin(i/n*TAU)));
   for(let i=0;i<n;i++){const na=N(i),nb=N(i+1),aa=add(a,mul(na,r)),ab=add(a,mul(nb,r)),ba=add(b,mul(na,r)),bb=add(b,mul(nb,r));tri(aa,ba,bb,col,[na,na,nb]);tri(aa,bb,ab,col,[na,nb,nb]);}
  }
  // Relief fermé par anneaux non sphériques ; sommet plat, épaulements chanfreinés.
  function cabanesMass(x,z,rx,rz,rings,col,n=32){
   const P=(j,i)=>{const a=i/n*TAU,r=rings[j][1]*(1+.035*Math.sin(3*a+.4)+.018*Math.cos(7*a));return[x+Math.cos(a)*rx*r,rings[j][0],z+Math.sin(a)*rz*r];};
   for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++)cabanesFace(P(j,i),P(j,i+1),P(j+1,i+1),P(j+1,i),tint(col,.96+.025*(i%3)+.012*(j%2)),[Math.cos(i/n*TAU),0,Math.sin(i/n*TAU)]);
   for(let i=0;i<n;i++)tri([x,rings[rings.length-1][0],z],P(rings.length-1,i+1),P(rings.length-1,i),col);
  }
  // Trois îlots distincts : aucun disque de terre au centre du lagon.
  cabanesMass(-24,37,3.2,5,[[-1.2,1.06],[.05,1.04],[.48,1],[.6,.92]],cabanesSand,40);
  cabanesMass(-32,48.7,4.4,2.5,[[-1.2,1.06],[.05,1.04],[.48,1],[.6,.92]],cabanesSand,40);
  cabanesMass(-41,42.5,3.5,3.2,[[-1.2,1.06],[.05,1.04],[.48,1],[.6,.92]],cabanesSand,40);
  // Piton central de 12 m, au nord du bassin ; plateforme praticable au sommet.
  cabanesMass(-35,35,4.4,4.3,[[-1.4,1],[.7,1.04],[1.2,.99],[4,.82],[4.3,.85],[7,.62],[7.3,.66],[10,.47],[11.7,.43],[12,.39]],cabanesGranite,40);
  platforms.push({x:-35,y:12,z:35,r:1.62});
  // Fond du lagon à -1,15 m : seule l'eau existante à y=0 reste visible.
  for(let i=0;i<40;i++){const a=i/40*TAU,b=(i+1)/40*TAU;tri([-32,-1.15,43],[-32+4.5*Math.cos(b),-1.15,43+3.4*Math.sin(b)],[-32+4.5*Math.cos(a),-1.15,43+3.4*Math.sin(a)],cabanesSand);}

  const cabanesTrees=[
   {x:-40,z:32,base:1.6,deck:8,top:13.5,ports:[[-40.8,33.3],[-38.4,31.2]]},
   {x:-32,z:28.5,base:1.8,deck:10,top:15.5,ports:[[-33.6,28.8],[-30.5,29.3],[-30.2,27.3]]},
   {x:-28.5,z:35,base:2,deck:12,top:17,ports:[[-28.7,33.4],[-30.3,35]]}
  ];
  function cabanesTrunk(t){
   const {x,z,base,top}=t;
   cabanesMass(x,z,1.7,1.65,[[-1.1,1.1],[.2,1.05],[base-.18,.93],[base,.84]],cabanesGranite,20);
   // Tronc de diamètre 1,5 m au niveau de la plateforme, racines plus larges.
   const rings=[[base,.88],[base+.35,.80],[t.deck,.75],[top-.25,.63],[top,.59]],n=12;
   for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
    const P=(k,a)=>[x+Math.cos(a)*rings[k][1],rings[k][0],z+Math.sin(a)*rings[k][1]];
    const a=i/n*TAU,b=(i+1)/n*TAU;cabanesFace(P(j,a),P(j,b),P(j+1,b),P(j+1,a),tint(cabanesBark,.94+(i%3)*.035),[Math.cos(a),0,Math.sin(a)]);
   }
   for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU;tri([x,top,z],[x+Math.cos(b)*.59,top,z+Math.sin(b)*.59],[x+Math.cos(a)*.59,top,z+Math.sin(a)*.59],cabanesWood);}
   terraces.push({x,y:base,z,w:1.8,d:1.8,rot:0,round:true});
   for(let i=0;i<5;i++){const a=i/5*TAU;cabanesRod([x+Math.cos(a)*1.2,base-.08,z+Math.sin(a)*1.2],[x+Math.cos(a)*.72,base+.55,z+Math.sin(a)*.72],.14,cabanesBark,6);}
  }
  function cabanesDeck(t){
   const {x,z,deck:y}=t,n=32,ri=.91,ro=2.4;
   const P=(r,a,h=y)=>[x+Math.cos(a)*r,h,z+Math.sin(a)*r];
   for(let i=0;i<n;i++){
    const a=i/n*TAU,b=(i+1)/n*TAU,col=tint(cabanesWood,.94+(i%3)*.04);
    cabanesFace(P(ri,a),P(ro,a),P(ro,b),P(ri,b),col,[0,1,0]);
    cabanesFace(P(ro,a,y-.18),P(ro,b,y-.18),P(ro,b),P(ro,a),cabanesBark,[Math.cos(a),0,Math.sin(a)]);
    cabanesFace(P(ri,a,y-.18),P(ri,b,y-.18),P(ro,b,y-.18),P(ro,a,y-.18),cabanesBark,[0,-1,0]);
    const mid=(a+b)/2,open=t.ports.some(p=>Math.abs(Math.atan2(Math.sin(Math.atan2(p[1]-z,p[0]-x)-mid),Math.cos(Math.atan2(p[1]-z,p[0]-x)-mid)))<.49);
    if(!open){cabanesRod(P(ro,a,y+.78),P(ro,b,y+.78),.027,cabanesRope,5);if(i%2===0)cabanesRod(P(ro,a,y-.1),P(ro,a,y+.83),.055,cabanesWood,6);}
   }
   for(let i=0;i<8;i++){const a=i/8*TAU;cabanesRod(P(.76,a,y-1.65),P(2.25,a,y-.2),.10,cabanesBark,6);}
   platforms.push({x,y,z,r:2.35});
  }
  for(const t of cabanesTrees){cabanesTrunk(t);cabanesDeck(t);}

  // Escaliers de planches inclinés : pas de fausse échelle verticale impossible.
  const cabanesWest=[[-41,.6,41],[-43,3.1,38],[-43,5.6,34.5],[-40.8,8,33.3]];
  const cabanesEast=[[-24,.6,34],[-23.8,3.2,30.4],[-26,6.1,27.5],[-30.2,10,27.3]];
  stairs(cabanesWest,1.3,true,true);stairs(cabanesEast,1.3,true,true);
  // Petits repos hors de toute superposition de niveaux.
  for(const p of[...cabanesWest.slice(1,-1),...cabanesEast.slice(1,-1)]){
   cylinder(add(p,[0,-.20,0]),p,.78,.78,cabanesWood,16);platforms.push({x:p[0],y:p[1],z:p[2],r:.70});
   for(const side of[-1,1])cabanesRod([p[0]+side*.47,-.4,p[2]],add(p,[side*.47,-.2,0]),.085,cabanesBark,6);
  }
  ropeBridge([[-38.4,8,31.2],[-33.6,10,28.8]],1.3,{sag:.018});
  ropeBridge([[-30.5,10,29.3],[-28.7,12,33.4]],1.3,{sag:.018});
  ropeBridge([[-30.3,12,35],[-33.7,12,35]],1.3,{sag:0});
  // Transit bas : la faible flèche maintient le tablier au-dessus de SEA=.22.
  ropeBridge([[-25,.6,40.5],[-29,.6,47.5]],1.3,{sag:.018});
  ropeBridge([[-35,.6,48.3],[-40,.6,44]],1.3,{sag:.018});

  // Ponton NE : plancher au-dessus de l'eau, abri laissant le passage central.
  const cabanesDockA=[-19.5,.65,29],cabanesDockB=[-23,.65,34],cabanesDelta=sub(cabanesDockB,cabanesDockA);
  const cabanesRot=Math.atan2(cabanesDelta[0],cabanesDelta[2]),cabanesLen=Math.hypot(cabanesDelta[0],cabanesDelta[2]);
  const cabanesDockP=(side,t,h)=>{const p=add(cabanesDockA,mul(cabanesDelta,t));return[p[0]+side*Math.cos(cabanesRot),h,p[2]-side*Math.sin(cabanesRot)];};
  for(let i=0;i<28;i++)box(cabanesDockP(0,(i+.5)/28,.55),[1.8,.20,cabanesLen/28+.012],tint(cabanesWood,i%3===0?1.05:1),cabanesRot);
  for(const t of[.04,.36,.68,.96])for(const side of[-1,1]){
   const p=cabanesDockP(side*.85,t,-1);cylinder(p,cabanesDockP(side*.85,t,.91),.095,.08,cabanesBark,8);
  }
  stairDefs.push({points:[cabanesDockA,cabanesDockB],width:1.8});
  for(const t of[.45,.73])for(const side of[-1,1]){
   const p=cabanesDockP(side*1.08,t,.55);cabanesRod(p,cabanesDockP(side*1.08,t,2.9),.09,cabanesWood,8);
   terraces.push({x:p[0],y:.65,z:p[2],w:.18,d:.18,rot:0,round:true});
  }
  for(const side of[-1,1])for(let row=0;row<4;row++){
   const a=row/4,b=(row+1)/4,P=(u,t)=>cabanesDockP(side*u*1.32,t,3.75-u*.85+.05*Math.sin(u*PI));
   cabanesFace(P(a,.39),P(a,.79),P(b,.79),P(b,.39),tint(cabanesWood,.92+row*.04),[0,1,0]);
  }
  cabanesRod(cabanesDockP(0,.39,3.76),cabanesDockP(0,.79,3.76),.085,cabanesBark,6);
  function cabanesCanoe(x,z,rot){
   const P=p=>transform(p,[x,.18,z],rot),n=16;
   for(let i=0;i<n;i++){
    const a=i/n*TAU,b=(i+1)/n*TAU,A=[Math.sin(a)*.32,.04,Math.cos(a)*1.24],B=[Math.sin(b)*.32,.04,Math.cos(b)*1.24];
    cabanesFace(P(A),P(B),P([B[0]*.58,-.23,B[2]*.80]),P([A[0]*.58,-.23,A[2]*.80]),cabanesBark,sub(P([Math.sin(a),0,Math.cos(a)]),P([0,0,0])));
    tri(P([0,-.17,0]),P([A[0]*.85,-.10,A[2]*.85]),P([B[0]*.85,-.10,B[2]*.85]),cabanesWood);
    cabanesRod(P(A),P(B),.035,cabanesLight,5);
   }
   for(const zz of[-.5,.45])box(P([0,-.015,zz]),[.48,.07,.16],cabanesWood,rot);
  }
  cabanesCanoe(-19.8,33,.1);cabanesCanoe(-19.5,35.5,.1);cabanesCanoe(-21,38.8,-.4);
  // Passe 9b. Toute la géométrie et les déclarations de marche 9a restent au-dessus.
  const cabanesIvory=color(0xf3e6d0),cabanesMint=color(0x5e9c8f),cabanesRoof=color(0xd3a460);
  const cabanesLeaf=[color(0x4f7f45),color(0x6fa35a),color(0x8fbf6b)];
  const cabanesModels=[];
  function cabanesCount(name,budget,draw){const first=triangles;draw();const count=triangles-first;if(count>budget)throw Error(name+' : '+count+' > '+budget);cabanesModels.push({name,triangles:count});}
  // Une couleur exacte par boule, normales lissées, aucun appel aléatoire.
  function cabanesOrb(p,size,col,n=10){
   const rings=[[-1,0],[-.55,.85],[.2,1],[.8,.60],[1,0]];
   const P=(j,i)=>[p[0]+Math.cos(i/n*TAU)*rings[j][1]*size[0],p[1]+rings[j][0]*size[1],p[2]+Math.sin(i/n*TAU)*rings[j][1]*size[2]];
   const N=(j,i)=>norm([(P(j,i)[0]-p[0])/(size[0]*size[0]),(P(j,i)[1]-p[1])/(size[1]*size[1]),(P(j,i)[2]-p[2])/(size[2]*size[2])]);
   for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
    if(rings[j][1]>0)tri(P(j,i),P(j+1,i+1),P(j,i+1),col,[N(j,i),N(j+1,i+1),N(j,i+1)]);
    if(rings[j+1][1]>0)tri(P(j,i),P(j+1,i),P(j+1,i+1),col,[N(j,i),N(j+1,i),N(j+1,i+1)]);
   }
  }
  for(const t of cabanesTrees)cabanesCount('canopee',1500-308,()=>{
   for(const [dx,dy,dz,s,c] of[[-1.2,-.9,0,1,0],[1.15,-.6,.1,1,1],[0,.6,-.65,1.08,1],[0,1.5,.2,.80,2],[0,-.5,1.2,.83,1]])
    cabanesOrb([t.x+dx,t.top+dy,t.z+dz],[2.25*s,1.60*s,2.05*s],cabanesLeaf[c],12);
  });
  function cabanesSoftBox(P,w,d,h,col){
   const r=Math.min(.13,w*.2,d*.2),outline=[[-w/2+r,-d/2],[w/2-r,-d/2],[w/2,-d/2+r],[w/2,d/2-r],[w/2-r,d/2],[-w/2+r,d/2],[-w/2,d/2-r],[-w/2,-d/2+r]];
   const rows=[[0,.94],[Math.min(.08,h*.2),1],[h-Math.min(.08,h*.2),1],[h,.94]],Q=(j,i)=>P([outline[i%8][0]*rows[j][1],rows[j][0],outline[i%8][1]*rows[j][1]]);
   for(let j=0;j<3;j++)for(let i=0;i<8;i++)quad(Q(j,i),Q(j+1,i),Q(j+1,i+1),Q(j,i+1),col);
   for(let i=0;i<8;i++)tri(P([0,h,0]),Q(3,i+1),Q(3,i),col);
  }
  function cabanesPane(P,w,h){
   cabanesFace(P([-w/2,0,0]),P([w/2,0,0]),P([w/2,h,0]),P([-w/2,h,0]),color(0x9cbfc6),sub(P([0,0,1]),P([0,0,0])));
   for(const x of[-w/2,0,w/2])cabanesRod(P([x,0,.035]),P([x,h,.035]),.035,cabanesIvory,4);
   for(const y of[0,h*.5,h])cabanesRod(P([-w/2,y,.035]),P([w/2,y,.035]),.035,cabanesIvory,4);
  }
  function cabanesDoor(P,w,h){
   const a=[[-w/2,0],[w/2,0],[w/2,h-w/2]];
   for(let i=1;i<=5;i++){const t=i/5*PI;a.push([Math.cos(t)*w/2,h-w/2+Math.sin(t)*w/2]);}
   for(let i=0;i<a.length;i++){
    const j=(i+1)%a.length,A=P([0,h*.45,0]),B=P([...a[i],0]),C=P([...a[j],0]);
    if(dot(cross(sub(B,A),sub(C,A)),sub(P([0,0,1]),P([0,0,0])))<0)tri(A,C,B,cabanesMint);else tri(A,B,C,cabanesMint);
    cabanesRod(P([...a[i],.04]),P([...a[j],.04]),.05,cabanesIvory,4);
   }
   cabanesOrb(P([w*.28,h*.43,.065]),[.045,.045,.045],cabanesRoof,4);
  }
  function cabanesHut(x,y,z,w,d,h,front=1,ladder=false){
   cabanesCount(ladder?'cabane-perchee':'cabane-sol',800,()=>{
    const P=p=>add([x,y,z],p),F=p=>P([p[0],p[1],front*(d/2+.027+p[2])]);
    cabanesSoftBox(P,w,d,h,cabanesWood);
    terraces.push({x,y,z,w,d,rot:0});
    // Planches et couvre-joints arrondis sur les quatre façades.
    for(const side of[-1,1]){
     for(const xx of[-w*.36,0,w*.36])cabanesRod(P([xx,.12,side*(d/2+.015)]),P([xx,h-.08,side*(d/2+.015)]),.028,cabanesRoof,4);
     cabanesRod(P([side*(w/2+.018),.2,-d*.36]),P([side*(w/2+.018),.2,d*.36]),.055,cabanesBark,4);
    }
    const half=w/2+.25,depth=d/2+.22,rise=half*.65;
    const R=(side,t,zz)=>P([side*half*t,h+rise*(1-t)+.14*Math.sin(PI*t)+.07*(1-(zz/depth)**2),zz]);
    for(const side of[-1,1])for(let row=0;row<4;row++)for(let j=0;j<3;j++){
     const a=-depth+j*depth*2/3,b=a+depth*2/3;cabanesFace(R(side,row/4,a),R(side,row/4,b),R(side,(row+1)/4,b),R(side,(row+1)/4,a),tint(cabanesRoof,.94+row*.025),[side,.7,0]);
    }
    for(const zz of[-d/2,d/2]){
     const shape=[P([-w/2,h,zz]),P([w/2,h,zz])];
     for(let j=0;j<=8;j++){const xx=w/2-j*w/8;shape.push(R(xx<0?-1:1,Math.abs(xx)/half,zz));}
     for(let j=0;j<shape.length;j++){const a=P([0,h+.1,zz]),b=shape[j],c=shape[(j+1)%shape.length];if(zz<0)tri(a,c,b,cabanesWood);else tri(a,b,c,cabanesWood);}
    }
    for(const zz of[-depth,depth])for(const side of[-1,1])cabanesRod(R(side,0,zz),R(side,1,zz),.075,cabanesRoof,5);
    cabanesRod(R(1,0,-depth),R(1,0,depth),.08,cabanesBark,5);
    cabanesDoor(q=>F([q[0],q[1]+.02,q[2]]),Math.min(.85,w*.6),h*.82);
    cabanesPane(q=>P([w/2+.025+q[2],q[1]+.8,q[0]]),Math.min(.65,d*.6),.62);
    // Échelle décorative : projection entièrement dans l'emprise de la cabane.
    if(ladder){const xx=-w/2-.06;
     for(const zz of[-.22,.22])cabanesRod(P([xx,-2.7,zz]),P([xx,.35,zz]),.035,cabanesIvory,4);
     for(let j=0;j<24;j++)cabanesRod(P([xx,-2.6+j*.12,-.22]),P([xx,-2.6+j*.12,.22]),.025,cabanesWood,4);
    }
   });
  }
  // Secteurs libres des plateformes, raccords et centres de contrôle conservés.
  const cabanesHomes=[[-41.3,8,30.8,1.3,1.15,1.8,1,true],[-32,10,30,1.3,1.15,1.8,-1,true],[-27.35,12,36.3,1.35,1.15,1.8,-1,true],[-23, .6,37.5,1.9,1.7,1.95,-1,false],[-32.7,.6,50,1.8,1.1,1.85,-1,false]];
  for(const a of cabanesHomes){
   if(a[8]){cabanesSoftBox(q=>add([a[0],a[1]-.22,a[2]],q),a[3]+.12,a[4]+.12,.22,cabanesBark);}
   cabanesHut(...a);
  }
  // Bourrelets sur les garde-corps existants, sans toucher leurs ouvertures.
  for(const t of cabanesTrees)for(let i=0;i<32;i+=2){
   const a=i/32*TAU,mid=a+PI/32,open=t.ports.some(p=>Math.abs(Math.atan2(Math.sin(Math.atan2(p[1]-t.z,p[0]-t.x)-mid),Math.cos(Math.atan2(p[1]-t.z,p[0]-t.x)-mid)))<.49);
   if(!open)cabanesOrb([t.x+Math.cos(a)*2.4,t.deck+.86,t.z+Math.sin(a)*2.4],[.10,.10,.10],cabanesWood,6);
  }
  function cabanesPalm(x,y,z,h=2.7){
   cabanesCount('palmier',250,()=>{
    cabanesRod([x,y,z],[x+.16,y+h,z],.12,cabanesWood,8);
    for(let i=0;i<7;i++){
     const a=i/7*TAU,dx=Math.cos(a),dz=Math.sin(a),p=[x+.16,y+h,z],q=[p[0]+dx*.65,y+h+.18,p[2]+dz*.65],r=[p[0]+dx*1.15,y+h-.42,p[2]+dz*1.15],u=[q[0]-dz*.19,q[1],q[2]+dx*.19],v=[q[0]+dz*.19,q[1],q[2]-dx*.19];
     tri(p,u,r,cabanesLeaf[1]);tri(p,r,u,cabanesLeaf[1]);tri(p,r,v,cabanesLeaf[2]);tri(p,v,r,cabanesLeaf[2]);
    }
    cabanesOrb([x+.16,y+h-.10,z],[.20,.18,.20],cabanesRoof,6);
   });
  }
  for(const a of[[-42.5,.6,42.5,3],[-39.7,.6,43,2.4],[-30.2,.6,49.8,2.7],[-25.4,.6,37.4,2.5]])cabanesPalm(...a);
  function cabanesDome(x,y,z,r=.42){
   cabanesOrb([x,y+.30,z],[r,.30,r*.85],cabanesLeaf[1],10);
   cabanesOrb([x+.16,y+.36,z],[r*.63,.24,r*.64],cabanesLeaf[2],8);
  }
  for(const a of[[-43,.6,43.5],[-40.4,.6,40.5],[-34.4,.6,49.8],[-30.1,.6,48.8],[-25.6,.6,36.5],[-22.6,.6,39.6]])cabanesDome(...a);
  for(const [x,y,z,s] of[[-43.4,.6,42,.42],[-42.8,.6,44,.38],[-35.3,.6,49,.40],[-30,.6,50,.45],[-22.5,.6,39.5,.40],[-25.6,.6,36,.42],[-36.3,0,38.6,.65],[-33.1,0,39,.58]])cabanesOrb([x,y+s*.42,z],[s,s*.52,s*.8],cabanesGranite,10);
  function cabanesLantern(x,y,z){
   cabanesSoftBox(p=>add([x,y,z],p),.19,.17,.24,color(0xf3cc77));
   for(const dx of[-.10,.10])for(const dz of[-.09,.09])cabanesRod([x+dx,y,z+dz],[x+dx,y+.26,z+dz],.016,cabanesBark,4);
   cabanesOrb([x,y+.29,z],[.15,.07,.13],cabanesBark,8);
   cabanesRod([x,y+.3,z],[x,y+.43,z],.018,cabanesBark,4);
  }
  for(const a of[[-41.95,9.2,31.35],[-31.35,11.2,29.45],[-26.68,13.2,35.74],[-23.91,1.85,36.64],[-31.83,1.8,49.42]])cabanesLantern(...a);
  // Abri et pirogues 9a conservés : seulement deux lanternes sous l'égout.
  for(const side of[-1,1]){const p=cabanesDockP(side*.95,.45,2.30);cabanesLantern(...p);}
  function cabanesBasket(x,y,z){
   cabanesOrb([x,y+.18,z],[.23,.18,.21],cabanesRoof,10);
   for(let i=0;i<10;i++){const a=i/10*TAU,b=(i+1)/10*TAU;cabanesRod([x+Math.cos(a)*.20,y+.30,z+Math.sin(a)*.18],[x+Math.cos(b)*.20,y+.30,z+Math.sin(b)*.18],.025,cabanesIvory,4);}
   cabanesOrb([x,y+.31,z],[.14,.065,.13],cabanesLeaf[2],6);
  }
  for(const a of[[-24.4,.6,37.7],[-31.4,.6,50.3],[-42,.6,43.4]])cabanesBasket(...a);
  // Cordages au sol, loin de l'axe du ponton et des contrôles de départ.
  for(const [x,z] of[[-22.25,34.6],[-42,43.8]])for(let r=0;r<3;r++)for(let i=0;i<16;i++){
   const a=i/16*TAU,b=(i+1)/16*TAU,R=.13+r*.035;cabanesRod([x+R*Math.cos(a),.63,z+R*Math.sin(a)],[x+R*Math.cos(b),.63,z+R*Math.sin(b)],.014,cabanesRope,4);
  }

 }finally{seed=cabanesPreviousSeed;}
}

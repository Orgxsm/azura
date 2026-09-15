// Île aux Cabanes — passe 9a, base 00a9a68. Relief et accès uniquement.
// Centre [-32,38], enveloppe x [-46,-18], z [24,52]. Mer y=0.
// Registre proposé (Claude) : id cabanes, center [-32,38], r 14,
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
 }finally{seed=cabanesPreviousSeed;}
}

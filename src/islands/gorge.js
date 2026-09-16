// Village de la Gorge — passe 10a, base b73f090 : relief et accès uniquement.
// Centre [0,42], enveloppe x [-14,14], z [28,56]. Nord = -Z.
// Proposition registre (Claude) : id:'gorge', center:[0,42], r:14,
// spawn:[6,31.5], landing:[6,31.5],
// dock:{x:6,y:.65,z:29,heading:Math.PI,len:2,width:1.8,build:false,via:[[6,25]]}.
// Rivière / chute / canal : aucune eau ajoutée ; profils détaillés dans PASSE-10A.md.
{
 const gorgePreviousSeed=seed;seed=104200;
 try{
  const gorgeStone=color(0xcbbda3),gorgePaving=color(0xdfd1b5),gorgeBed=color(0xa69e89),gorgeWood=color(0xc58b4e);
  function gorgeFace(a,b,c,d,col,n){if(dot(cross(sub(b,a),sub(c,a)),n)<0)quad(d,c,b,a,col);else quad(a,b,c,d,col);}
  function gorgeBedY(z){return z<=32?-.45:(z<=34?-.45+(z-32)*.725:1+(z-34)*5/21);}
  function gorgeInner(z){return 2.15+.18*Math.sin((z-28)*.42);}
  function gorgeOuter(z){return 11.8+1.2*Math.sin((z-29)/26*PI);}
  function gorgeTop(x,z){
   let h=z<34?.65:z<41?3:z<48?6:9;
   if(x<5.2){const path=z<=32?.65:z<37?.65+(z-32)*2.35/5:z<39?3:z<44?3+(z-39)*3/5:z<46?6:z<51?6+(z-46)*3/5:9;
    h=Math.min(h,path);}
   return h;
  }
  // Deux versants séparés : jamais de disque plein sous la gorge.
  for(const side of[-1,1]){
   const zs=[29,30,31,32,32.8,33,33.9,34,34.5,34.8,35,36,37,38,39,40,40.9,41,42,43,44,45,46,47,47.9,48,49,50,51,52,53,54,55];
   const xs=[0,.12,.25,.34,.52,.75,1];
   const P=(i,j)=>{const z=zs[j],x=gorgeInner(z)+(gorgeOuter(z)-gorgeInner(z))*xs[i];const h=gorgeTop(x,z);return[side*x,side===1&&i===0&&z>=32.8&&z<=34.5?Math.min(h,1.05):h,z];};
   for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++)gorgeFace(P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1),gorgePaving,[0,1,0]);
   for(let j=0;j<zs.length-1;j++){
    const a=P(0,j),b=P(0,j+1),c=P(xs.length-1,j),d=P(xs.length-1,j+1);
    // Falaises internes évasées : fond de chenal de 3 m de large.
    gorgeFace([side*1.5,gorgeBedY(a[2]),a[2]],[side*1.5,gorgeBedY(b[2]),b[2]],b,a,tint(gorgeStone,.94+.025*(j%3)),[-side,.1,0]);
    gorgeFace(c,d,[d[0]*1.015,-.9,d[2]],[c[0]*1.015,-.9,c[2]],tint(gorgeStone,.94+.025*(j%4)),[side,0,0]);
   }
   for(const j of[0,zs.length-1])for(let i=0;i<xs.length-1;i++){
    const a=P(i,j),b=P(i+1,j);gorgeFace(a,b,[b[0],-.9,b[2]],[a[0],-.9,a[2]],gorgeStone,[0,0,j===0?-1:1]);
   }
   // Six réserves planes pour les groupes de maisons de 10b.
   for(const [y,z] of[[3,38],[6,45],[9,52]]){
    platforms.push({x:side*8,y,z,r:2.5});
    // Pierre sèche : joints décalés, blocs légèrement chanfreinés.
    for(let row=0;row<5;row++)for(let i=0;i<7;i++){
     const x=5.6+i*1.03+(row%2)*.17;
     gorgeBlock(side*x,y-2.65+row*.5,z-4.0,.98,.46,.24,tint(gorgeStone,.90+.045*((i+row)%4)));
    }
   }
   const route=[[side*3.7,.65,32],[side*3.7,3,37],[side*3.7,3,39],[side*3.7,6,44],[side*3.7,6,46],[side*3.7,9,51],[side*3.7,9,52]];
   stairs(route,1.5,false,true);
   for(const [y,z] of[[3,38],[6,45],[9,52]])stairs([[side*3.7,y,z],[side*6,y,z]],1.5,false,false);
  }
  // Lit minéral continu, aucun tablier bas en travers de l'embouchure.
  for(let j=0;j<54;j++){
   const a=28+j*.5,b=a+.5;
   gorgeFace([-1.5,gorgeBedY(a),a],[1.5,gorgeBedY(a),a],[1.5,gorgeBedY(b),b],[-1.5,gorgeBedY(b),b],gorgeBed,[0,1,0]);
  }
  ropeBridge([[-3.7,9,52],[3.7,9,52]],1.5,{sag:.055});
  // Socle du moulin en aval côté est. Ne bouche pas le chenal central.
  gorgeBlock(3.3,.30,31.5,2.8,.70,3.0,gorgePaving);
  platforms.push({x:3.3,y:.65,z:31.5,r:1.25});
  // Canal d'amenée sur la berge est : fond y=1.1, ouvert aux deux bouts.
  // Départ rivière [1.5,1.1,34.5] → roue future [2.15,1.1,32.8].
  const gorgeCanal=[[1.5,1.1,34.5],[2.15,1.1,34.5],[2.15,1.1,32.8]];
  for(let i=1;i<gorgeCanal.length;i++){
   const a=gorgeCanal[i-1],b=gorgeCanal[i],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz),nx=-dz/L,nz=dx/L;
   const P=(p,s,h)=>[p[0]+nx*s,h,p[2]+nz*s];
   gorgeFace(P(a,-.22,1.1),P(b,-.22,1.1),P(b,.22,1.1),P(a,.22,1.1),gorgeBed,[0,1,0]);
   for(const s of(i===1?[]:[-1,1])){const aa=P(a,s*.30,1.18),bb=P(b,s*.30,1.18);beam(aa,bb,.10,gorgeStone);}
  }
  // Débarcadère nord vers Azura, rendu ici (build:false dans le registre).
  for(let i=0;i<18;i++)box([6,.55,28.15+i*.22],[1.8,.20,.225],tint(gorgeWood,.95+(i%3)*.04));
  for(const z of[28.3,29.9,31.5])for(const x of[5.18,6.82])cylinder([x,-1,z],[x,.92,z],.10,.085,gorgeWood,8);
  stairDefs.push({points:[[6,.65,28.15],[6,.65,31.9]],width:1.8});
  stairs([[6,.65,31.5],[3.7,.65,32]],1.5,false,false);
  function gorgeBlock(x,y,z,w,h,d,col){
   const r=Math.min(.08,w*.15,d*.2),o=[[-w/2+r,-d/2],[w/2-r,-d/2],[w/2,-d/2+r],[w/2,d/2-r],[w/2-r,d/2],[-w/2+r,d/2],[-w/2,d/2-r],[-w/2,-d/2+r]];
   for(let i=0;i<8;i++){const a=o[i],b=o[(i+1)%8];gorgeFace([x+a[0],y-h/2,z+a[1]],[x+b[0],y-h/2,z+b[1]],[x+b[0],y+h/2,z+b[1]],[x+a[0],y+h/2,z+a[1]],col,[a[0]+b[0],0,a[1]+b[1]]);tri([x,y+h/2,z],[x+b[0],y+h/2,z+b[1]],[x+a[0],y+h/2,z+a[1]],col);}
  }
 }finally{seed=gorgePreviousSeed;}
}

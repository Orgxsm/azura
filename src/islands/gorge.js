// Village de la Gorge — passe 10b, base fb6e1ac : habillage, accès 10a conservés.
var waterwheelMesh=null; // local à l’IIFE du jeu ; rotation / drawList : Claude.
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
    function gorgeSoftLathe(pos,profile,col,n=12,scale=[1,1,1]) {
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
    function gorgeCosyBall(pos,size,col,n=8) {
      gorgeSoftLathe(pos,n<=6?[[-1,0],[0,1],[.65,.75],[.82,0]]:[[-1,0],[-.65,.76],[0,1],[.64,.78],[.82,.42],[.82,0]],col,n,size);
    }
    // Tube lissé sans bouchons : raccords masqués dans les montants/rives.
    function gorgeCosyRod(a,b,r,col,n=6) {
      const axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
      const N=i=>add(mul(u,Math.cos(i/n*TAU)),mul(v,Math.sin(i/n*TAU)));
      for(let i=0;i<n;i++){
        const na=N(i),nb=N(i+1),aa=add(a,mul(na,r)),ab=add(a,mul(nb,r)),ba=add(b,mul(na,r)),bb=add(b,mul(nb,r));
        tri(aa,ba,bb,col,[na,na,nb]);tri(aa,bb,ab,col,[na,nb,nb]);
      }
    }
    // Rectangle arrondi extrudé : trois points par coin, bourrelet haut et bas.
    function gorgeCushion(P,w,d,h,col,small=false) {
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
  const gorgeCream=color(0xf3e6d0),gorgeTimber=color(0x8f5f3a),gorgeSlate=color(0xe8925c),gorgeMint=color(0x5e9c8f),gorgePane=color(0x94bdc4);
  const gorgeModelCounts=[];
  function gorgeMeasured(name,budget,draw){const n=triangles;draw();const count=triangles-n;if(count>budget)throw Error(name+' : '+count+' triangles > '+budget);gorgeModelCounts.push({name,triangles:count});}
  function gorgeRod(P,a,b,r=.045,col=gorgeTimber,n=4){gorgeCosyRod(P(a),P(b),r,col,n);}
  // Petits carreaux et cadres épais, indépendants du toit et de la collision.
  function gorgeCasement(P,w=.66,h=.82){
   gorgeFace(P([-w/2,0,0]),P([w/2,0,0]),P([w/2,h,0]),P([-w/2,h,0]),gorgePane,sub(P([0,0,1]),P([0,0,0])));
   for(const x of[-w/2,w/2])gorgeRod(P,[x,0,.03],[x,h,.03],.045,gorgeCream);
   for(const y of[0,h])gorgeRod(P,[-w/2,y,.03],[w/2,y,.03],.045,gorgeCream);
   for(const x of[-w/6,w/6])gorgeRod(P,[x,0,.04],[x,h,.04],.019,gorgeCream);
   gorgeRod(P,[-w/2,h*.5,.04],[w/2,h*.5,.04],.022,gorgeCream);
  }
  function gorgeDoorway(P,w=.85,h=1.8){
   const a=[[-w/2,0],[w/2,0],[w/2,h-w/2]];
   for(let i=1;i<=5;i++){const t=i/5*PI;a.push([Math.cos(t)*w/2,h-w/2+Math.sin(t)*w/2]);}
   for(let i=0;i<a.length;i++){
    const j=(i+1)%a.length,A=P([0,h*.45,0]),B=P([...a[i],0]),C=P([...a[j],0]);
    if(dot(cross(sub(B,A),sub(C,A)),sub(P([0,0,1]),P([0,0,0])))<0)tri(A,C,B,gorgeMint);else tri(A,B,C,gorgeMint);
    gorgeRod(P,[...a[i],.04],[...a[j],.04],.065,gorgeCream);
   }
   gorgeCosyBall(P([w*.25,h*.45,.07]),[.045,.045,.045],gorgeWood,4);
  }
  // Maison à gable nord/sud, volume chanfreiné, couverture à 45 degrés.
  // Une emprise unique par corps, séparée des débords de toit.
  function gorgeTudor(x,y,z,w,d,h,opts={}){
   const P=q=>add([x,y,z],q),front=opts.front??-1;
   gorgeCushion(P,w,d,h,gorgeCream);
   terraces.push({x,y,z,w,d,rot:0});
   const half=w/2+.30,depth=d/2+.28,rise=half*Math.tan(42*PI/180);
   const roofP=(side,t,zz)=>P([side*t*half,h+rise*(1-t)+.09*Math.sin(t*PI),zz]);
   for(const side of[-1,1])for(let row=0;row<4;row++)gorgeFace(roofP(side,row/4,-depth),roofP(side,row/4,depth),roofP(side,(row+1)/4,depth),roofP(side,(row+1)/4,-depth),tint(gorgeSlate,.92+row*.035),[side,.7,0]);
   for(const zz of[-d/2,d/2]){
    const outline=[P([-w/2,h,zz]),P([w/2,h,zz])];
    for(let j=0;j<=8;j++){const xx=w/2-j*w/8;outline.push(roofP(xx<0?-1:1,Math.abs(xx)/half,zz));}
    for(let j=0;j<outline.length;j++){const a=P([0,h+.1,zz]),b=outline[j],c=outline[(j+1)%outline.length];if(zz<0)tri(a,c,b,gorgeCream);else tri(a,b,c,gorgeCream);}
    for(const side of[-1,1])gorgeRod(P,[side*w*.27,h+.05,zz],[0,h+rise*.70,zz],.055);
    if(h>2.8)gorgeRod(P,[0,h*.53,zz],[0,h,zz],.06);
    if(h>3)for(const side of[-1,1])gorgeRod(P,[side*.34,h*.55,zz],[side*-.34,h-.10,zz],.055);
    gorgeRod(P,[-w/2,h,zz],[0,h+rise-.22,zz],.065);
    gorgeRod(P,[0,h+rise-.22,zz],[w/2,h,zz],.065);
    gorgeRod(P,[0,h,zz],[0,h+rise-.22,zz],.045);
   }
   for(const zz of[-depth,depth])for(const side of[-1,1])gorgeRod(P,[0,h+rise,zz],[side*half,h,zz],.075,gorgeSlate,5);
   gorgeRod(P,[0,h+rise,-depth],[0,h+rise,depth],.09,gorgeSlate,5);
   // Poteaux d'angle et sablières en bois chaud, légèrement saillants.
   for(const xx of[-w/2+.07,w/2-.07])for(const zz of[-d/2+.035,d/2-.035])gorgeRod(P,[xx,.08,zz],[xx,h,zz],.06);
   for(const yy of[.14,h*.53,h-.04])for(const zz of[-d/2-.01,d/2+.01])gorgeRod(P,[-w/2+.04,yy,zz],[w/2-.04,yy,zz],.055);
   for(const side of[-1,1])gorgeRod(P,[side*w/2,.2,-d/2+.1],[side*w/2,h*.5,d/2-.1],.052);
   const F=q=>P([q[0],q[1],front*(d/2+.025+q[2])]);
   gorgeDoorway(q=>F([q[0]-(w>2.5?w*.20:0),q[1]+.04,q[2]]),Math.min(.9,w*.55),Math.min(1.85,h*.82));
   if(h>3){for(const xx of[-w*.25,w*.25])gorgeCasement(q=>F([q[0]+xx,q[1]+h*.64,q[2]]),.62,.82);}
   else gorgeCasement(q=>P([w/2+.028+q[2],q[1]+.8,q[0]]),.60,.70);
   if(w>2.5)gorgeCasement(q=>F([q[0]+w*.29,q[1]+.85,q[2]]),.62,.82);
   // Cheminée à huit pans et bonnet large, dans l'emprise du bâtiment.
   const ch=P([w*.25,h+rise*.55,d*.23]);
   cylinder(ch,add(ch,[0,.90,0]),.17,.16,gorgePaving,8);
   cylinder(add(ch,[0,.80,0]),add(ch,[0,.96,0]),.24,.22,gorgeCream,8);
   // Jardinière et pompons sur la façade principale.
   if(w>2.5){gorgeRod(F,[w*.29-.36,.78,.13],[w*.29+.36,.78,.13],.09,gorgeWood,4);
    for(let j=0;j<3;j++)gorgeCosyBall(F([w*.29-.22+j*.22,.86,.14]),[.09,.10,.09],color(j===1?0xe5a575:0xd9736f),4);}
  }

  // Maisons en retrait des promenades et des liaisons transversales.
  const gorgeHomes=[];
  for(const side of[-1,1]){
   for(const [x,y,z,w,d,h] of[[7.5,3,35.9,2.6,2,3.2],[10,3,39.8,2.5,1.8,2.6],[8,6,42.8,2.8,2,3.3],[8,9,49.7,2.8,2,3.2]]){
    gorgeMeasured('maison',1200,()=>{
     gorgeTudor(side*x,y,z,w,d,h);
     // Lucarne compacte, face nord, dans la projection du bâtiment.
     const P=q=>add([side*x+w*.37,y+h+.50,z],[-q[2],q[1],q[0]]);
     gorgeCushion(P,.66,.55,.55,gorgeCream);
     gorgeCasement(q=>P([q[0],q[1]+.06,-.29-q[2]]),.42,.40);
     for(const s of[-1,1])gorgeFace(P([0,.88,-.40]),P([0,.88,.35]),P([s*.45,.52,.35]),P([s*.45,.52,-.40]),gorgeSlate,[s,1,0]);
     // Balcon peint sous la fenêtre latérale, hors du couloir central.
     const xx=side*x+w/2+.18,zz=z;
     gorgeBlock(xx,y+1.1,zz,.40,.13,1.2,gorgeMint);
     for(const dz of[-.5,0,.5])gorgeCosyRod([xx+.15,y+1.15,zz+dz],[xx+.15,y+1.65,zz+dz],.045,gorgeMint,4);
     gorgeCosyRod([xx+.15,y+1.62,zz-.56],[xx+.15,y+1.62,zz+.56],.05,gorgeMint,4);
    });gorgeHomes.push([side*x,y,z,w,d]);
   }
  }
  // Moulin décalé vers le nord-ouest pour libérer la diagonale du débarquement.
  gorgeBlock(2.7,.28,29.75,2.16,.74,2.26,gorgeStone);
  gorgeMeasured('moulin',1200,()=>gorgeTudor(2.7,.65,29.75,2.1,2.2,2.4,{front:1}));
  // Complément du canal existant, acheminement à la roue côté ouest.
  gorgeFace([1.93,1.1,31.8],[2.37,1.1,31.8],[2.37,1.1,32.8],[1.93,1.1,32.8],gorgeBed,[0,1,0]);
  // Coude ouvert et déversoir vers l'aube, sans modifier le canal 10a.
  gorgeFace([1.93,1.1,31.45],[2.37,1.1,31.45],[2.37,1.1,31.8],[1.93,1.1,31.8],gorgeBed,[0,1,0]);
  gorgeFace([1.27,1.1,31.23],[2.15,1.1,31.23],[2.15,1.1,31.67],[1.27,1.1,31.67],gorgeBed,[0,1,0]);
  gorgeFace([1.05,1.1,31.10],[1.49,1.1,31.10],[1.49,1.1,31.45],[1.05,1.1,31.45],gorgeBed,[0,1,0]);
  // Pierres en saillie sur les grandes faces externes, sans changer les sols.
  for(const side of[-1,1])for(let z=30;z<55;z+=1.1){
   const outer=gorgeOuter(z)*1.005,top=gorgeTop(outer,z);
   for(let y=.25;y<top-.25;y+=.55)gorgeBlock(side*outer,y,z,.30,.48,.95,tint(gorgeStone,.87+.04*((Math.floor(z+y*2))%4)));
  }
  function gorgeOak(x,y,z){gorgeMeasured('chene',250,()=>{
   cylinder([x,y,z],[x+.1,y+1.45,z],.22,.16,gorgeTimber,7);
   for(const [dx,yy,r,c] of[[-.3,1.7,.8,0x4f7f45],[.3,2.1,.85,0x6fa35a],[0,2.6,.6,0x8fbf6b]])gorgeCosyBall([x+dx,y+yy,z],[r,.65,r],color(c),8);
  });}
  for(const a of[[-11,3,35.9],[11,6,43],[-11,9,53.9],[11,9,53.9]])gorgeOak(...a);
  function gorgePalm(x,y,z){gorgeMeasured('palmier',250,()=>{
   cylinder([x,y,z],[x+.12,y+2.4,z],.15,.10,gorgeWood,7);
   for(let j=0;j<7;j++){const a=j/7*TAU,dx=Math.cos(a),dz=Math.sin(a),p=[x+.12,y+2.4,z],q=[x+.12+dx*.65,y+2.65,z+dz*.65],r=[x+.12+dx*1.25,y+2.1,z+dz*1.25];
    const u=add(q,[-dz*.18,0,dx*.18]),v=add(q,[dz*.18,0,-dx*.18]);
    tri(p,u,r,color(0x6fa35a));tri(p,r,u,color(0x6fa35a));tri(p,r,v,color(0x8fbf6b));tri(p,v,r,color(0x8fbf6b));}
  });}
  for(const a of[[-9,.65,31],[9,.65,31],[11,6,46.3]])gorgePalm(...a);
  function gorgeLavender(x,y,z){
   gorgeCosyBall([x,y+.32,z],[.42,.36,.36],color(0x6fa35a),6);
   for(let j=0;j<5;j++){const a=j/5*TAU;gorgeCosyBall([x+Math.cos(a)*.22,y+.57,z+Math.sin(a)*.22],[.07,.14,.07],color(0xb6a0d1),4);}
  }
  for(const a of[[-6,3,35],[6,3,35],[-11.5,3,39.8],[11.5,3,39.8],[-6,6,42],[6,6,42],[-6,9,49],[6,9,49],[-10,9,54],[10,9,54]])gorgeLavender(...a);
  function gorgeKeg(x,y,z){gorgeSoftLathe([x,y,z],[[0,.20],[.1,.25],[.4,.27],[.58,.23],[.60,0]],gorgeWood,8);for(const h of[.13,.44])cylinder([x,y+h,z],[x,y+h+.055,z],.26,.26,gorgeTimber,8);}
  for(const a of[[-9.3,3,35],[9.3,3,35],[-10,6,42],[10,6,42],[-10,9,50],[10,9,50],[4.7,.65,30.5]])gorgeKeg(...a);
  function gorgeLantern(x,y,z){gorgeCushion(p=>add([x,y,z],p),.18,.16,.25,color(0xf3cc77));for(const dx of[-.10,.10])for(const dz of[-.09,.09])gorgeCosyRod([x+dx,y,z+dz],[x+dx,y+.28,z+dz],.018,gorgeTimber,4);gorgeCosyBall([x,y+.30,z],[.15,.08,.13],gorgeTimber,6);}
  for(const [x,y,z,w,d] of gorgeHomes)gorgeLantern(x-w*.32,y+1.8,z-d/2-.12);
  gorgeLantern(3.55,2.25,30.90);
  // Maillage dynamique local, axe X ; os 0 au centre [0,0,0].
  // Préservation impérative de la géométrie statique avant rig()/meshDyn().
  const gorgeStaticVerts=verts,gorgeStaticTriangles=triangles;
  try{
   const data=rig([[0,()=>{
    const n=24;
    for(const xx of[-.22,.22])for(let i=0;i<n;i++){
     const a=i/n*TAU,b=(i+1)/n*TAU;
     gorgeCosyRod([xx,Math.cos(a)*1.35,Math.sin(a)*1.35],[xx,Math.cos(b)*1.35,Math.sin(b)*1.35],.08,gorgeWood,6);
    }
    for(let i=0;i<12;i++){
     const a=i/12*TAU,c=Math.cos(a),s=Math.sin(a);
     for(const xx of[-.22,.22])gorgeCosyRod([xx,0,0],[xx,c*1.30,s*1.30],.055,gorgeTimber,4);
     // Chaque aube est un parallélépipède orienté radialement, diamètre 3 m.
     const P=(x,r,t)=>[x,c*r-s*t,s*r+c*t],A=P(-.30,1.32,-.15),B=P(.30,1.32,-.15),C=P(.30,1.50,-.15),D=P(-.30,1.50,-.15),E=P(-.30,1.32,.15),F=P(.30,1.32,.15),G=P(.30,1.50,.15),H=P(-.30,1.50,.15);
     quad(A,B,C,D,gorgeWood);quad(H,G,F,E,gorgeWood);quad(D,C,G,H,gorgeWood);quad(E,F,B,A,gorgeWood);quad(A,D,H,E,gorgeWood);quad(B,F,G,C,gorgeWood);
    }
    cylinder([-.40,0,0],[.40,0,0],.17,.17,gorgeTimber,10);
   }]]);
   waterwheelMesh=meshDyn(data);
  }finally{verts=gorgeStaticVerts;triangles=gorgeStaticTriangles;}

 }finally{seed=gorgePreviousSeed;}
}

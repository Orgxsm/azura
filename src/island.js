// Passe 6 — base 61be508. Remplacements locaux à Azura ; APIs publiques intactes.
// Construire d'abord l'objet historique conserve le flux rnd() et ses registres.
// Le filtre des escaliers décide sur les emprises historiques, avant substitution.
const azuraCosy = (()=>{
 const changes=[],stats=[];
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

 function turret(x,y,z,r,h,withRoof){
  softLathe([x,y,z],[[0,r],[.15,r],[h*.48,r*.97],[h-.15,r*.90],[h,r*.90]],ivory,20);
  cosyOpening(p=>[x+p[0],y+p[1],z+r+.025+p[2]],1,1.9,sage,true);
  for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2]){
   const P=q=>transform(q,[x+Math.sin(a)*(r+.025),y+h*.68,z+Math.cos(a)*(r+.025)],a);
   cosyOpening(P,.38,.65,color(0x91bec5));
  }
  softLathe([x,y+h-.15,z],[[0,r*.91],[.10,r*1.035],[.16,r*1.035]],ivory,20);
  if(withRoof){
   softLathe([x,y+h,z],[[0,r+.28],[.12,r+.30],[.32,r+.18],[r*.55,r*.58],[r*.72,.15],[r*.78,0]],tileCosy,20);
   cosyBall([x,y+h+r*.72+.15,z],[.13,.18,.13],honey,8);
  }else for(let j=0;j<10;j++){const a=j/10*TAU;cosyBall([x+Math.sin(a)*r*.86,y+h+.20,z+Math.cos(a)*r*.86],[.22,.27,.21],ivory,6);}
 }
 function foliage(kind,a){
  const [x,y,z,h,v]=a,start=triangles;
  if(kind==='shrub'){
   cosyBall([x,y+h*.22,z],[h*.65,h*.38,h*.55],color(0x6fa35a),8);
   cosyBall([x+h*.28,y+h*.30,z],[h*.37,h*.30,h*.36],color(0x8fbf6b),8);
  }else{
   const r=kind==='palm'?v*.86:Math.min(v*.78,1.12),height=kind==='palm'?h*.77:h;
   cylinder([x,y,z],[x+.08,y+height*.55,z],.22,.15,honey,7);
   for(const [yy,rr,cc] of [[.54,1,0x4f7f45],[.76,.82,0x6fa35a],[.95,.58,0x8fbf6b]])
    cosyBall([x,y+height*yy,z],[r*rr,height*.23,r*rr*.86],color(cc),8);
   stats.push({kind:'arbre',triangles:triangles-start});
  }
 }
 function remember(kind,args,start,end){
  const old=verts,nt=triangles,keepSeed=seed;
  const data=old.slice(start,end),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<data.length;i+=9)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],data[i+k]);hi[k]=Math.max(hi[k],data[i+k]);}
  verts=[];triangles=0;
  try{
   if(kind==='home')home(...args);
   else if(kind==='tower')turret(...args);
   else if(kind==='rock'){
    // Les surfaces géométriques restent exactes : coquillages et marche sur
    // les affleurements inchangés. Le lissage fait lire les volumes en galets.
    for(let i=0;i<data.length;i+=9){
     const n=norm([0,1,2].map(k=>(data[i+k]-(lo[k]+hi[k])/2)/Math.max(.001,((hi[k]-lo[k])/2)**2)));
     data.splice(i+3,3,...n);data.splice(i+6,3,...color(0xd8c7a6));
    }
    verts=data;triangles=data.length/27;
   }else{
    foliage(kind,args);
    // Inscrire le nouveau feuillage dans l'enveloppe ancienne : pas d'arbre
    // réintroduit par une canopée rétrécie dans le filtrage du parcours.
    for(let i=0;i<verts.length;i+=9)for(const k of[0,2])verts[i+k]=Math.max(lo[k],Math.min(hi[k],verts[i+k]));
   }
   changes.push({start,end,data:verts,kind});
  }finally{verts=old;triangles=nt;seed=keepSeed;}
 }
 return {active:true,retained:[],remember,changes,stats,softLathe,cosyBall,cosyRod,cushion};
})();
function azuraHome(...a){const start=verts.length,c=chimneys.length;house(...a);azuraCosy.remember('home',[...a,chimneys.slice(c)],start,verts.length);}
function azuraTower(...a){const start=verts.length;tower(...a);azuraCosy.remember('tower',a,start,verts.length);}

// Dégagement des escaliers : enregistrer les objets décoratifs complets,
// puis retirer ceux dont l'emprise rencontre le passage + 0.4 m de chaque côté.
// Les massifs tiers, socles et marches restent intacts. L'aléa est consommé même
// pour les objets retirés : le reste du village conserve sa disposition.
const azuraDecorRecords=[];
function azuraRecordDecor(fn,args){
 const start=verts.length;fn(...args);const end=verts.length;
 if(start===end)return;
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=start;i<end;i+=9)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],verts[i+k]);hi[k]=Math.max(hi[k],verts[i+k]);}
 azuraDecorRecords.push({start,end,lo,hi});
 const kind=fn===rock?'rock':fn===tree?'tree':fn===palm?'palm':fn===shrub?'shrub':null;
 if(kind&&azuraCosy.active)azuraCosy.remember(kind,args,start,end);
}
function azuraDecor_rock(...a){azuraRecordDecor(rock,a);}
function azuraDecor_tree(...a){azuraRecordDecor(tree,a);}
function azuraDecor_palm(...a){azuraRecordDecor(palm,a);}
function azuraDecor_shrub(...a){azuraRecordDecor(shrub,a);}
function azuraDecor_grass(...a){azuraRecordDecor(grass,a);}
// island.js — L'île d'Azura : relief, maisons, tours, escaliers, ponton, végétation, socles, terrasses pavées.
// Propriétaire : DESIGN (GPT-6 Astra). Contrat : tout ce qui doit être praticable passe par stairs(...), platforms[] et terraces[] (voir COLLAB.md).
// A terraced granite island with a sheltered beach opening toward the south.
ellipsoid([0,-.25,-1.3],[12.6,1.15,11.4],palette.sand,48,12,.04);
ellipsoid([0,-.02,7.8],[6.8,.46,5.1],palette.sand,32,8,.04);
const tiers=[{x:0,y:.9,z:-2.2,sx:10.5,sy:2.45,sz:6.4},{x:.5,y:3.7,z:-4.8,sx:8.2,sy:2.7,sz:5.2},{x:.7,y:6.9,z:-6.6,sx:5.9,sy:3.1,sz:4},{x:1.1,y:10.3,z:-7.5,sx:3.5,sy:3.3,sz:2.9}];
for(let t of tiers){rock(t.x,t.y,t.z,t.sx,t.sy,t.sz);}
// Irregular vertical rock stacks, readable individually rather than a smooth mound.
for(let i=0;i<68;i++){let a=range(0,TAU),r=range(.68,1),x=Math.cos(a)*10*r,z=-2+Math.sin(a)*7.2*r;let h=.4+4.5*Math.max(0,1-Math.abs(x)/12)*Math.max(0,(-z+5)/13);if(z>3&&Math.abs(x)<5)continue;let s=range(.7,1.7);azuraDecor_rock(x,h*.48,z,s,1+h*.6,s*.87);if(rnd()>.5)patch(x,h+1,z,s*.8,s*.7);}
// Tall exposed cliff on the eastern flank.
for(let i=0;i<9;i++){let x=6.6+range(-.7,1.7),z=-6+i*1.04;azuraDecor_rock(x,3.5,z,range(1,1.8),range(3.5,5.1),1.5);}
// Shore granite stacks frame the cove.
for(let side of[-1,1])for(let i=0;i<11;i++){let x=side*range(5.8,9.6),z=range(5.3,11.8),s=range(.65,1.5);azuraDecor_rock(x,.3+s*.55,z,s,s*range(1,1.9),s*.85);}
function local(pos,rot,p){return transform(p,pos,rot);}
// Half-cylinder terracotta tiles over pitched roofs, with individual warm variation.
function roof(pos,w,d,h,rot=0){let P=p=>local(pos,rot,p);let over=.3;let wh=w/2+over,dh=d/2+over;
 for(let side of[-1,1]){quad(P([0,h,-dh]),P([side*wh,0,-dh]),P([side*wh,0,dh]),P([0,h,dh]),tint(palette.tile,.77));
 let rows=Math.ceil(wh/.34),cols=Math.ceil(dh*2/.29);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){let x0=r/rows*wh,x1=(r+1)/rows*wh+.045,z0=-dh+c/cols*dh*2,tw=dh*2/cols;let col=tint(palette.tile,range(.84,1.2));for(let k=0;k<4;k++){let a=k/4*PI,b=(k+1)/4*PI;let zz0=z0+tw*(.5-.5*Math.cos(a)),zz1=z0+tw*(.5-.5*Math.cos(b));let ya=.055*Math.sin(a),yb=.055*Math.sin(b);let q=[P([side*x0,h*(1-x0/wh)+ya+.035,zz0]),P([side*x1,h*(1-x1/wh)+ya+.035,zz0]),P([side*x1,h*(1-x1/wh)+yb+.035,zz1]),P([side*x0,h*(1-x0/wh)+yb+.035,zz1])];if(side===1)q.reverse();quad(...q,col);}}beam(P([side*wh,-.06,-dh]),P([side*wh,-.06,dh]),.09,palette.trim);}
 for(let z=-dh;z<dh;z+=.26)cylinder(P([0,h+.07,z]),P([0,h+.07,z+.25]),.13,.13,tint(palette.tile,1.12),8);
 for(let end of[-1,1])for(let side of[-1,1])beam(P([0,h,end*dh]),P([side*wh,0,end*dh]),.09,palette.wood);
}
function windowAt(pos,w=.48,h=.83,rot=0,shutters=true){box(pos,[w+.17,h+.17,.11],palette.wood,rot);box(local(pos,rot,[0,0,.066]),[w,h,.06],color(0x45616a),rot);for(let x of[-w*.25,w*.25])box(local(pos,rot,[x,0,.11]),[w*.43,h*.92,.035],tint(color(0x8cb6b5),range(.68,1)),rot);box(local(pos,rot,[0,0,.14]),[.048,h,.05],palette.trim,rot);box(local(pos,rot,[0,-.08,.14]),[w,.045,.05],palette.trim,rot);box(local(pos,rot,[0,-h/2-.1,.06]),[w+.27,.13,.26],palette.rockLight,rot);
 if(shutters)for(let side of[-1,1]){let p=local(pos,rot,[side*(w*.78+.09),0,.08]);box(p,[w*.43,h+.08,.1],tint(palette.wood,1.13),rot+side*.18);for(let j=0;j<5;j++)box(local(p,rot,[0,-h*.4+j*h*.19,.06]),[w*.39,.035,.05],palette.trim,rot);}}
function archDoor(p,w,h,rot=0){let P=q=>local(p,rot,q);box(P([0,h*.35,.04]),[w,h*.7,.12],palette.dark,rot);let r=w/2;for(let i=0;i<12;i++){let a=i/12*PI,b=(i+1)/12*PI;tri(P([0,h*.7,.1]),P([Math.cos(b)*r,h*.7+Math.sin(b)*r,.1]),P([Math.cos(a)*r,h*.7+Math.sin(a)*r,.1]),palette.dark);let ro=r+.14;quad(P([Math.cos(a)*r,h*.7+Math.sin(a)*r,.13]),P([Math.cos(b)*r,h*.7+Math.sin(b)*r,.13]),P([Math.cos(b)*ro,h*.7+Math.sin(b)*ro,.13]),P([Math.cos(a)*ro,h*.7+Math.sin(a)*ro,.13]),palette.trim);}
 for(let side of[-1,1])box(P([side*(r+.07),h*.35,.1]),[.14,h*.7,.18],palette.trim,rot);for(let i=0;i<5;i++)box(P([-w*.4+i*w*.2,h*.34,.12]),[.014,h*.63,.03],tint(palette.wood,.62),rot);ellipsoid(P([w*.28,h*.35,.18]),[.045,.045,.045],color(0xcda155),6,4,0);box(P([0,.01,.2]),[w+.45,.15,.58],palette.rockLight,rot);}
function balcony(pos,w,d,rot=0){let P=q=>local(pos,rot,q);for(let i=0;i<Math.ceil(w/.19);i++)box(P([-w/2+i*.19,.01,0]),[.17,.13,d],tint(palette.trim,range(.83,1.2)),rot);for(let x of[-w/2,w/2]){beam(P([x,-1.25,-d/2]),P([x,0,d/2]),.095);beam(P([x,-.1,-d/2]),P([x,-.1,d/2]),.12);}
 for(let i=0;i<=Math.ceil(w/.7);i++){let x=-w/2+i/Math.ceil(w/.7)*w;beam(P([x,0,d/2]),P([x,.78,d/2]),.063);}
 for(let y of[.38,.8]){beam(P([-w/2,y,d/2]),P([w/2,y,d/2]),.05,palette.trim);for(let x of[-w/2,w/2])beam(P([x,y,-d/2]),P([x,y,d/2]),.05,palette.trim);}}
const houseLots=[],chimneys=[],terraces=[],stairDefs=[];
function house(x,y,z,w,d,h,rot=0,wood=false,bal=false){let pos=[x,y,z],P=p=>local(pos,rot,p);houseLots.push([x,z,Math.max(w,d)*.66]);terraces.push({x,y,z,w,d,rot});let wall=wood?tint(palette.trim,.94):tint(palette.wall,range(.94,1.05));
 box(P([0,h/2,0]),[w,h,d],wall,rot);box(P([0,.17,0]),[w+.12,.35,d+.1],palette.rock,rot);
 for(let end of[-1,1])tri(P([-w/2,h,end*d/2]),P([w/2,h,end*d/2]),P([0,h+1.06,end*d/2]),wall);
 for(let side of[-1,1])for(let end of[-1,1])box(P([side*(w/2-.04),h/2,end*(d/2+.035)]),[.13,h,.14],palette.wood,rot);
 for(let yy of[.4,h-.04,...(h>3?[h*.49]:[])])box(P([0,yy,d/2+.075]),[w+.2,.13,.13],palette.trim,rot);
 if(wood)for(let xx=-w/2+.16;xx<w/2;xx+=.25)box(P([xx,h/2,d/2+.022]),[.013,h-.2,.022],tint(palette.wood,.88),rot);
 let front=d/2+.11;archDoor(P([-.35,0,front]),.69,1.48,rot);
 if(h>3){windowAt(P([-w*.25,h*.72,front]),.45,.8,rot);windowAt(P([w*.25,h*.72,front]),.45,.8,rot);windowAt(P([w/2+.08,h*.67,0]),.52,.85,rot+PI/2);if(bal)balcony(P([0,h*.48,d/2+.53]),w+.45,1.23,rot);}
 else{windowAt(P([w*.28,h*.55,front]),.48,.7,rot);windowAt(P([w/2+.08,h*.56,0]),.48,.75,rot+PI/2);}
 roof(P([0,h,0]),w,d,1.12,rot);
 if(rnd()>.25){chimneys.push(P([w*.28,h+1.4,-d*.2]));box(P([w*.28,h+.78,-d*.2]),[.38,1,.4],palette.rockLight,rot);box(P([w*.28,h+1.3,-d*.2]),[.48,.12,.5],palette.trim,rot);}
 for(let i=0;i<7;i++){let xx=range(-w*.44,w*.44),yy=range(.3,h-.3);if(Math.abs(xx+.35)<.5&&yy<1.5)continue;box(P([xx,yy,d/2+.025]),[range(.12,.33),.09,.025],tint(wall,.84),rot);}
}
// Dwellings staggered so roof silhouettes and paths remain readable from the cove.
azuraHome(-6.4,1.1,4.1,3.5,2.9,2.8,-.18,false,true);
balcony([-6.4,1.25,6.14],4.2,1.6,-.18);
azuraHome(5.55,1.25,5.1,2.6,2.8,3.8,-.38,true,true);
azuraHome(-3.65,3.8,.7,2.55,2.7,4.1,.12,false,true);
azuraHome(1.6,3.2,2.3,3.15,2.45,2.45,-.09,false,false);
azuraHome(5.5,5.5,-.35,2.35,2.7,3.1,.27,false,true);
azuraHome(-5.4,5.3,-3.6,2.7,2.35,2.7,-.18,true,true);
azuraHome(-.7,7.3,-3.5,2.65,2.55,3.1,.1,false,true);
azuraHome(4,9,-5.6,2.4,2.2,2.35,.21,false,false);
azuraHome(-2.8,10.1,-6.2,2.1,2.1,2.5,-.19,true,false);
// Round lookout towers, cream render, orange segmented conical tiled roofs.
function tower(x,y,z,r,h,withRoof=true){houseLots.push([x,z,r+1]);terraces.push({x,y,z,w:r*2,d:r*2,rot:0,round:true});cylinder([x,y,z],[x,y+h,z],r,r*.9,palette.wall,20);for(let yy of[.3,h*.47,h-.18])cylinder([x,y+yy,z],[x,y+yy+.16,z],r*1.035,r*1.035,palette.rockLight,20);archDoor([x,y,z+r+.02],r*.66,1.5,0);for(let a of[0,PI/2,PI,-PI/2]){windowAt([x+Math.sin(a)*r*.93,y+h*.72,z+Math.cos(a)*r*.93],.34,.75,a,false);}
 if(withRoof){let rh=r*.72;for(let j=0;j<7;j++){let t=j/7,rr=(r+.3)*(1-t),rn=(r+.3)*(1-(j+1)/7);for(let i=0;i<28;i++){let a=i/28*TAU,b=(i+1)/28*TAU;quad([x+rr*Math.cos(a),y+h+rh*t,z+rr*Math.sin(a)],[x+rn*Math.cos(a),y+h+rh*(j+1)/7,z+rn*Math.sin(a)],[x+rn*Math.cos(b),y+h+rh*(j+1)/7,z+rn*Math.sin(b)],[x+rr*Math.cos(b),y+h+rh*t,z+rr*Math.sin(b)],tint(palette.tile,range(.9,1.17)));}cylinder([x,y+h+rh*t-.025,z],[x,y+h+rh*t+.035,z],rr+.015,rr+.015,tint(palette.tile,.8),28);}cylinder([x,y+h+rh-.02,z],[x,y+h+rh+.3,z],.15,.07,palette.wood,8);}
 else{for(let i=0;i<10;i++){let a=i/10*TAU;box([x+Math.sin(a)*r*.86,y+h+.18,z+Math.cos(a)*r*.86],[.43,.52,.42],palette.wall,a);}}
}
azuraTower(0,1.6,5.25,.91,3.6,true);azuraTower(.8,13.5,-6.8,1.12,4.2,true);azuraTower(-2,5.5,-.65,.82,3.1,false);
// Meandering stairs: solid risers, worn stone treads, rope balustrades.
function stairs(points,width=1.12,wood=false,rail=false){stairDefs.push({points,width});for(let k=0;k<points.length-1;k++){let a=points[k],b=points[k+1],d=sub(b,a),horizontal=Math.hypot(d[0],d[2]),steps=Math.max(2,Math.ceil(Math.abs(d[1])/.19),Math.ceil(horizontal/.34)),rot=Math.atan2(d[0],d[2]);for(let i=0;i<steps;i++){let t=(i+.5)/steps,p=add(a,mul(d,t));box([p[0],p[1]-.13,p[2]],[width,.24,horizontal/steps+.055],tint(wood?palette.trim:palette.rockLight,range(.9,1.1)),rot);box([p[0],p[1]-.36,p[2]],[width*.92,.3,horizontal/steps],tint(palette.rock,.9),rot);}
 if(rail){let side=[Math.cos(rot)*width*.53,0,-Math.sin(rot)*width*.53];for(let sign of[-1,1]){let last=null;for(let i=0;i<=Math.ceil(horizontal/1.1);i++){let t=i/Math.ceil(horizontal/1.1),p=add(add(a,mul(d,t)),mul(side,sign));beam(p,add(p,[0,.8,0]),.058,palette.trim);if(last){let mid=mul(add(last,p),.5);mid[1]+=.65;beam(add(last,[0,.8,0]),mid,.024,color(0xcbba85));beam(mid,add(p,[0,.8,0]),.024,color(0xcbba85));}last=p;}}}}
}
stairs([[1.45,.28,9.2],[1.7,1.1,7.3],[2.9,2.2,5.45],[3.6,3.2,3.5]],1.25,false,true);
stairs([[-1.5,.3,8.4],[-2.25,1.6,5.55],[-1.9,3,3.6],[-1.9,3.8,2.0]],1.05,true,true);
stairs([[3.4,3.2,3.4],[4.3,4.6,1.2],[3.4,5.5,-.9],[1.1,7.3,-1.6]],.95,false,false);
stairs([[-4.9,3.8,3.6],[-6.1,4.3,1.6],[-5.8,4.9,-.4],[-4.6,5.3,-2.1],[-3.3,6.8,-3.1],[-2.5,7.3,-2.3]],.95,false,false);
stairs([[1.1,7.3,-1.6],[1.6,8.5,-3.4],[1.7,10.4,-5.3]],.83,false,true);
// Sun-warmed timber pier and its mooring posts.
function pier(){let x=-4.2,z=10.6;for(let j=0;j<26;j++)box([x,.51,z+j*.22],[1.65,.16,.205],tint(palette.trim,range(.88,1.23)),.1);for(let j=0;j<5;j++)for(let side of[-1,1]){let zz=z+j*1.32;beam([x+side*.88,-.8,zz],[x+side*.88,.98,zz],.11,palette.wood);cylinder([x+side*.88,.74,zz],[x+side*.88,.87,zz],.14,.14,color(0xc5b891),8);}beam([x-.65,.3,z],[x-.65,.3,z+5.7],.13);beam([x+.65,.3,z],[x+.65,.3,z+5.7],.13);}
pier();
// Harbour boat with a curved hull, mast, ropes and a loosely furled sail.
function boat(x,y,z,rot,sail=false){let P=p=>transform(p,[x,y,z],rot);let n=16;let outline=[];for(let i=0;i<n;i++){let a=i/n*TAU;outline.push([Math.sin(a)*.68,0,Math.cos(a)*1.9]);}for(let i=0;i<n;i++){let a=outline[i],b=outline[(i+1)%n];quad(P(a),P(b),P([b[0]*.57,-.51,b[2]*.81]),P([a[0]*.57,-.51,a[2]*.81]),palette.wood);beam(P(a),P(b),.06,palette.trim);tri(P([0,-.2,0]),P([b[0]*.9,-.16,b[2]*.9]),P([a[0]*.9,-.16,a[2]*.9]),tint(palette.wood,.62));}for(let zz of[-1,-.1,.9])box(P([0,-.06,zz]),[1.05,.09,.24],palette.trim,rot);beam(P([0,0,0]),P([0,4.2,0]),.055);beam(P([0,2.9,-1]),P([0,2.9,1.4]),.04);for(let zz of[-1.7,1.7])beam(P([0,0,zz]),P([0,4,0]),.012,color(0xdacb9d));if(sail){let a=P([.05,3.75,.05]),b=P([.05,.5,.05]),c=P([.18,.6,1.48]);tri(a,b,c,color(0xffefd1));tri(c,b,a,color(0xffefd1));}}
// Pots, barrels, shutters, low stone garden walls, and little coastal details.
function pot(x,y,z,s=.3,green=true){cylinder([x,y,z],[x,y+s*.95,z],s*.6,s,palette.tile,10);cylinder([x,y+s*.9,z],[x,y+s*1.08,z],s*1.1,s*1.1,tint(palette.tile,1.18),12);cylinder([x,y+s*1.08,z],[x,y+s*1.1,z],s*.8,s*.8,palette.dark,10);if(green)azuraDecor_shrub(x,y+s,z,s*1.5);}
function barrel(x,y,z,s=.3){ellipsoid([x,y+s*.8,z],[s,s*.8,s],palette.trim,12,6,.015);for(let h of[.3,1.15])cylinder([x,y+s*h,z],[x,y+s*(h+.12),z],s*.98,s*.98,color(0x575f57),12);cylinder([x,y+s*1.58,z],[x,y+s*1.65,z],s*.78,s*.78,palette.wood,12);}
function shrub(x,y,z,s=1){for(let i=0;i<5;i++){let a=range(0,TAU),r=range(0,s*.55);ellipsoid([x+Math.cos(a)*r,y+range(.1,s*.4),z+Math.sin(a)*r],[s*range(.4,.7),s*range(.3,.5),s*range(.4,.65)],tint(palette.leaf,range(.72,1.2)),8,5,.19);}}
for(let p of[[-5.1,1.1,5.7],[-7.6,1.1,5.5],[4.45,1.25,6.3],[.9,3.2,4.1],[-2.5,3.8,2.2],[5,5.5,1.1],[-1.8,7.3,-1.5],[1.7,13.5,-5.9]]){pot(...p,.22,true);barrel(p[0]+.6,p[1],p[2]-.2,.25);}
for(let i=0;i<22;i++){let a=i/22*TAU;let x=-5.7+Math.cos(a)*2.5,z=-2+Math.sin(a)*1.4;box([x,4.7,z],[.5,.55,.43],tint(palette.rockLight,range(.9,1)),a);}
// Palms use bent trunks and individually modelled feather leaves.
function palm(x,y,z,h,scale=1){const lean=range(-.5,.5),leanZ=range(-.35,.35);let top=[x+lean,y+h,z+leanZ];for(let j=0;j<12;j++){let t=j/12,tt=(j+1)/12;let a=[x+lean*t*t,y+h*t,z+leanZ*t*t],b=[x+lean*tt*tt,y+h*tt,z+leanZ*tt*tt];cylinder(a,b,(.15-.065*t)*scale,(.15-.065*tt)*scale,tint(palette.trim,range(.83,1.08)),8);cylinder(b,add(b,[0,.037,0]),(.15-.065*tt)*scale*1.15,(.15-.065*tt)*scale*1.15,tint(palette.wood,1.25),8);}
 for(let j=0;j<10;j++){let a=j/10*TAU+range(-.18,.18),length=range(1.7,2.6)*scale,lift=range(.35,.95),col=tint(palette.leafLight,range(.75,1.13));let center=t=>[top[0]+Math.cos(a)*length*t,top[1]+Math.sin(t*PI)*lift-t*t*.9*scale,top[2]+Math.sin(a)*length*t];let prev=center(0);for(let k=1;k<=12;k++){let t=k/12,p=center(t),width=Math.sin(t*PI)*.55*scale;let left=add(p,[-Math.sin(a)*width,-.07,Math.cos(a)*width]),right=add(p,[Math.sin(a)*width,-.07,-Math.cos(a)*width]);let pp=center((k-1)/12),pw=Math.sin((k-1)/12*PI)*.55*scale;let pl=add(pp,[-Math.sin(a)*pw,-.06,Math.cos(a)*pw]),pr=add(pp,[Math.sin(a)*pw,-.06,-Math.cos(a)*pw]);quad(pp,p,left,pl,col);quad(pp,pr,right,p,tint(col,.87));if(k%2===0){beam(p,left,.012,tint(col,.78));beam(p,right,.012,tint(col,.78));}prev=p;}beam(top,center(.75),.018,tint(col,.8));}
 for(let i=0;i<3;i++)ellipsoid(add(top,[range(-.17,.17),-.14,range(-.17,.17)]),[.13,.16,.13],color(0x78753a),7,5,.1);
}
for(let p of[[-8.1,2,4.4,5.7,1.1],[8.2,1.6,5.5,5.6,1.05],[-8.5,3.5,-3.5,5.8,1.2],[6.7,7,-5.6,5,1],[-2.8,12.1,-7.8,5,1.05],[3.8,12,-8.1,4.7,1],[-10,.5,.7,3.4,.8],[8.4,.8,-2,4.5,.85],[-6.1,.4,8.7,3.7,.8]])azuraDecor_palm(...p);
// Umbrella-shaped coastal trees: many clustered leaves create soft, lush silhouettes.
function tree(x,y,z,h,r){beam([x,y,z],[x+.15,y+h,z],.13);for(let j=0;j<4;j++){let a=j/4*TAU;beam([x,y+h*.6,z],[x+Math.cos(a)*r*.6,y+h*.91,z+Math.sin(a)*r*.6],.06);}
 for(let j=0;j<14;j++){let a=range(0,TAU),rr=range(.1,r*.85),cx=x+Math.cos(a)*rr,cz=z+Math.sin(a)*rr,cy=y+h+range(-.2,.35);let s=range(.36,.67)*r;ellipsoid([cx,cy,cz],[s,s*.52,s*.85],tint(palette.leaf,range(.73,1.2)),9,5,.13);for(let k=0;k<3;k++)ellipsoid([cx+range(-s,s)*.55,cy+s*.35,cz+range(-s,s)*.55],[s*.38,s*.18,s*.33],tint(palette.leafLight,range(.82,1.11)),6,4,.15);}}
for(let p of[[-7.9,3.7,1.1,2.9,1.7],[6.6,3.3,3.1,2.7,1.5],[-5.6,7.6,-5.5,2.2,1.8],[4.8,8.8,-3.5,2.3,1.5],[-.5,12.2,-8.5,1.8,1.8],[1.3,8.8,-7.5,2.2,1.7],[-8.4,1,-.9,2.8,1.3],[7.8,1,7.8,2,1.2],[-4,1,7.1,1.8,1.0]])azuraDecor_tree(...p);
// Dense planting along ledges, with gaps reserved for architecture and paths.
const plantPatches=[[-7,2.5,2,1.3],[-8.3,2.8,-1,1],[-6.5,5,-1.6,1],[-4.7,7.4,-4.6,1.2],[-3.4,8.4,-5.4,1],[1.8,10.8,-6.6,1.1],[4.6,10.7,-6.9,.9],[5.6,7.7,-3.9,1.1],[7.6,5.5,-1.7,1.3],[5,4.4,2.7,.8],[3.4,1.1,6.8,.7],[-3.8,.7,6.8,.65],[6.4,.7,8.1,.8],[-6.2,.6,8.2,.7],[0,4,1,.65],[1.7,6.7,-.8,.7],[-1.8,10.5,-5.4,.7]];
for(let p of plantPatches){azuraDecor_shrub(...p);for(let j=0;j<3;j++)azuraDecor_shrub(p[0]+range(-.8,.8),p[1]+range(-.3,.1),p[2]+range(-.65,.65),p[3]*.55);}
function grass(x,y,z,s){for(let j=0;j<7;j++){let a=range(0,TAU),h=range(.3,.7)*s,w=.06*s,b=[x+Math.cos(a)*.35*s,y+h,z+Math.sin(a)*.35*s];let c=tint(palette.leafLight,range(.8,1.2));tri([x-w,y,z],[x+w,y,z],b,c);tri(b,[x+w,y,z],[x-w,y,z],c);}}
for(let p of plantPatches)for(let i=0;i<4;i++)azuraDecor_grass(p[0]+range(-1,1),p[1]-.13,p[2]+range(-.9,.9),.7);
// Sand pebbles and a few tiny sunlit flowers.
for(let i=0;i<50;i++){let x=range(-5.4,5.4),z=range(8.3,11.2);if(x>1&&x<2.9)continue;let s=range(.035,.16);ellipsoid([x,.3,z],[s,s*.64,s*.85],tint(palette.rock,range(.75,1.12)),6,4,.2);}
for(let p of plantPatches)for(let j=0;j<5;j++){let x=p[0]+range(-.6,.6),z=p[2]+range(-.6,.6),y=p[1]+.26;beam([x,y-.3,z],[x,y,z],.012,palette.leaf);ellipsoid([x,y,z],[.055,.035,.055],j%2?color(0xffdf69):color(0xfffaf0),5,3,0);}
// Smaller granite outcrops and hanging shrubs break up the large geological masses.
for(let t of tiers){for(let i=0;i<21;i++){let a=range(0,TAU),r=range(.60,.96),xx=t.x+Math.cos(a)*t.sx*r,zz=t.z+Math.sin(a)*t.sz*r,yy=t.y+t.sy*Math.sqrt(1-r*r);if(houseLots.some(h=>Math.hypot(xx-h[0],zz-h[1])<h[2]+.2))continue;let ss=range(.55,1.15);azuraDecor_rock(xx,yy-.35,zz,ss,ss*1.3,ss*.9);azuraDecor_shrub(xx,yy+ss*.55,zz,ss*.9);}}
for(let p of [[-1.8,11.6,-6.7,1.2],[2.5,13,-7.1,1.1],[-3.8,9.8,-5.5,1.2],[4.7,9,-5.9,1.2],[1.2,7.8,-3.5,1],[-6.7,5.8,-3.8,1.2],[6.8,6.4,-2.8,1.1],[-6.3,3.2,1.6,1],[-.7,3.8,2,.8],[3.8,3.9,.7,1]])azuraDecor_shrub(...p);
// Socles de pierre sous chaque maison et tour, et terrasses pavées reliant escaliers et maisons.
for(const t of terraces)box([t.x,t.y-1.1,t.z],[t.w+.6,2.2,t.d+.6],tint(palette.rockLight,.96),t.rot);
const platforms=[{x:3.5,y:3.2,z:3.5,r:1},{x:-3.3,y:3.8,z:2.9,r:1.9},{x:-.6,y:7.3,z:-1.5,r:2.2},{x:1.7,y:10.4,z:-5.3,r:1.5}];
for(const p of platforms){cylinder([p.x,p.y-2.6,p.z],[p.x,p.y,p.z],p.r,p.r,tint(palette.rockLight,.92),24);cylinder([p.x,p.y-.02,p.z],[p.x,p.y+.01,p.z],p.r-.12,p.r-.12,tint(palette.rock,1.08),24);for(let i=0;i<10;i++){const a=i/10*TAU;ellipsoid([p.x+Math.cos(a)*p.r*range(.2,.8),p.y+.005,p.z+Math.sin(a)*p.r*range(.2,.8)],[range(.18,.3),.012,range(.15,.26)],tint(palette.rockLight,range(.85,1)),8,3,.1);}}
// (les îles supplémentaires de src/islands/*.js sont assemblées ici, avant scene_end.js)

// Filtrage en une passe avant la clôture statique. Aucun trou découpé au milieu
// d'un rocher : l'objet entier disparaît, ses voisins et le relief restent fermés.
{
 const omit=new Uint8Array(verts.length/9);
 for(const d of azuraDecorRecords){
  let hit=false;
  for(const stair of stairDefs){
   for(let k=1;k<stair.points.length&&!hit;k++){
    const a=stair.points[k-1],b=stair.points[k],len=Math.hypot(b[0]-a[0],b[2]-a[2]);
    const n=Math.max(1,Math.ceil(len/.08)),margin=stair.width/2+.44;
    for(let j=0;j<=n;j++){
     const t=j/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
     if(x>=d.lo[0]-margin&&x<=d.hi[0]+margin&&z>=d.lo[2]-margin&&z<=d.hi[2]+margin&&d.hi[1]>y-.08&&d.lo[1]<y+2.3){hit=true;break;}
    }
   }
   if(hit)break;
  }
  d.removed=hit;if(hit)omit.fill(1,d.start/9,d.end/9);
 }
 const replacement=new Map(azuraCosy.changes.map(c=>[c.start,c]));
 const clean=[];for(let i=0;i<verts.length;){
  const c=replacement.get(i);
  if(c){if(!omit[i/9]){for(const v of c.data)clean.push(v);azuraCosy.retained.push({kind:c.kind,triangles:c.data.length/27});}i=c.end;}
  else{if(!omit[i/9])for(let k=0;k<9;k++)clean.push(verts[i+k]);i+=9;}
 }
 triangles-=(verts.length-clean.length)/27;verts=clean;
}

// Libérer les buffers temporaires et désactiver la substitution pour les îles suivantes.
azuraCosy.changes.length=0;azuraCosy.active=false;
// Quatre détails d'accueil, placés hors des disques gameplay et des passages.
// Hauteurs relevées sur la géométrie CPU de 61be508 ; aucun nouveau registre.
{
 const previousSeed=seed,miel=color(0xc58b4e),cream=color(0xf3e6d0),rose=color(0xd9736f),sage=color(0x5e9c8f);
 const {softLathe,cosyBall,cosyRod,cushion}=azuraCosy;
 try{
  const P=q=>add([-3.2,.337,9.4],q);
  for(const x of[-.50,.50]){cylinder(P([x,-.055,0]),P([x,1.70,0]),.045,.035,miel,6);cosyBall(P([x,1.73,0]),[.065,.075,.065],rose,6);}
  cushion(q=>P([q[0],q[1]+.85,q[2]]),1.04,.10,.30,miel);
  const font={A:['010','101','111','101','101'],Z:['111','001','010','100','111'],U:['101','101','101','101','111'],R:['110','101','110','101','101']};
  for(let c=0;c<5;c++)for(let j=0;j<5;j++)for(let k=0;k<3;k++)if(font['AZURA'[c]][j][k]==='1'){
   const x=-.38+c*.16+k*.04,y=1.105-j*.04;
   quad(P([x,y,.057]),P([x+.04,y,.057]),P([x+.04,y-.04,.057]),P([x,y-.04,.057]),color(0x8f5f3a));
  }
  const cord=t=>P([t-.5,1.7-.13*Math.sin(t*Math.PI),0]);
  for(let i=0;i<8;i++)cosyRod(cord(i/8),cord((i+1)/8),.012,miel,5);
  for(let i=0;i<4;i++){const q=cord((i+1)/5);tri(add(q,[-.08,-.025,.01]),add(q,[.08,-.025,.01]),add(q,[0,-.23,.025]),i%2?sage:rose);}
  // Table au pied de la montée du village ; son plateau reste hors du passage.
  const C=q=>add([-3.6,.625,5.4],q);
  cylinder(C([0,-.04,0]),C([0,.52,0]),.09,.055,miel,8);
  softLathe(C([0,.54,0]),[[-.035,.24],[0,.28],[.04,.28],[.05,0]],miel,10);
  for(const x of[-.1,.1])softLathe(C([x,.59,0]),[[0,.03],[.07,.045],[.08,.04]],cream,6);
  // Casier à poissons en lattes, sur le sable entre les deux départs d'escalier.
  const K=q=>add([-.4,.405,9.4],q);
  box(K([0,.025,0]),[.48,.06,.32],miel);
  for(const side of[-1,1])for(let j=0;j<3;j++){
   box(K([0,.11+j*.08,side*.15]),[.48,.045,.035],miel);
   if(j===0)box(K([side*.225,.19,0]),[.035,.28,.32],miel);
  }
  for(let j=0;j<3;j++)cosyBall(K([-.12+j*.12,.13,0]),[.09,.035,.05],color(0x8eb8ad),6);
 }finally{seed=previousSeed;}
}

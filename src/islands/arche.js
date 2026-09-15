// Île de l'Arche — passe 8b, base 4602158. Tudor, grès, végétation et baie.
// Centre (32,36), enveloppe x [18,46], z [22,50]. Y = mètres, mer 0.
// Registre existant, conservé : id arche, center [32,36], r 14,
// spawn [20.5,26], landing [20.5,26],
// dock {x:19.8,y:.6,z:24.4,heading:Math.atan2(-.7,-1.6),len:2.5,width:1.6,build:false}.
// Ponton déjà construit ici : ne pas générer un deuxième ponton.
// Chenal géométrique : x [29,35], z [30.5,43], garde >=7.79 m à la voûte.
// Carte de hauteur monocouche : Claude gère la navigation sous la voûte.
// Ne pas bloquer toute sa projection : le plateau supérieur doit rester marchable.
{
 const archeSeed=seed;seed=323608;
 try {
  const stone=color(0xd8b98d),light=color(0xe4cba3),sand=color(0xebddb4),wood=color(0xc58b4e);
  // Faces orientées explicitement : intrados visible depuis le chenal.
  function face(a,b,c,d,col,n){
   if(dot(cross(sub(b,a),sub(c,a)),n)<0)quad(d,c,b,a,col);else quad(a,b,c,d,col);
  }
  function pad(x,y,z,rx,rz,foot=false){
   const rings=foot?[[-1.5,1.06],[-.1,1.04],[y-.20,1],[y,.91]]:[[y-.35,1],[y-.08,1],[y,.94]];
   const N=32;
   const P=(k,i)=>{const a=i/N*TAU,r=rings[k][1]*(1+.025*Math.sin(a*5));return[x+Math.cos(a)*rx*r,rings[k][0],z+Math.sin(a)*rz*r];};
   for(let k=0;k<rings.length-1;k++)for(let i=0;i<N;i++)face(P(k,i),P(k,i+1),P(k+1,i+1),P(k+1,i),k===0?sand:light,[Math.cos(i/N*TAU),0,Math.sin(i/N*TAU)]);
   for(let i=0;i<N;i++)tri([x,y,z],P(rings.length-1,i+1),P(rings.length-1,i),light);
  }
  // Deux rives indépendantes : aucune dalle ni ellipsoïde ne bouche le détroit.
  pad(21,.6,27,2.5,3.25,true);
  pad(43,1,29.5,2.45,4.5,true);
  pad(22,3.2,32,2.8,4.1,true);
  pad(42,3.2,33,2.8,4.2,true);

  // Grès massif traversant : faces avant/arrière, intrados et extrados raccordés.
  // Portée 12 m à y=0, clé à y=9, sommet y=13 (épaisseur 4 m).
  const xs=[20,20.7,21.5,22.5,24,25,26];
  for(let i=1;i<=24;i++)xs.push(26+i*.5);
  xs.push(39,40,41.5,42.5,43.3,44);
  const bottom=x=>x>=26&&x<=38?9*Math.sqrt(Math.max(0,1-((x-32)/6)**2)):-1.5;
  const top=x=>13-Math.max(0,24-x)*.62-Math.max(0,x-40)*.48;
  const layers=[0,.04,.22,.25,.49,.52,.76,.79,.97,1];
  function P(x,t,back){
   const y=bottom(x)+(top(x)-bottom(x))*t;
   // Strates à larges pans, sans grille radiale ni seuil en dents de peigne.
   const shoulder=Math.sin(t*Math.PI)*.28;
   const values=[0,.01,.02,.02,.03,.03,.02,.02,.01,0];
   let k=0;while(k<layers.length-2&&t>layers[k+1])k++;
   const u=(t-layers[k])/(layers[k+1]-layers[k]);
   const strata=values[k]*(1-u)+values[k+1]*u;
   const wave=.20*Math.sin(x*.73)+.10*Math.cos(x*1.27);
   const end=Math.max(0,(Math.abs(x-32)-7)/5);
   const px=x+(x<32?1:-1)*end*(.35*Math.sin(t*Math.PI)+.12*Math.sin(t*TAU));
   return[px,y,(back?42-end*1.8:31)+(back?1:-1)*(wave+shoulder+strata)];
  }
  for(let i=0;i<xs.length-1;i++){
   const a=xs[i],b=xs[i+1];
   for(let k=0;k<layers.length-1;k++)for(const back of[false,true]){
    const t=layers[k],u=layers[k+1],col=tint(stone,.985+.018*Math.sin(a*.48));
    face(P(a,t,back),P(b,t,back),P(b,u,back),P(a,u,back),col,[0,0,back?1:-1]);
   }
   face(P(a,0,false),P(a,0,true),P(b,0,true),P(b,0,false),tint(stone,.94),[0,-1,0]);
   face(P(a,1,false),P(b,1,false),P(b,1,true),P(a,1,true),light,[0,1,0]);
  }
  for(const x of[20,44])for(let k=0;k<layers.length-1;k++)face(P(x,layers[k],false),P(x,layers[k],true),P(x,layers[k+1],true),P(x,layers[k+1],false),stone,[x<32?-1:1,0,0]);

  // Socles bas pour maison de garde et tour, hors de la verticale de l'arche.
  pad(21,4.8,29,2.35,1.65,true);platforms.push({x:21,y:4.8,z:29,r:1.45});
  pad(43,4.8,29,2.35,1.65,true);platforms.push({x:43,y:4.8,z:29,r:1.45});
  // Sommet circulaire contractuel, entièrement inclus dans l'extrados plat.
  platforms.push({x:32,y:13,z:36.5,r:5.2});
  // Réserves 8b : dépendance (25.5,13,38.5), manoir (33,13,38),
  // terrasse avant (32,13,33.4). Aucun bâtiment ni obstacle provisoire.
  const ascent=[[21,4.8,29],[19.15,6.7,31.6],[19.15,9,35],[20.4,11.1,38.5],[24,13,39],[27.5,13,38.5],[29,13,36.5]];
  stairs([[20.5,.6,26],[22.8,2.5,26.8],[21,4.8,29]],1.4,false,true);
  stairs(ascent,1.35,false,true);
  // Petits repos, matérialisés : plateformes ajoutées après island.js.
  for(const [x,y,z] of ascent.slice(1,5)){pad(x,y,z,.78,.78);platforms.push({x,y,z,r:.66});}
  stairs([[43,4.8,29],[44.4,2.9,27.6],[43,1,25.6]],1.3,false,true);

  // Pont 22 m, rendu par le helper partagé ; déclaration de marche unique.
  // Flèche 0,8 m conservée. Le helper ne doit pas ajouter une autre flèche.
  const bridge=[];
  for(let i=0;i<=12;i++){const t=i/12;bridge.push([21+22*t,4+.8*(2*t-1)**2,29]);}
  const bridgeDeck=ropeBridge(bridge,1.4,{sag:0}); // profil 8a déjà affaissé : pas de deuxième flèche

  // Ponton nord-ouest, aligné vers Azura. Garde un intervalle sec avec la rive.
  const dockA=[19.3,.6,23.2],dockB=[20.5,.6,26],delta=sub(dockB,dockA),rot=Math.atan2(delta[0],delta[2]);
  const len=Math.hypot(delta[0],delta[2]),steps=Math.ceil(len/.23);
  for(let i=0;i<steps;i++){const p=add(dockA,mul(delta,(i+.5)/steps));box([p[0],.50,p[2]],[1.6,.2,len/steps+.015],tint(wood,i%3===0?1.04:1),rot);}
  for(const t of[.06,.48,.91])for(const side of[-1,1]){
   const p=add(dockA,mul(delta,t)),x=p[0]+side*.73*Math.cos(rot),z=p[2]-side*.73*Math.sin(rot);
   cylinder([x,-1,z],[x,.87,z],.09,.075,wood,8);
   cylinder([x,.83,z],[x,.93,z],.105,.105,light,8);
  }
  stairDefs.push({points:[dockA,dockB],width:1.6});

  // Passe 8b : helpers locaux, sans effet sur les autres îles.
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
  const cream=color(0xf3e6d0),timber=color(0x8f5f3a),slate=color(0x718398),mint=color(0x5e9c8f),pane=color(0x94bdc4);
  // (Complément local des cordes retiré : util.js applique désormais le signe s aux deux côtés du pont.)
  const modelCounts=[];
  function measured(name,budget,draw){const n=triangles;draw();const count=triangles-n;if(count>budget)throw Error(name+' : '+count+' triangles > '+budget);modelCounts.push({name,triangles:count});}
  function rod(P,a,b,r=.045,col=timber,n=4){cosyRod(P(a),P(b),r,col,n);}
  // Petits carreaux et cadres épais, indépendants du toit et de la collision.
  function casement(P,w=.66,h=.82){
   face(P([-w/2,0,0]),P([w/2,0,0]),P([w/2,h,0]),P([-w/2,h,0]),pane,sub(P([0,0,1]),P([0,0,0])));
   for(const x of[-w/2,w/2])rod(P,[x,0,.03],[x,h,.03],.045,cream);
   for(const y of[0,h])rod(P,[-w/2,y,.03],[w/2,y,.03],.045,cream);
   for(const x of[-w/6,w/6])rod(P,[x,0,.04],[x,h,.04],.019,cream);
   rod(P,[-w/2,h*.5,.04],[w/2,h*.5,.04],.022,cream);
  }
  function doorway(P,w=.85,h=1.8){
   const a=[[-w/2,0],[w/2,0],[w/2,h-w/2]];
   for(let i=1;i<=5;i++){const t=i/5*PI;a.push([Math.cos(t)*w/2,h-w/2+Math.sin(t)*w/2]);}
   for(let i=0;i<a.length;i++){
    const j=(i+1)%a.length,A=P([0,h*.45,0]),B=P([...a[i],0]),C=P([...a[j],0]);
    if(dot(cross(sub(B,A),sub(C,A)),sub(P([0,0,1]),P([0,0,0])))<0)tri(A,C,B,mint);else tri(A,B,C,mint);
    rod(P,[...a[i],.04],[...a[j],.04],.065,cream);
   }
   cosyBall(P([w*.25,h*.45,.07]),[.045,.045,.045],wood,4);
  }
  // Maison à gable nord/sud, volume chanfreiné, couverture à 45 degrés.
  // Une emprise unique par corps, séparée des débords de toit.
  function tudor(x,y,z,w,d,h,opts={}){
   const P=q=>add([x,y,z],q),front=opts.front??-1;
   cushion(P,w,d,h,cream);
   terraces.push({x,y,z,w,d,rot:0});
   const half=w/2+.30,depth=d/2+.28,rise=half;
   const roofP=(side,t,zz)=>P([side*t*half,h+rise*(1-t)+.09*Math.sin(t*PI),zz]);
   for(const side of[-1,1])for(let row=0;row<4;row++)face(roofP(side,row/4,-depth),roofP(side,row/4,depth),roofP(side,(row+1)/4,depth),roofP(side,(row+1)/4,-depth),tint(slate,.92+row*.035),[side,.7,0]);
   for(const zz of[-d/2,d/2]){
    const outline=[P([-w/2,h,zz]),P([w/2,h,zz])];
    for(let j=0;j<=8;j++){const xx=w/2-j*w/8;outline.push(roofP(xx<0?-1:1,Math.abs(xx)/half,zz));}
    for(let j=0;j<outline.length;j++){const a=P([0,h+.1,zz]),b=outline[j],c=outline[(j+1)%outline.length];if(zz<0)tri(a,c,b,cream);else tri(a,b,c,cream);}
    for(const side of[-1,1])rod(P,[side*w*.27,h+.05,zz],[0,h+rise*.70,zz],.055);
    if(h>2.8)rod(P,[0,h*.53,zz],[0,h,zz],.06);
    if(h>3)for(const side of[-1,1])rod(P,[side*.34,h*.55,zz],[side*-.34,h-.10,zz],.055);
    rod(P,[-w/2,h,zz],[0,h+rise-.22,zz],.065);
    rod(P,[0,h+rise-.22,zz],[w/2,h,zz],.065);
    rod(P,[0,h,zz],[0,h+rise-.22,zz],.045);
   }
   for(const zz of[-depth,depth])for(const side of[-1,1])rod(P,[0,h+rise,zz],[side*half,h,zz],.075,slate,5);
   rod(P,[0,h+rise,-depth],[0,h+rise,depth],.09,slate,5);
   // Poteaux d'angle et sablières en bois chaud, légèrement saillants.
   for(const xx of[-w/2+.07,w/2-.07])for(const zz of[-d/2+.035,d/2-.035])rod(P,[xx,.08,zz],[xx,h,zz],.06);
   for(const yy of[.14,h*.53,h-.04])for(const zz of[-d/2-.01,d/2+.01])rod(P,[-w/2+.04,yy,zz],[w/2-.04,yy,zz],.055);
   for(const side of[-1,1])rod(P,[side*w/2,.2,-d/2+.1],[side*w/2,h*.5,d/2-.1],.052);
   const F=q=>P([q[0],q[1],front*(d/2+.025+q[2])]);
   doorway(q=>F([q[0]-(w>2.5?w*.20:0),q[1]+.04,q[2]]),Math.min(.9,w*.55),Math.min(1.85,h*.82));
   if(h>3){for(const xx of[-w*.25,w*.25])casement(q=>F([q[0]+xx,q[1]+h*.64,q[2]]),.62,.82);}
   else casement(q=>P([w/2+.028+q[2],q[1]+.8,q[0]]),.60,.70);
   if(w>2.5)casement(q=>F([q[0]+w*.29,q[1]+.85,q[2]]),.62,.82);
   // Cheminée à huit pans et bonnet large, dans l'emprise du bâtiment.
   const ch=P([w*.25,h+rise*.55,d*.23]);
   cylinder(ch,add(ch,[0,.90,0]),.17,.16,light,8);
   cylinder(add(ch,[0,.80,0]),add(ch,[0,.96,0]),.24,.22,cream,8);
   // Jardinière et pompons sur la façade principale.
   if(w>2.5){rod(F,[w*.29-.36,.78,.13],[w*.29+.36,.78,.13],.09,wood,4);
    for(let j=0;j<3;j++)cosyBall(F([w*.29-.22+j*.22,.86,.14]),[.09,.10,.09],color(j===1?0xe5a575:0xd9736f),4);}
  }
  // Les coordonnées réservées restent des accès ; les corps reculent derrière.
  measured('manoir-deux-corps',1500,()=>{
   tudor(33,13,40,4.2,2.6,3.9);
   tudor(29.7,13,40.45,2.7,2.5,3.0);
  });
  measured('dependance',900,()=>tudor(25.5,13,36.2,2.3,2.5,2.25,{front:1}));
  // Socles complémentaires : pas de modification des plateformes 8a.
  cushion(q=>add([22.5,3.1,30.32],q),1.82,1.1,1.7,stone);
  measured('maison-garde',900,()=>tudor(22.5,4.8,30.32,1.55,.85,2.05));
  cushion(q=>add([41.5,3.0,30.32],q),1.8,1.1,1.8,stone);
  measured('maison-base-droite',900,()=>tudor(41.5,4.8,30.32,1.4,.85,1.9));
  cushion(q=>add([44.7,-.6,33],q),1.3,1.7,3.8,stone);
  measured('maison-basse-droite',900,()=>tudor(44.7,3.2,33,1.0,1.5,1.7));
  measured('tour-garde',900,()=>{
   const x=44.35,z=30.65,y=4.8;
   cylinder([x,3.0,z],[x,y,z],.85,.78,stone,10);
   softLathe([x,y,z],[[0,.70],[.12,.74],[2.6,.63],[2.8,.72]],light,12);
   terraces.push({x,y,z,w:1.5,d:1.5,rot:0,round:true});
   softLathe([x,y+2.8,z],[[0,.96],[.12,1],[1.65,.10],[1.75,0]],slate,12);
   doorway(q=>[x+q[0],y+q[1],z-.705-q[2]],.65,1.5);
   casement(q=>[x+.70+q[2],y+1.75+q[1],z+q[0]],.40,.52);
  });
  // Pavage affleurant, pas de surélévation au point de contrôle (32,13,33.4).
  for(let row=0;row<4;row++)for(let j=0;j<10;j++){
   const x=28.8+j*.65+(row%2)*.18,z=32.3+row*.64;
   cushion(q=>add([x,12.982,z],q),.60,.58,.025,tint(light,.96+((j+row)%3)*.018),true);
  }
  // Petite volée adjacente au parvis ; tous les escaliers 8a restent intacts.
  // Elle sert seulement de bordure sculptée : les marches ne coupent pas l'accès.
  for(let j=0;j<3;j++)cushion(q=>add([36.3,13,33.2+j*.24],q),1.0,.25,.04+j*.055,light,true);
  for(const [a,b] of[[[28,13,31.95],[30.2,13,31.95]],[[33.8,13,31.95],[36.3,13,31.95]]]){
   for(let j=0;j<=4;j++){const p=add(a,mul(sub(b,a),j/4));cosyRod(p,add(p,[0,.52,0]),.07,wood,6);}
   cosyRod(add(a,[0,.46,0]),add(b,[0,.46,0]),.06,wood,6);
  }
  function oak(x,y,z,h=2.8,r=1.2){
   measured('chene',250,()=>{
    cylinder([x,y,z],[x+.13,y+h*.56,z],.20,.14,timber,7);
    for(const [dx,t,s,c] of[[-.28,.65,.8,0x4f7f45],[.25,.78,.85,0x6fa35a],[0,.99,.6,0x8fbf6b]])cosyBall([x+dx,y+h*t,z],[r*s,h*.24,r*s],color(c),8);
   });
  }
  for(const a of[[23.5,top(23.5),33.4,2.5,1],[27.6,13,41,2.6,1.0],[37.7,13,39.7,3,1.15],[38.8,13,34.3,2.5,1]])oak(...a);
  function keg(x,y,z){softLathe([x,y,z],[[0,.22],[.10,.27],[.40,.29],[.59,.25],[.62,.21],[.62,0]],wood,8);for(const h of[.12,.45])cylinder([x,y+h,z],[x,y+h+.055,z],.275,.275,timber,8);}
  for(const a of[[24,13,35],[35.65,13,38.9],[36.25,13,39],[42.4,4.8,30.45],[45,3.2,32.1]])keg(...a);

  // Strates horizontales saillantes : même niveau géologique sur les deux piliers.
  for(const yy of[1.8,3.6,5.4,7.2,9.6,11.3])for(let x=20.8;x<43.2;x+=.8){
   const b=x+.8;if(Math.max(bottom(x),bottom(b))+ .48>yy||Math.min(top(x),top(b))<yy+.5)continue;
   const za=P(x,(yy-bottom(x))/(top(x)-bottom(x)),false)[2],zb=P(b,(yy-bottom(b))/(top(b)-bottom(b)),false)[2];
   // Un large chanfrein sans changement de surface marchable ni du chenal.
   face([x,yy-.10,za+.05],[b,yy-.10,zb+.05],[b,yy+.08,zb-.26],[x,yy+.08,za-.26],stone,[0,0,-1]);
   face([x,yy+.08,za-.26],[b,yy+.08,zb-.26],[b,yy+.36,zb-.20],[x,yy+.36,za-.20],light,[0,0,-1]);
   face([x,yy+.36,za-.20],[b,yy+.36,zb-.20],[b,yy+.48,zb+.06],[x,yy+.48,za+.06],stone,[0,1,0]);
  }
  // Blocs à pans coupés enchâssés, hors des escaliers et du chenal.
  for(const [x,y,z,w,d,h] of[[24.5,1.1,31.6,1.8,1.8,2.2],[25,4.3,31.2,1.5,1.1,1.6],[39.4,1,31.8,1.5,1.8,2.4],[40,6,31.25,1.5,1,2],[43.9,6.3,36,1.6,2.5,3],[43.8,1.2,39,2,2,2.4],[22.2,10.5,32,1.6,1,1.8]])cushion(q=>add([x,y,z],q),w,d,h,tint(stone,1.02));
  // renommé bush -> archeBush par Claude : farm.js déclare aussi bush() et le hoisting Annex B écraserait sa version
  function archeBush(x,y,z,r=.4){cosyBall([x,y+.32,z],[r,.32,r*.85],color(0x6fa35a),8);cosyBall([x+.17,y+.36,z],[r*.65,.29,r*.65],color(0x8fbf6b),6);}
  for(const a of[[24.7,3.3,31.5],[25,5.9,31.2],[40,8,31.2],[39.5,3.4,31.8],[43.9,9.3,36],[38,13,33],[23.5,top(23.5),34.5]])archeBush(...a);
  for(const [x,y,z] of[[24.7,3.3,31.5],[40,8,31.2],[39.5,3.4,31.8]])for(let j=0;j<5;j++){
   const xx=x+(j-2)*.14;tri([xx-.035,y,z],[xx+.035,y,z],[xx+.08,y+.32+(j%2)*.10,z+.04],color(0x6fa35a));
  }
  for(const [x,y,z] of[[24,0,33],[25,0,34],[39.5,0,34],[45,0,36],[44,0,40]]){
   cushion(q=>add([x,y,z],q),1.2,1.3,.75,stone);cosyBall([x+.4,y+.28,z+.3],[.5,.48,.6],light,8);
  }
  function smallPalm(x,y,z){
   measured('palmier',250,()=>{
    cosyRod([x,y,z],[x+.22,y+2.5,z],.10,wood,7);
    for(let i=0;i<7;i++){const a=i/7*TAU,dx=Math.cos(a),dz=Math.sin(a),p=[x+.22,y+2.5,z],q=[p[0]+dx*.65,y+2.7,p[2]+dz*.65],r=[p[0]+dx*1.2,y+2.05,p[2]+dz*1.2];
     const a1=[q[0]-dz*.19,q[1],q[2]+dx*.19],b1=[q[0]+dz*.19,q[1],q[2]-dx*.19];
     tri(p,a1,r,color(0x6fa35a));tri(p,r,a1,color(0x6fa35a));tri(p,r,b1,color(0x8fbf6b));tri(p,b1,r,color(0x8fbf6b));}
   });
  }
  smallPalm(24,0.75,33);smallPalm(44,0.75,40);
  // Voiliers statiques au sud de l'arche ; loin de l'approche NO et du chenal.
  boat(25,.35,46.5,.35,true);boat(39,.35,47,-.4,true);

 }finally{seed=archeSeed;}
}

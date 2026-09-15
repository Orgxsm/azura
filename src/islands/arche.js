// Île de l'Arche — passe 8a, base 599c892. Relief et accès uniquement.
// Centre (32,36), enveloppe x [18,46], z [22,50]. Y = mètres, mer 0.
// Registre à ajouter par Claude : id arche, center [32,36], r 14,
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
   const strata=[0,.04,.10,-.04,.13,-.03,.10,-.03,.02,0][layers.indexOf(t)];
   const wave=.20*Math.sin(x*.73)+.10*Math.cos(x*1.27);
   const end=Math.max(0,(Math.abs(x-32)-7)/5);
   const px=x+(x<32?1:-1)*end*(.35*Math.sin(t*Math.PI)+.12*Math.sin(t*TAU));
   return[px,y,(back?42-end*1.8:31)+(back?1:-1)*(wave+shoulder+strata)];
  }
  for(let i=0;i<xs.length-1;i++){
   const a=xs[i],b=xs[i+1];
   for(let k=0;k<layers.length-1;k++)for(const back of[false,true]){
    const t=layers[k],u=layers[k+1],col=tint(stone,[.95,1,.91,1.02,.93,1,.94,1.03,.98][k]);
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

  // Pont 22 m. Remplacer uniquement cet appel par ropeBridge(...,1.4) en 8b.
  // Flèche 0,8 m ; sous-face des planches/longerons toujours >3 m au centre.
  const bridge=[];
  for(let i=0;i<=12;i++){const t=i/12;bridge.push([21+22*t,4+.8*(2*t-1)**2,29]);}
  stairs(bridge,1.4,true,true);

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
 }finally{seed=archeSeed;}
}

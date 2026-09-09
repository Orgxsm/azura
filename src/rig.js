// rig.js — squelettes et maillages des personnages, animaux, objets (humanoid, chat, mouette, crabe, bateaux, lanternes…).
// Propriétaire : DESIGN / ANIMATION (GPT-6 Astra). Contrat : rig([[bone,fn],...]) ; 16 os max ; pivots documentés dans COLLAB.md.
// ---------- géométrie dynamique : chaque sommet reçoit un index d'os ----------
function withBone(b,fn){verts=[];fn();const o=new Array(verts.length/9*10);let j=0;for(let i=0;i<verts.length;i+=9){for(let k=0;k<9;k++)o[j++]=verts[i+k];o[j++]=b;}verts=[];return o;}
function rig(parts){const all=[];for(const [b,fn] of parts){const part=withBone(b,fn);for(let i=0;i<part.length;i++)all.push(part[i]);}return new Float32Array(all);}

const C={skin:[color(0xf3c9a4),color(0xdba580),color(0xb07a52)],dark:palette.dark,straw:color(0xe8cd7c),white:color(0xfdfaf2),shoe:color(0x4a3323)};
function humanoid(o){
// Style « chibi » arrondi : grosse tête, corps compact, membres en capsules. Mêmes pivots que l'ancien rig cubique
// (hanches ±.1/.62, épaules ±.28/1.08, cou 1.16) pour que poseHuman continue de fonctionner.
const s=o.scale||1,sc=p=>p.map(v=>v*s);
const E=(c,d,col,seg=12,rings=8)=>ellipsoid(sc(c),sc(d),col,seg,rings,0);
const B=(c,d,col,rot=0)=>box(sc(c),sc(d),col,rot);
const Cy=(a,b,r1,r2,col,n=12)=>cylinder(sc(a),sc(b),r1*s,r2*s,col,n);
const cloth=o.shirt,sleeve=o.sleeve||o.shirt,dark=C.dark;
return rig([
[0,()=>{E([0,.86,0],[.245,.3,.185],cloth,14,9);E([0,.7,0],[.25,.16,.19],o.pants,14,7);Cy([0,.62,0],[0,.68,0],.215,.205,o.belt||dark,14);Cy([0,1.04,0],[0,1.16,0],.075,.07,o.skin,10);
for(const side of[-1,1])E([side*.07,1.06,.149],[.06,.055,.026],tint(cloth,1.09),8,4);if(o.apron)E([0,.78,.14],[.2,.24,.035],o.apron,10,6);if(o.bag)E([.27,.7,-.02],[.06,.1,.09],palette.trim,8,5);
if(o.prop==='guitar'){E([.02,.8,.24],[.2,.25,.06],color(0x9b5a2c),12,7);E([.02,.8,.3],[.07,.08,.01],dark,8,4);B([-.36,1.0,.24],[.5,.05,.05],palette.wood);for(let i=0;i<4;i++)B([-.1,.7+i*.06,.3],[.5,.006,.006],color(0xe9e2c8));}}],
[5,()=>{E([0,1.34,0],[.27,.26,.27],o.skin,16,10);E([-.27,1.33,0],[.045,.05,.03],o.skin,8,5);E([.27,1.33,0],[.045,.05,.03],o.skin,8,5);
for(const sd of[-1,1]){E([sd*.095,1.34,.235],[.055,.065,.03],C.white,8,5);E([sd*.09,1.335,.262],[.032,.04,.02],o.eye||color(0x3b2a20),8,5);E([sd*.1,1.41,.245],[.05,.012,.02],o.hair,6,3);}
E([0,1.29,.27],[.028,.022,.02],tint(o.skin,.92),6,4);E([0,1.235,.253],[.038,.009,.012],color(0xb35a4a),8,4);for(const side of[-1,1]){E([side*.158,1.28,.207],[.039,.017,.013],tint(o.skin,.91),8,4);E([side*.09-.009,1.35,.283],[.010,.013,.008],C.white,6,4);}
E([0,1.44,-.105],[.282,.19,.19],o.hair,14,9);
for(let j=0;j<5;j++)E([-.18+j*.085,1.535+Math.sin(j)*.025,.12],[.075,.065,.11],tint(o.hair,.93+j*.025),9,5);
if(o.hat==='straw'){Cy([0,1.53,0],[0,1.555,0],.42,.42,C.straw,18);E([0,1.62,0],[.22,.13,.22],C.straw,14,7);Cy([0,1.55,0],[0,1.585,0],.225,.215,o.band||color(0xc34a3d),14);}
if(o.hat==='cap'){E([0,1.56,0],[.26,.12,.26],o.hatColor,14,7);B([0,1.56,.28],[.3,.03,.16],o.hatColor);}
if(o.hat==='scarf'){E([0,1.52,0],[.295,.09,.295],o.hatColor,14,6);B([0,1.44,-.24],[.14,.2,.04],o.hatColor);}
if(o.hat==='beret'){E([0,1.61,.03],[.31,.09,.31],o.hatColor,14,6);E([0,1.7,0],[.03,.03,.03],o.hatColor,6,4);}
if(o.beard)E([0,1.17,.19],[.17,.11,.09],o.hair,10,6);
if(o.bun)E([0,1.62,-.14],[.11,.1,.11],o.hair,10,6);
if(o.longHair)E([0,1.18,-.22],[.21,.24,.12],o.hair,12,7);}],
[1,()=>{Cy([-.1,.62,0],[-.1,.12,0],.085,.075,o.pants,12);E([-.1,.06,.03],[.1,.065,.145],C.shoe,10,5);}],
[2,()=>{Cy([.1,.62,0],[.1,.12,0],.085,.075,o.pants,12);E([.1,.06,.03],[.1,.065,.145],C.shoe,10,5);}],
[3,()=>{E([-.29,1.03,0],[.085,.085,.085],sleeve,10,6);Cy([-.3,1.03,0],[-.3,.66,0],.065,.058,sleeve,10);E([-.3,.62,0],[.072,.075,.072],o.skin,10,6);E([-.252,.635,.025],[.027,.040,.034],o.skin,8,4);if(o.prop==='basket'){E([-.33,.46,.06],[.13,.09,.09],C.straw,10,6);Cy([-.33,.53,.06],[-.33,.56,.06],.1,.1,color(0xd9a35a),10);}}],
[4,()=>{E([.29,1.03,0],[.085,.085,.085],sleeve,10,6);Cy([.3,1.03,0],[.3,.66,0],.065,.058,sleeve,10);E([.3,.62,0],[.072,.075,.072],o.skin,10,6);E([.252,.635,.025],[.027,.040,.034],o.skin,8,4);if(o.prop==='rod')beam(sc([.32,.55,.05]),sc([.36,1.55,1.5]),.014*s,palette.wood);if(o.prop==='staff')beam(sc([.34,-.02,.08]),sc([.34,1.25,.08]),.025*s,palette.wood);}]]);
}
function catRig(){const fur=color(0xe28f3c),cream=color(0xfbe9cf);return rig([
[0,()=>{ellipsoid([0,.28,0],[.115,.115,.245],fur,12,7,0);ellipsoid([0,.23,.04],[.09,.07,.18],cream,10,6,0);ellipsoid([0,.39,.25],[.13,.13,.13],fur,12,8,0);ellipsoid([0,.34,.35],[.075,.048,.055],cream,10,5,0);
tri([-.075,.44,.24],[-.02,.44,.24],[-.05,.54,.22],fur);tri([.02,.44,.24],[.075,.44,.24],[.05,.54,.22],fur);
for(const side of[-1,1]){ellipsoid([side*.05,.4,.36],[.023,.031,.018],C.dark,8,5,0);ellipsoid([side*.05-.005,.41,.375],[.006,.008,.005],C.white,6,4,0);}ellipsoid([0,.35,.4],[.021,.014,.014],color(0xd87a7a),8,4,0);}],
[1,()=>ellipsoid([-.07,.105,.14],[.043,.105,.052],fur,9,6,0)],[2,()=>ellipsoid([.07,.105,.14],[.043,.105,.052],fur,9,6,0)],
[3,()=>ellipsoid([-.07,.105,-.14],[.043,.105,.052],fur,9,6,0)],[4,()=>ellipsoid([.07,.105,-.14],[.043,.105,.052],fur,9,6,0)],
[5,()=>{cylinder([0,.3,-.2],[0,.5,-.42],.03,.02,fur,6);ellipsoid([0,.5,-.42],[.025,.025,.025],cream,5,3,0);}]]);}
function gullRig(){const w=C.white,g=color(0xd8dde0);return rig([
[0,()=>{ellipsoid([0,0,0],[.12,.09,.3],w,8,5,0);ellipsoid([0,.05,.3],[.08,.08,.1],w,7,4,0);ellipsoid([0,.03,.42],[.026,.023,.075],color(0xf0a030),9,5,0);ellipsoid([0,-.01,-.3],[.07,.025,.12],g,9,5,0);for(const side of[-1,1])ellipsoid([side*.057,.075,.35],[.013,.019,.01],C.dark,7,4,0);}],
[1,()=>ellipsoid([-.32,.015,-.065],[.38,.03,.15],g,12,5,0)],
[2,()=>ellipsoid([.32,.015,-.065],[.38,.03,.15],g,12,5,0)]]);}
function crabRig(){const red=color(0xd9552f),dark=color(0x8c2f16);return rig([
[0,()=>{ellipsoid([0,.09,0],[.17,.07,.12],red,10,5,.04);for(const side of[-1,1]){ellipsoid([side*.05,.16,.08],[.023,.038,.022],C.dark,8,5,0);ellipsoid([side*.05-.006,.18,.098],[.007,.009,.005],C.white,6,4,0);}
for(const sd of[-1,1]){ellipsoid([sd*.2,.09,.12],[.07,.045,.075],red,10,6,0);ellipsoid([sd*.24,.1,.18],[.032,.03,.045],dark,8,5,0);}}],
[1,()=>{for(let i=0;i<3;i++)beam([-.12,.06,-.08+i*.08],[-.27,.0,-.12+i*.1],.014,dark);}],
[2,()=>{for(let i=0;i<3;i++)beam([.12,.06,-.08+i*.08],[.27,.0,-.12+i*.1],.014,dark);}]]);}

// ---------- maillages dynamiques ----------
function meshDyn(data){let vao=gl.createVertexArray();gl.bindVertexArray(vao);let buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,40,i*12);}gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,1,gl.FLOAT,false,40,36);gl.bindVertexArray(null);return{vao,count:data.length/10};}

const heroMesh=meshDyn(humanoid({shirt:color(0x2f8f9d),pants:color(0x3c4a5a),skin:C.skin[0],hair:color(0x4a2f1e),hat:'straw',bag:true}));
const npcMeshes={
tomas:meshDyn(humanoid({shirt:color(0xf1e2c4),sleeve:color(0xf1e2c4),pants:color(0x2e4a6b),skin:C.skin[1],hair:color(0x3a2618),hat:'cap',hatColor:color(0x1f4d73),beard:true,prop:'rod'})),
anae:meshDyn(humanoid({shirt:color(0x8c4a6b),pants:color(0x5b4b63),skin:C.skin[0],hair:color(0xd9d3c4),bun:true,apron:color(0xfff2dc),scale:.92})),
lila:meshDyn(humanoid({shirt:color(0xf4c34d),pants:color(0xd9603b),skin:C.skin[1],hair:color(0x6b3d1d),longHair:true,scale:.7})),
oro:meshDyn(humanoid({shirt:color(0x6b5c3f),pants:color(0x3c3a35),skin:C.skin[2],hair:color(0xe8e2d4),beard:true,hat:'scarf',hatColor:color(0xc8402e),prop:'staff'})),
pia:meshDyn(humanoid({shirt:color(0x5d9b74),pants:color(0xe8d6b3),skin:C.skin[2],hair:color(0x1e1410),hat:'scarf',hatColor:color(0xf2b134),scale:.95,prop:'basket'})),
marco:meshDyn(humanoid({shirt:color(0xd9603b),pants:color(0x4f5b6b),skin:C.skin[1],hair:color(0x2b1a10),hat:'straw',band:color(0x2f8f9d),scale:1.02})),
bastien:meshDyn(humanoid({shirt:color(0x3f4f8a),pants:color(0x2b2b33),skin:C.skin[0],hair:color(0x2b1a10),hat:'beret',hatColor:color(0xa8323a),prop:'guitar',scale:.98})),
cat:meshDyn(catRig())};
const gullMesh=meshDyn(gullRig()),crabMesh=meshDyn(crabRig());
const mooredBoat=meshDyn(new Float32Array(withBone(0,()=>{boat(0,0,0,0,false);for(let i=0;i<3;i++)cylinder([-.3,.02,-.6+i*.1],[-.3,.06,-.6+i*.1],.16-i*.04,.16-i*.04,color(0xcbba85),8);})));
const sailBoat=meshDyn(rig([[0,()=>boat(0,0,0,0,false)],[1,()=>{tri([.05,3.75,.05],[.05,.5,.05],[.18,.6,1.48],color(0xffefd1));tri([0,3.4,-.05],[0,.9,-.05],[-.1,1,-1.55],color(0xffe6b8));}]]));
const shellMesh=meshDyn(rig([[0,()=>{ellipsoid([0,.06,0],[.16,.07,.14],color(0xffd6c2),10,5,.05);ellipsoid([0,.09,-.03],[.09,.05,.08],color(0xf4a98b),8,4,0);for(let i=0;i<5;i++){const a=-.9+i*.45;beam([0,.08,-.08],[Math.sin(a)*.15,.11,-.08+Math.cos(a)*.2],.012,color(0xfff1e8));}}],[1,()=>ellipsoid([0,0,0],[.03,.03,.03],C.white,5,3,0)]]));
const noteMesh=meshDyn(rig([[0,()=>{box([0,.22,0],[.3,.4,.012],color(0xfff8e6));for(let i=0;i<5;i++)box([0,.08+i*.07,.008],[.24,.008,.005],C.dark);ellipsoid([-.05,.2,.012],[.035,.025,.01],C.dark,6,3,0);beam([-.02,.2,.012],[-.02,.33,.012],.006,C.dark);}],[1,()=>ellipsoid([0,0,0],[.03,.03,.03],C.white,5,3,0)]]));
const flagMesh=meshDyn(rig([[0,()=>{beam([0,0,0],[0,1.5,0],.03,palette.wood);ellipsoid([0,1.53,0],[.05,.05,.05],color(0xcda155),6,4,0);const nx=9,ny=4;for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const x0=i/nx*.95,x1=(i+1)/nx*.95,y0=1.45-j/ny*.5,y1=1.45-(j+1)/ny*.5;quad([x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0],j%2?color(0xfff1d6):color(0xe36a3b));}}]]));
const smokeMesh=meshDyn(rig(Array.from({length:6},(_,k)=>[k,()=>ellipsoid([0,0,0],[.17,.14,.17],color(0xf3f0e8),7,4,.15)])));
const ringMesh=meshDyn(new Float32Array(withBone(0,()=>{for(let i=0;i<24;i++){const a=i/24*TAU,b=(i+1)/24*TAU;quad([Math.cos(a)*.5,0,Math.sin(a)*.5],[Math.cos(b)*.5,0,Math.sin(b)*.5],[Math.cos(b)*.62,0,Math.sin(b)*.62],[Math.cos(a)*.62,0,Math.sin(a)*.62],color(0xfff1c2));}})));
const lanternMesh=meshDyn(new Float32Array(withBone(0,()=>{beam([0,0,0],[0,1.9,0],.035,palette.wood);beam([0,1.9,0],[.22,1.86,0],.02,palette.wood);for(const dx of[-.08,.08])for(const dz of[-.08,.08])box([.22+dx,1.65,dz],[.016,.22,.016],color(0x3a3230));box([.22,1.78,0],[.2,.03,.2],color(0x3a3230));box([.22,1.53,0],[.18,.02,.18],color(0x3a3230));})));
const lanternGlow=meshDyn(new Float32Array(withBone(0,()=>box([.22,1.65,0],[.13,.18,.13],color(0xf2a13a)))));
const fireflyMesh=meshDyn(rig(Array.from({length:14},(_,k)=>[k,()=>ellipsoid([0,0,0],[.035,.035,.035],color(0xb8e34a),5,3,0)])));
const burstMeshes=[0xff6b6b,0xffd166,0x7ae7ff,0xc9a0ff].map(c=>meshDyn(rig(Array.from({length:12},(_,k)=>[k,()=>ellipsoid([0,0,0],[.16,.16,.16],color(c),6,4,0)]))));
const chestMesh=meshDyn(rig([[0,()=>{box([0,.16,0],[.6,.32,.4],palette.wood);for(const z of[-.19,.19])box([0,.16,z],[.62,.34,.03],color(0x3a3230));box([0,.16,0],[.63,.06,.42],color(0x3a3230));for(let i=0;i<9;i++)ellipsoid([-.2+i%3*.2,.33,-.1+Math.floor(i/3)*.1],[.06,.045,.06],color(0xf4c542),6,3,.1);}],[1,()=>{box([0,.04,.2],[.6,.08,.4],palette.wood);box([0,.04,.2],[.62,.1,.03],color(0x3a3230));}]]));
const crossMesh=meshDyn(new Float32Array(withBone(0,()=>{box([0,.01,0],[.9,.02,.12],color(0xb0642c),.78);box([0,.01,0],[.9,.02,.12],color(0xb0642c),-.78);})));
// ---------- Livraison 2 · Phare : extensions isolées des maillages existants ----------
// Gardien : mêmes 6 os et même échelle que humanoid. Le ciré, la barbe grise,
// les bottes et la cage de lanterne sont visibles en mode 4 ; son cœur est séparé.
function gardienRig(){
  const yellow=color(0xe4b52e),metal=color(0x393d3d);
  const body=humanoid({shirt:yellow,sleeve:yellow,pants:color(0x34474f),
    skin:C.skin[1],hair:color(0xd4d1c5),hat:'cap',hatColor:yellow,beard:true});
  const details=rig([
    [0,()=>{for(let j=0;j<4;j++)box([.045,.72+j*.08,.132],[.025,.025,.02],metal);
      box([-.12,.79,.135],[.11,.12,.025],tint(yellow,.87));
      box([.12,.79,.135],[.11,.12,.025],tint(yellow,.87));}],
    [1,()=>{ellipsoid([-.1,.60,0],[.115,.12,.17],yellow,10,6,0);ellipsoid([-.1,.16,.02],[.10,.16,.14],metal,10,6,0);}],
    [2,()=>{ellipsoid([.1,.60,0],[.115,.12,.17],yellow,10,6,0);ellipsoid([.1,.16,.02],[.10,.16,.14],metal,10,6,0);}],
    [5,()=>{ellipsoid([0,1.235,.285],[.105,.025,.024],color(0xe4dfd2),10,5,0);
      for(const x of[-.06,.06])ellipsoid([x,1.412,.254],[.04,.012,.022],color(0xbcb9b0),8,4,0);}],
    [4,()=>{
      for(const dx of[-.095,.095])for(const dz of[-.085,.085])
        beam([.28+dx,.20,.09+dz],[.28+dx,.44,.09+dz],.014,metal);
      box([.28,.20,.09],[.22,.035,.20],metal);box([.28,.46,.09],[.24,.04,.22],metal);
      beam([.20,.47,.09],[.20,.60,.04],.014,metal);
      beam([.36,.47,.09],[.36,.60,.04],.014,metal);
      beam([.20,.60,.04],[.36,.60,.04],.014,metal);
      box([.28,.33,.09],[.12,.19,.11],color(0xd59e45));
    }]
  ]);
  const out=new Float32Array(body.length+details.length);out.set(body);out.set(details,body.length);return out;
}
// Chèvre : +Z devant, sol Y=0, géométrie unité (scale appliqué par poseGoat).
// 0 corps ; 1 avant G (-.17,.46,.27) ; 2 avant D (+.17,.46,.27) ;
// 3 arrière G (-.17,.46,-.27) ; 4 arrière D (+.17,.46,-.27) ;
// 5 tête, pivot (0,.66,.32). 6 queue, pivot (0,.59,-.37). Float32Array(16*7), n:7, mode:4.
function goatRig(){
  const fur=color(0xeee4cd),patchColor=color(0x9c8469),hoof=color(0x46433d);
  return rig([
    [0,()=>{ellipsoid([0,.53,0],[.26,.24,.43],fur,12,7,.02);
      ellipsoid([-.19,.59,-.11],[.09,.15,.2],patchColor,9,5,0);
      }],
    [6,()=>cylinder([0,.59,-.37],[0,.78,-.53],.065,.028,fur,8)],
    ...[[-.17,.27],[.17,.27],[-.17,-.27],[.17,-.27]].map(([x,z],i)=>[i+1,()=>{
      cylinder([x,.46,z],[x,.10,z],.062,.043,fur,8);
      box([x,.055,z+.02],[.105,.11,.135],hoof);
      box([x,.047,z+.086],[.012,.065,.008],C.dark);
    }]),
    [5,()=>{ellipsoid([0,.78,.37],[.155,.23,.16],fur,10,6,0);
      ellipsoid([0,.76,.52],[.12,.095,.15],patchColor,10,5,0);
      for(const side of[-1,1]){
        ellipsoid([side*.19,.87,.34],[.14,.035,.07],fur,8,4,0);
        box([side*.125,.84,.47],[.023,.035,.028],C.dark);
        cylinder([side*.085,.94,.33],[side*.10,1.12,.24],.04,.03,palette.trim,8);
        cylinder([side*.10,1.12,.24],[side*.115,1.18,.13],.03,.006,palette.trim,8);
      }
      cylinder([0,.69,.5],[0,.53,.48],.055,.008,fur,8);
    }]
  ]);
}
let goatMesh,phareLanternMesh,gardienLanternMesh;
{
  const phareRigSeed=seed;seed=341810;
  try{
    npcMeshes.gardien=meshDyn(gardienRig());goatMesh=meshDyn(goatRig());
    phareLanternMesh=meshDyn(rig([[0,()=>{
      cylinder([0,-.38,0],[0,.38,0],.31,.31,color(0xffbd52),20);
      for(let j=0;j<5;j++)cylinder([0,-.32+j*.16,0],[0,-.28+j*.16,0],.36,.36,color(0xffe2a1),20);
    }]]));
    gardienLanternMesh=meshDyn(rig([[4,()=>box([.28,.33,.09],[.15,.205,.14],color(0xffc36b))]]));
  }finally{seed=phareRigSeed;}
}
// À pousser par Claude dans drawList APRÈS son drawList.length=0.
// Les tableaux sont réutilisés. Ne pas modifier ni accumuler ces descripteurs.
const phareLanternBones=new Float32Array(16);
const phareLanternItem={mesh:phareLanternMesh,bones:phareLanternBones,n:1,mode:7,noShadow:true};
function phareLanternDraw(t,lit=true){
  if(!lit)return null;
  setBone(phareLanternBones,0,mm(T(34,19.45,-25.3),RY(t*.35)));
  return phareLanternItem;
}
function gardienLanternDraw(e){return{mesh:gardienLanternMesh,bones:e.bones,n:6,mode:7,noShadow:true};}


verts=null;


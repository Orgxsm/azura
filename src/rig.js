// rig.js — squelettes et maillages des personnages, animaux, objets (humanoid, chat, mouette, crabe, bateaux, lanternes…).
// Propriétaire : DESIGN / ANIMATION (GPT-6 Astra). Contrat : rig([[bone,fn],...]) ; 16 os max ; pivots documentés dans COLLAB.md.
// ---------- géométrie dynamique : chaque sommet reçoit un index d'os ----------
function withBone(b,fn){verts=[];fn();const o=new Array(verts.length/9*10);let j=0;for(let i=0;i<verts.length;i+=9){for(let k=0;k<9;k++)o[j++]=verts[i+k];o[j++]=b;}verts=[];return o;}
function rig(parts){const all=[];for(const [b,fn] of parts){const part=withBone(b,fn);for(let i=0;i<part.length;i++)all.push(part[i]);}return new Float32Array(all);}

const C={skin:[color(0xf3c9a4),color(0xdba580),color(0xb07a52)],dark:palette.dark,straw:color(0xe8cd7c),white:color(0xfdfaf2),shoe:color(0x4a3323)};
function humanoid(o){
const s=o.scale||1,sc=p=>p.map(v=>v*s);
const B=(c,d,col)=>box(sc(c),sc(d),col);
return rig([
[0,()=>{B([0,.87,0],[.42,.5,.24],o.shirt);B([0,.63,0],[.43,.09,.25],o.belt||C.dark);B([0,1.15,0],[.12,.08,.12],o.skin);if(o.apron)B([0,.74,.125],[.3,.36,.02],o.apron);if(o.bag)B([.24,.72,-.02],[.1,.22,.16],palette.trim);
if(o.prop==='guitar'){B([.02,.8,.22],[.36,.44,.09],color(0x9b5a2c));B([.02,.8,.27],[.12,.14,.01],C.dark);B([-.38,1.0,.22],[.5,.05,.05],palette.wood);for(let i=0;i<4;i++)B([-.1,.7+i*.06,.27],[.5,.006,.006],color(0xe9e2c8));}}],
[5,()=>{B([0,1.31,0],[.3,.3,.3],o.skin);B([0,1.41,0],[.33,.1,.33],o.hair);B([0,1.3,-.16],[.33,.22,.03],o.hair);
B([-.06,1.32,.152],[.05,.05,.01],C.dark);B([.06,1.32,.152],[.05,.05,.01],C.dark);B([0,1.24,.152],[.08,.02,.01],color(0xb35a4a));
if(o.hat==='straw'){cylinder(sc([0,1.44,0]),sc([0,1.47,0]),.36*s,.36*s,C.straw,14);cylinder(sc([0,1.46,0]),sc([0,1.62,0]),.2*s,.17*s,C.straw,12);cylinder(sc([0,1.48,0]),sc([0,1.52,0]),.205*s,.2*s,o.band||color(0xc34a3d),12);}
if(o.hat==='cap'){cylinder(sc([0,1.44,0]),sc([0,1.56,0]),.19*s,.16*s,o.hatColor,12);B([0,1.45,.22],[.3,.03,.16],o.hatColor);}
if(o.hat==='scarf'){B([0,1.44,0],[.34,.08,.34],o.hatColor);B([0,1.36,-.19],[.14,.2,.04],o.hatColor);}
if(o.hat==='beret'){cylinder(sc([0,1.44,0]),sc([0,1.5,0]),.2*s,.24*s,o.hatColor,12);cylinder(sc([0,1.5,0]),sc([0,1.53,0]),.24*s,.12*s,o.hatColor,12);}
if(o.beard)B([0,1.19,.1],[.22,.12,.12],o.hair);
if(o.bun)ellipsoid(sc([0,1.46,-.12]),sc([.09,.08,.09]),o.hair,7,4,0);
if(o.longHair)B([0,1.22,-.14],[.3,.28,.06],o.hair);}],
[1,()=>{B([-.1,.33,0],[.16,.56,.18],o.pants);B([-.1,.04,.03],[.17,.08,.25],C.shoe);}],
[2,()=>{B([.1,.33,0],[.16,.56,.18],o.pants);B([.1,.04,.03],[.17,.08,.25],C.shoe);}],
[3,()=>{B([-.28,.86,0],[.12,.44,.12],o.sleeve||o.shirt);B([-.28,.6,0],[.1,.1,.1],o.skin);if(o.prop==='basket'){B([-.3,.44,.06],[.24,.17,.17],C.straw);B([-.3,.55,.06],[.2,.04,.13],color(0xd9a35a));}}],
[4,()=>{B([.28,.86,0],[.12,.44,.12],o.sleeve||o.shirt);B([.28,.6,0],[.1,.1,.1],o.skin);if(o.prop==='rod')beam(sc([.3,.55,.05]),sc([.34,1.55,1.5]),.014*s,palette.wood);if(o.prop==='staff')beam(sc([.32,-.02,.08]),sc([.32,1.25,.08]),.025*s,palette.wood);}]]);
}
function catRig(){const fur=color(0xe28f3c),cream=color(0xfbe9cf);return rig([
[0,()=>{box([0,.27,0],[.17,.15,.42],fur);box([0,.21,.02],[.13,.06,.3],cream);box([0,.37,.26],[.17,.15,.15],fur);box([0,.33,.33],[.08,.06,.04],cream);
tri([-.075,.44,.24],[-.02,.44,.24],[-.05,.54,.22],fur);tri([.02,.44,.24],[.075,.44,.24],[.05,.54,.22],fur);
box([-.04,.38,.335],[.03,.03,.01],C.dark);box([.04,.38,.335],[.03,.03,.01],C.dark);box([0,.34,.352],[.03,.02,.01],color(0xd87a7a));}],
[1,()=>box([-.07,.1,.14],[.06,.2,.06],fur)],[2,()=>box([.07,.1,.14],[.06,.2,.06],fur)],
[3,()=>box([-.07,.1,-.14],[.06,.2,.06],fur)],[4,()=>box([.07,.1,-.14],[.06,.2,.06],fur)],
[5,()=>{cylinder([0,.3,-.2],[0,.5,-.42],.03,.02,fur,6);ellipsoid([0,.5,-.42],[.025,.025,.025],cream,5,3,0);}]]);}
function gullRig(){const w=C.white,g=color(0xd8dde0);return rig([
[0,()=>{ellipsoid([0,0,0],[.12,.09,.3],w,8,5,0);ellipsoid([0,.05,.3],[.08,.08,.1],w,7,4,0);box([0,.03,.42],[.03,.03,.1],color(0xf0a030),0);box([0,-.01,-.3],[.12,.02,.14],g);}],
[1,()=>quad([0,0,-.14],[0,0,.12],[-.75,.02,.02],[-.6,.03,-.25],g)],
[2,()=>quad([0,0,.12],[0,0,-.14],[.6,.03,-.25],[.75,.02,.02],g)]]);}
function crabRig(){const red=color(0xd9552f),dark=color(0x8c2f16);return rig([
[0,()=>{ellipsoid([0,.09,0],[.17,.07,.12],red,10,5,.04);box([-.05,.16,.08],[.03,.04,.03],C.dark);box([.05,.16,.08],[.03,.04,.03],C.dark);
for(const sd of[-1,1]){box([sd*.2,.09,.12],[.09,.06,.1],red,sd*.4);box([sd*.24,.1,.18],[.05,.04,.07],dark,sd*.5);}}],
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
verts=null;


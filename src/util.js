// util.js — petits helpers DOM/maths, matrices colonne-major, maillages à os (withBone/rig/meshDyn).
// Propriétaire : partagé.
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const mix=(a,b,k)=>a+(b-a)*k;

// ---------- matrices ----------
const I4=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const T=(x,y,z)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]);
const SC=(s,sy=s,sz=s)=>new Float32Array([s,0,0,0,0,sy,0,0,0,0,sz,0,0,0,0,1]);
const RX=a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);};
const RY=a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);};
const RZ=a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);};
const mm=(...ms)=>ms.reduce((a,b)=>matmul(a,b));
const piv=(p,m)=>mm(T(p[0],p[1],p[2]),m,T(-p[0],-p[1],-p[2]));
const setBone=(B,i,m)=>B.set(m,i*16);


// ---------- Pont de corde praticable (Claude, phase 3) ----------
// ropeBridge(points, width=1.2, opts) : `points` = polyligne [x,y,z] des appuis (au moins 2), en mètres.
// Rend les planches, les cordes porteuses, les mains courantes, les suspentes et les poteaux d'extrémité,
// puis déclare le tablier dans `stairDefs` (heights absolues, comme `stairs`) : le personnage marche dessus,
// les mains courantes (0,95 m) restent hors de la bande praticable et font barrière dans la carte de hauteur.
// opts : {sag:0.055 (flèche par mètre de portée, en fraction), rail:true, plank:0.3, posts:true}
function ropeBridge(points,width=1.2,opts={}){
  const sagK=opts.sag??.055,rail=opts.rail??true,plankStep=opts.plank??.3,posts=opts.posts??true;
  const plankCol=color(0xb98a52),ropeCol=color(0xd8c9a0),postCol=color(0x8f6a45);
  const deck=[];// polyligne affaissée, réutilisée pour la carte de hauteur
  for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],d=sub(b,a),span=Math.hypot(d[0],d[2]),n=Math.max(2,Math.ceil(span/.6));
    for(let i=(k?1:0);i<=n;i++){const t=i/n,p=add(a,mul(d,t));p[1]-=sagK*span*4*t*(1-t);deck.push(p);}}
  stairDefs.push({points:deck,width});
  const side=(p,q,s)=>{const d=sub(q,p),h=Math.hypot(d[0],d[2])||1;return [-d[2]/h*s,0,d[0]/h*s];};
  for(let i=0;i<deck.length-1;i++){const p=deck[i],q=deck[i+1],dir=sub(q,p),len=Math.hypot(dir[0],dir[1],dir[2]),rot=Math.atan2(dir[0],dir[2]);
    // cordes porteuses sous les planches (deux côtés)
    for(const s of[-1,1]){const o=side(p,q,width*.46);beam(add(add(p,o),[0,-.04,0]),add(add(q,o),[0,-.04,0]),.03,ropeCol);}
    // planches
    const n=Math.max(1,Math.round(len/plankStep));
    for(let j=0;j<n;j++){const t=(j+.5)/n,c=add(p,mul(dir,t)),tilt=Math.atan2(dir[1],Math.hypot(dir[0],dir[2]));
      box([c[0],c[1]-.025,c[2]],[width,.05,len/n*.78],tint(plankCol,.92+.16*rnd()),rot+(rnd()-.5)*.03);
      // lissage : un chevron discret sous chaque planche pour éviter les trous vus de dessous
      if(Math.abs(tilt)>.25)box([c[0],c[1]-.06,c[2]],[width*.9,.03,len/n*.4],tint(plankCol,.85),rot);}
    if(rail){for(const s of[-1,1]){const o=side(p,q,width*.5);const P=add(add(p,o),[0,.95,0]),Q=add(add(q,o),[0,.95,0]);beam(P,Q,.022,ropeCol);
      // suspentes
      const m=Math.max(1,Math.round(len/.6));for(let j=0;j<=m;j++){if(i&&j===0)continue;const t=j/m,lo=add(add(p,o),mul(sub(add(q,o),add(p,o)),t)),hi=add(lo,[0,.95,0]);beam(lo,hi,.012,ropeCol);}}}
  }
  if(posts)for(const e of[0,deck.length-1]){const p=deck[e],q=deck[e?e-1:1],o=side(p,q,width*.55);
    for(const s of[-1,1]){const base=add(p,mul(o,s));beam(add(base,[0,-.3,0]),add(base,[0,1.15,0]),.07,postCol);cylinder(add(base,[0,1.15,0]),add(base,[0,1.24,0]),.09,.02,postCol,8);}}
  return deck;
}

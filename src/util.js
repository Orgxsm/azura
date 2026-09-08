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


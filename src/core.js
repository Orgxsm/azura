// core.js — contexte WebGL2, aléatoire déterministe, maths, primitives de construction (tri/quad/box/cylinder/ellipsoid/beam…)
// Propriétaire : partagé (ne pas renommer les primitives : le moteur en dépend).
const canvas=document.querySelector('#world');
const gl=canvas.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'high-performance'});
if(!gl){document.querySelector('#error').hidden=false;document.querySelector('#loading').style.display='none';throw Error('WebGL 2 unavailable');}
let seed=1729;const rnd=()=>{seed=(Math.imul(1664525,seed)+1013904223)|0;return(seed>>>0)/4294967296;},range=(a,b)=>a+(b-a)*rnd();
const PI=Math.PI,TAU=PI*2;
const sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
function matmul(a,b){let r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function lookAt(e,t){let z=norm(sub(e,t)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]);}
function perspective(fov,asp,n,f){let t=1/Math.tan(fov/2);return new Float32Array([t/asp,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]);}
function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
const color=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const palette={wall:color(0xf4ddb1),cream:color(0xffebc7),sand:color(0xf7dea3),rock:color(0xb1ad97),rockLight:color(0xd4c5a6),wood:color(0x765039),trim:color(0x9d6e46),dark:color(0x263c3c),tile:color(0xd57037),leaf:color(0x5e9d26),leafLight:color(0x87b833)};
const tint=(c,f)=>c.map(v=>Math.min(1,v*f));
let verts=[],triangles=0;
function tri(a,b,c,col,ns){const n=norm(cross(sub(b,a),sub(c,a)));for(const [i,p]of[a,b,c].entries())verts.push(...p,...(ns?ns[i]:n),...col);triangles++;}
function quad(a,b,c,d,col){tri(a,b,c,col);tri(a,c,d,col);}
function transform(p,pos,rot=0){return[pos[0]+p[0]*Math.cos(rot)+p[2]*Math.sin(rot),pos[1]+p[1],pos[2]-p[0]*Math.sin(rot)+p[2]*Math.cos(rot)];}
function box(p,s,col,rot=0){let[x,y,z]=s.map(v=>v/2);let v=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]].map(v=>transform(v,p,rot));for(let f of[[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[7,6,2,3],[0,1,5,4]])quad(...f.map(i=>v[i]),col);}
function ellipsoid(p,s,col,seg=12,rings=7,jitter=.12){let grid=[];let phase=rnd()*6;for(let j=0;j<=rings;j++){let row=[];for(let i=0;i<=seg;i++){let a=i/seg*TAU,b=j/rings*PI;let noise=1+jitter*(Math.sin(a*3+b*5+phase)*.45+Math.cos(a*5-b*3+phase)*.55);row.push([p[0]+s[0]*Math.sin(b)*Math.cos(a)*noise,p[1]+s[1]*Math.cos(b)*noise,p[2]+s[2]*Math.sin(b)*Math.sin(a)*noise]);}grid.push(row);}for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){let c=tint(col,range(.985,1.015));let ps=[grid[j][i],grid[j+1][i],grid[j+1][i+1],grid[j][i+1]];let ns=ps.map(q=>norm(q.map((v,k)=>(v-p[k])/(s[k]*s[k]))));tri(ps[0],ps[1],ps[2],c,[ns[0],ns[1],ns[2]]);tri(ps[0],ps[2],ps[3],c,[ns[0],ns[2],ns[3]]);}}
function cylinder(a,b,r1,r2,col,n=10){const w=norm(sub(b,a)),u=norm(cross(w,Math.abs(w[1])>.95?[1,0,0]:[0,1,0])),v=cross(w,u);let ra=[],rb=[];for(let i=0;i<=n;i++){let d=add(mul(u,Math.cos(i/n*TAU)),mul(v,Math.sin(i/n*TAU)));ra.push(add(a,mul(d,r1)));rb.push(add(b,mul(d,r2)));}for(let i=0;i<n;i++){quad(ra[i],rb[i],rb[i+1],ra[i+1],col);tri(a,ra[i],ra[i+1],col);tri(b,rb[i+1],rb[i],col);}}
function beam(a,b,r,col=palette.wood){cylinder(a,b,r,r*.94,col,7);}
function rock(x,y,z,sx,sy,sz){ellipsoid([x,y,z],[sx,sy,sz],tint(palette.rockLight,range(.82,1.04)),16,9,.07);}
function patch(x,y,z,sx,sz){ellipsoid([x,y,z],[sx,.26,sz],tint(palette.leaf,range(.68,.95)),14,5,.15);}

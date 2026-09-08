// world.js — carte de hauteur GPU, tamponnage des terrasses/escaliers, zones interdites, remplissage des cellules atteignables, collisions.
// Propriétaire : GAMEPLAY (Claude Code).
// ---------- carte de hauteur : rendu vertical de l'île, relu sur le CPU ----------
const HN=400,HS=32/HN,SEA=.22,STEP=.42;
let H=new Float32Array(HN*HN),reach=new Uint8Array(HN*HN);
{
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,HN,HN,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,HN,HN);
const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);
if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Heightmap framebuffer incomplete');
gl.viewport(0,0,HN,HN);gl.clearColor(0,0,0,1);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
gl.useProgram(hmProgram);gl.uniformMatrix4fv(gl.getUniformLocation(hmProgram,'uVP'),false,new Float32Array([1/16,0,0,0,0,0,-1/20,0,0,1/16,0,0,0,0,0,1]));
gl.bindVertexArray(solid.vao);gl.drawArrays(gl.TRIANGLES,0,solid.count);gl.bindVertexArray(null);
const px=new Uint8Array(HN*HN*4);gl.readPixels(0,0,HN,HN,gl.RGBA,gl.UNSIGNED_BYTE,px);
for(let i=0;i<HN*HN;i++)H[i]=((px[i*4]+px[i*4+1]/255)/255)*30-5;
gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(fbo);gl.deleteTexture(tex);gl.deleteRenderbuffer(rb);
}
const cellIndex=(x,z)=>{const ix=Math.floor((x+16)/HS),iz=Math.floor((z+16)/HS);return ix<0||iz<0||ix>=HN||iz>=HN?-1:iz*HN+ix;};
const cellH=(x,z)=>{const i=cellIndex(x,z);return i<0?-5:H[i];};
function heightAt(x,z){const fx=(x+16)/HS-.5,fz=(z+16)/HS-.5,ix=Math.floor(fx),iz=Math.floor(fz),tx=fx-ix,tz=fz-iz;const g=(a,b)=>H[clamp(b,0,HN-1)*HN+clamp(a,0,HN-1)];return(g(ix,iz)*(1-tx)+g(ix+1,iz)*tx)*(1-tz)+(g(ix,iz+1)*(1-tx)+g(ix+1,iz+1)*tx)*tz;}
// Terrasses pavées d'abord (elles écrasent les bosses, laissent passer sous les balcons), puis escaliers en absolu.
for(const p of platforms)for(let z=p.z-p.r;z<=p.z+p.r;z+=HS)for(let x=p.x-p.r;x<=p.x+p.r;x+=HS){const i=cellIndex(x,z);if(i<0)continue;const px=x-((x+16)%HS)+HS/2,pz=z-((z+16)%HS)+HS/2;if(Math.hypot(px-p.x,pz-p.z)>p.r)continue;const g=H[i];if(g<p.y+1||(g>p.y+1.5&&g<p.y+3.2))H[i]=p.y;}
const stairDist=new Float32Array(HN*HN).fill(1e9);
for(const s of stairDefs)for(let k=0;k<s.points.length-1;k++){const a=s.points[k],b=s.points[k+1],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1,hw=s.width*.42;
const x0=Math.min(a[0],b[0])-hw,x1=Math.max(a[0],b[0])+hw,z0=Math.min(a[2],b[2])-hw,z1=Math.max(a[2],b[2])+hw;
for(let z=z0;z<=z1;z+=HS)for(let x=x0;x<=x1;x+=HS){const i=cellIndex(x,z);if(i<0)continue;const px=x-((x+16)%HS)+HS/2,pz=z-((z+16)%HS)+HS/2;let t=((px-a[0])*dx+(pz-a[2])*dz)/(len*len);if(t<-.02||t>1.02)continue;t=clamp(t,0,1);const perp=Math.abs((px-a[0])*dz-(pz-a[2])*dx)/len;if(perp>hw||perp>=stairDist[i])continue;stairDist[i]=perp;H[i]=a[1]+(b[1]-a[1])*t-.01;}}
// Les emprises des maisons et des tours sont interdites : on ne grimpe jamais sur un toit.
const blocked=new Uint8Array(HN*HN);
for(const t of terraces){const m=t.round?.15:.3,R=Math.max(t.w,t.d)/2+m+HS,c=Math.cos(t.rot),sn=Math.sin(t.rot);for(let z=t.z-R;z<=t.z+R;z+=HS)for(let x=t.x-R;x<=t.x+R;x+=HS){const i=cellIndex(x,z);if(i<0)continue;const dx=x-t.x,dz=z-t.z;let inside;if(t.round)inside=Math.hypot(dx,dz)<=t.w/2+m;else{const lx=dx*c-dz*sn,lz=dx*sn+dz*c;inside=Math.abs(lx)<=t.w/2+m&&Math.abs(lz)<=t.d/2+m;}if(inside)blocked[i]=1;}}

const SPAWN=[.2,9.8];
function floodFrom(x,z){reach.fill(0);const start=cellIndex(x,z);const q=new Int32Array(HN*HN);let qi=0,qn=0;q[qn++]=start;reach[start]=1;while(qi<qn){const i=q[qi++],h=H[i],ix=i%HN,iz=(i-ix)/HN;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=ix+dx,nz=iz+dz;if(nx<0||nz<0||nx>=HN||nz>=HN)continue;const j=nz*HN+nx;if(reach[j]||blocked[j])continue;const hj=H[j];if(hj>SEA&&Math.abs(hj-h)<=STEP){reach[j]=1;q[qn++]=j;}}}return qn;}
const reachCount=floodFrom(SPAWN[0],SPAWN[1]);
function snap(x,z,maxR=4){let best=null,bd=1e9;for(let r=0;r<=maxR;r+=HS){for(let a=0;a<TAU;a+=r?HS/r:TAU){const xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,i=cellIndex(xx,zz);if(i>=0&&reach[i]){const d=r;if(d<bd){bd=d;best=[xx,zz];}}}if(best)break;}return best||[x,z];}
function canStep(h0,x,z){const i=cellIndex(x,z);if(i<0||blocked[i])return false;const h=H[i];return h>SEA&&Math.abs(h-h0)<=STEP;}
function tryMove(e,dx,dz,r=.13){const h0=cellH(e.x,e.z);const l=Math.hypot(dx,dz)||1,px=-dz/l*r,pz=dx/l*r;
const ok=(nx,nz)=>canStep(h0,nx,nz)&&canStep(h0,nx+px,nz+pz)&&canStep(h0,nx-px,nz-pz)&&(!e.maxH||cellH(nx,nz)<e.maxH);
if(ok(e.x+dx,e.z+dz)){e.x+=dx;e.z+=dz;return true;}
if(Math.abs(dx)>1e-4&&ok(e.x+dx,e.z)){e.x+=dx;return true;}
if(Math.abs(dz)>1e-4&&ok(e.x,e.z+dz)){e.z+=dz;return true;}
return false;}


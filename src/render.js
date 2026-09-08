// render.js — ombres, cibles de rendu (MSAA/HDR), reflets planaires, SSAO, eau, bloom, image finale, qualité adaptative, boucle render().
// Propriétaire : GAMEPLAY (Claude Code) pour la structure ; DESIGN pour les réglages visuels (voir shaders.js).
// ---------- ombres : carte statique cuite une fois + copie par image pour les objets mobiles ----------
const shadowSize=gl.getParameter(gl.MAX_TEXTURE_SIZE)>=4096?4096:2048,shadow2Size=1024;
function depthTex(sz=shadowSize){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,sz,sz,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function depthFbo(t){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,t,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Shadow framebuffer incomplete');return f;}
const shadowStatic=depthTex(),shadowStaticFbo=depthFbo(shadowStatic),shadowTexture=depthTex(shadow2Size),shadowFbo=depthFbo(shadowTexture);let lightVP2=I4;
const lightDir=norm([-25,47,30]),lightCenter=[WORLD.x0+WORLD.size/2,5,WORLD.z0+WORLD.size/2];const lightVP=matmul(ortho(-72,72,-72,72,1,260),lookAt(add(lightCenter,mul(lightDir,120)),lightCenter));
gl.bindFramebuffer(gl.FRAMEBUFFER,shadowStaticFbo);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.viewport(0,0,shadowSize,shadowSize);gl.clear(gl.DEPTH_BUFFER_BIT);
gl.useProgram(depthProgram);gl.uniformMatrix4fv(depthLoc.uVP,false,lightVP);gl.uniformMatrix4fv(depthLoc.uBones,false,I4);gl.uniform1i(depthLoc.uMode,0);
gl.bindVertexArray(solid.vao);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.1,1.8);gl.drawArrays(gl.TRIANGLES,0,solid.count);gl.disable(gl.POLYGON_OFFSET_FILL);gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);

// ---------- rendu : MSAA, reflets planaires, SSAO, eau avec réfraction, bloom, tone mapping ----------
function invert4(m){const a=m,o=new Float32Array(16);const a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];
const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det)return o;det=1/det;
o[0]=(a11*b11-a12*b10+a13*b09)*det;o[1]=(a02*b10-a01*b11-a03*b09)*det;o[2]=(a31*b05-a32*b04+a33*b03)*det;o[3]=(a22*b04-a21*b05-a23*b03)*det;o[4]=(a12*b08-a10*b11-a13*b07)*det;o[5]=(a00*b11-a02*b08+a03*b07)*det;o[6]=(a32*b02-a30*b05-a33*b01)*det;o[7]=(a20*b05-a22*b02+a23*b01)*det;o[8]=(a10*b10-a11*b08+a13*b06)*det;o[9]=(a01*b08-a00*b10-a03*b06)*det;o[10]=(a30*b04-a31*b02+a33*b00)*det;o[11]=(a21*b02-a20*b04-a23*b00)*det;o[12]=(a11*b07-a10*b09-a12*b06)*det;o[13]=(a00*b09-a01*b07+a02*b06)*det;o[14]=(a31*b01-a30*b03-a32*b00)*det;o[15]=(a20*b03-a21*b01+a22*b00)*det;return o;}
const Q={level:3,auto:true,refl:true,ssao:true,bloom:true,dpr:1.5};
try{const q=localStorage.getItem('azura-quality');if(q&&q!=='auto'){Q.auto=false;Q.level=clamp(parseInt(q,10)||3,1,3);}}catch(e){}
function applyQuality(){Q.refl=Q.level>=3;Q.ssao=Q.level>=2;Q.bloom=true;Q.dpr=[.85,1,1.2][Q.level-1];Q.msaa=[0,2,2][Q.level-1];Q.fxaa=Q.msaa===0;Q.taps=[4,4,8][Q.level-1];resize();}
function qualityLabel(){return Q.auto?'Auto ('+['Fluide','Élevée','Ultra'][Q.level-1]+')':['Fluide','Élevée','Ultra'][Q.level-1];}
function cycleQuality(){if(Q.auto){Q.auto=false;Q.level=3;}else if(Q.level>1)Q.level--;else{Q.auto=true;Q.level=3;}try{localStorage.setItem('azura-quality',Q.auto?'auto':String(Q.level));}catch(e){}applyQuality();$('#quality').textContent='Qualité graphique : '+qualityLabel();}
$('#quality').onclick=cycleQuality;
const RT={};let W=0,H2=0;const HDR=!!(gl.getExtension('EXT_color_buffer_half_float')||gl.getExtension('EXT_color_buffer_float'));const CF=HDR?gl.RGBA16F:gl.RGBA8,CT=HDR?gl.HALF_FLOAT:gl.UNSIGNED_BYTE;
function tex2d(w,h,internal,format,type,filter){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,internal,w,h,0,format,type,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function fboOf(color,depth){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);if(color)gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,color,0);if(depth)gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depth,0);const st=gl.checkFramebufferStatus(gl.FRAMEBUFFER);if(st!==gl.FRAMEBUFFER_COMPLETE)throw Error('Framebuffer incomplete '+st);return f;}
function makeTargets(){for(const k in RT){const v=RT[k];if(v&&v.fbo)gl.deleteFramebuffer(v.fbo);if(v&&v.tex)gl.deleteTexture(v.tex);if(v&&v.rb)gl.deleteRenderbuffer(v.rb);if(v&&v.rbd)gl.deleteRenderbuffer(v.rbd);delete RT[k];}
W=canvas.width;H2=canvas.height;const w2=Math.ceil(W/2),h2=Math.ceil(H2/2),w4=Math.ceil(W/4),h4=Math.ceil(H2/4);
const samples=Math.min(Q.msaa??4,gl.getParameter(gl.MAX_SAMPLES));
{const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,samples,CF,W,H2);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,rb);const rbd=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rbd);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,samples,gl.DEPTH_COMPONENT24,W,H2);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rbd);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('MSAA framebuffer incomplete');RT.msaa={fbo,rb,rbd};}
{const tex=tex2d(W,H2,CF,gl.RGBA,CT,gl.LINEAR),depth=tex2d(W,H2,gl.DEPTH_COMPONENT24,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,gl.NEAREST);RT.scene={fbo:fboOf(tex,depth),tex};RT.depth={tex:depth};}
{const depth=tex2d(W,H2,gl.DEPTH_COMPONENT24,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,gl.NEAREST);const tex=tex2d(W,H2,CF,gl.RGBA,CT,gl.LINEAR);RT.comp={fbo:fboOf(tex,depth),tex};RT.depth2={fbo:fboOf(null,depth),tex:depth};}
{const tex=tex2d(W,H2,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,gl.LINEAR);RT.ldr={fbo:fboOf(tex,null),tex};}
{const tex=tex2d(w2,h2,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,gl.LINEAR);RT.ao={fbo:fboOf(tex,null),tex};const tex2=tex2d(w2,h2,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,gl.LINEAR);RT.aoBlur={fbo:fboOf(tex2,null),tex:tex2};}
{const tex=tex2d(w4,h4,CF,gl.RGBA,CT,gl.LINEAR);RT.bloomA={fbo:fboOf(tex,null),tex,w:w4,h:h4};const tex2=tex2d(w4,h4,CF,gl.RGBA,CT,gl.LINEAR);RT.bloomB={fbo:fboOf(tex2,null),tex:tex2,w:w4,h:h4};}
{const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);const w3=Math.ceil(W/3),h3=Math.ceil(H2/3);const tex=tex2d(w3,h3,CF,gl.RGBA,CT,gl.LINEAR);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);const rbd=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rbd);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,w3,h3);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rbd);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Reflection framebuffer incomplete');RT.refl={fbo,tex,rbd,w:w3,h:h3};}
RT.w2=w2;RT.h2=h2;gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
const EXPO=HDR?1:.62;
function resize(){cssW=canvas.clientWidth;cssH=canvas.clientHeight;const dpr=Math.min(window.devicePixelRatio||1,Q.dpr);canvas.width=Math.max(2,Math.floor(cssW*dpr));canvas.height=Math.max(2,Math.floor(cssH*dpr));makeTargets();}
applyQuality();window.addEventListener('resize',resize);
for(const t of[shadowStatic,shadowTexture]){gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);}
let visible=true,perfAcc=0,perfN=0,fpsAcc=0,fpsN=0,lastFps=0;const fpsEl=$('#fps');
document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible){lastTime=performance.now();requestAnimationFrame(render);}else if(playing)saveGame(true);});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;if(playing)saveGame(true);$('#error').hidden=false;});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
const dbg=$('#debug');
function drawDebug(){if(dbg.width!==HN){dbg.width=HN;dbg.height=HN;}const c=dbg.getContext('2d');const img=c.createImageData(HN,HN);for(let iz=0;iz<HN;iz++)for(let ix=0;ix<HN;ix++){const i=iz*HN+ix,h=H[i],o=(iz*HN+ix)*4;let r,g,b;if(h<=SEA){r=30;g=90;b=160;}else{const v=clamp((h+1)/16,0,1)*255;r=g=b=v;if(reach[i]){g=Math.min(255,v+90);r*=.55;b*=.55;}}img.data[o]=r;img.data[o+1]=g;img.data[o+2]=b;img.data[o+3]=255;}c.putImageData(img,0,0);
const dot=(x,z,col)=>{c.fillStyle=col;c.fillRect((x-WORLD.x0)/HS-2,(z-WORLD.z0)/HS-2,5,5);};dot(player.x,player.z,'#f00');for(const n of npcs)dot(n.x,n.z,n.cat?'#fa0':'#fff');for(const s of shellSpots)if(!game.shells.has(s.id))dot(s.x,s.z,'#f0f');}
function drawStatic(m,mode){gl.uniform1i(locations.uMode,mode);gl.bindVertexArray(m.vao);gl.drawArrays(gl.TRIANGLES,0,m.count);}
function frustumPlanes(m){const P=[];for(let i=0;i<3;i++)for(const sgn of[1,-1]){P.push([m[3]+sgn*m[i],m[7]+sgn*m[4+i],m[11]+sgn*m[8+i],m[15]+sgn*m[12+i]]);}return P;}
function sphereVisible(P,c,r){for(const p of P){const l=Math.hypot(p[0],p[1],p[2])||1;if((p[0]*c[0]+p[1]*c[1]+p[2]*c[2]+p[3])/l<-r)return false;}return true;}
let drawnRanges=0;
function drawSolid(VP,L){const P=frustumPlanes(VP);gl.uniform1i(L.uMode,0);gl.bindVertexArray(solid.vao);drawnRanges=0;for(const r of solidRanges){const isl=r.id&&islands.find(i=>i.id===r.id);if(isl&&!sphereVisible(P,[isl.center[0],9,isl.center[1]],isl.r+16))continue;gl.drawArrays(gl.TRIANGLES,r.start,r.end-r.start);drawnRanges++;}}
function fsQuad(){gl.bindVertexArray(null);gl.drawArrays(gl.TRIANGLES,0,3);}
let projM,invProjM,reflVP=null;
function drawScene(VP,eyeV,t,clip){const inv=invert4(VP);
gl.disable(gl.DEPTH_TEST);gl.useProgram(skyProgram);gl.uniformMatrix4fv(skyLoc.uInvVP,false,inv);gl.uniform3fv(skyLoc.uEye,eyeV);gl.uniform1f(skyLoc.uDay,dayF);gl.uniform1f(skyLoc.uDusk,duskF);gl.uniform1f(skyLoc.uTime,t);gl.uniform1f(skyLoc.uExpo,EXPO);fsQuad();gl.enable(gl.DEPTH_TEST);
const setMain=(prog,L)=>{gl.useProgram(prog);gl.uniformMatrix4fv(L.uVP,false,VP);gl.uniformMatrix4fv(L.uLight,false,lightVP);gl.uniform3fv(L.uEye,eyeV);gl.uniform1f(L.uTime,t);gl.uniform1f(L.uShadowTexel,1/shadowSize);gl.uniform1f(L.uDay,dayF);gl.uniform1f(L.uDusk,duskF);gl.uniform1f(L.uClip,clip);gl.uniform1f(L.uExpo,EXPO);gl.uniform1f(L.uDbg,Q.dbg||0);gl.uniform1i(L.uTaps,Q.taps||8);gl.uniform1f(L.uDetail,Q.detail??1);
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadowStatic);gl.uniform1i(L.uShadow,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadowTexture);gl.uniform1i(L.uShadow2,1);gl.uniformMatrix4fv(L.uLight2,false,lightVP2);gl.uniform1f(L.uShadowTexel2,1/shadow2Size);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,noiseTex);gl.uniform1i(L.uNoise,2);};
if(Q.flat){gl.useProgram(flatProgram);gl.uniformMatrix4fv(gl.getUniformLocation(flatProgram,'uVP'),false,VP);gl.bindVertexArray(solid.vao);gl.drawArrays(gl.TRIANGLES,0,solid.count);gl.bindVertexArray(null);return;}
setMain(mainStaticProgram,locationsS);gl.uniform1i(locationsS.uMode,6);gl.bindVertexArray(clouds.vao);gl.drawArrays(gl.TRIANGLES,0,clouds.count);drawSolid(VP,locationsS);
setMain(mainProgram,locations);gl.uniformMatrix4fv(locations.uBones,false,I4);
for(const d of drawList){gl.uniform1i(locations.uMode,d.mode);gl.uniformMatrix4fv(locations.uBones,false,d.bones.subarray(0,d.n*16));gl.bindVertexArray(d.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,d.mesh.count);}
gl.bindVertexArray(null);}
function bindTex(unit,tex,loc){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(loc,unit);}
function render(time){if(!visible)return;const rawDt=(time-lastTime)/1000||.016;let dt=Math.min(.05,rawDt);lastTime=time;const t=time*.001;
update(dt,t);
if(auto&&!drag)goal.theta+=dt*.10;
if(cam.mode==='follow')goal.target=[player.x,player.y+1.05,player.z];else if(cam.mode==='voyage'){goal.target=[voyage.x,1.3,voyage.z];goal.theta=voyage.heading+PI+.75;goal.phi=1.18;goal.r=10;}
const easing=1-Math.exp(-dt*(cam.mode==='follow'?9:7));
for(let k of['theta','phi','r'])current[k]+=(goal[k]-current[k])*easing;
current.target=current.target.map((v,i)=>v+(goal.target[i]-v)*easing);
let aspect=cssW/cssH,fit=aspect<1?1/Math.pow(aspect,.53):1,r=current.r*fit;
eye=add(current.target,[Math.sin(current.theta)*Math.sin(current.phi)*r,Math.cos(current.phi)*r,Math.cos(current.theta)*Math.sin(current.phi)*r]);
if(cam.mode==='follow'){let k=1;for(let i=2;i<=20;i++){const f=i/20,px=current.target[0]+(eye[0]-current.target[0])*f,py=current.target[1]+(eye[1]-current.target[1])*f,pz=current.target[2]+(eye[2]-current.target[2])*f;if(heightAt(px,pz)+.45>py){k=Math.max(.12,(i-1.5)/20);break;}}camK+=(k-camK)*(k<camK?.6:1-Math.exp(-dt*3));if(camK<.999)eye=add(current.target,mul(sub(eye,current.target),camK));const hg=heightAt(eye[0],eye[2]);if(eye[1]<hg+.6)eye[1]=hg+.6;}
if(eye[1]<.35)eye[1]=.35;
const NEAR=.2,FAR=260;projM=perspective(43*PI/180,aspect,NEAR,FAR);invProjM=invert4(projM);vp=matmul(projM,lookAt(eye,current.target));
// ombres dynamiques
{const c=[player.x,player.y+.8,player.z];lightVP2=matmul(ortho(-11,11,-11,11,1,90),lookAt(add(c,mul(lightDir,45)),c));}
gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFbo);gl.viewport(0,0,shadow2Size,shadow2Size);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(depthProgram);gl.uniformMatrix4fv(depthLoc.uVP,false,lightVP2);gl.uniform1f(depthLoc.uTime,t);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.1,1.8);
for(const d of drawList){if(d.noShadow)continue;gl.uniform1i(depthLoc.uMode,d.mode===3?3:4);gl.uniformMatrix4fv(depthLoc.uBones,false,d.bones.subarray(0,d.n*16));gl.bindVertexArray(d.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,d.mesh.count);}
gl.disable(gl.POLYGON_OFFSET_FILL);gl.bindVertexArray(null);
// reflets planaires (caméra miroir sous le plan d'eau)
if(Q.refl){const eyeR=[eye[0],-eye[1],eye[2]],tgtR=[current.target[0],-current.target[1],current.target[2]];reflVP=matmul(projM,lookAt(eyeR,tgtR));gl.bindFramebuffer(gl.FRAMEBUFFER,RT.refl.fbo);gl.viewport(0,0,RT.refl.w,RT.refl.h);gl.clearColor(.5,.7,.9,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);drawScene(reflVP,eyeR,t,1);}else reflVP=null;
// scène opaque en MSAA
gl.bindFramebuffer(gl.FRAMEBUFFER,RT.msaa.fbo);gl.viewport(0,0,W,H2);gl.clearColor(.55,.79,.88,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);drawScene(vp,eye,t,0);
// résolution MSAA → texture couleur + 2 copies de profondeur
gl.bindFramebuffer(gl.READ_FRAMEBUFFER,RT.msaa.fbo);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,RT.scene.fbo);gl.blitFramebuffer(0,0,W,H2,0,0,W,H2,gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT,gl.NEAREST);
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,RT.depth2.fbo);gl.blitFramebuffer(0,0,W,H2,0,0,W,H2,gl.DEPTH_BUFFER_BIT,gl.NEAREST);
gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
// SSAO
if(Q.ssao){gl.bindFramebuffer(gl.FRAMEBUFFER,RT.ao.fbo);gl.viewport(0,0,RT.w2,RT.h2);gl.useProgram(ssaoProgram);bindTex(0,RT.depth.tex,ssaoLoc.uDepth);gl.uniformMatrix4fv(ssaoLoc.uProj,false,projM);gl.uniformMatrix4fv(ssaoLoc.uInvProj,false,invProjM);gl.uniform2f(ssaoLoc.uRes,RT.w2,RT.h2);fsQuad();
gl.bindFramebuffer(gl.FRAMEBUFFER,RT.aoBlur.fbo);gl.useProgram(blurProgram);bindTex(0,RT.ao.tex,blurLoc.uTex);gl.uniform2f(blurLoc.uTexel,1/RT.w2,1/RT.h2);fsQuad();}
// composition (AO) puis eau avec réfraction/profondeur/reflets
gl.bindFramebuffer(gl.FRAMEBUFFER,RT.comp.fbo);gl.viewport(0,0,W,H2);gl.useProgram(compositeProgram);bindTex(0,RT.scene.tex,compLoc.uScene);bindTex(1,Q.ssao?RT.aoBlur.tex:RT.scene.tex,compLoc.uAO);gl.uniform1f(compLoc.uAOStrength,Q.ssao?.85:0);fsQuad();
if(Q.water!==false){gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.useProgram(waterProgram);gl.uniformMatrix4fv(waterLoc.uVP,false,vp);gl.uniform1f(waterLoc.uTime,t);gl.uniform3fv(waterLoc.uEye,eye);gl.uniform1f(waterLoc.uDay,dayF);gl.uniform1f(waterLoc.uDusk,duskF);gl.uniform2f(waterLoc.uRes,W,H2);gl.uniform1f(waterLoc.uNear,NEAR);gl.uniform1f(waterLoc.uFar,FAR);gl.uniform1f(waterLoc.uHasRefl,reflVP?1:0);gl.uniform1f(waterLoc.uExpo,EXPO);gl.uniform1f(waterLoc.uDetail,Q.waterDetail??2);if(reflVP)gl.uniformMatrix4fv(waterLoc.uReflVP,false,reflVP);
bindTex(0,RT.scene.tex,waterLoc.uScene);bindTex(1,RT.depth.tex,waterLoc.uDepth);bindTex(2,RT.refl.tex,waterLoc.uRefl);bindTex(3,noiseTex,waterLoc.uNoise);gl.bindVertexArray(ocean.vao);gl.drawArrays(gl.TRIANGLES,0,ocean.count);gl.bindVertexArray(null);}
gl.disable(gl.DEPTH_TEST);gl.depthMask(true);
// bloom
if(Q.bloom){gl.bindFramebuffer(gl.FRAMEBUFFER,RT.bloomA.fbo);gl.viewport(0,0,RT.bloomA.w,RT.bloomA.h);gl.useProgram(brightProgram);bindTex(0,RT.comp.tex,brightLoc.uTex);fsQuad();
gl.useProgram(gaussProgram);for(let i=0;i<2;i++){gl.bindFramebuffer(gl.FRAMEBUFFER,RT.bloomB.fbo);bindTex(0,RT.bloomA.tex,gaussLoc.uTex);gl.uniform2f(gaussLoc.uDir,1.3/RT.bloomA.w,0);fsQuad();gl.bindFramebuffer(gl.FRAMEBUFFER,RT.bloomA.fbo);bindTex(0,RT.bloomB.tex,gaussLoc.uTex);gl.uniform2f(gaussLoc.uDir,0,1.3/RT.bloomA.h);fsQuad();}}
// image finale (vers l'écran, ou vers un tampon LDR puis FXAA)
gl.bindFramebuffer(gl.FRAMEBUFFER,Q.fxaa?RT.ldr.fbo:null);gl.viewport(0,0,W,H2);gl.useProgram(finalProgram);bindTex(0,Q.raw?(Q.raw==='scene'?RT.scene.tex:Q.raw==='ao'?RT.aoBlur.tex:Q.raw==='refl'?RT.refl.tex:RT.comp.tex):RT.comp.tex,finalLoc.uScene);gl.uniform1f(finalLoc.uRaw,Q.raw?(Q.raw==='alpha'?2:1):0);bindTex(1,Q.bloom?RT.bloomA.tex:RT.comp.tex,finalLoc.uBloom);gl.uniform1f(finalLoc.uBloomK,Q.bloom?.55:0);gl.uniform1f(finalLoc.uTime,t);gl.uniform1f(finalLoc.uDay,dayF);gl.uniform1f(finalLoc.uGain,HDR?1.0:1.6);fsQuad();
if(Q.fxaa){gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(fxaaProgram);bindTex(0,RT.ldr.tex,fxaaLoc.uTex);gl.uniform2f(fxaaLoc.uTexel,1/W,1/H2);fsQuad();}
gl.enable(gl.DEPTH_TEST);
if(!dbg.hidden)drawDebug();
if(!mapEl.hidden&&playing&&frameCount%6===0&&Q.map!==false)drawMap();
frameCount++;
if(frameCount===2){window.azuraBoot?.ready();showStart();}
fpsAcc+=rawDt;fpsN++;if(fpsAcc>=.5){const f=Math.round(fpsN/fpsAcc);fpsAcc=0;fpsN=0;lastFps=f;if(!fpsEl.hidden)fpsEl.textContent=f+' im/s · '+qualityLabel()+' · '+W+'×'+H2+' · îles '+drawnRanges;}
if(frameCount>60&&Q.auto&&rawDt<.25&&document.visibilityState==='visible'){perfAcc+=rawDt;perfN++;if(perfN>=150){const avg=perfAcc/perfN;perfAcc=0;perfN=0;if(avg>1/24&&Q.level>1){Q.level--;applyQuality();toast('Qualité graphique ajustée pour rester fluide ('+qualityLabel()+')');}}}
requestAnimationFrame(render);}

window.__AZURA__={triangles:solid.count/3,vertices:solid.count,views:Object.keys(presets),seed:1729,reachCount,blocked,islands,voyage,startVoyage,currentIsland,player,npcs,crabs,goats,shellSpots,noteSpots,digSpot,fishSpot,lanterns,game,H,reach,HN,HS,cellH,reachAt:(x,z)=>reach[cellIndex(x,z)],teleport:(x,z)=>{const p=snap(x,z);player.x=p[0];player.z=p[1];player.y=cellH(p[0],p[1]);},talk:id=>talkTo(npcs.find(n=>n.id===id)),start:()=>startGame(loadSave()),save:saveGame,setClock:v=>{game.clock=v;},interact,stars,Q,applyQuality,HDR,fps:()=>lastFps,bench:(n=20)=>{const px=new Uint8Array(4);const sync=()=>{gl.bindFramebuffer(gl.FRAMEBUFFER,RT.comp.fbo);gl.readPixels(0,0,1,1,gl.RGBA,HDR?gl.HALF_FLOAT:gl.UNSIGNED_BYTE,HDR?new Uint16Array(4):px);gl.bindFramebuffer(gl.FRAMEBUFFER,null);};sync();const t0=performance.now();for(let i=0;i<n;i++)render(performance.now());sync();const total=(performance.now()-t0)/n;const t1=performance.now();for(let i=0;i<n;i++)update(.016,performance.now()*.001);const cpuUpdate=(performance.now()-t1)/n;return{total:+total.toFixed(1),cpuUpdate:+cpuUpdate.toFixed(1)};},dayF:()=>dayF,step:(dt=.016)=>update(dt,performance.now()*.001),look:(theta,phi,r,target)=>{cam.mode='cine';goal={theta,phi,r,target:[...target]};Object.assign(current,structuredClone(goal));},closeDialog:()=>{while(dialog)advance();}};
refreshHUD();
requestAnimationFrame(render);

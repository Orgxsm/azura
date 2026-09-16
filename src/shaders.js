// shaders.js — GLSL : éclairage, matériaux procéduraux, ciel, eau, SSAO, bloom, tone mapping ; création des programmes.
// Propriétaire : DESIGN pour l'aspect (couleurs, matériaux, ciel, eau) ; GAMEPLAY pour les uniforms/structure. Prévenir avant de renommer un uniform.
// ---------- shaders ----------
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function program(v,f){let p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
const boneChunk=`
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aColor;
layout(location=3) in float aBone;
uniform mat4 uBones[16];
uniform float uTime;
uniform int uMode;
vec3 animate(out vec3 n){
vec3 p=aPosition;n=aNormal;
if(uMode==3){float d=max(p.x,0.);p.z+=sin(uTime*7.-d*4.5)*.16*d;p.y+=sin(uTime*5.-d*3.)*.05*d;}
mat4 m=uBones[int(aBone+.5)];
p=(m*vec4(p,1.)).xyz;n=normalize(mat3(m)*n);
if(uMode==0&&aColor.g>aColor.r*1.25&&aColor.g>aColor.b*1.6){float w=sin(uTime*1.4+p.x*.35+p.z*.25)+.5*sin(uTime*2.3+p.z*.7);p.x+=w*.04*(1.+p.y*.04);p.z+=w*.02;}
if(uMode==6)p.x+=sin(uTime*.05)*9.;
return p;}`;
const noiseChunk=`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}`;
const texNoiseChunk=`
uniform sampler2D uNoise;
float tn(vec2 p){return texture(uNoise,p*.0625).r;}
float tfbm(vec2 p){return texture(uNoise,p*.0625).g;}`;
const skyChunk=`
vec3 skyColor(vec3 d,float day,float dusk,float t){
vec3 sunD=normalize(vec3(-25.,40.,30.));float y=clamp(d.y,-1.,1.);
vec3 dayC=mix(vec3(.8,.88,.95),vec3(.4,.64,.93),smoothstep(-.05,.6,y));
dayC=mix(dayC,vec3(.98,.9,.86),pow(1.-clamp(y,0.,1.),9.)*.3);
float sd=max(dot(d,sunD),0.);dayC+=vec3(1.,.94,.8)*(pow(sd,1400.)*2.2+pow(sd,24.)*.22+pow(sd,3.)*.1);
vec3 nightC=mix(vec3(.07,.1,.2),vec3(.01,.015,.05),smoothstep(-.05,.5,y));
vec3 g=floor(d*150.);float st=hash(g.xy+g.z*.37);float star=step(.993,st)*(.55+.45*sin(t*2.+st*90.))*smoothstep(.0,.25,y);nightC+=vec3(.9,.95,1.)*star;
vec3 moonD=normalize(vec3(20.,25.,-30.));float md=max(dot(d,moonD),0.);nightC+=vec3(.9,.92,.85)*(pow(md,2000.)*2.5+pow(md,40.)*.14);
vec3 c=mix(nightC,dayC,day);
vec3 duskC=vec3(.98,.5,.22)*pow(1.-clamp(y,0.,1.),3.)*(.45+.55*max(dot(normalize(d.xz+vec2(1e-4)),normalize(sunD.xz)),0.));
c=mix(c,c*.7+duskC,dusk*.8);return c;}`;
const vertex=`#version 300 es
precision highp float;precision highp int;
${boneChunk}
uniform mat4 uVP;uniform mat4 uLight;uniform mat4 uLight2;
out vec3 vPosition;out vec3 vNormal;out vec3 vColor;out vec4 vShadow;out vec4 vShadow2;
void main(){vec3 n;vec3 p=animate(n);vPosition=p;vNormal=n;vColor=aColor;vShadow=uLight*vec4(p,1.);vShadow2=uLight2*vec4(p,1.);gl_Position=uVP*vec4(p,1.);}`;
const fragment=`#version 300 es
precision highp float;precision highp int;
in vec3 vPosition;in vec3 vNormal;in vec3 vColor;in vec4 vShadow;in vec4 vShadow2;
uniform vec3 uEye;uniform float uTime;uniform int uMode;uniform highp sampler2DShadow uShadow;uniform highp sampler2DShadow uShadow2;uniform float uShadowTexel;uniform float uShadowTexel2;uniform float uDay;uniform float uDusk;uniform float uClip;uniform float uExpo;uniform float uDbg;uniform int uTaps;uniform float uDetail;
out vec4 outColor;
${noiseChunk}
${texNoiseChunk}
float shadow(vec3 n){float bias=max(.00035,.0018*(1.-dot(n,normalize(vec3(-25,40,30)))));vec2 o[8]=vec2[](vec2(-.7,-.2),vec2(.7,.2),vec2(-.2,.7),vec2(.2,-.7),vec2(-.5,.5),vec2(.5,-.5),vec2(.5,.6),vec2(-.6,-.6));float s=1.;
vec3 q=vShadow.xyz/vShadow.w*.5+.5;if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z<1.){float a=0.;for(int i=0;i<8;i++){if(i>=uTaps)break;a+=texture(uShadow,vec3(q.xy+o[i]*uShadowTexel*1.9,q.z-bias));}s=a/float(uTaps);}
vec3 q2=vShadow2.xyz/vShadow2.w*.5+.5;if(q2.x>0.&&q2.x<1.&&q2.y>0.&&q2.y<1.&&q2.z<1.){float a=0.;for(int i=0;i<8;i++){if(i>=uTaps)break;a+=texture(uShadow2,vec3(q2.xy+o[i]*uShadowTexel2*1.6,q2.z-bias*1.5));}s=min(s,a/float(uTaps));}return s;}
float hueOf(vec3 c){float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b)),d=mx-mn;if(d<1e-4)return 0.;float h;if(mx==c.r)h=mod((c.g-c.b)/d,6.);else if(mx==c.g)h=(c.b-c.r)/d+2.;else h=(c.r-c.g)/d+4.;return h*60.;}
void main(){if(uClip>.5&&vPosition.y<-.03)discard;if(uDbg>.5){outColor=vec4(uDbg>1.5?normalize(vNormal)*.5+.5:vColor,0.);return;}
vec3 n=normalize(vNormal);vec3 view=normalize(uEye-vPosition);if(dot(n,view)<0.)n=-n;vec3 sun=normalize(vec3(-25,40,30));vec3 c=vColor;float emis=0.;vec3 nightTint=vec3(.16,.2,.36);
if(uMode==6){float l=clamp(.35+.35*max(n.y,0.)+.45*max(dot(n,sun),0.),0.,1.);c=mix(vec3(.74,.77,.9),vec3(1.,.97,.92),l)*c;c*=mix(nightTint,vec3(1.),uDay);c=mix(c,c*vec3(1.25,.82,.7),uDusk*.6);}
else if(uMode==2){float l=.72+.22*max(n.y,0.)+.2*max(dot(n,sun),0.);c*=l;c*=mix(nightTint,vec3(1.),uDay);c=mix(c,c*vec3(1.3,.75,.6),uDusk*.6);}
else if(uMode==5){c*=1.1;emis=.45;}
else if(uMode==7){c*=1.+1.3*(1.-uDay);emis=1.-uDay*.75;}
else if(uMode==8){c*=1.05;emis=1.;}
else{float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b)),sat=(mx-mn)/max(mx,1e-3),val=mx,hue=hueOf(c);vec3 P=vPosition;
bool leaf=c.g>c.r*1.25&&c.g>c.b*1.6;bool stat=uMode==0;
bool wall=stat&&sat<.32&&val>.9&&!leaf;bool sand=stat&&!wall&&hue>35.&&hue<50.&&sat>.25&&sat<.45&&val>.85;bool rock=stat&&!wall&&!sand&&sat<.25&&val>.5&&val<.92&&!leaf;
bool tile=stat&&hue>10.&&hue<32.&&sat>.5&&val>.66;bool wood=stat&&hue>12.&&hue<35.&&val<.66&&sat>.3;bool glass=hue>150.&&hue<205.&&sat>.15&&!leaf;
float rough=.75,spec=.06;
if(uDetail<.5){}else if(sand){float r=tn(P.xz*9.+vec2(0.,P.x*2.))*.5+tn(P.xz*23.)*.3;c*=.96+r*.07;n=normalize(n+vec3(tn(P.xz*6.)-.5,0.,tn(P.xz*6.+3.)-.5)*.08);spec=.03;rough=.9;}
else if(rock){float s=sin(P.y*9.+tn(P.xz*1.5)*4.)*.5+.5;float f=tfbm(P.xz*2.+P.y);c*=vec3(.96,.93,.9)*(.9+.08*f+.03*s);rough=.9;spec=.03;}
else if(wall){float f=tfbm(P.xz*6.+P.y*6.);c*=.95+.08*f;spec=.09;rough=.7;}
else if(tile){float g=tn(P.xz*20.+P.y*20.);c*=.92+.12*g;spec=.16;rough=.45;}
else if(wood){float g=tn(vec2(P.x*3.+P.z*3.,P.y*40.));c*=.9+.16*g;spec=.14;rough=.6;}
else if(glass){spec=.7;rough=.18;c*=.9;}
else if(leaf){rough=.6;spec=.12;float f=tn(P.xz*8.+P.y*3.);c*=.9+.18*f;}
else{spec=.12;rough=.62;}
float shade=shadow(n);float ndl=dot(n,sun);float diffuse=leaf?max(0.,ndl*.55+.45):max(0.,ndl*.72+.28);
vec3 skyA=mix(vec3(.11,.14,.27),vec3(.52,.6,.86),uDay),gndA=mix(vec3(.05,.05,.09),vec3(.46,.4,.35),uDay);vec3 ambient=mix(gndA,skyA,n.y*.5+.5);ambient=mix(ambient,ambient*vec3(1.25,.85,.6),uDusk*.5);
ambient*=mix(vec3(1.),vec3(.92,.9,1.08),(1.-shade)*uDay);
vec3 sunCol=mix(vec3(.28,.33,.55)*.6,vec3(1.08,1.,.9),uDay);sunCol=mix(sunCol,sunCol*vec3(1.4,.8,.5),uDusk*.7);
float sh=mix(mix(.4,1.,shade),mix(.28,1.,shade),uDay);vec3 direct=sunCol*diffuse*sh*mix(.5,.62,uDay);
vec3 h=normalize(sun+view);float sp=pow(max(dot(n,h),0.),mix(200.,8.,rough))*spec*.7*mix(.3,1.,shade)*mix(.15,1.,uDay);
float fres=pow(1.-max(dot(n,view),0.),4.);
vec3 col=c*(ambient+direct)+sunCol*sp*(1.+diffuse)+skyA*fres*spec*.6;
if(leaf)col+=c*vec3(.9,1.,.5)*max(0.,dot(-view,sun))*.18*uDay;
if(uDetail>.5){float grain=tn(P.xz*17.+P.y*7.);col*=.985+grain*.03;}c=col;emis=sp*.5;}
float dist=length(uEye-vPosition);float hf=exp(-max(vPosition.y,0.)*.05);float fog=1.-exp(-dist*dist*.000014*(.5+hf));
vec3 fogColor=mix(vec3(.05,.07,.15),vec3(.78,.86,.95),uDay);fogColor=mix(fogColor,vec3(.96,.7,.55),uDusk*.6);if(uMode<7)c=mix(c,fogColor,min(.8,fog));
outColor=vec4(c*uExpo,emis);}`;
const vertexStatic=vertex.replace('mat4 m=uBones[int(aBone+.5)];\np=(m*vec4(p,1.)).xyz;n=normalize(mat3(m)*n);','');
const depthVertex=`#version 300 es
precision highp float;precision highp int;
${boneChunk}
uniform mat4 uVP;
void main(){vec3 n;vec3 p=animate(n);gl_Position=uVP*vec4(p,1.);}`;
const depthFragment=`#version 300 es
precision highp float;precision highp int;void main(){}`;
const quadVertex=`#version 300 es
precision highp float;precision highp int;out vec2 vUV;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));vUV=p;gl_Position=vec4(p*2.-1.,.99999,1.);}`;
const skyFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform mat4 uInvVP;uniform vec3 uEye;uniform float uDay;uniform float uDusk;uniform float uTime;uniform float uExpo;out vec4 outColor;
${noiseChunk}
${skyChunk}
void main(){vec4 w=uInvVP*vec4(vUV*2.-1.,1.,1.);vec3 d=normalize(w.xyz/w.w-uEye);vec3 c=skyColor(d,uDay,uDusk,uTime);outColor=vec4(c*uExpo,0.);}`;
const waterVertex=`#version 300 es
precision highp float;precision highp int;
layout(location=0) in vec3 aPosition;layout(location=2) in vec3 aColor;uniform mat4 uVP;uniform float uTime;out vec3 vPosition;out float vFoam;
void main(){vFoam=aColor.r;vec3 p=aPosition;p.y+=.045*sin(p.x*.63+uTime*.68)+.035*sin(p.z*.85+uTime*.87)+.022*sin(p.x*1.4+p.z*1.2-uTime);vPosition=p;gl_Position=uVP*vec4(p,1.);}`;
const waterFragment=`#version 300 es
precision highp float;precision highp int;
in vec3 vPosition;in float vFoam;uniform vec2 uFlow;uniform vec3 uEye;uniform float uTime;uniform float uDay;uniform float uDusk;uniform sampler2D uScene;uniform sampler2D uDepth;uniform sampler2D uRefl;uniform mat4 uReflVP;uniform float uHasRefl;uniform vec2 uRes;uniform float uNear;uniform float uFar;uniform float uExpo;uniform float uDetail;
out vec4 outColor;
${noiseChunk}
${texNoiseChunk}
${skyChunk}
float lin(float d){float z=d*2.-1.;return 2.*uNear*uFar/(uFar+uNear-z*(uFar-uNear));}
void main(){vec2 uv=gl_FragCoord.xy/uRes;vec3 p=vPosition;vec2 q=p.xz;vec3 view=normalize(uEye-p);vec3 sun=normalize(vec3(-25,40,30));
float sceneZ=lin(texture(uDepth,uv).r),fragZ=lin(gl_FragCoord.z);float depth=max(sceneZ-fragZ,0.);
float t=uTime;vec2 qf=q+uFlow*t;float fall=smoothstep(.8,1.,vFoam);float pool=smoothstep(.55,.72,vFoam)*(1.-fall);
vec2 g1=vec2(cos(q.x*.63+t*.68)*.028,cos(q.y*.85+t*.87)*.03);vec2 g2=vec2(cos(q.x*1.4+q.y*1.2-t)*.03,cos(q.x*1.4+q.y*1.2-t)*.026);
float e=.15;vec2 dn=vec2(0.);if(uDetail>.5){float n0=tn(qf*2.6+t*.25);dn=vec2(n0-tn(qf*2.6+vec2(e,0.)+t*.25),n0-tn(qf*2.6+vec2(0.,e)+t*.25))*.9;if(uDetail>1.5){float n1=tn(qf*7.+vec2(t*.5,0.));dn+=vec2(n1-tn(qf*7.+vec2(e+t*.5,0.)),n1-tn(qf*7.+vec2(0.,e+t*.4)))*.5;}}dn*=1.+1.5*min(1.,length(uFlow))+2.*fall;
vec3 n=normalize(vec3(-(g1.x+g2.x)-dn.x*.9,1.,-(g1.y+g2.y)-dn.y*.9));
float edge1=(length((q-vec2(0,-1.3))/vec2(12.6,11.4))-1.)*10.;float edge2=(length((q-vec2(0,7.8))/vec2(6.8,5.1))-1.)*5.;float shore=min(edge1,edge2);float shallow=exp(-max(shore,0.)*.25);
vec2 ruv=uv+n.xz*.035*clamp(depth,0.,1.);if(lin(texture(uDepth,ruv).r)<fragZ)ruv=uv;vec3 refr=texture(uScene,ruv).rgb;
vec3 shallowC=vec3(.36,.82,.8),deepC=vec3(.12,.46,.74);vec3 waterC=mix(shallowC,deepC,1.-shallow);
float absorb=1.-exp(-depth*.5);vec3 col=mix(refr,waterC,clamp(absorb*.85+.1,0.,1.));
vec3 rd=reflect(-view,n);vec3 refl=skyColor(vec3(rd.x,max(rd.y,.03),rd.z),uDay,uDusk,t);
if(uHasRefl>.5){vec4 rp=uReflVP*vec4(p,1.);vec2 rv=rp.xy/rp.w*.5+.5+n.xz*.06;if(rv.x>0.&&rv.x<1.&&rv.y>0.&&rv.y<1.&&rp.w>0.){vec4 rt=texture(uRefl,rv);refl=rt.rgb;}}
float fres=.03+.97*pow(1.-max(dot(n,view),0.),5.);col=mix(col,refl,clamp(fres*.7,0.,.7));
vec3 h=normalize(sun+view);float sp=pow(max(dot(n,h),0.),320.)*.7+pow(max(dot(n,h),0.),40.)*.08;vec3 sunCol=mix(vec3(.5,.55,.8)*.4,vec3(1.1,1.,.85),uDay);sunCol=mix(sunCol,sunCol*vec3(1.4,.75,.45),uDusk*.7);col+=sunCol*sp;
float ripple=tn(q*2.+t*.16);float foamA=1.-smoothstep(.06,.48,abs(shore-.1-.17*sin(t+q.x*.8)-ripple*.28));foamA*=smoothstep(.25,.8,ripple);
float foamD=(1.-smoothstep(.0,.35,depth))*(.55+.45*tn(qf*9.+t*.6));float foam=max(foamA*.85,foamD*.8)*mix(.35,1.,uDay);
if(length(uFlow)>0.){float streak=tn(vec2(q.x*6.,q.y*1.6+t*2.4));foam=max(foam,.22*smoothstep(.55,.9,streak));
float fs=tn(vec2(q.x*9.+t*.4,q.y*2.2-t*3.4));col=mix(col,vec3(.86,.94,.97),fall*.3);foam=max(foam,fall*(.18+.82*smoothstep(.42,.78,fs)));
float bub=tn(vec2(q.x*5.+t*.7,q.y*5.-t*.9));foam=max(foam,pool*(.25+.75*smoothstep(.45,.8,bub)));}
col=mix(col,vec3(.96,.97,.93),foam);
float band=1.-smoothstep(.03,.17,abs(shore-.7-.2*sin(t*.9+q.x*.6)));col=mix(col,vec3(.73,.96,.9),band*.15*uDay);
col*=mix(vec3(.5,.55,.8),vec3(1.),uDay);
float dist=length(uEye-p);float fog=1.-exp(-dist*dist*.000018*1.4);vec3 fogColor=mix(vec3(.05,.07,.15),vec3(.78,.86,.95),uDay);fogColor=mix(fogColor,vec3(.96,.7,.55),uDusk*.6);col=mix(col,fogColor,min(.8,fog));
outColor=vec4(col*uExpo,clamp(sp*.5,0.,1.)*(1.-fog));}`;
const ssaoFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uDepth;uniform mat4 uProj;uniform mat4 uInvProj;uniform vec2 uRes;out vec4 outColor;
${noiseChunk}
vec3 vpos(vec2 uv){float d=texture(uDepth,uv).r;vec4 v=uInvProj*vec4(uv*2.-1.,d*2.-1.,1.);return v.xyz/v.w;}
void main(){float d0=texture(uDepth,vUV).r;if(d0>=.9999){outColor=vec4(1.);return;}vec3 p=vpos(vUV);vec3 n=normalize(cross(dFdx(p),dFdy(p)));if(dot(n,-p)<0.)n=-n;
float a=hash(gl_FragCoord.xy)*6.2832;vec3 rv=vec3(cos(a),sin(a),0.);vec3 tg=normalize(rv-n*dot(rv,n));vec3 bt=cross(n,tg);mat3 tbn=mat3(tg,bt,n);
vec3 K[8]=vec3[](vec3(.1,.05,.08),vec3(-.12,.1,.06),vec3(.05,-.15,.12),vec3(-.2,-.08,.15),vec3(.22,.18,.1),vec3(-.35,.1,.3),vec3(.15,.4,.32),vec3(-.4,-.35,.25));
float radius=.7,occ=0.;for(int i=0;i<8;i++){vec3 s=p+tbn*K[i]*radius;vec4 o=uProj*vec4(s,1.);vec2 ouv=o.xy/o.w*.5+.5;if(ouv.x<0.||ouv.x>1.||ouv.y<0.||ouv.y>1.)continue;float sz=vpos(ouv).z;float rc=smoothstep(0.,1.,radius/abs(p.z-sz));occ+=(sz>=s.z+.04?1.:0.)*rc;}
float ao=1.-occ/8.;outColor=vec4(vec3(ao),1.);}`;
const blurFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uTex;uniform vec2 uTexel;out vec4 outColor;
void main(){vec4 s=vec4(0.);for(int x=-2;x<=1;x++)for(int y=-2;y<=1;y++)s+=texture(uTex,vUV+(vec2(float(x),float(y))+.5)*uTexel);outColor=s/16.;}`;
const compositeFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uScene;uniform sampler2D uAO;uniform float uAOStrength;out vec4 outColor;
void main(){vec4 s=texture(uScene,vUV);float ao=texture(uAO,vUV).r;ao=pow(clamp(ao,0.,1.),1.6);outColor=vec4(s.rgb*mix(1.,ao,uAOStrength),s.a);}`;
const brightFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uTex;out vec4 outColor;
void main(){vec4 s=texture(uTex,vUV);float l=dot(s.rgb,vec3(.3,.59,.11));float k=max(0.,l-.72)*1.2+s.a*1.2;outColor=vec4(s.rgb*k,1.);}`;
const gaussFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uTex;uniform vec2 uDir;out vec4 outColor;
void main(){float w[5]=float[](.227,.195,.122,.054,.016);vec3 c=texture(uTex,vUV).rgb*w[0];for(int i=1;i<5;i++){c+=texture(uTex,vUV+uDir*float(i)).rgb*w[i];c+=texture(uTex,vUV-uDir*float(i)).rgb*w[i];}outColor=vec4(c,1.);}`;
const finalFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uScene;uniform sampler2D uBloom;uniform float uBloomK;uniform float uTime;uniform float uDay;uniform float uRaw;uniform float uGain;out vec4 outColor;
${noiseChunk}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){if(uRaw>.5){vec4 s=texture(uScene,vUV);outColor=uRaw>1.5?vec4(vec3(s.a),1.):vec4(s.rgb,1.);return;}vec3 c=texture(uScene,vUV).rgb+texture(uBloom,vUV).rgb*uBloomK;
c*=uGain;float l0=max(dot(c,vec3(.3,.59,.11)),1e-4);float lt=aces(vec3(l0)).r;c*=lt/l0;c=mix(c,aces(c),.25);c=clamp(c,0.,1.);float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,1.22);c=(c-.5)*1.0+.5;
c=c*.97+.025;c+=vec3(.015,.005,.04)*(1.-l)*uDay-vec3(0.,.005,.02)*l*uDay;
c*=1.-.16*pow(length(vUV-.5)*1.25,2.6);c+=(hash(vUV*1731.+fract(uTime))-.5)*.008;
c=pow(max(c,vec3(0.)),vec3(.97));outColor=vec4(c,1.);}`;
const fxaaFragment=`#version 300 es
precision highp float;precision highp int;in vec2 vUV;uniform sampler2D uTex;uniform vec2 uTexel;out vec4 outColor;
float luma(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){vec3 rgbM=texture(uTex,vUV).rgb;float lM=luma(rgbM);float lNW=luma(texture(uTex,vUV+vec2(-1.,-1.)*uTexel).rgb),lNE=luma(texture(uTex,vUV+vec2(1.,-1.)*uTexel).rgb),lSW=luma(texture(uTex,vUV+vec2(-1.,1.)*uTexel).rgb),lSE=luma(texture(uTex,vUV+vec2(1.,1.)*uTexel).rgb);
float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))),lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));if(lMax-lMin<max(.04,lMax*.125)){outColor=vec4(rgbM,1.);return;}
vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));float dirReduce=max((lNW+lNE+lSW+lSE)*.03125,1./128.);float rcp=1./(min(abs(dir.x),abs(dir.y))+dirReduce);dir=clamp(dir*rcp,-8.,8.)*uTexel;
vec3 a=.5*(texture(uTex,vUV+dir*(1./3.-.5)).rgb+texture(uTex,vUV+dir*(2./3.-.5)).rgb);vec3 b=a*.5+.25*(texture(uTex,vUV-dir*.5).rgb+texture(uTex,vUV+dir*.5).rgb);float lB=luma(b);outColor=vec4((lB<lMin||lB>lMax)?a:b,1.);}`;
const hmVertex=`#version 300 es
precision highp float;layout(location=0) in vec3 aPosition;layout(location=2) in vec3 aColor;uniform mat4 uVP;out float vY;out vec3 vColor;void main(){vY=aPosition.y;vColor=aColor;gl_Position=uVP*vec4(aPosition,1.);}`;
const hmFragment=`#version 300 es
precision highp float;in float vY;in vec3 vColor;uniform float uGreen;out vec4 o;void main(){bool g=vColor.g>vColor.r*1.25&&vColor.g>vColor.b*1.6;if(g!=(uGreen>.5))discard;float t=clamp((vY+5.)/30.,0.,1.);float hi=floor(t*255.);o=vec4(hi/255.,fract(t*255.),0.,1.);}`;

const flatV=`#version 300 es
precision highp float;layout(location=0) in vec3 aPosition;layout(location=1) in vec3 aNormal;layout(location=2) in vec3 aColor;uniform mat4 uVP;out vec3 vC;void main(){vC=aColor*(.6+.4*max(0.,dot(normalize(aNormal),normalize(vec3(-25.,40.,30.)))));gl_Position=uVP*vec4(aPosition,1.);}`;
const flatF=`#version 300 es
precision highp float;in vec3 vC;out vec4 o;void main(){o=vec4(vC,0.);}`;
let flatProgram;
let mainStaticProgram;
let mainProgram,depthProgram,skyProgram,hmProgram,waterProgram,ssaoProgram,blurProgram,compositeProgram,brightProgram,gaussProgram,finalProgram,fxaaProgram;
try{flatProgram=program(flatV,flatF);mainProgram=program(vertex,fragment);mainStaticProgram=program(vertexStatic,fragment);depthProgram=program(depthVertex,depthFragment);skyProgram=program(quadVertex,skyFragment);hmProgram=program(hmVertex,hmFragment);waterProgram=program(waterVertex,waterFragment);ssaoProgram=program(quadVertex,ssaoFragment);blurProgram=program(quadVertex,blurFragment);compositeProgram=program(quadVertex,compositeFragment);brightProgram=program(quadVertex,brightFragment);gaussProgram=program(quadVertex,gaussFragment);finalProgram=program(quadVertex,finalFragment);fxaaProgram=program(quadVertex,fxaaFragment);}
catch(e){document.querySelector('#error').hidden=false;document.querySelector('#loading').style.display='none';console.error(e);throw e;}

function mesh(data){let vao=gl.createVertexArray();gl.bindVertexArray(vao);let buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12);}gl.bindVertexArray(null);return{vao,count:data.length/9};}
const solid=mesh(sceneData),ocean=mesh(oceanData),clouds=mesh(cloudData),river=mesh(riverData);
// Texture de bruit tuilée 256² : R bruit de valeur, G fbm 4 octaves, B bruit ×4, A aléa. Remplace le bruit calculé au pixel.
const noiseTex=(()=>{const N=256,d=new Uint8Array(N*N*4);const hsh=(x,y)=>{x=((x%N)+N)%N;y=((y%N)+N)%N;let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const vn=(px,py,f)=>{const sx=px*f/N,sy=py*f/N;const x0=Math.floor(sx),y0=Math.floor(sy),tx=sx-x0,ty=sy-y0,u=tx*tx*(3-2*tx),v=ty*ty*(3-2*ty);const P=f;const g=(a,b)=>hsh(((a%P)+P)%P*97,((b%P)+P)%P*57);return(g(x0,y0)*(1-u)+g(x0+1,y0)*u)*(1-v)+(g(x0,y0+1)*(1-u)+g(x0+1,y0+1)*u)*v;};
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const o=(y*N+x)*4;const n1=vn(x,y,16);let f=0,a=.5,fr=16,acc=0;for(let k=0;k<4;k++){f+=a*vn(x,y,fr);acc+=a;a*=.5;fr*=2;}d[o]=n1*255;d[o+1]=f/acc*255;d[o+2]=vn(x,y,64)*255;d[o+3]=hsh(x,y)*255;}
const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,N,N,0,gl.RGBA,gl.UNSIGNED_BYTE,d);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);return t;})();
gl.vertexAttrib4f(3,0,0,0,1);

const U=p=>new Proxy({},{get:(o,n)=>o[n]!==undefined?o[n]:(o[n]=gl.getUniformLocation(p,n))});
const locations=U(mainProgram),locationsS=U(mainStaticProgram),depthLoc=U(depthProgram),skyLoc=U(skyProgram),waterLoc=U(waterProgram),ssaoLoc=U(ssaoProgram),blurLoc=U(blurProgram),compLoc=U(compositeProgram),brightLoc=U(brightProgram),gaussLoc=U(gaussProgram),finalLoc=U(finalProgram),fxaaLoc=U(fxaaProgram);


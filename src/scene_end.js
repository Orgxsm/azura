// scene_end.js — clôture de la géométrie statique : tableaux GPU de l'archipel, de l'océan et des nuages.
// Propriétaire : partagé. Ne rien ajouter de géométrique après ce fichier.
// Pontons d'accostage déclarés dans archipel.js (dock.build) : planches + poteaux, tablier à dock.y.
for(const isl of islands){const d=isl.dock;if(!d.build)continue;const h=d.heading,len=d.len||4,w=d.width||1.6,dx=Math.sin(h),dz=Math.cos(h),sx=Math.cos(h),sz=-Math.sin(h);
for(let s=-len/2;s<len/2;s+=.22)box([d.x+dx*s,d.y-.08,d.z+dz*s],[w,.16,.205],tint(palette.trim,range(.88,1.23)),h);
for(let s=-len/2+.2;s<=len/2;s+=1.2)for(const side of[-1,1]){const px=d.x+dx*s+sx*side*w*.53,pz=d.z+dz*s+sz*side*w*.53;beam([px,-1.4,pz],[px,d.y+.42,pz],.11,palette.wood);cylinder([px,d.y+.3,pz],[px,d.y+.42,pz],.14,.14,color(0xc5b891),8);}
for(const side of[-1,1]){const px=d.x+sx*side*w*.4,pz=d.z+sz*side*w*.4;beam([px-dx*len/2,d.y-.2,pz-dz*len/2],[px+dx*len/2,d.y-.2,pz+dz*len/2],.13,palette.wood);}}
const solidVertexCount=verts.length/9;
const sceneData=new Float32Array(verts);verts=[];
// Ocean geometry is animated entirely in the GPU.
for(let x=-100;x<100;x+=2)for(let z=-100;z<100;z+=2)quad([x,0,z],[x,0,z+2],[x+2,0,z+2],[x+2,0,z],color(0x159db5));
const oceanData=new Float32Array(verts);verts=[];
// Atmosphere is kept behind the environment; soft geometry clouds catch warm light.
for(let i=0;i<18;i++){let x=range(-75,75),z=range(-90,-45),y=range(19,36);for(let j=0;j<4;j++)ellipsoid([x+j*range(2,4),y+range(-1,2),z],[range(3,7),range(2,3.5),range(2.5,4)],color(0xfffcf1),12,7,.02);}
const cloudData=new Float32Array(verts);verts=[];

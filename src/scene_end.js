// scene_end.js — clôture de la géométrie statique : tableaux GPU de l'archipel, de l'océan et des nuages.
// Propriétaire : partagé. Ne rien ajouter de géométrique après ce fichier.
const solidVertexCount=verts.length/9;
const sceneData=new Float32Array(verts);verts=[];
// Ocean geometry is animated entirely in the GPU.
for(let x=-100;x<100;x+=2)for(let z=-100;z<100;z+=2)quad([x,0,z],[x,0,z+2],[x+2,0,z+2],[x+2,0,z],color(0x159db5));
const oceanData=new Float32Array(verts);verts=[];
// Atmosphere is kept behind the environment; soft geometry clouds catch warm light.
for(let i=0;i<18;i++){let x=range(-75,75),z=range(-90,-45),y=range(19,36);for(let j=0;j<4;j++)ellipsoid([x+j*range(2,4),y+range(-1,2),z],[range(3,7),range(2,3.5),range(2.5,4)],color(0xfffcf1),12,7,.02);}
const cloudData=new Float32Array(verts);verts=[];

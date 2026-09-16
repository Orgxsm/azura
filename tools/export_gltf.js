#!/usr/bin/env node
// Exporte la géométrie statique d'Azura (une île = un fichier .glb, couleurs par sommet) + azura-scene.json
// (registre des îles, escaliers, plateformes, emprises) pour l'import dans Unreal Engine (glTF Interchange).
// Usage : node tools/export_gltf.js  → export/*.glb, export/azura-scene.json. Aucun WebGL nécessaire : le contexte est simulé.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src'),OUT=path.join(ROOT,'export');
const ORDER=['core.js','archipel.js','island.js','islands/*.js','scene_end.js','util.js','rig.js'];
const names=[];for(const n of ORDER){if(n.includes('*')){names.push(...fs.readdirSync(path.join(SRC,'islands')).filter(f=>f.endsWith('.js')).sort().map(f=>'islands/'+f));}else names.push(n);}
let js='';for(const n of names){let s=fs.readFileSync(path.join(SRC,n),'utf8');if(n.startsWith('islands/')){const id=path.basename(n,'.js');s=`sceneMarks.push({id:'${id}',start:verts.length/9});\n`+s+`\nsceneMarks[sceneMarks.length-1].end=verts.length/9;\n`;}js+=s+'\n';}
// Contexte simulé : document, canvas, gl (Proxy permissif), performance, window.
const glStub=new Proxy({},{get:(t,k)=>typeof k==='string'&&/^[A-Z_0-9]+$/.test(k)?1:()=>glStub});
const documentStub={querySelector:()=>({getContext:()=>glStub,hidden:false,style:{},addEventListener(){},classList:{add(){},remove(){}}}),querySelectorAll:()=>[],addEventListener(){},body:{},createElement:()=>({style:{},appendChild(){},setAttribute(){}})};
const sandbox={document:documentStub,window:{addEventListener(){},devicePixelRatio:1,innerWidth:1600,innerHeight:900,location:{search:''}},performance:{now:()=>0},localStorage:{getItem:()=>null,setItem(){}},navigator:{userAgent:'export'},console,Math,Float32Array,Uint8Array,Uint16Array,Int32Array,Array,Object,Error,JSON,Number,String,Boolean,setTimeout(){},requestAnimationFrame(){}};
const vm=require('vm');const ctx=vm.createContext(sandbox);
const wrapped=`(function(){\n${js}\nreturn {sceneData,riverData,sceneMarks,islands,stairDefs,platforms,terraces,houseLots:typeof houseLots!=='undefined'?houseLots:[],WORLD};})()`;
const R=vm.runInContext(wrapped,ctx,{filename:'azura-scene.js'});
fs.mkdirSync(OUT,{recursive:true});
// Familles de matériaux : mêmes heuristiques de teinte que le shader du jeu (shaders.js), une primitive glTF par famille.
const FAMILIES=['feuille','crepi','sable','roche','tuile','bois','vitre','autre'];
function hueOf(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(d<1e-4)return 0;let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return (h*60+360)%360;}
function family(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=(mx-mn)/Math.max(mx,1e-3),val=mx,hue=hueOf(r,g,b);
  if(g>r*1.25&&g>b*1.6)return 0; if(sat<.32&&val>.9)return 1; if(hue>35&&hue<50&&sat>.25&&sat<.45&&val>.85)return 2;
  if(sat<.25&&val>.5&&val<.92)return 3; if(hue>10&&hue<32&&sat>.5&&val>.66)return 4; if(hue>12&&hue<35&&val<.66&&sat>.3)return 5;
  if(hue>150&&hue<205&&sat>.15)return 6; return 7;}
function writeGLB(file,f32,start,end,name,single){ // f32 : 9 floats par sommet (pos, normale, couleur) ; sommets [start,end) ; triangles regroupés par famille
  const nTri=(end-start)/3,groups=FAMILIES.map(()=>[]);
  for(let t=0;t<nTri;t++){if(single){groups[7].push(t);continue;}const o=(start+t*3)*9;const r=(f32[o+6]+f32[o+15]+f32[o+24])/3,g=(f32[o+7]+f32[o+16]+f32[o+25])/3,b=(f32[o+8]+f32[o+17]+f32[o+26])/3;groups[family(r,g,b)].push(t);}
  const chunks=[],views=[],accs=[],prims=[],mats=[];let off=0,counts={};
  const pushView=(arr,type,comps,extra)=>{const buf=Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength);chunks.push(buf);views.push({buffer:0,byteOffset:off,byteLength:buf.length,target:34962});accs.push({bufferView:views.length-1,componentType:5126,count:arr.length/comps,type,...(extra||{})});off+=buf.length;if(off%4)throw Error('align');return accs.length-1;};
  groups.forEach((tris,gi)=>{if(!tris.length)return;const n=tris.length*3;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*4),uv=new Float32Array(n*2);const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
    tris.forEach((t,ti)=>{const base=(start+t*3)*9;const P=[0,1,2].map(k=>[f32[base+k*9],f32[base+k*9+1],f32[base+k*9+2]]);
      const ax=[P[1][0]-P[0][0],P[1][1]-P[0][1],P[1][2]-P[0][2]],bx=[P[2][0]-P[0][0],P[2][1]-P[0][1],P[2][2]-P[0][2]];const fn=[ax[1]*bx[2]-ax[2]*bx[1],ax[2]*bx[0]-ax[0]*bx[2],ax[0]*bx[1]-ax[1]*bx[0]];const dom=[0,1,2].reduce((a,k)=>Math.abs(fn[k])>Math.abs(fn[a])?k:a,0);
      for(let k=0;k<3;k++){const o=base+k*9,i=ti*3+k;for(let c=0;c<3;c++){const v=f32[o+c];pos[i*3+c]=v;mn[c]=Math.min(mn[c],v);mx[c]=Math.max(mx[c],v);}
        const nx=f32[o+3],ny=f32[o+4],nz=f32[o+5],l=Math.hypot(nx,ny,nz)||1;nor[i*3]=nx/l;nor[i*3+1]=ny/l;nor[i*3+2]=nz/l;
        col[i*4]=f32[o+6];col[i*4+1]=f32[o+7];col[i*4+2]=f32[o+8];col[i*4+3]=1;
        // UV planaire selon l'axe dominant de la face (1 unité = 1 m) : sert aux textures triplanaires simples d'Unreal
        const p=P[k];uv[i*2]=dom===0?p[2]:p[0];uv[i*2+1]=dom===1?p[2]:p[1];}});
    const ap=pushView(pos,'VEC3',3,{min:mn,max:mx}),an=pushView(nor,'VEC3',3),ac=pushView(col,'VEC4',4),au=pushView(uv,'VEC2',2);
    mats.push({name:'M_'+(single||FAMILIES[gi]),pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:gi===6?.2:gi===4?.5:.85},...(gi===0?{doubleSided:true}:{})});
    prims.push({attributes:{POSITION:ap,NORMAL:an,COLOR_0:ac,TEXCOORD_0:au},material:mats.length-1,mode:4});counts[FAMILIES[gi]]=tris.length;});
  const bin=Buffer.concat(chunks);
  const gltf={asset:{version:'2.0',generator:'azura export_gltf.js'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name}],meshes:[{name,primitives:prims}],materials:mats,buffers:[{byteLength:bin.length}],bufferViews:views,accessors:accs};
  const jsonBuf=Buffer.from(JSON.stringify(gltf));const pad=(b,fill)=>b.length%4?Buffer.concat([b,Buffer.alloc(4-b.length%4,fill)]):b;const j=pad(jsonBuf,0x20),b=pad(bin,0);
  const header=Buffer.alloc(12);header.writeUInt32LE(0x46546C67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+j.length+8+b.length,8);
  const jh=Buffer.alloc(8);jh.writeUInt32LE(j.length,0);jh.writeUInt32LE(0x4E4F534A,4);const bh=Buffer.alloc(8);bh.writeUInt32LE(b.length,0);bh.writeUInt32LE(0x004E4942,4);
  fs.writeFileSync(file,Buffer.concat([header,jh,j,bh,b]));return {triangles:nTri,familles:counts};}
const report=[];
// Azura = tout ce qui précède la première marque d'île.
const firstStart=R.sceneMarks.length?R.sceneMarks[0].start:R.sceneData.length/9;
report.push({id:'azura',...writeGLB(path.join(OUT,'azura.glb'),R.sceneData,0,firstStart,'Azura')});
for(const m of R.sceneMarks)report.push({id:m.id,...writeGLB(path.join(OUT,m.id+'.glb'),R.sceneData,m.start,m.end,m.id)});
report.push({id:'riviere',...writeGLB(path.join(OUT,'riviere.glb'),R.riverData,0,R.riverData.length/9,'riviere','eau')});
fs.writeFileSync(path.join(OUT,'azura-scene.json'),JSON.stringify({units:'meters, Y up (glTF) ; Unreal convertit en cm, Z up',world:R.WORLD,islands:R.islands,stairs:R.stairDefs,platforms:R.platforms,terraces:R.terraces,meshes:report},null,1));
console.log(report.map(r=>`${r.id}: ${r.triangles} triangles  ${JSON.stringify(r.familles)}`).join('\n'));

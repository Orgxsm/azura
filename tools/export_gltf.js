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
function writeGLB(file,f32,start,end,name){ // f32 : 9 floats par sommet (pos, normale, couleur) ; sommets [start,end)
  const n=end-start;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*4);
  const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(let i=0;i<n;i++){const o=(start+i)*9;for(let k=0;k<3;k++){const v=f32[o+k];pos[i*3+k]=v;mn[k]=Math.min(mn[k],v);mx[k]=Math.max(mx[k],v);}
    let nx=f32[o+3],ny=f32[o+4],nz=f32[o+5];const l=Math.hypot(nx,ny,nz)||1;nor[i*3]=nx/l;nor[i*3+1]=ny/l;nor[i*3+2]=nz/l;
    col[i*4]=f32[o+6];col[i*4+1]=f32[o+7];col[i*4+2]=f32[o+8];col[i*4+3]=1;}
  const bufs=[Buffer.from(pos.buffer),Buffer.from(nor.buffer),Buffer.from(col.buffer)];const bin=Buffer.concat(bufs);
  const views=[],accs=[];let off=0;
  [[pos,3,'VEC3'],[nor,3,'VEC3'],[col,4,'VEC4']].forEach(([arr,c,type],i)=>{views.push({buffer:0,byteOffset:off,byteLength:arr.byteLength,target:34962});accs.push({bufferView:i,componentType:5126,count:n,type,...(i===0?{min:mn,max:mx}:{})});off+=arr.byteLength;});
  const gltf={asset:{version:'2.0',generator:'azura export_gltf.js'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name}],meshes:[{name,primitives:[{attributes:{POSITION:0,NORMAL:1,COLOR_0:2},material:0,mode:4}]}],materials:[{name:'AzuraVertexColor',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.85}}],buffers:[{byteLength:bin.length}],bufferViews:views,accessors:accs};
  const jsonBuf=Buffer.from(JSON.stringify(gltf));const pad=b=>b.length%4?Buffer.concat([b,Buffer.alloc(4-b.length%4,b===jsonBuf?0x20:0)]):b;const j=pad(jsonBuf),b=pad(bin);
  const header=Buffer.alloc(12);header.writeUInt32LE(0x46546C67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+j.length+8+b.length,8);
  const jh=Buffer.alloc(8);jh.writeUInt32LE(j.length,0);jh.writeUInt32LE(0x4E4F534A,4);const bh=Buffer.alloc(8);bh.writeUInt32LE(b.length,0);bh.writeUInt32LE(0x004E4942,4);
  fs.writeFileSync(file,Buffer.concat([header,jh,j,bh,b]));return n/3;}
const report=[];
// Azura = tout ce qui précède la première marque d'île.
const firstStart=R.sceneMarks.length?R.sceneMarks[0].start:R.sceneData.length/9;
report.push({id:'azura',triangles:writeGLB(path.join(OUT,'azura.glb'),R.sceneData,0,firstStart,'Azura')});
for(const m of R.sceneMarks)report.push({id:m.id,triangles:writeGLB(path.join(OUT,m.id+'.glb'),R.sceneData,m.start,m.end,m.id)});
report.push({id:'riviere',triangles:writeGLB(path.join(OUT,'riviere.glb'),R.riverData,0,R.riverData.length/9,'riviere')});
fs.writeFileSync(path.join(OUT,'azura-scene.json'),JSON.stringify({units:'meters, Y up (glTF) ; Unreal convertit en cm, Z up',world:R.WORLD,islands:R.islands,stairs:R.stairDefs,platforms:R.platforms,terraces:R.terraces,meshes:report},null,1));
console.log(report.map(r=>`${r.id}: ${r.triangles} triangles`).join('\n'));

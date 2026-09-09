// farm.js — la ferme : parcelles, semis, arrosage, pousse liée aux journées, récolte, pièces, boutique (graines chez Anaé, vente chez Pia).
// Propriétaire : GAMEPLAY (Claude Code). Astra fournit plus tard des maillages de cultures plus jolis : remplacer cropMeshes[crop][stage] (bone 0, origine au sol).
const CROPS={
tomate:{name:'Tomate',icon:'🍅',seed:6,sell:16,days:1.6,color:0xe6412f,leaf:0x4f9a2a},
ble:{name:'Blé',icon:'🌾',seed:4,sell:10,days:1.1,color:0xe8c451,leaf:0x9ccf43},
fleur:{name:'Fleur de sable',icon:'🌸',seed:9,sell:26,days:2.4,color:0xf27db0,leaf:0x5e9d26},
carotte:{name:'Carotte',icon:'🥕',seed:5,sell:13,days:1.3,unlock:80,color:0xf28c28,leaf:0x4f9a2a},
mais:{name:'Maïs',icon:'🌽',seed:8,sell:22,days:2.0,unlock:140,color:0xf5d547,leaf:0x5cbb37},
fraise:{name:'Fraise',icon:'🍓',seed:10,sell:30,days:2.8,unlock:220,color:0xe0263a,leaf:0x3f9a2a}};
const CROP_IDS=Object.keys(CROPS);
const PRODUCE=Object.assign({oeuf:{name:'Œuf',icon:'🥚',sell:8},laine:{name:'Laine',icon:'🧶',sell:20}},CROPS);
function cropUnlocked(id){return !CROPS[id].unlock||(game.unlocked||[]).includes(id);}
function cropList(){return CROP_IDS.filter(cropUnlocked);}
function seedSelected(){const l=cropList();return l[Math.min(game.seedSel||0,l.length-1)];}
// agrandissement du champ (Île des Champs) : niveau 0 = 4×4 au centre, 1 = 6×6, 2 = 8×8
const FARM_LEVELS=[{ring:2,price:0},{ring:1,price:80},{ring:0,price:160}];
function cellOpen(c){if(!c.expand)return true;const lv=Math.min(game.farmLevel||0,FARM_LEVELS.length-1),r=FARM_LEVELS[lv].ring;return c.col>=r&&c.col<c.cols-r&&c.row>=r&&c.row<c.rows-r;}
const HEN_PRICE=30,HEN_MAX=4;
// Zones cultivables par île : rectangle candidat, validé cellule par cellule au chargement (sol plat, atteignable, libre).
const FARM_AREAS=[{island:'azura',x0:-5.4,z0:7.6,cols:3,rows:2,cell:1.0},{island:'champs',x0:-36,z0:6,cols:8,rows:8,cell:1,expand:true}];
function cellFlat(x,z,cell){const h=cellH(x,z);let ok=reach[cellIndex(x,z)]&&!blocked[cellIndex(x,z)];for(const [dx,dz] of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){const i=cellIndex(x+dx*cell,z+dz*cell);if(i<0||blocked[i]||H[i]<=SEA||Math.abs(H[i]-h)>.38)ok=false;}return ok;}
const farmCells=[];
for(const a of FARM_AREAS)for(let r=0;r<a.rows;r++)for(let c=0;c<a.cols;c++){const x=a.x0+(c+.5)*a.cell,z=a.z0+(r+.5)*a.cell;if(!cellFlat(x,z,a.cell))continue;farmCells.push({key:a.island+':'+c+':'+r,island:a.island,x,z,y:cellH(x,z),col:c,row:r,cols:a.cols,rows:a.rows,expand:!!a.expand,bones:new Float32Array(16),bones2:new Float32Array(16)});}
// maillages : sol bêché en sillons (sec / arrosé), plants en grille 3×3 par case, 4 stades (graines, pousses, plants, récolte). Style Hay Day : formes rondes, couleurs franches.
// Chaque maillage contient COPIES exemplaires (os 0..COPIES-1) : farmDraw regroupe les cases par maillage et dessine jusqu'à COPIES cases par appel.
const COPIES=4;
function meshDynN(build){const all=[];for(let k=0;k<COPIES;k++){const part=withBone(k,build);for(let i=0;i<part.length;i++)all.push(part[i]);}return meshDyn(new Float32Array(all));}
const SOIL=color(0x8a5a33),SOIL_WET=color(0x55331c);
function soilBuild(base){box([0,.03,0],[.98,.06,.98],tint(base,.8));for(const z of[-.31,0,.31])ellipsoid([0,.075,z],[.47,.055,.11],base,8,3,.03);for(const x of[-.49,.49])box([x,.06,0],[.04,.05,.98],tint(base,.7));for(const z of[-.49,.49])box([0,.06,z],[.98,.05,.04],tint(base,.7));}
const soilMesh=meshDynN(()=>soilBuild(SOIL));
const soilWetMesh=meshDynN(()=>{soilBuild(SOIL_WET);for(let i=0;i<6;i++)ellipsoid([-.4+i*.16,.1,-.31+(i%3)*.31],[.05,.008,.04],color(0x6d8fa3),5,2,0);});
const LEAF=color(0x5cbb37),LEAF_D=color(0x3f9a2a),LEAF_Y=color(0x9ed64a);
const stem=(a,b,r,col)=>cylinder(a,b,r,r*.9,col,4);
function sprout(p,k){stem([p[0],p[1],p[2]],[p[0],p[1]+.07*k,p[2]],.006,LEAF_D);ellipsoid([p[0]-.03*k,p[1]+.07*k,p[2]],[.035*k,.012*k,.022*k],LEAF_Y,5,2,.05);ellipsoid([p[0]+.03*k,p[1]+.075*k,p[2]+.01],[.035*k,.012*k,.022*k],LEAF,5,2,.05);}
function bush(p,r,h,col){ellipsoid([p[0],p[1]+h*.55,p[2]],[r,h*.5,r],col,7,4,.1);for(let i=0;i<3;i++){const a=i/3*TAU+p[0]*7;ellipsoid([p[0]+Math.cos(a)*r*.7,p[1]+h*.45+(i%2)*h*.2,p[2]+Math.sin(a)*r*.7],[r*.55,h*.28,r*.55],i%2?tint(col,.9):tint(col,1.08),5,3,.1);}}
function tomato(p,stage){const [x,y,z]=p;if(stage===1){sprout(p,1.1);return;}const k=stage===2?.7:1;
stem([x,y,z-.02],[x,y+.5*k,z-.02],.012,color(0xa87848));bush([x,y,z],.11*k,.42*k,stage===2?LEAF_Y:LEAF);
for(let i=0;i<2;i++){const a=i/2*TAU+x*5;ellipsoid([x+Math.cos(a)*.13*k,y+.12+i*.1*k,z+Math.sin(a)*.13*k],[.07*k,.02*k,.045*k],LEAF_D,5,2,.08);}
if(stage===3)for(let i=0;i<4;i++){const a=i/4*TAU+z*4+x,rr=.1,py=y+.14+(i%2)*.14;ellipsoid([x+Math.cos(a)*rr,py,z+Math.sin(a)*rr],[.045,.042,.045],i===1?color(0xf1602f):color(0xe23a24),6,4,.02);}
else for(let i=0;i<2;i++){const a=i/2*TAU+x;ellipsoid([x+Math.cos(a)*.08,y+.18,z+Math.sin(a)*.08],[.02,.02,.02],LEAF_Y,4,2,0);}}
function wheat(p,stage){const [x,y,z]=p;if(stage===1){sprout(p,.8);sprout([x+.05,y,z+.04],.6);return;}const k=stage===2?.62:1,gold=color(0xf0c24a),head=stage===2?LEAF_Y:gold,stalk=stage===2?LEAF:color(0xcfa84c);
for(let i=0;i<6;i++){const a=i/6*TAU+x*3,r=.045+(i%2)*.02,tx=x+Math.cos(a)*r,tz=z+Math.sin(a)*r,h=.42*k+(i%3)*.05*k,lean=(i%2?1:-1)*.03;stem([tx,y,tz],[tx+lean,y+h,tz+lean],.006,stalk);ellipsoid([tx+lean,y+h+.045*k,tz+lean],[.016,.055*k,.016],head,5,3,.05);}
for(let i=0;i<2;i++){const a=i/2*TAU+z*5;ellipsoid([x+Math.cos(a)*.06,y+.12*k,z+Math.sin(a)*.06],[.07*k,.01,.025*k],stage===2?LEAF_D:color(0xb9a24a),5,2,.05);}}
function flower(p,stage){const [x,y,z]=p;if(stage===1){sprout(p,1);return;}const k=stage===2?.75:1,pink=color(0xf46fb0),pale=color(0xffa5d2);
for(let i=0;i<5;i++){const a=i/5*TAU+x*4;ellipsoid([x+Math.cos(a)*.07*k,y+.035,z+Math.sin(a)*.07*k],[.06*k,.014,.03*k],i%2?LEAF:LEAF_D,5,2,.06);}
stem([x,y,z],[x,y+.3*k,z],.009,LEAF_D);
if(stage===3){for(let i=0;i<6;i++){const a=i/6*TAU;ellipsoid([x+Math.cos(a)*.055,y+.31,z+Math.sin(a)*.055],[.04,.012,.028],i%2?pink:pale,5,3,.04);}ellipsoid([x,y+.325,z],[.028,.02,.028],color(0xffd54a),6,3,0);}
else ellipsoid([x,y+.3*k,z],[.028,.035,.028],color(0xc9e07a),5,3,.05);}
function carrot(p,stage){const [x,y,z]=p;if(stage===1){sprout(p,.9);return;}const k=stage===2?.7:1;
for(let i=0;i<6;i++){const a=i/6*TAU+x*4,lean=.05*k;stem([x+Math.cos(a)*.02,y+.02,z+Math.sin(a)*.02],[x+Math.cos(a)*lean*2,y+.22*k,z+Math.sin(a)*lean*2],.005,LEAF_D);for(let j=0;j<3;j++)ellipsoid([x+Math.cos(a)*(.04+j*.03)*k,y+(.1+j*.05)*k,z+Math.sin(a)*(.04+j*.03)*k],[.03*k,.008,.018*k],j%2?LEAF:LEAF_Y,4,2,.05);}
if(stage===3){ellipsoid([x,y+.04,z],[.045,.035,.045],color(0xf28c28),6,3,.03);ellipsoid([x,y+.06,z],[.03,.015,.03],color(0xe07a1e),5,2,0);}}
function corn(p,stage){const [x,y,z]=p;if(stage===1){sprout(p,1.3);return;}const k=stage===2?.6:1,h=.85*k;
stem([x,y,z],[x,y+h,z],.014,LEAF_D);for(let i=0;i<5;i++){const a=i*2.1+x*3,yy=y+(.15+i*.14)*k,len=.2*k;ellipsoid([x+Math.cos(a)*len*.6,yy+.05*k,z+Math.sin(a)*len*.6],[Math.abs(Math.cos(a))*len+.02,.012,Math.abs(Math.sin(a))*len+.02],i%2?LEAF:LEAF_Y,5,2,.05);}
ellipsoid([x,y+h+.06*k,z],[.025,.07*k,.025],color(0xd9c96a),5,3,.05);
if(stage===3){ellipsoid([x+.05,y+h*.55,z],[.035,.09,.035],color(0xf5d547),6,4,.02);ellipsoid([x+.05,y+h*.55+.02,z+.02],[.03,.08,.02],LEAF,5,3,.05);ellipsoid([x+.06,y+h*.55+.1,z],[.012,.03,.012],color(0xd2b46b),4,2,0);}}
function strawberry(p,stage){const [x,y,z]=p;if(stage===1){sprout(p,.8);return;}const k=stage===2?.8:1;
for(let i=0;i<5;i++){const a=i/5*TAU+z*3;stem([x,y,z],[x+Math.cos(a)*.07*k,y+.06*k,z+Math.sin(a)*.07*k],.005,LEAF_D);ellipsoid([x+Math.cos(a)*.09*k,y+.07*k,z+Math.sin(a)*.09*k],[.04*k,.012,.03*k],i%2?LEAF:LEAF_D,5,2,.06);}
if(stage===2){for(let i=0;i<2;i++){const a=i*3+x;ellipsoid([x+Math.cos(a)*.05,y+.1,z+Math.sin(a)*.05],[.018,.008,.018],C.white,5,2,0);ellipsoid([x+Math.cos(a)*.05,y+.105,z+Math.sin(a)*.05],[.007,.006,.007],color(0xffd54a),4,2,0);}}
else{for(let i=0;i<3;i++){const a=i/3*TAU+x*2;ellipsoid([x+Math.cos(a)*.08,y+.045,z+Math.sin(a)*.08],[.028,.035,.028],i===1?color(0xf0405a):color(0xe0263a),6,4,.02);ellipsoid([x+Math.cos(a)*.08,y+.08,z+Math.sin(a)*.08],[.02,.008,.02],LEAF_D,4,2,0);}}}
const PLANT={tomate:tomato,ble:wheat,fleur:flower,carotte:carrot,mais:corn,fraise:strawberry};
const cropMeshes={};
function cropBuild(id,stage){const spots=[];for(const z of[-.31,0,.31])for(const x of[-.3,0,.3])spots.push([x+Math.sin(x*9+z*7)*.03,.1,z]);
if(stage===0){for(const p of spots){ellipsoid([p[0],.115,p[2]],[.022,.012,.016],color(0xe8d7a6),5,2,0);ellipsoid([p[0]+.05,.113,p[2]+.03],[.016,.01,.012],color(0xd9c58c),4,2,0);}return;}
for(const p of spots)PLANT[id](p,stage);}
for(const id of CROP_IDS){cropMeshes[id]=[0,1,2,3].map(stage=>meshDynN(()=>cropBuild(id,stage)));}
function farmCellAt(){let best=null,bd=.95;for(const c of farmCells){const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<bd&&Math.abs(c.y-player.y)<.6){bd=d;best=c;}}return best;}
function plotOf(c){return game.plots[c.key]||null;}
function farmNear(){const c=farmCellAt();if(!c)return coopNear()||homeNear()||sheepNear();const p=plotOf(c);
if(!p){if(!cellOpen(c)){const lv=Math.min(game.farmLevel||0,FARM_LEVELS.length-1);return{type:'farm',c,act:'locked',label:lv>=FARM_LEVELS.length-1?'Terrain en friche':`Terrain en friche : Basile l'aménage pour ${FARM_LEVELS[lv+1].price} pièces`,btn:'…'};}return{type:'farm',c,act:'till',label:'Bêcher la terre',btn:'Bêcher'};}
if(!p.crop){const sel=seedSelected(),have=game.seeds[sel]||0;return{type:'farm',c,act:'sow',label:have?`Semer ${CROPS[sel].name} (${have})`:`Semer ${CROPS[sel].name} : plus de graines, Anaé ou Basile en vendent`,btn:'Semer'};}
const cdef=CROPS[p.crop];if(p.growth>=cdef.days)return{type:'farm',c,act:'harvest',label:`Récolter ${cdef.name}`,btn:'Récolter'};
if(!p.wet)return{type:'farm',c,act:'water',label:`Arroser (${cdef.name}, ${Math.floor(p.growth/cdef.days*100)} %)`,btn:'Arroser'};
return{type:'farm',c,act:'wait',label:`${cdef.name} pousse (${Math.floor(p.growth/cdef.days*100)} %)`,btn:'…'};}
let actGesture=null;   // {th, t} — geste en cours (bêcher / arroser / récolter), 0,6 s, effet appliqué à 0,3 s
function farmInteract(th){if(th.coop)return coopInteract(th);if(th.home)return homeInteract(th);if(th.sheep)return sheepInteract(th);if(actGesture)return;
if(th.act==='till'||th.act==='water'||th.act==='harvest'){if(th.act==='water'&&!plotOf(th.c))return;const c=th.c;actGesture={th,t:0,mesh:player.mesh,pose:player.pose,applied:false};player.heading=Math.atan2(c.x-player.x,c.z-player.z);player.amp=0;player.speed=0;player.pose={till:'dig',water:'water',harvest:'harvest'}[th.act];player.farmPoseStart=performance.now()*.001;if(typeof heroFarmMeshes!=='undefined'&&heroFarmMeshes){if(th.act==='till')player.mesh=heroFarmMeshes.hoe;if(th.act==='water')player.mesh=heroFarmMeshes.can;}if(th.act==='till')sfx('dig');else if(th.act==='water')sfx('cast');return;}
farmApply(th);}
function gestureUpdate(dt){if(!actGesture)return;actGesture.t+=dt;if(!actGesture.applied&&actGesture.t>=.3){actGesture.applied=true;farmApply(actGesture.th,true);}if(actGesture.t>=.6||dialog||voyage.active||player.air){player.mesh=actGesture.mesh;player.pose=actGesture.pose;delete player.farmPoseStart;if(!actGesture.applied)farmApply(actGesture.th,true);actGesture=null;}}
function farmApply(th,silentSfx){const c=th.c,p=plotOf(c);
if(th.act==='till'){game.plots[c.key]={crop:null,growth:0,wet:false};if(!silentSfx)sfx('dig');toast('Terre bêchée. Sème avec E.');}
else if(th.act==='locked'){toast('Ce coin est en friche. Basile peut l\'aménager, à son étal.');return;}
else if(th.act==='sow'){const sel=seedSelected();if(!(game.seeds[sel]>0)){toast('Plus de graines : Anaé (Azura) ou Basile (Champs) en vendent.');return;}game.seeds[sel]--;p.crop=sel;p.growth=0;p.wet=false;sfx('pick');toast(`${CROPS[sel].icon} ${CROPS[sel].name} semée. Arrose-la chaque jour !`);}
else if(th.act==='water'){if(!p)return;p.wet=true;if(!silentSfx)sfx('cast');}
else if(th.act==='harvest'){if(!p||!p.crop)return;const cdef=CROPS[p.crop];game.produce[p.crop]=(game.produce[p.crop]||0)+1;game.harvested=(game.harvested||0)+1;p.crop=null;p.growth=0;p.wet=false;sfx('catch');toast(`${cdef.icon} ${cdef.name} récoltée ! Pia l'achète ${cdef.sell} pièces.`);if(game.harvested>=5&&game.quests.farm===1)finishQuest('farm','Première récolte');}
else return;dirty=true;refreshHUD();saveGame(true);}
let lastDayIdx=-1;
function farmUpdate(dt){const dayIdx=Math.floor(game.clock/DAY);if(dayIdx!==lastDayIdx){if(lastDayIdx>=0){for(const k in game.plots)game.plots[k].wet=false;if(game.hens>0&&game.henFedDay===lastDayIdx){game.eggs=Math.min(12,(game.eggs||0)+game.hens);if(playing)toast(`🥚 Les poules ont pondu ${game.hens} œuf${game.hens>1?'s':''} !`);}}lastDayIdx=dayIdx;}
hensUpdate(dt);sheepUpdate(dt);gestureUpdate(dt);
if(!playing)return;for(const k in game.plots){const p=game.plots[k];if(!p.crop)continue;const cdef=CROPS[p.crop];if(p.growth<cdef.days)p.growth=Math.min(cdef.days,p.growth+dt/DAY*(p.wet?1:.35));}}
const bonePool=[];let poolI=0,farmNoShadow=false;
function poolBones(){if(poolI>=bonePool.length)bonePool.push(new Float32Array(16*COPIES));return bonePool[poolI++];}
function farmDraw(t){coopDraw(t);poolI=0;
if(actGesture&&actGesture.th.act==='water'&&typeof waterDropsDraw==='function'){const B=player.bones,o=64,sc=player.scale||1,px=.3*sc,py=.235*sc,pz=.44*sc;const x=B[o]*px+B[o+4]*py+B[o+8]*pz+B[o+12],y=B[o+1]*px+B[o+5]*py+B[o+9]*pz+B[o+13],z=B[o+2]*px+B[o+6]*py+B[o+10]*pz+B[o+14];const d=waterDropsDraw(x,y,z,actGesture.t/.6);if(d)drawList.push(d);}
const groups=new Map();const put=(mesh,m,noShadow)=>{const key=noShadow?mesh:mesh.vao;let g=groups.get(key);if(!g){g={mesh,mats:[],noShadow};groups.set(key,g);}g.mats.push(m);};
for(const c of farmCells){const p=plotOf(c);if(!p||c.island!==game.island)continue;put(p.wet?soilWetMesh:soilMesh,T(c.x,c.y,c.z),true);
if(p.crop){const cdef=CROPS[p.crop],f=p.growth/cdef.days,stage=f>=1?3:f>.55?2:f>.15?1:0;const sway=Math.sin(t*1.5+c.x*2)*.04;const near=stage===3&&Math.hypot(c.x-player.x,c.z-player.z)<1.6;put(cropMeshes[p.crop][stage],mm(T(c.x,c.y+.06,c.z),RZ(sway)),!near);}}
for(const g of groups.values()){for(let i=0;i<g.mats.length;i+=COPIES){const B=poolBones();let k=0;for(;k<COPIES&&i+k<g.mats.length;k++)B.set(g.mats[i+k],k*16);if(k<COPIES)B.fill(0,k*16);drawList.push({mesh:g.mesh,bones:B,n:COPIES,mode:4,noShadow:g.noShadow||farmNoShadow,noReflect:true});}}}
function farmInventory(){const it=[`🪙 ${game.coins}`];for(const id of CROP_IDS){if(game.seeds[id])it.push(`${CROPS[id].icon}🌱×${game.seeds[id]}`);}for(const id in PRODUCE){if(game.produce[id])it.push(`${PRODUCE[id].icon}×${game.produce[id]}`);}if(game.hens)it.push(`🐔×${game.hens}`);return it;}
function farmSaveData(){return{coins:game.coins,seeds:game.seeds,produce:game.produce,plots:game.plots,harvested:game.harvested||0,seedSel:game.seedSel||0,hens:game.hens||0,henFedDay:game.henFedDay??-1,eggs:game.eggs||0,eggsTotal:game.eggsTotal||0,unlocked:game.unlocked||[],farmLevel:game.farmLevel||0,shorn:game.shorn||{},wool:game.wool||0};}
function farmLoadData(d){game.coins=d.coins??25;game.seeds=d.seeds||{tomate:3};game.produce=d.produce||{};game.plots=d.plots||{};game.harvested=d.harvested||0;game.seedSel=d.seedSel||0;game.hens=d.hens||0;game.henFedDay=d.henFedDay??-1;game.eggs=d.eggs||0;game.eggsTotal=d.eggsTotal||0;game.unlocked=d.unlocked||[];game.farmLevel=d.farmLevel||0;game.shorn=d.shorn||{};game.wool=d.wool||0;hens.length=0;for(let i=0;i<game.hens;i++)addHen(i);}
// ---------- boutique ----------
const shopEl=$('#shop');
let shopBack=null;
function openShop(mode,back){shopBack=back||null;shopEl.hidden=false;const box=shopEl.querySelector('div');box.innerHTML='';const h=document.createElement('h2');h.textContent=mode==='buy'?(shopBack?'Graines':'Graines d\'Anaé'):mode==='sell'?(shopBack?'Ta récolte':'Comptoir de Pia'):'Étal de Basile';box.appendChild(h);const p=document.createElement('p');p.textContent=`Tu as ${game.coins} pièces.`;box.appendChild(p);
if(mode==='market'){for(const [m,label] of[['buy','🌱 Acheter des graines et des poules'],['sell','🧺 Vendre ma récolte, mes œufs et ma laine']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>openShop(m,'market');box.appendChild(b);}
const lv=Math.min(game.farmLevel||0,FARM_LEVELS.length-1);if(lv<FARM_LEVELS.length-1){const nx=FARM_LEVELS[lv+1],size=8-2*nx.ring;const b=document.createElement('button');b.textContent=`🚜 Agrandir le champ en ${size} × ${size} · ${nx.price} pièces`;b.onclick=()=>{if(game.coins<nx.price){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=nx.price;game.farmLevel=lv+1;sfx('star');toast(`🚜 Le champ fait maintenant ${size} × ${size} cases !`);dirty=true;refreshHUD();openShop('market');};box.appendChild(b);}}
if(mode==='buy'){for(const id of CROP_IDS){const c=CROPS[id];const b=document.createElement('button');if(!cropUnlocked(id)){b.textContent=`🔒 ${c.icon} ${c.name} · débloquer pour ${c.unlock} pièces (graine ${c.seed}, se vend ${c.sell})`;b.onclick=()=>{if(game.coins<c.unlock){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=c.unlock;game.unlocked=(game.unlocked||[]).concat(id);game.seeds[id]=(game.seeds[id]||0)+2;sfx('star');toast(`${c.icon} ${c.name} débloquée ! 2 graines offertes. Touche ${cropList().indexOf(id)+1} pour la choisir.`);dirty=true;refreshHUD();openShop('buy',shopBack);};box.appendChild(b);continue;}
b.textContent=`${c.icon} ${c.name} · ${c.seed} pièces · pousse ${c.days} j · se vend ${c.sell}`;b.onclick=()=>{if(game.coins<c.seed){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=c.seed;game.seeds[id]=(game.seeds[id]||0)+1;sfx('pick');dirty=true;refreshHUD();openShop('buy',shopBack);};box.appendChild(b);}
if(game.quests.farm>=1){const b=document.createElement('button');const full=(game.hens||0)>=HEN_MAX;b.textContent=full?`🐔 Poulailler complet (${HEN_MAX} poules)`:`🐔 Poule · ${HEN_PRICE} pièces · pond un œuf par jour si elle mange du blé (${game.hens||0}/${HEN_MAX})`;b.onclick=()=>{if(full)return;if(game.coins<HEN_PRICE){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=HEN_PRICE;game.hens=(game.hens||0)+1;addHen(game.hens-1);startQuest('hens');sfx('pick');dirty=true;refreshHUD();toast('🐔 Ta poule t\'attend au poulailler, sur l\'Île des Champs.');openShop('buy',shopBack);};box.appendChild(b);}}
else if(mode==='sell'){let any=false;for(const id in PRODUCE){const n=game.produce[id]||0;if(!n)continue;any=true;const c=PRODUCE[id];const b=document.createElement('button');b.textContent=`Vendre ${n} ${c.name}${n>1&&id!=='ble'?'s':''} → ${n*c.sell} pièces`;b.onclick=()=>{game.coins+=n*c.sell;game.produce[id]=0;sfx('coin');dirty=true;refreshHUD();openShop('sell',shopBack);};box.appendChild(b);}
if(!any){const e=document.createElement('p');e.textContent='Rien à vendre pour l\'instant. Récolte d\'abord ta parcelle.';box.appendChild(e);}}
if(shopBack&&mode!=='market'){const back=document.createElement('button');back.className='secondary';back.textContent='← Retour à l\'étal';back.onclick=()=>openShop('market');box.appendChild(back);}
const close=document.createElement('button');close.className='secondary';close.textContent='Fermer';close.onclick=()=>{shopEl.hidden=true;shopBack=null;saveGame(true);};box.appendChild(close);}

// ---------- poulailler ----------
// Poulailler par île (case de sable plate hors des parcelles). Maillage et pose provisoires (Claude) : Astra livrera henMesh + poseHen (5 os : 0 corps, 1 tête, 2 patte G, 3 patte D, 4 queue), détectés automatiquement.
const COOPS=[{island:'champs',x:-24,z:12.7,heading:-PI/2}];
for(const c of COOPS){c.y=cellH(c.x,c.z);c.bones=new Float32Array(16);for(let dx=-.55;dx<=.55;dx+=HS)for(let dz=-.5;dz<=.5;dz+=HS){const i=cellIndex(c.x+dx,c.z+dz);if(i>=0)blocked[i]=1;}}
const coopMesh=meshDyn(new Float32Array(withBone(0,()=>{const wood=color(0x9a6a3c),dark=color(0x6b4426),straw=color(0xe0c27a);
box([0,.14,0],[.16,.28,.16],dark);for(const [x,z] of[[-.42,-.36],[.42,-.36],[-.42,.36],[.42,.36]])box([x,.14,z],[.08,.28,.08],dark);
box([0,.28,0],[1,.06,.86],wood);box([0,.62,0],[.94,.62,.8],tint(wood,1.05));
box([.48,.5,0],[.02,.28,.2],C.dark);box([0,.96,0],[1.08,.06,.94],dark);roof([0,.99,0],1.12,1.0,.36,0);
for(let i=0;i<5;i++)box([-.32+i*.16,1.02,.3],[.06,.05,.2],straw);
quad([.46,.29,-.14],[.46,.29,.14],[.9,.02,.2],[.9,.02,-.2],wood);for(let i=1;i<4;i++)box([.46+i*.11,.29-i*.068,0],[.03,.02,.34],dark);
for(let i=0;i<3;i++)ellipsoid([-.2+i*.2,.06,.7],[.06,.02,.05],color(0xf2e4c9),5,3,0);})));
const henMeshOf=()=>typeof henMesh!=='undefined'?henMesh:farmHenMesh;const henPose=(e,t)=>typeof poseHen==='function'?poseHen(e,t):poseFarmHen(e,t);
const farmHenMesh=meshDyn(rig([
[0,()=>{const w=color(0xf6efe2),br=color(0xc98d4a);ellipsoid([0,.19,0],[.11,.1,.15],w,10,6,.05);ellipsoid([0,.2,-.03],[.115,.085,.11],tint(w,.96),10,6,.05);ellipsoid([-.09,.19,0],[.035,.06,.1],br,7,4,.05);ellipsoid([.09,.19,0],[.035,.06,.1],br,7,4,.05);}],
[1,()=>{const w=color(0xf6efe2);ellipsoid([0,.31,.1],[.07,.07,.07],w,10,6,.04);ellipsoid([0,.27,.13],[.04,.04,.05],tint(w,.97),7,4,.04);cylinder([0,.28,.15],[0,.275,.21],.018,.004,color(0xf0a030),6);box([0,.37,.09],[.02,.05,.06],color(0xe0392b));ellipsoid([0,.35,.12],[.012,.02,.02],color(0xe0392b),5,3,0);ellipsoid([0,.25,.145],[.018,.028,.015],color(0xe0392b),5,3,0);box([-.045,.32,.13],[.015,.02,.01],C.dark);box([.045,.32,.13],[.015,.02,.01],C.dark);}],
[2,()=>{const o=color(0xf0a030);cylinder([-.04,.12,0],[-.045,.02,0],.012,.01,o,6);box([-.045,.01,.02],[.05,.015,.08],o);}],
[3,()=>{const o=color(0xf0a030);cylinder([.04,.12,0],[.045,.02,0],.012,.01,o,6);box([.045,.01,.02],[.05,.015,.08],o);}],
[4,()=>{const br=color(0xc98d4a);for(let i=-1;i<=1;i++)ellipsoid([i*.03,.27+.02*(1-Math.abs(i)),-.18],[.02,.07,.05],tint(br,.9+i*.05),6,4,.05);}]]));
function poseFarmHen(e,t){const B=e.bones,s=e.scale||1,a=e.amp,ph=e.phase,bob=Math.abs(Math.sin(ph))*.015*a;const root=mm(T(e.x,e.y+bob,e.z),RY(e.heading),SC(s));setBone(B,0,root);
const peck=e.peck>0?Math.sin(e.peck*PI*3)*.5+.4:0,sw=Math.sin(ph)*.6*a;
setBone(B,1,mm(root,piv([0,.27,.06],RX(peck+Math.sin(t*4+e.id)*.04*(1-a)))));
setBone(B,2,mm(root,piv([-.04,.12,0],RX(sw))));setBone(B,3,mm(root,piv([.04,.12,0],RX(-sw))));
setBone(B,4,mm(root,piv([0,.24,-.12],mm(RY(Math.sin(t*5+e.id*2)*.15),RX(Math.sin(ph*2)*.2*a)))));}
const hens=[];
function addHen(i){const c=COOPS[0];if(!c)return;let x=c.x,z=c.z;for(let k=0;k<20;k++){const a=Math.random()*TAU,r=.9+Math.random()*.6,xx=c.x+Math.cos(a)*r,zz=c.z+Math.sin(a)*r,ci=cellIndex(xx,zz);if(ci>=0&&reach[ci]&&!blocked[ci]){x=xx;z=zz;break;}}
hens.push({id:i,x,z,y:cellH(x,z),heading:Math.random()*TAU,phase:0,amp:0,speed:0,scale:1,state:'idle',t:1+Math.random()*2,peck:0,home:[c.x,c.z],bones:new Float32Array(16*5),hen:true});}
let henT=0;
function hensUpdate(dt){henT+=dt;for(const h of hens){const dx=h.x-player.x,dz=h.z-player.z,d=Math.hypot(dx,dz);
if(d<.9&&Math.abs(h.y-player.y)<.6){if(!moveEntity(h,dx+Math.sin(h.id*3+henT*3)*.4,dz+Math.cos(h.id*2+henT*2)*.4,1.7,dt))moveEntity(h,-dz,dx,1.7,dt);h.state='idle';h.t=.8;h.peck=0;if(Math.random()<dt*.8)sfx('hen');}
else if(h.state==='idle'){idleEntity(h,dt);h.t-=dt;if(h.peck>0)h.peck-=dt*1.2;else if(Math.random()<dt*.5){h.peck=1;if(d<7&&Math.random()<.25)sfx('hen');}if(h.t<=0){const a=Math.random()*TAU,r=Math.random()*1.5,tx=h.home[0]+Math.cos(a)*r,tz=h.home[1]+Math.sin(a)*r,ti=cellIndex(tx,tz);h.t=1.5+Math.random()*3;if(ti>=0&&reach[ti]&&!blocked[ti]){h.target=[tx,tz];h.state='walk';h.peck=0;}}}
else{const tx=h.target[0]-h.x,tz=h.target[1]-h.z,td=Math.hypot(tx,tz);if(td<.1||!moveEntity(h,tx,tz,.55,dt)){h.state='idle';h.t=1+Math.random()*3;}}
groundEntity(h,dt);}}
function coopNear(){const c=COOPS.find(c=>c.island===game.island);if(!c)return null;if(Math.hypot(c.x-player.x,c.z-player.z)>1.35||Math.abs(c.y-player.y)>.6)return null;const dayIdx=Math.floor(game.clock/DAY);
if(!game.hens)return{type:'farm',coop:c,act:'empty',label:'Poulailler vide : Anaé vend des poules',btn:'…'};
if(game.eggs>0)return{type:'farm',coop:c,act:'eggs',label:`Ramasser ${game.eggs} œuf${game.eggs>1?'s':''}`,btn:'Ramasser'};
if(game.henFedDay!==dayIdx)return{type:'farm',coop:c,act:'feed',label:game.produce.ble>0?`Nourrir les poules (1 blé, reste ${game.produce.ble})`:'Nourrir les poules : il faut du blé',btn:'Nourrir'};
return{type:'farm',coop:c,act:'fed',label:'Les poules sont nourries. Œufs demain matin !',btn:'…'};}
function coopInteract(th){const dayIdx=Math.floor(game.clock/DAY);
if(th.act==='empty'){toast('Anaé, au village d\'Azura, vend des poules : 30 pièces.');return;}
if(th.act==='eggs'){const n=game.eggs;game.produce.oeuf=(game.produce.oeuf||0)+n;game.eggsTotal=(game.eggsTotal||0)+n;game.eggs=0;sfx('pick');toast(`🥚 ${n} œuf${n>1?'s':''} ramassé${n>1?'s':''} ! Pia les achète 8 pièces.`);if(game.eggsTotal>=3&&game.quests.hens===1)finishQuest('hens','Le poulailler tourne');}
else if(th.act==='feed'){if(!(game.produce.ble>0)){toast('Il faut du blé : sème-en, ou achète des graines chez Anaé.');return;}game.produce.ble--;game.henFedDay=dayIdx;sfx('cast');toast('Les poules picorent le blé. Elles pondront demain matin.');}
else{toast('Les poules sont repues. Reviens demain.');return;}
dirty=true;refreshHUD();saveGame(true);}
function coopDraw(t){stakesDraw();for(const s of sheep){if(typeof poseSheep==='function'){s.scale=sheepScale(s);poseSheep(s,t);drawList.push({mesh:sheepMesh,bones:s.bones,n:7,mode:4});}}
for(const c of COOPS){setBone(c.bones,0,mm(T(c.x,c.y,c.z),RY(c.heading)));drawList.push({mesh:coopMesh,bones:c.bones,n:1,mode:4});}
for(const h of hens){henPose(h,t);drawList.push({mesh:henMeshOf(),bones:h.bones,n:5,mode:4});}}
// ---------- maison du joueur ----------
// Une maison par île (livrée par Astra dans islands/*.js) ; ici seulement la porte : dormir jusqu'au matin, point de réapparition.
const HOMES=[{island:'champs',x:-35,z:3.55,name:'ta maison des Champs'}];
for(const h of HOMES)h.y=cellH(h.x,h.z);
function homeFor(islandId){return HOMES.find(h=>h.island===islandId)||null;}
function homeNear(){const h=homeFor(game.island);if(!h)return null;if(Math.hypot(h.x-player.x,h.z-player.z)>1.2||Math.abs(h.y-player.y)>.7)return null;return{type:'farm',home:h,act:'sleep',label:'Dormir jusqu\'au matin',btn:'Dormir'};}
const fadeEl=$('#fade');
function homeInteract(th){const dayIdx=Math.floor(game.clock/DAY),target=(dayIdx+1)*DAY+DAY*.1,elapsed=target-game.clock;fadeEl.classList.add('on');sfx('cast');
const wake=()=>{game.clock=target;const was=playing;farmAdvance(elapsed);refreshHUD();dirty=true;saveGame(true);toast(`🌅 Un nouveau jour se lève sur l'Île des Champs.`);setTimeout(()=>fadeEl.classList.remove('on'),300);};
if(document.hidden)wake();else setTimeout(wake,750);}
function farmAdvance(elapsed){let left=elapsed;while(left>0){const step=Math.min(left,DAY*.05);left-=step;for(const k in game.plots){const p=game.plots[k];if(!p.crop)continue;const cdef=CROPS[p.crop];if(p.growth<cdef.days)p.growth=Math.min(cdef.days,p.growth+step/DAY*(p.wet?1:.35));}}
const dayIdx=Math.floor(game.clock/DAY);if(dayIdx!==lastDayIdx){for(const k in game.plots)game.plots[k].wet=false;if(game.hens>0&&game.henFedDay===lastDayIdx)game.eggs=Math.min(12,(game.eggs||0)+game.hens);lastDayIdx=dayIdx;}}
// ---------- moutons (décor vivant des Champs, lot 4 d'Astra : sheepMesh + poseSheep) ----------
const SHEEP_SPOTS=[[-31,18,-.4],[-34.5,17.2,1.2],[-27.6,17.6,2.6]];
const sheep=[];
if(typeof sheepMesh!=='undefined'&&sheepMesh)for(const [sx,sz,h] of SHEEP_SPOTS){const [x,z]=snap(sx,sz,2);if(!reach[cellIndex(x,z)])continue;sheep.push({id:sheep.length,x,z,y:cellH(x,z),heading:h,phase:0,amp:0,speed:0,scale:.85,look:0,state:'idle',t:1+Math.random()*4,home:[x,z],pose:'graze',bones:new Float32Array(16*7)});}
function sheepUpdate(dt){for(const s of sheep){if(s.state==='idle'){idleEntity(s,dt);s.t-=dt;s.look=Math.sin(henT*.4+s.id)*.4;if(s.t<=0){const a=Math.random()*TAU,r=Math.random()*2.2,tx=s.home[0]+Math.cos(a)*r,tz=s.home[1]+Math.sin(a)*r,ti=cellIndex(tx,tz);s.t=3+Math.random()*5;if(ti>=0&&reach[ti]&&!blocked[ti]&&Math.abs(cellH(tx,tz)-s.y)<.5){s.target=[tx,tz];s.state='walk';}}}
else{const tx=s.target[0]-s.x,tz=s.target[1]-s.z,td=Math.hypot(tx,tz);s.look=0;if(td<.12||!moveEntity(s,tx,tz,.45,dt)){s.state='idle';s.t=2+Math.random()*4;}}
groundEntity(s,dt);}}
// ---------- piquets du champ (limite de la zone aménagée) ----------
const stakeMesh=meshDyn(new Float32Array(withBone(0,()=>{beam([0,0,0],[0,.55,0],.035,color(0x9a6a3c));box([0,.58,0],[.09,.06,.09],color(0xd9c58c));})));
const stakeBones=[0,1,2,3].map(()=>new Float32Array(16));
function stakesDraw(){const a=FARM_AREAS.find(a=>a.expand&&a.island===game.island);if(!a)return;const lv=Math.min(game.farmLevel||0,FARM_LEVELS.length-1),r=FARM_LEVELS[lv].ring;if(r===0)return;const x0=a.x0+r*a.cell-.15,x1=a.x0+(a.cols-r)*a.cell+.15,z0=a.z0+r*a.cell-.15,z1=a.z0+(a.rows-r)*a.cell+.15;[[x0,z0],[x1,z0],[x0,z1],[x1,z1]].forEach(([x,z],i)=>{setBone(stakeBones[i],0,T(x,cellH(x,z),z));drawList.push({mesh:stakeMesh,bones:stakeBones[i],n:1,mode:4,noShadow:true,noReflect:true});});}
// ---------- tonte des moutons ----------
function sheepNear(){if(!sheep.length)return null;let best=null,bd=1.2;for(const s of sheep){const d=Math.hypot(s.x-player.x,s.z-player.z);if(d<bd&&Math.abs(s.y-player.y)<.6){bd=d;best=s;}}if(!best)return null;const dayIdx=Math.floor(game.clock/DAY),since=dayIdx-((game.shorn||{})[best.id]??-9);return since>=2?{type:'farm',sheep:best,act:'shear',label:'Tondre le mouton',btn:'Tondre'}:{type:'farm',sheep:best,act:'wait',label:`La laine repousse (${2-since} jour${2-since>1?'s':''})`,btn:'…'};}
function sheepInteract(th){if(th.act!=='shear'){toast('Ce mouton a été tondu il y a peu. Reviens dans un jour ou deux.');return;}const dayIdx=Math.floor(game.clock/DAY);game.shorn=game.shorn||{};game.shorn[th.sheep.id]=dayIdx;game.produce.laine=(game.produce.laine||0)+1;game.wool=(game.wool||0)+1;sfx('shear');toast('🧶 Une belle pelote de laine ! Basile ou Pia l\'achètent 20 pièces.');player.heading=Math.atan2(th.sheep.x-player.x,th.sheep.z-player.z);dirty=true;refreshHUD();saveGame(true);}
function sheepScale(s){const dayIdx=Math.floor(game.clock/DAY),since=dayIdx-((game.shorn||{})[s.id]??-9);return since>=2?.85:.7;}

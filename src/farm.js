// farm.js — la ferme : parcelles, semis, arrosage, pousse liée aux journées, récolte, pièces, boutique (graines chez Anaé, vente chez Pia).
// Propriétaire : GAMEPLAY (Claude Code). Astra fournit plus tard des maillages de cultures plus jolis : remplacer cropMeshes[crop][stage] (bone 0, origine au sol).
const CROPS={
tomate:{name:'Tomate',icon:'🍅',seed:6,sell:16,days:1.6,color:0xe6412f,leaf:0x4f9a2a},
ble:{name:'Blé',icon:'🌾',seed:4,sell:10,days:1.1,color:0xe8c451,leaf:0x9ccf43},
fleur:{name:'Fleur de sable',icon:'🌸',seed:9,sell:26,days:2.4,color:0xf27db0,leaf:0x5e9d26}};
const CROP_IDS=Object.keys(CROPS);
const PRODUCE=Object.assign({oeuf:{name:'Œuf',icon:'🥚',sell:8}},CROPS);
const HEN_PRICE=30,HEN_MAX=4;
// Zones cultivables par île : rectangle candidat, validé cellule par cellule au chargement (sol plat, atteignable, libre).
const FARM_AREAS=[{island:'azura',x0:-5.4,z0:7.6,cols:3,rows:2,cell:1.0},{island:'champs',x0:-36,z0:6,cols:8,rows:8,cell:1}];
function cellFlat(x,z,cell){const h=cellH(x,z);let ok=reach[cellIndex(x,z)]&&!blocked[cellIndex(x,z)];for(const [dx,dz] of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){const i=cellIndex(x+dx*cell,z+dz*cell);if(i<0||blocked[i]||H[i]<=SEA||Math.abs(H[i]-h)>.38)ok=false;}return ok;}
const farmCells=[];
for(const a of FARM_AREAS)for(let r=0;r<a.rows;r++)for(let c=0;c<a.cols;c++){const x=a.x0+(c+.5)*a.cell,z=a.z0+(r+.5)*a.cell;if(!cellFlat(x,z,a.cell))continue;farmCells.push({key:a.island+':'+c+':'+r,island:a.island,x,z,y:cellH(x,z),bones:new Float32Array(16),bones2:new Float32Array(16)});}
// maillages : sol bêché (sec / arrosé), plante en 3 stades par culture
const soilMesh=meshDyn(new Float32Array(withBone(0,()=>{box([0,.035,0],[.92,.07,.92],color(0x7a5230));for(let i=0;i<4;i++)box([0,.075,-.34+i*.22],[.9,.03,.07],color(0x5e3d22));})));
const soilWetMesh=meshDyn(new Float32Array(withBone(0,()=>{box([0,.035,0],[.92,.07,.92],color(0x4f3319));for(let i=0;i<4;i++)box([0,.075,-.34+i*.22],[.9,.03,.07],color(0x3d2712));})));
const cropMeshes={};
for(const id of CROP_IDS){const cdef=CROPS[id],leaf=color(cdef.leaf),fruit=color(cdef.color);cropMeshes[id]=[0,1,2,3].map(stage=>meshDyn(new Float32Array(withBone(0,()=>{
if(stage===0){for(let i=0;i<3;i++)ellipsoid([-.2+i*.2,.08,.05-i*.1],[.05,.03,.05],color(0xd9c58c),5,3,0);return;}
const n=stage===1?3:6,hgt=stage===1?.18:stage===2?.42:.55;
for(let i=0;i<n;i++){const a=i/n*TAU,r=.12+stage*.07;beam([Math.cos(a)*.05,.04,Math.sin(a)*.05],[Math.cos(a)*r,hgt*.7,Math.sin(a)*r],.012,tint(leaf,.8));ellipsoid([Math.cos(a)*r,hgt*.75,Math.sin(a)*r],[.11,.045,.07],tint(leaf,.9+i*.03),6,3,0);}
beam([0,.02,0],[0,hgt,0],.02,tint(leaf,.7));
if(id==='ble'){for(let i=0;i<n;i++){const a=i/n*TAU;beam([Math.cos(a)*.08,.02,Math.sin(a)*.08],[Math.cos(a)*.12,hgt+.1,Math.sin(a)*.12],.008,leaf);if(stage===3)ellipsoid([Math.cos(a)*.12,hgt+.12,Math.sin(a)*.12],[.03,.07,.03],fruit,5,3,0);}}
else if(stage===3){for(let i=0;i<4;i++){const a=i/4*TAU+.4;ellipsoid([Math.cos(a)*.16,hgt*.55,Math.sin(a)*.16],id==='fleur'?[.07,.03,.07]:[.06,.06,.06],fruit,7,4,0);}}
}))));}
function farmCellAt(){let best=null,bd=.95;for(const c of farmCells){const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<bd&&Math.abs(c.y-player.y)<.6){bd=d;best=c;}}return best;}
function plotOf(c){return game.plots[c.key]||null;}
function farmNear(){const c=farmCellAt();if(!c)return coopNear()||homeNear();const p=plotOf(c);
if(!p)return{type:'farm',c,act:'till',label:'Bêcher la terre',btn:'Bêcher'};
if(!p.crop){const sel=CROP_IDS[game.seedSel||0],have=game.seeds[sel]||0;return{type:'farm',c,act:'sow',label:have?`Semer ${CROPS[sel].name} (${have})`:`Semer ${CROPS[sel].name} : plus de graines, Anaé en vend`,btn:'Semer'};}
const cdef=CROPS[p.crop];if(p.growth>=cdef.days)return{type:'farm',c,act:'harvest',label:`Récolter ${cdef.name}`,btn:'Récolter'};
if(!p.wet)return{type:'farm',c,act:'water',label:`Arroser (${cdef.name}, ${Math.floor(p.growth/cdef.days*100)} %)`,btn:'Arroser'};
return{type:'farm',c,act:'wait',label:`${cdef.name} pousse (${Math.floor(p.growth/cdef.days*100)} %)`,btn:'…'};}
function farmInteract(th){if(th.coop)return coopInteract(th);if(th.home)return homeInteract(th);const c=th.c,p=plotOf(c);
if(th.act==='till'){game.plots[c.key]={crop:null,growth:0,wet:false};sfx('dig');toast('Terre bêchée. Sème avec E.');}
else if(th.act==='sow'){const sel=CROP_IDS[game.seedSel||0];if(!(game.seeds[sel]>0)){toast('Plus de graines : Anaé en vend au village.');return;}game.seeds[sel]--;p.crop=sel;p.growth=0;p.wet=false;sfx('pick');toast(`${CROPS[sel].icon} ${CROPS[sel].name} semée. Arrose-la chaque jour !`);}
else if(th.act==='water'){p.wet=true;sfx('cast');}
else if(th.act==='harvest'){const cdef=CROPS[p.crop];game.produce[p.crop]=(game.produce[p.crop]||0)+1;game.harvested=(game.harvested||0)+1;p.crop=null;p.growth=0;p.wet=false;sfx('catch');toast(`${cdef.icon} ${cdef.name} récoltée ! Pia l'achète ${cdef.sell} pièces.`);if(game.harvested>=5&&game.quests.farm===1)finishQuest('farm','Première récolte');}
else return;dirty=true;refreshHUD();saveGame(true);}
let lastDayIdx=-1;
function farmUpdate(dt){const dayIdx=Math.floor(game.clock/DAY);if(dayIdx!==lastDayIdx){if(lastDayIdx>=0){for(const k in game.plots)game.plots[k].wet=false;if(game.hens>0&&game.henFedDay===lastDayIdx){game.eggs=Math.min(12,(game.eggs||0)+game.hens);if(playing)toast(`🥚 Les poules ont pondu ${game.hens} œuf${game.hens>1?'s':''} !`);}}lastDayIdx=dayIdx;}
hensUpdate(dt);
if(!playing)return;for(const k in game.plots){const p=game.plots[k];if(!p.crop)continue;const cdef=CROPS[p.crop];if(p.growth<cdef.days)p.growth=Math.min(cdef.days,p.growth+dt/DAY*(p.wet?1:.35));}}
function farmDraw(t){coopDraw(t);for(const c of farmCells){const p=plotOf(c);if(!p)continue;setBone(c.bones,0,T(c.x,c.y,c.z));drawList.push({mesh:p.wet?soilWetMesh:soilMesh,bones:c.bones,n:1,mode:4,noShadow:true});
if(p.crop){const cdef=CROPS[p.crop],f=p.growth/cdef.days,stage=f>=1?3:f>.55?2:f>.15?1:0;const sway=Math.sin(t*1.5+c.x*2)*.04;setBone(c.bones2,0,mm(T(c.x,c.y+.06,c.z),RZ(sway)));drawList.push({mesh:cropMeshes[p.crop][stage],bones:c.bones2,n:1,mode:4});}}}
function farmInventory(){const it=[`🪙 ${game.coins}`];for(const id of CROP_IDS){if(game.seeds[id])it.push(`${CROPS[id].icon}🌱×${game.seeds[id]}`);}for(const id in PRODUCE){if(game.produce[id])it.push(`${PRODUCE[id].icon}×${game.produce[id]}`);}if(game.hens)it.push(`🐔×${game.hens}`);return it;}
function farmSaveData(){return{coins:game.coins,seeds:game.seeds,produce:game.produce,plots:game.plots,harvested:game.harvested||0,seedSel:game.seedSel||0,hens:game.hens||0,henFedDay:game.henFedDay??-1,eggs:game.eggs||0,eggsTotal:game.eggsTotal||0};}
function farmLoadData(d){game.coins=d.coins??25;game.seeds=d.seeds||{tomate:3};game.produce=d.produce||{};game.plots=d.plots||{};game.harvested=d.harvested||0;game.seedSel=d.seedSel||0;game.hens=d.hens||0;game.henFedDay=d.henFedDay??-1;game.eggs=d.eggs||0;game.eggsTotal=d.eggsTotal||0;hens.length=0;for(let i=0;i<game.hens;i++)addHen(i);}
// ---------- boutique ----------
const shopEl=$('#shop');
function openShop(mode){shopEl.hidden=false;const box=shopEl.querySelector('div');box.innerHTML='';const h=document.createElement('h2');h.textContent=mode==='buy'?'Graines d\'Anaé':'Comptoir de Pia';box.appendChild(h);const p=document.createElement('p');p.textContent=`Tu as ${game.coins} pièces.`;box.appendChild(p);
if(mode==='buy'){for(const id of CROP_IDS){const c=CROPS[id];const b=document.createElement('button');b.textContent=`${c.icon} ${c.name} · ${c.seed} pièces · pousse ${c.days} j · se vend ${c.sell}`;b.onclick=()=>{if(game.coins<c.seed){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=c.seed;game.seeds[id]=(game.seeds[id]||0)+1;sfx('pick');dirty=true;refreshHUD();openShop('buy');};box.appendChild(b);}
if(game.quests.farm>=1){const b=document.createElement('button');const full=(game.hens||0)>=HEN_MAX;b.textContent=full?`🐔 Poulailler complet (${HEN_MAX} poules)`:`🐔 Poule · ${HEN_PRICE} pièces · pond un œuf par jour si elle mange du blé (${game.hens||0}/${HEN_MAX})`;b.onclick=()=>{if(full)return;if(game.coins<HEN_PRICE){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=HEN_PRICE;game.hens=(game.hens||0)+1;addHen(game.hens-1);startQuest('hens');sfx('pick');dirty=true;refreshHUD();toast('🐔 Ta poule t\'attend au poulailler, sur l\'Île des Champs.');openShop('buy');};box.appendChild(b);}}
else{let any=false;for(const id in PRODUCE){const n=game.produce[id]||0;if(!n)continue;any=true;const c=PRODUCE[id];const b=document.createElement('button');b.textContent=`Vendre ${n} ${c.name}${n>1&&id!=='ble'?'s':''} → ${n*c.sell} pièces`;b.onclick=()=>{game.coins+=n*c.sell;game.produce[id]=0;sfx('star');dirty=true;refreshHUD();openShop('sell');};box.appendChild(b);}
if(!any){const e=document.createElement('p');e.textContent='Rien à vendre pour l\'instant. Récolte d\'abord ta parcelle.';box.appendChild(e);}}
const close=document.createElement('button');close.className='secondary';close.textContent='Fermer';close.onclick=()=>{shopEl.hidden=true;saveGame(true);};box.appendChild(close);}

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
if(d<.9&&Math.abs(h.y-player.y)<.6){if(!moveEntity(h,dx+Math.sin(h.id*3+henT*3)*.4,dz+Math.cos(h.id*2+henT*2)*.4,1.7,dt))moveEntity(h,-dz,dx,1.7,dt);h.state='idle';h.t=.8;h.peck=0;if(Math.random()<dt*.8)sfx('crab');}
else if(h.state==='idle'){idleEntity(h,dt);h.t-=dt;if(h.peck>0)h.peck-=dt*1.2;else if(Math.random()<dt*.5)h.peck=1;if(h.t<=0){const a=Math.random()*TAU,r=Math.random()*1.5,tx=h.home[0]+Math.cos(a)*r,tz=h.home[1]+Math.sin(a)*r,ti=cellIndex(tx,tz);h.t=1.5+Math.random()*3;if(ti>=0&&reach[ti]&&!blocked[ti]){h.target=[tx,tz];h.state='walk';h.peck=0;}}}
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
function coopDraw(t){for(const c of COOPS){setBone(c.bones,0,mm(T(c.x,c.y,c.z),RY(c.heading)));drawList.push({mesh:coopMesh,bones:c.bones,n:1,mode:4});}
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

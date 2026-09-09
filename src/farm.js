// farm.js — la ferme : parcelles, semis, arrosage, pousse liée aux journées, récolte, pièces, boutique (graines chez Anaé, vente chez Pia).
// Propriétaire : GAMEPLAY (Claude Code). Astra fournit plus tard des maillages de cultures plus jolis : remplacer cropMeshes[crop][stage] (bone 0, origine au sol).
const CROPS={
tomate:{name:'Tomate',icon:'🍅',seed:6,sell:16,days:1.6,color:0xe6412f,leaf:0x4f9a2a},
ble:{name:'Blé',icon:'🌾',seed:4,sell:10,days:1.1,color:0xe8c451,leaf:0x9ccf43},
fleur:{name:'Fleur de sable',icon:'🌸',seed:9,sell:26,days:2.4,color:0xf27db0,leaf:0x5e9d26}};
const CROP_IDS=Object.keys(CROPS);
// Zones cultivables par île : rectangle candidat, validé cellule par cellule au chargement (sol plat, atteignable, libre).
const FARM_AREAS=[{island:'azura',x0:-5.4,z0:7.6,cols:3,rows:2,cell:1.0}];
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
function farmNear(){const c=farmCellAt();if(!c)return null;const p=plotOf(c);
if(!p)return{type:'farm',c,act:'till',label:'Bêcher la terre',btn:'Bêcher'};
if(!p.crop){const sel=CROP_IDS[game.seedSel||0],have=game.seeds[sel]||0;return{type:'farm',c,act:'sow',label:have?`Semer ${CROPS[sel].name} (${have})`:`Semer ${CROPS[sel].name} : plus de graines, Anaé en vend`,btn:'Semer'};}
const cdef=CROPS[p.crop];if(p.growth>=cdef.days)return{type:'farm',c,act:'harvest',label:`Récolter ${cdef.name}`,btn:'Récolter'};
if(!p.wet)return{type:'farm',c,act:'water',label:`Arroser (${cdef.name}, ${Math.floor(p.growth/cdef.days*100)} %)`,btn:'Arroser'};
return{type:'farm',c,act:'wait',label:`${cdef.name} pousse (${Math.floor(p.growth/cdef.days*100)} %)`,btn:'…'};}
function farmInteract(th){const c=th.c,p=plotOf(c);
if(th.act==='till'){game.plots[c.key]={crop:null,growth:0,wet:false};sfx('dig');toast('Terre bêchée. Sème avec E.');}
else if(th.act==='sow'){const sel=CROP_IDS[game.seedSel||0];if(!(game.seeds[sel]>0)){toast('Plus de graines : Anaé en vend au village.');return;}game.seeds[sel]--;p.crop=sel;p.growth=0;p.wet=false;sfx('pick');toast(`${CROPS[sel].icon} ${CROPS[sel].name} semée. Arrose-la chaque jour !`);}
else if(th.act==='water'){p.wet=true;sfx('cast');}
else if(th.act==='harvest'){const cdef=CROPS[p.crop];game.produce[p.crop]=(game.produce[p.crop]||0)+1;game.harvested=(game.harvested||0)+1;p.crop=null;p.growth=0;p.wet=false;sfx('catch');toast(`${cdef.icon} ${cdef.name} récoltée ! Pia l'achète ${cdef.sell} pièces.`);if(game.harvested>=5&&game.quests.farm===1)finishQuest('farm','Première récolte');}
else return;dirty=true;refreshHUD();saveGame(true);}
let lastDayIdx=-1;
function farmUpdate(dt){const dayIdx=Math.floor(game.clock/DAY);if(dayIdx!==lastDayIdx){if(lastDayIdx>=0)for(const k in game.plots)game.plots[k].wet=false;lastDayIdx=dayIdx;}
if(!playing)return;for(const k in game.plots){const p=game.plots[k];if(!p.crop)continue;const cdef=CROPS[p.crop];if(p.growth<cdef.days)p.growth=Math.min(cdef.days,p.growth+dt/DAY*(p.wet?1:.35));}}
function farmDraw(t){for(const c of farmCells){const p=plotOf(c);if(!p)continue;setBone(c.bones,0,T(c.x,c.y,c.z));drawList.push({mesh:p.wet?soilWetMesh:soilMesh,bones:c.bones,n:1,mode:4,noShadow:true});
if(p.crop){const cdef=CROPS[p.crop],f=p.growth/cdef.days,stage=f>=1?3:f>.55?2:f>.15?1:0;const sway=Math.sin(t*1.5+c.x*2)*.04;setBone(c.bones2,0,mm(T(c.x,c.y+.06,c.z),RZ(sway)));drawList.push({mesh:cropMeshes[p.crop][stage],bones:c.bones2,n:1,mode:4});}}}
function farmInventory(){const it=[`🪙 ${game.coins}`];for(const id of CROP_IDS){if(game.seeds[id])it.push(`${CROPS[id].icon}🌱×${game.seeds[id]}`);}for(const id of CROP_IDS){if(game.produce[id])it.push(`${CROPS[id].icon}×${game.produce[id]}`);}return it;}
function farmSaveData(){return{coins:game.coins,seeds:game.seeds,produce:game.produce,plots:game.plots,harvested:game.harvested||0,seedSel:game.seedSel||0};}
function farmLoadData(d){game.coins=d.coins??25;game.seeds=d.seeds||{tomate:3};game.produce=d.produce||{};game.plots=d.plots||{};game.harvested=d.harvested||0;game.seedSel=d.seedSel||0;}
// ---------- boutique ----------
const shopEl=$('#shop');
function openShop(mode){shopEl.hidden=false;const box=shopEl.querySelector('div');box.innerHTML='';const h=document.createElement('h2');h.textContent=mode==='buy'?'Graines d\'Anaé':'Comptoir de Pia';box.appendChild(h);const p=document.createElement('p');p.textContent=`Tu as ${game.coins} pièces.`;box.appendChild(p);
if(mode==='buy'){for(const id of CROP_IDS){const c=CROPS[id];const b=document.createElement('button');b.textContent=`${c.icon} ${c.name} · ${c.seed} pièces · pousse ${c.days} j · se vend ${c.sell}`;b.onclick=()=>{if(game.coins<c.seed){toast('Pas assez de pièces.');sfx('fail');return;}game.coins-=c.seed;game.seeds[id]=(game.seeds[id]||0)+1;sfx('pick');dirty=true;refreshHUD();openShop('buy');};box.appendChild(b);}}
else{let any=false;for(const id of CROP_IDS){const n=game.produce[id]||0;if(!n)continue;any=true;const c=CROPS[id];const b=document.createElement('button');b.textContent=`Vendre ${n} ${c.name}${n>1?'s':''} → ${n*c.sell} pièces`;b.onclick=()=>{game.coins+=n*c.sell;game.produce[id]=0;sfx('star');dirty=true;refreshHUD();openShop('sell');};box.appendChild(b);}
if(!any){const e=document.createElement('p');e.textContent='Rien à vendre pour l\'instant. Récolte d\'abord ta parcelle.';box.appendChild(e);}}
const close=document.createElement('button');close.className='secondary';close.textContent='Fermer';close.onclick=()=>{shopEl.hidden=true;saveGame(true);};box.appendChild(close);}

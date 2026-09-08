// game.js — état du jeu, PNJ, quêtes, dialogues, sauvegarde, interface, caméra, entrées, mini-carte, boucle update().
// Propriétaire : GAMEPLAY (Claude Code).
// ---------- état du jeu ----------
const SAVE_KEY='azura-save-v1',DAY=540;
const game={name:'',shells:new Set(),notes:new Set(),quests:{shells:0,cat:0,crabs:0,bread:0,treasure:0,fish:0,notes:0,goats:0,oil:0},goatsCaught:0,oil:false,log:[],discovered:{},playtime:0,clock:DAY*.1,catFollow:false,crabsCaught:0,fish:0,delivered:{},dug:false,fireworksUntil:-1,finale:false,island:'azura'};
let playing=false,dialog=null,dirty=false,lastSave=0,minigame=null;
const NAMES={tomas:'Tomas',anae:'Anaé',lila:'Lila',oro:'Oro',pia:'Pia',marco:'Marco',bastien:'Bastien',cat:'Pistache',gardien:'Elio'};
function makeEntity(id,mesh,x,z,o={}){const e=Object.assign({id,mesh,x,z,y:0,heading:PI,phase:0,amp:0,speed:0,bones:new Float32Array(16*6),look:0},o);e.scale=o.scale||1;e.y=cellH(x,z);return e;}
const player=makeEntity('hero',heroMesh,SPAWN[0],SPAWN[1]);
const npcDefs=[
{id:'tomas',name:'Tomas le pêcheur',x:-4.2,z:15.2,leash:1.2,speed:1},
{id:'lila',name:'Lila',x:2.6,z:10.4,leash:2.6,speed:2.2,scale:.7},
{id:'anae',name:'Anaé',x:-3.3,z:3.9,leash:.9,speed:.8,scale:.92},
{id:'oro',name:'Oro, le gardien',x:2.1,z:-4.9,leash:.5,speed:.9},
{id:'pia',name:'Pia',x:-7,z:7.2,leash:1.5,speed:1.3,scale:.95},
{id:'marco',name:'Marco',x:3.8,z:7.9,leash:1.5,speed:1.4,scale:1.02},
{id:'bastien',name:'Bastien le musicien',x:-.3,z:.3,leash:.4,speed:.9,scale:.98,pose:'guitar'},
{id:'cat',name:'Pistache',x:.3,z:-1,leash:1.2,speed:1.6,cat:true},
{id:'gardien',name:'Elio, le gardien du phare',x:34.5,z:-22.5,leash:1.2,speed:.8}];
const npcs=npcDefs.map(d=>{const [x,z]=snap(d.x,d.z);return makeEntity(d.id,npcMeshes[d.id]||npcMeshes.oro,x,z,{name:d.name,leash:d.leash,walk:d.speed,scale:d.scale,cat:!!d.cat,pose:d.pose,home:[x,z],state:'idle',t:1+Math.random()*3,said:0,heading:Math.random()*TAU});});
const cat=npcs.find(n=>n.cat),anae=npcs.find(n=>n.id==='anae');
const shellSpots=[[-3,10.8],[-1.2,11.4],[1.4,11.6],[3.5,10.9],[4.9,9.5],[-4.7,9.3],[.5,8.2],[-4.5,15.9],[-9.6,2],[8.6,3.2],[.4,-.2],[1.2,-4.4]].map((p,i)=>{const [x,z]=snap(p[0],p[1]);return{id:i,x,z,y:cellH(x,z)};});
const noteSpots=[[-3.6,12.6],[-4.4,4.1],[2.2,-4.1]].map((p,i)=>{const [x,z]=snap(p[0],p[1]);return{id:i,x,z,y:cellH(x,z)};});
const digSpot=(()=>{const [x,z]=snap(-9.2,3.6);return{x,z,y:cellH(x,z)};})();
const fishSpot=(()=>{const [x,z]=snap(-4.2,15.9);return{x,z,y:cellH(x,z)};})();
const places=[{id:'village',name:'Le village',x:-2.5,z:3,r:3.5,minY:3},{id:'port',name:'La crique',x:-4.2,z:14.5,r:2.4,minY:0},{id:'summit',name:'Le belvédère',x:1.7,z:-5,r:2.5,minY:9.4},{id:'phare',name:"La crique du Phare",x:35.5,z:-8,r:4,minY:.3}];
const gulls=Array.from({length:6},(_,i)=>({cx:range(-4,3),cz:range(6,14),R:range(4,9),h:range(9,17),w:range(.16,.3)*(i%2?1:-1),ph:range(0,TAU),bones:new Float32Array(48)}));
const crabs=[[-3,10.6],[0,11.2],[2.6,10.9],[4.2,9.6],[-4.6,8.8],[1.2,8.7]].map((p,i)=>{const [x,z]=snap(p[0],p[1]);return{id:i,x,z,y:cellH(x,z),heading:Math.random()*TAU,phase:0,amp:0,speed:0,scale:1,state:'idle',t:Math.random()*3,home:[x,z],maxH:1.2,bones:new Float32Array(48),hidden:false,crab:true};});
const goatMeshOf=()=>typeof goatMesh!=='undefined'?goatMesh:(npcMeshes.goat||npcMeshes.cat);const goatPose=(e,t)=>typeof poseGoat==='function'?poseGoat(e,t):poseCat(e,t);
const goats=[[31.5,-15.5],[36.5,-13.5],[38.5,-19.5]].map((p,i)=>{const [x,z]=snap(p[0],p[1]);return{id:i,x,z,y:cellH(x,z),heading:Math.random()*TAU,phase:0,amp:0,speed:0,scale:typeof goatMesh!=='undefined'||npcMeshes.goat?1:1.7,state:'idle',t:Math.random()*3,home:[x,z],bones:new Float32Array(16*8),hidden:false,goat:true};});
const lanterns=[[-3.3,10.8],[-4.6,15.6],[-2.0,3.5],[4.3,4.1],[1.4,-.1],[2.4,-4.1],[5.0,10.3],[-5.6,8.9],[-8.6,3.0]].map(p=>{const [x,z]=snap(p[0],p[1],2);return{x,z,y:cellH(x,z),bones:new Float32Array(16)};});
const fireflies=Array.from({length:14},(_,i)=>({cx:i<7?-.6:-3.3,cz:i<7?-1.5:2.9,cy:i<7?7.3:3.8,ph:range(0,TAU),r:range(.6,2.2),h:range(.6,1.8)}));
const fireflyBones=new Float32Array(16*14);
const summitTower={x:.8,y:13.5,z:-6.8,r:1.12,h:4.2};
const flagBase=[summitTower.x,summitTower.y+summitTower.h+summitTower.r*.72+.28,summitTower.z];
const boats={moored:{x:-6,y:.53,z:14.1,rot:-.13,bones:new Float32Array(16)},sail:{a:0,bones:new Float32Array(32)}};
const chestBones=new Float32Array(32),crossBones=new Float32Array(16);

// ---------- sauvegarde ----------
function saveGame(silent){const d={v:2,name:game.name,x:player.x,z:player.z,heading:player.heading,cam:{theta:goal.theta,phi:goal.phi,r:goal.r},shells:[...game.shells],notes:[...game.notes],quests:game.quests,log:game.log,discovered:game.discovered,playtime:game.playtime,clock:game.clock,catFollow:game.catFollow,crabsCaught:game.crabsCaught,fish:game.fish,delivered:game.delivered,dug:game.dug,finale:game.finale,island:game.island,goatsCaught:game.goatsCaught,oil:game.oil,cat:[cat.x,cat.z],said:Object.fromEntries(npcs.map(n=>[n.id,n.said])),savedAt:Date.now()};
try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch(e){if(!silent)toast("Sauvegarde impossible sur ce navigateur");return;}dirty=false;lastSave=performance.now();if(!silent)toast('Partie sauvegardée ✓');}
function loadSave(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));return d&&(d.v===1||d.v===2)?d:null;}catch(e){return null;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function applySave(d){const [x,z]=snap(d.x,d.z);player.x=x;player.z=z;player.y=cellH(x,z);player.heading=d.heading||PI;game.name=d.name||'';game.shells=new Set(d.shells||[]);game.notes=new Set(d.notes||[]);Object.assign(game.quests,d.quests||{});game.log=d.log||Object.keys(game.quests).filter(k=>game.quests[k]>0);game.discovered=d.discovered||{};game.playtime=d.playtime||0;game.clock=d.clock??DAY*.1;game.catFollow=!!d.catFollow;game.crabsCaught=d.crabsCaught||0;game.fish=d.fish||0;game.delivered=d.delivered||{};game.dug=!!d.dug;game.finale=!!d.finale;game.island=d.island||'azura';game.goatsCaught=d.goatsCaught||0;game.oil=!!d.oil;
if(d.cat){const [cx,cz]=snap(d.cat[0],d.cat[1]);cat.x=cx;cat.z=cz;cat.y=cellH(cx,cz);}
if(game.quests.cat===2){cat.home=[anae.home[0]+.6,anae.home[1]+.4];}
for(const n of npcs)n.said=(d.said||{})[n.id]||0;
if(d.cam){goal.theta=d.cam.theta;goal.phi=clamp(d.cam.phi,.35,1.46);goal.r=clamp(d.cam.r,4,16);Object.assign(current,structuredClone(goal));}}
function fmtTime(s){const m=Math.round(s/60);return m<1?'moins d\'une minute':m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min';}
const doneCount=q=>Object.values(q).filter(v=>v===2).length;
function stars(){return Object.keys(game.discovered).length+doneCount(game.quests);}
const TOTAL=13;

// ---------- jour / nuit ----------
let dayF=1,duskF=0;
function updateClock(dt){if(playing)game.clock+=dt;const ph=(game.clock/DAY)%1,sun=Math.sin(ph*TAU);let d=clamp((sun+.12)/.34,0,1);dayF=d*d*(3-2*d);duskF=1-clamp(Math.abs(sun)/.22,0,1);return sun;}
function dayIcon(){const sun=Math.sin(((game.clock/DAY)%1)*TAU);return sun>.15?'☀️':sun>-.12?'🌅':'🌙';}

// ---------- interface ----------
const stats=$('#stats'),questText=$('#quest-text'),invEl=$('#inv'),promptEl=$('#prompt'),dialogEl=$('#dialog'),toastEl=$('#toast'),actionBtn=$('#action'),panel=$('#panel');
let toastTimer=0;
function toast(msg){toastEl.textContent=msg;toastEl.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.hidden=true,3000);}
const questTexts={
shells:()=>game.shells.size>=8?"Retourne voir Tomas sur le ponton avec tes coquillages.":`Rapporte 8 coquillages à Tomas (${game.shells.size}/8). Cherche sur la plage et le ponton.`,
cat:()=>game.catFollow?"Ramène Pistache à Anaé, devant sa maison.":"Retrouve Pistache, le chat d'Anaé, sur les hauteurs du village.",
crabs:()=>game.crabsCaught>=3?"Retourne voir Lila sur la plage.":`Attrape 3 crabes sur la plage pour Lila (${game.crabsCaught}/3). Approche-toi vite et appuie sur E.`,
bread:()=>{const left=['marco','tomas','oro'].filter(k=>!game.delivered[k]);return left.length?`Livre le pain de Pia à ${left.map(k=>NAMES[k]).join(', ')}.`:"Retourne voir Pia, près du ponton.";},
treasure:()=>"Trésor de Marco : « Sous le palmier qui penche vers la mer, à l'ouest de la crique, là où le sable touche la roche. » Creuse avec E.",
fish:()=>game.fish>=3?"Apporte les 3 poissons à Anaé pour sa soupe.":`Pêche 3 poissons au bout du ponton (${game.fish}/3).`,
notes:()=>game.notes.size>=3?"Rapporte les partitions à Bastien, sur la terrasse du haut.":`Retrouve les 3 partitions de Bastien (${game.notes.size}/3). Le vent les a dispersées.`,
goats:()=>game.goatsCaught>=3?"Retourne voir Elio, au sommet de l'Île du Phare.":`Rattrape les 3 chèvres d'Elio sur les pentes de l'Île du Phare (${game.goatsCaught}/3). Approche-toi et appuie sur E.`,
oil:()=>game.oil?"Rapporte le bidon d'huile à Elio, au sommet de l'Île du Phare.":"La lampe du phare est éteinte : va chercher le bidon d'huile chez Tomas, sur le ponton d'Azura (le voilier fait la traversée)."};
function objective(){const active=game.log.filter(id=>game.quests[id]===1);if(active.length)return active.slice(-2).reverse().map(id=>'• '+questTexts[id]()).join('\n');
const q=game.quests;if(q.shells===0)return"Explore l'île et parle aux habitants. Tomas t'attend sur le ponton.";const todo=[['cat','Anaé, dans le village, a besoin d\'aide.'],['crabs','Lila, sur la plage, a une idée de jeu.'],['bread','Pia, près du ponton, sort son pain du four.'],['treasure','Marco, sur la plage, a trouvé quelque chose.'],['fish','Reparle à Tomas : il a une canne à te prêter.'],['notes','Bastien joue de la guitare sur la terrasse du haut. Va l\'écouter.'],['goats','Prends le voilier de Tomas : Elio, le gardien du phare, a besoin d\'aide au sommet de son île.']].filter(([k])=>q[k]===0);
if(todo.length)return todo[0][1];const disc=Object.keys(game.discovered).length;if(disc<places.length)return`Découvre tous les lieux de l'archipel (${disc}/${places.length}). Il reste ${places.filter(p=>!game.discovered[p.id]).map(p=>p.name.toLowerCase()).join(', ')}.`;
return stars()>=TOTAL?"Tu as tout découvert. Va saluer Oro au belvédère, puis profite de la fête !":"Continue d'explorer.";}
function inventory(){const it=[];const bread=game.quests.bread===1?3-Object.keys(game.delivered).length:0;if(bread>0)it.push(`🍞 ×${bread}`);if(game.quests.fish>=1)it.push('🎣 canne');if(game.fish>0&&game.quests.fish===1)it.push(`🐟 ×${game.fish}`);if(game.quests.treasure===1)it.push('🗺️ carte');if(game.dug)it.push('⚓ ancre d\'or');if(game.notes.size&&game.quests.notes===1)it.push(`🎵 ×${game.notes.size}`);if(game.oil&&game.quests.oil===1)it.push('🛢️ huile');return it.join('  ');}
function refreshHUD(){stats.textContent=`🐚 ${game.shells.size}/12 · ⭐ ${stars()}/${TOTAL} · ${dayIcon()}`;questText.textContent=objective();const inv=inventory();invEl.hidden=!inv;invEl.textContent=inv;}
function startQuest(id){if(game.quests[id]===0){game.quests[id]=1;if(!game.log.includes(id))game.log.push(id);dirty=true;refreshHUD();}}
function finishQuest(id,msg){game.quests[id]=2;star(msg);}
function star(msg){toast('⭐ '+msg);sfx('star');refreshHUD();dirty=true;saveGame(true);if(stars()>=TOTAL&&!game.finale){game.finale=true;setTimeout(()=>toast('🏆 Dix étoiles ! Oro t\'attend au belvédère.'),3200);}}
function say(name,lines,onEnd){dialog={name,lines,i:0,onEnd};showLine();sfx('talk');}
function showLine(){dialogEl.querySelector('b').textContent=dialog.name;dialogEl.querySelector('p').textContent=dialog.lines[dialog.i];dialogEl.querySelector('i').textContent=(dialog.i<dialog.lines.length-1?'CONTINUER':'FERMER')+' · ESPACE';dialogEl.hidden=false;promptEl.hidden=true;actionBtn.textContent=dialog.i<dialog.lines.length-1?'Suite':'Fermer';actionBtn.hidden=false;}
function advance(){if(!dialog)return;dialog.i++;if(dialog.i>=dialog.lines.length){const d=dialog;dialog=null;dialogEl.hidden=true;for(const n of npcs)n.talking=false;if(d.onEnd)d.onEnd();refreshHUD();}else{showLine();sfx('talk');}}
dialogEl.addEventListener('click',advance);
function linesFor(n){const q=game.quests,sh=game.shells.size,me=game.name||'petit',pick=a=>a[n.said++%a.length];const pre=[];
if(n.id==='tomas'&&q.oil===1&&!game.oil){game.oil=true;dirty=true;refreshHUD();pre.push("Le bidon d'huile d'Elio ? Je l'avais mis de côté. Tiens, et dis-lui que sa lampe nous manque, la nuit.");}
if(q.bread===1&&['marco','tomas','oro'].includes(n.id)&&!game.delivered[n.id]){game.delivered[n.id]=true;dirty=true;refreshHUD();pre.push({marco:"Du pain de Pia ? Encore chaud ! Tu me sauves la journée.",tomas:"Une miche de Pia ! Avec un poisson grillé, c'est un festin.",oro:"Le pain de Pia, monté jusqu'ici ? Tu es brave. Merci."}[n.id]);}
const wrap=r=>{r.lines=[...pre,...r.lines];return r;};
switch(n.id){
case'tomas':if(q.shells===0)return wrap({lines:[`Salut, ${me} ! La marée a laissé des coquillages partout sur la plage et le long des rochers.`,"Si tu m'en rapportes huit, je te confie un secret de marin."],end:()=>startQuest('shells')});
if(q.shells===1&&sh<8)return wrap({lines:[`Il m'en faut huit et tu en as ${sh}. Regarde sur le sable, au bout du ponton et jusqu'au pied des rochers.`]});
if(q.shells===1)return wrap({lines:["Huit coquillages ! Tu as l'œil, toi.","Voilà le secret : quand le vent tourne, la mer chante. Écoute-la depuis le belvédère.","Le voilier au large, c'est le mien. Un jour, je t'emmènerai de l'autre côté."],end:()=>finishQuest('shells','Tomas te fait confiance')});
if(q.fish===0)return wrap({lines:["Tiens, prends ma vieille canne. Anaé prépare une soupe pour la fête du village et il lui manque du poisson.","Va au bout du ponton et appuie sur E quand le curseur passe dans la zone verte. Trois poissons, et elle sera aux anges."],end:()=>startQuest('fish')});
if(q.fish===1&&game.fish<3)return wrap({lines:[`Alors, ça mord ? Tu as ${game.fish} poisson${game.fish>1?'s':''}. Le bout du ponton, c'est là que ça mord le mieux.`]});
if(q.fish===1)return wrap({lines:["Trois beaux poissons ! File les porter à Anaé avant que les mouettes s'en mêlent."]});
return wrap({lines:[pick(["Mon voilier t'attend au bout du ponton : place-toi devant lui et appuie sur E, il te mènera à l'Île du Phare.","Belle journée pour la pêche, non ?","Les mouettes me volent la moitié de mes prises.","Le vieux Oro dit qu'il voit le continent depuis le belvédère. Moi, je vois surtout des nuages.","La nuit, la mer devient toute noire et les lanternes s'allument. C'est mon moment préféré."])]});
case'anae':if(q.fish===1&&game.fish>=3)return wrap({lines:["Trois poissons ! Ma soupe sera la meilleure de la fête.","Tiens, goûte : une louche pour toi, et ma reconnaissance éternelle."],end:()=>finishQuest('fish','La soupe d\'Anaé est sauvée')});
if(q.cat===0)return wrap({lines:[`Ah, une nouvelle tête ! Tu t'appelles ${me}, c'est ça ? Mon chat Pistache a encore filé.`,"Il adore traîner sur les hauteurs, près des maisons du haut. Ramène-le-moi, veux-tu ?"],end:()=>startQuest('cat')});
if(q.cat===1&&!game.catFollow)return wrap({lines:["Pistache doit être quelque part au-dessus du village. Approche-toi de lui et appelle-le, il te suivra."]});
if(q.cat===1&&game.catFollow&&Math.hypot(cat.x-n.x,cat.z-n.z)<4)return wrap({lines:["Pistache ! Te voilà, vilain chat.",`Merci mille fois, ${me}. Tiens, prends ces figues du jardin, elles sont excellentes.`],end:()=>{game.catFollow=false;cat.home=[n.home[0]+.6,n.home[1]+.4];cat.state='idle';cat.t=1;finishQuest('cat','Pistache est rentré');}});
if(q.cat===1)return wrap({lines:["Pistache ne te suit plus ? Va le rechercher, il n'a pas pu aller bien loin."]});
return wrap({lines:[pick(["Pistache ronronne. Tout va bien dans le monde.","Les toits d'argile, c'est mon grand-père qui les a posés.","Si tu montes au belvédère, dis bonjour à Oro de ma part.","Bastien joue tous les soirs sur la terrasse du haut. Écoute, ça porte jusqu'ici."])]});
case'lila':if(q.crabs===0)return wrap({lines:["Tu sais courir vite ? Les crabes de la plage, eux, oui !","On fait un jeu : attrape-m'en trois. Il faut les coincer contre les rochers et appuyer sur E. Prêt ?"],end:()=>startQuest('crabs')});
if(q.crabs===1&&game.crabsCaught<3)return wrap({lines:[`${game.crabsCaught} sur 3 ! Cours après eux, ils se cachent près des rochers et du ponton.`]});
if(q.crabs===1)return wrap({lines:["Trois crabes ! Tu es plus rapide que Marco.","Je les relâche, hein. Ils ont une famille, les crabes."],end:()=>{for(const c of crabs)c.hidden=false;finishQuest('crabs','Champion des crabes');}});
return wrap({lines:[pick(["Tu as vu les mouettes ? Elles tournent au-dessus de la crique toute la journée.","Papa dit que du belvédère on voit jusqu'au continent !","J'ai compté : il y a douze coquillages sur toute l'île. Enfin, je crois.","Le bateau blanc, c'est celui de Tomas. Il fait le tour de l'île tous les matins.","La nuit, il y a des lucioles sur la terrasse d'Anaé. Des centaines ! Bon, quatorze."])]});
case'pia':if(q.bread===0)return wrap({lines:["Tu sens ? Mon pain sort du four. Tu veux bien m'aider ?","Porte une miche à Marco sur la plage, une à Tomas sur le ponton et une à Oro, tout en haut. Reviens me voir après."],end:()=>{game.delivered={};startQuest('bread');}});
if(q.bread===1&&Object.keys(game.delivered).length<3)return wrap({lines:[`Il reste ${['marco','tomas','oro'].filter(k=>!game.delivered[k]).map(k=>NAMES[k]).join(' et ')} à livrer. Le pain se garde, mais pas éternellement !`]});
if(q.bread===1)return wrap({lines:["Tout le monde a eu son pain ? Tu es un amour.","Garde la dernière miche pour toi. Et reviens quand tu veux, le four est toujours chaud."],end:()=>finishQuest('bread','Livraison de pain accomplie')});
return wrap({lines:[pick(["Bienvenue à Azura. Ici, tout le monde se connaît.","Les escaliers sont raides, mais la vue vaut le détour.","Mon four est allumé, tu sens le pain ?","À la fête du village, on danse jusqu'au lever du soleil."])]});
case'marco':if(q.treasure===0)return wrap({lines:["Regarde ce que j'ai trouvé dans un vieux tonneau : une carte, avec un poème !","« Sous le palmier qui penche vers la mer, à l'ouest de la crique, là où le sable touche la roche. »","Moi j'ai le vertige et les crabes me font peur. Va creuser, on partage !"],end:()=>startQuest('treasure')});
if(q.treasure===1)return wrap({lines:["Alors, ce trésor ? Un palmier qui penche vers la mer, à l'ouest de la crique… Il y a une croix dans le sable, paraît-il."]});
if(q.treasure===2&&!n.thanked){n.thanked=true;return wrap({lines:["Une ancre d'or ! On est riches ! Enfin… on est contents.","Garde-la, tu l'as bien méritée. Moi je garde le poème."]});}
return wrap({lines:[pick(["J'ai tressé ce chapeau moi-même. Le tien n'est pas mal non plus.","Les tuiles rouges, il faut les changer après chaque tempête.","Un jour je construirai une maison tout en haut, près de la tour.","Le soir, je regarde les lanternes s'allumer une à une. Ça vaut tous les trésors."])]});
case'bastien':if(q.notes===0)return wrap({lines:["♪ Sur l'île d'Azura, les toits sont d'argile… ♪ Ah, bonjour !","Le vent a emporté mes trois partitions. Une vers le ponton, une vers le parvis d'Anaé, une vers le belvédère, je crois.","Sans elles, je joue toujours la même chanson. Tu veux bien les retrouver ?"],end:()=>startQuest('notes')});
if(q.notes===1&&game.notes.size<3)return wrap({lines:[`${game.notes.size} sur 3. Elles brillent un peu, tu ne peux pas les rater.`]});
if(q.notes===1)return wrap({lines:["Mes partitions ! ♪ Écoute celle-ci… ♪","Je l'appellerai « La ballade de "+me+" ». Elle sera jouée à la fête, promis."],end:()=>finishQuest('notes','La ballade de '+me)});
return wrap({lines:[pick(["♪ Quand le vent tourne, la mer chante… ♪ C'est Oro qui m'a soufflé les paroles.","Le meilleur public, c'est Pistache. Il ronronne en rythme.","Un jour, je jouerai sur le voilier de Tomas, en pleine mer."])]});
case'oro':if(stars()>=TOTAL&&!n.final){n.final=true;return wrap({lines:[`${me}, tu as découvert tous les secrets d'Azura, jusqu'au dernier.`,"L'île se souviendra de toi. Regarde vers la mer : ce soir, le village fait la fête en ton honneur.","Reviens quand tu veux : le vent, la mer et nous serons là."],end:()=>{game.fireworksUntil=game.playtime+40;toast('🎆 Feu d\'artifice au-dessus de la crique !');dirty=true;saveGame(true);}});}
if(n.final)return wrap({lines:[pick(["Regarde la mer. Elle chante pour toi ce soir.","Le feu d'artifice, c'est Tomas qui le tire depuis son voilier."])],end:()=>{if(game.fireworksUntil<game.playtime)game.fireworksUntil=game.playtime+30;}});
return wrap({lines:[pick(["Bienvenue au belvédère. Peu de gens grimpent jusqu'ici.","Écoute… Quand le vent tourne, la mer chante. Tomas ne l'a pas inventé.","Ce drapeau, je le hisse chaque matin depuis quarante ans.","Quand tu auras aidé tout le monde, reviens me voir. J'aurai quelque chose à te dire."])]});
case'gardien':if(q.goats===0)return wrap({lines:[`Un visiteur ! Tu es arrivé par le voilier de Tomas ? Je suis Elio, je garde le phare depuis trente ans.`,"Mes trois chèvres ont profité de la brume pour filer sur les pentes. Rattrape-les-moi, elles ne mordent pas."],end:()=>startQuest('goats')});
if(q.goats===1&&game.goatsCaught<3)return wrap({lines:[`${game.goatsCaught} sur 3. Elles aiment les rochers au-dessus de la crique. Approche-toi doucement, puis appuie sur E.`]});
if(q.goats===1)return wrap({lines:["Les trois ! Tu es plus patient que moi.","Tiens, du fromage de chèvre, le meilleur de l'archipel."],end:()=>{for(const g of goats)g.hidden=false;finishQuest('goats','Les chèvres d\'Elio sont rentrées');}});
if(q.oil===0)return wrap({lines:["Il y a plus grave : la lampe du phare est éteinte, je n'ai plus d'huile.","Tomas, sur le ponton d'Azura, garde un bidon pour moi. Prends le voilier, rapporte-le, et le phare éclairera de nouveau la nuit."],end:()=>startQuest('oil')});
if(q.oil===1&&!game.oil)return wrap({lines:["Le bidon est chez Tomas, sur le ponton d'Azura. Le voilier t'y mène."]});
if(q.oil===1)return wrap({lines:["Le bidon ! Tu as fait l'aller-retour pour moi.","Regarde ce soir : la lampe brillera jusqu'à Azura. Merci, "+me+"."],end:()=>finishQuest('oil','Le phare est rallumé')});
return wrap({lines:[pick(["Par temps clair, on voit le belvédère d'Azura d'ici.","Les chèvres montent plus vite que moi, maintenant.","Écoute la mer contre les falaises. Elle chante autrement que du côté d'Azura."])]});
case'cat':if(q.cat===1&&!game.catFollow)return wrap({lines:["Pistache miaule, se frotte contre ta jambe… et te suit !"],end:()=>{game.catFollow=true;cat.state='idle';}});
return wrap({lines:["Pistache ronronne et se roule sur le dos. Tu lui grattes le ventre."],end:()=>sfx('purr')});}}
function talkTo(n){const d=linesFor(n);if(!d)return;n.talking=true;say(n.cat?'Pistache':n.name,d.lines,d.end);}
function nearThing(){let best=null,bd=1.8;for(const n of npcs){if(n.cat&&!(game.quests.cat===1&&!game.catFollow)&&game.quests.cat!==2)continue;const d=Math.hypot(n.x-player.x,n.z-player.z);if(d<bd&&Math.abs(n.y-player.y)<1.2){bd=d;best={type:'npc',n,label:n.cat?(game.quests.cat===2?'Caresser Pistache':'Appeler Pistache'):'Parler à '+n.name,btn:n.cat?'Câlin':'Parler'};}}
if(game.quests.crabs===1&&game.crabsCaught<3)for(const c of crabs){if(c.hidden)continue;const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<Math.min(bd,1.0)){bd=d;best={type:'crab',c,label:'Attraper le crabe',btn:'Hop !'};}}
if(game.quests.goats===1&&game.goatsCaught<3)for(const g of goats){if(g.hidden)continue;const d=Math.hypot(g.x-player.x,g.z-player.z);if(d<Math.min(bd,1.3)){bd=d;best={type:'goat',g,label:'Attraper la chèvre',btn:'Hop !'};}}
if(game.quests.treasure===1&&!game.dug){const d=Math.hypot(digSpot.x-player.x,digSpot.z-player.z);if(d<Math.min(bd,1.3)){bd=d;best={type:'dig',label:'Creuser ici',btn:'Creuser'};}}
const dockIsl=nearDock();if(dockIsl){const dest=islands.find(i=>i.id!==dockIsl.id);if(dest){bd=1.7;best={type:'boat',dest,label:'Embarquer pour '+dest.name,btn:'Embarquer'};}}
if(game.quests.fish>=1){const d=Math.hypot(fishSpot.x-player.x,fishSpot.z-player.z);if(d<Math.min(bd,1.4)&&Math.abs(fishSpot.y-player.y)<.6){bd=d;best={type:'fish',label:'Pêcher',btn:'Pêcher'};}}
return best;}
function jump(){if(dialog||minigame){interact();return;}if(!playing||!panel.hidden||voyage.active||player.air)return;player.air=true;player.vy=4.6;sfx('jump');}
function respawn(){const isl=currentIsland();const [x,z]=snap(isl.spawn[0],isl.spawn[1],4);player.x=x;player.z=z;player.y=cellH(x,z);player.air=false;player.vy=0;panel.hidden=true;toast('Te revoilà sur '+isl.name+'.');dirty=true;}
function interact(){if(minigame){fishingHit();return;}if(dialog){advance();return;}if(!playing||!panel.hidden)return;const th=nearThing();if(!th)return;
if(th.type==='npc')talkTo(th.n);
else if(th.type==='crab'){th.c.hidden=true;game.crabsCaught++;sfx('catch');toast(`🦀 Crabe attrapé ! ${game.crabsCaught}/3`);dirty=true;refreshHUD();if(game.crabsCaught>=3)setTimeout(()=>toast('Retourne voir Lila !'),1500);}
else if(th.type==='dig'){game.dug=true;sfx('dig');setTimeout(()=>{toast('⚓ Une ancre d\'or ! Le trésor de Marco est réel.');finishQuest('treasure','Le trésor est découvert');},700);}
else if(th.type==='goat'){th.g.hidden=true;game.goatsCaught++;sfx('catch');toast(`🐐 Chèvre rattrapée ! ${game.goatsCaught}/3`);dirty=true;refreshHUD();if(game.goatsCaught>=3)setTimeout(()=>toast('Retourne voir Elio au sommet !'),1500);}
else if(th.type==='fish')startFishing();
else if(th.type==='boat'){if(game.quests.shells<2){toast('Le voilier est à Tomas : rends-lui d\'abord service pour gagner sa confiance.');return;}startVoyage(th.dest.id);}}

// ---------- mini-jeu de pêche ----------
const fishingEl=$('#fishing'),cursorEl=fishingEl.querySelector('.cursor'),zoneEl=fishingEl.querySelector('.zone');
function startFishing(){const speed=1.1+Math.min(game.fish,6)*.22,zw=Math.max(.14,.26-game.fish*.02),zx=.2+Math.random()*(.8-zw-.2);minigame={pos:0,dir:1,speed,zx,zw};zoneEl.style.left=(zx*100)+'%';zoneEl.style.width=(zw*100)+'%';fishingEl.hidden=false;promptEl.hidden=true;actionBtn.textContent='Ferre !';actionBtn.hidden=false;sfx('cast');player.heading=0;}
function updateFishing(dt){if(!minigame)return;minigame.pos+=minigame.dir*minigame.speed*dt;if(minigame.pos>1){minigame.pos=1;minigame.dir=-1;}if(minigame.pos<0){minigame.pos=0;minigame.dir=1;}cursorEl.style.left=(minigame.pos*100)+'%';}
function fishingHit(){const m=minigame;minigame=null;fishingEl.hidden=true;if(m.pos>=m.zx&&m.pos<=m.zx+m.zw){sfx('catch');if(game.quests.fish===1&&game.fish<3){game.fish++;toast(`🐟 Poisson attrapé ! ${game.fish}/3`);if(game.fish>=3)setTimeout(()=>toast('Porte-les à Anaé, dans le village.'),1600);}else toast('🐟 Un beau poisson ! Tu le relâches.');dirty=true;refreshHUD();}else{sfx('fail');toast('Raté ! Il s\'est échappé…');}}
function cancelFishing(){minigame=null;fishingEl.hidden=true;}

// ---------- archipel : île courante, pontons, voyage en voilier ----------
const voyage={active:false,x:0,z:0,heading:0,t:0};
function currentIsland(){let best=islands[0],bd=1e9;for(const i of islands){const d=Math.hypot(player.x-i.center[0],player.z-i.center[1]);if(d<bd){bd=d;best=i;}}return best;}
function dockSeaEnd(isl){const d=isl.dock,len=d.len||5;return[d.x+Math.sin(d.heading)*len/2,d.y,d.z+Math.cos(d.heading)*len/2];}
function nearDock(){if(voyage.active)return null;const isl=currentIsland(),e=dockSeaEnd(isl);return Math.hypot(e[0]-player.x,e[2]-player.z)<1.7&&Math.abs(e[1]-player.y)<.9?isl:null;}
function dockOffshore(isl){const d=isl.dock,e=dockSeaEnd(isl);return[e[0]+Math.sin(d.heading)*8,e[2]+Math.cos(d.heading)*8];}
function voyagePos(t){const {a,b,c1,c2}=voyage,u=1-t,w0=u*u*u,w1=3*u*u*t,w2=3*u*t*t,w3=t*t*t;return[w0*a[0]+w1*c1[0]+w2*c2[0]+w3*b[0],w0*a[2]+w1*c1[1]+w2*c2[1]+w3*b[2]];}
function startVoyage(toId){const from=currentIsland(),to=islands.find(i=>i.id===toId);if(!to||to===from||voyage.active)return;const a=dockSeaEnd(from),b=dockSeaEnd(to),c1=dockOffshore(from),c2=dockOffshore(to);const dist=Math.hypot(c1[0]-a[0],c1[1]-a[2])+Math.hypot(c2[0]-c1[0],c2[1]-c1[1])+Math.hypot(b[0]-c2[0],b[2]-c2[1]);
Object.assign(voyage,{active:true,from,to,a,b,c1,c2,t:0,dur:Math.max(8,dist/5.5),x:a[0],z:a[2],heading:from.dock.heading});cam.mode='voyage';promptEl.hidden=true;actionBtn.hidden=true;sfx('cast');toast(`Cap sur ${to.name} !`);dirty=true;}
function updateVoyage(dt){if(!voyage.active)return;voyage.t+=dt/voyage.dur;const s=Math.min(1,voyage.t),e=s*s*(3-2*s);const p=voyagePos(e),q=voyagePos(Math.min(1,e+.012));if(Math.hypot(q[0]-p[0],q[1]-p[1])>1e-4)voyage.heading=turnToward(voyage.heading,Math.atan2(q[0]-p[0],q[1]-p[1]),dt*2.5);voyage.x=p[0];voyage.z=p[1];
player.x=voyage.x-Math.sin(voyage.heading)*.35;player.z=voyage.z-Math.cos(voyage.heading)*.35;player.y=.44+Math.sin(performance.now()*.0014)*.06;player.heading=voyage.heading;player.amp+=(0-player.amp)*.2;player.look=0;
if(voyage.t>=1){voyage.active=false;const to=voyage.to,[x,z]=snap(to.landing[0],to.landing[1],3);player.x=x;player.z=z;player.y=cellH(x,z);player.heading=to.dock.heading+PI;game.island=to.id;cam.mode='follow';goal.theta=player.heading+PI;goal.r=9;goal.phi=1.1;toast(`Bienvenue sur ${to.name}.`);refreshHUD();dirty=true;saveGame(true);}}

// ---------- caméra ----------
const presets={village:{theta:.13,phi:1.14,r:38,target:[0,7,1.6]},port:{theta:-.27,phi:1.27,r:24,target:[-.3,3.7,5.5]},summit:{theta:.46,phi:1.12,r:22,target:[.4,11,-4.7]}};
let current={theta:0,phi:1.1,r:9,target:[0,1,9]},goal=structuredClone(current),auto=false,drag=false,lastTime=0,frameCount=0;
const cam={mode:'follow'};
let cssW=0,cssH=0,eye=[0,0,0],vp,camK=1;
let pointers=new Map(),lastPinch=0;
function setView(key){if(key==='play'){cam.mode='follow';if(goal.r>18)goal.r=9;goal.phi=clamp(goal.phi,.5,1.35);}else{cam.mode='cine';goal=structuredClone(presets[key]);}
document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===key));}
function custom(){if(cam.mode==='cine')document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));}
let tapStart=null;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag=true;lastPinch=0;tapStart=[e.clientX,e.clientY];});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;let old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
if(pointers.size===1){goal.theta-=(e.clientX-old.x)*.005;goal.phi=clamp(goal.phi-(e.clientY-old.y)*.004,.35,1.46);}
else{let [a,b]=[...pointers.values()];let dist=Math.hypot(a.x-b.x,a.y-b.y);if(lastPinch)goal.r=clamp(goal.r*lastPinch/dist,4,65);lastPinch=dist;}custom();});
const release=e=>{if(tapStart&&pointers.has(e.pointerId)&&Math.hypot(e.clientX-tapStart[0],e.clientY-tapStart[1])<6&&(dialog||minigame))interact();pointers.delete(e.pointerId);drag=pointers.size>0;lastPinch=0;tapStart=null;};
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('wheel',e=>{e.preventDefault();goal.r=clamp(goal.r*Math.exp(e.deltaY*.001),4,65);},{passive:false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('#plus').onclick=()=>goal.r=clamp(goal.r*.84,4,65);
$('#minus').onclick=()=>goal.r=clamp(goal.r*1.18,4,65);
$('#reset').onclick=()=>{setView('play');goal.r=9;goal.phi=1.1;goal.theta=player.heading+PI;};
$('#rotate').onclick=()=>{auto=!auto;$('#rotate').classList.toggle('active',auto);$('#rotate').setAttribute('aria-pressed',String(auto));$('#rotate').setAttribute('aria-label',auto?'Arrêter la rotation automatique':'Activer la rotation automatique');};
const fullButton=$('#fullscreen');
if(!document.documentElement.requestFullscreen)fullButton.hidden=true;else fullButton.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){console.warn('Fullscreen unavailable',e);}};

// ---------- entrées ----------
const keys={};
const keyMap={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'run',ShiftRight:'run'};
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.target instanceof HTMLButtonElement&&(e.key==='Enter'||e.key===' '))return;if(keyMap[e.code]){keys[keyMap[e.code]]=true;e.preventDefault();return;}
switch(e.code){case'KeyE':case'Enter':interact();e.preventDefault();break;case'Space':jump();e.preventDefault();break;case'Escape':if(minigame)cancelFishing();else if(dialog){dialog=null;dialogEl.hidden=true;for(const n of npcs)n.talking=false;}else togglePanel();break;case'KeyH':dbg.hidden=!dbg.hidden;break;case'KeyF':fpsEl.hidden=!fpsEl.hidden;break;case'KeyM':mapEl.hidden=!mapEl.hidden;try{localStorage.setItem('azura-map',mapEl.hidden?'0':'1');}catch(x){}break;case'Equal':case'NumpadAdd':goal.r=clamp(goal.r*.9,4,65);break;case'Minus':case'NumpadSubtract':goal.r=clamp(goal.r*1.1,4,65);break;case'Home':$('#reset').onclick();break;}});
window.addEventListener('keyup',e=>{if(keyMap[e.code])keys[keyMap[e.code]]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
const stick=$('#stick'),knob=stick.querySelector('i');let stickId=null,stickVec=[0,0];
function moveStick(e){const r=stick.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const l=Math.hypot(dx,dy),max=r.width*.36;if(l>max){dx*=max/l;dy*=max/l;}knob.style.transform=`translate(${dx}px,${dy}px)`;stickVec=[dx/max,-dy/max];}
stick.addEventListener('pointerdown',e=>{stickId=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);e.preventDefault();});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickId)moveStick(e);});
const endStick=e=>{if(e.pointerId===stickId){stickId=null;stickVec=[0,0];knob.style.transform='';}};
stick.addEventListener('pointerup',endStick);stick.addEventListener('pointercancel',endStick);stick.addEventListener('lostpointercapture',endStick);
actionBtn.addEventListener('click',interact);$('#jump').addEventListener('click',jump);$('#respawn').onclick=respawn;
function togglePanel(){if(!playing)return;panel.hidden=!panel.hidden;if(!panel.hidden){$('#panel-info').textContent=`${game.name?game.name+' · ':''}${game.shells.size} coquillages · ${stars()} étoiles sur ${TOTAL} · ${doneCount(game.quests)} quêtes terminées · ${fmtTime(game.playtime)} de jeu`;$('#restart').textContent='Recommencer une nouvelle partie';restartArmed=false;$('#quality').textContent='Qualité graphique : '+qualityLabel()+(lastFps?' · '+lastFps+' im/s':'');}}
let restartArmed=false;
$('#menu').onclick=togglePanel;$('#resume').onclick=togglePanel;$('#save-now').onclick=()=>{saveGame(false);panel.hidden=true;};
$('#restart').onclick=()=>{if(!restartArmed){restartArmed=true;$('#restart').textContent='Confirmer : effacer la progression ?';return;}clearSave();location.reload();};
window.addEventListener('pagehide',()=>{if(playing)saveGame(true);});
window.addEventListener('beforeunload',()=>{if(playing)saveGame(true);});

// ---------- mini-carte ----------
const mapEl=$('#map');
try{if(localStorage.getItem('azura-map')==='0')mapEl.hidden=true;}catch(e){}
const mapBase=document.createElement('canvas');mapBase.width=HN;mapBase.height=HN;
{const c=mapBase.getContext('2d'),img=c.createImageData(HN,HN);for(let iz=0;iz<HN;iz++)for(let ix=0;ix<HN;ix++){const i=iz*HN+ix,h=H[i],o=(iz*HN+ix)*4;let r,g,b;
if(h<=SEA){const deep=clamp(-h/4,0,1);r=20+40*(1-deep);g=140-50*deep;b=170-20*deep;}
else if(h<1.3){r=240;g=222;b=170;}
else{const v=clamp((h-1)/13,0,1);r=150+70*v;g=140+65*v;b=118+60*v;if(blocked[i]){r=205;g=110;b=60;}else if(!reach[i]){r*=.82;g*=.82;b*=.8;}}
img.data[o]=r;img.data[o+1]=g;img.data[o+2]=b;img.data[o+3]=255;}c.putImageData(img,0,0);}
function mapRegion(){if(voyage.active)return{cx:WORLD.x0+WORLD.size/2,cz:WORLD.z0+WORLD.size/2,R:WORLD.size/2};const i=currentIsland();return{cx:i.center[0],cz:i.center[1],R:i.r+6};}
const mapCrop=document.createElement('canvas');mapCrop.width=400;mapCrop.height=400;let mapKey='';
function drawMap(){const c=mapEl.getContext('2d'),M=mapEl.width,{cx,cz,R}=mapRegion();const key=cx+','+cz+','+R;if(key!==mapKey){mapKey=key;const cc=mapCrop.getContext('2d');cc.clearRect(0,0,M,M);cc.drawImage(mapBase,(cx-R-WORLD.x0)/HS,(cz-R-WORLD.z0)/HS,2*R/HS,2*R/HS,0,0,M,M);}c.clearRect(0,0,M,M);c.drawImage(mapCrop,0,0);const P=(x,z)=>[(x-(cx-R))/(2*R)*M,(z-(cz-R))/(2*R)*M];const dot=(x,z,col,r=5)=>{const [px,pz]=P(x,z);c.fillStyle=col;c.beginPath();c.arc(px,pz,r,0,TAU);c.fill();};
for(const isl of islands){const e=dockSeaEnd(isl);dot(e[0],e[2],'#7ae7ff',4);}
if(voyage.active)dot(voyage.x,voyage.z,'#fff',5);
if(game.quests.shells===1)for(const s of shellSpots)if(!game.shells.has(s.id))dot(s.x,s.z,'#ff9fc4',4);
if(game.quests.notes===1)for(const s of noteSpots)if(!game.notes.has(s.id))dot(s.x,s.z,'#c9a0ff',4);
if(game.quests.treasure===1&&!game.dug)dot(digSpot.x,digSpot.z,'#ffd166',5);
if(game.quests.fish===1&&game.fish<3)dot(fishSpot.x,fishSpot.z,'#7ae7ff',5);
const q=game.quests,nd=Object.keys(game.delivered).length;
for(const n of npcs){if(n.cat)continue;const ready={tomas:q.shells===0||(q.shells===1&&game.shells.size>=8)||(q.shells===2&&q.fish===0)||(q.bread===1&&!game.delivered.tomas),anae:q.cat===0||(q.cat===1&&game.catFollow)||(q.fish===1&&game.fish>=3),lila:q.crabs===0||(q.crabs===1&&game.crabsCaught>=3),pia:q.bread===0||(q.bread===1&&nd>=3),marco:q.treasure===0||(q.bread===1&&!game.delivered.marco),bastien:q.notes===0||(q.notes===1&&game.notes.size>=3),oro:(stars()>=TOTAL&&!n.final)||(q.bread===1&&!game.delivered.oro),gardien:q.goats===0||(q.goats===1&&game.goatsCaught>=3)||(q.goats===2&&q.oil===0)||(q.oil===1&&game.oil)}[n.id];
dot(n.x,n.z,ready?'#ffd166':'#fff8ea',ready?6:4);if(ready){c.fillStyle='#2c3f40';c.font='bold 9px Arial';c.textAlign='center';const [px,pz]=P(n.x,n.z);c.fillText('!',px,pz+3.5);}}
const [px,pz]=P(player.x,player.z);c.save();c.translate(px,pz);c.rotate(-player.heading);c.fillStyle='#fff';c.strokeStyle='#1d5661';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(6,6);c.lineTo(0,3);c.lineTo(-6,6);c.closePath();c.fill();c.stroke();c.restore();}

// ---------- démarrage ----------
function showStart(){const s=loadSave();$('#loading-title').hidden=true;$('#loading-help').hidden=true;document.querySelector('.sun').hidden=true;$('#start').hidden=false;
if(s){$('#continue').hidden=false;$('#continue-info').textContent=`${s.name?s.name+' · ':''}🐚 ${(s.shells||[]).length}/12 · ⭐ ${Object.keys(s.discovered||{}).length+doneCount(s.quests||{})}/${TOTAL} · ${fmtTime(s.playtime||0)}`;$('#new').textContent='Nouvelle partie';$('#name').hidden=true;
let armed=false;$('#new').onclick=()=>{if(!armed){armed=true;$('#new').textContent='Confirmer : effacer la partie sauvegardée ?';$('#name').hidden=false;return;}clearSave();startGame(null);};$('#continue').onclick=()=>startGame(s);}
else $('#new').onclick=()=>startGame(null);
$('#name').addEventListener('keydown',e=>{if(e.key==='Enter')$('#new').click();});}
function startGame(save){if(save)applySave(save);else{game.name=($('#name').value||'').trim().slice(0,14);goal.theta=player.heading+PI;goal.phi=1.1;goal.r=9;Object.assign(current,structuredClone(goal));}
cam.mode='follow';playing=true;refreshHUD();const l=$('#loading');l.style.opacity=0;l.style.pointerEvents='none';setTimeout(()=>l.remove(),650);gesture();
if(!save)game.island='azura';
setTimeout(()=>toast(save?`Bon retour sur Azura${game.name?', '+game.name:''} !`:`Bienvenue sur Azura${game.name?', '+game.name:''}. Marche jusqu'au ponton pour rencontrer Tomas.`),700);}

// ---------- animation / déplacement ----------
// ---------- animation ----------
function turnToward(a,b,k){let d=((b-a+PI)%TAU+TAU)%TAU-PI;return a+d*Math.min(1,k);}
function moveEntity(e,dx,dz,speed,dt){const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;e.heading=turnToward(e.heading,Math.atan2(dx,dz)+(e.crab?PI/2:0),dt*11);const moved=tryMove(e,dx*speed*dt,dz*speed*dt,.13*e.scale);e.speed=moved?speed:0;e.phase+=(moved?speed:1.2)*dt*(e.cat?9:e.crab?16:4.6)/e.scale;e.amp+=((moved?1:.3)-e.amp)*(1-Math.exp(-dt*10));return moved;}
function idleEntity(e,dt){e.speed=0;e.amp+=(0-e.amp)*(1-Math.exp(-dt*8));}
function groundEntity(e,dt){const h=cellH(e.x,e.z);e.y+=(h-e.y)*(1-Math.exp(-dt*14));}
function freeAround(x,z){let n=0;const h0=cellH(x,z);for(let a=0;a<TAU;a+=TAU/8)if(canStep(h0,x+Math.sin(a)*.3,z+Math.cos(a)*.3))n++;return n;}
function unstick(e){if(reach[cellIndex(e.x,e.z)]&&freeAround(e.x,e.z)>=4)return false;for(let r=HS;r<=3;r+=HS)for(let a=0;a<TAU;a+=HS/r){const x=e.x+Math.cos(a)*r,z=e.z+Math.sin(a)*r,i=cellIndex(x,z);if(i>=0&&reach[i]&&!blocked[i]&&freeAround(x,z)>=5){e.x=x;e.z=z;e.y=cellH(x,z);return true;}}return false;}
function npcThink(n,dt,t){if(n.moved===false&&n.state==='walk'){n.stuckT=(n.stuckT||0)+dt;if(n.stuckT>1.5){n.stuckT=0;unstick(n);n.state='idle';n.t=.5;}}else n.stuckT=0;
if(n.talking){n.heading=turnToward(n.heading,Math.atan2(player.x-n.x,player.z-n.z),dt*6);idleEntity(n,dt);n.look=0;}
else if(n.cat&&game.catFollow){const dx=player.x-n.x,dz=player.z-n.z,d=Math.hypot(dx,dz);if(d>1.4){const moved=moveEntity(n,dx,dz,Math.min(3.4,player.speed+1.6),dt);if((!moved&&d>2.5)||d>9){const [x,z]=snap(player.x-Math.sin(player.heading)*.8,player.z-Math.cos(player.heading)*.8,2);n.x=x;n.z=z;n.y=cellH(x,z);}}else idleEntity(n,dt);}
else if(n.state==='idle'){idleEntity(n,dt);n.t-=dt;if(!n.cat)n.look=Math.sin(t*.6+n.x)*.35;if(n.t<=0&&(dayF>.25||n.cat)){for(let k=0;k<6;k++){const a=Math.random()*TAU,r=Math.random()*n.leash,x=n.home[0]+Math.cos(a)*r,z=n.home[1]+Math.sin(a)*r,i=cellIndex(x,z);if(i>=0&&reach[i]){n.target=[x,z];n.state='walk';n.fails=0;break;}}n.t=1.5+Math.random()*4;}}
else{n.look=0;const dx=n.target[0]-n.x,dz=n.target[1]-n.z,d=Math.hypot(dx,dz);n.moved=d>=.15&&moveEntity(n,dx,dz,n.walk,dt);if(d<.15||!n.moved)if(d<.15||++n.fails>8){n.state='idle';n.t=1+Math.random()*3;}}
groundEntity(n,dt);}
function crabThink(c,dt,t){if(c.hidden)return;const dx=c.x-player.x,dz=c.z-player.z,d=Math.hypot(dx,dz);const hunted=c.goat?(game.quests.goats===1&&game.goatsCaught<3):(game.quests.crabs===1&&game.crabsCaught<3);
if(hunted&&d<(c.goat?3.2:2.4)){const sp=c.goat?2.6:2.3;if(!moveEntity(c,dx+Math.sin(c.id*3+t*2)*.5,dz+Math.cos(c.id*2+t)*.5,sp,dt))moveEntity(c,-dz,dx,sp,dt);c.state='idle';c.t=.5;if(Math.random()<dt*1.5)sfx('crab');}
else if(c.state==='idle'){idleEntity(c,dt);c.t-=dt;if(c.t<=0){const a=Math.random()*TAU,r=Math.random()*(c.goat?3.5:2.2);c.target=[c.home[0]+Math.cos(a)*r,c.home[1]+Math.sin(a)*r];c.state='walk';c.t=2+Math.random()*4;}}
else{const tx=c.target[0]-c.x,tz=c.target[1]-c.z,td=Math.hypot(tx,tz);if(td<.12||!moveEntity(c,tx,tz,.7,dt)){c.state='idle';c.t=1+Math.random()*3;}}
groundEntity(c,dt);}
const drawList=[];
function update(dt,t){
if(playing)game.playtime+=dt;updateClock(dt);
let ix=0,iy=0;if(playing&&!dialog&&!minigame&&panel.hidden&&!voyage.active){ix=(keys.right?1:0)-(keys.left?1:0)+stickVec[0];iy=(keys.up?1:0)-(keys.down?1:0)+stickVec[1];}
let mag=Math.hypot(ix,iy);if(mag>1){ix/=mag;iy/=mag;mag=1;}
if(mag>.08){if(cam.mode!=='follow')setView('play');const f=norm([current.target[0]-eye[0],0,current.target[2]-eye[2]]),r=[-f[2],0,f[0]];const px=player.x,pz=player.z;const moved=moveEntity(player,f[0]*iy+r[0]*ix,f[2]*iy+r[2]*ix,(keys.run||mag>.97&&stickId!==null?4.3:2.7)*Math.min(1,mag*1.3),dt);if(Math.hypot(player.x-px,player.z-pz)>0)dirty=true;
if(!moved){player.stuckT=(player.stuckT||0)+dt;if(player.stuckT>.7){player.stuckT=0;let freed=false;for(let a=0;a<TAU&&!freed;a+=TAU/12)freed=tryMove(player,Math.sin(a)*.12,Math.cos(a)*.12,.1);if(!freed&&unstick(player))toast('Tu t\'étais coincé : te revoilà sur le chemin.');}}else player.stuckT=0;}
else{idleEntity(player,dt);player.look=Math.sin(t*.5)*.25*(1-player.amp);}
if(voyage.active)updateVoyage(dt);else if(player.air){player.vy-=12*dt;player.y+=player.vy*dt;const g=cellH(player.x,player.z);if(player.y<=g&&player.vy<=0){player.y=g;player.air=false;player.vy=0;player.stuckT=0;}}else groundEntity(player,dt);
for(const n of npcs)npcThink(n,dt,t);
for(const c of crabs)crabThink(c,dt,t);for(const g of goats)crabThink(g,dt,t);
updateFishing(dt);
if(playing){for(const s of shellSpots){if(game.shells.has(s.id))continue;if(Math.hypot(s.x-player.x,s.z-player.z)<.65&&Math.abs(s.y-player.y)<.8){game.shells.add(s.id);sfx('pick');toast(`🐚 Coquillage trouvé ! ${game.shells.size}/12`);refreshHUD();dirty=true;saveGame(true);}}
if(game.quests.notes===1)for(const s of noteSpots){if(game.notes.has(s.id))continue;if(Math.hypot(s.x-player.x,s.z-player.z)<.7&&Math.abs(s.y-player.y)<.8){game.notes.add(s.id);sfx('pick');toast(`🎵 Partition retrouvée ! ${game.notes.size}/3`);refreshHUD();dirty=true;saveGame(true);}}
for(const p of places)if(!game.discovered[p.id]&&player.y>p.minY&&Math.hypot(p.x-player.x,p.z-player.z)<p.r){game.discovered[p.id]=true;star('Lieu découvert : '+p.name);}
const th=(dialog||minigame)?null:nearThing();promptEl.hidden=!th;if(th){promptEl.querySelector('span').textContent=th.label;actionBtn.textContent=th.btn;}
actionBtn.hidden=!(th||dialog||minigame);$('#jump').hidden=!!(dialog||minigame||voyage.active);
if(dirty&&performance.now()-lastSave>6000)saveGame(true);
if((frameCount&31)===0)stats.textContent=`🐚 ${game.shells.size}/12 · ⭐ ${stars()}/${TOTAL} · ${dayIcon()}`;}
// poses
drawList.length=0;
poseHuman(player,t);drawList.push({mesh:player.mesh,bones:player.bones,n:6,mode:4});
for(const n of npcs){if(n.cat)poseCat(n,t);else poseHuman(n,t);drawList.push({mesh:n.mesh,bones:n.bones,n:6,mode:4});}
for(const c of crabs){if(c.hidden)continue;poseCrab(c,t);drawList.push({mesh:crabMesh,bones:c.bones,n:3,mode:4});}
for(const g of goats){if(g.hidden)continue;goatPose(g,t);drawList.push({mesh:goatMeshOf(),bones:g.bones,n:8,mode:4});}
if(game.quests.oil===2){setBone(lighthouseBones,0,mm(T(34,12.5,-24.6),SC(3,3,3)));drawList.push({mesh:lanternGlow,bones:lighthouseBones,n:1,mode:7,noShadow:true});}
const spin=(list,mesh,taken,hover)=>{for(const s of list){if(taken.has(s.id))continue;const b=s.bones||(s.bones=new Float32Array(32));const root=mm(T(s.x,s.y+hover+Math.sin(t*2.2+s.id)*.05,s.z),RY(t*1.3+s.id));setBone(b,0,root);setBone(b,1,mm(root,T(Math.cos(t*3+s.id)*.24,.14+Math.sin(t*4.1+s.id)*.06,Math.sin(t*3+s.id)*.24)));drawList.push({mesh,bones:b,n:2,mode:4});
const rb=s.ring||(s.ring=new Float32Array(16));setBone(rb,0,mm(T(s.x,s.y+.04,s.z),SC(1+Math.sin(t*2.2+s.id)*.12)));drawList.push({mesh:ringMesh,bones:rb,n:1,mode:5,noShadow:true});}};
spin(shellSpots,shellMesh,game.shells,.08);
if(game.quests.notes===1)spin(noteSpots,noteMesh,game.notes,.25);
if(game.quests.treasure===1&&!game.dug){setBone(crossBones,0,T(digSpot.x,digSpot.y+.02,digSpot.z));drawList.push({mesh:crossMesh,bones:crossBones,n:1,mode:5,noShadow:true});}
if(game.dug){const root=T(digSpot.x,digSpot.y,digSpot.z);setBone(chestBones,0,root);setBone(chestBones,1,mm(root,piv([0,.32,-.2],RX(-1.9))));drawList.push({mesh:chestMesh,bones:chestBones,n:2,mode:4});}
for(const g of gulls){const a=t*g.w+g.ph,dir=Math.sign(g.w),x=g.cx+Math.cos(a)*g.R,z=g.cz+Math.sin(a)*g.R,y=g.h+Math.sin(t*.7+g.ph)*.8,heading=Math.atan2(-Math.sin(a)*dir,Math.cos(a)*dir);const glide=Math.sin(t*.45+g.ph)>.2?.12:1,flap=Math.sin(t*9+g.ph)*.6*glide;
const root=mm(T(x,y,z),RY(heading),RZ(-dir*.25));setBone(g.bones,0,root);setBone(g.bones,1,mm(root,RZ(flap)));setBone(g.bones,2,mm(root,RZ(-flap)));drawList.push({mesh:gullMesh,bones:g.bones,n:3,mode:4});}
{const b=boats.moored;setBone(b.bones,0,mm(T(b.x,b.y+Math.sin(t*1.1)*.05,b.z),RY(b.rot),RX(Math.sin(t*1.3+1)*.03),RZ(Math.sin(t*.9)*.05)));drawList.push({mesh:mooredBoat,bones:b.bones,n:1,mode:4});
const s=boats.sail;let x,z,heading,heel=.06;if(voyage.active){x=voyage.x;z=voyage.z;heading=voyage.heading;heel=.12;}else{s.a=t*.04;x=Math.cos(s.a)*19;z=-1.3+Math.sin(s.a)*17.5;heading=Math.atan2(-Math.sin(s.a)*19,Math.cos(s.a)*17.5);}const root=mm(T(x,.5+Math.sin(t*1.4)*.08,z),RY(heading),RZ(heel+Math.sin(t*.8)*.04),RX(Math.sin(t*1.1)*.03));setBone(s.bones,0,root);setBone(s.bones,1,mm(root,RY(.35+Math.sin(t*2.6)*.06)));drawList.push({mesh:sailBoat,bones:s.bones,n:2,mode:4});}
{const b=flagBones;setBone(b,0,mm(T(...flagBase),RY(.6+Math.sin(t*.3)*.25)));drawList.push({mesh:flagMesh,bones:b,n:1,mode:3});}
chimneys.forEach((c,ci)=>{const b=smokeBones[ci];for(let k=0;k<6;k++){const life=(t*.22+k/6+ci*.37)%1,sc=Math.sin(life*PI)*(.5+life*1.6);setBone(b,k,mm(T(c[0]+Math.sin(life*4+k+ci)*.18+life*life*1.2,c[1]+life*2.6,c[2]+Math.cos(life*3+k)*.15+life*.5),SC(Math.max(.01,sc))));}drawList.push({mesh:smokeMesh,bones:b,n:6,mode:2,noShadow:true});});
for(const l of lanterns){setBone(l.bones,0,mm(T(l.x,l.y,l.z),RY(Math.atan2(-l.x,-l.z))));drawList.push({mesh:lanternMesh,bones:l.bones,n:1,mode:4});drawList.push({mesh:lanternGlow,bones:l.bones,n:1,mode:7,noShadow:true});}
if(dayF<.85){const vis=1-dayF/.85;fireflies.forEach((f,i)=>{const a=t*.35+f.ph+Math.sin(t*.9+i)*.6,x=f.cx+Math.cos(a)*f.r,z=f.cz+Math.sin(a*1.3)*f.r*.8,y=f.cy+f.h+Math.sin(t*1.7+i*2)*.3,blink=.5+.5*Math.sin(t*4+i*1.7);setBone(fireflyBones,i,mm(T(x,y,z),SC(vis*(.4+blink))));});drawList.push({mesh:fireflyMesh,bones:fireflyBones,n:14,mode:7,noShadow:true});}
if(game.fireworksUntil>game.playtime){const age=game.playtime-(game.fireworksUntil-40);burstMeshes.forEach((m,bi)=>{const period=2.6,local=(age+bi*.65)%period,cycle=Math.floor((age+bi*.65)/period),rnd2=k=>Math.abs(Math.sin(cycle*12.9898+bi*78.233+k*37.7)*43758.5453)%1;const cx=-4+rnd2(1)*10,cz=17+rnd2(2)*8,cy=9+rnd2(3)*5;const b=burstBones[bi];if(local<.8){for(let k=0;k<12;k++)setBone(b,k,mm(T(cx,cy*local/.8+.5,cz),SC(.35)));m.boomed=false;}else{const e=(local-.8)/1.8,r=e*(2-e)*3.5;if(!m.boomed){m.boomed=true;sfx('boom');}for(let k=0;k<12;k++){const th=k/12*TAU,ph=(k%3)*1.1+bi;setBone(b,k,mm(T(cx+Math.cos(th)*Math.cos(ph)*r,cy+Math.sin(ph)*r*.7-e*e*1.5,cz+Math.sin(th)*Math.cos(ph)*r),SC(Math.max(.01,(1-e)*1.4))));}}drawList.push({mesh:m,bones:b,n:12,mode:8,noShadow:true});});}
}
const lighthouseBones=new Float32Array(16),flagBones=new Float32Array(16),smokeBones=chimneys.map(()=>new Float32Array(96)),burstBones=burstMeshes.map(()=>new Float32Array(16*12));


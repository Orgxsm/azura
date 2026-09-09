// audio.js — sons synthétisés WebAudio (vagues, effets).
// Propriétaire : GAMEPLAY (Claude Code) ; DESIGN peut proposer des sons.
// ---------- son (synthèse WebAudio, aucun fichier) ----------
const audio={ctx:null,master:null,muted:false};
try{audio.muted=localStorage.getItem('azura-muted')==='1';}catch(e){}
function audioInit(){if(audio.ctx)return;try{setTimeout(musicInit,50);const ctx=new (window.AudioContext||window.webkitAudioContext)();audio.ctx=ctx;const master=ctx.createGain();master.gain.value=audio.muted?0:1;master.connect(ctx.destination);audio.master=master;
const len=ctx.sampleRate*3,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5;}
const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;const g=ctx.createGain();g.gain.value=.05;const lfo=ctx.createOscillator();lfo.frequency.value=.11;const lg=ctx.createGain();lg.gain.value=.035;lfo.connect(lg);lg.connect(g.gain);lfo.start();src.connect(lp);lp.connect(g);g.connect(master);src.start();audio.waves=g;}catch(e){console.warn('Audio indisponible',e);}}
function tone(f0,f1,dur,type='sine',vol=.18,delay=0){const ctx=audio.ctx;if(!ctx)return;const t=ctx.currentTime+delay;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+dur+.02);}
function sfx(kind){if(!audio.ctx||audio.muted)return;switch(kind){
case'pick':tone(880,1320,.14);tone(1320,1760,.12,'sine',.12,.08);break;
case'talk':tone(520,440,.07,'triangle',.08);break;
case'star':[523,659,784,1047].forEach((f,i)=>tone(f,f,.22,'triangle',.14,i*.09));break;
case'catch':tone(660,990,.12,'square',.07);tone(990,1320,.16,'sine',.12,.1);break;
case'fail':tone(440,180,.35,'sawtooth',.06);break;
case'dig':tone(120,60,.18,'sawtooth',.12);tone(90,50,.2,'sawtooth',.1,.15);break;
case'purr':for(let i=0;i<10;i++)tone(60,58,.08,'sawtooth',.05,i*.075);break;
case'cast':tone(300,900,.3,'sine',.06);break;
case'boom':tone(70,30,.6,'sawtooth',.15);tone(1200,200,.5,'sine',.05);break;
case'crab':tone(1500,1200,.05,'square',.04);break;
case'jump':tone(320,640,.14,'triangle',.07);break;
case'hen':tone(900,700,.06,'square',.05);tone(1100,800,.07,'square',.05,.09);tone(950,600,.09,'square',.04,.2);break;
case'sheep':for(let i=0;i<6;i++)tone(220+(i%2)*12,215,.09,'sawtooth',.06,i*.08);break;
case'shear':tone(2400,1800,.06,'square',.04);tone(2200,1600,.06,'square',.04,.12);tone(2600,1900,.06,'square',.04,.24);break;
case'coin':tone(1319,1319,.1,'sine',.12);tone(1760,1760,.18,'sine',.12,.09);break;}}
function setMuted(m){audio.muted=m;try{localStorage.setItem('azura-muted',m?'1':'0');}catch(e){}if(audio.master)audio.master.gain.value=m?0:1;$('#sound').textContent=m?'🔇':'🔊';$('#sound').setAttribute('aria-label',m?'Activer le son':'Couper le son');}
$('#sound').onclick=()=>{audioInit();setMuted(!audio.muted);if(audio.ctx&&audio.ctx.state==='suspended')audio.ctx.resume();};
setMuted(audio.muted);
const gesture=()=>{audioInit();if(audio.ctx&&audio.ctx.state==='suspended')audio.ctx.resume();};
window.addEventListener('pointerdown',gesture,{passive:true});window.addEventListener('keydown',gesture);


// ---------- musique générative (pentatonique, douce, plus lente la nuit) ----------
const music={on:true,gain:null,delay:null,next:0,step:0,timer:null,lastNote:0};
try{music.on=localStorage.getItem('azura-music')!=='0';}catch(e){}
function musicInit(){const ctx=audio.ctx;if(!ctx||music.gain)return;const g=ctx.createGain();g.gain.value=music.on?.09:0;const dl=ctx.createDelay(1);dl.delayTime.value=.41;const fb=ctx.createGain();fb.gain.value=.28;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;g.connect(lp);lp.connect(audio.master);lp.connect(dl);dl.connect(fb);fb.connect(dl);fb.connect(audio.master);music.gain=g;music.next=ctx.currentTime+.3;music.timer=setInterval(musicTick,220);}
const MUSIC_CHORDS=[[0,4,7,11],[9,0,4,7],[5,9,0,4],[7,11,2,5]];const PENTA=[0,2,4,7,9];
function mnote(f,t,dur,type,vol,attack=.02){const ctx=audio.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+attack);g.gain.setValueAtTime(vol,t+Math.max(attack,dur*.5));g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);g.connect(music.gain);o.start(t);o.stop(t+dur+.05);}
function musicTick(){const ctx=audio.ctx;if(!ctx||audio.muted||!music.on)return;const night=(typeof dayF==='number')?1-dayF:0;const beat=60/(74-night*16);
while(music.next<ctx.currentTime+.7){const st=music.step,bar=Math.floor(st/8)%4,chord=MUSIC_CHORDS[bar],eighth=st%8,t=music.next,base=261.63;
if(eighth===0){for(let i=0;i<3;i++)mnote(base*Math.pow(2,(chord[i]-12)/12)*(i===0?.5:1),t,beat*8,'sine',.05-night*.015,.6);mnote(base*Math.pow(2,(chord[0]-24)/12),t,beat*1.6,'triangle',.07);}
if(eighth===4)mnote(base*Math.pow(2,(chord[0]-24)/12),t,beat*1.2,'triangle',.05);
if(Math.random()<(.55-night*.2)&&eighth%2===0||Math.random()<.18){const chance=Math.random();let deg=music.lastNote+(chance<.35?1:chance<.7?-1:chance<.85?2:-2);deg=Math.max(-3,Math.min(9,deg));music.lastNote=deg;const oct=Math.floor((deg+5)/5)-1,semi=PENTA[((deg%5)+5)%5]+oct*12;mnote(base*2*Math.pow(2,semi/12),t,beat*(Math.random()<.3?1.4:.7),'triangle',.045-night*.012,.03);}
music.next+=beat*.5;music.step++;}}
function setMusic(on){music.on=on;try{localStorage.setItem('azura-music',on?'1':'0');}catch(e){}if(music.gain)music.gain.gain.setTargetAtTime(on?.09:0,audio.ctx.currentTime,.3);}
function musicLabel(){$('#music').textContent='Musique : '+(music.on?'oui':'non');}
$('#music').onclick=()=>{audioInit();if(audio.ctx&&audio.ctx.state==='suspended')audio.ctx.resume();setMusic(!music.on);musicLabel();};
musicLabel();

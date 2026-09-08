// audio.js — sons synthétisés WebAudio (vagues, effets).
// Propriétaire : GAMEPLAY (Claude Code) ; DESIGN peut proposer des sons.
// ---------- son (synthèse WebAudio, aucun fichier) ----------
const audio={ctx:null,master:null,muted:false};
try{audio.muted=localStorage.getItem('azura-muted')==='1';}catch(e){}
function audioInit(){if(audio.ctx)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)();audio.ctx=ctx;const master=ctx.createGain();master.gain.value=audio.muted?0:1;master.connect(ctx.destination);audio.master=master;
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
case'crab':tone(1500,1200,.05,'square',.04);break;}}
function setMuted(m){audio.muted=m;try{localStorage.setItem('azura-muted',m?'1':'0');}catch(e){}if(audio.master)audio.master.gain.value=m?0:1;$('#sound').textContent=m?'🔇':'🔊';$('#sound').setAttribute('aria-label',m?'Activer le son':'Couper le son');}
$('#sound').onclick=()=>{audioInit();setMuted(!audio.muted);if(audio.ctx&&audio.ctx.state==='suspended')audio.ctx.resume();};
setMuted(audio.muted);
const gesture=()=>{audioInit();if(audio.ctx&&audio.ctx.state==='suspended')audio.ctx.resume();};
window.addEventListener('pointerdown',gesture,{passive:true});window.addEventListener('keydown',gesture);


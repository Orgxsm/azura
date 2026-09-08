// anim.js — poses procédurales (marche, bras, tête, chat, crabe). Appelées par update() avec l'entité et le temps.
// Propriétaire : ANIMATION (GPT-6 Astra). Contrat : poseHuman(e,t)/poseCat(e,t)/poseCrab(e,t) remplissent e.bones (Float32Array 16 matrices).
function poseHuman(e,t){const s=e.scale,B=e.bones,a=e.amp,ph=e.phase,bob=Math.abs(Math.sin(ph))*.045*a*s+Math.sin(t*2)*.006;
const root=mm(T(e.x,e.y+bob,e.z),RY(e.heading));const swing=Math.sin(ph)*.85*a,sway=Math.sin(t*1.7+e.x*3)*.05*(1-a);let armL=-Math.sin(ph)*.7*a+sway,armR=Math.sin(ph)*.7*a-sway,rzL=-.08,rzR=.08;
if(e.pose==='guitar'&&a<.5&&!e.talking){const k=1-a*2;armL=mix(armL,-1.15,k);rzL=mix(rzL,.55,k);armR=mix(armR,-.75+Math.sin(t*7)*.12,k);rzR=mix(rzR,-.25,k);}
if(e.id==='tomas'&&a<.5&&!e.talking){const k=1-a*2;armR=mix(armR,-.5+Math.sin(t*.8)*.05,k);}
setBone(B,0,root);
setBone(B,1,mm(root,piv([-.1*s,.62*s,0],RX(swing))));setBone(B,2,mm(root,piv([.1*s,.62*s,0],RX(-swing))));
setBone(B,3,mm(root,piv([-.28*s,1.08*s,0],mm(RX(armL),RZ(rzL)))));setBone(B,4,mm(root,piv([.28*s,1.08*s,0],mm(RX(armR),RZ(rzR)))));
setBone(B,5,mm(root,piv([0,1.16*s,0],mm(RY(e.look),RX(Math.sin(t*.9+e.z)*.03*(1-a))))));}
function poseCat(e,t){const B=e.bones,a=e.amp,ph=e.phase,root=mm(T(e.x,e.y+Math.abs(Math.sin(ph))*.02*a,e.z),RY(e.heading));const sw=Math.sin(ph)*.7*a;
setBone(B,0,root);setBone(B,1,mm(root,piv([-.07,.2,.14],RX(sw))));setBone(B,4,mm(root,piv([.07,.2,-.14],RX(sw))));setBone(B,2,mm(root,piv([.07,.2,.14],RX(-sw))));setBone(B,3,mm(root,piv([-.07,.2,-.14],RX(-sw))));
setBone(B,5,mm(root,piv([0,.3,-.2],mm(RY(Math.sin(t*2.3+e.x)*.5),RX(Math.sin(t*1.1)*.2)))));}
function poseCrab(e,t){const B=e.bones,root=mm(T(e.x,e.y+.01,e.z),RY(e.heading));const sw=Math.sin(e.phase)*.35*e.amp+Math.sin(t*3+e.id)*.04;setBone(B,0,root);setBone(B,1,mm(root,piv([-.12,.06,0],RZ(sw))));setBone(B,2,mm(root,piv([.12,.06,0],RZ(-sw))));}

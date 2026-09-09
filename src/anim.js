// anim.js — poses procédurales (marche, bras, tête, chat, crabe). Appelées par update() avec l'entité et le temps.
// Propriétaire : ANIMATION (GPT-6 Astra). Contrat : poseHuman(e,t)/poseCat(e,t)/poseCrab(e,t) remplissent e.bones (Float32Array 16 matrices).
function poseHuman(e,t){const s=e.scale,B=e.bones,a=e.amp,ph=e.phase,bob=Math.abs(Math.sin(ph))*.045*a*s+Math.sin(t*2)*.006;
const root=mm(T(e.x,e.y+bob,e.z),RY(e.heading));let swing=Math.sin(ph)*.85*a,sway=Math.sin(t*1.7+e.x*3)*.05*(1-a);let armL=-Math.sin(ph)*.7*a+sway,armR=Math.sin(ph)*.7*a-sway,rzL=-.08,rzR=.08;
if(e.air){swing=-.55;armL=-1.3;armR=-1.3;rzL=-.5;rzR=.5;}
if(e.pose==='guitar'&&a<.5&&!e.talking){const k=1-a*2;armL=mix(armL,-1.15,k);rzL=mix(rzL,.55,k);armR=mix(armR,-.75+Math.sin(t*7)*.12,k);rzR=mix(rzR,-.25,k);}
if(e.id==='tomas'&&a<.5&&!e.talking){const k=1-a*2;armR=mix(armR,-.5+Math.sin(t*.8)*.05,k);}
if(e.id==='gardien'&&!e.air){armR=-.22+Math.sin(ph)*.12*a;rzR=.12;}
setBone(B,0,root);
setBone(B,1,mm(root,piv([-.1*s,.62*s,0],RX(swing))));setBone(B,2,mm(root,piv([.1*s,.62*s,0],RX(-swing))));
setBone(B,3,mm(root,piv([-.28*s,1.08*s,0],mm(RX(armL),RZ(rzL)))));setBone(B,4,mm(root,piv([.28*s,1.08*s,0],mm(RX(armR),RZ(rzR)))));
setBone(B,5,mm(root,piv([0,1.16*s,0],mm(RY(e.look),RX(Math.sin(t*.9+e.z)*.03*(1-a))))));}
function poseCat(e,t){const B=e.bones,a=e.amp,ph=e.phase,root=mm(T(e.x,e.y+Math.abs(Math.sin(ph))*.02*a,e.z),RY(e.heading));const sw=Math.sin(ph)*.7*a;
setBone(B,0,root);setBone(B,1,mm(root,piv([-.07,.2,.14],RX(sw))));setBone(B,4,mm(root,piv([.07,.2,-.14],RX(sw))));setBone(B,2,mm(root,piv([.07,.2,.14],RX(-sw))));setBone(B,3,mm(root,piv([-.07,.2,-.14],RX(-sw))));
setBone(B,5,mm(root,piv([0,.3,-.2],mm(RY(Math.sin(t*2.3+e.x)*.5),RX(Math.sin(t*1.1)*.2)))));}
function poseCrab(e,t){const B=e.bones,root=mm(T(e.x,e.y+.01,e.z),RY(e.heading));const sw=Math.sin(e.phase)*.35*e.amp+Math.sin(t*3+e.id)*.04;setBone(B,0,root);setBone(B,1,mm(root,piv([-.12,.06,0],RZ(sw))));setBone(B,2,mm(root,piv([.12,.06,0],RZ(-sw))));}
// Chèvre : géométrie unité, scale appliqué UNE SEULE FOIS par la matrice racine.
// Réutilise les champs des entités existantes ; e.pose='graze' pour brouter.
// Os 1+4 et 2+3 en opposition (diagonales), os 5 tête indépendante.
function poseGoat(e,t){
  const B=e.bones,s=e.scale??1,a=clamp(e.amp??0,0,1),ph=e.phase??0;
  const walking=(e.speed??0)>.05,amount=walking?a:0;
  const bob=Math.abs(Math.sin(ph))*.026*amount+Math.sin(t*2)*.004;
  const root=mm(T(e.x,e.y+bob*s,e.z),RY(e.heading??0),SC(s));
  setBone(B,0,root);
  const sw=Math.sin(ph)*.62*amount;
  for(const [i,x,z,sign] of [[1,-.17,.27,1],[2,.17,.27,-1],[3,-.17,-.27,-1],[4,.17,-.27,1]])
    setBone(B,i,mm(root,piv([x,.46,z],RX(sw*sign))));
  const graze=!walking&&!e.talking&&e.pose==='graze';
  const nod=graze?.82+Math.sin(t*3)*.055:Math.sin(t*1.4+(e.x??0))*.045;
  const look=clamp(e.look??0,-.7,.7);
  setBone(B,5,mm(root,piv([0,.66,.32],mm(RY(look),RX(nod)))));
  setBone(B,6,mm(root,piv([0,.59,-.37],RY(Math.sin(t*3+ph)*.28))));
}

// Lot 3 : farm.js précède anim.js dans build.py. Remplacer les maillages
// provisoires une fois, sans dépendance temporelle dans la boucle de rendu.
// installCropDesign(); — désactivé le 9 sept. 2026 (Claude) : les cultures en grille dense 3×3 de farm.js (style Hay Day) sont conservées ; cropDesignRig reste disponible dans rig.js pour une version en grille.
function poseHen(e,t){
 const B=e.bones,s=e.scale??1,a=clamp(e.amp??0,0,1),ph=e.phase??0;
 const p=clamp(e.peck??0,0,1),peck=p*(.85+.15*Math.cos(p*Math.PI*6));
 // Pieds au sol au repos ; le picorage utilise le pivot de tête du contrat.
 const root=mm(T(e.x,e.y+s*(Math.abs(Math.sin(ph))*.01*a),e.z),RY(e.heading??0),SC(s));
 setBone(B,0,root);
 setBone(B,1,mm(root,piv([0,.27,.06],RX(peck*1.3+Math.sin(t*3+(e.id??0))*.025*(1-a)*(1-p)))));
 const sw=Math.sin(ph)*.58*a;
 setBone(B,2,mm(root,piv([-.04,.12,0],RX(sw))));
 setBone(B,3,mm(root,piv([.04,.12,0],RX(-sw))));
 setBone(B,4,mm(root,piv([0,.24,-.12],mm(RY(Math.sin(t*3+(e.id??0))*.1),RX(-peck*.12)))));
}

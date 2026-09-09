// anim.js — poses procédurales (marche, bras, tête, chat, crabe). Appelées par update() avec l'entité et le temps.
// Propriétaire : ANIMATION (GPT-6 Astra). Contrat : poseHuman(e,t)/poseCat(e,t)/poseCrab(e,t) remplissent e.bones (Float32Array 16 matrices).
function poseHuman(e,t){const s=e.scale,B=e.bones,a=e.amp,ph=e.phase,bob=Math.abs(Math.sin(ph))*.045*a*s+Math.sin(t*2)*.006;
const root=mm(T(e.x,e.y+bob,e.z),RY(e.heading));let swing=Math.sin(ph)*.85*a,sway=Math.sin(t*1.7+e.x*3)*.05*(1-a);let armL=-Math.sin(ph)*.7*a+sway,armR=Math.sin(ph)*.7*a-sway,rzL=-.08,rzR=.08;
if(e.air){swing=-.55;armL=-1.3;armR=-1.3;rzL=-.5;rzR=.5;}
if(e.pose==='guitar'&&a<.5&&!e.talking){const k=1-a*2;armL=mix(armL,-1.15,k);rzL=mix(rzL,.55,k);armR=mix(armR,-.75+Math.sin(t*7)*.12,k);rzR=mix(rzR,-.25,k);}
if(e.id==='tomas'&&a<.5&&!e.talking){const k=1-a*2;armR=mix(armR,-.5+Math.sin(t*.8)*.05,k);}
if(e.id==='gardien'&&!e.air){armR=-.22+Math.sin(ph)*.12*a;rzR=.12;}
// Les gestes sont à durée fixe ; aucune boucle si la pose reste renseignée.
const gesture=farmGesture(e,t);
let upper=root,headNod=0;
if(gesture){
 const w=gesture.weight;
 swing*=1-w;armL=mix(armL,gesture.left,w);armR=mix(armR,gesture.right,w);
 rzL=mix(rzL,gesture.rollL,w);rzR=mix(rzR,gesture.rollR,w);
 upper=mm(root,T(0,-gesture.dip*s,0),piv([0,.66*s,0],RX(gesture.lean)));
 headNod=gesture.nod;
}
setBone(B,0,upper);
setBone(B,1,mm(root,piv([-.1*s,.62*s,0],RX(swing))));setBone(B,2,mm(root,piv([.1*s,.62*s,0],RX(-swing))));
setBone(B,3,mm(upper,piv([-.28*s,1.08*s,0],mm(RX(armL),RZ(rzL)))));setBone(B,4,mm(upper,piv([.28*s,1.08*s,0],mm(RX(armR),RZ(rzR)))));
setBone(B,5,mm(upper,piv([0,1.16*s,0],mm(RY(e.look),RX(headNod+Math.sin(t*.9+e.z)*.03*(1-a))))));}
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

// Lot 4 — contrat : e.pose='dig'|'water'|'harvest', e.farmPoseStart=t
// (secondes, même horloge que poseHuman). Durée .6 s ; pas de redémarrage
// implicite ni de modification des récoltes/du joueur dans la fonction de pose.
function farmGesture(e,t){
 if(e.air||e.talking||!['dig','water','harvest'].includes(e.pose)||!Number.isFinite(e.farmPoseStart))return null;
 const u=(t-e.farmPoseStart)/.6;if(u<0||u>=1)return null;
 const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 const w=ease(u/.18)*(1-ease((u-.72)/.28));
 if(e.pose==='dig'){
  const lift=ease(u/.3),strike=ease((u-.3)/.22),angle=-1.15*lift+1.12*strike;
  return{weight:w,left:-.48,right:angle,rollL:-.23,rollR:.04,lean:.075*w*strike,dip:0,nod:.12*w};
 }
 if(e.pose==='water'){
  const pour=ease((u-.25)/.18)*(1-ease((u-.65)/.18));
  return{weight:w,left:-.52,right:-.5+.38*pour,rollL:-.30,rollR:-.06,lean:.18*w,dip:0,nod:.15*w};
 }
 const pull=ease((u-.43)/.22);
 return{weight:w,left:-.18-.75*pull,right:-.22-.78*pull,rollL:-.2,rollR:.2,lean:.52*w*(1-.5*pull),dip:.08*w,nod:.18*w};
}
// Animal prêt à brancher : pas d'apparition ni de quête ajoutée ici.
function poseSheep(e,t){
 const B=e.bones,s=e.scale??1,a=clamp(e.amp??0,0,1),ph=e.phase??0;
 const moving=(e.speed??0)>.05,amount=moving?a:0;
 const root=mm(T(e.x,e.y+s*Math.abs(Math.sin(ph))*.018*amount,e.z),RY(e.heading??0),SC(s));
 setBone(B,0,root);
 for(const [i,x,z,sign]of[[1,-.17,.27,1],[2,.17,.27,-1],[3,-.17,-.27,-1],[4,.17,-.27,1]])
  setBone(B,i,mm(root,piv([x,.46,z],RX(sign*Math.sin(ph)*.52*amount))));
 const grazing=!moving&&!e.talking&&e.pose==='graze';
 const nod=grazing?.98+Math.sin(t*3)*.06:Math.sin(t*1.3+(e.x??0))*.035;
 setBone(B,5,mm(root,piv([0,.66,.32],mm(RY(clamp(e.look??0,-.6,.6)),RX(nod)))));
 setBone(B,6,mm(root,piv([0,.59,-.37],RY(Math.sin(t*2.8)*.16))));
}

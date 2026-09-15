// archipel.js — registre des îles et étendue du monde. Chargé juste après core.js.
// Propriétaire : GAMEPLAY (Claude Code) ; Astra y ajoute une entrée quand il livre une île (centre, rayon, ponton, apparition).
// Coordonnées en mètres, Y vertical, mer à y=0. heading : 0 = vers +Z, direction (sin h, cos h).
const WORLD={x0:-48,z0:-40,size:96};   // carré couvert par la carte de hauteur et les ombres
const sceneMarks=[];   // plages de sommets par île (remplies par build.py autour de chaque src/islands/*.js)
const islands=[
{id:'azura',name:'Azura',center:[0,-1],r:14,spawn:[.2,9.8],dock:{x:-4.2,y:.59,z:12.6,heading:0,len:1.2,build:false},landing:[-4.2,12.4]},
{id:'phare',name:"L'Île du Phare",center:[34,-18],r:12,spawn:[35.8,-7.4],dock:{x:34,y:.6,z:-5,heading:Math.atan2(-38.2,20),len:4,width:1.6,build:true},landing:[35.8,-6.2]},
{id:'champs',name:"L'Île des Champs",center:[-32,10],r:14,spawn:[-23,10],dock:{x:-20,y:.6,z:10,heading:Math.atan2(15.8,2.6),len:4,width:1.6,build:true},landing:[-21.97,9.68]},
{id:'arche',name:"L'Île de l'Arche",center:[32,36],r:14,spawn:[20.5,26],dock:{x:19.8,y:.6,z:24.4,heading:Math.atan2(-.7,-1.6),len:2.5,width:1.6,build:false,via:[[28,21],[32,27],[32,48],[12,48]]},landing:[20.5,26]},   // via : du ponton vers le large, le voilier passe sous la voûte (chenal x 29–35)
{id:'cabanes',name:"L'Île aux Cabanes",center:[-32,38],r:14,spawn:[-23,34],dock:{x:-20.2,y:.65,z:30,heading:Math.atan2(3.5,-5),len:2.5,width:1.8,build:false,via:[[-17,27]]},landing:[-23,34]}
];

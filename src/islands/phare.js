// islands/phare.js — Île du Phare · Astra · livraison 1 : relief seul
//
// CONTRAT D'INTÉGRATION — mètres ; Y vertical ; mer Y=0.
// Centre : { x:34, z:-18 }. Rayon nominal : 12 ; rayon englobant : 14.
// Zone réservée : x ∈ [20,48], z ∈ [-32,-4].
// Ponton RÉSERVÉ, non construit : centre { x:34, y:0.60, z:-5 }.
// Orientation sortante vers Azura (-4.2,15) : Math.atan2(-38.2,20).
// Convention : heading en radians ; 0 vers +Z ; direction (sin(h),cos(h)).
// Longueur prévue : 4 m ; largeur : 1.6 m ; tablier à Y=0.60.
// Extrémité terre : (35.772,0.60,-5.928) ; mer : (32.228,0.60,-4.072).
// Apparition sur TERRE : { x:35.8, y:0.56, z:-7.4, heading:Math.PI }.
// Raccord terre du ponton : (35.8,0.56,-6.2).
// Plateau du futur phare : centre (34,12.50,-24.6), disque libre r=1.4 m.
//
// Bloc exécuté après island.js, avant scene_end.js : aucun appel supplémentaire.
// Aucun bâtiment, végétation, ponton construit, PNJ ou registre de gameplay.
// Aucun ajout à terraces/platforms/stairDefs : les escaliers viendront ensuite.
// La crique sert au premier test de débarquement ; les falaises ne sont PAS
// un chemin vers le sommet. Claude étend la carte de hauteur et les ombres.
// L'aléa est isolé pour préserver les nuages/maillages créés après ce bloc.
{
  const pharePreviousSeed = seed;
  seed = 341809;
  try {
    const CX = 34, CZ = -18;
    const radialSteps = 56, angularSteps = 96;
    const smooth = t => { t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); };

    // Côte irrégulière et avancée sableuse au sud-est pour le futur ponton.
    function coastRadius(a) {
      const delta = Math.atan2(Math.sin(a-1.42), Math.cos(a-1.42));
      return 11.45 + .32*Math.sin(3*a+.7) + .22*Math.cos(5*a)
        + 1.70*Math.exp(-delta*delta/.15);
    }
    function surfaceY(x,z,r) {
      const inland = smooth((1-r)/.23);
      const ascent = smooth((-z-10)/13);
      const shoulder = Math.sin((x-CX)*.63)*.24*Math.sin(ascent*Math.PI);
      const height = .56 + (11.94*ascent+shoulder)*inland;
      // Plage émergée puis estran immergé ; aucun bord flottant sur l'eau.
      return height - 1.36*smooth((r-.94)/.06);
    }
    function point(r,a) {
      const radius = coastRadius(a)*r;
      const x = CX+Math.cos(a)*radius, z = CZ+Math.sin(a)*radius;
      return [x,surfaceY(x,z,r),z];
    }
    function material(p,r) {
      const north = smooth((-p[2]-10)/13);
      if(p[1]<.9 && (p[2]>-11 || r>.91)) return tint(palette.sand,.98);
      // Palette existante reconnue par le shader ; aucune nouvelle matière.
      const band = .95+.035*Math.sin(p[1]*2.6)+.018*Math.sin(p[0]*1.3+p[2]*.6);
      return tint(north>.66?palette.rockLight:palette.rock,band);
    }
    const rings = [];
    for(let j=0;j<=radialSteps;j++) {
      const r=j/radialSteps, row=[];
      for(let i=0;i<angularSteps;i++) row.push(point(r,i/angularSteps*TAU));
      rings.push(row);
    }
    // Winding vers +Y ; éventail central sans triangles dégénérés.
    const center = point(0,0);
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps;
      tri(center,rings[1][next],rings[1][i],material(center,0));
    }
    for(let j=1;j<radialSteps;j++) for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[j][i], b=rings[j][next];
      const c=rings[j+1][next], d=rings[j+1][i];
      const middle=[(a[0]+c[0])*.5,(a[1]+c[1])*.5,(a[2]+c[2])*.5];
      quad(a,b,c,d,material(middle,(j+.5)/radialSteps));
    }
    // Socle immergé fermé, pour les vues rasantes depuis le bateau.
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[radialSteps][i], b=rings[radialSteps][next];
      quad(a,[a[0],-2.4,a[2]],[b[0],-2.4,b[2]],b,palette.rock);
      tri([CX,-2.4,CZ],[a[0],-2.4,a[2]],[b[0],-2.4,b[2]],palette.rock);
    }
    // Monolithes ancrés sur les flancs ; crique et plateau dégagés.
    for(const p of [
      [26.0,2.0,-17.7,1.6,3.0,2.0],
      [25.8,3.5,-21.8,1.3,4.5,1.6],
      [28.8,5.0,-26.2,1.5,4.8,1.7],
      [39.8,4.8,-24.4,1.5,4.6,1.8],
      [42.0,2.4,-20.0,1.6,3.4,2.0],
      [41.8,.9,-14.7,1.3,1.8,1.5],
      [28.2,.25,-11.6,1.0,.9,1.1]
    ]) rock(...p);
  } finally {
    seed = pharePreviousSeed;
  }
}

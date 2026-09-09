# Livraison 4 — Astra → Claude

Base exacte : main `f1fa20c`. Fichiers complets : src/rig.js, src/anim.js et cette note. Aucun changement de world.js, game.js, farm.js, render.js ou archipel.js. Les cultures denses de Claude sont conservées ; installCropDesign() reste désactivé.

## 1. Gestes de ferme (à déclencher dans farm.js)

`poseHuman(e,t)` reconnaît `e.pose = 'dig' | 'water' | 'harvest'` avec `e.farmPoseStart` en secondes sur la même horloge que `t`. Dans le render actuel : `performance.now() * .001`, surtout pas game.clock (qui peut sauter pendant le sommeil).

Durée fixe : 0.6 seconde. Levée/frappe/retour pour dig, inclinaison/versement/retour pour water, flexion/prise/retour pour harvest. Torse, tête et bras participent ; les jambes conservent leur racine pour éviter de glisser avec la flexion du buste. Saut et dialogue prennent priorité. La fonction ne modifie aucun champ de l'entité et ne boucle pas : après 0.6 s, elle rend la pose normale, même si e.pose n'a pas encore été nettoyé.

Branchement recommandé, lors d'une action agricole acceptée :

```js
// Conserver auparavant le mesh et la pose pour les restaurer à la fin.
player.pose = {till:'dig', water:'water', harvest:'harvest'}[th.act];
player.farmPoseStart = performance.now() * .001;
player.amp = 0;
player.speed = 0;
// Tourner vers le centre de la parcelle :
player.heading = Math.atan2(th.c.x-player.x, th.c.z-player.z);
if (th.act === 'till') player.mesh = heroFarmMeshes.hoe;
if (th.act === 'water') player.mesh = heroFarmMeshes.can;
```

Pendant les 0.6 s, bloquer les déplacements et les nouveaux déclenchements côté gameplay. À expiration (ou interruption par voyage/dialogue), restaurer le mesh et la pose sauvegardés, puis supprimer farmPoseStart. La récolte emploie le héros sans outil. Les effets de gameplay et leur instant d'application restent à Claude ; aucun timer ni changement de récolte ajouté ici.

## 2. Outils

`humanoid({...options, prop:'hoe'})` et `humanoid({...options, prop:'can'})` fonctionnent avec les options/échelles existantes. Les outils sont intégrés au groupe de la main droite, os 4, sans os supplémentaire.

Bêche : manche bois, poignée en T, lame métal et tranchant clair (140 triangles). Arrosoir : corps arrondi émaillé turquoise, anse, ouverture sombre, bec et pomme percée (510 triangles). Pas de particules d'eau dans ce lot.

`heroFarmMeshes.hoe` et `.can` sont déjà préchargés, avec la tenue actuelle du héros. Ne pas recréer humanoid/meshDyn à chaque interaction. Si la tenue du héros change ultérieurement, adapter les options dans ce préchargement. Aléa isolé/restauré ; les autres personnages restent identiques.

## 3. Mouton pour la suite

Exports : `sheepMesh`, `sheepRig()`, `poseSheep(e,t)`. Sept os, +Z devant, origine au sol, géométrie unité ; scale appliqué une seule fois par la pose. Indices/pivots identiques à la chèvre :

- 0 corps ; 1/2 pattes avant (±.17,.46,.27) ; 3/4 arrière (±.17,.46,-.27).
- 5 tête (0,.66,.32) ; 6 queue (0,.59,-.37).

Entité : x/y/z, heading, scale, phase, amp, speed, look, pose, talking ; bones = new Float32Array(16*7). Dessiner avec n:7, mode:4 après poseSheep. `pose:'graze'` anime la tête à l'arrêt ; la marche utilise les diagonales et la queue bouge légèrement. Laine crème en larges mèches, museau gris, sabots foncés, hauteur ~.945 m ; 2214 triangles. Aucun emplacement, achat ou système de production ajouté : animal prêt pour le prochain gameplay.

## Vérifications

- `python3 build.py --check` et `git diff --check` passent.
- Exécution Node des constructeurs avec contexte GL simulé : outils finis sur l'os 4 aux échelles .7/1/1.2 ; mouton fini, indices 0–6, base au sol.
- Comparaison matricielle avec poseHuman de f1fa20c : comportement inchangé sans geste actif, y compris marche, guitare et saut.
- 549 échantillons des trois gestes : matrices finies, continuité des poses aux bornes 0 et .6 s ; suppression du geste pendant saut/dialogue.
- Poses du mouton testées au repos/en marche/en broutage à trois échelles.

Aucun rendu GPU ni benchmark téléphone effectué ici. Après branchement : vérifier la portée de la lame, l'inclinaison de l'arrosoir et l'absence de déplacement pendant le geste. La fréquence d'images des cultures ne devrait pas être affectée par leur géométrie, restée intacte ; elle n'a pas été remesurée.

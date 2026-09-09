# Livraison design 2 — Astra → Claude

Base : main `ab3c583`. Fichiers complets ; si main a avancé, reporter les différences depuis cette base plutôt que remplacer des changements récents. Aucun changement de world.js, game.js, farm.js, render.js ou archipel.js.

## Contenu

- Phare : relief à vires, éboulis, trois maisons, tour avec galerie et lanterne. Crique et apparition conservées. Les socles sont découpés sous les escaliers pour ne pas masquer les marches.
- Champs : trois niveaux, rectangle cultivable 8 × 8 m à Y=1.2, maison avec porche, puits et clôtures ouvertes. Coordonnées et proposition de registre en tête de champs.js. Le ponton doit être construit par le registre, pas par ce module.
- Gardien en ciré jaune, cheveux et barbe gris, lanterne portée. Chèvre à sept os, marche diagonale, mouvements de tête/queue et pose `graze`.
- Affinage du humanoid arrondi de Claude : coiffures, visage, col, pouces. Chat, mouette et crabe arrondis ; pivots conservés. La pose de saut existante est conservée.
- Azura : retrait de 73 objets décoratifs dont les volumes empiétaient sur le passage des escaliers et sa marge de 0.4 m. Massifs principaux conservés, tirages aléatoires consommés même pour les objets retirés.

## Branchements nécessaires

1. Ajouter l'entrée `champs` au registre pour le rendu par île, le bateau, la mini-carte et l'apparition. La déclaration complète figure en tête de champs.js. Ajouter ensuite sa zone à la ferme selon le format actuel de farm.js.
2. Déplacer le gardien et les chèvres vers les positions indiquées en tête de phare.js. Utiliser `cellH` pour la hauteur réelle ; le tampon des escaliers est 0.01 m sous la cote nominale. Adapter les limites de promenade : le rayon aléatoire actuel de 3.5 m peut conduire aux falaises.
3. `npcMeshes.gardien` utilise `poseHuman` et 6 os ; garder scale=1. Les sélecteurs actuels de game.js trouvent déjà `goatMesh` et `poseGoat` automatiquement. La chèvre utilise les indices 0–6 ; le tableau actuel de 8 matrices et `n:8` restent compatibles. `e.pose='graze'` active le broutage à l'arrêt. Aucune nouvelle logique de comportement ajoutée ici.
4. Après la remise à zéro de drawList et la pose du gardien :

```js
const phareGlow = phareLanternDraw(t, game.quests.oil === 2);
if (phareGlow) drawList.push(phareGlow);
// Dans la boucle des PNJ, après poseHuman(n,t), si le PNJ est visible :
if (n.id === 'gardien') drawList.push(gardienLanternDraw(n));
```

Les deux descripteurs utilisent mode 7 et noShadow. Sans ces branchements, le verre ambre et les cages sont visibles mais l'émission n'est pas soumise au rendu. Le prédicat de quête reste à adapter si l'état `oil` a changé. Aucun faisceau lumineux ajouté.

## Vérification effectuée

- `python3 build.py --check` : assemblage et syntaxe valides.
- Exécution des constructeurs dans Node : coordonnées et maillages finis, aléa des îles isolé, indices d'os du gardien et de la chèvre valides, matrices de pose finies.
- Rasterisation CPU des triangles sur grille de 0.08 m, puis application du code de tamponnage/blocage/flood-fill de world.js : apparition, gardien, trois chèvres, ferme, accès du porche et du puits atteignables. Registre Champs ajouté uniquement dans ce test.
- Échantillonnage du rectangle cultivable : Y=1.2 sans obstacle ; toutes les nouvelles pentes d'escalier ≤ 1:1.

Ce contrôle CPU ne remplace pas le rendu GPU. À vérifier dans Chrome et sur téléphone après intégration : affichage/culling des Champs, ombres, bloom après quête, confort de traversée et fréquence d'images. Aucune validation visuelle ni capture WebGL réalisée pour ce lot.

Cultures à trois stades et poule sont réservées au prochain lot, conformément à « plus tard ».

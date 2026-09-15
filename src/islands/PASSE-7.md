# Passe 7 — Île des Champs cosy

Base : `458773d`. Livraison : `src/islands/champs.js` et cette note.

## Modélisation

- Maison du joueur : crépi ivoire arrondi, porte cintrée, croisillons, volets vert d'eau, fleurs, auvent, toit bombé à bandes de teinte continues, cheminée à bonnet. Corps : 651 triangles, hors porche.
- Porche : dalle historique conservée, montants épaissis et couverture arrondie (168 triangles).
- Puits : margelle ronde creuse, bois miel, treuil et corde. Barrières : poteaux et traverses arrondis, ouvertures conservées.
- Basile : comptoir adouci, toile rayée ivoire/vert d'eau bombée, cagettes, fruits et panier d'œufs. Même centre, mêmes trois emprises enregistrées, accès frontal conservé.
- Arbres en trois boules, 220 triangles chacun. Les trois arbres initiaux et les deux arbres supplémentaires retenus par les filtres sont traités, soit cinq visibles.
- Six groupes de buissons en dômes ; hauteur géométrique 0,5824 m, couleurs reconnues comme feuillage. Les filtres historiques ne retenaient que cinq candidats : un sixième est ajouté en (-40, 12.7), au sol y=0,56, hors passages.
- Rochers : positions et géométrie conservées, normales ellipsoïdales lissées et calcaire chaud pour une lecture en galets.
- Brouette (-32.8, 1), bottes de foin (-39.5, 17.4), épouvantail (-38.8, 3.6), hors champ, trajets réservés et zones des moutons.

## Poulailler : modèle fourni, branchement restant côté Claude

Le poulailler actuel est créé directement dans `farm.js`. Ce fichier n'est pas modifié dans cette livraison. Ajouter un poulailler statique dans Champs laisserait l'ancien visible et modifierait le sol échantillonné à l'initialisation des poules.

`champs.js` fournit donc `champsCoopDesign()`, une fabrique différée du nouveau maillage (239 triangles, sommets à 10 composantes, os 0). Pour l'afficher, remplacer **l'intégralité de l'initialisation existante** de `coopMesh` dans `farm.js` par :

```js
const coopMesh = meshDyn(champsCoopDesign());
```

Ne pas ajouter un deuxième `withBone`. Conserver `COOPS`, le calcul de `c.y`, l'orientation, les emprises et toute la logique des poules. L'entrée locale reste +X, donc +Z dans le monde avec l'orientation existante. Sans ce branchement, le jeu conserve son poulailler actuel ; le reste de la passe est actif.

## Contrats et contrôles

- Comparaison stricte avant/après de `platforms`, `terraces`, `houseLots`, `chimneys`, `stairDefs` : identiques.
- Champ x=[-36,-28], z=[6,14] : 6 561 sondes de géométrie à pas 0,1 m, toutes à y=1,2 avant et après.
- Hauteurs contrôlées aux neuf points comprenant porte (-35,3.55), Basile/accès, centre du poulailler, trois moutons et deux points d'arrivée : identiques à 4 cm près.
- PRNG final identique ; les appels historiques sont conservés avant remplacement des maillages. Maillage du Phare produit ensuite identique octet pour octet à celui produit avec Champs d'origine.
- Maison <=900 triangles, chaque arbre <=250 ; six buissons >=0,5 m ; trois accessoires effectivement retenus. Géométrie finie, maillage poulailler os 0 vérifié.
- Géométrie statique des Champs : **44 522 → 24 123 triangles**, soit -20 399. Poulailler dynamique exclu de ce comptage.
- `python3 build.py --check` et `git diff --check` réussis.

558 sondes complémentaires suivent les escaliers/paliers : 14 écarts de hauteur brute apparaissent près du seuil et de la margelle/du treuil. `world.js` réapplique les hauteurs absolues des escaliers, dont les définitions sont inchangées. Ce contrôle géométrique ne remplace pas une validation de la carte de collision finale : inspecter notamment le contournement du puits et le porche dans Chrome.

Aucune mesure FPS ni validation visuelle WebGL dans cet environnement. À valider côté Claude : arrivée → ferme → maison, 64 cases, puits, accès à Basile, six buissons, poules après branchement, moutons et connectivité complète. Livraison non commitée en attente de cette validation visuelle, selon le circuit ZIP des passes précédentes.

Aucun changement de `farm.js`, `world.js`, `game.js`, `render.js`, `archipel.js`, `island.js` ou du Phare. Aucun changement des platforms, stairs et du ponton. Les HTML générés ne sont pas inclus ; reconstruire avec `build.py` après intégration.

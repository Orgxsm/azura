# Azura — passe 6 cosy

Base : `61be508`. Seul **`src/island.js`** modifie le jeu ; ce document accompagne la livraison. Le Phare validé reste intact.

## Contenu

- Neuf maisons : crépi crème/rosé/vert d'eau, angles adoucis, portes 1 × 1,9 m, fenêtres à croisillons, volets, jardinières, auvents et seuils. Les maisons à étage gardent leur hauteur et leurs niveaux de balcon ; les rez-de-chaussée sont plus compacts.
- Toits continus bombés, faîtage courbe, **dégradé discret par rangée sans creux ni superposition d'écailles**. Cheminées avec bonnet élargi et positions de fumée conservées.
- Trois tours : fûts adoucis, ouvertures arrondies, toitures en bonnet et créneaux dodus sur la tour sans toit.
- Arbres et anciens palmiers transformés en silhouettes à trois boules et tronc épais. Neuf arbres retenus après le filtrage historique (six anciens palmiers, trois anciens arbres). Les autres restent retirés comme dans la base.
- 95 groupes de buissons retenus, remplacés par deux dômes chacun.
- 122 rochers décoratifs retenus : normales ellipsoïdales lissées et calcaire chaud pour une lecture en galets. **Leurs positions de sommets restent exactes**, pour conserver les surfaces des affleurements. Les quatre grands massifs du relief restent inchangés.
- Quatre éléments d'accueil : panneau peint **AZURA**, fanions sur son portique, table avec tasses au pied de la montée, casier à poissons sur le sable. Ils sont statiques.

| Nouveau groupe | Centre X, Y, Z |
|---|---|
| Panneau et fanions | −3.2, 0.337, 9.4 |
| Table | −3.6, 0.625, 5.4 |
| Casier | −0.4, 0.405, 9.4 |

Les emplacements ont été recherchés hors des disques des personnages, des objets à collecter, du coffre, de la pêche et des couloirs d'escalier. La table est au **pied** du village : aucun emplacement suffisamment libre n'a été retenu sur le parvis lui-même.

## Architecture et contrats

Les fonctions publiques `house`, `tower`, `tree`, `palm`, `shrub` et `rock` restent inchangées. Les appels des bâtiments d'Azura utilisent des wrappers locaux `azuraHome` et `azuraTower` ; les remplacements sont regroupés dans `azuraCosy`.

La géométrie historique est construite en premier pour consommer exactement les mêmes appels aléatoires et remplir les mêmes registres. Le filtre de dégagement des escaliers décide sur les **anciennes emprises**, puis la géométrie est remplacée. Aucun objet précédemment rejeté n'est réintroduit parce que sa nouvelle canopée est plus petite. Les buffers temporaires de remplacement sont libérés après construction, et la substitution désactivée pour les îles suivantes.

Comparaison stricte avec la base :

- `stairs`/`stairDefs`, `platforms`, `terraces`, `houseLots`, `chimneys` et graine finale identiques.
- Décisions de suppression des décors identiques.
- **Géométrie du Phare et des Champs identique au bit près**, après exécution de leurs fichiers avec l'ancien et le nouvel `island.js`.
- Aucune modification de `world.js`, `game.js`, `farm.js`, `render.js`, `shaders.js`, `archipel.js`, des sauvegardes ou des définitions de PNJ.

Les planchers de balcon gardent leur niveau supérieur historique (+0,075 m) et leur enveloppe extérieure. Les lattes sont regroupées en un tablier, les garde-corps simplifiés. Le balcon indépendant de la première maison reste inchangé.

## Budgets et validation effectuée

`python3 build.py --check` : OK. `git diff --check` : OK. Sommets finis, budgets des maisons et arbres vérifiés.

| Géométrie CPU | Triangles |
|---|---:|
| Azura avant | 172 718 |
| Azura après | 86 906 |
| Différence | **−85 812** |
| Maison, détails et balcon intégré éventuel compris | 651–790 |
| Arbre | 220 |

Aucun nouvel appel de dessin statique. Ces chiffres ne mesurent pas les FPS ni la mémoire GPU totale. La construction utilise temporairement les anciens maillages ; le gain concerne le rendu, pas une promesse de chargement plus rapide.

## Limites des sondes CPU — à contrôler dans Chrome

2 876 sondes effectuées, 223 échantillons dans les emprises de bâtiments exclus. Les **25 centres gameplay** testés (habitants, chat, coquillages, notes, coffre, pêche) conservent leur hauteur à 4 cm près après application des règles de plateformes/escaliers. Tous les segments d'escalier conservent leurs déclarations absolues.

Les sondes brutes diffèrent localement avec la suppression d'anciens feuillages, de garde-corps et de surplombs. **Dix différences restent après les tampons CPU**, toutes vers le bas ; la plus grande vaut environ 3,49 m. Elles ne constituent pas une preuve de régression ni de connectivité préservée : les sondes ne reproduisent pas la rasterisation et le flood fill de `world.js`.

Points à examiner en priorité :

- Bord du balcon vers Marco : `(4.19,6.45)`, `(4.55,6.60)`, `(4.86,6.84)`.
- Bord de maison vers Pia : `(−7.39,5.75)`.
- Autour de Bastien/chat : `(−0.20,0.69)`, `(−0.55,−1.85)`.
- Plantation proche du coffre : `(−8.40,3.60)`, `(−8.51,4.00)`, `(−8.43,3.39)`.
- Bord de plantation vers la note du village : `(−4.40,4.75)`.

**Pas de validation visuelle ni de mesure GPU ici** : WebGL 2 indisponible dans le navigateur de préparation. Avant fusion, vérifier plage → ponton → parvis → belvédère, les centres et périphéries des interactions, la connectivité complète, les balcons et la zone du coffre ; puis les trois cadrages et les temps par image. Inspecter aussi le raccord des cheminées et les silhouettes des maisons à étage.

Le ZIP contient uniquement `src/island.js` et `src/PASSE-6.md`. Reconstruire les HTML après copie. Aucun changement du Phare demandé pour cette passe.

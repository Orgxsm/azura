# Livraison 3 — Astra → Claude

Base exacte : main `7a0b420`. Trois fichiers JS complets et cette note, tous sous src/. Si main a avancé, reporter les changements depuis cette base. Aucun changement de world.js, game.js, farm.js, render.js ou archipel.js.

## Champs

Placage herbe/sable/terre à 6 mm des surfaces existantes, chemins entre débarquement, accès aux escaliers et pourtour de la ferme jusqu'au puits. La circulation vers la maison conserve les escaliers existants. Ajouts retenus après filtrage des emprises : 11 rochers, 6 petits buissons, 4 groupes de fleurs et 2 arbres.

Rectangle x[-36,-28], z[6,14] intact ; disque de rayon 1.6 m autour du poulailler (-24,12.7) exclu ; disque de rayon .85 m autour de la porte (-35,3.55) exclu. Les décorations volumétriques conservent .4 m de marge autour des escaliers et chemins. Aucun changement des paliers, de la maison, du puits ou du ponton.

## Poule

`henMesh` / `poseHen(e,t)` : sélection automatique par les fonctions existantes de farm.js, aucun branchement supplémentaire. Cinq os et pivots exactement conformes au message de Claude ; hauteur au repos ~.36 m, avant +Z, origine au sol, échelle appliquée une fois par la pose. Pattes opposées, queue mobile, tête plongeant avec `e.peck` borné à [0,1]. `e.amp` et `e.phase` pilotent la marche. Couleurs crème, ailes miel, crête et barbillon rouges, bec et doigts dorés.

## Cultures

`cropDesignRig(id,stage)` produit les douze maillages, tous sur l'os 0, dans l'emprise d'une parcelle et sous 1 m. Stade 0 : graines ; 1 : pousses ; 2 : feuilles/boutons ; 3 : récolte (tomates, épis, fleurs ouvertes). Tomate avec tuteur et calices, blé en touffe dorée, fleur de sable à trois corolles.

`installCropDesign()` est appelé UNE FOIS dans anim.js, après farm.js selon l'ordre actuel de build.py. Il remplace `cropMeshes[id][0..3]` sans toucher à farm.js. Conserver cet ordre ; ne pas déplacer l'appel dans rig.js, où cropMeshes n'est pas encore initialisé. Aucun appel nécessaire depuis update(). Aléa isolé et restauré.

Triangles au stade mûr : tomate 1268, blé 1920, fleur 1912. Hauteurs maximales respectives : .77, .897 et .70 m.

## Vérification

- Assemblage et syntaxe : `python3 build.py --check`.
- Exécution de rig.js, du farm.js actuel et d'anim.js dans Node avec contexte GL simulé : sélection automatique de la poule et remplacement effectif des douze cultures.
- Rasterisation CPU de la géométrie puis tamponnage/collisions/flood-fill du world.js actuel : 64 parcelles des Champs reconnues par le vrai code de farm.js ; apparition, porte, puits et approche du poulailler atteignables.
- Vérification des indices d'os, dimensions des douze cultures et matrices de la poule sur 30 combinaisons échelle/picorage/marche.

Reste à valider dans Chrome et sur téléphone : aspect des plaques, picorage, ombres et fréquence d'images avec 64 cultures mûres. Aucun rendu GPU ni mesure de performances effectué ici. L'animation facultative de bêchage/arrosage n'est pas incluse ; les animations humaines existantes sont conservées.

# Livraison 5 — Astra → Claude

Base exacte : main `c6ff9e9` (Basile déjà déclaré côté gameplay). Fichiers complets : champs.js, rig.js, anim.js, et cette note. Aucun changement de world.js, game.js, farm.js, render.js ou archipel.js. Noms existants farmGesture/actGesture conservés, cultures inchangées.

## Étal sur les Champs

Repère (-23.6, .56, 7.4), avant +Z. Enveloppe mesurée : x[-24.7642,-22.4358], z[6.7,8.0866], soit environ 2.33 × 1.39 m (limite 2.4 × 1.6 respectée). Hauteur de la toile : 1.94 m au-dessus du sol au maximum.

Comptoir en lattes de bois, toile rayée crème/sauge, deux cagettes garnies et panier de cinq œufs. Un ancien rocher et un buisson qui occupaient l'étal sont supprimés ; un petit rocher voisin est décalé.

Le disque r=1 en (-23.6,8.6) croise l'emprise d'un rectangle classique centré en 7.4. Le comptoir est donc reculé, la toile échancrée et les poteaux avant écartés. Trois entrées terraces.push déclarent le comptoir et les deux poteaux avant, au lieu d'un grand rectangle qui condamnerait l'accès. Les marges de collision .3/.15 m de world.js sont prises en compte. La géométrie de la toile reste aussi à l'extérieur du disque.

## Basile

`npcMeshes.marchand` est initialisé avant game.js : la définition actuelle de Basile le sélectionne automatiquement. `marchandRig()` : six os, poseHuman, scale 1. Chemise crème, tablier rayé sauge/crème suivant le volume du torse, béret, moustache et panier garni porté par le bras gauche. Aucun dialogue ni déplacement du PNJ ajouté.

## Gouttes facultatives

`waterDropsMesh` : six tétraèdres, exactement 12 sommets par goutte / 72 sommets au total, os 0–5.

`waterDropsDraw(x,y,z,u)` renvoie `{mesh,bones,n:6,mode:2,noShadow:true}`. x/y/z sont la position MONDE de la sortie de l'arrosoir ; u est la progression normalisée du geste (0–1). Les gouttes descendent jusqu'à .38 m sous ce point et se dispersent légèrement. Elles deviennent imperceptibles aux bornes, sans matrice nulle. Entrées non finies : retour null ; u hors intervalle : borné.

Appeler seulement pour le geste d'arrosage, puis pousser le résultat non-null dans drawList. Pour suivre précisément le bec, transformer le point local (.3,.235,.44), multiplié par player.scale, avec la matrice de l'os 4 APRÈS poseHuman. Sinon un point de versement au-dessus de la parcelle convient. Aucun appel injecté dans farm.js. Chaque appel possède ses matrices : deux effets dans la même frame ne s'écrasent pas. Mode 2 éclairé, pas de nouvelle transparence ni de shader ajouté.

## Contrôles effectués

- `python3 build.py --check` et `git diff --check`.
- Rasterisation CPU de la géométrie puis tamponnage/collisions/flood-fill du world.js actuel : disque d'accès r=1 échantillonné au pas .04 m libre/atteignable ; position de Basile et extrémités de sa promenade .35 m accessibles. Ferme, maison, puits et autres accès conservés.
- Enveloppe de l'étal sous la limite ; arêtes projetées hors du disque d'accès, y compris la toile.
- Maillage du marchand fini, os 0–5 ; gouttes : 72 sommets, matrices finies sur u=0..1, descripteurs indépendants.

Pas de rendu GPU ni de benchmark mobile effectué ici. Après intégration dans Chrome : vérifier l'aspect du tablier et de la toile, le dialogue avec Basile et la position du point d'émission des gouttes.

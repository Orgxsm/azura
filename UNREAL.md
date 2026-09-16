# Azura sur Unreal Engine — plan (16 sept. 2026)

Décision de Léo : produire une version d'Azura pour Unreal Engine 5, avec Astra (design) et Claude (pipeline, gameplay). Ce document fixe le périmètre et la méthode ; il évoluera.

## Contraintes de départ (relevées le 16 sept.)
- Mac de Léo : MacBook Pro Intel i7-8750H, Radeon Pro 555X (4 Go), 16 Go de RAM, 70 Go libres, macOS 15.7. **Unreal n'est pas installé**, ni Xcode (seulement les Command Line Tools), ni Blender.
- Ni Astra ni Claude ne peuvent lancer l'éditeur Unreal : Léo est l'opérateur de l'éditeur. Claude fournit des fichiers importables et des scripts Python pour l'éditeur (API `unreal`), Astra fournit la direction artistique et des assets.
- Unreal 5.4/5.5 tourne sur Mac Intel avec Metal, mais Nanite et Lumen y sont limités : viser un rendu **Lumen désactivé / éclairage précalculé ou dynamique simple**, Forward ou Deferred classique, projet « Third Person » comme base. Compter ≈ 50 Go d'espace disque pour l'éditeur + le projet.

## Pipeline
1. **Export de la géométrie** (fait) : `node tools/export_gltf.js` écrit `export/<île>.glb` (glTF binaire, couleurs par sommet, normales) pour chaque île + `riviere.glb`, et `export/azura-scene.json` (registre des îles, escaliers, plateformes, emprises, unités). Unreal les importe via l'importateur glTF (Interchange) ; un matériau maître lit `Vertex Color` en base color, la rugosité par famille de teinte comme dans notre shader.
2. **Projet Unreal** : Léo crée un projet Third Person (Blueprint, Mac) et active le plugin Python Editor Script. Claude fournit `unreal/setup_azura.py` (à écrire) : import des .glb, placement des îles, mer (plan d'eau), ciel/lumière du jour, collisions (`Use Complex Collision As Simple`), points de spawn et pontons d'après le JSON.
3. **Gameplay** (port progressif, Blueprints + C++ si Xcode) : personnage et caméra (template), voyage en voilier entre pontons (Spline), PNJ et dialogues (Data Table depuis nos textes), quêtes et sauvegarde (SaveGame), cycle jour/nuit, ferme. Chaque brique reprend la logique de `game.js`/`farm.js`.
4. **Direction artistique** (Astra) : matériaux stylisés cosy (crépi, tuiles, bois, feuillage, eau), post-process (bloom doux, ombres lavande, brume), palette DA-COSY.md ; à terme, remplacement des maillages procéduraux par des assets propres (glTF exportés par ses générateurs Python).

## Ordre proposé
1. Léo installe Unreal 5.4 ou 5.5 (Epic Games Launcher) et crée le projet `AzuraUE` (Third Person, Blueprint).
2. Claude livre `unreal/setup_azura.py` + guide d'import ; Léo l'exécute dans l'éditeur (Output Log / Python) et renvoie captures et erreurs.
3. Mer, ciel, lumière, matériau à couleurs de sommet → première vidéo de fly-through des 6 îles.
4. Personnage jouable sur les îles (collisions), voilier entre pontons, puis PNJ/quêtes.

## Ce qui est prêt
- `tools/export_gltf.js` + `export/` (ignoré par git, à régénérer) : 6 îles (86 906 / 83 126 / 24 123 / 32 679 / 32 214 / 42 434 triangles) + rivière.

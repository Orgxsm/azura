# Azura · L'île aux toits d'argile

Jeu d'exploration 3D dans un seul fichier HTML (WebGL2, aucune dépendance, aucun asset externe).
L'île a été conçue par GPT-6 Astra ; le moteur de jeu, le rendu et les quêtes par Claude Code. Le projet est maintenant un dépôt Git partagé entre les deux, voir `COLLAB.md` et `TASKS.md`.

## Jouer
```
python3 build.py --check      # assemble src/ → dist/Azura-3D.html (+ copie dans ~/Downloads)
open dist/Azura-3D.html       # ou double-clic
```
Clavier : ZQSD / flèches, Maj courir, E parler / agir, M mini-carte, Échap menu. Tactile : joystick + bouton.

## Structure
```
src/ui.html      interface (CSS, DOM)
src/boot.html    écran de chargement
src/core.js      WebGL, maths, primitives de construction
src/island.js    l'île d'Azura
src/util.js      helpers, matrices, maillages à os
src/rig.js       personnages, animaux, objets
src/shaders.js   GLSL (éclairage, matériaux, ciel, eau, post-traitement)
src/world.js     carte de hauteur, praticabilité
src/audio.js     sons synthétisés
src/game.js      état, quêtes, dialogues, sauvegarde, UI, update()
src/anim.js      poses procédurales
src/render.js    pipeline de rendu, qualité, render()
build.py         assemblage
dist/            fichier assemblé (ne pas éditer)
```

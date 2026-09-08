# Travailler à deux sur Azura (GPT-6 Astra × Claude Code)

Dépôt Git **local** : `/Users/jl/azura` (sur l'ordinateur de Léo, pas de remote pour l'instant).
Branche d'intégration : `main`. Branches de travail : `astra/*` (design, animation) et `claude/*` (gameplay, fonctionnalités).

## Règle d'or
Le jeu est **un seul fichier HTML** assemblé par `python3 build.py` à partir de `src/`. On ne modifie jamais `dist/Azura-3D.html` ni `~/Downloads/Azura-3D.html` à la main : on édite `src/`, on assemble, on teste.

Tout le code vit dans **une seule portée JavaScript** (une IIFE). Donc :
- pas deux fonctions ou `const` du même nom dans deux fichiers (voir la liste des noms réservés plus bas) ;
- l'ordre d'assemblage (`ORDER` dans `build.py`) est fixe : `core → island → util → rig → shaders → world → audio → game → anim → render` ;
- un fichier peut appeler une fonction déclarée plus loin (hoisting), mais pas lire une `const` déclarée plus loin au moment du chargement.

## Qui possède quoi

| Fichier | Rôle | Propriétaire |
|---|---|---|
| `src/ui.html` | CSS + DOM de l'interface | partagé : Astra pour le style, Claude pour les ids et le comportement |
| `src/boot.html` | écran de chargement / erreurs | Claude |
| `src/core.js` | contexte WebGL, `rnd()`, maths, primitives `tri/quad/box/cylinder/ellipsoid/beam/rock/patch` | partagé, ne pas renommer |
| `src/island.js` | **l'île d'Azura** : relief, maisons, escaliers, végétation, socles, terrasses | **Astra** |
| `src/islands/*.js` (à créer) | les nouvelles îles de l'archipel | **Astra** |
| `src/util.js` | `$`, `clamp`, `mix`, matrices, `withBone/rig/meshDyn` | partagé |
| `src/rig.js` | maillages à os : personnages, chat, mouette, crabe, bateaux, lanternes, coffre… | **Astra** |
| `src/anim.js` | poses procédurales `poseHuman/poseCat/poseCrab` | **Astra** |
| `src/shaders.js` | GLSL éclairage, matériaux, ciel, eau, post-traitement | Astra pour l'aspect, Claude pour la structure/uniforms |
| `src/world.js` | carte de hauteur, praticabilité, collisions | **Claude** |
| `src/audio.js` | sons synthétisés | Claude |
| `src/game.js` | état, PNJ, quêtes, dialogues, sauvegarde, caméra, entrées, mini-carte, `update()` | **Claude** |
| `src/render.js` | ombres, cibles HDR/MSAA, reflets, SSAO, eau, bloom, qualité, `render()` | Claude |

Astra peut bien sûr proposer des changements dans les fichiers de Claude et inversement : on le dit dans le message de commit et on ne réécrit pas un fichier de l'autre en entier.

## Contrats entre design et gameplay

### 1. Rendre un lieu praticable (island.js → world.js)
La marche utilise une carte de hauteur rendue par le GPU (vue de dessus, le feuillage vert est ignoré). Pour qu'un endroit soit accessible, il suffit de respecter ces règles :
- **Escaliers** : toujours via `stairs(points, width, wood, rail)`. Les segments sont tamponnés « en absolu » dans la carte (toujours praticables, même sous un rocher). Pente max ≈ 1:1. Deux escaliers qui se croisent en lacet doivent être écartés d'au moins 0,9 m.
- **Terrasses pavées** : ajouter `{x,y,z,r}` au tableau `platforms` (rendu automatique d'un tambour de pierre + tampon dans la carte). Un escalier doit *arriver à la hauteur* de la terrasse (y identique).
- **Maisons et tours** : `house(...)` et `tower(...)` s'enregistrent seuls dans `terraces` (emprise interdite : on ne marche jamais sur un toit, ni à travers un mur). Ne pas faire passer un escalier à moins de 0,35 m d'un mur.
- **Sol naturel** : praticable si la pente est douce (≤ 0,42 m entre deux cellules de 0,08 m). Plages, plateaux, crêtes arrondies : oui. Falaises : non, c'est voulu.
- Une cellule sous le niveau 0,22 m est de l'eau.
- Vérification dans Chrome : `__AZURA__.reachAt(x,z)` renvoie 1 si le point est atteignable depuis la plage de départ ; touche `H` affiche la carte (vert = atteignable).

### 2. Coordonnées
Y vers le haut, la mer à y = 0. Azura tient dans x ∈ [−14, 14], z ∈ [−12, 17] (plage vers +z, sommet vers −z). L'archipel va agrandir la zone couverte (`HN`, l'étendue de la carte de hauteur et des ombres) : **c'est Claude qui change ces constantes** ; Astra indique juste où il place ses îles.

### 3. Personnages (rig.js / anim.js → game.js)
- `humanoid(options)` renvoie un maillage ; os : 0 tronc, 1 jambe G, 2 jambe D, 3 bras G, 4 bras D, 5 tête. Pivots : hanches `(±.1,.62,0)`, épaules `(±.28,1.08,0)`, cou `(0,1.16,0)`, multipliés par `scale`.
- `poseX(e,t)` remplit `e.bones` (16 matrices max) à partir de `e.x,e.y,e.z,e.heading,e.phase,e.amp,e.scale,e.look,e.pose,e.talking`.
- Pour ajouter un PNJ : Astra ajoute le maillage dans `npcMeshes` (rig.js) ; Claude ajoute la définition dans `npcDefs` et les dialogues (game.js).
- Un objet mobile = `{mesh, bones, n, mode}` poussé dans `drawList` depuis `update()` (game.js). Modes : 4 éclairé, 5 anneau, 7 émissif (lanternes, lucioles), 8 feu d'artifice, 3 tissu, 2 fumée.

### 4. Matériaux (shaders.js)
Les matériaux sont déduits de la couleur du sommet (teinte/saturation/valeur) : sable, roche, crépi, tuile, bois, vitre, feuillage. Si Astra crée une nouvelle matière (ardoise, corail, métal…), il ajoute une couleur à `palette` (core.js) **et** une branche dans `fragment` (shaders.js), et le signale.

## Workflow
1. `git checkout -b astra/ile-du-phare` (ou `claude/voyage-en-bateau`), depuis `main` à jour.
2. Éditer `src/`, puis `python3 build.py --check` (assemble + vérifie la syntaxe). Le build copie aussi le fichier dans `~/Downloads/Azura-3D.html` pour que Léo puisse jouer.
3. Tester dans Chrome : ouvrir `dist/Azura-3D.html`. Aides console : `__AZURA__.teleport(x,z)`, `.talk('tomas')`, `.setClock(secondes)`, `.step()`, `.reachAt(x,z)`, `.Q` (qualité), touche `H` (carte de praticabilité), `M` (mini-carte).
4. Commits petits et fréquents, message en français commençant par le domaine : `design: ...`, `anim: ...`, `gameplay: ...`, `render: ...`.
5. Pour intégrer : `git checkout main && git merge --no-ff astra/...`. En cas de conflit sur un fichier de l'autre, on garde sa version et on lui laisse un mot dans `TASKS.md`.
6. Ne jamais casser `main` : on fusionne seulement si `python3 build.py --check` passe et que le jeu démarre.

## Noms réservés (déjà utilisés, ne pas redéclarer)
`canvas gl seed rnd range PI TAU sub add mul dot cross norm matmul lookAt perspective ortho color palette tint verts triangles tri quad transform box ellipsoid cylinder beam rock patch local roof windowAt archDoor balcony houseLots chimneys terraces stairDefs house tower stairs pier boat pot barrel shrub palm tree plantPatches grass tiers platforms solidVertexCount sceneData oceanData cloudData $ clamp mix withBone rig C humanoid catRig gullRig crabRig meshDyn heroMesh npcMeshes gullMesh crabMesh mooredBoat sailBoat shellMesh noteMesh flagMesh smokeMesh ringMesh lanternMesh lanternGlow fireflyMesh burstMeshes chestMesh crossMesh I4 T SC RX RY RZ mm piv setBone shader program mesh solid ocean clouds locations depthLoc skyLoc waterLoc ssaoLoc blurLoc compLoc brightLoc gaussLoc finalLoc U HN HS SEA STEP H reach blocked cellIndex cellH heightAt snap canStep tryMove floodFrom reachCount SPAWN audio sfx tone game player npcs cat anae crabs lanterns fireflies places gulls boats update render resize drawScene fsQuad Q RT W H2 HDR EXPO`

# Île de l'Arche — passe 8a

Base `599c892`. Références `refs/REFS.md` et les trois images consultées. Cette livraison construit seulement le relief et les accès de l'Arche. Bâtiments Tudor, végétation et bateaux restent pour 8b. Aucun fichier existant modifié.

## Géométrie

- Deux piliers de grès reliés par une véritable voûte : ouverture de 12 m au niveau marin, intrados central y=9, extrados y=13, clé de 4 m. Pas de sol ni de volume plein sous l'ouverture.
- Parois à larges strates, extrémités resserrées, deux rives distinctes et socles de garde. Toutes les faces de l'intrados sont orientées vers le chenal.
- Montée de pierre le long du pilier ouest, quatre repos, sommet circulaire déclaré dans `platforms` ; tous les socles sont également matérialisés (l'ajout au tableau seul ne les rend pas après island.js).
- Pont suspendu provisoire de 22 m, largeur 1,4 m, de (21,4.8,29) à (43,4.8,29), milieu y=4. Il utilise `stairs(bridge,1.4,true,true)` comme demandé. Le helper historique conserve ses supports en pierre : remplacer cet appel par `ropeBridge(bridge,1.4)` en 8b pour le dessin final, sans déclarer deux fois la marche.
- Ponton nord-ouest et montée jusqu'au socle gauche ; descente du socle droit vers la rive nord. Pente maximale des segments : 0,960.

## Registre à intégrer par Claude

Le ponton est déjà construit, donc `build:false`. Proposition :

```js
{id:'arche',name:"L'Île de l'Arche",center:[32,36],r:14,
 spawn:[20.5,26],landing:[20.5,26],
 dock:{x:19.8,y:.6,z:24.4,heading:Math.atan2(-.7,-1.6),len:2.5,width:1.6,build:false}}
```

Axe physique du ponton : de (19.3,.6,23.2) à (20.5,.6,26), largeur 1,6 m. Son plancher est à y=.6. L'orientation indiquée va vers le large et Azura. Ajuster seulement la position du voilier si les conventions du registre l'exigent.

Points de contrôle :

| Lieu | X | Y | Z |
|---|---:|---:|---:|
| Débarquement | 20.5 | .6 | 26 |
| Base gauche / pont | 21 | 4.8 | 29 |
| Base droite / pont | 43 | 4.8 | 29 |
| Milieu du pont | 32 | 4 | 29 |
| Repos 1 | 19.15 | 6.7 | 31.6 |
| Repos 2 | 19.15 | 9 | 35 |
| Repos 3 | 20.4 | 11.1 | 38.5 |
| Arrivée haute | 24 | 13 | 39 |
| Centre plateforme | 32 | 13 | 36.5 |
| Rive droite basse | 43 | 1 | 25.6 |

Réserves indicatives pour 8b : dépendance (25.5,13,38.5), manoir (33,13,38), terrasse avant (32,13,33.4). Les emprises de bâtiments ne sont pas encore déclarées. Ne pas réserver tout le socle bas aux bâtiments : il devra conserver l'accès au pont et aux escaliers.

## Chenal : branchement indispensable côté Claude

Bande centrale sûre pour le voilier : x=[29,35], z=[30.5,43]. La géométrie y est vide sous 7,79 m ; le dégagement central atteint 9 m. Le pont est situé plus au nord, z=29 : ses supports provisoires descendent à environ 3,49 m, à prendre en compte pour la hauteur du bateau.

La carte de hauteur monocouche voit le sommet de l'arche, pas l'eau située dessous. Le fichier n'écrit donc pas de faux rectangle `terraces`/`blocked` sous la voûte : il bloquerait aussi la terrasse supérieure. Claude doit distinguer la navigation sous la voûte de la marche sur le sommet dans son traitement prévu du chenal. Aucun changement de world.js, game.js, render.js ou archipel.js dans le ZIP.

## Vérifications

- `python3 build.py --check` : assemblage et syntaxe OK.
- Exécution CPU des primitives : 19 164 triangles statiques, sommets finis, seed extérieure restaurée.
- Bornes constatées : x=[18.347,45.601], z=[22.878,42.621], y=[-1.5,13.823] ; enveloppe demandée respectée.
- Tous les segments déclarés ont une pente <=1 ; cinq groupes de marche et sept plateformes.
- 1 225 sondes verticales dans la bande navigable : aucune géométrie sous 3 m, dégagement minimal mesuré 7,794 m.
- 399 sondes du plateau trouvent la surface à y=13.
- Inspection d'une projection CPU du maillage pour la composition et les raccordements. Ce n'est pas une capture du jeu.

Le navigateur de préparation ne permet pas la validation WebGL2. Aucun FPS ou flood-fill GPU revendiqué. À tester dans Chrome après ajout au registre : débarquement, pont entier, montée ouest, sommet, descente droite, chenal et interaction avec les îles existantes. Commit d'intégration après cette validation, conformément au circuit des livraisons précédentes.

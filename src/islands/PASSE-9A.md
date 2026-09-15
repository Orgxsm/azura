# Île aux Cabanes — passe 9a

Base `00a9a68`. Nouveau fichier `src/islands/cabanes.js`, sans changement des fichiers existants. Références : `refs/cabanes.jpg`, `refs/REFS.md`, contrat de `ropeBridge` et règle Annex B de `COLLAB.md`.

## Livré

- Piton de granit gris chaud, sommet plat à 12 m, anneaux rocheux irréguliers et épaulements chanfreinés.
- Trois arbres géants sans canopée, diamètre 1,5 m au niveau des plateformes, racines, trois socles rocheux indépendants. Troncs déclarés en emprises rondes bloquantes (`terraces`, largeur 1,8 m + marge habituelle).
- Trois plateformes de bois en encorbellement à 8, 10 et 12 m : rayon géométrique 2,4 m, trou central de 0,91 m, rayon déclaré 2,35 m, consoles sous le plancher et garde-corps avec ouvertures aux arrivées.
- Deux montées en escaliers de planches, quatre repos, trois ponts hauts entre les plateformes et vers le sommet. Les échelles strictement verticales sont remplacées par des volées inclinées praticables, conformément au brief.
- Trois îlots bas de sable autour du lagon, plage sud et deux ponts de transit bas. Le bassin central reste sous l'eau ; son fond est à −1,15 m. L'eau existante assure la surface à y=0, sans nouveau shader.
- Ponton nord-est, abri ouvert avec toiture et trois pirogues statiques sans mât.
- Pas de cabanes habitables, feuillage ou props de village : réservés à 9b.

## Registre proposé, à intégrer côté Claude

```js
{id:'cabanes',name:"L'Île aux Cabanes",center:[-32,38],r:14,
 spawn:[-23,34],landing:[-23,34],
 dock:{x:-20.2,y:.65,z:30,heading:Math.atan2(3.5,-5),len:2.5,width:1.8,
       build:false,via:[[-17,27]]}}
```

Le ponton est déjà construit : **build:false**. Son axe va de (-19.5,.65,29) au large à (-23,.65,34) sur la rive. Le point de débarquement est à 5 cm au-dessus du sable (.60 m). L'approche proposée part au nord-est ; vérifier le trajet complet du voilier depuis Azura avant fusion. Aucun ajout de registre ou de quête dans cette livraison.

L'abri occupe la partie centrale du ponton ; hauteur sous l'égout 2,9 m, plancher .65 m. Ses quatre poteaux sont déclarés en emprises rondes hors du passage central. Le voilier doit rester amarré près de l'extrémité nord, pas sous la toiture. Les pirogues sont en (-19.8,33), (-19.5,35.5), (-21,38.8).

## Points de contrôle

| Lieu | X | Y de référence | Z |
|---|---:|---:|---:|
| Débarquement | -23 | .65 | 34 |
| Départ montée est | -24 | .60 | 34 |
| Repos est 1 | -23.8 | 3.2 | 30.4 |
| Repos est 2 | -26 | 6.1 | 27.5 |
| Arrivée est, plateforme B | -30.2 | 10 | 27.3 |
| B, pont vers A | -33.6 | 10 | 28.8 |
| A, pont vers B | -38.4 | 8 | 31.2 |
| A, arrivée montée ouest | -40.8 | 8 | 33.3 |
| Repos ouest 2 | -43 | 5.6 | 34.5 |
| Repos ouest 1 | -43 | 3.1 | 38 |
| Départ montée ouest | -41 | .60 | 41 |
| B, pont vers C | -30.5 | 10 | 29.3 |
| C, arrivée du pont | -28.7 | 12 | 33.4 |
| C, accès au sommet | -30.3 | 12 | 35 |
| Sommet rocheux | -35 | 12 | 35 |
| Plage sud | -32 | .60 | 48.7 |
| Transit est, départ | -25 | .60 | 40.5 |
| Transit est, arrivée sud | -29 | .60 | 47.5 |
| Transit ouest, départ sud | -35 | .60 | 48.3 |
| Transit ouest, arrivée | -40 | .60 | 44 |
| Centre du lagon (eau) | -32 | 0 | 43 |

Pour les plateformes perchées, contrôler les points d'accès ci-dessus, **pas le centre occupé par le tronc**.

| Arbre | Centre X,Z | Sol du socle | Plateforme | Haut du tronc nu |
|---|---|---:|---:|---:|
| A, ouest | -40,32 | 1.6 | 8 | 13.5 |
| B, nord | -32,28.5 | 1.8 | 10 | 15.5 |
| C, est | -28.5,35 | 2 | 12 | 17 |

Les canopées et les cabanes devront préserver ces ouvertures et les couloirs circulaires autour des troncs. Il n'y a pas deux étages marchables à la même projection X/Z, ce qui évite le conflit d'une carte de hauteur monocouche.

## Contrats et vérifications

- **23 676 triangles** pour cette passe, sous le plafond de 120 000.
- Bornes : x=[−44.644,−18.759], z=[26.045,51.301], y=[−1.4,17], dans l'enveloppe demandée.
- Pente maximale de toutes les polylignes de marche : **0,958**, inférieure à 1:1.
- `ropeBridge` corrigé utilisé directement. Flèche .018 sur les ponts de transit pour ne pas plonger le plancher sous SEA=.22 ; liaison au sommet sans flèche. Chaque pont déclare sa marche une seule fois.
- 2 325 sondes de parcours, centre et bords, hors des emprises des troncs et poteaux.
- 525 sondes du bassin intérieur sous .22 m, donc aucune dalle terrestre ne bouche le lagon.
- Helpers préfixés `cabanes` et recherche d'homonymes dans **tous** les fichiers JS de `src/` : aucun. Seed extérieure restaurée dans `finally`.
- `python3 build.py --check` et `git diff --check` : OK.
- Projection CPU de la géométrie inspectée : raccords et structure des plateformes contrôlés.
- Simulation CPU de la carte de hauteur à pas .08 m, suivie du véritable tamponnage et flood-fill de `world.js` : **37 807 cellules atteignables** depuis le débarquement, points de contrôle testés et **420 sondes centrales des parcours** atteints.

Cette simulation CPU ne reproduit pas la quantification, les erreurs de profondeur ou le rendu WebGL. Ce n'est donc pas une mesure de connectivité GPU ni de performance. Aucun FPS revendiqué. Validation Chrome à faire après ajout au registre : voyage, abri/ponton, tour complet du lagon, deux montées, contournement des trois troncs, ponts hauts et sommet. Livraison non commitée pour intégration après cette validation, selon le circuit ZIP convenu.

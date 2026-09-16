# Village de la Gorge — passe 10b

Base : `fb6e1ac`. Remplacer `src/islands/gorge.js`. Aucun changement de `world.js`, `game.js`, `farm.js`, `rig.js`, `util.js`, du registre ou des shaders. La roue est fournie, son insertion dans `drawList` et sa rotation restent à brancher par Claude. Aucune eau animée ajoutée.

## Habillage livré

Huit maisons Tudor : crépi crème, colombages bruns, volumes chanfreinés, couvertures terre cuite à 42° légèrement bombées, lucarnes sur le versant est des toits, fenêtres à petits carreaux, cheminées octogonales à bonnet, balcons vert d'eau, jardinières. Moulin compact à colombages au pied est. Quatre chênes ronds, trois palmiers, dix touffes de lavande, sept tonneaux et neuf lanternes. Les blocs de pierre sèche supplémentaires couvrent les faces externes des versants ; les murs frontaux de 10a sont conservés.

## Emprises nouvelles

Coordonnées x, y, z. Toutes les emprises sont rectangulaires, rotation 0 ; marge de collision de 0,30 m ajoutée par le moteur. Les balcons restent du côté externe des parcours.

| Bâtiment | Centre | Largeur × profondeur |
|---|---|---|
| Bas ouest 1 | −7,5 ; 3 ; 35,9 | 2,6 × 2 |
| Bas est 1 | 7,5 ; 3 ; 35,9 | 2,6 × 2 |
| Bas ouest 2 | −10 ; 3 ; 39,8 | 2,5 × 1,8 |
| Bas est 2 | 10 ; 3 ; 39,8 | 2,5 × 1,8 |
| Milieu ouest | −8 ; 6 ; 42,8 | 2,8 × 2 |
| Milieu est | 8 ; 6 ; 42,8 | 2,8 × 2 |
| Haut ouest | −8 ; 9 ; 49,7 | 2,8 × 2 |
| Haut est | 8 ; 9 ; 49,7 | 2,8 × 2 |
| Moulin | 2,7 ; 0,65 ; 29,75 | 2,1 × 2,2 |

Le moulin est décalé vers le nord-ouest de la réserve et reçoit une petite extension de fondation affleurante. Le placer au centre exact du socle aurait bloqué la diagonale débarquement → départ est. Le socle 10a, sa plateforme et son centre de contrôle (3,3 ; 0,65 ; 31,5) sont conservés et restent accessibles. Porte du moulin vers +Z ; approche conseillée (2,7 ; 0,65 ; 31,35).

Les liaisons transversales de z=38,45,52 et les promenades à x=±3,7 sont dégagées. Approches de portes des maisons : x=±7,5 à z=34,45 ; x=±10 à z=38,45 ; x=±8 à z=41,35 et 48,25 (hauteurs 3,3,6,9).

## Roue dynamique — contrat d'intégration

`waterwheelMesh` est une variable disponible dans l'IIFE, créée dans `gorge.js` via les fonctions hoistées `rig` et `meshDyn`. Ce nom public est l'exception intentionnelle au préfixe `gorge`, conformément à la demande. Tous les helpers de l'île sont préfixés.

- Géométrie locale centrée en (0,0,0), axe de rotation **X**.
- Un seul os : **0**, affecté à tous les sommets.
- Centre monde proposé : **(1,27 ; 1,30 ; 29,75)**, côté ouest du moulin.
- Diamètre nominal 3 m (coins des aubes à environ 1,508 m de rayon), douze aubes, deux couronnes et rayons, moyeu axial. Largeur des aubes 0,60 m ; axe de −0,40 à +0,40 m.
- 952 triangles dynamiques, `waterwheelMesh.count = 2856` sommets.
- Le maillage n'est pas ajouté au relief statique ni à la carte de hauteur. Le tampon `verts` et le compteur statique `triangles` sont restaurés après sa création.

Exemple à placer côté animation/rendu (non ajouté à cette livraison) :

```js
// Une allocation persistante, hors update.
const gorgeWheelBones = new Float32Array(16);
// Dans update, angle en radians ; choisir vitesse et signe côté gameplay.
setBone(gorgeWheelBones, 0, mm(T(1.27, 1.30, 29.75), RX(angle)));
drawList.push({mesh:waterwheelMesh, bones:gorgeWheelBones, n:1, mode:4});
```

Aucune rotation, inscription automatique à drawList ou roue statique en doublon. Tant que ce branchement n'est pas fait, la roue ne sera pas visible en jeu.

## Canal / rivière

Lit de la rivière et canal 10a conservés intégralement. Le canal est prolongé à fond y=1,10 depuis (2,15 ; 32,8) vers (2,15 ; 31,45), puis (1,27 ; 31,45), puis (1,27 ; 31,10), largeur intérieure 0,44 m. Il arrive devant les aubes de la roue décalée. Eau suggérée à 1,20–1,23 sur ce complément, puis évacuation vers la mer à y=0. Pas de surface d'eau ni de collision d'eau introduite ici. Le profil du lit de PASSE-10A.md reste valable.

## Mesures et vérifications

| Élément | Triangles |
|---|---:|
| Géométrie statique de la Gorge | 42 434 |
| Roue dynamique | 952 |
| Île + roue | 43 386 / 120 000 |
| Six maisons hautes, lucarne et balcon compris | 924 chacune / 1 200 |
| Deux maisons basses, lucarne et balcon compris | 704 chacune / 1 200 |
| Moulin | 530 / 1 200 |
| Chêne | 220 chacun / 250 |
| Palmier | 56 chacun / 250 |

Les lanternes, tonneaux et fondations sont comptés dans l'île, séparément des bâtiments.

- Compilation `python3 build.py --check` et `git diff --check` réussies.
- Comparaison avec la base : géométrie 10a conservée sommet par sommet et dans le même ordre ; `stairDefs`, `platforms`, emprises antérieures et graine globale identiques. Le relief est complété, aucun sommet ancien n'est déplacé.
- Aucun homonyme de helper dans les autres fichiers JavaScript de `src`.
- Maillage de roue fini, stride 10, tous les indices d'os égaux à 0.
- Carte de hauteur approximée en CPU avec traitement séparé du feuillage, puis tamponnage et flood-fill du vrai `world.js` : **19/19 points 10a**, **472 échantillons centraux de parcours** et **8 approches de portes** atteints. 2 676 sondes dans les bandes d'accès sans intersection d'emprise nouvelle.
- 92 sondes du lit conformes au profil de fond ; axe du canal 10a dégagé.
- Aperçu géométrique CPU inspecté avec la roue placée au centre proposé. Ce n'est pas une capture du moteur. Validation Chrome, voyage et ms/image restent à faire après intégration, ainsi que l'animation et l'eau côté Claude.

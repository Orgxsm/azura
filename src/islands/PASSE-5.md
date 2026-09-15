# Île du Phare — passe 5

Base exacte : `9021617`. ZIP : `src/islands/phare.js` et ce document uniquement. Aucun changement de `island.js`, `world.js`, `game.js`, `farm.js`, `render.js`, `shaders.js` ou `archipel.js`.

## Changements

- Les trois maisons : portes **1 × 1,9 m**, centres horizontaux conservés ; seuil de 8 cm, petite fenêtre avant à croisillons, jardinière et auvent en bois. Les fenêtres latérales, volets, pompons et nichoirs sont conservés. Géométrie entière : 894 / 894 / 840 triangles selon la maison, détails compris.
- Porte du phare réduite de 15 % : **1,02 × 1,785 m**. Porte et vitres légèrement sorties du fût pour éviter les triangles de crépi qui recouvraient leur couleur sur les captures.
- Toitures : trois rangées, décalage d'une demi-écaille, extrémités arrondies, couleur terre cuite uniforme, normales adoucies. Faîtage réellement courbe, flèche 10 cm ; rives de rayon 12 cm. L'enveloppe est resserrée pour compenser l'épaississement et conserver le dégagement des paliers. Les murs restent trapus.
- Vires sculptées limitées à **l'ouest et au nord**, avec fondu sur 3 m en coordonnées monde. La sculpture est nulle derrière la maison basse et sur le front du trajet ; il n'y a plus de masque radial de vires à cet endroit. Le reste du relief et les strates rapportées sont conservés. L'effet sur les stries reste à vérifier dans le cadrage de montée.
- Rochers : **7 variantes sur 10** deviennent des galets lissés, inscrits dans l'enveloppe des anciens blocs. Les dalles très plates restent calcaires pour conserver la lecture des strates. Ce ratio concerne la sélection des variantes hors dalles, pas un comptage de surface visible dans chaque cadrage.
- Panneau peint **« LE PHARE »** et cinq fanions sur un petit portique à `(32.7, −8.4)`. La guirlande accompagne le panneau, à côté du passage ; elle ne traverse pas le chemin, pour ne pas créer d'obstacle aérien dans la carte de hauteur.
- Table de café, deux tasses et pain à `(40.25, −9.25)`, sur le sable au pied de la maison basse, séparée de la barque.
- Ruche en paille à `(36, −26.8)`, près du belvédère. Décor uniquement, aucune interaction ajoutée.

## Contrats et contrôles effectués

`python3 build.py --check` et `git diff --check` : OK.

Comparaison CPU à la base : tableaux `platforms`, `terraces`, `houseLots`, `chimneys`, `stairDefs` strictement identiques ; graine globale restaurée. Coordonnées X/Z du relief, classification sol/feuillage et continuité des couleurs conservées. Aucun appel de dessin supplémentaire.

**1 763 sondes de sol comparables : différence maximale 0 m.** Le contrôle des escaliers compare les surfaces sous une garde de 1,85 m ; les échantillons radiaux déjà bloqués ou surélevés dans la base sont exclus (43). Il ne reproduit pas la rasterisation GPU ni le flood fill. Les trois nouveaux groupes décoratifs passent les contrôles de dégagement des chemins et des interactions. Leurs boîtes ne recoupent ni la barque, ni le casier, ni le banc, ni les murets. Quelques herbes basses bordent le pied de la table.

| Mesure géométrique CPU | Valeur |
|---|---:|
| Île, base | 82 776 triangles |
| Île, passe 5 | 83 126 triangles |
| Différence | **+350 triangles** |
| Buffer de sommets supplémentaire | ≈ 0,036 Mio |
| Arbre / cyprès | 220 / 152 triangles |
| Arbres / cyprès retenus | 12 / 2 |

Le nombre de cellules atteignables et les temps par image ne sont pas mesurés ici. Aucun résultat de test visuel n'est revendiqué : WebGL 2 reste indisponible dans le navigateur de préparation.

## À vérifier dans Chrome avant fusion

Reprendre les cinq cadrages habituels, même heure et même qualité :

1. Lisibilité de la fenêtre avant et de l'auvent ; accès aux portes et au gardien.
2. Rangées d'écailles et courbure du faîtage depuis le sommet ; absence de clipping du crépi sur les ouvertures du phare.
3. Disparition des stries derrière la maison basse, aspect des galets depuis l'arrivée.
4. Panneau/fanions, table et ruche : insertion dans le paysage, accès au bateau et au coin de pêche.
5. Parcours complet, `reachAt`, cellules atteignables et ms/image.

Les HTML sont à reconstruire avec `python3 build.py --check`. Aucun branchement gameplay supplémentaire à faire. Cette livraison reste limitée au Phare ; Azura et les Champs attendent sa validation.

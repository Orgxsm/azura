# Phare — passe 4 cosy

Base exacte : `1c0d3e6`. Livraison pour intégration par Claude après test Chrome.

## Périmètre

La base contient **trois maisons**, aux centres `(40,−12.8)`, `(29.7,−16)` et `(39.8,−20.5)`, plus le phare : quatre bâtiments au total. Tous sont repris. Aucune quatrième maison ajoutée : elle aurait nécessité une nouvelle emprise.

Seul `src/islands/phare.js` change le jeu. `house()` et `tower()` dans `island.js` restent inchangés, de même que `world.js`, `game.js`, `farm.js`, `render.js`, `shaders.js` et `archipel.js`. Ce document accompagne le fichier.

## Modélisation

- Maisons trapues crème, rosée et vert d'eau ; coins chanfreinés et bourrelets haut/bas. Murs reculés de 15 cm par rapport aux emprises historiques, largeur au moins égale à leur hauteur.
- Toits généreux : débord de 41 cm depuis le crépi, pente voisine de 33°, profil bombé, deux rangées de grandes écailles à extrémités arrondies, rives épaisses et faîtage rond.
- Portes de 1,2 × 2,1 m, contour arrondi et retours de cadre de 25 cm ; fenêtres latérales à croisillons, volets sauge/pervenche/corail, jardinières et pompons. Nichoir au dos. Les anciens accessoires de façade sont remplacés, pas superposés.
- Cheminées rondes à bonnet, raccordées aux positions de fumée existantes.
- Phare tronconique légèrement bombé, bandes crème/corail, galerie à 16 balustres dodus, montants miel, chapeau bombé et bouton sommital. Galerie à 18,7 m et foyer dynamique `(34,19.45,−25.3)` conservés ; aucun branchement de lanterne à changer.
- 12 arbres retenus : tronc raccourci/épaissi et trois boules à sommet aplati, une couleur par boule ; deux cyprès en quenouilles. Normales analytiques sur ces volumes.
- Raccord des vires élargi de 0,58 à 1 m pour atténuer les stries. À examiner depuis le cadrage de montée : le résultat visuel n'a pas été validé ici.

## Contrats et coût

Les constructeurs cosy sont locaux au bloc du Phare. Pour conserver exactement le flux aléatoire, les cheminées et les inscriptions des maisons, le constructeur historique est exécuté puis sa géométrie temporaire immédiatement remplacée. Rien n'est dessiné deux fois ; cette opération ne concerne que la construction initiale.

Comparaison CPU à la base : `platforms`, `terraces`, `houseLots`, `chimneys`, `stairDefs` et graine globale strictement identiques. Les coordonnées horizontales du relief restent identiques. Le filtrage de dégagement des décors reste actif.

| Géométrie | Triangles |
|---|---:|
| Maison basse, détails et cheminée compris | 883 |
| Maison ouest, détails et cheminée compris | 883 |
| Maison haute, détails compris | 829 |
| Arbre | 220 |
| Cyprès | 152 |
| Île du Phare complète | 82 776 |
| Base | 97 537 |
| Différence | −14 761 |

Environ 1,52 Mio de buffer de sommets en moins. Aucun nouvel appel de dessin statique. Ces chiffres ne sont pas une mesure de FPS ou de mémoire GPU totale.

## Validation et limites

`python3 build.py --check` : OK. Géométrie finie, budgets respectés, classification sol/feuillage et continuité des couleurs du relief vérifiées.

1 761 sondes géométriques CPU comparées sur les escaliers et autour des interactions. Le contrôle des escaliers distingue le passage sous les toits (garde de 1,85 m) de la surface supérieure des bâtiments. La suppression d'anciens détails/fondations peut abaisser la surface brute jusqu'à 1,046 m localement ; les déclarations d'escaliers absolus restent identiques. Les échantillons radiaux déjà bloqués ou situés sur une surface haute dans la base sont exclus (45). Ce contrôle ne reproduit ni la rasterisation de la carte GPU ni son flood fill : il ne prouve pas la praticabilité complète.

Pas de validation visuelle, de parcours en jeu ni de chronométrage GPU dans cette session (WebGL 2 indisponible). Avant fusion, reprendre les cinq cadrages et vérifier :

1. Débarquement → trois maisons → gardien, chèvres et sommet ; emprises autour des cadres et sous les débords.
2. Raccords des vires derrière la maison basse, raccords des cheminées et lecture des écailles à la caméra de jeu.
3. Palette cosy, lanternes de nuit, feuillage et visibilité du phare.
4. `reachAt`, nombre de cellules atteignables et temps par image dans les conditions habituelles.

Le ZIP contient uniquement les deux fichiers sous `src/`. Les HTML générés sont à reconstruire chez Claude. Aucun commit d'intégration ni publication effectué avant ces contrôles Chrome.

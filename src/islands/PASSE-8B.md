# Île de l'Arche — passe 8b

Base : `4602158`. ZIP : `src/islands/arche.js` et cette note. Aucun changement du registre, du rendu, du gameplay, de `util.js` ou des autres îles.

## Livré

- Pont rendu par `ropeBridge(bridge,1.4,{sag:0})`, sans l'ancien appel `stairs`. Les points fournis ont déjà leur flèche : désactiver la flèche supplémentaire conserve le profil 4,8 → 4 → 4,8 m et les appuis historiques. Une seule déclaration de marche.
- Grès : atténuation des anciennes bandes concentriques, strates horizontales saillantes, blocs chanfreinés enchâssés, éboulis et végétation de vires. Intrados et passage central conservés.
- Manoir à deux corps, crépi crème, colombages bruns, couvertures ardoise à environ 45°, gables, fenêtres à petits carreaux, portes cintrées, cheminées octogonales à bonnet et jardinières.
- Dépendance, maison de garde gauche, deux petites maisons droites et tour à toit pointu.
- Parvis pavé affleurant, trois petites marches de pierre latérales et barrières basses. Les marches latérales sont peu hautes et purement géométriques : aucun nouveau `stairDefs` ou `platforms`.
- Quatre chênes en boules, deux palmiers, sept groupes de buissons (sommet à environ +0,58 m), herbes et cinq tonneaux.
- Deux voiliers statiques en (25,.35,46.5) et (39,.35,47), hors du chenal x=[29,35], z=[30.5,43] et de l'approche du ponton NO.

## Implantation et accès

Les points de contrôle restent libres. Les réserves désignent ici les accès aux bâtiments : poser une maison exactement sur leur centre aurait bloqué les contrôles demandés.

| Élément | Centre du corps (X,Y,Z) | Motif |
|---|---|---|
| Manoir principal | (33,13,40) | Accès maintenu en (33,38), bâtiment en arrière |
| Aile du manoir | (29.7,13,40.45) | Recul pour libérer la largeur entière de l'arrivée haute |
| Dépendance | (25.5,13,36.2) | Entrée vers +Z et réserve (25.5,38.5) ; la montée traverse cette réserve |
| Garde gauche | (22.5,4.8,30.32) | Décalée de la jonction pont / montée |
| Maison droite haute | (41.5,4.8,30.32) | Au fond du socle, passage du pont libre |
| Tour droite | (44.35,4.8,30.65) | Derrière la descente historique |
| Maison droite basse | (44.7,3.2,33) | Socle complémentaire sous le bâtiment |

Les emprises des bâtiments sont ajoutées à `terraces`, sans inclure les débords des toits. Les sept plateformes 8a et tous les escaliers hors pont sont strictement conservés. Le ponton n'est pas modifié. La dépendance et l'aile ont été reculées après détection d'intersections avec les marges de marche.

## Défaut du helper partagé sur cette base

Dans `util.js` de `4602158`, les boucles `for(const s of[-1,1])` des cordes porteuses et mains courantes n'utilisent pas `s` dans `side(...)`. Elles dessinent donc les deux passages du même côté. Les poteaux d'extrémité, eux, sont corrects.

Le bloc local commenté « Correctif géométrique local du helper de 4602158 » complète seulement le côté −Z manquant sur ce pont rectiligne : corde porteuse, main courante et suspentes. Il ne touche ni au helper ni à la marche.

Quand Claude corrige le helper en utilisant `side(p,q,width*.46*s)` et `side(p,q,width*.5*s)` dans ces deux boucles, **retirer ce complément local** pour éviter un doublon. Le helper calcule déjà les suspentes à partir du second décalage ; inutile de leur ajouter un second signe.

## Budgets mesurés par exécution des primitives

| Maillage | Triangles |
|---|---:|
| Manoir complet, deux corps | 1 410 / 1 500 |
| Dépendance | 530 / 900 |
| Maison de garde | 530 / 900 |
| Chaque maison droite | 530 / 900 |
| Tour de garde | 318 / 900 |
| Chaque chêne | 220 / 250 |
| Chaque palmier | 42 / 250 |
| Île entière, relief et voiliers compris | 34 321 / 120 000 |

La passe 8a comptait 19 164 triangles : ajout net de 15 157. Les socles complémentaires sont compris dans le total de l'île, hors compte des bâtiments.

## Vérification effectuée

- `python3 build.py --check` et `git diff --check` : OK.
- Construction CPU complète : budgets, sommets finis et enveloppe x=[18.347,45.9], z=[22.878,48.810] contrôlés.
- Comparaison exacte des plateformes et des escaliers 8a hors pont : identiques.
- 2 286 sondes sur les centres et les bords des parcours : aucune dans une nouvelle emprise, marges `world.js` comprises.
- Points de contrôle libres des nouvelles emprises ; hauteurs brutes du débarquement, du centre du sommet et des trois réserves identiques à moins de 4 cm.
- 1 225 sondes dans le chenal : garde géométrique minimale 7,794 m, aucune nouvelle obstruction sous 3 m.
- 399 sondes retrouvent la surface du plateau à y=13 (y compris sous les nouveaux bâtiments).
- Seed extérieure restaurée ; Champs et Phare construits ensuite identiques octet pour octet à la base.
- Projection CPU du maillage inspectée pour les volumes et les raccords. Ce n'est pas une capture WebGL du jeu.

Validation Chrome encore nécessaire : rendu du grès et des toits, parcours complet, portes des nouveaux bâtiments, végétation de vires, deux côtés du pont, chenal et voiliers statiques. Aucun FPS ni résultat de flood-fill GPU revendiqué. Livraison ZIP non commitée pour intégration après cette validation, suivant le circuit des passes précédentes.

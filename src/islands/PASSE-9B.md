# Cabanes — passe 9b

Base : `610c136`. Remplacer uniquement `src/islands/cabanes.js` et conserver ces notes. Aucun changement de registre, de gameplay, de ferme, de shader ou de helper partagé. Pas de commit ni de déploiement dans cette livraison.

## Habillage

- Trois canopées composées de cinq boules chacune, normales lissées, une couleur constante par boule. Les trois couleurs passent le prédicat feuille (`g > r*1.25 && g > b*1.6`). Aucun bois ajouté au-dessus des couloirs de marche.
- Trois cabanes perchées : bois miel, angles chanfreinés, toit de planches bombé, porte arrondie, fenêtre à croisillons, échelle décorative de 24 barreaux. Petits socles au niveau des plateformes existantes ; capuchons arrondis sur les garde-corps, sans fermer leurs ouvertures.
- Deux cabanes sur les îlots est et sud. Cinq nouvelles emprises rectangulaires dans `terraces`, placées hors des couloirs et points de contrôle.
- Quatre palmiers, six groupes de buissons en dômes de 0,60 m de haut, huit galets de granit, lanternes, trois paniers et deux cordages enroulés.
- L'abri et les trois pirogues statiques de 9a sont conservés. Deux lanternes ajoutées à l'abri.

## Emprises ajoutées

Coordonnées sous la forme x, y, z ; dimensions largeur × profondeur. Rotation nulle. Le moteur ajoute sa marge rectangulaire habituelle de 0,30 m.

| Cabane | Centre | Emprise |
|---|---|---|
| A | −41,3 ; 8 ; 30,8 | 1,30 × 1,15 |
| B | −32 ; 10 ; 30 | 1,30 × 1,15 |
| C | −27,35 ; 12 ; 36,3 | 1,35 × 1,15 |
| Îlot est | −23 ; 0,6 ; 37,5 | 1,90 × 1,70 |
| Îlot sud | −32,7 ; 0,6 ; 50 | 1,80 × 1,10 |

## Budgets mesurés

| Élément | Triangles |
|---|---:|
| Île complète | 32 214 / 120 000 |
| Ajout 9b | 8 538 |
| Chaque cabane perchée, échelle comprise | 594 / 800 |
| Chaque cabane au sol | 386 / 800 |
| Chaque canopée | 360 |
| Arbre géant avec tronc, racines et socle rocheux | ≤ 668 / 1 500 |
| Chaque palmier | 80 / 250 |

Les socles de cabanes et lanternes sont des accessoires distincts inclus dans le total de l'île. Chaque socle compte 56 triangles. Les plateformes et ponts existants sont également compris dans le total de l'île.

## Vérifications

- `python3 build.py --check` : syntaxe OK ; `git diff --check` OK.
- Comparaison d'exécution avec le fichier à la base : tous les sommets de géométrie 9a sont identiques et dans le même ordre ; `stairDefs`, `platforms`, emprises antérieures et graine aléatoire identiques. Aucun nouvel appel `rnd()`.
- Helpers tous préfixés `cabanes` ; absence d'homonymes vérifiée contre tous les autres fichiers JavaScript de `src`, y compris `farm.js`.
- Tous les sommets finis ; enveloppe x [−44,644 ; −18,759], z [25,636 ; 51,301]. Sommet du feuillage : y = 19,78.
- 1 080 triangles de canopée vérifiés comme feuille. Géométrie solide et feuillage rasterisés séparément pour la vérification CPU.
- 2 325 sondes dans la largeur des accès : aucune intersection avec une emprise. Pente maximale des accès inchangée : 0,95771.
- Simulation CPU à pas 0,08 m, puis tamponnage et flood-fill du véritable `world.js` : les 20 points ci-dessous et 420 échantillons au centre des parcours sont atteignables depuis (−23, 34). 34 675 cellules atteignables pour Cabanes dans ce calcul isolé.
- 525 sondes dans le lagon : aucune surface solide hors d'eau. Fond central conservé à −1,15 m.
- Inspection d'un aperçu géométrique CPU réalisée. Ce n'est pas une capture du rendu du jeu. Pas de mesure GPU, de ms/image ni de test de voyage effectué ici. Validation Chrome à faire par Claude, notamment aux portes et depuis les trois plateformes.

## Les 20 points de contrôle conservés

| Point | x | y | z |
|---|---:|---:|---:|
| Débarquement | −23 | 0,65 | 34 |
| Départ est | −24 | 0,6 | 34 |
| Repos est 1 | −23,8 | 3,2 | 30,4 |
| Repos est 2 | −26 | 6,1 | 27,5 |
| B depuis escalier | −30,2 | 10 | 27,3 |
| B depuis A | −33,6 | 10 | 28,8 |
| A vers B | −38,4 | 8 | 31,2 |
| A depuis escalier | −40,8 | 8 | 33,3 |
| Repos ouest 2 | −43 | 5,6 | 34,5 |
| Repos ouest 1 | −43 | 3,1 | 38 |
| Départ ouest | −41 | 0,6 | 41 |
| B vers C | −30,5 | 10 | 29,3 |
| C depuis B | −28,7 | 12 | 33,4 |
| C vers sommet | −30,3 | 12 | 35 |
| Sommet rocheux | −35 | 12 | 35 |
| Plage sud | −32 | 0,6 | 48,7 |
| Transit est départ | −25 | 0,6 | 40,5 |
| Transit est arrivée | −29 | 0,6 | 47,5 |
| Transit ouest départ | −35 | 0,6 | 48,3 |
| Transit ouest arrivée | −40 | 0,6 | 44 |

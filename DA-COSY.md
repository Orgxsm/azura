# Direction artistique « cosy » d'Azura

Décision de Léo (15 sept. 2026) : Azura doit ressembler à un **cosy game** — Heartopia, Petit Planet, Loftia (et, plus loin, Animal Crossing New Horizons, Fae Farm). Mots-clés : **dodu, rond, chaud, jouet, miniature**. Ça remplace le ton « Mediterranean Adventure » du brief précédent là où les deux se contredisent ; la géographie (archipel, calcaire, mer turquoise) reste.

Le cosy vient d'abord de la **modélisation** (maisons, props, végétation, relief) — fichiers d'Astra — ; le rendu (fichiers de Claude) ne fait que soutenir.

## 1. Bâtiments (priorité n° 1)
- **Trapus** : largeur ≥ hauteur des murs. Rez-de-chaussée haut de 2,4 m max, un étage seulement pour les repères (phare, tour).
- **Murs épais** : 0,25 m visibles dans les embrasures ; angles des murs **arrondis** (chanfrein ou bourrelet, jamais une arête vive de `box`). Crépi crème/ivoire, jamais gris.
- **Toits surdimensionnés** : débord de 0,4 à 0,6 m, pente 30–40°, faîtage **légèrement bombé** ; tuiles rondes en écailles, rive épaisse. Cheminées courtes et rondes, chapeau en bonnet.
- **Ouvertures surdimensionnées** : porte 1,2 × 2,1 m arrondie en haut, cadre épais clair ; fenêtres carrées à croisillons, volets colorés, jardinières fleuries, petit auvent en bois ou en toile.
- Un détail vivant par façade : corde à linge, banc, lanterne, pot, échelle, panier, boîte aux lettres, panneau en bois.
- Phare : fût légèrement **tronconique et bombé**, bandes de couleur (crème / corail), galerie ronde à balustres dodus, lanterne en bonbonnière.

## 2. Silhouettes et props
- Pas d'arête vive : chaque angle chanfreiné ou arrondi. Tout ce qui est fin (barrière, mât, rampe, poteau) est **1,6 × plus épais** que nature.
- Props à l'échelle **1,15 ×** pour la lisibilité (tonneau, caisse, lanterne, pots).
- Storytelling cosy : parasol, table de café, guirlande de fanions, casiers, filets, bouées, brouette, ruche, nichoir, épouvantail, tas de bois, échelle, cabane à outils.

## 3. Végétation
- Arbres : tronc court et épais, feuillage en **2–3 boules superposées** à plateau plat, une couleur par boule (clair dessus, sombre dessous). Pas de sphère unique, pas de feuilles individuelles.
- Buissons en dômes, fleurs en pompons de 3 à 5 boules, herbe en touffes rondes. Cyprès en quenouilles dodues.
- Palette verts chauds : `#8FBF6B` éclairé, `#6FA35A` base, `#4F7F45` ombre.

## 4. Rochers et relief
- Galets **arrondis** empilés en majorité (70 %) ; calcaire à pans coupés en accent (30 %) avec coins adoucis.
- Plateaux et terrasses aux bords « en coussin » (arrondis vers le bas), falaises en strates rondes, chemins de terre légèrement en creux bordés de galets, plages en croissant.
- Pas de grandes surfaces planes nues : dallage, pelouse, fleurs, galets.

## 5. Palette de matériaux (couleurs d'auteur, avant éclairage)
| Élément | Couleur |
|---|---|
| Crépi | `#F3E6D0` / `#F6DCC4` (rosé) / `#E9EEDC` (vert d'eau) |
| Tuiles | `#E8925C`, variante `#D97B57` |
| Bois | miel `#C58B4E`, sombre `#8F5F3A` |
| Volets / portes | `#5E9C8F`, `#7C8FC7`, `#D9736F` |
| Sable | `#EBDDB4` · pelouse `#8FB56A` · terre `#C9A57C` |
| Calcaire | `#D8C7A6` · galets `#BDB2A0` |
| Eau | peu profonde `#7FD8D3`, côtière `#4FB6C2`, profonde `#2E7DA6` |

Pas de gris, pas de noir : les ombres portées sont gérées par le rendu (lavande).

## 6. Ce que le rendu fait déjà (branche `claude/cosy-render`)
Ciel pastel pervenche → crème, ombres jamais noires (plancher 0,28) teintées lavande, diffus enveloppant, ambiance chaude au sol, brume claire, eau laiteuse pastel avec écume ivoire, nuages ivoire/lavande, bloom doux, noirs relevés, spéculaire mat.

## 7. Contraintes inchangées
- Contrat de praticabilité (COLLAB.md §1) : `stairs`, `platforms`, emprises ; coordonnées gameplay, PNJ, points d'interaction inchangés.
- Aucun nouvel appel de dessin ; budgets : ≤ 900 triangles par maison de base, ≤ 250 par arbre, ≤ 120 000 par île.
- Ordre de chantier : **Île du Phare** (maisons du village, phare, props du trajet ponton → phare), puis Azura, puis Champs.

# Références de concept — 3 nouvelles îles (Léo, 15 sept. 2026)

Léo veut **exactement** ces trois lieux dans Azura, dans le style cosy déjà en place (DA-COSY.md), en gardant leur architecture à colombages (Tudor : poutres brunes sur crépi crème, toits pentus en tuiles terre cuite ou ardoise, cheminées octogonales). Les images sont dans ce dossier ; les annotations des images sont partiellement illisibles, la description ci-dessous fait foi.

Emplacements proposés dans le monde actuel (x ∈ [−48, 48], z ∈ [−40, 56]) — Claude ajoute les entrées au registre `src/archipel.js` (ponton automatique, voyage, mini-carte) :

| Île | Fichier | Centre | Rayon | Ponton (vers Azura) |
|---|---|---|---|---|
| Île de l'Arche | `src/islands/arche.js` | (32, 36) | 13 | côté nord-ouest |
| Village de la Gorge | `src/islands/gorge.js` | (0, 42) | 12 (ellipse 24 × 26) | côté nord |
| Île aux Cabanes | `src/islands/cabanes.js` | (−32, 38) | 13 | côté nord-est |

Ordre de chantier proposé : **Arche → Cabanes → Gorge** (la Gorge a besoin d'une rivière et d'une chute d'eau côté rendu, Claude).

## 1. Île de l'Arche (`refs/arche.jpg`)
- Une **arche naturelle de grès** (portée ≈ 12 m, hauteur sous voûte ≈ 9 m, épaisseur de clé ≈ 4 m), deux piliers massifs qui plongent dans la mer ; on navigue dessous (chenal libre pour le voilier, hauteur ≥ 3 m).
- **Sur le dessus de l'arche** : un manoir Tudor à colombages (deux corps, toit pentu ≈ 45°, cheminée octogonale, fenêtres à petits carreaux), une dépendance plus petite à gauche, des chênes ronds, une terrasse pavée avec escalier de pierre, barrières basses.
- **Au pied gauche** : maison de garde à colombages avec escalier de pierre qui monte le long du pilier jusqu'au sommet.
- **Au pied droit** : tour de garde en pierre avec toit pointu, maisons basses, tonneaux.
- **Un pont de corde suspendu** (planches + cordes à main, portée ≈ 22 m) relie la base gauche à la base droite au-dessus de l'eau.
- Deux voiliers ancrés dans la baie, palmiers sur les rochers bas, végétation sur les parois.
- Contrat : le pont de corde et l'escalier du pilier sont déclarés en `stairs` (Claude ajoute un helper `ropeBridge(points,width)` qui déclare la marche et rend les planches, cordes et poteaux). Le sommet de l'arche est une `platforms` circulaire. L'arche elle-même = `blocked` sous la voûte pour la marche mais pas pour le bateau.

## 2. Village de la Gorge (`refs/gorge.jpg`)
- Une **gorge étroite** ouverte sur la mer au nord, une **rivière** qui descend du sud vers la mer avec un petit **moulin à eau** (roue à aubes ≈ 3 m, canal d'amenée en pierre, chute) en bas de la gorge.
- Deux versants en **terrasses** (murs de soutènement en pierre sèche, surfaces pavées) avec 8 à 10 maisons Tudor (toits en tuiles terre cuite à ≈ 42°, colombages, lucarnes, balcons peints), escaliers de pierre gauche et droite, tonneaux, lavande, chênes ronds et palmiers.
- Un **pont suspendu** en corde et planches relie les deux versants tout en haut, au-dessus de la gorge (avec 2 PNJ dessus dans l'image).
- Contrat : la rivière est un canal creusé dans le relief (largeur ≈ 3 m, y de l'eau qui descend de +6 à 0) ; Claude ajoute une eau courante et l'écume de la chute. Terrasses = `platforms` (ou terrasses rectangulaires), escaliers en `stairs`, pont = `ropeBridge`. La roue du moulin est un objet animé (Astra : maillage `waterwheelMesh`, Claude : rotation).

## 3. Île aux Cabanes (`refs/cabanes.jpg`)
- Un **piton rocheux** (granit gris, ≈ 12 m de haut) couvert de **3 à 4 arbres géants** (troncs ≈ 1,5 m de diamètre, canopée en boules) qui portent des **cabanes perchées** (plateformes en bois en encorbellement, cabanes à toit de bois, échelles verticales de 24 barreaux).
- **Ponts de corde** entre les arbres et vers le sol ; un **pont de transit** qui descend du piton vers des îlots bas de sable (2 à 3 cabanes au sol, palmiers).
- Au bord : **lagon** en anneau, plage de sable, **ponton d'amarrage** avec abri et 3 pirogues.
- Contrat : chaque plateforme perchée = `platforms` (y = hauteur de la plateforme) ; échelles et ponts = `stairs`/`ropeBridge` ; troncs = emprises `blocked` circulaires. Le lagon intérieur est de l'eau à y = 0 (le relief descend sous 0,22).

## Contraintes communes
- Style cosy (DA-COSY.md) : angles arrondis, props dodus, palette pastel, mais **colombages et toits pentus conservés** comme dans les références.
- Budgets : ≤ 120 000 triangles par île, ≤ 1 200 par maison Tudor (colombages compris), ≤ 250 par arbre, arbre géant ≤ 1 500.
- Un fichier par île dans `src/islands/`, gabarit `src/islands/README.md`, bloc `{ const seed... try/finally }`, coordonnées absolues, aucune modification des autres îles.
- Livrer d'abord le relief + `stairs`/`platforms` (praticabilité), puis les bâtiments, puis la végétation et les props, comme pour le Phare.

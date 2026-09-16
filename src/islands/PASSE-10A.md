# Village de la Gorge — passe 10a

Base exacte : `b73f090`. Livraison : nouveau `src/islands/gorge.js`, relief et accès uniquement. Le build découvre automatiquement ce fichier. Registre à brancher par Claude ; aucun fichier partagé modifié, aucune construction de 10b incluse. Référence étudiée : `refs/gorge.jpg` et description de `refs/REFS.md`.

## Registre proposé

```js
id: 'gorge', center: [0,42], r: 14,
spawn: [6,31.5], landing: [6,31.5],
dock: {x:6,y:.65,z:29,heading:Math.PI,len:2,width:1.8,
       build:false,via:[[6,25]]}
```

Le ponton réel suit x=6, z=28,15 à 31,9 ; tablier à 0,65 m. Approche nord depuis le point (6,25). Le relief commence à z=29 et le ponton s'y prolonge. Pas d'abri ni de bateau statique dans cette passe. Voyage et courbe d'approche à tester après inscription au registre.

## Relief et réserves

Deux versants indépendants, gorge centrale ouverte au nord ; pas de masse pleine sous le chenal. Six terrasses, pierre sèche à joints décalés, raccords intérieurs en escaliers de pierre. Les plateformes sont déclarées et leur sol est explicitement modélisé (pas de dépendance à un rendu automatique tardif des plateformes).

| Niveau | Centre ouest | Centre est | Hauteur | Rayon tamponné |
|---|---|---|---:|---:|
| Bas | (−8,38) | (8,38) | 3 | 2,5 |
| Milieu | (−8,45) | (8,45) | 6 | 2,5 |
| Haut | (−8,52) | (8,52) | 9 | 2,5 |

Pour les 8 à 10 maisons futures, répartir les corps dans les secteurs externes des six terrasses, idéalement x absolu 6,5 à 11,5. Conserver les liaisons transversales à z=38,45,52 et les promenades à x=±3,7. Les bandes plates principales s'étendent de z=34 à 40,9, de 41 à 47,9 et de 48 à 55, avec les rampes intérieures réservées aux accès. Les emprises des bâtiments seront déclarées en 10b.

Socle du moulin : centre (3,3 ; 0,65 ; 31,5), largeur 2,8, profondeur 3,0, plateforme circulaire r=1,25. Gabarit de bâtisse futur à garder compact (environ 2,1 × 2,2 m), roue côté ouest. Ne pas barrer la liaison du ponton vers (3,7 ; 0,65 ; 32).

Le pont haut relie (−3,7 ; 9 ; 52) à (3,7 ; 9 ; 52), largeur 1,5. `ropeBridge` déclare seul la marche ; flèche .055 × 7,4 = .407 m (minimum de la polyligne ≈ 8,595). Aucune seconde déclaration `stairs` superposée. La rive ouest est accessible depuis le ponton est en montant puis en franchissant ce pont : aucun pont bas ne barre l'embouchure.

## Contrat rivière pour Claude

Fond large de **3 m**, x∈[−1,5 ; 1,5], z∈[28 ; 55]. Les berges s'évasent jusqu'à x≈±2,15. Fonction exacte du fond :

```js
z <= 32 ? -.45 :
z <= 34 ? -.45 + (z-32)*.725 :
1 + (z-34)*5/21
```

| z | Fond y |
|---:|---:|
| 28 à 32 | −0,45 |
| 33 | 0,275 |
| 34 | 1 |
| 42 | 2,905 |
| 52 | 5,286 |
| 55 | 6 |

Eau marine existante à y=0 en aval. Proposition pour l'eau courante : environ 0,12–0,15 m au-dessus du fond en amont de z=34 ; chute visuelle dans la section z=32–34 pour rejoindre la mer. Aucune surface d'eau, écume ou animation créée ici. Avant ajout de l'eau et de son contrat de collision, le lit minéral émergé peut être considéré marchable par le moteur ; le test des accès ne repose pas sur une traversée du lit. Ne pas interdire globalement sa projection sous le pont haut, car la carte de marche conserve une seule hauteur.

Canal d'amenée minéral en berge est : polyligne [(1,5 ; 1,1 ; 34,5), (2,15 ; 1,1 ; 34,5), (2,15 ; 1,1 ; 32,8)], largeur intérieure 0,44 m, fond à 1,1. Lèvres latérales à environ 1,28. Entrée sans traverse bloquante ; eau suggérée à 1,20–1,23. Sortie vers la roue future près de (2,15 ; 1,1 ; 32,8). Encoche de la berge abaissée pour ne pas enterrer le canal. Roue et `waterwheelMesh` viendront en 10b.

## Contrôles

- `python3 build.py --check` : OK ; `git diff --check` : OK.
- 21 048 triangles pour cette île (budget 120 000).
- Enveloppe géométrique x [−13,195 ; 13,195], z [28 ; 55], y [−1 ; 10,24]. Sommets finis.
- Helpers tous préfixés `gorge`, aucun homonyme dans les autres fichiers JavaScript de `src`.
- Graine globale restaurée par `finally`, pas de décalage des cultures ou décors existants.
- Pente maximale des accès : 0,6 ; largeur 1,5 m (ponton 1,8).
- Simulation CPU du maillage à pas 0,08 m puis tamponnage et flood-fill du `world.js` de la base : 19 points ci-dessous atteints, 472 échantillons au centre des parcours atteints. 2 676 sondes sur les bandes d'accès sans conflit d'emprise.
- 92 sondes sur l'axe de la rivière conformes au profil, hors projection du pont ; axe du canal dégagé.
- Aperçu géométrique CPU inspecté. Ce n'est pas une capture du moteur. Pas de validation Chrome, de voyage ou de mesure ms/image ici. Le nombre de cellules de ce calcul isolé n'est pas comparable au total du monde intégré.

## Points de contrôle (x, y, z)

| Point | x | y | z |
|---|---:|---:|---:|
| Débarquement | 6 | 0,65 | 31,5 |
| Socle moulin | 3,3 | 0,65 | 31,5 |
| Départ est | 3,7 | 0,65 | 32 |
| Départ ouest | −3,7 | 0,65 | 32 |
| Arrivée basse ouest | −3,7 | 3 | 37 |
| Arrivée basse est | 3,7 | 3 | 37 |
| Terrasse basse ouest | −8 | 3 | 38 |
| Terrasse basse est | 8 | 3 | 38 |
| Arrivée milieu ouest | −3,7 | 6 | 44 |
| Arrivée milieu est | 3,7 | 6 | 44 |
| Terrasse milieu ouest | −8 | 6 | 45 |
| Terrasse milieu est | 8 | 6 | 45 |
| Arrivée haute ouest | −3,7 | 9 | 51 |
| Arrivée haute est | 3,7 | 9 | 51 |
| Terrasse haute ouest | −8 | 9 | 52 |
| Terrasse haute est | 8 | 9 | 52 |
| Appui ouest | −3,7 | 9 | 52 |
| Appui est | 3,7 | 9 | 52 |
| Milieu du pont | 0 | ≈8,595 | 52 |

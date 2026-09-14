# Azura — palette de rendu proposée, passe 3 du Phare

Base : `510b5d2`. Le ZIP modifie uniquement `phare.js` et ce document.
Eau, ciel, éclairage, brume et shaders restent à intégrer côté Claude.

## Intention

Fin d'après-midi méditerranéenne : calcaire chaud, végétation sauge/olive,
ombres bleutées légèrement violettes, mer turquoise. Le soleil réchauffe les
surfaces éclairées ; il ne faut pas jaunir toute l'image avec un filtre global.
Les silhouettes des autres îles doivent rester lisibles depuis le belvédère.

Les hexadécimaux suivants sont des **cibles visuelles sRGB**, à comparer après
exposition et tonemapping, pas des multiplicateurs de lumière à coller tels quels.

| Élément | Cible | Usage |
| --- | --- | --- |
| Soleil / blanc éclairé | `#FFE3B4` | Chaleur modérée, conserver les détails de stuc |
| Ciel haut | `#76B4D3` | Bleu doux, moins saturé que la mer |
| Horizon | `#C4DCDF` | Clair et légèrement turquoise |
| Brume distante | `#BCCFD8` | Désaturer progressivement les îles éloignées |
| Ombre ambiante | `#707B98` | Bleu-violet discret, jamais noir |
| Rebond du sol | `#B6A080` | Soutien chaud sous les avant-toits |
| Nuages éclairés | `#FFF0D6` | Ivoire chaud, hautes lumières conservées |
| Nuages à l'ombre | `#B4BECF` | Ombres froides et claires, éviter les masses grises |
| Eau très peu profonde | `#78CEC1` | Fond encore visible |
| Eau côtière | `#299EA8` | Turquoise assagi |
| Eau profonde | `#285D82` | Bleu profond sans bleu électrique |
| Écume | `#E9F1DD` | Ivoire froid, discontinue autour des rochers |

## Cohérence lumière / ombres

- Garder la même direction de soleil pour le ciel, l'éclairage des surfaces et
  les matrices des ombres statiques/dynamiques. Une élévation autour de 35° est
  une première cible de composition, à ajuster dans les cinq vues de référence.
- Conserver le cycle jour/nuit et le déclenchement de la lanterne par la quête.
  Ces teintes décrivent le jour et la fin d'après-midi, pas une heure forcée.
- Brume légère dans les vues rapprochées du village, plus présente entre les
  îles. Éviter de masquer les marches ou de transformer l'horizon en mur blanc.
- Garder les feuillages lisibles à l'ombre. Leur couleur de base a été assagie
  dans cette passe ; inutile d'ajouter un gain de saturation global.

## Contrat des matériaux de cette passe

Le relief utilise désormais des **couleurs partagées par sommet**, interpolées
dans les triangles. Les normales sont calculées depuis les triangles réels,
pondérées par leur aire. Elles restent lissées sur les pentes douces, passent
progressivement aux normales de face entre 40° et 50°, puis restent en normales
de face au-delà de 50°. Les blocs de calcaire gardent aussi leurs arêtes.

| Sol / végétation | Couleur d'auteur dans `phare.js` |
| --- | --- |
| Calcaire du relief | `#CBB88A` avec variation douce |
| Sable du relief | `#D6C699` |
| Pelouse du relief | `#687D43` |
| Blocs de calcaire | `#D8C7A6` avec faces nuancées |
| Feuilles principales | `#638244` |
| Feuilles éclairées | `#7A9E56` |
| Feuilles sombres | `#4E6B36` |

Les trois teintes du relief restent volontairement dans la même branche
générique du shader actuel : valeur < 0,85, saturation > 0,25, teinte > 35°,
hors du test « feuille ». Cela évite qu'une transition de couleur continue
rencontre une bascule brutale entre les traitements sable et roche.
Si la classification des matériaux évolue, privilégier un mélange continu.

Ne pas changer la classification feuillage utilisée par la carte de hauteur :
le sol peint doit rester du sol, les canopées doivent rester du feuillage.

## Contrôle Chrome attendu pour cette livraison

La passe 3 ajoute trois vires dans `surfaceY`, centrées sur les altitudes
1,65 / 5,15 / 8,55 m. Un masque préserve les couloirs de marche, les paliers,
les zones de PNJ et le débarquement ; la modification reste hors de ces zones.
Les poches de pelouse sont élargies et leur mélange conserve du vert même sur
le sable. La classification sol/feuille reste inchangée.

Trois formations supplémentaires cadrent le sud, près de (29.2, −10.6),
(30.3, −11.25), (41.1, −9.55). Une console rocheuse soutient visuellement le
premier niveau près de (39, −11.65), sous les marches et le palier.
La barque décorative est en (39, −8.45), le casier et la bouée en (38, −8.25).
Un ancien petit rocher de ce secteur est retiré pour dégager la barque.
Volets bleus, pot et treille sont fixés à la face +X de la maison basse, dans
son emprise déjà bloquée. Aucun PNJ, trigger ou bateau interactif ajouté.

Reprendre les cinq cadrages fournis, avec la même heure, qualité et résolution :
arrivée, village, montée, révélation, panorama. Examiner les transitions au pied
des falaises, les arêtes et les ombres sur la montée, les jardins et la façade
droite de la première maison. Le dallage dépasse de 8 mm au maximum ; les marches,
paliers, coordonnées de personnages et emprises des maisons n'ont pas changé.

Tester également le banc, Elio, les chèvres, le débarquement et un aller-retour
au ponton, puis reprendre les mesures de temps par image. Les contrôles CPU et
le build ne remplacent pas cette validation GPU.

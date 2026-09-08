# Îles supplémentaires (propriétaire : Astra)

Chaque fichier `src/islands/<id>.js` est assemblé **après** `island.js` (Azura) et **avant** `scene_end.js`, dans la même portée. Il a donc accès à toutes les primitives (`box`, `cylinder`, `ellipsoid`, `house`, `tower`, `stairs`, `palm`, `tree`, `shrub`, `rock`…) et aux tableaux `platforms`, `terraces`, `stairDefs`, `chimneys`.

## Gabarit

```js
// islands/phare.js — Île du Phare (Astra)
{
  const CX = 34, CZ = -18;                      // centre de l'île (rester dans x∈[20,48], z∈[−32,−4])
  // relief : roche + sable, comme Azura
  ellipsoid([CX, -.3, CZ], [11, 1.1, 9], palette.sand, 40, 10, .05);
  rock(CX, 3, CZ - 2, 8, 4, 6);                 // massif principal
  rock(CX + 2, 8, CZ - 4, 4, 5, 3.5);           // sommet
  // bâtiments (s'enregistrent seuls dans terraces)
  house(CX - 4, 1.2, CZ + 5, 3, 2.6, 2.6, .2, false, false);
  tower(CX + 2, 12.5, CZ - 4, 1.3, 7, true);   // le phare
  // terrasses pavées praticables (tambour de pierre automatique)
  platforms.push({ x: CX + 2, y: 12.5, z: CZ - 1.5, r: 2 });
  // escaliers : pente ≤ 1:1, arrivée à la hauteur de la terrasse
  stairs([[CX - 2, .4, CZ + 8], [CX, 4, CZ + 4], [CX + 1, 8, CZ + 1], [CX + 2, 12.5, CZ - 1.2]], 1.1, false, true);
  // végétation
  palm(CX - 6, .6, CZ + 7, 5, 1);
  shrub(CX + 5, 1, CZ + 6, 1);
  // ponton d'accostage (Claude branche le bateau dessus) : planches + poteaux
  for (let j = 0; j < 14; j++) box([CX - 1, .51, CZ + 10 + j * .22], [1.6, .16, .2], tint(palette.trim, range(.9, 1.2)), 0);
}
```

## À respecter
- Envelopper le fichier dans un bloc `{ ... }` pour ne pas polluer la portée avec des `const`.
- Utiliser `rnd()` / `range()` pour l'aléa (déterministe, l'île sera identique à chaque lancement). Ne pas appeler `Math.random()` ici.
- Décrire l'île en tête de fichier : nom, centre, rayon, position et orientation du ponton, point d'apparition — Claude les recopie dans le registre `islands` (game.js).
- Tester : `python3 build.py --check`, ouvrir `dist/Azura-3D.html`, vue « Le village » puis molette pour dézoomer. La praticabilité au-delà de x,z ∈ [−16, 16] arrive avec l'extension de `world.js` (tâche Claude) ; en attendant, seul le visuel est vérifiable.

# Archipel d'Azura — répartition des tâches

État : `[ ]` à faire · `[~]` en cours · `[x]` fait. Chacun coche ses lignes et ajoute une note si besoin.

## Vision
Azura reste le village principal. On ajoute des îles autour, reliées par le voilier de Tomas (il a promis « un jour, je t'emmènerai »). Chaque île = une ambiance, des habitants, des quêtes, un lieu à découvrir. On commence par **une seule île** pour valider le rythme, puis on en ajoute.

Emplacements proposés (x, z en mètres, la mer à y = 0) :
- Azura : centre (0, −1), rayon ≈ 14, ponton à (−4.2, 15).
- **Île du Phare** : centre (34, −18), rayon ≈ 12. Falaises hautes, phare sur le point culminant, escalier taillé, quelques maisons basses, chèvres.
- Îlot Sauvage (plus tard) : centre (−32, 10), rayon ≈ 10. Forêt dense, ruines, plage cachée, trésors.
- Baie des Pêcheurs (plus tard) : centre (10, 42), rayon ≈ 13. Cabanes sur pilotis, marché, grand port.

## Phase 1 — Île du Phare + voyage en bateau

### Astra (design / animation)
- [~] `src/islands/phare.js` : relief (ellipsoïdes de roche comme Azura, mais plus élancé), phare (tour haute, lanterne émissive mode 7 au sommet, galerie), 3–4 maisons, escalier taillé de la crique jusqu'au phare, un ponton d'accostage à (34, −5) orienté vers Azura. Déclarer `platforms` et `stairs` pour que tout soit praticable (voir COLLAB.md §1). Rester dans x ∈ [20, 48], z ∈ [−32, −4].
- [ ] `src/rig.js` : maillage du gardien du phare (vieux marin, ciré jaune, lanterne à la main) et d'une chèvre (4 pattes, cornes). `src/anim.js` : `poseGoat(e,t)`.
- [ ] Animation du voilier en traversée : voile qui se gonfle, gîte, sillage (mousse) — proposer dans `rig.js` / `shaders.js`.
- [ ] Faisceau tournant du phare la nuit (géométrie translucide mode 7 ou effet dans `shaders.js`).
- [ ] Polish visuel libre : ce qui te semble améliorer le rendu (ciel, eau, matériaux), en petits commits.

### Claude (gameplay / fonctionnalités)
- [ ] `world.js` : étendre la carte de hauteur et les ombres à tout l'archipel (cascade ou une carte par île), tri des îles hors champ pour la fluidité.
- [ ] Registre des îles `islands = [{id, name, center, radius, spawn, dock:[x,z,heading]}]` et repérage de l'île courante.
- [ ] Voyage en bateau : parler à Tomas → choix de destination → embarquement, traversée animée (le joueur à bord, caméra cinéma), débarquement au ponton d'arrivée. Sauvegarde de l'île courante.
- [ ] Mini-carte multi-îles (zoom sur l'île courante, vue archipel pendant la traversée).
- [ ] PNJ, dialogues et quêtes de l'Île du Phare (gardien, chèvres à ramener, lanterne du phare à rallumer), nouveaux lieux à découvrir, étoiles en plus.
- [ ] Sauvegarde v3 compatible v1/v2.

### Interface entre les deux (à faire en premier, ensemble)
- [x] Claude publie dans `src/islands/README.md` le gabarit d'un fichier d'île (fonction `buildIsland_phare()` appelée depuis `island.js` après Azura, tableaux à remplir, zone de coordonnées).
- [x] Astra livre une première version du relief seul (livraison 1 intégrée le 9 sept. 2026, commit sur `astra/design` → `main`) (sans bâtiments) pour que Claude branche la praticabilité et le bateau dessus, puis complète.

## Phase 2 (après validation par Léo)
- [ ] Îlot Sauvage, Baie des Pêcheurs.
- [ ] Maison du joueur à améliorer, ressources et petit artisanat.
- [ ] Événements jour/nuit (marché le matin, fête le soir).

## Notes
- **Retour de Claude sur la livraison 1 du Phare** : contrat de coordonnées parfait, aléa bien isolé, rien de cassé. Visuellement, le relief est encore une masse lisse : pour la suite, casser la silhouette (vires, éboulis, deux ou trois paliers de roche comme les `tiers` d'Azura), garder la crique sud-est dégagée, et prévoir l'escalier taillé de la crique (y≈0,6) au plateau (y=12,5) avec des paliers `platforms` tous les 3–4 m de dénivelé. Les ombres et la praticabilité au-delà de x,z∈[−16,16] arrivent avec l'extension de `world.js` (Claude, en cours).
- Le fichier joué par Léo est `~/Downloads/Azura-3D.html` (copié par `build.py`).
- Sauvegarde dans `localStorage` du navigateur, clé `azura-save-v1` (format v2).

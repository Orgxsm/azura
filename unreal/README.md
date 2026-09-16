# Azura dans Unreal Engine — mode d'emploi (Léo)

1. Installer l'Epic Games Launcher puis **Unreal Engine 5.4 ou 5.5** (≈ 50 Go ; vérifier l'espace disque, 70 Go libres le 16 sept.).
2. Créer un projet **Games → Third Person → Blueprint**, nom `AzuraUE`, sans Starter Content, cible Desktop, qualité Scalable.
3. Edit → Plugins : activer **Python Editor Script Plugin** (et vérifier que **Interchange glTF** est actif, il l'est par défaut). Redémarrer l'éditeur.
4. Régénérer l'export à jour : `cd /Users/jl/azura && node tools/export_gltf.js`.
5. Dans l'éditeur, Window → Output Log, passer le mode de la ligne de commande sur **Python**, coller :
   `exec(open('/Users/jl/azura/unreal/setup_azura.py').read())`
   Le script importe les 7 maillages, crée le matériau à couleurs de sommet, pose les îles, la mer, le soleil, le ciel, la brume et le point de départ.
6. Project Settings → Rendering : désactiver Lumen (Dynamic Global Illumination : None, Reflections : Screen Space) et Nanite si l'éditeur rame sur le Mac Intel.
7. Play : le personnage du template marche sur les îles (collision complexe). Envoyer à Claude les captures et l'Output Log en cas d'erreur.

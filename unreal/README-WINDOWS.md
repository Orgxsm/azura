# Azura dans Unreal Engine — sur le PC Windows

1. Installer l'Epic Games Launcher (epicgames.com) puis **Unreal Engine 5.x** (testé avec 5.7 ; Launcher → Unreal Engine → Bibliothèque → « + »), emplacement par défaut `C:\Program Files\Epic Games\UE_5.x` — la chaîne prend la version la plus récente installée.
2. Récupérer le projet : soit `git clone https://github.com/Orgxsm/azura.git`, soit télécharger le zip https://github.com/Orgxsm/azura/archive/refs/heads/main.zip et le décompresser (par exemple dans `C:\azura`). Les fichiers exportés (`export\*.glb`, `export\azura-scene.json`) sont inclus : rien à compiler.
3. Chaîne automatique (recommandé) : ouvrir PowerShell dans le dossier du dépôt et lancer
   `powershell -ExecutionPolicy Bypass -File unreal\build_vitrine.ps1`
   Elle importe les îles, met en scène, crée la séquence caméra et rend la vidéo dans `export\render\` (PNG), puis `export\azura-vitrine.mp4` si ffmpeg est dans le PATH.
4. Variante manuelle : double-cliquer `unreal\AzuraUE\AzuraUE.uproject` (accepter la conversion de version si Unreal le demande), Edit → Plugins : Python Editor Script Plugin activé, puis dans Window → Output Log (mode Python) :
   `exec(open(r'C:\azura\unreal\setup_azura.py').read())` puis `exec(open(r'C:\azura\unreal\flythrough.py').read())` puis `exec(open(r'C:\azura\unreal\render_vitrine.py').read())`, et Window → Cinematics → Movie Render Queue → Render.
5. Préversion rapide avant le rendu final : `$env:AZURA_RES="640x360"; $env:AZURA_SAMPLES="1"` puis `-Step queue` et `-Step render` (≈3 min au lieu de ≈10). Remettre `1920x1080` / `2` et relancer `queue` avant le rendu final.
6. Les logs de l'éditeur ne sortent pas sur la console : en cas d'erreur, lire `unreal\AzuraUE\Saved\Logs\AzuraUE.log` (chaque run archive le précédent en `AzuraUE-backup-*.log`).

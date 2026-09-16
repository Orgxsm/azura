#!/bin/zsh
# Azura → Unreal : chaîne complète en ligne de commande (sans ouvrir l'éditeur).
# Prérequis : Unreal Engine 5.x installé par l'Epic Games Launcher dans "/Users/Shared/Epic Games/UE_5.x".
# Usage : zsh unreal/build_vitrine.sh [setup|fly|queue|render|video|all]   (défaut : all)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UE="$(ls -d "/Users/Shared/Epic Games"/UE_5.* 2>/dev/null | sort -V | tail -1)"
[ -z "$UE" ] && { echo "Unreal Engine introuvable dans /Users/Shared/Epic Games ; installe-le depuis le Launcher (Unreal Engine → Bibliothèque → +)"; exit 1; }
VER="$(basename "$UE" | sed 's/UE_//')"
CMD="$UE/Engine/Binaries/Mac/UnrealEditor-Cmd.app/Contents/MacOS/UnrealEditor-Cmd"; [ -x "$CMD" ] || CMD="$UE/Engine/Binaries/Mac/UnrealEditor-Cmd"
PROJ="$ROOT/unreal/AzuraUE/AzuraUE.uproject"
python3 - "$PROJ" "$VER" <<'PY'
import json,sys;p,v=sys.argv[1],sys.argv[2];d=json.load(open(p));d['EngineAssociation']=v;json.dump(d,open(p,'w'),indent='\t');print('uproject ->',v)
PY
step="${1:-all}"
run_py(){ echo "== $1"; "$CMD" "$PROJ" -run=pythonscript -script="$ROOT/unreal/$1" -unattended -nosplash -log 2>&1 | grep -E "\[Azura\]|Error|error|Warning: Script" | tail -40; }
[ "$step" = all ] || [ "$step" = setup ] && { (cd "$ROOT" && node tools/export_gltf.js | tail -3); run_py setup_azura.py; }
[ "$step" = all ] || [ "$step" = fly ]   && run_py flythrough.py
[ "$step" = all ] || [ "$step" = queue ] && run_py render_vitrine.py
if [ "$step" = all ] || [ "$step" = render ]; then
  echo "== rendu Movie Render Queue"; mkdir -p "$ROOT/export/render"
  "$CMD" "$PROJ" /Game/Azura/Maps/Vitrine -game -MoviePipelineConfig=/Game/Azura/MRQ_Vitrine -windowed -ResX=1280 -ResY=720 -NoLoadingScreen -log 2>&1 | grep -E "MoviePipeline|Error" | tail -20
fi
if [ "$step" = all ] || [ "$step" = video ]; then
  FF="$(ls /Users/jl/*/brand/video/node_modules/ffmpeg-static/ffmpeg 2>/dev/null | head -1)"; [ -z "$FF" ] && FF="$(which ffmpeg)"
  [ -n "$FF" ] && "$FF" -y -framerate 30 -pattern_type glob -i "$ROOT/export/render/vitrine.*.png" -c:v libx264 -pix_fmt yuv420p -crf 18 "$ROOT/export/azura-vitrine.mp4" && echo "vidéo : export/azura-vitrine.mp4"
fi

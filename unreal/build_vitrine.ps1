# Azura -> Unreal : chaine complete en ligne de commande (Windows).
# Usage : powershell -ExecutionPolicy Bypass -File unreal\build_vitrine.ps1 [-Step all|setup|fly|queue|render|video]
param([string]$Step = "all")
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$UE = Get-ChildItem "C:\Program Files\Epic Games" -Directory -Filter "UE_5.*" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1
if (-not $UE) { Write-Host "Unreal Engine introuvable dans C:\Program Files\Epic Games : installe-le depuis le Launcher"; exit 1 }
$Ver = $UE.Name -replace "UE_", ""
$Cmd = Join-Path $UE.FullName "Engine\Binaries\Win64\UnrealEditor-Cmd.exe"
$Proj = Join-Path $Root "unreal\AzuraUE\AzuraUE.uproject"
$j = Get-Content $Proj -Raw | ConvertFrom-Json; $j.EngineAssociation = $Ver; $j | ConvertTo-Json -Depth 5 | Set-Content $Proj -Encoding UTF8
Write-Host "uproject -> $Ver"
function Run-Py($script) { Write-Host "== $script"; & $Cmd $Proj -run=pythonscript -script="$Root\unreal\$script" -unattended -nosplash -log 2>&1 | Select-String -Pattern "\[Azura\]|Error|Warning: Script" | Select-Object -Last 40 }
if ($Step -in "all","setup") { if (Get-Command node -ErrorAction SilentlyContinue) { Push-Location $Root; node tools\export_gltf.js | Select-Object -Last 3; Pop-Location }; Run-Py "setup_azura.py" }
if ($Step -in "all","fly")   { Run-Py "flythrough.py" }
if ($Step -in "all","queue") { Run-Py "render_vitrine.py" }
if ($Step -in "all","render") {
  Write-Host "== rendu Movie Render Queue"; New-Item -ItemType Directory -Force (Join-Path $Root "export\render") | Out-Null
  & $Cmd $Proj /Game/Azura/Maps/Vitrine -game -MoviePipelineConfig=/Game/Azura/MRQ_Vitrine -windowed -ResX=1280 -ResY=720 -NoLoadingScreen -log 2>&1 | Select-String -Pattern "MoviePipeline|Error" | Select-Object -Last 20
}
if ($Step -in "all","video") {
  if (Get-Command ffmpeg -ErrorAction SilentlyContinue) { ffmpeg -y -framerate 30 -i (Join-Path $Root "export\render\vitrine.%04d.png") -c:v libx264 -pix_fmt yuv420p -crf 18 (Join-Path $Root "export\azura-vitrine.mp4"); Write-Host "video : export\azura-vitrine.mp4" }
  else { Write-Host "ffmpeg absent : les PNG sont dans export\render (assemblage possible avec DaVinci Resolve ou ffmpeg)" }
}

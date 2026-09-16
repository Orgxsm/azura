"""Azura → Unreal : crée la séquence de fly-through de la vitrine (LS_AzuraVitrine) avec une CineCamera
qui passe par les 6 îles (plage d'Azura, Phare en 5 cadrages, sous la voûte de l'Arche, Cabanes, Gorge).
À exécuter APRÈS setup_azura.py :  exec(open('/Users/jl/azura/unreal/flythrough.py').read())
Rendu vidéo : Window → Cinematics → Movie Render Queue sur LS_AzuraVitrine (1920×1080, 30 i/s)."""
import json, os, math, unreal
EXPORT = '/Users/jl/azura/export'
AX = {int(k): v for k, v in json.load(open(os.path.join(EXPORT, 'unreal-axes.json'))).items()}
def conv(x, y, z):
    v = [0, 0, 0]
    for k, val in enumerate([x, y, z]):
        j, s = AX[k]; v[j] = val * 100 * s
    return unreal.Vector(*v)
def look_at(eye, target):
    d = target - eye
    yaw = math.degrees(math.atan2(d.y, d.x)); pitch = math.degrees(math.atan2(d.z, math.hypot(d.x, d.y)))
    return unreal.Rotator(0, pitch, yaw)  # roll, pitch, yaw
# (position de l'œil en mètres glTF, cible, durée en secondes jusqu'au point suivant)
SHOTS = [
 ([-4, 6, 26], [0, 2, 8], 5),       # plage d'Azura depuis la mer
 ([8, 12, 22], [0, 4, 0], 5),       # village d'Azura
 ([34, 4, 8], [34, 2, -8], 4),      # arrivée au Phare
 ([38, 8, -2], [35.5, 4.5, -12.5], 4),  # village du Phare
 ([30, 12, -12], [34.5, 8.5, -16.5], 4), # montée
 ([34, 20, -6], [34, 15, -22], 4),  # révélation du phare
 ([36, 16, -30], [34, 13, -24], 5), # panorama depuis le sommet
 ([32, 3, 50], [32, 4, 36], 5),     # approche de l'Arche par le sud
 ([32, 3, 40], [32, 5, 28], 4),     # sous la voûte
 ([-18, 12, 50], [-32, 7, 36], 6),  # Cabanes
 ([6, 8, 22], [0, 5.5, 41], 5),     # Gorge depuis le ponton
 ([-4, 12, 30], [1.3, 1.5, 30], 4), # moulin et chute
 ([0, 40, 0], [0, 0, 20], 6),       # vue d'ensemble de l'archipel
]
FPS = 30
tools = unreal.AssetToolsHelpers.get_asset_tools()
seq = tools.create_asset('LS_AzuraVitrine', '/Game/Azura', unreal.LevelSequence, unreal.LevelSequenceFactoryNew())
seq.set_display_rate(unreal.FrameRate(FPS, 1))
cam = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.CineCameraActor, unreal.Vector(0, 0, 0))
cam.set_actor_label('Azura_CameraVitrine'); cam.tags = ['azura']
cam.get_cine_camera_component().set_editor_property('current_focal_length', 28.0)
binding = seq.add_possessable(cam)
track = binding.add_track(unreal.MovieScene3DTransformTrack)
section = track.add_section()
total = int(sum(s[2] for s in SHOTS) * FPS)
section.set_range(0, total)
ch = section.get_all_channels()  # 0-2 position, 3-5 rotation, 6-8 échelle
f = 0
for eye, target, dur in SHOTS:
    e = conv(*eye); t = conv(*target); r = look_at(e, t)
    for i, val in enumerate([e.x, e.y, e.z, r.roll, r.pitch, r.yaw]):
        ch[i].add_key(unreal.FrameNumber(f), val, interpolation=unreal.MovieSceneKeyInterpolation.AUTO)
    f += int(dur * FPS)
for i in range(6, 9): ch[i].add_key(unreal.FrameNumber(0), 1.0)
cut = seq.add_track(unreal.MovieSceneCameraCutTrack)
cs = cut.add_section(); cs.set_range(0, total); cs.set_camera_binding_id(binding.get_binding_id())
seq.set_playback_end(total)
unreal.EditorAssetLibrary.save_loaded_asset(seq)
unreal.log('[Azura] séquence LS_AzuraVitrine créée : %d s' % (total // FPS))

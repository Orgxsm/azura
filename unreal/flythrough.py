"""Azura → Unreal : sequence de fly-through LS_AzuraVitrine.
Les plans sont calcules depuis les bounds REELS des iles dans la carte Vitrine
(plan large d'ouverture, un passage par ile, plan large final) : cadrage garanti.
Executer APRES setup_azura.py :  exec(open(r'<depot>/unreal/flythrough.py').read())"""
import math, unreal

FPS = 30
ILES = ['azura', 'phare', 'arche', 'cabanes', 'gorge', 'champs']

unreal.EditorLevelLibrary.load_level('/Game/Azura/Maps/Vitrine')
for a in unreal.EditorLevelLibrary.get_all_level_actors():
    if a.get_actor_label() == 'Azura_CameraVitrine':
        unreal.EditorLevelLibrary.destroy_actor(a)
if unreal.EditorAssetLibrary.does_asset_exist('/Game/Azura/LS_AzuraVitrine'):
    unreal.EditorAssetLibrary.delete_asset('/Game/Azura/LS_AzuraVitrine')

def log(*a): unreal.log('[Azura] ' + ' '.join(str(x) for x in a))

# --- bounds des iles ---
bounds = {}
for a in unreal.EditorLevelLibrary.get_all_level_actors():
    lbl = a.get_actor_label()
    if lbl.startswith('Azura_') and lbl[6:] in ILES:
        o, e = a.get_actor_bounds(False)
        bounds[lbl[6:]] = (unreal.Vector(o.x, o.y, o.z), unreal.Vector(e.x, e.y, e.z))
        log('bounds', lbl[6:], 'centre', (round(o.x), round(o.y), round(o.z)), 'demi', (round(e.x), round(e.y), round(e.z)))
manquantes = [i for i in ILES if i not in bounds]
if manquantes:
    raise RuntimeError('iles introuvables dans la carte : %s' % manquantes)

centre_g = unreal.Vector(
    sum(bounds[i][0].x for i in ILES) / len(ILES),
    sum(bounds[i][0].y for i in ILES) / len(ILES),
    sum(bounds[i][0].z for i in ILES) / len(ILES))
rayon_g = max(max(abs(bounds[i][0].x - centre_g.x) + bounds[i][1].x,
                  abs(bounds[i][0].y - centre_g.y) + bounds[i][1].y) for i in ILES)

def norm2d(v):
    d = math.hypot(v.x, v.y) or 1.0
    return unreal.Vector(v.x / d, v.y / d, 0)

# --- plans : liste de cles (oeil, cible, duree jusqu'a la cle suivante en s) ---
# chaque ile : 6 s d'orbite lente autour d'elle (30 degres) puis 2 s de transit vers la suivante
SHOTS = []
SHOTS.append((unreal.Vector(centre_g.x, centre_g.y - 2.4 * rayon_g, centre_g.z + 1.2 * rayon_g), centre_g, 3))
SHOTS.append((unreal.Vector(centre_g.x, centre_g.y - 2.0 * rayon_g, centre_g.z + 0.95 * rayon_g), centre_g, 3))  # lente poussee
for ile in ILES:
    c, e = bounds[ile]
    r = max(e.x, e.y)
    dehors = norm2d(unreal.Vector(c.x - centre_g.x, c.y - centre_g.y, 0))
    if abs(dehors.x) < 0.01 and abs(dehors.y) < 0.01:
        dehors = unreal.Vector(0, -1, 0)
    a0 = math.atan2(dehors.y, dehors.x)
    cible = unreal.Vector(c.x, c.y, c.z + 0.25 * e.z)
    for j, (ang, dur) in enumerate([(a0 - 0.26, 6), (a0 + 0.26, 2)]):  # orbite 30 degres puis transit
        oeil = unreal.Vector(c.x + math.cos(ang) * 2.3 * r, c.y + math.sin(ang) * 2.3 * r, c.z + e.z + 0.65 * r)
        SHOTS.append((oeil, cible, dur))
# final : large depuis l'est, en prenant de la hauteur
SHOTS.append((unreal.Vector(centre_g.x + 2.3 * rayon_g, centre_g.y, centre_g.z + 1.1 * rayon_g), centre_g, 4))
SHOTS.append((unreal.Vector(centre_g.x + 2.5 * rayon_g, centre_g.y, centre_g.z + 1.6 * rayon_g), centre_g, 3))

def look_at(eye, target):
    d = unreal.Vector(target.x - eye.x, target.y - eye.y, target.z - eye.z)
    yaw = math.degrees(math.atan2(d.y, d.x))
    pitch = math.degrees(math.atan2(d.z, math.hypot(d.x, d.y)))
    return pitch, yaw

tools = unreal.AssetToolsHelpers.get_asset_tools()
seq = tools.create_asset('LS_AzuraVitrine', '/Game/Azura', unreal.LevelSequence, unreal.LevelSequenceFactoryNew())
seq.set_display_rate(unreal.FrameRate(FPS, 1))
cam = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.CineCameraActor, unreal.Vector(0, 0, 0))
cam.set_actor_label('Azura_CameraVitrine'); cam.tags = ['azura']
cam.get_cine_camera_component().set_editor_property('current_focal_length', 24.0)
binding = seq.add_possessable(cam)
track = binding.add_track(unreal.MovieScene3DTransformTrack)
section = track.add_section()
total = int(sum(s[2] for s in SHOTS) * FPS)
section.set_range(0, total)
ch = section.get_all_channels()  # 0-2 position, 3-5 rotation (roll, pitch, yaw), 6-8 echelle
f = 0
yaw_prec = None
for eye, target, dur in SHOTS:
    pitch, yaw = look_at(eye, target)
    if yaw_prec is not None:  # continuite du yaw : pas de tour complet entre deux plans
        while yaw - yaw_prec > 180: yaw -= 360
        while yaw - yaw_prec < -180: yaw += 360
    yaw_prec = yaw
    for i, val in enumerate([eye.x, eye.y, eye.z, 0.0, pitch, yaw]):
        ch[i].add_key(unreal.FrameNumber(f), val, interpolation=unreal.MovieSceneKeyInterpolation.AUTO)
    f += int(dur * FPS)
for i in range(6, 9): ch[i].add_key(unreal.FrameNumber(0), 1.0)
cut = seq.add_track(unreal.MovieSceneCameraCutTrack)
cs = cut.add_section(); cs.set_range(0, total)
cs.set_camera_binding_id(unreal.MovieSceneSequenceExtensions.get_binding_id(seq, binding))
seq.set_playback_end(total)
unreal.EditorAssetLibrary.save_loaded_asset(seq)
unreal.EditorLevelLibrary.save_current_level()  # la camera doit exister dans la carte sauvegardee pour le rendu -game
log('sequence LS_AzuraVitrine creee : %d s, %d plans' % (total // FPS, len(SHOTS)))

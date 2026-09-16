"""Azura → Unreal Engine 5 : script d'installation à exécuter DANS l'éditeur Unreal (Python Editor Script Plugin).
Usage (Output Log, mode Python) :  exec(open(r'<dépôt>/unreal/setup_azura.py').read())
Il importe les .glb de export/ (une île = un Static Mesh à couleurs de sommet), crée un matériau maître
« couleur de sommet », pose les îles à leur place, ajoute mer, soleil, ciel, brume et un PlayerStart sur Azura.
Ré-exécutable : les acteurs portent le tag 'azura' et sont remplacés."""
import json, os, unreal

ROOT = os.path.abspath(os.path.join(unreal.Paths.project_dir(), '..', '..'))  # dépôt azura (le projet est dans unreal/AzuraUE)
EXPORT = os.path.join(ROOT, 'export')
DEST = '/Game/Azura/Meshes'
SCENE = json.load(open(os.path.join(EXPORT, 'azura-scene.json')))

def log(*a): unreal.log('[Azura] ' + ' '.join(str(x) for x in a))

# ---------- 1. import des .glb ----------
def import_glb(name):
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', os.path.join(EXPORT, name + '.glb'))
    task.set_editor_property('destination_path', DEST)
    task.set_editor_property('destination_name', 'SM_' + name)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    paths = [p for p in task.get_editor_property('imported_object_paths')]
    meshes = [unreal.EditorAssetLibrary.load_asset(p) for p in paths]
    meshes = [m for m in meshes if isinstance(m, unreal.StaticMesh)]
    if not meshes:
        # Interchange peut ranger le maillage dans un sous-dossier : on cherche par nom.
        for a in unreal.EditorAssetLibrary.list_assets(DEST, recursive=True):
            if a.split('/')[-1].split('.')[0].lower().startswith(('sm_' + name).lower()) or name.lower() in a.lower():
                obj = unreal.EditorAssetLibrary.load_asset(a)
                if isinstance(obj, unreal.StaticMesh): meshes.append(obj)
    log('import', name, '->', [m.get_path_name() for m in meshes])
    return meshes

# ---------- 2. matériau couleur de sommet ----------
def vertex_color_material():
    path = '/Game/Azura/M_AzuraVertexColor'
    if unreal.EditorAssetLibrary.does_asset_exist(path):
        return unreal.EditorAssetLibrary.load_asset(path)
    factory = unreal.MaterialFactoryNew()
    mat = unreal.AssetToolsHelpers.get_asset_tools().create_asset('M_AzuraVertexColor', '/Game/Azura', unreal.Material, factory)
    lib = unreal.MaterialEditingLibrary
    vc = lib.create_material_expression(mat, unreal.MaterialExpressionVertexColor, -400, 0)
    rough = lib.create_material_expression(mat, unreal.MaterialExpressionConstant, -400, 200)
    rough.set_editor_property('r', 0.85)
    lib.connect_material_property(vc, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    lib.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    lib.recompile_material(mat)
    unreal.EditorAssetLibrary.save_asset(path)
    return mat

def water_material():
    path = '/Game/Azura/M_AzuraEau'
    if unreal.EditorAssetLibrary.does_asset_exist(path):
        return unreal.EditorAssetLibrary.load_asset(path)
    mat = unreal.AssetToolsHelpers.get_asset_tools().create_asset('M_AzuraEau', '/Game/Azura', unreal.Material, unreal.MaterialFactoryNew())
    mat.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    lib = unreal.MaterialEditingLibrary
    col = lib.create_material_expression(mat, unreal.MaterialExpressionConstant3Vector, -500, 0); col.set_editor_property('constant', unreal.LinearColor(0.16, 0.55, 0.72, 1))
    op = lib.create_material_expression(mat, unreal.MaterialExpressionConstant, -500, 200); op.set_editor_property('r', 0.72)
    rough = lib.create_material_expression(mat, unreal.MaterialExpressionConstant, -500, 300); rough.set_editor_property('r', 0.08)
    lib.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    lib.connect_material_property(op, '', unreal.MaterialProperty.MP_OPACITY)
    lib.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    lib.recompile_material(mat); unreal.EditorAssetLibrary.save_asset(path)
    return mat

def prepare_mesh(mesh, mat):
    body = mesh.get_editor_property('body_setup')
    if body:
        body.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
    for i in range(mesh.get_num_sections(0)):
        mesh.set_material(i, mat)
    unreal.EditorAssetLibrary.save_loaded_asset(mesh)

# ---------- 3. acteurs ----------
def clear_previous():
    for a in unreal.EditorLevelLibrary.get_all_level_actors():
        if 'azura' in [str(t) for t in a.tags]:
            unreal.EditorLevelLibrary.destroy_actor(a)

def spawn_mesh(mesh, name):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_object(mesh, unreal.Vector(0, 0, 0))
    actor.set_actor_label(name); actor.tags = ['azura']
    actor.set_mobility(unreal.ComponentMobility.STATIC)
    return actor

def detect_mapping(actor, bounds_json):
    """Déduit comment Unreal a placé les axes glTF (x, y-haut, z) : renvoie une fonction (x,y,z) mètres -> Vector cm."""
    origin, extent = actor.get_actor_bounds(False)
    ext = [extent.x, extent.y, extent.z]
    mn = [origin.x - extent.x, origin.y - extent.y, origin.z - extent.z]
    gl_ext = [(bounds_json['max'][k] - bounds_json['min'][k]) * 50 for k in range(3)]  # demi-étendue en cm
    mapping = {}
    for k in range(3):
        j = min(range(3), key=lambda i: abs(ext[i] - gl_ext[k]))
        sign = 1 if abs(mn[j] - bounds_json['min'][k] * 100) < abs(mn[j] + bounds_json['max'][k] * 100) else -1
        mapping[k] = (j, sign)
    log('axes glTF->Unreal', mapping)
    json.dump({str(k): v for k, v in mapping.items()}, open(os.path.join(EXPORT, 'unreal-axes.json'), 'w'))
    def conv(x, y, z):
        v = [0, 0, 0]
        for k, val in enumerate([x, y, z]):
            j, s = mapping[k]; v[j] = val * 100 * s
        return unreal.Vector(*v)
    return conv

MAP = '/Game/Azura/Maps/Vitrine'
def open_or_create_level():
    if unreal.EditorAssetLibrary.does_asset_exist(MAP):
        unreal.EditorLevelLibrary.load_level(MAP)
    else:
        unreal.EditorAssetLibrary.make_directory('/Game/Azura/Maps')
        unreal.EditorLevelLibrary.new_level(MAP)

def main():
    unreal.EditorAssetLibrary.make_directory('/Game/Azura'); unreal.EditorAssetLibrary.make_directory(DEST)
    open_or_create_level()
    mat = vertex_color_material(); eau = water_material()
    clear_previous()
    conv = None
    bounds = None
    for entry in SCENE['meshes']:
        meshes = import_glb(entry['id'])
        for m in meshes:
            prepare_mesh(m, eau if entry['id'] == 'riviere' else mat)
            actor = spawn_mesh(m, 'Azura_' + entry['id'])
            if entry['id'] == 'azura' and conv is None:
                # bornes glTF d'Azura lues dans le .glb (accessor 0) pour calibrer les axes
                import struct
                b = open(os.path.join(EXPORT, 'azura.glb'), 'rb').read()
                jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl])
                bounds = j['accessors'][0]; conv = detect_mapping(actor, bounds)
    # mer : grand plan bleu translucide à y=0
    plane = unreal.EditorAssetLibrary.load_asset('/Engine/BasicShapes/Plane')
    sea = unreal.EditorLevelLibrary.spawn_actor_from_object(plane, unreal.Vector(0, 0, 0))
    sea.set_actor_label('Azura_Mer'); sea.tags = ['azura']; sea.set_actor_scale3d(unreal.Vector(300, 300, 1)); sea.static_mesh_component.set_material(0, eau)
    # lumière, ciel, brume
    sun = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.DirectionalLight, unreal.Vector(0, 0, 3000), unreal.Rotator(-42, 30, 0))
    sun.set_actor_label('Azura_Soleil'); sun.tags = ['azura']
    sun.light_component.set_intensity(8.0); sun.light_component.set_light_color(unreal.LinearColor(1.0, 0.94, 0.82))
    sky = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.SkyAtmosphere, unreal.Vector(0, 0, 0)); sky.set_actor_label('Azura_Ciel'); sky.tags = ['azura']
    skl = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.SkyLight, unreal.Vector(0, 0, 500)); skl.set_actor_label('Azura_LumiereCiel'); skl.tags = ['azura']
    skl.light_component.set_editor_property('real_time_capture', True)
    fog = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.ExponentialHeightFog, unreal.Vector(0, 0, 0)); fog.set_actor_label('Azura_Brume'); fog.tags = ['azura']
    fog.component.set_editor_property('fog_density', 0.004); fog.component.set_editor_property('fog_inscattering_luminance', unreal.LinearColor(0.78, 0.86, 0.95))
    # départ du joueur : spawn d'Azura
    if conv:
        az = next(i for i in SCENE['islands'] if i['id'] == 'azura')
        p = conv(az['spawn'][0], 1.2, az['spawn'][1])
        ps = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.PlayerStart, p); ps.set_actor_label('Azura_Depart'); ps.tags = ['azura']
    unreal.EditorLevelLibrary.save_current_level()
    log('terminé :', len(SCENE['meshes']), 'maillages, mer, soleil, ciel, brume, départ.')

main()

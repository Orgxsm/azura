"""Azura → Unreal : crée la config Movie Render Queue MRQ_Vitrine (PNG 1920×1080 30 i/s).
UE 5.7 n'expose plus de factory pour MoviePipelineQueue : on crée un MoviePipelinePrimaryConfig,
que la ligne de commande consomme avec -LevelSequence=/Game/Azura/LS_AzuraVitrine -MoviePipelineConfig=/Game/Azura/MRQ_Vitrine.
Exécuter après flythrough.py :  exec(open(r'<dépôt>/unreal/render_vitrine.py').read())"""
import os, unreal
tools = unreal.AssetToolsHelpers.get_asset_tools()
path = '/Game/Azura/MRQ_Vitrine'
if unreal.EditorAssetLibrary.does_asset_exist(path):
    cfg = unreal.EditorAssetLibrary.load_asset(path)
else:
    cfg = tools.create_asset('MRQ_Vitrine', '/Game/Azura', unreal.MoviePipelinePrimaryConfig, unreal.MoviePipelinePrimaryConfigFactory())
out = cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
RENDER = os.path.join(os.path.abspath(os.path.join(unreal.Paths.project_dir(), '..', '..')), 'export', 'render')
out.set_editor_property('output_directory', unreal.DirectoryPath(RENDER))
out.set_editor_property('file_name_format', 'vitrine.{frame_number}')
w, h = (int(v) for v in os.environ.get('AZURA_RES', '1920x1080').split('x'))
samples = int(os.environ.get('AZURA_SAMPLES', '2'))
out.set_editor_property('output_resolution', unreal.IntPoint(w, h))
out.set_editor_property('output_frame_rate', unreal.FrameRate(30, 1))
cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
aa = cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
aa.set_editor_property('spatial_sample_count', samples); aa.set_editor_property('temporal_sample_count', samples)
cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
unreal.EditorAssetLibrary.save_loaded_asset(cfg)
unreal.log('[Azura] config MRQ_Vitrine prête (PNG 1920x1080 dans export/render/)')

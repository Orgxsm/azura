"""Azura → Unreal : crée la file Movie Render Queue MRQ_Vitrine (séquence LS_AzuraVitrine, carte Vitrine, PNG 1920×1080 30 i/s).
Exécuter après flythrough.py :  exec(open('/Users/jl/azura/unreal/render_vitrine.py').read())
Le rendu lui-même se lance via build_vitrine.sh (mode -game) ou dans l'éditeur : Window → Cinematics → Movie Render Queue."""
import unreal
tools = unreal.AssetToolsHelpers.get_asset_tools()
path = '/Game/Azura/MRQ_Vitrine'
if unreal.EditorAssetLibrary.does_asset_exist(path):
    queue = unreal.EditorAssetLibrary.load_asset(path)
    queue.delete_all_jobs()
else:
    queue = tools.create_asset('MRQ_Vitrine', '/Game/Azura', unreal.MoviePipelineQueue, unreal.MoviePipelineQueueFactoryNew())
job = queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
job.set_editor_property('sequence', unreal.SoftObjectPath('/Game/Azura/LS_AzuraVitrine.LS_AzuraVitrine'))
job.set_editor_property('map', unreal.SoftObjectPath('/Game/Azura/Maps/Vitrine.Vitrine'))
job.set_editor_property('job_name', 'Azura vitrine')
cfg = job.get_configuration()
out = cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
out.set_editor_property('output_directory', unreal.DirectoryPath('/Users/jl/azura/export/render/'))
out.set_editor_property('file_name_format', 'vitrine.{frame_number}')
out.set_editor_property('output_resolution', unreal.IntPoint(1920, 1080))
out.set_editor_property('output_frame_rate', unreal.FrameRate(30, 1))
cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
aa = cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
aa.set_editor_property('spatial_sample_count', 2); aa.set_editor_property('temporal_sample_count', 2)
cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
unreal.EditorAssetLibrary.save_loaded_asset(queue)
unreal.log('[Azura] file MRQ_Vitrine prête (PNG 1920x1080 dans export/render/)')

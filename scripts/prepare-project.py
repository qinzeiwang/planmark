"""Create a standalone PlanMark project from an accepted PNG or saved scene."""
import argparse
import base64
import json
from pathlib import Path
import shutil
import struct
import uuid

ROOT=Path(__file__).resolve().parents[1]
RUNTIME=['annotator.html','annotator.css','annotator.js','scene-core.js','icons.generated.js']

def prepare(output, image=None, scene_file=None):
    output=Path(output).resolve()
    if output.exists():
        raise ValueError('输出目录已存在，请选择新的项目目录，避免覆盖已保存的标注')
    if scene_file:
        scene=json.loads(Path(scene_file).read_text(encoding='utf-8-sig'))
        if scene.get('version')!=1 or not scene.get('background',{}).get('src'):
            raise ValueError('不是支持的 PlanMark JSON')
    else:
        image=Path(image).resolve();raw=image.read_bytes()
        if not raw.startswith(b'\x89PNG\r\n\x1a\n') or len(raw)<24:
            raise ValueError('请提供确认后的 PNG 底图；已有标注可使用 --scene')
        width,height=struct.unpack('>II',raw[16:24])
        scene={'version':1,'revision':str(uuid.uuid4()),'background':{'name':image.name,'src':'data:image/png;base64,'+base64.b64encode(raw).decode('ascii'),'width':width,'height':height,'overlayOpacity':0},'annotations':[],'legend':{'position':'right-center'}}
    editor=output/'editor';editor.mkdir(parents=True)
    for name in RUNTIME:
        shutil.copy2(ROOT/'editor'/name,editor/name)
    scripts=output/'scripts';scripts.mkdir()
    for name in ['local-server.py']:
        shutil.copy2(ROOT/'scripts'/name,scripts/name)
    (output/'scene.json').write_text(json.dumps(scene,ensure_ascii=False,indent=2),encoding='utf-8')
    if image:
        shutil.copy2(image,output/'base.png')
    html=(editor/'annotator.html').read_text(encoding='utf-8')
    bootstrap='<script>EngineeringAnnotator.setScene('+json.dumps(scene,ensure_ascii=False).replace('<','\\u003c')+').catch(e=>{document.getElementById("message").textContent=e.message;});</script>'
    (editor/'start.html').write_text(html.replace('</body>',bootstrap+'\n</body>'),encoding='utf-8')
    return {'project':str(output),'scene':str(output/'scene.json'),'editor':str(editor/'start.html'),'server':str(scripts/'local-server.py')}

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    source=parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--image');source.add_argument('--scene')
    parser.add_argument('--output',required=True)
    args=parser.parse_args()
    try:
        print(json.dumps(prepare(args.output,args.image,args.scene),ensure_ascii=False,indent=2))
    except (OSError,ValueError) as error:
        parser.exit(1,str(error)+'\n')

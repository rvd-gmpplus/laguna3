import os, sys
SRC = os.path.join(os.path.dirname(__file__), 'src')
ORDER = ['core.js','body.js','bodyparts.js','engine1.js','engine2.js','drivetrain.js','chassis.js','interior.js','systems.js','app1.js','app2.js']
LIBS = ['build/three.min.js','examples/js/controls/OrbitControls.js','examples/js/environments/RoomEnvironment.js','examples/js/geometries/RoundedBoxGeometry.js','examples/js/utils/BufferGeometryUtils.js']
CDN = 'https://cdn.jsdelivr.net/npm/three@0.147.0/'
head = open(os.path.join(SRC,'head.html'), encoding='utf-8').read()
js = '\n'.join(open(os.path.join(SRC,f), encoding='utf-8').read() for f in ORDER)
def page(prefix):
    tags = '\n'.join(f'<script src="{prefix}{l}"></script>' for l in LIBS)
    return f"{head}\n{tags}\n<script>\n{js}\n</script>\n"
out = os.path.join(os.path.dirname(__file__), 'index.html')
open(out,'w',encoding='utf-8').write(page(CDN))
test_dir = sys.argv[1] if len(sys.argv) > 1 else None
if test_dir:
    os.makedirs(test_dir, exist_ok=True)
    body = page('three/')
    open(os.path.join(test_dir,'index.html'),'w',encoding='utf-8').write('<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n'+body+'</body></html>')
print('ok', os.path.getsize(out), 'bytes')

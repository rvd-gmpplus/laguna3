# Screenshots voor docs/screenshots via de presets van de app.
import sys, os
repo, out = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.join(repo, 'tools'))
from harness import session
SHOTS = [('gemonteerd', 'assembled'), ('hoofdgroepen', 'main'), ('alles-uit-elkaar', 'everything'), ('motor-f4rt', 'engine'), ('automaat', 'gearbox'), ('rontgen', 'xray'),
         ('openen-motorruimte', 'openHood'), ('openen-instappen', 'openDoors'), ('openen-bagageruimte', 'openTrunk'), ('openen-panoramadak', 'openRoof'), ('openen-alles', 'openAll')]
os.makedirs(out, exist_ok=True)
with session() as s:
    pg = s.page(1280, 800)
    for name, pid in SHOTS:
        pg.evaluate("(id) => { const L = __laguna; L.preset(id); L.finishAll(); if (L.batchFlush) L.batchFlush(); L.finishAll(); return 1; }", pid)
        pg.wait_for_timeout(1200)
        pg.screenshot(path=os.path.join(out, name + '.png'), timeout=180000); print('beeld', name)
    pg2 = s.page(390, 844, scale=2, touch=True)
    pg2.evaluate("() => { const L = __laguna; L.preset('main'); L.finishAll(); if (L.batchFlush) L.batchFlush(); L.finishAll(); return 1; }")
    pg2.wait_for_timeout(1200)
    pg2.screenshot(path=os.path.join(out, 'mobiel.png'), timeout=180000); print('beeld mobiel')
    s.report()

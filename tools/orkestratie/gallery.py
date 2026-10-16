"""Vaste screenshotset van de orkestrator na elke golf (onafhankelijk van wat agents zelf kiezen).

    python3 gallery.py REPO UITVOERMAP [set]     set: alles (standaard), exterieur, motor, aandrijving, onderstel, interieur, mobiel

Gebruikt alleen de v1-test-API (ROOT, byName, isolate, setTarget, explodeAllUnder, collapseAll, focusNodes, select, finishAll),
die elke versie moet behouden. Maakt per beeld een PNG.
"""
import sys, os
REPO, OUT = sys.argv[1], sys.argv[2]
WHICH = sys.argv[3] if len(sys.argv) > 3 else 'alles'
sys.path.insert(0, os.path.join(REPO, 'tools'))
from harness import session

D = {'iso': (1, 0.42, 1.08), 'zij': (1, 0.1, 0.02), 'achter34': (-1, 0.45, -1), 'voor': (0.12, 0.22, 1), 'achter': (-0.15, 0.3, -1),
     'boven': (0.0001, 1, 0.12), 'motor': (0.25, 0.35, 1), 'onder': (0.25, -1, 0.15)}

def view(name, iso=None, open_=(), deep=(), d='iso', pad=1.04, sel=None):
    return {'name': name, 'iso': iso, 'open': list(open_), 'deep': list(deep), 'dir': D[d], 'pad': pad, 'sel': sel}

SETS = {
    'exterieur': [view('ext-34voor'), view('ext-zij', d='zij'), view('ext-34achter', d='achter34'), view('ext-voor', d='voor'),
                  view('ext-achter', d='achter'), view('ext-boven', d='boven'),
                  view('carrosserie-1', iso=['Carrosserie'], open_=['Carrosserie']),
                  view('portier-alles', iso=['Portier linksvoor'], deep=['Portier linksvoor'], d='zij'),
                  view('koplamp-alles', iso=['Koplamp links'], deep=['Koplamp links'], d='voor')],
    'overzicht': [view('hoofdgroepen', open_=['Renault Laguna III']), view('alles-uit-elkaar', deep=['Renault Laguna III'], pad=1.0)],
    'motor': [view('motor-dicht', iso=['Motor F4Rt'], d='motor'), view('motor-1', iso=['Motor F4Rt'], open_=['Motor F4Rt'], d='motor'),
              view('motor-alles', iso=['Motor F4Rt'], deep=['Motor F4Rt'], d='motor', pad=1.0),
              view('cilinderkop-alles', iso=['Cilinderkop'], deep=['Cilinderkop'], d='motor'),
              view('turbo-alles', iso=['Turbocompressor'], deep=['Turbocompressor'], d='motor'),
              view('dynamo-alles', iso=['Dynamo'], deep=['Dynamo'], d='motor'),
              view('krukmechanisme-alles', iso=['Krukmechanisme'], deep=['Krukmechanisme'], d='motor')],
    'aandrijving': [view('aandrijflijn-1', iso=['Aandrijflijn'], open_=['Aandrijflijn'], d='motor'),
                    view('automaat-1', iso=['Automaatversnellingsbak'], open_=['Automaatversnellingsbak'], d='motor'),
                    view('automaat-alles', iso=['Automaatversnellingsbak'], deep=['Automaatversnellingsbak'], d='motor'),
                    view('aandrijfassen-alles', iso=['Aandrijfassen'], deep=['Aandrijfassen'], d='voor')],
    'onderstel': [view('onderstel-1', iso=['Onderstel'], open_=['Onderstel']),
                  view('wielophanging-lv-alles', iso=['Wielophanging linksvoor'], deep=['Wielophanging linksvoor'], d='zij'),
                  view('remklauw-lv-alles', iso=['Remklauw linksvoor'], deep=['Remklauw linksvoor'], d='zij'),
                  view('wiel-lv-dicht', iso=['Wiel linksvoor'], d='zij', pad=1.2), view('wiel-lv-alles', iso=['Wiel linksvoor'], deep=['Wiel linksvoor'], d='iso')],
    'interieur': [view('interieur-1', iso=['Interieur'], open_=['Interieur']),
                  view('bestuurdersstoel-alles', iso=['Bestuurdersstoel'], deep=['Bestuurdersstoel']),
                  view('dashboard-alles', iso=['Dashboard'], deep=['Dashboard'], d='voor')],
}
SETS['golf2'] = [view('motorruimte-boven', iso=['Aandrijflijn', 'Koeling en luchtinlaat', 'Elektrisch systeem', 'Vooras en stuurinrichting'], d='boven', pad=1.0),
                 view('motorruimte-rechts', iso=['Aandrijflijn', 'Koeling en luchtinlaat', 'Elektrisch systeem', 'Vooras en stuurinrichting'], d='motor', pad=1.0),
                 view('stuurpomp-alles', iso=['Stuurpomp'], deep=['Stuurpomp'], d='motor'),
                 view('stuurinrichting-alles', iso=['Stuurinrichting'], deep=['Stuurinrichting'], d='iso'),
                 view('remsysteem-1', iso=['Remsysteem'], open_=['Remsysteem'], d='iso'),
                 view('parkeerrem-alles', iso=['Parkeerrem'], deep=['Parkeerrem'], d='iso'),
                 view('achteras-1', iso=['Achteras'], open_=['Achteras'], d='achter34'),
                 view('koppelomvormer-alles', iso=['Koppelomvormer'], deep=['Koppelomvormer'], d='motor'),
                 view('startmotor-alles', iso=['Startmotor'], deep=['Startmotor'], d='motor'),
                 view('motorsteunen-1', iso=['Motorsteunen'], open_=['Motorsteunen'], d='motor'),
                 view('koeling-alles', iso=['Koeling en luchtinlaat'], deep=['Koeling en luchtinlaat'], d='iso'),
                 view('uitlaat-alles', iso=['Uitlaatsysteem'], deep=['Uitlaatsysteem'], d='onder'),
                 view('brandstof-1', iso=['Brandstofsysteem'], open_=['Brandstofsysteem'], d='iso'),
                 view('accu-alles', iso=['Accu'], deep=['Accu'], d='iso'),
                 view('interieur-alles', iso=['Interieur'], deep=['Interieur'], d='iso', pad=1.0),
                 view('cabine-zij', iso=['Interieur'], d='zij')]
SETS['alles'] = SETS['exterieur'] + SETS['overzicht'] + SETS['motor'] + SETS['aandrijving'] + SETS['onderstel'] + SETS['interieur']
MOBIEL = [view('mobiel-gemonteerd'), view('mobiel-hoofdgroepen', open_=['Renault Laguna III']), view('mobiel-motor-1', iso=['Motor F4Rt'], open_=['Motor F4Rt'], d='motor')]

APPLY = r"""(v) => { const L = window.__model; const N = n => { const x = L.byName(n); if (!x) throw new Error('niet gevonden: ' + n); return x; };
  L.collapseAll(); L.isolate(v.iso ? v.iso.map(N) : []); L.finishAll();
  for (const n of v.open) L.setTarget(N(n), 1);
  for (const n of v.deep) L.explodeAllUnder(N(n));
  L.finishAll();
  const focus = v.iso ? v.iso.map(N) : [L.ROOT];
  if (L.select) L.select(v.sel ? N(v.sel) : focus[0]);
  L.focusNodes(focus, new THREE.Vector3(...v.dir), v.pad); L.finishAll(); return true; }"""

os.makedirs(OUT, exist_ok=True)
with session() as s:
    views = MOBIEL if WHICH == 'mobiel' else SETS[WHICH]
    w, h, touch = (390, 844, True) if WHICH == 'mobiel' else (1280, 800, False)
    pg = s.page(w, h, scale=2 if touch else 1, touch=touch)
    for v in views:
        try:
            pg.evaluate(APPLY, v)
            pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(OUT, v['name'] + '.png'), timeout=180000)
            print('beeld', v['name'])
        except Exception as e:
            print('MISLUKT', v['name'], str(e)[:200])
    if WHICH == 'alles':
        pg.emulate_media(color_scheme='dark')
        pg.evaluate(APPLY, view('donker-hoofdgroepen', open_=['Renault Laguna III']))
        pg.wait_for_timeout(400)
        pg.screenshot(path=os.path.join(OUT, 'donker-hoofdgroepen.png'), timeout=180000)
        print('beeld donker-hoofdgroepen')
    s.report()

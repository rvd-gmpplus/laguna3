"""Screenshots voor de visuele poort van golf 4 (vaste camera's van de orkestrator).
Gebruik: python3 gateshots.py UITVOERMAP
Per opener: open via de knop in de openerlijst (camera zoals na een klik), dan een opname. Daarnaast overzichten,
panoramadak van boven en van binnen, en twee telefoonbeelden.
"""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))  # tools/ van deze checkout
from harness import session

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
JS_CHIPS = '() => [...document.querySelectorAll("#openList button")].map(b => b.textContent)'


def settle(pg, ms=900):
    pg.evaluate('() => window.__model.finishAll()')
    pg.wait_for_timeout(ms)


with session() as s:
    pg = s.page(1280, 800)
    pg.wait_for_function('window.__model && window.__model.ready', timeout=180000)
    pg.evaluate('() => window.__model.setOpenMode(true)')
    settle(pg)
    pg.screenshot(path=f'{out}/00-openen-dicht.png')
    chips = pg.evaluate(JS_CHIPS)
    names = pg.evaluate('() => window.__model.openers().map(o => o.name)')
    log = []
    for i, label in enumerate(chips):
        pg.evaluate('() => window.__model.openAll(0, true)')
        settle(pg, 300)
        pg.evaluate(f'() => document.querySelectorAll("#openList button")[{i}].click()')
        pg.wait_for_timeout(200)
        settle(pg, 1200)
        fn = f'{out}/{i + 1:02d}-{label.lower().replace(" ", "-")}.png'
        pg.screenshot(path=fn)
        log.append({'nr': i + 1, 'label': label, 'opener': names[i] if i < len(names) else '', 'file': fn,
                    'open': pg.evaluate('() => window.__model.openers().filter(o => o.open > 0).map(o => o.name)')})
    # overzichten met alles open
    pg.evaluate('() => window.__model.openAll(1, true)')
    settle(pg, 300)
    for tag, d in (('linksvoor', [1, 0.55, 1.1]), ('rechtsachter', [-1, 0.6, -1.1]), ('boven', [0.2, 1.6, 0.25])):
        pg.evaluate(f'() => {{ const L = window.__model; L.focusNodes([L.ROOT], new THREE.Vector3({d[0]}, {d[1]}, {d[2]}).normalize(), 1.04); }}')
        settle(pg, 900)
        pg.screenshot(path=f'{out}/80-alles-open-{tag}.png')
    # panoramadak: dicht van boven, open van boven, van binnen naar boven
    pg.evaluate('() => window.__model.openAll(0, true)')
    settle(pg, 300)
    pg.evaluate('() => { const L = window.__model; L.focusNodes([L.byName("Panoramadak")], new THREE.Vector3(0.35, 1, 0.4).normalize(), 1.25); }')
    settle(pg)
    pg.screenshot(path=f'{out}/90-dak-dicht-boven.png')
    pg.evaluate('() => { window.__model.setOpen("Glaspaneel voor", 1, true); }')
    settle(pg)
    pg.screenshot(path=f'{out}/91-dak-open-boven.png')
    pg.evaluate('''() => { const L = window.__model; L.finishAll(); const c = L.camera || window.camera; }''')
    # camera van binnen, laag achter in de cabine tussen de achterhoofdsteunen, schuin omhoog naar voren met een ruime hoek (70 graden): beide openingen met
    # de dwarsbalk en de rand rondom, de voorste opening met lucht, de achterste met het getinte glas. In 92 staat ook het achterste scherm open, zodat het glas zichtbaar is.
    inside = pg.evaluate('''() => { try { window.__model.select(window.__model.ROOT); window.__model.setOpen("Zonnescherm achter", 1, true); camera.fov = 70; camera.updateProjectionMatrix(); camera.position.set(0, 0.9, -1.05); controls.target.set(0, 1.45, -0.3); controls.update(); window.__model.finishAll(); return true; } catch (e) { return String(e); } }''')
    pg.wait_for_timeout(1200)
    pg.screenshot(path=f'{out}/92-dak-open-binnen.png')
    pg.evaluate('() => { window.__model.setOpen("Glaspaneel voor", 0, true); window.__model.setOpen("Zonnescherm voor", 0, true); window.__model.setOpen("Zonnescherm achter", 0, true); }')
    pg.wait_for_timeout(900)
    pg.screenshot(path=f'{out}/93-dak-dicht-binnen.png')
    # telefoon
    ph = s.page(390, 844, touch=True, scale=2)
    ph.wait_for_function('window.__model && window.__model.ready', timeout=180000)
    ph.evaluate('() => window.__model.setOpenMode(true)')
    settle(ph)
    for i, label in enumerate(ph.evaluate(JS_CHIPS)):
        if label not in ('Motorkap', 'Portier linksvoor', 'Achterklep'):
            continue
        ph.evaluate('() => window.__model.openAll(0, true)')
        settle(ph, 300)
        ph.evaluate(f'() => document.querySelectorAll("#openList button")[{i}].click()')
        ph.wait_for_timeout(200)
        settle(ph, 1200)
        ph.screenshot(path=f'{out}/95-telefoon-{label.lower().replace(" ", "-")}.png')
    json.dump({'chips': chips, 'log': log, 'inside_cam': inside}, open(f'{out}/index.json', 'w'), ensure_ascii=False, indent=1)
    print(len(log), 'openers;', 'binnencamera:', inside)
    s.report()

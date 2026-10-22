"""Publicatierooktest: de CDN-versie zoals hij gepubliceerd wordt, in de verpakking van de artefacthost.

    python3 tools/pubsmoke.py          # exitcode 1 bij een fout

Wat hij doet:
1. Bouwt de kale CDN-pagina in het geheugen (zoals build.py --bare hem schrijft) en zet hem in hetzelfde
   HTML-geraamte dat de artefacthost eromheen zet; daarnaast laadt hij index.html zoals GitHub Pages het serveert
   (een volledig document) op een telefoon en eist standaardmodus en een schermbreedte van 390 px.
2. Laadt hem in Chromium. Verzoeken naar cdn.jsdelivr.net/npm/three@<THREE_VERSION>/ worden beantwoord uit het lokale
   npm-pakket (de container heeft geen directe internettoegang voor Chromium); lettertypen krijgen een lege stylesheet.
3. Controleert: geen console- of paginafouten, __model klaar binnen 20 s, THREE.REVISION komt uit THREE_VERSION van
   build.py (0.186.1 geeft 186), alle zes CDN-bestanden zijn opgevraagd, de importmap (golf 6) bevat de sleutels
   `three` en `three/addons/` en voor elk van de zes bestanden een sha384-integriteit die klopt met het lokale pakket,
   er staan zes modulepreload-links met dezelfde integriteit en crossorigin anonymous, er is geen klassiek
   three.js-script meer en window.__modelThreeFout is niet gezet; dit geldt voor beide kanalen (artefact en Pages). Het canvas heeft
   touch-action en user-select uit en de stylesheet schakelt -webkit-touch-callout uit (lang drukken op iOS). Staan de
   nummergegevens als JSON-blok #pn in de pagina (build.py, golf 5c-2 P1), dan moet dat blok het geraamte van de host
   overleven en leesbaar zijn: PN_DATA.map heeft dan minstens één pad.
4. Controleert met curl via de proxy dat elk van de zes CDN-bestanden (build.LIBS: three.module.js, three.core.js en de
   vier addons) bestaat en byte voor byte gelijk is aan het lokale pakket, en dat de lettertype-stylesheet van Google
   Fonts bereikbaar is.
"""
import sys, os, re, time, hashlib, base64, subprocess, importlib.util, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import ROOT, ensure_three, chromium_path, ARGS

SKELETON_HEAD = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
                 '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
                 'html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
                 'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')
SKELETON_TAIL = '\n\n</body></html>'


def load_build():
    spec = importlib.util.spec_from_file_location('lagbuild', os.path.join(ROOT, 'build.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    b = load_build()
    sources = [(f, b.read(f)) for f in b.ORDER]
    errs = b.lint(sources)
    if errs:
        print('lint faalt:', *errs, sep='\n  ')
        return 1
    page = b.page(b.read('head.html'), '\n'.join(t for _, t in sources), b.CDN)
    html = SKELETON_HEAD + page + SKELETON_TAIL   # artefact: de kale pagina (build.py --bare) in het geraamte van de host
    # GitHub Pages serveert index.html zoals het is: dat moet zelf een volledig document zijn (doctype, viewport)
    pages = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    three = ensure_three()
    fails = []
    # THREE.REVISION is het middelste deel van de versie (0.186.1 geeft 186); de verwachting komt uit de bouw, niet uit een getal in dit script
    revision = str(int(b.THREE_VERSION.split('.')[1]))
    # de verwachte integriteit per CDN-bestand, hier zelf uit het lokale pakket berekend (niet uit b.integrity, dat bewaakt dit script juist)
    want = {b.CDN + lib: 'sha384-' + base64.b64encode(hashlib.sha384(open(os.path.join(three, lib), 'rb').read()).digest()).decode() for lib in b.LIBS}
    if len(b.LIBS) != 6: fails.append(f'build.LIBS heeft {len(b.LIBS)} bestanden, verwacht 6 (three.module.js, three.core.js en vier addons)')
    for lib in b.LIBS:
        if b.integrity(lib) != want[b.CDN + lib]: fails.append(f'b.integrity({lib}) wijkt af van het lokale pakket')

    # 4. CDN en lettertypen via curl (proxy)
    for lib in b.LIBS:
        url = b.CDN + lib
        r = subprocess.run(['curl', '-sS', '-L', '--max-time', '60', '-o', '-', '-w', '%{http_code}', url], capture_output=True)
        body, code = r.stdout[:-3], r.stdout[-3:].decode(errors='replace')
        local = open(os.path.join(three, lib), 'rb').read()
        if code != '200':
            fails.append(f'CDN {url} geeft HTTP {code}')
        elif hashlib.sha256(body).hexdigest() != hashlib.sha256(local).hexdigest():
            fails.append(f'CDN {url} wijkt af van het lokale pakket ({len(body)} tegen {len(local)} bytes)')
    fonts = re.search(r'href="(https://fonts\.googleapis\.com/css2[^"]+)"', page)
    if fonts:
        r = subprocess.run(['curl', '-sS', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '30', fonts.group(1).replace('&amp;', '&')], capture_output=True, text=True)
        if r.stdout.strip() != '200':
            fails.append(f'Google Fonts geeft HTTP {r.stdout.strip()}')

    # 1 tot 3. Laden in de hostverpakking
    from playwright.sync_api import sync_playwright
    logs = []
    with sync_playwright() as p:
        exe = chromium_path()
        br = p.chromium.launch(executable_path=exe, args=ARGS) if exe else p.chromium.launch(args=ARGS)
        for (w, h, touch, kanaal) in ((1280, 800, False, 'artefact'), (390, 844, True, 'artefact'), (390, 844, True, 'pages')):
            ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if touch else 1, has_touch=touch, is_mobile=touch)
            ctx.add_init_script('window.__MODEL_CACHECHECK = true;')
            pg = ctx.new_page()
            tag = f'{w}x{h}' + (' pages' if kanaal == 'pages' else '')
            pg.on('console', lambda m, tag=tag: logs.append(f'[{tag}] {m.type}: {m.text}') if m.type in ('error', 'warning') else None)
            pg.on('pageerror', lambda e, tag=tag: logs.append(f'[{tag}] PAGEERROR: {e}'))
            gevraagd = set()

            def route(rt):   # gevraagd hoort bij deze ronde van de lus (de context sluit aan het eind ervan)
                url = rt.request.url
                if url.startswith(b.CDN):
                    path = os.path.join(three, url[len(b.CDN):].split('?')[0])
                    gevraagd.add(url.split('?')[0])
                    if os.path.isfile(path):
                        return rt.fulfill(status=200, body=open(path, 'rb').read(), headers={'content-type': 'application/javascript', 'access-control-allow-origin': '*'})
                    return rt.fulfill(status=404, body='niet gevonden')
                if 'fonts.googleapis.com' in url or 'fonts.gstatic.com' in url:
                    return rt.fulfill(status=200, body='', headers={'content-type': 'text/css', 'access-control-allow-origin': '*'})
                if url.startswith('https://artifact.local/'):
                    return rt.fulfill(status=200, body=html if kanaal == 'artefact' else pages, headers={'content-type': 'text/html; charset=utf-8'})
                return rt.abort()
            pg.route('**/*', route)
            t0 = time.time()
            pg.goto('https://artifact.local/index.html', wait_until='load', timeout=120000)
            # grens voor `ready`: 20 s (docs/testen.md); op een belaste machine of CI via PUBSMOKE_READY_MS hoger zetten
            ready_ms = int(os.environ.get('PUBSMOKE_READY_MS', '20000'))
            try:
                pg.wait_for_function('window.__model && window.__model.ready !== false', timeout=ready_ms)
            except Exception:
                fails.append(f'[{tag}] __model niet klaar binnen {ready_ms / 1000:g} s')
                continue
            dt = time.time() - t0
            r = pg.evaluate("""(() => { const c = document.querySelector('canvas'); const cs = getComputedStyle(c);
                const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\\n'); } catch (e) { return ''; } }).join('\\n');
                const im = document.querySelector('script[type=importmap]'); let map = null; try { map = JSON.parse(im.textContent); } catch (e) {}
                const pre = [...document.querySelectorAll('link[rel=modulepreload]')].map(l => [l.href, l.getAttribute('integrity') || '', l.getAttribute('crossorigin') || '']);
                const klassiek = [...document.querySelectorAll('script[src]')].map(e => e.src).filter(u => /three/i.test(u));
                return { map: map, nmap: document.querySelectorAll('script[type=importmap]').length, pre: pre, klassiek: klassiek, fout: window.__modelThreeFout || null, rev: THREE.REVISION, touch: cs.touchAction, select: cs.userSelect || cs.webkitUserSelect, callout: /-webkit-touch-callout\\s*:\\s*none/.test(css) || /touch-callout/.test(document.documentElement.innerHTML),
                         hscroll: document.documentElement.scrollWidth > innerWidth, mode: document.compatMode, iw: innerWidth,
                         pn: document.getElementById('pn') ? (() => { try { return Object.keys(PN_DATA.map).length; } catch (e) { return -1; } })() : null }; })()""")
            print(f'[{tag}] klaar in {dt:.1f} s, three r{r["rev"]}, importmap met {len((r["map"] or {}).get("integrity") or {})} sleutels, {len(r["pre"])} modulepreload, touch-action {r["touch"]}, user-select {r["select"]}, touch-callout uit: {r["callout"]}, horizontale scroll: {r["hscroll"]}, nummerpaden: {r["pn"]}')
            if r['rev'] != revision: fails.append(f'[{tag}] THREE.REVISION is {r["rev"]}, moet {revision} zijn (THREE_VERSION {b.THREE_VERSION})')
            # golf 6: laadketen met importmap en modulepreload, in dit kanaal (de pagina moet de verpakking van de host overleven)
            m = r['map'] or {}
            if r['nmap'] != 1 or not r['map']: fails.append(f'[{tag}] {r["nmap"]} importmaps, of onleesbaar (verwacht precies één geldige JSON-importmap)')
            if (m.get('imports') or {}).get('three') != b.CDN + 'build/three.module.js': fails.append(f'[{tag}] importmap: three wijst naar {(m.get("imports") or {}).get("three")}')
            if (m.get('imports') or {}).get('three/addons/') != b.CDN + 'examples/jsm/': fails.append(f'[{tag}] importmap: three/addons/ wijst naar {(m.get("imports") or {}).get("three/addons/")}')
            if m.get('integrity') != want: fails.append(f'[{tag}] importmap: integrity wijkt af van de sha384 van het lokale pakket ({len(m.get("integrity") or {})} sleutels, verwacht {len(want)})')
            if sorted(map(tuple, r['pre'])) != sorted((u, i, 'anonymous') for u, i in want.items()): fails.append(f'[{tag}] modulepreload: {len(r["pre"])} links, verwacht zes met dezelfde sha384 en crossorigin anonymous')
            if r['klassiek']: fails.append(f'[{tag}] klassieke three.js-scripttag aanwezig: {r["klassiek"][:2]}')
            if r['fout']: fails.append(f'[{tag}] window.__modelThreeFout gezet: {r["fout"]}')
            if gevraagd != set(want): fails.append(f'[{tag}] CDN-bestanden opgevraagd: {len(gevraagd)} van {len(want)}; mist {sorted(set(want) - gevraagd)[:2]}')
            if r['touch'] != 'none': fails.append(f'[{tag}] canvas touch-action is {r["touch"]}, moet none')
            if r['select'] != 'none': fails.append(f'[{tag}] canvas user-select is {r["select"]}, moet none')
            if not r['callout']: fails.append(f'[{tag}] -webkit-touch-callout: none ontbreekt (lang drukken op iOS opent dan het systeemmenu)')
            if r['hscroll']: fails.append(f'[{tag}] horizontale scroll')
            # zonder doctype staat de pagina in quirks-modus, zonder viewport-regel rekent een telefoon met 980 px breedte
            if r['mode'] != 'CSS1Compat': fails.append(f'[{tag}] documentmodus {r["mode"]}, moet CSS1Compat (doctype ontbreekt)')
            if r['pn'] is not None and r['pn'] < 1: fails.append(f'[{tag}] nummergegevens in #pn onleesbaar of leeg ({r["pn"]})')
            if touch and r['iw'] != w: fails.append(f'[{tag}] schermbreedte {r["iw"]} px in plaats van {w} (viewport-regel ontbreekt)')
            ctx.close()
        br.close()
    errs = [l for l in logs if 'error' in l.lower() or 'PAGEERROR' in l]
    for l in logs[:30]: print('  ' + l[:300])
    fails += errs
    print('PUBLICATIEROOKTEST OK' if not fails else 'PUBLICATIEROOKTEST NIET OK:\n  ' + '\n  '.join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())

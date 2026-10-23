"""Kierenaudit van de hele buitenhuid in de dichte stand (golf 8, verzoek van de gebruiker: "Natuurlijke kieren, zoals die op
de auto zitten, prima, maar als er iets in elkaar moet overlopen, laat dat goed werken").

    python3 tools/kieren.py [--json PAD] [--zijde rechts|links|beide] [--png MAP] [--allow PAD] [--stap MM]

Meetwerk in tools/kieren.js (in de pagina): stralen van buiten loodrecht op het analytische carrosserieoppervlak van
src/body.js over een raster dat zijkant, dak, motorkap, voor- en achterkant en de ruiten dekt (onderkant, wielbogen en de
binnenkant van de wielbooglip niet). Per straal de eerste treffer en de diepte ten opzichte van het oppervlak. Overgangen
tussen buitendelen worden fijn nagemeten (0,4 mm) en per paar onderdelen en plaats samengevoegd tot naden, met kier,
stap, randdiepte, doorkijk, knik (hoek tussen de vlakken) en lijnhoek (hoek tussen de twee randlijnen). Daarnaast
doorkijkvlakken (kier breder dan een rasterstap) en facetten (een glad deel dat meer dan 1 mm van zijn mediaan afwijkt).

Classificatie met tools/kieren_allow.json: een naad die daar staat, is natuurlijk en mag tot de grens van zijn soort (kier,
stap, rand, doorkijk); anders moet hij aansluiten (kier en stap hooguit 1 mm, geen doorkijk). Klassen: natuurlijk-ok,
natuurlijk-te-groot, moet-aansluiten-ok, moet-aansluiten-fout. Een maat telt pas als fout als minstens twee kruisingen
van de naad over de grens gaan (een enkele kruising is meetruis).

Exitcode 0 als niets fout is, 1 bij een fout (per fout naad, delen, plaats en maat), 2 bij een scriptfout.
--png MAP schrijft kieren_<zijde>.png met zijaanzicht, bovenaanzicht, voor- en achteraanzicht van het raster: grijs per
deel, blauw kier, rood moet-aansluiten-fout, oranje natuurlijk-te-groot, magenta facet, groen natuurlijk-ok.
Doorlooptijd op de Mac ongeveer 20 s per zijde (plus het laden van de pagina).
"""
import sys, os, re, json, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))


def arg(naam, std=None):
    return sys.argv[sys.argv.index(naam) + 1] if naam in sys.argv else std


def nl(v, d=1):
    """Getal in Nederlandse notatie."""
    if v is None:
        return '-'
    return f'{v:.{d}f}'.replace('.', ',')


def robuust(waarden, absoluut=False):
    """Op één na grootste waarde: een maat telt pas als minstens twee kruisingen hem halen."""
    w = sorted((abs(v) if absoluut else v) for v in waarden if v is not None)
    if not w:
        return None
    return w[-2] if len(w) > 1 else w[-1]


def mediaan(w):
    w = sorted(v for v in w if v is not None)
    return w[len(w) // 2] if w else None


def kort(p):
    """Laatste twee padstukken, zonder de groepen van de carrosseriekooi."""
    return '/'.join(p.split('/')[-2:])


def plaats(lo, hi):
    zijde = 'rechts' if hi[0] < -0.02 else 'links' if lo[0] > 0.02 else 'midden'
    return f'{zijde}, z {nl(lo[2], 3)} tot {nl(hi[2], 3)}, y {nl(lo[1], 3)} tot {nl(hi[1], 3)}, x {nl(lo[0], 3)} tot {nl(hi[0], 3)}'


def classificeer(r, allow):
    M = r['meshes']
    meting = allow['meting']
    soorten = allow['soorten']
    eis = allow['aansluiten']
    naden_cfg = [(n, re.compile(n['a']), re.compile(n['b'])) for n in allow['naden']]
    openingen = [re.compile(p) for p in allow['openingen']['patronen']]
    pad = lambda m: M[str(m)]['p']
    uit = []
    for n in r['naden']:
        pa, pb = pad(n['a']), pad(n['b'])
        hit = None
        for cfg, ra, rb in naden_cfg:
            if (ra.search(pa) and rb.search(pb)) or (ra.search(pb) and rb.search(pa)):
                hit = cfg
                break
        grens = dict(soorten[hit['soort']]) if hit else dict(eis, doorkijk=False)
        for k in ('kierMax', 'stapMax', 'randMax', 'doorkijk', 'knikMax'):
            if hit and k in hit:
                grens[k] = hit[k]
        kier = robuust(n['kier'])
        stap = robuust(n['stap'], absoluut=True)
        stapT = n['stap'][-1] if n['stap'] and abs(n['stap'][-1]) >= abs(n['stap'][0]) else (n['stap'][0] if n['stap'] else None)
        # rand: hoe ver de laatste millimeters van een glad deel van zijn eigen mediaan afwijken
        rand = []
        for kant, m in (('randA', n['a']), ('randB', n['b'])):
            mm = M[str(m)]
            if mm.get('glad') and n[kant]:
                rand.append(robuust([v - mm['med'] for v in n[kant]], absoluut=True))
        randW = max(rand) if rand else None
        doorkijkN = n['doorN']
        randdoorkijk = sum(n['rand'].values())
        fouten = []
        if grens.get('kierMax') is not None and kier is not None and kier > grens['kierMax'] + 1e-6:
            fouten.append(f"kier {nl(kier)} mm (grens {nl(grens['kierMax'])})")
        if grens.get('stapMax') is not None and stap is not None and stap > grens['stapMax'] + 1e-6:
            fouten.append(f"stap {nl(stap)} mm (grens {nl(grens['stapMax'])})")
        if grens.get('randMax') is not None and randW is not None and randW > grens['randMax'] + 1e-6:
            fouten.append(f"rand wijkt {nl(randW)} mm af van het vlak (grens {nl(grens['randMax'])})")
        if not grens.get('doorkijk') and doorkijkN >= 2:
            delen = ', '.join(kort(pad(k)) for k, _ in sorted(n['doorDelen'].items(), key=lambda x: -x[1])[:3])
            fouten.append(f"doorkijk tot {nl(n['door'])} mm diep op {doorkijkN} kruisingen ({delen or 'niets'})")
        if randdoorkijk >= 2:
            delen = ', '.join(f'{kort(pad(k))} {v}x' for k, v in sorted(n['rand'].items(), key=lambda x: -x[1])[:3])
            fouten.append(f"lichte delen achter de ruitrand zichtbaar ({delen})")
        kl = n.get('knikL')
        if grens.get('knikMax') is not None and kl and kl['hoek'] > grens['knikMax'] + 1e-6:
            fouten.append(f"knik van {nl(kl['hoek'])} graden in de naadlijn bij z {nl(kl['plek'][2], 3)}, y {nl(kl['plek'][1], 3)} (grens {nl(grens['knikMax'])})")
        natuurlijk = hit is not None
        klasse = ('natuurlijk-te-groot' if fouten else 'natuurlijk-ok') if natuurlijk else ('moet-aansluiten-fout' if fouten else 'moet-aansluiten-ok')
        uit.append({
            'naam': hit['naam'] if hit else f'{kort(pa)} tegen {kort(pb)}', 'soort': hit['soort'] if hit else 'aansluiten',
            'delen': [pa, pb], 'plaats': plaats(n['lo'], n['hi']), 'lo': n['lo'], 'hi': n['hi'], 'klasse': klasse, 'fouten': fouten,
            'kruisingen': n['n'], 'kierMed': mediaan(n['kier']), 'kier': kier, 'stap': stapT if stap is not None else None, 'stapAbs': stap,
            'rand': randW, 'doorkijk': n['door'], 'doorkijkN': doorkijkN, 'knik': robuust(n['knik']), 'lijnhoek': n['lijn'], 'lijnknik': n.get('knikL'),
            'vulling': n.get('vul', 0), 'randdoorkijk': n['rand'] and {kort(pad(k)): v for k, v in n['rand'].items()},
            'punten': n['punten'],
        })
    facetten = []
    for f in r['facetten']:
        facetten.append({'naam': f"facet in {kort(pad(f['deel']))}", 'soort': 'facet', 'delen': [pad(f['deel'])], 'plaats': plaats(f['lo'], f['hi']),
                         'lo': f['lo'], 'hi': f['hi'], 'kind': f['kind'], 'nrm': f['nrm'], 'klasse': 'moet-aansluiten-fout', 'monsters': f['n'], 'afwijking': f['afw'], 'mediaan': f['med'], 'plek': f['plek'],
                         'fouten': [f"vlak wijkt {nl(abs(f['afw']))} mm {'naar binnen' if f['afw'] > 0 else 'naar buiten'} af van het gladde oppervlak over {f['n']} rastermonsters (grens {nl(meting['facet'])})"]})
    vlakken = []
    for v in r['vlakken']:
        buren = [pad(k) for k in v['buren']]
        natuurlijk = (v['rand']['skip'] > 0 or v['rand']['buiten'] > 0) and all(any(o.search(b) for o in openingen) for b in buren) or (buren and all(any(o.search(b) for o in openingen) for b in buren))
        gezien = ', '.join(f'{kort(pad(k))} {c}x' for k, c in sorted(v['gezien'].items(), key=lambda x: -x[1])[:3])
        vlakken.append({'naam': 'doorkijkvlak naast ' + ', '.join(sorted({kort(b) for b in buren})[:4]), 'soort': 'doorkijkvlak', 'delen': buren, 'plaats': plaats(v['lo'], v['hi']),
                        'lo': v['lo'], 'hi': v['hi'], 'kind': v['kind'], 'nrm': v['nrm'], 'klasse': 'natuurlijk-ok' if natuurlijk else 'moet-aansluiten-fout', 'monsters': v['n'], 'diep': v['diep'], 'gezien': gezien,
                        'fouten': [] if natuurlijk else [f"doorkijk over {v['n']} rastermonsters tot {nl(v['diep'])} mm diep (ziet {gezien})"]})
    return uit, facetten, vlakken


def main():
    zijde = arg('--zijde', 'rechts')
    if zijde not in ('rechts', 'links', 'beide'):
        print('--zijde is rechts, links of beide', file=sys.stderr)
        return 2
    allow_pad = arg('--allow', os.path.join(HERE, 'kieren_allow.json'))
    uit_json, png = arg('--json'), arg('--png')
    try:
        with open(allow_pad, encoding='utf-8') as f:
            allow = json.load(f)
        m = dict(allow['meting'])
        if arg('--stap'):
            m['stap'] = float(arg('--stap'))
        cfg = {k: v for k, v in m.items() if not k.startswith('_')}
        cfg.update(zijde=zijde, opbouw=allow['opbouw']['patronen'], verzonken=allow['verzonken']['patronen'], lijmruiten=allow['lijmruiten']['patronen'],
                   naadvulling=allow['naadvulling']['patronen'], klein=allow['klein']['patronen'], geenFacet=allow['geenFacet']['patronen'], zwarteRand=allow['zwarteRand']['patronen'],
                   vormzones=allow['vormzones'])
        js = open(os.path.join(HERE, 'kieren.js'), encoding='utf-8').read()
    except (OSError, ValueError, KeyError) as e:
        print(f'KIEREN: FOUT bij het lezen van de instellingen: {e}')
        return 2
    t0 = time.time()
    from harness import session
    try:
        with session() as s:
            pg = s.page(1200, 900)
            r = pg.evaluate(js, cfg)
            naden, facetten, vlakken = classificeer(r, allow)
            if png:
                os.makedirs(png, exist_ok=True)
                kleur = {'moet-aansluiten-fout': '#e0201b', 'natuurlijk-te-groot': '#f08c00', 'natuurlijk-ok': '#2a9d3c', 'moet-aansluiten-ok': '#2a9d3c'}
                pts = []
                for n in sorted(naden, key=lambda n: n['klasse'] in ('moet-aansluiten-fout', 'natuurlijk-te-groot')):
                    for p in n['punten']:
                        pts.append([p[0], p[1], p[2], p[6], p[7], p[8], kleur[n['klasse']], 3 if n['klasse'] in ('moet-aansluiten-fout', 'natuurlijk-te-groot') else 1.5])
                vak = [[f['lo'], f['hi'], f['kind'], f['nrm'][1], f['nrm'][0], '#c000c0'] for f in facetten]
                vak += [[v['lo'], v['hi'], v['kind'], v['nrm'][1], v['nrm'][0], '#e0201b' if v['klasse'] != 'natuurlijk-ok' else '#2a9d3c'] for v in vlakken]
                url = pg.evaluate(TEKEN, {'pts': pts, 'vak': vak})
                with open(os.path.join(png, f'kieren_{zijde}.png'), 'wb') as f:
                    f.write(base64.b64decode(url.split(',', 1)[1]))
            fouten_pagina = s.errors()
    except Exception as e:  # noqa: BLE001 - elke fout in de meting is een scriptfout (exit 2)
        print(f'KIEREN: FOUT in de meting: {e}')
        return 2
    alles = naden + facetten + vlakken
    rood = [n for n in alles if n['klasse'] in ('moet-aansluiten-fout', 'natuurlijk-te-groot')]
    if uit_json:
        os.makedirs(os.path.dirname(os.path.abspath(uit_json)) or '.', exist_ok=True)
        with open(uit_json, 'w', encoding='utf-8') as f:
            json.dump({'zijde': zijde, 'duur_s': round(time.time() - t0, 1), 'meting': {k: r[k] for k in ('tijd', 'stralen', 'driehoeken', 'tel', 'kruisingen', 'scanFout', 'derde', 'los')},
                       'instellingen': cfg, 'naden': naden, 'facetten': facetten, 'doorkijkvlakken': vlakken, 'paginafouten': fouten_pagina}, f, ensure_ascii=False, indent=1)
    tel = {}
    for n in alles:
        tel[n['klasse']] = tel.get(n['klasse'], 0) + 1
    t = r['tel']
    print(f"raster: {t['monsters']} monsters ({t['gemeten']} op de huid, {t['opbouw']} opbouw, {t['kier']} kier), {r['stralen']} stralen, {r['kruisingen']} kruisingen")
    print(f"naden: {len(naden)}, facetten: {len(facetten)}, doorkijkvlakken: {len(vlakken)}; " + ', '.join(f'{k} {v}' for k, v in sorted(tel.items())))
    if fouten_pagina:
        print(f'{len(fouten_pagina)} console-meldingen in de pagina (eerste: {fouten_pagina[0][:200]})')
    volgorde = {'moet-aansluiten-fout': 0, 'natuurlijk-te-groot': 1}
    for n in sorted(rood, key=lambda n: (volgorde[n['klasse']], n['naam'])):
        print(f"{n['klasse'].upper()}: {n['naam']} | {' + '.join(kort(d) for d in n['delen'][:4])} | {n['plaats']} | {'; '.join(n['fouten'])}")
    if rood:
        print(f'KIEREN {zijde}: {len(rood)} fout (van {len(alles)} naden en vlakken)')
        return 1
    print(f'KIEREN {zijde}: groen ({len(alles)} naden en vlakken)')
    return 0


# overzichtsbeeld: achter- en vooraanzicht (boven), zijaanzicht (midden), bovenaanzicht (onder); elk rastermonster in het
# aanzicht dat bij zijn normaal past
TEKEN = """({pts, vak}) => {
  const { SM, lab } = window.__kieren;
  const W = 1800, Hh = 1260, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const c = cv.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, Hh);
  const S = 330, SV = 300;
  const proj = (p, kind, ny, nx) => {
    if (kind === 2) return [1460 + p[0] * SV, 390 - p[1] * SV];          // vooraanzicht (rechterkant van de auto links in beeld)
    if (kind === 3) return [340 - p[0] * SV, 390 - p[1] * SV];           // achteraanzicht (rechterkant rechts in beeld)
    if (ny >= 0.55 && Math.abs(nx) < 0.45) return [900 - p[2] * S, 925 + Math.abs(p[0]) * S];   // bovenaanzicht
    return [900 - p[2] * S, 860 - p[1] * S];                              // zijaanzicht
  };
  const grijs = m => 150 + ((m * 2654435761 >>> 0) % 70);
  for (let i = 0; i < SM.length; i++) {
    const s = SM[i], l = lab[i]; if (l === -2) continue;
    const q = proj(s.P, s.kind, s.n[1], s.n[0]);
    if (l >= 0) { const g = grijs(l); c.fillStyle = `rgb(${g},${g},${g + 10})`; }
    else c.fillStyle = l === -3 ? '#e8e2c8' : l === -4 ? '#1f4fbf' : '#445';
    c.fillRect(q[0] - 1.3, q[1] - 1.3, 2.6, 2.6);
  }
  for (const [x, y, z, kind, ny, nx, kl, r] of pts) { const q = proj([x, y, z], kind, ny, nx); c.fillStyle = kl; c.beginPath(); c.arc(q[0], q[1], r, 0, 7); c.fill(); }
  c.lineWidth = 2;
  for (const [lo, hi, kind, ny, nx, kl] of vak) { const a = proj(lo, kind, ny, nx), b = proj(hi, kind, ny, nx);
    c.strokeStyle = kl; c.strokeRect(Math.min(a[0], b[0]) - 5, Math.min(a[1], b[1]) - 5, Math.abs(a[0] - b[0]) + 10, Math.abs(a[1] - b[1]) + 10); }
  c.fillStyle = '#222'; c.font = '17px sans-serif';
  c.fillText('achteraanzicht', 20, 30); c.fillText('vooraanzicht', 1640, 30); c.fillText('zijaanzicht (voorkant links)', 20, 400); c.fillText('bovenaanzicht (voorkant links)', 20, 915);
  c.font = '15px sans-serif';
  [['#e0201b', 'moet aansluiten: fout'], ['#f08c00', 'natuurlijk: te groot'], ['#2a9d3c', 'in orde'], ['#c000c0', 'facet'], ['#1f4fbf', 'kier of doorkijk (raster)'], ['#e8e2c8', 'opbouw (telt niet)']]
    .forEach(([k, t], i) => { c.fillStyle = k; c.fillRect(640, 70 + i * 26, 16, 16); c.fillStyle = '#222'; c.fillText(t, 664, 83 + i * 26); });
  return cv.toDataURL('image/png');
}"""


if __name__ == '__main__':
    sys.exit(main())

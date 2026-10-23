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

Golf 8 ronde 2: een kier die helemaal onder een afdekdeel ligt (sectie afdekkers, hooguit meting.dekMax mm dieper dan de randen
of erboven) telt met kier 0 en zonder doorkijk. Een naad kan doorkijk 'donker' hebben: doorkijk alleen naar donkere delen of naar
de flens van zijn eigen delen. Sectie lijnen: knik (sprong in de richting van een fysieke lijn, ook over stukken van een naad heen)
en doorlopend (twee lijnen die over een naad of stijl in elkaar overlopen, hoek tussen hun hoofdassen). Lijnregels staan als eigen
rijen in de uitslag (soort lijnknik of doorlopend).

Exitcode 0 als niets fout is, 1 bij een fout (per fout naad, delen, plaats en maat), 2 bij een scriptfout.
--png MAP schrijft kieren_<zijde>.png met zijaanzicht, bovenaanzicht, voor- en achteraanzicht van het raster: grijs per
deel, blauw kier, rood moet-aansluiten-fout, oranje natuurlijk-te-groot, magenta facet, groen natuurlijk-ok.
Doorlooptijd op de Mac ongeveer 20 s per zijde (plus het laden van de pagina).
"""
import sys, os, re, json, time, base64, math
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
    lijnen = allow.get('lijnen', {})
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
        # lijnen.knik: een grens op de knik in de naadlijn, los van de soort van de naad (ook voor een naad die moet aansluiten);
        # de strengste grens telt
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
        elif grens.get('doorkijk') == 'donker':
            # doorkijk alleen naar donkere delen (afdichting, lijm, zwarte rand) of naar de flens van de twee delen van de naad zelf;
            # een licht deel erachter of niets (de straal komt binnen 30 cm nergens) telt als fout
            licht = {k: v for k, v in n.get('doorZie', {}).items() if int(k) not in (n['a'], n['b']) and M[str(k)]['lum'] > meting['randLum'] + 1e-9}
            niets = n.get('doorNiets', 0)
            if sum(licht.values()) + niets >= 2:
                delen = ', '.join(f'{kort(pad(k))} {v}x' for k, v in sorted(licht.items(), key=lambda x: -x[1])[:3])
                fouten.append(f"doorkijk naar lichte delen of niets ({delen}{', ' if delen and niets else ''}{f'niets {niets}x' if niets else ''}); alleen donkere afdichting mag")
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
            'afgedekt': {kort(pad(k)): v for k, v in n.get('afgedekt', {}).items()}, 'doorZie': {kort(pad(k)): v for k, v in n.get('doorZie', {}).items()},
            'doorNiets': n.get('doorNiets', 0), 'deellijnen': n.get('lijnen'), 'knikMax': grens.get('knikMax'),
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
    return uit, facetten, vlakken, lijnknik(uit, lijnen.get('knik', [])) + doorlopend(uit, lijnen.get('doorlopend', []))


def lijnGroepen(naden, R, zijde):
    """Fysieke lijnen uit de naden waarvan de delen bij het paar patronen R passen, op één zijde. Bouwstenen zijn de deellijnen
    van kieren.js (naad, lijn); een naad langs een lijst valt vaak in stukken uiteen (gaten van meer dan 'samen' rasterstappen),
    en een lijst met twee randen geeft twee evenwijdige deellijnen. Twee deellijnen van hetzelfde paar delen horen bij dezelfde
    lijn als een eind van de een binnen 25 cm van een eind van de ander ligt en binnen 2 mm plus 2 procent van die afstand van
    de verlengde lijn van de ander (in beide richtingen getoetst; een stuk van één punt heeft geen richting en wordt alleen
    tegen de lijn van het andere stuk getoetst). De twee randen van een lijst (13 mm uit elkaar) blijven zo gescheiden."""
    subs = {}
    for ni, n in enumerate(naden):
        pa, pb = n['delen']
        if not ((R[0].search(pa) and R[1].search(pb)) or (R[0].search(pb) and R[1].search(pa))):
            continue
        for p in n['punten']:
            if (p[0] < -0.02) if zijde == 'rechts' else (p[0] > 0.02):
                subs.setdefault((ni, p[9] if len(p) > 9 else 0), {'paar': tuple(sorted((pa, pb))), 'pts': []})['pts'].append(p[:3])
    keys = list(subs)
    info = {}
    for k in keys:
        pts = subs[k]['pts']
        if len(pts) >= 2:
            t, m = richting(pts)
            pr = [sum((p[i] - m[i]) * t[i] for i in range(3)) for p in pts]
            info[k] = (t, pts[pr.index(min(pr))], pts[pr.index(max(pr))])
        else:
            info[k] = (None, pts[0], pts[0])
    par = {k: k for k in keys}
    def f(k):
        while par[k] != k:
            k = par[k]
        return k
    def loodrecht(q, a, t):
        d = [q[i] - a[i] for i in range(3)]
        x = sum(d[i] * t[i] for i in range(3))
        return sum((d[i] - x * t[i]) ** 2 for i in range(3)) ** 0.5
    for i, a in enumerate(keys):
        for b in keys[i + 1:]:
            if subs[a]['paar'] != subs[b]['paar'] or (info[a][0] is None and info[b][0] is None):
                continue
            ta, *ea = info[a]
            tb, *eb = info[b]
            for x in ea:
                for y in eb:
                    d = sum((x[k] - y[k]) ** 2 for k in range(3)) ** 0.5
                    tol = 0.002 + 0.02 * d
                    if d <= 0.25 and (ta is None or loodrecht(y, x, ta) <= tol) and (tb is None or loodrecht(x, y, tb) <= tol):
                        par[f(a)] = f(b)
    groepen = {}
    for k in keys:
        groepen.setdefault(f(k), []).extend(subs[k]['pts'])
    return list(groepen.values())


def lijnknik(naden, regels):
    """lijnen.knik: per regel en zijde de fysieke lijnen (lijnGroepen) en hun grootste knik (knikSprong)."""
    uit = []
    for r in regels:
        R = (re.compile(r['a']), re.compile(r['b']))
        for zijde in ('rechts', 'links'):
            for pts in lijnGroepen(naden, R, zijde):
                k = knikSprong(pts, r.get('boog', 0.032))
                if k is None:
                    continue
                lo = [min(p[i] for p in pts) for i in range(3)]
                hi = [max(p[i] for p in pts) for i in range(3)]
                fouten = []
                if k['hoek'] > r['knikMax'] + 1e-6:
                    fouten.append(f"knik van {nl(k['hoek'])} graden in de lijn bij z {nl(k['plek'][2], 3)}, y {nl(k['plek'][1], 3)} (grens {nl(r['knikMax'])})")
                uit.append({'naam': r['naam'], 'soort': 'lijnknik', 'delen': [r['a'], r['b']], 'plaats': plaats(lo, hi), 'lo': lo, 'hi': hi,
                            'klasse': 'moet-aansluiten-fout' if fouten else 'moet-aansluiten-ok', 'fouten': fouten, 'punten_n': len(pts), **k})
    return uit


def knikSprong(pts, boog):
    """Knik als sprong in de richting (lijnen.knik): de punten van een lijn langs hun hoofdas; per punt de hoek tussen de koorde
    naar het punt 'boog' m terug en de koorde naar het punt 'boog' m verder, min het gemiddelde van die hoek een boog terug en
    een boog verder. Een gelijkmatige bocht (de daklijn die naar de voorruit afbuigt) geeft zo ongeveer 0, een knik zijn volle
    hoek. Punten binnen twee bogen van een eind van de lijn tellen niet: daar mag een lijn in een ontworpen hoek eindigen; de
    overgang naar de volgende lijn bewaakt lijnen.doorlopend."""
    best = None
    for pts in [pts]:
        if len(pts) < 8:
            return None
        t, m = richting(pts)
        pts = sorted(pts, key=lambda p: sum((p[k] - m[k]) * t[k] for k in range(3)))
        # booglengte langs de lijn
        s = [0.0]
        for a, b in zip(pts, pts[1:]):
            s.append(s[-1] + sum((b[k] - a[k]) ** 2 for k in range(3)) ** 0.5)
        def hoek_op(i):
            j0 = max((j for j in range(i) if s[i] - s[j] >= boog - 1e-9), default=None)
            j1 = min((j for j in range(i + 1, len(pts)) if s[j] - s[i] >= boog - 1e-9), default=None)
            if j0 is None or j1 is None:
                return None
            u = [pts[i][k] - pts[j0][k] for k in range(3)]
            v = [pts[j1][k] - pts[i][k] for k in range(3)]
            lu, lv = sum(x * x for x in u) ** 0.5, sum(x * x for x in v) ** 0.5
            if lu < 1e-9 or lv < 1e-9:
                return None
            return math.degrees(math.acos(max(-1.0, min(1.0, sum(u[k] * v[k] for k in range(3)) / (lu * lv)))))
        h = [hoek_op(i) for i in range(len(pts))]
        for i in range(len(pts)):
            if h[i] is None:
                continue
            j0 = max((j for j in range(i) if s[i] - s[j] >= boog - 1e-9), default=None)
            j1 = min((j for j in range(i + 1, len(pts)) if s[j] - s[i] >= boog - 1e-9), default=None)
            if j0 is None or j1 is None or h[j0] is None or h[j1] is None:
                continue
            k = h[i] - (h[j0] + h[j1]) / 2
            if best is None or k > best['hoek']:
                best = {'hoek': round(k, 2), 'plek': [round(v, 3) for v in pts[i]], 'bocht': round(h[i], 2)}
    return best


def richting(pts):
    """Hoofdas (eenheidsvector) en zwaartepunt van een puntenwolk."""
    n = len(pts)
    m = [sum(p[k] for p in pts) / n for k in range(3)]
    C = [[sum((p[a] - m[a]) * (p[b] - m[b]) for p in pts) for b in range(3)] for a in range(3)]
    v = [1.0, 0.3, 0.1]
    for _ in range(60):
        w = [sum(C[a][b] * v[b] for b in range(3)) for a in range(3)]
        l = sum(x * x for x in w) ** 0.5 or 1.0
        v = [x / l for x in w]
    return v, m


def doorlopend(naden, regels):
    """Lijnen die over een naad of stijl heen in elkaar horen over te lopen (gordellijn voor en achter over de B-stijl): per zijde
    de fysieke lijnen van a en van b (lijnGroepen), het paar dat elkaar het dichtst nadert, het stuk van elk binnen 'venster' m
    van die plek en de hoek tussen de twee hoofdassen. Verspringing (zwaartepunt van het stuk van b loodrecht op de lijn van a,
    in mm) als informatie."""
    uit = []
    for r in regels:
        A = [re.compile(x) for x in r['a']]
        B = [re.compile(x) for x in r['b']]
        for zijde in ('rechts', 'links'):
            ga = [g for g in lijnGroepen(naden, A, zijde) if len(g) >= 4]
            gb = [g for g in lijnGroepen(naden, B, zijde) if len(g) >= 4]
            if not ga or not gb:
                if ga or gb:
                    uit.append({'naam': r['naam'], 'soort': 'doorlopend', 'delen': r['a'] + r['b'], 'plaats': zijde, 'klasse': 'moet-aansluiten-fout',
                                'fouten': [f"lijn {'b' if ga else 'a'} niet gevonden (geen naad met minstens 4 meetpunten die bij de patronen past)"]})
                continue
            # het paar lijnen (een van a, een van b) dat elkaar het dichtst nadert, met minstens 4 punten binnen het venster aan elke kant
            d2 = lambda p, q: sum((p[k] - q[k]) ** 2 for k in range(3))
            W, keus = r.get('venster', 0.06), None
            for la in ga:
                for lb in gb:
                    ea, eb = min(((p, q) for p in la for q in lb), key=lambda pq: d2(*pq))
                    wa = [p for p in la if d2(p, ea) <= W * W]
                    wb = [p for p in lb if d2(p, eb) <= W * W]
                    if len(wa) >= 4 and len(wb) >= 4 and (keus is None or d2(ea, eb) < d2(keus[0], keus[1])):
                        keus = (ea, eb, wa, wb)
            if keus is None:
                uit.append({'naam': r['naam'], 'soort': 'doorlopend', 'delen': r['a'] + r['b'], 'plaats': zijde, 'klasse': 'moet-aansluiten-fout',
                            'fouten': ['te weinig meetpunten bij de overgang (minstens 4 aan elke kant binnen het venster)']})
                continue
            ea, eb, wa, wb = keus
            ta, ma = richting(wa)
            tb, mb = richting(wb)
            hoek = math.degrees(math.acos(min(1.0, abs(sum(ta[k] * tb[k] for k in range(3))))))
            # verspringing: zwaartepunt van b ten opzichte van de lijn door a, loodrecht op a
            d = [mb[k] - ma[k] for k in range(3)]
            t = sum(d[k] * ta[k] for k in range(3))
            versp = sum((d[k] - t * ta[k]) ** 2 for k in range(3)) ** 0.5 * 1000
            fouten = []
            if hoek > r['knikMax'] + 1e-6:
                fouten.append(f"lijnen lopen met {nl(hoek)} graden verschil in elkaar over (grens {nl(r['knikMax'])})")
            lo = [min(p[k] for p in wa + wb) for k in range(3)]
            hi = [max(p[k] for p in wa + wb) for k in range(3)]
            uit.append({'naam': r['naam'], 'soort': 'doorlopend', 'delen': r['a'] + r['b'], 'plaats': plaats(lo, hi), 'lo': lo, 'hi': hi,
                        'klasse': 'moet-aansluiten-fout' if fouten else 'moet-aansluiten-ok', 'fouten': fouten, 'hoek': round(hoek, 2),
                        'verspringing': round(versp, 1), 'afstand': round(d2(ea, eb) ** 0.5 * 1000, 1), 'punten_a': len(wa), 'punten_b': len(wb)})
    return uit


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
                   naadvulling=allow['naadvulling']['patronen'], klein=allow['klein']['patronen'], geenFacet=allow['geenFacet']['patronen'], zwarteRand=allow['zwarteRand']['patronen'], afdekkers=allow.get('afdekkers', {}).get('patronen', []),
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
            naden, facetten, vlakken, lijnen = classificeer(r, allow)
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
    alles = naden + facetten + vlakken + lijnen
    rood = [n for n in alles if n['klasse'] in ('moet-aansluiten-fout', 'natuurlijk-te-groot')]
    if uit_json:
        os.makedirs(os.path.dirname(os.path.abspath(uit_json)) or '.', exist_ok=True)
        with open(uit_json, 'w', encoding='utf-8') as f:
            json.dump({'zijde': zijde, 'duur_s': round(time.time() - t0, 1), 'meting': {k: r[k] for k in ('tijd', 'stralen', 'driehoeken', 'tel', 'kruisingen', 'scanFout', 'derde', 'los')},
                       'instellingen': cfg, 'naden': naden, 'facetten': facetten, 'doorkijkvlakken': vlakken, 'doorlopend': lijnen, 'paginafouten': fouten_pagina}, f, ensure_ascii=False, indent=1)
    tel = {}
    for n in alles:
        tel[n['klasse']] = tel.get(n['klasse'], 0) + 1
    t = r['tel']
    print(f"raster: {t['monsters']} monsters ({t['gemeten']} op de huid, {t['opbouw']} opbouw, {t['kier']} kier), {r['stralen']} stralen, {r['kruisingen']} kruisingen")
    print(f"naden: {len(naden)}, facetten: {len(facetten)}, doorkijkvlakken: {len(vlakken)}, doorlopende lijnen: {len(lijnen)}; " + ', '.join(f'{k} {v}' for k, v in sorted(tel.items())))
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

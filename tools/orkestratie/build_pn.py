"""Bouwt src/partnumbers.js en docs/onderdeelnummers.csv uit data/pn/, de canonieke, geverifieerde nummergegevens.

    python3 tools/orkestratie/build_pn.py             schrijft src/partnumbers.js en docs/onderdeelnummers.csv
    python3 tools/orkestratie/build_pn.py --check     bouwt in het geheugen en vergelijkt byte voor byte met de gecommitte
                                                      bestanden; exitcode 1 bij een verschil of een fout in de gegevens
    python3 tools/orkestratie/build_pn.py --out MAP   schrijft partnumbers.js en onderdeelnummers.csv naar MAP

Invoer (data/pn/): meta.json; units/<plak>.json (verkoopeenheden per onderzoeksplak, id -> record); map.json (pad zonder
wortel -> [eenheid, 'zelf' | 'deel' | 'set', regel]); info.json (pad -> [[label, waarde, bron, zekerheid]]); en data/tree.json
(alle paden van de boom, uit de pagina; de orkestrator ververst hem als de boom verandert).

De bouw stopt bij: een pad in map of info dat niet in de boom bestaat, een eenheid in map die niet bestaat, een eenheid die
nergens gebruikt wordt, een status buiten past, vin of nietgevonden, een gekozen uitvoering (kz) met een nummer dat niet in
de lijst van de eenheid staat, of een bron die niet met https begint. De eenmalige migraties van golf 4 en 5 (RENAME, DROP,
INHERIT, UNIT_FIX, VAR_FIX, VIN_KEUZE) zijn in de gegevens verwerkt en beschreven in data/pn/README.md; dit script voert ze
niet opnieuw uit. Het chassisnummer en het kenteken van de gebruiker staan nooit in deze gegevens.
"""
import json, os, sys, csv, io, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
DATA = os.path.join(REPO, 'data', 'pn')
ROOT = 'Renault Laguna III/'
HEADER = ("/* ===================== onderdeelnummers ===================== */\n"
          "// Gegevens, geen code. Gemaakt door de orkestrator uit de geverifieerde onderzoeksbestanden (build_pn.py); niet met de hand bewerken.\n"
          "// units: id -> { n, st: 'past' | 'vin' | 'nietgevonden', oe: [[nummer, opmerking, bewijs]], am: [[merk, nummer, opmerking, bewijs]],\n"
          "//                var, per, note, src: [[url, label]], kz }; bewijs A, B, C of D (zie het paneel).\n"
          "// kz (alleen bij een gekozen uitvoering voor de auto van de gebruiker): { o: [gekozen Renault-nummers], a: [[merk, nummer]], v: uitvoering, b: bewijs, z: zekerheid, g: grond, s: [bronnen] }.\n"
          "// map: pad zonder wortel -> [unit-id, 'zelf' | 'deel' | 'set', regel]. Een pad zonder regel is 'niet onderzocht'.\n"
          "// info: pad zonder wortel -> [[label, waarde, bron, zekerheid]] (onderhoud en bekende problemen).\n")


def load(name):
    with open(os.path.join(DATA, name), encoding='utf-8') as f:
        return json.load(f)


def build():
    meta = load('meta.json')
    tags = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(DATA, 'units', '*.json')))
    tags = (['pilot'] if 'pilot' in tags else []) + [t for t in tags if t != 'pilot']
    units = {}
    for t in tags:
        for uid, u in load(os.path.join('units', t + '.json')).items():
            if not uid.startswith(t + ':'):
                sys.exit(f'eenheid {uid} staat in het verkeerde plakbestand {t}.json')
            units[uid] = u
    pmap, info = load('map.json'), load('info.json')
    with open(os.path.join(REPO, 'data', 'tree.json'), encoding='utf-8') as f:
        paths = set(p[len(ROOT):] for p in json.load(f) if p.startswith(ROOT))
    errs = []
    for p, (uid, how, rule) in pmap.items():
        if p not in paths: errs.append(f'map: pad bestaat niet in de boom: {p}')
        if uid not in units: errs.append(f'map: eenheid bestaat niet: {uid} ({p})')
        if how not in ('zelf', 'deel', 'set'): errs.append(f'map: relatie {how} bij {p}')
    for p in info:
        if p not in paths: errs.append(f'info: pad bestaat niet in de boom: {p}')
    used = set(v[0] for v in pmap.values())
    for uid, u in units.items():
        if uid not in used: errs.append(f'eenheid wordt nergens gebruikt: {uid}')
        if u.get('st') not in ('past', 'vin', 'nietgevonden'): errs.append(f'status {u.get("st")} bij {uid}')
        for url, _ in u.get('src', []):
            if not re.match(r'^https://', url): errs.append(f'bron zonder https bij {uid}: {url}')
        kz = u.get('kz')
        if kz:
            for nr in kz.get('o', []):
                if nr not in [x[0] for x in u['oe']]: errs.append(f'kz: Renault-nummer {nr} staat niet in {uid}')
            for brand, nr in kz.get('a', []):
                if [brand, nr] not in [[x[0], x[1]] for x in u['am']]: errs.append(f'kz: {brand} {nr} staat niet in {uid}')
            if any(not re.match(r'^https://', x) for x in kz.get('s', [])): errs.append(f'kz: bron zonder https in {uid}')
    if errs:
        for e in errs[:40]: print('FOUT ' + e, file=sys.stderr)
        sys.exit(f'{len(errs)} fouten in data/pn')
    data = {'meta': meta, 'units': units, 'map': pmap, 'info': info}
    js = HEADER + 'const PN_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=';', lineterminator='\r\n')
    w.writerow(['pad', 'verkoopeenheid', 'relatie', 'status', 'soort', 'merk', 'nummer', 'bewijs', 'opmerking', 'bron', 'gekozen voor deze auto', 'uitvoering voor deze auto'])
    for p in sorted(pmap):
        uid, how, rule = pmap[p]
        u = units[uid]
        rows = [['Renault', 'Renault', x[0], x[2], x[1]] for x in u['oe']] + [['fabrikant', x[0], x[1], x[3], x[2]] for x in u['am']]
        src = u['src'][0][0] if u['src'] else ''
        kz = u.get('kz')
        if not rows:
            w.writerow([p, u['n'], how, u['st'], '', '', '', '', '', '', '', ''])
        for soort, merk, nr, lvl, note in rows:
            gek = bool(kz) and ((soort == 'Renault' and nr in kz['o']) or (soort == 'fabrikant' and [merk, nr] in kz['a']))
            w.writerow([p, u['n'], how, u['st'], soort, merk, nr, lvl, note, src, 'ja' if gek else '', kz['v'] if gek else ''])
    stats = {
        'paden_in_boom': len(paths), 'paden_met_regel': len(pmap),
        'paden_met_nummer': sum(1 for p, (uid, h, r) in pmap.items() if units[uid]['oe'] or units[uid]['am']),
        'eenheden': len(units), 'eenheden_met_keuze': sum(1 for u in units.values() if u.get('kz')),
        'nummers': sum(len(u['oe']) + len(u['am']) for u in units.values()),
        'bronnen_per_nummer': round(sum(len(u['src']) for u in units.values()) / max(1, sum(len(u['oe']) + len(u['am']) for u in units.values())), 3),
        'info_paden': len(info), 'bytes_js': len(js.encode('utf-8'))}
    return js, buf.getvalue(), stats


def main(argv):
    js, csvtxt, stats = build()
    out = REPO
    if '--out' in argv:
        out = argv[argv.index('--out') + 1]
        os.makedirs(os.path.join(out, 'src'), exist_ok=True); os.makedirs(os.path.join(out, 'docs'), exist_ok=True)
    pj, pc = os.path.join(out, 'src', 'partnumbers.js'), os.path.join(out, 'docs', 'onderdeelnummers.csv')
    if '--check' in argv:
        same_js = open(os.path.join(REPO, 'src', 'partnumbers.js'), 'rb').read() == js.encode('utf-8')
        same_csv = open(os.path.join(REPO, 'docs', 'onderdeelnummers.csv'), 'rb').read() == csvtxt.encode('utf-8')
        print(json.dumps(stats, ensure_ascii=False))
        print('partnumbers.js gelijk:', same_js, '| onderdeelnummers.csv gelijk:', same_csv)
        return 0 if same_js and same_csv else 1
    with open(pj, 'w', encoding='utf-8', newline='') as f: f.write(js)
    with open(pc, 'w', encoding='utf-8', newline='') as f: f.write(csvtxt)
    print(json.dumps(stats, ensure_ascii=False, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

"""Bouwt src/partnumbers.js en docs/onderdeelnummers.csv uit de geverifieerde nummerbestanden.

Gebruik: python3 build_pn.py <boom.json van de huidige stand> <repo>
- Leest pilot-verified.json en alle <deel>-verified.json in deze map (alleen geverifieerde uitvoer).
- Paden die niet meer bestaan worden vertaald (RENAME) of weggelaten en gemeld.
- Voegt onderhoudsinformatie toe uit ../kennis/info.json en MR_INFO (werkplaatshandboek MR 415).
"""
import json, os, sys, glob, csv, re

HERE = os.path.dirname(os.path.abspath(__file__))
tree_file, repo = sys.argv[1], sys.argv[2]
ROOT = 'Renault Laguna III/'
paths = set(t['path'][len(ROOT):] for t in json.load(open(tree_file)) if t['path'].startswith(ROOT))

# paden die door de bouw van golf 4 verhuisd zijn, met hetzelfde onderdeel
RENAME = {
    'Interieur/Stoelen/Achterbank/Middenarmsteun achter': 'Interieur/Stoelen/Achterbank/Rugleuning groot deel/Middenarmsteun achter',
}
# paden waarvan het onderdeel in deze uitvoering anders is (panoramadak, capless): records vervallen
DROP = ['Carrosserie/Carrosseriekooi/Zijwanden en dak/Dakpaneel', 'Brandstofsysteem/Vulsysteem/Tankdop', 'Interieur/Bekleding/Dakbekleding/Hemelbekleding']

MR = 'Werkplaatshandboek Renault MR 415 (X91)'
MR_INFO = {
    'Aandrijflijn/Motor F4Rt/Cilinderkop/Ontsteking': [['Bougies', '28 Nm; elektrodeafstand Champion 0,90 mm, NGK 0,85 mm (plus en min 0,05 mm)', 'MR 415, 17A-10', MR]],
    'Aandrijflijn/Motor F4Rt/Smering': [['Olie-inhoud', '5,2 l zonder filter, 5,4 l met filter', 'MR 415, 10A-105', MR], ['Aftapplug', '20 Nm', 'MR 415, 10A-105', MR]],
    'Aandrijflijn/Motor F4Rt/Distributie': [
        ['Altijd nieuw bij vervangen', 'distributieriem, spanrol, vaste rol, nokkenasdoppen, moer van de uitlaatnokkenaspoelie en bouten van de krukaspoelie', 'MR 415, 11A-50', MR],
        ['Aanhaalmomenten', 'spanrolmoer 28 Nm; vaste rol 50 Nm; nokkenaspoeliemoeren 30 Nm plus 86 graden; krukaspoeliebout 40 Nm plus 110 graden', 'MR 415, 11A-50 tot 11A-60', MR]],
    'Aandrijflijn/Motor F4Rt/Turbo en uitlaatspruitstuk/Turbocompressor': [['Bovenste turbomoer', '15 Nm plus 75 graden', 'MR 415, 12B-10', MR]],
    'Aandrijflijn/Automaatversnellingsbak': [
        ['ATF volgens MR 415', 'ELF MATIC S6; totaal 7,6 l, na aftappen 3,5 l, bijvullen 3,2 l; niveau op 40 graden met draaiende motor in P. De tabel in het handboek noemt de AJX; voor de AJ0 noemt de Elf-catalogus Elfmatic J6', 'MR 415, 23A-28 tot 23A-31', MR],
        ['Niveau- en overloopplug', '8 Nm', 'MR 415, 23A-29', MR], ['Bak aan motor', '44 Nm; koppelomvormer 22, 32, dan 44 Nm', 'MR 415, 23A-10', MR]],
    'Onderstel/Wielen': [['Wielbouten', '145 Nm bij lichtmetalen velgen (eerst 30 Nm, dan kruislings 145 Nm); 130 Nm bij stalen velgen', 'MR 415, 35A-1 tot 35A-4', MR]],
    'Onderstel/Vooras en stuurinrichting/Subframe': [['Subframe', '180 Nm; aan de carrosserie 105 en 62 Nm', 'MR 415, 31A-58', MR]],
    'Onderstel/Vooras en stuurinrichting/Stuurinrichting': [['Aanhaalmomenten', 'spoorstangkogel 37 Nm, axiale kogel 75 Nm, stuurwielbout 44 Nm', 'MR 415, 30A-18', MR]],
    'Onderstel/Achteras/Schokdemper achter links': [['Schokdemper achter', 'boven 110 Nm, onder 115 Nm', 'MR 415, 33A-18', MR]],
    'Onderstel/Achteras/Schokdemper achter rechts': [['Schokdemper achter', 'boven 110 Nm, onder 115 Nm', 'MR 415, 33A-18', MR]],
    'Carrosserie/Carrosseriekooi/Zijwanden en dak/Panoramadak': [['Afstelling', 'beweegbaar paneel 2 mm onder de daklijn; 8 mm tussen vast glas en beweegbaar paneel', 'MR 415, 52A-14 en 54A-28', MR], ['Aanhaalmomenten', 'paneelbouten 6 Nm, luchtgeleider 2 Nm', 'MR 415, 52A', MR]],
    'Carrosserie/Motorkap': [['Slot', 'slotbouten 21 Nm', 'MR 415, 52A-1', MR]],
    'Interieur/Stoelen/Achterbank': [['Rugleuningen', 'bouten 44 Nm; zijscharniermoer 25 Nm', 'MR 415, 76A-1 en 78A', MR]],
    'Interieur/Stoelen/Bestuurdersstoel': [['Stoelbouten', '35 Nm, altijd nieuwe moeren', 'MR 415, 75A', MR]],
    'Interieur/Stoelen/Passagiersstoel': [['Stoelbouten', '35 Nm, altijd nieuwe moeren', 'MR 415, 75A', MR]],
}
for s in ('links', 'rechts'):
    MR_INFO[f'Onderstel/Vooras en stuurinrichting/Wielophanging {s}voor'] = [
        ['Remklauw voor', 'geleidepennen 28 Nm, klauwdrager 105 Nm, remleiding 14 Nm', 'MR 415, 31A-7 en 31A-12', MR],
        ['Veerpoot', 'onder aan de fusee 180 Nm, nieuwe stangmoer boven 62 Nm', 'MR 415, 31A-47', MR],
        ['Draagarm', 'op het subframe 180 Nm, kogelgewricht 62 Nm', 'MR 415, 31A-55', MR],
        ['Naafmoer', '150 Nm', 'MR 415, 31A-33', MR],
        ['Remschijf voor', '296 x 26 mm, minimaal 23,4 mm; blok 17,5 mm met rugplaat', 'MR 415, 30A-16', MR]]
    MR_INFO[f'Onderstel/Achteras/Wielophanging {s}achter'] = [
        ['Remklauw achter', 'geleidepennen 32 Nm, klauwdrager 105 Nm', 'MR 415, 33A-8 en 33A-13', MR],
        ['Remschijf achter', '300 x 11 mm, minimaal 9,5 mm', 'MR 415, 30A-16', MR],
        ['Fuseedrager', '115 Nm', 'MR 415, 33A-24', MR]]

ST = {'los': 'past', 'set': 'past', 'samenstel': 'past', 'vin': 'vin', 'niet_gevonden': 'nietgevonden', 'niet_los': 'nietgevonden'}
HOW = {'zelf': 'zelf', 'deel_van': 'deel', 'set': 'set'}

units, pmap, report = {}, {}, {'files': [], 'missing_paths': [], 'renamed': [], 'dropped': [], 'dup_paths': []}
files = [os.path.join(HERE, 'pilot-verified.json')] + sorted(f for f in glob.glob(os.path.join(HERE, '*-verified.json')) if not f.endswith('pilot-verified.json'))
for f in files:
    if not os.path.exists(f):
        continue
    d = json.load(open(f))
    tag = os.path.basename(f).replace('-verified.json', '')
    report['files'].append(f'{tag}: {len(d.get("units", []))} eenheden, {len(d.get("map", []))} paden')
    idmap = {}
    for u in d.get('units', []):
        uid = f'{tag}:{u["id"]}'
        idmap[u['id']] = uid
        oe = [[x['nr'], x.get('note', ''), x.get('lvl', '')] for x in u.get('oe', [])]
        am = [[x['brand'], x['nr'], x.get('note', ''), x.get('lvl', '')] for x in u.get('am', [])]
        st = ST.get(u.get('kind'), 'nietgevonden')
        if st == 'past' and not (oe or am):
            st = 'nietgevonden'
        rec = {'n': u.get('name', ''), 'st': st, 'oe': oe, 'am': am}
        if u.get('var'): rec['var'] = u['var']
        if u.get('per'): rec['per'] = u['per']
        note = u.get('note', '')
        if note: rec['note'] = note
        src = []
        for s in u.get('src', []):
            url = s.get('url', '')
            if re.match(r'^https?://', url) and url not in [x[0] for x in src]:
                host = re.sub(r'^https?://(www\.)?', '', url).split('/')[0]
                src.append([url, host])
        rec['src'] = src
        units[uid] = rec
    for m in d.get('map', []):
        p = m['path']
        p = p[len(ROOT):] if p.startswith(ROOT) else p
        if any(p == x or p.startswith(x + '/') for x in DROP):
            report['dropped'].append(p); continue
        if p in RENAME:
            report['renamed'].append(p); p = RENAME[p]
        if p not in paths:
            report['missing_paths'].append(p); continue
        if p in pmap:
            report['dup_paths'].append(p)
        uid = idmap.get(m['unit'])
        if not uid:
            report['missing_paths'].append(p + ' (eenheid ' + m['unit'] + ' ontbreekt)'); continue
        pmap[p] = [uid, HOW.get(m['how'], 'zelf'), m.get('rule', '')]

# onderhoudsinformatie: kennisbasis (gebruikersrapport, verwerkt) en MR 415
info = {}
kfile = os.path.join(HERE, '..', 'kennis', 'info.json')
if os.path.exists(kfile):
    for e in json.load(open(kfile)):
        p = e['path'][len(ROOT):] if e['path'].startswith(ROOT) else e['path']
        if p in RENAME: p = RENAME[p]
        if p not in paths:
            report['missing_paths'].append('info: ' + p); continue
        info.setdefault(p, []).extend([list(x) + [''] * (4 - len(x)) for x in e['info']])
for p, rows in MR_INFO.items():
    if p not in paths:
        report['missing_paths'].append('mr-info: ' + p); continue
    info.setdefault(p, []).extend(rows)

used = set(v[0] for v in pmap.values())
units = {k: v for k, v in units.items() if k in used}
meta = {'vehicle': 'Renault Laguna III hatchback (BT0/1) 2.0 16V Turbo 170 pk, F4R 811, automaat AJ0', 'tecdoc': 23370,
        'checked': '15 oktober 2026', 'note': 'Nummers gecontroleerd tegen opnieuw opgehaalde catalogusbronnen; controleer altijd op chassisnummer.'}
data = {'meta': meta, 'units': units, 'map': pmap, 'info': info}
js = ("/* ===================== onderdeelnummers ===================== */\n"
      "// Gegevens, geen code. Gemaakt door de orkestrator uit de geverifieerde onderzoeksbestanden (build_pn.py); niet met de hand bewerken.\n"
      "// units: id -> { n, st: 'past' | 'vin' | 'nietgevonden', oe: [[nummer, opmerking, bewijs]], am: [[merk, nummer, opmerking, bewijs]],\n"
      "//                var, per, note, src: [[url, label]] }; bewijs A, B of C (zie het paneel).\n"
      "// map: pad zonder wortel -> [unit-id, 'zelf' | 'deel' | 'set', regel]. Een pad zonder regel is 'niet onderzocht'.\n"
      "// info: pad zonder wortel -> [[label, waarde, bron, zekerheid]] (onderhoud en bekende problemen).\n"
      "const PN_DATA = " + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ";\n")
open(os.path.join(repo, 'src', 'partnumbers.js'), 'w', encoding='utf-8').write(js)

with open(os.path.join(repo, 'docs', 'onderdeelnummers.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh, delimiter=';')
    w.writerow(['pad', 'verkoopeenheid', 'relatie', 'status', 'soort', 'merk', 'nummer', 'bewijs', 'opmerking', 'bron'])
    for p in sorted(pmap):
        uid, how, rule = pmap[p]
        u = units[uid]
        rows = [['Renault', 'Renault', x[0], x[2], x[1]] for x in u['oe']] + [['fabrikant', x[0], x[1], x[3], x[2]] for x in u['am']]
        src = u['src'][0][0] if u['src'] else ''
        if not rows:
            w.writerow([p, u['n'], how, u['st'], '', '', '', '', '', ''])
        for soort, merk, nr, lvl, note in rows:
            w.writerow([p, u['n'], how, u['st'], soort, merk, nr, lvl, note, src])

nparts = len([1 for p in paths])
st = {}
for p, (uid, how, rule) in pmap.items():
    st[units[uid]['st']] = st.get(units[uid]['st'], 0) + 1
withnum = sum(1 for p, (uid, h, r) in pmap.items() if units[uid]['oe'] or units[uid]['am'])
print(json.dumps({'paden_in_boom': nparts, 'paden_met_regel': len(pmap), 'paden_met_nummer': withnum, 'status_per_pad': st,
                  'eenheden': len(units), 'eenheden_met_oe': sum(1 for u in units.values() if u['oe']),
                  'eenheden_met_2_merken': sum(1 for u in units.values() if len(set(x[0] for x in u['am'])) >= 2),
                  'nummers': sum(len(u['oe']) + len(u['am']) for u in units.values()),
                  'info_paden': len(info), 'bytes': len(js)}, ensure_ascii=False, indent=1))
print(json.dumps({k: (v if k == 'files' else v[:15]) for k, v in report.items()}, ensure_ascii=False, indent=1))

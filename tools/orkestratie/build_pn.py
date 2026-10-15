"""Bouwt src/partnumbers.js en docs/onderdeelnummers.csv uit de geverifieerde nummerbestanden.

Gebruik: python3 build_pn.py <boom.json van de huidige stand> <repo>
- Leest pilot-verified.json en alle <deel>-verified.json in deze map (alleen geverifieerde uitvoer).
- Paden die niet meer bestaan worden vertaald (RENAME) of weggelaten en gemeld.
- Voegt onderhoudsinformatie toe uit ../kennis/info.json en MR_INFO (werkplaatshandboek MR 415).
- VIN_KEUZE legt per verkoopeenheid vast welke uitvoering voor de auto van de gebruiker is gekozen (volgens de RDW en het
  chassisnummer van de gebruiker). Het chassisnummer en het kenteken staan nooit in de repo; alleen de afgeleide feiten.
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

# delen die na het nummeronderzoek uit een bestaand onderdeel zijn gesplitst (herstelronde 2): zelfde verkoopeenheid als de ouder
INHERIT = {
    'Brandstofsysteem/Vulsysteem/Tankklep/Tankklep buitenkant': ('Brandstofsysteem/Vulsysteem/Tankklep', 'Buitenkant van de tankklep, met de klep geleverd'),
    'Brandstofsysteem/Vulsysteem/Tankklep/Tankklep binnenzijde': ('Brandstofsysteem/Vulsysteem/Tankklep', 'Binnenzijde van de tankklep, met de klep geleverd'),
    'Carrosserie/Carrosseriekooi/Zijwanden en dak/Panoramadak/Luchtgeleider/Luchtgeleiderblad': ('Carrosserie/Carrosseriekooi/Zijwanden en dak/Panoramadak/Luchtgeleider', 'Blad van de luchtgeleider'),
    'Carrosserie/Carrosseriekooi/Zijwanden en dak/Panoramadak/Luchtgeleider/Armen luchtgeleider': ('Carrosserie/Carrosseriekooi/Zijwanden en dak/Panoramadak/Luchtgeleider', 'Armen van de luchtgeleider'),
    'Carrosserie/Motorkap/Ruitensproeier links/Sproeieropening': ('Carrosserie/Motorkap/Ruitensproeier links', 'Opening in de sproeierkop'),
    'Carrosserie/Motorkap/Ruitensproeier rechts/Sproeieropening': ('Carrosserie/Motorkap/Ruitensproeier rechts', 'Opening in de sproeierkop'),
    # herstelronden golf 5: alleen waar de ouder zelf een verkoopeenheid heeft en het deel daar feitelijk bij hoort
    'Aandrijflijn/Motor F4Rt/Cilinderkop/Kleppendeksel/Vulopening': ('Aandrijflijn/Motor F4Rt/Cilinderkop/Kleppendeksel/Deksel', 'Vulopening in het kleppendeksel, met het deksel geleverd; de olievuldop is een eigen onderdeel'),
    'Brandstofsysteem/Vulsysteem/Vulklepring': ('Brandstofsysteem/Vulsysteem/Vulhals', 'Ring om de vulklep, onderdeel van de capless vulhals met klepje; de vulhals is niet als artikel gevonden'),
}
# Bewust niet gekoppeld, blijven op niet onderzocht (punt 13 van de handomdraai). Een deel erft alleen van een ouder die zelf een
# verkoopeenheid heeft en waarvan vaststaat dat het deel daarmee geleverd wordt:
#   Interieur/Middenconsole/Armsteun middenconsole/Armsteunbekleding: de ouder en de hele groep zijn niet onderzocht; er is
#     geen eenheid om aan te koppelen.
#   Interieur/Bekleding/Dakbekleding/A-stijlbekleding links en rechts: de ouder is niet onderzocht. De A-stijlbekleding is een
#     bekleding van de stijl en geen deel van de hemel; een eenheid van de hemel erover leggen is dus niet onderbouwd.
#   Interieur/Bekleding/Bagageruimte/Hoedenplankkoord links en rechts: Hoedenplank en Bagageruimte zijn niet onderzocht; of het
#     koord los of met de plank wordt geleverd is niet vastgesteld.
#   Interieur/Bekleding/Bagageruimte/Plankscharnierpen links en rechts: idem; de pennen zitten in de zijbekleding en niet in de
#     plank, dus de plank is hier niet de ouder in leveringsopzicht.
#   Brandstofsysteem/Vulsysteem/Vulklep: niet in de lijst van punt 13 en zonder eigen onderzoek; blijft staan.
for p, (par, rule) in INHERIT.items():
    if p in paths and p not in pmap and par in pmap:
        pmap[p] = [pmap[par][0], 'deel', rule]

# Keuzes voor de auto van de gebruiker. Grondslag: de gegevens van de RDW (opendata.rdw.nl, op het kenteken dat de gebruiker opgaf) en het
# VIN-onderzoek van het chassisnummer van de gebruiker. Beide staan hier alleen als afgeleid feit; het chassisnummer en het kenteken zelf
# komen nooit in de repo. De status van de eenheid ('vin') blijft zoals de catalogus hem geeft; de keuze komt erbij als veld 'kz':
#   o: Renault-nummers uit de lijst van de eenheid die gekozen zijn      a: [merk, nummer] uit de lijst die gekozen zijn
#   v: uitvoering   b: bewijsniveau (A tot D, zoals in de lijsten)   z: zekerheid van de keuze   g: grond   s: bronnen (https)
# Elk gekozen nummer moet letterlijk in de lijst van de eenheid staan, anders stopt de bouw. Niet overgenomen zijn de vier
# gedeeltelijke keuzes van het VIN-onderzoek, op de voorkatalysator na (nu beslist door het emissieniveau van de RDW): bij het
# toerentalsensor-ingaand staat de uitvoering al in de eenheid en blijft het nummer open; bij de vrijloopoelie van de dynamo en de
# aandrijfas rechts is de keuze alleen waarschijnlijk.
AUTODOC = 'https://www.autodoc.parts/spares/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo'
G_DATUM = 'Volgens de RDW is de auto op 18 februari 2011 voor het eerst toegelaten en dus voor 07/2011 gebouwd.'
G_BOUW = ('Volgens de RDW is de auto op 18 februari 2011 voor het eerst toegelaten. Het chassisnummer van de gebruiker, vergeleken met openbare '
          'chassisnummerbladen van andere Laguna III, wijst op bouw rond begin 2011 (afleiding, niveau C); de RDW-datum valt daarin.')
G_BAK = ('Zestraps automaat AJ0 volgens het chassisnummer van de gebruiker (negende teken E, afgeleid uit vier andere auto\'s met AJ0); '
         'de RDW noemt de bak niet.')
VIN_KEUZE = {
    'S1-motor-service:U_TENS': dict(a=[('RIDEX', '308T0113'), ('SKF', 'VKM 16550')], v='Spanrol voor een auto die voor 07/2011 is gebouwd (diameter 66 mm)',
        b='A', z='hoog', s=[AUTODOC], g=G_DATUM + ' Autodoc geeft deze twee spanrollen tot 07/2011. Het Renault-nummer per uitvoering staat niet in de bron; de OE-lijst blijft breed.'),
    'S1-motor-service:U_IDLER': dict(a=[('SKF', 'VKM 26105')], v='Geleiderol voor een auto die voor 07/2011 is gebouwd (binnendiameter 17 mm)',
        b='A', z='hoog', s=[AUTODOC], g=G_DATUM + ' Autodoc splitst de geleiderol op 07/2011: VKM 26105 tot, VKM 26020 vanaf die datum. Het Renault-nummer per uitvoering staat niet in de bron.'),
    'S1-motor-service:U_ALT': dict(a=[('AS-PL', 'A3169')], v='Dynamo met vaste poelie (diameter 49 mm), transmissiecode AJ0',
        b='A', z='middel', s=[AUTODOC], g=G_BAK + ' Van de twee dynamo-uitvoeringen in de Autodoc-lijst noemt alleen AS-PL A3169 de transmissiecode AJ0. AS-PL A3800S (vrijloopoelie) noemt geen bak en is dus niet uitgesloten.'),
    'S1-motor-service:U_PSPUMP': dict(a=[('RIDEX', '12H0601')], v='Hydraulische, riemgedreven stuurpomp (geen elektro-hydraulische)',
        b='B', z='middel', s=['https://www.ultimatespecs.com/car-specs/Renault/137858/Renault-Laguna-3-Coupe-Phase-2-20T-170-Auto.html', 'https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2011-UK.pdf'],
        g='De RDW noemt benzine, 1998 cc en 125 kW; dat past bij de 2.0 turbo F4R. Bij de F4R en de M9R is de stuurbekrachtiging hydraulisch met variabele assistentie; een elektropomp hoort bij de M4R en de K9K (persmap en specificaties van de fase-2 2.0T 170 automaat). De Autodoc-lijst noemt beide soorten omdat het type alle bouwjaren omvat.'),
    'S1-motor-service:U_AC': dict(a=[('VALEO', '813180')], v='Compressor DCS17E, opgave 6-traps automaat',
        b='A', z='middel', s=[AUTODOC], g=G_BAK + ' Alleen VALEO 813180 noemt de automaat; MAHLE ACP 504 000P en ELSTOCK 51-1505 (DCS17EC) noemen geen bak en zijn niet uitgesloten.'),
    'S2-lucht-uitlaat-brandstof:U_IAT': dict(a=[('MAGNETI MARELLI', '230016073067')], v='Sensor NTC met 2 pinnen, uitvoering vanaf 11/2010',
        b='A', z='middel', s=[AUTODOC], g=G_BOUW + ' De uitvoeringen tot 11/2010 (VALEO 255600, QUINTON HAZELL XEMS202, INTERMOTOR 55714) vallen af. De overige drie artikelen (MAGNETI MARELLI, VEMO, FACET) noemen alle de F4R 811; VEMO V42-72-0025 en FACET 10.4005 zijn dus niet uitgesloten. Het Renault-nummer is niet uniek (drie nummers in de OE-lijst).'),
    'S2-lucht-uitlaat-brandstof:U_INJ': dict(o=['8200058379'], a=[('MAGNETI MARELLI', '805001399403'), ('MEAT & DORIA', '75112098'), ('ENGITECH', 'ENT900023')], v='Meerpuntsinjector, 2 pinnen, uitvoering vanaf 11/2010',
        b='B', z='middel', s=[AUTODOC], g=G_BOUW + ' VALEO 348279 geldt tot 11/2010 en valt af. De overige artikelen verwijzen naar OE 8200058379; de dCi-injector 7701065103 is al geschrapt.'),
    'S2-lucht-uitlaat-brandstof:U_RAD': dict(o=['214100005R', '214100052R'], a=[('PRASCO', 'RN086R002')], v='Radiateur voor automaat met bakoliekoeler, 690 x 367 x 34 mm',
        b='A', z='middel', s=[AUTODOC], g=G_BAK + ' AVA RT2418 heeft dezelfde maat en SRLine 603908-2 (686 x 363 x 32 mm) noemt ook de automaat; die zijn niet uitgesloten. De OE-nummers staan bij PRASCO RN086R002 (automaat) en ook bij NISSENS 637603 zonder bakopgave.'),
    'S2-lucht-uitlaat-brandstof:U_IC': dict(o=['144960001R'], a=[('AKS DASIS', '187022N'), ('RIDEX', '468I0086'), ('NISSENS', '96625')], v='Laadluchtkoeler voor automaat, 650 x 112 x 108 mm',
        b='B', z='middel', s=[AUTODOC], g=G_BAK + ' De eenheid bevat alleen automaatartikelen, met een enkel Renault-nummer. Artikelen zonder bakopgave staan niet in de lijst en zijn niet uitgesloten.'),
    'S2-lucht-uitlaat-brandstof:U_CAT': dict(o=['208A00750R', '8201057861'], a=[('HELLA', '8LE 366 053-321')], v='Voorkatalysator Euro 5',
        b='A', z='middel', s=['https://www.autodoc.parts/hella/18747734', 'https://www.autodoc.parts/car-parts/catalyst-converter-10147/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo'],
        g=('De RDW noemt voor deze auto het emissieniveau EURO 5 A (715/2007*692/2008A). In de bron is HELLA 8LE 366 053-321 het enige artikel dat Euro 5 noemt; RIDEX 429C0773 en WALKER 20778 zijn Euro 4 en VEGAZ RK-832 en BOSAL 090-654 Euro 3, en vallen af. '
           'Het Renault-nummer is niet uniek: de OE-lijst van HELLA noemt 208A00750R en 8201057861 en de bron noemt 8200888365 als alternatief. BM CATALYSTS BM92048H (niveau C) noemt de Euro-klasse niet. '
           'Het werkplaatshandboek MR 415 geeft Euro 5 alleen bij de F4R 813 en bij de 811 alleen Euro 4; het motorsuffix van de auto is daarmee niet bevestigd. Controleer het motorplaatje.')),
    'S3a-vooras-aandrijving:U_DS_L': dict(o=['8200687910'], v='Aandrijfas links voor automaat, 640 tot 642 mm',
        b='B', z='middel', s=[AUTODOC], g=G_BAK + ' Het nummer staat in de OE-lijsten van POINT GEAR PNG72589, EAI T49257, LPR DS52419 en GSP 201268. Het verschil tussen 640 en 642 mm is een merkverschil bij hetzelfde Renault-nummer. Of de binnenste homokineet 6 of 8 kogels heeft, is niet beslist (GSP 250626 en GSP 201268).'),
    'S3a-vooras-aandrijving:U_DISC': dict(o=['402060002R'], a=[('ATE', '24.0126-0158.1'), ('RIDEX', '82B0504')], v='Remschijf voor 296 x 26 mm, geventileerd; de maten 280 x 24 en 320 x 28 zijn uitgesloten',
        b='B', z='hoog', s=['https://www.ultimatespecs.com/car-specs/Renault/137858/Renault-Laguna-3-Coupe-Phase-2-20T-170-Auto.html', 'https://www.autodoc.parts/car-parts/brake-disc-10132/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo'],
        g='De maat volgt uit de motor: voor de F4R geeft het werkplaatshandboek MR 415 (30A-16) 296 x 26 mm; 320 x 28 hoort bij de 175 en 180 pk diesels en de GT. De RDW noemt benzine en 125 kW. De auto heeft geen vierwielbesturing (4Control), volgens de gebruiker; ZIMMERMANN 470.2432.20 geldt zonder dat systeem. Het nummer 402060002R staat in de OE-lijst van twee fabrikanten (ATE en RIDEX); de vier andere Renault-nummers staan alleen bij RIDEX en zijn niet uitgesloten.'),
    'S4-carrosserie-elektra-interieur:U_WBLADE_R': dict(o=['287900001R'], v='Wisserblad achter, 475 mm waarschijnlijk (niveau C)',
        b='B', z='middel', s=[AUTODOC], g=G_BOUW + ' De 500 mm-bladen van RIDEX, VALEO en SWF gelden volgens Autodoc tot 11/2010 en vallen af. Het nummer 287900001R staat bij het 475 mm-blad en bij het oude 500 mm-blad, dus het nummer is bepaald. De lengte 475 mm is een afleiding.'),
    'S4-carrosserie-elektra-interieur:U_WMOTOR_R': dict(o=['287100004R'], a=[('MAGNETI MARELLI', '064073400010')], v='Achterwissermotor voor een linksgestuurde auto',
        b='B', z='middel', s=[AUTODOC], g='MAGNETI MARELLI 064073400010 noemt linksgestuurd en OE 287100004R. Volgens de RDW is de auto op 18 februari 2011 voor het eerst in Nederland toegelaten; een nieuw in Nederland geleverde Laguna is linksgestuurd (aanname, de RDW noemt de stuurzijde niet). 287100006R (SANDO SWM10314.1) noemt geen stuurzijde en blijft een mogelijk alternatief.'),
}
# teksten in de variant van een eenheid die na de keuze niet meer kloppen: (eenheid, oude tekst, nieuwe tekst)
VAR_FIX = [
    ('S2-lucht-uitlaat-brandstof:U_CAT', 'Voor een 2011 is Euro 5 aannemelijk, niet bevestigd.', 'Volgens de RDW heeft de auto Euro 5 A.'),
    ('S4-carrosserie-elektra-interieur:U_WMOTOR_R', 'Welk nummer bij deze auto hoort is niet vastgesteld.', 'Voor deze auto is 287100004R gekozen (zie Gekozen voor deze auto).'),
]
for uid, k in VIN_KEUZE.items():
    u = units.get(uid)
    if u is None:
        sys.exit('VIN_KEUZE: eenheid ontbreekt: ' + uid)
    if u['st'] != 'vin':
        sys.exit('VIN_KEUZE: eenheid heeft status ' + u['st'] + ' en niet vin: ' + uid)
    for nr in k.get('o', []):
        if nr not in [x[0] for x in u['oe']]:
            sys.exit(f'VIN_KEUZE: Renault-nummer {nr} staat niet in {uid}')
    for brand, nr in k.get('a', []):
        if [brand, nr] not in [[x[0], x[1]] for x in u['am']]:
            sys.exit(f'VIN_KEUZE: {brand} {nr} staat niet in {uid}')
    if not k.get('o') and not k.get('a') and not k.get('v'):
        sys.exit('VIN_KEUZE: lege keuze ' + uid)
    if any(not re.match(r'^https://', x) for x in k['s']):
        sys.exit('VIN_KEUZE: bron zonder https in ' + uid)
    u['kz'] = {'o': k.get('o', []), 'a': [list(x) for x in k.get('a', [])], 'v': k['v'], 'b': k['b'], 'z': k['z'], 'g': k['g'], 's': k['s']}
for uid, old, new in VAR_FIX:
    if uid in units:
        if old not in units[uid].get('var', ''):
            sys.exit('VAR_FIX: tekst niet gevonden in ' + uid)
        units[uid]['var'] = units[uid]['var'].replace(old, new)

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

# correcties van de orkestrator op namen uit het onderzoek (tegen het werkplaatshandboek)
UNIT_FIX = {
    'S4-carrosserie-elektra-interieur:U_BONNET': ('Motorkap (kaal)', 'De originele kap is volgens het werkplaatshandboek MR 415 (48A) van aluminium; het materiaal van de kappen van andere merken is niet vastgesteld.'),
}
for uid, (name, add) in UNIT_FIX.items():
    if uid in units:
        units[uid]['n'] = name
        units[uid]['note'] = (units[uid].get('note', '') + ' ' + add).strip()

used = set(v[0] for v in pmap.values())
units = {k: v for k, v in units.items() if k in used}
nkz = len(VIN_KEUZE)
meta = {'vehicle': 'Renault Laguna III hatchback (BT0/1) 2.0 16V Turbo 170 pk, F4R 811, automaat AJ0', 'tecdoc': 23370,
        'checked': '14 en 15 oktober 2026',
        'note': 'Nummers met bewijs A tot C gecontroleerd tegen opnieuw opgehaalde catalogusbronnen; D komt alleen uit een advertentie. '
                f'Bij {nkz} verkoopeenheden is de uitvoering voor deze auto gekozen, volgens de RDW en het chassisnummer van de gebruiker (blok Gekozen voor deze auto); '
                'bij alle andere varianten is dat niet gedaan. Controleer altijd op chassisnummer.',
        'auto': 'Volgens de RDW: Renault Laguna hatchback, benzine, 1998 cc, 125 kW, eerste toelating 18 februari 2011 in Nederland, emissieniveau EURO 5 A. '
                'Het motorsuffix (811 of 813) en de bouwmaand noemt de RDW niet.'}
data = {'meta': meta, 'units': units, 'map': pmap, 'info': info}
js = ("/* ===================== onderdeelnummers ===================== */\n"
      "// Gegevens, geen code. Gemaakt door de orkestrator uit de geverifieerde onderzoeksbestanden (build_pn.py); niet met de hand bewerken.\n"
      "// units: id -> { n, st: 'past' | 'vin' | 'nietgevonden', oe: [[nummer, opmerking, bewijs]], am: [[merk, nummer, opmerking, bewijs]],\n"
      "//                var, per, note, src: [[url, label]], kz }; bewijs A, B, C of D (zie het paneel).\n"
      "// kz (alleen bij een gekozen uitvoering voor de auto van de gebruiker): { o: [gekozen Renault-nummers], a: [[merk, nummer]], v: uitvoering, b: bewijs, z: zekerheid, g: grond, s: [bronnen] }.\n"
      "// map: pad zonder wortel -> [unit-id, 'zelf' | 'deel' | 'set', regel]. Een pad zonder regel is 'niet onderzocht'.\n"
      "// info: pad zonder wortel -> [[label, waarde, bron, zekerheid]] (onderhoud en bekende problemen).\n"
      "const PN_DATA = " + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ";\n")
open(os.path.join(repo, 'src', 'partnumbers.js'), 'w', encoding='utf-8').write(js)

with open(os.path.join(repo, 'docs', 'onderdeelnummers.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh, delimiter=';')
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

nparts = len([1 for p in paths])
st = {}
for p, (uid, how, rule) in pmap.items():
    st[units[uid]['st']] = st.get(units[uid]['st'], 0) + 1
withnum = sum(1 for p, (uid, h, r) in pmap.items() if units[uid]['oe'] or units[uid]['am'])
ust, lvl = {}, {}
for u in units.values():
    ust[u['st']] = ust.get(u['st'], 0) + 1
    for x in u['oe']: lvl[x[2]] = lvl.get(x[2], 0) + 1
    for x in u['am']: lvl[x[3]] = lvl.get(x[3], 0) + 1
merken = set(x[0] for u in units.values() for x in u['am'])
print(json.dumps({'paden_in_boom': nparts, 'paden_met_regel': len(pmap), 'paden_met_nummer': withnum, 'status_per_pad': st,
                  'eenheden': len(units), 'status_per_eenheid': ust, 'eenheden_met_keuze': sum(1 for u in units.values() if u.get('kz')),
                  'paden_zonder_regel': nparts - len(pmap),
                  'eenheden_met_oe': sum(1 for u in units.values() if u['oe']),
                  'eenheden_met_2_merken': sum(1 for u in units.values() if len(set(x[0] for x in u['am'])) >= 2),
                  'nummers': sum(len(u['oe']) + len(u['am']) for u in units.values()),
                  'nummers_renault': sum(len(u['oe']) for u in units.values()), 'nummers_andere_merken': sum(len(u['am']) for u in units.values()),
                  'andere_merken': len(merken), 'bewijs': dict(sorted(lvl.items())),
                  'info_paden': len(info), 'bytes': len(js)}, ensure_ascii=False, indent=1))
print(json.dumps({k: (v if k == 'files' else v[:15]) for k, v in report.items()}, ensure_ascii=False, indent=1))

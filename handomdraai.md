# Handomdraai laguna3

Stand 16 okt 2026, 02:10 UTC. Golf 5 (de verbeterpunten uit de vorige handomdraai) is af en staat live als versie 7. `main` staat nog op versie 6.

## Waar

- Repo `rvd-gmpplus/laguna3`, tak `ccr-bd755431-1qfniw`. Code van de eindstand: `33b2b50`. `index.html` van versie 7 gebouwd uit die bron in `25c3ddf`; de commits daarna zijn alleen docs.
- PR #1 (carrosserieronde) en PR #2 (golf 4) zijn samengevoegd. PR #2 sloot op 15 oktober om 18:22 UTC doordat `main` met een fast-forward naar de kop van de tak ging. Voor golf 5 hoort een nieuwe PR.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR, versie 7, gepubliceerd op 16 oktober om 02:02 UTC. Teruggelezen: `index.html` (1.378.969 bytes, md5 `faca1a6c384df897149fd5a6538dcaaa`) staat er een keer in, byte voor byte gelijk, met 531 bytes hostskelet ervoor en 15 erna. Het artefact is privé; delen gaat via het menu Delen op de pagina.
- GitHub Pages: https://rvd-gmpplus.github.io/laguna3/, bediend vanaf `main`. `main` staat op `f3a7854` (versie 6, op 15 oktober nagekeken: byte voor byte gelijk aan `index.html` van versie 6). Versie 7 naar `main` gaat pas na een ja van de gebruiker.
- De tak `gh-pages` bestond nog op origin; de gebruiker verwijdert hem in GitHub (de proxy weigerde het verwijderen).
- Bouwen: `python3 build.py` plakt `src/*.js` tot `index.html`, volgorde in `ORDER` in `build.py`. `src/partnumbers.js` is gegevens uit `tools/orkestratie/build_pn.py`; niet met de hand bewerken (zie Werkwijze voor hoe het script draait).

## De auto van de gebruiker

- Renault Laguna III hatchback, Initiale Paris, fase 2, zilvergrijs, 2.0 Turbo 125 kW met zestraps automaat AJ0, panoramadak, geen 4Control (opgave van de gebruiker).
- Volgens de RDW: eerste toelating 18 februari 2011, benzine 1998 cc, EURO 5 A, 8,7 l/100 km, 201 g/km, spoor voor 156 cm en achter 151 cm. De RDW geeft geen bandenmaat en geen motorsuffix.
- Motor waarschijnlijk F4Rt 813: MR 415 geeft bij de hatchback de F4R 811 alleen Euro 4 en de 813 ook Euro 5. Het motorplaatje beslist. Zie `docs/onderzoek/beslissingen.md`.
- Kenteken en chassisnummer zijn bekend in de sessie maar staan bewust niet in de repo (openbaar). De docs zeggen "volgens de RDW" of "volgens het chassisnummer van de gebruiker".

## Wat werkt

- Boom (`g5final3`): 3.023 knopen, 499 groepen, 2.524 onderdelen, 668.020 driehoeken (budget 700.000). Carrosserie 189.446 (budget 190.000, nog ruim 500), Aandrijflijn 235.546, Onderstel 113.228, Interieur 81.084. Tekenopdrachten 444 gebundeld, 1.878 zonder bundelen.
- Uitklappen zoals voorheen, plus U19: bij duiken naar een onderdeel dimt de rest.
- Modus Openen met 26 openers. Nieuw in golf 5: camera's van achterklep, motorkap, voorportieren, spiegels, zonneschermen en de interieuropeners; hoedenplank op 40 graden aan dunne koordjes en uitgenomen zolang een rugleuning of de bagagevloer open is (optie `hideWhen` in de engine); gasveren langs de zijwand; achterruit van binnen als glas; olievuldop en expansiedop scharnieren aan de hals; voorruit van binnen doorzichtiger; zijbekleding in de bagageruimte over wielkasten en vulpijp.
- Panoramadak: glas zo goed als zwart (dekking 0,92, zoals de auto van de gebruiker), van binnen blauwgrijs met een lichte weerspiegeling en zwarte binnenlijsten.
- Onderkant: voorste langsliggers boven de aandrijfassen, achterste langsliggers langs de veer, bodemplaat met opkant boven de torsiebalk, tank en koolstoffilter voor de balk, ATF-koeler lager, multiriem 1.672 mm (echt 1.795 mm).
- Telefoon: staand een schuivende presetrij, compacte kaart, de openerlijst sluit na een keuze en het kader volgt kaart en dock; liggend een zijkolom.
- Onderdeelnummers: 546 verkoopeenheden, 1.334 nummers. Voor 13 eenheden staat de uitvoering voor deze auto vast (blok Gekozen voor deze auto, volgens de RDW en het chassisnummer); 58 varianten blijven open. Punt 13: Vulopening en Vulklepring gekoppeld, de overige nieuwe knopen bewust op niet onderzocht.
- Feiten bijgewerkt: verbruik en CO2 volgens de RDW, emissienorm Euro 5, ATF 7,6 l (Elfmatic J6; het handboek van 2009 noemt ELF MATIC S6), motorcode, geen 4Control. Analyse databankenrecht in `docs/onderzoek/databankenrecht.md`.
- Hulpmiddelen van de poort staan nu in de repo: `tools/orkestratie/` (pick, shots, probe, gateshots, dumptree, phone, rays_bagage, poort.js).

## Tests

Eindstand `g5final3` op `33b2b50`, alles groen: lint ok; smoke zonder consolemeldingen en zonder horizontale scroll; integrity 0 fouten (124 waarschuwingen uitklapvector nul); silhouette ok; `ui_inner.py --open` ok; `ITEST_GATES=1 tools/itest.py` 155 van 155; opentest 26 openers, 0 fouten, 33 meldingen (open.min ontbreekt bij volgers); pubsmoke ok.

Visuele poort golf 5, telkens 9 beoordelaars op dezelfde kenmerken K1 tot K13 (`tools/orkestratie/poort.js`, beelden met `gateshots.py`): poort 1 op `f581bca` 11 ja, 6 deels, 0 nee; poort 2 op `b529ac1` 12, 4, 1 (K13, door een slechte vaste binnencamera); poort 3 op `33b2b50` 13, 4, 0. Ter vergelijking versie 6: 10, 7, 0. S7 (exterieur, carrosserieronde) opnieuw gedraaid: 7 van 9 ja, gehaald. Na poort 3 gestopt: geen nee en niets blokkerend meer.

Let op bij het lezen van poort 3: de binnencamera van het dak (92 en 93) kijkt met 70 graden beeldhoek (was 36) om beide openingen in een beeld te krijgen. Dat is alleen het poortbeeld; de app gebruikt zijn eigen camera.

## Wat nog verbetering verdient

Op volgorde van wat de gebruiker het eerst ziet. Beeldnummers verwijzen naar `g5gate3/` in het scratchpad (vluchtig).

### Modus Openen, wat poort 3 op deels liet staan

1. Hoedenplank bij de achterklep (K6, alle drie; 05, 95-telefoon-achterklep): de plank gaat 40 graden mee, maar van achteren en van boven leest hij nog als vlak liggend. Aanpak: de camera van de achterklep meer van opzij, of de plank aan de koordjes verder omhoog als de zijwanden dat toelaten (meten met `rays_bagage.py`).
2. Linker gasveer van de achterklep (05, 95): valt samen met de zijrand en leest dun. Aanpak: iets dikker of een lichtere kleur, of de camera iets naar rechts.
3. Zijbekleding van de bagageruimte (18, 20, 23): leest trapvormig, als losse blokken. Oorzaak: de bekleding moet boven het zwaaibereik van de klapbare vloer blijven en de vulpijp omsluiten. Aanpak: de vulpijp in `src/systems.js` korter onder de bekleding laten lopen (de interieuragent stelde dat voor), dan kan de bekleding een gladde wand worden.
4. Camera handschoenenkastje (16): dicht op het dashboard, het portier is niet in beeld. Aanpak: een optie `look.pad` of `look.dist` in `uiOpenTo` (`src/app2.js`), zodat de afstand niet afhangt van de gekozen knopen.
5. Luchtroosters (16): wit, rafelig streeppatroon, vermoedelijk z-fighting in de lamellen. Nakijken met `pick.py`.
6. Vaste zijruit achter (19, 80): leest als groot los ruitvlak in de opening van het achterportier. Nakijken of de maat klopt met de echte vaste ruit.
7. Telefoon (95-telefoon-portier-linksvoor): de auto valt links en rechts buiten beeld met veel lege vloer eronder. Bewust: het kader past op het onderdeel. Aanpak als het moet: de marge in `uiOpenTo` op smalle schermen van 1,1 naar 1,25.
8. B-stijl in de voorste opening (06, 09): in lak met slotbeugel, maar nog dun. Kleine winst.
9. Labels die de dop bedekken (24, 25): het selectielabel ankert midden op de opener. Aanpak: anker aan de rand bij een opener.

### Onderdeelnummers

10. Dekking: ongeveer 1.120 onderdelen niet onderzocht (Aandrijflijn 578, Carrosserie 269, Interieur 267 volgens de inventaris van golf 5) en 750 onderzocht zonder nummer. Aanpak: een vervolgronde in plakken met de verificatiepoort, Firecrawl heeft weer tegoed (ander account) en Exa werkt ook (komt langs Cloudflare).
11. Varianten: 58 eenheden open. Beslissend: het typeplaatje op de B-stijl, de bandenmaat en het motorplaatje (811 of 813). De dynamo is bewust weer open: bij de 813 geeft MR 415 een vrijloopriemschijf.
12. Artikelen die in de bron "F4R 811" noemen (injector, inlaatluchttemperatuursensor, katalysator) moeten opnieuw bekeken worden als het motorplaatje 813 zegt.
13. Renault-catalogus op VIN: geen bron gevonden die het chassisnummer kent (partsouq kende het niet). Een uitrustingsblad van een dealer geeft alles in een keer.

### Feiten en model

14. Motorcode 811 of 813: waarschijnlijk 813, zekerheid middel. "Geen faseversteller" is alleen voor de 811 bewezen (persmap 2007).
15. ATF: hoeveelheid bevestigd; of Elfmatic J6 en ELF MATIC S6 dezelfde olie zijn, is open. Navragen bij een dealer.
16. Hoeken en slagen van de openers zijn geschat. De gebruiker kan ze aan de eigen auto meten (zie Meetlijst).
17. Oud en bekend: de kabelboom in de cabine raakt de nieuwe opkant in de bodemplaat; achterarm en veerrubber liggen aan de binnenkant van de wielkast boven de vloerplaat; de tank is schematisch kleiner dan 66 liter; 84 van de 345 labelankers liggen achter een ander deel; donkere spikkels op motorkap en dak in het bovenaanzicht (vermoedelijk software-rasterisatie); de spoilerlip leest van opzij als losse zwarte wig (S7).
18. In `src/systems.js` noemt de ECU nog "nokkenasverstelling", wat botst met "geen faseversteller".

### Techniek en tests

19. Niet getest op een echte telefoon en GPU. De gebruiker test zelf (zie Testlijst).
20. Paginagrootte 1,38 MB, waarvan ongeveer 575 kB nummergegevens. Als de telefoon traag laadt: de nummergegevens pas laden als het paneel ze nodig heeft.
21. Carrosserie zit op 189.446 van 190.000 driehoeken. Elke volgende carrosseriewijziging moet eerst ergens anders besparen.
22. De engine kent geen uitnemen met beweging; `hideWhen` laat de plank wegvallen. Goed genoeg; een animatie is een mogelijke verbetering.
23. Databankenrecht: 6.498 van de 6.508 nummerregels komen van autodoc.parts. Maatregelen en toetsvragen voor een advocaat staan in `docs/onderzoek/databankenrecht.md`.

## Meetlijst voor de eigen auto

Wat de gebruiker met een rolmaat, een hoekmeter (telefoon) en een blik kan vaststellen; elk gegeven vervangt een schatting.

1. Motorplaatje op het blok: F4R 811 of F4R 813.
2. Typeplaatje op de B-stijl aan de bestuurderskant: type en uitrustingscode.
3. Bandenmaat op de band, bijvoorbeeld 225/45 R18.
4. Openingshoek van de motorkap op de steunstang, en de lengte van de steunstang.
5. Openingshoek van een voorportier en een achterportier in de eerste en de laatste stand.
6. Openingshoek van de achterklep, en waar de gasveren onderaan vastzitten (hoogte boven de bagagevloer).
7. Hoek van de hoedenplank als de klep open is.
8. Hoe ver het voorste dakglas naar achteren schuift.
9. Hoe ver de achterste zijruit zakt (hoeveel glas blijft staan).

## Testlijst voor een echte telefoon

1. Laadtijd tot de auto draait, op wifi en op 4G.
2. Draaien en zoomen met twee vingers: vloeiend of schokkerig.
3. Modus Openen: motorkap, een portier en de achterklep openen; staat het onderdeel goed in beeld?
4. Alles open: blijft het vloeiend?
5. Telefoon dwars: de zijkolom, en is alles bereikbaar?
6. Een onderdeel kiezen en het paneel met onderdeelnummers openen.
7. Wordt de telefoon warm na een paar minuten?

## Wat bij de gebruiker ligt

1. Akkoord om `main` naar versie 7 te brengen, zodat GitHub Pages bijwerkt.
2. Het motorplaatje, het typeplaatje en de bandenmaat (zie Meetlijst).
3. Testen op de eigen telefoon (zie Testlijst).
4. De tak `gh-pages` verwijderen in GitHub.
5. Desgewenst het artefact delen via het menu Delen, en het delen van de handleiding op Google Drive weer uitzetten.

## Advies, op volgorde

1. Na een ja: `main` naar versie 7 en Pages nakijken.
2. Met de gegevens van de auto: motorcode vastleggen, varianten beslissen (punten 11 en 12).
3. Vervolgronde nummers (punt 10) met Firecrawl en Exa.
4. Punten 1 tot 3 (achterkant in Openen) met de vulpijp in `systems.js`, daarna poort 4.
5. Wat de telefoontest oplevert.

## Werkwijze die werkte

- Golven per domein, elk in een eigen worktree, alleen eigen bestanden. Takken die toch andere bestanden raken: alleen de eigen bestanden overnemen (`git checkout <tak> -- <bestand>`).
- Na samenvoegen de hele testset (`tools/orkestratie/finaltests.sh`), dan pas publiceren. Na publiceren teruglezen en byte voor byte vergelijken.
- Visuele poort met vaste beelden (`gateshots.py`) en vaste kenmerken (`poort.js`), drie plakken met drie beoordelaars op Opus high; herstel per eigenaar op Sonnet high; stoppen als er geen nee meer is en de winst kleiner wordt dan de spreiding.
- Onderzoek op Sonnet high (feiten, juridisch), tellen en inventariseren op Haiku 5.5 (werkte, maar deed ongevraagd extra werk; alleen voor afgebakend telwerk).
- Container kan herstarten: worktrees en commits blijven, achtergrondtaken niet. Na een herstart eerst `git worktree list` en de journals van de workflows nakijken.
- `build_pn.py` draait vanuit een stagingmap met de geverifieerde gegevens: kopieer `golf4/pn/*-verified.json`, `golf4/kennis/info.json` en het script naar `golf5/nummers/stage/` en draai `python3 stage/orkestratie/build_pn.py tree.json REPO` (zie `golf5/nummers/run.sh`).
- Meldingen eerst met stralen, `pick.py` en opnames narekenen voor je iets verandert.

## Bewaard in repo

- Onderzoek: `docs/onderzoek/` (kennisbasis met de RDW-gegevens, beslissingen met motorcode en ATF, databankenrecht, exterieur, motor, automaat, onderstel en interieur, UX-audit).
- Onderdeelnummers: `docs/onderdeelnummers.csv`, `src/partnumbers.js`, `tools/orkestratie/build_pn.py` (met `VIN_KEUZE`).
- Openmodus: `tools/opentest.py`, `tools/open_allow.json`, `src/panorama.js`; poort: `tools/orkestratie/gateshots.py` en `poort.js`.
- Het werkplaatshandboek MR 415 (114 MB) en de referentiefoto's staan niet in de repo (rechten van Renault en derden).

## Vluchtig: scratchpad, weg als container stopt

- Pad: `/tmp/claude-0/-home-user-laguna3/30068ba5-ed5c-5f1b-b200-1ce4840ed639/scratchpad`
- `golf5/`: feitenblad, verslagen `motorcode.md`, `atf.md`, `databankenrecht.md`, inventaris (`inventaris.md`, `.csv`, `.py`), VIN-onderzoek `vin/`, RDW-gegevens `rdw/`, stagingmap van de nummers `nummers/`.
- Testuitvoer `g5final1/` tot `g5final3/`; poortbeelden met notities `g5gate/`, `g5gate2/`, `g5gate3/`; S7 `g5s7/`.
- `golf4/` met de gegevens van golf 4 en `research/` met het handboek en de referentiefoto's.

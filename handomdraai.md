# Handomdraai laguna3

Stand 16 oktober 2026, 09:50 UTC. Versie 7 is live: de parallelle sessie zette `main` op `edab342` (PR #4, fast-forward); GitHub Pages en het artefact serveren `index.html` van golf 5 (bron `33b2b50`, 1.378.969 bytes, md5 `faca1a6c…`, zonder versiestempel). Concept-PR #3 op de tak `ccr-63d946bb-ng8q5l` brengt daar het vangnet (golf 5a-1 en 5a-2), golf 5c-1 (robuustheid, bediening, toegankelijkheid en tests) en het structurele deel van golf 5d (nummers) bovenop; `main` is erin samengevoegd en de pagina heet daarmee versie 8. Het volledige verbeterplan staat in [docs/masterplan.md](docs/masterplan.md).

## Waar

- Repo `rvd-gmpplus/laguna3`. `main` staat op `edab342` (versie 7, golf 5). Werktak `ccr-63d946bb-ng8q5l`, PR #3 (concept): https://github.com/rvd-gmpplus/laguna3/pull/3, met `main` samengevoegd op 16 oktober. De tak `ccr-bd755431-1qfniw` van de parallelle sessie is gelijk aan `main`.
- Live: https://rvd-gmpplus.github.io/laguna3/ en https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR, beide versie 7. GitHub Pages is het kanaal; het artefact is een spiegel met dezelfde bytes en wordt na de publicatie van versie 8 bijgewerkt en teruggelezen.
- De tak `gh-pages` (versie 5) is overbodig. De proxy weigert hem te verwijderen (403 op `git push --delete` en op de API); de gebruiker verwijdert hem in GitHub.
- Bouwen: `python3 build.py`. Versie: `VERSION` (nu 8) plus een inhoudshash van `src/`, zichtbaar in het hulpvenster (`?`), in `<meta name="laguna-version">` en in `__laguna.version`. Versie 7 op `main` heeft nog geen stempel.
- Verse omgeving: `tools/setup.sh` (Playwright en Pillow uit `requirements.txt`, three.js 0.147.0 met npm-hashcontrole). In een Claude Code-sessie in de cloud doet de SessionStart-hook dat.
- Kerncijfers: [docs/cijfers.md](docs/cijfers.md), gegenereerd uit `stats.json` en `tri.json`; andere documenten verwijzen ernaar in plaats van getallen te herhalen.

## De auto van de gebruiker

- Renault Laguna III hatchback, Initiale Paris, fase 2, zilvergrijs, 2.0 Turbo 125 kW met zestraps automaat AJ0, panoramadak, geen 4Control (opgave van de gebruiker).
- Volgens de RDW: eerste toelating 18 februari 2011, benzine 1998 cc, EURO 5 A, 8,7 l/100 km, 201 g/km, spoor voor 156 cm en achter 151 cm. De RDW geeft geen bandenmaat en geen motorsuffix.
- Motor waarschijnlijk F4Rt 813: MR 415 geeft bij de hatchback de F4R 811 alleen Euro 4 en de 813 ook Euro 5. Het motorplaatje beslist. Zie `docs/onderzoek/beslissingen.md`.
- Kenteken en chassisnummer zijn bekend in de sessie maar staan bewust niet in de repo (openbaar). De docs zeggen "volgens de RDW" of "volgens het chassisnummer van de gebruiker".

## Wat werkt

- Boom, driehoeken per hoofdgroep, tekenopdrachten en ingesloten knopen: zie [docs/cijfers.md](docs/cijfers.md). De Carrosserie heeft de dunste marge; G1 in het masterplan maakt ruimte vóór nieuwe carrosseriedelen.
- Uitklappen, de modus Openen (26 openers), het panoramadak, 43 presets in 7 categorieën, onderdeelnummers in het paneel (546 eenheden, 1.334 nummers, bij 14 eenheden het blok "Gekozen voor deze auto" op grond van de RDW en het chassisnummer van de gebruiker; het nummer zelf staat nergens in de repo).
- Golf 5 (parallelle sessie): camera's van achterklep, motorkap en voorportieren; hoedenplank 40 graden; de naad tussen de rugleuningdelen donker; B-stijl in lak met sluitplaat en slotbeugel; voorruit van binnen op 0,45 maal de dekking (shader, `MAT.glassWs`); olievuldop aan een scharnierlip; steunstang Ø16 mm in donker staal; U19 (de rest dimmen bij duiken, schakelaar in Weergave); zijkolom voor telefoons in liggende stand; voorste langsliggers boven de aandrijfassen; opkant in de bodemplaat boven de torsiebalk, tank en koolstoffilter verplaatst; remleidingen achter om langsarm en veer; multiriem 1.672 mm; dakglas dekking 0,92 (opgave van de gebruiker); geen 4Control (opgave van de gebruiker); motorcode F4Rt 813 (waarschijnlijk, zie `docs/onderzoek/beslissingen.md`); ATF volgens MR 415; `docs/onderzoek/databankenrecht.md`.
- Herstelronde golf 5 (22:50 tot 00:12 UTC): achterklep met open glas en lijmrand, gasveren langs de zijwand, B-stijlafdekking boven de chroomband, spiegelcamera dichterbij; hemel onder het dakframe, dunne koordjes, laadvloer met voorstuk, lichte opbergbak, deksel van de armsteun met donkere onderkant (Dekselvoering), nieuwe interieurcamera's; zonneschermen van binnen in beeld (de stapel stopt net voor de cassette), donkere binnenlijst en lichte weerspiegeling op het dakglas; expansiedop scharniert aan de hals met een zichtbare vulopening; telefoon staand met de presetcategorieën in één schuivende rij (itest 16); de hoedenplank met pennen, koordjes en luidsprekers is uitgenomen zolang een rugleuning of de bagagevloer open is (`hideWhen` in de engine, zie `docs/ontwerp-en-architectuur.md`).
- Golf 5a-1 (vangnet-kern): strikte testset met één exitcode en tijd per test (`finaltests.sh`), waarschuwingen tellen als fout, `ui_inner --open --strict`, `opentest --strikt-min` met de regel dat `open.min` minstens 0,8 maal de volle hoek of slag is. Zichtbaar: deelbare URL (`?preset=`, `?open=`, de adresbalk volgt), `?debug=1`-overlay (fps, tekenopdrachten, versie), laadmeldingen in stappen, een melding zonder WebGL, description en og-meta, favicon, versie in het hulpvenster (itest 17).
- Golf 5c-1 (robuustheid, bediening, toegankelijkheid; twee agents, 02:00 tot 04:00 UTC): foutmelding met de versie als het laden misgaat (ook zonder three.js of WebGL), herstel na WebGL-contextverlies, `uiLastFit` centraal (draaien na een duik blijft op het duikdoel), rondleiding met pauze, vorige, volgende en pauze bij een verborgen tabblad, `integrity` en `crossorigin` op de CDN-tags, "+n meer" als labels wegvallen, fade en badge bij isoleren, themaknop (licht, donker, systeem), toegankelijkheid (focusval en `inert`, menu-rollen, werkbalk, focusrand, schakelaarcontrast, tabs, live region, Esc), hulpvenster uit `PRESETS`, zoeken met synoniemen, toast en suggestie op aanraakschermen, Beeld opslaan en Kaart afdrukken. Tests: controle 18 (36), 19 tot 22 (21), `tools/visdiff.py` met de basislijn in `docs/baseline/` (640 x 400, 256 kleuren), `tools/anchorcheck.py` met de basis in `docs/baseline/anchorcheck.json`, het bevroren testcontract in `docs/testen.md`; de strikte set kent nu ook `shots`, `visdiff` en `anchor`.
- Golf 5a-2 (vangnet-rest): budgetten in `tools/anchors.json` met `tri.py --gate`, ankers voor de 26 openers (als pad) en de 43 preset-id's, `labelOnly` gecontroleerd; `data/pn/` als canonieke bron van de nummers, `build_pn.py` als zuivere serialisatie, `tools/pncheck.py` (byte voor byte, met `--tree` tegen `data/tree.json`); CI op GitHub (`ci.yml` per push: lint, `index.html` actueel, pncheck, smoke, integrity, silhouette, budgetpoort, testlijst; `nightly.yml`: de lange set); LICENSE (MIT met een gegevensnotitie), `CLAUDE.md`, `CHANGELOG.md`, `.gitattributes`, `docs/telefoontest.md`, `docs/cijfers.md`, `docs/masterplan.md`; screenshots van versie 7 in 256 kleuren (2,9 MB in plaats van 7,1 MB; `docshots.py` doet dat voortaan zelf).
- Panoramadak: glas zo goed als zwart (dekking 0,92, zoals de auto van de gebruiker), van binnen blauwgrijs met een lichte weerspiegeling en zwarte binnenlijsten.
- Na het samenvoegpunt van PR #3 (`b529ac1`) voegde de parallelle sessie nog toe en publiceerde als versie 7: zijbekleding van de bagageruimte in donker vilt over de wielkasten en de vulpijp, een lichte onderzijde aan de klapbare bagagevloer (volger), een grotere schermgreep en een taupe schermcassette, nieuwe camera's voor handschoenenkastje, zonnekleppen, middenarmsteun achter en bagagevloer, en een poortcamera van 70 graden voor het dak. Die commits zitten via de samenvoeging van 16 oktober in deze tak.

## Tests

Strikte set op de eindstand van deze ronde (`452916e`, uitvoer `g5c/final` in het scratchpad, 02:55 tot 03:16 UTC), alle dertien tests groen: lint ok (ook het inline script in `head.html`); smoke, integrity (0 fouten), silhouette, `ui_inner --open --strict`, opentest strikt (26 openers, 0 fouten), `ITEST_GATES=1 itest` 218 van 218 (1.067 s), `tri --gate` ok, pubsmoke klaar na 9,9 s met `integrity` van de CDN, stats, presetshots (42), `visdiff` 42 van 42 tegen de basislijn van `452916e`, `anchorcheck` ok tegen de basis (352 labels, eigen 319, vrij 265). Details in `docs/testen.md`.

Eerder, strikte set op de samenvoeging van golf 5 (`2c179a5`, uitvoer `g5merge` in het scratchpad, 01:21 tot 01:52 UTC), alles groen: lint ok; smoke (geen consolefouten of -waarschuwingen, geen horizontale scroll); integrity 0 fouten, 0 ankerfouten, 0 presetfouten; silhouette ok; `ui_inner --open --strict` geen ingesloten knoop van buiten zichtbaar; opentest 26 openers 0 fouten met `--strikt-min` (515 s; twee meldingen over volgers zonder `min`, toegestaan); `ITEST_GATES=1 itest` 161 van 161 (899 s); `tri --gate` budgetpoort ok; pubsmoke klaar na 9,5 s op 390 x 844; stats ok. CI op GitHub: groen op `2c179a5` (push- en PR-run).

Eerder op deze tak: strikte set op de stand van 00:01 UTC groen na vier `inner`-vlaggen minder (Aanslagrubber achter, Rugframe, Kabelboom dashboard, Pakking waterkast rechts, elk door één straal van buiten te zien), itest 157 van 157 op een rustige machine (controle 14 was onder belasting een flake). De basislijn van golf 5 (tip `8e03e87`, oude testset) was groen op één frametijdmeting na die onder zware belasting 8,4 ms gaf.

Conflicten bij het samenvoegen van de herstelronde (vijf bestanden): steeds haar geometrie en camera's met de ondergrenzen van 0,8 maal de hoek (spiegel 64 graden, rugleuningen en middenarmsteun 1,456 rad, armsteunkussen 0,92 rad, expansiedop 1,44 rad); `panTravel` rekent de stop voor de cassette mee (zonnescherm voor 0,60 m met ondergrens 0,50, achter 0,44 met 0,36); `Rugframe` zonder `inner`; haar itest-controle 16 naast mijn 17.

Visuele poort golf 5, telkens 9 beoordelaars op dezelfde kenmerken K1 tot K13 (`tools/orkestratie/poort.js`, beelden met `gateshots.py`): poort 1 op `f581bca` 11 ja, 6 deels, 0 nee; poort 2 op `b529ac1` 12, 4, 1 (K13, door een slechte vaste binnencamera); poort 3 op `33b2b50` 13, 4, 0. Ter vergelijking versie 6: 10, 7, 0. S7 (exterieur, carrosserieronde) opnieuw gedraaid: 7 van 9 ja, gehaald. Na poort 3 gestopt: geen nee en niets blokkerend meer.

Let op bij het lezen van poort 3: de binnencamera van het dak (92 en 93) kijkt met 70 graden beeldhoek (was 36) om beide openingen in een beeld te krijgen. Dat is alleen het poortbeeld; de app gebruikt zijn eigen camera.

## Wat nog verbetering verdient

Op volgorde van wat de gebruiker het eerst ziet; de lijst van de parallelle sessie na poort 3 van golf 5. Het masterplan ([docs/masterplan.md](docs/masterplan.md)) ordent dezelfde punten in golven: 5b-2 (geometrie, G1 eerst), 5c-2 (prestaties en codegezondheid), 5d (nummerronden N2 en N5) en 5e (feiten). Golf 5c-1 is gebouwd in PR #3; open daaruit blijven de visuele poort met vóór/na-paren en de telefoonsessie. Beeldnummers verwijzen naar `g5gate3/` in het scratchpad (vluchtig).

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

1. PR #3 beoordelen en samenvoegen in `main` (merge, geen rebase). Daarna serveert GitHub Pages versie 8; dan het artefact bijwerken met dezelfde bytes en de URL teruglezen (zie `docs/testen.md`, pubsmoke).
2. `gh-pages` verwijderen in GitHub (de proxy weigert het).
3. De tags `v1` tot `v8` naar GitHub brengen; de proxy weigert `git push --tags` en de API (403). In een eigen kloon, na het samenvoegen van PR #3:
   `git tag -a v1 9164d0a -m "Versie 1" && git tag -a v2 8095a3e -m "Versie 2" && git tag -a v3 60909fe -m "Versie 3" && git tag -a v4 9c03015 -m "Versie 4" && git tag -a v5 5b6cefa -m "Versie 5" && git tag -a v6 f3a7854 -m "Versie 6" && git tag -a v7 25c3ddf -m "Versie 7" && git tag -a v8 <samenvoegcommit> -m "Versie 8" && git push origin --tags`
4. De telefoontest volgens [docs/telefoontest.md](docs/telefoontest.md) (en de Testlijst hieronder) op versie 7 of 8 (`?debug=1` voor de overlay vanaf versie 8).
5. Het motorplaatje, het typeplaatje en de bandenmaat, en de andere punten van de Meetlijst.
6. Tegoed voor Jina of Firecrawl (of een dealerlijst op het chassisnummer) voor de nummerronden N2 en N5 en de 24 `?page=N`-URL's: de accounts gaven 402 en "insufficient credits"; autodoc zit achter Cloudflare.
7. Besluit over golf 6 (ES-modules en een actuele three.js; advies: nee tot er een aanleiding is) en over een tweede bestand naast de pagina voor de nummergegevens (alleen als het artefact als kanaal mag vervallen).
8. Desgewenst het artefact delen via het menu Delen, en het delen van de handleiding op Google Drive weer uitzetten.
9. Eén spoor tegelijk: twee sessies op `main` gaven twee keer "versie 7". Nieuwe golven starten vanaf `main` na het samenvoegen van PR #3.

## Werkwijze die werkte

- Elke sessie begint met `git ls-remote --heads origin` en een vergelijking van elke tak met `main`. De premortem op het plan van golf 5 miste twee commits doordat de meting van vóór een push was.
- Twee sessies op dezelfde bestanden: eerst de ander laten uitlopen (geen commit in 60 minuten), dan in één keer samenvoegen en bij elk conflict de geometrie van de ander en de contracten (ondergrenzen, `inner`) van het vangnet houden.
- Golven per domein in eigen worktrees, `mergecheck.py` vóór samenvoegen, na samenvoegen de volledige strikte set, dan pas `index.html` herbouwen en publiceren, dan de URL teruglezen.
- Een rode test onder belasting eerst herhalen op een rustige machine (de dubbelklik van controle 14 en de frametijd van opentest).
- Een melding van een poort eerst narekenen met `pick.py`, `probe.py`, `rays_bagage.py` of stralen; dan pas wijzigen.
- Een ondergrens per opener van minstens 0,8 maal de volle hoek of slag, zodat een botsingstoets niet beloond wordt met kleinere hoeken.
- Nummers: plakken met een harde stop, lokvogels in de verificatiepoort, `niet onderzocht` voor wat niet geverifieerd is, en het chassisnummer nooit in de repo.
- Visuele poort met vaste beelden (`gateshots.py`) en vaste kenmerken (`poort.js`), drie plakken met drie beoordelaars op Opus high; herstel per eigenaar op Sonnet high; stoppen als er geen nee meer is en de winst kleiner wordt dan de spreiding.
- Onderzoek op Sonnet high (feiten, juridisch), tellen en inventariseren op Haiku 5.5 (werkte, maar deed ongevraagd extra werk; alleen voor afgebakend telwerk).
- Container kan herstarten: worktrees en commits blijven, achtergrondtaken niet. Na een herstart eerst `git worktree list` en de journals van de workflows nakijken.
- Versienummers alleen uit `VERSION` op de tak die publiceert; wie `main` bijwerkt, kijkt eerst of een andere tak hetzelfde nummer al gebruikt.

## Bewaard in repo

- Plan en proces: `docs/masterplan.md`, `docs/premortem.md`, `CHANGELOG.md`, `CLAUDE.md`.
- Onderzoek: `docs/onderzoek/` (kennisbasis, beslissingen, databankenrecht, exterieur, motor, automaat, onderstel en interieur, UX-audit).
- Onderdeelnummers: `data/pn/` (canoniek), `data/tree.json` (de boom van de pagina, 3.020 paden), `docs/onderdeelnummers.csv`, `src/partnumbers.js`, `tools/orkestratie/build_pn.py`, `tools/pncheck.py`.
- Hulpscripts: `tools/orkestratie/` (`finaltests.sh`, `cijfers.py`, `gallery.py`, `presetshots.py`, `docshots.py`, `stats.py`, `pickview.py`, `pick.py`, `shots.py`, `probe.py`, `rays_bagage.py`, `phone.py`, `gateshots.py`, `dumptree.py`, `poort.js`, `zone.py`, `mergecheck.py`). Uitleg: `tools/orkestratie/README.md`.
- Het werkplaatshandboek MR 415 en de referentiefoto's staan niet in de repo (rechten van Renault en derden).

## Vluchtig: scratchpad, weg als de container stopt

- Deze sessie: `/tmp/claude-0/-home-user-laguna3/24f7dfc1-d667-544a-9754-10be18291035/scratchpad`: de drie audits (`audits/audit-app.md`, `audit-geometrie.md`, `audit-tooling.md`, de grondslag van het masterplan), de testuitvoer `g5base` (basislijn golf 5), `g5a1` (strikte set van 00:01 UTC) en `g5merge` (strikte set van versie 7, met `stats.json` en `tri.json`), en de worktree `wt-sister` van de zustertak.
- Parallelle sessie:
- Pad: `/tmp/claude-0/-home-user-laguna3/30068ba5-ed5c-5f1b-b200-1ce4840ed639/scratchpad`
- `golf5/`: feitenblad, verslagen `motorcode.md`, `atf.md`, `databankenrecht.md`, inventaris (`inventaris.md`, `.csv`, `.py`), VIN-onderzoek `vin/`, RDW-gegevens `rdw/`, stagingmap van de nummers `nummers/`.
- Testuitvoer `g5final1/` tot `g5final3/`; poortbeelden met notities `g5gate/`, `g5gate2/`, `g5gate3/`; S7 `g5s7/`.
- `golf4/` met de gegevens van golf 4 en `research/` met het handboek en de referentiefoto's.

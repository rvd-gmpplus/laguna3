# Handomdraai laguna3

Stand 16 oktober 2026, 02:00 UTC. Golf 5 van de parallelle sessie (15 oktober 19:10 tot 16 oktober 00:12 UTC, inclusief haar herstelronde), golf 5a-1 (vangnet-kern) en golf 5a-2 (vangnet-rest) staan samengevoegd op de tak `ccr-63d946bb-ng8q5l`, als concept-PR #3 naar `main`. De strikte testset is groen op die stand en `index.html` is gebouwd als versie 7 (`7 (bron 7d0e606)`). Publicatie is het samenvoegen van PR #3: dan serveert GitHub Pages versie 7. Het volledige verbeterplan staat in [docs/masterplan.md](docs/masterplan.md).

## Waar

- Repo `rvd-gmpplus/laguna3`. `main` staat op `f3a7854` (versie 6, GitHub Pages serveert die). Werktak `ccr-63d946bb-ng8q5l`, PR #3 (concept): https://github.com/rvd-gmpplus/laguna3/pull/3. CI (`ci.yml`) is groen op de samenvoeging `2c179a5`. De tak `ccr-bd755431-1qfniw` van de parallelle sessie (29 commits, tip `b529ac1`) zit er volledig in; na het samenvoegen van PR #3 kan die tak weg.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR (versie 6) en https://rvd-gmpplus.github.io/laguna3/ (versie 6, uit `main`). GitHub Pages is het kanaal; het artefact is een spiegel met dezelfde bytes en wordt na de publicatie van versie 7 bijgewerkt en teruggelezen.
- De tak `gh-pages` (versie 5) is overbodig. De proxy weigert hem te verwijderen (403 op `git push --delete` en op de API); de gebruiker verwijdert hem in GitHub.
- Bouwen: `python3 build.py`. Versie: `VERSION` (nu 7) plus een inhoudshash van `src/`, zichtbaar in het hulpvenster (`?`), in `<meta name="laguna-version">` en in `__laguna.version`.
- Verse omgeving: `tools/setup.sh` (Playwright en Pillow uit `requirements.txt`, three.js 0.147.0 met npm-hashcontrole). In een Claude Code-sessie in de cloud doet de SessionStart-hook dat.
- Kerncijfers: [docs/cijfers.md](docs/cijfers.md), gegenereerd uit `stats.json` en `tri.json`; andere documenten verwijzen ernaar in plaats van getallen te herhalen.

## Wat werkt

- Boom: 3.020 knopen, 499 groepen, 2.521 onderdelen, diepte 8, 664.788 driehoeken (budgetten in `tools/anchors.json`: 700.000 totaal, Aandrijflijn 240.000 met 235.546, Carrosserie 190.000 met 189.446, Onderstel 125.000 met 113.228, Interieur 95.000 met 77.852). Gebundeld 441 tekenopdrachten gemonteerd, 1.883 zonder. 217 ingesloten knopen. Let op: Carrosserie heeft nog 554 driehoeken over; G1 in het masterplan maakt ruimte vóór nieuwe carrosseriedelen.
- Uitklappen, de modus Openen (26 openers), het panoramadak, 43 presets in 7 categorieën, onderdeelnummers in het paneel (546 eenheden, 1.334 nummers, bij 14 eenheden het blok "Gekozen voor deze auto" op grond van de RDW en het chassisnummer van de gebruiker; het nummer zelf staat nergens in de repo).
- Golf 5 (parallelle sessie): camera's van achterklep, motorkap en voorportieren; hoedenplank 33 graden; de naad tussen de rugleuningdelen donker; B-stijl in lak met sluitplaat en slotbeugel; voorruit van binnen op 0,45 maal de dekking (shader, `MAT.glassWs`); olievuldop aan een scharnierlip; steunstang Ø16 mm in donker staal; U19 (de rest dimmen bij duiken, schakelaar in Weergave); zijkolom voor telefoons in liggende stand; voorste langsliggers boven de aandrijfassen; opkant in de bodemplaat boven de torsiebalk, tank en koolstoffilter verplaatst; remleidingen achter om langsarm en veer; multiriem 1.672 mm; dakglas dekking 0,92 (opgave van de gebruiker); geen 4Control (opgave van de gebruiker); motorcode F4Rt 813 (waarschijnlijk, zie `docs/onderzoek/beslissingen.md`); ATF volgens MR 415; `docs/onderzoek/databankenrecht.md`.
- Herstelronde golf 5 (22:50 tot 00:12 UTC): achterklep met open glas en lijmrand, gasveren langs de zijwand, B-stijlafdekking boven de chroomband, spiegelcamera dichterbij; hemel onder het dakframe, dunne koordjes, laadvloer met voorstuk, lichte opbergbak, deksel van de armsteun met donkere onderkant (Dekselvoering), nieuwe interieurcamera's; zonneschermen van binnen in beeld (de stapel stopt net voor de cassette), donkere binnenlijst en lichte weerspiegeling op het dakglas; expansiedop scharniert aan de hals met een zichtbare vulopening; telefoon staand met de presetcategorieën in één schuivende rij (itest 16); de hoedenplank met pennen, koordjes en luidsprekers is uitgenomen zolang een rugleuning of de bagagevloer open is (`hideWhen` in de engine, zie `docs/ontwerp-en-architectuur.md`).
- Golf 5a-1 (vangnet-kern): strikte testset met één exitcode en tijd per test (`finaltests.sh`), waarschuwingen tellen als fout, `ui_inner --open --strict`, `opentest --strikt-min` met de regel dat `open.min` minstens 0,8 maal de volle hoek of slag is. Zichtbaar: deelbare URL (`?preset=`, `?open=`, de adresbalk volgt), `?debug=1`-overlay (fps, tekenopdrachten, versie), laadmeldingen in stappen, een melding zonder WebGL, description en og-meta, favicon, versie in het hulpvenster (itest 17).
- Golf 5a-2 (vangnet-rest): budgetten in `tools/anchors.json` met `tri.py --gate`, ankers voor de 26 openers (als pad) en de 43 preset-id's, `labelOnly` gecontroleerd; `data/pn/` als canonieke bron van de nummers, `build_pn.py` als zuivere serialisatie, `tools/pncheck.py` (byte voor byte, met `--tree` tegen `data/tree.json`); CI op GitHub (`ci.yml` per push: lint, `index.html` actueel, pncheck, smoke, integrity, silhouette, budgetpoort, testlijst; `nightly.yml`: de lange set); LICENSE (MIT met een gegevensnotitie), `CLAUDE.md`, `CHANGELOG.md`, `.gitattributes`, `docs/telefoontest.md`, `docs/cijfers.md`, `docs/masterplan.md`; screenshots van versie 7 in 256 kleuren (2,9 MB in plaats van 7,1 MB; `docshots.py` doet dat voortaan zelf).

## Tests

Strikte set op de samengevoegde stand (`2c179a5`, uitvoer `g5merge` in het scratchpad, 01:21 tot 01:52 UTC), alles groen: lint ok; smoke (geen consolefouten of -waarschuwingen, geen horizontale scroll); integrity 0 fouten, 0 ankerfouten, 0 presetfouten; silhouette ok; `ui_inner --open --strict` geen ingesloten knoop van buiten zichtbaar; opentest 26 openers 0 fouten met `--strikt-min` (515 s; twee meldingen over volgers zonder `min`, toegestaan); `ITEST_GATES=1 itest` 161 van 161 (899 s); `tri --gate` budgetpoort ok; pubsmoke klaar na 9,5 s op 390 x 844; stats ok. CI op GitHub: groen op `2c179a5` (push- en PR-run).

Eerder op deze tak: strikte set op de stand van 00:01 UTC groen na vier `inner`-vlaggen minder (Aanslagrubber achter, Rugframe, Kabelboom dashboard, Pakking waterkast rechts, elk door één straal van buiten te zien), itest 157 van 157 op een rustige machine (controle 14 was onder belasting een flake). De basislijn van golf 5 (tip `8e03e87`, oude testset) was groen op één frametijdmeting na die onder zware belasting 8,4 ms gaf.

Conflicten bij het samenvoegen van de herstelronde (vijf bestanden): steeds haar geometrie en camera's met de ondergrenzen van 0,8 maal de hoek (spiegel 64 graden, rugleuningen en middenarmsteun 1,456 rad, armsteunkussen 0,92 rad, expansiedop 1,44 rad); `panTravel` rekent de stop voor de cassette mee (zonnescherm voor 0,60 m met ondergrens 0,50, achter 0,44 met 0,36); `Rugframe` zonder `inner`; haar itest-controle 16 naast mijn 17.

## Wat nog verbetering verdient

De volledige lijst met nummers, vindplaatsen en volgorde staat in [docs/masterplan.md](docs/masterplan.md). De kop ervan:

1. Golf 5c-1: robuustheid (`uiLastFit` centraal, PMREM na contextverlies, rondleiding pauzeren), het eerste beeld op de telefoon (liggend en staand na itest 16 opnieuw meten), "+n meer" bij labels, fade bij isoleren, themaknop, toegankelijkheid (focusval, menu-rol, canvasfocus, schakelaarcontrast), hulpvenster uit `PRESETS`, exporteren van een beeld, zoeksynoniemen, en tests voor toetsenbord, formaatwissel, 50 stappen terug, reduced motion, uitvalpaden, visuele regressie, labelankers.
2. Golf 5d: nummers. Gedaan: de CSV met `unit_id`, alle bronnen per rij en statuslabels (`docs/onderdeelnummers-schema.md`), Engelse catalogusattributen vervangen door Nederlandse aanduidingen, de schuine streep beoordeeld (geen hernoeming nodig). Open: de dekkingsronde op de 100 meest bestelde delen (N2), 57 varianten op het chassisnummer (N5), 24 bron-URL's met `?page=N` (N6, ophaalroute ontbreekt).
3. Golf 5b-2: geometrie (G1 ruimte maken in Carrosserie vóór alles, zijbekleding bagageruimte, ruitensproeiertank, aircoleidingen, vacuümslang, LOD voor bouten en veren, gedeelde constructies naar `core.js`, tekstcontract), met de visuele poort met vóór/na-paren.
4. Golf 5c-2: prestaties (nummergegevens lui parsen, één synchronisatie per handeling, renderlus splitsen) en codegezondheid (constanten, dode code, dubbele helpers, modusobject, `app2.js` opdelen, teksttabel).
5. Open feiten: het motorsuffix (811 of 813, het motorplaatje beslist), S6 of J6 voor de ATF, velgmaat, accuzijde, startknop, de hoeken van kap, portieren en klep aan de echte auto.
6. De visuele poort K1-K13 met vóór/na-paren tegen versie 6 is op deze stand niet opnieuw gedraaid; de twaalf screenshots zijn wel nagekeken (hoedenplank uitgenomen bij de open bagagevloer, expansiedop en vulopening, panoramadak, telefoon).

## Wat bij de gebruiker ligt

1. PR #3 beoordelen en samenvoegen in `main` (merge, geen rebase: de tak bevat de samenvoegcommits van de parallelle sessie). Daarna serveert GitHub Pages versie 7; dan het artefact bijwerken met dezelfde bytes en de URL teruglezen (zie `docs/testen.md`, pubsmoke).
2. `gh-pages` verwijderen in GitHub (de proxy weigert het).
3. De tags `v1` tot `v7` naar GitHub brengen; de proxy weigert `git push --tags` en de API (403). In een eigen kloon, na het samenvoegen van PR #3 (`v7` op de samenvoegcommit in `main`):
   `git tag -a v1 9164d0a -m "Versie 1" && git tag -a v2 8095a3e -m "Versie 2" && git tag -a v3 60909fe -m "Versie 3" && git tag -a v4 9c03015 -m "Versie 4" && git tag -a v5 5b6cefa -m "Versie 5" && git tag -a v6 f3a7854 -m "Versie 6" && git tag -a v7 <samenvoegcommit> -m "Versie 7" && git push origin --tags`. Daarna kan `docs/v1/index.html` weg (tag `v1` is de terugvaloptie).
4. De telefoontest volgens [docs/telefoontest.md](docs/telefoontest.md) zodra versie 7 op Pages staat (`?debug=1` voor de overlay).
5. Het motorplaatje (F4R 811 of 813) en de metingen aan de auto (hoeken, velgmaat, accuzijde, startknop).
6. Besluit over golf 6 (ES-modules en een actuele three.js; advies: nee tot er een aanleiding is) en over een tweede bestand naast de pagina voor de nummergegevens (alleen als het artefact als kanaal mag vervallen).

## Werkwijze die werkte

- Elke sessie begint met `git ls-remote --heads origin` en een vergelijking van elke tak met `main`. De premortem op het plan van golf 5 miste twee commits doordat de meting van vóór een push was.
- Twee sessies op dezelfde bestanden: eerst de ander laten uitlopen (geen commit in 60 minuten), dan in één keer samenvoegen en bij elk conflict de geometrie van de ander en de contracten (ondergrenzen, `inner`) van het vangnet houden.
- Golven per domein in eigen worktrees, `mergecheck.py` vóór samenvoegen, na samenvoegen de volledige strikte set, dan pas `index.html` herbouwen en publiceren, dan de URL teruglezen.
- Een rode test onder belasting eerst herhalen op een rustige machine (de dubbelklik van controle 14 en de frametijd van opentest).
- Een melding van een poort eerst narekenen met `pick.py`, `probe.py`, `rays_bagage.py` of stralen; dan pas wijzigen.
- Een ondergrens per opener van minstens 0,8 maal de volle hoek of slag, zodat een botsingstoets niet beloond wordt met kleinere hoeken.
- Nummers: plakken met een harde stop, lokvogels in de verificatiepoort, `niet onderzocht` voor wat niet geverifieerd is, en het chassisnummer nooit in de repo.

## Bewaard in repo

- Plan en proces: `docs/masterplan.md`, `docs/premortem.md`, `CHANGELOG.md`, `CLAUDE.md`.
- Onderzoek: `docs/onderzoek/` (kennisbasis, beslissingen, databankenrecht, exterieur, motor, automaat, onderstel en interieur, UX-audit).
- Onderdeelnummers: `data/pn/` (canoniek), `data/tree.json` (de boom van de pagina, 3.020 paden), `docs/onderdeelnummers.csv`, `src/partnumbers.js`, `tools/orkestratie/build_pn.py`, `tools/pncheck.py`.
- Hulpscripts: `tools/orkestratie/` (`finaltests.sh`, `cijfers.py`, `gallery.py`, `presetshots.py`, `docshots.py`, `stats.py`, `pickview.py`, `pick.py`, `shots.py`, `probe.py`, `rays_bagage.py`, `phone.py`, `gateshots.py`, `dumptree.py`, `poort.js`, `zone.py`, `mergecheck.py`). Uitleg: `tools/orkestratie/README.md`.
- Het werkplaatshandboek MR 415 en de referentiefoto's staan niet in de repo (rechten van Renault en derden).

## Vluchtig: scratchpad, weg als de container stopt

- `/tmp/claude-0/-home-user-laguna3/24f7dfc1-d667-544a-9754-10be18291035/scratchpad`: de drie audits (`audits/audit-app.md`, `audit-geometrie.md`, `audit-tooling.md`, de grondslag van het masterplan), de testuitvoer `g5base` (basislijn golf 5), `g5a1` (strikte set van 00:01 UTC) en `g5merge` (strikte set van versie 7, met `stats.json` en `tri.json`), en de worktree `wt-sister` van de zustertak.

# Handomdraai laguna3

Stand 16 oktober 2026, 00:10 UTC. Golf 5 (de parallelle sessie van 15 oktober, 19:10 tot 21:36 UTC) en golf 5a-1 (het vangnet, vanaf 23:10 UTC) zijn samengevoegd op de tak `ccr-63d946bb-ng8q5l`. Versie 7 is gebouwd uit die stand zodra de strikte testset groen is; publicatie en PR volgen in dezelfde ronde. Het volledige verbeterplan staat in [docs/masterplan.md](docs/masterplan.md).

## Waar

- Repo `rvd-gmpplus/laguna3`. `main` staat op `f3a7854` (versie 6, GitHub Pages serveert die). De tak `ccr-bd755431-1qfniw` van de parallelle sessie (golf 5, 21 commits, tip `8e03e87`) zit volledig in `ccr-63d946bb-ng8q5l`; alles vanaf hier gaat vanaf die laatste tak en daarna `main`.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR (versie 6) en https://rvd-gmpplus.github.io/laguna3/ (versie 6, uit `main`). GitHub Pages is het kanaal; het artefact is een spiegel met dezelfde bytes.
- De tak `gh-pages` (versie 5) is overbodig. De proxy weigert hem te verwijderen (403 op `git push --delete` en op de API); de gebruiker verwijdert hem in GitHub.
- Bouwen: `python3 build.py`. Versie: `VERSION` (nu 7) plus een inhoudshash, zichtbaar in het hulpvenster (`?`) en in `__laguna.version`.
- Verse omgeving: `tools/setup.sh` (Playwright uit `requirements.txt`, three.js 0.147.0 met npm-hashcontrole). In een Claude Code-sessie in de cloud doet de SessionStart-hook dat.
- Kerncijfers: [docs/cijfers.md](docs/cijfers.md), gegenereerd uit `stats.json`; andere documenten verwijzen ernaar.

## Wat werkt

- Boom: 3.015 knopen, 499 groepen, 2.516 onderdelen, diepte 8, 664.216 driehoeken (budgetten in `tools/anchors.json`: 700.000 totaal, Aandrijflijn 240.000 met 235.546, Carrosserie 190.000 met 189.214, Onderstel 125.000 met 113.228, Interieur 95.000 met 77.636). Gebundeld 439 tekenopdrachten gemonteerd, 1.872 zonder.
- Uitklappen, de modus Openen (26 openers), het panoramadak, 43 presets in 7 categorieën, onderdeelnummers in het paneel (546 eenheden, 1.334 nummers, bij 14 eenheden het blok "Gekozen voor deze auto" op grond van de RDW en het chassisnummer van de gebruiker; het nummer zelf staat nergens in de repo).
- Golf 5 (parallelle sessie): camera's van achterklep, motorkap en voorportieren; hoedenplank 33 graden; de naad tussen de rugleuningdelen donker; B-stijl in lak met sluitplaat en slotbeugel; voorruit van binnen op 0,45 maal de dekking (shader, `MAT.glassWs`); olievuldop aan een scharnierlip; steunstang Ø16 mm in donker staal; U19 (de rest dimmen bij duiken, schakelaar in Weergave); zijkolom voor telefoons in liggende stand; voorste langsliggers boven de aandrijfassen; opkant in de bodemplaat boven de torsiebalk, tank en koolstoffilter verplaatst; remleidingen achter om langsarm en veer; multiriem 1.672 mm; dakglas dekking 0,92 (opgave van de gebruiker); geen 4Control (opgave van de gebruiker); motorcode F4Rt 813 (waarschijnlijk, zie `docs/onderzoek/beslissingen.md`); ATF volgens MR 415; `docs/onderzoek/databankenrecht.md`.
- Golf 5a-1 (vangnet): strikte testset met één exitcode en tijd per test (`finaltests.sh`), waarschuwingen tellen als fout, `ui_inner --open --strict`, `opentest --strikt-min` met de regel dat `open.min` minstens 0,8 maal de volle hoek of slag is, `tri.py --gate` op de budgetten, ankers voor de 26 openers (als pad) en de 43 preset-id's, `labelOnly` gecontroleerd. Zichtbaar: deelbare URL (`?preset=`, `?open=`, de adresbalk volgt), `?debug=1`-overlay (fps, tekenopdrachten, versie), laadmeldingen in stappen, een melding zonder WebGL, description en og-meta, favicon, LICENSE (MIT met een gegevensnotitie), `CLAUDE.md`, `CHANGELOG.md`, `docs/telefoontest.md`.

## Tests

Strikte set op de samengevoegde stand (uitvoer `g5a1` in het scratchpad, 23:46 tot 00:01 UTC): lint ok; smoke, integrity (0 fouten, 0 ankerfouten, 0 presetfouten), silhouette, pubsmoke (klaar na 8,9 s op 390 x 844), tri (budgetpoort ok), stats groen; opentest 26 openers 0 fouten met `--strikt-min` (frametijd p95 2,3 en 2,1 ms, grens 8); `ui_inner --open --strict` was rood op vier ingesloten knopen die elk door één straal op 20.000 van buiten te zien waren (Aanslagrubber achter, Rugframe achterbank, Kabelboom dashboard, Pakking waterkast rechts): vlaggen weg, daarna groen; itest 150 van 151 onder belasting (controle 14, dubbelklik op de kap, las een dubbelklik als twee klikken; opnieuw gedraaid op een rustige machine, zie `CHANGELOG.md` voor de uitslag van versie 7). Daarna is controle 16 (deelbare URL, overlay, versie) toegevoegd.

Eerder: de basislijn van golf 5 (tip `8e03e87`, oude testset) was groen op één frametijdmeting na die onder zware belasting 8,4 ms gaf.

## Wat nog verbetering verdient

De volledige lijst met nummers, vindplaatsen en volgorde staat in [docs/masterplan.md](docs/masterplan.md). De kop ervan:

1. Golf 5a-2 (parallel mogelijk): CI op GitHub (push-job en nachtrun), de nummerpipeline reproduceerbaar (`data/pn/` als canonieke invoer, `build_pn.py` als zuivere serialisatie, `pncheck.py`), screenshots verkleinen, `docs/cijfers.md` als vaste bron.
2. Golf 5c-1: robuustheid (`uiLastFit` centraal, PMREM na contextverlies, rondleiding pauzeren), het eerste beeld op de telefoon (het model krijgt nu circa 39 procent van de hoogte), "+n meer" bij labels, fade bij isoleren, themaknop, toegankelijkheid (focusval, menu-rol, canvasfocus, schakelaarcontrast), hulpvenster uit `PRESETS`, exporteren van een beeld, zoeksynoniemen, en tests voor toetsenbord, formaatwissel, 50 stappen terug, reduced motion, uitvalpaden, visuele regressie, labelankers.
3. Golf 5d: nummers (dekkingsronde op de 100 meest bestelde delen, CSV met unit-id en bron per nummer, paden met een schuine streep, 57 varianten die nog open staan op het chassisnummer).
4. Golf 5b-2: geometrie (B-stijl nagekeken met `pick.py` of klep en frame samen draaien, zijbekleding bagageruimte, ruitensproeiertank, aircoleidingen, vacuümslang, LOD voor bouten en veren, gedeelde constructies naar `core.js`, tekstcontract), met de visuele poort met vóór/na-paren.
5. Golf 5c-2: prestaties (nummergegevens lui parsen, één synchronisatie per handeling, renderlus splitsen) en codegezondheid (constanten, dode code, dubbele helpers, modusobject, `app2.js` opdelen, teksttabel).
6. Open feiten: het motorsuffix (811 of 813, het motorplaatje beslist), S6 of J6 voor de ATF, velgmaat, accuzijde, startknop, de hoeken van kap, portieren en klep aan de echte auto.

## Wat bij de gebruiker ligt

1. `gh-pages` verwijderen in GitHub (de proxy weigert het).
2. De tags `v1` tot `v6` naar GitHub brengen; de proxy weigert `git push --tags` en de API (403). In een eigen kloon:
   `git tag -a v1 9164d0a -m "Versie 1" && git tag -a v2 8095a3e -m "Versie 2" && git tag -a v3 60909fe -m "Versie 3" && git tag -a v4 9c03015 -m "Versie 4" && git tag -a v5 5b6cefa -m "Versie 5" && git tag -a v6 f3a7854 -m "Versie 6" && git push origin --tags`. Daarna kan `docs/v1/index.html` weg (tag `v1` is de terugvaloptie).
3. De telefoontest volgens [docs/telefoontest.md](docs/telefoontest.md) zodra versie 7 op Pages staat (`?debug=1` voor de overlay).
4. Het motorplaatje (F4R 811 of 813) en de metingen aan de auto (hoeken, velgmaat, accuzijde, startknop).
5. Besluit over golf 6 (ES-modules en een actuele three.js; advies: nee tot er een aanleiding is) en over een tweede bestand naast de pagina voor de nummergegevens (alleen als het artefact als kanaal mag vervallen).

## Werkwijze die werkte

- Elke sessie begint met `git ls-remote --heads origin` en een vergelijking van elke tak met `main`. De premortem op het plan van golf 5 miste twee commits doordat de meting van vóór een push was.
- Golven per domein in eigen worktrees, `mergecheck.py` vóór samenvoegen, na samenvoegen de volledige strikte set, dan pas `index.html` herbouwen en publiceren, dan de URL teruglezen.
- Een rode test onder belasting eerst herhalen op een rustige machine (de dubbelklik van controle 14 en de frametijd van opentest).
- Een melding van een poort eerst narekenen met `pick.py`, `probe.py`, `rays_bagage.py` of stralen; dan pas wijzigen.
- Een ondergrens per opener van minstens 0,8 maal de volle hoek of slag, zodat een botsingstoets niet beloond wordt met kleinere hoeken.
- Nummers: plakken met een harde stop, lokvogels in de verificatiepoort, `niet onderzocht` voor wat niet geverifieerd is, en het chassisnummer nooit in de repo.

## Bewaard in repo

- Plan en proces: `docs/masterplan.md`, `docs/premortem.md`, `CHANGELOG.md`, `CLAUDE.md`.
- Onderzoek: `docs/onderzoek/` (kennisbasis, beslissingen, databankenrecht, exterieur, motor, automaat, onderstel en interieur, UX-audit).
- Onderdeelnummers: `docs/onderdeelnummers.csv`, `src/partnumbers.js`, `tools/orkestratie/build_pn.py` (de invoer van golf 4 ontbreekt nog in de repo; zie golf 5a-2 in het masterplan).
- Hulpscripts: `tools/orkestratie/` (`finaltests.sh`, `cijfers.py`, `gallery.py`, `presetshots.py`, `docshots.py`, `stats.py`, `pickview.py`, `pick.py`, `shots.py`, `probe.py`, `rays_bagage.py`, `phone.py`, `gateshots.py`, `dumptree.py`, `poort.js`, `zone.py`, `mergecheck.py`). Uitleg: `tools/orkestratie/README.md`.
- Het werkplaatshandboek MR 415 en de referentiefoto's staan niet in de repo (rechten van Renault en derden).

## Vluchtig: scratchpad, weg als de container stopt

- `/tmp/claude-0/-home-user-laguna3/24f7dfc1-d667-544a-9754-10be18291035/scratchpad`: de drie audits (`audits/audit-app.md`, `audit-geometrie.md`, `audit-tooling.md`, de grondslag van het masterplan), de testuitvoer `g5base` (basislijn golf 5) en `g5a1` (strikte set), `inner2` tot `inner4`, `ot1` tot `ot3` (ondergrenzen), `itest2.txt`, en de worktree `wt-sister` van de zustertak.

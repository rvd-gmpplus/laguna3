# Verbeter-masterplan laguna3 (golf 5 en verder)

Stand van de analyse: 15 oktober 2026, 20:00 UTC. Tak `ccr-63d946bb-ng8q5l` is gelijk aan `origin/main` (`f3a7854`, versie 6). Gebaseerd op: eigen lezing van README, handomdraai, alle docs, `core.js`, `presets.js`, `build.py`, de screenshots en de testscripts; drie volledige audits (app-laag, geometrie, tooling en gegevens) over alle 7.690 broncoderegels; metingen in de container (lint, herbouw, gzip, gegevensstatistiek, GitHub-API); en een premortem op de eerste versie van dit plan, die drie dragende correcties opleverde (de zustertak, de ruis van de visuele poort, de omvang van het paginabudget). Wat alleen uit een audit komt en niet zelf is nagemeten, staat gemarkeerd als "audit".

## Context

De repo levert een werkende, goed gedocumenteerde explosietekening met 2.513 onderdelen, 26 openers, 43 presets en 1.334 onderdeelnummers. Versie 6 staat live op het artefact en op GitHub Pages. De vraag is: wat is het volgende niveau, en in welke volgorde. De analyse laat vijf dingen zien.

1. **Er loopt werk naast `main`.** `origin/ccr-bd755431-1qfniw` staat drie commits vóór `main`: `7cdfe3b` (18:23 UTC, de acht poort-hulpmiddelen `pick.py`, `shots.py`, `probe.py`, `rays_bagage.py`, `phone.py`, `gateshots.py`, `dumptree.py`, `poort.js`), `af22323` (19:18 UTC, dakglas op dekking 0,92 zoals bij de auto van de gebruiker, `src/panorama.js`) en `ca25166` (19:19 UTC, 4Control: de auto van de gebruiker heeft het niet; README, specificaties, kennisbasis, onderstel-interieur). Die tak is dus actief en bevat twee antwoorden van de gebruiker. Dit plan begint met het samenvoegen van die tak en vraagt die twee dingen niet opnieuw. `handomdraai.md` is hierdoor op vier punten achterhaald (zie bijlage B).
2. **De zichtbare kwaliteit stokt op een handvol bekende punten** (hoedenplank, camera's in het interieur, B-stijl, glas van binnen, zwevende olievuldop) plus vier modelfouten die van buiten of in een preset te zien zijn: langsliggers door de aandrijfassen, torsiebalk en nu ook de brandstoftank boven de vloer, de veerkoker als los kastje in de bagageruimte.
3. **Het vangnet heeft gaten.** Geen CI, geen budgetpoort voor driehoeken (golf 4 ging tussentijds over het carrosseriebudget en heette toch "groen"), `finaltests.sh` geeft altijd exitcode 0, waarschuwingen laten vier van de vijf tests passeren, `ui_inner` en `opentest` draaien zonder de strikte vlaggen, en de nummerpipeline (`build_pn.py`) is niet reproduceerbaar, niet idempotent en overschrijft de gegevens stil met niets als zijn invoer ontbreekt. In deze container ontbreekt Playwright, dus niets van de testset is nu te draaien.
4. **Er is drift**: de docs noemen voor dezelfde grootheden verschillende getallen, en `specificaties-en-bronnen.md` zegt op regel 147 dat het panoramadak niet in het model zit.
5. **De app-laag draagt schuld die groei remt**: alles globaal, ongeveer 50 losse velden per knoop, twaalf losse `if (OPENMODE)`-takken, ruim 30 magische getallen, en 42 procent van de pagina (565 kB nummergegevens) wordt bij het laden meteen geparsed.

Het plan houdt de werkwijze die werkte (golven per domein in eigen worktrees, eigendom per bestand, premortem, visuele poort, meten vóór wijzigen) en voegt eerst het vangnet toe. Elke versie die naar buiten gaat, moet iets bevatten wat de gebruiker als nieuw herkent; versie 7 is daarom niet alleen "camera's anders".

## Uitgangspositie in cijfers (zelf gemeten)

| Grootheid | Waarde |
|---|---|
| `python3 build.py --lint` | ok; herbouw is byte voor byte gelijk aan `index.html` (md5 `17b21be3…`) |
| `index.html` | 1.337.555 bytes, 316 kB gzip; `partnumbers.js` 565 kB (90 kB gzip): `units` 281 kB, `map` 267 kB, `note` 64 kB (wordt nergens getoond), `src` 48 kB |
| `PN_DATA` | 546 eenheden (110 past, 71 variant, 365 niet gevonden), 1.659 paden in `map` (671 zelf, 690 deel, 298 set), 43 info-paden |
| CSV | 7.388 regels; bijna alle bron-URL's naar autodoc.parts; 114 regels matchen op vier Engelse catalogusattributen ("Opening Temperature [°C]", "Thread Size", "Length [mm]") |
| GitHub | PR #1 en #2 gemerged (laatste 18:21 UTC), publiek, geen CI (alleen `pages-build-deployment`), geen LICENSE, geen tags, geen branch-protectie, `gh-pages` bestaat nog (versie 5), Pages serveert versie 6 |
| Zustertak | `ca25166`, 3 commits vóór `main` (zie context 1) |
| Container | geen `playwright`, geen three.js-cache; wel node 22, npm, `/opt/pw-browsers/chromium` |
| three.js | vastgezet op 0.147.0; r148 heeft `examples/js` verwijderd, r147 is de laatste versie met de niet-module OrbitControls; nieuwste is 0.186.1 |
| Firecrawl | om 19:30 UTC geen tegoed (402); daarna door de gebruiker op een ander account gezet, dus voor 5d weer bruikbaar naast Jina en Exa |
| Geschiedenis | golf 4: 7,5 uur van `9e0176d` tot `31a8f0d` met drie poorten (cycli van 1 u 50 en 1 u 26); carrosserieronde 6 uur met vijf poorten; "1 dag" was steeds de harde stop, niet het gemiddelde |

## Parallelle sessie: conflict en check-ronde

Op 15 oktober om 19:49 UTC werkt een andere sessie (Opus 5.5 met vijf subagents) op `ccr-bd755431-1qfniw`. Haar laatste pushes zijn `af22323` en `ca25166` (19:18 en 19:19 UTC); subagents werken in worktrees, dus geen push betekent niet dat zij klaar is. Haar opdracht volgt vrijwel zeker het advies in `handomdraai.md:84` (punten 1 tot 7 in een gerichte ronde, daarna de poort opnieuw). Dat overlapt één op één met golf 5b-1 hieronder en met A1, A14 en de docs: dezelfde bestanden (`src/bodyparts.js`, `src/interior.js`, `src/engine1.js`, `src/panorama.js`, `core.js:70`, `handomdraai.md`, `README.md`, `docs/*`, `tools/orkestratie/*`). Twee sessies tegelijk geven mergeconflicten en dubbel werk. Besluit: dit plan start pas na het sein van de gebruiker dat die run klaar is, en begint dan met een check-ronde van hoogstens een uur:

1. `git ls-remote --heads origin` en een compare van elke tak tegen `main`; de zustertak in zijn geheel samenvoegen (A1) en de uitkomst van haar poort lezen (`handomdraai.md`, `docs/testen.md`, `CHANGELOG` als die er is).
2. Uit 5b-1 schrappen wat zij al deed, per punt met het commit erbij; wat zij "deels" liet staan, blijft in 5b-1 met haar poortbeeld als vóór-beeld.
3. De uitgangspositie in cijfers opnieuw meten (lint, herbouw, gzip, `PN_DATA`-statistiek) en bijlage B herschrijven tegen de nieuwe `handomdraai.md`.
4. Bevindingen uit de audits die zij al oploste afstrepen (bijlage A), zodat agents geen opgeloste punten krijgen.
5. Pas daarna `ExitPlanMode` en de uitvoering vanaf `main`.

## Leidende principes

- Eerst meetbaar, dan mooier: elke verbetering krijgt een poort die hem had moeten vangen.
- `main` is altijd groen en publiceerbaar; elke golf eindigt met de volledige testset en een teruggelezen publicatie.
- Elke gepubliceerde versie heeft minstens één zichtbare opbrengst voor de gebruiker, plus drie vóór/na-paren tegen de vorige versie (de eis uit `docs/premortem.md:73`, die golf 4 niet heeft nageleefd).
- Eigendom per bestand blijft. Contracten (`core.js`, `body.js`, `anchors.json`, tests, `IGNORE` in de harness) wijzigt alleen de orkestrator, met een melding in de brief van de eigenaren.
- Niets wijzigen op grond van een melding zonder hem eerst met stralen, `pick.py` of een opname na te rekenen.
- Elke analyse en elke golf begint met `git ls-remote --heads origin` en een compare per tak; dit plan miste eerst twee commits doordat de meting van vóór 19:18 UTC was.
- Per golf worden start, samenvoeging en publicatie met tijd in `CHANGELOG.md` genoteerd, zodat de volgende premortem met echte duren werkt.

## Voortgang (19 oktober 2026; bijgewerkt na vervolgronde 5g, versie 13 gebouwd; de laatste publicatie is versie 12, `d4186f1`)

| Golf | Stand |
|---|---|
| 5a-1 | Gedaan: A2 (testomgeving, rooktest in 41 s in een verse container), A3, A4, A5, A6 (deelbare URL, overlay, versie, laadmeldingen, meta, favicon), A7 (protocol in `docs/telefoontest.md`; de sessie van de gebruiker kan op versie 7, met overlay vanaf versie 8). A1 gedaan om 01:20 UTC: de zustertak (29 commits, tip `b529ac1`, laatste commit 00:12 UTC, daarna 65 minuten stil) zit volledig in deze tak; vijf conflicten opgelost met haar geometrie en camera's en mijn ondergrenzen van 0,8 maal de hoek (spiegel 64 graden, rugleuningen en middenarmsteun 1,456 rad, armsteunkussen 0,92 rad, expansiedop 1,44 rad), `Rugframe` zonder `inner`, haar itest-controle 16 (telefoon staand) naast mijn controle 17 (deelbare stand). |
| 5a-2 | Gedaan: A8 (budgetten en `tri --gate`), A9 (openers als pad en preset-id's in `anchors.json`, `labelOnly` als kind van de labelgroep), A10 (`data/pn/` canoniek, `build_pn.py` als serialisatie met controles, `pncheck.py`; byte voor byte gelijk), A11 (`ci.yml` en `nightly.yml`; de eerste run bewees de omgeving en de poort op een oude `index.html`), A12 deels (versiestempel, `CHANGELOG.md`; de tags `v1` tot `v6` staan lokaal, de proxy weigert ze te pushen, zie `handomdraai.md`), A13 deels (LICENSE, `CLAUDE.md`, `.gitattributes`, `.gitignore`, `mergecheck.py`; screenshots verkleinen wacht op de nieuwe screenshots van versie 7), A14 (`cijfers.py` en `docs/cijfers.md`, drift opgeruimd). |
| 5b-1 | Gedaan door de parallelle sessie (zie hieronder), inclusief haar herstelronde van 22:50 tot 00:12 UTC (acht commits: achterklep met open glas, gasveren langs de zijwand, B-stijlafdekking, hemel onder het dakframe, Dekselvoering, zonneschermen van binnen zichtbaar, expansiedop als scharnier met vulopening, telefoon staand, `hideWhen` voor de hoedenplank). |
| 5c-1 | Gedaan (16 oktober, 02:00 tot 04:00 UTC, twee agents): app R1b, R2, R3, R4, R5 (zonder lettertypes), U2, U4, U5, U6, U7, U8, U9, U10 met controle 18 (36 controles); tests 19 tot 22 (21 controles), `visdiff.py` met basislijn op 640 x 400, `anchorcheck.py`, bevroren testcontract. itest 218. U1 en U3 waren al van golf 5. Open: de visuele poort met vóór/na-paren tegen versie 7 en de telefoonsessie van de gebruiker. |
| 5d | Structureel deel gedaan (N3, attributen, N4 beoordeeld; N6 open zonder ophaalroute); N2 en N5 open: de ophaalroutes (Jina 402, Firecrawl zonder tegoed, autodoc achter Cloudflare) zijn dicht, dus die plakken wachten op tegoed of op een lijst van de dealer. |
| Versie 7 live | De parallelle sessie zette na het samenvoegpunt van PR #3 (`b529ac1`) nog drie commits op haar tak (zijbekleding bagageruimte in vilt, onderzijde van de bagagevloer, dakcamera's en schermcassette, nieuwe interieurcamera's) en publiceerde die stand als versie 7: artefact om 02:02 UTC, `main` via PR #4 (`edab342`), Pages vanaf 09:31 UTC. Daarmee is G4 deels gedaan (zijbekleding over wielkast en vulpijp; leest nog trapvormig, punt 3 in `handomdraai.md`). `main` is op 16 oktober in deze tak samengevoegd (conflicten: ondergrens 1,456 rad van de middenarmsteun met haar nieuwe camera, docs); het werk van deze tak heet nu versie 8. |
| Versie 8 live | PR #3 samengevoegd als `4e837c5` op 16 oktober om 10:15 UTC; Pages en artefact byte voor byte teruggelezen. |
| Golf 5b-2 | Gedaan op 16 oktober 2026 (16:18 tot 20:21 UTC), tak `golf-5b2`, versie 9 gebouwd (`225000f`) en later gepubliceerd (zie de rij "Versie 9 live"). Per punt zie "Stand na de golf" bij Golf 5b-2. Poort: `finaltests.sh` groen behalve `visdiff` (eigen basis B0 van de machine, 11 rode beelden, alle in de vooraf opgegeven lijsten); itest 222 van 222, opentest 0 fouten, integrity 0 fouten, silhouet ok, ankers 352/319/265, budgetpoort ok, pubsmoke ok; K1 tot K13 in twee panels beide 10 ja, 3 deels, 0 nee, geen kenmerk lager; S7 7 van 9, doel 8 niet gehaald. Premortem: `docs/premortem.md`. |
| Versie 9 live | Op 16 oktober om 21:30 UTC in `main` (`3be230e`), Pages en artefact om 21:35 UTC byte voor byte teruggelezen (`CHANGELOG.md`). |
| Golf 5b-3 | Op 17 oktober 2026 gebouwd tot en met ronde 9 op de tak `golf-5b3` (versie 10, gepubliceerd): de zeven takken en golf 2 zijn samengevoegd, de lint-regels R4, R5 en R7 zijn fouten, de oude helpernamen zijn weg, en de rondes 2 tot en met 9 (B-stijl, achterruit, gasveerplaatje, hoedenplank, gordelband, scharnierpennen van de hoedenplank, gasveercilinder, instaplijst) zijn samengevoegd. De export naar espace5 (3.3) is gedaan op de espace5-tak `golf-5b3-export` (niet samengevoegd). `origin/main` met `f63b185` (de samenvoegmodus neemt uv mee, uit een andere sessie) is erin samengevoegd (`12f2f95`). `index.html` is herbouwd in fase 3.5, in de rondes 2 en 3, na ronde 8 (`a90786b`) en na ronde 9 (`b775511`). De strikte set op `a90786b` is gedraaid (Mac en VM: alles groen behalve `visdiff`, gelijk aan `d4d03a6`); op `b775511` is de Mac-set groen behalve `visdiff` (6 rood, dezelfde als op `a90786b`), in de VM ook (13 rood, gelijk aan `a90786b`; itest los herhaald 232 van 232 na een `Page.reload`-timeout in de volledige set); na de vernieuwde Linux-basislijn (`a5a1db2`) is de volledige VM-set groen (`visdiff` 42 van 42). De poort van ronde 3 (stand `0317061`) was groen (K-panels tweemaal zonder kenmerk lager dan B0, S7 9 van 9). De eindpoort op `a90786b` was ROOD op één kenmerk (plak a K2 Voorportieren, de dorpel); ronde 9 loste dat op en de poort na ronde 9 is GROEN (17 kenmerken, 0 lager dan B0). Per punt: "Stand na fase 3" en "Rondes 2 tot en met 9" bij Golf 5b-3. |
| Versie 10 live | Op 17 oktober om circa 21:10 UTC in `main` (`d3fe58f`, fast-forward van `f63b185`; bevat ook `f63b185` uit een andere sessie en `47fb5ae`), ci en Pages success; Pages om 21:20 UTC en het artefact om circa 21:21 UTC byte voor byte teruggelezen (`CHANGELOG.md`). |
| Na versie 10 (18 oktober 2026) | PR #8 (`opentest.py`, `EPS = 1e-6`) is samengevoegd (`e7fc7b1`) en gaat met de volgende export naar espace5 (besluit: `docs/onderzoek/beslissingen.md`, 18 oktober 2026). De tags `v1` tot en met `v10` staan sinds 18 oktober 2026 op GitHub (`handomdraai.md`, punt 2). De espace5-tak `golf-5b3-export` is op 18 oktober 2026 samengevoegd en gepubliceerd als espace5 versie 4 (`main` `7467be7`, framework uit laguna3 `09d44c4` met de haak `extraTests`; set op Mac en Linux-VM functioneel groen, visdiff tegen `main` op hetzelfde platform met alleen bedoelde verschillen, daarna een Linux-basislijn uit de VM; Pages en artefact byte voor byte teruggelezen; tags `v1` tot en met `v4`; zie `CHANGELOG.md` van espace5). |
| Golf 5c-2 | Gedaan op 18 en 19 oktober 2026 op de tak `golf-5c2` (tip `84b9adc`), versie 11 gebouwd en nog niet gepubliceerd. Vier blokken in eigen worktrees, samengevoegd in `2644a80` (A: K7 tot en met K11), `ca0e159` (B: P1 tot en met P4 en de presize van de tekenbuffer), `59dde45` (C: K1 tot en met K4 en K6) en `c00783d` (D: K5, `initAppFields` en `app2.js` in vijf bestanden); daarna advisor ronde 1 (Opus, max): PASS onder voorwaarden, geen P1, de P3-punten zijn opgepakt in `84b9adc`. Per punt zie de kolom Stand in de tabel van Golf 5c-2, de meting en de open punten onder "Stand na golf 5c-2". Poort: `docs/testen.md`, "Resultaten golf 5c-2" (uitslag Mac: Mac op `84b9adc` (19 oktober 2026, 05:02 tot 05:14 UTC) alles groen in één run: 13 van 13 tests, itest 232 van 232, visdiff 42 van 42 tegen een eigen Mac-meting van `ca0e159`, anchor ok; ruis: alleen `GPU stall due to ReadPixels`; uitslag VM en visdiff: VM op `84b9adc` (05:14 tot 05:32 UTC) alles groen behalve visdiff, 40 van 42 tegen de basislijn van versie 10: 33-tailgate (2,52 procent, K9) en 38-openDoors (1,53 procent, K11), beide bedoeld en bekeken; daarna de Linux-basislijn vernieuwd in `922f416` (42 van 42 binnen de drempel, anchorcheck.json ongewijzigd)). Besluiten van de gebruiker van 18 oktober 2026: `docs/onderzoek/beslissingen.md`. |
| Golf 5f en 5e | Gedaan op 19 oktober 2026 op de tak `golf-5f` (tip `8fe6435`, `VERSION` 12), gepubliceerd als versie 12 (`d4186f1`, tag `v12`): carrosserie in drie rondes plus een advisor-ronde (S7 7 van 9, besluit B7 voor kenmerk 4), F1 tot en met F4, de galerij op de echte GPU. Per punt en met de commits: sectie "Golf 5f en 5e". |
| Vervolgronde 5g | Gedaan op 19 oktober 2026 op de tak `golf-5g` (`VERSION` 13), nog niet gepubliceerd: de waarnemingen van de gebruiker aan de eigen auto (accu links achter boven de automaat, velg 18 inch, motorkap, achterklep, multiriem). Zie de sectie "Vervolgronde 5g". |
| Volgende | Na vervolgronde 5g is nog geen golf gepland. Versie 11 is gepubliceerd (19 oktober 2026, `main` fast-forward `2c42e30..1a856a5` (met PR #8) gepusht om 05:33 UTC; ci success (05:33 tot 05:38), pages build and deployment success (05:33 tot 05:34); Pages om 05:38 en het artefact (artefactversie 13) byte voor byte teruggelezen; tag `v11` op `1a856a5`). De export van 5c-2 naar espace5 is gedaan: espace5 versie 5 (`0f2b69c`, gepubliceerd 19 oktober 2026, Mac en VM alles groen, visdiff 51 van 51, tag `v5`). Open punten voor een volgende golf: (1) `ready` op SwiftShader, circa 2 s GPU-tijd van het eerste frame, het doel van 25 procent is niet gehaald en geaccepteerd; (2) S7 kenmerk 4 (B-stijl als dunne lijn, chroomlijst zwak), in de meting bij K11 voor 0,92 en 0,80 even deels; (3) de rommelige staart en de spikkels die de S7-beoordelaars noemen; (4) de T4-marge van circa 8,9 kB gzip (exact: 361.239 bytes gzip -6 en 1.350.225 bytes raw op `80bee59`, dus een marge van 8.761 bytes gzip op de eindstand), waarmee een volgende geometriegolf weer ruimte heeft. `index.html` wordt alleen opnieuw gebouwd als er in `src/` iets verandert. |

## Golf 5a-1: vangnet-kern (eerst; 1 dag, met een stopregel)

Doel: de zustertak zit in `main`, een verse container kan bouwen en testen, en een rode uitkomst kan niet meer "groen" heten. Pas als A2 werkt, zijn de andere aanvaardingen te toetsen; tot die tijd heet niets groen op grond van lezen.

| Nr | Taak | Bestanden | Aanvaarding |
|---|---|---|---|
| A1 | `origin/ccr-bd755431-1qfniw` in zijn geheel samenvoegen (drie commits), na afstemming met de sessie die erop werkt: `handomdraai.md` noemt die tak als werktak, dus eerst vaststellen of daar nog iets open staat. Daarmee vervallen handomdraai punt 21 (hulpmiddelen), punt 8 (dakglas) en punt 18 (4Control). | `tools/orkestratie/*`, `src/panorama.js`, docs | `git log main..origin/ccr-bd755431-1qfniw` is leeg; `pick.py` en `gateshots.py` draaien op de huidige bron |
| A2 | Testomgeving vastleggen als harde poort: `requirements.txt` (playwright vastgezet), `tools/setup.sh` (pip via de proxy, three.js via `npm pack` met SHA-256-controle, Chromium uit `/opt/pw-browsers`), SessionStart-hook in `.claude/settings.json`, vergrendeling tegen de dubbele `npm pack` bij een lege cache (`harness.py:23-33`). Stopregel: is `tools/setup.sh && python3 tools/smoke.py` niet binnen een uur groen (proxy, pip, Chromium), dan draait 5a-1 alleen de browserloze delen (A1, A3 argumentcontrole, A9, A10) en schuift de rest naar de eerste golf met een werkende harness. | nieuw `requirements.txt`, `tools/setup.sh`, `.claude/settings.json`, `tools/harness.py` | smoke slaagt in een verse container zonder handwerk |
| A3 | `finaltests.sh` robuust: `set -u`, argumentcontrole (nu schrijft hij zonder argument naar `/commit.txt`), tijd per test, één gezamenlijke exitcode, `ui_inner.py --open --strict`, `opentest.py --strikt-min`, en een vaste lijst van tests die CI vergelijkt met de verwachting (zodat een test niet stil uit de lijst kan). | `tools/orkestratie/finaltests.sh` | exitcode 1 zodra één test faalt; duur per test in de uitvoer |
| A4 | `open.min` op de vier leiders zonder ondergrens (Zonnescherm voor en achter, Olievuldop, Expansiedop), met een regel in `opentest.py`: `min` minstens 0,8 maal `angle` of `move`, anders een fout (de verdediging tegen `min: 0.01`). | `panorama.js:129`, `engine1.js:432`, `systems.js:81`, `tools/opentest.py` | `--strikt-min` groen |
| A5 | Waarschuwingsbeleid gelijk aan `docs/testen.md:20`: `harness.errors()` telt ook `warning`; `IGNORE` (`harness.py:20`) wordt contract: elke uitzondering met reden en datum, alleen door de orkestrator. | `tools/harness.py:20, 95` | smoke, integrity, silhouette, opentest, pubsmoke falen op een consolewaarschuwing |
| A6 | Zichtbare opbrengst voor versie 7: (a) `?debug=1` toont een overlay met fps, tekenopdrachten, pixelratio, `lite` en versie, zodat een melding van een telefoon meetbaar is; (b) URL-toestand `?preset=` en `?open=` zodat een stand te delen is (`uiPush` blijft de bron, de URL volgt); (c) `og:title`, `og:image` (`docs/screenshots/gemonteerd.png`), `description` en een favicon; (d) een laadtoestand met voortgang uit `uiTiming` en een `<noscript>`; (e) de versie zichtbaar in het hulpvenster. | `src/head.html`, `src/app2.js`, `build.py` | een gedeelde link opent op de bedoelde stand; de overlay toont cijfers op de telefoon |
| A7 | Eerste telefoonsessie van de gebruiker met de overlay uit A6 en een protocol van één pagina (`docs/telefoontest.md`: Alles uit elkaar, Alles open, lang drukken, motorkap van boven voor de spikkels; melden: schokkerig ja of nee, laadtijd, "lichte weergave" gezien). De uitkomst stuurt P4 en U3 in 5c. | nieuw `docs/telefoontest.md` | één ingevuld verslag; `handomdraai` punt 19 krijgt een eerste meting |

Poort van golf 5a-1: A2 groen in een verse container; `finaltests.sh` met één exitcode en tijden; de zustertak samengevoegd; versie 7 kan gebouwd worden met overlay, URL-toestand en versie.

## Golf 5a-2: vangnet-rest (1 dag, parallel aan 5b-1; raakt `src/` alleen via de orkestrator)

| Nr | Taak | Bestanden | Aanvaarding |
|---|---|---|---|
| A8 | Budgetpoorten: budgetten in `anchors.json` (alleen-lezen: 700.000 totaal, 240.000 Aandrijflijn, 190.000 Carrosserie, vast te leggen voor Onderstel en Interieur); `tri.py --gate` faalt erboven en meldt per hoofdgroep ook het aantal onderdelen (verhuizen van een zwaar deel naar een andere groep wordt zichtbaar); `stats.py` faalt boven `buildCar` 600 ms. Paginabudget 1,4 MB raw en 330 kB gzip; daarnaast een groeiregel: meer dan 100 kB groei in één golf zonder reden in het commitbericht is rood. | `tools/anchors.json`, `tools/tri.py`, `tools/orkestratie/stats.py` | de situatie van `g4final3` (Carrosserie 199.394) is rood |
| A9 | Verwachte aantallen en namen: `anchors.json` krijgt `openers` (26), `preset_ids` (43) en de presetnamen die nu niet in de ankerlijst staan (Glaspaneel voor, Rugleuning groot deel, Stuurbekrachtiging, Stuurpomp, Tankklep, Zonnescherm voor, en de `labelOnly`-namen van Rem linksvoor); `integrity.py` toetst ze; `appPresetNames` neemt `labelOnly` mee (`presets.js:73`). | `tools/anchors.json`, `tools/integrity.py`, `src/presets.js:73` | een verdwenen opener of preset is een fout |
| A10 | Nummerpipeline reproduceerbaar en zuiver: `data/pn/` als canoniek, genormaliseerd schema (de huidige `PN_DATA` per plak gesplitst, met `kind` en de niet-http-bronnen die `build_pn.py:84` nu laat vallen), `build_pn.py` herschreven tot alleen serialiseren plus CSV (stoppen bij nul invoerbestanden, invoermap als argument), `RENAME`/`DROP`/`UNIT_FIX`/`INHERIT` als eenmalige migratie in plaats van pijplijnstap (`UNIT_FIX` plakt nu bij elke run een zin achter `note`, `build_pn.py:137-140`, dus het script is niet idempotent), en een gecommitte `data/tree.json` (uit `dumptree.py`) die de orkestrator ververst zodat `tools/pncheck.py` browserloos kan draaien: `partnumbers.js` en CSV opnieuw gebouwd en gelijk aan wat gecommit is, en het aantal bronnen per nummer mag niet dalen. | `tools/orkestratie/build_pn.py`, nieuw `data/pn/`, `data/tree.json`, `tools/pncheck.py` | `build_pn.py data/pn` twee keer achter elkaar geeft dezelfde bytes |
| A11 | CI op GitHub (`.github/workflows/`), de repo is publiek dus de runners zijn gratis. Push-job (richting 5 tot 10 minuten): lint, herbouw en vergelijk `index.html` (stale is rood), `pncheck`, smoke, integrity, silhouette, `tri.py --gate`. Nachtelijk of handmatig (richting 1 tot 2 uur): itest met poorten, opentest, `ui_inner --open --strict`, pubsmoke. Tijdgrenzen via omgevingsvariabele (`pubsmoke.py:91` heeft een harde 20 s; op CI 60 s, met de gemeten tijd in de uitvoer). Een rode nachtrun opent een issue en stopt niets; struikeldraad T3 geldt alleen voor de push-job. SwiftShader op een Ubuntu-runner is te verwachten, niet getest: de eerste run is een proef. | nieuw `.github/workflows/ci.yml`, `nightly.yml`, `tools/harness.py`, `tools/pubsmoke.py` | push-job groen op `main`; een PR met oude `index.html` is rood |
| A12 | Versie en kanalen: `__laguna.version` uit een inhoudshash van de samengevoegde bron (nooit uit HEAD: de commit die `index.html` bevat is bij het bouwen onbekend, en `git describe` faalt zonder tags), tags `v1` tot `v6` (v6 op `f3a7854`), `CHANGELOG.md` met de zes versies en voortaan start, samenvoeging en publicatie per golf, `docs/v1/index.html` vervangen door tag `v1`. Eén kanaal als bron (Pages vanaf `main`), het artefact als spiegel met dezelfde bytes, `gh-pages` weg (gebruiker). | `build.py`, `src/head.html`, `src/app2.js`, nieuw `CHANGELOG.md` | de pagina toont welke versie je ziet; tags bestaan |
| A13 | Hygiëne: `LICENSE` (keuze bij de gebruiker) met een gegevensnotitie voor de CSV, `CLAUDE.md` (bouwen, testen, contract, eigendom, in 40 regels), `.gitattributes` (CSV eol, PNG binary), `.gitignore` (uitvoermappen, `.DS_Store`, `node_modules`), `mergecheck.py` bijwerken met `panorama.js`, `partnumbers.js`, `opentest.py`, `open_allow.json`, `orkestratie/*`, `data/*`; argparse en `--help` op de orkestratiescripts; tijdelijke mappen opruimen in `harness.close()`; screenshots naar WebP of pngquant (93 procent van `.git` zijn 33 PNG-blobs). | repo-root, `tools/orkestratie/mergecheck.py`, `tools/harness.py:38`, `docs/screenshots` | `mergecheck.py` kent elk bestand in de repo |
| A14 | Documentatiedrift: één bron van kerncijfers, `docs/cijfers.md`, gegenereerd uit `stats.json` door `tools/orkestratie/cijfers.py` met een vaste lijst grootheden (knopen, groepen, onderdelen, driehoeken per hoofdgroep, tekenopdrachten met en zonder bundelen, presets, openers, ingesloten knopen, labelankers, paginagrootte, opstarttijden); README, ontwerp en testen verwijzen ernaar. Correcties: `ontwerp:125` (37 presets, zes categorieën), `ontwerp:156` en `testen:124` (253 ingesloten knopen), `ontwerp:163-174` en `testen:222` (630.368 driehoeken, 390 tekenopdrachten), `specificaties:147` (panoramadak "niet in het model"), `specificaties:99` (ATF als Bevestigd), `handomdraai` (bijlage B), `orkestratie/README:10` (zeven in plaats van twaalf screenshots), `testen.md:76` (lege regel breekt de tabel), `testen.md:170` (vier leiders zonder `min`, geen volgers), `onderzoek/README.md` (aanvulling van 14 oktober ontbreekt). Scratchpad-verwijzingen vervangen door "niet bewaard". Getallen schrappen in plaats van corrigeren is niet toegestaan: `cijfers.md` moet de hele lijst bevatten. | `docs/*.md`, `README.md`, `handomdraai.md` | geen getal staat op twee plekken met twee waarden |

## Golf 5b-1: camera's, hoeken en materialen (GEDAAN door de parallelle sessie, 15 oktober 19:10 tot 21:36 UTC)

Check-ronde van 23:10 UTC: de zustertak `ccr-bd755431-1qfniw` (21 commits, tip `8e03e87`) bevat de hele golf 5b-1 en meer. Afgestreept, met het commit erbij:

| Nr | Wat | Gedaan in |
|---|---|---|
| B1 | Camera Achterklep `[0.3, 0.9, -1]` | `445d934` |
| B2 | Hoedenplank 33 graden (`intPlankAng = 0.58`) | `ccf2e07` |
| B3 | Steunstang Ø16 mm in `darkSteel` plus camera motorkap | `445d934` (dikker dan het plan wilde; de poort beslist) |
| B4 | B-stijl in lak met sluitplaat en slotbeugel, camera voorportieren `z 0.12` | `445d934` |
| B5 | Camera's Armsteunkussen en Middenarmsteun achter | `ccf2e07` |
| B6 | Rugleuningnaad: beige springt 14 mm in, donkere flens | `ccf2e07` |
| B7 | Voorruit van binnen 0,45 maal de dekking via `onBeforeCompile` (`MAT.glassWs`), alleen de voorruit | `445d934` |
| B8 | Olievuldop om een scharnierlip (hinge, 1,8 rad) | `18fc094` |
| B9 | Nagekeken? Niet in de commits; blijft open als B9 in 5b-2 | |
| B10 | K5 en K8 opnieuw geijkt | `8e03e87` |

Ook al gedaan uit andere golven: G2 langsliggers boven de aandrijfassen (`a8bdff9`, `bodFrontRail`), G3 opkant in de bodemplaat boven de torsiebalk en tank en koolstoffilter verplaatst (`a8bdff9`), U1 dimmen bij duiken (`5d56283`, `uiSetDim`), U3 deels: zijkolom voor telefoons in liggende stand (`5d56283`), N1 Vulopening en Vulklepring (`d01ea58`), N5 deels: 14 eenheden gekozen op RDW en chassisnummer (`d01ea58`, veld `kz`, blok "Gekozen voor deze auto"), F1 ATF volgens MR 415 (`b684bb8`, `00ed700`), F3 multiriem 1672 mm (`18fc094`), databankenrecht-analyse (`docs/onderzoek/databankenrecht.md`), motorcode F4Rt 813 waarschijnlijk (`b684bb8`), onderstel: remleidingen achter om langsarm en veer heen (`49eb183`).

Haar herstelronde (22:50 tot 00:12 UTC, `bc2e0c9` tot `b529ac1`) sloot ook B9 (achterklep: open glas met lijmrand, gasveren langs de zijwand, `d5656c8`) en ging verder dan het plan: zonneschermen van binnen zichtbaar met een stop voor de cassette (`7d48b2b`), expansiedop als scharnier met zichtbare vulopening (`7d48b2b`), Dekselvoering en nieuwe interieurcamera's (`bc2e0c9`), telefoon staand met itest 16 (`7443595`), `hideWhen` in de engine voor de hoedenplank (`b529ac1`).

Niet gedaan door die sessie: de volledige testset op haar stand, `index.html` herbouwen, `handomdraai.md` en de docs sluitend maken, screenshots, publicatie van versie 7, en de visuele poort met vóór/na-paren. Dat doet deze sessie na de samenvoeging van 01:20 UTC.

## Golf 5b-2: geometrie en budget (GEDAAN op 16 oktober 2026, versie 9 gebouwd en op dezelfde dag gepubliceerd; G2 en G3 waren al gedaan, zie 5b-1)

Doel: de vier zichtbare modelfouten dicht, ontbrekende delen erbij, binnen budget. Hoger risico (nieuwe vormen, vier eigenaren bij de vloer), daarom na 5c-1 en 5d.

| Nr | Wat | Waar | Grond |
|---|---|---|---|
| G1 | Ruimte maken vóór G2: minder tussenstations in de bumperschalen (`:703-706`, `:792-797`) en de achterschermen (`:628-637`), doel 10.000 driehoeken vrij in Carrosserie (187.554 van 190.000). Poort: `visdiff` en `gallery.py exterieur` op 1280 × 800, zodat segmenten niet op zichtbare vlakken omlaag gaan. | `bodyparts.js` | audit |
| G2 | Langsliggers als geëxtrudeerd zijprofiel met een brug over de aandrijfas (z 1,28 tot 1,46, onderkant minstens 0,39, bovenkant onder de veerpoottoren 0,58); de accu op 0,407 verhuist niet. Daarna `integrity.py`. | `bodyparts.js:563`; as in `drivetrain.js:516-520` | bekende doorsteek |
| G3 | Verhoogd vloerdeel van z −0,70 tot −1,30 op y circa 0,37 voor |x| < 0,5, zodat torsiebalk en brandstoftank (y 0,183 tot 0,353, nu in de cabine) onder de vloer liggen. Eigen minigolf met één gecombineerde brief voor vier eigenaren: vloerplaat en dwarsbalk (`bodyparts.js:547-555`), tank en spanbanden (`systems.js:215-221`), torsiebalk (`chassis.js:329`), vloerbedekking (`interior.js:409`); `integrity.py` en `rays_bagage.py` vóór en na. | zie waar | README-beperking plus nieuwe bevinding (tank) |
| G4 | Zijbekleding bagageruimte over de veerkoker (de koker steekt circa 11 cm boven de vloer uit als los kastje), B- en C-stijlbekleding. | `interior.js` (nieuw deel), `bodyparts.js:478-491` | preset Bagageruimte; audit |
| G5 | Ontbrekend en zichtbaar: ruitensproeiertank met pomp (de slang eindigt op `bodyparts.js:685` in het niets), vacuümslang van de rembekrachtiger (nippels bestaan: `engine2.js:108`, `chassis.js:389`), aircoleidingen met expansieventiel. | `bodyparts.js:685`, `engine2.js`, `systems.js` | lege plekken in de motorruimte |
| G6 | LOD: `hexBolt` ring 16 naar 8 en steel 10 naar 6 segmenten (circa 250 bouten, −12.000 driehoeken), `spring()` met punten per winding, klepveren van 10 naar 6 per winding. Poort: `visdiff` en `gallery.py motor`. | `core.js:173-187`, `engine1.js:317` | ruimte in Aandrijflijn (235.534 van 240.000) |
| G7 | `inner`-kandidaten (klepblok, raambediening en botsbalk in het portier, distributie onder de kappen, waterpompwaaier, gasklep-inwendig, dynamo-inwendig, stuurairbag-inwendig, membraan rembekrachtiger, lagerkogels, aanslagrubbers): alleen vlaggen wat in `ui_inner.py --strict` en `--open` nul eerste treffers geeft; het aantal `inner`-knopen stijgt per golf alleen met een lijst per knoop in het commitbericht. | `drivetrain.js:261`, `bodyparts.js:250-292`, `engine2.js:28-43, 115-118, 298`, `engine3.js:28-73`, `chassis.js:92-123, 295-387` | tekenopdrachten omlaag |
| G8 | Contractronde door de orkestrator: verouderde terugvalwaarden voor de stuurpomppoorten weg (`chassis.js:202, 219`); `MAT.brass` bestaat niet (`drivetrain.js:386`, `systems.js:43`); naafpunt `0.775` naar `TRACK_F` (`drivetrain.js:517`); gedeelde maten voor achterveer, torsiebalk en koppelstang op één plek (`chassis.js:314-316, 329, 228` tegen `bodyparts.js:478, 484`, `drivetrain.js:480`), in `body.js` of een nieuw `src/shared.js`; `bellows` en de andere gedeelde constructies naar `core.js` (`sysHose`, `drvRing`, slangklem, moer in vier varianten, `intHinge`, Sutherland-Hodgman drie keer, `panWeld` gelijk aan `bodWeldAll`); geometrie van portierpanelen en spiegels delen via een zijde-loze cache-sleutel (knopen blijven per zijde, want openers en `look.dir` verschillen per kant; het bundelen kan al met spiegeling om, `app1.js:773, 785`). | zie waar | contract; onderhoud |
| G9 | Tekstcontract, alle eigenaren: 22 spec-paren met "geschat", "aannemelijk" of "circa" naar `d` of weg; eindoverbrenging 3,571 (`drivetrain.js:216`) tegen 3,804 (`:188, :420`) één waarde; ECU-tekst "nokkenasverstelling" (`systems.js:319`) tegen "geen faseversteller"; `Carterbouten` 18 stuks met "minimaal 18" (`engine2.js:215-227`) verifiëren in MR 415; notatie uniform (duizendtalpunt, komma als decimaal, "Ø" zonder spatie, "2,0 Turbo"); 54 beschrijvingen korter dan 25 tekens aanvullen met wat het deel doet; `ZF = 2.345` (`body.js:5`) in de doc. Lint-regels in `build.py`: punt-decimaal met eenheid, "geschat" in `spec`, cache-sleutel zonder prefix per bestand. | zie waar | tegenstrijdig voor de gebruiker |

Poort van golf 5b-2: `finaltests.sh` strikt groen, `tri.py --gate` binnen budget, `visdiff` tegen de basislijn van versie 7 met alleen bedoelde verschillen, `integrity.py` 0 fouten, poort K1-K13 niet lager op een kenmerk in twee onafhankelijke panels, S7-poort opnieuw op `gallery.py exterieur` (doel 8 van 9).

### Stand na de golf (16 oktober 2026)

De golf liep volgens de herbouw van de premortem (`docs/premortem.md`): fase 0 (contracten, meetscripts, B0), golf A (zes domeinagents in worktrees, per tak gecontroleerd en samengevoegd met een presetlijst vooraf, daarna nazorg), golf B (carrosserie), eindpoort. Tijden: `CHANGELOG.md`.

| Nr | Stand | Toelichting |
|---|---|---|
| G1 | Gedaan | Bumperschalen en achterschermen met stations naar doorbuiging; Carrosserie 188.102 naar 177.291 driehoeken na golf A (huidige stand: [cijfers.md](cijfers.md)); `huid.py` hoogstens 1,22 mm van de oude huid, geen nieuwe doordringing. Dat is 10.811 driehoeken vrij, boven de doelstelling van 10.000. |
| G2, G3 | Gedaan in 5b-1 | |
| G4 | Deels | G4a zijbekleding bagageruimte als doorlopend profiel en G4b B- en C-stijlbekleding gedaan. G4c (vulpijp korter onder de bekleding) naar 5b-3. |
| G5 | Deels | G5a ruitensproeiertank met pomp en slangen (schematisch geplaatst, geen bron voor de plek) en het kapdeel (T-stuk naar de koppeling van systemen, golf B); G5b vacuümslang van de rembekrachtiger; het Leidingblok vrij van de laadluchtslang. G5c aircoleidingen en expansieventiel naar 5b-3. |
| G6 | Gedaan | `hexBolt` steel 6 en ring 8 segmenten (fase 0), klepveer 8 per winding. De `spring()`-parameter naar 5b-3. |
| G7 | Gedaan, smaller dan gepland | `inner` op de zijdelingse botsbalk van de achterportieren, het Krukastandwiel en enkele onderstelknopen; de voorportier-botsbalk, de Raambediening linksachter en het Membraan zijn weer niet-`inner` omdat ze bij 400 richtingen (`UI_INNER_DIRS=400`) of met de kap open van buiten te zien zijn. |
| G8 | Deels | G8a (geen terugvalpoorten) en G8b (`MAT.bearing`, `MAT.drvBrass`) gedaan; eindoverbrenging op een plek (G9b). G8c naafpunt op `TRACK_F` is teruggedraaid wegens acht nieuwe doordringingen tot 2,44 mm. G8d, G8e en G8f naar 5b-3. |
| G9 | Deels | G9a, G9b, G9c, G9d en G9f gedaan; teksten zonder bron afgezwakt in de nazorg. G9e (notatie, beslissing van de gebruiker) en het grootste deel van G9h naar 5b-3. |

Naast het plan: de melding van de gebruiker over zwarte blokjes bij de portierscharnieren is nagerekend en opgelost (platte bladen in lakkleur met stalen pen, clash 0); chroomlijst langs de B-stijl voor S7 kenmerk 4; `clash.py`, `huid.py` en `data/clash-toegestaan.json` als blijvende meetmiddelen.

Poort, uitkomst:

- `finaltests.sh` op `0bdbef1` (macOS) groen behalve `visdiff`. De basislijn `docs/baseline` was voor deze golf niet bruikbaar: software-rendering op macOS wijkt circa 2 procent per beeld af van de Linux-container, en de basislijn is bovendien verouderd (een ander aantal onderdelen). `visdiff` liep daarom tegen een eigen basis B0 van de machine (de presets van `426d6aa` met de nieuwe harness, `VISDIFF_BASIS`). Elf rode beelden, alle in de vooraf opgegeven lijsten: bodyOff, engine, engineAll, psPump, battery, gearbox, gearboxAll, converter, diff, doorLF, interior.
- itest 222 van 222, opentest 0 fouten (31 meldingen), integrity 0 fouten, silhouet ok, ankers 352/319/265, budgetpoort ok, pubsmoke ok.
- K-panels (twee, voor en na): beide 10 ja, 3 deels, 0 nee, niets blokkerend, geen kenmerk lager (regel vooraf: een kenmerk telt pas als lager als beide na-panels onder het laagste B0-oordeel uitkomen; de panels verschillen onderling op K2 en K9).
- S7: 7 van 9 vóór en na (kenmerk 4 en 8 deels). Doel 8 niet gehaald; niet herhaald (vooraf vastgelegd: hoogstens twee runs, de lagere telt).
- `docs/baseline` is in deze golf niet vernieuwd; een Linux-basis die B0 vervangt volgt alleen als de gebruiker dat wil (zie 5b-3).

## Golf 5b-3: restpunten van 5b-2 (versie 10, gepubliceerd op 17 oktober 2026; rondes 2 tot en met 9 gedaan en samengevoegd, `index.html` herbouwd, eindpoort groen na ronde 9)

Vorm zoals 5b-2: eerst een premortem, dan meten met `clash.py` en `huid.py` vóór de nieuwe delen, een presetlijst per item vooraf en samenvoegen per tak. Contractwijzigingen in `core.js` en `body.js` doet de orkestrator vóór de takken. De tak `golf-5b2` en `main` zijn vóór de golf samengevoegd (versie 9 staat live).

| Nr | Wat | Eigenaar of grond |
|---|---|---|
| G5c | Aircoleidingen en expansieventiel; hoogste risico van G5, plaats van de droger onbekend | systemen; premortem 5b-2 |
| G8c | Naafpunt op `TRACK_F`. Diagnose gecorrigeerd: een boring in de fusee lost geen van de acht doordringingen op (gemeten). Wat wel werkt: eerst de klemarm omhoog en de Demperbuis 45 mm korter aan de voet, daarna pas de naaf op `TRACK_F`. Twee stappen in twee takken (was acht doordringingen tot 2,44 mm) | aandrijving en onderstel |
| G8d | Gedeelde maten voor achterveer, torsiebalk en koppelstang op een plek (drie eigenaren, raakt `body.js`) | orkestrator |
| G8e | Gedeelde constructies generiek in `core.js` (bellows, slangklem, moer, scharnier, Sutherland-Hodgman, lasnaad), met `framework.py export` naar espace5 | orkestrator |
| G8f | Geometrie van portierpanelen en spiegels delen (negatieve schaal; labels, pick en `ex` zijn niet gemeten) | carrosserie met de orkestrator |
| G9e | Notatie uniform (duizendtalpunt, komma als decimaal, Ø zonder spatie); beslissing van de gebruiker | gebruiker, dan alle eigenaren |
| G9h | Het restant: lint-regels in `build.py` voor "geschat" in `spec`, puntdecimaal met eenheid en cache-sleutel zonder prefix | orkestrator |
| `spring()` | Punten per winding als parameter | motor en onderstel |
| G4c | Vulpijp korter onder de zijbekleding | systemen |
| `handomdraai.md` punt 1 en 2 | Hoedenplank bij de achterklep, linker gasveer | interieur en carrosserie |
| Inner-treffers bij 400 richtingen | Veerrubber onder links en rechts, Lagerbus aan de collectorzijde, en de bestaande | alle eigenaren; `ui_inner.py --open --strict` met `UI_INNER_DIRS=400` |
| Scharnierblad in open stand | Het blad zweeft 3 tot 9 cm van de pen (schematische draaias); geen A-stijlmesh achter het voorscherm | carrosserie |
| S7 kenmerk 4 en 8 | Kenmerk 4 kreeg een chroomlijst maar bleef deels; kenmerk 8 (bovenaanzicht zonder heupen) had in 5b-2 geen item | carrosserie |
| Meldingen van beoordelaars | Los zwart blokje bij de C-stijl (`ext-zij`, `ext-34achter`), onrustig achterpaneel, spikkels | carrosserie |
| Nieuwe `docs/baseline` | Een Linux-basis uit `lag3-vm` is er sinds `3be230e` (versie 9). Voor versie 10 vernieuwen als eigen commit vóór de merge naar `main`, alleen de PNG's, met `anchorcheck.json` ongemoeid; akkoord van de gebruiker staat in `handomdraai.md` | orkestrator |
| T4 | Definitie vastgesteld (MB = 10^6 bytes, `gzip -6`); de grens is op 17 oktober 2026 door de gebruiker verhoogd naar 1,5 MB raw en 370 kB gzip, met de reden in `docs/onderzoek/beslissingen.md`. De nummergegevens apart laden blijft 5c-2 | orkestrator, dan gebruiker |

### Besluiten van de gebruiker voor 5b-3

B1, B4 en B5 zijn besloten door de gebruiker (17 oktober 2026), net als de clashregel hieronder; B4 en B5 staan met hun reden in `docs/onderzoek/beslissingen.md`. B2 en B3 zijn in de uitvoering van G9e vastgelegd (Nederlandse notatie, koppel in `Nm`, zie `docs/onderzoek/beslissingen.md` en `handomdraai.md`). Ook B6 is besloten (17 oktober 2026): niet doen, de standaard is bevestigd.

| Nr | Vraag | Besluit of standaard |
|---|---|---|
| B1 | T4: definitie (MB = 10^6 bytes, gzip -6) en grens | Besloten door de gebruiker op 17 oktober 2026: definitie vastgelegd, grens 1,5 MB raw en 370 kB gzip (`docs/onderzoek/beslissingen.md`). Nummergegevens apart laden naar 5c-2. |
| B2 | Koppel: `Nm` of `N·m` | `Nm` (zoals `spec` en `data/pn`); de plekken met `N·m` zijn omgezet (G9e, gedaan). |
| B3 | G9e ook voor `auto.json`, `presetdata.js`, `partnumbers.js` | Ja voor `auto.json` en `presetdata.js` (zichtbaar in de pagina); nee voor `data/pn` en `partnumbers.js` (bronnamen en citaten blijven letterlijk). Gedaan. |
| B4 | S7 kenmerk 8 (bovenaanzicht zonder heupen) | Besloten: het criterium luidt "evenwijdig tussen de assen, taps naar neus en staart" (meting: 1,3 procent spreiding, binnen de referentie). Geen geometrie. |
| B5 | G8f (portiergeometrie delen, geen driehoekwinst) | Besloten: vervalt; alleen weer oppakken als geheugen een doel wordt. |
| B6 | Actieve categorieknop afkappen (ellipsis) tegen de tweede rij van de presetbalk | Besloten (17 oktober 2026): niet doen, standaard bevestigd; alleen de herkadrering is opgelost. |

Besluit van de gebruiker tijdens de golf (17 oktober 2026): de clashregel is streng. Geen paar mag dieper doordringen dan in B0 plus 0,1 mm (bemonsteringsmarge), ook niet een ONZEKER paar (een deel dat geen gesloten mesh is) in gesloten stand. Een uitzondering krijgt alleen een toelating in `data/clash-toegestaan.json`, met reden en `max_diepte_mm`. Tak E (gasveer) en tak B (veren) zijn onder deze regel aangepast (E8, B3 nazorg, B9). De regel geldt ook open, over de hele beweging (besluit van de gebruiker, zie `docs/onderzoek/beslissingen.md`): gemeten met de standenzwaai (de 26 openers in stappen van 0,05, plus dicht en alles open) en een ruisproef: de hoofdmeting bij een bemonsteringsafstand h van 4 mm, grensgevallen tot 0,2 mm opnieuw bij h 1,5 mm. Een grensgeval is ruis als de excess bij h 1,5 mm hooguit 0,1 mm is. De zwaai bestaat pas sinds ronde 6 (zie hieronder).

Toelating Ruitdrager tegen Waterscherm (besluit van de gebruiker, 17 oktober 2026; `b536d6a`, samengevoegd in `934ace3`): in `data/clash-toegestaan.json` staat nu ook het paar Ruitdrager tegen Waterscherm in Portier rechtsachter, met `max_diepte_mm` 8,02 (de B0-omhullende over de beweging, 7,92 mm bij h 1,5 mm, plus 0,1 mm). De Ruitdrager volgt de Zijruit rechtsachter en zat in B0 al zo diep in het Waterscherm; sinds ronde 3 verschuift het diepste punt per stand, tot 0,12 mm dieper dan B0 in dezelfde stand bij h 1,5 mm (bij h 4 mm +0,18 mm). Het eigenlijke grensgeval was stand 0,8 bij h 1,5 mm (B0 7,39 mm, na ronde 9 7,51 mm, +0,12 mm, NOG TE BEOORDELEN), niet stand 0,95 (de ruisproef noemde alleen stand 0,95 bij h 4 mm RUIS). Met de toelating, gemeten op `3e5e491`: Zijruit rechtsachter en linksachter, elk 21 standen plus dicht en alles open, h 4 mm en h 1,5 mm: ECHT 0, NOG TE BEOORDELEN 0; diepste 7,93 mm, 0 standen boven 8,02 mm. Linksachter is niet opgenomen (excess maximaal +0,02 mm). Het zwaaiscript van de orkestrator (`zwaaivgl.py`, niet in de repo) leest de toelatingen niet; alleen `clash.py --toegestaan` doet dat, dus voor deze meting is een omhulsel gebruikt (zie `docs/testen.md`).

Rondelimiet: `47fb5ae` (CLAUDE.md: klaarcriteria, rondelimiet van maximaal 6 reparatierondes per golf en bekende ruis; stond alleen op lokale `main`) is samengevoegd in `golf-5b3` (`f465927`). De rondes 7, 8 en 9 van deze golf vielen na die regel, dus boven de grens van 6. De beslisnotitie aan de gebruiker, die de regel voorschrijft, is gegeven via het akkoordpakket van 17 oktober 2026; de gebruiker koos geen ronde 10 maar 5c-2 voor de restpunten (zie de sectie Golf 5c-2).

Poort 5b-3: `finaltests.sh` strikt groen, `visdiff` tegen een basis van hetzelfde platform met alleen bedoelde verschillen, `clash.py` 0 op de nieuwe delen, K1 tot K13 niet lager, S7 hoogstens twee runs.

Tussenstand van de poort: de poort van ronde 3 (stand `0317061`) was groen (K-panels via `poort.js` tweemaal, geen kenmerk lager dan B0, S7 9 van 9). De strikte set op `a90786b` (na ronde 8, `index.html` herbouwd) is op de Mac en in de VM groen behalve `visdiff` (Mac 6 rood, VM 13 rood, beide gelijk aan `d4d03a6` en binnen de lijst van bewust veranderde presets), met itest 232 van 232 op beide. De eindpoort op `a90786b` was ROOD op één kenmerk: plak a K2 Voorportieren, waar beide K-panels 'deels' gaven tegen 'ja' bij B0. Alle beoordelaars noemden de dorpel: weinig contrast, hij leest als een grijze vloerstrook (beelden 06, 09 en 95-telefoon-portier-linksvoor). De meetpoorten op `a90786b` waren groen: `ui_inner` met 400 richtingen ok, fijne zwaai 548 standen op h 1,5 mm ECHT 0 met één grensgeval (Ruitdrager tegen Waterscherm bij Zijruit rechtsachter, stand 0,8: +0,125 mm, omhullende 7,923 tegen 7,929 mm; later opgelost met een toelating), en S7 is niet opnieuw gedraaid (exterieur ongewijzigd, ronde 3 gaf 9 van 9). Ronde 9 (commit `457f729` voor `src/interior.js` en `1903e18` voor `data/tree.json` en `docs/onderdeelnummers.csv`, beide om 17:01 UTC, samengevoegd in `d1321cb` om 17:43 UTC, `index.html` herbouwd in `b775511`) maakte van de instaplijst een afgewerkte dorpel met een lichte sierstrip (zie "Rondes 2 tot en met 9"). Poort na ronde 9: GROEN. 17 kenmerken, 0 lager dan B0 (lager betekent: beide na-panels onder het minimum van B0). Plak a K2 geeft nu ja/ja, met ja/ja/ja in beide panels. Hoger dan B0 in beide panels: plak b K6. Eén panel terug op het minimum van B0 (niet eronder): plak b K9 (panel 1) en plak c K13 (panel 2), op beelden die op het versiestempel na pixelgelijk zijn aan `a90786b`, dus dat is verschil tussen beoordelaars. Geen blokkerende meldingen. Het volledige verslag is het poortverslag ronde 9 (buiten de repo). T4 op `b775511`: `index.html` is 1.478.919 bytes raw (grens 1,5 MB) en 367.302 bytes bij `gzip -6` (grens 370 kB, marge 2.698 bytes). Testset Mac op `b775511`: alles groen behalve `visdiff` (6 rood: 10-timing, 14-cooling, 33-tailgate, 37-openHood, 38-openDoors, 42-openAll), dezelfde als op `a90786b` en `d4d03a6` (de Mac-basislijn verschilt van de Linux-basislijn); ankerpoort ok, itest 232 van 232. Testset VM op `b775511`: alles groen behalve `visdiff` (13 rood, dezelfde als op `a90786b`); ankerpoort ok; itest was in de volledige set rood door een `Page.reload`-timeout van 30 s onder parallelle last en gaf los herhaald 232 van 232. Publicatie: versie 10 (bevat ook `f63b185` en `47fb5ae`) is op 17 oktober 2026 gepubliceerd (zie de rij "Versie 10 live" bovenaan). De gebruiker had akkoord gegeven en het grensgeval is opgelost met een toelating (`934ace3`, zie hierboven). De visdiff-basislijn in de VM is vernieuwd (`a5a1db2`, zie "Nieuwe `docs/baseline`" hieronder) en de volledige VM-set daarop is groen.

### Stand na fase 3 (17 oktober 2026)

Volgorde: fase 0 (contracten en meetmiddelen in `core.js`, `body.js`, `build.py`, `mergecheck.py`, itest), golf 1 (zeven domeintakken in worktrees, elk gecontroleerd), samenvoegen per tak met een presetlijst vooraf, golf 2 (G8c deel 2 en C7), fase 3 (lint, oude helpernamen, docs). De poort na ronde 9 is groen (17 kenmerken, 0 lager dan B0); de uitkomst staat in `docs/testen.md`, `docs/premortem.md` en `CHANGELOG.md`. Kerncijfers: [cijfers.md](cijfers.md).

| Nr | Stand | Toelichting |
|---|---|---|
| G5c | Gedaan | Groep Airconditioningleidingen onder Koeling en luchtinlaat: persleiding van de compressor naar het Leidingblok, zuigleiding van het expansieventiel naar de compressor, vloeistofleiding van de droger om de linkerrand van de radiateur. De route komt uit een zoekopdracht op een rooster met vrije straal en is gemeten: `clash.py` op de groep 0 doordringingen, kleinste afstand tot een niet-aangesloten deel 1,5 mm (schutbord). Plaats van expansieventiel en droger zijn schematisch (geen bron); `d` zegt dat. Koeling zit onder het budget. |
| G4c | Gedaan (lezing A) | De vulpijp is in twee delen: het stuk binnen de zijbekleding van de bagageruimte is weg en het bovenstuk begint waar de pijp vrij uit de zijwand komt. Vulpijp tegen de zijbekleding gaat van -54,2 naar -22,0 mm. De overlap met de zijbekleding, de tank en het voorstuk van de laadvloer staat in `data/clash-toegestaan.json` met grenzen van de gemeten stand plus 0,1 mm (tank en voorstuk: B0 plus 0,1 mm). |
| G8c | Gedaan in twee stappen | De diagnose van 5b-2 was fout: een boring in de fusee alleen lost geen van de acht doordringingen op (gemeten). Deel 1 (tak B): klemarm omhoog, Demperbuis korter aan de voet, boring in de fusee. Deel 2 (golf 2, C6): de naven op `TRACK_F`, stompastip op L plus 0,063 en de manchet buiten 3,5 mm dieper in de klok. De buitenste koppeling schuift 3,5 mm naar buiten (bedoeld). Geen van de acht oude paren komt terug en er is geen paar dieper dan B0 plus 0,1 mm. C7: de Doorgaande bout subframe is weer één bout, door een boring (B8) in de oren van de Reactiestangbeugel. |
| G8d | Gedaan | `REAR_SPR`, `REAR_BEAM` en `SUB_ROD` staan als constanten in `body.js`; onderstel, carrosserie, interieur en aandrijving gebruiken ze. De maat bij de achterrand van de kwartsruit in `interior.js` is geen torsiebalkmaat en blijft daarom eigen. |
| G8e | Gedaan | `core.js` heeft `bellows`, `hexNut`, `hoseClamp`, `hinge`, `follow`, `clipPoly`, `weldAll`, `creasedWeld` en `ringPattern`. De lokale kopieën in de domeinen zijn weg; `engNut` blijft als dunne wrapper op `hexNut` (sleutelmaat `d`). De export naar espace5 (3.3) is gedaan op de espace5-tak `golf-5b3-export` (niet samengevoegd); daar blijft alleen `chsClamp` lokaal, omdat het slotblokje op een andere plek zit. |
| G8f | Vervallen | Niet in 5b-3 (standaard van B5). |
| G9e | Gedaan | Nederlandse notatie in alle teksten, ook `auto.json` en `presetdata.js`; `data/pn` en `partnumbers.js` blijven letterlijk. Koppel in `Nm`. |
| G9h | Gedaan | `lint_texts` in `build.py` controleert `d`, `spec`, `note` en `label`; R1, R2, R4, R5 en R7 zijn fouten (R4, R5 en R7 waren tot 3.1 meldingen). |
| `spring()` | Gedaan | Parameter `per` (punten per winding, standaard 14, sleutel ongewijzigd). Schroefveer voor 16; Schroefveer achter, Terugtrekveer en Zuigerveer weer 14 (strenge clashregel), Wormas 8; drie veren in de aandrijving 8. |
| Inner-treffers (400 richtingen) | Gedaan | Veerrubber onder, Lagerbus aan de collectorzijde (Eindschild startmotor dicht als kegel) en het Krukmechanisme zijn weg. Bij 800 richtingen blijven treffers over (Pakking waterkast, Sproeierkop koplamp, Klepbuffer, Rondsel, Duwstang, Differentieel); die zijn de basis voor een volgende golf, geen poort. |
| Hoedenplank (punt 1) | Gedaan | De plank gaat 0,9 rad (52 graden) mee met de achterklep (was 0,7); van ronde 4 tot golf 5n had de voorrand een uitsparing voor de middelste gordelrolautomaat; sinds golf 5n ronde 2 zit die automaat in de rugleuning en is de uitsparing weg. In de presets zie je het niet, omdat de plank daar door `hideWhen` is uitgenomen; wel via de knop Achterklep. |
| Gasveer (punt 2) | Gedaan | Dikkere veer, bevestiging onder de lakhuid van de C-stijl en het klepuiteinde verlegd zodat de gesloten veer buiten de afdichting ligt (E1, E2, E8). Sinds ronde 4 reikt het plaatje van de Gasveerbevestiging 5 mm boven en 25 mm onder de kogelpen, zodat de cilinder in geen stand van de achterklep dieper in het plaatje ligt dan in B0. Sinds ronde 8 is de Cilinder een gesloten draaivorm met een holte voor de kogel, zodat het paar Cilinder tegen Gasveerbevestiging in elke stand ruim ondieper ligt dan in B0. Onder de strenge clashregel geen paar dieper dan B0 plus 0,1 mm. Of de veer in het achterklepbeeld nu leest, is een oordeel van de poort. |
| Scharnierblad | Open | Geen wijziging in deze golf. |
| S7 kenmerk 4 en 8 | Deels | Chroomlijst langs de B-stijl 15 mm (E3), in ronde 2 teruggebracht tot een kort eindstuk in de bovenhoek (de lijst over de hele hoogte las als dubbele witte lijn), met een donkere lijn van 9 mm boven de chromen bovenband en zijruiten die 4 mm onder de afdekking doorlopen; zie "Rondes 2 tot en met 9". Kenmerk 8 krijgt volgens de standaard van B4 een herformulering en geen geometrie. In de poort van ronde 3 (stand `0317061`) gaf S7 9 van 9; de eindpoort draaide S7 niet opnieuw (exterieur ongewijzigd). |
| Meldingen van beoordelaars | Deels | Bumperschaal voor zonder gedegenereerde driehoeken en nulnormalen (E4). Het onrustige achterpaneel en de spikkels zijn niet gedaan. |
| App (tak G) | Gedaan | G1: herkadrering als de layout van het dock verandert, Stap terug herstelt kader en vrij beeld; G2: Nederlandse notatie in `presetdata.js`. De orkestrator voegde itest controle 5 toe (camera na Stap terug), omdat `state()` geen camera bevat. |
| T4 | Besloten | Zie B1. |
| Nieuwe `docs/baseline` | Gedaan (`a5a1db2`, 17 oktober 2026) | De poort was groen (na ronde 9). De basislijn is vernieuwd in de VM, door de orkestrator, in een eigen commit: de 42 PNG's uit de VM-presets van `b775511`, `docs/baseline/anchorcheck.json` ongewijzigd. Per rood beeld tegen de basislijn van versie 9 staat de oorzaak in `testen.md`. De volledige VM-set daarop is groen: `visdiff` 42 van 42, itest 232 van 232, ankerpoort ok (de ankerpoort in de VM was ook ok op `d4d03a6` en `a90786b`; op de Mac op `b775511`). |

### Rondes 2 tot en met 9 (17 oktober 2026, 08:08 tot 17:43 UTC)

Na fase 3 kwamen acht rondes op de samengevoegde stand, elk gemeten met de strenge clashregel (geen paar dieper dan B0 plus 0,1 mm, ook open). De meetmethode hoort bij de rondes en is niet in elke ronde gelijk. De standenzwaai (de 26 openers in stappen van 0,05, plus dicht en alles open) bestaat pas sinds ronde 6: ronde 2 mat doelgericht per paar, ronde 3 mat open standen vóór de meetlib-fix `a000772` (dus op de dichte geometrie) en ronde 4 mat in klepstappen van 0,1. De eindstand (ronde 9) is wel volledig gezwaaid. De ruisproef werkt zo: de hoofdmeting is bij een bemonsteringsafstand h van 4 mm, per stand tegen dezelfde stand van B0. Een paar dat daar meer dan 0,1 mm maar hoogstens 0,2 mm dieper ligt dan B0 is een grensgeval en wordt opnieuw gemeten bij h 1,5 mm, op de werktak en op B0. Is het verschil (de excess) daar hooguit 0,1 mm, dan is het RUIS van de bemonstering en geen overtreding; meer is ECHT. Een overtreding die alleen bij h 1,5 mm optreedt heet alleen_fijn en telt ook. Sinds ronde 8 is de eindstand ook bij h 1,5 mm voor de achterklep zonder overtreding (dicht, alles open en alle 21 standen van Achterklep, plus het grensgeval Zijruit rechtsachter@0.95). Sinds `a000772` ververst de cache van `meetlib.js` per stand; metingen in open stand van voor ronde 3 binnen één sessie gebruikten de dichte geometrie en gelden niet.

| Ronde | Wat | Uitkomst |
|---|---|---|
| 2 | S7 kenmerk 4: B-stijl als zwart vlak, chroomlijst als kort eindstuk, zijruiten 4 mm onder de afdekking, donkere lijn 9 mm boven de chromen bovenband. Vulpijp bovenstuk tot u 0,98 (3,9 mm voor de vulhals, was 1,4 mm erin). Besluiten B4 en B5. | Geen nieuw doordringend paar; de toelatingen van de vulpijp op B0 plus 0,1 mm staan in `data/clash-toegestaan.json`. |
| 3 | De B-stijl leest bij een open portier als stijl (gelakte plaat boven de gordel, dicht verborgen achter de afdekkingen), de achterruit zakt schuin langs de helling van de B-stijl, de kwartsruit draait mee met het achterportier. Meetlib-cachefix. | Geen nieuw paar, geen paar dieper dan B0; B-stijl tegen hoogteversteller gordel weg. `index.html` herbouwd. |
| 4 | Hoedenplank met uitsparing voor de middelste gordelrolautomaat (vervallen in golf 5n ronde 2, de automaat zit nu in de rugleuning); plaatje van de Gasveerbevestiging 5 mm boven en 25 mm onder de kogelpen. | Plank tegen Gordelrolautomaat achter midden weg; de cilinder van de gasveer in elke klepstand niet dieper in het plaatje dan B0. Open uitzondering: Plankscharnierpen links en rechts, beide tot 10,62 mm in de voorrand van de plank (de pen ligt op de draai-as); opgelost in ronde 7. |
| 5 | Gordelband voor in rust vrijwel recht uit de bovenste geleider, net achter de stijlbalk; de tong volgt. | De achterste zijruit snijdt de band in geen stand meer; geen paar binnen 2 mm van band en tong. |
| 6 | B-stijlplaat in de onderste 10 cm 2,5 mm binnen de omhullende van de zakkende voorste zijruit; beschrijving gordelband voor volgt de rusttand. | De paren Zijruit voor met B-stijl zijn weg; bij 1,5 mm bemonstering dringt geen ruit in de B-stijl. |
| 7 | Scharnierpennen van de hoedenplank binnen de B0-diepte (`e6cbcea`, samengevoegd in `1310832`). Oorzaak: de voorrand liep door de pen-as, de diepte was de inradius van de twaalfhoek (10,625 mm) en het verschil met B0 was bemonstering. Sparing in elke voorhoek: 12,5 mm over de pen, 21 mm over de kraag, 1,5 tot 4 mm ontwerpspeling rondom (de maat van de sparing), hoekafronding 4 mm via `intRoundPlate`. | Zwaai tegen B0 bij h 4 mm: ECHT 0, RUIS 1 (Ruitdrager tegen Waterscherm bij Zijruit rechtsachter@0.95, B0 7,92 tegen werktak 7,93 mm bij h 1,5 mm); bij h 1,5 mm nog 11 alleen_fijn (Cilinder tegen Gasveerbevestiging, tot 7,05 tegen B0 6,87 mm), opgelost in ronde 8. Pennen vrij: de gemeten kleinste afstand over de beweging is 0,66 tot 1,02 mm (bemonstering h 4 en h 1,5 mm), de uitkomst van de meting en iets anders dan de ontwerpspeling; Hoedenplank in de Hoedenplanksteun van 3,94 naar 2,60 mm. |
| 8 | Cilinder tegen Gasveerbevestiging (`fdbf21d`, samengevoegd in `5a2d10c`). Oorzaak: de dekselschijf van de cilinderbuis lag door het hart van de kogel (r 12 mm); B0 heeft hetzelfde mechanisme. De Cilinder is nu een gesloten draaivorm met een halve bol als kogelkom, een buis, een platte kop met 0,5 mm afschuining en een holte r 13,5 mm voor de kogel. | Het paar ligt in elke stand ruim ondieper dan B0 (kleinste marge 1,99 mm bij h 1,5 mm, 1,26 mm bij h 4 mm). Zwaai h 4 mm: ECHT 0, RUIS 1 (hetzelfde grensgeval als in ronde 7). Zwaai h 1,5 mm voor de achterklep: 0 overtredingen, alleen_fijn 0, ECHT 0. |
| 9 | Instaplijst als afgewerkte dorpel bij een open portier (`457f729` en `1903e18`, samengevoegd in `d1321cb`), na de eindpoort op `a90786b` (plak a K2 Voorportieren rood: de dorpel las als grijze vloerstrook). `sill()` in `src/interior.js` maakt per opening een zwarte instaplijst (`MAT.plastic`) met een loopplaat tot net binnen de lakrand en een opstaande rand over de rand van de vloerbedekking, plus de nieuwe knoop 'Sierstrip instaplijst ...' (vier stuks, materiaal `intSill`, lichte aluminiumlook, 2,8 cm binnen de buitenrand). Vorm geschat, geen spec. | Ontwerpspeling verticaal voor 6 mm en achter 5 mm; gemeten in dichte stand 9,09 mm voor en 13,0 mm achter; over de hele beweging minimaal 9,1 mm. Zwaai h 4 mm (548 standen) tegen B0: 0 fouten, één grensgeval (Zijruit rechtsachter@0,95, 0,18 mm; ruisproef h 1,5 mm: 7,92 tegen 7,93 mm, RUIS). Fijne zwaai h 1,5 mm (86 standen: 4 portieren, dicht, alles open): ECHT 0. `ui_inner.py --open --strict` 0 treffers; `opentest.py --strikt-min` 0 fouten (dezelfde 30 meldingen); `pncheck.py --tree` ok. Geen fout: het zwarte blokje boven aan de B-stijl (voorkant van Raamrubber boven van het achterportier) en de 'sleuf' in de sluitrand (rand van het bekledingspaneel naast de Portierrand, ongewijzigd). |

Gedaan na ronde 9: het samenvoegen van `golf-5b3-r8` (`5a2d10c`) en `golf-5b3-r9` (`d1321cb`) en de bouw van `index.html` (`a90786b` na ronde 8, `b775511` na ronde 9). Niet gedaan en bewust: het samenvoegen van de espace5-tak `golf-5b3-export` en de publicatie van versie 10 (zie de rij "Volgende" bovenaan). De espace5-tak `golf-5b3-export` staat nu op `bcb15a4` (export `3606ebe` uit laguna3 `3e5e491`, plus `index.html` herbouwd). Mac-set functioneel groen, itest 152 van 152. `visdiff` op de Mac tegen de eigen Mac-basis van espace5 `main`: 49 van 51; rood zijn 11-injection (raildruk als spec-regel, eigen commit `815fbcd`) en 44-openHood (herkadrering uit het framework). Niet samengevoegd: samenvoegen pas na `visdiff` op hetzelfde platform als de espace5-basislijn. De uitgestelde punten staan bij de poort hierboven; de lijst "Uitgesteld" in het plan blijft staan voor 5c-2 (nummergegevens apart laden, T4) en een volgende carrosseriegolf (achterpaneel, spikkels, echte plek van expansieventiel en droger).

## Golf 5c-1: robuustheid, bediening, toegankelijkheid en tests (1 dag; versie 8)

Eigenaar: app. Alles achter de bestaande itest, die per stap uitgebreid wordt. De uitkomst van de telefoonsessie (A7) stuurt U3.

### Robuustheid

| Nr | Wat | Waar |
|---|---|---|
| R1 | `new THREE.WebGLRenderer` in try/catch met een melding in `LOADING` (nu blijft "Model opbouwen…" eeuwig staan); een globale `error`-handler die de laadmelding vervangt, met de versie erbij. | `core.js:18`, `head.html:501` |
| R2 | Melding bij `webglcontextlost`; PMREM-omgevingskaart opnieuw maken bij `webglcontextrestored`. | `core.js:39-40`, `app2.js:1360-1361` |
| R3 | `uiLastFit` centraal in `focusNodes`: na duiken, Alles uitklappen, afspelen, kruimelklik en rondleiding kadreert een formaatwissel nu op een oud doel (telefoon draaien na een duik springt terug). | `app2.js:40, 282, 531-533, 598, 1263-1269`, `presets.js:187, 212` |
| R4 | Rondleiding: pauze bij `visibilitychange`, knoppen pauze, vorige, volgende. | `presets.js:195-222` |
| R5 | `integrity` en `crossorigin` op de drie CDN-scripttags (hash uit het lokale pakket in `build.py`); lettertypes als `woff2` in de repo of systeemlettertypes (nu gaat elk IP-adres naar Google); `rel="noopener noreferrer"` op catalogus-links (`noopener` staat er al); een uitleg bij de lichte weergave wat de gebruiker kan doen. | `build.py:74-76`, `head.html:2-4`, `app2.js:177, 193` |

### Bediening en toegankelijkheid

| Nr | Wat | Waar | Punt |
|---|---|---|---|
| U1 | Dimmen bij duiken: de rest doorzichtig (circa 15 procent) zolang de duik staat, de doelgroep normaal; opheffen bij elke volgende handeling. | `uiDive` `app2.js:275-284`, `uiMatFor` `app1.js:401-410` | U19 |
| U2 | "+n meer" als labels wegvallen (hoogstens 24 of 10, nu stil afgekapt). | `app2.js:1079, 1140, 1181` | U11 |
| U3 | Telefoon, het eerste beeld: het model krijgt nu circa 39 procent van de hoogte (segmentknop, modusbalk, explosieregel, zeven tegels in drie rijen via `.cats` op `head.html:280`, kaart). Het dock inklapbaar, de categorieën in één rij met horizontaal scrollen of achter één knop "Presets", een paneelstand van 40 procent, liggend 844 × 390. Poort: één screenshot op 390 × 844 van de beginstand als vaste poort, met een ondergrens voor het aandeel van het model. | `head.html:230-330`, `app2.js:715-718` | U21, U22, U23 |
| U4 | Fade van 0,3 s bij isoleren plus een badge "Geïsoleerd: Motor F4Rt, Alles tonen" in beeld. | `presets.js:176`, `app2.js:335` | U09 |
| U5 | Themaknop (licht, donker, systeem) in Weergave; `data-theme` bestaat al in CSS en wordt nergens gezet. | `head.html:21, 29`, `app2.js:1294` | U24 |
| U6 | Toegankelijkheid: focusval of `inert` in het hulpvenster, `div.mhead` uit `role="menu"`, pijlnavigatie in `role="toolbar"`, zichtbare focusrand op het canvas (`#stage:focus-visible{outline:none}` schendt 2.4.7), schakelaar-uit contrast (circa 1,3:1), tabs met `tabindex` in de beginstand, rustiger live region op `#selMeta`, Esc sluit het mobiele paneel. `axe-core` in itest is informatie; de toetsenbord-itest is de poort (anders maakt `aria-hidden` op het canvas axe stil en de pagina slechter). | `head.html:44-45, 145, 380-395, 463`, `app2.js:627, 650-653, 909-921` | WCAG |
| U7 | Hulpvenster opbouwen uit `PRESETS` en `appCats` (sneltoetsen en "zeven categorieën" staan met de hand in de HTML); de regex die een zin uit de wortelbeschrijving knipt weg. | `head.html:487, 496`, `app2.js:61`, `systems.js:365` | onderhoud |
| U8 | Lange labels: volledige naam ook op aanraakschermen (korte toast); onboarding na de hint: één suggestie "probeer: tik op de motorkap" tot de eerste klik; haptiek `navigator.vibrate` bij het vollopen van de ring (Android, drie regels). | `head.html:162, 167`, `app2.js:817, 897-907` | U14, U16 |
| U9 | Exporteren: "Beeld opslaan" (`canvas.toBlob` met een render op verzoek, met de naam en het nummer van de selectie in het beeld) en een printstijl voor de onderdeelkaart; voor een eigenaar bij de dealer is dat de kernfunctie van de nummers. | `src/app2.js`, `src/head.html` | ontbrak |
| U10 | Zoeken: synoniemen (remvoering, remblok; dynamo, alternator), diakrieten- en hoofdlettertolerantie als functie, niet alleen als test. | `app2.js:476-487` | U17 |

### Tests die erbij komen (elke nieuwe controle noemt de fout uit golf 1 tot 4 die hij gevangen zou hebben)

- Toetsenbord volledig: Enter, Shift+Enter, Esc, `?`, `/`, pijltjes in boom en modi, Home/End in het menu, pijlen in de werkbalk.
- Formaat: desktop naar telefoon en terug, liggend 844 × 390, tablet 1024 × 768; herkadreren na elke handeling (R3).
- Stap terug tot 50 stappen; reduced motion (`emulate_media`); thema-wissel tijdens het draaien per preset in donker.
- Uitvalpaden: CDN geblokkeerd (`route.abort`) geeft de melding; WebGL uit geeft de melding van R1.
- Zoeken met diakrieten en hoofdletters.
- Het eerste beeld op de telefoon (U3) en de deelbare URL (A6).
- Visuele regressie: `tools/visdiff.py` vergelijkt `presetshots.py`-beelden met een basislijn in `docs/baseline/` (Pillow en numpy, rood boven 1,5 procent afwijkende pixels per beeld). De basislijn verandert alleen in een commit van de orkestrator met een vóór/na-galerij.
- Labelankers: `tools/anchorcheck.py` meet per preset twee dingen, anker op het eigen deel én vrije zichtlijn (nu 261 van 345 en 84 erachter, op 36 presets van vóór golf 4); geen van beide mag dalen.
- Bevroren testcontract: de interne namen die de tests gebruiken (`uiTick`, `uiBatchSync`, `uiBatchQ`, `uiBatchFree`, `uiBatchStep`, `ASMS` in `opentest.py:318-388`; `applyVisibility` en `PN_DATA` in `itest.py:641-708`) staan in `docs/testen.md` als contract; wie ze hernoemt, levert de testwijziging in dezelfde commit.

Stand 16 oktober 2026, 04:00 UTC: alles in de tabellen hierboven is gebouwd (R1 was al in A6, U1 en U3 in golf 5; de lettertypes van R5 blijven van Google binnen het paginabudget, zie de premortem); de tests hieronder bestaan, met visuele regressie via `tools/visdiff.py` en labelankers via `tools/anchorcheck.py` in de strikte set.

Poort van golf 5c-1: itest van 150 naar circa 190 controles, allemaal groen; p95 en tekenopdrachten niet slechter dan golf 4; het eerste-beeld-criterium op de telefoon; publicatie versie 8, drie vóór/na-paren tegen versie 7.

## Golf 5c-2: prestaties en codegezondheid (GEDAAN op 18 en 19 oktober 2026; versie 11 gebouwd op de tak `golf-5c2` en op 19 oktober 2026 gepubliceerd; 1 tot 1,5 dag was de raming)

| Nr | Wat | Waar | Meting | Stand |
|---|---|---|---|---|
| P1 | Eerst, vóór de volgende geometriegolf: de T4-marge is 2.698 bytes gzip (0,73 procent) op `b775511`, dus elke nieuwe geometrie kan de grens van 370 kB raken. `PN_DATA` lui parsen: in een eigen `<script type="application/json" id="pn">` (overleeft het hostskelet; `<` als `<`; `build.py:74-76`, `pubsmoke.py:35-41` en `itest.py:641-684` wijzigen samen), `uiPnBuild()` pas bij het eerste paneel of de eerste zoekopdracht op nummer; `note` weg; padsleutels in `map` door korte id's. Doel is een gemeten opstarttijd, niet een bytebudget: `__laguna.timing()` van `script` tot `startUp` en `ready` minstens 25 procent korter op SwiftShader; de pagina blijft één bestand (de kanalen eisen dezelfde bytes) en wint ruwweg 165 kB raw, niet meer. | `partnumbers.js:7`, `app2.js:1413`, `build.py`, `tools/pubsmoke.py`, `tools/itest.py` | `timing()` in `cijfers.md` | Gedaan (`4e6674a`, blok B, samengevoegd in `ca0e159`): de nummergegevens staan als JSON-blok `#pn` en worden pas bij het eerste paneel of de eerste zoekopdracht op nummer gelezen (`uiPnLazy`); `note` staat alleen in de pagina met `pnToelichting` in `auto.json`; `map` is voorvoegselgecodeerd en wordt in de pagina teruggezet (`uiPnDecode`); `pubsmoke.py` toetst `#pn`. Ready-doel niet gehaald, geaccepteerd (zie Stand na golf 5c-2). |
| P2 | Eén synchronisatie per handeling: `select()` rendert paneel en boom, en `uiAfterAction()` doet dat meteen opnieuw; `applyMats` loopt per klik twee keer over 2.400 meshes. | `app2.js:34-44, 212-220, 252-254` | `profileFrames`, handeling-tijd in itest | Gedaan (`2690b25`, blok B): één synchronisatie per handeling. |
| P3 | Geen DOM-schrijven per frame tijdens afspelen (`innerHTML` van het SVG-pad en `aria-*` alleen bij verandering); bij aanwijzen geen volledige `updateMatrixWorld` als niets beweegt. | `app2.js:563-573, 608, 736` | idem | Gedaan (`2690b25`, blok B): geen DOM-schrijven per frame. |
| P4 | Renderlus splitsen in `tick`, `render` en achtergrondwerk; het omhulsel om `renderer.render` (`app1.js:854-857`) vervangen door een expliciete aanroep van `uiBatchSync`; de lus stoppen in rust. Gestuurd door de telefoonmeting (A7). | `app2.js:1383-1406`, `app1.js:746-763, 854-857` | batterij; geen regressie in itest 13 | Gedaan (`2690b25`, blok B; `4f13e39` voor de presize van de tekenbuffer vóór de WebGL-context): de renderlus stopt in rust en `uiWake()` start hem weer. |
| K1 | Constanten centraal: `CFG` met gebaren (7 px, 600 ms, 420 ms, 26 px, 500 ms, 150 ms, 22 px), tijden (hint 9 s, rondleiding 5 s, herkaderen 160 ms, budgetten 3/10/25 ms), indeling (labels 24/10, historie 50), het breekpunt 920 via één `matchMedia` in plaats van tien JS-regels en zes CSS-regels. | `app2.js:743-868, 900, 1075-1140, 1272-1402`, `head.html:230-330` | itest groen | Gedaan (`2af6ef3`, blok C, samengevoegd in `59dde45`): `CFG` bovenin `src/core.js`; geometrie-hash gelijk. |
| K2 | Dode code weg: `hlMat`/`HL`, `fitBox`, `MAXDEPTH`, `uiAnyOpen`, `uiMakeAnchors`, `pointers`, knoopvelden `mode`/`axis`/`step`/`tag`/`u`, `keepPreset`, `soon`, de tak `u.info`, `DIRS.under`, CSS-tokens `--hover`/`--danger`/`--shade`, het dubbele donkere tokenblok; in de domeinen `skin`, `ghSide`, `radii`, `lowPt`, `bodSkinTube`, `engStud`, `mount`, `TRACK`. Nooit iets uit het bevroren testcontract. | `core.js:108-119, 326-327`, `app1.js:17, 235, 433, 528-534`, `app2.js:795-880, 1041-1045`, `presets.js:12-13, 103, 182`, `head.html:11-35`, `body.js:7, 99-100, 221`, `bodyparts.js:38`, `engine1.js:45`, `drivetrain.js:299` | lint en itest groen | Gedaan (`52ff342`, blok C), met één terugdraaiing: de tak `u.info` blijft, want itest controle 15 toetst hem (`0df9ae7`). |
| K3 | Dubbele hulpjes samenvoegen: schermprojectie (vier keer), `uiRef`/`appOpenRef`/inline in `appSubject`, naamnormalisatie (twee keer), de positieregel (zes varianten), `uiInnerHidden`/`uiPredHidden`, groepskeuze in `uiAnchorPrefetch` tegen `uiLabelGroup`. | `app2.js:329, 748, 1160, 1165, 109, 186, 476, 1078`, `app1.js:49, 83-95, 114, 192-195, 267-268, 369, 436, 442`, `presets.js:76, 112` | itest groen | Gedaan (`fa511cb`, blok C). |
| K4 | Eén modus-strategieobject in plaats van `OPENMODE` plus `MODE` en twaalf losse takken. | `app2.js:54-57, 82-90, 235, 264, 286, 756, 763, 790, 870, 926`, `app1.js:413` | itest 14 groen | Gedaan (`86cf1d5`, blok C): `UI_MODES`; een onbekende klikmodus valt terug op de strategie `part` (`5758ecc`). |
| K5 | Knoopschema in één `initAppFields(n)` (circa 40 velden verspreid over `app1.js:29-56, 123-124`); `app2.js` in `build.py` opdelen in `app2-panel.js`, `app2-input.js`, `app2-labels.js`, `app2-loop.js`; achterwaartse verwijzingen (`CTX`, `ACTIVE_PRESET`, `uiLabelForce`, `uiReady` met TDZ-risico `app2.js:223` tegen `:1409`) naar voren. Eigen dag, met de volledige set vóór en na. Besluit van de gebruiker (18 oktober 2026): als laatste blok van 5c-2, alleen als de andere blokken groen zijn; past het niet binnen de rondelimiet, dan schuift K5 door zonder versie 11 op te houden. | `app1.js`, `app2.js`, `build.py:18` | volledige set groen | Gedaan (`3c46c03`, `faab4f0`, `c417aea`; blok D, samengevoegd in `c00783d`): `initAppFields(n)` in `src/app1.js`, `app2.js` opgedeeld in `app2-panel.js`, `app2-controls.js`, `app2-labels.js`, `app2-input.js` en `app2-loop.js`, achterwaartse verwijzingen naar voren (het TDZ-risico van `uiReady` is weg); knoopvelden en geometrie gelijk. |
| K6 | Teksten in één tabel (`TXT`) met de opmaakhulp voor getallen; maakt een Engelse versie later mogelijk zonder de code aan te raken. | `head.html`, `app2.js:54-57, 136-198, 484-487, 763-767, 897-899`, `presets.js` | itest groen | Gedaan (`5f7434a`, blok C): `TXT` met `TXT.num`; ontwerpdocument bij K1, K2, K4 en K6 in `87cc119`. |
| K7 | Open punt uit 5b-3 (eigenaar interieur; ook restpunt van 17 oktober 2026, hier niet dubbel): de `d`-tekst van Gordelband voor links en rechts zegt dat de band loopt "naar het onderste ankerpunt", maar de band eindigt in de rusttand op y 0,62 (de tong op 0,585) en de Gordelverankering zit op y 0,33. Maak de tekst waar of verleng de band, naar wat de bron zegt. Bewust niet gewijzigd in 5b-3, omdat `src/` na ronde 9 dicht is. | `src/interior.js:166` (de `d`), anker op `:168` | `build.py --lint`; de `d` volgt de rusttand, zoals in ronde 6 | Gedaan (`1fba458`, blok A, samengevoegd in `2644a80`): de `d` van de Gordelband voor volgt de rusttand (band tot de tong, het stuk naar de verankering is niet getekend). |
| K8 | Kandidaat voor een generieke helper: `intRoundPlate` (`src/interior.js`, sinds ronde 7) is `roundPlate` uit `core.js` met per hoek de keuze voor een kleine afronding (`klein(i)`). Met een optionele parameter in `roundPlate` kan het één helper worden en verdwijnt de lokale kopie. Raakt `core.js` (orkestrator) en gaat met `framework.py export` naar espace5. | `src/core.js:275`, `src/interior.js:407` | geometrie-hash gelijk, `framework.py check` | Gedaan (`d3a1a44`, blok A): `intRoundPlate` is opgegaan in `roundPlate` (optionele parameter `klein`); geometrie-hash gelijk. Gaat met de volgende export naar espace5. |
| K9 | Restpunt uit 5b-3 (besluit 17 oktober 2026, eigenaar carrosserie): het Binnendeel van beide achterlichten (`src/bodyparts.js:615`) hangt onder Carrosserie (`:1179`) en niet onder Achterklep; bij een open klep blijft het staan en toont de klep de uitsparing (`:1091`). Een echt gebrek, al voor 5b-3 aanwezig. Haal het Binnendeel onder Achterklep. Daarna de `data/pn`-paden, `build_pn.py` en `pncheck.py --tree` bijwerken | `src/bodyparts.js:615, 1091, 1179`, `data/pn`, `tools/orkestratie/build_pn.py` | `pncheck.py --tree`, `clash.py` op Achterklep, gateshots van de achterklep | Gedaan (`7d97955`, blok A): het Binnendeel van beide achterlichten hangt onder Achterklep en draait mee met de klep. Daarna op besluit van de gebruiker (`84b9adc`): Achterlicht links en rechts zijn zelf het vaste deel, de groep Buitendeel en de eenheid `C_TAIL` vervallen. `data/pn`, `data/tree.json`, `partnumbers.js` en de CSV opnieuw gebouwd, `pncheck.py` ok. Zwaaimeting van de achterklep: 0 nieuwe doordringingen (ECHT 0). |
| K10 | Restpunt uit 5b-3 (eigenaar systemen): de Expansiedop is te groot tegen de catalogus. Model: dop Ø68, opening Ø44, hals Ø60. Catalogus 7700805031: dop Ø50 tot 53, binnen 27 tot 35 mm. Voorstel: dop Ø52, opening Ø33, hals circa Ø42 | `src/systems.js:96-99` | `clash.py` op Koeling, `opentest.py` voor de dop (ondergrens 0,8 maal de hoek) | Gedaan (`766fc92`, blok A): dop Ø52, opening Ø33, hals Ø42 mm (catalogus 7700805031). Zwaaimeting van de expansiedop: 0 nieuwe doordringingen (ECHT 0). |
| K11 | Restpunt uit 5b-3 (eigenaar carrosserie): de voorruit is van buiten 92 procent dekkend (`MAT.glass.opacity` 0,92); bij een open portier leest dat als zwart vlak naast de motorkap. Bekijken in 5c-2; het raakt S7 en de basislijn, dus eerst meten en het besluit voorleggen. Besluit van de gebruiker (18 oktober 2026): eerst beelden met de buitenkant van de voorruit op 0,92, 0,80 en 0,70 (zijruiten en achterruit blijven 0,92) plus de S7-meting; de gebruiker kiest daarna | `src/bodyparts.js:5-18` | S7, `visdiff`, gateshots | Gedaan (`4defb17`, blok A): voorruit van buiten 0,80 dekkend, gekozen door de gebruiker op beelden met 0,92, 0,80 en 0,70; zijruiten en achterruit blijven 0,92. Het zwarte vlak naast de open motorkap is het donkere dashboard achter de ruit (`pick.py`), niet de dekking. S7 gemeten: 0,92 en 0,80 elk 8 van 9, alleen kenmerk 4 deels. In `84b9adc` kreeg het voorruitmateriaal `customProgramCacheKey` `glassWs` plus de factor, zodat een tweede glas met een andere factor niet stil hetzelfde shaderprogramma krijgt. |
| K12 | Geen actie (bedoelde vorm of camera): de zwarte dakhoeken in beeld 92 en 93 (lijst `bodPillar`, `src/panorama.js:134-137`, poortcamera 70 graden scherend; geen gat, 20.300 stralen raken) en de raamkaders in beeld 80 rechtsachter (raamrubbers, sluiten binnen 0 tot 0,9 mm aan). Optioneel: de lijst donkergrijs, de camera van `gateshots.py` smaller | `src/panorama.js:134-137`, `tools/orkestratie/gateshots.py` | geen | Geen actie, zoals voorzien. |

### Stand na golf 5c-2 (19 oktober 2026)

- Blokken en samenvoegpunten: A `2644a80`, B `ca0e159`, C `59dde45`, D `c00783d`; advisor ronde 1 en de kleine punten in `84b9adc` (`VERSION` 11). K5 kwam als laatste blok, zoals de gebruiker bepaalde, en zit in versie 11.
- Meting van de opstart (P1 en P4; mediaan van 5 metingen, om en om oud en nieuw, ruis van de WebGL-context uitgefilterd, SwiftShader): `startUp` tot de eerste weergave 669 naar 18 ms, `interactive` circa 650 ms eerder, `ready` niet korter. `ready` is vooral circa 2 s GPU-tijd van het eerste frame op SwiftShader; het doel van minstens 25 procent op `ready` is niet gehaald en door de gebruiker geaccepteerd (18 oktober 2026). De kerncijfers en de opstarttijdlijn van de Mac staan in [cijfers.md](cijfers.md).
- Nummergegevens (P1): `src/partnumbers.js` ging van 573.719 naar 420.986 bytes (het veld `note` staat alleen nog in de pagina met `pnToelichting`, en `map` is voorvoegselgecodeerd). De T4-marge is 8.761 bytes gzip (was 2.698 bytes op `b775511`); de exacte waarde op de eindstand: 361.239 bytes gzip -6 en 1.350.225 bytes raw op `80bee59`, dus een marge van 8.761 bytes gzip.
- Botsingsmeting: de zwaai van de achterklep en van de expansiedop gaf 0 nieuwe doordringingen (ECHT 0). `opentest.py` toetst met `EPS = 1e-6` (PR #8).
- Herkenbaarheid (S7) bij K11: 0,92 en 0,80 elk 8 van 9; alleen kenmerk 4 deels.
- Geometrie: de blokken C en D en K8 lieten de geometrie-hash gelijk, en de knoopvelden zijn na K5 gelijk. Het bevroren testcontract kreeg een regel over de rustende lus (`docs/testen.md`).
- Open: `ready` op SwiftShader; S7 kenmerk 4; de rommelige staart en de spikkels die de S7-beoordelaars noemen; de T4-marge. De tak `u.info` (K2) blijft bewust staan omdat itest controle 15 hem toetst.
- Export: het framework gaat met `framework.py export` naar espace5; zie [framework.md](framework.md), sectie Wat golf 5c-2 aan de generieke laag toevoegde.

## Golf 5f en 5e: carrosserie, feiten en de uitklapanimatie (19 oktober 2026; versie 12 gebouwd op de tak `golf-5f` en gepubliceerd, `d4186f1`, tag `v12`)

Golf 5f (carrosserie: S7 kenmerk 4, het onrustige achterpaneel, het losse zwarte blokje bij de C-stijl, de spikkels) en golf 5e (F1 tot en met F4 uit handboeken, schema's en catalogi) liepen samen, op besluit van de gebruiker; golf 6 wacht. De besluiten staan in [onderzoek/beslissingen.md](onderzoek/beslissingen.md), sectie "Besluiten van 19 oktober 2026 (golf 5f en 5e)". De bronkeuze bij een conflict ligt bij de orkestrator: werkplaatshandboek boven onderdelencatalogus boven overige bronnen.

Eigendom: `src/body.js` is alleen-lezen voor de domeineigenaars. De orkestrator heeft de wijziging van `body.js` door de carrosserie in ronde 2 goedgekeurd (ronde 3 liet `body.js` ongewijzigd) (besluit van de orkestrator, 19 oktober 2026); in de tak staat ze in `aaa46c3` (het staartvlak helt naar voren en de bumperrichel rondt af: `bodTB`, `bodTB1`, `bodTF`, `bodTipR`).

### Wat gedaan is

| Stap | Wat | Commits |
|---|---|---|
| Besluiten | Besluiten vooraf: omvang, `ready` alleen meten, bronkeuze door de orkestrator, publicatie als versie 12, espace5 versie 6 | `a5f8d65` |
| 5e | ATF bevestigd (Elfmatic J6, 7,6 l), velgtekst met de opties, besluiten F2 en F3 vastgelegd | `ba569e6` |
| 5e, F2 | Kaartlezer en startknop naar het dashboard (Notice NU 936-5, blz. 1.42-1.43, item 22), samengevoegd uit `golf-5f-int`; `index.html` herbouwd | `1c30c39`, `2201c13`, `414b93e` |
| 5e, F4 | Trapsgewijze uitklapbeweging begrensd (`CFG.tijd.staffel*`) | `fe4f033` |
| Meetmiddel | `LAG3_GPU=1` in de harness: beelden voor het oog op de echte GPU, testset en visdiff op SwiftShader | `ca68d71` |
| 5f, ronde 1 (T1 tot en met T3) | B-stijl als zwart vlak, zijruiten lichter; klepscharnierblad onder de achterruit; rechte, donkere zijnaden van de achterklep. Samengevoegd uit `golf-5f-carr`; `index.html` herbouwd | `a8672dd`, `4f8139f`, `8290ea1`, `05e2dc4`, `5828f60` |
| 5f, ronde 2 (R1 tot en met R5) | Staartvlak helt naar voren en de bumperpunt rondt af (R1); onderlip, sierstrip en naden voor zonder kartels (R2); uitlaateinden in een inham in de bumper (R3); achterste dakglas zonder lichtvlek (R4); spiegelvoet als smalle plaat (R5). Samengevoegd uit `golf-5f-carr2`; `index.html` herbouwd | `aaa46c3`, `3613e96`, `1899690`, `56a88ba`, `1cc2076`, `130a309`, `c4cc2a1` |
| 5f, ronde 3 (Q1 en Q3) | B-stijl breder (circa 12,8 cm), mat zwart, zonder chromen eindstukken (Q1); binnendelen van het achterlicht met afgeronde binnenrand, het klepvlak volgt (Q3). Samengevoegd uit `golf-5f-carr3`; `index.html` herbouwd; de onderdelenboom ververst (Chroomlijst B-stijl, vier paden, eruit) | `9e56964`, `9374b72`, `31b32e5`, `129eb6d`, `79545bf` |
| Visdiff-basislijn | 17 beelden vernieuwd uit de VM-run op `79545bf` met `visdiff --basislijn` (carrosserie, startknop, velgtekst); besluit B7 voor S7 kenmerk 4 | `ee84333` |
| Advisor-ronde | Tonen-staffel in `CFG`, `LAG3_GPU` alleen op macOS en nooit in `finaltests.sh`, besluiten F4, B7 en achterklep aangescherpt (`7752ed0`); voorportier 67 in plaats van 68 graden (`ae3b040`); klepscharnierblad begint achter het scharnierblok (`1ac1799`); uitlaat minstens 16 mm vrij van bumper en inham (`c72c69f`); teksten carrosserie (`bcb2b07`). Samengevoegd uit `golf-5f-fix`; `index.html` herbouwd; `VERSION` 12 | `7752ed0`, `ae3b040`, `1ac1799`, `c72c69f`, `bcb2b07`, `95c17f6`, `942f1ae`, `8fe6435` |

Wat de gebruiker ziet: de rij van versie 12 in [CHANGELOG.md](../CHANGELOG.md). Aantallen (knopen, onderdelen, driehoeken, budgetten) staan in [cijfers.md](cijfers.md).

### Exitcriteria en uitslag

Klaar is (`CLAUDE.md`): volledige set groen op macOS en op Linux, visdiff groen op Linux, open-standbotsingsmeting zonder nieuwe doordringingen, advisor-oordeel pass.

| Criterium | Uitslag |
|---|---|
| Volledige set op macOS | Groen. |
| Volledige set op Linux (VM `lag3-vm`) | Groen. |
| Visdiff op Linux | 42 van 42 na de vernieuwde basislijn (`ee84333`, 17 beelden vernieuwd). |
| Botsingszwaai (open stand, alle openers) | Zes geraakte openers (Achterklep, de vier portieren, Motorkap) gezwaaid tegen `main` (stap 0,05, h 4 mm) op `8fe6435`: ECHT 0. Eén grensgeval (Portier rechtsvoor stand 0,95, Deurvanger tegen Schermpaneel, 5,85 naar 5,96 mm) is met de ruisproef bij h 1,5 mm RUIS (omhullende 5,99 tegen 6,00 mm); de stand is door de hoek van 67 graden een iets andere hoek dan in `main`. |
| Herkenbaarheid (S7), eis 7 van 9, doel 8 | 7 van 9 bij meerderheid, zie hieronder. Eis gehaald, doel niet. |
| Advisor-oordeel | De punten van de advisor zijn verwerkt (rij Advisor-ronde); het oordeel na die ronde: pass (nacontrole, alle 11 punten opgelost). |

S7 (drie Opus-beoordelaars, high; beelden van de echte GPU, `LAG3_GPU=1`):

| Meting | Score | Kenmerken die niet unaniem ja zijn |
|---|---|---|
| Basis (vanaf `414b93e`) | 8 van 9 | 4 deels (3 van 3: B-stijl een dunne lijn, chroomlijst nauwelijks); 8 ja, deels, ja |
| Na ronde 2 | 7 van 9 | 4 deels (3 van 3); 8 deels, ja, deels (staart in het bovenaanzicht stomp en breed); 7 ja, ja, deels |
| Na ronde 3 | 7 van 9 | 4 deels (3 van 3); 8 ja, deels, deels |

Het bovenaanzicht van de basis en van ronde 3 is vorm voor vorm gelijk (alleen de lichtvlek op het achterste dakglas is weg): de wisseling bij kenmerk 8 is vermoedelijk oordeelsruis (T2). Een zijglas met dekking 0,62 en 0,72 gaf voor kenmerk 4 nauwelijks verschil. Meldingen die per ronde terugkwamen: onrustige naden en een vlekkerig vlak van achterklep en bumper, uitlaateinden als losse cilinders, gekartelde randen voor (basis, drie van drie), daarna de binnendelen van de achterlichten als rechthoekige blokjes, een lichte band rond het kenteken, een V-knik midden op de motorkap en de spoilerlip als dikke zwarte band (ronde 2).

**Besluit B7** (gebruiker, 19 oktober 2026): kenmerk 4 krijgt geen geometrie meer en wordt beoordeeld op de maat in het model (zwarte B-stijl van circa 12 tot 13 cm, geschat uit foto's, raamlijsten langs de bovenrand en drie zijruiten met kwartsruitje). "Leest op 1280 × 800 als smalle zwarte streep" is daarmee geen reden meer voor deels. De gemeten score blijft 7 van 9.

### Metingen

- Spikkels en `ready` (`ready` alleen meten): op de echte GPU (ANGLE Metal, Apple M5 Pro) zijn er geen spikkels en is `ready` 0,67 s (mediaan van 5); met SwiftShader is `ready` 2 tot 7 s, afhankelijk van de belasting. De spikkels op motorkap, dak en portieren zijn dus een SwiftShader-artefact, en de circa 2 s van `ready` uit golf 5c-2 zijn rekentijd van de software-renderer. Op de echte GPU valt niets te verbeteren. Gevolg: opnames voor oordelen op het oog (S7, galerij) gaan op de GPU; de testset, visdiff en de basislijnen blijven op SwiftShader (zie [testen.md](testen.md)). De opstarttijdlijn van de Mac met SwiftShader staat in [cijfers.md](cijfers.md).
- Uitklapanimatie (F4): van de onderdelen liggen er 1.438 op 5 of meer gesloten groepen diep. Een duik daarheen duurde 1,73 tot 2,39 s en alles uitklappen 3,09 s (7 lagen); nu hoogstens circa 1,45 s en circa 2,25 s. De duur van een stap blijft 0,85 s; de hypothese "te snel bij kleine groepen" is niet bevestigd, want een stap duurt altijd 0,85 s, ongeacht de afstand.

### F1 tot en met F4

| Nr | Stand | Wat |
|---|---|---|
| F1 | Gedaan (`ba569e6`) | ATF: Elfmatic J6, 7,6 l totaal, 3,5 l na aftappen. ELF MATIC S6 in de AJX-tabel van MR 415 is een tabelnaam of drukfout: de Nederlandse editie van 2007 noemt J6, Elf keurt J6 goed voor de AJ0 en een product S6 bestaat in geen catalogus. Bijgewerkt in `beslissingen.md`, `specificaties-en-bronnen.md` en `src/drivetrain.js`. |
| F2 | Deels; afgehandeld in vervolgronde 5g | Gedaan: voorportier 67 graden (RiDC, `ae3b040`; Aannemelijk), velgtekst met de opties (18 inch blijft, `ba569e6`), kaartlezer en startknop in het dashboard (`1c30c39`, `2201c13`; Bevestigd met NU 936-5, blz. 1.42-1.43, item 22). Toen open (sinds vervolgronde 5g beantwoord door de waarnemingen van de gebruiker, zie "Vervolgronde 5g"): achterklep (blijft op 66 graden; de brochure noemt 1.900 mm met open klep tegen 2,36 m voor het hoogste punt in het model, een rolmaat beslist), accuzijde (aanwijzing linksvoor boven de automaat in MR 415; het model heeft rechtsvoor), de hoeken van motorkap en achterportier. |
| F3 | Deels; lengte en verbruikers bevestigd in vervolgronde 5g | Multiriem: 7PK1795 (1.795 mm) bevestigd; de kortere riemloop in het model blijft met de bestaande uitleg. In vervolgronde 5g: 7PK van 1.790 tot 1.795 mm en de stuurpomp als verbruiker bevestigd door de catalogus. Open: het verloop (alleen in figuur 124137 van MR 415, 11A-17; niet gevonden). |
| F4 | Gedaan (`fe4f033`, `7752ed0`) | Duiken en tonen wachten per laag nog 0,22 en 0,18 s, maar samen hoogstens 0,6 s; alles uitklappen 0,32 s per laag, samen hoogstens 1,4 s (`CFG.tijd.staffelMaxS` en `allesStaffelMaxS`). De GIF-vergelijking naast versie 1 vervalt: er is gemeten in plaats van opgenomen, en een meting zegt hier meer dan een opname. |

### Open na golf 5f en 5e

- Metingen aan de auto van de gebruiker (Meetlijst in [handomdraai.md](../handomdraai.md)): het hoogste punt van de open achterklep, de accuzijde en de hoeken van motorkap en achterportier.
- Het verloop van de multiriem (figuur 124137 van MR 415).
- S7: kenmerk 4 volgt sinds B7 de maat in het model; kenmerk 8 blijft ruis-gevoelig.
- Export naar espace5 gedaan: espace5 versie 6 (`e2e0d76`, framework uit `d4186f1`), Mac en Linux-VM groen (itest 152 van 152, visdiff 51 van 51), Pages en artefact byte voor byte teruggelezen, tag `v6`; zie de CHANGELOG van espace5.

## Vervolgronde 5g: waarnemingen van de gebruiker (19 oktober 2026; versie 13 gebouwd op de tak `golf-5g`, nog niet gepubliceerd)

Na de publicatie van versie 12 (19 oktober 2026, `d4186f1`, tag `v12`, artefactversie 14, Pages byte voor byte) keek de gebruiker op de eigen auto en meldde wat het model anders had. Dit was een korte vervolgronde zonder eigen golf: eerst de waarneming narekenen, dan de wijziging. De besluiten staan in [onderzoek/beslissingen.md](onderzoek/beslissingen.md), sectie "Besluiten van 19 oktober 2026 (vervolgronde 5g, waarnemingen van de gebruiker)".

### Wat gedaan is

| Onderwerp | Stand | Commit |
|---|---|---|
| Accu | Links achter in de motorruimte, boven de automaat; het model had hem rechtsvoor. Dat past bij MR 415 (de accubak draagt de zekeringkast en de motor-ECU). De zekeringkast staat op de accubak. Bevestigd (zijde, waarneming gebruiker), Aannemelijk (maat). | `aa14953`, samengevoegd in `bcd0ca1` |
| Verlegd om de accu | Het luchtfilterhuis 3 cm naar voren en ingekort, de aanzuigslang, de resonator, de hete laadluchtslang, de brandstofleiding en de accukabels. Teksten van de langsligger en de stuurslangen bijgewerkt. | `aa14953`, `81b42dd` |
| Velg | 18 inch met 225/45 R18 bevestigd door de gebruiker. | `f5aa49d` |
| Multiriem | 7PK, 1.790 tot 1.795 mm; drijft dynamo, aircocompressor en stuurpomp aan (catalogus, TecDoc-type 23370). De "aannemelijk" bij de stuurpomp vervalt. Het verloop blijft open. | `f5aa49d` |
| Motorkap | 65 graden blijft: de gebruiker schat 60 tot 75 graden. Alleen een commentaar in `src/bodyparts.js`. | `f5aa49d` |
| Achterklep | 66 graden blijft; het open punt H1 over de brochuremaat (1,90 m) is gesloten, want de gebruiker vindt de stand goed. | `f5aa49d` |
| `VERSION` | 13. | `81b42dd` |

### Wat open blijft

- De plaats van de motor-ECU: sinds versie 16 op de accubak linksvoor (golf 5j).
- Het verloop van de multiriem (figuur 124137 van MR 415, niet gevonden).
- Gedaan (niet meer open): de botsingsmeting van de motorkap in open stand, zwaai van de Motorkap tegen `main` (stap 0,05, h 4 mm) op `81b42dd`: ECHT 0, RUIS 0, NOG TE BEOORDELEN 0.
- De hoek van het achterportier (Meetlijst).
- Poort voor publicatie: de volledige set op macOS en op Linux, visdiff op Linux (de accu en de leidingen veranderen het beeld van de motorruimte, dus de basislijn kan vernieuwd moeten worden), open-standbotsingsmeting zonder nieuwe doordringing en advisor-oordeel pass; uitslag volgt na de run.

## Golf 5d: onderdeelnummers (1 dag in plakken; versie 9)

Voorwaarde: A10. Eigenaar: gegevens, met dezelfde verificatiepoort als golf 4 (opnieuw ophalen, letterlijk op de pagina, drie lokvogels per plak, alle lokvogels afgewezen). Firecrawl heeft geen tegoed; Jina-reader en curl zijn de route. Dekking wordt geteld op `zelf` met een plafond per eenheid voor `set` en `deel` (anders geeft één "Boutenset" op driehonderd bouten de telling in één keer).

| Nr | Wat | Grond |
|---|---|---|
| N1 | `INHERIT` als migratie voor de knopen uit de herstelrondes zonder regel: Vulklepring, Armsteunbekleding, Hoedenplankkoord links en rechts, Plankscharnierpen links en rechts, Vulopening, A-stijlbekleding links en rechts. | handomdraai 13 |
| N2 | Dekkingsronde "wat een eigenaar bestelt": een lijst van de 100 meest bestelde delen (filters, remblokken en -schijven, riemen en rollen, bougies, bobines, lampen, wissers, lagers, sensoren, schokdempers, koelslangen, thermostaat, waterpomp, aandrijfasmanchetten, ruitenwissermotor, sproeierpomp); die lijst is de teller van de dekking, niet het totaal. Plakken van 25 met een harde stop. | handomdraai 10 |
| N3 | CSV normaliseren: `unit_id`, bron per nummer (nu alleen de eerste URL per eenheid, waardoor 426 unieke URL's tot 169 terugvallen en de bron niet bij het nummer hoort), `var`, `per`, regel, `info`; statuslabel zoals in het paneel; `docs/onderdeelnummers-schema.md`. De regels met Engelse catalogusattributen beoordelen tegen de claim "geen productteksten" (README:113, 198): strippen of de claim aanpassen. | audit; databankenrecht |
| N4 | Paden met een schuine streep (`ABS/ESP-unit`, `Platen L/R-rem`, `Zuigerhuis L/R-rem`, `Lage/achteruitrem`): een ander scheidingsteken in `map` en CSV, of de namen hernoemen; `uiByPath` en `opentest.py:80` lopen er nu op vast. | audit |
| N5 | Varianten op VIN (71 eenheden) zodra de gebruiker het chassisnummer geeft; Renault-catalogusroute (BT0H of BT06 met F4R811) zodra partsouq of 7zap bereikbaar is; de twee D-nummers van het panoramadak naar B. | handomdraai 11, 12 |
| N6 | 24 bron-URL's met `?page=N` vervangen door de stabiele artikelpagina. | audit |

Stand 16 oktober 2026, 02:40 UTC (structurele ronde, commits `5889293` en `1e78118`): N3 gedaan (23 kolommen, alle bronnen per rij, statuslabels als in het paneel, `docs/onderdeelnummers-schema.md`; de CSV is 5,5 MB door de herhaling per rij, een losse eenhedentabel is de uitweg als dat te groot wordt); de Engelse catalogusattributen zijn in de bron vervangen door Nederlandse aanduidingen (400 records); N4 beoordeeld: geen hernoeming nodig, de app zoekt op het volle pad en `unit_id` maakt de CSV-rij eenduidig; N6 open: de 24 URL's zijn categorielijsten van autodoc.parts, de artikelpagina is niet af te leiden en ophalen mislukte (Jina 402, Firecrawl zonder tegoed, curl 403 achter Cloudflare); N1 deels (Vulopening en Vulklepring in golf 5, de rest bewust niet onderzocht); N2 en N5 open met de verificatiepoort.

Poort: `pncheck` groen (reproduceerbaar, bronnen per nummer niet gedaald); dekking op de 100-lijst in `cijfers.md`; lokvogels 0 doorgelaten; itest 15 groen.

## Golf 5e: feiten en de echte auto (doorlopend; F1 tot en met F4 in versie 12, zie "Golf 5f en 5e" hierboven voor de stand)

| Nr | Wat | Grond |
|---|---|---|
| F1 | ATF: MR 415 noemt ELF MATIC S6, 7,6 l totaal en 3,5 l na aftappen in een AJX-tabel; `beslissingen.md` en `specificaties:99` zeggen Elfmatic J6, 8 l, "Bevestigd". Uitzoeken welke tabel voor de AJ0 geldt; besluit in `beslissingen.md`, status in `specificaties`, spec in `drivetrain.js:420`. Stand: gedaan in versie 12 (Elfmatic J6, 7,6 l, Bevestigd). | handomdraai 15 |
| F2 | Metingen aan de auto van de gebruiker: hoeken van kap, portieren en klep, velgmaat (17 of 18 inch), accuzijde, plaats van de startknop; daarna `open.angle` en de specificaties bijwerken. 4Control is beantwoord (`ca25166`). Stand na vervolgronde 5g (19 oktober 2026): de velg is 18 inch met 225/45 R18 (waarneming gebruiker), de accu staat links achter boven de automaat (waarneming gebruiker, in het model verplaatst), de motorkap van 65 graden past bij 60 tot 75 graden en de achterklep van 66 graden is besloten; open blijft alleen de hoek van het achterportier. Stand na golf 5f en 5e (toen): de startknop is beantwoord door de gebruiksaanwijzing (dashboard, geen meting nodig), de velgmaat door de prijslijst (18 inch blijft), het voorportier staat op 67 graden (RiDC); open bleven de achterklep, de accuzijde en de hoeken van motorkap en achterportier. | handomdraai 16; specificaties "Open punten" |
| F3 | Multiriem (1.569 mm tegen 1.795 mm): alleen met de riemloop uit MR 415; de dynamo 0,11 m hoger komt boven het kapprofiel. Anders blijft de eerlijke beschrijving staan. Stand: de lengte (7PK, 1.790 tot 1.795 mm) en de verbruikers (dynamo, aircocompressor, stuurpomp) zijn bevestigd door de catalogus (vervolgronde 5g); het verloop staat alleen in figuur 124137 van MR 415 en is niet gevonden; de beschrijving blijft. | audit |
| F4 | De uitklapanimatie zelf beoordelen: `DUR` 0,85 s (`app1.js:77`) en staffels van 0,22 s; één vóór/na-opname als GIF naast versie 1 (te traag bij diep duiken, te snel bij kleine groepen). Stand: gedaan als meting; de staffel is begrensd (`CFG.tijd.staffelMaxS`, `allesStaffelMaxS`), de GIF vervalt. | ontbrak |

## Golf 6 (strategisch, alleen bij een concrete aanleiding)

| Keuze | Wanneer | Wat |
|---|---|---|
| three.js blijft op r147 | standaard | Geen werk. r147 is de laatste versie met `examples/js`. Risico: geen beveiligings- of browserfixes meer. |
| Migratie naar ES-modules en een actuele three.js (0.186) | als er een functie nodig is die r147 mist | Aanleidingen: `THREE.BatchedMesh` (r159+) kan de eigen bundelcode in `app1.js:699-857` vervangen; `transmission` voor echt glas; WebGPU als terugval. Spike van een dag in een worktree: `build.py` bouwt een `<script type="module">` met een importmap naar jsDelivr-ESM, de bron blijft één naamruimte via een wrapper; `pubsmoke.py` en de CDN-controle mee. Doorzetten alleen als de spike de volledige itest haalt. |
| Een tweede bestand naast de pagina | als de pagina echt kleiner moet | Nummergegevens als los JSON op Pages laden scheelt 565 kB, maar breekt "dezelfde bytes" op het artefact: een beslispunt over het aantal kanalen, geen techniekvraag. |
| Offline | na R5 | Service worker die three.js en de lettertypes cachet. |
| Engelse versie | na K6 | Alleen de teksttabel en de presetnotities; de 1.600 Nederlandse beschrijvingen blijven Nederlands tot er vraag naar is. |

## Volgorde, capaciteit en poorten

| Stap | Golf | Agents | Duur (richting; harde stop is anderhalf maal) | Poort vóór samenvoegen | Publiceren |
|---|---|---|---|---|---|
| 1 | 5a-1 vangnet-kern | orkestrator plus 1 tooling-agent | 1 dag | A2 groen in verse container; `finaltests.sh` één exitcode; zustertak samengevoegd | nee |
| 2 | 5b-1 camera's en materialen, naast 5a-2 | 4 domeinagents (carrosserie, interieur, motor, orkestrator voor `core.js:70`); 1 tooling-agent voor 5a-2 | 1 dag | volledige set strikt; vóór/na-poort per punt; 3 paren tegen v6 | ja, versie 7 (met A6) |
| 3 | 5c-1 robuustheid, bediening, tests | 1 app-agent plus 1 test-agent | 1 dag | itest circa 190; eerste-beeld-poort; 3 paren tegen v7 | ja, versie 8 |
| 4 | 5d nummers | 1 gegevensagent plus 1 verifieerder | 1 dag in plakken | `pncheck`, dekking, lokvogels | ja, versie 9 |
| 5 | 5b-2 geometrie en budget | 6 domeinagents (gedaan op 16 oktober, 16:18 tot 20:21 UTC) | 1,5 tot 2 dagen | set strikt, budgetten, `visdiff` (eigen basis), poort niet lager, S7 8 van 9 (niet gehaald) | ja, versie 9 (gepubliceerd op 16 oktober, 21:30 UTC) |
| 5b | 5b-3 restpunten van 5b-2 | orkestrator plus domeinagents | 1 tot 1,5 dag | zoals 5b-2, met `clash.py` 0 | ja, versie 10 |
| 6 | 5c-2 prestaties en codegezondheid | 1 app-agent | 1 tot 1,5 dag, K5 apart | volledige set; `timing()` 25 procent korter | ja, versie 11 |
| 6b | 5f carrosserie en 5e feiten (F1 tot en met F4) | orkestrator plus domeinagents (carrosserie, interieur, app) | 1 dag (19 oktober 2026), drie rondes plus een advisor-ronde | set groen op macOS en Linux, visdiff op Linux, zwaai zonder nieuwe doordringing, S7 minstens 7 van 9, advisor pass | ja, versie 12 |
| 7 | 5e feiten (rest) | orkestrator plus gebruiker | doorlopend | besluit in `beslissingen.md` | mee met de volgende versie |
| 8 | 6 strategisch | spike van 1 dag | op aanvraag | volledige itest op de spike | nee tot besluit |

Elke golf krijgt vooraf een korte premortem (één lens, zeven oorzaken, struikeldraden) zoals in `docs/premortem.md`, en achteraf de drie tijden in `CHANGELOG.md`.

## Struikeldraden voor dit plan

| Nr | Meting en drempel | Bij overschrijding |
|---|---|---|
| T1 | `tri.py --gate` boven een budget na een samenvoeging | niet publiceren; eigenaar verlaagt segmenten of stations in de eigen golf; budgetten zelf staan in `anchors.json` en wijzigen alleen met een reden in `beslissingen.md` |
| T2 | Poort K1-K13: een kenmerk zakt twee stappen (ja naar nee), of zakt één stap en een tweede, onafhankelijk panel reproduceert dat | de wijziging die het kenmerk raakt terugdraaien; een daling van één stap zonder reproductie is ruis en geen actie |
| T3 | CI push-job rood op `main` | niets anders tot groen; een rode nachtrun opent een issue |
| T4 | `index.html` meer dan 100 kB gegroeid in één golf zonder reden in het commitbericht, of boven 1,8 MB raw / 490 kB gzip (MB = 10^6 bytes, `gzip -6`; grens verhoogd door de gebruiker op 17 oktober 2026, was 1,4 MB / 330 kB, op 19 oktober 2026 voor golf 5i naar 385 kB op 20 oktober 2026 voor golf 5k naar 395 kB gzip en voor golf 5l (cockpit en interieur) naar 1,6 MB raw en 430 kB gzip, binnen de ruimte die de gebruiker gaf, en op 20 oktober 2026 voor golf 5m (onderdeelnummers) naar 1,7 MB raw en 450 kB gzip; de gebruiker: "mag groter indien nodig"; op 21 oktober 2026 voor golf 5n (foto's van de eigen auto) naar 1,8 MB raw en 490 kB gzip, besluit van de gebruiker) | reden toevoegen of terugdraaien; 5d mag groeien met de nummers die het toevoegt |
| T5 | Golf langer dan anderhalf maal de richting | scope halveren, de rest naar de volgende golf; nooit de poort overslaan |
| T6 | Een melding van de gebruiker zonder reproductie met `pick.py`, stralen of opname | eerst reproduceren, dan pas wijzigen |
| T7 | `pncheck` rood, een lokvogel doorgelaten, of bronnen per nummer gedaald | de plak vervalt in zijn geheel |
| T8 | `IGNORE` in de harness, de basislijn van `visdiff`, `anchors.json` of de testlijst in `finaltests.sh` gewijzigd buiten een commit van de orkestrator | terugdraaien; `mergecheck.py` markeert ze alleen-lezen |

## De tegenstander: waar een agent op groen kan sturen, en de verdediging

| Taak | Sturen op groen | Verdediging |
|---|---|---|
| A4 `--strikt-min` | `min: 0.01` | `min` minstens 0,8 maal `angle`/`move` in `opentest.py` |
| A8 budgetten | budget verhogen of een zwaar deel naar een andere hoofdgroep | budgetten in `anchors.json` (alleen-lezen); `tri.py` meldt onderdelen per groep |
| A5 waarschuwingen | regel in `IGNORE` | `IGNORE` is contract, met reden en datum |
| G1, G6 driehoeken | segmenten omlaag op zichtbare vlakken | `visdiff` en de galerij op 1280 × 800 als poort |
| G7 `inner` | meer vlaggen, minder tekenopdrachten | `ui_inner --strict --open`; stijging alleen met een lijst per knoop |
| P1 | `src` of `note` schrappen om kleiner te worden | `pncheck` telt bronnen per nummer, mag niet dalen |
| `visdiff` | basislijn vernieuwen na elke wijziging | basislijn alleen door de orkestrator, met vóór/na-galerij |
| U6 axe | `aria-hidden` op het canvas | toetsenbord-itest is de poort, axe is informatie |
| `anchorcheck` | ankers naar de terugval schuiven | twee metingen, geen van beide mag dalen |
| N2 dekking | één set op honderden bouten | tellen op `zelf`, plafond per eenheid, de 100-lijst als teller |
| A14 drift | getallen schrappen | vaste lijst grootheden in `cijfers.md` |
| itest "circa 190" | vulcontroles | elke controle noemt de fout die hij gevangen zou hebben |
| K2 dode code | verwijderen wat de tests via globals gebruiken | bevroren testcontract in `docs/testen.md` |
| A3 `finaltests.sh` | `\|\| true` of een test uit de lijst | CI vergelijkt de testlijst met de verwachting |

## Wat bij de gebruiker ligt (beslispunten)

Beantwoord op 15 oktober, 20:10 UTC:

- **Licentie: MIT** voor de code, met een aparte gegevensnotitie voor `docs/onderdeelnummers.csv` (alleen nummers en URL's; databankenrecht niet juridisch getoetst). Uitvoeren in A13.
- **`gh-pages` mag weg.** `git push --delete` en de REST-verwijdering kregen van de proxy een 403; als dat bij de uitvoering weer zo is, verwijdert de gebruiker de tak in GitHub (Settings, Branches) en noteert het plan dat.
- **Chassisnummer is bekend** (door de gebruiker gegeven in de sessie). Regel: het nummer komt niet in de repo, de pagina, de CSV of een commitbericht; de repo is publiek. Het wordt alleen gebruikt om in 5d (N5) de 71 varianten op te zoeken; vastgelegd wordt uitsluitend de afgeleide uitvoering (schijfmaat, zijde, bak, bouwdatum) met de bron, en in de pagina de tekst "uitvoering vastgelegd op het chassisnummer van de gebruiker".

Nog open:

1. **Afstemming met de sessie op `ccr-bd755431-1qfniw`**: dit plan wacht op de geplande check (23:09 UTC) en begint pas als die tak rust; daarna gebeurt alles vanaf `main`.
2. **Telefoonsessie** met het protocol van A7, zodra versie 7 staat.
3. **Metingen aan de auto** (F2): hoeken van kap, portieren en klep; velgmaat; accuzijde; startknop. Na golf 5f en 5e zijn velgmaat en startknop beantwoord; in vervolgronde 5g ook de accuzijde, de motorkap en de achterklep (waarnemingen van de gebruiker). Open blijft de hoek van het achterportier.
4. **Golf 6**: wel of geen spike naar ES-modules en een actuele three.js; standaardadvies is nee tot er een aanleiding is. Een tweede bestand naast de pagina alleen als het artefact als kanaal mag vervallen.
5. **Prioriteit** als er maar één spoor tegelijk kan: de volgorde hierboven (zichtbaar eerst, geometrie en schuld daarna). Wie liever de nummers eerst wil, schuift 5d naar stap 3; dat kan, want 5d hangt alleen aan A10.

## Verificatie van het hele plan

Na elke golf, op de samengevoegde stand:

```bash
git ls-remote --heads origin && git log --oneline main..origin/ccr-bd755431-1qfniw   # niets open op de zustertak
tools/setup.sh                                   # verse container: playwright, three.js met hash, Chromium
python3 build.py --lint                          # inclusief de nieuwe lint-regels
python3 build.py && git diff --exit-code index.html   # index.html hoort bij src/
python3 tools/pncheck.py                         # partnumbers.js en CSV reproduceerbaar, bronnen per nummer
tools/orkestratie/finaltests.sh UIT              # strikt; één exitcode; tijden per test
python3 tools/tri.py --gate                      # budgetten uit anchors.json
python3 tools/visdiff.py UIT/presets docs/baseline   # visuele regressie (vanaf versie 7)
python3 tools/orkestratie/gateshots.py UIT/gate   # daarna Workflow poort.js op vóór/na-paren
python3 tools/orkestratie/cijfers.py UIT/stats.json > docs/cijfers.md  # kerncijfers, vaste lijst
```

Daarna publiceren (Pages via `main`, het artefact als spiegel), de URL teruglezen en byte voor byte vergelijken, tag zetten, `CHANGELOG.md` (met de drie tijden) en `handomdraai.md` bijwerken, en de drie vóór/na-paren in de opleverboodschap.

## Bijlage A: bevindingen per dimensie, met vindplaats

### A.1 App-laag (audit, steekproefsgewijs door mij nagelopen)

- Dode code: `hlMat`/`HL` (`core.js:108-119`), `fitBox` (`app1.js:528`), `MAXDEPTH` (`app1.js:17`), `uiAnyOpen` (`app1.js:235`), `uiMakeAnchors` (`app2.js:1041`); bevestigd met grep (alleen de definities bestaan).
- `innerHTML`: 17 plekken, geen enkele met `PN_DATA`; `renderPn` gebruikt `textContent`; `esc` ontbreekt op `p.key` (`app2.js:658`) en de aanwijstip (`:771`) heeft een halve sanitizer.
- Prestaties: geen `new Vector3` in warme lussen (goed); wel `[...uiBatched]` per frame, DOM-schrijven per frame bij afspelen, dubbele `applyMats` per klik, `uiWithFinal` met twee `updateMatrixWorld(true)` per aanroep. `buildCar` is 123 tot 526 ms; `ready` (5,6 s op SwiftShader) wordt bepaald door eerste weergave en batches, niet door de bouw.
- Toegankelijkheid: alle knoppen hebben een naam; `role="menu"` met een niet-menuitem, `role="toolbar"` zonder pijlnavigatie, canvas zonder focusrand, schakelaar-uit contrast circa 1,3:1, tikdoelen 21 tot 36 px, `data-theme` zonder knop, `REDUCED` zonder luisteraar, rondleiding loopt door in een verborgen tab.
- Testbaarheid: 53 haken op `window.__laguna`; `setOpen`/`openAll` slaan `uiPush` over; thema, menu, paneel, tabs, hulpvenster, rondleidingverloop, historie-inhoud en `uiLastFit` zijn niet van buiten te toetsen.
- Teksten: alles hardcoded Nederlands verspreid over `head.html`, `app2.js`, `presets.js`; de regex op `app2.js:61` knipt een zin uit `systems.js:365`.
- Laadtoestand: `head.html:501` toont statisch "Model opbouwen…", geen voortgang, geen `<noscript>`, geen favicon, geen `og:`-meta, geen URL-toestand.

### A.2 Geometrie (audit; de vijf nieuwe bevindingen bovenaan)

- Nieuw: brandstoftank op y 0,183 tot 0,353 boven de vloerplaat (`systems.js:215-219`, bevestigd); ECU-tekst noemt nokkenasverstelling (`systems.js:319`, bevestigd); eindoverbrenging 3,571 tegen 3,804 (`drivetrain.js:216` tegen `:188` en `:420`, bevestigd); `skin()` nergens gebruikt; motorkapsteun is al Ø10 mm (bevestigd).
- Duplicatie: bout en moer in vier varianten, slangklem in drie, `sysHose` alleen in systems en met de hand nagebouwd in chassis, engine2, panorama en bodyparts; `bellows` zonder voorvoegsel gedeeld door drie eigenaren; Sutherland-Hodgman drie keer; `panWeld` gelijk aan `bodWeldAll`. Spiegelen via `s:[-1,1,1]` wordt al gedaan voor wielhoeken, spoorstang, wielen en kleine carrosseriedelen; portieren, spiegels, voorstoelen en panoramadak zijn dubbele code.
- Contract: engine1-3 gebruiken geen enkele carrosseriefunctie; `HW` en `skin` buiten `body.js` ongebruikt; dezelfde maten voor achterveer en torsiebalk bij twee eigenaren; terugvalwaarden voor de stuurpomppoorten verouderd; `MAT.brass` bestaat niet (bevestigd); cache-sleutels zonder voorvoegsel `disc`, `rboot`, `boost`; `MAT.paint`/`paintIn`/`glass` worden in `bodyparts.js:3-7` overschreven.
- Gegevens: 22 spec-paren met "geschat/aannemelijk/circa"; 54 beschrijvingen onder 25 tekens; notatie wisselt; `Carterbouten` 18 stuks met "minimaal 18".
- Driehoeken (schatting uit de code): bumperschaal voor circa 11.000, achter 10.000, achterschermen 4.300 tot 4.700, motorkap 4.200, band 3.712 maal vier, stator 2.900, portierpaneel 2.444 tot 2.808 maal vier; circa 250 hexBolts maal 128 is 32.000; 16 klepveren 7.900; 20 zuigerveren 5.100.
- Openers: vier leiders zonder `min` (Zonnescherm voor en achter, Olievuldop, Expansiedop; consistent met `panorama.js:129` en `ontwerp:235, 242`); tien volgers zonder `min`.
- Ontbrekend: ruitensproeiertank en pomp, aircoleidingen, vacuümslang rembekrachtiger, koplamphoogteregeling, airbagregeleenheid, zijbekleding bagageruimte, B/C-stijlbekleding, bagageruimte- en instapverlichting, krik en gereedschap; onzeker: knieairbag, tiende luidspreker, gierhoeksensor.

### A.3 Tooling, tests, gegevens, docs (audit; kernpunten bevestigd)

- `build.py --lint` ziet geen cache-sleutelprefix, geen `d`-plicht, geen ankernamen, geen aantallen, geen notatie, geen paginabudget; versie 0.147.0 staat dubbel (`build.py:20`, `harness.py:27`).
- `finaltests.sh`: altijd exitcode 0, geen tijdmeting, zonder argument naar `/`, zonder `--strict` en `--strikt-min` (bevestigd).
- `harness.errors()` telt alleen `error` (bevestigd, `harness.py:95`); alleen itest faalt op een waarschuwing.
- `tri.py` en `stats.py` geven altijd 0; `g4final3` ging over het carrosseriebudget en heette groen (`testen.md:174`).
- `build_pn.py`: slaat ontbrekende invoer stil over (`:61-63`), overschrijft `partnumbers.js` en de CSV (`:154-156`), is niet idempotent (`UNIT_FIX`, `:137-140`), laat niet-http-bronnen vallen (`:84`), leest `../kennis/info.json` buiten de repo (`:120`); de invoer stond alleen in het scratchpad.
- Tests hangen aan interne globals (`uiTick`, `uiBatchSync`, `uiBatchQ`, `uiBatchFree`, `uiBatchStep`, `ASMS` in `opentest.py`; `applyVisibility`, `PN_DATA` in `itest.py`), niet alleen aan `__laguna`.
- Niet getoetst: toetsenbord (op Backspace, 0-9 en O na), formaatwissel, liggend, 50 stappen terug, reduced motion, WebGL- en CDN-uitval, diakrieten, donker per preset, labelankers, zone-afspraken, visuele regressie, CSV tegen `PN_DATA`, notatie in `d`, het eerste beeld op de telefoon.
- CSV: uitgeklapte projectie zonder unit-id, `var`, `per`, regel en `info`; bron alleen de eerste URL per eenheid; 8 eenheidsnamen dubbel onder een ander id; 24 URL's met `?page=N`; ruim 100 regels met catalogusattributen (114 op vier patronen, 46 op een smaller patroon).
- Drift: zie A14. Alle 45 relatieve links in de docs kloppen.
- Repo: 93 procent van `.git` (18,3 MB) zijn 33 screenshot-blobs; `docs/v1/index.html` is gelijk aan `9164d0a` (bevestigd); geen LICENSE, CLAUDE.md, `.gitattributes`, CHANGELOG, tags.
- Publicatie: vier kanalen (artefact v6, tussenartefact golf 1, Pages v6, `gh-pages` v5); geen versie in de pagina; `pubsmoke.py:91` heeft een harde 20 s bij laadtijden van 5 tot 28 s.

## Bijlage B: correcties op `handomdraai.md`

| Regel | Staat er | Werkelijkheid |
|---|---|---|
| 7, 10, 77 | main op versie 5; akkoord nodig om main bij te werken | `origin/main` is `f3a7854` (versie 6) sinds de merge van PR #2 om 18:21 UTC; Pages serveert 1.337.555 bytes |
| 7 | werktak `ccr-bd755431-1qfniw` op `3ab6a8d` plus docs | die tak staat op `ca25166`, drie commits vóór `main`, en wordt nog gebruikt |
| 11 | `gh-pages` bestaat nog | klopt nog; verwijderen blijft bij de gebruiker |
| 21, 66 | hulpmiddelen alleen in het scratchpad | ze staan in `7cdfe3b` op de zustertak; samenvoegen in A1 |
| 39 | steunstang dikker maken | hij is al Ø10 mm; camera en contrast zijn het probleem (B3) |
| 44 | dakglas naar 0,7 alleen als de gebruiker het wil | de gebruiker koos 0,92 (`af22323`); K8 opnieuw ijken (B10) |
| 52 | koppelen in `build_pn.py` (INHERIT) | pas na A10, want de invoer van het script ontbreekt in de repo |
| 60 | 4Control niet vastgesteld | vastgesteld: de auto heeft het niet (`ca25166`) |
| 17, 23 | 223 ingesloten knopen, 439 tekenopdrachten | klopt; `ontwerp` en `testen` noemen nog 253 en 390 (A14) |
| 59 | torsiebalk boven de vloer | ook de brandstoftank ligt boven de vloer (G3) |

## Golf 5h: voorruit en voorkant (versie 14)

Aanleiding: klacht van de gebruiker over de voorruit en de aansluitingen eromheen, met een persfoto van een Laguna III fase 2 als voorbeeld; advisor Fable 5.1 op xhigh op verzoek van de gebruiker.

| Ronde | Wat | Commit |
|---|---|---|
| 1 | Kas loopt tussen z 0,97 en 1,06 over in de kapvorm (open driehoeken naast de ruithoeken weg); wissers laag in de ruitvoet; wissermotor onder de torpedobak (zes oude doordringingen weg); zwarte spiegeldriehoek; bovengrille 5 cm zwart met chroomlijn. Fable: bijsturen. | `1657942` |
| 2 | Voorruit eigen tint en glans (dekking 0,80 blijft); A-stijlvoet zonder bult, smoothstep, dashboardhuid vanaf z 1,00; spiegel 7 cm naar voren; ruitvoet dichter. Fable: pass. | `3b15d9f` |
| Poort | Spiegelvoet 0,7 mm naar buiten (zwaai vond 0,11 mm tegen de rubberlijn). | `26cc75e` |
| Gebruiker | "Maak de ruit lichter, zoals op de foto": buitendekking voorruit 0,50 (was 0,80), luchtreflectie 0,9; helderheid midden ruit 93 tegen 90 op de foto. | `56cfdac` |

Uitslag: exterieurtoets 9 van 9 (GPU-beelden, kenmerk 4 volgens B7); clash 85 naar 75 doordringende paren, 0 nieuw; zie CHANGELOG versie 14 voor de sets en de zwaai. Open voor later: langere overgang van de A-stijlvoet (bodAPL), spiegelhuis als slanke druppel, losse zwarte balk boven het kenteken, lichte rechthoek rond het kenteken achter, overbelichte motorkap (belichting, apart besluit). De wijzigingen in `body.js` en `interior.js` (alleen-lezen voor de carrosserie) zijn door de orkestrator goedgekeurd.

## Golf 5i: ruiten en motorruimte naar foto (versie 15)

Verzoek van de gebruiker op 19 oktober 2026: de overige ruiten in de tint van de voorruit, en de motorruimte natuurgetrouw naar een foto van een Laguna III 2.0T (de afdekkap ontbrak in feite: hij was een kleine donkere plaat). Later in de golf: de olievuldop op de plek van de foto, en de afdekkap bij uitklappen als los onderdeel.

Besluiten vooraf (zie `docs/onderzoek/beslissingen.md`, golf 5i): T4 naar 385 kB gzip, opschrift als textuur, advisor Opus 5.5 high, publiceren als versie 15 na een groene poort.

Gedaan:
- Ruiten: zijruiten, kwartsruiten en achterruit met de tint en dekking van de voorruit (`MAT.bodGlassSide`); panoramadak ongewijzigd.
- Afdekkap (`src/engine3.js`, `engCoverShell` en `engCoverTop`): hoogteveld over een afgeronde rechthoek met rok, gaten en kommen; eindigt rechts in de auto (distributiezijde) 8 mm voor de motorsteun distributiezijde en blijft boven de dynamo; voor diep omlaag over de inlaatkanalen; 2,5 cm onder de buitenhuid van de motorkap (`integrity.py`).
- Olievuldop midden op het kleppendeksel (`ENG_OIL`), vulhals 2 cm boven de bodem van de kom; middelste ribbe van het deksel ingekort.
- Peilstokgreep 4,2 cm hoger in een kom.
- Ruitensproeiertank rechtsvoor met gele dop; kapslang naar rechts, achter motorsteun en vuldop langs.
- Accubak zwart; zwarte voorrand van de torpedoplaat.
- Bij uitklappen komt de afdekkap als één geheel recht omhoog los (`ex` 0; 1,05; 0), het opschrift blijft op de kap.

Rondes (UTC 19 oktober 2026): ronde 1 (`954e5b6` tot `50d1c14`, 18:47 tot 18:49) met advisor (Opus 5.5 high) bijsturen op tien punten; ronde 2 (`cba7364`, 19:07): opschrift volgt de vorm van de kap (`engLogoGeo`) en schaalt mee met het lettertype, vervangende materialen houden textuur en uitsnede (`uiCut` in `src/app1.js`, generiek), geen omgeklapte driehoeken en een kraag langs de gaten, links en rechts in autotermen, kapslang klapt naar rechts uit, schuimlaag tegen de kap. Advisor ronde 2: pass.

Uitslag: S7 8 van 9 bij alle drie de beoordelaars (kenmerk 8 deels; alle ruiten lezen als autoglas in één tint); clash tegen B0 0 nieuwe of diepere paren; zwaai (Motorkap, Olievuldop, Dop expansievat, 65 standen, h 4 mm) ECHT 0; volledige set op de Mac groen behalve visdiff tegen de Linux-basislijn (platformverschil), itest 232 van 232; Linux zie CHANGELOG versie 15. Cijfers: [cijfers.md](cijfers.md).

Open voor later:
- Bij isoleren vervaagt het opschrift niet mee (`uiFadeFrom` zet `uiFadeMat` direct; advisor ronde 2).
- De rubber nokken raken de kap niet meer, terwijl hun tekst zegt dat de kap erop klemt.
- S7-meldingen: achterstuk onder de achterlichten leest als blok (kenmerk 8), zwarte balk boven het voorkenteken, bolle motorkap van voren, blokkige spiegels, lijst om het kwartsruitje dubbel.
- `uiCut` naar espace5 met `framework.py export`.

## Golf 5j: motorruimte naar de echte auto, draaidop en peilstok, exterieurpunten (versie 16)

Verzoek van de gebruiker op 19 oktober 2026: de open punten van versie 15, plus de motorruimte naar de echte auto. Het ging om de zwarte radiateurplaat, het expansievat vóór de rechter veerpoottoren, de accu voor en het luchtfilter achter (links), de koelventilator zichtbaar, een airco-leiding over het stuuroliereservoir, een peilstok die bij openen uit de buis floept, en de olievuldop als draaidop die op de afdekkap gaat liggen. Fotoonderzoek (forumlaguna3 t8080 en t3529, Autoweek, gebruikershandleiding) bevestigde de indeling; de gebruiker koos daarna "doorvoeren" voor accu en luchtfilter.

Werkwijze: drie takken naast elkaar.
- `golf-5j`, de orkestrator: draaidop, peilstok, vervagen van het opschrift en de opentest-fix.
- `golf-5j-sys`, systemen: motorruimte en stuuroliereservoir.
- `golf-5j-body`, carrosserie: de S7-punten.

Elke tak is apart gemeten met clash tegen B0 (`c0cb022`) en de zwaai.

Gedaan:
- **Motorruimte:**
  - accu linksvoor onder een zwarte kap, met rode pluskabel en de ECU op de accubak; zekeringkast en luchtfilterhuis linksachter;
  - zichtbare geribbelde aanzuigslang vanaf het deksel;
  - expansievat vóór de rechter veerpoottoren, met de airco-vloeistofleiding (rubber stuk) over de dop van het stuuroliereservoir;
  - zwarte radiateurafdekplaat met sleuf voor de slotbeugel;
  - koelventilator achter de radiateur, vrij uitklappend.
- **Olievuldop:** draaidop (`slide` met het nieuwe `tilt.rise`). Hij draait een en een kwart slag los, gaat 5 cm omhoog en ligt dan plat op het voorvlak van de afdekkap tussen vulgat en peilstok. De peilstok floept 15 cm omhoog langs de buisas; het uiteinde blijft in de buis.
- **Opschrift:** vervaagt mee bij isoleren (`uiFadeCuts`, alphaTest schaalt mee).
- **Carrosserie (S7):**
  - ronde achterheup en lagere bumpernaad;
  - smalle bovengrille en schoon voorkenteken (parkeersensoren naast de plaat);
  - gladde, iets lagere motorkap (parabool in de hoogte, `bodHoodDP` weg);
  - druppelspiegels en één lijst om het kwartsruitje;
  - een sluitvlak in de achterbumperhoek.
- **Tests:**
  - `tools/opentest.py`: stralen met de nodige openers open (needs);
  - keerringen van de aandrijfassen uit het ingesloten Differentieel (ui_inner);
  - budget Koeling en luchtinlaat 30.000.

Rondes (UTC 19 en 20 oktober):
- **Ronde 1:** agents en orkestrator. Advisor (Opus 5.5 high): bijsturen op 9 punten (vervagen, airco-leiding naast het reservoir, golf in de kap, kenteken, docs, commentaren, aanzuigslang laag). Volle zwaai: ECHT 1, de Bagageruimtevloer in de Bumperbalk achter.
- **Ronde 2:** alle punten opgelost, advisor pass.
- **Poort:** `ui_inner` vond twee bestaande spleten, bloot gelegd door een verschoven stralenraster (achterbumperhoek en keerring); daarna opgelost.

S7 op GPU-beelden: ronde 1 9, 9 en 8; ronde 2 9, 9 en 8 van 9.

Open voor later:
- vouwen op de motorkap van de koplamppunten naar de voorruit (de kap kan pas lager als de motorruimte verandert);
- zwart vlak achter het voorkenteken (kenmerk 6);
- chroomlijn op de bovengrille;
- dubbele zijlijsten (kenmerk 10);
- een vlekkerige bumperrand achter;
- rood onderdeel zichtbaar in de voorste wielboog;
- de aanzuigslang loopt pas vanaf het deksel hoog;
- `uiCut` en `tilt.rise` naar espace5 met `framework.py export`.

## Golf 5k: exterieurpunten uit S7 van versie 16 (versie 17)

Open punten uit golf 5j: vouwlijnen op de motorkap, kenteken op een zwart vlak (kenmerk 6), gaas in de onderste inlaat, chroomlijn op de bovengrille, een vlekkerige achterbumperrand, en het rode onderdeel in de voorste wielboog (de pluskabel van de accu). Niet gedaan: dubbele zijlijsten (besluit: een sierlijst per portier) en een lagere kap.

Gedaan, door de carrosserieagent (`golf-5k-body`):
- vouwlijnen als scherpe trede van 9 mm over 1,6 cm, in een fijner net van 46 rijen; de kap is nergens hoger;
- zwart trapezium achter het voorkenteken, aansluitend op de inlaat; de middelste parkeersensoren naast het vlak;
- ruitgaas van schuine staven met vaste normalen, zonder naad op de hartlijn;
- chroomlijn met zwarte rubberlijn onder de sleuf;
- bumperschalen, onderschort en Achterscherm rechts met `bodCreaseWeld` (lassen op positie, knikken blijven); oorzaak van de vlekken was `bodWeld`, dat op positie en normaal laste;
- voorste wielkuipscherm met staande binnenrand, zodat de motorruimte niet door de wielkast te zien is.

T4 naar 395 kB (pagina 385.770 bytes gzip).

Rondes (UTC 20 oktober):
- **Ronde 1:** advisor (Opus 5.5 high) bijsturen. Reden 1: het nieuwe onderdeel stond niet in de boom en de onderdeelnummers. Verder een streep onder de koplamphoek en commentaar.
- **Ronde 2:** advisor pass.

S7 op ronde 1: 9, 9 en 9 van 9, kenmerk 6 bij alle drie ja.

Open voor later:
- twee zwarte wiggen op de chromen onderrand van de inlaat (al in B0);
- de lichte vlek van de tankklep boven de achterwielboog (systemen);
- de vage omtrek van het sluitvlak boven het achterkenteken;
- de staart in bovenaanzicht wat stomp (kenmerk 8, een beoordelaar);
- de Renault-ruit op de neus (kenmerk 5, buiten de telling).

## Golf 5l: cockpit en interieur (versie 18)

Verzoek van de gebruiker: in de auto kunnen zitten en rondkijken vanaf elke zitplaats, en het interieur naar de echte auto (Initiale Paris, leder Dark Carbon, Carminat TomTom, panoramadak). Besluiten: zie `docs/onderzoek/beslissingen.md`, golf 5l.

Gedaan, in vijf takken naast elkaar:
- **app** (`golf-5l-app`): derde modus Cockpit naast Uitklappen en Openen, met keuze van de zitplaats, Uitstappen, rondkijken en beperkt vooroverbuigen (0,15 m) en achteroverleunen (0,05 m). Een klik opent een opener en toont de kaart. Daarnaast een buitenwereld (lucht en grond) en een lichtstand in de cockpit; openers gaan dicht bij uitstappen. Het gezichtsveld op een staande telefoon is begrensd op 95°. `?cockpit=` in de URL, testhaken `setCockpit`, `cockpit`, `lookAt`, `cockpitSeats`. Instellingen in `auto.json` (`cockpit`) en `CFG.cockpit`. De lichte weergave zet de clearcoat van alle lakmaterialen uit.
- **dashboard** (`golf-5l-dash`): stuur, instrumenten (snelheidsmeter 10, 30 tot 270 zoals op de foto van de gebruiker), roosters, middenpaneel met Carminat TomTom, console, onderdashboard, sierband pianozwart.
- **carrosserie** (`golf-5l-body`): portierkaarten tot de raamschacht, zijruiten en panoramadak van binnen, geen lak meer zichtbaar in de cockpit rond ruiten, B-stijl, portieren en achterklep; derde remlicht van binnen zwart; zonneschermen zonder lichte naden.
- **route** (`golf-5l-route`): kabelboom in de cabine, remleidingen achter uit de voetruimtes.
- **cabine** (`golf-5l-cab`): Dark Carbon leer (0x141518, geperforeerd 0x101114) en dashboard (0x1f2124) met minder omgevingsreflectie, hemel tot het raamrubber, brede stijlbekleding, gevormde stoelen en gordels, bekleding van de bagageruimte, een lip aan de C-stijlbekleding over de gasveer, verzonken scharnierpennen van de hoedenplank, nerf die blijft bij aanwijzen.

Rondes (20 oktober, lokale tijd):
- **Ronde 1** (12:27 tot 13:29): vijf takken samengevoegd; voetwand passagier dicht, T4 naar 1,6 MB raw en 430 kB gzip, budget Carrosserie 200.000.
- **Ronde 2** (13:48 tot 14:57): buitenwereld en lichtstand, lak uit de cockpit, A-stijl, bagageruimte. Advisor (Fable 5.1 xhigh) bijsturen op twaalf punten, interieur 7 van 10.
- **Ronde 3** (16:04 tot 16:14): alle twaalf punten; advisor pass, interieur 8 (voor) en 7 (achter). Dashboard op circa sRGB 55 volgens de advisor goed genoeg voor Dark Carbon.

Poort op `b7ea1b8`: zwaai van alle openers tegen `main` ECHT 0; Mac en Linux alles groen op visdiff na (itest 286 van 286); visdiff 42 van 42 na de vernieuwde basislijn (`de023ae`, 19 beelden inhoudelijk: interieur, cockpitknop, onderdeeltellingen). Cijfers: `docs/cijfers.md`.

Open voor later:
- rugschaal en kaartvak van de voorstoelen vanaf de achterbank vlak zwart (sRGB 7 tot 10); optie intTrimDark;
- kleine donkere punt aan de voorkant van de lip bij z -1,30 (`stY[0]` als sentinel 9);
- achterlichtlens schemert rood tussen sponning en klepbekleding bij achteroverleunen vanaf achter links;
- middelste gordelband vult het beeld bij omkijken vanaf achter midden;
- cockpit naar espace5 met `framework.py export`;
- open punten uit golf 5k blijven staan.

## Golf 5m: paneel slepen, Openen in de cockpit, onderdeelnummers (versie 19)

Verzoeken van de gebruiker:
- het streepje boven het paneel op de telefoon zag eruit als een sleepgreep, maar slepen werkte niet;
- in de cockpit op Openen tikken mag de cockpit niet verlaten, met een knop terug naar het standaardaanzicht;
- de echte artikelnummers per onderdeel, gezocht met het kenteken in Autodoc en met het werkplaatshandboek.

Gedaan:
- **app** (`golf-5m-app`):
  - **Paneel:** het paneel volgt de vinger vanaf de greep en, in peek, vanaf de kop. Er zijn drie standen: peek, open en vol. Een snelle veeg beslist op richting, een tik wisselt zoals voorheen.
  - **Cockpit:** Openen laat je zitten, en Uitstappen heet dan "Naar buiten" in de accentkleur. De toets O laat je ook zitten. Itest-controles 23 en 24.
- **nummers** (`golf-5m-pn`):
  - **Type en bronnen:** het kenteken in Autodoc bevestigt TecDoc-type 23370. Het werkplaatshandboek MR 415 bevat ongeveer 40 nummers, vooral producten.
  - **Zes plakken, met deze besluiten van de gebruiker:**
    - alleen los verkrijgbare onderdelen;
    - het Renault-nummer plus hooguit één merknummer;
    - bewijs D alleen bij `vin`;
    - de headless-route van een plak is toegestaan en vastgelegd.
  - **Bijsturen na Fable:** Fable 5.1 xhigh bracht de bronnen naar Spareto (curl), Exa en de OEM-pagina's.
  - **Verificatie:** een verifieerder (Opus 5.5 high) controleerde 153 nummers met 18 lokvogels ertussen. Alle lokvogels zijn afgewezen; 20 foute of onzekere nummers zijn geschrapt.
  - **Advisor:** Opus 5.5 high gaf ronde 1 "bijsturen". De oliezeef was op een aanname aan het ATF-pakket gekoppeld; die koppeling en het pakket zijn eruit. Ronde 2 gaf pass.
  - **Ophaalwijze:** staat in `docs/onderzoek/databankenrecht.md`, paragraaf 12.

Dekking per pad, van versie 18 naar versie 19:

| Status | Versie 18 | Versie 19 |
|---|---|---|
| Past | 381 | 618 |
| Kies op VIN | 295 | 464 |
| Niet onderzocht | 1.525 | 886 |

T4 naar 1,7 MB raw en 450 kB gzip (pagina 1.624.930 bytes raw, 439.698 bytes gzip); besluit van de gebruiker.

Van de gedaalde "niet onderzocht" zijn er ongeveer 280 nu "onderzocht, niet los gevonden": ze hangen als `deel` aan een samenstel zonder nummer, zoals de complete automaat.

Poort op `6d2810c`:
- Linux alles groen: itest 319 van 319, visdiff 42 van 42.
- Mac alles groen behalve visdiff, dat de Mac niet meet tegen de Linux-basislijn.
- Er is geen geometrie veranderd, dus geen zwaaimeting.

Open voor later:
- `#openSeg` met twee radio's tegelijk op `aria-checked`;
- "Naar buiten" is niet te zien als het paneel open staat in de cockpit;
- slepen met de muis zonder pointer capture;
- distributiekappen als `set` met een zwakke grond;
- 21 eenheden met meer Renault-nummers (varianten of opvolgers), toegestaan tenzij de gebruiker anders beslist;
- de Renault-catalogus op VIN (partsouq) voor de varianten, uitgesteld door de gebruiker;
- interieur, uitlaat, koeling en elektra blijven dun, omdat ze in de catalogi nauwelijks voor dit type staan.

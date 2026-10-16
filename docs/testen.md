# Testen

Alle tests draaien in headless Chromium via Playwright (Python), met WebGL via SwiftShader (software-rendering). Elk script bouwt `src/` naar een tijdelijke testmap, start een kleine lokale webserver op die map en opent de pagina op 1280 × 800 (muis) en, waar nodig, op 390 × 844 (touch, schaal 2). Elk script geeft exitcode 0 bij slagen en 1 bij een fout.

## Voorbereiding

```bash
tools/setup.sh                 # Playwright uit requirements.txt, three.js 0.147.0 in de cache (met hashcontrole), Chromium
python3 tools/smoke.py
```

`tools/harness.py` regelt de rest: hij bouwt de testmap met een symlink `three/` naar het npm-pakket en start Chromium. Het ophalen van three.js vraagt `npm` en een netwerkverbinding; het pakket wordt vergeleken met de npm-integriteit (`THREE_INTEGRITY` in de harness) en een bestandsvergrendeling voorkomt dat twee reeksen tegelijk `npm pack` draaien. De versie staat op één plek: `THREE_VERSION` in `build.py`. Een SessionStart-hook (`.claude/hooks/session-start.sh`) draait `tools/setup.sh` in een Claude Code-sessie in de cloud. Instellingen:

| Omgevingsvariabele | Werking |
|---|---|
| `THREE_DIR` | Map met het uitgepakte npm-pakket `three@0.147.0` (de map `package`). Standaard `~/.cache/laguna/three-0.147.0/package`; ontbreekt die, dan draait het script `npm pack three@0.147.0` en pakt het uit. |
| `CHROMIUM` | Pad naar een Chromium-binary. Standaard `/opt/pw-browsers/chromium` als die bestaat, anders de Chromium van Playwright (`playwright install chromium`). |
| `LAGUNA_TEST` | Een bestaande testmap hergebruiken in plaats van opnieuw te bouwen. Zonder deze variabele ruimt de harness zijn tijdelijke testmap bij het sluiten op. |
| `LAGUNA_TIMEOUT_MS` | Wachttijd op laden en `ready`, standaard 120000. Op een belaste machine of in CI hoger zetten. |
| `PUBSMOKE_READY_MS` | Grens voor `ready` in `pubsmoke.py`, standaard 20000 (de grens uit de premortem). |

Chromium start met `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. De harness zet `window.__LAGUNA_CACHECHECK = true`, zodat een botsing van cache-sleutels in `core.js` als consolefout verschijnt. Een script faalt bij elke console-fout of -waarschuwing (`harness.errors()` geeft beide), behalve de regels in `IGNORE` in `tools/harness.py`; die lijst is een contract met per regel een reden en datum, en alleen de orkestrator wijzigt hem.

`harness.page()` neemt een `query` (bijvoorbeeld `'?preset=engine'`) voor de deelbare stand en de debug-overlay. De pagina zet `window.__laguna` met hulpfuncties voor tests, waaronder `version` (het versiestempel), `finishAll()` om animaties direct af te ronden, `state()`, `preset(id)`, `checkPresets()`, `pickNodeAt(x, y)`, `hoverTarget(x, y)`, `setExplode(v)`, `labelRects()`, `freeView()`, `profileFrames(naam, aantal)`, `timing()` (de opstarttijdlijn in milliseconden sinds het begin van de navigatie), `batchFlush()` (alle wachtende batches direct bouwen) en `batchStats()`. Een eigen `THREE.Raycaster` in een testscript moet `ray.layers.enableAll()` aanzetten: gebundeld renderen zet de losse meshes van gesloten groepen op laag 1, en een raycaster die alleen laag 0 ziet, mist ze (`integrity.py`, `silhouette.py` en `ui_inner.py` doen dit). De oude functies blijven werken; nieuwe haken komen erbij.

Het gebruikte bestand is de testversie (`python3 build.py --test-only MAP`): die laadt three.js lokaal. De gepubliceerde `index.html` laadt het van jsDelivr en wordt door `pubsmoke.py` apart getoetst.

## CI op GitHub

`.github/workflows/ci.yml` draait bij elke push en PR de snelle set (lint, `index.html` hoort bij `src/`, smoke, integrity, silhouette, `tri.py --gate`, de testlijst van `finaltests.sh`), richting 5 tot 10 minuten; `nightly.yml` draait elke nacht en op aanvraag de lange set (itest met poorten, `opentest --strikt-min`, `ui_inner --open --strict`, pubsmoke, stats en cijfers), met ruimere wachttijden (`LAGUNA_TIMEOUT_MS` 600 s, `PUBSMOKE_READY_MS` 60 s) en de uitvoer als artefact. Een rode push-job stopt het werk tot hij groen is; een rode nachtrun is een melding. SwiftShader op een gedeelde runner is trager dan de container; de eerste runs zijn een proef van de tijdgrenzen.

## Scripts

### `python3 build.py --lint`

Sinds golf 5c-1 gaat ook elk inline script in `src/head.html` (de foutafhandeling vóór de scripttags) apart door `node --check`.

Controleert zonder iets te schrijven: dubbele functienamen op het hoogste niveau over alle bestanden in `ORDER`, dubbele materiaalnamen in `std()` en `phys()`, en de syntaxis van het samengevoegde script met `node --check`. Een fout wordt teruggerekend naar bestand en regel. Exitcode 1 bij een fout, anders `lint ok`. Cache-sleutels met een voorvoegsel worden hier niet gecontroleerd en de lint is daarvoor niet uitgebreid; botsingen vangt de testmodus van `cache()`.

### `python3 tools/smoke.py`

Rooktest. Laadt de pagina op desktop en telefoonformaat en meldt het aantal knopen, groepen, onderdelen, de maximale diepte, het aantal meshes en driehoeken, daarna één render van de gemonteerde auto (tijd, tekenopdrachten, driehoeken, geometrieën) en één van de volledig uitgeklapte auto, en of de telefoon horizontaal scrollt. Exitcode 1 bij console- of paginafouten.

### `python3 tools/integrity.py`

Integriteit van de boom. Exitcode 1 bij een fout, een ankerfout, een presetfout of een consolefout; waarschuwingen worden alleen gemeld (`WARN=999` toont ze allemaal).

Fouten:

- een knoop zonder naam, een groep zonder kinderen, een onderdeel zonder geometrie, NaN in de geometrie, een ongeldige omhullende, een ongeldige uitklapvector;
- een onderdeel buiten de omhullende van de auto (|x| ≤ 1,15, y van −0,08 tot 1,62, |z| ≤ 2,48);
- carrosserie buiten ZR tot ZF (6 mm marge voor kentekenplaten); carrosserie breder dan 0,915 (zonder spiegels) of 1,035 (met spiegels); een niet-carrosserie-onderdeel breder dan 1,035. Dit zijn de nieuwe lengte- en breedtegrenzen uit audit C08;
- een onderdeel buiten de carrosserie dat boven de carrosserie uitsteekt, gemeten met een straal van boven op het hoogste punt (meer dan 4 mm);
- te weinig ruimte onder de motorkap, met twee regels: minder dan 2,5 cm tussen het hoogste punt van een onderdeel en de buitenhuid van de kap, en minder dan 0,5 cm tussen dat punt en de laagste laag van de motorkap (binnenframe of isolatiemat);
- een onderdeel dat zijdelings meer dan 2 mm door de huid steekt, onder de schouderlijn en boven de onderkant (uitzonderingen: banden, velgen, wielbouten, naafdoppen, ventielen, banden-spanningssensoren, balansgewichten, tankklep en -dop, uitlaateindstukken);
- ankers: elke naam uit `tools/anchors.json` komt precies één keer voor; de acht kinderen van de wortel staan in de afgesproken volgorde; `Onderstel` heeft precies de vier afgesproken kinderen; de `contains`-paren hangen goed; de `content`-regels halen hun minimum; de 26 openers (`openers`, als pad, want namen als Zijruit komen vier keer voor) en de 43 preset-id's (`preset_ids`) zijn precies die van de pagina, zodat een verdwenen of hernoemde opener of preset een fout is;
- presets (via `checkPresets()`): elke naam bestaat precies één keer, `open`, `deep`, `select` en `labels` liggen onder de `iso`-groep (bevatting), elke `labelOnly`-naam is een kind van de labelgroep, id's, sneltoetsen en categorieën kloppen en de rondleiding noemt bestaande presets.

Waarschuwingen: korte of ontbrekende beschrijving, groep met één onderdeel, dubbele naam binnen een groep, een dubbel onderdeel op dezelfde plek, een uitklapvector van nul.

### `python3 tools/silhouette.py`

Meet de gemonteerde carrosserie met stralen en vergelijkt met het gemeten fase 2-silhouet: de bovenlijn op 20 stations in het zijaanzicht, de halve breedte op 17 stations in het bovenaanzicht en de raamlijn op 9 stations. De tolerantie is 0,03 m tussen de assen en 0,05 m in de overhang. De toets slaagt als hoogstens 2 stations per reeks buiten de tolerantie vallen en de halve breedte bij z = +2,30 hoogstens 0,40 is en bij z = −2,30 hoogstens 0,55. Spiegels, antenne, wissers en grepen tellen niet mee. Exitcode 1 als de toets niet slaagt.

### `python3 tools/itest.py`

Interactietest op desktop (muis) en telefoon (touch). Per controle een regel `ok` of `FOUT`, onderaan een samenvatting. Exitcode 1 bij een mislukte controle.

| Nr | Controle |
|---|---|
| 1 | Klik of tik vanuit Gemonteerd op Motorkap, Portier linksvoor, Wiel linksvoor en Koplamp links beweegt niets buiten de eigen subboom (meer dan 1 mm) en opent die groep. Een dubbeltik met 250 ms tussenpoos kiest het onderdeel van de eerste tik. 40 willekeurige klikken (vaste seed) doen precies wat `hoverTarget` aankondigt. |
| 2 | Dubbelklik op het diepste aanklikbare onderdeel opent al zijn voorouders en selecteert het. Zoeken naar "klepspie" in de boom ook. |
| 3 | Inklappen met rechtsklik, Shift+klik en lang drukken (touch) sluit de diepste open groep met zijn deelboom. |
| 4 | Gemonteerd zet elke knoop terug op zijn basispositie (afwijking onder 1e-6 m). |
| 5 | Stap terug na uitklappen, inklappen, preset en schuif herstelt de vorige `state()`. |
| 6 | De explosieschuif op 0, 1 en 0,5 voor de werkgroep. |
| 7 | Elke preset: `checkPresets()` is leeg, het onderwerp ligt binnen het vrije beeld en beslaat minstens 12 % ervan. |
| 8 | Labels overlappen niet, niet over de bediening en niet buiten het canvas, in zes standen. |
| 9 | Elke preset is bereikbaar met categorie plus item; de sneltoetsen 0 tot 9 werken. |
| 10 | Geen console-fouten of -waarschuwingen; geen horizontale scroll op de telefoon; de donkere modus geeft de verwachte achtergrond. |
| 11 | Informatie: tekenopdrachten in Gemonteerd en `profileFrames('Motor F4Rt', 120)` (p50, p95, max). Met `ITEST_GATES=1` worden dit controles: tekenopdrachten hoogstens 1.500 en p95 hoogstens 8 ms. |
| 12 | `inner`: een ingesloten knop is onzichtbaar en niet aanklikbaar zolang de ouder dicht is, zichtbaar zodra die uitklapt, weer verborgen na inklappen en zichtbaar bij isoleren. 12b: een opgetild onderdeel zakt terug bij `setExplode(0)`. |
| 13 | Gebundeld renderen: minder tekenopdrachten in Gemonteerd (op de eindstand 1.726 zonder en 390 met bundelen, grens 1.500 met), aanwijzen van een onderdeel in een gebundelde groep, een klik selecteert dat onderdeel en laat zijn groep los tekenen, openen maakt direct los en na het dichtklappen is de groep weer samengevoegd. |
| 14 | Openmodus: in Openen opent een klik op de ruit, de spiegel, de greep of het paneel van een dicht portier het portier; een dubbeltik doet hetzelfde als een klik; de camera-eindstand ligt in het vrije beeld; Alles open en Alles dicht; stap terug na openen; de presets Openen. |
| 15 | Onderdeelnummers: de echte gegevens hebben geen onbekend pad of onbekende eenheid; daarna, met alleen tijdelijke records, de statussen, het bewijs, de bronlinks (alleen https, nieuw tabblad), de VIN-waarschuwing, het blok Gekozen voor deze auto met markering van de gekozen nummers, deel van een eenheid, zoeken op nummer en `pnCheck`. |
| 16 | Telefoon staand (390 × 844): de presetcategorieën staan in één zijwaarts schuivende rij (hoogte hoogstens 60 px) en elke categorie is bereikbaar; het vrije beeld is minstens 55 procent van de schermhoogte; na een keuze past het kader van de gekozen opener boven kaart en dock, gemeten aan de echte hoogtes. |
| 17 | Deelbare stand: `?preset=id` laadt die preset, `?open=naam,pad` opent die openers in de modus Openen, de adresbalk volgt preset en openstand (`replaceState`); `?debug=1` toont de overlay met tekensnelheid, tekenopdrachten en versie; `__laguna.version` is het versiestempel uit `build.py`. |
| 18 | Golf 5c-1, app (36 controles): foutpaden in een eigen context (`fault_page`: geen three.js, geen WebGL, een fout vóór en na `ready`, contextverlies en herstel met een nieuwe omgevingskaart) geven de melding met de versie; `uiLastFit` kadreert na een duik ook na draaien op het duikdoel; de rondleiding pauzeert, gaat terug en vooruit en pauzeert bij een verborgen tabblad; `integrity` en `crossorigin` op de scripttags; "+n meer" als labels wegvallen; fade en badge bij isoleren met Alles tonen; themaknop met geheugen in `localStorage`; toegankelijkheid (focusval en `inert` in het hulpvenster, menu-rollen, werkbalk met roving tabindex, focusrand op het canvas, schakelaarcontrast, tabs, live region alleen bij verandering, Esc sluit het mobiele paneel); hulpvenster uit `PRESETS`; zoeken met synoniemen en diakrieten; toast, suggestie en trilling; Beeld opslaan en de printstijl. Elke controle noemt de fout die hij gevangen zou hebben. |
| 19 | Toetsenbord (desktop, echte toetsaanslagen): Enter klapt de geselecteerde dichte groep uit en kiest haar, nog eens Enter de groep erboven (de selectie klimt mee), Shift+Enter klapt in; Enter op een onderdeel klapt zijn dichte groep uit en tilt het uit als alles open staat, Shift+Enter laat het zakken en klapt zijn groep in; Escape kiest de wortel en laat een uitgetild onderdeel zakken; `?` opent de uitleg met de focus op Sluiten, sneltoetsen erachter doen niets, Escape sluit en zet de focus terug; `/` zet de cursor in het zoekveld en typen gaat naar het veld (de o van "motorkap" wisselt de modus niet); pijltjes lopen door de boom (ouder, kind, buur) zonder iets uit te klappen en tellen in de historie; pijltjes op de modusknoppen en op de segmentknop wisselen de modus; Enter en Shift+Enter in Openen werken op de geselecteerde opener; het presetmenu met pijl omlaag, End, Home, Enter en Escape. Zou audit U29 (het model was niet met het toetsenbord te bedienen) gevangen hebben; dekt de toets `/` (U17) en Enter op een opener (golf 4). |
| 20 | Formaat wisselen in een desktopcontext: 1280 × 800 naar 390 × 844 (lade), terug, 844 × 390 (zijkolom), 1024 × 768 (kolom) en terug. Na elke wissel: de juiste indeling, geen horizontale scroll, labels zonder overlap binnen het vrije beeld, het kader van de selectie binnen het vrije beeld met minstens 12 procent dekking, geen nieuwe consolemelding. Zou bevinding I1 uit golf 2 (korte en liggende schermen zonder bruikbaar vrij beeld) en de bovenbalk op lage liggende schermen gevangen hebben. Het herkadreren na een duik (R3) toetst de app-agent zelf. |
| 21 | Stap terug tot 50 stappen: 55 pijltjesstappen geven een historie van 50, 50 keer Backspace geeft de stand van na stap 5, een 51e doet niets en de knop is uitgeschakeld. Reduced motion: met `emulate_media(reduced_motion='reduce')` en opnieuw laden staat `REDUCED`, de paneelovergang is uit, een uitklap staat na een tik in de eindstand en een preset staat direct in beeld zonder `finishAll()`; op de gewone pagina staat de uitklap na een tik nog aan het begin. Zou de bevindingen I5 en I6 (de stand volgde stap terug niet) over de volle diepte gevangen hebben; `REDUCED` bestond sinds golf 1 zonder controle. |
| 22 | Zoeken: "KLEPSPIE" en "klepspie" geven dezelfde treffers; "klépspie" vindt klepspie, "solenoide" vindt Solenoïde en "vacuum" vindt Vacuüm (de normalisatie op kleine letters en zonder accenten in `app1.js` en `app2.js`). Audit U17; beschermt het zoeken terwijl U10 het uitbreidt met synoniemen. |

Twee eigenschappen van de testbrowser (headless Chromium met SwiftShader) waar controle 18 rekening mee houdt: `requestAnimationFrame` tikt niet zolang er niets te tekenen is (0 frames per 500 ms in rust), dus animaties lopen in een test alleen via `finishAll()` of door `uiTick` zelf aan te roepen; en `page.click` duurt door de stabiliteitswacht seconden, zodat een rondleiding van 5 s per stap tijdens een test vanzelf doorloopt (de controle pauzeert hem eerst). De foutpaden draaien buiten de logregistratie van de harness (`fault_page`), omdat de melding zelf een consolefout is. Bij R5 (golf 5c-1) zijn in controle 15 twee verwachte `rel`-waarden aangescherpt van `noopener` naar `noopener noreferrer` (`UI_LINK_REL` in `src/app2.js`).

`ITEST_SHOTS=MAP` bewaart screenshots van de stappen. `ITEST_GATES=1` zet controle 11 als poort aan; zonder die variabele blijft 11 alleen informatie. De controles voor gebundeld renderen (nummer 13) staan in `tools/itest.py`. Het script telde voor golf 4 79 controles over desktop en telefoon samen (alle 79 slaagden op `9c731c8`). Op de stand van golf 5c-1 zijn het er 218: 161 tot en met controle 17, 36 in controle 18 en 21 in de controles 19 tot 22.js` bestaat); zie de resultaten van golf 4 hieronder. Omdat gebundeld renderen losse meshes naar laag 1 verplaatst, zetten alle raycasters in de tools alle lagen aan.

### `python3 tools/opentest.py [--only namen] [--out map] [--strikt-min]`

Toetst elke opener van de modus Openen (26 stuks). `--only` beperkt de run tot de genoemde openers, `--out` bewaart de uitvoer in een map. Met `--strikt-min` (zo draait `finaltests.sh` hem) is een leider zonder `open.min` een fout, en ook een `min` onder 0,8 maal de volle hoek of slag: zo kan een agent een opener niet eerst kleiner maken en dan de ondergrens meenemen. Een volger zonder eigen `min` blijft een melding. Per opener zes controles:

| Nr | Controle |
|---|---|
| 1 | Eindstand: de gemeten hoek of slag uit de eigen meshes haalt de waarde van de opener. |
| 2 | Ondergrens: de eindstand haalt `open.min`, en `open.min` is minstens 0,8 maal de volle hoek of slag. Een volger zonder `min` geeft een melding; een leider zonder `min` of met een te lage `min` is met `--strikt-min` een fout. |
| 3 | Botsing: 400 monsterpunten van het bewegende deel in 16 stappen tegen alle niet-bewegende meshes. Het telt als botsing bij meer dan 5 mm doordringing die nieuw is ten opzichte van de gesloten stand. Contactparen die bij u = 0 al bestaan worden genegeerd. Uitzonderingen staan in `tools/open_allow.json` (9 regels, elk met reden). |
| 4 | Blootleggen: een raster van 160 x 100 stralen vanuit de camera van `look`. Toegestaan zijn 0 treffers op verborgen knopen en hoogstens 2 procent stralen die door de opening in het niets verdwijnen. |
| 5 | Prestaties met alle openers open: tekenopdrachten tegen 3.000, frametijd p95 bij `openAll(1)` en `openAll(0)` tegen 8 ms. |
| 6 | Spookbatchproef: de batchopbouw wordt onderbroken door een opener; daarna worden alle getoonde batches vergeleken met een verse opbouw. |

De uitzonderingen in `tools/open_allow.json` zijn contacten die bij de echte auto bestaan. Ze zijn voor domeineigenaars alleen-lezen. Voorbeelden: de slotbeugel van de motorkap die in het motorkapslot grijpt, en de raamsleuf, de ruitgeleiders en het portierrubber waar het glas van een zijruit doorheen zakt.

### `python3 tools/pubsmoke.py`

Publicatierooktest. Zet de CDN-versie zoals `build.py` hem in `index.html` schrijft in hetzelfde HTML-geraamte als de artefacthost (zonder eigen doctype en met een eigen viewport-regel), laadt hem in Chromium en beantwoordt de verzoeken naar `cdn.jsdelivr.net/npm/three@0.147.0/` uit het lokale pakket. Controleert:

- geen console- of paginafouten, `__laguna` klaar binnen 20 s, `THREE.REVISION` is 147;
- het canvas heeft `touch-action: none` en `user-select: none`, en `-webkit-touch-callout: none` staat in de stylesheet (lang drukken op iOS);
- geen horizontale scroll op 1280 × 800 en 390 × 844;
- via `curl` en de proxy: elk CDN-bestand bestaat en is byte voor byte gelijk aan het lokale pakket, en de stylesheet van Google Fonts is bereikbaar.

Na publicatie moet de inhoud van de gepubliceerde URL gelijk zijn aan `index.html`. Dat controleert dit script niet. De orkestrator leest de URL terug en zoekt `index.html` byte voor byte in de teruggelezen pagina: het bestand moet er precies één keer en aaneengesloten in staan, met alleen het paginaskelet van de host eromheen. De uitkomst staat in de tabel hieronder.

### `python3 tools/pncheck.py [--tree] [--update]`

Herbouwt `src/partnumbers.js` en `docs/onderdeelnummers.csv` uit `data/pn/` in het geheugen en vergelijkt byte voor byte met de gecommitte bestanden (zonder browser; in de push-job van CI). Met `--tree` vergelijkt hij ook `data/tree.json` met de boom van de pagina; `--tree --update` schrijft `data/tree.json` opnieuw. Exitcode 1 bij een verschil, een pad buiten de boom, een onbekende eenheid, een keuze met een nummer dat niet in de lijst staat, of een bron zonder https. De bouw stopt ook bij een bron-URL met `|` of een spatie (de CSV scheidt bronnen met `|`). De statistiek noemt sinds golf 5d ook `csv_rijen`, `bytes_csv`, `bronnen_uniek_in_csv`, `bronnen_met_page` (URL's met `?page=N`, nog 24) en `namen_met_schuine_streep`. Het schema van de CSV staat in `onderdeelnummers-schema.md`.

### `python3 tools/tri.py [--gate] [--json UIT.json]`

Telt driehoeken per hoofdgroep (met het aantal onderdelen per groep, zodat een zwaar deel dat van groep wisselt zichtbaar blijft) en toont de 25 zwaarste onderdelen. Met `--gate` faalt hij boven de budgetten in `tools/anchors.json` (`triangle_budgets`: 700.000 totaal, 240.000 Aandrijflijn, 190.000 Carrosserie, 125.000 Onderstel, 95.000 Interieur, en per systeem). De budgetten zijn alleen-lezen voor domeineigenaars; wijzigen alleen met een reden in `docs/onderzoek/beslissingen.md`. Zonder `--gate` is hij informatie.

### `python3 tools/visdiff.py BEELDMAP BASISMAP [--drempel 1.5] [--tolerantie 16] [--schaal 2] [--uit RAPPORT]`

Visuele regressie. Verkleint elke PNG in BEELDMAP (de uitvoer van `tools/orkestratie/presetshots.py`) met een vaste factor (standaard 2, Lanczos: 1280 × 800 wordt 640 × 400), vergelijkt hem met de gelijknamige PNG in BASISMAP (die al op die maat staat) en telt per beeld het aandeel pixels waarvan een kanaal meer dan de tolerantie (standaard 16 van 255) afwijkt. Boven de drempel (standaard 1,5 procent) is het beeld rood; dan komt er een verschilbeeld (basis, nieuw, afwijking in rood, op de verkleinde maat) in RAPPORT, naast `visdiff.json`. Een beeld dat in een van beide mappen ontbreekt of na het verkleinen een ander formaat heeft is ook rood. Een regel per beeld, onderaan een samenvatting; exitcode 1 bij een rood beeld.

De basislijn staat in `docs/baseline/`: de 42 presets zonder rondleiding, verkleind naar 640 × 400 en teruggebracht tot 256 kleuren (Pillow `quantize` met `MAXCOVERAGE`, dat de grootste kleurfout klein houdt, hier hoogstens 12 stappen per kanaal, en ongeveer de helft kleinere bestanden geeft dan de mediaansnede van `docshots.py`), samen 2.313.903 bytes (ongeveer 2,3 MB; op volle maat met de mediaansnede was het 9,4 MB). Ze is gemaakt met `python3 tools/visdiff.py --basislijn UITVOER_VAN_PRESETSHOTS docs/baseline`. Gemeten op `69cd0fd`: de basislijn tegen zichzelf 0,000 procent op alle 42 beelden; twee verse `presetshots`-reeksen op dezelfde stand tegen de basislijn 0,000 procent op alle 42 beelden bij de standaardtolerantie van 16 (bij tolerantie 12 hoogstens 0,038 procent, bij "Alles uit elkaar"), dus de ruisvloer van verkleinen en kwantiseren ligt ver onder de helft van de drempel. Alleen de orkestrator vernieuwt de basislijn, in een eigen commit met een voor/na-galerij (struikeldraad T8); een domeinagent die rood ziet, herstelt de weergave of legt in zijn rapport uit waarom het beeld moet veranderen.

### `python3 tools/anchorcheck.py [--json UIT.json] [--basis BASIS.json] [--only id,id]`

Labelankers per preset (zonder de rondleiding, 1280 × 800). Na `preset(id)` en `finishAll()` leest het script de geplaatste labels met hun ankerpunt (`uiSpots`, dezelfde lijst als `labelRects()`) en schiet door elk ankerpunt een straal vanuit de camera over de aanklikbare meshes (`uiPickList()`, dezelfde lijst als een klik). Twee maten per anker: eigen (op de straal ligt een treffer op het gelabelde onderdeel of een afstammeling binnen 1 cm van het ankerpunt, dus het anker zit op het eigen deel en niet in de lucht) en vrij (de eerste treffer op de straal is het gelabelde onderdeel, dus niets staat ervoor). Per preset en in totaal: labels, eigen, vrij, met de namen van de ankers achter een ander deel en in de lucht. `--json` bewaart de uitkomsten; `--basis` vergelijkt de twee totalen met een eerder bewaard bestand en is rood als een van beide daalt (de poort "geen van beide daalt"). Zonder `--basis` is het script informatie; consolefouten geven altijd exitcode 1. Op `69cd0fd`: 42 presets, 352 labels, eigen 319, vrije zichtlijn 267 (de meting van golf 3 in de sectie Labelankers hieronder was 261 van 345 op 36 presets, met de hand).

### `python3 tools/shot.py MAP 'JSON'`

Screenshots en `eval`-stappen per viewport. Voorbeeld:

```bash
python3 tools/shot.py /tmp/shots '[["desk",1280,800,["shot:gemonteerd","eval:__laguna.preset(\"main\"); __laguna.finishAll(); 1","wait:800","shot:hoofdgroepen"]]]'
```

Breder dan 700 pixels is desktop, smaller is touch. Stappen: `eval:`, `wait:`, `click:`, `shot:`. Een screenshot van een grote explosie heeft in software-rendering een lange time-out nodig (180 s is ingesteld). Geeft altijd 0; console-meldingen worden alleen getoond.

### `python3 tools/ui_inner.py`

Controleert in de gemonteerde stand vanuit ten minste 200 richtingen rond de hele auto en rond elke hoofdgroep afzonderlijk geïsoleerd of een `inner`-knop de eerste treffer van buitenaf is: dan zou het verbergen een gat in de auto laten. Dit script is nieuw in golf 2 en staat in de samengevoegde boom. Opties: `--strict` (exitcode 1 bij een zichtbare ingesloten knoop), `--json`, `--open` (zie hieronder) en `UI_INNER_DIRS` voor het aantal richtingen. Uitvoer op de eindstand (`9c731c8`): 253 ingesloten knopen in de boom, 200 richtingen per weergave, 39.200 stralen op de hele auto en 20.000 per hoofdgroep, 0 eerste treffers op een ingesloten onderdeel, dus 0 overtreders voor elke eigenaar. De opbergbak in de middenconsole is in de carrosserieronde niet meer als ingesloten gemarkeerd, omdat dit script er door de zijruit een treffer op vond; daarom zijn het 253 knopen en niet meer 256. Direct na de samenvoeging van golf 2 waren er 52 zichtbare ingesloten knopen (carrosserie, interieur, onderstel, systemen, aandrijving en motor); de herstelronde heeft ze opgelost.

### `python3 tools/ui_inner.py --open`

Dezelfde controle met alles open: welke ingesloten knopen worden zichtbaar als de openers open staan. Een knoop die zichtbaar wordt door een opening is een reden om de `inner`-vlag weg te halen. Na golf 4 zijn op deze manier veel vlaggen weggehaald (onder meer de koppelomvormer en het onderstel).

### `tools/orkestratie/finaltests.sh UITVOERMAP`

Draait de volledige testset in twee parallelle reeksen: lint, smoke, integrity, silhouette, `ui_inner.py --open --strict` en `opentest.py --strikt-min` in de ene reeks; `itest.py` met poorten, `tri.py --gate`, pubsmoke en stats in de andere. De uitvoer per test staat in de map, met per test de duur en de exitcode op de laatste regel, en `start.txt` en `einde.txt`. Het script geeft exitcode 1 zodra één test faalt en weigert zonder uitvoermap. De lijst van tests staat in `tests.txt`, zodat CI kan zien of er een test uit de set is gevallen.

## Bevroren testcontract

De tests spreken de pagina aan via `window.__laguna` (de testkoppeling in `src/app2.js`, hierboven beschreven), maar op een aantal plekken ook rechtstreeks via interne namen van de app: globale functies en variabelen uit `src/*.js` die in `page.evaluate` bruikbaar zijn omdat de pagina één klassiek script is. Die namen zijn een contract: wie er een hernoemt, verplaatst of van betekenis verandert, levert de wijziging van het testscript in dezelfde commit en noemt dat in het commitbericht. De lijst is met grep over `tools/` gecontroleerd op `69cd0fd`.

| Script | Interne namen |
|---|---|
| `tools/itest.py` | `applyVisibility`, `PN_DATA` (controles 12 en 15); `renderer`, `scene`, `camera`, `canvas` (controles 11 tot 13 en de hulpfuncties); `REDUCED`, `uiTick` (controles 18 en 21); `uiFadeMat`, `uiFade`, `uiTick` (controle 18, de fade bij isoleren) |
| `tools/opentest.py` | `uiTick`, `uiBatchSync`, `uiBatchQ`, `uiBatchJob`, `uiBatchFree`, `uiBatchStep`, `uiBatchAdd`, `uiBatchInfo`, `uiBatched`, `uiBaseRel`, `uiAnchorFrame`, `updateLabels`, `uiOpenAnim`, `uiInnerHidden`, `requestRender`, `ASMS`, `SPREAD`; `ROOT`, `ALL`, `MESHES`, `camera`, `controls` |
| `tools/ui_inner.py` | `uiInnerHidden`, `uiOpenNear` |
| `tools/integrity.py` | `OPENERS`, `uiPathOf` (achter een `typeof`-controle) |
| `tools/pncheck.py` | `uiPathOf` |
| `tools/smoke.py` | `renderer`, `scene`, `camera` |
| `tools/anchorcheck.py` | `uiSpots`, `uiNPlaced`, `uiLabelAnchor`, `uiPickList`; `camera`, `canvas` |
| `tools/orkestratie/*` (hulpscripts, geen poort) | `camera`, `controls` (`gateshots.py`, `pick.py`), `scene` (`rays_bagage.py`) |

Haken op `window.__laguna` die golf 5c-1 toevoegde en die controle 18 gebruikt: `lastError` (ook `window.__lagunaLastError`), `contextLost`, `lastFit()`, `tourState()`, `tour.pause`, `tour.resume`, `tour.prev`, `tour.next`, `labelsMore()`, `fading`, `isolated()`, `theme()`, `setTheme(t)`, `norm`, `searchTerms`, `saveImage()`, `toast(txt)`, `hintStage`, `hintNext()`.

Daarnaast hangen de tests aan element-id's, klassen en data-attributen uit `src/head.html` en `src/app2.js`. Voor `tools/itest.py`: `#sheet`, `#modes [data-mode]`, `#openSeg [data-omode]`, `#explode`, `#presets`, `[data-cat]`, `#menu`, `.mi`, `[data-preset]`, `#undo`, `#tabbtn-info`, `#tabbtn-tree`, `#tab-tree`, `#treeSearch`, `#treeInfo`, `#tree .trow .tn`, `#labels .lbl`, `#tip`, `#btnOpenAll`, `#btnCloseAll`, `#btnOpenList`, `#openList`, `#actOpen`, `#pnBody`, `#pnWarn`, `#pnBox`, `.pn-tab`, `#help`, `#helpDlg`, `#helpClose`, `#debug`. `pubsmoke.py` toetst de stijlregels van het canvas (`touch-action`, `user-select`, `-webkit-touch-callout`). Ook deze namen vallen onder het contract. De basislijn van `visdiff.py` (`docs/baseline/`), `IGNORE` in `tools/harness.py` en `tools/anchors.json` wijzigt alleen de orkestrator (struikeldraad T8).

## Resultaten

De kolom "Na golf 1" is de tussenstand van 13 oktober 2026 rond 11:30 UTC, ongewijzigd uit het overdrachtsdocument van golf 1. De kolom "Eind golf 2" is gemeten op commit `ead92f6`, behalve waar een rij anders zegt. De derde kolom is gemeten op `d6d0456`, na de visuele herstelronde (`index.html` gebouwd in `60909fe`). De laatste kolom is de carrosserieronde: de volledige testset (uitvoer in het scratchpad, `g3final5`) draaide op `9c731c8` op 13 oktober rond 23:45 UTC. De eindstand van de code is `ff42dbd`; die commit verandert alleen de eindstukken van de uitlaat (`src/systems.js`). Daarop zijn alleen `integrity.py`, `ui_inner.py`, `smoke.py` en de publicatierooktest opnieuw gedraaid, en die waren groen. De overige scripts zijn niet op `ff42dbd` gedraaid; hun getallen horen bij `9c731c8`. `index.html` is gebouwd in `5b6cefa` uit `ff42dbd`. Alle tijden komen uit een container met software-rendering.

| Test | Na golf 1 | Eind golf 2 (`ead92f6`) | Na de visuele herstelronde (`d6d0456`) | Carrosserieronde (testset op `9c731c8`) |
|---|---|---|---| --- |
| `build.py --lint` | ok | ok | ok | ok |
| Boom | 1.762 knopen, 303 groepen, 1.459 onderdelen, diepte 7 | 2.878 knopen, 484 groepen, 2.394 onderdelen, diepte 8 | 2.881 knopen, 485 groepen, 2.396 onderdelen, diepte 8 (de stator van de dynamo is nu een groep van drie delen) | 2.924 knopen, 489 groepen, 2.435 onderdelen, diepte 8, 253 ingesloten knopen, 37 presets in 6 categorieën |
| Driehoeken | 419.554 | 599.972 (budget 700.000). Aandrijflijn 245.794 (budget 240.000, dus 5.794 erboven), Carrosserie 130.026, Onderstel 109.916, Interieur 67.608, Koeling en luchtinlaat 18.700, Uitlaatsysteem 12.832, Brandstofsysteem 7.608, Elektrisch systeem 7.488 | 604.972 (budget 700.000). Aandrijflijn 250.794 (budget 240.000, dus 10.794 erboven); de andere hoofdgroepen ongewijzigd | 630.368 (budget 700.000). Aandrijflijn 237.310 (budget 240.000, dus binnen budget), Carrosserie 165.546 (budget 190.000), Onderstel 110.204, Interieur 70.328, Koeling en luchtinlaat 18.700, Uitlaatsysteem 13.184, Brandstofsysteem 7.608, Elektrisch systeem 7.488 |
| Tekenopdrachten gemonteerd (grens 1.500) | 1.052 | 1.680 zonder bundelen (boven de grens) | 1.682 zonder bundelen (boven de grens) | 1.726 zonder bundelen (boven de grens) |
| Tekenopdrachten gemonteerd met gebundeld renderen | niet aanwezig | 369 (41 groepen, 301 batchmeshes, 1.612 losse meshes vervangen, 21,6 MB van 42,2 MB) | 370 (41 groepen, 302 batchmeshes, 1.614 losse meshes vervangen, 21,9 MB van 42,6 MB) | 390 (41 groepen, 318 batchmeshes, 1.654 losse meshes vervangen, 24,2 MB van 45,3 MB) |
| Tekenopdrachten volledig uitgeklapt (grens 3.000) | niet vastgelegd na golf 1 | 1.495 in één weergave van `smoke.py` (396.652 driehoeken in beeld) | 1.506 in één weergave van `smoke.py` (398.044 driehoeken in beeld) | 1.517 in één weergave van `smoke.py` (415.047 driehoeken in beeld) |
| Frametijd `profileFrames('Motor F4Rt', 120)` (p95 grens 8 ms) | p50 0,3 ms, p95 0,6 ms | p50 0,5 ms, p95 0,7 ms, max 1,9 ms (uit `itest.py` op `ead92f6`; op `6eca637` gelijk) | p50 0,5 ms, p95 1,1 ms, max 4,9 ms (uit `itest.py`, terwijl de andere tests tegelijk draaiden) | p50 0,5 ms, p95 1 ms, max 3,4 ms (uit `itest.py`, terwijl de andere tests tegelijk draaiden) |
| `buildCar()` (grens 600 ms) | niet vastgelegd na golf 1 | 526 ms (`buildCar` 1.147 min `buildStart` 621 in `__laguna.timing()`, één meting) | 123 ms (`buildCar` 665 min `buildStart` 542, één meting op een minder belaste machine) | 166 ms (`buildCar` 854 min `buildStart` 688 in `stats.json`, één meting) |
| `smoke.py` | geen console-fouten | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 20,6 s op 1280 x 800 en 17,9 s op 390 x 844 | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 14,6 s op 1280 x 800 en 24,4 s op 390 x 844 terwijl de itest tegelijk draaide (de grens van 20 s geldt voor `pubsmoke.py`) | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 8,0 s op 1280 x 800 en 28,1 s op 390 x 844 terwijl de itest tegelijk draaide. Op `ff42dbd` opnieuw zonder consolemeldingen (laadtijd 8,4 s en 23,3 s, tegelijk met de publicatierooktest) |
| `integrity.py` | 13 fouten, alle in domeinen van golf 2; 0 ankerfouten; 0 presetfouten | 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (vooral uitklapvector nul bij ankers) | 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen | 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen. Op `ff42dbd` hetzelfde (2.924 knopen, 2.435 onderdelen) |
| `silhouette.py` | OK, 46 van 46 stations binnen tolerantie | OK, 46 van 46 stations binnen tolerantie (20 zijaanzicht, 17 bovenaanzicht, 9 raamlijn; 318 carrosseriemeshes gemeten) | OK, 46 van 46 stations binnen tolerantie | OK, 45 van 46 stations binnen tolerantie (355 carrosseriemeshes gemeten). De enige uitschieter is het raamlijnpunt bij z = −0,155: dat ligt nu in de bredere B-stijl (referentie: zwarte beplating op de gordel van z −0,28 tot −0,13), dus de straal raakt daar geen glas. Dat is een meetartefact van de plaats van het station en geen fout in de raamlijn. De toets slaagt omdat hoogstens 2 stations per reeks buiten de tolerantie mogen vallen |
| `itest.py` (twee keer achter elkaar) | 71 van 72 (een telefoontik als lang drukken gelezen onder belasting) | 78 van 78 na de samenvoeging van golf 2; 79 van 79 op `6eca637` en op `ead92f6` (zie de volgende rij). Een tweede achtereenvolgende run op dezelfde commit is niet vastgelegd. | zie de volgende rij | zie de volgende rij |
| `ITEST_GATES=1 python3 tools/itest.py` | niet vastgelegd na golf 1 | 79 van 79 op `6eca637` en opnieuw 79 van 79 op de eindstand `ead92f6` (11: 369 tekenopdrachten, p95 0,7 ms) | 78 van 79, twee keer achter elkaar gelijk (de tweede keer zonder andere tests ernaast). De ene fout: op de telefoon koos tik 4 van de 40 willekeurige tikken (stand Gemonteerd) het buurdeel. Het aanwijzen gaf `Binnenframe motorkap`, de tik selecteerde `Koplampsproeiers`. `pick()` is in deze ronde niet veranderd. De vaste steekproef schuift wel mee met de lijst meshes, en die veranderde door de nieuwe stator. Vermoedelijk ligt het punt op de rand van twee onderdelen; dat is niet bewezen en niet opgelost. (Later bewezen als echte app-fout en opgelost; zie "Het itest-randgeval" hieronder.) De andere 78 controles slaagden, ook 11 (370 tekenopdrachten, p95 1,1 ms) en 13 (bundelen). | 79 van 79 (11: 390 tekenopdrachten, p95 1 ms). Vlak daarvoor was een losse run op `9c731c8` ook 79 van 79. Eerder ook 79 van 79 op `34d3469` (twee keer achter elkaar) en op `efaba28`. Het randgeval van de vorige kolom was een echte app-fout en is opgelost; zie "Het itest-randgeval" hieronder |
| `pubsmoke.py` | OK | OK: `ready` na 14,8 s (1280 x 800) en 7,2 s (390 x 844), grens 20 s; three r147; geen horizontale scroll | OK: `ready` na 7,5 s (1280 x 800) en 7,7 s (390 x 844), grens 20 s; three r147; geen horizontale scroll | OK: `ready` na 5,2 s (1280 x 800) en 8,0 s (390 x 844), grens 20 s; three r147; geen horizontale scroll. Op `ff42dbd` opnieuw OK: `ready` na 12,2 s en 9,9 s onder belasting |
| `ui_inner.py` | bestond nog niet | 0 eerste treffers op 256 ingesloten knopen (na golf 2 waren het er 52) | 0 eerste treffers op 256 ingesloten knopen | 0 eerste treffers op 253 ingesloten knopen (39.200 stralen op de hele auto, 20.000 per hoofdgroep). Op `ff42dbd` hetzelfde |
| URL na publicatie gelijk aan `index.html` | niet van toepassing | Gelijk. Versie 2 van de URL, teruggelezen op 13 oktober om 17:00 UTC, bevat `index.html` van `8095a3e` (618.341 bytes, md5 `dc2bc3b0…`) precies één keer en aaneengesloten. Daaromheen staan alleen het vaste paginaskelet van de host (531 bytes: doctype, charset, viewport en basisstijl tot en met `<body>`) en de afsluiting `</body></html>` (15 bytes). | Gelijk. Versie 3 van de URL, teruggelezen op 13 oktober om 17:37 UTC, bevat `index.html` van `60909fe` (620.025 bytes, md5 `d92a8bb2…`) precies één keer en aaneengesloten, met hetzelfde paginaskelet ervoor (531 bytes) en dezelfde afsluiting erna (15 bytes). | Gelijk. Versie 4 van de URL bevat `index.html` uit `ec92a53` (commit `9c03015`, 663.654 bytes, md5 `70b2e62a426312ec788fc851086ab4c6`) precies één keer, met alleen het paginaskelet van de host eromheen (531 bytes ervoor, 15 erna). Versie 5, gepubliceerd op 14 oktober en teruggelezen om 00:02 UTC, bevat `index.html` uit `ff42dbd` (commit `5b6cefa`, 678.887 bytes, md5 `649cbf95397d877f6a361600c42a4afd`) precies één keer en byte voor byte gelijk, met hetzelfde skelet (531 bytes ervoor, 15 erna) |

## Resultaten versie 7 (golf 5 en 5a)

Strikte set (`tools/orkestratie/finaltests.sh`) op de samengevoegde stand `2c179a5`, 16 oktober 2026, 01:21 tot 01:52 UTC; CI op GitHub groen op dezelfde commit. De statistieken staan in [cijfers.md](cijfers.md).

| Test | Uitslag | Duur |
|---|---|---|
| `build.py --lint` | ok | 0 s |
| `smoke.py` | geen consolefouten of -waarschuwingen, geen horizontale scroll op de telefoon | 68 s |
| `integrity.py` | 0 fouten, 0 ankerfouten, 0 presetfouten | 28 s |
| `silhouette.py` | ok | 17 s |
| `ui_inner.py --open --strict` | geen ingesloten knoop van buitenaf zichtbaar | 99 s |
| `opentest.py --strikt-min` | 26 openers, 0 fouten; twee meldingen voor volgers zonder `open.min` (toegestaan) | 515 s |
| `itest.py` met poorten | 161 van 161 (controle 16 telefoon staand, 17 deelbare stand) | 899 s |
| `tri.py --gate` | budgetpoort ok | 9 s |
| `pubsmoke.py` | OK, klaar na 9,5 s op 390 x 844 | 26 s |
| `stats.py` | ok | 15 s |

## Resultaten golf 4

Eindstand `g4final4` op `3ab6a8d` (de uitvoer staat in het scratchpad). Daarna veranderden alleen de screenshots en de documentatie.

| Test | Uitslag |
|---|---|
| `build.py --lint` | ok |
| `smoke.py` | geen consolemeldingen, geen horizontale scroll op de telefoon |
| `integrity.py` | 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (uitklapvector nul) |
| `silhouette.py` | ok |
| `itest.py` met poorten | 150 van 150 |
| `ui_inner.py --open` | 223 ingesloten knopen, 0 eerste treffers van buitenaf op de hele auto en per hoofdgroep |
| `pubsmoke.py` | OK, klaar na 11,6 s op 1280 x 800 en 10,1 s op 390 x 844 (grens 20 s) |
| `opentest.py` | 26 openers, 0 fouten: eindstand, ondergrens, 0 botsingen, 0 verborgen knopen, stralen in het niets onder 2 procent, spookbatchproef goed. Meldingen alleen voor volgers zonder `open.min`. |

Statistieken `g4final4`: 3.012 knopen, 499 groepen, 2.513 onderdelen, diepte 8, 659.496 driehoeken (Aandrijflijn 235.534, Carrosserie 187.554, Onderstel 110.204, Interieur 77.612), 223 ingesloten knopen, 43 presets. Tekenopdrachten: 439 gebundeld en 1.867 zonder; met alles open 774 (grens 3.000). Frametijd p95 bij openAll(1) 3,1 ms en bij openAll(0) 2,2 ms (mediaan van drie metingen, grens 8 ms).

Tussenstanden: `g4final2` op `7f54e61` (opentest een fout: Gordelrolautomaat voor rechts 8,8 mm in de bekleding van het open achterportier, opgelost in `0ac1052`) en `g4final3` op `4fc11cd` (alles groen, maar Carrosserie 199.394 driehoeken door een fijner gaas van de achterportieren; dat gaas is in `3ab6a8d` teruggezet).

Visuele poort golf 4: drie plakken (voorkant en voorportieren, achterkant en dak van buiten, interieur en dak van binnen), per plak drie beoordelaars die elk beeld een keer bekijken, meerderheid per kenmerk. Na elke poort volgde een herstelronde.

| Poort | Stand | Ja | Deels | Nee |
|---|---|---|---|---|
| 1 | `0ac1052` | 6 | 9 | 2 (K5 doppen, K9 interieur: zwevende luidsprekers onder de hoedenplank) |
| 2 | `4fc11cd` | 10 | 7 | 0 |
| 3 | `3ab6a8d` | 10 | 7 | 0 |

Op de eindstand staan op ja: K2 achterportieren, K3 zijruiten voor en achter, K4 spiegels, K5 doppen, K7 tankklep, K8 panoramadak van buiten, K9 (geen doorsteken) bij de voorkant, K10 bediening en K12 alles open leest als Laguna III. Deels: K1 motorkap (de steunstang is op desktop nauwelijks te zien), K2 voorportieren (de B-stijl onder de gordellijn is weinig te onderscheiden), K6 achterklep (de opgetilde hoedenplank leest van achter als vlak liggend), K9 van slice b en c, K11 interieuropeners (camera bij de armsteun en de middenarmsteun), K13 dak van binnen. Tussen poort 2 en 3 gingen K5 en K8 naar ja en K1 en K2 naar deels zonder wijziging aan kap en portieren: de spreiding tussen beoordelaars is van dezelfde orde als de laatste verbeteringen. Daarom is na poort 3 gestopt; de punten staan in `handomdraai.md`.

De spookbatchproef vond bij de telescoop een echte spookbatch; die is opgelost in `a116db9`.

## Het itest-randgeval

In de vorige stand (`d6d0456`) slaagden 78 van de 79 controles. Bij tik 4 van de 40 willekeurige tikken (telefoon, stand Gemonteerd) meldde `noteTarget` het Binnenframe van de motorkap, maar na de tik was Koplampsproeiers geselecteerd.

- Oorzaak, bewezen met instrumentatie: het aanwijzen en de tik waren het eens. Alle 3 x 3 buurpixels en de halve pixels gaven het Binnenframe van de motorkap, `pointerdown` en `pointerup` kregen exact 246/218, het was een directe treffer (de tolerantie is niet gebruikt) en na `pointerup` was het juiste deel geselecteerd. Daarna stuurde Chromium bij de touch-tik nog de compatibele `mousedown`, `mouseup` en `click`. Die vielen op label 13, Koplampsproeiers, dat door de nieuwe selectie net onder de vinger was geschoven. Dit is een echte app-fout; op een telefoon gebeurt hetzelfde.
- Fix in `src/app2.js`: `touchend` op het canvas krijgt `preventDefault()`, en een label reageert alleen op een `click` die op dat label begon, of op een `click` zonder aanwijzer (toetsenbord, schermlezer). Commits `149f43b` en later `36aea29`.
- De test is niet veranderd, alleen de app. Op `9c731c8` slagen alle 79 controles.

## Labelankers

Een label ankert nu op het gelabelde deel zelf, niet meer op het midden van het kader van de groep. De ankers worden over meerdere frames opgebouwd, met een terugval op het eerste zichtbare deel. Een label-klik werkt ook bij een lange muisdruk. Gemeten over alle 36 presets (zonder de rondleiding):

| Meting | Eerder | Nu |
|---|---|---|
| Ankers op het eigen deel | 175 van 345 | 261 van 345 |
| Ankers in de lucht | 52 | 0 |
| Grootste frame bij koud openen, Carrosserie | 17,4 ms | 2,8 ms |
| Grootste frame bij koud openen, Aandrijflijn | niet vastgelegd | 7,3 ms |

De overige 84 van de 345 ankers liggen ook op het eigen deel, maar liggen afhankelijk van de camera achter een ander deel. Dat is niet opgelost. De getallen zijn door een agent gemeten en door de orkestrator nagelegd. De testset heeft er geen aparte controle voor; controle 8 van `tools/itest.py` toetst alleen dat de labels elkaar en de bediening niet overlappen.

## Handmatige controle van de onderkant

De onderkant is nagelopen met stralen. Deze controles zijn handmatig gedaan met scripts die in het scratchpad stonden en niet in de repo zitten. Ze maken dus geen deel uit van de testset en zijn niet te herhalen zonder de scripts opnieuw te schrijven.

- Loodrecht door de vier wielbogen: 0 interieurtreffers (eerst 8 per kant achter).
- Van onderen in zeven richtingen: 2 randgevallen op ruim 60.000 stralen.

Aanleiding was de melding van de gebruiker dat het interieur (beige leder, de bagagevloer en de hemelbekleding) door de wielbogen en van onderen te zien was. De oorzaken en de reparatie (commit `9c731c8`) staan in [ontwerp-en-architectuur.md](ontwerp-en-architectuur.md), punt 7 van de ontwikkelgeschiedenis.

## Bekende beperkingen

- De metingen komen uit een container met software-rendering (SwiftShader). Laadtijden daar (5 tot 28 seconden, afhankelijk van de belasting van de machine) zeggen niets over een echt apparaat.
- De frametijd is alleen JavaScript-tijd. Zonder gebundeld renderen heeft de gemonteerde auto 1.726 tekenopdrachten; gebundeld renderen staat standaard aan en brengt dat op 390. De grens van 1.500 geldt dus alleen met bundelen.
- De Aandrijflijn heeft 237.310 driehoeken tegen een budget van 240.000 en zit dus binnen budget. De hele auto (630.368) blijft binnen 700.000.
- Het aandeel labelankers dat achter een ander deel ligt (84 van 345) en de spikkels op de motorkap in het bovenaanzicht zijn open; zie de twee secties hierboven en de README.
- Golf 4: de metingen aan de openmodus komen uit software-rendering. Tekenopdrachten en JavaScript-tijd zijn het meetbare deel; er is geen echte telefoon of GPU. De eindhoeken zijn geschat uit foto's, het instructieboekje en het werkplaatshandboek; aan de echte auto is niets gemeten.
- De testset van de carrosserieronde liep op `9c731c8`. Op `ff42dbd` (alleen de eindstukken van de uitlaat veranderd) zijn alleen `integrity.py`, `ui_inner.py`, `smoke.py` en de publicatierooktest opnieuw gedraaid. De visuele poort (poort 5) is op `9c731c8` gedraaid en niet opnieuw na de uitlaatreparatie.
- De getekende multiriem is 1.569 mm lang tegen 1.795 mm (7PK1795).
- De voorste langsliggers snijden de aandrijfassen. Dat was al zo en is niet opgelost.
- De positie van de stuurpomp en de routes van de slangen zijn schematisch.
- UX-punt U19 en een zijkolomindeling voor telefoons in liggende stand zijn niet gebouwd.
- In SwiftShader (software-rendering) duurt een frame tijdens grote animaties enkele seconden. Een echte GPU is veel sneller. Op oudere telefoons kan "Alles uit elkaar" wel haperen. De pagina schakelt dan zelf over op een lichte weergave.
- Screenshots van grote explosies hebben in de testomgeving een lange time-out nodig.
- De gemeten frametijd is alleen JavaScript-tijd (explosie-update en labelindeling, zonder `render`). Echte GPU-tijd is in de container niet te meten; er is geen GPU en geen telefoon.
- De meeste tests roepen `finishAll()` aan voordat ze kijken, dus ze zien geen animatieframe. Alleen `profileFrames` en controle 11 doen dat wel.
- Het gedrag van de webview van een telefoon-app (lang drukken opent geen systeemmenu, sneltoetsen in een iframe, de dock boven de thuisbalk) is niet te draaien. `pubsmoke.py` dekt wat statisch toetsbaar is: de stijlregels en de `viewport-fit`.
- Zes agents op vier CPU's maken Chromium traag. Houd screenshotreeksen klein en gebruik time-outs van minstens 300 seconden.
- Het testbestand `tools/itest.py` was in golf 1 één keer rood onder belasting (een tik als lang drukken gelezen). Herhaal een rode itest één keer op een rustige machine voor je de code verdenkt.

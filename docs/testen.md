# Testen

Alle tests draaien in headless Chromium via Playwright (Python), met WebGL via SwiftShader (software-rendering). Elk script bouwt `src/` naar een tijdelijke testmap, start een kleine lokale webserver op die map en opent de pagina op 1280 × 800 (muis) en, waar nodig, op 390 × 844 (touch, schaal 2). Elk script geeft exitcode 0 bij slagen en 1 bij een fout.

## Voorbereiding

```bash
pip install playwright
python3 tools/smoke.py         # haalt three.js 0.147.0 zelf op (npm) als dat nog niet in de cache staat
```

`tools/harness.py` regelt de rest: hij bouwt de testmap met een symlink `three/` naar het npm-pakket en start Chromium. Het ophalen van three.js vraagt `npm` en een netwerkverbinding. Instellingen:

| Omgevingsvariabele | Werking |
|---|---|
| `THREE_DIR` | Map met het uitgepakte npm-pakket `three@0.147.0` (de map `package`). Standaard `~/.cache/laguna/three-0.147.0/package`; ontbreekt die, dan draait het script `npm pack three@0.147.0` en pakt het uit. |
| `CHROMIUM` | Pad naar een Chromium-binary. Standaard `/opt/pw-browsers/chromium` als die bestaat, anders de Chromium van Playwright (`playwright install chromium`). |
| `LAGUNA_TEST` | Een bestaande testmap hergebruiken in plaats van opnieuw te bouwen. |

Chromium start met `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. De harness zet `window.__LAGUNA_CACHECHECK = true`, zodat een botsing van cache-sleutels in `core.js` als consolefout verschijnt. Een script faalt bij elke console-fout of -waarschuwing, behalve het ontbrekende `favicon.ico`.

De pagina zet `window.__laguna` met hulpfuncties voor tests, waaronder `finishAll()` om animaties direct af te ronden, `state()`, `preset(id)`, `checkPresets()`, `pickNodeAt(x, y)`, `hoverTarget(x, y)`, `setExplode(v)`, `labelRects()`, `freeView()`, `profileFrames(naam, aantal)`, `timing()` (de opstarttijdlijn in milliseconden sinds het begin van de navigatie), `batchFlush()` (alle wachtende batches direct bouwen) en `batchStats()`. Een eigen `THREE.Raycaster` in een testscript moet `ray.layers.enableAll()` aanzetten: gebundeld renderen zet de losse meshes van gesloten groepen op laag 1, en een raycaster die alleen laag 0 ziet, mist ze (`integrity.py`, `silhouette.py` en `ui_inner.py` doen dit). De oude functies blijven werken; nieuwe haken komen erbij.

Het gebruikte bestand is de testversie (`python3 build.py --test-only MAP`): die laadt three.js lokaal. De gepubliceerde `index.html` laadt het van jsDelivr en wordt door `pubsmoke.py` apart getoetst.

## Scripts

### `python3 build.py --lint`

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
- ankers: elke naam uit `tools/anchors.json` komt precies één keer voor; de acht kinderen van de wortel staan in de afgesproken volgorde; `Onderstel` heeft precies de vier afgesproken kinderen; de `contains`-paren hangen goed; de `content`-regels halen hun minimum;
- presets (via `checkPresets()`): elke naam bestaat precies één keer, `open`, `deep`, `select` en `labels` liggen onder de `iso`-groep (bevatting), id's, sneltoetsen en categorieën kloppen en de rondleiding noemt bestaande presets.

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
| 15 | Onderdeelnummers: de echte gegevens hebben geen onbekend pad of onbekende eenheid; daarna, met alleen tijdelijke records, de statussen, het bewijs, de bronlinks (alleen https, nieuw tabblad), de VIN-waarschuwing, deel van een eenheid, zoeken op nummer en `pnCheck`. |

`ITEST_SHOTS=MAP` bewaart screenshots van de stappen. `ITEST_GATES=1` zet controle 11 als poort aan; zonder die variabele blijft 11 alleen informatie. De controles voor gebundeld renderen (nummer 13) staan in `tools/itest.py`. Het script telde voor golf 4 79 controles over desktop en telefoon samen (alle 79 slaagden op `9c731c8`). Met de openmodus zijn het er 150 (controle 15 toetst ook dat elk pad en elke eenheid in `partnumbers.js` bestaat); zie de resultaten van golf 4 hieronder. Omdat gebundeld renderen losse meshes naar laag 1 verplaatst, zetten alle raycasters in de tools alle lagen aan.

### `python3 tools/opentest.py [--only namen] [--out map]`

Toetst elke opener van de modus Openen (26 stuks). `--only` beperkt de run tot de genoemde openers, `--out` bewaart de uitvoer in een map. Per opener zes controles:

| Nr | Controle |
|---|---|
| 1 | Eindstand: de gemeten hoek of slag uit de eigen meshes haalt de waarde van de opener. |
| 2 | Ondergrens: de eindstand haalt `open.min`. Een volger zonder `min` geeft een melding. |
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

### `python3 tools/tri.py`

Telt driehoeken per hoofdgroep en toont de 25 zwaarste onderdelen. Bedoeld om te zien welk domein het budget opeet. Geeft altijd 0 (geen controle).

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

Draait de volledige testset in twee parallelle reeksen: lint, smoke, integrity, silhouette, `ui_inner.py --open` en opentest in de ene reeks; `itest.py` met poorten, tri, pubsmoke en stats in de andere. De uitvoer per test staat in de map. Het script is sinds golf 4 uitgebreid met opentest en `ui_inner.py --open`.

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

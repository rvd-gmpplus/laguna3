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
| 13 | Gebundeld renderen: minder tekenopdrachten in Gemonteerd (op de eindstand 1.682 zonder en 370 met bundelen, grens 1.500 met), aanwijzen van een onderdeel in een gebundelde groep, een klik selecteert dat onderdeel en laat zijn groep los tekenen, openen maakt direct los en na het dichtklappen is de groep weer samengevoegd. |

`ITEST_SHOTS=MAP` bewaart screenshots van de stappen. `ITEST_GATES=1` zet controle 11 als poort aan; zonder die variabele blijft 11 alleen informatie. De controles voor gebundeld renderen (nummer 13) staan in `tools/itest.py`. Het script telt op de eindstand 79 controles over desktop en telefoon samen. Omdat gebundeld renderen losse meshes naar laag 1 verplaatst, zetten alle raycasters in de tools alle lagen aan.

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

Controleert in de gemonteerde stand vanuit ten minste 200 richtingen rond de hele auto en rond elke hoofdgroep afzonderlijk geïsoleerd of een `inner`-knop de eerste treffer van buitenaf is: dan zou het verbergen een gat in de auto laten. Dit script is nieuw in golf 2 en staat in de samengevoegde boom. Opties: `--strict` (exitcode 1 bij een zichtbare ingesloten knoop), `--json`, en `UI_INNER_DIRS` voor het aantal richtingen. Uitvoer op de eindstand: 256 ingesloten knopen in de boom, 200 richtingen per weergave, 39.200 stralen op de hele auto en 20.000 per hoofdgroep, 0 eerste treffers op een ingesloten onderdeel, dus 0 overtreders voor elke eigenaar. Direct na de samenvoeging van golf 2 waren er 52 zichtbare ingesloten knopen (carrosserie, interieur, onderstel, systemen, aandrijving en motor); de herstelronde heeft ze opgelost.

## Resultaten

De kolom "Na golf 1" is de tussenstand van 13 oktober 2026 rond 11:30 UTC, ongewijzigd uit het overdrachtsdocument van golf 1. De kolom "Eind golf 2" is gemeten op commit `ead92f6`, behalve waar een rij anders zegt. De laatste kolom is gemeten op `d6d0456`, na de visuele herstelronde (`index.html` gebouwd in `60909fe`); die ronde veranderde alleen uitklapvectoren, presetcamera's en -labels, de labelgrootte op smalle schermen en de vorm van de stator en de dikte van één O-ring. Alle tijden komen uit een container met software-rendering.

| Test | Na golf 1 | Eind golf 2 (`ead92f6`) | Na de visuele herstelronde (`d6d0456`) |
|---|---|---|---|
| `build.py --lint` | ok | ok | ok |
| Boom | 1.762 knopen, 303 groepen, 1.459 onderdelen, diepte 7 | 2.878 knopen, 484 groepen, 2.394 onderdelen, diepte 8 | 2.881 knopen, 485 groepen, 2.396 onderdelen, diepte 8 (de stator van de dynamo is nu een groep van drie delen) |
| Driehoeken | 419.554 | 599.972 (budget 700.000). Aandrijflijn 245.794 (budget 240.000, dus 5.794 erboven), Carrosserie 130.026, Onderstel 109.916, Interieur 67.608, Koeling en luchtinlaat 18.700, Uitlaatsysteem 12.832, Brandstofsysteem 7.608, Elektrisch systeem 7.488 | 604.972 (budget 700.000). Aandrijflijn 250.794 (budget 240.000, dus 10.794 erboven); de andere hoofdgroepen ongewijzigd |
| Tekenopdrachten gemonteerd (grens 1.500) | 1.052 | 1.680 zonder bundelen (boven de grens) | 1.682 zonder bundelen (boven de grens) |
| Tekenopdrachten gemonteerd met gebundeld renderen | niet aanwezig | 369 (41 groepen, 301 batchmeshes, 1.612 losse meshes vervangen, 21,6 MB van 42,2 MB) | 370 (41 groepen, 302 batchmeshes, 1.614 losse meshes vervangen, 21,9 MB van 42,6 MB) |
| Tekenopdrachten volledig uitgeklapt (grens 3.000) | niet vastgelegd na golf 1 | 1.495 in één weergave van `smoke.py` (396.652 driehoeken in beeld) | 1.506 in één weergave van `smoke.py` (398.044 driehoeken in beeld) |
| Frametijd `profileFrames('Motor F4Rt', 120)` (p95 grens 8 ms) | p50 0,3 ms, p95 0,6 ms | p50 0,5 ms, p95 0,7 ms, max 1,9 ms (uit `itest.py` op `ead92f6`; op `6eca637` gelijk) | p50 0,5 ms, p95 1,1 ms, max 4,9 ms (uit `itest.py`, terwijl de andere tests tegelijk draaiden) |
| `buildCar()` (grens 600 ms) | niet vastgelegd na golf 1 | 526 ms (`buildCar` 1.147 min `buildStart` 621 in `__laguna.timing()`, één meting) | 123 ms (`buildCar` 665 min `buildStart` 542, één meting op een minder belaste machine) |
| `smoke.py` | geen console-fouten | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 20,6 s op 1280 x 800 en 17,9 s op 390 x 844 | geen console-fouten of -waarschuwingen; telefoon scrollt niet horizontaal; laadtijd 14,6 s op 1280 x 800 en 24,4 s op 390 x 844 terwijl de itest tegelijk draaide (de grens van 20 s geldt voor `pubsmoke.py`) |
| `integrity.py` | 13 fouten, alle in domeinen van golf 2; 0 ankerfouten; 0 presetfouten | 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (vooral uitklapvector nul bij ankers) | 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen |
| `silhouette.py` | OK, 46 van 46 stations binnen tolerantie | OK, 46 van 46 stations binnen tolerantie (20 zijaanzicht, 17 bovenaanzicht, 9 raamlijn; 318 carrosseriemeshes gemeten) | OK, 46 van 46 stations binnen tolerantie |
| `itest.py` (twee keer achter elkaar) | 71 van 72 (een telefoontik als lang drukken gelezen onder belasting) | 78 van 78 na de samenvoeging van golf 2; 79 van 79 op `6eca637` en op `ead92f6` (zie de volgende rij). Een tweede achtereenvolgende run op dezelfde commit is niet vastgelegd. | zie de volgende rij |
| `ITEST_GATES=1 python3 tools/itest.py` | niet vastgelegd na golf 1 | 79 van 79 op `6eca637` en opnieuw 79 van 79 op de eindstand `ead92f6` (11: 369 tekenopdrachten, p95 0,7 ms) | 78 van 79, twee keer achter elkaar gelijk (de tweede keer zonder andere tests ernaast). De ene fout: op de telefoon koos tik 4 van de 40 willekeurige tikken (stand Gemonteerd) het buurdeel. Het aanwijzen gaf `Binnenframe motorkap`, de tik selecteerde `Koplampsproeiers`. `pick()` is in deze ronde niet veranderd. De vaste steekproef schuift wel mee met de lijst meshes, en die veranderde door de nieuwe stator. Vermoedelijk ligt het punt op de rand van twee onderdelen; dat is niet bewezen en niet opgelost. De andere 78 controles slaagden, ook 11 (370 tekenopdrachten, p95 1,1 ms) en 13 (bundelen). |
| `pubsmoke.py` | OK | OK: `ready` na 14,8 s (1280 x 800) en 7,2 s (390 x 844), grens 20 s; three r147; geen horizontale scroll | OK: `ready` na 7,5 s (1280 x 800) en 7,7 s (390 x 844), grens 20 s; three r147; geen horizontale scroll |
| `ui_inner.py` | bestond nog niet | 0 eerste treffers op 256 ingesloten knopen (na golf 2 waren het er 52) | 0 eerste treffers op 256 ingesloten knopen |
| URL na publicatie gelijk aan `index.html` | niet van toepassing | Gelijk. Versie 2 van de URL, teruggelezen op 13 oktober om 17:00 UTC, bevat `index.html` van `8095a3e` (618.341 bytes, md5 `dc2bc3b0…`) precies één keer en aaneengesloten. Daaromheen staan alleen het vaste paginaskelet van de host (531 bytes: doctype, charset, viewport en basisstijl tot en met `<body>`) en de afsluiting `</body></html>` (15 bytes). | Gelijk. Versie 3 van de URL, teruggelezen op 13 oktober om 17:37 UTC, bevat `index.html` van `60909fe` (620.025 bytes, md5 `d92a8bb2…`) precies één keer en aaneengesloten, met hetzelfde paginaskelet ervoor (531 bytes) en dezelfde afsluiting erna (15 bytes). |

## Bekende beperkingen

- De metingen komen uit een container met software-rendering (SwiftShader). Laadtijden daar (5 tot 21 seconden, afhankelijk van de belasting van de machine) zeggen niets over een echt apparaat.
- De frametijd is alleen JavaScript-tijd. Zonder gebundeld renderen heeft de gemonteerde auto 1.682 tekenopdrachten; gebundeld renderen staat standaard aan en brengt dat op 370. De grens van 1.500 geldt dus alleen met bundelen.
- De Aandrijflijn heeft 250.794 driehoeken tegen een budget van 240.000. De hele auto (604.972) blijft binnen 700.000.
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

# Hulpscripts voor de orkestratie

Scripts die de bouwsessie naast de vaste testset gebruikte: screenshots maken, eindcijfers verzamelen, ruimte in de auto bezetten en takken controleren vóór het samenvoegen. Ze staan los van de testset in `tools/` en worden niet door `build.py` gebruikt. Elk script dat de pagina laadt, gebruikt `tools/harness.py` (Chromium met software-rendering) en bouwt eerst een testversie uit `src/`.

| Script | Gebruik | Wat het doet |
|---|---|---|
| `finaltests.sh` | `tools/orkestratie/finaltests.sh UITVOERMAP` | Draait de hele testset (lint, smoke, integrity, silhouette, ui_inner met --open --strict, opentest met --strikt-min, itest met poorten, tri met --gate, pubsmoke, stats) in twee parallelle reeksen, zet de uitvoer per test in de map met de duur, en geeft exitcode 1 zodra een test faalt. |
| `gallery.py` | `python3 tools/orkestratie/gallery.py REPO UITVOERMAP [set]` | Vaste screenshotset. De sets zijn alles (standaard), exterieur, overzicht, motor, aandrijving, onderstel, interieur, golf2 en mobiel. |
| `presetshots.py` | `python3 tools/orkestratie/presetshots.py REPO UITVOERMAP` | Een screenshot van elke preset, zonder de rondleiding. |
| `docshots.py` | `python3 tools/orkestratie/docshots.py REPO UITVOERMAP` | De twaalf screenshots voor `docs/screenshots` (elf op 1280 x 800 en `mobiel.png` op 390 x 844). |
| `cijfers.py` | `python3 tools/orkestratie/cijfers.py UIT/stats.json [UIT/tri.json] > docs/cijfers.md` | Kerncijfers als één bron voor de documentatie (boom, driehoeken per hoofdgroep met budget, tekenopdrachten, opstarttijdlijn). |
| `stats.py` | `python3 tools/orkestratie/stats.py REPO UITVOER.json` | Eindcijfers: boom, driehoeken per hoofdgroep, presets, tekenopdrachten met en zonder bundelen, opstarttijdlijn. |
| `pickview.py` | `python3 tools/orkestratie/pickview.py REPO VIEWNAAM x,y [x,y ...]` | Laat zien welk onderdeel op een schermpunt van een galerijweergave staat. |
| `zone.py` | `python3 tools/orkestratie/zone.py REPO '{"naam":{"lo":[x,y,z],"hi":[x,y,z]}}' [motor\|auto]` | Toont welke meshes een kader snijden, in het motorframe of het autoframe, met de hoogte van de carrosserie erboven. |
| `mergecheck.py` | `python3 tools/orkestratie/mergecheck.py DOMEIN COMMIT [BASIS]` | Eigendomscontrole van een tak: raakt die alleen bestanden van het eigen domein? Exitcode 1 bij een overtreding. |
| `pick.py` | `PICK_PNG=uit.png python3 tools/orkestratie/pick.py 'JS-voorbereiding' x,y [x,y ...]` | Zet de modus Openen aan, draait de voorbereiding (bijvoorbeeld een opener openen), maakt een opname en noemt per schermpunt het pad van het onderdeel dat er ligt. |
| `shots.py` | `python3 tools/orkestratie/shots.py UITMAP naam 'JS' [naam2 'JS2' ...]` | Gerichte opnames in de modus Openen; elke JS draait na een verse Alles dicht. |
| `probe.py` | `python3 tools/orkestratie/probe.py 'JS-expressie'` | Draait een expressie op de pagina en drukt het resultaat als JSON af; `window.__box(naam)` geeft het wereldkader van een knoop. |
| `rays_bagage.py` | `python3 tools/orkestratie/rays_bagage.py` | Stralen vanuit het midden van de bagageruimte naar links en rechts: vrije ruimte en het eerste onderdeel. |
| `phone.py` | `python3 tools/orkestratie/phone.py UITMAP` | Twee telefoonbeelden (390 x 844): start en modus Openen, plus de scrollbreedte. |
| `gateshots.py` | `python3 tools/orkestratie/gateshots.py UITMAP` | De vaste beelden van de visuele poort: elke opener via zijn knop, drie overzichten met alles open, het dak van boven en van binnen, drie telefoonbeelden, met `index.json`. |
| `dumptree.py` | `python3 tools/orkestratie/dumptree.py UIT.json` | De hele boom als JSON. |
| `poort.js` | `Workflow({scriptPath: 'tools/orkestratie/poort.js', args: {dir: UITMAP}})` | De visuele poort: drie plakken met elk drie beoordelaars, meerderheid per kenmerk K1 tot K13. Leest de beelden van `gateshots.py`. |

De scripts zonder REPO-argument gebruiken de checkout waarin ze staan, dus vanuit een worktree de bron van die worktree.

`pickview.py` leest de weergaven uit `gallery.py` en moet daarom in dezelfde map blijven staan.

Een eigen `THREE.Raycaster` in een hulpscript moet `layers.enableAll()` aanzetten. Met gebundeld tekenen staan de losse meshes van gesloten groepen op laag 1, en zonder die regel ziet de raycaster ze niet. `zone.py` doet dat al.

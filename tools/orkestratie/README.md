# Hulpscripts voor de orkestratie

Scripts die de bouwsessie naast de vaste testset gebruikte: screenshots maken, eindcijfers verzamelen, ruimte in de auto bezetten en takken controleren vóór het samenvoegen. Ze staan los van de testset in `tools/` en worden niet door `build.py` gebruikt. Elk script dat de pagina laadt, gebruikt `tools/harness.py` (Chromium met software-rendering) en bouwt eerst een testversie uit `src/`.

| Script | Gebruik | Wat het doet |
|---|---|---|
| `finaltests.sh` | `tools/orkestratie/finaltests.sh UITVOERMAP` | Draait de hele testset (lint, smoke, integrity, silhouette, ui_inner (met --open), opentest, itest met poorten, tri, pubsmoke, stats) in twee parallelle reeksen en zet de uitvoer per test in de map. |
| `gallery.py` | `python3 tools/orkestratie/gallery.py REPO UITVOERMAP [set]` | Vaste screenshotset. De sets zijn alles (standaard), exterieur, overzicht, motor, aandrijving, onderstel, interieur, golf2 en mobiel. |
| `presetshots.py` | `python3 tools/orkestratie/presetshots.py REPO UITVOERMAP` | Een screenshot van elke preset, zonder de rondleiding. |
| `docshots.py` | `python3 tools/orkestratie/docshots.py REPO UITVOERMAP` | De zeven screenshots voor `docs/screenshots`. |
| `stats.py` | `python3 tools/orkestratie/stats.py REPO UITVOER.json` | Eindcijfers: boom, driehoeken per hoofdgroep, presets, tekenopdrachten met en zonder bundelen, opstarttijdlijn. |
| `pickview.py` | `python3 tools/orkestratie/pickview.py REPO VIEWNAAM x,y [x,y ...]` | Laat zien welk onderdeel op een schermpunt van een galerijweergave staat. |
| `zone.py` | `python3 tools/orkestratie/zone.py REPO '{"naam":{"lo":[x,y,z],"hi":[x,y,z]}}' [motor\|auto]` | Toont welke meshes een kader snijden, in het motorframe of het autoframe, met de hoogte van de carrosserie erboven. |
| `mergecheck.py` | `python3 tools/orkestratie/mergecheck.py DOMEIN COMMIT [BASIS]` | Eigendomscontrole van een tak: raakt die alleen bestanden van het eigen domein? Exitcode 1 bij een overtreding. |

`pickview.py` leest de weergaven uit `gallery.py` en moet daarom in dezelfde map blijven staan.

Een eigen `THREE.Raycaster` in een hulpscript moet `layers.enableAll()` aanzetten. Met gebundeld tekenen staan de losse meshes van gesloten groepen op laag 1, en zonder die regel ziet de raycaster ze niet. `zone.py` doet dat al.

# Testen

Alle tests draaien in headless Chromium via Playwright (Python), met WebGL via SwiftShader. Elk script start een kleine lokale webserver op de testmap.

## Voorbereiding

```bash
mkdir -p /tmp/laguna && cd /tmp/laguna
npm pack three@0.147.0 && tar xzf three-0.147.0.tgz
mkdir -p test && ln -s "$PWD/package" test/three
python3 /pad/naar/laguna3/build.py "$PWD/test"
pip install playwright
```

Gebruik de systeem-Chromium of `playwright install chromium`.

## Scripts in `tools/`

| Script | Doel |
|---|---|
| `shot.py MAP UITVOER 'JSON'` | Screenshots en `eval`-stappen per viewport. Voorbeeld: `[["desk",1100,700,["shot:gemonteerd","eval:document.querySelector('[data-preset=main]').click(); __laguna.finishAll(); 1","wait:3500","shot:hoofdgroepen"]]]` |
| `itest.py MAP` | Interactietest: tikken (uitklappen), inklapmodus, paneelknoppen, zoeken in de boom, weergave-opties, alles in- en uitklappen. |
| `tri.py MAP` | Telt driehoeken per onderdeel en per hoofdgroep. |
| `perf.py MAP` | Meet rendertijd, tekenopdrachten en aantal geometrieën. |

De pagina zet `window.__laguna` met hulpfuncties voor tests, waaronder `finishAll()` om animaties direct af te ronden.

## Resultaten (12 oktober 2026)

| Test | Uitkomst |
|---|---|
| Laden | Geen consolefouten of paginafouten. 865 onderdelen, 122 groepen. |
| Tikken | Auto → hoofdgroepen → carrosserie → aandrijflijn, telkens één laag. |
| Inklapmodus | Sluit de diepste open groep. |
| Zoeken "klepveer" | 32 treffers; klikken opent het pad en selecteert het onderdeel. |
| Alles uit- en inklappen | Alle 122 groepen open, daarna alle dicht. |
| Desktop 1100 × 700 | Presets Gemonteerd, Hoofdgroepen, Motor F4Rt, Automaat, Röntgen en Alles uit elkaar gecontroleerd. |
| Telefoon 390 × 760 | Paneel onderaan, onderdelenlijst en weergave-instellingen bruikbaar, geen horizontale scroll. |

## Bekende beperkingen

- In SwiftShader (software-rendering) duurt een frame tijdens grote animaties enkele seconden. Op een echte GPU is dat geen probleem, maar "Alles uit elkaar" kan op oudere telefoons haperen.
- Screenshots van grote explosies hebben in de testomgeving een lange time-out nodig.

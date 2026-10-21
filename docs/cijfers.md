# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-21, bron `cee8ac3 2026-10-21`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.229 |
| Groepen | 507 |
| Onderdelen | 2.722 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 221 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.049 | 238.402 | 260.000 |
| Carrosserie | 567 | 198.295 | 200.000 |
| Onderstel | 509 | 124.396 | 125.000 |
| Interieur | 361 | 89.752 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 11.204 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.722 | 711.313 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 498 |
| Zonder bundelen | 2.084 |
| Batches | 46 groepen, 418 batchmeshes, 2.004 losse meshes vervangen, 36,3 MB van 56,3 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 35 |
| buildStart | 97 |
| buildCar | 633 |
| startUp | 758 |
| render0 | 778 |
| firstFrame | 5.105 |
| interactive | 5.110 |
| ready | 11.533 |
| batches | 5.143 |
| duur buildCar() | 536 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

## Pagina (testbouw van `cee8ac3`, versie 20, nog niet gepubliceerd)

Deze sectie komt niet uit `cijfers.py` en is met de hand toegevoegd; bij het opnieuw genereren moet ze terug. Gemeten met `python3 build.py --test-only MAP`, dus zonder `index.html` te overschrijven. De publicatiecijfers (de echte bouw met stempel) vult de orkestrator na de publicatie aan in `CHANGELOG.md`.

| Grootheid | Waarde |
|---|---|
| `index.html` (testbouw), raw | 1.720.061 bytes |
| `index.html` (testbouw), `gzip -6` | 471.958 bytes |
| Grens T4 | 1,8 MB raw en 490 kB gzip (MB = 10^6 bytes; zie `docs/masterplan.md`, struikeldraad T4) |

# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-22, bron `ba4e19a 2026-10-22`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Aandrijflijn | 1.049 | 238.042 | 260.000 |
| Carrosserie | 567 | 198.259 | 200.000 |
| Onderstel | 509 | 124.192 | 125.000 |
| Interieur | 361 | 89.608 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 11.204 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.722 | 710.569 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 498 |
| Zonder bundelen | 2.084 |
| Batches | 46 groepen, 418 batchmeshes, 2.004 losse meshes vervangen, 36,2 MB van 56,2 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 64 |
| buildStart | 237 |
| buildCar | 889 |
| startUp | 1.169 |
| render0 | 1.202 |
| firstFrame | 2.966 |
| interactive | 2.973 |
| ready | 6.449 |
| batches | 6.543 |
| duur buildCar() | 652 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


## Pagina (versie 21, gepubliceerd)

Deze sectie komt niet uit `cijfers.py` en is met de hand toegevoegd; bij het opnieuw genereren moet ze terug. Gemeten met `python3 build.py --test-only MAP`, dus zonder `index.html` te overschrijven. De publicatiecijfers (de echte bouw met stempel) vult de orkestrator na de publicatie aan in `CHANGELOG.md`. three.js komt van de CDN (sinds versie 21 als ES-module, 0.186.1) en telt hier niet mee.

| Grootheid | Waarde |
|---|---|
| `index.html` (testbouw), raw | 1.728.591 bytes |
| `index.html` (testbouw), `gzip -6` | 474.791 bytes |
| `index.html` (gepubliceerd, stempel "21 (bron 977185c)"), raw | 1.729.057 bytes |
| `index.html` (gepubliceerd), `gzip -6` | 474.809 bytes |
| Grens T4 | 1,8 MB raw en 490 kB gzip (MB = 10^6 bytes; zie `docs/masterplan.md`, struikeldraad T4) |

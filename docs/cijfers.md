# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-23, bron `72bbbda 2026-10-23`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.231 |
| Groepen | 507 |
| Onderdelen | 2.724 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 221 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.049 | 238.042 | 260.000 |
| Carrosserie | 569 | 199.011 | 200.000 |
| Onderstel | 509 | 124.192 | 125.000 |
| Interieur | 361 | 90.706 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 11.204 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.724 | 712.419 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 498 |
| Zonder bundelen | 2.086 |
| Batches | 46 groepen, 418 batchmeshes, 2.006 losse meshes vervangen, 36,5 MB van 56,5 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 36 |
| buildStart | 84 |
| buildCar | 565 |
| startUp | 677 |
| render0 | 696 |
| firstFrame | 4.180 |
| interactive | 4.182 |
| ready | 8.934 |
| batches | 4.209 |
| duur buildCar() | 481 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

## Pagina (versie 22, gepubliceerd)

Deze sectie komt niet uit `cijfers.py` en is met de hand toegevoegd; bij het opnieuw genereren moet ze terug. Gemeten met `python3 build.py --test-only MAP`, dus zonder `index.html` te overschrijven. De publicatiecijfers (de echte bouw met stempel) vult de orkestrator na de publicatie aan in `CHANGELOG.md`. three.js komt van de CDN (sinds versie 21 als ES-module, 0.186.1) en telt hier niet mee. De opstarttijdlijn hierboven is op 23 oktober 2026 gemeten op een rustige Mac; versie 21 en 22 om en om gemeten verschillen minder dan 1 procent, dus het verschil met eerdere tabellen komt van de meetomstandigheden.

| Grootheid | Waarde |
|---|---|
| `index.html` (testbouw), raw | 1.739.830 bytes |
| `index.html` (testbouw), `gzip -6` | 478.574 bytes |
| `index.html` (gepubliceerd, stempel "22 (bron 23841ce)"), raw | 1.740.296 bytes |
| `index.html` (gepubliceerd), `gzip -6` | 478.592 bytes |
| Grens T4 | 1,8 MB raw en 490 kB gzip (MB = 10^6 bytes; zie `docs/masterplan.md`, struikeldraad T4) |

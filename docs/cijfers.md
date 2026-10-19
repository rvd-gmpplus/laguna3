# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `cba7364 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.065 |
| Groepen | 501 |
| Onderdelen | 2.564 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 220 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.049 | 238.414 | 260.000 |
| Carrosserie | 509 | 178.737 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 287 | 85.564 | 95.000 |
| Koeling en luchtinlaat | 78 | 21.248 | 25.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 51 | 9.496 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.564 | 665.763 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 457 |
| Zonder bundelen | 1.925 |
| Batches | 46 groepen, 377 batchmeshes, 1.845 losse meshes vervangen, 32,6 MB van 52,7 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 34 |
| buildStart | 81 |
| buildCar | 418 |
| startUp | 526 |
| render0 | 543 |
| firstFrame | 1.983 |
| interactive | 1.985 |
| ready | 5.337 |
| batches | 2.010 |
| duur buildCar() | 337 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


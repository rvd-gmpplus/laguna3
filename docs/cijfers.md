# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-20, bron `a84c5db 2026-10-20`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.086 |
| Groepen | 504 |
| Onderdelen | 2.582 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 220 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.049 | 238.402 | 260.000 |
| Carrosserie | 510 | 187.803 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 287 | 85.564 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 10.844 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.582 | 682.437 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 461 |
| Zonder bundelen | 1.945 |
| Batches | 46 groepen, 381 batchmeshes, 1.865 losse meshes vervangen, 34,2 MB van 54,4 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 30 |
| buildStart | 74 |
| buildCar | 434 |
| startUp | 532 |
| render0 | 549 |
| firstFrame | 1.968 |
| interactive | 1.970 |
| ready | 5.625 |
| batches | 1.993 |
| duur buildCar() | 360 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


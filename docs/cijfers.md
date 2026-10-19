# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-20, bron `f2a6674 2026-10-20`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.085 |
| Groepen | 504 |
| Onderdelen | 2.581 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 220 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.049 | 238.402 | 260.000 |
| Carrosserie | 509 | 184.341 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 287 | 85.564 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 10.844 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.581 | 678.975 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 461 |
| Zonder bundelen | 1.944 |
| Batches | 46 groepen, 381 batchmeshes, 1.864 losse meshes vervangen, 33,8 MB van 53,9 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 32 |
| buildStart | 76 |
| buildCar | 427 |
| startUp | 528 |
| render0 | 544 |
| firstFrame | 1.987 |
| interactive | 1.989 |
| ready | 5.688 |
| batches | 2.013 |
| duur buildCar() | 351 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


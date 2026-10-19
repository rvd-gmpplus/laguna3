# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `80bee59 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Aandrijflijn | 1.048 | 228.184 | 240.000 |
| Carrosserie | 510 | 175.997 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 287 | 85.564 | 95.000 |
| Koeling en luchtinlaat | 78 | 21.224 | 25.000 |
| Uitlaatsysteem | 52 | 13.040 | 20.000 |
| Elektrisch systeem | 51 | 9.144 | 12.000 |
| Brandstofsysteem | 38 | 8.568 | 12.000 |
| Totaal | 2.564 | 652.281 | 700.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 454 |
| Zonder bundelen | 1.925 |
| Batches | 46 groepen, 374 batchmeshes, 1.845 losse meshes vervangen, 31,5 MB van 51,3 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 32 |
| buildStart | 78 |
| buildCar | 411 |
| startUp | 514 |
| render0 | 532 |
| firstFrame | 724 |
| interactive | 726 |
| ready | 7.627 |
| batches | 743 |
| duur buildCar() | 333 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


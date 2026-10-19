# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `7f7afe2 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.063 |
| Groepen | 501 |
| Onderdelen | 2.562 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 220 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.048 | 228.184 | 240.000 |
| Carrosserie | 508 | 178.725 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 287 | 85.564 | 95.000 |
| Koeling en luchtinlaat | 78 | 21.248 | 25.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 51 | 9.496 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.562 | 655.521 | 700.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 456 |
| Zonder bundelen | 1.923 |
| Batches | 46 groepen, 376 batchmeshes, 1.843 losse meshes vervangen, 31,8 MB van 51,7 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 34 |
| buildStart | 83 |
| buildCar | 423 |
| startUp | 532 |
| render0 | 549 |
| firstFrame | 743 |
| interactive | 745 |
| ready | 9.468 |
| batches | 777 |
| duur buildCar() | 340 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


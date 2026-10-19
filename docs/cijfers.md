# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `d97c831 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Carrosserie | 508 | 177.773 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 287 | 85.564 | 95.000 |
| Koeling en luchtinlaat | 78 | 21.224 | 25.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 51 | 9.144 | 12.000 |
| Brandstofsysteem | 38 | 8.568 | 12.000 |
| Totaal | 2.562 | 654.217 | 700.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 456 |
| Zonder bundelen | 1.923 |
| Batches | 46 groepen, 376 batchmeshes, 1.843 losse meshes vervangen, 31,9 MB van 51,8 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 29 |
| buildStart | 71 |
| buildCar | 397 |
| startUp | 492 |
| render0 | 507 |
| firstFrame | 695 |
| interactive | 697 |
| ready | 6.292 |
| batches | 725 |
| duur buildCar() | 326 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


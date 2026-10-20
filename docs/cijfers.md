# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-20, bron `6d2810c 2026-10-20`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.190 |
| Groepen | 505 |
| Onderdelen | 2.685 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 220 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 1.049 | 238.402 | 260.000 |
| Carrosserie | 545 | 190.187 | 200.000 |
| Onderstel | 505 | 113.580 | 125.000 |
| Interieur | 350 | 89.960 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 11.204 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.685 | 692.597 | 720.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 480 |
| Zonder bundelen | 2.048 |
| Batches | 46 groepen, 400 batchmeshes, 1.968 losse meshes vervangen, 34,9 MB van 55 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 32 |
| buildStart | 79 |
| buildCar | 483 |
| startUp | 587 |
| render0 | 604 |
| firstFrame | 3.705 |
| interactive | 3.707 |
| ready | 8.186 |
| batches | 3.726 |
| duur buildCar() | 404 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


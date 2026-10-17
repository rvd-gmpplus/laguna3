# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-17, bron `a90786b 2026-10-17`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.063 |
| Groepen | 503 |
| Onderdelen | 2.560 |
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
| Interieur | 283 | 83.164 | 95.000 |
| Koeling en luchtinlaat | 78 | 21.224 | 25.000 |
| Uitlaatsysteem | 52 | 13.040 | 20.000 |
| Elektrisch systeem | 51 | 9.144 | 12.000 |
| Brandstofsysteem | 38 | 8.568 | 12.000 |
| Totaal | 2.560 | 649.881 | 700.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 451 |
| Zonder bundelen | 1.921 |
| Batches | 46 groepen, 371 batchmeshes, 1.841 losse meshes vervangen, 31,2 MB van 51,1 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 35 |
| buildStart | 80 |
| buildCar | 400 |
| startUp | 506 |
| render0 | 1.126 |
| firstFrame | 1.314 |
| interactive | 1.316 |
| ready | 6.139 |
| batches | 1.343 |
| duur buildCar() | 320 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


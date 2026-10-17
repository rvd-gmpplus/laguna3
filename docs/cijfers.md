# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-17, bron `6aadcd0 2026-10-17`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Carrosserie | 510 | 175.069 | 190.000 |
| Onderstel | 500 | 110.560 | 125.000 |
| Interieur | 283 | 82.340 | 95.000 |
| Koeling en luchtinlaat | 78 | 21.224 | 25.000 |
| Uitlaatsysteem | 52 | 13.040 | 20.000 |
| Elektrisch systeem | 51 | 9.144 | 12.000 |
| Brandstofsysteem | 38 | 8.588 | 12.000 |
| Totaal | 2.560 | 648.149 | 700.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 451 |
| Zonder bundelen | 1.921 |
| Batches | 46 groepen, 371 batchmeshes, 1.841 losse meshes vervangen, 25.7 MB van 46.4 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 32 |
| buildStart | 76 |
| buildCar | 394 |
| startUp | 495 |
| render0 | 1.060 |
| firstFrame | 1.245 |
| interactive | 1.247 |
| ready | 5.399 |
| batches | 1.277 |
| duur buildCar() | 318 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


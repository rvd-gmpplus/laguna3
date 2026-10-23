# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-23, bron `5bdfda8 2026-10-23`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 3.236 |
| Groepen | 507 |
| Onderdelen | 2.729 |
| Diepte | 8 |
| Ingesloten knopen (`inner`) | 221 |
| Presets | 43 |
| Presets per categorie | Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Carrosserie | 574 | 270.530 | 280.000 |
| Aandrijflijn | 1.049 | 238.042 | 260.000 |
| Onderstel | 509 | 124.192 | 125.000 |
| Interieur | 361 | 94.326 | 95.000 |
| Koeling en luchtinlaat | 94 | 27.520 | 30.000 |
| Uitlaatsysteem | 52 | 13.200 | 20.000 |
| Elektrisch systeem | 52 | 11.204 | 12.000 |
| Brandstofsysteem | 38 | 8.544 | 12.000 |
| Totaal | 2.729 | 787.558 | 810.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 512 |
| Zonder bundelen | 2.091 |
| Batches | 50 groepen, 432 batchmeshes, 2.011 losse meshes vervangen, 39,1 MB van 60,6 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 37 |
| buildStart | 85 |
| buildCar | 1.097 |
| startUp | 1.209 |
| render0 | 1.232 |
| firstFrame | 4.840 |
| interactive | 4.842 |
| ready | 9.557 |
| batches | 4.863 |
| duur buildCar() | 1.012 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

## Pagina (versie 23, gepubliceerd)

Deze sectie komt niet uit het generatordeel van `cijfers.py`; ze is met de hand geschreven en het script neemt haar sinds golf 8 ongewijzigd over uit de gecommitte versie (`HEAD`). Bijwerken blijft handwerk na elke publicatie. Gemeten met `python3 build.py --test-only MAP`, dus zonder `index.html` te overschrijven. De publicatiecijfers (de echte bouw met stempel) vult de orkestrator na de publicatie aan in `CHANGELOG.md`. three.js komt van de CDN (sinds versie 21 als ES-module, 0.186.1) en telt hier niet mee. De opstarttijdlijn hierboven komt uit de volledige set op de Mac op `645138d` (code gelijk aan versie 23), terwijl de andere tests tegelijk draaiden; ze is dus niet vergelijkbaar met de rustige meting bij versie 22.

| Grootheid | Waarde |
|---|---|
| `index.html` (testbouw), raw | 1.821.949 bytes |
| `index.html` (testbouw), `gzip -6` | 506.156 bytes |
| `index.html` (gepubliceerd, stempel "23 (bron e519aaf)"), raw | 1.822.415 bytes (md5 `c572c6c4f86dbbf86ce9686bebf5bd6f`) |
| `index.html` (gepubliceerd), `gzip -6` | 506.180 bytes |
| Artefact (kale pagina uit `build.py --bare`) | 1.822.239 bytes (md5 `45f222a2201aab1ef1c22fcf9bb0484f`), artefactversie 25 |
| Grens T4 | 1,9 MB raw en 530 kB gzip (MB = 10^6 bytes; zie `docs/masterplan.md`, struikeldraad T4). Op 23 oktober 2026 door de gebruiker verhoogd van 1,8 MB en 490 kB, na golf 8; versie 23 ligt eronder (marge 77.585 bytes raw en 23.820 bytes gzip). |

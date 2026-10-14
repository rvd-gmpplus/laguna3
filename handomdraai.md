# Handomdraai laguna3

Stand 14 okt 2026, na versie 5. Carrosserieronde en onderkantreparaties klaar, live. S7 gehaald op `9c731c8`.

## Waar

- Repo `rvd-gmpplus/laguna3`, tak `ccr-bd755431-1qfniw`. Code `ff42dbd`, `index.html` gebouwd in `5b6cefa`, screenshots in `docs/screenshots` opnieuw gemaakt in `cd396ab`. De tak staat op `cd396ab` gelijk aan origin. De commit met deze documentatie komt daarna; de hash is bij het schrijven niet bekend.
- PR #1: https://github.com/rvd-gmpplus/laguna3/pull/1. Geen CI in repo.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR, versie 5, gepubliceerd op 14 oktober. Teruggelezen 00:02 UTC: `index.html` (678.887 bytes, md5 `649cbf95397d877f6a361600c42a4afd`, uit `ff42dbd`) staat er 1x in, byte voor byte gelijk, alleen hostskelet eromheen (531 bytes ervoor, 15 erna). Versie 4 (`index.html` uit `ec92a53` in commit `9c03015`, 663.654 bytes, md5 `70b2e62a426312ec788fc851086ab4c6`) is op dezelfde manier teruggelezen.
- Versie 1 bewaard: `docs/v1/index.html`. Tussenstand golf 1 los: https://claude.ai/artifact/CchXLCsG3x8A4purHXpYRf
- Bouwen: `python3 build.py` plakt `src/*.js` tot `index.html`. Volgorde staat in `ORDER` in `build.py`.
- Vertrekpunt van deze ronde was de vorige `handomdraai.md` op `ecc3c57` (13 oktober, avond).

## Wat werkt

- 2.435 onderdelen, 489 groepen, diepte 8, 2.924 knopen, 630.368 driehoeken (budget 700.000). Aandrijflijn 237.310 (budget 240.000), Carrosserie 165.546, Onderstel 110.204, Interieur 70.328.
- Klik: eigen groep klapt ter plekke uit, rest blijft staan. Dubbelklik: direct naar onderdeel. Inklappen: rechtsklik, lang drukken, Shift+klik. Een tik op het canvas geeft geen tweede actie meer via een label.
- Explosieschuif, Demonteren/Monteren, Stap terug. 37 presets in 6 categorieen, plus rondleiding.
- Gesloten groepen gebundeld getekend: 390 tekenopdrachten gemonteerd, 1.726 zonder.
- Labels ankeren op het eigen deel: 261 van 345 ankers, 0 in de lucht.
- Carrosserie: slanke achterlichten, spoilerlip van 3,6 cm, chroom dat als chroom leest, zwarte B-stijl, kwartsruit met stijltje, echte luchtinlaat. Onderkant dicht: gesloten wielkasten, vloer tot de wielkast, uitlaat strak onder de vloer met kleine eindstukken onder de bumperrand.

## Tests

Testset op `9c731c8` (uitvoer `g3final5`, 13 oktober rond 23:45 UTC). `ff42dbd` verandert alleen de eindstukken van de uitlaat; daarop zijn integrity (0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen), ui_inner (0 van 253 zichtbaar), smoke (geen consolemeldingen) en de publicatierooktest (`ready` na 12,2 s en 9,9 s onder belasting) opnieuw groen. De rest is niet op `ff42dbd` gedraaid.

- `python3 build.py --lint`: ok.
- `python3 tools/smoke.py`: geen consolefouten of -waarschuwingen, geen horizontale scroll op de telefoon. Laadtijd 8,0 s (1280 x 800) en 28,1 s (390 x 844) terwijl de itest tegelijk draaide.
- `python3 tools/integrity.py`: 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen.
- `python3 tools/silhouette.py`: OK, 45 van 46 stations. De uitschieter is het raamlijnpunt bij z = -0,155 in de B-stijl, een meetartefact.
- `python3 tools/ui_inner.py`: 0 van 253 ingesloten knopen zichtbaar.
- `python3 tools/pubsmoke.py`: ok. Ready 5,2 s op 1280 x 800, 8,0 s op 390 x 844. Grens 20 s.
- `ITEST_GATES=1 python3 tools/itest.py`: 79/79. Het randgeval van de vorige stand was een echte app-fout (nagekomen muisklik op een label), opgelost in `src/app2.js`. Test ongewijzigd.
- Frametijd p95 1 ms, grens 8 ms. Alles uitgeklapt: 1.517 tekenopdrachten, grens 3.000.
- Visuele poort 5 op `9c731c8` (drie beoordelaars, meerderheid per kenmerk): 7 van 9, S7 gehaald. Ja: 1, 2, 3, 6, 7, 9, 10. Deels: 4, 8. Details in het scratchpad (`g3gate5/uitslag.md`). Na de poort zijn de einduitlaten opgelost in `ff42dbd`; de poort is daarna niet opnieuw gedraaid.
- Onderkant met stralen, handmatig (scripts niet in repo): loodrecht door de vier wielbogen 0 interieurtreffers, van onderen in zeven richtingen 2 randgevallen op ruim 60.000.

## Open

1. S7 is net gehaald (7 van 9 op `9c731c8`). Kenmerk 4 (B-stijl leest als dunne lijn, raamlijst nauwelijks te zien) en kenmerk 8 (bovenaanzicht evenwijdig) zijn deels. Kenmerk 8 is bewust niet aangepast: de tekening is per kolom gemeten, breedte constant binnen 1 %. Poort na de uitlaatreparatie niet gedraaid.
2. Donkere spikkels op de motorkap in het bovenaanzicht, vaste plek. Vermoedelijk software-rasterisatie, niet bewezen. Op een echte GPU nakijken.
3. Oud en bekend: voorste langsliggers snijden aandrijfassen. Multiriem 1.569 mm, echt 1.795 mm.
4. Torsiebalk ligt in het model boven de vlakke vloer (y 0,25 tot 0,33, vloer y 0,18). Echt loopt de balk onder een verhoogd vloerdeel. Van buiten niet te zien, niet aangepast.
5. De veer achter steekt door de voorrand van de bagagevloer in de veerkoker. De koker staat als kastje naast de rugleuning; echt zit daar zijbekleding, die het model niet heeft.
6. 84 van de 345 labelankers liggen op het eigen deel maar achter een ander deel, afhankelijk van de camera.
7. Niet gebouwd: UX-punt U19 (rest dimmen bij duiken naar een onderdeel), zijkolom voor telefoon liggend.
8. Niet getest op een echte telefoon en GPU. Container meet alleen software-rendering.
9. Los bestand `/pub.txt` in root van container. Onschadelijk. Weghalen mag.

## Advies, op volgorde

1. Testen op echte telefoon en GPU. Grootste onbekende, en daar kunnen ook de spikkels op de motorkap bekeken worden.
2. Visuele poort opnieuw op de eindstand `ff42dbd`, zodat 7 van 9 ook voor de nieuwe uitlaat is bevestigd. Houd de grenzen aan (drie beoordelaars, meerderheid per kenmerk). Kenmerk 4 is deels. Kenmerk 8 niet aanpassen zonder nieuwe meting.
3. Labelankers: de 84 achter een ander deel nalopen, bijvoorbeeld met een ankerpunt dat vanuit de presetcamera zichtbaar is.
4. Modelpunten: langsliggers tegen de aandrijfassen, multiriem, torsiebalk, veer achter.
5. U19 en de zijkolom voor de telefoon liggend.
6. `/pub.txt` weghalen.

## Werkwijze die werkte

- Golven per domein, elk in eigen worktree, alleen eigen bestanden. Eigendom checken voor samenvoegen.
- Na samenvoegen hele testset, dan pas publiceren. Na publiceren URL teruglezen, byte voor byte vergelijken.
- Visuele poort klein: plakken van max ca. 18 beelden, elk beeld 1x lezen, notities direct naar bestand, harde eindtijd. Eerste poort zonder die grenzen liep vast.
- Poortmeldingen zelf naleggen in preset-screenshots. Galerijcamera kan misleiden: dashboard en motorruimte waren vals alarm.
- Meldingen eerst met stralen en schermafbeeldingen narekenen voor je iets verandert. De drie contacten die herstellers meldden (accuhouderstang, vulpijp, remslang achter) bleken zo alle drie echt. Bij de meldingen van de gebruiker over de onderkant kwam bij de wielbogen ook een gat naar het interieur boven, dat de melding zelf niet noemde.
- Poort met drie onafhankelijke beoordelaars en meerderheid per kenmerk (vanaf poort 4). Poort 5 gaf 7 van 9, en elke beoordelaar afzonderlijk ook 7 van 9.

## Bewaard in repo

- Onderzoek: `docs/onderzoek/` (maten en kenmerken exterieur in `exterieur.md` sectie 7, motor, automaat, onderstel en interieur, beslissingen, UX-audit met U19). Index: `docs/onderzoek/README.md`. De beslissingen van de carrosserieronde staan onderaan `beslissingen.md`.
- Hulpscripts: `tools/orkestratie/` (`finaltests.sh`, `gallery.py`, `presetshots.py`, `docshots.py`, `stats.py`, `pickview.py`, `zone.py`, `mergecheck.py`). Paden relatief aan repo. Uitleg: `tools/orkestratie/README.md`.
- Screenshots: `docs/screenshots`, opnieuw gemaakt uit de bron van `ff42dbd`.

## Vluchtig: scratchpad, weg als container stopt

- Pad: `/tmp/claude-0/-home-user-laguna3/30068ba5-ed5c-5f1b-b200-1ce4840ed639/scratchpad`
- Referentiefoto's `research/img/`. Niet in repo: rechten derden. Bronlinks staan in de notities.
- Testuitvoer van de eindstand `g3final5/`, poortuitslag en beelden `g3gate5/`, feitenblad `golf3/docs-facts.md`.
- De stralenscripts voor de onderkant (wielbogen loodrecht, van onderen in zeven richtingen). Niet in repo.
- Werkplan: `plan/stand.md`, `plan/herstel-visueel.md`. Inhoud zit al in dit bestand en in `docs/`.

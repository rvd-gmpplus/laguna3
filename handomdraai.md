# Handomdraai laguna3

Stand 15 okt 2026, 02:15 UTC, na golf 4 (openmodus, panoramadak, onderdeelnummers, kennisverwerking). Versie 6 staat live en is teruggelezen.

## Waar

- Repo `rvd-gmpplus/laguna3`, tak `ccr-bd755431-1qfniw`. Code van de eindstand: `3ab6a8d`. `index.html` voor versie 6 gebouwd uit die bron en vastgelegd in `31a8f0d`; daarna veranderen alleen de docs.
- PR #1: https://github.com/rvd-gmpplus/laguna3/pull/1 (carrosserieronde). PR #2: https://github.com/rvd-gmpplus/laguna3/pull/2 (golf 4, concept). Geen CI in repo.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR, versie 6, gepubliceerd op 15 oktober om 02:10 UTC. Teruggelezen om 02:11 UTC: `index.html` (1.337.555 bytes, md5 `17b21be36108d7ee8531bc232de5c35c`, uit `3ab6a8d`) staat er een keer in, byte voor byte gelijk, alleen het hostskelet eromheen (531 bytes ervoor, 15 erna). Versie 5 (`ff42dbd`, 678.887 bytes, md5 `649cbf95397d877f6a361600c42a4afd`) is eerder op dezelfde manier teruggelezen. De groei komt vooral van de onderdeelnummers (`src/partnumbers.js`, 565 kB).
- GitHub Pages: https://rvd-gmpplus.github.io/laguna3/, bediend vanaf `main`. `main` staat nog op versie 5. Bijwerken van `main` gebeurt alleen na een ja van de gebruiker. De tak `gh-pages` is overbodig; de gebruiker verwijdert hem in GitHub (de proxy weigerde het verwijderen).
- Versie 1 bewaard: `docs/v1/index.html`. Tussenstand golf 1 los: https://claude.ai/artifact/CchXLCsG3x8A4purHXpYRf
- Bouwen: `python3 build.py` plakt `src/*.js` tot `index.html`. Volgorde staat in `ORDER` in `build.py`: core, body, bodyparts, panorama, engine1 tot engine3, drivetrain, chassis, interior, systems, partnumbers, app1, presets, app2. `src/partnumbers.js` is gegevens, gemaakt door `tools/orkestratie/build_pn.py`; niet met de hand bewerken.
- Vertrekpunt van deze ronde was de vorige `handomdraai.md` (stand na versie 5, 14 oktober).

## Wat werkt

- Boom (`g4final4`): 3.012 knopen, 499 groepen, 2.513 onderdelen, diepte 8, 659.496 driehoeken (budget 700.000). Aandrijflijn 235.534 (budget 240.000), Carrosserie 187.554 (budget 190.000), Onderstel 110.204, Interieur 77.612. 223 ingesloten knopen.
- Uitklappen werkt als voorheen: klik klapt de eigen groep uit, dubbelklik duikt naar het onderdeel, rechtsklik, Shift+klik en lang drukken klappen in. Explosieschuif, Demonteren en Monteren, Stap terug.
- Tweede modus Openen (segmentknop of toets O): 26 openers. De klikregel opent de buitenste dichte opener op het pad, sluiten gaat met rechtsklik, Shift+klik of lang drukken. Dock met Alles open, Alles dicht en Openers n/26. Paneelknop Openen of Sluiten werkt op de geselecteerde opener zelf. Zes presets in de categorie Openen. De camera kijkt bij openen in de opening. De hoedenplank hangt aan twee koordjes aan de achterklep. Zie README en `docs/ontwerp-en-architectuur.md`.
- Panoramadak in het model: twee getinte glaspanelen met dwarsbalk, voorste glas kantelt en schuift 0,60 m, twee zonneschermen met cassette in hemelkleur, luchtgeleider met armpjes, waterafvoer, hemelbekleding met twee openingen en de draaiknop. Maten geschat uit foto's.
- Onderdeelnummers in het paneel, met status, bewijsniveau A tot D en een vaste VIN-waarschuwing. 546 verkoopeenheden (110 past volgens catalogus, 71 variant, 365 niet gevonden), 1.334 nummers (446 Renault, 888 van 197 andere merken). Bewijs: A 807, B 436, C 89, D 2. Van de 2.513 onderdelen hebben er 1.398 een regel en 648 minstens een nummer; 750 zijn onderzocht zonder nummer en 1.115 zijn niet onderzocht. Onderhoudsinformatie bij 43 paden. CSV in `docs/onderdeelnummers.csv`. Zoeken op nummer in de tab Onderdelen.
- Kennis uit het rapport van de gebruiker en het werkplaatshandboek MR 415 (X91) is verwerkt: geen faseversteller op de F4R 811, eindoverbrenging 3,804, aluminium motorkap, capless vulhals, aanhaalmomenten en inhouden in het paneel. Zie `docs/onderzoek/kennisbasis.md` en `docs/onderzoek/beslissingen.md` (aanvulling 14 oktober).
- 43 presets in 7 categorieën, plus rondleiding. Gesloten groepen gebundeld getekend: 439 tekenopdrachten gemonteerd, 1.867 zonder; met alles open 774.
- De titel linksboven heeft een doorschijnend vlak in de achtergrondkleur, zodat hij bij een close-up leesbaar blijft (geen backdrop-filter).

## Tests

Eindstand `g4final4` op `3ab6a8d`.

- `python3 build.py --lint`: ok.
- `python3 tools/smoke.py`: geen consolemeldingen, geen horizontale scroll op de telefoon.
- `python3 tools/integrity.py`: 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (uitklapvector nul).
- `python3 tools/silhouette.py`: ok.
- `ITEST_GATES=1 python3 tools/itest.py`: 150 van 150, inclusief de openmodus (controle 14) en de onderdeelnummers (controle 15, nu ook op de echte gegevens).
- `python3 tools/ui_inner.py --open`: 0 eerste treffers van buitenaf op een ingesloten onderdeel.
- `python3 tools/pubsmoke.py`: OK, klaar na 11,6 s (1280 x 800) en 10,1 s (390 x 844).
- `python3 tools/opentest.py`: 26 openers, 0 fouten. Uitzonderingen: `tools/open_allow.json`, 9 regels met reden.
- Frametijd p95 bij openAll(1) 3,1 ms en openAll(0) 2,2 ms (grens 8 ms). Tekenopdrachten met alles open 774 (grens 3.000).
- `tools/orkestratie/finaltests.sh UITVOERMAP` draait de hele set, ook opentest en `ui_inner.py --open`.
- Visuele poort golf 4, drie keer (9 beoordelaars, 3 plakken, meerderheid per kenmerk), met een herstelronde na elke poort: poort 1 op `0ac1052` 6 ja, 9 deels, 2 nee; poort 2 op `4fc11cd` 10 ja, 7 deels, 0 nee; poort 3 op `3ab6a8d` 10 ja, 7 deels, 0 nee. Na poort 3 gestopt: de spreiding tussen beoordelaars was even groot als de laatste winst.
- Details: [docs/testen.md](docs/testen.md).

## Open

1. Visuele poort, wat op deels bleef (poort 3): de steunstang van de motorkap is op desktop nauwelijks te zien; de B-stijl onder de gordellijn is in de opening van de voorportieren weinig te onderscheiden; de opgetilde hoedenplank leest van achter als vlak liggend en dekt de neergeklapte rugleuning deels af; de camera kijkt bij de armsteun middenconsole tegen het deksel aan en bij de middenarmsteun achter staat de ruit van het open portier in beeld; de voorruit leest van binnen als zwart vlak; een losse beige staaf in de bagageruimte bij de klep (05, gemeld door twee beoordelaars, niet nagekeken); het dakglas is van boven middengrijs en lichter dan de voorruit (bewust lichter gemaakt zodat de zonneschermen te zien zijn). Beelden en notities: `g4gate3/` in het scratchpad.
2. Nummerdekking: 1.115 van de 2.513 onderdelen zijn niet onderzocht (vooral interieur, carrosseriedelen en kleine bevestigingsmiddelen) en 750 zijn onderzocht zonder nummer. Renault-nummers op niveau B voor het panoramadak ontbreken: de twee panoramadaknummers komen uit een advertentie (niveau D). Dat kan zodra de Renault-catalogus bereikbaar is; die zat achter Cloudflare. Nieuwe knopen uit de herstelronden 2 en 3 zonder eigen regel staan op niet onderzocht (onder meer Vulklepring, Armsteunbekleding, Hoedenplankkoord, Plankscharnierpen, Vulopening, A-stijlbekleding).
3. Varianten op VIN: 71 verkoopeenheden hebben meer dan een uitvoering. Met het VIN van de gebruiker kunnen die worden vastgelegd.
4. ATF: het werkplaatshandboek MR 415 noemt ELF MATIC S6, 7,6 l totaal en 3,5 l na aftappen in een tabel die de AJX noemt. `docs/onderzoek/beslissingen.md` noemt Elfmatic J6. Inhoud en norm zijn een open punt.
5. Geen 4Control in het model. Dat was een optie.
6. Hoeken en slagen van de openers zijn geschat uit foto's, het instructieboekje en het werkplaatshandboek; aan de echte auto is niets gemeten.
7. S7 uit de carrosserieronde: 7 van 9 op `9c731c8`, deels kenmerk 4 en 8; die poort is na golf 4 niet opnieuw gedraaid.
8. Donkere spikkels op de motorkap in het bovenaanzicht, vaste plek. Vermoedelijk software-rasterisatie, niet bewezen. Op een echte GPU nakijken.
9. Oud en bekend: voorste langsliggers snijden aandrijfassen; multiriem 1.569 mm tegen 1.795 mm echt; torsiebalk boven de vlakke vloer; de veer achter steekt door de voorrand van de bagagevloer; 84 van de 345 labelankers liggen achter een ander deel.
10. Niet gebouwd: UX-punt U19 (rest dimmen bij duiken naar een onderdeel) en een zijkolom voor telefoons in liggende stand.
11. Niet getest op een echte telefoon en GPU. De container meet alleen software-rendering (tekenopdrachten en JavaScript-tijd).
12. Databankenrecht: de CSV bevat alleen nummers en URL's. Een juridische toets is niet gedaan.
13. Los bestand `/pub.txt` in de root van de container. Onschadelijk. Weghalen mag.

## Advies, op volgorde

1. De gebruiker vragen naar het chassisnummer (VIN), zodat de varianten kunnen worden vastgelegd, en of `main` (en daarmee GitHub Pages) naar versie 6 mag.
2. Vervolgronde nummers: de niet onderzochte onderdelen, eerst de delen die de gebruiker waarschijnlijk bestelt. Renault-nummers voor het panoramadak op niveau B zodra de catalogus bereikbaar is.
3. ATF-inhoud en -norm uitzoeken (open punt 4).
4. Testen op een echte telefoon en GPU. Grootste onbekende, ook voor de zwaarste stand (alles open) en voor de spikkels op de motorkap.
5. De punten van open punt 1 in een gerichte ronde, daarna de visuele poort opnieuw met dezelfde grenzen (plakken van hoogstens 18 beelden, elk beeld een keer, drie beoordelaars of meer, meerderheid per kenmerk).
6. Modelpunten uit de lijst met oude bekende punten, en U19 met de zijkolom voor de telefoon liggend.
7. `/pub.txt` weghalen.

## Werkwijze die werkte

- Golven per domein, elk in eigen worktree, alleen eigen bestanden. Eigendom checken voor samenvoegen.
- Na samenvoegen hele testset, dan pas publiceren. Na publiceren URL teruglezen, byte voor byte vergelijken.
- Twee premortems op het plan van golf 4 (openmodus en gegevens), met struikeldraden die tijdens de bouw afgingen: zie `docs/premortem.md`. De spookbatchproef vond echt een fout die geen andere toets zag.
- Een ondergrens per opener (`open.min`), een asregel en botsing gemeten als nieuw ten opzichte van de gesloten stand. Zonder ondergrens beloont een botsingstoets kleinere hoeken.
- Nummeronderzoek in plakken met een harde stop, een verificatiepoort met lokvogels (alle 15 afgewezen) en de status `niet onderzocht` voor wat niet geverifieerd is.
- Visuele poort klein: plakken van max ca. 18 beelden, elk beeld 1x lezen, notities direct naar bestand, harde eindtijd.
- Meldingen eerst met stralen en schermafbeeldingen narekenen voor je iets verandert.

## Bewaard in repo

- Onderzoek: `docs/onderzoek/` (kennisbasis, beslissingen met de aanvulling van 14 oktober, exterieur, motor, automaat, onderstel en interieur, UX-audit). Index: `docs/onderzoek/README.md`.
- Onderdeelnummers: `docs/onderdeelnummers.csv`, gegevens in `src/partnumbers.js`, bouwscript `tools/orkestratie/build_pn.py`.
- Openmodus: `tools/opentest.py`, `tools/open_allow.json`, `src/panorama.js`.
- Hulpscripts: `tools/orkestratie/` (`finaltests.sh`, `gallery.py`, `presetshots.py`, `docshots.py`, `stats.py`, `pickview.py`, `zone.py`, `mergecheck.py`, `build_pn.py`). Uitleg: `tools/orkestratie/README.md`.
- Screenshots: `docs/screenshots`, gemaakt uit de bron van `3ab6a8d` met `tools/orkestratie/docshots.py`, met vijf beelden van de modus Openen.
- Het werkplaatshandboek MR 415 (114 MB) en de referentiefoto's staan niet in de repo (rechten van Renault en derden). Alleen korte verwijzingen met paginanummer.

## Vluchtig: scratchpad, weg als container stopt

- Pad: `/tmp/claude-0/-home-user-laguna3/30068ba5-ed5c-5f1b-b200-1ce4840ed639/scratchpad`
- Map `golf4/`: feitenblad `docs-feiten.md`, de volledige premortems `premortem-A.md` en `premortem-B.md`, `feiten-mechanismen.md`, `feiten-panorama.md`, `mr415-feiten.md`, `kennisbasis-gebruiker.md`, de plannen `plan.md` en `plan-v2.md`, en de onderzoeks- en verificatiegegevens van de nummers in `golf4/pn/` (per plak de ruwe uitvoer, de geverifieerde uitvoer, het verslag en de opgehaalde pagina's).
- Testuitvoer `g4final2/` tot `g4final4/` (eindstand) en de poortbeelden met notities `g4gate/`, `g4gate2/` en `g4gate3/`; de hulpmiddelen van de orkestrator in `g4fix/` (pick.py, shots.py, probe.py).
- Referentiefoto's `research/img/`. Niet in repo: rechten derden. Bronlinks staan in de notities.

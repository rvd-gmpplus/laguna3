# Handomdraai laguna3

Stand 14 en 15 okt 2026, na golf 4 (openmodus, panoramadak, onderdeelnummers, kennisverwerking). Versie 5 staat live; versie 6 wordt gepubliceerd door de orkestrator.

## Waar

- Repo `rvd-gmpplus/laguna3`, tak `ccr-bd755431-1qfniw`. Code van golf 4: de testset `g4final2` liep op `7f54e61`; daarna kwamen nog de onderdeelnummers (`429a3ef`), de paneelknop van Openen (`6e73913`) en het panoramadak in de nummers (`2e6903a`). De eindcommit en de commit van `index.html` voor versie 6 vult de orkestrator in: eindcommit `........`, `index.html` gebouwd in `........`.
- PR #1: https://github.com/rvd-gmpplus/laguna3/pull/1 (carrosserieronde). PR #2 hoort bij golf 4. Geen CI in repo.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR. Versie 5 (14 oktober, `index.html` uit `ff42dbd`, 678.887 bytes, md5 `649cbf95397d877f6a361600c42a4afd`) is teruggelezen en gelijk. Versie 6: gegevens volgen na publicatie. Bytes `........`, md5 `........`, teruggelezen op `........` UTC, skelet van de host ervoor `........` bytes en erna `........` bytes.
- GitHub Pages: https://rvd-gmpplus.github.io/laguna3/, bediend vanaf `main`. `main` staat nog op versie 5. Bijwerken van `main` gebeurt alleen na een ja van de gebruiker. De tak `gh-pages` is overbodig; de gebruiker verwijdert hem in GitHub (de proxy weigerde het verwijderen).
- Versie 1 bewaard: `docs/v1/index.html`. Tussenstand golf 1 los: https://claude.ai/artifact/CchXLCsG3x8A4purHXpYRf
- Bouwen: `python3 build.py` plakt `src/*.js` tot `index.html`. Volgorde staat in `ORDER` in `build.py`: core, body, bodyparts, panorama, engine1 tot engine3, drivetrain, chassis, interior, systems, partnumbers, app1, presets, app2. `src/partnumbers.js` is gegevens, gemaakt door `tools/orkestratie/build_pn.py`; niet met de hand bewerken.
- Vertrekpunt van deze ronde was de vorige `handomdraai.md` (stand na versie 5, 14 oktober).

## Wat werkt

- Boom (`g4final2`): 2.993 knopen, 495 groepen, 2.498 onderdelen, diepte 8, 653.628 driehoeken (budget 700.000). Aandrijflijn 235.406 (budget 240.000), Carrosserie 187.002, Interieur 72.984. 223 ingesloten knopen.
- Uitklappen werkt als voorheen: klik klapt de eigen groep uit, dubbelklik duikt naar het onderdeel, rechtsklik, Shift+klik en lang drukken klappen in. Explosieschuif, Demonteren en Monteren, Stap terug.
- Tweede modus Openen (segmentknop of toets O): 26 openers. De klikregel opent de buitenste dichte opener op het pad, sluiten gaat met rechtsklik, Shift+klik of lang drukken. Dock met Alles open, Alles dicht en Openers n/26. Paneelknop Openen of Sluiten werkt op de geselecteerde opener zelf. Zes presets in de categorie Openen. Zie README en `docs/ontwerp-en-architectuur.md`.
- Panoramadak in het model: twee getinte glaspanelen met dwarsbalk, voorste glas kantelt en schuift 0,60 m, twee zonneschermen met cassette, luchtgeleider, waterafvoer, hemelbekleding met twee openingen en de draaiknop. Maten geschat uit foto's.
- Onderdeelnummers in het paneel, met status, bewijsniveau A tot D en een vaste VIN-waarschuwing. 546 verkoopeenheden (110 past volgens catalogus, 71 variant, 365 niet gevonden), 1.334 nummers (446 Renault, 888 van 197 andere merken). Bewijs: A 807, B 436, C 89, D 2. Van de 2.498 onderdelen hebben er 1.394 een regel en 646 minstens een nummer; 748 zijn onderzocht zonder nummer en 1.104 zijn niet onderzocht. Onderhoudsinformatie bij 43 paden. CSV in `docs/onderdeelnummers.csv`.
- Kennis uit het rapport van de gebruiker en het werkplaatshandboek MR 415 (X91) is verwerkt: geen faseversteller op de F4R 811, eindoverbrenging 3,804, aluminium motorkap, capless vulhals, aanhaalmomenten en inhouden in het paneel. Zie `docs/onderzoek/kennisbasis.md` en `docs/onderzoek/beslissingen.md` (aanvulling 14 oktober).
- 43 presets in 7 categorieën, plus rondleiding. Gesloten groepen gebundeld getekend: 405 tekenopdrachten gemonteerd, 1.852 zonder; met alles open 759.

## Tests

Stand `g4final2` op `7f54e61`. De orkestrator past deze cijfers aan op de eindcommit als daarna nog code verandert.

- `python3 build.py --lint`: ok.
- `python3 tools/smoke.py`: geen consolemeldingen.
- `python3 tools/integrity.py`: 0 fouten, 0 ankerfouten, 0 presetfouten.
- `ITEST_GATES=1 python3 tools/itest.py`: 149 van 149, inclusief de openmodus (controles 14 en 15).
- `python3 tools/ui_inner.py --open`: schoon.
- `python3 tools/pubsmoke.py`: OK, 6,4 s op de telefoon.
- `python3 tools/opentest.py`: 26 openers groen op een na. Gordelrolautomaat voor rechts zat 8,8 mm in de bekleding van het open achterportier; opgelost in `0ac1052`. Uitzonderingen: `tools/open_allow.json`, 9 regels met reden.
- Frametijd p95 bij alles openen en sluiten 1,4 tot 1,6 ms (grens 8 ms).
- `tools/orkestratie/finaltests.sh UITVOERMAP` draait de hele set, nu ook opentest en `ui_inner.py --open`.
- Visuele poort golf 4 (9 beoordelaars, 3 plakken, meerderheid per kenmerk). Ja: K1 motorkap, K3 zijruiten, K4 spiegels, K7 tankklep, K12 alles open. Deels: K2 portieren, K6 achterklep, K8 panoramadak, K9 slice a en b, K10 bediening, K11 interieuropeners, K13 dak van binnen. Nee: K5 doppen, K9 slice c. Herstelronde 2 liep op deze punten. Uitslag na herstelronde 2: `........` (de orkestrator vult in).
- Details en eerdere stand: [docs/testen.md](docs/testen.md).

## Open

1. Uitslag van herstelronde 2 van de visuele poort golf 4 en wat die niet oploste: `........` (de orkestrator vult in). Bij de poort waren de doppen (K5) en de luidsprekers onder de hoedenplank (K9 slice c) nee.
2. Nummerdekking: 1.104 van de 2.498 onderdelen zijn niet onderzocht (vooral interieur, carrosseriedelen en kleine bevestigingsmiddelen) en 748 zijn onderzocht zonder nummer. Renault-nummers op niveau B voor het panoramadak ontbreken: de twee panoramadaknummers komen uit een advertentie (niveau D). Dat kan zodra de Renault-catalogus bereikbaar is; die zat achter Cloudflare.
3. Varianten op VIN: 71 verkoopeenheden hebben meer dan een uitvoering. Met het VIN van de gebruiker kunnen die worden vastgelegd.
4. ATF: het werkplaatshandboek MR 415 noemt ELF MATIC S6, 7,6 l totaal en 3,5 l na aftappen in een tabel die de AJX noemt. `docs/onderzoek/beslissingen.md` noemt Elfmatic J6. Inhoud en norm zijn een open punt.
5. Geen 4Control in het model. Dat was een optie.
6. Hoeken en slagen van de openers zijn geschat uit foto's, het instructieboekje en het werkplaatshandboek, niet gemeten aan de echte auto.
7. S7 uit de carrosserieronde: 7 van 9 op `9c731c8`, deels kenmerk 4 en 8; de poort is na de uitlaatreparatie niet opnieuw gedraaid.
8. Donkere spikkels op de motorkap in het bovenaanzicht, vaste plek. Vermoedelijk software-rasterisatie, niet bewezen. Op een echte GPU nakijken.
9. Oud en bekend: voorste langsliggers snijden aandrijfassen; multiriem 1.569 mm tegen 1.795 mm echt; torsiebalk boven de vlakke vloer; de veer achter steekt door de voorrand van de bagagevloer; 84 van de 345 labelankers liggen achter een ander deel.
10. Niet gebouwd: UX-punt U19 (rest dimmen bij duiken naar een onderdeel) en een zijkolom voor telefoons in liggende stand.
11. Niet getest op een echte telefoon en GPU. De container meet alleen software-rendering (tekenopdrachten en JavaScript-tijd).
12. Databankenrecht: de CSV bevat alleen nummers en URL's. Een juridische toets is niet gedaan.
13. Los bestand `/pub.txt` in de root van de container. Onschadelijk. Weghalen mag.

## Advies, op volgorde

1. Publiceren van versie 6 afronden: URL teruglezen en byte voor byte vergelijken met `index.html`, daarna de gegevens in "Waar" invullen.
2. De gebruiker vragen naar het chassisnummer (VIN), zodat de varianten kunnen worden vastgelegd, en of `main` (en daarmee GitHub Pages) naar versie 6 mag.
3. Vervolgronde nummers: de niet onderzochte onderdelen, eerst de delen die de gebruiker waarschijnlijk bestelt. Renault-nummers voor het panoramadak op niveau B zodra de catalogus bereikbaar is.
4. ATF-inhoud en -norm uitzoeken (open punt 4).
5. Testen op een echte telefoon en GPU. Grootste onbekende, ook voor de zwaarste stand (alles open) en voor de spikkels op de motorkap.
6. Visuele poort opnieuw op de eindstand, met dezelfde grenzen (plakken van hoogstens 18 beelden, elk beeld een keer, drie beoordelaars of meer, meerderheid per kenmerk).
7. Modelpunten uit de lijst met oude bekende punten, en U19 met de zijkolom voor de telefoon liggend.
8. `/pub.txt` weghalen.

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
- Screenshots: `docs/screenshots`, gemaakt uit de bron van `ff42dbd` (voor golf 4; niet opnieuw gemaakt).
- Het werkplaatshandboek MR 415 (114 MB) en de referentiefoto's staan niet in de repo (rechten van Renault en derden). Alleen korte verwijzingen met paginanummer.

## Vluchtig: scratchpad, weg als container stopt

- Pad: `/tmp/claude-0/-home-user-laguna3/30068ba5-ed5c-5f1b-b200-1ce4840ed639/scratchpad`
- Map `golf4/`: feitenblad `docs-feiten.md`, de volledige premortems `premortem-A.md` en `premortem-B.md`, `feiten-mechanismen.md`, `feiten-panorama.md`, `mr415-feiten.md`, `kennisbasis-gebruiker.md`, de plannen `plan.md` en `plan-v2.md`, en de verificatiegegevens van de nummers in `golf4/verify/`.
- Testuitvoer van de eindstand `g4final2/` en de poortuitslag, voor zover nog aanwezig.
- Referentiefoto's `research/img/`. Niet in repo: rechten derden. Bronlinks staan in de notities.

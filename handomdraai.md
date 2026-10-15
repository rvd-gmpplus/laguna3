# Handomdraai laguna3

Stand 15 okt 2026, 17:20 UTC. Golf 4 (modus Openen, panoramadak, onderdeelnummers, kennisverwerking) is af en staat live als versie 6. Sinds de publicatie om 02:10 UTC is er geen code veranderd.

## Waar

- Repo `rvd-gmpplus/laguna3`, tak `ccr-bd755431-1qfniw`. Code van de eindstand: `3ab6a8d`. `index.html` van versie 6 gebouwd uit die bron in `31a8f0d`; de commits daarna zijn alleen docs.
- PR #1: https://github.com/rvd-gmpplus/laguna3/pull/1 (carrosserieronde). PR #2: https://github.com/rvd-gmpplus/laguna3/pull/2 (golf 4, concept). Geen CI in repo. PR #2 was om 11:09 UTC samenvoegbaar, zonder reviews of opmerkingen; de controlemomenten zijn daarna gestopt.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR, versie 6, gepubliceerd op 15 oktober om 02:10 UTC. Teruggelezen om 02:11 UTC: `index.html` (1.337.555 bytes, md5 `17b21be36108d7ee8531bc232de5c35c`, uit `3ab6a8d`) staat er een keer in, byte voor byte gelijk, alleen het hostskelet eromheen (531 bytes ervoor, 15 erna). De groei ten opzichte van versie 5 (678.887 bytes) komt vooral van `src/partnumbers.js` (565 kB). Het artefact is privé; delen gaat via het menu Delen op de pagina.
- GitHub Pages: https://rvd-gmpplus.github.io/laguna3/, bediend vanaf `main`. `main` staat nog op versie 5. Bijwerken van `main` gebeurt alleen na een ja van de gebruiker.
- De tak `gh-pages` bestond om 17:20 UTC nog op origin. Hij is overbodig; de gebruiker verwijdert hem in GitHub (de proxy weigerde het verwijderen).
- Versie 1 bewaard: `docs/v1/index.html`. Tussenstand golf 1 los: https://claude.ai/artifact/CchXLCsG3x8A4purHXpYRf
- Bouwen: `python3 build.py` plakt `src/*.js` tot `index.html`. Volgorde staat in `ORDER` in `build.py`: core, body, bodyparts, panorama, engine1 tot engine3, drivetrain, chassis, interior, systems, partnumbers, app1, presets, app2. `src/partnumbers.js` is gegevens, gemaakt door `tools/orkestratie/build_pn.py`; niet met de hand bewerken.

## Wat werkt

- Boom (`g4final4`): 3.012 knopen, 499 groepen, 2.513 onderdelen, diepte 8, 659.496 driehoeken (budget 700.000). Aandrijflijn 235.534 (budget 240.000), Carrosserie 187.554 (budget 190.000), Onderstel 110.204, Interieur 77.612. 223 ingesloten knopen.
- Uitklappen werkt als voorheen: klik klapt de eigen groep uit, dubbelklik duikt naar het onderdeel, rechtsklik, Shift+klik en lang drukken klappen in. Explosieschuif, Demonteren en Monteren, Stap terug.
- Modus Openen (segmentknop of toets O): 26 openers, klikregel van buiten naar binnen, sluiten met rechtsklik, Shift+klik of lang drukken, dock met Alles open, Alles dicht en Openers n/26, paneelknop op de geselecteerde opener, zes presets in de categorie Openen. De camera kijkt bij openen in de opening.
- Panoramadak: twee getinte glaspanelen met dwarsbalk, voorste glas kantelt en schuift 0,60 m, zonneschermen met cassette in hemelkleur, luchtgeleider met armpjes, waterafvoer, hemelbekleding met twee openingen, draaiknop in de hemelconsole.
- Onderdeelnummers in het paneel: 546 verkoopeenheden (110 past volgens catalogus, 71 variant, 365 niet gevonden), 1.334 nummers (446 Renault, 888 van 197 andere merken), bewijs A 807, B 436, C 89, D 2, vaste VIN-waarschuwing, bij 14 eenheden het blok Gekozen voor deze auto (volgens de RDW en het chassisnummer van de gebruiker), zoeken op nummer, CSV in `docs/onderdeelnummers.csv`. Onderhoudsinformatie bij 43 paden.
- Kennis uit het rapport van de gebruiker en MR 415 (X91): geen faseversteller op de F4R 811, eindoverbrenging 3,804, aluminium motorkap, capless vulhals, aanhaalmomenten en inhouden. Zie `docs/onderzoek/kennisbasis.md` en `docs/onderzoek/beslissingen.md`.
- 43 presets in 7 categorieën plus rondleiding. Gebundeld: 439 tekenopdrachten gemonteerd, 1.867 zonder, 774 met alles open. Titel linksboven met een doorschijnend vlak, leesbaar bij close-ups.

## Tests

Eindstand `g4final4` op `3ab6a8d`, alles groen: lint ok; smoke zonder consolemeldingen en zonder horizontale scroll; integrity 0 fouten, 0 ankerfouten, 0 presetfouten (124 waarschuwingen, uitklapvector nul); silhouette ok; `ITEST_GATES=1 tools/itest.py` 150 van 150; `ui_inner.py --open` 0 eerste treffers op een ingesloten onderdeel; pubsmoke klaar na 11,6 s (1280 x 800) en 10,1 s (390 x 844); opentest 26 openers zonder fouten (9 uitzonderingen in `tools/open_allow.json`); frametijd p95 3,1 ms bij openAll(1) en 2,2 ms bij openAll(0). Details: [docs/testen.md](docs/testen.md).

Na de nummerronde van golf 5 (alleen `src/partnumbers.js`, `src/app2.js`, `src/head.html`, docs): `build.py --lint` ok; `ITEST_GATES=1 tools/itest.py` 151 van 151 (een controle erbij voor het blok Gekozen voor deze auto; controle 15 en `pnCheck` groen). De andere tests zijn voor die ronde niet opnieuw gedraaid; `index.html` is niet opnieuw gebouwd.

Visuele poort golf 4, drie keer met een herstelronde ertussen (9 beoordelaars, 3 plakken, meerderheid per kenmerk): poort 1 op `0ac1052` 6 ja, 9 deels, 2 nee; poort 2 op `4fc11cd` 10, 7, 0; poort 3 op `3ab6a8d` 10, 7, 0. Na poort 3 gestopt: de spreiding tussen beoordelaars was even groot als de laatste winst.

## Wat nog verbetering verdient

Op volgorde van wat de gebruiker het eerst ziet. Bij elk punt staat wat er mis is, de oorzaak voor zover vastgesteld, en een aanpak. Beeldnummers verwijzen naar `g4gate3/` in het scratchpad (vluchtig).

### Modus Openen, wat de poort op deels liet staan

1. Hoedenplank bij de achterklep (K6, alle drie de beoordelaars; 05, 95, 18, 20, 23). De plank draait goed mee (24 graden, aan twee koordjes), maar de camera van de Achterklep (`look.dir` [0.25, 0.22, -1] in `src/bodyparts.js`) staat laag achter de auto, zodat de opgetilde plank als vlak liggend leest en bij de rugleuningen en de bagagevloer het zicht afdekt. Aanpak: de camera van de achterklep hoger zetten (meer van boven), de hoek van de plank naar 30 tot 35 graden als de zijwanden dat toelaten, of de plank voor de interieuropeners (rugleuningen, bagagevloer) niet mee laten gaan als de klep alleen via `needs` open gaat.
2. Beige staafje in de bagageruimte (05, 95; drie beoordelaars). Geen los deel: met `pick.py` vastgesteld dat het de crèmekleurige zijkant van de Rugbekleding van het grote rugleuningdeel is, op de naad tussen de twee delen, die tegen de donkere achterkant als staafje oogt. Aanpak: de zijvlakken bij de naad in de kleur van de achterkant, of een kleine spleet tussen de delen.
3. Steunstang van de motorkap (K1; 04). Op desktop nauwelijks te zien, op de telefoon wel. Aanpak: stang dikker (de echte is ongeveer 8 mm) en de camera zo dat de stang vrij voor de motorruimte staat.
4. B-stijl in de opening van de voorportieren (K2; 06, 09). Onder de gordellijn leest de opening alsof hij direct op het achterportier eindigt; de B-stijl en de slotbeugel zijn niet als eigen deel te zien. Aanpak: de B-stijl onder de gordellijn een eigen vlak in lak met de slotbeugel geven, of de camera iets meer van voren.
5. Camera's in het interieur (K11): bij het Armsteunkussen (17) kijkt de camera tegen het opgeklapte deksel aan en is het vak niet te zien; bij de Middenarmsteun achter (19) staat de donkere ruit van het open achterportier half voor de armsteun. Aanpak: per opener `look.dir` opnieuw kiezen met een opname per kandidaat; voor 19 eventueel de zijruit achter mee laten zakken (`needs`).
6. Voorruit van binnen (21, 22, 80-alles-open): leest als egaal zwart vlak. Het glasmateriaal is van binnen bijna ondoorzichtig. Aanpak: de voorruit van binnen lichter (minder dekking), of een omgeving achter de ruit; meten wat het kost aan tekentijd.
7. Olievuldop (24): de opgetilde gele dop hangt opzij van de open vulhals (de dop gaat opzij om de rand van de afdekkap te ontwijken; gemeten verplaatsing 0,10 m) en leest als zwevend. Aanpak: kortere zijstap met meer kanteling, of de dop laten scharnieren aan de vulhals.
8. Dakglas (K8 nu ja, maar genoemd): van boven middengrijs en lichter dan de voorruit. Bewust: bij donkerder glas (dekking 0,8) zijn de zonneschermen van buiten niet te zien. Aanpak alleen als de gebruiker het wil: een tussenwaarde rond 0,7.
9. Achterklep met alles open (80-alles-open-rechtsachter): een beoordelaar zag de lichte huid verder naar achteren steken dan het zwarte binnenframe. Niet nagekeken; met `pick.py` controleren of buitenpaneel en binnenpaneel samen draaien.

### Onderdeelnummers

10. Dekking: 1.113 van de 2.513 onderdelen zijn niet onderzocht (vooral interieur, carrosseriedelen en kleine bevestigingsmiddelen) en 751 zijn onderzocht zonder nummer. Aanpak: een vervolgronde in plakken met dezelfde verificatiepoort (opnieuw ophalen, letterlijk op de pagina, lokvogels), te beginnen bij de delen die een eigenaar werkelijk bestelt.
11. Renault-catalogus: partsouq en 7zap zaten achter Cloudflare, de catalogussleutels van partsouq waren verlopen. Daardoor geen B-nummers voor het panoramadak (twee D-nummers uit advertenties) en weinig Renault-nummers voor carrosserie en interieur. Aanpak: een nieuwe route vanaf de modelkeuze (BT0H of BT06 met F4R811) zodra de catalogus bereikbaar is, of de gebruiker laat een dealer een lijst op VIN maken.
12. Varianten: 71 verkoopeenheden hebben meer dan een uitvoering (schijfmaten, kant, bak). Voor 14 is de uitvoering gekozen (`VIN_KEUZE` in `build_pn.py`, veld `kz`, blok Gekozen voor deze auto), volgens de RDW en het chassisnummer van de gebruiker: spanrol, geleiderol, dynamo, stuurpomp, aircocompressor, inlaatluchttemperatuursensor, injector, radiateur, intercooler, voorkatalysator, aandrijfas links, remschijf voor, wisserblad achter en wissermotor achter. 57 blijven open. Wat de RDW geeft: eerste toelating 18 februari 2011, benzine 1998 cc 125 kW, EURO 5 A, CO2 201 g/km (`docs/onderzoek/kennisbasis.md`, sectie 14). Open: het motorsuffix. MR 415 geeft Euro 5 alleen bij de F4R 813; de repo en de gebruiker zeggen 811. Het motorplaatje beslist; als het 813 is, moeten de artikelen die in de bron "F4R 811" noemen opnieuw bekeken worden. Voor de rest van de varianten is het typeplaatje op de deurstijl of een uitrustingsblad van een dealer nodig (velgmaat, onderstel, voorruit, xenon, accu). Kenteken en chassisnummer staan niet in de repo.
13. Nieuwe knopen uit de herstelronden: Vulopening (kleppendeksel) en Vulklepring zijn in `build_pn.py` (INHERIT) gekoppeld aan de eenheid van de ouder. Armsteunbekleding, A-stijlbekleding links en rechts, Hoedenplankkoord links en rechts en Plankscharnierpen links en rechts blijven bewust op niet onderzocht: hun ouders hebben geen eenheid (de groepen zijn niet onderzocht) en of ze los of met de ouder geleverd worden is niet vastgesteld. De reden staat als commentaar bij INHERIT. Ook Vulklep (zonder regel) is niet gekoppeld, hoewel de eenheid Vulhals "met klepje" heet; dat vraagt eigen onderzoek.
14. Firecrawl had geen tegoed meer; het onderzoek liep daarna via de Jina-reader en curl. Een vervolgronde met Firecrawl vraagt nieuw tegoed.

### Feiten en model

15. ATF van de automaat: MR 415 noemt ELF MATIC S6, 7,6 l totaal en 3,5 l na aftappen, in een tabel die de AJX noemt; `docs/onderzoek/beslissingen.md` noemt Elfmatic J6. Open punt; uitzoeken welke tabel voor de AJ0 geldt.
16. Hoeken en slagen van de openers zijn geschat uit foto's, het instructieboekje en het werkplaatshandboek; aan de echte auto is niets gemeten. Met de auto van de gebruiker zijn kap, portieren en klep na te meten.
17. Oud en bekend: voorste langsliggers snijden de aandrijfassen; multiriem 1.569 mm tegen 1.795 mm echt; torsiebalk boven de vlakke vloer; de veer achter steekt door de voorrand van de bagagevloer; 84 van de 345 labelankers liggen achter een ander deel; donkere spikkels op de motorkap in het bovenaanzicht (vermoedelijk software-rasterisatie, niet bewezen).
18. Geen 4Control in het model. Dat was een optie; of de auto van de gebruiker het heeft, is niet vastgesteld.

### Techniek en tests

19. Niet getest op een echte telefoon en GPU. De container meet alleen software-rendering (tekenopdrachten en JavaScript-tijd). Grootste onbekende, ook voor alles open.
20. Paginagrootte: 1,34 MB, waarvan 565 kB nummergegevens. Laadtijd in de container rond 10 s. Als dat op een telefoon tegenvalt: de nummergegevens pas laden als het paneel ze nodig heeft.
21. De hulpmiddelen voor de poort en het narekenen (`gateshots.py`, `pick.py`, `shots.py`, `probe.py`, de poortscripts) staan alleen in het scratchpad en verdwijnen met de container. Aanpak: naar `tools/orkestratie/` halen voor een volgende ronde. De kenmerken van de poort staan hieronder.
22. Niet gebouwd: UX-punt U19 (rest dimmen bij duiken naar een onderdeel) en een zijkolom voor telefoons in liggende stand.
23. S7 uit de carrosserieronde (7 van 9 op `9c731c8`, deels kenmerk 4 en 8) is na golf 4 niet opnieuw gedraaid.
24. Databankenrecht: de CSV bevat alleen nummers en URL's; een juridische toets is niet gedaan.

### Kenmerken van de visuele poort golf 4

Per plak drie beoordelaars, elk beeld een keer bekeken, oordeel ja, deels of nee, meerderheid per kenmerk. Plak a (voorkant en voorportieren): K1 motorkap scharniert aan de achterrand, steunstang houdt hem, motorruimte goed te zien; K2 voorportieren draaien om de voorrand, de opening ziet er af uit; K3 zijruiten zakken in het portier; K4 spiegels klappen naar achteren; K5 olievuldop en expansiedop komen omhoog; K9 geen doorsteken, gaten of zwevende delen; K10 de bediening van Openen is duidelijk, ook op de telefoon. Plak b (achterkant en dak van buiten): K2 achterportieren; K3 zijruiten achter zakken gedeeltelijk; K6 achterklep met gasveren en hoedenplank, bagageruimte te zien; K7 tankklep rechtsachter met capless vulhals; K8 panoramadak van buiten; K9. Plak c (interieur, overzicht, dak van binnen): K11 interieuropeners, te zien door het geopende portier of de klep; K12 alles open leest als Laguna III hatchback; K13 panoramadak van binnen; K9.

## Wat bij de gebruiker ligt

1. Akkoord om `main` naar versie 6 te brengen, zodat GitHub Pages bijwerkt.
2. Het chassisnummer (VIN), voor de 71 varianten.
3. De tak `gh-pages` verwijderen in GitHub.
4. Desgewenst het delen van de handleiding op Google Drive weer uitzetten, en het artefact delen via het menu Delen als anderen het moeten zien.

## Advies, op volgorde

1. Punten 1 tot 7 van de lijst hierboven in een gerichte ronde (camera's, hoedenplank, B-stijl, steunstang, rugleuningnaad, voorruit van binnen), daarna de poort opnieuw met dezelfde kenmerken. Eerst de hulpmiddelen naar de repo halen (punt 21).
2. Na een ja van de gebruiker `main` bijwerken en Pages nakijken.
3. Vervolgronde nummers (punten 10 tot 13), met het VIN als dat er is.
4. ATF uitzoeken (punt 15).
5. Testen op een echte telefoon en GPU (punt 19 en 20).
6. Oude modelpunten (punt 17), U19 en de zijkolom liggend.

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

# Premortem

Voordat het verbeterplan werd uitgevoerd, is het getoetst met een premortem: stel dat het op 20 oktober 2026 is mislukt, werk dan terug naar de oorzaak. Dit document vat die toets samen en laat zien wat er daarna is veranderd. De volledige tekst (autopsie, oordeel, herbouw, tegenstander, struikeldraden) is de bron; hier staat wat een onderhouder moet weten.

## Het plan dat getoetst is

Het verbeterplan voor de explosietekening: een nieuwe carrosserie volgens het gemeten fase 2-silhouet, een motor en automaat tot op het kleinste onderdeel, een nieuw onderstel, interieur en systemen, en een nieuwe bediening. Zeven domeinagents bouwen elk in een eigen worktree, de orkestrator voegt samen en toetst, daarna wordt op dezelfde URL gepubliceerd. Succes was vastgelegd in tien criteria (S1 tot en met S10), allemaal te meten in headless Chromium.

De opdrachtzin van de gebruiker die het hele plan stuurt: "als je een onderdeel aanklikt moet dat uitklappen".

## Twee manieren om dood te gaan

De stille dood: alles werkt, alle criteria zijn groen, en de gebruiker vindt het niet beter dan versie 1 en vraagt opnieuw. De luide dood: de gepubliceerde pagina breekt of hapert op het apparaat van de gebruiker, en versie 1 op dezelfde URL is dan ook weg. De stille is waarschijnlijker, de luide is duurder.

Twee aannames waren niet gegeven en zijn aangenomen. A1: de gebruiker opent de pagina op een laptop en ook op een telefoon (raakt oorzaak 5 en 7). A2: stap 4 begint rond het middaguur van 13 oktober (raakt de uurtijden in oorzaak 4).

## De zeven oorzaken van overlijden

| Rang | Oorzaak | Waarschijnlijkheid | Ernst |
|---|---|---|---|
| 1 | De enkele klik blijft de klik van versie 1: de auto valt in acht hoofdgroepen uiteen en het aangeklikte onderdeel klapt niet uit. Het criterium S3 ("een klik klapt een groep uit die het onderdeel bevat") was ook voor versie 1 waar, en op een aanraakscherm valt de aankondiging bij het aanwijzen weg. | Hoog | Hoog |
| 2 | De carrosserie verandert terwijl interieur, motor en systemen er parallel tegenaan bouwen, en niets meet doorsteken. Het eerste contract (binnenkant kap minimaal 0,93) sloot het gemeten silhouet (buitenkant 0,885 bij z = 1,845) uit. De integriteitscontrole toetste een kader dat ruimer was dan de auto zelf. | Hoog | Middel tot hoog |
| 3 | De carrosserie leest nog steeds niet als een Laguna III. De poort telde of kenmerken aanwezig waren; de gebruiker toetst de gelijkenis aan een bekende, echte auto. De Renault-ruit, kenmerk 5, valt onder het logoverbod. | Middel tot hoog | Hoog |
| 4 | De doorlooptijd loopt uit en de poorten worden het slachtoffer. Vier CPU's geven twee agents per workflow; zeven agents zijn vier rondes; herstelrondes sneuvelen het eerst. | Middel tot hoog | Middel |
| 5 | Het plan slaagt in aantallen, en juist dat maakt de pagina zwaar op een echt apparaat: bij 2.300 meshes in de gemonteerde stand is het budget van 3.000 tekenopdrachten 3,4 keer dat van versie 1 en nooit op hardware getoetst. Elke test roept `finishAll()` aan, dus geen test ziet ooit een animatieframe. | Middel (op A1) | Hoog |
| 6 | Geometriecache-sleutels zijn globaal en hebben geen voorvoegsel. Na het samenvoegen wint het bestand dat eerder in de bouwvolgorde staat, en elk wiel krijgt de stofkap van de dynamo. Geen enkele controle ziet het. | Middel | Middel |
| 7 | De gepubliceerde weg is nooit getest. De testpagina heeft een eigen doctype en viewport; de gepubliceerde pagina laadt three.js van een CDN, wordt door de host ingepakt, en het nieuwe inklapgebaar is een lange druk van 500 ms die op iOS een systeemmenu kan openen. | Laag tot middel (op A1) | Hoog |

Samenloop: oorzaak 4 komt eerst en verergert 2 en 3, omdat de herstelrondes voor die twee als eerste sneuvelen. Oorzaak 1 verergert 5: met een diepere boom en de klik van versie 1 groeit het aantal klikken naar een klein onderdeel van zes naar zeven of acht.

## Oordeel

Fatale fout: het plan bevat twee structurele problemen die geen betere uitvoering oplost.

| | |
|---|---|
| Meest waarschijnlijke mislukking | Oorzaak 1, de klik. Het plan beschrijft het probleem juist en lost het op met een aankondiging en een dubbelklik, waarbij het enkele klikgedrag gelijk blijft. Op touch valt de aankondiging weg. |
| Gevaarlijkste mislukking | Oorzaak 5, de schaal op een echt apparaat. Geen instrument in het plan kan het zien; het verschijnt pas bij de gebruiker en het herstel is een ingreep in de architectuur die niet in een herstelronde past. |
| Verborgen aanname | "Als S1 tot en met S10 groen zijn in headless Chromium, vindt de gebruiker het beter dan versie 1." Het plan had geen enkele meting die van de gebruiker zelf komt. |

De twee structurele problemen: de klikregel (plan §3.1 en S3 definieerden succes als het gedrag dat de opdrachtzin tegenspreekt) en de motorkapregel (twee tegenstrijdige hoogtes in contract en onderzoek).

## Wat de herbouw veranderde

| Nr | Wijziging | Sluit oorzaak |
|---|---|---|
| C1 | Enkele klik klapt de eigen groep van het onderdeel ter plekke uit; `Laag voor laag` wordt een modus en `Groter geheel` (knop en Enter) een gebaar. Zie [ontwerp-en-architectuur.md](ontwerp-en-architectuur.md), "Klikregel". | 1 |
| C2 | Dubbelklik of dubbeltik hergebruikt de pick van de eerste tik. | 1 |
| C3 | S3 herschreven als test: vanuit Gemonteerd beweegt na een klik op Motorkap, Portier linksvoor, Wiel linksvoor en Koplamp links niets buiten de eigen subboom (minder dan 1 mm). | 1 |
| C5 | Kapprofiel per z-station in het contract en de motorbrief. | 2, 3 |
| C6 | Doorsteek- en kapcontrole als fout in `integrity.py`, met gemuteerde proef. | 2 |
| C7 | Numerieke silhouettoets `tools/silhouette.py`; beoordelaar krijgt referentiefoto's ernaast; S7 over negen kenmerken. | 3 |
| C8 | Niet-blokkerend controlemoment met de gebruiker na golf 1: zijaanzicht naast de referentie en twee zinnen over de klikregel. | 1, 3 |
| C9 | Cache-sleutels: botsing in testmodus als consolefout; nieuwe sleutels met voorvoegsel van de eigenaar. | 6 |
| C10 | Knoopvlag `inner`, adaptieve kwaliteit, frametijdmeting zonder `finishAll()`, gemonteerd hoogstens 1.500 tekenopdrachten. | 5 |
| C11 | `tools/pubsmoke.py`, touch-stijlregels, versie 1 bewaard in `docs/v1/index.html`, na publicatie de URL terugkijken. | 7 |
| C12 | Hard tijdkader, elke samengevoegde golf publiceerbaar, hoogstens twee herstelrondes, tussencommits, S2 naar 1.800 onderdelen zonder opvulling. | 4 |
| C13 | Bevattings- en inhoudsregels per anker in `anchors.json`, getoetst in `integrity.py`; `checkPresets()` toetst bevatting. | fase 4 (tegenstander) |
| C4 | Golven in plaats van zeven agents tegelijk: carrosserie, app en motor eerst, dan onderstel, interieur, aandrijving en systemen, dan integratie en herstel. Samenvoegen na elke golf. | 2, 4 |

De golfindeling en de afwijking van de premortem staan in het verbeterplan versie 2.

## De tegenstander

De sterkste kracht tegen succes is de agent die op groen stuurt. Hij heeft geen kwade bedoeling; hij optimaliseert voor wat gemeten wordt. Hij kan een ankernaam op de verkeerde plek hangen (de remklauw onder `Remsysteem` in plaats van in de wielophanging), in een ruim kader blijven, twaalf ringen onder twaalf bouten tellen als twaalf onderdelen, alleen de screenshots tonen die goed uitkomen, en precies de genoemde regel herstellen zonder iets anders aan te raken. De verdedigingen:

- bevattingsregels naast de namen in `anchors.json`, getoetst in `integrity.py`;
- de doorsteek- en kapcontrole in plaats van een ruim kader;
- S2 met de opvulregel (geen groep met meer dan 12 identieke onderdelen die niet ook in werkelijkheid zo vaak voorkomen), met aantallen per domein in de opleverboodschap;
- screenshots die de orkestrator zelf maakt met `shot.py`, een vaste set van zes standpunten per domein;
- na elke herstelronde de volledige testset, niet alleen de gemelde test;
- testbestanden van de orkestrator (`integrity.py`, `pubsmoke.py`, `anchors.json`) zijn voor domeinagents alleen-lezen;
- een opleverboodschap met drie voor-en-na-paren (klik op de motorkap, presetmenu, zijaanzicht) tegen versie 1 als stille concurrent.

## Geaccepteerd, niet gesloten

| Faalwijze | Waarom sluiten meer kost dan de blootstelling |
|---|---|
| Frametijd op een echt apparaat (5) | Er is geen GPU en geen telefoon in de container. Het meetbare deel is gedekt door `inner`, de frametijdmeting en de adaptieve kwaliteit. Gebundeld renderen van gesloten groepen is later toegevoegd en staat standaard aan: de gemonteerde auto heeft daarmee 369 tekenopdrachten, zonder 1.680. De metingen blijven software-rendering en JavaScript-tijd; een echt apparaat is niet gemeten. |
| Gedrag van de webview van de host (7) | Niet te draaien in de container. Stijlregels en `pubsmoke.py` dekken wat statisch toetsbaar is. De gebruiker krijgt het verzoek lang drukken op de telefoon één keer te proberen. |

## Struikeldraden

Een struikeldraad is een meting met een drempel die tijdens de bouw een besluit afdwingt. Elke draad is een testbewering of reviewpoort geworden. De kolom "Status" geeft aan hoe elke draad is afgehandeld; de eindstand van golf 2 is `ead92f6` (gebouwd in `8095a3e`). Na de visuele herstelronde is de volledige testset opnieuw gedraaid op `d6d0456` (gebouwd in `60909fe`): integrity 0 fouten, silhouet 46 van 46, 370 tekenopdrachten gemonteerd, p95 1,1 ms, `ui_inner.py` 0, `pubsmoke.py` OK, itest met poorten 78 van 79 (één randgeval bij de willekeurige tikken op de telefoon, in twee runs gelijk; zie [testen.md](testen.md)). Ook de meting na publicatie is gedaan. Draad 3 en 7 zijn hieronder bijgewerkt tot de eindstand van de carrosserieronde (code `ff42dbd`, testset op `9c731c8`, `index.html` gebouwd in `5b6cefa`).

| Nr | Faalwijze | Meting en drempel | Wat bij overschrijding | Status |
|---|---|---|---|---|
| 1 | Klik blijft de klik van versie 1 | `itest`: na een klik vanuit Gemonteerd op de vier onderdelen meer dan 0 knopen die meer dan 1 mm buiten de eigen subboom verschuiven, of een ander onderdeel na een dubbeltik met 250 ms tussenpoos. Eind app-agent in golf 1, daarna na elke samenvoeging. | App-tak niet samenvoegen; één herwerkronde met voorrang. Faalt hij daarna nog, dan de gebruiker zeggen dat de klik laag voor laag blijft. | Golf 1: geslaagd (itest 71 van 72; de ene fout was een telefoontik die als lang drukken werd gelezen, geen klikregelfout). Eind: de gated itest slaagde met 79 van 79, op `6eca637` en op de eindstand `ead92f6` (de klikcontroles meten 0,000 mm verschuiving buiten de eigen groep, de dubbeltik met 250 ms en de echte dubbelklik kiezen het onderdeel van de eerste klik, er trad geen telefoontikfout meer op sinds gebaren op `event.timeStamp` beslissen). |
| 2 | Vormintegratie | `integrity.py`: één of meer doorsteken buiten de uitzonderingslijst, of kapspeling onder 2,5 cm (sinds golf 2 ook minder dan 0,5 cm onder de laagste kaplaag). Na elke samenvoeging, vóór de volgende golf. | De foutenlijst gaat in de brief van de volgende golf; de eigenaar van het doorstekende onderdeel herstelt in het eigen bestand. | Golf 1: 13 fouten, alle in domeinen van golf 2 (veerpoottoppen, gordelband, zonneklep, binnenspiegel, motorsteun); 0 ankerfouten. Na golf 2: 1 fout (Motorkapsteun raakte de dynamo). Eind (`ead92f6`): 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen. |
| 3 | Carrosserie niet herkenbaar | `silhouette.py`: meer dan 2 stations per reeks buiten tolerantie, of halve breedte bij z = +2,30 boven 0,40, of bij z = −2,30 boven 0,55. | Eén herwerkronde; daarna samenvoegen en zeggen welke aanzichten afwijken. | Golf 1: OK, 46 van 46 stations binnen tolerantie. Eind golf 2: OK, 46 van 46. Visuele poort op de eindbuild van golf 2 (screenshots van `8095a3e` naast referentiefoto's): S7 niet gehaald, 3 van de 9 kenmerken volledig aanwezig. Daarna volgde de carrosserieronde (vier carrosserierondes, in de commits "golf 3") met vijf poorten. De score per poort: poort 1 (`46310ad`) 6 van 9, poort 2 (`34d3469`) 6 van 9, poort 3 (`efaba28`, één beoordelaar) 6 van 9, poort 4 (`ec92a53`, vanaf hier drie onafhankelijke beoordelaars met meerderheid per kenmerk) 6 van 9. Poort 5 op `9c731c8`: 7 van 9, S7 gehaald (ja: 1, 2, 3, 6, 7, 9, 10; deels: 4 en 8; kenmerk 5, de Renault-ruit, telt niet mee). Elke beoordelaar afzonderlijk gaf ook 7 van 9. Deels blijven kenmerk 4 (B-stijl leest op galerijformaat als dunne lijn, chromen raamlijst nauwelijks te zien) en kenmerk 8 (bovenaanzicht evenwijdig zonder heupen). De poortclaim dat het bovenaanzicht een druppelvorm met brede heupen moet hebben, klopt niet: de bovenaanzichttekening is per kolom gemeten en de breedte is van net voor de achteras tot de vooras constant binnen 1 %. Alle drie de beoordelaars noemden de einduitlaten als groot gebrek; die zijn daarna opgelost in `ff42dbd` en in de galerij nagelopen. De poort is daarna niet opnieuw gedraaid, dus 7 van 9 geldt voor `9c731c8`. De silhouettoets bleef OK met 45 van 46 stations (de uitschieter is het raamlijnpunt bij z = −0,155 in de B-stijl, een meetartefact). Controlemoment met de gebruiker: na golf 1 een vergelijkingsbeeld van het zijaanzicht; daarna kwamen meldingen van de gebruiker over de onderkant, die zijn nagelopen en opgelost (zie de eindstand hieronder). |
| 4 | Doorlooptijd | Golf 1 niet samengevoegd en groen binnen 2,5 uur, of een latere golf langer dan 2 uur. Harde stop 8 uur na de start. | Zevenagentenplan stoppen (golf 1) of doelaantallen met een derde verlagen; op 8 uur de laatste groene stand publiceren. | Golf 1 samengevoegd rond 11:30 UTC, binnen de 2,5 uur (de start ligt 8 uur vóór de harde stop van 18:05, dus rond 10:05) en met één rode itest. Golf 2 liep van 14:15 tot 15:10 UTC (55 minuten, grens 2 uur); tussen de golven lag 2 uur 45 voor het controlemoment, het `/compact` van de gebruiker en de briefs, en dat telt voor de harde stop wel mee. De herstelronde liep van 15:17 tot ongeveer 16:45, de eindmeting rond 16:50. De publicatie is op het moment van schrijven niet gedaan; de harde stop is 18:05 UTC. Of doelaantallen zijn verlaagd, is niet vastgelegd. |
| 5 | Schaal op een echt apparaat | Gemonteerd boven 1.500 tekenopdrachten, of p95 van de JavaScript-tijd per frame boven 8 ms over 120 frames van de explosie van `Motor F4Rt` zonder `finishAll()`. | Eerst `inner`-vlaggen in het zwaarste domein, dan segmenten van de twintig zwaarste onderdelen verlagen; blijft het erboven, dan melden dat de pagina op oudere telefoons kan haperen. | Golf 1: 1.052 tekenopdrachten, p95 0,6 ms. Eind: zonder bundelen is de drempel overschreden (1.680 tekenopdrachten); met het standaard aanstaande bundelen zijn het er 369 en is p95 0,7 ms (max 1,9 ms). De voorgeschreven eerste reactie, `inner`-vlaggen, is al in gebruik (256 ingesloten knopen); daarnaast is bundelen toegevoegd in plaats van segmenten te verlagen. De melding dat oudere telefoons kunnen haperen blijft staan in de documentatie. |
| 6 | Globale cache-sleutels | Een botsing van sleutels, gemeld als consolefout in testmodus. | Bouw stopt, de eigenaar hernoemt, geen samenvoeging tot 0. | Golf 1: geen botsingen; de sleutels van `torus`, `ringGear` en `annulus` bevatten nu alle parameters. Eind: geen botsingen; alle testscripts draaien met `__MODEL_CACHECHECK` en meldden geen console-fouten of -waarschuwingen. De lint controleert de sleutelvoorvoegsels niet. |
| 7 | Gepubliceerde weg | `pubsmoke.py`: een fout, `ready` na meer dan 20 s, een ontbrekende stijlregel, of na publicatie een verschil tussen de URL en `index.html`. | Niet publiceren tot groen; bij een verschil na publicatie binnen het uur `docs/v1/index.html` terugpubliceren. | Golf 1: OK. Eind (`ead92f6`): OK, `ready` na 14,8 s op 1280 x 800 en 7,2 s op 390 x 844 (grens 20 s), three r147, geen horizontale scroll. Na publicatie (versie 2, teruggelezen op 13 oktober om 17:00 UTC): de URL bevat `index.html` van `8095a3e` byte voor byte, alleen omgeven door het paginaskelet van de host. Geen verschil, dus geen terugpublicatie. Na de visuele herstelronde (versie 3, teruggelezen om 17:37 UTC): de URL bevat `index.html` van `60909fe` byte voor byte, met hetzelfde paginaskelet; `pubsmoke.py` op `d6d0456`: `ready` na 7,5 s op 1280 x 800 en 7,7 s op 390 x 844. Na de carrosserieronde: versie 4 (teruggelezen, `index.html` uit `ec92a53` in commit `9c03015`, 663.654 bytes) en versie 5 (`index.html` uit `ff42dbd` in commit `5b6cefa`, 678.887 bytes, md5 `649cbf95397d877f6a361600c42a4afd`, gepubliceerd op 14 oktober en teruggelezen om 00:02 UTC). Beide staan er precies één keer en byte voor byte gelijk in, met alleen het skelet van de host eromheen (531 bytes ervoor, 15 erna). `pubsmoke.py` op `9c731c8`: `ready` na 5,2 s en 8,0 s; op `ff42dbd`: OK, `ready` na 12,2 s en 9,9 s onder belasting. Geen verschil, dus geen terugpublicatie. |

Het verloop van de uitvoering per moment: vóór golf 1 de vijf punten van de checklist (groep ter plekke uitklappen met een dichte bovengroep, kapprofiel tegen de motor, gemuteerde proef, `pubsmoke.py` op de basis, tijdkader), eind golf 1 draad 1 en 3, na elke samenvoeging draad 2, 4, 5 en 6, vóór publicatie draad 7. De eerste reactie van de gebruiker op klik en carrosserie (14 oktober) is de eerste herstelopdracht als daarin een van beide genoemd wordt.

## Eindstand na de carrosserieronde

Eindstand van de code is `ff42dbd`. De testset liep op `9c731c8`; `ff42dbd` verandert alleen de eindstukken van de uitlaat, en daarop zijn integrity, `ui_inner.py`, smoke en de publicatierooktest opnieuw groen. `index.html` is gebouwd in `5b6cefa` en staat als versie 5 op dezelfde URL.

- Draad 1 (klik): `ITEST_GATES=1 itest.py` 79 van 79. Het randgeval bij de willekeurige tikken op de telefoon bleek een echte app-fout (een nagekomen muisklik op een label dat onder de vinger was geschoven) en is opgelost in `src/app2.js`; de test is niet veranderd. Zie [testen.md](testen.md).
- Draad 2 (integratie): integrity 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen. `ui_inner.py`: 0 van 253 ingesloten knopen van buitenaf zichtbaar.
- Draad 3 (herkenbaarheid): poort 5 haalt S7 met 7 van 9, op `9c731c8`. Niet opnieuw gedraaid na de uitlaatreparatie.
- Draad 5 (schaal): 390 tekenopdrachten gemonteerd met bundelen (1.726 zonder), p95 1 ms, grens 8 ms. De Aandrijflijn is met 237.310 driehoeken nu binnen het budget van 240.000; de hele auto telt 630.368 driehoeken. Nog steeds alleen in software-rendering gemeten.
- Draad 7 (publicatie): versie 5 teruggelezen en gelijk aan `index.html`.
- Niet gesloten: niet getest op een echte telefoon of GPU; donkere spikkels op de motorkap in het bovenaanzicht (vermoedelijk software-rasterisatie, niet bewezen); 84 van de 345 labelankers liggen achter een ander deel; U19 en de zijkolom voor de telefoon in liggende stand zijn niet gebouwd.

## Premortem golf 4

Voor golf 4 (openmodus, panoramadak, onderdeelnummers en kennisverwerking) liepen twee premortems op het plan. Lens A keek naar de openmodus en het panoramadak, lens B naar de gegevens en het proces. Elke lens had zeven oorzaken, een oordeel, een herbouw, een tegenstander en struikeldraden. De volledige teksten staan in het scratchpad van de bouwsessie (`premortem-A.md` en `premortem-B.md`) en zijn niet in de repo. Hier staat de samenvatting.

### Lens A: openmodus en panoramadak

- Meest waarschijnlijk: de botsingsnorm zonder ondergrens. Een agent met een rode toets en zonder ondergrens verkleint de openingshoek, en het resultaat is groen en onbruikbaar om in te kijken. Gesloten met `open.min` per opener, een asregel (de as ligt aan de scharnierzijde, buiten of op de omtrek) en botsing gemeten als nieuwe overlap ten opzichte van de gesloten stand.
- Gevaarlijkst: de spookbatch, een batch die de gedraaide stand van een opener inbakt. Geen enkele toets zag dat, omdat alle toetsen eerst `batchFlush()` of `finishAll()` aanroepen. Gesloten met batches uit de gebouwde stand en een eigen proef in opentest. De proef vond echt een spookbatch bij een telescoop, opgelost in `a116db9`.
- Overige oorzaken: de klikregel in Openen (een klik op de ruit of spiegel nam de klik van het portier over), volgers en gasveren die in het ouderframe rekenden, vlakken die door een opening voor het eerst van dichtbij te zien zijn, het panoramadak in een dak dat er niet voor gebouwd was, en capaciteit (nummeronderzoek en openmodus op dezelfde vier CPU's).
- Verborgen aanname: de boom die voor het uitklappen is gebouwd, is ook de boom waarin de auto scharniert. Het gevolg zijn vier uitbreidingen: `stay` voor delen aan de carrosseriezijde, `follow` met eigen frame, `strut` met een knoop per eindpunt, en inner-zichtbaarheid per opener.
- Oordeel: overleefbaar met wijzigingen. De herbouw voegde toe: een ondergrens per opener, de klikregel op de buitenste dichte opener, gebaren en stap terug voor Openen, een camera-eindstand met de openstand erin, een blootlegtoets vanuit de kijkhoek, een drempel voor Alles open, een gebogen slag voor het schuifdak (`arc`, `tilt`), een eigen sortering voor het dakglas, `uiBaseRel` op `q0` en de spookbatchproef.

### Lens B: gegevens en proces

- Meest waarschijnlijk: de verificatie verdubbelt elke ophaalactie en raakt achter. De herbouw voegde plakken toe, een tijdkader met een harde stop en een publiceerbare tussenstand, en bewijs per pagina op schijf. Wat niet geverifieerd is, blijft `niet onderzocht`.
- Gevaarlijkst: het label `geverifieerd` op een variant die niet past. Op Autodoc betekent "voor dit voertuig" vier schijfmaten, geen versnellingsbak en geen kant, dus het label zegt de gebruiker iets anders dan de bron. De herbouw gaf elk nummer een status (`past volgens catalogus`, `variant: kies op VIN`, `niet gevonden`, `niet onderzocht`) en een bewijsniveau A tot D, en zette een vaste VIN-waarschuwing boven de sectie.
- Verborgen aanname: de boom van het model is de onderdelenlijst van de auto. De boom is gebouwd voor een explosietekening: sommige knopen zijn schematisch, bouten zijn genummerd om ze uit te klappen en remblokken zijn per stuk gemodelleerd terwijl ze per as worden verkocht. De werkrichting is daarom omgekeerd: van de verkoopeenheid in de catalogus naar de paden, met de rest als `niet onderzocht`.
- Overige oorzaken: een catalogus achter een scraper, criteria die met statuslabels zonder bron te halen zijn, paden die tijdens de nacht verschuiven, een klik in de geopende kofferbak op een onderdeel dat niet getekend wordt, en een systematische kopie van een catalogus in een openbare repository.
- Oordeel: fatale fout in deel C (de omvang en de betekenis van `geverifieerd`), overleefbaar met de herbouw. De herbouw wijkt af van de letterlijke vraag om per onderdeel een nummer te noteren: elk onderdeel heeft een record, maar voor veel onderdelen is dat record `niet onderzocht`.

### Struikeldraden die afgingen

| Draad | Wat er gebeurde |
|---|---|
| B3, een bron valt weg | Het Firecrawl-tegoed raakte op. De bouwsessie stapte over op Jina en curl. De Renault-catalogi (partsouq, 7zap) zaten achter Cloudflare, dus Renault-nummers komen vooral uit OE-lijsten van artikelen van andere fabrikanten. |
| A7, spookbatch | De proef vond een spookbatch bij een telescoop. Hersteld in `a116db9`. |
| A4, frametijd en tekenopdrachten met alles open | De frametijd p95 was 13,8 ms bij `openAll(0)`. Door per object bij te werken is dat 1,4 ms. |
| B5, paden verschuiven | 11 paden waren fout door een schuine streep in de naam "ABS/ESP-unit". Opgelost met een kaart op het volle pad in `src/app2.js` (de app splitst paden niet meer op de schuine streep); de RENAME-lijst in `tools/orkestratie/build_pn.py` dient voor hernoemde knopen. |
| Presets met oude openernamen | Hersteld in `8845351`. |

Controle van de verificatiepoort: de verifieerder kreeg in elk van de vijf hoofdplakken drie lokvogels, verzonnen of verkeerde nummers. Alle 15 zijn afgewezen. De proefronde en de panoramadakplak hadden geen lokvogels.

### Geaccepteerd, niet gesloten

- Geen echte telefoon of GPU in de container. Tekenopdrachten en JavaScript-tijd zijn het meetbare deel.
- De uitrusting van deze auto zonder chassisnummer: varianten worden getoond en niet vastgelegd.
- Databankenrecht: de CSV bevat nummers, bron-URL's en korte Nederlandse aanduidingen van maat of uitvoering; geen productbeschrijvingen, prijzen of foto's (sinds golf 5d ook geen Engelse catalogusattributen of advertentietitels meer). Een juridische toets is niet gedaan.

## Premortem golf 5c-1 (16 oktober 2026, 02:00 UTC)

Eén lens: de app-laag en de tests. Golf 5c-1 is robuustheid, bediening, toegankelijkheid en de tests die daar bij horen (masterplan, golf 5c-1), met twee agents in eigen worktrees: app (bron) en tests (nieuwe controles, `visdiff`, `anchorcheck`, het bevroren testcontract).

- Meest waarschijnlijk: de itest wordt groen gemaakt met vulcontroles of met een `aria-hidden` op het canvas voor axe. Verdediging: elke nieuwe controle noemt de fout uit golf 1 tot 4 die hij gevangen zou hebben, en de toetsenbord-itest is de poort, axe alleen informatie.
- Gevaarlijkst: twee agents in `tools/itest.py` tegelijk; een samenvoeging die een controle stil laat vallen. Verdediging: de app-agent schrijft alleen controle 18 (eigen functies), de test-agent 19 en hoger; de orkestrator voegt samen, telt de controles vóór en na, en draait de strikte set.
- `uiLastFit` centraal (R3) verandert het kadreren bij elke formaatwissel; een regressie zit in een pad dat geen test dekt (telefoon draaien na een duik). Verdediging: de app-agent levert de formaatwisselcontrole bij R3 zelf.
- SRI op de CDN-tags (R5) breekt de pagina als de bytes op jsDelivr afwijken van het npm-pakket, of als de harness de lokale bestanden anders serveert. Verdediging: `pubsmoke` tegen de echte CDN én de harness blijven groen vóór samenvoegen; bij twijfel geen `integrity`.
- Themaknop (U5) en badge (U4) raken de CSS-tokens; donkere modus per preset was al zwak getest. Verdediging: thema-wissel per preset in de itest van de app-agent, screenshots in beide thema's.
- Paginabudget: hulpvenster uit `PRESETS`, toast, badge, printstijl en de synoniemenlijst groeien de pagina. Struikeldraad T4: meer dan 100 kB zonder reden is rood; de agent meldt de groei in het commitbericht.
- Capaciteit: de lijst is langer dan een nacht. Verdediging: prioriteit in de brief (R1b, R2, R3, R4, R5, U2, U4, U5, U6, U7, U10 eerst; U8 en U9 als er tijd is), harde stop, wat niet af is gaat terug in het masterplan.
- Verborgen aanname: de lettertypes van Google zijn als woff2 in te sluiten. Niet waar binnen het paginabudget (vier gewichten, ruwweg 130 kB base64) en niet als losse bestanden (het artefact eist één bestand). Besluit: de Google-link blijft, met `font-display: swap`; vastgelegd als beslispunt voor de gebruiker.

Oordeel: overleefbaar met de verdedigingen hierboven. Struikeldraden: T4 (pagina), T8 (`IGNORE`, `anchors.json`, de testlijst alleen door de orkestrator), en de basislijn van `visdiff` wordt pas na het samenvoegen door de orkestrator gezet.
## Stand na golf 5

Eindstand van de code is `33b2b50`; de testset `g5final3` draaide op die stand en `index.html` van versie 7 is er in `25c3ddf` uit gebouwd. Golf 5 had geen eigen premortem; deze regels geven de stand van de struikeldraden.

- Draad 1 (klik): `ITEST_GATES=1 itest.py` 155 van 155, inclusief vier nieuwe controles voor de telefoon. Zie [testen.md](testen.md).
- Draad 2 (integratie): integrity 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen (uitklapvector nul). `ui_inner.py --open` ok, 223 ingesloten knopen.
- Draad 3 (herkenbaarheid): S7 is opnieuw gedraaid op `8e03e87`: 7 van 9 ja, gehaald. De visuele poort van golf 5 (K1 tot K13, negen beoordelaars, drie poorten) gaf 11 ja, 6 deels, 0 nee; daarna 12, 4, 1 (de nee was K13, door een slechte vaste binnencamera) en tot slot 13, 4, 0 (versie 6: 10, 7, 0). Na poort 3 is gestopt: geen nee en de winst per ronde kleiner dan de spreiding tussen beoordelaars.
- Draad 5 (schaal): 668.020 driehoeken tegen 700.000, 444 tekenopdrachten gemonteerd met bundelen (1.878 zonder) en ongeveer 784 met alle openers open (grens 3.000). Het triangle budget van de Carrosserie is een dunne marge: 189.446 van 190.000, dus 554 driehoeken ruimte. De Aandrijflijn zit op 235.546 van 240.000. Elke volgende wijziging aan de carrosserie moet eerst elders besparen.
- Draad 6 (cache-sleutels): smoke zonder consolemeldingen in testmodus.
- Draad 7 (publicatie): `pubsmoke.py` ok (de telefoon is klaar in 6,5 s). Versie 7 is op 16 oktober 2026 teruggelezen: `index.html` (1.378.969 bytes) staat er precies een keer in, byte voor byte gelijk, met 531 bytes paginaskelet ervoor en 15 erna. `main` staat nog op versie 6.
- Niet gesloten: niet getest op een echte telefoon of GPU (U19 en de zijkolom voor de liggende telefoon zijn in golf 5 gebouwd maar alleen in de container gedraaid); wat poort 3 op deels liet staan (K6, K11 en K9 in de interieurplak); 58 varianten van onderdeelnummers zonder gekozen uitvoering; motorcode 811 of 813 (waarschijnlijk 813).

## Premortem golf 5b-2 (16 oktober 2026)

Voor de start getoetst door een premortem in vijf fasen (autopsie, oordeel, herbouw, tegenstander, struikeldraden), uitgevoerd op Opus; de herbouw is overgenomen als plan. Het volledige verslag stond in het scratchpad van de sessie (`premortem-5b2.md`, vluchtig); hier staat de kern en wat er van is gebleken. Het plan was golf 5b-2 uit het masterplan: zes domeinagents in worktrees, G1 (ruimte in de Carrosserie) eerst, daarna de ontbrekende delen en het tekstcontract, versie 9.

Vier feiten uit de repo weken af van de opdracht en zijn als feit meegenomen: `VERSION` stond op 8 (de golf zet 9, het masterplan zei nog 10), de basislijn van `visdiff` kwam van versie 8 en niet van versie 7, de Fonts-fix `426d6aa` stond alleen op deze tak, en de doorsteekcontrole van `integrity.py` sloeg de Carrosserie over en keek bij andere delen alleen naar het hoogste punt.

### Oordeel

Overleefbaar, mits vijf wijzigingen: (a) een mesh-tegen-mesh-meting en een huidmeting vóór G1 en G5 beginnen, gekalibreerd op het bekende Leidingblok-geval; (b) samenvoegen per tak met een presetlijst vooraf; (c) de reikwijdte terug naar wat binnen twee dagen te meten is; (d) een S7-referentie op de startstand en een item voor kenmerk 4, of het criterium uitdrukkelijk als niet gehaald melden; (e) een vaste basis met de Fonts-fix. Zonder (a) en (b) was de golf in de dure vorm dood.

- Meest waarschijnlijk: S7 blijft op 7. Geen item in de golf mikte op de twee kenmerken die op deels stonden, en het enige exterieuritem (G1) haalt resolutie weg.
- Gevaarlijkst: een doorsteek of ingezakte huid die `integrity.py` niet ziet, of een regressie die meelift op een bedoeld verschil en dan met een vernieuwde basislijn de nieuwe norm wordt. Na publicatie vindt alleen de gebruiker hem.
- Verborgen aanname: "De poort meet wat deze golf kapot kan maken." Waar ze werk deed: in "geen nieuwe doorsteken (integrity 0)", in "visdiff met alleen bedoelde verschillen" en in "K1 tot K13 niet lager". Integrity keek niet binnen de Carrosserie en niet tussen slangen en motordelen; `visdiff` ziet een paar millimeter inzakking op 640 x 400 niet boven de drempel; de K-panels hebben een spreiding die groter is dan de winst per ronde.

### Wat de herbouw veranderde

| Wijziging | Sluit |
|---|---|
| Fase 0 vóór de takken: `hexBolt` en `ENG_PORTS.vacOut` (contract), `VERSION` 9, `mergecheck.py` sluit `core.js` en `body.js` af voor domeineigenaren (eerder telde "eigen" vóór "alleen-lezen") | Orkestrator als enige weg; een domeinagent die `patch()` of `lowSide()` aanpast komt niet meer groen door de controle |
| `clash.py` en `huid.py` (generiek, `meetlib.js`), gekalibreerd op het Leidingblok met de Koude laadluchtslang | Doorsteken buiten `integrity.py` |
| Presetlijst per item vooraf, samenvoegen per tak, een basis op dezelfde machine | Basislijn in één keer vernieuwd |
| G1 eerst; kapdeel en S7 kenmerk 4 in een golf B, alleen onder de 180.000-grens van de Carrosserie | `bodyparts.js` als knelpunt |
| "Schematisch geplaatst" in `d` zonder bron; G9b met beide getallen in `d`; G9d zonder getalclaim | Feiten zonder bron in een golf die tegenstrijdigheden opruimt |
| S7 hoogstens twee runs, de lagere telt, vooraf vastgelegd; K-panels twee keer op B0 gemeten, een kenmerk telt pas als lager als beide na-panels onder het laagste B0-oordeel uitkomen | S7 halen door herhalen; ruis van de panels |
| Uitgesteld naar 5b-3: G5c (behalve het Leidingblok), G8c tot en met G8f, G9e, rest van G9h, `spring()`-parameter, G4c, handomdraai punt 1 en 2 | Te veel eigenaren en contractwijzigingen in twee dagen |

### Struikeldraden en wat er gebeurde

| Draad | Uitkomst |
|---|---|
| 1 S7 zonder item | B0 gaf 7 van 9 (kenmerk 4 en 8 deels). Na golf B, met de chroomlijst langs de B-stijl als item voor kenmerk 4: opnieuw 7 van 9 met 4 en 8 deels. Doel 8 niet gehaald; niet herhaald, zoals vooraf vastgelegd. Kenmerk 8 (bovenaanzicht zonder heupen) had nog steeds geen item. Let op: de S7-prompt zei in B0 en na abusievelijk "fase 1"; het model is fase 2; de vergelijking blijft gelijk. |
| 2 Doorsteek buiten integrity | Afgegaan en gevangen. `clash.py` vond het Leidingblok (-10,5 mm met de Koude laadluchtslang) en de reparatie liep door in golf A. G1: huid hoogstens 1,22 mm van de oude (grens 2 mm), geen nieuwe doordringing. G8c (naafpunt op `TRACK_F`) gaf acht nieuwe doordringingen tot 2,44 mm en is door de orkestrator teruggedraaid. De scharnieren (melding van de gebruiker) hadden 22 doordringingen dicht en 28 open; na golf B 0. |
| 3 Basislijn in één keer | Niet gebeurd: `docs/baseline` is niet vernieuwd. Wel veranderde de maatstaf: `visdiff` liep tegen een eigen basis B0 op de Mac (zie de nieuwe aanname hieronder). Eindpoort: 11 rode beelden, alle in de vooraf opgegeven lijsten (bodyOff, engine, engineAll, psPump, battery, gearbox, gearboxAll, converter, diff, doorLF, interior). |
| 4 `bodyparts.js` | De grens van 180.000 voor de Carrosserie is niet overschreden (188.102 naar 177.291 na golf A), dus golf B ging door; de bijbehorende grens voor de voorschaal van G1 (2.500 driehoeken) is in de feiten van de golf niet apart vastgelegd; huidige stand in [cijfers.md](cijfers.md). |
| 5 Orkestrator | Contractwijzigingen zaten vóór de takken (fase 0), G8e is uitgesteld. Nazorg door de orkestrator na golf A bleef wel nodig: `inner` van de voorportier-botsbalk, de Raambediening linksachter en het Membraan, die bij 400 richtingen of met de kap open van buiten te zien waren. |
| 6 Feiten zonder bron | Afgegaan en afgehandeld: de plek van de sproeiertank staat als "schematisch geplaatst" in `d`; in de nazorg zijn een bedradingsclaim bij de stekker van de sproeierpomp, "versterkt" in het onderstel en de tekst bij de Reservoirdop afgezwakt. |
| 7 Omgeving | Afgegaan, zwaarder dan voorzien. De Fonts-route van `426d6aa` (een leeg antwoord) liet de tekst op een systeemletter terugvallen en `visdiff` week op elk beeld circa 10 procent af; `7609e3e` beantwoordt Fonts nu uit een lokale cache. `shots.py` liep tegen de screenshot-timeout van 30 s bij software-rendering onder belasting. Parallelle sessie: zie hieronder. |

### Wat het plan niet zag

- Software-rendering is niet vergelijkbaar tussen platforms. Op macOS wijkt een beeld circa 2 procent af van `docs/baseline` (Linux-container). In de Linux-VM `lag3-vm` (Apple container, image `explosie-test:1`, Ubuntu 24.04 arm64) is het 33 procent door bredere tekstrendering, en ook tegen de Mac 6 tot 31 procent. De poort "visdiff tegen de basislijn" werd daardoor "visdiff tegen B0 van dezelfde machine", wat een zwakkere poort is: een afwijking die al in B0 zit, is onzichtbaar. `docs/baseline` is bovendien verouderd (een ander aantal onderdelen dan de huidige boom). De Linux-VM draaide wel de functietests (itest 222 van 222, en de opentest die de Membraan-fout vond; de ankerpoort is daar platformgebonden: 351/318/263 tegen 352/319/265 op de Mac).
- De K-panels verschillen onderling op K2 en K9 (B0 tweemaal gemeten: beide 10 ja, 3 deels, 0 nee, maar niet dezelfde kenmerken). De vooraf vastgelegde regel hield de uitkomst eerlijk: een kenmerk telt pas als lager als beide na-panels onder het laagste B0-oordeel uitkomen; dat gebeurde bij geen kenmerk.
- Een parallelle sessie schreef opnieuw naar `main`: `57b4d18` (`app2.js`, `uiPlaceMore` wist de onthouden plek bij verbergen, met een herbouwde `index.html`) kwam op 16 oktober om 17:19 UTC op `origin/main`, na de basis `c2ee58d` van deze tak. Struikeldraad 7 ("nieuwe commit op `origin/main`") is hiermee afgegaan; de tak moet vóór de PR met `main` worden samengevoegd en `index.html` opnieuw worden gebouwd.

### Geaccepteerd, niet gesloten

- S7 blijft 7 (stochastisch panel; meer runs maken het criterium waardeloos). Naar 5b-3 met een item voor kenmerk 8.
- De echte plaats van de sproeiertank is onbekend; "schematisch geplaatst" begrenst de schade. Een meting aan de auto van de gebruiker (Meetlijst in `handomdraai.md`) sluit dit.
- `clash.py` bemonstert op 5 mm en mist een holte binnen een deel; een gat valt dan alleen in de K-panels op.
- Niet gepubliceerd: versie 9 is gebouwd maar wacht op de gebruiker, dus de byte-voor-byte controle van beide kanalen is nog niet gedaan.

### Verwachting voor de volgende golf (5b-3)

Dezelfde vorm: eerst meten (`clash.py` en `huid.py` vooraf op de nieuwe delen, vooral G5c-leidingen met de hoogste kans op een kluwen), dan bouwen, presetlijst per item vooraf. Een contractronde in `core.js` (G8d, G8e, G8f) gaat vóór de takken en met `framework.py export` naar espace5, niet erbij. Eigen basis van de machine voor `visdiff` tot er een Linux-basis is; zie het masterplan.

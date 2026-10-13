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

Een struikeldraad is een meting met een drempel die tijdens de bouw een besluit afdwingt. Elke draad is een testbewering of reviewpoort geworden. De kolom "Status" geeft aan hoe elke draad is afgehandeld; de eindstand van golf 2 is `ead92f6` (gebouwd in `8095a3e`). Na de visuele herstelronde is de volledige testset opnieuw gedraaid op `d6d0456` (gebouwd in `60909fe`): integrity 0 fouten, silhouet 46 van 46, 370 tekenopdrachten gemonteerd, p95 1,1 ms, `ui_inner.py` 0, `pubsmoke.py` OK, itest met poorten 78 van 79 (één randgeval bij de willekeurige tikken op de telefoon, in twee runs gelijk; zie [testen.md](testen.md)). Ook de meting na publicatie is gedaan.

| Nr | Faalwijze | Meting en drempel | Wat bij overschrijding | Status |
|---|---|---|---|---|
| 1 | Klik blijft de klik van versie 1 | `itest`: na een klik vanuit Gemonteerd op de vier onderdelen meer dan 0 knopen die meer dan 1 mm buiten de eigen subboom verschuiven, of een ander onderdeel na een dubbeltik met 250 ms tussenpoos. Eind app-agent in golf 1, daarna na elke samenvoeging. | App-tak niet samenvoegen; één herwerkronde met voorrang. Faalt hij daarna nog, dan de gebruiker zeggen dat de klik laag voor laag blijft. | Golf 1: geslaagd (itest 71 van 72; de ene fout was een telefoontik die als lang drukken werd gelezen, geen klikregelfout). Eind: de gated itest slaagde met 79 van 79, op `6eca637` en op de eindstand `ead92f6` (de klikcontroles meten 0,000 mm verschuiving buiten de eigen groep, de dubbeltik met 250 ms en de echte dubbelklik kiezen het onderdeel van de eerste klik, er trad geen telefoontikfout meer op sinds gebaren op `event.timeStamp` beslissen). |
| 2 | Vormintegratie | `integrity.py`: één of meer doorsteken buiten de uitzonderingslijst, of kapspeling onder 2,5 cm (sinds golf 2 ook minder dan 0,5 cm onder de laagste kaplaag). Na elke samenvoeging, vóór de volgende golf. | De foutenlijst gaat in de brief van de volgende golf; de eigenaar van het doorstekende onderdeel herstelt in het eigen bestand. | Golf 1: 13 fouten, alle in domeinen van golf 2 (veerpoottoppen, gordelband, zonneklep, binnenspiegel, motorsteun); 0 ankerfouten. Na golf 2: 1 fout (Motorkapsteun raakte de dynamo). Eind (`ead92f6`): 0 fouten, 0 ankerfouten, 0 presetfouten, 124 waarschuwingen. |
| 3 | Carrosserie niet herkenbaar | `silhouette.py`: meer dan 2 stations per reeks buiten tolerantie, of halve breedte bij z = +2,30 boven 0,40, of bij z = −2,30 boven 0,55. | Eén herwerkronde; daarna samenvoegen en zeggen welke aanzichten afwijken. | Golf 1: OK, 46 van 46 stations binnen tolerantie. Eind: OK, 46 van 46 stations binnen tolerantie. Visuele poort op de eindbuild (screenshots van `8095a3e` naast referentiefoto's; de carrosserie is daarna niet meer veranderd): S7 niet gehaald, 3 van de 9 kenmerken volledig aanwezig (sterk hellende voorruit met lange motorkap, lage gordellijn met hoge ruiten, tienspaaks velgen in strakke wielkasten); de andere zes deels (fastbackstaart, drie zijruiten met chromen raamlijst, chromen U-rand en mistlampwenkbrauwen, achterlichten, bovenaanzicht, sierlijsten en dorpelstrip). Van voren driekwart is de auto volgens de poort herkenbaar; de achterkant leest te hoekig en te hoog. De omtrek blijft binnen 3 tot 5 cm van de referentie, dus het verschil zit in afronding, staartvorm en ontbrekend chroom. Een nieuwe vorm van dak en staart past niet meer in dit tijdkader en is niet gedaan. Controlemoment met de gebruiker: na golf 1 kreeg de gebruiker een vergelijkingsbeeld van het zijaanzicht (referentie, versie 1, versie 2, gespiegeld) en daarna is golf 2 gestart; een afzonderlijke uitspraak over het silhouet is niet vastgelegd. |
| 4 | Doorlooptijd | Golf 1 niet samengevoegd en groen binnen 2,5 uur, of een latere golf langer dan 2 uur. Harde stop 8 uur na de start. | Zevenagentenplan stoppen (golf 1) of doelaantallen met een derde verlagen; op 8 uur de laatste groene stand publiceren. | Golf 1 samengevoegd rond 11:30 UTC, binnen de 2,5 uur (de start ligt 8 uur vóór de harde stop van 18:05, dus rond 10:05) en met één rode itest. Golf 2 liep van 14:15 tot 15:10 UTC (55 minuten, grens 2 uur); tussen de golven lag 2 uur 45 voor het controlemoment, het `/compact` van de gebruiker en de briefs, en dat telt voor de harde stop wel mee. De herstelronde liep van 15:17 tot ongeveer 16:45, de eindmeting rond 16:50. De publicatie is op het moment van schrijven niet gedaan; de harde stop is 18:05 UTC. Of doelaantallen zijn verlaagd, is niet vastgelegd. |
| 5 | Schaal op een echt apparaat | Gemonteerd boven 1.500 tekenopdrachten, of p95 van de JavaScript-tijd per frame boven 8 ms over 120 frames van de explosie van `Motor F4Rt` zonder `finishAll()`. | Eerst `inner`-vlaggen in het zwaarste domein, dan segmenten van de twintig zwaarste onderdelen verlagen; blijft het erboven, dan melden dat de pagina op oudere telefoons kan haperen. | Golf 1: 1.052 tekenopdrachten, p95 0,6 ms. Eind: zonder bundelen is de drempel overschreden (1.680 tekenopdrachten); met het standaard aanstaande bundelen zijn het er 369 en is p95 0,7 ms (max 1,9 ms). De voorgeschreven eerste reactie, `inner`-vlaggen, is al in gebruik (256 ingesloten knopen); daarnaast is bundelen toegevoegd in plaats van segmenten te verlagen. De melding dat oudere telefoons kunnen haperen blijft staan in de documentatie. |
| 6 | Globale cache-sleutels | Een botsing van sleutels, gemeld als consolefout in testmodus. | Bouw stopt, de eigenaar hernoemt, geen samenvoeging tot 0. | Golf 1: geen botsingen; de sleutels van `torus`, `ringGear` en `annulus` bevatten nu alle parameters. Eind: geen botsingen; alle testscripts draaien met `__LAGUNA_CACHECHECK` en meldden geen console-fouten of -waarschuwingen. De lint controleert de sleutelvoorvoegsels niet. |
| 7 | Gepubliceerde weg | `pubsmoke.py`: een fout, `ready` na meer dan 20 s, een ontbrekende stijlregel, of na publicatie een verschil tussen de URL en `index.html`. | Niet publiceren tot groen; bij een verschil na publicatie binnen het uur `docs/v1/index.html` terugpubliceren. | Golf 1: OK. Eind (`ead92f6`): OK, `ready` na 14,8 s op 1280 x 800 en 7,2 s op 390 x 844 (grens 20 s), three r147, geen horizontale scroll. Na publicatie (versie 2, teruggelezen op 13 oktober om 17:00 UTC): de URL bevat `index.html` van `8095a3e` byte voor byte, alleen omgeven door het paginaskelet van de host. Geen verschil, dus geen terugpublicatie. Na de visuele herstelronde (versie 3, teruggelezen om 17:37 UTC): de URL bevat `index.html` van `60909fe` byte voor byte, met hetzelfde paginaskelet; `pubsmoke.py` op `d6d0456`: `ready` na 7,5 s op 1280 x 800 en 7,7 s op 390 x 844. |

Het verloop van de uitvoering per moment: vóór golf 1 de vijf punten van de checklist (groep ter plekke uitklappen met een dichte bovengroep, kapprofiel tegen de motor, gemuteerde proef, `pubsmoke.py` op de basis, tijdkader), eind golf 1 draad 1 en 3, na elke samenvoeging draad 2, 4, 5 en 6, vóór publicatie draad 7. De eerste reactie van de gebruiker op klik en carrosserie (14 oktober) is de eerste herstelopdracht als daarin een van beide genoemd wordt.

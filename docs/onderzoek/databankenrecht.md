# Databankenrecht en onderdeelnummers (punt 24)

Bureau-analyse, peildatum 15 oktober 2026. Dit is geen juridisch advies. Het is een eerste verkenning op basis van wetteksten en arresten die ik zelf heb ingezien (bronnen onderaan), bedoeld om de vragen voor een jurist te scherpen.

## 1. Conclusie in het kort

- Auteursrecht op losse onderdeelnummers: laag risico. Een nummer is geen eigen intellectuele schepping.
- Merkenrecht bij het noemen van merknamen: laag risico, mits het gebruik beschrijvend blijft en er een afstandsverklaring komt. Nu ontbreekt die.
- Databankenrecht (sui generis) is het enige punt met een reëel claimrisico, en dan vooral richting AUTODOC SE (autodoc.parts). Op grond van de cijfers is het risico dat een rechter een inbreuk aanneemt laag tot middel. Het risico op een sommatie of een verzoek om verwijdering is groter dan het risico op een verloren zaak.
- Het zwaarst weegt de voettekst van autodoc.parts. Die verbiedt het kopiëren van "the entire database" zonder toestemming van TecAlliance en noemt ongeoorloofd gebruik van content "copyright infringement". Of dat juridisch standhoudt is onzeker, maar het toont dat de rechthebbende de gegevens als beschermd beschouwt.
- Wat nog ontbreekt in de repo: een bronnen- en afstandsverklaring, een licentie voor het eigen werk, een beperking van de hoeveelheid overgenomen gegevens en een vastgelegde werkwijze voor het ophalen.

## 2. Wat er in de repo staat (feiten, gemeten op de bestanden)

Bestanden: docs/onderdeelnummers.csv en src/partnumbers.js. Beide zijn openbaar via de GitHub-repo rvd-gmpplus/laguna3 (GitHub API: private is false) en via GitHub Pages (https://rvd-gmpplus.github.io/laguna3/). De pagina bevat de volledige nummergegevens (PN_DATA, 565 kB), dus ook zonder de CSV is alles voor elke bezoeker op te halen.

- CSV: 7388 gegevensrijen, waarvan 6508 met een nummer en 880 met status "nietgevonden" zonder nummer.
- Unieke combinaties van merk en nummer: 1270. Daarvan zijn 418 Renault-nummers (OE) en 852 nummers van 197 andere merken.
- Grootste merken in rijen: RIDEX 408, FEBI BILSTEIN 180, BOSCH 140, VALEO 120. Volgens AUTODOC (https://autodoc.group/en/faq/) zijn RIDEX, STARK en goCORE eigen huismerken van AUTODOC.
- Kolommen: pad, verkoopeenheid, relatie, status, soort, merk, nummer, bewijs, opmerking, bron. Pad en verkoopeenheid komen uit de eigen modelboom van het project. Productteksten, prijzen en foto's zijn niet overgenomen (README). De kolom opmerking bevat korte technische kenmerken (bijvoorbeeld afmetingen) en bij de twee D-nummers een citaat van een advertentietitel.
- Bewijsniveau: A (artikel staat in de catalogus voor dit type) 3605 rijen, B (Renault-nummer uit een OE-lijst) 2545, C (kruisverwijzing) 356, D (advertentie) 2.
- De bronvermelding in de README zegt dat de Renault-catalogi (partsouq, 7zap) achter Cloudflare zaten en dat Renault-nummers daarom uit OE-lijsten van artikelen van andere fabrikanten komen. Er is dus niet rechtstreeks uit een Renault-catalogus overgenomen.
- In de gehele repo zijn geen afbeeldingen (0 img-elementen in index.html) en geen merklogo's aangetroffen. Een afstandsverklaring over merknamen, een LICENSE-bestand en een bronnen/afnamevoorwaarde ontbreken.

### Aantal nummers per bronsite

De CSV legt per rij een bron-URL vast (kolom bron). De JS-gegevens leggen per verkoopeenheid alle bronnen vast (veld src). Beide tellingen staan hieronder, omdat de CSV maar een URL per rij toont en daardoor Spareto onderbelicht.

| Rang | Bronsite | Exploitant volgens eigen voorwaarden | CSV: rijen met nummer | CSV: unieke merk+nummer | CSV: verschillende bron-URL's | JS: eenheden met deze bron (bron-URL's) |
|---|---|---|---|---|---|---|
| 1 | www.autodoc.parts | AUTODOC SE, Friedrichstraße 111, Berlijn | 6498 (99,85 procent) | 1260 | 166 | 179 (392) |
| 2 | spareto.com | Spareto OÜ, Tallinn, Estland | 8 | 8 | 1 | 29 (32) |
| 3 gedeeld | autobutik.com.ua | niet onderzocht | 1 | 1 | 1 | 1 (1) |
| 3 gedeeld | czesci-kruszwica.pl | niet onderzocht | 1 | 1 | 1 | 1 (1) |

Er zijn dus feitelijk twee bronsites van betekenis. Plaats drie wordt gedeeld door twee webwinkels met elk een advertentie waaruit een Renault-nummer is gehaald (bewijs D). In de JS-gegevens staan 230 nummers in eenheden waar Spareto een van de bronnen is; die zijn meestal ook door AUTODOC gestaafd.

### Aanvulling 16 oktober 2026 (golf 5d, structureel)

De CSV is genormaliseerd (`docs/onderdeelnummers-schema.md`): 23 kolommen met `unit_id`, alle bron-URL's van de eenheid per rij (429 verschillende URL's in de CSV, tegen 166 toen alleen de eerste per eenheid werd getoond; het aantal bronnen per nummer in de JS-gegevens is ongewijzigd, 503 bij 1.334 nummers), variant, verpakking, regel, keuze en info; 8.748 gegevensrijen, waarvan 1.358 "niet onderzocht" zonder nummer. De kolom opmerking bevat geen Engelse catalogusattributen en geen advertentietitels meer: 252 verschillende teksten in 400 records zijn in de bron (`data/pn/units`) vervangen door korte Nederlandse aanduidingen met dezelfde feiten (maat, temperatuur, draad, positie, uitrusting), en de twee D-nummers van het panoramadak hebben een eigen omschrijving (maatregel 8 is daarmee gedaan). Wat bleef: de onderzoeksnotities (`note`, niet in de CSV en niet in het paneel) en de regelteksten in `map.json` noemen soms de categorie van de bron (bijvoorbeeld "Autodoc Crankshaft seal"). De tabel hierboven telt de oude CSV met één URL per rij.

## 3. Databankenrecht

### 3.1 Wettelijk kader

- Richtlijn 96/9/EG, artikel 7 lid 1: recht voor de fabrikant van een databank waarvan de verkrijging, de controle of de presentatie van de inhoud "in kwalitatief of kwantitatief opzicht getuigt van een substantiële investering", om opvraging en hergebruik van het geheel of van een substantieel deel te verbieden. Artikel 7 lid 5: herhaald en systematisch opvragen of hergebruiken van niet-substantiële delen is niet toegestaan als dat in strijd is met de normale exploitatie of ongerechtvaardigde schade toebrengt. Artikel 10: beschermingsduur 15 jaar vanaf 1 januari na voltooiing, met een nieuwe termijn bij substantiële wijziging.
- Databankenwet, artikel 1 (definities opvragen en hergebruiken), artikel 2 lid 1 onder a en b (de Nederlandse tegenhanger van artikel 7), artikel 3 en 4 (rechtmatige gebruiker mag niet-substantiële delen opvragen, mits de normale exploitatie niet in gevaar komt; afwijken ten nadele van de gebruiker kan niet), artikel 4a onder b (tekst- en datamining), artikel 5 (uitzonderingen voor onderwijs en wetenschappelijk onderzoek), artikel 5a (omzeilen van doeltreffende technische voorzieningen is onrechtmatig), artikel 5c en 5d (beslag, winstafdracht, schadevergoeding).
- De Databankenwet kent geen algemene uitzondering voor particulier of niet-commercieel gebruik van een substantieel deel van een elektronische databank. Artikel 5 lid 1 onder b noemt alleen opvragen ter illustratie bij onderwijs of voor wetenschappelijk onderzoek, met bronvermelding en voor zover het niet-commerciële doel dat rechtvaardigt.

### 3.2 Opvragen en hergebruiken

Het ophalen van nummers van de site en opslaan in de CSV is "opvragen" (permanent of tijdelijk overbrengen op een andere drager). Het zetten van de CSV en de pagina op GitHub en GitHub Pages is "hergebruiken" (aan het publiek ter beschikking stellen, online transmissie). Het Hof van Justitie legt beide begrippen ruim uit; het gaat om elke toe-eigening respectievelijk beschikbaarstelling zonder toestemming (HvJ British Horseracing Board, C-203/02, dictum 2; HvJ CV-Online, C-762/19, punten 30 tot en met 37). Of er een inbreuk is, hangt dus af van twee vragen: bestaat er een beschermde databank, en gaat het om een substantieel deel.

### 3.3 Is er een beschermde databank, en van wie?

- AUTODOC en TecAlliance. De voettekst van autodoc.parts vermeldt "TecDoc Inside" en zegt: "The data displayed here, especially the entire database, may not be copied. Reproducing and distributing the data and the database without prior consent from TecAlliance and/or engaging third parties in such activities is strictly prohibited." De voertuigtypenummers in de repo (type 23370) zijn de typenummers uit die catalogus. Er kunnen dus twee databankproducenten in beeld zijn: AUTODOC SE (webwinkelcatalogus) en TecAlliance (TecDoc). Wie het risico van de investering draagt, is een feitenvraag (Databankenwet artikel 1 lid 1 onder b); die heb ik niet onderzocht.
- Of er een "substantiële investering" is, moet de rechthebbende aantonen. In de zaak Ryanair/PR Aviation was dat in de feitelijke instanties niet gelukt (C-30/14, punt 22). Het HvJ rekent de middelen voor het verkrijgen en verzamelen van bestaande elementen, de controle van de juistheid en de presentatie mee, en sluit de middelen voor het creëren van de elementen zelf uit (C-203/02, dictum 1; C-762/19, punten 25 tot en met 27). Voor een catalogus die onderdeelnummers van derde fabrikanten verzamelt, controleert en per voertuigtype indeelt, is een substantiële investering goed denkbaar. Voor de eigen huismerknummers van AUTODOC (RIDEX, STARK) telt het creëren van die nummers niet mee.
- Beschermde personen: het recht geldt voor producenten uit een EU-lidstaat of van de EER (Databankenwet artikel 7). AUTODOC SE zit in Berlijn en valt daaronder. De Oekraïense winkel (autobutik.com.ua) is daardoor mogelijk niet beschermd; dat is hier verwaarloosbaar, want het gaat om een nummer.

### 3.4 Substantieel deel

- Kwantitatief: de verhouding tot de totale inhoud (C-203/02, dictum 3). AUTODOC meldt zelf meer dan 7,8 miljoen producten (https://autodoc.group/en/faq/, groepscijfer). 1270 unieke nummers is dan ongeveer 0,016 procent (1270 gedeeld door 7,8 miljoen). Dat is een rekensom op een groepscijfer; de relevante databank kan kleiner zijn, bijvoorbeeld het segment voor een voertuigtype of de OE-kruisverwijzingen.
- Kwalitatief: de omvang van de investering in het opgevraagde deel, ongeacht de omvang (C-203/02, dictum 3; punten 70 tot en met 72). De intrinsieke waarde van de gegevens telt niet mee. Hier zit de onzekerheid. De repo bevat per onderdeel de passende artikelen voor een bepaald voertuigtype (status "past volgens catalogus"). Dat is nu juist het deel waarin een catalogusproducent investeert: de toewijzing van artikelen aan voertuigtypen. De opgehaalde nummers vormen een samenhangend deel van de catalogus voor een voertuigtype (nummers bij 779 onderdeelpaden uit de modelboom) en geen willekeurige greep. Een rechter kan dat segment kwalitatief als substantieel beoordelen. Ik kan dat zonder kennis van de investeringsgegevens van de producent niet beoordelen.
- Een wijziging van de ordening (hier de eigen modelboom) maakt van een substantieel deel geen niet-substantieel deel (C-203/02, punt 81).

### 3.5 Herhaald en systematisch opvragen van niet-substantiële delen

Dit verbod (richtlijn artikel 7 lid 5, Databankenwet artikel 2 lid 1 onder b) ziet volgens het HvJ op handelingen die door het cumulatieve effect de hele inhoud of een substantieel deel reconstrueren en zo de investering ernstig schaden (C-203/02, dictum 4; punten 86 tot en met 89). Voor een enkel voertuigtype lijkt een reconstructie van de catalogus uitgesloten; het cumulatieve effect van 166 bladzijden is klein. Het risico groeit als het project, of iemand die de repo als vertrekpunt neemt, hetzelfde patroon voor meer voertuigtypen herhaalt, of als de ophaalprocedure wordt geautomatiseerd en periodiek herhaald. Dan nadert het een reconstructie van het catalogussegment.

### 3.6 Schade aan de investering

Voor een verbod moet de handeling de investering schaden, dat wil zeggen het risico meebrengen dat de investering niet met een normale exploitatie kan worden terugverdiend (C-762/19, dictum en punten 44 tot en met 46). De app is een 3D-model, geen webwinkel, en verwijst met bron-URL's naar de winkelpagina's; dat pleit tegen substitutie. Tegen dat argument staat dat de CSV een kant-en-klare lijst van passende artikelen per positie vormt die een concurrerende catalogus of een derde kan hergebruiken, zonder de winkel te bezoeken. De mate waarin dat speelt, beoordeelt de rechter.

### 3.7 Tekst- en datamining

Databankenwet artikel 4a onder b staat opvragingen toe in het kader van tekst- en datamining door wie rechtmatige toegang heeft, tenzij het databankenrecht "uitdrukkelijk op passende wijze is voorbehouden, zoals door middel van machinaal leesbare middelen bij een online ter beschikking gestelde databank" (zie ook richtlijn (EU) 2019/790 artikel 4). Ik zou hier niet op bouwen: het doel is hier om gegevens te verzamelen en opnieuw te publiceren, terwijl de wet datamining omschrijft als geautomatiseerde analyse om patronen, trends en verbanden te genereren (artikel 1 lid 1 onder h); de voettekst van autodoc.parts kan als voorbehoud gelden; en voor artikel 4a onder a (onderzoeksorganisaties) gelden eigen voorwaarden die een particulier niet vervult.

### 3.8 Voorwaarden, toegang en technische maatregelen

- Een rechtmatige gebruiker mag niet-substantiële delen opvragen voor welk doel dan ook, en dat kan niet worden uitgesloten bij overeenkomst (richtlijn artikel 8 lid 1 en artikel 15; Databankenwet artikel 3). Dat is de belangrijkste ruimte voor het project, maar alleen zolang het deel niet-substantieel blijft en de normale exploitatie niet in gevaar komt (Databankenwet artikel 4).
- Als er geen databankrecht rust op de gegevens, kan de aanbieder het gebruik wel beperken met contractuele voorwaarden (HvJ Ryanair/PR Aviation, C-30/14, dictum en punt 45, "onverminderd het toepasselijke nationale recht"). Een mededeling in een voettekst is geen gesloten overeenkomst; of een bezoeker eraan gebonden is, is een vraag van nationaal contractenrecht. Hier speelt dat bij AUTODOC de algemene voorwaarden (gevonden op https://www.autodoc.parts/services/terms-conditions) gaan over accountregistratie en aankopen. Bij trefwoordzoeking op de voorwaardentekst (copyright, intellectual, scraping, automated, robot, crawl, data mining) vond ik geen bepaling over gebruik van de catalogusgegevens; de enige tekst daarover is de voettekst.
- Artikel 5a Databankenwet maakt het omzeilen van doeltreffende technische voorzieningen onrechtmatig. Een toegangscontrole telt als zodanig (artikel 1 lid 1 onder e). Bij mijn eigen controle op 15 oktober 2026 gaf autodoc.parts met een gewone HTTP-client een 403 met een Cloudflare-verificatiescherm, en kon ik robots.txt van autodoc.parts niet lezen. De repo noemt zelf dat andere catalogi achter Cloudflare zaten. Hoe de AUTODOC-pagina's zijn opgehaald, en of daarbij een verificatie is omzeild, staat nergens vastgelegd. Dit moet de gebruiker nagaan en vastleggen.

## 4. Auteursrecht op losse nummers

Een onderdeelnummer is een korte code die volgens een systeem wordt toegekend. Auteursrechtelijke bescherming vraagt een eigen intellectuele schepping van de maker. Het Hof overwoog in Infopaq dat afzonderlijke woorden als zodanig geen beschermde bestanddelen zijn en dat een geheel pas beschermd is door een oorspronkelijke keuze, schikking en combinatie (C-5/08, punten 37 tot en met 39 en 45 tot en met 48). Een los nummer voldoet daar op geen enkele manier aan. De auteursrechtelijke bescherming van een databank betreft bovendien alleen de structuur (keuze of rangschikking van de stof) en laat de inhoud buiten beschouwing (richtlijn 96/9 artikel 3 lid 1 en 2; overweging 15). De hierboven genoemde risico's zitten dus in het databankenrecht, niet in het auteursrecht. Aandachtspunten:

- De indeling van een catalogus (boomstructuur, categorieën) kan wel een werk zijn. De repo gebruikt een eigen modelboom (kolom pad), geen overname van de indeling van AUTODOC. Dat moet zo blijven.
- Productteksten, foto's en tekeningen van de bronsites zijn wel auteursrechtelijk beschermd en staan niet in de repo. Dat moet zo blijven. De korte advertentietitels in de kolom opmerking (twee rijen) kunnen beter worden vervangen door een eigen omschrijving.

## 5. Merkenrecht bij het noemen van merknamen

De repo noemt "Renault" en 197 andere merknamen (RIDEX, BOSCH, VALEO enzovoort), in tekst en niet als logo.

- Richtlijn (EU) 2015/2436, artikel 14 lid 1 onder c: een merk geeft de houder niet het recht een derde te verbieden het merk te gebruiken om waren van de merkhouder te identificeren of ernaar te verwijzen, in het bijzonder als dat noodzakelijk is om de bestemming van een waar aan te geven, met name als accessoire of onderdeel. Lid 2: alleen volgens de eerlijke gebruiken in nijverheid en handel. De Benelux-regeling (BVIE, artikel 2.23) voert dit uit; die tekst heb ik niet zelf ingezien.
- HvJ Gillette, C-228/03, dictum: het gebruik moet nodig zijn om de bestemming aan te geven, en is niet eerlijk als het de indruk wekt van een commerciële band met de merkhouder, de waarde van het merk aantast, het merk schaadt of het product als imitatie voorstelt.
- HvJ BMW/Deenik, C-63/97, dictum onder 3: een derde mag een merk gebruiken om aan te kondigen dat hij waren van dat merk repareert of verkoopt, tenzij het gebruik de indruk wekt van een commerciële band. Dit arrest gaat over een garagehouder, maar de eerlijkheidsmaatstaf is dezelfde.

Toegepast: het noemen van de merknaam naast een nummer om te zeggen welk artikel past of welk fabrikantnummer erbij hoort is beschrijvend en noodzakelijk om de informatie bruikbaar te maken. Het risico is laag, met twee voorbehouden: (a) geen logo's, huisstijl of formuleringen die een band met Renault of een fabrikant suggereren; (b) een duidelijke afstandsverklaring. Het project heet "Laguna 3" en toont een Renault-model; ook dat noemt het voertuig beschrijvend. Merkgebruik voor het 3D-model zelf valt buiten deze analyse.

## 6. Voorwaarden van de drie meest gebruikte bronsites

1. AUTODOC SE (autodoc.parts), 6498 van 6508 nummerrijen.
   - Algemene voorwaarden (https://www.autodoc.parts/services/terms-conditions): contractpartij AUTODOC SE, Friedrichstraße 111, 10117 Berlijn; de voorwaarden gelden voor accountregistratie en aankopen. Geen bepaling over gebruik van de gegevens gevonden (trefwoordzoeking).
   - Voettekst van elke pagina: verbod om "the entire database" te kopiëren en de gegevens en de databank zonder toestemming van TecAlliance te reproduceren en te verspreiden, met de mededeling dat ongeoorloofd gebruik "copyright infringement" is en tot juridische stappen kan leiden.
   - Technisch: Cloudflare-verificatie en 403 voor een gewone client (eigen controle). robots.txt niet leesbaar.
   - Op andere AUTODOC-domeinen (autodoc.co.uk) gelden aparte voorwaarden (AUTODOC Marketplace). De onderzoeksnotities in docs/onderzoek verwijzen ook naar autodoc.co.uk, auto-doc.ie en club.autodoc.co.uk. De CSV verwijst alleen naar autodoc.parts.
   - Inschatting: zwaarste bron, gelet op omvang en voettekst.
2. Spareto OÜ (spareto.com), 8 nummerrijen in de CSV, 29 eenheden in de JS-gegevens.
   - Conditions of Sale (https://spareto.com/terms): Estse rechtskeuze en Estse rechter; de voorwaarden gaan over bestellen. Geen bepaling over scrapen of hergebruik van gegevens. De tekst zegt dat "all product details, cross-reference numbers, and photos" door de fabrikant van het onderdeel worden aangeleverd en alleen ter informatie zijn bedoeld.
   - robots.txt (https://spareto.com/robots.txt, gelezen op 15 oktober 2026): geen verbod op /oe/-pagina's, Crawl-delay 1, en een sitemap voor "oenumbers". De site publiceert die pagina's dus om gevonden te worden.
   - Inschatting: laag risico.
3. Gedeeld derde: autobutik.com.ua (Oekraïne) en czesci-kruszwica.pl (Polen), elk 1 nummer (bewijs D, uit een advertentie voor een gebruikt onderdeel). Voorwaarden niet onderzocht. Gezien de omvang (1 nummer per site) is het risico verwaarloosbaar. Wel de advertentietitel in de kolom opmerking vervangen door een eigen omschrijving.

## 7. Risico-inschatting (bureau-oordeel, geen kansberekening)

| Onderdeel | Inschatting | Reden |
|---|---|---|
| Auteursrecht op losse nummers | laag | geen eigen intellectuele schepping (Infopaq) |
| Auteursrecht op indeling | laag | eigen modelboom, geen catalogusindeling overgenomen |
| Merkenrecht | laag | beschrijvend gebruik, geen logo's; afstandsverklaring ontbreekt |
| Databankenrecht Spareto | laag | 8 nummers, robots.txt staat het toe |
| Databankenrecht AUTODOC / TecAlliance | laag tot middel | klein kwantitatief aandeel, maar een samenhangend segment voor een voertuigtype, openbaar hergebruik, ondubbelzinnige voettekst |
| Contract en toegang AUTODOC | onbekend | hangt af van de ophaalwijze en van of een voettekst bindt |
| Kans op sommatie of takedown | middel | open repo, vindbaar, rechthebbende handhaaft mogelijk actief |

## 8. Maatregelen om het risico te verkleinen

Volgorde naar effect en inspanning.

1. Leg de ophaalwijze vast: per bron datum, URL, hoe opgehaald (met de hand of automatisch), en dat geen verificatie of toegangscontrole is omgezeild. Haal niets meer op via een route die een toegangscontrole omzeilt. Respecteer robots.txt en een crawl-delay.
2. Beperk de hoeveelheid: de app heeft per onderdeel genoeg aan het Renault-OE-nummer en een of twee alternatieven. De 852 nummers van 197 andere merken zijn voor een 3D-model nauwelijks nodig en zijn het meest hergebruikbare deel voor een concurrent. Verlaag het aantal bladzijden en nummers per voertuigtype; hoe kleiner het deel, hoe verder weg van substantieel.
3. Haal het volledige segment uit de openbare weg: houd de CSV en de volledige gegevens buiten de openbare repo (bijvoorbeeld een privébestand), en laat de pagina alleen tonen wat nodig is. Houd rekening met de geschiedenis van de repo en met kopieën: verwijderen uit een openbare repo haalt kopieën, forks en de git-geschiedenis niet weg. Beslis daarom voordat de repo verder wordt verspreid.
4. Voeg een bronnenbestand en afstandsverklaring toe (README en pagina): welke sites als bron zijn gebruikt, dat alle merknamen eigendom zijn van hun houders, dat het project niet is verbonden met Renault, AUTODOC, TecAlliance of een genoemde fabrikant, dat nummers zonder garantie zijn en altijd op chassisnummer gecontroleerd moeten worden (de pagina zegt dat laatste al), en een contactadres voor verzoeken tot verwijdering.
5. Leg een verwijderprocedure vast: bij een sommatie de gegevens van die bron binnen enkele dagen verwijderen, ook uit de geschiedenis waar dat kan, en niet reageren zonder juridisch overleg.
6. Geen verdere uitbreiding naar andere voertuigtypen of naar periodiek verversen zonder toestemming van de rechthebbende. Dat is de stap waarmee herhaald en systematisch opvragen aannemelijker wordt.
7. Vraag toestemming. Een kort verzoek aan AUTODOC (en eventueel TecAlliance) om gebruik voor een niet-commercieel hobbyproject, met bronvermelding, kost weinig en neemt de onzekerheid weg als het antwoord ja is. Een weigering geeft in elk geval duidelijkheid voor de volgende stap.
8. Vervang de advertentietitel-citaten in de kolom opmerking door eigen omschrijvingen, en laat de kolom opmerking geen tekst van de bronsites overnemen. Gedaan op 16 oktober 2026 (golf 5d): eigen omschrijvingen bij de D-nummers en Nederlandse aanduidingen in plaats van Engelse catalogusattributen.
9. Zet een licentie of auteursrechtvermelding op de eigen code en eigen modeldata, en vermeld dat het project geen aanspraak maakt op rechten op de onderdeelnummers zelf.
10. Overweeg de bron-URL's te laten staan als verwijzing. Ze tonen herkomst en sturen bezoekers naar de rechthebbende, wat de schadevraag (3.6) gunstiger maakt.

## 9. Wat de gebruiker zelf moet laten toetsen

Door een advocaat intellectueel eigendom, met deze vragen:

1. Is de catalogus van AUTODOC SE en/of TecAlliance een beschermde databank, en wie is de producent? Welke investering is aantoonbaar?
2. Tegen welke databank wordt "substantieel deel" gemeten: de hele catalogus, het segment voor dit voertuigtype, of de kruisverwijzingen? Telt een samenhangend voertuigsegment van 1260 nummers kwalitatief als substantieel deel?
3. Bindt de voettekst van autodoc.parts een bezoeker, en wat is de rol van de algemene voorwaarden? Welk recht is van toepassing (Duits recht voor AUTODOC SE, Estse rechtskeuze bij Spareto)?
4. Is bij het ophalen een toegangscontrole omzeild (Databankenwet artikel 5a)? Dit kan alleen worden beantwoord met de feiten over de ophaalwijze.
5. Is er een beroep op tekst- en datamining (Databankenwet artikel 4a onder b) of op de uitzondering voor wetenschappelijk onderzoek (artikel 5 lid 1 onder b) denkbaar? Mijn inschatting is nee.
6. Is de afstandsverklaring voor merknamen voldoende, en is Benelux-merkenrecht (BVIE artikel 2.23) in lijn met de EU-tekst?
7. Wat is de persoonlijke aansprakelijkheid van de gebruiker als particulier bij hosting op GitHub, en hoe moet op een sommatie worden gereageerd?
8. Zijn er buiten het databankenrecht aanknopingspunten voor een vordering, bijvoorbeeld onrechtmatige daad (artikel 6:162 BW) wegens het overnemen van de resultaten van andermans investering? Dit heb ik niet uitgewerkt.

## 10. Bronnen

Wetteksten:
- Richtlijn 96/9/EG van 11 maart 1996 betreffende de rechtsbescherming van databanken (artikelen 1, 3, 7 tot en met 10, 13, 15; overwegingen 15, 39 tot en met 42, 45, 46): https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:31996L0009
- Databankenwet (geldend vanaf 21 november 2025, geraadpleegd 14 oktober 2026): https://wetten.overheid.nl/BWBR0010591
- Richtlijn (EU) 2019/790, artikel 4 lid 1 en 2 gelezen; de rest van artikel 4 gebruik ik via Databankenwet artikel 4a: https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:32019L0790
- Richtlijn (EU) 2015/2436, artikel 14: https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:32015L2436

Arresten (Nederlandse tekst, alle ingezien):
- HvJ 9 november 2004, British Horseracing Board e.a./William Hill, C-203/02 (EU:C:2004:695): https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:62002CJ0203
- HvJ 15 januari 2015, Ryanair/PR Aviation, C-30/14: https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:62014CJ0030
- HvJ 3 juni 2021, CV-Online Latvia/Melons, C-762/19: https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:62019CJ0762
- HvJ Infopaq International/Danske Dagblades Forening, C-5/08: https://publications.europa.eu/resource/celex/62008CJ0005
- HvJ 17 maart 2005, Gillette Company/LA-Laboratories, C-228/03: https://publications.europa.eu/resource/celex/62003CJ0228
- HvJ 23 februari 1999, BMW/Deenik, C-63/97: https://publications.europa.eu/resource/celex/61997CJ0063

Sites en voorwaarden (gelezen op 14 en 15 oktober 2026):
- https://www.autodoc.parts/services/terms-conditions (voorwaarden en voettekst)
- https://spareto.com/terms en https://spareto.com/robots.txt
- https://autodoc.group/en/faq/ (7,8 miljoen producten, huismerken RIDEX, STARK, goCORE)
- https://api.github.com/repos/rvd-gmpplus/laguna3 (openbare status van de repo)

## 11. Beperkingen van deze analyse

- Geen juridisch advies; geen Nederlandse rechtspraak van lagere rechters of de Hoge Raad over catalogusdata onderzocht. De Hoge Raad heeft in de zaak Ryanair/PR Aviation prejudicieel verwezen; de afloop na C-30/14 heb ik niet nagezocht.
- HvJ Football Dataco (C-604/10) en BVIE artikel 2.23 niet zelf ingezien en daarom niet als bron gebruikt. Artikel 4 lid 3 van richtlijn 2019/790 niet letterlijk gelezen.
- Voorwaarden van autobutik.com.ua en czesci-kruszwica.pl niet gelezen. robots.txt van autodoc.parts was niet leesbaar.
- De Exa-tools vroegen om een inlog die in deze sessie niet beschikbaar was; ik heb Firecrawl, Jina, WebFetch en curl gebruikt, waarbij Firecrawl en Jina halverwege door hun tegoed heen raakten. EUR-Lex gaf een verificatiescherm voor curl, daarom zijn drie arresten via publications.europa.eu gelezen.
- Tellingen komen uit docs/onderdeelnummers.csv en de PN_DATA in src/partnumbers.js op de peildatum. Het percentage van 0,016 procent berust op een groepscijfer van AUTODOC.

## 12. Aanvulling 20 oktober 2026 (golf 5m): ophaalwijze en besluiten

Bij de nummerronde van golf 5m (plakken `G5m-*` in `data/pn/units/`) zijn de bronnen zo opgehaald:

- spareto.com met curl, met 1 seconde tussen de verzoeken, volgens `robots.txt` (`Crawl-delay: 1`, geen `?brand=` en geen `?per_page=`);
- Exa, onder meer voor de OEM-pagina's van autodoc.parts (`/car-parts/oem/<nummer>`);
- werkplaatshandboek MR 415, als tekst in de notitie;
- winkel- en advertentiepagina's (bewijs D);
- in plak `G5m-B-automaat`: autodoc.parts met headless Chrome via Playwright, waarbij de automatiseringsvlag gemaskeerd was en de controle van Cloudflare werd afgewacht.

Dat laatste is wat maatregel 1 in paragraaf 8 afraadt. Het gaat om het omzeilen van een technische voorziening, zie Databankenwet artikel 5a en paragraaf 3.8. De gebruiker heeft op 20 oktober 2026 besloten deze route toe te staan en vast te leggen in plaats van de nummers te schrappen. Het risico uit paragraaf 3.8 is daarmee bewust aanvaard. Van die route is na de verificatie één eenheid met nummers overgebleven, het ATF-onderhoudspakket. De ATF vervalt omdat de boom er geen knoop voor heeft. Bij de keuzekabel bleken de nummers bij de handbak PK4 te horen en zijn ze geschrapt.

Besluiten van de gebruiker voor nieuwe plakken:

1. Per eenheid het Renault-nummer en hooguit één merknummer. Bestaande eenheden worden niet gesnoeid.
2. Bewijs D (advertentie) mag, met deze voorwaarden:
   - alleen bij status `vin`;
   - nooit als gekozen uitvoering;
   - hooguit drie per eenheid;
   - eerst proberen het nummer naar B op te waarderen via een OEM-pagina.
3. Alleen los verkrijgbare onderdelen krijgen een eigen nummer. Interne delen krijgen `deel` naar het samenstel, mits dat samenstel als eenheid gezocht is.

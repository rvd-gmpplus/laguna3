# Onderstel, remmen, wielen, besturing, interieur en uitrusting

Laguna III (X91) fase 2, 5-deurs hatchback, Initiale (Paris), 2.0 16V Turbo F4Rt 125 kW / 170 pk, 6-traps automaat AJ0.
Onderzoek van 13 oktober 2026. Statussen: Bevestigd (officiele bron of twee onafhankelijke bronnen), Aannemelijk (een redelijke bron), Geschat (afgeleid of ingeschat, methode erbij), Niet gevonden.

Bestanden die ik zelf heb gedownload stonden in de map `dl_manual/` van de scratchpad van de bouwsessie (alleen gelezen met pdftotext, nooit uitgevoerd); ze zitten niet in de repo.

## 0. Belangrijkste bevindingen en waarschuwingen

1. **De auto bestaat niet op elke markt.** In Frankrijk zijn bij de facelift (Parijs, oktober 2010) alle benzinemotoren geschrapt behalve de 3.5 V6 coupe, vervangen door een 2.0 16V 140 (M4R, ook E85). De Franse prijslijst van 4 januari 2011 toont voor de hatchback Initiale alleen dCi 150 en dCi 175 BVA6. De Britse brochure van oktober 2011 noemt als benzine alleen de 2.0 140. Autoweek noemt voor Nederland wel "2.0 16V T 170 Initiale, geleverd van oktober 2010 tot juli 2013" (alleen zoekresultaat gezien, de pagina zelf werd door een firewall geblokkeerd). Conclusie: de 2.0T 170 automaat Initiale in fase 2 is een Nederlandse (mogelijk meer exportmarkten) uitvoering. Status: Aannemelijk. Planete Renault noemt daarnaast voor 2013 een 2.0 TCe 180 (F4Rt) met 4Control; dat is een andere versie dan jouw 170 pk.
   - Bronnen: https://fr.wikipedia.org/wiki/Renault_Laguna_III ; https://www.planeterenault.com/UserFiles/files/doc/tarifs2011.pdf ; https://xr793.com/wp-content/uploads/2022/12/2011-Renault-Laguna-UK.pdf ; https://www.autoweek.nl/auto/59118/renault-laguna-2-0-16v-t-170-initiale (zoekresultaat)
2. **4Control is op de Initiale (fase 2) een optie, geen standaard.** Planete Renault: "de serie sur GT 4Control et dorenavant en option sur Initiale". Franse prijslijst 2011: "Chassis 4Control (a 4 roues directrices) (sur Initiale)" 2000 euro, alleen gepubliceerd bij dCi 150 en dCi 175. Of deze exacte benzine-auto 4Control heeft: Niet gevonden. Standaardauto in het model = zonder 4Control; 4Control als schakelbare optie.
3. **Besturing van de F4Rt 811 is hydraulisch met variabele assistentie (riemgedreven pomp), niet de elektro-hydraulische "GEP"** die op 2.0 140 (M4R) en de dCi 130 staat. Renault-persmap 2007. Status: Bevestigd voor "hydraulique variable"; riemaandrijving Aannemelijk.
4. **ABS-ring is geen getande ring.** Wielsnelheidssensoren zijn passief magnetoresistief met magnetisch doel (multipool-codeerring in de lagerafdichting). Het huidige model heeft een getande ring (`ABS-sensorring`). Status: Aannemelijk (Renault-opleidingsdocument voor achter, lagercatalogi "met magnetische ring" voor voor).
5. **Achterschijf is 300 mm, niet 260 mm.** Code gebruikt buitenstraal 0.13 m; officieel 300/11 mm massief, dus straal 0.150 m. Voorschijf 296/26 geventileerd klopt met code (0.148).
6. **AJ0 voor de F4Rt is nu officieel bevestigd**: Renault-persmap augustus 2007 noemt voor "2.0 turbo, F4Rt 811" uitsluitend automaat AJ0, 6 versnellingen, geen handbak (verhoogt de status in `specificaties-en-bronnen.md` van Aannemelijk naar Bevestigd).
7. **Geen massage, geen stoelventilatie** in het Renault-handboek fase 2 (alleen verwarming, 3 standen). Status: Niet gevonden = niet aanwezig voor Laguna III.

## 1. Voorwielophanging

Bron voor typeopgaven: Renault dossier de presse augustus 2007 (https://www.planeterenault.com/UserFiles/files/doc/Laguna3Tech.pdf), tabel "Caracteristiques techniques".

| Onderdeel | Gegeven | Status | Bron |
|---|---|---|---|
| Type | McPherson, onafhankelijk | Bevestigd | Renault-persmap; fastcarcheck |
| Schokdemper | Bitube, behuizing ø50 mm, zuigerstang ø22 mm | Bevestigd | Renault-persmap |
| Stabilisatorstang voor | ø24 mm (alle motoren, ook F4Rt) | Bevestigd | Renault-persmap |
| Rolstijfheid voor F4Rt | 142,3 m.daN/graad | Bevestigd | Renault-persmap |
| Onafgeveerd gewicht | 54,5 kg per zijde (F4Rt) | Bevestigd | Renault-persmap |
| Onderste draagarm | Staal, dwarsarm met bevestiging fuseekogel | Aannemelijk | pieces24.be onderdelenlijst Laguna III ("Materiaal: Staal") |
| Fusee (stuurpen) | Materiaal Niet gevonden; ingeschat nodulair gietijzer | Geschat (gangbaar bij dit segment, niet geverifieerd) | n.v.t. |
| Wiellager | Gesloten naaf-lagereenheid (generatie 2) met ingebouwde magnetische ABS-ring, vast met bouten | Aannemelijk | auto-doc.be/autodoc24.ch lagerlijsten Laguna III ("avec bague ABS magnetique integree", "avec capteur ABS integre") |
| Veerpootlager en topsteun | Rubber-metalen topsteun met axiaal lager; aanslagrubber en stofhoes om de zuigerstang | Aannemelijk | carter-cash/oscaro onderdelenlijsten; Caradisiac noemt de "coupelles" en "biellettes" als bekende ruisbron |
| Subframe voor | Stalen berceau draagt draagarmen, stuurhuis en stabilisator; materiaal Niet gevonden | Geschat | n.v.t. |

**Achteras.** Renault noemt het "essieu souple en H a effet autodirectionnel" en de Britse brochure "H frame": een torsiebalk in H-vorm met twee langsarmen verbonden door een dwarsprofiel (bij Laguna II: "twee langsarmen met een V verbonden op een derde van hun lengte", stabilisator naast de traverse, een enkel scharnierpunt per zijde). Status: Bevestigd voor type, Aannemelijk voor detail (Laguna II-beschrijving van Planete Renault: https://www.planeterenault.com/1-gamme/40-technologie/1090-suspension-arriere-h-laguna-2).
- Aparte schroefveren en aparte bitube dempers, demper ø45 mm, stang ø12,5 mm. Bevestigd (Renault-persmap).
- Stabilisatordiameter achter F4Rt: 29,6 mm. Rolstijfheid 119,0 / 127,0 m.daN/graad (leeg / belast). Onafgeveerd 48,25 kg per zijde. Bevestigd.
- Naaf-lagereenheid achter met magnetische ring en sensor. Bij 4Control-auto's geeft de achtersensor ook de draairichting. Aannemelijk.
- Torsiebalk is aan de carrosserie bevestigd met twee rubber-metaallagers (een per langsarm). Aannemelijk (Laguna II-principe).

**4Control (rear-wheel steering).** Details uit het Renault/Dialogys-opleidingsdocument Education Nationale 2017, https://sti.eduscol.education.fr/sites/eduscol.education.fr.sti/files/concours-examens/8627/8627-dossier-ressources-copie.pdf (voor een diesel Laguna III 4Control, maar het chassis is gelijk). Status: Bevestigd voor onderstaande.
- Elektrische actuator (code 1848, brushless motor, 7 kg, max 2800 N, max 50 mm/s) op de achteras, bevestigd aan een elastisch element aan de rechterkant (via "cle forgee") en via een stangetje op een tuimelaar (palonnier) in een boring midden in de achteras.
- Twee spoorstangen (biellettes) naar twee stuurpennen (portes-fusees) met kogelgewricht boven en elastisch scharnier onder.
- Rekenbox 4RD (1663) onder de auto, boven de parkeerrembox (1217). Stuurhoeksensor zit in de module onder het stuur (1519) met wissercontact en lichtschakelaar. ABS/ESP wordt Teves MK60 E3 met extra druksensoren voor "MuSplit+".
- Maximale achterhoek 3 graden 30 minuten tegenfase onder 60 km/h, 2 graden gelijke fase erboven. Specifieke stuurkolom (13,1 : 1 tegen 15 : 1).
- Planete Renault (2013): 4Control komt met dCi 130/150/175, TCe 180 en V6 dCi, niet met EDC.

## 2. Besturing

| Onderdeel | Gegeven | Status | Bron |
|---|---|---|---|
| Stuurinrichting | Tandheugelstuurhuis, hydraulisch, variabele assistentie via elektronica (snelheidsafhankelijk) | Bevestigd | Renault-persmap F4Rt 811 "Hydraulique variable"; Renault-handboek fase 1 "Direction a assistance variable" |
| Aantal stuurslagen | 2,9 tussen de aanslagen | Bevestigd | Renault-persmap |
| Draaicirkel | 11,05 m (stoepranden) / 11,64 m (muren); met 18 inch 11,40 / 12,05 m | Bevestigd | Renault-persmap |
| Pomp | Hydraulische vleugelpomp aangedreven door de hulpriem; aparte olietank met slang naar de pomp | Aannemelijk | Caradisiac-forum (F4R: pomp op hulpriem); toppiecesvoiture.fr (slang "vaas naar pomp"); OEM-pompnr. 491104125R genoemd op renault-laguna.com |
| Spoorstangen | Draadeinde M14x1,5 op het stuurhuis | Aannemelijk | pieces24.be |
| Stuurkolom | Handmatig in hoogte en diepte verstelbaar met hendel; elektrisch kolomslot; tussenas met kruiskoppeling naar het stuurhuis | Bevestigd (verstelling, slot), Geschat (kruiskoppeling) | Renault-handboek fase 2 punt 23; Dialogys-doc (kolomslot 1088) |
| Stuurwiel | Drie-spaaks leder, bestuurdersairbag (twee standen), claxon; cruise/limiter staan op een aparte bediening op het dashboard, audio-afstandsbediening op een steunpaal | Bevestigd (airbag, 3 spaken fase 1 catalogus), Aannemelijk (rest) | Renault-catalogus 2008 (Volant 3 branches avec regulateur); handboek fase 2 |
| Schakelpaddles | Geen. Handmatig schakelen via de keuzehendel (naar links, voor = op, achter = af) | Bevestigd | Renault-handboek fase 2 "Automatic gearbox 2/3" |
| Onder-stuurmodule | Stuurhoeksensor, wisser-/lichtschakelaar en wikkelcontact vormen een niet te scheiden geheel (1519) | Bevestigd | Dialogys-doc |

## 3. Remmen (2.0 turbo 170, F4Rt 811)

Alle waarden uit de Renault-persmap augustus 2007, bevestigd door de Franse brochure 2008 en onderdelenlijsten.

| Onderdeel | Gegeven | Status |
|---|---|---|
| Voorschijf | Geventileerd 296 x 26 mm, 5 gaten, steek 114,3, centreergat 68 mm, hoogte 43,9 mm | Bevestigd (persmap + autodoc24.ch/autopart.tn) |
| Voorremklauw | Zwevende schijfremklauw, een zuiger ø57 mm | Bevestigd (persmap "etrier de frein a disque flottant, diametre piston 57") |
| Achterschijf | Massief 300 x 11 mm | Bevestigd (persmap + brochure 2008). Let op: sommige onderdelenlijsten tonen andere maten voor andere versies |
| Achterremklauw | "Etrier combine" zwevend, zuiger ø38 mm, met ingebouwde parkeerremhefboom (kabelbediend) | Bevestigd voor type en diameter; "combine" opgevat als geintegreerde parkeerrem = Geschat |
| Merk remklauwen | Niet gevonden | Niet gevonden |
| ABS/ESP | Standaard ABS, EBV, AFU (noodremassistent met voorvulling), ESP + CSV (onderstuurcontrole) + ASR; bij 4Control Teves MK60 E3. Hydraulische eenheid Bosch ESP 8.0 volgens onderdelenlijst (0 265 234 129) | Bevestigd (ESP-set), Aannemelijk (Bosch 8.0) |
| Plaats ABS/ESP-eenheid | Motorruimte, aan de passagierskant | Geschat (een forumbericht: "il se trouve cote passager"); het huidige model plaatst hem links bij de hoofdremcilinder |
| Hoofdremcilinder en bekrachtiger | Vacuumbekrachtiger met tandem hoofdremcilinder en reservoir met niveauschakelaar op de cilinder | Geschat (gangbaar, geen bron voor deze auto) |
| Parkeerrem (EPB) | Een centrale gesloten unit onder het vloerpaneel in de buurt van de achteras en de linker demperhitteschild; elektromotor trekt twee stalen kabels naar de achterklauwen. De rekenbox 4RD zit erboven, de FPA-computer heeft code 1217. Nood-ontgrendeling via een kabel met handvat in het reservewielputje in de bagageruimte | Bevestigd (centrale unit onder auto, kabels), Aannemelijk (nood-kabel in kofferbak) |
| EPB-bediening | Schakelaar naast de keuzehendel op de middenconsole; automatisch aan bij motor uit (startknop) en uit bij wegrijden | Bevestigd (handboek fase 2 punt 18 naast hendel 17) |
| Hill start assist (wegrijhulp) | Aanwezig: houdt ongeveer 2 seconden vast | Bevestigd (handboek) |
| Remslangen | Flexibele slang per voorwiel en per achterwiel, holle bout (banjo) aan de klauw | Geschat |
| Slijtage-indicator op voorblokken | Niet gevonden | Niet gevonden |

## 4. Wielen en banden

| Onderdeel | Gegeven | Status | Bron |
|---|---|---|---|
| Velg Initiale fase 2 | 18 inch "Celsium": standaard bij Initiale Lux Pack (UK); op Frans Initiale 18 inch als optie voor 500 euro (standaardmaat daar waarschijnlijk 17 inch) | Bevestigd voor naam en maat | UK-brochure oktober 2011; Franse prijslijst 2011 |
| Fase 1 ter vergelijking | Initiale: 17 inch "Long Beach"; GT: 18 inch Celsium | Bevestigd | Franse brochure 2008 |
| Spaakindeling Celsium | Niet gevonden. Huidig model heeft tien spaken; dat is niet geverifieerd | Niet gevonden | n.v.t. |
| Band | 225/45 R18 (ook 225/45 ZR18 95W op 7,5J x 18, ET 47) | Bevestigd (maat) / Aannemelijk (J en ET) | Renault-persmap (gamma 215/55 R16, 215/50 R17, 225/45 R18); koleso.ee |
| Steekcirkel en centreergat | 5 x 114,3 mm; centreergat 66,1 mm | Bevestigd (steek), Aannemelijk (66,1) | koleso.ee; autojantes.com |
| Wielbouten | 5 per wiel, M14 x 1,5, conische zitting 60 graden, lengte 51 tot 60 mm afhankelijk van velg; sleutelmaat 17 of 19 (bronnen verschillen) | Bevestigd (draad), Niet eenduidig (sleutel) | auto-doc.be, Amazon/partauto listings |
| Bandenspanningssensor (TPMS) | Sensor in het ventiel in elk wiel (niet in het noodwiel), 433 MHz, ontvanger via de UCH; standaard op Initiale | Bevestigd (principe) / Aannemelijk (frequentie, standaard) | Renault-handboek fase 1 "capteur dans la valve de gonflage"; Franse brochure 2008 (serie op Dynamique en hoger); auto-doc.be (HUF/Schrader, OEM 407000435R / 407003743R) |
| Reservewiel | Standaard geen: bandenreparatieset (UK "tyre inflation kit"). Tijdelijk reservewiel 185/65 R16 als optie (90 euro bij Initiale) | Bevestigd | UK-brochure; Franse prijslijst; Renault-persmap |
| Naafdop | Aluminium velgcap met logo; ontwerp Niet gevonden | Niet gevonden | n.v.t. |
| Wielslot | Afsluitbouten met aparte sleutel in boordgereedschap | Aannemelijk | Renault-handboek fase 2 (boordgereedschap: "Allows the wheel bolts to be locked/unlocked") |
| Bandenspanning | 2,3 bar bij 225/45 ZR18 (koleso.ee, Estse bandentabel); de officiele waarde staat op het etiket in de bestuurdersdeur | Aannemelijk | koleso.ee |

## 5. Interieur Initiale (fase 2)

| Onderdeel | Gegeven | Status | Bron |
|---|---|---|---|
| Bekleding | Volledig leder, geperforeerd; de randen en deurpanelen deels "croute de cuir" of imitatieleder; zij-bies later vervangen door stof | Bevestigd (leder geperforeerd), Aannemelijk (randen) | Planete Renault forum Initiale 175; UK-brochure ("Dark Carbon perforated leather") |
| Kleuropties | Beige (Franse prijslijst: "Sellerie Cuir beige (sur Initiale)", 0 euro) of donker (Dark Carbon / "carbone fonce") | Bevestigd | Franse prijslijst 2011; UK-brochure; Franse brochure 2008 (beige clair / carbone fonce) |
| Voorstoelen | Elektrisch: zitting vooruit/achteruit, achterkant omhoog/omlaag, voorkant omhoog/omlaag, rugleuning; lendensteun handmatig met hendel (bestuurder); verwarming 3 standen met thermostaat; geheugen 3 standen voor stoel en buitenspiegels bestuurder, opgeroepen via de kaart of deuropening; passagiersstoel zonder geheugen | Bevestigd | Renault-handboek fase 2 pagina 1.17 tot 1.19; Franse prijslijst |
| Massage, ventilatie | Niet aanwezig | Niet gevonden (handboek noemt ze niet) | |
| Motoren per stoel | Vier verstelmotoren (lengte, achterhoogte, voorhoogte, rugleuning) afgeleid uit de functies; Laguna II-werkplaatsboek noemt er drie | Geschat | handboek fase 2; lagunanotice.com RTA |
| Achterbank | Gesplitst 1/3 en 2/3 neerklapbaar met hendels in de bagageruimte en op de achterbank; middenarmsteun met twee bekerhouders; drie achterhoofdsteunen; ISOFIX op de twee buitenplaatsen | Bevestigd | UK-brochure |
| Dashboard | Gestikt (surpique) dashboardbovenkant; hoge-glans piano-zwarte inzetten op console, deuren en dashboard (fase 1 had hout) | Bevestigd | Planete Renault; UK-brochure; Franse brochure 2008 |
| Navigatie | Carminat TomTom Live, scherm 14 cm, joystick op de middenconsole, bovenop het dashboard in het midden | Bevestigd (scherm, joystick), Aannemelijk (positie) | UK-brochure |
| Audio | Bose met 10 luidsprekers (inclusief middenluidspreker in het dashboard, 10 cm), digitale versterker met 6 kanalen; versterker in de bagageruimte linksachter in een opbergvak | Bevestigd (10, middenluidspreker), Aannemelijk (versterkerplaats) | Planete Renault; UK-brochure; Renault-forums.co.uk; Instagram-post |
| Verdeling luidsprekers | 1 midden dashboard, 2 tweeters voor, 2 deur voor, 2 deur achter, 2 achterplank, 1 extra | Geschat | afgeleid van opbouw; geen bron voor de exacte plaatsen |
| Klimaat | Automatisch tweezone met toxiciteitssensor/automatische recirculatie, koolstof- en geurfilter | Bevestigd | UK-brochure |
| Kaart en startknop | Handsfree Renault-kaart; startknop en kaartlezer. Handboek nummert ze naast de bediening van de stuurverstelling en de bonnetontgrendeling, dus waarschijnlijk links of rechts van de stuurkolom op het dashboard; exacte plek Niet gevonden | Bevestigd (aanwezig), Niet gevonden (positie) | Renault-handboek fase 2 punt 22 |
| Keuzehendel automaat | Klassieke hendel in de console, poort P R N D met ontgrendelknop op de hendel (rempedaal nodig), handmatige stand door naar links te duwen (voor = op, achter = af); indicator in het instrumentenpaneel | Bevestigd | Renault-handboek fase 2 pagina 2.37 |
| Instrumentenpaneel | Analoge wijzers met LCD-informatiedisplay | Aannemelijk | UK-brochure beelden; handboek "display on instrument panel" |
| Sfeerverlichting | Geen. Eigenaar meldt dat de kleine sfeerlamp van Laguna II is verdwenen | Aannemelijk (afwezig) | Planete Renault forum |
| Verlichting | Leeslampjes voor (2), middenlamp achter, instaplampen deuren, voetruimtelampjes voor, lamp onder de voorstoel, bagageruimtelamp, make-upspiegels met licht | Bevestigd | Renault-handboek fase 2; Renault werkplaatsboek inhoud 81B |
| Dak | Elektrisch panoramisch glasdak: twee anti-UV panelen, een beweegbaar (vier standen), een vast; zonnescherm. Optie: 850 euro bij Initiale (Frankrijk) | Bevestigd (optie) | Franse prijslijst 2011; UK-brochure |
| Airbags | Zes: bestuurder (twee standen), passagier (schakelbaar), twee zijairbags voor (thorax/bekken, in de stoel), gordijnairbags voor en achter. Achterste zijairbags "afhankelijk van de uitvoering". Werkplaatsboek noemt ook een "anti-submarining" airbag | Bevestigd (zes), Aannemelijk (rest) | Renault-handboek fase 2; Caradisiac; Renault-werkplaatsboek inhoud 88C |
| Gordels | Voor: drie punts met gordelspanner en kracht-begrenzer, bestuurder dubbele spanner; achter buitenzijde met spanner; drie punts middenachter; gordelslotsensoren | Bevestigd | UK-brochure; Caradisiac (terugroepactie gordelslot bestuurder mei 2010) |
| Handschoenenkastje | Afsluitbaar, groot, filter erachter | Bevestigd | UK-brochure |
| Middenarmsteun | Voor: opbergvak met 12 V aansluiting | Bevestigd | UK-brochure |

## 6. Elektrisch

| Onderdeel | Gegeven | Status | Bron |
|---|---|---|---|
| Accu | In de motorruimte, in een accubak met afdekkap (klemmen), losneembare tussenwand, beugel en ontgassingsslang; lage uitvoering "TB" bij sommige auto's | Bevestigd (motorruimte, onderdelen) | Renault werkplaatsboek MR X91 2009 sectie 80A, F4R-varianten (https://www.scribd.com/document/930704220/titulo-inventado) |
| Accuzijde | Rechtsvoor (passagierszijde bij linkse besturing); bronnen verschillen (een zoekresultaat zegt links) | Geschat | auto-doc.fr (rechts) tegenover auto-doc.fr/changement-batterie-laguna-3-2-0-dci-150 (links); Planete Renault/forum "boite a fusibles moteur cote droit" |
| Accuscheider | Accuafkoppelunit met pyrotechnische klem die de voeding bij een botsing uitschakelt; accubeveiligingszekeringdoos | Bevestigd | Renault werkplaatsboek 80A |
| UPC (beveiligings- en schakeleenheid, 1337) | Zekeringen- en relaisdoos in de motorruimte op een bakje bovenop de accubak | Bevestigd | Renault werkplaatsboek 80A (bak verwijderen vereist UPC eruit); Renault zekeringenschema (Scribd PLATFUSI) |
| Motor-zekering- en relaisdoos | Renault zekeringenschema heeft apart blad "F4R800 - F4R811 engines" voor doos 597 | Bevestigd (bestaat) | zelfde schema |
| UCH (centrale cabine-unit, 645) en hoofdzekeringen binnenin | Onderin het dashboard links (bij linkse besturing), rechts bij rechtse besturing | Bevestigd | Renault zekeringenschema (Scribd): "lower left-hand section of the dashboard on the LHD version" |
| Relaisprint 1615 "motor draait +" | Onder de passagiersstoel | Bevestigd | zelfde schema |
| Relaisprint 1852 verwarming | Midden dashboard, rechts naast de ventilatorunit | Bevestigd | zelfde schema |
| Motorcomputer (ECU) F4Rt | Niet gevonden. (Laguna II: onder de accubak) | Niet gevonden | |
| Claxon | Een of twee hoorns achter de voorbumper; werkplaatsboek heeft hoofdstuk 82B "Horn" | Aannemelijk (bumper), Niet gevonden (aantal) | planeterenault forum, werkplaatsboek-inhoud |
| CAN-netwerk | Injectie, ABS/ESP, klimaat, dashboard, BCM, UCH, airbag, parkeerrem (FPA 1217), GEP stuurpomp, automaat (BVA), 4RD | Bevestigd | Dialogys-doc |

## 7. Brandstof, uitlaat, koeling

| Onderdeel | Gegeven | Status | Bron |
|---|---|---|---|
| Tank | 66 liter (bruikbaar ongeveer 66); plaats onder de achterbank voor de achteras | Bevestigd (inhoud), Geschat (plaats) | Renault-handboek; Renault-persmap; Dialogys-doc (vulpijp, onderbeschermer links) |
| Brandstof | Loodvrije benzine, geen E85 (alleen M4R) | Bevestigd | handboek |
| Uitlaat 2.0T | Drie-weg katalysator achter de turbo, middendemper (425 mm), achterdemper, buisdelen, hitteschilden; twee lambdasondes | Aannemelijk | autodoc-lijsten F4R 811 (middendemper ESR7 425 mm); motorsdb "catalyseur 3 voies" |
| Eindpijpen | Dubbel chroom bij hogere uitvoeringen volgens UK-brochure (niet dCi 110); specifiek voor de 170 Niet gevonden | Aannemelijk dubbel | UK-brochure ("Chrome twin exhausts") |
| Koelpakket | Radiateur, airco-condensor, intercooler (lucht-lucht, inlaat ø57 mm, uitlaat ø47 mm voor 2.0 16V Turbo 170), koelventilator met kap | Aannemelijk | piecesauto.fr intercoolerlijst F4R 811; Renault-handboek ("motoventilateur") |
| Automaat-koeling | Water-olie-warmtewisselaar voor de AJ0-olie | Aannemelijk | autodoc "radiateur d'huile de boite automatique ... refroidi par eau" |
| Aantal ventilatoren | Niet gevonden (een, in handboek enkelvoud) | Niet gevonden | |

## 8. Stuklijsten per gebied (Nederlandse werkplaatstermen, aantallen)

Afkortingen: st = stuks, "per as" = voor en achter apart. Items met * zijn Geschat (representatief, niet individueel gevalideerd).

**Voorwielophanging per zijde (x2 voor links en rechts)**
- Veerpoot: demperhuis ø50 (1), zuigerstang ø22 (1), schroefveer (1), onderste veerschotel (1), bovenste veerschotel (1), aanslagrubber (1), stofhoes (1), topsteun (1), veerpootlager (1), moer (1)
- Fusee (1), wiellager met magnetische ring (1), wielnaaf (1), asmoer (1)
- Draagarm (1), fuseekogel (1), draagarmrubber voor (1), draagarmrubber achter (1)
- Stabilisatorstangetje (1), stabilisatorrubber (1)
- Gemeenschappelijk: subframe (1), stabilisatorstang ø24 (1), stuurhuisbouten*

**Remmen voor per zijde**: remschijf 296 x 26 geventileerd (1), remklauwhuis (1), remklauwdrager (1), zuiger ø57 (1), zuigerafdichting (1), stofhoes zuiger (1), remblokken binnen/buiten (2) elk met rugplaat (2) en wrijfvoering (2), geleidepennen (2) met hoezen (2), ontluchtingsnippel (1) met dopje (1), remslang (1), holle bout (2), rembloksleuven/veren*, wielsnelheidssensor (1)

**Remmen achter per zijde**: remschijf 300 x 11 massief (1), remklauw gecombineerd (1), drager (1), zuiger ø38 (1) met afdichting (1) en stofhoes (1), blokken (2) met rugplaat (2) en voering (2), geleidepennen (2) met hoezen (2), parkeerremhefboom en kabelarm (1), terugstelmechaniek*, ontluchtingsnippel (1), remslang (1), holle bout (2), stofplaat (1), wiellager met magnetische ring (1), naaf (1), sensor (1)

**Remsysteem centraal**: rembekrachtiger (1), hoofdremcilinder (1), reservoir met niveauschakelaar (1), ABS/ESP-modulator met pomp (1), remleidingen (4 sets), remlichtschakelaar*, rempedaal (1)

**Parkeerrem (EPB)**: behuizing (1), elektromotor (1), wormwiel/tandwielreductie (1), printplaat/rekenbox 1217 (1), kabel links (1), kabel rechts (1), kabelhulzen*, noodontgrendelkabel met handvat (1), schakelaar op console (1)

**Achteras per auto**: torsiebalk H (1), rubber lagers (2), schroefveer (2), demper ø45 (2), veerschotels*, aanslagrubbers (2), stofhoezen (2), stabilisator (geintegreerd, 1), stuurpen/flens per zijde (2)

**4Control (optioneel)**: actuator (1), tuimelaar (1), spoorstangen (2), stuurpennen (2) met kogelgewrichten (2) en elastische scharnieren (2), rekenbox (1), speciale stuurkolom (1), draairichting-sensoren achter (2)

**Wiel (x4)**: band 225/45 R18 (1), velg 7,5J x 18 (1), ventiel (1), TPMS-sensor (1), wielbouten M14x1,5 (5), naafdop (1), balanceergewichtjes*

**Besturing**: stuurhuis (1), tandheugel (1), balgen (2), spoorstangen (2), spoorstangeinden (2), contramoeren (2), stuurkolom met kolomslot (1), tussenas met kruiskoppeling (1), stuurwiel (1) met krans en spaken (3), airbagmodule (1), claxonbediening (1), onder-stuurmodule met wissers/licht/wikkelcontact (1), pomp (1), olietank (1), hogedrukslang (1), retourslang (1), verstelhendel (1)

**Stoel voor (x2)**: frame (1), rails (2), verstelmotoren (4*), hendel lendensteun (1, bestuurder), schuimkussen zitting (1) en rug (1), bekleding (1), leder geperforeerd, hoofdsteun (1) met kussen (1) en stangen (2), verwarmingsmat zitting (1) en rug (1), zijairbag (1), gordelslot (1), gordelrolautomaat in B-stijl (1), stoelrailmodule/geheugenmodule*, bedieningsschakelaars (1 set)

**Achterbank**: zitting (1), rugleuning groot (1), rugleuning klein (1), hoofdsteunen (3), gordelrolautomaten (3), gordelsloten (3), ISOFIX-beugels (2), armsteun met twee bekerhouders (1)

**Dashboard en console**: dashboardbekleding (1), dwarsbalk (1), instrumentenpaneel (1), kap (1), navigatiescherm (1), klimaatpaneel (1), luchtroosters (6*), handschoenenkastje (1), passagiersairbag (1), kachelhuis (1), consoletunnel (1), keuzehendel (1) met plaat (1), kaartlezer (1), startknop (1), EPB-schakelaar (1), bekerhouders (2), armsteun (1), joystick Carminat (1), Bose-middenluidspreker (1)

**Bose (10 luidsprekers)**: middenluidspreker (1), tweeters voor (2*), deurluidsprekers voor (2*), deurluidsprekers achter (2*), achterplank (2*), subwoofer of tiende (1*), versterker (1)

**Elektrisch**: accu (1), accubak (1), kap (1), beugel (1), ontgassingsslang (1), afkoppelunit (1), UPC (1), motorzekeringdoos (1), UCH met zekeringkast (1), relaisprint onder stoel (1), motor-ECU (1), claxons (1 of 2)

**Brandstof, uitlaat, koeling**: tank (1), vulpijp (1), tankdop of klepmechaniek (1), brandstofpomp-unit (1); katalysator (1), middendemper (1), achterdemper (1), eindpijpen (2*), hitteschilden (3*), lambdasondes (2*), ophangrubbers (6*); radiateur (1), condensor (1), intercooler (1), ventilator met kap (1), AJ0-oliekoeler (1), slangen*

## 9. Aanbevelingen voor het model

Zie ook de gestructureerde lijst in het antwoord. Kort:
1. Achterschijf buitenstraal 0.130 naar 0.150 m, voorschijf blijft 0.148.
2. ABS-ring als magnetische ring (vlakke band met afwisselende polen) in plaats van getande ring.
3. Voor de klauw: de eenheid ø57 voor, ø38 achter; achter heeft een kabelhefboom op de klauw. De huidige EPB-box klopt in grote lijn.
4. Stuurpomp, olietank en slangen toevoegen (hydraulische besturing). Kolomslot toevoegen.
5. Optionele groep "4Control" (standaard uit) met actuator, tuimelaar, spoorstangen.
6. TPMS-sensor zit aan het ventiel (klopt). Reservewiel weglaten, optioneel noodwiel 185/65 R16.
7. Interieur: stoel krijgt vier motoren, handmatige lendensteunhendel, geen massage/ventilatie. Achterbank 1/3-2/3. Geen sfeerverlichting.
8. Accu met bak, afkoppelunit en UPC in de motorruimte, UCH linksonder in het dashboard.
9. Dubbel uitlaatuiteinde alleen met het label "Aannemelijk".

## 10. Open vragen

- Spaakontwerp en offset van de velg "Celsium" (alleen maat 7,5J x 18, ET 47 uit een enkele bron).
- Plaats van motor-ECU, claxons (aantal) en tankvuldop.
- Of de accu rechts of links staat (tegenstrijdig).
- Exacte plek van startknop en kaartlezer.
- Merk van remklauwen en van de stuurpomp.
- Of deze exacte Initiale Paris een 4Control-optie had.
- Bevestiging van Autoweek-vermelding (pagina geblokkeerd).

## Bronnen

- Renault dossier de presse augustus 2007, technische tabellen: https://www.planeterenault.com/UserFiles/files/doc/Laguna3Tech.pdf
- Renault tarief 2183, 4 januari 2011 (Franse prijslijst): https://www.planeterenault.com/UserFiles/files/doc/tarifs2011.pdf
- Planete Renault, Laguna restylee: https://www.planeterenault.com/1-gamme/1694-anciennes/5058-laguna-restylee-col-2013/
- Renault UK brochure oktober 2011: https://xr793.com/wp-content/uploads/2022/12/2011-Renault-Laguna-UK.pdf
- Renault Franse brochure 2008: https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2008-FR.pdf
- Renault handboek fase 1 (FR): https://www.user-manual.renault.com/sites/renault/files/Laguna_3_Ph1_-_810-7_FRA.pdf
- Renault handboek fase 2 (EN): https://www.user-manual.renault.com/sites/renault/files/Laguna_3_Ph2_-_936-5_ENG.pdf
- Renault zekeringenschema Laguna III (Scribd): https://www.scribd.com/document/722127511/PLATFUSI-Laguna-3-Sigurante
- Renault werkplaatsboek MR X91 2009 (Scribd): https://www.scribd.com/document/930704220/titulo-inventado
- Education Nationale / Dialogys 4Control: https://sti.eduscol.education.fr/sites/eduscol.education.fr.sti/files/concours-examens/8627/8627-dossier-ressources-copie.pdf
- Caradisiac 4Control artikel: https://www.caradisiac.com/renault-laguna-iii-2-0t-gt-4control-2008-2010-un-chassis-surrealiste-des-6-800-eur-199120.htm
- Caradisiac maxi-fiche: https://www.caradisiac.com/Maxi-fiche-fiabilite-que-vaut-la-Renault-Laguna-3-en-occasion-79060.htm
- Wikipedia FR Laguna III: https://fr.wikipedia.org/wiki/Renault_Laguna_III
- Planete Renault forum Initiale: https://www.planeterenault.com/forum/laguna-iii-presentation-renault-laguna-3-dci-175-initiale-t47971.html
- Planete Renault H-achteras (Laguna II): https://www.planeterenault.com/1-gamme/40-technologie/1090-suspension-arriere-h-laguna-2
- Planete Renault EPB: https://www.planeterenault.com/forum/laguna-iii-panne-frein-de-parkig-electrique-regle-t57523.html ; automoto-meca: https://automoto-meca.fr/probleme-frein-a-main-electrique-laguna-3-panne-blocage-boitier
- koleso.ee wielmaten: https://koleso.ee/en/valuveljed/renault/laguna/3919/x91-2007-2010/7912
- Onderdelenlijsten: https://www.auto-doc.be/pieces-detachees/roulement-de-roue-10679/renault/laguna/laguna-iii-bt0-1 ; https://www.auto-doc.fr/pieces-detachees/silencieux-intermediaire-10146/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo ; https://www.piecesauto.fr/marque-automobile/pieces-detachees-renault/laguna-iii-bt0-1/23370/10493/intercooler-echangeur.html ; https://www.pieces24.be/bras-de-suspension/renault/laguna-iii-grandtour-kt0-1 ; https://www.auto-doc.be/pieces-detachees/controle-de-pression-des-pneumatiques-10934/renault/laguna/laguna-iii-bt0-1 ; https://www.autodoc24.ch/pieces-detachees/disque-de-frein-10132/renault/laguna/laguna-coupe-dt0-1
- Autoweek (alleen zoekresultaat): https://www.autoweek.nl/auto/59118/renault-laguna-2-0-16v-t-170-initiale

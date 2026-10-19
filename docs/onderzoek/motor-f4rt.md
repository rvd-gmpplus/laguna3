# Motor F4Rt (Laguna III 2.0 16V Turbo 170, fase 2): onderzoek voor de explosietekening

Onderzoek gedaan op 13 oktober 2026. Doel: een geloofwaardige hiërarchische stuklijst en de fysieke opbouw, zodat de motor "tot het kleinste onderdeel" uit elkaar kan klappen.

Motorcode van de auto van de gebruiker (bijgewerkt op 15 oktober 2026): waarschijnlijk F4Rt 813, zekerheid middel; het motorplaatje beslist. Volgens de RDW is de auto een Renault Laguna hatchback met eerste toelating op 18 februari 2011, 125 kW, EURO 5 A (715/2007*692/2008A), 201 g/km CO2 en 8,7 l/100 km. De RDW-typegoedkeuringsgegevens noemen voor deze uitvoering de motorcode "F4R J8", dezelfde code als bij de Euro 4-uitvoeringen; het driecijferige suffix staat er dus niet in. Het Renault-werkplaatshandboek MR 415 geeft voor de hatchback bij F4R 811 alleen Euro 4 en bij F4R 813 Euro 3, 4 en 5 (beide met automaat AJ0). Omdat de auto Euro 5 is, is de 813 de waarschijnlijkste code. Onderdelencatalogi noemen voor de hele reeks alleen "F4R 811"; ze voegen de suffixen samen en zeggen niets over de Euronorm. Beweringen die een bron alleen voor de 811 noemt (zoals het ontbreken van een faseversteller in de persmap van 2007) blijven staan; voor de 813 zijn ze niet apart bevestigd. De onderbouwing staat in `docs/onderzoek/beslissingen.md`. De bronnen R2 tot en met R46 hieronder noemen steeds de 811 of de reeks F4R 811; de statussen hieronder gelden voor de F4Rt als familie.

## Legenda

Status per gegeven:

- **Bevestigd**: officiële bron, of twee onafhankelijke bronnen die overeenkomen.
- **Aannemelijk**: één redelijke bron, of bevestigd voor de motorfamilie/een zustermotor, nog niet letterlijk voor deze auto.
- **Geschat**: door mij gemeten, afgeleid of ingeschat (de afleiding staat erbij).
- **Niet gevonden**: na gericht zoeken geen bron.
- **[S] schematisch**: de inwendige opbouw van dit onderdeel is generiek voor dit type onderdeel, niet bevestigd voor de F4Rt. Kinderen van een [S]-onderdeel erven die markering.

Bronnen staan als R-nummers; de volledige URL's staan in de bronnenlijst onderaan.

Let op de aard van de bronnen: de Revue Technique-uittreksels (R11 t/m R16) gaan over de F4R 714/715 (atmosferisch, Mégane II) en over de F4R-turbo in de Vel Satis (2002 tot 2009, code F4Rt 763 e.d.), niet over de F4Rt 811 van de Laguna III. Het is dezelfde motorfamilie en dezelfde basis; ik gebruik ze als "Aannemelijk voor de F4Rt" en zeg het erbij. De onderdelencatalogi van Autodoc (R2 e.v.) zijn wel specifiek voor Laguna III met motorcode F4R 811.

---

## 0. Belangrijkste bevindingen en tegenstrijdigheden met bestaande documenten

1. **Motorcode.** Voor deze auto is de code waarschijnlijk **F4Rt 813** (zekerheid middel, zie de alinea bovenaan en `beslissingen.md`). Onderdelencatalogi noemen de reeks "F4R 811" en sommige pagina's daarnaast "F4R 813". Status: Aannemelijk; de catalogusnaam "F4R 811" is Bevestigd (Autodoc R2, R3, R28, R38; Alfi-Turbo R6; Europe Turbo R5; IDF Moteurs R46). De codes **870/872/874/876** horen niet bij de Laguna III 170: 874 is de Mégane III RS 250/265/275, 872 de Mégane III TCe 180, 800 de Laguna III GT 205 (Autodoc "2.0 GT 204 hp F4R 800", R2-familie). 870 komt alleen voor in compatibiliteitslijsten van turbo's (R5), geen toewijzing aan de Laguna III 170 gevonden.
2. **Compressieverhouding: bronnen verschillen.** `docs/specificaties-en-bronnen.md` zegt 9,5 : 1 (fastcarcheck). Dat wordt bevestigd door Encycarpedia, Automoli, Autodata en Vehiclespecs (R36), dus vier bronnen. L'argus (R1) noemt 9,0 : 1 voor dezelfde Laguna III 2.0T 170 automaat (Euro 4). Aanbeveling: 9,5 : 1 houden als hoofdwaarde, 9,0 : 1 in een voetnoot. Status: Bevestigd (9,5), afwijkende bron genoteerd.
3. **Nokkenasverstelling: de huidige bronvermelding is zwak.** Het bestaande document zegt "Faseversteller op de inlaatnokkenas: Bevestigd door meerdere eigenaren" met als bron een Planète Renault-forumpost. Die post (R42) is één vraag van één lid over de Vel Satis (2008) zonder antwoord, en Planète Renault zelf schrijft in het F4Rt-artikel over de Vel Satis dat die motor "zich passeert van een déphaseur d'arbre à cames" (R8). Beter bewijs voor de 811: Autodoc voert voor de Laguna III Coupé **F4Rt 811** een "VVT-magneetventiel voor inlaatkleppen" (R28), en het F4R-handboek (R11) beschrijft de faseversteller op de inlaatnokkenas met een elektroklep op het kleppendeksel. Conclusie: faseversteller op de inlaatnokkenas is **Aannemelijk** voor de 811; "meerdere eigenaren" moet uit het document. Of hij tweestanden (aan/uit) of traploos werkt: **Niet gevonden** voor de 811 (de atmosferische F4R 714 is aan/uit tussen circa 1500 en 4250 tpm, R11; Wikipedia R10 noemt voor de Mégane III RS "2-stage" én "continuously variable", dus tegenstrijdig).
4. **Het bestaande model gebruikt kopstoters (bucket tappets). De F4R heeft rolzwenkarmen met hydraulische speling-opvangers.** R11: "commandées par deux arbres à cames en tête, des butées hydrauliques et des linguets à rouleaux", "pas de réglage, butées hydrauliques". Status: Bevestigd voor de F4R-familie, Aannemelijk voor de F4Rt. Dit raakt 16 klepgroepen in `engine1.js`.
5. **Stuurbekrachtiging is niet riemaangedreven.** De Laguna III heeft een **elektrohydraulische** stuurpomp (aparte elektropomp): L'argus "Assistée électro-hydraulique" (R1), Renault-brochure 2008 "Électro pompe" (R32), forum over lekkend "groupe électropompe" (R33). Dus de multiriem drijft alleen dynamo en aircocompressor aan (kit 7PK1795 met spanner en één geleiderol, R18). Het F4R-handboek (R11) noemt wel een riemaangedreven stuurpomp, maar dat is Mégane II.
6. **Cilindernummering.** Renault telt cilinder, hoofdlager en kruktap 1 vanaf de **vliegwielzijde** (R11: "tourillon n°1 côté volant moteur", "maneton n°1 côté volant"). In `engine1.js` staat cilinder 1 op x = -0,132 (distributiezijde, rechts). Volgens de Renault-conventie moet cilinder 1 bij de versnellingsbak (x = +0,132) zitten. Status: Aannemelijk (conventie bevestigd voor lagers en kruktappen in R11; voor "cilinder 1" zelf afgeleid).
7. **Axiaallager (aanloopringen).** In het model zitten ze bij het middelste hoofdlager. Echt: bij **hoofdlager 2** (tweede vanaf de vliegwielzijde), met "deux cales de chaque côté du palier n°2", dikte 2,30 tot 2,45 mm in stappen van 0,05 (R11). Status: Bevestigd voor F4R, Aannemelijk voor de F4Rt.
8. **Distributiewielen.** Model: 24 en 48 tanden. Riem heeft 126 tanden, spoed 9,525 mm (R17). Met de overbrenging 2 : 1 komen er 19 tanden (krukas) en 38 tanden (nokkenassen) uit (Geschat, zie sectie 5).

---

## 1. Identiteit

| Gegeven | Waarde | Bron | Status |
|---|---|---|---|
| Motorcode Laguna III 2.0T 170 (fase 1 en 2, 2007 tot 2015) | Fase 2 met Euro 5 (deze auto): waarschijnlijk F4Rt 813. Catalogi noemen de reeks "F4R 811"; fase 1 met Euro 4 is de 811 | R2, R3, R5, R6, R46; RDW; MR 415 | Aannemelijk (zekerheid middel); 811 als catalogusnaam Bevestigd |
| Constructeur/type | Renault F-motor ("fonte"), F4R met turbo = F4Rt | R8, R9, R10 | Bevestigd |
| Cilinderinhoud | 1998 cm³ | R1, R8 | Bevestigd |
| Boring × slag | 82,7 × 93,0 mm | R1, R8, R11 | Bevestigd |
| Compressieverhouding | 9,5 : 1 (L'argus: 9,0 : 1) | R36 en R1 | Bevestigd, afwijkende bron genoteerd |
| Vermogen / koppel | 125 kW (170 pk) bij 5000 tpm; 270 Nm (3250 tpm volgens het bestaande document) | R1, `docs/specificaties-en-bronnen.md`; Mitsubishi noemt "F4R M4 125 kW 270 Nm" (R4) | Bevestigd |
| Ontsteekvolgorde | 1-3-4-2 | Standaard voor 4 in lijn, ook in `engine1.js`; niet apart bronnen gevonden voor F4Rt | Aannemelijk |
| Kleppen | 16 (4 per cilinder), 2 bovenliggende nokkenassen (DOHC), kleppen in V-opstelling | R1, R11 | Bevestigd |
| Kleptrein | Rolzwenkarmen ("linguets à rouleaux") met hydraulische speling-opvangers ("butées hydrauliques"), geen speling instellen | R11 (F4R 714/715) | Aannemelijk voor de F4Rt |
| Nokkenasaandrijving | Getande distributieriem, 126 tanden, 27 mm breed, 1200 mm lang, spoed 9,525 mm; drijft ook de waterpomp aan | R17, R31, R11 ("pompe à eau ... entraînée par la courroie de distribution") | Bevestigd |
| Faseversteller | Geen faseversteller (vaste kleptiming). De eerdere vermelding steunde op een catalogusvermelding (R28) en op het handboek van de atmosferische F4R 714 (R11). | Renault-persmap 2007, Planete Renault F4RT | Bevestigd |
| Inspuiting | Meerpunts sequentieel in het inlaatkanaal (indirect), geen directe inspuiting. Injectoren Siemens of Magneti Marelli volgens catalogus | R1, R30; "indirect injection" ook genoemd door gebruikers van de F4Rt (reddit-zoekresultaat) | Bevestigd (multipoint); fabrikant Aannemelijk |
| Ontsteking | Vier losse penbobines ("bobine crayon"), direct op de bougies; bougies M14 × 1,25, 19 mm draad, sleutel 16 mm | R26, R25 | Bevestigd (bobines), Bevestigd (bougiemaat, twee catalogi) |
| Gasklephuis | Elektrisch bediend (drive-by-wire). OE-nummer 8200619046; op de Laguna II fase 2 F4Rt 774/776/784/786 is het een VDO-Siemens huis | R29, R37 | Aannemelijk voor de F4Rt |
| Turbo | **Mitsubishi TD04**, referentie 49377-07303 (ook 49377-0730x/0734x-reeks). Mitsubishi zelf: "49377-07303, TD04, Engine Type F4R M4 125 kW 270 Nm, Customer Renault" | R4 (fabrikant), R5, R6, R7 | Bevestigd (merk, reeks en motor); exacte referentie voor 811 Aannemelijk |
| Turbo-uitvoering | Twin-scroll (dubbele inlaat): spruitstuk met twee gescheiden kanalen (cilinders 1+4 en 2+3), roestvast gietstalen turbinehuis, Nimonic-kleppen | R8 (voor F4Rt Vel Satis), R10 | Aannemelijk voor de F4Rt |
| Waterkoeling van de turbo | Ja, lagerhuis heeft koelwaterslangen ("Durit de refroidissement du turbocompresseur") | R12 (Vel Satis F4Rt) | Aannemelijk voor de F4Rt |
| Maximale laaddruk | Planète Renault noemt "1,8 bar" voor de F4Rt van de Vel Satis (waarschijnlijk absolute druk). Voor de F4Rt geen waarde gevonden. Catalogus-algemeen "0,65 tot 1,1 bar" | R8, R3 | Niet gevonden voor de F4Rt. Geschat: circa 0,8 tot 1,0 bar overdruk |
| Wastegate | Interne wastegate, gestuurd met een drukdoos (pneumatische actuator) via een magneetventiel ("électrovanne de commande de wastegate") | R12 | Aannemelijk |
| Omloop-/blow-offklep | Pneumatische omloopklep via een tweede magneetventiel ("électrovanne - turbocompresseur") met leiding naar de remservo-vacuümzijde | R12 | Aannemelijk; plaats op het compressorhuis niet bevestigd |
| Intercooler | Lucht-lucht, aan de voorzijde van de auto achter de bumper, vóór de radiateur. Inlaat via een slang van de turbo, "côté refroidisseur, entrée" | R24, R44, R34 ("oil filter ... sits behind the intercooler" bij F4Rt 872), R43 | Aannemelijk |
| Motor-ECU-systeem | Niet gevonden voor de F4Rt (Laguna II F4Rt 764: Sagem S2000, 774: Sagem S3000) | R37 | Niet gevonden |
| Blok en kop | Gietijzeren blok (boringen direct in het blok), aluminium kop | R8, R9, R10 | Bevestigd. Let op: het F4R-handboek (R11) zegt op één plek "bloc-cylindres en aluminium" maar twee regels eerder "bloc-cylindres en fonte"; typefout in de bron, andere bronnen zijn eensgezind |
| Olie-inhoud | circa 5,4 liter | Motul-tabel (R39), Automoli (R36) | Aannemelijk (Autodoc geeft 4 l als "capaciteit" in de olietoepassing, waarschijnlijk zonder filter/koeler) |
| Koelvloeistof | circa 7,7 liter | Automoli (R36) | Aannemelijk |
| Thermostaat | begint te openen bij 89 ± 2 graden Celsius, volledig open bij 99 ± 2 graden Celsius | R11 (F4R 714) | Aannemelijk voor de F4Rt |

---

## 2. Inbouw in de Laguna III

Modelassen zoals in het project: x = links(+)/rechts(-) van de auto, y = omhoog, z = voorwaarts(+). "Rechts" is rechts gezien in rijrichting.

| Onderwerp | Bevinding | Bron | Status |
|---|---|---|---|
| Opstelling | Dwars voorin, voorwielaandrijving | R1 ("Transversale Avant") | Bevestigd |
| Distributie- en hulpaandrijving-kant | **Rechterkant** van de auto. Voor de distributieriem wordt het rechter voorwiel eruit gehaald; ook voor de multiriem | R13, R15 (Vel Satis F4R), R11 (waterpomp "côté droit du bloc") | Bevestigd voor F4R in Vel Satis; Aannemelijk voor Laguna III. Past bij de Autodoc-steun "Upper Right" (R27) |
| Versnellingsbak/krukas-vliegwielzijde | **Linkerkant**; de automaat zit aan de vliegwielzijde. Rechter aandrijfas loopt onder de motor door via een tussenas met lager ("palier de transmission") | R16, R12 | Aannemelijk |
| Welke motorzijde wijst naar voren | **Inlaatzijde naar voren** (richting radiateur/bumper), **uitlaatzijde/turbo naar achteren** (schutbord). Aanwijzingen: het oliefilter zit "dead front centre ... behind the intercooler" (F4Rt 872), "at the front of the engine, roughly in the centre" (Mégane II); turbo wordt "par le dessus" gedemonteerd; katalysator zit direct op de turbine en is bereikbaar vanonder samen met de rechter aandrijfas | R34, R35, R12, R16 | Aannemelijk (geen tekst gevonden die het expliciet voor de Laguna III zegt) |
| Plaats van de turbo langs de motor | Laag achter op het blok, uitlaat omlaag naar de voorkat. Welk uiteinde (links/midden/rechts): **Niet gevonden**. Voorkat vraagt demontage van de rechter aandrijfas en de koppelstangsteun, dus de uitlaat zit eerder midden/rechts onder het blok dan links | R16 | Niet gevonden (laterale positie); hoogte/diepte Aannemelijk |
| Turbo-uitlaat | Voorkatalysator rechtstreeks op de turbine (3 moeren), flens naar de uitlaatlijn (3 moeren), 2 zuurstofsondes (voor en na de kat) | R16 | Aannemelijk |
| Aandrijving hulpaggregaten | Dynamo en aircocompressor op de multiriem aan de rechterkant, onderaan het blok (compressor onder, dynamo boven). Automatische spanner met 16 mm sleutel bedienbaar | R15, R11, R18 | Aannemelijk voor posities, Bevestigd voor riemlay-out (alleen deze twee verbruikers, zie sectie 3) |
| Oliefilter | Spin-on filter aan de **voorzijde** van het blok, ongeveer in het midden, achter de intercooler; slecht bereikbaar, olie loopt over de voorkant | R34, R35, R22 (type spin-on) | Aannemelijk |
| Aftapplug | Onder in de carterpan, kop met vierkant 8 (square drain plug socket no. 8) | Autodoc clubgids Laguna III (R45b) | Bevestigd |
| Peilstok | Peilstok met geleidebuis aan de voorzijde van het blok; exacte plaats voor Laguna III **Niet gevonden**; de gele greep zit volgens een foto aan de vliegwielzijde van de afdekkap (links in de auto, op de foto rechts in beeld), in een kom | R41 (Clio F4R: "joint du guide de jauge à huile"), foto van de gebruiker | Geschat (buis), Aannemelijk (greep) |
| Motorsteunen | (1) rechter bovensteun ("suspension pendulaire droite", rubber-metaal met aluminium, 198 × 61 × 53 mm) aan de distributiezijde; (2) middelste steun (bestaat volgens Laguna III-gids, niet verder uitgezocht); (3) linkersteun aan de versnellingsbak; (4) koppelstang ("biellette de reprise de couple") onder aan het onderste carter/subframe | R27, R14, R13 | Bevestigd voor rechter bovensteun; overige Aannemelijk |
| Motorafdekkap | Kunststof afdekkap bovenop, centraal; aan de voorzijde een "support d'enjoliveur moteur" voor de turbo-bijsteun. Sinds golf 5i (19 oktober 2026) naar een foto van een Laguna III 2.0T: zilvergrijs, over het hele blok, opschrift RENAULT 2.0T, olievuldop midden in een kom en peilstokgreep in een tweede kom | R35, R12, foto van de gebruiker | Bevestigd (bestaat); vorm Aannemelijk (foto), maten Geschat |
| Hitteschilden | Turbo-hitteschild met luchtkanaal, hitteschild starter, hitteschild spruitstuk | R12 | Aannemelijk |
| Brandstoffilter, pomp | In de tank (geïntegreerd in de pomp-meterunit), niet aan de motor | R16 (Vel Satis RTA, pagina "Filtre à essence"); voor de Laguna III niet apart bevestigd | Aannemelijk |
| Radiateurventilator, radiateur, expansievat | Buiten de motor; ventilator met relais via motormanagement, expansiedop 1,4 bar | R11 | Aannemelijk |

---

## 3. Hulpaandrijving

| Onderdeel | Bevinding | Bron | Status |
|---|---|---|---|
| Riem | Multiriem (poly-V) **7PK1795**: 7 ribben, 1795 mm. Kit (ContiTech 7PK1795K2) bevat riem, spanrol (V85592) en geleiderol (V85512) | R18 | Bevestigd |
| Aangedreven delen | **Dynamo** en **aircocompressor**. Stuurpomp is elektrohydraulisch en dus niet op de riem | R18, R1, R32, R33 | Bevestigd |
| Dynamo | Valeo TG15C-reeks, 150 A, 12/14 V, riempoelie 7 groeven, Ø49 tot 50 mm; poelie met vrijloop komt voor, klem B+ M8, stekker PL2800/COM. Toepassing "Transmission Code AJ0, automatic" bij TG15C124 | R19 | Bevestigd (150 A, 7 groeven, Ø49 tot 50, Valeo); vrijloop Aannemelijk |
| Aircocompressor | Denso-type (Mahle ACP 504 000P, compressor-ID DCS17EC), R134a, PAG 46, 7 ribben, poelie Ø119 mm (andere catalogi 120/121 mm) | R20 | Aannemelijk |
| Waterpomp-aandrijving | Door de **distributieriem** (poelie Ø52,2 mm), niet door de multiriem | R31, R11 | Bevestigd |
| Spanners en rollen | 1 automatische spanner (veerbelast, bediend met 16 mm sleutel) en 1 geleiderol ("galet enrouleur", vast, bout 5,8 daN·m) | R18, R15 | Aannemelijk |
| Krukaspoelie | Ingesloten in de F4R-distributieprocedure: poeliebout 115 ± 15 graden aanhalen, hergebruik toegestaan als lengte onder kop ≤ 49,1 mm, vervangen bij distributiewissel; type (trillingsdemper ja/nee) **Niet gevonden** | R13, R11 | Bevestigd (bout); demper Niet gevonden |
| Accessoiresteun | "Support accessoires"/multifunctioneel steunblok aan het blok draagt dynamo en compressor | R11 (inhoud), R14 ("support multifonction") | Aannemelijk |

---

## 4. Hiërarchische stuklijst (Nederlandse werkplaatstermen)

Conventie: `niveau-nummer. Naam - aantal - opmerking [markering]`. Het niveau volgt uit de inspringing. "n.b." = aantal niet bekend, schatting staat erbij. Schroefdraadmaten zijn alleen genoemd als bron ze geeft.

### 1. Motor F4Rt 813 (waarschijnlijk, zie beslissingen) (1x)

#### 1.1 Motorblok (onderblok)

- 1.1.1 Cilinderblok, gietijzer, 1x
  - 1.1.1.1 Cilinderboringen Ø82,7 mm, 4x, direct in het blok gehoond [Bevestigd, R8]
  - 1.1.1.2 Hoofdlagerzittingen, 5x
  - 1.1.1.3 Centreerbussen kop, 2x ("douilles") [Aannemelijk, R11]
  - 1.1.1.4 Oliespuiters voor zuigerkoeling, 4x [Bevestigd, R11: "gicleurs d'huile"]
    - 1.1.1.4.1 Spuitermond met terugslagveer, 4x [S]
    - 1.1.1.4.2 Bevestigingsboutje, 4x [S]
  - 1.1.1.5 Vorstpluggen (expansiepluggen) waterkanalen, n.b., schatting 4 tot 6 [Geschat; "Freeze plug" staat in catalogus R2]
  - 1.1.1.6 Oliekanaalpluggen, n.b., schatting 4 [S]
  - 1.1.1.7 Klopsensor-opname, 1x
  - 1.1.1.8 Waterkanaal- en olie-opname voor oliekoeler/filter, 1x
- 1.1.2 Krukas
  - 1.1.2.1 Krukas, gesmeed/gegoten (type niet vastgesteld), 5 hoofdlagertappen Ø54,8 mm, 4 krukpennen Ø48 mm [Bevestigd, R11]; 8 tegengewichten [Geschat, overgenomen uit het model]
  - 1.1.2.2 Hoofdlagerschalen boven (met oliegroef, in het blok), 5x [Bevestigd, R11]
  - 1.1.2.3 Hoofdlagerschalen onder (glad, in de lagerkap), 5x [Bevestigd, R11]
  - 1.1.2.4 Hoofdlagerkappen, 5x, individueel (geen bedplate; "chapeau de palier") [Aannemelijk]
  - 1.1.2.5 Hoofdlagerbouten/tapeinden, 10x (2 per kap), vervangen bij elke montage [Bevestigd regel "remplacer vis de chapeaux de palier", R11; aantal Aannemelijk via 10-delige ARP-set]
  - 1.1.2.6 Axiale lagerschijven (shims) bij hoofdlager 2, 2x (een aan elke zijde), 2,30 tot 2,45 mm [Bevestigd, R11]
  - 1.1.2.7 Krukas-keerring distributiezijde, 1x
  - 1.1.2.8 Krukas-keerring vliegwielzijde, 1x, in de afsluitplaat ("plaque de fermeture du vilebrequin") [Aannemelijk, R14]
    - 1.1.2.8.1 Afsluitplaat/keerringhuis met pakking, 1x
  - 1.1.2.9 Krukas-pulswiel (doel voor krukaspositiesensor), 1x [S; 58 tanden is gebruikelijk bij Renault, niet bevestigd]
  - 1.1.2.10 Krukas-aandrijfwiel oliepompketting, 1x [Aannemelijk, R11: "pompe à huile entraînée depuis le vilebrequin par une chaîne simple"]

#### 1.2 Zuigers en drijfstangen (4 groepen, volgorde 1-3-4-2)

Per cilinder (1 t/m 4), dus de aantallen hieronder x4:

- 1.2.n Zuigergroep
  - 1.2.n.1 Zuiger, aluminium, zuigerpen 0,8 mm excentrisch, richtingsmerk "V" naar het vliegwiel, 1x [Bevestigd, R11]
    - 1.2.n.1.1 Ringgroef 1, 2, 3
  - 1.2.n.2 Zuigerveren: 3 per zuiger [Bevestigd, R11]
    - 1.2.n.2.1 Compressieveer 1 (vuurveer), 1x
    - 1.2.n.2.2 Compressieveer 2, 1x
    - 1.2.n.2.3 Olieschraapveer, 1x; opbouw (1-delig of 3-delig met expander) niet bevestigd [S]
  - 1.2.n.3 Zuigerpen, vrij zwevend, Ø21 × 61 mm, 1x [Bevestigd, R11]
  - 1.2.n.4 Borgveren zuigerpen, 2x, opening ongeveer 45 graden van de verticale as [Bevestigd, R11]
  - 1.2.n.5 Drijfstang, I-profiel, hartafstand 144 mm, 1x [Bevestigd, R11]
    - 1.2.n.5.1 Kleinoogbus, 1x ("bague de pied", Ø23,01 mm) [Bevestigd, R11; "Small end bushes" in R2]
    - 1.2.n.5.2 Groot oog Ø51,6 mm zonder schalen
  - 1.2.n.6 Drijfstangkap, 1x
  - 1.2.n.7 Drijfstanglagerschalen, 2x, dikte 1,776 mm, bovenschaal en onderschaal gelijk [Bevestigd, R11]
  - 1.2.n.8 Drijfstangbouten, 2x, na elke demontage vervangen [Bevestigd, R11]

#### 1.3 Cilinderkop

- 1.3.1 Cilinderkop, aluminium, hoogte 138,15 mm, 16 kleppen in V-opstelling, nokkenaslagerzittingen deels in de kop [Bevestigd, R11 voor F4R]
  - 1.3.1.1 Klepzittingen, ingeperst, 16x (inlaat Ø34,54 mm, uitlaat Ø30,04 mm buitenmaat) [Bevestigd voor F4R, R11]
  - 1.3.1.2 Kleppengeleiders, ingeperst, 16x, lengte 40,5 mm, ID 5,5 mm [Bevestigd voor F4R, R11]
  - 1.3.1.3 Waterkanalen en aansluiting waterstuk/thermostaathuis
  - 1.3.1.4 Bougiebuizen (4 putten in de kop)
  - 1.3.1.5 Inlaat- en uitlaatpoorten (inlaat naar voren, uitlaat naar achteren) [Aannemelijk]
- 1.3.2 Koppakking, 1x, dikte geklemd circa 0,65 mm [Bevestigd voor F4R 714, R11; meerlaags staal voor de turbo Geschat]
- 1.3.3 Kopbouten, 10x (Torx male), na demontage controleren/vervangen; lengte onder kop max. 117,5 mm herbruikbaar [Bevestigd, R11, R15]
- 1.3.4 Kleppenmechanisme, 16 klepgroepen (8 inlaat, 8 uitlaat); per klep:
  - 1.3.4.1 Klep, 1x (inlaat Ø33,5 kop, steel 5,47 mm, lengte 110,08 mm; uitlaat Ø29 kop, steel 5,447 mm, lengte 106,87 mm; uitlaat Nimonic) [Bevestigd maten voor F4R, R11; Nimonic R8]
  - 1.3.4.2 Klepveer, ovale draad, vrije lengte 41,3 mm, buiten Ø27 mm, 1x [Bevestigd, R11]
  - 1.3.4.3 Veerzitting (onderste veerschotel), 1x
  - 1.3.4.4 Klepsteelafdichting, 1x [Bevestigd, R11: "joints de tiges de soupapes"]
  - 1.3.4.5 Veerschotel (bovenste), 1x
  - 1.3.4.6 Klepspiebuizen (kegelspie), 2x
  - 1.3.4.7 Hydraulische speling-opvanger ("butée hydraulique"), 1x [Bevestigd, R11]
    - 1.3.4.7.1 Huis, 1x [S]
    - 1.3.4.7.2 Zuiger met terugslagkogel en veer, 1x [S]
  - 1.3.4.8 Rolzwenkarm ("linguet à rouleaux"), 1x [Bevestigd, R11]
    - 1.3.4.8.1 Arm, 1x
    - 1.3.4.8.2 Rol met naaldlager, 1x [S]
    - 1.3.4.8.3 Rolas, 1x [S]
- 1.3.5 Nokkenassen, 2x (inlaat, uitlaat) [Bevestigd]
  - 1.3.5.1 Inlaatnokkenas, 6 lagertappen (Ø25, bij distributie Ø28 mm), nokhoogte 41,0 mm [Bevestigd voor F4R, R11]
  - 1.3.5.2 Uitlaatnokkenas, 6 lagertappen, nokhoogte 40,2 mm [Bevestigd voor F4R, R11]
  - 1.3.5.3 Keerring nokkenas distributiezijde, 2x
  - 1.3.5.4 Afdichtdop nokkenas vliegwielzijde, 2x ("bouchons d'étanchéité") [Bevestigd, R13]
  - 1.3.5.5 Gaten/sleuven voor nokkenas-kalibreergereedschap in de assen [Bevestigd, R13]
- 1.3.6 Nokkenaslagerbrug ("carter chapeau de paliers d'arbres à cames"), 1x, draagt beide assen [Aannemelijk: RTA-tekst spreekt van één carter-lagerkap; het model heeft er 10 losse]
  - 1.3.6.1 Lagerbrugbouten, n.b., schatting 20 [Geschat]
  - 1.3.6.2 Dichtkit op het vlak [S]
- 1.3.7 Faseversteller (VVT) op de inlaatnokkenas [Aannemelijk]
  - 1.3.7.1 Poelie-/tandwielhuis (38 tanden), 1x [Geschat tandental]
  - 1.3.7.2 Rotor met vleugels, 1x [S]
  - 1.3.7.3 Vergrendelpen met veer, 1x [S]
  - 1.3.7.4 Centrale bout/moer, 1x, vervangen bij demontage [Bevestigd regel "remplacer vis ou écrou des roues dentées", R11]
  - 1.3.7.5 Afdekplaat ("obturateur"), 1x [Aannemelijk, R42 noemt een obturateur]
  - 1.3.7.6 Oliekanalen in de nokkenas en lagerbrug, 2 stuurkanalen [S]
  - 1.3.7.7 VVT-elektroklep (olieregelventiel) op het kleppendeksel, 1x [Bevestigd voor 811 bestaat, R28]
    - 1.3.7.7.1 Spoel met stekker, 1x [S]
    - 1.3.7.7.2 Schuif/ventiel met veer, 1x [S]
    - 1.3.7.7.3 Zeefje, 1x [S]
    - 1.3.7.7.4 O-ringen, 2x [S]
- 1.3.8 Kleppendeksel ("couvre-culasse"), aluminium of kunststof (niet vastgesteld), 1x
  - 1.3.8.1 Kleppendekselpakking, 1x
  - 1.3.8.2 Kleppendekselbouten, n.b., schatting 14 tot 16 [Geschat]
  - 1.3.8.3 Olievuldop, 1x
  - 1.3.8.4 Bobinezittingen (4 putten) met afdichtrubbers, 4x
  - 1.3.8.5 Oliedampafscheider (carterventilatie), geïntegreerd, 1x [S]
  - 1.3.8.6 Aansluiting VVT-elektroklep, 1x
- 1.3.9 Ontsteking
  - 1.3.9.1 Bobines (pen), 4x [Bevestigd, R26]
    - 1.3.9.1.1 Behuizing, 1x [S]
    - 1.3.9.1.2 Primaire wikkeling, 1x [S]
    - 1.3.9.1.3 Secundaire wikkeling, 1x [S]
    - 1.3.9.1.4 Ijzerkern, 1x [S]
    - 1.3.9.1.5 Ontsteker/driver (aanwezig bij pin-bobines met ingebouwde elektronica; niet bevestigd), 1x [S]
    - 1.3.9.1.6 Rubber bougiekap, 1x [S]
    - 1.3.9.1.7 Stekker, 1x
  - 1.3.9.2 Bobinebouten, 4x
  - 1.3.9.3 Bougies, 4x, M14 × 1,25, draad 19 mm, sleutel 16 mm, afstand 0,7 tot 0,8 mm, aandraaien 20 tot 30 Nm [Bevestigd, R25]
    - 1.3.9.3.1 Isolator (keramiek), 1x
    - 1.3.9.3.2 Huis met zeskant en massa-elektrode, 1x
    - 1.3.9.3.3 Middenelektrode (iridium of platina), 1x
    - 1.3.9.3.4 Pakkingring, 1x

#### 1.4 Distributie (kant rechts, achter het kunststof deksel)

- 1.4.1 Distributieriem, 126 tanden, 27 mm breed, 1200 mm lang, spoed 9,525 mm, HNBR met glasvezelkoord, afgeronde tand [Bevestigd, R17]
- 1.4.2 Krukastandwiel, 19 tanden, 1x, met spie ("clavette") [Tandental Geschat; spie Bevestigd, R13]
- 1.4.3 Nokkenaswiel uitlaat, 38 tanden, 1x, met moer, vervangen bij demontage [Tandental Geschat; moer Bevestigd, R13]
- 1.4.4 Nokkenaswiel inlaat = faseversteller (zie 1.3.7)
- 1.4.5 Spanrol met excentrische verstelling, 1x ("galet tendeur à excentrique", halfautomatisch, merkstrepen uitlijnen, nokje in groef) [Bevestigd, R13, R11]
  - 1.4.5.1 Rol met kogellager, 1x [S]
  - 1.4.5.2 Excentrische naaf met wijzer, 1x
  - 1.4.5.3 Borgmoer, 1x
- 1.4.6 Geleiderol ("galet enrouleur"), 1x, bout 4,5 daN·m [Bevestigd, R13]
- 1.4.7 Waterpomppoelie (tanden, deel van de waterpomp, zie 1.8)
- 1.4.8 Distributiekappen: bovenkap, tussenkap en onderkap [Aannemelijk, R13 noemt "carter supérieur", "carter intermédiaire", "carter inférieur de distribution"]
  - 1.4.8.1 Afdichtrubbers en klemmen, n.b.
  - 1.4.8.2 Bouten, n.b.
- 1.4.9 Pigeergat-plug bovenste dode punt ("bouchon de pige de PMH"), 1x [Bevestigd, R13]

#### 1.5 Hulpaandrijving

- 1.5.1 Multiriem, 7PK1795 (7 ribben, 1795 mm), 1x [Bevestigd, R18]
- 1.5.2 Krukaspoelie, 7 groeven, 1x, bout 1x [Bevestigd bout, R13]
- 1.5.3 Spanner, automatisch, 1x [Aannemelijk]
  - 1.5.3.1 Arm met veerhuis en demping, 1x [S]
  - 1.5.3.2 Rol met lager, 1x [S]
  - 1.5.3.3 Bevestigingsbout, 1x
- 1.5.4 Geleiderol, 1x, met lager [Bevestigd, R18]
- 1.5.5 Dynamo (Valeo TG15C, 150 A) [Bevestigd typefamilie, R19]; interne opbouw [S]:
  - 1.5.5.1 Poelie met vrijloop, Ø49 tot 50 mm, 7 groeven, 1x
    - 1.5.5.1.1 Buitenring met riemprofiel
    - 1.5.5.1.2 Binnenring
    - 1.5.5.1.3 Rollen/klemmen met veren, 1x set
    - 1.5.5.1.4 Stofdop, 1x
  - 1.5.5.2 Rotor, 1x
    - 1.5.5.2.1 Klauwpolen, 2x
    - 1.5.5.2.2 Veldspoel, 1x
    - 1.5.5.2.3 Sleepringen, 2x
    - 1.5.5.2.4 As, 1x
  - 1.5.5.3 Stator, 1x (3-fasen wikkeling in plaatpakket)
  - 1.5.5.4 Gelijkrichter (diodebrug, 6 diodes), 1x
  - 1.5.5.5 Spanningsregelaar met koolborstelhouder, 1x
    - 1.5.5.5.1 Koolborstels, 2x
    - 1.5.5.5.2 Borstelveren, 2x
  - 1.5.5.6 Voorlager, 1x
  - 1.5.5.7 Achterlager, 1x
  - 1.5.5.8 Voorschild, 1x
  - 1.5.5.9 Achterschild met afdekkap, 1x
  - 1.5.5.10 Doorgaande bouten, 3 tot 4x
  - 1.5.5.11 B+ aansluiting M8, 1x
  - 1.5.5.12 Interne ventilator(en), 1 tot 2x
  - 1.5.5.13 Stekker, 1x
- 1.5.6 Aircocompressor (Denso-type, 7 ribben, Ø119 poelie) [Aannemelijk, R20]; interne opbouw [S]:
  - 1.5.6.1 Magneetkoppeling
    - 1.5.6.1.1 Poelie met lager, 1x
    - 1.5.6.1.2 Koppelingsplaat (anker) met veerplaten, 1x
    - 1.5.6.1.3 Veldspoel, 1x
    - 1.5.6.1.4 Naaf op de as, 1x
    - 1.5.6.1.5 Borgring, 1x
  - 1.5.6.2 Compressorhuis (voor en achter), 2 helften
  - 1.5.6.3 As, 1x
    - 1.5.6.3.1 Asafdichting, 1x
  - 1.5.6.4 Tuimelschijf (swash plate), 1x
  - 1.5.6.5 Zuigers, 7x (aantal Geschat)
  - 1.5.6.6 Cilinderblok met klepplaat en lamellenkleppen, 1x
  - 1.5.6.7 Aansluitplaat zuig- en persleiding met O-ringen, 1x
  - 1.5.6.8 Overdrukklep, 1x
  - 1.5.6.9 Olie PAG 46, R134a (inhoud van het circuit)
- 1.5.7 Accessoiresteun (multifunctioneel blok), 1x, met bouten, n.b. [Aannemelijk, R11, R14]
- 1.5.8 Stuurbekrachtiging: **elektrohydraulisch aggregaat, niet aan de motor** [Bevestigd, R1, R32]

#### 1.6 Smering

- 1.6.1 Carterpan (onderste carter), 1x, met pakking (of vloeibare pakking) [Bevestigd dat een pakking en minimaal 18 bouten worden genoemd, R14]
  - 1.6.1.1 Carterbouten, minimaal 18x [Bevestigd, R14]
  - 1.6.1.2 Schotten/keerplaten in de pan, n.b. [S]
  - 1.6.1.3 Aftapplug met koperring, 1x [Bevestigd vierkante kop, R45b]
  - 1.6.1.4 Retourgat voor turbo-olie in het blok (niet in de pan) [Aannemelijk, R12]
- 1.6.2 Oliepomp, tandwielpomp met geïntegreerde overdrukklep, 1x [Bevestigd, R11]; interne opbouw [S]:
  - 1.6.2.1 Pomphuis, 1x
  - 1.6.2.2 Aandrijf- en loopwiel (rotors), 2x
  - 1.6.2.3 Overdrukklep: plunjer, veer, stop, 1x set
  - 1.6.2.4 Pompdeksel met bouten, 1x
  - 1.6.2.5 Kettingwiel op de pompas, 1x
- 1.6.3 Oliepompketting (enkelvoudig), 1x [Bevestigd, R11, R45]
  - 1.6.3.1 Kettingspanner/geleider (aanwezigheid niet bevestigd), 1x [S]
- 1.6.4 Aanzuigbuis met zeef ("crépine"), 1x [Bevestigd dat een crépine bestaat, R14]
  - 1.6.4.1 Pakking/O-ring, 1x
  - 1.6.4.2 Bevestigingsbout, 1 tot 2x [S]
- 1.6.5 Oliefilter, spin-on, M20 × 1,5, Ø76 tot 77 × hoogte 52 tot 57 mm, 1x [Bevestigd, R22]
  - 1.6.5.1 Filterhuis met papieren element, 1x [S]
  - 1.6.5.2 Terugslagklep, 1x [S]
  - 1.6.5.3 Bypassklep, 1x (opent bij 1 bar) [Bevestigd waarde voor Ridex-filter, R22]
  - 1.6.5.4 Afdichtring Ø61 mm, 1x [Bevestigd, R22]
- 1.6.6 Oliekoeler, watergekoelde plaatkoeler, circa 122 × 99 × 48 mm, 8 platen, 1x [Aannemelijk, R23; een andere uitvoering is 97 × 98 × 43 mm]
  - 1.6.6.1 Platenpakket (stalen platen), 8x
  - 1.6.6.2 Pakking tussen koeler en blok, 1x
  - 1.6.6.3 Centrale bout/nippel voor filter, 1x
  - 1.6.6.4 Waterslangaansluitingen, 2x
- 1.6.7 Peilstok met geleidebuis, 1x [Aannemelijk]
  - 1.6.7.1 Peilstok (gele greep), 1x
  - 1.6.7.2 Geleidebuis met O-ring, 1x
  - 1.6.7.3 Beugel, 1x
- 1.6.8 Oliedrukschakelaar, 1x [S]
- 1.6.9 Turbo-oliecircuit
  - 1.6.9.1 Olietoevoerleiding (banjo's, koperen ringen), 1x [Bevestigd, R12]
  - 1.6.9.2 Olieretourleiding (3 bouten naar het blok, pakking), 1x [Bevestigd, R12]
  - 1.6.9.3 Zeefje/restrictie in de toevoer, 1x [S]
- 1.6.10 Carterventilatie
  - 1.6.10.1 Oliedampafscheider (zie 1.3.8.5)
  - 1.6.10.2 Slangen naar inlaat en turbo-ingang, 2 tot 3x [Aannemelijk, R38]
  - 1.6.10.3 PCV-klep, 1x [Aannemelijk, R38]

#### 1.7 Inlaat en inspuiting

- 1.7.1 Luchtfilterhuis met inlaatslang (buiten de motor), 1x
- 1.7.2 Inlaatslang naar het compressorhuis, 1x [Bevestigd, R12 "tuyau du filtre à air - turbocompresseur"]
- 1.7.3 Laadluchtslang turbo naar intercooler, 1x [Bevestigd, R44]
- 1.7.4 Intercooler lucht-lucht, aluminium, kern circa 650 × 112 × 108 mm (andere catalogus 725 mm), 1x [Aannemelijk, R24]
  - 1.7.4.1 Kern (lamellen en buizen), 1x
  - 1.7.4.2 Bovenwater-/eindtank, 2x (kunststof) [Aannemelijk, R24: "Water Tank Material: Plastic"]
  - 1.7.4.3 Aansluitnippels, 2x
- 1.7.5 Laadluchtslang intercooler naar gasklephuis, 1x
- 1.7.6 Gasklephuis (elektrisch), 1x [Aannemelijk, R29, R37]
  - 1.7.6.1 Huis, 1x
  - 1.7.6.2 Vlinderklep, 1x [S]
  - 1.7.6.3 Klepas, 1x [S]
  - 1.7.6.4 Terugstelveer(en), 1 tot 2x [S]
  - 1.7.6.5 Gelijkstroommotor, 1x [S]
  - 1.7.6.6 Tandwielreductie, 2 tot 3x [S]
  - 1.7.6.7 Positiesensoren (potmeters of Hall), 2x (redundant) [S]
  - 1.7.6.8 Pakking, 1x
  - 1.7.6.9 Stekker, 1x
  - 1.7.6.10 Bouten, 4x
- 1.7.7 Inlaatspruitstuk ("répartiteur d'admission"), kunststof, 1x [Bevestigd naam in RTA, R41; kunststof Aannemelijk]
  - 1.7.7.1 Plenum, 1x
  - 1.7.7.2 Inlaatkanalen, 4x
  - 1.7.7.3 Pakkingen of pakkingring per poort, 4x of 1x [S]
  - 1.7.7.4 Tapeinden/bouten, n.b., schatting 8 [Geschat; tapeinden genoemd in R41]
  - 1.7.7.5 Inlaatdruksensor (MAP), 1x [Bevestigd bestaat, R2/R38-catalogus]
  - 1.7.7.6 Inlaatluchttemperatuursensor, 1x [Aannemelijk, R41]
  - 1.7.7.7 Vacuümaansluiting remservo, 1x [Aannemelijk, R12]
  - 1.7.7.8 Aansluiting spoelventiel koolstoffilter (canister), 1x [Aannemelijk]
  - 1.7.7.9 Aansluiting carterventilatie, 1x
- 1.7.8 Brandstofrail, 1x [Aannemelijk]
  - 1.7.8.1 Rail (staal of kunststof, niet vastgesteld), 1x
  - 1.7.8.2 Testnippel/Schrader-ventiel, 1x [S]
  - 1.7.8.3 Snelkoppeling toevoer, 1x [S]
  - 1.7.8.4 Rail-bevestigingsbouten, 2x [S]
  - 1.7.8.5 Drukregelaar zit in de tank (retourloos), geen onderdeel van de rail [Aannemelijk]
- 1.7.9 Injectoren, 4x (Siemens-/Marelli-type, bovenaanvoer) [Bevestigd bestaat, R30]
  - 1.7.9.1 Huis met naaldventiel, 1x [S]
  - 1.7.9.2 Spoel met stekker, 1x [S]
  - 1.7.9.3 Bovenste O-ring (rail), 1x
  - 1.7.9.4 Onderste O-ring (inlaatkanaal), 1x
  - 1.7.9.5 Houdclip of -beugel, 1x
  - 1.7.9.6 Filtergaasje bovenin, 1x [S]
- 1.7.10 Spoelventiel koolstoffilter, 1x [Aannemelijk]

#### 1.8 Koelcircuit motor

- 1.8.1 Waterpomp, 1x, aan de rechterkant van het blok, aangedreven door de distributieriem [Bevestigd, R11]
  - 1.8.1.1 Pomphuis, 1x
  - 1.8.1.2 Waaier, 1x [S]
  - 1.8.1.3 As met dubbel lager, 1x [S]
  - 1.8.1.4 Mechanische asafdichting, 1x [S]
  - 1.8.1.5 Poelie (tandprofiel), Ø52,2 mm, 1x [Bevestigd, R31]
  - 1.8.1.6 Pakking of O-ring, 1x
  - 1.8.1.7 Bouten, n.b.
- 1.8.2 Waterstuk/thermostaathuis ("boîtier de sortie d'eau"), 1x [Aannemelijk, R41]
  - 1.8.2.1 Thermostaat, 1x [Bevestigd bestaat, R2]
    - 1.8.2.1.1 Waselement met zuiger, 1x [S]
    - 1.8.2.1.2 Klepplaat, 1x [S]
    - 1.8.2.1.3 Veer, 1x [S]
    - 1.8.2.1.4 Omloopklepje, 1x [S]
    - 1.8.2.1.5 Ontluchtingsklepje, 1x [S]
  - 1.8.2.2 Pakking, 1x [Bevestigd, R41]
  - 1.8.2.3 Koelvloeistoftemperatuursensor, 1 tot 2x
  - 1.8.2.4 Slangaansluitingen (radiateur boven, verwarming, expansievat), 3x
- 1.8.3 Koelvloeistofslangen aan de motor: radiateur onder, verwarming, turbo-koeling (2), omloop, 4 tot 6x [Aannemelijk]
- 1.8.4 Thermoplongeur (carterverwarming) alleen bij koude markten, 0 tot 1x [Bevestigd voor Vel Satis, R12; voor deze auto Niet gevonden]

#### 1.9 Turbo en uitlaatspruitstuk

- 1.9.1 Uitlaatspruitstuk, gietijzer of gietstaal, twin-scroll (twee gescheiden kanalen), 1x [Aannemelijk, R8]
  - 1.9.1.1 Spruitstukpakking, 1x (of 4) [S]
  - 1.9.1.2 Tapeinden, n.b., schatting 8 [Geschat; "goujons du collecteur d'échappement" in R41]
  - 1.9.1.3 Moeren, n.b., schatting 8, vervangen [Bevestigd regel "remplacer écrous du collecteur", R41]
  - 1.9.1.4 Hitteschild spruitstuk, 1x [Aannemelijk]
- 1.9.2 Turbo, Mitsubishi TD04 49377-07303, 1x [Bevestigd, R4]
  - 1.9.2.1 Turbinehuis, roestvast gietstaal, twin-scroll, 1x
    - 1.9.2.1.1 Wastegate-opening met klep, 1x [Aannemelijk]
    - 1.9.2.1.2 Wastegate-arm en as, 1x [S]
    - 1.9.2.1.3 Uitlaatflens (3 moeren naar de kat), 1x
  - 1.9.2.2 Lager- en rotorgroep (CHRA), 1x
    - 1.9.2.2.1 Turbinewiel (Inconel), 1x [S]
    - 1.9.2.2.2 Turbo-as, 1x [S]
    - 1.9.2.2.3 Compressorwiel (aluminium), 1x [S]
    - 1.9.2.2.4 Radiale glijlagers (zwevende bussen), 2x [S]
    - 1.9.2.2.5 Axiaal lager: drukplaat en drukring, 1x set [S]
    - 1.9.2.2.6 Zuigerveerafdichtingen as (turbine- en compressorzijde), 2x [S]
    - 1.9.2.2.7 Oliespatring (flinger) en afdekplaat, 1x [S]
    - 1.9.2.2.8 Lagerhuis met olie-ingang, olie-uitgang en 2 koelwateraansluitingen, 1x [Bevestigd waterkoeling Vel Satis, R12]
    - 1.9.2.2.9 Hitteschild tussen turbine en lagerhuis, 1x [S]
    - 1.9.2.2.10 As-moer, 1x [S]
  - 1.9.2.3 Compressorhuis, aluminium, 1x
    - 1.9.2.3.1 Borgring of bouten, 1x set [S]
    - 1.9.2.3.2 Omloopklep (pneumatisch), 1x [Aannemelijk, R12]
  - 1.9.2.4 Wastegate-actuator (drukdoos), 1x
    - 1.9.2.4.1 Membraan met steun, 1x [S]
    - 1.9.2.4.2 Veer, 1x [S]
    - 1.9.2.4.3 Stang met oogje en borgclip, 1x [S]
    - 1.9.2.4.4 Drukslangetje, 1x
  - 1.9.2.5 Magneetventiel laaddrukregeling (wastegate), 1x [Bevestigd, R12]
  - 1.9.2.6 Magneetventiel omloopklep, 1x [Bevestigd, R12]
  - 1.9.2.7 Turbobevestiging
    - 1.9.2.7.1 Tapeinden, 4x en moeren, 4x, vervangen [Bevestigd, R12]
    - 1.9.2.7.2 Pakking turbo-spruitstuk, 1x [Bevestigd, R12]
    - 1.9.2.7.3 Turbosteun ("béquille"), 1x [Bevestigd, R12]
  - 1.9.2.8 Koelleidingen turbo (water), 2x, plus koelkanaal ("conduit de refroidissement") met 2 bouten en pakking [Bevestigd, R12]
  - 1.9.2.9 Hitteschild turbo met luchtkanaal (2 tot 4 bouten) [Bevestigd, R12]
- 1.9.3 Voorkatalysator, direct op de turbine, 1x [Aannemelijk, R16]
  - 1.9.3.1 Monoliet in huis, 1x [S]
  - 1.9.3.2 Moeren op turbine, 3x en pakking, 1x
  - 1.9.3.3 Flens naar de uitlaatlijn, 3 moeren, 1x
  - 1.9.3.4 Steun naar de versnellingsbak, 1x [Bevestigd, R16 "béquille de la bride trois points ... sur la boîte"]
- 1.9.4 Lambdasondes, 2x (voor en na de kat) [Bevestigd, R16]

#### 1.10 Sensoren (met plaats)

- 1.10.1 Krukaspositiesensor, 1x, bij de vliegwielzijde/klokhuis, leest het pulswiel [Aannemelijk, R2]
- 1.10.2 Nokkenaspositiesensor (actief, Hall), 1x, op de kop bij de inlaatnokkenas [Bevestigd type "active sensor", R2-familie; plaats Aannemelijk]
- 1.10.3 Klopsensor, 1x, tussen cilinders 2 en 3 op het blok [Bevestigd bestaat; plaats Aannemelijk]
- 1.10.4 Koelvloeistoftemperatuursensor, 1x, in het waterstuk [Bevestigd, R41]
- 1.10.5 Inlaatdruksensor (MAP), 1x, op het inlaatspruitstuk [Bevestigd, R2]
- 1.10.6 Inlaatluchttemperatuursensor, 1x [Aannemelijk]
- 1.10.7 Oliedrukschakelaar, 1x, bij het oliefilter [Aannemelijk]
- 1.10.8 Lambdasonde voor, 1x en na, 1x (zie 1.9.4)
- 1.10.9 Gaspedaalsensor en pedaal zijn niet motorgebonden

#### 1.11 Motorkabelboom en elektrisch

- 1.11.1 Motorkabelboom met aftakkingen naar bobines, injectoren, gasklep, sensoren, 1x [Aannemelijk]
  - 1.11.1.1 Stekkers, circa 20x [Geschat]
  - 1.11.1.2 Kabelgoten en klemmen, n.b.
  - 1.11.1.3 Massapunten, 2 tot 3x [S]
- 1.11.2 Startmotor (Valeo-type, circa 0,9 tot 1,1 kW) [Aannemelijk, R21]; interne opbouw [S]:
  - 1.11.2.1 Solenoïde (starterrelais)
    - 1.11.2.1.1 Trekspoel, 1x
    - 1.11.2.1.2 Houdspoel, 1x
    - 1.11.2.1.3 Plunjer, 1x
    - 1.11.2.1.4 Contactplaat, 1x
    - 1.11.2.1.5 Contactbouten, 2x
    - 1.11.2.1.6 Terugstelveer, 1x
  - 1.11.2.2 Schakelvork, 1x
  - 1.11.2.3 Rondsel met vrijloop, 9 of 11 tanden, 1x [tandental R21, 9 en 11 beide in catalogi]
    - 1.11.2.3.1 Overrun-koppeling met rollen en veren
  - 1.11.2.4 Planetaire reductie
    - 1.11.2.4.1 Zonnewiel op het anker, 1x
    - 1.11.2.4.2 Planeetwielen, 3x
    - 1.11.2.4.3 Ringwiel, 1x
    - 1.11.2.4.4 Planeetdrager, 1x
  - 1.11.2.5 Anker (rotor met collector), 1x
  - 1.11.2.6 Veldhuis met permanente magneten, 1x
  - 1.11.2.7 Koolborstels, 4x, met borstelhouder
  - 1.11.2.8 Lagerbussen, 2x
  - 1.11.2.9 Eindschild en klemkap, 1x
  - 1.11.2.10 Trekbouten, 2 tot 3x
  - 1.11.2.11 Montagebouten flens Ø66 mm, 3x [Bevestigd 3 gaten, R21]
  - 1.11.2.12 Hitteschild starter, 1x [Bevestigd, R12]
- 1.11.3 Accu (62 Ah, 540 A, in de motorruimte, niet aan de motor): hier genoemd voor de kabelroute [Bevestigd, R2-familie]

#### 1.12 Flexplaat en koppelomvormer-zijde

- 1.12.1 Flexplaat ("plaat met startkrans"), 1x, vervangt het vliegwiel bij de automaat [Aannemelijk]
  - 1.12.1.1 Startkrans (getande rand), 1x
  - 1.12.1.2 Aandrijfplaat met centrale naaf, 1x
  - 1.12.1.3 Versterkingsplaat/onderlegring, 1x [S]
  - 1.12.1.4 Pulswiel-uitsparingen of -ring, 1x [S]
- 1.12.2 Flexplaatbouten, 6x, vervangen bij demontage [Bevestigd dat ze vervangen worden, R11; aantal 6 Geschat]
- 1.12.3 Koppelomvormer en automaat: **buiten deze opdracht** (transmissiegroep); Planète Renault noemt een "double volant amortisseur" alleen bij de handbak (R8)

#### 1.13 Motorsteunen

- 1.13.1 Rechter bovensteun (pendelsteun) met limiteur, rubber-metaal, aluminium, 198 × 61 × 53 mm, 1x [Bevestigd, R27]
  - 1.13.1.1 Rubber, 1x
  - 1.13.1.2 Metalen beugel, 1x
  - 1.13.1.3 Bevestigingsbouten, 3 tot 4x [Geschat]
- 1.13.2 Middelste steun, 1x [Aannemelijk, bestaat volgens Laguna III-reparatiegidsen; details Niet gevonden]
- 1.13.3 Linker steun (versnellingsbaksteun), 1x [Aannemelijk, R16-familie "support de boîte"]
- 1.13.4 Koppelstang ("biellette de reprise de couple"), 1x, aan het onderste carter en het subframe [Bevestigd, R13, R14]
  - 1.13.4.1 Rubber lagerbussen, 2x
  - 1.13.4.2 Bouten, 2x [Bevestigd, R16 "deux vis"]
  - 1.13.4.3 Steunbeugel op de carterpan, 1x [Bevestigd, R16]

#### 1.14 Motorafdekkap en schilden

- 1.14.1 Motorafdekkap (kunststof), 1x [Bevestigd bestaat]
  - 1.14.1.1 Akoestische schuimlaag, 1x [S]
  - 1.14.1.2 Klemmen of rubber nokken, 2 tot 4x [S]
- 1.14.2 Onderplaat en hitteschilden: onderdeel van het chassis/uitlaatsysteem, niet hier

---

## 5. Afmetingen voor geometrie

| Maat | Waarde | Bron / afleiding | Status |
|---|---|---|---|
| Boring × slag | 82,7 × 93,0 mm | R1, R11 | Bevestigd |
| Drijfstang hartafstand | 144 mm | R11; model heeft al 144 mm | Bevestigd |
| Krukpen Ø | 48 mm | R11; model 47 mm | Bevestigd |
| Hoofdlagertap Ø | 54,8 mm (54,785 tot 54,805) | R11; model 58 mm, dus 3 mm te dik | Bevestigd |
| Zuigerpen | Ø21 × 61 mm (60,7 tot 61) | R11 | Bevestigd |
| Zuiger | Ø82,69 mm, 3 veren | R11 | Bevestigd |
| Drijfstanglager | dikte 1,776 mm, groot oog Ø51,6 zonder schalen | R11 | Bevestigd |
| Kopafstand cilinder-hartlijnen | 88 mm (model gebruikt 88 mm) | Eigen inschatting (gangbare F4R-steek) | Geschat |
| Hoogte cilinderkop | 138,15 mm; model 133 + 1,5 mm | R11 | Bevestigd |
| Koppakking dikte | 0,65 mm geklemd; model 1,5 mm | R11 | Bevestigd (F4R 714) |
| Kopboutlengte | maximaal 117,5 mm onder kop herbruikbaar (nieuwe boutlengte circa 115 mm); model 160 mm | R15 (kopje "Serrage culasse": herbruikbaar tot 117,5 mm onder kop, Vel Satis F4R) | Aannemelijk |
| Klepmaten | inlaat kop 33,5 mm, steel 5,47 mm, lengte 110,08 mm; uitlaat kop 29 mm, steel 5,447 mm, lengte 106,87 mm. Model: inlaat 33, uitlaat 28,4, steel 5,8, lengte 104 | R11 | Bevestigd (F4R) |
| Klepgeleiderhoek | inlaat 63 graden 30', uitlaat 66 graden (waarschijnlijk t.o.v. het kopvlak, dus 26,5 en 24 graden t.o.v. de cilinderas; model gebruikt 15 graden) | R11; referentievlak van de hoek niet vermeld | Aannemelijk, interpretatie Geschat |
| Klepveer | vrije lengte 41,3 mm, buiten Ø27 mm, binnen Ø18,8 mm, ovale draad; model gebruikt Ø21 | R11 | Bevestigd (F4R) |
| Nokhoogte | inlaat 41,02 mm, uitlaat 40,17 mm | R11 | Bevestigd (F4R) |
| Nokkenaslagers | Ø25 mm (positie 1 tot 5), Ø28 mm (positie 6, distributiezijde), 6 lagers per as | R11 | Bevestigd (F4R) |
| Distributieriem | 126 tanden, 9,525 mm spoed, 27 mm breed, 1200 mm lang | R17 | Bevestigd |
| Krukastandwiel | 19 tanden, spoedcirkel circa 57,6 mm (126 × 9,525 / π is voor de hele riem; 19 × 9,525 / π = 57,6) | Afgeleid uit 2 : 1 en 38 tanden | Geschat |
| Nokkenaswielen | 38 tanden, spoedcirkel circa 115,2 mm | Afgeleid: 2 : 1 overbrenging (4-takt) en tandental 38 (een Autodoc-vermelding "Nombre de dents: 38" bij het VVT-onderdeel van de Laguna II F4R 764; zwakke bron) | Geschat; model heeft 24/48 tanden |
| Waterpomppoelie | Ø52,2 mm, circa 17 tanden | R31; tanden afgeleid | Bevestigd (Ø), Geschat (tanden) |
| Multiriem | 7 ribben, 1795 mm lang | R18 | Bevestigd |
| Dynamopoelie | Ø49 tot 50 mm, 7 groeven; model Ø56 | R19 | Bevestigd |
| Aircopoelie | Ø119 mm (andere catalogi 120/121); model Ø110 | R20 | Aannemelijk |
| Krukaspoelie | circa Ø130 tot 150 mm | Afgeleid uit een gangbare dynamo-overbrenging van circa 2,8 | Geschat; model Ø136 |
| Spanrol multiriem | Ø60 × breedte 25 mm (Vel Satis F4R-catalogus); andere uitvoering Ø65 × 30 | Autodoc Vel Satis, zoek-snippet | Geschat voor Laguna III |
| Turbo-wielen (TD04-reeks) | turbinewiel inlaat circa 47,2 mm (TD04) tot 46,8 mm (TD04L), uitlaat 40 tot 41,2 mm; compressorwiel inlaat circa 39,5 tot 41 mm, uitlaat circa 51 tot 56 mm; model gebruikt Ø68 turbine, Ø60 compressor, dus te groot | MHI-wieltabellen (R40); specifiek voor -07303 Niet gevonden (alleen "TD04-10T/8.5" bij R7) | Geschat |
| Turbo behuizing totaal | Niet gevonden; schatting 200 tot 250 mm lang, 150 mm hoog | | Niet gevonden |
| Injector | lengte circa 60 tot 70 mm (bovenaanvoer); model 55 mm | Gangbare Siemens-Deka/Marelli-maat, geen bron | Geschat |
| Bobine (pen) | lengte circa 130 tot 150 mm, Ø22 mm; model 130 mm + connector | Geen bron voor F4Rt | Geschat |
| Bougie | M14 × 1,25, draad 19 mm, SW16, totale lengte circa 65 tot 85 mm | R25 | Bevestigd (draad, SW), Geschat (lengte) |
| Oliefilter | Ø76 tot 77 mm × 52 tot 57 mm hoog, M20 × 1,5, pakkingring Ø61; model Ø76 × 85 | R22 | Bevestigd |
| Oliekoeler | circa 122 × 99 × 48 mm, 8 platen | R23 | Aannemelijk |
| Carter diepte | Niet gevonden; model 100 mm + 50 mm bak. Schatting totaal 120 tot 150 mm | | Niet gevonden |
| Oliehoeveelheid | 5,4 liter | R39, R36 | Aannemelijk |
| Blokhoogte (hartlijn krukas tot dek) | Niet gevonden; model 222 mm | | Niet gevonden |
| Blokhoogte totaal en blokbreedte | Niet gevonden; model 430 mm lang × 210 mm breed | | Niet gevonden |
| Rechter motorsteun | 198 × 61 × 53 mm | R27 | Bevestigd |
| Startmotor | flens Ø66 mm, 3 gaten, 0,9 tot 1,1 kW, 9 of 11 tanden | R21 | Aannemelijk |
| Intercooler | kern circa 650 × 112 × 108 mm (of 725 mm) | R24 | Aannemelijk |

---

## 6. Wat in `engine1.js` en `engine2.js` ondiep of onjuist is

Het model heeft 318 onderdelen. Wat ontbreekt of afwijkt volgens dit onderzoek:

1. **Kleptrein.** Kopstoters vervangen door per klep: hydraulische speling-opvanger plus rolzwenkarm met rol. Dat geeft 16 × 2 hoofdonderdelen extra, met kinderen (huis, zuiger, veer; arm, rol, as).
2. **Nokkenaslagerbrug** in plaats van 10 losse lagerkappen; de afdichtdoppen aan de vliegwielzijde en de keerringen aan de distributiezijde ontbreken.
3. **Faseversteller** is nu een bol op het wiel zonder inhoud: voeg huis, rotor, vergrendelpen, afdekplaat en de elektroklep op het kleppendeksel toe.
4. **Oliepomp.** Nu een blok. Echt: tandwielpomp aan de distributiezijde van de krukas, aangedreven door een ketting met kettingwiel, met overdrukklep en aanzuigbuis met zeef.
5. **Oliekoeler** ontbreekt volledig (watergekoelde plaatkoeler tussen blok en filter).
6. **Waterpomp.** Alleen huis en waaier; de poelie met tanden (door de tandriem aangedreven) mist, evenals de keerring en het lager.
7. **Thermostaat.** Zonder waselement, klepplaat, veer en omloopklepje; geen waterstuk met sensor.
8. **Turbo.** Wielen te groot (Ø68/Ø60 tegen circa Ø47 en Ø53), twin-scroll turbinehuis, lagerhuis met glijlagers en axiaal lager, waterkoeling (2 slangen), turbosteun, hitteschild, twee magneetventielen, omloopklep, voorkatalysator en 2 lambdasondes ontbreken; wastegate-actuator heeft geen binnenwerk.
9. **Uitlaatspruitstuk.** Geen tapeinden, moeren, pakking of hitteschild als eigen onderdelen.
10. **Gasklephuis.** Zonder klep, as, motor, tandwielen, sensoren.
11. **Inlaat.** Intercooler niet in de motorgroep (het hoort bij de koeling), slangen ontbreken; injectoren zonder O-ringen en klemmen; geen rail-testventiel, geen sensoren op het spruitstuk (MAP, temperatuur).
12. **Dynamo en aircocompressor.** Alleen een cilinder; de binnenwerken (sectie 4, 1.5.5 en 1.5.6) ontbreken geheel. Dynamopoelie te groot (Ø56 tegen Ø49 tot 50). Stuurpomp hoort er niet op (elektrohydraulisch).
13. **Startmotor.** Ontbreekt in de motorgroep (alleen kans dat hij elders staat); sectie 1.11.2.
14. **Distributie.** Tandental (24/48) onjuist; spanrol zonder excentrische naaf; geen spie, geen kappen in drieën, geen pigeergat-plug.
15. **Cilindernummering** en **axiaal lager** (zie sectie 0, punt 6 en 7).
16. **Carter.** Pan zonder schotten, zonder bouten (minimaal 18), zonder afsluitplaat/keerringhuis vliegwielzijde.
17. **Oliespuiters** voor zuigerkoeling ontbreken (4 stuks, bevestigd).
18. **Zuigers.** Olieschraapveer in één stuk; zuigerpen-borgveren zijn wel aanwezig; kleinoogbus ontbreekt; drijfstanglagers goed.
19. **Motorsteunen en koppelstang** ontbreken.
20. **Motorkabelboom** ontbreekt.
21. **Carterventilatie** (olie-afscheider, PCV, slangen) ontbreekt.

---

## 7. Open vragen

1. Vervallen: de F4Rt heeft geen faseversteller (Renault-persmap 2007; de bron noemt de 811 en voor de 813 is het niet apart bevestigd).
2. Exacte laaddruk, wastegate-opening en turbo-referentie voor de F4Rt (alleen familie bekend).
3. Welke kant van het blok de turbo precies op zit (links/midden/rechts) en de hoek van de motor in de auto.
4. Plaats van de peilstok, de oliekoeler en het filter aan het blok van de Laguna III.
5. Is het onderste carter een aluminium bedplate of een gewone pan? Het RTA spreekt van "carter inférieur" met pakking en minimaal 18 bouten.
6. Welke krukaspoelie (demper ja/nee) en welk type krukas (gesmeed of gegoten).
7. Verschil tussen F4Rt 811 en 813: opgelost voor zover bronnen reiken. Volgens MR 415 (hatchback, PDF-pagina 5) is de 811 Euro 4 en de 813 Euro 3, 4 en 5. De RDW toont binnen dezelfde typegoedkeuring Euro 4-uitvoeringen tot november 2010 en Euro 5-uitvoeringen vanaf februari 2010, beide met de typegoedkeuringsmotorcode F4R J8. De 813 heeft volgens MR 415 een eigen procedure voor de vrijloopriemschijf van de dynamo (PDF-pagina 1403 tot en met 1405). Vermogen en koppel zijn gelijk. Verschillen in lambdasondes, faseversteller en turbo zijn niet gevonden.
8. Het handboek van de Laguna III zelf (RTA MR 407?) is niet gevonden; wel Vel Satis en Mégane/Clio F4R.

---

## Bronnenlijst

- R1 L'argus, Laguna Estate 2.0T 170 Privilège BVA: https://www.largus.fr/fiche-technique/Renault/Laguna+Estate/III+K91/2007/Break/20T+170ch+Privil%C3%A8ge+BVA-956859.html
- R2 Autodoc, onderdelencatalogus Laguna III (BT) 2.0 16V Turbo F4R 811: https://www.autodoc.parts/spares/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R3 Autodoc, turbo Laguna III Coupé F4Rt 811: https://www.autodoc.co.uk/car-parts/turbocharger-10972/renault/laguna/laguna-coupe-dt0-1/27534-2-0-16v-turbo
- R4 Mitsubishi Turbocharger, 49377-07303 (TD04, F4R M4 125 kW 270 Nm, klant Renault): https://www.mitsubishi-turbo.com/product/49377-07303-turbocharger
- R5 Europe Turbo, 49377-07303 voor Laguna 3 2.0 16V Turbo 170: https://www.europeturbo.fr/turbo-compresseur/turbo-pour-renault-laguna-3-20-16v-turbo-170-cv-49377-07303-24746.html
- R6 Alfi-Turbo, toewijzingen 49377-073xx (F4R 811, F4RT 811): https://alfi-turbo.com/gb/remanufactured-turbos/1312-turbo-20i-165-170-180-hp-49377-07343.html
- R7 Turbo International, 49377-07303 TD04-10T/8.5: https://www.turbointernational.com/49377-07303-turbocharger-td04-10t-8-5
- R8 Planète Renault, F4RT (Vel Satis, TCe 180): https://www.planeterenault.com/1-gamme/45-moteurs/1060-f4rt-tce-180
- R9 Planète Renault, F4R en F4Rt RS: https://www.planeterenault.com/1-gamme/45-moteurs/4856-f4r-f4rt-rs-20-16v
- R10 Wikipedia, Renault F-Type engine: https://en.wikipedia.org/wiki/Renault_F-Type_engine
- R11 Revue technique, hoofdstuk 1 "Moteur essence 2.0 16V (F4R)" (F4R 714/715, Mégane II): https://fr.scribd.com/document/700721270/01a
- R12 Rensatis, RTA Vel Satis, turbo F4R: https://www.rensatis.com/moteur_f4r-199.html
- R13 Rensatis, RTA Vel Satis, distributieriem F4R: https://www.rensatis.com/moteur_f4r-147.html
- R14 Rensatis, RTA Vel Satis, onderste carter F4R: https://www.rensatis.com/carter_inf_eacute_rieur-140.html
- R15 Rensatis, RTA Vel Satis, spanning hulpriem: https://www.rensatis.com/tension_courroie_accessoires-126.html
- R16 Rensatis, RTA Vel Satis, katalysator F4R turbo: https://www.rensatis.com/moteur_f4r_turbocompresse-372.html
- R17 Autodoc, distributieriemkit en riem Laguna III 2.0 16V Turbo: https://www.autodoc.co.uk/car-parts/timing-belt-set-10505/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo en https://www.autodoc.co.uk/car-parts/timing-belt-10504/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R18 Autodoc, poly-V-riemkit 7PK1795: https://www.auto-doc.ie/car-parts/v-ribbed-belt-kit-14410/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R19 Autodoc, dynamo Laguna III 2.0 16V Turbo: https://www.autodoc.co.uk/car-parts/alternator-10450/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R20 Autodoc, aircocompressor Laguna III: https://www.autodoc.parts/car-parts/compressor-parts-10454/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R21 Autodoc, startmotor Laguna III: https://www.autodoc.co.uk/car-parts/starter-10459/renault/laguna/laguna-iii-grandtour-kt0-1 en Valeo 438501: https://www.auto-doc.ie/valeo/16166127
- R22 Autodoc, oliefilter Laguna III: https://www.autodoc.parts/car-parts/oil-filter-10359/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R23 Autodoc, oliekoeler Laguna III: https://www.autodoc.co.uk/car-parts/oil-cooler-10208/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R24 Autodoc, intercooler Laguna III: https://www.autodoc.co.uk/car-parts/intercooler-10493/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R25 Autodoc, bougies: https://www.autodoc.co.uk/car-parts/spark-plug-10251/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo en Oscaro NGK 4364: https://www.oscaro.com/bougie-dallumage-renault-laguna-iii-berline-2-0-i-16v-turbo-170-cv-boite-auto-686-28558-0-gt
- R26 Piecesauto, bobine crayon Laguna III 170: https://www.piecesauto.fr/pieces-detachees/renault/bobines-dallumage/laguna-iii-bt0-1.html
- R27 Autodoc, motorsteun Laguna III: https://www.autodoc.co.uk/car-parts/engine-mounting-bracket-10638/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R28 Autodoc, VVT-magneetventiel Laguna III Coupé F4Rt 811: https://www.autodoc.co.uk/car-parts/control-valve-camshaft-adjustment-15036/renault/laguna/laguna-coupe-dt0-1/27534-2-0-16v-turbo
- R29 Autodoc, gasklephuis Laguna III: https://www.autodoc.parts/car-parts/throttle-body-12439/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R30 Autodoc, injectoren Laguna III: https://www.autodoc.parts/car-parts/injector-nozzle-nozzle-holder-pde-12899/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R31 Autodoc, waterpomp Laguna III (Dayco, poelie Ø52,2): https://www.autodoc.co.uk/car-parts/water-pump-10191/renault/laguna/laguna-iii-bt0-1
- R32 Renault Laguna brochure 2008 (FR), stuurbekrachtiging "électro pompe" (alleen zoek-snippet gelezen; download geblokkeerd): https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2008-FR.pdf
- R33 Forum, vervanging groupe électropompe Laguna 3: https://www.lesamisdudiag.com/forum/les-logiciels-et-interfaces-auto/renault-dacia-nissan/can-clip/46302-remplacement-groupe-%C3%A9lectropompe-laguna-3
- R34 Renaultforums, oliefilter F4Rt 872 (Mégane III): https://www.renaultforums.co.uk/threads/oil-change-question-on-megane-mk3-tce180-f4rt-872-engine-similar-type-as-rs250-engine.604630
- R35 Mégane II Owners Club, oliefilterplaats: https://www.meganeownersclub.co.uk/forum/viewtopic.php?t=4906
- R36 Encycarpedia (9,5 : 1): https://www.encycarpedia.com/us/renault/09-laguna-coupe-2-0-16v-turbo-tce-170-wagon en Automoli (olie, koelvloeistof, 9,5): https://www.automoli.com/us/vehicles/renault/laguna/laguna-coupe-2116
- R37 Forum Renault-Laguna.com, F4Rt Laguna II (gasklep VDO-Siemens, compressie): http://www.renault-laguna.com/forum/problemes-moteur-f4rt-turbo-t24501.html
- R38 Autodoc, carterventilatie Laguna III: https://www.autodoc.co.uk/car-parts/crankcase-breather-10860/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- R39 Autodoc, motorolie Laguna III: https://www.autodoc.parts/car-parts/engine-oil-12094/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo en Motul-smeertabel: https://fr.scribd.com/document/522910185/Tableau-de-graissage
- R40 MHI TD04 wielmaten: https://uksaabs.co.uk/UKS/viewtopic.php?t=43959, https://forums.nasioc.com/forums/showthread.php?p=23476223, https://www.turborebuild.co.uk/mitsubishi-td04-14t-turbocharger-turbo-compressor-wheel-impeller-49377-06204214-49377-07313343
- R41 Revue technique Clio/Mégane F4R (inlaat "répartiteur", goujons, thermostaathuis): http://philch.free.fr/clio/6027A.pdf
- R42 Planète Renault forum, Vel Satis faseversteller: https://www.planeterenault.com/forum/post494491.html
- R43 Forum Renault-Laguna.com, vervangen intercooler: http://www.renault-laguna.com/forum/remplacement-echangeur-air-air-t5505-30.html
- R44 Piecesauto-pro, laadluchtslang Laguna III: https://www.piecesauto-pro.fr/pieces-detachees/conduit-d-air-de-suralimentation/renault-laguna/laguna-iii-bt0-1
- R45 Carter-Cash, oliepompketting Vel Satis 2.0 Turbo 170: https://www.carter-cash.com/pieces-auto/c/moteur/lubrification/chaine-commande-pompe-huile/m/renault/vel-satis
- R45b Autodoc club, olie verversen Laguna III (aftapplug vierkant): https://club.autodoc.co.uk/manuals/how-to-change-engine-oil-and-filter-on-renault-laguna-iii-hatchback-bt-replacement-guide-16953
- R46 IDF Moteurs, ruilmotor Laguna III 170 F4R-811: https://www.idfmoteurs.com/moteurs-echange/renault/laguna-iii/20-turbo-16v/170/f4r-811-14-11-0-ec

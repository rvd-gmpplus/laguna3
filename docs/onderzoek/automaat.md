# Onderzoek automaat (AJ0 / Jatco JF613E) en voorste aandrijfassen, Laguna III fase 2, 2.0T 170

Onderzoek van 13 oktober 2026. Geschreven voor de projectdocumentatie; onderdeelnamen zijn Nederlandse werkplaatstermen.
Statussen: **Bevestigd** (officiele bron, of twee onafhankelijke bronnen), **Aannemelijk** (een redelijke bron), **Geschat** (zelf afgeleid, methode vermeld), **Niet gevonden**.
Downloads stonden in de map `dl_jatco/` van de scratchpad van de bouwsessie (alleen gelezen, niet uitgevoerd); ze zitten niet in de repo.

## 0. Belangrijkste uitkomst: tegenspraak met het bestaande document

`docs/specificaties-en-bronnen.md` zegt "Aisin/Nissan-familie, code AJ0, aannemelijk". Dat klopt niet. De Renault-code **AJ0 is de Jatco JF613E** (Nissan: RE6F01A, Mitsubishi: F6AJA/W6AJA), gebouwd in de Jatco-fabriek in Yagi, Japan. De Aisin TF-80SC (met bijna dezelfde overbrengingsverhoudingen) is een ander type en zit niet in de Laguna III. De enige bron voor "Aisin" is AutoKarma, een automatisch gegenereerde reviewpagina over de 204 pk GT, geen techniekbron. Documentatie en modelbeschrijving moeten dus "Jatco JF613E (Renault AJ0)" zeggen.

Het interne model in `src/drivetrain.js` (twee planetaire sets, C1, C2, B1, B2, 28/34/15/60 tanden) wijkt af van de echte bak: drie planetaire sets, vijf schakelelementen plus een vrijloop, 42/45/21/70 tanden. Zie sectie 6.

## 1. Identiteit

| Gegeven | Waarde | Bron | Status |
|---|---|---|---|
| Renault-code | **AJ0** (6 versnellingen, intern project "BVA6") | Planete Renault technologiepagina; Masuma-catalogus noemt "AJ0" bij Laguna III 2.0 F4R 170 pk; Auto-Doc noemt "Type versnellingsbak: AJ0" bij Laguna III 2.0 16V Turbo 170 F4R 811 | **Bevestigd** (drie onafhankelijke bronnen) |
| Leverancier en type | **Jatco JF613E**, "fabriquee dans l'usine JATCO de Yagi au Japon" | Planete Renault; Jatco-persbericht 23-10-2006; Wikipedia "List of Jatco transmissions" (JF613E met foto Laguna) | **Bevestigd** |
| Zelfde bak onder andere namen | Nissan RE6F01A, Mitsubishi F6AJA (FWD) en W6AJA (AWD), Renault AJ0 | Transmission Digest; gearboxlist.com; Go4Trans | Bevestigd |
| Ontwerp | "Gebaseerd op het Lepelletier-systeem", ontwikkeld voor FWD; ~10% korter en lichter dan een 5-traps | Jatco-persbericht (noot 2) en ATRA/Gears-artikel jan/feb 2012 | **Bevestigd** |
| Gekoppeld aan 2.0T | Planete Renault: "Essence: 2.0 l 16v, 2.0 T, V6 3.5 l". Koppelcapaciteit "Essence 330 Nm" tegenover 270 Nm van de F4Rt | Planete Renault; Auto-Doc (F4R 811 + AJ0) | Bevestigd |
| Motorcode van deze auto | F4R 811 (2.0 16V Turbo 170 pk, 2007-2015) | Auto-Doc, Renault-handboek noemt "F4R Turbo" | Aannemelijk (nummer 811 uit onderdelencatalogus) |
| Overbrengingsverhoudingen (Mitsubishi F6AJA, officieel handboek) | 1e **4,199**; 2e **2,405**; 3e **1,583**; 4e **1,161**; 5e **0,855**; 6e **0,685**; achteruit **3,457**; eindoverbrenging **3,571**; stall-ratio omvormer **1,96** | Mitsubishi Group 23D "Automatic Transaxle Overhaul" (F6AJA) en gearboxlist.com (zelfde cijfers) | Bevestigd voor F6AJA; **Aannemelijk** voor Renault AJ0 (zelfde basisbak, Renault-cijfers niet gevonden) |
| Eindoverbrenging nagerekend | (45 / 42) x (70 / 21) = 3,571. Klopt met het handboek | Tandentallen uit Maktrans-onderdelenlijst (uitgaand tandwiel 42, tussenas 45/21, kroonwiel 70) | Geschat (reken-controle, bevestigt de bron) |
| Let op: eindoverbrenging per toepassing verschillend | Tussenas ook als 45/22 en kroonwiel ook als 69 tanden helicoidaal verkrijgbaar, dus er zijn minstens twee eindoverbrengingen (bijv. 3,409 bij 45/22) | Maktrans (JF613E-INT-4522, JF613E-RG-69) | Aannemelijk; welke in de 2.0T zit is **Niet gevonden** |
| Plausibiliteit topsnelheid | Band 225/45 R18, omtrek ca. 2,07 m; 220 km/h geeft in 6e (0,685 x 3,571) ca. 4330 tpm, onder het maximum van 5000 tpm bij het vermogenspunt | Eigen berekening | Geschat (plausibel, geen bewijs) |
| ATF-type | **Elf Elfmatic J6** ("Renault AJ0/AJ8", Nissan Matic J, Matic-J-klasse; viscositeit 33 mm2/s bij 40 C, 7,4 bij 100 C). Mitsubishi schrijft DiaQueen ATF-J3 voor, dezelfde klasse | Elf-catalogus, Schmierstoff-Versand (Elf-datablad), ak24parts, Mitsubishi-handboek | **Bevestigd** |
| ATF-inhoud | **8 liter**, "lubrifiee a vie" (levensduurvulling volgens Renault) | Planete Renault | Bevestigd (twee bronnen noemen 7,6 tot 8,1 l: Go4Trans 7,6 l; gearboxlist 8,1 l) |
| Gewicht | **93 kg droog** | Planete Renault | Aannemelijk (een bron). Gevuld, geschat ca. 100 kg (93 + 8 l x 0,87 + restolie in omvormer) |
| Lengte | **385 mm** inclusief omvormerhuis | Planete Renault | Aannemelijk |
| Assen en hartafstand | **3 assen**, hartafstand "entraxe" **197 mm**; huis van spuitgietaluminium; kabelbediening | Planete Renault | Aannemelijk. Dat 197 mm de afstand ingaande as naar differentiee is, is **Geschat** (de pagina zegt alleen "entraxe") |
| Plaats | Dwars, links van de motor (versnellingsbak links, distributie rechts) | Rechter aandrijfas ~962 mm tegenover linker ~640 mm in twee catalogi | Geschat (afgeleid uit aslengtes), past bij bestaand model |
| Koppelomvormer | 3-elementen (pompwiel, turbinewiel, leidwiel), overbruggingskoppeling met torsiedemper; lock-up mogelijk in **2e tot en met 6e** | Mitsubishi-handboek (3-element, lock-up); Planete Renault ("pontage lock-up: 2,3,4,5 et 6eme", "systeme amortisseur du convertisseur") | Bevestigd |
| Koppelomvormer uitgebreid | "Glissement pilote" en "reduction de trainee" (bak gaat bij stilstaan in een soort neutraal) | Planete Renault | Bevestigd |
| Koeling | Water gekoelde ATF-koeler **in het carter geintegreerd**, twee koelleidingen (IN en OUT) op het zijdeksel | Planete Renault; Mitsubishi-handboek ("water-cooled transmission fluid cooler", "cooler tube IN/OUT") | Bevestigd |
| Handbediening | Keuzehendel P-R-N-D op de middenconsole; vanuit D de hendel **naar links** voor handmatig schakelen, naar voren = opschakelen, naar achteren = terugschakelen; ontgrendelknop op de hendel en nooduntgrendeling via een gat; stand weergegeven op het dashboard. Selector bediend via **kabel** | Renault Laguna III fase 2 handboek "Automatic gearbox (1/3) en (2/3)" (EN, 936-5); Planete Renault ("commande a cable", "levier a commande impulsionnelle") | **Bevestigd** |
| Schakelflippers | Het handboek noemt **geen** flippers, alleen de hendel | Renault-handboek | Aannemelijk (afwezigheid niet bewijsbaar) |
| ESC-ingreep | De bak kan zelf schakelen of een handmatige schakeling weigeren (ESC, motorbescherming); in de kou kan handmatig schakelen geblokkeerd zijn | Renault-handboek | Bevestigd |

## 2. Interne opbouw (volgorde langs de ingaande as, vanaf de motorzijde)

Hoofdbronnen: Mitsubishi F6AJA/W6AJA overhaulhandboek (Group 23D, tekeningen 23D-18, -22, -23, demontagestappen 47 tot 92), ATRA Jatco 6-Speed webinar en Gears-artikel (2012), Transmission Digest quick reference. Het Mitsubishi-handboek gaat over de zusterbak met dezelfde hardware, Renault-details (bijv. klepblok met 5 drukschakelaars) kunnen afwijken: status dus **Aannemelijk** tenzij anders vermeld. Namen tussen haakjes zijn de Engelse handboektermen.

### 2.1 Schakelelementen (5 plus vrijloop), bevestigd door Planete Renault ("5 jeux de freins et embrayages a disques") en ATRA

| Element | Functie volgens ATRA | Actief in |
|---|---|---|
| **Lage koppeling** (Low clutch) | draagt het ingangskoppel naar het FR-holwiel | 1, 2, 3, 4 |
| **3-5-achteruitkoppeling** (3-5 Reverse clutch) | brengt het gereduceerde koppel (holwiel van de reductieset) naar het FR-zonnewiel | 3, 5, R |
| **Hoge koppeling** (High clutch) | brengt het ingangskoppel van de ingaande as naar de RR-drager | 4, 5, 6 |
| **2-6-rem** (2-6 brake) | houdt het RR-zonnewiel vast | 2, 6 |
| **Lage/achteruitrem** (Low-reverse brake) | houdt de RR-drager vast | R en 1e (handmatig / motorrem) |
| **Vrijloop** (One-way clutch, sprag) | houdt de RR-drager vast bij optrekken in 1e | 1 (alleen aandrijvend) |

Schakelschema afgeleid uit de ATRA-tekst, dat zelf op een punt (lage/achteruitrem "4e, 5e, 6e") duidelijk een zetfout bevat, en gecontroleerd met de Lepelletier-logica en de Transmission Digest-opmerking dat de L/R-schakelsolenoide aan staat in P, R, N en 1e:

| Versn. | Lage koppeling | 3-5-R | Hoge koppeling | 2-6-rem | L/R-rem | Vrijloop | Verhouding |
|---|---|---|---|---|---|---|---|
| 1 | X |  |  |  | (X) | X | 4,199 |
| 2 | X |  |  | X |  |  | 2,405 |
| 3 | X | X |  |  |  |  | 1,583 |
| 4 | X |  | X |  |  |  | 1,161 |
| 5 |  | X | X |  |  |  | 0,855 |
| 6 |  |  | X | X |  |  | 0,685 |
| R |  | X |  |  | X |  | 3,457 |

Status: elementen en wanneer ze actief zijn **Aannemelijk** (ATRA en handboek, een beschrijving per element); de tabel als geheel **Geschat** omdat zij is samengesteld (niet als tabel gevonden).

### 2.2 Tandwielsets: drie planetaire sets

Planete Renault: "constituee de trois trains epicycloidaux" (**Bevestigd**). Mitsubishi benoemt ze als:

1. **Reductieset** (Reduction sun gear, carrier, internal gear), in het zijdeksel naast de hoge koppeling; het holwiel zit aan de trommel van de hoge koppeling (demontagestap 71). Dit is de Lepelletier-voorreductie. Aannemelijk.
2. **FR-set** (voor): FR-zonnewiel, FR-holwiel, FR-drager; handelsbeschrijving (onderdelenhandel) "four pinion front planetary", dus **vier planeetwielen**. De FR-drager is de naaf van het uitgaande tandwiel (42 tanden). Aannemelijk.
3. **RR-set** (achter): twee zonnewielen (voorzijde en achterzijde) op een drager; handelsbeschrijving "3 satellites, 29 teeth per satellite", zonnewiel nr. 2 heeft **49 tanden**, buitendiameter 65,5 mm. Waarschijnlijk Ravigneaux-achtig met twee rijen planeetwielen; het aantal lange en korte planeetwielen is **Niet gevonden**. Aannemelijk.

De precieze koppeling tussen reductiedrager, 3-5-R-trommel en FR/RR (de "bedrading" van het Lepelletier-schema) is **Niet gevonden** als tekening; teken die schematisch.

### 2.3 Axiale volgorde vanaf de motor (aan het handboek ontleend)

Demontagevolgorde 34 tot 92 in het handboek en lijst 23D-18 geven, van motorzijde naar zijdeksel:

1. Koppelomvormer (in het omvormerhuis, aan de startkrans van de motor)
2. Oliepomp met oliezeef (zeef zit vast aan de pomp, met magneet)
3. Ingaande as (347 mm lang) en **3-5-R-koppeling**
4. **FR-set**: zonnewiel, holwiel + drager
5. **Lage koppeling** (op de trommelsteun, de trommel is ook het toerentalmerk voor de ingaande-toerentalsensor)
6. **Uitgaand tandwiel** (42 tanden) op de middensteun, met parkeerrad
7. **RR-set** (zonnewiel voorzijde, drager, zonnewiel achterzijde) met **L/R-rem** (zuiger in het huis) en **vrijloop**
8. **Hoge koppeling** met naaf, **reductieset**
9. **2-6-rem** (pakket in het huis, zuiger in het zijdeksel)
10. Zijdeksel met koelleidingen en water-ATF-koeler

Daarnaast, op twee evenwijdige assen: tussenas (**reductie-as**, 45 tanden naar de 42 van het uitgaande tandwiel, 21 tanden naar het kroonwiel) en differentieel met kroonwiel (**70 tanden**). Alles loopt in conische rollagers met afstelplaatjes. Status: **Aannemelijk**.

### 2.4 Hydrauliek, sensoren, elektronica

| Onderdeel | Gegeven | Bron | Status |
|---|---|---|---|
| Oliepomp | Onderdeelnr. 2791A037; type pomp (tandwiel, sikkel, gerotor) | Maktrans, Shenghai | Pomp bestaat (Bevestigd), **type Niet gevonden** |
| Oliezeef | Zit direct op de pomp aan de binnenkant; alleen met demontage van de bak te vervangen | Mitsubishi-handboek (zeef met pomp verwijderd) en forum Laguna 2.0T 170 | Aannemelijk |
| Klepblok | 1 blok in het huis onder een afdekdeksel (control valve cover) | Mitsubishi-handboek; Renault-uitvoering met 5 drukschakelaars | Aannemelijk |
| Solenoides | **8**: 6 lineair (3 normaal-hoog: 3-5-R, hoge koppeling, leidingdruk; 3 normaal-laag: lock-up plus L/R-rem, 2-6-rem, lage koppeling) en 2 aan/uit (lage-koppeling-schakel, L/R-schakel); lineair ca. 5,3 ohm, 300 Hz | ATRA/Gears (2012), Transmission Digest | **Bevestigd** (twee bronnen) |
| Drukschakelaars | **5** bij de Renault-uitvoering (lage koppeling, hoge koppeling, 2-6, L/R, 3-5-R); Nissan 3 | Automatic Choice-catalogus, ATRA | Bevestigd |
| Accumulators | 4: 3-5-R, hoge koppeling, lage koppeling, 2-6 | Transmission Digest | Aannemelijk |
| Kleppen | Drukregelaar, pilootklep, lock-up-regelklep, omvormer-regelklep, handklep (manual valve), terugslagkogeltjes (8 mm en 5,5 mm) | Transmission Digest | Aannemelijk |
| Olietemperatuursensor | TFT in het klepblok, NTC (3,51 kohm bij 25 C) | Transmission Digest | Aannemelijk |
| Toerentalsensoren | **2** hall-sensoren, 3-draads: **ingaand** (leest de trommel van de lage koppeling) en **uitgaand** (leest het uitgaande tandwiel) | ATRA Jatco 6-Speed webinar | Bevestigd (twee ATRA-bronnen) |
| Standenschakelaar | PNP-schakelaar bij de handhefboom, met detentveer | Mitsubishi-handboek, ATRA | Aannemelijk |
| Parkeerblokkering | Parkeerpal, palas, retourveer en palplaatje; parkeerrad op het uitgaande tandwiel | Mitsubishi-handboek | Aannemelijk (het parkeerrad zelf is **Geschat**) |
| Huisdelen | Omvormerhuis, transmissiehuis, zijdeksel, klepblokdeksel, drie bouten-sets (Torx E16, E18, E20) | Mitsubishi-handboek, ATRA | Bevestigd |
| Carter | Geen klassieke onderpan met filter; de zeef zit binnenin. (Een Amazon-listing "filter and oil pan" is voor een andere Mitsubishi-toepassing en niet betrouwbaar) | Mitsubishi-handboek, forum | Aannemelijk |
| ATF-peilpunt | "ATF adjusting bolt" (overloop/peil), vulbuis met peilstok in het Mitsubishi-handboek; voor AJ0 **Niet gevonden** | Mitsubishi-handboek | Voor AJ0 Niet gevonden |

### 2.5 Aantal plaatjes per pakket (aftermarket-catalogus Automatic Choice, JF613E 2007-)

| Pakket | Frictieplaten | Stalen platen | Bron | Status |
|---|---|---|---|---|
| 3-5-achteruitkoppeling | 5 | 5 | Automatic Choice (FRP11/STP11) | Aannemelijk |
| Lage koppeling | 5 | 4 | idem (FRP13/STP13) | Aannemelijk |
| L/R-rem | 4 | 4 | idem (FRP14/STP14); pakketdikte 17 mm | Aannemelijk |
| 2-6-rem | 4 | 3 | idem (FRP15/STP15); pakketdikte 19,6 mm | Aannemelijk |
| Hoge koppeling | 6 | 6 | idem (FRP12/STP12) | Aannemelijk |

Elk pakket heeft ook een drukplaat (retaining plate; bij L/R en 2-6 afgesteld in stappen van 0,2 mm: L/R 2,9 tot 4,1 mm, 2-6 2,0 tot 3,0 mm, speling 1,9 tot 2,2 mm) en een borgring. De koppelingstrommels zijn in het handboek niet uit elkaar gehaald (alleen als complete eenheid vervangbaar); zuiger, terugdrukveer en afdichtringen daarbinnen zijn dus **schematisch**.

## 3. Hiërarchische stuklijst voor de explosietekening (Nederlands)

Legenda: aantal, status. Status **A** = Aannemelijk, **B** = Bevestigd, **G** = Geschat, **N** = Niet gevonden / schematisch. "Hb" betekent: namen en aantallen uit het Mitsubishi F6AJA-handboek (zusterbak).

**Automaat (AJ0 / JF613E), 1x, B**

1. **Koppelomvormer**, 1x, B (3 elementen)
   - Omvormerdeksel (pompwielkap), 1x, A
   - Pompwiel (impeller) met schoepen, 1x, A (schoepen aantal schematisch)
   - Turbinewiel met naaf op de ingaande as, 1x, A
   - Leidwiel (stator), 1x, A
   - Vrijloop van het leidwiel (sprag), 1x, A
   - Overbruggingskoppeling (lock-up) met frictievoering, 1x, B
   - Torsiedemper met veren, 1x, B (veren schematisch, 6 stuks aanbevolen)
   - Axiale lagers/naaldlagers leidwiel, 2x, N (schematisch)
   - Aandrijfnaaf van de pomp, 1x, A
   - Bevestiging aan de startkrans: schroefdraad 10 mm x 1,25, aantal N (schematisch 4 tapeinden/bouten), A
2. **Omvormerhuis**, 1x, B
   - Keerring omvormerhuis (hoofdkeerring), 1x, A (Hb: speciaalgereedschap voor omvormerhuis-olieafdichting)
   - Keerring differentieel (side oil seal, motorzijde), 1x, B (Hb)
   - O-ring omvormerhuis, 1x, A
   - Bouten omvormerhuis (47 N·m), aantal N, schematisch
3. **Oliepomp-groep**, B
   - Pomphuis/pompdeksel, 1x, A (type pomp N, schematisch binnenrotor/buitenrotor)
   - Pompbus (bushing), 1x, B (Maktrans, Automatic Choice)
   - Dichtringen (sealing ring kit) op de ingaande as, aantal N (schematisch 3)
   - Oliezeef met O-ring, 1x, A (nooit hergebruiken, Hb)
   - Magneet op de zeef, 1x, B (Hb)
   - O-ring pomp/huis, 1x, A
4. **Ingaande as** (347 mm), 1x, B, met O-ring, 1x, A
5. **3-5-achteruitkoppeling**, 1x, B
   - Trommel (drum), 1x, A
   - Zuiger met O-ringen, 1x, A (N: dubbele afdichting)
   - Terugdrukveer(pakket) en borgring, 1x, N (schematisch)
   - 5 frictieplaten (OD 159 mm, 36 tanden, 1,6 mm), A
   - 5 stalen platen, A
   - Drukplaat en borgring, 1+1, A
   - Naaldlager en lagerring (afstelring 2,0 tot 3,0 mm), 2, A (Hb)
6. **FR-planeetwielset** (voor), 1x, A
   - FR-zonnewiel, 1x, A
   - FR-holwiel, 1x, A
   - FR-drager met 4 planeetwielen, 1+4, A (aftermarket: "four pinion")
   - Naaldlagers tussen zonnewiel/holwiel/drager, 3x, A (Hb)
7. **Lage koppeling**, 1x, B
   - Trommel (draagt het ingaande-toerentalmerk), 1x, A
   - Zuiger, retourveer, O-ringen, 1x, N (schematisch)
   - 5 frictieplaten (OD 154 mm, 36 tanden, 1,4 mm), A
   - 4 stalen platen (ID 132,6 mm, 48 tanden, 1,8 mm), A
   - Drukplaat en borgring, A
   - Trommelsteun (drum support) met drukring (afstelring 1,5 tot 2,7 mm), 1+1, A (Hb)
8. **Uitgaand tandwiel** (42 tanden, met conisch lager), 1x, A (Maktrans, Hb)
   - Parkeerrad, 1x, G
9. **RR-planeetwielset** (achter), 1x, A
   - RR-zonnewiel voorzijde, 1x, A
   - RR-drager met planeetwielen (3 stuks per rij volgens aftermarket), 1+6, N (rij-indeling schematisch)
   - RR-zonnewiel achterzijde (49 tanden), 1x, A
   - Naaldlagers en lagerringen, 4x, A (Hb)
10. **Lage/achteruitrem (L/R)**, 1x, B
    - Zuiger (buiten-OD 206,7 mm) met 2 D-ringen, 1+2, A (Hb, Maktrans)
    - Schotelveer (diaphragm spring) en veerhouder, 1+1, A (Hb)
    - Borgring zuiger, 1x, A (Hb)
    - 4 frictieplaten (OD 205 mm, 36 tanden, 1,5 mm), A
    - 4 stalen platen, A
    - Drukplaat (afstelling) en borgring, 1+1, A (Hb)
    - Vrijloop (sprag) met naaf en borgring, 1+1, A (Hb)
11. **Hoge koppeling**, 1x, B
    - Trommel met reductie-holwiel, 1x, A (Hb)
    - Zuiger, annuleerdeksel (cancel cover, balanszuiger) en borgring, 1x, A/N
    - 6 frictieplaten, 6 stalen platen, A
    - Naaf (high clutch hub), 1x, A
    - Axiaal naaldlager aan de trommel (OD 84,8 mm, ID 67,75 mm, 3,4 mm), 1x, A
12. **Reductieplaneetwielset**, 1x, B (Planete Renault: drie sets)
    - Reductiezonnewiel (staat vast in het zijdeksel), 1x, A
    - Reductiedrager met planeetwielen, 1x, planeetwielen N (schematisch 3)
    - Reductieholwiel, 1x, A
    - Naaldlagers (2) en afstelring (1,0 tot 2,2 mm), A (Hb)
13. **2-6-rem**, 1x, B
    - Zuiger in het zijdeksel met 2 D-ringen, 1+2, A (Hb)
    - Veerhouder met retourveren, 1x, A (Hb)
    - Borgring, 1x, A (Hb)
    - 4 frictieplaten, 3 stalen platen (stalen: OD 220 mm, ID 182 mm, 2,2 mm, 17 tanden), A
    - Drukplaat (afstelling) en borgring, A
14. **Zijdeksel** met water-ATF-koeler, 1x, B
    - Dichtringen (seal rings) in het zijdeksel, aantal N (schematisch 3), A (Hb)
    - Water gekoelde ATF-koeler, 1x, B
    - Koelleiding IN en OUT met holle bouten en O-ringen, 2+2, B
    - Keerring zijdeksel (differentieel), 1x, B
    - Naaldlager en afstandsring (afstelling 2,8 tot 4,0 mm), A (Hb)
15. **Transmissiehuis**, 1x, B (spuitgietaluminium)
    - Parkeerblokkering: parkeerpal, palas, retourveer, palplaatje, 4x, A (Hb)
    - Smeerbuis reductie-as, 1x, A (Hb)
    - Keerringen terminal/kabel, 2x, A (Hb)
    - Ontluchtingsslang en -nippel, 1x, A (Hb)
    - ATF-peilbout met O-ring, 1x, A (Hb; AJ0 N)
16. **Tussenas (reductie-as)**, 1x, A
    - As met 45 tanden (aan het uitgaande tandwiel) en 21 tanden (rondsel), 1x, A
    - Twee conische rollagers met buitenringen, 2+2, A
    - Afstelplaatje (preload 0,16 tot 0,22 mm; 0,12 tot 0,98 mm), 1x, A (Hb)
17. **Differentieel**, 1x, A
    - Kroonwiel (70 tanden), 1x, B (twee bronnen), 10 bouten, 10x, B (144 N·m, Hb)
    - Differentieelhuis, 1x, A (Hb: niet te demonteren)
    - Satellietas (1), twee satellietwielen, twee zijwielen, dikteringen: schematisch, N (aantal planeetwielen van het differentieel niet gevonden)
    - Twee conische rollagers met buitenringen, 2+2, A (Hb)
    - Afstelplaatje (preload 0,19 tot 0,25 mm; 0,12 tot 1,22 mm), 1x, A (Hb)
    - Keerringen links en rechts (zijkeerringen), 2x, B
18. **Hydraulische besturing**, 1x, A
    - Klepblok (control valve) met afdekplaat en pakking, 1+1+1, A
    - 6 lineaire solenoides, 2 aan/uit-solenoides, 8x, B
    - 5 drukschakelaars, 5x, B
    - Temperatuursensor TFT, 1x, A
    - 4 accumulatorzuigers met veer, 4x, A
    - Handklep, detentveer en -plaat, 3x, A
    - Interne kabelboom met connector (terminal assembly) en borgring, 1+1, A
    - Terugslagkogeltjes (8 mm) en zeefjes, aantal ca. 13, A (schematisch)
19. **Bediening en sensoren buiten**, A
    - Handbedieningshendel op de keuzeas, 1x, A
    - Kabelbeugel, 1x, A
    - Standenschakelaar (PNP), 1x, A
    - Ingaande-toerentalsensor (turbine), 1x, B
    - Uitgaande-toerentalsensor, 1x, B
20. **Startmotor** (op de automaat), 1x, G (bestaand model)

## 4. Aandrijfassen voorzijde en motor-/bakophanging

| Gegeven | Waarde | Bron | Status |
|---|---|---|---|
| Linker as | Lengte **640 mm** (aftermarket: 640 tot 656 mm) bij AJ0; kort, rechtstreeks in het linker zijwiel | Auto-Doc/ROTOVIS FDS2379 ("Type de boite: AJ0, longueur 640"), SNR DK55.118 (656 mm), meerdere catalogi | Bevestigd (meerdere catalogi) |
| Rechter as | Lengte **962 mm** bij 6-traps automaat; lange as met **tussenlager** | Autodoc.co.uk Laguna Coupe 2.0 16V Turbo F4R 811: "Right, 962 mm, 8-ball joint, 6-Speed Automatic, intermediate shaft bearing"; meerdere catalogi noemen 960 tot 990 mm | Aannemelijk (zelfde aandrijflijn in de Coupe; berline waarschijnlijk gelijk) |
| Uitvoering rechts | De 350 tot 367 mm "tweede lengte" in de catalogi is waarschijnlijk de **tussenas** (stam met lager) van de rechter as; de as heeft dus een lange binnenstam die in een kogellager draait | Auto-Doc ("986, 350 mm" en "984, 367 mm, avec roulement") | **Geschat** (interpretatie van catalogusmaten) |
| Tussenlager | Kogellager **35 x 62 x 14 mm**, positie rechts; de steunbeugel op het blok is niet gevonden | Autodoc (rechts, 35/62/14) | Aannemelijk; beugel **Niet gevonden** |
| Binnenste homokineet | **Tripode** (driepoot, glijdend), bak-kant, buitendiameter 87 tot 88 mm | catalogi (Rotovis: "rotule cote boite 87"; SNR 88/98) | Aannemelijk |
| Buitenste homokineet | **Kogelkoppeling (Rzeppa) met 8 kogels**, wielzijde, buitendiameter 90 tot 94,7 mm | Autodoc ("version: 8 balls", Rotovis 90, andere 94,7) | Aannemelijk |
| Vertanding | Wielzijde **27** splines; bakzijde bij AJ0 **30** splines (de **39**-splines zijn voor de handbak); wielzijde draadeinde M22 x 1,5 | Auto-Doc (F4R 811 + AJ0: 30), pieces24 (M22 x 1,5) | Aannemelijk |
| Manchetten en klemmen | Elke koppeling heeft een stofhoes (manchet) met klem(men); sets bestaan als "Joint Kit / Bellow Kit" van SNR | Autodoc (SNR-set KJR/KSB/KSR) | Aannemelijk; aantal klemmen **Niet gevonden** (2 per manchet schematisch) |
| Trillingsdemper (damper weight) | Niet gevonden, ook geen aanwijzing voor dit motortype | | **Niet gevonden** |
| Wielnaaf | Wiellager als complete **naafeenheid** met vlak (flens 143 mm, 5 gaten), 4 bouten naar het fusee, met **geintegreerd magnetisch ABS-ring** (codeur) in de keerring; ABS-sensor steekt door het lager; middenmoer met sleutel van 30 mm (forum: 27 mm); wordt met borglijm vastgezet | Auto-Doc (kit met ABS-ring, 143 mm flens), Oscaro-handleiding (30 mm, ABS-sensor door lager), Planete Renault forum (27 mm) | Aannemelijk; sleutelmaat tegenstrijdig, koppel **Niet gevonden** |
| Motorsteunen | **Rechts boven** (distributiezijde): rubber-metalen steun; **Links** (bakzijde): rubber-metalen steun; daarnaast een lagere **koppelsteun** (hydro-/rubber-steun voor, onder) bij sommige motoren | Auto-Doc (F4R 811: upper right + left rubber-metal), Auto-Doc Coupe ("Right front, lower hydro mount") | Aannemelijk; welke lage steun voor de 2.0T geldt is **Niet gevonden** |
| Keersteunen op de bak | In het Mitsubishi-handboek: "FR roll stopper bracket" en "RR roll stopper bracket" (bouten 90 N·m) aan de bak | Mitsubishi-handboek | Aannemelijk als analoog voor Renault |

## 5. Afmetingen voor de geometrie

| Maat | Waarde | Bron | Status |
|---|---|---|---|
| Totale lengte van de bak | 385 mm (omvormerhuis tot zijdeksel) | Planete Renault | Aannemelijk |
| Ingaande as | 347 mm lang | Maktrans | Aannemelijk |
| Hartafstand ingaande as - differentieel | 197 mm | Planete Renault ("entraxe") | Aannemelijk (interpretatie Geschat) |
| Reductie-as: tanden | 45 en 21 | Maktrans | Aannemelijk |
| Kroonwiel | 70 tanden; buitendiameter ca. 170 tot 185 mm | tanden uit Maktrans; diameter afgeleid uit de modulus (~2,5) en de hartafstand 197 mm | Diameter **Geschat** |
| Uitgaand tandwiel | 42 tanden | Maktrans | Aannemelijk |
| Koppelomvormer | buitendiameter ca. 250 tot 280 mm (Mitsubishi V6-uitvoering 11 inch = 279 mm; Renault 2.0 niet gevonden) | gopnh.com | **Geschat** |
| Huis | grootste diameter ca. 250 tot 260 mm (nodig voor 220-mm-platen plus wanden), omvormerhuis ca. 300 mm | afgeleid | Geschat |
| Platen | 3-5-R: OD 159 mm; lage koppeling: OD 154 mm, stalen ID 132,6 mm; L/R: OD 205 mm; 2-6: stalen OD 220 mm, ID 182 mm, 2,2 mm dik, 17 tanden; L/R-zuiger OD 206,7 mm | Maktrans, Automatic Choice | Aannemelijk |
| Pakketdikte | L/R: 17 mm voor 4 frictieplaten; 2-6: 19,6 mm voor 4 | Maktrans | Aannemelijk |
| Axiale indeling (indicatief) | omvormer 0 tot 115; pomp 115 tot 150; 3-5-R 150 tot 205; FR-set 205 tot 245; lage koppeling + uitgaand 245 tot 290; RR-set + L/R-rem 290 tot 335; hoge koppeling + reductie + 2-6-rem + zijdeksel 335 tot 385 (mm vanaf het motorvlak) | afgeleid van 385 mm en de volgorde | **Geschat** |
| Aandrijfas links | 640 mm; binnenstam kort (ca. 64 tot 74 mm), 30 splines; koppeling binnen OD 87 mm, buiten OD 90 mm | catalogi | Aannemelijk |
| Aandrijfas rechts | 962 mm; tussenas ca. 350 tot 367 mm met kogellager 35 x 62 x 14 mm; dezelfde koppelingen | catalogi | Aannemelijk / Geschat |
| Aandrijfasdiameter (schacht) | niet gevonden; schatting 24 tot 28 mm | | **Geschat** |
| Differentieel-uitgangen | links ligt dicht bij het huis, rechts passeert de motor via de tussenas | afgeleid | Geschat |

## 6. Gevolgen voor het huidige model (`src/drivetrain.js`)

| Nu in het model | In werkelijkheid | Actie |
|---|---|---|
| 2 planetaire sets (voor, achter) | **3 sets**: reductie, FR, RR | reductieset toevoegen (in de hoge-koppelingstrommel), FR met 4 planeetwielen, RR met 3+3 |
| Koppeling C1, C2, rem B1, rem B2 | Lage koppeling, 3-5-R, hoge koppeling, 2-6-rem, L/R-rem + vrijloop | Hernoemen, plaatjes 5/5, 5/4, 6/6, 4/3, 4/4 |
| 6 stuks "Magneetklep" | **8 solenoides** (6 lineair, 2 aan/uit) + 5 drukschakelaars | 6+2 plus schakelaars |
| Uitgaand 28, aangedreven 34, rondsel 15, kroonwiel 60 | 42, 45, 21, 70 | Tandentallen aanpassen (eindoverbrenging 3,571) |
| "ATF-filter" en "Carter automaat" onder de bak | Zeef zit **op de pomp** met magneet; geen losse onderpan | Zeef bij de pomp, onderpan weg of als klepblokdeksel |
| Geen koeler | **Water-ATF-koeler** met twee leidingen op het zijdeksel | toevoegen |
| Geen parkeerblokkering | Parkeerpal, as, veer, plaat, parkeerrad | toevoegen |
| Ingaande-/uitgaande-toerentalsensor, PNP | aanwezig als aparte onderdelen | toevoegen |
| Aandrijfassen links en rechts gelijk behalve lengte | Links 640 mm kort; rechts 962 mm met tussenas en kogellager | rechter as met tussenas en lager |
| ABS-ring onbepaald | Magnetische ring in het naaflager, geen losse ring op de as | In naafeenheid opnemen |
| "Aisin" in documentatie | **Jatco JF613E / Renault AJ0** | Alle teksten corrigeren |

## 7. Open punten

- Renault-specifieke overbrengingsverhoudingen en eindoverbrenging van de AJ0 in de 2.0T: niet gevonden; Mitsubishi-waarden gebruikt.
- Tekening van de interne koppeling tussen reductieset, 3-5-R-trommel en FR/RR (Lepelletier-bedrading): niet gevonden.
- Type oliepomp, aantal planeetwielen in reductieset en differentieel, aantal klemmen per manchet, trillingsdemper, wielmoerkoppel, steunbeugel van het tussenlager: niet gevonden.
- Of de berline (BT) dezelfde aandrijfaslengtes heeft als de Coupe (DT): catalogi tonen dezelfde AJ0-lengtes (640/962), maar Coupe-specifiek.
- Of de Laguna III-uitvoering een vulbuis met peilstok heeft: niet gevonden.

## 8. Bronnen

- Mitsubishi Group 23D Automatic Transaxle Overhaul (F6AJA/W6AJA), PDF van akpphelp.ru: https://akpphelp.ru/assets/template/redesign/files/guidelines/jf613e-rukovodstvo-schemi.pdf
- Planete Renault, "La boite de vitesse automatique AJ0": https://www.planeterenault.com/1-gamme/40-technologie/4894-boitevitesse-automatique-aj0
- Planete Renault forum, Laguna III en AJ0 (Jatco, DP0/SU voorgangers): https://www.planeterenault.com/forum/post428814.html
- Jatco persbericht 6-speed JF613E (23-10-2006, Lepelletier-noot): https://www.jatco.co.jp/english/archive/news/2006/061023E.html
- ATRA/Gears, Mike Souza, "Introducing the Jatco 6-Speed" (jan/feb 2012): https://fr.scribd.com/document/236437335/Mitsubishi-f6aja-2012-1-12
- ATRA Jatco 6-Speed webinar (2014): https://atracom.blob.core.windows.net/webinars/import/jatco6speed_intro.pdf
- Transmission Digest, Jatco JF613E quick reference: https://www.transmissiondigest.com/?p=33684
- Wikipedia, List of Jatco transmissions: https://en.wikipedia.org/wiki/List_of_Jatco_transmissions
- gearboxlist.com, Jatco JF613E: https://gearboxlist.com/jatco/jf613e
- Go4Trans JF613E: https://shop.go4trans.com/transmissions-info/jf613e
- Automatic Choice, JF613E-catalogus (plaatjesaantallen, Renault-klepblok met 5 drukschakelaars): https://repuestoscambiosautomaticos.com/modelo/despiece/descargar/257?v=6a1f19c1f389e
- Maktrans JF613E-onderdelen (tandentallen, afmetingen): https://maktrans.net/zaptchasti-akpp/jatco/jf613e_f6aja
- Masuma, Laguna III 2.0 F4R 170 pk, AJ0-olie: https://masuma.parts/find-car-parts/renault-laguna-iii-20l-f4r-bt15-liftback-14260/automatic-transmission-cvt-fluid-145
- Auto-Doc, aandrijfassen Laguna III 2.0 16V Turbo F4R 811 (AJ0, 640 mm, 30 splines): https://www.auto-doc.fr/pieces-detachees/arbre-de-transmission-10162/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- Autodoc, Laguna Coupe 2.0 16V Turbo, rechter as 962 mm met tussenlager: https://www.autodoc.co.uk/car-parts/drive-shaft-10162/renault/laguna/laguna-coupe-dt0-1/27534-2-0-16v-turbo
- Auto-Doc, motorsteunen F4R 811: https://www.auto-doc.ie/car-parts/engine-mounting-bracket-10638/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo
- Auto-Doc, wiellagerkit met ABS-ring: https://www.auto-doc.be/pieces-detachees/roulement-de-roue-10679/renault/laguna/laguna-iii-bt0-1
- Oscaro, voorwiellager Laguna III: https://tutoriels.oscaro.com/Guide/Changer+le+Roulement+roue+avant+sur+Renault+Laguna+III/3227
- Renault Laguna III fase 2 handboek (EN): https://www.user-manual.renault.com/sites/renault/files/Laguna_3_Ph2_-_936-5_ENG.pdf
- Elf Elfmatic J6 (AJ0/AJ8): https://www.schmierstoff-versand.de/en/automotive/automatic-transmission-atf-oils/ELF-Elfmatic-J6.html en https://lubricants.catalog.elf.com/corporate/fr_FR/n5s_elfmatic-j6
- ak24parts, Renault Matic J6 (AJ0): https://www.ak24parts.com/en/articles/renault-specifications
- Forum Laguna 2.0T 170, zeef zit op de pomp: https://www.facebook.com/groups/200829035451871/posts/311625444372229
- gopnh.com, omvormer JF613E (11 inch): https://gopnh.com/Mitsubishi-Transmissions/F6AJA-JF613E/6481
- AutoKarma ("Aisin", niet betrouwbaar): https://autokarma.pl/renault-laguna-iii-2-0-gt-204-km-6at/

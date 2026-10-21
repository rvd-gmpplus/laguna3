# Kennisbasis Renault Laguna III 2.0T 170 automaat (F4Rt 813 waarschijnlijk, AJ0)

Deze kennisbasis gaat over de auto achter het model: een Renault Laguna III hatchback uit 2011 (fase 2), 2.0 16V Turbo met 125 kW (170 pk), motor F4Rt 813 (voertuigtype BT15, zie beslissingen), zestraps automaat AJ0, uitvoering Initiale Paris.

De basis is het onderzoeksrapport dat de gebruiker op 14 oktober 2026 aanleverde ("Renault Laguna III 2.0 16V Turbo (F4R 811) automaat, hatchback 2011: geverifieerde kennisbasis en verrijkingsplan"). Op dezelfde dag is het rapport naast de repo gelegd, met gericht onderzoek aangevuld en waar nodig gecorrigeerd. De belangrijkste nieuwe bron is de Renault-persmap van augustus 2007 met de technische tabellen per motor. Die tabellen gelden voor fase 1 (Euro 4, bij de F4Rt 811). De auto van de gebruiker is fase 2 met Euro 5 en waarschijnlijk een F4Rt 813; gelijke waarden zijn voor de 813 Aannemelijk en niet apart bevestigd.

## Statussen

| Status | Betekenis |
|---|---|
| Bevestigd | Officiele Renault-bron (persmap, handboek, brochure) of twee onafhankelijke bronnen die overeenkomen. |
| Aannemelijk | Een redelijke bron, of bevestigd voor de motor- of bakfamilie en niet letterlijk voor deze auto. |
| Een bron | Een enkele forum-, catalogus- of aggregatorbron; indicatief. |
| Geschat | Afgeleid of berekend; de methode staat erbij. |
| Open | Niet beslecht of niet gevonden. |

Waar een feit uit het rapport is overgenomen zonder dat de bron opnieuw is gelezen, staat "uit het rapport" bij de bron.

## 1. Correcties en besluiten ten opzichte van het rapport

| Onderwerp | Rapport | Besluit | Zekerheid | Grond |
|---|---|---|---|---|
| Leverancier automaat AJ0 | Aisin AW TF-80SC waarschijnlijker dan Jatco | Jatco JF613E (Renault AJ0) | Bevestigd | De persmap noemt AJ0 voor de F4Rt 811 (MR 415 noemt AJ0 ook bij de 813) en geeft snelheden per 1000 tpm die binnen 0,2 % passen bij de JF613E-verhoudingen en tot 2,2 % afwijken van de TF-80SC. Planete Renault: gebouwd in de Jatco-fabriek in Yagi. Transmission Digest: JF613E "also known as AJO", toepassing Renault Laguna 2.0. De TF-80SC zit bij Renault in de Vel Satis en Espace IV met de V6 dCi. |
| Faseversteller | Volgens docteurmoteurs geen, een bron | Geen faseversteller, vaste kleptiming | Bevestigd (811) | Persmap: "diagramme variable (décaleur continu à l'admission VVT)" is "non" bij de F4Rt 811 en "oui" bij de K4M en M4R. De bron noemt de 811; voor de 813 is het niet apart bevestigd. Planete Renault: de F4RT "se passe de déphaseur d'arbre à cames". TecDoc-catalogi tonen wel F4R-faseverstellers voor deze motorcode; dat is uitbreiding per motorfamilie (Mégane II RS F4Rt 774 en de atmosferische F4R hebben er wel een). |
| ATF-norm | JWS 3309 (Toyota T-IV) of Elfmatic J6 | Elf Elfmatic J6, Matic J-klasse (het handboek van 2009 noemt in zijn tabel ELF MATIC S6; of dat dezelfde olie is, is niet vastgesteld) | Aannemelijk | JWS 3309 hoort bij Aisin-bakken. Elf noemt Elfmatic J6 voor Renault AJ0 en AJ8. |
| ATF-hoeveelheden | 3,2 tot 3,5 l verversen, 7,0 tot 7,6 l totaal | Bij aftappen circa 2,2 l; vullen 3 tot 3,2 l en afstellen op overloop; totaal circa 8 l | Een bron (verversen), Aannemelijk (totaal) | 3,2 l vullen, 3,5 l na aftappen en 7,6 l totaal volgens MR 415 (23A-28 tot 23A-31); de 8 l en 2,2 l komen van forums en Planete Renault. De rapportwaarden komen deels van TF-80SC-pagina's. Forumvelsatis: twee AJ0-verversingen gaven elk 2,2 l; het Renault-handboek noemt 3,2 l vullen. Planete Renault: 8 l totaal. |
| Eindoverbrenging | Open | 3,804 | Bevestigd (fase 1) | Persmap: "rapport de pont 1/3,804" bij de F4Rt 811. De repo gebruikte 3,571 van de Mitsubishi F6AJA. |
| 0 tot 100 km/h | 9,4 s aanhouden | 9,2 s (berline), 9,4 s (estate) | Bevestigd | Persmap. De 9,4 s in het rapport is de estatewaarde. |
| Verbruik en CO2 | 8,9 l/100 km en 207 g/km | 8,9 l/100 km en 210 g/km | Bevestigd | Persmap (stad 13,0; buiten 6,6 berline en 6,7 estate). |
| Compressieverhouding | 9,0 : 1 | 9,5 : 1 | Bevestigd | Persmap; L'argus noemt 9,0 : 1. |
| Ledig gewicht | 1.488 kg (Initiale BVA) | 1.467 kg rijklaar berline, 1.488 kg estate; varieert per uitvoering | Bevestigd | Persmap. |
| Toelaatbare massa | 2.017 kg, treingewicht 3.317 kg | 1.961 kg en 3.261 kg (berline, fase 1) | Bevestigd (fase 1) | Persmap; de rapportwaarde van L'argus kan een latere uitvoering betreffen. Kenteken via RDW controleren. |
| Distributie | Riem | Riem ("courroie") | Bevestigd | Persmap. Odopass noemt voor de 2.0 Turbo 170 een ketting zonder vervanging; dat is fout, Odopass is daarom geen bron voor deze motor. |
| Stuurbekrachtiging | Open | Hydraulisch met variabele assistentie | Bevestigd | Persmap: "Hydraulique variable" bij de F4Rt 811; de elektropomp staat bij de 2.0 16V 140 en de dCi 130. |

## 2. Voertuig en identificatie

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Project en carrosserie | Laguna III, project X91; hatchback B91, Estate K91, Coupe D91 | Bevestigd | uit het rapport (fr.wikipedia, L'argus) |
| TecDoc-type | Laguna III (BT0/1) 2.0 16V Turbo, 125 kW, F4R 811 (catalogusnummer 23370) | Bevestigd | [Auto-Doc](https://www.auto-doc.fr/pieces-detachees/kit-de-distribution-10505/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo) |
| Fase 2 | Gepresenteerd op de Mondial in Parijs, oktober 2010 | Bevestigd | uit het rapport (fr.wikipedia) |
| Fabriek | Sandouville; productie van de Laguna III tot mei 2015, 351.384 stuks in alle carrosserieen | Aannemelijk | uit het rapport (fr.wikipedia) |
| Motorplaat | Op het blok; motortype, index en nummer | Aannemelijk | uit het rapport ([lagunanotice](https://www.lagunanotice.com/plaques_d_identification_moteur-1020.html)) |
| Euronorm | Euro 4 in de persmap 2007 (fase 1); volgens de RDW heeft de auto van de gebruiker (eerste toelating 18 februari 2011) EURO 5 A (715/2007*692/2008A) | Bevestigd (fase 1 en RDW) | [Renault-persmap 2007](https://www.planeterenault.com/UserFiles/files/doc/Laguna3Tech.pdf) |
| Euro NCAP | 5 sterren volwassenen (36 van 37 punten), 4 sterren kinderen, 2 sterren voetgangers (test 2007) | Aannemelijk | uit het rapport ([zercustoms](http://www.zercustoms.com/news/Renault-Laguna-III-Euro-NCAP-Rating.html)) |

## 3. Maten en massa (berline)

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Lengte, breedte, hoogte | 4.695 x 1.811 x 1.445 mm; breedte met spiegels 2.060 mm | Bevestigd | Persmap |
| Wielbasis | 2.756 mm | Bevestigd | Persmap |
| Overhang voor en achter | 1.014 en 926 mm | Bevestigd | Persmap |
| Spoor voor en achter | 1.557 en 1.512 mm | Bevestigd | Persmap |
| Bodemvrijheid | Meer dan 120 mm beladen | Bevestigd | Persmap |
| Draaicirkel | 11,05 m tussen stoepranden, 11,64 m tussen muren; met 18 inch 11,40 en 12,05 m | Bevestigd | Persmap |
| Bagageruimte | 450 l, met neergeklapte bank 1.377 l | Bevestigd | Persmap |
| Massa rijklaar | 1.467 kg (vooras 947, achteras 520) | Bevestigd (fase 1) | Persmap |
| Toelaatbare massa en treingewicht | 1.961 kg en 3.261 kg | Bevestigd (fase 1) | Persmap |
| Aanhanger | Geremd 1.300 kg, ongeremd 650 kg | Bevestigd | Persmap |
| Luchtweerstand | Cx 0,293, SCx 0,645 | Bevestigd | Persmap |
| Tank | 66 l | Bevestigd | Persmap |
| Bandenmaten | 215/55 R16, 215/50 R17, 225/45 R18; noodwiel 185/65 R16 | Bevestigd | Persmap |

## 4. Prestaties en verbruik

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Topsnelheid | 220 km/h (estate 215) | Bevestigd | Persmap |
| 0 tot 100 km/h | 9,2 s (estate 9,4 s) | Bevestigd | Persmap |
| 400 m en 1000 m staande start | 16,7 s en 30,2 s | Bevestigd | Persmap |
| Tussenacceleratie 80 tot 120 km/h | 7,7 s | Bevestigd | Persmap |
| Verbruik (80/1268/CE) | Stad 13,0, buiten 6,6, gemiddeld 8,9 l/100 km | Bevestigd | Persmap |
| CO2 | 210 g/km | Bevestigd | Persmap |
| Toerental bij 220 km/h | Circa 4.840 tpm in de 6e (45,44 km/h per 1000 tpm) | Geschat (berekend uit de persmap) | Persmap |

## 5. Motor F4Rt 813 (voertuigtype BT15, zie beslissingen)

Motorcode van de auto van de gebruiker (bijgewerkt op 15 oktober 2026): waarschijnlijk F4Rt 813, zekerheid middel; het motorplaatje beslist. Volgens de RDW is de auto een Renault Laguna hatchback met eerste toelating op 18 februari 2011, 125 kW, EURO 5 A (715/2007*692/2008A), 201 g/km CO2 en 8,7 l/100 km. De RDW-typegoedkeuringsgegevens noemen voor deze uitvoering de motorcode "F4R J8", dezelfde code als bij de Euro 4-uitvoeringen; het driecijferige suffix staat er dus niet in. Het Renault-werkplaatshandboek MR 415 geeft voor de hatchback bij F4R 811 alleen Euro 4 en bij F4R 813 Euro 3, 4 en 5 (beide met automaat AJ0). Omdat de auto Euro 5 is, is de 813 de waarschijnlijkste code. Onderdelencatalogi noemen voor de hele reeks alleen "F4R 811"; ze voegen de suffixen samen en zeggen niets over de Euronorm. Beweringen die een bron alleen voor de 811 noemt (zoals het ontbreken van een faseversteller in de persmap van 2007) blijven staan; voor de 813 zijn ze niet apart bevestigd. De onderbouwing staat in `docs/onderzoek/beslissingen.md`.

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Opbouw | 4 in lijn, 16 kleppen, 1.998 cm3, boring x slag 82,7 x 93 mm, gietijzeren blok, aluminium kop | Bevestigd | Persmap; repo |
| Compressie | 9,5 : 1 | Bevestigd | Persmap |
| Vermogen en koppel | 125 kW (170 pk) bij 5.000 tpm; 270 Nm bij 3.250 tpm | Bevestigd | Persmap |
| Toerenbegrenzer | 6.250 tpm | Bevestigd | Persmap |
| Injectie | Meerpunts sequentieel in het inlaatkanaal | Bevestigd | Persmap |
| Distributie | Getande riem, 126 tanden, 27 mm breed; drijft ook de waterpomp aan | Bevestigd | Persmap; [Auto-Doc](https://www.auto-doc.fr/pieces-detachees/kit-de-distribution-10505/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo) |
| Kleptiming | Vast, geen faseversteller | Bevestigd | Persmap; [Planete Renault F4RT](https://www.planeterenault.com/1-gamme/45-moteurs/1060-f4rt-tce-180) |
| Klepspeling | Hydraulische klepstoters, geen afstelling | Aannemelijk | [docteurmoteurs](https://docteurmoteurs.com/moteur-renault-f4rt-2-0/); repo |
| Turbo | Twin-scroll, intercooler; Mitsubishi TD04-10T, referentie 49377-07303 | Bevestigd (twin-scroll), Aannemelijk (referentie) | Persmap; [Europe Turbo](https://www.europeturbo.fr/turbo-compresseur/turbo-pour-renault-laguna-3-20-16v-turbo-170-cv-49377-07303-24746.html) |
| Laaddruk | De persmap geeft een absolute laaddruk, maar de kolom is in de tabel niet eenduidig toe te wijzen; Planete Renault noemt 1,8 bar voor de F4RT van de Vel Satis (165 pk) | Open | Persmap; Planete Renault F4RT |
| Olie-inhoud | 5,4 l inclusief filter | Bevestigd | Persmap; [lagunanotice](https://www.lagunanotice.com/appoint_remplissage-982.html) |
| Olie | 5W-40, Renault RN0700 of RN0710 | Aannemelijk | [Autodoc](https://www.autodoc.co.uk/car-parts/engine-oil-12094/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo); het handboek verwijst naar het onderhoudsboekje |
| Andere motorcodes | Catalogi noemen de reeks F4R 811 en soms ook F4R 813; een F4R 810 in Britse lijsten is niet bevestigd | Een bron | uit het rapport |
| 170 pk tegenover 205 pk | De 205 pk (GT) heeft een grotere turbo (TD04L-14T) en was alleen handgeschakeld (PK4) | Aannemelijk | uit het rapport (turborenault.co.uk, forumlaguna3) |

## 6. Automaat AJ0

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Type | Jatco JF613E, Renault-code AJ0; ook Nissan RE6F01A en Mitsubishi F6AJA | Bevestigd | Persmap; [Planete Renault AJ0](https://www.planeterenault.com/1-gamme/40-technologie/4894-boitevitesse-automatique-aj0); [Transmission Digest](https://www.transmissiondigest.com/jatco-jf613e-transmission-quick-reference-material/) |
| Overbrengingen | 4,199 / 2,405 / 1,583 / 1,161 / 0,855 / 0,685, achteruit 3,457 | Bevestigd | Mitsubishi F6AJA-handboek; gecontroleerd met de snelheden per 1000 tpm in de persmap (7,42; 12,96; 19,68; 26,84; 36,43; 45,44 km/h) |
| Eindoverbrenging | 3,804 | Bevestigd (fase 1) | Persmap |
| Tandentallen eindoverbrenging | Voor 3,804 niet gevonden; 45/42 x 71/20 geeft 3,804 | Geschat | eigen berekening |
| Andere Laguna III-automaten | De dCi 150 met AJ0 heeft eindoverbrenging 3,36; de 2.0 16V 140 en de 1.6 hadden een handbak TL4; voor de 3.0 V6 dCi en de 3.5 V6 is de bak hier niet onderzocht | Bevestigd (dCi 150), Open (V6) | Persmap |
| ATF | Elf Elfmatic J6 (handboek 2009: ELF MATIC S6 in de tabel van de AJX) | Aannemelijk | [Elf](https://lubricants.catalog.elf.com/corporate/fr_FR/n5s_elfmatic-j6) |
| Totale inhoud | Circa 8 l | Aannemelijk | Planete Renault AJ0 |
| Renault-beleid | Levensduurvulling, geen verversing voorgeschreven | Aannemelijk | Planete Renault AJ0 |
| Verversen | Volgens MR 415: totaal 7,6 l, na aftappen 3,5 l, vullen 3,2 l en afstellen bij 40 graden. Forumvelsatis: aftappen geeft circa 2,2 l; vullen 3 tot 3,2 l via het vulkanaal vanuit de motorruimte; afstellen op overloop met de motor draaiend in P bij 38 tot 40 graden ATF; peilbout en overloopbuisje 8 Nm, afdekplaat vulkanaal 6 Nm | Een bron | [forumvelsatis](https://forumvelsatis.fr/phpBB3/viewtopic.php?f=8&t=10349) |
| Melding bak controleren | Kan komen van een losse massakabel van de bak naar de accu | Een bron | forumvelsatis |
| Eigenaarservaring | Schakelt soepel; handmatige modus traag | Een bron | uit het rapport (Caradisiac-forum) |

## 7. Onderstel en remmen

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Voorwielophanging | McPherson, stabilisator 24 mm, dempers bitube 50/22 mm | Bevestigd | Persmap |
| Achteras | Torsieas in H-vorm met meesturend effect, stabilisator 29,6 mm bij de F4Rt, dempers bitube 45/12,5 mm | Bevestigd | Persmap |
| 4Control | Optie; de auto van de gebruiker heeft het niet (opgave gebruiker, 15 oktober 2026); het model toont de gewone H-as | Bevestigd | repo (Franse prijslijst 2011) |
| Remmen voor | Geventileerd 296 x 26 mm, zwevende klauw met zuiger 57 mm | Bevestigd | Persmap |
| Remmen achter | Massief 300 x 11 mm, gecombineerde klauw met zuiger 38 mm | Bevestigd | Persmap |
| Elektronica | ABS, EBV, ESP met CSV en ASR standaard bij de F4Rt | Bevestigd | Persmap |
| Stuurinrichting | Hydraulisch met variabele assistentie, 2,9 omwentelingen tussen de aanslagen | Bevestigd | Persmap |
| Elektrische parkeerrem | Gesloten unit met motor die twee kabels naar de achterklauwen trekt | Bevestigd | repo (Renault-handboek fase 2) |

## 8. Elektrisch en comfort

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Diagnose | Renault CLIP of DDT4All met een ELM327-interface; ATF-temperatuur uitlezen voor het peil | Aannemelijk | forumvelsatis; uit het rapport |
| Na loskoppelen accu | Elektrische ruitbediening opnieuw initialiseren | Een bron | uit het rapport ([fiches-auto](https://www.fiches-auto.fr/fiabilite-renault/fiabilite-184-pannes-renault-laguna-3.php)) |
| Kaartsleutel | Kaartlezer is een bekend storingspunt | Een bron | uit het rapport (fiches-auto) |
| Centrale vergrendeling | Werkt bij sommige auto's wisselend; bestuurdersslot vaak vervangen | Een bron | fiches-auto |

## 9. Onderhoud

| Onderdeel | Interval of waarde | Zekerheid | Bron |
|---|---|---|---|
| Motorolie en filter | Renault 2007: 20.000 km of 1 jaar, afhankelijk van het land; databanken: 15.000 km of 1 jaar. Bij een oudere turbomotor is 10.000 tot 15.000 km een gangbaar advies | Bevestigd (Renault), Aannemelijk (databanken) | Persmap; [auto-abc](https://www.auto-abc.eu/renault-laguna/v8813-2008/service) |
| Olie | 5,4 l 5W-40, RN0700 of RN0710 | Bevestigd (inhoud), Aannemelijk (norm) | Persmap; Autodoc |
| Aftapplug carter | Vierkant 8 mm, nieuwe ring | Aannemelijk | [Autodoc club](https://club.autodoc.co.uk/manuals/how-to-change-engine-oil-and-filter-on-renault-laguna-iii-hatchback-bt-replacement-guide-16953); repo |
| Distributieriem, rollen en waterpomp | 120.000 km of 5 jaar volgens eigenaren die de Renault-opgave noemen; andere bronnen 6 jaar. Bij een breuk raken de kleppen beschadigd | Aannemelijk | [Planete Renault-forum](https://www.planeterenault.com/forum/conseil-conseil-laguna-iii-2-0t-170ch-trouve-t41997.html); docteurmoteurs |
| Bougies | 60.000 km | Aannemelijk | auto-abc; docteurmoteurs |
| Multiriem | 90.000 km | Aannemelijk | auto-abc; docteurmoteurs |
| Koelvloeistof | 90.000 km of 5 jaar | Aannemelijk | auto-abc; docteurmoteurs |
| Luchtfilter | 15.000 km (een databank); 30.000 km (een onderhoudsgids) | Een bron | auto-abc |
| Brandstoffilter | In de tank; 90.000 km | Een bron | auto-abc |
| Remvloeistof | DOT 4, elke 2 jaar | Een bron | uit het rapport (Odopass) |
| ATF | Renault: levensduurvulling. Specialisten adviseren verversen; bij een bak van 15 jaar twee of drie keer aftappen en vullen, of een spoeling bij een specialist, daarna adapteren | Aannemelijk (Renault-beleid), Een bron (advies) | Planete Renault AJ0; forumvelsatis |
| Kosten olieservice | 71 tot 94 euro (Franse referentie) | Een bron | uit het rapport (vroomly) |

Prioriteiten voor een exemplaar van circa 15 jaar, uit het rapport overgenomen: distributieriem en waterpomp bij onbekende historie direct vervangen; ATF verversen en de bak adapteren; koelvloeistof en slangen; turbo-olieleiding, O-ringen en asspeling; bobines en bougies; parkeerrem testen; rubbers van achteras, stuurkogels, subframe en motorsteunen; achterveren; accu.

## 10. Bekende problemen

| Probleem | Symptoom en oorzaak | Oplossing | Zekerheid | Bron |
|---|---|---|---|---|
| Turbo-olietoevoer | O-ring van de toevoerleiding breekt of verhardt; olielek en turboschade | O-ringen en leiding vervangen | Een bron | [docteurmoteurs](https://docteurmoteurs.com/moteur-renault-f4rt-2-0/) |
| Turbospeling | Radiale asspeling na circa 150.000 km, olie in de uitlaat, blauwe rook | Ruilturbo 49377-07303 | Een bron | docteurmoteurs |
| Olieverbruik | Tot circa 1 l per 1.000 km boven 150.000 km | Turbo, klepsteelrubbers en zuigerveren nakijken | Een bron | docteurmoteurs |
| Laadluchtslangen | Barsten in slangen en koppelingen; vermogensverlies en sissen | Slang vervangen | Een bron | docteurmoteurs |
| Bobines | Misfire en storingslampje | Bobine vervangen | Aannemelijk | docteurmoteurs; fiches-auto |
| Sensoren | Lambdasonde en krukassensor verouderen | Vervangen | Een bron | docteurmoteurs |
| Olielekkage | Kleppendeksel, olieafscheider, krukaskeerringen | Pakkingen en keerringen | Een bron | docteurmoteurs |
| Instabiel stationair | Vervuild gasklephuis of injectoren, valse lucht | Reinigen, lekken zoeken | Een bron | docteurmoteurs |
| Elektrische parkeerrem | "Frein de parking à contrôler", rode led knippert, rem lost niet; interne elektronicafout van de unit. Nieuwe unit circa 1.600 euro excl. btw; revisie is een alternatief | Unit vervangen of laten reviseren | Een bron | [Planete Renault-forum](https://www.planeterenault.com/forum/laguna-iii-panne-frein-de-parkig-electrique-regle-t57523.html) |
| Parkeerrem bij remblokken achter | Kabels lopen vast in de unit als de rem niet eerst in onderhoudsstand gaat | Eerst de procedure volgen en de zuigers terugzetten | Een bron | uit het rapport ([lesamisdudiag](https://www.lesamisdudiag.com/forum/les-logiciels-et-interfaces-auto/renault-dacia-nissan/38097-probl%C3%A8me-de-calculateur-sur-un-fpa-de-laguna3)) |
| Achterveren | Breuk, APK-afkeur | Veren vervangen | Een bron | fiches-auto |
| Onderstelrubbers | Silentblocs achteras, stuurkogels, subframerubbers | Vervangen | Een bron | uit het rapport ([renault-laguna.com](http://www.renault-laguna.com/forum/fiabilite-2-0-t-t9797.html)) |
| Faseversteller | Komt bij deze motor niet voor; ratelgeluid bij de koude start wijst op iets anders | | Bevestigd | Persmap |

## 11. Terugroepacties

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Gordelspanner bestuurdersstoel | DVSA R/2010/039 (Renault 0B5K), bouwdata 1 januari 2007 tot en met 24 augustus 2009; geldt niet voor een auto uit 2011 | Aannemelijk | uit het rapport ([vehicle-recall.co.uk](https://vehicle-recall.co.uk/recall/r-2010-039)) |
| Controle | RDW-kentekencheck (tabblad terugroepacties) en VIN-controle bij de dealer | Bevestigd | [RDW](https://www.rdw.nl/uw-voertuig-en-uw-gegevens/informatie-over-uw-voertuig/terugroepacties-opzoeken) |

## 12. Nederland

| Onderwerp | Feit | Zekerheid | Bron |
|---|---|---|---|
| Leverbaarheid | De 2.0T 170 automaat in fase 2 was in Nederland leverbaar (Initiale van oktober 2010 tot juli 2013 volgens Autoweek); bij de introductie van fase 2 als GT en Initiale | Aannemelijk | repo (Autoweek); uit het rapport ([autokopen.nl](https://www.autokopen.nl/autonieuws/2010/september/19571-prijzen-renault-laguna-bekend)) |
| Nieuwprijs | Hatchback 2.0 16v T Initiale automaat 39.590 euro (laatst bekende prijslijst) | Een bron | uit het rapport ([Autozine](https://www.autozine.nl/renault/laguna/prijslijst)) |
| LPG | Haalbaar door de indirecte inspuiting; let op kleppen en klepzittingen | Een bron | uit het rapport (Haynes/RTA) |
| Marktwaarde | Laguna 2.0 T-automaten van 2008 tot 2011 met 150.000 tot 230.000 km staan rond 2.000 tot 5.000 euro (oktober 2026) | Een bron | uit het rapport (AutoWereld) |

## 13. Open punten

- Renault-tandentallen van de eindoverbrenging 3,804.
- Of fase 2 (Euro 5) andere waarden heeft voor eindoverbrenging. Verbruik en CO2 van de auto van de gebruiker staan sinds de RDW-gegevens vast (sectie 14).
- Het motorsuffix van de auto van de gebruiker: waarschijnlijk 813 (zekerheid middel). De RDW noemt het niet; MR 415 geeft Euro 5 alleen bij de 813 (sectie 14). Het motorplaatje beslist.
- Bak van de 3.0 V6 dCi en de 3.5 V6 in de Laguna III (AJ0 of een Aisin-bak).
- Laaddruk van de F4Rt.
- Minimumdiktes van de remschijven, aanhaalmomenten uit het werkplaatsboek (cilinderkop, wielbouten, subframe, remklauwen), uitlijnwaarden.
- Aircovulling, koelvloeistof- en remvloeistofinhoud.
- Exacte uitvoering van deze auto (wielmaat) via RDW of MyRenault. 4Control: niet aanwezig (opgave gebruiker).

## 14. De auto van de gebruiker volgens de RDW (15 oktober 2026)

De gebruiker gaf het kenteken op; de gegevens komen uit de open data van de RDW (opendata.rdw.nl). Kenteken en chassisnummer staan niet in de repo.

| Onderwerp | Feit volgens de RDW | Zekerheid | Opmerking |
|---|---|---|---|
| Voertuig | Renault Laguna, hatchback, vier deuren, vijf zitplaatsen, grijs | Bevestigd | Past bij het model en bij de kleur Gris Platine. |
| Motor | Benzine, 4 cilinders, 1998 cc, 125 kW | Bevestigd | Past bij de F4Rt 2.0 turbo 170 pk. Het motorsuffix noemt de RDW niet. |
| Eerste toelating | 18 februari 2011, ook de eerste tenaamstelling in Nederland | Bevestigd | Fase 2. De auto is daarmee voor 07/2011 gebouwd; dat beslist de bouwdatumgrens van onder meer de spanrol en de geleiderol. |
| Emissie | EURO 5 A, milieuklasse 715/2007*692/2008A | Bevestigd | MR 415 geeft Euro 5 alleen bij de F4R 813 en bij de 811 alleen Euro 4. Het motorsuffix is dus waarschijnlijk 813 (zekerheid middel) en niet bevestigd; het motorplaatje beslist. De voorkatalysator volgt het emissieniveau (Euro 5). |
| Verbruik en CO2 | 8,7 l/100 km gecombineerd, 201 g/km | Bevestigd | Fase 1 gaf 8,9 l/100 km en 210 g/km (persmap). |
| Maten | Lengte 470 cm, wielbasis 276 cm, spoor voor 156 cm en achter 151 cm | Bevestigd | Gelijk aan 4.695 mm, 2.756 mm, 1.557 mm en 1.512 mm in cm afgerond; het model klopt hiermee. |
| Massa | Ledig 1.381 kg, rijklaar 1.481 kg, toegestaan 2.017 kg | Bevestigd | Niet vergeleken met de 1.467 kg uit de persmap (fase 1, andere definitie, andere uitvoering). Geen onderdeelkeuze gebaseerd op het gewicht. |
| Bak, velgmaat, onderstel, vierwielbesturing, stuurzijde | Niet in de RDW-gegevens | Open | Geen keuze gebaseerd op spoor of gewicht: zonder onderbouwing is daar niets uit af te leiden. |

## 15. Bronnen

- [Renault, dossier de presse Nouvelle Laguna, augustus 2007, technische kenmerken blz. 32 tot 36](https://www.planeterenault.com/UserFiles/files/doc/Laguna3Tech.pdf)
- [Planete Renault, La boite de vitesse automatique AJ0](https://www.planeterenault.com/1-gamme/40-technologie/4894-boitevitesse-automatique-aj0)
- [Planete Renault, Le moteur Renault 2.0 16v F4RT](https://www.planeterenault.com/1-gamme/45-moteurs/1060-f4rt-tce-180)
- [Transmission Digest, Jatco JF613E quick reference (februari 2024)](https://www.transmissiondigest.com/jatco-jf613e-transmission-quick-reference-material/)
- [Wikipedia, AWTF-80 SC (toepassingen)](https://en.wikipedia.org/wiki/AWTF-80_SC)
- [Wikipedia, List of Jatco transmissions](https://en.wikipedia.org/wiki/List_of_Jatco_transmissions)
- [forumvelsatis, [TUTO] Vidange BVA6 AJ0](https://forumvelsatis.fr/phpBB3/viewtopic.php?f=8&t=10349)
- [Elf, Elfmatic J6](https://lubricants.catalog.elf.com/corporate/fr_FR/n5s_elfmatic-j6)
- [lagunanotice, handboek Laguna III, olie](https://www.lagunanotice.com/appoint_remplissage-982.html)
- [docteurmoteurs, F4Rt 2.0](https://docteurmoteurs.com/moteur-renault-f4rt-2-0/)
- [auto-abc, Laguna 2.0 benzine, onderhoud](https://www.auto-abc.eu/renault-laguna/v8813-2008/service)
- [fiches-auto, pannes Laguna 3](https://www.fiches-auto.fr/fiabilite-renault/fiabilite-184-pannes-renault-laguna-3.php)
- [Planete Renault-forum, parkeerrem Laguna III](https://www.planeterenault.com/forum/laguna-iii-panne-frein-de-parkig-electrique-regle-t57523.html)
- [Planete Renault-forum, distributie Laguna III 2.0T 170](https://www.planeterenault.com/forum/conseil-conseil-laguna-iii-2-0t-170ch-trouve-t41997.html)
- [Auto-Doc, distributieset en faseversteller Laguna III 2.0 16V Turbo](https://www.auto-doc.fr/pieces-detachees/poulie-darbre-a-came-15053/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo)
- [Autodoc, motorolie Laguna III 2.0 16V Turbo](https://www.autodoc.co.uk/car-parts/engine-oil-12094/renault/laguna/laguna-iii-bt0-1/23370-2-0-16v-turbo)
- [Europe Turbo, 49377-07303](https://www.europeturbo.fr/turbo-compresseur/turbo-pour-renault-laguna-3-20-16v-turbo-170-cv-49377-07303-24746.html)
- [Dynamiczna wymiana oleju, Laguna III 6AT (noemt TF-80SC, zonder bewijs)](https://dynamiczna-wymiana-oleju.pl/auto/renault-laguna-iii-2-0-dci-turbo-dynamiczna-wymiana-oleju-w-skrzyni-automatycznej-6at-aisin-tf-80sc)
- [Odopass, onderhoudsprogramma Laguna 3 (noemt ten onrechte een ketting)](https://www.odopass.fr/blog/programme-entretien-renault-laguna-3-essence-diesel-carnet-plan-guide-complet)
- Het rapport van de gebruiker van 14 oktober 2026 met zijn bronnenlijst van 73 nummers; bronnen die alleen daaruit komen staan hierboven gemarkeerd met "uit het rapport".

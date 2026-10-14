# Beslissingen bij tegenstrijdige of onvolledige bronnen (orkestrator, 13 oktober 2026)

Bindend voor alle agents. Waar dit document afwijkt van een onderzoeksnotitie, geldt dit document.

| Onderwerp | Beslissing | Grond | Status in tekst |
|---|---|---|---|
| Stuurbekrachtiging F4Rt 811 | Hydraulisch met variabele assistentie, pomp aangedreven door de multiriem (dus dynamo, aircocompressor en stuurpomp op de riem). Geen elektropomp (GEP). | Renault-persmap 2007, technische tabel F4Rt 811: "hydraulique variable"; de GEP staat bij de 2.0 140 (M4R) en de dCi 130 (onderzoek onderstel-interieur). Een multiriem van 1795 mm (7PK1795) past bij drie verbruikers plus spanner en geleiderol. Het motoronderzoek noemde "électro-hydraulique" op grond van algemene bronnen (L'argus, een brochure en een forum zonder motorspecificatie). | "Aannemelijk": in beschrijvingen "riemaangedreven stuurpomp (aannemelijk voor deze motor)" |
| Gevolg motor | `Hulpaandrijving` krijgt een stuurpomp als groep (huis, rotor met schoepen, as met lager, drukregelklep, poelie, aansluitingen) en de riemloop gaat langs drie verbruikers. Nieuwe sleutels in `ENG_PORTS`: `psOut` (hogedrukuitgang) en `psIn` (aanzuiging uit het reservoir), elk `{p, dir}`. | | |
| Gevolg onderstel | `Stuurinrichting` krijgt reservoir, hogedrukslang en retourslang; de slangen sluiten aan op `ENG_PORTS.psOut` en `ENG_PORTS.psIn` als die bestaan (`if (ENG_PORTS.psOut)`), anders eindigen ze bij de motor. | | |
| Automaat | Jatco JF613E, Renault-code AJ0, Lepelletier-opbouw (drie planetaire sets: reductieset, voorste set met vier planeetwielen, achterste set; vijf schakelelementen plus vrijloop; acht solenoïdes; vijf drukschakelaars; zeef op de pomp; water-ATF-koeler). Niet Aisin. | Onderzoek automaat: Planète Renault, Jatco-persbericht, Mitsubishi F6AJA-handboek; AJ0 voor de F4Rt 811 bevestigd in de Renault-persmap 2007 (onderzoek onderstel-interieur). | Type "Bevestigd"; verhoudingen "uit het handboek van de zusterbak (Mitsubishi F6AJA), voor Renault niet gevonden" |
| Velgmaat | 225/45 R18 met tien tapse spaken blijft in het model. In de beschrijving: 18 inch is leverbaar en standaard op de UK Initiale Lux; voor een Nederlandse Initiale Paris van 2011 is 17 inch even goed mogelijk. | Onderzoek exterieur en onderstel-interieur. | "Aannemelijk" |
| Remschijven achter | Massief 300 × 11 mm (niet 260). Voor geventileerd 296 × 26 mm, zwevende klauw met zuiger Ø57; achter gecombineerde klauw met zuiger Ø38 en kabel naar de elektrische parkeerremunit. | Renault-specificatie (onderzoek onderstel-interieur). | "Bevestigd" |
| ABS-encoder | Magnetische codeerring in de wiellagereenheid, geen getande ring. | Onderzoek onderstel-interieur en automaat. | "Bevestigd" |
| 4Control | Niet in het model. In de beschrijving van de achteras: "4Control (vierwielbesturing) was op de Initiale een optie; dit model toont de standaard H-as zonder 4Control." | Optie van 2000 euro (Franse prijslijst 2011). | "Bevestigd" (optie) |
| Stoelen | Elektrisch met geheugen (bestuurder), verwarming, handmatige lendensteun; geen massage of ventilatie. Geperforeerd leder, beige (zoals v1) of donker (Dark Carbon); het model houdt beige. | Renault-handboek fase 2. | "Bevestigd" |
| Audio | Bose, tien luidsprekers. | UK-brochure. | "Bevestigd" (aantal), posities "Geschat" |
| Panoramadak | Niet in het model (optie). | UK-brochure. | |
| Leverbaarheid | De 2.0T 170 automaat in fase 2 was niet in Frankrijk of het VK leverbaar, wel in Nederland tot juli 2013 volgens Autoweek (aannemelijk). Vermelden in de documentatie. | Onderzoek onderstel-interieur. | "Aannemelijk" |
| Kleur | Gris Platine, code D69 (UK: Mercury). | Onderzoek exterieur, drie bronnen. | "Bevestigd" |

## Aanvulling na de carrosserieronde

Dezelfde regel: waar dit document afwijkt van een onderzoeksnotitie, geldt dit document. De status geeft aan waar de beslissing op rust.

| Onderwerp | Beslissing | Grond | Status in tekst |
|---|---|---|---|
| Kentekenplaat achter | De hartlijn van de plaat ligt op y 0,465, in een echte uitsparing en niet in de huid. | Gemeten op de foto. Eerder lag de plaat in de huid; dat is in een herstelronde na code review en visuele poort verholpen. | Gemeten |
| Sierlijst per portier | Eén sierlijst per portier, in lakkleur met aluminium inzet en een schaduwlijn. | De "dubbele strip" uit het onderzoek bleek in vergrote foto's de lichtrand en de schaduw van één lijst. Poort 2 liet kenmerk 10 zakken omdat er twee lijsten zaten; de echte auto heeft er één. | Gemeten op foto's |
| B-stijl | Twee hoogglans zwarte afdekkingen met de portiernaad ertussen, samen 0,15 m breed op de gordel en 0,10 m boven, 12 graden naar achteren. | De referentie is zwarte beplating op de gordel van z −0,28 tot −0,13. De maten en de helling komen uit `exterieur.md`, sectie 7. | Besloten |
| Bovenaanzicht | De carrosserie blijft in het bovenaanzicht evenwijdig. Er komt geen druppelvorm met brede heupen. | De tekening is per kolom gemeten: de breedte is van net voor de achteras tot de vooras constant binnen 1 %. `exterieur.md` (kenmerk 8) en de poort gingen uit van heupen en een druppelvorm; dat klopt dus niet. De bovenaanzichtstations van `silhouette.py` zijn allemaal binnen tolerantie. | Gemeten |
| C-stijl | De C-stijl blijft zilver, in lakkleur. | De donkere indruk komt van de zwarte referentieauto. | Besloten |
| Spoilerlip | 3,6 cm voorbij de glasrand, 7 mm dik, opkrul ongeveer 17 graden. | Tussen twee mislukte waarden: 4,7 cm las als plank, 2,2 cm was onzichtbaar. | Besloten na twee proeven |
| Wielkasten en vloer | De wielkasten zijn gesloten en de vloer loopt door tot de wielkast. Achter staat een binnenwand op x 0,51 van de vloer tot de kuip, met een sleuf voor torsiebalk en stabilisator en een uitsparing met veerkoker voor de schroefveer. De achterbank gaat om de wielkasten heen. | Gevonden bij het nalopen van de meldingen van de gebruiker over de onderkant: door de wielboog en van onderen was het interieur te zien (beige leder, de bagagevloer en de hemelbekleding). De wielkasten waren een halve cilinder zonder binnenwand, de vloer was in het wielboogbereik 8 cm te smal en de achterbank stak tot x 0,645 de wielkast in. Na de reparatie geven stralen loodrecht door de vier wielbogen 0 interieurtreffers en stralen van onderen in zeven richtingen 2 randgevallen op ruim 60.000. | Gemeten met stralen; die scripts zitten niet in de repo |

## Aanvulling na het gebruikersrapport (14 oktober 2026)

| Onderwerp | Beslissing | Grond | Status in tekst |
|---|---|---|---|
| Faseversteller | Geen faseversteller en geen VVT-elektroklep; inlaatnokkenaswiel als gewoon tandwiel van 38 tanden. | Renault-persmap 2007 ("non" bij de F4Rt 811), Planete Renault F4RT. TecDoc-vermeldingen zijn familie-uitbreiding. | Bevestigd |
| Automaat | Jatco JF613E blijft. | Persmap (AJ0), overbrengingen kloppen met JF613E en niet met TF-80SC. | Bevestigd |
| Eindoverbrenging | 3,804 in alle beschrijvingen; geometrie blijft schematisch op 42/45/21/70. | Persmap, rapport de pont. | Bevestigd (waarde) |
| ATF-norm | Elfmatic J6 (Matic J-klasse). JWS 3309 uit het rapport hoort bij Aisin-bakken en wordt niet overgenomen. | Elf-catalogus, persmap. | Bevestigd |

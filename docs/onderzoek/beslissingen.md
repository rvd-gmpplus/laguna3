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

# Laguna III explosietekening

Interactieve 3D-explosietekening van een Renault Laguna III hatchback (fase 2, 2011) in de uitvoering Initiale Paris: zilvergrijs (Gris Platine D69), met de 2.0 Turbo F4Rt-motor (170 pk) en de zestraps automaat Jatco JF613E (Renault AJ0). Het model bestaat uit losse onderdelen in groepen die tot 8 lagen diep gaan; de aantallen (knopen, groepen, onderdelen, driehoeken per hoofdgroep) staan in [docs/cijfers.md](docs/cijfers.md). Elke groep klapt apart uit en in, tot op klepspie, zuigerveer en remzuiger. Een tweede modus, Openen, laat de motorkap, de portieren, de ruiten, de achterklep, het panoramadak en een reeks interieurdelen open gaan zoals bij de echte auto. Het paneel toont per onderdeel de bekende onderdeelnummers. Alle geometrie wordt in code opgebouwd; er zijn geen 3D-bestanden.

Stand van 22 oktober 2026: versie 21 (golf 6, three.js 0.186.1 als ES-module en de zijroosters tot de klokrand) is live: https://rvd-gmpplus.github.io/laguna3/ (vanaf `main`, `ba4e19a`, stempel `21 (bron 977185c)`, tag `v21`) en het artefact https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR (privé, artefactversie 23). Wat elke versie bracht, staat in [CHANGELOG.md](CHANGELOG.md); de secties "Nieuw in" hieronder beschrijven oudere golven. De pagina toont zelf welke versie je ziet (`?`).

![Gemonteerd](docs/screenshots/gemonteerd.png)

## Openen

Open `index.html` in een moderne browser. Het bestand laadt three.js 0.186.1 (ES-module) van jsDelivr en lettertypes van Google Fonts. Verder is alles ingebouwd. Het werkt op desktop en telefoon, in licht en donker thema (het thema volgt het systeem). Een browser zonder importmap (Safari en iOS onder 16.4, Chrome onder 89, Firefox onder 108) of zonder WebGL2 krijgt een melding in plaats van de pagina.

De adresbalk is een deelbare link: `?preset=engine` opent de preset Motor F4Rt, `?open=Motorkap,Achterklep` opent die delen in de modus Openen, en de pagina houdt de link bij terwijl je klikt. `?debug=1` toont een overlay met tekensnelheid, tekenopdrachten en versie, voor een melding vanaf een echte telefoon (zie [docs/telefoontest.md](docs/telefoontest.md)). De versie staat ook in het hulpvenster (`?`).

De eerste keer toont de pagina een korte hint. Die verdwijnt na de eerste handeling of na negen seconden en komt daarna niet terug (de browser onthoudt dat). De knop `?` rechtsboven opent de uitleg van de bediening.

## Nieuw in golf 5

- Openen: nieuwe camera's voor de achterklep, de motorkap, de voorportieren, de spiegels, de zonneschermen en de interieuropeners. De hoedenplank gaat mee met de klep aan dunne koordjes (in golf 5 40 graden, sinds golf 5b-3 52 graden) en is uitgenomen zolang een rugleuning of de bagageruimtevloer open is (optie `hideWhen` in de engine). De olievuldop en de expansiedop scharnieren aan de hals. Zijbekleding in de bagageruimte over de wielkasten en de vulpijp.
- Panoramadak: glas van buiten zo goed als zwart (dekking 0,92), van binnen blauwgrijs met een lichte weerspiegeling, zwarte binnenlijsten rond de openingen.
- Onderkant: voorste langsliggers boven de aandrijfassen, achterste langsliggers naar binnen, bodemplaat met opkant boven de torsiebalk, tank en koolstoffilter voor de balk, ATF-koeler lager, multiriem 1.672 mm.
- Telefoon: staand een schuivende presetrij en een compacte kaart, de openerlijst sluit na een keuze, het kader volgt de echte hoogte van kaart en dock; liggend een zijkolom. Op alle schermen dimt de rest van de auto bij het duiken naar een onderdeel (U19).
- Onderdeelnummers: voor 13 verkoopeenheden staat de uitvoering voor deze auto vast (blok Gekozen voor deze auto, volgens de RDW en het chassisnummer van de gebruiker); 58 varianten blijven open.
- Gegevens van de auto volgens de RDW (Euro 5 A, 125 kW, 8,7 l/100 km, 201 g/km, eerste toelating 18 februari 2011); de motor is een F4Rt 813 (zeker sinds golf 5n, volgens het typeplaatje van de eigen auto).

## Nieuw in golf 5b-3 (versie 10)

- Onderkant en motorruimte: airconditioningleidingen met expansieventiel en droger (de plek van die twee is schematisch), de vulpijp in twee delen onder de zijbekleding van de bagageruimte, de naven op het spoor voorin met een hogere klemarm en een kortere Demperbuis, de Doorgaande bout subframe weer als één bout door een boring in de Reactiestangbeugel, het Eindschild van de startmotor dicht en geen spleet meer naar de krukasneus.
- Openen: de hoedenplank gaat 52 graden mee met de achterklep en heeft een uitsparing voor de middelste gordelrolautomaat; de gasveer van de achterklep is dikker, zit met een plaatje onder de lakhuid van de C-stijl en ligt gesloten buiten de afdichting; de B-stijl is een zwart vlak met een kort chromen eindstuk en leest bij een open portier als gelakte stijl; de achterste zijruit zakt schuin langs de stijl en de kwartsruit draait met het achterportier mee; de gordelband voor hangt in rust recht uit de geleider achter de stijlbalk; de scharnierpennen van de hoedenplank liggen in een sparing in de voorhoeken van de plank, en de cilinder van de gasveer is een gesloten schaal met een holte voor de kogel.
- App: herkadrering als het dock van layout wisselt, en Stap terug herstelt kader en camera. De samengevoegde weergave (gebundeld renderen) neemt uv mee (`f63b185`, uit een andere sessie en generiek), zodat onderdelen met een textuur niet zwart worden; de batches zijn daardoor groter, zie [docs/cijfers.md](docs/cijfers.md).
- Onder de motorkap: generieke helpers in `src/core.js`, `spring()` met punten per winding, Nederlandse notatie in alle teksten, en de strenge clashregel (geen paar dieper dan in B0 plus 0,1 mm, ook open over de hele beweging; zie [docs/onderzoek/beslissingen.md](docs/onderzoek/beslissingen.md)).
- Instap: de instaplijst van elk portier is een afgewerkte dorpel, met een zwarte loopplaat, een opstaande rand over de vloerbedekking en een lichte sierstrip 2,8 cm binnen de buitenrand, zodat de drempel bij een open portier niet meer als grijze vloerstrook leest (de vorm is geschat, geen spec). De ontwerpspeling tot het dichte portier is verticaal 6 mm voor en 5 mm achter.

## Nieuw in golf 5c-2 (versie 11)

- Sneller starten: de nummergegevens staan als JSON-blok in de pagina en worden pas gelezen als je het paneel met onderdeelnummers opent of op nummer zoekt, en de tekenbuffer heeft zijn maat al vóór de WebGL-context. De eerste weergave komt daardoor veel eerder en de auto is eerder bruikbaar; de laatste fase (`ready`) is op software-rendering niet korter. De renderlus staat stil als er niets beweegt. Metingen en besluit: [docs/masterplan.md](docs/masterplan.md), sectie "Stand na golf 5c-2".
- Achterlichten: het binnendeel van beide achterlichten hangt onder de achterklep en draait mee als de klep opengaat; Achterlicht links en rechts zijn zelf het vaste deel (de groep Buitendeel is vervallen).
- Expansiedop: kleiner, volgens de catalogus (dop Ø52, opening Ø33, hals Ø42 mm).
- Voorruit: van buiten 0,50 dekkend met eigen tint en luchtreflectie (golf 5h, zoals de persfoto; was 0,80 en daarvoor 0,92); zijruiten 0,84 en achterruit 0,92.
- Gordelband voor: de beschrijving volgt de rusttand van de band.
- Onder de motorkap: constanten in `CFG`, teksten in `TXT`, één strategie per klikmodus (`UI_MODES`) en één knoopschema (`initAppFields`); de bediening is opgedeeld in `src/app2-panel.js`, `src/app2-controls.js`, `src/app2-labels.js`, `src/app2-input.js` en `src/app2-loop.js` (was één `src/app2.js`).

## Nieuw in vervolgronde 5g (versie 13)

- Onder de motorkap: de accu staat links achter in de motorruimte boven de automaat (de gebruiker zag dat op de eigen auto; het model had hem rechtsvoor), met de zekeringkast op de accubak. Het luchtfilterhuis staat 3 cm verder naar voren en is ingekort; de aanzuigslang, de resonator, de hete laadluchtslang, de brandstofleiding, de accukabels zijn verlegd (van de stuurslangen is alleen de tekst bijgewerkt). De maat van de accubak is geschat.
- Teksten: de velg is 18 inch met band 225/45 R18 (bevestigd door de gebruiker); de multiriem is een 7PK van 1.790 tot 1.795 mm en drijft dynamo, aircocompressor en stuurpomp aan (catalogus, TecDoc-type 23370).
- Openen: de motorkap blijft op 65 graden (de gebruiker schat 60 tot 75 graden) en de achterklep op 66 graden (de gebruiker vindt de stand goed).
- Open: de plaats van de motor-ECU (nog rechts tegen het schot; MR 415 zet hem op de accubak) en het verloop van de multiriem. Plan en besluiten: [docs/masterplan.md](docs/masterplan.md), sectie "Vervolgronde 5g", en [docs/onderzoek/beslissingen.md](docs/onderzoek/beslissingen.md).

## Nieuw in golf 5f en 5e (versie 12)

- Carrosserie: de B-stijl is een mat zwart vlak van circa 12,8 cm zonder chromen eindstukken; de achterkant is rustiger (het staartvlak helt naar voren, de bumperpunt rondt af, de zijnaden van de klep zijn recht, de uitlaateinden zitten in een inham in de bumper); de randen van de voorbumper en het scherm zijn zonder kartels; het achterste dakglas heeft geen lichtvlek meer; de buitenspiegel staat op een smalle voet; de binnendelen van de achterlichten eindigen afgerond.
- Interieur: de kaartlezer en de startknop zitten in het dashboard (kaartsleuf onder het linker middenrooster, ronde knop aan de linkerrand van het middenpaneel), niet op de console. Bron: de gebruiksaanwijzing van de Laguna III fase 2, NU 936-5.
- Openen: het voorportier opent 67 graden in plaats van 68 (RiDC).
- Uitklappen: de trap bij duiken, tonen en alles uitklappen is in totaal begrensd; een duik duurt hoogstens circa 1,45 s en alles uitklappen circa 2,25 s (was tot 2,4 s en 3,1 s). De duur van één stap blijft 0,85 s.
- Teksten: ATF Elfmatic J6 (7,6 l) is bevestigd; de velgtekst noemt dat 18 inch een optie is (17 inch was standaard).
- Onder de motorkap: `LAG3_GPU=1` laat de testbrowser op de echte GPU draaien voor beelden die het oog beoordeelt; de spikkels zijn een SwiftShader-artefact. Uitslag, metingen en open punten: [docs/masterplan.md](docs/masterplan.md), sectie "Golf 5f en 5e".

## Bediening

### Op een onderdeel

| Gebaar | Wat er gebeurt |
|---|---|
| Klik of tik (modus Onderdeel) | De eigen groep van het onderdeel klapt ter plekke uit. De rest van de auto blijft staan. Staat die groep al open, dan wordt het onderdeel geselecteerd en een stukje uitgelicht. Een klik klapt nooit een groep boven de eigen groep uit. |
| Dubbelklik of dubbeltik | Duikt naar het onderdeel: alle dichte groepen erboven gaan laag voor laag open en de camera zoomt erop in. De duik gebruikt altijd het onderdeel van de eerste klik. Tussen de twee klikken mag hoogstens 420 ms zitten en hoogstens 26 pixels. De rest van de auto wordt daarbij gedimd (U19) tot je draait, een ander deel kiest, de explosieschuif of een preset gebruikt, of `Rest tonen` kiest; de schakelaar `Rest dimmen bij duiken` in Weergave zet het uit. |
| Rechtsklik, Shift+klik of lang drukken | Klapt de diepste open groep in die het onderdeel bevat, met alles eronder. Rechtsklik na rechts slepen telt niet. Lang drukken (aanraakscherm) is 500 ms vasthouden zonder te bewegen; na 150 ms loopt een ring vol als terugkoppeling. |
| Klik naast de auto | Selecteert de hele auto (of de geïsoleerde groep). |
| Slepen, rechts slepen, scrollen | Draaien, verschuiven, zoomen. Op een aanraakscherm: één vinger draait, twee vingers knijpen en schuiven. |
| Aanwijzen (muis) | Licht de groep op die een klik zou raken en toont een tip met de naam, het aantal onderdelen en wat de klik doet. |

Een beweging van 7 pixels of meer, of een druk van 600 ms of langer, is slepen en nooit een klik.

### Wat een klik doet: de modi

De schakelaar `Klik` onderin kiest wat een enkele klik doet.

| Modus | Werking |
|---|---|
| Onderdeel | Standaard. De eigen groep van het onderdeel klapt uit; is die al open, dan wordt het onderdeel uitgelicht. |
| Laag voor laag | Klapt de buitenste dichte groep op het pad naar het onderdeel uit, van buiten naar binnen. Dit was het gedrag van versie 1. |
| Inklappen | Een klik klapt de diepste open groep in die het onderdeel bevat. |
| Info | Selecteert alleen en toont de onderdeelkaart. |

Met de pijltjestoetsen links en rechts wissel je tussen de modi.

### Groter geheel, Enter en de explosieschuif

- `Groter geheel` (knop in het paneel): klapt de eerstvolgende dichte groep boven de selectie uit. De knop is grijs als er geen dichte groep boven is.
- Enter: is de selectie een dichte groep, dan klapt die uit. Anders doet Enter hetzelfde als `Groter geheel`. Is er ook geen dichte groep boven, dan klapt Enter een open groep in of tilt een onderdeel uit. Shift+Enter klapt in.
- De schuif `Explosie` onderin werkt op de werkgroep: de geselecteerde groep, anders de geïsoleerde groep, anders de hele auto. Hij haalt die groep laag voor laag uit elkaar. De uitlezing toont het aantal lagen.
- `Demonteren` speelt dat af, `Monteren` zet het terug, `Stop` houdt het aan. Elke handeling met de muis of een toets stopt het afspelen.
- `Stap terug` (of Backspace) maakt de laatste handeling ongedaan. De geschiedenis houdt 50 stappen bij.

### De modus Openen

Naast Uitklappen heeft de pagina een tweede modus. In Openen blijft de auto gemonteerd en gaat een deel open zoals bij de echte auto: de motorkap, de vier portieren, de vier zijruiten, de twee buitenspiegels, de achterklep, de tankklep, het panoramadak en een reeks interieurdelen (26 openers in totaal). De camera kijkt dan in de opening.

| Onderdeel | Wat er gebeurt |
|---|---|
| Segmentknop `Uitklappen \| Openen` | Staat in de bovenbalk, op de telefoon over de volle breedte. Sneltoets O wisselt. Bij het ingaan van Openen staat alles gemonteerd en is de isolatie weg; de openers blijven bij elke wissel zoals ze stonden, dus met een geopende motorkap kun je in Uitklappen de motor uit elkaar halen. Een preset of Alles dicht zet ze weer dicht. |
| Klik of tik | De klikregel kijkt naar de openers op het pad van het geraakte onderdeel, van buiten naar binnen. De eerste dichte opener gaat open. Zijn ze allemaal open, dan sluit de binnenste. Een klik op de ruit of spiegel van een dicht portier opent dus eerst het portier. |
| Dubbelklik | Gelijk aan een enkele klik. |
| Rechtsklik, Shift+klik, lang drukken | Sluit de binnenste open opener op het pad. |
| Camera | Bij openen beweegt de camera naar de opening; bij sluiten blijft hij staan. |
| Aanwijstekst | Naam van de opener met "klik om te openen" of "klik om te sluiten", of "niets te openen" bij een onderdeel zonder opener. |
| Dock | `Alles open`, `Alles dicht`, `Openers n/26` en Stap terug. `Openers` opent een lijst met een knop per opener, ook voor wat een klik niet bereikt (een spiegel bij een dicht portier). Onder 920 px breed sluit de lijst na een keuze. |
| Paneel | Een badge Open of Dicht bij een opener en Gemonteerd bij een groep. De knop Openen of Sluiten werkt op de geselecteerde opener zelf, ook als het portier eromheen dicht is; bij een ander onderdeel volgt hij de klikregel. Enter doet hetzelfde en Shift+Enter sluit de binnenste open opener. |
| Presets Openen | Motorruimte, Instappen, Bagageruimte, Tanken, Panoramadak en Alles open. |
| Hoedenplank | Gaat 52 graden mee met de achterklep en is onzichtbaar zolang een rugleuning of de bagageruimtevloer open is. |

Groter geheel, de klikmodi en de explosieschuif zijn in Openen verborgen. Stap terug onthoudt de openstand en de modus.

De hoeken en slagen zijn geschat uit foto's, het instructieboekje en het werkplaatshandboek. De bron van de eindstand per opener staat in [docs/ontwerp-en-architectuur.md](docs/ontwerp-en-architectuur.md).

### Het panoramadak

Het model toont de auto met het elektrische panoramadak, zoals de geteste auto het heeft. Het dak heeft twee getinte glaspanelen achter elkaar met een dwarsbalk. Het voorste glas kantelt aan de achterrand en schuift 0,60 m naar achteren boven het vaste achterglas, langs de dakkromming. Het glas is van buiten zo goed als zwart (dekking 0,92, de keuze van de gebruiker); van binnen is het blauwgrijs met een lichte weerspiegeling en zitten er zwarte binnenlijsten rond de openingen. Eronder zitten twee zonneschermen (voor en achter) met een cassette, de luchtgeleider, de waterafvoer, de hemelbekleding met twee openingen en afwerkring, en de draaiknop in de hemelconsole. In Openen heet het voorste glas Schuifdak; het opent pas nadat het voorste zonnescherm open is. De afmetingen zijn geschat uit foto's.

### Presets en rondleiding

Onderin staan de presets in zeven categorieën (op een staande telefoon in een rij die zijwaarts schuift): Overzicht, Motor, Aandrijving, Onderstel, Carrosserie, Interieur en Openen. Elke preset bereik je met twee klikken (categorie, dan item). De presets volgen een vaste overgang: eerst klapt dicht wat dicht moet, dan beweegt de camera naar de eindkadrering terwijl open gaat wat open moet, alles samen hoogstens 2,5 seconden. Een preset toont alleen de onderdelen die erbij horen; de rest staat op de achtergrond of is verborgen.

- Aantal presets: 43, de rondleiding meegeteld (in de eerste golf waren het er 31): Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3, Openen 6. In de herstelronde van golf 2 kwamen er zes bij: Stuurpomp, Koeling en luchtinlaat, Uitlaatsysteem, Accu, Stuurinrichting en Parkeerrem. Golf 4 voegde de categorie Openen toe (zie hieronder).
- Een preset in een andere categorie dan Openen zet de modus terug op Uitklappen.
- `Rondleiding` in Overzicht speelt de belangrijkste presets na elkaar af met een bijschrift per stap, ongeveer vijf seconden per stap. De balk heeft knoppen voor vorige, pauze of hervat, volgende en stop; Esc breekt af. Een verborgen tabblad pauzeert de rondleiding vanzelf.
- De lijst van presets staat in `src/presetdata.js`; de toepassingsmotor in `src/presets.js`.

### Het paneel

Het paneel rechts (op de staande telefoon onderaan, op de liggende telefoon als kolom rechts) heeft drie tabbladen.

| Tab | Inhoud |
|---|---|
| Onderdeel | Kruimelpad, naam, beschrijving, specificaties en de onderdelen waaruit de selectie bestaat. Knoppen: Uitklappen of Inklappen, Duik hierheen (bij een onderdeel), Groter geheel, Alles hieronder uit, Isoleren, In beeld. Bij isoleren vervaagt de rest in 0,3 s en staat er een badge "Geïsoleerd: naam" met de knop Alles tonen. |
| Onderdelen | De volledige boom met zoekfunctie, bijvoorbeeld "klepveer". Zoeken negeert hoofdletters en accenten en kent synoniemen (remvoering en remblok, dynamo en alternator, accu en batterij, versnellingsbak, transmissie en automaat, en meer). Een treffer openen klapt het pad ernaartoe uit en selecteert het onderdeel. |
| Weergave | Spreiding (40 tot 220 %), Labels, Röntgen (carrosserie doorzichtig), Kleuren per systeem, Langzaam draaien, zes camerastanden (Voor, Zij, Achter, Boven, ¾ voor, ¾ achter), de schakelaars `Rest dimmen bij duiken` (standaard aan) en `Gesloten groepen samenvoegen` (gebundeld renderen, standaard aan) en de knoppen Alles uitklappen, Alles inklappen en Alles tonen. Verder de themaknop (licht, donker, systeem; de keuze wordt onthouden), Beeld opslaan (een PNG met de naam, het onderdeelnummer en de versie onderin) en Kaart afdrukken (alleen de onderdeelkaart). |

### Onderdeelnummers in het paneel

Het tabblad Onderdeel heeft een sectie Onderdeelnummers. Daarin staan per onderdeel de verkoopeenheid waarin het wordt verkocht, de Renault-nummers en de nummers van andere fabrikanten (per merk), elk met een bewijsniveau. Bij 43 paden staat ook "Onderhoud en bekende problemen" (uit het werkplaatshandboek MR 415 en het kennisrapport van de gebruiker).

Boven de sectie staat een vaste waarschuwing: controleer het nummer altijd op het chassisnummer (VIN) bij de dealer of webwinkel, want catalogi verschillen per bouwdatum en uitvoering.

| Status | Betekenis |
|---|---|
| Past volgens catalogus | De catalogus voor dit type (Autodoc type 23370: Laguna III hatchback 2.0 16V Turbo 170 pk, F4R 811) noemt het artikel op de juiste plaats. |
| Variant: kies op VIN | Meer dan een uitvoering komt in aanmerking; het chassisnummer beslist. |
| Gekozen voor deze auto | Een variant waarvoor de uitvoering van de auto van de gebruiker is vastgesteld, volgens de RDW en het chassisnummer van de gebruiker. Het blok noemt uitvoering, bewijs, zekerheid en grond; de gekozen nummers staan gemarkeerd in de lijst. |
| Niet gevonden | Er is naar gezocht en niets bruikbaars gevonden. |
| Niet onderzocht | Het pad heeft geen regel in de gegevens. |
| Deel van, Deel van set | Het onderdeel zit in een verkoopeenheid en wordt daarmee besteld. |

| Bewijsniveau | Bron van het nummer |
|---|---|
| A | Het artikel staat in de catalogus voor dit type op de juiste plaats. |
| B | Het Renault-nummer van zo'n artikel (OE-lijst van een A-artikel). |
| C | Een kruisverwijzing van een A- of B-nummer (Spareto). |
| D | Alleen uit een advertentie voor een gebruikt onderdeel, niet in een catalogus gecontroleerd. Dit geldt alleen voor de twee panoramadaknummers. |

Alle nummers staan ook in [docs/onderdeelnummers.csv](docs/onderdeelnummers.csv): 23 kolommen met per rij het pad, de verkoopeenheid (`unit_id`), de relatie, het statuslabel zoals in het paneel, merk, nummer, bewijs, een korte Nederlandse aanduiding van maat of uitvoering, variant, verpakking, alle bron-URL's van de eenheid, en waar een uitvoering voor de auto van de gebruiker is gekozen de keuze met grond; paden zonder record staan erin als "niet onderzocht". Het schema staat in [docs/onderdeelnummers-schema.md](docs/onderdeelnummers-schema.md). De zoekfunctie in de tab Onderdelen vindt ook een nummer.

Labels zijn genummerde bijschriften met een lijntje naar het onderdeel. Ze verschijnen bij de kinderen van de laatst uitgeklapte groep en vermijden elkaar en de bediening. Passen ze niet allemaal (hoogstens 24, op een smal scherm 10), dan staat er een label "+n meer" dat de lijst van de groep opent. Op een aanraakscherm toont een tik op een afgekort label de volledige naam.

### Toetsenbord

De toetsen werken zodra de pagina de focus heeft; het canvas krijgt die bij de eerste aanraking.

| Toets | Werking |
|---|---|
| 0 tot 9 | Presets: 0 Gemonteerd, 1 Hoofdgroepen, 2 Motor F4Rt, 3 Motor tot op de bout, 4 Automaat, 5 Onderstel, 6 Carrosserie, 7 Interieur, 8 Röntgen, 9 Alles uit elkaar |
| Enter | Selectie uitklappen; is die al open, dan het grotere geheel. Shift+Enter klapt in. |
| Backspace | Stap terug |
| Esc | Menu sluiten, afspelen of rondleiding stoppen, de hele auto selecteren |
| ? | Uitleg van de bediening |
| / | Springt naar het zoekveld van de onderdelenlijst (op de telefoon opent het paneel daarvoor) |
| Pijl omhoog, omlaag, links, rechts (niet op een knop) | Door de boom lopen: omhoog is de bovenliggende groep, omlaag het eerste deel, links en rechts de vorige of volgende op hetzelfde niveau. Er klapt niets uit. |
| Pijl omhoog of omlaag, Home, End | Door een geopend presetmenu lopen |

### Beeldkwaliteit en meldingen

Gaat er bij het laden iets mis (three.js niet geladen, geen WebGL, een fout in het script), dan vervangt de pagina de laadmelding door een korte melding met de versie erbij. Verliest de browser de WebGL-context (bijvoorbeeld een tablet die geheugen vrijmaakt), dan staat er een melding tot de context terug is; de omgevingskaart wordt dan opnieuw gemaakt. De drie scripts van de CDN worden met `integrity` geladen: een gewijzigd bestand wordt geweigerd.

Haperen de eerste frames (gemiddeld meer dan 40 ms over 20 frames tijdens een animatie), dan schakelt de pagina één keer over op een lichte weergave: pixelratio 1 en geen lakglans. Een melding in Weergave vertelt dat, en de schakelaar `Volle kwaliteit` zet het terug. Tijdens grote animaties (meer dan 800 bewegende onderdelen) zakt de pixelratio tijdelijk naar driekwart.

## Mappen

| Pad | Inhoud |
|---|---|
| `index.html` | De gebouwde pagina (identiek aan het gepubliceerde artefact). |
| `auto.json`, `framework.json` | Wat per auto verschilt in de generieke laag (naam, teksten, merk, opslagsleutels, testhaak), en welk bestand generiek of autospecifiek is. Zie [docs/framework.md](docs/framework.md): hoe de modellering is opgezet en hoe je haar voor een andere auto herhaalt. |
| `src/` | Broncode in delen: opmaak, geometrie, carrosserie, motor, aandrijflijn, onderstel, interieur, systemen, app-logica en presets. De bediening staat sinds versie 11 in vijf bestanden, `app2-panel.js`, `app2-controls.js`, `app2-labels.js`, `app2-input.js` en `app2-loop.js` (volgorde: `ORDER` in `build.py`). |
| `src/panorama.js` | Het panoramadak: dakplaat met twee openingen, glaspanelen, dwarsbalk, zonneschermen met cassette, luchtgeleider en waterafvoer, met hun openers. De hemelbekleding met de afwerkring en de draaiknop in de hemelconsole staan in `src/interior.js`. |
| `src/partnumbers.js` | De onderdeelnummers als gegevens. Gemaakt door `tools/orkestratie/build_pn.py` uit `data/pn/` (de canonieke gegevens, zie `data/pn/README.md`); niet met de hand bewerken. `build.py` zet het object als JSON in een eigen blok `#pn` in de pagina; de notitie bij een eenheid (`note`) gaat alleen mee met `pnToelichting` in `auto.json`. |
| `docs/onderdeelnummers.csv` | Dezelfde nummers als tabel: pad, verkoopeenheid, status, merk, nummer, bewijsniveau, opmerking, bron en de gekozen uitvoering voor de auto van de gebruiker. |
| `build.py` | Voegt `src/` samen tot `index.html`, controleert de broncode en maakt een testversie. |
| `tools/` | Testscripts (Playwright, headless Chromium) en `anchors.json` met de ankernamen. |
| `tools/opentest.py` | Toetst elke opener op eindstand, ondergrens, botsing, blootleggen, prestaties en spookbatch. |
| `tools/open_allow.json` | De uitzonderingen op de botsingscontrole van opentest: 9 regels, elk met reden. |
| `data/` | De canonieke nummergegevens (`data/pn/`, zie de README daar) en `tree.json`, alle paden van de boom. |
| `tools/orkestratie/` | Hulpscripts van de bouwsessie: screenshotsets, eindcijfers, volledige testset in één keer, ruimtebezetting, eigendomscontrole en de hulpmiddelen van de visuele poort. Zie de README in die map. |
| `docs/` | Specificaties met bronnen, ontwerp en architectuur, testverslag, premortem, screenshots. |
| `docs/v1/index.html` | De eerste versie van de pagina, bewaard als terugvaloptie. |
| `docs/onderzoek/` | Onderzoeksnotities met bronnen: exterieur, motor, automaat, onderstel en interieur, beslissingen bij tegenstrijdige bronnen, UX-audit. |
| `handomdraai.md` | Korte stand van de repo en advies voor de volgende ronde. |

## Bouwen en testen

```bash
python3 build.py                 # schrijft index.html (three.js via CDN)
python3 build.py /pad/naar/test  # maakt ook test/index.html die three.js uit ./three/ laadt
python3 build.py --lint          # controleert alleen (dubbele namen, syntaxis, tekstregels R1, R2, R4, R5 en R7)
python3 build.py --test-only MAP # alleen de testversie, laat index.html ongemoeid
```

De tests gebruiken three.js 0.186.1 uit een lokaal npm-pakket en een Chromium met software-rendering. Een verse omgeving maak je klaar met `tools/setup.sh` (Playwright uit `requirements.txt`, three.js met hashcontrole). De korte route:

```bash
python3 tools/smoke.py        # laden, aantallen, console
python3 tools/integrity.py    # boom, ankers, doorsteken, presets
python3 tools/silhouette.py   # carrosserie tegen het gemeten silhouet
python3 tools/itest.py        # bediening op desktop en telefoon
python3 tools/pubsmoke.py     # de CDN-versie in de verpakking van de host
python3 tools/ui_inner.py     # ingesloten (inner) onderdelen mogen van buitenaf niet zichtbaar zijn
python3 tools/ui_inner.py --open  # ingesloten knopen die zichtbaar worden met alles open
python3 tools/opentest.py     # de 26 openers: zes controles per opener
```

De hele set in een keer, strikt en met één exitcode: `tools/orkestratie/finaltests.sh UITVOERMAP`. De budgetten voor driehoeken staan in `tools/anchors.json` en worden bewaakt door `python3 tools/tri.py --gate`.

Voorbereiding, alle scripts en de resultaten staan in [docs/testen.md](docs/testen.md).

## Documentatie

- [Specificaties en bronnen](docs/specificaties-en-bronnen.md): wat is bevestigd, aannemelijk of geschat, met bron.
- [Onderzoek](docs/onderzoek/README.md): onderzoeksnotities, de kennisbasis uit het rapport van de gebruiker en het werkplaatshandboek MR 415, en de beslissingen bij tegenstrijdige bronnen.
- [Ontwerp en architectuur](docs/ontwerp-en-architectuur.md): coördinaten, bronbestanden, knoop-API, uitklaplogica, de openmodus, contracten tussen de delen, ontwikkelgeschiedenis.
- [Testen](docs/testen.md): scripts, controles en resultaten.
- [Premortem](docs/premortem.md): waarom de klikregel is veranderd, welke vangnetten er zijn en wat de premortem van golf 4 (openmodus en onderdeelnummers) opleverde en hoe de struikeldraden er na golf 5 voor staan, met de premortems van golf 5b-2 en 5b-3.

## Bekende beperkingen

- Het is een schematisch model. Vormen, maten en posities van onderdelen zijn benaderd en niet geschikt als montagevoorschrift. De carrosserie volgt de officiële hoofdmaten, het gemeten silhouet en foto's van de eigen auto, maar is geen exacte kopie van het ontwerp. Het logoverbod is op 21 oktober 2026 door de gebruiker opgeheven: de Renault-ruit staat als geometrie op de neus van de motorkap en op de achterklep (plaats en maat op de klep geschat). Typebadges zijn er niet.
- Het inwendige van de automaat volgt de zusterbak (Mitsubishi F6AJA) en de literatuur over de Jatco JF613E. Voor de Renault AJ0 zelf zijn geen werkplaatstekeningen gevonden, dus de koppeling tussen de planetaire sets is schematisch.
- De velgen zijn 18 inch met band 225/45 R18; de gebruiker heeft dat aan de eigen auto vastgesteld. Zie [docs/specificaties-en-bronnen.md](docs/specificaties-en-bronnen.md).
- Niet in het model: 4Control (vierwielbesturing). Dat was een optie en de auto van de gebruiker heeft het niet.
- Openmodus: de eindhoek of slag van elke opener is geschat uit foto's, het instructieboekje en het werkplaatshandboek; aan de echte auto is niets gemeten. De ondergrens per opener staat in de code (`open.min`), de 9 uitzonderingen van opentest staan in `tools/open_allow.json`; beide worden uitgelegd in [docs/testen.md](docs/testen.md). De visuele poort van golf 5 (negen beoordelaars op dezelfde kenmerken K1 tot K13, drie poorten, meerderheid per kenmerk) eindigt op 13 ja, 4 deels en 0 nee (versie 6: 10, 7, 0). Deels bleven K6 (de hoedenplank las van achteren nog vlak, de linker gasveer was dun; aangepast in golf 5b-3, het oordeel van een nieuwe poort ontbreekt), K11 (de zijbekleding van de bagageruimte is trapvormig, de camera van het handschoenenkastje staat dicht op het dashboard) en K9 in de interieurplak (de vaste zijruit achter was groot en hing bij een open achterportier los in de opening, sinds golf 5b-3 draait hij mee; de luchtroosters hebben ruis). Zie [docs/testen.md](docs/testen.md) en `handomdraai.md`.
- Onderdeelnummers, dekking (stand van golf 5, toen 2.524 onderdelen; het huidige aantal staat in [docs/cijfers.md](docs/cijfers.md)): van de onderdelen hebben er 1.400 een regel in de gegevens (onderzocht) en 649 minstens een nummer. 751 zijn onderzocht zonder nummer te vinden en 1.124 zijn niet onderzocht (vooral interieur, carrosseriedelen en kleine bevestigingsmiddelen). Er zijn 546 verkoopeenheden: 110 passen volgens de catalogus, 71 zijn een variant en 365 zijn niet gevonden, waaronder veel groepsknopen zonder eigen verkoopeenheid. Bij 13 van de 71 varianten is de uitvoering voor de auto van de gebruiker gekozen (blok Gekozen voor deze auto); 58 blijven open (kies op VIN). In totaal 1.334 nummers: 446 van Renault en 888 van 197 andere merken. Bewijsniveau A heeft 807 nummers, B 436, C 89 en D 2.
- Onderdeelnummers, bronnen: de Renault-catalogi (partsouq, 7zap) zaten achter Cloudflare. Renault-nummers komen daarom vooral uit de OE-lijsten van artikelen van andere fabrikanten. De twee nummers voor het panoramadak komen uit een advertentie (niveau D) en zijn niet in een catalogus gecontroleerd. Catalogi verschillen per bouwdatum en uitvoering; zonder chassisnummer van de gebruiker zijn varianten getoond en niet vastgelegd.
- De CSV bevat geen productbeschrijvingen, prijzen of foto's (databankenrecht, zie `docs/onderzoek/databankenrecht.md`); maten, posities en uitrusting uit de catalogus staan als korte Nederlandse aanduiding bij het nummer, en de regelteksten en onderzoeksnotities noemen soms de categorie van de bron.
- Het werkplaatshandboek MR 415 en de referentiefoto's staan niet in de repo (rechten van Renault en derden). In de tekst staan alleen korte verwijzingen met paginanummer.
- De stuurbekrachtiging is hydraulisch met een pomp op de multiriem; de riemsets in de catalogus (TecDoc-type 23370) noemen de stuurpomp als verbruiker.
- De prestaties zijn alleen in een container met software-rendering gemeten. Op een echte telefoon is de framesnelheid niet getest; de pagina schakelt zelf over op een lichte weergave als hij haperen gaat.
- Gebundeld renderen van gesloten groepen staat standaard aan (schakelaar in Weergave). De grens van 1.500 tekenopdrachten voor de gemonteerde stand geldt alleen met bundelen; de aantallen staan in [docs/cijfers.md](docs/cijfers.md).
- De multiriem is in het model 1.672 mm lang tegen 1.790 tot 1.795 mm (7PK, per catalogus), door een compacte poelieplaatsing (in golf 4 was het 1.569 mm); de beschrijving in de pagina zegt dat. Het verloop van de riem is niet bekend. De positie van de stuurpomp en de routes van de slangen zijn schematisch.
- De voorste langsliggers lopen sinds golf 5 boven de aandrijfassen; het aantal ribdoorboringen ging van 1.855 naar 34. De achterste langsliggers liggen naar binnen (doorboringen van 548 naar 0).
- De torsiebalk ligt in het model boven de vlakke vloer (y 0,25 tot 0,33, vloer y 0,18). Bij de echte auto loopt de balk onder een verhoogd vloerdeel. Sinds golf 5 heeft de bodemplaat een opkant boven de balk (19 mm speling), liggen tank en koolstoffilter voor de balk (de tank is schematisch kleiner dan 66 liter) en hangt de ATF-koeler 12 cm lager.
- De veer achter steekt door de voorrand van de bagagevloer in de veerkoker. De koker staat in de bagageruimte als kastje naast de rugleuning. Sinds golf 5 heeft de bagageruimte zijbekleding in donker vilt over de wielkasten en de vulpijp; of de koker daar nu achter verdwijnt, is niet apart nagemeten.
- Golf 5 bouwde UX-punt U19 (de rest dimmen bij het duiken naar een onderdeel) en een zijkolom voor telefoons in liggende stand. Geen van beide is op een echte telefoon getest.
- Herkenbaarheid: de laatste visuele poort (poort 5, op `9c731c8`, drie onafhankelijke beoordelaars, meerderheid per kenmerk) vond 7 van de 9 herkenningskenmerken volledig aanwezig. De eis is 7, dus S7 is gehaald. Twee kenmerken zijn deels aanwezig: drie zijruiten met zwarte B-stijl en chromen raamlijst (op galerijformaat leest de B-stijl als dunne lijn en is de raamlijst nauwelijks te zien; in golf 5b-3 is de B-stijl weer een zwart vlak met een kort chromen eindstuk; de S7-run in de poort van ronde 3, stand `0317061`, gaf 9 van 9 kenmerken; de eindpoort draaide S7 niet opnieuw, omdat het exterieur na ronde 3 niet veranderde, en haar K-panels staan in [docs/testen.md](docs/testen.md)) en het bovenaanzicht (het leest evenwijdig, zonder heupen; de bouwtekening is per kolom gemeten en de breedte is van net voor de achteras tot de vooras constant binnen 1 %, dus dit is niet aangepast). De einduitlaten, die alle drie de beoordelaars als groot gebrek noemden, zijn daarna opgelost in `ff42dbd` en in de galerij nagelopen. Die poort (golf 4) is daarna niet opnieuw gedraaid; de poorten van de golven 5b-2 en 5b-3 staan in [docs/testen.md](docs/testen.md). Zie [docs/premortem.md](docs/premortem.md), struikeldraad 3.
- Onderkant: bij het nalopen van de meldingen van de gebruiker over de onderkant bleek het interieur door de wielbogen en van onderen te zien. Dat is opgelost met gesloten wielkasten en een vloer tot de wielkast. Stralen loodrecht door de vier wielbogen geven 0 interieurtreffers. Stralen van onderen in zeven richtingen geven 2 randgevallen op ruim 60.000. Die controle is met scripts in het scratchpad gedaan en zit niet in de repo.
- Op de motorkap, het dak en de portieren zijn in het bovenaanzicht donkere spikkels te zien, maar alleen met de software-rasterisatie van de container (SwiftShader). Gemeten in golf 5f: op de echte GPU van een Mac (ANGLE Metal) zijn er geen. Beelden voor het oog (de herkenbaarheidspoort, de galerij) komen daarom van de GPU (`LAG3_GPU=1`, alleen macOS); de testset en `visdiff` blijven op SwiftShader.
- Labelankers: `tools/anchorcheck.py` meet per preset of een anker op het eigen deel ligt en of het een vrije zichtlijn heeft. Op de stand van golf 5c-1 (42 presets): 352 labels, 319 op het eigen deel, 265 met vrije zichtlijn (de basis in `docs/baseline/anchorcheck.json`; geen van beide mag dalen). Vóór golf 4 waren het 261 van 345 op het eigen deel.
- Driehoeken per hoofdgroep, tekenopdrachten met en zonder bundelen, opstarttijden en de andere kerncijfers staan in [docs/cijfers.md](docs/cijfers.md); de budgetten in `tools/anchors.json`.
- Interactietest: op de laatst gemeten stand slagen alle controles van `tools/itest.py` (desktop en telefoon, openmodus, onderdeelnummers, toetsenbord, formaatwissel, foutpaden); het aantal en de stand staan in [docs/testen.md](docs/testen.md).
- Niet getest op een echte telefoon en een echte GPU.
- Alle laadtijden zijn in een container met software-rendering gemeten (de pagina is daar na 5 tot 28 seconden klaar, afhankelijk van de belasting van de machine). Ze zeggen niets over een echt apparaat.
- De gedragingen van de webview van een telefoon-app (lang drukken, sneltoetsen in een iframe) zijn niet te testen in de container. De stijlregels ervoor zijn wel getoetst.
- Niet elke 2.0T 170 automaat uit fase 2 is overal geleverd. Zie [docs/specificaties-en-bronnen.md](docs/specificaties-en-bronnen.md) onder Leverbaarheid.

## Screenshots

| Hoofdgroepen | Motor F4Rt |
|---|---|
| ![Hoofdgroepen](docs/screenshots/hoofdgroepen.png) | ![Motor](docs/screenshots/motor-f4rt.png) |
| **Automaat** | **Röntgen** |
| ![Automaat](docs/screenshots/automaat.png) | ![Röntgen](docs/screenshots/rontgen.png) |

| **Openen: alles open** | **Openen: bagageruimte** |
| ![Alles open](docs/screenshots/openen-alles.png) | ![Bagageruimte](docs/screenshots/openen-bagageruimte.png) |
| **Openen: motorruimte** | **Openen: panoramadak** |
| ![Motorruimte](docs/screenshots/openen-motorruimte.png) | ![Panoramadak](docs/screenshots/openen-panoramadak.png) |

Openen, instappen (vier portieren open): [docs/screenshots/openen-instappen.png](docs/screenshots/openen-instappen.png)

Alles uit elkaar: [docs/screenshots/alles-uit-elkaar.png](docs/screenshots/alles-uit-elkaar.png)

Telefoonweergave: [docs/screenshots/mobiel.png](docs/screenshots/mobiel.png)

De screenshots in `docs/screenshots/` tonen de stand van versie 8 (golf 5, 5a, 5c-1 en 5d): ze zijn gemaakt met `tools/orkestratie/docshots.py`, via de presets van de pagina, op 1280 x 800 (`mobiel.png` op 390 x 844 met pixelverhouding 2), met software-rendering in de container en daarna teruggebracht tot 256 kleuren.

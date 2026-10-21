# Exterieur-referentie Renault Laguna III fase 2 (hatchback, Initiale Paris)

Doel: een modelleur moet de procedurele carrosserie zo kunnen hervormen dat hij onmiskenbaar als Laguna III fase 2 5-deurs hatchback leest. Alle maten staan in meter in het modelframe (x links +, y omhoog vanaf de grond, z naar voren +). Statussen: Bevestigd, Aannemelijk, Geschat, Niet gevonden.

Afbeeldingen (allemaal in `research/img/`, bekeken met Read):

| Bestand | Wat | Herkomst |
|---|---|---|
| `bp_renault-laguna-iii-2008.gif` (1253x654) | Lijntekening zijkant, voor, achter, boven, hatchback (fase 1, carrosserie gelijk aan fase 2 behalve neus, koplampen, achterlichten) | https://www.the-blueprints.com/blueprints-depot/cars/renault/renault-laguna-iii-2008.gif (pagina: https://www.the-blueprints.com/blueprints/cars/renault/23281/view/renault_laguna_iii_2008/) |
| `bp_renault-laguna-iii-2007.gif` (2176x1126) | Vroege/ruwe tekening, alleen ter controle | https://www.the-blueprints.com/blueprints/cars/renault/23280/view/renault_laguna_iii_2007 |
| `ph2_hatch_black_side.jpg` (800x600) | Persfoto fase 2 hatchback, zwart, bijna orthografisch zijaanzicht | via Jina-afbeeldingszoekopdracht "Renault Laguna 2011 facelift hatchback side profile photo" (brons-URL niet teruggegeven door de tool; zelf opgeslagen) |
| `ph2_hatch_blue_front34.jpg`, `ph2_hatch_white_front34.jpg`, `ph2_estate_silver_front34.jpg` | Fase 2 voorkant driekwart (blauw en wit zijn hatchback, zilver is Estate maar met dezelfde neus) | zelfde zoekopdracht-familie |
| `commons_4.jpg`, `commons_5.jpg`, `commons_6.jpg` | Fase 2 hatchback achterkant: zilver, wit, zwart | Wikimedia Commons, o.a. `File:Renault Laguna 142709.jpg`, `File:Renault Laguna III 092424.jpg`, `File:Renault Laguna (51133710886).jpg` |
| `bp_the-blueprints_hatch2009_annotated.jpg` | Gekleurde vector met maatlijnen 1014 / 2756 / 925 / 4695 / 1557 / 1811 / 1512 / 1445 | https://www.the-blueprints.com/vectordrawings/show/renault-laguna-hatch/ |
| `side_*_grid.png`, `top_grid.png`, `frontview_grid.png`, `rearview_grid.png`, `ph2_side_grid_*.png` | Mijn meetraster-overlays (pixelcoordinaten van het originele bestand) | zelf gemaakt met `scratchpad/scripts/grid.py` |

---

## 1. Hoofdmaten

| Maat | Waarde | Bron | Status |
|---|---|---|---|
| Lengte x breedte x hoogte | 4695 x 1811 x 1445 mm | Renault UK brochure april 2011 (Ph2), tabel Laguna Hatch: https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2011-UK.pdf ; plus bestaande doc | Bevestigd (officieel) |
| Breedte zonder / met spiegels | 1811 / 2060 mm | zelfde brochure | Bevestigd (officieel) |
| Wielbasis | 2756 mm | zelfde brochure | Bevestigd |
| Spoor voor / achter | 1557 / 1512 mm | zelfde brochure; Automoli fase II https://www.automoli.com/us/vehicles/renault/laguna/laguna-iii-phase-ii-4236 ; autoevolution geeft 1557/1511 | Bevestigd. **Let op: `body.js` gebruikt `TRACK = 0.775` voor beide assen; correct is voor 0,7785 en achter 0,756 (halve spoorbreedte).** |
| Overhang voor / achter | 1014 / 926 mm (brochure), 1014 / 925 (Automoli, the-blueprints) | zelfde brochure; Automoli | Bevestigd als opgegeven maat, **maar zie tegenstrijdigheid hieronder** |
| Bodemvrijheid (beladen) | > 120 mm | brochure ("K - Ground clearance, laden >120") ; carsguide 116 mm onbeladen; autoevolution 119 mm | Bevestigd als ondergrens. Een bron (renault.drive.place) noemt 170 mm, niet gebruikt. |
| Hoogte drempel laadvloer (hatch) | 711 mm onbeladen ("J - Unladen sill height") | brochure | Bevestigd. Dit is de laaddrempel van de bagageruimte, geen zijdrempel. |
| Hoogte met open achterklep | 1900 mm | brochure | Bevestigd |
| Schouderbreedte voor / achter (binnen) | 1440 / 1400 mm | brochure | Bevestigd |
| Bagageopening boven / onder breed | 870 / 910 mm | brochure | Bevestigd |
| Band | 225/45 R18 95W, buitendiameter 0,660 m (straal 0,330 m) | UK-brochure (GT Line, Initiale Lux Pack: 225/45 R18 95W); Automoli (GT: 225/45 R18) | Bevestigd als leverbare maat |
| Velg 18" Celsium | 7,5 x 18, 5 gaten, ET47 | eBay-advertentie origineel Renault: https://www.ebay.fr/itm/318494502413 | Aannemelijk (een bron) |
| Wielbevestiging | 5 x 114,3 | bestaande doc, auto-doc.fr | Bevestigd |
| Spiegelhuis | ca. 0,22 (z) x 0,145 (y), midden y 0,97, z 0,66 tot 0,81; steekt 0,125 m buiten de flank (2060 breed) | gemeten in `ph2_hatch_black_side.jpg` en tekening; breedte uit de brochure | Geschat (+/- 0,02) |

### Is 18 inch en welk wieldesign voor Initiale Paris fase 2?

De bewering "18 inch" is **niet eenduidig** voor Initiale Paris:

| Markt / jaar | Wat staat standaard op de Initiale | Bron | Status |
|---|---|---|---|
| UK, april 2011 (fase 2) | Initiale Lux Pack: 18" **Celsium** standaard; 17" Tenerife en 18" Interlagos (chrome shadow) optie op Dynamique | UK-brochure (URL hierboven) | Bevestigd (officieel, voor UK) |
| Frankrijk, 2008 (fase 1) | Initiale: 17" **Long Beach** standaard; 18" Celsium alleen op GT; 18" Mille Miles (accessoire) | Franse brochure https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2008-FR.pdf | Bevestigd (officieel, fase 1) |
| Frankrijk, collectie 2013 (fase 2 laat) | Initiale: "jantes alliage 17'' spécifiques", bi-xenon directioneel | auto-infos.fr snippet: https://www.auto-infos.fr/article/renault-laguna-2013-tarifs-gammes-et-equipements.194249 (pagina zelf niet te laden, alleen zoekresultaat) | Aannemelijk |
| Frankrijk, Initiale Paris Estate 2012 op forum | Heeft "jantes Mille Miles", mist "les jantes 18"" | https://www.forumlaguna3.com/t7717-sarti-laguna-iii-3-estate-2-0-dci-175-bva-initiale-paris-4control | Aannemelijk (een eigenaar) |
| NL, 2011, 2.0T 170 automaat Initiale (Paris) | Niet teruggevonden; autoweek.nl en cars-data.com blokkeren automatische toegang | - | **Niet gevonden** |

Conclusie: 225/45 R18 is een echte, leverbare maat voor deze auto (UK Initiale Lux standaard, overal GT standaard, overal optie), maar 18" als standaardmaat op een Nederlandse Initiale Paris 2011 is **niet bevestigd**; 17" (215/50 R17) is evenzeer mogelijk. De eigenaar moet zijn eigen auto bekijken (bandenmaat op de zijkant van de band). Voor het model: 18" houden is verdedigbaar, maar de docs mogen het niet als bevestigd presenteren.

Wieldesign (fase 2, 18"): de persfoto van de zwarte fase 2 hatchback toont **10 spaken**, taps toelopend (breed bij de velgrand, smal bij de naaf), zilver gepolijst, geen lakverschil. Dit komt overeen met de beschrijving van de Celsium, maar de koppeling naam-foto is niet bevestigd (de foto heeft geen onderschrift). Interlagos is een ander ontwerp (multispaak, chrome shadow of zwart, 5 dubbele spaken volgens foto's). **Aannemelijk: 10 spaken, taps; naam Celsium niet bevestigd voor deze foto.**

Aanvulling golf 5n (21 oktober 2026): de foto van de velg van de auto van de gebruiker toont geen tien taps toelopende spaken, maar tien dubbele spaken: twintig holle armen in V-paren, met de vijf wielbouten verzonken in ronde putten en een vlakke zilveren naafdop met de Renault-ruit. Het model volgt die foto (`src/chassis.js`, Velgster); de waarneming van de persfoto hierboven geldt dus niet voor deze auto. Het spaakaantal is waargenomen, het profiel geschat. Op de band van dat wiel staat Michelin.

Visuele afmetingen van het wiel op de foto: velgvlak (zichtbare velg) is 0,71 x bandbuitendiameter, dus past bij 18" (0,457 / 0,660 = 0,69).

### Tegenstrijdigheid met bestaande doc en `body.js`

De doc en `body.js` zetten voorwas op z = +1,365 en achteras op z = -1,391 (overhang voor 0,980 en achter 0,959). De fabrieksmaten zijn voor 1014 en achter 925/926, dus de assen zouden op z = +1,331 en -1,425 liggen. **Maar** twee onafhankelijke metingen (de lijntekening en de persfoto van fase 2) geven allebei kortere overhangs dan 1014/925: voor ca. 0,88 tot 0,94 m en achter ca. 0,83 tot 0,85 m (zie sectie 2, kalibratie). Er zijn dus drie kandidaten (project 0,980/0,959; fabriek 1,014/0,925; beelden 0,92/0,84). Ik heb de beelden afgebeeld op de **projectassen en projectneuzen** (zie sectie 2), zodat wat de modelleur uit deze tabel overneemt consistent is met de bestaande wielen. Status: **onopgelost, Geschat**. Het verschil is hooguit 0,035 m op de assen en doet het silhouet niet kantelen.

---

## 2. Zijprofiel numeriek

### Methode en kalibratie

1. Lijntekening `bp_renault-laguna-iii-2008.gif`: zijaanzicht staat tussen pixel x = 7 (achterste punt) en x = 852 (voorste punt) = 845 px. Wielmiddens bepaald uit cirkel-fit van de bandonderkant: achter x = 164,4, voor x = 679,0 (514,6 px tussen de assen). Grond = onderkant band y = 275, dak y = 8 (267 px).
2. Verticale schaal: 1445 mm / 267 px = **5,412 mm/px**. Controle: bandstraal 330 mm komt uit op 61 px, gemeten 60,8 px. Verticaal dus erg goed.
3. Horizontale schaal tussen de assen: 2756 / 514,6 = 5,356 mm/px (1% verschil met verticaal, goed).
4. Voor de overhangs is de tekening kort: 173 px voor (938 mm bij 5,41) en 157 px achter (851 mm). Dat is 8 tot 9% korter dan 1014/925. Ik heb daarom **stuksgewijs lineair** afgebeeld: pixel 7 -> z = -2,350; 164,38 -> -1,391; 678,96 -> +1,365; 852 -> +2,345. De overhangzones zijn dus 12 tot 14% uitgerekt ten opzichte van de tekening.
5. **Onafhankelijke controle** met persfoto fase 2 (`ph2_hatch_black_side.jpg`): wielmiddens x = 162 en 632 (470 px), schaal 5,862 mm/px (tyre 112 px = 660 mm, dak 1445 mm = 246 px), punten x = 20 en 781. Zelfde overhangverhouding (wielbasis/lengte = 0,611 in beide beelden, de fabriek geeft 0,587). Toplijn volgens beide bronnen verschilt gemiddeld 0,02 en maximaal 0,06 m (grootste verschil in de voorruit/motorkap en neus, waar fase 2 hoger/anders is).
6. Geschatte fout: **+/- 0,02 m in y** en **+/- 0,03 m in z** tussen de assen; **+/- 0,05 m in z** in de overhangzones (door de stuksgewijze afbeelding); +/- 0,06 m op de neuspunt (fase 1 tekening vs fase 2 foto).

Het bovensilhouet is in beide bronnen het silhouet in het vlak x = 0 (hartlijn).

### Tabel: z-stations elke 0,25 m (gemiddelde van tekening en fase 2-foto, voor de neus de foto zwaarder gewogen)

`y_top` = bovensilhouet op hartlijn. `y_belt` = onderkant zijruiten (raamlijn); voor z > 0,95 is het de bovenrand van de motorkap aan de zijkant (voorscherm), voor z < -1,3 de schouderlijn van het achterscherm tot aan de achterlichtbovenrand. `y_bottom` = onderkant carrosserie/dorpel; bij wielbogen staat de rand van de boog.

| z | y_top | y_belt | y_bottom | Opmerking |
|---|---|---|---|---|
| +2,345 | 0,58 | 0,60 | 0,30 | neuspunt: bumperfront bijna verticaal tussen y 0,29 en 0,56 |
| +2,095 | 0,81 | 0,68 | 0,21 | koplampvoorkant (lamp tot z=2,12) |
| +1,845 | 0,885 | 0,76 | 0,19 | koplamp achterkant bij z=1,87 |
| +1,595 | 0,93 | 0,79 | boog: 0,62 | voorwielboog |
| +1,345 | 0,97 | 0,82 | boog: 0,70 | midden voorwiel (z=1,365): boogtop 0,70 |
| +1,095 | 0,99 | 0,87 | boog: 0,58 | voorruitbasis ligt hier (z=1,06) |
| +0,845 | 1,115 | 0,915 | 0,18 | voorruit loopt omhoog |
| +0,595 | 1,24 | 0,928 | 0,18 | |
| +0,345 | 1,335 | 0,937 | 0,18 | voorruitkop (z=0,30, y=1,34) |
| +0,095 | 1,415 | 0,945 | 0,18 | |
| -0,155 | 1,44 | 0,949 | 0,18 | B-stijl en deurnaad voor/achter |
| -0,405 | 1,448 | 0,955 | 0,18 | dakpiek (plateau z -0,50 tot -0,36) |
| -0,655 | 1,443 | 0,963 | 0,18 | |
| -0,905 | 1,417 | 0,968 | 0,18 | |
| -1,155 | 1,372 | 0,976 | boog: 0,615 | dak-achterruit-knik bij z=-1,17 |
| -1,405 | 1,31 | 0,97 | boog: 0,70 | midden achterwiel (z=-1,391) |
| -1,655 | 1,255 | 0,965 | boog: 0,59 | |
| -1,905 | 1,18 | 0,96 | 0,25 | achterbumperonderkant (0,244 bij z=-1,80) |
| -2,155 | 1,10 | 1,00 | 0,28 | spoilerlip bij z=-2,12 (y 1,12) |
| -2,350 | 0,64 | 0,64 | 0,53 | achterste punt: de staartkant is bijna verticaal van y 1,07 (z=-2,26) tot y 0,40 (z=-2,27) |

Extra onderrand-waarden (tekening, band en boog uitgesloten): front bumper onderkant: z=2,30: 0,27; 2,20: 0,22; 2,10: 0,21; 2,00: 0,20; 1,90: 0,195; 1,80: 0,184. Achter: -1,80: 0,244; -1,90: 0,249; -2,00: 0,260; -2,10: 0,271; -2,20: 0,287; -2,30: 0,38. Tussen de wielbogen is de onderkant van de dorpelrand y = 0,179, met een zilveren dorpelstrip rond y 0,21 tot 0,24 (z van -0,95 tot +0,85).

### Plan (bovenaanzicht), halve breedte

Bron: `bp_renault-laguna-iii-2008.gif` bovenaanzicht, hartlijn y = 465 px. De bovenaanzichttekening is smaller dan de voorkant (309 px tegen 324 px voor 1811 mm); ik heb de maximale halve breedte op de officiële 0,9055 m gezet (schaal 5,86 mm/px). Fout +/- 0,03 m.

| z | halve breedte buitenlijn (zonder spiegels) |
|---|---|
| +2,345 | 0,04 (neusspits, straal groot) |
| +2,30 | 0,32 |
| +2,20 | 0,66 |
| +2,10 | 0,76 |
| +2,00 | 0,81 |
| +1,80 | 0,86 |
| +1,60 | 0,90 |
| +1,40 tot -1,50 | 0,905 (plateau; schouder/portierdikte) |
| -1,75 | 0,88 |
| -2,00 | 0,835 |
| -2,10 | 0,81 |
| -2,20 | 0,77 |
| -2,30 | 0,50 |
| -2,35 | 0,29 |

Halve breedte op **gordelhoogte** (raamlijn): ca. **0,81 m** (+/- 0,03) van z = -1,7 tot +0,9, bij z = -2,0 ca. 0,77, bij z = -2,2 ca. 0,70. Halve breedte van het **dakrand**: ca. **0,59 m** (+/- 0,03). Tumblehome dus 0,81 -> 0,59 over ca. 0,45 m hoogte (ongeveer 26 graden vanuit de verticaal). Voorruit halve breedte onderaan 0,76 m (y 0,97), bovenaan 0,56 m (y 1,35). Spiegels: halve breedte 1,03 m.

Vergelijking met het huidige model (`body.js` regels 23 tot 26): zijprofiel (YR, YB, YT) zit al binnen 0,03 tot 0,05 m van deze meting. De grote afwijking zit in het plan: het model heeft `HW(2,28) = 0,80`, `HW(2,32) = 0,76`, `HW(-2,35) = 0,70`, terwijl de referentie bij z = +2,30 maar 0,32 en bij z = -2,30 slechts 0,50 heeft. Het model heeft dus een veel te brede, stompe neus en staart (vooral van bovenaf). Verder is de schouderlijn `YT` achter 0,05 tot 0,08 m te hoog (1,045 tegen 0,96) en voor 0,03 te hoog (0,965 tegen 0,935).

---

## 3. Sleutelpunten (z, y)

Afbeelding in het modelframe, zelfde kalibratie als sectie 2. Foutmarge +/- 0,03 m (+/- 0,05 in de overhangzones).

| Punt | z | y | Opmerking |
|---|---|---|---|
| Voorruitbasis (cowl) | +1,06 | 0,97 | wisserzone; stap in silhouet bij z 1,06 tot 1,26 (y 0,97) |
| Voorruitkop (daklijn) | +0,30 | 1,34 | kleine stap tussen dak en ruit |
| Voorruithelling | 26 graden t.o.v. horizontaal | | (1,34 -> 0,97 over 0,76 m) fase 1 tekening; foto fase 2 geeft 26 tot 27 |
| Dakpiek | -0,43 (plateau -0,50 tot -0,36) | 1,445 | ligt boven de B-stijl |
| Achterruit boven (dak/ruit-knik) | -1,17 | 1,37 | |
| Achterruit onder / klepbovenrand | -2,11 | 1,13 | |
| Achterruithelling | **14 graden** (tekening) tot 15,7 graden (foto) | | zeer vlak: coupéachtige hatchback |
| Spoilerlip (klepbovenrand) | -2,12 | 1,12 | smal lipje van ca. 0,05 m; accessoire "sport spoiler" apart verkrijgbaar (UK-brochure) |
| Staartvlak bovenkant | -2,26 | 1,07 | bijna verticaal omlaag tot bumper |
| Achterlicht onderkant | -2,30 | 0,68 | |
| Voorwielboog (midden) | +1,365 | boogtop 0,70 | straal uitsparing **0,37** om (z=1,365, y=0,33); nog een dunne flensboog r = 0,43 |
| Achterwielboog (midden) | -1,391 | boogtop 0,70 | idem |
| Wielboog begrenzing onder | | 0,245 | boog sluit onderaan op y = 0,245 af (de cirkel wordt daar afgekapt) |
| Voordeur voorrand | +0,905 (boven) -> +0,84 (onder) | 0,92 -> 0,31 | schuin; loopt achter de wielboog langs |
| Voordeur achterrand = B-stijl | -0,14 (boven) -> -0,15 (onder) | 0,95 -> 0,30 | bijna verticaal |
| Achterdeur achterrand | -1,27 (bij gordel) | 0,97 | loopt eerst verticaal tot y 0,88, dan **naar voren en omlaag** om de achterwielboog: (-1,264; 0,877), (-1,109; 0,660), (-0,916; 0,406), eindigt op de dorpel bij **z = -0,665, y = 0,30** |
| B-stijl zwarte beplating | boven z -0,34 tot -0,24 (breedte 0,10); onder z -0,28 tot -0,13 (breedte 0,15) | y 1,37 -> 0,94 | helt ca. 12 graden naar achteren |
| C-stijl | boog van z -1,25 (y 0,98) omhoog naar (-1,15; 1,25) en (-0,97; 1,30) | | stijl met sterke kromming |
| Zijruit voor (DLO) | polygon: (-0,28; 0,94), (-0,34; 1,37), langs dakrand (y 1,36 -> 1,33 tot z=+0,30), A-stijl schuin naar (+0,93; 0,93) | | bovenrand ruit = ca. 0,075 onder de daklijn |
| Zijruit achter (achterdeur) | (-0,28; 0,95), (-0,34; 1,36), bovenrand ca. y 1,36 tot 1,30 naar achter, achterrand schuin van (-0,97; 1,30) naar (-0,91; 0,97) | | |
| **Achterste zijruitje (vaste kwartsruit)** | (-1,21; 0,97), (-1,19; 1,22), (-1,15; 1,25), (-0,97; 1,30), (-0,91; 0,97) | | driehoekig/trapezium; staat los van de achterdeurruit door een schuin stijltje |
| Deurgreep voor | z -0,09 tot +0,15 | 0,80 | |
| Deurgreep achter | z -1,14 tot -0,89 | 0,84 | |
| Zijbeplating (strip) voor | z +0,03 tot +0,82 | 0,51 tot 0,58 | dubbele strip, alu/chroomlook |
| Zijbeplating achter | z -1,16 tot -0,16 | 0,51 tot 0,58 | idem |
| Dorpelstrip zilver | z -0,95 tot +0,85 | 0,21 tot 0,24 | "bas de marche alu" (fase 1 Initiale) |
| Tankklep | z -1,72 tot -1,49 | 0,86 tot 0,93 | **rechterachterscherm** |
| Spiegel | z +0,66 tot +0,81 | 0,90 tot 1,04 | op driehoekig plaatje bij A-stijl |

Karakterlijn (flank): een lijn die bij de voorwielboog begint (y ca. 0,80 bij z=+0,95) en naar achter oploopt tot boven de achterdeurgreep (y 0,90 bij z=-1,0) en doorloopt in de bovenrand van het achterlicht (y 0,95 tot 1,0).

---

## 4. Voorkant (fase 2)

Fase 2 versus fase 1 (bron: Autozine, UK-brochure): nieuw ontwerp van de voorkant: andere bumper met nieuwe grille, nieuwe koplampen. De achterkant kreeg andere (LED-)lichten. Dak, ruiten, deuren zijn gelijk gebleven. Hoofdstuk beschrijft fase 2 uit foto's; waar alleen de fase 1 tekening gemeten kon worden, staat dat erbij.

| Onderdeel | Beschrijving | Maten (m) | Status |
|---|---|---|---|
| Koplamp | Slank, naar achteren zwaaiend ("eyelid") met zwarte mask; boven loopt de lamp door in de bovenrand van het scherm; twee projectorlenzen naast elkaar plus knipperlicht, chroom randje | zijaanzicht: z +1,81 tot +2,13, y 0,70 tot 0,77 (foto); buitenrand x = +/-0,80, binnenspits x = +/-0,34 (geschat uit driekwartfoto's); loopt dus ca. **0,5 m terug langs het scherm** (z 1,81 tot 2,30) | Geschat; Bi-xenon directioneel standaard bij Initiale (Autozine; Planète Renault Coupé) |
| Fase 1 koplamp ter vergelijking | drie ronde lenzen, buitenrand x = +/-0,82, y 0,62 tot 0,87 | | Gemeten uit tekening (niet fase 2) |
| Motorkap | Gebombeerd; twee creases lopen van de binnenspitsen van de koplampen schuin omhoog en naar achter naar de voorruitbasis; Renault-ruit op de neusrand van de kap; kapnaad aan zijkant op y 0,89 (z 0,94) -> 0,81 (z 1,48) -> 0,76 (z 1,88) | | Geschat uit tekening en foto's |
| Bovengrille | Smalle zwarte sleuf direct onder de kapvoorkant, met dunne chroomlijn; overspant x = +/-0,30, y 0,62 tot 0,66 | | Geschat (foto's) |
| Kenteken | Midden voor, op het zwarte horizontale vlak boven de onderste inlaat; NL-plaat 0,52 x 0,11; hartlijn y = 0,505 (tekening) | | Geschat |
| Onderste inlaat | Grote brede donkere inlaat met honingraat/mesh; overspant x = +/-0,55, y 0,28 tot 0,46; **chroom randje** (U-vorm) rond het onderste vlak op de Initiale | | Aannemelijk (foto's: blauw met chroom rand; Initiale-specifiek niet bevestigd) |
| Mistlampen | Zwarte rechthoekige/trapezium behuizingen in de hoeken van de bumper; **chroom "wenkbrauw" balk** boven elke behuizing, naar buiten oplopend; lamp zelf rond r = 0,047 | middelpunt x = +/-0,59, y 0,37 | Geschat; mistlampen standaard (UK-brochure) |
| Luchtgordijn | Smalle verticale zwarte spleet in de bumperhoek naast de wielboog | x ca. +/-0,84, y 0,30 tot 0,52 | Geschat (foto's) |
| Bumperlip | Lage, zilveren/zwarte onderlip; zilveren strip onderaan langs de bumperzijde loopt door als dorpelstrip | y 0,18 tot 0,21 | Geschat |
| Voorruit | Halve breedte onderaan 0,76 (y 0,97), bovenaan 0,56 (y 1,35) | | Gemeten (tekening) |
| Kapnaden | Kap: voorrand bij de neus y 0,65, achterrand bij de cowl z 1,06 | | Gemeten |
| Parkeersensoren voor | Vier kleine ronde sensoren in onderbumper; Initiale: voorsensoren standaard | | Aannemelijk (Planète Renault: "radar de parking avant" bij Initiale; UK-brochure: optie/pakket) |

---

## 5. Achterkant

| Onderdeel | Beschrijving | Maten (m) | Status |
|---|---|---|---|
| Achterlichten | Gescheiden over de **klepnaad**: een deel op het achterscherm (wig, rood LED-look, loopt de flank in) en een kleiner deel op de achterklep (rood met helder midden, met reverse/mistlicht). Fase 1 tekening: lampen x 0,34 tot 0,85, y 0,81 tot 1,01. Fase 2 foto's: lamp loopt om de hoek | y 0,70 tot 1,00; x 0,34 tot 0,88; z-wikkel -2,30 tot -1,98 | Geschat (maten uit fase 1; vorm uit fase 2 foto's); LED-uitvoering Aannemelijk |
| Klep | Grote klep inclusief de hele achterruit; zijnaden lopen bijna verticaal van de lampen omlaag (halve breedte 0,56 onderaan, 0,60 bij lampen); onderrand klep ca. y 0,55 tot 0,71 | | Geschat; **tegenstrijdig**: tekening geeft 0,55, brochure (laaddrempel) 0,711. Gebruik 0,62. |
| Achterruit | Afgerond trapezium; onderkant y 1,13 breed +/-0,67, bovenkant y 1,37 breed +/-0,56; ruit van z -2,11 naar -1,17 | | Gemeten (tekening) |
| Achterruitwisser | Wisser parkeert langs de zijrand van de achterruit. Fase 1 tekening: rechts; fase 2 foto: links | | Aannemelijk (positie tegenstrijdig tussen bronnen) |
| Derde remlicht | Niet zichtbaar op foto's als losse opbouw; waarschijnlijk geintegreerd in de klepbovenrand/spoilerlip | | Niet gevonden |
| Kentekenuitsparing | In de **bumper** (niet in de klep): rechthoekige verdiepte uitsparing met afgeschuinde zijkanten, midden; uitsparing x +/-0,40, y 0,30 tot 0,50; plaat 0,52 x 0,11 met hartlijn y 0,38 | | Geschat (tekening + foto's) |
| Bumper | Bovenrand ("ledge") y 0,52 tot 0,62 met afgeronde uiteinden; onderkant y 0,18 midden, 0,25 (z=-1,9) tot 0,38 (z=-2,30) bij de hoeken; Onderste "schort" zwart/donkergrijs (zilveren fase 2) of in carrosseriekleur (witte fase 2) | halve breedte 0,89 | Gemeten |
| Reflectoren / mistlicht | Rood rechthoekig element onderaan in de bumper, aan een zijde (dichtbij de uitlaat) | x ca. 0,55 tot 0,75, y 0,15 tot 0,22 | Geschat (foto's) |
| Uitlaat 2.0T 170 | **Niet gevonden voor dit specifieke motortype.** UK-brochure fase 2: "Chrome twin exhausts (excluding dCi 110)" standaard op Dynamique, dus twee chromen uitlaatpijpen links en rechts onderin de bumper. Franse fase 1 brochure: "Double canule d'échappement chromée (de série sur motorisations FAP et 2.0 T)". Fase 1 tekening: twee ronde uitlaten x = +/-0,64, y = 0,19 tot 0,22, d = 0,10 tot 0,13. Foto's fase 2 (wit): links kleine ronde punt, rechts grotere ovale punt. Een zilveren fase 2 foto toont geen zichtbare punt (verborgen onder de bumper of aan de afgekeerde kant). | | **Aannemelijk**: twee chroompunten (x +/-0,64, y 0,20). Dat links of rechts blind is: niet bevestigd. |
| Parkeersensoren achter | Vier kleine ronde sensoren in de bumper boven de uitlaat; standaard op Dynamique en Initiale | y 0,45 | Aannemelijk |
| Antenne | Korte mast op het dak achter/links | z ca. -1,6 | Aannemelijk (fase 2 foto) |

---

## 6. Initiale Paris fase 2: specifieke exterieurdetails

| Onderdeel | Wat | Bron | Status |
|---|---|---|---|
| Raamomlijsting | Zilverchroom (zilverkleurig) cerclage om alle zijruiten | UK-brochure: "Silver chrome window surrounds" (alle uitvoeringen); Franse brochure "Cerclage chromé des vitres latérales" | Bevestigd |
| Deurgrepen | Carrosseriekleur, met chroomaccent op foto's | UK-brochure "Body coloured exterior door handles" | Bevestigd (kleur) |
| Spiegels | Carrosseriekleur, elektrisch inklapbaar en verwarmd (Initiale: met geheugen) | UK-brochure | Bevestigd. **Knipperlichtherhaler in de spiegel of in het scherm: Niet gevonden.** Foto's fase 2 tonen geen schermherhaler. |
| Zijbeplating | Lange dubbele alu/chroomlook sierlijsten op beide portieren (fase 2 foto's) | Franse brochure "Baguettes de décor et inserts latéraux aspect aluminium" | Aannemelijk |
| Dorpelstrip | Zilveren strip langs de onderdorpel; Fase 1 Initiale: "Bas de marche alu sur portes AV" | Franse brochure | Aannemelijk voor fase 2 (zichtbaar op foto zwarte hatch) |
| Panoramisch schuifdak | **Optie**, niet standaard: twee glazen delen, een vast, een schuivend. UK: "Electric panoramic sunroof" optie (niet in Initiale Lux Pack). Forum: Initiale Paris Estate heeft "toit ouvrant ... comme options". Geometrie: twee panelen, geschat z +0,20 tot -1,10, halve breedte 0,45; | UK-brochure; forumlaguna3 | Bevestigd als optie; maten Geschat |
| Koplampen | Bi-xenon directioneel (draaiend), inclusief **dagrijlicht** en koplampsproeiers (UK: "Bi-Xenon directional headlights incorporating Daytime Running Lights with headlight washers"). Aparte LED-dagrijstrip: geen aanwijzing; die kwam bij Life/Zen in collectie 2013 | UK-brochure; renault-laguna.com collectie 2013 | Bevestigd (Initiale: bi-xenon) |
| Mistlampen voor | Ja | UK-brochure | Bevestigd |
| Parkeersensoren | Achter standaard, voor optie/pakket (Initiale Lux Pack heeft voor) | UK-brochure | Bevestigd |
| Badges (alleen noteren, niet renderen) | Ruit op neus van kap (voorkant); "LAGUNA" tekst en ruit op de klep; "Initiale Paris" monogram: fase 1 Initiale had "Monogramme latéral INITIAL sur pied milieu" (op de B-stijl); fase 2 positie niet bevestigd, mogelijk op B-stijl of voorscherm | Franse brochure; renault-laguna.com historiek (Laguna I) | B-stijl: Aannemelijk; fase 2: Niet gevonden |
| Wielen | Zie sectie 1: 17 of 18 inch, 10 spaken (foto) | | Zie sectie 1 |
| Kleur | zie hieronder | | |

### Kleuren

| Naam (FR / UK) | Code | Type | Bron | Status |
|---|---|---|---|---|
| **Gris Platine / Mercury** | **D69** (TE: teinte à effet, MI: metallic illusion) | zilvergrijs metallic | UK-brochure kleurtabel (Mercury MI D69); https://www.carross.eu/fr/peinture-renault-laguna-m2638 ; https://www.50nuancesdeteintesrenault.fr/teintes-par-mod%C3%A8les/berlines/laguna-iii-2007-2015 | **Bevestigd** (drie bronnen) |
| Gris Cassiopée / Oyster Grey | KNG | warmer/donkerder grijs metallic | UK-brochure; carross.eu | Bevestigd |
| Gris Éclipse / Eclipse Grey | B66 | donkergrijs metallic | UK-brochure; 50nuances | Bevestigd |
| Beige Cendré / Stone | HNK | beigegrijs | UK-brochure | Bevestigd |
| Noir Nacré / Pearl Black | 676 (MS) | zwart (standaard bij Initiale Lux Pack UK) | UK-brochure | Bevestigd |
| Blanc Glacier / Glacier White | 369 (NM) | wit | UK-brochure | Bevestigd |
| Rouge Vénitien / Venetian Red | NND | rood | UK-brochure | Bevestigd |

"Zilvergrijs" past bij **D69 Gris Platine**. sRGB-schatting uit fase 2 foto's (belichting beinvloedt): basiskleur ca. **#B3B6BA** (R 179, G 182, B 186); highlight ca. #D6D8DB; schaduw ca. #6E7176. Metallic: lichte glans, geen sterke tint. Status: Geschat (gemeten uit onbewerkte persfoto's, niet gekalibreerd). Voor KNG Gris Cassiopée ca. #9B9EA0.

---

## 7. De 10 meest herkenbare visuele kenmerken, op belang

1. **Lange, vlakke achterruit onder 14 tot 16 graden, daklijn met piek boven de B-stijl (z -0,43)**, doorlopend in een klein eendenstaartje (spoilerlip z -2,12, y 1,12). Het geeft de coupe/fastback-uitstraling. Geometrie: dak als een enkele vloeiende boog van voorruitkop (+0,30; 1,34) over de piek (-0,43; 1,445) naar de knik (-1,17; 1,37) en dan een rechte lijn naar de lip (-2,11; 1,13); geen scherp stuk tussen dak en ruit, de lip steekt 0,05 m uit.
2. **Zeer sterk hellende voorruit (26 graden) die ver naar voren begint (basis z +1,06)** met lange lage motorkap (kap loopt van y 0,97 aan de cowl naar 0,65 aan de neus). Geometrie: ruitvlak als vlak tussen (z 1,06; y 0,97) en (z 0,30; y 1,34) met breedte 1,52 onderaan en 1,12 bovenaan, en een kapkrommen op de hartlijn.
3. **Lage gordellijn bij hoge glasgeometrie en sterke tumblehome**: gordel y 0,93 tot 0,98 bij een totale hoogte van 1,445 geeft raamhoogte 0,38 tot 0,42 m; flank halve breedte 0,905 (schouder) -> 0,81 (gordel) -> 0,59 (dakrand). Geometrie: doorsnede met schouder, naar binnen helling van de ruiten (ca. 26 graden), gordellijn niet horizontaal maar licht oplopend naar achteren (0,925 bij z +0,67 tot 0,976 bij z -1,15).
4. **Drie zijruiten met vast achterste kwartsruitje en zwarte, achteroverhellende B-stijl**, chroomrand om alle ruiten. Geometrie: B-stijl zwart vlak 0,10 (boven) tot 0,15 (onder) breed, ca. 12 graden gekanteld; kwartsruit als apart vlak (z -1,21 tot -0,91) gescheiden door een schuin stijltje; chroom randprofiel (smalle ring, 0,008 breed) om de DLO.
5. **Smalle, achterwaarts zwaaiende koplampen met zwart mask** die 0,5 m terug langs het scherm lopen (z 1,81 tot 2,30), bovenrand doorlopend in de scherm- en kaplijn, plus de **Renault-ruit op de neusrand** en een smalle bovengrille. Geometrie: koplampvlak als gebogen schaal volgens de schermoppervlakte (offset 0,004 naar buiten), niet als blok; zwarte mask als strook eromheen (0,015 breed); bovengrille als zwarte sleuf (0,60 breed, 0,04 hoog).
6. **Brede, lage onderste inlaat met chroom U-rand en de mistlampbehuizingen met chroom wenkbrauw**, kenteken op een zwart vlak bovenin. Geometrie: onderste inlaat (x +/-0,55, y 0,28 tot 0,46) als verdiept vlak (0,03 diep) met mesh-patroon; chroom U-profiel ervoor; mistlampbehuizingen (x +/-0,59, y 0,37) als verdiepte rechthoeken met een chroombalk (0,18 x 0,012) erboven.
7. **Achterlichten over de klepnaad verdeeld, LED-uitstraling, rond de hoek**. Geometrie: lamp als twee delen met een naad op x +/-0,50; buitendeel als gebogen wig die de staartvlakbocht volgt (z -2,30 tot -1,98), binnendeel op de klep (x 0,34 tot 0,50); rood glas met helder segment; bovenrand y 1,00, onderrand 0,70.
8. **Brede, gespierde heupen en aflopend staartvlak**: bovenaanzicht neus en staart zijn een bolvorm (halve breedte 0,90 -> 0,32 in de laatste 0,15 m aan de voorkant, 0,88 -> 0,29 in de laatste 0,6 m achter). Geometrie: plan-halve-breedte met de tabel uit sectie 2 (niet de huidige `HW`); doorsnede met bolling in de flank (1,6 cm) en een achter-heupboog bij de achterwielboog.
9. **Krap passende wielbogen met flens en grote 10-spaaks wielen**: boogstraal 0,37 om de wielas (bandstraal 0,33) met een dunne flensboog r = 0,43; wiel nagenoeg gevuld. Geometrie: boog als cirkel r = 0,37 afgekapt op y = 0,245; ring-lip (0,04 breed) rond de boog; velg 10 taps toelopende spaken.
10. **Lange alu/chroom zijlijsten, zilveren dorpelstrip en de naad van de achterdeur die om de achterwielboog naar voren zwaait.** Geometrie: dubbele strip (0,07 totaal hoog, 0,008 uitsteek) op y 0,51 tot 0,58 over beide portieren, onderbroken bij de deurnaad; dorpelstrip y 0,21 tot 0,24, z -0,95 tot +0,85; achterdeurnaad als polylijn (-1,27; 0,97) -> (-1,26; 0,88) -> (-1,11; 0,66) -> (-0,92; 0,41) -> (-0,67; 0,30).

---

## Bronnen (URLs)

- Renault UK brochure Laguna, april 2011 (fase 2): https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2011-UK.pdf
- Renault Frankrijk brochure Laguna, 2008 (fase 1): https://autocatalogarchive.com/wp-content/uploads/2019/04/Renault-Laguna-2008-FR.pdf
- Automoli, Laguna III fase II: https://www.automoli.com/us/vehicles/renault/laguna/laguna-iii-phase-ii-4236
- autoevolution, Laguna Estate facelift: https://www.autoevolution.com/cars/renault-laguna-estate-2010.html
- Carsguide, Laguna dimensies 2011: https://www.carsguide.com.au/renault/laguna/car-dimensions/2011
- the-blueprints, lijntekening hatch: https://www.the-blueprints.com/blueprints/cars/renault/23281/view/renault_laguna_iii_2008/ en vector met maten: https://www.the-blueprints.com/vectordrawings/show/renault-laguna-hatch/
- Autozine, Laguna fase 2: https://www.autozine.nl/renault/laguna/nieuws/renault-onthult-laguna-fase-2
- Planète Renault Laguna 3 Coupé (Initiale: bi-xenon, voorradar): https://www.planeterenault.com/1-gamme/1694-anciennes/4935-laguna-3-coupe
- forumlaguna3, Initiale Paris Estate: https://www.forumlaguna3.com/t7717-sarti-laguna-iii-3-estate-2-0-dci-175-bva-initiale-paris-4control
- forumlaguna3, Mille Miles: https://www.forumlaguna3.com/t2711-recherche-jantes-mille-miles
- renault-laguna.com collectie 2013: https://www.renault-laguna.com/renault-tarifs-et-%C3%A9quipements-de-laguna-collection-2013
- auto-infos.fr collectie 2013: https://www.auto-infos.fr/article/renault-laguna-2013-tarifs-gammes-et-equipements.194249
- carross.eu kleurcodes: https://www.carross.eu/fr/peinture-renault-laguna-m2638
- 50 nuances de teintes Renault: https://www.50nuancesdeteintesrenault.fr/teintes-par-mod%C3%A8les/berlines/laguna-iii-2007-2015
- eBay Celsium 7,5x18 ET47: https://www.ebay.fr/itm/318494502413
- Wikimedia Commons (foto's, fase 2 hatchback achter): `File:Renault Laguna 142709.jpg`, `File:Renault Laguna III 092424.jpg`, `File:Renault Laguna (51133710886).jpg`

## Open punten

1. Overhangs: project 0,980/0,959, fabriek 1,014/0,925, beelden ca. 0,92/0,84. Onopgelost.
2. Standaard wielmaat en wieldesign voor NL Initiale Paris 2011 (17 of 18 inch): niet bevestigd; eigenaar kan bandmaat nakijken.
3. Aantal en positie uitlaatpunten van de 2.0T 170 fase 2: niet gevonden.
4. Positie "Initiale Paris" badge fase 2 en knipperlichtherhaler: niet gevonden.
5. Onderrand klep: 0,55 (tekening) of 0,711 (laaddrempel): onopgelost, 0,62 aanbevolen.

# Gebruikbaarheidsaudit explosietekening Laguna III (Nederlands)

Gemeten op src/ (bouw via tools/harness.py), desktop 1280x800 en telefoon 390x844 (touch, schaal 2), lichte en donkere modus. Screenshots in shots/. Statussen: gemeten = met scripts/*.py; code = uit src/ afgeleid.

## U01 [high] Presets
- Waar: dock #presets, src/head.html (.presets, #dock right:calc(var(--panel-w)+32px)), src/app2.js presets
- Probleem: Op desktop 1280x800 zijn 4 van de 11 presets onzichtbaar: Onderstel en remmen, Interieur, Röntgen en Alles uit elkaar. De chiprij is afgekapt midden in een chip, zonder fade, pijl of scrollbalk.
- Bewijs: Chips beslaan x=16..1350 px, de dock is 880 px breed (scrollWidth 1366 vs clientWidth 880). Zichtbaar zonder scrollen: 7 chips. Verticaal wielscrollen op de rij geeft scrollLeft=0; alleen horizontaal scrollen of Tab werkt. Alle chips passen pas vanaf ca. 1770 px viewportbreedte. Shots d_00_start.png, d_p_everything.png.
- Suggestie: Presets in een eigen, gegroepeerd menu of tweeregelig raster (wrap) laten zien; of een Presets-knop met popover; minimaal fade-rand plus pijlknoppen; wiel omzetten naar horizontaal scrollen.

## U02 [high] Klik-doorduiken
- Waar: src/app2.js tapNode(), pathFrom()
- Probleem: Een klik op een onderdeel klapt niet dat onderdeel uit maar de eerste nog ingeklapte voorouder: klik op de motorkap laat de hele auto uit elkaar vallen. Dat schendt de eis 'als je een onderdeel aanklikt moet dat uitklappen'.
- Bewijs: Gemeten: klik op Motorkap -> exploded=['Renault Laguna III'] (1 groep, 8 hoofdgroepen), selectie blijft 'Renault Laguna III'. Hovertekst bij de kap: 'Renault Laguna III · klik om uit te klappen' (d_hover_bonnet.png).
- Suggestie: Klik op onderdeel P: klap alle voorouders in één keer uit tot en met de directe ouder van P (animatie gestaffeld), selecteer en markeer P, camera naar P. Hovertekst: 'Motorkap (in Carrosserie) · klik om te tonen'.

## U03 [high] Klik-doorduiken
- Waar: vanaf gemonteerd naar Klepspie 1 (diepte 6)
- Probleem: Alleen met klikken op het 3D-model zijn er minimaal 7 acties nodig (6 uitklappen: auto, Aandrijflijn, Motor F4Rt, Cilinderkop, Kleppen inlaatzijde, Inlaatklep 1a; daarna 1 selecteren). In de praktijk 8 klikken op desktop, en een naïeve gebruiker verspilt klikken door occlusie.
- Bewijs: Desktop-simulatie met een slimme klikker: 8 klikken (selName: Renault Laguna III, Aandrijflijn, Motor F4Rt, Cilinderkop, Kleppen inlaatzijde, Inlaatklep 1a, Klepstoter, Klepspie 1). Eerste naïeve run: 14 klikken en nog niet bij Klepspie; klikken 6-11 op hetzelfde punt deden niets omdat 'Cilinderkop (gietstuk)' voor de kleppen zit (selectie bleef Cilinderkop (gietstuk), exploded 5 -> 5). Alleen 1 van de 8 stappen is voorspelbaar via de hovertekst.
- Suggestie: Directe duik (zie U02) maakt het 1-3 klikken. Bied ook 'Toon dit onderdeel' vanuit zoeken (zie U17).

## U04 [high] Klik-doorduiken (touch)
- Waar: src/head.html .lbl pointer-events:auto, updateLabels()
- Probleem: Op telefoon (390x844) lukt de duik naar Klepspie 1 met tikken op het model niet: de labels liggen op de middelpunten van de onderdelen en onderscheppen de tik, en de onderdelen zelf zijn ~10 CSS-px groot.
- Bewijs: Simulatie 390x844 touch: na 7 tikken tikt het mikpunt van Klepspie 1 (198,192) 5 keer achter elkaar op label 5 'Veerschotel' (selName=Veerschotel, geen voortgang). Klepspie-wigjes in m_klepspie.png zijn ca. 12x14 px. Tikdoel chip 38 px hoog, seg-knoppen 33 px, panelknoppen 32 px, boomrij 28 px, kruimelpad 21 px hoog (richtlijn 44 px).
- Suggestie: Labels als primaire tikdoelen met leader-lijn naar het onderdeel, labels niet over het onderdeel leggen; tikgebied van kleine onderdelen vergroten (onzichtbare hit-bol met minimale straal ~22 px); tikdoelen 44 px.

## U05 [high] Inklappen
- Waar: src/app2.js doCollapse(), mode 'collapse', contextmenu handler
- Probleem: Inklappen is slecht vindbaar en onvoorspelbaar. Je moet eerst naar modus 'Inklappen' schakelen (of rechtsklikken, alleen desktop; er is geen lang indrukken of dubbeltik op touch). Een klik klapt de diepste uitgeklapte voorouder van het geraakte onderdeel in, dus het effect hangt af van waar je klikt.
- Bewijs: Vanuit 'Motor tot op de bout' (41 uitgeklapte groepen) in Inklappen-modus: klik 1 op Inlaatspruitstuk 41->40, klik 2 op Cilinderblok 40->39, klik 3 op Cilinderblok 39->0 (hele motor klapt dicht omdat de ouder nu de diepste is). Rechtsklik op Motorafdekkap: 41->0. Escape selecteert alleen de root, klapt niet in. Snelle routes bestaan wel maar liggen verstopt: chip Gemonteerd (1 klik), Weergave > Alles inklappen (2 klikken desktop; op telefoon: paneel openen, tab, knop = 3 tikken).
- Suggestie: Eén vaste 'Terug / een niveau inklappen' knop in de dock (undo-stapel), tik op lege achtergrond = laatste niveau inklappen, dubbeltik/lang indrukken op onderdeel = zijn groep inklappen, Escape = eenstap terug. Zichtbare hint in de hint-balk.

## U06 [medium] Inklappen
- Waar: src/app2.js MODE, .seg
- Probleem: De tikmodus (Uitklappen/Inklappen/Info) is een verborgen toestand: wie Inklappen heeft gekozen en vergeet terug te schakelen, krijgt bij klikken alleen selectie. Er is geen modusindicator op het model of op de cursor.
- Bewijs: In d_car_front.png/d_car_side.png staat modus Inklappen nog actief na een test; klikken op de ingeklapte auto selecteert dan alleen. Tikken in Inklappen-modus op een niet-uitgeklapt onderdeel doet visueel niets behalve selectie.
- Suggestie: Modusloos ontwerp (zie U05) of automatisch terug naar Uitklappen na één inklap-actie; cursor/hover tonen het actieve gedrag.

## U07 [high] Presets
- Waar: src/app2.js PRESETS (11 stuks), src/head.html #presets
- Probleem: Presets zijn één platte rij zonder groepering en zonder samenhangend schema. Ze dekken geen enkel van de systemen Koeling en luchtinlaat, Uitlaat, Brandstof of Elektrisch, en 'Motor F4Rt' klapt één niveau uit terwijl 'Cilinderkop' en 'Automaat' tot op de bout uitklappen (inconsistente naamgeving).
- Bewijs: Lijst: Gemonteerd, Hoofdgroepen, Carrosserie, Motor F4Rt, Motor tot op de bout, Cilinderkop, Automaat, Onderstel en remmen, Interieur, Röntgen, Alles uit elkaar. Exploded-tellingen na preset: engine 1, engineAll 41, head 23, gearbox 14, chassis 3, interior 2, everything 128.
- Suggestie: Groepeer: Niveau (Gemonteerd / Hoofdgroepen / Alles), Systemen (alle 8 hoofdgroepen), Deelsystemen (Cilinderkop, Automaat, Distributie, Turbo, Remmen, Vooras...), Weergave (Röntgen, Kleur per systeem). Elke chip met suffix 'niveau 1 / tot op de bout'.

## U08 [high] Presets / globale besturing
- Waar: src/head.html #spread, #btnExplodeAll
- Probleem: Er is geen globale uitklap-diepte-regelaar. 'Spreiding' (40-220 %) wijzigt alleen afstanden, niet hoeveel niveaus open zijn, en zit op het derde tabblad (Weergave), op telefoon pas na het openen van het paneel. 'Alles uitklappen' is alles-of-niets.
- Bewijs: Boomdiepte 0..6 (histogram diepte: 1, 8, 74, 257, 314, 155, 184 knopen; 128 groepen). Geen controle 'toon tot niveau n'. Spreiding-slider zit in m_view.png onder de vouw van het paneel; slider 'change' herframet de camera.
- Suggestie: Niveauschuif 0-6 (of stappenknoppen +/-) in de dock, werkend op de huidige context (alles of geïsoleerde groep), plus aparte spreidingsschuif. Opslaan als preset 'Niveau n'.

## U09 [medium] Presets / overgangen
- Waar: src/app2.js isolate(), PRESETS.run
- Probleem: Presets verbergen de rest van de auto onmiddellijk (mesh.visible) terwijl alleen uitklappen en camera animeren. Er is geen fade of vertraging, en daarna is er in het scherm geen aanwijzing dat de rest verborgen is behalve een knop 'Alles tonen' in het paneel.
- Bewijs: Code: isolate() zet visible direct; collapseAll + isolate + setTarget in één synchrone run. Staggering is 0,32 s per niveau voor explodeAllUnder, zodat 'Alles uit elkaar' (diepte 6) tot ca. 1,6 + 0,85 = 2,5 s duurt terwijl de camera na 0,95 s al op het eindkader staat (Aannemelijk, uit code; niet frame voor frame gemeten).
- Suggestie: Verborgen delen 0,3 s laten wegfaden of 8 % ghosten; toon een 'Geïsoleerd: Motor F4Rt  [Alles tonen]' badge in beeld.

## U10 [low] Presets / kadrering
- Waar: alle 11 presets, desktop en telefoon
- Probleem: Kadrering van presets werkt over het algemeen goed, maar 'Alles uit elkaar' gebruikt maar 61 % van de breedte en 54 % van de hoogte van het vrije vlak.
- Bewijs: Gemeten bbox in px (vrij vlak 880x696 desktop): everything [151,190,690,566] = 539x376; engineAll 458x515; head [283,93,592,663] (boven 93 px, onder dock 696). Alle presets liggen binnen het vrije vlak op beide formaten.
- Suggestie: Padding voor 'Alles uit elkaar' verkleinen (1.0 -> 0.9) of camera dichter; geen actie nodig voor de overige.

## U11 [high] Labels
- Waar: src/app2.js updateLabels()
- Probleem: Labels zijn gemaximeerd op 26 (desktop) en 12 (telefoon) en tonen alleen de kinderen van de laatst uitgeklapte groep. Bij presets met veel groepen blijven de meeste onderdelen zonder naam, zonder aanwijzing dat labels zijn weggelaten.
- Bewijs: Preset 'Alles uit elkaar': 8 labels voor 128 groepen (d_p_everything.png); 'Motor tot op de bout': 12 labels voor 41 groepen; Cilinderkop heeft 47 kinderen, 14 labels (d_dark_view_head.png). Motorblok heeft 30 kinderen.
- Suggestie: Toon '+33 meer' chip; label-LOD op schermgrootte; bij hover alle namen tonen; lijst in paneel koppelen aan nummers.

## U12 [medium] Labels
- Waar: src/app2.js updateLabels(), .lbl
- Probleem: Labels zijn vrij zwevende pillen op het middelpunt van een onderdeel, zonder leiderlijn; bij verschuiving (tot 2 rijen omhoog of omlaag) horen ze niet meer bij hun onderdeel en bedekken ze de geometrie die je wilt zien.
- Bewijs: m_klepspie.png: label 'Veerschotel' (5) hangt boven een leeg stuk, 'Klepspie 1' (6) naast het tafereel; d_p_engineAll.png: 'Smering' en 'Koelcircuit motor' zweven op onderdelen. Geen overlappende labels gemeten (overlaps=0 in alle 22 presetmetingen), dus de onderlinge plaatsing is wel schoon.
- Suggestie: Leiderlijn (1 px lijn) van label naar onderdeelanker, label buiten het silhouet plaatsen.

## U13 [medium] Labels
- Waar: src/app2.js regel num = ctx.kids.indexOf(k)+1
- Probleem: Nummering is niet doorlopend: nummers volgen de index in de volledige kinderlijst, terwijl maar een deel wordt getoond, dus er ontstaan gaten.
- Bewijs: d_dark_view_head.png toont 41, 43, 45, 44, 3, 4, 7, 8 (Bobine 1/2/3 als 41/43/45, Bougie 3 als 44) en 6, 1, 2. Het paneel 'Bestaat uit' kapt af op 60 kinderen zonder melding (slice(0,60)).
- Suggestie: Nummers vast en consistent met de lijst in het paneel, of gewoon geen nummers; meldt '+n meer' bij afkappen.

## U14 [medium] Labels (mobiel)
- Waar: src/head.html .lbl max-width:42vw
- Probleem: Lange namen worden afgekapt met ellips of lopen over de rand van het scherm op telefoon.
- Bewijs: m_dark_gearbox.png: 'Koppelingen en remmen' wordt 'Koppelingen en remme'; m_p_engineAll.png: 'Turbo en uitlaatspruitstuk' loopt tegen de rechterrand (x tot 380 van 390).
- Suggestie: Twee regels toestaan of afkorten in het label, hele naam in de tooltip/paneel.

## U15 [medium] Labels / hover
- Waar: src/app2.js tag (hover) en pointermove
- Probleem: De hovertekst blijft staan na een klik met oude inhoud terwijl de camera wegvliegt: 'Renault Laguna III · klik om uit te klappen' hangt over de nieuwe labels. Het door de eigenaar genoemde 'oude label linksboven' kon ik niet als vast element reproduceren (geen zichtbaar .lbl bij laden of presets); de stale hovertag is de enige kandidaat.
- Bewijs: d_01_click1.png: na klik 1 (auto uitgeklapt) staat de tag nog op (258,430) over label 'Onderstel'. De tag werkt alleen bij pointermove met 70 ms throttle, dus nooit na een klik of camerabeweging. Gemeten hover aanwezig=['Renault Laguna III · klik om uit te klappen'].
- Suggestie: Tag verbergen of herberekenen bij pointerdown, camerabeweging en veranderde toestand.

## U16 [medium] Begrijpelijkheid
- Waar: src/app2.js pointermove, hideHint()
- Probleem: De hovertekst bestaat alleen op desktop met muis; op touch is er geen voorvertoning wat uitklapt. De startaanwijzing verdwijnt bij de eerste pointerdown (ook een draaigebaar) of na 9 s en noemt inklappen en modi niet.
- Bewijs: Code: 'if e.pointerType !== mouse return'; setTimeout(hideHint, 9000); hint: 'Tik op de auto om hem laag voor laag uit elkaar te halen'. Hover noemt de te openen groep alleen in modus Uitklappen.
- Suggestie: Eerste tik op touch markeert (highlight de groep die zal uitklappen met naam), tweede tik klapt uit; of toon na elke actie een toast 'Motor F4Rt uitgeklapt, 12 delen · [Terug]'.

## U17 [medium] Zoeken / boom
- Waar: #treeSearch, #tab-tree, #btnParts
- Probleem: De snelste route naar een diep onderdeel (zoeken in de onderdelenboom, reveal() klapt voorouders uit en focust) zit verstopt: op desktop een tabblad rechts, op telefoon achter een icoonknop en paneel openen.
- Bewijs: Zoeken 'klepspie' toont 32 treffers; reveal klapt direct de hele keten uit. Dubbele namen: 130 namen komen meer dan eens voor ('Inlaatklep', 'Klepveer'), pad in grijs onder de naam helpt maar staat 34 px ingesprongen. Tikdoel boomrij 28 px, schakelaar 22x26 px.
- Suggestie: Zoekveld permanent in de dock/bovenbalk, resultaat met pad en miniatuur; 'Toon in model' als primaire knop.

## U18 [medium] Camera
- Waar: src/app2.js doExplode(), focusNodes()
- Probleem: Elke klik herkadreert de camera naar de nieuw uitgeklapte groep. Het volgende doelwit verschuift daardoor bij elke stap en de gebruiker moet steeds opnieuw richten.
- Bewijs: Gemeten schermpositie van de doelketen tijdens de duik naar Klepspie 1 (desktop): (384,294), (444,264), (348,564), (204,264), (444,114), (444,192) - sprongen van 120-300 px per klik. Camerazoom eindigt op ca. 8 px onderdeel (m_klepspie.png).
- Suggestie: Camera alleen herkaderen als doelgroep (deels) buiten beeld valt; zachte, kleinere bewegingen; behoud oriëntatie.

## U19 [medium] Context / rommel
- Waar: src/app2.js doExplode (geen isolate)
- Probleem: Bij het duiken blijft de rest van de auto zichtbaar. Het gietstuk van de Cilinderkop, de distributieriem, de inlaatkast en kabels staan voor of naast de kleppen en maken het beeld onrustig; het occludeert doelen.
- Bewijs: d_02_klepspie.png: kettingwiel links en donkere inlaatkast rechts voor het beeld, kabel boven; klikken 6-11 in de eerste simulatie vielen weg op het gietstuk. Selectie-highlight werkt niet voor uitgeklapte groepen (applyMats: showHl alleen als geen asm of niet target).
- Suggestie: Bij duiken de rest automatisch dimmen/ghosten (maar blijven kunnen klikken op terugkeer) en de aangeklikte groep highlighten.

## U20 [medium] Paneel desktop
- Waar: src/head.html .sel-actions, #tab-info
- Probleem: Paneelacties zijn vier knoppen die op twee regels vallen ('In beeld' alleen op de tweede). 'Uitklappen' blijft grijs voor een leaf zonder uitleg, en 'Alles hieronder uit' is dubbelzinnig.
- Bewijs: d_02_klepspie.png en d_p_engineAll.png: knoppen wrappen; de beschrijving staat pas ca. 245 px onder de bovenrand. Het paneel is 368 px breed en neemt 29 % van 1280 px.
- Suggestie: Knoppen als icoon-toolbar met tooltips, labels 'Alles onder dit onderdeel uitklappen', uitleg bij disabled (tooltip).

## U21 [medium] Telefoon / indeling
- Waar: #sheet peek, #dock, #topbar
- Probleem: Op telefoon krijgt het 3D-beeld te weinig ruimte: bovenbalk 102 px, dock 100 px, paneel-peek 165 px. De gemonteerde auto is 320x169 px op een scherm van 390x844.
- Bewijs: dock top = 577 px van 844 (68 %). Subtitel wrapt op drie regels ('F4Rt 2.0 / Turbo 170 pk') (m_p_assembled.png). Het peek-paneel toont geen beschrijving van het gekozen onderdeel; die zit achter de 64 %-open stand die de dock verbergt.
- Suggestie: Topbar verkleinen, dock inklapbaar maken, half-open paneelstand (40 %), liggende telefoon testen.

## U22 [medium] Telefoon / presets
- Waar: #presets
- Probleem: Op telefoon zijn slechts 3 van 11 presets (Gemonteerd, Hoofdgroepen, Carrosserie) volledig zichtbaar; de rest vereist veegscrollen zonder visuele hint.
- Bewijs: Chip 83-170 px breed, 390 px scherm; 'M' van Motor net zichtbaar (m_p_assembled.png). Chips 38 px hoog.
- Suggestie: Presets in bottom-sheet-menu (raster 2 kolommen) met zoekbare namen; volgorde: eerst de meest gebruikte.

## U23 [low] Telefoon / paneel
- Waar: #sheet[data-state=open]
- Probleem: Met het paneel open is de dock verborgen, dus je kunt geen modus of preset wisselen terwijl je de onderdelenlijst gebruikt, en het paneel bedekt 64 % van het scherm waardoor de effecten van reveal() niet zichtbaar zijn.
- Bewijs: CSS: #sheet[data-state=open]~#dock{display:none}; m_tree.png laat het model in de bovenste 36 % zien.
- Suggestie: Boomselectie in het open paneel toont direct een mini-voorbeeld of klapt het paneel half dicht na reveal().

## U24 [medium] Donkere modus
- Waar: tokens --bg #11161b, body gradient; MeshStandardMaterial zwart/donkergrijs
- Probleem: In donkere modus verdwijnen donkere onderdelen (motorblok, inlaatkast, bedrading, interieurbekleding) tegen de achtergrond en is het grid nauwelijks zichtbaar; witte carrosseriepanelen blinken uit.
- Bewijs: d_dark_view_head.png, d_dark_everything.png, m_dark_gearbox.png: grid-lijnen rgba .06-.13 op #07090c, zwarte delen zijn vrijwel onzichtbaar. Paneel, chips en labels zelf zijn goed leesbaar.
- Suggestie: Lichtere donkere achtergrond (#1e2630), randlicht/outline op onderdelen of 'Kleuren per systeem' standaard in donker.

## U25 [high] Visueel: auto
- Waar: src/body.js, bodyparts.js (geometrie)
- Probleem: De auto leest nauwelijks als Laguna III hatchback: het profiel is een lange fastback/sedan met afgesneden staart, geen duidelijke D-stijl en liftbackklep, de neus heeft geen Renault-ruit en geen grille, en er zijn zichtbare artefacten.
- Bewijs: d_car_side.png: laag aflopend dak dat in de achterbumper uitloopt, witte rechthoek als B-stijl/deurartefact, wielkasten te groot; d_car_front.png: hobbelige motorkap, gele stipjes als koplampen, grote 'smile'-bumper met gele kentekenplaat; d_00_start.png: gerafelde/dambord-achtige rand bij linkervoorscherm; d_car_rear.png: achterruit en bumper plausibel, staartlichten rood aanwezig.
- Suggestie: Silhouet corrigeren (maten: 4695x1811x1445, wielbasis 2756; kenmerkende schuine D-stijl met hoge staart), koplampen met LED-dagrij-lijn, Renault-ruit, grille, glasoppervlakken met zwakke reflectie. Zorg dat panelen sluiten (naden zonder gaten).

## U26 [medium] Visueel: uitgeklapte auto
- Waar: preset Alles uit elkaar
- Probleem: 'Alles uit elkaar' oogt als een diagonale wolk waarin de details te klein zijn om te lezen en de hoofdsystemen niet te onderscheiden zijn; kleurcodering per systeem staat standaard uit en zit in Weergave.
- Bewijs: d_p_everything.png: motor- en onderstelonderdelen zijn spikkels van 3-8 px; alleen 8 labels. Legenda alleen na de schakelaar 'Kleuren per systeem'.
- Suggestie: Standaard systeemkleur in 'Alles uit elkaar'/'Hoofdgroepen', ook alle groepen met naam bij hover, en laat de gebruiker kiezen welk systeem te vergroten.

## U27 [medium] Visueel: motor
- Waar: preset Motor tot op de bout
- Probleem: De motor tot op de bout is een verticale pilaar van gestapelde groepen; de dwarsligging is niet te zien, de cilinderkop-subdelen zijn pas leesbaar na verdere inzoom. Subgroepen zijn niet benoemd.
- Bewijs: d_p_engineAll.png (458x515 px, 41 groepen, 12 labels); in 'Motor F4Rt' (12 groepen) is de leesbaarheid goed. Verticale spreiding hoogtes: Motorafdekkap bovenaan, Krukmechanisme onderaan.
- Suggestie: Houd de in de auto geldende oriëntatie (dwars) in een tweede 'Inbouwpositie' preset; label per subgroep bij inzoom; cilinderkop als eigen duik-preset (bestaat al).

## U28 [low] Visueel: automaat
- Waar: preset Automaat
- Probleem: De automaat is goed leesbaar (13 groepen, labels zonder overlap), al hangen labels als 'Keuzeas met hendel' en 'Standensensor' op lege plekken boven het huis.
- Bewijs: d_p_gearbox.png, m_dark_gearbox.png; overlaps=0.
- Suggestie: Leiderlijnen (zie U12).

## U29 [low] Toetsenbord
- Waar: #stage tabIndex=-1, keydown Escape
- Probleem: Het 3D-model is niet met het toetsenbord te bedienen; Escape selecteert alleen de root. Chipfocus scrolt wel in beeld (scrollLeft 486 na focus op 'Alles uit elkaar').
- Bewijs: Gemeten: canvas.tabIndex=-1. Labels zijn echte knoppen (goed).
- Suggestie: Pijltjestoetsen: ouder/kind/broer in de boom, Enter = uitklappen, Backspace = inklappen.

## U30 [low] Beginstaat
- Waar: src/app2.js start
- Probleem: Bij het laden is geen preset gemarkeerd, terwijl de toestand 'Gemonteerd' is; pas na een klik lichtgeel.
- Bewijs: d_00_start.png: alle chips wit; m_p_assembled.png: Gemonteerd actief na klik.
- Suggestie: Bij laden preset 'Gemonteerd' als pressed markeren.

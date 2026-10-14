# Ontwerp en architectuur

Dit document beschrijft hoe de pagina is opgebouwd, welke afspraken de delen met elkaar hebben en waarom de bediening zo werkt. Waar een getal pas na de laatste samenvoeging bekend is, staat een open plaatsmarkering die de orkestrator invult.

## Uitgangspunten

- Eén zelfstandig HTML-bestand, publiceerbaar als artefact. Alleen three.js (r147, UMD-build) van jsDelivr en lettertypes van Google Fonts komen van buiten.
- Alle geometrie wordt in code opgebouwd. Er zijn geen 3D-bestanden of afbeeldingen.
- Elk onderdeel is een knoop in één boom. Uitklappen werkt per groep, zodat je zo diep kunt gaan als je wilt.
- Een klik op een onderdeel doet wat de zin in de opdracht zegt: het klapt uit. Zie "Klikregel" hieronder.
- Werkt op desktop en telefoon, in licht en donker thema.
- Elke domeineigenaar bouwt in een eigen bronbestand. De delen kennen elkaar alleen via namen (ankers), vaste getallen en een kleine set gedeelde symbolen.

## Coördinaten

Alle maten zijn in meter.

### Autoframe

- x is links (+) en rechts (−), y omhoog vanaf de grond, z naar voren (+). De neus ligt op z = +2,35 (`ZF`), de staart op z = −2,35 (`ZR`).
- Vooras op z = 1,365 (`AXF`), achteras op z = −1,391 (`AXR`), wielbasis 2756 mm, lengte 4695 mm. Wielmiddelpunt `AY` = 0,33.
- Halve spoorbreedte voor `TRACK_F` = 0,7785 en achter `TRACK_R` = 0,756. Wielboogstraal `ARCH` = 0,385.
- Breedte zonder spiegels tot |x| = 0,915, spiegels tot |x| = 1,035 (de tool `integrity.py` bewaakt dat).

### Motorframe

- Oorsprong op de krukas-as. +x loopt langs de krukas naar de vliegwiel- en versnellingsbakzijde (links in de auto), +y langs de cilinders omhoog, +z naar de inlaatzijde (naar de voorkant van de auto).
- Renault telt cilinder, hoofdlager en kruktap 1 vanaf de vliegwielzijde. Cilinder 1 staat dus op +x.
- De automaat deelt dit frame (aandrijflijnframe).

### Aandrijflijn in de auto

De aandrijflijn staat dwars en iets achterover gekanteld: `auto = PT_POS + Rx(PT_TILT) · motor`, met `PT_POS` = (−0,13, 0,40, 1,50) en `PT_TILT` = −0,18 rad. In getallen: auto-x = motor-x − 0,13; auto-y = 0,40 + 0,9838·y + 0,179·z; auto-z = 1,50 − 0,179·y + 0,9838·z. In code gebruik je de hulpfuncties uit `drivetrain.js` (`fromPT`, `toPT`, `ENG2CAR`, matrix `PTM`) en reken je niet met de hand om.

## Bronbestanden en bouwvolgorde

`build.py` plakt de bestanden uit `src/` in de volgorde van `ORDER` aan elkaar tot één script. Ze delen dus één globale naamruimte; wat eerder staat, kan wat later staat niet missen, en `const` en `let` moeten voor gebruik gedeclareerd zijn. `head.html` komt als opmaak voor het script. Het bouwen stopt bij dubbele functienamen op het hoogste niveau, dubbele materiaalnamen in `std()` en `phys()` en bij een syntaxfout (`node --check`).

| Nr | Bestand | Inhoud |
|---|---|---|
| 0 | `head.html` | Titel, lettertypes, CSS (designtokens voor licht en donker, touch-stijlregels), opbouw van paneel, dock, menu's, hulpvenster en bovenbalk. |
| 1 | `core.js` | Renderer, scène, belichting, materialen, geometriehulpen (lathe, extrusie, tandwielen, veren, buizen, schoepen, en sinds de carrosserieronde `notchRect` en `roundPlate`, zie onder), geometriecache en de bouwstenen `A()` (groep) en `P()` (onderdeel). |
| 2 | `body.js` | Parametrisch carrosserieoppervlak: halve breedte, onder-, schouder- en daklijn als vloeiende krommen langs z, doorsnede met afgeronde hoeken, tumblehome. Exporteert `HW`, `YB`, `YT`, `YR`, `surfX`, `skin`. |
| 3 | `bodyparts.js` | Panelen uit dat oppervlak gesneden: portieren, schermen, motorkap, achterklep, bumpers, ruiten, verlichting, spiegels, wissers, sierlijsten; `Carrosseriekooi` met onder meer de `Torpedoplaat`. |
| 4 | `engine1.js` | Motormaten en `ENG_PORTS`, motorblok, krukmechanisme, cilinderkop met nokkenassen en kleppen, ontsteking, faseversteller. |
| 5 | `engine2.js` | Distributie, hulpaandrijving (multiriem), inlaat en injectie, turbo met spruitstuk, smering, koelcircuit. |
| 6 | `engine3.js` | Dynamo, aircocompressor, sensoren, kabelboom, flexplaat, afdekkap. |
| 7 | `drivetrain.js` | Automaat (koppelomvormer, pomp, schakelelementen, planetaire sets, tussenas, differentieel, klepblok), startmotor, aandrijfassen, motorsteunen; `PT_POS`, `PT_TILT`, `GB_X`, `DRV_PORTS`. |
| 8 | `chassis.js` | Vooras met McPherson-veerpoten, stuurinrichting, torsieas achter, wielen, remmen, remsysteem met parkeerrem. |
| 9 | `interior.js` | Dashboard, middenconsole, stoelen, gordels, bekleding, pedalen, binnenspiegel. |
| 10 | `systems.js` | Koeling en luchtinlaat, uitlaat, brandstof, elektra, en `buildCar()`, dat alles samenvoegt. |
| 11 | `app1.js` | Boom doorlopen, uitklapvectoren berekenen, animatie, zichtbaarheid en materialen, camera-inpassing, vloer, stap-terug-geschiedenis. |
| 12 | `presets.js` | De presets als gegevens plus één toepassingsmotor en de rondleiding. |
| 13 | `app2.js` | Selectie, paneel, onderdelenboom, aanwijzen en tikken, toetsenbord, labels, formaat, thema, beeldkwaliteit, renderlus, en `window.__laguna` voor de tests. |

Namen van functies en constanten, materialen en cache-sleutels krijgen een voorvoegsel van hun eigenaar (`eng`, `bod`, `chs`, `ui`, `app`), zodat bestanden elkaar niet stil overschrijven.

Twee geometriehulpen in `src/core.js` zijn nieuw sinds de carrosserieronde:

- `notchRect(u0, u1, v0, v1, cut)` geeft de omtrek van een rechthoek in het vlak u-v (hoekpunten tegen de klok in) met inkepingen: elke `[kant, u, v]` in `cut` haalt aan die kant (+1 of −1) het stuk onder v en voorbij u weg. Zo krijgt een zitkussen of een vloerplaat een inkeping bij een wielkast.
- `roundPlate(poly, t, b, ri, seg)` extrudeert zo'n rechthoekige omtrek met dikte `t` (gecentreerd) uit één stuk, met rondom afgeronde randen van straal `b`. Holle hoeken van de omtrek krijgen straal `ri`. Er zijn geen naden zoals bij losse blokken en de normalen zijn glad met een knik boven 30 graden. De achterbank (zitkussen en rugleuning, in `src/interior.js`) en de kofferbakvloer (`bodBootPlate` in `src/bodyparts.js`) gebruiken het.

## Knoop-API

Een knoop is `{ id, name, d, spec, obj, kids, parent, asm, ... }`. Bouw knopen met twee functies uit `core.js`; dit contract is vast.

```js
A(naam, opties, kinderen)           // groep (THREE.Group); kinderen mogen geneste arrays zijn, lege waarden vallen weg
P(naam, geometrie, materiaal, opties) // onderdeel (THREE.Mesh)
```

| Optie | Betekenis |
|---|---|
| `d` | Verplicht. Nederlandse beschrijving van één of twee zinnen: wat het is en wat het doet. Is de opbouw schematisch of niet voor deze auto geverifieerd, dan staat dat erin. |
| `spec` | Lijst `[[label, waarde], ...]` met alleen geverifieerde feiten, in Nederlandse notatie ("82,7 mm"). |
| `p`, `r`, `q`, `s` | Positie `[x,y,z]`, Euler-hoeken `[rx,ry,rz]`, quaternion en schaal `[sx,sy,sz]` in het frame van de ouder. Negatieve x-schaal spiegelt (alle materialen zijn dubbelzijdig). |
| `ex` | Uitklapvector `[dx,dy,dz]` in het frame van de ouder, in meter bij spreiding 100 %. Zonder `ex` rekent de app er een uit: de richting van het midden van de ouder naar het midden van het kind, met een afstand die schaalt met de groottes. |
| `exs` | Schaalfactor op die berekende afstand (standaard 1). |
| `inner` | `true` voor een groep of onderdeel dat volledig verborgen zit in de andere delen van zijn ouder zolang die ouder dicht is (zuigers in het blok, kleppen in de kop, planetaire sets in het huis, remzuigers in de klauw, ruitenmechanisme in het portier). De app tekent een `inner`-knop met zijn deelboom niet zolang de ouder dicht is. Nooit zetten op iets dat van buiten te zien is in de gemonteerde stand. |

Ankernamen (zie "Ankers") moeten precies één keer in de boom voorkomen.

## Uitklaplogica

De regel, per kind van een groep:

```
positie(kind) = basis(kind) + ex(kind) · amt(ouder) · SPREAD
```

- `basis` is de gemonteerde positie in het frame van de ouder, `amt` de animatiewaarde van de ouder tussen 0 en 1 en `SPREAD` de spreiding (40 tot 220 %, standaard 100 %).
- De kinderen van een groep bewegen alleen als die groep zelf uitklapt. Een gesloten groep beweegt als één stijf geheel mee met de explosie van zijn ouder. Omdat de regel per niveau stapelt, gaan diepere lagen vanzelf mee.
- Alleen het ankeronderdeel van een groep (waar de rest op gemonteerd is, zoals het motorblok) mag een uitklapvector nul houden.
- Uitklapvectoren liggen langs de montage-as, met afstanden evenredig met de grootte van het onderdeel. Niets vliegt door de scène of in de ruimte van een ander systeem.

## Klikregel

Dit is de belangrijkste ontwerpkeuze van versie 2 en ze komt rechtstreeks uit de premortem (zie [premortem.md](premortem.md)).

In versie 1 opende een klik de buitenste nog dichte groep op het pad naar het aangeklikte onderdeel. Tik je op de motorkap, dan viel de auto in acht hoofdgroepen uiteen en de motorkap zelf bleef dicht. De opdracht zegt: "als je een onderdeel aanklikt moet dat uitklappen". Het criterium in het eerste plan ("een groep die het onderdeel bevat klapt uit") was ook voor versie 1 waar, dus alle testen hadden groen kunnen zijn terwijl de gebruiker de klacht opnieuw had gekregen. De premortem oordeelde dat een fatale fout.

De regel nu, in de standaardmodus `Onderdeel`:

1. Klik op onderdeel P met eigen groep G (de directe ouder). Is G dicht, dan klapt alleen G ter plekke uit. De rest van de auto beweegt niet, ook niet als de ouders van G dicht zijn.
2. Is G al open, dan wordt P geselecteerd en een stukje uitgelicht.
3. De weg naar buiten of naar binnen loopt via aparte gebaren: `Groter geheel` (knop) en Enter klappen de eerstvolgende dichte groep erboven uit; dubbelklik duikt naar P (alle groepen erboven open, laag voor laag, met de pick van de eerste klik); rechtsklik, Shift+klik of lang drukken klappen de diepste open groep in.
4. De gelaagde explosie van buiten naar binnen zit in de schuif `Explosie`, in `Demonteren` en in de presets. De modus `Laag voor laag` houdt het gedrag van versie 1 beschikbaar.

De keuze heeft een bijwerking die bewust is aanvaard: een onderdeel dat onder een dichte groep zit (de motor onder de kap) is niet met klikken van buitenaf bereikbaar zonder eerst die groep te openen. De schuif, de presets, de labels en de onderdelenboom dekken dat.

Tests: [testen.md](testen.md), controle 1 van `tools/itest.py` meet na een klik vanuit Gemonteerd op Motorkap, Portier linksvoor, Wiel linksvoor en Koplamp links hoeveel knopen buiten de eigen subboom meer dan 1 mm verschuiven (moet 0 zijn), en of een dubbeltik met 250 ms tussenpoos het onderdeel van de eerste tik kiest.

### Gebaren en tijdsbepaling

- Pointer-events met een drempel van 7 pixels voor slepen en 600 ms voor een klik; dubbelklik binnen 420 ms en 26 pixels; lang drukken na 500 ms, met een ring als terugkoppeling vanaf 150 ms.
- De pick (welk onderdeel is geraakt) wordt bij `pointerdown` bepaald en door de latere afhandeling hergebruikt. Zo valt een dubbeltik nooit op een bewegend beeld.
- Op een telefoon valt de tweede tik op een scherm waar al onderdelen bewegen. Daarom gebruikt de duik de pick van de eerste tik.
- Een tik op het canvas stuurt in de browser nog compatibele muisgebeurtenissen na (`mousedown`, `mouseup`, `click`). Die konden op een label vallen dat door de nieuwe selectie onder de vinger was geschoven en gaven dan een tweede actie. Daarom krijgt `touchend` op het canvas `preventDefault()`, en reageert een label alleen op een `click` die op dat label begon (de aanwijzer ging op dat label omlaag), of op een `click` zonder aanwijzer (toetsenbord, schermlezer). Dit is de oplossing van het itest-randgeval; zie [testen.md](testen.md), "Het itest-randgeval".
- Gebaren beslissen op `event.timeStamp` en niet op het moment waarop een handler draait (`src/app2.js`, `uiCommitPress` en de afhandeling van `pointerup`). Aanleiding was de ene itest-fout uit golf 1: een telefoontik die onder belasting als lang drukken werd gelezen. De timer die de ring toont en het lang drukken wapent, laat eerst wachtende invoer afhandelen (een animatieframe en een nul-timeout); komt er in die tijd een `pointerup` of `pointercancel` binnen, dan beslist die op zijn eigen tijdstempel. Resultaat: itest 78 van 78 na de samenvoeging van golf 2 en 79 van 79 op `6eca637`, zonder terugkerende telefoontikfout.

## Presets

Een preset is alleen gegevens in `src/presets.js`: `id`, `cat` (categorie), `label`, `key` (sneltoets), `note`, `iso` (alleen deze groepen tonen), `open` (precies deze groepen uitklappen), `deep` (met hun hele deelboom), `pull` (hele groep verschuiven), `xray`, `sys`, `spread`, `cam` (richting en marge), `select`, `labels` en `frame`. Zes categorieën: Overzicht, Motor, Aandrijving, Onderstel, Carrosserie, Interieur. Aantal presets: 37, waarvan de rondleiding er een is: Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3. Na golf 1 waren het er 31; de herstelronde van golf 2 voegde Stuurpomp, Koeling en luchtinlaat, Uitlaatsysteem, Accu, Stuurinrichting en Parkeerrem toe.

- Een preset verwijst naar groepen met hun naam. `checkPresets()` (bereikbaar als `__laguna.checkPresets`) controleert dat elke naam precies één keer bestaat, dat `open`, `deep`, `select` en `labels` onder de `iso`-groep liggen (bevatting), dat id's en sneltoetsen uniek zijn en dat de rondleiding bestaande presets noemt. Een preset waarvan een naam niet oplost, verschijnt niet in de menu's. `tools/integrity.py` faalt op elke presetfout.
- Toepassen gaat in fasen: eerst klapt dicht wat dicht moet (diepste eerst), dan beweegt de camera naar de eindkadrering terwijl open gaat wat open moet (ondiepste eerst). Alles samen duurt hoogstens 2,5 seconden. Groepen die in de eindstand verborgen zijn, springen direct dicht.
- Elke preset is bereikbaar met twee klikken (categorie, item). Sneltoetsen 0 tot 9 gaan naar de tien belangrijkste.
- De rondleiding speelt een vaste lijst presets af met een bijschrift per stap.
- Wie een groep hernoemt die een preset gebruikt, moet de preset aanpassen. De namen die presets nu gebruiken, staan in `tools/anchors.json` en in het contract.

## Ankers

`tools/anchors.json` bevat de namen die precies één keer in de boom moeten voorkomen, per domein (carrosserie, interieur, motor, aandrijflijn, onderstel, systemen), plus:

- `root_children_order`: de wortel `Renault Laguna III` heeft precies acht kinderen in vaste volgorde: Carrosserie, Interieur, Aandrijflijn, Onderstel, Koeling en luchtinlaat, Uitlaatsysteem, Brandstofsysteem, Elektrisch systeem.
- `onderstel_children`: Vooras en stuurinrichting, Achteras, Wielen, Remsysteem.
- `contains`: paren (ouder, nakomeling) die in de boom onder elkaar moeten hangen.
- `content`: per anker een minimum aantal knopen dat op een patroon past (bijvoorbeeld dat `Krukmechanisme` vier zuigergroepen bevat). Dit vangt een anker met de juiste naam op de verkeerde plek of met de verkeerde inhoud.

`buildCar()` in `systems.js` zet de uitklapvectoren van de acht hoofdgroepen en van de vier kinderen van Onderstel. Alle andere uitklapvectoren zijn van de eigenaar van de groep.

## Labels

Labels zijn genummerde bijschriften met een leiderlijn. Ze verschijnen bij de kinderen van de laatst uitgeklapte groep, de grootste eerst. Een label ankert op het gelabelde deel zelf en niet op het midden van het kader van de groep, want dat midden lag bij 52 van de 345 ankers in de lucht en bij 175 op het eigen deel. De ankers worden over meerdere frames opgebouwd, zodat het openen van een zware groep geen groot frame kost, met een terugval op het eerste zichtbare deel. Nu liggen over alle 36 presets 261 van de 345 ankers op het eigen deel en 0 in de lucht; de overige 84 liggen ook op het eigen deel maar afhankelijk van de camera achter een ander deel. Een klik op een label werkt alleen als de aanwijzer op dat label begon, ook bij een lange muisdruk, zodat een label na een tik op het canvas geen tweede actie geeft. Elk label zoekt een vrije plek (eerst op het onderdeel, dan erboven of eronder, in kandidaten) en wordt weggelaten als er geen ruimte is. Zo vallen ze niet over elkaar, niet over de bediening en niet buiten het vrije beeld. De indeling alloceert niets per frame en schrijft alleen naar de DOM als er iets verandert. Een test controleert dit in zes standen (`tools/itest.py`, controle 8).

## Camera

`fitBox` berekent de afstand waarop alle hoekpunten van de verwachte eindbox (na de animatie) binnen het vrije beeld vallen. Het paneel en de dock worden als marge meegenomen via `setViewOffset`, zodat het model in het zichtbare deel gecentreerd staat. `focusNodes` kadreert een lijst knopen; `freeView()` geeft het vrije beeld terug.

## Verbergen van ingesloten delen (`inner`)

Een knoop met `inner: true` en een dichte ouder wordt niet getekend en niet aangeklikt (`uiInnerHidden`): `ouder.target === 0`, `ouder.amt < 1e-4` en de ouder ligt binnen de isolatie. Zodra de ouder gaat openen, is het deel direct zichtbaar. Röntgen toont alles. Isoleer je het ingesloten deel zelf, dan verbergt niets het. De doorsteekcontrole van `integrity.py` draait met alle onderdelen zichtbaar.

Dit is de belangrijkste maatregel tegen een te hoog aantal tekenopdrachten in de gemonteerde stand. De risico's zijn een ten onrechte verborgen onderdeel (een gat in de auto) en een vlag op iets dat van buiten te zien is. `tools/ui_inner.py` controleert vanuit 200 richtingen, op de hele auto en op elke hoofdgroep geïsoleerd, of een `inner`-knop de eerste treffer van buitenaf is. Op de eindstand zijn er 253 ingesloten knopen en 0 eerste treffers op een ingesloten onderdeel (39.200 stralen op de hele auto, 20.000 per hoofdgroep). Direct na de samenvoeging van golf 2 waren het er nog 52; de eigenaren hebben ze hersteld of de vlag weggehaald. In de carrosserieronde is de opbergbak in de middenconsole niet meer als ingesloten gemarkeerd, omdat hij door de zijruit te zien is.

## Prestaties

- Geometrie wordt gecachet via `cache(sleutel, bouwfunctie)`. De sleutel moet alle parameters bevatten die de vorm bepalen. In `core.js` doen `G.box`, `G.rbox`, `G.cyl`, `G.half`, `G.torus`, `G.sphere`, `hexBolt`, `spring`, `gear`, `ringGear` en `annulus` dat. De sleutel van `torus` bevatte eerst de buisstraal niet, `ringGear` de voetstraal niet en `annulus` het aantal segmenten niet; dat is hersteld (audit C24).
- In testmodus (`window.__LAGUNA_CACHECHECK`, door `tools/harness.py` gezet) bouwt `cache()` bij hergebruik de geometrie opnieuw en meldt een botsing als consolefout: dezelfde sleutel voor andere vorm. Een gemuteerde proef (een geplante botsing) wordt gevangen.
- Sleutels voor eigen geometrie beginnen met het voorvoegsel van de eigenaar. `build.py --lint` controleert dat niet; het is een afspraak in het contract en de botsingscontrole in testmodus vangt de gevolgen. De lint is hiervoor niet uitgebreid.
- Tekenopdrachten: de gemonteerde auto moet onder 1.500 blijven (grens uit de premortem, tripwire 5). Na golf 1 waren het er 1.052 met 1.459 onderdelen. Op de eindstand (2.435 onderdelen) zijn het er 1.726 zonder en 390 met gebundeld renderen. De grens van 1.500 houdt dus alleen met bundelen stand. Volledig uitgeklapt: grens 3.000 tekenopdrachten en 700.000 driehoeken; `smoke.py` mat bij een volledig uitgeklapte auto 1.517 tekenopdrachten in één weergave (415.047 driehoeken in beeld), en de hele boom telt 630.368 driehoeken.
- Gebundeld renderen van gesloten groepen: een groep waarvan het hele deel is gemonteerd, wordt met één samengevoegde mesh per materiaal getekend in plaats van met elk onderdeel apart. De losse meshes blijven in de scène voor aanwijzen, labels en de lijst. Een groep die gaat openen, bewegen of oplichten schakelt in hetzelfde frame terug. Het staat standaard aan; de schakelaar `Gesloten groepen samenvoegen` in Weergave zet het uit. Tekenopdrachten in Gemonteerd: 1.726 zonder, 390 met bundelen.
  - Werking (`src/app1.js`): voor elke weergave kiest `uiBatchSync` per tak de hoogste geschikte groep met een klare batch (minstens twee onderdelen en hoogstens 60.000 driehoeken; grotere groepen worden over hun kinderen verdeeld) en wisselt waar nodig in hetzelfde frame. Onderdelen onder een ingesloten knoop doen niet mee. Een batch krijgt per basismateriaal een samengevoegde mesh; de materialen volgen Röntgen en de systeemkleuren, en de diepte-sortering van doorzichtige vlakken blijft gelijk.
  - Opbouw: lui, in de vrije tijd van het frame (3 ms tijdens een animatie, 10 ms in rust, 25 ms in de eerste 8 seconden). Tests die gebundelde aantallen meten roepen eerst `__laguna.batchFlush()` aan.
  - Geheugen: de batches mogen samen 1,25 maal de geometriebytes van alle meshes gebruiken (45,3 MB op de eindstand, 24,2 MB in gebruik). Past een nieuwe batch niet, dan worden de langst ongebruikte batches vrijgegeven die nu niet getekend worden; past hij dan nog niet, dan blijft die groep los getekend.
  - Aanwijzen: de losse meshes van een gebundelde groep staan op THREE-laag 1 (`UI_HIDE_LAYER`). De camera tekent die laag niet; de raycaster van de app doet `layers.enableAll()` en raakt ze dus wel. Elke eigen `THREE.Raycaster` in een testscript moet dat ook doen; `integrity.py`, `silhouette.py` en `ui_inner.py` doen het.
  - Stand op de eindstand (`__laguna.batchStats()`): 41 groepen gebouwd en getekend, 318 batchmeshes, 1.654 losse meshes vervangen.
- Adaptieve kwaliteit: bij gemiddeld meer dan 40 ms per frame over 20 frames tijdens een animatie schakelt de pagina één keer naar pixelratio 1 en lakglans uit, met een melding in Weergave en de schuif `Volle kwaliteit`. Tijdens grote animaties zakt de pixelratio tijdelijk naar driekwart.
- Er wordt alleen gerenderd als er iets beweegt of verandert. Geen backdrop-blur: vervagen van het WebGL-canvas kostte volgens een meting 60 beelden per seconde naar 1,5.
- Materialen worden vooraf gecompileerd, in kleine stukjes na de eerste weergave, zodat de eerste keer aanwijzen of selecteren niet hapert.
- Frametijd: `__laguna.profileFrames('Motor F4Rt', 120)` meet de JavaScript-tijd per animatieframe zonder `finishAll()` (explosie-update en labelindeling, zonder `render`). Grens: p95 hoogstens 8 ms. Dit is JavaScript-tijd, geen GPU-tijd.
- Aantallen driehoeken: eerste versie 424.000, versie 1 na optimalisatie circa 280.000. Na golf 1: 419.554. Eindstand (gemeten op `9c731c8`): 630.368 (Aandrijflijn 237.310, Carrosserie 165.546, Onderstel 110.204, Interieur 70.328, Koeling en luchtinlaat 18.700, Uitlaatsysteem 13.184, Brandstofsysteem 7.608, Elektrisch systeem 7.488). Het totaal blijft binnen het budget van 700.000. De Aandrijflijn zat na golf 2 boven het eigen budget van 240.000 (250.794) en is in de carrosserieronde met lichtere klepgroepen, zuigerringen, kleine veren, poelies en stator teruggebracht tot 237.310; de grote veren en de keerring van de klepsteel zijn na review weer rond gemaakt.
- Opstarttijden: `__laguna.timing()` geeft de tijdlijn van het opstarten in milliseconden sinds het begin van de navigatie (`script`, `buildStart`, `buildCar`, `startUp`, `render0`, `firstFrame`, `interactive`, `ready`, `batches`, plus `batchesDone`). De duur van `buildCar()` is `buildCar` min `buildStart`. Op de eindstand (`9c731c8`, software-rendering, één meting uit `stats.json`): script 482, buildStart 688, buildCar 854 (dus 166 ms), startUp 1.608, render0 1.840, firstFrame 3.508, interactive 3.514, ready 5.574, batches 6.828. `ready` wacht hoogstens 2 seconden op de batches van de beginstand. Deze tijden zeggen niets over een echt apparaat.

## Contracten tussen de eigenaars

De delen bouwen parallel en kennen elkaar alleen via de volgende afspraken. Wie een waarde wijzigt, meldt dat.

### Gedeelde carrosseriefuncties (`body.js`)

| Symbool | Betekenis |
|---|---|
| `ZF`, `ZR` | Bumperpunten voor en achter (z = +2,35 en −2,35). |
| `AXF`, `AXR`, `AY` | Vooras, achteras, wielmiddelpunt. |
| `TRACK_F`, `TRACK_R`, `ARCH` | Halve spoor voor en achter, wielboogstraal rond beide assen. |
| `HW(z)` | Halve breedte in bovenaanzicht: plateau 0,893 van −1,2 tot 1,2; neus 0,33 bij +2,30; staart 0,50 bij −2,30. |
| `YB(z)` | Onderkant van de carrosserie. |
| `YT(z)` | Schouderlijn, gelijk aan de raamlijn in de cabine; achter z < −2,268 de hoogte van de bumperrichel (0,635). |
| `YR(z)` | Daklijn op de hartlijn, geldig van `SP` (−2,11) tot `WS0` (1,06): (−2,11; 1,13), (−1,17; 1,37), (−0,43; 1,447 piek), (0,3; 1,346), (1,06; 0,975). De binnenkant van het dak ligt ongeveer 2 cm lager. |
| `surfX(z, y)` | Buitenhuid in x op hoogte y. Boven `YT` in het kasbereik geeft hij de halve breedte van ruit, stijl of dak; boven dek of dak 0. |
| `skin(z, y, s, out)` | Punt op de huid. |

Het interieur, de motor, de systemen en het onderstel leiden hun raakvlakken met de carrosserie af uit deze functies in plaats van uit vaste getallen.

### Kapprofiel

Eén tabel voor de motorkap, vastgelegd vóór de carrosserie- en motorronde omdat het eerste contract en het gemeten silhouet elkaar tegenspraken (binnenkant kap minimaal 0,93 over z 1,10 tot 1,80, terwijl de buitenkant op de hartlijn 0,885 is bij z = 1,845).

| z (m) | Buitenkant kap op de hartlijn | Hoogste punt van onderdelen bij x = 0 | Bij \|x\| = 0,6 |
|---|---|---|---|
| 1,06 (voet voorruit) | 0,97 | 0,93 | 0,89 |
| 1,35 | 0,97 | 0,93 | 0,89 |
| 1,60 | 0,93 | 0,89 | 0,85 |
| 1,85 | 0,885 | 0,845 | 0,80 |
| 2,10 | 0,81 | 0,77 | 0,72 |

`tools/integrity.py` faalt als een onderdeel buiten de carrosserie minder dan 2,5 cm onder de buitenhuid van de motorkap blijft, minder dan 0,5 cm onder de laagste laag van de motorkap (binnenframe of isolatiemat) blijft, of boven de carrosserie uitsteekt. Dezelfde controle toetst de lengte van de carrosserie (binnen ZR tot ZF met 6 mm marge) en de breedte (hoogstens 0,915 zonder spiegels, spiegels hoogstens 1,035).

### Aansluitpunten van de motor (`ENG_PORTS`, motorframe)

Elke poort is `{ p, dir }`; `portAt(poort, afstand)` geeft een punt op die afstand langs de richting.

| Poort | Plaats p | Richting | Gebruiker |
|---|---|---|---|
| `turbineOut` | (−0,017, 0,14, −0,255) | (−1, 0, 0) | uitlaat |
| `compIn` | (0,17, 0,14, −0,255) | (1, 0, 0) | luchtfilterslang |
| `compOut` | (0,125, 0,218, −0,291) | (0, 1, 0) | warme intercoolerslang |
| `throttleIn` | (−0,262, 0,14, 0,21) | (−1, 0, 0) | koude intercoolerslang |
| `thermostatOut` | (0,252, 0,358, 0,04) | (0, 1, 0) | koelslang boven |
| `waterPumpIn` | (−0,155, 0, 0,158) | (0, 0, 1) | koelslang onder |
| `fuelRailIn` | (0,205, 0,306, 0,165) | (0, −1, 0) | brandstofleiding |
| `psOut` | (−0,262, −0,07, 0,275) | (0, −1, 0) | drukslang stuurbekrachtiging |
| `psIn` | (−0,30, −0,005, 0,32) | (0, 0, 1) | aanzuigslang van het reservoir |

De waarden van de eerste zeven zijn die van golf 1. De stuurpomp (golf 2) voegt `psOut` en `psIn` toe; de waarden in de tabel zijn de definitieve, afgeleid van `ENG_PS` = (−0,27, −0,005, 0,255) in `engine1.js`. De pomp zit als groep op de multiriem, met de poelie in het multiriemvlak, en de riemloop gaat langs drie verbruikers. De positie van de pomp en de routes van de slangen zijn schematisch. Het onderstel gebruikt ze met een terugvalwaarde (`ENG_PORTS.psOut || { ... }`), zodat de bouw niet breekt als de poort ontbreekt.

### Aansluitpunten van de aandrijflijn (`DRV_PORTS`)

`DRV_PORTS.starterTerminal` (motorframe, in golf 1 [GB_X + 0,12, −0,035, 0,205]) is de plusaansluiting van de startmotor; de kabel in `systems.js` volgt die verwijzing. Definitieve waarde na golf 2: de startmotor zet hem na het bouwen op het plusklemmetje, (0,3905, 0,0145, 0,177) in het motorframe (GB_X = 0,235).

### Gereserveerde ruimte

| Zone | Wat | Eigenaar |
|---|---|---|
| Zone P (motorframe: x −0,36 tot −0,205, y −0,07 tot 0,06, z 0,19 tot 0,32) | Stuurpomp met poelie in het multiriemvlak (x −0,345). Niemand anders plaatst hier iets; 1 cm marge. | motor |
| Gang onder `psOut` (x −0,30 tot −0,24, y −0,26 tot −0,06, z 0,235 tot 0,32) | Drukslang van de stuurbekrachtiging. | onderstel |
| Multiriemvlak (motor-x −0,3575 tot −0,3325, z 0,15 tot 0,25) | De koude intercoolerslang draait binnen ongeveer 5 cm na de gasklepflens weg, vóór motor-x −0,31, en loopt om zone P heen. | systemen |
| Rechter motorsteun | `Motorsteun distributiezijde` blijft vrij van de dynamo: voorvlak op motor-z hoogstens 0,105, of boven motor-y 0,41. | aandrijving |

Eindwaarden: de stuurpomp zit binnen zone P (`ENG_PS`, poelie met tipstraal 0,058); `psOut` en `psIn` staan in de tabel hierboven; de startmotoras ligt op (y −0,040, z 0,147) met de solenoïde ernaast op (0,046, 0,030). De motorsteunbouten zijn in de herstelronde op het geklemde vlak gezet (F11). `integrity.py` meldt op de eindstand 0 fouten; de zone-afspraken zelf worden niet apart getoetst.

## Ontwikkelgeschiedenis

1. Versie 1 (12 oktober 2026): specificaties onderzocht, eerste opbouw van het model en de bediening (865 onderdelen), geen consolefouten. Daarna verbeterd op feedback dat de auto niet op een Laguna leek: lagere gordellijn, afgeronde neus en staart, karakterlijn, grotere verlichting, donkerder glas. Bediening aangescherpt (markering alleen op het geselecteerde deel, labels zonder overlap). Gepubliceerd; die versie staat in `docs/v1/index.html`.
2. Onderzoek en audit (13 oktober): nieuw onderzoek per domein (motor F4Rt, exterieur, automaat, onderstel en interieur) en een audit van de bestaande pagina. Het onderzoek liet zien dat de automaat een Jatco JF613E is en geen Aisin, dat het model de remmen, de ABS-ring en de stuurbekrachtiging niet goed had, en dat de motor kopstoters had waar de F4R rolzwenkarmen heeft. De beslissingen bij tegenstrijdige bronnen staan in [specificaties-en-bronnen.md](specificaties-en-bronnen.md).
3. Plan versie 2 en premortem: het verbeterplan is getoetst met een premortem, die het eerste plan als fatale fout beoordeelde (klikregel en motorkapregel). Het plan is herzien (zie [premortem.md](premortem.md)): enkele klik klapt de eigen groep uit, kapprofiel per z-station, doorsteekcontrole, silhouettoets, publicatierooktest, hard tijdkader.
4. Golf 1 (13 oktober, samengevoegd rond 11:30 UTC): de app (klikregel, modi, schuif, presets, labels, `inner`-verbergen), de carrosserie (nieuw oppervlak naar het gemeten silhouet, 385 onderdelen) en de motor (680 onderdelen, rolzwenkarmen, twin-scroll turbo). Stand: 1.762 knopen, 1.052 tekenopdrachten gemonteerd, silhouettoets 46 van 46 stations binnen tolerantie.
5. Golf 2 (13 oktober, vanaf 14:15 UTC): onderstel, interieur, aandrijving en systemen, elk in een eigen worktree tegen de nieuwe carrosserie en motor, plus de stuurpomp en een app-integratieronde (gebaren op `event.timeStamp`, gebundeld renderen, controle van `inner`). Zes agents tegelijk op vier CPU's. Resultaat: samengevoegd om 15:10 UTC op 2.882 knopen, 2.397 onderdelen, 597.792 driehoeken, 350 tekenopdrachten met bundelen (1.548 zonder), itest met poorten 78 van 78, integrity met 1 fout (Motorkapsteun raakte de dynamo) en 52 van buitenaf zichtbare `inner`-knopen. `__laguna.ready` duurde 19,4 s tegen een grens van 20 s; daarom wacht `ready` sindsdien hoogstens 2 s op de batches.
6. Golf 3: samenvoegen, volledige testset, herstel per eigenaar (hoogstens twee ronden), documentatie, nieuwe screenshots, `pubsmoke.py` groen, publicatie op dezelfde URL en de URL terugkijken. Resultaat: een codereview (zoeken en toetsen apart) en de integratietests gaven bevindingen per eigenaar, die de herstelronde heeft verwerkt (onder meer motorkapsteun langs de frontmodule, langsliggers 1,5 cm naar buiten, geen dubbele UCH of naafmoer, opgetild onderdeel valt terug bij de schuif, rondleidingsbalk op de telefoon, startmotor en koppelomvormer klappen niet in dezelfde ruimte uit, demperring, zonnewiel en oliezeef vrij). De eerste visuele poort op de samengevoegde stand van golf 2 las de screenshots steeds opnieuw, leverde na 1 uur 40 niets op en is gestopt. Een tweede, begrensde poort keurde 50 galerijbeelden van de build `8095a3e` in drie plakken, elk beeld één keer. De orkestrator heeft elke melding nagekeken in de screenshots van de presets zelf: twee blokkers vervielen (dashboard en motorruimte van boven waren camerahoeken van de galerij). Een korte visuele herstelronde (vier eigenaren, elk in een eigen worktree) loste op: accuhouder boven het deksel, uitlaatpijpen bij de demper, startmotor langs de ankeras, kleppen vrij onder de kop, stator als plaatpakket met wikkelkoppen, en de presets Dynamo en startmotor, Portier linksvoor en Rem linksvoor, plus kleinere labels op smalle schermen. Het exterieur haalt S7 niet (3 van 9 kenmerken volledig); zie [premortem.md](premortem.md), struikeldraad 3. Eindstand op `d6d0456` (`index.html` in `60909fe`): 2.881 knopen, 485 groepen, 2.396 onderdelen, diepte 8, 604.972 driehoeken; `build.py --lint` ok; smoke zonder consolefouten; integrity 0 fouten, 0 ankerfouten, 0 presetfouten en 126 waarschuwingen; silhouet 46 van 46 stations binnen tolerantie; `ui_inner.py` 0 zichtbare ingesloten knopen; `pubsmoke.py` OK; itest met poorten: 78 van 79 (één randgeval bij de willekeurige tikken op de telefoon, in twee runs gelijk; zie [testen.md](testen.md)). Publicatie: versie 3 op dezelfde URL; de teruggelezen pagina bevat `index.html` byte voor byte.
7. Carrosserieronde (vertrekpunt: `handomdraai.md` op `ecc3c57`, 13 oktober avond; in de commitberichten heet ze "golf 3", net als de fase hierboven). Vier carrosserierondes met visuele poorten, daarnaast app, motor en onderbouw, en de meldingen van de gebruiker over de onderkant. Eindstand van de code `ff42dbd`, `index.html` gebouwd in `5b6cefa`, de testset liep op `9c731c8`.
   - Carrosserie, ronde 1 en 2 (eerste stap door twee agents parallel, daarna twee herstelrondes na code review en poort): slanke horizontale achterlichten over de klepnaad, ronde staart, spoilerlip, kentekenplaat in een echte uitsparing, derde remlicht achter de achterruit, donker glas met chroomomlijsting, chromen smile en wenkbrauwen, spiegels in lakkleur, een sierlijst per portier, B-stijl als twee hoogglans zwarte afdekkingen, motorkap tot de voorruit. Beslissingen en redenen: [onderzoek/beslissingen.md](onderzoek/beslissingen.md).
   - Carrosserie, ronde 3 en 4: chroom dat op galerijformaat als chroom leest (bolle raamomlijsting, gordellijst, nieuw chroommateriaal), kwartsruit met een schuin zwart stijltje, achterruit verder om de dakrailronding, echte luchtinlaat met lamellen, ronde mistlampen, spoilerlip van 3,6 cm.
   - App: de oplossing van het itest-randgeval (`touchend` met `preventDefault()` en label-klik alleen als de aanwijzer op het label begon), labelankers op het gelabelde deel zelf en opgebouwd over frames, de preset Stuurpomp vanaf de andere kant.
   - Motor: de Aandrijflijn van 250.794 naar 237.310 driehoeken (budget 240.000), met lichtere klepgroepen, zuigerringen, kleine veren, poelies en stator.
   - Onderbouw: einddemper plat en donker onder de vloer, parkeerremunit naar x 0,28 en z −1,40, en drie gemelde contacten (accuhouderstang, vulpijp, remslang achter) nagemeten en opgelost.
   - Meldingen van de gebruiker (telefoon, auto van onderen bekeken): een zwarte streep door het wiel (portierrubber door de achterwielboog, commit `9c731c8`), een raar achterwiel (spaken te diep verzonken, `f10fd54`), een los hangende uitlaat (`c22312d`, later de eindstukken in `ff42dbd`) en bij het nalopen het zicht op het interieur door de wielbogen en van onderen (gesloten wielkasten, vloer tot de wielkast en een achterbank om de wielkasten, `9c731c8`). Elke melding is eerst met stralen en schermafbeeldingen nagerekend.
   - Resultaat: 2.924 knopen, 489 groepen, 2.435 onderdelen, 630.368 driehoeken, 390 tekenopdrachten gemonteerd met bundelen (1.726 zonder), itest met poorten 79 van 79, poort 5 haalt S7 met 7 van 9. Details in [testen.md](testen.md) en [premortem.md](premortem.md). Versie 4 en versie 5 staan op dezelfde URL.

## Bewuste keuzes

- Geen merklogo's, typebadges of exacte kopie van het carrosseriedesign; het model volgt wel de hoofdmaten en het gemeten silhouet. De Renault-ruit op de neus is daarom niet getekend.
- Kentekenplaten zonder kenteken.
- Eén bouwbestand per domein en een contract met namen, in plaats van één groot bestand: agents kunnen parallel werken en samenvoegen is bijna vrij van conflicten.
- Geen opvulling om een onderdelendoel te halen. Geen groep met meer dan 12 identieke onderdelen die in werkelijkheid niet zo vaak voorkomen.
- Lettertypes: Saira Condensed (koppen), Atkinson Hyperlegible (tekst), IBM Plex Mono (gegevens).
- Geen backdrop-blur boven het canvas en een eenvoudige schaduwvlek onder de auto in plaats van echte schaduwen, voor de framesnelheid op telefoons.
- Het model toont de standaardauto: geen 4Control, geen panoramadak (beide opties).
- Waar het onderzoek geen bron had, staat de opbouw als schematisch in de beschrijving en in [specificaties-en-bronnen.md](specificaties-en-bronnen.md).

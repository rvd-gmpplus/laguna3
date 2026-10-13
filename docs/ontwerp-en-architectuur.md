# Ontwerp en architectuur

## Uitgangspunten

- Eén zelfstandig HTML-bestand, publiceerbaar als artefact. Alleen three.js (r147, UMD-build) en Google Fonts komen van buiten.
- Alle geometrie wordt in code opgebouwd. Er zijn geen 3D-bestanden of afbeeldingen nodig.
- Elk onderdeel is een knoop in één boom. Uitklappen werkt per groep, zodat je zo diep kunt gaan als je wilt.
- Werkt op desktop en telefoon, in licht en donker thema.

## Coördinaten

- x is links (+) en rechts (−), y omhoog, z naar voren (+). Eenheid is meter.
- Vooras op z = 1,365, achteras op z = −1,391 (wielbasis 2756 mm). Lengte 4695 mm.
- De motor en automaat hebben een eigen frame: oorsprong op de krukas-as, x langs de krukas. Het hele aandrijflijnframe staat dwars in de auto met een lichte kanteling naar achteren.

## Bronbestanden

| Bestand | Inhoud |
|---|---|
| `head.html` | Titel, lettertypes, CSS (designtokens voor licht en donker), opbouw van paneel, dock en bovenbalk. |
| `core.js` | Renderer, scène, belichting, materialen, geometriehulpen (lathe, extrusie, tandwielen, veren, buizen), en de bouwstenen `A()` (groep) en `P()` (onderdeel). |
| `body.js` | Parametrische carrosserie: breedte, onder- en bovenrand en daklijn als vloeiende curven langs z, doorsnede met afgeronde hoeken, karakterlijn en schouder; voor- en achterkant als gebold vlak. |
| `bodyparts.js` | Panelen uit dat oppervlak gesneden: portieren, schermen, motorkap, achterklep, bumpers, ruiten, verlichting, spiegels, wissers, sierlijsten. |
| `engine1.js` | Motorblok, krukas, hoofdlagers, zuigergroepen, cilinderkop, nokkenassen, 16 klepgroepen, bougies, bobines. |
| `engine2.js` | Distributieriem, hulpaandrijving, inlaat en injectie, turbo met spruitstuk, smering, koelcircuit, sensoren, flexplaat. |
| `drivetrain.js` | Automaat (koppelomvormer, ATF-pomp, lamellenpakketten, planetaire sets, tussenas, differentieel, klepblok, startmotor), aandrijfassen, motorsteunen. |
| `chassis.js` | Vooras met McPherson-veerpoten, stuurinrichting met stuurwiel, torsieas achter, wielen, remmen, remsysteem met parkeerrem. |
| `interior.js` | Dashboard, middenconsole, stoelen, gordels, bekleding, pedalen, binnenspiegel. |
| `systems.js` | Koeling en luchtinlaat, uitlaat, brandstof, elektra, en `buildCar()` die alles samenvoegt. |
| `app1.js` | Boom doorlopen, uitklaprichtingen berekenen, animatie, zichtbaarheid en materialen, camera-inpassing, vloer. |
| `app2.js` | Selectie, paneel, onderdelenboom, presets, tikken en aanwijzen, labels, formaat, thema, renderlus. |

## Explosielogica

- Elke knoop heeft een uitklapvector `exv` in het frame van de oudergroep. Die is handmatig gezet (`ex`) of wordt berekend als richting van het midden van de oudergroep naar het midden van het kind, met een afstand die schaalt met de groottes.
- Een groep heeft een doelwaarde (0 of 1) en een animatiewaarde. Kinderen staan op `basis + exv × voortgang × spreiding`. Omdat dit per niveau stapelt, gaan diepere lagen mee met hun ouder.
- "Alles hieronder uit" zet alle groepen in een deelboom open met een vertraging per diepte, zodat het laag voor laag gebeurt. Inklappen gaat in omgekeerde volgorde.
- Tikken in uitklapmodus opent de buitenste nog dichte groep langs het pad van het aangeklikte onderdeel. Inklapmodus sluit de diepste open groep.

## Camera

`fitBox` berekent de afstand waarop alle hoekpunten van de verwachte eindbox (na de animatie) binnen het vrije beeld vallen. Het paneel en de dock worden als marge meegenomen via `setViewOffset`, zodat het model in het zichtbare deel gecentreerd staat.

## Labels

Labels verschijnen bij de kinderen van de laatst uitgeklapte groep, de grootste eerst. Elk label zoekt een vrije plek (eerst op het onderdeel, dan erboven of eronder) en wordt weggelaten als er geen ruimte is. Zo vallen ze niet over elkaar.

## Prestaties

- Geometrie wordt gecachet en hergebruikt waar mogelijk.
- Er wordt alleen gerenderd als er iets beweegt of verandert.
- Eerste versie had ruim 424.000 driehoeken; na optimalisatie van veren, afgeronde blokken en retourveren zo'n 280.000. Ongeveer 900 tekenopdrachten per frame.

## Ontwikkelgeschiedenis

1. Specificaties onderzocht (zie [specificaties-en-bronnen.md](specificaties-en-bronnen.md)).
2. Eerste opbouw van het volledige model en de bediening.
3. Test: geen consolefouten. Verbeterpunten: de hele auto lichtte geel op bij selectie van de wortel, labels overlapten, de motor-explosie was rommelig.
4. Feedback van de gebruiker dat de auto niet op een Laguna leek. Daarop: lagere gordellijn, afgeronde en schuin aflopende neus en staart, karakterlijn, wielboogranden, grotere koplampen en achterlichten, donkerder glas, nieuwe lak, ovale spiegels, grille en luchtinlaat die het bolle front volgen, spoilerlip.
5. Bediening verbeterd: markering alleen op het geselecteerde deel, labels zonder overlap, hint verdwijnt na de eerste interactie of na 9 seconden, motor-explosie in een plat vlak zodat hij van voren leesbaar is, nieuwe uitklaprichtingen voor de hoofdgroepen.
6. Opnieuw getest op desktop- en telefoonformaat en gepubliceerd.

## Bewuste keuzes

- Geen merklogo's of typebadges en geen exacte kopie van het carrosseriedesign; het model volgt wel de echte hoofdmaten.
- Kentekenplaten zonder kenteken.
- Lettertypes: Saira Condensed (koppen), Atkinson Hyperlegible (tekst), IBM Plex Mono (gegevens).

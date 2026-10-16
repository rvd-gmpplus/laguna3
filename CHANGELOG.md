# Versies

Elke gepubliceerde versie van `index.html`, met de bron (commit), de datum en wat er nieuw was. Vanaf versie 7 ook de
tijden van start, samenvoeging en publicatie per golf, zodat een volgende premortem met echte duren werkt. De versie
staat in de pagina zelf (`?` in de bovenbalk, en `__laguna.version`): het nummer uit `VERSION` plus een inhoudshash.

| Versie | Datum (UTC) | Bron | Wat |
|---|---|---|---|
| 1 | 12 oktober 2026 | `9164d0a` (bewaard als `docs/v1/index.html`) | Eerste model (865 onderdelen) en bediening. |
| 2 | 13 oktober, 17:00 | `8095a3e` | Golf 1 en 2: klikregel (een klik klapt de eigen groep uit), presets als bediening, nieuwe carrosserie naar het gemeten silhouet, motor, onderstel, interieur, aandrijving, systemen; 2.882 knopen. |
| 3 | 13 oktober, 17:37 | `60909fe` | Visuele herstelronde na golf 2. |
| 4 | 14 oktober | `9c03015` (bron `ec92a53`) | Carrosserieronde: herkenbaarheid (S7 gehaald met 7 van 9), labelankers op het eigen deel, het itest-randgeval opgelost. |
| 5 | 14 oktober, 00:02 | `5b6cefa` (bron `ff42dbd`) | Einduitlaten en de onderkant dicht. |
| 6 | 15 oktober, 02:10 | `31a8f0d` (bron `3ab6a8d`) | Golf 4: modus Openen (26 openers), panoramadak, onderdeelnummers in het paneel, kennis uit het rapport van de gebruiker en MR 415. |
| 7 | in voorbereiding | | Golf 5 (parallelle sessie, 15 oktober 19:10 tot 21:36): camera's van achterklep, motorkap en voorportieren, hoedenplank 33 graden, B-stijl met slotbeugel, voorruit van binnen doorzichtig, olievuldop aan een scharnierlip, U19 (rest dimmen bij duiken), zijkolom voor liggende telefoons, langsliggers boven de aandrijfassen, opkant boven de torsiebalk, 14 nummerkeuzes op het chassisnummer, ATF volgens MR 415, dakglas 0,92, geen 4Control. Golf 5a-1 (deze sessie, vanaf 15 oktober 23:10): vangnet (testomgeving, strikte testset met één exitcode, budgetpoort, ondergrensregel, ankers voor openers en presets), deelbare URL, debug-overlay, versie in de pagina, laadmeldingen, LICENSE (MIT). Herstelronde van de parallelle sessie (15 oktober 22:50 tot 16 oktober 00:12): achterklep met open glas en lijmrand, gasveren langs de zijwand, B-stijlafdekking boven de chroomband, spiegelcamera dichterbij; hemel onder het dakframe, dunne koordjes, laadvloer met voorstuk, lichte opbergbak, deksel met donkere onderkant (Dekselvoering), nieuwe interieurcamera's; zonneschermen van binnen in beeld (stop voor de cassette), donkere binnenlijst en lichte weerspiegeling op het dakglas, expansiedop scharniert aan de hals met zichtbare vulopening; telefoon staand met presetcategorieën in één schuivende rij (itest 16); hoedenplank uitgenomen zolang een rugleuning of de bagagevloer open is (`hideWhen`). Samengevoegd in `ccr-63d946bb-ng8q5l` op 16 oktober 01:20 UTC, met de ondergrenzen van 0,8 maal de hoek op spiegel, rugleuningen, middenarmsteun, armsteunkussen en expansiedop. |

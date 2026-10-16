# Onderdeelnummers: de canonieke gegevens

`tools/orkestratie/build_pn.py` bouwt hieruit `src/partnumbers.js` (het object `PN_DATA` in de pagina) en `docs/onderdeelnummers.csv`
(één rij per pad en nummer, met de eenheid, alle bronnen, variant, verpakking, regel, keuze en onderhoudsregels per rij; de kolommen
staan in `docs/onderdeelnummers-schema.md`).
`tools/pncheck.py` controleert dat die twee bestanden byte voor byte bij deze map horen, en met `--tree` dat `data/tree.json`
gelijk is aan de boom van de pagina. Het chassisnummer en het kenteken van de gebruiker staan nergens in deze gegevens; alleen
afgeleide feiten (bouwperiode, bak, emissieniveau) met hun grond.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `meta.json` | Voertuig, TecDoc-type, controledatum, de vaste toelichting in het paneel en de RDW-gegevens als afgeleid feit. |
| `units/<plak>.json` | Verkoopeenheden per onderzoeksplak van golf 4 (`pilot`, `S1-motor-service`, `S2-lucht-uitlaat-brandstof`, `S3a-vooras-aandrijving`, `S3b-achteras-remmen-wielen`, `S4-carrosserie-elektra-interieur`, `S5-panoramadak`). Sleutel `plak:ID`. Record: `n` (naam), `st` (`past`, `vin` of `nietgevonden`), `oe` (`[[Renault-nummer, opmerking, bewijs]]`), `am` (`[[merk, nummer, opmerking, bewijs]]`), `var` (variantentekst), `per` (verpakking), `note`, `src` (`[[url, host]]`), en `kz` bij een gekozen uitvoering voor de auto van de gebruiker (`o`, `a`, `v`, `b`, `z`, `g`, `s`). Bewijs A tot D zoals in het paneel. |
| `map.json` | Pad zonder wortel naar `[eenheid, relatie, regel]`; relatie `zelf`, `deel` of `set`; `regel` is de toelichting bij de koppeling (vaak leeg). Een pad dat niet in `map.json` staat, is in de pagina "niet onderzocht". |
| `info.json` | Pad naar onderhoudsregels `[[label, waarde, bron, zekerheid]]`: de kennisbasis uit het rapport van de gebruiker en het werkplaatshandboek MR 415. |
| `../tree.json` | Alle paden van de boom, uit de pagina (`__model.ALL`). Ververs met `python3 tools/pncheck.py --tree --update` als de boom verandert, en bouw daarna opnieuw. |

## Herkomst en de eenmalige migraties

De ruwe onderzoeksuitvoer van golf 4 (per plak de opgehaalde pagina's, de geverifieerde uitvoer en de verslagen) stond in het
scratchpad van die sessie en is niet bewaard. Deze map is op 16 oktober 2026 teruggerekend uit `PN_DATA` van versie 6 plus de
nummerronde van golf 5, en is sindsdien de bron. De verificatiepoort van golf 4 (opnieuw ophalen, letterlijk op de pagina, drie
lokvogels per plak, alle 15 afgewezen) staat beschreven in `docs/premortem.md`.

De oude `build_pn.py` (tot commit `84fce20`, zie de git-geschiedenis) voerde bij elke bouw migraties uit die nu in de gegevens
verwerkt zijn:

- RENAME: `Interieur/Stoelen/Achterbank/Middenarmsteun achter` verhuisde naar `.../Rugleuning groot deel/Middenarmsteun achter`.
- DROP: records voor delen die in deze uitvoering anders zijn (Dakpaneel, Tankdop, Hemelbekleding) vervielen door het panoramadak en de capless vulhals.
- INHERIT: delen die na het onderzoek uit een bestaand onderdeel zijn gesplitst, kregen de eenheid van de ouder met relatie `deel` (Tankklep buitenkant en binnenzijde, Luchtgeleiderblad en Armen luchtgeleider, Sproeieropening links en rechts, Vulopening in het kleppendeksel, Vulklepring). Bewust niet gekoppeld, op "niet onderzocht": Armsteunbekleding (ouder niet onderzocht), A-stijlbekleding links en rechts (bekleding van de stijl, geen deel van de hemel), Hoedenplankkoord en Plankscharnierpen links en rechts (levering niet vastgesteld), Vulklep (eigen onderzoek nodig).
- UNIT_FIX: eenheid `U_BONNET` heet "Motorkap (kaal)" met de notitie dat de originele kap volgens MR 415 (48A) van aluminium is.
- VAR_FIX: de variantteksten van `U_CAT` (Euro 5 volgens de RDW) en `U_WMOTOR_R` (keuze 287100004R) zijn aangepast na de keuze.
- VIN_KEUZE (golf 5): bij 13 eenheden is de uitvoering voor de auto van de gebruiker gekozen op grond van de RDW (eerste toelating 18 februari 2011, benzine 1998 cc 125 kW, EURO 5 A) en het chassisnummer (bouw rond begin 2011, bak AJ0). De grond staat per eenheid in `kz.g`; de dynamo (`U_ALT`) is bewust open gelaten tot het motorplaatje (811 of 813) beslist.
- MR_INFO: de onderhoudsregels uit MR 415 (aanhaalmomenten, inhouden, ATF) staan in `info.json` met de pagina als bron.
- ATTR_NL (golf 5d, 16 oktober 2026): de opmerkingen bij de nummers (`oe[1]`, `am[2]`) en de variantteksten (`var`) bevatten geen
  letterlijke Engelse catalogusattributen meer ("Opening Temperature [°C]: 89", "Thread Size: M14x1,25", "Positie: frontal sided",
  "Lijst 23370, Left, Outer section, LED"). Ze zijn omgezet naar korte Nederlandse aanduidingen met dezelfde feiten ("opent bij
  89 °C", "draad M14 x 1,25", "distributiezijde", "lijst 23370, links, buitendeel, led"); de twee advertentietitels bij de D-nummers
  van het panoramadak zijn vervangen door een eigen omschrijving. 252 verschillende teksten in 400 records. Niet aangepast: `note`
  en de regels in `map.json`, onderzoeksaantekeningen die de categorie van de bron noemen (zie `docs/onderdeelnummers-schema.md`).

## Een nieuwe ronde toevoegen

1. Nieuwe eenheden in een nieuw plakbestand `units/<plak>.json` (sleutel `plak:ID`), met per nummer een bewijsniveau en per eenheid minstens één https-bron; wat niet geverifieerd is, krijgt geen record (blijft "niet onderzocht").
2. Paden in `map.json` met relatie en regel; de verificatiepoort met lokvogels blijft gelden (zie `docs/masterplan.md`, golf 5d).
3. `python3 tools/orkestratie/build_pn.py`, daarna `python3 tools/pncheck.py --tree` en `ITEST_GATES=1 python3 tools/itest.py` (controle 15).

# Framework voor explosietekeningen

Dit document beschrijft hoe een auto in deze opzet wordt gemodelleerd en hoe je dat voor een volgende auto herhaalt. Het is de bovenlaag boven [ontwerp-en-architectuur.md](ontwerp-en-architectuur.md) (de techniek van de app en de engine), [testen.md](testen.md) (de tests) en [sjabloon-contract.md](sjabloon-contract.md) (het bouwcontract per auto). laguna3 is de referentie: hier ontstaat en leeft het framework. espace5 is de tweede auto.

## Waarom een framework

espace5 is gemaakt door laguna3 versie 6 te kopiëren en de domeinbestanden opnieuw te schrijven. Gemeten op 16 oktober 2026: `core.js`, `app1.js`, `app2.js` en `head.html` verschilden 0 tot 16 regels van laguna3 versie 6, alleen in namen en teksten van de auto; de domeinbestanden (carrosserie, motor, onderstel, interieur, systemen) waren volledig eigen. Het kopiëren werkte, maar verbeteringen gingen niet meer mee. Sinds die kopie kreeg laguna3 het vangnet, toegankelijkheid, robuustheid, de visuele regressietest en de openstand die bij de wissel blijft staan; espace5 kreeg intussen een volledig documentgeraamte voor GitHub Pages, dat laguna3 miste (een telefoon toonde de Pages-versie op 980 px breedte). `tools/framework.py vergelijk ../espace5` telt 41 van de 41 generieke bestanden als afwijkend of ontbrekend.

Het framework maakt de scheiding hard: wat generiek is, is per auto byte voor byte gelijk en komt uit deze repo; wat bij de auto hoort, staat in eigen bestanden en in `auto.json`.

## Hoe de modellering is opgezet

1. **Alles in code, één pagina.** Geen modelbestanden: elk onderdeel is een stuk geometrie in JavaScript (three.js r147, de laatste versie met de klassieke `examples/js`). `build.py` plakt `src/` tot één `index.html`. Dat maakt elke maat controleerbaar in een diff en elke auto reproduceerbaar uit de bron.
2. **Een boom van knopen.** `A(naam, opties, kinderen)` voor een groep en `P(naam, geometrie, materiaal, opties)` voor een onderdeel, met verplicht `d` (Nederlandse beschrijving), `spec` alleen voor geverifieerde feiten, `ex` als uitklapvector, `inner` voor wat van buiten nooit te zien is, `open` voor wat opengaat, `hideWhen` voor wat uitgenomen wordt en `uitsteek` (meter) voor een deel dat bewust voor of achter de lengte ZF..ZR uitsteekt, zoals een trekhaak. De wortel heeft in elke auto dezelfde acht hoofdgroepen in dezelfde volgorde: Carrosserie, Interieur, Aandrijflijn, Onderstel, Koeling en luchtinlaat, Uitlaatsysteem, Brandstofsysteem, Elektrisch systeem. Details: [ontwerp-en-architectuur.md](ontwerp-en-architectuur.md), Knoop-API.
3. **Vaste assenstelsels.** Het autoframe in meter: x naar links, y omhoog vanaf de grond, z naar voren, de auto in de lengte gecentreerd. Daarnaast een motorframe (oorsprong op de krukas-as) met vaste omrekeningen naar het autoframe. Elk domein rekent in deze frames en met de huidfuncties van de carrosserie (`HW`, `YB`, `YT`, `surfX`), niet met losse getallen.
4. **Domeinen met eigenaars.** Eén bestand of groep bestanden per domein (carrosserie, motor, aandrijving, onderstel, interieur, systemen), elk met een eigen voorvoegsel voor functies, materialen en cachesleutels. Domeinen werken parallel in eigen worktrees en praten alleen via het contract.
5. **Een contract per auto.** Vóór het bouwen legt `docs/contract.md` vast: de auto, de hoofdmaten, het motorframe, het kapprofiel, de aansluitpunten, de ankernamen, eigendom, budgetten en openers. Sjabloon: [sjabloon-contract.md](sjabloon-contract.md).
6. **Onderzoek eerst, met status per feit.** Specificaties komen uit brochures, werkplaatshandboeken, de RDW en de eigenaar, elk met een bron en een status (bevestigd, aannemelijk, geschat). Het silhouet wordt gemeten uit zij- en bovenaanzicht en vastgelegd als meetpunten; de carrosserie moet daar binnen de tolerantie op liggen.
7. **Poorten in plaats van vertrouwen.** Elke stap heeft een test die faalt als het misgaat: bouwcontroles, rooktest, integriteit (ankers, maten, ruimte onder de kap, uitsteken), silhouet, ingesloten delen, openers (botsing, ondergrens, blootleggen), interactie, budgetten, publicatie per kanaal, visuele regressie en labelankers. Daarnaast een visuele poort met beoordelaars op vaste kenmerken. Lijst en betekenis: [testen.md](testen.md).
8. **Publiceren met teruglezen.** GitHub Pages serveert `index.html` (een volledig document); het artefact krijgt de kale pagina uit `build.py --bare`. Na elke publicatie worden beide teruggelezen en byte voor byte vergeleken.

## De lagen

`framework.json` zegt per bestand waar het hoort. Samengevat:

| Laag | Wat | Per auto |
|---|---|---|
| Generiek | `build.py`; `src/core.js`, `app1.js`, `presets.js` (de motor van presets en rondleiding), `app2.js`, `head.html` (sjabloon met `{{velden}}`); de tests en de orkestratie in `tools/`; CI, de sessiehook, `framework.json`, dit document en het contractsjabloon | byte voor byte gelijk, uit laguna3 |
| Auto | `auto.json`; de domeinbestanden (`body.js` tot `systems.js`, `buildCar()` in `systems.js`); `presetdata.js` (categorieën, presets, rondleiding); `partnumbers.js` en `data/pn/`; `data/silhouet.json`; `tools/anchors.json` en `open_allow.json`; het onderzoek, het contract, de screenshots en de basislijn | eigen werk |
| Sjabloon | `CLAUDE.md`, het ontwerpdocument, `testen.md`, `telefoontest.md`, `.gitignore`, `LICENSE` | gekopieerd en aangepast |

### Het aansluitcontract tussen generiek en auto

Wat de generieke laag van een auto verwacht, en niet meer dan dat:

- `auto.json` met elk veld dat `head.html` (`{{veld}}`) en de code (`AUTO.veld`) gebruiken; `tools/framework.py check` toetst dat. Het veld `verboden` noemt termen van deze auto die nooit in een generiek bestand mogen staan.
- `buildCar()` geeft de wortel met de naam `AUTO.wortel` en de acht hoofdgroepen; Onderstel heeft precies Vooras en stuurinrichting, Achteras, Wielen en Remsysteem; de motor is een kind van Aandrijflijn waarvan de naam met `Motor ` begint; de motorkap heet `Motorkap`.
- `body.js` definieert `ZF`, `ZR` (lengte) en `BOD_WMAX`, `BOD_MIRW`, `BOD_H` (halve breedte zonder en met spiegels, hoogte); de huidfuncties `HW`, `YB`, `YT`, `surfX` zijn welkom (de tests gebruiken ze als ze bestaan).
- `data/silhouet.json` met de meetpunten; `planY` en `beltY` (hoogtebereik van de zijstralen en van het zoeken naar de raamlijn) zijn optioneel en staan standaard op die van laguna3 (0,22 tot 1,05 en 0,80 tot 1,15 m). Een hogere auto zoals espace5 zet ze zelf.
- `auto.json: docshots` is de lijst `[bestandsnaam, preset-id]` voor `docs/screenshots` (`tools/orkestratie/docshots.py`; `mobiel.png` komt er altijd bij).
- `auto.json: pnToelichting` zegt of de notitie bij een verkoopeenheid (`note`) als Toelichting in het paneel staat (espace5 ja; in laguna3 zijn het onderzoeksaantekeningen, daar nee).
- `presetdata.js` definieert `appCar`, `appCats`, `PRESETS` en `appTourSteps`.
- `partnumbers.js` definieert `PN_DATA` (leeg mag).
- De testhaak heet in elk model `window.__model`; `AUTO.hook` geeft er een tweede naam aan (laguna3: `__laguna`).

### Wat nog niet generiek is

Eerlijk benoemd, zodat het de volgende stap is en geen verrassing:

- `tools/itest.py` noemt onderdelen van de Laguna bij naam (motorkap, portieren, achterklep, hoedenplank) in een deel van zijn 222 controles. Het staat daarom onder auto. Volgende stap: de autospecifieke namen naar een testdeel in de autogegevens, zodat de controles zelf generiek worden.
- De poortcamera's (`gallery.py`, `gateshots.py`, `poort.js`) en `rays_bagage.py` zijn per auto.
- Het ontwerpdocument en `testen.md` mengen generieke uitleg met Laguna-feiten; ze staan onder sjabloon.

## Een nieuwe auto in stappen

Elke stap eindigt met een poort; pas als die groen is, begint de volgende.

| Stap | Wat | Poort |
|---|---|---|
| 0. Opzetten | `python3 tools/framework.py nieuw ../repo --id ID --wortel "Merk Model"`: generieke bestanden, sjablonen, `auto.json` en een beginauto met acht plaatshouders. | `python3 build.py`, `tools/smoke.py`, `tools/integrity.py` en `tools/tri.py --gate` groen (zo getoetst op 16 oktober met een proefauto); `tools/framework.py check` groen |
| 1. Onderzoek | Specificaties met bron en status, foto's van de auto van de eigenaar, RDW-gegevens; kenteken en chassisnummer nooit in de repo. | `docs/specificaties-en-bronnen.md` en `docs/onderzoek/` met een beslissing per open vraag |
| 2. Contract | `docs/contract.md` uit het sjabloon; `auto.json` met naam, teksten en verboden termen. | het contract volledig ingevuld; `framework.py check` groen |
| 3. Carrosserie | Silhouet meten naar `data/silhouet.json`; dan de carrosserie met de huidfuncties. Herkenbaarheid eerst: de auto moet op de eerste blik de juiste zijn. | `tools/silhouette.py` groen; visuele poort op de herkenningskenmerken |
| 4. Domeinen | Motor, aandrijving, onderstel, interieur en systemen parallel in worktrees, elk tegen het contract. | `tools/orkestratie/mergecheck.py`; na samenvoegen `integrity.py` 0 fouten en de budgetpoort |
| 5. Openers en presets | Openers met ondergrens, `presetdata.js`, de ankers in `anchors.json`. | `tools/opentest.py --strikt-min`, `ui_inner.py --open --strict`, integrity zonder ankerfouten |
| 6. Interactie | Het autodeel van de interactietest. | `tools/itest.py` met `ITEST_GATES=1` |
| 7. Onderdeelnummers | `data/pn/` in plakken met een verificatiepoort en lokvogels. | `tools/pncheck.py` |
| 8. Publiceren | Volledige set, visuele poort, `index.html` naar Pages, `build.py --bare` naar het artefact, teruglezen, `CHANGELOG.md` en `handomdraai.md`. | `tools/orkestratie/finaltests.sh` groen; beide kanalen byte voor byte |

## Werken met meerdere auto's

- **Een verbetering in de generieke laag ontstaat hier.** Daarna `python3 tools/framework.py export ../andere-repo` (eerst met `--droog`), in die repo `python3 build.py` en de testset, en committen daar. De export raakt de autobestanden niet en schrijft het bestand `FRAMEWORK` met de versie en de bron-commit.
- **Ontstaat een verbetering in een andere auto** (zoals het documentgeraamte in espace5), dan wordt die eerst hier overgenomen en daarna geëxporteerd. Nooit in twee repo's apart.
- **Afwijking meten:** `python3 tools/framework.py vergelijk ../andere-repo` geeft per generiek bestand gelijk, afwijkend of ontbrekend.
- **Bewaken:** `python3 tools/framework.py check` draait in CI; een autonaam of motorcode in een generiek bestand is rood.

## espace5 naar het framework

Stand van 16 oktober: alle generieke bestanden wijken af of ontbreken, omdat espace5 op versie 6 is blijven staan. De overstap, in de sessie die aan espace5 werkt (niet vanuit hier, om haar werk niet te kruisen):

1. `auto.json` maken met de teksten die nu in `head.html`, `app2.js` en `presets.js` van espace5 staan, `hook: "__espace"`.
2. De presetlijst uit `presets.js` naar `src/presetdata.js`; `appCar` wordt `AUTO.wortel`.
3. Het silhouet uit `tools/silhouette.py` naar `data/silhouet.json`.
4. `python3 /pad/naar/laguna3/tools/framework.py export .` en daarna `python3 build.py`, `framework.py check` en de volledige set.
5. Eigen verbeteringen van espace5 in de generieke laag (de `openHint` per wortel, de toelichting bij een onderdeelnummer, `PN_DATA.meta.type`) eerst in laguna3 overnemen, dan exporteren. Stand: de `openHint` en `PN_DATA.meta.type` zijn al vervangen door `auto.json: openUitleg` en `pnType`; de toelichting is `pnToelichting`; daarbij kwamen de knoopoptie `uitsteek` (de trekhaak van espace5) en `planY` en `beltY` in het silhouet.

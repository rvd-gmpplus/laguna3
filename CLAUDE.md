# laguna3: afspraken voor wie hier bouwt

Interactieve 3D-explosietekening van een Renault Laguna III (2011, F4Rt, automaat AJ0) in three.js r147. Alle geometrie
staat in code; `build.py` plakt `src/head.html` en `src/*.js` (volgorde `ORDER`) tot één `index.html`. Nederlands is de
taal van code-commentaar, beschrijvingen, docs en commits. Geen em-dashes in tekst.

## Bouwen en testen

- `tools/setup.sh` maakt een verse omgeving klaar (Playwright uit `requirements.txt`, three.js 0.147.0 met hashcontrole).
- `python3 build.py --lint` voor elke commit; `python3 build.py` herbouwt `index.html` (gecommit, hoort bij `src/`).
- Volledige set: `tools/orkestratie/finaltests.sh UITMAP` (strikt, één exitcode, tijd per test). Losse scripts in `tools/`.
- Budgetten (driehoeken per hoofdgroep) staan in `tools/anchors.json`; `tools/tri.py --gate` bewaakt ze.
- Een melding van de gebruiker eerst narekenen met `tools/orkestratie/pick.py`, `probe.py` of stralen; dan pas wijzigen.

## Eigendom en contracten

- Eén bestand per domein: carrosserie (`body.js`, `bodyparts.js`, `panorama.js`), motor (`engine1-3.js`), aandrijving
  (`drivetrain.js`), onderstel (`chassis.js`), interieur (`interior.js`), systemen (`systems.js`), app (`core.js`,
  `app1.js`, `presets.js`, `app2.js`, `head.html`). Voorvoegsels per eigenaar voor functies, materialen en cachesleutels.
- Alleen-lezen voor domeineigenaars: `core.js`, `body.js`, `tools/anchors.json`, `tools/open_allow.json`, de testscripts,
  `IGNORE` in `tools/harness.py`. Wijzigen gaat via de orkestrator, met een melding aan de eigenaren.
- Knopen: `A(naam, opties, kinderen)` en `P(naam, geometrie, materiaal, opties)` met verplicht `d` (Nederlandse
  beschrijving), `spec` alleen voor geverifieerde feiten in Nederlandse notatie, `ex` als uitklapvector, `inner` alleen
  voor wat van buiten nooit te zien is. Openers hebben altijd `open.min` van minstens 0,8 maal de volle hoek of slag.
- `src/partnumbers.js` en `docs/onderdeelnummers.csv` zijn gegevens uit `tools/orkestratie/build_pn.py`; niet met de hand.
- Het chassisnummer en het kenteken van de gebruiker komen nooit in de repo, de pagina of een commitbericht.
- Nummers in de docs: één bron (`docs/cijfers.md`); elders ernaar verwijzen in plaats van getallen herhalen.

## Werkwijze

- Golven per domein in eigen worktrees; `tools/orkestratie/mergecheck.py` vóór samenvoegen; na samenvoegen de volledige
  set, dan pas `index.html` herbouwen en publiceren; na publiceren de URL teruglezen en byte voor byte vergelijken.
- `VERSION` is het versienummer van de volgende publicatie; `build.py` zet nummer plus inhoudshash in de pagina.
- Begin elke sessie met `git ls-remote --heads origin` en een vergelijking van elke tak met `main`.
- Volledige uitleg: `docs/ontwerp-en-architectuur.md`, `docs/testen.md`, `handomdraai.md`.

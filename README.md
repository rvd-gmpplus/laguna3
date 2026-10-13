# Laguna III explosietekening

Interactieve 3D-explosietekening van een Renault Laguna III hatchback (fase 2, 2011) in Initiale Paris-uitvoering, zilvergrijs, met de 2.0 Turbo F4Rt-motor (170 pk) en zestraps automaat. Het model bestaat uit 865 losse onderdelen in 122 groepen. Elke groep klapt apart uit en in, tot op klepspie, zuigerveer en remzuiger.

![Gemonteerd](docs/screenshots/gemonteerd.png)

## Openen

Open `index.html` in een moderne browser. Het bestand laadt three.js r147 van jsDelivr en lettertypes van Google Fonts. Verder is alles ingebouwd.

## Bediening

| Onderdeel | Werking |
|---|---|
| Tikmodus *Uitklappen* | Tik op de auto: de buitenste nog dichte groep op die plek klapt uit. |
| Tikmodus *Inklappen* | Tik op een onderdeel: de diepste open groep op die plek klapt weer in. |
| Tikmodus *Info* | Selecteert alleen, toont de onderdeelkaart. |
| Rechtermuisknop | Klapt de diepste open groep onder de cursor in. |
| Dubbelklik | Zoomt in op het aangeklikte onderdeel. |
| Presets | Gemonteerd, Hoofdgroepen, Carrosserie, Motor F4Rt, Motor tot op de bout, Cilinderkop, Automaat, Onderstel en remmen, Interieur, Röntgen, Alles uit elkaar. |
| Paneel *Onderdeel* | Beschrijving, specificaties, kruimelpad, knoppen Uitklappen, Alles hieronder uit, Isoleren, In beeld. |
| Paneel *Onderdelen* | Volledige boom met zoekfunctie. |
| Paneel *Weergave* | Spreiding, labels, röntgen, kleuren per systeem, langzaam draaien, camerastandpunten. |
| Escape | Selectie terug naar de hele auto. |

## Mappen

| Pad | Inhoud |
|---|---|
| `index.html` | De gebouwde pagina (identiek aan het gepubliceerde artefact). |
| `src/` | Broncode in delen: opmaak, geometrie, carrosserie, motor, aandrijflijn, onderstel, interieur, systemen en app-logica. |
| `build.py` | Voegt `src/` samen tot `index.html`; maakt optioneel een lokale testversie. |
| `tools/` | Testscripts (Playwright, headless Chromium). |
| `docs/` | Specificaties met bronnen, ontwerp en architectuur, testverslag, screenshots. |

## Bouwen

```bash
python3 build.py                 # schrijft index.html (three.js via CDN)
python3 build.py /pad/naar/test  # maakt ook test/index.html die three.js uit ./three/ laadt
```

Voor de testversie: `npm pack three@0.147.0`, uitpakken en de map `package` als `test/three` neerzetten (symlink volstaat). Zie [docs/testen.md](docs/testen.md).

## Documentatie

- [Specificaties en bronnen](docs/specificaties-en-bronnen.md)
- [Ontwerp en architectuur](docs/ontwerp-en-architectuur.md)
- [Testen](docs/testen.md)

## Kanttekening

Het is een schematisch model. Vormen, maten en posities van onderdelen zijn benaderd en niet geschikt als montagevoorschrift. De carrosserie volgt de officiële hoofdmaten, maar is een eigen vorm zonder merklogo's of typebadges.

## Screenshots

| Hoofdgroepen | Motor F4Rt |
|---|---|
| ![Hoofdgroepen](docs/screenshots/hoofdgroepen.png) | ![Motor](docs/screenshots/motor-f4rt.png) |
| **Automaat** | **Röntgen** |
| ![Automaat](docs/screenshots/automaat.png) | ![Röntgen](docs/screenshots/rontgen.png) |

Telefoonweergave: [docs/screenshots/mobiel.png](docs/screenshots/mobiel.png)

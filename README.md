# Laguna III explosietekening

Interactieve 3D-explosietekening van een Renault Laguna III hatchback (fase 2, 2011) in de uitvoering Initiale Paris: zilvergrijs (Gris Platine D69), met de 2.0 Turbo F4Rt-motor (170 pk) en de zestraps automaat Jatco JF613E (Renault AJ0). Het model bestaat uit 2.394 losse onderdelen in 484 groepen, tot 8 lagen diep (2.878 knopen, 599.972 driehoeken). Elke groep klapt apart uit en in, tot op klepspie, zuigerveer en remzuiger. Alle geometrie wordt in code opgebouwd; er zijn geen 3D-bestanden.

![Gemonteerd](docs/screenshots/gemonteerd.png)

## Openen

Open `index.html` in een moderne browser. Het bestand laadt three.js r147 van jsDelivr en lettertypes van Google Fonts. Verder is alles ingebouwd. Het werkt op desktop en telefoon, in licht en donker thema (het thema volgt het systeem).

De eerste keer toont de pagina een korte hint. Die verdwijnt na de eerste handeling of na negen seconden en komt daarna niet terug (de browser onthoudt dat). De knop `?` rechtsboven opent de uitleg van de bediening.

## Bediening

### Op een onderdeel

| Gebaar | Wat er gebeurt |
|---|---|
| Klik of tik (modus Onderdeel) | De eigen groep van het onderdeel klapt ter plekke uit. De rest van de auto blijft staan. Staat die groep al open, dan wordt het onderdeel geselecteerd en een stukje uitgelicht. Een klik klapt nooit een groep boven de eigen groep uit. |
| Dubbelklik of dubbeltik | Duikt naar het onderdeel: alle dichte groepen erboven gaan laag voor laag open en de camera zoomt erop in. De duik gebruikt altijd het onderdeel van de eerste klik. Tussen de twee klikken mag hoogstens 420 ms zitten en hoogstens 26 pixels. |
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

### Presets en rondleiding

Onderin staan de presets in zes categorieën: Overzicht, Motor, Aandrijving, Onderstel, Carrosserie en Interieur. Elke preset bereik je met twee klikken (categorie, dan item). De presets volgen een vaste overgang: eerst klapt dicht wat dicht moet, dan beweegt de camera naar de eindkadrering terwijl open gaat wat open moet, alles samen hoogstens 2,5 seconden. Een preset toont alleen de onderdelen die erbij horen; de rest staat op de achtergrond of is verborgen.

- Aantal presets: 37, de rondleiding meegeteld (in de eerste golf waren het er 31): Overzicht 6, Motor 11, Aandrijving 6, Onderstel 7, Carrosserie 4, Interieur 3. In de herstelronde van golf 2 kwamen er zes bij: Stuurpomp, Koeling en luchtinlaat, Uitlaatsysteem, Accu, Stuurinrichting en Parkeerrem.
- `Rondleiding` in Overzicht speelt de belangrijkste presets na elkaar af met een bijschrift per stap, ongeveer vijf seconden per stap. `Stop rondleiding` of Esc breekt af.
- De lijst van presets staat in `src/presets.js`.

### Het paneel

Het paneel rechts (op de telefoon onderaan) heeft drie tabbladen.

| Tab | Inhoud |
|---|---|
| Onderdeel | Kruimelpad, naam, beschrijving, specificaties en de onderdelen waaruit de selectie bestaat. Knoppen: Uitklappen of Inklappen, Duik hierheen (bij een onderdeel), Groter geheel, Alles hieronder uit, Isoleren, In beeld. |
| Onderdelen | De volledige boom met zoekfunctie, bijvoorbeeld "klepveer". Een treffer openen klapt het pad ernaartoe uit en selecteert het onderdeel. |
| Weergave | Spreiding (40 tot 220 %), Labels, Röntgen (carrosserie doorzichtig), Kleuren per systeem, Langzaam draaien, zes camerastanden (Voor, Zij, Achter, Boven, ¾ voor, ¾ achter), de schakelaar `Gesloten groepen samenvoegen` (gebundeld renderen, standaard aan) en de knoppen Alles uitklappen, Alles inklappen en Alles tonen. |

Labels zijn genummerde bijschriften met een lijntje naar het onderdeel. Ze verschijnen bij de kinderen van de laatst uitgeklapte groep en vermijden elkaar en de bediening.

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

### Beeldkwaliteit

Haperen de eerste frames (gemiddeld meer dan 40 ms over 20 frames tijdens een animatie), dan schakelt de pagina één keer over op een lichte weergave: pixelratio 1 en geen lakglans. Een melding in Weergave vertelt dat, en de schakelaar `Volle kwaliteit` zet het terug. Tijdens grote animaties (meer dan 800 bewegende onderdelen) zakt de pixelratio tijdelijk naar driekwart.

## Mappen

| Pad | Inhoud |
|---|---|
| `index.html` | De gebouwde pagina (identiek aan het gepubliceerde artefact). |
| `src/` | Broncode in delen: opmaak, geometrie, carrosserie, motor, aandrijflijn, onderstel, interieur, systemen, app-logica en presets. |
| `build.py` | Voegt `src/` samen tot `index.html`, controleert de broncode en maakt een testversie. |
| `tools/` | Testscripts (Playwright, headless Chromium) en `anchors.json` met de ankernamen. |
| `docs/` | Specificaties met bronnen, ontwerp en architectuur, testverslag, premortem, screenshots. |
| `docs/v1/index.html` | De eerste versie van de pagina, bewaard als terugvaloptie. |

## Bouwen en testen

```bash
python3 build.py                 # schrijft index.html (three.js via CDN)
python3 build.py /pad/naar/test  # maakt ook test/index.html die three.js uit ./three/ laadt
python3 build.py --lint          # controleert alleen (dubbele namen, syntaxis)
python3 build.py --test-only MAP # alleen de testversie, laat index.html ongemoeid
```

De tests gebruiken three.js 0.147.0 uit een lokaal npm-pakket en een Chromium met software-rendering. De korte route:

```bash
python3 tools/smoke.py        # laden, aantallen, console
python3 tools/integrity.py    # boom, ankers, doorsteken, presets
python3 tools/silhouette.py   # carrosserie tegen het gemeten silhouet
python3 tools/itest.py        # bediening op desktop en telefoon
python3 tools/pubsmoke.py     # de CDN-versie in de verpakking van de host
python3 tools/ui_inner.py     # ingesloten (inner) onderdelen mogen van buitenaf niet zichtbaar zijn
```

Voorbereiding, alle scripts en de resultaten staan in [docs/testen.md](docs/testen.md).

## Documentatie

- [Specificaties en bronnen](docs/specificaties-en-bronnen.md): wat is bevestigd, aannemelijk of geschat, met bron.
- [Ontwerp en architectuur](docs/ontwerp-en-architectuur.md): coördinaten, bronbestanden, knoop-API, uitklaplogica, contracten tussen de delen, ontwikkelgeschiedenis.
- [Testen](docs/testen.md): scripts, controles en resultaten.
- [Premortem](docs/premortem.md): waarom de klikregel is veranderd en welke vangnetten er zijn.

## Bekende beperkingen

- Het is een schematisch model. Vormen, maten en posities van onderdelen zijn benaderd en niet geschikt als montagevoorschrift. De carrosserie volgt de officiële hoofdmaten en het gemeten silhouet, maar is een eigen vorm zonder merklogo's of typebadges.
- Het inwendige van de automaat volgt de zusterbak (Mitsubishi F6AJA) en de literatuur over de Jatco JF613E. Voor de Renault AJ0 zelf zijn geen werkplaatstekeningen gevonden, dus de koppeling tussen de planetaire sets is schematisch.
- De velgen zijn 18 inch met band 225/45 R18. Voor een Nederlandse Initiale Paris uit 2011 is 17 inch even goed mogelijk. Zie [docs/specificaties-en-bronnen.md](docs/specificaties-en-bronnen.md).
- Niet in het model: 4Control (vierwielbesturing) en het panoramadak. Beide waren opties.
- De stuurbekrachtiging is hydraulisch met een pomp op de multiriem. Dat is aannemelijk voor deze motor, niet met een eigen bron bevestigd.
- De prestaties zijn alleen in een container met software-rendering gemeten. Op een echte telefoon is de framesnelheid niet getest; de pagina schakelt zelf over op een lichte weergave als hij haperen gaat.
- Gebundeld renderen van gesloten groepen staat standaard aan (schakelaar in Weergave). Zonder bundelen heeft de gemonteerde auto 1.680 tekenopdrachten, met bundelen 369. De grens van 1.500 geldt dus alleen met bundelen.
- De Aandrijflijn heeft 245.794 driehoeken tegen een budget van 240.000. De hele auto (599.972) blijft binnen het budget van 700.000.
- De multiriem is in het model 1.569 mm lang tegen 1.795 mm (7PK1795); de beschrijving in de pagina zegt dat. De positie van de stuurpomp en de routes van de slangen zijn schematisch.
- De voorste langsliggers snijden de aandrijfassen. Dit was al zo en is niet opgelost.
- Niet gebouwd: UX-punt U19 en een zijkolomindeling voor telefoons in liggende stand.
- Alle laadtijden zijn in een container met software-rendering gemeten (de pagina is daar na 5 tot 21 seconden klaar, afhankelijk van de belasting van de machine). Ze zeggen niets over een echt apparaat.
- De gedragingen van de webview van een telefoon-app (lang drukken, sneltoetsen in een iframe) zijn niet te testen in de container. De stijlregels ervoor zijn wel getoetst.
- Niet elke 2.0T 170 automaat uit fase 2 is overal geleverd. Zie [docs/specificaties-en-bronnen.md](docs/specificaties-en-bronnen.md) onder Leverbaarheid.

## Screenshots

| Hoofdgroepen | Motor F4Rt |
|---|---|
| ![Hoofdgroepen](docs/screenshots/hoofdgroepen.png) | ![Motor](docs/screenshots/motor-f4rt.png) |
| **Automaat** | **Röntgen** |
| ![Automaat](docs/screenshots/automaat.png) | ![Röntgen](docs/screenshots/rontgen.png) |

Alles uit elkaar: [docs/screenshots/alles-uit-elkaar.png](docs/screenshots/alles-uit-elkaar.png)

Telefoonweergave: [docs/screenshots/mobiel.png](docs/screenshots/mobiel.png)

De screenshots in `docs/screenshots/` stammen uit de eerste versie en zijn bij het schrijven van deze tekst (eindstand `ead92f6`) nog niet vernieuwd. De orkestrator vervangt ze onder dezelfde bestandsnamen; tot dan tonen ze niet de eindstand.

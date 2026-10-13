# Handomdraai laguna3

Stand 13 okt 2026, 18:05 UTC. Golf 2 klaar, live. Twee punten open.

## Waar

- Repo `rvd-gmpplus/laguna3`, tak `ccr-bd755431-1qfniw`. Code `d6d0456`, `index.html` gebouwd in `60909fe`, docs `9a14e5e`. Alles gepusht.
- Draft-PR #1: https://github.com/rvd-gmpplus/laguna3/pull/1. Geen CI in repo.
- Live: https://claude.ai/artifact/4qJq7YUk5nGSFmexY7WkZR, versie 3. Teruggelezen 17:37 UTC: `index.html` (620.025 bytes, md5 `d92a8bb27481511199e5946357d78e27`) staat er 1x in, alleen hostskelet eromheen (531 bytes ervoor, 15 erna).
- Versie 1 bewaard: `docs/v1/index.html`. Tussenstand golf 1 los: https://claude.ai/artifact/CchXLCsG3x8A4purHXpYRf
- Bouwen: `python3 build.py` plakt `src/*.js` tot `index.html`. Volgorde staat in `ORDER` in `build.py`.

## Wat werkt

- 2.396 onderdelen, 485 groepen, diepte 8, 2.881 knopen, 604.972 driehoeken.
- Klik: eigen groep klapt ter plekke uit, rest blijft staan. Dubbelklik: direct naar onderdeel. Inklappen: rechtsklik, lang drukken, Shift+klik.
- Explosieschuif, Demonteren/Monteren, Stap terug. 37 presets in 6 categorieen, plus rondleiding.
- Gesloten groepen gebundeld getekend: 370 tekenopdrachten gemonteerd, 1.682 zonder.

## Tests op `d6d0456`

- `python3 build.py --lint`: ok.
- `python3 tools/smoke.py`: geen consolefouten.
- `python3 tools/integrity.py`: 0 fouten, 0 ankerfouten, 0 presetfouten, 126 waarschuwingen.
- `python3 tools/silhouette.py`: 46/46 stations binnen tolerantie.
- `python3 tools/ui_inner.py`: 0 van 256 ingesloten knopen zichtbaar.
- `python3 tools/pubsmoke.py`: ok. Ready 7,5 s op 1280 x 800, 7,7 s op 390 x 844. Grens 20 s.
- `ITEST_GATES=1 python3 tools/itest.py`: 78/79, twee runs gelijk. Zie open punt 2.
- Frametijd p95 1,1 ms, grens 8 ms. Alles uitgeklapt: 1.506 tekenopdrachten, grens 3.000.

## Open

1. Exterieur haalt S7 niet. Visuele poort: 3 van 9 kenmerken ja, eis 7. Voorkant 3/4 herkenbaar. Achterkant te hoekig, te hoog, fastbackval zwak. Chroom mist: sierlijsten deuren, dorpelstrip. Omtrek wel binnen 3-5 cm van gemeten silhouet. Gat zit in afronding, staartvorm, chroom.
2. itest telefoon, check 1, tik 4 van 40 (stand Gemonteerd). Hover meldt `Binnenframe motorkap`, tik selecteert `Koplampsproeiers`. `pick()` in `src/app2.js` onveranderd sinds `ead92f6`, daar 79/79. Steekproef schuift mee met lijst meshes (nieuwe stator). Vermoeden: randpunt tussen twee delen. Niet bewezen. Test niet aangepast.
3. Aandrijflijn 250.794 driehoeken, budget 240.000. Nieuw stator-plaatpakket in `src/engine3.js` kost extra.
4. Portier linksvoor: binnenlagen dicht op elkaar. Uitklapvectoren langs x klein, in `src/bodyparts.js`.
5. Stuurpomp: labels Pomphuis en Stroomregelklep lijken omgedraaid. Labelanker = midden van kader (`k.lc` in `src/app1.js`).
6. Gemeld door herstellers, niet nagemeten: accuhouderstang tegen langsligger, vulpijp 0,1-1,5 mm in zitkussen achter, remslang achter tegen velgbed bij banjo. Integrity telt dit niet als fout.
7. Oud en bekend: voorste langsliggers snijden aandrijfassen. Multiriem 1.569 mm, echt 1.795 mm.
8. Niet gebouwd: UX-punt U19, zijkolom voor telefoon liggend.
9. Los bestand `/pub.txt` in root van container. Onschadelijk. Weghalen mag.

## Advies, op volgorde

1. Carrosserieronde in `src/body.js` en `src/bodyparts.js`. Grootste gat naar "dit is een Laguna". Doel S7 >= 7 van 9.
   - Dakboog: piek z -0,43, y 1,445. Knik dak/achterruit z -1,17, y 1,37. Rechte val naar klepbovenrand z -2,11, y 1,13. Spoilerlip ca. 0,05 m bij z -2,12.
   - Staart afronden en smaller laten lopen: halve breedte 0,88 bij z -1,75 naar 0,29 bij z -2,35.
   - Chroom erbij: dubbele sierlijst z +0,03 tot +0,82, y 0,51-0,58. Dorpelstrip zilver z -0,95 tot +0,85, y 0,21-0,24. Chromen raamomlijsting (bevestigd in brochure).
   - B-stijl zwart: 0,10 m breed boven, 0,15 m onder, helt ca. 12 graden naar achter.
   - Achterlicht binnendeel: rood glas met helder segment.
   - Na elke stap `silhouette.py` en `integrity.py`, galerij exterieur naast referentiefoto's, daarna visuele poort opnieuw.
2. itest-randgeval. Eerst oorzaak bewijzen: pick bij pointerdown loggen naast `noteTarget`. Blijkt randpunt: steekproef alleen punten laten kiezen waar 3x3 buurpixels zelfde deel raken, en dat in `docs/testen.md` zetten. Blijkt echte fout: fix in `src/app2.js`.
3. Aandrijflijn terug onder 240.000: minder segmenten in stator-plaatpakket of kleppen.
4. Portier: binnenlagen verder uit elkaar (body). Stuurpomp: labelanker op eigen mesh (app).
5. Testen op echte telefoon en GPU. Container meet alleen software-rendering.

## Werkwijze die werkte

- Golven per domein, elk in eigen worktree, alleen eigen bestanden. Eigendom checken voor samenvoegen.
- Na samenvoegen hele testset, dan pas publiceren. Na publiceren URL teruglezen, byte voor byte vergelijken.
- Visuele poort klein: plakken van max ca. 18 beelden, elk beeld 1x lezen, notities direct naar bestand, harde eindtijd. Eerste poort zonder die grenzen liep vast.
- Poortmeldingen zelf naleggen in preset-screenshots. Galerijcamera kan misleiden: dashboard en motorruimte waren vals alarm.

## Vluchtig: scratchpad, weg als container stopt

- Pad: `/tmp/claude-0/-home-user-laguna3/30068ba5-ed5c-5f1b-b200-1ce4840ed639/scratchpad`
- Onderzoek: `research/exterieur.md` (maten, kenmerken in sectie 7), `research/img/` (referentiefoto's, niet in repo zetten: rechten derden).
- Plan: `plan/stand.md`, `plan/herstel-visueel.md`.
- Hulpscripts in `tools/`: `gallery.py`, `presetshots.py`, `docshots.py`, `finaltests.sh`, `mergecheck.py`, `zone.py`, `stats.py`, `pickview.py`.
- Voor carrosserieronde eerst `research/exterieur.md` en hulpscripts in repo zetten.

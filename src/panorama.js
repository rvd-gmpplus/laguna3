/* ===================== panoramadak ===================== */
// Elektrisch panoramadak van de Laguna III hatchback (optie): een beweegbaar glaspaneel voor (kantelen en
// schuiven over het vaste paneel), een vast glaspaneel achter, dwarsbalk, cassette, zonneschermen en luchtgeleider.
// Eigenaar: carrosserie. Wordt aangeroepen vanuit bodyparts.js (groep 'Zijwanden en dak').
// Maten (m, autoframe): voorste glas z 0,20 tot -0,50 (opening in het dak vanaf z 0,22), dwarsbalk -0,50 tot -0,58, achterste glas
// -0,58 tot -1,11, glas x plus en min 0,47, opening in het dak x plus en min 0,50, omlijsting en rails tot 0,52. Alles is Geschat
// uit foto's en de verhoudingen van de catalogustekening; het exacte aantal schermen en de schuifafstand zijn niet te achterhalen.
// Alles ligt op of onder het dakvlak van het model (panQ, panP) en blijft tussen dakplaat en hemelbekleding (hoogstens 2,7 cm onder het dak).
// sterk getint glas: bij de auto van de gebruiker van buiten zo goed als zwart (keuze van de gebruiker, 15 oktober 2026);
// de zonneschermen zijn van buiten daardoor nauwelijks te zien, van binnen blijven glas en lucht zichtbaar
// De plaat heeft boven- en onderzijde met dezelfde wikkeling (beide normalen omhoog): vanaf het dak zijn het voorzijden (gang FrontSide), vanaf de
// cabine achterzijden (gang BackSide, FLIP_SIDED; gemeten, golf 5l). Alleen in die tweede gang krijgt het glas een lichtere, blauwgrijze kleur en
// een lagere dekking: van binnen leest het als getint glas met een zwakke weerspiegeling, van buiten blijft het zo goed als zwart met dekking 0,92.
// Golf 5l (cockpitmodus): van binnen ook doorzichtig. Dekking per vlak 0,92 maal 0,2446 = 0,225; van binnen kijk je door onder- en bovenvlak
// (allebei achterzijden), samen 1 - (1 - 0,225)^2 = 0,40, zoals de binnenkant van de voorruit (0,45). Van buiten blijft het 0,92 per vlak.
function panGlassIn(m) {
  // van binnen (FLIP_SIDED): blauwgrijze tint plus een zwakke weerspiegeling (randglans en een schuine lichtband in beeldruimte), zodat het glas als vlak
  // leest tegen de lichte lucht van de open opening; de buitenkant blijft ongewijzigd
  m.onBeforeCompile = sh => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n#ifdef FLIP_SIDED\n\tdiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.15, 0.19, 0.25), 0.9);\n\tdiffuseColor.a *= 0.2446;\n#endif')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef FLIP_SIDED\n\t{ vec3 pv = normalize(vViewPosition); float fr = pow(1.0 - abs(dot(pv, normal)), 2.0); float bd = dot(vViewPosition.xy, vec2(0.7071, 0.7071)); float st = smoothstep(0.17, 0.0, abs(bd - 0.1)) * 0.07;\n\ttotalEmissiveRadiance += vec3(0.07, 0.10, 0.14) * (fr * 0.9 + st); }\n#endif');
  };
  m.clone = function () { return panGlassIn(THREE.MeshPhysicalMaterial.prototype.clone.call(this)); };
  return m;
}
// ruwheid 0,2 en spiegeling 0,3: met 0,05 en de standaardspiegeling stond midden op het achterste glas een felle witte vlek in het
// bovenaanzicht (S7, golf 5f ronde 2); de weerspiegeling van de lucht blijft als zachte glans, zodat het als glas leest
panGlassIn(phys('bodPanoGlass', { color: 0x030405, metalness: 0.05, roughness: 0.2, specularIntensity: 0.3, transparent: true, opacity: 0.92, depthWrite: false, envMapIntensity: 0.4 }));
std('bodPanoFrit', 0x040405, 0, 0.35);                  // zwarte keramische rand (frit) op het glas
std('bodPanoBar', 0x15161a, 0.3, 0.5);                  // dwarsbalk: donkergrijs tot zwart gelakt
std('bodPanoCass', 0x929596, 0, 1.0, { envMapIntensity: 0.3 });   // cassette van het zonnescherm: mat grijs, net iets donkerder dan de hemel (0xa3a5a4, mat), zodat het huis zich aftekent (golf 5l ronde 3; was taupe)
const PAN_X = 0.47, PAN_XO = 0.50, PAN_XR = 0.52;       // glas, opening in de dakplaat, buitenrand van omlijsting en rails
const PAN_GF = [0.20, -0.50], PAN_GR = [-0.58, -1.11];  // z-bereik van het voorste en achterste glas
const PAN_OF = [0.22, -0.50], PAN_OR = [-0.58, -1.11];  // z-bereik van de openingen in de dakplaat
// q (halve kas) op het dak bij |x|: het dak boven de dakrail loopt lineair van x = xr naar de hartlijn (zie bodGhHalf)
function panQ(z, x) { return bodQR + (1 - bodQR) * (1 - Math.min(1, x / bodGh(z).xr)); }
// punt op het dak bij (z, x), lift meter boven het dakvlak
function panP(z, x, lift = 0) { const h = bodGhHalf(z, panQ(z, Math.abs(x))); return [(x < 0 ? -1 : 1) * h[0], h[1] + lift, z]; }
// bandje op het dakvlak
const panBand = (z0, z1, x0, x1, l, nz = 4, nx = 2) => patch((z, x) => panP(z, x, l), z0, z1, nz, () => [x0, x1], nx);
// dikke plaat langs het dak: bovenvlak, onderkant en vier randen (geen enkelwandige rand)
function panSlab(z0, z1, x0, x1, l0, l1, nz = 4, nx = 2) {
  const f = (z, x) => panP(z, x, l1), b = (z, x) => panP(z, x, l0);
  const side = x => patch((z, t) => panP(z, x, lerp(l0, l1, t)), z0, z1, nz, () => [0, 1], 1);
  const end = z => patch((x, t) => panP(z, x, lerp(l0, l1, t)), x0, x1, nx, () => [0, 1], 1);
  return merge([patch(f, z0, z1, nz, () => [x0, x1], nx), patch(b, z0, z1, nz, () => [x0, x1], nx), side(x0), side(x1), end(z0), end(z1)]);
}
// punten van een rechthoekige lus rond een opening (voor afdichtingen), lift onder het dakvlak
function panLoop(z0, z1, x, l, n = 8) {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(panP(lerp(z0, z1, i / n), x, l));
  for (let i = 0; i < n; i++) pts.push(panP(z1, lerp(x, -x, i / n), l));
  for (let i = 0; i < n; i++) pts.push(panP(lerp(z1, z0, i / n), -x, l));
  for (let i = 0; i < n; i++) pts.push(panP(z0, lerp(-x, x, i / n), l));
  return pts;
}
// dakplaat met twee openingen: stroken rondom en tussen de openingen. Golf 8 ronde 3: de zijstroken langs de voorste opening met 40
// stations (ca. 18 mm, was 14 van 51 mm) en het stuk voor de opening met 6 (was 3). Waar het dak naar de voorruit buigt (kromming tot
// 3 per meter, zie YR in body.js) week een koorde van 5 cm tot 1 mm van het dakvlak af; met 18 mm is dat 0,1 mm en volgt de rand op
// de dakrail de daklijn
function panRoofGeo() {
  const wo = z => panQ(z, PAN_XO) / 2, w0 = bodQR / 2, w1 = 1 - bodQR / 2;
  const full = (z0, z1, n) => patch((z, w) => ghPt(z, w), z0, z1, n, () => [w0, w1], 22);
  const strips = (z0, z1, n) => [patch((z, w) => ghPt(z, w), z0, z1, n, z => [w0, wo(z)], 5), patch((z, w) => ghPt(z, w), z0, z1, n, z => [1 - wo(z), w1], 5)];
  return weldAll(merge([full(RW0 - 0.008, PAN_OR[1], 4), ...strips(PAN_OR[1], PAN_OR[0], 12), full(PAN_OR[0], PAN_OF[1], 3), ...strips(PAN_OF[1], PAN_OF[0], 40), full(PAN_OF[0], WS1, 6)]));
}
// glaspaneel: glas met afgeronde randdikte, zwarte keramische rand (0,06) erop en een zwart kader eronder
function panGlass(z0, z1, name, adj) {
  // zijbanden van de keramische rand met 36 stations in z (golf 8 ronde 3, was 14), zoals de zijstroken van de omlijsting ernaast
  const zm = (z0 + z1) / 2, fw = 0.06, lf = 0.0055;
  const glass = P(`Glas ${name}`, panSlab(z1, z0, -PAN_X, PAN_X, 0.0, 0.005, 14, 8), MAT.bodPanoGlass, { d: `Sterk getint anti-UV veiligheidsglas van het ${adj} glaspaneel van het panoramadak (maat geschat, schematisch weergegeven).`, ex: [0, 0.14, 0] });
  glass.obj.renderOrder = 3;
  const frit = P(`Keramische rand ${name}`, merge([
    panBand(z0, z0 - fw, -PAN_X, PAN_X, lf, 2, 8), panBand(z1, z1 + fw, -PAN_X, PAN_X, lf, 2, 8),
    panBand(z0, z1, PAN_X, PAN_X - fw, lf, 36, 2), panBand(z0, z1, -PAN_X, -PAN_X + fw, lf, 36, 2)]),
    MAT.bodPanoFrit, { d: 'Zwarte keramische rand (frit) op het glas, 6 cm breed; verbergt het kader, de lijm en de rails (breedte geschat).', ex: [0, 0.2, 0] });
  frit.obj.renderOrder = 4;
  const kader = P(`Glaskader ${name}`, merge([
    panSlab(z1, z0, PAN_X - 0.03, PAN_X, -0.0095, 0.0, 14, 1), panSlab(z1, z0, -PAN_X, -PAN_X + 0.03, -0.0095, 0.0, 14, 1)]),
    MAT.bodPillar, { d: 'Zwart kader onder het glas waarop het glas is gelijmd; bij het voorste paneel draagt het ook de schuifschoenen.', ex: [0, 0.06, 0] });
  return [glass, frit, kader];
}
// draaiing om een as langs x: welke as (z, y) en hoek brengen punt S = (z, y) naar E met rotatie theta (rechtshandig om +x)?
function panArc(S, E, theta) {
  const c = Math.cos(theta), sn = Math.sin(theta), det = (1 - c) * (1 - c) + sn * sn;
  const ry = E[1] - (c * S[1] - sn * S[0]), rz = E[0] - (sn * S[1] + c * S[0]);
  return { pivot: [0, ((1 - c) * ry - sn * rz) / det, (sn * ry + (1 - c) * rz) / det], axis: [1, 0, 0], angle: theta };
}
// helling van het dak op de hartlijn (dy/dz)
const panSlope = z => (panP(z + 0.005, 0)[1] - panP(z - 0.005, 0)[1]) / 0.01;
// beweging die een plaatje op hoogte lev onder het dak van zc naar ze brengt en de dakhelling blijft volgen
function panFollow(zc, ze, lev) {
  const S = [zc, panP(zc, 0, lev)[1]], E = [ze, panP(ze, 0, lev)[1]], th = Math.atan(panSlope(zc)) - Math.atan(panSlope(ze));
  if (Math.abs(th) < 0.02) return { type: 'slide', move: [0, E[1] - S[1], E[0] - S[0]] };
  const a = panArc(S, E, th);
  return { type: 'slide', arc: { pivot: a.pivot, axis: a.axis, angle: a.angle } };
}
// scherm in lamellen: elke lamel schuift (draait om de dakkrommingsas) naar de cassette; zo verdwijnt het scherm in een stapel, zoals een
// rolgordijn in zijn cassette. De laatste lamel (bij de cassette) staat vast; de lamellen verder weg liggen hoger zodat ze er overheen schuiven.
// rechte afstand die het midden van een lamel aflegt (zoals opentest de slag meet), met de stop hold meegerekend; de ondergrens van het scherm is 0,82 maal die slag
function panTravel(l) {
  const w = l.za - l.zb, zc = (l.za + l.zb) / 2, ze = zc - l.steps * w + l.hold;
  return Math.hypot(zc - ze, panP(zc, 0, l.lev)[1] - panP(ze, 0, l.lev)[1]);
}
// hold: de stapel stopt zoveel meter voor de cassette, zodat de greep en de rand van de stapel aan de achterrand van de opening zichtbaar blijven (van binnen te zien dat het scherm open is).
function panScreen(z0, z1, n, level, hold = 0) {
  const w = (z0 - z1) / n, out = [];
  for (let i = 0; i < n; i++) {
    const za = z0 - i * w, zb = za - w, steps = n - 1 - i, lev = level + 0.0012 * i, zc = (za + zb) / 2;
    out.push({ i, za, zb, lev, steps, hold, open: steps ? panFollow(zc, zc - steps * w + hold, lev) : null });
  }
  return out;
}
// camera bij openen: ver weg, schuin van opzij en van boven, met het hele panoramadak en de dakrails als context (kader in de eindstand)
const panLook = { dir: [0.6, 1, -0.3], nodes: ['Panoramadak', 'Dakrail links', 'Dakrail rechts'] };
// camera van de zonneschermen: van binnen, op de middenlijn tussen de hoofdsteunen, omhoog naar het dak (het glas is van buiten zo goed als zwart, een open
// scherm is er alleen van binnen te zien). De inpassing zet de camera op het kader van de genoemde onderdelen in de eindstand, op afstand dir vanaf het midden:
// voor het voorste scherm de greep aan de achterrand van de opening en het lamphuis onder de voorrand (camera achter in de cabine, vanaf de achterbank),
// voor het achterste scherm de lamellen en de greep (camera tussen de voorstoelen, kijkt naar achteren en omhoog)
const panLookScrF = { dir: [0, -0.35, -0.94], nodes: ['Schermgreep voor', 'Lamphuis voor'] };
const panLookScrR = { dir: [0, -0.5, 0.87], nodes: ['Schermdoek achter 1', 'Schermgreep achter'] };
// bouwt het hele panoramadak als groep
function buildPanorama() {
  /* ---- schuifglas voor: kantelen aan de achterrand (0,045 m), dan over de dakkromming 0,60 m naar achteren ---- */
  const tiltAng = Math.asin(0.045 / (PAN_GF[0] - PAN_GF[1]));
  // schuiven: de voorrand gaat van z 0,20 naar z -0,40 (0,60 m), 4 cm boven het dak; de draaiing volgt het hellingverschil van het dak
  const gl = 0.0025, Ls = PAN_GF[0] - PAN_GF[1];
  const aStart = Math.atan((panP(PAN_GF[0], 0)[1] - panP(PAN_GF[1], 0)[1]) / Ls) - tiltAng, aEnd = Math.atan((panP(-0.40, 0)[1] - panP(-1.10, 0)[1]) / 0.70);
  const glassArc = panArc([PAN_GF[0], panP(PAN_GF[0], 0, gl)[1]], [-0.40, panP(-0.40, 0, gl + 0.04)[1]], aStart - aEnd);
  const glassF = A('Glaspaneel voor', { d: 'Beweegbaar voorste glaspaneel van het panoramadak. Kantelt eerst met de achterrand 4,5 cm omhoog (stand A) en schuift dan 0,60 m naar achteren boven het vaste achterste paneel (stand B tot D, afstanden geschat). Het zonnescherm moet eerst open.', ex: [0, 0.22, 0.1],
    open: { type: 'slide', label: 'Schuifdak', min: 0.48, needs: 'Zonnescherm voor', tilt: { pivot: [0, panP(PAN_GF[0], 0)[1], PAN_GF[0]], axis: [1, 0, 0], angle: tiltAng, part: 0.2 }, arc: { pivot: glassArc.pivot, axis: glassArc.axis, angle: glassArc.angle },
      look: panLook } }, panGlass(PAN_GF[0], PAN_GF[1], 'voor', 'voorste'));
  const glassR = A('Glaspaneel achter', { d: 'Vast achterste glaspaneel van het panoramadak, op de dakplaat gelijmd. Ligt boven de achterbank; het schuifglas schuift er in open stand overheen.', ex: [0, 0.2, -0.1] }, panGlass(PAN_GR[0], PAN_GR[1], 'achter', 'achterste'));
  /* ---- dwarsbalk, omlijsting, afdichtingen, frame en rails ---- */
  // golf 8 ronde 3 (kierenaudit): bovenkant op 5,5 mm, gelijk met de keramische rand van de glaspanelen (glas 5 mm plus 0,5 mm frit). Op
  // 6,5 mm stond de balk 1,3 mm boven de frit (schuifdaknaad, stap hooguit 1 mm) en 6,5 mm boven de dakplaat aan de uiteinden (lijst, hooguit 6 mm)
  const bar = P('Dwarsbalk', panSlab(PAN_OF[1], PAN_OR[0], -PAN_XR, PAN_XR, 0.0008, 0.0055, 2, 14), MAT.bodPanoBar, { d: 'Dwarsbalk tussen de twee glaspanelen, van buiten donker; huisvest de schermcassette van het voorste scherm (vorm geschat).', ex: [0, 0.2, 0] });
  // golf 8 (kierenaudit): de achterste omlijsting ligt met de bovenkant op 5 mm, gelijk met het vaste glas (was 3 mm: trede van 2,5 mm
  // tussen keramische rand en omlijsting langs de zijranden). Golf 8 ronde 2: de voorste ook (bleef op 3 mm omdat het glas daar kantelt en
  // schuift; de omlijsting ligt naast en voor het glas, de opentest bewaakt de beweging)
  // voor = false laat de voorste dwarsstrook weg (golf 8 ronde 2): bij de achterste opening lag die strook (z -0,58 tot -0,56) binnen de
  // dwarsbalk (z -0,58 tot -0,50), twee vlakken op elkaar die door elkaar heen flikkerden
  // golf 8 ronde 3: de zijstroken met 36 stations in z en drie vakken over de breedte (was 14 en een): vooraan, waar het dak naar de
  // voorruit buigt, zakte de koorde tussen twee stations (5 cm) tot 0,9 mm onder de hoogte van de omlijsting en was de trede tegen de
  // keramische rand van het schuifglas 1,05 mm (grens 1)
  // achter = false laat de achterste dwarsstrook weg (golf 8 ronde 3): bij de voorste opening lag die (z -0,52 tot -0,50) helemaal in de
  // dwarsbalk (clash 2,8 mm), net als de voorste strook van de achterste opening
  const ring = (z0, z1, l1 = 0.003, voor = true, achter = true) => merge([panSlab(z1, z0, PAN_X, PAN_XR, 0.0008, l1, 36, 3), panSlab(z1, z0, -PAN_XR, -PAN_X, 0.0008, l1, 36, 3),
    ...(voor ? [panSlab(z0, z0 + 0.02, -PAN_XR, PAN_XR, 0.0008, l1, 1, 14)] : []), ...(achter ? [panSlab(z1 - 0.02, z1, -PAN_XR, PAN_XR, 0.0008, l1, 1, 14)] : [])]);
  const trimF = P('Omlijsting opening voor', ring(PAN_OF[0], PAN_OF[1], 0.005, true, false), MAT.bodPillar, { d: 'Zwarte kunststof omlijsting (sierlijst) rond de voorste dakopening, zonder chroom (breedte geschat).', ex: [0, 0.18, 0.05] });
  const trimR = P('Omlijsting opening achter', ring(PAN_OR[0], PAN_OR[1], 0.005, false), MAT.bodPillar, { d: 'Zwarte kunststof omlijsting (sierlijst) rond de achterste dakopening.', ex: [0, 0.18, -0.05] });
  // donkere binnenlijst: een smalle zwarte kunststof lijst die net binnen de afwerkring van de hemel (interior.js, rand van de hemelopening op |x| 0,45) rondom
  // de opening ligt, 3,3 cm onder het dakvlak en daarmee onder de zonneschermen; van binnen leest de opening zo rondom als een donkere omlijsting
  const liner = (z0, z1) => merge([panBand(z0, z1, 0.446, 0.426, -0.033, 6, 1), panBand(z0, z1, -0.446, -0.426, -0.033, 6, 1),
    panBand(z0 - 0.002, z0 - 0.014, -0.446, 0.446, -0.033, 1, 8), panBand(z1 + 0.014, z1 + 0.002, -0.446, 0.446, -0.033, 1, 8)]);
  const linerF = P('Binnenlijst opening voor', liner(0.2, -0.48), MAT.bodPillar, { d: 'Zwarte kunststof lijst rondom de voorste dakopening aan de binnenkant, net binnen de afwerkring van de hemel; verbergt de rand van het zonnescherm en de rubbers (breedte geschat).', ex: [0, -0.1, 0.04] });
  const linerR = P('Binnenlijst opening achter', liner(-0.6, -1.09), MAT.bodPillar, { d: 'Zwarte kunststof lijst rondom de achterste dakopening aan de binnenkant, net binnen de afwerkring van de hemel (breedte geschat).', ex: [0, -0.1, -0.04] });
  const sealF = P('Afdichting opening voor', tube(panLoop(PAN_OF[0] - 0.012, PAN_OF[1] + 0.012, PAN_X + 0.012, -0.001, 8), 0.0045, 80, 6, true), MAT.rubber, { d: 'Rubber afdichting rond de voorste opening waarop het schuifglas dichtligt.', ex: [0, 0.1, 0.04] });
  // golf 8 ronde 2: het rubber ligt 4,5 mm onder het dakvlak (was 1 mm), met de bovenkant op het dakvlak en onder de omlijsting (0,8 mm);
  // het stak 3,5 mm boven het dak uit, door de omlijsting heen
  const sealR = P('Afdichting opening achter', tube(panLoop(PAN_OR[0] - 0.012, PAN_OR[1] + 0.012, PAN_X + 0.012, -0.0045, 8), 0.0045, 80, 6, true), MAT.rubber, { d: 'Rubber afdichting rond de achterste opening waarop het vaste glas rust.', ex: [0, 0.1, -0.04] });
  const frame = P('Dakframe', merge([
    ...[PAN_OF, PAN_OR].map(([z0, z1]) => merge([panSlab(z1, z0, PAN_XO, 0.545, -0.0285, -0.0215, 14, 1), panSlab(z1, z0, -0.545, -PAN_XO, -0.0285, -0.0215, 14, 1),
      panSlab(z0, z0 + 0.03, -0.545, 0.545, -0.0285, -0.0215, 1, 14), panSlab(z1 - 0.03, z1, -0.545, 0.545, -0.0285, -0.0215, 1, 14)]))]),
    MAT.darkSteel, { d: 'Stalen frame onder de dakplaat rond de twee openingen waaraan afdichtingen, goten en rails zijn bevestigd (vorm geschat).', ex: [0, -0.12, 0] });
  const rail = s => P(`Geleiderail ${s > 0 ? 'links' : 'rechts'}`, merge([panSlab(PAN_GF[1], PAN_GF[0], s * 0.495, s * 0.53, -0.027, -0.018, 20, 1), panSlab(PAN_GF[1], PAN_GF[0], s * 0.53, s * 0.54, -0.027, -0.006, 20, 1)]), MAT.bodPillar, { d: 'Zwarte geleiderail langs de opening waarin de schuifschoenen van het voorste glas lopen; kunststof glijders slijten het eerst (dat geeft geluid en speling).', ex: [s * 0.16, -0.1, 0] });
  /* ---- luchtgeleider (volger van het schuifglas, 0,04 m omhoog) ---- */
  // blad zo breed als de dakopening (x plus en min 0,50), op de voorrand van het frame; armen met scharnierpennen aan de uiteinden houden hem vast
  const DEF_Z = PAN_OF[0], DEF_X = 0.497;
  const defBlade = P('Luchtgeleiderblad', merge([0, 1, 2, 3].map(i => panSlab(DEF_Z - 0.006 * i - 0.001, DEF_Z - 0.006 * i - 0.005, -DEF_X, DEF_X, 0.0005, 0.004 + 0.002 * i, 1, 10))), MAT.bodPillar, { d: 'Zwart lamellennet over de volle breedte van de opening, op de voorrand van het dakframe; vangt de wind boven het open dak (vorm geschat).', ex: [0, 0.2, 0.08] });
  const defArms = P('Armen luchtgeleider', merge([1, -1].flatMap(sg => [
    rodBetween(panP(DEF_Z - 0.09, sg * 0.486, -0.006), panP(DEF_Z - 0.012, sg * 0.486, 0.0105), 0.0035, 8),
    xf(G.cyl('x', 0.0055, 0.0055, 0.022, 10), panP(DEF_Z - 0.09, sg * 0.486, -0.006)),
    xf(G.cyl('x', 0.0045, 0.0045, 0.022, 10), panP(DEF_Z - 0.012, sg * 0.486, 0.0105))])), MAT.darkSteel, { d: 'Twee veerarmpjes met scharnierpennen aan de uiteinden van het blad; ze liggen in de rail en tillen het blad op als het schuifdak opent (vorm geschat).', ex: [0, 0.14, 0.08] });
  const deflector = A('Luchtgeleider', { d: 'Windgeleider aan de voorrand van de dakopening: een zwart lamellennet op twee veerarmpjes dat omhoog komt als het schuifdak opent, tegen windgeruis (vorm geschat).', ex: [0, 0.2, 0.08],
    open: { type: 'slide', move: [0, 0.04, 0], min: 0.03, follow: 'Glaspaneel voor' } }, [defBlade, defArms]);
  /* ---- zonneschermen: lamellen die naar de cassette schuiven ---- */
  const screen = (nm, z0, z1, n, level, cassZ, hold, look) => {
    const lam = panScreen(z0, z1, n, level, hold);
    // golf 5l ronde 3: elke lamel is een dun doek (een vlak, geen plaatje met randen van 1 mm) en loopt (behalve de eerste) 5 mm over de vorige
    // door (hij ligt 1,2 mm hoger). De belichte randen en de kiertjes naar het lichte glas lazen van binnen als contrastrijke lichte lijnen
    const strip = l => panBand(l.zb, l.za + (l.i > 0 ? 0.005 : 0), -0.435, 0.435, l.lev - 0.0005, 1, 8);
        const lead = lam[0];
    const leader = A(`Zonnescherm ${nm}`, { d: `Handbediend rolgordijn onder het ${nm}e glaspaneel, in dit model een stapel lamellen die in de cassette schuift (schematisch). Met de greep in hemelkleur open of dicht; het dak werkt alleen met geopend scherm.`, ex: [0, -0.12, nm === 'voor' ? 0.1 : -0.1],
      open: { ...lead.open, min: 0.82 * panTravel(lead), label: `Zonnescherm ${nm}`, look } }, [
      P(`Schermdoek ${nm} 1`, strip(lead), MAT.fabric, { d: 'Eerste lamel van het zonnescherm, met de greep.', ex: [0, -0.04, 0] }),
      // greep in hemelkleur (golf 5n ronde 2, foto van het dak binnen): zwart las hij als donker vlak in de lichte middenbalk
      P(`Schermgreep ${nm}`, G.rbox(0.08, 0.006, 0.018, 0.003), MAT.fabric, { d: 'Kleine lichtgrijze greep in hemelkleur onder de voorrand van het zonnescherm om het te openen en te sluiten; blijft bij een geopend scherm aan de achterrand van de opening zichtbaar, net voor de afwerkring.', p: panP(lead.za - 0.0045, 0, lead.lev - 0.0035), ex: [0, -0.06, 0] }),
    ]);
    const rest = lam.slice(1).map(l => P(`Schermdoek ${nm} ${l.i + 1}`, strip(l), MAT.fabric, { d: l.steps ? 'Lamel van het zonnescherm; schuift naar de cassette en stapelt zich daar.' : 'Laatste lamel van het zonnescherm, vast in de cassette (de rol).', ex: [0, -0.05, 0],
      open: l.steps ? { ...l.open, follow: `Zonnescherm ${nm}` } : undefined }));
    const zc0 = cassZ[0], zc1 = cassZ[1];
    const cass = P(`Schermcassette ${nm}`, merge([panSlab(zc1, zc0, -0.49, 0.49, -0.0295, -0.027, 2, 10), panSlab(zc1, zc1 + 0.004, -0.49, 0.49, -0.027, -0.008, 1, 10), panSlab(zc1, zc0, 0.486, 0.49, -0.027, -0.008, 2, 1), panSlab(zc1, zc0, -0.49, -0.486, -0.027, -0.008, 2, 1)]), MAT.bodPanoCass, { d: `Cassette (rolhuis) van het ${nm}e zonnescherm, bekleed in een iets donkerder tint dan de hemel; het scherm schuift er onder in (vorm geschat).`, ex: [0, -0.1, 0] });
    return [leader, ...rest, cass];
  };
  const scrF = screen('voor', 0.165, -0.58, 8, -0.0165, [-0.50, -0.60], 0.0465, panLookScrF);
  const scrR = screen('achter', -0.61, -1.17, 6, -0.0185, [-1.11, -1.19], 0.03, panLookScrR);
  /* ---- motor, kabelboom, waterafvoer ---- */
  // golf 8 ronde 2: motorhuis en wormas volgen de helling van het dak (hier ruim 19 graden naar de voorruit en dwars een paar graden
  // naar buiten); vlak liggend stak de voorste rand van het huis 0,8 mm en de wormas 1,5 mm door de dakplaat.
  // Golf 8 ronde 3: tussen de voorste dwarsstrook van de afvoergoot (tot 8,5 mm onder het dak) en die van het dakframe (vanaf 21,5 mm) is
  // 13 mm ruimte; het huis van 16 mm stak 3,3 mm in de goot en 2,2 mm in het frame, de wormas 1,3 en 0,5 mm. Nu 11 mm hoog (motor
  // diameter 11 mm, wormas 10 mm) op 15 mm onder het dak, midden in die ruimte; van buiten en van binnen niet te zien (tussen dak en hemel)
  const mtZ = 0.255, mtX = 0.3, mtL = -0.015, mtRx = Math.atan((panP(mtZ - 0.02, mtX)[1] - panP(mtZ + 0.02, mtX)[1]) / 0.04),
    mtRz = -Math.atan((panP(mtZ, mtX - 0.03)[1] - panP(mtZ, mtX + 0.07)[1]) / 0.1);
  const motor = A('Dakmotor', { d: 'Elektromotor (aandrijving met wormwiel) van het schuifdak, naast de rail voorin (Webasto op een onderzocht exemplaar van fase 1; plaats geschat). Anti-klem: stopt en zet enkele centimeters terug als het glas weerstand voelt.', ex: [0.1, -0.1, 0.2] }, [
    P('Motorhuis dakmotor', merge([xf(G.rbox(0.06, 0.011, 0.04, 0.004), [0, 0, 0]), xf(G.cyl('x', 0.0055, 0.0055, 0.07, 14), [0.065, 0.0, 0])]), MAT.darkSteel, { d: 'Motor met overbrengingskast op de plaatstrook voor het schuifglas (plaats geschat).', p: panP(mtZ, mtX, mtL), r: [mtRx, 0, mtRz], ex: [0.06, -0.04, 0] }),
    P('Wormwiel dakmotor', G.cyl('z', 0.005, 0.005, 0.05, 10), MAT.steel, { d: 'Wormas die de schuifkabels aandrijft.', p: panP(mtZ, 0.36, mtL), r: [mtRx, 0, 0], ex: [0.1, 0, 0.05] }),
  ]);
  const harness = P('Kabelboom dakmotor', tube([panP(0.255, 0.27, -0.0145), panP(0.255, 0.15, -0.0145), panP(0.255, 0.05, -0.0145), panP(0.255, 0.0, -0.0145)], 0.0035, 16, 5), MAT.rubber, { d: 'Kabelboom van de dakmotor langs de voorste dakstrook naar de hemelconsole.', ex: [0, -0.1, 0.1] });
  const hose = (pts, nm, s) => P(`Afvoerslang ${nm}`, tube(pts, 0.006, 40, 6), MAT.rubber, { d: 'Afvoerslang die regenwater uit de goot van het dakframe door de stijl naar de wielkast leidt (verloop geschat).', ex: [s * 0.1, -0.1, 0] });
  const pillar = (z, q, s, dy) => { const h = bodGhHalf(z, q); return [s * (h[0] - 0.026), h[1] - 0.028 + dy, z]; };
  // voorste slang (golf 5l ronde 2): in de A-stijl ligt hij tegen de stijl, het hart 7,5 mm binnen het plaatwerk (straal 6 mm) op het punt van de
  // stijl dat het dichtst bij het oude verloop ligt; zo hoeft de A-stijlbekleding er niet meer omheen te bollen
  const hug = (z, q, s, dy) => { const o = pillar(z, q, 1, dy); let qb = q, db = Infinity;
    for (let k = 0; k <= 160; k++) { const qq = 0.40 + 0.4 * k / 160, h = bodGhHalf(z, qq), dd = (h[0] - o[0]) ** 2 + (h[1] - o[1]) ** 2; if (dd < db) { db = dd; qb = qq; } }
    const h0 = bodGhHalf(z, qb), h1 = bodGhHalf(z, qb + 0.004), tl = Math.hypot(h1[0] - h0[0], h1[1] - h0[1]), n = [-(h1[1] - h0[1]) / tl, (h1[0] - h0[0]) / tl], sg = n[0] > 0 ? -1 : 1;
    return [s * (h0[0] + sg * n[0] * 0.0075), h0[1] + sg * n[1] * 0.0075, z]; };
  const hoses = [1, -1].flatMap(s => [
    hose([panP(0.205, s * 0.535, -0.006), panP(0.27, s * 0.585, -0.03), hug(0.4, 0.68, s, 0), hug(0.62, 0.66, s, -0.04), hug(0.85, 0.65, s, -0.12)], `voor ${s > 0 ? 'links' : 'rechts'}`, s),
    hose([panP(-1.095, s * 0.535, -0.006), panP(-1.13, s * 0.585, -0.03), pillar(-1.17, 0.68, s, -0.02), pillar(-1.2, 0.66, s, -0.1), pillar(-1.23, 0.64, s, -0.2)], `achter ${s > 0 ? 'links' : 'rechts'}`, s)]);
  const gutter = (z0, z1, nm) => P(`Afvoergoot ${nm}`, merge([panSlab(z1, z0, 0.545, 0.575, -0.0085, -0.0005, 14, 1), panSlab(z1, z0, -0.575, -0.545, -0.0085, -0.0005, 14, 1), panSlab(z0, z0 + 0.04, -0.575, 0.575, -0.0085, -0.0005, 1, 16), panSlab(z1 - 0.04, z1, -0.575, 0.575, -0.0085, -0.0005, 1, 16)]), MAT.plastic, { d: `Kunststof afvoergoot rond de ${nm}e opening; vangt water dat langs de afdichting komt en voert het naar de afvoerslangen op de vier hoeken.`, ex: [0, -0.1, nm === 'voor' ? 0.06 : -0.06] });
  const water = A('Waterafvoer', { d: 'Twee goten rond de dakopeningen en vier afvoerslangen door de stijlen. Verstopte afvoeren zijn een bekend probleem bij panoramadaken (schematisch weergegeven, verloop geschat).', ex: [0, -0.2, 0] }, [gutter(PAN_OF[0] + 0.01, PAN_OF[1], 'voor'), gutter(PAN_OR[0], PAN_OR[1] - 0.01, 'achter'), ...hoses]);
  return A('Panoramadak', { d: 'Elektrisch panoramadak (optie): twee glaspanelen in de dakplaat, een beweegbaar (kantelt en schuift over het vaste paneel) en een vast, met dwarsbalk, frame en rails, twee handbediende zonneschermen, luchtgeleider, motor, afdichtingen en waterafvoer. Maten en opbouw zijn geschat uit foto\'s en de catalogustekening (schematisch).', ex: [0, 0.4, 0] },
    [glassF, glassR, bar, trimF, trimR, linerF, linerR, sealF, sealR, frame, rail(1), rail(-1), deflector, ...scrF, ...scrR, motor, harness, water]);
}

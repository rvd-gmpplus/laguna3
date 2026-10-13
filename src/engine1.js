/* ===================== motor F4Rt 811: maten, aansluitpunten, blok, krukmechanisme, cilinderkop ===================== */
// Motorframe: oorsprong op de krukas-as, x langs de krukas (+x = vliegwiel- en versnellingsbakzijde = links in de auto),
// y langs de cilinderas omhoog, z naar de inlaatzijde (die naar de voorkant van de auto wijst).
// Renault telt cilinder, hoofdlager en kruktap 1 vanaf de vliegwielzijde; XC[0] is dus cilinder 1.
const XC = [0.132, 0.044, -0.044, -0.132];           // cilinderhartlijnen 1..4 (steek 88 mm, geschat)
const XM = [0.176, 0.088, 0, -0.088, -0.176];        // hoofdlagers 1..5
const DECK = 0.222, BORE_R = 0.04135, THROW = 0.0465, ROD = 0.144;
const ENG_GASKET = 0.00065, ENG_HEAD_H = 0.13815;    // koppakking geklemd 0,65 mm, kophoogte 138,15 mm
const CAMY = DECK + ENG_GASKET + ENG_HEAD_H;          // nokkenasas in het deelvlak kop / lagerbrug
const CAMZ = 0.064;
const PIN_UP = [1, -1, -1, 1];                        // krukpennen 1/4 boven, 2/3 onder
const ENG_MJ_R = 0.0274, ENG_PIN_R = 0.024;           // hoofdlagertap Ø54,8, krukpen Ø48
const ENG_CAM_RB = 0.0165, ENG_ROLL_R = 0.0085;
const ENG_BRIDGE_T = 0.024, ENG_COVER_Y = CAMY + ENG_BRIDGE_T + 0.001, ENG_COVER_H = 0.04;
const ENG_COVER_TOP = ENG_COVER_Y + ENG_COVER_H;
const XT = -0.245, XA = -0.345;                       // vlak van distributieriem en multiriem
const ENG_TURBO = [0.07, 0.14, -0.255];               // hartlijn turbo-as (lagerhuis)
const ENG_TB = [-0.236, 0.14, 0.21];                  // gasklephuis (as van de doorlaat langs x)
const ENG_RAIL = [0, 0.35, 0.165];
const ENG_VIN = { L: 0.1101, rh: 0.01675, rs: 0.002735, th: 0.31 };   // inlaatklep Ø33,5 / steel 5,47 / 110,08
const ENG_VEX = { L: 0.1069, rh: 0.0145, rs: 0.0027235, th: 0.32 };   // uitlaatklep Ø29 / steel 5,447 / 106,87

// Aansluitpunten in het motorframe. systems.js sluit slangen en leidingen hierop aan.
// Contract: de sleutels blijven bestaan; p = punt, dir = richting waarin een slang of pijp de aansluiting verlaat.
const ENG_PORTS = {
  turbineOut: { p: [ENG_TURBO[0] - 0.087, ENG_TURBO[1], ENG_TURBO[2]], dir: [-1, 0, 0] },      // uitlaatflens turbine (voorkat, 3 moeren)
  compIn: { p: [ENG_TURBO[0] + 0.1, ENG_TURBO[1], ENG_TURBO[2]], dir: [1, 0, 0] },            // compressorinlaat (aanzuigslang luchtfilter)
  compOut: { p: [ENG_TURBO[0] + 0.055, ENG_TURBO[1] + 0.078, ENG_TURBO[2] - 0.036], dir: [0, 1, 0] }, // compressoruitlaat naar intercooler
  throttleIn: { p: [ENG_TB[0] - 0.026, ENG_TB[1], ENG_TB[2]], dir: [-1, 0, 0] },              // ingang gasklephuis (koude laadlucht)
  thermostatOut: { p: [0.252, 0.358, 0.04], dir: [0, 1, 0] },                                   // waterstuk naar bovenste radiateurslang
  waterPumpIn: { p: [-0.155, 0.0, 0.158], dir: [0, 0, 1] },                                     // aanvoerstomp waterpomp (onderste radiateurslang)
  fuelRailIn: { p: [0.205, ENG_RAIL[1] - 0.044, ENG_RAIL[2]], dir: [0, -1, 0] },                              // snelkoppeling brandstofrail
};
// punt op afstand d buiten een aansluiting, langs dir (motorframe)
function portAt(port, d = 0) { return [port.p[0] + port.dir[0] * d, port.p[1] + port.dir[1] * d, port.p[2] + port.dir[2] * d]; }

std('engFoam', 0x46484a, 0, 0.98);

/* ---------- kleine hulpen (motor) ---------- */
function engNut(d, h, ax = 'y') { return cache(`engNut${d}|${h}|${ax}`, () => yTo(new THREE.CylinderGeometry(d * 0.92, d * 0.92, h, 6), ax)); }
function engStud(len, d, ax = 'y') { return cache(`engStud${len}|${d}|${ax}`, () => yTo(new THREE.CylinderGeometry(d / 2, d / 2, len, 8), ax)); }
// tapeind met moer: tapeind gecentreerd op de oorsprong, moer op +as (bij afstand 'at')
function engStudNut(len, d, at, ax = 'y') {
  return cache(`engStudNut${len}|${d}|${at}|${ax}`, () => {
    const s = new THREE.CylinderGeometry(d / 2, d / 2, len, 8), n = new THREE.CylinderGeometry(d * 0.92, d * 0.92, d * 0.8, 6); n.translate(0, at, 0);
    return yTo(merge([s, n]), ax);
  });
}
// schroefveer met weinig segmenten (klepveren, 16 stuks)
function engSpring(R, wire, h, turns) {
  return cache(`engSp${R}|${wire}|${h}|${turns}`, () => {
    const pts = [], N = Math.ceil(turns * 10);
    for (let i = 0; i <= N; i++) { const t = i / N, a = t * turns * PI * 2; pts.push(V3(R * Math.cos(a), t * h - h / 2, R * Math.sin(a))); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, wire, 4, false);
  });
}
function engORing(R, r, ax = 'y') { return G.torus(ax, R, r, 20, 5); }
// halve ring (bovenste helft in het motorframe) rond de x-as
function engHalfRing(rIn, rOut, t, key) {
  return cache('engHalf' + key, () => yTo(new THREE.LatheGeometry([[rIn, -t / 2], [rOut, -t / 2], [rOut, t / 2], [rIn, t / 2], [rIn, -t / 2]].map(p => new THREE.Vector2(...p)), 20, PI, PI), 'x'));
}
// convexe veelhoek begrenzen tot de band y0 <= y <= y1
function engClip(poly, y0, y1) {
  const cut = (pts, keep, y) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], ia = keep(a[1]), ib = keep(b[1]);
      if (ia) out.push(a);
      if (ia !== ib) { const t = (y - a[1]) / (b[1] - a[1]); out.push([a[0] + t * (b[0] - a[0]), y]); }
    }
    return out;
  };
  return cut(cut(poly, v => v >= y0, y0), v => v <= y1, y1);
}
// Riem langs poelies in het (z,y)-vlak met de breedte langs x. pulleys: [z, y, r, s] in looprichting;
// s = +1: poelie binnen de lus, s = -1: rol tegen de rug van de riem. Geeft { geo, len }.
function engBelt(pulleys, w, t, step = 0.08) {
  const R = pulleys.map(([z, y, r, s]) => [z, y, s * (r + t / 2)]), n = R.length, tang = [];
  for (let i = 0; i < n; i++) {
    const [z1, y1, p1] = R[i], [z2, y2, p2] = R[(i + 1) % n];
    const dist = Math.hypot(z2 - z1, y2 - y1), a = Math.atan2(y2 - y1, z2 - z1) - Math.asin((p2 - p1) / dist);
    const L = [-Math.sin(a), Math.cos(a)];
    tang.push([[z1 - p1 * L[0], y1 - p1 * L[1]], [z2 - p2 * L[0], y2 - p2 * L[1]]]);
  }
  const pts = []; let len = 0;
  for (let i = 0; i < n; i++) {
    const [z, y, p] = R[i], pin = tang[(i + n - 1) % n][1], pout = tang[i][0];
    const a0 = Math.atan2(pin[1] - y, pin[0] - z), a1 = Math.atan2(pout[1] - y, pout[0] - z);
    const sw = p > 0 ? ((a1 - a0) % (2 * PI) + 2 * PI) % (2 * PI) : -(((a0 - a1) % (2 * PI) + 2 * PI) % (2 * PI));
    const k = Math.max(2, Math.ceil(Math.abs(sw) / step)), ar = Math.abs(p);
    for (let j = 0; j <= k; j++) { const a = a0 + sw * j / k; pts.push([z + ar * Math.cos(a), y + ar * Math.sin(a)]); }
    len += Math.abs(sw) * ar + Math.hypot(tang[i][1][0] - pout[0], tang[i][1][1] - pout[1]);
  }
  // strook met rechthoekige doorsnede
  const pos = [], nor = [], idx = [], N = pts.length;
  const norm = i => { const a = pts[(i + N - 1) % N], b = pts[(i + 1) % N]; const dz = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dz, dy) || 1; return [-dy / l, dz / l]; };
  let v = 0;
  for (let f = 0; f < 4; f++) {
    for (let i = 0; i <= N; i++) {
      const q = pts[i % N], L = norm(i % N);
      const corners = f === 0 ? [[1, 1], [1, -1]] : f === 1 ? [[1, -1], [-1, -1]] : f === 2 ? [[-1, -1], [-1, 1]] : [[-1, 1], [1, 1]];
      for (const [so, sx] of corners) {
        pos.push(sx * w / 2, q[1] + L[1] * so * t / 2, q[0] + L[0] * so * t / 2);
        if (f === 0) nor.push(0, L[1], L[0]); else if (f === 2) nor.push(0, -L[1], -L[0]); else if (f === 1) nor.push(-1, 0, 0); else nor.push(1, 0, 0);
      }
      if (i < N) { const b = v + i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    v += (N + 1) * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return { geo: g, len };
}

/* ---------- motorblok ---------- */
function blockGeo() {
  const L = [];
  // bovendeel met boringen (cilinderwanden), y 0,06 .. dek
  const s = shapeOf(rrectPts(0.43, 0.21, 0.02));
  XC.forEach(x => s.holes.push(circlePath(x, 0, BORE_R + 0.0005)));
  const hu = DECK - 0.06, up = plan(s, hu); up.translate(0, 0.06 + hu / 2, 0); L.push(up);
  // carterwand (diepe rok tot y -0,06) als open ring
  const sk = shapeOf(rrectPts(0.43, 0.21, 0.02)); sk.holes.push(new THREE.Path(rrectPts(0.396, 0.176, 0.012).map(p => new THREE.Vector2(p[0], p[1]))));
  const skirt = plan(sk, 0.12); L.push(skirt);
  // lagerstoelen (bovenste helft van de hoofdlagers zit in het blok)
  XM.forEach(x => {
    const pts = [[-0.088, 0]]; for (let k = 0; k <= 12; k++) { const a = PI - k / 12 * PI; pts.push([0.0298 * Math.cos(a), 0.0298 * Math.sin(a)]); }
    pts.push([0.088, 0], [0.088, 0.062], [-0.088, 0.062]);
    L.push(xf(side(shapeOf(pts), 0.022), [x, 0, 0]));
  });
  // ribben, opnames voor oliekoeler/filter, klopsensor, krukassensor en waterpompstomp
  [-0.19, -0.088, 0, 0.088, 0.19].forEach(x => { L.push(xf(G.box(0.012, 0.16, 0.01), [x, 0.03, 0.109])); L.push(xf(G.box(0.012, 0.16, 0.01), [x, 0.03, -0.109])); });
  L.push(xf(G.cyl('z', 0.046, 0.046, 0.008, 24), [0.03, 0.015, 0.108]));
  L.push(xf(G.cyl('z', 0.014, 0.014, 0.006, 12), [0, 0.11, 0.106]));
  L.push(xf(G.cyl('z', 0.012, 0.012, 0.008, 12), [0.192, -0.03, -0.107]));
  L.push(xf(G.box(0.12, 0.05, 0.012), [0.08, 0.15, -0.108]));
  return merge(L);
}
function engMainBearing(i) {
  const x = XM[i];
  const cap = cache('engMainCap', () => {
    const pts = [[-0.05, 0], [-0.05, -0.05], [-0.04, -0.062], [0.04, -0.062], [0.05, -0.05], [0.05, 0], [0.0298, 0]];
    for (let k = 1; k < 12; k++) { const a = -k / 12 * PI; pts.push([0.0298 * Math.cos(a), 0.0298 * Math.sin(a)]); }
    pts.push([-0.0298, 0]);
    return side(shapeOf(pts), 0.022);
  });
  const kids = [
    P(`Hoofdlagerkap ${i + 1}`, cap, MAT.iron, { d: `Losse gietijzeren lagerkap van hoofdlager ${i + 1}; houdt samen met de lagerstoel in het blok de krukas vast.`, ex: [0, -0.06, 0] }),
    P('Lagerschaal boven', G.half('x', 0.0294, 0.02, PI), MAT.bearing, { d: 'Bovenste hoofdlagerschaal in het blok, met oliegroef en oliegat.', ex: [0, 0.035, 0] }),
    P('Lagerschaal onder', G.half('x', 0.0294, 0.02, 0), MAT.bearing, { d: 'Onderste, gladde hoofdlagerschaal in de lagerkap.', ex: [0, -0.03, 0] }),
    P('Lagerkapbout voor', hexBolt(0.09, 0.011), MAT.darkSteel, { d: 'Bout van de hoofdlagerkap; wordt bij elke montage vervangen.', p: [0, -0.062, 0.038], ex: [0, -0.15, 0] }),
    P('Lagerkapbout achter', hexBolt(0.09, 0.011), MAT.darkSteel, { d: 'Bout van de hoofdlagerkap; wordt bij elke montage vervangen.', p: [0, -0.062, -0.038], ex: [0, -0.15, 0] }),
  ];
  if (i === 1) {
    const tw = engHalfRing(0.03, 0.044, 0.0024, 'Thrust');
    kids.push(P('Aanloopring vliegwielzijde', tw, MAT.bearing, { d: 'Halve aanloopring (axiaallager) naast hoofdlager 2; bepaalt de axiale speling van de krukas. Dikte 2,30 tot 2,45 mm in stappen van 0,05 mm.', p: [0.0122, 0, 0], ex: [0.035, 0.02, 0] }));
    kids.push(P('Aanloopring distributiezijde', tw, MAT.bearing, { d: 'Halve aanloopring aan de andere kant van hoofdlager 2.', p: [-0.0122, 0, 0], ex: [-0.035, 0.02, 0] }));
  }
  return A(`Hoofdlager ${i + 1}`, { d: `Hoofdlager ${i + 1} (geteld vanaf de vliegwielzijde): lagerkap, twee schalen en twee bouten${i === 1 ? ', plus de twee aanloopringen' : ''}.`, p: [x, 0, 0], ex: [0, -0.22, 0], spec: i === 1 ? [['Aanloopringen', '2,30 tot 2,45 mm']] : null }, kids);
}
function buildBlock() {
  const jet = cache('engJet', () => merge([G.box(0.016, 0.008, 0.018), tube([[0, 0.004, 0], [0, 0.02, 0.006], [0, 0.04, 0.01]], 0.0022, 8, 6), xf(hexBolt(0.016, 0.006), [0, -0.004, -0.004], [PI, 0, 0])]));
  const jets = XC.map((x, i) => P(`Oliespuiter ${i + 1}`, jet, MAT.steel, { d: `Oliespuiter onder cilinder ${i + 1} met zijn bevestigingsbout: spuit olie tegen de onderkant van de zuiger om die te koelen; terugslagveer in de spuitermond (schematisch weergegeven).`, p: [x + 0.03, 0.056, -0.062], ex: [0, -0.05, -0.02] }));
  const plug = cache('engFreeze', () => G.lathe('z', [[0, 0.004], [0.016, 0.004], [0.017, 0], [0.017, -0.004], [0.0155, -0.004], [0.0155, 0.002], [0, 0.002]], 18));
  const seal = cache('engRearHousing', () => {
    const s = shapeOf([[-0.09, -0.058], [0.09, -0.058], [0.095, 0.0], [0.07, 0.055], [-0.07, 0.055], [-0.095, 0.0]]); s.holes.push(circlePath(0, 0, 0.05));
    return side(s, 0.008);
  });
  const sealGasket = cache('engRearGasket', () => {
    const s = shapeOf([[-0.09, -0.058], [0.09, -0.058], [0.095, 0.0], [0.07, 0.055], [-0.07, 0.055], [-0.095, 0.0]]); s.holes.push(circlePath(0, 0, 0.05));
    return side(s, 0.0008);
  });
  const rsBolts = [[0.075, 0.038], [-0.075, 0.038], [0.083, -0.03], [-0.083, -0.03], [0.035, -0.05], [-0.035, -0.05]];
  return A('Motorblok', { d: 'Gietijzeren onderblok met de vijf hoofdlagers, oliespuiters, vorstpluggen, centreerbussen en het keerringhuis aan de vliegwielzijde.', ex: [0, 0, 0] }, [
    P('Cilinderblok', blockGeo(), MAT.iron, { d: 'Gietijzeren cilinderblok met direct in het blok gehoonde boringen (de F van F4R staat voor fonte, gietijzer); diepe carterrok en vijf lagerstoelen.', spec: [['Materiaal', 'gietijzer'], ['Boring × slag', '82,7 × 93,0 mm'], ['Cilinderinhoud', '1998 cm³'], ['Compressie', '9,5 : 1']], ex: [0, 0, 0] }),
    ...XM.map((_, i) => engMainBearing(i)),
    A('Oliespuiters', { d: 'Vier oliespuiters voor de zuigerkoeling, één per cilinder.', ex: [0, -0.14, -0.1] }, jets),
    A('Vorstpluggen', { d: 'Ingeperste expansiepluggen in de watermantel aan voor- en achterzijde (aantal geschat).', ex: [0, 0.02, 0.0] }, [
      P('Vorstplug voor 1', plug, MAT.steel, { d: 'Expansieplug van de watermantel, voorzijde.', p: [0.09, 0.14, 0.106], ex: [0, 0, 0.07] }),
      P('Vorstplug voor 2', plug, MAT.steel, { d: 'Expansieplug van de watermantel, voorzijde.', p: [-0.09, 0.14, 0.106], ex: [0, 0, 0.07] }),
      P('Vorstplug achter 1', plug, MAT.steel, { d: 'Expansieplug van de watermantel, achterzijde.', p: [0.0, 0.17, -0.106], r: [0, PI, 0], ex: [0, 0, -0.07] }),
      P('Vorstplug achter 2', plug, MAT.steel, { d: 'Expansieplug van de watermantel, achterzijde.', p: [-0.17, 0.17, -0.106], r: [0, PI, 0], ex: [0, 0, -0.07] }),
    ]),
    P('Centreerbus kop vliegwielzijde', G.cyl('y', 0.0065, 0.0065, 0.016, 10), MAT.steel, { d: 'Holle centreerbus die de cilinderkop op het blok positioneert.', p: [0.2, DECK, -0.085], ex: [0, 0.06, 0] }),
    P('Centreerbus kop distributiezijde', G.cyl('y', 0.0065, 0.0065, 0.016, 10), MAT.steel, { d: 'Tweede centreerbus tussen blok en kop.', p: [-0.2, DECK, 0.085], ex: [0, 0.06, 0] }),
    A('Keerringhuis vliegwielzijde', { d: 'Afsluitplaat aan de vliegwielzijde van de krukas met de achterste keerring.', ex: [0.12, -0.02, 0] }, [
      P('Afsluitplaat', seal, MAT.aluCast, { d: 'Aluminium afsluitplaat (keerringhuis) op de achterkant van het blok.', p: [0.2195, 0, 0], ex: [0.03, 0, 0] }),
      P('Pakking afsluitplaat', sealGasket, MAT.rubber, { d: 'Pakking tussen afsluitplaat en blok.', p: [0.2152, 0, 0], ex: [0.012, 0, 0] }),
      P('Keerring krukas vliegwielzijde', annulus(0.041, 0.05, 0.007, 'x', 32), MAT.rubber, { d: 'Oliekeerring op de krukasflens aan de vliegwielzijde.', p: [0.2205, 0, 0], ex: [0.06, 0, 0] }),
      A('Bouten afsluitplaat', { d: 'Zes bouten van de afsluitplaat.', ex: [0.09, 0, 0] }, rsBolts.map(([z, y], k) => P(`Bout afsluitplaat ${k + 1}`, hexBolt(0.02, 0.006, '-x'), MAT.darkSteel, { d: 'Bout van het keerringhuis.', p: [0.2235, y, z], ex: [0.03, 0, 0] }))),
    ]),
    P('Keerring krukas distributiezijde', annulus(0.019, 0.026, 0.007, 'x', 24), MAT.rubber, { d: 'Oliekeerring rond de krukasneus aan de distributiezijde.', p: [-0.2185, 0, 0], ex: [-0.12, 0, 0] }),
    P('Pigeerplug bovenste dode punt', merge([G.cyl('z', 0.0065, 0.0065, 0.012, 10), xf(G.cyl('z', 0.009, 0.009, 0.005, 6), [0, 0, -0.008])]), MAT.steel, { d: 'Afsluitplug van het gat voor de pen die de krukas op het bovenste dode punt vastzet bij het afstellen van de distributie.', p: [0.13, -0.015, -0.107], ex: [0, 0, -0.07] }),
  ]);
}

/* ---------- krukmechanisme ---------- */
function crankGeo() {
  const L = [];
  XM.forEach(x => L.push(xf(G.cyl('x', ENG_MJ_R, ENG_MJ_R, 0.02, 24), [x, 0, 0])));
  const webHull = (up) => hullSolid([[0, 0, 0.034], [0, up * THROW, 0.03]], 0, 0.013);
  const cwShape = (up) => { const pts = [[0, 0]]; for (let k = 0; k <= 14; k++) { const a = -up * HALF - 1.15 + k / 14 * 2.3; pts.push([0.071 * Math.cos(a), 0.071 * Math.sin(a)]); } return side(shapeOf(pts), 0.013); };
  XC.forEach((x, i) => {
    const up = PIN_UP[i], py = up * THROW;
    L.push(xf(G.cyl('x', ENG_PIN_R, ENG_PIN_R, 0.024, 24), [x, py, 0]));
    [-0.0185, 0.0185].forEach(dx => { L.push(xf(webHull(up), [x + dx, 0, 0])); L.push(xf(cwShape(up), [x + dx, 0, 0])); });
  });
  L.push(xf(G.cyl('x', 0.019, 0.019, 0.115, 16), [-0.243, 0, 0]));      // neus: tandwiel, keerring, poelie
  L.push(xf(G.cyl('x', 0.041, 0.041, 0.028, 32), [0.21, 0, 0]));       // flens voor de flexplaat
  return merge(L);
}
function rodShapes() {
  const rodPts = [], capPts = [], bo = 0.041, bi = 0.0258, sr = 0.0165, sy = ROD;
  const a1 = Math.acos(0.016 / bo), sa = Math.asin(Math.min(1, 0.011 / sr));
  rodPts.push([bo, 0]);
  for (let k = 1; k <= 6; k++) { const a = k / 6 * a1; rodPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  const yTop = sy - Math.sqrt(sr * sr - 0.011 * 0.011);
  rodPts.push([0.011, yTop]);
  for (let k = 1; k <= 12; k++) { const a = -HALF + sa + k / 12 * (PI + 2 * (HALF - sa)); rodPts.push([sr * Math.cos(a), sy + sr * Math.sin(a)]); }
  rodPts.push([-0.016, bo * Math.sin(a1)]);
  for (let k = 1; k <= 6; k++) { const a = PI - a1 + k / 6 * a1; rodPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  rodPts.push([-bi, 0]);
  for (let k = 1; k < 12; k++) { const a = PI - k / 12 * PI; rodPts.push([bi * Math.cos(a), bi * Math.sin(a)]); }
  rodPts.push([bi, 0]);
  const rod = shapeOf(rodPts); rod.holes.push(circlePath(0, sy, 0.0116));
  capPts.push([bo, 0]);
  for (let k = 1; k <= 12; k++) { const a = -k / 12 * PI; capPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  capPts.push([-bi, 0]);
  for (let k = 1; k < 12; k++) { const a = PI + k / 12 * PI; capPts.push([bi * Math.cos(a), bi * Math.sin(a)]); }
  capPts.push([bi, 0]);
  return [side(rod, 0.021), side(shapeOf(capPts), 0.021)];
}
let ROD_GEOS = null;
function pistonGroup(i) {
  const py = PIN_UP[i] * THROW, pp = py + ROD, n = i + 1;
  ROD_GEOS = ROD_GEOS || rodShapes();
  const piston = cache('engPiston', () => merge([
    G.lathe('y', [[0, 0.0295], [0.0402, 0.0295], [0.04134, 0.0283], [0.04134, -0.026], [0.039, -0.026], [0.039, 0.017], [0, 0.017]], 40),
    G.cyl('x', 0.0145, 0.0145, 0.056, 16),
  ]));
  const ring = r => G.torus('y', 0.0408, r, 40, 5);
  return A(`Zuiger en drijfstang ${n}`, { d: `Zuiger-drijfstanggroep van cilinder ${n} (geteld vanaf de vliegwielzijde); ontsteekvolgorde 1-3-4-2.`, p: [XC[i], 0, 0], ex: [XC[i] * 0.2, 0.13, 0] }, [
    P('Zuiger', piston, MAT.alu, { d: 'Aluminium zuiger, Ø82,69 mm, met drie veergroeven; de zuigerpen ligt 0,8 mm uit het midden en het merkteken "V" wijst naar het vliegwiel.', p: [0, pp, 0], ex: [0, 0.05, 0], spec: [['Diameter', '82,69 mm'], ['Zuigerveren', '3']] }),
    A('Zuigerveren', { d: 'De drie zuigerveren: twee compressieveren en de olieschraapveer.', p: [0, pp, 0], ex: [0, 0.11, 0] }, [
      P('Compressieveer 1', ring(0.0011), MAT.darkSteel, { d: 'Bovenste compressieveer (vuurveer): dicht de verbrandingsruimte af.', p: [0, 0.0245, 0], ex: [0, 0.028, 0] }),
      P('Compressieveer 2', ring(0.00105), MAT.darkSteel, { d: 'Tweede compressieveer; schraapt ook olie terug.', p: [0, 0.0195, 0], ex: [0, 0.012, 0] }),
      A('Olieschraapveer', { d: 'Olieschraapveer; de opbouw met twee lamellen en een spreidveer is schematisch weergegeven (niet bevestigd voor de F4R).', p: [0, 0.013, 0], ex: [0, -0.006, 0] }, [
        P('Schraaplamel boven', ring(0.0006), MAT.steel, { d: 'Dunne stalen schraaplamel.', p: [0, 0.0022, 0], ex: [0, 0.012, 0] }),
        P('Spreidveer', G.torus('y', 0.0399, 0.0013, 40, 5), MAT.steel, { d: 'Golvende spreidveer die de lamellen tegen de cilinderwand drukt.', ex: [0, 0.006, 0] }),
        P('Schraaplamel onder', ring(0.0006), MAT.steel, { d: 'Dunne stalen schraaplamel.', p: [0, -0.0022, 0], ex: [0, -0.004, 0] }),
      ]),
    ]),
    P('Zuigerpen', G.cyl('x', 0.0105, 0.0105, 0.061, 16), MAT.steel, { d: 'Vrij zwevende zuigerpen, Ø21 × 61 mm.', p: [0, pp, 0], ex: [0.04, 0, 0], spec: [['Afmeting', 'Ø21 × 61 mm']] }),
    P('Borgveer vliegwielzijde', G.torus('x', 0.0099, 0.0008, 18, 4), MAT.steel, { d: 'Borgveer die de zuigerpen in de zuiger vasthoudt; opening circa 45° van de verticaal.', p: [0.0318, pp, 0], ex: [0.06, 0, 0] }),
    P('Borgveer distributiezijde', G.torus('x', 0.0099, 0.0008, 18, 4), MAT.steel, { d: 'Tweede borgveer van de zuigerpen.', p: [-0.0318, pp, 0], ex: [-0.06, 0, 0] }),
    P('Drijfstang', ROD_GEOS[0], MAT.steel, { d: 'Gesmede drijfstang met I-profiel, hartafstand 144 mm.', p: [0, py, 0], spec: [['Hartafstand', '144 mm'], ['Groot oog', 'Ø51,6 mm']], ex: [0, 0, 0] }),
    P('Kleinoogbus', annulus(0.0105, 0.0116, 0.021, 'x', 20), MAT.bearing, { d: 'Bronzen bus in het kleine drijfstangoog waarin de zuigerpen draait.', p: [0, pp, 0], ex: [-0.03, 0, 0] }),
    P('Drijfstanglagerschaal boven', G.half('x', 0.0258, 0.0195, PI), MAT.bearing, { d: 'Glijlagerschaal in de drijfstang, dikte 1,776 mm.', p: [0, py, 0], ex: [0, 0.03, 0.05] }),
    P('Drijfstanglagerschaal onder', G.half('x', 0.0258, 0.0195, 0), MAT.bearing, { d: 'Glijlagerschaal in de drijfstangkap, gelijk aan de bovenste.', p: [0, py, 0], ex: [0, -0.04, 0] }),
    P('Drijfstangkap', ROD_GEOS[1], MAT.steel, { d: 'Afneembare kap van het grote drijfstangoog.', p: [0, py, 0], ex: [0, -0.075, 0] }),
    P('Drijfstangbout voor', hexBolt(0.05, 0.008), MAT.darkSteel, { d: 'Rekbout van de drijfstangkap; na elke demontage vervangen.', p: [0, py - 0.041, 0.032], ex: [0, -0.13, 0] }),
    P('Drijfstangbout achter', hexBolt(0.05, 0.008), MAT.darkSteel, { d: 'Rekbout van de drijfstangkap; na elke demontage vervangen.', p: [0, py - 0.041, -0.032], ex: [0, -0.13, 0] }),
  ]);
}
function buildCrank() {
  return A('Krukmechanisme', { d: 'Krukas met pulswiel en kettingwiel en de vier zuiger-drijfstanggroepen: zet de op- en neergaande beweging van de zuigers om in draaiing.', ex: [0, -0.4, 0.4], inner: true }, [
    P('Krukas', crankGeo(), MAT.steel, { d: 'Krukas met vijf hoofdlagertappen en vier krukpennen; zet de zuigerbeweging om in draaiing.', spec: [['Hoofdlagertappen', '5 × Ø54,8 mm'], ['Krukpennen', '4 × Ø48 mm'], ['Slag', '93,0 mm']], ex: [0, 0, 0] }),
    P('Pulswiel krukas', gear(58, 0.074, 0.07, 0.004, 0.041, 'x'), MAT.darkSteel, { d: 'Getand doelwiel aan de vliegwielzijde dat de krukaspositiesensor leest; tandental schematisch.', p: [0.1925, 0, 0], ex: [0.07, 0, 0] }),
    P('Kettingwiel oliepomp', gear(24, 0.031, 0.027, 0.008, 0.019, 'x'), MAT.steel, { d: 'Tandwiel op de krukas dat via een enkele ketting de oliepomp aandrijft.', p: [-0.198, 0, 0], ex: [-0.07, 0, 0] }),
    ...XC.map((_, i) => pistonGroup(i)),
  ]);
}

/* ---------- cilinderkop ---------- */
function camGeo(phase, intake) {
  const nose = intake ? 0.0245 : 0.0237;
  return cache('engCam' + intake, () => {
    const L = [xf(G.cyl('x', 0.011, 0.011, 0.474, 14), [-0.025, 0, 0])];
    XM.forEach(x => L.push(xf(G.cyl('x', 0.0125, 0.0125, 0.016, 20), [x, 0, 0])));
    L.push(xf(G.cyl('x', 0.014, 0.014, 0.016, 20), [-0.205, 0, 0]));
    XC.forEach((x, i) => {
      const ang = phase + [0, 3, 1, 2][i] * HALF, pts = [];
      for (let k = 0; k < 40; k++) { const t = k / 40 * PI * 2, r = ENG_CAM_RB + (nose - ENG_CAM_RB) * Math.pow(Math.max(0, Math.cos(t)), 4); pts.push([r * Math.cos(t + ang), r * Math.sin(t + ang)]); }
      const lobe = zTo(extrude(shapeOf(pts), 0.012), 'x');
      [-0.017, 0.017].forEach(dx => L.push(xf(lobe, [x + dx, 0, 0])));
    });
    if (intake) L.push(xf(G.half('x', 0.026, 0.006, HALF, 12), [0.198, 0, 0]));   // doel voor de nokkenassensor
    return merge(L);
  });
}
// klepgroep: lokaal frame met y langs de klepas, oorsprong in het klepvlak; sg = +1 inlaat, -1 uitlaat
function valveGroup(cyl, k, sg) {
  const intake = sg > 0, V = intake ? ENG_VIN : ENG_VEX, x = XC[cyl] + (k ? -0.017 : 0.017);
  const th = V.th, c = Math.cos(th), s = Math.sin(th), y0 = DECK + 0.004, z0 = sg * 0.0175, L = V.L;
  const toL = (Y, Z) => { const dy = Y - y0, dz = (Z - z0) * sg; return [dy * c + dz * s, -dy * s + dz * c]; };   // [lokaal y, naar buiten]
  const [rY, rU] = toL(CAMY - ENG_CAM_RB - ENG_ROLL_R, sg * CAMZ);
  const pY = L + 0.003, f = 2.7, hU = rU * f, hY = pY + (rY - 0.004 - pY) * f;
  const key = intake ? 'In' : 'Ex';
  const valve = G.lathe('y', [[0, 0], [V.rh, 0], [V.rh, 0.0016], [V.rh * 0.62, 0.0065], [V.rs * 1.5, 0.017], [V.rs, 0.024], [V.rs, L - 0.006], [V.rs * 0.85, L - 0.0055], [V.rs * 0.85, L - 0.0035], [V.rs, L - 0.003], [V.rs, L], [0, L]], 16, 'engValve' + key);
  const yS = L - 0.0125, yB = yS - 0.036;          // bovenkant en onderkant klepveer
  const keeper = st => cache('engKeep' + st, () => new THREE.CylinderGeometry(0.0044, 0.0036, 0.0075, 8, 1, false, st, PI));
  const arm = cache('engRff' + key, () => side(shapeOf(circlesHull([[0, pY + 0.0005, 0.0042], [sg * rU, rY - 0.0048, 0.0062], [sg * hU, hY + 0.0022, 0.0052]], 0)), 0.011));
  const name = `${intake ? 'Inlaatklep' : 'Uitlaatklep'} ${cyl + 1}${k ? 'b' : 'a'}`;
  return A(name, { d: `Klepgroep van cilinder ${cyl + 1} (${intake ? 'inlaat' : 'uitlaat'}): klep, veerzitting, steelafdichting, veer, veerschotel, twee spieën, hydraulische klepstoter en rolzwenkarm.`, p: [x, y0, z0], r: [sg * th, 0, 0], ex: [x * 0.6, 0, 0] }, [
    P(intake ? 'Inlaatklep' : 'Uitlaatklep', valve, intake ? MAT.steel : MAT.darkSteel, { d: intake ? 'Inlaatklep: kop Ø33,5 mm, steel Ø5,47 mm, lengte 110,08 mm.' : 'Uitlaatklep van hittebestendige nikkellegering (Nimonic): kop Ø29 mm, steel Ø5,447 mm, lengte 106,87 mm.', ex: [0, -0.075, 0], spec: intake ? [['Kop', 'Ø33,5 mm'], ['Steel', 'Ø5,47 mm'], ['Lengte', '110,08 mm']] : [['Kop', 'Ø29 mm'], ['Steel', 'Ø5,447 mm'], ['Lengte', '106,87 mm']] }),
    P('Klepveerzitting', annulus(0.0035, 0.0145, 0.001, 'y', 20), MAT.steel, { d: 'Onderste veerschotel op de cilinderkop.', p: [0, yB - 0.0005, 0], ex: [0, 0.02, 0] }),
    P('Klepsteelafdichting', G.lathe('y', [[0.0028, 0], [0.0058, 0], [0.0058, 0.007], [0.0042, 0.0095], [0.0028, 0.0095]], 12, 'engStemSeal'), MAT.rubber, { d: 'Rubber afdichting op de klepgeleider die olieverbruik langs de klepsteel voorkomt.', p: [0, yB, 0], ex: [0, 0.034, 0] }),
    P('Klepveer', engSpring(0.01145, 0.0019, 0.036, 6.2), MAT.steel, { d: 'Klepveer van ovaal draad: vrije lengte 41,3 mm, buiten Ø27 mm, binnen Ø18,8 mm.', p: [0, (yS + yB) / 2, 0], ex: [0, 0.06, 0], spec: [['Vrije lengte', '41,3 mm'], ['Buitendiameter', '27 mm']] }),
    P('Veerschotel', G.lathe('y', [[0.0038, 0], [0.0135, 0.0015], [0.0135, 0.003], [0.0065, 0.0065], [0.0038, 0.0065]], 16, 'engRetainer'), MAT.steel, { d: 'Bovenste veerschotel die de klepveer vasthoudt.', p: [0, yS, 0], ex: [0, 0.088, 0] }),
    P('Klepspie 1', keeper(0), MAT.darkSteel, { d: 'Halve kegelspie die de veerschotel op de klepsteel klemt.', p: [0, L - 0.0045, 0], ex: [0.013, 0.104, 0] }),
    P('Klepspie 2', keeper(PI), MAT.darkSteel, { d: 'Tweede halve kegelspie.', p: [0, L - 0.0045, 0], ex: [-0.013, 0.104, 0] }),
    A('Hydraulische klepstoter', { d: 'Hydraulische speling-opvanger: het steunpunt van de rolzwenkarm; houdt de klepspeling automatisch op nul. Binnenwerk schematisch weergegeven.', p: [0, hY, sg * hU], ex: [0, 0.12, sg * 0.012] }, [
      P('Huis', G.lathe('y', [[0, -0.026], [0.0062, -0.026], [0.0062, -0.004], [0.0053, -0.004], [0.0053, -0.024], [0, -0.024]], 14, 'engHlaBody'), MAT.steel, { d: 'Stalen huis dat in een boring in de kop staat.', ex: [0, 0, 0] }),
      P('Plunjer', cache('engHlaPlunger', () => merge([xf(G.cyl('y', 0.005, 0.005, 0.0125, 12), [0, -0.0085, 0]), xf(G.sphere(0.0032, 10), [0, -0.0012, 0])])), MAT.steel, { d: 'Plunjer met kogelkop waarop de rolzwenkarm scharniert; olie onder de plunjer neemt de speling op.', ex: [0, 0.04, 0] }),
      P('Terugslagkogel met veer', cache('engHlaBall', () => merge([xf(G.sphere(0.0018, 8), [0, -0.0155, 0]), xf(G.cyl('y', 0.0014, 0.0014, 0.005, 8, true), [0, -0.0195, 0])])), MAT.darkSteel, { d: 'Terugslagkogel met veertje dat de olie in de drukkamer opsluit.', ex: [0, 0.02, 0] }),
    ]),
    A('Rolzwenkarm', { d: 'Rolzwenkarm (linguet à rouleau): de nok drukt op de rol, de arm kantelt om de klepstoter en opent de klep.', ex: [0, 0.155, 0] }, [
      P('Arm', arm, MAT.steel, { d: 'Geperste stalen arm met kogelkom en drukvlak op de klepsteel.', ex: [0, 0, 0] }),
      P('Rol met naaldlager', G.cyl('x', ENG_ROLL_R, ENG_ROLL_R, 0.007, 16), MAT.bearing, { d: 'Rol op een naaldlager die over de nok loopt en de wrijving laag houdt.', p: [0, rY, sg * rU], ex: [0, 0.022, 0] }),
      P('Rolas', G.cyl('x', 0.003, 0.003, 0.013, 8), MAT.darkSteel, { d: 'Asje waarop de rol draait.', p: [0, rY, sg * rU], ex: [0.03, 0, 0] }),
    ]),
  ]);
}
function engBridgeGeo() {
  return cache('engBridge', () => {
    const L = [], y0 = CAMY, t = ENG_BRIDGE_T;
    const web = (rr) => {
      const pts = [[-0.1, y0]];
      [-1, 1].forEach(sg => { const cz = sg * CAMZ; for (let k = 0; k <= 10; k++) { const a = PI - k / 10 * PI; pts.push([cz + rr * Math.cos(a), y0 + rr * Math.sin(a)]); } });
      pts.push([0.1, y0], [0.1, y0 + t], [-0.1, y0 + t]);
      return side(shapeOf(pts), 0.018);
    };
    XM.forEach(x => L.push(xf(web(0.0125), [x, 0, 0])));
    L.push(xf(web(0.014), [-0.205, 0, 0]));
    L.push(xf(web(0.017), [0.207, 0, 0]));
    [-0.095, 0.095].forEach(z => L.push(xf(G.box(0.43, t, 0.01), [0, y0 + t / 2, z])));
    const cs = shapeOf(rrectPts(0.43, 0.036, 0.008)); XC.forEach(x => cs.holes.push(circlePath(x, 0, 0.0135)));
    const ctr = plan(cs, t); ctr.translate(0, y0 + t / 2, 0); L.push(ctr);
    return merge(L);
  });
}
function engCoverGeo() {
  return cache('engCover', () => {
    const cs = shapeOf(rrectPts(0.436, 0.196, 0.03));
    XC.forEach(x => cs.holes.push(circlePath(x, 0, 0.0165)));
    const cover = plan(cs, ENG_COVER_H); cover.translate(0, ENG_COVER_Y + ENG_COVER_H / 2, 0);
    const L = [cover];
    [-0.17, -0.088, 0, 0.088, 0.17].forEach(x => L.push(xf(G.box(0.008, 0.006, 0.16), [x, ENG_COVER_TOP + 0.002, 0])));
    L.push(xf(G.cyl('y', 0.024, 0.024, 0.006, 20), [-0.17, ENG_COVER_TOP + 0.002, -0.05]));     // vulhals
    L.push(xf(G.cyl('y', 0.017, 0.017, 0.005, 16), [-0.185, ENG_COVER_TOP + 0.002, 0.06]));     // opname VVT-klep
    return merge(L);
  });
}
function buildIgnition() {
  const coil = cache('engCoil', () => merge([xf(G.cyl('y', 0.0105, 0.0105, ENG_COVER_TOP - 0.3, 14), [0, (ENG_COVER_TOP + 0.3) / 2, 0]), xf(G.rbox(0.03, 0.022, 0.05, 0.005), [0, ENG_COVER_TOP + 0.011, 0.002]), xf(G.box(0.018, 0.006, 0.014), [0.024, ENG_COVER_TOP + 0.003, -0.006])]));
  const boot = G.lathe('y', [[0.0098, 0.268], [0.0118, 0.272], [0.0118, 0.312], [0.0106, 0.318], [0.0098, 0.318]], 14, 'engBoot');
  const kids = [];
  XC.forEach((x, i) => {
    const n = i + 1;
    kids.push(A(`Bobine ${n}`, { d: `Penbobine (bobine crayon) van cilinder ${n}, direct op de bougie.`, p: [x, 0, 0], ex: [0, 0.14, 0] }, [
      P('Behuizing', coil, MAT.plasticGrey, { d: 'Bobinehuis met primaire en secundaire wikkeling rond een ijzerkern (binnenopbouw niet getoond).', ex: [0, 0, 0] }),
      P('Rubber bougiekap', boot, MAT.rubber, { d: 'Rubber kap die de bougie-isolator omsluit en de hoogspanning afschermt.', ex: [0, -0.05, 0] }),
      P('Stekker', G.rbox(0.016, 0.014, 0.018, 0.003), MAT.plastic, { d: 'Stekker naar de motorkabelboom.', p: [0, ENG_COVER_TOP + 0.011, 0.034], ex: [0, 0, 0.04] }),
    ]));
  });
  XC.forEach((x, i) => {
    const n = i + 1;
    kids.push(A(`Bougie ${n}`, { d: `Bougie van cilinder ${n}: M14 × 1,25 met 19 mm schroefdraad en sleutelwijdte 16 mm.`, p: [x, 0, 0], ex: [0, 0.075, 0], spec: [['Schroefdraad', 'M14 × 1,25, 19 mm'], ['Sleutelwijdte', '16 mm'], ['Elektrodenafstand', '0,7 tot 0,8 mm'], ['Aanhaalmoment', '20 tot 30 Nm']] }, [
      P('Huis met massa-elektrode', G.lathe('y', [[0.0015, 0.233], [0.0068, 0.235], [0.0068, 0.2525], [0.0092, 0.2535], [0.0092, 0.267], [0.0072, 0.2685], [0.0062, 0.272], [0, 0.272]], 6, 'engPlugShell'), MAT.steel, { d: 'Stalen draadhuis met zeskant en massa-elektrode.', ex: [0, 0, 0] }),
      P('Isolator', G.lathe('y', [[0.0058, 0.27], [0.0058, 0.302], [0.0045, 0.308], [0.0032, 0.316], [0, 0.316]], 14, 'engPlugIns'), MAT.ceramic, { d: 'Keramische isolator om de middenelektrode.', ex: [0, 0.05, 0] }),
      P('Middenelektrode', G.cyl('y', 0.0012, 0.0012, 0.056, 6), MAT.steel, { d: 'Middenelektrode met edelmetaalpunt.', p: [0, 0.262, 0], ex: [0, -0.07, 0] }),
      P('Pakkingring', annulus(0.0069, 0.0098, 0.0015, 'y', 16), MAT.steel, { d: 'Afdichtring onder de zeskant.', p: [0, 0.2525, 0], ex: [0, -0.03, 0] }),
    ]));
  });
  XC.forEach((x, i) => kids.push(P(`Bobinebout ${i + 1}`, hexBolt(0.02, 0.006), MAT.darkSteel, { d: 'Bout die de bobine op het kleppendeksel vastzet.', p: [x + 0.024, ENG_COVER_TOP + 0.006, -0.006], r: [PI, 0, 0], ex: [0, 0.19, 0] })));
  return A('Ontsteking', { d: 'Losse penbobines met bougies, één per cilinder.', ex: [0, 0.3, 0.22] }, kids);
}
function buildPhaser() {
  const P0 = [XT, CAMY, CAMZ];
  return A('Faseversteller', { d: 'Hydraulische nokkenasverstelling op de inlaatnokkenas; tegelijk het distributiewiel van die as. Of hij aan/uit of traploos werkt is voor de F4Rt 811 niet vastgesteld; binnenwerk schematisch weergegeven.', p: P0, ex: [-0.07, 0.24, 0.09] }, [
    P('Huis met distributiewiel', merge([gear(38, 0.0569, 0.0545, 0.027, 0.03, 'x'), xf(annulus(0.016, 0.046, 0.008, 'x', 32), [-0.017, 0, 0])]), MAT.steel, { d: 'Huis met 38 tanden waarover de distributieriem loopt (tandental afgeleid uit de 2 : 1-overbrenging).', spec: [['Tanden', '38 (geschat)']], ex: [0, 0, 0] }),
    P('Vleugelrotor', merge([G.cyl('x', 0.024, 0.024, 0.022, 20), ...[0, 1, 2, 3].map(k => xf(G.box(0.022, 0.016, 0.008), [0, 0.032 * Math.cos(k * HALF), 0.032 * Math.sin(k * HALF)], [k * HALF, 0, 0]))]), MAT.darkSteel, { d: 'Rotor met vier vleugels op de nokkenas; oliedruk aan een van beide kanten verdraait hem ten opzichte van het huis.', ex: [-0.05, 0, 0], inner: true }),
    P('Vergrendelpen', G.cyl('x', 0.003, 0.003, 0.012, 8), MAT.steel, { d: 'Pen die rotor en huis bij lage oliedruk vergrendelt (start).', p: [0, 0.034, 0.008], ex: [-0.04, 0.03, 0], inner: true }),
    P('Vergrendelveer', spring(0.0022, 0.0004, 0.008, 4, 'x'), MAT.steel, { d: 'Veer achter de vergrendelpen.', p: [0.008, 0.034, 0.008], ex: [-0.025, 0.04, 0], inner: true }),
    P('Centrale bout', hexBolt(0.05, 0.012, 'x'), MAT.darkSteel, { d: 'Centrale bout van de faseversteller; vervangen bij demontage.', p: [-0.022, 0, 0], ex: [-0.09, 0, 0] }),
    P('Afdekplaat', G.lathe('x', [[0, -0.003], [0.015, -0.003], [0.016, 0], [0.015, 0.003], [0, 0.003]], 20, 'engPhaserCap'), MAT.aluCast, { d: 'Afdekdop (obturateur) voor in het huis.', p: [-0.029, 0, 0], ex: [-0.13, 0, 0] }),
  ]);
}
function buildVvtValve() {
  const P0 = [-0.185, ENG_COVER_TOP, 0.06];
  return A('VVT-elektroklep', { d: 'Olieregelventiel op het kleppendeksel dat de olie naar de faseversteller stuurt; binnenwerk schematisch weergegeven.', p: P0, ex: [0, 0.42, 0.1] }, [
    P('Spoelhuis met stekker', merge([xf(G.cyl('y', 0.013, 0.013, 0.018, 16), [0, 0.011, 0]), xf(G.rbox(0.018, 0.012, 0.02, 0.003), [0, 0.012, 0.019]), xf(G.box(0.036, 0.004, 0.012), [0.012, 0.003, 0])]), MAT.plastic, { d: 'Elektromagneet met stekker, door de motorcomputer gestuurd.', ex: [0, 0, 0] }),
    P('Schuifventiel met veer', G.cyl('y', 0.0065, 0.0065, 0.04, 12), MAT.steel, { d: 'Schuif met terugstelveer die de oliekanalen opent en sluit.', p: [0, -0.018, 0], ex: [0, -0.03, 0] }),
    P('Zeefje', annulus(0.003, 0.0066, 0.004, 'y', 12), MAT.steel, { d: 'Zeefje dat vuil uit de stuurolie houdt.', p: [0, -0.04, 0], ex: [0, -0.06, 0] }),
    P('O-ring boven', engORing(0.0068, 0.0011), MAT.rubber, { d: 'O-ring tussen klep en deksel.', p: [0, -0.003, 0], ex: [0, -0.012, 0.02] }),
    P('O-ring onder', engORing(0.0068, 0.0011), MAT.rubber, { d: 'Tweede O-ring.', p: [0, -0.024, 0], ex: [0, -0.04, 0.02] }),
    P('Bevestigingsbout', hexBolt(0.016, 0.006), MAT.darkSteel, { d: 'Bout van de elektroklep.', p: [0.026, 0.006, 0], r: [PI, 0, 0], ex: [0, 0.06, 0] }),
  ]);
}
function buildHead() {
  const hs = shapeOf(rrectPts(0.43, 0.204, 0.02));
  XC.forEach(x => hs.holes.push(circlePath(x, 0, 0.013)));
  const y0 = DECK + ENG_GASKET, head = plan(hs, ENG_HEAD_H); head.translate(0, y0 + ENG_HEAD_H / 2, 0);
  const ports = [];
  XC.forEach(x => { ports.push(xf(G.box(0.07, 0.045, 0.008), [x, 0.29, 0.104])); ports.push(xf(G.box(0.062, 0.04, 0.008), [x, 0.285, -0.104])); });
  ports.push(xf(G.box(0.008, 0.06, 0.07), [0.217, 0.3, 0.04]));                   // flens waterstuk
  ports.push(xf(G.cyl('z', 0.012, 0.012, 0.01, 12), [0.195, CAMY - 0.005, 0.104])); // opname nokkenassensor
  const gs = shapeOf(rrectPts(0.428, 0.204, 0.02));
  XC.forEach(x => gs.holes.push(circlePath(x, 0, 0.0425)));
  XM.forEach(x => { gs.holes.push(circlePath(x, 0.074, 0.0065)); gs.holes.push(circlePath(x, -0.074, 0.0065)); });
  const gasket = plan(gs, ENG_GASKET); gasket.translate(0, DECK + ENG_GASKET / 2, 0);
  const gk = shapeOf(rrectPts(0.436, 0.196, 0.03)); gk.holes.push(new THREE.Path(rrectPts(0.42, 0.18, 0.022).map(p => new THREE.Vector2(p[0], p[1]))));
  const coverGasket = plan(gk, 0.001); coverGasket.translate(0, ENG_COVER_Y - 0.0005, 0);
  const valvesIn = [], valvesOut = [];
  for (let c = 0; c < 4; c++) for (let k = 0; k < 2; k++) { valvesIn.push(valveGroup(c, k, 1)); valvesOut.push(valveGroup(c, k, -1)); }
  const headBolt = hexBolt(0.115, 0.0105, 'y');
  const bridgeBolts = [], coverBolts = [];
  XM.forEach((x, i) => [0.093, -0.093].forEach((z, j) => bridgeBolts.push(P(`Lagerbrugbout ${i * 2 + j + 1}`, hexBolt(0.045, 0.007), MAT.darkSteel, { d: 'Bout van de nokkenaslagerbrug.', p: [x, CAMY + ENG_BRIDGE_T, z], r: [PI, 0, 0], ex: [0, 0.07, 0] }))));
  [-0.2, -0.1, 0.1, 0.2].forEach((x, i) => [0.088, -0.088].forEach((z, j) => coverBolts.push(P(`Kleppendekselbout ${i * 2 + j + 1}`, hexBolt(0.03, 0.006), MAT.steel, { d: 'Bout van het kleppendeksel.', p: [x, ENG_COVER_TOP, z], r: [PI, 0, 0], ex: [0, 0.07, 0] }))));
  const camSealG = annulus(0.014, 0.0205, 0.007, 'x', 24), plugG = G.lathe('x', [[0, -0.003], [0.017, -0.003], [0.017, 0.003], [0, 0.003]], 20, 'engCamPlug');
  return A('Cilinderkop', { d: 'Aluminium cilinderkop met twee bovenliggende nokkenassen in één lagerbrug, 16 kleppen met rolzwenkarmen en hydraulische klepstoters, faseversteller, kleppendeksel en ontsteking.', ex: [0, 0.3, 0] }, [
    P('Cilinderkop (gietstuk)', merge([head, ...ports]), MAT.aluCast, { d: 'Aluminium cilinderkop met ingeperste klepzittingen en klepgeleiders, inlaatpoorten aan de voorzijde en uitlaatpoorten aan de achterzijde.', spec: [['Materiaal', 'aluminium'], ['Hoogte', '138,15 mm'], ['Kleppen', '16 (4 per cilinder)']], ex: [0, 0.09, 0] }),
    P('Koppakking', gasket, MAT.darkSteel, { d: 'Koppakking tussen blok en kop, geklemde dikte circa 0,65 mm (meerlaags staal aangenomen).', spec: [['Dikte geklemd', '0,65 mm']], ex: [0, 0.025, 0] }),
    A('Cilinderkopbouten', { d: 'Tien cilinderkopbouten (Torx); herbruikbaar tot 117,5 mm lengte onder de kop.', ex: [0, 0.27, 0] }, XM.flatMap((x, i) => [0.074, -0.074].map((z, j) => P(`Cilinderkopbout ${i * 2 + j + 1}`, headBolt, MAT.darkSteel, { d: 'Rekbout die kop en koppakking op het blok klemt.', p: [x, DECK + 0.084, z], r: [PI, 0, 0], ex: [0, 0.05 + (i % 2) * 0.012, 0] })))),
    A('Kleppen inlaatzijde', { d: 'Acht inlaatklepgroepen.', ex: [0, 0.2, 0.19], inner: true }, valvesIn),
    A('Kleppen uitlaatzijde', { d: 'Acht uitlaatklepgroepen.', ex: [0, 0.2, -0.19], inner: true }, valvesOut),
    P('Nokkenas inlaat', camGeo(-PI / 4, true), MAT.steel, { d: 'Inlaatnokkenas met zes lagertappen (Ø25, aan de distributiezijde Ø28 mm), nokhoogte 41,0 mm, en een doel voor de nokkenassensor.', p: [0, CAMY, CAMZ], ex: [0, 0.24, 0.07], inner: true, spec: [['Lagers', '6'], ['Nokhoogte', '41,0 mm']] }),
    P('Nokkenas uitlaat', camGeo(-3 * PI / 4, false), MAT.steel, { d: 'Uitlaatnokkenas met zes lagertappen, nokhoogte 40,2 mm.', p: [0, CAMY, -CAMZ], ex: [0, 0.24, -0.07], inner: true, spec: [['Lagers', '6'], ['Nokhoogte', '40,2 mm']] }),
    A('Afdichting nokkenassen', { d: 'Keerringen aan de distributiezijde en afdichtdoppen aan de vliegwielzijde.', ex: [0, 0.24, 0] }, [
      P('Keerring nokkenas inlaat', camSealG, MAT.rubber, { d: 'Keerring van de inlaatnokkenas aan de distributiezijde.', p: [-0.2165, CAMY, CAMZ], ex: [-0.07, 0, 0.07] }),
      P('Keerring nokkenas uitlaat', camSealG, MAT.rubber, { d: 'Keerring van de uitlaatnokkenas aan de distributiezijde.', p: [-0.2165, CAMY, -CAMZ], ex: [-0.07, 0, -0.07] }),
      P('Afdichtdop nokkenas inlaat', plugG, MAT.steel, { d: 'Afdichtdop in de lagerboring aan de vliegwielzijde (bouchon d\'étanchéité).', p: [0.2135, CAMY, CAMZ], ex: [0.07, 0, 0.07] }),
      P('Afdichtdop nokkenas uitlaat', plugG, MAT.steel, { d: 'Afdichtdop in de lagerboring aan de vliegwielzijde.', p: [0.2135, CAMY, -CAMZ], ex: [0.07, 0, -0.07] }),
    ]),
    buildPhaser(),
    A('Nokkenaslagerbrug', { d: 'Eén lagerbrug (carter-chapeau de paliers) die beide nokkenassen draagt, met vloeibare pakking op het vlak.', ex: [0, 0.3, 0] }, [
      P('Lagerbrug', engBridgeGeo(), MAT.aluCast, { d: 'Aluminium ladder met de bovenste helften van de twaalf nokkenaslagers.', ex: [0, 0, 0] }),
      A('Lagerbrugbouten', { d: 'Bouten van de lagerbrug (aantal geschat).', ex: [0, 0.05, 0] }, bridgeBolts),
    ]),
    A('Kleppendeksel', { d: 'Kleppendeksel met pakking, bouten en olievuldop.', ex: [0, 0.37, 0] }, [
      P('Deksel', engCoverGeo(), MAT.aluCast, { d: 'Deksel over de lagerbrug met doorvoeren voor de vier bobines en een opname voor de VVT-elektroklep.', ex: [0, 0, 0] }),
      P('Kleppendekselpakking', coverGasket, MAT.rubber, { d: 'Rubber pakking onder het kleppendeksel.', ex: [0, -0.025, 0] }),
      A('Kleppendekselbouten', { d: 'Acht bouten van het kleppendeksel (aantal geschat).', ex: [0, 0.05, 0] }, coverBolts),
      P('Olievuldop', merge([G.cyl('y', 0.021, 0.021, 0.016, 20), xf(G.box(0.03, 0.006, 0.006), [0, 0.01, 0])]), MAT.plastic, { d: 'Dop van de olievulopening.', p: [-0.17, ENG_COVER_TOP + 0.011, -0.05], ex: [0, 0.09, 0] }),
    ]),
    buildVvtValve(),
    buildIgnition(),
  ]);
}

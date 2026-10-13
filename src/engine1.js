/* ===================== motor F4Rt: blok, krukas, zuigers, kop, kleppen ===================== */
// motorframe: oorsprong op de krukas-as, x langs de krukas, y langs de cilinderas, z naar de inlaatzijde
const XC = [-0.132, -0.044, 0.044, 0.132];           // cilinderhartlijnen
const XM = [-0.176, -0.088, 0, 0.088, 0.176];        // hoofdlagers
const DECK = 0.222, BORE_R = 0.04135, THROW = 0.0465, ROD = 0.144, CAMY = 0.358, CAMZ = 0.056;
const PIN_UP = [1, -1, -1, 1];                       // krukpennen 1/4 boven, 2/3 onder
const FIRE = ['1', '3', '4', '2'];

function blockGeo() {
  const s = shapeOf(rrectPts(0.43, 0.21, 0.02));
  XC.forEach(x => s.holes.push(circlePath(x, 0, BORE_R + 0.0005)));
  const h = DECK + 0.06, g = plan(s, h); g.translate(0, DECK - h / 2, 0);
  const ribs = [];
  [-0.19, -0.088, 0, 0.088, 0.19].forEach(x => { ribs.push(xf(G.box(0.012, 0.18, 0.012), [x, 0.05, 0.108])); ribs.push(xf(G.box(0.012, 0.18, 0.012), [x, 0.05, -0.108])); });
  ribs.push(xf(G.box(0.06, 0.07, 0.03), [-0.2, 0.13, 0.115]));
  return merge([g, ...ribs]);
}
function crankGeo() {
  const L = [];
  XM.forEach(x => L.push(xf(G.cyl('x', 0.029, 0.029, 0.022), [x, 0, 0])));
  XC.forEach((x, i) => {
    const py = PIN_UP[i] * THROW;
    L.push(xf(G.cyl('x', 0.0235, 0.0235, 0.024), [x, py, 0]));
    [-0.019, 0.019].forEach(dx => {
      L.push(xf(G.box(0.013, 0.095, 0.064), [x + dx, py / 2, 0]));
      const cw = new THREE.CylinderGeometry(0.07, 0.07, 0.013, 20, 1, false, 0, PI);
      cw.rotateZ(-HALF); if (PIN_UP[i] < 0) cw.rotateX(PI);
      L.push(xf(cw, [x + dx, 0, 0], [0, 0, 0]));
    });
  });
  L.push(xf(G.cyl('x', 0.018, 0.018, 0.075), [-0.25, 0, 0]));
  L.push(xf(G.cyl('x', 0.042, 0.042, 0.012), [0.212, 0, 0]));
  return merge(L);
}
function camGeo(phase) {
  const L = [xf(G.cyl('x', 0.0115, 0.0115, 0.47), [0, 0, 0])];
  XM.forEach(x => L.push(xf(G.cyl('x', 0.0135, 0.0135, 0.016), [x, 0, 0])));
  XC.forEach((x, i) => {
    const ang = phase + [0, 3, 1, 2][i] * HALF;          // volgorde 1-3-4-2
    const pts = [];
    for (let k = 0; k < 40; k++) { const t = k / 40 * PI * 2, r = 0.0165 + 0.0085 * Math.pow(Math.max(0, Math.cos(t)), 3); pts.push([r * Math.cos(t + ang), r * Math.sin(t + ang)]); }
    const lobe = zTo(extrude(shapeOf(pts), 0.013), 'x');
    [-0.017, 0.017].forEach(dx => L.push(xf(lobe, [x + dx, 0, 0])));
  });
  return merge(L);
}
function rodShapes() {
  const rodPts = [], capPts = [], bo = 0.04, bi = 0.0245, sr = 0.0165, sy = ROD;
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
  const rod = shapeOf(rodPts); rod.holes.push(circlePath(0, sy, 0.0106));
  capPts.push([bo, 0]);
  for (let k = 1; k <= 12; k++) { const a = -k / 12 * PI; capPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  capPts.push([-bi, 0]);
  for (let k = 1; k < 12; k++) { const a = PI + k / 12 * PI; capPts.push([bi * Math.cos(a), bi * Math.sin(a)]); }
  capPts.push([bi, 0]);
  return [side(rod, 0.02), side(shapeOf(capPts), 0.02)];
}
let ROD_GEOS = null;
function pistonGroup(i) {
  const py = PIN_UP[i] * THROW, pp = py + ROD;
  ROD_GEOS = ROD_GEOS || rodShapes();
  const piston = G.lathe('y', [[0, 0.03], [0.0405, 0.03], [0.0412, 0.028], [0.0412, -0.026], [0.0385, -0.026], [0.0385, 0.019], [0, 0.019]], 36, 'piston');
  const ring = r => G.torus('y', 0.0411, r, 48, 6);
  return A(`Zuiger en drijfstang ${i + 1}`, { d: `Zuigergroep van cilinder ${i + 1}; ontsteekvolgorde 1-3-4-2.`, p: [XC[i], 0, 0], ex: [XC[i] * 0.9, 0.04, 0] }, [
    P('Zuiger', piston, MAT.alu, { d: 'Aluminium zuiger; boring 82,7 mm.', p: [0, pp, 0], ex: [0, 0.07, 0] }),
    P('Compressieveer 1', ring(0.0011), MAT.darkSteel, { d: 'Bovenste compressieveer: dicht de verbrandingsruimte af.', p: [0, pp + 0.0245, 0], ex: [0, 0.14, 0] }),
    P('Compressieveer 2', ring(0.0011), MAT.darkSteel, { d: 'Tweede compressieveer, schraapt ook olie mee terug.', p: [0, pp + 0.0195, 0], ex: [0, 0.122, 0] }),
    P('Olieschraapveer', ring(0.0016), MAT.steel, { d: 'Schraapt overtollige olie van de cilinderwand.', p: [0, pp + 0.013, 0], ex: [0, 0.104, 0] }),
    P('Zuigerpen', G.cyl('x', 0.0105, 0.0105, 0.06, 16), MAT.steel, { d: 'Verbindt zuiger en drijfstang.', p: [0, pp, 0], ex: [0.085, 0.04, 0] }),
    P('Borgveer links', G.torus('x', 0.0098, 0.0008, 20, 4), MAT.steel, { d: 'Borgt de zuigerpen in de zuiger.', p: [0.0305, pp, 0], ex: [0.135, 0.04, 0] }),
    P('Borgveer rechts', G.torus('x', 0.0098, 0.0008, 20, 4), MAT.steel, { d: 'Borgt de zuigerpen in de zuiger.', p: [-0.0305, pp, 0], ex: [-0.075, 0.04, 0] }),
    P('Drijfstang', ROD_GEOS[0], MAT.steel, { d: 'Gesmede drijfstang; zet de op-en-neergaande beweging om in rotatie.', p: [0, py, 0] }),
    P('Drijfstanglagerschaal boven', G.half('x', 0.0244, 0.019, PI), MAT.bearing, { d: 'Glijlagerschaal in de drijfstang.', p: [0, py, 0], ex: [0, -0.02, 0.06] }),
    P('Drijfstanglagerschaal onder', G.half('x', 0.0244, 0.019, 0), MAT.bearing, { d: 'Glijlagerschaal in de drijfstangkap.', p: [0, py, 0], ex: [0, -0.055, 0] }),
    P('Drijfstangkap', ROD_GEOS[1], MAT.steel, { d: 'Afneembare kap van het grote drijfstangoog.', p: [0, py, 0], ex: [0, -0.09, 0] }),
    P('Drijfstangbout voor', hexBolt(0.05, 0.008), MAT.darkSteel, { d: 'Rekbout van de drijfstangkap.', p: [0, py - 0.04, 0.032], ex: [0, -0.15, 0] }),
    P('Drijfstangbout achter', hexBolt(0.05, 0.008), MAT.darkSteel, { d: 'Rekbout van de drijfstangkap.', p: [0, py - 0.04, -0.032], ex: [0, -0.15, 0] }),
  ]);
}
function valveGroup(cyl, k, side) {
  const intake = side > 0, x = XC[cyl] + (k ? 0.017 : -0.017);
  const rh = intake ? 0.0165 : 0.0142;
  const valve = G.lathe('y', [[0, 0], [rh, 0], [rh, 0.0018], [rh * 0.55, 0.0075], [0.0029, 0.018], [0.0029, 0.104], [0, 0.104]], 18, 'valve' + intake);
  const keeper = st => cache('keep' + st, () => new THREE.CylinderGeometry(0.0042, 0.0034, 0.008, 8, 1, false, st, PI));
  const name = `${intake ? 'Inlaatklep' : 'Uitlaatklep'} ${cyl + 1}${k ? 'b' : 'a'}`;
  return A(name, { d: `Klepgroep van cilinder ${cyl + 1} (${intake ? 'inlaat' : 'uitlaat'}): klep, veer, schotel, spieën, afdichting en stoter.`, p: [x, DECK + 0.004, side * 0.02], r: [side * 0.2618, 0, 0] }, [
    P(intake ? 'Inlaatklep' : 'Uitlaatklep', valve, intake ? MAT.steel : MAT.darkSteel, { d: intake ? 'Inlaatklep: laat het lucht-brandstofmengsel binnen.' : 'Uitlaatklep: laat de verbrandingsgassen naar de turbo.', ex: [0, -0.07, 0] }),
    P('Klepveerzitting', annulus(0.004, 0.0115, 0.0012, 'y', 20), MAT.steel, { d: 'Onderste veerschotel op de cilinderkop.', p: [0, 0.058, 0], ex: [0, -0.012, 0.03] }),
    P('Klepsteelafdichting', G.cyl('y', 0.0058, 0.0058, 0.009, 14), MAT.rubber, { d: 'Rubber afdichting die olieverbruik langs de klepsteel voorkomt.', p: [0, 0.064, 0], ex: [0, 0.015, -0.035] }),
    P('Klepveer', spring(0.0105, 0.0016, 0.036, 6.5), MAT.steel, { d: 'Sluit de klep na elke opening.', p: [0, 0.076, 0], ex: [0, 0.03, 0] }),
    P('Veerschotel', G.lathe('y', [[0.004, 0], [0.0125, 0.002], [0.0125, 0.0035], [0.006, 0.006], [0.004, 0.006]], 18, 'retainer'), MAT.steel, { d: 'Bovenste veerschotel, houdt de klepveer vast.', p: [0, 0.094, 0], ex: [0, 0.065, 0] }),
    P('Klepspie 1', keeper(0), MAT.darkSteel, { d: 'Halve kegelspie die de veerschotel op de klepsteel klemt.', p: [0, 0.098, 0], ex: [0.014, 0.082, 0] }),
    P('Klepspie 2', keeper(PI), MAT.darkSteel, { d: 'Halve kegelspie die de veerschotel op de klepsteel klemt.', p: [0, 0.098, 0], ex: [-0.014, 0.082, 0] }),
    P('Klepstoter', G.lathe('y', [[0, 0.013], [0.0145, 0.013], [0.0145, -0.012], [0.0135, -0.012], [0.0135, 0.011], [0, 0.011]], 24, 'tappet'), MAT.steel, { d: 'Kopstoter tussen nok en klep.', p: [0, 0.104, 0], ex: [0, 0.11, 0] }),
  ]);
}
function buildBlock() {
  const kids = [
    P('Cilinderblok', blockGeo(), MAT.iron, { d: 'Gietijzeren cilinderblok met direct in het blok gehoonde boringen (F staat voor fonte, gietijzer).', spec: [['Materiaal', 'gietijzer'], ['Boring × slag', '82,7 × 93,0 mm'], ['Cilinderinhoud', '1998 cm³']] }),
    P('Krukas', crankGeo(), MAT.steel, { d: 'Krukas met vijf hoofdlagers; zet de zuigerbeweging om in draaiing.', ex: [0, -0.22, 0] }),
    P('Keerring krukas distributiezijde', G.torus('x', 0.022, 0.004, 24, 6), MAT.rubber, { d: 'Oliekeerring rond de krukasneus.', p: [-0.218, 0, 0], ex: [-0.16, -0.12, 0] }),
    P('Keerring krukas vliegwielzijde', G.torus('x', 0.045, 0.005, 32, 6), MAT.rubber, { d: 'Oliekeerring aan de transmissiezijde.', p: [0.218, 0, 0], ex: [0.16, -0.12, 0] }),
    P('Aanloopring links', G.lathe('x', [[0.031, -0.0012], [0.046, -0.0012], [0.046, 0.0012], [0.031, 0.0012], [0.031, -0.0012]], 20, 'thrust'), MAT.bearing, { d: 'Bepaalt de axiale speling van de krukas.', p: [0.012, 0, 0], ex: [0.05, -0.16, 0.08] }),
    P('Aanloopring rechts', G.lathe('x', [[0.031, -0.0012], [0.046, -0.0012], [0.046, 0.0012], [0.031, 0.0012], [0.031, -0.0012]], 20, 'thrust'), MAT.bearing, { d: 'Bepaalt de axiale speling van de krukas.', p: [-0.012, 0, 0], ex: [-0.05, -0.16, 0.08] }),
  ];
  XM.forEach((x, i) => {
    kids.push(P(`Hoofdlagerkap ${i + 1}`, G.box(0.024, 0.035, 0.11), MAT.iron, { d: 'Lagerkap die de krukas in het blok vasthoudt.', p: [x, -0.0775, 0], ex: [0, -0.34, 0] }));
    kids.push(P(`Hoofdlagerschaal boven ${i + 1}`, G.half('x', 0.0295, 0.02, PI), MAT.bearing, { d: 'Glijlagerschaal in het blok.', p: [x, 0, 0], ex: [0, -0.15, 0.1] }));
    kids.push(P(`Hoofdlagerschaal onder ${i + 1}`, G.half('x', 0.0295, 0.02, 0), MAT.bearing, { d: 'Glijlagerschaal in de lagerkap.', p: [x, 0, 0], ex: [0, -0.27, 0] }));
    [-0.04, 0.04].forEach((z, j) => kids.push(P(`Hoofdlagerbout ${i + 1}${j ? 'b' : 'a'}`, hexBolt(0.09, 0.011), MAT.darkSteel, { d: 'Bout van de hoofdlagerkap.', p: [x, -0.097, z], ex: [0, -0.43, 0] })));
  });
  return A('Motorblok', { d: 'Cilinderblok met krukas, hoofdlagers en keerringen.', ex: [0, 0, 0] }, kids);
}
function buildHead() {
  const hs = shapeOf(rrectPts(0.43, 0.2, 0.02));
  XC.forEach(x => hs.holes.push(circlePath(x, 0, 0.013)));
  const hh = 0.133, head = plan(hs, hh); head.translate(0, DECK + 0.0015 + hh / 2, 0);
  const ports = [];
  XC.forEach(x => { ports.push(xf(G.box(0.07, 0.04, 0.012), [x, 0.29, 0.104])); ports.push(xf(G.box(0.06, 0.035, 0.012), [x, 0.285, -0.104])); });
  const gs = shapeOf(rrectPts(0.428, 0.204, 0.02));
  XC.forEach(x => gs.holes.push(circlePath(x, 0, 0.0425)));
  XM.forEach(x => { gs.holes.push(circlePath(x, 0.072, 0.0065)); gs.holes.push(circlePath(x, -0.072, 0.0065)); });
  const gasket = plan(gs, 0.0015); gasket.translate(0, DECK + 0.00075, 0);
  const cs = shapeOf(rrectPts(0.436, 0.196, 0.03));
  XC.forEach(x => cs.holes.push(circlePath(x, 0, 0.017)));
  const cover = plan(cs, 0.065); cover.translate(0, 0.3565 + 0.0325, 0);
  const coverRibs = [-0.16, -0.08, 0, 0.08, 0.16].map(x => xf(G.box(0.01, 0.01, 0.17), [x + 0.044, 0.426, 0]));
  const gk = shapeOf(rrectPts(0.436, 0.196, 0.03)); gk.holes.push(new THREE.Path(rrectPts(0.416, 0.176, 0.02).map(p => new THREE.Vector2(p[0], p[1]))));
  const coverGasket = plan(gk, 0.002); coverGasket.translate(0, 0.357, 0);
  const valvesIn = [], valvesOut = [];
  for (let c = 0; c < 4; c++) for (let k = 0; k < 2; k++) { valvesIn.push(valveGroup(c, k, 1)); valvesOut.push(valveGroup(c, k, -1)); }
  const kids = [
    P('Cilinderkop', merge([head, ...ports]), MAT.aluCast, { d: 'Aluminium cilinderkop met vier kleppen per cilinder en twee bovenliggende nokkenassen.', spec: [['Materiaal', 'aluminium'], ['Kleppen', '16 (4 per cilinder)'], ['Nokkenassen', '2, bovenliggend']] }),
    P('Koppakking', gasket, MAT.darkSteel, { d: 'Meerlaagse stalen koppakking tussen blok en kop.', ex: [0, -0.24, 0] }),
    P('Nokkenas inlaat', camGeo(0), MAT.steel, { d: 'Bedient de acht inlaatkleppen; heeft een faseversteller op het distributiewiel.', p: [0, CAMY, CAMZ], ex: [0, 0.18, 0.12] }),
    P('Nokkenas uitlaat', camGeo(1.9), MAT.steel, { d: 'Bedient de acht uitlaatkleppen.', p: [0, CAMY, -CAMZ], ex: [0, 0.18, -0.12] }),
    A('Kleppen inlaatzijde', { d: 'Acht inlaatklepgroepen.', ex: [0, -0.2, 0.17], exs: 0.8 }, valvesIn),
    A('Kleppen uitlaatzijde', { d: 'Acht uitlaatklepgroepen.', ex: [0, -0.2, -0.17], exs: 0.8 }, valvesOut),
    P('Kleppendekselpakking', coverGasket, MAT.rubber, { d: 'Rubber pakking onder het kleppendeksel.', ex: [0, 0.34, 0] }),
    P('Kleppendeksel', merge([cover, ...coverRibs]), MAT.aluCast, { d: 'Afdekking boven de nokkenassen, met doorvoeren voor de bobines.', ex: [0, 0.42, 0] }),
    P('Olievuldop', G.cyl('y', 0.02, 0.02, 0.02, 20), MAT.plastic, { d: 'Dop van de olievulopening.', p: [-0.088, 0.432, -0.05], ex: [0, 0.56, 0] }),
  ];
  for (let c = 0; c < 2; c++) XM.forEach((x, i) => kids.push(P(`Nokkenaslagerkap ${c ? 'uitlaat' : 'inlaat'} ${i + 1}`, merge([G.box(0.018, 0.016, 0.042), xf(G.cyl('y', 0.005, 0.005, 0.006, 6), [0, 0.011, 0.014]), xf(G.cyl('y', 0.005, 0.005, 0.006, 6), [0, 0.011, -0.014])]), MAT.aluCast, { d: 'Lagerkap van de nokkenas, met twee bouten.', p: [x, CAMY + 0.0215, c ? -CAMZ : CAMZ], ex: [0, 0.26, 0] })));
  XM.forEach((x, i) => [0.072, -0.072].forEach((z, j) => kids.push(P(`Cilinderkopbout ${i * 2 + j + 1}`, hexBolt(0.16, 0.0105, 'y'), MAT.darkSteel, { d: 'Rekbout die kop en koppakking op het blok klemt.', p: [x, DECK + 0.135, z], r: [PI, 0, 0], ex: [0, 0.3, 0] }))));
  [-0.2, -0.1, 0, 0.1, 0.2].forEach((x, i) => [0.085, -0.085].forEach((z, j) => kids.push(P(`Kleppendekselbout ${i * 2 + j + 1}`, hexBolt(0.03, 0.006), MAT.steel, { d: 'Bout van het kleppendeksel.', p: [x, 0.4215, z], r: [PI, 0, 0], ex: [0, 0.5, 0] }))));
  XC.forEach((x, i) => {
    kids.push(A(`Bougie ${i + 1}`, { d: `Bougie van cilinder ${i + 1}.`, p: [x, DECK + 0.004, 0], ex: [0, 0.26, 0] }, [
      P('Isolator', G.lathe('y', [[0.003, 0.092], [0.0055, 0.085], [0.0055, 0.04], [0, 0.04]], 16, 'plugIns'), MAT.ceramic, { d: 'Keramische isolator.', ex: [0, 0.04, 0] }),
      P('Huis en elektrode', G.lathe('y', [[0.0015, 0], [0.007, 0.004], [0.007, 0.023], [0.0095, 0.026], [0.0095, 0.036], [0.006, 0.04], [0, 0.04]], 6, 'plugBody'), MAT.steel, { d: 'Draadhuis met zeskant en massa-elektrode.' }),
    ]));
    kids.push(P(`Bobine ${i + 1}`, merge([xf(G.cyl('y', 0.011, 0.011, 0.13, 16), [0, 0.365, 0]), xf(G.rbox(0.045, 0.03, 0.05, 0.006), [0, 0.445, 0.008])]), MAT.plastic, { d: 'Losse bobine per cilinder (pencil coil) direct op de bougie.', p: [x, 0, 0], ex: [0, 0.62, 0] }));
  });
  return A('Cilinderkop', { d: 'Cilinderkop met nokkenassen, 16 kleppen, bougies en bobines.', ex: [0, 0.66, 0] }, kids);
}

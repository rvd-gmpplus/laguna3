/* ===================== aandrijflijn: automaat, aandrijfassen, motorsteunen ===================== */
const PT_POS = V3(-0.13, 0.40, 1.50), PT_TILT = -0.18, GB_X = 0.235;
const PTM = new THREE.Matrix4().compose(PT_POS, new THREE.Quaternion().setFromEuler(new THREE.Euler(PT_TILT, 0, 0)), V3(1, 1, 1));
const PTI = PTM.clone().invert();
const toPT = p => V3(...p).applyMatrix4(PTI);
const fromPT = p => V3(...p).applyMatrix4(PTM);
const ENG2CAR = p => fromPT(p).toArray();             // motorframe = aandrijflijnframe
const DIFF = [0.125, -0.04, -0.15];                   // in versnellingsbakframe
const CSH = [-0.101, -0.043];                         // tussenas (y,z)
// Aansluitpunten in het aandrijflijnframe voor andere systemen (contract: sleutels blijven bestaan).
const DRV_PORTS = { starterTerminal: [GB_X + 0.12, -0.035, 0.205] };   // plusaansluiting startmotor

function discPack(name, x0, rIn, rOut, n) {
  const kids = [];
  for (let k = 0; k < n; k++) {
    const fr = k % 2 === 0;
    kids.push(P(`${fr ? 'Frictieplaat' : 'Stalen plaat'} ${Math.floor(k / 2) + 1}`, annulus(rIn, rOut, 0.0022, 'x', 40), fr ? MAT.friction : MAT.steel, { d: fr ? 'Plaat met frictievoering.' : 'Stalen tussenplaat.', p: [x0 + k * 0.0045, 0, 0], ex: [(k - (n - 1) / 2) * 0.026, 0, 0] }));
  }
  kids.push(P('Zuiger en retourveer', merge([annulus(rIn, rOut, 0.004, 'x', 40), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => xf(G.cyl('x', 0.004, 0.004, 0.012, 8, true), [-0.008, (rIn + 0.006) * Math.cos(k * PI / 4), (rIn + 0.006) * Math.sin(k * PI / 4)]))]), MAT.aluCast, { d: 'Hydraulische zuiger die het lamellenpakket samendrukt, met retourveren.', p: [x0 - 0.006, 0, 0], ex: [-(n / 2 + 1) * 0.026, 0, 0] }));
  return kids;
}
function planetSet(name, x0, cfg, d) {
  const kids = [P('Zonnewiel', gear(cfg.sunT, cfg.sunR, cfg.sunR - 0.003, cfg.w, 0.008), MAT.steel, { d: 'Centraal tandwiel van de planetaire set.', p: [x0, 0, 0], ex: [0.07, 0, 0] })];
  cfg.planets.forEach(([rad, ang, w, label], i) => kids.push(P(`${label || 'Planeetwiel'} ${i + 1}`, gear(cfg.plT, cfg.plR, cfg.plR - 0.003, w, 0.005), MAT.steel, { d: 'Planeetwiel dat tussen zonnewiel en ringwiel rolt.', p: [x0, rad * Math.cos(ang), rad * Math.sin(ang)], ex: [0, Math.cos(ang) * 0.07, Math.sin(ang) * 0.07] })));
  kids.push(P('Ringwiel', ringGear(cfg.ringT, cfg.ringOut, cfg.ringTip, cfg.ringTip + 0.004, cfg.w + 0.004), MAT.steel, { d: 'Holwiel met binnenvertanding.', p: [x0, 0, 0], ex: [-0.07, 0, 0] }));
  kids.push(P('Planeetdrager', merge([annulus(0.012, cfg.carR, 0.004, 'x', 32), ...cfg.planets.map(([rad, ang]) => xf(G.cyl('x', 0.005, 0.005, cfg.w + 0.01, 10), [-0.004, rad * Math.cos(ang), rad * Math.sin(ang)]))]), MAT.darkSteel, { d: 'Drager waarop de planeetwielen draaien.', p: [x0 + cfg.w / 2 + 0.004, 0, 0], ex: [0.12, 0, 0] }));
  return A(name, { d }, kids);
}
function semicircle(rc, xc, rr, sgn, n = 14) { const pts = []; for (let k = 0; k <= n; k++) { const f = k / n * PI; pts.push([rc + rr * Math.cos(f), xc + sgn * rr * Math.sin(f)]); } return pts; }
function buildGearbox() {
  const bell = G.lathe('x', [[0.146, 0.0], [0.149, 0.008], [0.143, 0.06], [0.13, 0.11], [0.11, 0.14], [0.08, 0.15]], 48, 'bell');
  const housing = merge([bell, xf(G.rbox(0.25, 0.25, 0.26, 0.03), [0.27, -0.01, -0.03]), xf(G.cyl('x', 0.085, 0.085, 0.12, 32), [0.125, DIFF[1], DIFF[2]]), ...[0.18, 0.24, 0.3, 0.36].map(x => xf(G.box(0.012, 0.012, 0.26), [x, 0.118, -0.03]))]);
  const conv = A('Koppelomvormer', { d: 'Hydraulische koppeling tussen motor en versnellingsbak: pompwiel, turbinewiel en leidwiel versterken het koppel bij het wegrijden; de overbruggingskoppeling schakelt verlies uit bij constant rijden.', ex: [-0.17, 0, 0] }, [
    P('Omvormerdeksel', merge([G.lathe('x', [[0.02, 0.012], [0.11, 0.014], [0.13, 0.022], [0.137, 0.04], [0.137, 0.07]], 48, 'cvcov'), ...[0, 1, 2, 3].map(k => xf(G.cyl('x', 0.006, 0.006, 0.02, 8), [0.002, 0.12 * Math.cos(k * HALF), 0.12 * Math.sin(k * HALF)]))]), MAT.steel, { d: 'Voorste schaal, met nokken naar de flexplaat.', ex: [-0.13, 0, 0] }),
    P('Overbruggingskoppeling', annulus(0.06, 0.125, 0.005, 'x', 48), MAT.friction, { d: 'Lock-up-koppeling die motor en bak direct koppelt.', p: [0.026, 0, 0], ex: [-0.085, 0, 0] }),
    P('Turbinewiel omvormer', merge([G.lathe('x', semicircle(0.098, 0.07, 0.036, -1), 40, 'cvturb'), G.lathe('x', [[0.02, 0.07], [0.062, 0.07], [0.062, 0.075], [0.02, 0.075]], 32, 'cvhub'), xf(blades(24, 0.066, 0.13, 0.026, 0.0015, 0, 'x'), [0.054, 0, 0])]), MAT.steel, { d: 'Turbinewiel, verbonden met de ingaande as.', ex: [-0.04, 0, 0] }),
    P('Leidwiel (stator)', merge([annulus(0.045, 0.072, 0.012, 'x', 32), blades(13, 0.045, 0.072, 0.012, 0.002, 0.6, 'x'), G.cyl('x', 0.03, 0.03, 0.014, 20)]), MAT.aluCast, { d: 'Leidwiel op een vrijloop; buigt de oliestroom om en vergroot zo het koppel.', p: [0.072, 0, 0], ex: [0.02, 0, 0] }),
    P('Pompwiel', merge([G.lathe('x', semicircle(0.098, 0.07, 0.036, 1), 40, 'cvpump'), xf(G.cyl('x', 0.028, 0.028, 0.05, 20), [0.12, 0, 0]), xf(blades(24, 0.066, 0.13, 0.026, 0.0015, 0, 'x'), [0.086, 0, 0])]), MAT.steel, { d: 'Pompwiel, draait mee met de motor en stuwt de olie rond.', ex: [0.09, 0, 0] }),
  ]);
  const pump = A('ATF-oliepomp', { d: 'Pomp die de automaatolie (ATF) op druk brengt voor schakelen, smeren en koelen.', ex: [-0.075, 0, 0] }, [
    P('Pomphuis', annulus(0.048, 0.075, 0.018, 'x', 40), MAT.aluCast, { d: 'Behuizing van de oliepomp.', p: [0.149, 0, 0], ex: [-0.03, 0, 0] }),
    P('Binnenrotor', gear(10, 0.032, 0.026, 0.012, 0.014), MAT.steel, { d: 'Aangedreven binnenrotor.', p: [0.149, 0, 0], ex: [0.03, 0, 0.0] }),
    P('Buitenrotor', ringGear(11, 0.046, 0.033, 0.038, 0.012), MAT.steel, { d: 'Meedraaiende buitenrotor.', p: [0.149, 0, 0], ex: [0.06, 0, 0] }),
  ]);
  const frontSet = planetSet('Planeetwielset voor', 0.205, { sunT: 14, sunR: 0.022, plT: 14, plR: 0.022, w: 0.02, ringT: 46, ringOut: 0.082, ringTip: 0.066, carR: 0.058, planets: [0, 1, 2].map(k => [0.044, k * PI * 2 / 3, 0.02]) }, 'Eerste planetaire tandwielset.');
  const rearSet = planetSet('Planeetwielset achter', 0.27, { sunT: 16, sunR: 0.026, plT: 12, plR: 0.02, w: 0.026, ringT: 52, ringOut: 0.09, ringTip: 0.08, carR: 0.07, planets: [0, 1, 2].map(k => [0.046, k * PI * 2 / 3, 0.024, 'Korte planeet']).concat([0, 1, 2].map(k => [0.06, PI / 3 + k * PI * 2 / 3, 0.044, 'Lange planeet'])) }, 'Tweede planetaire set met korte en lange planeetwielen.');
  const counter = A('Tussenas', { d: 'Brengt de kracht van de hoofdas over naar het differentieel.', ex: [0, -0.22, -0.08] }, [
    P('Tussenas', G.cyl('x', 0.013, 0.013, 0.3, 16), MAT.steel, { d: 'As van de tussenoverbrenging.', p: [0.225, CSH[0], CSH[1]] }),
    P('Aangedreven tandwiel', gear(34, 0.06, 0.056, 0.018, 0.012), MAT.steel, { d: 'Wordt aangedreven door het uitgaande tandwiel.', p: [0.362, CSH[0], CSH[1]], ex: [0.06, 0, 0] }),
    P('Rondsel eindoverbrenging', gear(15, 0.035, 0.031, 0.022, 0.012), MAT.steel, { d: 'Drijft het kroonwiel van het differentieel aan.', p: [0.125, CSH[0], CSH[1]], ex: [-0.06, 0, 0] }),
  ]);
  const cone = (r, h, key) => G.lathe('y', [[0, 0], [r, 0], [r * 0.65, h], [0, h]], 18, key);
  const diff = A('Differentieel', { d: 'Verdeelt het koppel over beide voorwielen en laat ze in bochten verschillend snel draaien.', p: DIFF, ex: [0.02, -0.1, -0.3] }, [
    P('Kroonwiel', gear(60, 0.088, 0.084, 0.02, 0.05), MAT.steel, { d: 'Groot tandwiel van de eindoverbrenging.', ex: [-0.07, 0, 0] }),
    P('Differentieelhuis', G.lathe('x', [[0.022, -0.01], [0.05, -0.005], [0.058, 0.02], [0.058, 0.05], [0.04, 0.07], [0.022, 0.075]], 32, 'diffh'), MAT.iron, { d: 'Huis waarin de differentieelwielen draaien.' }),
    P('Satellietas', G.cyl('y', 0.006, 0.006, 0.09, 10), MAT.steel, { d: 'As van de satellietwielen.', p: [0.035, 0, 0], ex: [0, 0, 0.11] }),
    P('Satellietwiel boven', cone(0.018, 0.014, 'sat'), MAT.steel, { d: 'Satellietwiel (kegeltandwiel).', p: [0.035, 0.036, 0], r: [PI, 0, 0], ex: [0, 0.08, 0] }),
    P('Satellietwiel onder', cone(0.018, 0.014, 'sat'), MAT.steel, { d: 'Satellietwiel (kegeltandwiel).', p: [0.035, -0.036, 0], ex: [0, -0.08, 0] }),
    P('Zijwiel links', G.lathe('-x', [[0, 0], [0.02, 0], [0.014, 0.014], [0, 0.014]], 18, 'sidegL'), MAT.steel, { d: 'Kegeltandwiel naar de linker aandrijfas.', p: [0.071, 0, 0], ex: [0.09, 0, 0] }),
    P('Zijwiel rechts', G.lathe('x', [[0, 0], [0.02, 0], [0.014, 0.014], [0, 0.014]], 18, 'sidegR'), MAT.steel, { d: 'Kegeltandwiel naar de rechter aandrijfas.', p: [-0.001, 0, 0], ex: [-0.09, 0, 0] }),
  ]);
  const vb = A('Hydraulische besturing', { d: 'Klepblok met magneetkleppen dat de koppelingen en remmen in de bak aanstuurt.', ex: [0, -0.34, 0.08] }, [
    P('Klepblok', merge([G.box(0.2, 0.035, 0.16), ...[-0.06, 0, 0.06].map(x => xf(G.box(0.012, 0.006, 0.15), [x, 0.02, 0]))]), MAT.aluCast, { d: 'Kanalenplaat met schuiven die de oliedruk verdelen.', p: [0.26, -0.153, 0.02] }),
    ...[0, 1, 2, 3, 4, 5].map(k => P(`Magneetklep ${k + 1}`, G.cyl('z', 0.009, 0.009, 0.04, 12), MAT.darkSteel, { d: 'Elektrisch bediende klep (solenoïde) die een schakelelement aanstuurt.', p: [0.185 + k * 0.03, -0.148, 0.11], ex: [0, 0, 0.09] })),
    P('ATF-filter', G.box(0.18, 0.012, 0.14), MAT.filter, { d: 'Zeef/filter voor de automaatolie.', p: [0.26, -0.18, 0.02], ex: [0, -0.07, 0] }),
    P('Carter automaat', G.rbox(0.24, 0.04, 0.19, 0.01), MAT.aluCast, { d: 'Oliecarter van de automaat.', p: [0.26, -0.21, 0.02], ex: [0, -0.15, 0] }),
  ]);
  const starter = P('Startmotor', merge([G.cyl('x', 0.038, 0.038, 0.15, 24), xf(G.cyl('x', 0.02, 0.02, 0.08, 16), [0.02, 0.045, 0.012]), xf(gear(9, 0.013, 0.01, 0.014, 0.004), [-0.08, 0, 0])]), MAT.darkSteel, { d: 'Elektromotor die via de startkrans van de flexplaat de motor aanslingert.', p: [0.1, -0.08, 0.19], ex: [0, -0.06, 0.3] });
  return A('Automaatversnellingsbak', {
    d: 'Klassieke zestraps automaat met koppelomvormer, planetaire tandwielsets en lamellenkoppelingen, dwars naast de motor geplaatst met ingebouwd differentieel.',
    spec: [['Type', '6-traps automaat'], ['Koppeling', 'koppelomvormer met lock-up'], ['Aandrijving', 'voorwielen'], ['Plaats', 'dwars, links van de motor']],
    p: [GB_X, 0, 0], ex: [0.66, 0, 0],
  }, [
    P('Transmissiehuis', housing, MAT.aluCast, { d: 'Aluminium huis met koppelomvormerklok en differentieelhuis.', ex: [0, 0.44, 0] }),
    conv, pump,
    A('Koppeling C1', { d: 'Lamellenkoppeling.', ex: [-0.02, 0, 0] }, discPack('C1', 0.167, 0.045, 0.075, 6)),
    frontSet,
    A('Koppeling C2', { d: 'Lamellenkoppeling.', ex: [0.1, 0, 0] }, discPack('C2', 0.224, 0.045, 0.075, 6)),
    rearSet,
    A('Rem B1', { d: 'Lamellenrem die een deel van de planetaire set vastzet.', ex: [0.24, 0, 0] }, discPack('B1', 0.297, 0.065, 0.09, 6)),
    A('Rem B2', { d: 'Lamellenrem die een deel van de planetaire set vastzet.', ex: [0.31, 0, 0] }, discPack('B2', 0.33, 0.065, 0.09, 6)),
    P('Uitgaand tandwiel', gear(28, 0.05, 0.046, 0.018, 0.012), MAT.steel, { d: 'Geeft de kracht van de planetaire sets door aan de tussenas.', p: [0.362, 0, 0], ex: [0.38, 0, 0] }),
    P('Ingaande as', G.cyl('x', 0.012, 0.012, 0.36, 14), MAT.steel, { d: 'Hoofdas van turbinewiel naar de planetaire sets.', p: [0.2, 0, 0], ex: [0, 0, 0.3] }),
    counter, diff, vb, starter,
    P('Keuzeas met hendel', merge([G.cyl('z', 0.008, 0.008, 0.05, 10), xf(G.box(0.012, 0.05, 0.012), [0, 0.025, 0.025])]), MAT.steel, { d: 'Verbindt de keuzehendel (P-R-N-D) met de handklep in de bak.', p: [0.3, 0.13, 0.05], ex: [0, 0.56, 0.08] }),
    P('Standensensor', G.rbox(0.05, 0.04, 0.03, 0.006), MAT.plastic, { d: 'Meldt de gekozen stand aan de transmissiecomputer en blokkeert starten buiten P/N.', p: [0.3, 0.1, 0.11], ex: [0.05, 0.5, 0.15] }),
  ]);
}
function bellows(r1, r2, len, n) { const pts = []; for (let k = 0; k <= n * 2; k++) pts.push([k % 2 ? r2 : r1, k / (n * 2) * len]); return pts; }
function driveshaft(name, a, b) {
  const A3 = V3(...a), B3 = V3(...b), dir = B3.clone().sub(A3), L = dir.length();
  const q = quatFromTo(V3(1, 0, 0), dir);
  const bel = G.lathe('x', bellows(0.034, 0.024, 0.08, 4), 24, 'bel');
  return A(name, { d: 'Aandrijfas met homokinetische koppelingen aan beide kanten.', p: a, q }, [
    P('Homokineet binnen', G.lathe('x', [[0, 0], [0.042, 0], [0.042, 0.07], [0.03, 0.08], [0, 0.08]], 28, 'cvin'), MAT.steel, { d: 'Tripode-koppeling aan de versnellingsbakzijde; vangt lengteverschil op.', ex: [-0.07, 0, 0] }),
    P('Manchet binnen', bel, MAT.rubber, { d: 'Rubber stofhoes die het vet in de koppeling houdt.', p: [0.08, 0, 0], ex: [-0.02, 0.07, 0] }),
    P('As', G.cyl('x', 0.012, 0.012, L - 0.3, 14), MAT.steel, { d: 'Stalen tussenas.', p: [L / 2, 0, 0], ex: [0, 0.12, 0] }),
    P('Manchet buiten', bel, MAT.rubber, { d: 'Rubber stofhoes van de buitenste koppeling.', p: [L - 0.16, 0, 0], ex: [0.02, 0.07, 0] }),
    P('Homokineet buiten', G.lathe('x', [[0, -0.08], [0.045, -0.075], [0.048, -0.04], [0.03, -0.005], [0.016, 0], [0.016, 0.04], [0, 0.04]], 28, 'cvout'), MAT.steel, { d: 'Kogelkoppeling bij het wiel; laat sturen en veren toe.', p: [L, 0, 0], ex: [0.07, 0, 0] }),
  ]);
}
function buildPowertrain() {
  const engine = buildEngine();
  engine.ex = V3(-0.24, 0.12, 0);
  const gb = buildGearbox();
  const dL = [GB_X + DIFF[0] + 0.08, DIFF[1], DIFF[2]], dR = [GB_X + DIFF[0] - 0.02, DIFF[1], DIFF[2]];
  const hubL = toPT([0.715, AY, AXF]).toArray(), hubR = toPT([-0.715, AY, AXF]).toArray();
  const shafts = A('Aandrijfassen', { d: 'Linker (kort) en rechter (lang) aandrijfas van differentieel naar de voorwielen.', ex: [0, -0.45, -0.25] }, [
    driveshaft('Aandrijfas links', dL, hubL), driveshaft('Aandrijfas rechts', dR, hubR),
  ]);
  shafts.kids[0].ex = V3(0.12, 0, 0); shafts.kids[1].ex = V3(-0.12, 0, 0);
  const sub = toPT([0, 0.27, 1.2]).toArray(), rodA = [0, -0.14, -0.1];
  const mounts = A('Motorsteunen', { d: 'Rubber/hydraulische steunen die motor en bak trillingsarm in de carrosserie ophangen.', ex: [0, 0.6, 0] }, [
    P('Motorsteun distributiezijde', merge([G.rbox(0.09, 0.08, 0.11, 0.015), xf(G.box(0.12, 0.02, 0.06), [0.06, -0.02, 0])]), MAT.darkSteel, { d: 'Hydraulische motorsteun aan de rechterkant.', p: [-0.36, 0.32, 0.08], ex: [-0.12, 0, 0] }),
    P('Steun versnellingsbak', merge([G.rbox(0.1, 0.08, 0.12, 0.015), xf(G.box(0.06, 0.02, 0.08), [-0.06, -0.02, 0])]), MAT.darkSteel, { d: 'Rubbersteun aan de bakzijde.', p: [GB_X + 0.4, 0.08, 0], ex: [0.12, 0, 0] }),
    P('Reactiestang', merge([rodBetween(rodA, sub, 0.012), xf(G.cyl('x', 0.025, 0.025, 0.03, 16), rodA), xf(G.cyl('x', 0.025, 0.025, 0.03, 16), sub)]), MAT.darkSteel, { d: 'Koppelsteun onder de motor die kantelen bij optrekken en remmen opvangt.', ex: [0, -0.2, -0.1] }),
  ]);
  return A('Aandrijflijn', {
    d: 'Dwarsgeplaatste motor en automaat met differentieel en aandrijfassen naar de voorwielen.',
    spec: [['Motor', '2.0 Turbo F4Rt, 170 pk'], ['Transmissie', '6-traps automaat'], ['Aandrijving', 'voorwielen'], ['Topsnelheid', '220 km/h'], ['0–100 km/h', '9,2 s']],
    p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [0, 0.35, 1.9],
  }, [engine, gb, shafts, mounts]);
}

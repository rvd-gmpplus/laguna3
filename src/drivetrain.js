/* ===================== aandrijflijn: automaat (Jatco JF613E / Renault AJ0), aandrijfassen, motorsteunen, startmotor =====================
   Opbouw van de bak volgens research/automaat.md: drie planetaire sets (reductie, FR met vier planeetwielen, RR met korte en lange
   planeetwielen), vijf schakelelementen plus vrijloop, 42/45/21/70 tanden. Interne koppeling van de sets is schematisch. */
const PT_POS = V3(-0.13, 0.40, 1.50), PT_TILT = -0.18, GB_X = 0.235;
const PTM = new THREE.Matrix4().compose(PT_POS, new THREE.Quaternion().setFromEuler(new THREE.Euler(PT_TILT, 0, 0)), V3(1, 1, 1));
const PTI = PTM.clone().invert();
const toPT = p => V3(...p).applyMatrix4(PTI);
const fromPT = p => V3(...p).applyMatrix4(PTM);
const ENG2CAR = p => fromPT(p).toArray();             // motorframe = aandrijflijnframe
const DIFF = [0.125, -0.04, -0.15];                   // differentieel in versnellingsbakframe (x vanaf het motorvlak, y, z)
const DRV_GM = 0.0025;                                // modulus eindoverbrenging (42/45 en 21/70 tanden)
// tussenas: snijpunt van de cirkels om de ingaande as (afstand (42+45)/2 m) en om het differentieel ((21+70)/2 m)
const CSH = (() => {
  const r1 = (42 + 45) / 2 * DRV_GM, r2 = (21 + 70) / 2 * DRV_GM, dy = DIFF[1], dz = DIFF[2], d = Math.hypot(dy, dz);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const ux = dy / d, uz = dz / d, c1 = [a * ux - h * uz, a * uz + h * ux], c2 = [a * ux + h * uz, a * uz - h * ux];
  return c1[0] < c2[0] ? c1 : c2;                     // het punt onder de ingaande as
})();
const DRV_ST = [-0.040, 0.147];                       // startmotoras (y,z) in het motorframe: op afstand 0,155 van de krukas, dicht bij de startkrans
// Aansluitpunten in het aandrijflijnframe voor andere systemen (contract: sleutels blijven bestaan).
// De waarde wordt na het bouwen van de startmotor op het plusklemmetje gezet.
const DRV_PORTS = { starterTerminal: [GB_X + 0.1, DRV_ST[0] + 0.062, DRV_ST[1] + 0.012] };

std('drvBrass', 0xb89a5e, 0.9, 0.35);
std('drvPaper', 0xcdbf93, 0, 0.95);
std('drvBlack', 0x17181a, 0.2, 0.6);
std('drvSolenoid', 0x2c3036, 0.55, 0.5);
std('drvMagnet', 0x6c7077, 0.8, 0.4);

/* ---------- hulpen ---------- */
// tandwiel met nominale modulus m: kopcirkel (N/2+1)m, voetcirkel (N/2-1,25)m
function drvG(N, m, w, hole = 0, ax = 'x') { return gear(N, +(m * (N / 2 + 1)).toFixed(5), +(m * (N / 2 - 1.25)).toFixed(5), w, hole, ax); }
// n kopieen van fn() op een cirkel (y,z) om as x
function drvRing(key, n, r, fn, phase = 0, c = [0, 0], x = 0) {
  return cache(key, () => merge(Array.from({ length: n }, (_, k) => { const a = phase + k * PI * 2 / n; return xf(fn(), [x, c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); })));
}
function drvBoltRing(key, n, r, len, d, ax, phase = 0, c = [0, 0], x = 0) { return drvRing(key, n, r, () => hexBolt(len, d, ax), phase, c, x); }
function semicircle(rc, xc, rr, sgn, n = 14) { const pts = []; for (let k = 0; k <= n; k++) { const f = k / n * PI; pts.push([rc + rr * Math.cos(f), xc + sgn * rr * Math.sin(f)]); } return pts; }
const drvL = (key, pts, seg = 32, ax = 'x') => G.lathe(ax, pts, seg, 'drv' + key);
// platenpakket: afwisselend frictieplaat (buitenvertanding) en stalen plaat (binnenvertanding); geeft lijst onderdelen terug
function drvPlates(key, o, tF, tS) {
  const kids = [], n = o.nF + o.nS, fricFirst = o.nF >= o.nS, sp = o.sp || 0.014;
  let iF = 0, iS = 0;
  for (let k = 0; k < n; k++) {
    const fr = fricFirst ? k % 2 === 0 : k % 2 === 1, idx = fr ? ++iF : ++iS;
    kids.push(fr
      ? P(`Frictieplaat ${idx}`, drvG(o.teeth || 18, o.fro / ((o.teeth || 18) / 2 + 1), tF, o.fri), MAT.friction, { d: 'Stalen plaatje met frictievoering aan beide zijden en vertanding aan de buitenrand; draait mee met de trommel.', p: [o.x0 + k * o.st, 0, 0], ex: [(k + 1) * sp, 0, 0], inner: true })
      : P(`Stalen plaat ${idx}`, annulus(o.sri, o.sro, tS, 'x', 40), MAT.steel, { d: 'Gladde stalen tussenplaat met binnenvertanding (schematisch weergegeven); wordt tegen de frictieplaten geklemd.', p: [o.x0 + k * o.st, 0, 0], ex: [(k + 1) * sp, 0, 0], inner: true }));
  }
  return kids;
}
// schakelelement (koppeling of rem): trommel, zuiger, veren, platen, drukplaat, borgring. Alle x-waarden in het bakframe.
function drvPack(name, d, spec, o) {
  const n = o.nF + o.nS, xe = o.x0 + n * o.st, sp = o.sp || 0.014, xw = o.x0 - 0.0195, rD = o.fro + 0.005;
  const kids = [];
  kids.push(P(o.drumName, drvL('Drum' + name, [[o.hub, xw], [rD, xw], [rD, xe + 0.008], [rD - 0.003, xe + 0.008], [rD - 0.003, xw + 0.003], [o.hub, xw + 0.003]], 40), o.drumMat || MAT.aluCast, { d: o.drumD, ex: [-sp * 3, 0, 0], inner: true }));
  kids.push(P('Zuiger', annulus(o.hub + 0.004, rD - 0.004, 0.007, 'x', 40), MAT.aluCast, { d: 'Hydraulische zuiger; de olie uit het klepblok drukt hem tegen het platenpakket. Afdichting met kunststof ringen, schematisch weergegeven.', p: [o.x0 - 0.0125, 0, 0], ex: [-sp * 2, 0, 0], inner: true }));
  kids.push(P('Terugdrukveren', drvRing('drvTv' + name, 8, (o.hub + rD) / 2, () => G.cyl('x', 0.0035, 0.0035, 0.008, 6), 0.2, [0, 0], o.x0 - 0.0045), MAT.darkSteel, { d: 'Terugdrukveren (schematisch weergegeven als veerkolommen, aantal geschat) die de zuiger terugdrukken als de oliedruk wegvalt.', ex: [-sp * 1, 0, 0], inner: true }));
  kids.push(...drvPlates(name, o, 0.0013, 0.0015));
  kids.push(P('Drukplaat', annulus(o.sri, o.sro, 0.004, 'x', 40), MAT.darkSteel, { d: 'Dikkere stalen plaat achter het pakket; de dikte stelt de speling van het pakket af.', p: [xe + 0.002, 0, 0], ex: [(n + 2) * sp, 0, 0], inner: true }));
  kids.push(P('Borgring', annulus(o.sro - 0.003, o.sro + 0.001, 0.0022, 'x', 40), MAT.steel, { d: 'Veerring die de drukplaat in de trommel vasthoudt.', p: [xe + 0.0055, 0, 0], ex: [(n + 3) * sp, 0, 0], inner: true }));
  return A(name, { d, spec, ex: o.ex }, kids);
}
// planetaire set met zonnewiel, drager, planeetwielen en holwiel; N* = tanden, m = modulus
function drvPlanets(key, name, d, o) {
  const { m, w, Ns, Np, Nr, n, x } = o, rp = m * (Ns + Np) / 2, kids = [];
  kids.push(P('Zonnewiel', drvG(Ns, m, w, 0.008), MAT.steel, { d: `Zonnewiel (${Ns} tanden, schematisch weergegeven).`, p: [x, 0, 0], ex: [-0.075, 0, 0], inner: true }));
  const pl = [];
  for (let k = 0; k < n; k++) {
    const a = k * PI * 2 / n + (o.ph || 0);
    pl.push(P(`Planeetwiel ${k + 1}`, drvG(Np, m, w, 0.004), MAT.steel, { d: `Planeetwiel (${Np} tanden) op een pen van de drager.`, p: [x, rp * Math.cos(a), rp * Math.sin(a)], ex: [0, 0.08 * Math.cos(a), 0.08 * Math.sin(a)], inner: true }));
  }
  kids.push(...pl);
  kids.push(P('Planeetdrager', cache('drvCar' + key, () => merge([annulus(0.012, rp + 0.012, 0.004, 'x', 36), xf(annulus(0.012, rp + 0.012, 0.004, 'x', 36), [w + 0.008, 0, 0]), ...Array.from({ length: n }, (_, k) => { const a = k * PI * 2 / n + (o.ph || 0); return xf(G.cyl('x', 0.0035, 0.0035, w + 0.012, 8), [(w + 0.008) / 2, rp * Math.cos(a), rp * Math.sin(a)]); })])), MAT.darkSteel, { d: 'Drager met de pennen waarop de planeetwielen draaien.', p: [x - w / 2 - 0.002, 0, 0], ex: [0.075, 0, 0], inner: true }));
  kids.push(P('Holwiel', ringGear(Nr, m * (Nr / 2 + 1) + 0.008, m * (Nr / 2 - 1), m * (Nr / 2 + 1.25), w + 0.004, 'x'), MAT.steel, { d: `Holwiel met binnenvertanding (${Nr} tanden).`, p: [x, 0, 0], ex: [0.15, 0, 0], inner: true }));
  return A(name, { d, ex: o.ex }, kids);
}
const drvNeedle = (key, rIn, rOut, t) => annulus(rIn, rOut, t, 'x', 24);

/* ---------- koppelomvormer ---------- */
function drvConverter() {
  const cover = drvL('Cov', [[0.022, 0.004], [0.11, 0.006], [0.13, 0.016], [0.137, 0.040], [0.137, 0.072]], 48);
  const shellT = drvL('Turb', semicircle(0.098, 0.07, 0.036, -1), 40), shellP = drvL('Pump', semicircle(0.098, 0.07, 0.036, 1), 40);
  const sp = 0.05;
  return A('Koppelomvormer', {
    d: 'Hydraulische koppeling tussen motor en versnellingsbak: het pompwiel stuwt olie naar het turbinewiel, het leidwiel vergroot het koppel bij het wegrijden en de overbruggingskoppeling schakelt het slip uit vanaf de tweede versnelling.',
    spec: [['Elementen', '3 (pompwiel, turbinewiel, leidwiel)'], ['Overbrugging', 'lock-up in 2e tot en met 6e'], ['Buitendiameter', 'circa 275 mm (geschat)']],
    ex: [0, 0, 0.42], inner: true,
  }, [
    P('Omvormerdeksel', merge([cover, G.cyl('x', 0.012, 0.012, 0.016, 12)]), MAT.steel, { d: 'Voorste schaal van de omvormer, aan het pompwiel gelast; met vier nokken naar de flexplaat van de motor.', ex: [-0.02, 0, 0] }),
    P('Omvormernokken', drvRing('drvNokken', 4, 0.115, () => G.cyl('x', 0.006, 0.006, 0.02, 10), PI / 4, [0, 0], -0.0035), MAT.darkSteel, { d: 'Vier nokken op het deksel waarmee de omvormer aan de flexplaat wordt geschroefd.', ex: [-0.045, 0, 0] }),
    P('Omvormerbouten', drvBoltRing('drvNokBouten', 4, 0.115, 0.014, 0.011, 'x', PI / 4, [0, 0], -0.0185), MAT.drvBlack || MAT.darkSteel, { d: 'Vier bouten die de omvormer door de flexplaat in de nokken vastzetten; schematisch weergegeven.', ex: [-0.07, 0, 0] }),
    A('Overbruggingskoppeling', { d: 'Lock-up-koppeling: een zuiger met frictievoering die tegen het deksel klemt en motor en bak direct koppelt.', ex: [sp * 1, 0, 0], inner: true }, [
      P('Overbruggingszuiger', annulus(0.05, 0.126, 0.005, 'x', 48), MAT.aluCast, { d: 'Zuiger die onder oliedruk tegen het deksel wordt gedrukt.', p: [0.0215, 0, 0], ex: [0.02, 0, 0] }),
      P('Frictievoering', annulus(0.098, 0.124, 0.0016, 'x', 48), MAT.friction, { d: 'Frictielaag op de rand van de zuiger.', p: [0.0185, 0, 0], ex: [-0.015, 0, 0] }),
    ]),
    A('Torsiedemper', { d: 'Veerdemper tussen de overbruggingskoppeling en de turbine; dempt de trillingen van de motor als de koppeling vastklemt.', ex: [sp * 2, 0, 0], inner: true }, [
      P('Demperplaat', annulus(0.035, 0.097, 0.003, 'x', 40), MAT.steel, { d: 'Plaat met vensters voor de demperveren.', p: [0.0285, 0, 0], ex: [0.012, 0, 0] }),
      P('Demperveren', drvRing('drvDemperV', 6, 0.085, () => spring(0.0055, 0.0011, 0.034, 2.5, 'z'), 0.0, [0, 0], 0.0285), MAT.darkSteel, { d: 'Zes schroefveren (schematisch weergegeven) die het koppel van de zuiger naar de turbine overbrengen.', ex: [0.034, 0, 0] }),
      P('Demperring', annulus(0.071, 0.099, 0.003, 'x', 40), MAT.darkSteel, { d: 'Tweede plaat die de veren in hun vensters houdt.', p: [0.0315, 0, 0], ex: [0.056, 0, 0] }),
    ]),
    A('Turbinewiel', { d: 'Turbinewiel met schoepen: wordt door de olie van het pompwiel aangedreven en geeft het koppel via de naaf aan de ingaande as.', ex: [sp * 3.2, 0, 0], inner: true }, [
      P('Turbineschaal', merge([shellT, drvL('TurbHub', [[0.02, 0.07], [0.062, 0.07], [0.062, 0.075], [0.02, 0.075]], 32), G.cyl('x', 0.03, 0.03, 0.016, 20)]), MAT.steel, { d: 'Schaal en naaf van het turbinewiel; de naaf grijpt met spiebanen in de ingaande as.', ex: [0, 0, 0] }),
      P('Turbineschoepen', xf(blades(24, 0.066, 0.13, 0.026, 0.0015, 0, 'x'), [0.054, 0, 0]), MAT.steel, { d: 'Gebogen schoepen (aantal schematisch).', ex: [-0.015, 0, 0] }),
    ]),
    A('Leidwiel met vrijloop', { d: 'Leidwiel (stator) dat de oliestroom omkeert en zo het koppel vergroot; draait dankzij de vrijloop alleen in één richting.', ex: [sp * 4.4, 0, 0], inner: true }, [
      P('Leidwiel (stator)', merge([annulus(0.04, 0.046, 0.013, 'x', 32), blades(13, 0.046, 0.074, 0.013, 0.002, 0.6, 'x')]), MAT.aluCast, { d: 'Leidwiel met gebogen schoepen op een vrijloop.', p: [0.0725, 0, 0], ex: [0, 0.0, 0.0001] }),
      P('Vrijloop buitenring', annulus(0.03, 0.04, 0.013, 'x', 32), MAT.steel, { d: 'Buitenring van de vrijloop (sprag) in het leidwiel.', p: [0.0725, 0, 0], ex: [0.035, 0, 0] }),
      P('Vrijloop klemlichamen', drvRing('drvSprag', 12, 0.0345, () => G.box(0.011, 0.0035, 0.005), 0, [0, 0], 0.0725), MAT.darkSteel, { d: 'Klemlichamen die het leidwiel in één richting vastzetten (aantal schematisch).', ex: [0.07, 0, 0] }),
      P('Vrijloop binnenring', annulus(0.02, 0.029, 0.013, 'x', 32), MAT.steel, { d: 'Binnenring van de vrijloop op de vaste stator-as in de oliepomp.', p: [0.0725, 0, 0], ex: [0.105, 0, 0] }),
      P('Axiaal lager voor', drvNeedle('a', 0.022, 0.044, 0.003), MAT.bearing, { d: 'Axiaal naaldlager tussen turbinewiel en leidwiel (schematisch weergegeven).', p: [0.0645, 0, 0], ex: [-0.045, 0, 0] }),
      P('Axiaal lager achter', drvNeedle('a', 0.022, 0.044, 0.003), MAT.bearing, { d: 'Axiaal naaldlager tussen leidwiel en pompwiel (schematisch weergegeven).', p: [0.0805, 0, 0], ex: [0.145, 0, 0] }),
    ]),
    A('Pompwiel', { d: 'Pompwiel (impeller): vast aan het deksel verbonden, draait met de motor mee en stuwt de olie naar het turbinewiel; de naaf drijft de oliepomp aan.', ex: [sp * 6.2, 0, 0], inner: true }, [
      P('Pompwielschaal', merge([shellP, drvL('PumpHub', [[0.028, 0.095], [0.028, 0.15]], 24), drvL('PumpHub2', [[0.028, 0.095], [0.06, 0.095]], 24)]), MAT.steel, { d: 'Schaal van het pompwiel met lange naaf die in de oliepomp draait.', ex: [0, 0, 0] }),
      P('Pompwielschoepen', xf(blades(24, 0.066, 0.13, 0.026, 0.0015, 0, 'x'), [0.086, 0, 0]), MAT.steel, { d: 'Gebogen schoepen (aantal schematisch).', ex: [-0.03, 0, 0] }),
    ]),
  ]);
}

/* ---------- oliepomp met zeef ---------- */
function drvPump() {
  return A('ATF-oliepomp', { d: 'Pomp die de automaatolie (ATF) op druk brengt voor schakelen, smeren en koelen; wordt door de naaf van het pompwiel aangedreven. Het pomptype is niet gevonden: schematisch weergegeven als binnen- en buitenrotor.', ex: [0.08, -0.28, 0.0], inner: true }, [
    P('Pomphuis', merge([annulus(0.048, 0.092, 0.02, 'x', 40), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => xf(G.cyl('x', 0.006, 0.006, 0.02, 8), [0, 0.082 * Math.cos(k * PI / 4), 0.082 * Math.sin(k * PI / 4)]))]), MAT.aluCast, { d: 'Behuizing van de oliepomp, met kanalen naar het klepblok.', p: [0.1305, 0, 0], ex: [0.0, 0, 0.06] }),
    P('Pompbus', annulus(0.027, 0.032, 0.03, 'x', 24), MAT.drvBrass, { d: 'Bronzen bus waarin de naaf van het pompwiel draait.', p: [0.135, 0, 0], ex: [-0.07, 0, 0] }),
    P('Binnenrotor', gear(10, 0.032, 0.026, 0.012, 0.03), MAT.steel, { d: 'Binnenrotor, door de pompwielnaaf aangedreven.', p: [0.1305, 0, 0], ex: [0.035, 0, 0] }),
    P('Buitenrotor', ringGear(11, 0.046, 0.033, 0.0375, 0.012), MAT.steel, { d: 'Meedraaiende buitenrotor.', p: [0.1305, 0, 0], ex: [0.07, 0, 0] }),
    P('Pompdeksel', annulus(0.03, 0.09, 0.008, 'x', 40), MAT.aluCast, { d: 'Deksel van de pomp; het leidwielas zit hierin vast.', p: [0.1465, 0, 0], ex: [0.11, 0, 0] }),
    P('Dichtringen ingaande as', cache('drvDRing', () => merge([0, 1, 2].map(k => xf(G.torus('x', 0.0125, 0.0013, 16, 6), [k * 0.005, 0, 0])))), MAT.drvBrass, { d: 'Drie metalen afdichtringen op de ingaande as (aantal schematisch).', p: [0.155, 0, 0], ex: [0.15, 0, 0] }),
    P('Oliezeef', G.box(0.07, 0.012, 0.055), MAT.filter, { d: 'Zeef op de pomp die de olie reinigt vóór de pomp; zit niet in een losse onderpan.', p: [0.1305, -0.085, 0.0], ex: [0, -0.07, 0] }),
    P('Zeefmagneet', G.box(0.02, 0.008, 0.012), MAT.drvMagnet, { d: 'Magneet op de zeef die staalslijpsel opvangt.', p: [0.1305, -0.093, 0.0], ex: [0, -0.12, 0] }),
    P('O-ring zeef', G.torus('y', 0.016, 0.0016, 20, 6), MAT.rubber, { d: 'Afdichting tussen zeef en pomphuis.', p: [0.1305, -0.078, 0.0], ex: [0, -0.04, 0] }),
  ]);
}

/* ---------- schakelelementen en planetaire sets ---------- */
function drvClutches() {
  const st = 0.0029;
  return A('Koppelingen en remmen', {
    d: 'De vijf schakelelementen met lamellenpakket (lage koppeling, 3-5-achteruitkoppeling, hoge koppeling, 2-6-rem, lage/achteruitrem) en de vrijloop; elk element zet een deel van de planetaire sets vast of koppelt het aan de ingaande as. Aantal platen volgens de aftermarketcatalogus; zuigers, veren en trommels schematisch weergegeven.',
    spec: [['Schakelelementen', '5 plus vrijloop'], ['Platen 3-5-R', '5 frictie, 5 staal'], ['Platen lage koppeling', '5 frictie, 4 staal'], ['Platen hoge koppeling', '6 frictie, 6 staal'], ['Platen 2-6-rem', '4 frictie, 3 staal'], ['Platen L/R-rem', '4 frictie, 4 staal']],
    ex: [0, -0.22, 0.12], inner: true,
  }, [
    drvPack('3-5-achteruitkoppeling', 'Brengt het gereduceerde koppel van de reductieset naar het zonnewiel van de voorste set; actief in de 3e en 5e versnelling en achteruit. Pakket en maten volgens catalogus (frictieplaat Ø159 mm).', [['Frictieplaten', '5 × Ø159 mm'], ['Stalen platen', '5']], { x0: 0.165, st, nF: 5, nS: 5, fri: 0.052, fro: 0.0795, sri: 0.05, sro: 0.0735, hub: 0.032, drumName: 'Trommel 3-5-R', drumD: 'Koppelingstrommel (in het handboek alleen als geheel vervangbaar).', ex: [-0.2, 0.2, 0.0], sp: 0.016 }),
    drvPack('Lage koppeling', 'Draagt het ingangskoppel naar het holwiel van de voorste set; actief in de 1e tot en met 4e versnelling. De trommel draagt het toerentalmerk voor de ingaande-toerentalsensor.', [['Frictieplaten', '5 × Ø154 mm'], ['Stalen platen', '4']], { x0: 0.250, st, nF: 5, nS: 4, fri: 0.0663, fro: 0.077, sri: 0.0663, sro: 0.0735, hub: 0.036, drumName: 'Trommel lage koppeling', drumD: 'Trommel met toerentalmerk voor de ingaande-toerentalsensor.', ex: [-0.07, -0.2, 0.0], sp: 0.016 }),
    drvPack('Hoge koppeling', 'Brengt het ingangskoppel van de ingaande as naar de drager van de achterste set; actief in de 4e, 5e en 6e versnelling. De trommel draagt het holwiel van de reductieset.', [['Frictieplaten', '6'], ['Stalen platen', '6']], { x0: 0.3615, st: 0.0028, nF: 6, nS: 6, fri: 0.05, fro: 0.0745, sri: 0.048, sro: 0.069, hub: 0.032, drumName: 'Trommel hoge koppeling', drumD: 'Trommel met het holwiel van de reductieset (schematisch weergegeven).', ex: [0.06, 0.2, 0.0], sp: 0.013 }),
    drvPack('2-6-rem', 'Houdt het achterste zonnewiel vast; actief in de 2e en 6e versnelling. Het pakket zit in het huis, de zuiger in het zijdeksel.', [['Frictieplaten', '4'], ['Stalen platen', '3 (Ø220 mm, 17 tanden)']], { x0: 0.3455, st, nF: 4, nS: 3, fri: 0.091, fro: 0.108, sri: 0.091, sro: 0.11, hub: 0.087, drumName: 'Veerhouder 2-6-rem', drumD: 'Houder met de retourveren van de zuiger in het zijdeksel.', ex: [0.2, -0.2, 0.0], teeth: 17, sp: 0.014 }),
    drvPack('Lage/achteruitrem', 'Houdt de drager van de achterste set vast; actief in de achteruit en bij motorrem in de 1e versnelling. Zuiger Ø206,7 mm in het huis.', [['Frictieplaten', '4 × Ø205 mm'], ['Stalen platen', '4']], { x0: 0.3275, st, nF: 4, nS: 4, fri: 0.0815, fro: 0.1025, sri: 0.08, sro: 0.1, hub: 0.076, drumName: 'Zuigerhuis L/R-rem', drumD: 'Zuigerhuis in het transmissiehuis.', ex: [0.35, 0.2, 0.0], sp: 0.013 }),
    A('Vrijloop', { d: 'Vrijloop (sprag) die de drager van de achterste set in de 1e versnelling bij optrekken vasthoudt en bij motorrem vrijgeeft.', ex: [0.15, 0, 0.3], inner: true }, [
      P('Vrijloop binnenring', annulus(0.03, 0.039, 0.012, 'x', 32), MAT.steel, { d: 'Binnenring van de vrijloop, op de naaf.', p: [0.3265, 0, 0], ex: [0, 0.0, -0.001] }),
      P('Vrijloop klemlichamen', drvRing('drvSprag2', 12, 0.0415, () => G.box(0.01, 0.0035, 0.005), 0.1, [0, 0], 0.3265), MAT.darkSteel, { d: 'Klemlichamen (aantal schematisch).', ex: [0.035, 0, 0] }),
      P('Vrijloop buitenring', annulus(0.044, 0.052, 0.012, 'x', 32), MAT.steel, { d: 'Buitenring van de vrijloop, vast in het huis.', p: [0.3265, 0, 0], ex: [0.07, 0, 0] }),
      P('Borgring vrijloop', annulus(0.036, 0.054, 0.0018, 'x', 32), MAT.steel, { d: 'Borgring die de vrijloop in axiale richting vasthoudt.', p: [0.3345, 0, 0], ex: [0.105, 0, 0] }),
    ]),
  ]);
}
function drvSets() {
  const rr = (() => {
    const m = 0.0013, x = 0.3405, kids = [];
    kids.push(P('Zonnewiel voor', drvG(33, m, 0.024, 0.008), MAT.steel, { d: 'Voorste zonnewiel (33 tanden, schematisch).', p: [x - 0.003, 0, 0], ex: [-0.075, 0, 0], inner: true }));
    kids.push(P('Zonnewiel achter', drvG(49, m, 0.016, 0.008), MAT.steel, { d: 'Achterste zonnewiel (49 tanden, Ø65,5 mm).', p: [x + 0.004, 0, 0], ex: [0.075, 0, 0], inner: true }));
    for (let k = 0; k < 3; k++) {
      const a = k * PI * 2 / 3, ra = 0.040;
      kids.push(P(`Korte planeet ${k + 1}`, drvG(28, m, 0.014, 0.004), MAT.steel, { d: 'Kort planeetwiel (28 tanden, schematisch).', p: [x - 0.006, ra * Math.cos(a), ra * Math.sin(a)], ex: [0, 0.08 * Math.cos(a), 0.08 * Math.sin(a)], inner: true }));
    }
    for (let k = 0; k < 3; k++) {
      const a = PI / 3 + k * PI * 2 / 3, ra = 0.047;
      kids.push(P(`Lange planeet ${k + 1}`, drvG(29, m, 0.026, 0.004), MAT.steel, { d: 'Lang planeetwiel (29 tanden), grijpt in het zonnewiel en het holwiel.', p: [x, ra * Math.cos(a), ra * Math.sin(a)], ex: [0, 0.14 * Math.cos(a), 0.14 * Math.sin(a)], inner: true }));
    }
    kids.push(P('Achterste drager', cache('drvCarRR', () => merge([annulus(0.012, 0.064, 0.004, 'x', 36), xf(annulus(0.012, 0.064, 0.004, 'x', 36), [0.032, 0, 0]), ...[0, 1, 2].map(k => xf(G.cyl('x', 0.0035, 0.0035, 0.034, 8), [0.016, 0.040 * Math.cos(k * PI * 2 / 3), 0.040 * Math.sin(k * PI * 2 / 3)])), ...[0, 1, 2].map(k => xf(G.cyl('x', 0.0035, 0.0035, 0.034, 8), [0.016, 0.047 * Math.cos(PI / 3 + k * PI * 2 / 3), 0.047 * Math.sin(PI / 3 + k * PI * 2 / 3)]))])), MAT.darkSteel, { d: 'Drager met de pennen van de korte en lange planeetwielen.', p: [x - 0.018, 0, 0], ex: [0.15, 0, 0], inner: true }));
    kids.push(P('Holwiel achterste set', ringGear(70, 0.078, 0.0575, 0.0615, 0.03, 'x'), MAT.steel, { d: 'Holwiel met binnenvertanding (tandental schematisch); gekoppeld aan het uitgaande tandwiel.', p: [x, 0, 0], ex: [0.2, 0, 0], inner: true }));
    return kids;
  })();
  return A('Tandwielsets', {
    d: 'De drie planetaire tandwielsets (reductieset, voorste set en achterste set) die samen de zes versnellingen en de achteruit vormen (Lepelletier-opbouw). De koppeling tussen de sets onderling is schematisch weergegeven.',
    spec: [['Aantal sets', '3'], ['Voorste set', '4 planeetwielen'], ['Eindoverbrenging', '3,571 (42/45 en 21/70 tanden)']], ex: [0, 0.2, 0.12], inner: true,
  }, [
    drvPlanets('fr', 'Voorste planetaire set', 'Voorste set (FR) met vier planeetwielen; de drager is de naaf van het uitgaande tandwiel. Tandentallen schematisch weergegeven.', { m: 0.0019, w: 0.02, Ns: 26, Np: 15, Nr: 56, n: 4, x: 0.2195, ex: [-0.1, 0.1, 0] }),
    A('Achterste planetaire set', { d: 'Achterste set (RR) van het Ravigneaux-type: twee zonnewielen op één drager met korte en lange planeetwielen en een holwiel dat het uitgaande tandwiel aandrijft. Rij-indeling van de planeetwielen schematisch weergegeven.', ex: [0.12, 0.1, 0] }, rr),
    drvPlanets('red', 'Reductieset', 'Reductieset van de Lepelletier-opbouw: het zonnewiel staat vast in het zijdeksel, het holwiel zit aan de trommel van de hoge koppeling; levert het gereduceerde koppel. Drie planeetwielen schematisch weergegeven.', { m: 0.0016, w: 0.016, Ns: 30, Np: 18, Nr: 66, n: 3, x: 0.3955, ph: 0.4, ex: [0.28, 0.1, 0] }),
  ]);
}

/* ---------- uitgaand tandwiel, parkeerblokkering, tussenas, differentieel ---------- */
function drvOutput() {
  return A('Uitgaand tandwiel en parkeerrad', { d: 'Uitgaand tandwiel (42 tanden) op de drager van de voorste set, met het parkeerrad en een conisch lager op de middensteun. Het tandwiel drijft de tussenas aan.', ex: [0.12, 0, -0.34], inner: true }, [
    P('Uitgaand tandwiel', drvG(42, DRV_GM, 0.016, 0.03), MAT.steel, { d: 'Uitgaand tandwiel met 42 tanden; geeft het koppel door aan de tussenas (45 tanden).', p: [0.2965, 0, 0], ex: [0.0, 0, 0.0001] }),
    P('Parkeerrad', drvG(24, 0.0038, 0.01, 0.03), MAT.darkSteel, { d: 'Getand rad waarin de parkeerpal grijpt (afmeting geschat).', p: [0.3125, 0, 0], ex: [0.06, 0, 0] }),
    P('Conisch lager uitgaand tandwiel', merge([annulus(0.034, 0.042, 0.014, 'x', 36), annulus(0.022, 0.03, 0.016, 'x', 36)]), MAT.bearing, { d: 'Conisch rollager op de middensteun (schematisch weergegeven).', p: [0.2815, 0, 0], ex: [-0.06, 0, 0] }),
  ]);
}
function drvPark() {
  const x = 0.3125;
  return A('Parkeerblokkering', { d: 'Parkeerblokkering: de parkeerpal grijpt in het parkeerrad als de keuzehendel in P staat; de nok op de parkeerstang drukt de pal omlaag, de retourveer trekt hem terug.', ex: [0.12, 0.3, 0.0], inner: true }, [
    P('Parkeerpal', cache('drvPal', () => side(shapeOf([[-0.035, 0], [0.0, 0], [0.012, -0.0085], [0.02, 0], [0.035, 0], [0.035, 0.012], [-0.035, 0.012]]), 0.008)), MAT.darkSteel, { d: 'Pal die in het parkeerrad grijpt en het uitgaande tandwiel blokkeert.', p: [x, 0.0585, 0], ex: [0, 0.06, 0] }),
    P('Palas', G.cyl('x', 0.004, 0.004, 0.016, 10), MAT.steel, { d: 'As waarom de parkeerpal draait.', p: [x, 0.0645, -0.03], ex: [0.04, 0.05, 0] }),
    P('Retourveer parkeerpal', spring(0.0065, 0.0009, 0.012, 3, 'x'), MAT.darkSteel, { d: 'Torsieveer die de pal van het parkeerrad weg trekt.', p: [x + 0.0, 0.0645, -0.03], ex: [-0.04, 0.05, 0] }),
    P('Parkeerstang', G.cyl('z', 0.003, 0.003, 0.1, 8), MAT.steel, { d: 'Stang die door de keuzeas wordt bediend.', p: [x, 0.0765, 0.07], ex: [0, 0.07, 0.06] }),
    P('Parkeernok', G.cyl('z', 0.009, 0.0045, 0.022, 14), MAT.darkSteel, { d: 'Kegelvormige nok op de stang die de pal in het parkeerrad drukt.', p: [x, 0.0765, 0.016], ex: [0, 0.12, 0.0] }),
  ]);
}
function drvCounter() {
  const [cy, cz] = CSH;
  return A('Tussenas eindoverbrenging', { d: 'Tussenas (reductie-as) met het tandwiel van 45 tanden dat door het uitgaande tandwiel wordt aangedreven en een rondsel van 21 tanden dat het kroonwiel van het differentieel aandrijft; loopt in twee conische rollagers met een afstelplaatje.', spec: [['Tanden', '45 en 21'], ['Eindoverbrenging', '3,571']], ex: [0.0, -0.1, -0.36], inner: true }, [
    P('Reductie-as', G.cyl('x', 0.013, 0.013, 0.24, 16), MAT.steel, { d: 'As van de tussenoverbrenging.', p: [0.2, cy, cz], ex: [0, 0, 0.0001] }),
    P('Tandwiel 45 tanden', drvG(45, DRV_GM, 0.016, 0.013), MAT.steel, { d: 'Grijpt in het uitgaande tandwiel.', p: [0.2965, cy, cz], ex: [0.08, 0, 0] }),
    P('Rondsel 21 tanden', drvG(21, DRV_GM, 0.024, 0.013), MAT.steel, { d: 'Drijft het kroonwiel van het differentieel aan.', p: [0.125, cy, cz], ex: [-0.08, 0, 0] }),
    P('Conisch lager reductie-as voor', merge([annulus(0.028, 0.036, 0.014, 'x', 32), annulus(0.0135, 0.022, 0.014, 'x', 32)]), MAT.bearing, { d: 'Conisch rollager aan de motorzijde.', p: [0.0955, cy, cz], ex: [-0.14, 0, 0] }),
    P('Conisch lager reductie-as achter', merge([annulus(0.028, 0.036, 0.014, 'x', 32), annulus(0.0135, 0.022, 0.014, 'x', 32)]), MAT.bearing, { d: 'Conisch rollager aan de zijdekselzijde.', p: [0.3135, cy, cz], ex: [0.14, 0, 0] }),
    P('Afstelplaatje reductie-as', annulus(0.0135, 0.027, 0.001, 'x', 32), MAT.steel, { d: 'Plaatje waarmee de lagervoorspanning wordt afgesteld.', p: [0.1035, cy, cz], ex: [-0.2, 0, 0] }),
  ]);
}
function drvDiff() {
  const coneY = (key) => G.lathe('y', [[0, 0], [0.018, 0], [0.012, 0.014], [0, 0.014]], 18, 'drvSat' + key);
  const sideL = cache('drvSideL', () => merge([G.lathe('-x', [[0, 0], [0.02, 0], [0.014, 0.014], [0, 0.014]], 18, 'drvSideCone'), xf(G.cyl('x', 0.013, 0.013, 0.02, 12), [0.01, 0, 0])]));
  const sideR = cache('drvSideR', () => merge([G.lathe('x', [[0, 0], [0.02, 0], [0.014, 0.014], [0, 0.014]], 18, 'drvSideConeR'), xf(G.cyl('x', 0.013, 0.013, 0.02, 12), [-0.01, 0, 0])]));
  const hub = cache('drvDiffCase', () => merge([
    G.lathe('x', [[0.032, -0.072], [0.032, -0.052], [0.05, -0.046], [0.064, -0.028], [0.064, 0.028], [0.05, 0.046], [0.032, 0.052], [0.032, 0.072]], 36, 'drvDiffHousing'),
    annulus(0.05, 0.072, 0.01, 'x', 36)]));
  return A('Differentieel', { d: 'Verdeelt het koppel over beide voorwielen en laat ze in bochten verschillend snel draaien; het kroonwiel heeft 70 tanden. Het aantal planeetwielen van het differentieel is niet gevonden: schematisch weergegeven met twee satellietwielen.', spec: [['Kroonwiel', '70 tanden'], ['Eindoverbrenging', '3,571 (45/42 × 70/21)']], p: DIFF, ex: [0.0, -0.1, -0.5], inner: true }, [
    P('Kroonwiel', drvG(70, DRV_GM, 0.022, 0.07), MAT.steel, { d: 'Kroonwiel met 70 tanden, met tien bouten (144 N·m) aan het differentieelhuis; wordt door het rondsel van 21 tanden aangedreven.', p: [0.006, 0, 0], ex: [-0.09, 0, 0] }),
    P('Kroonwielbouten', drvBoltRing('drvKroonB', 10, 0.0775, 0.02, 0.008, '-x', 0.1, [0, 0], 0.017), MAT.darkSteel, { d: 'Tien bouten die het kroonwiel aan het differentieelhuis bevestigen.', ex: [-0.15, 0, 0] }),
    P('Differentieelhuis', hub, MAT.iron, { d: 'Gegoten huis dat met het kroonwiel meedraait; in het handboek niet te demonteren.', ex: [0.0, 0.0, 0.0001] }),
    P('Satellietas', G.cyl('y', 0.006, 0.006, 0.09, 10), MAT.steel, { d: 'As van de satellietwielen.', ex: [0, 0, 0.11], inner: true }),
    P('Borgpen satellietas', G.cyl('x', 0.0025, 0.0025, 0.02, 8), MAT.darkSteel, { d: 'Pen die de satellietas in het huis vasthoudt.', p: [0, 0.046, 0], ex: [0.0, 0.06, 0.16], inner: true }),
    P('Satellietwiel boven', coneY('a'), MAT.steel, { d: 'Satellietwiel (kegeltandwiel); verbindt de twee zijwielen en laat een toerentalverschil toe.', p: [0, 0.036, 0], r: [PI, 0, 0], ex: [0, 0.09, 0], inner: true }),
    P('Satellietwiel onder', coneY('a'), MAT.steel, { d: 'Satellietwiel (kegeltandwiel).', p: [0, -0.036, 0], ex: [0, -0.09, 0], inner: true }),
    P('Zijwiel links', sideL, MAT.steel, { d: 'Kegeltandwiel met spiebaan voor de linker aandrijfas.', p: [0.034, 0, 0], ex: [0.12, 0, 0], inner: true }),
    P('Zijwiel rechts', sideR, MAT.steel, { d: 'Kegeltandwiel met spiebaan voor de rechter aandrijfas.', p: [-0.034, 0, 0], ex: [-0.12, 0, 0], inner: true }),
    P('Dikteringen satellietwielen', cache('drvDikS', () => merge([0.0385, -0.0385].map(y => xf(annulus(0.006, 0.014, 0.003, 'y', 20), [0, y, 0])))), MAT.drvBrass, { d: 'Bronzen dikteringen achter de satellietwielen.', ex: [0, 0.0, 0.2], inner: true }),
    P('Dikteringen zijwielen', cache('drvDikZ', () => merge([0.0365, -0.0365].map(x => xf(annulus(0.013, 0.024, 0.003, 'x', 24), [x, 0, 0])))), MAT.drvBrass, { d: 'Bronzen dikteringen achter de zijwielen.', ex: [0, 0.0, 0.26], inner: true }),
    P('Conisch lager links', merge([annulus(0.04, 0.05, 0.014, 'x', 36), annulus(0.03, 0.038, 0.016, 'x', 36)]), MAT.bearing, { d: 'Conisch rollager van het differentieelhuis aan de zijdekselzijde.', p: [0.059, 0, 0], ex: [0.16, 0, 0] }),
    P('Conisch lager rechts', merge([annulus(0.04, 0.05, 0.014, 'x', 36), annulus(0.03, 0.038, 0.016, 'x', 36)]), MAT.bearing, { d: 'Conisch rollager van het differentieelhuis aan de motorzijde.', p: [-0.059, 0, 0], ex: [-0.16, 0, 0] }),
    P('Afstelplaatje differentieel', annulus(0.032, 0.045, 0.001, 'x', 32), MAT.steel, { d: 'Plaatje waarmee de lagervoorspanning wordt afgesteld.', p: [-0.0695, 0, 0], ex: [-0.2, 0, 0] }),
    P('Keerring links', merge([annulus(0.016, 0.034, 0.007, 'x', 32)]), MAT.rubber, { d: 'Keerring waar de linker aandrijfas het huis verlaat.', p: [0.076, 0, 0], ex: [0.24, 0, 0] }),
    P('Keerring rechts', merge([annulus(0.016, 0.034, 0.007, 'x', 32)]), MAT.rubber, { d: 'Keerring waar de rechter aandrijfas het huis verlaat.', p: [-0.076, 0, 0], ex: [-0.24, 0, 0] }),
  ]);
}

/* ---------- klepblok ---------- */
function drvValve() {
  const cx = 0.27, cz = 0.03, W = 0.2, D = 0.16;
  const yLow = -0.1615, yG1 = -0.1540, ySep = -0.1525, yG2 = -0.1510, yUp = -0.1430, yTop = -0.1355;
  const sol = (i) => P(`Lineaire solenoïde ${i + 1}`, G.cyl('y', 0.008, 0.008, 0.028, 12), MAT.drvSolenoid, { d: 'Elektrisch bediende drukregelklep (lineaire solenoïde, circa 5,3 Ω, 300 Hz) voor een schakelelement.', p: [0.19 + i * 0.03, yTop + 0.014, 0.08], ex: [0, 0.07 + i * 0.01, 0.05], });
  const onoff = (i) => P(`Aan/uit-solenoïde ${i + 1}`, G.cyl('y', 0.0085, 0.0085, 0.024, 12), MAT.drvBlack, { d: 'Aan/uit-solenoïde voor de schakelkleppen van de lage koppeling en de lage/achteruitrem.', p: [0.22 + i * 0.06, yTop + 0.012, 0.0], ex: [0, 0.1, -0.04 + i * 0.04] });
  const sw = (i) => P(`Drukschakelaar ${i + 1}`, G.cyl('y', 0.006, 0.006, 0.018, 10), MAT.plasticGrey, { d: 'Drukschakelaar die meldt of een schakelelement onder druk staat (vijf stuks bij de Renault-uitvoering).', p: [0.2 + i * 0.03, yTop + 0.009, -0.05], ex: [0, 0.06, -0.06 - i * 0.012] });
  const acc = (i) => P(`Accumulator ${i + 1}`, G.cyl('y', 0.011, 0.011, 0.03, 14), MAT.drvBrass, { d: 'Accumulatorzuiger met veer die de drukstoot bij het schakelen dempt (3-5-R, hoge koppeling, lage koppeling, 2-6).', p: [0.21 + i * 0.04, yLow - 0.0225, 0.0], ex: [0, -0.1, 0.03 * (i - 1.5)] });
  const spool = (nm, d, x, z, l) => P(nm, drvRing('drvSpool' + nm, 1, 0, () => merge([G.cyl('x', 0.0045, 0.0045, l, 10), ...[-0.35, 0, 0.35].map(f => xf(G.cyl('x', 0.0065, 0.0065, 0.007, 12), [f * l, 0, 0]))]), 0, [0, 0], 0), MAT.steel, { d, p: [x, yUp + 0.005, z], ex: [0, 0.06, z * 1.5], inner: true });
  return A('Klepblok', { d: 'Hydraulische besturing van de bak: het klepblok met acht solenoïdes (zes lineair, twee aan/uit) en vijf drukschakelaars regelt de oliedruk naar de koppelingen en remmen. Zit in het huis onder een afdekdeksel. Inwendige kleppen schematisch weergegeven.', ex: [0.0, -0.3, 0.0], inner: true }, [
    A('Kleplichaam', { d: 'Onderste en bovenste blok met kanalen, een tussenplaat met twee pakkingen en de bouten.', ex: [0, 0, 0.0] }, [
      P('Onderste klepblok', G.rbox(W, 0.014, D, 0.002), MAT.aluCast, { d: 'Onderste helft van het klepblok met kanalen.', p: [cx, yLow, cz], ex: [0, -0.12, 0] }),
      P('Pakking onder', G.box(W, 0.001, D), MAT.drvPaper, { d: 'Pakking tussen onderste blok en tussenplaat.', p: [cx, yG1, cz], ex: [0, -0.08, 0] }),
      P('Tussenplaat', G.box(W, 0.002, D), MAT.steel, { d: 'Stalen tussenplaat met doorlaten en terugslagkleppen.', p: [cx, ySep, cz], ex: [0, -0.04, 0] }),
      P('Pakking boven', G.box(W, 0.001, D), MAT.drvPaper, { d: 'Pakking tussen tussenplaat en bovenste blok.', p: [cx, yG2, cz], ex: [0, 0.02, 0] }),
      P('Bovenste klepblok', G.rbox(W, 0.0155, D, 0.002), MAT.aluCast, { d: 'Bovenste helft van het klepblok met de schuifkleppen.', p: [cx, yUp - 0.0005, cz], ex: [0, 0.06, 0] }),
      P('Klepblokbouten', cache('drvKlepB', () => merge([[-0.09, -0.07], [-0.09, 0.0], [-0.09, 0.07], [0.0, -0.07], [0.0, 0.07], [0.09, -0.07], [0.09, 0.0], [0.09, 0.07]].map(([x, z]) => xf(hexBolt(0.03, 0.006, '-y'), [cx + x, yTop + 0.004, cz + z])))), MAT.darkSteel, { d: 'Bouten die de twee blokken aan elkaar en aan het huis bevestigen.', ex: [0, 0.14, 0] }),
    ]),
    A('Solenoïdes', { d: 'Acht solenoïdes: zes lineaire drukregelaars en twee aan/uit-klepjes.', ex: [0, 0.0, 0.18] }, [0, 1, 2, 3, 4, 5].map(sol).concat([0, 1].map(onoff))),
    A('Drukschakelaars', { d: 'Vijf drukschakelaars voor de lage koppeling, de hoge koppeling, de 2-6-rem, de lage/achteruitrem en de 3-5-achteruitkoppeling.', ex: [0, 0.0, -0.2] }, [0, 1, 2, 3, 4].map(sw)),
    A('Accumulatoren', { d: 'Vier accumulatorzuigers met veer onder het klepblok.', ex: [0, -0.1, 0.0] }, [0, 1, 2, 3].map(acc)),
    A('Schuifkleppen', { d: 'Schematische weergave van de belangrijkste kleppen in het bovenste blok: drukregelaar, pilootklep, lock-up-regelklep, omvormer-regelklep en de handklep met detentveer en -plaat.', ex: [0, 0.1, 0.0], inner: true }, [
      spool('Drukregelklep', 'Regelt de leidingdruk (schuifklep met veer, schematisch).', 0.2, 0.05, 0.05),
      spool('Pilootklep', 'Pilootdrukklep (schematisch).', 0.24, 0.02, 0.045),
      spool('Lock-up-regelklep', 'Regelt de druk op de overbruggingskoppeling (schematisch).', 0.28, 0.05, 0.045),
      spool('Omvormer-regelklep', 'Regelt de druk in de koppelomvormer (schematisch).', 0.32, 0.02, 0.045),
      spool('Handklep', 'Door de keuzeas bediende handklep voor P, R, N, D.', 0.26, -0.03, 0.09),
      P('Detentveer', spring(0.005, 0.0007, 0.02, 5, 'x'), MAT.darkSteel, { d: 'Veer die de handklep in een stand houdt.', p: [0.32, yUp + 0.005, -0.03], ex: [0, 0.1, -0.06], inner: true }),
      P('Detentplaat', G.box(0.03, 0.002, 0.012), MAT.steel, { d: 'Plaat met inkepingen voor de handklepstanden.', p: [0.27, yTop + 0.001, -0.065], ex: [0, 0.14, -0.1], inner: true }),
      P('Terugslagkogeltjes', cache('drvBallen', () => merge(Array.from({ length: 13 }, (_, k) => xf(G.sphere(0.004, 8), [cx - 0.08 + (k % 7) * 0.027, ySep + 0.003, cz - 0.05 + Math.floor(k / 7) * 0.09])))), MAT.steel, { d: 'Dertien terugslagkogeltjes van 8 en 5,5 mm in de tussenplaat (aantal geschat).', ex: [0, 0.03, 0.0], inner: true }),
    ]),
    P('Temperatuursensor ATF', merge([G.cyl('y', 0.005, 0.005, 0.02, 10), xf(G.box(0.014, 0.01, 0.014), [0, 0.014, 0])]), MAT.plastic, { d: 'Temperatuursensor (NTC) van de automaatolie in het klepblok.', p: [0.34, yTop + 0.01, 0.1], ex: [0.06, 0.1, 0.1] }),
    P('Interne kabelboom', tube([[0.25, -0.15, 0.113], [0.25, -0.128, 0.11], [0.2, -0.108, 0.1], [0.34, -0.108, 0.1]], 0.0028, 24, 6), MAT.plastic, { d: 'Kabelboom van de stekker naar de solenoïdes, drukschakelaars en temperatuursensor.', ex: [0.0, 0.2, 0.18] }),
  ]);
}

/* ---------- startmotor ---------- */
// De startmotor zit op de koppelomvormerklok; het rondsel grijpt in de startkrans van de flexplaat (motor: x 0,2285, tiptstraal 0,142).
// Lokaal frame: oorsprong op het rondselvlak, as langs x van de motor af.
const DRV_SOL = [0.046, 0.030];                       // solenoide naast de startmotoras (y,z)
function drvStarter() {
  const P0 = [-0.0065, DRV_ST[0], DRV_ST[1]], [sy, sz] = DRV_SOL;
  const nose = cache('drvStNose', () => merge([G.lathe('x', [[0.0105, 0.004], [0.02, 0.006], [0.027, 0.014], [0.027, 0.047], [0.034, 0.049], [0.034, 0.054]], 28, 'drvStNoseL'),
    annulus(0.02, 0.0345, 0.008, 'x', 28), ...[0.5, 2.6, 4.7].map(a => xf(G.box(0.012, 0.008, 0.014), [0.0495, 0.041 * Math.cos(a), 0.041 * Math.sin(a)]))].map((g, i) => i === 1 ? xf(g, [0.0495, 0, 0]) : g)));
  const red = drvPlanets('st', 'Planetaire reductie', 'Planetaire reductie tussen anker en rondselas (schematisch weergegeven): zonnewiel op de ankeras, drie planeetwielen, holwiel in het huis en een drager die de rondselas aandrijft.', { m: 0.0011, w: 0.012, Ns: 10, Np: 12, Nr: 34, n: 3, x: 0.063, ph: 0.3, ex: [0.0, 0.1, -0.1] });
  const mount = (nm, d, g, mat, p, ex, inner) => P(nm, g, mat, { d, p, ex, inner });
  const cap = 0.152, bx = (k) => [cap, sy + 0.0085 * (k ? 1 : -1), sz];
  const st = A('Startmotor', {
    d: 'Elektrische startmotor (circa 1 kW, type schematisch) met voorgeschakelde planetaire reductie en solenoïde; het rondsel grijpt in de startkrans van de flexplaat. Zit met drie bouten (flens Ø66 mm) op de koppelomvormerklok.',
    spec: [['Vermogen', 'circa 1 kW (geschat)'], ['Flensmaat', 'Ø66 mm, 3 bouten'], ['Rondsel', '9 tanden']], p: P0, ex: [-0.12, -0.25, 0.25],
  }, [
    P('Rondsel', drvG(9, 0.0025, 0.014, 0.006), MAT.steel, { d: 'Rondsel met 9 tanden dat bij het starten naar voren schuift en in de startkrans van de flexplaat grijpt.', ex: [-0.07, 0, 0] }),
    A('Rondselas met vrijloop', { d: 'Aandrijfas met rondsel en vrijloopkoppeling; de vrijloop voorkomt dat de draaiende motor de startmotor meeneemt.', ex: [0.05, 0.2, 0.0], inner: true }, [
      P('Rondselas', drvL('StAs', [[0.0095, 0.007], [0.0095, 0.1], [0.006, 0.1], [0.006, 0.108]], 14), MAT.steel, { d: 'Gegroefde as waarover het rondsel met de vrijloop schuift.', ex: [0.0, 0.0, 0.0001] }),
      P('Vrijloopmantel', G.lathe('x', [[0.018, 0.008], [0.018, 0.04], [0.0125, 0.04], [0.0125, 0.008]], 24, 'drvStFw'), MAT.darkSteel, { d: 'Buitenmantel van de vrijloop (overrun-koppeling).', ex: [0.05, 0, 0] }),
      P('Vrijlooprollen en veren', drvRing('drvStRol', 4, 0.0145, () => G.cyl('x', 0.0025, 0.0025, 0.022, 8), 0.3, [0, 0], 0.024), MAT.bearing, { d: 'Vier klemrollen met veertjes (schematisch weergegeven).', ex: [0.1, 0, 0] }),
    ]),
    P('Aandrijfschild', nose, MAT.aluCast, { d: 'Voorste lagerschild met de montageflens (Ø66 mm) en drie oren voor de bevestigingsbouten.', ex: [-0.04, 0.0, 0.05] }),
    P('Montagebouten startmotor', cache('drvStMB2', () => merge([0.5, 2.6, 4.7].map(a => xf(hexBolt(0.032, 0.0085, '-x'), [0.0575, 0.041 * Math.cos(a), 0.041 * Math.sin(a)])))), MAT.darkSteel, { d: 'Drie bouten die de startmotor aan de omvormerklok vastzetten.', ex: [0.06, 0.1, 0.1] }),
    P('Lagerbus aandrijfzijde', annulus(0.0097, 0.0135, 0.012, 'x', 20), MAT.drvBrass, { d: 'Bronzen glijlager voor de rondselas.', p: [0.052, 0, 0], ex: [-0.04, -0.06, 0], inner: true }),
    red,
    P('Veldhuis', G.lathe('x', [[0.0375, 0.054], [0.0375, 0.155], [0.0355, 0.155], [0.0355, 0.054]], 32, 'drvStYoke'), MAT.darkSteel, { d: 'Stalen huis (juk) van de startmotor.', ex: [0.0, -0.1, 0.0] }),
    P('Permanente magneten', cache('drvStMag', () => merge([0, 1, 2, 3].flatMap(k => [xf(yTo(new THREE.CylinderGeometry(0.0345, 0.0345, 0.07, 6, 1, true, k * HALF + 0.12, 1.3), 'x'), [0.105, 0, 0]), xf(yTo(new THREE.CylinderGeometry(0.0315, 0.0315, 0.07, 6, 1, true, k * HALF + 0.12, 1.3), 'x'), [0.105, 0, 0])]))), MAT.drvMagnet, { d: 'Vier permanente magneten in het veldhuis.', ex: [0.0, 0.2, 0.0], inner: true }),
    A('Anker', { d: 'Anker (rotor) met ankerpakket, wikkeling en collector; draait in de permanente magneten.', ex: [0.12, 0.0, -0.18], inner: true }, [
      P('Ankeras', G.cyl('x', 0.006, 0.006, 0.13, 12), MAT.steel, { d: 'As van het anker; draagt het zonnewiel van de reductie.', p: [0.105, 0, 0], ex: [0, 0, 0.0001] }),
      P('Ankerpakket', G.cyl('x', 0.0255, 0.0255, 0.062, 24), MAT.iron, { d: 'Gelamelleerd ijzerpakket van het anker.', p: [0.105, 0, 0], ex: [0.04, 0, 0] }),
      P('Ankerwikkeling', merge([xf(G.cyl('x', 0.0235, 0.0235, 0.012, 20), [0.07, 0, 0]), xf(G.cyl('x', 0.0235, 0.0235, 0.012, 20), [0.14, 0, 0])]), MAT.copper, { d: 'Koperwikkeling; hier schematisch als de kopbochten weergegeven.', ex: [0.08, 0, 0] }),
      P('Collector', G.lathe('x', [[0.0125, 0.131], [0.0125, 0.149]], 24, 'drvStCol'), MAT.copper, { d: 'Collector met koperen lamellen waarop de koolborstels lopen.', ex: [0.12, 0, 0] }),
    ]),
    A('Borstelhouder', { d: 'Borstelplaat met vier koolborstels en hun veren; voert de stroom naar de collector.', ex: [0.2, -0.06, 0], inner: true }, [
      P('Borstelplaat', annulus(0.014, 0.0345, 0.004, 'x', 24), MAT.plastic, { d: 'Kunststof plaat met de borstelhouders.', p: [0.148, 0, 0], ex: [0.0, 0.0, 0.0001] }),
      ...[0, 1, 2, 3].map(k => P(`Koolborstel ${k + 1}`, G.box(0.011, 0.007, 0.007), MAT.darkSteel, { d: 'Koolborstel die op de collector sleept.', p: [0.1425, 0.0185 * Math.cos(k * HALF + 0.4), 0.0185 * Math.sin(k * HALF + 0.4)], r: [k * HALF + 0.4, 0, 0], ex: [0, 0.03 * Math.cos(k * HALF + 0.4), 0.03 * Math.sin(k * HALF + 0.4)] })),
      P('Borstelveren', cache('drvStBV', () => merge([0, 1, 2, 3].map(k => xf(G.box(0.008, 0.003, 0.003), [0.1425, 0.025 * Math.cos(k * HALF + 0.4), 0.025 * Math.sin(k * HALF + 0.4)], [k * HALF + 0.4, 0, 0])))), MAT.steel, { d: 'Veertjes die de borstels tegen de collector drukken.', ex: [0.06, 0, 0] }),
    ]),
    P('Lagerbus collectorzijde', annulus(0.0065, 0.0105, 0.012, 'x', 20), MAT.drvBrass, { d: 'Bronzen glijlager voor het uiteinde van de ankeras.', p: [0.162, 0, 0], ex: [0.24, 0, 0], inner: true }),
    P('Eindschild', merge([G.lathe('x', [[0.0375, 0.155], [0.0375, 0.168], [0.012, 0.172], [0.012, 0.162]], 28, 'drvStEnd'), annulus(0.0345, 0.0385, 0.004, 'x', 28)]), MAT.aluCast, { d: 'Achterste lagerschild met de klemkap en het lager voor de ankeras.', ex: [0.34, 0.0, 0.0] }),
    P('Trekbout 1', hexBolt(0.125, 0.006, '-x'), MAT.darkSteel, { d: 'Doorgaande bout die de startmotor bij elkaar houdt.', p: [0.1725, 0.034 * Math.cos(1.2), 0.034 * Math.sin(1.2)], ex: [0.42, 0.04, 0.08] }),
    P('Trekbout 2', hexBolt(0.125, 0.006, '-x'), MAT.darkSteel, { d: 'Doorgaande bout die de startmotor bij elkaar houdt.', p: [0.1725, 0.034 * Math.cos(4.3), 0.034 * Math.sin(4.3)], ex: [0.42, -0.04, -0.08] }),
    P('Hitteschild startmotor', xf(yTo(new THREE.CylinderGeometry(0.0425, 0.0425, 0.09, 16, 1, true, 3.8, 2.6), 'x'), [0.1, 0, 0]), MAT.heat, { d: 'Hitteschild aan de kant van de uitlaat.', ex: [0.0, -0.08, -0.12] }),
    A('Solenoïde', { d: 'Starterrelais (solenoïde) bovenop de startmotor: trekt het rondsel via de schakelvork naar de startkrans en sluit de hoofdcontacten voor de stroom van de accu.', ex: [0.0, 0.18, 0.12] }, [
      P('Solenoïdehuis', G.lathe('x', [[0.0165, 0.07], [0.0165, 0.14], [0.0145, 0.14], [0.0145, 0.07]], 24, 'drvStSol'), MAT.drvSolenoid, { d: 'Stalen huis van de solenoïde.', p: [0, sy, sz], ex: [0, 0, 0.0001] }),
      P('Trekspoel', annulus(0.0075, 0.0138, 0.026, 'x', 24), MAT.copper, { d: 'Trekspoel: trekt de plunjer krachtig aan.', p: [0.092, sy, sz], ex: [-0.04, 0.06, 0], inner: true }),
      P('Houdspoel', annulus(0.0075, 0.0138, 0.026, 'x', 24), MAT.copper, { d: 'Houdspoel: houdt de plunjer vast als de trekspoel uitvalt.', p: [0.121, sy, sz], ex: [0.02, 0.1, 0], inner: true }),
      P('Plunjer', G.cyl('x', 0.0065, 0.0065, 0.052, 14), MAT.steel, { d: 'Plunjer die de schakelvork bedient.', p: [0.092, sy, sz], ex: [-0.12, 0.0, 0.0], inner: true }),
      P('Terugstelveer', spring(0.0078, 0.0008, 0.018, 6, 'x'), MAT.darkSteel, { d: 'Veer die de plunjer terugdrukt.', p: [0.073, sy, sz], ex: [-0.2, 0.06, 0], inner: true }),
      P('Contactplaat', G.cyl('x', 0.0115, 0.0115, 0.003, 18), MAT.drvBrass, { d: 'Koperen plaat die de twee hoofdcontacten verbindt.', p: [0.1385, sy, sz], ex: [0.06, 0.0, 0.0], inner: true }),
      P('Solenoïdedeksel', G.cyl('x', 0.0165, 0.0165, 0.012, 20), MAT.plastic, { d: 'Kunststof deksel met de aansluitingen.', p: [0.146, sy, sz], ex: [0.14, 0.0, 0.0] }),
      P('Contactbout plus (B+)', hexBolt(0.012, 0.007, 'x'), MAT.drvBrass, { d: 'Hoofdaansluiting van de accukabel (B+).', p: [0.152, ...[sy + 0.0085, sz]], ex: [0.24, 0.1, 0.0] }),
      P('Contactbout motor', hexBolt(0.012, 0.007, 'x'), MAT.drvBrass, { d: 'Aansluiting naar de wikkeling van de startmotor.', p: [0.152, sy - 0.0085, sz], ex: [0.24, -0.1, 0.0] }),
      P('Stuuraansluiting 50', merge([G.box(0.008, 0.006, 0.003)]), MAT.drvBrass, { d: 'Vlakstekker voor het stuursignaal van het contactslot (klem 50).', p: [0.152, sy, sz + 0.012], ex: [0.2, 0, 0.1] }),
    ]),
    P('Schakelvork', tube([[0.07, sy, sz - 0.005], [0.058, sy * 0.6, sz * 0.6], [0.036, 0.0, 0.012], [0.026, 0.0, 0.0]], 0.0025, 20, 6), MAT.steel, { d: 'Hefboom die de beweging van de plunjer overbrengt op de vrijloopkoppeling en het rondsel.', ex: [0.0, 0.07, 0.1], inner: true }),
  ]);
  // plusaansluiting in het motorframe (voor de accukabel van het elektrisch systeem)
  DRV_PORTS.starterTerminal = [GB_X + P0[0] + cap + 0.01, P0[1] + sy + 0.0085, P0[2] + sz];
  return st;
}

/* ---------- huis, deksels en buitenzijde van de bak ---------- */
function drvHousing() {
  const [cy, cz] = CSH, dy = DIFF[1], dz = DIFF[2];
  const bellGeo = cache('drvBell', () => merge([
    G.lathe('x', [[0.147, 0.001], [0.151, 0.004], [0.147, 0.012], [0.145, 0.06], [0.132, 0.108], [0.1255, 0.125]], 56, 'drvBellL'),
    annulus(0.139, 0.157, 0.008, 'x', 56), xf(annulus(0.118, 0.136, 0.008, 'x', 56), [0.121, 0, 0]),
    xf(G.cyl('x', 0.104, 0.104, 0.105, 40, true), [0.0725, dy, dz]), xf(annulus(0.035, 0.104, 0.006, 'x', 40), [0.023, dy, dz]),
    xf(G.cyl('x', 0.042, 0.042, 0.0415, 24), [0.02075, DRV_ST[0], DRV_ST[1]])]));
  const caseGeo = cache('drvCase', () => merge([
    G.lathe('x', [[0.1255, 0.125], [0.127, 0.13], [0.125, 0.2], [0.123, 0.3], [0.121, 0.385], [0.1235, 0.397]], 56, 'drvCaseL'),
    annulus(0.12, 0.137, 0.008, 'x', 56), xf(annulus(0.12, 0.137, 0.008, 'x', 56), [0.271, 0, 0]),
    ...[0.18, 0.24, 0.3, 0.36].map(x => xf(G.torus('x', 0.1265, 0.0028, 56, 6), [x, 0, 0])),
    xf(G.cyl('x', 0.104, 0.104, 0.08, 40, true), [0.165, dy, dz]), xf(annulus(0.02, 0.104, 0.006, 'x', 40), [0.205, dy, dz]),
    xf(G.cyl('x', 0.07, 0.07, 0.125, 32, true), [0.2625, cy, cz]), xf(annulus(0.012, 0.07, 0.006, 'x', 32), [0.325, cy, cz]),
    xf(G.rbox(0.25, 0.095, 0.19, 0.01), [0.27, -0.1625, 0.03]),
    xf(G.rbox(0.12, 0.02, 0.09, 0.006), [0.28, 0.133, 0.0]),
    ...[0.265, 0.2965].map(x => xf(G.cyl('y', 0.014, 0.014, 0.02, 16), [x, 0.133, 0])),
    xf(G.box(0.05, 0.04, 0.012), [0.25, -0.15, 0.126])]));
  const cover = cache('drvCover', () => merge([G.lathe('x', [[0.12, 0.3955], [0.125, 0.4], [0.117, 0.41], [0.09, 0.416], [0.0, 0.418]], 48, 'drvCoverL'), xf(annulus(0.115, 0.137, 0.008, 'x', 48), [0.399, 0, 0])]));
  const cooler = cache('drvCooler', () => merge([G.rbox(0.036, 0.05, 0.09, 0.004), ...[-1, 0, 1].map(k => xf(G.box(0.008, 0.05, 0.004), [0.022, 0, k * 0.025]))]));
  const rimBolts = (key, n, r, x, ph) => cache(key, () => merge(Array.from({ length: n }, (_, k) => xf(hexBolt(0.02, 0.008, '-x'), [x, r * Math.cos(ph + k * PI * 2 / n), r * Math.sin(ph + k * PI * 2 / n)]))));
  return [
    A('Omvormerhuis', { d: 'Aluminium huis rond de koppelomvormer, met de flens naar de motor, de lob voor het differentieel en de bevestiging van de startmotor. Spuitgietaluminium; maten schematisch.', ex: [-0.1, 0.62, 0.0] }, [
      P('Omvormerhuis (klok)', bellGeo, MAT.aluCast, { d: 'Gegoten klok om de omvormer, met de differentieellob en de startmotorbasis.', ex: [0, 0.0, 0.0001] }),
      P('Bouten motorflens', rimBolts('drvBMot', 8, 0.153, 0.0085, 0.2), MAT.darkSteel, { d: 'Bouten die de bak aan het motorblok bevestigen (aantal geschat).', ex: [-0.1, 0.0, 0.0] }),
      P('Keerring omvormerhuis', annulus(0.03, 0.045, 0.009, 'x', 28), MAT.rubber, { d: 'Hoofdkeerring rond de naaf van het pompwiel.', p: [0.1195, 0, 0], ex: [0.08, 0, 0] }),
      P('O-ring omvormerhuis', G.torus('x', 0.1245, 0.0022, 56, 6), MAT.rubber, { d: 'Afdichting tussen omvormerhuis en transmissiehuis.', p: [0.1255, 0, 0], ex: [0.14, 0, 0] }),
    ]),
    A('Transmissiehuis', { d: 'Spuitgietaluminium huis rond de planetaire sets en schakelelementen, met de lobben voor de tussenas en het differentieel en de vlakken voor het klepblok en de steunen. Bakbreedte circa 385 mm incl. omvormerhuis (Planète Renault); hier iets langer weergegeven.', spec: [['Materiaal', 'spuitgietaluminium'], ['Lengte', 'circa 385 mm'], ['Hartafstand', '197 mm (geschat)']], ex: [0.1, 0.8, 0.0] }, [
      P('Transmissiehuis (carter)', caseGeo, MAT.aluCast, { d: 'Gegoten carter met ribben en bevestigingsoren.', ex: [0, 0.0, 0.0001] }),
      P('Bouten huisverbinding', rimBolts('drvBHuis', 12, 0.1285, 0.1295, 0.1), MAT.darkSteel, { d: 'Torx-bouten tussen omvormerhuis en transmissiehuis.', ex: [-0.12, 0.0, 0.0] }),
      P('Vulplug', hexBolt(0.02, 0.012, 'z'), MAT.darkSteel, { d: 'Plug in het huis voor het bijvullen van ATF (de positie van vul- en peilpunt is voor de AJ0 niet gevonden).', p: [0.345, 0.02, 0.133], r: [PI, 0, 0], ex: [0, 0.0, 0.14] }),
      P('Aftapplug', hexBolt(0.02, 0.012, 'z'), MAT.darkSteel, { d: 'Aftapplug onder in het huis.', p: [0.325, -0.19, 0.133], r: [PI, 0, 0], ex: [0, -0.04, 0.14] }),
      P('Ontluchtingsnippel', G.cyl('y', 0.004, 0.004, 0.02, 10), MAT.brass || MAT.drvBrass, { d: 'Nippel voor de ontluchtingsslang van de bak.', p: [0.16, 0.135, 0.0], ex: [0.0, 0.1, 0] }),
      P('Ontluchtingsslang', tube([[0.16, 0.145, 0.0], [0.16, 0.17, 0.0], [0.185, 0.18, 0.03]], 0.003, 16, 6), MAT.rubber, { d: 'Slangetje dat de bak ontlucht zonder dat er olie of water in komt.', ex: [0.0, 0.18, 0] }),
    ]),
    A('Zijdeksel', { d: 'Deksel aan het eind van de bak met de water-ATF-koeler en de beide koelleidingen; draagt ook de zuiger van de 2-6-rem en het vaste zonnewiel van de reductieset.', ex: [0.34, 0.5, 0.2] }, [
      P('Zijdeksel (deksel)', cover, MAT.aluCast, { d: 'Gegoten deksel met flens.', ex: [0, 0.0, 0.0001] }),
      P('Zijdekselbouten', rimBolts('drvBZij', 12, 0.129, 0.4045, 0.0), MAT.darkSteel, { d: 'Torx-bouten van het zijdeksel.', ex: [0.12, 0, 0] }),
      P('Water-ATF-koeler', cooler, MAT.alu, { d: 'In het carter geïntegreerde koeler: de automaatolie wordt door het koelwater gekoeld en snel op temperatuur gebracht.', p: [0.436, 0.05, 0.0], ex: [0.1, 0.1, 0.0] }),
      P('Koelleiding IN', tube([[0.436, 0.05, 0.045], [0.436, 0.05, 0.085], [0.43, 0.075, 0.13], [0.42, 0.095, 0.17]], 0.006, 24, 8), MAT.steel, { d: 'Koelleiding van de bak naar de koeler (IN).', ex: [0.1, 0.1, 0.12] }),
      P('Koelleiding UIT', tube([[0.436, 0.05, -0.045], [0.436, 0.05, -0.085], [0.43, 0.075, -0.13], [0.42, 0.095, -0.17]], 0.006, 24, 8), MAT.steel, { d: 'Koelleiding van de koeler terug naar de bak (UIT).', ex: [0.1, 0.1, -0.12] }),
      P('Holle bout IN', hexBolt(0.012, 0.012, 'x'), MAT.drvBrass, { d: 'Holle bout met O-ringen waarmee de leiding aan de koeler zit.', p: [0.4565, 0.05, 0.045], ex: [0.2, 0.1, 0.1] }),
      P('Holle bout UIT', hexBolt(0.012, 0.012, 'x'), MAT.drvBrass, { d: 'Holle bout met O-ringen waarmee de leiding aan de koeler zit.', p: [0.4565, 0.05, -0.045], ex: [0.2, 0.1, -0.1] }),
    ]),
    A('Klepblokdeksel', { d: 'Dun deksel onder het huis dat het klepblok afsluit; geen klassieke onderpan met filter, want de zeef zit op de oliepomp.', ex: [0.0, -0.55, 0.0] }, [
      P('Deksel klepblok', G.rbox(0.23, 0.008, 0.18, 0.003), MAT.aluCast, { d: 'Stalen of aluminium afdekplaat.', p: [0.27, -0.2145, 0.03], ex: [0, 0.0, 0.0001] }),
      P('Pakking klepblokdeksel', G.box(0.23, 0.002, 0.18), MAT.drvPaper, { d: 'Pakking tussen deksel en huis.', p: [0.27, -0.2095, 0.03], ex: [0, 0.05, 0] }),
      P('Dekselbouten', cache('drvKDB', () => merge([-0.1, -0.05, 0, 0.05, 0.1].flatMap(x => [-0.083, 0.083].map(z => xf(hexBolt(0.02, 0.007, 'y'), [0.27 + x, -0.2185, 0.03 + z]))))), MAT.darkSteel, { d: 'Tien bouten van het klepblokdeksel.', ex: [0, -0.1, 0] }),
    ]),
  ];
}
function drvOutside() {
  return A('Bediening en sensoren', { d: 'Keuzeas met hendel, kabelbeugel, standenschakelaar, de twee toerentalsensoren en de stekker van de bak; allemaal aan de buitenkant van het huis.', ex: [0.3, 0.3, 0.45] }, [
    P('Keuzeas met hendel', merge([G.cyl('z', 0.008, 0.008, 0.06, 12), xf(G.box(0.012, 0.055, 0.012), [0, 0.0275, 0.03])]), MAT.steel, { d: 'Verbindt de keuzehendel (P-R-N-D, kabelbediening) met de handklep en de parkeerstang in de bak.', p: [0.33, 0.10, 0.12], ex: [0, 0.1, 0.12] }),
    P('Kabelbeugel', merge([G.box(0.045, 0.004, 0.035), xf(G.box(0.004, 0.03, 0.035), [-0.02, 0.016, 0])]), MAT.darkSteel, { d: 'Beugel voor de bediening door de keuzekabel.', p: [0.375, 0.12, 0.09], ex: [0.1, 0.05, 0.05] }),
    P('Standenschakelaar', merge([G.cyl('z', 0.022, 0.022, 0.018, 20), xf(G.rbox(0.03, 0.02, 0.02, 0.004), [0.0, -0.03, 0.002])]), MAT.plasticGrey, { d: 'Standenschakelaar (PNP) met detentveer; meldt de gekozen stand aan de transmissiecomputer en blokkeert starten buiten P en N.', p: [0.33, 0.10, 0.148], ex: [0, -0.1, 0.18] }),
    P('Ingaande-toerentalsensor', merge([G.cyl('y', 0.008, 0.008, 0.04, 12), xf(G.rbox(0.02, 0.014, 0.02, 0.003), [0, 0.027, 0])]), MAT.plastic, { d: 'Hall-sensor die het toerentalmerk op de trommel van de lage koppeling leest (ingaand toerental).', p: [0.265, 0.152, 0.0], ex: [-0.04, 0.12, 0] }),
    P('Uitgaande-toerentalsensor', merge([G.cyl('y', 0.008, 0.008, 0.04, 12), xf(G.rbox(0.02, 0.014, 0.02, 0.003), [0, 0.027, 0])]), MAT.plastic, { d: 'Hall-sensor die het uitgaande tandwiel leest (uitgaand toerental).', p: [0.2965, 0.152, 0.0], ex: [0.06, 0.12, 0] }),
    P('Stekker interne kabelboom', merge([G.rbox(0.05, 0.04, 0.03, 0.004), xf(G.box(0.044, 0.006, 0.034), [0, 0, 0.014])]), MAT.plasticGrey, { d: 'Stekker (terminal assembly) van de bakcomputer op het huis, met de interne kabelboom naar het klepblok.', p: [0.25, -0.15, 0.135], ex: [0, 0.0, 0.2] }),
  ]);
}

/* ---------- de bak als geheel ---------- */
function buildGearbox() {
  return A('Automaatversnellingsbak', {
    d: 'Zestraps automaat Jatco JF613E (Renault-code AJ0, gebaseerd op het Lepelletier-systeem) met koppelomvormer, drie planetaire sets, vijf schakelelementen plus vrijloop en ingebouwd differentieel; dwars links naast de motor. De interne koppeling van de sets en alle kleine onderdelen zijn schematisch weergegeven.',
    spec: [['Type', 'Jatco JF613E (Renault AJ0)'], ['Overbrengingen', '4,199 / 2,405 / 1,583 / 1,161 / 0,855 / 0,685, achteruit 3,457 (zusterbak Mitsubishi F6AJA)'], ['Eindoverbrenging', '3,571'], ['ATF', 'Elf Elfmatic J6, circa 8 liter'], ['Droog gewicht', 'circa 93 kg'], ['Lengte', 'circa 385 mm']],
    p: [GB_X, 0, 0], ex: [0.66, 0, 0],
  }, [
    ...drvHousing(),
    drvConverter(), drvPump(),
    P('Ingaande as', drvL('InAs', [[0.0075, 0.035], [0.012, 0.045], [0.012, 0.36], [0.009, 0.382]], 16), MAT.steel, { d: 'Ingaande as (circa 347 mm) van het turbinewiel door alle schakelelementen; met oliekanalen.', ex: [0.05, 0.0, 0.72], inner: true }),
    drvSets(), drvClutches(), drvOutput(), drvPark(), drvCounter(), drvDiff(), drvValve(),
    drvOutside(),
    drvStarter(),
  ]);
}

/* ---------- aandrijfassen ---------- */
function bellows(r1, r2, len, n) { const pts = []; for (let k = 0; k <= n * 2; k++) { const t = k / (n * 2); pts.push([lerp(r1, r2, t) - (k % 2 ? 0.005 : 0), t * len]); } return pts; }
// as van punt a (differentieel) naar b (naaf), beide in het motorframe; lokaal x loopt van a naar b.
function driveshaft(name, a, b, o) {
  const A3 = V3(...a), B3 = V3(...b), dir = B3.clone().sub(A3), L = dir.length();
  const q = quatFromTo(V3(1, 0, 0), dir), s = o.sign;
  const bel = G.lathe('x', bellows(0.0445, 0.0236, 0.12, 4), 28, 'drvBel');
  const x1 = o.inner0 || 0.0;                     // begin van de tripode-koppeling (na de tussenas)
  const outerX = L - 0.095, hubX = L;
  const kids = [];
  if (o.mid) kids.push(A('Tussenas', { d: 'Lange binnenstam van de rechter aandrijfas (circa 350 mm) die in een kogellager achter het blok draait; zo komt de rechter as op dezelfde lengte als de linker.', ex: [-0.05, 0.15, 0.0] }, [
    P('Tussenas (stam)', drvL('Tus', [[0.0125, 0.0], [0.0125, 0.052], [0.0155, 0.058], [0.0155, o.mid - 0.02], [0.0125, o.mid - 0.02], [0.0125, o.mid]], 18), MAT.steel, { d: 'Stalen stam met bakzijde 30 spiebanen, die in het zijwiel van het differentieel steekt.', ex: [0, 0, 0.0001] }),
    P('Tussenaslager', merge([annulus(0.0175, 0.031, 0.014, 'x', 32)]), MAT.bearing, { d: 'Kogellager 35 × 62 × 14 mm van de tussenas.', p: [o.mid * 0.8, 0, 0], ex: [0.0, 0.1, 0.0] }),
    P('Lagerhuis tussenas', merge([annulus(0.031, 0.038, 0.016, 'x', 32), xf(G.box(0.016, 0.075, 0.016), [0, 0.0555, 0]), xf(G.box(0.044, 0.01, 0.03), [0, 0.098, 0])]), MAT.aluCast, { d: 'Lagerhuis dat de tussenas aan het blok steunt (positie en vorm schematisch weergegeven).', p: [o.mid * 0.8, 0, 0], ex: [0.0, 0.2, 0.0] }),
    P('Lagerborgring tussenas', annulus(0.0155, 0.0205, 0.002, 'x', 20), MAT.steel, { d: 'Borgring op de tussenas.', p: [o.mid * 0.8 + 0.0095, 0, 0], ex: [0.0, 0.0, 0.1] }),
    ...[-1, 1].map((k, i) => P(`Lagerhuisbout ${i + 1}`, hexBolt(0.02, 0.007, 'y'), MAT.darkSteel, { d: 'Bout van het lagerhuis aan het motorblok.', p: [o.mid * 0.8 + k * 0.014, 0.103, 0], ex: [0, 0.15, 0] })),
  ]));
  const j0 = o.mid || 0;                           // de tripode begint na de tussenas
  kids.push(A('Binnenste homokineet (tripode)', { d: 'Glijdende tripode-koppeling aan de bakzijde (huis circa Ø87 mm): vangt de lengteverandering van de ophanging op. Schematisch weergegeven.', ex: [-0.04 + j0 * 0, 0.0, 0.0] }, [
    P('Tripodehuis', drvL('TriH' + name, [[0.0125, j0], [0.0125, j0 + 0.02], [0.02, j0 + 0.028], [0.0435, j0 + 0.04], [0.0435, j0 + 0.11], [0.036, j0 + 0.113], [0.036, j0 + 0.108]], 28), MAT.steel, { d: 'Huis met drie loopbanen voor de rollen (bakzijde 30 spiebanen).', ex: [-0.06, 0, 0] }),
    P('Tripodester', cache('drvTriS', () => merge([G.cyl('x', 0.013, 0.013, 0.016, 12), ...[0, 1, 2].map(k => xf(G.cyl('y', 0.0045, 0.0045, 0.03, 8), [0, 0, 0], [k * PI * 2 / 3, 0, 0]))])), MAT.darkSteel, { d: 'Ster met drie tappen (tripode) op het uiteinde van de as.', p: [j0 + 0.085, 0, 0], ex: [0.05, 0, 0], inner: true }),
    ...[0, 1, 2].map(k => P(`Rol ${k + 1} met naaldlager`, cache('drvTriR', () => merge([G.cyl('y', 0.0085, 0.0085, 0.011, 14), G.cyl('y', 0.0055, 0.0055, 0.013, 10)])), MAT.steel, { d: 'Rol op een tap van de tripode, met naaldlager.', p: [j0 + 0.085, 0.0235 * Math.cos(k * PI * 2 / 3 + HALF), 0.0235 * Math.sin(k * PI * 2 / 3 + HALF)], r: [k * PI * 2 / 3, 0, 0], ex: [0, 0.06 * Math.cos(k * PI * 2 / 3 + HALF), 0.06 * Math.sin(k * PI * 2 / 3 + HALF)], inner: true })),
    P('Borgring tripode', annulus(0.011, 0.016, 0.0018, 'x', 20), MAT.steel, { d: 'Borgring die de tripodester op de as houdt.', p: [j0 + 0.0955, 0, 0], ex: [0.12, 0, 0], inner: true }),
  ]));
  kids.push(A('Manchet binnen', { d: 'Rubber stofhoes (manchet) met twee klemmen die het vet in de tripode-koppeling houdt.', ex: [-0.02, 0.12, 0] }, [
    P('Manchet', bel, MAT.rubber, { d: 'Balgvormige stofhoes.', p: [j0 + 0.1, 0, 0], ex: [0, 0.0, 0.0001] }),
    P('Grote klem', G.torus('x', 0.0465, 0.0016, 28, 6), MAT.steel, { d: 'Klem op het koppelingshuis.', p: [j0 + 0.112, 0, 0], ex: [-0.04, 0.05, 0] }),
    P('Kleine klem', G.torus('x', 0.0236, 0.0016, 24, 6), MAT.steel, { d: 'Klem op de as.', p: [j0 + 0.215, 0, 0], ex: [0.04, 0.05, 0] }),
  ]));
  kids.push(P('Aandrijfas (schacht)', drvL('Sch' + name, [[0.0125, j0 + 0.09], [0.0125, outerX - 0.01]], 16), MAT.steel, { d: 'Stalen schacht (diameter geschat 24 tot 28 mm). Een trillingsdemper is voor dit motortype niet gevonden.', ex: [0, 0.18, 0] }));
  kids.push(A('Manchet buiten', { d: 'Rubber stofhoes (manchet) met twee klemmen op de buitenste kogelkoppeling.', ex: [0.02, 0.12, 0] }, [
    P('Manchet', bel, MAT.rubber, { d: 'Balgvormige stofhoes.', p: [outerX + 0.01, 0, 0], s: [-1, 1, 1], ex: [0, 0.0, 0.0001] }),
    P('Grote klem', G.torus('x', 0.0465, 0.0016, 28, 6), MAT.steel, { d: 'Klem op de kogelkoppeling.', p: [outerX + 0.0, 0, 0], ex: [0.04, 0.05, 0] }),
    P('Kleine klem', G.torus('x', 0.0236, 0.0016, 24, 6), MAT.steel, { d: 'Klem op de as.', p: [outerX - 0.105, 0, 0], ex: [-0.04, 0.05, 0] }),
  ]));
  const balls = Array.from({ length: 8 }, (_, k) => P(`Kogel ${k + 1}`, G.sphere(0.0072, 10), MAT.chrome, { d: 'Stalen kogel die het koppel tussen binnenste naaf en klok overbrengt.', p: [outerX + 0.036, 0.0335 * Math.cos(k * PI / 4), 0.0335 * Math.sin(k * PI / 4)], ex: [0, 0.07 * Math.cos(k * PI / 4), 0.07 * Math.sin(k * PI / 4)], inner: true }));
  kids.push(A('Buitenste homokineet (kogelkoppeling)', { d: 'Vaste kogelkoppeling aan de wielzijde (Rzeppa, 8 kogels, buitendiameter circa 90 mm): laat sturen en veren toe. Maten en opbouw volgens catalogus, schematisch weergegeven.', ex: [0.06, 0, 0] }, [
    P('Koppelingsklok', drvL('CvB' + name, [[0.031, outerX], [0.0455, outerX + 0.006], [0.0455, outerX + 0.05], [0.036, outerX + 0.066], [0.0165, outerX + 0.074], [0.0165, L + 0.055]], 32), MAT.steel, { d: 'Klok met de uitwendige loopbanen voor de kogels en de gegroefde stompas voor de naaf (27 spiebanen, M22 × 1,5).', ex: [0.12, 0, 0] }),
    P('Kogelkooi', G.lathe('x', [[0.026, outerX + 0.012], [0.04, outerX + 0.026], [0.04, outerX + 0.046], [0.026, outerX + 0.06]], 24, 'drvCage' + name), MAT.drvBrass, { d: 'Kooi die de acht kogels op hun plaats houdt.', ex: [0.04, 0, 0], inner: true }),
    ...balls,
    P('Binnenring kogelkoppeling', G.lathe('x', [[0.0125, outerX + 0.014], [0.0255, outerX + 0.016], [0.0255, outerX + 0.056], [0.0125, outerX + 0.058]], 24, 'drvInRace' + name), MAT.darkSteel, { d: 'Binnenste naaf met loopbanen, op de schacht gespied.', ex: [-0.04, 0, 0], inner: true }),
    P('Borgring kogelkoppeling', annulus(0.0125, 0.0165, 0.0018, 'x', 20), MAT.steel, { d: 'Borgring die de binnenring op de schacht houdt.', p: [outerX + 0.062, 0, 0], ex: [-0.1, 0, 0], inner: true }),
  ]));
  kids.push(P('Naafmoer met ring', merge([G.cyl('x', 0.0165, 0.0165, 0.016, 6), xf(annulus(0.0115, 0.03, 0.004, 'x', 24), [-0.008, 0, 0])]), MAT.steel, { d: 'Naafmoer M22 × 1,5 met onderlegring (sleutelmaat 30 mm) die de as in de naaf klemt; wordt met borglijm vastgezet.', p: [hubX + 0.048, 0, 0], ex: [0.2, 0, 0] }));
  return A(name, { d: o.d, spec: o.spec, p: a, q, ex: o.ex }, kids);
}

/* ---------- motorsteunen ---------- */
function drvMounts() {
  const sub = toPT([0, 0.27, 1.2]).toArray(), rodA = [0.0, -0.075, -0.115];
  const bolt = (nm, d, p, ax, ex) => P(nm, hexBolt(0.025, 0.01, ax), MAT.darkSteel, { d, p, ex });
  return A('Motorsteunen', { d: 'Rubber-metalen steunen die motor en bak trillingsarm in de carrosserie ophangen: rechter pendelsteun aan de distributiezijde, linker bak-steun en een koppelstang onder de motor.', ex: [0, 0.7, 0] }, [
    A('Motorsteun distributiezijde', { d: 'Rechter bovensteun (pendelsteun) met limiteur: rubber-metalen steun van aluminium, circa 198 × 61 × 53 mm. Zit boven op het distributiedeksel.', spec: [['Afmetingen', '198 × 61 × 53 mm'], ['Uitvoering', 'rubber-metaal, aluminium']], ex: [-0.15, 0.1, 0] }, [
      P('Beugel motorzijde', merge([G.rbox(0.09, 0.06, 0.05, 0.006), xf(G.box(0.04, 0.012, 0.05), [0.06, -0.024, 0])]), MAT.alu, { d: 'Aluminium beugel op de motor.', p: [-0.2, 0.33, 0.062], ex: [0.0, 0.0, 0.0001] }),
      P('Rubber pendelsteun', G.cyl('x', 0.026, 0.026, 0.05, 20), MAT.rubber, { d: 'Rubberelement dat de trillingen dempt.', p: [-0.28, 0.33, 0.062], ex: [-0.08, 0, 0] }),
      P('Limiteur', merge([G.cyl('x', 0.012, 0.012, 0.07, 12), xf(G.cyl('x', 0.02, 0.02, 0.006, 16), [0.03, 0, 0])]), MAT.darkSteel, { d: 'Begrenzer die de beweging van de motor bij hoge belasting beperkt.', p: [-0.28, 0.33, 0.062], ex: [-0.16, 0.06, 0] }),
      P('Beugel carrosseriezijde', merge([G.rbox(0.06, 0.05, 0.05, 0.006), xf(G.box(0.012, 0.062, 0.05), [-0.026, 0.0, 0])]), MAT.alu, { d: 'Aluminium beugel naar de carrosserie (vorm schematisch).', p: [-0.345, 0.33, 0.062], ex: [-0.24, 0, 0] }),
      bolt('Bout beugel 1', 'Bout die de beugel aan de motor bevestigt.', [-0.2, 0.363, 0.043], 'y', [0, 0.1, 0]),
      bolt('Bout beugel 2', 'Bout die de beugel aan de motor bevestigt.', [-0.2, 0.363, 0.081], 'y', [0, 0.1, 0.06]),
      bolt('Bout beugel 3', 'Bout die de steun aan de carrosserie bevestigt.', [-0.365, 0.363, 0.062], 'y', [-0.1, 0.1, 0]),
    ]),
    A('Steun versnellingsbak', { d: 'Linker bak-steun: rubber-metalen steun bovenop de bak die de bak aan de linker langsligger hangt (aannemelijk; details voor de F4Rt niet gevonden).', ex: [0.2, 0.1, 0] }, [
      P('Beugel bak', merge([G.rbox(0.09, 0.025, 0.07, 0.005), xf(G.box(0.024, 0.045, 0.07), [-0.033, 0.03, 0])]), MAT.aluCast, { d: 'Beugel op het carter.', p: [GB_X + 0.29, 0.155, 0.0], ex: [0, 0, 0.0001] }),
      P('Rubber bakssteun', G.cyl('y', 0.025, 0.025, 0.04, 18), MAT.rubber, { d: 'Rubberblok van de steun.', p: [GB_X + 0.29, 0.1875, 0.0], ex: [0, 0.07, 0] }),
      P('Bovenplaat bakssteun', G.rbox(0.1, 0.01, 0.07, 0.004), MAT.darkSteel, { d: 'Plaat naar de langsligger van de carrosserie.', p: [GB_X + 0.29, 0.2125, 0.0], ex: [0.0, 0.14, 0] }),
      ...[-1, 1].map((k, i) => bolt(`Bout bakssteun ${i + 1}`, 'Bout van de bakssteun.', [GB_X + 0.29 + k * 0.035, 0.221, 0], 'y', [0.0, 0.2, 0])),
    ]),
    A('Koppelstang', { d: 'Onderste koppelstang (biellette de reprise de couple): vangt het reactiekoppel van de aandrijflijn bij optrekken en remmen op tussen een beugel op de carterpan en het subframe. Positie en vorm schematisch weergegeven.', ex: [0, -0.2, -0.1] }, [
      P('Koppelstang (staaf)', rodBetween(rodA, sub, 0.012), MAT.darkSteel, { d: 'Staaf met aan beide uiteinden een oog.', ex: [0, 0, 0.0001] }),
      P('Rubber lagerbus motorzijde', G.cyl('x', 0.025, 0.025, 0.03, 18), MAT.rubber, { d: 'Rubberbus in het oog aan de motorzijde.', p: rodA, ex: [0.08, 0.04, 0] }),
      P('Rubber lagerbus subframe', G.cyl('x', 0.025, 0.025, 0.03, 18), MAT.rubber, { d: 'Rubberbus in het oog aan de subframezijde.', p: sub, ex: [-0.08, -0.04, 0] }),
      P('Beugel carterpan', G.rbox(0.07, 0.04, 0.05, 0.005), MAT.aluCast, { d: 'Beugel op de carterpan waaraan de koppelstang vastzit.', p: [rodA[0], rodA[1] + 0.035, rodA[2] + 0.02], ex: [0.0, 0.1, 0.1] }),
      P('Doorgaande bout motorzijde', hexBolt(0.07, 0.012, 'x'), MAT.darkSteel, { d: 'Bout door de bus en de beugel.', p: [rodA[0] - 0.045, rodA[1], rodA[2]], ex: [-0.16, 0.04, 0] }),
      P('Doorgaande bout subframe', hexBolt(0.07, 0.012, 'x'), MAT.darkSteel, { d: 'Bout door de bus en het subframe.', p: [sub[0] - 0.045, sub[1], sub[2]], ex: [-0.2, -0.04, 0] }),
    ]),
  ]);
}

function buildPowertrain() {
  const engine = buildEngine();
  engine.ex = V3(-0.24, 0.12, 0);
  const gb = buildGearbox();
  // uitgangen van het differentieel (bakframe -> motorframe) en naven (autoframe -> motorframe)
  const dOutL = [GB_X + DIFF[0] + 0.082, DIFF[1], DIFF[2]], dOutR = [GB_X + DIFF[0] - 0.082, DIFF[1], DIFF[2]];
  const hubL = toPT([0.775, AY, AXF]).toArray(), hubR = toPT([-0.775, AY, AXF]).toArray();
  const shafts = A('Aandrijfassen', { d: 'Linker (kort) en rechter (lang, met tussenas en tussenaslager) aandrijfas van het differentieel naar de voorwielen, elk met een tripode-koppeling aan de bakzijde en een kogelkoppeling aan de wielzijde. Lengten volgens catalogus: links circa 640 mm, rechts circa 962 mm.', ex: [0, -0.5, -0.3] }, [
    driveshaft('Aandrijfas links', dOutL, hubL, { sign: 1, d: 'Korte linker aandrijfas (catalogus circa 640 mm, 30 spiebanen bakzijde, 27 wielzijde).', spec: [['Lengte (catalogus)', 'circa 640 mm'], ['Binnenste koppeling', 'tripode, Ø87 mm'], ['Buitenste koppeling', 'kogelkoppeling, 8 kogels']], ex: [0.5, 0, 0] }),
    driveshaft('Aandrijfas rechts', dOutR, hubR, { sign: -1, mid: 0.35, d: 'Lange rechter aandrijfas (catalogus circa 962 mm) met tussenas (circa 350 mm) en kogellager 35 × 62 × 14 mm; loopt achter het motorblok langs.', spec: [['Lengte (catalogus)', 'circa 962 mm'], ['Tussenlager', 'kogellager 35 × 62 × 14 mm'], ['Buitenste koppeling', 'kogelkoppeling, 8 kogels']], ex: [-0.5, 0, 0] }),
  ]);
  return A('Aandrijflijn', {
    d: 'Dwarsgeplaatste motor en automaat met differentieel en aandrijfassen naar de voorwielen.',
    spec: [['Motor', '2.0 Turbo F4Rt, 170 pk'], ['Transmissie', '6-traps automaat (Jatco JF613E, Renault AJ0)'], ['Aandrijving', 'voorwielen'], ['Topsnelheid', '220 km/h'], ['0–100 km/h', '9,2 s']],
    p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [0, 0.35, 1.9],
  }, [engine, gb, shafts, drvMounts()]);
}

/* ===================== koeling, luchtinlaat, uitlaat, brandstof, elektra en de samenstelling van de auto ===================== */
// Alles wat aan de motor of de startmotor hangt begint op ENG_PORTS.* (via ENG2CAR) of DRV_PORTS.starterTerminal.
std('sysHose', 0x1b1d20, 0, 0.8);
std('sysBattery', 0x2c3947, 0, 0.55);
std('sysTkNis', 0x3a3e44, 0.15, 0.55);                          // tankkom: halfdonker satijn, donkerder dan de lak
std('sysDemper', 0x4a4642, 0.35, 0.88);                         // einddemper en eindpijpen: donker, ruw plaatstaal (onder de bumper is bijna niets te zien)

const sysP = e => ENG2CAR(e);                                  // punt in het motorframe naar het autoframe
const sysE = (port, d = 0) => ENG2CAR(portAt(port, d));         // punt op afstand d buiten een aansluiting (autoframe)
function sysDir(a, b) { return V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); }
function sysAt(p, t, k) { return [p[0] + t.x * k, p[1] + t.y * k, p[2] + t.z * k]; }
function sysClampGeo(r) {
  return cache('sysClamp' + r, () => merge([G.torus('z', r + 0.0035, 0.0022, 14, 5), xf(G.box(0.014, 0.006, 0.01), [0, r + 0.0075, 0]), xf(G.cyl('x', 0.0025, 0.0025, 0.016, 6), [0, r + 0.0105, 0])]));
}
// slangklem om een slang of pijp met straal r; as langs t (eenheidsvector), schuift bij uitklappen langs out
function sysClamp(name, at, t, r, out) {
  const o = out || t;
  return P(name, sysClampGeo(r), MAT.steel, { d: 'Slangklem van verzinkt staal met een stelschroef; klemt de slang of pijp vast op de aansluiting.', p: at, q: quatFromTo(V3(0, 0, 1), t), ex: [o.x * 0.06, o.y * 0.06 + 0.02, o.z * 0.06] });
}
// slang als groep: slang plus twee klemmen. pts in het autoframe; de uiteinden liggen op de aansluitingen.
function sysHose(name, d, pts, r, o = {}) {
  const n = pts.length, t0 = sysDir(pts[0], pts[1]), t1 = sysDir(pts[n - 1], pts[n - 2]);
  const kids = [P('Slang', tube(pts, r, o.seg || 28, o.rad || 8), o.mat || MAT.sysHose, { d: o.dh || 'Slang van versterkt rubber; volgt de route tussen beide aansluitingen.', ex: o.hex || [0, 0.08, 0] })];
  if (o.c0 !== false) kids.push(sysClamp(o.n0 || 'Klem begin', sysAt(pts[0], t0, 0.016), t0, r, t0.clone().negate()));
  if (o.c1 !== false) kids.push(sysClamp(o.n1 || 'Klem eind', sysAt(pts[n - 1], t1, 0.016), t1, r, t1.clone().negate()));
  return A(name, { d, spec: o.spec, ex: o.ex || [0, 0.1, 0] }, kids);
}

/* ============================ koeling en luchtinlaat ============================ */
function buildCooling() {
  const RY = 0.48, RZ = 1.99;                                   // hartlijn koelblok
  // ---------- radiateur ----------
  const coreGeo = cache('sysRadCore', () => merge([G.box(0.56, 0.36, 0.022), ...[-0.15, -0.075, 0, 0.075, 0.15].map(y => xf(G.box(0.56, 0.003, 0.025), [0, y, 0]))]));
  const radiateur = A('Radiateur', { d: 'Dwarsstroomradiateur met aluminium blok en kunststof waterkasten, vóór de motor in de frontmodule. De koelvloeistof stroomt van de linker naar de rechter waterkast (opbouw schematisch).', ex: [0, 0, -0.12] }, [
    P('Koelblok', coreGeo, MAT.alu, { d: 'Aluminium blok met buisjes en lamellen waar de lucht doorheen stroomt.', p: [0, RY, RZ], ex: [0, 0, 0] }),
    P('Waterkast links', G.rbox(0.04, 0.36, 0.046, 0.008), MAT.plastic, { d: 'Kunststof waterkast waar de warme koelvloeistof binnenkomt.', p: [0.30, RY, RZ], ex: [0.13, 0, 0] }),
    P('Waterkast rechts', G.rbox(0.04, 0.36, 0.046, 0.008), MAT.plastic, { d: 'Kunststof waterkast waar de afgekoelde vloeistof het blok verlaat.', p: [-0.30, RY, RZ], ex: [-0.13, 0, 0] }),
    P('Pakking waterkast links', G.box(0.012, 0.34, 0.024), MAT.rubber, { d: 'Rubber afdichting tussen waterkast en blok.', p: [0.285, RY, RZ], ex: [0.06, 0, 0], inner: true }),
    P('Pakking waterkast rechts', G.box(0.012, 0.34, 0.024), MAT.rubber, { d: 'Rubber afdichting tussen waterkast en blok.', p: [-0.285, RY, RZ], ex: [-0.06, 0, 0] }),
    P('Inlaatstomp', G.cyl('z', 0.0185, 0.0185, 0.045, 14), MAT.plastic, { d: 'Aansluiting van de bovenste radiateurslang op de linker waterkast.', p: [0.30, 0.62, RZ - 0.0455], ex: [0, 0.05, -0.1] }),
    P('Uitlaatstomp', G.cyl('z', 0.0185, 0.0185, 0.045, 14), MAT.plastic, { d: 'Aansluiting van de onderste radiateurslang op de rechter waterkast.', p: [-0.30, 0.34, RZ - 0.0455], ex: [0, -0.05, -0.1] }),
    P('Aftapkraan', merge([G.cyl('y', 0.008, 0.008, 0.026, 10), xf(G.box(0.03, 0.008, 0.008), [0, -0.016, 0])]), MAT.plastic, { d: 'Kraan onderin de rechter waterkast om de koelvloeistof af te tappen.', p: [-0.30, 0.285, RZ], ex: [0, -0.1, 0] }),
    P('Ontluchtingsschroef', G.cyl('y', 0.007, 0.007, 0.02, 8), MAT.brass || MAT.bearing, { d: 'Schroef bovenin de waterkast om lucht uit het koelsysteem te laten ontsnappen.', p: [-0.30, 0.67, RZ], ex: [0, 0.12, 0] }),
    ...[1, -1].map(s => P(`Ophangrubber boven ${sideName(s)}`, merge([G.cyl('y', 0.011, 0.011, 0.018, 12), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, 0.012, 0])]), MAT.rubber, { d: 'Rubber ophangpen waarmee de radiateur bovenin in de frontmodule rust.', p: [s * 0.2, 0.67, RZ], ex: [0, 0.14, 0] })),
    ...[1, -1].map(s => P(`Steunblok onder ${sideName(s)}`, G.rbox(0.04, 0.02, 0.04, 0.005), MAT.rubber, { d: 'Rubber steunblok onder de radiateur in de frontmodule.', p: [s * 0.2, 0.29, RZ], ex: [0, -0.14, 0] })),
  ]);
  // ---------- condensor met droger ----------
  const condensor = A('Condensor', { d: 'Condensor van de airconditioning, vlak vóór de radiateur, met de droger-filtereenheid (receiver-drier) tegen de linkerkant van het blok.', ex: [0, 0, 0.16] }, [
    P('Condensorblok', cache('sysCondCore', () => merge([G.box(0.58, 0.34, 0.014), ...[-0.12, -0.06, 0, 0.06, 0.12].map(y => xf(G.box(0.58, 0.004, 0.017), [0, y, 0]))])), MAT.darkSteel, { d: 'Aluminium parallelstroomblok waar het koudemiddel zijn warmte aan de lucht afgeeft.', p: [0, RY, 2.015] }),
    P('Droger', G.cyl('y', 0.021, 0.021, 0.2, 16), MAT.alu, { d: 'Droger-filtereenheid met vochtopname voor het koudemiddel.', p: [0.26, RY, 2.045], ex: [0.12, 0, 0.1] }),
    P('Dop droger', G.cyl('y', 0.024, 0.024, 0.02, 12), MAT.plastic, { d: 'Dop op de droger; verwisselbaar bij vervanging van het filter.', p: [0.26, RY + 0.11, 2.045], ex: [0, 0.14, 0] }),
    P('Leidingblok', G.rbox(0.05, 0.04, 0.03, 0.006), MAT.steel, { d: 'Aansluitblok voor de hoge- en lagedrukleiding van de airconditioning.', p: [-0.3, RY - 0.12, 2.03], ex: [-0.1, 0, 0.1] }),
    ...[1, -1].map(s => P(`Condensorclip ${sideName(s)}`, G.box(0.03, 0.016, 0.02), MAT.plastic, { d: 'Kunststof clip die de condensor aan de frontmodule bevestigt.', p: [s * 0.26, 0.655, 2.025], ex: [s * 0.04, 0.1, 0.04] })),
  ]);
  // ---------- intercooler ----------
  const ICY = 0.31, ICZ = 2.15;
  const intercooler = A('Intercooler', { d: 'Lucht-luchtkoeler achter de onderste luchtinlaat: koelt de door de turbo samengeperste lucht voordat die naar het gasklephuis gaat. De warme lucht komt links binnen, de gekoelde lucht verlaat hem rechts.', spec: [['Inlaat', 'ø 57 mm (aannemelijk)'], ['Uitlaat', 'ø 47 mm (aannemelijk)']], ex: [0, -0.04, 0.36] }, [
    P('Intercoolerkern', cache('sysIcCore', () => merge([G.box(0.54, 0.11, 0.09), ...[-0.03, 0, 0.03].map(y => xf(G.box(0.54, 0.003, 0.094), [0, y, 0]))])), MAT.alu, { d: 'Aluminium kern met plaatvormige luchtkanalen en koelribben.', p: [0, ICY, ICZ] }),
    P('Eindkap links', G.rbox(0.06, 0.12, 0.096, 0.012), MAT.aluCast, { d: 'Gegoten eindkap aan de inlaatzijde (links), met de aansluiting voor de hete laadluchtslang.', p: [0.30, ICY, ICZ], ex: [0.12, 0, 0] }),
    P('Eindkap rechts', G.rbox(0.06, 0.12, 0.096, 0.012), MAT.aluCast, { d: 'Gegoten eindkap aan de uitlaatzijde (rechts), met de aansluiting voor de gekoelde laadluchtslang.', p: [-0.30, ICY, ICZ], ex: [-0.12, 0, 0] }),
    P('Inlaatstomp intercooler', G.cyl('z', 0.0285, 0.0285, 0.05, 18), MAT.aluCast, { d: 'Inlaatstomp van 57 mm voor de hete laadluchtslang van de turbo.', p: [0.30, ICY, ICZ - 0.07], ex: [0.06, 0, -0.1] }),
    P('Uitlaatstomp intercooler', G.cyl('z', 0.0235, 0.0235, 0.05, 18), MAT.aluCast, { d: 'Uitlaatstomp van 47 mm voor de koude laadluchtslang naar het gasklephuis.', p: [-0.30, ICY, ICZ - 0.07], ex: [-0.06, 0, -0.1] }),
    ...[1, -1].map(s => P(`Steunbeugel ${sideName(s)}`, merge([G.box(0.03, 0.02, 0.12), xf(G.box(0.03, 0.06, 0.012), [0, 0.03, 0.054])]), MAT.darkSteel, { d: 'Steunbeugel dat de intercooler aan de bumperbalk en de frontmodule vasthoudt.', p: [s * 0.2, ICY - 0.07, ICZ + 0.0], ex: [s * 0.06, -0.12, 0] })),
  ]);
  // ---------- koelventilatormodule ----------
  const FZ = 1.955;
  const shroud = cache('sysShroud', () => merge([xf(G.box(0.6, 0.026, 0.035), [0, 0.18, 0]), xf(G.box(0.6, 0.026, 0.035), [0, -0.18, 0]), xf(G.box(0.026, 0.36, 0.035), [0.3, 0, 0]), xf(G.box(0.026, 0.36, 0.035), [-0.3, 0, 0]), G.torus('z', 0.18, 0.012, 40, 6)]));
  const spokes = cache('sysFanSpokes', () => merge([0, 1, 2, 3].map(k => xf(G.box(0.012, 0.13, 0.014), [0.1 * Math.cos(k * HALF + 0.4), 0.1 * Math.sin(k * HALF + 0.4), -0.012], [0, 0, k * HALF + 0.4 - HALF]))));
  const ventilator = A('Koelventilatormodule', { d: 'Elektrische koelventilator in een kunststof kap achter de radiateur; trekt lucht door het hele koelpakket, vooral stilstaand en bij lage snelheid. Het aantal ventilatoren is niet gevonden; regelweerstand en stekker zijn schematisch weergegeven (opbouw zoals gebruikelijk bij een ventilatormodule).', ex: [0, 0, -0.36] }, [
    P('Ventilatorkap', shroud, MAT.plastic, { d: 'Kap die de luchtstroom door het hele koelblok leidt.', p: [0, RY, FZ] }),
    P('Ventilatorwaaier', merge([blades(7, 0.045, 0.165, 0.03, 0.003, 0.55, 'z'), G.cyl('z', 0.045, 0.045, 0.035, 20)]), MAT.plastic, { d: 'Zevenbladige waaier van kunststof.', p: [0, RY, FZ + 0.004], ex: [0, 0, 0.14] }),
    P('Ventilatormotor', G.cyl('z', 0.04, 0.04, 0.06, 20), MAT.darkSteel, { d: 'Elektromotor in het midden van de kap, drijft de waaier rechtstreeks aan.', p: [0, RY, FZ - 0.034], ex: [0, 0, -0.14] }),
    P('Motorsteunen', spokes, MAT.plastic, { d: 'Vier spaken die de ventilatormotor in de kap dragen.', p: [0, RY, FZ - 0.01], ex: [0, 0, -0.07] }),
    P('Regelweerstand', merge([G.box(0.05, 0.03, 0.03), ...[0, 1, 2].map(k => xf(G.box(0.05, 0.004, 0.036), [0, -0.012 + k * 0.012, 0]))]), MAT.darkSteel, { d: 'Weerstand die de ventilator op een lager toerental laat draaien.', p: [-0.2, RY - 0.17, FZ - 0.03], ex: [-0.06, -0.1, -0.06] }),
    P('Ventilatorstekker', G.rbox(0.03, 0.022, 0.02, 0.004), MAT.plastic, { d: 'Stekker met de voeding en de aansturing van de ventilatormotor.', p: [0.14, RY - 0.17, FZ - 0.05], ex: [0.04, -0.1, -0.1] }),
  ]);
  // ---------- expansievat ----------
  const EV = [-0.45, 0.70, 1.24];   // vat vlak voor de torpedobak (die loopt tot z 1,146), zodat de dop er niet onder zit
  const expansie = A('Expansievat', { d: 'Doorzichtig kunststof expansievat met min- en maxmarkering; vangt de uitzetting van de koelvloeistof op en houdt het systeem onder druk.', spec: [['Dopdruk', '1,4 bar (aannemelijk)']], ex: [-0.18, 0.2, -0.04] }, [
    P('Vat', merge([G.rbox(0.12, 0.13, 0.15, 0.018), xf(G.cyl('y', 0.03, 0.03, 0.02, 16), [0.02, 0.07, 0.0])]), MAT.tank, { d: 'Doorzichtig vat met de niveaumarkering voor koelvloeistof.', p: EV }),
    // vulhals met een donkere opening (de dop sluit hem af); de dop klapt om een scharnierlip aan de achterrand van de hals omhoog (zoals de olievuldop) en blijft eraan vast
    P('Vulopening expansievat', G.cyl('y', 0.022, 0.022, 0.002, 20), MAT.blackGloss, { d: 'Open vulhals van het expansievat: een donkere opening in de opstaande hals; de drukdop sluit hem af.', p: [EV[0] + 0.02, EV[1] + 0.0805, EV[2]], ex: [0, 0.03, 0] }),
    P('Expansiedop', merge([G.cyl('y', 0.034, 0.034, 0.016, 16), xf(G.box(0.07, 0.01, 0.014), [0, 0.011, 0]), xf(G.box(0.018, 0.006, 0.016), [0, -0.005, -0.042]), xf(G.cyl('x', 0.0045, 0.0045, 0.024, 8), [0, -0.0045, -0.0485])]), MAT.plastic, { d: 'Drukdop met overdrukklep die bij 1,4 bar opent; klapt in dit model om een scharnierlip aan de achterrand van de hals omhoog en blijft eraan vast (opener, schematisch: in werkelijkheid draai je de dop los).', p: [EV[0] + 0.02, EV[1] + 0.088, EV[2]], ex: [0, 0.14, 0], open: { type: 'hinge', pivot: [EV[0] + 0.02, EV[1] + 0.0835, EV[2] - 0.0485], axis: [1, 0, 0], angle: -1.8, min: 1.44, needs: 'Motorkap', label: 'Dop expansievat', look: { dir: [0.4, 0.8, 0.9], nodes: ['Expansiedop', 'Koeling en luchtinlaat/Expansievat/Vat'] } } }),
    P('Niveauschakelaar', G.rbox(0.03, 0.026, 0.026, 0.005), MAT.plastic, { d: 'Schakelaar die het dashboard waarschuwt bij een te laag koelvloeistofpeil.', p: [EV[0] + 0.068, EV[1] - 0.02, EV[2]], ex: [0.1, 0, 0] }),
    P('Vathouder', merge([G.box(0.13, 0.012, 0.16), xf(G.box(0.012, 0.09, 0.16), [0.06, 0.05, 0])]), MAT.darkSteel, { d: 'Beugel die het expansievat aan de carrosserie vasthoudt.', p: [EV[0], EV[1] - 0.07, EV[2]], ex: [0, -0.12, 0] }),
  ]);
  // ---------- koelslangen ----------
  const tOut = ENG_PORTS.thermostatOut, pIn = ENG_PORTS.waterPumpIn;
  const hoseTop = sysHose('Bovenste radiateurslang', 'Voert de warme koelvloeistof van het waterstuk bij de thermostaat naar de linker waterkast van de radiateur.', [sysP(tOut.p), sysE(tOut, 0.04), [0.15, 0.80, 1.6], [0.26, 0.78, 1.78], [0.30, 0.72, 1.88], [0.30, 0.64, 1.918], [0.30, 0.62, 1.935]], 0.02, { n0: 'Klem waterstuk', n1: 'Klem radiateur', seg: 40, rad: 10, ex: [0.1, 0.16, 0.08] });
  const hoseBot = sysHose('Onderste radiateurslang', 'Brengt de afgekoelde vloeistof van de rechter waterkast terug naar de aanvoerstomp van de waterpomp.', [sysP(pIn.p), sysE(pIn, 0.03), [-0.29, 0.42, 1.78], [-0.30, 0.37, 1.88], [-0.30, 0.34, 1.935]], 0.02, { n0: 'Klem waterpomp', n1: 'Klem radiateur', seg: 28, rad: 10, ex: [-0.04, -0.14, 0.1] });
  // verwarmingsslangen en ontluchting lopen achter de motor langs naar het schutbord (schematisch, aansluiting op het waterstuk)
  const wA = sysP([tOut.p[0] - 0.012, tOut.p[1] - 0.012, tOut.p[2] - 0.02]), wB = sysP([tOut.p[0] - 0.028, tOut.p[1] - 0.012, tOut.p[2] - 0.034]);
  const hoseHeatA = sysHose('Verwarmingsslang aanvoer', 'Voert warme koelvloeistof naar de verwarmingsradiateur achter het schutbord.', [wA, [0.16, 0.755, 1.36], [0.14, 0.745, 1.24], [0.02, 0.74, 1.215], [-0.04, 0.74, 1.15], [-0.07, 0.74, 1.05]], 0.0095, { n0: 'Klem waterstuk', n1: 'Klem schutbord', seg: 40, rad: 8, ex: [0, 0.12, -0.1] });
  const hoseHeatR = sysHose('Verwarmingsslang retour', 'Brengt de afgekoelde vloeistof van de verwarmingsradiateur terug naar het koelcircuit.', [wB, [0.115, 0.755, 1.36], [0.095, 0.745, 1.285], [0.003, 0.74, 1.257], [-0.079, 0.74, 1.166], [-0.12, 0.74, 1.05]], 0.0095, { n0: 'Klem waterstuk', n1: 'Klem schutbord', seg: 40, rad: 8, ex: [0, 0.16, -0.1] });
  const heater = A('Verwarmingsslangen', { d: 'Twee slangen tussen het koelcircuit en de verwarmingsradiateur achter het schutbord, met de aansluitstompen door het schutbord.', ex: [0, 0.1, -0.1] }, [
    hoseHeatA, hoseHeatR,
    P('Aansluitstomp aanvoer', G.cyl('z', 0.0085, 0.0085, 0.04, 10), MAT.alu, { d: 'Stomp van de verwarmingsradiateur die door het schutbord steekt (aanvoer).', p: [-0.07, 0.74, 1.04], ex: [0, 0, 0.1] }),
    P('Aansluitstomp retour', G.cyl('z', 0.0085, 0.0085, 0.04, 10), MAT.alu, { d: 'Stomp van de verwarmingsradiateur die door het schutbord steekt (retour).', p: [-0.12, 0.74, 1.04], ex: [0, 0, 0.1] }),
  ]);
  const hoseVent = sysHose('Ontluchtingsslang', 'Dunne slang van het waterstuk naar het expansievat; voert damp en lucht uit het koelcircuit af.', [sysP([tOut.p[0] - 0.02, tOut.p[1] - 0.012, tOut.p[2] - 0.045]), [0.108, 0.795, 1.4], [0.12, 0.805, 1.3], [0.0, 0.805, 1.295], [-0.2, 0.785, 1.28], [-0.34, 0.775, 1.25], [-0.40, 0.765, 1.2], [EV[0] + 0.02, EV[1] + 0.04, EV[2] + 0.06]], 0.0075, { n0: 'Klem waterstuk', n1: 'Klem expansievat', seg: 48, rad: 6, ex: [0, 0.2, 0] });
  const slangen = A('Koelslangen', { d: 'De slangen van het koelcircuit: boven- en onderslang naar de radiateur, de verwarmingsslangen en de ontluchtingsslang naar het expansievat. Elke slang zit met klemmen op zijn aansluiting.', ex: [0, 0.16, 0.1] }, [hoseTop, hoseBot, heater, hoseVent]);
  // ---------- luchtinlaat ----------
  const AB = [0.40, 0.70, 1.69];                       // hartpunt luchtfilterhuis
  const box = (w, h, d, r) => G.rbox(w, h, d, r);
  const sluit = [[-0.1, 0.1], [0.1, 0.1], [-0.1, -0.1], [0.1, -0.1]];
  const cIn = ENG_PORTS.compIn;
  const hoseAir = sysHose('Aanzuigslang turbo', 'Voert de gefilterde lucht van het luchtfilterhuis naar de compressorinlaat van de turbo.', [[0.38, 0.7365, 1.535], [0.37, 0.725, 1.48], [0.34, 0.665, 1.40], [0.30, 0.60, 1.31], [0.24, 0.53, 1.235], [0.17, 0.495, 1.226], sysE(cIn, 0.08), sysE(cIn, 0.03), sysP(cIn.p)], 0.03, { n0: 'Klem luchtfilterhuis', n1: 'Klem turbo', seg: 56, rad: 12, ex: [0.1, 0.12, -0.1] });
  const inlaat = A('Luchtinlaat', { d: 'Aanzuigtraject: luchtgeleider achter de grille, luchtfilterhuis met papieren element en de aanzuigslang naar de turbocompressor. De motor meet de belasting met een druksensor (MAP) op het inlaatspruitstuk; een luchtmassameter komt in de onderdelenlijsten voor deze motor niet voor (aannemelijk).', ex: [0.2, 0.3, 0.15] }, [
    P('Luchtgeleider', merge([tube([[0.27, 0.62, 2.235], [0.325, 0.595, 2.15], [0.355, 0.575, 2.05], [0.355, 0.575, 1.94], [0.37, 0.62, 1.86], [0.36, 0.66, AB[2] + 0.145]], 0.025, 36, 12), xf(G.cyl('z', 0.034, 0.025, 0.03, 14), [0.27, 0.62, 2.24])]), MAT.plastic, { d: 'Kunststof kanaal dat koele buitenlucht achter de grille opvangt en naar het luchtfilterhuis leidt.', ex: [0, 0.08, 0.2] }),
    P('Luchtfilterhuis', merge([box(0.24, 0.1, 0.27, 0.02), xf(G.box(0.26, 0.008, 0.29), [0, 0.05, 0])]), MAT.plastic, { d: 'Onderbak van het luchtfilter met rand voor het deksel.', p: [AB[0] - 0.02, AB[1] - 0.04, AB[2]], ex: [0, -0.1, 0] }),
    P('Luchtfilterelement', cache('sysAirEl', () => merge([G.rbox(0.22, 0.03, 0.25, 0.006), ...[-0.08, -0.04, 0, 0.04, 0.08].map(x => xf(G.box(0.006, 0.014, 0.24), [x, 0.02, 0]))])), MAT.filter, { d: 'Geplisseerd papieren filterelement.', p: [AB[0] - 0.02, AB[1] + 0.005, AB[2]], ex: [0, 0.09, 0] }),
    P('Luchtfilterdeksel', merge([box(0.24, 0.045, 0.27, 0.02), xf(G.cyl('z', 0.034, 0.034, 0.045, 14), [0, 0, -0.145])]), MAT.plastic, { d: 'Deksel met de uitlaat naar de turbo; vastgezet met vier clips.', p: [AB[0] - 0.02, AB[1] + 0.0365, AB[2]], ex: [0, 0.22, 0] }),
    ...sluit.map(([sx, sz], i) => P(`Sluitclip ${i + 1}`, G.box(0.016, 0.06, 0.012), MAT.steel, { d: 'Veerclip die het deksel op de onderbak klemt.', p: [AB[0] - 0.02 + sx * 1.2, AB[1] + 0.015, AB[2] + sz * 1.4], ex: [sx * 0.3, 0.12, sz * 0.3] })),
    P('Inlaattemperatuursensor', merge([G.cyl('y', 0.007, 0.007, 0.02, 8), xf(G.rbox(0.02, 0.014, 0.02, 0.004), [0, 0.014, 0])]), MAT.plastic, { d: 'Meet de temperatuur van de aangezogen lucht.', p: [AB[0] + 0.04, AB[1] + 0.07, AB[2] + 0.05], ex: [0, 0.1, 0] }),
    P('Rubber ophangpen luchtfilterhuis', G.cyl('y', 0.01, 0.01, 0.03, 10), MAT.rubber, { d: 'Rubber pen waarmee de onderbak op de carrosserie rust.', p: [AB[0] - 0.02, AB[1] - 0.105, AB[2] - 0.08], ex: [0, -0.1, 0] }),
    hoseAir,
    P('Resonator', merge([G.cyl('x', 0.04, 0.04, 0.09, 16), xf(G.cyl('y', 0.014, 0.014, 0.04, 10), [0, 0.04, 0])]), MAT.plastic, { d: 'Kunststof resonator die het aanzuiggeluid van de turbo dempt (uitvoering schematisch).', p: [0.31, 0.66, 1.48], ex: [0.16, 0.08, 0] }),
  ]);
  // ---------- laadluchtleidingen ----------
  const cO = ENG_PORTS.compOut, tI = ENG_PORTS.throttleIn;
  const hot = sysHose('Hete laadluchtslang', 'Voert de door de turbo samengeperste, hete lucht van de compressoruitlaat naar de linker eindkap van de intercooler.', [sysP(cO.p), sysE(cO, 0.035), [0.0, 0.64, 1.16], [0.14, 0.62, 1.2], [0.17, 0.605, 1.45], [0.19, 0.6, 1.72], [0.31, 0.56, 1.86], [0.375, 0.46, 1.96], [0.35, 0.37, 2.02], [0.30, 0.31, 2.07]], 0.031, { n0: 'Klem turbo', n1: 'Klem intercooler', seg: 80, rad: 12, ex: [0.12, 0.2, 0], spec: [['Aansluiting op de intercooler', 'ø 57 mm (aannemelijk)']] });
  const cold = sysHose('Koude laadluchtslang', 'Voert de gekoelde lucht van de rechter eindkap van de intercooler naar het gasklephuis. De slang buigt binnen enkele centimeters na het gasklephuis naar voren, vóór de multiriem, en loopt boven de stuurbekrachtigingspomp langs.', [[-0.30, 0.31, 2.07], [-0.33, 0.33, 2.04], [-0.37, 0.40, 1.98], [-0.39, 0.50, 1.90], [-0.42, 0.57, 1.83], sysP([tI.p[0] - 0.03, tI.p[1] + 0.01, 0.30]), sysP([tI.p[0] - 0.029, tI.p[1], 0.245]), sysP([tI.p[0] - 0.021, tI.p[1], tI.p[2] + 0.005]), sysP(tI.p)], 0.027, { n0: 'Klem intercooler', n1: 'Klem gasklephuis', seg: 80, rad: 12, ex: [-0.12, 0.2, 0], spec: [['Aansluiting op de intercooler', 'ø 47 mm (aannemelijk)']] });
  const laadlucht = A('Laadluchtleidingen', { d: 'De twee slangen die de aangezogen lucht van de turbo naar de intercooler en van de intercooler naar het gasklephuis brengen.', ex: [0, 0.22, 0.1] }, [hot, cold]);

  return A('Koeling en luchtinlaat', { d: 'Koelpakket (intercooler, condensor, radiateur en koelventilator), expansievat, koelslangen en het luchtinlaattraject naar de turbo.', ex: [0, 0.3, 2.0] }, [radiateur, condensor, intercooler, ventilator, expansie, slangen, inlaat, laadlucht]);
}

/* ============================ uitlaatsysteem ============================ */
function buildExhaust() {
  // ---- voorkatalysator, direct op de turbine (motorframe, daarom een groep met de motortransformatie)
  const T = ENG_PORTS.turbineOut, tx = T.p[0], ty = T.p[1], tz = T.p[2];
  const bolts = [[0.034, 0], [-0.017, 0.03], [-0.017, -0.03]];
  const flangeShape = cache('sysCatFlange', () => side(shapeOf(circlesHull([[0.034, 0, 0.012], [-0.017, 0.03, 0.012], [-0.017, -0.03, 0.012]], 0)), 0.008));
  const gasketShape = cache('sysCatGasket', () => side(shapeOf(circlesHull([[0.034, 0, 0.012], [-0.017, 0.03, 0.012], [-0.017, -0.03, 0.012]], 0)), 0.0016));
  const xE = tx - 0.0;                                         // vlak van de turbine-uitgang
  const canL = 0.12, canX0 = xE - 0.062;
  const voorkat = A('Voorkatalysator', { d: 'Driewegkatalysator direct op de turbine-uitgang (voorkat): zet CO, koolwaterstoffen en NOx om. De lambdasonde ervoor regelt het mengsel, de sonde erna controleert de katalysator. Opbouw schematisch.', p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [-0.1, 0.06, 0] }, [
    P('Pakking voorkat', gasketShape, MAT.heat, { d: 'Metalen pakking tussen de turbineflens en de voorkatalysator.', p: [xE - 0.0008, ty, tz], ex: [-0.02, 0, 0] }),
    P('Flens voorkat', flangeShape, MAT.steel, { d: 'Driegatsflens van de voorkatalysator, met drie moeren op de tapeinden van de turbine.', p: [xE - 0.0056, ty, tz], ex: [-0.045, 0, 0] }),
    ...bolts.map(([dz, dy], i) => P(`Moer voorkat ${i + 1}`, G.cyl('x', 0.0075, 0.0075, 0.008, 6), MAT.steel, { d: 'Zeskantmoer op een tapeind van de turbine; houdt de voorkatalysator vast.', p: [xE - 0.0135, ty + dy, tz + dz], ex: [-0.09, dy * 2, dz * 2] })),
    P('Inlaatconus voorkat', G.lathe('-x', [[0.026, 0], [0.034, 0.014], [0.0415, 0.034], [0.0405, 0.036]], 24, 'sysCatIn'), MAT.steel, { d: 'Conus die de turbine-uitgang verwijdt naar de katalysatorbehuizing.', p: [xE - 0.0096, ty, tz], ex: [-0.05, 0, 0] }),
    P('Katalysatorhuis', G.cyl('-x', 0.0415, 0.0415, canL, 24), MAT.steel, { d: 'Roestvrijstalen behuizing om de keramische monoliet.', p: [canX0 - canL / 2, ty, tz], ex: [-0.06, 0, 0] }),
    P('Monoliet voorkat', G.cyl('-x', 0.036, 0.036, canL - 0.01, 18), MAT.ceramic, { d: 'Keramische honingraat met edelmetaalcoating waar de uitlaatgassen overheen stromen.', p: [canX0 - canL / 2, ty, tz], ex: [-0.12, 0.05, 0], inner: true }),
    P('Steunmat voorkat', annulus(0.036, 0.0405, canL - 0.014, 'x', 24), MAT.filter, { d: 'Uitzettende mat die de monoliet beschermt tegen trillingen en hitte.', p: [canX0 - canL / 2, ty, tz], ex: [-0.12, -0.05, 0], inner: true }),
    P('Uitlaatconus voorkat', G.lathe('-x', [[0.0405, 0], [0.034, 0.02], [0.026, 0.04]], 24, 'sysCatOut'), MAT.steel, { d: 'Conus die de katalysatorbehuizing aansluit op de uitlaatpijp.', p: [canX0 - canL, ty, tz], ex: [-0.09, 0, 0] }),
    P('Hitteschild voorkat', G.half('x', 0.053, canL + 0.02, PI, 16), MAT.heat, { d: 'Aluminium hitteschild boven de voorkatalysator; beschermt de bedrading en de motorruimte.', p: [canX0 - canL / 2, ty + 0.002, tz], ex: [0, 0.1, 0] }),
    A('Lambdasonde voor', { d: 'Zuurstofsonde in de uitlaat vóór de katalysator: meet het zuurstofgehalte voor de mengselregeling.', p: [xE - 0.0495, ty, tz - 0.034], r: [-HALF, 0, 0], ex: [0, 0, -0.12] }, [
      P('Sondelichaam', merge([G.cyl('y', 0.0045, 0.0045, 0.04, 8), xf(G.cyl('y', 0.0085, 0.0085, 0.008, 6), [0, 0.02, 0]), xf(G.cyl('y', 0.006, 0.006, 0.018, 10), [0, 0.034, 0])]), MAT.steel, { d: 'Sondelichaam met zeskant en beschermkap.', ex: [0, 0.05, 0] }),
      P('Stekker lambdasonde voor', G.rbox(0.022, 0.016, 0.018, 0.004), MAT.plastic, { d: 'Stekker aan de bedrading van de sonde.', p: [-0.02, 0.07, 0.02], ex: [-0.04, 0.05, 0.04] }),
      P('Kabel lambdasonde voor', tube([[0, 0.04, 0], [-0.008, 0.06, 0.008], [-0.016, 0.068, 0.016]], 0.0018, 8, 5), MAT.sysHose, { d: 'Bedrading tussen sonde en stekker.', ex: [-0.03, 0.04, 0.03] }),
    ]),
  ]);
  // ---- downpipe, flens, flex, tussenpijp, middendemper, achterpijp, einddemper (autoframe)
  const dpP = [sysP([xE - 0.062 - canL - 0.04, ty, tz]), [-0.385, 0.465, 1.19], [-0.38, 0.40, 1.13], [-0.30, 0.29, 1.095], [-0.17, 0.265, 1.075], [-0.06, 0.266, 1.04], [0.02, 0.268, 0.95], [0.02, 0.27, 0.85]];
  const pipeR = 0.0255;
  const dpCurve = new THREE.CatmullRomCurve3(dpP.map(q => V3(...q)), false, 'centripetal');
  const lp = dpCurve.getPoint(0.1), lpY = lp.y + pipeR + 0.015;
  const lamB = A('Lambdasonde na', { d: 'Zuurstofsonde achter de katalysator: controleert of de katalysator goed werkt.', ex: [0.08, 0.1, 0] }, [
    P('Sondelichaam', merge([G.cyl('y', 0.0045, 0.0045, 0.04, 8), xf(G.cyl('y', 0.0085, 0.0085, 0.008, 6), [0, 0.02, 0]), xf(G.cyl('y', 0.006, 0.006, 0.018, 10), [0, 0.034, 0])]), MAT.steel, { d: 'Sondelichaam met zeskant en beschermkap.', p: [lp.x, lpY, lp.z], ex: [0, 0.05, 0] }),
    P('Stekker lambdasonde na', G.rbox(0.022, 0.016, 0.018, 0.004), MAT.plastic, { d: 'Stekker aan de bedrading van de sonde.', p: [lp.x - 0.02, lpY + 0.07, lp.z + 0.02], ex: [-0.04, 0.05, 0.04] }),
    P('Kabel lambdasonde na', tube([[lp.x, lpY + 0.04, lp.z], [lp.x - 0.008, lpY + 0.06, lp.z + 0.008], [lp.x - 0.016, lpY + 0.068, lp.z + 0.016]], 0.0018, 8, 5), MAT.sysHose, { d: 'Bedrading tussen sonde en stekker.', ex: [-0.03, 0.04, 0.03] }),
  ]);
  const downpipe = A('Downpipe', { d: 'Pijp van de voorkatalysator, achter het blok omlaag en onder het schutbord door naar de tunnel. De lambdasonde achter de katalysator zit in dit stuk.', ex: [0, -0.1, -0.12] }, [
    P('Downpijp', tube(dpP, pipeR, 56, 14), MAT.exhaust, { d: 'Stalen uitlaatbuis die achter het blok omlaag buigt (afmetingen schematisch).', ex: [0, 0, 0] }),
    lamB,
  ]);
  const FZ0 = 0.84;
  const flenzen = A('Flensverbinding', { d: 'Driegats flensverbinding tussen de downpipe en het flexstuk, met pakking en drie bouten.', ex: [0, 0, -0.08] }, [
    P('Flens voor', annulus(pipeR, 0.05, 0.008, 'z', 24), MAT.steel, { d: 'Flens aan het uiteinde van de downpipe.', p: [0.02, 0.27, FZ0 + 0.0075], ex: [0, 0, 0.05] }),
    P('Flenspakking', annulus(pipeR, 0.046, 0.002, 'z', 24), MAT.heat, { d: 'Metalen pakking tussen de flenzen.', p: [0.02, 0.27, FZ0], ex: [0, 0, 0] }),
    P('Flens achter', annulus(pipeR, 0.05, 0.008, 'z', 24), MAT.steel, { d: 'Flens aan het voorste uiteinde van het flexstuk.', p: [0.02, 0.27, FZ0 - 0.0075], ex: [0, 0, -0.05] }),
    ...[0, 1, 2].map(k => P(`Flensbout ${k + 1}`, hexBolt(0.032, 0.008, 'z'), MAT.steel, { d: 'Bout met moer door beide flenzen.', p: [0.02 + 0.04 * Math.cos(k * PI * 2 / 3 + HALF), 0.27 + 0.04 * Math.sin(k * PI * 2 / 3 + HALF), FZ0 - 0.0105], ex: [0.04 * Math.cos(k * PI * 2 / 3 + HALF), 0.04 * Math.sin(k * PI * 2 / 3 + HALF), -0.1] })),
  ]);
  const flex = A('Flexstuk', { d: 'Flexibele koppeling die de bewegingen van de dwarsgeplaatste motor opvangt (opbouw zoals gebruikelijk, schematisch weergegeven).', ex: [0, 0.05, -0.1] }, [
    P('Balg met vlechtwerk', merge([tube([[0.02, 0.27, 0.83], [0.02, 0.27, 0.68]], 0.0245, 4, 14), ...[0, 1, 2, 3, 4, 5, 6].map(k => xf(G.torus('z', 0.0255, 0.004, 22, 6), [0.02, 0.27, 0.82 - k * 0.02]))]), MAT.steel, { d: 'Gegolfde balg met een vlechtmantel eromheen.', ex: [0, 0, 0] }),
    sysClamp('Klem flexstuk voor', [0.02, 0.27, 0.80], V3(0, 0, 1), 0.0275, V3(0, 0, 1)),
    sysClamp('Klem flexstuk achter', [0.02, 0.27, 0.70], V3(0, 0, 1), 0.0275, V3(0, 0, -1)),
  ]);
  const tussen = P('Tussenpijp', tube([[0.02, 0.27, 0.68], [0.02, 0.27, 0.4], [0.02, 0.27, 0.09]], pipeR, 24, 14), MAT.exhaust, { d: 'Rechte pijp door de tunnel, van het flexstuk naar de middendemper.', ex: [0, 0.04, 0] });
  const MZ = -0.12;
  const midGeo = cache('sysMid', () => merge([xf(G.cyl('z', 0.065, 0.065, 0.3, 24), [0, 0, 0], null, [1, 0.8, 1]), xf(G.cyl('z', 0.026, 0.065, 0.06, 20), [0, 0, 0.18], null, [1, 0.8, 1]), xf(G.cyl('z', 0.065, 0.026, 0.06, 20), [0, 0, -0.18], null, [1, 0.8, 1])]));
  const midden = A('Middendemper', { d: 'Middendemper (resonator, ongeveer 425 mm lang): dempt vooral de hoge tonen. Opbouw schematisch.', ex: [0, -0.12, 0] }, [
    P('Demperhuis midden', midGeo, MAT.exhaust, { d: 'Ovale demperbus met inwendige schotten (niet weergegeven).', p: [0.02, 0.27, MZ] }),
    P('Hitteschild middendemper', G.half('z', 0.075, 0.34, HALF, 14), MAT.heat, { d: 'Aluminium hitteschild boven de middendemper, tegen de tunnel.', p: [0.02, 0.28, MZ], ex: [0, 0.12, 0] }),
    sysClamp('Klem midden voor', [0.02, 0.27, MZ + 0.215], V3(0, 0, 1), 0.0275, V3(0, 0, 1)),
    sysClamp('Klem midden achter', [0.02, 0.27, MZ - 0.215], V3(0, 0, 1), 0.0275, V3(0, 0, -1)),
  ]);
  const PY = 0.148;                                               // hartlijn achterpijp achter de tunnel: onderkant 0,1225 boven de grond, bovenkant 2,5 mm onder het hitteschild van de tank
  const achterpijp = P('Achterpijp', tube([[0.02, 0.27, -0.33], [0.02, 0.27, -0.46], [0.03, 0.235, -0.56], [0.04, 0.19, -0.65], [0.05, 0.157, -0.745], [0.05, PY, -0.84], [0.05, PY, -1.1], [0.05, PY, -1.3], [0.05, 0.15, -1.45], [0.05, 0.157, -1.58], [0.05, 0.175, -1.7], [0.05, 0.192, -1.78], [0.05, 0.1975, -1.82]], pipeR, 72, 14), MAT.exhaust, { d: 'Pijp van de middendemper, vanaf het eind van de tunnel strak onder de vloer en de brandstoftank (met het hitteschild ertussen) en onder de torsiebalk door, daarna oplopend naar de einddemper (verloop schematisch).', ex: [0, -0.04, -0.06] });
  const EZ = -1.93, EY = 0.1975;                                    // platte einddemper, zo hoog en zo ver naar voren als de bagagevloer toelaat (onder de reservewielkuip)
  const endGeo = cache('sysEndFlat', () => merge([xf(G.rbox(0.66, 0.075, 0.26, 0.03), [0, 0, 0]), xf(G.cyl('z', 0.026, 0.026, 0.05, 14), [0.05, 0, 0.14])]));
  const einddemper = A('Einddemper', { d: 'Dwarsgeplaatste einddemper achter de achteras, met aan beide kanten een uitlaatpijp naar een verchroomd eindstuk (twee chromen eindstukken: aannemelijk voor deze uitvoering).', ex: [0, -0.1, -0.18] }, [
    P('Demperhuis eind', endGeo, MAT.sysDemper, { d: 'Dwarsgeplaatste einddemper van geplooid plaatstaal.', p: [0, EY, EZ], ex: [0, 0, 0] }),
    // de buis loopt strak onder de bumperonderkant op (1 tot 3 cm vrij) en het eindstuk zit met de bovenrand tegen de
    // achterrand van de bumper in de zwarte uitsparing (onderkant bumper bij x 0,6: y 0,28 op z -2,19 en 0,30 op z -2,25)
    ...[1, -1].map(s => P(`Uitlaatpijp ${sideName(s)}`, tube([[s * 0.29, EY, EZ - 0.07], [s * 0.36, 0.212, -2.03], [s * 0.45, 0.228, -2.075], [s * 0.53, 0.24, -2.12], [s * 0.585, 0.252, -2.165], [s * 0.6, 0.262, -2.2]], 0.02, 20, 10), MAT.sysDemper, { d: 'Korte buis van het uiteinde van de einddemper, strak onder de bumper oplopend naar het chromen eindstuk.', ex: [s * 0.015, 0, -0.03] })),
    ...[1, -1].map(s => P(`Uitlaateindstuk ${sideName(s)}`, annulus(0.026, 0.031, 0.06, 'z', 22), MAT.chrome, { d: 'Klein verchroomd eindstuk (62 mm), weggestoken onder de achterrand van de bumper in de zwarte uitsparing.', p: [s * 0.6, 0.268, -2.218], ex: [s * 0.015, 0, -0.1] })),
  ]);
  const hang = (n, x, yp, z, yb) => {
    const yt = yp + pipeR, len = yb - yt - 0.010;                    // rubber tussen de tap van de pijpbeugel (tot yt + 6 mm) en het vloerplaatje (4 mm)
    return A(`Ophanging ${n}`, { d: 'Rubber ophanging die de uitlaat aan de carrosserie hangt en trillingen isoleert: beugel om de pijp, rubber blokje, plaatje tegen de vloer.', ex: [0, -0.1, 0] }, [
      P('Pijpbeugel', cache('sysHangBr', () => merge([G.torus('z', pipeR + 0.002, 0.002, 18, 5), xf(G.box(0.04, 0.004, 0.03), [0, pipeR + 0.004, 0])])), MAT.darkSteel, { d: 'Stalen beugel die om de uitlaatpijp is gelast, met een tap naar boven.', p: [x, yp, z], ex: [0, -0.06, 0] }),
      P('Ophangrubber', cache(`sysHangRub${n}`, () => merge([G.cyl('y', 0.008, 0.008, len, 10), xf(G.cyl('y', 0.012, 0.012, 0.004, 12), [0, -len / 2 + 0.002, 0]), xf(G.cyl('y', 0.012, 0.012, 0.004, 12), [0, len / 2 - 0.002, 0])])), MAT.rubber, { d: 'Rubber ophangblokje tussen de pijpbeugel en de carrosserie.', p: [x, yt + 0.006 + len / 2, z], ex: [0, 0.08, 0] }),
      P('Vloerplaatje', G.box(0.04, 0.004, 0.03), MAT.darkSteel, { d: 'Stalen plaatje tegen de vloer waar het rubber aan hangt.', p: [x, yb - 0.002, z], ex: [0, 0.1, 0] }),
    ]);
  };
  const hangers = A('Ophangingen', { d: 'Rubber ophangingen die het uitlaatsysteem aan de vloer hangen.', ex: [0, 0.12, 0] }, [hang(1, 0.02, 0.27, 0.55, 0.385), hang(2, 0.02, 0.27, -0.46, 0.385), hang(3, 0.05, 0.149, -1.4, 0.198), hang(4, 0.05, 0.171, -1.68, 0.229)]);
  const hitte = A('Hitteschilden', { d: 'Aluminium hitteschilden die de vloer en de brandstoftank tegen de uitlaat beschermen.', ex: [0, 0.2, 0] }, [
    P('Hitteschild tunnel', plan(shapeOf([[-0.07, 0.8], [0.11, 0.8], [0.11, 0.2], [0.09, -0.5], [-0.05, -0.5], [-0.07, 0.2]]), 0.003), MAT.heat, { d: 'Plaat boven de pijp in de middentunnel; houdt de hitte van de vloer.', p: [0, 0.313, 0], ex: [0, 0.1, 0] }),
    P('Hitteschild tank', plan(shapeOf([[-0.12, -0.73], [0.2, -0.73], [0.2, -1.07], [-0.12, -1.07]]), 0.003), MAT.heat, { d: 'Plaat tussen de uitlaatpijp en de brandstoftank, strak onder de tank en tussen de twee spanbanden.', p: [0.05, 0.1775, 0], ex: [0, -0.1, 0] }),
  ]);
  return A('Uitlaatsysteem', { d: 'De uitlaat van de turbo tot de bumper: voorkatalysator direct op de turbine, downpipe, flexstuk, middendemper, einddemper en twee eindstukken (aannemelijk), met hitteschilden en rubber ophangingen. Lambdasondes zitten voor en na de katalysator.', ex: [0, -0.8, -0.3] }, [voorkat, downpipe, flenzen, flex, tussen, midden, achterpijp, einddemper, hangers, hitte]);
}

/* ============================ brandstofsysteem ============================ */
function buildFuel() {
  const TX = 0.0, TY = 0.268, TZ = -0.84;            // hart van de tank: z -0,975 tot -0,705, tussen de opkant in de bodemplaat (torsiebalk) en de middentunnel
  const fx = surfX(-1.72, 0.86);
  const tankGeo = cache('sysTank2', () => merge([G.rbox(0.86, 0.17, 0.27, 0.05), xf(G.box(0.66, 0.012, 0.18), [0, 0.088, 0])]));
  const tank = A('Brandstoftank', { d: 'Kunststof tank van 66 liter onder de achterbank, vóór de achteras, met twee stalen spanbanden, rubber strips en een hitteschild. De vorm en de maten van het model zijn schematisch en kleiner dan de echte tank.', spec: [['Inhoud', '66 l']], ex: [0, -0.2, 0] }, [
    P('Tank', tankGeo, MAT.plastic, { d: 'Zadelvormige kunststof tank van 66 liter (vorm schematisch).', p: [TX, TY, TZ] }),
    ...[0.1, -0.1].map((dz, i) => P(`Spanband ${i ? 'achter' : 'voor'}`, merge([xf(G.box(0.18, 0.006, 0.04), [0.35, 0, 0]), xf(G.box(0.36, 0.006, 0.04), [-0.26, 0, 0]), xf(G.box(0.006, 0.16, 0.04), [0.438, 0.08, 0]), xf(G.box(0.006, 0.16, 0.04), [-0.438, 0.08, 0])]), MAT.darkSteel, { d: 'Stalen spanband onder de tank, aan beide kanten aan de vloer geschroefd. In twee stukken: in het midden is hij onderbroken voor de uitlaatpijp en het hitteschild.', p: [TX, TY - 0.088, TZ + dz], ex: [0, -0.14, dz * 0.8] })),
    ...[[0.438, 0.1], [-0.438, 0.1], [0.438, -0.1], [-0.438, -0.1]].map(([dx, dz], i) => P(`Spanbandbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout die de spanband aan de vloer bevestigt.', p: [TX + dx, TY + 0.077, TZ + dz], ex: [dx * 0.2, 0.14, dz * 0.4] })),
    P('Tankstrips', merge([xf(G.box(0.76, 0.006, 0.03), [0, 0, 0.115]), xf(G.box(0.76, 0.006, 0.03), [0, 0, -0.115])]), MAT.rubber, { d: 'Rubber strips tussen tank en vloer tegen trillingen en piepen.', p: [TX, TY + 0.092, TZ], ex: [0, 0.1, 0] }),
  ]);
  // pompmodule in de tank
  const MP = [-0.25, TY + 0.088, TZ];
  const pompmodule = A('Pompmodule', { d: 'Brandstofpompmodule in de tank: flens met vergrendelring, elektrische pomp met zeef, niveausensor met vlotter en drukregelaar. Er is geen retourleiding: de regelaar zit in de module.', ex: [0, 0.3, 0] }, [
    P('Modulevlens', merge([G.cyl('y', 0.085, 0.085, 0.01, 28), xf(G.cyl('y', 0.02, 0.02, 0.014, 12), [0.04, 0.012, 0.03])]), MAT.plasticGrey, { d: 'Kunststof flens die de module op de tank afsluit; bevat de leiding- en stekkeraansluiting.', p: [MP[0], MP[1] + 0.005, MP[2]], ex: [0, 0.12, 0] }),
    P('Vergrendelring', annulus(0.07, 0.098, 0.01, 'y', 28), MAT.darkSteel, { d: 'Draairing die de flens op de tank vastzet.', p: [MP[0], MP[1] + 0.014, MP[2]], ex: [0, 0.2, 0] }),
    P('Moduleafdichting', G.torus('y', 0.075, 0.004, 28, 6), MAT.rubber, { d: 'Rubber ring tussen flens en tank.', p: [MP[0], MP[1] - 0.001, MP[2]], ex: [0, 0.06, 0] }),
    P('Modulestekker', G.rbox(0.035, 0.022, 0.03, 0.005), MAT.plastic, { d: 'Elektrische aansluiting van de pomp en de niveausensor.', p: [MP[0] - 0.05, MP[1] + 0.02, MP[2] + 0.03], ex: [-0.1, 0.1, 0] }),
    P('Leidingaansluiting module', G.cyl('y', 0.008, 0.008, 0.03, 10), MAT.steel, { d: 'Uitgang van de module voor de toevoerleiding naar de motor.', p: [MP[0] + 0.04, MP[1] + 0.026, MP[2] + 0.03], ex: [0.1, 0.14, 0] }),
    P('Pompbeker', G.lathe('y', [[0.0, 0], [0.055, 0], [0.058, 0.005], [0.058, 0.1], [0.054, 0.1], [0.054, 0.006], [0, 0.006]], 20, 'sysCup'), MAT.plasticGrey, { d: 'Opvangbeker rond de pomp, houdt brandstof bij de pomp in bochten.', p: [MP[0], MP[1] - 0.125, MP[2]], ex: [0, -0.12, 0], inner: true }),
    P('Brandstofpomp', merge([G.cyl('y', 0.028, 0.028, 0.09, 18), xf(G.cyl('y', 0.012, 0.012, 0.02, 10), [0, 0.055, 0])]), MAT.steel, { d: 'Elektrische brandstofpomp in de beker.', p: [MP[0], MP[1] - 0.065, MP[2]], ex: [0, -0.06, 0], inner: true }),
    P('Pompzeef', G.rbox(0.07, 0.02, 0.07, 0.006), MAT.filter, { d: 'Fijnmazige zeef op de aanzuiging van de pomp.', p: [MP[0], MP[1] - 0.12, MP[2]], ex: [0, -0.12, 0], inner: true }),
    P('Drukregelaar', merge([G.cyl('y', 0.014, 0.014, 0.05, 12), xf(G.cyl('y', 0.018, 0.018, 0.01, 12), [0, 0.03, 0])]), MAT.darkSteel, { d: 'Houdt de brandstofdruk op de rail constant; overtollige brandstof stroomt terug in de beker.', p: [MP[0] + 0.035, MP[1] - 0.06, MP[2] - 0.03], ex: [0.1, 0, 0], inner: true }),
    P('Niveausensor', merge([G.box(0.03, 0.05, 0.01), tube([[0.015, -0.02, 0], [0.07, -0.05, 0.0], [0.11, -0.07, 0.0]], 0.0018, 8, 5)]), MAT.copper, { d: 'Potentiometer met arm waarmee de brandstofmeter wordt aangestuurd.', p: [MP[0] - 0.045, MP[1] - 0.06, MP[2] - 0.03], ex: [-0.1, 0, 0], inner: true }),
    P('Vlotter', G.sphere(0.02, 10), MAT.red, { d: 'Drijver aan de arm van de niveausensor.', p: [MP[0] + 0.065, MP[1] - 0.13, MP[2] - 0.03], ex: [0.1, -0.1, 0], inner: true }),
    P('Steunstangen module', merge([xf(G.cyl('y', 0.004, 0.004, 0.1, 6), [0.05, 0, 0.04]), xf(G.cyl('y', 0.004, 0.004, 0.1, 6), [-0.05, 0, -0.04])]), MAT.steel, { d: 'Twee stangen met veer die de beker tegen de tankbodem drukken.', p: [MP[0], MP[1] - 0.05, MP[2]], ex: [0, -0.05, 0.1], inner: true }),
  ]);
  // vulsysteem: rechts achter (aan de passagierskant); de klep zit in het rechter achterscherm, met een tankkom erachter. De opening in het
  // scherm (bodTkZ, bodTkY) staat in bodyparts.js. Capless (HB2 1.73): geen dop, maar een klep in de vulhals die het pistool opent.
  const flapY = (bodTkY[0] + bodTkY[1]) / 2, flapZ = (bodTkZ[0] + bodTkZ[1]) / 2;
  const tkFloor = fx - 0.05, tkMouth = fx - 0.022, tkNeck = fx - 0.056;       // x (positief, rechterkant) van de bodem, de monding en de achterkant van de hals
  const tkSkin = (z, y, out) => { const p = bodAt(z, y, out); return [-p[0], p[1], p[2]]; };
  // klep: schaal die de huid volgt (2 mm over de rand van de opening), met een binnenvlak en vier randen
  const flapZ0 = bodTkZ[0] - 0.002, flapZ1 = bodTkZ[1] + 0.002, flapY0 = bodTkY[0] - 0.002, flapY1 = bodTkY[1] + 0.002, fo = 0.0015, fi = -0.004;
  const flapCrown = (z, t) => 0.005 * Math.sin(PI * (z - flapZ0) / (flapZ1 - flapZ0)) * Math.sin(PI * t);   // licht bol, zoals het scherm
  const flapOut = cache('sysFlapRo', () => merge([
    patch((z, t) => tkSkin(z, lerp(flapY0, flapY1, t), fo + flapCrown(z, t)), flapZ0, flapZ1, 14, () => [0, 1], 12),
    ...[flapZ0, flapZ1].map(zz => patch((y, t) => tkSkin(zz, y, lerp(fo, fi, t)), flapY0, flapY1, 8, () => [0, 1], 1)),
    ...[flapY0, flapY1].map(yy => patch((z, t) => tkSkin(z, yy, lerp(fo, fi, t)), flapZ0, flapZ1, 10, () => [0, 1], 1)),
  ]));
  const flapIn = cache('sysFlapRi', () => patch((z, t) => tkSkin(z, lerp(flapY0, flapY1, t), fi + flapCrown(z, t)), flapZ0, flapZ1, 14, () => [0, 1], 12));
  // tankkom: vier wanden van de rand van de opening naar de bodem en een bodem met de hals
  const tkBowl = cache('sysTankkom', () => merge([
    ...[bodTkZ[0], bodTkZ[1]].map(zz => patch((y, t) => [-lerp(-tkSkin(zz, y, -0.004)[0], tkFloor, t), y, zz], bodTkY[0], bodTkY[1], 8, () => [0, 1], 4)),
    ...bodTkY.map(yy => patch((z, t) => [-lerp(-tkSkin(z, yy, -0.004)[0], tkFloor, t), yy, z], bodTkZ[0], bodTkZ[1], 8, () => [0, 1], 4)),
    patch((z, t) => [-tkFloor, lerp(bodTkY[0], bodTkY[1], t), z], bodTkZ[0], bodTkZ[1], 6, () => [0, 1], 6),
  ]));
  const vul = A('Vulsysteem', { d: 'Vulpijp met capless vulhals en tankklep in het rechter achterscherm. De vulpijp loopt boven het achterwiel langs naar de tank. Een dop is er niet: in de vulhals zit een klep die het pistool opent.', ex: [-0.2, 0.1, -0.1] }, [
    P('Vulpijp', tube([[-0.426, 0.30, -0.84], [-0.458, 0.304, -0.86], [-0.467, 0.32, -0.93], [-0.467, 0.34, -1.0], [-0.467, 0.3475, -1.07], [-0.467, 0.3475, -1.14], [-0.467, 0.3475, -1.2], [-0.455, 0.37, -1.26], [-0.447, 0.40, -1.32], [-0.40, 0.45, -1.43], [-0.40, 0.60, -1.52], [-0.44, 0.74, -1.58], [-0.62, 0.80, -1.62], [-0.76, 0.84, -1.66], [-tkNeck, flapY, flapZ]], 0.0185, 64, 10), MAT.plastic, { d: 'Kunststof vulpijp van de vulhals naar de tank.', ex: [-0.04, 0, 0] }),
    P('Vulhals', merge([annulus(0.0245, 0.029, tkMouth - tkNeck, 'x', 24), xf(G.torus('x', 0.0268, 0.0036, 24, 6), [-(tkMouth - tkNeck) / 2, 0, 0])]), MAT.plastic, { d: 'Capless vulhals achter de tankklep: een korte holle hals met een rand waarin het pistool past; de zwarte vulklep zit er een centimeter in.', p: [-(tkNeck + tkMouth) / 2, flapY, flapZ], ex: [-0.1, 0, 0] }),
    P('Vulklep', merge([G.cyl('x', 0.0235, 0.0235, 0.003, 20), xf(G.cyl('z', 0.0025, 0.0025, 0.03, 8), [0.002, 0.022, 0])]), MAT.blackGloss, { d: 'Capless vulklep (klep B in de vulpijp, HB2 1.73): geen dop en geen bandje. Een veer houdt de klep dicht; het pistool duwt hem open. Niet met de vingers indrukken. Op de benzineversie laat een restrictor alleen een loodvrij pistool toe (vorm schematisch).', p: [-(tkMouth - 0.012), flapY, flapZ], ex: [-0.2, 0.05, 0] }),
    P('Vulklepring', G.torus('x', 0.0238, 0.0032, 24, 6), MAT.steel, { d: 'Metalen ring om de zwarte vulklep: zo is de capless vulhals van buiten af te lezen (vorm schematisch).', p: [-(tkMouth - 0.0105), flapY, flapZ], ex: [-0.22, 0.05, 0] }),
    P('Tankkom', tkBowl, MAT.sysTkNis, { d: 'Kom in het rechter achterscherm achter de tankklep, met de hals van de vulpijp op de bodem (vorm schematisch).', ex: [-0.12, 0.02, 0] }),
    A('Tankklep', { d: 'Tankklep in het rechter achterscherm, in lak uitgevoerd. Opent na ontgrendelen door op de achterrand te drukken en draait dan ongeveer 140 graden om de scharnierrand aan de voorkant (hoek geschat).', ex: [-0.34, 0.05, 0],
      open: { type: 'hinge', pivot: tkSkin(bodTkZ[1] + 0.004, flapY, 0.004), axis: [0, 1, 0], angle: 140 * PI / 180, min: 112 * PI / 180, label: 'Tankklep', look: { dir: [-1, 0.3, -0.45], nodes: ['Tankklep', 'Tankkom'] } } }, [
      P('Tankklep buitenkant', flapOut, MAT.paint, { d: 'Buitenkant van de tankklep in carrosseriekleur, licht bol zoals het scherm, met de randen.', ex: [-0.04, 0.01, 0] }),
      P('Tankklep binnenzijde', flapIn, MAT.plasticGrey, { d: 'Grijze kunststof binnenzijde van de tankklep, zichtbaar als de klep openstaat.', ex: [0.04, 0, 0] }),
    ]),
    sysClamp('Klem vulpijp', [-0.44, 0.302, -0.845], V3(1, 0, 0), 0.0185, V3(0.5, 0, 0)),
  ]);
  // leidingen
  const rail = ENG_PORTS.fuelRailIn;
  const toevoer = A('Brandstofleiding', { d: 'Stalen toevoerleiding van de pompmodule onder de vloer langs naar de brandstofrail. Door het ontbreken van een retourleiding is dit de enige brandstofleiding naar de motor.', ex: [0, -0.12, 0] }, [
    P('Toevoerleiding', tube([[MP[0] + 0.04, MP[1] + 0.045, MP[2] + 0.03], [-0.2, 0.355, -0.8], [-0.4, 0.3, -0.7], [-0.42, 0.13, -0.6], [-0.42, 0.13, 0.4], [-0.38, 0.14, 0.9], [-0.1, 0.33, 1.0], [0.1, 0.5, 1.06], [0.21, 0.62, 1.2], [0.22, 0.66, 1.45], [0.2, 0.66, 1.6], sysE(rail, 0.045), sysP(rail.p)], 0.004, 140, 6), MAT.steel, { d: 'Stalen brandstofleiding met kunststof mantel, aan de vloer vastgeklikt.', ex: [0, 0.1, 0] }),
    ...[[-0.42, 0.13, -0.3], [-0.42, 0.13, 0.2], [-0.4, 0.135, 0.65]].map((p, i) => P(`Leidingclip ${i + 1}`, G.box(0.016, 0.012, 0.02), MAT.plastic, { d: 'Kunststof clip die de brandstofleiding aan de vloer klikt.', p, ex: [0, 0.06, 0] })),
  ]);
  const evap = A('Dampsysteem', { d: 'Opvang van benzinedampen (EVAP): het koolstoffilter vangt dampen uit de tank op en laat ze via het spoelventiel door de motor verbranden. De leiding naar het inlaatspruitstuk is niet weergegeven.', ex: [-0.1, -0.1, -0.1] }, [
    P('Koolstoffilter', merge([G.rbox(0.06, 0.17, 0.10, 0.015), xf(G.cyl('z', 0.008, 0.008, 0.05, 8), [0, 0.06, 0.06])]), MAT.plastic, { d: 'Houder met actieve kool die benzinedampen uit de tank vasthoudt. Staat links naast de tank tegen de wand van de wielkast, boven de vloerplaat (plaats en maten schematisch).', p: [0.468, 0.271, -0.84], ex: [-0.08, -0.1, 0] }),
    P('Spoelventiel', merge([G.cyl('y', 0.014, 0.014, 0.05, 12), xf(G.rbox(0.02, 0.014, 0.02, 0.004), [0, 0.03, 0.016])]), MAT.darkSteel, { d: 'Magneetventiel dat de dampen gestuurd naar het inlaatspruitstuk laat stromen.', p: [0.468, 0.30, -0.735], ex: [0.06, 0.1, 0] }),
    P('Rolloverventiel', G.cyl('y', 0.014, 0.014, 0.03, 10), MAT.plastic, { d: 'Ventiel op de tank dat bij kantelen de dampleiding afsluit.', p: [0.41, 0.352, TZ - 0.05], ex: [0, 0.14, 0] }),
    P('Dampleiding', tube([[0.41, 0.358, -0.89], [0.425, 0.345, -0.865], [0.436, 0.328, -0.85]], 0.007, 20, 6), MAT.sysHose, { d: 'Dunne kunststof slang van het rolloverventiel op de tank naar het koolstoffilter.', ex: [0, 0.1, 0] }),
    P('Spoelleiding', tube([[0.468, 0.23, -0.79], [0.468, 0.23, -0.765], [0.468, 0.26, -0.745]], 0.006, 12, 6), MAT.sysHose, { d: 'Korte slang van het koolstoffilter naar het spoelventiel.', ex: [0, 0.08, 0] }),
  ]);
  return A('Brandstofsysteem', { d: 'Brandstoftank van 66 liter onder de achterbank met pompmodule, vulsysteem aan de rechterzijde, toevoerleiding naar de motor en het dampsysteem.', spec: [['Tankinhoud', '66 l'], ['Brandstof', 'loodvrije benzine (Euro 95)'], ['Tankklep', 'rechterachterscherm']], ex: [-0.5, -0.5, -1.0] }, [tank, pompmodule, vul, toevoer, evap]);
}

/* ============================ elektrisch systeem ============================ */
function buildElectrical() {
  const starter = ENG2CAR(DRV_PORTS.starterTerminal);
  // kabel naar de B+-bout: komt van voren op de hoogte van de bout aan (de motorbout zit 1,1 cm lager), laatste stuk langs de boutas
  const stAt = (dx, dy, dz) => ENG2CAR(DRV_PORTS.starterTerminal.map((v, i) => v + [dx, dy, dz][i]));
  const BX = -0.632, BY = 0.489, BZ = 1.925;             // hart van de accu (rechtsvoor, achter het scherm); z-ruimte: stuurslangen achter, frontmodule voor
  const PZ = BZ - 0.08;                                  // z van de polen
  const W = 0.16, L = 0.20, Hh = 0.15;
  const cellGeo = cache('sysCell', () => G.box(W - 0.02, Hh - 0.04, (L - 0.02) / 6 - 0.004));
  const accu = A('Accu', { d: '12-voltaccu in de motorruimte, in een accubak met afdekkap, poolklemmen, hoofdhouder en een ontgassingsslang. Naast de accubak zit de zekerings- en relaisdoos van de motorruimte.', spec: [['Spanning', '12 V'], ['Plaats', 'motorruimte rechtsvoor (geschat; bronnen verschillen)']], ex: [-0.15, 0.3, 0.1] }, [
    P('Accubak', G.rbox(W, Hh, L, 0.012), MAT.sysBattery, { d: 'Kunststof accubak met de zes cellen.', p: [BX, BY, BZ] }),
    P('Accudeksel', G.rbox(W + 0.002, 0.018, L + 0.002, 0.006), MAT.plasticGrey, { d: 'Deksel met ontgassingskanaal.', p: [BX, BY + Hh / 2 + 0.009, BZ], ex: [0, 0.2, 0] }),
    A('Cellen', { d: 'De zes in serie geschakelde cellen van de accu (2 volt per cel), in de accubak onder het deksel.', ex: [0, 0.1, 0], inner: true }, [0, 1, 2, 3, 4, 5].map(k => P(`Cel ${k + 1}`, cellGeo, MAT.sysBattery, { d: 'Loodzuurcel van 2 volt, in serie geschakeld met de andere cellen.', p: [BX, BY - 0.004, BZ + (k - 2.5) * ((L - 0.02) / 6)], ex: [0, k * 0.02, (k - 2.5) * 0.03], inner: true }))),
    P('Pluspool', G.cyl('y', 0.009, 0.009, 0.026, 12), MAT.steel, { d: 'Pluspool van de accu.', p: [BX + 0.05, BY + Hh / 2 + 0.03, PZ], ex: [0, 0.27, 0] }),
    P('Minpool', G.cyl('y', 0.008, 0.008, 0.026, 12), MAT.steel, { d: 'Minpool van de accu.', p: [BX - 0.05, BY + Hh / 2 + 0.03, PZ], ex: [0, 0.27, 0] }),
    P('Poolklem plus', merge([G.cyl('y', 0.014, 0.014, 0.02, 12), xf(G.box(0.014, 0.02, 0.03), [0.016, 0, 0])]), MAT.steel, { d: 'Poolklem op de pluspool, aangesloten op de accuafkoppelunit.', p: [BX + 0.05, BY + Hh / 2 + 0.045, PZ], ex: [0.04, 0.33, 0] }),
    P('Poolklem min', merge([G.cyl('y', 0.013, 0.013, 0.02, 12), xf(G.box(0.014, 0.02, 0.03), [-0.016, 0, 0])]), MAT.steel, { d: 'Poolklem op de minpool, met de massakabel naar de carrosserie.', p: [BX - 0.05, BY + Hh / 2 + 0.045, PZ], ex: [-0.04, 0.33, 0] }),
    P('Afdekkap plus', G.cyl('y', 0.02, 0.02, 0.026, 14), MAT.red, { d: 'Rode afdekkap over de pluspool tegen kortsluiting.', p: [BX + 0.05, BY + Hh / 2 + 0.065, PZ], ex: [0, 0.42, 0] }),
    P('Accuafkoppelunit', merge([G.rbox(0.05, 0.03, 0.04, 0.006), xf(G.cyl('x', 0.006, 0.006, 0.03, 8), [0.04, 0, 0])]), MAT.plasticGrey, { d: 'Afkoppelunit met pyrotechnische klem die de voeding bij een aanrijding onderbreekt.', p: [BX + 0.05 + 0.04, BY + Hh / 2 + 0.03, PZ], ex: [0.14, 0.3, 0] }),
    P('Accuhouder', merge([G.box(W + 0.05, 0.01, 0.025), xf(G.cyl('y', 0.004, 0.004, 0.19, 6), [W / 2 + 0.018, -0.085, 0]), xf(G.cyl('y', 0.004, 0.004, 0.19, 6), [-W / 2 - 0.018, -0.085, 0])]), MAT.darkSteel, { d: 'Beugel die de accu op de bak houdt, met twee trekstangen.', p: [BX, BY + Hh / 2 + 0.024, PZ + 0.02], ex: [0, 0.52, 0] }),   // trekstangen (0,2 m lang) eindigen uitgeklapt boven het opgetilde deksel
    P('Accubak onderplaat', G.box(W + 0.07, 0.014, L), MAT.darkSteel, { d: 'Draagplaat van de accu op de langsligger.', p: [BX, BY - Hh / 2 - 0.007, BZ], ex: [0, -0.12, 0] }),
    P('Ontgassingsslang', tube([[BX - 0.03, BY + Hh / 2 - 0.01, PZ + 0.01], [BX - 0.03, BY + 0.0, BZ - 0.115], [BX - 0.03, BY - 0.1, BZ - 0.115]], 0.006, 12, 6), MAT.sysHose, { d: 'Slangetje dat accugassen naar buiten voert.', ex: [-0.04, -0.1, 0] }),
  ]);
  const uHeight = 0.462, UZ = BZ + 0.02;               // zekeringkast: tussen de zuigslang (achter) en de frontmodule (voor)
  const upc = A('Zekeringkast motorruimte', { d: 'Zekerings- en relaisdoos van de motorruimte (UPC) op een bakje naast de accubak (in het werkplaatsboek op een bakje bovenop de accubak), met de hoofdzekeringen voor de motorruimte.', ex: [0.14, 0.2, 0] }, [
    P('Doosbasis', G.rbox(0.08, 0.04, 0.13, 0.008), MAT.plastic, { d: 'Onderbak met de zekeringen en relais.', p: [-0.47, uHeight, UZ], ex: [0, 0.02, 0] }),
    P('Doosdeksel', merge([G.rbox(0.082, 0.012, 0.132, 0.005), xf(G.box(0.04, 0.012, 0.03), [0.0, 0.012, 0])]), MAT.plasticGrey, { d: 'Afsluitdeksel met clips.', p: [-0.47, uHeight + 0.026, UZ], ex: [0, 0.14, 0] }),
    P('Maxizekeringblok', merge([G.box(0.06, 0.016, 0.03), ...[-0.02, 0, 0.02].map(x => xf(G.box(0.012, 0.014, 0.012), [x, 0.012, 0]))]), MAT.red, { d: 'Blok met de hoofdzekeringen.', p: [-0.47, uHeight + 0.04, UZ + 0.05], ex: [0, 0.2, 0.08] }),
    P('Doosstekker', G.rbox(0.03, 0.03, 0.04, 0.006), MAT.plastic, { d: 'Stekker voor de kabelboom van de motorruimte.', p: [-0.47, uHeight + 0.045, UZ - 0.03], ex: [0.05, 0.12, -0.05] }),
  ]);
  const ecu = A('Motorcomputer', { d: 'Motormanagementcomputer (ECU) van de F4Rt op een beugel aan het schutbord: regelt inspuiting, ontsteking, turbodruk en nokkenasverstelling. De exacte plaats is voor dit model niet gevonden (opbouw schematisch).', ex: [0, 0.2, -0.12] }, [
    P('ECU behuizing', G.rbox(0.16, 0.04, 0.13, 0.007), MAT.ecu, { d: 'Aluminium behuizing met de printplaat van de motorcomputer.', p: [-0.27, 0.615, 1.1] }),
    P('ECU beugel', merge([G.box(0.17, 0.012, 0.14), xf(G.box(0.17, 0.05, 0.01), [0, 0.025, -0.07])]), MAT.darkSteel, { d: 'Beugel die de motorcomputer aan het schutbord bevestigt.', p: [-0.27, 0.589, 1.1], ex: [0, -0.1, 0] }),
    P('ECU stekker', G.rbox(0.06, 0.03, 0.03, 0.006), MAT.plastic, { d: 'Grote stekker voor de motorbedrading.', p: [-0.27, 0.62, 1.175], ex: [0, 0.06, 0.12] }),
  ]);
  // UCH: achter het onderpaneel van het interieur (dat de klep levert), in het frame van dat paneel:
  // lokale z wijst van de bestuurder af, het paneel zit op x = 0,37 in het vlak van het dashboard
  const uf = typeof intFace === 'function' ? intFace(0.66, 0.008) : { z: 0.52, y: 0.656, rx: -0.528 };
  const uc = Math.cos(uf.rx), us = Math.sin(uf.rx);
  const uchAt = (lx, ly, lz) => [0.37 + lx, uf.y + ly * uc - lz * us, uf.z + ly * us + lz * uc];
  const uch = A('Centrale cabine-unit', { d: 'Centrale cabine-unit (UCH) met de zekeringen voor het interieur, achter het onderpaneel links van de stuurkolom (de klep van dat paneel hoort bij het interieur). Ontvangt onder meer de signalen van de bandenspanningssensoren. Opbouw schematisch.', p: uchAt(0, 0, 0), r: [uf.rx, 0, 0], ex: [0.2, -0.1, 0.3] }, [
    P('UCH behuizing', G.rbox(0.15, 0.07, 0.04, 0.008), MAT.ecu, { d: 'Behuizing met de printplaat van de cabine-unit.', p: [-0.05, 0, 0.05] }),
    P('UCH stekker', G.rbox(0.05, 0.03, 0.03, 0.006), MAT.plastic, { d: 'Stekker voor de kabelboom van de cabine.', p: [-0.05, -0.045, 0.083], ex: [0, -0.06, 0.08] }),
    P('UCH zekeringkast', merge([G.box(0.1, 0.045, 0.026), ...[-0.03, 0, 0.03].map(x => xf(G.box(0.02, 0.03, 0.01), [x, 0, 0.016]))]), MAT.plastic, { d: 'Zekeringkast van het interieur naast de cabine-unit, achter het paneel.', p: [0.085, 0, 0.045], ex: [0.08, 0, 0.06] }),
  ]);
  const horns = [1, -1].map(s => A(`Claxon ${sideName(s)}`, { d: 'Elektrische claxon achter de voorbumper (aantal en plaats geschat).', ex: [s * 0.12, -0.08, 0.1] }, [
    P('Claxonhuis', merge([G.cyl('z', 0.04, 0.04, 0.02, 20), xf(G.lathe('z', [[0.012, 0], [0.026, 0.02], [0.034, 0.05]], 16, 'sysHorn'), [0, 0, 0.012])]), MAT.darkSteel, { d: 'Membraanhoorn met trechter.', p: [s * 0.62, 0.53, 2.1], ex: [0, 0, 0.1] }),
    P('Claxonbeugel', merge([G.box(0.03, 0.05, 0.008), xf(G.box(0.03, 0.008, 0.05), [0, 0.025, 0.03])]), MAT.darkSteel, { d: 'Beugel waarmee de claxon aan de bumperbalk hangt.', p: [s * 0.62, 0.53 - 0.01, 2.06], ex: [0, 0.08, -0.08] }),
  ]));
  const plusCable = A('Accukabel plus', { d: 'Dikke voedingskabel van de accu naar de startmotor, onder de koelslangen langs de voorkant van de motor.', ex: [0, -0.1, 0.1] }, [
    P('Kabel', tube([[BX + 0.05, BY + Hh / 2 + 0.07, PZ], [BX + 0.09, BY + Hh / 2 + 0.07, PZ], [-0.47, 0.594, PZ], [-0.52, 0.58, 1.89], [-0.53, 0.45, 1.9], [-0.50, 0.425, 1.92], [-0.42, 0.34, 1.88], [-0.28, 0.27, 1.85], [0.0, 0.26, 1.84], [0.18, 0.3, 1.78], stAt(-0.04, -0.12, 0.1), stAt(0.05, -0.02, 0.07), stAt(0.03, 0, 0.025), starter], 0.009, 56, 8), MAT.red, { d: 'Dikke kabel met rode isolatie.', ex: [0, -0.05, 0] }),
    P('Kabelschoen accu', G.cyl('y', 0.014, 0.014, 0.008, 10), MAT.copper, { d: 'Kabelschoen op de poolklem.', p: [BX + 0.05, BY + Hh / 2 + 0.065, PZ], ex: [0, 0.48, 0] }),
    P('Kabelschoen startmotor', G.cyl('x', 0.0095, 0.0095, 0.008, 10), MAT.copper, { d: 'Kabelschoen op de pluspool van de startmotor.', p: starter, ex: [0.06, 0, 0] }),
    ...[[-0.5, 0.43, 1.95], [-0.28, 0.27, 1.85], [0.0, 0.26, 1.84]].map((p, i) => P(`Kabelclip ${i + 1}`, G.box(0.014, 0.012, 0.02), MAT.plastic, { d: 'Kunststof clip die de kabel op zijn plaats houdt.', p, ex: [0, -0.06, 0] })),
  ]);
  const massa = A('Massakabels', { d: 'Massaverbindingen: van de minpool naar de carrosserie en een massaband naar de motor.', ex: [0, 0.1, 0.1] }, [
    P('Massakabel accu', tube([[BX - 0.05, BY + Hh / 2 + 0.065, PZ], [BX - 0.063, BY + Hh / 2 + 0.02, BZ - 0.12], [BX - 0.063, BY - 0.04, 1.795]], 0.008, 14, 8), MAT.sysHose, { d: 'Kabel van de minpool naar de carrosserie.', ex: [-0.06, 0, 0] }),
    P('Massaoog carrosserie', merge([G.cyl('z', 0.012, 0.012, 0.004, 10), xf(hexBolt(0.016, 0.006, 'z'), [0, 0, 0.002])]), MAT.steel, { d: 'Massaoog met bout op de voorkant van de wielkast.', p: [BX - 0.063, BY - 0.04, 1.783], ex: [0, 0, -0.1] }),
  ]);
  // kabelbomen (schematisch)
  const harness = A('Kabelbomen', { d: 'De hoofdkabelbomen van de auto in vereenvoudigde vorm: voorzijde (koplampen en claxons), motorruimte met motorcomputer en cabine met de lijn naar de achterlichten.', ex: [0, 0.14, 0] }, [
    P('Kabelboom voorzijde', merge([tube([[-0.47, 0.51, UZ - 0.03], [-0.46, 0.62, 1.95], [-0.5, 0.72, 1.92], [-0.2, 0.72, 1.88], [0.2, 0.72, 1.88], [0.5, 0.72, 1.88], [0.56, 0.68, 1.9]], 0.01, 48, 6), tube([[-0.5, 0.72, 1.88], [-0.58, 0.7, 1.9]], 0.007, 6, 6)]), MAT.sysHose, { d: 'Bedrading van de zekeringkast naar de koplampen, achter het koelpakket langs.', ex: [0, 0.1, 0] }),
    P('Kabelboom motorruimte', merge([tube([[-0.27, 0.64, 1.17], [-0.2, 0.63, 1.07], [0.0, 0.62, 1.05], [0.18, 0.62, 1.04]], 0.011, 24, 6), tube([[-0.27, 0.64, 1.17], [-0.31, 0.66, 1.26]], 0.007, 6, 6)]), MAT.sysHose, { d: 'Bedrading van de motorcomputer langs het schutbord; vertakt naar de sensoren en loopt door een rubber doorvoer de cabine in.', ex: [0, 0.1, -0.1] }),
    P('Kabelboom cabine', tube([uchAt(-0.05, -0.062, 0.083), [0.4, 0.45, 0.66], [0.5, 0.27, 0.7], [0.42, 0.255, 0.0], [0.42, 0.255, -1.0], [0.45, 0.26, -1.9], [0.53, 0.27, -2.1], [0.59, 0.32, -2.2], [0.6, 0.42, -2.22], [0.6, 0.55, -2.235]], 0.01, 80, 6), MAT.sysHose, { d: 'Bedrading van de centrale cabine-unit onder de bekleding langs de dorpel en onder de bagagevloer door naar de achterlichten; hij stijgt pas achter de achterrand van de vloerplaat.', ex: [0.1, 0, 0] }),
    P('Doorvoer schutbord', G.cyl('z', 0.04, 0.04, 0.02, 14), MAT.rubber, { d: 'Rubber doorvoer in het schutbord voor de kabelboom.', p: [0.18, 0.62, 1.03], ex: [0, 0, 0.12] }),
  ]);
  return A('Elektrisch systeem', { d: 'Accu met zekeringkast, motorcomputer, cabine-unit, claxons, voedings- en massakabels en de kabelbomen.', ex: [-1.5, 0.7, 1.4] }, [accu, upc, ecu, uch, ...horns, plusCable, massa, harness]);
}

/* ============================ de hele auto ============================ */
function buildCar() {
  const wheels = A('Wielen', { d: 'Vier lichtmetalen wielen met banden 225/45 R18 en bandenspanningssensoren in de ventielen. Maat: 18 inch (UK Initiale Lux standaard; voor een Nederlandse Initiale Paris van 2011 is 17 inch even goed mogelijk).', ex: [0, 0, 0] },
    [[1, true], [-1, true], [1, false], [-1, false]].map(([s, f]) => buildWheel(s, f)));
  const chassis = A('Onderstel', { d: 'Vooras met stuurinrichting, achteras, de vier wielen (225/45 R18; 18 inch is de maat van de UK Initiale Lux, voor een Nederlandse Initiale Paris van 2011 is 17 inch even goed mogelijk) en het remsysteem.', ex: [0, -0.4, 0] },
    [buildFrontAxle(), buildRearAxle(), wheels, buildBrakeSystem()]);
  const car = A('Renault Laguna III', {
    d: 'Renault Laguna III hatchback (fase 2, 2011) in Initiale Paris-uitvoering, zilvergrijs metallic (Gris Platine), met de 2.0 Turbo F4Rt-motor, zestraps automaat en elektrisch panoramadak. Klik op een onderdeel om het uit te klappen, dubbelklik om er direct naartoe te gaan, rechtsklik of houd vast om weer in te klappen.',
    spec: [['Uitvoering', 'Initiale Paris (fase 2)'], ['Carrosserie', '5-deurs hatchback'], ['Motor', '2.0 Turbo F4Rt, 125 kW (170 pk)'], ['Koppel', '270 Nm bij 3250 tpm'], ['Transmissie', '6-traps automaat'], ['Topsnelheid', '220 km/h'], ['0–100 km/h', '9,2 s'], ['Verbruik (gecomb.)', '8,7 l/100 km'], ['CO₂', '201 g/km'], ['Emissienorm', 'Euro 5'], ['Tankinhoud', '66 l'], ['L × B × H', '4695 × 1811 × 1445 mm'], ['Wielbasis', '2756 mm']],
  }, [buildBody(), buildInterior(), buildPowertrain(), chassis, buildCooling(), buildExhaust(), buildFuel(), buildElectrical()]);
  // keuzes voor de eerste twee uitklapniveaus (vectoren in het autoframe, in meters bij 100 %)
  const set = (name, v) => { const n = car.kids.find(k => k.name === name) || chassis.kids.find(k => k.name === name); if (n) n.ex = V3(...v); };
  set('Carrosserie', [0, 1.9, 0.1]);
  set('Interieur', [0, 0.85, -0.2]);
  set('Aandrijflijn', [0, 0.45, 1.25]);
  set('Onderstel', [0, -0.55, 0]);
  set('Koeling en luchtinlaat', [0, 0.25, 2.0]);
  set('Uitlaatsysteem', [0.4, -1.5, -0.6]);
  set('Brandstofsysteem', [-0.75, -0.95, -0.3]);
  set('Elektrisch systeem', [0.4, 0.6, 0.9]);
  set('Vooras en stuurinrichting', [0, -0.4, 0.3]);
  set('Achteras', [0, -0.4, -0.3]);
  set('Wielen', [0, 0.5, 0]);
  set('Remsysteem', [0, 0.15, 0]);
  return car;
}

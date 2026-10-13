/* ===================== motor F4Rt: distributie, hulpaandrijving, inlaat, turbo, smering ===================== */
const TIM = [[0, 0, 0.032], [CAMZ, CAMY, 0.056], [-CAMZ, CAMY, 0.056], [0.075, 0.13, 0.03], [-0.075, 0.16, 0.028]];
const ACC = [[0, 0, 0.068], [0.19, 0.25, 0.028], [0.17, -0.05, 0.055], [0.06, 0.22, 0.03]];
const XT = -0.245, XA = -0.345;
function pulley(r, w, key) {
  return G.lathe('x', [[0.008, -w / 2], [r, -w / 2], [r, -w / 2 + 0.003], [r - 0.004, -w / 2 + 0.006], [r - 0.004, w / 2 - 0.006], [r, w / 2 - 0.003], [r, w / 2], [0.008, w / 2]], 36, key);
}
function buildTiming() {
  const belt = beltGeo(TIM, 0.022, 0.004); belt.translate(XT, 0, 0);
  const cover = hullSolid(TIM, 0.014, 0.05); cover.translate(-0.285, 0, 0);
  return A('Distributie', { d: 'Getande distributieriem die beide nokkenassen synchroon met de krukas aandrijft.', ex: [-0.5, 0.26, 0] }, [
    P('Distributiekap', cover, MAT.plastic, { d: 'Kunststof afdekkap over riem en wielen.', ex: [-0.18, 0, 0] }),
    P('Distributieriem', belt, MAT.belt, { d: 'Getande rubberen riem; vervangen volgens het onderhoudsschema voorkomt zware motorschade.', ex: [-0.09, 0, 0] }),
    P('Krukastandwiel', gear(24, 0.032, 0.0295, 0.024, 0.018), MAT.steel, { d: 'Tandwiel op de krukasneus.', p: [XT, 0, 0], ex: [-0.03, -0.06, 0] }),
    P('Nokkenaswiel inlaat', merge([gear(48, 0.056, 0.0525, 0.024, 0.012), xf(G.cyl('x', 0.032, 0.032, 0.03), [-0.026, 0, 0])]), MAT.steel, { d: 'Distributiewiel met hydraulische faseversteller die de inlaatnokkenas verdraait.', p: [XT, CAMY, CAMZ], ex: [-0.03, 0.05, 0.04] }),
    P('Nokkenaswiel uitlaat', gear(48, 0.056, 0.0525, 0.024, 0.012), MAT.steel, { d: 'Distributiewiel van de uitlaatnokkenas.', p: [XT, CAMY, -CAMZ], ex: [-0.03, 0.05, -0.04] }),
    P('Spanrol', merge([pulley(0.03, 0.026, 'tens'), xf(G.box(0.012, 0.06, 0.02), [0.016, -0.03, 0])]), MAT.alu, { d: 'Spanrol die de distributieriem op spanning houdt.', p: [XT, 0.13, 0.075], ex: [-0.05, 0, 0.06] }),
    P('Geleiderol', pulley(0.028, 0.026, 'idl'), MAT.alu, { d: 'Geleiderol in het riemverloop.', p: [XT, 0.16, -0.075], ex: [-0.05, 0, -0.06] }),
  ]);
}
function buildAccessory() {
  const belt = beltGeo(ACC, 0.022, 0.005); belt.translate(XA, 0, 0);
  const altBody = merge([G.cyl('x', 0.062, 0.062, 0.13, 28), ...[0, 1, 2, 3, 4, 5].map(k => xf(G.box(0.12, 0.006, 0.02), [0, 0.06 * Math.cos(k), 0.06 * Math.sin(k)], [k, 0, 0]))]);
  return A('Hulpaandrijving', { d: 'Poly-V-riem die dynamo en aircocompressor aandrijft.', ex: [-0.66, -0.18, 0.12] }, [
    P('Multiriem', belt, MAT.belt, { d: 'Poly-V-riem (multiriem).', ex: [-0.1, 0, 0] }),
    P('Krukaspoelie', merge([pulley(0.068, 0.024, 'crankp'), xf(G.cyl('x', 0.02, 0.02, 0.05), [0.03, 0, 0])]), MAT.darkSteel, { d: 'Poelie met trillingsdemper op de krukas.', p: [XA, 0, 0], ex: [-0.06, -0.04, 0] }),
    A('Dynamo', { d: 'Wisselstroomdynamo die tijdens het rijden de accu laadt en het boordnet voedt.', ex: [0.02, 0.14, 0.08] }, [
      P('Dynamohuis', altBody, MAT.alu, { d: 'Behuizing met stator, rotor, gelijkrichter en spanningsregelaar.', p: [-0.27, ACC[1][1], ACC[1][0]], ex: [0.06, 0, 0] }),
      P('Dynamopoelie', pulley(0.028, 0.024, 'altp'), MAT.steel, { d: 'Vrijloop-poelie van de dynamo.', p: [XA, ACC[1][1], ACC[1][0]], ex: [-0.1, 0, 0] }),
    ]),
    P('Aircocompressor', merge([G.cyl('x', 0.058, 0.058, 0.13, 28), xf(G.rbox(0.05, 0.04, 0.04, 0.008), [0.02, 0.06, 0])]), MAT.alu, { d: 'Compressor van de airconditioning.', p: [-0.27, ACC[2][1], ACC[2][0]], ex: [0.02, -0.12, 0.1] }),
    P('Magneetkoppeling airco', pulley(0.055, 0.024, 'acp'), MAT.steel, { d: 'Elektromagnetische koppeling die de compressor in- en uitschakelt.', p: [XA, ACC[2][1], ACC[2][0]], ex: [-0.08, -0.12, 0.1] }),
    P('Automatische riemspanner', merge([pulley(0.03, 0.024, 'acct'), xf(G.box(0.02, 0.07, 0.025), [0.02, -0.035, 0])]), MAT.alu, { d: 'Veerbelaste spanner van de multiriem.', p: [XA, ACC[3][1], ACC[3][0]], ex: [-0.08, 0.08, 0] }),
  ]);
}
function buildIntake() {
  const parts = [xf(G.cyl('x', 0.046, 0.046, 0.42, 28), [0.01, 0.14, 0.21]), xf(G.box(0.42, 0.05, 0.012), [0, 0.29, 0.111])];
  XC.forEach(x => parts.push(tube([[x, 0.29, 0.106], [x, 0.305, 0.16], [x, 0.25, 0.21], [x, 0.17, 0.216]], 0.019, 24, 10)));
  return A('Inlaat en injectie', { d: 'Inlaatspruitstuk, gasklephuis en multipoint-injectie (één verstuiver per cilinder in het spruitstuk).', ex: [0.52, 0.56, 0.3] }, [
    P('Inlaatspruitstuk', merge(parts), MAT.plastic, { d: 'Kunststof spruitstuk dat de gekoelde laadlucht over de cilinders verdeelt.' }),
    P('Gasklephuis', merge([G.cyl('x', 0.033, 0.033, 0.05, 24), xf(G.rbox(0.05, 0.05, 0.04, 0.008), [0, -0.045, 0.02])]), MAT.alu, { d: 'Elektronisch gestuurde gasklep.', p: [-0.235, 0.14, 0.21], ex: [-0.12, 0, 0.04] }),
    P('Brandstofrail', G.cyl('x', 0.009, 0.009, 0.4, 14), MAT.steel, { d: 'Verdeelt de brandstof onder druk over de verstuivers.', p: [0, 0.345, 0.155], ex: [0, 0.14, 0.04] }),
    ...XC.map((x, i) => P(`Verstuiver ${i + 1}`, G.cyl('y', 0.0065, 0.005, 0.055, 12), MAT.plasticGrey, { d: 'Elektromagnetische injector die brandstof in het inlaatkanaal spuit.', p: [x, 0.32, 0.14], r: [0.5, 0, 0], ex: [0, 0.08, 0.02] })),
    P('Inlaatdruksensor', G.rbox(0.03, 0.02, 0.03, 0.005), MAT.plastic, { d: 'Meet de laaddruk in het spruitstuk (MAP-sensor).', p: [0.12, 0.193, 0.21], ex: [0, 0.08, 0] }),
  ]);
}
const TURBO_POS = [0.1, 0.15, -0.26];
function buildTurbo() {
  const coll = [xf(G.cyl('x', 0.03, 0.03, 0.12, 20), [0.03, 0.18, -0.22]), xf(G.box(0.42, 0.045, 0.012), [0, 0.285, -0.111])];
  XC.forEach(x => coll.push(tube([[x, 0.285, -0.106], [x, 0.27, -0.15], [x * 0.5 + 0.02, 0.21, -0.2], [0.03, 0.18, -0.22]], 0.018, 24, 10)));
  const tHouse = merge([G.torus('x', 0.048, 0.026, 36, 10), G.cyl('x', 0.03, 0.03, 0.05, 24), xf(G.cyl('x', 0.03, 0.03, 0.05, 20), [-0.05, 0, 0])]);
  const cHouse = merge([G.torus('x', 0.05, 0.024, 36, 10), G.cyl('x', 0.028, 0.028, 0.045, 24), xf(G.cyl('x', 0.032, 0.032, 0.045, 24), [0.045, 0, 0]), xf(G.cyl('y', 0.022, 0.022, 0.05, 16), [0, 0.07, 0])]);
  const wheel = (n, rIn, rOut, h, tw) => merge([blades(n, rIn, rOut, h, 0.002, tw, 'x'), G.lathe('x', [[0, -h / 2], [rIn + 0.004, -h / 2], [0.006, h / 2], [0, h / 2]], 20)]);
  return A('Turbo en uitlaatspruitstuk', { d: 'Gietijzeren uitlaatspruitstuk met turbocompressor; de turbo perst lucht via de intercooler naar het inlaatspruitstuk.', ex: [0.66, 0.12, -0.32] }, [
    P('Uitlaatspruitstuk', merge(coll), MAT.iron, { d: 'Verzamelt de uitlaatgassen van vier cilinders en leidt ze naar de turbine.' }),
    P('Hitteschild spruitstuk', G.rbox(0.42, 0.006, 0.14, 0.003), MAT.heat, { d: 'Beschermt omliggende delen tegen de hitte van het spruitstuk.', p: [0, 0.32, -0.19], r: [0.55, 0, 0], ex: [0, 0.16, 0] }),
    A('Turbocompressor', { d: 'Turbo: de uitlaatgassen drijven de turbine aan, die via één as het compressorwiel laat draaien.', p: TURBO_POS, ex: [0.06, 0, -0.14] }, [
      P('Turbinehuis', tHouse, MAT.iron, { d: 'Slakkenhuis aan de uitlaatzijde; hier komen de hete gassen binnen.', p: [-0.04, 0, 0], ex: [-0.12, 0, 0] }),
      P('Turbinewiel', wheel(11, 0.008, 0.034, 0.03, 0.3), MAT.darkSteel, { d: 'Turbinewiel van hittebestendige legering.', p: [-0.045, 0, 0], ex: [-0.06, 0, 0] }),
      P('Turbo-as', G.cyl('x', 0.0045, 0.0045, 0.12, 10), MAT.steel, { d: 'As tussen turbine- en compressorwiel.', ex: [0, 0.06, 0] }),
      P('Lagerhuis', merge([G.cyl('x', 0.026, 0.026, 0.05, 20), xf(G.cyl('y', 0.007, 0.007, 0.03, 8), [0, 0.03, 0])]), MAT.alu, { d: 'Lagerhuis met oliegesmeerde lagers en waterkoeling.' }),
      P('Compressorwiel', wheel(12, 0.007, 0.03, 0.028, -0.35), MAT.alu, { d: 'Aluminium compressorwiel dat verse lucht aanzuigt en samenperst.', p: [0.05, 0, 0], ex: [0.07, 0, 0] }),
      P('Compressorhuis', cHouse, MAT.aluCast, { d: 'Slakkenhuis aan de inlaatzijde.', p: [0.055, 0, 0], ex: [0.13, 0, 0] }),
      P('Wastegate-actuator', merge([G.cyl('z', 0.027, 0.027, 0.035, 20), xf(G.box(0.07, 0.005, 0.005), [-0.04, 0, -0.02])]), MAT.steel, { d: 'Drukdoos die de wastegate opent en zo de laaddruk begrenst.', p: [0.03, -0.01, 0.075], ex: [0.02, 0, 0.1] }),
      P('Olietoevoerleiding', tube([[0.005, 0.03, 0], [-0.02, 0.1, 0.04], [-0.05, 0.18, 0.1]], 0.003, 20, 6), MAT.steel, { d: 'Voert motorolie naar de turbolagers.', ex: [0, 0.08, 0] }),
      P('Olieretourleiding', tube([[0.005, -0.03, 0], [-0.01, -0.1, 0.05], [-0.04, -0.17, 0.12]], 0.006, 20, 8), MAT.steel, { d: 'Voert de olie terug naar het carter.', ex: [0, -0.08, 0] }),
    ]),
  ]);
}
function buildLube() {
  const pan = merge([(() => { const g = plan(shapeOf(rrectPts(0.42, 0.2, 0.02)), 0.1); g.translate(0, -0.11, 0); return g; })(), xf(G.rbox(0.2, 0.05, 0.16, 0.012), [0.05, -0.18, 0])]);
  return A('Smering', { d: 'Smeersysteem: carter, oliepomp, filter en peilstok.', ex: [0, -0.46, 0.05] }, [
    P('Oliecarter', pan, MAT.aluCast, { d: 'Carterpan: het oliereservoir onder het blok.', ex: [0, -0.12, 0] }),
    P('Aftapplug', hexBolt(0.015, 0.009), MAT.steel, { d: 'Aftapplug voor het verversen van de olie.', p: [0.05, -0.205, 0.03], ex: [0, -0.22, 0] }),
    P('Oliepomp', G.rbox(0.06, 0.05, 0.08, 0.008), MAT.aluCast, { d: 'Pomp die olie onder druk naar lagers en nokkenassen stuurt.', p: [-0.17, -0.09, 0], ex: [-0.08, 0.05, 0] }),
    P('Olieaanzuigzeef', merge([tube([[-0.17, -0.11, 0], [-0.08, -0.16, 0], [0.02, -0.18, 0]], 0.008, 16, 8), xf(G.cyl('y', 0.035, 0.035, 0.01, 24), [0.04, -0.19, 0])]), MAT.steel, { d: 'Aanzuigbuis met zeef in het oliecarter.', ex: [0, 0.03, 0.09] }),
    P('Oliefilterhouder', G.cyl('z', 0.028, 0.028, 0.015, 20), MAT.aluCast, { d: 'Adapter waarop het filter wordt geschroefd.', p: [0.08, 0.02, 0.112], ex: [0, 0, 0.1] }),
    P('Oliefilter', merge([G.cyl('z', 0.038, 0.038, 0.085, 28), xf(G.cyl('z', 0.036, 0.036, 0.004, 28), [0, 0, 0.044])]), MAT.oilFilter, { d: 'Wegwerp-oliefilter.', p: [0.08, 0.02, 0.15], ex: [0, 0, 0.2] }),
    P('Peilstokbuis', tube([[0.18, -0.03, 0.112], [0.19, 0.2, 0.125], [0.2, 0.44, 0.13]], 0.007, 20, 8), MAT.plastic, { d: 'Geleidebuis van de oliepeilstok.', ex: [0, 0.04, 0.08] }),
    P('Oliepeilstok', merge([tube([[0.18, -0.02, 0.112], [0.19, 0.2, 0.125], [0.2, 0.45, 0.13]], 0.0025, 20, 6), xf(G.torus('z', 0.014, 0.004, 20, 6), [0.2, 0.47, 0.13])]), MAT.handle, { d: 'Peilstok met gele greep om het oliepeil te controleren.', ex: [0, 0.2, 0.1] }),
  ]);
}
function buildEngineCooling() {
  return A('Koelcircuit motor', { d: 'Waterpomp en thermostaat aan de motor.', ex: [-0.48, -0.5, 0.18] }, [
    P('Waterpomp', merge([G.cyl('z', 0.04, 0.04, 0.04, 24), xf(G.cyl('z', 0.05, 0.05, 0.006, 24), [0, 0, -0.018])]), MAT.aluCast, { d: 'Pompt koelvloeistof door motor en radiateur.', p: [-0.19, 0.06, 0.125], ex: [-0.04, 0, 0.1] }),
    P('Waterpompwaaier', blades(6, 0.008, 0.032, 0.012, 0.003, 0.4, 'z'), MAT.steel, { d: 'Schoepenwiel in de waterpomp.', p: [-0.19, 0.06, 0.1], ex: [-0.04, 0, 0.02] }),
    P('Thermostaathuis', G.rbox(0.05, 0.05, 0.06, 0.01), MAT.aluCast, { d: 'Behuizing met aansluiting voor de bovenste radiateurslang.', p: [0.24, 0.3, 0.04], ex: [0.12, 0.04, 0] }),
    P('Thermostaat', merge([G.cyl('x', 0.02, 0.02, 0.004, 20), xf(spring(0.008, 0.0012, 0.02, 4, 'x'), [0.013, 0, 0])]), MAT.steel, { d: 'Opent bij bedrijfstemperatuur de weg naar de radiateur.', p: [0.226, 0.3, 0.04], ex: [0.08, 0.04, 0] }),
  ]);
}
function buildSensors() {
  return A('Sensoren', { d: 'Sensoren voor het motormanagement.', ex: [0.5, -0.5, 0.2] }, [
    P('Klopsensor', merge([G.cyl('z', 0.012, 0.012, 0.015, 6), xf(G.cyl('z', 0.005, 0.005, 0.01, 10), [0, 0, -0.012])]), MAT.darkSteel, { d: 'Detecteert pingelen zodat de ontsteking kan worden aangepast.', p: [0, 0.11, 0.117], ex: [0, 0, 0.1] }),
    P('Krukaspositiesensor', G.cyl('z', 0.008, 0.008, 0.04, 12), MAT.plastic, { d: 'Leest de positie en het toerental van de krukas.', p: [0.205, -0.03, -0.11], ex: [0.08, 0, -0.08] }),
    P('Nokkenaspositiesensor', G.cyl('x', 0.009, 0.009, 0.03, 12), MAT.plastic, { d: 'Herkent de stand van de inlaatnokkenas.', p: [0.235, CAMY, CAMZ], ex: [0.1, 0.04, 0] }),
    P('Temperatuursensor koelvloeistof', G.cyl('x', 0.006, 0.006, 0.025, 10), MAT.plasticGrey, { d: 'Meet de temperatuur van de koelvloeistof.', p: [0.272, 0.3, 0.04], ex: [0.1, 0.04, 0] }),
    P('Oliedrukschakelaar', G.cyl('z', 0.009, 0.009, 0.02, 6), MAT.steel, { d: 'Waarschuwt bij te lage oliedruk.', p: [0.15, 0.05, 0.116], ex: [0, -0.04, 0.1] }),
  ]);
}
function buildEngine() {
  const pistons = A('Zuigers en drijfstangen', { d: 'Vier zuiger-drijfstanggroepen; zuigers 1 en 4 staan in het bovenste dode punt.', ex: [0, 0.37, 0] }, XC.map((_, i) => pistonGroup(i)));
  const flex = A('Flexplaat', { d: 'Dunne meeneemplaat met startkrans tussen krukas en koppelomvormer; vervangt bij een automaat het vliegwiel.', ex: [0.44, -0.16, 0] }, [
    P('Flexplaat met startkrans', merge([gear(72, 0.142, 0.137, 0.008, 0.123), G.lathe('x', [[0.03, 0.004], [0.125, 0.0], [0.125, -0.002], [0.03, -0.002]], 40)]), MAT.steel, { d: 'Plaat met getande startkrans waarin de startmotor grijpt.', p: [0.23, 0, 0] }),
    ...[0, 1, 2, 3, 4, 5].map(k => P(`Flexplaatbout ${k + 1}`, hexBolt(0.02, 0.009, '-x'), MAT.darkSteel, { d: 'Bout tussen flexplaat en krukasflens.', p: [0.236, 0.028 * Math.cos(k * PI / 3), 0.028 * Math.sin(k * PI / 3)], ex: [0.07, 0, 0] })),
  ]);
  return A('Motor F4Rt', {
    d: 'Renault F-motor met turbo: 2,0 liter, vier cilinders in lijn, 16 kleppen, gietijzeren blok, aluminium kop en distributieriem.',
    spec: [['Motorcode', 'F4Rt'], ['Opbouw', '4 in lijn, 16V DOHC'], ['Cilinderinhoud', '1998 cm³'], ['Boring × slag', '82,7 × 93,0 mm'], ['Compressie', '9,5 : 1'], ['Brandstofsysteem', 'multipoint-injectie'], ['Inductie', 'turbo + intercooler'], ['Vermogen', '125 kW (170 pk) bij 5000 tpm'], ['Koppel', '270 Nm bij 3250 tpm'], ['Nokkenasaandrijving', 'distributieriem']],
    ex: [0, 0.25, 0],
  }, [
    buildBlock(),
    A('Krukmechanisme', { d: 'Krukas met de vier zuiger-drijfstanggroepen: zet de op- en neergaande beweging van de zuigers om in draaiing.', ex: [0, -0.32, 0.38] }, [
      P('Krukas', crankGeo(), MAT.steel, { d: 'Krukas met vijf hoofdlagers; zet de zuigerbeweging om in draaiing.', ex: [0, -0.22, 0] }),
      pistons,
    ]),
    buildHead(), buildTiming(), buildAccessory(), buildIntake(), buildTurbo(), buildLube(), buildEngineCooling(), buildSensors(), flex,
    P('Motorafdekkap', merge([G.rbox(0.4, 0.03, 0.18, 0.012), ...[-0.12, -0.04, 0.04, 0.12].map(x => xf(G.box(0.05, 0.006, 0.14), [x, 0.017, 0]))]), MAT.plastic, { d: 'Kunststof afdekkap bovenop de motor.', p: [0, 0.478, 0], ex: [0, 0.95, 0] }),
  ]);
}

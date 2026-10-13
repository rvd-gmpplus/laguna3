/* ===================== motor F4Rt 811: dynamo, aircocompressor, sensoren, kabelboom, flexplaat, afdekkap ===================== */
// Dynamo en aircocompressor: lokaal frame met x langs de as; de poelie ligt in het multiriemvlak (lokaal x = XA - p[0]).
std('engStatorLam', 0x5b6168, 0.6, 0.46);
// statorplaat: ringGear (core) met 36 sleuven, maar met een fijnere buitenrand (48 segmenten) zodat de buitenkant rond leest
function engStatLam() {
  return cache('engStatLamPlate', () => {
    const rOut = 0.0605, rTip = 0.0478, rRoot = 0.0526, st = PI * 2 / 36, sh = new THREE.Shape(), h = new THREE.Path();
    sh.absarc(0, 0, rOut, 0, PI * 2, false);
    for (let i = 0; i < 36; i++) [[rRoot, 0], [rTip, 0.2], [rTip, 0.45], [rRoot, 0.65]].forEach(([r, f], j) => {
      const t = (i + f) * st, x = r * Math.cos(t), y = r * Math.sin(t);
      (i === 0 && j === 0) ? h.moveTo(x, y) : h.lineTo(x, y);
    });
    h.closePath(); sh.holes.push(h);
    return zTo(extrude(sh, 0.0114, 48), 'x');
  });
}
function buildAlternator(p) {
  const px = XA - p[0];
  const shieldF = G.lathe('x', [[0.017, -0.066], [0.05, -0.066], [0.06, -0.06], [0.062, -0.05], [0.062, -0.038], [0.058, -0.038], [0.056, -0.056], [0.017, -0.06]], 32, 'engAltShieldF');
  const shieldR = G.lathe('x', [[0.014, 0.034], [0.058, 0.034], [0.062, 0.036], [0.062, 0.058], [0.056, 0.07], [0.044, 0.079], [0.0, 0.081]], 32, 'engAltShieldR');
  const ears = cache('engAltEars', () => merge([xf(G.box(0.02, 0.026, 0.016), [-0.05, -0.068, -0.02]), xf(G.box(0.02, 0.026, 0.016), [0.045, -0.068, -0.02]), xf(G.box(0.02, 0.016, 0.026), [-0.05, 0.02, -0.064])]));
  const claw = cache('engClaw', () => merge([G.cyl('x', 0.044, 0.044, 0.008, 24), ...[0, 1, 2, 3, 4, 5].map(k => xf(G.box(0.024, 0.008, 0.016), [0.012, 0.04 * Math.cos(k * PI / 3), 0.04 * Math.sin(k * PI / 3)], [k * PI / 3, 0, 0]))]));
  const bolts = [0, 1, 2].map(k => { const a = PI / 6 + k * PI * 2 / 3; return P(`Doorgaande bout ${k + 1}`, hexBolt(0.145, 0.005, 'x'), MAT.steel, { d: 'Doorgaande bout die voor- en achterschild samentrekt.', p: [-0.067, 0.064 * Math.cos(a), 0.064 * Math.sin(a)], ex: [-0.12, 0, 0] }); });
  return A('Dynamo', { d: 'Valeo-dynamo (TG15C-reeks, 150 A) met vrijloop-poelie; de interne opbouw is schematisch weergegeven.', p, ex: [-0.04, 0.1, 0.08], spec: [['Type', 'Valeo TG15C'], ['Stroom', '150 A'], ['Poelie', 'Ø49 tot 50 mm, 7 groeven']] }, [
    A('Vrijlooppoelie', { d: 'Poelie met vrijloop die koppelstoten van de krukas opvangt.', p: [px, 0, 0], ex: [-0.16, 0, 0] }, [
      P('Buitenring met riemprofiel', engPolyV(0.0245, 0.025, 'Alt', 28), MAT.steel, { d: 'Buitenring met zeven groeven voor de multiriem.', ex: [0, 0, 0] }),
      P('Binnenring', annulus(0.009, 0.0135, 0.022, 'x', 18), MAT.steel, { d: 'Binnenring op de rotoras.', ex: [0, 0, 0.05] }),
      P('Klemrollen', merge([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => xf(G.cyl('x', 0.0016, 0.0016, 0.016, 6), [0, 0.0155 * Math.cos(k * PI / 5), 0.0155 * Math.sin(k * PI / 5)]))), MAT.bearing, { d: 'Klemrollen met veertjes van de vrijloop.', ex: [0, 0, 0.06] }),
      P('Stofdop', G.lathe('x', [[0, -0.004], [0.012, -0.004], [0.013, 0.0], [0.012, 0.002], [0, 0.002]], 18, 'engAltCap'), MAT.plastic, { d: 'Stofdop voor op de poelie.', p: [-0.016, 0, 0], ex: [-0.04, 0, 0] }),
    ]),
    P('Voorschild', merge([shieldF, ears]), MAT.aluCast, { d: 'Aluminium voorschild (aandrijfzijde) met bevestigingsogen en ventilatieopeningen.', ex: [-0.15, 0, 0] }),
    P('Voorlager', annulus(0.0085, 0.017, 0.01, 'x', 18), MAT.bearing, { d: 'Kogellager in het voorschild.', p: [-0.056, 0, 0], ex: [-0.125, 0, 0] }),
    P('Ventilator', merge([blades(8, 0.028, 0.054, 0.008, 0.0016, 0.3, 'x'), G.cyl('x', 0.054, 0.054, 0.0015, 24)]), MAT.steel, { d: 'Interne ventilator op de rotor voor de koeling.', p: [-0.033, 0, 0], ex: [-0.1, 0, 0] }),
    A('Rotor', { d: 'Klauwpoolrotor met veldspoel en sleepringen.', ex: [-0.07, 0, 0] }, [
      P('Rotoras', G.cyl('x', 0.0085, 0.0085, 0.15, 12), MAT.steel, { d: 'Rotoras.', p: [-0.01, 0, 0], ex: [0, 0, 0] }),
      P('Klauwpool voor', claw, MAT.darkSteel, { d: 'Klauwpool met zes vingers.', p: [-0.02, 0, 0], ex: [-0.03, 0, 0] }),
      P('Klauwpool achter', claw, MAT.darkSteel, { d: 'Tweede klauwpool, vingers in elkaar grijpend.', p: [0.02, 0, 0], r: [PI / 6, PI, 0], ex: [0.03, 0, 0] }),
      P('Veldspoel', G.cyl('x', 0.03, 0.03, 0.026, 20), MAT.copper, { d: 'Bekrachtigingsspoel tussen de klauwpolen.', ex: [0, 0.01, 0] }),
      P('Sleepringen', merge([xf(G.cyl('x', 0.0085, 0.0085, 0.004, 14), [0.044, 0, 0]), xf(G.cyl('x', 0.0085, 0.0085, 0.004, 14), [0.05, 0, 0]), xf(G.cyl('x', 0.007, 0.007, 0.012, 10), [0.047, 0, 0])]), MAT.copper, { d: 'Twee koperen sleepringen waarover de koolborstels lopen.', ex: [0.05, 0, 0] }),
    ]),
    A('Stator', { d: 'Stator: driefasewikkeling in een plaatpakket van gestapelde elektroplaten met 36 sleuven; de koperen wikkelkoppen steken aan beide zijden uit het pakket (aantal sleuven en platen schematisch).', ex: [0, 0.11, 0] }, [
      P('Plaatpakket', cache('engStatPack', () => merge([0, 1, 2].map(k => xf(engStatLam(), [(k - 1) * 0.0124, 0, 0])))), MAT.engStatorLam, { d: 'Gestapelde, tegen elkaar gelakte elektroplaten met de sleuven voor de driefasewikkeling; de groeven tussen de platen zijn schematisch.', ex: [0, 0, 0] }),
      P('Wikkelkop voorzijde', cache('engStatWindF', () => xf(G.torus('x', 0.0525, 0.0045, 28, 6), [-0.0225, 0, 0])), MAT.copper, { d: 'Koperen wikkelkop aan de voorzijde van de statorwikkeling.', ex: [-0.035, 0, 0] }),
      P('Wikkelkop achterzijde', cache('engStatWindR', () => xf(G.torus('x', 0.0525, 0.0045, 28, 6), [0.0225, 0, 0])), MAT.copper, { d: 'Koperen wikkelkop aan de achterzijde van de statorwikkeling.', ex: [0.035, 0, 0] }),
    ]),
    P('Achterlager', annulus(0.0065, 0.014, 0.008, 'x', 16), MAT.bearing, { d: 'Kogellager in het achterschild.', p: [0.04, 0, 0], ex: [0.05, 0, 0] }),
    P('Achterschild', merge([shieldR, xf(G.box(0.02, 0.026, 0.016), [0.05, -0.068, -0.02])]), MAT.aluCast, { d: 'Achterschild aan de sleepringzijde met de kunststof afdekkap.', ex: [0.08, 0, 0.03] }),
    P('Gelijkrichter', merge([annulus(0.016, 0.05, 0.004, 'x', 24), ...[0, 1, 2, 3, 4, 5].map(k => xf(G.cyl('x', 0.004, 0.004, 0.005, 8), [0.003, 0.034 * Math.cos(k * PI / 3 + 0.3), 0.034 * Math.sin(k * PI / 3 + 0.3)]))]), MAT.ecu, { d: 'Diodebrug met zes diodes die de wisselstroom gelijkricht.', p: [0.062, 0, 0], ex: [0.07, 0.04, 0.09], inner: true }),
    A('Spanningsregelaar', { d: 'Spanningsregelaar met koolborstelhouder.', ex: [0.07, 0.1, 0.03], inner: true }, [
      P('Borstelhouder', G.box(0.016, 0.03, 0.016), MAT.ecu, { d: 'Regelaar met borstelhouder.', p: [0.05, 0.025, 0], ex: [0, 0, 0] }),
      P('Koolborstel 1', G.box(0.004, 0.008, 0.005), MAT.blackGloss, { d: 'Koolborstel op de sleepring.', p: [0.044, 0.0125, 0], ex: [0, 0.03, -0.02] }),
      P('Koolborstel 2', G.box(0.004, 0.008, 0.005), MAT.blackGloss, { d: 'Tweede koolborstel.', p: [0.05, 0.0125, 0], ex: [0, 0.03, 0.02] }),
      P('Borstelveer 1', engSpring(0.0018, 0.0003, 0.008, 4, 6), MAT.steel, { d: 'Veer die de koolborstel aandrukt.', p: [0.044, 0.021, 0], ex: [0, 0.05, -0.02] }),
      P('Borstelveer 2', engSpring(0.0018, 0.0003, 0.008, 4, 6), MAT.steel, { d: 'Tweede borstelveer.', p: [0.05, 0.021, 0], ex: [0, 0.05, 0.02] }),
    ]),
    A('Doorgaande bouten', { d: 'Drie doorgaande bouten.', ex: [-0.04, 0, 0] }, bolts),
    P('B+-aansluiting', merge([G.cyl('x', 0.004, 0.004, 0.02, 8), xf(engNut(0.008, 0.006, 'x'), [0.006, 0, 0]), xf(G.cyl('x', 0.008, 0.008, 0.004, 12), [-0.004, 0, 0])]), MAT.copper, { d: 'Hoofdstroomaansluiting B+ (M8) naar de accu.', p: [0.085, 0.03, 0.025], ex: [0.06, 0.03, 0.03] }),
    P('Stekker dynamo', G.rbox(0.014, 0.018, 0.022, 0.003), MAT.plastic, { d: 'Stekker voor de stuur- en signaalleidingen.', p: [0.078, -0.03, 0.03], ex: [0.06, -0.02, 0.04] }),
  ]);
}
function buildAcCompressor(p) {
  const px = XA - p[0];
  const front = G.lathe('x', [[0.022, -0.074], [0.024, -0.062], [0.05, -0.06], [0.058, -0.052], [0.058, -0.02], [0.02, -0.02]], 32, 'engAcFront');
  const rear = G.lathe('x', [[0.02, -0.02], [0.058, -0.02], [0.058, 0.055], [0.052, 0.066], [0, 0.068]], 32, 'engAcRear');
  const lugs = cache('engAcLugs', () => merge([xf(G.box(0.022, 0.02, 0.02), [-0.04, 0.066, 0]), xf(G.box(0.022, 0.02, 0.02), [0.04, 0.066, 0]), xf(G.box(0.022, 0.02, 0.02), [0.04, -0.066, 0])]));
  const pistons = [0, 1, 2, 3, 4, 5, 6].map(k => { const a = k * PI * 2 / 7; return P(`Zuiger ${k + 1}`, G.cyl('x', 0.008, 0.008, 0.034, 10), MAT.alu, { d: 'Dubbelwerkende zuiger die door de tuimelschijf heen en weer gaat.', p: [0.02, 0.036 * Math.cos(a), 0.036 * Math.sin(a)], ex: [0, 0.03 * Math.cos(a), 0.03 * Math.sin(a)] }); });
  return A('Aircocompressor', { d: 'Aircocompressor met magneetkoppeling, van het Denso-type (R134a, PAG 46-olie); de interne opbouw is schematisch en het aantal zuigers geschat.', p, ex: [-0.04, -0.1, 0.1], spec: [['Type', 'Denso-type, tuimelschijf'], ['Koudemiddel', 'R134a'], ['Poelie', 'Ø119 mm, 7 groeven']] }, [
    A('Magneetkoppeling', { d: 'Elektromagnetische koppeling die de compressor in- en uitschakelt.', p: [px, 0, 0], ex: [-0.12, 0, 0] }, [
      P('Poelie met lager', merge([engPolyV(0.0595, 0.026, 'Ac'), annulus(0.024, 0.032, 0.02, 'x', 24)]), MAT.steel, { d: 'Riempoelie met lager op de neus van het voorhuis, Ø119 mm.', ex: [-0.02, 0, 0] }),
      P('Ankerplaat', merge([G.cyl('x', 0.052, 0.052, 0.004, 32), ...[0, 1, 2].map(k => xf(G.box(0.003, 0.006, 0.03), [-0.003, 0.03 * Math.cos(k * 2.09), 0.03 * Math.sin(k * 2.09)], [k * 2.09, 0, 0]))]), MAT.steel, { d: 'Koppelingsplaat (anker) met veerplaten, wordt door de spoel tegen de poelie getrokken.', p: [-0.016, 0, 0], ex: [-0.05, 0, 0] }),
      P('Naaf', merge([G.cyl('x', 0.013, 0.013, 0.012, 14), xf(G.cyl('x', 0.02, 0.02, 0.003, 16), [-0.004, 0, 0])]), MAT.darkSteel, { d: 'Naaf op de compressoras.', p: [-0.022, 0, 0], ex: [-0.058, 0, 0] }),
      P('Borgring koppeling', G.torus('x', 0.009, 0.0012, 14, 4), MAT.steel, { d: 'Borgring die de naaf op de as vastzet.', p: [-0.029, 0, 0], ex: [-0.075, 0, 0] }),
      P('Veldspoel koppeling', annulus(0.026, 0.05, 0.018, 'x', 28), MAT.copper, { d: 'Elektromagneet in de poelie.', p: [0.012, 0, 0], ex: [0.03, 0, 0] }),
    ]),
    P('Voorhuis', merge([front, lugs]), MAT.aluCast, { d: 'Voorste compressorhuis met de neus voor het poelielager.', ex: [-0.09, 0, 0] }),
    P('Achterhuis', rear, MAT.aluCast, { d: 'Achterste huis (cilinderblok en kop) met zuig- en perskamer.', ex: [0, 0, 0] }),
    P('Compressoras', G.cyl('x', 0.007, 0.007, 0.14, 10), MAT.steel, { d: 'Aandrijfas van de compressor.', p: [-0.01, 0, 0], ex: [-0.03, 0.11, 0], inner: true }),
    P('Asafdichting', annulus(0.007, 0.014, 0.006, 'x', 16), MAT.rubber, { d: 'Asafdichting in de neus van het voorhuis.', p: [-0.066, 0, 0], ex: [-0.09, 0.07, 0], inner: true }),
    P('Tuimelschijf', G.cyl('x', 0.044, 0.044, 0.006, 24), MAT.steel, { d: 'Schuine schijf op de as die de draaiing omzet in de heen-en-weerbeweging van de zuigers.', p: [-0.01, 0, 0], r: [0, 0, 0.3], ex: [0, 0.14, 0], inner: true }),
    A('Compressorzuigers', { d: 'Zeven zuigers (aantal geschat).', ex: [0, 0, 0.14], inner: true }, pistons),
    P('Klepplaat', merge([G.cyl('x', 0.05, 0.05, 0.003, 28), ...[0, 1, 2, 3, 4, 5, 6].map(k => xf(G.box(0.001, 0.004, 0.012), [-0.002, 0.036 * Math.cos(k * 0.898), 0.036 * Math.sin(k * 0.898)], [k * 0.898, 0, 0]))]), MAT.steel, { d: 'Klepplaat met lamellenkleppen tussen cilinders en kop.', p: [0.045, 0, 0], ex: [0.07, 0, 0], inner: true }),
    P('Aansluitblok', merge([G.box(0.04, 0.016, 0.034), xf(G.cyl('y', 0.008, 0.008, 0.012, 10), [-0.01, 0.012, 0]), xf(G.cyl('y', 0.006, 0.006, 0.012, 10), [0.012, 0.012, 0])]), MAT.alu, { d: 'Aansluitplaat voor zuig- en persleiding met O-ringen.', p: [0.03, 0.066, 0], ex: [0, 0.07, 0] }),
    P('Overdrukklep', merge([G.cyl('z', 0.006, 0.006, 0.014, 10), xf(G.cyl('z', 0.008, 0.008, 0.004, 6), [0, 0, -0.008])]), MAT.steel, { d: 'Overdrukklep die bij te hoge druk koudemiddel afblaast.', p: [0.05, 0, -0.064], ex: [0, 0, -0.06] }),
  ]);
}
function buildSensors() {
  const conn = G.rbox(0.014, 0.012, 0.016, 0.003);
  return A('Sensoren', { d: 'Krukas-, nokkenas- en klopsensor met hun bevestigingsbouten; de overige sensoren zitten bij het onderdeel dat ze meten.', ex: [0.04, 0.02, 0.16] }, [
    A('Klopsensor', { d: 'Piëzo-klopsensor op het blok tussen cilinder 2 en 3 (plaats aannemelijk): meldt pingelen zodat de ontsteking wordt verlaat.', p: [0, 0.11, 0.109], ex: [0, 0, 0.06] }, [
      P('Sensor', merge([G.lathe('z', [[0.005, 0], [0.014, 0], [0.014, 0.01], [0.009, 0.013], [0.005, 0.013]], 16, 'engKnock'), xf(conn, [0.0, 0.016, 0.007])]), MAT.darkSteel, { d: 'Ringvormig sensorhuis met stekker.', ex: [0, 0, 0] }),
      P('Bout klopsensor', hexBolt(0.025, 0.008, 'z'), MAT.darkSteel, { d: 'Bout door het midden van de klopsensor.', p: [0, 0, 0.018], r: [0, PI, 0], ex: [0, 0, 0.06] }),
    ]),
    A('Krukaspositiesensor', { d: 'Inductieve sensor aan de vliegwielzijde die het pulswiel op de krukas leest (toerental en stand).', p: [0.1925, -0.03, -0.111], ex: [0.04, 0, -0.07] }, [
      P('Sensor', merge([xf(G.cyl('z', 0.0085, 0.0085, 0.032, 12), [0, 0, 0.016]), xf(G.rbox(0.026, 0.004, 0.016, 0.002), [0.006, 0, 0]), xf(conn, [0, 0, -0.01])]), MAT.plastic, { d: 'Sensor met flens en stekker.', ex: [0, 0, 0] }),
      P('Bout krukassensor', hexBolt(0.016, 0.006, 'z'), MAT.darkSteel, { d: 'Bout van de krukaspositiesensor.', p: [0.016, 0, -0.003], ex: [0, 0, -0.05] }),
    ]),
    A('Nokkenaspositiesensor', { d: 'Actieve hallsensor op de kop die het doel op de inlaatnokkenas leest (plaats aannemelijk).', p: [0.195, CAMY - 0.005, 0.109], ex: [0.04, 0.02, 0.06] }, [
      P('Sensor', merge([xf(G.cyl('z', 0.0085, 0.0085, 0.022, 12), [0, 0, -0.011]), xf(G.rbox(0.026, 0.016, 0.004, 0.002), [0.006, 0, 0.002]), xf(conn, [0, 0, 0.012])]), MAT.plastic, { d: 'Hallsensor met flens en stekker.', ex: [0, 0, 0] }),
      P('Bout nokkenassensor', hexBolt(0.016, 0.006, 'z'), MAT.darkSteel, { d: 'Bout van de nokkenaspositiesensor.', p: [0.016, 0, 0.005], r: [0, PI, 0], ex: [0, 0, 0.05] }),
    ]),
  ]);
}
function buildHarness() {
  const Y = 0.432, Z = 0.095;
  const trunk = tube([[0.212, Y, Z], [0.0, Y, Z], [-0.16, Y, Z], [-0.212, 0.425, Z + 0.008], [-0.235, 0.405, 0.118]], 0.0065, 48, 8);
  const coils = merge(XC.map(x => tube([[x + 0.004, Y, Z - 0.004], [x + 0.002, Y + 0.003, 0.07], [x, ENG_COVER_TOP + 0.011, 0.045]], 0.003, 8, 6)));
  const injs = merge(XC.map(x => tube([[x + 0.012, Y, Z + 0.004], [x + 0.012, 0.4, 0.122], [x + 0.008, 0.358, 0.14], [x, 0.342, 0.143]], 0.0028, 12, 6)));
  const sens = tube([[0.212, Y, Z], [0.214, 0.395, 0.112], [0.185, 0.33, 0.128], [0.18, 0.3, 0.13], [0.165, 0.2, 0.14], [0.135, 0.12, 0.145], [0.05, 0.11, 0.138], [0.004, 0.126, 0.128]], 0.0035, 48, 6);
  const thr = tube([[-0.16, Y, Z], [-0.183, 0.38, 0.14], [-0.186, 0.26, 0.27], [-0.185, 0.15, 0.284], [-0.22, 0.09, 0.285], [-0.236, 0.072, 0.276], [-0.236, 0.07, 0.276], [-0.2, 0.15, 0.287], [-0.09, 0.155, 0.286], [0.09, 0.155, 0.284], [0.104, 0.152, 0.272]], 0.0032, 72, 6);
  return A('Motorkabelboom', { d: 'Motorkabelboom met aftakkingen naar bobines, injectoren, gasklep, inlaatsensoren en de sensoren op blok en kop (vereenvoudigd als buizen).', ex: [0, 0.5, 0.36] }, [
    P('Hoofdstreng', trunk, MAT.plastic, { d: 'Hoofdstreng van de kabelboom over de voorkant van het kleppendeksel.', ex: [0, 0, 0] }),
    P('Aftakking bobines', coils, MAT.plastic, { d: 'Aftakkingen naar de vier bobinestekkers.', ex: [0, 0.03, -0.03] }),
    P('Aftakking injectoren', injs, MAT.plastic, { d: 'Aftakkingen naar de vier injectoren.', ex: [0, -0.02, 0.05] }),
    P('Aftakking sensoren', sens, MAT.plastic, { d: 'Aftakking naar nokkenassensor, oliedrukschakelaar en klopsensor.', ex: [0.06, -0.03, 0.03] }),
    P('Aftakking gasklep en inlaatsensoren', thr, MAT.plastic, { d: 'Aftakking naar gasklephuis, inlaatluchttemperatuursensor en inlaatdruksensor.', ex: [-0.03, -0.03, 0.07] }),
    P('Hoofdstekker', G.rbox(0.03, 0.026, 0.04, 0.005), MAT.plasticGrey, { d: 'Hoofdstekker naar de motormanagementcomputer.', p: [-0.24, 0.4, 0.122], ex: [-0.06, 0, 0.03] }),
  ]);
}
function buildFlexplate() {
  return A('Flexplaat', { d: 'Dunne meeneemplaat met startkrans tussen krukas en koppelomvormer; vervangt bij de automaat het vliegwiel.', ex: [0.4, -0.02, 0] }, [
    P('Aandrijfplaat', G.lathe('x', [[0.03, -0.0015], [0.07, -0.0015], [0.1, 0.002], [0.13, 0.002], [0.13, 0.0045], [0.1, 0.0045], [0.07, 0.0015], [0.03, 0.0015]], 48, 'engFlexDisc'), MAT.steel, { d: 'Gestanste aandrijfplaat met centrale naaf.', p: [0.2255, 0, 0], ex: [0, 0, 0] }),
    P('Startkrans', gear(110, 0.142, 0.1375, 0.011, 0.128, 'x'), MAT.steel, { d: 'Getande startkrans waarin het rondsel van de startmotor grijpt (tandental schematisch).', p: [0.2285, 0, 0], ex: [0.03, 0, 0] }),
    P('Versterkingsring', annulus(0.018, 0.04, 0.003, 'x', 32), MAT.steel, { d: 'Versterkingsplaat onder de bouten.', p: [0.2285, 0, 0], ex: [0.055, 0, 0] }),
    ...[0, 1, 2, 3, 4, 5].map(k => P(`Flexplaatbout ${k + 1}`, hexBolt(0.02, 0.009, '-x'), MAT.darkSteel, { d: 'Bout tussen flexplaat en krukasflens; vervangen bij demontage.', p: [0.2305, 0.03 * Math.cos(k * PI / 3 + PI / 6), 0.03 * Math.sin(k * PI / 3 + PI / 6)], ex: [0.09, 0, 0] })),
  ]);
}
function buildEngineCover() {
  const top = 0.473, cap = cache('engTopCover', () => merge([xf(G.rbox(0.4, 0.016, 0.22, 0.008), [0, -0.008, 0]), ...[-0.12, -0.04, 0.04, 0.12].map(x => xf(G.box(0.05, 0.003, 0.16), [x, 0.0005, 0]))]));
  const grom = [[0.188, 0.06], [-0.14, 0.075], [-0.05, -0.085]];
  return A('Motorafdekkap', { d: 'Kunststof afdekkap bovenop de motor met akoestische schuimlaag, op rubber nokken.', ex: [0, 1.05, -0.12] }, [
    P('Afdekkap', cap, MAT.plastic, { d: 'Kunststof afdekkap (vorm geschat).', p: [0, top - 0.0005, 0], ex: [0, 0, 0] }),
    P('Akoestische schuimlaag', G.rbox(0.38, 0.006, 0.2, 0.003), MAT.engFoam, { d: 'Schuimlaag aan de onderkant die motorgeluid dempt.', p: [0, top - 0.019, 0], ex: [0, -0.05, 0] }),
    ...grom.map(([x, z], k) => P(`Rubber nok ${k + 1}`, G.cyl('y', 0.0065, 0.0065, 0.024, 10), MAT.rubber, { d: 'Rubber nok waarop de afdekkap klemt.', p: [x, ENG_COVER_TOP + 0.012, z], ex: [0, -0.1, 0] })),
  ]);
}

/* ---------- stuurpomp (schottenpomp op de multiriem; aannemelijk voor deze motor, zie research/beslissingen.md) ---------- */
// Lokaal frame: oorsprong op de pompas in het multiriemvlak-niveau van ENG_PS; x langs de as (poelie op x = XA - ENG_PS[0]), y en z radiaal.
function engBuildPump() {
  const PXL = XA - ENG_PS[0], R = ENG_PS_R, AE = 0.03, BE = 0.024;
  const ell = (a, b, n = 40) => Array.from({ length: n }, (_, i) => { const t = i / n * PI * 2; return [a * Math.cos(t), b * Math.sin(t)]; });
  const pulleyGeo = cache('engPsPulley', () => xf(engPolyV(R, 0.026, 'Ps'), [PXL, 0, 0]));
  const front = G.lathe('x', [[0.0095, -0.056], [0.0185, -0.056], [0.0185, -0.046], [0.046, -0.046], [0.046, -0.004], [0.0095, -0.004]], 32, 'engPsFront');
  const rear = cache('engPsRear', () => merge([
    G.lathe('x', [[0.037, -0.004], [0.046, -0.004], [0.046, 0.052], [0.041, 0.055], [0, 0.055], [0, 0.018], [0.037, 0.018], [0.037, -0.004]], 32),
    xf(G.cyl('z', 0.0155, 0.0155, 0.026, 16), [0.03, 0, -0.039]),                       // huis van de stroomregelklep
    xf(G.cyl('y', 0.013, 0.013, 0.026, 14), [0.008, -0.039, 0.02]),                      // hogedrukaansluiting
  ]));
  const ring = cache('engPsCamRing', () => { const sh = shapeOf(ell(0.037, 0.037)); sh.holes.push(new THREE.Path(ell(AE, BE).map(q => new THREE.Vector2(q[0], q[1])))); return xf(side(sh, 0.018), [0.005, 0, 0]); });
  const vanes = [...Array(10)].map((_, k) => {
    const a = (k + 0.5) * PI / 5, sa = Math.sin(a), ca = Math.cos(a);
    const tip = 1 / Math.sqrt((sa / AE) ** 2 + (ca / BE) ** 2) - 0.0004, rc = tip - 0.007;
    return P(`Schoep ${k + 1}`, G.box(0.014, 0.014, 0.0022), MAT.darkSteel, { d: 'Schoep die in een gleuf van de rotor schuift en door de middelpuntvlieskracht tegen de nokring wordt gedrukt.', p: [0.005, rc * ca, rc * sa], r: [a, 0, 0], ex: [0, 0.03 * ca, 0.03 * sa] });
  });
  const boltAt = k => { const a = (70 + 120 * k) * PI / 180; return P(`Doorgaande bout ${k + 1}`, hexBolt(0.118, 0.008, 'x'), MAT.darkSteel, { d: 'Bout die voorhuis en achterdeksel samentrekt en de pomp op de pompsteun houdt.', p: [-0.046, 0.039 * Math.cos(a), 0.039 * Math.sin(a)], ex: [0, 0, 0] }); };
  const plate = cache('engPsPlate', () => {
    const arm = shapeOf([[-0.135, -0.05], [-0.11, -0.05], [-0.11, -0.03], [-0.02, -0.03], [-0.02, 0.025], [-0.11, 0.025], [-0.11, 0.04], [-0.135, 0.04]]);
    const boss = new THREE.Shape(); boss.absarc(0, 0, 0.048, 0, PI * 2, false);
    return xf(merge([side(arm, 0.02), side(boss, 0.02)]), [0.065, 0, 0]);
  });
  const plug = cache('engPsPlug', () => merge([engNut(0.0145, 0.009, 'z'), xf(G.cyl('z', 0.0075, 0.0075, 0.012, 12), [0, 0, 0.0105])]));
  return A('Stuurpomp', { d: 'Riemaangedreven schottenpomp (aannemelijk voor deze motor; de stuurbekrachtiging van de F4Rt 811 is hydraulisch met variabele assistentie): perst olie uit het reservoir naar het stuurhuis. Opbouw, afmetingen en plaats zijn geschat.', p: ENG_PS, ex: [-0.06, 0, 0.12], spec: [['Aandrijving', 'multiriem 7PK1795, zeven groeven'], ['Status', 'aannemelijk, niet bevestigd']] }, [
    A('Poelie met moer', { d: 'Multiriempoelie met zeven groeven en de moer waarmee hij op de pompas zit.', ex: [-0.14, 0, 0] }, [
      P('Poelie stuurpomp', pulleyGeo, MAT.steel, { d: 'Stalen poelie met zeven groeven voor de multiriem (Ø116 mm, geschat).', ex: [0, 0, 0] }),
      P('Moer poelie', engNut(0.016, 0.006, 'x'), MAT.darkSteel, { d: 'Moer op het asuiteinde die de poelie vastzet.', p: [PXL - 0.0135, 0, 0], ex: [-0.05, 0, 0] }),
    ]),
    A('Pomphuis', { d: 'Gegoten aluminium huis in twee delen met afdichtring en doorgaande bouten; de hogedrukaansluiting en de stroomregelklep zitten op het achterdeksel.', ex: [0, 0, 0] }, [
      P('Achterdeksel', rear, MAT.aluCast, { d: 'Achterdeksel met de pompkamer, de boring voor de stroomregelklep en de aansluiting voor de hogedrukpijp.', ex: [0, 0, 0] }),
      P('Voorhuis', front, MAT.aluCast, { d: 'Voorhuis met de neus waarin de aandrijfas draait.', ex: [-0.07, 0, 0] }),
      P('O-ring pomphuis', G.torus('x', 0.0405, 0.0012, 28, 5), MAT.rubber, { d: 'Afdichtring tussen voorhuis en achterdeksel.', p: [-0.004, 0, 0], ex: [-0.02, 0, 0] }),
      P('Aandrijfas', G.cyl('x', 0.009, 0.009, 0.108, 12), MAT.steel, { d: 'Pompas met spiebaan voor de rotor; het uiteinde steekt uit de neus van het voorhuis en draagt de poelie.', p: [-0.0375, 0, 0], ex: [-0.095, 0, 0] }),
      A('Pompelement', { d: 'Pompelement: nokring, rotor met tien schoepen, drukplaat, lager en asafdichting van de pompas.', ex: [-0.035, 0, 0], inner: true }, [
        P('Nokring', ring, MAT.steel, { d: 'Ring met ovale binnenzijde waarlangs de schoepen glijden; door de ovale vorm ontstaan twee pompkamers.', ex: [0, 0, 0] }),
        A('Lager en asafdichting', { d: 'Kogellager en radiale asafdichting van de pompas in de neus van het voorhuis.', ex: [-0.06, 0, 0] }, [
          P('Kogellager', annulus(0.009, 0.0185, 0.01, 'x', 20), MAT.bearing, { d: 'Kogellager van de pompas.', p: [-0.025, 0, 0], ex: [0.0, 0, 0] }),
          P('Asafdichting', annulus(0.009, 0.0165, 0.006, 'x', 20), MAT.rubber, { d: 'Radiale asafdichting in de neus van het voorhuis.', p: [-0.053, 0, 0], ex: [-0.03, 0, 0] }),
        ]),
        A('Rotor met schoepen', { d: 'Rotor met tien schoepen (aantal geschat).', ex: [0.03, 0, 0] }, [
          P('Rotor', G.cyl('x', 0.0225, 0.0225, 0.016, 24), MAT.darkSteel, { d: 'Rotor met tien gleuven voor de schoepen, op de pompas.', p: [0.005, 0, 0], ex: [0, 0, 0] }),
          ...vanes,
        ]),
        P('Drukplaat', annulus(0.0095, 0.037, 0.004, 'x', 32), MAT.steel, { d: 'Plaat achter de nokring met de aanvoer- en afvoerpoorten.', p: [0.016, 0, 0], ex: [0.07, 0, 0] }),
      ]),
      A('Doorgaande bouten', { d: 'Drie bouten door het pomphuis naar de pompsteun.', ex: [-0.12, 0, 0] }, [0, 1, 2].map(boltAt)),
    ]),
    A('Stroomregelklep', { d: 'Stroomregel- en overdrukklep: houdt de oliestroom bij hoog toerental constant en begrenst de druk.', p: [0.03, 0, 0], ex: [0, 0, -0.035] }, [
      P('Plunjer', merge([G.cyl('z', 0.0085, 0.0085, 0.028, 14), xf(G.cyl('z', 0.0095, 0.0095, 0.004, 14), [0, 0, 0.007]), xf(G.cyl('z', 0.0095, 0.0095, 0.004, 14), [0, 0, -0.007])]), MAT.steel, { d: 'Plunjer met stuurkanten in de klepboring.', p: [0, 0, -0.026], ex: [0, 0, -0.02], inner: true }),
      P('Klepveer', engSpring(0.0065, 0.0009, 0.012, 5, 10, 'z'), MAT.steel, { d: 'Drukveer die de plunjer in de uitgangsstand houdt.', p: [0, 0, -0.046], ex: [0, 0, -0.04], inner: true }),
      P('Afdichtring plug', annulus(0.0065, 0.0125, 0.002, 'z', 20), MAT.copper, { d: 'Afdichtring onder de plug.', p: [0, 0, -0.053], ex: [0, 0, -0.065] }),
      P('Schroefplug', plug, MAT.darkSteel, { d: 'Plug die de klepboring sluit en de veer voorspant.', p: [0, 0, -0.0585], ex: [0, 0, -0.09] }),
    ]),
    A('Hogedrukaansluiting', { d: 'Aansluiting voor de hogedrukslang naar het stuurhuis: stalen pijpstomp met wartelmoer en ring.', p: [0.008, 0, 0.02], ex: [0, -0.04, 0] }, [
      P('Koperen ring', annulus(0.0055, 0.0105, 0.002, 'y', 16), MAT.copper, { d: 'Afdichtring onder de wartelmoer.', p: [0, -0.053, 0], ex: [0, -0.012, 0] }),
      P('Stalen pijpstomp', merge([G.cyl('y', 0.0045, 0.0045, 0.013, 10), xf(G.cyl('y', 0.0066, 0.0066, 0.003, 12), [0, -0.0035, 0])]), MAT.steel, { d: 'Korte stalen pijpstomp met olijf waarop de hogedrukslang wordt aangesloten.', p: [0, -0.0585, 0], ex: [0, -0.03, 0] }),
      P('Wartelmoer', engNut(0.0136, 0.008, 'y'), MAT.darkSteel, { d: 'Wartelmoer die de pijpstomp in het achterdeksel klemt.', p: [0, -0.058, 0], ex: [0, -0.06, 0] }),
    ]),
    P('Aanzuigstomp', G.lathe('z', [[0, 0.04], [0.0112, 0.04], [0.0112, 0.05], [0.0132, 0.0505], [0.0132, 0.0545], [0.0112, 0.055], [0.0108, 0.065], [0, 0.065]], 16, 'engPsInlet'), MAT.aluCast, { d: 'Aanzuigstomp met opstaande rand als klemzitting voor de zuigslang uit het reservoir.', p: [-0.03, 0, 0], ex: [0, 0, 0.06] }),
    A('Pompsteun', { d: 'Aluminium steun tussen de accessoiresteun op het blok en de pomp, met twee bouten.', ex: [0.1, 0, 0] }, [
      P('Steun', plate, MAT.aluCast, { d: 'Gegoten steun die de pomp achter het achterdeksel draagt.', ex: [0, 0, 0] }),
      P('Bout pompsteun 1', hexBolt(0.032, 0.007, 'z'), MAT.darkSteel, { d: 'Bout van de pompsteun naar de accessoiresteun.', p: [0.065, -0.04, -0.11], r: [0, PI, 0], ex: [0, 0, 0.06] }),
      P('Bout pompsteun 2', hexBolt(0.032, 0.007, 'z'), MAT.darkSteel, { d: 'Tweede bout van de pompsteun naar de accessoiresteun.', p: [0.065, 0.0325, -0.11], r: [0, PI, 0], ex: [0, 0, 0.06] }),
    ]),
  ]);
}

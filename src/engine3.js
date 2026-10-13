/* ===================== motor F4Rt 811: dynamo, aircocompressor, sensoren, kabelboom, flexplaat, afdekkap ===================== */
// Dynamo en aircocompressor: lokaal frame met x langs de as; de poelie ligt in het multiriemvlak (lokaal x = XA - p[0]).
function buildAlternator(p) {
  const px = XA - p[0];
  const shieldF = G.lathe('x', [[0.017, -0.066], [0.05, -0.066], [0.06, -0.06], [0.062, -0.05], [0.062, -0.038], [0.058, -0.038], [0.056, -0.056], [0.017, -0.06]], 32, 'engAltShieldF');
  const shieldR = G.lathe('x', [[0.014, 0.034], [0.058, 0.034], [0.062, 0.036], [0.062, 0.058], [0.056, 0.07], [0.044, 0.079], [0.0, 0.081]], 32, 'engAltShieldR');
  const ears = cache('engAltEars', () => merge([xf(G.box(0.02, 0.026, 0.016), [-0.05, -0.068, -0.02]), xf(G.box(0.02, 0.026, 0.016), [0.045, -0.068, -0.02]), xf(G.box(0.02, 0.016, 0.026), [-0.05, 0.02, -0.064])]));
  const claw = cache('engClaw', () => merge([G.cyl('x', 0.044, 0.044, 0.008, 24), ...[0, 1, 2, 3, 4, 5].map(k => xf(G.box(0.024, 0.008, 0.016), [0.012, 0.04 * Math.cos(k * PI / 3), 0.04 * Math.sin(k * PI / 3)], [k * PI / 3, 0, 0]))]));
  const bolts = [0, 1, 2].map(k => { const a = PI / 6 + k * PI * 2 / 3; return P(`Doorgaande bout ${k + 1}`, hexBolt(0.145, 0.005, 'x'), MAT.steel, { d: 'Doorgaande bout die voor- en achterschild samentrekt.', p: [-0.067, 0.064 * Math.cos(a), 0.064 * Math.sin(a)], ex: [-0.12, 0, 0] }); });
  return A('Dynamo', { d: 'Valeo-dynamo (TG15C-reeks, 150 A) met vrijloop-poelie; de interne opbouw is schematisch weergegeven.', p, ex: [-0.04, 0.1, 0.08], spec: [['Type', 'Valeo TG15C'], ['Stroom', '150 A'], ['Poelie', 'Ø49 tot 50 mm, 7 groeven']] }, [
    A('Vrijlooppoelie', { d: 'Poelie met vrijloop die koppelstoten van de krukas opvangt.', p: [px, 0, 0], ex: [-0.16, 0, 0] }, [
      P('Buitenring met riemprofiel', engPolyV(0.0245, 0.025, 'Alt'), MAT.steel, { d: 'Buitenring met zeven groeven voor de multiriem.', ex: [0, 0, 0] }),
      P('Binnenring', annulus(0.009, 0.0135, 0.022, 'x', 18), MAT.steel, { d: 'Binnenring op de rotoras.', ex: [0, 0, 0.05] }),
      P('Klemrollen', merge([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => xf(G.cyl('x', 0.0016, 0.0016, 0.016, 6), [0, 0.0155 * Math.cos(k * PI / 5), 0.0155 * Math.sin(k * PI / 5)]))), MAT.bearing, { d: 'Klemrollen met veertjes van de vrijloop.', ex: [0, 0, 0.06] }),
      P('Stofdop', G.lathe('x', [[0, -0.004], [0.012, -0.004], [0.013, 0.0], [0.012, 0.002], [0, 0.002]], 18, 'engAltCap'), MAT.plastic, { d: 'Stofdop voor op de poelie.', p: [-0.016, 0, 0], ex: [-0.04, 0, 0] }),
    ]),
    P('Voorschild', merge([shieldF, ears]), MAT.aluCast, { d: 'Aluminium voorschild (aandrijfzijde) met bevestigingsogen en ventilatieopeningen.', ex: [-0.15, 0, 0] }),
    P('Voorlager', annulus(0.0085, 0.017, 0.01, 'x', 18), MAT.bearing, { d: 'Kogellager in het voorschild.', p: [-0.056, 0, 0], ex: [-0.125, 0, 0] }),
    P('Ventilator', merge([blades(8, 0.028, 0.054, 0.008, 0.0016, 0.3, 'x'), G.cyl('x', 0.054, 0.054, 0.0015, 24)]), MAT.steel, { d: 'Interne ventilator op de rotor voor de koeling.', p: [-0.033, 0, 0], ex: [-0.1, 0, 0] }),
    A('Rotor', { d: 'Klauwpoolrotor met veldspoel en sleepringen.', ex: [-0.07, 0, 0], inner: true }, [
      P('Rotoras', G.cyl('x', 0.0085, 0.0085, 0.15, 12), MAT.steel, { d: 'Rotoras.', p: [-0.01, 0, 0], ex: [0, 0, 0] }),
      P('Klauwpool voor', claw, MAT.darkSteel, { d: 'Klauwpool met zes vingers.', p: [-0.02, 0, 0], ex: [-0.03, 0, 0] }),
      P('Klauwpool achter', claw, MAT.darkSteel, { d: 'Tweede klauwpool, vingers in elkaar grijpend.', p: [0.02, 0, 0], r: [PI / 6, PI, 0], ex: [0.03, 0, 0] }),
      P('Veldspoel', G.cyl('x', 0.03, 0.03, 0.026, 20), MAT.copper, { d: 'Bekrachtigingsspoel tussen de klauwpolen.', ex: [0, 0.06, 0] }),
      P('Sleepringen', merge([xf(G.cyl('x', 0.0085, 0.0085, 0.004, 14), [0.044, 0, 0]), xf(G.cyl('x', 0.0085, 0.0085, 0.004, 14), [0.05, 0, 0]), xf(G.cyl('x', 0.007, 0.007, 0.012, 10), [0.047, 0, 0])]), MAT.copper, { d: 'Twee koperen sleepringen waarover de koolborstels lopen.', ex: [0.05, 0, 0] }),
    ]),
    P('Stator', merge([annulus(0.047, 0.0605, 0.036, 'x', 32), xf(G.torus('x', 0.053, 0.005, 28, 5), [0.021, 0, 0]), xf(G.torus('x', 0.053, 0.005, 28, 5), [-0.021, 0, 0])]), MAT.darkSteel, { d: 'Stator: driefasewikkeling in een plaatpakket; het plaatpakket is van buiten zichtbaar tussen de beide schilden.', ex: [0, 0.11, 0] }),
    P('Achterlager', annulus(0.0065, 0.014, 0.008, 'x', 16), MAT.bearing, { d: 'Kogellager in het achterschild.', p: [0.04, 0, 0], ex: [0.05, 0, 0] }),
    P('Achterschild', merge([shieldR, xf(G.box(0.02, 0.026, 0.016), [0.05, -0.068, -0.02])]), MAT.aluCast, { d: 'Achterschild aan de sleepringzijde met de kunststof afdekkap.', ex: [0.08, 0, 0.03] }),
    P('Gelijkrichter', merge([annulus(0.016, 0.05, 0.004, 'x', 24), ...[0, 1, 2, 3, 4, 5].map(k => xf(G.cyl('x', 0.004, 0.004, 0.005, 8), [0.003, 0.034 * Math.cos(k * PI / 3 + 0.3), 0.034 * Math.sin(k * PI / 3 + 0.3)]))]), MAT.ecu, { d: 'Diodebrug met zes diodes die de wisselstroom gelijkricht.', p: [0.062, 0, 0], ex: [0.07, 0.04, 0.09], inner: true }),
    A('Spanningsregelaar', { d: 'Spanningsregelaar met koolborstelhouder.', ex: [0.07, 0.1, 0.03], inner: true }, [
      P('Borstelhouder', G.box(0.016, 0.03, 0.016), MAT.ecu, { d: 'Regelaar met borstelhouder.', p: [0.05, 0.025, 0], ex: [0, 0, 0] }),
      P('Koolborstel 1', G.box(0.004, 0.008, 0.005), MAT.blackGloss, { d: 'Koolborstel op de sleepring.', p: [0.044, 0.0125, 0], ex: [0, 0.03, -0.02] }),
      P('Koolborstel 2', G.box(0.004, 0.008, 0.005), MAT.blackGloss, { d: 'Tweede koolborstel.', p: [0.05, 0.0125, 0], ex: [0, 0.03, 0.02] }),
      P('Borstelveer 1', spring(0.0018, 0.0003, 0.008, 4), MAT.steel, { d: 'Veer die de koolborstel aandrukt.', p: [0.044, 0.021, 0], ex: [0, 0.05, -0.02] }),
      P('Borstelveer 2', spring(0.0018, 0.0003, 0.008, 4), MAT.steel, { d: 'Tweede borstelveer.', p: [0.05, 0.021, 0], ex: [0, 0.05, 0.02] }),
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
  return A('Motorafdekkap', { d: 'Kunststof afdekkap bovenop de motor met akoestische schuimlaag, op rubber nokken.', ex: [0, 0.62, -0.12] }, [
    P('Afdekkap', cap, MAT.plastic, { d: 'Kunststof afdekkap (vorm geschat).', p: [0, top - 0.0005, 0], ex: [0, 0, 0] }),
    P('Akoestische schuimlaag', G.rbox(0.38, 0.006, 0.2, 0.003), MAT.engFoam, { d: 'Schuimlaag aan de onderkant die motorgeluid dempt.', p: [0, top - 0.019, 0], ex: [0, -0.05, 0] }),
    ...grom.map(([x, z], k) => P(`Rubber nok ${k + 1}`, G.cyl('y', 0.0065, 0.0065, 0.024, 10), MAT.rubber, { d: 'Rubber nok waarop de afdekkap klemt.', p: [x, ENG_COVER_TOP + 0.012, z], ex: [0, -0.1, 0] })),
  ]);
}

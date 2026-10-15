/* ===================== motor F4Rt 813 (waarschijnlijk, zie beslissingen): distributie, hulpaandrijving, inlaat, turbo, smering, koeling ===================== */
// distributievlak (z, y) bij x = XT; looprichting van de riem; poelies met tandkopstraal
const TIM = [[0, 0, 0.0281, 1], [0.099, 0.093, 0.0255, 1], [CAMZ, CAMY, 0.0569, 1], [-CAMZ, CAMY, 0.0569, 1], [-0.11, 0.249, 0.028, 1], [-0.086, 0.089, 0.03, 1]];
// hulpaandrijvingsvlak (z, y) bij x = XA, in looprichting: krukaspoelie, aircocompressor, stuurpomp, dynamo, geleiderol, spanner (tegen de rug)
const ACC = [[0, 0, 0.07, 1], [0.15, -0.195, 0.0595, 1], [ENG_PS[2], ENG_PS[1], ENG_PS_R, 1], [0.205, 0.365, 0.0245, 1], [0.127, 0.23, 0.03, 1], [0.096, 0.11, 0.03, -1]];
function pulley(r, w, key) {
  return G.lathe('x', [[0.008, -w / 2], [r, -w / 2], [r, -w / 2 + 0.003], [r - 0.004, -w / 2 + 0.006], [r - 0.004, w / 2 - 0.006], [r, w / 2 - 0.003], [r, w / 2], [0.008, w / 2]], 28, key);
}
function engPolyV(r, w, key, seg = 32) {   // poelie met zeven groeven (multiriem)
  return cache('engPV' + key + '|' + seg, () => {
    const pts = [[0.01, -w / 2], [r + 0.002, -w / 2]];
    for (let k = 0; k < 7; k++) { const x0 = -w / 2 + 0.002 + k * (w - 0.004) / 7; pts.push([r, x0], [r - 0.0018, x0 + (w - 0.004) / 14]); }
    pts.push([r, w / 2 - 0.002], [r + 0.002, w / 2], [0.01, w / 2]);
    return G.lathe('x', pts, seg);
  });
}
// distributiekap in drie delen: band [y0, y1] van de omhullende rond de distributiewielen
function engTimingCover(y0, y1, hole) {
  const outer = engClip(circlesHull(TIM.map(([z, y, r]) => [z, y, r]), 0.017), y0, y1);
  const inner = engClip(circlesHull(TIM.map(([z, y, r]) => [z, y, r]), 0.013), y0 + 0.003, y1 - 0.003);
  const rim = shapeOf(outer); if (inner.length > 2) rim.holes.push(new THREE.Path(inner.map(p => new THREE.Vector2(p[0], p[1]))));
  const plate = shapeOf(outer); if (hole) plate.holes.push(circlePath(0, 0, 0.022));
  return merge([xf(side(rim, 0.058), [-0.2545, 0, 0]), xf(side(plate, 0.003), [-0.2845, 0, 0])]);
}
function buildTiming() {
  const belt = engBelt(TIM, 0.027, 0.004);
  return A('Distributie', { d: 'Getande distributieriem (126 tanden, 27 mm breed) die beide nokkenassen en de waterpomp synchroon met de krukas aandrijft; spanrol met excentriek en een geleiderol.', ex: [-0.38, 0.1, 0], spec: [['Riem', '126 tanden, 27 mm breed, 1200 mm'], ['Spoed', '9,525 mm'], ['Overbrenging', '2 : 1']] }, [
    P('Distributieriem', xf(belt.geo, [XT, 0, 0]), MAT.belt, { d: `HNBR-riem met glasvezelkoord en afgeronde tanden; riemlengte in het model ${Math.round(belt.len * 1000)} mm (opgave 1200 mm).`, ex: [-0.09, 0, 0] }),
    P('Krukastandwiel', gear(19, 0.0281, 0.0258, 0.03, 0.019, 'x'), MAT.steel, { d: 'Tandwiel met 19 tanden op de krukasneus (afgeleid uit de 2 : 1-overbrenging).', p: [XT, 0, 0], ex: [-0.045, -0.02, 0], spec: [['Tanden', '19 (geschat)']] }),
    P('Spie krukastandwiel', G.box(0.024, 0.004, 0.005), MAT.darkSteel, { d: 'Spie (clavette) die het krukastandwiel op de krukas vastzet.', p: [XT, 0.0205, 0], ex: [-0.03, 0.04, 0] }),
    P('Nokkenaswiel inlaat', merge([gear(38, 0.0569, 0.0545, 0.027, 0.012, 'x'), xf(G.cyl('x', 0.022, 0.022, 0.012, 20), [0.016, 0, 0])]), MAT.steel, { d: 'Distributiewiel van de inlaatnokkenas, 38 tanden (afgeleid). Volgens de Renault-persmap van 2007 heeft de F4Rt 811 vaste kleptiming en geen faseversteller; voor de 813 is dat niet apart bevestigd.', p: [XT, CAMY, CAMZ], ex: [-0.045, 0.02, 0.03], spec: [['Tanden', '38 (geschat)'], ['Kleptiming', 'vast']] }),
    P('Moer nokkenaswiel inlaat', engNut(0.016, 0.009, 'x'), MAT.darkSteel, { d: 'Moer van het inlaatnokkenaswiel; vervangen bij demontage.', p: [XT - 0.019, CAMY, CAMZ], ex: [-0.1, 0.02, 0.03] }),
    P('Nokkenaswiel uitlaat', merge([gear(38, 0.0569, 0.0545, 0.027, 0.012, 'x'), xf(G.cyl('x', 0.022, 0.022, 0.012, 20), [0.016, 0, 0])]), MAT.steel, { d: 'Distributiewiel van de uitlaatnokkenas, 38 tanden (afgeleid).', p: [XT, CAMY, -CAMZ], ex: [-0.045, 0.02, -0.03], spec: [['Tanden', '38 (geschat)']] }),
    P('Moer nokkenaswiel uitlaat', engNut(0.016, 0.009, 'x'), MAT.darkSteel, { d: 'Moer van het uitlaatnokkenaswiel; vervangen bij demontage.', p: [XT - 0.019, CAMY, -CAMZ], ex: [-0.1, 0.02, -0.03] }),
    A('Spanrol', { d: 'Halfautomatische spanrol met excentrische verstelling: bij het afstellen worden de merkstrepen uitgelijnd.', p: [XT, TIM[5][1], TIM[5][0]], ex: [-0.07, -0.02, -0.05] }, [
      P('Excentrische naaf met wijzer', merge([G.cyl('x', 0.012, 0.012, 0.034, 16), xf(G.box(0.003, 0.004, 0.026), [-0.017, 0.008, 0.012])]), MAT.steel, { d: 'Excentrische naaf; de wijzer geeft de juiste spanning aan.', ex: [0, 0, 0] }),
      P('Rol met kogellager', pulley(0.03, 0.028, 'engTens'), MAT.alu, { d: 'Gladde rol met kogellager.', ex: [-0.04, 0, 0] }),
      P('Borgmoer', engNut(0.014, 0.008, 'x'), MAT.darkSteel, { d: 'Borgmoer die de excentriek in de afgestelde stand vastzet.', p: [-0.021, 0, 0], ex: [-0.08, 0, 0] }),
    ]),
    A('Geleiderol', { d: 'Vaste geleiderol (galet enrouleur) in het riemverloop.', p: [XT, TIM[4][1], TIM[4][0]], ex: [-0.07, 0.03, -0.05] }, [
      P('Rol met lager', pulley(0.028, 0.028, 'engIdl'), MAT.alu, { d: 'Gladde rol met kogellager.', ex: [0, 0, 0] }),
      P('Bout geleiderol', hexBolt(0.04, 0.01, 'x'), MAT.darkSteel, { d: 'Bout van de geleiderol, aanhaalmoment 4,5 daN·m.', p: [-0.02, 0, 0], ex: [-0.07, 0, 0] }),
    ]),
    A('Distributiekappen', { d: 'Drie kunststof kappen: boven-, tussen- en onderkap.', ex: [-0.12, 0, 0] }, [
      P('Distributiekap boven', engTimingCover(0.27, 0.6, false), MAT.plastic, { d: 'Bovenste kap over de nokkenaswielen.', ex: [-0.03, 0.17, 0] }),
      P('Distributiekap midden', engTimingCover(0.13, 0.27, false), MAT.plastic, { d: 'Tussenkap langs de riem.', ex: [-0.05, 0, 0.2] }),
      P('Distributiekap onder', engTimingCover(-0.2, 0.13, true), MAT.plastic, { d: 'Onderkap rond het krukastandwiel en de waterpomppoelie.', ex: [-0.03, -0.17, 0] }),
    ]),
  ]);
}
function buildAccessory() {
  const belt = engBelt(ACC, 0.025, 0.0048);
  const bracket = cache('engAccBracket', () => merge([
    xf(front(shapeOf([[-0.215, -0.2], [-0.17, -0.2], [-0.17, 0.05], [-0.18, 0.2], [-0.19, 0.29], [-0.215, 0.29]]), 0.02), [0, 0, 0.115]),
    xf(G.cyl('z', 0.012, 0.012, 0.035, 12), [-0.205, 0.27, 0.142]), xf(G.cyl('z', 0.012, 0.012, 0.04, 12), [-0.205, -0.115, 0.145]), xf(G.cyl('z', 0.014, 0.014, 0.03, 12), [-0.2, 0.07, 0.14]),
  ]));
  const tp = ACC[5], piv = [0.045, 0.1];
  return A('Hulpaandrijving', { d: `Multiriem 7PK1795 die de aircocompressor, de stuurpomp en de dynamo aandrijft, met een automatische spanner op de rug en een vaste geleiderol. De riemloop in het model is korter (${Math.round(belt.len * 1000)} mm) dan de opgegeven 1795 mm, omdat de poelies in dit model dichter bij elkaar staan dan op de echte motor (plaats en diameters zijn geschat). Verder uit elkaar kan niet: de dynamo zit onder de motorkap, de aircocompressor tegen de stuurbekrachtigingsslangen en de bumper, de stuurpomp vast aan zijn slangaansluitingen, en de spanrol en de geleiderol tegen de veerpoot en de motorsteun. De riemaangedreven stuurpomp is aannemelijk voor deze motor.`, ex: [-0.42, -0.1, 0.26], spec: [['Riem', '7PK1795 (7 ribben, 1795 mm)'], ['Verbruikers', 'aircocompressor, stuurpomp (aannemelijk), dynamo']] }, [
    P('Multiriem', xf(belt.geo, [XA, 0, 0]), MAT.belt, { d: `Poly-V-riem met zeven ribben; de spanner drukt op de rug. Riemlengte in het model ${Math.round(belt.len * 1000)} mm, ${Math.round(1795 - belt.len * 1000)} mm korter dan de opgegeven 1795 mm (compacte poeliestand); de exacte riemloop is niet gevonden.`, ex: [-0.1, 0, 0] }),
    P('Krukaspoelie', merge([engPolyV(0.07, 0.026, 'Crank'), xf(G.cyl('x', 0.021, 0.021, 0.055, 20), [0.03, 0, 0]), xf(G.cyl('x', 0.05, 0.05, 0.004, 32), [0.012, 0, 0])]), MAT.darkSteel, { d: 'Krukaspoelie met zeven groeven (Ø140 mm geschat); of hij een trillingsdemper heeft is niet gevonden.', p: [XA, 0, 0], ex: [-0.06, -0.03, 0] }),
    P('Poeliebout krukas', hexBolt(0.06, 0.012, 'x'), MAT.darkSteel, { d: 'Krukaspoeliebout: aanhalen plus 115° ± 15°; herbruikbaar zolang de lengte onder de kop ≤ 49,1 mm is.', p: [XA - 0.015, 0, 0], ex: [-0.12, -0.03, 0] }),
    A('Automatische riemspanner', { d: 'Veerbelaste spanner die de multiriem op spanning houdt; te ontspannen met een 16 mm sleutel. Binnenwerk schematisch.', ex: [-0.07, 0.02, 0.06] }, [
      P('Spannerarm met veerhuis', merge([xf(G.cyl('x', 0.03, 0.03, 0.03, 20), [-0.31, piv[1], piv[0]]), rodBetween([-0.335, piv[1], piv[0]], [-0.335, tp[1], tp[0]], 0.009, 8), xf(G.cyl('x', 0.012, 0.012, 0.02, 12), [-0.335, tp[1], tp[0]])]), MAT.aluCast, { d: 'Arm met torsieveer en demping in het veerhuis.', ex: [0, 0, 0] }),
      P('Spannerrol', pulley(0.03, 0.027, 'engAccT'), MAT.alu, { d: 'Gladde rol met lager, tegen de rug van de riem.', p: [XA, tp[1], tp[0]], ex: [-0.05, 0, 0] }),
      P('Bevestigingsbout spanner', hexBolt(0.1, 0.01, 'x'), MAT.darkSteel, { d: 'Bout waarmee de spanner op de accessoiresteun zit.', p: [-0.335, piv[1], piv[0]], ex: [-0.09, 0, 0] }),
    ]),
    A('Geleiderol multiriem', { d: 'Vaste geleiderol in de multiriemloop.', p: [XA, ACC[4][1], ACC[4][0]], ex: [-0.06, 0.04, 0] }, [
      P('Rol met lager', pulley(0.03, 0.027, 'engAccI'), MAT.alu, { d: 'Gladde rol met lager.', ex: [0, 0, 0] }),
      P('Bout geleiderol', hexBolt(0.1, 0.01, 'x'), MAT.darkSteel, { d: 'Bout van de geleiderol, aanhaalmoment 5,8 daN·m.', p: [-0.018, 0, 0], ex: [-0.07, 0, 0] }),
    ]),
    P('Accessoiresteun', bracket, MAT.aluCast, { d: 'Multifunctionele steun op het blok waaraan dynamo, aircocompressor en spanner vastzitten; de stuurpomp zit via de pompsteun op dezelfde steun.', ex: [0.0, 0.0, 0.08] }),
    buildAlternator([-0.27, ACC[3][1], ACC[3][0]]),
    engBuildPump(),
    buildAcCompressor([-0.27, ACC[1][1], ACC[1][0]]),
  ]);
}

/* ---------- inlaat en injectie ---------- */
function buildIntake() {
  const runner = x => tube([[x, 0.29, 0.114], [x, 0.31, 0.15], [x, 0.29, 0.192], [x, 0.235, 0.224], [x, 0.185, 0.222]], 0.018, 24, 10);
  const plenum = cache('engPlenum', () => merge([
    xf(G.cyl('x', 0.046, 0.046, 0.42, 28), [0.005, 0.14, 0.21]), xf(G.cyl('x', 0.032, 0.032, 0.016, 20), [-0.207, 0.14, 0.21]),
    ...XC.map(runner), xf(G.box(0.42, 0.05, 0.012), [0, 0.29, 0.1135]),
    ...XC.map(x => xf(G.cyl('y', 0.009, 0.009, 0.014, 10), [x, 0.315, 0.138], [0.6, 0, 0])),
    ...[-0.088, 0.088].map(x => xf(G.box(0.016, 0.03, 0.016), [x, 0.322, 0.166])),
  ]));
  const portGasket = cache('engPortGasket', () => { const s = shapeOf(rrectPts(0.042, 0.034, 0.006)); s.holes.push(new THREE.Path(rrectPts(0.032, 0.026, 0.005).map(p => new THREE.Vector2(...p)))); return front(s, 0.0015); });
  const studs = [];
  [-0.176, -0.088, 0.088, 0.176].forEach((x, i) => [0.312, 0.268].forEach((y, j) => studs.push(P(`Tapeind met moer ${i * 2 + j + 1}`, engStudNut(0.036, 0.008, 0.012, 'z'), MAT.steel, { d: 'Tapeind in de kop met moer die het spruitstuk vastzet (aantal geschat).', p: [x, y, 0.112], ex: [0, 0, 0.05] }))));
  const T = ENG_TB, R = ENG_RAIL;
  const tbHousing = merge([G.lathe('x', [[0.03, -0.025], [0.036, -0.025], [0.036, 0.021], [0.03, 0.021]], 28, 'engTbBore'), xf(G.rbox(0.008, 0.08, 0.08, 0.008), [0.025, 0, 0]), xf(G.cyl('z', 0.017, 0.017, 0.05, 16), [0, -0.05, 0.004]), xf(G.rbox(0.03, 0.09, 0.02, 0.005), [0, -0.022, 0.044])]);
  const inj = cache('engInjBody', () => merge([G.lathe('y', [[0.0058, 0], [0.0065, -0.004], [0.0065, -0.045], [0.0048, -0.05], [0.0042, -0.062], [0.0025, -0.065], [0, -0.065]], 12)]));
  const injectors = XC.map((x, i) => A(`Verstuiver ${i + 1}`, { d: `Injector van cilinder ${i + 1} (bovenaanvoer) die brandstof in het inlaatkanaal spuit; naaldventiel en filtergaasje schematisch.`, p: [x, R[1] - 0.006, R[2]], r: [0.61, 0, 0], ex: [0, 0.07, 0.05] }, [
    P('Injectorlichaam', inj, MAT.plasticGrey, { d: 'Huis met naaldventiel en sproeier.', ex: [0, 0, 0] }),
    P('Spoel met stekker', cache('engInjCoil', () => merge([xf(G.cyl('y', 0.0085, 0.0085, 0.02, 14), [0, -0.022, 0]), xf(G.rbox(0.012, 0.014, 0.016, 0.003), [0, -0.016, -0.012])])), MAT.plastic, { d: 'Magneetspoel met stekker die de naald opent.', ex: [0, 0, 0.035] }),
    P('O-ring boven', engORing(0.0062, 0.0012), MAT.rubber, { d: 'O-ring die de injector in de rail afdicht.', p: [0, -0.004, 0], ex: [0, 0.025, 0] }),
    P('O-ring onder', engORing(0.0048, 0.0011), MAT.rubber, { d: 'O-ring die de injector in het inlaatkanaal afdicht.', p: [0, -0.058, 0], ex: [0, -0.025, 0] }),
    P('Borgclip', G.torus('y', 0.0072, 0.0009, 16, 4, PI * 1.5), MAT.steel, { d: 'Clip die de injector aan de railbeker vastzet.', p: [0, 0.002, 0], ex: [0, 0.04, -0.015] }),
  ]));
  return A('Inlaat en injectie', { d: 'Kunststof inlaatspruitstuk met vier kanalen, elektronisch gasklephuis en meerpuntsinjectie in het inlaatkanaal (geen directe inspuiting).', ex: [0.05, 0.22, 0.48] }, [
    A('Inlaatspruitstuk', { d: 'Kunststof spruitstuk (répartiteur) dat de gekoelde laadlucht over de vier cilinders verdeelt.', ex: [0, 0, 0.06] }, [
      P('Plenum met inlaatkanalen', plenum, MAT.plastic, { d: 'Verdeelkamer met vier inlaatkanalen, flens en injectorbekers.', ex: [0, 0, 0] }),
      P('Spruitstukpakkingen', merge(XC.map(x => xf(portGasket, [x, 0.29, 0.1068]))), MAT.rubber, { d: 'Vier pakkingringen tussen spruitstuk en inlaatpoorten (uitvoering schematisch).', ex: [0, 0, -0.03] }),
      A('Tapeinden spruitstuk', { d: 'Acht tapeinden met moeren.', ex: [0, 0, 0.04] }, studs),
    ]),
    P('Inlaatdruksensor', merge([G.rbox(0.03, 0.024, 0.016, 0.004), xf(G.rbox(0.014, 0.012, 0.014, 0.003), [0.016, 0, 0.004]), xf(G.cyl('z', 0.005, 0.005, 0.012, 10), [0, 0, -0.012])]), MAT.plastic, { d: 'MAP-sensor: meet de (laad)druk in het spruitstuk.', p: [0.09, 0.15, 0.262], ex: [0, 0.03, 0.07] }),
    P('Inlaatluchttemperatuursensor', merge([G.cyl('z', 0.007, 0.007, 0.022, 10), xf(G.rbox(0.016, 0.014, 0.012, 0.003), [0, 0, 0.012])]), MAT.plastic, { d: 'Meet de temperatuur van de laadlucht in het spruitstuk.', p: [-0.09, 0.15, 0.262], ex: [0, 0.03, 0.07] }),
    P('Vacuümaansluiting rembekrachtiger', merge([G.cyl('z', 0.006, 0.006, 0.026, 10), xf(G.torus('z', 0.006, 0.0015, 12, 4), [0, 0, 0.01])]), MAT.plasticGrey, { d: 'Nippel voor de vacuümslang naar de rembekrachtiger.', p: [0.17, 0.12, 0.264], ex: [0, -0.02, 0.07] }),
    A('Gasklephuis', { d: 'Elektronisch bediend gasklephuis (drive-by-wire); binnenwerk schematisch weergegeven.', p: T, ex: [-0.15, 0, 0.03] }, [
      P('Huis', tbHousing, MAT.alu, { d: 'Aluminium huis met doorlaat, motorkamer en tandwielkamer.', ex: [0, 0, 0] }),
      P('Vlinderklep', G.cyl('x', 0.0295, 0.0295, 0.0015, 24), MAT.steel, { d: 'Gasklep die de luchtstroom doseert.', r: [0, 0, 0.14], ex: [-0.06, 0, 0] }),
      P('Klepas', G.cyl('z', 0.004, 0.004, 0.084, 8), MAT.steel, { d: 'As van de gasklep.', ex: [0, 0, 0.09] }),
      P('Terugstelveer', engSpring(0.008, 0.0011, 0.012, 3, 10, 'z'), MAT.steel, { d: 'Veer die de klep zonder stroom in de noodloopstand terugzet.', p: [0, 0, -0.044], ex: [0, 0, -0.05] }),
      P('Gelijkstroommotor', merge([G.cyl('z', 0.015, 0.015, 0.045, 16), xf(G.cyl('z', 0.002, 0.002, 0.01, 6), [0, 0, 0.027])]), MAT.darkSteel, { d: 'Elektromotor die de gasklep via de tandwielen verdraait.', p: [0, -0.05, 0.002], ex: [0, -0.05, 0] , inner: true }),
      P('Tussentandwiel', gear(22, 0.012, 0.0105, 0.004, 0.002, 'z'), MAT.plasticGrey, { d: 'Tussenwiel van de tandwielreductie.', p: [0, -0.028, 0.047], ex: [0, -0.02, 0.06] }),
      P('Sectortandwiel', gear(44, 0.022, 0.0205, 0.004, 0.004, 'z'), MAT.plasticGrey, { d: 'Tandwiel op de klepas (in werkelijkheid een sector).', p: [0, 0, 0.049], ex: [0, 0, 0.075] }),
      P('Positiesensor 1', G.rbox(0.008, 0.01, 0.004, 0.001), MAT.ecu, { d: 'Eerste klepstandsensor; twee sensoren voor redundantie.', p: [0, 0.008, 0.056], ex: [0, 0.03, 0.1] }),
      P('Positiesensor 2', G.rbox(0.008, 0.01, 0.004, 0.001), MAT.ecu, { d: 'Tweede klepstandsensor.', p: [0, -0.008, 0.056], ex: [0, -0.03, 0.1] }),
      P('Deksel met stekker', merge([G.rbox(0.034, 0.092, 0.008, 0.004), xf(G.rbox(0.02, 0.016, 0.02, 0.003), [0, -0.05, 0.006])]), MAT.plastic, { d: 'Kunststof deksel van de tandwielkamer met de sensoren en de stekker.', p: [0, -0.022, 0.06], ex: [0, 0, 0.13] }),
      P('Pakking gasklephuis', (() => { const s = shapeOf(rrectPts(0.07, 0.07, 0.008)); s.holes.push(circlePath(0, 0, 0.031)); return cache('engTbGasket', () => side(s, 0.0015)); })(), MAT.rubber, { d: 'Pakking tussen gasklephuis en spruitstuk.', p: [0.03, 0, 0], ex: [0.04, 0, 0] }),
      A('Bouten gasklephuis', { d: 'Vier bouten van het gasklephuis.', ex: [-0.03, 0, 0] }, [[0.03, 0.03], [0.03, -0.03], [-0.03, 0.03], [-0.03, -0.03]].map(([y, z], k) => P(`Bout ${k + 1}`, hexBolt(0.028, 0.006, 'x'), MAT.darkSteel, { d: 'Bout van het gasklephuis.', p: [0.021, y, z], ex: [-0.07, 0, 0] }))),
    ]),
    A('Brandstofrail', { d: 'Rail die de brandstof over de vier injectoren verdeelt; retourloos systeem met de drukregelaar in de tank.', p: R, ex: [0, 0.14, 0.09] }, [
      P('Rail', merge([G.cyl('x', 0.009, 0.009, 0.38, 14), ...XC.map(x => xf(G.cyl('y', 0.0105, 0.0105, 0.016, 12), [x, -0.012, 0])), ...[-0.088, 0.088].map(x => xf(G.box(0.016, 0.006, 0.03), [x, -0.012, 0.012])), xf(G.cyl('y', 0.006, 0.006, 0.024, 10), [0.2, -0.012, 0])]), MAT.steel, { d: 'Brandstofrail met vier injectorbekers en twee bevestigingsogen.', ex: [0, 0, 0] }),
      P('Schraderventiel', merge([G.cyl('y', 0.004, 0.004, 0.014, 8), xf(G.cyl('y', 0.0055, 0.0055, 0.008, 8), [0, 0.01, 0])]), MAT.plastic, { d: 'Testnippel met dop om de brandstofdruk te meten.', p: [-0.1, 0.013, 0], ex: [0, 0.05, 0] }),
      P('Snelkoppeling', merge([G.cyl('y', 0.0085, 0.0085, 0.02, 12), xf(G.rbox(0.02, 0.008, 0.02, 0.003), [0, 0.004, 0])]), MAT.plasticGrey, { d: 'Snelkoppeling van de brandstofaanvoerleiding.', p: [0.205, -0.034, 0], ex: [0.04, -0.04, 0] }),
      P('Railbout 1', hexBolt(0.03, 0.007), MAT.darkSteel, { d: 'Bout van de brandstofrail.', p: [-0.088, -0.009, 0.018], r: [PI, 0, 0], ex: [0, 0.05, 0] }),
      P('Railbout 2', hexBolt(0.03, 0.007), MAT.darkSteel, { d: 'Bout van de brandstofrail.', p: [0.088, -0.009, 0.018], r: [PI, 0, 0], ex: [0, 0.05, 0] }),
    ]),
    ...injectors,
  ]);
}

/* ---------- turbo en uitlaatspruitstuk ---------- */
function buildTurbo() {
  const TP = ENG_TURBO, tIn = [TP[0] - 0.045, TP[1] + 0.071, TP[2] + 0.03];   // inlaatflens turbine (twin-scroll)
  const coll = [xf(G.box(0.43, 0.048, 0.01), [0, 0.285, -0.111]), xf(G.rbox(0.07, 0.012, 0.06, 0.004), [tIn[0], tIn[1] + 0.006, tIn[2]])];
  // twee gescheiden kanalen: cilinders 1+4 en 2+3
  const scrollX = [tIn[0] + 0.013, tIn[0] - 0.013, tIn[0] - 0.013, tIn[0] + 0.013];
  XC.forEach((x, i) => coll.push(tube([[x, 0.285, -0.108], [x, 0.278, -0.14], [x * 0.55 + scrollX[i] * 0.45, 0.25, -0.185], [scrollX[i], tIn[1] + 0.014, tIn[2]]], 0.017, 24, 10)));
  const shield = cache('engManShield', () => { const pts = []; for (let k = 0; k <= 10; k++) { const a = k / 10; pts.push([-0.108 - a * 0.15, 0.335 - a * a * 0.07]); } for (let k = 10; k >= 0; k--) { const a = k / 10; pts.push([-0.108 - a * 0.15, 0.338 - a * a * 0.07]); } return side(shapeOf(pts), 0.4); });
  const studs = [];
  XC.forEach((x, i) => [0.31, 0.26].forEach((y, j) => {
    const k = i * 2 + j + 1, xx = x + (j ? -0.028 : 0.028);
    studs.push(P(`Tapeind met moer ${k}`, engStudNut(0.04, 0.008, -0.008, 'z'), MAT.steel, { d: 'Tapeind in de cilinderkop met spruitstukmoer; de moeren worden bij demontage vervangen (aantal geschat).', p: [xx, y, -0.112], ex: [0, 0.03, -0.05] }));
  }));
  const mGasket = cache('engManGasket', () => { const s = shapeOf(rrectPts(0.43, 0.048, 0.006)); XC.forEach(x => s.holes.push(new THREE.Path(rrectPts(0.036, 0.03, 0.008).map(p => new THREE.Vector2(p[0] + x, p[1]))))); return front(s, 0.0015); });
  return A('Turbo en uitlaatspruitstuk', { d: 'Twin-scroll uitlaatspruitstuk met de Mitsubishi TD04-turbo laag achter op het blok; de voorkatalysator zit direct op de turbine.', ex: [0.36, 0.22, -0.32] }, [
    P('Uitlaatspruitstuk', merge(coll), MAT.iron, { d: 'Gegoten twin-scroll spruitstuk: twee gescheiden kanalen (cilinders 1+4 en 2+3) naar de dubbele turbine-inlaat.', ex: [0, 0, 0] }),
    P('Spruitstukpakking', xf(mGasket, [0, 0.285, -0.1065]), MAT.heat, { d: 'Meerlaagse pakking tussen kop en spruitstuk (uitvoering schematisch).', ex: [0, 0, 0.03] }),
    A('Bevestiging spruitstuk', { d: 'Acht tapeinden met moeren.', ex: [0, 0.03, -0.03] }, studs),
    P('Hitteschild spruitstuk', shield, MAT.heat, { d: 'Hitteschild boven het spruitstuk.', ex: [0, 0.14, -0.03] }),
    buildTurbocharger(),
  ]);
}
function engSolenoidGeo() { return cache('engSolenoid', () => merge([G.cyl('y', 0.012, 0.012, 0.03, 14), xf(G.rbox(0.014, 0.012, 0.016, 0.003), [0, 0.01, 0.014]), xf(G.cyl('x', 0.003, 0.003, 0.03, 6), [0, -0.006, 0])])); }
function buildTurbocharger() {
  const wheel = (n, rIn, rOut, h, tw, key) => cache(key, () => merge([blades(n, rIn, rOut, h, 0.0016, tw, 'x'), G.lathe('x', [[0, -h / 2], [rIn + 0.004, -h / 2], [0.006, h / 2], [0, h / 2]], 20)]));
  const tHouse = merge([G.torus('x', 0.042, 0.024, 36, 10), G.cyl('x', 0.03, 0.03, 0.05, 24), xf(G.cyl('x', 0.031, 0.031, 0.034, 20), [-0.022, 0, 0]), xf(G.rbox(0.05, 0.03, 0.05, 0.006), [0, 0.056, 0.03])]);
  const cHouse = merge([G.torus('x', 0.045, 0.022, 36, 10), G.cyl('x', 0.028, 0.028, 0.04, 24), xf(G.lathe('x', [[0.021, 0], [0.032, 0], [0.033, 0.045], [0.027, 0.045]], 24), [0.002, 0, 0]), xf(G.cyl('y', 0.021, 0.021, 0.05, 16), [0, 0.054, -0.036])]);
  const flange = cache('engTurbOutFlange', () => merge([side(shapeOf(circlesHull([[0.034, 0, 0.012], [-0.017, 0.03, 0.012], [-0.017, -0.03, 0.012]], 0)), 0.008), ...[[0.034, 0], [-0.017, 0.03], [-0.017, -0.03]].map(([z, y]) => xf(G.cyl('x', 0.004, 0.004, 0.03, 8), [-0.012, y, z]))]));
  const TP = ENG_TURBO;
  const tm = [[0.02, 0.02], [-0.02, 0.02], [0.02, -0.02], [-0.02, -0.02]];
  return A('Turbocompressor', { d: 'Mitsubishi TD04 (referentie 49377-07303, aannemelijk voor deze motor): de uitlaatgassen drijven het turbinewiel, dat via één as het compressorwiel laat draaien. Interne wastegate, watergekoeld lagerhuis. De wieldiameters in het model (turbine circa 47 mm, compressor circa 53 mm) zijn geschat uit de TD04-reeks.', p: TP, ex: [0.02, -0.05, -0.14], spec: [['Type', 'Mitsubishi TD04'], ['Referentie', '49377-07303 (aannemelijk)']] }, [
    A('Turbinehuis', { d: 'Twin-scroll turbinehuis van hittebestendig gietstaal met interne wastegate.', p: [-0.045, 0, 0], ex: [-0.1, 0, 0] }, [
      P('Turbinehuis', tHouse, MAT.iron, { d: 'Slakkenhuis met twee gescheiden inlaten; hier komen de hete gassen binnen.', ex: [0, 0, 0] }),
      P('Wastegateklep met as', merge([xf(G.cyl('x', 0.011, 0.011, 0.003, 14), [-0.038, 0.014, 0]), xf(G.cyl('z', 0.0025, 0.0025, 0.05, 8), [-0.034, 0.024, 0.02])]), MAT.darkSteel, { d: 'Klepje dat een omloop langs het turbinewiel opent en zo de laaddruk begrenst.', ex: [-0.04, 0.02, 0] }),
      P('Wastegatehefboom', merge([xf(G.box(0.006, 0.026, 0.004), [-0.034, 0.012, 0.046]), xf(G.cyl('x', 0.003, 0.003, 0.01, 8), [-0.034, 0.0, 0.046])]), MAT.steel, { d: 'Hefboom op de wastegate-as waaraan de actuatorstang trekt.', ex: [0, 0, 0.04] }),
      P('Uitlaatflens met tapeinden', flange, MAT.iron, { d: 'Driegatsflens waarop de voorkatalysator met drie moeren vastzit.', p: [-0.038, 0, 0], ex: [-0.06, 0, 0] }),
    ]),
    A('Lager- en rotorgroep', { d: 'Middenstuk (CHRA) met het watergekoelde lagerhuis, de as, beide wielen en de lagers; binnenwerk schematisch weergegeven.', ex: [0, 0.06, -0.06] }, [
      P('Lagerhuis', merge([G.cyl('x', 0.026, 0.026, 0.05, 20), xf(G.cyl('y', 0.008, 0.008, 0.012, 10), [0, 0.03, 0]), xf(G.rbox(0.022, 0.012, 0.022, 0.004), [0, -0.03, 0]), xf(G.cyl('z', 0.006, 0.006, 0.016, 8), [0.005, 0, 0.027]), xf(G.cyl('z', 0.006, 0.006, 0.016, 8), [-0.005, 0, -0.027])]), MAT.aluCast, { d: 'Lagerhuis met olie-ingang, olie-uitgang en twee koelwateraansluitingen.', ex: [0, 0, 0] }),
      P('Turbinewiel met as', merge([xf(wheel(11, 0.008, 0.0235, 0.022, 0.3, 'engTurbW'), [-0.045, 0, 0]), xf(G.cyl('x', 0.0045, 0.0045, 0.105, 10), [0.0075, 0, 0])]), MAT.darkSteel, { d: 'Turbinewiel van hittebestendige nikkellegering, vast aan de as (geschat circa Ø47 mm).', ex: [-0.11, 0, 0] }),
      P('Compressorwiel', wheel(12, 0.007, 0.0265, 0.024, -0.35, 'engCompW'), MAT.alu, { d: 'Aluminium compressorwiel dat lucht aanzuigt en samenperst (geschat circa Ø53 mm).', p: [0.05, 0, 0], ex: [0.09, 0, 0] }),
      P('Asmoer', engNut(0.006, 0.005, 'x'), MAT.steel, { d: 'Moer die het compressorwiel op de as klemt.', p: [0.0645, 0, 0], ex: [0.11, 0, 0] }),
      P('Glijlager turbinezijde', annulus(0.0046, 0.0075, 0.01, 'x', 16), MAT.bearing, { d: 'Zwevende glijlagerbus aan de turbinezijde.', p: [-0.015, 0, 0], ex: [-0.02, 0.05, 0], inner: true }),
      P('Glijlager compressorzijde', annulus(0.0046, 0.0075, 0.01, 'x', 16), MAT.bearing, { d: 'Zwevende glijlagerbus aan de compressorzijde.', p: [0.012, 0, 0], ex: [0.02, 0.05, 0], inner: true }),
      P('Axiaallagerset', merge([xf(annulus(0.0058, 0.016, 0.003, 'x', 20), [0.023, 0, 0]), xf(annulus(0.0046, 0.009, 0.004, 'x', 16), [0.0275, 0, 0])]), MAT.bearing, { d: 'Axiaallager: drukplaat en drukring die de as in lengterichting vasthouden.', ex: [0.045, -0.03, 0], inner: true }),
      P('Oliespatring', annulus(0.0046, 0.012, 0.003, 'x', 16), MAT.steel, { d: 'Spatring die olie wegslingert voordat ze bij de compressor komt.', p: [0.032, 0, 0], ex: [0.065, -0.03, 0], inner: true }),
      P('Zuigerveerafdichting compressorzijde', G.torus('x', 0.0062, 0.0006, 14, 4), MAT.darkSteel, { d: 'Zuigerveerafdichting van de as aan de compressorzijde.', p: [0.0355, 0, 0], ex: [0.08, -0.03, 0], inner: true }),
      P('Zuigerveerafdichting turbinezijde', G.torus('x', 0.0062, 0.0006, 14, 4), MAT.darkSteel, { d: 'Zuigerveerafdichting van de as aan de turbinezijde.', p: [-0.031, 0, 0], ex: [-0.075, -0.03, 0], inner: true }),
      P('Hitteschild turbinezijde', annulus(0.012, 0.034, 0.002, 'x', 24), MAT.heat, { d: 'Schild tussen turbinewiel en lagerhuis.', p: [-0.027, 0, 0], ex: [-0.05, -0.03, 0], inner: true }),
    ]),
    A('Compressorhuis', { d: 'Aluminium compressorhuis met omloopklep.', p: [0.055, 0, 0], ex: [0.11, 0, 0] }, [
      P('Compressorhuis', cHouse, MAT.aluCast, { d: 'Slakkenhuis aan de inlaatzijde; de uitlaat gaat via de laadluchtslang naar de intercooler.', ex: [0, 0, 0] }),
      P('Omloopklep', merge([G.cyl('z', 0.013, 0.013, 0.02, 14), xf(G.cyl('z', 0.003, 0.003, 0.016, 6), [0, 0, -0.016])]), MAT.darkSteel, { d: 'Pneumatische omloopklep (blow-off) die bij het dichtgaan van de gasklep de druk terug naar de inlaat laat; plaats op het huis niet bevestigd.', p: [0.004, -0.04, -0.058], ex: [0, -0.02, -0.05] }),
      P('Borgring compressorhuis', G.torus('x', 0.032, 0.0015, 28, 4), MAT.steel, { d: 'Borgring die het compressorhuis op het lagerhuis vastzet.', p: [-0.025, 0, 0], ex: [-0.04, 0, 0] }),
    ]),
    A('Wastegate-actuator', { d: 'Drukdoos die bij te hoge laaddruk via de stang de wastegate opent; binnenwerk schematisch.', ex: [0, -0.02, 0.09] }, [
      P('Drukdoos', merge([G.lathe('x', [[0, -0.012], [0.026, -0.01], [0.028, 0], [0.026, 0.012], [0, 0.014]], 24, 'engWgCan'), xf(G.box(0.03, 0.006, 0.05), [0.012, -0.03, 0])]), MAT.steel, { d: 'Stalen doos met steun op het compressorhuis.', p: [0.065, -0.012, 0.098], ex: [0, 0, 0] }),
      P('Membraan', G.cyl('x', 0.025, 0.025, 0.0012, 20), MAT.rubber, { d: 'Rubber membraan met steunplaat.', p: [0.065, -0.012, 0.098], ex: [0.03, 0, 0] }),
      P('Veer', engSpring(0.012, 0.0014, 0.02, 4, 12, 'x'), MAT.steel, { d: 'Veer die de wastegate dicht houdt tot de laaddruk hem overwint.', p: [0.062, -0.012, 0.098], ex: [0.06, 0, 0] }),
      P('Stang met oog', merge([rodBetween([0.05, -0.012, 0.098], [-0.079, 0.0, 0.05], 0.0022, 8), xf(G.torus('z', 0.004, 0.0013, 12, 4), [-0.079, 0.0, 0.05])]), MAT.steel, { d: 'Instelbare stang naar de wastegatehefboom.', ex: [-0.03, 0, 0.03] }),
      P('Borgclip', G.torus('x', 0.0035, 0.0007, 10, 4), MAT.steel, { d: 'Borgclip op de pen van de hefboom.', p: [-0.079, 0.0, 0.056], ex: [-0.03, 0, 0.06] }),
      P('Drukslangetje', tube([[0.078, -0.012, 0.098], [0.092, -0.01, 0.09], [0.1, 0.0, 0.07], [0.09, 0.02, 0.04]], 0.003, 16, 6), MAT.rubber, { d: 'Slangetje van het magneetventiel naar de drukdoos.', ex: [0.03, 0, 0.03] }),
    ]),
    P('Magneetventiel laaddrukregeling', engSolenoidGeo(), MAT.plastic, { d: 'Magneetventiel (électrovanne de wastegate) dat de druk op de drukdoos regelt.', p: [0.035, 0.035, -0.088], r: [HALF, 0, 0], ex: [0, 0.03, -0.08] }),
    P('Magneetventiel omloopklep', engSolenoidGeo(), MAT.plastic, { d: 'Tweede magneetventiel dat de omloopklep stuurt.', p: [0.085, 0.035, -0.088], r: [HALF, 0, 0], ex: [0, 0.03, -0.11] }),
    A('Turbobevestiging', { d: 'Vier tapeinden met moeren, pakking en turbosteun.', ex: [0, 0.09, 0.02] }, [
      ...tm.map(([dx, dz], k) => P(`Tapeind met moer ${k + 1}`, engStudNut(0.04, 0.008, -0.012, 'y'), MAT.steel, { d: 'Tapeind met moer tussen spruitstuk en turbine; moeren vervangen.', p: [-0.045 + dx, 0.075, 0.03 + dz], ex: [0, 0.05, 0] })),
      P('Pakking turbo-spruitstuk', G.rbox(0.068, 0.0012, 0.058, 0.0005), MAT.heat, { d: 'Pakking tussen spruitstuk en turbine-inlaat.', p: [-0.045, 0.0715, 0.03], ex: [0, 0.025, 0] }),
      P('Turbosteun', cache('engTurboStay', () => merge([rodBetween([-0.045, -0.06, 0.0], [-0.045, -0.105, 0.14], 0.007, 8), xf(G.box(0.03, 0.008, 0.02), [-0.045, -0.058, 0]), xf(G.box(0.03, 0.03, 0.006), [-0.045, -0.105, 0.143])])), MAT.darkSteel, { d: 'Steun (béquille) tussen turbine en blok.', ex: [0, -0.06, 0.03] }),
    ]),
    P('Koelwaterleiding toevoer', tube([[0.005, 0, 0.034], [0.01, 0.0, 0.08], [0.04, 0.01, 0.13], [0.05, 0.01, 0.148]], 0.0045, 24, 8), MAT.steel, { d: 'Koelvloeistof van het blok naar het lagerhuis.', ex: [0, 0.0, 0.08] }),
    P('Koelwaterleiding retour', tube([[-0.005, 0, -0.034], [-0.01, -0.045, -0.05], [-0.02, -0.075, 0.03], [-0.04, -0.07, 0.148]], 0.0045, 24, 8), MAT.steel, { d: 'Koelvloeistof van het lagerhuis terug naar het blok.', ex: [0, -0.05, 0.06] }),
    P('Hitteschild turbo', xf(G.half('x', 0.072, 0.085, HALF, 20), [-0.045, 0, 0]), MAT.heat, { d: 'Hitteschild met luchtkanaal aan de achterkant van de turbine.', ex: [0, 0.14, -0.1] }),
  ]);
}

/* ---------- smering ---------- */
function buildLube() {
  const pan = cache('engPan', () => merge([(() => { const g = plan(shapeOf(rrectPts(0.43, 0.21, 0.02)), 0.012); g.translate(0, -0.066, 0); return g; })(), (() => { const g = plan(shapeOf(rrectPts(0.41, 0.19, 0.03)), 0.098); g.translate(0, -0.121, 0); return g; })(), xf(G.rbox(0.36, 0.05, 0.17, 0.014), [0.01, -0.188, 0])]));
  const gasket = cache('engPanGasket', () => { const s = shapeOf(rrectPts(0.43, 0.21, 0.02)); s.holes.push(new THREE.Path(rrectPts(0.396, 0.176, 0.012).map(p => new THREE.Vector2(...p)))); const g = plan(s, 0.001); g.translate(0, -0.0605, 0); return g; });
  const bolts = [];
  [-0.18, -0.12, -0.06, 0, 0.06, 0.12, 0.18].forEach(x => [0.098, -0.098].forEach(z => bolts.push([x, z])));
  [[0.205, 0.05], [0.205, -0.05], [-0.205, 0.05], [-0.205, -0.05]].forEach(p => bolts.push(p));
  const PX = -0.198, PY = -0.115;           // as van de oliepomp (ketting in het vlak x = PX)
  const chain = engBelt([[0, 0, 0.031, 1], [0, PY, 0.031, 1]], 0.008, 0.006);
  const pick = cache('engPickup', () => tube([[-0.168, -0.135, 0.02], [-0.15, -0.165, 0.03], [-0.05, -0.178, 0.03], [0.03, -0.182, 0.02]], 0.0085, 20, 8));
  const PCV = [0.1, ENG_COVER_TOP + 0.008, -0.065];
  const sep = cache('engSeparator', () => merge([G.rbox(0.13, 0.016, 0.034, 0.006), xf(G.cyl('x', 0.007, 0.007, 0.018, 10), [0.072, 0.003, 0]), xf(G.cyl('z', 0.006, 0.006, 0.016, 10), [-0.05, 0.003, -0.022])]));
  return A('Smering', { d: 'Smeersysteem: carterpan, kettinggedreven tandwielpomp, aanzuigbuis met zeef, watergekoelde oliekoeler met spin-on filter, peilstok, turbo-olieleidingen en carterventilatie.', ex: [0, -0.55, -0.18], spec: [['Olie-inhoud', '5,4 l inclusief filter'], ['Filter', 'spin-on, M20 × 1,5']] }, [
    A('Carterpan', { d: 'Onderste carter met pakking en minimaal 18 bouten.', ex: [0, -0.12, 0] }, [
      P('Pan', pan, MAT.aluCast, { d: 'Carterpan: het oliereservoir onder het blok, met oliebak bij de vliegwielzijde.', ex: [0, 0, 0] }),
      P('Schotplaat', xf(G.box(0.3, 0.002, 0.15), [0.03, -0.085, 0]), MAT.steel, { d: 'Keerplaat in de pan die het klotsen van de olie tegengaat (schematisch).', ex: [0, 0.06, 0], inner: true }),
      P('Carterpakking', gasket, MAT.rubber, { d: 'Pakking tussen blok en pan.', ex: [0, 0.03, 0] }),
      A('Carterbouten', { d: 'Achttien bouten van de carterpan.', ex: [0, -0.04, 0] }, bolts.map(([x, z], k) => P(`Carterbout ${k + 1}`, hexBolt(0.025, 0.007), MAT.darkSteel, { d: 'Bout van de carterpan.', p: [x, -0.072, z], ex: [0, -0.03, 0] }))),
      P('Aftapplug', merge([G.cyl('y', 0.007, 0.007, 0.012, 10), xf(G.box(0.008, 0.006, 0.008), [0, -0.009, 0])]), MAT.steel, { d: 'Aftapplug met vierkante kop (vierkant 8).', p: [0.05, -0.207, 0.03], ex: [0, -0.08, 0] }),
      P('Koperring aftapplug', annulus(0.007, 0.011, 0.0015, 'y', 16), MAT.copper, { d: 'Koperen afdichtring van de aftapplug.', p: [0.05, -0.2138, 0.03], ex: [0, -0.05, 0] }),
    ]),
    A('Oliepomp', { d: 'Tandwielpomp met geïntegreerde overdrukklep, via een ketting door de krukas aangedreven; binnenwerk schematisch.', p: [PX, PY, 0], ex: [-0.06, -0.08, 0.12], inner: true }, [
      P('Pomphuis', merge([xf(G.rbox(0.034, 0.06, 0.07, 0.006), [0.03, -0.004, 0]), xf(G.cyl('y', 0.01, 0.01, 0.02, 10), [0.03, -0.04, 0.02])]), MAT.aluCast, { d: 'Pomphuis met aanzuig- en persopening.', ex: [0, 0, 0] }),
      P('Pompdeksel', G.rbox(0.005, 0.06, 0.07, 0.004), MAT.aluCast, { d: 'Deksel aan de kettingzijde.', p: [0.011, -0.004, 0], ex: [-0.035, 0, 0] }),
      P('Binnenrotor', gear(10, 0.018, 0.015, 0.014, 0.006, 'x'), MAT.steel, { d: 'Aangedreven binnenrotor op de pompas.', p: [0.022, 0, 0], ex: [-0.02, 0, 0.06] }),
      P('Buitenrotor', ringGear(11, 0.027, 0.019, 0.022, 0.014, 'x'), MAT.steel, { d: 'Meedraaiende buitenrotor.', p: [0.022, 0, 0], ex: [-0.02, 0, 0.1] }),
      P('Overdrukplunjer', G.cyl('z', 0.005, 0.005, 0.014, 10), MAT.steel, { d: 'Plunjer van de overdrukklep.', p: [0.03, -0.025, 0.03], ex: [0, 0, 0.05] }),
      P('Overdrukveer', engSpring(0.004, 0.0007, 0.016, 5, 6, 'z'), MAT.steel, { d: 'Veer die de maximale oliedruk bepaalt.', p: [0.03, -0.025, 0.046], ex: [0, 0, 0.075] }),
      P('Kettingwiel pomp', gear(24, 0.031, 0.027, 0.008, 0.006, 'x'), MAT.steel, { d: 'Kettingwiel op de pompas.', ex: [-0.06, 0, 0] }),
      P('Pompbout 1', hexBolt(0.05, 0.007, 'x'), MAT.darkSteel, { d: 'Bout waarmee de pomp onder het blok zit.', p: [0.012, 0.022, 0.025], ex: [-0.08, 0.02, 0] }),
      P('Pompbout 2', hexBolt(0.05, 0.007, 'x'), MAT.darkSteel, { d: 'Bout waarmee de pomp onder het blok zit.', p: [0.012, 0.022, -0.025], ex: [-0.08, 0.02, 0] }),
    ]),
    P('Oliepompketting', xf(chain.geo, [PX, 0, 0]), MAT.darkSteel, { d: 'Enkelvoudige ketting van krukas naar oliepomp.', ex: [-0.1, -0.03, 0.06], inner: true }),
    A('Aanzuigbuis met zeef', { d: 'Aanzuigbuis met zeef (crépine) die de olie onder in de pan opneemt.', ex: [0, -0.05, 0.14], inner: true }, [
      P('Aanzuigbuis', pick, MAT.steel, { d: 'Gebogen aanzuigbuis van zeef naar pomp.', ex: [0, 0, 0] }),
      P('Zeef', merge([xf(G.cyl('y', 0.036, 0.036, 0.008, 20), [0.045, -0.188, 0.02]), xf(G.cyl('y', 0.012, 0.012, 0.01, 12), [0.03, -0.182, 0.02])]), MAT.steel, { d: 'Zeef die grof vuil uit de olie houdt.', ex: [0.03, -0.03, 0] }),
      P('O-ring aanzuigbuis', engORing(0.0085, 0.0014), MAT.rubber, { d: 'Afdichting tussen aanzuigbuis en pomp.', p: [-0.168, -0.13, 0.02], ex: [-0.02, 0.03, 0] }),
      P('Bout aanzuigbuis', hexBolt(0.016, 0.006), MAT.darkSteel, { d: 'Bout van de aanzuigbuis.', p: [-0.06, -0.17, 0.045], r: [PI, 0, 0], ex: [0, 0.06, 0] }),
    ]),
    A('Oliekoeler', { d: 'Watergekoelde plaatkoeler tussen blok en oliefilter (circa 122 × 99 × 48 mm, 8 platen).', p: [0.03, 0.015, 0.112], ex: [0, 0, 0.12] }, [
      P('Platenpakket', merge([front(shapeOf(rrectPts(0.09, 0.09, 0.02, 3)), 0.006), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => xf(front(shapeOf(rrectPts(0.084, 0.084, 0.018, 3)), 0.0035), [0, 0, 0.007 + k * 0.0045])), xf(G.cyl('z', 0.016, 0.016, 0.046, 16), [0, 0, 0.02])]), MAT.steel, { d: 'Pakket van acht stalen platen waarin olie en koelvloeistof elkaar kruisen.', ex: [0, 0, 0.02] }),
      P('Pakking oliekoeler', G.torus('z', 0.03, 0.0016, 28, 4), MAT.rubber, { d: 'Pakking tussen koeler en blok.', p: [0, 0, -0.002], ex: [0, 0, -0.02] }),
      P('Centrale nippel', merge([G.cyl('z', 0.0095, 0.0095, 0.07, 12), xf(G.cyl('z', 0.013, 0.013, 0.006, 6), [0, 0, 0.044])]), MAT.steel, { d: 'Holle nippel (M20 × 1,5) die de koeler vastzet en waarop het filter draait.', p: [0, 0, 0.022], ex: [0, 0, 0.13] }),
      P('Waterslangaansluiting toevoer', tube([[0.04, 0.03, 0.02], [0.06, 0.04, 0.022], [0.075, 0.045, 0.03]], 0.0055, 10, 8), MAT.steel, { d: 'Aansluiting voor de koelvloeistofslang.', ex: [0.04, 0.02, 0] }),
      P('Waterslangaansluiting retour', tube([[-0.04, 0.03, 0.02], [-0.06, 0.04, 0.022], [-0.075, 0.045, 0.03]], 0.0055, 10, 8), MAT.steel, { d: 'Tweede aansluiting voor de koelvloeistofslang.', ex: [-0.04, 0.02, 0] }),
    ]),
    A('Oliefilter', { d: 'Spin-on oliefilter aan de voorkant van het blok, ongeveer in het midden: Ø76 tot 77 mm, 52 tot 57 mm hoog.', p: [0.03, 0.015, 0.159], ex: [0, 0, 0.24], spec: [['Afmeting', 'Ø76 tot 77 × 52 tot 57 mm'], ['Draad', 'M20 × 1,5'], ['Afdichtring', 'Ø61 mm'], ['Bypassklep', 'opent bij 1 bar']] }, [
      P('Filterhuis', merge([G.lathe('z', [[0.012, 0], [0.0365, 0], [0.038, 0.004], [0.038, 0.046], [0.034, 0.054], [0, 0.056]], 28, 'engOilFilter'), ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => xf(G.box(0.004, 0.003, 0.03), [0.038 * Math.cos(k * PI / 5), 0.038 * Math.sin(k * PI / 5), 0.03], [0, 0, k * PI / 5]))]), MAT.oilFilter, { d: 'Stalen huis met papieren element, terugslagklep en bypassklep.', ex: [0, 0, 0] }),
      P('Filterelement', merge([annulus(0.012, 0.03, 0.044, 'z', 20)]), MAT.filter, { d: 'Geplooid papieren filterelement.', p: [0, 0, 0.027], ex: [0, 0, 0.08], inner: true }),
      P('Afdichtring filter', G.torus('z', 0.0305, 0.0018, 28, 5), MAT.rubber, { d: 'Rubber afdichtring Ø61 mm.', p: [0, 0, -0.001], ex: [0, 0, -0.03] }),
    ]),
    A('Peilstok', { d: 'Peilstok met geleidebuis aan de voorzijde van het blok; de exacte plaats voor de Laguna III is niet gevonden.', ex: [0, 0.14, 0.1] }, [
      P('Peilstok', merge([tube([[0.205, 0.0, 0.112], [0.205, 0.2, 0.128], [0.205, 0.385, 0.142]], 0.002, 16, 5), xf(G.torus('z', 0.012, 0.0035, 18, 6), [0.205, 0.402, 0.143]), xf(G.cyl('y', 0.005, 0.005, 0.012, 8), [0.205, 0.388, 0.142])]), MAT.handle, { d: 'Peilstok met gele greep.', ex: [0, 0.12, 0] }),
      P('Geleidebuis', tube([[0.205, -0.02, 0.11], [0.205, 0.2, 0.128], [0.205, 0.38, 0.142]], 0.0055, 20, 8), MAT.plastic, { d: 'Geleidebuis van de peilstok.', ex: [0, 0, 0] }),
      P('O-ring geleidebuis', engORing(0.0058, 0.0012), MAT.rubber, { d: 'Afdichting van de geleidebuis in het blok.', p: [0.205, 0.004, 0.112], ex: [0, -0.04, 0.02] }),
      P('Beugel peilstokbuis', merge([G.box(0.012, 0.01, 0.026), xf(hexBolt(0.012, 0.005, 'z'), [0, 0, -0.016], [PI, 0, 0])]), MAT.steel, { d: 'Beugel die de buis aan de kop vastzet.', p: [0.205, 0.28, 0.122], ex: [0, 0, 0.05] }),
    ]),
    P('Oliedrukschakelaar', merge([G.cyl('z', 0.011, 0.011, 0.01, 6), xf(G.cyl('z', 0.009, 0.009, 0.014, 12), [0, 0, 0.012]), xf(G.cyl('z', 0.002, 0.002, 0.008, 6), [0, 0, 0.022])]), MAT.steel, { d: 'Schakelaar die het oliedrukwaarschuwingslampje aanstuurt (plaats schematisch).', p: [0.135, 0.07, 0.11], ex: [0, 0, 0.09] }),
    A('Olietoevoer turbo', { d: 'Olietoevoerleiding van het blok naar het turbolagerhuis, met holle bouten en koperringen.', ex: [0, 0.06, -0.1] }, [
      P('Olietoevoerleiding', tube([[0.12, 0.1, -0.11], [0.12, 0.17, -0.16], [0.09, 0.2, -0.23], [0.07, 0.188, -0.255]], 0.003, 24, 6), MAT.steel, { d: 'Stalen olieleiding met banjo-aansluitingen.', ex: [0, 0, 0] }),
      P('Holle bout blokzijde', merge([G.cyl('z', 0.006, 0.006, 0.006, 6), xf(G.cyl('z', 0.004, 0.004, 0.014, 8), [0, 0, 0.008]), xf(annulus(0.004, 0.0075, 0.0012, 'z', 14), [0, 0, 0.0035]), xf(annulus(0.004, 0.0075, 0.0012, 'z', 14), [0, 0, 0.0095])]), MAT.steel, { d: 'Holle bout (banjo) in het blok met twee koperen afdichtringen.', p: [0.12, 0.1, -0.12], ex: [0, 0, -0.04] }),
      P('Holle bout turbozijde', merge([G.cyl('y', 0.006, 0.006, 0.006, 6), xf(G.cyl('y', 0.004, 0.004, 0.014, 8), [0, -0.008, 0]), xf(annulus(0.004, 0.0075, 0.0012, 'y', 14), [0, -0.0035, 0]), xf(annulus(0.004, 0.0075, 0.0012, 'y', 14), [0, -0.0095, 0])]), MAT.steel, { d: 'Holle bout op de olie-ingang van het lagerhuis met twee koperen afdichtringen.', p: [0.07, 0.196, -0.255], ex: [0, 0.04, 0] }),
    ]),
    A('Olieretour turbo', { d: 'Olieretourleiding van het lagerhuis terug naar het carter, boven het oliepeil in het blok.', ex: [0, -0.04, -0.1] }, [
      P('Olieretourleiding', tube([[0.07, 0.09, -0.255], [0.07, 0.05, -0.24], [0.06, 0.02, -0.17], [0.06, 0.02, -0.11]], 0.0075, 24, 8), MAT.steel, { d: 'Retourleiding met flens aan beide kanten.', ex: [0, 0, 0] }),
      P('Pakking retourflens', G.rbox(0.03, 0.0012, 0.022, 0.0005), MAT.heat, { d: 'Pakking van de retourflens aan het lagerhuis.', p: [0.07, 0.095, -0.255], ex: [0, 0.02, 0] }),
      P('Retourbout 1', hexBolt(0.016, 0.006, 'z'), MAT.darkSteel, { d: 'Bout van de retourflens.', p: [0.05, 0.02, -0.118], r: [PI, 0, 0], ex: [0, 0, -0.04] }),
      P('Retourbout 2', hexBolt(0.016, 0.006, 'z'), MAT.darkSteel, { d: 'Bout van de retourflens.', p: [0.07, 0.02, -0.118], r: [PI, 0, 0], ex: [0, 0, -0.04] }),
      P('Retourbout 3', hexBolt(0.016, 0.006, 'z'), MAT.darkSteel, { d: 'Bout van de retourflens.', p: [0.06, 0.035, -0.118], r: [PI, 0, 0], ex: [0, 0, -0.04] }),
    ]),
    A('Carterventilatie', { d: 'Carterventilatie: oliedampafscheider op het kleppendeksel, PCV-klep en slangen naar het inlaatspruitstuk en de turbo-ingang (opbouw schematisch).', ex: [0, 0.1, -0.05] }, [
      P('Oliedampafscheider', sep, MAT.plastic, { d: 'Afscheider die olienevel uit de carterdampen haalt.', p: PCV, ex: [0, 0.03, 0] }),
      P('PCV-klep', merge([G.cyl('x', 0.008, 0.008, 0.02, 12), xf(G.cyl('x', 0.005, 0.005, 0.012, 8), [0.015, 0, 0])]), MAT.plasticGrey, { d: 'Terugslagklep die de carterdampen bij onderdruk naar het spruitstuk laat.', p: [PCV[0] + 0.09, PCV[1] + 0.003, PCV[2]], ex: [0.04, 0.03, 0] }),
      P('Ontluchtingsslang inlaat', tube([[0.208, PCV[1] + 0.003, PCV[2]], [0.226, 0.425, -0.04], [0.223, 0.385, 0.0], [0.222, 0.335, 0.08], [0.22, 0.25, 0.165], [0.212, 0.175, 0.208]], 0.0055, 40, 8), MAT.rubber, { d: 'Slang van de PCV-klep naar het inlaatspruitstuk.', ex: [0.05, 0.03, 0.03] }),
      P('Ontluchtingsslang turbo', tube([[PCV[0] - 0.05, PCV[1] + 0.003, PCV[2] - 0.03], [0.04, 0.42, -0.12], [0.2, 0.36, -0.16], [0.235, 0.27, -0.2], [0.2, 0.21, -0.245], [0.16, 0.18, -0.255]], 0.0065, 40, 8), MAT.rubber, { d: 'Slang van de afscheider naar de compressorinlaat.', ex: [0.03, 0.05, -0.04] }),
    ]),
  ]);
}

/* ---------- koelcircuit aan de motor ---------- */
function buildEngineCooling() {
  const WP = [XT, TIM[1][1], TIM[1][0]];
  const th = [0.226, 0.3, 0.04];
  return A('Koelcircuit motor', { d: 'Waterpomp (door de distributieriem aangedreven) en waterstuk met thermostaat aan de motor.', ex: [0, 0.04, 0.22] }, [
    A('Waterpomp', { d: 'Waterpomp aan de rechterkant van het blok, aangedreven door de distributieriem; lager en afdichting schematisch.', p: WP, ex: [-0.24, -0.06, 0.06] }, [
      P('Pomphuis', merge([xf(G.cyl('x', 0.04, 0.04, 0.01, 24), [0.0245, 0, 0]), xf(G.cyl('x', 0.015, 0.015, 0.012, 14), [0.016, 0, 0])]), MAT.aluCast, { d: 'Pomphuis met flens op het blok.', ex: [0, 0, 0] }),
      P('Tandpoelie', merge([gear(17, 0.0255, 0.0232, 0.03, 0.006, 'x'), xf(G.cyl('x', 0.012, 0.012, 0.012, 12), [0.012, 0, 0])]), MAT.steel, { d: 'Getande poelie, Ø52,2 mm, die door de distributieriem wordt aangedreven (tandental geschat).', ex: [-0.07, 0, 0], spec: [['Diameter', '52,2 mm']] }),
      P('As met lager', merge([G.cyl('x', 0.006, 0.006, 0.06, 10), xf(G.cyl('x', 0.012, 0.012, 0.018, 14), [0.015, 0, 0])]), MAT.bearing, { d: 'Pompas met dubbel kogellager.', p: [0.02, 0, 0], ex: [-0.035, 0, 0.05], inner: true }),
      P('Mechanische asafdichting', annulus(0.006, 0.013, 0.006, 'x', 16), MAT.ceramic, { d: 'Glijringafdichting die koelvloeistof langs de as tegenhoudt.', p: [0.036, 0, 0], ex: [0.03, 0, 0.05] }),
      P('Waaier', merge([blades(6, 0.008, 0.03, 0.01, 0.003, 0.5, 'x'), G.cyl('x', 0.03, 0.03, 0.002, 20)]), MAT.steel, { d: 'Schoepenwiel dat de koelvloeistof rondpompt.', p: [0.043, 0, 0], ex: [0.06, 0, 0] }),
      P('Pakking waterpomp', annulus(0.016, 0.04, 0.0008, 'x', 24), MAT.rubber, { d: 'Pakking tussen pomp en blok.', p: [0.0296, 0, 0], ex: [0.045, 0, 0] }),
      A('Bouten waterpomp', { d: 'Bouten van de waterpomp.', ex: [-0.05, 0, 0] }, [0, 1, 2].map(k => P(`Bout ${k + 1}`, hexBolt(0.025, 0.006, 'x'), MAT.darkSteel, { d: 'Bout van de waterpomp.', p: [0.0195, 0.033 * Math.cos(k * 2.1 + 0.5), 0.033 * Math.sin(k * 2.1 + 0.5)], ex: [-0.07, 0, 0] }))),
      P('Aanvoerstomp', merge([tube([[0.078, -0.093, -0.005], [0.082, -0.093, 0.01], [0.09, -0.093, 0.04], [0.09, -0.093, 0.059]], 0.013, 16, 10), xf(G.rbox(0.03, 0.03, 0.006, 0.004), [0.09, -0.093, 0.009])]), MAT.aluCast, { d: 'Inlaatstomp van de waterpomp aan de voorkant van het blok, voor de onderste radiateurslang.', ex: [0.02, 0, 0.06] }),
    ]),
    A('Waterstuk en thermostaat', { d: 'Waterstuk (boîtier de sortie d\'eau) aan de vliegwielzijde van de kop, met thermostaat en temperatuursensor.', ex: [0.14, 0.12, 0] }, [
      P('Waterstuk', merge([xf(G.rbox(0.042, 0.05, 0.062, 0.008), [0.237, 0.3, 0.04]), xf(G.cyl('y', 0.0155, 0.0155, 0.04, 16), [0.252, 0.338, 0.04]), xf(G.cyl('x', 0.009, 0.009, 0.03, 12), [0.265, 0.29, 0.015]), xf(G.cyl('z', 0.0055, 0.0055, 0.02, 10), [0.25, 0.31, 0.078])]), MAT.aluCast, { d: 'Uitlaathuis met aansluitingen naar radiateur, kachel en expansievat.', ex: [0, 0, 0] }),
      A('Thermostaat', { d: 'Wasthermostaat: begint te openen bij 89 ± 2 °C en is volledig open bij 99 ± 2 °C (waarden uit het werkplaatshandboek van de F4R-familie, aannemelijk voor deze motor); binnenwerk schematisch.', p: th, ex: [0.05, 0.05, 0], inner: true, spec: [['Begint te openen (F4R)', '89 ± 2 °C'], ['Volledig open (F4R)', '99 ± 2 °C']] }, [
        P('Waselement met zuiger', merge([G.cyl('x', 0.0085, 0.0085, 0.02, 14), xf(G.cyl('x', 0.002, 0.002, 0.016, 6), [-0.016, 0, 0])]), MAT.copper, { d: 'Waselement dat bij warmte uitzet en de zuiger uitdrukt.', p: [0.008, 0, 0], ex: [0.04, 0, 0] }),
        P('Klepplaat', merge([G.cyl('x', 0.019, 0.019, 0.002, 20), annulus(0.019, 0.023, 0.002, 'x', 20)]), MAT.steel, { d: 'Klepplaat met rand die de doorlaat naar de radiateur opent.', ex: [0, 0, 0] }),
        P('Thermostaatveer', engSpring(0.011, 0.0012, 0.016, 3, 12, 'x'), MAT.steel, { d: 'Veer die de klep sluit als de motor afkoelt.', p: [0.012, 0, 0], ex: [0.025, 0, 0] }),
        P('Omloopklepje', G.cyl('x', 0.01, 0.01, 0.0015, 14), MAT.steel, { d: 'Klepje dat de omloop bij een koude motor open houdt.', p: [0.022, 0, 0], ex: [0.06, 0, 0] }),
      ]),
      P('Pakking waterstuk', G.rbox(0.0012, 0.056, 0.066, 0.006), MAT.rubber, { d: 'Pakking tussen waterstuk en kop.', p: [0.2152, 0.3, 0.04], ex: [-0.03, 0, 0] }),
      P('Koelvloeistoftemperatuursensor', merge([G.cyl('z', 0.005, 0.005, 0.02, 10), xf(G.cyl('z', 0.008, 0.008, 0.006, 6), [0, 0, 0.012]), xf(G.rbox(0.014, 0.014, 0.012, 0.003), [0, 0, 0.021])]), MAT.plasticGrey, { d: 'Meet de koelvloeistoftemperatuur voor het motormanagement en de meter.', p: [0.245, 0.29, -0.001], r: [0, PI, 0], ex: [0, 0, -0.05] }),
    ]),
  ]);
}

function buildEngine() {
  return A('Motor F4Rt', {
    d: 'Renault F4Rt 813 (waarschijnlijk, zie beslissingen; de RDW toont Euro 5 en onderdelencatalogi noemen de reeks F4R 811): 2,0-liter viercilinder-turbomotor met gietijzeren blok, aluminium kop, 16 kleppen met rolzwenkarmen (zoals bij de F4R-familie), vaste kleptiming zonder faseversteller (de persmap van 2007 noemt de 811; voor de 813 niet apart bevestigd), distributieriem en meerpuntsinjectie. Dwars voorin; inlaatzijde naar voren en turbo achter (aannemelijk).',
    spec: [['Motorcode', 'F4Rt 813 (waarschijnlijk, zie beslissingen)'], ['Opbouw', '4 in lijn, 16V DOHC'], ['Cilinderinhoud', '1998 cm³'], ['Boring × slag', '82,7 × 93,0 mm'], ['Compressie', '9,5 : 1 (Renault-persmap 2007, bij de 811; L\'argus noemt 9,0 : 1)'], ['Kleptiming', 'vast, geen faseversteller'], ['Toerenbegrenzer', '6250 tpm'], ['Brandstofsysteem', 'meerpuntsinjectie'], ['Inductie', 'Mitsubishi TD04 + intercooler'], ['Vermogen', '125 kW (170 pk) bij 5000 tpm'], ['Koppel', '270 Nm bij 3250 tpm'], ['Ontsteekvolgorde', '1-3-4-2 (aannemelijk)'], ['Nokkenasaandrijving', 'distributieriem']],
    ex: [0, 0.25, 0],
  }, [
    buildBlock(), buildCrank(), buildHead(), buildTiming(), buildAccessory(), buildIntake(), buildTurbo(), buildLube(), buildEngineCooling(),
    buildSensors(), buildHarness(), buildFlexplate(), buildEngineCover(),
  ]);
}

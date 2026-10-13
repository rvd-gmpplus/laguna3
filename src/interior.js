/* ===================== interieur ===================== */
// Alles wat de carrosserie raakt (hemel, dakgrepen, spiegel, gordelgeleiders) volgt de functies YR, YT, surfX en ghPt van de carrosserie.
std('intFoam', 0x3a3834, 0, 1);
std('intBelt', 0x25272c, 0, 0.9);
const intPart = (name, geo, mat, d, o) => P(name, geo, mat, Object.assign({ d }, o));
// vlakke band (gordelband) tussen twee punten; het vlak kijkt naar voren
function intStrip(a, b, w, t) {
  const A0 = V3(...a), B0 = V3(...b), z = B0.clone().sub(A0), L = z.length(); z.normalize();
  const y = V3(0, 0, 1).sub(z.clone().multiplyScalar(z.z)).normalize(), x = y.clone().cross(z).normalize();
  const g = new THREE.BoxGeometry(w, t, L), m = new THREE.Matrix4().makeBasis(x, y, z);
  m.setPosition(A0.add(B0).multiplyScalar(0.5)); g.applyMatrix4(m); return g;
}
// hoogte van het dak aan de binnenzijde op dwarsafstand |x| bij langsplaats z (uit de kasfunctie ghPt)
function intRoofY(z, ax) {
  let best = null;
  for (let i = 0; i <= 60; i++) { const p = ghPt(z, 0.27 + 0.23 * i / 60); const e = Math.abs(Math.abs(p[0]) - ax); if (!best || e < best.e) best = { e, y: p[1] }; }
  return best.y - 0.02;
}
const intBx = (w, h, d, r, p, rot) => xf(G.rbox(w, h, d, r), p, rot);
const intCy = (ax, r, h, p, seg = 12) => xf(G.cyl(ax, r, r, h, seg), p);

function frontSeat(s) {
  const drv = s > 0, who = drv ? 'Bestuurdersstoel' : 'Passagiersstoel';
  const bx = intBx, cy = intCy;
  const frame = A('Stoelframe', { d: 'Stalen frame van de zitting met scharnieren voor de rugleuning, onder de schuimlaag verborgen.', ex: [0, 0.02, 0], inner: true }, [
    intPart('Zitplaat', bx(0.42, 0.014, 0.44, 0.006, [0, 0.125, 0.0]), MAT.darkSteel, 'Geperste stalen plaat waarop het zitschuim rust.', { ex: [0, 0.03, 0] }),
    intPart('Zitframebuizen', merge([cy('z', 0.008, 0.46, [0.2, 0.125, 0]), cy('z', 0.008, 0.46, [-0.2, 0.125, 0]), cy('x', 0.008, 0.4, [0, 0.125, 0.225])]), MAT.steel, 'Stalen buizen langs de randen van de zitplaat.', { ex: [0, 0.01, 0] }),
    intPart('Rugleuningscharnier', merge([cy('x', 0.028, 0.012, [0.215, 0.16, -0.2], 16), cy('x', 0.028, 0.012, [-0.215, 0.16, -0.2], 16), bx(0.012, 0.09, 0.06, 0.004, [0.215, 0.14, -0.19]), bx(0.012, 0.09, 0.06, 0.004, [-0.215, 0.14, -0.19])]), MAT.darkSteel, 'Scharnier met reductie voor de hellingsverstelling van de rugleuning, zonder tandwielen schematisch weergegeven.', { ex: [0, 0, -0.04] }),
  ]);
  const rails = A('Stoelrails', { d: 'Geleiderails en hoogteverstelling die de stoel op de vloer dragen en de lengteverstelling mogelijk maken.', ex: [0, -0.12, 0] }, [
    intPart('Onderrail buitenzijde', G.rbox(0.04, 0.022, 0.5, 0.006), MAT.steel, 'Vaste onderrail op de vloer aan de portierzijde.', { p: [s * 0.18, 0.012, 0], ex: [s * 0.03, -0.04, 0] }),
    intPart('Onderrail binnenzijde', G.rbox(0.04, 0.022, 0.5, 0.006), MAT.steel, 'Vaste onderrail op de vloer aan de tunnelzijde.', { p: [-s * 0.18, 0.012, 0], ex: [-s * 0.03, -0.04, 0] }),
    intPart('Bovenrail buitenzijde', G.rbox(0.03, 0.024, 0.46, 0.006), MAT.darkSteel, 'Bovenrail die in de onderrail schuift en de stoel draagt.', { p: [s * 0.18, 0.036, 0], ex: [s * 0.02, 0.0, 0.04] }),
    intPart('Bovenrail binnenzijde', G.rbox(0.03, 0.024, 0.46, 0.006), MAT.darkSteel, 'Bovenrail aan de tunnelzijde.', { p: [-s * 0.18, 0.036, 0], ex: [-s * 0.02, 0.0, 0.04] }),
    intPart('Hoogtearmen voor', merge([rodBetween([0.18, 0.05, 0.19], [0.18, 0.115, 0.17], 0.008, 8), rodBetween([-0.18, 0.05, 0.19], [-0.18, 0.115, 0.17], 0.008, 8)]), MAT.darkSteel, 'Draaiarmen vooraan die de voorkant van de zitting heffen en dalen.', { ex: [0, 0.03, 0.04] }),
    intPart('Hoogtearmen achter', merge([rodBetween([0.18, 0.05, -0.18], [0.18, 0.115, -0.2], 0.008, 8), rodBetween([-0.18, 0.05, -0.18], [-0.18, 0.115, -0.2], 0.008, 8)]), MAT.darkSteel, 'Draaiarmen achter die de achterkant van de zitting heffen en dalen.', { ex: [0, 0.03, -0.04] }),
  ]);
  const bolts = A('Stoelbevestiging', { d: 'Vier bouten waarmee de onderrails aan de vloer zijn vastgezet.', ex: [0, -0.26, 0] },
    [[0.18, 0.2], [0.18, -0.2], [-0.18, 0.2], [-0.18, -0.2]].map(([x, z], i) => intPart(`Stoelbout ${i + 1}`, hexBolt(0.02, 0.012), MAT.steel, 'Bout M8 door het uiteinde van de onderrail in de vloer.', { p: [s * x, 0.034, z], r: [PI, 0, 0], ex: [0, -0.03 - (i % 2) * 0.02, 0] })));
  const motors = A('Verstelmotoren', { d: 'Elektromotoren met aandrijving voor lengte, achterhoogte, voorhoogte en rugleuning (vier, afgeleid uit de functies; het werkplaatsboek van de Laguna II noemt er drie), plus de stoelmodule.', ex: [0, -0.05, 0.22] }, [
    intPart('Lengtemotor', merge([cy('x', 0.022, 0.1, [0, 0.085, 0.07], 14), bx(0.05, 0.05, 0.05, 0.01, [0.07, 0.085, 0.07])]), MAT.darkSteel, 'Motor met flexibele assen voor de lengteverstelling in de rails.', { ex: [0, -0.02, 0.06] }),
    intPart('Achterhoogtemotor', merge([cy('x', 0.022, 0.1, [0, 0.09, -0.17], 14), bx(0.05, 0.05, 0.05, 0.01, [0.07, 0.09, -0.17])]), MAT.darkSteel, 'Motor voor de hoogteverstelling van de achterkant van de zitting.', { ex: [0, -0.02, -0.06] }),
    intPart('Voorhoogtemotor', merge([cy('x', 0.022, 0.1, [0, 0.09, 0.17], 14), bx(0.05, 0.05, 0.05, 0.01, [-0.07, 0.09, 0.17])]), MAT.darkSteel, 'Motor voor de hoogteverstelling van de voorkant van de zitting.', { ex: [0, -0.04, 0.08] }),
    intPart('Rugleuningmotor', merge([cy('x', 0.022, 0.09, [0.12, 0.17, -0.2], 14), bx(0.05, 0.05, 0.05, 0.01, [0.19, 0.17, -0.2])]), MAT.darkSteel, 'Motor voor de hellingsverstelling van de rugleuning, aandrijving via het scharnier.', { ex: [0, 0.0, -0.08] }),
    intPart('Stoelmodule', G.rbox(0.1, 0.03, 0.07, 0.006), MAT.ecu, drv ? 'Stoelregeleenheid met drie geheugenstanden voor stoel en buitenspiegels, op te roepen met de kaart of bij het openen van de deur.' : 'Regeleenheid van de stoelverstelling; de passagiersstoel heeft geen geheugen.', { p: [-0.1, 0.075, 0.0], ex: [0, -0.04, 0] }),
  ]);
  const cushion = A('Zitting', { d: 'Zitkussen: schuim, verwarmingsmat en lederen bekleding met zijwangen.', ex: [0, 0.16, 0.08] }, [
    intPart('Zitschuim', bx(0.44, 0.085, 0.48, 0.03, [0, 0.17, 0.02]), MAT.intFoam, 'Gevormd polyurethaanschuim van het zitkussen.', { inner: true, ex: [0, 0.03, 0] }),
    intPart('Verwarmingsmat zitting', G.box(0.34, 0.003, 0.38), MAT.heater, 'Verwarmingselement in de zitting; de stoelverwarming heeft drie standen met thermostaat.', { p: [0, 0.2155, 0.03], inner: true, ex: [0, 0.07, 0.03] }),
    intPart('Zitbekleding', merge([bx(0.5, 0.11, 0.52, 0.035, [0, 0.172, 0.02]), bx(0.07, 0.05, 0.5, 0.02, [0.215, 0.235, 0.02]), bx(0.07, 0.05, 0.5, 0.02, [-0.215, 0.235, 0.02])]), MAT.leather, 'Geperforeerd beige leder (Initiale) met verstevigde zijwangen.', { ex: [0, 0.13, 0.05] }),
    intPart('Zijkap zitting', G.rbox(0.012, 0.07, 0.42, 0.005), MAT.plastic, 'Kunststof kap aan de portierzijde van het zitkussen met de bedieningsschakelaars.', { p: [s * 0.262, 0.15, 0.01], ex: [s * 0.1, 0, 0] }),
    intPart('Stoelschakelaars', merge([bx(0.012, 0.016, 0.03, 0.004, [s * 0.272, 0.165, 0.09]), bx(0.012, 0.016, 0.03, 0.004, [s * 0.272, 0.138, 0.09]), cy('x', 0.011, 0.012, [s * 0.272, 0.152, 0.14], 10)]), MAT.plasticGrey, 'Schakelaars voor de elektrische stoelverstelling en de verwarming.', { ex: [s * 0.16, 0, 0.02] }),
  ]);
  const hr = A('Hoofdsteun', { d: 'In hoogte verstelbare hoofdsteun met twee geleidestangen.', p: [0, 0.69, -0.02], ex: [0, 0.3, 0] }, [
    intPart('Hoofdsteunkussen', G.rbox(0.27, 0.17, 0.09, 0.04), MAT.leather, 'Met leder bekleed kussen.', { p: [0, 0.1, 0], ex: [0, 0.08, 0] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.006, 0.13, [0.07, -0.02, 0], 10), cy('y', 0.006, 0.13, [-0.07, -0.02, 0], 10)]), MAT.chrome, 'Twee verchroomde stangen die in de bussen van de rugleuning schuiven.', { ex: [0, -0.05, 0] }),
  ]);
  const back = A('Rugleuning', { d: 'Rugleuning met frame, schuim, verwarming, zijairbag en lederen bekleding; de hoek is elektrisch verstelbaar.', p: [0, 0.24, -0.24], r: [-0.3, 0, 0], ex: [0, 0.18, -0.24] }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.6, [0.2, 0.31, -0.03]), cy('y', 0.009, 0.6, [-0.2, 0.31, -0.03]), cy('x', 0.009, 0.4, [0, 0.6, -0.03]), cy('x', 0.009, 0.4, [0, 0.03, -0.03])]), MAT.steel, 'Stalen buisframe van de rugleuning.', { inner: true, ex: [0, 0, -0.02] }),
    intPart('Lendensteun', merge([bx(0.3, 0.15, 0.008, 0.003, [0, 0.24, -0.015]), rodBetween([0.14, 0.17, -0.02], [-0.14, 0.17, -0.02], 0.004, 6), rodBetween([0.14, 0.31, -0.02], [-0.14, 0.31, -0.02], 0.004, 6)]), MAT.darkSteel, drv ? 'Handmatig verstelbare lendensteun met hendel (bestuurder).' : 'Lendensteunplaat; de passagiersstoel heeft volgens het onderzoek geen verstelbare lendensteun, dit deel is schematisch.', { inner: true, ex: [0, 0, -0.07] }),
    intPart('Rugschuim', bx(0.46, 0.58, 0.065, 0.03, [0, 0.31, 0.0]), MAT.intFoam, 'Gevormd schuim van de rugleuning.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Verwarmingsmat rugleuning', G.box(0.34, 0.4, 0.003), MAT.heater, 'Verwarmingselement in de rugleuning.', { p: [0, 0.31, 0.04], inner: true, ex: [0, 0, 0.1] }),
    intPart('Zijairbag', G.rbox(0.05, 0.2, 0.07, 0.015), MAT.plastic, 'Zijairbagmodule in de buitenste zijwang van de rugleuning (thorax en bekken), onder de bekleding verborgen.', { p: [s * 0.215, 0.4, 0.0], inner: true, ex: [s * 0.15, 0, 0] }),
    intPart('Rugbekleding', merge([bx(0.5, 0.62, 0.115, 0.035, [0, 0.31, 0.0]), bx(0.07, 0.58, 0.06, 0.025, [0.22, 0.3, 0.05]), bx(0.07, 0.58, 0.06, 0.025, [-0.22, 0.3, 0.05])]), MAT.leather, 'Geperforeerd beige leder met verstevigde zijwangen.', { ex: [0, 0, 0.16] }),
    intPart('Rugachterschaal', G.rbox(0.46, 0.58, 0.012, 0.006), MAT.plastic, 'Kunststof schaal aan de achterkant van de rugleuning.', { p: [0, 0.31, -0.064], ex: [0, 0, -0.14] }),
    intPart('Hoofdsteunbussen', merge([cy('y', 0.011, 0.04, [0.07, 0.62, -0.02], 10), cy('y', 0.011, 0.04, [-0.07, 0.62, -0.02], 10)]), MAT.plastic, 'Geleidebussen in de bovenkant van de rugleuning.', { ex: [0, 0.02, 0] }),
    drv && intPart('Lendensteunhendel', merge([rodBetween([0.25, 0.24, -0.005], [0.3, 0.24, -0.005], 0.006, 8), rodBetween([0.3, 0.24, -0.005], [0.3, 0.17, -0.005], 0.008, 8)]), MAT.plasticGrey, 'Hendel voor de handmatige lendensteun, aan de portierzijde van de rugleuning.', { ex: [0.12, 0, 0] }),
    hr,
  ]);
  const buckle = A('Gordelslot met spanner', { d: 'Gordelslot met gordelverklikker en pyrotechnische slotspanner (de bestuurder heeft een dubbele spanner).', p: [-s * 0.235, 0.27, -0.12], ex: [-s * 0.12, 0.1, 0] }, [
    intPart('Slotbehuizing', G.rbox(0.03, 0.07, 0.04, 0.008), MAT.plastic, 'Behuizing van het gordelslot met schakelaar voor de gordelverklikker.', { ex: [0, 0.02, 0] }),
    intPart('Ontgrendelknop', G.rbox(0.016, 0.012, 0.022, 0.004), MAT.red, 'Rode knop om de gordel los te maken.', { p: [0, 0.038, 0.002], ex: [0, 0.05, 0] }),
    intPart('Slotkabel', merge([rodBetween([0, -0.03, 0], [0, -0.1, 0.02], 0.004, 6), rodBetween([0, -0.1, 0.02], [0, -0.1, 0.1], 0.004, 6)]), MAT.steel, 'Stalen kabel tussen het gordelslot en de spanner.', { ex: [0, -0.05, 0] }),
    intPart('Slotspanner', xf(G.cyl('z', 0.014, 0.014, 0.09, 12), [0, -0.1, 0.14]), MAT.darkSteel, 'Pyrotechnische buisspanner die bij een botsing de kabel en het slot naar beneden trekt.', { inner: true, ex: [0, -0.1, 0.04] }),
  ]);
  return A(who, { d: `${who}: elektrisch verstelbaar${drv ? ' met geheugen' : ''}, stoelverwarming en geperforeerd beige leder (Initiale). Opbouw van onder naar boven: bouten, rails, frame met motoren, zitting en rugleuning met hoofdsteun.`, spec: [['Verstelling', 'elektrisch: lengte, voor- en achterhoogte, rugleuning'], ['Stoelverwarming', 'drie standen met thermostaat'], ['Geheugen', drv ? 'drie standen voor stoel en buitenspiegels' : 'geen'], ['Lendensteun', drv ? 'handmatig met hendel' : 'niet verstelbaar'], ['Bekleding', 'geperforeerd leder, beige']], p: [s * 0.37, 0.24, -0.02], ex: [s * 0.36, 0.05, 0.06] }, [frame, rails, bolts, motors, cushion, back, buckle]);
}

// achterbank: 2/3 en 1/3 neerklapbare rugleuning (verdeling en welke zijde groot is: geschat), drie hoofdsteunen, ISOFIX op de buitenplaatsen
const intRB = { y: 0.489, z: -1.201, tilt: -0.25 };   // onderkant van de rugleuning achter (hoek 0,25 rad naar achteren)
function intRearBack(cx, w, name, d) {
  const bx = intBx, cy = intCy, hw = w / 2;
  return A(name, { d, p: [cx, intRB.y, intRB.z], r: [intRB.tilt, 0, 0], ex: [cx > 0 ? 0.14 : -0.14, 0.12, -0.12] }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.54, [hw - 0.03, 0.28, -0.03]), cy('y', 0.009, 0.54, [-hw + 0.03, 0.28, -0.03]), cy('x', 0.009, w - 0.06, [0, 0.54, -0.03]), cy('x', 0.009, w - 0.06, [0, 0.02, -0.03])]), MAT.steel, 'Stalen buisframe van het rugleuningdeel.', { inner: true, ex: [0, 0, -0.02] }),
    intPart('Rugschuim', bx(w - 0.02, 0.54, 0.065, 0.03, [0, 0.28, 0]), MAT.intFoam, 'Schuimlaag van het rugleuningdeel.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', bx(w, 0.56, 0.11, 0.03, [0, 0.28, 0]), MAT.leather, 'Beige lederen bekleding.', { ex: [0, 0, 0.14] }),
    intPart('Rugachterbekleding', bx(w - 0.02, 0.54, 0.012, 0.006, [0, 0.28, -0.062]), MAT.carpet, 'Bekleding aan de bagageruimtezijde van het rugleuningdeel.', { ex: [0, 0, -0.14] }),
    intPart('Rugvergrendeling', bx(0.04, 0.05, 0.03, 0.008, [cx > 0 ? hw - 0.05 : -hw + 0.05, 0.55, -0.04]), MAT.steel, 'Vergrendeling in de bovenrand die de rugleuning aan de carrosserie vastzet; ontgrendeld met een hendel op de bank of in de bagageruimte.', { ex: [cx > 0 ? 0.06 : -0.06, 0.06, -0.04] }),
    intPart('Scharnierbeugels', merge([bx(0.05, 0.03, 0.06, 0.008, [hw - 0.07, 0.02, -0.04]), bx(0.05, 0.03, 0.06, 0.008, [-hw + 0.07, 0.02, -0.04])]), MAT.darkSteel, 'Beugels waarmee het rugleuningdeel om de onderrand scharniert.', { ex: [0, -0.06, -0.06] }),
  ]);
}
function intRearHead(x, name) {
  const t = 0.6, bx = intBx, cy = intCy;
  return A(name, { d: 'Achterhoofdsteun met twee geleidestangen; drie stuks (een per zitplaats).', p: [x, intRB.y + t * Math.cos(intRB.tilt), intRB.z + t * Math.sin(intRB.tilt)], r: [intRB.tilt, 0, 0], ex: [0, 0.24, 0] }, [
    intPart('Hoofdsteunkussen', bx(0.24, 0.14, 0.08, 0.035, [0, 0.07, 0]), MAT.leather, 'Met leder bekleed kussen.', { ex: [0, 0.07, 0] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.006, 0.12, [0.06, -0.01, 0], 10), cy('y', 0.006, 0.12, [-0.06, -0.01, 0], 10)]), MAT.chrome, 'Twee verchroomde stangen die in de rugleuning schuiven.', { ex: [0, -0.05, 0] }),
  ]);
}
function intRearBench() {
  const bx = intBx, cy = intCy;
  const cush = A('Zitting achterbank', { d: 'Zitkussen van de achterbank: plaat, schuim en lederen bekleding, met de ISOFIX-beugels en de gordelsloten.', p: [0, 0.43, -0.95], ex: [0, 0.06, 0.14] }, [
    intPart('Zitplaat achter', bx(1.17, 0.012, 0.44, 0.005, [0, -0.045, 0]), MAT.darkSteel, 'Stalen plaat onder het zitschuim.', { inner: true, ex: [0, 0.02, 0] }),
    intPart('Zitschuim achter', bx(1.21, 0.07, 0.46, 0.03, [0, -0.015, 0]), MAT.intFoam, 'Schuimlaag van de achterbankzitting.', { inner: true, ex: [0, 0.04, 0] }),
    intPart('Zitbekleding achter', bx(1.26, 0.12, 0.48, 0.03, [0, 0, 0]), MAT.leather, 'Beige lederen bekleding van de zitting.', { ex: [0, 0.1, 0.04] }),
    ...[1, -1].map(s => intPart(`ISOFIX-beugel ${sideName(s)}`, merge([rodBetween([s * 0.42 - 0.03, 0.063, -0.25], [s * 0.42 + 0.03, 0.063, -0.25], 0.004, 6), rodBetween([s * 0.42 - 0.03, 0.063, -0.25], [s * 0.42 - 0.03, 0.03, -0.26], 0.004, 6), rodBetween([s * 0.42 + 0.03, 0.063, -0.25], [s * 0.42 + 0.03, 0.03, -0.26], 0.004, 6)]), MAT.steel, 'ISOFIX-beugel voor een kinderzitje op de buitenste zitplaats, in de spleet tussen zitting en rugleuning.', { ex: [s * 0.08, 0.04, -0.06] })),
    ...[[0.2, 'links'], [0, 'midden'], [-0.2, 'rechts']].map(([x, n]) => intPart(`Gordelslot achter ${n}`, merge([bx(0.03, 0.05, 0.04, 0.008, [x, 0.07, -0.2]), bx(0.014, 0.01, 0.02, 0.003, [x, 0.098, -0.2])]), MAT.plastic, 'Gordelslot van de achterbank met gordelverklikker.', { ex: [0, 0.1, 0] })),
  ]);
  const arm = A('Middenarmsteun achter', { d: 'Opklapbare middenarmsteun in het rugleuningdeel met twee bekerhouders, hier opgeklapt weergegeven.', p: [0, intRB.y, intRB.z], r: [intRB.tilt, 0, 0], ex: [0, 0.1, 0.18] }, [
    intPart('Armsteunkussen', bx(0.24, 0.36, 0.035, 0.012, [0, 0.3, 0.078]), MAT.leather, 'Gevoerde armsteun die tussen de rugleuningdelen wordt neergeklapt.', { ex: [0, 0, 0.1] }),
    intPart('Bekerhouders achter', merge([cy('z', 0.032, 0.012, [0.06, 0.25, 0.092], 20), cy('z', 0.032, 0.012, [-0.06, 0.25, 0.092], 20)]), MAT.plasticGrey, 'Twee bekerhouders in de armsteun.', { ex: [0, 0, 0.08] }),
    intPart('Armsteunscharnier', bx(0.12, 0.025, 0.03, 0.008, [0, 0.1, 0.06]), MAT.darkSteel, 'Scharnier onderaan de armsteun.', { ex: [0, -0.05, 0.02] }),
  ]);
  return A('Achterbank', { d: 'Achterbank met gedeeld neerklapbare rugleuning (een derde en twee derde), drie hoofdsteunen, middenarmsteun met bekerhouders en ISOFIX op de buitenplaatsen.', spec: [['Verdeling rugleuning', 'een derde en twee derde, neerklapbaar'], ['Hoofdsteunen', '3'], ['ISOFIX', 'op de twee buitenplaatsen'], ['Middenarmsteun', 'met twee bekerhouders']], ex: [0, 0.1, -0.36] }, [
    cush,
    intRearBack(-0.265, 0.77, 'Rugleuning groot deel', 'Het grote (twee derde) deel van de gedeelde rugleuning; de verdeling en de zijde zijn geschat.'),
    intRearBack(0.385, 0.52, 'Rugleuning klein deel', 'Het kleine (een derde) deel van de gedeelde rugleuning.'),
    arm,
    intRearHead(0.42, 'Hoofdsteun achter links'), intRearHead(0, 'Hoofdsteun achter midden'), intRearHead(-0.42, 'Hoofdsteun achter rechts'),
  ]);
}
// gordels: rolautomaten in B- en C-stijl, geleiders en banden; x-posities volgen de buitenhuid
function intBelts() {
  const bx = intBx, out = [];
  const bandGeo = (pts, w) => merge(pts.slice(1).map((p, i) => intStrip(pts[i], p, w, 0.003)));
  for (const s of [1, -1]) {
    const n = sideName(s), zB = -0.28, xr = s * (surfX(zB, 0.55) - 0.075), xg = s * (surfX(zB, 1.1) - 0.05), tong = [s * 0.135, 0.535, -0.14];
    const grp = [];
    grp.push(
      intPart(`Gordelrolautomaat voor ${n}`, G.rbox(0.06, 0.1, 0.06, 0.01), MAT.plastic, 'Oprolautomaat met gordelspanner en krachtbegrenzer onderin de B-stijl, achter de stijlbekleding verborgen; de bestuurder heeft een dubbele spanner.', { p: [xr, 0.55, zB], ex: [s * 0.1, 0, 0] }),
      intPart(`Hoogteversteller voor ${n}`, G.rbox(0.03, 0.2, 0.012, 0.004), MAT.plasticGrey, 'Geleiderail op de B-stijl waarmee de bovenste gordelgeleider in hoogte wordt versteld.', { p: [xg, 1.04, zB - 0.02], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider voor ${n}`, G.torus('z', 0.018, 0.004, 16, 6), MAT.steel, 'Geleideoog waar de gordelband doorheen loopt.', { p: [xg, 1.1, zB], ex: [s * 0.1, 0.16, 0] }),
      intPart(`Gordelband voor ${n}`, bandGeo([[xg, 1.1, zB + 0.012], tong, [s * 0.45, 0.56, -0.2], [s * 0.69, 0.52, -0.22], [s * 0.7, 0.33, -0.22]], 0.046), MAT.intBelt, 'Driepuntsgordelband: schouderband van de geleider naar de gordeltong en heupband naar de buitenste verankering.', { ex: [s * 0.1, 0.1, 0.06] }),
      intPart(`Gordeltong voor ${n}`, G.rbox(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong op de gordelband die in het gordelslot klikt.', { p: tong, ex: [0, 0.14, 0.04] }),
      intPart(`Gordelverankering voor ${n}`, hexBolt(0.02, 0.014, 'x'), MAT.steel, 'Bout waarmee de heupband aan de buitenkant van de stoel in de drempel is verankerd.', { p: [s * 0.7, 0.33, -0.22], r: [0, s > 0 ? 0 : PI, 0], ex: [s * 0.1, 0, 0] }));
    out.push(A(`Gordel voor ${n}`, { d: 'Driepuntsgordel van de voorstoel: rolautomaat in de B-stijl, hoogteversteller, geleider, band, tong en onderste verankering.', ex: [s * 0.05, 0.12, 0] }, grp));
  }
  [[0.42, 'links', 0.2], [0, 'midden', 0], [-0.42, 'rechts', -0.2]].forEach(([x, n, bxp]) => {
    const xg = x === 0 ? 0 : Math.sign(x) * (surfX(-1.3, 1.03) - 0.06), xr = x === 0 ? 0 : Math.sign(x) * (surfX(-1.5, 0.7) - 0.07), zr = x === 0 ? -1.58 : -1.5, yr = x === 0 ? 1.0 : 0.7;
    const grp = [];
    grp.push(
      intPart(`Gordelrolautomaat achter ${n}`, G.rbox(0.06, 0.06, 0.08, 0.01), MAT.plastic, x === 0 ? 'Oprolautomaat van de middelste achtergordel op de hoedenplank.' : 'Oprolautomaat met spanner in de achterstijl.', { p: [xr, yr, zr], ex: [Math.sign(x) * 0.1, 0.1, 0] }),
      intPart(`Gordelband achter ${n}`, bandGeo([[xg, 1.03, -1.28], [bxp, 0.51, -1.14]], 0.046), MAT.intBelt, 'Gordelband van de achterbank.', { ex: [Math.sign(x) * 0.08, 0.12, 0.05] }),
      intPart(`Gordeltong achter ${n}`, G.rbox(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong die in het gordelslot klikt.', { p: [bxp, 0.52, -1.14], ex: [0, 0.14, 0.04] }));
    out.push(A(`Gordel achter ${n}`, { d: 'Driepuntsgordel van de achterbank: rolautomaat, band en tong; het slot zit in de zitting.', ex: [Math.sign(x) * 0.04, 0.1, 0] }, grp));
  });
  return A('Veiligheidsgordels', { d: 'Driepuntsgordels met oprolautomaten, geleiders en tongen; de gordelsloten zitten in de stoelen en de achterbank.', ex: [0, 0.3, 0] }, out);
}

/* ---------- dashboard ---------- */
// zijprofiel (z, y) van het dashboard; bovenkant en voorvlak worden voor de huid en de bedieningspanelen hergebruikt
const intDashPf = [[1.03, 0.935], [0.8, 0.95], [0.62, 0.945], [0.52, 0.91], [0.47, 0.84], [0.48, 0.74], [0.55, 0.62], [0.58, 0.52], [0.68, 0.5], [0.9, 0.6], [1.0, 0.78]];
const intDashTopPts = [[1.03, 0.935], [0.8, 0.95], [0.62, 0.945], [0.52, 0.91], [0.47, 0.84]];
const intFacePts = [[0.52, 0.91], [0.47, 0.84], [0.48, 0.74], [0.55, 0.62]];
const intSkinT = 0.012;
// polylijn van boven naar onder (of voor naar achter) verschoven langs de normaal naar de bestuurder (positief = naar buiten)
function intOffset(poly, d) {
  return poly.map((p, i) => {
    const a = poly[Math.max(0, i - 1)], b = poly[Math.min(poly.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    return [p[0] + d * ty / l, p[1] - d * tx / l];
  });
}
function intDashTop(z) {
  const T = intDashTopPts;
  for (let i = 0; i < T.length - 1; i++) if (z <= T[i][0] && z >= T[i + 1][0]) return lerp(T[i][1], T[i + 1][1], (T[i][0] - z) / (T[i][0] - T[i + 1][0])) + intSkinT;
  return T[0][1];
}
// punt en kanteling op het voorvlak van het midden van het dashboard op hoogte y (off = afstand naar buiten)
function intFace(y, off = 0) {
  const F = intFacePts;
  for (let i = 0; i < F.length - 1; i++) if (y <= F[i][1] + 1e-9 && y >= F[i + 1][1] - 1e-9) {
    const U = F[i], L = F[i + 1], t = (U[1] - y) / (U[1] - L[1]), z = lerp(U[0], L[0], t), dz = U[0] - L[0], dy = U[1] - L[1], l = Math.hypot(dz, dy);
    return { z: z - off * dy / l, y: y + off * dz / l, rx: Math.atan2(dz, dy) };
  }
  return { z: F[F.length - 1][0], y, rx: 0 };
}
function intDashboard() {
  const bx = intBx, cy = intCy;
  const skinPts = intOffset(intDashTopPts, intSkinT).concat(intOffset(intDashTopPts, -0.003).reverse());
  const fasPts = intOffset(intFacePts, 0.018).concat(intOffset(intFacePts, 0).reverse());
  // luchtroosters: huis plus lamellen, op de schuine rand tussen dashboardkop en voorvlak
  const ventGroup = (name, x, d) => { const f = intFace(0.862, 0.022); return A(name, { d, p: [x, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0.03, -0.1] }, [
    intPart('Roosterhuis', G.rbox(0.11, 0.05, 0.02, 0.008), MAT.satin, 'Omlijsting van het luchtrooster.', { ex: [0, 0.02, -0.04] }),
    intPart('Lamellen', merge([-0.012, 0, 0.012].map(y => xf(G.box(0.095, 0.004, 0.012), [0, y, -0.004]))), MAT.plastic, 'Verstelbare horizontale lamellen die de luchtstroom richten.', { ex: [0, 0, -0.06] }),
  ]); };
  const clF = intFace(0.89, 0.026);
  const cluster = A('Instrumentenpaneel', { d: 'Instrumentenpaneel met analoge wijzers en een LCD-informatiedisplay (volgens de brochurebeelden; de indeling van de wijzerplaten is schematisch).', p: [0.37, clF.y, clF.z], r: [0.5, 0, 0], ex: [0, 0.04, -0.14] }, [
    intPart('Instrumentenbehuizing', G.rbox(0.28, 0.1, 0.06, 0.012), MAT.plastic, 'Behuizing met printplaat achter het glas.', { ex: [0, 0, 0.06] }),
    intPart('Toerenteller', merge([xf(G.cyl('z', 0.04, 0.04, 0.004, 28), [0.075, 0, -0.031]), xf(G.torus('z', 0.041, 0.0035, 28, 6), [0.075, 0, -0.032])]), MAT.screen, 'Toerenteller met chromen ring.', { ex: [0, 0, -0.03] }),
    intPart('Snelheidsmeter', merge([xf(G.cyl('z', 0.04, 0.04, 0.004, 28), [-0.075, 0, -0.031]), xf(G.torus('z', 0.041, 0.0035, 28, 6), [-0.075, 0, -0.032])]), MAT.screen, 'Snelheidsmeter met chromen ring.', { ex: [0, 0, -0.03] }),
    intPart('Informatiedisplay', G.rbox(0.05, 0.034, 0.004, 0.003), MAT.satin, 'LCD tussen de wijzerplaten voor boordcomputer en standindicatie van de automaat.', { p: [0, 0, -0.031], ex: [0, 0, -0.05] }),
    intPart('Wijzers', merge([xf(G.box(0.003, 0.034, 0.002), [0.075 + 0.012, 0.012, -0.036], [0, 0, 0.7]), xf(G.box(0.003, 0.034, 0.002), [-0.075 - 0.01, 0.01, -0.036], [0, 0, -0.9])]), MAT.red, 'Wijzers van toerenteller en snelheidsmeter.', { ex: [0, 0, -0.08] }),
    intPart('Instrumentenglas', G.box(0.27, 0.09, 0.004), MAT.lensClear, 'Doorzichtig kapglas voor de instrumenten.', { p: [0, 0, -0.036], ex: [0, 0, -0.14] }),
    intPart('Instrumentenkap', G.rbox(0.31, 0.014, 0.1, 0.006), MAT.dash, 'Kap boven de instrumenten tegen reflecties in de voorruit.', { p: [0, 0.056, -0.03], ex: [0, 0.08, -0.03] }),
  ]);
  const nav = A('Navigatiescherm', { d: 'Scherm van de Carminat TomTom Live-navigatie, bovenop het dashboard in het midden (positie aannemelijk); bediening met de joystick op de middenconsole.', spec: [['Schermdiagonaal', '14 cm']], p: [0, intDashTop(0.66) - 0.002, 0.66], r: [0.35, 0, 0], ex: [0, 0.16, -0.06] }, [
    intPart('Schermvoet', G.rbox(0.12, 0.03, 0.05, 0.008), MAT.plastic, 'Voet waarin het scherm in het dashboard steekt.', { p: [0, 0.01, 0.0], ex: [0, -0.03, 0] }),
    intPart('Schermbehuizing', G.rbox(0.2, 0.12, 0.04, 0.01), MAT.plastic, 'Behuizing van het scherm met bedieningstoetsen.', { p: [0, 0.075, 0], ex: [0, 0.03, 0.03] }),
    intPart('Schermglas', G.box(0.145, 0.085, 0.004), MAT.screen, 'Beeldscherm van de navigatie.', { p: [0, 0.078, -0.021], ex: [0, 0.02, -0.08] }),
  ]);
  const audio = (() => { const f = intFace(0.795, 0.03); return A('Audiobediening', { d: 'Bediening van de audio: radiopaneel van de Carminat met cd-sleuf en twee draaiknoppen; Bose-geluidssysteem met tien luidsprekers, waarvan er negen zijn weergegeven (drie in het dashboard, twee op de achterplank, vier in de portieren); de tiende is niet getoond.', p: [0, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }, [
    intPart('Audiopaneel', G.rbox(0.2, 0.06, 0.016, 0.006), MAT.blackGloss, 'Pianozwart paneel met de audiobediening.', { ex: [0, 0, -0.02] }),
    intPart('CD-sleuf', G.box(0.09, 0.006, 0.004), MAT.plastic, 'Sleuf voor de cd.', { p: [0, 0.01, -0.009], ex: [0, 0, -0.06] }),
    intPart('Volumeknop', G.cyl('z', 0.014, 0.014, 0.014, 20), MAT.chrome, 'Draaiknop voor het volume.', { p: [-0.075, -0.004, -0.014], ex: [0, 0, -0.08] }),
    intPart('Zoekknop', G.cyl('z', 0.014, 0.014, 0.014, 20), MAT.chrome, 'Draaiknop voor zender of titel.', { p: [0.075, -0.004, -0.014], ex: [0, 0, -0.08] }),
  ]); })();
  const climate = (() => { const f = intFace(0.69, 0.03); return A('Klimaatbediening', { d: 'Bediening van de automatische tweezone-klimaatregeling met toxiciteitssensor en automatische recirculatie.', p: [0, f.y, f.z], r: [f.rx, 0, 0], ex: [0, -0.02, -0.14] }, [
    intPart('Klimaatpaneel', G.rbox(0.22, 0.08, 0.016, 0.006), MAT.plasticGrey, 'Paneel met de bediening van de klimaatregeling.', { ex: [0, 0, -0.02] }),
    intPart('Temperatuurknop bestuurder', G.cyl('z', 0.016, 0.016, 0.014, 20), MAT.satin, 'Draaiknop voor de temperatuur aan bestuurderszijde.', { p: [0.075, 0, -0.014], ex: [0.02, 0, -0.08] }),
    intPart('Temperatuurknop passagier', G.cyl('z', 0.016, 0.016, 0.014, 20), MAT.satin, 'Draaiknop voor de temperatuur aan passagierszijde.', { p: [-0.075, 0, -0.014], ex: [-0.02, 0, -0.08] }),
    intPart('Ventilatorknop', G.cyl('z', 0.013, 0.013, 0.014, 20), MAT.satin, 'Draaiknop voor de ventilatorstand.', { p: [0, -0.016, -0.014], ex: [0, -0.02, -0.08] }),
    intPart('Klimaattoetsen', merge([-0.03, -0.01, 0.01, 0.03].map(x => xf(G.rbox(0.014, 0.01, 0.006, 0.002), [x, 0.022, -0.011]))), MAT.plastic, 'Toetsen voor recirculatie, ontwasemen en airco.', { ex: [0, 0.02, -0.07] }),
  ]); })();
  const speakers = A('Luidsprekers dashboard', { d: 'Bose-luidsprekers in het dashboard: een middenluidspreker van 10 cm en twee hoogtonerluidsprekers; het Bose-systeem heeft tien luidsprekers, waarvan er negen zijn weergegeven (drie hier, twee op de achterplank, vier in de portieren); de overige is niet getoond en de posities zijn geschat.', ex: [0, 0.14, 0] }, [
    intPart('Roostermiddenluidspreker', G.rbox(0.12, 0.004, 0.1, 0.002), MAT.plastic, 'Rooster boven de middenluidspreker.', { p: [0, intDashTop(0.86) + 0.0005, 0.86], ex: [0, 0.08, 0] }),
    intPart('Middenluidspreker', merge([xf(G.cyl('y', 0.05, 0.03, 0.03, 24), [0, 0, 0]), xf(G.cyl('y', 0.018, 0.018, 0.012, 16), [0, 0.012, 0])]), MAT.darkSteel, 'Luidspreker van 10 cm in het midden van het dashboard.', { p: [0, intDashTop(0.86) - 0.025, 0.86], inner: true, ex: [0, 0.04, 0] }),
    ...[1, -1].map(s => intPart(`Hoogtonerrooster ${sideName(s)}`, G.rbox(0.05, 0.004, 0.04, 0.002), MAT.plastic, 'Rooster boven de hoogtonerluidspreker bij de A-stijl.', { p: [s * 0.62, intDashTop(0.9) + 0.0005, 0.9], ex: [s * 0.04, 0.08, 0] })),
    ...[1, -1].map(s => intPart(`Hoogtoner ${sideName(s)}`, G.cyl('y', 0.018, 0.016, 0.02, 14), MAT.darkSteel, 'Hoogtonerluidspreker (tweeter).', { p: [s * 0.62, intDashTop(0.9) - 0.015, 0.9], inner: true, ex: [s * 0.04, 0.04, 0] })),
  ]);
  const glove = (() => { const f = intFace(0.69, 0.008); return A('Handschoenenkastje', { d: 'Afsluitbaar, groot handschoenenkastje met demper en de filters erachter.', p: [-0.38, f.y, f.z], r: [f.rx, 0, 0], ex: [0, -0.05, -0.16] }, [
    intPart('Handschoenenkastklep', G.rbox(0.4, 0.15, 0.02, 0.008), MAT.dash, 'Klep die naar beneden opent.', { ex: [0, -0.06, -0.1] }),
    intPart('Handschoenenkastslot', G.rbox(0.05, 0.02, 0.012, 0.004), MAT.plasticGrey, 'Sluiting met greep in de bovenrand van de klep.', { p: [0, 0.065, -0.014], ex: [0, 0.04, -0.06] }),
    intPart('Handschoenenkastbak', G.rbox(0.36, 0.13, 0.2, 0.02), MAT.plasticGrey, 'Bak achter de klep.', { p: [0, 0, 0.11], inner: true, ex: [0, 0, 0.06] }),
    intPart('Handschoenenkastdemper', xf(G.cyl('x', 0.007, 0.007, 0.1, 8), [0, -0.05, 0.05]), MAT.darkSteel, 'Demper die de klep gecontroleerd laat zakken.', { inner: true, ex: [0, -0.06, 0.04] }),
  ]); })();
  const airbag = A('Passagiersairbag', { d: 'Airbag aan passagierszijde, uit te schakelen met de sleutelschakelaar, achter een klep in de bovenkant van het dashboard.', p: [-0.38, 0, 0.7], ex: [0, 0.22, 0] }, [
    intPart('Airbagklep', G.rbox(0.3, 0.008, 0.2, 0.003), MAT.dash, 'Scheurnaad in het dashboard die bij ontsteking openklapt.', { p: [0, intDashTop(0.7) - 0.0015, 0], ex: [0, 0.1, 0] }),
    intPart('Airbagbehuizing', G.rbox(0.28, 0.1, 0.18, 0.012), MAT.plastic, 'Behuizing van de airbagmodule.', { p: [0, 0.89, 0], inner: true, ex: [0, 0.04, 0] }),
    intPart('Airbaggasgenerator', xf(G.cyl('x', 0.025, 0.025, 0.24, 14), [0, 0.88, 0.0]), MAT.darkSteel, 'Gasgenerator die de airbag vult.', { inner: true, ex: [0, -0.02, 0.06] }),
    intPart('Airbagkussen', G.rbox(0.22, 0.04, 0.14, 0.012), MAT.fabric, 'Opgevouwen airbagkussen.', { p: [0, 0.93, 0], inner: true, ex: [0, 0.06, 0] }),
  ]);
  const uch = (() => { const f = intFace(0.66, 0.008); return intPart('Onderpaneel bestuurder', G.rbox(0.36, 0.12, 0.014, 0.006), MAT.dash, 'Onderpaneel met afdekklep links van de stuurkolom onderin het dashboard (linkse besturing). Achter het paneel zitten de centrale cabine-unit (UCH) en de zekeringen; die horen bij het elektrische systeem.', { p: [0.37, f.y, f.z], r: [f.rx, 0, 0], ex: [0, -0.08, -0.14] }); })();
  const beam = A('Dwarsbalk dashboard', { d: 'Stalen dwarsbalk die stuurkolom, dashboard en klimaatunit draagt; zit in de carrosserie tussen de A-stijlen.', ex: [0, -0.1, -0.12], inner: true }, [
    intPart('Dwarsbalkbuis', xf(G.cyl('x', 0.03, 0.03, 1.44, 16), [0, 0.8, 0.72]), MAT.steel, 'Hoofdbuis van de dwarsbalk.', { ex: [0, 0, 0.04] }),
    intPart('Eindplaten dwarsbalk', merge([bx(0.012, 0.2, 0.2, 0.004, [0.72, 0.78, 0.72]), bx(0.012, 0.2, 0.2, 0.004, [-0.72, 0.78, 0.72])]), MAT.darkSteel, 'Platen waarmee de balk aan de A-stijlen vastzit.', { ex: [0, 0, 0.06] }),
    intPart('Kolombeugel', bx(0.12, 0.2, 0.05, 0.008, [0.37, 0.76, 0.66]), MAT.darkSteel, 'Beugel waaraan de stuurkolom hangt.', { ex: [0.06, -0.06, -0.04] }),
    intPart('Middensteun', bx(0.04, 0.23, 0.04, 0.008, [0, 0.675, 0.72]), MAT.darkSteel, 'Steun van de balk op de tunnel.', { ex: [0, -0.1, 0] }),
  ]);
  const hvac = A('Klimaatunit', { d: 'Klimaatunit onder het dashboard (opbouw zoals gebruikelijk bij een tweezone-unit; schematisch en compact, volledig binnen het dashboard): huis in twee helften met aanjager, verdamper, kachelradiateur, mengkleppen en filter.', p: [0, 0.66, 0.72], s: [0.7, 0.7, 0.7], ex: [0, -0.22, 0.05], inner: true }, [
    intPart('Kachelhuis boven', G.rbox(0.5, 0.14, 0.24, 0.02), MAT.plastic, 'Bovenste helft van het unithuis.', { p: [0, 0.075, 0], ex: [0, 0.12, 0] }),
    intPart('Kachelhuis onder', G.rbox(0.5, 0.14, 0.24, 0.02), MAT.plasticGrey, 'Onderste helft van het unithuis.', { p: [0, -0.075, 0], ex: [0, -0.1, 0] }),
    intPart('Verdamper', G.rbox(0.3, 0.16, 0.045, 0.004), MAT.alu, 'Verdamper van de airco: koelt en ontvochtigt de lucht.', { p: [0, 0, -0.06], ex: [0, 0, -0.1] }),
    intPart('Kachelradiateur', G.rbox(0.3, 0.16, 0.03, 0.004), MAT.heater, 'Warmtewisselaar die de lucht met koelvloeistof opwarmt.', { p: [0, 0, 0.0], ex: [0, 0, 0.03] }),
    intPart('Mengkleppen', merge([bx(0.28, 0.005, 0.07, 0.002, [0, 0.05, 0.08], [0.5, 0, 0]), bx(0.28, 0.005, 0.07, 0.002, [0, -0.05, 0.08], [-0.5, 0, 0])]), MAT.steel, 'Kleppen die warme en koude lucht mengen en over de uitstroomopeningen verdelen.', { ex: [0, 0, 0.1] }),
    intPart('Aanjagerhuis', G.cyl('x', 0.08, 0.08, 0.14, 24), MAT.plastic, 'Slakkenhuis van de aanjager aan passagierszijde.', { p: [-0.33, -0.03, 0], ex: [-0.12, 0, 0] }),
    intPart('Aanjagerwaaier', blades(18, 0.018, 0.066, 0.1, 0.004, 0.2, 'x'), MAT.steel, 'Waaier van de aanjager.', { p: [-0.33, -0.03, 0], ex: [-0.2, 0, 0] }),
    intPart('Aanjagermotor', G.cyl('x', 0.03, 0.03, 0.08, 16), MAT.darkSteel, 'Elektromotor van de aanjager.', { p: [-0.42, -0.03, 0], ex: [-0.3, 0, 0] }),
    intPart('Servomotoren', merge([bx(0.04, 0.03, 0.03, 0.006, [0.2, 0.1, -0.1]), bx(0.04, 0.03, 0.03, 0.006, [0.2, -0.1, 0.1]), bx(0.04, 0.03, 0.03, 0.006, [-0.2, 0.1, 0.1])]), MAT.plastic, 'Stelmotoren van de mengkleppen en de recirculatieklep (aantal geschat).', { ex: [0.1, 0, 0] }),
    intPart('Pollen- en koolstoffilter', G.rbox(0.26, 0.04, 0.12, 0.004), MAT.filter, 'Combinatiefilter tegen stuifmeel en geuren; het filter zit achter het handschoenenkastje.', { p: [-0.1, 0.12, -0.04], ex: [-0.1, 0.1, 0] }),
  ]);
  const harness = A('Kabelboom dashboard', { d: 'Kabelboom van het dashboard met connectorblokken (schematisch).', ex: [0, -0.1, -0.1], inner: true }, [
    intPart('Kabelboom', tube([[0.7, 0.74, 0.58], [0.35, 0.73, 0.6], [0, 0.72, 0.6], [-0.35, 0.73, 0.6], [-0.7, 0.74, 0.58]], 0.012, 32, 6), MAT.plastic, 'Hoofdkabelboom langs de dwarsbalk.', { ex: [0, -0.04, 0] }),
    intPart('Connectorblok bestuurderszijde', G.rbox(0.07, 0.04, 0.03, 0.006), MAT.plasticGrey, 'Stekkerblok naar de UCH en het instrumentenpaneel.', { p: [0.55, 0.74, 0.58], ex: [0.05, -0.04, 0] }),
    intPart('Connectorblok passagierszijde', G.rbox(0.07, 0.04, 0.03, 0.006), MAT.plasticGrey, 'Stekkerblok naar airbag en klimaatunit.', { p: [-0.55, 0.74, 0.58], ex: [-0.05, -0.04, 0] }),
  ]);
  const huid = intPart('Dashboardhuid', side(shapeOf(skinPts), 1.5), MAT.dash, 'Gestikte (surpique) bovenkant van het dashboard over de draagstructuur.', { ex: [0, 0.14, 0.05] });
  const carrier = intPart('Dashboarddrager', side(shapeOf(intDashPf), 1.5), MAT.dash, 'Kunststof draagstructuur van het dashboard met het voorvlak; hier loopt de stuurkolom doorheen.', { ex: [0, 0.0, 0.1] });
  const fascia = intPart('Dashboardmiddenpaneel', side(shapeOf(fasPts), 0.26), MAT.blackGloss, 'Pianozwart paneel in het midden van het dashboard (bij fase 2 in plaats van hout).', { ex: [0, 0, -0.06] });
  const defrost = intPart('Ontwasemroosters', merge([xf(G.box(0.9, 0.004, 0.035), [0, intDashTop(0.97) + 0.0005, 0.97]), xf(G.box(0.08, 0.004, 0.05), [0.7, intDashTop(0.9) + 0.0005, 0.92]), xf(G.box(0.08, 0.004, 0.05), [-0.7, intDashTop(0.9) + 0.0005, 0.92])]), MAT.plastic, 'Sleuven die lucht tegen de voorruit en de zijruiten blazen.', { ex: [0, 0.1, 0] });
  const caps = [1, -1].map(s => intPart(`Dashboardeindkap ${sideName(s)}`, G.rbox(0.012, 0.3, 0.38, 0.004), MAT.plasticGrey, 'Kap op het uiteinde van het dashboard naast de portier.', { p: [s * 0.757, 0.8, 0.78], ex: [s * 0.14, 0, 0] }));
  const hazard = (() => { const f = intFace(0.862, 0.024); return intPart('Alarmlichtschakelaar', G.rbox(0.045, 0.04, 0.014, 0.004), MAT.red, 'Schakelaar voor de alarmknipperlichten tussen de middelste roosters.', { p: [0, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0.05, -0.1] }); })();
  return A('Dashboard', { d: 'Dashboard met instrumentenpaneel, navigatiescherm, klimaat- en audiobediening, luchtroosters, handschoenenkastje, passagiersairbag, klimaatunit en dwarsbalk.', ex: [0, 0.16, 0.6] }, [
    A('Dashboardschil', { d: 'Draagstructuur en zichtbare bekleding van het dashboard: drager, gestikte huid, pianozwart middenpaneel, eindkappen en de ontwasemsleuven.', ex: [0, 0.3, 0.3] }, [carrier, huid, fascia, ...caps, defrost]),
    A('Luchtroosters', { d: 'Vier verstelbare luchtroosters: twee in het midden en twee aan de zijkanten van het dashboard.', ex: [0, 0.04, -0.06] }, [
      ventGroup('Luchtrooster midden links', 0.1, 'Verstelbaar middenrooster aan bestuurderszijde.'), ventGroup('Luchtrooster midden rechts', -0.1, 'Verstelbaar middenrooster aan passagierszijde.'),
      ventGroup('Luchtrooster zij links', 0.62, 'Verstelbaar zijrooster aan bestuurderszijde, richt de lucht op de zijruit of het gezicht.'), ventGroup('Luchtrooster zij rechts', -0.62, 'Verstelbaar zijrooster aan passagierszijde.'),
    ]),
    cluster, nav,
    A('Bedieningspanelen', { d: 'Bediening van audio en klimaat en de alarmlichtschakelaar op het middenpaneel.', ex: [0, 0, -0.05] }, [audio, climate, hazard]),
    speakers, glove, airbag, uch, beam, hvac, harness,
  ]);
}

/* ---------- middenconsole ---------- */
function intConsole() {
  const bx = intBx, cy = intCy;
  const cup = G.lathe('y', [[0.035, 0], [0.035, -0.06], [0, -0.06]], 24, 'intCup');
  const knob = G.lathe('y', [[0, 0.06], [0.016, 0.062], [0.02, 0.08], [0.015, 0.1], [0, 0.103]], 20, 'intKnob');
  const boot = G.lathe('y', [[0.05, 0], [0.03, 0.012], [0.02, 0.028], [0, 0.028]], 20, 'intBoot');
  const stick = G.lathe('y', [[0, 0], [0.017, 0], [0.019, 0.012], [0.012, 0.024], [0, 0.026]], 16, 'intStick');
  const sel = A('Keuzehendelmodule', { d: 'Keuzehendel van de automaat met poort P-R-N-D, ontgrendelknop op de hendel (rempedaal nodig) en een handmatige stand door de hendel naar links te duwen; de standindicatie staat in het instrumentenpaneel.', p: [0, 0.495, 0.2], ex: [0, 0.18, 0] }, [
    intPart('Standaanduiding', G.rbox(0.12, 0.006, 0.2, 0.003), MAT.satin, 'Afdekplaat met de poort en de standaanduiding.', { p: [0, -0.003, 0], ex: [0, 0.04, 0] }),
    intPart('Keuzehendelhoes', boot, MAT.rubber, 'Rubber hoes die de poort afdicht.', { ex: [0, 0.08, 0] }),
    intPart('Keuzehendel', merge([xf(G.cyl('y', 0.007, 0.007, 0.07, 10), [0, 0.035, 0]), knob]), MAT.leather, 'Hendel met lederen knop.', { ex: [0, 0.16, 0] }),
    intPart('Ontgrendelknop hendel', xf(G.cyl('z', 0.006, 0.006, 0.01, 10), [0, 0.075, -0.018]), MAT.chrome, 'Drukknop in de knop die de hendel uit de parkeerstand vrijgeeft.', { ex: [0, 0.18, -0.06] }),
    intPart('Keuzehendelhuis', G.rbox(0.1, 0.07, 0.16, 0.012), MAT.darkSteel, 'Mechaniekhuis met de poort onder de plaat.', { p: [0, -0.045, 0], inner: true, ex: [0, -0.08, 0] }),
    intPart('Keuzekabel', tube([[0, -0.05, 0.08], [0, -0.062, 0.16], [0, -0.07, 0.24]], 0.005, 12, 6), MAT.steel, 'Schakelkabel naar de automaatbak, hier kort weergegeven; de aansluiting op de bak hoort bij de aandrijflijn.', { inner: true, ex: [0, -0.1, 0.1] }),
  ]);
  const arm = A('Armsteun middenconsole', { d: 'Armsteun met opbergvak en 12 V-aansluiting.', p: [0, 0.525, -0.26], ex: [0, 0.14, -0.05] }, [
    intPart('Armsteunkussen', bx(0.2, 0.035, 0.3, 0.015, [0, 0.0175, 0]), MAT.leather, 'Gevoerd deksel van de armsteun.', { ex: [0, 0.14, -0.06] }),
    intPart('Armsteunscharnier', xf(G.cyl('x', 0.008, 0.008, 0.14, 10), [0, 0.0, -0.14]), MAT.darkSteel, 'Scharnieras achter in de armsteun.', { ex: [0, 0.04, -0.06] }),
    intPart('Armsteunslot', bx(0.04, 0.012, 0.012, 0.004, [0, 0.0, 0.15]), MAT.plasticGrey, 'Sluiting aan de voorkant van het deksel.', { ex: [0, 0.06, 0.06] }),
    intPart('Opbergbak', bx(0.18, 0.05, 0.26, 0.012, [0, -0.025, 0]), MAT.plastic, 'Opbergvak onder het deksel.', { ex: [0, -0.04, 0] }),
    intPart('Aansluiting 12 V', merge([xf(G.cyl('z', 0.013, 0.013, 0.014, 14), [0, -0.025, 0.125])]), MAT.darkSteel, 'Aansluiting van 12 V in het opbergvak.', { inner: true, ex: [0, 0, 0.08] }),
  ]);
  return A('Middenconsole', { d: 'Middenconsole met keuzehendel, joystick van de navigatie, kaartlezer, startknop, parkeerremschakelaar, bekerhouders en armsteun.', ex: [0, 0.12, 0.05] }, [
    intPart('Consolebehuizing', G.rbox(0.24, 0.08, 0.87, 0.03), MAT.dash, 'Kunststof console op de vloertunnel, boven het tapijt.', { p: [0, 0.45, 0.015], ex: [0, -0.06, 0] }),
    intPart('Consoleinzetstuk', G.rbox(0.15, 0.004, 0.52, 0.002), MAT.blackGloss, 'Pianozwart inzetstuk op de console (hoogglans).', { p: [0, 0.491, 0.0], ex: [0, 0.05, 0] }),
    intPart('Consolevoorpaneel', G.rbox(0.24, 0.21, 0.175, 0.03), MAT.dash, 'Voorste deel van de console onder de klimaatbediening, loopt door in het dashboard.', { p: [0, 0.515, 0.5125], ex: [0, 0, 0.1] }),
    sel,
    intPart('Kaartlezer', G.rbox(0.1, 0.03, 0.03, 0.008), MAT.plastic, 'Lezer voor de handsfree Renault-kaart; de exacte plaats is voor dit model niet gevonden (aannemelijk hier).', { p: [0, 0.575, 0.418], ex: [0, 0, -0.1] }),
    intPart('Startknop', G.cyl('z', 0.015, 0.015, 0.012, 20), MAT.chrome, 'Start-/stopknop van de motor.', { p: [0.08, 0.575, 0.413], ex: [0, 0, -0.12] }),
    intPart('Parkeerremschakelaar', G.rbox(0.04, 0.015, 0.05, 0.005), MAT.plastic, 'Schakelaar van de elektrische parkeerrem.', { p: [0.07, 0.496, 0.34], ex: [0.04, 0.1, 0] }),
    A('Joystick navigatie', { d: 'Joystick op de middenconsole waarmee het navigatiescherm van de Carminat wordt bediend.', p: [0, 0.495, 0.03], ex: [0, 0.1, 0] }, [
      intPart('Joystickbasis', G.cyl('y', 0.03, 0.03, 0.008, 20), MAT.satin, 'Ring rond de joystick.', { p: [0, 0.002, 0], ex: [0, 0.02, 0] }),
      intPart('Joystickknop', stick, MAT.plasticGrey, 'Kantelbare en draaibare knop.', { p: [0, 0.006, 0], ex: [0, 0.06, 0] }),
    ]),
    A('Bekerhouders', { d: 'Twee bekerhouders achter de keuzehendel.', ex: [0, 0.08, 0] }, [
      intPart('Bekerhouder links', cup, MAT.plastic, 'Bekerhouder links in de console.', { p: [0.055, 0.49, -0.06], ex: [0.03, 0.08, 0] }),
      intPart('Bekerhouder rechts', cup, MAT.plastic, 'Bekerhouder rechts in de console.', { p: [-0.055, 0.49, -0.06], ex: [-0.03, 0.08, 0] }),
    ]),
    arm,
    A('Achterventilatie console', { d: 'Luchtkanaal in de console, boven de tunnel, naar de roosters aan de achterkant van de console.', ex: [0, -0.06, -0.12] }, [
      intPart('Luchtkanaal achterbank', G.rbox(0.1, 0.04, 0.8, 0.012), MAT.plasticGrey, 'Kanaal dat de lucht van de klimaatunit naar de achterpassagiers leidt, in de console boven de tunnel.', { p: [0, 0.43, 0.0], inner: true, ex: [0, -0.1, 0] }),
      intPart('Achterrooster links', G.rbox(0.07, 0.03, 0.015, 0.006), MAT.satin, 'Rooster voor de achterpassagiers.', { p: [0.05, 0.44, -0.428], ex: [0.03, 0, -0.1] }),
      intPart('Achterrooster rechts', G.rbox(0.07, 0.03, 0.015, 0.006), MAT.satin, 'Rooster voor de achterpassagiers.', { p: [-0.05, 0.44, -0.428], ex: [-0.03, 0, -0.1] }),
    ]),
  ]);
}
/* ---------- bekleding, pedalen, spiegel ---------- */
function intTrim() {
  const bx = intBx, cy = intCy;
  const carpet = front(shapeOf([[-0.8, 0.25], [-0.169, 0.25], [-0.128, 0.41], [0.128, 0.41], [0.169, 0.25], [0.8, 0.25], [0.8, 0.24], [0.164, 0.24], [0.12, 0.4], [-0.12, 0.4], [-0.164, 0.24], [-0.8, 0.24]]), 1.65); carpet.translate(0, 0, 0.125);
  // hemeloppervlak (de hemelbekleding ligt 8 mm onder intRoofY, 3,5 % naar binnen) en de helling ervan in lengte- en dwarsrichting
  const hl = (z, ax) => intRoofY(z, ax / 0.965) - 0.008, hlSlope = (z, ax) => (hl(z + 0.05, ax) - hl(z - 0.05, ax)) / 0.1;
  const handle = (s, z, n) => intPart(`Dakgreep ${n} ${sideName(s)}`, merge([bx(0.022, 0.024, 0.15, 0.008, [0, 0, 0]), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, 0.075]), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, -0.075])]), MAT.plasticGrey, 'Handgreep boven het portier met klapscharnier.', { p: [s * 0.6, hl(z, 0.6) - 0.021, z], r: [-hlSlope(z, 0.6), 0, 0], ex: [s * 0.1, -0.08, 0] });
  const visor = s => { const zc = 0.27; return A(`Zonneklep ${sideName(s)}`, { d: 'Zonneklep met make-upspiegel en verlichting; schuin langs de voorruitrand gemonteerd.', p: [s * 0.36, hl(zc, 0.36) - 0.009, zc], r: [-hlSlope(zc, 0.36), 0, s * (hl(zc, 0.56) - hl(zc, 0.16)) / 0.4], ex: [0, 0.3, 0.1] }, [
    intPart('Zonnekleppaneel', G.rbox(0.4, 0.012, 0.17, 0.006), MAT.fabric, 'Gevoerd paneel van de zonneklep.', { ex: [0, 0.06, 0] }),
    intPart('Make-upspiegel', G.rbox(0.14, 0.002, 0.07, 0.001), MAT.reflector, 'Spiegel onder het klepje, met lampje.', { p: [0, -0.007, 0], ex: [0, -0.06, 0] }),
    intPart('Zonneklepas', xf(G.cyl('x', 0.004, 0.004, 0.3, 8), [0, 0.0, -0.09]), MAT.steel, 'Draaias langs de dakrand.', { ex: [0, 0.04, -0.05] }),
  ]); };
  const mat = (s, n) => intPart(`Vloermat ${n}`, G.rbox(0.4, 0.012, 0.5, 0.005), MAT.rubber, 'Losse vloermat voor de voetruimte.', { p: [s * 0.37, 0.256, 0.55], ex: [0, 0.1, 0.1] });
  const sill = (s, z, len, n) => intPart(`Instaplijst ${n} ${sideName(s)}`, G.rbox(0.05, 0.01, len, 0.004), MAT.plasticGrey, 'Kunststof dorpellijst bij het instappen.', { p: [s * (surfX(z, 0.26) - 0.05), 0.248, z], ex: [s * 0.1, 0.05, 0] });
  const curtain = s => { const pts = []; for (let i = 0; i <= 12; i++) { const z = 0.2 - 1.9 * i / 12, p = ghPt(z, 0.235); pts.push([s * Math.abs(p[0]) * 0.965, p[1] - 0.036, z]); } return intPart(`Gordijnairbag ${sideName(s)}`, tube(pts, 0.007, 36, 6), MAT.fabric, 'Opgerolde gordijnairbag langs de dakrand, naast de rand van de hemel, beschermt hoofd en schouders bij een zijdelingse botsing; in het model zonder dakrailbekleding, dus zichtbaar aan de dakrand.', { ex: [s * 0.1, 0.1, 0] }); };
  const roofZ = -0.02, lampY = intRoofY(roofZ, 0);
  return A('Bekleding', { d: 'Hemel met zonkleppen, grepen en plafonniers, vloerbedekking met matten, dorpellijsten en de bekleding van de bagageruimte met de luidsprekers van de achterplank en de versterker.', ex: [0, 0.4, 0] }, [
    A('Dakbekleding', { d: 'Hemel met zonkleppen, handgrepen, plafonniers en de opgerolde gordijnairbags.', ex: [0, 0.3, 0] }, [
    intPart('Hemelbekleding', patch((z, w) => { const p = ghPt(z, w); return [p[0] * 0.965, p[1] - 0.028, p[2]]; }, -1.75, 0.4, 34, () => [0.24, 0.76], 12), MAT.fabric, 'Lichtbeige hemelbekleding.', { ex: [0, 0.48, 0] }),
    visor(1), visor(-1),
    handle(1, 0.0, 'voor'), handle(-1, 0.0, 'voor'), handle(1, -0.9, 'achter'), handle(-1, -0.9, 'achter'),
    A('Plafonnier voor', { d: 'Plafonnier met twee leeslampjes voor de voorpassagiers.', p: [0, lampY - 0.01, roofZ], ex: [0, 0.2, 0] }, [
      intPart('Lamphuis voor', G.rbox(0.3, 0.02, 0.1, 0.008), MAT.plasticGrey, 'Behuizing van het plafonnier.', { ex: [0, 0.04, 0] }),
      ...[1, -1].map(s => intPart(`Leeslampje ${sideName(s)}`, G.cyl('y', 0.025, 0.025, 0.004, 16), MAT.lensClear, 'Leeslampje met lens.', { p: [s * 0.1, -0.011, 0], ex: [0, -0.06, 0] })),
    ]),
    intPart('Plafonnier achter', G.rbox(0.12, 0.016, 0.07, 0.006), MAT.plasticGrey, 'Middenlamp achter met lens.', { p: [0, intRoofY(-0.9, 0) - 0.01, -0.9], ex: [0, 0.2, 0] }),
    curtain(1), curtain(-1),
    ]),
    A('Vloerbekleding', { d: 'Vloerbedekking met losse matten en de dorpellijsten.', ex: [0, -0.1, 0] }, [
    intPart('Vloerbedekking', carpet, MAT.carpet, 'Getufte vloerbedekking als dunne laag op de vloer en over de tunnel; de uitlaat in de tunnel blijft eronder vrij.', { ex: [0, -0.22, 0] }),
    mat(1, 'bestuurder'), mat(-1, 'passagier'),
    sill(1, 0.2, 0.8, 'voor'), sill(-1, 0.2, 0.8, 'voor'), sill(1, -0.78, 0.44, 'achter'), sill(-1, -0.78, 0.44, 'achter'),
    ]),
    A('Bagageruimte', { d: 'Bekleding van de bagageruimte met hoedenplank, vloerplaat, de luidsprekers van de achterplank en de versterker.', ex: [0, 0.0, -0.3] }, [
    intPart('Hoedenplank', G.rbox(1.3, 0.012, 0.55, 0.005), MAT.carpet, 'Afdekplaat achter de achterbank boven de bagageruimte; in dit model los van de achterklep.', { p: [0, 1.0, -1.85], ex: [0, 0.3, -0.2] }),
    ...[1, -1].map(s => intPart(`Achterplankluidspreker ${sideName(s)}`, merge([xf(G.cyl('y', 0.065, 0.065, 0.008, 24), [0, 0, 0]), xf(G.cyl('y', 0.04, 0.025, 0.02, 20), [0, -0.012, 0])]), MAT.darkSteel, 'Luidspreker in de achterplank (Bose, positie geschat).', { p: [s * 0.45, 1.01, -1.7], ex: [s * 0.1, 0.2, 0] })),
    intPart('Bagageruimtevloer', G.rbox(1.2, 0.015, 0.75, 0.005), MAT.carpet, 'Vloerplaat van de bagageruimte (450 tot 1377 liter).', { p: [0, 0.46, -1.86], ex: [0, -0.12, -0.3] }),
    intPart('Versterker Bose', G.rbox(0.28, 0.06, 0.2, 0.01), MAT.ecu, 'Digitale versterker met zes kanalen van het Bose-systeem, links achter in een opbergvak (plaats aannemelijk).', { p: [0.5, 0.4975, -2.0], ex: [0.1, 0.12, -0.1] }),    ])
  ]);
}
function intPedals() {
  const bx = intBx;
  return A('Pedalen', { d: 'Rem- en gaspedaal; een automaat heeft geen koppelingspedaal.', ex: [0.12, -0.1, 0.38] }, [
    intPart('Pedaalbok', bx(0.18, 0.2, 0.1, 0.01, [0.33, 0.72, 0.86]), MAT.darkSteel, 'Steun waarin de pedalen scharnieren.', { ex: [0, 0.1, 0.08] }),
    intPart('Rempedaalarm', rodBetween([0.4, 0.72, 0.86], [0.4, 0.42, 0.74], 0.01), MAT.steel, 'Pedaalarm die de rembekrachtiger bedient.', { ex: [0.04, 0, 0.04] }),
    intPart('Rempedaalpad', bx(0.13, 0.065, 0.012, 0.005, [0.4, 0.4, 0.73], [-0.35, 0, 0]), MAT.rubber, 'Breed rempedaalrubber, typisch voor een automaat.', { ex: [0.04, 0, -0.06] }),
    intPart('Gaspedaalarm', rodBetween([0.23, 0.7, 0.86], [0.23, 0.4, 0.78], 0.006), MAT.steel, 'Arm van het elektronische gaspedaal.', { ex: [-0.04, 0, 0.04] }),
    intPart('Gaspedaalpad', bx(0.06, 0.15, 0.012, 0.005, [0.23, 0.36, 0.77], [-0.4, 0, 0]), MAT.rubber, 'Gaspedaalrubber.', { ex: [-0.06, 0, -0.06] }),
    intPart('Gaspedaalsensor', bx(0.04, 0.04, 0.03, 0.006, [0.23, 0.7, 0.8]), MAT.ecu, 'Stand-opnemer van het elektronische gaspedaal (drive-by-wire).', { ex: [-0.06, 0.04, 0] }),
    intPart('Remlichtschakelaar', xf(G.cyl('z', 0.012, 0.012, 0.04, 10), [0.4, 0.78, 0.8]), MAT.plasticGrey, 'Schakelaar die de remlichten inschakelt.', { ex: [0.05, 0.06, 0] }),
    intPart('Voetsteun', bx(0.07, 0.17, 0.02, 0.006, [0.58, 0.33, 0.76], [-0.6, 0, 0]), MAT.satin, 'Steun voor de linkervoet.', { ex: [0.08, 0, -0.04] }),
  ]);
}
function intMirror() {
  const zc = 0.46, yg = YR(zc) - 0.012, tilt = Math.atan((YR(zc - 0.05) - YR(zc + 0.05)) / 0.1), hy = yg - 0.09, hz = zc - 0.04;
  return A('Binnenspiegel', { d: 'Automatisch dimmende binnenspiegel, hangend aan de voorruit; de regen- en lichtsensor zit bij de carrosserie, achter de voorruit.', ex: [0, 0.32, 0.2] }, [
    intPart('Spiegelvoet binnen', G.rbox(0.04, 0.012, 0.05, 0.004), MAT.plastic, 'Voet die op de voorruit is gelijmd.', { p: [0, yg + 0.005, zc], r: [tilt, 0, 0], ex: [0, 0.06, 0.04] }),
    intPart('Spiegelarm', rodBetween([0, yg - 0.004, zc], [0, hy + 0.03, hz], 0.006, 8), MAT.plastic, 'Arm tussen voet en spiegelhuis.', { ex: [0, 0.04, 0] }),
    intPart('Spiegelhuis binnen', G.rbox(0.26, 0.065, 0.035, 0.015), MAT.plastic, 'Behuizing van de binnenspiegel.', { p: [0, hy, hz], ex: [0, -0.03, 0] }),
    intPart('Spiegelglas binnen', G.box(0.24, 0.05, 0.003), MAT.reflector, 'Elektrochroom spiegelglas dat automatisch dimt.', { p: [0, hy, hz - 0.019], ex: [0, 0, -0.08] }),
  ]);
}
function buildInterior() {
  const seats = A('Stoelen', { d: 'Voorstoelen met verwarming en elektrische verstelling, achterbank met gedeeld neerklapbare rugleuning en de veiligheidsgordels.', ex: [0, 0.26, -0.1] }, [frontSeat(1), frontSeat(-1), intRearBench(), intBelts()]);
  return A('Interieur', { d: 'Initiale-interieur met geperforeerd beige leder, stoelverwarming, Bose-audio (tien luidsprekers, negen weergegeven) en tweezone-klimaatregeling.', ex: [0, 0.66, 0] }, [intDashboard(), intConsole(), seats, intTrim(), intPedals(), intMirror()]);
}

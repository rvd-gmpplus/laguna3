/* ===================== interieur ===================== */
// Alles wat de carrosserie raakt (hemel, dakgrepen, spiegel, gordelgeleiders) volgt de functies YR, YT, surfX en ghPt van de carrosserie.
std('intFoam', 0x3a3834, 0, 1);
std('intBelt', 0x25272c, 0, 0.9);
std('intTray', 0xb9bdc3, 0, 0.9);   // lichtgrijs schuim van de opbergbak onder de bagagevloer: leest tegen de donkere vloerbekleding
std('intBoard', 0xe2ded4, 0, 0.9, { emissive: 0x55524b });    // onderzijde van de klapbare bagagevloer: lichte plaat, zodat de omhoog geklapte vloer leest tegen de donkere bekleding
std('intFelt', 0x3a3835, 0, 1);       // donker vilt van de bagageruimtebekleding: iets lichter dan de vloerbekleding, zodat vloer en wand te onderscheiden zijn
std('intSill', 0xd2d6db, 0.6, 0.3, { envMapIntensity: 1.2 });   // sierstrip op de instaplijst: lichter dan de lakdorpel en de vloer
const intPart = (name, geo, mat, d, o) => P(name, geo, mat, Object.assign({ d }, o));
// hoedenplank met pennen, koordjes en luidsprekers: uitgenomen zolang een opener in de bagageruimte open is (zoals een eigenaar doet)
const intPlankHide = ['Rugleuning groot deel', 'Rugleuning klein deel', 'Bagageruimtevloer'];
const intUit = n => { n.hideWhen = intPlankHide; return n; };
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
const intBox = (w, h, d, p) => xf(G.box(w, h, d), p);   // gewone doos (12 driehoeken) voor bakken en schotten
const intCy = (ax, r, h, p, seg = 12) => xf(G.cyl(ax, r, r, h, seg), p);
// openers en volgers met hinge en follow, de uitsparing in de dashboarddrager met clipPoly (alle drie uit core.js)
// zijprofiel (z,y) als blok tussen twee x-waarden
const intSideBlock = (poly, x0, x1) => poly.length > 2 ? xf(side(shapeOf(poly), x1 - x0), [(x0 + x1) / 2, 0, 0]) : null;

function frontSeat(s) {
  const drv = s > 0, who = drv ? 'Bestuurdersstoel' : 'Passagiersstoel';
  const bx = intBx, cy = intCy;
  const frame = A('Stoelframe', { d: 'Stalen frame van de zitting met scharnieren voor de rugleuning, onder de schuimlaag verborgen.', ex: [0, 0.02, 0] }, [
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
    intPart('Hoofdsteunstangen', merge([cy('y', 0.0075, 0.13, [0.07, -0.02, 0], 10), cy('y', 0.0075, 0.13, [-0.07, -0.02, 0], 10)]), MAT.chrome, 'Twee verchroomde stangen die in de bussen van de rugleuning schuiven.', { ex: [0, -0.05, 0] }),
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
// neerklappen van de rugleuning: scharnieras (y, z in het frame van de achterbank) iets boven en voor de onderkant, zodat de
// neergeklapte rugleuning vlak op de gordelsloten van de zitting rust; 1,82 rad is 104 graden (de rugleuning staat 14 graden achterover)
const intRBP = { y: 0.537, z: -1.1637, ang: 1.82 };
// De rugleuning is onderaan om de achterwielkasten heen gevormd: tot 0,27 m boven de onderrand (in wereldhoogte tot
// ongeveer y 0,75, net boven de wielkast) loopt het buitenste deel maar tot |x| 0,50, daarboven tot de volle breedte.
// Bekleding, schuim en achterbekleding zijn elk één afgerond stuk met een inkeping (geen naad tussen twee blokken).
const intWHX = 0.50, intRBsplit = 0.27;
function intRearBack(cx, w, name, d, label, extra) {
  const bx = intBx, cy = intCy, hw = w / 2, out = cx > 0 ? 1 : -1, edge = out * intWHX - cx;
  const lo = out > 0 ? -hw : Math.max(-hw, edge), hi = out > 0 ? Math.min(hw, edge) : hw;   // onderste deel: lokale x van lo tot hi
  // plaat met de inkeping onder aan de buitenkant; ins = inspringing ten opzichte van de bekleding, z = middenvlak
  // ins2: inspringing aan de naadzijde (naar het andere deel toe), standaard gelijk aan ins
  const notched = (ins, t, b, z, ins2 = ins) => { const cut = Math.abs(edge) < hw - ins ? [[out, edge - out * ins * 1.2, intRBsplit + ins * 1.2]] : [];
    const g = roundPlate(notchRect(-hw + (out > 0 ? ins2 : ins), hw - (out > 0 ? ins : ins2), ins, 0.56 - ins, cut), t, b); g.translate(0, 0, z); return g; };
  // naad tussen de twee delen: de beige bekleding springt aan de naadzijde 14 mm in en de donkere achterbekleding krijgt daar een
  // flens van 6 mm, zodat je van achteren in de naad alleen het donkere vlak ziet (geen beige staafje) en van voren een naad blijft
  const seamX = out > 0 ? -hw + 0.01 : hw - 0.01, flange = intBox(0.006, 0.54, 0.068, [seamX + (out > 0 ? -0.003 : 0.003), 0.28, -0.034]);
  const xo = out > 0 ? hi - 0.03 : lo + 0.03, xi = out > 0 ? -hw + 0.03 : hw - 0.03;            // buitenste en binnenste framebuis
  return A(name, { d, p: [cx, intRB.y, intRB.z], r: [intRB.tilt, 0, 0], ex: [cx > 0 ? 0.14 : -0.14, 0.12, -0.12],
    open: hinge([cx, intRBP.y, intRBP.z], [1, 0, 0], intRBP.ang, Object.assign({ min: 1.456, label, look: { dir: [0.5, 0.6, -0.65], nodes: [name, 'Zitting achterbank', 'Renault Laguna III/Carrosserie/Achterklep/Klepafdichting'] } }, intNeed('Achterklep'))) }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.54, [xo, 0.28, -0.03]), cy('y', 0.009, 0.54, [xi, 0.28, -0.03]), cy('x', 0.009, w - 0.06, [0, 0.54, -0.03]), cy('x', 0.009, hi - lo - 0.06, [(hi + lo) / 2, 0.02, -0.03])]), MAT.steel, 'Stalen buisframe van het rugleuningdeel.', { ex: [0, 0, -0.02] }),
    intPart('Rugschuim', notched(0.01, 0.065, 0.03, 0, 0.016), MAT.intFoam, 'Schuimlaag van het rugleuningdeel.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', notched(0, 0.11, 0.03, 0, 0.014), MAT.leather, 'Beige lederen bekleding, onderaan aan de buitenkant ingesneden om de wielkast heen.', { ex: [0, 0, 0.14] }),
    intPart('Rugachterbekleding', merge([notched(0.01, 0.012, 0.006, -0.062), flange]), MAT.carpet, 'Bekleding aan de bagageruimtezijde van het rugleuningdeel.', { ex: [0, 0, -0.14] }),
    intPart('Rugvergrendeling', bx(0.04, 0.05, 0.03, 0.008, [cx > 0 ? hw - 0.05 : -hw + 0.05, 0.55, -0.04]), MAT.steel, 'Vergrendeling in de bovenrand die de rugleuning aan de carrosserie vastzet; ontgrendeld met een hendel op de bank of in de bagageruimte.', { ex: [cx > 0 ? 0.06 : -0.06, 0.06, -0.04] }),
    intPart('Scharnierbeugels', merge([bx(0.05, 0.03, 0.06, 0.008, [hi - 0.045, 0.02, -0.04]), bx(0.05, 0.03, 0.06, 0.008, [lo + 0.045, 0.02, -0.04])]), MAT.darkSteel, 'Beugels waarmee het rugleuningdeel om de onderrand scharniert.', { ex: [0, -0.06, -0.06] }),
    extra,
  ]);
}
function intRearHead(x, name, lead) {
  const t = 0.6, bx = intBx, cy = intCy;
  return A(name, { d: 'Achterhoofdsteun met twee geleidestangen; drie stuks (een per zitplaats).', p: [x, intRB.y + t * Math.cos(intRB.tilt), intRB.z + t * Math.sin(intRB.tilt)], r: [intRB.tilt, 0, 0], ex: [0, 0.24, 0], open: follow(lead, [x, intRBP.y, intRBP.z], [1, 0, 0], intRBP.ang) }, [
    intPart('Hoofdsteunkussen', bx(0.24, 0.14, 0.08, 0.035, [0, 0.07, 0]), MAT.leather, 'Met leder bekleed kussen.', { ex: [0, 0.07, 0] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.006, 0.12, [0.06, -0.01, 0], 10), cy('y', 0.006, 0.12, [-0.06, -0.01, 0], 10)]), MAT.chrome, 'Twee verchroomde stangen die in de rugleuning schuiven.', { ex: [0, -0.05, 0] }),
  ]);
}
function intRearBench() {
  const bx = intBx, cy = intCy;
  // zitkussen in bovenaanzicht (u = x, v = lokale z): achter z ve (wereld -0,985 voor de bekleding) alleen tot |x| xe
  const cushion = (w, dpt, t, b, y, xe, ve) => { const g = roundPlate(notchRect(-w / 2, w / 2, -dpt / 2, dpt / 2, [[1, xe, ve], [-1, -xe, ve]]), t, b); g.rotateX(HALF); g.translate(0, y, 0); return g; };
  const cush = A('Zitting achterbank', { d: 'Zitkussen van de achterbank: plaat, schuim en lederen bekleding, met de ISOFIX-beugels en de gordelsloten.', p: [0, 0.43, -0.95], ex: [0, 0.06, 0.14] }, [
    intPart('Zitplaat achter', cushion(1.17, 0.44, 0.012, 0.005, -0.045, 0.475, -0.012), MAT.darkSteel, 'Stalen plaat onder het zitschuim.', { inner: true, ex: [0, 0.02, 0] }),
    intPart('Zitschuim achter', cushion(1.21, 0.46, 0.07, 0.03, -0.015, 0.488, -0.023), MAT.intFoam, 'Schuimlaag van de achterbankzitting.', { inner: true, ex: [0, 0.04, 0] }),
    intPart('Zitbekleding achter', cushion(1.26, 0.48, 0.12, 0.03, 0, 0.5, -0.035), MAT.leather, 'Beige lederen bekleding van de zitting, achteraan aan de buitenkanten ingesneden tussen de wielkasten.', { ex: [0, 0.1, 0.04] }),
    ...[1, -1].map(s => intPart(`ISOFIX-beugel ${sideName(s)}`, merge([rodBetween([s * 0.42 - 0.03, 0.074, -0.18], [s * 0.42 + 0.03, 0.074, -0.18], 0.005, 8), rodBetween([s * 0.42 - 0.03, 0.074, -0.18], [s * 0.42 - 0.03, 0.082, -0.21], 0.005, 8), rodBetween([s * 0.42 + 0.03, 0.074, -0.18], [s * 0.42 + 0.03, 0.082, -0.21], 0.005, 8)]), MAT.steel, 'ISOFIX-beugel voor een kinderzitje op de buitenste zitplaats, in de naad tussen zitting en rugleuning: een dwarsstang op de rand van de zitting met twee korte steunen die in de rugleuning verdwijnen.', { ex: [s * 0.08, 0.04, -0.06] })),
    ...[[0.2, 'links'], [0, 'midden'], [-0.2, 'rechts']].map(([x, n]) => intPart(`Gordelslot achter ${n}`, merge([bx(0.03, 0.05, 0.04, 0.008, [x, 0.07, -0.2]), bx(0.014, 0.01, 0.02, 0.003, [x, 0.098, -0.2])]), MAT.plastic, 'Gordelslot van de achterbank met gordelverklikker.', { ex: [0, 0.1, 0] })),
  ]);
  // middenarmsteun: hangt tegen de voorkant van het grote rugleuningdeel (klapt met de rugleuning mee; 2,5 cm naar voren, zodat de bekerhouders op de achterkant vrij blijven van de bekleding) en klapt om een as onder aan de voorkant naar voren
  // op de zitting; de bekerhouders zitten aan de zijde die dan boven ligt (in de rugleuning verborgen)
  const arm = A('Middenarmsteun achter', { d: 'Opklapbare middenarmsteun in het grote rugleuningdeel met twee bekerhouders. Hij klapt om een scharnier onderaan naar voren op de zitting (geschat 104 graden vanuit de opgeklapte stand); de bekerhouders komen dan boven.', p: [0.265, 0, 0.025], ex: [0, 0.1, 0.2],
    open: hinge([0.265, -0.009, 0.0925], [1, 0, 0], 1.82, Object.assign({ min: 1.456, label: 'Middenarmsteun achter', look: { dir: [0.9, 0.45, 0.1], nodes: ['Middenarmsteun achter', 'Rugleuning groot deel', 'Zitting achterbank'] } }, intNeed('Portier linksachter'))) }, [
    intPart('Armsteunkussen', bx(0.24, 0.36, 0.035, 0.012, [0, 0.22, 0.05]), MAT.leather, 'Gevoerde armsteun die tussen de rugleuningdelen wordt neergeklapt.', { ex: [0, 0, 0.1] }),
    intPart('Bekerhouders achter', merge([[0.06, 0.31], [-0.06, 0.31]].map(([x, y]) => merge([xf(G.torus('z', 0.03, 0.004, 20, 6), [x, y, 0.0325]), xf(G.cyl('z', 0.03, 0.03, 0.004, 20), [x, y, 0.0305])]))), MAT.plasticGrey, 'Twee bekerhouders in de armsteun.', { ex: [0, 0, -0.08] }),
    intPart('Armsteunscharnier', bx(0.12, 0.025, 0.03, 0.008, [0, 0.03, 0.05]), MAT.darkSteel, 'Scharnier onderaan de armsteun.', { ex: [0, -0.05, 0.02] }),
  ]);
  return A('Achterbank', { d: 'Achterbank met gedeeld neerklapbare rugleuning (een derde en twee derde), drie hoofdsteunen, middenarmsteun met bekerhouders en ISOFIX op de buitenplaatsen.', spec: [['Verdeling rugleuning', 'een derde en twee derde, neerklapbaar'], ['Hoofdsteunen', '3'], ['ISOFIX', 'op de twee buitenplaatsen'], ['Middenarmsteun', 'met twee bekerhouders']], ex: [0, 0.1, -0.36] }, [
    cush,
    intRearBack(-0.265, 0.77, 'Rugleuning groot deel', 'Het grote (twee derde) deel van de gedeelde rugleuning; de verdeling en de zijde zijn geschat. Klapt om de onderrand naar voren neer (geschat 104 graden), met de hoofdsteunen en de middenarmsteun.', 'Rugleuning groot deel (rechts)', arm),
    intRearBack(0.385, 0.52, 'Rugleuning klein deel', 'Het kleine (een derde) deel van de gedeelde rugleuning; klapt om de onderrand naar voren neer (geschat 104 graden), met de hoofdsteun.', 'Rugleuning klein deel (links)'),
    intRearHead(0.42, 'Hoofdsteun achter links', 'Rugleuning klein deel'), intRearHead(0, 'Hoofdsteun achter midden', 'Rugleuning groot deel'), intRearHead(-0.42, 'Hoofdsteun achter rechts', 'Rugleuning groot deel'),
  ]);
}
// gordels: rolautomaten in B- en C-stijl, geleiders en banden; x-posities volgen de buitenhuid
function intBelts() {
  const bx = intBx, out = [];
  const bandGeo = (pts, w) => merge(pts.slice(1).map((p, i) => intStrip(pts[i], p, w, 0.0015)));
  for (const s of [1, -1]) {
    const n = sideName(s), zB = -0.28, xr = s * (surfX(zB, 0.55) - 0.087), xg = s * (surfX(zB, 1.1) - 0.05);
    // rusttand: de band hangt van de bovenste geleider vrijwel recht omlaag, de tong hangt halverwege de stijl (y 0,585; de band eindigt op 0,62, de verankering zit op 0,33 en het stuk daartussen is niet getekend; het slot naast de stoel blijft zoals het was); de knikken liggen zo dat de band in elke stand van de achterste zijruit vrij blijft: x binnen 0,75, tussen y 0,98 en 0,87 net achter de balk van de B-stijl (z 0,5 cm achter de stijl)
    const restPts = [[xg, 1.1, zB + 0.012], [xg - s * 0.005, 0.98, zB - 0.005], [xg + s * 0.01, 0.87, zB - 0.005], [xg + s * 0.02, 0.62, zB + 0.018]], tong = [xg + s * 0.025, 0.585, zB + 0.02];
    const grp = [];
    grp.push(
      intPart(`Gordelrolautomaat voor ${n}`, G.rbox(0.06, 0.1, 0.06, 0.01), MAT.plastic, 'Oprolautomaat met gordelspanner en krachtbegrenzer onderin de B-stijl, achter de stijlbekleding verborgen; de bestuurder heeft een dubbele spanner.', { p: [xr, 0.55, zB], ex: [s * 0.1, 0, 0] }),
      intPart(`Hoogteversteller voor ${n}`, G.rbox(0.03, 0.2, 0.012, 0.004), MAT.plasticGrey, 'Geleiderail op de B-stijl waarmee de bovenste gordelgeleider in hoogte wordt versteld.', { p: [xg, 1.04, zB - 0.02], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider voor ${n}`, G.torus('z', 0.018, 0.004, 16, 6), MAT.steel, 'Geleideoog waar de gordelband doorheen loopt.', { p: [xg, 1.1, zB], ex: [s * 0.1, 0.16, 0] }),
      intPart(`Gordelband voor ${n}`, bandGeo(restPts, 0.046), MAT.intBelt, 'Gordelband in de rusttand van een geparkeerde auto: opgerold, hangt vanuit de bovenste geleider vrijwel recht omlaag, net achter de stijlbalk van de B-stijl, tot de gordeltong halverwege de stijl; het stuk band van de tong naar de onderste verankering in de drempel is niet getekend.', { ex: [s * 0.1, 0.1, 0.06] }),
      intPart(`Gordeltong voor ${n}`, G.rbox(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong op de gordelband die in het gordelslot klikt; in de rusttand hangt hij onderaan de stijl.', { p: tong, ex: [0, 0.14, 0.04] }),
      intPart(`Gordelverankering voor ${n}`, hexBolt(0.02, 0.014, 'x'), MAT.steel, 'Bout waarmee de heupband aan de buitenkant van de stoel in de drempel is verankerd.', { p: [s * 0.7, 0.33, -0.22], r: [0, s > 0 ? 0 : PI, 0], ex: [s * 0.1, 0, 0] }));
    out.push(A(`Gordel voor ${n}`, { d: 'Driepuntsgordel van de voorstoel: rolautomaat in de B-stijl, hoogteversteller, geleider, band, tong en onderste verankering.', ex: [s * 0.05, 0.12, 0] }, grp));
  }
  [[0.42, 'links', 0.2], [0, 'midden', 0], [-0.42, 'rechts', -0.2]].forEach(([x, n, bxp]) => {
    const xg = x === 0 ? 0 : Math.sign(x) * (surfX(-1.3, 1.03) - 0.09), xr = x === 0 ? 0 : Math.sign(x) * (surfX(-1.5, 0.8) - 0.07), zr = x === 0 ? -1.58 : -1.5, yr = x === 0 ? 1.0 : 0.8;   // buiten: boven de achterwielkast
    const grp = [], lead = x > 0 ? 'Rugleuning klein deel' : 'Rugleuning groot deel', fol = () => follow(lead, [0, intRBP.y, intRBP.z], [1, 0, 0], intRBP.ang);   // band en tong klappen met de rugleuning mee
    grp.push(
      intPart(`Gordelrolautomaat achter ${n}`, G.rbox(0.06, 0.06, 0.08, 0.01), MAT.plastic, x === 0 ? 'Oprolautomaat van de middelste achtergordel op de hoedenplank.' : 'Oprolautomaat met spanner in de achterstijl.', { p: [xr, yr, zr], ex: [Math.sign(x) * 0.1, 0.1, 0] }),
      intPart(`Gordelband achter ${n}`, bandGeo([[xg, 1.03, -1.275], [bxp, 0.51, -1.12]], 0.046), MAT.intBelt, 'Gordelband van de achterbank; klapt met de rugleuning mee.', { ex: [Math.sign(x) * 0.08, 0.12, 0.05], open: fol() }),
      intPart(`Gordeltong achter ${n}`, G.rbox(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong die in het gordelslot klikt.', { p: [bxp, 0.52, -1.122], ex: [0, 0.14, 0.04], open: fol() }));
    out.push(A(`Gordel achter ${n}`, { d: 'Driepuntsgordel van de achterbank: rolautomaat, band en tong; het slot zit in de zitting.', ex: [Math.sign(x) * 0.04, 0.1, 0] }, grp));
  });
  return A('Veiligheidsgordels', { d: 'Driepuntsgordels met oprolautomaten, geleiders en tongen; de gordelsloten zitten in de stoelen en de achterbank.', ex: [0, 0.3, 0] }, out);
}

/* ---------- dashboard ---------- */
// zijprofiel (z, y) van het dashboard; bovenkant en voorvlak worden voor de huid en de bedieningspanelen hergebruikt
const intDashPf = [[1.03, 0.935], [0.8, 0.95], [0.62, 0.945], [0.52, 0.91], [0.47, 0.84], [0.48, 0.74], [0.55, 0.62], [0.58, 0.52], [0.68, 0.5], [0.9, 0.6], [1.0, 0.78]];
const intDashTopPts = [[1.00, 0.937], [0.8, 0.95], [0.62, 0.945], [0.52, 0.91], [0.47, 0.84]];
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
// Opschriften en wijzerplaten op één canvastextuur van 1024 x 512 pixels (golf 5l). intDecal legt een rechthoek (pixels: x0, y0, x1, y1)
// op een vlak dat naar -z kijkt, de kijkrichting in het kader van een paneel op het voorvlak; met up kijkt het vlak omhoog en staat de
// bovenkant van de tekst naar voren. Wat niet beschreven is, blijft doorzichtig (alphaTest). Schaalindeling en teksten zijn geschat.
const intTexR = {
  tach: [0, 0, 256, 256], speedo: [256, 0, 512, 256], temp: [512, 0, 640, 128], fuel: [640, 0, 768, 128],
  lcd: [512, 128, 640, 192], climDisp: [640, 128, 768, 158], hazRow: [512, 192, 768, 223], gate: [768, 0, 896, 256],
  clim: [896, 64, 1024, 165], radio: [0, 256, 512, 388], joy: [512, 256, 768, 512], nav: [768, 256, 1024, 400],
};
// toetsen van de panelen: [u, v, b, h, tekst] in meter vanaf de linkerbovenhoek zoals de bestuurder het paneel ziet
const intClimW = 0.095, intClimH = 0.075, intRadW = 0.24, intRadH = 0.062, intHazW = 0.18, intHazH = 0.022, intJoyW = 0.09;
const intClimKeys = [[0.020, 0.009, 0.022, 0.009, 'SOFT'], [0.0475, 0.009, 0.022, 0.009, 'AUTO'], [0.075, 0.009, 0.022, 0.009, 'FAST'],
  [0.027, 0.044, 0.03, 0.009, '< >'], [0.068, 0.044, 0.03, 0.009, '< >'], [0.020, 0.062, 0.022, 0.013, 'AC'], [0.0475, 0.062, 0.022, 0.019, '+  -'], [0.075, 0.062, 0.022, 0.013, 'REC']];
const intRadKeys = ['LOAD', '1', '2', '3', '4', '5', '6', 'EJECT'].map((t, i) => [0.02025 + i * 0.0285, 0.010, 0.026, 0.010, t])
  .concat([['TEL', 0.045], ['CD', 0.067], ['RADIO', 0.089], ['MODE', 0.151], ['<<', 0.173], ['>>', 0.195]].map(([t, u]) => [u, 0.049, 0.019, 0.011, t]));
const intHazKeys = [[0.02, 0.011, 0.03, 0.016, 'HAZ'], [0.056, 0.011, 0.026, 0.016, 'DEF'], [0.085, 0.011, 0.026, 0.016, 'DEFR'], [0.124, 0.011, 0.026, 0.016, 'SEAT L'], [0.153, 0.011, 0.026, 0.016, 'SEAT R']];
const intJoyKeys = ['BACK', 'TEL', 'INFO', 'LIGHT', 'ZOOM', 'ROUTE', 'MAP', 'DEST'].map((t, i) => { const a = i * PI / 4; return [intJoyW / 2 + 0.031 * Math.sin(a), intJoyW / 2 - 0.031 * Math.cos(a), 0.016, 0.011, t]; });
function intDashTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const k = c.getContext('2d'), F = (px, b) => (b ? 'bold ' : '') + Math.round(px) + 'px Arial, Helvetica, sans-serif', W = '#f2f2f2';
  k.textAlign = 'center'; k.textBaseline = 'middle';
  const txt = (s, x, y, px, col, b) => { k.font = F(px, b); k.fillStyle = col || W; let f = px; while (k.measureText(s).width > px * 3.2 && f > 6) { f -= 1; k.font = F(f, b); } k.fillText(s, x, y); };
  // wijzerplaat: schaal van -135 tot 135 graden (met de klok vanaf boven), n stappen met sub tussenstreepjes, rood vanaf fractie red
  const dial = (R, labels, sub, red, unit) => {
    const cx = (R[0] + R[2]) / 2, cy = (R[1] + R[3]) / 2, r = (R[2] - R[0]) / 2 - 1, n = (labels.length - 1) * sub, ang = t => (-135 + 270 * t) * PI / 180;
    k.fillStyle = '#121418'; k.beginPath(); k.arc(cx, cy, r, 0, PI * 2); k.fill();
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = ang(t), big = i % sub === 0, r0 = r * (big ? 0.8 : 0.87);
      k.strokeStyle = red != null && t > red - 1e-6 ? '#e0302a' : W; k.lineWidth = big ? 3.5 : 1.6;
      k.beginPath(); k.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); k.lineTo(cx + Math.sin(a) * r * 0.95, cy - Math.cos(a) * r * 0.95); k.stroke();
    }
    labels.forEach((s, i) => { const a = ang(i / (labels.length - 1)); txt(s, cx + Math.sin(a) * r * 0.62, cy - Math.cos(a) * r * 0.62, r * (s.length > 2 ? 0.13 : 0.17)); });
    if (unit) txt(unit, cx, cy + r * 0.36, r * 0.09);
  };
  dial(intTexR.tach, ['0', '1', '2', '3', '4', '5', '6', '7', '8'], 2, 6.5 / 8, 'x1000 /min');
  dial(intTexR.speedo, ['0', '20', '40', '60', '80', '100', '120', '140', '160', '180', '200', '220', '240', '260'], 2, null, 'km/h');
  // kleine meters: boog van -60 tot 60 graden, temperatuur (C tot H) en brandstof (0 tot 1)
  const small = (R, l, r2) => {
    const cx = (R[0] + R[2]) / 2, cy = (R[1] + R[3]) / 2, r = (R[2] - R[0]) / 2 - 1;
    k.fillStyle = '#121418'; k.beginPath(); k.arc(cx, cy, r, 0, PI * 2); k.fill();
    for (let i = 0; i <= 4; i++) { const a = (-60 + 30 * i) * PI / 180; k.strokeStyle = i === 4 && R === intTexR.temp ? '#e0302a' : W; k.lineWidth = 3;
      k.beginPath(); k.moveTo(cx + Math.sin(a) * r * 0.62, cy - Math.cos(a) * r * 0.62); k.lineTo(cx + Math.sin(a) * r * 0.9, cy - Math.cos(a) * r * 0.9); k.stroke(); }
    txt(l, cx - r * 0.55, cy + r * 0.1, r * 0.26); txt(r2, cx + r * 0.55, cy + r * 0.1, r * 0.26);
  };
  small(intTexR.temp, 'C', 'H'); small(intTexR.fuel, '0', '1');
  // LCD en klimaatdisplay: donker venster met lichte tekst
  const lcd = (R, lines, px) => { k.fillStyle = '#18222b'; k.fillRect(R[0], R[1], R[2] - R[0], R[3] - R[1]);
    lines.forEach(([s, fx, fy], i) => txt(s, R[0] + (R[2] - R[0]) * fx, R[1] + (R[3] - R[1]) * fy, px, '#cfe6f5')); };
  lcd(intTexR.lcd, [['D', 0.5, 0.25], ['17,6 km', 0.5, 0.58], ['12:00', 0.5, 0.85]], 15);
  lcd(intTexR.climDisp, [['21,0', 0.2, 0.5], ['AUTO', 0.5, 0.5], ['21,0', 0.8, 0.5]], 14);
  // opschriften op toetsen: tekst in het midden van elke toets, schaal in pixels per meter
  const keys = (R, Wm, list, px) => { const s = (R[2] - R[0]) / Wm;
    list.forEach(([u, v, , h, t]) => {
      const x = R[0] + u * s, y = R[1] + v * s;
      if (t === 'HAZ') { k.strokeStyle = W; k.lineWidth = 2.5; k.beginPath(); k.moveTo(x, y - 6); k.lineTo(x + 7, y + 6); k.lineTo(x - 7, y + 6); k.closePath(); k.stroke(); }
      else if (t === 'REC') { k.strokeStyle = W; k.lineWidth = 2; k.beginPath(); k.arc(x, y, 5, 0.4, PI * 1.8); k.stroke(); }
      else if (t === 'DEF' || t === 'DEFR') { k.strokeStyle = W; k.lineWidth = 1.8; k.beginPath(); if (t === 'DEF') { k.moveTo(x - 8, y + 5); k.lineTo(x - 5, y - 5); k.lineTo(x + 5, y - 5); k.lineTo(x + 8, y + 5); k.closePath(); } else k.rect(x - 8, y - 5, 16, 10);
        for (const d of [-3, 0, 3]) { k.moveTo(x + d, y - 3); k.lineTo(x + d, y + 3); } k.stroke(); }
      else if (t.startsWith('SEAT')) { k.strokeStyle = W; k.lineWidth = 2; k.beginPath(); k.moveTo(x - 5, y - 7); k.lineTo(x - 3, y + 4); k.lineTo(x + 6, y + 4); k.stroke(); k.font = F(7); k.fillStyle = W; k.fillText(t.slice(5), x + 7, y - 4); }
      else txt(t, x, y, Math.min(px, h * s * 0.7));
    }); };
  keys(intTexR.clim, intClimW, intClimKeys, 9);
  keys(intTexR.radio, intRadW, intRadKeys, 11);
  keys(intTexR.hazRow, intHazW, intHazKeys, 10);
  keys(intTexR.joy, intJoyW, intJoyKeys, 14);
  // keuzepoort: P R N D van voor naar achter langs de sleuf, de handmatige stand (+ en -) ernaast
  { const R = intTexR.gate, cx = R[0] + 40; ['P', 'R', 'N', 'D'].forEach((s, i) => txt(s, cx, R[1] + 50 + i * 40, 30, '#202226', true));
    txt('+', R[0] + 96, R[1] + 150, 26, '#202226', true); txt('M', R[0] + 96, R[1] + 182, 20, '#202226', true); txt('-', R[0] + 96, R[1] + 214, 30, '#202226', true); }
  // navigatiescherm: eenvoudige kaart met wegen en een route
  { const R = intTexR.nav, w = R[2] - R[0], h = R[3] - R[1];
    k.fillStyle = '#d9e3cf'; k.fillRect(R[0], R[1], w, h); k.strokeStyle = '#ffffff'; k.lineWidth = 6;
    [[0.0, 0.3, 1.0, 0.45], [0.2, 0.0, 0.35, 1.0], [0.6, 0.0, 0.7, 1.0], [0.0, 0.8, 1.0, 0.7]].forEach(([a, b, cc, d]) => { k.beginPath(); k.moveTo(R[0] + a * w, R[1] + b * h); k.lineTo(R[0] + cc * w, R[1] + d * h); k.stroke(); });
    k.strokeStyle = '#3d7be0'; k.lineWidth = 7; k.beginPath(); k.moveTo(R[0] + 0.3 * w, R[1] + h); k.lineTo(R[0] + 0.3 * w, R[1] + 0.37 * h); k.lineTo(R[0] + 0.65 * w, R[1] + 0.4 * h); k.lineTo(R[0] + 0.65 * w, R[1]); k.stroke();
    k.fillStyle = '#2b3440'; k.fillRect(R[0], R[1], w, 18); txt('Carminat TomTom', R[0] + w / 2, R[1] + 9, 13, '#ffffff'); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return t;
}
{ const T = intDashTex(); std('intDecal', 0xffffff, 0, 0.5, { map: T, emissive: 0xffffff, emissiveMap: T, emissiveIntensity: 0.35, alphaTest: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); }
std('intPiano', 0x0b0c0e, 0.25, 0.12, { envMapIntensity: 1.3 });   // pianozwart (hoogglans) van de sierband en de console
std('intBlackLeather', 0x1d1e21, 0, 0.62);                          // zwart leder van de hoes om de keuzehendel
function intDecal(w, h, R, up) {
  return cache(`intDecal${w}|${h}|${R}|${up ? 1 : 0}`, () => {
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(R[0], R[2], uv.getX(i)) / 1024, 1 - lerp(R[1], R[3], 1 - uv.getY(i)) / 512);
    if (up) g.rotateX(-HALF);
    g.rotateY(PI); return g;
  });
}
// toetsen uit een lijst [u, v, b, h] op een paneel van breedte Wm en hoogte Hm (lokaal: x naar links, y omhoog), dikte t op diepte z
const intKeys = (list, Wm, Hm, t, z) => merge(list.map(([u, v, b, h]) => xf(G.box(b, h, t), [Wm / 2 - u, Hm / 2 - v, z])));
// afgeronde rechthoekige ring (omlijsting) met dikte t langs z
const intRing = (w, h, r, wi, hi, ri, t) => cache(`intRing${w}|${h}|${r}|${wi}|${hi}|${ri}|${t}`, () => {
  const s = shapeOf(rrectPts(w, h, r)); s.holes.push(new THREE.Path(rrectPts(wi, hi, ri).map(p => new THREE.Vector2(p[0], p[1])))); return front(s, t); });
function intDashboard() {
  const bx = intBx, cy = intCy;
  const skinPts = intOffset(intDashTopPts, intSkinT).concat(intOffset(intDashTopPts, -0.003).reverse());
  // middenpaneel onder de roosters (van de knik op y 0,84 tot y 0,63), 1,8 cm voor het voorvlak
  const midPts = [[0.47, 0.84], [0.48, 0.74], [intFace(0.63).z, 0.63]];
  const fasPts = intOffset(midPts, 0.018).concat(intOffset(midPts, 0).reverse());
  const Sk = z => intDashTop(z) + 0.0006;   // net boven de huid van de dashboardkop
  // kap op de dashboardkop (instrumenten, navigatie): schaal met profiel outer (heen) en inner (terug) in (z, y) over breedte W rond xc,
  // plus twee wangen tussen de huid en de schaal; zf is de voorrand van de wangen op de huid. Alles in wereldcoordinaten.
  const intHood = (xc, W, outer, inner, zf) => {
    const shell = xf(side(shapeOf(outer.concat(inner)), W), [xc, 0, 0]);
    const zb = inner[0][0], skin = [];
    for (let z = zb - 0.03; z > zf + 0.008; z -= 0.03) skin.push([z, Sk(z)]);
    const cheek = side(shapeOf([[zf, Sk(zf)]].concat(inner.slice().reverse(), skin)), 0.012);
    return merge([shell, xf(cheek, [xc + W / 2 - 0.006, 0, 0]), xf(cheek, [xc - W / 2 + 0.006, 0, 0])]);
  };
  // luchtroosters: hol huis (omlijsting) met een donkere achterwand en de lamellen erin, op de schuine rand tussen dashboardkop en
  // voorvlak; z0 is de achterkant in het kader van het voorvlak (de middelste staan op de sierband, de buitenste op de huid)
  const ventGroup = (name, x, w, z0, d) => { const f = intFace(0.872, 0), h = 0.07, D = 0.016, zr = z0 - 0.0035 - D / 2;
    return A(name, { d, p: [x, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0.03, -0.1] }, [
      intPart('Roosterkanaal', xf(G.box(w - 0.004, h - 0.004, 0.003), [0, 0, z0 - 0.0015]), MAT.plastic, 'Donkere achterwand in het rooster: het einde van het luchtkanaal waar de lucht uit komt.', { ex: [0, 0, 0.02] }),
      intPart('Roosterhuis', xf(intRing(w, h, 0.012, w - 0.016, h - 0.016, 0.006, D), [0, 0, zr]), MAT.satin, 'Holle omlijsting van het luchtrooster in satijnchroom; de lamellen zitten erbinnen.', { ex: [0, 0.02, -0.04] }),
      intPart('Lamellen', merge([-0.0165, -0.0055, 0.0055, 0.0165].map(y => xf(G.box(w - 0.019, 0.0022, 0.010), [0, y, zr]))), MAT.plastic, 'Verstelbare horizontale lamellen in het huis die de luchtstroom richten.', { ex: [0, 0, -0.06] }),
      intPart('Roosterknop', xf(G.box(0.018, 0.0065, 0.006), [0, 0.0055, zr - 0.0083]), MAT.satin, 'Schuifje op een lamel waarmee de richting van de luchtstroom wordt ingesteld.', { ex: [0, 0, -0.09] }),
    ]); };
  // instrumentenpaneel: de wijzerplaatdrager staat 0,25 rad achterover, naar het oog van de bestuurder [0,37; 1,12; -0,30], in een kap op de
  // dashboardkop. Zichtlijn (golf 5l, gemeten): boven het airbagdeksel langs en onder de bovenrand van de krans door; alle delen in dit kader
  const clC = [0.372, 0.98, 0.545], cl = o => Object.assign({ p: clC, r: [0.25, 0, 0] }, o), clW = 0.314;
  const dialPos = { tach: [0.075, 0.006, 0.046], speedo: [-0.075, 0.006, 0.046], temp: [0.024, -0.03, 0.0135], fuel: [-0.024, -0.03, 0.0135] };
  const dialDecal = key => { const [x, y, r] = dialPos[key]; return xf(intDecal(2 * r, 2 * r, intTexR[key]), [x, y, -0.0035]); };
  const needle = (key, a) => { const [x, y, r] = dialPos[key], L = r * 0.85, o = L / 2 - r * 0.12; return xf(G.box(r > 0.02 ? 0.0024 : 0.0016, L, 0.0012), [x + Math.cos(a) * o, y + Math.sin(a) * o, -0.0068], [0, 0, a - HALF]); };
  const cluster = A('Instrumentenpaneel', { d: 'Instrumentenpaneel in een kap op de dashboardkop: links de toerenteller en rechts de snelheidsmeter, elk met een chromen ring, daartussen een LCD en eronder twee kleine meters voor temperatuur en brandstof; rood-witte wijzers. De wijzerplaatdrager staat schuin naar het oog van de bestuurder en is boven de naaf van het stuur door de krans te zien (schaalindeling en maten geschat naar de foto\'s).', ex: [0, 0.04, -0.14] }, [
    intPart('Instrumentenbehuizing', xf(G.box(clW, 0.11, 0.006), [0, 0.004, 0]), MAT.dash, 'Zwarte drager van de wijzerplaten met de printplaat erachter.', cl({ ex: [0, 0, 0.06] })),
    intPart('Toerenteller', dialDecal('tach'), MAT.intDecal, 'Toerenteller links: wijzerplaat met schaalstreepjes en cijfers van 0 tot 8 x 1000 per minuut (rood gebied geschat).', cl({ ex: [0.02, 0, -0.03] })),
    intPart('Snelheidsmeter', dialDecal('speedo'), MAT.intDecal, 'Snelheidsmeter rechts: wijzerplaat met schaalstreepjes en cijfers in km/h (indeling geschat).', cl({ ex: [-0.02, 0, -0.03] })),
    intPart('Temperatuurmeter', dialDecal('temp'), MAT.intDecal, 'Kleine meter voor de koelvloeistoftemperatuur, onder het LCD aan de linkerkant.', cl({ ex: [0.01, -0.02, -0.03] })),
    intPart('Brandstofmeter', dialDecal('fuel'), MAT.intDecal, 'Kleine meter voor de brandstofvoorraad, onder het LCD aan de rechterkant.', cl({ ex: [-0.01, -0.02, -0.03] })),
    intPart('Informatiedisplay', xf(intDecal(0.052, 0.026, intTexR.lcd), [0, 0.022, -0.0035]), MAT.intDecal, 'LCD tussen de grote wijzerplaten voor boordcomputer, kilometerteller en de stand van de automaat.', cl({ ex: [0, 0.02, -0.05] })),
    intPart('Sierringen', merge(Object.values(dialPos).map(([x, y, r]) => xf(G.torus('z', r + 0.001, r > 0.02 ? 0.0022 : 0.0014, r > 0.02 ? 48 : 24, 6), [x, y, -0.0058]))), MAT.chrome, 'Chromen ringen om de vier wijzerplaten.', cl({ ex: [0, 0, -0.06] })),
    intPart('Wijzers', merge([needle('tach', -PI / 4), needle('speedo', -PI / 4), needle('temp', PI / 6), needle('fuel', 2 * PI / 3)]), MAT.red, 'Rode wijzers van de vier meters (in de ruststand).', cl({ ex: [0, 0, -0.08] })),
    intPart('Wijzernaven', merge(Object.values(dialPos).map(([x, y, r]) => xf(G.cyl('z', r > 0.02 ? 0.0055 : 0.003, r > 0.02 ? 0.0055 : 0.003, 0.003, 12), [x, y, -0.0085]))), MAT.ceramic, 'Witte kapjes over de assen van de wijzers.', cl({ ex: [0, 0, -0.1] })),
    intPart('Instrumentenglas', xf(G.box(0.31, 0.108, 0.002), [0, 0.004, -0.0115]), MAT.lensClear, 'Doorzichtig kapglas voor de instrumenten.', cl({ ex: [0, 0, -0.14] })),
    intPart('Instrumentenkap', intHood(0.372, 0.344, [[0.493, 1.049], [0.53, 1.058], [0.58, 1.061], [0.635, 1.048], [0.685, 1.008], [0.722, Sk(0.722)]],
      [[0.708, Sk(0.708)], [0.673, 0.999], [0.627, 1.038], [0.58, 1.05], [0.535, 1.047], [0.497, 1.04]], 0.524), MAT.dash, 'Kap over de instrumenten tegen reflecties in de voorruit; loopt met twee wangen over in de dashboardkop.', { ex: [0, 0.08, -0.03] }),
  ]);
  // navigatiescherm: verzonken achter een kap in het midden van de dashboardkop, boven de middelste roosters
  const nv = o => Object.assign({ p: [0, 0.988, 0.579], r: [0.3, 0, 0] }, o);
  const nav = A('Navigatiescherm', { d: 'Scherm van de Carminat TomTom Live-navigatie, verzonken onder een kap in het midden van de dashboardkop boven de middelste roosters; bediening met de joystick op de middenconsole.', spec: [['Schermdiagonaal', '14 cm']], ex: [0, 0.16, -0.06] }, [
    intPart('Schermbehuizing', G.rbox(0.15, 0.09, 0.012, 0.004), MAT.plastic, 'Zwarte lijst rond het scherm.', nv({ ex: [0, 0.03, 0.03] })),
    intPart('Schermglas', xf(intDecal(0.122, 0.069, intTexR.nav), [0, 0.003, -0.0065]), MAT.intDecal, 'Beeldscherm van de navigatie (kaartbeeld schematisch).', nv({ ex: [0, 0.02, -0.08] })),
    intPart('Schermkap', intHood(0, 0.196, [[0.552, 1.047], [0.585, 1.054], [0.63, 1.052], [0.675, 1.02], [0.712, Sk(0.712)]],
      [[0.698, Sk(0.698)], [0.664, 1.012], [0.625, 1.042], [0.587, 1.044], [0.556, 1.039]], 0.562), MAT.dash, 'Kap over het navigatiescherm die in de dashboardkop overloopt.', { ex: [0, 0.1, 0] }),
  ]);
  // sierband: pianozwarte band op de schuine rand van de dashboardkop, van de instrumentenkap tot voor het handschoenenkastje
  const bandF = intFace(0.875, intSkinT + 0.0025);
  const band = intPart('Sierband dashboard', G.box(0.76, 0.084, 0.004), MAT.intPiano, 'Pianozwarte sierband horizontaal tussen de roosters (fase 2 in plaats van hout), op de schuine rand van de dashboardkop.', { p: [-0.175, bandF.y, bandF.z], r: [bandF.rx, 0, 0], ex: [0, 0.02, -0.08] });
  // klimaatbediening: verticaal paneeltje tussen de middelste roosters, op de sierband
  const climate = (() => { const f = intFace(0.872, 0), W = intClimW, H = intClimH; return A('Klimaatbediening', { d: 'Bediening van de automatische tweezone-klimaatregeling als verticaal paneeltje tussen de middelste roosters: display, de toetsen SOFT, AUTO en FAST, temperatuur per zone, airco, ventilator en recirculatie (indeling naar de foto, opschriften schematisch).', p: [0, f.y, f.z], r: [f.rx, 0, 0], ex: [0, -0.02, -0.14] }, [
    intPart('Klimaatpaneel', xf(G.rbox(W, H, 0.012, 0.004), [0, 0, -0.023]), MAT.dash, 'Paneel met de bediening van de klimaatregeling.', { ex: [0, 0, -0.02] }),
    intPart('Klimaatomlijsting', xf(intRing(0.099, 0.079, 0.008, 0.091, 0.071, 0.005, 0.0025), [0, 0, -0.0305]), MAT.satin, 'Omlijsting in satijnchroom rond het klimaatpaneel.', { ex: [0, 0, -0.05] }),
    intPart('Klimaatdisplay', xf(intDecal(0.071, 0.017, intTexR.climDisp), [0, H / 2 - 0.0275, -0.0295]), MAT.intDecal, 'Display met de ingestelde temperaturen en de stand.', { ex: [0, 0, -0.06] }),
    intPart('Klimaattoetsen', intKeys(intClimKeys, W, H, 0.003, -0.031), MAT.plastic, 'Toetsen voor SOFT, AUTO en FAST, temperatuur links en rechts, airco, ventilator en recirculatie.', { ex: [0, 0, -0.07] }),
    intPart('Opschriften klimaat', xf(intDecal(W, H, intTexR.clim), [0, 0, -0.033]), MAT.intDecal, 'Opschriften op de toetsen van de klimaatbediening.', { ex: [0, 0, -0.09] }),
  ]); })();
  // toetsenrij onder de klimaatbediening: alarmlicht, ontwaseming en stoelverwarming (u loopt van x 0,02 naar x -0,16)
  const rowF = intFace(0.818, 0), row = o => Object.assign({ p: [0.02 - intHazW / 2, rowF.y, rowF.z], r: [rowF.rx, 0, 0] }, o);
  const rowKeys = (a, b) => intKeys(intHazKeys.slice(a, b), intHazW, intHazH, 0.006, -0.0215);
  const hazard = intPart('Alarmlichtschakelaar', rowKeys(0, 1), MAT.red, 'Schakelaar voor de alarmknipperlichten, in de toetsenrij onder de klimaatbediening.', row({ ex: [0, 0.03, -0.1] }));
  const rowDef = intPart('Ontwasemtoetsen', rowKeys(1, 3), MAT.plastic, 'Toetsen voor het ontwasemen van de voorruit en de achterruit.', row({ ex: [0, 0.02, -0.1] }));
  const rowSeat = intPart('Stoelverwarmingstoetsen', rowKeys(3, 5), MAT.plastic, 'Toetsen van de stoelverwarming voor bestuurder en passagier (plaats aannemelijk).', row({ ex: [-0.02, 0.02, -0.1] }));
  const rowTxt = intPart('Opschriften toetsenrij', xf(intDecal(intHazW, intHazH, intTexR.hazRow), [0, 0, -0.025]), MAT.intDecal, 'Symbolen op de toetsen onder de klimaatbediening.', row({ ex: [0, 0.03, -0.12] }));
  // radio onderaan het middenpaneel: zes voorkeuzetoetsen, cd-sleuf en een ronde volumeknop op een chromen boog
  const audio = (() => { const f = intFace(0.765, 0), W = intRadW, H = intRadH, yb = H / 2 - 0.049; return A('Audiobediening', { d: 'Radio met cd-speler van de Carminat onderaan het middenpaneel: een rij met zes voorkeuzetoetsen, de cd-sleuf en een chromen boog met toetsen en een ronde volumeknop. Bose-geluidssysteem met tien luidsprekers, waarvan er negen zijn weergegeven (drie in het dashboard, twee op de achterplank, vier in de portieren); de tiende is niet getoond.', p: [0, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }, [
    intPart('Audiopaneel', xf(G.rbox(W, H, 0.008, 0.003), [0, 0, -0.0225]), MAT.plastic, 'Zwart frontpaneel van de radio.', { ex: [0, 0, -0.02] }),
    intPart('Voorkeuzetoetsen', intKeys(intRadKeys.slice(0, 8), W, H, 0.004, -0.029), MAT.plasticGrey, 'Rij met de zes voorkeuzetoetsen en de toetsen LOAD en EJECT.', { ex: [0, 0.02, -0.06] }),
    intPart('CD-sleuf', xf(G.box(0.12, 0.003, 0.001), [0, H / 2 - 0.024, -0.0272]), MAT.rubber, 'Sleuf in het radiopaneel waarin de cd wordt geschoven.', { ex: [0, 0, -0.06] }),
    intPart('Sierlijst radio', xf(front(shapeOf(rrectPts(0.18, 0.018, 0.009)), 0.002), [0, yb, -0.0276]), MAT.satin, 'Chromen boog onderaan de radio met de bedieningstoetsen en de volumeknop.', { ex: [0, -0.02, -0.05] }),
    intPart('Radiotoetsen', intKeys(intRadKeys.slice(8), W, H, 0.003, -0.0303), MAT.plastic, 'Toetsen voor telefoon, cd, radio, bron en zoeken op de chromen boog.', { ex: [0, -0.02, -0.07] }),
    intPart('Volumeknop', xf(G.cyl('z', 0.0105, 0.0115, 0.012, 24), [0, yb, -0.0347]), MAT.chrome, 'Ronde draaiknop voor het volume met aan/uit in het midden.', { ex: [0, 0, -0.09] }),
    intPart('Opschriften radio', xf(intDecal(W, H, intTexR.radio), [0, 0, -0.0322]), MAT.intDecal, 'Opschriften op de toetsen van de radio.', { ex: [0, 0, -0.11] }),
  ]); })();
  const cupF = intFace(0.68, 0);
  const cupDrawer = intPart('Bekerhouder dashboard', merge([xf(G.rbox(0.16, 0.034, 0.006, 0.002), [0, 0, -0.0215]), xf(G.box(0.05, 0.004, 0.003), [0, 0.008, -0.026])]), MAT.plastic, 'Uitschuifbare bekerhouder in het middenpaneel onder de radio, hier ingeschoven (plaats aannemelijk).', { p: [0, cupF.y, cupF.z], r: [cupF.rx, 0, 0], ex: [0, -0.02, -0.12] });
  const speakers = A('Luidsprekers dashboard', { d: 'Bose-luidsprekers in het dashboard: een middenluidspreker van 10 cm en twee hoogtonerluidsprekers; het Bose-systeem heeft tien luidsprekers, waarvan er negen zijn weergegeven (drie hier, twee op de achterplank, vier in de portieren); de overige is niet getoond en de posities zijn geschat.', ex: [0, 0.14, 0] }, [
    intPart('Roostermiddenluidspreker', G.rbox(0.12, 0.004, 0.1, 0.002), MAT.plastic, 'Rooster boven de middenluidspreker.', { p: [0, intDashTop(0.86) + 0.0005, 0.86], ex: [0, 0.08, 0] }),
    intPart('Middenluidspreker', merge([xf(G.cyl('y', 0.05, 0.03, 0.03, 24), [0, 0, 0]), xf(G.cyl('y', 0.018, 0.018, 0.012, 16), [0, 0.012, 0])]), MAT.darkSteel, 'Luidspreker van 10 cm in het midden van het dashboard.', { p: [0, intDashTop(0.86) - 0.025, 0.86], inner: true, ex: [0, 0.04, 0] }),
    ...[1, -1].map(s => intPart(`Hoogtonerrooster ${sideName(s)}`, G.rbox(0.05, 0.004, 0.04, 0.002), MAT.plastic, 'Rooster boven de hoogtonerluidspreker bij de A-stijl.', { p: [s * 0.62, intDashTop(0.9) + 0.0005, 0.9], ex: [s * 0.04, 0.08, 0] })),
    ...[1, -1].map(s => intPart(`Hoogtoner ${sideName(s)}`, G.cyl('y', 0.018, 0.016, 0.02, 14), MAT.darkSteel, 'Hoogtonerluidspreker (tweeter).', { p: [s * 0.62, intDashTop(0.9) - 0.015, 0.9], inner: true, ex: [s * 0.04, 0.04, 0] })),
  ]);
  // handschoenenkastje: uitsparing in de dashboarddrager (halve breedte, halve hoogte en diepte in het frame van het kastje)
  const gf = intFace(0.69, 0.008), gHx = 0.19, gHy = 0.067, gDp = 0.29, gHinge = [0, -0.075, 0];
  const gS = Math.sin(gf.rx), gC = Math.cos(gf.rx), gK = gf.y * gC + gf.z * gS, gM = gf.z * gC - gf.y * gS;
  const gAng = -1.26, gKlep = 'Handschoenenkastklep';
  // de klep (scharnier onder), de sluiting als volger; de bak is een open bak met bodem, zijwanden en achterwand
  const gTray = () => {
    const tx = gHx - 0.003, ty = gHy - 0.003, t = 0.008, z0 = 0.012, z1 = gDp - 0.004, zc = (z0 + z1) / 2, D = z1 - z0, bx = (w, h, d, p) => intBox(w, h, d, p);
    return merge([bx(2 * tx, t, D, [0, -ty + t / 2, zc]), bx(2 * tx, t, D, [0, ty - t / 2, zc]),
      bx(t, 2 * ty, D, [tx - t / 2, 0, zc]), bx(t, 2 * ty, D, [-tx + t / 2, 0, zc]), bx(2 * tx, 2 * ty, t, [0, 0, z1 - t / 2]),
      bx(0.1, 0.02, 0.006, [0.1, -ty + t + 0.01, z1 - t - 0.003])]);
  };
  const glove = A('Handschoenenkastje', { d: 'Afsluitbaar, groot handschoenenkastje met demper en de filters erachter. De klep klapt om een scharnier onderaan omlaag; daarachter zit een open bak in een uitsparing van het dashboard (schematisch).', p: [-0.38, gf.y, gf.z], r: [gf.rx, 0, 0], ex: [0, -0.05, -0.16] }, [
    intPart('Handschoenenkastklep', G.rbox(0.4, 0.15, 0.02, 0.008), MAT.dash, 'Klep die naar beneden opent, met scharnier onderaan (geschat 72 graden open).', { ex: [0, -0.06, -0.1], open: hinge(gHinge, [1, 0, 0], gAng, Object.assign({ min: 1.05, label: 'Handschoenenkastje', look: { dir: [0.3, 0.5, -0.8], nodes: ['Handschoenenkastje'] } }, intNeed('Portier rechtsvoor'))) }),
    intPart('Handschoenenkastslot', G.rbox(0.05, 0.02, 0.012, 0.004), MAT.plasticGrey, 'Sluiting met greep in de bovenrand van de klep.', { p: [0, 0.065, -0.014], ex: [0, 0.04, -0.06], open: follow(gKlep, gHinge, [1, 0, 0], gAng) }),
    intPart('Handschoenenkastbak', gTray(), MAT.leather, 'Open bak in lichtbeige kunststof achter de klep met bodem, zijwanden en achterwand; gekoeld met lucht uit de airco (schematisch).', { ex: [0, 0, 0.06] }),
    intPart('Handschoenenkastdemper', xf(G.cyl('x', 0.007, 0.007, 0.05, 8), [0.15, -0.068, 0.02]), MAT.darkSteel, 'Draaidemper op de scharnieras die de klep gecontroleerd laat zakken.', { inner: true, ex: [0, -0.06, 0.04] }),
  ]);
  const airbag = A('Passagiersairbag', { d: 'Airbag aan passagierszijde, uit te schakelen met de sleutelschakelaar, achter een klep in de bovenkant van het dashboard.', p: [-0.38, 0, 0.7], ex: [0, 0.22, 0] }, [
    intPart('Airbagklep', G.rbox(0.3, 0.008, 0.2, 0.003), MAT.dash, 'Scheurnaad in het dashboard die bij ontsteking openklapt.', { p: [0, intDashTop(0.7) - 0.0015, 0], ex: [0, 0.1, 0] }),
    intPart('Airbagbehuizing', G.rbox(0.28, 0.1, 0.18, 0.012), MAT.plastic, 'Behuizing van de airbagmodule.', { p: [0, 0.89, 0], inner: true, ex: [0, 0.04, 0] }),
    intPart('Airbaggasgenerator', xf(G.cyl('x', 0.025, 0.025, 0.24, 14), [0, 0.88, 0.0]), MAT.darkSteel, 'Gasgenerator die de airbag vult.', { inner: true, ex: [0, -0.02, 0.06] }),
    intPart('Airbagkussen', G.rbox(0.22, 0.04, 0.14, 0.012), MAT.fabric, 'Opgevouwen kussen van de passagiersairbag; bij een botsing blaast de gasgenerator het op en breekt het door de klep.', { p: [0, 0.93, 0], inner: true, ex: [0, 0.06, 0] }),
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
    intPart('Aanjagerwaaier', blades(18, 0.018, 0.066, 0.1, 0.004, 0.2, 'x'), MAT.steel, 'Schoepenwiel van de aanjager dat de lucht door het filter en de verdamper blaast.', { p: [-0.33, -0.03, 0], ex: [-0.2, 0, 0] }),
    intPart('Aanjagermotor', G.cyl('x', 0.03, 0.03, 0.08, 16), MAT.darkSteel, 'Elektromotor van de aanjager.', { p: [-0.42, -0.03, 0], ex: [-0.3, 0, 0] }),
    intPart('Servomotoren', merge([bx(0.04, 0.03, 0.03, 0.006, [0.2, 0.1, -0.1]), bx(0.04, 0.03, 0.03, 0.006, [0.2, -0.1, 0.1]), bx(0.04, 0.03, 0.03, 0.006, [-0.2, 0.1, 0.1])]), MAT.plastic, 'Stelmotoren van de mengkleppen en de recirculatieklep (aantal geschat).', { ex: [0.1, 0, 0] }),
    intPart('Pollen- en koolstoffilter', G.rbox(0.26, 0.04, 0.12, 0.004), MAT.filter, 'Combinatiefilter tegen stuifmeel en geuren; het filter zit achter het handschoenenkastje.', { p: [-0.1, 0.12, -0.04], ex: [-0.1, 0.1, 0] }),
  ]);
  const harness = A('Kabelboom dashboard', { d: 'Kabelboom van het dashboard met connectorblokken (schematisch).', ex: [0, -0.1, -0.1] }, [
    intPart('Kabelboom', tube([[0.7, 0.74, 0.58], [0.35, 0.73, 0.6], [0, 0.72, 0.6], [-0.35, 0.73, 0.6], [-0.7, 0.74, 0.58]], 0.012, 32, 6), MAT.plastic, 'Hoofdkabelboom langs de dwarsbalk.', { ex: [0, -0.04, 0] }),
    intPart('Connectorblok bestuurderszijde', G.rbox(0.07, 0.04, 0.03, 0.006), MAT.plasticGrey, 'Stekkerblok naar de UCH en het instrumentenpaneel.', { p: [0.55, 0.74, 0.58], ex: [0.05, -0.04, 0] }),
    intPart('Connectorblok passagierszijde', G.rbox(0.07, 0.04, 0.03, 0.006), MAT.plasticGrey, 'Stekkerblok naar airbag en klimaatunit.', { p: [-0.55, 0.74, 0.58], ex: [-0.05, -0.04, 0] }),
  ]);
  const huid = intPart('Dashboardhuid', side(shapeOf(skinPts), 1.5), MAT.dash, 'Gestikte (surpique) bovenkant van het dashboard over de draagstructuur.', { ex: [0, 0.14, 0.05] });
  const gCut = [intSideBlock(intDashPf, -0.75, -0.38 - gHx), intSideBlock(intDashPf, -0.38 + gHx, 0.75),
    intSideBlock(clipPoly(intDashPf, -gS, -gC, -gHy - gK), -0.38 - gHx, -0.38 + gHx), intSideBlock(clipPoly(intDashPf, gS, gC, -gHy + gK), -0.38 - gHx, -0.38 + gHx),
    intSideBlock(clipPoly(clipPoly(clipPoly(intDashPf, gS, gC, gHy + gK), -gS, -gC, gHy - gK), -gC, gS, -gDp - gM), -0.38 - gHx, -0.38 + gHx)];
  const carrier = intPart('Dashboarddrager', merge(gCut), MAT.dash, 'Kunststof draagstructuur van het dashboard met het voorvlak; hier loopt de stuurkolom doorheen.', { ex: [0, 0.0, 0.1] });
  const fascia = intPart('Dashboardmiddenpaneel', side(shapeOf(fasPts), 0.30), MAT.dash, 'Middenpaneel onder de roosters met de toetsenrij, de kaartlezer, de radio en de bekerhouder.', { ex: [0, 0, -0.06] });
  const defrost = intPart('Ontwasemroosters', merge([xf(G.box(0.9, 0.004, 0.035), [0, intDashTop(0.97) + 0.0005, 0.97]), xf(G.box(0.08, 0.004, 0.05), [0.7, intDashTop(0.9) + 0.0005, 0.92]), xf(G.box(0.08, 0.004, 0.05), [-0.7, intDashTop(0.9) + 0.0005, 0.92])]), MAT.plastic, 'Sleuven die lucht tegen de voorruit en de zijruiten blazen.', { ex: [0, 0.1, 0] });
  const caps = [1, -1].map(s => intPart(`Dashboardeindkap ${sideName(s)}`, G.rbox(0.012, 0.3, 0.38, 0.004), MAT.plasticGrey, 'Kap op het uiteinde van het dashboard naast de portier.', { p: [s * 0.757, 0.8, 0.78], ex: [s * 0.14, 0, 0] }));
  // kaartsleuf (horizontaal, direct onder het linker middenluchtrooster) en startknop (links daarvan, aan de linkerrand van het middenpaneel naast het stuur): Notice NU 936-5, blz. 1.42-1.43, item 22; linksgestuurd, bestuurder aan +x; maten geschat
  const kaart = (() => { const f = intFace(0.8315, 0.024); return intPart('Kaartlezer', G.rbox(0.085, 0.012, 0.012, 0.004), MAT.plastic, 'Sleuf voor de handsfree Renault-kaart, horizontaal direct onder het linker middenluchtrooster (plaats bevestigd met de gebruiksaanwijzing NU 936-5, blz. 1.42-1.43, item 22; de maten zijn geschat).', { p: [0.1, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }); })();
  const start = (() => { const f = intFace(0.78, 0.006); return intPart('Startknop', G.cyl('z', 0.015, 0.015, 0.012, 20), MAT.chrome, 'Ronde start-/stopknop van de motor, links van de kaartsleuf aan de linkerrand van het middenpaneel naast het stuur, ongeveer op radiohoogte (plaats volgens de gebruiksaanwijzing NU 936-5, blz. 1.42-1.43, item 22; de maten zijn geschat).', { p: [0.185, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }); })();
  // onderdashboard (golf 5l): knieplaat onder de stuurkolom, afdekking van de voetruimte van de onderrand van de drager schuin naar
  // voren (tot y 0,425 op z 0,925, met gaten voor de pedaalarmen) met een voetwand tot net boven de vloer en zijbekleding tussen dashboard en dorpel; zo is de voetruimte van boven en opzij dicht
  const knF = intFace(0.565, 0.0065);
  const knee = intPart('Knieplaat', G.rbox(0.56, 0.085, 0.012, 0.004), MAT.dash, 'Beklede knieplaat onder de stuurkolom aan bestuurderszijde, onder het onderpaneel.', { p: [0.44, knF.y, knF.z], r: [knF.rx, 0, 0], ex: [0, -0.06, -0.12] });
  // gaps: stukken [x0, x1] waar de voetwand ontbreekt (passagierszijde: daar lopen de remleidingen naar achteren door de voetruimte)
  const footPlate = (x0, x1, holes, gaps = []) => cache(`intFootPlate${x0}|${x1}`, () => {
    const s = shapeOf([[x0, 0.675], [x1, 0.675], [x1, 0.925], [x0, 0.925]]);
    holes.forEach(([a, b, c, d]) => s.holes.push(new THREE.Path([[a, c], [b, c], [b, d], [a, d]].map(p => new THREE.Vector2(p[0], p[1])))));
    const g = plan(s, 0.006), m = -0.2866;   // schuin: bovenkant y = 0,497 op z 0,675 en 0,425 op z 0,925 (daarvoor wielkast en remleidingen)
    g.applyMatrix4(new THREE.Matrix4().set(1, 0, 0, 0, 0, 1, m, 0.501 - 0.003 - m * 0.66, 0, 0, 1, 0, 0, 0, 0, 1));
    // voetwand onder de voorrand tot net boven de vloer, naast de tunnel met tapijt (|x| vanaf 0,16)
    let xs = [[Math.min(x0, x1) < 0 ? x0 : Math.max(x0, 0.16), x1 > 0 ? x1 : Math.min(x1, -0.16)]];
    for (const [a, b] of gaps) xs = xs.flatMap(([u, v]) => (b <= u || a >= v ? [[u, v]] : [[u, a], [b, v]].filter(([p, q]) => q - p > 0.01)));
    return merge([g, ...xs.map(([u, v]) => xf(G.box(v - u, 0.1315, 0.006), [(u + v) / 2, 0.35575, 0.915]))]);
  });
  const kick = s => intPart(`Zijbekleding voetruimte ${sideName(s)}`, xf(side(shapeOf([[0.63, 0.30], [0.95, 0.30], [0.95, 0.58], [0.9, 0.595], [0.68, 0.495], [0.63, 0.505]]), 0.006), [s * 0.745, 0, 0]), MAT.dash,
    'Zijbekleding van de voetruimte tussen de onderrand van het dashboard, de dorpel en de wielkast (vorm geschat).', { ex: [s * 0.1, -0.04, 0] });
  const under = A('Onderdashboard', { d: 'Knieplaat, afdekkingen onder het dashboard en zijbekleding van de voetruimte: van boven en van opzij zijn kabelboom, pedaalbok en tussenas niet te zien (vorm geschat).', ex: [0, -0.12, 0] }, [
    knee,
    intPart('Afdekking voetruimte bestuurder', footPlate(0.135, 0.742, [[0.378, 0.422, 0.742, 0.781], [0.212, 0.248, 0.782, 0.811]]), MAT.dash, 'Afdekking onder het dashboard aan bestuurderszijde, schuin van de onderrand naar voren, met openingen voor rem- en gaspedaalarm en een voetwand voor het schutbord tot net boven de vloer.', { ex: [0, -0.1, 0.06] }),
    intPart('Afdekking voetruimte passagier', footPlate(-0.742, -0.135, [], [[-0.325, -0.25]]), MAT.dash, 'Afdekking onder het dashboard aan passagierszijde, schuin van de onderrand naar voren met een voetwand voor het schutbord; dekt de klimaatunit van onderen af. In de voetwand zit een opening waar de remleidingen naar achteren lopen.', { ex: [0, -0.1, 0.06] }),
    kick(1), kick(-1),
  ]);
  return A('Dashboard', { d: 'Zwart dashboard met instrumentenpaneel onder een kap, verzonken navigatiescherm, pianozwarte sierband, klimaat- en audiobediening, kaartlezer en startknop, luchtroosters, handschoenenkastje, passagiersairbag, onderdashboard, klimaatunit en dwarsbalk.', ex: [0, 0.16, 0.6] }, [
    A('Dashboardschil', { d: 'Draagstructuur en zichtbare bekleding van het dashboard: drager, gestikte huid, middenpaneel, pianozwarte sierband, eindkappen en de ontwasemsleuven.', ex: [0, 0.3, 0.3] }, [carrier, huid, fascia, band, ...caps, defrost]),
    A('Luchtroosters', { d: 'Vier verstelbare luchtroosters: twee in het midden (circa 17 bij 7 cm) en twee aan de zijkanten van het dashboard, elk een hol huis met lamellen erin.', ex: [0, 0.04, -0.06] }, [
      ventGroup('Luchtrooster midden links', 0.135, 0.17, -0.017, 'Verstelbaar middenrooster aan bestuurderszijde.'), ventGroup('Luchtrooster midden rechts', -0.135, 0.17, -0.017, 'Verstelbaar middenrooster aan passagierszijde.'),
      ventGroup('Luchtrooster zij links', 0.62, 0.11, -0.013, 'Verstelbaar zijrooster aan bestuurderszijde, richt de lucht op de zijruit of het gezicht.'), ventGroup('Luchtrooster zij rechts', -0.62, 0.11, -0.013, 'Verstelbaar zijrooster aan passagierszijde.'),
    ]),
    cluster, nav,
    A('Bedieningspanelen', { d: 'Bediening op het middenpaneel van boven naar onder: klimaat tussen de roosters, de toetsenrij met alarmlicht, ontwaseming en stoelverwarming, de kaartlezer en de startknop, de radio en de bekerhouder.', ex: [0, 0, -0.05] }, [climate, hazard, rowDef, rowSeat, rowTxt, kaart, start, audio, cupDrawer]),
    speakers, glove, airbag, uch, under, beam, hvac, harness,
  ]);
}

/* ---------- middenconsole ---------- */
function intConsole() {
  const bx = intBx, cy = intCy;
  const cup = G.lathe('y', [[0.035, 0], [0.035, -0.06], [0, -0.06]], 24, 'intCup');
  const knob = G.lathe('y', [[0, 0.054], [0.0135, 0.055], [0.0155, 0.068], [0.0185, 0.086], [0.0178, 0.1], [0.0115, 0.108], [0, 0.11]], 20, 'intKnob5l');
  const boot = G.lathe('y', [[0.0125, 0.002], [0.0118, 0.03], [0.0128, 0.055], [0, 0.055]], 16, 'intBoot5l');
  // poortplaat: chromen plaat met de sleuf voor de hendel (hendel op x 0, van z -0,05 tot 0,05); opschrift P R N D links ernaast
  const gate = cache('intGatePlate', () => { const sh = shapeOf(rrectPts(0.12, 0.2, 0.02)); sh.holes.push(new THREE.Path(rrectPts(0.02, 0.11, 0.008).map(p => new THREE.Vector2(p[0], p[1])))); return plan(sh, 0.004); });
  const joyPad = cache('intJoyPad', () => plan(shapeOf(rrectPts(intJoyW, intJoyW, 0.016)), 0.004));
  const stick = G.lathe('y', [[0, 0], [0.017, 0], [0.019, 0.012], [0.012, 0.024], [0, 0.026]], 16, 'intStick');
  const sel = A('Keuzehendelmodule', { d: 'Keuzehendel van de automaat met poort P-R-N-D, ontgrendelknop op de hendel (rempedaal nodig) en een handmatige stand door de hendel naar links te duwen; de standindicatie staat in het instrumentenpaneel.', p: [0, 0.495, 0.2], ex: [0, 0.18, 0] }, [
    intPart('Standaanduiding', gate, MAT.chrome, 'Chromen poortplaat met de sleuf voor de hendel.', { p: [0, -0.003, 0], ex: [0, 0.04, 0] }),
    intPart('Opschrift keuzepoort', xf(intDecal(0.06, 0.12, intTexR.gate, true), [0.038, -0.0005, 0]), MAT.intDecal, 'Standen P, R, N en D langs de sleuf en de handmatige stand (+ en -) ernaast.', { ex: [0, 0.06, 0] }),
    intPart('Keuzehendelhoes', boot, MAT.intBlackLeather, 'Hoes van zwart leder om de hendelstang, van de poort tot onder de knop.', { ex: [0, 0.08, 0] }),
    intPart('Keuzehendel', merge([xf(G.cyl('y', 0.007, 0.007, 0.07, 10), [0, 0.035, 0]), knob]), MAT.satin, 'Hendel met een knop van geborsteld aluminium waarmee de stand van de automaat wordt gekozen.', { ex: [0, 0.16, 0] }),
    intPart('Ontgrendelknop hendel', xf(G.cyl('z', 0.006, 0.006, 0.01, 10), [0, 0.075, -0.018]), MAT.chrome, 'Drukknop in de knop die de hendel uit de parkeerstand vrijgeeft.', { ex: [0, 0.18, -0.06] }),
    intPart('Keuzehendelhuis', G.rbox(0.1, 0.07, 0.16, 0.012), MAT.darkSteel, 'Mechaniekhuis met de poort onder de plaat.', { p: [0, -0.045, 0], inner: true, ex: [0, -0.08, 0] }),
    intPart('Keuzekabel', tube([[0, -0.05, 0.08], [0, -0.062, 0.16], [0, -0.07, 0.24]], 0.005, 12, 6), MAT.steel, 'Schakelkabel naar de automaatbak, hier kort weergegeven; de aansluiting op de bak hoort bij de aandrijflijn.', { inner: true, ex: [0, -0.1, 0.1] }),
  ]);
  // armsteun: opbergvak (open bak op de consoletop) met een deksel dat om de scharnieras achter omhoog klapt
  const aHinge = [0, 0, -0.14], aAng = -1.15, aLid = 'Renault Laguna III/Interieur/Middenconsole/Armsteun middenconsole/Armsteunkussen';
  const aTray = (() => { const tx = 0.09, tz = 0.13, t = 0.008, y0 = -0.07, y1 = -0.002, hh = y1 - y0, yc = (y0 + y1) / 2;
    return merge([intBox(2 * tx, t, 2 * tz, [0, y0 + t / 2, 0]), intBox(t, hh, 2 * tz, [tx - t / 2, yc, 0]), intBox(t, hh, 2 * tz, [-tx + t / 2, yc, 0]),
      intBox(2 * tx, hh, t, [0, yc, tz - t / 2]), intBox(2 * tx, hh, t, [0, yc, -tz + t / 2]), intBox(0.006, hh - t, 2 * tz - 2 * t, [0, yc + t / 2, 0])]); })();
  const aWrap = (() => { const wx = 0.1, wz = 0.15, t = 0.011, y0 = -0.07, y1 = -0.002, hh = y1 - y0, yc = (y0 + y1) / 2, r = 0.005;
    return merge([xf(G.rbox(t, hh, 2 * wz, r), [wx - t / 2, yc, 0]), xf(G.rbox(t, hh, 2 * wz, r), [-wx + t / 2, yc, 0]),
      xf(G.rbox(2 * wx - 2 * t + 0.004, hh, t, r), [0, yc, wz - t / 2]), xf(G.rbox(2 * wx - 2 * t + 0.004, hh, t, r), [0, yc, -wz + t / 2])]); })();
  const arm = A('Armsteun middenconsole', { d: 'Armsteun met opbergvak en 12 V-aansluiting. Het gevoerde deksel klapt met de voorkant omhoog om een scharnieras achter in de armsteun; het opbergvak eronder is een open bak met een tussenschot (schematisch).', p: [0, 0.56, -0.26], ex: [0, 0.14, -0.05] }, [
    intPart('Armsteunkussen', bx(0.2, 0.035, 0.3, 0.015, [0, 0.0175, 0]), MAT.leather, 'Gevoerd deksel van de armsteun; klapt met de voorkant omhoog (geschat 66 graden).', { ex: [0, 0.14, -0.06], open: hinge(aHinge, [1, 0, 0], aAng, Object.assign({ min: 0.92, label: 'Armsteun middenconsole', look: { dir: [0, 0.5, 0.86], nodes: ['Armsteun middenconsole'] } }, intNeed('Portier linksvoor'))) }),
    intPart('Dekselvoering', intBox(0.19, 0.0015, 0.29, [0, -0.00075, 0]), MAT.plastic, 'Donkere kunststof onderkant van het armsteundeksel; klapt met het deksel mee en laat bij een opgeklapt deksel zien dat dit het deksel is en niet de stoelwang.', { ex: [0, 0.1, -0.03], open: follow(aLid, aHinge, [1, 0, 0], aAng) }),
    intPart('Armsteunscharnier', xf(G.cyl('x', 0.008, 0.008, 0.14, 10), [0, 0.0, -0.14]), MAT.darkSteel, 'Scharnieras achter in de armsteun.', { ex: [0, 0.04, -0.06] }),
    intPart('Armsteunslot', bx(0.04, 0.012, 0.012, 0.004, [0, 0.0, 0.15]), MAT.plasticGrey, 'Sluiting aan de voorkant van het deksel.', { ex: [0, 0.06, 0.06], open: follow(aLid, aHinge, [1, 0, 0], aAng) }),
    intPart('Armsteunbekleding', aWrap, MAT.leather, 'Lederen bekleding rond het opbergvak: sluit aan op de rand van het deksel, zodat van boven alleen de binnenkant van de bak te zien is.', { ex: [0, -0.02, 0] }),
    intPart('Opbergbak', aTray, MAT.plastic, 'Opbergvak onder het deksel: open bak met bodem, wanden en een tussenschot.', { ex: [0, -0.04, 0] }),
    intPart('Aansluiting 12 V', merge([xf(G.cyl('z', 0.013, 0.013, 0.014, 14), [0, -0.04, 0.125])]), MAT.darkSteel, 'Aansluiting van 12 V in het opbergvak.', { ex: [0, 0, 0.08] }),
  ]);
  return A('Middenconsole', { d: 'Middenconsole met pianozwart inzetstuk, keuzehendel met chromen poortplaat, de navigatiebediening met acht toetsen, parkeerremschakelaar, bekerhouders en armsteun.', ex: [0, 0.12, 0.05] }, [
    intPart('Consolebehuizing', G.rbox(0.24, 0.08, 0.87, 0.03), MAT.dash, 'Kunststof console op de vloertunnel, boven het tapijt.', { p: [0, 0.45, 0.015], ex: [0, -0.06, 0] }),
    intPart('Consoleinzetstuk', G.rbox(0.15, 0.004, 0.52, 0.002), MAT.intPiano, 'Pianozwart inzetstuk op de console (hoogglans).', { p: [0, 0.491, 0.0], ex: [0, 0.05, 0] }),
    intPart('Consolevoorpaneel', G.rbox(0.24, 0.21, 0.175, 0.03), MAT.dash, 'Voorste deel van de console onder de klimaatbediening, loopt door in het dashboard.', { p: [0, 0.515, 0.5125], ex: [0, 0, 0.1] }),
    sel,
    intPart('Parkeerremschakelaar', G.rbox(0.04, 0.015, 0.05, 0.005), MAT.plastic, 'Schakelaar van de elektrische parkeerrem.', { p: [0.07, 0.496, 0.34], ex: [0.04, 0.1, 0] }),
    A('Joystick navigatie', { d: 'Bediening van de Carminat-navigatie op de middenconsole: een kantel- en draaiknop met daaromheen een toetsenveld van acht toetsen (DEST, BACK, TEL, MAP, INFO, ROUTE, ZOOM en LIGHT; volgorde schematisch).', p: [0, 0.495, 0.03], ex: [0, 0.1, 0] }, [
      intPart('Toetsenveld navigatie', joyPad, MAT.intPiano, 'Pianozwart toetsenveld rond de joystick.', { p: [0, 0.0025, 0], ex: [0, 0.01, 0] }),
      intPart('Navigatietoetsen', merge(intJoyKeys.map(([u, v]) => xf(G.box(0.015, 0.003, 0.010), [intJoyW / 2 - u, 0.0065, v - intJoyW / 2]))), MAT.plasticGrey, 'Acht toetsen rond de joystick.', { ex: [0, 0.03, 0] }),
      intPart('Opschriften navigatietoetsen', xf(intDecal(intJoyW, intJoyW, intTexR.joy, true), [0, 0.0085, 0]), MAT.intDecal, 'Opschriften op de toetsen van de navigatiebediening.', { ex: [0, 0.05, 0] }),
      intPart('Joystickbasis', G.cyl('y', 0.021, 0.021, 0.004, 24), MAT.satin, 'Ring rond de joystick van de navigatie.', { p: [0, 0.0067, 0], ex: [0, 0.02, 0] }),
      intPart('Joystickknop', stick, MAT.plasticGrey, 'Kantelbare en draaibare knop.', { p: [0, 0.0087, 0], ex: [0, 0.06, 0] }),
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
// hoedenplank: volger van de achterklep (die zit in de carrosserie); alleen als de klep een opener heeft
// needs: het portier of de klep gaat eerst open (alleen als die een opener heeft); naam uit de carrosserie
const intNeed = name => { const k = NODES.find(n => n.name === name); return k && k.opn ? { needs: 'Renault Laguna III/Carrosserie/' + name } : {}; };
const intTailgateNeed = () => intNeed('Achterklep');
// Hoek van de plank bij open klep: 0,9 rad (52 graden), zodat de plank van achteren en van boven als opgeklapt leest (handomdraai
// punt 1; bij 0,7 rad las hij als vlak). Gemeten bij open klep: 57 mm tot C-stijlbekleding en Klepafdichting, de achterruit en het
// binnenpaneel ver weg; boven 1,0 rad schuift het koordstuk in de plank, dus de koordjes begrenzen de hoek, niet de wanden.
const intPlankAng = 0.9;
const intPlankOpen = () => { const k = NODES.find(n => n.name === 'Achterklep'); return k && k.opn ? { open: follow('Renault Laguna III/Carrosserie/Achterklep', [0, 1.0, -1.575], [1, 0, 0], intPlankAng, { min: 0.72 }) } : {}; };
// koordjes van de hoedenplank: dunne telescoop van de achterhoek van de plank naar de binnenkant van de achterklep (de klep trekt de plank mee omhoog)
function intPlankCords() {
  const k = NODES.find(n => n.name === 'Achterklep'), TG = 'Renault Laguna III/Carrosserie/Achterklep';
  return [1, -1].map(s => {
    const a = [s * 0.48, 1.006, -2.1], b = [s * 0.48, 1.137, -1.533], dir = V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = dir.length();
    const o = { d: 'Koordje dat de hoedenplank aan de achterklep hangt (plaats geschat): een dun lichtgrijs nylon koord (enkele millimeters) van de achterhoek van de plank naar de binnenkant van de klep, dat strak komt als de klep omhoog gaat.', p: a, q: quatFromTo(V3(0, 0, 1), dir), ex: [s * 0.12, 0.1, -0.1] };
    if (k && k.opn) o.strut = { a: { node: 'Hoedenplank', p: [s * 0.48, 0.006, -0.25] }, b: { node: TG, p: b }, rod: 'Koordstuk', lead: TG, restLen: L };
    return A(`Hoedenplankkoord ${sideName(s)}`, o, [
      intPart('Koordhuls', merge([xf(G.cyl('z', 0.0028, 0.0028, 0.3, 6), [0, 0, 0.15]), G.sphere(0.007, 8)]), MAT.fabric, 'Koordhuls met oog aan de hoedenplank.', { ex: [0, 0.04, -0.04] }),
      intPart('Koordstuk', merge([xf(G.cyl('z', 0.0022, 0.0022, L - 0.25, 6), [0, 0, 0.25 + (L - 0.25) / 2]), xf(G.sphere(0.006, 8), [0, 0, L])]), MAT.fabric, 'Beweegbaar deel van het koordje met oog aan de achterklep.', { ex: [0, 0.04, 0.04] }),
    ]);
  });
}
// hoedenplank: voor 1,3 m breed, achter smaller (de C-stijlen komen naar elkaar toe), afgeronde achterhoeken
// halve breedte en diepte (vanaf de voorrand) van de uitsparing voor de middelste gordelrolautomaat; de automaat is 0,06 breed en
// reikt 4,5 cm achter de voorrand; de plank draait om het punt in de automaat, dus de diepte moet ook de hoek van de automaat
// (5,4 cm van het draaipunt) in elke stand vrijhouden
const intPlankNotch = { hw: 0.04, d: 0.06 };
// sparing in elke voorhoek voor de scharnierpen (r 11 mm, x 0,61 tot 0,70) en de kraag aan het eind (r 17 mm, x 0,606 tot 0,614):
// de pen ligt op de draaias van de plank, dus zonder sparing zat het midden van de voorrand in elke stand 10,6 mm diep in de pen
// (de inradius van de twaalfhoek). Ondiep deel a over de pen, diep deel b over de kraag; 1,5 tot 4 mm speling rondom. De zijrand
// eindigt voor op xv (4 mm binnen de volle halve breedte): zo ligt de voorhoek niet dieper op de afgeronde voorkant van de
// hoedenplanksteun (carrosserie, x 0,635 tot 0,685, tot z -1,60) dan voorheen.
const intPlankPen = { a: 0.0125, b: 0.021, xa: 0.6195, xc: 0.601, xv: 0.646 };
function intPlankGeo() {
  const hw0 = 0.65, hw1 = 0.52, z0 = 0.275, z1 = -0.275, r = 0.05, n = 6, pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * HALF; pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); } };
  // tegen de klok in in (x, z): rechtsachter (x min), linksachter (x plus), linksvoor, rechtsvoor
  arc(-hw1 + r, z1 + r, PI); arc(hw1 - r, z1 + r, PI * 1.5);
  // uitsparing van 8 cm in de voorrand voor de middelste gordelrolautomaat (die is 6 cm breed, z -1,54 tot -1,62): zonder uitsparing
  // sneed de plank daar door de automaat (B0 29,06 mm bij open klep; de plank draait om een punt in de automaat)
  const { a, b, xa, xc, xv } = intPlankPen, n0 = pts.length;
  pts.push([xv, z0 - a], [xa, z0 - a], [xa, z0 - b], [xc, z0 - b], [xc, z0], [intPlankNotch.hw, z0], [intPlankNotch.hw, z0 - intPlankNotch.d], [-intPlankNotch.hw, z0 - intPlankNotch.d], [-intPlankNotch.hw, z0],
    [-xc, z0], [-xc, z0 - b], [-xa, z0 - b], [-xa, z0 - a], [-xv, z0 - a]);
  // de hoeken van de pensparingen (eerste vijf en laatste vijf punten van de voorrand) met afronding 4 mm; de rest van de omtrek
  // houdt de afronding van roundPlate
  const klein = new Set([0, 1, 2, 3, 4, 9, 10, 11, 12, 13].map(i => n0 + i));
  return roundPlate(pts, 0.012, 0.004, 0.025, 4, i => klein.has(i)).rotateX(HALF);
}
// De hemelbekleding hangt 3,4 cm onder het dakvlak. Het dakframe van het panoramadak (src/panorama.js) hangt tot 2,85 cm eronder; bij 2,8 cm
// kwam de hemel op dezelfde hoogte als de onderkant van het frame en staken er donkere rechthoeken door. Nu zit er 5 mm tussen.
const intHemD = 0.034;
function intTrim() {
  const bx = intBx, cy = intCy;
  const carpet = front(shapeOf([[-0.8, 0.25], [-0.169, 0.25], [-0.128, 0.41], [0.128, 0.41], [0.169, 0.25], [0.8, 0.25], [0.8, 0.24], [0.164, 0.24], [0.12, 0.4], [-0.12, 0.4], [-0.164, 0.24], [-0.8, 0.24]]), 1.65); carpet.translate(0, 0, 0.125);
  // hemeloppervlak (de hemelbekleding ligt 8 mm onder intRoofY, 3,5 % naar binnen) en de helling ervan in lengte- en dwarsrichting
  const hl = (z, ax) => intRoofY(z, ax / 0.965) - (intHemD - 0.02), hlSlope = (z, ax) => (hl(z + 0.05, ax) - hl(z - 0.05, ax)) / 0.1;
  const handle = (s, z, n) => intPart(`Dakgreep ${n} ${sideName(s)}`, merge([bx(0.022, 0.024, 0.15, 0.008, [0, 0, 0]), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, 0.075]), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, -0.075])]), MAT.plasticGrey, 'Handgreep boven het portier met klapscharnier.', { p: [s * 0.6, hl(z, 0.6) - 0.021, z], r: [-hlSlope(z, 0.6), 0, 0], ex: [s * 0.1, -0.08, 0] });
  // zonneklep: draait om de voorrand van het paneel (langs de bovenrand van de voorruit) omlaag tot tegen de voorruit
  const visor = s => { const zc = 0.3, vx = s * 0.36, vy = hl(zc, 0.36) - 0.0085, rx = -hlSlope(zc, 0.36), rz = s * (hl(zc, 0.46) - hl(zc, 0.26)) / 0.2;
    const pivot = [vx, vy - 0.085 * Math.sin(rx), zc + 0.085 * Math.cos(rx)], axis = [Math.cos(rz), Math.sin(rz) * Math.cos(rx), Math.sin(rz) * Math.sin(rx)];
    return A(`Zonneklep ${sideName(s)}`, { d: 'Zonneklep met make-upspiegel en verlichting; schuin langs de voorruitrand gemonteerd. Draait om de voorrand omlaag tegen de voorruit (hoek geschat).', p: [vx, vy, zc], r: [rx, 0, rz], ex: [0, 0.3, 0.1],
      open: hinge(pivot, axis, -2.95, Object.assign({ min: 2.4, label: `Zonneklep ${sideName(s)}`, look: { dir: [-s * 0.45, -0.1, -1], nodes: [`Zonneklep ${sideName(s)}`] } }, intNeed(`Portier ${s > 0 ? 'linksvoor' : 'rechtsvoor'}`))) }, [
    intPart('Zonnekleppaneel', G.rbox(0.4, 0.012, 0.17, 0.006), MAT.fabric, 'Gevoerd paneel van de zonneklep.', { ex: [0, 0.06, 0] }),
    intPart('Make-upspiegel', G.rbox(0.14, 0.002, 0.07, 0.001), MAT.reflector, 'Spiegel onder het klepje, met lampje; zit aan de zijde die naar de bestuurder kijkt als de klep omlaag staat.', { p: [0, 0.0065, 0], ex: [0, 0.06, 0] }),
    intPart('Zonneklepas', xf(G.cyl('x', 0.005, 0.005, 0.32, 8), [0, 0.0, 0.081]), MAT.steel, 'Draaias langs de dakrand.', { ex: [0, 0.04, 0.05] }),
  ]); };
  const mat = (s, n) => intPart(`Vloermat ${n}`, G.rbox(0.4, 0.012, 0.5, 0.005), MAT.rubber, 'Losse vloermat voor de voetruimte.', { p: [s * 0.37, 0.256, 0.55], ex: [0, 0.1, 0.1] });
  // instaplijst bij elke portieropening (z0..z1): een vlakke loopplaat over de bovenkant van de dorpel tot net binnen de lakdorpel, met
  // een lichte sierstrip erop, en aan de binnenzijde een opstaande rand over de rand van de vloerbedekking. Zo leest de onderrand van een
  // open portieropening als afgewerkte instap: lakdorpel, zwarte loopplaat met lichte strip, opstaande rand, vloer.
  // yT = bovenkant van de loopplaat: voor bijna gelijk met de lakdorpel (y 0,302); het rubber van het dichte achterportier begint al op
  // y 0,302 (voor de portierrand pas op 0,309), daarom ligt de plaat achter lager. De opstaande rand (x 0,762 tot 0,778) blijft binnen de
  // onderrand van het dichte portier (vanaf x 0,782) en onder het luidsprekerrooster (vanaf y 0,34) en loopt alleen langs de opening, tot
  // voor de B-stijlvoet (z -0,038 tot -0,281). De sierstrip houdt 2,8 cm afstand tot de buitenrand, zodat hij bij een dicht portier niet
  // door de naad boven de dorpel te zien is; daar blijft de naad donker.
  const sillXI = 0.762, sillXU = 0.778, sillYB = 0.2515;
  const sill = (s, z0, z1, n, yT, yU, u0, u1) => { const zc = (z0 + z1) / 2, len = z1 - z0, xo = surfX(zc, 0.29) - 0.007, xm = (sillXU + xo) / 2, w = xo - sillXU, nm = `${n} ${sideName(s)}`;
    const ux = (sillXI + sillXU) / 2 - xm, uc = (u0 + u1) / 2 - zc;
    return [
      intPart(`Instaplijst ${nm}`, merge([xf(G.rbox(w, 0.01, len, 0.003), [0, -0.005, 0]), xf(G.rbox(sillXU - sillXI, yU - sillYB, u1 - u0, 0.004), [s * ux, (sillYB + yU) / 2 - yT, uc])]), MAT.plastic, 'Zwarte kunststof instaplijst over de bovenkant van de dorpel, met aan de binnenzijde een opstaande rand over de rand van de vloerbedekking (vorm en maten geschat).', { p: [s * xm, yT, zc], ex: [s * 0.1, 0.05, 0] }),
      intPart(`Sierstrip instaplijst ${nm}`, G.rbox(w - 0.04, 0.003, len - 0.04, 0.0012), MAT.intSill, 'Lichte sierstrip in aluminiumlook op de loopplaat van de instaplijst (uitvoering geschat).', { p: [s * (xm - 0.008), yT + 0.0012, zc], ex: [s * 0.1, 0.08, 0] }),
    ]; };
  const curtain = s => { const pts = []; for (let i = 0; i <= 12; i++) { const z = 0.2 - 1.35 * i / 12, p = ghPt(z, 0.235); pts.push([s * Math.abs(p[0]) * 0.958, p[1] - 0.022, z]); } return intPart(`Gordijnairbag ${sideName(s)}`, tube(pts, 0.007, 36, 6), MAT.fabric, 'Opgerolde gordijnairbag langs de dakrand, tegen de dakrail boven de rand van de hemel, van de A-stijl tot waar de hemel ophoudt; beschermt hoofd en schouders bij een zijdelingse botsing.', { ex: [s * 0.1, 0.1, 0] }); };
  // A-stijlbekleding: een smalle bekleding in de kleur van de hemel langs de A-stijl, over de afvoerslang van het dak heen (de slang volgt hetzelfde verloop)
  const pillarCover = s => {
    const pil = (z, q, dy) => { const h = bodGhHalf(z, q); return [s * (h[0] - 0.036), h[1] - 0.028 + dy, z]; };
    const first = panP(0.205, s * 0.535, -0.032), second = panP(0.27, s * 0.585, -0.03); first[0] -= s * 0.006; second[0] -= s * 0.01;
    return intPart(`A-stijlbekleding ${sideName(s)}`, tube([first, second, pil(0.4, 0.68, 0), pil(0.62, 0.66, -0.04), pil(0.85, 0.65, -0.12)], 0.014, 40, 6), MAT.fabric, 'Smalle bekleding van de A-stijl in de kleur van de hemel; verbergt de afvoerslang van het dak langs de stijl (verloop geschat).', { ex: [s * 0.12, -0.05, 0] });
  };
  // hemel van het panoramadak: twee openingen (voorste glas z 0,22 tot -0,50, achterste glas z -0,58 tot -1,11, glas tot |x| 0,47);
  // de hemel laat 2 cm rondom het glas vrij, de afwerkring is een beige wulst op de rand van elke opening
  const linP = (z, w) => { const p = ghPt(z, w); return [p[0] * 0.965, p[1] - intHemD, p[2]]; };
  const wAtX = (z, ax) => { let lo = 0.3, hi = 0.5; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (0.965 * Math.abs(ghPt(z, m)[0]) > ax) lo = m; else hi = m; } return (lo + hi) / 2; };
  const hole = { hx: 0.45, front: [0.2, -0.48], rear: [-0.6, -1.09] };
  const liningGeo = (() => {
    const full = (z0, z1, n) => patch(linP, z0, z1, n, () => [0.24, 0.76], 12), list = [full(0.4, 0.2, 4), full(-0.48, -0.6, 2), full(-1.17, -1.09, 4)];
    for (const [zA, zB] of [hole.front, hole.rear]) {
      const n = Math.ceil((zA - zB) / 0.05);
      list.push(patch(linP, zB, zA, n, z => [0.24, wAtX(z, hole.hx)], 8), patch(linP, zB, zA, n, z => [1 - wAtX(z, hole.hx), 0.76], 8));
    }
    return merge(list);
  })();
  // de afwerkring ligt onder de schermbaan (de zonneschermen lopen 1,0 tot 2,9 cm onder het dakvlak): hart 3,8 cm, straal 0,8 cm, bovenkant op 3,0 cm
  const ringP = (z, w) => { const p = linP(z, w); return [p[0], p[1] - 0.004, p[2]]; };
  const ringGeo = (() => {
    const list = [];
    for (const [zA, zB] of [hole.front, hole.rear]) {
      const pts = [], n = Math.ceil((zA - zB) / 0.04), m = 14;
      for (let i = 0; i < n; i++) { const z = zA + (zB - zA) * i / n; pts.push(ringP(z, wAtX(z, hole.hx))); }
      const wb = wAtX(zB, hole.hx);
      for (let j = 0; j < m; j++) pts.push(ringP(zB, wb + (1 - 2 * wb) * j / m));
      for (let i = 0; i < n; i++) { const z = zB + (zA - zB) * i / n; pts.push(ringP(z, 1 - wAtX(z, hole.hx))); }
      const wa = wAtX(zA, hole.hx);
      for (let j = 0; j < m; j++) pts.push(ringP(zA, 1 - wa - (1 - 2 * wa) * j / m));
      list.push(tube(pts, 0.008, 2 * (n + m), 5, true));
    }
    return merge(list);
  })();
  // achterrand van de hemel bij de klepscharnieren (z -1,17): een afwerkprofiel dat de snijrand van de hemel bedekt
  const edgeGeo = (() => { const pts = [], m = 24; for (let j = 0; j <= m; j++) { const p = linP(-1.17, 0.24 + 0.52 * j / m); pts.push([p[0], p[1] - 0.004, p[2] + 0.006]); } return tube(pts, 0.008, 2 * m, 6); })();
  // hemelconsole onder de voorrand bij de binnenspiegel: plafonnier en de bediening van het dak
  const roofTilt = z => -(intRoofY(z + 0.05, 0) - intRoofY(z - 0.05, 0)) / 0.1;
  const lampZ = 0.355, consZ = 0.265;
  const roofCons = A('Hemelconsole dak', { d: 'Bediening van het panoramadak in de hemel onder de binnenspiegel: draaiknop met de standen 0 (dicht), A (kantelen), B, C en D (schuiven) en een drukknop voor het noodsluiten. Het uiterlijk van de knop is schematisch.', p: [0.035, intRoofY(consZ, 0.035) - 0.012, consZ], r: [roofTilt(consZ), 0, 0], ex: [0, 0.16, 0] }, [
    intPart('Consolehuis dak', G.rbox(0.14, 0.012, 0.06, 0.005), MAT.fabric, 'Hemelconsole in de kleur van de hemel met de bediening van het dak.', { ex: [0, 0.03, 0] }),
    intPart('Draaiknop dakraam', merge([xf(G.cyl('y', 0.012, 0.012, 0.01, 20), [0.03, -0.009, 0]), xf(G.box(0.003, 0.004, 0.012), [0.03, -0.016, 0.005])]), MAT.plasticGrey, 'Draaiknop met de standen 0, A, B, C en D (kantelen en schuiven van het voorste glas).', { ex: [0, -0.06, 0] }),
    intPart('Standmarkeringen dakraam', merge([-0.9, -0.45, 0, 0.45, 0.9].map(a => xf(G.box(0.003, 0.0015, 0.007), [0.03 + Math.sin(a) * 0.022, -0.0068, -Math.cos(a) * 0.022], [0, a, 0]))), MAT.plastic, 'Vijf streepjes bij de stand 0, A, B, C en D.', { ex: [0, -0.03, 0] }),
    intPart('Noodsluitknop dakraam', xf(G.cyl('y', 0.006, 0.006, 0.008, 14), [-0.03, -0.007, 0]), MAT.plastic, 'Drukknop waarmee het dak in noodgeval wordt gesloten (antiklem dan uit).', { ex: [0, -0.06, 0] }),
  ]);
  const stijl = A('Stijlbekleding', { d: 'Bekleding van de B- en C-stijlen: de B-stijl in twee delen (onder over de oprolautomaat, boven met de uitsparing voor de hoogteversteller van de gordel) en de C-stijl boven de zijbekleding van de bagageruimte. De A-stijlbekleding hoort bij de dakbekleding.', ex: [0, 0.12, 0] }, [
    ...[1, -1].map(s => intPart(`B-stijlbekleding boven ${sideName(s)}`, intBPillar(s, true), MAT.fabric, 'Bovenste bekleding van de B-stijl in de kleur van de hemel, van de gordellijn tot onder de gordijnairbag. In de achterrand zit een uitsparing waarin de hoogteversteller met de gordelgeleider loopt (vorm en maten geschat).', { ex: [s * 0.14, 0.05, 0] })),
    ...[1, -1].map(s => intPart(`B-stijlbekleding onder ${sideName(s)}`, intBPillar(s, false), MAT.dash, 'Onderste bekleding van de B-stijl in donker kunststof, van de dorpel tot de gordellijn; erachter zit de oprolautomaat van de voorgordel (vorm en maten geschat).', { ex: [s * 0.14, -0.05, 0] })),
    ...[1, -1].map(s => intPart(`C-stijlbekleding ${sideName(s)}`, intCPillar(s), MAT.fabric, 'Bekleding van de C-stijl in de kleur van de hemel, tussen de kwartsruit en de opening van de achterklep, boven de zijbekleding van de bagageruimte. Onderaan een smalle richel naast de scharnierpen van de hoedenplank (vorm en maten geschat).', { ex: [s * 0.14, 0.06, -0.06] })),
  ]);
  return A('Bekleding', { d: 'Hemel met zonkleppen, grepen en plafonniers, stijlbekleding, vloerbedekking met matten, dorpellijsten en de bekleding van de bagageruimte met de luidsprekers van de achterplank en de versterker.', ex: [0, 0.4, 0] }, [
    A('Dakbekleding', { d: 'Hemel met de openingen van het panoramadak, zonkleppen, handgrepen, plafonniers en de opgerolde gordijnairbags.', ex: [0, 0.3, 0] }, [
    intPart('Hemelbekleding panoramadak', liningGeo, MAT.fabric, 'Lichtbeige hemelbekleding met twee openingen voor het voorste en het achterste glas van het panoramadak (maten geschat, glas tot 0,47 m van de hartlijn).', { ex: [0, 0.48, 0] }),
    intPart('Afwerkring panoramadak', ringGeo, MAT.fabric, 'Afwerkring in de kleur van de hemel rond beide dakopeningen.', { ex: [0, 0.34, 0] }),
    intPart('Hemelrand achter', edgeGeo, MAT.fabric, 'Afwerkprofiel langs de achterrand van de hemel, bij de scharnieren van de achterklep; achter deze rand heeft de klep zijn eigen binnenbekleding.', { ex: [0, 0.3, -0.2] }),
    roofCons,
    visor(1), visor(-1),
    handle(1, 0.0, 'voor'), handle(-1, 0.0, 'voor'), handle(1, -0.9, 'achter'), handle(-1, -0.9, 'achter'),
    A('Plafonnier voor', { d: 'Plafonnier met twee leeslampjes voor de voorpassagiers, onder de voorrand van het dak bij de binnenspiegel.', p: [0, intRoofY(lampZ, 0) - 0.016, lampZ], r: [roofTilt(lampZ), 0, 0], ex: [0, 0.2, 0] }, [
      intPart('Lamphuis voor', G.rbox(0.3, 0.02, 0.08, 0.008), MAT.plasticGrey, 'Behuizing van het plafonnier.', { ex: [0, 0.04, 0] }),
      ...[1, -1].map(s => intPart(`Leeslampje ${sideName(s)}`, G.cyl('y', 0.025, 0.025, 0.004, 16), MAT.lensClear, 'Leeslampje met lens boven de voorstoel aan deze kant.', { p: [s * 0.1, -0.011, 0], ex: [0, -0.06, 0] })),
    ]),
    intPart('Plafonnier achter', G.rbox(0.12, 0.016, 0.045, 0.006), MAT.plasticGrey, 'Middenlamp achter met lens, tussen het achterste glas en de achterrand van de hemel.', { p: [0, intRoofY(-1.133, 0) - 0.016, -1.133], r: [roofTilt(-1.133), 0, 0], ex: [0, 0.2, 0] }),
    curtain(1), curtain(-1),
    pillarCover(1), pillarCover(-1),
    ]),
    stijl,
    A('Vloerbekleding', { d: 'Vloerbedekking met losse matten en de dorpellijsten.', ex: [0, -0.1, 0] }, [
    intPart('Vloerbedekking', carpet, MAT.carpet, 'Getufte vloerbedekking als dunne laag op de vloer en over de tunnel; de uitlaat in de tunnel blijft eronder vrij.', { ex: [0, -0.22, 0] }),
    mat(1, 'bestuurder'), mat(-1, 'passagier'),
    ...[1, -1].flatMap(s => sill(s, -0.27, 0.83, 'voor', 0.3, 0.33, -0.03, 0.78)), ...[1, -1].flatMap(s => sill(s, -0.8, -0.29, 'achter', 0.294, 0.326, -0.78, -0.29)),
    ]),
    A('Bagageruimte', { d: 'Bekleding van de bagageruimte met hoedenplank, vloerplaat, zijbekleding over de wielkasten, de luidsprekers van de achterplank en de versterker.', ex: [0, 0.0, -0.3] }, [
    intUit(intPart('Hoedenplank', intPlankGeo(), MAT.carpet, 'Afdekplaat achter de achterbank boven de bagageruimte; hangt met koordjes aan de achterklep en komt mee omhoog als die opent (geschat 52 graden), met twee scharnierpennen in de zijbekleding aan de voorrand, die in een kleine sparing in de voorhoeken van de plank liggen, en een uitsparing voor de middelste gordelrolautomaat.', Object.assign({ p: [0, 1.0, -1.85], ex: [0, 0.3, -0.2] }, intPlankOpen()))),
    ...[1, -1].map(s => intPart(`Plankscharnierpen ${sideName(s)}`, merge([xf(G.cyl('x', 0.011, 0.011, 0.09, 12), [0, 0, 0]), xf(G.rbox(0.014, 0.08, 0.09, 0.004), [s * 0.04, 0, 0.0]), xf(G.cyl('x', 0.017, 0.017, 0.008, 14), [-s * 0.045, 0, 0])]), MAT.steel, 'Scharnierpen van de hoedenplank in de zijbekleding bij de voorhoek: de plank draait om deze twee pennen omhoog als de achterklep opent.', { p: [s * 0.655, 1.0, -1.575], ex: [s * 0.14, 0, 0] })).map(intUit),
    ...intPlankCords().map(intUit),
    ...[1, -1].map(s => intPart(`Achterplankluidspreker ${sideName(s)}`, merge([xf(G.cyl('y', 0.065, 0.065, 0.008, 24), [0, 0, 0]), xf(G.cyl('y', 0.04, 0.025, 0.02, 20), [0, -0.012, 0])]), MAT.darkSteel, 'Luidspreker in de achterplank (Bose, positie geschat).', Object.assign({ p: [s * 0.45, 1.01, -1.7], ex: [s * 0.1, 0.2, 0] }, intPlankOpen()))).map(intUit),
    intPart('Bagageruimtevloer', intBootPlate(), MAT.carpet, 'Vloerplaat van de bagageruimte (450 tot 1377 liter), tussen de achterwielkasten en naast de veerkokers smaller. Het tapijtdeel klapt om de voorrand omhoog (geschat 62 graden, de achterklep opent eerst) en laat het opbergvak eronder zien.', { p: [0, 0.46, -1.8275], ex: [0, -0.12, -0.3],
      open: hinge([0, 0.46, -1.485], [1, 0, 0], 1.08, Object.assign({ min: 0.87, label: 'Bagageruimtevloer', look: { dir: [0.8, 0.5, -0.45], nodes: ['Bagageruimtevloer', 'Opbergbak bagageruimte', 'Renault Laguna III/Carrosserie/Achterklep/Klepafdichting'] } }, intTailgateNeed())) }),
    intPart('Bagagevloer onderzijde', intBootPlate(0.004, 0.006), MAT.intBoard, 'Lichte hardboardplaat onder het tapijt van de klapbare bagagevloer; zichtbaar als de vloer omhoog staat. Hij klapt mee met de vloer.', { p: [0, 0.4505, -1.8275], ex: [0, -0.12, -0.3],
      open: follow('Bagageruimtevloer', [0, 0.46, -1.485], [1, 0, 0], 1.08) }),
    intPart('Laadvloer voorstuk', (() => { const hx = 0.505, hz = 0.141, g = roundPlate([[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]], 0.015, 0.005); g.rotateX(HALF); return g; })(), MAT.carpet, 'Vast stuk vloerbekleding tussen de klapbare bagagevloer en de zitting van de achterbank (z -1,48 tot -1,20), op dezelfde hoogte als de bagagevloer. Het dekt de bak in de vloerplaat af, zodat bij neergeklapte rugleuningen een doorlopende laadvloer ontstaat.', { p: [0, 0.46, -1.341], ex: [0, -0.1, -0.1] }),
    intPart('Opbergbak bagageruimte', (() => { const x = 0.4, z0 = -2.18, z1 = -1.62, y0 = 0.409, y1 = 0.448, t = 0.01, hh = y1 - y0, yc = (y0 + y1) / 2, zc = (z0 + z1) / 2, bx = intBox;
      return merge([bx(2 * x, 0.006, z1 - z0, [0, y0 + 0.003, zc]), bx(t, hh, z1 - z0, [x - t / 2, yc, zc]), bx(t, hh, z1 - z0, [-x + t / 2, yc, zc]),
        bx(2 * x, hh, t, [0, yc, z0 + t / 2]), bx(2 * x, hh, t, [0, yc, z1 - t / 2]), bx(0.008, hh - 0.004, z1 - z0 - 2 * t, [0.14, yc + 0.002, zc]), bx(0.008, hh - 0.004, z1 - z0 - 2 * t, [-0.14, yc + 0.002, zc]),
        bx(0.28 - 0.008, hh - 0.004, 0.008, [0, yc + 0.002, zc + 0.05])]); })(), MAT.intTray, 'Opbergbak onder de bagagevloer voor gereedschap, bandenreparatieset en de gevarendriehoek: open bak met vakken (schematisch; de Initiale heeft geen reservewiel).', { ex: [0, -0.1, -0.2] }),
    ...[1, -1].map(s => intPart(`Zijbekleding bagageruimte ${sideName(s)}`, intLining(s), MAT.intFelt, 'Beklede zijwand van de bagageruimte in donker vilt, uit één stuk. Hij dekt de veerkoker, de achterwielkast, de vulpijp en het leidingwerk erachter af: een binnenwand over veerkoker en wielkast, een verhoging voor de vulpijp en een schouder die zonder trede in de zijwand overgaat tot de hoogte van de hoedenplank. Vooraan sluit hij de ruimte naast de rugleuning af; de klapbare vloer en de rugleuningen bewegen eraan voorbij (vorm en maten geschat).', { ex: [s * 0.12, 0, -0.04] })),
    intPart('Versterker Bose', G.rbox(0.28, 0.06, 0.2, 0.01), MAT.ecu, 'Digitale versterker met zes kanalen van het Bose-systeem, links achter in een opbergvak (plaats aannemelijk).', { p: [0.46, 0.4975, -2.0], ex: [0.1, 0.12, -0.1] }),    ])
  ]);
}
function intPedals() {
  const bx = intBx;
  return A('Pedalen', { d: 'Rem- en gaspedaal met rubber treden en een rubber voetsteun; een automaat heeft geen koppelingspedaal.', ex: [0.12, -0.1, 0.38] }, [
    intPart('Pedaalbok', bx(0.18, 0.2, 0.1, 0.01, [0.33, 0.72, 0.86]), MAT.darkSteel, 'Steun waarin de pedalen scharnieren.', { ex: [0, 0.1, 0.08] }),
    intPart('Rempedaalarm', rodBetween([0.4, 0.72, 0.86], [0.4, 0.42, 0.74], 0.01), MAT.steel, 'Pedaalarm die de rembekrachtiger bedient.', { ex: [0.04, 0, 0.04] }),
    intPart('Rempedaalpad', bx(0.13, 0.065, 0.012, 0.005, [0.4, 0.4, 0.73], [-0.35, 0, 0]), MAT.rubber, 'Breed rempedaalrubber, typisch voor een automaat.', { ex: [0.04, 0, -0.06] }),
    intPart('Gaspedaalarm', rodBetween([0.23, 0.7, 0.86], [0.23, 0.4, 0.78], 0.006), MAT.steel, 'Arm van het elektronische gaspedaal.', { ex: [-0.04, 0, 0.04] }),
    intPart('Gaspedaalpad', bx(0.06, 0.15, 0.012, 0.005, [0.23, 0.36, 0.77], [-0.4, 0, 0]), MAT.rubber, 'Rubber trede van het gaspedaal waarop de rechtervoet rust.', { ex: [-0.06, 0, -0.06] }),
    intPart('Gaspedaalsensor', bx(0.04, 0.04, 0.03, 0.006, [0.23, 0.7, 0.8]), MAT.ecu, 'Stand-opnemer van het elektronische gaspedaal (drive-by-wire).', { ex: [-0.06, 0.04, 0] }),
    intPart('Remlichtschakelaar', xf(G.cyl('z', 0.012, 0.012, 0.04, 10), [0.4, 0.78, 0.8]), MAT.plasticGrey, 'Schakelaar die de remlichten inschakelt.', { ex: [0.05, 0.06, 0] }),
    intPart('Voetsteun', bx(0.07, 0.17, 0.02, 0.006, [0.58, 0.33, 0.76], [-0.6, 0, 0]), MAT.rubber, 'Rubber steun voor de linkervoet (Initiale: rubber pedalen, geen aluminium).', { ex: [0.08, 0, -0.04] }),
  ]);
}
function intMirror() {
  const zc = 0.46, yg = YR(zc) - 0.012, tiltAt = z => Math.atan((YR(z - 0.05) - YR(z + 0.05)) / 0.1), tilt = tiltAt(zc), hy = yg - 0.062, hz = zc - 0.026;
  const zs = zc + 0.075, ys = YR(zs) - 0.015;   // sensorhuis voor de spiegelvoet, 3 mm onder het glas
  // afgeronde trapeziumvorm (onder breder dan boven) in het vlak van het glas; k punten per hoek
  const outline = (wb, wt, h, rb, rt, k) => { const P = [];
    for (const [cx, cy, r, a0] of [[wb / 2 - rb, -h / 2 + rb, rb, -HALF], [wt / 2 - rt, h / 2 - rt, rt, 0], [-wt / 2 + rt, h / 2 - rt, rt, HALF], [-wb / 2 + rb, -h / 2 + rb, rb, PI]])
      for (let i = 0; i <= k; i++) { const a = a0 + HALF * i / k; P.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return P; };
  const face = { p: [0, hy, hz], r: [-0.1, -0.25, 0] };   // iets naar de bestuurder en omlaag gedraaid
  return A('Binnenspiegel', { d: 'Automatisch dimmende binnenspiegel met afgeronde vorm aan een korte voet op de voorruit; ervoor zit het huis van de regen- en lichtsensor (de sensor zelf hoort bij de carrosserie, achter de voorruit).', ex: [0, 0.32, 0.2] }, [
    intPart('Spiegelvoet binnen', G.rbox(0.04, 0.012, 0.05, 0.004), MAT.plastic, 'Voet die op de voorruit is gelijmd.', { p: [0, yg + 0.005, zc], r: [tilt, 0, 0], ex: [0, 0.06, 0.04] }),
    intPart('Sensorhuis', G.rbox(0.07, 0.024, 0.075, 0.01), MAT.plastic, 'Kunststof kap op de voorruit over de regen- en lichtsensor, voor de spiegelvoet.', { p: [0, ys, zs], r: [tiltAt(zs), 0, 0], ex: [0, 0.08, 0.06] }),
    intPart('Spiegelarm', rodBetween([0, yg - 0.004, zc], [0, hy + 0.024, hz], 0.0065, 10), MAT.plastic, 'Korte arm met kogelgewricht tussen voet en spiegelhuis.', { ex: [0, 0.04, 0] }),
    intPart('Spiegelhuis binnen', cache('intMirrorBody', () => { const b = 0.008, g = new THREE.ExtrudeGeometry(shapeOf(outline(0.25 - 2 * b, 0.22 - 2 * b, 0.066 - 2 * b, 0.016, 0.006, 4)), { depth: 0.03 - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 1 }); g.translate(0, 0, -(0.03 - 2 * b) / 2); return g; }), MAT.plastic, 'Afgeronde behuizing van de binnenspiegel, onder breder dan boven.', Object.assign({ ex: [0, -0.03, 0] }, face)),
    intPart('Spiegelglas binnen', cache('intMirrorGlass', () => xf(front(shapeOf(outline(0.236, 0.206, 0.054, 0.018, 0.01, 3)), 0.002), [0, 0, -0.0162])), MAT.reflector, 'Elektrochroom spiegelglas dat automatisch dimt.', Object.assign({ ex: [0, 0, -0.08] }, face)),
  ]);
}
// vloerplaat van de bagageruimte (wereld z -2,17 tot -1,485): achter z -1,80 tot |x| 0,6, daarvoor smaller (0,425) langs de veerkoker en
// de wielkast, zodat de zijbekleding daar één doorlopende binnenwand op |x| 0,429 kan hebben; de verhoging voor de vulpijp hangt erboven
function intBootPlate(t = 0.015, k = 0) {
  const zc = -1.8275, hd = 0.3425 - k, v1 = -1.80 - zc, w0 = 0.6 - k, w2 = 0.425 - k, g = roundPlate([[-w0, -hd], [w0, -hd], [w0, v1], [w2, v1], [w2, hd], [-w2, hd], [-w2, v1], [-w0, v1]], t, Math.min(0.005, t / 2 - 0.0008), 0.006);
  g.rotateX(HALF); return g;
}
// gesloten loft door doorsneden: secs is een lijst lussen van punten [x, y, z], alle even lang en in dezelfde volgorde; de eerste en de
// laatste lus krijgen een dop. Driehoeken zonder oppervlak vallen in de mantel weg; de normalen zijn glad met een knik boven 30 graden (zoals roundPlate)
// en wijzen naar buiten (teken van het ingesloten volume).
function intLoft(secs) {
  const n = secs[0].length, m = secs.length, pos = [], idx = [], P = (i, j) => secs[i][j];
  secs.forEach(L => L.forEach(p => pos.push(p[0], p[1], p[2])));
  const area2 = (a, b, c) => { const A = pos.slice(3 * a, 3 * a + 3), B = pos.slice(3 * b, 3 * b + 3), C = pos.slice(3 * c, 3 * c + 3);
    const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    return Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]); };
  const tri = (a, b, c, keep) => { if (keep || area2(a, b, c) > 1e-10) idx.push(a, b, c); };
  for (let i = 0; i < m - 1; i++) for (let j = 0; j < n; j++) {
    const a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + (j + 1) % n, d = (i + 1) * n + j;
    tri(a, b, c); tri(a, c, d);
  }
  // dop: lus geprojecteerd op het vlak loodrecht op zijn Newell-normaal; de eerste dop loopt tegen de lus in, de laatste met de lus mee
  const cap = (i, withLoop) => {
    const L = secs[i]; let nx = 0, ny = 0, nz = 0;
    for (let j = 0; j < n; j++) { const p = P(i, j), q = P(i, (j + 1) % n); nx += (p[1] - q[1]) * (p[2] + q[2]); ny += (p[2] - q[2]) * (p[0] + q[0]); nz += (p[0] - q[0]) * (p[1] + q[1]); }
    const N = V3(nx, ny, nz).normalize(), U = Math.abs(N.x) < 0.9 ? V3(1, 0, 0) : V3(0, 1, 0);
    U.sub(N.clone().multiplyScalar(U.dot(N))).normalize(); const W = N.clone().cross(U);
    const pts = L.map(p => new THREE.Vector2(U.x * p[0] + U.y * p[1] + U.z * p[2], W.x * p[0] + W.y * p[1] + W.z * p[2]));
    const loopSign = Math.sign(THREE.ShapeUtils.area(pts)) || 1;
    THREE.ShapeUtils.triangulateShape(pts, []).forEach(([a, b, c]) => {
      const s2 = Math.sign((pts[b].x - pts[a].x) * (pts[c].y - pts[a].y) - (pts[b].y - pts[a].y) * (pts[c].x - pts[a].x));
      // ook driehoeken zonder oppervlak (drie punten op een lijn) blijven staan, anders heeft de dop open randen
      if ((s2 === loopSign) === withLoop) tri(i * n + a, i * n + b, i * n + c, true); else tri(i * n + a, i * n + c, i * n + b, true);
    });
  };
  cap(0, false); cap(m - 1, true);
  // ingesloten volume (divergentiestelling); negatief: alle driehoeken omdraaien
  let vol = 0;
  for (let k = 0; k < idx.length; k += 3) { const a = idx[k] * 3, b = idx[k + 1] * 3, c = idx[k + 2] * 3;
    vol += pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c]) + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]); }
  if (vol < 0) for (let k = 0; k < idx.length; k += 3) { const t = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = t; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  return creasedWeld(g, 0.52);
}
// kubische Bézier van a naar b met controlepunten c1 en c2 (in het vlak), k punten strikt tussen a en b
const intBez = (a, c1, c2, b, k) => Array.from({ length: k }, (_, i) => { const t = (i + 1) / (k + 1), u = 1 - t;
  return [u * u * u * a[0] + 3 * t * u * u * c1[0] + 3 * t * t * u * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * t * u * u * c1[1] + 3 * t * t * u * c2[1] + t * t * t * b[1]]; });
// Zijbekleding van de bagageruimte (donker vilt) als één doorlopend profiel: een loft van doorsneden in z, van de rugleuning tot de
// achterkant. Per doorsnede (van binnen onder rond naar buiten): de binnenwand op |x| 0,429 over veerkoker en wielkast (de vloer is daar
// 0,425 breed), de verhoging voor de vulpijp op |x| 0,37 met een schuine onderkant, een S-vormige schouder die zonder trede in de
// zijwand (|x| 0,615) overgaat, de zijwand tot de hoedenplank (y 0,98) en aan de buitenkant een uitsparing boven de wielkuip.
// Klapbare vloer: scharnier y 0,46, z -1,485, 62 graden, plaat 15 mm. De bovenkant van de plaat haalt in de eindstand y 0,476 + 1,88 dz
// (dz achter het scharnier); de verhoging blijft daar 14 mm boven (intLinU). Het brede deel van de vloer (|x| tot 0,6, vanaf z -1,80,
// straal 0,315 tot het scharnier) zwaait door de hoek bij de wielkast: daar blijft de bovenkant van de wielkastbult binnen straal 0,305.
// Vooraan volgt de voorrand de schuine achterkant van de rugleuning (8 mm ervoor), en een dop sluit de holte tussen zijwand en
// achterscherm naast de rugleuning af.
const intLinB = 0.469;
const intLinU = z => z > -1.475 ? 0.472 : z > -1.485 ? lerp(0.472, 0.49, (-1.475 - z) / 0.01) : 0.49 + 1.88 * (-1.485 - z);
const intLinCirc = z => { const d = Math.max(0, -1.485 - z); return d >= 0.305 ? 0.46 : 0.46 + Math.sqrt(0.305 * 0.305 - d * d); };
const intKuipY = z => 0.33 + Math.sqrt(Math.max(0, 0.405 * 0.405 - (z + 1.391) * (z + 1.391)));   // bovenkant wielkuip (carrosserie)
const intSeatBackZ = y => -1.267 - (y - 0.472) * 0.255;   // achterkant van de rechtopstaande rugleuning achter op hoogte y
// maten bij de veerkoker achter, afgeleid van REAR_SPR (body.js): de binnenwand van de bekleding ligt 3 mm binnen de koker en is
// 2,5 mm dik (buitenkant 0,5 mm binnen de koker); de uitsparing eronder komt 10 mm boven de koker en loopt tot 5 mm achter de koker
const intKokerX = REAR_SPR.sprX - 0.003, intKokerXo = intKokerX + 0.0025, intKokerY = REAR_SPR.sprY[1] + 0.010, intKokerZ = REAR_SPR.sprZ[0] - 0.005;
function intLining(s) {
  const yb = intLinB, yT = 0.98, xo = 0.635, xw = 0.615, xP = 0.37, podTop = 0.78, podWall = 0.84, zPod = -1.616;
  const sec = z => {
    // achter zPod trekt de verhoging terug naar de binnenwand; de schouder loopt nog 1 cm door tot de vulpijp in de zijwand verdwijnt
    // (het brede deel van de vloer komt hier nog niet boven de wielkastbult), daarna begint de wielkastbult
    const wallOnly = z <= -1.79, hump = z < zPod - 0.012, xL = wallOnly ? 0.605 : intKokerX, xK = wallOnly ? 0.625 : 0.50;
    const yk = wallOnly ? yb + 0.006 : Math.max(yb + 0.006, intKuipY(z) + 0.008);
    let pts;
    if (!hump) {
      // verhoging voor de vulpijp: binnenwand tot de schuine onderkant, verhoging op |x| 0,37, S-schouder naar de zijwand
      const y1 = Math.max(yb + 0.004, intLinU(z)), xa = z < zPod - 0.001 ? xL + 0.002 : xP;
      pts = [[xL, yb], [xL, y1], [xa, y1], [xa, podTop], ...intBez([xa, podTop], [xa, podTop + 0.027], [xw, podWall - 0.027], [xw, podWall], 6), [xw, podWall],
        [xw, podWall + 0.01], [xw, podWall + 0.02], [xw, podWall + 0.03], [xw, podWall + 0.04]];
    } else {
      // wielkastbult: bovenkant ruim boven de wielkuip, binnen straal 0,305 van het vloerscharnier; afgeronde rand en holle overgang in de zijwand
      const y1 = wallOnly ? yb + 0.012 : Math.max(yk + 0.012, Math.min(intLinCirc(z) - 0.008, intKuipY(z) + 0.045)), xa = xL + 0.008;
      pts = [[xL, yb], [xL, y1 - 0.006], [xL + 0.003, y1 - 0.001], [xa, y1]];
      pts.push(...intBez([xa, y1], [xa + 0.45 * (xw - xa), y1], [xw, y1 + 0.004], [xw, y1 + 0.03], 6), [xw, y1 + 0.03]);
      // richel net achter de verhoging: de vulpijp loopt hier nog tot 3 cm binnen de zijwand (y 0,78 tot 0,81) voor hij erin verdwijnt;
      // de richel hangt boven het bereik van de vloer (onderkant 2 mm boven intLinU), de wielkastbult eronder blijft binnen straal 0,305
      const ledge = z >= -1.639, yA = intLinU(z) + 0.002;
      pts.push(...(ledge ? [[xw, yA], [0.575, yA + 0.004], [0.575, 0.84], [xw, 0.87]] : [1, 2, 3, 4].map(k => [xw, y1 + 0.03 + 0.01 * k])));
    }
    // buitenkant onder: uitsparing boven de wielkuip en, bij de veerkoker, een tweede uitsparing tot net boven de koker (y 0,572), zodat
    // de veer met schotel en aanslagrubber in de koker vrij blijft; de binnenwand is daar 2,5 mm dik (vilt op de binnenwand van de koker)
    const koker = !wallOnly && z > intKokerZ, xK1 = koker ? intKokerXo : xK - 0.002, yk1 = koker ? intKokerY : yk - 0.003;
    pts.push([xw, yT - 0.008], [xw + 0.002, yT - 0.002], [xw + 0.008, yT], [xo - 0.008, yT], [xo, yT - 0.008], [xo, yk], [xK, yk], [xK, yk1], [xK1, yk1], [xK1, yb]);
    return pts;
  };
  const zs = [-1.36, -1.41, -1.45, -1.475, -1.485, -1.50, -1.53, -1.548, -1.56, -1.59, -1.612, zPod, -1.618, -1.626, -1.630, -1.637, -1.643, -1.67, -1.70, -1.72, -1.74, -1.755, -1.77, -1.78, -1.787, -1.795, -2.085];
  const zFront = y => Math.min(-1.36, intSeatBackZ(y) - 0.008);
  const loops = zs.map((z, i) => sec(z).map(([x, y]) => [s * x, y, i === 0 ? zFront(y) : z]));
  // dop tussen zijwand en achterscherm naast de rugleuning (boven de wielkuip), 12 mm dik, met dezelfde schuine voorkant
  const zc = -1.38, yc0 = intKuipY(zc) + 0.008, ys = [yc0, 0.80, 0.86, 0.92, 0.95, 0.965, yT];
  const capSec = dz => [[0.633, yT], [0.633, yc0], ...ys.map(y => [Math.min(surfX(-1.36, y), surfX(-1.42, y)) - 0.012, y])].map(([x, y]) => [s * x, y, zFront(y) - dz]);
  return merge([intLoft(loops), intLoft([capSec(0), capSec(0.012)])]);
}
// B-stijlbekleding in twee delen, langs de schuine B-stijl (as door y 0,66, z -0,17, 0,21 rad naar achteren; binnenvlak van de stijl
// op |x| 0,71). Het onderste deel loopt van de dorpel tot y 0,925 over de oprolautomaat; het bovenste deel van y 0,93 tot onder de
// gordijnairbag en heeft aan de achterrand een uitsparing waarin de hoogteversteller met de gordelgeleider zit.
const intBzc = y => -0.17 - (y - 0.66) * 0.2132;
function intBPillar(s, upper) {
  const ys = upper ? [0.93, 0.935, 0.94, 0.99, 1.04, 1.07, 1.10, 1.13, 1.145, 1.15, 1.18, 1.21, 1.235, 1.26] : [0.27, 0.33, 0.40, 0.50, 0.60, 0.70, 0.80, 0.88, 0.925];
  const loops = ys.map(y => {
    const zc = intBzc(y), hw = upper ? 0.046 : 0.046 + 0.012 * clamp((0.5 - y) / 0.23, 0, 1), zF = zc + hw;
    const zR = upper && y > 0.937 && y < 1.147 ? -0.258 : zc - hw;
    const xo = Math.min(0.700, surfX(zc, y) - 0.03), xi = xo - 0.016;
    return [[xo, zF], [xi + 0.006, zF - 0.004], [xi, zF - 0.012], [xi, zR + 0.012], [xi + 0.006, zR + 0.004], [xo, zR]].map(([x, z]) => [s * x, y, z]);
  });
  return intLoft(loops);
}
// C-stijlbekleding: paneel langs de binnenkant van de C-stijl boven de zijbekleding, van achter de kwartsruit tot de sponning van de
// achterklep (bovenrand 1 tot 2 cm onder de sponning en onder de kogel van de gasveer), 7 tot 19 mm binnen de huid, met onderaan een
// richel (y 0,985 tot 0,995) naar binnen tot |x| 0,705, net buiten de scharnierpen van de hoedenplank.
const intCTop = z => { const T = [[-1.185, 1.235], [-1.262, 1.235], [-1.30, 1.195], [-1.36, 1.19], [-1.45, 1.18], [-1.55, 1.16], [-1.65, 1.135], [-1.75, 1.11], [-1.85, 1.06], [-1.95, 1.035], [-2.03, 1.0]];
  for (let i = 0; i < T.length - 1; i++) if (z <= T[i][0] && z >= T[i + 1][0]) return lerp(T[i][1], T[i + 1][1], (T[i][0] - z) / (T[i][0] - T[i + 1][0]));
  return z > T[0][0] ? T[0][1] : T[T.length - 1][1]; };
// z van de achterrand van de kwartsruit op hoogte y (bodQtop is de bovenrand van de ruit als functie van z)
const intQuarterZ = y => { let lo = -1.25, hi = -1.14; if (bodQtop(lo) >= y) return lo; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bodQtop(m) >= y) hi = m; else lo = m; } return lo; };
function intCPillar(s) {
  const zs = [-1.258, -1.27, -1.30, -1.33, -1.36, -1.40, -1.45, -1.50, -1.55, -1.60, -1.65, -1.70, -1.75, -1.80, -1.85, -1.90, -1.95, -2.0], m = 7;
  const loops = zs.map((z0, i) => {
    const zAt = y => i === 0 ? clamp(intQuarterZ(y) - 0.008, -1.258, -1.185) : z0;
    const yt = Math.max(1.0, intCTop(i === 0 ? -1.262 : z0)), yo = [], yi = [];
    for (let j = 0; j <= m; j++) yo.push(0.985 + (yt - 0.985) * j / m);
    for (let j = 0; j <= m; j++) yi.push(yt - 0.003 - (yt - 0.003 - 0.995) * j / m);
    const sx = (y, o) => surfX(zAt(y), y) - o, tip = Math.max(0.688, Math.min(0.705, sx(0.995, 0.019) - 0.008));   // richel tot |x| 0,705, achteraan korter
    const pts = [[tip, 0.985], ...yo.map(y => [sx(y, 0.007), y]), ...yi.map(y => [sx(y, 0.019), y]), [tip + 0.004, 0.995], [tip, 0.992]];
    return pts.map(([x, y]) => [s * x, y, zAt(y)]);
  });
  return intLoft(loops);
}
function buildInterior() {
  const seats = A('Stoelen', { d: 'Voorstoelen met verwarming en elektrische verstelling, achterbank met gedeeld neerklapbare rugleuning en de veiligheidsgordels.', ex: [0, 0.26, -0.1] }, [frontSeat(1), frontSeat(-1), intRearBench(), intBelts()]);
  return A('Interieur', { d: 'Initiale-interieur met geperforeerd beige leder, stoelverwarming, Bose-audio (tien luidsprekers, negen weergegeven) en tweezone-klimaatregeling.', ex: [0, 0.66, 0] }, [intDashboard(), intConsole(), seats, intTrim(), intPedals(), intMirror()]);
}

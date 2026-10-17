/* ===================== interieur ===================== */
// Alles wat de carrosserie raakt (hemel, dakgrepen, spiegel, gordelgeleiders) volgt de functies YR, YT, surfX en ghPt van de carrosserie.
std('intFoam', 0x3a3834, 0, 1);
std('intBelt', 0x25272c, 0, 0.9);
std('intTray', 0xb9bdc3, 0, 0.9);   // lichtgrijs schuim van de opbergbak onder de bagagevloer: leest tegen de donkere vloerbekleding
std('intBoard', 0xe2ded4, 0, 0.9, { emissive: 0x55524b });    // onderzijde van de klapbare bagagevloer: lichte plaat, zodat de omhoog geklapte vloer leest tegen de donkere bekleding
std('intFelt', 0x3a3835, 0, 1);       // donker vilt van de bagageruimtebekleding: iets lichter dan de vloerbekleding, zodat vloer en wand te onderscheiden zijn
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
    // rusttand: de band hangt van de bovenste geleider vrijwel recht omlaag, de tong zit onderaan bij het onderste ankerpunt (het slot naast de stoel blijft zoals het was); de knikken liggen zo dat de band in elke stand van de achterste zijruit vrij blijft: x binnen 0,75, tussen y 0,98 en 0,87 net achter de balk van de B-stijl (z 0,5 cm achter de stijl)
    const restPts = [[xg, 1.1, zB + 0.012], [xg - s * 0.005, 0.98, zB - 0.005], [xg + s * 0.01, 0.87, zB - 0.005], [xg + s * 0.02, 0.62, zB + 0.018]], tong = [xg + s * 0.025, 0.585, zB + 0.02];
    const grp = [];
    grp.push(
      intPart(`Gordelrolautomaat voor ${n}`, G.rbox(0.06, 0.1, 0.06, 0.01), MAT.plastic, 'Oprolautomaat met gordelspanner en krachtbegrenzer onderin de B-stijl, achter de stijlbekleding verborgen; de bestuurder heeft een dubbele spanner.', { p: [xr, 0.55, zB], ex: [s * 0.1, 0, 0] }),
      intPart(`Hoogteversteller voor ${n}`, G.rbox(0.03, 0.2, 0.012, 0.004), MAT.plasticGrey, 'Geleiderail op de B-stijl waarmee de bovenste gordelgeleider in hoogte wordt versteld.', { p: [xg, 1.04, zB - 0.02], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider voor ${n}`, G.torus('z', 0.018, 0.004, 16, 6), MAT.steel, 'Geleideoog waar de gordelband doorheen loopt.', { p: [xg, 1.1, zB], ex: [s * 0.1, 0.16, 0] }),
      intPart(`Gordelband voor ${n}`, bandGeo(restPts, 0.046), MAT.intBelt, 'Gordelband in de rusttand van een geparkeerde auto: opgerold, hangt vanuit de bovenste geleider vrijwel recht omlaag, net achter de stijlbalk van de B-stijl, naar het onderste ankerpunt, met de gordeltong onderaan.', { ex: [s * 0.1, 0.1, 0.06] }),
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
    intPart('CD-sleuf', G.box(0.09, 0.006, 0.004), MAT.plastic, 'Sleuf in het radiopaneel waarin de cd wordt geschoven.', { p: [0, 0.01, -0.009], ex: [0, 0, -0.06] }),
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
    intPart('Keuzehendel', merge([xf(G.cyl('y', 0.007, 0.007, 0.07, 10), [0, 0.035, 0]), knob]), MAT.leather, 'Hendel met lederen knop waarmee de stand van de automaat wordt gekozen.', { ex: [0, 0.16, 0] }),
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
  return A('Middenconsole', { d: 'Middenconsole met keuzehendel, joystick van de navigatie, kaartlezer, startknop, parkeerremschakelaar, bekerhouders en armsteun.', ex: [0, 0.12, 0.05] }, [
    intPart('Consolebehuizing', G.rbox(0.24, 0.08, 0.87, 0.03), MAT.dash, 'Kunststof console op de vloertunnel, boven het tapijt.', { p: [0, 0.45, 0.015], ex: [0, -0.06, 0] }),
    intPart('Consoleinzetstuk', G.rbox(0.15, 0.004, 0.52, 0.002), MAT.blackGloss, 'Pianozwart inzetstuk op de console (hoogglans).', { p: [0, 0.491, 0.0], ex: [0, 0.05, 0] }),
    intPart('Consolevoorpaneel', G.rbox(0.24, 0.21, 0.175, 0.03), MAT.dash, 'Voorste deel van de console onder de klimaatbediening, loopt door in het dashboard.', { p: [0, 0.515, 0.5125], ex: [0, 0, 0.1] }),
    sel,
    intPart('Kaartlezer', G.rbox(0.1, 0.03, 0.03, 0.008), MAT.plastic, 'Lezer voor de handsfree Renault-kaart; de exacte plaats is voor dit model niet gevonden (aannemelijk hier).', { p: [0, 0.575, 0.418], ex: [0, 0, -0.1] }),
    intPart('Startknop', G.cyl('z', 0.015, 0.015, 0.012, 20), MAT.chrome, 'Start-/stopknop van de motor.', { p: [0.08, 0.575, 0.413], ex: [0, 0, -0.12] }),
    intPart('Parkeerremschakelaar', G.rbox(0.04, 0.015, 0.05, 0.005), MAT.plastic, 'Schakelaar van de elektrische parkeerrem.', { p: [0.07, 0.496, 0.34], ex: [0.04, 0.1, 0] }),
    A('Joystick navigatie', { d: 'Joystick op de middenconsole waarmee het navigatiescherm van de Carminat wordt bediend.', p: [0, 0.495, 0.03], ex: [0, 0.1, 0] }, [
      intPart('Joystickbasis', G.cyl('y', 0.03, 0.03, 0.008, 20), MAT.satin, 'Ring rond de joystick van de navigatie, vast in de console.', { p: [0, 0.002, 0], ex: [0, 0.02, 0] }),
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
function intPlankGeo() {
  const hw0 = 0.65, hw1 = 0.52, z0 = 0.275, z1 = -0.275, r = 0.05, n = 6, pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * HALF; pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); } };
  // tegen de klok in in (x, z): rechtsachter (x min), linksachter (x plus), linksvoor, rechtsvoor
  arc(-hw1 + r, z1 + r, PI); arc(hw1 - r, z1 + r, PI * 1.5);
  // uitsparing in de voorrand voor de middelste gordelrolautomaat (6 cm breed, x 0,03 en z -1,54 tot -1,62): zonder uitsparing
  // sneed de plank daar door de automaat (B0 29,06 mm bij open klep; de plank draait om een punt in de automaat)
  pts.push([hw0, z0 - 0.004], [hw0 - 0.004, z0], [intPlankNotch.hw, z0], [intPlankNotch.hw, z0 - intPlankNotch.d], [-intPlankNotch.hw, z0 - intPlankNotch.d], [-intPlankNotch.hw, z0], [-hw0 + 0.004, z0], [-hw0, z0 - 0.004]);
  return roundPlate(pts, 0.012, 0.004).rotateX(HALF);
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
  const sill = (s, z, len, n) => intPart(`Instaplijst ${n} ${sideName(s)}`, G.rbox(0.05, 0.01, len, 0.004), MAT.plasticGrey, 'Kunststof dorpellijst bij het instappen.', { p: [s * (surfX(z, 0.26) - 0.05), 0.248, z], ex: [s * 0.1, 0.05, 0] });
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
    sill(1, 0.2, 0.8, 'voor'), sill(-1, 0.2, 0.8, 'voor'), sill(1, -0.78, 0.44, 'achter'), sill(-1, -0.78, 0.44, 'achter'),
    ]),
    A('Bagageruimte', { d: 'Bekleding van de bagageruimte met hoedenplank, vloerplaat, zijbekleding over de wielkasten, de luidsprekers van de achterplank en de versterker.', ex: [0, 0.0, -0.3] }, [
    intUit(intPart('Hoedenplank', intPlankGeo(), MAT.carpet, 'Afdekplaat achter de achterbank boven de bagageruimte; hangt met koordjes aan de achterklep en komt mee omhoog als die opent (geschat 52 graden), met twee scharnierpennen in de zijbekleding aan de voorrand en een uitsparing voor de middelste gordelrolautomaat.', Object.assign({ p: [0, 1.0, -1.85], ex: [0, 0.3, -0.2] }, intPlankOpen()))),
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
  return A('Pedalen', { d: 'Rem- en gaspedaal; een automaat heeft geen koppelingspedaal.', ex: [0.12, -0.1, 0.38] }, [
    intPart('Pedaalbok', bx(0.18, 0.2, 0.1, 0.01, [0.33, 0.72, 0.86]), MAT.darkSteel, 'Steun waarin de pedalen scharnieren.', { ex: [0, 0.1, 0.08] }),
    intPart('Rempedaalarm', rodBetween([0.4, 0.72, 0.86], [0.4, 0.42, 0.74], 0.01), MAT.steel, 'Pedaalarm die de rembekrachtiger bedient.', { ex: [0.04, 0, 0.04] }),
    intPart('Rempedaalpad', bx(0.13, 0.065, 0.012, 0.005, [0.4, 0.4, 0.73], [-0.35, 0, 0]), MAT.rubber, 'Breed rempedaalrubber, typisch voor een automaat.', { ex: [0.04, 0, -0.06] }),
    intPart('Gaspedaalarm', rodBetween([0.23, 0.7, 0.86], [0.23, 0.4, 0.78], 0.006), MAT.steel, 'Arm van het elektronische gaspedaal.', { ex: [-0.04, 0, 0.04] }),
    intPart('Gaspedaalpad', bx(0.06, 0.15, 0.012, 0.005, [0.23, 0.36, 0.77], [-0.4, 0, 0]), MAT.rubber, 'Rubber trede van het gaspedaal waarop de rechtervoet rust.', { ex: [-0.06, 0, -0.06] }),
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

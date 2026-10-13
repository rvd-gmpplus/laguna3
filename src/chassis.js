/* ===================== onderstel: vooras, stuurinrichting, achteras, wielen, remmen ===================== */
// Hoek-assemblages worden voor links gebouwd (x > 0) en voor rechts gespiegeld (schaal x = -1).
// Montagevlak van het wiel (naafzijde van de velg) = wielmidden + inzet ET 47 (7,5J x 18, ET 47: aannemelijk).
// Schijf, naaf, lager en klauw zijn daarop afgestemd; de voorste naaf ligt op x = chsMF (aandrijflijn: aandrijfas eindigt in de naaf).
const chsMF = TRACK_F + 0.047, chsMR = TRACK_R + 0.047;
std('chsCaliper', 0x5c6168, 0.55, 0.5);
std('chsSpring', 0x25272a, 0.55, 0.5);
std('chsRimFace', 0xd3d7dc, 0.92, 0.2, { envMapIntensity: 1.2 });
std('chsRimWell', 0x8f949a, 0.8, 0.4);
const chsSP = V3(0.64, 0.40, AXF), chsSD = V3(-0.2, 0.975, -0.03).normalize();   // veerpoot: fuseeklem en richting
function chsMat(p, r) { return new THREE.Matrix4().compose(V3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), V3(1, 1, 1)); }
const chsPt = (M, p) => V3(...p).applyMatrix4(M).toArray();
const chsNut = (ax, r, h) => G.cyl(ax, r, r, h, 6);
const chsFlip = g => xf(g, [0, 0, 0], [PI, 0, 0]);                     // bout met kop boven, steel omlaag
function chsClamp(ax, R) { return merge([G.torus(ax, R, 0.0018, 20, 4), xf(G.box(0.008, 0.008, 0.008), [R + 0.003, 0, 0])]); }
function chsFlange(r, holes, hr, pcd, t, key) {                          // schijf met gaten (as x)
  return cache('chsFl' + key, () => {
    const s = new THREE.Shape(); s.absarc(0, 0, r, 0, PI * 2, false);
    for (let k = 0; k < holes; k++) s.holes.push(circlePath(pcd * Math.cos(k * PI * 2 / holes), pcd * Math.sin(k * PI * 2 / holes), hr));
    return zTo(extrude(s, t, 20), 'x');
  });
}

function discGeo(rIn, rOut, vented, key, hatH) {
  return cache('disc' + key, () => {
    const top = vented ? 0.013 : 0.0055;
    const parts = [
      G.lathe('y', [[0.034, hatH], [0.073, hatH], [0.073, hatH - 0.006], [0.034, hatH - 0.006], [0.034, hatH]], 40),
      G.lathe('y', [[0.071, hatH - 0.002], [0.075, hatH - 0.002], [rIn + 0.002, top], [rIn - 0.003, top], [0.071, hatH - 0.002]], 40)];
    if (vented) {
      parts.push(G.lathe('y', [[rIn, 0.013], [rOut, 0.013], [rOut, 0.0055], [rIn, 0.0055], [rIn, 0.013]], 56));
      parts.push(G.lathe('y', [[rIn, -0.0055], [rOut, -0.0055], [rOut, -0.013], [rIn, -0.013], [rIn, -0.0055]], 56));
      parts.push(blades(36, rIn, rOut, 0.011, 0.004, 0, 'y'));
    } else parts.push(G.lathe('y', [[rIn, 0.0055], [rOut, 0.0055], [rOut, -0.0055], [rIn, -0.0055], [rIn, 0.0055]], 56));
    return yTo(merge(parts), 'x');
  });
}

// Remklauw (plaats in de hoek: schijfmidden xd, hoek phi, middenstraal rp). Lokaal: x = wielas (buiten +), y = radiaal naar buiten, z = tangentieel.
function caliper(label, xd, z0, phi, rp, front) {
  const pos = [xd, AY + rp * Math.sin(phi), z0 + rp * Math.cos(phi)];
  const w = front ? 0.100 : 0.082, pw = front ? 0.108 : 0.090, ph = front ? 0.046 : 0.052, py = front ? -0.003 : 0.0035;
  const hy0 = front ? -0.034 : -0.028, hy1 = front ? 0.048 : 0.050, hc = (hy0 + hy1) / 2, hh = hy1 - hy0;
  const pr = front ? 0.0285 : 0.019, zl = w / 2 + 0.011, yp = hy1 - 0.021, kk = front ? 'F' : 'R';
  const housing = merge([
    xf(G.rbox(0.036, hh, w, 0.007), [-0.048, hc, 0]),
    xf(G.cyl('x', pr + 0.007, pr + 0.007, 0.014, 20), [-0.067, py, 0]),
    xf(G.rbox(0.016, hh, w, 0.005), [0.0365, hc, 0]),
    xf(G.rbox(0.075, 0.020, 0.022, 0.005), [0, hy1 - 0.010, w / 2 - 0.011]),
    xf(G.rbox(0.075, 0.020, 0.022, 0.005), [0, hy1 - 0.010, -(w / 2 - 0.011)]),
    xf(G.rbox(0.030, 0.026, 0.026, 0.005), [-0.040, yp, zl]),
    xf(G.rbox(0.030, 0.026, 0.026, 0.005), [-0.040, yp, -zl])]);
  const carrier = merge([
    xf(G.rbox(0.014, hh + 0.012, 0.150, 0.004), [-0.083, hc, 0]),
    xf(G.rbox(0.113, 0.030, 0.014, 0.003), [-0.0265, hy0 + 0.014, zl]),
    xf(G.rbox(0.113, 0.030, 0.014, 0.003), [-0.0265, hy0 + 0.014, -zl])]);
  const pad = (nm, sg, d) => A(nm, { d, ex: [sg * (front ? 0.075 : 0.07), 0.13, 0] }, [
    P('Rugplaat', G.box(0.005, ph, pw), MAT.steel, { d: 'Stalen rugplaat van het remblok.', p: [sg * 0.0255, py, 0], ex: [sg * 0.01, 0, 0] }),
    P('Remvoering', G.rbox(0.010, ph - 0.004, pw - 0.006, 0.0015), MAT.friction, { d: 'Wrijvingsmateriaal dat tegen de schijf wrijft.', p: [sg * 0.018, py, 0], ex: [-sg * 0.012, 0, 0] }),
    P('Anti-piepplaat', G.box(0.0013, ph - 0.006, pw - 0.012), MAT.satin, { d: 'Dun metalen plaatje tussen rugplaat en zuiger of klauwvuist; voorkomt piepen.', p: [sg * 0.0286, py, 0], ex: [sg * 0.02, 0, 0] })]);
  const kids = [
    P('Remklauwhuis', housing, MAT.chsCaliper, { d: front ? 'Gegoten huis van de zwevende remklauw (één zuiger Ø57 mm aan de binnenzijde); de vuist aan de buitenzijde trekt het buitenste blok tegen de schijf.' : 'Gegoten huis van de zwevende remklauw met één zuiger Ø38 mm en ingebouwde parkeerremhefboom.', p: [0, 0, 0], ex: [0.07, 0.06, 0] }),
    P('Remklauwdrager', carrier, MAT.darkSteel, { d: 'Drager die met twee bouten aan de fusee zit en de remblokken geleidt.', ex: [-0.12, -0.06, 0] }),
    pad('Remblok binnen', -1, 'Remblok aan de zuigerzijde: rugplaat, voering en anti-piepplaat.'),
    pad('Remblok buiten', 1, 'Remblok aan de vuistzijde: rugplaat, voering en anti-piepplaat.'),
    P('Zuiger', G.cyl('x', pr, pr, 0.030, 20), MAT.steel, { d: front ? 'Hydraulische zuiger Ø57 mm die het binnenste blok tegen de schijf drukt.' : 'Hydraulische zuiger Ø38 mm; wordt bij de parkeerrem mechanisch uitgedraaid.', p: [-0.045, py, 0], ex: [-0.07, 0, 0], inner: true }),
    P('Zuigerafdichting', G.torus('x', pr + 0.001, 0.0022, 20, 5), MAT.rubber, { d: 'Rubber afdichtring in de cilinderboring; trekt de zuiger na het remmen iets terug.', p: [-0.036, py, 0], ex: [-0.04, 0.05, 0], inner: true }),
    P('Stofhoes zuiger', G.lathe('x', [[pr + 0.005, 0], [pr + 0.004, 0.006], [pr + 0.0005, 0.007], [pr + 0.0005, 0], [pr + 0.005, 0]], 20, 'chsPb' + kk), MAT.rubber, { d: 'Rubber stofhoes tussen zuiger en klauwhuis.', p: [-0.0335, py, 0], ex: [-0.02, 0.08, 0], inner: true }),
    ...[1, -1].map(sg => P(`Geleidepen ${sg > 0 ? 'boven' : 'onder'}`, G.cyl('x', 0.006, 0.006, 0.07, 10), MAT.steel, { d: 'Glijpen waarover de zwevende klauw schuift; geschroefd in de drager.', p: [-0.045, yp, sg * zl], ex: [-0.09, 0.02, sg * 0.04] })),
    ...[1, -1].map(sg => P(`Pennenhoes ${sg > 0 ? 'boven' : 'onder'}`, G.lathe('x', bellows(0.011, 0.008, 0.026, 3), 14, 'chsGb'), MAT.rubber, { d: 'Rubber hoes die vet bij de geleidepen houdt en vuil weert.', p: [-0.074, yp, sg * zl], ex: [-0.06, 0.04, sg * 0.05] })),
    P('Ontluchtingsnippel', G.cyl('y', 0.0035, 0.0045, 0.016, 8), MAT.steel, { d: 'Nippel om lucht uit het remcircuit te laten.', p: [-0.045, hy1 + 0.007, -0.028], ex: [0, 0.12, -0.04] }),
    P('Nippeldop', G.cyl('y', 0.0055, 0.0055, 0.009, 8), MAT.rubber, { d: 'Rubber stofdop op de ontluchtingsnippel.', p: [-0.045, hy1 + 0.0195, -0.028], ex: [0, 0.2, -0.04] }),
    P('Anti-rammelveer', tube([[-0.034, hy1 - 0.002, -0.03], [-0.034, hy1 + 0.006, 0], [0.026, hy1 + 0.006, 0], [0.026, hy1 - 0.002, 0.03]], 0.0017, 14, 5), MAT.steel, { d: 'Veerstalen beugel die de klauw tegen de drager drukt zodat hij niet rammelt.', ex: [0, 0.16, 0.05] }),
    ...[1, -1].map(sg => P(`Drager bout ${sg > 0 ? 1 : 2}`, hexBolt(0.032, 0.012, '-x'), MAT.steel, { d: 'Bout M12 die de remklauwdrager op de fusee houdt.', p: [-0.076, hy0 + 0.010, sg * 0.066], ex: [0.08, -0.02, sg * 0.04] }))];
  if (!front) kids.push(
    P('Stelmechanisme', merge([G.cyl('x', 0.008, 0.008, 0.024, 10), xf(G.cyl('x', 0.013, 0.013, 0.006, 12), [0.012, 0, 0])]), MAT.darkSteel, { d: 'Spindel met stelmoer in de zuiger: draait de zuiger uit bij het aantrekken van de parkeerrem en stelt de blokspeling bij (schematisch).', p: [-0.052, py, 0], ex: [-0.12, 0, 0], inner: true }),
    P('Parkeerremhefboom', merge([G.cyl('x', 0.006, 0.006, 0.020, 10), xf(G.rbox(0.008, 0.050, 0.014, 0.003), [-0.0, py - 0.022, 0])]), MAT.steel, { d: 'Hefboom op het klauwhuis; de parkeerremkabel trekt hem aan en draait de zuigerspindel.', p: [-0.074, py, 0], ex: [-0.1, -0.06, 0] }),
    P('Kabelhouder', G.rbox(0.012, 0.012, 0.022, 0.003), MAT.darkSteel, { d: 'Beugel op het klauwhuis die de buitenkabel van de parkeerrem vasthoudt.', p: [-0.062, hy0 + 0.0, -0.032], ex: [-0.08, -0.08, -0.05] }),
    P('Terugtrekveer', spring(0.005, 0.0011, 0.022, 5, 'y'), MAT.steel, { d: 'Veer die de parkeerremhefboom terugtrekt als de kabel loskomt.', p: [-0.074, py - 0.040, 0.01], ex: [-0.12, -0.04, 0.03] }));
  return A(label, { d: front ? 'Zwevende remklauw met één zuiger Ø57 mm: huis, drager, twee remblokken, zuiger met afdichting en stofhoes, twee geleidepennen en ontluchtingsnippel.' : 'Zwevende achterklauw met één zuiger Ø38 mm en ingebouwde mechanische parkeerrem; de kabel van de elektrische parkeerremunit trekt de hefboom aan.', spec: [['Zuiger', front ? 'Ø 57 mm' : 'Ø 38 mm'], ['Type', 'zwevend, één zuiger']], p: pos, r: [HALF - phi, 0, 0], ex: [0.06, 0.14, 0] }, kids);
}

// naaf, naaflager en bevestiging (voor en achter gelijk opgezet); rel. coördinaten t.o.v. montagevlak xm
function chsHub(xm, z0, front, kn) {
  const n = front ? 'voor' : 'achter';
  return [
    P(front ? 'Wielnaaf' : 'Wielnaaf achter', merge([
      G.lathe('x', [[0.0, -0.100], [0.027, -0.100], [0.027, -0.020], [0.0, -0.020]], 28, 'chsHubB'),
      G.lathe('x', [[0.0, -0.020], [0.058, -0.020], [0.058, -0.006], [0.033, -0.006], [0.033, 0.012], [0.0, 0.012]], 40, 'chsHubF'),
      ...[0, 1, 2, 3, 4].map(k => xf(G.cyl('x', 0.011, 0.011, 0.006, 10), [-0.006, 0.0572 * Math.cos(k * PI * 0.4), 0.0572 * Math.sin(k * PI * 0.4)]))]), MAT.steel,
      { d: 'Naaf met flens: de schijf en het wiel worden met vijf wielbouten M14 × 1,5 (steek 114,3 mm, middengat Ø66,1 mm) op de flens geklemd.', p: [xm, AY, z0], ex: [0.2, 0, 0] }),
    P('Aandrijfasmoer', merge([chsNut('x', 0.0185, 0.014), xf(G.cyl('x', 0.021, 0.021, 0.002, 18), [-0.008, 0, 0])]), MAT.steel, { d: front ? 'Grote moer op het uiteinde van de aandrijfas in het midden van de naaf (onder de naafdop); wordt vastgezet met een borgkraag.' : 'Naafmoer op de astap, geborgd met een borgkraag onder de naafdop.', p: [xm + 0.0145, AY, z0], ex: [0.38, 0, 0] }),
    P('Borgkraag', annulus(0.0165, 0.0215, 0.002, 'x', 18), MAT.darkSteel, { d: 'Dun ring dat de asmoer borgt door in een gleuf te worden geslagen.', p: [xm + 0.0075, AY, z0], ex: [0.3, 0, 0] }),
    A('Wiellagereenheid', { d: 'Gesloten naaflagereenheid (generatie 2): dubbelrijig kogellager met magnetische ABS-codeerring in de afdichting; aannemelijk volgens onderdelenlijsten, uitwendige maten schematisch.', ex: [-0.1, 0.12, 0], inner: true }, [
      P('Lagerbuitenring', merge([G.lathe('x', [[0.031, -0.085], [0.0425, -0.085], [0.0425, -0.036], [0.054, -0.036], [0.054, -0.027], [0.031, -0.027], [0.031, -0.085]], 36, 'chsBrg')]), MAT.bearing, { d: 'Buitenring met flens; zit met drie bouten aan de ' + (front ? 'fusee' : 'astapflens') + '.', p: [xm, AY, z0], ex: [-0.08, 0, 0] }),
      P('Lagerbinnenring', G.lathe('x', [[0.0275, -0.095], [0.031, -0.095], [0.031, -0.024], [0.0275, -0.024], [0.0275, -0.095]], 28, 'chsBri'), MAT.steel, { d: 'Binnenring die om de naaf zit.', p: [xm, AY, z0], ex: [0.0, 0.06, 0] }),
      P('Kogelkrans buiten', merge(Array.from({ length: 10 }, (_, k) => xf(G.sphere(0.0042, 6), [-0.035, 0.0295 * Math.cos(k * PI / 5), 0.0295 * Math.sin(k * PI / 5)]))), MAT.chrome, { d: 'Rij lagerkogels aan de wielzijde.', p: [xm, AY, z0], ex: [0.0, 0.1, 0] }),
      P('Kogelkrans binnen', merge(Array.from({ length: 10 }, (_, k) => xf(G.sphere(0.0042, 6), [-0.062, 0.0295 * Math.cos(k * PI / 5 + 0.3), 0.0295 * Math.sin(k * PI / 5 + 0.3)]))), MAT.chrome, { d: 'Tweede rij lagerkogels aan de aandrijfzijde.', p: [xm, AY, z0], ex: [0.0, 0.14, 0] }),
      P('Magnetische ABS-codeerring', annulus(0.0315, 0.0375, 0.004, 'x', 28), MAT.plasticGrey, { d: 'Kunststof ring met magnetische polen in de lagerafdichting; geeft de wielsnelheid aan de ABS-sensor (geen getande ring).', p: [xm - 0.0905, AY, z0], ex: [-0.1, 0, 0] })]),
    ...[0, 1, 2].map(k => P(`Lagerbout ${k + 1}`, hexBolt(0.05, 0.009, 'x'), MAT.steel, { d: 'Bout M10 die de lagereenheid van binnenuit op de ' + (front ? 'fusee' : 'astapflens') + ' trekt.', p: [xm - (front ? 0.0815 : 0.098), AY + 0.0485 * Math.cos(k * PI * 2 / 3 + 1.9), z0 + 0.0485 * Math.sin(k * PI * 2 / 3 + 1.9)], ex: [-0.13, 0.03 * (k - 1), 0.03] }))
  ];
}

function frontCorner(s) {
  const z0 = AXF, n = s > 0 ? 'linksvoor' : 'rechtsvoor', xm = chsMF, xd = xm - 0.046, SP = chsSP.clone(), SD = chsSD;
  const bj = [0.725, 0.262, z0 + 0.012], tr = [0.70, 0.31, z0 - 0.165];      // fuseekogel en spoorstangeind
  const phi = 0.35, rp = 0.124, CM = chsMat([xd, AY + rp * Math.sin(phi), z0 + rp * Math.cos(phi)], [HALF - phi, 0, 0]);
  const rcx = xm - 0.058;
  const knuckle = merge([
    xf(G.cyl('x', 0.05, 0.05, 0.044, 28), [rcx, AY, z0]),
    xf(G.cyl('x', 0.058, 0.058, 0.008, 24), [xm - 0.0775, AY, z0]),
    rodBetween([rcx - 0.012, AY + 0.04, z0], [SP.x + 0.02, SP.y - 0.04, z0], 0.022),
    xf(G.rbox(0.05, 0.12, 0.012, 0.004), [SP.x + 0.01, SP.y + 0.025, z0 + 0.034]), xf(G.rbox(0.05, 0.12, 0.012, 0.004), [SP.x + 0.01, SP.y + 0.025, z0 - 0.034]),
    rodBetween([rcx - 0.012, AY - 0.04, z0], [bj[0], bj[1] - 0.012, bj[2]], 0.02),
    xf(G.cyl('y', 0.024, 0.024, 0.034, 18), [bj[0], bj[1] + 0.005, bj[2]]),
    rodBetween([rcx - 0.012, AY - 0.02, z0 - 0.03], [tr[0], tr[1] - 0.012, tr[2]], 0.014),
    xf(G.cyl('y', 0.018, 0.018, 0.03, 14), [tr[0], tr[1], tr[2]]),
    rodBetween([rcx - 0.015, AY + 0.03, z0 + 0.03], [0.683, AY + 0.052, z0 + 0.095], 0.013),
    xf(G.rbox(0.014, 0.05, 0.14, 0.004), [0.683, AY + 0.052, z0 + 0.095])]);
  const seat = (sg, key) => G.lathe('y', [[0.022, 0], [0.078, sg * 0.003], [0.08, sg * 0.01], [0.076, sg * 0.012], [0.022, sg * 0.006]], 32, key);
  const strut = A(`Veerpoot ${n}`, { d: 'McPherson-veerpoot: bitube-schokdemper (huis Ø50 mm, zuigerstang Ø22 mm) met schroefveer, tevens fuseedraaipunt; de top zit in de veerpoottoren, de voet in de fuseeklem.', spec: [['Demperhuis', 'Ø 50 mm'], ['Zuigerstang', 'Ø 22 mm']], p: SP.toArray(), q: quatFromTo(V3(0, 1, 0), SD), ex: [0.1, 0.34, 0] }, [
    P('Demperbuis', merge([xf(G.cyl('y', 0.025, 0.025, 0.315, 22), [0, 0.1125, 0]), xf(G.rbox(0.02, 0.02, 0.026, 0.003), [-0.006, 0.095, -0.038]), xf(G.cyl('y', 0.019, 0.019, 0.01, 18), [0, -0.05, 0])]), MAT.darkSteel, { d: 'Buis van de bitube-schokdemper (Ø50 mm) met aangelaste klemtong voor de koppelstang.', ex: [0, -0.2, 0] }),
    P('Zuigerstang', G.cyl('y', 0.011, 0.011, 0.19, 14), MAT.chrome, { d: 'Verchroomde zuigerstang Ø22 mm.', p: [0, 0.295, 0], ex: [0, 0.02, 0] }),
    P('Veerschotel onder', seat(1, 'chsSeatL'), MAT.darkSteel, { d: 'Onderste veerschotel, aan de demperbuis gelast.', p: [0, 0.105, 0], ex: [0, -0.06, 0] }),
    P('Veerrubber onder', annulus(0.052, 0.074, 0.004, 'y', 28), MAT.rubber, { d: 'Rubber tussenlaag tussen veer en onderste schotel.', p: [0, 0.114, 0], ex: [0, -0.03, 0] }),
    P('Schroefveer voor', spring(0.066, 0.0068, 0.2, 5.5), MAT.chsSpring, { d: 'Draagt het voorgewicht van de auto.', p: [0, 0.21, 0] }),
    P('Stofhoes veerpoot', G.lathe('y', bellows(0.032, 0.026, 0.115, 5), 22, 'chsDb'), MAT.rubber, { d: 'Balg over de zuigerstang die vuil uit de demper houdt.', p: [0, 0.165, 0], ex: [0.16, 0.02, 0] }),
    P('Aanslagrubber', G.cyl('y', 0.024, 0.021, 0.04, 16), MAT.rubber, { d: 'Vangt het inveren aan het einde van de slag op.', p: [0, 0.285, 0], ex: [0.2, 0.06, 0] }),
    P('Veerschotel boven', seat(-1, 'chsSeatU'), MAT.darkSteel, { d: 'Bovenste veerschotel.', p: [0, 0.318, 0], ex: [0, 0.08, 0] }),
    P('Veerrubber boven', annulus(0.052, 0.074, 0.004, 'y', 28), MAT.rubber, { d: 'Rubber tussenlaag tussen veer en bovenste schotel.', p: [0, 0.31, 0], ex: [0, 0.05, 0] }),
    P('Veerpootlager', annulus(0.03, 0.052, 0.014, 'y', 28), MAT.bearing, { d: 'Axiaal draaglager zodat de veerpoot met het stuur mee kan draaien.', p: [0, 0.331, 0], ex: [0, 0.12, 0] }),
    P('Veerpootsteunlager', G.lathe('y', [[0.012, 0], [0.06, 0], [0.062, 0.016], [0.045, 0.026], [0.012, 0.026]], 28, 'chsTopm'), MAT.rubber, { d: 'Rubber-metalen topsteun: koppelt de veerpoot aan de veerpoottoren en dempt trillingen.', p: [0, 0.34, 0], ex: [0, 0.18, 0] }),
    P('Veerpootmoer', chsNut('y', 0.0125, 0.012), MAT.steel, { d: 'Zelfborgende moer bovenop de zuigerstang.', p: [0, 0.372, 0], ex: [0, 0.26, 0] }),
    ...[0, 1, 2].map(k => P(`Topsteunmoer ${k + 1}`, chsNut('y', 0.0075, 0.009), MAT.steel, { d: 'Moer M8 waarmee de topsteun aan de veerpoottoren zit.', p: [0.045 * Math.cos(k * PI * 2 / 3 + 0.5), 0.368, 0.045 * Math.sin(k * PI * 2 / 3 + 0.5)], ex: [0, 0.3 + k * 0.02, 0] })),
    ...[[0.0, -0.005], [0.0, 0.05]].flatMap(([_, u], i) => [
      P(`Fuseebout ${i + 1}`, hexBolt(0.086, 0.012, 'z'), MAT.steel, { d: 'Klembout M12 die de veerpoot in de fuseeklem vastzet.', p: [0, u, -0.044], ex: [0, 0, -0.12 - i * 0.04] }),
      P(`Fuseemoer ${i + 1}`, chsNut('z', 0.0105, 0.011), MAT.steel, { d: 'Zelfborgende moer van de fuseebout.', p: [0, u, 0.0425], ex: [0, 0, 0.14 + i * 0.04] })])]);
  const hubs = chsHub(xm, z0, true);
  // schijf en bijbehoren
  const shield = G.lathe('x', [[0.052, 0], [0.12, 0.004], [0.14, 0.012], [0.14, 0.0], [0.052, -0.002]], 40, 'chsShF');
  const bjk = chsPt(CM, [-0.045, 0.059, 0.028]), bjt = [0.61, 0.546, z0 + 0.052];
  const pa = Math.PI * 2 / 3;
  return A(`Wielophanging ${n}`, { d: `Wielophanging ${n}: fusee met naaf en lagereenheid, McPherson-veerpoot, onderste draagarm, koppelstang, geventileerde remschijf 296 × 26 mm met zwevende klauw.`, s: [s, 1, 1], ex: [s * 0.34, 0, 0] }, [
    P('Fusee', knuckle, MAT.iron, { d: 'Fusee (wieldrager): draagt het naaflager, klemt de veerpoot, bevat de kogel van de draagarm, de stuurarm voor de spoorstang en de oren voor de remklauwdrager. Materiaal nodulair gietijzer (aannemelijk).', ex: [0, 0.02, 0] }),
    ...hubs,
    P('Remschijf voor', discGeo(0.093, 0.148, true, 'F', 0.046), MAT.iron, { d: 'Geventileerde remschijf 296 × 26 mm (vijf gaten, steek 114,3 mm, middengat Ø68 mm).', spec: [['Diameter', '296 mm'], ['Dikte', '26 mm'], ['Type', 'geventileerd']], p: [xd, AY, z0], ex: [0.14, 0, 0] }),
    P('Schijfborgschroef', G.cyl('x', 0.004, 0.004, 0.003, 8), MAT.steel, { d: 'Kleine kruiskopschroef die de schijf tijdens montage op de naaf houdt.', p: [xm - 0.0075, AY + 0.02, z0 + 0.052], ex: [0.2, 0.05, 0.04] }),
    P('Stofschild voor', shield, MAT.darkSteel, { d: 'Stalen schild achter de remschijf tegen steenslag en vuil.', p: [xm - 0.063, AY, z0], ex: [-0.06, 0, 0] }),
    ...[0, 1, 2].map(k => P(`Schildbout ${k + 1}`, hexBolt(0.016, 0.007, 'x'), MAT.steel, { d: 'Bout van het stofschild.', p: [xm - 0.082, AY + 0.065 * Math.cos(k * pa + 0.7), z0 + 0.065 * Math.sin(k * pa + 0.7)], ex: [-0.12, 0, 0.02 * k] })),
    P('Wielsnelheidssensor', merge([G.cyl('x', 0.0065, 0.0065, 0.04, 10), xf(G.rbox(0.012, 0.016, 0.022, 0.003), [-0.024, 0.0, 0.0])]), MAT.plastic, { d: 'Passieve magnetoresistieve sensor die het wiel-sensorsignaal uit de magnetische codeerring leest.', p: [xm - 0.104, AY + 0.034, z0], ex: [-0.14, 0.08, 0.05] }),
    P('Sensorkabel', tube([[xm - 0.128, AY + 0.034, z0 + 0.012], [0.66, AY + 0.1, z0 + 0.03], [0.625, 0.5, z0 + 0.034]], 0.0032, 20, 5), MAT.rubber, { d: 'Kabel van de wielsnelheidssensor naar de kabelboom, vastgeklikt langs de veerpoot.', ex: [-0.08, 0.14, 0.08] }),
    P('Sensorklem', G.rbox(0.014, 0.012, 0.01, 0.002), MAT.plasticGrey, { d: 'Kunststof klem die de sensorkabel aan de veerpoot houdt.', p: [0.625, 0.5, z0 + 0.034], ex: [-0.06, 0.18, 0.1] }),
    P('Sensorbout', hexBolt(0.012, 0.006, 'x'), MAT.steel, { d: 'Bout die de sensor in de fusee vastzet.', p: [xm - 0.122, AY + 0.0, z0 + 0.03], ex: [-0.2, 0, 0.1] }),
    A('Draagarm', { d: 'Onderste draagarm (dwarsarm) tussen het subframe en de fusee: staal, met twee rubberlagers en een kogelgewricht.', ex: [0, -0.16, 0] }, [
      P('Draagarmplaat', plan(shapeOf([[0.405, z0 + 0.1], [0.405, z0 - 0.2], [0.46, z0 - 0.23], [0.735, z0 - 0.02], [0.735, z0 + 0.04], [0.5, z0 + 0.1]]), 0.025), MAT.darkSteel, { d: 'Geperste stalen A-vormige arm.', p: [0, 0.225, 0] }),
      P('Draagarmrubber voor', G.cyl('z', 0.022, 0.022, 0.05, 16), MAT.rubber, { d: 'Rubberlager waarmee de arm aan het subframe scharniert.', p: [0.405, 0.225, z0 + 0.07], ex: [-0.12, 0, 0.1] }),
      P('Draagarmrubber achter', G.cyl('y', 0.03, 0.03, 0.04, 18), MAT.rubber, { d: 'Groter rubberlager aan de achterzijde van de arm.', p: [0.44, 0.225, z0 - 0.19], ex: [-0.12, 0, -0.12] }),
      P('Voorste armbout', hexBolt(0.09, 0.014, 'z'), MAT.steel, { d: 'Scharnierbout M14 door het voorste rubberlager.', p: [0.405, 0.225, z0 + 0.105], ex: [-0.1, 0, 0.2] }),
      P('Achterste armbout', hexBolt(0.07, 0.014, 'y'), MAT.steel, { d: 'Scharnierbout door het achterste rubberlager.', p: [0.44, 0.245, z0 - 0.19], ex: [-0.1, 0.2, -0.1] }),
      P('Fuseekogel', merge([G.sphere(0.02, 14), xf(G.cyl('y', 0.011, 0.011, 0.045, 10), [0, -0.022, 0]), xf(G.cyl('y', 0.019, 0.017, 0.03, 14), [0, 0.016, 0])]), MAT.steel, { d: 'Kogelgewricht tussen draagarm en fusee; de stift gaat door de arm.', p: [bj[0], 0.222, bj[2]], ex: [0.05, -0.1, 0] }),
      P('Kogelstofhoes', G.lathe('y', bellows(0.022, 0.016, 0.026, 3), 16, 'chsKb'), MAT.rubber, { d: 'Rubber hoes over het kogelgewricht.', p: [bj[0], 0.236, bj[2]], ex: [0.1, 0.04, 0] }),
      P('Kroonmoer', merge([chsNut('y', 0.0115, 0.013), xf(G.box(0.004, 0.006, 0.024), [0, 0.0085, 0])]), MAT.steel, { d: 'Kroonmoer van de kogelstift.', p: [bj[0], 0.205, bj[2]], ex: [0, -0.18, 0] }),
      P('Splitpen', tube([[0, 0.0, -0.011], [0, 0.0, 0.011], [0.0, 0.004, 0.012]], 0.0012, 8, 4), MAT.steel, { d: 'Splitpen die de kroonmoer borgt.', p: [bj[0], 0.186, bj[2]], ex: [0, -0.26, 0] })]),
    A('Koppelstang', { d: 'Koppelstang tussen stabilisatorstang en veerpoot; draagt de rolstijfheid over op de veerpoot.', ex: [0.05, 0.04, 0.12] }, [
      P('Staaf', rodBetween([0.557, 0.29, z0 - 0.05], [0.613, 0.49, z0 - 0.046], 0.0065), MAT.steel, { d: 'Stalen staaf van de koppelstang.', ex: [0, 0, 0] }),
      P('Kogelgewricht onder', merge([G.sphere(0.013, 12), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, -0.012, 0])]), MAT.steel, { d: 'Kogelgewricht aan de stabilisatorstang.', p: [0.557, 0.29, z0 - 0.05], ex: [0, -0.1, 0] }),
      P('Kogelgewricht boven', merge([G.sphere(0.013, 12), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, 0.012, 0])]), MAT.steel, { d: 'Kogelgewricht aan de klemtong van de demperbuis.', p: [0.613, 0.49, z0 - 0.046], ex: [0, 0.1, 0] }),
      P('Koppelstangmoer onder', chsNut('y', 0.0085, 0.008), MAT.steel, { d: 'Moer M10 onderaan.', p: [0.557, 0.274, z0 - 0.05], ex: [0, -0.2, 0] }),
      P('Koppelstangmoer boven', chsNut('y', 0.0085, 0.008), MAT.steel, { d: 'Moer M10 bovenaan.', p: [0.613, 0.51, z0 - 0.046], ex: [0, 0.2, 0] })]),
    strut,
    caliper(`Remklauw ${n}`, xd, z0, phi, rp, true),
    A('Remslang voor', { d: 'Flexibele remslang van de vaste remleiding op de veerpoot naar de klauw, vastgezet met een holle (banjo) bout en twee koperen ringen.', ex: [0.04, 0.12, 0.1] }, [
      P('Remslang', tube([bjk, chsPt(CM, [-0.045, 0.1, 0.028]), [0.66, 0.5, z0 + 0.15], bjt], 0.0055, 28, 8), MAT.rubber, { d: 'Flexibele, wapeningsversterkte remslang.', ex: [0, 0.06, 0] }),
      P('Banjo-oog', merge([G.torus('y', 0.008, 0.0035, 14, 6), xf(G.cyl('z', 0.004, 0.004, 0.02, 8), [0, 0, 0.016])]), MAT.steel, { d: 'Slangeinde met oog dat om de holle bout past.', p: chsPt(CM, [-0.045, 0.0545, 0.028]), r: [HALF - phi, 0, 0], ex: [0, 0.1, 0.04] }),
      P('Holle bout', chsFlip(hexBolt(0.016, 0.0085, 'y')), MAT.steel, { d: 'Holle bout (banjo) waardoor de remvloeistof het klauwhuis in gaat.', p: chsPt(CM, [-0.045, 0.0605, 0.028]), r: [HALF - phi, 0, 0], ex: [0, 0.2, 0] }),
      ...[0, 1].map(k => P(`Koperring ${k + 1}`, annulus(0.0045, 0.0085, 0.0015, 'y', 14), MAT.copper, { d: 'Koperen afdichtring onder en boven het banjo-oog.', p: chsPt(CM, [-0.045, k ? 0.0585 : 0.0495, 0.028]), r: [HALF - phi, 0, 0], ex: [0, 0.1 + k * 0.05, 0.02] })),
      P('Slangbeugel', G.rbox(0.016, 0.014, 0.02, 0.003), MAT.darkSteel, { d: 'Beugel op de veerpoot waar de flexibele slang overgaat in de vaste remleiding.', p: bjt, ex: [0.04, 0.1, 0.1] })])
  ]);
}

const chsRearCM = () => chsMat([chsMR - 0.040, AY + 0.112 * Math.sin(2.79), AXR + 0.112 * Math.cos(2.79)], [HALF - 2.79, 0, 0]);
function rearCorner(s) {
  const z0 = AXR, n = s > 0 ? 'linksachter' : 'rechtsachter', xm = chsMR, xd = xm - 0.040;
  const phi = 2.79, rp = 0.112, CM = chsMat([xd, AY + rp * Math.sin(phi), z0 + rp * Math.cos(phi)], [HALF - phi, 0, 0]);
  const pa = PI * 2 / 3;
  const hubs = chsHub(xm, z0, false);
  const bjk = chsPt(CM, [-0.045, 0.061, 0.026]), bjt = [0.64, 0.40, z0 - 0.10];
  const shield = G.lathe('x', [[0.052, 0], [0.12, 0.004], [0.145, 0.012], [0.145, 0.0], [0.052, -0.002]], 40, 'chsShR');
  return A(`Wielophanging ${n}`, { d: `Wielophanging ${n}: astapflens met naaflager, naaf, massieve remschijf 300 × 11 mm en zwevende klauw met parkeerremhefboom.`, s: [s, 1, 1], ex: [s * 0.32, 0, 0] }, [
    P('Astapflens', merge([xf(G.rbox(0.012, 0.15, 0.15, 0.01), [xm - 0.092 - 0.0, AY, z0]), xf(G.cyl('x', 0.05, 0.05, 0.044, 26), [xm - 0.058, AY, z0])]), MAT.iron, { d: 'Flens met astaphuis die aan het uiteinde van de langsarm is geschroefd; draagt het naaflager.', ex: [-0.1, 0.02, 0] }),
    ...[0, 1, 2, 3].map(k => P(`Flensbout ${k + 1}`, hexBolt(0.03, 0.011, '-x'), MAT.steel, { d: 'Bout M12 die de astapflens aan de langsarm houdt.', p: [xm - 0.086, AY + 0.052 * (k < 2 ? 1 : -1), z0 + 0.052 * (k % 2 ? 1 : -1)], ex: [-0.2, 0.02 * (k - 1.5), 0.02 * (k - 1.5)] })),
    ...hubs,
    P('Remschijf achter', discGeo(0.082, 0.150, false, 'R', 0.040), MAT.iron, { d: 'Massieve remschijf 300 × 11 mm.', spec: [['Diameter', '300 mm'], ['Dikte', '11 mm'], ['Type', 'massief']], p: [xd, AY, z0], ex: [0.12, 0, 0] }),
    P('Schijfborgschroef', G.cyl('x', 0.004, 0.004, 0.003, 8), MAT.steel, { d: 'Kleine kruiskopschroef die de schijf tijdens montage op de naaf houdt.', p: [xm - 0.0075, AY + 0.02, z0 + 0.052], ex: [0.2, 0.05, 0.04] }),
    P('Stofschild achter', shield, MAT.darkSteel, { d: 'Afschermplaat achter de remschijf.', p: [xm - 0.063, AY, z0], ex: [-0.06, 0, 0] }),
    ...[0, 1, 2].map(k => P(`Schildbout ${k + 1}`, hexBolt(0.016, 0.007, 'x'), MAT.steel, { d: 'Bout van het stofschild.', p: [xm - 0.082, AY + 0.065 * Math.cos(k * pa + 0.7), z0 + 0.065 * Math.sin(k * pa + 0.7)], ex: [-0.12, 0, 0.02 * k] })),
    P('Wielsnelheidssensor achter', merge([G.cyl('x', 0.0065, 0.0065, 0.04, 10), xf(G.rbox(0.012, 0.016, 0.022, 0.003), [-0.024, 0, 0])]), MAT.plastic, { d: 'Passieve magnetoresistieve sensor, leest de magnetische codeerring in het naaflager.', p: [xm - 0.118, AY + 0.034, z0], ex: [-0.14, 0.08, 0.05] }),
    P('Sensorkabel achter', tube([[xm - 0.14, AY + 0.034, z0 + 0.012], [0.6, AY + 0.04, z0 + 0.1], [0.58, 0.36, z0 + 0.2]], 0.0032, 18, 5), MAT.rubber, { d: 'Kabel van de achterste wielsnelheidssensor naar de kabelboom.', ex: [-0.08, 0.14, 0.08] }),
    P('Sensorbout achter', hexBolt(0.012, 0.006, 'x'), MAT.steel, { d: 'Bout die de sensor vastzet.', p: [xm - 0.152, AY, z0 + 0.03], ex: [-0.2, 0, 0.1] }),
    caliper(`Remklauw ${n}`, xd, z0, phi, rp, false),
    A('Remslang achter', { d: 'Flexibele remslang van de vaste remleiding op de langsarm naar de klauw, met holle (banjo) bout en twee koperen ringen.', ex: [0.04, 0.12, -0.1] }, [
      P('Remslang', tube([bjk, chsPt(CM, [-0.045, 0.1, 0.026]), [0.68, 0.46, z0 - 0.16], bjt], 0.0055, 28, 8), MAT.rubber, { d: 'Flexibele, wapeningsversterkte remslang.', ex: [0, 0.06, 0] }),
      P('Banjo-oog', merge([G.torus('y', 0.008, 0.0035, 14, 6), xf(G.cyl('z', 0.004, 0.004, 0.02, 8), [0, 0, 0.016])]), MAT.steel, { d: 'Slangeinde met oog dat om de holle bout past.', p: chsPt(CM, [-0.045, 0.0565, 0.026]), r: [HALF - phi, 0, 0], ex: [0, 0.1, 0.04] }),
      P('Holle bout', chsFlip(hexBolt(0.016, 0.0085, 'y')), MAT.steel, { d: 'Holle bout (banjo) waardoor de remvloeistof het klauwhuis in gaat.', p: chsPt(CM, [-0.045, 0.061, 0.026]), r: [HALF - phi, 0, 0], ex: [0, 0.2, 0] }),
      ...[0, 1].map(k => P(`Koperring ${k + 1}`, annulus(0.0045, 0.0085, 0.0015, 'y', 14), MAT.copper, { d: 'Koperen afdichtring onder en boven het banjo-oog.', p: chsPt(CM, [-0.045, k ? 0.0605 : 0.0515, 0.026]), r: [HALF - phi, 0, 0], ex: [0, 0.1 + k * 0.05, 0.02] })),
      P('Slangbeugel', G.rbox(0.016, 0.014, 0.02, 0.003), MAT.darkSteel, { d: 'Beugel op de langsarm waar de flexibele slang overgaat in de vaste remleiding.', p: bjt, ex: [0.04, 0.1, -0.1] })])
  ]);
}
function buildFrontAxle() {
  const z0 = AXF;
  const sub = merge([xf(G.box(0.92, 0.06, 0.1), [0, 0.22, z0 - 0.2]), xf(G.box(0.07, 0.06, 0.55), [0.42, 0.225, z0]), xf(G.box(0.07, 0.06, 0.55), [-0.42, 0.225, z0]), xf(G.box(0.84, 0.05, 0.06), [0, 0.23, z0 + 0.33]), ...[[0.5, z0 - 0.2], [-0.5, z0 - 0.2], [0.47, z0 + 0.3], [-0.47, z0 + 0.3]].map(([x, z]) => xf(G.cyl('y', 0.03, 0.03, 0.12, 14), [x, 0.3, z]))]);
  const arb = tube([[0.55, 0.36, z0 + 0.05], [0.52, 0.26, z0 - 0.06], [0.42, 0.22, z0 - 0.3], [0, 0.22, z0 - 0.3], [-0.42, 0.22, z0 - 0.3], [-0.52, 0.26, z0 - 0.06], [-0.55, 0.36, z0 + 0.05]], 0.012, 80, 10);
  const rackY = 0.3, rackZ = z0 - 0.14;
  const wheelPos = V3(0.372, 0.915, 0.36);
  const steer = A('Stuurinrichting', { d: 'Tandheugelbesturing met bekrachtiging, stuurkolom en stuurwiel.', ex: [0, 0.3, 0.05] }, [
    P('Stuurhuis', merge([G.cyl('x', 0.026, 0.026, 0.62, 20), xf(G.cyl('y', 0.03, 0.03, 0.09, 16), [0.26, 0.03, 0.01]), xf(G.rbox(0.05, 0.06, 0.07, 0.01), [0.2, 0, 0]), xf(G.rbox(0.05, 0.06, 0.07, 0.01), [-0.2, 0, 0])]), MAT.aluCast, { d: 'Huis van de tandheugel met rondsel.', p: [0, rackY, rackZ], ex: [0, 0, -0.14] }),
    P('Tandheugel', G.cyl('x', 0.011, 0.011, 0.8, 12), MAT.steel, { d: 'Getande staaf die de draaibeweging omzet in zijdelingse beweging.', p: [0, rackY, rackZ], ex: [0, -0.1, -0.05] }),
    P('Stuurhoes links', G.lathe('x', bellows(0.03, 0.02, 0.08, 4), 24, 'rboot'), MAT.rubber, { d: 'Stofhoes over het tandheugeluiteinde.', p: [0.31, rackY, rackZ], ex: [0.06, 0, -0.06] }),
    P('Stuurhoes rechts', G.lathe('x', bellows(0.03, 0.02, 0.08, 4), 24, 'rboot'), MAT.rubber, { d: 'Stofhoes over het tandheugeluiteinde.', p: [-0.39, rackY, rackZ], ex: [-0.06, 0, -0.06] }),
    P('Spoorstang links', rodBetween([0.39, rackY, rackZ], [0.67, 0.31, z0 - 0.163], 0.009), MAT.steel, { d: 'Verbindt de tandheugel met de stuurarm.', ex: [0.08, 0, -0.06] }),
    P('Spoorstang rechts', rodBetween([-0.39, rackY, rackZ], [-0.67, 0.31, z0 - 0.163], 0.009), MAT.steel, { d: 'Verbindt de tandheugel met de stuurarm.', ex: [-0.08, 0, -0.06] }),
    P('Spoorstangeind links', merge([G.sphere(0.018, 12), xf(G.cyl('y', 0.007, 0.007, 0.04, 8), [0, 0.02, 0])]), MAT.steel, { d: 'Kogelgewricht aan de stuurarm.', p: [0.69, 0.31, z0 - 0.165], ex: [0.12, 0.04, -0.06] }),
    P('Spoorstangeind rechts', merge([G.sphere(0.018, 12), xf(G.cyl('y', 0.007, 0.007, 0.04, 8), [0, 0.02, 0])]), MAT.steel, { d: 'Kogelgewricht aan de stuurarm.', p: [-0.69, 0.31, z0 - 0.165], ex: [-0.12, 0.04, -0.06] }),
    P('Stuurtussenas', merge([rodBetween([0.26, 0.38, z0 - 0.13], [0.34, 0.7, 0.98], 0.011), xf(G.rbox(0.04, 0.04, 0.04, 0.008), [0.26, 0.38, z0 - 0.13]), xf(G.rbox(0.04, 0.04, 0.04, 0.008), [0.34, 0.7, 0.98])]), MAT.steel, { d: 'Tussenas met twee kruiskoppelingen door het schutbord.', ex: [0.08, 0.06, 0.06] }),
    P('Stuurkolom', rodBetween([0.34, 0.7, 0.98], [0.37, 0.9, 0.4], 0.018), MAT.steel, { d: 'In hoogte en diepte verstelbare stuurkolom met kreukelzone.', ex: [0.12, 0.1, 0] }),
    P('Stuurkolomomkasting', G.rbox(0.1, 0.1, 0.28, 0.03), MAT.dash, { d: 'Kunststof omkasting rond de stuurkolom.', p: [0.367, 0.86, 0.5], r: [0.332, 0, 0], ex: [0.2, -0.04, 0] }),
    P('Stuurkolomschakelaars', merge([rodBetween([0.37, 0.89, 0.43], [0.2, 0.9, 0.43], 0.007), rodBetween([0.37, 0.89, 0.43], [0.54, 0.9, 0.43], 0.007)]), MAT.dash, { d: 'Hendels voor richtingaanwijzers, verlichting en ruitenwissers.', ex: [0, 0.14, -0.12] }),
    A('Stuurwiel', { d: 'Met leder bekleed stuurwiel met bestuurdersairbag en bedieningstoetsen.', p: wheelPos.toArray(), r: [PI + 0.332, 0, PI], ex: [0, 0.25, -0.35] }, [
      P('Stuurwielkrans', G.torus('z', 0.185, 0.016, 64, 10), MAT.leather, { d: 'Lederen stuurwielkrans.', ex: [0, 0, -0.12] }),
      P('Spaken', merge([xf(G.box(0.13, 0.03, 0.02), [-0.11, -0.01, -0.01]), xf(G.box(0.13, 0.03, 0.02), [0.11, -0.01, -0.01]), xf(G.box(0.03, 0.13, 0.02), [0, -0.11, -0.01])]), MAT.satin, { d: 'Drie spaken met satijn-aluminium afwerking.', ex: [0, 0, -0.06] }),
      P('Stuurwielnaaf', G.cyl('z', 0.03, 0.03, 0.05, 16), MAT.darkSteel, { d: 'Naaf op de spiekertanden van de stuurkolom.', p: [0, 0, -0.03], ex: [0, 0, -0.18] }),
      P('Airbagmodule bestuurder', G.rbox(0.15, 0.12, 0.05, 0.02), MAT.dash, { d: 'Bestuurdersairbag in het stuurwielcentrum.', p: [0, -0.005, 0.015], ex: [0, 0, 0.12] }),
      P('Multifunctietoetsen', merge([xf(G.rbox(0.05, 0.03, 0.01, 0.004), [-0.1, -0.005, 0.005]), xf(G.rbox(0.05, 0.03, 0.01, 0.004), [0.1, -0.005, 0.005])]), MAT.chrome, { d: 'Toetsen voor cruise control en audio.', ex: [0, 0, 0.08] }),
    ]),
  ]);
  return A('Vooras en stuurinrichting', { d: 'Subframe met McPherson-wielophanging, stabilisatorstang en tandheugelbesturing.', spec: [['Ophanging', 'McPherson, onafhankelijk'], ['Remmen voor', 'geventileerde schijven']], ex: [0, -0.25, 0.55] }, [
    P('Subframe voor', sub, MAT.darkSteel, { d: 'Hulpframe dat draagarmen, stuurhuis en motorsteun draagt.', ex: [0, -0.18, 0] }),
    P('Stabilisatorstang', arb, MAT.darkSteel, { d: 'Torsiestaaf die het overhellen in bochten beperkt.', ex: [0, -0.1, -0.18] }),
    P('Stabilisatorrubbers', merge([xf(G.rbox(0.05, 0.04, 0.04, 0.008), [0.3, 0.22, z0 - 0.3]), xf(G.rbox(0.05, 0.04, 0.04, 0.008), [-0.3, 0.22, z0 - 0.3])]), MAT.rubber, { d: 'Rubberlagers van de stabilisatorstang.', ex: [0, -0.04, -0.24] }),
    steer, frontCorner(1), frontCorner(-1),
  ]);
}
function buildRearAxle() {
  const z0 = AXR, beam = [xf(G.box(1.12, 0.07, 0.09), [0, 0.29, -1.15])];
  [1, -1].forEach(s => {
    beam.push(xf(G.box(0.06, 0.07, 0.48), [s * 0.64, 0.32, -1.195], [0, -s * 0.08, 0]));
    beam.push(xf(G.cyl('y', 0.075, 0.075, 0.012, 24), [s * 0.56, 0.26, -1.47]));
    beam.push(xf(G.box(0.12, 0.012, 0.12), [s * 0.6, 0.26, -1.45]));
    beam.push(xf(G.box(0.02, 0.12, 0.12), [s * 0.69, AY, z0]));
  });
  const damper = s => merge([rodBetween([s * 0.66, 0.27, -1.44], [s * 0.65, 0.47, -1.48], 0.022), rodBetween([s * 0.65, 0.47, -1.48], [s * 0.64, 0.62, -1.51], 0.009), xf(G.torus('x', 0.016, 0.006, 16, 6), [s * 0.66, 0.26, -1.44])]);
  return A('Achteras', { d: 'Semi-onafhankelijke torsieas (H-as) met losse veren en dempers.', spec: [['Ophanging', 'torsieas, semi-onafhankelijk'], ['Remmen achter', 'massieve schijven']], ex: [0, -0.25, -0.65] }, [
    P('Torsieas', merge(beam), MAT.darkSteel, { d: 'Stalen H-as: twee langsarmen verbonden door een torderende dwarsbalk.', ex: [0, -0.14, 0] }),
    P('Rubberlager links', G.cyl('x', 0.04, 0.04, 0.06, 20), MAT.rubber, { d: 'Draaipunt van de torsieas in de carrosserie.', p: [0.62, 0.32, -0.96], ex: [0.1, 0, 0.1] }),
    P('Rubberlager rechts', G.cyl('x', 0.04, 0.04, 0.06, 20), MAT.rubber, { d: 'Draaipunt van de torsieas in de carrosserie.', p: [-0.62, 0.32, -0.96], ex: [-0.1, 0, 0.1] }),
    P('Schroefveer achter links', spring(0.065, 0.011, 0.24, 5), MAT.steel, { d: 'Schroefveer achter.', p: [0.56, 0.39, -1.47], ex: [0, 0.32, 0] }),
    P('Schroefveer achter rechts', spring(0.065, 0.011, 0.24, 5), MAT.steel, { d: 'Schroefveer achter.', p: [-0.56, 0.39, -1.47], ex: [0, 0.32, 0] }),
    P('Schokdemper achter links', damper(1), MAT.darkSteel, { d: 'Telescopische schokdemper achter.', ex: [0.08, 0.26, -0.08] }),
    P('Schokdemper achter rechts', damper(-1), MAT.darkSteel, { d: 'Telescopische schokdemper achter.', ex: [-0.08, 0.26, -0.08] }),
    rearCorner(1), rearCorner(-1),
  ]);
}
function buildWheel(s, front) {
  const z = front ? AXF : AXR, n = (s > 0 ? 'links' : 'rechts') + (front ? 'voor' : 'achter');
  const tire = G.lathe('x', [[0.2286, -0.103], [0.25, -0.112], [0.29, -0.1145], [0.315, -0.11], [0.326, -0.1], [0.33, -0.085], [0.33, -0.062], [0.327, -0.062], [0.327, -0.052], [0.33, -0.052], [0.33, -0.018], [0.327, -0.018], [0.327, -0.008], [0.33, -0.008], [0.33, 0.008], [0.327, 0.008], [0.327, 0.018], [0.33, 0.018], [0.33, 0.052], [0.327, 0.052], [0.327, 0.062], [0.33, 0.062], [0.33, 0.085], [0.326, 0.1], [0.315, 0.11], [0.29, 0.1145], [0.25, 0.112], [0.2286, 0.103]], 72, 'tire');
  const rim = cache('rim', () => {
    const barrel = new THREE.LatheGeometry([[0.2286, -0.106], [0.236, -0.108], [0.236, -0.103], [0.229, -0.098], [0.222, -0.088], [0.205, -0.07], [0.205, 0.04], [0.214, 0.085], [0.226, 0.092], [0.236, 0.098], [0.236, 0.106], [0.2286, 0.106]].map(p => new THREE.Vector2(...p)), 72);
    const hub = new THREE.LatheGeometry([[0.028, 0.07], [0.066, 0.068], [0.072, 0.056], [0.072, 0.04], [0.028, 0.04]].map(p => new THREE.Vector2(...p)), 40);
    const spokes = [];
    for (let k = 0; k < 10; k++) {
      const sp = extrude(shapeOf([[-0.017, 0.062], [0.017, 0.062], [0.011, 0.215], [-0.011, 0.215]]), 0.02);
      sp.rotateX(-HALF); sp.rotateY(k * PI / 5); sp.translate(0, 0.052 + (k % 2) * 0.006, 0);
      spokes.push(sp);
    }
    return yTo(merge([barrel, hub, ...spokes]), 'x');
  });
  const va = 0.31;
  return A(`Wiel ${n}`, { d: 'Lichtmetalen meerspaaks velg met band 225/45 R18.', p: [s * TRACK, AY, z], s: [s, 1, 1], spec: [['Band', '225/45 R18'], ['Steekcirkel', '5 × 114,3 mm'], ['Bevestiging', 'wielbouten M14 × 1,5']], ex: [s * 1.05, -0.1, front ? 0.55 : -0.65] }, [
    P('Band', tire, MAT.rubber, { d: 'Radiaalband 225/45 R18.', ex: [-0.07, 0, 0] }),
    P('Velg', rim, MAT.alu, { d: 'Lichtmetalen 18-inch velg met tien spaken.', ex: [0.09, 0, 0] }),
    ...[0, 1, 2, 3, 4].map(k => P(`Wielbout ${k + 1}`, hexBolt(0.06, 0.012, '-x'), MAT.steel, { d: 'Wielbout M14 × 1,5.', p: [0.072, 0.0572 * Math.cos(k * PI * 0.4), 0.0572 * Math.sin(k * PI * 0.4)], ex: [0.26, 0, 0] })),
    P('Naafdop', G.lathe('x', [[0, 0.012], [0.02, 0.01], [0.03, 0.003], [0.03, 0], [0, 0]], 32, 'cap'), MAT.chrome, { d: 'Afdekkap van het velgcentrum.', p: [0.074, 0, 0], ex: [0.34, 0, 0] }),
    P('Ventiel', G.cyl('x', 0.005, 0.0045, 0.035, 10), MAT.rubber, { d: 'Bandenventiel.', p: [0.075, 0.21 * Math.cos(va), 0.21 * Math.sin(va)], ex: [0.18, 0.06, 0.02] }),
    P('Bandenspanningssensor', G.rbox(0.03, 0.015, 0.04, 0.005), MAT.ecu, { d: 'Sensor aan het ventiel die de bandenspanning doorgeeft.', p: [0.045, 0.2 * Math.cos(va), 0.2 * Math.sin(va)], ex: [0.12, 0.12, 0.04] }),
  ]);
}
function buildBrakeSystem() {
  const lines = merge([
    tube([[0.18, 0.7, 1.12], [0.5, 0.66, 1.12], [0.66, 0.62, 1.2], [0.7, 0.46, AXF - 0.08]], 0.004, 40, 6),
    tube([[0.16, 0.7, 1.12], [-0.4, 0.66, 1.12], [-0.66, 0.62, 1.2], [-0.7, 0.46, AXF - 0.08]], 0.004, 50, 6),
    tube([[0.2, 0.68, 1.08], [0.24, 0.3, 1.0], [0.25, 0.16, 0.6], [0.25, 0.16, -0.9], [0.5, 0.22, -1.3], [0.7, 0.42, AXR - 0.1]], 0.004, 90, 6),
    tube([[0.19, 0.68, 1.08], [0.21, 0.3, 1.0], [0.21, 0.16, 0.6], [0.21, 0.16, -0.9], [-0.4, 0.22, -1.3], [-0.7, 0.42, AXR - 0.1]], 0.004, 90, 6),
  ]);
  const epbX = 0.33, epbZ = -0.95;
  return A('Remsysteem', { d: 'Hydraulisch remsysteem met bekrachtiger, ABS/ESP en de automatische parkeerrem.', ex: [1.55, 0.55, 1.0] }, [
    P('Rembekrachtiger', G.lathe('z', [[0.03, -0.09], [0.12, -0.07], [0.125, -0.02], [0.125, 0.02], [0.12, 0.07], [0.03, 0.09]], 40, 'boost'), MAT.darkSteel, { d: 'Vacuümbekrachtiger die de pedaalkracht versterkt.', p: [0.4, 0.76, 1.08], ex: [0, 0.1, -0.1] }),
    P('Hoofdremcilinder', G.cyl('z', 0.03, 0.03, 0.16, 20), MAT.alu, { d: 'Zet de pedaalkracht om in hydraulische druk.', p: [0.4, 0.76, 1.25], ex: [0, 0.06, 0.12] }),
    P('Remvloeistofreservoir', merge([G.rbox(0.12, 0.07, 0.08, 0.012), xf(G.cyl('y', 0.022, 0.022, 0.02, 16), [0.03, 0.045, 0])]), MAT.tank, { d: 'Voorraadbak met remvloeistof.', p: [0.4, 0.825, 1.24], ex: [0, 0.16, 0.12] }),
    P('ABS/ESP-unit', merge([G.rbox(0.14, 0.1, 0.12, 0.01), xf(G.cyl('x', 0.035, 0.035, 0.07, 16), [-0.1, 0, 0])]), MAT.alu, { d: 'Hydraulische modulator met pomp en regelkleppen voor ABS en ESP.', p: [0.18, 0.72, 1.1], ex: [-0.1, 0.12, 0] }),
    P('Remleidingen', lines, MAT.steel, { d: 'Stalen remleidingen naar de vier wielen.', ex: [0, -0.06, 0] }),
    A('Parkeerrem', { d: 'Automatische parkeerrem: een unit onder de auto met één elektromotor die via een wormwiel twee kabels naar de achterremmen spant.', ex: [0, -0.3, 0] }, [
      P('Behuizing parkeerremunit', G.rbox(0.18, 0.07, 0.14, 0.012), MAT.plastic, { d: 'Afgedichte behuizing onder de auto.', p: [epbX, 0.13, epbZ], ex: [0, -0.12, 0] }),
      P('Elektromotor met wormwiel', merge([G.cyl('x', 0.022, 0.022, 0.07, 16), xf(spring(0.008, 0.003, 0.05, 6, 'x'), [0.06, 0, 0])]), MAT.steel, { d: 'Motor die via een wormwiel de kabels aantrekt of loslaat.', p: [epbX - 0.02, 0.13, epbZ], ex: [0, 0.03, 0.1] }),
      P('Printplaat parkeerrem', G.box(0.12, 0.004, 0.09), MAT.ecu, { d: 'Elektronica die de parkeerrem aanstuurt.', p: [epbX, 0.155, epbZ], ex: [0, 0.1, 0] }),
      P('Parkeerremkabel links', tube([[epbX + 0.06, 0.13, epbZ - 0.05], [0.55, 0.2, -1.2], [0.72, 0.38, AXR - 0.1]], 0.004, 40, 6), MAT.darkSteel, { d: 'Kabel naar de linker achterrem.', ex: [0.06, 0, 0] }),
      P('Parkeerremkabel rechts', tube([[epbX - 0.06, 0.13, epbZ - 0.05], [-0.2, 0.17, -1.2], [-0.72, 0.38, AXR - 0.1]], 0.004, 40, 6), MAT.darkSteel, { d: 'Kabel naar de rechter achterrem.', ex: [-0.06, 0, 0] }),
    ]),
  ]);
}

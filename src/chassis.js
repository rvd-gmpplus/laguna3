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
// afgeronde doos alleen voor grote, goed zichtbare delen; kleine delen blijven gewone dozen (driehoekenbudget)
const chsRb = (w, h, d, r) => (Math.min(w, h, d) >= 0.045 && r >= 0.01 ? G.rbox(w, h, d, r) : G.box(w, h, d));
const chsFlip = g => xf(g, [0, 0, 0], [PI, 0, 0]);                     // bout met kop boven, steel omlaag
function chsClamp(ax, R) { return merge([G.torus(ax, R, 0.0018, 20, 4), xf(G.box(0.008, 0.008, 0.008), [R + 0.003, 0, 0])]); }

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
    xf(chsRb(0.036, hh, w, 0.007), [-0.048, hc, 0]),
    xf(G.cyl('x', pr + 0.007, pr + 0.007, 0.014, 20), [-0.067, py, 0]),
    xf(chsRb(0.016, hh, w, 0.005), [0.0365, hc, 0]),
    xf(chsRb(0.075, 0.020, 0.022, 0.005), [0, hy1 - 0.010, w / 2 - 0.011]),
    xf(chsRb(0.075, 0.020, 0.022, 0.005), [0, hy1 - 0.010, -(w / 2 - 0.011)]),
    xf(chsRb(0.030, 0.026, 0.026, 0.005), [-0.040, yp, zl]),
    xf(chsRb(0.030, 0.026, 0.026, 0.005), [-0.040, yp, -zl])]);
  const carrier = merge([
    xf(chsRb(0.014, hh + 0.012, 0.150, 0.004), [-0.083, hc, 0]),
    xf(chsRb(0.113, 0.030, 0.014, 0.003), [-0.0265, hy0 + 0.014, zl]),
    xf(chsRb(0.113, 0.030, 0.014, 0.003), [-0.0265, hy0 + 0.014, -zl])]);
  const pad = (nm, sg, d) => A(nm, { d, ex: [sg * (front ? 0.075 : 0.07), 0.13, 0] }, [
    P('Rugplaat', G.box(0.005, ph, pw), MAT.steel, { d: 'Stalen rugplaat van het remblok.', p: [sg * 0.0255, py, 0], ex: [sg * 0.01, 0, 0] }),
    P('Remvoering', chsRb(0.010, ph - 0.004, pw - 0.006, 0.0015), MAT.friction, { d: 'Wrijvingsmateriaal dat tegen de schijf wrijft.', p: [sg * 0.018, py, 0], ex: [-sg * 0.012, 0, 0] }),
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
    ...[1, -1].map(sg => P(`Drager bout ${sg > 0 ? 1 : 2}`, hexBolt(0.032, 0.012, '-x'), MAT.steel, { d: 'Bout die de remklauwdrager op de fusee houdt.', p: [-0.076, hy0 + 0.010, sg * 0.066], ex: [0.08, -0.02, sg * 0.04] }))];
  if (!front) kids.push(
    P('Stelmechanisme', merge([G.cyl('x', 0.008, 0.008, 0.024, 10), xf(G.cyl('x', 0.013, 0.013, 0.006, 12), [0.012, 0, 0])]), MAT.darkSteel, { d: 'Spindel met stelmoer in de zuiger: draait de zuiger uit bij het aantrekken van de parkeerrem en stelt de blokspeling bij (schematisch).', p: [-0.052, py, 0], ex: [-0.12, 0, 0], inner: true }),
    P('Parkeerremhefboom', merge([G.cyl('x', 0.006, 0.006, 0.020, 10), xf(chsRb(0.008, 0.050, 0.014, 0.003), [-0.0, py - 0.022, 0])]), MAT.steel, { d: 'Hefboom op het klauwhuis; de parkeerremkabel trekt hem aan en draait de zuigerspindel.', p: [-0.074, py, 0], ex: [-0.1, -0.06, 0] }),
    P('Kabelhouder', chsRb(0.012, 0.012, 0.022, 0.003), MAT.darkSteel, { d: 'Beugel op het klauwhuis die de buitenkabel van de parkeerrem vasthoudt.', p: [-0.062, hy0 + 0.0, -0.032], ex: [-0.08, -0.08, -0.05] }),
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
    P('Borgkraag', annulus(0.0165, 0.0215, 0.002, 'x', 18), MAT.darkSteel, { d: 'Dunne ring die de asmoer borgt doordat hij in een gleuf wordt geslagen.', p: [xm + 0.0075, AY, z0], ex: [0.3, 0, 0] }),
    A('Wiellagereenheid', { d: 'Gesloten naaflagereenheid (generatie 2): dubbelrijig kogellager met magnetische ABS-codeerring in de afdichting; aannemelijk volgens onderdelenlijsten, uitwendige maten schematisch.', ex: [-0.1, 0.12, 0] }, [
      P('Lagerbuitenring', merge([G.lathe('x', [[0.031, -0.085], [0.0425, -0.085], [0.0425, -0.036], [0.054, -0.036], [0.054, -0.027], [0.031, -0.027], [0.031, -0.085]], 36, 'chsBrg')]), MAT.bearing, { d: 'Buitenring met flens; zit met drie bouten aan de ' + (front ? 'fusee' : 'astapflens') + '.', p: [xm, AY, z0], ex: [-0.08, 0, 0] }),
      P('Lagerbinnenring', G.lathe('x', [[0.0275, -0.095], [0.031, -0.095], [0.031, -0.024], [0.0275, -0.024], [0.0275, -0.095]], 28, 'chsBri'), MAT.steel, { d: 'Binnenring die om de naaf zit.', p: [xm, AY, z0], ex: [0.0, 0.06, 0] }),
      P('Kogelkrans buiten', G.torus('x', 0.0295, 0.0042, 20, 5), MAT.chrome, { d: 'Rij lagerkogels aan de wielzijde (schematisch als ring weergegeven).', p: [xm - 0.035, AY, z0], ex: [0.0, 0.1, 0] }),
      P('Kogelkrans binnen', G.torus('x', 0.0295, 0.0042, 20, 5), MAT.chrome, { d: 'Tweede rij lagerkogels aan de aandrijfzijde (schematisch als ring weergegeven).', p: [xm - 0.062, AY, z0], ex: [0.0, 0.14, 0] }),
      P('Magnetische ABS-codeerring', annulus(0.0315, 0.0375, 0.004, 'x', 28), MAT.plasticGrey, { d: 'Kunststof ring met magnetische polen in de lagerafdichting; geeft de wielsnelheid aan de ABS-sensor (geen getande ring).', p: [xm - 0.0905, AY, z0], ex: [-0.1, 0, 0] })]),
    ...[0, 1, 2].map(k => P(`Lagerbout ${k + 1}`, hexBolt(0.05, 0.009, 'x'), MAT.steel, { d: 'Bout die de lagereenheid van binnenuit op de ' + (front ? 'fusee' : 'astapflens') + ' trekt.', p: [xm - (front ? 0.0815 : 0.098), AY + 0.0485 * Math.cos(k * PI * 2 / 3 + 1.9), z0 + 0.0485 * Math.sin(k * PI * 2 / 3 + 1.9)], ex: [-0.13, 0.03 * (k - 1), 0.03] }))
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
    xf(chsRb(0.05, 0.12, 0.012, 0.004), [SP.x + 0.01, SP.y + 0.025, z0 + 0.034]), xf(chsRb(0.05, 0.12, 0.012, 0.004), [SP.x + 0.01, SP.y + 0.025, z0 - 0.034]),
    rodBetween([rcx - 0.012, AY - 0.04, z0], [bj[0], bj[1] - 0.012, bj[2]], 0.02),
    xf(G.cyl('y', 0.024, 0.024, 0.034, 18), [bj[0], bj[1] + 0.005, bj[2]]),
    rodBetween([rcx - 0.012, AY - 0.02, z0 - 0.03], [tr[0], tr[1] - 0.012, tr[2]], 0.014),
    xf(G.cyl('y', 0.018, 0.018, 0.03, 14), [tr[0], tr[1], tr[2]]),
    rodBetween([rcx - 0.015, AY + 0.03, z0 + 0.03], [0.683, AY + 0.052, z0 + 0.095], 0.013),
    xf(chsRb(0.014, 0.05, 0.14, 0.004), [0.683, AY + 0.052, z0 + 0.095])]);
  const seat = (sg, key) => G.lathe('y', [[0.022, 0], [0.078, sg * 0.003], [0.08, sg * 0.01], [0.076, sg * 0.012], [0.022, sg * 0.006]], 32, key);
  const strut = A(`Veerpoot ${n}`, { d: 'McPherson-veerpoot: bitube-schokdemper (huis Ø50 mm, zuigerstang Ø22 mm) met schroefveer, tevens fuseedraaipunt; de top zit in de veerpoottoren, de voet in de fuseeklem.', spec: [['Demperhuis', 'Ø 50 mm'], ['Zuigerstang', 'Ø 22 mm']], p: SP.toArray(), q: quatFromTo(V3(0, 1, 0), SD), ex: [0.1, 0.34, 0] }, [
    P('Demperbuis', merge([xf(G.cyl('y', 0.025, 0.025, 0.315, 22), [0, 0.1125, 0]), xf(chsRb(0.02, 0.02, 0.026, 0.003), [-0.006, 0.095, -0.038]), xf(G.cyl('y', 0.019, 0.019, 0.01, 18), [0, -0.05, 0])]), MAT.darkSteel, { d: 'Buis van de bitube-schokdemper (Ø50 mm) met aangelaste klemtong voor de koppelstang.', ex: [0, -0.2, 0] }),
    P('Zuigerstang', G.cyl('y', 0.011, 0.011, 0.19, 14), MAT.chrome, { d: 'Verchroomde zuigerstang Ø22 mm.', p: [0, 0.295, 0], ex: [0, 0.02, 0] }),
    P('Veerschotel onder', seat(1, 'chsSeatL'), MAT.darkSteel, { d: 'Onderste veerschotel, aan de demperbuis gelast.', p: [0, 0.105, 0], ex: [0, -0.06, 0] }),
    P('Veerrubber onder', annulus(0.052, 0.074, 0.004, 'y', 28), MAT.rubber, { d: 'Rubber tussenlaag tussen veer en onderste schotel.', p: [0, 0.114, 0], ex: [0, -0.03, 0], inner: true }),
    P('Schroefveer voor', spring(0.066, 0.0068, 0.2, 5.5), MAT.chsSpring, { d: 'Draagt het voorgewicht van de auto.', p: [0, 0.21, 0] }),
    P('Stofhoes veerpoot', G.lathe('y', bellows(0.032, 0.026, 0.115, 5), 22, 'chsDb'), MAT.rubber, { d: 'Balg over de zuigerstang die vuil uit de demper houdt.', p: [0, 0.165, 0], ex: [0.16, 0.02, 0] }),
    P('Aanslagrubber', G.cyl('y', 0.024, 0.021, 0.04, 16), MAT.rubber, { d: 'Vangt het inveren aan het einde van de slag op.', p: [0, 0.285, 0], ex: [0.2, 0.06, 0] }),
    P('Veerschotel boven', seat(-1, 'chsSeatU'), MAT.darkSteel, { d: 'Bovenste veerschotel.', p: [0, 0.318, 0], ex: [0, 0.08, 0] }),
    P('Veerrubber boven', annulus(0.052, 0.074, 0.004, 'y', 28), MAT.rubber, { d: 'Rubber tussenlaag tussen veer en bovenste schotel.', p: [0, 0.31, 0], ex: [0, 0.05, 0] }),
    P('Veerpootlager', annulus(0.03, 0.052, 0.014, 'y', 28), MAT.bearing, { d: 'Axiaal draaglager zodat de veerpoot met het stuur mee kan draaien.', p: [0, 0.331, 0], ex: [0, 0.12, 0] }),
    P('Veerpootsteunlager', G.lathe('y', [[0.012, 0], [0.06, 0], [0.062, 0.016], [0.045, 0.026], [0.012, 0.026]], 28, 'chsTopm'), MAT.rubber, { d: 'Rubber-metalen topsteun: koppelt de veerpoot aan de veerpoottoren en dempt trillingen.', p: [0, 0.34, 0], ex: [0, 0.18, 0] }),
    P('Veerpootmoer', chsNut('y', 0.0125, 0.012), MAT.steel, { d: 'Zelfborgende moer bovenop de zuigerstang.', p: [0, 0.372, 0], ex: [0, 0.26, 0] }),
    P('Topsteunmoeren', merge([0, 1, 2].map(k => xf(chsNut('y', 0.0075, 0.009), [0.045 * Math.cos(k * PI * 2 / 3 + 0.5), 0, 0.045 * Math.sin(k * PI * 2 / 3 + 0.5)]))), MAT.steel, { d: 'Drie moeren waarmee de topsteun aan de veerpoottoren zit.', p: [0, 0.368, 0], ex: [0, 0.32, 0] }),
    ...[[0.0, -0.005], [0.0, 0.05]].flatMap(([_, u], i) => [
      P(`Fuseebout ${i + 1}`, hexBolt(0.086, 0.012, 'z'), MAT.steel, { d: 'Klembout die de veerpoot in de fuseeklem vastzet.', p: [0, u, -0.044], ex: [0, 0, -0.12 - i * 0.04] }),
      P(`Fuseemoer ${i + 1}`, chsNut('z', 0.0105, 0.011), MAT.steel, { d: 'Zelfborgende moer van de fuseebout.', p: [0, u, 0.0425], ex: [0, 0, 0.14 + i * 0.04] })])]);
  const hubs = chsHub(xm, z0, true);
  // schijf en bijbehoren
  const shield = G.lathe('x', [[0.052, 0], [0.12, 0.004], [0.14, 0.012], [0.14, 0.0], [0.052, -0.002]], 40, 'chsShF');
  const bjk = chsPt(CM, [-0.045, 0.059, 0.028]), bjt = [0.61, 0.546, z0 + 0.052];
  const pa = Math.PI * 2 / 3;
  return A(`Wielophanging ${n}`, { d: `Wielophanging ${n}: fusee met naaf en lagereenheid, McPherson-veerpoot, onderste draagarm, koppelstang, geventileerde remschijf 296 × 26 mm met zwevende klauw.`, s: [s, 1, 1], ex: [s * 0.34, 0, 0] }, [
    P('Fusee', knuckle, MAT.iron, { d: 'Fusee (wieldrager): draagt het naaflager, klemt de veerpoot, bevat de kogel van de draagarm, de stuurarm voor de spoorstang en de oren voor de remklauwdrager. Materiaal: nodulair gietijzer (geschat, niet gevonden in de bronnen).', ex: [0, 0.02, 0] }),
    ...hubs,
    P('Remschijf voor', discGeo(0.093, 0.148, true, 'F', 0.046), MAT.iron, { d: 'Geventileerde remschijf 296 × 26 mm (vijf gaten, steek 114,3 mm, middengat Ø68 mm).', spec: [['Diameter', '296 mm'], ['Dikte', '26 mm'], ['Type', 'geventileerd']], p: [xd, AY, z0], ex: [0.14, 0, 0] }),
    P('Stofschild voor', shield, MAT.darkSteel, { d: 'Stalen schild achter de remschijf tegen steenslag en vuil.', p: [xm - 0.063, AY, z0], ex: [-0.06, 0, 0] }),
    ...[0, 1, 2].map(k => P(`Schildbout ${k + 1}`, hexBolt(0.016, 0.007, 'x'), MAT.steel, { d: 'Bout van het stofschild.', p: [xm - 0.082, AY + 0.065 * Math.cos(k * pa + 0.7), z0 + 0.065 * Math.sin(k * pa + 0.7)], ex: [-0.12, 0, 0.02 * k] })),
    P('Wielsnelheidssensor', merge([G.cyl('x', 0.0065, 0.0065, 0.04, 10), xf(chsRb(0.012, 0.016, 0.022, 0.003), [-0.024, 0.0, 0.0])]), MAT.plastic, { d: 'Passieve magnetoresistieve sensor die het wiel-sensorsignaal uit de magnetische codeerring leest.', p: [xm - 0.104, AY + 0.034, z0], ex: [-0.14, 0.08, 0.05] }),
    P('Sensorkabel', tube([[xm - 0.128, AY + 0.034, z0 + 0.012], [0.66, AY + 0.1, z0 + 0.03], [0.625, 0.5, z0 + 0.034]], 0.0032, 20, 5), MAT.rubber, { d: 'Kabel van de wielsnelheidssensor naar de kabelboom, vastgeklikt langs de veerpoot.', ex: [-0.08, 0.14, 0.08] }),
    P('Sensorklem', chsRb(0.014, 0.012, 0.01, 0.002), MAT.plasticGrey, { d: 'Kunststof klem die de sensorkabel aan de veerpoot houdt.', p: [0.625, 0.5, z0 + 0.034], ex: [-0.06, 0.18, 0.1] }),
    A('Draagarm', { d: 'Onderste draagarm (dwarsarm) tussen het subframe en de fusee: staal, met twee rubberlagers en een kogelgewricht.', ex: [0, -0.16, 0] }, [
      P('Draagarmplaat', plan(shapeOf([[0.405, z0 + 0.04], [0.405, z0 - 0.2], [0.46, z0 - 0.23], [0.735, z0 - 0.02], [0.735, z0 + 0.04]]), 0.025), MAT.darkSteel, { d: 'Geperste stalen A-vormige arm.', p: [0, 0.225, 0] }),
      P('Draagarmrubber voor', G.cyl('z', 0.022, 0.022, 0.05, 16), MAT.rubber, { d: 'Rubberlager waarmee de arm aan het subframe scharniert.', p: [0.405, 0.225, z0 + 0.015], ex: [-0.12, 0, 0.1] }),
      P('Draagarmrubber achter', G.cyl('y', 0.03, 0.03, 0.04, 18), MAT.rubber, { d: 'Groter rubberlager aan de achterzijde van de arm.', p: [0.44, 0.225, z0 - 0.19], ex: [-0.12, 0, -0.12] }),
      P('Voorste armbout', hexBolt(0.09, 0.014, 'z'), MAT.steel, { d: 'Scharnierbout door het voorste rubberlager.', p: [0.405, 0.225, z0 - 0.025], ex: [-0.1, 0, -0.2] }),
      P('Achterste armbout', hexBolt(0.07, 0.014, 'y'), MAT.steel, { d: 'Scharnierbout door het achterste rubberlager.', p: [0.44, 0.245, z0 - 0.19], ex: [-0.1, 0.2, -0.1] }),
      P('Fuseekogel', merge([G.sphere(0.02, 14), xf(G.cyl('y', 0.011, 0.011, 0.045, 10), [0, -0.022, 0]), xf(G.cyl('y', 0.019, 0.017, 0.03, 14), [0, 0.016, 0])]), MAT.steel, { d: 'Kogelgewricht tussen draagarm en fusee; de stift gaat door de arm.', p: [bj[0], 0.222, bj[2]], ex: [0.05, -0.1, 0] }),
      P('Kogelstofhoes', G.lathe('y', bellows(0.022, 0.016, 0.026, 3), 16, 'chsKb'), MAT.rubber, { d: 'Rubber hoes over het kogelgewricht.', p: [bj[0], 0.236, bj[2]], ex: [0.1, 0.04, 0] }),
      P('Kroonmoer', merge([chsNut('y', 0.0115, 0.013), xf(G.box(0.004, 0.006, 0.024), [0, 0.0085, 0])]), MAT.steel, { d: 'Kroonmoer van de kogelstift.', p: [bj[0], 0.205, bj[2]], ex: [0, -0.18, 0] }),
      P('Splitpen', tube([[0, 0.0, -0.011], [0, 0.0, 0.011], [0.0, 0.004, 0.012]], 0.0012, 8, 4), MAT.steel, { d: 'Splitpen die de kroonmoer borgt.', p: [bj[0], 0.186, bj[2]], ex: [0, -0.26, 0] })]),
    A('Koppelstang', { d: 'Koppelstang tussen stabilisatorstang en veerpoot; draagt de rolstijfheid over op de veerpoot.', ex: [0.05, 0.04, 0.12] }, [
      P('Staaf', rodBetween([0.557, 0.29, z0 - 0.05], [0.613, 0.49, z0 - 0.046], 0.0065), MAT.steel, { d: 'Stalen staaf van de koppelstang.', ex: [0, 0, 0] }),
      P('Kogelgewricht onder', merge([G.sphere(0.013, 12), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, -0.012, 0])]), MAT.steel, { d: 'Kogelgewricht aan de stabilisatorstang.', p: [0.557, 0.29, z0 - 0.05], ex: [0, -0.1, 0] }),
      P('Kogelgewricht boven', merge([G.sphere(0.013, 12), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, 0.012, 0])]), MAT.steel, { d: 'Kogelgewricht aan de klemtong van de demperbuis.', p: [0.613, 0.49, z0 - 0.046], ex: [0, 0.1, 0] }),
      P('Koppelstangmoer onder', chsNut('y', 0.0085, 0.008), MAT.steel, { d: 'Moer onderaan.', p: [0.557, 0.274, z0 - 0.05], ex: [0, -0.2, 0] }),
      P('Koppelstangmoer boven', chsNut('y', 0.0085, 0.008), MAT.steel, { d: 'Moer bovenaan.', p: [0.613, 0.51, z0 - 0.046], ex: [0, 0.2, 0] })]),
    strut,
    caliper(`Remklauw ${n}`, xd, z0, phi, rp, true),
    A('Remslang voor', { d: 'Flexibele remslang van de vaste remleiding op de veerpoot naar de klauw, vastgezet met een holle (banjo) bout en twee koperen ringen.', ex: [0.04, 0.12, 0.1] }, [
      P('Remslang', tube([bjk, chsPt(CM, [-0.045, 0.1, 0.028]), [0.64, 0.45, z0 + 0.11], bjt], 0.0055, 28, 8), MAT.rubber, { d: 'Flexibele, wapeningsversterkte remslang.', ex: [0, 0.06, 0] }),
      P('Banjo-oog', merge([G.torus('y', 0.008, 0.0035, 14, 6), xf(G.cyl('z', 0.004, 0.004, 0.02, 8), [0, 0, 0.016])]), MAT.steel, { d: 'Slangeinde met oog dat om de holle bout past.', p: chsPt(CM, [-0.045, 0.0545, 0.028]), r: [HALF - phi, 0, 0], ex: [0, 0.1, 0.04] }),
      P('Holle bout', chsFlip(hexBolt(0.016, 0.0085, 'y')), MAT.steel, { d: 'Holle bout (banjo) waardoor de remvloeistof het klauwhuis in gaat.', p: chsPt(CM, [-0.045, 0.0605, 0.028]), r: [HALF - phi, 0, 0], ex: [0, 0.2, 0] }),
      P('Koperringen', merge([annulus(0.0045, 0.0085, 0.0015, 'y', 14), xf(annulus(0.0045, 0.0085, 0.0015, 'y', 14), [0, 0.009, 0])]), MAT.copper, { d: 'Twee koperen afdichtringen: onder en boven het banjo-oog.', p: chsPt(CM, [-0.045, 0.0495, 0.028]), r: [HALF - phi, 0, 0], ex: [0, 0.14, 0.02] }),
      P('Slangbeugel', chsRb(0.016, 0.014, 0.02, 0.003), MAT.darkSteel, { d: 'Beugel op de veerpoot waar de flexibele slang overgaat in de vaste remleiding.', p: bjt, ex: [0.04, 0.1, 0.1] })])
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
    P('Astapflens', merge([xf(chsRb(0.012, 0.15, 0.15, 0.01), [xm - 0.092 - 0.0, AY, z0]), xf(G.cyl('x', 0.05, 0.05, 0.044, 26), [xm - 0.058, AY, z0])]), MAT.iron, { d: 'Flens met astaphuis die aan het uiteinde van de langsarm is geschroefd; draagt het naaflager.', ex: [-0.1, 0.02, 0] }),
    ...[0, 1, 2, 3].map(k => P(`Flensbout ${k + 1}`, hexBolt(0.03, 0.011, '-x'), MAT.steel, { d: 'Bout die de astapflens aan de langsarm houdt.', p: [xm - 0.086, AY + 0.052 * (k < 2 ? 1 : -1), z0 + 0.052 * (k % 2 ? 1 : -1)], ex: [-0.2, 0.02 * (k - 1.5), 0.02 * (k - 1.5)] })),
    ...hubs,
    P('Remschijf achter', discGeo(0.082, 0.150, false, 'R', 0.040), MAT.iron, { d: 'Massieve remschijf 300 × 11 mm.', spec: [['Diameter', '300 mm'], ['Dikte', '11 mm'], ['Type', 'massief']], p: [xd, AY, z0], ex: [0.12, 0, 0] }),
    P('Stofschild achter', shield, MAT.darkSteel, { d: 'Afschermplaat achter de remschijf.', p: [xm - 0.063, AY, z0], ex: [-0.06, 0, 0] }),
    ...[0, 1, 2].map(k => P(`Schildbout ${k + 1}`, hexBolt(0.016, 0.007, 'x'), MAT.steel, { d: 'Bout van het stofschild.', p: [xm - 0.082, AY + 0.065 * Math.cos(k * pa + 0.7), z0 + 0.065 * Math.sin(k * pa + 0.7)], ex: [-0.12, 0, 0.02 * k] })),
    P('Wielsnelheidssensor achter', merge([G.cyl('x', 0.0065, 0.0065, 0.04, 10), xf(chsRb(0.012, 0.016, 0.022, 0.003), [-0.024, 0, 0])]), MAT.plastic, { d: 'Passieve magnetoresistieve sensor, leest de magnetische codeerring in het naaflager.', p: [xm - 0.118, AY + 0.034, z0], ex: [-0.14, 0.08, 0.05] }),
    P('Sensorkabel achter', tube([[xm - 0.14, AY + 0.034, z0 + 0.012], [0.6, AY + 0.04, z0 + 0.1], [0.58, 0.36, z0 + 0.2]], 0.0032, 18, 5), MAT.rubber, { d: 'Kabel van de achterste wielsnelheidssensor naar de kabelboom.', ex: [-0.08, 0.14, 0.08] }),
    caliper(`Remklauw ${n}`, xd, z0, phi, rp, false),
    A('Remslang achter', { d: 'Flexibele remslang van de vaste remleiding op de langsarm naar de klauw, met holle (banjo) bout en twee koperen ringen.', ex: [0.04, 0.12, -0.1] }, [
      P('Remslang', tube([bjk, chsPt(CM, [-0.1, 0.075, 0.026]), [0.64, 0.46, z0 - 0.15], bjt], 0.0055, 28, 8), MAT.rubber, { d: 'Flexibele, wapeningsversterkte remslang.', ex: [0, 0.06, 0] }),
      P('Banjo-oog', merge([G.torus('y', 0.008, 0.0035, 14, 6), xf(G.cyl('z', 0.004, 0.004, 0.02, 8), [0, 0, 0.016])]), MAT.steel, { d: 'Slangeinde met oog dat om de holle bout past.', p: chsPt(CM, [-0.045, 0.0565, 0.026]), r: [HALF - phi, 0, 0], ex: [0, 0.1, 0.04] }),
      P('Holle bout', chsFlip(hexBolt(0.016, 0.0085, 'y')), MAT.steel, { d: 'Holle bout (banjo) waardoor de remvloeistof het klauwhuis in gaat.', p: chsPt(CM, [-0.045, 0.061, 0.026]), r: [HALF - phi, 0, 0], ex: [0, 0.2, 0] }),
      P('Koperringen', merge([annulus(0.0045, 0.0085, 0.0015, 'y', 14), xf(annulus(0.0045, 0.0085, 0.0015, 'y', 14), [0, 0.009, 0])]), MAT.copper, { d: 'Twee koperen afdichtringen: onder en boven het banjo-oog.', p: chsPt(CM, [-0.045, 0.0515, 0.026]), r: [HALF - phi, 0, 0], ex: [0, 0.14, 0.02] }),
      P('Slangbeugel', chsRb(0.016, 0.014, 0.02, 0.003), MAT.darkSteel, { d: 'Beugel op de langsarm waar de flexibele slang overgaat in de vaste remleiding.', p: bjt, ex: [0.04, 0.1, -0.1] })])
  ]);
}
// poorten van de motor (stuurpomp); terugval op de afgesproken waarden als de motor ze (nog) niet kent
function chsPort(key, fb) {
  const pt = ENG_PORTS[key] || fb, dir = V3(...pt.dir).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(PT_TILT, 0, 0))).normalize();
  return { p: ENG2CAR(pt.p), dir };
}
function chsTieRod(s, z0, rackY, rackZ) {
  const inner = [0.405, rackY, rackZ], outer = [0.664, 0.298, z0 - 0.164], dir = V3(...outer).sub(V3(...inner)).normalize();
  const nutP = V3(...outer).addScaledVector(dir, -0.03).toArray(), q = quatFromTo(V3(1, 0, 0), dir);
  const sd = s > 0 ? 'links' : 'rechts';
  return A(`Spoorstang ${sd}`, { d: 'Spoorstang met binnenste kogelgewricht aan de tandheugel en buitenste spoorstangeind aan de stuurarm van de fusee; de lengte (draadeinde M14 × 1,5) stelt het toe-in af.', s: [s, 1, 1], ex: [s * 0.1, 0, -0.1] }, [
    P('Binnenkogel', merge([G.sphere(0.017, 14), xf(G.cyl('x', 0.013, 0.013, 0.04, 14), [0.026, 0, 0])]), MAT.steel, { d: 'Binnenste kogelgewricht van de spoorstang, geschroefd op het tandheugeluiteinde.', p: [0.39, rackY, rackZ], ex: [-0.04, 0, 0.0] }),
    P('Spoorstang', rodBetween(inner, outer, 0.0085, 10), MAT.steel, { d: 'Stalen spoorstang met draadeinde M14 × 1,5.', ex: [0.06, 0, -0.04] }),
    P('Contramoer', chsNut('x', 0.0125, 0.012), MAT.steel, { d: 'Contramoer die de ingestelde spoorlengte borgt.', p: nutP, q, ex: [0.08, 0.06, 0] }),
    P('Spoorstangeind', merge([G.sphere(0.016, 14), rodBetween([-0.036, 0.016, 0.0], [0, 0, 0], 0.011, 10), xf(G.cyl('y', 0.007, 0.0095, 0.058, 12), [0, 0.03, 0])]), MAT.steel, { d: 'Buitenste kogelgewricht; de conische stift zit in de stuurarm van de fusee.', p: [0.70, 0.282, z0 - 0.165], ex: [0.12, -0.04, 0] }),
    P('Kroonmoer', merge([chsNut('y', 0.0105, 0.012), xf(G.box(0.004, 0.006, 0.022), [0, 0.008, 0])]), MAT.steel, { d: 'Kroonmoer op de stift van het spoorstangeind.', p: [0.70, 0.337, z0 - 0.165], ex: [0, 0.16, 0] }),
    P('Splitpen', tube([[0, 0, -0.01], [0, 0, 0.01], [0, 0.004, 0.011]], 0.0012, 8, 4), MAT.steel, { d: 'Splitpen die de kroonmoer borgt.', p: [0.70, 0.3375, z0 - 0.165], ex: [0, 0.24, 0] })]);
}
function buildFrontAxle() {
  const z0 = AXF, rackY = 0.325, rackZ = z0 - 0.14, pinX = 0.26;
  const pOut = chsPort('psOut', { p: [-0.27, -0.07, 0.275], dir: [0, -1, 0] }), pIn = chsPort('psIn', { p: [-0.30, 0.0, 0.31], dir: [0, 0, 1] });
  const vh = [pinX, rackY + 0.07, rackZ + 0.005];                           // ventielhuis (draaiafsluiter) boven op het rondsel
  const vP = [vh[0] - 0.012, vh[1] + 0.012, vh[2] - 0.055], vR = [vh[0] + 0.012, vh[1] + 0.012, vh[2] - 0.055];   // aansluitingen achter op het ventielhuis (druk, retour)
  const R0 = V3(-0.585, 0.675, 1.69);                                          // oliereservoir stuurbekrachtiging
  // ---- subframe ----
  const sub = A('Subframe', { d: 'Stalen hulpframe onder de motor: draagt de draagarmen, de stabilisatorstang en (via rubbers) het stuurhuis; vier rubberlagers met bouten op de carrosserie. Opbouw schematisch.', ex: [0, -0.18, 0] }, [
    ...[1, -1].map(sg => P(`Langsbalk ${sideName(sg)}`, merge([xf(chsRb(0.07, 0.06, 0.28, 0.01), [sg * 0.33, 0.21, 1.25]), xf(chsRb(0.075, 0.05, 0.03, 0.006), [sg * 0.4, 0.225, z0 + 0.01]), xf(chsRb(0.075, 0.05, 0.03, 0.006), [sg * 0.4, 0.225, z0 - 0.19]),
      xf(chsRb(0.2, 0.04, 0.05, 0.006), [sg * 0.45, 0.235, 1.15]), xf(chsRb(0.2, 0.04, 0.05, 0.006), [sg * 0.45, 0.235, 1.36])]), MAT.darkSteel, { d: 'Stalen langsbalk van het subframe met uitleggers naar de rubberlagers en oren voor de draagarm.', ex: [sg * 0.12, 0, 0] })),
    P('Dwarsbalk achter', chsRb(0.66, 0.06, 0.1, 0.01), MAT.darkSteel, { d: 'Achterste dwarsbalk van het subframe; hier steunt het stuurhuis op.', p: [0, 0.21, z0 - 0.2], ex: [0, 0, -0.14] }),
    P('Reactiestangbeugel', merge([xf(chsRb(0.08, 0.006, 0.07, 0.002), [-0.01, 0.243, z0 - 0.165]), xf(chsRb(0.013, 0.056, 0.06, 0.004), [-0.0335, 0.264, z0 - 0.165]), xf(chsRb(0.013, 0.056, 0.06, 0.004), [0.0135, 0.264, z0 - 0.165])]), MAT.darkSteel, { d: 'Gelaste dubbele oog-beugel boven op de achterste dwarsbalk: hierin hangt de rubber lagerbus van de reactiestang (koppelstang) van de aandrijflijn, vastgezet met één bout.', ex: [0, 0.14, -0.04] }),
    P('Dwarsbalk voor', chsRb(0.66, 0.05, 0.06, 0.008), MAT.darkSteel, { d: 'Voorste dwarsbalk van het subframe.', p: [0, 0.2, 1.355], ex: [0, 0, 0.14] }),
    ...[[1, 1.15], [-1, 1.15], [1, 1.36], [-1, 1.36]].map(([sg, z], i) => P(`Subframelager ${i + 1}`, G.cyl('y', 0.028, 0.026, 0.05, 16), MAT.rubber, { d: 'Rubberlager tussen subframe en carrosserie.', p: [sg * 0.54, 0.255, z], ex: [sg * 0.1, 0.05, z > 1.3 ? 0.08 : -0.08] })),
    ...[[1, 1.15], [-1, 1.15], [1, 1.36], [-1, 1.36]].map(([sg, z], i) => P(`Subframebout ${i + 1}`, hexBolt(0.075, 0.014, 'y'), MAT.steel, { d: 'Bout die het subframe aan de carrosserie bevestigt.', p: [sg * 0.54, 0.185, z], ex: [sg * 0.1, -0.25, z > 1.3 ? 0.08 : -0.08] }))]);
  // ---- stabilisatorstang ----
  const arb = A('Stabilisatorstang', { d: 'Stabilisatorstang Ø24 mm achter de draagarmen: beperkt het overhellen; met twee rubberlagers en beugels aan het subframe en koppelstangen naar de veerpoten.', spec: [['Diameter', '24 mm']], ex: [0, -0.1, -0.2] }, [
    P('Stabilisatorbuis', tube([[0.557, 0.29, z0 - 0.05], [0.55, 0.268, z0 - 0.15], [0.5, 0.255, z0 - 0.29], [0.3, 0.218, z0 - 0.3], [0, 0.215, z0 - 0.3], [-0.3, 0.218, z0 - 0.3], [-0.5, 0.255, z0 - 0.29], [-0.55, 0.268, z0 - 0.15], [-0.557, 0.29, z0 - 0.05]], 0.012, 56, 10), MAT.darkSteel, { d: 'Gebogen stalen torsiestaaf Ø24 mm.', ex: [0, 0, -0.04] }),
    ...[1, -1].map(sg => P(`Stabilisatorrubber ${sideName(sg)}`, G.cyl('x', 0.02, 0.02, 0.05, 16), MAT.rubber, { d: 'Rubberlager waarin de stabilisatorstang draait.', p: [sg * 0.3, 0.218, z0 - 0.3], ex: [sg * 0.05, -0.06, 0] })),
    ...[1, -1].map(sg => P(`Stabilisatorbeugel ${sideName(sg)}`, merge([xf(chsRb(0.056, 0.044, 0.036, 0.008), [0, 0.0, 0]), xf(chsRb(0.05, 0.012, 0.08, 0.003), [0, 0.01, 0.04])]), MAT.darkSteel, { d: 'Stalen beugel die het rubberlager aan de achterste dwarsbalk klemt.', p: [sg * 0.3, 0.218, z0 - 0.3], ex: [sg * 0.05, 0.1, -0.04] })),
    ...[1, -1].map((sg, i) => P(`Beugelbout ${i + 1}`, hexBolt(0.03, 0.008, 'y'), MAT.steel, { d: 'Bout van de stabilisatorbeugel.', p: [sg * 0.3, 0.236, z0 - 0.26], ex: [sg * 0.05, 0.22, 0] }))]);
  // ---- stuurhuis ----
  const rack = A('Tandheugelstuurhuis', { d: 'Hydraulisch geassisteerd tandheugelstuurhuis met variabele assistentie (Renault-persmap: "hydraulique variable"); 2,9 stuurslagen tussen de aanslagen. Het rondsel zit aan de linkerkant (linksgestuurd).', spec: [['Stuurslagen', '2,9 tussen de aanslagen'], ['Bekrachtiging', 'hydraulisch, variabel']], ex: [0, 0, -0.14] }, [
    P('Stuurhuis', merge([G.cyl('x', 0.026, 0.026, 0.62, 22), xf(G.cyl('y', 0.032, 0.032, 0.09, 18), [pinX, 0.03, 0.0]), xf(G.cyl('x', 0.029, 0.029, 0.03, 20), [0.29, 0, 0]), xf(G.cyl('x', 0.029, 0.029, 0.03, 20), [-0.29, 0, 0])]), MAT.aluCast, { d: 'Gegoten aluminium huis van de tandheugel; het rechter deel is de hydraulische hulpcilinder.', p: [0, rackY, rackZ], ex: [0, 0, -0.1] }),
    P('Tandheugel', G.cyl('x', 0.011, 0.011, 0.76, 12), MAT.steel, { d: 'Getande staaf (met zuiger in de hulpcilinder) die de draaiing van het rondsel omzet in zijdelingse beweging.', p: [0, rackY, rackZ], ex: [0, -0.1, -0.05], inner: true }),
    P('Rondsel', merge([G.cyl('y', 0.009, 0.009, 0.14, 12), xf(gear(11, 0.0135, 0.0105, 0.03, 0, 'y'), [0, 0, 0])]), MAT.steel, { d: 'Rondsel op de stuuras, kamt in de tandheugel.', p: [pinX, rackY + 0.03, rackZ], ex: [0, 0.12, 0], inner: true }),
    P('Draaiafsluiter', merge([G.cyl('y', 0.013, 0.013, 0.05, 14), xf(G.cyl('y', 0.005, 0.005, 0.07, 8), [0, 0, 0])]), MAT.darkSteel, { d: 'Draaiafsluiter met torsiestaaf: stuurt de olie naar de juiste zijde van de hulpzuiger, afhankelijk van het stuurmoment (schematisch).', p: [pinX, rackY + 0.06, rackZ + 0.005], ex: [0, 0.16, 0], inner: true }),
    P('Ventielhuis', merge([G.cyl('y', 0.026, 0.026, 0.05, 18), xf(G.cyl('z', 0.009, 0.009, 0.04, 10), [0.012, 0.012, -0.035]), xf(G.cyl('z', 0.009, 0.009, 0.04, 10), [-0.012, 0.012, -0.035]), xf(G.cyl('x', 0.007, 0.007, 0.05, 10), [-0.02, -0.014, 0]), xf(G.cyl('x', 0.007, 0.007, 0.05, 10), [0.02, -0.02, 0])]), MAT.aluCast, { d: 'Ventielhuis boven op het rondsel met de aansluitingen aan de achterzijde voor de druk- en retourslang en de twee hulpcilinderleidingen aan de zijkanten.', p: [vh[0], vh[1], vh[2]], ex: [0, 0.14, 0] }),
    P('Cilinderleiding links', tube([[pinX + 0.02, rackY + 0.05, rackZ + 0.0], [0.26, rackY + 0.052, rackZ - 0.035], [0.29, rackY + 0.035, rackZ - 0.035], [0.29, rackY + 0.02, rackZ - 0.012]], 0.0035, 20, 6), MAT.steel, { d: 'Stalen leiding van het ventielhuis naar de linkerzijde van de hulpcilinder.', ex: [0.04, 0.1, -0.1] }),
    P('Cilinderleiding rechts', tube([[pinX - 0.02, rackY + 0.05, rackZ + 0.0], [0.15, rackY + 0.056, rackZ - 0.038], [-0.2, rackY + 0.056, rackZ - 0.038], [-0.29, rackY + 0.035, rackZ - 0.035], [-0.29, rackY + 0.02, rackZ - 0.012]], 0.0035, 28, 6), MAT.steel, { d: 'Stalen leiding van het ventielhuis naar de rechterzijde van de hulpcilinder.', ex: [-0.04, 0.12, -0.1] }),
    ...[1, -1].map(sg => P(`Stuurhoes ${sideName(sg)}`, G.lathe('x', bellows(0.03, 0.02, 0.08, 4), 24, 'rboot'), MAT.rubber, { d: 'Balg over het tandheugeluiteinde en de binnenste kogel.', p: [sg > 0 ? 0.31 : -0.39, rackY, rackZ], ex: [sg * 0.16, 0, 0.0] })),
    ...[[1, 0.314], [-1, -0.314]].map(([sg, x], i) => P(`Balgklem ${i + 1}`, chsClamp('x', 0.0315), MAT.steel, { d: 'Klemband van de stuurhoes.', p: [x, rackY, rackZ], ex: [sg * 0.2, 0.04, 0.0] })),
    ...[1, -1].map(sg => P(`Stuurhuissteun ${sideName(sg)}`, chsRb(0.07, 0.075, 0.07, 0.008), MAT.darkSteel, { d: 'Gegoten steun op de achterste dwarsbalk waarop het stuurhuis rust.', p: [sg * 0.2, rackY - 0.06, rackZ + 0.0], ex: [sg * 0.1, -0.12, 0.0] })),
    ...[1, -1].map(sg => P(`Stuurhuisklem ${sideName(sg)}`, merge([G.torus('x', 0.0292, 0.0035, 22, 4), xf(chsRb(0.03, 0.006, 0.07, 0.002), [0, -0.034, 0])]), MAT.steel, { d: 'Stalen beugel die het stuurhuis op de steun klemt.', p: [sg * 0.2, rackY, rackZ], ex: [sg * 0.1, 0.1, 0.0] })),
    ...[[1, -1], [1, 1], [-1, -1], [-1, 1]].map(([sg, e], i) => P(`Klembout ${i + 1}`, hexBolt(0.03, 0.009, 'y'), MAT.steel, { d: 'Bout van de stuurhuisklem.', p: [sg * 0.2, rackY - 0.04, rackZ + e * 0.03], ex: [sg * 0.1, -0.22, e * 0.04] }))]);
  // ---- hydrauliek ----
  const rp = (dx, dy, dz) => [R0.x + dx, R0.y + dy, R0.z + dz];
  const hyd = A('Stuurbekrachtiging', { d: 'Hydraulische hulp voor het stuur: oliereservoir met filter, zuigslang naar de riemaangedreven stuurpomp op de motor (aannemelijk voor deze motor, geen elektropomp), hogedrukslang naar het ventielhuis op het stuurhuis en retourslang terug naar het reservoir.', ex: [-0.15, 0.2, 0.05] }, [
    A('Oliereservoir', { d: 'Doorzichtige kunststof voorraadbak met vuldop, peilstok en filter voor de stuurbekrachtigingsolie.', ex: [0, 0.18, 0] }, [
      P('Reservoirhuis', G.lathe('y', [[0.0, 0.0], [0.034, 0.0], [0.04, 0.01], [0.04, 0.095], [0.034, 0.105], [0.026, 0.108], [0.026, 0.118], [0.0, 0.118]], 24, 'chsRes'), MAT.tank, { d: 'Doorzichtig reservoir met min-/max-markering.', p: rp(0, 0, 0), ex: [0, 0.0, 0] }),
      P('Reservoirdop', merge([G.cyl('y', 0.03, 0.03, 0.016, 20), xf(G.cyl('y', 0.0035, 0.0035, 0.06, 8), [0, -0.035, 0])]), MAT.plastic, { d: 'Schroefdop met peilstok.', p: rp(0, 0.126, 0), ex: [0, 0.2, 0] }),
      P('Reservoirfilter', G.lathe('y', [[0.012, 0], [0.026, 0], [0.026, 0.07], [0.012, 0.07], [0.012, 0]], 18, 'chsResF'), MAT.filter, { d: 'Zeef in het reservoir die vuil uit de olie houdt.', p: rp(0, 0.02, 0), ex: [0, 0.1, 0] }),
      P('Zuigaansluiting', G.cyl('x', 0.0105, 0.0105, 0.03, 12), MAT.plastic, { d: 'Aansluiting voor de zuigslang naar de pomp, aan de motorzijde van het reservoir.', p: rp(0.04, 0.012, 0.0), ex: [0.12, 0, 0] }),
      P('Retouraansluiting', G.cyl('z', 0.0105, 0.0105, 0.03, 12), MAT.plastic, { d: 'Aansluiting voor de retourslang van het stuurhuis, aan de voorzijde van het reservoir.', p: rp(0.0, 0.085, 0.045), ex: [0, 0, 0.12] }),
      P('Reservoirbeugel', merge([G.torus('y', 0.0425, 0.003, 24, 4), xf(chsRb(0.07, 0.03, 0.006, 0.002), [0, 0, 0.043])]), MAT.darkSteel, { d: 'Stalen beugel die het reservoir op het spatbord bevestigt.', p: rp(0, 0.04, 0), ex: [-0.1, -0.06, 0.1] }),
      ...[1, -1].map((sg, i) => P(`Beugelbout ${i + 1}`, hexBolt(0.016, 0.006, 'x'), MAT.steel, { d: 'Bout van de reservoirbeugel.', p: rp(-0.07, 0.04 + sg * 0.01, 0.043), ex: [-0.2, 0, 0.1] }))]),
    P('Zuigslang', tube([pIn.p, V3(...pIn.p).addScaledVector(pIn.dir, 0.02).toArray(), [-0.434, 0.49, 1.857], [-0.445, 0.522, 1.868], [-0.47, 0.535, 1.872], [-0.499, 0.535, 1.862], [-0.501, 0.54, 1.80], [-0.515, 0.60, 1.745], rp(0.052, 0.012, 0.0)], 0.011, 48, 10), MAT.rubber, { d: 'Zuigslang van het reservoir naar de aanzuiging van de stuurpomp; loopt langs de voorzijde van de pomppoelie en achter de accu om naar de motorzijde van het reservoir.', ex: [0.1, 0.0, 0.1] }),
    ...[[0, 'pomp'], [1, 'reservoir']].map(([k, nm]) => P(`Slangklem zuigslang ${nm}`, chsClamp('x', 0.0125), MAT.steel, { d: 'Klem van de zuigslang.', p: k ? rp(0.046, 0.012, 0) : V3(...pIn.p).addScaledVector(pIn.dir, 0.012).toArray(), ex: [0.1, 0.1, 0.1] })),
    P('Hogedrukslang', tube([V3(...pOut.p).addScaledVector(pOut.dir, 0.002).toArray(), [-0.397, 0.33, 1.766], [-0.399, 0.26, 1.761], [-0.40, 0.19, 1.758], [-0.405, 0.16, 1.738], [-0.415, 0.125, 1.69], [-0.42, 0.105, 1.62], [-0.42, 0.105, 1.58], [-0.42, 0.105, 1.45], [-0.42, 0.105, 1.30], [-0.40, 0.105, 1.17], [-0.34, 0.105, 1.10], [-0.2, 0.105, 1.095], [0.0, 0.105, 1.095], [0.17, 0.105, 1.095], [0.20, 0.15, 1.095], [0.20, 0.30, 1.095], [0.205, 0.42, 1.105], [0.225, 0.425, 1.15], vP], 0.0075, 90, 8), MAT.rubber, { d: 'Gevlochten hogedrukslang van de stuurpomp naar het ventielhuis: onder de motor langs, achter de achterste subframebalk om en van achteren naar het stuurhuis.', ex: [-0.05, -0.1, 0.0] }),
    ...[0, 1].map(k => P(`Wartelmoer hogedruk ${k ? 'stuurhuis' : 'pomp'}`, chsNut(k ? 'z' : 'y', 0.0105, 0.012), MAT.steel, { d: 'Wartelmoer van de hogedrukaansluiting.', p: k ? [vP[0], vP[1], vP[2] - 0.004] : V3(...pOut.p).addScaledVector(pOut.dir, 0.006).toArray(), ex: [0, -0.12, 0.05] })),
    P('Retourslang', tube([vR, [0.272, 0.40, 1.14], [0.262, 0.34, 1.11], [0.255, 0.19, 1.10], [0.25, 0.15, 1.105], [0.23, 0.145, 1.13], [0.1, 0.145, 1.13], [-0.2, 0.145, 1.13], [-0.42, 0.145, 1.13], [-0.45, 0.145, 1.2], [-0.45, 0.145, 1.30], [-0.45, 0.145, 1.50], [-0.445, 0.145, 1.62], [-0.445, 0.148, 1.70], [-0.445, 0.20, 1.75], [-0.445, 0.30, 1.755], [-0.44, 0.355, 1.775], [-0.44, 0.372, 1.835], [-0.468, 0.45, 1.842], [-0.468, 0.64, 1.84], [-0.50, 0.66, 1.80], [-0.55, 0.70, 1.775], rp(0, 0.085, 0.056)], 0.0085, 90, 8), MAT.rubber, { d: 'Retourslang met lage druk van het ventielhuis terug naar het reservoir: onder het subframe langs, voor de pomppoelie omhoog en achter de accu om naar de voorzijde van het reservoir.', ex: [0.05, -0.08, 0.0] }),
    ...[0, 1].map(k => P(`Slangklem retourslang ${k ? 'reservoir' : 'stuurhuis'}`, chsClamp('z', 0.0135), MAT.steel, { d: 'Klem van de retourslang.', p: k ? rp(0, 0.085, 0.048) : [vR[0], vR[1], vR[2] + 0.008], ex: [0.1, 0.1, 0.1] }))]);
  // ---- stuurkolom ----
  const colA = [0.26, 0.425, rackZ + 0.01], colB = [0.34, 0.7, 0.98], colC = [0.37, 0.9, 0.4];
  const column = A('Stuurkolom', { d: 'In hoogte en diepte verstelbare stuurkolom met kreukelzone en elektrisch kolomslot, via een tussenas met twee kruiskoppelingen verbonden met het rondsel; de onder-stuurmodule met wisser- en lichtschakelaar zit om de kolom.', ex: [0.2, 0.1, 0] }, [
    P('Tussenas', rodBetween(colA, colB, 0.011), MAT.steel, { d: 'Tussenas die door het schutbord naar het rondsel loopt (lengte-verschuifbaar; schematisch).', ex: [0.06, 0.0, 0.08] }),
    P('Kruiskoppeling onder', merge([G.sphere(0.014, 10), xf(chsRb(0.04, 0.012, 0.012, 0.002), [0, 0, 0]), xf(chsRb(0.012, 0.012, 0.04, 0.002), [0, 0, 0])]), MAT.steel, { d: 'Kruiskoppeling aan het rondsel.', p: colA, ex: [0.0, -0.04, 0.0] }),
    P('Kruiskoppeling boven', merge([G.sphere(0.014, 10), xf(chsRb(0.04, 0.012, 0.012, 0.002), [0, 0, 0]), xf(chsRb(0.012, 0.012, 0.04, 0.002), [0, 0, 0])]), MAT.steel, { d: 'Kruiskoppeling aan de stuurkolom.', p: colB, ex: [0.1, 0.1, 0.0] }),
    P('Schutbordafdichting', G.lathe('y', bellows(0.05, 0.036, 0.04, 2), 20, 'chsFw'), MAT.rubber, { d: 'Rubber doorvoer van de tussenas door het schutbord.', p: [0.321, 0.635, 1.04], q: quatFromTo(V3(0, 1, 0), V3(0.08, 0.275, -0.255).normalize()), ex: [0.1, 0.0, 0.14] }),
    P('Kolombuis', rodBetween(colB, colC, 0.018), MAT.steel, { d: 'Buitenbuis van de stuurkolom met kreukelzone (geschat).', ex: [0.12, 0.1, 0] }),
    P('Kolomas', rodBetween([0.35, 0.78, 0.8], [0.37, 0.92, 0.37], 0.009), MAT.darkSteel, { d: 'Stuuras in de kolombuis; draagt aan het uiteinde de spiebaan voor het stuurwiel.', ex: [0.18, 0.14, 0.12] }),
    P('Kolomslot', chsRb(0.03, 0.03, 0.04, 0.005), MAT.darkSteel, { d: 'Elektrisch stuurkolomslot (vergrendelt het stuur).', p: [0.37, 0.83, 0.6], ex: [0.26, 0.0, 0.0] }),
    P('Stelhendel', merge([rodBetween([0, 0, 0], [0.0, -0.07, 0.04], 0.005), xf(chsRb(0.014, 0.014, 0.05, 0.004), [0, -0.075, 0.055])]), MAT.plastic, { d: 'Hendel waarmee de kolom in hoogte en diepte wordt vrijgezet.', p: [0.37, 0.835, 0.62], ex: [0.3, -0.06, 0.1] }),
    P('Kolomomkasting boven', chsRb(0.1, 0.05, 0.10, 0.02), MAT.dash, { d: 'Bovenste kunststof omkasting rond de stuurkolom, van het dashboard tot onder het instrumentenpaneel (daar eindigt hij: het paneel zit boven de kolom).', p: [0.36, 0.859, 0.583], r: [0.332, 0, 0], ex: [0.2, 0.06, 0] }),
    P('Kolomomkasting onder', chsRb(0.1, 0.05, 0.10, 0.02), MAT.dash, { d: 'Onderste kunststof omkasting rond de stuurkolom, van het dashboard tot onder het instrumentenpaneel.', p: [0.36, 0.805, 0.583], r: [0.332, 0, 0], ex: [0.2, -0.1, 0] }),
    P('Onder-stuurmodule', merge([G.cyl('z', 0.045, 0.045, 0.05, 20), xf(chsRb(0.03, 0.03, 0.05, 0.005), [0, 0, 0])]), MAT.dash, { d: 'Compacte, niet te scheiden module om de kolom met stuurhoeksensor, wisser-/lichtschakelaar en wikkelcontact.', p: [0.37, 0.918, 0.4], r: [0.332, 0, 0], ex: [0.2, 0.0, 0.12] }),
    P('Wissergreep', merge([rodBetween([0, 0, 0], [0.12, 0.0, 0.0], 0.007), xf(chsRb(0.03, 0.016, 0.016, 0.004), [0.14, 0, 0])]), MAT.dash, { d: 'Bedieningshendel voor de ruitenwissers.', p: [0.37, 0.918, 0.4], r: [0.332, 0, 0], ex: [0.3, 0.0, 0.1] }),
    P('Lichtgreep', merge([rodBetween([0, 0, 0], [-0.12, 0.0, 0.0], 0.007), xf(chsRb(0.03, 0.016, 0.016, 0.004), [-0.14, 0, 0])]), MAT.dash, { d: 'Bedieningshendel voor richtingaanwijzers en verlichting.', p: [0.37, 0.918, 0.4], r: [0.332, 0, 0], ex: [-0.3, 0.0, 0.1] })]);
  // ---- stuurwiel ----
  const wheelPos = V3(0.372, 0.915, 0.36);
  const wheel = A('Stuurwiel', { d: 'Met leder bekleed driespaaks stuurwiel met bestuurdersairbag en claxon; cruise/limiter zitten op een aparte bediening op het dashboard en de audiobediening op een steunpaal (dus geen toetsen op het stuurwiel).', p: wheelPos.toArray(), r: [PI + 0.332, 0, PI], ex: [0, 0.25, -0.35] }, [
    P('Stuurwielkrans', G.torus('z', 0.185, 0.016, 64, 10), MAT.leather, { d: 'Lederen stuurwielkrans met stalen kern.', ex: [0, 0, -0.12] }),
    P('Spaak links', xf(G.box(0.13, 0.03, 0.02), [0.0, 0, 0]), MAT.satin, { d: 'Linkerspaak met satijn-aluminium afwerking.', p: [-0.11, -0.01, -0.01], ex: [-0.12, 0, -0.06] }),
    P('Spaak rechts', xf(G.box(0.13, 0.03, 0.02), [0.0, 0, 0]), MAT.satin, { d: 'Rechterspaak met satijn-aluminium afwerking.', p: [0.11, -0.01, -0.01], ex: [0.12, 0, -0.06] }),
    P('Spaak onder', xf(G.box(0.03, 0.13, 0.02), [0.0, 0, 0]), MAT.satin, { d: 'Onderste spaak met satijn-aluminium afwerking.', p: [0, -0.11, -0.01], ex: [0, -0.12, -0.06] }),
    P('Stuurwielnaaf', G.cyl('z', 0.03, 0.03, 0.05, 16), MAT.darkSteel, { d: 'Naaf met spiebaan op de stuuras.', p: [0, 0, -0.03], ex: [0, 0, -0.18] }),
    A('Airbagmodule bestuurder', { d: 'Bestuurdersairbag in het stuurwielcentrum (twee ontstekingsstanden); in het deksel zit de claxon.', ex: [0, 0, 0.12] }, [
      P('Airbagdeksel', chsRb(0.15, 0.12, 0.012, 0.02), MAT.dash, { d: 'Scheurdeksel van de airbag; drukken erop bedient de claxon.', p: [0, -0.005, 0.034], ex: [0, 0, 0.1] }),
      P('Airbag', chsRb(0.12, 0.09, 0.03, 0.012), MAT.fabric, { d: 'Opgevouwen nylon airbag.', p: [0, -0.005, 0.012], ex: [0, 0, 0.05] }),
      P('Gasgenerator', G.cyl('z', 0.036, 0.036, 0.028, 18), MAT.darkSteel, { d: 'Gasgenerator met twee ontstekers.', p: [0, -0.005, -0.012], ex: [0, 0, -0.02] })]),
    P('Wikkelcontact', annulus(0.028, 0.052, 0.02, 'z', 28), MAT.plasticGrey, { d: 'Spiraalvormig wikkelcontact dat de airbag en de claxon met de kabelboom verbindt terwijl het stuur draait.', p: [0, 0, -0.065], ex: [0, 0, -0.28] }),
    P('Centrale bout', hexBolt(0.06, 0.014, 'z'), MAT.steel, { d: 'Bout die het stuurwiel op de stuuras trekt.', p: [0, 0, -0.1], ex: [0, 0, -0.4] })]);
  const steer = A('Stuurinrichting', { d: 'Tandheugelbesturing met hydraulische, snelheidsafhankelijke assistentie: stuurhuis, twee spoorstangen, bekrachtigingsolie met reservoir en slangen, stuurkolom en stuurwiel.', ex: [0, 0.3, 0.05] }, [rack, chsTieRod(1, z0, rackY, rackZ), chsTieRod(-1, z0, rackY, rackZ), hyd, column, wheel]);
  return A('Vooras en stuurinrichting', { d: 'Subframe met McPherson-wielophanging, stabilisatorstang en hydraulisch geassisteerde tandheugelbesturing.', spec: [['Ophanging', 'McPherson, onafhankelijk'], ['Stabilisatorstang', 'Ø 24 mm'], ['Remmen voor', 'geventileerde schijven 296 × 26 mm']], ex: [0, -0.25, 0.55] }, [sub, arb, steer, frontCorner(1), frontCorner(-1)]);
}
function buildRearAxle() {
  const z0 = AXR, zp = -0.96, ax = 0.60;                                      // astap-hoogte, draaipunt en x van de langsarmen
  const dB = V3(-0.015, 0.31, -0.045);                                          // richting van de schokdemper (links; rechts gespiegeld)
  const beamShape = shapeOf([[-0.05, 0.036], [0.05, 0.036], [0.05, 0.026], [-0.036, 0.026], [-0.036, -0.026], [0.05, -0.026], [0.05, -0.036], [-0.05, -0.036]]);
  const arm = sg => A(`Langsarm ${sideName(sg)}`, { d: `Langsarm ${sideName(sg)} van de torsieas: scharniert op een rubberlager in de carrosserie en draagt aan het uiteinde de astapflens, de veerpad en de dempersteun.`, ex: [sg * 0.12, 0, 0] }, [
    P('Arm', merge([xf(chsRb(0.06, 0.07, 0.42, 0.012), [sg * ax, 0.32, -1.18]), xf(chsRb(0.135, 0.13, 0.13, 0.012), [sg * 0.6375, 0.32, z0]), xf(G.cyl('x', 0.045, 0.045, 0.1, 22), [sg * ax, 0.32, zp]),
      xf(chsRb(0.16, 0.02, 0.14, 0.006), [sg * 0.51, 0.335, -1.47]), xf(chsRb(0.05, 0.04, 0.1, 0.006), [sg * 0.6, 0.33, -1.5]), xf(chsRb(0.03, 0.06, 0.012, 0.003), [sg * (ax + 0.03), 0.33, -1.53]), xf(chsRb(0.03, 0.06, 0.012, 0.003), [sg * (ax - 0.03), 0.33, -1.53])]), MAT.darkSteel, { d: 'Geperste stalen langsarm met draaipuntbus, aangelaste astapaansluiting, veerpad en dempersteun.', ex: [0, -0.1, 0] }),
    P('Draaipuntbus', G.cyl('x', 0.04, 0.04, 0.07, 20), MAT.rubber, { d: 'Rubber-metalen scharnierlager waarmee de arm in de carrosserie draait (één per langsarm).', p: [sg * ax, 0.32, zp], ex: [sg * 0.1, 0, 0.1] }),
    P('Draaipuntbout', hexBolt(0.15, 0.014, sg > 0 ? 'x' : '-x'), MAT.steel, { d: 'Scharnierbout door de draaipuntbus.', p: [sg * 0.53, 0.32, zp], ex: [sg * -0.2, 0, 0.1] }),
    P('Draaipuntmoer', chsNut('x', 0.0125, 0.014), MAT.steel, { d: 'Zelfborgende moer van de draaipuntbout.', p: [sg * 0.685, 0.32, zp], ex: [sg * 0.25, 0, 0.1] })]);
  const spr = sg => A(`Veer achter ${sideName(sg)}`, { d: 'Schroefveer met rubber ondersteuning, bovenschotel, aanslagrubber en stofhoes; aparte veer en demper (Renault: aparte schroefveren en dempers).', ex: [0, 0.3, 0] }, [
    P('Veerrubber onder', annulus(0.045, 0.07, 0.006, 'y', 24), MAT.rubber, { d: 'Rubber tussenlaag op het veerpad.', p: [sg * 0.51, 0.348, -1.47], ex: [0, -0.04, 0], inner: true }),
    P('Schroefveer achter', spring(0.062, 0.0105, 0.2, 5), MAT.chsSpring, { d: 'Draagt het achtergewicht van de auto.', p: [sg * 0.51, 0.455, -1.47], ex: [0, 0.0, 0] }),
    P('Veerschotel boven', G.lathe('y', [[0.02, 0], [0.068, 0.002], [0.07, -0.008], [0.062, -0.01], [0.02, -0.004]], 22, 'chsSeatR'), MAT.rubber, { d: 'Rubber bovenschotel in de carrosserie (de veer drukt tegen de vloer van de laadruimte).', p: [sg * 0.51, 0.566, -1.47], ex: [0, 0.14, 0] }),
    P('Aanslagrubber', G.cyl('y', 0.03, 0.026, 0.05, 16), MAT.rubber, { d: 'Vangt het inveren aan het einde van de slag op.', p: [sg * 0.51, 0.535, -1.47], ex: [0, 0.2, 0], inner: true }),
    P('Stofhoes veer', G.lathe('y', bellows(0.034, 0.028, 0.07, 3), 18, 'chsRdb'), MAT.rubber, { d: 'Balg om de aanslagrubber.', p: [sg * 0.51, 0.462, -1.47], ex: [0, 0.1, 0] })]);
  const dmp = sg => A(`Schokdemper achter ${sideName(sg)}`, { d: 'Bitube-schokdemper (huis Ø45 mm, zuigerstang Ø12,5 mm), onderaan met een oog aan de langsarm, bovenaan met een rubbersteun in de carrosserie.', spec: [['Demperhuis', 'Ø 45 mm'], ['Zuigerstang', 'Ø 12,5 mm']], p: [sg * ax, 0.33, -1.5], q: quatFromTo(V3(0, 1, 0), V3(sg * dB.x, dB.y, dB.z)), ex: [sg * 0.08, 0.26, -0.08] }, [
    P('Demperbuis', merge([G.cyl('y', 0.0225, 0.0225, 0.21, 20).clone().translate(0, 0.105, 0), xf(G.torus('x', 0.013, 0.0065, 14, 6), [0, -0.004, 0])]), MAT.darkSteel, { d: 'Buis van de achterste schokdemper met onderoog.', ex: [0, -0.1, 0] }),
    P('Zuigerstang', G.cyl('y', 0.00625, 0.00625, 0.17, 10), MAT.chrome, { d: 'Verchroomde zuigerstang Ø12,5 mm.', p: [0, 0.23, 0], ex: [0, 0.04, 0] }),
    P('Stofbuis', G.cyl('y', 0.019, 0.019, 0.1, 16), MAT.plastic, { d: 'Kunststof stofbuis over de zuigerstang.', p: [0, 0.21, 0], ex: [sg * 0.06, 0.05, 0] }),
    P('Aanslagrubber', G.cyl('y', 0.017, 0.015, 0.035, 14), MAT.rubber, { d: 'Aanslagrubber in de stofbuis.', p: [0, 0.285, 0], ex: [sg * 0.08, 0.1, 0] }),
    P('Bovensteun', G.lathe('y', [[0.006, 0], [0.026, 0], [0.026, 0.012], [0.016, 0.018], [0.006, 0.018]], 18, 'chsDtm'), MAT.rubber, { d: 'Rubber-metalen bovensteun waarmee de demper in de carrosserie hangt.', p: [0, 0.308, 0], ex: [0, 0.16, 0] }),
    P('Bovenmoer', chsNut('y', 0.0085, 0.01), MAT.steel, { d: 'Zelfborgende moer bovenop de zuigerstang.', p: [0, 0.335, 0], ex: [0, 0.26, 0] }),
    P('Onderbout', hexBolt(0.08, 0.012, sg > 0 ? 'x' : '-x'), MAT.steel, { d: 'Bout door het onderoog en de dempersteun.', p: [-sg * 0.04, 0, 0], ex: [-sg * 0.2, 0, 0] }),
    P('Ondermoer', chsNut('x', 0.0105, 0.011), MAT.steel, { d: 'Zelfborgende moer van de onderbout.', p: [sg * 0.042, 0, 0], ex: [sg * 0.22, 0, 0] })]);
  return A('Achteras', { d: 'Semi-onafhankelijke torsieas (H-as, "essieu souple en H") met losse schroefveren en dempers. 4Control (vierwielbesturing) was op de Initiale een optie; dit model toont de standaard H-as zonder 4Control.', spec: [['Ophanging', 'torsieas in H-vorm, semi-onafhankelijk'], ['Stabilisatorstaaf', 'Ø 29,6 mm (in de balk)'], ['Demper', 'bitube, Ø 45 mm'], ['Remmen achter', 'massieve schijven 300 × 11 mm']], ex: [0, -0.25, -0.65] }, [
    A('Torsiebalk', { d: 'H-vormige torsiebalk: twee langsarmen verbonden door een torderende dwarsbalk met geïntegreerde stabilisatorstaaf; de balk werkt als veer voor het overhellen.', ex: [0, -0.14, 0] }, [
      P('Dwarsbalk', side(beamShape, 1.14), MAT.darkSteel, { d: 'Open U-profiel dat torderen toelaat (torsiebalk).', p: [0, 0.29, -1.15], ex: [0, -0.1, 0] }),
      P('Stabilisatorstaaf achter', merge([G.cyl('x', 0.0148, 0.0148, 1.0, 14), rodBetween([0.5, 0.0, 0.0], [0.56, 0.0, -0.1], 0.0148), rodBetween([-0.5, 0.0, 0.0], [-0.56, 0.0, -0.1], 0.0148)]), MAT.steel, { d: 'Stabilisatorstaaf Ø29,6 mm in de dwarsbalk (aannemelijk; opgave Renault-persmap voor de F4Rt).', p: [0, 0.29, -1.15], ex: [0, 0.12, 0] }),
      ...[1, -1].map(sg => P(`Hoekplaat ${sideName(sg)}`, chsRb(0.1, 0.012, 0.13, 0.004), MAT.darkSteel, { d: 'Aangelaste verstijvingsplaat tussen langsarm en dwarsbalk.', p: [sg * 0.54, 0.358, -1.15], ex: [sg * 0.08, 0.1, 0] })),
      arm(1), arm(-1)]),
    spr(1), spr(-1), dmp(1), dmp(-1), rearCorner(1), rearCorner(-1),
  ]);
}
function buildWheel(s, front) {
  const z = front ? AXF : AXR, n = (s > 0 ? 'links' : 'rechts') + (front ? 'voor' : 'achter'), tr = front ? TRACK_F : TRACK_R;
  // band 225/45 R18: profiel (straal, as); vier lengtegroeven in het loopvlak, ribbels in de schouder
  const tire = G.lathe('x', [[0.2286, -0.103], [0.248, -0.111], [0.29, -0.1135], [0.312, -0.109], [0.324, -0.098], [0.329, -0.083], [0.33, -0.078], [0.33, -0.058], [0.3265, -0.058], [0.3265, -0.046], [0.33, -0.046],
    [0.33, -0.016], [0.3265, -0.016], [0.3265, -0.006], [0.33, -0.006], [0.33, 0.006], [0.3265, 0.006], [0.3265, 0.016], [0.33, 0.016], [0.33, 0.046], [0.3265, 0.046], [0.3265, 0.058], [0.33, 0.058], [0.33, 0.078], [0.329, 0.083], [0.324, 0.098], [0.312, 0.109], [0.29, 0.1135], [0.248, 0.111], [0.2286, 0.103]], 64, 'chsTire');
  const rimB = cache('chsRimBarrel', () => yTo(new THREE.LatheGeometry([[0.2286, -0.106], [0.236, -0.108], [0.236, -0.103], [0.229, -0.098], [0.222, -0.088], [0.205, -0.07], [0.205, 0.04], [0.214, 0.085], [0.226, 0.092], [0.236, 0.098], [0.236, 0.106], [0.2286, 0.106]].map(p => new THREE.Vector2(...p)), 72), 'x'));
  // sterwerk: tien taps toelopende spaken (breed bij de velgrand, smal bij de naaf) op een naafplaat; de spaken liggen schuin (diepe schotel)
  const star = cache('chsRimStar', () => {
    const list = [];
    const pad = yTo(new THREE.LatheGeometry([[0.0335, 0.047], [0.072, 0.047], [0.072, 0.064], [0.06, 0.068], [0.0335, 0.068]].map(p => new THREE.Vector2(...p)), 40), 'z');
    list.push(pad);
    for (let k = 0; k < 10; k++) {
      const sp = extrude(shapeOf([[-0.011, 0.06], [0.011, 0.06], [0.016, 0.12], [0.028, 0.222], [-0.028, 0.222], [-0.016, 0.12]]), 0.018);
      sp.applyMatrix4(new THREE.Matrix4().set(1, 0, 0, 0, 0, 1, 0, 0, 0, -0.108, 1, 0, 0, 0, 0, 1));
      sp.translate(0, 0, 0.064);
      sp.rotateZ(k * PI / 5);
      list.push(sp);
    }
    return zTo(merge(list), 'x');
  });
  const a = 0.7, wa = [2.1, 4.3];
  return A(`Wiel ${n}`, { d: 'Lichtmetalen velg met tien taps toelopende spaken en band 225/45 R18. Maat: 18 inch (UK Initiale Lux standaard; voor een Nederlandse Initiale Paris van 2011 is 17 inch even goed mogelijk). De naam van het velgontwerp (Celsium) is voor deze auto niet bevestigd.', p: [s * tr, AY, z], s: [s, 1, 1], spec: [['Band', '225/45 R18'], ['Steekcirkel', '5 × 114,3 mm'], ['Bevestiging', '5 wielbouten M14 × 1,5'], ['Middengat', 'Ø 66,1 mm'], ['Bandenspanningssensor', 'in het ventiel']], ex: [s * 1.05, -0.1, front ? 0.55 : -0.65] }, [
    P('Band', tire, MAT.rubber, { d: 'Radiaalband 225/45 R18 met vier lengtegroeven in het loopvlak.', ex: [-0.07, 0, 0] }),
    P('Velgbed', rimB, MAT.chsRimWell, { d: 'Velgbed (ton) van gegoten aluminium met de wulpen waarop de band zit.', ex: [0.02, 0, 0] }),
    P('Velgster', star, MAT.chsRimFace, { d: 'Sterwerk met tien taps toelopende spaken en naafplaat met vijf boutgaten.', ex: [0.1, 0, 0] }),
    ...[0, 1, 2, 3, 4].map(k => P(`Wielbout ${k + 1}`, hexBolt(0.062, 0.0145, '-x'), MAT.steel, { d: 'Wielbout M14 × 1,5 met conische zitting; klemt het wiel en de schijf op de naaf.', p: [0.068, 0.0572 * Math.cos(k * PI * 0.4), 0.0572 * Math.sin(k * PI * 0.4)], ex: [0.26, 0, 0] })),
    P('Naafdop', G.lathe('x', [[0, 0.082], [0.02, 0.08], [0.032, 0.074], [0.036, 0.066], [0, 0.066]], 32, 'chsCap'), MAT.chrome, { d: 'Aluminium afdekkap van het velgcentrum; het ontwerp is niet gevonden en is schematisch.', ex: [0.36, 0, 0] }),
    P('Ventielsteel', G.cyl('y', 0.005, 0.0045, 0.036, 10), MAT.alu, { d: 'Ventielsteel met geïntegreerde sensor: loopt door het velgbed naar binnen.', p: [-0.04, 0.188 * Math.cos(a), 0.188 * Math.sin(a)], r: [a, 0, 0], ex: [-0.12, -0.0, 0] }),
    P('Ventieldop', G.cyl('y', 0.0055, 0.0055, 0.012, 10), MAT.plastic, { d: 'Stofdop op het ventiel.', p: [-0.04, 0.17 * Math.cos(a), 0.17 * Math.sin(a)], r: [a, 0, 0], ex: [-0.2, 0, 0] }),
    P('Bandenspanningssensor', chsRb(0.03, 0.015, 0.04, 0.005), MAT.ecu, { d: 'Zender op de ventielvoet in de band (433 MHz, aannemelijk); meldt de bandenspanning via de UCH.', p: [-0.04, 0.2145 * Math.cos(a), 0.2145 * Math.sin(a)], r: [a, 0, 0], ex: [-0.1, 0.0, 0], inner: true }),
    ...wa.map((w, i) => P(`Balansgewicht ${i ? 'buiten' : 'binnen'}`, chsRb(0.014, 0.004, 0.05, 0.001), MAT.steel, { d: 'Plakgewichtje op het velgbed om de wielbalans te corrigeren.', p: [i ? 0.03 : -0.05, 0.2072 * Math.cos(w), 0.2072 * Math.sin(w)], r: [w, 0, 0], ex: [i ? 0.0 : -0.08, -0.07 * Math.cos(w), -0.07 * Math.sin(w)] }))]);
}
function buildBrakeSystem() {
  const bp = [0.41, 0.675, 1.10], mp = [0.41, 0.675, 1.275], ab = [-0.25, 0.72, 1.14];       // bekrachtiger, hoofdremcilinder, ABS/ESP-unit (passagierszijde, geschat)
  const fz = AXF + 0.052, rz = AXR - 0.10;                                              // eindpunten van de vaste leidingen op veerpoot en langsarm
  const lev = chsPt(chsRearCM(), [-0.074, -0.0415, 0]);                                // hefboomuiteinde linksachter
  const clip = (nm, p, ex) => P(nm, chsClamp('x', 0.005), MAT.rubber, { d: 'Rubber geïsoleerde klem die de remleidingen langs de carrosserie vasthoudt.', p, ex });
  const mc = A('Hoofdremcilinder', { d: 'Tandem-hoofdremcilinder met voorraadreservoir en niveauschakelaar (opbouw zoals gebruikelijk; voor deze auto niet apart gevonden): zet de pedaalkracht om in hydraulische druk voor twee circuits.', ex: [0, 0.06, 0.14] }, [
    P('Cilinderhuis', merge([G.cyl('z', 0.0165, 0.0165, 0.17, 18), xf(G.cyl('z', 0.022, 0.022, 0.02, 18), [0, 0, -0.07]), xf(G.cyl('y', 0.011, 0.011, 0.05, 10), [0, 0.03, 0.04]), xf(G.cyl('y', 0.011, 0.011, 0.05, 10), [0, 0.03, -0.01])]), MAT.alu, { d: 'Aluminium cilinderhuis met flens op de bekrachtiger.', p: mp, ex: [0, 0, 0.1] }),
    P('Primaire zuiger', G.cyl('z', 0.0125, 0.0125, 0.05, 14), MAT.steel, { d: 'Zuiger die door de bekrachtigerstang wordt geduwd.', p: [mp[0], mp[1], mp[2] - 0.05], ex: [0, 0, -0.18], inner: true }),
    P('Secundaire zuiger', G.cyl('z', 0.0125, 0.0125, 0.045, 14), MAT.steel, { d: 'Vrij zwevende zuiger van het tweede remcircuit.', p: [mp[0], mp[1], mp[2] + 0.03], ex: [0, 0, -0.1], inner: true }),
    ...[0, 1].map(k => P(`Zuigerveer ${k + 1}`, spring(0.009, 0.0012, 0.04, 7, 'z'), MAT.steel, { d: 'Terugstelveer van een zuiger.', p: [mp[0], mp[1], mp[2] + (k ? 0.062 : -0.005)], ex: [0, 0.05, k ? 0.05 : 0.0], inner: true })),
    P('Remvloeistofreservoir', merge([chsRb(0.1, 0.06, 0.07, 0.012), xf(G.cyl('y', 0.022, 0.022, 0.02, 16), [0.02, 0.04, 0.0])]), MAT.tank, { d: 'Doorzichtig reservoir met remvloeistof, min- en max-markering.', p: [mp[0], mp[1] + 0.082, mp[2] - 0.02], ex: [0, 0.14, 0.0] }),
    P('Reservoirdop', merge([G.cyl('y', 0.026, 0.026, 0.016, 18), xf(chsRb(0.014, 0.012, 0.02, 0.003), [0.03, 0.0, 0.0])]), MAT.plastic, { d: 'Schroefdop met ontluchtingsgaatje.', p: [mp[0] + 0.02, mp[1] + 0.13, mp[2] - 0.02], ex: [0, 0.26, 0.0] }),
    P('Reservoirfilter', G.lathe('y', [[0.01, 0], [0.019, 0], [0.019, 0.04], [0.01, 0.04], [0.01, 0]], 16, 'chsMcf'), MAT.filter, { d: 'Zeef in de vulopening van het reservoir.', p: [mp[0] + 0.02, mp[1] + 0.095, mp[2] - 0.02], ex: [0, 0.2, 0], inner: true }),
    P('Niveauschakelaar', merge([chsRb(0.022, 0.016, 0.026, 0.004), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, -0.02, 0])]), MAT.plastic, { d: 'Vlotterschakelaar die het waarschuwingslampje bedient bij te laag vloeistofpeil.', p: [mp[0] - 0.035, mp[1] + 0.09, mp[2] - 0.02], ex: [-0.12, 0.1, 0.0] }),
    ...[0, 1].map(k => P(`Reservoirrubber ${k + 1}`, G.cyl('y', 0.011, 0.011, 0.02, 12), MAT.rubber, { d: 'Rubber doorvoer tussen reservoir en cilinderhuis.', p: [mp[0], mp[1] + 0.047, mp[2] + (k ? 0.04 : -0.01)], ex: [0, 0.07, k ? 0.04 : -0.04] })),
    ...[0, 1].map(k => P(`Leidingaansluiting ${k + 1}`, merge([chsNut('x', 0.0085, 0.012), xf(G.cyl('x', 0.0045, 0.0045, 0.03, 8), [0.02, 0, 0])]), MAT.steel, { d: 'Wartelaansluiting van een remleiding op de hoofdremcilinder.', p: [mp[0] + 0.0165, mp[1] - 0.006, mp[2] + (k ? 0.06 : 0.0)], ex: [0.14, -0.04, k ? 0.04 : -0.0] }))]);
  const boost = A('Rembekrachtiger', { d: 'Vacuümbekrachtiger die de pedaalkracht versterkt met onderdruk uit het inlaatspruitstuk (aannemelijk; opbouw gebruikelijk voor dit type).', ex: [0, 0.1, -0.12] }, [
    P('Bekrachtigerhuis', G.lathe('z', [[0.03, -0.09], [0.12, -0.07], [0.125, -0.02], [0.125, 0.02], [0.12, 0.07], [0.03, 0.09]], 40, 'boost'), MAT.darkSteel, { d: 'Tweedelig stalen huis (voorste en achterste schaal) van de bekrachtiger.', p: bp, ex: [0, 0, 0] }),
    P('Membraan', annulus(0.03, 0.118, 0.006, 'z', 32), MAT.rubber, { d: 'Rubber membraan met stalen plaat dat het huis in twee kamers verdeelt.', p: bp, ex: [0, 0, -0.1], inner: true }),
    P('Duwstang', G.cyl('z', 0.005, 0.005, 0.16, 8), MAT.steel, { d: 'Stang tussen pedaal (interieur) en membraan, en door naar de hoofdremcilinder.', p: [bp[0], bp[1], bp[2] + 0.02], ex: [0, 0, -0.2], inner: true }),
    P('Vacuumaansluiting', merge([G.cyl('x', 0.009, 0.009, 0.03, 10), xf(G.cyl('y', 0.007, 0.007, 0.03, 10), [0.015, -0.01, 0])]), MAT.plastic, { d: 'Aansluiting van de vacuümslang met geïntegreerde terugslagklep.', p: [bp[0] + 0.0, bp[1] + 0.115, bp[2] + 0.05], ex: [0.12, 0.12, 0.0] }),
    ...[0, 1, 2, 3].map(k => P(`Bekrachtigermoer ${k + 1}`, chsNut('z', 0.0095, 0.01), MAT.steel, { d: 'Moer op een tapeind: bevestigt de bekrachtiger aan het schutbord.', p: [bp[0] + (k < 2 ? 0.1 : -0.1), bp[1] + (k % 2 ? 0.1 : -0.1), bp[2] - 0.089], ex: [0, 0, -0.22 - k * 0.02] }))]);
  const absU = A('ABS/ESP-unit', { d: 'Hydraulische modulator met pomp en regelkleppen voor ABS, EBV, noodremassistent en ESP, met regelunit, drukopnemer en beugel; de plaats aan de passagierszijde van de motorruimte is geschat, de uitvoering (Bosch ESP 8.0) aannemelijk.', ex: [-0.1, 0.12, 0] }, [
    P('Hydraulisch blok', merge([chsRb(0.1, 0.09, 0.09, 0.008), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => xf(G.cyl('y', 0.0045, 0.0045, 0.012, 8), [-0.042 + (k % 4) * 0.028, 0.049, k < 4 ? -0.022 : 0.022]))]), MAT.alu, { d: 'Aluminium blok met boringen en vier uitgangen naar de wielen en twee ingangen van de hoofdremcilinder.', p: ab, ex: [0, -0.04, 0] }),
    P('Pompmotor', G.cyl('x', 0.032, 0.032, 0.06, 20), MAT.darkSteel, { d: 'Elektromotor met retourpomp voor de afgetapte remvloeistof.', p: [ab[0] - 0.08, ab[1], ab[2]], ex: [-0.14, 0, 0] }),
    P('Regelunit', chsRb(0.1, 0.034, 0.09, 0.008), MAT.ecu, { d: 'Regelunit met magneetspoelen en elektronica, op het hydraulische blok geklikt.', p: [ab[0], ab[1] - 0.062, ab[2]], ex: [0, -0.12, 0] }),
    P('Stekker', chsRb(0.03, 0.026, 0.04, 0.004), MAT.plastic, { d: 'Meerpolige stekker van de regelunit.', p: [ab[0], ab[1] - 0.068, ab[2] + 0.065], ex: [0, -0.1, 0.1] }),
    P('Drukopnemer', G.cyl('y', 0.011, 0.011, 0.03, 10), MAT.steel, { d: 'Sensor die de druk in het remcircuit meet (voor ESP).', p: [ab[0] + 0.04, ab[1] + 0.06, ab[2] - 0.005], ex: [0, 0.14, 0] }),
    P('ABS-beugel', merge([xf(chsRb(0.12, 0.012, 0.1, 0.003), [0, -0.05, 0]), xf(chsRb(0.012, 0.1, 0.1, 0.003), [0.063, 0, 0])]), MAT.darkSteel, { d: 'Stalen beugel op het spatbordframe waaraan de unit elastisch hangt.', p: ab, ex: [0.12, -0.06, 0] }),
    ...[0, 1].map(k => P(`Trillingsdemper ${k + 1}`, G.cyl('y', 0.014, 0.014, 0.014, 12), MAT.rubber, { d: 'Rubber ophanging die trillingen van de pomp isoleert.', p: [ab[0] + (k === 2 ? 0.03 : -0.04 + k * 0.02), ab[1] - 0.0575, ab[2] + (k === 2 ? 0.0 : -0.03 + k * 0.06)], ex: [0, -0.06, 0] })),
    ...[0, 1].map(k => P(`Beugelbout ${k + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout van de ABS-beugel.', p: [ab[0] - 0.04 + k * 0.05, ab[1] - 0.075, ab[2] + (k ? 0.03 : -0.03)], ex: [0, -0.2, 0] }))]);
  const line = (nm, pts, ex, d) => P(nm, tube(pts, 0.0024, Math.max(24, pts.length * 14), 6), MAT.steel, { d, ex });
  const lines = A('Remleidingen', { d: 'Stalen remleidingen per circuit: twee van de hoofdremcilinder naar de ABS/ESP-unit en vier van de unit naar de wielen, waar een flexibele slang het laatste stuk overneemt.', ex: [0, -0.06, 0] }, [
    line('Leiding hoofdcilinder primair', [[mp[0] + 0.03, mp[1] - 0.006, mp[2] + 0.0], [0.3, 0.68, 1.26], [0.0, 0.7, 1.2], [ab[0] + 0.03, ab[1] + 0.049, ab[2] - 0.022]], [0, 0.1, 0.1], 'Leiding van het primaire circuit naar de ABS/ESP-unit.'),
    line('Leiding hoofdcilinder secundair', [[mp[0] + 0.03, mp[1] - 0.012, mp[2] + 0.06], [0.3, 0.67, 1.31], [0.0, 0.69, 1.22], [ab[0] + 0.0, ab[1] + 0.049, ab[2] + 0.022]], [0, 0.12, 0.1], 'Leiding van het secundaire circuit naar de ABS/ESP-unit.'),
    line('Remleiding linksvoor', [[ab[0] + 0.03, ab[1] + 0.049, ab[2] + 0.022], [0.0, 0.64, 1.1], [0.2, 0.54, 1.09], [0.4, 0.515, 1.10], [0.56, 0.52, 1.16], [0.64, 0.58, 1.22], [0.61, 0.546, fz]], [0.08, 0.1, 0.05], 'Vaste leiding naar de flexibele slang op de linkervoorveerpoot.'),
    line('Remleiding rechtsvoor', [[ab[0] - 0.03, ab[1] + 0.049, ab[2] + 0.022], [ab[0] - 0.03, ab[1] + 0.06, ab[2] + 0.08], [-0.36, 0.60, 1.18], [-0.50, 0.60, 1.17], [-0.60, 0.60, 1.19], [-0.62, 0.60, 1.27], [-0.61, 0.546, fz]], [-0.08, 0.1, 0.05], 'Vaste leiding naar de flexibele slang op de rechtervoorveerpoot.'),
    line('Remleiding linksachter', [[ab[0] + 0.0, ab[1] - 0.04, ab[2] - 0.02], [-0.28, 0.5, 1.02], [-0.25, 0.16, 0.6], [-0.25, 0.16, -0.9], [0.3, 0.2, -1.25], [0.64, 0.4, rz]], [0.06, -0.06, 0], 'Vaste leiding langs de vloer naar de flexibele slang op de linker langsarm.'),
    line('Remleiding rechtsachter', [[ab[0] - 0.02, ab[1] - 0.04, ab[2] - 0.02], [-0.3, 0.5, 1.02], [-0.3, 0.16, 0.6], [-0.3, 0.16, -0.9], [-0.4, 0.2, -1.25], [-0.64, 0.4, rz]], [-0.06, -0.06, 0], 'Vaste leiding langs de vloer naar de flexibele slang op de rechter langsarm.'),
    clip('Leidingklem 1', [-0.28, 0.5, 1.02], [0, -0.1, 0.1]), clip('Leidingklem 2', [-0.25, 0.16, 0.2], [0, -0.1, 0]), clip('Leidingklem 3', [-0.25, 0.16, -0.5], [0, -0.1, 0])]);
  // ---- parkeerrem: een centrale unit onder de vloer, twee kabels naar de achterklauwen ----
  // De unit hangt links van de middentunnel op de hoogte van de achteras, dicht onder de vloer (onderkant vloer daar y 0,19 tot 0,21) en tussen de achterwielen
  // vandaan gezien achter de band: in het zijaanzicht is hij niet te zien.
  const ex0 = 0.28, ez0 = -1.40, ey0 = 0.14;
  const cabs = sg => [[sg > 0 ? ex0 + 0.075 : ex0 - 0.075, ey0, ez0 - 0.075], [sg * 0.46, 0.17, ez0 - 0.1], [sg * 0.6, 0.21, ez0 - 0.07], [sg * lev[0], lev[1], lev[2]]];
  const epb = A('Parkeerrem', { d: 'Elektrische parkeerrem: één gesloten unit onder het vloerpaneel bij de achteras (links van de middentunnel, achter de brandstoftank) met elektromotor, wormoverbrenging en kabelverdeler; twee stalen kabels trekken de hefbomen op de achterklauwen aan. Schakelaar naast de keuzehendel; automatisch aan bij motor uit. De noodontgrendeling via een kabel in de bagageruimte is niet gemodelleerd.', ex: [0, -0.3, 0] }, [
    P('Behuizing onder', chsRb(0.18, 0.04, 0.14, 0.01), MAT.plastic, { d: 'Onderste helft van de afgedichte behuizing.', p: [ex0, ey0 - 0.02, ez0], ex: [0, -0.12, 0] }),
    P('Behuizingsdeksel', chsRb(0.18, 0.03, 0.14, 0.01), MAT.plasticGrey, { d: 'Deksel met afdichting.', p: [ex0, ey0 + 0.03, ez0], ex: [0, 0.18, 0] }),
    P('Elektromotor', G.cyl('x', 0.022, 0.022, 0.07, 16), MAT.darkSteel, { d: 'Gelijkstroommotor die de kabels aantrekt of loslaat.', p: [ex0 - 0.04, ey0, ez0 + 0.03], ex: [-0.1, 0, 0.1], inner: true }),
    P('Wormas', merge([G.cyl('x', 0.007, 0.007, 0.08, 10), xf(spring(0.0095, 0.0025, 0.05, 6, 'x'), [0, 0, 0])]), MAT.steel, { d: 'As met worm op de motoras (schematisch).', p: [ex0 + 0.02, ey0, ez0 + 0.03], ex: [0.12, 0, 0.06], inner: true }),
    P('Wormwiel', gear(22, 0.032, 0.029, 0.012, 0.006, 'y'), MAT.steel, { d: 'Wormwiel dat de spindel of kabeltrommel aandrijft.', p: [ex0 + 0.02, ey0, ez0 - 0.01], ex: [0.0, 0.08, 0], inner: true }),
    P('Kabelverdeler', merge([G.cyl('x', 0.008, 0.008, 0.11, 10), xf(chsRb(0.02, 0.02, 0.03, 0.004), [0.0, 0, 0])]), MAT.darkSteel, { d: 'Evenaar die de trekkracht gelijk over de linker en rechter kabel verdeelt.', p: [ex0, ey0 + 0.0, ez0 - 0.06], ex: [0, 0.0, -0.12], inner: true }),
    P('Printplaat parkeerrem', G.box(0.12, 0.004, 0.09), MAT.ecu, { d: 'Elektronica (FPA-computer) die de parkeerrem aanstuurt.', p: [ex0, ey0 + 0.012, ez0], ex: [0, 0.1, 0], inner: true }),
    P('Stekker parkeerrem', chsRb(0.03, 0.026, 0.04, 0.004), MAT.plastic, { d: 'Meerpolige stekker van de unit.', p: [ex0 + 0.1, ey0, ez0 + 0.0], ex: [0.12, 0, 0] }),
    P('Montagebeugel', merge([chsRb(0.2, 0.01, 0.16, 0.003), xf(chsRb(0.01, 0.06, 0.16, 0.003), [0.1, 0.035, 0]), xf(chsRb(0.01, 0.06, 0.16, 0.003), [-0.1, 0.035, 0])]), MAT.darkSteel, { d: 'Stalen beugel waarmee de unit onder de vloer hangt.', p: [ex0, ey0 - 0.045, ez0], ex: [0, -0.2, 0] }),
    ...[0, 1, 2].map(k => P(`Beugelbout ${k + 1}`, hexBolt(0.03, 0.008, 'y'), MAT.steel, { d: 'Bout waarmee de beugel aan de vloer zit.', p: [ex0 + (k === 2 ? 0.0 : (k ? 0.09 : -0.09)), ey0 - 0.05, ez0 + (k === 2 ? -0.07 : 0.06)], ex: [0, -0.3, 0] })),
    ...[1, -1].map(sg => P(`Parkeerremkabel ${sideName(sg)}`, tube(cabs(sg), 0.0022, 40, 6), MAT.steel, { d: `Binnenkabel naar de hefboom op de ${sideName(sg)} achterklauw.`, ex: [sg * 0.08, -0.04, 0] })),
    ...[1, -1].map(sg => P(`Kabelhuls ${sideName(sg)}`, tube([[sg > 0 ? ex0 + 0.075 : ex0 - 0.075, ey0, ez0 - 0.075], [sg * 0.46, 0.17, ez0 - 0.1], [sg * 0.58, 0.2, ez0 - 0.08]], 0.0042, 28, 6), MAT.rubber, { d: `Buitenkabel (huls) van de ${sideName(sg)} parkeerremkabel.`, ex: [sg * 0.1, -0.08, 0] }))]);
  return A('Remsysteem', { d: 'Hydraulisch remsysteem met bekrachtiger, tandem-hoofdremcilinder, ABS/ESP-unit, vaste leidingen en de elektrische parkeerrem. Voor: geventileerde schijven 296 × 26 mm met zwevende klauw (zuiger Ø57 mm); achter: massieve schijven 300 × 11 mm met zwevende klauw (zuiger Ø38 mm) met parkeerremhefboom.', spec: [['Schijf voor', '296 × 26 mm, geventileerd'], ['Zuiger voor', 'Ø 57 mm'], ['Schijf achter', '300 × 11 mm, massief'], ['Zuiger achter', 'Ø 38 mm'], ['Parkeerrem', 'elektrisch, centrale unit']], ex: [1.55, 0.55, 1.0] }, [boost, mc, absU, lines, epb]);
}

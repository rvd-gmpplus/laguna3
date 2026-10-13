/* ===================== onderstel: vooras, stuurinrichting, achteras, wielen, remmen ===================== */
// hoek-assemblages worden voor links gebouwd (x > 0) en voor rechts gespiegeld (schaal x = -1)
function discGeo(rIn, rOut, vented, key) {
  return cache('disc' + key, () => {
    const hat = G.lathe('y', [[0.035, 0.036], [0.072, 0.036], [0.076, 0.03], [0.084, 0.015], [rIn, 0.014]], 40);
    const parts = [hat];
    if (vented) {
      parts.push(G.lathe('y', [[rIn, 0.013], [rOut, 0.013], [rOut, 0.004], [rIn, 0.004], [rIn, 0.013]], 48));
      parts.push(G.lathe('y', [[rIn, -0.004], [rOut, -0.004], [rOut, -0.013], [rIn, -0.013], [rIn, -0.004]], 48));
      parts.push(blades(36, rIn, rOut, 0.008, 0.004, 0, 'y'));
    } else parts.push(G.lathe('y', [[rIn, 0.0055], [rOut, 0.0055], [rOut, -0.0055], [rIn, -0.0055], [rIn, 0.0055]], 48));
    return yTo(merge(parts), 'x');
  });
}
function caliper(label, x, z0, phi, rp, front) {
  const r = rp, pos = [x, AY + r * Math.sin(phi), z0 + r * Math.cos(phi)];
  const w = front ? 0.10 : 0.08, t = front ? 0.013 : 0.0055;
  return A(label, { d: front ? 'Zwevende enkelzuigerremklauw.' : 'Remklauw achter.', p: pos, r: [HALF - phi, 0, 0], ex: [0.06, 0.14, 0] }, [
    P('Remklauwhuis', merge([xf(G.rbox(0.07, 0.05, w, 0.012), [-0.005, 0.02, 0]), xf(G.cyl('x', 0.032, 0.032, 0.03, 24), [-0.035, -0.005, 0]), xf(G.rbox(0.012, 0.05, w - 0.01, 0.004), [0.026, -0.01, 0])]), MAT.iron, { d: 'Gietijzeren klauwhuis met de remzuiger.', ex: [0, 0.09, 0] }),
    P('Remklauwdrager', G.rbox(0.06, 0.02, w + 0.03, 0.005), MAT.darkSteel, { d: 'Drager die aan de fusee is geschroefd.', p: [-0.005, -0.045, 0], ex: [0, -0.06, 0] }),
    P('Remblok binnen', G.rbox(0.009, 0.045, w - 0.015, 0.004), MAT.friction, { d: 'Remvoering aan de binnenzijde.', p: [-(t + 0.0055), 0, 0], ex: [-0.06, 0.03, 0] }),
    P('Rugplaat binnen', G.box(0.003, 0.05, w - 0.01), MAT.steel, { d: 'Stalen rugplaat van het remblok.', p: [-(t + 0.0115), 0, 0], ex: [-0.085, 0.03, 0] }),
    P('Remblok buiten', G.rbox(0.009, 0.045, w - 0.015, 0.004), MAT.friction, { d: 'Remvoering aan de buitenzijde.', p: [t + 0.0055, 0, 0], ex: [0.07, 0.03, 0] }),
    P('Rugplaat buiten', G.box(0.003, 0.05, w - 0.01), MAT.steel, { d: 'Stalen rugplaat van het remblok.', p: [t + 0.0115, 0, 0], ex: [0.095, 0.03, 0] }),
    P('Remzuiger', G.cyl('x', 0.027, 0.027, 0.03, 24), MAT.steel, { d: 'Hydraulische zuiger die de blokken tegen de schijf drukt.', p: [-0.04, -0.005, 0], ex: [-0.12, 0, 0] }),
    P('Geleidepen boven', G.cyl('x', 0.006, 0.006, 0.06, 10), MAT.steel, { d: 'Glijpen waarover de klauw zweeft.', p: [-0.02, -0.03, w / 2 + 0.005], ex: [-0.06, -0.03, 0.05] }),
    P('Geleidepen onder', G.cyl('x', 0.006, 0.006, 0.06, 10), MAT.steel, { d: 'Glijpen waarover de klauw zweeft.', p: [-0.02, -0.03, -w / 2 - 0.005], ex: [-0.06, -0.03, -0.05] }),
    P('Ontluchtingsnippel', G.cyl('y', 0.003, 0.004, 0.012, 8), MAT.steel, { d: 'Nippel om lucht uit het remsysteem te verwijderen.', p: [-0.05, 0.03, 0.02], ex: [0, 0.16, 0] }),
  ]);
}
function frontCorner(s) {
  const z0 = AXF, n = s > 0 ? 'linksvoor' : 'rechtsvoor';
  const knuckle = merge([xf(G.cyl('x', 0.055, 0.055, 0.05, 24), [0.715, AY, z0]), rodBetween([0.71, AY + 0.03, z0], [0.69, 0.5, z0 - 0.005], 0.02), xf(G.cyl('y', 0.034, 0.034, 0.07, 20), [0.685, 0.535, z0]), rodBetween([0.72, AY - 0.03, z0], [0.735, 0.225, z0 + 0.01], 0.018), rodBetween([0.7, AY - 0.01, z0 - 0.03], [0.7, 0.31, z0 - 0.16], 0.014)]);
  const arm = plan(shapeOf([[0.37, z0 + 0.1], [0.37, z0 - 0.22], [0.45, z0 - 0.22], [0.735, z0], [0.735, z0 + 0.04], [0.45, z0 + 0.1]]), 0.025);
  const sd = V3(-0.085, 0.425, -0.03);
  const seat = (sg, key) => G.lathe('y', [[0.026, 0], [0.085, sg * 0.004], [0.088, sg * 0.012], [0.084, sg * 0.014], [0.026, sg * 0.006]], 36, key);
  const strut = A(`Veerpoot ${n}`, { d: 'McPherson-veerpoot: schokdemper met schroefveer, tevens fuseedraaipunt.', p: [0.685, 0.5, z0], q: quatFromTo(V3(0, 1, 0), sd), ex: [0.06, 0.32, 0] }, [
    P('Schokdemper', merge([xf(G.cyl('y', 0.026, 0.026, 0.27, 20), [0, 0.135, 0]), xf(G.cyl('y', 0.011, 0.011, 0.13, 12), [0, 0.335, 0]), xf(G.box(0.06, 0.04, 0.05), [0, 0.02, 0])]), MAT.darkSteel, { d: 'Gasgevulde schokdemper met zuigerstang.', ex: [0, -0.2, 0] }),
    P('Veerschotel onder', seat(1, 'seatL'), MAT.darkSteel, { d: 'Onderste veerschotel op de demperbuis.', p: [0, 0.19, 0], ex: [0, -0.06, 0] }),
    P('Schroefveer voor', spring(0.074, 0.0065, 0.19, 5.5), MAT.steel, { d: 'Draagt het gewicht van de auto.', p: [0, 0.295, 0] }),
    P('Stofhoes veerpoot', G.lathe('y', bellows(0.03, 0.022, 0.09, 5), 24, 'boot'), MAT.rubber, { d: 'Beschermt de zuigerstang tegen vuil.', p: [0, 0.28, 0], ex: [0.13, 0.02, 0] }),
    P('Aanslagrubber', G.cyl('y', 0.022, 0.02, 0.035, 16), MAT.rubber, { d: 'Vangt het uitveren aan het eind van de slag op.', p: [0, 0.375, 0], ex: [0.13, 0.06, 0] }),
    P('Veerschotel boven', seat(-1, 'seatU'), MAT.darkSteel, { d: 'Bovenste veerschotel.', p: [0, 0.395, 0], ex: [0, 0.1, 0] }),
    P('Veerpootlager', annulus(0.03, 0.055, 0.016, 'y', 32), MAT.bearing, { d: 'Draaglager zodat de veerpoot mee kan sturen.', p: [0, 0.405, 0], ex: [0, 0.14, 0] }),
    P('Veerpootsteunlager', G.lathe('y', [[0.012, 0], [0.075, 0], [0.075, 0.022], [0.05, 0.032], [0.012, 0.032]], 32, 'topm'), MAT.rubber, { d: 'Rubber steunlager in de veerpoottoren.', p: [0, 0.412, 0], ex: [0, 0.18, 0] }),
    P('Veerpootmoer', G.cyl('y', 0.011, 0.011, 0.01, 6), MAT.steel, { d: 'Borgmoer bovenop de zuigerstang.', p: [0, 0.452, 0], ex: [0, 0.23, 0] }),
  ]);
  return A(`Wielophanging ${n}`, { d: `Wielophanging ${n}: fusee, draagarm, veerpoot, wielnaaf en schijfrem.`, s: [s, 1, 1], ex: [s * 0.34, 0, 0] }, [
    P('Fusee', knuckle, MAT.iron, { d: 'Gietijzeren wieldrager (fusee) met naaf, veerpoot- en stuuraansluiting.' }),
    P('Wiellager', G.cyl('x', 0.04, 0.04, 0.04, 24), MAT.bearing, { d: 'Dubbelrijig kogellager in de fusee.', p: [0.745, AY, z0], ex: [0.1, 0.1, 0] }),
    P('Wielnaaf', merge([G.cyl('x', 0.042, 0.042, 0.035, 24), xf(G.cyl('x', 0.075, 0.075, 0.008, 32), [0.018, 0, 0])]), MAT.steel, { d: 'Naaf met flens waarop het wiel met vijf bouten vastzit (steek 5×114,3).', p: [0.79, AY, z0], ex: [0.2, 0, 0] }),
    P('Asmoer', G.cyl('x', 0.014, 0.014, 0.012, 6), MAT.steel, { d: 'Moer die de aandrijfas in de naaf vastzet.', p: [0.824, AY, z0], ex: [0.3, 0, 0] }),
    P('ABS-sensorring', gear(48, 0.05, 0.047, 0.006, 0.04), MAT.steel, { d: 'Getande ring voor de wielsnelheidsmeting.', p: [0.73, AY, z0], ex: [-0.05, 0.12, 0] }),
    P('ABS-sensor', G.cyl('y', 0.007, 0.007, 0.04, 10), MAT.plastic, { d: 'Wielsnelheidssensor voor ABS en ESP.', p: [0.728, AY + 0.07, z0 + 0.04], ex: [-0.05, 0.16, 0.05] }),
    P('Remschijf voor', discGeo(0.1, 0.148, true, 'F'), MAT.iron, { d: 'Geventileerde remschijf.', p: [0.765, AY, z0], ex: [0.14, 0, 0] }),
    caliper(`Remklauw ${n}`, 0.765, z0, 2.79, 0.124, true),
    P('Remslang voor', tube([[0.72, AY + 0.09, z0 - 0.13], [0.69, 0.55, z0 - 0.12], [0.66, 0.62, z0 - 0.05]], 0.006, 24, 8), MAT.rubber, { d: 'Flexibele remleiding naar de klauw.', ex: [0, 0.12, -0.06] }),
    P('Draagarm', arm, MAT.darkSteel, { d: 'Onderste draagarm (triangel) tussen subframe en fusee.', p: [0, 0.225, 0], ex: [0, -0.16, 0] }),
    P('Fuseekogel', merge([G.sphere(0.02, 14), xf(G.cyl('y', 0.008, 0.008, 0.04, 10), [0, 0.02, 0])]), MAT.steel, { d: 'Kogelgewricht tussen draagarm en fusee.', p: [0.735, 0.235, z0 + 0.01], ex: [0.05, -0.1, 0] }),
    P('Draagarmrubber voor', G.cyl('z', 0.022, 0.022, 0.05, 16), MAT.rubber, { d: 'Rubberlager van de draagarm.', p: [0.37, 0.225, z0 + 0.07], ex: [-0.12, -0.12, 0.05] }),
    P('Draagarmrubber achter', G.cyl('y', 0.03, 0.03, 0.04, 16), MAT.rubber, { d: 'Rubberlager van de draagarm.', p: [0.4, 0.225, z0 - 0.19], ex: [-0.12, -0.12, -0.05] }),
    P('Stabilisatorstangetje', merge([rodBetween([0.55, 0.37, z0 + 0.05], [0.655, 0.56, z0 + 0.03], 0.007), xf(G.sphere(0.014, 10), [0.55, 0.37, z0 + 0.05]), xf(G.sphere(0.014, 10), [0.655, 0.56, z0 + 0.03])]), MAT.steel, { d: 'Koppelstang tussen stabilisatorstang en veerpoot.', ex: [-0.05, 0.1, 0.12] }),
    strut,
  ]);
}
function rearCorner(s) {
  const z0 = AXR, n = s > 0 ? 'linksachter' : 'rechtsachter';
  return A(`Wielophanging ${n}`, { d: `Wielophanging ${n}: naaf, lager en schijfrem.`, s: [s, 1, 1], ex: [s * 0.32, 0, 0] }, [
    P('Wielnaaf achter', merge([G.cyl('x', 0.045, 0.045, 0.05, 24), xf(G.cyl('x', 0.075, 0.075, 0.008, 32), [0.022, 0, 0])]), MAT.steel, { d: 'Naaf met geïntegreerd wiellager op de astap.', p: [0.785, AY, z0], ex: [0.2, 0, 0] }),
    P('Naafmoer', G.cyl('x', 0.014, 0.014, 0.012, 6), MAT.steel, { d: 'Borgmoer van de naaf.', p: [0.822, AY, z0], ex: [0.3, 0, 0] }),
    P('Remschijf achter', discGeo(0.09, 0.13, false, 'R'), MAT.iron, { d: 'Massieve remschijf.', p: [0.77, AY, z0], ex: [0.12, 0, 0] }),
    caliper(`Remklauw ${n}`, 0.77, z0, 2.79, 0.108, false),
    P('Stofschild achter', G.lathe('x', [[0.05, 0], [0.14, 0]], 40, 'shieldR'), MAT.darkSteel, { d: 'Afschermplaat achter de remschijf.', p: [0.728, AY, z0], ex: [-0.06, 0, 0] }),
    P('ABS-sensor achter', G.cyl('y', 0.007, 0.007, 0.04, 10), MAT.plastic, { d: 'Wielsnelheidssensor.', p: [0.73, AY + 0.065, z0 + 0.04], ex: [-0.05, 0.15, 0.05] }),
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

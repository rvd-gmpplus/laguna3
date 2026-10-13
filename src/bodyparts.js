/* ===================== carrosserie: onderdelen ===================== */
function archLip(s, z) {
  const g = new THREE.TorusGeometry(ARCH + 0.004, 0.011, 6, 44, PI); g.rotateY(HALF);
  g.translate(s * (HW(z) + 0.009), AY, z);
  return g;
}
function buildDoor(s, isFront) {
  const sn = sideName(s), pos = isFront ? 'voor' : 'achter';
  const z0 = isFront ? -0.25 : -1.06, z1 = isFront ? 0.92 : -0.27;
  const g0 = isFront ? -0.17 : -1.04, g1 = isFront ? 0.975 : -0.355;
  const zm = (z0 + z1) / 2;
  const vr = z => [Math.max(sAtY(z, 0.29), archS(z)) + 0.002, S4 - 0.001];
  const outer = lowSide(s, z0 + 0.004, z1 - 0.004, 34, vr, 22, ARCH_BREAKS);
  const inner = lowSide(s, z0 + 0.02, z1 - 0.02, 20, vr, 12, ARCH_BREAKS, 0.07);
  const trim = lowSide(s, z0 + 0.03, z1 - 0.03, 20, z => [Math.max(sAtY(z, 0.33), archS(z) + 0.02), S4 - 0.03], 12, ARCH_BREAKS, 0.115);
  const xin = HW(zm) - 0.075;
  const reg = merge([xf(G.box(0.012, 0.42, 0.02), [0, 0, 0], [0.55, 0, 0]), xf(G.box(0.012, 0.42, 0.02), [0, 0, 0], [-0.55, 0, 0]), xf(G.box(0.014, 0.02, 0.32), [0, 0.19, 0])]);
  const hy = 0.86, hz = z1 - 0.2, hx = surfX(hz, hy) + 0.014;
  const kids = [
    P('Buitenpaneel', outer, MAT.paint, { d: 'Geperste plaatstalen buitenhuid van het portier, in zilvergrijs metallic gelakt.', ex: [s * 0.24, 0, 0] }),
    P('Binnenpaneel (deurframe)', inner, MAT.paintIn, { d: 'Draagframe van het portier waarop raammechaniek, slot en bekleding vastzitten.' }),
    P('Zijruit', ghSide(s, g0, g1, 28, 0.012, 0.262, 10), MAT.glass, { d: 'Zakbare zijruit van gehard veiligheidsglas.', ex: [0, 0.42, 0] }),
    P('Raammechaniek', reg, MAT.steel, { d: 'Schaarmechaniek die de zijruit op en neer beweegt.', p: [s * xin, 0.66, zm], ex: [-s * 0.14, 0.12, 0] }),
    P('Raammotor', G.cyl('x', 0.032, 0.032, 0.05), MAT.darkSteel, { d: 'Elektromotor van de elektrische ruitbediening.', p: [s * (xin - 0.01), 0.5, zm - 0.14], ex: [-s * 0.2, -0.04, 0] }),
    P('Deurslot', G.rbox(0.035, 0.09, 0.06, 0.008), MAT.darkSteel, { d: 'Slotmechanisme met centrale vergrendeling; opent met de Renault-kaart.', p: [s * (HW(z0 + 0.05) - 0.045), 0.78, z0 + 0.045], ex: [0, 0, -0.16] }),
    P('Buitendeurgreep', G.rbox(0.03, 0.034, 0.17, 0.012), MAT.chrome, { d: 'Verchroomde deurgreep met sensor voor handsfree openen.', p: [s * hx, hy, hz], ex: [s * 0.36, 0, 0] }),
    P('Deurbekleding', trim, MAT.dash, { d: 'Binnenbekleding van het portier met armsteun en schakelaars.', ex: [-s * 0.28, 0, 0] }),
    P('Armsteun', G.rbox(0.07, 0.05, isFront ? 0.42 : 0.32, 0.02), MAT.leather, { d: 'Met beige leder beklede armsteun.', p: [s * (HW(zm) - 0.15), 0.64, zm - 0.02], ex: [-s * 0.36, 0, 0] }),
    P('Bose-luidspreker', G.lathe('x', [[0, 0.02], [0.03, 0.018], [0.07, 0.002], [0.08, 0], [0.08, -0.02], [0.03, -0.02], [0, -0.02]], 28, 'spk'), MAT.plastic, { d: 'Luidspreker van het Bose-audiosysteem.', p: [s * (HW(zm) - 0.1), 0.42, isFront ? z1 - 0.28 : zm], r: [0, 0, s > 0 ? PI : 0], ex: [-s * 0.32, 0, 0] }),
    P('Deurscharnier boven', G.rbox(0.05, 0.06, 0.04, 0.008), MAT.darkSteel, { d: 'Scharnier tussen portier en carrosserie.', p: [s * (HW(z1) - 0.03), 0.84, z1 - 0.012], ex: [0, 0, 0.14] }),
    P('Deurscharnier onder', G.rbox(0.05, 0.06, 0.04, 0.008), MAT.darkSteel, { d: 'Scharnier tussen portier en carrosserie.', p: [s * (HW(z1) - 0.03), 0.52, z1 - 0.012], ex: [0, 0, 0.14] }),
  ];
  if (isFront) {
    const mx = HW(0.86) + 0.06;
    kids.push(A('Buitenspiegel', { d: 'Elektrisch verstelbare en inklapbare buitenspiegel met geheugenfunctie.', ex: [s * 0.4, 0.22, 0.05] }, [
      P('Spiegelvoet', G.rbox(0.1, 0.045, 0.1, 0.012), MAT.blackGloss, { d: 'Voet waarmee de spiegel op het portier is bevestigd.', p: [s * (mx - 0.03), 1.02, 0.86], ex: [-s * 0.05, -0.06, 0] }),
      P('Spiegelkap', xf(G.sphere(0.06, 24), null, null, [1.85, 1.0, 0.95]), MAT.paint, { d: 'Spiegelkap in carrosseriekleur.', p: [s * (mx + 0.08), 1.06, 0.86], ex: [0, 0.1, 0.06] }),
      P('Spiegelglas', xf(G.sphere(0.052, 20), null, null, [1.8, 0.95, 0.06]), MAT.reflector, { d: 'Verwarmd spiegelglas.', p: [s * (mx + 0.08), 1.06, 0.806], ex: [0, 0, -0.12] }),
      P('Spiegelmotor', G.rbox(0.05, 0.04, 0.04, 0.006), MAT.darkSteel, { d: 'Verstelmotor van het spiegelglas.', p: [s * (mx + 0.06), 1.06, 0.86], ex: [0, -0.1, 0] }),
    ]));
  }
  return A(`Portier ${sn}${pos}`, { d: `Compleet ${isFront ? 'voor' : 'achter'}portier aan de ${sn}kant: plaatwerk, glas, mechaniek en bekleding.`, ex: [s * 0.88, 0.02, isFront ? 0.18 : -0.24] }, kids);
}

function buildHeadlight(s) {
  const glass = lowSide(s, 1.861, 2.337, 30, z => [hlLow(z), S4 - 0.001], 10, [], -0.002);
  const house = lowSide(s, 1.87, 2.33, 24, z => [hlLow(z), S4 - 0.002], 8, [], 0.055);
  const pz = 2.2, py = YT(pz) - 0.085, px = surfX(pz, py) - 0.07;
  return A(`Koplamp ${sn(s)}`, { d: 'Bi-xenon koplampunit; standaard op de Laguna Initiale (fase 2).', ex: [s * 0.4, 0.14, 0.88] }, [
    P('Koplampglas', glass, MAT.lensClear, { d: 'Polycarbonaat afdekglas.', ex: [s * 0.1, 0.05, 0.16] }),
    P('Koplamphuis', house, MAT.reflector, { d: 'Behuizing met verchroomde reflectoren.', ex: [-s * 0.05, 0, -0.08] }),
    P('Projectormodule', merge([xf(G.cyl('z', 0.036, 0.036, 0.07), [0, 0, 0]), xf(G.sphere(0.034, 18), [0, 0, 0.04], null, [1, 1, 0.45])]), MAT.reflector, { d: 'Bi-xenon projector met lens; een klepje wisselt tussen dim- en grootlicht.', p: [px, py, pz], ex: [0, 0.12, 0.04] }),
    P('Xenonlamp', G.cyl('z', 0.009, 0.009, 0.05, 12), MAT.ceramic, { d: 'Gasontladingslamp (xenon).', p: [px, py, pz - 0.07], ex: [0, 0.16, -0.1] }),
    P('Voorschakelapparaat', G.rbox(0.08, 0.025, 0.08, 0.006), MAT.ecu, { d: 'Ballast die de hoge ontsteekspanning voor de xenonlamp levert.', p: [px - s * 0.02, py - 0.075, pz - 0.05], ex: [0, -0.16, 0] }),
    P('Knipperlicht', G.rbox(0.05, 0.02, 0.06, 0.008), MAT.amber, { d: 'Richtingaanwijzer in de koplampunit.', p: [s * (surfX(2.06, YT(2.06) - 0.03) - 0.03), YT(2.06) - 0.035, 2.06], ex: [s * 0.1, 0.1, 0] }),
  ]);
}
function sn(s) { return sideName(s); }

function buildTaillight(s) {
  const lens = lowSide(s, -2.337, -1.981, 22, z => [tlLow(z), S4 - 0.001], 8, [], -0.002);
  const house = lowSide(s, -2.33, -1.99, 16, z => [tlLow(z), S4 - 0.002], 6, [], 0.06);
  const fy = 0.92, fx = s * 0.66, fz = faceZ(ZR, -1, 0.66, fy) - 0.006;
  return A(`Achterlicht ${sn(s)}`, { d: 'Achterlichtunit met remlicht, achterlicht, knipperlicht en achteruitrijlicht.', ex: [s * 0.42, 0.14, -0.9] }, [
    P('Lens zijkant', lens, MAT.lensRed, { d: 'Rode afdeklens op de hoek van de carrosserie.', ex: [s * 0.08, 0, -0.05] }),
    P('Lens achterzijde', G.rbox(0.2, 0.075, 0.02, 0.01), MAT.lensRed, { d: 'Rode lens aan de achterzijde.', p: [fx, fy, fz], ex: [0, 0, -0.12] }),
    P('Lichthuis', house, MAT.plastic, { d: 'Behuizing met reflectoren.', ex: [-s * 0.06, 0, 0.05] }),
    P('Lampdrager', G.rbox(0.03, 0.08, 0.14, 0.006), MAT.ecu, { d: 'Printplaat/lampdrager met fittingen en stekker.', p: [s * (HW(-2.2) - 0.09), YT(-2.2) - 0.07, -2.2], ex: [-s * 0.16, 0, 0] }),
  ]);
}

function buildBody() {
  const L = 1, R = -1;
  /* --- carrosseriekooi (ruwbouw) --- */
  const floorVR = z => { const lim = inArch(z) ? S1 * 0.6 / (HW(z) - radii(z)[0]) : S1; return [-lim, lim]; };
  const biwKids = [
    P('Bodemplaat', patch(lowPt, -1.8, 1.1, 60, floorVR, 14, ARCH_BREAKS), MAT.underbody, { d: 'Vloer van de ruwbouw met tunnel en bevestigingspunten voor stoelen en onderstel.' }),
    P('Dakpaneel', patch(ghPt, RW0, WS1, 30, () => [0.36, 0.64], 16), MAT.paint, { d: 'Dakplaat, gelast op de dakrails.' }),
    P('Schutbord', G.rbox(1.62, 0.68, 0.012, 0.004), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur.', p: [0, 0.58, 1.0] }),
    P('Radiateurdrager', merge([xf(G.box(1.2, 0.06, 0.06), [0, 0.75, 0]), xf(G.box(1.1, 0.06, 0.06), [0, 0.27, 0]), xf(G.box(0.06, 0.48, 0.06), [0.56, 0.51, 0]), xf(G.box(0.06, 0.48, 0.06), [-0.56, 0.51, 0]), xf(G.box(0.05, 0.42, 0.05), [0, 0.51, 0])]), MAT.plastic, { d: 'Frontmodule (slotplaat) die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 2.12] }),
    P('Bumperbalk voor', merge([G.box(1.24, 0.1, 0.07), xf(G.box(0.09, 0.09, 0.12), [0.56, 0, -0.08]), xf(G.box(0.09, 0.09, 0.12), [-0.56, 0, -0.08])]), MAT.steel, { d: 'Stalen botsbalk met kreukelzones achter de voorbumper.', p: [0, 0.46, 2.27] }),
    P('Bumperbalk achter', G.box(1.2, 0.1, 0.07), MAT.steel, { d: 'Stalen botsbalk achter de achterbumper.', p: [0, 0.5, -2.27] }),
    P('Achterpaneel', G.rbox(1.42, 0.3, 0.012, 0.004), MAT.paintIn, { d: 'Dwarspaneel onder de achterklepopening.', p: [0, 0.5, -2.29] }),
  ];
  for (const s of [L, R]) {
    const n = sn(s);
    biwKids.push(
      P(`Dorpel ${n}`, lowSide(s, -0.994, 0.968, 30, z => [S1, sAtY(z, 0.29)], 8), MAT.paint, { d: 'Dorpel: dragend kokerprofiel onder de portieren.' }),
      P(`Achterscherm ${n}`, merge([lowSide(s, -2.33, -1.075, 44, z => [z < -1.8 ? sAtY(z, 0.645) : Math.max(sAtY(z, 0.29), archS(z)), inTL(z) ? tlLow(z) : S4 - 0.001], 20, ARCH_BREAKS.concat([-1.801, -1.799, -1.98])), archLip(s, AXR)]), MAT.paint, { d: 'Achterzijpaneel, gelast deel van de ruwbouw.' }),
      P(`A-stijl ${n}`, merge([ghSide(s, WS1, WS0, 18, 0.262, 0.36, 4), ghSide(s, 0.975, WS0, 4, 0, 0.27, 4)]), MAT.paint, { d: 'Voorste dakstijl langs de voorruit.' }),
      P(`Dakrail ${n}`, ghSide(s, RW0, WS1, 24, 0.27, 0.36, 4), MAT.paint, { d: 'Zijdelingse dakligger tussen A- en C-stijl.' }),
      P(`B-stijl ${n}`, ghSide(s, -0.355, -0.17, 4, 0, 0.27, 6), MAT.blackGloss, { d: 'Middenstijl met hoogglans zwarte afdekking.' }),
      P(`B-stijl constructie ${n}`, G.box(0.06, 0.95, 0.11), MAT.paintIn, { d: 'Verstevigd profiel in de middenstijl.', p: [s * 0.82, 0.74, -0.26] }),
      P(`C-stijl ${n}`, merge([ghSide(s, SP, -1.455, 18, 0, 0.27, 6), ghSide(s, SP, RW0, 18, 0.27, 0.36, 4)]), MAT.paint, { d: 'Achterste dakstijl naast de achterklep.' }),
      P(`Langsligger voor ${n}`, G.box(0.075, 0.12, 1.28), MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt.', p: [s * 0.56, 0.36, 1.62] }),
      P(`Veerpoottoren ${n}`, G.cyl('y', 0.095, 0.125, 0.25, 24, true), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.6, 0.81, 1.33] }),
    );
  }
  const biw = A('Carrosseriekooi', { d: 'De gelaste ruwbouw: vloer, stijlen, dak en draagprofielen.', exs: 0.85 }, biwKids);

  /* --- motorkap --- */
  const hood = A('Motorkap', { d: 'Motorkap met binnenframe, isolatie, scharnieren en slot.', ex: [0, 0.6, 0.38] }, [
    P('Buitenpaneel motorkap', patch(lowPt, 1.13, 2.24, 44, () => [S4, 2 - S4], 24), MAT.paint, { d: 'Buitenhuid van de motorkap.', ex: [0, 0.14, 0] }),
    P('Binnenframe motorkap', patch((z, p) => { const q = lowPt(z, p); return [q[0] * 0.98, q[1] - 0.035, z]; }, 1.15, 2.22, 24, () => [S4 + 0.01, 2 - S4 - 0.01], 12), MAT.paintIn, { d: 'Verstevigend binnenframe.' }),
    P('Motorkapisolatie', patch((z, p) => { const q = lowPt(z, p); return [q[0] * 0.95, q[1] - 0.048, z]; }, 1.2, 2.12, 20, () => [S4 + 0.03, 2 - S4 - 0.03], 10), MAT.plastic, { d: 'Geluids- en hitte-isolatie aan de onderzijde.', ex: [0, -0.12, 0] }),
    P('Motorkapscharnier links', G.rbox(0.03, 0.05, 0.12, 0.006), MAT.darkSteel, { d: 'Scharnier bij de voorruit.', p: [0.62, YT(1.17) - 0.05, 1.17], ex: [0.1, 0, -0.08] }),
    P('Motorkapscharnier rechts', G.rbox(0.03, 0.05, 0.12, 0.006), MAT.darkSteel, { d: 'Scharnier bij de voorruit.', p: [-0.62, YT(1.17) - 0.05, 1.17], ex: [-0.1, 0, -0.08] }),
    P('Motorkapslot', G.rbox(0.08, 0.06, 0.05, 0.008), MAT.darkSteel, { d: 'Slot met veiligheidshaak.', p: [0, YT(2.2) - 0.07, 2.2], ex: [0, -0.1, 0.1] }),
  ]);

  /* --- voorschermen --- */
  const fenders = [L, R].map(s => P(`Voorscherm ${sn(s)}`, merge([lowSide(s, 0.93, 1.77, 50, z => [Math.max(sAtY(z, 0.3), archS(z)), S4 - 0.001], 20, ARCH_BREAKS), archLip(s, AXF)]), MAT.paint, { d: 'Losse, geschroefde spatbordhelft boven het voorwiel.', ex: [s * 0.58, 0.12, 0.32] }));

  /* --- voorbumper --- */
  const bumpF = merge([
    lowSide(L, 1.775, ZF, 30, z => [S1, inHL(z) ? hlLow(z) : S4 - 0.001], 18, [1.86, 2.338]),
    lowSide(R, 1.775, ZF, 30, z => [S1, inHL(z) ? hlLow(z) : S4 - 0.001], 18, [1.86, 2.338]),
    patch(lowPt, 2.245, ZF, 6, () => [S4, 2 - S4], 20),
    faceGeo(ZF, 1, 0, 9),
  ]);
  const fz = y => faceZ(ZF, 1, 0, y);
  const frontBumper = A('Voorbumper', { d: 'Kunststof bumperschaal met grille, luchtinlaat, mistlampen en kentekenplaat.', ex: [0, -0.04, 0.82] }, [
    P('Bumperschaal voor', bumpF, MAT.paint, { d: 'Gespoten kunststof bumperschaal.' }),
    P('Grille', merge([facePatch(ZF, 1, -0.34, 0.34, 0.545, 0.612, 0.003, 4), facePatch(ZF, 1, -0.32, 0.32, 0.571, 0.577, 0.008, 1), facePatch(ZF, 1, -0.32, 0.32, 0.585, 0.591, 0.008, 1)]), MAT.blackGloss, { d: 'Hoogglans zwarte bovenste grille.', ex: [0, 0.06, 0.12] }),
    P('Luchtinlaat', merge([facePatch(ZF, 1, -0.4, 0.4, 0.34, 0.482, 0.003, 8), ...[0.37, 0.4, 0.43, 0.46].map(y => facePatch(ZF, 1, -0.38, 0.38, y, y + 0.006, 0.009, 1))]), MAT.plastic, { d: 'Onderste luchtinlaat voor radiateur en intercooler.', ex: [0, -0.06, 0.12] }),
    P('Sierlijst luchtinlaat', facePatch(ZF, 1, -0.41, 0.41, 0.492, 0.503, 0.006, 2), MAT.chrome, { d: 'Chromen sierlijst boven de luchtinlaat.', ex: [0, 0, 0.24] }),
    ...[L, R].map(s => P(`Mistlamp ${sn(s)}`, merge([G.cyl('z', 0.045, 0.045, 0.03, 24), xf(G.torus('z', 0.047, 0.006), [0, 0, 0.012])]), MAT.reflector, { d: 'Mistlamp voor in de bumper.', p: [s * 0.53, 0.4, faceZ(ZF, 1, 0.53, 0.4) - 0.004], ex: [s * 0.1, -0.04, 0.16] })),
    P('Spoilerlip voor', G.rbox(1.08, 0.022, 0.08, 0.008), MAT.plastic, { d: 'Zwarte spoilerlip onder de voorbumper.', p: [0, 0.318, ZF - 0.02], ex: [0, -0.1, 0.1] }),
    A('Kentekenplaat voor', { d: 'Gele Nederlandse kentekenplaat (zonder kenteken weergegeven).', ex: [0, 0.04, 0.3] }, [
      P('Plaat', G.box(0.52, 0.11, 0.004), MAT.plateYellow, { d: 'Retroreflecterende gele plaat.', p: [0, 0.41, fz(0.41) + 0.024] }),
      P('EU-strook', G.box(0.045, 0.11, 0.005), MAT.plateBlue, { d: 'Blauwe strook met landcode NL.', p: [-0.2375, 0.41, fz(0.41) + 0.0245], ex: [-0.06, 0, 0.02] }),
    ]),
  ]);

  /* --- achterbumper --- */
  const bumpR = merge([
    lowSide(L, ZR, -1.8, 14, z => [S1, sAtY(z, 0.64)], 12),
    lowSide(R, ZR, -1.8, 14, z => [S1, sAtY(z, 0.64)], 12),
    faceGeo(ZR, -1, 0, 0.64, 10),
  ]);
  const rz = (x, y) => faceZ(ZR, -1, x, y);
  const rearBumper = A('Achterbumper', { d: 'Bumperschaal met diffuser, reflectoren en parkeersensoren.', ex: [0, -0.04, -0.82] }, [
    P('Bumperschaal achter', bumpR, MAT.paint, { d: 'Gespoten kunststof bumperschaal.' }),
    P('Onderrand achterbumper', faceGeo(ZR - 0.004, -1, 0, 0.475, 4), MAT.plastic, { d: 'Zwarte onderrand van de achterbumper.', ex: [0, -0.06, -0.08] }),
    P('Diffuser', patch(lowPt, ZR + 0.005, -1.8, 10, () => [-S1, S1], 12), MAT.plastic, { d: 'Zwarte onderplaat/diffuser.', ex: [0, -0.1, 0] }),
    ...[L, R].map(s => P(`Reflector ${sn(s)}`, G.rbox(0.12, 0.025, 0.012, 0.006), MAT.lensRed, { d: 'Rode reflector.', p: [s * 0.6, 0.42, rz(0.6, 0.42) - 0.006], ex: [s * 0.08, 0, -0.1] })),
    ...[0.55, 0.19, -0.19, -0.55].map((x, i) => P(`Parkeersensor ${i + 1}`, G.cyl('z', 0.011, 0.011, 0.03, 14), MAT.paint, { d: 'Ultrasone sensor van de parkeerhulp.', p: [x, 0.53, rz(x, 0.53) + 0.008], ex: [0, 0.04, -0.12] })),
  ]);

  /* --- achterklep --- */
  const tgOuter = merge([patch(lowPt, ZR + 0.002, SP, 8, () => [S4, 2 - S4], 20), faceGeo(ZR, -1, 0.645, 2, 10)]);
  const tz = y => faceZ(ZR, -1, 0, y);
  const tailgate = A('Achterklep', { d: 'Grote achterklep inclusief achterruit, typerend voor de hatchback.', ex: [0, 0.5, -0.62] }, [
    P('Buitenpaneel achterklep', tgOuter, MAT.paint, { d: 'Plaatwerk van de achterklep.' }),
    P('Achterruit', patch(ghPt, SP + 0.004, RW0, 24, () => [0.36, 0.64], 16), MAT.glass, { d: 'Verwarmde achterruit met verwarmingsdraden.', ex: [0, 0.18, 0.05] }),
    P('Spoiler', G.rbox(1.38, 0.022, 0.09, 0.01), MAT.paint, { d: 'Kleine dakspoiler-lip boven de achterruitrand.', p: [0, YT(SP) + 0.014, SP - 0.03], ex: [0, 0.12, -0.08] }),
    P('Derde remlicht', G.rbox(0.32, 0.018, 0.03, 0.006), MAT.lensRed, { d: 'Hooggeplaatst derde remlicht.', p: [0, YR(RW0 - 0.04) + 0.012, RW0 - 0.04], ex: [0, 0.14, 0] }),
    P('Ruitenwisser achter', merge([xf(G.box(0.02, 0.01, 0.35), [0, 0, 0]), xf(G.box(0.012, 0.012, 0.42), [0.02, 0.01, 0.02])]), MAT.plastic, { d: 'Achterruitenwisser met arm en blad.', p: [0, YT(-2.02) + 0.06, -2.0], r: [-0.33, 0, 0], ex: [0, 0.22, 0] }),
    P('Wissermotor achter', G.cyl('z', 0.03, 0.03, 0.08), MAT.darkSteel, { d: 'Motor van de achterruitenwisser.', p: [0, 0.98, -2.25], ex: [0, 0.1, 0.12] }),
    P('Achterklepslot', G.rbox(0.08, 0.05, 0.05, 0.008), MAT.darkSteel, { d: 'Slot met elektrische ontgrendeling.', p: [0, 0.68, ZR + 0.05], ex: [0, -0.1, 0] }),
    ...[L, R].map(s => P(`Gasveer ${sn(s)}`, rodBetween([s * 0.6, 1.32, RW0 - 0.06], [s * 0.66, 0.95, -1.72], 0.011), MAT.steel, { d: 'Gasveer die de achterklep open houdt.', ex: [s * 0.18, 0, 0] })),
    P('Binnenbekleding achterklep', patch((y, t) => { const X = ringX(ZR, y) * 0.9; return [X * t, y, tz(y) + 0.04]; }, 0.66, YT(ZR) - 0.01, 6, () => [-1, 1], 12), MAT.dash, { d: 'Kunststof binnenbekleding.', ex: [0, 0, 0.14] }),
    A('Kentekenplaat achter', { d: 'Gele Nederlandse kentekenplaat (zonder kenteken weergegeven).', ex: [0, 0, -0.26] }, [
      P('Plaat', G.box(0.52, 0.11, 0.004), MAT.plateYellow, { d: 'Retroreflecterende gele plaat.', p: [0, 0.75, tz(0.75) - 0.012] }),
      P('EU-strook', G.box(0.045, 0.11, 0.005), MAT.plateBlue, { d: 'Blauwe strook met landcode NL.', p: [0.2375, 0.75, tz(0.75) - 0.0125], ex: [0.06, 0, -0.02] }),
      P('Kentekenverlichting', G.rbox(0.1, 0.012, 0.02, 0.005), MAT.lensClear, { d: 'Verlichting van de kentekenplaat.', p: [0, 0.818, tz(0.818) - 0.006], ex: [0, 0.05, 0] }),
    ]),
  ]);

  /* --- vaste ruiten, wissers, verlichting, sierlijsten, wielkuipen --- */
  const windscreen = P('Voorruit', patch(ghPt, WS1, WS0 - 0.006, 24, () => [0.36, 0.64], 16), MAT.glass, { d: 'Gelaagde voorruit met regensensor bij de binnenspiegel.', ex: [0, 0.44, 0.5] });
  const quarters = [L, R].map(s => P(`Zijruit achter ${sn(s)}`, ghSide(s, -1.45, -1.085, 8, 0.02, 0.25, 6), MAT.glass, { d: 'Vaste driehoeksruit in de C-stijl.', ex: [s * 0.46, 0.2, -0.1] }));
  const wy = YR(1.035) + 0.012;
  const wipers = A('Ruitenwissers', { d: 'Wisserinstallatie met regensensorbediening.', ex: [0, 0.52, 0.85] }, [
    P('Ruitenwisserafdekking', patch(lowPt, 1.065, 1.125, 3, () => [S4, 2 - S4], 16), MAT.plastic, { d: 'Kunststof afdekking (torpedo) onder de voorruit.', ex: [0, 0.06, 0.08] }),
    P('Wisserarm links', G.box(0.58, 0.012, 0.02), MAT.blackGloss, { d: 'Wisserarm bestuurderszijde.', p: [0.12, wy, 1.04], ex: [0, 0.1, 0] }),
    P('Wisserarm rechts', G.box(0.5, 0.012, 0.02), MAT.blackGloss, { d: 'Wisserarm passagierszijde.', p: [-0.42, wy, 1.04], ex: [0, 0.1, 0] }),
    P('Wisserblad links', G.box(0.62, 0.018, 0.012), MAT.rubber, { d: 'Wisserblad.', p: [0.1, wy + 0.012, 1.02], ex: [0, 0.18, 0] }),
    P('Wisserblad rechts', G.box(0.52, 0.018, 0.012), MAT.rubber, { d: 'Wisserblad.', p: [-0.4, wy + 0.012, 1.02], ex: [0, 0.18, 0] }),
    P('Wissermotor', merge([G.cyl('z', 0.04, 0.04, 0.09), xf(G.rbox(0.08, 0.06, 0.05, 0.01), [0, 0, 0.06])]), MAT.darkSteel, { d: 'Elektromotor van de ruitenwissers.', p: [0.3, 0.93, 1.06], ex: [0, -0.1, 0.06] }),
    P('Wisserstangenmechaniek', merge([xf(G.box(0.7, 0.012, 0.02), [0, 0, 0]), xf(G.box(0.012, 0.012, 0.08), [0.33, 0, 0.03]), xf(G.box(0.012, 0.012, 0.08), [-0.33, 0, 0.03])]), MAT.steel, { d: 'Stangenstelsel dat beide wisserassen aandrijft.', p: [-0.05, 0.95, 1.08], ex: [0, -0.06, 0.12] }),
  ]);
  const trims = A('Sierlijsten', { d: 'Chromen raamlijsten van de Initiale-uitvoering.', ex: [0, 0.3, -0.05] }, [L, R].map(s =>
    P(`Raamlijst ${sn(s)}`, merge([ghSide(s, -1.455, 0.975, 40, 0, 0.012, 1), ghSide(s, -1.455, 0.975, 40, 0.262, 0.27, 1)]), MAT.chrome, { d: 'Chromen lijst langs de zijruiten.', ex: [s * 0.12, 0, 0] })));
  const liners = A('Wielkuipschermen', { d: 'Kunststof binnenschermen in de wielkasten.', ex: [0, -0.1, 0] },
    [[L, AXF, 'linksvoor'], [R, AXF, 'rechtsvoor'], [L, AXR, 'linksachter'], [R, AXR, 'rechtsachter']].map(([s, z, n]) =>
      P(`Wielkuipscherm ${n}`, G.cyl('x', ARCH - 0.01, ARCH - 0.01, 0.3, 28, true), MAT.plastic, { d: 'Beschermt de wielkast tegen steenslag en vuil.', p: [s * 0.75, AY, z], ex: [s * 0.12, 0.08, 0] })));
  // halve cilinder: alleen bovenzijde zichtbaar maken via schaal en draaiing van geometrie
  liners.kids.forEach(k => { const g = new THREE.CylinderGeometry(ARCH - 0.01, ARCH - 0.01, 0.3, 28, 1, true, PI - 0.25, PI + 0.5); g.rotateZ(-HALF); k.obj.geometry = g; });

  return A('Carrosserie', { d: 'Zelfdragende carrosserie van de 5-deurs hatchback in zilvergrijs metallic, met alle aanbouwdelen, ruiten en verlichting.', ex: [0, 2.0, 0], spec: [['Lengte', '4695 mm'], ['Breedte', '1811 mm'], ['Hoogte', '1445 mm'], ['Wielbasis', '2756 mm'], ['Bagageruimte', '450–1377 l']] }, [
    biw, hood, tailgate, ...fenders, frontBumper, rearBumper,
    buildDoor(L, true), buildDoor(R, true), buildDoor(L, false), buildDoor(R, false),
    windscreen, ...quarters, buildHeadlight(L), buildHeadlight(R), buildTaillight(L), buildTaillight(R), wipers, trims, liners,
  ]);
}

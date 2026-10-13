/* ===================== carrosserie: onderdelen ===================== */
// Panelen zijn stukken van het parametrische oppervlak uit body.js: onderbak in (z, s), kas in (z, q), staartvlak in (x, y).
MAT.paint.color.setHex(0xaeb2b7);          // Gris Platine D69 (zilvergrijs metallic), geschat uit fase 2-persfoto's (#B3B6BA)
MAT.paintIn.color.setHex(0x9a9ea4);
// zijruiten en voorruit: donker getint autoglas; weinig omgevingsreflectie, zodat de ruitband als donkere band leest en het interieur zwak doorschemert
MAT.glass.color.setHex(0x040608); MAT.glass.opacity = 0.92; MAT.glass.envMapIntensity = 0.3; MAT.glass.roughness = 0.1; MAT.glass.specularIntensity = 0.5;
// nieuwe carrosseriematerialen: zwart mat voor stijlen en raamkaders, helder chroom voor lijsten en sierstrips, spiegelglas
std('bodPillar', 0x060607, 0, 0.8, { envMapIntensity: 0.12 });
std('bodBright', 0xf4f6f8, 0.6, 0.16, { envMapIntensity: 1.5 });
std('bodMirror', 0xb4bec6, 1, 0.04, { envMapIntensity: 1.1 });
const bodSY = (z, y) => sAtY(z, y);
const bodSAtXLow = (z, x) => { const c = bodSec(z); return x / Math.max(1e-6, c.hw - c.bul - c.rb) * S1; };   // s op de onderkant bij |x|
const sn = s => sideName(s);
// naden tussen linker- en rechterhelft gladtrekken (gedeelde normalen)
function bodWeld(g) { const m = THREE.BufferGeometryUtils.mergeVertices(g, 1e-4); m.computeVertexNormals(); return m; }
// buitenwaartse normaal (linkerhelft) en pose op de huid; rechts wordt gespiegeld
function bodNormalAt(z, y) { return bodN(z, sAtY(z, y)); }
function bodPose(s, p, nLeft, extra = {}) {
  const q = quatFromTo(V3(1, 0, 0), V3(...nLeft));
  if (s > 0) return Object.assign({ p, q }, extra);
  return Object.assign({ p: [-p[0], p[1], p[2]], q: new THREE.Quaternion(q.x, -q.y, -q.z, q.w), s: [-1, 1, 1] }, extra);
}
// punt op de onderbak (linkerhelft) met verschuiving langs de normaal (out > 0 = naar buiten)
function bodAt(z, y, out = 0) { const sv = sAtY(z, y), [x, yy] = halfPt(z, sv), n = bodN(z, sv); return [x + n[0] * out, yy + n[1] * out, z + n[2] * out]; }
// gelijkmatig plus extra stations rond schuine naden
function bodDense(a, b, n) { const out = []; for (let i = 1; i < n; i++) out.push(a + (b - a) * i / n); return out; }
// buis langs punten op de huid (sierlijsten, rubbers)
function bodSkinTube(s, pts, r, out, seg = 48, rad = 6) { return tube(pts.map(([z, y]) => { const p = bodAt(z, y, out); return [s * p[0], p[1], p[2]]; }), r, seg, rad); }
// kaspunt (linkerhelft) bij (z, q) met verschuiving naar buiten
function bodGhAt(z, q, out = 0) { const [x, y] = bodGhHalf(z, q); return [x + out, y + (q > bodQS ? out * 0.6 : 0), z]; }
const bodYG = z => { const g = bodGh(z); return g.yb + (g.ye - g.yb) * (bodQG / bodQS); };   // bovenrand zijruit
const bodQG = 0.505;                                                                          // q van de bovenrand van de zijruiten
// wielbooglip: dunne flens van r = ARCH tot ARCH + 0,04 net boven de huid
function archLip(s, az) {
  return patch((a, t) => { const r = ARCH + 0.004 + t * 0.036, z = az + r * Math.cos(a), y = AY + r * Math.sin(a), p = bodAt(z, y, 0.004 * (1 - t) + 0.001); return [s * p[0], p[1], p[2]]; },
    0.02, PI - 0.02, 40, () => [0, 1], 2);
}
/* ---------- naden en ruitlijnen (zijaanzicht, onderzoek exterieur §3) ---------- */
const bodFDF = y => 0.84 + (y - 0.31) / 0.61 * 0.065;                    // voorrand voorportier (schuin)
const bodFDlo = z => z < 0.84 ? 0.307 : 0.31 + (z - 0.84) / 0.065 * 0.61;  // onderrand voorportier per z
const bodRDlo = pchip([[-1.268, 0.877], [-1.20, 0.795], [-1.109, 0.66], [-1.0, 0.525], [-0.916, 0.406], [-0.80, 0.338], [-0.665, 0.305]]);
const bodRDloZ = z => z > -0.665 ? 0.305 : bodRDlo(z);                     // onderrand achterportier (zwaait om de achterwielboog)
const bodBf = y => -0.14 - (y - 0.946) * (0.105 / 0.43);                   // voorkant B-stijl: 0,15 m breed op de gordel, helling ca. 12 graden naar achteren
const bodBr = y => -0.28 - (y - 0.946) * (0.06 / 0.43);                    // achterkant B-stijl: 0,10 m breed bovenaan (z -0,245 tot -0,34)
const bodBfY = z => 0.946 + (-0.14 - z) * (0.43 / 0.105);                  // hoogte waarop de voorkant van de B-stijl op z ligt (omgekeerde van bodBf)
const bodBrY = z => 0.946 + (-0.28 - z) * (0.43 / 0.06);                   // idem voor de achterkant
const bodQd = y => -0.93 - (y - 0.97) * (0.06 / 0.33);                     // schuin stijltje achterportier / kwartsruit
const bodQtop = pchip([[-1.212, 0.975], [-1.205, 1.10], [-1.19, 1.205], [-1.15, 1.245], [-1.05, 1.275], [-0.95, 1.30]]);
const bodSail = 0.865;                                                    // spiegeldriehoek tussen z 0,865 en de A-stijl
const bodQy = (z, y) => bodQAtY(z, y);

/* ---------- sierlijsten met afgerond profiel ---------- */
// lijst op de huid van de onderbak tussen y0 en y1 en z zA..zB; hgt = hoogte van het profiel boven de huid; de uiteinden lopen in de huid weg
function bodMould(s, y0, y1, zA, zB, hgt, nz = 36) {
  return patch((z, t) => {
    const e = sstep((z - zA) / 0.05) * sstep((zB - z) / 0.05), o = hgt * e * Math.pow(Math.sin(PI * t), 0.6) - 0.001;
    const p = bodAt(z, y0 + (y1 - y0) * t, o); return [s * p[0], p[1], p[2]];
  }, zA, zB, nz, () => [0, 1], 8);
}
/* ---------- portieren ---------- */
function buildDoor(s, isFront) {
  const n = sn(s), pos = isFront ? 'voor' : 'achter', tag = n + pos;
  const z0 = isFront ? -0.143 : -1.266, z1 = isFront ? 0.903 : -0.153;
  const lo = isFront ? bodFDlo : bodRDloZ;
  const vr = z => [bodSY(z, lo(z) + 0.002), S4 - 0.0008];
  const br = isFront ? bodDense(0.82, 0.903, 8) : bodDense(-1.266, -0.62, 14).concat([-0.665]);
  const zm = (z0 + z1) / 2, za = z0 + 0.06, zb = z1 - 0.06;
  const outer = lowSide(s, z0, z1, 40, vr, 26, br);
  const inner = lowSide(s, z0 + 0.012, z1 - 0.012, 22, z => [bodSY(z, lo(z) + 0.02), S4 - 0.012], 12, br, 0.065);
  const trimP = lowSide(s, z0 + 0.02, z1 - 0.02, 22, z => [bodSY(z, Math.max(lo(z) + 0.03, 0.36)), S4 - 0.03], 12, br, 0.105);
  const P3 = (z, y, inw) => { const p = bodAt(z, y, -inw); return [s * p[0], p[1], p[2]]; };
  const xin = z => s * (surfX(z, 0.6) - 0.04);
  // zijruit: tussen B-stijl, A-stijl/spiegeldriehoek of het schuine stijltje
  const gb = z => bodYG(z) - 0.002;
  let glass, gz0, gz1;
  if (isFront) {
    gz0 = bodBf(1.33) + 0.004; gz1 = bodSail - 0.004;
    glass = bodGhSide(s, gz0, gz1, 30, z => { const yl = z < bodBf(0.946) ? bodBfY(z) : 0; return [Math.max(0.006, bodQy(z, yl)), bodQG]; }, 10, bodDense(gz0, -0.14, 5));
  } else {
    gz0 = bodQd(1.30) + 0.016; gz1 = bodBr(0.95) - 0.004;
    glass = bodGhSide(s, gz0, gz1, 30, z => {
      const yHi = z > bodBr(1.376) - 0.004 ? bodBrY(z + 0.004) : 9, yLo = z < -0.93 ? 0.97 + (-0.93 + 0.016 - z) * 0.33 / 0.06 : 0;
      return [Math.max(0.006, bodQy(z, yLo)), Math.min(bodQG, bodQy(z, yHi))];
    }, 10, bodDense(gz0, -0.9, 4).concat(bodDense(-0.34, gz1, 4)));
  }
  // chroomomlijsting: bovenband langs de ruit en sierlijst op de gordel
  const topBand = bodGhSide(s, gz0 - 0.01, gz1 + 0.01, 30, () => [bodQG, bodQG + 0.03], 1, [], 0.003);
  // de lijnen van voor- en achterportier ontmoeten elkaar midden in de B-stijl (z -0,25)
  const zT0 = isFront ? -0.25 : gz0 - 0.01, zT1 = isFront ? gz1 + 0.01 : -0.25;
  const topPts = [], beltZ = [], beltPts = [];
  for (let i = 0; i <= 20; i++) { const z = zT0 + (zT1 - zT0) * i / 20, p = bodGhAt(z, bodQG + 0.004, 0.003); topPts.push([s * p[0], p[1], z]); }
  for (let i = 0; i <= 16; i++) beltZ.push(isFront ? -0.25 + (gz1 + 0.13 + 0.25) * i / 16 : gz0 + (-0.25 - gz0) * i / 16);
  for (const z of beltZ) { const g = bodGh(z); beltPts.push([s * (g.xb + 0.004), g.yb + 0.004, z]); }
  const handleZ = isFront ? 0.03 : -1.015, handleY = isFront ? 0.80 : 0.84;
  const hp = bodAt(handleZ, handleY, 0.012), hn = bodNormalAt(handleZ, handleY);
  const mZ0 = isFront ? 0.03 : -1.16, mZ1 = isFront ? 0.82 : -0.16;
  const strip = y => bodMould(s, y, y + 0.026, mZ0, mZ1, 0.009);                       // afgeronde aluminiumlook lijst, 9 mm boven de huid
  const stripShadow = y => bodMould(s, y - 0.011, y - 0.003, mZ0 + 0.01, mZ1 - 0.01, 0.003);   // donkere rubberlijn onder de lijst
  const hingeZ = isFront ? z1 - 0.03 : z1 - 0.025;
  const hinge = (h, y) => A(`Scharnier ${h}`, { d: `${h === 'boven' ? 'Bovenste' : 'Onderste'} portierscharnier: een blad op de stijl en een blad op het portier met een scharnierpen.`, ex: [-s * 0.03, 0, 0.12] }, [
    P('Scharnierblad', G.rbox(0.03, 0.07, 0.05, 0.006), MAT.darkSteel, { d: 'Gesmeed stalen scharnierblad met pen.', p: [s * (surfX(hingeZ, y) - 0.035), y, hingeZ + 0.02], ex: [0, 0, 0.04] }),
    ...[0.022, -0.022].map((dy, i) => P(`Scharnierbout ${i + 1}`, hexBolt(0.025, 0.008, s > 0 ? '-x' : 'x'), MAT.steel, { d: 'Bout M8 waarmee het scharnierblad aan het portier vastzit.', p: [s * (surfX(hingeZ, y) - 0.05), y + dy, hingeZ + 0.005], ex: [-s * 0.05, 0, 0] })),
  ]);
  const kids = [
    P('Buitenpaneel', outer, MAT.paint, { d: `Geperste plaatstalen buitenhuid van het ${pos}portier, zilvergrijs metallic gelakt.`, ex: [s * 0.4, 0.14, 0.5] }),
    P('Binnenpaneel', inner, MAT.paintIn, { d: 'Draagframe van het portier waarop raammechaniek, slot, luidspreker en bekleding vastzitten.', ex: [0, 0, 0] }),
    P('Zijdelingse botsbalk', tube([[xin(za) * 1.0, 0.47, za], [xin(zm), 0.5, zm], [xin(zb), 0.53, zb]], 0.018, 16, 10), MAT.steel, { d: 'Hogesterktestalen buis in het portier die bij een zijaanrijding de indringing beperkt.', ex: [s * 0.22, 0, 0.3] }),
    P('Waterscherm', lowSide(s, z0 + 0.05, z1 - 0.05, 12, z => [bodSY(z, Math.max(lo(z) + 0.05, 0.4)), bodSY(z, 0.86)], 6, br, 0.075), MAT.plastic, { d: 'Kunststof folie tussen binnenpaneel en bekleding die vocht uit de bekleding houdt.', ex: [-s * 0.14, 0.12, -0.26] }),
    P('Zijruit', glass, MAT.glass, { d: 'Zakbare zijruit van gehard veiligheidsglas.', ex: [0, 0.32, 0] }),
    A('Raamlijsten en sierlijsten', { d: 'Chromen raamomlijsting, gordelsierlijst met rubber en de twee aluminiumlook zijsierlijsten.', ex: [s * 0.52, 0.04, 0.1] }, [
    P('Chroomlijst raamomlijsting', tube(topPts, 0.006, 40, 8), MAT.bodBright, { d: 'Zilverchromen lijst langs de bovenrand van de ruit (Initiale Paris: cerclage chromé).', ex: [s * 0.05, 0.12, 0] }),
    P('Raamrubber boven', topBand, MAT.bodPillar, { d: 'Zwart rubber en kader tussen de ruit en de dakrail, waarop de chroomlijst ligt.', ex: [s * 0.03, 0.08, 0] }),
    P('Gordelsierlijst', tube(beltPts, 0.006, 40, 8), MAT.bodBright, { d: 'Verchroomde sierlijst op de gordellijn, met het buitenste raamrubber.', ex: [s * 0.08, 0.05, 0] }),
    P('Gordelrubber binnen', tube(beltPts.map(p => [p[0] - s * 0.03, p[1] - 0.004, p[2]]), 0.006, 24, 5), MAT.rubber, { d: 'Binnenste raamschachtrubber dat de ruit afstrijkt.', ex: [-s * 0.06, 0.04, 0] }),
    P('Sierlijst boven', strip(0.552), MAT.bodBright, { d: 'Bovenste van de twee aluminiumlook zijsierlijsten.', ex: [s * 0.1, 0.02, 0] }),
    P('Sierlijst onder', strip(0.512), MAT.bodBright, { d: 'Onderste van de twee aluminiumlook zijsierlijsten.', ex: [s * 0.1, -0.02, 0] }),
    P('Rubberlijnen sierlijsten', merge([stripShadow(0.552), stripShadow(0.512)]), MAT.rubber, { d: 'Dunne zwarte rubberlijnen onder de twee zijsierlijsten.', ex: [s * 0.08, 0, 0] }),
    ]),
    A('Raambediening', { d: 'Elektrische raambediening met kabeltrommel: twee geleiderails, een ruitdrager en een motor.', ex: [-s * 0.3, -0.02, 0] }, [
      P('Geleiderail voor', rodBetween([xin(zm + 0.16), 0.42, zm + 0.16], [xin(zm + 0.16), 0.9, zm + 0.16], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, 0.05] }),
      P('Geleiderail achter', rodBetween([xin(zm - 0.16), 0.42, zm - 0.16], [xin(zm - 0.16), 0.9, zm - 0.16], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, -0.05] }),
      P('Ruitdrager', G.rbox(0.02, 0.03, 0.36, 0.006), MAT.darkSteel, { d: 'Drager waarop de onderrand van de zijruit is geklemd.', p: [xin(zm), 0.86, zm], ex: [0, 0.08, 0] }),
      P('Bedieningskabels', merge([rodBetween([xin(zm + 0.16), 0.9, zm + 0.16], [xin(zm - 0.16), 0.42, zm - 0.16], 0.003, 6), rodBetween([xin(zm - 0.16), 0.9, zm - 0.16], [xin(zm + 0.16), 0.42, zm + 0.16], 0.003, 6)]), MAT.steel, { d: 'Staalkabels die de ruitdrager langs de rails trekken.', ex: [-s * 0.03, 0, 0] }),
      P('Raammotor', merge([G.cyl('x', 0.032, 0.032, 0.045, 20), xf(G.cyl('x', 0.022, 0.022, 0.03, 16), [-0.035, 0, 0])]), MAT.darkSteel, { d: 'Elektromotor met kabeltrommel van de elektrische ruitbediening.', p: [xin(zm), 0.5, zm], s: [s, 1, 1], ex: [-s * 0.06, -0.06, 0] }),
    ]),
    A('Deurslot', { d: 'Slotmechanisme in de achterrand van het portier met elektrische centrale vergrendeling.', ex: [-s * 0.08, 0, -0.16] }, [
      P('Slotkast', G.rbox(0.035, 0.1, 0.05, 0.008), MAT.darkSteel, { d: 'Slotkast met vanghaak die om de slotbeugel in de stijl grijpt.', p: [s * (surfX(z0 + 0.03, 0.78) - 0.04), 0.78, z0 + 0.03], ex: [0, 0, -0.04] }),
      P('Slotmotor', G.rbox(0.03, 0.05, 0.05, 0.008), MAT.plastic, { d: 'Elektrische stelmotor van de centrale vergrendeling.', p: [s * (surfX(z0 + 0.07, 0.72) - 0.05), 0.72, z0 + 0.07], ex: [-s * 0.04, -0.03, 0] }),
      P('Bedieningsstang', rodBetween([s * (surfX(z0 + 0.04, 0.78) - 0.05), 0.79, z0 + 0.04], [s * (hp[0] - 0.035), handleY, handleZ - 0.04], 0.003, 6), MAT.steel, { d: 'Stang tussen buitendeurgreep en slot.', ex: [-s * 0.03, 0, 0] }),
    ]),
    A('Buitendeurgreep', { d: 'Trekgreep in carrosseriekleur met chroomaccent (Initiale Paris).', ex: [s * 0.62, 0, 0] }, [
      P('Greepschaal', G.rbox(0.026, 0.034, 0.2, 0.012), MAT.paint, { d: 'Greep in carrosseriekleur.', ...bodPose(s, hp, hn) }),
      P('Chroomaccent greep', G.rbox(0.006, 0.006, 0.18, 0.002), MAT.chrome, { d: 'Verchroomde sierstrip op de greep.', ...bodPose(s, [hp[0] + hn[0] * 0.013, hp[1] + 0.012, hp[2]], hn), ex: [0, 0.03, 0] }),
      P('Greepdrager', G.rbox(0.03, 0.05, 0.24, 0.006), MAT.plastic, { d: 'Kunststof drager achter de buitenhuid waarin de greep scharniert.', ...bodPose(s, bodAt(handleZ, handleY, -0.02), hn), ex: [-s * 0.05, 0, 0] }),
    ]),
    A('Deurbekleding', { d: 'Binnenbekleding van het portier met armsteun, schakelaars, binnengreep en luidsprekerrooster.', ex: [-s * 0.52, 0, -0.68] }, [
      P('Bekledingspaneel', trimP, MAT.dash, { d: 'Gespoten kunststof bekledingspaneel met stoffen inzet.', ex: [0, 0, 0] }),
      P('Armsteun', G.rbox(0.07, 0.045, isFront ? 0.40 : 0.30, 0.018), MAT.leather, { d: 'Met leder beklede armsteun.', p: [s * (surfX(zm, 0.64) - 0.14), 0.64, zm - 0.02], ex: [-s * 0.06, 0, 0] }),
      P(isFront ? 'Schakelpaneel' : 'Raamschakelaar', G.rbox(0.05, 0.02, isFront ? 0.14 : 0.06, 0.006), MAT.plastic, { d: isFront ? 'Schakelaars voor ramen en buitenspiegels.' : 'Schakelaar van de elektrische ruit achter.', p: [s * (surfX(zm, 0.67) - 0.15), 0.673, zm + 0.02], ex: [-s * 0.04, 0.04, 0] }),
      P('Binnendeurgreep', G.rbox(0.02, 0.03, 0.12, 0.008), MAT.satin, { d: 'Verchroomde binnengreep met bowdenkabel naar het slot.', p: [s * (surfX(z0 + 0.22, 0.8) - 0.115), 0.8, z0 + 0.22], ex: [-s * 0.06, 0, 0] }),
      P('Luidsprekerrooster', G.lathe('x', [[0, 0.004], [0.075, 0.004], [0.08, 0], [0, 0]], 24, 'bodGrill'), MAT.plasticGrey, { d: 'Rooster voor de luidspreker in de bekleding.', p: [s * (surfX(zm, 0.42) - 0.115), 0.42, isFront ? z1 - 0.3 : zm], r: [0, 0, s > 0 ? PI : 0], ex: [-s * 0.05, 0, 0] }),
    ]),
    P('Luidspreker', G.lathe('x', [[0, 0.02], [0.03, 0.018], [0.07, 0.002], [0.08, 0], [0.08, -0.02], [0.03, -0.02], [0, -0.02]], 20, 'bodSpk'), MAT.plastic, { d: 'Luidspreker van het audiosysteem in het portier.', p: [s * (surfX(zm, 0.42) - 0.09), 0.42, isFront ? z1 - 0.3 : zm], r: [0, 0, s > 0 ? PI : 0], ex: [-s * 0.26, 0, 0] }),
    P('Portierrubber', tube([[0, 0.33], [0, 0.88], [1, 0.88], [1, 0.33]].map(([u, y]) => { const z = u ? z0 + 0.012 : z1 - 0.02; return P3(z, y, 0.05); }), 0.008, 32, 6), MAT.rubber, { d: 'Rubber afdichting rondom de portieropening.', ex: [-s * 0.26, -0.1, -0.46] }),
    P('Deurvanger', G.rbox(0.012, 0.03, 0.2, 0.004), MAT.darkSteel, { d: 'Vanger die het portier in twee standen openhoudt.', p: [s * (surfX(z1 - 0.1, 0.62) - 0.055), 0.62, z1 - 0.1], ex: [-s * 0.05, 0, 0.06] }),
    A('Scharnieren', { d: 'Twee portierscharnieren aan de voorrand met elk twee bouten.', ex: [-s * 0.04, 0, 0.1] }, [hinge('boven', 0.79), hinge('onder', 0.45)]),
  ];
  if (isFront) {
    kids.push(P('Spiegeldriehoek', bodGhSide(s, bodSail, 0.93, 6, z => [0.004, Math.min(bodQS - 0.02, bodQy(z, 0.93 + (0.93 - z) * 0.55))], 4, [], 0.001), MAT.bodPillar, { d: 'Zwarte driehoekige afdekplaat tussen zijruit en A-stijl waarop de spiegel staat.', ex: [s * 0.05, 0.05, 0.03] }));
    kids.push(buildMirror(s));
  } else {
    kids.push(P('Raamstijl achter', bodGhSide(s, bodQd(1.3) - 0.014, bodQd(0.95) + 0.014, 6, z => [bodQy(z, Math.max(0.952, 0.97 + (-0.93 - 0.014 - z) * 0.33 / 0.06)), Math.min(bodQG + 0.03, bodQy(z, 0.97 + (-0.93 + 0.014 - z) * 0.33 / 0.06))], 4, [], 0.001), MAT.bodPillar, { d: 'Schuin zwart stijltje tussen de zakbare ruit en de vaste kwartsruit.', ex: [s * 0.05, 0.08, 0] }));
  }
  return A(`Portier ${n}${pos}`, { d: `Compleet ${pos}portier aan de ${n}kant: plaatwerk, ruit, raambediening, slot, greep, bekleding en scharnieren.`, ex: [s * 0.78, 0.02, isFront ? 0.16 : -0.16] }, kids);
}
// afgeronde trapezium als omtrek van het spiegelglas (u naar buiten, v omhoog; binnenkant hoger dan buitenkant)
function bodMirOutline() {
  const c = [[-0.10, 0.07], [0.10, 0.05], [0.10, -0.06], [-0.10, -0.065]], r = 0.028, out = [];
  c.forEach((p, i) => {
    const a = c[(i + 3) % 4], b = c[(i + 1) % 4], da = Math.hypot(a[0] - p[0], a[1] - p[1]), db = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const p0 = [p[0] + (a[0] - p[0]) * r / da, p[1] + (a[1] - p[1]) * r / da], p1 = [p[0] + (b[0] - p[0]) * r / db, p[1] + (b[1] - p[1]) * r / db];
    for (let k = 0; k <= 5; k++) { const t = k / 5, w0 = (1 - t) * (1 - t), w1 = 2 * t * (1 - t), w2 = t * t; out.push([w0 * p0[0] + w1 * p[0] + w2 * p1[0], w0 * p0[1] + w1 * p[1] + w2 * p1[1]]); }
  });
  return out;
}
// huid door ringen van de omtrek: rings = [[schaal, z], ...]; cap = sluit het laatste ring met een waaier
function bodLoft(sg, rings, cap) {
  const o = bodMirOutline(), n = o.length, pos = [], idx = [];
  for (const [f, z] of rings) for (const [u, v] of o) pos.push(sg * u * f, v * f, z);
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < n; j++) { const a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + (j + 1) % n, d = (i + 1) * n + j; idx.push(a, b, d, b, c, d); }
  if (cap) { const m = pos.length / 3, last = (rings.length - 1) * n; pos.push(0, 0, rings[rings.length - 1][1]); for (let j = 0; j < n; j++) idx.push(last + j, last + (j + 1) % n, m); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function buildMirror(s) {
  const n = sn(s), cx = 0.925, cy = 0.975, cz = 0.738, k = s > 0 ? 'L' : 'R';
  const M = (x, y, z) => [s * x, y, z];
  return A(`Buitenspiegel ${n}`, { d: 'Elektrisch verstelbare, verwarmde en elektrisch inklapbare buitenspiegel in carrosseriekleur (Initiale Paris met geheugen).', ex: [s * 0.32, 0.12, 0.08] }, [
    P('Spiegelvoet', G.rbox(0.09, 0.05, 0.12, 0.015), MAT.bodPillar, { d: 'Voet met bevestigingsplaat op de spiegeldriehoek van het portier.', p: M(0.845, 0.94, 0.82), ex: [-s * 0.05, -0.05, 0] }),
    P('Spiegelkap', cache('bodMirCapT' + k, () => bodLoft(s, [[1, 0], [1, 0.03], [0.95, 0.07], [0.8, 0.11], [0.5, 0.135], [0.12, 0.145]], true)), MAT.paint, { d: 'Kap in carrosseriekleur aan de voorzijde van het spiegelhuis.', p: M(cx, cy, 0.668), ex: [0, 0.02, 0.1] }),
    P('Spiegelhuis', cache('bodMirRimT' + k, () => bodLoft(s, [[0.93, -0.004], [1.01, -0.004], [1.01, 0.012]], false)), MAT.paint, { d: 'Kunststof huis in carrosseriekleur met een rand rond het glas, dat glas, motoren en verwarming draagt.', p: M(cx, cy, 0.664), ex: [0, 0, -0.02] }),
    P('Spiegelglas', cache('bodMirGlT' + k, () => { const g = new THREE.ShapeGeometry(shapeOf(bodMirOutline().map(([u, v]) => [s * u * 0.93, v * 0.93]))); return g; }), MAT.bodMirror, { d: 'Bol spiegelglas.', p: M(cx, cy, 0.661), ex: [0, 0, -0.12] }),
    P('Glasdrager', G.rbox(0.17, 0.106, 0.008, 0.01), MAT.plastic, { d: 'Kunststof drager waarop het glas is geklikt.', p: M(cx, cy, 0.668), inner: true, ex: [0, 0, -0.08] }),
    P('Verwarmingsfolie', G.box(0.16, 0.1, 0.002), MAT.heater, { d: 'Verwarmingsfolie achter het glas tegen condens en ijs.', p: M(cx, cy, 0.6645), inner: true, ex: [0, 0, -0.1] }),
    P('Verstelmotor', G.rbox(0.06, 0.05, 0.04, 0.008), MAT.darkSteel, { d: 'Motor met twee assen voor het verstellen van het glas (met geheugen).', p: M(cx, cy, 0.7), inner: true, ex: [0, 0.06, -0.04] }),
    P('Inklapmotor', G.cyl('y', 0.022, 0.022, 0.05, 16), MAT.darkSteel, { d: 'Motor die de spiegel elektrisch inklapt.', p: M(0.86, 0.955, 0.79), ex: [0, -0.06, 0] }),
  ]);
}

/* ---------- koplampen ---------- */
function buildHeadlight(s) {
  const n = sn(s), z0 = bodHLZ0 + 0.002, z1 = bodHLZ1 - 0.002;
  const reg = (lo, hi, off) => patch((z, p) => bodLow(z, p, off), z0, z1, 30, z => sideR(s, lo(z), hi(z)), 8, bodDense(2.17, z1, 5));
  const lo = z => hlLow(z), hi = z => bodHLHi(z);
  // stand: binnen de lens, naar voren gericht
  const at = (z, f, inw) => { const sv = lo(z) + (hi(z) - lo(z)) * f, [x, y] = halfPt(z, sv), nn = bodN(z, sv); return [s * (x - nn[0] * inw), y - nn[1] * inw, z - nn[2] * inw]; };
  const nAvg = bodN(2.05, (lo(2.05) + hi(2.05)) / 2), nx = s * nAvg[0], ny = nAvg[1], nz = nAvg[2];
  const out = k => [nx * k, ny * k, nz * k];
  const proj = (nm, z, f, r) => {
    const c = at(z, f, 0.03);
    return A(`Projector ${nm}`, { ex: [nx * 0.05, 0.03, nz * 0.05 + 0.03], d: nm === 'buiten' ? 'Bi-xenon projectormodule voor dim- en grootlicht; een klep wisselt tussen beide (schematisch weergegeven).' : 'Tweede projectormodule naast de bi-xenon unit (opbouw zoals gebruikelijk bij deze lamp, schematisch weergegeven).' }, [
      P('Projectorlens', G.lathe('z', [[0, 0.012], [r * 0.75, 0.008], [r, 0], [r, -0.006], [0, -0.006]], 20, 'bodPL' + r), MAT.lensClear, { d: 'Asferische lens die de lichtbundel scherp afbeeldt.', p: [c[0], c[1], c[2] + 0.004], ex: [0, 0, 0.06] }),
      P('Lensring', G.torus('z', r + 0.003, 0.004, 24, 6), MAT.chrome, { d: 'Verchroomde ring om de projectorlens.', p: [c[0], c[1], c[2]], ex: [0, 0, 0.03] }),
      P('Reflectorschaal', G.lathe('z', [[0, -0.07], [r * 0.7, -0.06], [r * 1.1, -0.02], [r * 1.15, 0]], 18, 'bodPR' + r), MAT.reflector, { d: 'Ellipsvormige reflector achter de lens.', p: [c[0], c[1], c[2] - 0.01], ex: [0, 0, -0.06] }),
      P('Lichtklep', G.box(r * 1.6, 0.003, 0.012), MAT.darkSteel, { d: 'Klep die de bovenkant van de bundel afschermt voor dimlicht.', inner: true, p: [c[0], c[1] - 0.004, c[2] - 0.03], ex: [0, -0.04, 0] }),
    ]);
  };
  const back = at(2.0, 0.5, 0.075);
  return A(`Koplamp ${n}`, { d: 'Bi-xenon directionele koplamp met dagrijlicht en zwart masker; loopt ver terug langs het voorscherm (fase 2, standaard op Initiale Paris).', ex: [s * 0.32, 0.12, 0.62] }, [
    P('Afdekglas', reg(lo, hi, -0.003), MAT.lensClear, { d: 'Gebogen polycarbonaat afdekglas dat het scherm- en kapvlak volgt.', ex: out(0.26) }),
    P('Zwart masker', merge([reg(z => lo(z) + (hi(z) - lo(z)) * 0.7, z => hi(z) - 0.002, 0.012), patch((z, p) => bodLow(z, p, 0.013), z0, 1.9, 8, z => sideR(s, lo(z) + 0.002, hi(z) - 0.002), 4)]), MAT.blackGloss, { d: 'Hoogglans zwart masker als ooglid boven de projectoren en achterin de lamp, kenmerkend voor de fase 2-koplamp.', ex: out(0.15) }),
    P('Reflectorvlak', patch((z, p) => bodLow(z, p, 0.016), 1.9, z1, 18, z => sideR(s, lo(z) + 0.002, lo(z) + (hi(z) - lo(z)) * 0.7), 4), MAT.chrome, { d: 'Verchroomd vlak rond de projectoren onder het masker.', ex: out(0.1) }),
    P('Lamphuis', reg(lo, hi, 0.07), MAT.plastic, { d: 'Kunststof lamphuis waarin alle modules zijn gemonteerd.', ex: [0, 0, 0] }),
    P('Chroomrand', patch((z, p) => bodLow(z, p, 0.008), z0 + 0.03, z1, 24, z => sideR(s, hi(z) - 0.012, hi(z) - 0.006), 1), MAT.chrome, { d: 'Verchroomde rand langs de bovenzijde binnen het glas.', ex: out(0.2) }),
    proj('buiten', 1.975, 0.4, 0.04), proj('binnen', 2.11, 0.42, 0.033),
    P('Knipperlicht', patch((z, p) => bodLow(z, p, 0.01), 1.84, 1.93, 6, z => sideR(s, lo(z) + 0.005, lo(z) + (hi(z) - lo(z)) * 0.6), 2), MAT.amber, { d: 'Richtingaanwijzer achterin de koplampunit.', ex: out(0.12) }),
    P('Dagrijlicht', patch((z, p) => bodLow(z, p, 0.009), 1.95, 2.2, 14, z => sideR(s, lo(z) + 0.004, lo(z) + 0.012), 1), MAT.ceramic, { d: 'Lichtgeleider van het dagrijlicht langs de onderrand van de lamp.', ex: [nx * 0.12, -0.05, nz * 0.12] }),
    P('Xenonbrander', G.cyl('z', 0.007, 0.007, 0.05, 10), MAT.ceramic, { d: 'D1S-gasontladingslamp (xenon) van de bi-xenon projector.', inner: true, p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1], c[2] - 0.1]; })(), ex: [0, 0.05, -0.14] }),
    P('Ontsteker', G.rbox(0.045, 0.03, 0.045, 0.006), MAT.ecu, { d: 'Ontsteekmodule die de hoogspanningspuls voor de xenonlamp levert.', inner: true, p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1], c[2] - 0.15]; })(), ex: [0, 0.06, -0.2] }),
    P('Voorschakelapparaat', G.rbox(0.09, 0.025, 0.09, 0.006), MAT.ecu, { d: 'Ballast die de xenonlamp van stroom voorziet.', p: [back[0], back[1] - 0.06, back[2]], ex: [0, -0.16, -0.04] }),
    P('Bochtverlichtingsmotor', merge([G.cyl('y', 0.022, 0.022, 0.035, 16), xf(G.rbox(0.04, 0.02, 0.04, 0.005), [0, -0.025, 0])]), MAT.darkSteel, { d: 'Stappenmotor die de bi-xenon projector meedraait in bochten (directionele koplamp).', p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1] - 0.05, c[2] - 0.04]; })(), ex: [0, -0.12, -0.06] }),
    P('Afdekkap', G.lathe('z', [[0, 0.02], [0.04, 0.02], [0.045, 0], [0.04, -0.005]], 18, 'bodHLcap'), MAT.plastic, { d: 'Rubberen kap op de achterzijde voor het verwisselen van de lampen.', inner: true, p: [back[0], back[1], back[2] - 0.02], r: [PI, 0, 0], ex: [0, 0.02, -0.18] }),
  ]);
}

/* ---------- achterlichten (over de klepnaad verdeeld) ---------- */
const bodTGseam = y => 0.545 + 0.015 * sstep((y - 0.80) / 0.15);         // zijnaad van de achterklep in het staartvlak
function buildTaillight(s) {
  const n = sn(s), ytop = 1.036, ybot = 0.906, xin = 0.37;
  const side = (off) => patch((z, p) => bodLow(z, p, off), bodZT + 0.001, bodTLZ - 0.001, 16, z => sideR(s, tlLow(z), bodTLhi(z)), 6, bodDense(-2.05, bodTLZ, 4));
  const face = (x0, x1, y0, y1, off, nx = 8) => { const g = bodTailGeo(x0, x1, y0, y1, off, 5, nx); if (s < 0) g.scale(-1, 1, 1); return g; };
  const xs = bodTGseam(0.97);
  return A(`Achterlicht ${n}`, { d: 'Achterlicht in twee delen, verdeeld over de klepnaad: een wig op het achterscherm die om de hoek loopt en een deel in de achterklep.', ex: [s * 0.3, 0.1, -0.5] }, [
    A('Buitendeel', { d: 'Vast deel op het achterscherm met achterlicht, remlicht en knipperlicht (LED-uitstraling).', ex: [s * 0.1, 0, -0.06] }, [
      P('Lens buitendeel', merge([side(-0.003), face(xs + 0.004, 1.2, ybot, ytop, 0.003)]), MAT.lensRed, { d: 'Rode afdeklens die vanaf het staartvlak om de hoek de flank in loopt.', ex: [s * 0.05, 0, -0.06] }),
      P('Lichthuis buitendeel', merge([side(0.05), face(xs + 0.01, 1.2, ybot + 0.01, ytop - 0.01, -0.05)]), MAT.plastic, { d: 'Kunststof behuizing met bevestigingsbouten in het achterscherm.', ex: [-s * 0.04, 0, 0.06] }),
      P('LED-print buitendeel', merge([side(0.035), face(xs + 0.004, 1.2, ybot + 0.03, ytop - 0.03, -0.035)]), MAT.ecu, { d: 'Printplaat met de lampen van achter-, rem- en knipperlicht.', inner: true, ex: [0, 0, 0.1] }),
      P('Reflector buitendeel', merge([side(0.02), face(xs + 0.004, 1.2, ybot + 0.02, ytop - 0.02, -0.02)]), MAT.reflector, { d: 'Verchroomde reflector achter de lens; zichtbaar door het rode glas.', ex: [0, 0, 0.05] }),
    ]),
    A('Binnendeel', { d: 'Deel in de achterklep met achterlicht en achteruitrijlicht.', ex: [s * 0.03, 0.04, -0.08] }, [
      P('Lens binnendeel', face(xin, xs - 0.004, 0.975, ytop - 0.004, 0.003), MAT.lensRed, { d: 'Rode bovenste lens van het binnendeel (achterlicht).', ex: [0, 0.03, -0.06] }),
      P('Reflector binnendeel', face(xin + 0.004, xs - 0.008, ybot + 0.008, 0.97, -0.012), MAT.reflector, { d: 'Verchroomde reflector achter de heldere lens.', ex: [0, 0, 0.04] }),
      P('Lens achteruitrijlicht', face(xin, xs - 0.004, ybot + 0.004, 0.971, 0.003), MAT.lensClear, { d: 'Heldere onderste lens over het achteruitrijlicht.', ex: [0, 0, -0.1] }),
      P('Lichthuis binnendeel', face(xin + 0.01, xs - 0.01, ybot + 0.01, ytop - 0.01, -0.028), MAT.plastic, { d: 'Behuizing in de achterklep.', ex: [0, 0, 0.06] }),
      P('Lampdrager binnendeel', face(xin + 0.03, xs - 0.03, ybot + 0.03, ytop - 0.03, -0.018), MAT.ecu, { d: 'Lampdrager met fittingen en stekker.', inner: true, ex: [0, 0, 0.1] }),
    ]),
  ]);
}

// rand van de achterklepopening, op afstand 'inw' binnen de huid (sponning en afdichting)
function bodTGPath(inw) {
  const side = [], xs = bodTGseam(0.7) - 0.03, ydT = bodSec(bodZT).yd;
  for (const y of [0.66, 0.8, 0.95, ydT - 0.04]) side.push([xs, y, tailZ(xs, y) + inw]);
  for (const z of [bodZT + 0.03, -2.2, SP]) { const p = halfPt(z, bodSAtX(z, 0.58)); side.push([p[0], p[1] - inw, z]); }
  for (const z of [-1.9, -1.6, -1.35, RW0 + 0.02]) { const q = lerp(0.70, 0.752, clamp((z - SP) / (RW0 - SP), 0, 1)), p = bodGhHalf(z, q); side.push([p[0] - inw, p[1] - inw, z]); }
  const mid = [0, 0.655, tailZ(0, 0.655) + inw], top = [0, YR(RW0 + 0.02) - inw, RW0 + 0.02];
  return [mid, ...side, top, ...side.slice().reverse().map(p => [-p[0], p[1], p[2]]), mid];
}
function buildBody() {
  const L = 1, R = -1, both = f => [L, R].map(f);
  /* ================= carrosseriekooi ================= */
  // vloer en dorpels
  const floorVR = z => { const c = bodSec(z), lim = inArch(z) ? S1 * 0.55 : S1; return [-lim, lim]; };
  const tunnel = (() => { const sh = shapeOf([[-0.17, 0], [-0.12, 0.2], [0.12, 0.2], [0.17, 0], [0.16, -0.004], [0.115, 0.192], [-0.115, 0.192], [-0.16, -0.004]]); const g = extrude(sh, 1.7); g.rotateY(0); return g; })();
  const floorGrp = A('Vloer en dorpels', { d: 'Vloerplaat met middentunnel, dwarsbalken, langsliggers achter en de dorpels onder de portieren.', ex: [0, -0.32, 0] }, [
    P('Bodemplaat', patch((z, p) => bodLow(z, p, 0.002), -1.75, 1.0, 50, floorVR, 12, ARCH_BREAKS), MAT.underbody, { d: 'Gelaste vloerplaat van de ruwbouw met bevestigingspunten voor stoelen en onderstel.', ex: [0, -0.1, 0] }),
    P('Middentunnel', tunnel, MAT.underbody, { d: 'Tunnel in de vloer voor uitlaat en leidingen.', p: [0, 0.2, 0.15], ex: [0, 0.08, 0] }),
    P('Kofferbakvloer', merge([G.rbox(1.1, 0.012, 0.72, 0.004), xf(G.cyl('y', 0.3, 0.27, 0.16, 28, true), [0, -0.08, 0])]), MAT.underbody, { d: 'Vloer van de bagageruimte met de reservewielkuip.', p: [0, 0.4, -1.88], ex: [0, -0.06, -0.12] }),
    P('Dwarsbalk voorstoelen', G.box(1.34, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de voorstoelen die vloer en dorpels verbindt.', p: [0, 0.225, 0.18], ex: [0, 0.06, 0.04] }),
    P('Dwarsbalk achterbank', G.box(1.34, 0.06, 0.09), MAT.paintIn, { d: 'Dwarsbalk onder de achterbank.', p: [0, 0.24, -0.82], ex: [0, 0.06, -0.04] }),
    ...both(s => P(`Langsligger achter ${sn(s)}`, G.box(0.08, 0.1, 0.9), MAT.paintIn, { d: 'Langsligger onder de bagageruimte die de achteras en de achterbumperbalk draagt.', p: [s * 0.52, 0.32, -1.72], ex: [s * 0.06, -0.06, 0] })),
    ...both(s => P(`Dorpel ${sn(s)}`, lowSide(s, AXR + ARCH + 0.002, AXF - ARCH - 0.002, 36, z => [S1 * 0.55, bodSY(z, 0.302)], 6), MAT.paint, { d: 'Dorpel: dragend kokerprofiel onder de portieren.', ex: [s * 0.12, -0.04, 0] })),
    ...both(s => P(`Dorpelsierlijst ${sn(s)}`, bodMould(s, 0.208, 0.242, -0.95, 0.85, 0.010, 40), MAT.bodBright, { d: 'Zilveren sierlijst langs de onderdorpel (aluminiumlook).', ex: [s * 0.2, -0.02, 0] })),
    ...both(s => P(`Rubberlijn dorpelsierlijst ${sn(s)}`, bodMould(s, 0.194, 0.205, -0.94, 0.84, 0.0035, 40), MAT.rubber, { d: 'Dunne zwarte rubberlijn onder de dorpelsierlijst.', ex: [s * 0.16, -0.03, 0] })),
  ]);
  // voorkop
  const frontGrp = A('Voorkop', { d: 'Dragende voorbouw: langsliggers met kreukelzones, veerpoottorens, schutbord, torpedobak, frontmodule en bumperbalk.', ex: [0, 0.05, 0.42] }, [
    ...both(s => P(`Langsligger voor ${sn(s)}`, G.box(0.075, 0.12, 1.1), MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt.', p: [s * 0.545, 0.34, 1.58], ex: [s * 0.08, 0, 0] })),
    ...both(s => P(`Crashbox ${sn(s)}`, G.rbox(0.09, 0.1, 0.13, 0.01), MAT.steel, { d: 'Kreukelelement tussen langsligger en bumperbalk; wordt na een lichte aanrijding vervangen.', p: [s * 0.545, 0.37, 2.11], ex: [s * 0.04, 0, 0.08] })),
    ...both(s => P(`Veerpoottoren ${sn(s)}`, merge([G.cyl('y', 0.095, 0.13, 0.26, 24, true), xf(G.cyl('y', 0.095, 0.095, 0.006, 24), [0, 0.13, 0])]), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.6, 0.71, 1.33], ex: [s * 0.1, 0.06, 0] })),
    ...both(s => P(`Wielkast voor ${sn(s)}`, G.half('x', ARCH + 0.03, 0.2, PI, 24), MAT.paintIn, { d: 'Binnenscherm van de voorwielkast, gelast aan langsligger en veerpoottoren.', p: [s * 0.6, AY, AXF], r: [0, 0, 0], ex: [s * 0.1, 0.04, 0] })),
    P('Schutbord', G.rbox(1.5, 0.62, 0.012, 0.004), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur.', p: [0, 0.6, 1.02], ex: [0, 0, -0.08] }),
    P('Torpedobak', merge([G.box(1.42, 0.012, 0.12), xf(G.box(1.42, 0.1, 0.012), [0, -0.05, 0.06])]), MAT.paintIn, { d: 'Bak onder de torpedoplaat waarin wissermotor en luchtinlaat van het interieur zitten.', p: [0, 0.905, 1.08], ex: [0, 0.06, 0] }),
    P('Torpedoplaat', merge([bodDeck(WS0 + 0.002, 1.128, 6, () => S4 + 0.002, 26), ...[-0.4, -0.2, 0, 0.2, 0.4].map(x => { const g = new THREE.BoxGeometry(0.16, 0.004, 0.03); g.translate(x, bodSec(1.095).yd + 0.002 - 0.06 * x * x, 1.095); return g; })]), MAT.plastic, { d: 'Kunststof afdekplaat met wisserrooster en luchtinlaat voor het interieur tussen motorkap en voorruit.', ex: [0, 0.1, 0.02] }),
    P('Frontmodule', merge([xf(G.box(1.08, 0.06, 0.06), [0, 0.72, 0]), xf(G.box(1.0, 0.06, 0.06), [0, 0.26, 0]), xf(G.box(0.06, 0.46, 0.06), [0.52, 0.49, 0]), xf(G.box(0.06, 0.46, 0.06), [-0.52, 0.49, 0]), xf(G.box(0.05, 0.4, 0.05), [0, 0.49, 0])]), MAT.plastic, { d: 'Kunststof frontmodule (slotplaat) die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 2.06], ex: [0, 0.04, 0.12] }),
    P('Motorkapslot', merge([G.rbox(0.07, 0.06, 0.04, 0.008), xf(G.rbox(0.02, 0.05, 0.015, 0.004), [0.045, 0.01, 0.015])]), MAT.darkSteel, { d: 'Slot op de frontmodule waarin de slotbeugel van de motorkap grijpt, met ontgrendelkabel naar het interieur.', p: [0, 0.64, 2.2], ex: [0, 0.06, 0.06] }),
    P('Bumperbalk voor', tube([-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map(x => [x, 0.42, 2.2 - 0.25 * x * x]), 0.045, 24, 8), MAT.steel, { d: 'Gebogen stalen botsbalk achter de voorbumper.', ex: [0, 0, 0.1] }),
  ]);
  // zijwanden en dak
  const qScr = z => lerp(0.70, 0.752, clamp((z - SP) / (RW0 - SP), 0, 1));
  const cPillarLo = z => z < -1.212 ? 0.004 : bodQy(z, bodQtop(z) + 0.012);
  const aPillarLo = z => z < bodSail - 0.004 ? bodQG + 0.03 : z < 0.93 ? Math.min(bodQS - 0.02, bodQy(z, 0.93 + (0.93 - z) * 0.55)) : 0.004;
  const roofW = z => [bodQR / 2, 1 - bodQR / 2];
  const roof = patch((z, w) => ghPt(z, w), RW0 - 0.008, WS1, 40, roofW, 22);   // 4 mm overlap met de achterruit (geen spleet op de naad)
  const quarter = s => A(`Kwartsruit ${sn(s)}`, { d: 'Vaste driehoekige ruit achter het achterportier, in de C-stijl gelijmd.', ex: [s * 0.22, 0.06, -0.05] }, [
    P('Ruit', bodGhSide(s, -1.212, bodQd(0.97) - 0.016, 14, z => [0.006, Math.min(bodQy(z, bodQtop(z)), bodQy(z, 0.97 + (-0.93 - 0.016 - z) * 0.33 / 0.06))], 6, bodDense(-1.212, -1.15, 4)), MAT.glass, { d: 'Getint veiligheidsglas.', ex: [s * 0.04, 0, 0] }),
    P('Omlijsting', tube([[-1.214, 0.975], [-1.205, 1.10], [-1.19, 1.205], [-1.15, 1.245], [-1.05, 1.275], [-0.97, 1.297]].map(([z, y]) => { const q = bodQy(z, y); const p = bodGhAt(z, q, 0.002); return [s * p[0], p[1], p[2]]; }), 0.0055, 32, 8), MAT.bodBright, { d: 'Chromen omlijsting rond de kwartsruit.', ex: [s * 0.06, 0.02, 0] }),
    P('Gordellijn kwartsruit', tube([-1.212, -1.15, -1.08, -1.02, -0.96].map(z => { const g = bodGh(z); return [s * (g.xb + 0.004), g.yb + 0.004, z]; }), 0.0055, 16, 8), MAT.bodBright, { d: 'Chromen sierlijst op de gordellijn onder de kwartsruit, in het verlengde van die van het achterportier.', ex: [s * 0.06, -0.02, 0] }),
  ]);
  const sideRoof = A('Zijwanden en dak', { d: 'Stijlen, dakrails, dak met dakbogen, de vaste kwartsruiten en de dakantenne.', ex: [0, 0.32, 0] }, [
    P('Dakpaneel', roof, MAT.paint, { d: 'Dakplaat van staal, gelast op de dakrails (geen panoramadak: dat was een optie).', ex: [0, 0.16, 0] }),
    A('Dakbogen', { d: 'Drie dwarsliggers onder het dakpaneel.', ex: [0, 0.1, 0] }, [[0.18, 'voor'], [-0.45, 'midden'], [-1.05, 'achter']].map(([z, nm]) => P(`Dakboog ${nm}`, (() => { const pts = []; for (let i = 0; i <= 12; i++) { const w = bodQR / 2 + (1 - bodQR) * i / 12; const p = ghPt(z, w); pts.push([p[0] * 0.97, p[1] - 0.025, z]); } return tube(pts, 0.012, 24, 6); })(), MAT.paintIn, { d: 'Dwarsligger onder het dakpaneel.', ex: [0, -0.04, z * 0.05] }))),
    ...both(s => P(`Dakrail ${sn(s)}`, bodGhSide(s, -0.95, WS1, 30, () => [bodQG + 0.03, bodQR], 4), MAT.paint, { d: 'Zijdelingse dakligger boven de portieren.', ex: [s * 0.08, 0.04, 0] })),
    ...both(s => P(`A-stijl ${sn(s)}`, bodGhSide(s, WS1, WS0, 24, z => [aPillarLo(z), bodQR], 5, bodDense(0.78, 0.95, 6)), MAT.paint, { d: 'Voorste dakstijl langs de voorruit.', ex: [s * 0.08, 0.04, 0.04] })),
    ...both(s => P(`Afdekking B-stijl ${sn(s)}`, bodGhSide(s, bodBr(1.34) - 0.001, bodBf(0.946) + 0.002, 10, z => {
      const yr = z > bodBr(0.946) ? 0.946 : bodBrY(z), yf = z < bodBf(0.946) ? bodBfY(z) : 9;
      return [bodQy(z, yr), Math.min(bodQG + 0.03, bodQy(z, yf))];
    }, 6, bodDense(-0.34, -0.13, 8), 0.002), MAT.bodPillar, { d: 'Hoogglans zwarte afdekking van de middenstijl, licht naar achteren hellend.', ex: [s * 0.1, 0, 0] })),
    ...both(s => P(`B-stijl ${sn(s)}`, G.box(0.05, 0.8, 0.1), MAT.paintIn, { d: 'Verstevigd profiel in de middenstijl met de slotbeugel van het voorportier.', p: [s * 0.735, 0.66, -0.17], r: [-0.21, 0, 0], ex: [s * 0.05, 0, 0] })),
    ...both(s => P(`C-stijl ${sn(s)}`, bodGhSide(s, SP, -0.95, 34, z => [cPillarLo(z), z < RW0 ? qScr(z) : bodQR], 8, bodDense(-1.25, -1.15, 5)), MAT.paint, { d: 'Achterste dakstijl met de karakteristieke kromming boven de kwartsruit.', ex: [s * 0.1, 0.04, -0.04] })),
    ...both(quarter),
    A('Dakantenne', { d: 'Korte antennemast achter op het dak.', ex: [0, 0.14, -0.04] }, [
      P('Antennevoet', G.rbox(0.04, 0.025, 0.08, 0.012), MAT.blackGloss, { d: 'Antennevoet met versterker.', p: [0.0, YR(-1.0) + 0.008, -1.0], ex: [0, 0.03, 0] }),
      P('Antennemast', rodBetween([0, YR(-1.0) + 0.015, -1.01], [0, YR(-1.0) + 0.09, -1.14], 0.0035, 8), MAT.plastic, { d: 'Afschroefbare antennemast.', ex: [0, 0.08, 0] }),
    ]),
  ]);
  // achterbouw
  const rfLo = z => { if (z < AXR - ARCH) return bodSY(z, bodYLEDGE + 0.003); if (z <= AXR + ARCH) return Math.max(archS(z), bodSY(z, 0.25)); return bodSY(z, 0.304); };
  const rfHi = z => { if (z <= bodTLZ) return tlLow(z) - 0.002; if (z <= -1.27) return S4 - 0.0008; return bodSY(z, bodRDloZ(z) - 0.004); };
  const rearFender = s => merge([
    lowSide(s, bodZT + 0.001, -0.667, 70, z => [rfLo(z), rfHi(z)], 20, ARCH_BREAKS.concat([-1.271, -1.269, bodTLZ, bodTLZ - 0.001], bodDense(-1.27, -0.66, 10), bodDense(bodZT, bodTLZ, 5))),
    lowSide(s, bodZT + 0.001, SP, 8, z => [z <= bodTLZ ? bodTLhi(z) + 0.001 : S4, bodSAtX(z, 0.6) - 0.003], 3),
    (() => { const g = bodTailGeo(bodTGseam(0.7) + 0.003, 1.2, bodYLEDGE + 0.004, 0.902, 0, 6, 4); if (s < 0) g.scale(-1, 1, 1); return g; })(),
    (() => { const g = bodTailGeo(bodTGseam(1.0) + 0.003, 1.2, 1.04, bodSec(bodZT).yd - 0.002, 0, 3, 4); if (s < 0) g.scale(-1, 1, 1); return g; })(),
    archLip(s, AXR),
  ]);
  const rear = A('Achterbouw', { d: 'Achterschermen, binnenwielkasten, achterpaneel, hoedenplanksteunen en bumperbalk achter.', ex: [0, 0.04, -0.42] }, [
    ...both(s => P(`Achterscherm ${sn(s)}`, rearFender(s), MAT.paint, { d: 'Gelast achterzijpaneel van achterportier tot achterlicht, met de wielboogflens.', ex: [s * 0.22, 0, -0.04] })),
    ...both(s => P(`Wielkast achter ${sn(s)}`, G.half('x', ARCH + 0.02, 0.22, PI, 24), MAT.paintIn, { d: 'Binnenwielkast achter, gelast aan vloer en achterscherm.', p: [s * 0.62, AY, AXR], ex: [s * 0.1, 0.04, 0] })),
    ...both(s => P(`Hoedenplanksteun ${sn(s)}`, G.rbox(0.05, 0.16, 0.5, 0.01), MAT.paintIn, { d: 'Steun van de bagageruimteafdekking tegen de binnenzijwand.', p: [s * 0.66, 0.92, -1.85], ex: [s * 0.06, 0.04, 0] })),
    P('Achterpaneel', G.rbox(1.2, 0.26, 0.012, 0.004), MAT.paintIn, { d: 'Dwarspaneel onder de achterklepopening met de slotbeugel.', p: [0, 0.5, bodZT + 0.03], ex: [0, 0, -0.06] }),
    P('Achterklepsponning', tube(bodTGPath(0.045), 0.012, 80, 6), MAT.paintIn, { d: 'Gelaste sponning rond de achterklepopening waarop de afdichting zit.', ex: [0, 0.04, -0.04] }),
    P('Bumperbalk achter', tube([-0.55, -0.3, 0, 0.3, 0.55].map(x => [x, 0.5, bodZT + 0.02 + 0.05 * (1 - (x / 0.6) ** 2) - 0.05]), 0.04, 20, 8), MAT.steel, { d: 'Stalen botsbalk achter de achterbumper.', ex: [0, 0, -0.1] }),
  ]);
  const liner = (s, az, nm) => P(`Wielkuipscherm ${nm}`, cache('bodLiner', () => { const g = new THREE.CylinderGeometry(ARCH - 0.01, ARCH - 0.01, 0.26, 28, 1, true, PI - 0.25, PI + 0.5); g.rotateZ(-HALF); return g; }), MAT.plastic, { d: 'Kunststof binnenscherm in de wielkast tegen steenslag en vuil.', p: [s * 0.76, AY, az], ex: [s * 0.1, 0.08, 0] });
  const liners = A('Wielkuipschermen', { d: 'Kunststof binnenschermen in de vier wielkasten.', ex: [0, -0.12, 0] }, [liner(L, AXF, 'linksvoor'), liner(R, AXF, 'rechtsvoor'), liner(L, AXR, 'linksachter'), liner(R, AXR, 'rechtsachter')]);
  const cage = A('Carrosseriekooi', { d: 'De gelaste ruwbouw (body in white): vloer, voorbouw, stijlen, dak en achterbouw, met de vaste buitenpanelen.', ex: [0, 0, 0] }, [floorGrp, frontGrp, sideRoof, rear, liners]);

  /* ================= motorkap ================= */
  const hoodS = z => bodHoodS(z) + 0.0018;
  const hoodBr = bodDense(2.2, bodHoodZ1 - 0.002, 10).concat([bodHoodZ1 - 0.0005]);
  const hoodIn = (off, a, b, da) => bodDeck(a, b, 28, z => Math.min(0.995, bodHoodS(z) + da), 12, bodDense(2.1, b, 4), off);
  const hood = A('Motorkap', { d: 'Motorkap van staal met binnenframe, isolatie, scharnieren, slotbeugel, veiligheidshaak en sproeiers.', ex: [0, 0.52, 0.3] }, [
    P('Buitenpaneel motorkap', bodDeck(1.132, bodHoodZ1 - 0.0003, 56, z => Math.min(0.9995, hoodS(z)), 30, hoodBr), MAT.paint, { d: 'Buitenhuid van de motorkap met twee vouwlijnen van de koplampen naar de voorruit.', ex: [0, 0.14, 0] }),
    P('Binnenframe motorkap', hoodIn(0.03, 1.15, 2.26, 0.012), MAT.paintIn, { d: 'Verstevigend binnenframe met de bevestigingspunten van scharnieren en slotbeugel.', ex: [0, 0, 0] }),
    P('Motorkapisolatie', hoodIn(0.04, 1.22, 2.12, 0.04), MAT.carpet, { d: 'Geluids- en hitte-isolatiemat aan de onderzijde.', ex: [0, -0.1, 0] }),
    ...both(s => A(`Kapscharnier ${sn(s)}`, { d: 'Scharnier achteraan de motorkap.', ex: [s * 0.08, -0.04, -0.06] }, [
      P('Scharnierarm', G.rbox(0.02, 0.05, 0.14, 0.006), MAT.darkSteel, { d: 'Gebogen scharnierarm.', p: [s * 0.64, bodSec(1.2).yd - 0.12, 1.2], ex: [0, -0.03, 0] }),
      ...[0, 1].map(i => P(`Kapscharnierbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout M8 tussen scharnier en binnenframe.', p: [s * 0.64, bodSec(1.2).yd - 0.095, 1.17 + i * 0.06], r: [PI, 0, 0], ex: [0, 0.05, 0] })),
    ])),
    P('Slotbeugel motorkap', tube([[-0.02, 0.0, 0], [-0.02, -0.04, 0], [0.02, -0.04, 0], [0.02, 0, 0]].map(([x, y]) => [x, bodSec(2.2).yd - 0.05 + y, 2.2]), 0.004, 12, 6), MAT.steel, { d: 'Beugel aan het binnenframe die in het motorkapslot op de frontmodule grijpt.', ex: [0, -0.08, 0.04] }),
    P('Veiligheidshaak', G.rbox(0.015, 0.05, 0.03, 0.004), MAT.steel, { d: 'Tweede vanghaak die de kap vasthoudt als het slot ontgrendeld is.', p: [0.06, bodSec(2.18).yd - 0.075, 2.18], ex: [0, -0.07, 0] }),
    P('Motorkapsteun', rodBetween([-0.34, 0.757, 2.06], [-0.08, 0.757, 2.06], 0.005, 8), MAT.steel, { d: 'Steunstang die de geopende kap ondersteunt; in rusttoestand ligt hij vastgeklikt langs de bovenste dwarsbalk van de frontmodule.', ex: [-0.04, 0.06, 0] }),
    P('Kapafdichting', tube([-0.6, -0.3, 0, 0.3, 0.6].map(x => [x, bodSec(1.14).yd - 0.035 - 0.1 * x * x, 1.145]), 0.008, 20, 6), MAT.rubber, { d: 'Rubber afdichting tussen kap en torpedobak.', ex: [0, -0.05, -0.04] }),
    ...both(s => A(`Ruitensproeier ${sn(s)}`, { d: 'Sproeier van de ruitensproeierinstallatie aan de achterrand van de kap.', ex: [0, 0.05, 0] }, [
      P('Sproeierkop', G.rbox(0.022, 0.009, 0.018, 0.004), MAT.plastic, { d: 'Kunststof sproeierkop met twee straalopeningen.', p: [s * 0.28, halfPt(1.17, bodSAtX(1.17, 0.28))[1] + 0.005, 1.17], ex: [0, 0.04, 0] }),
      P('Sproeierslang', tube([[s * 0.28, halfPt(1.17, bodSAtX(1.17, 0.28))[1] - 0.02, 1.17], [s * 0.15, bodSec(1.3).yd - 0.05, 1.3], [0, bodSec(1.4).yd - 0.05, 1.4]], 0.003, 12, 5), MAT.rubber, { d: 'Toevoerslang onder de kap.', ex: [0, -0.03, 0] }),
    ])),
  ]);

  /* ================= voorschermen ================= */
  const ffLo = z => { if (z < AXF - ARCH) return bodSY(z, 0.304); if (z <= AXF + ARCH) return archS(z); return bodSY(z, bodSeamF(z) + 0.004); };
  const ffHi = z => z < 0.905 ? bodSY(z, bodFDlo(z) - 0.004) : S4 - 0.0008;
  const fender = s => A(`Voorscherm ${sn(s)}`, { d: 'Geschroefd voorscherm boven het voorwiel, met wielboogflens.', ex: [s * 0.5, 0.08, 0.22] }, [
    P('Schermpaneel', merge([lowSide(s, 0.842, bodHLZ0 - 0.002, 60, z => [ffLo(z), ffHi(z)], 22, ARCH_BREAKS.concat(bodDense(0.842, 0.906, 6), bodDense(1.75, 1.81, 4))), archLip(s, AXF)]), MAT.paint, { d: 'Kunststof of stalen spatbord, in carrosseriekleur gelakt.', ex: [s * 0.04, 0, 0] }),
    ...[1.0, 1.25, 1.5, 1.72].map((z, i) => P(`Schermbout ${i + 1}`, hexBolt(0.02, 0.007, 'y'), MAT.steel, { d: 'Bout langs de bovenflens waarmee het scherm aan de binnenwand vastzit.', p: [s * (bodSec(z).xe - 0.03), YT(z) - 0.012, z], ex: [0, 0.06, 0] })),
    P('Schermsteun', G.rbox(0.03, 0.08, 0.06, 0.006), MAT.darkSteel, { d: 'Steun die de voorkant van het scherm aan de frontmodule verbindt.', p: [s * (surfX(1.78, 0.6) - 0.05), 0.6, 1.78], ex: [-s * 0.04, 0, 0.04] }),
  ]);

  /* ================= voorbumper ================= */
  const fbLo = () => S1 * 0.45;
  const fbHi = z => { if (z < bodHLZ0) return bodSY(z, bodSeamF(z)); if (z <= bodHLZ1) return hlLow(z) - 0.002; return Math.min(1, bodHoodS(z) - 0.002); };
  const fbBr = bodDense(1.752, 1.82, 4).concat(bodDense(2.15, ZF, 16), bodDense(2.235, bodHoodZ1, 8));
  const shellF = bodWeld(merge([lowSide(L, 1.752, ZF, 56, z => [fbLo(z), fbHi(z)], 30, fbBr), lowSide(R, 1.752, ZF, 56, z => [fbLo(z), fbHi(z)], 30, fbBr), bodCap(ZF - 1e-4, 1)]));
  // voorvlak-onderdelen: rooster over (x, y), z op het voorvlak
  const fNorm = (x, y) => { const z = frontZ(Math.abs(x), y), n = bodN(z, sAtY(z, y)); return [Math.sign(x || 1) * n[0], n[1], n[2]]; };
  const fPt = (x, y, out) => { const z = frontZ(Math.abs(x), y), n = fNorm(x, y); return [x + n[0] * out, y + n[1] * out, z + n[2] * out]; };
  const fFace = (x0, x1, y0, y1, out, nx = 16, ny = 3) => patch((y, t) => fPt(x0 + (x1 - x0) * t, y, out), y0, y1, ny, () => [0, 1], nx);
  const fogPose = s => { const x = 0.56, y = 0.37, z = frontZ(x, y), n = fNorm(x, y); return { c: [x, y, z], n }; };
  const fog = s => { const { c, n } = fogPose(s), p = k => [s * (c[0] + n[0] * k), c[1] + n[1] * k, c[2] + n[2] * k];
    return A(`Mistlamp ${sn(s)}`, { d: 'Mistlamp in de bumperhoek (standaard op Initiale Paris).', ex: [s * n[0] * 0.18, -0.02, n[2] * 0.18] }, [
      P('Mistlamphuis', G.rbox(0.03, 0.085, 0.13, 0.02), MAT.blackGloss, { d: 'Zwarte behuizing in de bumperhoek.', ...bodPose(s, [c[0] + n[0] * 0.0, c[1], c[2] + n[2] * 0.0], n) }),
      P('Mistlamplens', G.cyl('x', 0.047, 0.047, 0.006, 24), MAT.lensClear, { d: 'Heldere lens.', ...bodPose(s, [c[0] + n[0] * 0.016, c[1], c[2] + n[2] * 0.016], n), ex: [s * n[0] * 0.06, 0, n[2] * 0.06] }),
      P('Mistlampreflector', G.lathe('x', [[0.0, -0.03], [0.03, -0.022], [0.045, -0.004], [0.046, 0]], 20, 'bodFogR'), MAT.reflector, { d: 'Verchroomde reflector.', ...bodPose(s, [c[0] + n[0] * 0.012, c[1], c[2] + n[2] * 0.012], n) }),
      P('Mistlampje', G.cyl('x', 0.007, 0.007, 0.02, 10), MAT.ceramic, { d: 'H11-halogeenlamp (gangbare uitvoering, schematisch).', inner: true, ...bodPose(s, [c[0] - n[0] * 0.01, c[1], c[2] - n[2] * 0.01], n) }),
    ]); };
  const brow = s => { const pts = []; for (let i = 0; i <= 8; i++) { const x = 0.50 + 0.17 * i / 8, y = 0.43 + 0.03 * i / 8; pts.push(fPt(s * x, y, -0.001)); } return tube(pts, 0.008, 16, 10); };
  const curtain = s => lowSide(s, 1.965, 1.99, 2, z => [bodSY(z, 0.31), bodSY(z, 0.47)], 6, [], -0.002);
  const intakeU = (() => { const pts = [[-0.45, 0.415], [-0.44, 0.31], [-0.39, 0.282], [0, 0.276], [0.39, 0.282], [0.44, 0.31], [0.45, 0.415]]; return tube(pts.map(([x, y]) => fPt(x, y, -0.001)), 0.008, 48, 10); })();
  const mesh = merge([fFace(-0.43, 0.43, 0.29, 0.425, 0.002, 24, 4), ...[0.315, 0.35, 0.385].map(y => fFace(-0.42, 0.42, y, y + 0.007, 0.005, 18, 1)), ...[-0.33, -0.22, -0.11, 0, 0.11, 0.22, 0.33].map(x => fFace(x - 0.004, x + 0.004, 0.295, 0.42, 0.005, 1, 3))]);
  const plateY = 0.505, plateZ = ZF - 0.001;
  const frontBumper = A('Voorbumper', { d: 'Kunststof bumperschaal van de fase 2 met bovengrille, kentekenvlak, brede onderste inlaat met chroom U-rand, mistlampen en luchtgordijnen.', ex: [0, -0.04, 0.72] }, [
    P('Bumperschaal voor', shellF, MAT.paint, { d: 'Gespoten kunststof bumperschaal in carrosseriekleur.', ex: [0, 0, 0] }),
    A('Bovengrille', { d: 'Smalle zwarte sleuf direct onder de voorrand van de motorkap.', ex: [0, 0.04, 0.12] }, [
      P('Grillesleuf', fFace(-0.3, 0.3, 0.618, 0.648, 0.003, 20, 2), MAT.blackGloss, { d: 'Hoogglans zwart rooster.', ex: [0, 0, 0] }),
      P('Chroomlijn grille', tube([-0.3, -0.15, 0, 0.15, 0.3].map(x => [x, 0.611, frontZ(x, 0.611) + 0.001]), 0.005, 16, 8), MAT.bodBright, { d: 'Dunne chroomlijn onder de grillesleuf.', ex: [0, -0.02, 0.04] }),
    ]),
    P('Kentekenvlak', fFace(-0.34, 0.34, 0.44, 0.572, 0.002, 20, 4), MAT.blackGloss, { d: 'Zwart horizontaal vlak boven de onderste inlaat waarop de kentekenplaat zit.', ex: [0, 0.02, 0.08] }),
    P('Kentekenplaathouder', G.box(0.54, 0.13, Math.max(0.01, plateZ - frontZ(0.27, plateY) - 0.002)), MAT.plastic, { d: 'Kunststof houder die de vlakke plaat op de gebogen bumper houdt.', p: [0, plateY, (plateZ + frontZ(0.27, plateY)) / 2 - 0.002], ex: [0, 0, 0.1] }),
    A('Kentekenplaat voor', { d: 'Gele Nederlandse kentekenplaat (zonder kenteken weergegeven).', ex: [0, 0.03, 0.26] }, [
      P('Plaat', G.box(0.52, 0.11, 0.004), MAT.plateYellow, { d: 'Retroreflecterende gele plaat van 520 × 110 mm.', p: [0, plateY, plateZ + 0.003], ex: [0, 0, 0.03] }),
      P('EU-strook', G.box(0.045, 0.11, 0.005), MAT.plateBlue, { d: 'Blauwe strook met de landcode, zonder tekst weergegeven.', p: [0.2375, plateY, plateZ + 0.0035], ex: [0.06, 0, 0.02] }),
    ]),
    A('Onderste luchtinlaat', { d: 'Brede, lage inlaat voor radiateur en intercooler, met een chromen U-rand.', ex: [0, -0.05, 0.12] }, [
      P('Inlaatrooster', mesh, MAT.rubber, { d: 'Zwart kunststof rooster in de inlaat.', ex: [0, 0, 0] }),
      P('Chroomlijst inlaat', intakeU, MAT.bodBright, { d: 'Chromen U-lijst langs de onderkant en zijkanten van de inlaat.', ex: [0, -0.02, 0.06] }),
    ]),
    A('Mistlampen voor', { d: 'Twee mistlampen in de bumperhoeken met elk een chromen wenkbrauw.', ex: [0, -0.02, 0.1] }, [
      ...both(fog),
      ...both(s => P(`Chroomwenkbrauw ${sn(s)}`, brow(s), MAT.bodBright, { d: 'Chromen balk boven de mistlamp, naar buiten oplopend.', ex: [s * 0.08, 0.04, 0.08] })),
    ]),
    ...both(s => P(`Luchtgordijn ${sn(s)}`, curtain(s), MAT.blackGloss, { d: 'Smalle verticale opening in de bumperhoek naast de wielboog.', ex: [s * 0.08, 0, 0.04] })),
    P('Onderlip', merge([lowSide(L, 1.80, ZF, 30, z => [S1 * 0.45, bodSY(z, YB(z) + 0.022)], 2, bodDense(2.2, ZF, 6), -0.003), lowSide(R, 1.80, ZF, 30, z => [S1 * 0.45, bodSY(z, YB(z) + 0.022)], 2, bodDense(2.2, ZF, 6), -0.003)]), MAT.plastic, { d: 'Zwarte spoilerlip onder de bumper.', ex: [0, -0.08, 0.06] }),
    ...both(s => P(`Sierstrip onderlip ${sn(s)}`, lowSide(s, 1.76, 2.15, 14, z => [bodSY(z, YB(z) + 0.028), bodSY(z, YB(z) + 0.046)], 1, [], -0.004), MAT.bodBright, { d: 'Zilveren strip langs de bumperzijde die doorloopt in de dorpelsierlijst.', ex: [s * 0.06, -0.03, 0] })),
    A('Koplampsproeiers', { d: 'Twee uitschuifbare koplampsproeiers onder de bi-xenon koplampen.', ex: [0, 0.02, 0.08] }, both(s => { const z = 2.0, y = bodHLlo(z) - 0.035, p = bodAt(z, y, 0.004), nn = bodNormalAt(z, y);
      return A(`Koplampsproeier ${sn(s)}`, { d: 'Uitschuifbare koplampsproeier (Initiale Paris: koplampsproeiers bij de bi-xenon).', ex: [s * 0.1, 0, 0.1] }, [
        P('Sproeierkapje', G.rbox(0.012, 0.025, 0.06, 0.008), MAT.paint, { d: 'Kapje in carrosseriekleur.', ...bodPose(s, p, nn) }),
        P('Sproeierkop koplamp', G.cyl('x', 0.008, 0.008, 0.04, 10), MAT.plastic, { d: 'Telescopische sproeierkop.', inner: true, ...bodPose(s, bodAt(z, y, -0.02), nn), ex: [s * 0.04, 0, 0.03] }),
      ]); })),
    A('Parkeersensoren voor', { d: 'Vier ultrasone sensoren van de parkeerhulp voor (op de Initiale aannemelijk standaard, in andere markten optie).', ex: [0, 0.03, 0.12] }, [-0.42, -0.15, 0.15, 0.42].map((x, i) => P(`Parkeersensor voor ${i + 1}`, G.cyl('z', 0.011, 0.011, 0.02, 12), MAT.paint, { d: 'Ultrasone parkeersensor voor (op de Initiale aannemelijk standaard, in andere markten optie).', p: fPt(x, 0.452, -0.006), ex: [0, 0.02, 0.06] }))),
    ...both(s => P(`Bumpersteun voor ${sn(s)}`, G.rbox(0.05, 0.08, 0.12, 0.01), MAT.plastic, { d: 'Steun die de bumperschaal aan voorscherm en frontmodule vasthoudt.', inner: true, p: [s * 0.74, 0.5, 1.86], ex: [s * 0.05, 0, 0] })),
  ]);

  /* ================= achterbumper ================= */
  const rbBr = bodDense(-2.3, bodZT, 4);
  const shellR = bodWeld(merge([
    lowSide(L, -1.778, bodZT, 30, z => [S1 * 0.45, bodSY(z, bodYLEDGE)], 22),
    lowSide(R, -1.778, bodZT, 30, z => [S1 * 0.45, bodSY(z, bodYLEDGE)], 22),
    lowSide(L, ZR + 1e-4, bodZT, 12, () => [S1 * 0.45, 1], 22, rbBr), lowSide(R, ZR + 1e-4, bodZT, 12, () => [S1 * 0.45, 1], 22, rbBr),
    bodCap(ZR + 1e-4, -1),
  ]));
  const rFace = (x0, x1, y0, y1, out, nx = 12, ny = 3) => patch((y, t) => { const x = x0 + (x1 - x0) * t; return [x, y, bodRearZ(x, y) - out]; }, y0, y1, ny, () => [0, 1], nx);
  const recess = merge([rFace(-0.40, 0.40, 0.30, 0.322, 0.003, 12, 1), rFace(-0.40, 0.40, 0.478, 0.50, 0.003, 12, 1), rFace(-0.40, -0.378, 0.30, 0.50, 0.003, 1, 4), rFace(0.378, 0.40, 0.30, 0.50, 0.003, 1, 4)]);
  const rPlateY = 0.38, rzA = bodRearZ(0, 0.335), rzB = bodRearZ(0, 0.425), rTilt = -Math.atan2(rzA - rzB, 0.09), rPlateZ = (rzA + rzB) / 2 - 0.007;
  const rearBumper = A('Achterbumper', { d: 'Bumperschaal met kentekenuitsparing, richel onder de achterklep, reflectoren, parkeersensoren en uitsparingen voor de dubbele uitlaat (aannemelijk voor deze motor).', ex: [0, -0.04, -0.7] }, [
    P('Bumperschaal achter', shellR, MAT.paint, { d: 'Gespoten kunststof bumperschaal met de richel onder de achterklep.', ex: [0, 0, 0] }),
    P('Kentekenuitsparing', recess, MAT.paintIn, { d: 'Afgeschuinde rand van de verdiepte kentekenuitsparing in de bumper.', ex: [0, 0, -0.06] }),
    A('Kentekenplaat achter', { d: 'Gele Nederlandse kentekenplaat (zonder kenteken weergegeven).', ex: [0, 0, -0.22] }, [
      P('Plaat', G.box(0.52, 0.11, 0.004), MAT.plateYellow, { d: 'Retroreflecterende gele plaat van 520 × 110 mm, licht gekanteld met het bumpervlak.', p: [0, rPlateY, rPlateZ], r: [rTilt, 0, 0], ex: [0, 0, -0.03] }),
      P('EU-strook', G.box(0.045, 0.11, 0.005), MAT.plateBlue, { d: 'Blauwe strook met de landcode, zonder tekst weergegeven.', p: [0.2375, rPlateY, rPlateZ - 0.0005], r: [rTilt, 0, 0], ex: [0.06, 0, -0.02] }),
    ]),
    ...both(s => P(`Kentekenverlichting ${sn(s)}`, G.rbox(0.06, 0.008, 0.025, 0.003), MAT.lensClear, { d: 'Kentekenverlichting in de bovenrand van de uitsparing.', p: [s * 0.2, 0.47, bodRearZ(0.2, 0.47) + 0.004], ex: [s * 0.02, 0.04, 0] })),
    P('Onderschort', merge([lowSide(L, -2.0, bodZT, 10, z => [S1 * 0.4, bodSY(z, YB(z) + 0.05)], 2, [], -0.003), lowSide(R, -2.0, bodZT, 10, z => [S1 * 0.4, bodSY(z, YB(z) + 0.05)], 2, [], -0.003), lowSide(L, ZR + 0.02, bodZT, 6, z => [S1 * 0.4, bodSY(z, YB(z) + 0.05)], 2, [], -0.003), lowSide(R, ZR + 0.02, bodZT, 6, z => [S1 * 0.4, bodSY(z, YB(z) + 0.05)], 2, [], -0.003)]), MAT.plasticGrey, { d: 'Donkergrijze onderschort van de achterbumper.', ex: [0, -0.08, -0.04] }),
    P('Mistachterlicht', G.rbox(0.1, 0.03, 0.012, 0.006), MAT.lensRed, { d: 'Mistachterlicht onderin de bumper aan de bestuurderszijde (positie geschat uit fase 2-foto\'s).', p: [0.62, 0.34, bodRearZ(0.62, 0.34) - 0.004], ex: [0.04, 0, -0.08] }),
    P('Reflector rechts', G.rbox(0.1, 0.03, 0.01, 0.006), MAT.lensRed, { d: 'Rode reflector onderin de bumper.', p: [-0.62, 0.34, bodRearZ(0.62, 0.34) - 0.004], ex: [-0.04, 0, -0.08] }),
    A('Parkeersensoren achter', { d: 'Vier ultrasone sensoren van de parkeerhulp achter (standaard op Initiale Paris).', ex: [0, 0.03, -0.12] }, [0.5, 0.18, -0.18, -0.5].map((x, i) => P(`Parkeersensor achter ${i + 1}`, G.cyl('z', 0.011, 0.011, 0.02, 12), MAT.paint, { d: 'Ultrasone parkeersensor achter (standaard op Initiale Paris).', p: [x, 0.45, bodRearZ(x, 0.45) + 0.006], ex: [0, 0.02, -0.06] }))),
    ...both(s => P(`Uitlaatuitsparing ${sn(s)}`, lowSide(s, -2.29, -2.13, 6, z => [clamp(bodSAtXLow(z, 0.72), 0, S1), clamp(bodSAtXLow(z, 0.56), 0, S1)], 3, [], -0.002), MAT.blackGloss, { d: 'Uitsparing in de onderrand voor het verchroomde uitlaateindstuk (het eindstuk zelf hoort bij het uitlaatsysteem).', ex: [0, -0.04, -0.06] })),
    ...both(s => P(`Bumpersteun achter ${sn(s)}`, G.rbox(0.05, 0.08, 0.14, 0.01), MAT.plastic, { d: 'Geleider die de bumperschaal aan het achterscherm vasthoudt.', inner: true, p: [s * 0.8, 0.55, -1.95], ex: [s * 0.05, 0, 0] })),
  ]);

  /* ================= achterklep ================= */
  const tgFace = (x0, x1, y0, y1, ny = 6, nx = 14) => bodTailGeo(x0, x1, y0, y1, 0, ny, nx);
  const gsP = (s, z, inw) => { const p = bodGhHalf(z, bodQS + 0.04); return [s * (p[0] - inw), p[1] - inw, z]; };
  const ydT = bodSec(bodZT).yd;
  const tgOuter = merge([
    tgFace(-bodTGseam(0.7), bodTGseam(0.7), bodYLEDGE + 0.004, 0.902, 8),
    tgFace(-0.37, 0.37, 0.902, 1.04, 4, 10),
    tgFace(-bodTGseam(1.0), bodTGseam(1.0), 1.04, ydT - 0.001, 3),
    bodDeck(bodZT, SP + 0.002, 8, z => bodSAtX(z, 0.6), 24),
  ]);
  const scr = patch((z, w) => ghPt(z, w), SP + 0.004, RW0 - 0.004, 30, z => { const q = qScr(z) + 0.004; return [q / 2, 1 - q / 2]; }, 22);
  const lip = patch((x, t) => { const z = SP + 0.012 - 0.065 * t, sv = bodSAtX(SP, x), y = halfPt(SP, sv)[1] + 0.006 + 0.012 * (1 - t) - 0.004 * t * t; return [x, y, z]; }, -0.62, 0.62, 24, () => [0, 1], 3);
  const lipEdge = SP + 0.012 - 0.065;
  const wPiv = [0.32, halfPt(SP + 0.06, bodSAtX(SP + 0.06, 0.32))[1] + 0.03, SP + 0.06];
  const wTip = (() => { const z = -1.5; const w = 0.5 - 0.5 * 0.55 / bodGh(z).xr * 0.98; const p = ghPt(z, w); return [0.5, p[1] + 0.03, z]; })();
  const tailgate = A('Achterklep', { d: 'Grote achterklep met de hele achterruit, typerend voor de vijfdeurs hatchback, met spoilerlip, derde remlicht en achterruitenwisser.', ex: [0, 0.42, -0.5] }, [
    P('Buitenpaneel achterklep', tgOuter, MAT.paint, { d: 'Plaatwerk van de achterklep onder en achter de ruit.', ex: [0, 0, -0.08] }),
    P('Binnenpaneel achterklep', merge([bodTailGeo(-0.36, 0.36, 0.68, ydT - 0.02, -0.04, 4, 8), patch((z, w) => { const p = ghPt(z, w); return [p[0] * 0.92, p[1] - 0.03, z]; }, SP + 0.04, RW0 - 0.06, 10, () => [0.39, 0.61], 6)]), MAT.paintIn, { d: 'Binnenframe van de achterklep met scharnier- en slotversteviging.', ex: [0, 0, 0] }),
    P('Achterruit', scr, MAT.glass, { d: 'Verwarmde achterruit van gehard glas, zeer vlak geplaatst (ca. 14 graden).', ex: [0, 0.14, 0.02] }),
    P('Spoilerlip', lip, MAT.paint, { d: 'Smalle spoilerlip boven de achterruitrand, ca. 5 cm uitstekend.', ex: [0, 0.1, -0.06] }),
    P('Derde remlicht', G.rbox(0.3, 0.012, 0.012, 0.004), MAT.lensRed, { d: 'Derde remlicht in de achterrand van de spoilerlip (plaats niet bevestigd, schematisch).', p: [0, halfPt(SP, 1)[1] + 0.012, lipEdge + 0.006], ex: [0, 0.05, -0.08] }),
    A('Achterruitenwisser', { d: 'Achterruitenwisser die langs de zijrand van de ruit parkeert (links op een foto van fase 2, rechts op een tekening van fase 1; aannemelijk).', ex: [0.06, 0.14, 0] }, [
      P('Wisserarm achter', tube([wPiv, [0.42, (wPiv[1] + wTip[1]) / 2 + 0.01, (wPiv[2] + wTip[2]) / 2], wTip], 0.006, 16, 6), MAT.blackGloss, { d: 'Wisserarm.', ex: [0, 0.03, 0] }),
      P('Wisserblad achter', tube([[0.46, (wPiv[1] + wTip[1]) * 0.5 + 0.02, -1.85], [0.505, wTip[1] - 0.005, -1.42]], 0.006, 8, 5), MAT.rubber, { d: 'Wisserblad.', ex: [0, 0.06, 0] }),
      P('Asmoerkap', G.cyl('y', 0.014, 0.016, 0.02, 12), MAT.blackGloss, { d: 'Kap over de asmoer van de wisserarm.', p: wPiv, ex: [0, 0.03, 0] }),
      P('Wissermotor achter', merge([G.cyl('z', 0.03, 0.03, 0.08, 16), xf(G.rbox(0.07, 0.05, 0.05, 0.01), [0, 0, -0.06])]), MAT.darkSteel, { d: 'Motor van de achterruitenwisser in de klep.', p: [wPiv[0], wPiv[1] - 0.06, wPiv[2] + 0.02], ex: [0, -0.06, 0.06] }),
    ]),
    A('Achterklepslot', { d: 'Slot onderin de klep met elektrische ontgrendeling.', inner: true, ex: [0, -0.08, 0.04] }, [
      P('Slotkast achterklep', G.rbox(0.08, 0.05, 0.05, 0.008), MAT.darkSteel, { d: 'Slot met vanghaak om de slotbeugel in het achterpaneel.', p: [0, 0.67, bodZT + 0.03], ex: [0, -0.04, 0] }),
      P('Slotmotor achterklep', G.rbox(0.05, 0.04, 0.04, 0.008), MAT.plastic, { d: 'Elektrische ontgrendelmotor.', p: [0.07, 0.69, bodZT + 0.04], ex: [0.04, 0, 0] }),
    ]),
    ...both(s => A(`Gasveer ${sn(s)}`, { d: 'Gasveer die de geopende achterklep omhoog houdt.', ex: [s * 0.14, 0, 0] }, [
      P('Cilinder', rodBetween(gsP(s, -1.95, 0.09), gsP(s, -1.5, 0.06), 0.011, 12), MAT.blackGloss, { d: 'Gasgevulde cilinder.', ex: [0, 0, -0.05] }),
      P('Zuigerstang', rodBetween(gsP(s, -1.5, 0.06), gsP(s, -1.3, 0.055), 0.005, 8), MAT.steel, { d: 'Verchroomde zuigerstang.', ex: [0, 0.03, 0.05] }),
    ])),
    ...both(s => P(`Klepscharnier ${sn(s)}`, G.rbox(0.03, 0.03, 0.08, 0.006), MAT.darkSteel, { d: 'Scharnier tussen dak en achterklep.', p: [s * 0.42, YR(RW0) - 0.04, RW0 - 0.01], ex: [0, 0.04, 0.04] })),
    ...both(s => P(`Klepbuffer ${sn(s)}`, G.cyl('z', 0.012, 0.012, 0.02, 10), MAT.rubber, { d: 'Rubberen aanslag die het rammelen van de klep voorkomt.', inner: true, p: [s * 0.48, 0.68, bodZT + 0.035], ex: [s * 0.03, 0, 0.04] })),
    P('Klepafdichting', tube(bodTGPath(0.03), 0.008, 80, 5), MAT.rubber, { d: 'Rubber afdichting tussen klep en sponning.', ex: [0, 0, 0.06] }),
    P('Binnenbekleding achterklep', bodTailGeo(-0.48, 0.48, 0.7, ydT - 0.04, -0.055, 4, 8), MAT.dash, { d: 'Kunststof binnenbekleding met greep om de klep te sluiten.', ex: [0, 0, 0.12] }),
  ]);

  /* ================= voorruit en wissers ================= */
  const wsW = [bodQR / 2 + 0.002, 1 - bodQR / 2 - 0.002];
  const windscreen = A('Voorruit', { d: 'Gelaagde voorruit onder een hoek van ca. 26 graden, met rubber en regensensor.', ex: [0, 0.4, 0.42] }, [
    P('Voorruitglas', patch((z, w) => ghPt(z, w), WS1 + 0.004, WS0 - 0.006, 28, () => wsW, 22), MAT.glass, { d: 'Gelaagd veiligheidsglas met akoestische tussenlaag.', ex: [0, 0.08, 0.04] }),
    P('Voorruitrubber', (() => { const pts = []; const zz = [WS0 - 0.01, 0.85, 0.65, 0.45, WS1 + 0.006]; zz.forEach(z => { const p = bodGhAt(z, bodQR - 0.004, 0.004); pts.push([p[0], p[1], z]); }); for (let i = 1; i < 10; i++) { const p = ghPt(WS1 + 0.006, 0.36 + 0.28 * i / 10); pts.push([p[0], p[1] + 0.004, p[2]]); } zz.slice().reverse().forEach(z => { const p = bodGhAt(z, bodQR - 0.004, 0.004); pts.push([-p[0], p[1], z]); }); return tube(pts, 0.006, 80, 5); })(), MAT.rubber, { d: 'Zwarte sierrubber langs zijkanten en bovenrand.', ex: [0, 0.04, 0] }),
    P('Regensensor', G.rbox(0.07, 0.012, 0.06, 0.008), MAT.plastic, { d: 'Regen- en lichtsensor achter de ruit bij de binnenspiegel.', p: [0, YR(0.36) - 0.022, 0.36], r: [0.4, 0, 0], ex: [0, -0.06, 0] }),
  ]);
  const wipeOn = (x, z, lift) => { const g = bodGh(z), q = bodQR + (1 - bodQR) * (1 - Math.abs(x) / g.xr); const p = bodGhHalf(z, Math.min(1, q), g); return [x, p[1] + lift, z]; };
  const wArm = (x0, x1, lift) => tube([0, 0.33, 0.66, 1].map(t => { const x = x0 + (x1 - x0) * t, z = 1.035 - 0.02 * Math.sin(PI * t); return wipeOn(x, z, lift); }), 0.007, 24, 6);
  const wipers = A('Ruitenwissers', { d: 'Wisserinstallatie met torpedoplaat, twee armen in tandemopstelling (linksgestuurd), motor en stangenstelsel.', ex: [0, 1.0, 0.1] }, [
    P('Wisserarm links', wArm(-0.02, 0.58, 0.022), MAT.blackGloss, { d: 'Wisserarm aan de bestuurderszijde (linksgestuurd: tandemopstelling, dus niet symmetrisch).', ex: [0, 0.08, 0] }),
    P('Wisserarm rechts', wArm(-0.52, 0.02, 0.022), MAT.blackGloss, { d: 'Wisserarm aan de passagierszijde.', ex: [0, 0.08, 0] }),
    P('Wisserblad links', wArm(0.0, 0.62, 0.008), MAT.rubber, { d: 'Wisserblad bestuurderszijde.', ex: [0, 0.14, 0] }),
    P('Wisserblad rechts', wArm(-0.5, 0.04, 0.008), MAT.rubber, { d: 'Wisserblad passagierszijde.', ex: [0, 0.14, 0] }),
    ...[[-0.02, 'bestuurderszijde'], [-0.52, 'passagierszijde']].map(([x, nm]) => P(`Wisseraskap ${nm}`, G.cyl('y', 0.016, 0.018, 0.02, 12), MAT.blackGloss, { d: 'Kap over de asmoer van de wisserarm.', p: [x, bodSec(1.1).yd + 0.01 - 0.06 * x * x, 1.1], ex: [0, 0.05, 0] })),
    P('Wissermotor', merge([G.cyl('z', 0.04, 0.04, 0.09, 16), xf(G.rbox(0.08, 0.06, 0.05, 0.01), [0, 0, 0.06])]), MAT.darkSteel, { d: 'Elektromotor van de ruitenwissers in de torpedobak.', inner: true, p: [0.3, 0.9, 1.07], ex: [0, -0.1, 0.06] }),
    P('Wisserstangenmechaniek', merge([rodBetween([-0.52, 0.92, 1.1], [0.3, 0.9, 1.08], 0.007, 8), rodBetween([0.3, 0.9, 1.08], [-0.02, 0.92, 1.1], 0.007, 8)]), MAT.steel, { d: 'Stangenstelsel dat beide wisserassen aandrijft.', ex: [0, -0.06, 0.12] }),
  ]);

  return A('Carrosserie', { d: 'Zelfdragende carrosserie van de vijfdeurs hatchback in zilvergrijs metallic (Gris Platine), met alle aanbouwdelen, ruiten en verlichting.', ex: [0, 2.0, 0], spec: [['Lengte', '4.695 mm'], ['Breedte zonder / met spiegels', '1.811 / 2.060 mm'], ['Hoogte', '1.445 mm'], ['Wielbasis', '2.756 mm'], ['Spoorbreedte voor / achter', '1.557 / 1.512 mm'], ['Kleur', 'Gris Platine (D69)']] }, [
    cage, hood, tailgate, fender(L), fender(R), frontBumper, rearBumper,
    buildDoor(L, true), buildDoor(R, true), buildDoor(L, false), buildDoor(R, false),
    windscreen, buildHeadlight(L), buildHeadlight(R), buildTaillight(L), buildTaillight(R), wipers,
  ]);
}

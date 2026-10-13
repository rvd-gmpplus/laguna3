/* ===================== carrosserie: onderdelen ===================== */
// Panelen zijn stukken van het parametrische oppervlak uit body.js: onderbak in (z, s), kas in (z, q), staartvlak in (x, y).
MAT.paint.color.setHex(0xaeb2b7);          // Gris Platine D69 (zilvergrijs metallic), geschat uit fase 2-persfoto's (#B3B6BA)
MAT.paintIn.color.setHex(0x9a9ea4);
// zijruiten en voorruit: donker getint autoglas; weinig omgevingsreflectie, zodat de ruitband als donkere band leest en het interieur zwak doorschemert
// envMapIntensity (0,12) en specularIntensity (0,14, begrenst ook de Fresnel-reflectie bij scherende hoek) laag: de vlakke achterruit werd anders melkwit
MAT.glass.color.setHex(0x040608); MAT.glass.opacity = 0.92; MAT.glass.envMapIntensity = 0.12; MAT.glass.roughness = 0.08; MAT.glass.specularIntensity = 0.14;
// nieuwe carrosseriematerialen: zwart mat voor stijlen en raamkaders, helder chroom voor lijsten en sierstrips, spiegelglas
std('bodPillar', 0x060607, 0, 0.8, { envMapIntensity: 0.12 });
std('bodBright', 0xf4f6f8, 0.6, 0.16, { envMapIntensity: 1.5 });
std('bodMirror', 0xb4bec6, 1, 0.04, { envMapIntensity: 1.1 });
// hoogglans zwart van de B-stijlafdekkingen: donker, vrijwel niet metallisch en weinig omgevingsreflectie, zodat het zwart blijft lezen
std('bodPillarGloss', 0x08090b, 0.05, 0.3, { envMapIntensity: 0.35 });
std('bodValance', 0x2b2d31, 0, 0.66);                                     // donkergrijs kunststof van de onderschort achter
// chroom van de sierlijsten (raamomlijsting, gordel, voorbumper): volledig metallisch, glad en met een donkerder basis dan bodBright, zodat het
// de omgeving met contrast spiegelt (heldere lichtvlakken naast donkere vloer) in plaats van vlak wit te lezen
std('bodChrome', 0xa9b0b7, 1, 0.06, { envMapIntensity: 2.1 });
std('bodGrille', 0x1d1f23, 0.35, 0.24, { envMapIntensity: 1.1 });             // glanzend zwart kunststof van de inlaatlamellen
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
// B-stijl: twee zwarte afdekkingen naast elkaar (raamkader voorportier voor de naad, raamkader achterportier erachter), samen 0,15 m
// breed op de gordel en 0,10 m bovenaan, helling ca. 12 graden naar achteren; de sluitnaad (z -0,148 op de gordel) loopt ertussen omhoog
const bodBGK = Math.tan(12 * PI / 180), bodBFK = 0.116 / 0.43, bodBRK = 0.066 / 0.43, bodBGW = 0.0045;
const bodBg = y => -0.148 - (y - 0.946) * bodBGK;                          // hartlijn van de naad tussen de afdekkingen
const bodBf = y => -0.073 - (y - 0.946) * bodBFK;                          // voorkant van de voorste afdekking (achterrand ruit voorportier)
const bodBr = y => -0.223 - (y - 0.946) * bodBRK;                          // achterkant van de achterste afdekking (voorrand ruit achterportier)
const bodBgY = z => 0.946 + (-0.148 - z) / bodBGK;                         // hoogte waarop de naad op z ligt
const bodBfY = z => 0.946 + (-0.073 - z) / bodBFK;                         // hoogte waarop de voorkant op z ligt (omgekeerde van bodBf)
const bodBrY = z => 0.946 + (-0.223 - z) / bodBRK;                         // idem voor de achterkant
// band op de kas tussen twee hellende lijnen z = zf - (y - 0,946) kf (voor) en z = zr - (y - 0,946) kr (achter), van de gordel tot q = qTop
function bodBand(s, zf, kf, zr, kr, out, qTop = bodQG + 0.03) {
  const yTop = 1.40, za = zr - (yTop - 0.946) * kr, zb = zf;
  return bodGhSide(s, za, zb, 12, z => {
    const ylo = 0.946 + (zr - z) / kr, yhi = 0.946 + (zf - z) / kf, q0 = bodQy(z, ylo);
    return [q0, Math.max(q0, Math.min(qTop, bodQy(z, yhi)))];
  }, 6, bodDense(za, zb, 22), out);
}
const bodQd = y => -0.93 - (y - 0.97) * (0.06 / 0.33);                     // schuin stijltje achterportier / kwartsruit
// boven- en achterrand van de kwartsruit: loopt zoals op de zijfoto van fase 2 in een schuine boog naar een punt op de gordel bij z -1,25
// (de achterste punt van de ruitlijn, vlak voor de sluitnaad van het achterportier)
const bodQZ = -1.25;
const bodQtop = pchip([[bodQZ, 0.975], [-1.236, 1.07], [-1.215, 1.14], [-1.185, 1.195], [-1.14, 1.238], [-1.08, 1.265], [-1.0, 1.287], [-0.95, 1.30]]);
// band langs het schuine stijltje: d0..d1 = afstand in z tot de hartlijn bodQd(y), van q0 tot q1 op de kas (ook over de dakrailronding);
// out = afstand boven de kas, crown = bolling over de breedte
function bodQdBand(s, q0, q1, d0, d1, out, crown = 0, nq = 12, nt = 1) {
  return patch((q, t) => {
    const d = d0 + (d1 - d0) * t, o = out + crown * Math.sin(PI * t); let z = bodQd(1.1) + d;
    for (let i = 0; i < 4; i++) z = bodQd(bodGhHalf(z, q)[1]) + d;
    const [x, y] = bodGhHalf(z, q); return [s * (x + o), y + (q > bodQS ? o * 0.6 : 0), z];
  }, q0, q1, nq, () => [0, 1], nt);
}
const bodSail = 0.865;                                                    // spiegeldriehoek tussen z 0,865 en de A-stijl
const bodQy = (z, y) => bodQAtY(z, y);

/* ---------- sierlijsten met afgerond profiel ---------- */
// lijst op de huid van de onderbak tussen y0 en y1 en z zA..zB; hgt = hoogte van het profiel boven de huid; de uiteinden lopen in de huid weg
function bodMould(s, y0, y1, zA, zB, hgt, nz = 36, nv = 8) {
  return patch((z, t) => {
    const e = sstep((z - zA) / 0.05) * sstep((zB - z) / 0.05), o = hgt * e * Math.pow(Math.sin(PI * t), 0.6) - 0.001;
    const p = bodAt(z, y0 + (y1 - y0) * t, o); return [s * p[0], p[1], p[2]];
  }, zA, zB, nz, () => [0, 1], nv);
}
// zijsierlijst van het portier (foto's zwarte en zilveren fase 2): een verhoogde beschermlijst van ca. 38 mm in carrosseriekleur met
// afgeronde uiteinden; 'spits' = het voorste eind van de voorportierlijst, waar de onderrand schuin oploopt naar de bovenrand.
// Geeft fn(z, t, extra): t = 0 onderrand, 1 bovenrand; extra = verschuiving boven het profiel (aluminium inzet, rubberrand)
function bodLijst(s, zA, zB, spA, spB, yc = 0.54, h = 0.038, hgt = 0.008) {
  const rnd = (d, L) => (d >= L ? 1 : Math.sqrt(Math.max(0, 1 - (1 - d / L) ** 2)));
  const end = (d, sp) => (sp ? [rnd(d, 0.10), rnd(d, 0.035), 0.55] : [rnd(d, h * 0.6), rnd(d, h * 0.6), 0]);
  return (z, t, extra = 0) => {
    const dA = z - zA, dB = zB - z, [wl, wu, k] = dA < dB ? end(dA, spA) : end(dB, spB);
    const yk = yc + h / 2 * k, ylo = yk - (yk - (yc - h / 2)) * wl, yhi = yk + (yc + h / 2 - yk) * wu;
    const tt = clamp(t, 0, 1), y = ylo + (yhi - ylo) * t, prof = tt <= 0 || tt >= 1 ? 0 : Math.pow(Math.sin(PI * tt), 0.35);
    const p = bodAt(z, y, hgt * Math.sqrt(Math.min(wl, wu)) * prof - 0.0008 + extra); return [s * p[0], p[1], p[2]];
  };
}
// vlakke, licht bolle chroomband langs een pad (z, q) op de kas: w = breedte, out = afstand boven de kas, crown = bolling
function bodRibbon(s, zq, w, out = 0.004, crown = 0.0015, nv = 4, P = (z, q) => { const [x, y] = bodGhHalf(z, clamp(q, 0, 1)); return [x, y, z]; }) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], nrm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const pos = [], idx = [], n = zq.length, e = 1e-3;
  zq.forEach(([z, q], i) => {
    const p = P(z, q), a = zq[Math.max(0, i - 1)], b = zq[Math.min(n - 1, i + 1)], T = nrm(sub(P(...b), P(...a)));
    let N = nrm(cr(sub(P(z + e, q), P(z - e, q)), sub(P(z, q + e), P(z, q - e)))); if (N[0] < 0) N = N.map(v => -v);
    const B = nrm(cr(N, T));
    for (let j = 0; j <= nv; j++) { const v = j / nv, o = out + crown * Math.sin(PI * v), d = w * (v - 0.5); pos.push(s * (p[0] + B[0] * d + N[0] * o), p[1] + B[1] * d + N[1] * o, p[2] + B[2] * d + N[2] * o); }
  });
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; if (s > 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// sierband op een oppervlak P(z, u) langs een pad [[z, u], ...]: dwars op het pad van d = a tot d = b (meter langs het oppervlak; bij een pad
// met stijgende z is d > 0 de kant van de kleinere u, bij de kas dus omlaag; a en b mogen ook functies van z zijn), 'out' boven het oppervlak en een bolling 'crown' over de breedte.
// De punten blijven op het oppervlak (geen raakvlak), zodat een band ook over de ronding van de dakrail netjes aanligt.
const bodPGh = (z, q) => { const [x, y] = bodGhHalf(z, clamp(q, 0, 1)); return [x, y, z]; };
function bodTrim(s, zu, a, b, out = 0.003, crown = 0, nv = 1, P = bodPGh) {
  const e = 1e-4, sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  // voorwaartse verschillen: aan de rand u = 0 (gordel) klemt P de parameter, een centraal verschil gaf daar de halve afgeleide (dubbele breedte)
  const der = (z, u) => { const P0 = P(z, u), Pz = sub(P(z + e, u), P0).map(v => v / e), Pu = sub(P(z, u + e), P0).map(v => v / e); return [Pz, Pu]; };
  const pos = [], idx = [], n = zu.length;
  zu.forEach(([z, u], i) => {
    const A0 = zu[Math.max(0, i - 1)], B0 = zu[Math.min(n - 1, i + 1)], tz = B0[0] - A0[0], tu = B0[1] - A0[1];
    const [Pz, Pu] = der(z, u), T = Pz.map((v, k) => v * tz + Pu[k] * tu);
    let dz = dot(Pu, T), du = -dot(Pz, T);
    const L = Math.sqrt(Math.max(1e-12, dot(Pz, Pz) * dz * dz + 2 * dot(Pz, Pu) * dz * du + dot(Pu, Pu) * du * du)); dz /= L; du /= L;
    for (let j = 0; j <= nv; j++) {
      const v = j / nv, da = typeof a === 'function' ? a(z) : a, db = typeof b === 'function' ? b(z) : b, d = da + (db - da) * v, zz = z + dz * d, uu = u + du * d, p = P(zz, uu), [Qz, Qu] = der(zz, uu);
      let N = [Qz[1] * Qu[2] - Qz[2] * Qu[1], Qz[2] * Qu[0] - Qz[0] * Qu[2], Qz[0] * Qu[1] - Qz[1] * Qu[0]]; const l = Math.hypot(...N) || 1; N = N.map(w => w / l); if (N[0] < 0) N = N.map(w => -w);
      const o = out + crown * Math.sin(PI * v); pos.push(s * (p[0] + N[0] * o), p[1] + N[1] * o, p[2] + N[2] * o);
    }
  });
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < nv; j++) { const a1 = i * (nv + 1) + j, b1 = a1 + nv + 1; if (s > 0) idx.push(a1, b1, a1 + 1, b1, b1 + 1, a1 + 1); else idx.push(a1, a1 + 1, b1, b1, a1 + 1, b1 + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// raamomlijsting (Initiale Paris, cerclage chromé): de bovenband ligt op het vrijwel staande buitenvlak van de dakrail (q 0,542 tot 0,570, ca. 15 mm),
// met een rubberlijn van 4 mm tussen chroom en lak; daaronder het zwarte raamkader tot de ruit
const bodQV = 0.557, bodTW = 0.0085, bodTR = 0.004;
// gordellijst onderaan de ruit langs een pad op q = 0: schaduwlijn (3 mm) naar de lak, bolle chroomband (15 mm) en rubberlip (4 mm) naar het
// glas; samen 21 mm langs de ruit, zodat de zichtbare ruitlijn binnen de silhouetmaat blijft (ca. 2 cm boven de gordel)
function bodBeltTrim(s, path) {
  return { chrome: bodTrim(s, path, -0.0175, -0.0025, 0.003, 0.003, 8),
    rubber: merge([bodTrim(s, path, -0.021, -0.017, 0.0022, 0, 1), bodTrim(s, path, -0.003, -0.0002, 0.0022, 0, 1)]) };
}
// dunne donkere naadlijn op de onderbak langs punten (z, y): het portierrubber dat in de sluitnaad zichtbaar is
const bodSeamLine = (s, zy, w = 0.0045) => bodRibbon(s, zy, w, 0.0007, 0, 1, (z, y) => { const [x, yy] = halfPt(z, sAtY(z, y)); return [x, yy, z]; });
const bodLinZ = (a, b, n, q) => { const out = []; for (let i = 0; i <= n; i++) out.push([a + (b - a) * i / n, typeof q === 'function' ? q(a + (b - a) * i / n) : q]); return out; };
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
  const topBand = bodGhSide(s, gz0 - 0.01, gz1 + 0.01, 30, () => [bodQG, bodQV - 0.0125], 3, [], 0.003);
  // de lijnen van voor- en achterportier lopen over hun eigen B-stijlafdekking tot de naad ertussen (korte onderbreking van 8 mm)
  const zGt = bodBg(1.35), zT0 = isFront ? zGt + 0.004 : gz0 - 0.01, zT1 = isFront ? gz1 + 0.01 : zGt - 0.004;
  // chroomomlijsting als vlakke, licht bolle band van ca. 17 mm (leesbaar op galerijformaat); voorportier ook langs de voorrand bij de spiegeldriehoek
  const zB0 = isFront ? -0.144 : gz0 - 0.01, zB1 = isFront ? gz1 + 0.13 : -0.152;
  const beltPts = [];
  for (let i = 0; i <= 16; i++) { const z = zB0 + (zB1 - zB0) * i / 16, g = bodGh(z); beltPts.push([s * (g.xb + 0.007), g.yb + 0.003, z]); }
  // bovenband bol (hooglicht boven, donkere onderhelft) op het staande vlak; voorportier ook langs de voorrand bij de spiegeldriehoek
  const topPath = bodLinZ(zT0, zT1, 36, bodQV), sailPath = [0.04, 0.12, 0.22, 0.32, 0.42, 0.5, 0.53, bodQV].map(q => [gz1 + 0.006, q]);
  const ringGeo = merge([bodTrim(s, topPath, -bodTW, bodTW, 0.0035, 0.003, 8)].concat(isFront ? [bodTrim(s, sailPath, -bodTW, bodTW, 0.0035, 0.003, 6)] : []));
  const ringRub = merge([bodTrim(s, topPath, -bodTW - bodTR, -bodTW + 0.0005, 0.0026, 0, 1)].concat(isFront ? [bodTrim(s, sailPath, bodTW - 0.0005, bodTW + bodTR, 0.0026, 0, 1)] : []));
  // gordellijst onderaan de ruit: bolle chroomband van 15 mm met een donkere rubberlijn naar het glas en een schaduwlijn naar de lak
  const beltPath = bodLinZ(zB0, zB1, 30, 0);
  const { chrome: beltGeo, rubber: beltRub } = bodBeltTrim(s, beltPath);
  const handleZ = isFront ? 0.03 : -1.015, handleY = isFront ? 0.80 : 0.84;
  const hp = bodAt(handleZ, handleY, 0.012), hn = bodNormalAt(handleZ, handleY);
  // een sierlijst per portier; de lijsten van voor- en achterportier liggen in een lijn en raken elkaar bijna bij de sluitnaad.
  // Achterportier: begint ca. 5 cm voor de achterrand van het portier (die daar om de wielboog zwaait), ruim buiten de wielboog
  const mA = isFront ? -0.137 : -0.955, mB = isFront ? 0.82 : -0.158, lijst = bodLijst(s, mA, mB, false, isFront);
  const mBr = bodDense(mA, mA + 0.04, 6).concat(bodDense(mB - (isFront ? 0.11 : 0.04), mB, isFront ? 12 : 6));
  const lijstP = (t0, t1, nv, extra) => patch((z, t) => lijst(z, t, extra), mA, mB, 34, () => [t0, t1], nv, mBr);
  const hingeZ = isFront ? z1 - 0.03 : z1 - 0.025;
  // sluitnaden: voorportier voorrand (schuin) en de naad tussen de portieren; achterportier achterrand om de wielboog
  const yBelt = z => YT(z) - 0.004, ls = (a, b, n) => bodDense(a, b, n).concat([b]);
  const seams = isFront ? [bodSeamLine(s, [0.312].concat(ls(0.312, 0.9, 14)).map(y => [bodFDF(y + 0.001), y]).filter(([z, y]) => y < yBelt(z))), bodSeamLine(s, [0.31].concat(ls(0.31, yBelt(-0.148), 12)).map(y => [-0.148, y]), 0.0105)]
    : [bodSeamLine(s, [-0.666].concat(ls(-0.666, -1.2665, 30)).map(z => [z, bodRDloZ(z) - 0.001]).concat(ls(0.878, yBelt(-1.2665), 4).map(y => [-1.2665, y])))];
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
    A('Raamlijsten en sierlijsten', { d: 'Chromen raamomlijsting, gordelsierlijst met rubber en de zijsierlijst met aluminium inzet.', ex: [s * 0.52, 0.04, 0.1] }, [
    P('Chroomlijst raamomlijsting', ringGeo, MAT.bodChrome, { d: isFront ? 'Zilverchromen band langs de bovenrand van de ruit en de voorrand bij de spiegeldriehoek (Initiale Paris: cerclage chromé).' : 'Zilverchromen band langs de bovenrand van de ruit (Initiale Paris: cerclage chromé).', ex: [s * 0.05, 0.12, 0] }),
    P('Raamrubber boven', topBand, MAT.bodPillar, { d: 'Zwart rubber en kader tussen de ruit en de dakrail, waarop de chroomlijst ligt.', ex: [s * 0.03, 0.08, 0] }),
    P('Rubberlijn raamomlijsting', ringRub, MAT.bodPillar, { d: 'Smalle zwarte rubberlijn tussen de chromen raamomlijsting en de lak van de dakrail.', ex: [s * 0.04, 0.1, 0] }),
    !isFront && P('Chroomlijst raamstijl', merge([bodQdBand(s, 0.03, bodQV - bodTW + 0.001, -0.0215, -0.0135, 0.0025, 0.0015, 14, 4), bodQdBand(s, 0.03, bodQV - bodTW + 0.001, 0.0135, 0.0215, 0.0025, 0.0015, 14, 4)]), MAT.bodChrome, { d: 'Twee smalle chroomlijsten langs de randen van het schuine stijltje, zodat de chromen omlijsting rond de portierruit en rond de kwartsruit doorloopt.', ex: [s * 0.05, 0.1, -0.04] }),
    P('Gordelsierlijst', beltGeo, MAT.bodChrome, { d: 'Verchroomde sierlijst op de gordellijn, met het buitenste raamrubber.', ex: [s * 0.08, 0.05, 0] }),
    P('Gordelrubber buiten', beltRub, MAT.bodPillar, { d: 'Buitenste raamschachtrubber: een smalle zwarte lip tussen de gordelsierlijst en de ruit en een schaduwlijn onder de lijst.', ex: [s * 0.07, 0.03, 0] }),
    P('Gordelrubber binnen', tube(beltPts.map(p => [p[0] - s * 0.03, p[1] - 0.004, p[2]]), 0.006, 24, 5), MAT.rubber, { d: 'Binnenste raamschachtrubber dat de ruit afstrijkt.', ex: [-s * 0.06, 0.04, 0] }),
    A('Sierlijst', { d: `Verhoogde beschermlijst van ca. 38 mm op het ${pos}portier in carrosseriekleur, met afgeronde uiteinden en een dunne aluminium inzet langs de bovenrand.`, ex: [s * 0.1, 0, 0] }, [
      P('Lijstprofiel', lijstP(0, 1, 10, 0), MAT.paint, { d: 'Kunststof lijstprofiel in carrosseriekleur, op het buitenpaneel gelijmd.', ex: [s * 0.012, 0, 0] }),
      P('Aluminium inzet', lijstP(0.74, 0.9, 1, 0.0006), MAT.bodBright, { d: 'Dunne heldere aluminiumlook strip langs de bovenrand van de lijst.', ex: [s * 0.03, 0.02, 0] }),
      P('Rubberrand', lijstP(-0.16, 0.02, 1, 0.0016), MAT.rubber, { d: 'Dunne zwarte rand onder de lijst, zichtbaar als schaduwlijn.', ex: [-s * 0.01, -0.02, 0] }),
    ]),
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
    P('Portierrubber', merge([...seams, tube([0.33, 0.47, 0.61, 0.75, 0.84, 0.88].map(y => [0, y]).concat([0.15, 0.3, 0.5, 0.7, 0.85].map(u => [u, 0.88]), [0.88, 0.84, 0.75, 0.61, 0.47, 0.33].map(y => [1, y])).map(([u, y]) => { const z = lerp(z1 - 0.02, z0 + 0.012, u); return P3(z, y, 0.05); }), 0.008, 64, 6)]), MAT.rubber, { d: 'Rubber afdichting rondom de portieropening; in de sluitnaden van buiten zichtbaar als dunne donkere lijn.', ex: [-s * 0.26, -0.1, -0.46] }),
    P('Deurvanger', G.rbox(0.012, 0.03, 0.2, 0.004), MAT.darkSteel, { d: 'Vanger die het portier in twee standen openhoudt.', p: [s * (surfX(z1 - 0.1, 0.62) - 0.055), 0.62, z1 - 0.1], ex: [-s * 0.05, 0, 0.06] }),
    A('Scharnieren', { d: 'Twee portierscharnieren aan de voorrand met elk twee bouten.', ex: [-s * 0.04, 0, 0.1] }, [hinge('boven', 0.79), hinge('onder', 0.45)]),
  ];
  // B-stijlafdekking: zwart raamkader van dit portier aan de B-stijlzijde, de naad ertussen in lijn met de sluitnaad onder de gordel
  kids.push(P('Afdekking B-stijl', isFront ? bodBand(s, -0.073, bodBFK, -0.148 + bodBGW, bodBGK, 0.002) : bodBand(s, -0.148 - bodBGW, bodBGK, -0.223, bodBRK, 0.002), MAT.bodPillarGloss,
    { d: isFront ? 'Hoogglans zwarte afdekking op het raamkader van het voorportier, de voorste helft van de zwarte B-stijl, licht naar achteren hellend.' : 'Hoogglans zwarte afdekking op het raamkader van het achterportier, de achterste helft van de zwarte B-stijl.', ex: [s * 0.06, 0.04, 0] }));
  if (isFront) kids.push(P('Naadrubber B-stijl', bodBand(s, -0.148 + bodBGW + 0.001, bodBGK, -0.148 - bodBGW - 0.001, bodBGK, 0.0008), MAT.bodPillar, { d: 'Mat zwart rubber in de naad tussen de twee B-stijlafdekkingen, in het verlengde van de sluitnaad onder de gordel.', ex: [s * 0.03, 0.02, 0] }));
  if (isFront) {
    kids.push(P('Spiegeldriehoek', bodGhSide(s, bodSail, 0.93, 6, z => [0.004, Math.min(bodQS - 0.02, bodQy(z, 0.93 + (0.93 - z) * 0.55))], 4, [], 0.001), MAT.bodPillar, { d: 'Zwarte driehoekige afdekplaat tussen zijruit en A-stijl waarop de spiegel staat.', ex: [s * 0.05, 0.05, 0.03] }));
    kids.push(buildMirror(s));
  } else {
    // schuin stijltje tussen zakbare ruit en kwartsruit (zijfoto fase 2: zwarte balk van ca. 3 cm met chroom langs beide ruiten): hoogglans zwart,
    // 35 mm breed in z, waarvan ca. 27 mm tussen de chroomranden zichtbaar blijft; loopt van onder de gordellijst tot onder de bovenste chroomband
    kids.push(P('Raamstijl achter', bodQdBand(s, 0.004, bodQV - bodTW + 0.001, -0.0175, 0.0175, 0.0015, 0, 14, 2), MAT.bodPillarGloss, { d: 'Schuin hoogglans zwart stijltje in het raamkader tussen de zakbare ruit en de vaste kwartsruit.', ex: [s * 0.05, 0.08, 0] }));
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
  // projectoren: de as staat haaks op het afdekglas (lamp loopt sterk terug langs het scherm), de ring ligt in een ronde opening van het
  // verchroomde reflectorvlak (0,016 binnen de huid) en de lens blijft ruim 1 cm binnen het afdekglas
  const PJ = [['buiten', 1.975, 0.4, 0.034], ['binnen', 2.11, 0.42, 0.028]];
  const pjAt = (z, f, inw) => at(z, f, inw), pjN = (z, f) => { const sv = lo(z) + (hi(z) - lo(z)) * f, nn = bodN(z, sv); return V3(s * nn[0], nn[1], nn[2]); };
  const proj = (nm, z, f, r) => {
    const c = pjAt(z, f, 0.016), q = quatFromTo(V3(0, 0, 1), pjN(z, f));
    return A(`Projector ${nm}`, { p: c, q, ex: [nx * 0.05, 0.03, nz * 0.05 + 0.03], d: nm === 'buiten' ? 'Bi-xenon projectormodule voor dim- en grootlicht; een klep wisselt tussen beide (schematisch weergegeven).' : 'Tweede projectormodule naast de bi-xenon unit (opbouw zoals gebruikelijk bij deze lamp, schematisch weergegeven).' }, [
      P('Projectorlens', G.lathe('z', [[0, 0.006], [r * 0.75, 0.004], [r, 0], [r, -0.006], [0, -0.006]], 20, 'bodPLn' + r), MAT.lensClear, { d: 'Asferische lens die de lichtbundel scherp afbeeldt.', p: [0, 0, 0], ex: [0, 0, 0.06] }),
      P('Lensring', G.torus('z', r + 0.003, 0.0032, 24, 6), MAT.chrome, { d: 'Verchroomde ring om de projectorlens.', p: [0, 0, -0.001], ex: [0, 0, 0.03] }),
      P('Reflectorschaal', G.lathe('z', [[0, -0.06], [r * 0.7, -0.05], [r * 1.05, -0.016], [r * 1.08, -0.004]], 18, 'bodPRn' + r), MAT.reflector, { d: 'Ellipsvormige reflector achter de lens.', p: [0, 0, 0], ex: [0, 0, -0.06] }),
      P('Lichtklep', G.box(r * 1.6, 0.003, 0.012), MAT.darkSteel, { d: 'Klep die de bovenkant van de bundel afschermt voor dimlicht.', inner: true, p: [0, -0.004, -0.03], ex: [0, -0.04, 0] }),
    ]);
  };
  // ronde openingen in het reflectorvlak voor de projectoren
  const holes = g => { const pp = g.attributes.position, ix = g.index.array, keep = [], cs = PJ.map(([, z, f, r]) => [V3(...pjAt(z, f, 0.016)), r + 0.001]);
    const inH = k => cs.some(([c, r]) => c.distanceTo(V3(pp.getX(k), pp.getY(k), pp.getZ(k))) < r);
    for (let i = 0; i < ix.length; i += 3) if (!(inH(ix[i]) && inH(ix[i + 1]) && inH(ix[i + 2]))) keep.push(ix[i], ix[i + 1], ix[i + 2]);
    g.setIndex(keep); return g; };
  // zijwanden van het lamphuis van het afdekglas tot de achterwand: geen kijkgat langs de randen naar de motorruimte
  const wall = (sf, nz = 30) => patch((z, t) => bodLow(z, sideR(s, sf(z), sf(z))[0], t), z0, z1, nz, () => [-0.002, 0.07], 3, bodDense(2.17, z1, 5));
  const endWall = zz => patch((u, t) => bodLow(zz, lerp(...sideR(s, lo(zz), hi(zz)), u), t), 0, 1, 8, () => [-0.002, 0.07], 3);
  const back = at(2.0, 0.5, 0.075);
  return A(`Koplamp ${n}`, { d: 'Bi-xenon directionele koplamp met dagrijlicht en zwart masker; loopt ver terug langs het voorscherm (fase 2, standaard op Initiale Paris).', ex: [s * 0.32, 0.12, 0.62] }, [
    P('Afdekglas', reg(lo, hi, -0.003), MAT.lensClear, { d: 'Gebogen polycarbonaat afdekglas dat het scherm- en kapvlak volgt.', ex: out(0.26) }),
    P('Zwart masker', merge([reg(z => lo(z) + (hi(z) - lo(z)) * 0.7, z => hi(z) - 0.002, 0.012), patch((z, p) => bodLow(z, p, 0.013), z0, 1.9, 8, z => sideR(s, lo(z) + 0.002, hi(z) - 0.002), 4)]), MAT.blackGloss, { d: 'Hoogglans zwart masker als ooglid boven de projectoren en achterin de lamp, kenmerkend voor de fase 2-koplamp.', ex: out(0.15) }),
    P('Reflectorvlak', holes(patch((z, p) => bodLow(z, p, 0.016), 1.9, z1, 48, z => sideR(s, lo(z) + 0.002, lo(z) + (hi(z) - lo(z)) * 0.7), 14)), MAT.chrome, { d: 'Verchroomd vlak rond de projectoren onder het masker.', ex: out(0.1) }),
    P('Lamphuis', merge([reg(lo, hi, 0.07), wall(lo), wall(hi), endWall(z0), endWall(z1), reg(z => lo(z) - 0.007, z => lo(z) + 0.002, 0.005), reg(z => hi(z) - 0.002, z => hi(z) + 0.006, 0.005)]), MAT.plastic, { d: 'Kunststof lamphuis waarin alle modules zijn gemonteerd.', ex: [0, 0, 0] }),
    P('Chroomrand', patch((z, p) => bodLow(z, p, 0.008), z0 + 0.03, z1, 24, z => sideR(s, hi(z) - 0.012, hi(z) - 0.006), 1), MAT.chrome, { d: 'Verchroomde rand langs de bovenzijde binnen het glas.', ex: out(0.2) }),
    ...PJ.map(a => proj(a[0], a[1], a[2], a[3])),
    // knipperlicht: smalle strook op het zwarte masker achterin de lamp, 1 mm voor het masker en ruim binnen het afdekglas
    P('Knipperlicht', patch((z, p) => bodLow(z, p, 0.0118), 1.85, 1.92, 6, z => sideR(s, lo(z) + (hi(z) - lo(z)) * 0.18, lo(z) + (hi(z) - lo(z)) * 0.5), 2), MAT.amber, { d: 'Richtingaanwijzer achterin de koplampunit.', ex: out(0.12) }),
    P('Dagrijlicht', patch((z, p) => bodLow(z, p, 0.009), 1.95, 2.2, 14, z => sideR(s, lo(z) + 0.004, lo(z) + 0.012), 1), MAT.ceramic, { d: 'Lichtgeleider van het dagrijlicht langs de onderrand van de lamp.', ex: [nx * 0.12, -0.05, nz * 0.12] }),
    P('Xenonbrander', G.cyl('z', 0.007, 0.007, 0.05, 10), MAT.ceramic, { d: 'D1S-gasontladingslamp (xenon) van de bi-xenon projector.', inner: true, p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1], c[2] - 0.1]; })(), ex: [0, 0.05, -0.14] }),
    P('Ontsteker', G.rbox(0.045, 0.03, 0.045, 0.006), MAT.ecu, { d: 'Ontsteekmodule die de hoogspanningspuls voor de xenonlamp levert.', inner: true, p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1], c[2] - 0.15]; })(), ex: [0, 0.06, -0.2] }),
    P('Voorschakelapparaat', G.rbox(0.09, 0.025, 0.09, 0.006), MAT.ecu, { d: 'Ballast die de xenonlamp van stroom voorziet.', p: [back[0], back[1] - 0.06, back[2]], ex: [0, -0.16, -0.04] }),
    P('Bochtverlichtingsmotor', merge([G.cyl('y', 0.022, 0.022, 0.035, 16), xf(G.rbox(0.04, 0.02, 0.04, 0.005), [0, -0.025, 0])]), MAT.darkSteel, { d: 'Stappenmotor die de bi-xenon projector meedraait in bochten (directionele koplamp).', p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1] - 0.05, c[2] - 0.04]; })(), ex: [0, -0.12, -0.06] }),
    P('Afdekkap', G.lathe('z', [[0, 0.02], [0.04, 0.02], [0.045, 0], [0.04, -0.005]], 18, 'bodHLcap'), MAT.plastic, { d: 'Rubberen kap op de achterzijde voor het verwisselen van de lampen.', inner: true, p: [back[0], back[1], back[2] - 0.02], r: [PI, 0, 0], ex: [0, 0.02, -0.18] }),
  ]);
}

// staande wand op z = SP tussen het dek van de onderbak en de onderrand van de kas (C-stijl en achterruit); dicht de donkere
// spleet tussen de onderhoek van de achterruit, de C-stijl en het schouderdek (q0..q1 = bereik van de halve kas)
function bodSPweb(s, q0, q1, dz, nq = 14) {
  const c = bodSec(SP);
  return patch((q, t) => {
    const [x, y] = bodGhHalf(SP, q), yd = x < c.xe ? halfPt(SP, bodSAtX(SP, x))[1] : y, y0 = Math.min(yd, y) - 0.002;
    return [s * x, lerp(y0, y, t), SP + dz];
  }, q0, q1, nq, () => [0, 1], 2);
}
/* ---------- achterlichten (over de klepnaad verdeeld) ---------- */
const bodTGseam = y => 0.462 + 0.012 * sstep((y - 0.80) / 0.15);         // zijnaad van de achterklep in het staartvlak
// zijrand van de achterruit als q van de halve kas: de ruit loopt om de dakrailronding heen (q 0,63 tot 0,65, daar staat het vlak ca. 45 graden),
// zodat ze in zijaanzicht als donkere band langs de dakval van C-stijl tot lip leest; de bovenhoek rondt bij de knik met het dak af naar de dakrand
const bodQScr = z => lerp(0.63, 0.65, clamp((z - SP) / (RW0 - SP), 0, 1)) + (bodQR - 0.65) * sstep((z - RW0 + 0.07) / 0.07);
// x van de onderhoek van de achterruit op SP (daar sluiten C-stijlvoet, klepnaad op het dek en de spoilerlip op aan)
const bodXScr = bodGhHalf(SP, bodQScr(SP))[0];
const bodTGdx = z => lerp(0.47, bodXScr - 0.004, clamp((z - bodZT) / (SP - bodZT), 0, 1));   // zijnaad van de klep op het dek achter de lip
// lampband: onderrand, bovenrand en de grenzen van de lensbanden (fractie van de hoogte; rood boven, helder, rood onder)
const bodTLF = [0, 0.21, 0.5, 1];
// staartvlakstuk naar de rechterkant spiegelen; de driehoeken worden omgedraaid zodat de voorzijde buiten blijft
function bodMirX(g, s) {
  if (s > 0) return g;
  g.scale(-1, 1, 1); const ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  return g;
}
const bodTLY = (z, f) => lerp(bodTLlo(Math.max(z, bodZT)), bodTLtop(Math.max(z, bodZT)), f);
function buildTaillight(s) {
  const n = sn(s), xin = 0.34, xs = bodTGseam(0.92);
  const side = (off, f0, f1) => patch((z, p) => bodLow(z, p, off), bodZT + 0.0012, bodTLZ - 0.001, 18, z => sideR(s, bodSY(z, bodTLY(z, f0)), Math.max(bodSY(z, bodTLY(z, f0)) + 1e-4, bodSY(z, bodTLY(z, f1)))), 3, bodDense(-2.06, bodTLZ, 4));
  const face = (x0, x1, f0, f1, off, nx = 8, dy = 0) => { return bodMirX(bodTailGeo(x0, x1, bodTLY(bodZT, f0) + dy, bodTLY(bodZT, f1) - dy, off, 3, nx), s); };
  const [f0, f1, f2, f3] = bodTLF, xo = 1.2;
  return A(`Achterlicht ${n}`, { d: 'Slank horizontaal achterlicht in twee delen, verdeeld over de klepnaad: een deel op het achterscherm dat om de afgeronde hoek de flank in loopt en een deel in de achterklep.', ex: [s * 0.3, 0.1, -0.5] }, [
    A('Buitendeel', { d: 'Vast deel op het achterscherm met achterlicht, remlicht en knipperlicht (LED-uitstraling); loopt onder de schouder in een punt naar voren.', ex: [s * 0.1, 0, -0.06] }, [
      P('Lens buitendeel', merge([side(-0.003, f2, f3), side(-0.003, f0, f1), face(xs + 0.003, xo, f2, f3, 0.003), face(xs + 0.003, xo, f0, f1, 0.003)]), MAT.lensRed, { d: 'Rode afdeklens met een brede bovenband en een smalle onderstrook, van het staartvlak om de hoek de flank in.', ex: [s * 0.05, 0, -0.06] }),
      P('Heldere band buitendeel', merge([side(-0.0035, f1, f2), face(xs + 0.003, xo, f1, f2, 0.0035)]), MAT.lensClear, { d: 'Heldere horizontale band in de lens waarachter de knipperlichtunit zit; geeft de witte LED-streep van het fase 2-achterlicht.', ex: [s * 0.07, 0, -0.08] }),
      P('Lichthuis buitendeel', merge([side(0.05, f0, f3), face(xs + 0.01, xo, f0, f3, -0.05, 8, 0.008)]), MAT.plastic, { d: 'Kunststof behuizing met bevestigingsbouten in het achterscherm.', ex: [-s * 0.04, 0, 0.06] }),
      P('LED-print buitendeel', merge([side(0.035, 0.15, 0.85), face(xs + 0.02, xo, f0, f3, -0.035, 8, 0.02)]), MAT.ecu, { d: 'Printplaat met de lampen van achter-, rem- en knipperlicht.', inner: true, ex: [0, 0, 0.1] }),
      P('Reflector buitendeel', merge([side(0.02, f0, f3), face(xs + 0.003, xo, f0, f3, -0.02, 8, 0.01)]), MAT.reflector, { d: 'Verchroomde reflector achter de lens; zichtbaar door het rode glas en de heldere band.', ex: [0, 0, 0.05] }),
    ]),
    A('Binnendeel', { d: 'Deel in de achterklep met achterlicht en achteruitrijlicht; zet de lijnen van het buitendeel over de naad voort.', ex: [s * 0.03, 0.04, -0.08] }, [
      P('Lens binnendeel', merge([face(xin, xs, f2, f3, 0.003), face(xin, xs, f0, f1, 0.003)]), MAT.lensRed, { d: 'Rode lens van het binnendeel (achterlicht): bovenband en onderstrook.', ex: [0, 0.03, -0.06] }),
      P('Lens achteruitrijlicht', face(xin, xs, f1, f2, 0.0035), MAT.lensClear, { d: 'Heldere middenband over het achteruitrijlicht, in lijn met de heldere band van het buitendeel.', ex: [0, 0, -0.1] }),
      P('Reflector binnendeel', face(xin + 0.004, xs - 0.008, f0, f3, -0.012, 8, 0.006), MAT.reflector, { d: 'Verchroomde reflector achter de lenzen.', ex: [0, 0, 0.04] }),
      P('Lichthuis binnendeel', face(xin + 0.01, xs - 0.01, f0, f3, -0.028, 8, 0.008), MAT.plastic, { d: 'Behuizing in de achterklep.', ex: [0, 0, 0.06] }),
      P('Lampdrager binnendeel', face(xin + 0.03, xs - 0.03, f0, f3, -0.018, 8, 0.02), MAT.ecu, { d: 'Lampdrager met fittingen en stekker.', inner: true, ex: [0, 0, 0.1] }),
    ]),
  ]);
}

// rand van de achterklepopening, op afstand 'inw' binnen de huid (sponning en afdichting)
function bodTGPath(inw) {
  const side = [], ydT = bodSec(bodZT).yd;
  for (const y of [0.66, 0.8, 0.95, ydT - 0.05]) { const xs = Math.min(bodTGseam(y), ringX(bodZT, y)) - 0.03; side.push([xs, y, tailZ(xs, y) + inw]); }
  for (const z of [bodZT + 0.03, -2.2, SP]) { const p = halfPt(z, bodSAtX(z, bodTGdx(z) - 0.02)); side.push([p[0], p[1] - inw, z]); }
  for (const z of [-1.9, -1.6, -1.35, RW0 + 0.02]) { const q = bodQScr(z), p = bodGhHalf(z, q); side.push([p[0] - inw, p[1] - inw, z]); }
  const mid = [0, 0.655, tailZ(0, 0.655) + inw], top = [0, YR(RW0 + 0.02) - inw, RW0 + 0.02];
  return [mid, ...side, top, ...side.slice().reverse().map(p => [-p[0], p[1], p[2]]), mid];
}
// opening in een huiddeel: houdt alleen het deel van elke driehoek dat buiten de rechthoek |x| < X0, Y0 < y < Y1 ligt (in vooraanzicht,
// voor z > zMin); de driehoeken worden exact op de rand geknipt (Sutherland-Hodgman per convex buitengebied), zodat de opening strak is
function bodClipOut(g, X0, Y0, Y1, zMin) {
  const p = g.attributes.position, ix = g.index ? g.index.array : [...Array(p.count).keys()], out = [];
  const V = k => [p.getX(k), p.getY(k), p.getZ(k)];
  const regs = [[[0, 1, -Y0]], [[0, -1, Y1]], [[0, -1, Y0], [0, 1, -Y1], [-1, 0, X0]], [[0, -1, Y0], [0, 1, -Y1], [1, 0, X0]]];
  const clip = (poly, [a, b, c]) => { const r = [];
    for (let i = 0; i < poly.length; i++) { const P0 = poly[i], P1 = poly[(i + 1) % poly.length], f0 = a * P0[0] + b * P0[1] + c, f1 = a * P1[0] + b * P1[1] + c;
      if (f0 <= 0) r.push(P0);
      if ((f0 < 0 && f1 > 0) || (f0 > 0 && f1 < 0)) { const t = f0 / (f0 - f1); r.push(P0.map((v, k) => v + (P1[k] - v) * t)); } }
    return r; };
  for (let i = 0; i < ix.length; i += 3) {
    const tri = [V(ix[i]), V(ix[i + 1]), V(ix[i + 2])];
    const away = tri.some(v => v[2] < zMin) || tri.every(v => v[1] <= Y0) || tri.every(v => v[1] >= Y1) || tri.every(v => v[0] >= X0) || tri.every(v => v[0] <= -X0);
    if (away) { tri.forEach(v => out.push(...v)); continue; }
    for (const hs of regs) { let poly = tri; for (const h of hs) { poly = clip(poly, h); if (poly.length < 3) break; }
      for (let k = 1; k + 1 < poly.length; k++) out.push(...poly[0], ...poly[k], ...poly[k + 1]); }
  }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); r.computeVertexNormals(); return r;
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
    ...both(s => P(`Rubberlijn dorpelsierlijst ${sn(s)}`, bodMould(s, 0.194, 0.205, -0.94, 0.84, 0.0035, 28, 3), MAT.rubber, { d: 'Dunne zwarte rubberlijn onder de dorpelsierlijst.', ex: [s * 0.16, -0.03, 0] })),
  ]);
  // voorkop
  const frontGrp = A('Voorkop', { d: 'Dragende voorbouw: langsliggers met kreukelzones, veerpoottorens, schutbord, torpedobak, frontmodule en bumperbalk.', ex: [0, 0.05, 0.42] }, [
    ...both(s => P(`Langsligger voor ${sn(s)}`, G.box(0.075, 0.12, 1.1), MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt.', p: [s * 0.545, 0.34, 1.58], ex: [s * 0.08, 0, 0] })),
    ...both(s => P(`Crashbox ${sn(s)}`, G.rbox(0.09, 0.1, 0.13, 0.01), MAT.steel, { d: 'Kreukelelement tussen langsligger en bumperbalk; wordt na een lichte aanrijding vervangen.', p: [s * 0.545, 0.37, 2.11], ex: [s * 0.04, 0, 0.08] })),
    ...both(s => P(`Veerpoottoren ${sn(s)}`, merge([G.cyl('y', 0.095, 0.13, 0.26, 24, true), xf(G.cyl('y', 0.095, 0.095, 0.006, 24), [0, 0.13, 0])]), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.6, 0.71, 1.33], ex: [s * 0.1, 0.06, 0] })),
    ...both(s => P(`Wielkast voor ${sn(s)}`, G.half('x', ARCH + 0.03, 0.2, PI, 24), MAT.paintIn, { d: 'Binnenscherm van de voorwielkast, gelast aan langsligger en veerpoottoren.', p: [s * 0.6, AY, AXF], r: [0, 0, 0], ex: [s * 0.1, 0.04, 0] })),
    P('Schutbord', G.rbox(1.5, 0.62, 0.012, 0.004), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur.', p: [0, 0.6, 1.02], ex: [0, 0, -0.08] }),
    P('Torpedobak', merge([G.box(1.42, 0.012, 0.12), xf(G.box(1.42, 0.1, 0.012), [0, -0.05, 0.06])]), MAT.paintIn, { d: 'Bak onder de torpedoplaat waarin wissermotor en luchtinlaat van het interieur zitten.', p: [0, 0.905, 1.08], ex: [0, 0.06, 0] }),
    // ligt 2,2 cm onder de achterrand van de motorkap (die loopt door tot de voorruitbasis), zodat in zijaanzicht geen zwarte trede tussen kap en A-stijl staat
    P('Torpedoplaat', merge([bodDeck(WS0 + 0.004, 1.128, 6, () => S4 + 0.004, 26, [], 0.022), ...[-0.4, -0.2, 0, 0.2, 0.4].map(x => { const g = new THREE.BoxGeometry(0.16, 0.004, 0.03); g.translate(x, bodSec(1.095).yd - 0.02 - 0.06 * x * x, 1.095); return g; })]), MAT.plastic, { d: 'Kunststof afdekplaat met wisserrooster en luchtinlaat voor het interieur onder de achterrand van de motorkap, voor de voorruit.', ex: [0, 0.1, 0.02] }),
    P('Frontmodule', merge([xf(G.box(1.08, 0.06, 0.06), [0, 0.72, 0]), xf(G.box(1.0, 0.06, 0.06), [0, 0.26, 0]), xf(G.box(0.06, 0.46, 0.06), [0.52, 0.49, 0]), xf(G.box(0.06, 0.46, 0.06), [-0.52, 0.49, 0]), xf(G.box(0.05, 0.4, 0.05), [0, 0.49, 0])]), MAT.plastic, { d: 'Kunststof frontmodule (slotplaat) die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 2.06], ex: [0, 0.04, 0.12] }),
    P('Motorkapslot', merge([G.rbox(0.07, 0.06, 0.04, 0.008), xf(G.rbox(0.02, 0.05, 0.015, 0.004), [0.045, 0.01, 0.015])]), MAT.darkSteel, { d: 'Slot op de frontmodule waarin de slotbeugel van de motorkap grijpt, met ontgrendelkabel naar het interieur.', p: [0, 0.64, 2.2], ex: [0, 0.06, 0.06] }),
    P('Bumperbalk voor', tube([-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map(x => [x, 0.42, 2.2 - 0.25 * x * x]), 0.045, 24, 8), MAT.steel, { d: 'Gebogen stalen botsbalk achter de voorbumper.', ex: [0, 0, 0.1] }),
  ]);
  // zijwanden en dak
  const qScr = bodQScr;
  const cPillarLo = z => z < bodQZ ? 0.004 : bodQy(z, bodQtop(z) + 0.012);
  // omlijsting van de kwartsruit langs de rand van de ruit (pad van de punt op de gordel naar voren): zwart kader, chroomband en rubberlijn;
  // het kader groeit naar voren toe tot de breedte van het raamkader van het achterportier, zodat de chroomband daar naadloos aansluit
  const qEdge = Array.from({ length: 34 }, (_, i) => { const z = bodQZ + 0.0015 + (-0.958 - bodQZ - 0.0015) * (i / 33) ** 1.8; return [z, bodQy(z, bodQtop(z))]; });
  const qFr = z => { const a = bodPGh(z, bodQG), b = bodPGh(z, bodQV - 0.0144); return lerp(0.008, Math.hypot(a[0] - b[0], a[1] - b[1]), sstep((z + 1.12) / 0.13)); };
  // d = -(qFr + k) loopt van de ruit af (het pad heeft stijgende z, de ruit ligt aan de kant d > 0)
  const qBelt = s => bodBeltTrim(s, bodLinZ(bodQZ - 0.012, -0.96, 14, 0));
  const qTrim = (s, k0, k1, out, crown, nv) => bodTrim(s, qEdge, z => -(qFr(z) + k1), z => -(qFr(z) + k0), out, crown, nv);
  const aPillarLo = z => z < bodSail - 0.004 ? bodQG + 0.03 : z < 0.93 ? Math.min(bodQS - 0.02, bodQy(z, 0.93 + (0.93 - z) * 0.55)) : 0.004;
  const roofW = z => [bodQR / 2, 1 - bodQR / 2];
  const roof = patch((z, w) => ghPt(z, w), RW0 - 0.008, WS1, 40, roofW, 22);   // 4 mm overlap met de achterruit (geen spleet op de naad)
  const quarter = s => A(`Kwartsruit ${sn(s)}`, { d: 'Vaste driehoekige ruit achter het achterportier, in de C-stijl gelijmd.', ex: [s * 0.22, 0.06, -0.05] }, [
    P('Ruit', bodGhSide(s, bodQZ, bodQd(0.97) - 0.016, 16, z => [0.006, Math.min(bodQy(z, bodQtop(z)), bodQy(z, 0.97 + (-0.93 - 0.016 - z) * 0.33 / 0.06))], 6, bodDense(bodQZ, -1.15, 6)), MAT.glass, { d: 'Getint veiligheidsglas.', ex: [s * 0.04, 0, 0] }),
    P('Raamkader kwartsruit', bodTrim(s, qEdge, z => -(qFr(z) + 0.0005), 0.002, 0.003, 0, 3), MAT.bodPillar, { d: 'Zwart kader langs de rand van de kwartsruit, onder de chroomband.', ex: [s * 0.05, 0.03, 0] }),
    P('Omlijsting', qTrim(s, 0, 2 * bodTW, 0.0035, 0.003, 6), MAT.bodChrome, { d: 'Chromen band langs de bovenrand en de schuine achterrand van de kwartsruit tot de punt op de gordel, in het verlengde van de omlijsting van het achterportier.', ex: [s * 0.06, 0.02, 0] }),
    P('Rubberlijn kwartsruit', merge([qTrim(s, 2 * bodTW - 0.0005, 2 * bodTW + bodTR, 0.0026, 0, 1), qBelt(s).rubber]), MAT.bodPillar, { d: 'Zwarte rubberlijnen langs de omlijsting en de gordellijst van de kwartsruit.', ex: [s * 0.05, 0.05, 0] }),
    P('Gordellijn kwartsruit', qBelt(s).chrome, MAT.bodChrome, { d: 'Chromen sierlijst op de gordellijn onder de kwartsruit, in het verlengde van die van het achterportier.', ex: [s * 0.06, -0.02, 0] }),
  ]);
  const sideRoof = A('Zijwanden en dak', { d: 'Stijlen, dakrails, dak met dakbogen, de vaste kwartsruiten en de dakantenne.', ex: [0, 0.32, 0] }, [
    P('Dakpaneel', roof, MAT.paint, { d: 'Dakplaat van staal, gelast op de dakrails (geen panoramadak: dat was een optie).', ex: [0, 0.16, 0] }),
    A('Dakbogen', { d: 'Drie dwarsliggers onder het dakpaneel.', ex: [0, 0.1, 0] }, [[0.18, 'voor'], [-0.45, 'midden'], [-1.05, 'achter']].map(([z, nm]) => P(`Dakboog ${nm}`, (() => { const pts = []; for (let i = 0; i <= 12; i++) { const w = bodQR / 2 + (1 - bodQR) * i / 12; const p = ghPt(z, w); pts.push([p[0] * 0.97, p[1] - 0.025, z]); } return tube(pts, 0.012, 24, 6); })(), MAT.paintIn, { d: 'Dwarsligger onder het dakpaneel.', ex: [0, -0.04, z * 0.05] }))),
    ...both(s => P(`Dakrail ${sn(s)}`, bodGhSide(s, -0.95, WS1, 30, () => [bodQG + 0.03, bodQR], 10), MAT.paint, { d: 'Zijdelingse dakligger boven de portieren.', ex: [s * 0.08, 0.04, 0] })),
    ...both(s => P(`A-stijl ${sn(s)}`, bodGhSide(s, WS1, WS0, 24, z => [aPillarLo(z), bodQR], 5, bodDense(0.78, 0.95, 6)), MAT.paint, { d: 'Voorste dakstijl langs de voorruit.', ex: [s * 0.08, 0.04, 0.04] })),
    ...both(s => P(`B-stijl ${sn(s)}`, G.box(0.05, 0.8, 0.1), MAT.paintIn, { d: 'Verstevigd profiel in de middenstijl met de slotbeugel van het voorportier.', p: [s * 0.735, 0.66, -0.17], r: [-0.21, 0, 0], ex: [s * 0.05, 0, 0] })),
    ...both(s => P(`C-stijl ${sn(s)}`, bodGhSide(s, SP, -0.95, 34, z => [cPillarLo(z), z < RW0 ? qScr(z) : bodQR], 16, bodDense(-1.27, -1.15, 6)), MAT.paint, { d: 'Achterste dakstijl met de karakteristieke kromming boven de kwartsruit.', ex: [s * 0.1, 0.04, -0.04] })),
    ...both(quarter),
    A('Dakantenne', { d: 'Korte antennemast achter op het dak.', ex: [0, 0.14, -0.04] }, [
      P('Antennevoet', G.rbox(0.04, 0.025, 0.08, 0.012), MAT.blackGloss, { d: 'Antennevoet met versterker.', p: [0.0, YR(-1.0) + 0.008, -1.0], ex: [0, 0.03, 0] }),
      P('Antennemast', rodBetween([0, YR(-1.0) + 0.015, -1.01], [0, YR(-1.0) + 0.05, -1.08], 0.0035, 8), MAT.plastic, { d: 'Korte afschroefbare antennemast (ca. 8 cm).', ex: [0, 0.08, 0] }),
    ]),
  ]);
  // achterbouw
  const rfLo = z => { if (z < AXR - ARCH) return bodSY(z, bodYLEDGE + 0.003); if (z <= AXR + ARCH) return Math.max(archS(z), bodSY(z, 0.25)); return bodSY(z, 0.304); };
  const rfHi = z => { if (z <= bodTLZ) return tlLow(z) - 0.002; if (z <= -1.27) return S4 - 0.0008; return bodSY(z, bodRDloZ(z) - 0.004); };
  const rearFender = s => merge([
    lowSide(s, bodZT, -0.667, 70, z => [rfLo(z), rfHi(z)], 20, ARCH_BREAKS.concat([-1.271, -1.269, bodTLZ, bodTLZ - 0.001], bodDense(-1.27, -0.66, 10), bodDense(bodZT, bodTLZ, 5))),
    lowSide(s, bodZT, SP, 16, z => [z <= bodTLZ ? bodTLhi(z) + 0.001 : S4, Math.max(S4 + 1e-4, bodSAtX(z, bodTGdx(z)) - 0.003)], 4, bodDense(bodZT, -2.2, 4)),
    // band boven het achterlicht tussen de onderrand van de achterruit (SP) en de punt van de lamp: sluit de spleet tot de schouder
    lowSide(s, SP - 0.002, bodTLZ + 0.001, 10, z => [Math.min(bodTLhi(z) + 0.001, S4 - 0.004), S4 - 0.0008], 2),
    bodSPweb(s, 0, bodQScr(SP) + 0.005, 0.001),
    bodMirX(bodTailGeo(bodTGseam(0.7) + 0.003, 1.2, bodYLEDGE + 0.004, bodTLY(bodZT, 0), 0, 8, 4), s),
    bodMirX(bodTailGeo(bodTGseam(1.0) + 0.003, 1.2, bodTLY(bodZT, 1), bodSec(bodZT).yd - 0.002, 0, 4, 4), s),
    archLip(s, AXR),
  ]);
  const rear = A('Achterbouw', { d: 'Achterschermen, binnenwielkasten, achterpaneel, hoedenplanksteunen en bumperbalk achter.', ex: [0, 0.04, -0.42] }, [
    ...both(s => P(`Achterscherm ${sn(s)}`, rearFender(s), MAT.paint, { d: 'Gelast achterzijpaneel van achterportier tot achterlicht, met de wielboogflens.', ex: [s * 0.22, 0, -0.04] })),
    ...both(s => P(`Wielkast achter ${sn(s)}`, G.half('x', ARCH + 0.02, 0.22, PI, 24), MAT.paintIn, { d: 'Binnenwielkast achter, gelast aan vloer en achterscherm.', p: [s * 0.62, AY, AXR], ex: [s * 0.1, 0.04, 0] })),
    ...both(s => P(`Hoedenplanksteun ${sn(s)}`, G.rbox(0.05, 0.16, 0.5, 0.01), MAT.paintIn, { d: 'Steun van de bagageruimteafdekking tegen de binnenzijwand.', p: [s * 0.66, 0.92, -1.85], ex: [s * 0.06, 0.04, 0] })),
    P('Achterpaneel', G.rbox(1.2, 0.26, 0.012, 0.004), MAT.paintIn, { d: 'Dwarspaneel onder de achterklepopening met de slotbeugel.', p: [0, 0.5, bodZT + 0.03], ex: [0, 0, -0.06] }),
    P('Achterklepsponning', tube(bodTGPath(0.045), 0.012, 80, 6), MAT.paintIn, { d: 'Gelaste sponning rond de achterklepopening waarop de afdichting zit.', ex: [0, 0.04, -0.04] }),
    P('Bumperbalk achter', tube([-0.55, -0.42, -0.28, 0, 0.28, 0.42, 0.55].map(x => [x, 0.5, Math.max(bodZT + 0.02, bodRearZ(Math.abs(x), 0.5) + 0.075)]), 0.04, 24, 8), MAT.steel, { d: 'Stalen botsbalk achter de achterbumper.', ex: [0, 0, -0.1] }),
  ]);
  // binnen de boogopening: de buitenrand volgt de huid op 6 mm (geen rand buiten de boog, geen open ring tussen scherm en boog)
  const liner = (s, az, nm) => P(`Wielkuipscherm ${nm}`, patch((a, t) => { const r = ARCH - 0.01, z = az + r * Math.cos(a), y = AY + r * Math.sin(a); return [s * lerp(0.61, surfX(z, y) - 0.006, t), y, z]; }, -0.2, PI + 0.2, 28, () => [0, 1], 2), MAT.plastic, { d: 'Kunststof binnenscherm in de wielkast tegen steenslag en vuil.', ex: [s * 0.1, 0.08, 0] });
  const liners = A('Wielkuipschermen', { d: 'Kunststof binnenschermen in de vier wielkasten.', ex: [0, -0.12, 0] }, [liner(L, AXF, 'linksvoor'), liner(R, AXF, 'rechtsvoor'), liner(L, AXR, 'linksachter'), liner(R, AXR, 'rechtsachter')]);
  const cage = A('Carrosseriekooi', { d: 'De gelaste ruwbouw (body in white): vloer, voorbouw, stijlen, dak en achterbouw, met de vaste buitenpanelen.', ex: [0, 0, 0] }, [floorGrp, frontGrp, sideRoof, rear, liners]);

  /* ================= motorkap ================= */
  const hoodS = z => bodHoodS(z) + 0.0018;
  const hoodBr = bodDense(2.2, bodHoodZ1 - 0.002, 10).concat([bodHoodZ1 - 0.0005]);
  const hoodIn = (off, a, b, da) => bodDeck(a, b, 28, z => Math.min(0.995, bodHoodS(z) + da), 12, bodDense(2.1, b, 4), off);
  const hood = A('Motorkap', { d: 'Motorkap van staal met binnenframe, isolatie, scharnieren, slotbeugel, veiligheidshaak en sproeiers.', ex: [0, 0.52, 0.3] }, [
    P('Buitenpaneel motorkap', bodDeck(WS0 + 0.004, bodHoodZ1 - 0.0003, 60, z => Math.min(0.9995, hoodS(z)), 30, hoodBr), MAT.paint, { d: 'Buitenhuid van de motorkap met twee vouwlijnen van de koplampen naar de voorruit.', ex: [0, 0.14, 0] }),
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
  const fbHi = z => { if (z < bodHLZ0) return bodSY(z, bodSeamF(z)); if (z <= bodHLZ1) return hlLow(z) - 0.002; const h = bodHoodS(z); return h >= 1 ? 1 : h - 0.002; };   // voor de kap: beide helften sluiten op de hartlijn
  // extra stations vlak voor de neus van de kap: daar loopt de kapvoorrand bijna dwars en liet lineaire interpolatie een gaatje open
const bodHoodTip = [2.284, 2.286, 2.288, 2.289, 2.2895, 2.2899, 2.2903];
  const fbBr = bodDense(1.752, 1.82, 4).concat(bodDense(2.15, ZF, 16), bodDense(2.235, bodHoodZ1, 8), bodHoodTip);
  // onderste inlaat als echte opening in de bumperschaal (binnen de chromen U), met wanden naar een verzonken rooster
  const inX = 0.462, inY0 = 0.316, inY1 = 0.436, inD = 0.03;
  const shellF = bodWeld(merge([lowSide(L, 1.752, ZF, 56, z => [fbLo(z), fbHi(z)], 30, fbBr), lowSide(R, 1.752, ZF, 56, z => [fbLo(z), fbHi(z)], 30, fbBr), bodCap(ZF - 1e-4, 1)].map(g => bodClipOut(g, inX, inY0, inY1, 2.1))));
  // voorvlak-onderdelen: rooster over (x, y), z op het voorvlak
  const fNorm = (x, y) => { const z = frontZ(Math.abs(x), y), n = bodN(z, sAtY(z, y)); return [Math.sign(x || 1) * n[0], n[1], n[2]]; };
  const fPt = (x, y, out) => { const z = frontZ(Math.abs(x), y), n = fNorm(x, y); return [x + n[0] * out, y + n[1] * out, z + n[2] * out]; };
  const fFace = (x0, x1, y0, y1, out, nx = 16, ny = 3) => patch((y, t) => fPt(x0 + (x1 - x0) * t, y, out), y0, y1, ny, () => [0, 1], nx);
  const fogPose = s => { const x = 0.56, y = 0.37, z = frontZ(x, y), n = fNorm(x, y); return { c: [x, y, z], n }; };
  const fog = s => { const { c, n } = fogPose(s), p = k => [c[0] + n[0] * k, c[1] + n[1] * k, c[2] + n[2] * k];   // linkerhelft; bodPose spiegelt
    return A(`Mistlamp ${sn(s)}`, { d: 'Mistlamp in de bumperhoek (standaard op Initiale Paris).', ex: [s * n[0] * 0.18, -0.02, n[2] * 0.18] }, [
      // zwarte rand met een ronde opening, daarachter een zwarte kom met de verchroomde reflector en de heldere lens (vooraanzicht: ronde lamp)
      P('Mistlamphuis', merge([cache('bodFogBezel', () => { const sh = shapeOf(rrectPts(0.13, 0.085, 0.022, 5)); sh.holes.push(circlePath(0, 0, 0.034)); const g = extrude(sh, 0.016, 24); g.rotateY(HALF); return g; }),
        G.lathe('x', [[0.034, -0.008], [0.034, -0.03], [0.012, -0.036], [0, -0.036]], 24, 'bodFogCup')]), MAT.blackGloss, { d: 'Zwarte behuizing in de bumperhoek: een rand met ronde opening en een kom waarin reflector en lamp zitten.', ...bodPose(s, p(-0.002), n) }),
      P('Mistlampreflector', G.lathe('x', [[0.004, -0.03], [0.014, -0.027], [0.024, -0.02], [0.031, -0.012], [0.0335, -0.006]], 24, 'bodFogR2'), MAT.reflector, { d: 'Verchroomde reflector achter de lens.', ...bodPose(s, p(-0.002), n), ex: [s * n[0] * 0.03, 0, n[2] * 0.03] }),
      P('Mistlamplens', G.lathe('x', [[0, 0.0045], [0.02, 0.004], [0.033, 0.0015], [0.0335, -0.001], [0, -0.001]], 24, 'bodFogLens'), MAT.lensClear, { d: 'Heldere, licht bolle lens.', ...bodPose(s, p(-0.002), n), ex: [s * n[0] * 0.06, 0, n[2] * 0.06] }),
      P('Mistlampje', G.cyl('x', 0.007, 0.007, 0.02, 10), MAT.ceramic, { d: 'H11-halogeenlamp (gangbare uitvoering, schematisch).', inner: true, ...bodPose(s, p(-0.024), n) }),
    ]); };
  // fase 2-chroom (foto blauwe hatchback): brede 'smile' langs de onderrand van de inlaat die naar de hoeken uitloopt en opkrult naar de
  // mistlampen, en een dikke chromen balk (26 mm, 0,21 m lang) direct op de bovenrand van elke mistlamppot, over de hele potbreedte en naar de bumperhoek iets oplopend
  const browPts = s => { const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([s * (0.472 + 0.21 * u), 0.424 + 0.017 * Math.pow(u, 1.6)]); } return pts; };
  const brow = s => tube(browPts(s).map(([x, y]) => fPt(x, y, 0.005)), 0.013, 24, 10);
  // donkere lijn op het voorvlak langs een pad [[x, y], ...]: band van d0 tot d1 dwars op het pad (in vooraanzicht); aan beide kanten van een
  // chroomlijst geeft dat dezelfde omlijsting met donker als bij de raamomlijsting, zodat de heldere lijn op het zilver leest
  const fBand = (pts, d0, d1, out = 0.0012) => patch((u, t) => {
    const k = Math.min(pts.length - 2, Math.floor(u)), f = u - k, a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, d = lerp(d0, d1, t);
    return fPt(lerp(a[0], b[0], f) - dy / l * d, lerp(a[1], b[1], f) + dx / l * d, out); }, 0, pts.length - 1, (pts.length - 1) * 2, () => [0, 1], 1);
  const fFrame = (pts, a, b) => merge([fBand(pts, a, b), fBand(pts, -b, -a)]);
  const intakeHalf = [[0, 0.311], [0.2, 0.311], [0.34, 0.313], [0.42, 0.317], [0.458, 0.326], [0.478, 0.343], [0.486, 0.365], [0.485, 0.395], [0.48, 0.418], [0.476, 0.432]];
  const intakePts = intakeHalf.slice(1).reverse().map(([x, y]) => [-x, y]).concat(intakeHalf);
  const intakeU = (() => { const pts = intakePts; return tube(pts.map(([x, y]) => fPt(x, y, Math.abs(x) < 0.42 ? lerp(-0.0065, -0.0035, clamp((Math.abs(x) - 0.2) / 0.22, 0, 1)) : lerp(-0.0035, 0.003, clamp((Math.abs(x) - 0.42) / 0.05, 0, 1)))), 0.011, 64, 10); })();   // op de neuspunt en de bolle hoek half verzonken (binnen ZF + 6 mm en de planmaat op z 2,30)
  // verzonken rooster: vijf schuine lamellen (bovenvlak ca. 45 graden omhoog, vangt het licht als heldere lijn) voor een matzwarte achterwand,
  // met drie staande schotten; wanden van de opening tot de achterwand
  const inWall = (x0, y0, x1, y1, n) => patch((u, t) => { const x = lerp(x0, x1, u), y = lerp(y0, y1, u); return fPt(x, y, lerp(0.0015, -inD, t)); }, 0, 1, n, () => [0, 1], 2);
  const slat = yc => patch((x, t) => fPt(x, yc - 0.006 + 0.012 * t, lerp(-0.007, -0.02, t)), -inX + 0.002, inX - 0.002, 30, () => [0, 1], 1);
  const grilleBack = patch((x, y) => fPt(x, y, -inD), -inX, inX, 30, () => [inY0, inY1], 3);
  const grilleWalls = merge([inWall(-inX, inY1, inX, inY1, 30), inWall(-inX, inY0, inX, inY0, 30), inWall(-inX, inY0, -inX, inY1, 4), inWall(inX, inY0, inX, inY1, 4)]);
  const slats = merge([0.331, 0.353, 0.375, 0.397, 0.419].map(slat).concat([-0.24, 0, 0.24].map(x => patch((y, t) => fPt(x + (t - 0.5) * 0.006, y, -0.008 - 0.016 * t), inY0, inY1, 4, () => [0, 1], 1))));
  const plateY = 0.505;
  const frontBumper = A('Voorbumper', { d: 'Kunststof bumperschaal van de fase 2 met bovengrille, kentekenvlak, brede onderste inlaat met chromen onderrand en mistlampen met chromen balk.', ex: [0, -0.04, 0.72] }, [
    P('Bumperschaal voor', shellF, MAT.paint, { d: 'Gespoten kunststof bumperschaal in carrosseriekleur.', ex: [0, 0, 0] }),
    // flens onder de naad tussen kapvoorrand en bumper (6 mm onder de huid): door de naad is geen motorruimte meer te zien
    P('Kapnaadflens', merge([L, R].map(sd => lowSide(sd, bodHLZ1 - 0.03, bodHoodZ1, 20, z => { const h = bodHoodS(z); return [Math.min(0.999, h - 0.008), Math.min(1, h + 0.008)]; }, 2, bodDense(2.27, bodHoodZ1, 6).concat(bodHoodTip), 0.006))), MAT.plastic, { d: 'Kunststof flens van de bumperschaal onder de naad met de voorrand van de motorkap.', ex: [0, 0.03, 0.04] }),
    A('Bovengrille', { d: 'Smalle zwarte sleuf direct onder de voorrand van de motorkap.', ex: [0, 0.04, 0.12] }, [
      P('Grillesleuf', fFace(-0.3, 0.3, 0.618, 0.648, 0.003, 20, 2), MAT.blackGloss, { d: 'Hoogglans zwart rooster.', ex: [0, 0, 0] }),
      P('Chroomlijn grille', tube([-0.3, -0.15, 0, 0.15, 0.3].map(x => [x, 0.611, frontZ(x, 0.611) + 0.001]), 0.005, 16, 8), MAT.bodChrome, { d: 'Dunne chroomlijn onder de grillesleuf.', ex: [0, -0.02, 0.04] }),
    ]),
    P('Kentekenvlak', fFace(-0.34, 0.34, 0.44, 0.572, 0.002, 20, 4), MAT.blackGloss, { d: 'Zwart horizontaal vlak boven de onderste inlaat waarop de kentekenplaat zit.', ex: [0, 0.02, 0.08] }),
    // plaat en houder volgen de bolling van het voorvlak en liggen er vrijwel vlak op (3 tot 5 mm), zonder zichtbaar blok erachter
    P('Kentekenplaathouder', merge([fFace(-0.268, 0.268, plateY - 0.06, plateY + 0.06, 0.0032, 16, 2), fFace(-0.268, 0.268, plateY - 0.06, plateY + 0.06, 0.0026, 16, 2)]), MAT.plastic, { d: 'Dunne kunststof houder die de plaat in de bolling van het kentekenvlak houdt.', ex: [0, 0, 0.1] }),
    A('Kentekenplaat voor', { d: 'Gele Nederlandse kentekenplaat (zonder kenteken weergegeven).', ex: [0, 0.03, 0.26] }, [
      P('Plaat', merge([fFace(-0.215, 0.26, plateY - 0.055, plateY + 0.055, 0.0052, 16, 2), fFace(-0.26, 0.26, plateY - 0.055, plateY + 0.055, 0.0038, 18, 2)]), MAT.plateYellow, { d: 'Retroreflecterende gele plaat van 520 × 110 mm.', ex: [0, 0, 0.03] }),
      P('EU-strook', fFace(-0.26, -0.215, plateY - 0.055, plateY + 0.055, 0.0054, 2, 2), MAT.plateBlue, { d: 'Blauwe strook met de landcode links op de plaat, zonder tekst weergegeven.', ex: [-0.06, 0, 0.02] }),
    ]),
    A('Onderste luchtinlaat', { d: 'Brede, lage inlaat voor radiateur en intercooler, met een chromen onderrand.', ex: [0, -0.05, 0.12] }, [
      P('Inlaatrooster', slats, MAT.bodGrille, { d: 'Zwart kunststof rooster met schuine horizontale lamellen, ca. 2 cm verzonken achter de chromen lijst.', ex: [0, 0, 0.04] }),
      P('Inlaatkanaal', merge([grilleBack, grilleWalls]), MAT.plastic, { d: 'Mat zwarte achterwand en wanden van de inlaatopening, die de lucht naar radiateur en intercooler leiden.', ex: [0, 0, 0] }),
      P('Chroomlijst inlaat', intakeU, MAT.bodChrome, { d: 'Brede chromen lijst langs de onderrand van de inlaat die naar de bumperhoeken uitloopt en naar de mistlampen opkrult.', ex: [0, -0.02, 0.06] }),
      P('Rubberlijnen chroomlijst inlaat', fFrame(intakePts, 0.008, 0.017), MAT.bodPillar, { d: 'Smalle zwarte rubberlijnen aan beide kanten van de chromen inlaatlijst, waartegen de heldere lijst afsteekt.', ex: [0, -0.02, 0.04] }),
    ]),
    A('Mistlampen voor', { d: 'Twee mistlampen in de bumperhoeken met elk een chromen wenkbrauw.', ex: [0, -0.02, 0.1] }, [
      ...both(fog),
      ...both(s => P(`Chroomwenkbrauw ${sn(s)}`, brow(s), MAT.bodChrome, { d: 'Chromen balk op de bovenrand van de mistlamp, naar buiten iets oplopend.', ex: [s * 0.08, 0.04, 0.08] })),
      ...both(s => P(`Rubberlijnen wenkbrauw ${sn(s)}`, fFrame(browPts(s), 0.010, 0.019), MAT.bodPillar, { d: 'Smalle zwarte lijnen boven en onder de chromen wenkbrauw, waartegen de balk afsteekt.', ex: [s * 0.06, 0.03, 0.06] })),
    ]),
    // de lip loopt tot de hartlijn door (s = 0), zodat de twee helften op de neuspunt aansluiten: eerder bleef daar een V-vormig gat met
    // spitse zwarte punten onder de chroomlijst
    P('Onderlip', merge([L, R].map(sd => lowSide(sd, 1.80, ZF, 60, z => [0, bodSY(z, YB(z) + 0.022)], 4, bodDense(2.2, ZF, 16), -0.003))), MAT.plastic, { d: 'Zwarte spoilerlip onder de bumper.', ex: [0, -0.08, 0.06] }),
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
  const rFace = (x0, x1, y0, y1, out, nx = 12, ny = 3) => patch((y, t) => { const x = x0 + (x1 - x0) * t; return [x, y, bodRearZ(x, y) - out]; }, y0, y1, ny, () => [0, 1], nx);
  // verdiepte kentekenuitsparing (fase 2-foto): plaat met het midden op y 0,46, opening ca. 2 cm rondom de plaat, wanden schuin naar binnen
  // naar een bodem 1 cm diep. De bumperschaal krijgt daar een echte opening: driehoeken van de staartpunt die de opening raken vallen
  // weg, en een 1,2 mm hoger kraagvlak rondom (zelfde lak) dekt de rafelrand af.
  const rPlateY = 0.46, rcX = 0.285, rcY0 = 0.385, rcY1 = 0.527, rcXi = 0.272, rcYi0 = 0.396, rcYi1 = 0.521, rcD = 0.010, rcOut = 0.0012;
  const rcIn = (x, y, z) => z < -2.28 && Math.abs(x) < rcX && y > rcY0 && y < rcY1;
  const bodCut = g => { const p = g.attributes.position, ix = g.index.array, keep = [];
    for (let i = 0; i < ix.length; i += 3) { if (![ix[i], ix[i + 1], ix[i + 2]].some(k => rcIn(p.getX(k), p.getY(k), p.getZ(k)))) keep.push(ix[i], ix[i + 1], ix[i + 2]); }
    g.setIndex(keep); return g; };
  const tipBr = rbBr.concat(bodDense(ZR, -2.296, 30));
  const tipL = sd => [lowSide(sd, ZR + 1e-4, bodZT, 24, () => [0, S2], 26, tipBr), lowSide(sd, ZR + 1e-4, bodZT, 12, () => [S2, 1], 18, rbBr)];
  const shellR = bodWeld(merge([
    lowSide(L, -1.778, bodZT, 30, z => [S1 * 0.45, bodSY(z, bodYLEDGE)], 22),
    lowSide(R, -1.778, bodZT, 30, z => [S1 * 0.45, bodSY(z, bodYLEDGE)], 22),
    ...tipL(L).concat(tipL(R)).map(bodCut),
    // sluitvlak op de staartpunt licht bol (hoogstens 4 mm, binnen ZR - 6 mm): een vlak eindvlak las als lichte rechthoek boven de kentekenuitsparing
    (() => { const z = ZR + 1e-4, c = bodSec(z); return patch((y, t) => { const X = ringX(z, y), v = 2 * (y - c.yb) / (c.yd - c.yb) - 1; return [X * t, y, z - 0.004 * (1 - t * t) * (1 - v * v)]; }, c.yb + 1e-4, c.yd - 1e-4, 8, () => [-1, 1], 16); })(),
    rFace(-0.315, 0.315, 0.372, rcY0, rcOut, 16, 2), rFace(-0.315, 0.315, rcY1, 0.535, rcOut, 16, 2), rFace(-0.315, -rcX, rcY0, rcY1, rcOut, 2, 8), rFace(rcX, 0.315, rcY0, rcY1, rcOut, 2, 8),
  ]));
  // schuine wanden van de opening (buitenrand op de huid, binnenrand op de bodem) en de bodem
  const rcO = (x, y) => [x, y, bodRearZ(x, y) - rcOut], rcI = (x, y) => [x, y, bodRearZ(x, y) + rcD];
  const rcWall = (a0, a1, b0, b1, n) => patch((u, t) => { const o = rcO(lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u)), i = rcI(lerp(b0[0], b1[0], u), lerp(b0[1], b1[1], u)); return [lerp(o[0], i[0], t), lerp(o[1], i[1], t), lerp(o[2], i[2], t)]; }, 0, 1, n, () => [0, 1], 2);
  const recess = merge([
    rcWall([-rcX, rcY1], [rcX, rcY1], [-rcXi, rcYi1], [rcXi, rcYi1], 16), rcWall([-rcX, rcY0], [rcX, rcY0], [-rcXi, rcYi0], [rcXi, rcYi0], 16),
    rcWall([-rcX, rcY0], [-rcX, rcY1], [-rcXi, rcYi0], [-rcXi, rcYi1], 8), rcWall([rcX, rcY0], [rcX, rcY1], [rcXi, rcYi0], [rcXi, rcYi1], 8),
    patch((y, t) => rcI(lerp(-rcXi, rcXi, t), y), rcYi0, rcYi1, 8, () => [0, 1], 12),
  ]);
  // plaat op de bodem, gekanteld met het bumpervlak; voorvlak ca. 5 mm onder de huid
  const rzA = bodRearZ(0, rPlateY - 0.045), rzB = bodRearZ(0, rPlateY + 0.045), rTilt = -Math.atan2(rzA - rzB, 0.09), rPlateZ = (rzA + rzB) / 2 + rcD - 0.0055;
  const zVal = (() => { let lo = ZR, hi = bodZT; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (YB(m) >= 0.366) lo = m; else hi = m; } return hi; })();
  const rearBumper = A('Achterbumper', { d: 'Bumperschaal met kentekenuitsparing, richel onder de achterklep, reflectoren, parkeersensoren en uitsparingen voor de dubbele uitlaat (aannemelijk voor deze motor).', ex: [0, -0.04, -0.7] }, [
    P('Bumperschaal achter', shellR, MAT.paint, { d: 'Gespoten kunststof bumperschaal met de richel onder de achterklep.', ex: [0, 0, 0] }),
    P('Kentekenuitsparing', recess, MAT.paint, { d: 'Verdiepte kentekenuitsparing in carrosseriekleur: schuin naar binnen lopende wanden rond de plaat en een vlakke bodem.', ex: [0, 0, -0.06] }),
    A('Kentekenplaat achter', { d: 'Gele Nederlandse kentekenplaat (zonder kenteken weergegeven).', ex: [0, 0, -0.22] }, [
      P('Plaat', G.box(0.52, 0.11, 0.004), MAT.plateYellow, { d: 'Retroreflecterende gele plaat van 520 × 110 mm, licht gekanteld met het bumpervlak.', p: [0, rPlateY, rPlateZ], r: [rTilt, 0, 0], ex: [0, 0, -0.03] }),
      P('EU-strook', G.box(0.045, 0.11, 0.005), MAT.plateBlue, { d: 'Blauwe strook met de landcode, zonder tekst weergegeven.', p: [0.2375, rPlateY, rPlateZ - 0.0005], r: [rTilt, 0, 0], ex: [0.06, 0, -0.02] }),
    ]),
    ...both(s => P(`Kentekenverlichting ${sn(s)}`, G.rbox(0.06, 0.008, 0.012, 0.003), MAT.lensClear, { d: 'Kentekenverlichting in de bovenwand van de uitsparing, schijnt omlaag op de plaat.', p: [s * 0.2, (rcY1 + rcYi1) / 2 - 0.0015, (bodRearZ(0.2, rcY1) + bodRearZ(0.2, rcYi1)) / 2 + 0.0035], ex: [s * 0.02, 0.04, 0] })),
    // donkere onderschort (foto's fase 2): band van ca. 9 cm langs de onderrand, op de achterzijde tot vlak onder de kentekenuitsparing;
    // de uitlaateindstukken (uitlaatsysteem, y 0,30) liggen aan de onderrand
    // de band stopt waar de onderkant van de staartpunt boven 0,366 komt (z ca. -2,29): daarachter bleef een strook zonder hoogte over die als
    // dunne staande lijn midden door de kentekenplaat te zien was
    P('Onderschort', merge([L, R].map(sd => lowSide(sd, -2.02, zVal, 40, z => [0, bodSY(z, Math.max(YB(z) + 0.002, Math.min(0.368, YB(z) + 0.09)))], 8, bodDense(-2.3, bodZT, 6).concat(bodDense(zVal, -2.3, 4)), -0.0025))), MAT.bodValance, { d: 'Donkergrijze kunststof onderschort langs de onderrand van de achterbumper (ca. 9 cm hoog), met aan de onderrand de uitsparingen voor de uitlaat.', ex: [0, -0.08, -0.04] }),
    P('Mistachterlicht', G.rbox(0.1, 0.03, 0.012, 0.006), MAT.lensRed, { d: 'Mistachterlicht onderin de bumper aan de bestuurderszijde (positie geschat uit fase 2-foto\'s).', p: [0.62, 0.34, bodRearZ(0.62, 0.34) - 0.004], ex: [0.04, 0, -0.08] }),
    P('Reflector rechts', G.rbox(0.1, 0.03, 0.01, 0.006), MAT.lensRed, { d: 'Rode reflector onderin de bumper.', p: [-0.62, 0.34, bodRearZ(0.62, 0.34) - 0.004], ex: [-0.04, 0, -0.08] }),
    A('Parkeersensoren achter', { d: 'Vier ultrasone sensoren van de parkeerhulp achter (standaard op Initiale Paris), onder en naast de kentekenuitsparing.', ex: [0, 0.03, -0.12] }, [[0.5, 0.43], [0.17, 0.345], [-0.17, 0.345], [-0.5, 0.43]].map(([x, y], i) => P(`Parkeersensor achter ${i + 1}`, G.cyl('z', 0.011, 0.011, 0.02, 12), MAT.paint, { d: 'Ultrasone parkeersensor achter (standaard op Initiale Paris).', p: [x, y, bodRearZ(x, y) + 0.006], ex: [0, 0.02, -0.06] }))),
    ...both(s => P(`Uitlaatuitsparing ${sn(s)}`, lowSide(s, -2.29, -2.13, 6, z => [clamp(bodSAtXLow(z, 0.72), 0, S1), clamp(bodSAtXLow(z, 0.56), 0, S1)], 3, [], -0.0035), MAT.blackGloss, { d: 'Uitsparing in de onderrand voor het verchroomde uitlaateindstuk (het eindstuk zelf hoort bij het uitlaatsysteem).', ex: [0, -0.04, -0.06] })),
    ...both(s => P(`Bumpersteun achter ${sn(s)}`, G.rbox(0.05, 0.08, 0.14, 0.01), MAT.plastic, { d: 'Geleider die de bumperschaal aan het achterscherm vasthoudt; door de naad bij de bumperrichel net zichtbaar.', p: [s * 0.76, 0.55, -1.95], ex: [s * 0.05, 0, 0] })),
  ]);

  /* ================= achterklep ================= */
  const tgFace = (x0, x1, y0, y1, ny = 6, nx = 14) => bodTailGeo(x0, x1, y0, y1, 0, ny, nx);
  const gsP = (s, z, inw) => { const p = bodGhHalf(z, bodQS + 0.04); return [s * (p[0] - inw), p[1] - inw, z]; };
  const ydT = bodSec(bodZT).yd;
  const tgOuter = merge([
    tgFace(-bodTGseam(0.7), bodTGseam(0.7), bodYLEDGE + 0.004, bodTLY(bodZT, 0), 8),
    tgFace(-0.34, 0.34, bodTLY(bodZT, 0), bodTLY(bodZT, 1), 4, 10),
    tgFace(-bodTGseam(1.0), bodTGseam(1.0), bodTLY(bodZT, 1), ydT - 0.001, 5),
    // dek achter de lip: rolt bol af naar het staartvlak; vlak onder de lip ligt ca. 2 cm lager (schaduwlijn)
    bodDeck(bodZT, SP + 0.002, 22, z => bodSAtX(z, bodTGdx(z)), 24, bodDense(bodZT, -2.22, 6)),
  ]);
  const scr = patch((z, w) => ghPt(z, w), SP + 0.004, RW0 - 0.004, 30, z => { const q = qScr(z) + 0.004; return [q / 2, 1 - q / 2]; }, 22);
  // spoilerlip (eendenstaartje): dun blad van ca. 7 mm dat ca. 3,6 cm achter de onderrand van de ruit uitsteekt, met een lichte opkrul (ca. 18 graden, ca. 4 mm boven het glas aan de voet)
  // en een scherpe achterrand; profiel (dz, dy) t.o.v. die rand: bovenkant, achterrand, onderkant. Zo breed als de ruit (onderhoek x bodXScr);
  // naar de uiteinden loopt het profiel in ruit en dek weg (geen trede bij de C-stijl). Vorige ronden: 4,7 cm las als plank, 2,2 cm was onzichtbaar
  const lipPr = [[-0.004, 0.0045], [-0.014, 0.0065], [-0.024, 0.0095], [-0.032, 0.0128], [-0.0362, 0.0145], [-0.0356, 0.0075], [-0.026, 0.0025], [-0.015, -0.0005], [-0.005, -0.003]];
  const lipYd = x => halfPt(SP, bodSAtX(SP, x))[1];
  const lipX = bodXScr, lipN = lipPr.length + 1;
  const lip = patch((x, v) => {
    const ax = Math.abs(x), w = 1 - (ax / lipX) ** 8, yg = halfPt(SP, bodSAtX(SP, ax))[1] + (YR(SP) - bodSec(SP).yd) * (1 - (ax / bodSec(SP).xe) ** bodDP(SP)) + 0.001;
    const pts = [[0.008, yg + 0.003]].concat(lipPr.map(([dz, dy]) => [dz * w, yg + dy * w]), [[0.001, lipYd(ax) - 0.003]]);
    const i = Math.min(pts.length - 2, Math.floor(v)), f = v - i, a = pts[i], b = pts[i + 1];
    return [x, lerp(a[1], b[1], f), SP + lerp(a[0], b[0], f)]; }, -lipX, lipX, 48, () => [0, lipN], lipN);
  const wPiv = [0.32, halfPt(SP + 0.06, bodSAtX(SP + 0.06, 0.32))[1] + 0.03, SP + 0.06];
  const wTip = (() => { const z = -1.5; const w = 0.5 - 0.5 * 0.55 / bodGh(z).xr * 0.98; const p = ghPt(z, w); return [0.5, p[1] + 0.03, z]; })();
  const tailgate = A('Achterklep', { d: 'Grote achterklep met de hele achterruit, typerend voor de vijfdeurs hatchback, met spoilerlip, derde remlicht en achterruitenwisser.', ex: [0, 0.42, -0.5] }, [
    P('Buitenpaneel achterklep', merge([tgOuter, bodSPweb(1, bodQScr(SP), 1, 0.003, 16), bodSPweb(-1, bodQScr(SP), 1, 0.003, 16)]), MAT.paint, { d: 'Plaatwerk van de achterklep onder en achter de ruit.', ex: [0, 0, -0.08] }),
    P('Binnenpaneel achterklep', merge([bodTailGeo(-0.36, 0.36, 0.68, ydT - 0.02, -0.04, 4, 8), patch((z, w) => { const p = ghPt(z, w); return [p[0] * 0.92, p[1] - 0.03, z]; }, SP + 0.04, RW0 - 0.06, 10, () => [0.39, 0.61], 6)]), MAT.paintIn, { d: 'Binnenframe van de achterklep met scharnier- en slotversteviging.', ex: [0, 0, 0] }),
    P('Achterruit', scr, MAT.glass, { d: 'Verwarmde achterruit van gehard glas, zeer vlak geplaatst (ca. 14 graden).', ex: [0, 0.14, 0.02] }),
    P('Spoilerlip', lip, MAT.paint, { d: 'Kleine spoilerlip (eendenstaartje) aan de onderrand van de achterruit: een dun, licht opkrullend blad van ca. 3,5 cm met een scherpe achterrand, zo breed als de ruit en aan de uiteinden in het plaatwerk weglopend.', ex: [0, 0.1, -0.06] }),
    // achter het glas, net onder de dakrand: steekt in zijaanzicht niet boven de daklijn uit en schemert door de getinte ruit
    P('Derde remlicht', G.rbox(0.30, 0.008, 0.02, 0.003), MAT.lensRed, { d: 'Derde remlicht achter de bovenrand van de achterruit, direct onder de dakrand (plaats geschat uit fase 2-foto\'s, schematisch).', p: [0, YR(RW0 - 0.045) - 0.011, RW0 - 0.045], r: [-Math.atan2(YR(RW0) - YR(RW0 - 0.09), 0.09), 0, 0], ex: [0, 0.05, -0.08] }),
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
    ...[[-0.02, 'bestuurderszijde'], [-0.52, 'passagierszijde']].map(([x, nm]) => P(`Wisseraskap ${nm}`, G.cyl('y', 0.016, 0.018, 0.02, 12), MAT.blackGloss, { d: 'Kap over de asmoer van de wisserarm, op de voorruitbasis direct achter de motorkap.', p: wipeOn(x, 1.04, 0.014), ex: [0, 0.05, 0] })),
    P('Wissermotor', merge([G.cyl('z', 0.04, 0.04, 0.09, 16), xf(G.rbox(0.08, 0.06, 0.05, 0.01), [0, 0, 0.06])]), MAT.darkSteel, { d: 'Elektromotor van de ruitenwissers in de torpedobak.', inner: true, p: [0.3, 0.9, 1.07], ex: [0, -0.1, 0.06] }),
    P('Wisserstangenmechaniek', merge([rodBetween([-0.52, 0.92, 1.1], [0.3, 0.9, 1.08], 0.007, 8), rodBetween([0.3, 0.9, 1.08], [-0.02, 0.92, 1.1], 0.007, 8)]), MAT.steel, { d: 'Stangenstelsel dat beide wisserassen aandrijft.', ex: [0, -0.06, 0.12] }),
  ]);

  return A('Carrosserie', { d: 'Zelfdragende carrosserie van de vijfdeurs hatchback in zilvergrijs metallic (Gris Platine), met alle aanbouwdelen, ruiten en verlichting.', ex: [0, 2.0, 0], spec: [['Lengte', '4.695 mm'], ['Breedte zonder / met spiegels', '1.811 / 2.060 mm'], ['Hoogte', '1.445 mm'], ['Wielbasis', '2.756 mm'], ['Spoorbreedte voor / achter', '1.557 / 1.512 mm'], ['Kleur', 'Gris Platine (D69)']] }, [
    cage, hood, tailgate, fender(L), fender(R), frontBumper, rearBumper,
    buildDoor(L, true), buildDoor(R, true), buildDoor(L, false), buildDoor(R, false),
    windscreen, buildHeadlight(L), buildHeadlight(R), buildTaillight(L), buildTaillight(R), wipers,
  ]);
}

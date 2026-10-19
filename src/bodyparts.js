/* ===================== carrosserie: onderdelen ===================== */
// Panelen zijn stukken van het parametrische oppervlak uit body.js: onderbak in (z, s), kas in (z, q), staartvlak in (x, y).
MAT.paint.color.setHex(0xaeb2b7);          // Gris Platine D69 (zilvergrijs metallic), geschat uit fase 2-persfoto's (#B3B6BA)
MAT.paintIn.color.setHex(0x9a9ea4);
// zijruiten en voorruit: donker getint autoglas; weinig omgevingsreflectie, zodat de ruitband als donkere band leest en het interieur zwak doorschemert
// envMapIntensity (0,12) en specularIntensity (0,14, begrenst ook de Fresnel-reflectie bij scherende hoek) laag: de vlakke achterruit werd anders melkwit
MAT.glass.color.setHex(0x040608); MAT.glass.opacity = 0.92; MAT.glass.envMapIntensity = 0.12; MAT.glass.roughness = 0.08; MAT.glass.specularIntensity = 0.14;
// voorruit: zelfde glas, maar de binnenkant (achterzijde van de driehoeken) heeft maar 0,45 maal de dekking. Transparante dubbelzijdige materialen worden in twee gangen getekend (eerst BackSide met FLIP_SIDED,
// dan FrontSide); gl_FrontFacing zegt daar niets (is in beide gangen waar). De buitenkant van dit glas is de BackSide-gang (gemeten), dus de FrontSide-gang zonder FLIP_SIDED is de binnenkant, zodat de ruit van binnen niet als egaal zwart vlak leest en de kap,
// de wissers en de lucht erachter doorschemeren; de buitenkant heeft 0,80 dekking (zie hieronder). Een shaderaanpassing in plaats van een tweede mesh: geen extra tekenopdracht voor de ruit zelf.
// De kloon (markering, kleur per systeem) krijgt dezelfde aanpassing mee.
function bodGlassWs(m) {
  m.name = 'glassWs';
  // buitenkant 0,80 dekkend in plaats van 0,92 (golf 5c-2, K11, besluit van de gebruiker op 18 oktober 2026): van buiten schemeren
  // spiegel en dashboard door; de zijruiten en de achterruit blijven 0,92. Factor op de dekking van MAT.glass, als getal in de shader.
  const buiten = (0.80 / MAT.glass.opacity).toFixed(6);
  // three r147 kiest het programma op onBeforeCompile.toString(); de factor zit in de closure, dus hij moet in de sleutel
  m.customProgramCacheKey = () => 'glassWs' + buiten;
  m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n#ifndef FLIP_SIDED\n\tdiffuseColor.a *= 0.45;\n#else\n\tdiffuseColor.a *= ' + buiten + ';\n#endif'); };
  m.clone = function () { return bodGlassWs(THREE.MeshPhysicalMaterial.prototype.clone.call(this)); };
  return m;
}
MAT.glassWs = bodGlassWs(MAT.glass.clone());
// zijruiten en kwartsruiten (golf 5f, S7 kenmerk 4): iets minder dekkend en met wat meer luchtreflectie dan de achterruit, zodat het glas als
// donkergrijs leest en de zwarte B-stijl en het stijltje ernaast als zwart vlak afsteken (bij 0,92 en 0,12 waren glas en stijl even zwart)
MAT.bodGlassSide = MAT.glass.clone(); MAT.bodGlassSide.name = 'bodGlassSide'; MAT.bodGlassSide.opacity = 0.84; MAT.bodGlassSide.envMapIntensity = 0.9;
// nieuwe carrosseriematerialen: zwart mat voor stijlen en raamkaders, helder chroom voor lijsten en sierstrips, spiegelglas
std('bodPillar', 0x060607, 0, 0.8, { envMapIntensity: 0.12 });
std('bodBright', 0xf4f6f8, 0.6, 0.16, { envMapIntensity: 1.5 });
std('bodMirror', 0xb4bec6, 1, 0.04, { envMapIntensity: 1.1 });
// zwart van de B-stijlafdekkingen en het stijltje achter: diep zwart, ruw en vrijwel zonder omgevingsreflectie. Met glans (ruwheid 0,3, omgeving 0,35)
// spiegelden de afdekkingen de lichte vloer en lazen ze als twee grijze stroken met een naad ertussen in plaats van als een zwart vlak (S7 kenmerk 4)
std('bodPillarGloss', 0x020203, 0, 0.9, { envMapIntensity: 0.02 });
std('bodValance', 0x2b2d31, 0, 0.66);                                     // donkergrijs kunststof van de onderschort achter
// chroom van de sierlijsten (raamomlijsting, gordel, voorbumper): volledig metallisch, glad en met een donkerder basis dan bodBright, zodat het
// de omgeving met contrast spiegelt (heldere lichtvlakken naast donkere vloer) in plaats van vlak wit te lezen. Golf 5f (T1): basis lichter
// (0xd0d6dc in plaats van 0xa9b0b7) en iets ruwer (0,1 in plaats van 0,06), omdat de bovenband van de raamomlijsting donkerder las dan de lak.
// Dit materiaal geldt ook voor de chroomlijnen van grille en inlaat en de chroomwenkbrauwen voor: die werden mee lichter
std('bodChrome', 0xd0d6dc, 1, 0.1, { envMapIntensity: 2.0 });
// golf 5h: donkerder en minder spiegelend (was 0x1d1f23, metaal 0,35, omgeving 1,1): de lamellen lazen als grijs rooster, op de persfoto is de inlaat diep zwart
std('bodGrille', 0x0f1013, 0.25, 0.3, { envMapIntensity: 0.6 });             // glanzend zwart kunststof van de inlaatlamellen
// middengrijs gelakt staal van de gasveercilinders: lichter dan het zwart van de zijrand en de bekleding, zodat de veer in het achterklepbeeld leest
std('bodStrut', 0x62676e, 0.55, 0.35, { envMapIntensity: 0.9 });
const bodSY = (z, y) => sAtY(z, y);
const sn = s => sideName(s);
// naden tussen linker- en rechterhelft gladtrekken (gedeelde normalen)
// ook over naden tussen losse vlakken: weldAll in core.js (zelfde tolerantie 1e-4)
function bodWeld(g) { const m = THREE.BufferGeometryUtils.mergeVertices(g, 1e-4); m.computeVertexNormals(); return m; }
// driehoeken die na het lassen twee keer hetzelfde punt hebben (oppervlak 0) weghalen, en de punten die dan nergens meer
// in voorkomen (die hadden een nulnormaal); volgorde en normalen van de overige punten blijven gelijk
function bodDropDegen(g) {
  const ix = g.index.array, keep = [], used = new Int32Array(g.attributes.position.count).fill(-1);
  for (let i = 0; i < ix.length; i += 3) { const a = ix[i], b = ix[i + 1], c = ix[i + 2]; if (a !== b && b !== c && a !== c) keep.push(a, b, c); }
  keep.forEach(k => { used[k] = 0; });
  let n = 0; used.forEach((u, k) => { if (u === 0) used[k] = n++; });
  const r = new THREE.BufferGeometry();
  for (const [nm, at] of Object.entries(g.attributes)) {
    const w = at.itemSize, arr = new at.array.constructor(n * w);
    used.forEach((j, k) => { if (j >= 0) for (let c = 0; c < w; c++) arr[j * w + c] = at.array[k * w + c]; });
    r.setAttribute(nm, new THREE.BufferAttribute(arr, w));
  }
  r.setIndex(keep.map(k => used[k])); return r;
}
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
// B-stijl: twee zwarte afdekkingen naast elkaar (raamkader voorportier voor de naad, raamkader achterportier erachter), samen ca. 12,8 cm
// breed op de gordel en ca. 11 cm bovenaan (inclusief het runkanaal, bodBRW per kant, golf 5f ronde 3), helling ca. 12 graden naar achteren;
// de sluitnaad (z -0,148 op de gordel) loopt ertussen omhoog. De ruitranden (bodBf, bodBr) liggen op de gordel 10,2 cm uit elkaar.
// Golf 5f: de voorste ruitrand ligt op de gordel op z -0,121 in plaats van -0,073; met 0,15 m was het zwarte vlak breder dan
// op de auto. De achterste afdekking blijft gelijk: de ruit van het achterportier zakt schuin langs die achterkant (helling bodBRK) en schuift
// met een smallere afdekking door de voorste sluitrand en het scharnierblad van het portier.
const bodBGK = Math.tan(12 * PI / 180), bodBF0 = -0.121, bodBFK = 0.091 / 0.43, bodBRK = 0.066 / 0.43, bodBGW = 0.0045, bodBRW = 0.014;
const bodBg = y => -0.148 - (y - 0.946) * bodBGK;                          // hartlijn van de naad tussen de afdekkingen
const bodBf = y => bodBF0 - (y - 0.946) * bodBFK;                          // voorkant van de voorste afdekking (achterrand ruit voorportier)
const bodBr = y => -0.223 - (y - 0.946) * bodBRK;                          // achterkant van de achterste afdekking (voorrand ruit achterportier)
const bodBgY = z => 0.946 + (-0.148 - z) / bodBGK;                         // hoogte waarop de naad op z ligt
const bodBfY = z => 0.946 + (bodBF0 - z) / bodBFK;                         // hoogte waarop de voorkant op z ligt (omgekeerde van bodBf)
const bodBrY = z => 0.946 + (-0.223 - z) / bodBRK;                         // idem voor de achterkant
// band op de kas tussen twee hellende lijnen z = zf - (y - 0,946) kf (voor) en z = zr - (y - 0,946) kr (achter), van de gordel tot q = qTop
function bodBand(s, zf, kf, zr, kr, out, qTop = bodQG + 0.03) {
  const yTop = 1.40, za = zr - (yTop - 0.946) * kr, zb = zf;
  return bodGhSide(s, za, zb, 12, z => {
    // onderkant op de bovenrand van de chroomband op de gordel (y van de gordel + 0,011): de zwarte afdekking en het naadrubber liepen eerst over de chroomband en de lak eronder heen
    const ylo = 0.946 + (zr - z) / kr, yhi = 0.946 + (zf - z) / kf, q0 = Math.max(bodQy(z, ylo), bodQy(z, bodGh(z).yb + 0.011));
    return [q0, Math.max(q0, Math.min(qTop, bodQy(z, yhi)))];
  }, 6, bodDense(za, zb, 22), out);
}
// gelakt buitenvlak van de B-stijl boven de gordel (onder de afdekkingen): tussen de voorkant (bodBf) en de achterkant (bodBr) van de zwarte stijl,
// aan beide kanten m = 16 mm binnen de rand, van ca. 2,4 cm boven de gordel (q 0,03, boven het onderste eind van het naadrubber) tot net boven
// de bovenrand van de ruiten. Een dichte plaat van 4 tot 9 mm binnen de kas (zes vlakken), zodat het mesh van de B-stijl gesloten blijft en
// clash er binnen-in kan meten. Door de ruit naast de stijl is de plaat pas te zien bij een kijkhoek met tan < 9 / 16 (ca. 29 graden met de zijkant);
// de vaste driekwartbeelden kijken onder ca. 41 graden. t loopt van de achterlijn (0) naar de voorlijn (1) op de hoogte van het punt.
// Onderste 10 cm: de zakkende voorste zijruit kantelt eerst en schuift dan schuin naar buiten omlaag; zijn bovenrand loopt daarbij vrijwel
// verticaal (x 0,768 op 0,97 m tot 0,761 op 1,075 m, straalproef over alle standen) door het voetspoor van de plaat en sneed de plaat
// bij ruitstand 0,6 tot 0,8 (tot 2,4 mm). Daar ligt de plaat nu 2,5 mm binnen die omhullende (bodBPEnv; tot ca. 4 cm binnen de kas,
// recht boven het profiel), daarboven zoals voorheen 4 mm binnen de kas.
const bodBPEnv = y => 0.7653 - 0.065 * (y - 0.97);
function bodBPillarFace(s, m = 0.016, o0 = -0.004, o1 = -0.009, qa = 0.03, qTop = bodQG + 0.02) {
  const zf = y => bodBF0 - m - (y - 0.946) * bodBFK, zr = y => -0.223 + m - (y - 0.946) * bodBRK;
  const pt = (t, q, o) => {
    let z = lerp(zr(1.1), zf(1.1), t);
    for (let i = 0; i < 4; i++) { const y = bodGhHalf(z, q)[1]; z = lerp(zr(y), zf(y), t); }
    const [x, y] = bodGhHalf(z, q); return [s * Math.min(x + o * (q <= bodQS ? 1 : 0.7), bodBPEnv(y) + o - o0), y + (q > bodQS ? o * 0.7 : 0), z];
  };
  const L = k => lerp(o0, o1, k), nt = 6, nq = 14;
  return merge([
    patch((t, q) => pt(t, q, o0), 0, 1, nt, () => [qa, qTop], nq), patch((t, q) => pt(t, q, o1), 0, 1, nt, () => [qa, qTop], nq),
    patch((q, k) => pt(0, q, L(k)), qa, qTop, nq, () => [0, 1], 1), patch((q, k) => pt(1, q, L(k)), qa, qTop, nq, () => [0, 1], 1),
    patch((t, k) => pt(t, qa, L(k)), 0, 1, nt, () => [0, 1], 1), patch((t, k) => pt(t, qTop, L(k)), 0, 1, nt, () => [0, 1], 1),
  ]);
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
// bovenrand van de spiegeldriehoek (golf 5h): van de bovenrand van de zijruit op bodSail recht naar de gordel op z 0,93, zoals de zwarte
// driehoek in de ruithoek op de persfoto (fase 2). Was 0,966 tot 0,93 m: een strookje van 5 cm onder een breed gelakt vlak van de A-stijl
const bodSailTop = z => lerp(bodYG(bodSail) - 0.003, YT(0.93) + 0.002, clamp((z - bodSail) / (0.93 - bodSail), 0, 1));
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
// met een donkere lijn van 9 mm tussen chroom en lak (rubber en de naad tussen raamkader en dak); daaronder het zwarte raamkader tot de ruit.
// Met 4 mm was die lijn in het zijaanzicht minder dan een pixel en las de chroomband tegen de lichte dakrail niet als lijst (S7 kenmerk 4, ronde 2)
const bodQV = 0.557, bodTW = 0.0085, bodTR = 0.009;
// gordellijst onderaan de ruit langs een pad op q = 0: schaduwlijn (3 mm) naar de lak, bolle chroomband (15 mm) en rubberlip (4 mm) naar het
// glas; samen 21 mm langs de ruit, zodat de zichtbare ruitlijn binnen de silhouetmaat blijft (ca. 2 cm boven de gordel)
function bodBeltTrim(s, path) {
  return { chrome: bodTrim(s, path, -0.0175, -0.0025, 0.003, 0.003, 8),
    rubber: merge([bodTrim(s, path, -0.021, -0.017, 0.0022, 0, 1), bodTrim(s, path, -0.003, -0.0002, 0.0022, 0, 1)]) };
}
// dunne donkere naadlijn op de onderbak langs punten (z, y): het portierrubber dat in de sluitnaad zichtbaar is
const bodSeamLine = (s, zy, w = 0.0045) => bodRibbon(s, zy, w, 0.0007, 0, 1, (z, y) => { const [x, yy] = halfPt(z, sAtY(z, y)); return [x, yy, z]; });
const bodLinZ = (a, b, n, q) => { const out = []; for (let i = 0; i <= n; i++) out.push([a + (b - a) * i / n, typeof q === 'function' ? q(a + (b - a) * i / n) : q]); return out; };
/* ---------- huidpanelen met stations naar doorbuiging ---------- */
// Kiest uit een fijne reeks punten per lijn (lines[k][i]: punt i van lijn k) de stations waartussen de rechte koorde voor alle lijnen
// tegelijk hoogstens tol van de tussenliggende fijne punten afligt; indices in 'keep' worden altijd een station. Geeft de gekozen indices.
function bodSagPick(lines, tol, keep = new Set()) {
  const n = lines[0].length, t2 = tol * tol;
  const ok = (a, c) => {
    for (const L of lines) {
      const A = L[a], dx = L[c][0] - A[0], dy = L[c][1] - A[1], dz = L[c][2] - A[2], dd = dx * dx + dy * dy + dz * dz || 1e-18;
      for (let m = a + 1; m < c; m++) {
        const px = L[m][0] - A[0], py = L[m][1] - A[1], pz = L[m][2] - A[2], t = clamp((px * dx + py * dy + pz * dz) / dd, 0, 1);
        const ex = px - t * dx, ey = py - t * dy, ez = pz - t * dz; if (ex * ex + ey * ey + ez * ez > t2) return false;
      }
    }
    return true;
  };
  const out = [0];
  for (let a = 0; a < n - 1;) { let b = a + 1; while (b + 1 < n && !keep.has(b) && ok(a, b + 1)) b++; out.push(b); a = b; }
  return out;
}
// lowSide met stations naar doorbuiging. Een fijn raster van nuF stappen in z (plus de kandidaten 'extra' en de vaste stations 'keep')
// en nvF stappen over het bereik vr(z) wordt uitgedund tot de rijen en kolommen waartussen de koorde hoogstens tol van het oppervlak
// afligt (eerst de kolommen over alle fijne rijen, dan de rijen over alle fijne kolommen). Gemeten op de linkerhelft; de rechterhelft
// krijgt dezelfde stations gespiegeld, zodat de naad op de hartlijn blijft sluiten. Met zs en vf worden de stations niet gekozen maar
// gebruikt (banden die rijen delen). Geeft geo(s) en de stations (zs, vf). Per vak kiest geo de diagonaal die het oppervlak het best volgt.
function bodSagSide(z0, z1, vr, tol, { keep = [], extra = [], nuF = 160, nvF = 96, off = 0, vf = null, zs = null } = {}) {
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  let zAll = zs;
  if (!zAll) {
    const c = [];
    for (let i = 0; i <= nuF; i++) c.push(z0 + (z1 - z0) * i / nuF);
    keep.concat(extra).forEach(b => { if (b > z0 + 1e-4 && b < z1 - 1e-4) c.push(b); });
    c.sort((a, b) => a - b); zAll = c.filter((z, i) => i === 0 || !near(z, c[i - 1]));
  }
  const fine = []; for (let j = 0; j <= nvF; j++) fine.push(j / nvF);
  let zu = zAll;
  if (!vf || !zs) {
    const grid = zAll.map(z => { const [a, b] = vr(z); return fine.map(t => bodLow(z, a + (b - a) * t, off)); });
    if (!vf) vf = bodSagPick(grid, tol).map(j => fine[j]);
    if (!zs) {
      const cols = fine.map((_, j) => grid.map(r => r[j])), keepI = new Set(zAll.map((z, i) => keep.some(k => near(k, z)) ? i : -1).filter(i => i >= 0));
      zu = bodSagPick(cols, tol, keepI).map(i => zAll[i]);
    }
  }
  const geo = s => {
    const tf = s > 0 ? vf : vf.map(t => 1 - t).reverse(), pos = [], idx = [], rows = tf.length;
    for (const z of zu) { const [a, b] = sideR(s, ...vr(z)); for (const t of tf) pos.push(...bodLow(z, a + (b - a) * t, off)); }
    // per vak de diagonaal waarvan het midden het dichtst bij het oppervlak in het midden van het vak ligt
    const d2 = (k, l, c) => { let q = 0; for (let e = 0; e < 3; e++) { const m = (pos[3 * k + e] + pos[3 * l + e]) / 2 - c[e]; q += m * m; } return q; };
    for (let i = 0; i < zu.length - 1; i++) {
      const zm = (zu[i] + zu[i + 1]) / 2, [ma, mb] = sideR(s, ...vr(zm));
      for (let j = 0; j < rows - 1; j++) {
        const a = i * rows + j, b = a + rows, c = bodLow(zm, ma + (mb - ma) * (tf[j] + tf[j + 1]) / 2, off);
        if (d2(b, a + 1, c) <= d2(a, b + 1, c)) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, b, b + 1, a, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  return { geo, zs: zu, vf };
}
/* ---------- portieren ---------- */
// pad van het portierrubber (z, y), 2 cm binnen de portierrand: voorrand (schuin bij het voorportier), bovenkant op de
// gordelhoogte en achterrand; bij het achterportier volgt de achterrand de naad die om de achterwielboog naar voren loopt
function bodSealPts(isFront, z0, z1) {
  const pts = [], fz = y => isFront ? bodFDF(y) - 0.02 : z1 - 0.02;
  for (const y of [0.33, 0.47, 0.61, 0.75, 0.84, 0.88]) pts.push([fz(y), y]);
  for (const u of [0.15, 0.3, 0.5, 0.7, 0.85]) pts.push([lerp(fz(0.88), z0 + 0.012, u), 0.88]);
  if (isFront) { for (const y of [0.88, 0.84, 0.75, 0.61, 0.47, 0.33]) pts.push([z0 + 0.012, y]); return pts; }
  pts.push([z0 + 0.012, 0.88]);
  for (const z of [-1.235, -1.20, -1.15, -1.10, -1.05, -1.0, -0.95, -0.90, -0.85, -0.80, -0.75, -0.70]) pts.push([z, bodRDloZ(z) + 0.022]);
  return pts;
}
// draaias van een portier: de lijn door de twee scharnierpennen (uitleg bij de scharnieren in buildDoor). Los, zodat de kwartsruit in het
// raamkader van het achterportier om dezelfde as kan meedraaien.
function bodDoorAxis(s, isFront) {
  const z1 = isFront ? 0.903 : -0.153;
  const pinAt = y => { if (isFront) { const zf = bodFDF(y); return [s * (surfX(zf, y) - 0.016), y, zf + 0.016]; } return [s * (surfX(z1, y) - 0.0065), y, z1 + 0.0063]; };
  const pins = [pinAt(isFront ? 0.76 : 0.74), pinAt(isFront ? 0.45 : 0.50)];
  const d = [0, 1, 2].map(i => pins[0][i] - pins[1][i]), l = Math.hypot(...d);
  return { pins, pv: pins[1], ax: d.map(v => v / l), ang: -s * (isFront ? 67 : 62) * PI / 180 }; // voorportier 67 graden: RiDC, gradenboog op een Laguna Grandtour Initiale 2011
}
function buildDoor(s, isFront) {
  const n = sn(s), pos = isFront ? 'voor' : 'achter', tag = n + pos;
  const z0 = isFront ? -0.143 : -1.266, z1 = isFront ? 0.903 : -0.153;
  const lo = isFront ? bodFDlo : bodRDloZ;
  const vr = z => [bodSY(z, lo(z) + 0.002), S4 - 0.0008];
  const br = isFront ? bodDense(0.82, 0.903, 8) : bodDense(-1.266, -0.62, 14).concat([-0.665]);
  const nO = 40, nI = 22; // het fijnere gaas langs de wielboog van herstelronde 2 kostte 12.000 driehoeken voor een kleine winst (budget Carrosserie 190.000)
  // achterste punt van de botsbalk: bij het achterportier vóór de naad om de wielboog; de balk ligt daar op 0,43 m en begint bij z -0,78, zodat hij niet onder de onderrand van het portier uitsteekt
  const zm = (z0 + z1) / 2, za = isFront ? z0 + 0.06 : -0.90, zb = z1 - 0.06;
  const outer = lowSide(s, z0, z1, nO, vr, 26, br);
  const inner = lowSide(s, z0 + 0.012, z1 - 0.012, nI, z => [bodSY(z, lo(z) + 0.02), S4 - 0.012], 12, br, 0.095);
  const trimP = lowSide(s, z0 + 0.02, z1 - (isFront ? 0.10 : 0.02), nI, z => [bodSY(z, Math.max(lo(z) + 0.03, 0.36)), S4 - 0.03], 12, br, 0.125);
  const P3 = (z, y, inw) => { const p = bodAt(z, y, -inw); return [s * p[0], p[1], p[2]]; };
  const xin = z => s * (surfX(z, 0.6) - 0.04);
  // zijruit: tussen B-stijl, A-stijl/spiegeldriehoek of het schuine stijltje
  const gb = z => bodYG(z) - 0.002;
  let glass, gz0, gz1;
  if (isFront) {
    // aan de B-stijl 4 mm onder de zwarte afdekking door (zie de achterruit hieronder); gz0 en daarmee de kolommen bij de spiegel blijven gelijk
    gz0 = bodBf(1.33) + 0.004; gz1 = bodSail - 0.004;
    glass = bodGhSide(s, gz0, gz1, 30, z => { const yl = z < bodBf(0.946) - 0.004 ? bodBfY(z + 0.004) : 0; return [Math.max(0.006, bodQy(z, yl)), bodQG]; }, 10, bodDense(gz0, -0.14, 5));
  } else {
    // aan de B-stijl loopt de ruit 4 mm onder de zwarte afdekking door: met een spleet van 4 mm (eerst afgedekt door een chroomlijst over de hele
    // hoogte) was de lichte B-stijlbekleding binnen als witte lijn langs de stijl te zien
    gz0 = bodQd(1.30) + 0.016; gz1 = bodBr(0.95) + 0.004;
    glass = bodGhSide(s, gz0, gz1, 30, z => {
      const yHi = z > bodBr(1.376) + 0.004 ? bodBrY(z - 0.004) : 9, yLo = z < -0.93 ? 0.97 + (-0.93 + 0.016 - z) * 0.33 / 0.06 : 0;
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
  const ringGeo = bodTrim(s, topPath, -bodTW, bodTW, 0.0035, 0.003, 8);
  // langs de voorrand bij de spiegeldriehoek geen chroom meer maar een zwarte lijst van 2 x bodTW plus 4 mm (golf 5h): de staande chroomstreep las in
  // driekwartbeelden als witte streep naast de A-stijl; op de persfoto loopt de zwarte driehoek daar door tot de ruit
  const ringRub = merge([bodTrim(s, topPath, -bodTW - bodTR, -bodTW + 0.0005, 0.0026, 0, 1)].concat(isFront ? [bodTrim(s, sailPath, -bodTW, bodTW + 0.004, 0.0026, 0, 2)] : []));
  // gordellijst onderaan de ruit: bolle chroomband van 15 mm met een donkere rubberlijn naar het glas en een schaduwlijn naar de lak
  const beltPath = bodLinZ(zB0, zB1, 30, 0);
  const { chrome: beltGeo, rubber: beltRub } = bodBeltTrim(s, beltPath);
  const handleZ = isFront ? 0.03 : -1.015, handleY = isFront ? 0.80 : 0.84;
  // slot in de achterrand van het portier: binnen de rand, bij het achterportier voor de voorrand van het achterscherm (dat tot z -1,17 doorloopt),
  // zodat het niet door het aangrenzende paneel zwaait
  const lkZ = z0 + (isFront ? 0.04 : 0.125);
  const hp = bodAt(handleZ, handleY, 0.012), hn = bodNormalAt(handleZ, handleY);
  // een sierlijst per portier; de lijsten van voor- en achterportier liggen in een lijn en raken elkaar bijna bij de sluitnaad.
  // Achterportier: begint ca. 5 cm voor de achterrand van het portier (die daar om de wielboog zwaait), ruim buiten de wielboog
  const mA = isFront ? -0.137 : -0.955, mB = isFront ? 0.82 : -0.158, lijst = bodLijst(s, mA, mB, false, isFront);
  const mBr = bodDense(mA, mA + 0.04, 6).concat(bodDense(mB - (isFront ? 0.11 : 0.04), mB, isFront ? 12 : 6));
  const lijstP = (t0, t1, nv, extra) => patch((z, t) => lijst(z, t, extra), mA, mB, 34, () => [t0, t1], nv, mBr);
  // openen: het portier draait om de lijn door de twee scharnierpennen (hPv, hAx bij de scharnieren hieronder), vlak voor de voorrand
  // en net binnen de huid (asregel: aan de scharnierzijde, buiten de omtrek van het portier). Linkerportieren draaien met een negatieve hoek naar buiten.
  const dName = `Portier ${n}${pos}`, dPath = `Renault Laguna III/Carrosserie/${dName}`;
  const dDrop = isFront ? 0.40 : 0.31, dDropMin = isFront ? 0.35 : 0.26;                     // zijruit omlaag in het portier (achter schuin, slag 0,314)
  // het glas zakt voor 2,7 cm naar buiten (voorportier, was 5 cm) of recht omlaag (achterportier): ter hoogte van de gordellijn blijft het dan tussen de binnenste
  // raamrubber (x 0,78) en de bovenrand van het buitenpaneel (x 0,812) in plaats van door die bovenrand te schuiven
  // Achterportier: de ruit loopt in de geleiding van de B-stijl en zakt dus schuin mee met de stijl (helling bodBRK, 4,8 cm naar voren over de
  // volle slag). Recht omlaag bleef de voorrand van de gezakte ruit op de gordel ca. 5 cm achter de B-stijl en zag je daar de bekleding binnen
  // (poort ronde 2, beeld 15); de achterrand blijft onder het schuine stijltje (dat helt iets sterker, ca. 9 mm verschil over de slag).
  const kSl = isFront ? 0 : bodBRK;
  const winSlide = extra => ({ type: 'slide', move: [s * (isFront ? 0.027 : 0), -dDrop, dDrop * kSl], tilt: { pivot: [s * 0.811, isFront ? 0.94 : 0.972, 0.3], axis: [0, 0, 1], angle: -s * 0.244, part: 0.3 }, ...extra });
  // sluitnaden: voorportier voorrand (schuin) en de naad tussen de portieren; achterportier achterrand om de wielboog
  const yBelt = z => YT(z) - 0.004, ls = (a, b, n) => bodDense(a, b, n).concat([b]);
  const seams = isFront ? [bodSeamLine(s, [0.312].concat(ls(0.312, 0.9, 14)).map(y => [bodFDF(y + 0.001), y]).filter(([z, y]) => y < yBelt(z))), bodSeamLine(s, [0.31].concat(ls(0.31, yBelt(-0.148), 12)).map(y => [-0.148, y]), 0.0105)]
    : [bodSeamLine(s, [-0.666].concat(ls(-0.666, -1.2665, 30)).map(z => [z, bodRDloZ(z) - 0.001]).concat(ls(0.878, yBelt(-1.2665), 4).map(y => [-1.2665, y])))];
  // portierscharnier als plat gesmeed blad in lakkleur (meegelakt met de carrosserie): het portierblad ligt plat op de voorste sluitrand
  // van het portier, het carrosserieblad plat op de stijl, en elk blad heeft een oog om de stalen pen (portierblad boven, carrosserieblad onder).
  // De pennen van beide scharnieren liggen op een lijn en die lijn is de draaias van het portier (open.pivot en open.axis), zodat beide ogen
  // in elke stand om de pen liggen. Lokaal assenstelsel per scharnier: oorsprong op het hart van de pen, y langs de as, x naar buiten, z naar voren.
  // Ligging van de as: de buitenkant van de voorrand blijft bij het openen buiten de huid zolang de as minstens tan(hoek/2) maal zijn diepte
  // voor de voorrand ligt (67 graden: 0,66 maal). Een diepere pen laat de voorrand onder het voorscherm of door het voorportier zwaaien.
  // Voorportier: pen 16 mm binnen de huid en 16 mm voor de schuine voorrand (bodFDF), 6 graden voorover zoals de voorrand (de zijkant is bol,
  // dus halverwege ligt de rechte as 21 mm diep: 16 mm naar voren houdt de voorrand daar buiten het scherm); het oog blijft onder
  // het voorscherm, dat langs zijn achterrand boven 0,8 m tot 5 mm naar binnen buigt (bovenste scharnier daarom op 0,76 m in plaats van 0,79 m);
  // het carrosserieblad staat evenwijdig aan het portierblad voor de pen (op de plaats van de A-stijl achter het voorscherm).
  // Achterportier: pen 6,5 mm binnen de huid in de naad tussen de portieren (10 mm aan de huid, naar binnen breder door de schuine sluitranden),
  // 6,3 mm voor de voorrand (z -0,1467), onder het naadrubber van het voorportier; met een pen op de B-stijl zwaaide de voorrand door het
  // voorportier. Klein oog (4 mm, pen 2,5 mm) zodat het in de naad past; scharnieren op 0,50 en 0,74 m, zodat de rechte as ook bij de bolling
  // van de zijkant (0,55 tot 0,62 m) hoogstens 10 mm diep ligt. Het carrosserieblad ligt plat op de buitenkant van de B-stijl (x 0,76),
  // 12 graden gekanteld zoals de stijl, met een arm door de naad naar de pen. Een portierblad heeft zijn verbinding met het oog alleen aan de kant van zijn eigen oog, zodat het
  // oog van het andere blad vrij draait; tussen de ogen 1 mm.
  const dAx = bodDoorAxis(s, isFront), hPins = dAx.pins, hPv = dAx.pv, hAx = dAx.ax;
  const hTilt = Math.atan2(hAx[2], hAx[1]), hRoll = Math.asin(-hAx[0]), hSlant = -s * Math.atan(0.012 / 0.095);
  const eR = isFront ? 0.0075 : 0.004, pR = isFront ? 0.004 : 0.0025, eL = 0.025, eY = 0.0135;
  const eye = dy => xf(G.cyl('y', eR, eR, eL, 12), [0, dy, 0]);
  const doorHinge = (h, pin) => {
    // lokaal naar wereld zoals r: [hTilt, 0, hRoll] (Euler XYZ: eerst de rol om z, dan de helling om x)
    const R = (lx, ly, lz) => { const x1 = lx * Math.cos(hRoll) - ly * Math.sin(hRoll), y1 = lx * Math.sin(hRoll) + ly * Math.cos(hRoll); return [pin[0] + x1, pin[1] + y1 * Math.cos(hTilt) - lz * Math.sin(hTilt), pin[2] + y1 * Math.sin(hTilt) + lz * Math.cos(hTilt)]; };
    let doorGeo, bodyGeo, boltAt, boltR;
    if (isFront) {
      // bladen van 6 tot 53 mm naar binnen, 8,5 mm achter (portier) en voor (carrosserie) de pen, met een korte verbinding naar het oog alleen
      // aan de eigen kant; zo reikt het portierblad open hoogstens 8 mm van de pen naar buiten en blijft het onder het voorscherm
      doorGeo = merge([xf(G.box(0.047, 0.055, 0.004), [-s * 0.0295, 0, -0.0085]), xf(G.box(0.0045, eL, 0.003), [-s * 0.00425, eY, -0.006]), eye(eY)]);
      bodyGeo = merge([xf(G.box(0.047, 0.055, 0.004), [-s * 0.0295, 0, 0.0085]), xf(G.box(0.0045, eL, 0.003), [-s * 0.00425, -eY, 0.006]), eye(-eY)]);
      boltAt = dy => R(-s * 0.036, dy, -0.0065); boltR = [hTilt, PI, 0];
    } else {
      // portierblad plat op de schuine voorste sluitrand (z = -0,153 - 0,126 maal de diepte), 1 mm ervoor, van de pen 55 mm naar binnen;
      // d is de diepte onder de pen. Carrosserieblad: plaat op de B-stijl en een arm 2 mm voor de pen door de naad.
      const L = 0.055, zAt = d => -0.00412 - 0.126 * d, d0 = eR + 0.0015, bx = Math.abs(pin[0]) - 0.7635;
      doorGeo = merge([xf(G.box(L - d0, 0.055, 0.004), [-s * (L + d0) / 2, 0, zAt((L + d0) / 2)], [0, hSlant, 0]), xf(G.box(d0 + 0.001, eL, 0.004), [-s * (d0 + 0.001) / 2, eY, zAt(d0 / 2)], [0, hSlant, 0]), eye(eY)]);
      bodyGeo = merge([xf(G.box(0.004, 0.055, 0.018), [-s * bx, 0, 0.002], [-0.21, 0, 0]), xf(G.box(bx - 0.002, eL, 0.004), [-s * (bx + 0.002) / 2, -eY, 0.002]), eye(-eY)]);
      boltAt = dy => R(-s * 0.04, dy, zAt(0.04) + 0.002); boltR = [0, PI + hSlant, 0];
    }
    const pr = { p: pin, r: [hTilt, 0, hRoll] };
    return A(`Scharnier ${h}`, { d: `${h === 'boven' ? 'Bovenste' : 'Onderste'} portierscharnier: een plat blad op de stijl (carrosserie) en een plat blad op de sluitrand van het portier, met een stalen scharnierpen; de bladen zijn meegelakt in de carrosseriekleur. Het portier draait om de lijn door de twee pennen.`, ex: [-s * 0.03, 0, 0.12] }, [
      P('Scharnierblad', doorGeo, MAT.paintIn, { d: 'Plat gesmeed scharnierblad met oog om de pen, op de voorste sluitrand van het portier geschroefd en meegelakt; draait met het portier mee.', ...pr, ex: [0, 0, 0.04] }),
      P('Scharnierblad carrosserie', bodyGeo, MAT.paint, { d: `Plat gesmeed scharnierblad met oog om de pen, geschroefd op de ${isFront ? 'A-stijl' : 'B-stijl'} en meegelakt in de carrosseriekleur; blijft staan als het portier opent.`, ...pr, stay: true, ex: [0, 0, 0.04] }),
      P('Scharnierpen', G.cyl('y', pR, pR, 0.064, 10), MAT.steel, { d: 'Stalen scharnierpen door de ogen van beide bladen; steekt boven en onder een paar millimeter uit.', ...pr, stay: true, ex: [0, 0.05, 0] }),
      // bouten loodrecht op het portierblad, kop op het blad (voorheen dwars in x); uitklappen langs hun eigen as, van het blad af
      ...[0.017, -0.017].map((dy, i) => P(`Scharnierbout ${i + 1}`, hexBolt(0.004, 0.008, 'z'), MAT.steel, { d: 'Bout M8 waarmee het scharnierblad aan het portier vastzit.', p: boltAt(dy), r: boltR, ex: [0, 0, 0.05] })),
    ]);
  };
  // sluitrand met dikte: gevouwen rand die het buitenpaneel langs de onderrand en de zijranden met het binnenpaneel verbindt (geen enkelwandige snijrand)
  const eIn = 0.095, pp = sv => (s > 0 ? sv : 2 - sv), sTop = S4 - 0.004;
  const edgeBottom = patch((z, t) => bodLow(z, pp(bodSY(z, lo(z) + 0.002 + 0.018 * t)), eIn * t), z0 + 0.012, z1 - 0.012, 30, () => [0, 1], 2, br);
  const edgeV = (zo, zi) => patch((u, t) => bodLow(lerp(zo, zi, t), pp(lerp(bodSY(zo, lo(zo) + 0.002), sTop, u)), eIn * t), 0, 1, 8, () => [0, 1], 2);
  const doorEdge = merge([edgeBottom, edgeV(z0, z0 + 0.012), ...(isFront ? [] : [edgeV(z1, z1 - 0.012)])]);
  const kids = [
    P('Buitenpaneel', outer, MAT.paint, { d: `Geperste plaatstalen buitenhuid van het ${pos}portier, zilvergrijs metallic gelakt.`, ex: [s * 0.4, 0.14, 0.5] }),
    P('Portierrand', doorEdge, MAT.paintIn, { d: 'Gevouwen rand rondom het portier (onderkant en zijkanten) die buitenpaneel en binnenpaneel verbindt; zo heeft de sluitrand dikte.', ex: [-s * 0.1, -0.06, 0] }),
    P('Binnenpaneel', inner, MAT.paintIn, { d: 'Draagframe van het portier waarop raammechaniek, slot, luidspreker en bekleding vastzitten.', ex: [0, 0, 0] }),
    P('Zijdelingse botsbalk', tube(isFront ? [[xin(za) * 1.0, 0.37, za], [xin(zm), 0.4, zm], [xin(zb), 0.43, zb]] : [[xin(-0.78), 0.43, -0.78], [xin(zm), 0.435, zm], [xin(zb), 0.44, zb]], 0.018, 16, 10), MAT.steel, { d: 'Hogesterktestalen buis in het portier die bij een zijaanrijding de indringing beperkt.', inner: !isFront, ex: [s * 0.22, 0, 0.3] }),
    P('Waterscherm', lowSide(s, z0 + 0.05, z1 - 0.05, 12, z => [bodSY(z, Math.max(lo(z) + 0.05, 0.4)), bodSY(z, 0.86)], 6, br, 0.075), MAT.plastic, { d: 'Kunststof folie tussen binnenpaneel en bekleding die vocht uit de bekleding houdt.', ex: [-s * 0.14, 0.12, -0.26] }),
    P('Zijruit', glass, MAT.bodGlassSide, { d: 'Zakbare zijruit van gehard veiligheidsglas. Zakt elektrisch in het portier; ' + (isFront ? 'de zijruit gaat bijna volledig omlaag.' : 'de zijruit blijft een stukje boven de gordellijn staan (de wielkast beperkt de diepte).'), ex: [0, 0.32, 0],
      open: winSlide({ min: dDropMin, label: `Zijruit ${n}${pos}`, look: { dir: [s * 1, 0.7, isFront ? 0.4 : 0.15], nodes: [dName] } }) }),
    A('Raamlijsten en sierlijsten', { d: 'Chromen raamomlijsting, gordelsierlijst met rubber en de zijsierlijst met aluminium inzet.', ex: [s * 0.52, 0.04, 0.1] }, [
    P('Chroomlijst raamomlijsting', ringGeo, MAT.bodChrome, { d: 'Zilverchromen band langs de bovenrand van de ruit (Initiale Paris: cerclage chromé).', ex: [s * 0.05, 0.12, 0] }),
    P('Raamrubber boven', topBand, MAT.bodPillar, { d: 'Zwart rubber en kader tussen de ruit en de dakrail, waarop de chroomlijst ligt.', ex: [s * 0.03, 0.08, 0] }),
    P('Rubberlijn raamomlijsting', ringRub, MAT.bodPillar, { d: isFront ? 'Smalle zwarte rubberlijn tussen de chromen raamomlijsting en de lak van de dakrail, en een zwarte lijst langs de voorrand van de ruit bij de spiegeldriehoek.' : 'Smalle zwarte rubberlijn tussen de chromen raamomlijsting en de lak van de dakrail.', ex: [s * 0.04, 0.1, 0] }),
    !isFront && P('Chroomlijst raamstijl', merge([bodQdBand(s, 0.03, bodQV - bodTW + 0.001, -0.0245, -0.0105, 0.0025, 0.0015, 14, 4), bodQdBand(s, 0.03, bodQV - bodTW + 0.001, 0.0105, 0.0245, 0.0025, 0.0015, 14, 4)]), MAT.bodChrome, { d: 'Twee smalle chroomlijsten langs de randen van het schuine stijltje, zodat de chromen omlijsting rond de portierruit en rond de kwartsruit doorloopt.', ex: [s * 0.05, 0.1, -0.04] }),
    // De B-stijl zelf blijft zwart zonder chroom: met een chroomlijst over de hele hoogte aan beide kanten (golf 5b-3 E3) las de stijl als
    // dubbele witte lijn, en ook de korte chromen eindstukken in de bovenhoeken (golf 5f ronde 2) lazen als twee lichte strepen naast een dunne
    // zwarte stijl (S7 kenmerk 4). De chroomlijst loopt alleen langs de bovenrand van de ruiten, over de afdekkingen tot de naad ertussen.
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
      P('Geleiderail voor', rodBetween([xin(zm + 0.16), 0.42, zm + 0.16 + 0.48 * kSl], [xin(zm + 0.16), 0.9, zm + 0.16], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, 0.05] }),
      P('Geleiderail achter', rodBetween([xin(zm - 0.16), 0.42, zm - 0.16 + 0.48 * kSl], [xin(zm - 0.16), 0.9, zm - 0.16], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, -0.05] }),
      P('Ruitdrager', G.rbox(0.02, 0.03, 0.36, 0.006), MAT.darkSteel, { d: 'Drager waarop de onderrand van de zijruit is geklemd; zakt mee met de ruit.', p: [xin(zm), 0.848, zm], ex: [0, 0.08, 0], open: winSlide({ follow: `${dPath}/Zijruit` }) }),
      P('Bedieningskabels', merge([rodBetween([xin(zm + 0.16), 0.9, zm + 0.16], [xin(zm - 0.16), 0.42, zm - 0.16 + 0.48 * kSl], 0.003, 6), rodBetween([xin(zm - 0.16), 0.9, zm - 0.16], [xin(zm + 0.16), 0.42, zm + 0.16 + 0.48 * kSl], 0.003, 6)]), MAT.steel, { d: 'Staalkabels die de ruitdrager langs de rails trekken.', ex: [-s * 0.03, 0, 0] }),
      P('Raammotor', merge([G.cyl('x', 0.032, 0.032, 0.045, 20), xf(G.cyl('x', 0.022, 0.022, 0.03, 16), [-0.035, 0, 0])]), MAT.darkSteel, { d: 'Elektromotor met kabeltrommel van de elektrische ruitbediening.', p: [xin(zm), 0.5, zm], s: [s, 1, 1], ex: [-s * 0.06, -0.06, 0] }),
    ]),
    A('Deurslot', { d: 'Slotmechanisme in de achterrand van het portier met elektrische centrale vergrendeling.', ex: [-s * 0.08, 0, -0.16] }, [
      P('Slotkast', G.rbox(0.03, 0.1, 0.04, 0.008), MAT.darkSteel, { d: 'Slotkast met vanghaak die om de slotbeugel in de stijl grijpt; zit binnen de achterrand van het portier, zodat hij bij het openen niet door het aangrenzende paneel zwaait.', p: [s * (surfX(lkZ, 0.78) - 0.022), 0.78, lkZ], ex: [0, 0, -0.04] }),
      P('Slotmotor', G.rbox(0.03, 0.05, 0.04, 0.008), MAT.plastic, { d: 'Elektrische stelmotor van de centrale vergrendeling.', p: isFront ? [s * (surfX(lkZ + 0.02, 0.72) - 0.025), 0.72, lkZ + 0.02] : [s * (surfX(lkZ + 0.045, 0.765) - 0.025), 0.765, lkZ + 0.045], ex: [-s * 0.04, -0.03, 0] }),
      P('Bedieningsstang', rodBetween([s * (surfX(lkZ + 0.02, 0.78) - 0.035), 0.79, lkZ + 0.02], [s * (hp[0] - 0.035), handleY, handleZ - 0.04], 0.003, 6), MAT.steel, { d: 'Stang tussen buitendeurgreep en slot.', ex: [-s * 0.03, 0, 0] }),
    ]),
    A('Buitendeurgreep', { d: 'Trekgreep in carrosseriekleur met chroomaccent (Initiale Paris).', ex: [s * 0.62, 0, 0] }, [
      P('Greepschaal', G.rbox(0.026, 0.034, 0.2, 0.012), MAT.paint, { d: 'Greep in carrosseriekleur.', ...bodPose(s, hp, hn) }),
      P('Chroomaccent greep', G.rbox(0.006, 0.006, 0.18, 0.002), MAT.chrome, { d: 'Verchroomde sierstrip op de greep.', ...bodPose(s, [hp[0] + hn[0] * 0.013, hp[1] + 0.012, hp[2]], hn), ex: [0, 0.03, 0] }),
      P('Greepdrager', G.rbox(0.03, 0.05, 0.24, 0.006), MAT.plastic, { d: 'Kunststof drager achter de buitenhuid waarin de greep scharniert.', ...bodPose(s, bodAt(handleZ, handleY, -0.02), hn), ex: [-s * 0.05, 0, 0] }),
    ]),
    A('Deurbekleding', { d: 'Binnenbekleding van het portier met armsteun, schakelaars, binnengreep en luidsprekerrooster.', ex: [-s * 0.52, 0, -0.68] }, [
      P('Bekledingspaneel', trimP, MAT.dash, { d: 'Gespoten kunststof bekledingspaneel met stoffen inzet.', ex: [0, 0, 0] }),
      P('Armsteun', G.rbox(0.07, 0.045, isFront ? 0.34 : 0.30, 0.018), MAT.leather, { d: 'Met leder beklede armsteun.', p: [s * (surfX(zm, 0.64) - 0.14), 0.64, zm - 0.05], ex: [-s * 0.06, 0, 0] }),
      P(isFront ? 'Schakelpaneel' : 'Raamschakelaar', G.rbox(0.05, 0.02, isFront ? 0.14 : 0.06, 0.006), MAT.plastic, { d: isFront ? 'Schakelaars voor ramen en buitenspiegels.' : 'Schakelaar van de elektrische ruit achter.', p: [s * (surfX(zm, 0.67) - 0.15), 0.673, zm + 0.02], ex: [-s * 0.04, 0.04, 0] }),
      P('Binnendeurgreep', G.rbox(0.02, 0.03, 0.12, 0.008), MAT.satin, { d: 'Verchroomde binnengreep met bowdenkabel naar het slot.', p: [s * (surfX(z0 + 0.22, 0.8) - 0.115), 0.8, z0 + 0.22], ex: [-s * 0.06, 0, 0] }),
      P('Luidsprekerrooster', G.lathe('x', [[0, 0.004], [0.075, 0.004], [0.08, 0], [0, 0]], 24, 'bodGrill'), MAT.plasticGrey, { d: 'Rooster voor de luidspreker in de bekleding.', p: [s * (surfX(zm, 0.42) - 0.115), 0.42, isFront ? z1 - 0.3 : zm], r: [0, 0, s > 0 ? PI : 0], ex: [-s * 0.05, 0, 0] }),
    ]),
    P('Luidspreker', G.lathe('x', [[0, 0.02], [0.03, 0.018], [0.07, 0.002], [0.08, 0], [0.08, -0.02], [0.03, -0.02], [0, -0.02]], 20, 'bodSpk'), MAT.plastic, { d: 'Luidspreker van het audiosysteem in het portier.', p: [s * (surfX(zm, 0.42) - 0.09), 0.42, isFront ? z1 - 0.3 : zm], r: [0, 0, s > 0 ? PI : 0], ex: [-s * 0.26, 0, 0] }),
    P('Portierrubber', merge([...seams, tube(bodSealPts(isFront, z0, z1).map(([z, y]) => P3(z, y, 0.05)), 0.008, 72, 6)]), MAT.rubber, { d: 'Rubber afdichting rondom de portieropening; in de sluitnaden van buiten zichtbaar als dunne donkere lijn.', ex: [-s * 0.26, -0.1, -0.46] }),
    P('Deurvanger', G.rbox(0.012, 0.03, 0.2, 0.004), MAT.darkSteel, { d: 'Vanger die het portier in twee standen openhoudt.', p: [s * (surfX(z1 - 0.1, 0.62) - 0.022), 0.62, z1 - 0.1], ex: [-s * 0.05, 0, 0.06] }),
    A('Scharnieren', { d: 'Twee portierscharnieren aan de voorrand met elk twee bouten.', ex: [-s * 0.04, 0, 0.1] }, [doorHinge('boven', hPins[0]), doorHinge('onder', hPins[1])]),
  ];
  // B-stijlafdekking: zwart raamkader van dit portier aan de B-stijlzijde, de naad ertussen in lijn met de sluitnaad onder de gordel.
  // Golf 5f ronde 3 (S7 kenmerk 4): elke afdekking loopt bodBRW verder over de rand van de ruit (het runkanaal van het raamkader), zodat het
  // zwarte vlak op de gordel ca. 12,8 cm breed is (bovenaan ca. 11 cm) en de lichte bekleding en de stoelen binnen niet direct langs de stijl
  // als lichte streep lezen. De ruitranden zelf (bodBf, bodBr) blijven waar ze waren; de ruit loopt nu 4 mm plus bodBRW onder de afdekking.
  kids.push(P('Afdekking B-stijl', isFront ? bodBand(s, bodBF0 + bodBRW, bodBFK, -0.148 + bodBGW, bodBGK, 0.002) : bodBand(s, -0.148 - bodBGW, bodBGK, -0.223 - bodBRW, bodBRK, 0.002), MAT.bodPillarGloss,
    { d: isFront ? 'Hoogglans zwarte afdekking (weergegeven als mat zwart) op het raamkader van het voorportier, de voorste helft van de zwarte B-stijl, licht naar achteren hellend; dekt ook het runkanaal langs de achterrand van de ruit af.' : 'Hoogglans zwarte afdekking (weergegeven als mat zwart) op het raamkader van het achterportier, de achterste helft van de zwarte B-stijl; dekt ook het runkanaal langs de voorrand van de ruit af.', ex: [s * 0.06, 0.04, 0] }));
  if (isFront) kids.push(P('Naadrubber B-stijl', bodBand(s, -0.148 + bodBGW + 0.001, bodBGK, -0.148 - bodBGW - 0.001, bodBGK, 0.0008), MAT.bodPillar, { d: 'Mat zwart rubber in de naad tussen de twee B-stijlafdekkingen, in het verlengde van de sluitnaad onder de gordel.', ex: [s * 0.03, 0.02, 0] }));
  if (isFront) {
    kids.push(P('Spiegeldriehoek', bodGhSide(s, bodSail, 0.93, 8, z => [0.004, Math.min(bodQS - 0.02, bodQy(z, bodSailTop(z)))], 6, [], 0.001), MAT.bodPillar, { d: 'Zwarte driehoekige afdekplaat tussen zijruit en A-stijl waarop de spiegel staat.', ex: [s * 0.05, 0.05, 0.03] }));
    kids.push(buildMirror(s));
  } else {
    // schuin stijltje tussen zakbare ruit en kwartsruit (zijfoto fase 2: zwarte balk van ca. 3 cm met chroom langs beide ruiten): hoogglans zwart,
    // 35 mm breed in z, waarvan ca. 21 mm tussen de chroomranden zichtbaar blijft; loopt van onder de gordellijst tot onder de bovenste chroomband
    kids.push(P('Raamstijl achter', bodQdBand(s, 0.004, bodQV - bodTW + 0.001, -0.0175, 0.0175, 0.0015, 0, 14, 2), MAT.bodPillarGloss, { d: 'Schuin hoogglans zwart stijltje in het raamkader tussen de zakbare ruit en de vaste kwartsruit.', ex: [s * 0.05, 0.08, 0] }));
  }
  return A(dName, { d: `Compleet ${pos}portier aan de ${n}kant: plaatwerk, ruit, raambediening, slot, greep, bekleding en scharnieren.`, ex: [s * 0.78, 0.02, isFront ? 0.16 : -0.16],
    open: hinge(hPv, hAx, dAx.ang, { min: (isFront ? 60 : 55) * PI / 180, label: dName, look: { dir: [s * 1, 0.4, isFront ? 0.12 : -0.6], nodes: isFront ? [dName, `Portier ${n}achter`] : [dName] } }) }, kids); // camera van buiten: voor het voorportier haaks op de zij, iets van voren (de lakzijde van de B-stijl met sluitplaat en slotbeugel kijkt naar voren), voor het achterportier vanachter de achterrand: dorpel, stijl, sluitrand en interieur in beeld
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
  return A(`Buitenspiegel ${n}`, { d: 'Elektrisch verstelbare, verwarmde en elektrisch inklapbare buitenspiegel in carrosseriekleur (Initiale Paris met geheugen). Klapt ongeveer 80 graden naar achteren (hoek geschat).', ex: [s * 0.32, 0.12, 0.08],
    open: hinge([s * 0.95, 0.94, 0.74], [0, 1, 0], s * 80 * PI / 180, { min: 64 * PI / 180, label: `Buitenspiegel ${n}`, look: { dir: [s * 0.8, 0.3, 0.75], nodes: [`Buitenspiegel ${n}`] } }) }, [
    // voet als smalle plaat tussen portier en de binnenkant van het spiegelhuis (x 0,8085 tot 0,8245, achter de voorkant van de kap): als blok van
    // 9 x 5 x 7 cm voor de kap las hij in vooraanzicht als los zwart blokje onder de spiegel (S7, golf 5f ronde 2)
    P('Spiegelvoet', G.rbox(0.016, 0.032, 0.1, 0.005), MAT.bodPillar, { d: 'Voet met bevestigingsplaat op het portier aan de binnenkant van het spiegelhuis; blijft staan als de spiegel inklapt (plaats geschat).', p: M(0.8165, 0.941, 0.75), stay: true, ex: [-s * 0.05, -0.05, 0] }),
    P('Spiegelkap', cache('bodMirCapT' + k, () => bodLoft(s, [[1, 0], [1, 0.03], [0.95, 0.07], [0.8, 0.11], [0.5, 0.135], [0.12, 0.145]], true)), MAT.paint, { d: 'Kap in carrosseriekleur aan de voorzijde van het spiegelhuis.', p: M(cx, cy, 0.668), ex: [0, 0.02, 0.1] }),
    P('Spiegelhuis', cache('bodMirRimT' + k, () => bodLoft(s, [[0.93, -0.004], [1.01, -0.004], [1.01, 0.012]], false)), MAT.paint, { d: 'Kunststof huis in carrosseriekleur met een rand rond het glas, dat glas, motoren en verwarming draagt.', p: M(cx, cy, 0.664), ex: [0, 0, -0.02] }),
    P('Spiegelglas', cache('bodMirGlT' + k, () => { const g = new THREE.ShapeGeometry(shapeOf(bodMirOutline().map(([u, v]) => [s * u * 0.93, v * 0.93]))); return g; }), MAT.bodMirror, { d: 'Bol spiegelglas in de spiegelkap, waarin de bestuurder het verkeer naast en schuin achter de auto ziet.', p: M(cx, cy, 0.661), ex: [0, 0, -0.12] }),
    P('Glasdrager', G.rbox(0.17, 0.106, 0.008, 0.01), MAT.plastic, { d: 'Kunststof drager waarop het glas is geklikt.', p: M(cx, cy, 0.668), ex: [0, 0, -0.08] }),
    P('Verwarmingsfolie', G.box(0.16, 0.1, 0.002), MAT.heater, { d: 'Verwarmingsfolie achter het glas tegen condens en ijs.', p: M(cx, cy, 0.6645), inner: true, ex: [0, 0, -0.1] }),
    P('Verstelmotor', G.rbox(0.06, 0.05, 0.04, 0.008), MAT.darkSteel, { d: 'Motor met twee assen voor het verstellen van het glas (met geheugen).', p: M(cx, cy, 0.7), inner: true, ex: [0, 0.06, -0.04] }),
    P('Inklapmotor', G.cyl('y', 0.022, 0.022, 0.05, 16), MAT.darkSteel, { d: 'Motor die de spiegel elektrisch inklapt.', p: M(0.95, 0.955, 0.74), ex: [0, -0.06, 0] }),
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
      P('Lichtklep', G.box(r * 1.6, 0.003, 0.012), MAT.darkSteel, { d: 'Klep die de bovenkant van de bundel afschermt voor dimlicht.', p: [0, -0.004, -0.03], ex: [0, -0.04, 0] }),
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
    P('Ontsteker', G.rbox(0.045, 0.03, 0.045, 0.006), MAT.ecu, { d: 'Ontsteekmodule die de hoogspanningspuls voor de xenonlamp levert.', p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1], c[2] - 0.15]; })(), ex: [0, 0.06, -0.2] }),
    P('Voorschakelapparaat', G.rbox(0.09, 0.025, 0.09, 0.006), MAT.ecu, { d: 'Ballast die de xenonlamp van stroom voorziet.', p: [back[0], back[1] - 0.06, back[2]], ex: [0, -0.16, -0.04] }),
    P('Bochtverlichtingsmotor', merge([G.cyl('y', 0.022, 0.022, 0.035, 16), xf(G.rbox(0.04, 0.02, 0.04, 0.005), [0, -0.025, 0])]), MAT.darkSteel, { d: 'Stappenmotor die de bi-xenon projector meedraait in bochten (directionele koplamp).', p: (() => { const c = at(1.975, 0.4, 0.03); return [c[0], c[1] - 0.05, c[2] - 0.04]; })(), ex: [0, -0.12, -0.06] }),
    P('Afdekkap', G.lathe('z', [[0, 0.02], [0.04, 0.02], [0.045, 0], [0.04, -0.005]], 18, 'bodHLcap'), MAT.plastic, { d: 'Rubberen kap op de achterzijde voor het verwisselen van de lampen.', p: [back[0], back[1], back[2] - 0.02], r: [PI, 0, 0], ex: [0, 0.02, -0.18] }),
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
// zijnaad van de achterklep in het staartvlak: recht, op dezelfde x als de deling van het achterlicht. Was 0,462 onder en 0,474 boven met een
// overgang in de lampband, zodat de naad onder het achterlicht ca. 1 cm naast de deling van de lamp uitkwam (S7: gekartelde naadlijnen, golf 5f)
const bodTGseam = y => 0.472;
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
// binnenrand van het binnendeel in de klep (golf 5f ronde 3, S7: de binnendelen lazen als rechthoekige stickers): geen rechte verticale rand op
// x 0,34 maar een halve ellips (3,5 cm diep), zodat de lamp aan de binnenkant afgerond eindigt; het klepvlak ertussen volgt dezelfde rand.
// Lenzen en klepvlak gebruiken dezelfde hoogtestations (dichter bij boven- en onderrand), zodat de randen naadloos op elkaar aansluiten.
const bodTLin = 0.34, bodTLinR = 0.035;
const bodTLxin = y => { const y0 = bodTLY(bodZT, 0), y1 = bodTLY(bodZT, 1), u = clamp((2 * y - y0 - y1) / (y1 - y0), -1, 1); return bodTLin + bodTLinR * (1 - Math.sqrt(1 - u * u)); };
const bodTLys = () => { const y0 = bodTLY(bodZT, 0), y1 = bodTLY(bodZT, 1), out = []; for (let i = 1; i < 18; i++) out.push(lerp(y0, y1, (1 - Math.cos(PI * i / 18)) / 2)); return out.concat(bodTLF.map(f => lerp(y0, y1, f))); };
// vlak op het staartvlak tussen x0f(y) en x1f(y) (functies van de hoogte), 'off' achter het vlak; hoogtestations van bodTLys
function bodTLgeo(x0f, x1f, y0, y1, off, nx = 8) {
  return patch((y, t) => { const X = ringX(bodZT, y), xa = clamp(x0f(y), -X, X), xb = Math.max(xa, Math.min(X, x1f(y))), x = xa + (xb - xa) * t; return [x, y, tailZ(x, y) - off]; }, y0, y1, 1, () => [0, 1], nx, bodTLys());
}
// deel 'buiten': het vaste deel op het achterscherm (onder Carrosserie); deel 'binnen': het deel in de klep, dat onder Achterklep
// hangt en met de klep meedraait (golf 5c-2, K9: hing onder Carrosserie en bleef staan als de klep openging)
function buildTaillight(s, deel = 'buiten') {
  const n = sn(s), xin = 0.34, xs = bodTGseam(0.92);
  const side = (off, f0, f1) => patch((z, p) => bodLow(z, p, off), bodZT + 0.0012, bodTLZ - 0.001, 18, z => sideR(s, bodSY(z, bodTLY(z, f0)), Math.max(bodSY(z, bodTLY(z, f0)) + 1e-4, bodSY(z, bodTLY(z, f1)))), 3, bodDense(-2.06, bodTLZ, 4));
  const face = (x0, x1, f0, f1, off, nx = 8, dy = 0) => { return bodMirX(bodTailGeo(x0, x1, bodTLY(bodZT, f0) + dy, bodTLY(bodZT, f1) - dy, off, 3, nx), s); };
  const [f0, f1, f2, f3] = bodTLF, xo = 1.2;
  const faceR = (fa, fb, off) => bodMirX(bodTLgeo(bodTLxin, () => xs, bodTLY(bodZT, fa), bodTLY(bodZT, fb), off), s);
  if (deel === 'binnen') return A(`Achterlicht binnendeel ${n}`, { d: 'Deel van het achterlicht in de achterklep met achterlicht en achteruitrijlicht; zet de lijnen van het buitendeel over de naad voort en draait met de klep mee.', ex: [s * 0.03, 0.04, -0.08] }, [
    P('Lens binnendeel', merge([faceR(f2, f3, 0.003), faceR(f0, f1, 0.003)]), MAT.lensRed, { d: 'Rode lens van het binnendeel (achterlicht): bovenband en onderstrook.', ex: [0, 0.03, -0.06] }),
    P('Lens achteruitrijlicht', faceR(f1, f2, 0.0035), MAT.lensClear, { d: 'Heldere middenband over het achteruitrijlicht, in lijn met de heldere band van het buitendeel.', ex: [0, 0, -0.1] }),
    P('Reflector binnendeel', face(xin + 0.004, xs - 0.008, f0, f3, -0.012, 8, 0.006), MAT.reflector, { d: 'Verchroomde reflector achter de lenzen.', ex: [0, 0, 0.04] }),
    P('Lichthuis binnendeel', face(xin + 0.01, xs - 0.01, f0, f3, -0.028, 8, 0.008), MAT.plastic, { d: 'Behuizing in de achterklep.', ex: [0, 0, 0.06] }),
    P('Lampdrager binnendeel', face(xin + 0.03, xs - 0.03, f0, f3, -0.018, 8, 0.02), MAT.ecu, { d: 'Lampdrager met fittingen en stekker.', ex: [0, 0, 0.1] }),
  ]);
  return A(`Achterlicht ${n}`, { d: 'Slank horizontaal achterlicht in twee delen, verdeeld over de klepnaad. Dit is het vaste deel op het achterscherm met achterlicht, remlicht en knipperlicht (LED-uitstraling): loopt om de afgeronde hoek de flank in en onder de schouder in een punt naar voren. Het deel in de achterklep hangt onder Achterklep als Achterlicht binnendeel en draait met de klep mee.', ex: [s * 0.3, 0.1, -0.5] }, [
    P('Lens buitendeel', merge([side(-0.003, f2, f3), side(-0.003, f0, f1), face(xs + 0.003, xo, f2, f3, 0.003), face(xs + 0.003, xo, f0, f1, 0.003)]), MAT.lensRed, { d: 'Rode afdeklens met een brede bovenband en een smalle onderstrook, van het staartvlak om de hoek de flank in.', ex: [s * 0.05, 0, -0.06] }),
    P('Heldere band buitendeel', merge([side(-0.0035, f1, f2), face(xs + 0.003, xo, f1, f2, 0.0035)]), MAT.lensClear, { d: 'Heldere horizontale band in de lens waarachter de knipperlichtunit zit; geeft de witte LED-streep van het fase 2-achterlicht.', ex: [s * 0.07, 0, -0.08] }),
    P('Lichthuis buitendeel', merge([side(0.05, f0, f3), face(xs + 0.01, xo, f0, f3, -0.05, 8, 0.008)]), MAT.plastic, { d: 'Kunststof behuizing met bevestigingsbouten in het achterscherm.', ex: [-s * 0.04, 0, 0.06] }),
    P('LED-print buitendeel', merge([side(0.035, 0.15, 0.85), face(xs + 0.02, xo, f0, f3, -0.035, 8, 0.02)]), MAT.ecu, { d: 'Printplaat met de lampen van achter-, rem- en knipperlicht.', ex: [0, 0, 0.1] }),
    P('Reflector buitendeel', merge([side(0.02, f0, f3), face(xs + 0.003, xo, f0, f3, -0.02, 8, 0.01)]), MAT.reflector, { d: 'Verchroomde reflector achter de lens; zichtbaar door het rode glas en de heldere band.', ex: [0, 0, 0.05] }),
  ]);
}

// rand van de achterklepopening, op afstand 'inw' binnen de huid (sponning en afdichting)
function bodTGPath(inw) {
  const side = [], ydT = bodSec(bodZT).yd;
  // het pad houdt de x van de vroegere naad (0,462 onder, 0,474 boven): de buis is een spline door alle punten, en een verschoven punt
  // onderaan verschuift de hele buis (ook bij het dak) en daarmee haar afstand tot de hemel en de hoedenplanksteun
  const seamX = y => 0.462 + 0.012 * sstep((y - 0.80) / 0.15);
  // om dezelfde reden houdt het pad de z van het staartvlak van vóór golf 5f ronde 2 (bolling 0,05 m over de hele hoogte): het nieuwe vlak
  // ligt op deze punten hoogstens 1,1 cm voor of achter het oude, de afdichting blijft 1,9 tot 4 cm binnen de huid
  // Let op: seamX en tz0 zijn vaste getallen, geen afgeleide van het staartvlak. Verandert het staartvlak (body.js, tailZ), dan moeten ze
  // mee, anders komt de afdichting buiten de huid of te diep in de sponning
  const tz0 = [-2.3001, -2.2951, -2.2874, -2.2796];
  [0.66, 0.8, 0.95, ydT - 0.05].forEach((y, i) => { const xs = Math.min(seamX(y), ringX(bodZT, y)) - 0.03; side.push([xs, y, tz0[i] + inw]); });
  for (const z of [bodZT + 0.03, -2.2, SP]) { const p = halfPt(z, bodSAtX(z, bodTGdx(z) - 0.02)); side.push([p[0], p[1] - inw, z]); }
  for (const z of [-1.9, -1.6, -1.35, RW0 + 0.02]) { const q = bodQScr(z), p = bodGhHalf(z, q); side.push([p[0] - inw, p[1] - inw, z]); }
  const mid = [0, 0.655, -2.318 + inw], top = [0, YR(RW0 + 0.02) - inw, RW0 + 0.02];
  return [mid, ...side, top, ...side.slice().reverse().map(p => [-p[0], p[1], p[2]]), mid];
}
// opening in een huiddeel: houdt alleen het deel van elke driehoek dat buiten de rechthoek |x| < X0, Y0 < y < Y1 ligt (in vooraanzicht,
// voor z > zMin); de driehoeken worden exact op de rand geknipt (Sutherland-Hodgman per convex buitengebied), zodat de opening strak is
function bodClipOut(g, X0, Y0, Y1, zMin) {
  const p = g.attributes.position, ix = g.index ? g.index.array : [...Array(p.count).keys()], out = [];
  const V = k => [p.getX(k), p.getY(k), p.getZ(k)];
  // vier convexe buitengebieden als halfvlakken a * x + b * y <= c (conventie van clipPoly in core.js): onder Y0, boven Y1, links en rechts van |x| X0
  const regs = [[[0, 1, Y0]], [[0, -1, -Y1]], [[0, -1, -Y0], [0, 1, Y1], [-1, 0, -X0]], [[0, -1, -Y0], [0, 1, Y1], [1, 0, -X0]]];
  for (let i = 0; i < ix.length; i += 3) {
    const tri = [V(ix[i]), V(ix[i + 1]), V(ix[i + 2])];
    const away = tri.some(v => v[2] < zMin) || tri.every(v => v[1] <= Y0) || tri.every(v => v[1] >= Y1) || tri.every(v => v[0] >= X0) || tri.every(v => v[0] <= -X0);
    if (away) { tri.forEach(v => out.push(...v)); continue; }
    for (const hs of regs) { let poly = tri; for (const h of hs) { poly = clipPoly(poly, h[0], h[1], h[2]); if (poly.length < 3) break; }
      for (let k = 1; k + 1 < poly.length; k++) out.push(...poly[0], ...poly[k], ...poly[k + 1]); }
  }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); r.computeVertexNormals(); return r;
}
// inham in een huiddeel: houdt alleen het deel van elke driehoek dat buiten het blok x0 <= s * x <= x1, y < y1, z < z1 ligt; exact op de
// vlakken geknipt (buitengebied als vier disjuncte convexe stukken, halfruimten n . p <= c). Voor de uitlaatuitsparing in de bumperhoek
function bodClipBox(g, s, x0, x1, y1, z1) {
  const p = g.attributes.position, ix = g.index ? g.index.array : [...Array(p.count).keys()], out = [];
  const V = k => [p.getX(k), p.getY(k), p.getZ(k)];
  const cut = (poly, n, c) => { const r = []; poly.forEach((A, i) => { const B = poly[(i + 1) % poly.length], da = n[0] * A[0] + n[1] * A[1] + n[2] * A[2] - c, db = n[0] * B[0] + n[1] * B[1] + n[2] * B[2] - c;
    if (da <= 0) r.push(A); if ((da < 0 && db > 0) || (da > 0 && db < 0)) { const t = da / (da - db); r.push(A.map((v, k) => v + (B[k] - v) * t)); } }); return r; };
  const xin = [[[-s, 0, 0], -x0], [[s, 0, 0], x1]], regs = [[[[s, 0, 0], x0]], [[[-s, 0, 0], -x1]], [...xin, [[0, -1, 0], -y1]], [...xin, [[0, 1, 0], y1], [[0, 0, -1], -z1]]];
  for (let i = 0; i < ix.length; i += 3) {
    const tri = [V(ix[i]), V(ix[i + 1]), V(ix[i + 2])];
    if (tri.every(v => s * v[0] <= x0) || tri.every(v => s * v[0] >= x1) || tri.every(v => v[1] >= y1) || tri.every(v => v[2] >= z1)) { tri.forEach(v => out.push(...v)); continue; }
    for (const hs of regs) { let poly = tri; for (const [n, c] of hs) { poly = cut(poly, n, c); if (poly.length < 3) break; }
      for (let k = 1; k + 1 < poly.length; k++) out.push(...poly[0], ...poly[k], ...poly[k + 1]); }
  }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); r.computeVertexNormals(); return r;
}
// Achterwielkast: kuip (halve cilinder, straal bodWHR, x 0,51 tot 0,73) met een binnenwand op x = s * 0,51 van de vloer tot
// de kuipboog. De wand heeft een sleuf waar de torsiebalk met de stabilisatorstaaf doorloopt en een uitsparing voor de
// schroefveer (x 0,438 tot 0,582); achter die uitsparing zit een veerkoker naar binnen tot x 0,432, met de bovenkant op
// y 0,572 vlak boven de veerschotel. Onder de as sluiten een voor- en een achterwand de kuip af. Wereldmaten.
// veerkoker uit REAR_SPR en sleuf voor de torsiebalk uit REAR_BEAM (body.js, golf 5b-3 G8d), zodat wielkast, chassis en interieur dezelfde maten lezen
const bodWHR = ARCH + 0.02, bodWHX = 0.51, bodSprZ = REAR_SPR.sprZ, bodSprY = REAR_SPR.sprY, bodSprX = REAR_SPR.sprX;
const bodBeamSlot = [REAR_BEAM.z - REAR_BEAM.hz - REAR_BEAM.slot, REAR_BEAM.z + REAR_BEAM.hz + REAR_BEAM.slot, REAR_BEAM.y - REAR_BEAM.hy - REAR_BEAM.slot, REAR_BEAM.y + REAR_BEAM.hy + REAR_BEAM.slot];
function bodRearWHWall(s) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const z = AXR - bodWHR + 2 * bodWHR * i / 16; pts.push(new THREE.Vector2(z, YB(z) + 0.004)); }
  for (let k = 0; k <= 24; k++) { const a = PI * k / 24; pts.push(new THREE.Vector2(AXR + bodWHR * Math.cos(a), AY + bodWHR * Math.sin(a))); }
  const sh = new THREE.Shape(pts), hole = (z0, z1, y0, y1) => { const h = new THREE.Path(); h.moveTo(z0, y0); h.lineTo(z1, y0); h.lineTo(z1, y1); h.lineTo(z0, y1); h.closePath(); return h; };
  sh.holes.push(hole(...bodBeamSlot), hole(bodSprZ[0], bodSprZ[1], bodSprY[0], bodSprY[1]));
  const wall = new THREE.ShapeGeometry(sh, 1); wall.rotateY(-HALF); wall.translate(s * bodWHX, 0, 0);
  // veerkoker: binnenvlak, voor- en achtervlak en bovenkant; onderaan open boven de langsarm
  const dx = bodWHX - bodSprX, dz = bodSprZ[1] - bodSprZ[0], dy = bodSprY[1] - bodSprY[0], xm = s * (bodWHX + bodSprX) / 2, ym = (bodSprY[0] + bodSprY[1]) / 2, zm = (bodSprZ[0] + bodSprZ[1]) / 2;
  const inner = new THREE.PlaneGeometry(dz, dy); inner.rotateY(-HALF); inner.translate(s * bodSprX, ym, zm);
  const fr = new THREE.PlaneGeometry(dx, dy); fr.translate(xm, ym, bodSprZ[1]);
  const bk = new THREE.PlaneGeometry(dx, dy); bk.translate(xm, ym, bodSprZ[0]);
  const top = new THREE.PlaneGeometry(dx, dz); top.rotateX(-HALF); top.translate(xm, bodSprY[1], zm);
  // voorwand onder de kuip op het achtereinde van de dorpel (z -1,004): van de binnenwand tot de buitenhuid en tot net boven
  // de onderrand van de kuip, met een uitsparing waar de langsarm naar zijn draaipunt loopt
  // (onderrand 2 mm onder de dorpelhuid, buitenrand dicht langs de afgeronde onderhoek: geen spleet naar de dorpel)
  const face = bodWHFace(s, AXR + ARCH + 0.002, bodWHX, [[0.638, 0.36], [0.638, 0.277], [0.562, 0.277], [0.562, 0.36], [bodWHX, 0.36]]);
  // achterwand onder de kuip (z -1,796) naar de holte achter de wielkast, met een uitsparing voor de langsligger
  const rface = bodWHFace(s, AXR - bodWHR, bodWHX, [[0.563, 0.36], [0.563, 0.267], [bodWHX, 0.267]]);
  return merge([wall, inner, fr, bk, top, face, rface]);
}
// verticale wand onder een wielkuip op langsplaats z, van x0 tot de buitenhuid en van 2 mm onder de onderrand tot y 0,36
// (onderrand en buitenrand dicht langs de dorpelhuid en de afgeronde onderhoek); top = de bovenrand van de huid terug naar x0
function bodWHFace(s, z, x0, top) {
  const yb = YB(z) - 0.002, pts = [new THREE.Vector2(x0, yb)];
  for (let i = 0; i <= 24; i++) { const y = yb + (0.36 - yb) * (i / 24) ** 2; pts.push(new THREE.Vector2(surfX(z, y) - 0.001, y)); }
  (top || [[x0, 0.36]]).forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts), 1); if (s < 0) g.rotateY(PI); g.translate(0, 0, z); return g;
}
// kofferbakvloer in bovenaanzicht (lokale z = v rond zc): achter de wielkasten tot |x| hw (de ruwbouwvloer iets breder
// dan de bagagevloer erboven, zodat die van onderen niet te zien is), tussen de wielkasten tot
// net binnen de wand (|x| 0,505) en naast de veerkokers tot |x| 0,428; dikte t, randstraal b, holle hoeken ri
function bodBootPlate(hw, zc, hd, t, b, ri) {
  const v1 = -1.80 - zc, v2 = bodSprZ[0] - 0.007 - zc, w1 = bodWHX - 0.005, w2 = bodSprX - 0.004;
  const g = roundPlate([[-hw, -hd], [hw, -hd], [hw, v1], [w1, v1], [w1, v2], [w2, v2], [w2, hd], [-w2, hd], [-w2, v2], [-w1, v2], [-w1, v1], [-hw, v1]], t, b, ri);
  g.rotateX(HALF); return g;
}
/* ---------- openers: maten en hulpfuncties (motorkap, steun) ---------- */
// Motorkap: draaias op de achterrand van het Buitenpaneel (z 1,064) op de hoogte van de hartlijn (y 0,976). Punten van de achterrand
// liggen daaronder (de kap is bol) en stijgen bij het openen; niets draait de torpedoplaat of de voorruit in. Hoek 65 graden; past bij de waarneming van de gebruiker op de eigen auto (60 tot 75 graden, 19 oktober 2026).
const bodHoodPv = [0, 0.976, 1.064], bodHoodAng = -65 * PI / 180;
// punt van de kap (kapframe) na het openen
function bodHoodPt(p) {
  const c = Math.cos(bodHoodAng), s = Math.sin(bodHoodAng), dy = p[1] - bodHoodPv[1], dz = p[2] - bodHoodPv[2];
  return [p[0], bodHoodPv[1] + dy * c - dz * s, bodHoodPv[2] + dy * s + dz * c];
}
// Motorkapsteun (0,50 m): voetpunt F op de rechter voorwielkast, rustpunt E op de steunhouder, grijppunt G in het binnenframe van de kap.
// F volgt uit G: bij 65 graden staat de stang exact 0,50 m van F naar G (het eind raakt de kap).
const bodStG = [-0.72, 0.838, 1.45], bodStGw = bodHoodPt(bodStG), bodStL = 0.50;
const bodStF = (() => { const x = -0.745, z = 1.33, dx = bodStGw[0] - x, dz = bodStGw[2] - z; return [x, bodStGw[1] - Math.sqrt(bodStL * bodStL - dx * dx - dz * dz), z]; })();
const bodStE = [-0.705, 0.684, 1.822];
// straal van de steunstang: 8 mm (16 mm doorsnede, dikker dan de echte van ca. 8 mm doorsnede) zodat hij ook op een telefoon als stang leest
const bodStR = 0.008;
// draaiing van de stang om F: van de rustrichting naar de openrichting (as = r0 x r1)
const bodStRot = (() => {
  const r0 = V3(bodStE[0] - bodStF[0], bodStE[1] - bodStF[1], bodStE[2] - bodStF[2]).normalize(), r1 = V3(bodStGw[0] - bodStF[0], bodStGw[1] - bodStF[1], bodStGw[2] - bodStF[2]).normalize();
  const ax = r0.clone().cross(r1).normalize();
  return { r0, ax: [ax.x, ax.y, ax.z], ang: Math.acos(clamp(r0.dot(r1), -1, 1)) };
})();
// Achterklep: draaias op de dakrand (y 1,362 bij z -1,174), 66 graden. Gasveren als telescoop: carrosseriepunt A op de C-stijl, klepunt B bij de
// ruitrand; berekend zodat de afstand A-B in gesloten stand 0,290 m is en bij 66 graden 0,495 m (HB2/catalogus: 495 mm uit, slag 205 mm).
const bodTgPv = [0, 1.362, -1.174], bodTgAng = 66 * PI / 180;
// Beide kogels liggen aan de zijkant van de opening: A op de binnenkant van de C-stijl (de zijwand loopt hier van |x| 0,70 bij y 1,21 naar 0,68 bij y 1,26), B op de zijrand
// van de klep, 1,4 cm buiten A, zodat de veer langs de zijwand loopt en niet de bagageruimte in. A ligt op |x| 0,664 (golf 5b-3, E1; was 0,684): zo blijft het
// gekantelde plaatje 3 mm onder de lakhuid en steken kogel en kogelkom er niet meer doorheen (gemeten met clash.py). Het punt A ligt vast (z -1,33, vlak achter de scharnierlijn, onder de rand van de sponning);
// B volgt uit de glasrand (5 cm onder het glas) en de lengtes: 0,290 m gesloten en 0,495 m bij 66 graden (HB2/catalogus: 495 mm uit, slag 205 mm).
// B ligt op |x| 0,678 (golf 5b-3; was 0,652 en 4,5 cm onder het glas): met A op 0,664 liep de as anders door de flens van de sponning en langs de
// klepafdichting. Nu ligt de gesloten veer buiten de afdichting, onder de ruitrand en binnen de C-stijl, en zit de beugel nog op het binnenpaneel
// (gemeten met clash.py: geen paar dieper dan voor E1, sponning en C-stijl vrij).
// De hoogte van A en de plaats van B volgen daaruit; panP staat in panorama.js, dus dit draait pas bij het bouwen.
const bodGsX = [0.664, 0.678], bodGsAz = -1.33, bodGsLift = -0.05;
// het plaatje van A volgt de helling van de C-stijl ter plaatse (x neemt 0,45 m per m af naar boven tussen y 1,21 en 1,25, gemeten): 24 graden om z
const bodGsTilt = Math.atan(0.45);
function bodGsSolve() {
  const [ax, bx] = bodGsX, az = bodGsAz, c = Math.cos(bodTgAng), sg = Math.sin(bodTgAng);
  const bAt = zb => [bx, panP(zb, bx, bodGsLift)[1], zb];
  const opened = b => { const ry = b[1] - bodTgPv[1], rz = b[2] - bodTgPv[2]; return [b[0], bodTgPv[1] + ry * c - rz * sg, bodTgPv[2] + ry * sg + rz * c]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  let best = null;
  for (let i = 0; i <= 800; i++) {
    const ay = 1.10 + 0.0005 * i, a = [ax, ay, az];
    let lo = -1.9, hi = az - 0.02;
    for (let k = 0; k < 48; k++) { const m = (lo + hi) / 2; if (dist(a, bAt(m)) > 0.29) lo = m; else hi = m; }
    const b = bAt((lo + hi) / 2), e = Math.abs(dist(a, opened(b)) - 0.495);
    if (!best || e < best.e) best = { e, a, b };
  }
  return best;
}
// Tankklep rechtsachter: opening in het rechter achterscherm (z -1,780 tot -1,664, y 0,808 tot 0,912), scharnier aan de voorrand (z -1,664).
const bodTkZ = [-1.78, -1.664], bodTkY = [0.808, 0.912];
// Opkant in de bodemplaat onder de torsiebalk van de achteras (balk bovenkant y 0,326 = REAR_BEAM.y + .hy; de balk zelf loopt van z -1,20 tot -1,10):
// plateau y 0,345 tussen z -1,258 en -1,08, met hellende randen (achter 0,122 m lang, van z -1,38 tot -1,258; voor 0,10 m, van z -1,08 tot -0,98; gemeten
// aan de huid). Bij de opkant is de plaat smaller (tot |x| 0,44), zodat de vulpijp en de wand van de wielkast ernaast vrij blijven.
// Het plateau begint dus 0,058 m achter de balk. De maat -1,258 is niet die van de balk: het is REAR_BEAM.z - 0,108, gelijk aan de achterrand van de kwartsruit
// (intCPillar in interior.js, zs[0]) en aan de uiteinden van de stabilisatorstaaf (0,1 m achter het hart van de balk plus de schuin afgesneden staafstraal; chassis.js)
// (golf 5b-3, G8d; was -1,28).
const bodBeamZr = REAR_BEAM.z - 0.108;
const bodHumpZ = [-1.38, bodBeamZr, -1.08, -0.98], bodHumpY = 0.345;
const bodHumpT = z => z <= bodHumpZ[0] || z >= bodHumpZ[3] ? 0 : z < bodHumpZ[1] ? sstep((z - bodHumpZ[0]) / (bodHumpZ[1] - bodHumpZ[0])) : z <= bodHumpZ[2] ? 1 : sstep((bodHumpZ[3] - z) / (bodHumpZ[3] - bodHumpZ[2]));
const bodHumpW = z => z <= bodHumpZ[0] - 0.1 || z >= bodHumpZ[3] + 0.1 ? 0 : z < bodHumpZ[0] ? sstep((z - bodHumpZ[0] + 0.1) / 0.1) : z <= bodHumpZ[3] ? 1 : sstep((bodHumpZ[3] + 0.1 - z) / 0.1);
const bodHumpBreaks = (() => { const b = []; for (let i = 0; i <= 8; i++) b.push(bodHumpZ[0] + (bodHumpZ[1] - bodHumpZ[0]) * i / 8, bodHumpZ[2] + (bodHumpZ[3] - bodHumpZ[2]) * i / 8); for (let i = 0; i < 4; i++) b.push(bodHumpZ[0] - 0.1 + 0.025 * i, bodHumpZ[3] + 0.025 * (i + 1)); return b; })();
// Voorste langsligger (44 mm breed, in z/y gevormd): achter het voorwiel op y 0,385 tot 0,485 (boven de aandrijfassen, onder het veerschotel van de
// veerpoot), voor het wiel op y 0,30 tot 0,40 (de crashbox sluit erop aan; de accu staat sinds golf 5g links achter boven de automaat); tussen z 1,72 en 1,80 loopt hij schuin
const bodFrontRail = (() => { const g = extrude(shapeOf([[1.03, 0.385], [1.72, 0.385], [1.80, 0.30], [2.03, 0.30], [2.03, 0.40], [1.80, 0.40], [1.72, 0.485], [1.03, 0.485]]), 0.044); g.rotateY(-HALF); return g; })();
function buildBody() {
  const L = 1, R = -1, both = f => [L, R].map(f);
  /* ================= carrosseriekooi ================= */
  // vloer en dorpels
  // bij de achterwielen loopt de vloer door tot net onder de binnenwand van de wielkast (x ca. 0,52), zodat er geen spleet
  // tussen vloerrand en wielkast is; vooraan loopt hij op volle breedte door tot onder het schutbord
  const floorVR = z => { const c = bodSec(z), lim = (inArch(z) && z < 0 ? S1 * 0.645 : S1) * (1 - 0.165 * bodHumpW(z)); return [-lim, lim]; };
  // tunnel van z -0,70 tot aan het schutbord (z 1,03), zodat de opening in de teenplaat in de tunnel uitkomt
  const tunnel = (() => { const sh = shapeOf([[-0.17, 0], [-0.12, 0.2], [0.12, 0.2], [0.17, 0], [0.16, -0.004], [0.115, 0.192], [-0.115, 0.192], [-0.16, -0.004]]); const g = extrude(sh, 1.73); g.rotateY(0); return g; })();
  const floorGrp = A('Vloer en dorpels', { d: 'Vloerplaat met middentunnel, dwarsbalken, langsliggers achter en de dorpels onder de portieren.', ex: [0, -0.32, 0] }, [
    P('Bodemplaat', patch((z, p) => { const q = bodLow(z, p, 0.002); q[1] += bodHumpT(z) * (bodHumpY - q[1]); return q; }, -1.75, 1.03, 51, floorVR, 12, ARCH_BREAKS.concat(bodHumpBreaks)), MAT.underbody, { d: 'Gelaste vloerplaat van de ruwbouw met bevestigingspunten voor stoelen en onderstel. Onder de achterbank zit een opkant (y 0,345 tussen z -1,258 en -1,08; hellende randen van 0,122 m achter en 0,10 m voor) waar de torsiebalk van de achteras onderdoor loopt.', ex: [0, -0.1, 0] }),
    P('Middentunnel', tunnel, MAT.underbody, { d: 'Tunnel in de vloer voor uitlaat en leidingen.', p: [0, 0.2, 0.165], ex: [0, 0.08, 0] }),
    P('Kofferbakvloer', merge([bodBootPlate(0.65, -1.88, 0.36, 0.012, 0.004, 0.01), xf(G.cyl('y', 0.3, 0.27, 0.16, 28, true), [0, -0.08, 0]), xf(G.cyl('y', 0.27, 0.27, 0.006, 28), [0, -0.157, 0])]), MAT.underbody, { d: 'Vloer van de bagageruimte met de reservewielkuip (met bodem; de einddemper hangt eronder), tussen de achterwielkasten smaller.', p: [0, 0.4, -1.88], ex: [0, -0.06, -0.12] }),
    P('Dwarsbalk voorstoelen', G.box(1.34, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de voorstoelen die vloer en dorpels verbindt.', p: [0, 0.225, 0.18], ex: [0, 0.06, 0.04] }),
    ...both(s => P(`Dwarsbalk achterbank ${sn(s)}`, G.box(0.48, 0.05, 0.09), MAT.paintIn, { d: 'Dwarsbalk onder de achterbank, vóór de brandstoftank; per kant een helft, tegen de wand van de middentunnel.', p: [s * 0.43, 0.215, -0.535], ex: [s * 0.04, 0.06, -0.04] })),
    ...both(s => P(`Langsligger achter ${sn(s)}`, G.box(0.08, 0.1, 0.685), MAT.paintIn, { d: 'Langsligger onder de bagageruimte die de achterbumperbalk draagt, tussen de reservewielkuip en de veerkokers (plaats schematisch).', p: [s * 0.385, 0.32, -1.7425], ex: [s * 0.06, -0.06, 0] })),
    ...both(s => P(`Dorpel ${sn(s)}`, lowSide(s, AXR + ARCH + 0.002, AXF - ARCH - 0.002, 36, z => [S1 * 0.55, bodSY(z, 0.302)], 6), MAT.paint, { d: 'Dorpel: dragend kokerprofiel onder de portieren.', ex: [s * 0.12, -0.04, 0] })),
    ...both(s => P(`Dorpelsierlijst ${sn(s)}`, bodMould(s, 0.208, 0.242, -0.95, 0.85, 0.010, 40), MAT.bodBright, { d: 'Zilveren sierlijst langs de onderdorpel (aluminiumlook).', ex: [s * 0.2, -0.02, 0] })),
    ...both(s => P(`Rubberlijn dorpelsierlijst ${sn(s)}`, bodMould(s, 0.194, 0.205, -0.94, 0.84, 0.0035, 28, 3), MAT.rubber, { d: 'Dunne zwarte rubberlijn onder de dorpelsierlijst.', ex: [s * 0.16, -0.03, 0] })),
  ]);
  // voorkop
  const frontGrp = A('Voorkop', { d: 'Dragende voorbouw: langsliggers met kreukelzones, veerpoottorens, schutbord, torpedobak, frontmodule en bumperbalk.', ex: [0, 0.05, 0.42] }, [
    ...both(s => P(`Langsligger voor ${sn(s)}`, bodFrontRail, MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt. Plaats en maten schematisch: het profiel is 44 mm breed en 100 mm hoog. Achter het voorwiel ligt het boven de aandrijfassen (y 0,385 tot 0,485), naast de zijdeksels van de versnellingsbak en binnen de veerpoot en de koppelstang van de stabilisator; voor het wiel zakt het naar y 0,30 tot 0,40, waar het aansluit op de crashbox.', p: [s * 0.55, 0, 0], ex: [s * 0.08, 0, 0] })),
    ...both(s => P(`Crashbox ${sn(s)}`, G.rbox(0.09, 0.1, 0.13, 0.01), MAT.steel, { d: 'Kreukelelement tussen langsligger en bumperbalk; wordt na een lichte aanrijding vervangen.', p: [s * 0.545, 0.37, 2.11], ex: [s * 0.04, 0, 0.08] })),
    ...both(s => P(`Veerpoottoren ${sn(s)}`, merge([G.cyl('y', 0.095, 0.13, 0.26, 24, true), xf(G.cyl('y', 0.095, 0.095, 0.006, 24), [0, 0.13, 0])]), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.6, 0.71, 1.33], ex: [s * 0.1, 0.06, 0] })),
    // achter de band sluit een wand onder de kuip de wielkast af naar het voorste eind van de dorpel en de A-stijlvoet
    ...both(s => P(`Wielkast voor ${sn(s)}`, merge([G.half('x', ARCH + 0.03, 0.2, PI, 24), xf(bodWHFace(s, AXF - ARCH - 0.002, 0.5), [-s * 0.6, -AY, -AXF])]), MAT.paintIn, { d: 'Binnenscherm van de voorwielkast, gelast aan langsligger en veerpoottoren, met een achterwand onder de kuip naar de dorpel.', p: [s * 0.6, AY, AXF], r: [0, 0, 0], ex: [s * 0.1, 0.04, 0] })),
    // onderaan loopt het schutbord als teenplaat door tot de vloer, met een opening waar tunnel en downpipe doorlopen
    P('Schutbord', merge([G.rbox(1.5, 0.62, 0.012, 0.004), xf(G.box(0.58, 0.118, 0.012), [0.46, -0.361, 0]), xf(G.box(0.58, 0.118, 0.012), [-0.46, -0.361, 0])]), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur; onderaan als teenplaat tot op de vloer, met een opening voor de tunnel en de downpipe.', p: [0, 0.6, 1.02], ex: [0, 0, -0.08] }),
    P('Torpedobak', merge([G.box(1.42, 0.012, 0.12), xf(G.box(1.42, 0.1, 0.012), [0, -0.05, 0.06])]), MAT.paintIn, { d: 'Bak onder de torpedoplaat waarin wissermotor en luchtinlaat van het interieur zitten.', p: [0, 0.905, 1.08], ex: [0, 0.06, 0] }),
    // ligt 2,2 cm onder de achterrand van de motorkap (die loopt door tot de voorruitbasis), zodat in zijaanzicht geen zwarte trede tussen kap en A-stijl staat
    P('Torpedoplaat', merge([bodDeck(WS0 + 0.004, 1.128, 6, () => S4 + 0.004, 26, [], 0.022), ...[-0.4, -0.2, 0, 0.2, 0.4].map(x => { const g = new THREE.BoxGeometry(0.16, 0.004, 0.03); g.translate(x, bodSec(1.095).yd - 0.02 - 0.06 * x * x, 1.095); return g; })]), MAT.plastic, { d: 'Kunststof afdekplaat met wisserrooster en luchtinlaat voor het interieur onder de achterrand van de motorkap, voor de voorruit.', ex: [0, 0.1, 0.02] }),
    P('Frontmodule', merge([xf(G.box(1.08, 0.06, 0.06), [0, 0.72, 0]), xf(G.box(1.0, 0.06, 0.06), [0, 0.26, 0]), xf(G.box(0.06, 0.46, 0.06), [0.52, 0.49, 0]), xf(G.box(0.06, 0.46, 0.06), [-0.52, 0.49, 0]), xf(G.box(0.05, 0.4, 0.05), [0, 0.49, 0])]), MAT.plastic, { d: 'Kunststof frontmodule (slotplaat) die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 2.06], ex: [0, 0.04, 0.12] }),
    P('Motorkapslot', merge([G.rbox(0.07, 0.06, 0.04, 0.008), xf(G.rbox(0.02, 0.05, 0.015, 0.004), [0.045, 0.01, 0.015])]), MAT.darkSteel, { d: 'Slot op de frontmodule waarin de slotbeugel van de motorkap grijpt, met ontgrendelkabel naar het interieur.', p: [0, 0.64, 2.2], ex: [0, 0.06, 0.06] }),
    P('Bumperbalk voor', tube([-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map(x => [x, 0.42, 2.2 - 0.25 * x * x]), 0.045, 24, 8), MAT.steel, { d: 'Gebogen stalen botsbalk achter de voorbumper.', ex: [0, 0, 0.1] }),
    // steunvoet en steunhouder van de motorkapsteun (rechter wielkast): de voet is een vork waarin de stang draait, de houder een bakje waarin hij in rust ligt
    P('Steunvoet motorkapsteun', merge([xf(G.rbox(0.03, 0.006, 0.05, 0.002), [0, 0, 0]), ...[-1, 1].map(k => xf(G.rbox(0.004, 0.04, 0.04, 0.001), [k * 0.012, 0.02, 0]))]), MAT.darkSteel, { d: 'Vork op de rechter voorwielkast waarin het onderste scharnierpunt van de motorkapsteun draait (plaats geschat).', p: [bodStF[0], bodStF[1] - 0.019, bodStF[2]], ex: [-0.06, 0.04, 0] }),
    P('Steunhouder motorkapsteun', merge([xf(G.rbox(0.04, 0.006, 0.03, 0.002), [0, 0, 0]), ...[-1, 1].map(k => xf(G.rbox(0.004, 0.02, 0.03, 0.001), [k * 0.019, 0.01, 0])), xf(G.rbox(0.014, bodStE[1] - 0.012 - 0.54 + 0.003, 0.014, 0.003), [-0.017, -(bodStE[1] - 0.012 - 0.54) / 2 - 0.0015, 0])]), MAT.plastic, { d: 'Kunststof houder (houder 5 in het instructieboekje) op de rechter bumpersteun waarin de motorkapsteun in rust ligt (plaats geschat).', p: [bodStE[0] - 0.01, bodStE[1] - 0.012, bodStE[2]], ex: [-0.04, 0.08, 0] }),
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
  const aPillarLo = z => z < bodSail - 0.004 ? bodQG + 0.03 : z < 0.93 ? Math.min(bodQS - 0.02, bodQy(z, bodSailTop(z))) : 0.004;
  // dakplaat met twee openingen: panRoofGeo() in panorama.js (4 mm overlap met de achterruit, geen spleet op de naad)
  // de kwartsruit ligt boven het achterportier (de sluitnaad loopt achter de punt op de gordel, z -1,2665) en zit in het raamkader van dat portier
  // achter het schuine stijltje: hij draait om dezelfde scharnieras mee. Bleef hij staan, dan hing hij bij een open achterportier los in de
  // deuropening (poort B0 en ronde 2, beeld 19). Knoop en pad blijven gelijk (boom en onderdeelnummers)
  const qAx = s => bodDoorAxis(s, false);
  const quarter = s => A(`Kwartsruit ${sn(s)}`, { d: 'Vaste driehoekige ruit achter het schuine stijltje, in het raamkader van het achterportier; draait met het portier mee.', ex: [s * 0.22, 0.06, -0.05],
    open: follow(`Portier ${sn(s)}achter`, qAx(s).pv, qAx(s).ax, qAx(s).ang) }, [
    P('Ruit', bodGhSide(s, bodQZ, bodQd(0.97) - 0.016, 16, z => [0.006, Math.min(bodQy(z, bodQtop(z)), bodQy(z, 0.97 + (-0.93 - 0.016 - z) * 0.33 / 0.06))], 6, bodDense(bodQZ, -1.15, 6)), MAT.bodGlassSide, { d: 'Vaste kwartsruit van getint veiligheidsglas achter de zakbare ruit van het achterportier; geeft licht en zicht opzij bij de achterbank.', ex: [s * 0.04, 0, 0] }),
    P('Raamkader kwartsruit', bodTrim(s, qEdge, z => -(qFr(z) + 0.0005), 0.002, 0.003, 0, 3), MAT.bodPillar, { d: 'Zwart kader langs de rand van de kwartsruit, onder de chroomband.', ex: [s * 0.05, 0.03, 0] }),
    P('Omlijsting', qTrim(s, 0, 2 * bodTW, 0.0035, 0.003, 6), MAT.bodChrome, { d: 'Chromen band langs de bovenrand en de schuine achterrand van de kwartsruit tot de punt op de gordel, in het verlengde van de omlijsting van het achterportier.', ex: [s * 0.06, 0.02, 0] }),
    P('Rubberlijn kwartsruit', merge([qTrim(s, 2 * bodTW - 0.0005, 2 * bodTW + bodTR, 0.0026, 0, 1), qBelt(s).rubber]), MAT.bodPillar, { d: 'Zwarte rubberlijnen langs de omlijsting en de gordellijst van de kwartsruit.', ex: [s * 0.05, 0.05, 0] }),
    P('Gordellijn kwartsruit', qBelt(s).chrome, MAT.bodChrome, { d: 'Chromen sierlijst op de gordellijn onder de kwartsruit, in het verlengde van die van het achterportier.', ex: [s * 0.06, -0.02, 0] }),
  ]);
  const bodGsPt = bodGsSolve(), bodGsA = bodGsPt.a, bodGsB = bodGsPt.b;
  const sideRoof = A('Zijwanden en dak', { d: 'Stijlen, dakrails, dak met dakbogen, de vaste kwartsruiten en de dakantenne.', ex: [0, 0.32, 0] }, [
    P('Dakpaneel panoramadak', panRoofGeo(), MAT.paint, { d: 'Dakplaat van staal met twee openingen voor het panoramadak (optie), gelast op de dakrails. Tussen de openingen en rondom loopt een smalle plaatstrook.', ex: [0, 0.16, 0] }),
    A('Dakbogen', { d: 'Drie dwarsliggers onder het dakpaneel. Door de twee openingen van het panoramadak liggen ze onder de plaatstroken voor, tussen en achter de glaspanelen (onder de dwarsbalk en boven de hemelbekleding).', ex: [0, 0.1, 0] }, [[0.285, 'voor'], [-0.54, 'midden'], [-1.14, 'achter']].map(([z, nm]) => P(`Dakboog ${nm}`, (() => { const pts = []; for (let i = 0; i <= 12; i++) { const w = bodQR / 2 + (1 - bodQR) * i / 12; const p = ghPt(z, w); pts.push([p[0] * 0.97, p[1] - 0.005, z]); } return tube(pts, 0.0045, 24, 6); })(), MAT.paintIn, { d: 'Dwarsligger onder het dakpaneel.', ex: [0, -0.04, z * 0.05] }))),
    buildPanorama(),
    ...both(s => P(`Dakrail ${sn(s)}`, bodGhSide(s, -0.95, WS1, 30, () => [bodQG + 0.03, bodQR], 10), MAT.paint, { d: 'Zijdelingse dakligger boven de portieren.', ex: [s * 0.08, 0.04, 0] })),
    ...both(s => P(`A-stijl ${sn(s)}`, bodGhSide(s, WS1, WS0, 24, z => [aPillarLo(z), bodQR], 8, bodDense(0.78, 0.95, 6).concat(bodDense(WS0 - bodAPL, WS0, 9))), MAT.paint, { d: 'Voorste dakstijl langs de voorruit.', ex: [s * 0.08, 0.04, 0.04] })),
    // B-stijl: profiel onder (tot 1,06 m) en boven de gordel het gelakte buitenvlak van de stijl tot de bovenrand van de ruiten, 4 mm onder de
    // twee zwarte afdekkingen van de portierkaders (de onderste 10 cm dieper, binnen de zakkende voorste zijruit; zie bodBPillarFace). Dicht blijft het vlak achter die afdekkingen (16 mm van de glasranden, zodat het niet
    // door de ruiten te zien is); bij een open portier leest de stijl zo als stijl. Zonder dit vlak keek je daar langs de afdekking van het
    // andere portier recht op de crème stoelrug (poort ronde 2, beelden 06 en 09)
    // Het profiel eindigt op de gordel (0,70 m lang langs zijn eigen as, onderkant en voorvlak met de sluitplaat op dezelfde plaats): tot 1,06 m stak
    // het 6 cm achter de afdekking uit en las het door een gezakte achterruit als licht blok tussen ruit en stijl (beeld 15)
    ...both(s => P(`B-stijl ${sn(s)}`, merge([xf(G.box(0.05, 0.7, 0.1), [s * 0.735, 0.66 - 0.05 * Math.cos(0.21), -0.17 + 0.05 * Math.sin(0.21)], [-0.21, 0, 0]), bodBPillarFace(s)]), MAT.paint, { d: 'Verstevigd profiel in de middenstijl, in carrosseriekleur gelakt. Boven de gordel ligt het gelakte buitenvlak van de stijl onder de zwarte afdekkingen van de portierkaders. Het deel onder de gordellijn is zichtbaar als het voorportier open staat: de sluitplaat met de slotbeugel zit op de voorkant van het profiel.', ex: [s * 0.05, 0, 0] })),
    // sluitplaat en U-beugel op de voorkant van de B-stijl (zelfde plaats en kanteling als het profiel); donker staal tegen de lak, zodat hij als eigen deel leest
    ...both(s => P(`Slotbeugel B-stijl ${sn(s)}`, merge([xf(G.rbox(0.05, 0.16, 0.01, 0.002), [-s * 0.002, -0.05, 0.055]), tube([[s * 0.018, -0.05, 0.05], [s * 0.018, -0.05, 0.115], [-s * 0.018, -0.05, 0.115], [-s * 0.018, -0.05, 0.05]], 0.009, 16, 6)]), MAT.darkSteel, { d: 'Sluitplaat met U-beugel op de B-stijl waar het slot van het voorportier in grijpt (plaats geschat). Zit op de voorkant van de stijl, dus alleen te zien bij open voorportier.', p: [s * 0.735, 0.66, -0.17], r: [-0.21, 0, 0], ex: [s * 0.09, 0, 0.05] })),
    ...both(s => P(`C-stijl ${sn(s)}`, bodGhSide(s, SP, -0.95, 34, z => [cPillarLo(z), z < RW0 ? qScr(z) : bodQR], 16, bodDense(-1.27, -1.15, 6)), MAT.paint, { d: 'Achterste dakstijl met de karakteristieke kromming boven de kwartsruit.', ex: [s * 0.1, 0.04, -0.04] })),
    ...both(quarter),
    // het plaatje reikt tot 5 mm boven de kogelpen en 25 mm eronder (was 25 mm erboven): bij een open klep wijst de veer omhoog en
    // liep de cilinder (32 mm) door de bovenhelft van het plaatje (golf 5b-3, ronde 4; onderrand en afstand tot de lakhuid ongewijzigd)
    ...both(s => P(`Gasveerbevestiging ${sn(s)}`, merge([G.sphere(0.012, 10), xf(G.cyl('x', 0.004, 0.004, 0.012, 8), [s * 0.009, 0, 0]), xf(G.rbox(0.006, 0.03, 0.04, 0.0025), [s * 0.017, -0.01, 0])]), MAT.darkSteel, { d: 'Kogelpen op een plaatje tegen de binnenkant van de C-stijl, aan de zijkant van de opening, waarop de gasveer van de achterklep draait (plaats geschat).', p: [s * bodGsA[0], bodGsA[1], bodGsA[2]], r: [0, 0, s * bodGsTilt], ex: [s * 0.04, 0, 0] })),
    A('Dakantenne', { d: 'Korte staafantenne achter op het dak, van de Laguna III fase 2: een lage kegelvormige voet op de plaatstrook achter het achterste glaspaneel, met een korte, licht naar achteren hellende mast.', ex: [0, 0.14, -0.04] }, (() => {
      const zB = -1.15, y0 = YR(zB), top = [0, y0 + 0.0125, zB], mid = [0, top[1] + 0.05, zB - 0.0052], tip = [0, top[1] + 0.105, zB - 0.011];
      return [
        P('Antennevoet', merge([xf(G.cyl('y', 0.0125, 0.0175, 0.0155, 24), [0, y0 + 0.0043, zB]), xf(G.cyl('y', 0.0085, 0.0105, 0.004, 24), [0, y0 + 0.0143, zB])]), MAT.blackGloss, { d: 'Lage ronde antennevoet met rubber ring, geschroefd op de plaatstrook achter het achterste glaspaneel van het panoramadak, buiten het glas.', ex: [0, 0.03, 0] }),
        P('Antennemast', merge([rodBetween(top, mid, 0.0042, 10), rodBetween(mid, tip, 0.003, 10), xf(G.sphere(0.0048, 10), tip)]), MAT.plastic, { d: 'Korte afschroefbare staafantenne (ongeveer 11 cm, kunststof mast met knop).', ex: [0, 0.08, 0] }),
      ];
    })()),
  ]);
  // achterbouw
  const rfLo = z => { if (z < AXR - ARCH) return bodSY(z, bodYLEDGE + 0.003); if (z <= AXR + ARCH) return Math.max(archS(z), bodSY(z, 0.25)); return bodSY(z, 0.304); };
  const rfHi = z => { if (z <= bodTLZ) return tlLow(z) - 0.002; if (z <= -1.27) return S4 - 0.0008; return bodSY(z, bodRDloZ(z) - 0.004); };
  // de stukken naast de tankopening in drie banden (onder, naast en boven de opening) met dezelfde rijen als de stroken onder en boven de
  // opening (9 en 5 stappen): de naden vallen dan op elkaar, de normalen lopen door en het lak leest zonder rand door rond de kom
  // (waar het paneel lager eindigt dan de opening, bij het portier, vallen de bovenste twee banden weg en dekt de onderste het hele paneel)
  const tkE0 = z => clamp(bodSY(z, bodTkY[0]), rfLo(z), rfHi(z)), tkE1 = z => clamp(bodSY(z, bodTkY[1]), tkE0(z), rfHi(z));
  // stations naar doorbuiging (koorde hoogstens 0,8 mm, golf 5b-2): de knikken van de onder- en bovenrand (wielboog, achterlicht, naad
  // bij het achterportier) blijven vast. Links over het hele paneel; rechts alleen de rijen (gemeten over het hele bereik van het paneel),
  // de banden houden 9, 6 en 5 gelijke stappen, zodat ze op de naden met de stukken onder en boven de opening blijven aansluiten.
  const rfSag = (z0, z1, o = {}) => bodSagSide(z0, z1, z => [rfLo(z), rfHi(z)], 0.0008, Object.assign({ keep: ARCH_BREAKS.concat([-1.271, -1.269, bodTLZ, bodTLZ - 0.001]), extra: bodDense(-1.27, -0.66, 10).concat(bodDense(bodZT, bodTLZ, 5)), nuF: 200, nvF: 96 }, o));
  const rfUni = n => Array.from({ length: n + 1 }, (_, j) => j / n);
  const tkBands = (s, z0, z1) => { const zs = rfSag(z0, z1).zs;
    return [[rfLo, tkE0, 9], [tkE0, tkE1, 6], [tkE1, rfHi, 5]].map(([a, b, n]) => bodSagSide(z0, z1, z => [a(z), b(z)], 0, { zs, vf: rfUni(n) }).geo(s)); };
  const rearFender = s => merge([
    ...(s < 0 ? [
      // rechterscherm: opening voor de tankklep; de rest van het paneel is in stukken om de opening heen gelegd en aan elkaar gelast,
      // zodat de normalen over de naden doorlopen en het lak rond de kom zonder zichtbare naad doorloopt
      weldAll(merge([
        ...tkBands(s, bodZT, bodTkZ[0]),
        ...tkBands(s, bodTkZ[1], -0.667),
        lowSide(s, bodTkZ[0], bodTkZ[1], 14, z => [rfLo(z), bodSY(z, bodTkY[0])], 9),
        lowSide(s, bodTkZ[0], bodTkZ[1], 14, z => [bodSY(z, bodTkY[1]), rfHi(z)], 5)])),
    ] : [rfSag(bodZT, -0.667).geo(s)]),
    lowSide(s, bodZT, SP, 16, z => [z <= bodTLZ ? bodTLhi(z) + 0.001 : S4, Math.max(S4 + 1e-4, bodSAtX(z, bodTGdx(z)) - 0.003)], 4, bodDense(bodZT, -2.2, 4)),
    // band boven het achterlicht tussen de onderrand van de achterruit (SP) en de punt van de lamp: sluit de spleet tot de schouder
    lowSide(s, SP - 0.002, bodTLZ + 0.001, 10, z => [Math.min(bodTLhi(z) + 0.001, S4 - 0.004), S4 - 0.0008], 2),
    bodSPweb(s, 0, bodQScr(SP) + 0.005, 0.001),
    bodMirX(bodTailGeo(bodTGseam(0.7) + 0.003, 1.2, bodYLEDGE + 0.004, bodTLY(bodZT, 0), 0, 8, 4), s),
    bodMirX(bodTailGeo(bodTGseam(1.0) + 0.003, 1.2, bodTLY(bodZT, 1), bodSec(bodZT).yd - 0.002, 0, 4, 4), s),
    archLip(s, AXR),
  ]);
  const rear = A('Achterbouw', { d: 'Achterschermen, binnenwielkasten, achterpaneel, hoedenplanksteunen en bumperbalk achter.', ex: [0, 0.04, -0.42] }, [
    ...both(s => P(`Achterscherm ${sn(s)}`, s < 0 ? bodWeld(rearFender(s)) : rearFender(s), MAT.paint, { d: 'Gelast achterzijpaneel van achterportier tot achterlicht, met de wielboogflens.', ex: [s * 0.22, 0, -0.04] })),
    ...both(s => P(`Wielkast achter ${sn(s)}`, merge([G.half('x', bodWHR, 0.22, PI, 24), xf(bodRearWHWall(s), [-s * 0.62, -AY, -AXR])]), MAT.underbody, { d: 'Gesloten binnenwielkast achter met donkere steenslagcoating, gelast aan vloer en achterscherm: kuip boven het wiel en binnenwand naar interieur en bagageruimte, met een sleuf voor de torsiebalk en een veerkoker waar de schroefveer tegen drukt.', p: [s * 0.62, AY, AXR], ex: [s * 0.1, 0.04, 0] })),
    ...both(s => P(`Hoedenplanksteun ${sn(s)}`, G.rbox(0.05, 0.16, 0.5, 0.01), MAT.paintIn, { d: 'Steun van de bagageruimteafdekking tegen de binnenzijwand.', p: [s * 0.66, 0.92, -1.85], ex: [s * 0.06, 0.04, 0] })),
    P('Achterpaneel', G.rbox(1.2, 0.26, 0.012, 0.004), MAT.paintIn, { d: 'Dwarspaneel onder de achterklepopening met de slotbeugel.', p: [0, 0.5, bodZT + 0.03], ex: [0, 0, -0.06] }),
    P('Achterklepsponning', tube(bodTGPath(0.045), 0.012, 80, 6), MAT.paintIn, { d: 'Gelaste sponning rond de achterklepopening waarop de afdichting zit.', ex: [0, 0.04, -0.04] }),
    P('Bumperbalk achter', tube([-0.55, -0.42, -0.28, 0, 0.28, 0.42, 0.55].map(x => [x, 0.5, Math.max(bodZT + 0.02, bodRearZ(Math.abs(x), 0.5) + 0.075)]), 0.04, 24, 8), MAT.steel, { d: 'Stalen botsbalk achter de achterbumper.', ex: [0, 0, -0.1] }),
  ]);
  // binnen de boogopening: de buitenrand volgt de huid op 6 mm; het laatste stuk loopt uit tot 8 mm voorbij de boogrand,
  // achter de huid, zodat er geen open ring tussen scherm en boog is waardoor je de holte achter het scherm in kijkt
  const liner = (s, az, nm) => P(`Wielkuipscherm ${nm}`, patch((a, t) => { const f = Math.max(0, t * 3 - 2), r = ARCH - 0.01 + f * 0.018, z = az + r * Math.cos(a), y = AY + r * Math.sin(a), xs = surfX(z, y);
    return [s * (f > 0 ? lerp(xs - 0.012, xs - 0.006, f) : lerp(0.61, xs - 0.012, t * 1.5)), y, z]; }, -0.2, PI + 0.2, 28, () => [0, 1], 3), MAT.plastic, { d: 'Kunststof binnenscherm in de wielkast tegen steenslag en vuil.', ex: [s * 0.1, 0.08, 0] });
  const liners = A('Wielkuipschermen', { d: 'Kunststof binnenschermen in de vier wielkasten.', ex: [0, -0.12, 0] }, [liner(L, AXF, 'linksvoor'), liner(R, AXF, 'rechtsvoor'), liner(L, AXR, 'linksachter'), liner(R, AXR, 'rechtsachter')]);
  const cage = A('Carrosseriekooi', { d: 'De gelaste ruwbouw (body in white): vloer, voorbouw, stijlen, dak en achterbouw, met de vaste buitenpanelen.', ex: [0, 0, 0] }, [floorGrp, frontGrp, sideRoof, rear, liners]);

  /* ================= motorkap ================= */
  const hoodS = z => bodHoodS(z) + 0.0018;
  const hoodBr = bodDense(2.2, bodHoodZ1 - 0.002, 10).concat([bodHoodZ1 - 0.0005]);
  const hoodIn = (off, a, b, da) => bodDeck(a, b, 28, z => Math.min(0.995, bodHoodS(z) + da), 12, bodDense(2.1, b, 4), off);
  const bodSprT = [0, bodSec(1.4).yd - 0.05, 1.4, 0.012, 0.016];   // T-stuk sproeierslangen: hart (x, y, z), halve lengte dwars, lengte uitloop naar voren
  const hood = A('Motorkap', { d: 'Motorkap van aluminium (werkplaatshandboek MR 415, hoofdstuk 48A) met binnenframe, isolatie, scharnieren, slotbeugel, veiligheidshaak en sproeiers.', ex: [0, 0.52, 0.3], open: hinge(bodHoodPv, [1, 0, 0], bodHoodAng, { min: 55 * PI / 180, label: 'Motorkap', look: { dir: [0.5, 0.55, 1], nodes: ['Motorkap', 'Motor F4Rt', 'Radiateur'] } }) }, [
    P('Buitenpaneel motorkap', bodDeck(WS0 + 0.004, bodHoodZ1 - 0.0003, 60, z => Math.min(0.9995, hoodS(z)), 30, hoodBr), MAT.paint, { d: 'Buitenhuid van aluminium plaat van de motorkap met twee vouwlijnen van de koplampen naar de voorruit.', ex: [0, 0.14, 0] }),
    P('Binnenframe motorkap', hoodIn(0.03, 1.15, 2.26, 0.012), MAT.paintIn, { d: 'Verstevigend binnenframe met de bevestigingspunten van scharnieren en slotbeugel.', ex: [0, 0, 0] }),
    P('Motorkapisolatie', hoodIn(0.04, 1.22, 2.12, 0.04), MAT.carpet, { d: 'Geluids- en hitte-isolatiemat aan de onderzijde.', ex: [0, -0.1, 0] }),
    ...both(s => A(`Kapscharnier ${sn(s)}`, { d: 'Scharnier achteraan de motorkap: een arm aan het binnenframe van de kap en een voet op de veerpoottoren in de carrosserie. In de gesloten stand ligt de arm op de voet; de draaias is in dit model de achterrand van de kap (schematisch).', ex: [s * 0.08, -0.04, -0.06] }, [
      P('Scharnierarm', G.rbox(0.02, 0.05, 0.14, 0.006), MAT.darkSteel, { d: 'Gebogen scharnierarm aan het binnenframe van de kap; draait met de kap mee.', p: [s * 0.64, 0.879, 1.28], ex: [0, -0.03, 0] }),
      ...[0, 1].map(i => P(`Kapscharnierbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout M8 tussen scharnier en binnenframe.', p: [s * 0.64, 0.905, 1.25 + i * 0.06], r: [PI, 0, 0], ex: [0, 0.05, 0] })),
      P('Scharnierbasis', merge([G.rbox(0.05, 0.012, 0.13, 0.004), xf(G.rbox(0.012, 0.034, 0.1, 0.003), [s * 0.019, -0.022, 0])]), MAT.darkSteel, { d: 'Scharnierbasis op de veerpoottoren: het deel van het kapscharnier aan de carrosseriezijde. Blijft staan als de kap opent (schematisch weergegeven).', p: [s * 0.64, 0.849, 1.28], stay: true, ex: [0, -0.05, 0] }),
    ])),
    P('Slotbeugel motorkap', tube([[-0.02, 0.0, 0], [-0.02, -0.04, 0], [0.02, -0.04, 0], [0.02, 0, 0]].map(([x, y]) => [x, bodSec(2.2).yd - 0.05 + y, 2.2]), 0.004, 12, 6), MAT.steel, { d: 'Beugel aan het binnenframe die in het motorkapslot op de frontmodule grijpt.', ex: [0, -0.08, 0.04] }),
    P('Veiligheidshaak', G.rbox(0.015, 0.05, 0.03, 0.004), MAT.steel, { d: 'Tweede vanghaak die de kap vasthoudt als het slot ontgrendeld is.', p: [0.06, bodSec(2.18).yd - 0.075, 2.18], ex: [0, -0.07, 0] }),
    // steunstang van 0,50 m (geen gasveren, zie HB2 4.3): in rust vastgeklikt in de steunhouder voor op de rechter wielkast, open staat hij van zijn voet op de
    // wielkast naar de opvanger in het binnenframe; eigen scharnier om de voet, volgt de kap en blijft in het frame van de rustende kap
    P('Motorkapsteun', rodBetween([0, 0, 0], bodStRot.r0.clone().multiplyScalar(bodStL).toArray(), bodStR, 10), MAT.darkSteel, { d: 'Steunstang van ongeveer 0,5 m (afmeting geschat) die de geopende kap ondersteunt. In rust zit hij in de steunhouder voor in de motorruimte; open draait hij om zijn voet op de rechter wielkast omhoog naar de opvanger in het binnenframe van de kap.', p: bodStF, stay: true, ex: [-0.04, 0.06, 0],
      open: follow('Motorkap', bodStF, bodStRot.ax, bodStRot.ang, { label: 'Motorkapsteun' }) }),
    P('Steunopvanger', merge([G.rbox(0.032, 0.016, 0.032, 0.005), xf(G.rbox(0.032, 0.012, 0.032, 0.005), [0, -0.012, 0])]), MAT.plastic, { d: 'Kunststof opvanger in het binnenframe van de kap waarin de bovenkant van de steunstang valt.', p: [bodStG[0], bodStG[1] + 0.012, bodStG[2]], ex: [0, -0.06, 0] }),
    P('Kapafdichting', tube([-0.6, -0.3, 0, 0.3, 0.6].map(x => [x, bodSec(1.14).yd - 0.035 - 0.1 * x * x, 1.145]), 0.008, 20, 6), MAT.rubber, { d: 'Rubber afdichting tussen kap en torpedobak.', stay: true, ex: [0, -0.05, -0.04] }),
    ...both(s => A(`Ruitensproeier ${sn(s)}`, { d: 'Sproeier van de ruitensproeierinstallatie aan de achterrand van de kap.', ex: [0, 0.05, 0] }, [
      P('Sproeierkop', G.lathe('y', [[0, 0.0045], [0.004, 0.0043], [0.0085, 0.003], [0.0112, 0.0008], [0.0112, -0.005], [0, -0.005]], 20, 'bodSprHead'), MAT.plasticGrey, { d: 'Grijze kunststof sproeierkop, ronde koepel die half in de kap verzonken zit en door de huid steekt.', p: [s * 0.28, halfPt(1.17, bodSAtX(1.17, 0.28))[1] - 0.0015, 1.17], ex: [0, 0.04, 0] }),
      P('Sproeieropening', G.rbox(0.011, 0.0016, 0.0024, 0.0008), MAT.blackGloss, { d: 'Dwarse sleuf in de koepel waaruit de waaiervormige straal komt.', p: [s * 0.28, halfPt(1.17, bodSAtX(1.17, 0.28))[1] + 0.0031, 1.17], ex: [0, 0.06, 0] }),
      P('Sproeierslang', tube([[s * 0.28, halfPt(1.17, bodSAtX(1.17, 0.28))[1] - 0.02, 1.17], [s * 0.15, bodSec(1.3).yd - 0.05, 1.3], [s * 0.06, bodSec(1.4).yd - 0.049, 1.39], [s * 0.03, bodSprT[1], bodSprT[2]], [s * (bodSprT[3] + 0.0003), bodSprT[1], bodSprT[2]]], 0.003, 16, 5), MAT.rubber, { d: 'Toevoerslang onder de kap, van het T-stuk op de hartlijn naar de sproeier.', ex: [0, -0.03, 0] }),
    ])),
    // T-stuk op de hartlijn waar de twee sproeierslangen samenkomen, met een uitloop naar voren; de doorverbinding loopt onder de isolatie en
    // boven de motorafdekkap naar de linker scharnierhoek en zakt daar onder y 0,88 naar de slangkoppeling van het systeem (wereld 0,60; 0,815; 1,48),
    // waar het einde bij gesloten kap 0,5 mm boven de koppeling stopt. Route schematisch.
    P('T-stuk sproeierslang', merge([G.cyl('x', 0.0045, 0.0045, 2 * bodSprT[3], 10), xf(G.cyl('z', 0.0045, 0.0045, bodSprT[4], 10), [0, 0, bodSprT[4] / 2])]), MAT.plastic, { d: 'Kunststof T-stuk dat de slangen naar de twee sproeiers voedt vanuit de ene toevoerslang.', p: bodSprT.slice(0, 3), ex: [0, -0.05, 0] }),
    P('Sproeierslang naar koppeling', tube([[0, bodSprT[1], bodSprT[2] + bodSprT[4] + 0.0003], [0, bodSprT[1] - 0.001, 1.428], [0.05, 0.895, 1.44], [0.12, 0.879, 1.45], [0.30, 0.871, 1.462], [0.45, 0.865, 1.472], [0.55, 0.86, 1.478], [0.592, 0.85, 1.48], [0.60, 0.835, 1.48], [0.60, 0.8205, 1.48]], 0.003, 40, 5), MAT.rubber, { d: 'Toevoerslang onder de kap van de slangkoppeling bij de linker veerpoottoren naar het T-stuk; loopt met de kap mee als die opent (route schematisch).', ex: [0.03, -0.05, 0] }),
  ]);

  /* ================= voorschermen ================= */
  const ffLo = z => { if (z < AXF - ARCH) return bodSY(z, 0.304); if (z <= AXF + ARCH) return archS(z); return bodSY(z, bodSeamF(z) + 0.004); };
  const ffHi = z => z < 0.905 ? bodSY(z, bodFDlo(z) - 0.004) : S4 - 0.0008;
  const fender = s => A(`Voorscherm ${sn(s)}`, { d: 'Geschroefd voorscherm boven het voorwiel, met wielboogflens.', ex: [s * 0.5, 0.08, 0.22] }, [
    P('Schermpaneel', merge([lowSide(s, 0.842, bodHLZ0 - 0.002, 60, z => [ffLo(z), ffHi(z)], 22, ARCH_BREAKS.concat(bodDense(0.842, 0.906, 6), bodDense(1.75, 1.81, 4))), archLip(s, AXF)]), MAT.paint, { d: 'Kunststof of stalen spatbord, in carrosseriekleur gelakt.', ex: [s * 0.04, 0, 0] }),
    ...[1.0, 1.25, 1.5, 1.72].map((z, i) => P(`Schermbout ${i + 1}`, hexBolt(0.02, 0.007, 'y'), MAT.steel, { d: 'Bout langs de bovenflens waarmee het scherm aan de binnenwand vastzit.', p: [s * (bodSec(z).xe - 0.03), YT(z) - 0.012, z], ex: [0, 0.06, 0] })),
    P('Schermsteun', G.rbox(0.03, 0.08, 0.06, 0.006), MAT.darkSteel, { d: 'Steun die de voorkant van het scherm aan de frontmodule verbindt.', p: [s * (surfX(1.78, 0.6) - 0.05), 0.6, 1.78], ex: [-s * 0.04, 0, 0.04] }),
    // flenzen onder de naden met de motorkap (6 mm onder de huid) en met de bumper (4 mm): door de naden zag je eerst afwisselend het lichte
    // binnenframe van de kap en niets, zodat de naden als gestippelde wit-zwarte lijn lazen (S7, golf 5f ronde 2)
    P('Schermflens', merge([lowSide(s, WS0 + 0.004, bodHLZ0 - 0.002, 40, () => [S4 - 0.006, S4 + 0.010], 2, [], 0.006),
      lowSide(s, AXF + ARCH + 0.001, bodHLZ0 - 0.002, 12, z => [bodSY(z, bodSeamF(z) - 0.03), bodSY(z, bodSeamF(z) + 0.03)], 4, [], 0.004)]), MAT.plastic, { d: 'Bovenflens van het scherm onder de naad met de motorkap en voorflens onder de naad met de bumper, waar de bumper in valt; in de schaduw van de naad, donker weergegeven.', ex: [s * 0.02, -0.02, 0] }),
  ]);

  /* ================= voorbumper ================= */
  const fbLo = () => S1 * 0.45;
  // de bovenrand onder de naad met het scherm ligt 9 mm (in hoogte) onder de onderrand van het scherm (was 4 mm): de naad is
  // daardoor overal ca. 1,5 mm breed met de schermflens eronder, in plaats van een spleet van hoogstens 0,7 mm die als stippellijn las
  const fbHi = z => { if (z < bodHLZ0) return bodSY(z, bodSeamF(z) - 0.005 * clamp((bodHLZ0 - z) / 0.012, 0, 1)); if (z <= bodHLZ1) return hlLow(z) - 0.002; const h = bodHoodS(z); return h >= 1 ? 1 : h - 0.002; };   // voor de kap: beide helften sluiten op de hartlijn
  // extra stations vlak voor de neus van de kap: daar loopt de kapvoorrand bijna dwars en liet lineaire interpolatie een gaatje open
const bodHoodTip = [2.284, 2.286, 2.288, 2.289, 2.2895, 2.2899, 2.2903];
  const fbBr = bodDense(1.752, 1.82, 4).concat(bodDense(2.15, ZF, 16), bodDense(2.235, bodHoodZ1, 8), bodHoodTip);
  // onderste inlaat als echte opening in de bumperschaal (binnen de chromen U), met wanden naar een verzonken rooster
  const inX = 0.462, inY0 = 0.316, inY1 = 0.436, inD = 0.03;
  // stations naar doorbuiging (koorde hoogstens 1 mm, golf 5b-2): de stations voor de neus van de kap en de knikken van de bovenrand
  // (koplamp en kapvoorrand) blijven vast, de overige stations uit fbBr zijn kandidaten; was 56 x 30 gelijke stappen plus fbBr
  const shF = bodSagSide(1.752, ZF, z => [fbLo(z), fbHi(z)], 0.001, { keep: bodHoodTip.concat([bodHLZ0, bodHLZ1, bodHoodZ1]), extra: fbBr, nuF: 240, nvF: 128 });
  const shellF = bodDropDegen(bodWeld(merge([shF.geo(L), shF.geo(R), bodCap(ZF - 1e-4, 1)].map(g => bodClipOut(g, inX, inY0, inY1, 2.1)))));
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
    // golf 5h: de band is 5 cm hoog en 0,66 m breed (was 3 cm en 0,60 m), zoals de zwarte bovengrille tussen de koplampspitsen op de persfoto
    A('Bovengrille', { d: 'Smalle zwarte band direct onder de voorrand van de motorkap, tussen de binnenspitsen van de koplampen.', ex: [0, 0.04, 0.12] }, [
      P('Grillesleuf', fFace(-0.33, 0.33, 0.598, 0.648, 0.003, 20, 3), MAT.blackGloss, { d: 'Hoogglans zwart rooster dat de smalle sleuf tussen de kapvoorrand en de bumper afsluit.', ex: [0, 0, 0] }),
      P('Chroomlijn grille', tube([-0.33, -0.165, 0, 0.165, 0.33].map(x => [x, 0.592, frontZ(x, 0.592) + 0.001]), 0.005, 16, 8), MAT.bodChrome, { d: 'Dunne chroomlijn onder de grillesleuf.', ex: [0, -0.02, 0.04] }),
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
    // lip in twee banden: de vlakke onderkant (s 0 tot S1) en de onderste ronding tot 2,2 cm hoog met vier rijen. Eerder vier gelijke rijen
    // over het geheel, waarvan hoogstens één over de ronding: die koorde zakte tot ca. 6 mm, dieper dan de 3 mm afstand tot de huid, zodat
    // de bumperschaal er in de beelden van voren gekarteld wit-zwart doorheen stak (S7, golf 5f ronde 2)
    P('Onderlip', merge([L, R].flatMap(sd => [lowSide(sd, 1.80, ZF, 60, () => [0, S1], 2, bodDense(2.2, ZF, 16), -0.003),
      lowSide(sd, 1.80, ZF, 60, z => [S1, Math.max(S1 + 1e-4, bodSY(z, YB(z) + 0.022))], 4, bodDense(2.2, ZF, 16), -0.003)])), MAT.plastic, { d: 'Zwarte spoilerlip onder de bumper.', ex: [0, -0.08, 0.06] }),
    // strip 2,5 mm boven de huid met 32 stations (was 14, de randen lazen als zaagtand) en een punt van 6 cm naar voren toe, zodat het
    // voorste eind niet als los wit blokje van de bumper afstaat
    ...both(s => P(`Sierstrip onderlip ${sn(s)}`, lowSide(s, 1.76, 2.15, 32, z => { const w = 0.009 * (0.15 + 0.85 * sstep((2.15 - z) / 0.06)); return [bodSY(z, YB(z) + 0.037 - w), bodSY(z, YB(z) + 0.037 + w)]; }, 1, [], -0.0025), MAT.bodBright, { d: 'Zilveren strip langs de bumperzijde die doorloopt in de dorpelsierlijst.', ex: [s * 0.06, -0.03, 0] })),
    A('Koplampsproeiers', { d: 'Twee uitschuifbare koplampsproeiers onder de bi-xenon koplampen.', ex: [0, 0.02, 0.08] }, both(s => { const z = 2.0, y = bodHLlo(z) - 0.035, p = bodAt(z, y, 0.004), nn = bodNormalAt(z, y);
      return A(`Koplampsproeier ${sn(s)}`, { d: 'Uitschuifbare koplampsproeier (Initiale Paris: koplampsproeiers bij de bi-xenon).', ex: [s * 0.1, 0, 0.1] }, [
        P('Sproeierkapje', G.rbox(0.012, 0.025, 0.06, 0.008), MAT.paint, { d: 'Kapje in carrosseriekleur.', ...bodPose(s, p, nn) }),
        // kop 1,5 mm onder de huid in plaats van er precies tegen: de bumperschaal met stations naar doorbuiging ligt daar tot 0,5 mm lager
        P('Sproeierkop koplamp', G.cyl('x', 0.008, 0.008, 0.04, 10), MAT.plastic, { d: 'Telescopische sproeierkop.', inner: true, ...bodPose(s, bodAt(z, y, -0.0215), nn), ex: [s * 0.04, 0, 0.03] }),
      ]); })),
    A('Parkeersensoren voor', { d: 'Vier ultrasone sensoren van de parkeerhulp voor (op de Initiale aannemelijk standaard, in andere markten optie).', ex: [0, 0.03, 0.12] }, [-0.42, -0.15, 0.15, 0.42].map((x, i) => P(`Parkeersensor voor ${i + 1}`, G.cyl('z', 0.011, 0.011, 0.02, 12), MAT.paint, { d: 'Ultrasone parkeersensor voor (op de Initiale aannemelijk standaard, in andere markten optie).', p: fPt(x, 0.452, -0.006), ex: [0, 0.02, 0.06] }))),
    ...both(s => P(`Bumpersteun voor ${sn(s)}`, G.rbox(0.05, 0.08, 0.12, 0.01), MAT.plastic, { d: 'Steun die de bumperschaal aan voorscherm en frontmodule vasthoudt.', p: [s * 0.74, 0.5, 1.86], ex: [s * 0.05, 0, 0] })),
  ]);

  /* ================= achterbumper ================= */
  const rbBr = bodDense(-2.3, bodZT, 4);
  // uitlaatuitsparing (golf 5f ronde 2): een echte inham in de onderrand van de bumper, |x| 0,385 tot 0,515, tot y 0,345 en van z -2,13
  // naar achteren (binnen de kabelboom naar de achterlichten, die in de hoek op x 0,53 tot 0,6 omhoog loopt). Bumperschaal en onderschort worden op de vlakken van dat blok geknipt; plafond, voorwand en zijwanden (zwart, 3 mm
  // onder de onderrand beginnend zodat ze de rand van de onderschort dekken) sluiten de inham. Het eindstuk van het uitlaatsysteem zit er
  // met de achterkant gelijk met het bumpervlak in; eerder was dit een zwart vlakje op de onderkant en hing het eindstuk eronder
  // voorwand op z -2,13 (was -2,15): daar raakte de oplopende uitlaatpijp de onderrand van de voorwand op 0,1 mm (advisorronde golf 5f)
  const exX0 = 0.385, exX1 = 0.515, exY1 = 0.345, exZF = -2.13, exC = [0.45, 0.305, -2.22];
  const exCut = g => bodClipBox(bodClipBox(g, 1, exX0, exX1, exY1, exZF), -1, exX0, exX1, exY1, exZF);
  const exLowY = (z, x) => { if (!bodInside(z, x, exY1)) return exY1; let lo = bodSec(z).yb, hi = exY1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bodInside(z, x, m)) hi = m; else lo = m; } return hi; };
  const exWalls = s => {
    const yL = (z, x) => Math.min(exY1 - 0.001, exLowY(z, x) - 0.003), zE = x => bodRearZ(x, exY1);
    const g = merge([
      patch((x, t) => [s * x, exY1, lerp(exZF, zE(x), t)], exX0, exX1, 8, () => [0, 1], 8),
      patch((x, y) => [s * x, y, exZF], exX0, exX1, 8, x => [yL(exZF, x), exY1], 3),
      ...[exX0, exX1].map(xw => patch((z, y) => [s * xw, y, z], exZF, zE(xw), 12, z => [yL(z, xw), exY1], 3)),
    ].map(q => q.toNonIndexed()));
    // driehoeken met de voorzijde naar het hart van de inham (daar zit het eindstuk)
    const P3 = g.attributes.position, A3 = P3.array, c = [s * exC[0], exC[1], exC[2]];
    for (let i = 0; i < P3.count; i += 3) {
      const a = [0, 1, 2].map(k => [P3.getX(i + k), P3.getY(i + k), P3.getZ(i + k)]), u = a[1].map((v, k) => v - a[0][k]), w = a[2].map((v, k) => v - a[0][k]);
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], m = a[0].map((v, k) => (v + a[1][k] + a[2][k]) / 3 - c[k]);
      if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] > 0) for (let k = 0; k < 3; k++) { const t = A3[3 * (i + 1) + k]; A3[3 * (i + 1) + k] = A3[3 * (i + 2) + k]; A3[3 * (i + 2) + k] = t; }
    }
    g.computeVertexNormals(); return g;
  };
  // verdiepte kentekenuitsparing (fase 2-foto): plaat met het midden op y 0,46, opening ca. 2 cm rondom de plaat, wanden schuin naar binnen
  // naar een bodem 1 cm diep. De bumperschaal krijgt daar een echte opening: de driehoeken van de staartpunt worden exact op de rand van
  // de opening geknipt (bodClipOut in een over z gespiegeld frame, alleen achter z -2,28); de wanden beginnen 0,3 mm boven de huid op de
  // snijrand. Het kraagvlak van 1,2 mm rondom (golf 5b) las als lichte rechthoek los van de bumper en is weg (S7, golf 5f ronde 2). Eerder vielen hele driehoeken weg die de opening raakten; dat vroeg fijne driehoeken rond de opening. Na het knippen
  // weer gelast (weldAll), zodat het stuk gladde normalen houdt zoals voorheen en niet in vlakjes leest.
  const rPlateY = 0.46, rcX = 0.285, rcY0 = 0.385, rcY1 = 0.527, rcXi = 0.272, rcYi0 = 0.396, rcYi1 = 0.521, rcD = 0.010, rcOut = 0.0003;
  const bodCut = g => { g.scale(1, 1, -1); const r = bodClipOut(g, rcX, rcY0, rcY1, 2.28); r.scale(1, 1, -1); return weldAll(r); };
  // stations naar doorbuiging (koorde hoogstens 0,3 mm, golf 5b-2; bij 0,6 mm lazen de hoeken naast de uitsparing in vlakjes); de
  // stations van de kentekenuitsparing (tipBr) en van de richel (rbBr) blijven vast. Was 30 x 22 (zijkant), 24 x 26 plus tipBr en
  // 12 x 18 plus rbBr (staartpunt) gelijke stappen.
  const tipBr = rbBr.concat(bodDense(ZR, -2.296, 30));
  const shRs = bodSagSide(-1.778, bodZT, z => [S1 * 0.45, bodSY(z, bodYLEDGE)], 0.0003, { nuF: 120, nvF: 120 });
  // de staartpunt eindigt 0,1 mm voor bodZT: op bodZT zelf geeft bodSec de volle doorsnede van het achterscherm (tot het dek), en de laatste
  // strook van de schaal stond daardoor als verborgen schot van de richel tot het dek achter het staartvlak (de binnenbekleding van de klep
  // zwaaide er bij het openen doorheen; golf 5f ronde 2)
  const shRa = bodSagSide(ZR + 1e-4, bodZT - 1e-4, () => [0, S2], 0.0003, { keep: tipBr, nuF: 48, nvF: 160 });
  const shRb = bodSagSide(ZR + 1e-4, bodZT - 1e-4, () => [S2, 1], 0.0003, { keep: rbBr, nuF: 48, nvF: 160 });
  const shellR = bodWeld(exCut(merge([
    shRs.geo(L), shRs.geo(R),
    ...[shRa.geo(L), shRb.geo(L), shRa.geo(R), shRb.geo(R)].map(bodCut),
    // sluitvlak op de staartpunt licht bol (hoogstens 4 mm, binnen ZR - 6 mm): een vlak eindvlak las als lichte rechthoek boven de kentekenuitsparing
    (() => { const z = ZR + 1e-4, c = bodSec(z); return patch((y, t) => { const X = ringX(z, y), v = 2 * (y - c.yb) / (c.yd - c.yb) - 1; return [X * t, y, z - 0.004 * (1 - t * t) * (1 - v * v)]; }, c.yb + 1e-4, c.yd - 1e-4, 8, () => [-1, 1], 16); })(),
  ])));
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
    P('Onderschort', bodWeld(exCut(merge([L, R].map(sd => lowSide(sd, -2.02, zVal, 40, z => [0, bodSY(z, Math.max(YB(z) + 0.002, Math.min(0.368, YB(z) + 0.09)))], 8, bodDense(-2.3, bodZT, 6).concat(bodDense(zVal, -2.3, 4)), -0.0025))))), MAT.bodValance, { d: 'Donkergrijze kunststof onderschort langs de onderrand van de achterbumper (ca. 9 cm hoog), met de uitsparingen voor de uitlaat.', ex: [0, -0.08, -0.04] }),
    P('Mistachterlicht', G.rbox(0.1, 0.03, 0.012, 0.006), MAT.lensRed, { d: 'Mistachterlicht onderin de bumper aan de bestuurderszijde (positie geschat uit fase 2-foto\'s).', p: [0.62, 0.34, bodRearZ(0.62, 0.34) - 0.004], ex: [0.04, 0, -0.08] }),
    P('Reflector rechts', G.rbox(0.1, 0.03, 0.01, 0.006), MAT.lensRed, { d: 'Rode reflector onderin de bumper.', p: [-0.62, 0.34, bodRearZ(0.62, 0.34) - 0.004], ex: [-0.04, 0, -0.08] }),
    A('Parkeersensoren achter', { d: 'Vier ultrasone sensoren van de parkeerhulp achter (standaard op Initiale Paris), onder en naast de kentekenuitsparing.', ex: [0, 0.03, -0.12] }, [[0.5, 0.43], [0.17, 0.345], [-0.17, 0.345], [-0.5, 0.43]].map(([x, y], i) => P(`Parkeersensor achter ${i + 1}`, G.cyl('z', 0.011, 0.011, 0.02, 12), MAT.paint, { d: 'Ultrasone parkeersensor achter (standaard op Initiale Paris).', p: [x, y, bodRearZ(x, y) + 0.006], ex: [0, 0.02, -0.06] }))),
    ...both(s => P(`Uitlaatuitsparing ${sn(s)}`, exWalls(s), MAT.blackGloss, { d: 'Zwarte inham in de onderrand van de bumper (ca. 13 cm breed, 5 tot 7 cm hoog) waarin het verchroomde uitlaateindstuk zit; het eindstuk zelf hoort bij het uitlaatsysteem. Vorm en maat geschat.', ex: [0, -0.04, -0.06] })),
    ...both(s => P(`Bumpersteun achter ${sn(s)}`, G.rbox(0.05, 0.08, 0.14, 0.01), MAT.plastic, { d: 'Geleider die de bumperschaal aan het achterscherm vasthoudt; door de naad bij de bumperrichel net zichtbaar.', p: [s * 0.76, 0.55, -1.95], ex: [s * 0.05, 0, 0] })),
  ]);

  /* ================= achterklep ================= */
  const tgFace = (x0, x1, y0, y1, ny = 6, nx = 14) => bodTailGeo(x0, x1, y0, y1, 0, ny, nx);
  const gsP = (s, z, inw) => { const p = bodGhHalf(z, bodQS + 0.04); return [s * (p[0] - inw), p[1] - inw, z]; };
  const ydT = bodSec(bodZT).yd;
  const tgOuter = merge([
    tgFace(-bodTGseam(0.7), bodTGseam(0.7), bodYLEDGE + 0.004, bodTLY(bodZT, 0), 8),
    bodTLgeo(y => -bodTLxin(y), bodTLxin, bodTLY(bodZT, 0), bodTLY(bodZT, 1), 0, 10),
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
  // punt op het glas bij (z, x) met lift meter erboven (het glas volgt hetzelfde profiel als het dak, zie panP in panorama.js); eerder lag het wisserblad 12 cm onder het glas, in de cabine
  const wTip = panP(-1.5, 0.5, 0.012);
  // lijmrand rond de achterruit aan de binnenkant: vier stroken van 7 cm (zijkanten) en 5 tot 6 cm (boven en onder), 3 cm onder het glas; het midden blijft open
  const tgInP = (z, w) => { const p = ghPt(z, w); return [p[0] * 0.97, p[1] - 0.03, z]; };
  const tgWo = z => bodQScr(z) / 2 + 0.006;
  const tgWi = z => { const x0 = Math.abs(ghPt(z, tgWo(z))[0]); let lo = tgWo(z), hi = 0.5; for (let k = 0; k < 26; k++) { const m = (lo + hi) / 2; if (Math.abs(ghPt(z, m)[0]) > x0 - 0.07) lo = m; else hi = m; } return (lo + hi) / 2; };
  const tgZ0 = SP + 0.04, tgZ1 = RW0 - 0.06;
  const tgRing = [patch(tgInP, tgZ0, tgZ1, 14, z => [tgWo(z), tgWi(z)], 2), patch(tgInP, tgZ0, tgZ1, 14, z => [1 - tgWi(z), 1 - tgWo(z)], 2),
    patch(tgInP, tgZ0, tgZ0 + 0.06, 2, z => [tgWo(z), 1 - tgWo(z)], 8), patch(tgInP, tgZ1 - 0.05, tgZ1, 2, z => [tgWo(z), 1 - tgWo(z)], 8)];
  const tailgate = A('Achterklep', { d: 'Grote achterklep met de hele achterruit, typerend voor de vijfdeurs hatchback, met spoilerlip, derde remlicht en achterruitenwisser. Scharniert aan de dakrand en wordt door twee gasveren omhooggehouden.', ex: [0, 0.42, -0.5],
    open: hinge(bodTgPv, [1, 0, 0], bodTgAng, { min: 60 * PI / 180, label: 'Achterklep', look: { dir: [0.6, 0.6, -1], nodes: ['Achterklep', 'Gasveer links', 'Gasveer rechts'] } }) }, [
    P('Buitenpaneel achterklep', merge([tgOuter, bodSPweb(1, bodQScr(SP), 1, 0.003, 16), bodSPweb(-1, bodQScr(SP), 1, 0.003, 16)]), MAT.paint, { d: 'Plaatwerk van de achterklep onder en achter de ruit.', ex: [0, 0, -0.08] }),
    P('Binnenpaneel achterklep', merge([bodTailGeo(-0.36, 0.36, 0.68, ydT - 0.02, -0.04, 4, 8), ...tgRing]), MAT.paintIn, { d: 'Binnenframe van de achterklep met scharnier- en slotversteviging. Rond de achterruit loopt een smalle rand van 7 cm (de lijmrand), zodat de ruit van binnen als donker glas te zien is.', ex: [0, 0, 0] }),
    P('Achterruit', scr, MAT.glass, { d: 'Verwarmde achterruit van gehard glas, zeer vlak geplaatst (ca. 14 graden).', ex: [0, 0.14, 0.02] }),
    P('Spoilerlip', lip, MAT.paint, { d: 'Kleine spoilerlip (eendenstaartje) aan de onderrand van de achterruit: een dun, licht opkrullend blad van ca. 3,5 cm met een scherpe achterrand, zo breed als de ruit en aan de uiteinden in het plaatwerk weglopend.', ex: [0, 0.1, -0.06] }),
    // achter het glas, net onder de dakrand: steekt in zijaanzicht niet boven de daklijn uit en schemert door de getinte ruit
    P('Derde remlicht', G.rbox(0.30, 0.008, 0.02, 0.003), MAT.lensRed, { d: 'Derde remlicht achter de bovenrand van de achterruit, direct onder de dakrand (plaats geschat uit fase 2-foto\'s, schematisch).', p: [0, YR(RW0 - 0.045) - 0.011, RW0 - 0.045], r: [-Math.atan2(YR(RW0) - YR(RW0 - 0.09), 0.09), 0, 0], ex: [0, 0.05, -0.08] }),
    A('Achterruitenwisser', { d: 'Achterruitenwisser die langs de zijrand van de ruit parkeert (links op een foto van fase 2, rechts op een tekening van fase 1; aannemelijk).', ex: [0.06, 0.14, 0] }, [
      P('Wisserarm achter', tube([wPiv, panP((wPiv[2] + wTip[2]) / 2, 0.42, 0.016), wTip], 0.006, 16, 6), MAT.blackGloss, { d: 'Wisserarm die het blad met veerdruk tegen de achterruit houdt en het heen en weer zwaait.', ex: [0, 0.03, 0] }),
      P('Wisserblad achter', tube([panP(-1.85, 0.46, 0.010), panP(-1.42, 0.505, 0.010)], 0.006, 8, 5), MAT.rubber, { d: 'Rubber wisserblad dat regen en vuil van de achterruit veegt.', ex: [0, 0.06, 0] }),
      P('Asmoerkap', G.cyl('y', 0.014, 0.016, 0.02, 12), MAT.blackGloss, { d: 'Kap over de asmoer van de wisserarm.', p: wPiv, ex: [0, 0.03, 0] }),
      P('Wissermotor achter', merge([G.cyl('z', 0.03, 0.03, 0.08, 16), xf(G.rbox(0.07, 0.05, 0.05, 0.01), [0, 0, -0.06])]), MAT.darkSteel, { d: 'Motor van de achterruitenwisser in de klep.', p: [wPiv[0], wPiv[1] - 0.06, wPiv[2] + 0.02], ex: [0, -0.06, 0.06] }),
    ]),
    A('Achterklepslot', { d: 'Slot onderin de klep met elektrische ontgrendeling; zit tussen buitenpaneel en binnenpaneel, dus binnen de klep, en zwaait bij het openen vrij uit de sponning.', ex: [0, -0.08, 0.04] }, [
      P('Slotkast achterklep', G.rbox(0.08, 0.05, 0.03, 0.008), MAT.darkSteel, { d: 'Slot met vanghaak die door een sleuf in het binnenpaneel om de slotbeugel in het achterpaneel grijpt.', p: [0, 0.74, bodZT - 0.03], ex: [0, -0.04, 0] }),
      P('Slotmotor achterklep', G.rbox(0.05, 0.04, 0.025, 0.008), MAT.plastic, { d: 'Elektrische ontgrendelmotor.', p: [0.07, 0.75, bodZT - 0.03], ex: [0.04, 0, 0] }),
    ]),
    // binnendelen van de achterlichten: zitten in de klep en draaien mee (geometrie in wereldcoördinaten, zoals de rest van de klep)
    buildTaillight(L, 'binnen'), buildTaillight(R, 'binnen'),
    // gasveren: telescoop van het carrosseriepunt A naar het klepunt B. De groep staat in A met de lokale +z naar B (gebouwde stand);
    // de app richt hem bij het openen opnieuw en schuift de zuigerstang uit (290 mm ingeschoven, 495 mm uitgeschoven)
    // De cilinder is een gesloten draaivorm: kogelkom als halve bol onder, buis van 32 mm, platte kop met 0,5 mm afschuining, en binnenin een
    // holte van 13,5 mm straal waarin de kogel (12 mm) van de bevestiging zit. Was een buis met een bol erin: de bodem van die buis lag als
    // schijf door het hart van de kogel (7 mm diep, gemeten bij h 1,5 mm; golf 5b-3, ronde 8). Buitenkant, maten en draaipunt zijn gelijk.
    ...both(s => {
      const a = [s * bodGsA[0], bodGsA[1], bodGsA[2]], b = [s * bodGsB[0], bodGsB[1], bodGsB[2]], dir = V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      return A(`Gasveer ${sn(s)}`, { d: 'Gasveer van 495 mm met 205 mm slag (catalogusmaat, 610 N) die de geopende achterklep omhoog houdt; onderaan bevestigd tegen de zijwand van de opening (C-stijl), bovenaan op de zijrand van de klep, zodat hij langs de zijkant loopt. Plaats van de bevestigingspunten geschat.', p: a, q: quatFromTo(V3(0, 0, 1), dir), ex: [s * 0.14, 0, 0],
        strut: { a: { node: `Gasveerbevestiging ${sn(s)}`, p: [0, 0, 0] }, b: { node: 'Renault Laguna III/Carrosserie/Achterklep', p: b }, rod: 'Zuigerstang', lead: 'Renault Laguna III/Carrosserie/Achterklep', restLen: 0.29 } }, [
        P('Cilinder', G.lathe('z', [[0, 0.0135], [0.0135 * Math.SQRT1_2, 0.0135 * Math.SQRT1_2], [0.0135, 0], [0.0135 * Math.SQRT1_2, -0.0135 * Math.SQRT1_2], [0, -0.0135], [0, -0.016], [0.008, -0.016 * Math.cos(PI / 6)], [0.016 * Math.cos(PI / 6), -0.008], [0.016, 0], [0.016, 0.2695], [0.0155, 0.27], [0, 0.27]], 16, 'bodGsCyl'), MAT.bodStrut, { d: 'Gasgevulde cilinder van de gasveer met kogelkom aan de carrosseriezijde.', ex: [0, 0, -0.05] }),
        P('Zuigerstang', merge([xf(G.cyl('z', 0.0065, 0.0065, 0.27, 10), [0, 0, 0.155]), xf(G.sphere(0.0125, 10), [0, 0, 0.29])]), MAT.steel, { d: 'Verchroomde zuigerstang die uit de cilinder schuift; kogelkom aan de klepzijde.', ex: [0, 0.03, 0.05] }),
      ]);
    }),
    ...both(s => P(`Gasveerbeugel ${sn(s)}`, merge([G.sphere(0.012, 10), xf(G.rbox(0.03, 0.02, 0.02, 0.004), [0, 0.016, 0])]), MAT.darkSteel, { d: 'Beugel met kogelpen aan de zijrand van de achterklep (onder de ruitrand) waarop de gasveer draait (plaats geschat).', p: [s * bodGsB[0], bodGsB[1], bodGsB[2]], ex: [s * 0.04, 0.05, 0] })),
    ...both(s => P(`Klepscharnier ${sn(s)}`, G.rbox(0.03, 0.03, 0.08, 0.006), MAT.darkSteel, { d: 'Scharnier tussen dak en achterklep, het deel aan de carrosseriezijde (geschroefd op de dakrand); blijft staan als de klep opent.', p: [s * 0.42, YR(RW0) - 0.04, RW0 - 0.01], stay: true, ex: [0, 0.04, 0.04] })),
    // scharnierblad onder de bovenrand van de achterruit, evenwijdig aan het glas en 9 mm eronder (hart), achter de schermcassette van het panoramadak: zoals op de auto zit het scharnier
    // onder de dakrand en is het van buiten niet te zien. Lag eerst vlak en half boven het glas en las in de beelden van opzij en schuin achter
    // als klein zwart vierkantje bij de C-stijl (S7, golf 5f). Het blad begint achter het scharnierblok (achterkant z RW0 - 0,05) met ca. 0,6 mm
    // speling: met het hart op RW0 - 0,055 lag het 9,7 mm in het blok (clash.py, advisorronde golf 5f)
    ...both(s => { const zc = RW0 - 0.075, a = panP(zc - 0.025, 0.42), b = panP(zc + 0.025, 0.42);
      return P(`Klepscharnierblad ${sn(s)}`, G.rbox(0.026, 0.007, 0.05, 0.003), MAT.bodPillar, { d: 'Plat zwart scharnierblad aan de achterklep onder de bovenrand van de achterruit; draait om de scharnierpen op de dakrand en is van buiten niet te zien.', p: [s * 0.42, (a[1] + b[1]) / 2 - 0.009, zc], r: [-Math.atan2(b[1] - a[1], b[2] - a[2]), 0, 0], ex: [0, 0.05, -0.02] }); }),
    ...both(s => P(`Klepbuffer ${sn(s)}`, G.cyl('z', 0.012, 0.012, 0.02, 10), MAT.rubber, { d: 'Rubberen aanslag op de carrosserie die het rammelen van de klep voorkomt.', inner: true, stay: true, p: [s * 0.48, 0.68, bodZT + 0.035], ex: [s * 0.03, 0, 0.04] })),
    // plus een donkere strook van 8 mm, 2 mm onder de huid achter de zijnaden in het staartvlak (onder en boven het achterlicht): door de spleet van
    // 3 mm zag je eerst de lichte bovenkant van de bumperrichel, zodat de naad als onregelmatige witte lijn las in plaats van als donkere naad
    P('Klepafdichting', merge([tube(bodTGPath(0.03), 0.008, 80, 5), ...[L, R].flatMap(sd => [[bodYLEDGE + 0.004, bodTLY(bodZT, 0)], [bodTLY(bodZT, 1), ydT - 0.002]].map(([y0, y1]) => bodMirX(bodTailGeo(bodTGseam(y0) - 0.0025, bodTGseam(y0) + 0.0055, y0, y1, -0.002, 8, 1), sd)))]), MAT.rubber, { d: 'Rubber afdichting tussen klep en sponning, op de sponning van de carrosserie; blijft staan als de klep opent. In de zijnaden van het staartvlak van buiten te zien als donkere lijn.', stay: true, ex: [0, 0, 0.06] }),
    P('Binnenbekleding achterklep', bodTailGeo(-0.48, 0.48, 0.7, ydT - 0.04, -0.055, 4, 8), MAT.dash, { d: 'Kunststof binnenbekleding met greep om de klep te sluiten.', ex: [0, 0, 0.12] }),
  ]);

  /* ================= voorruit en wissers ================= */
  const wsW = [bodQR / 2 + 0.002, 1 - bodQR / 2 - 0.002];
  const windscreen = A('Voorruit', { d: 'Gelaagde voorruit onder een hoek van ca. 26 graden, met rubber en regensensor.', ex: [0, 0.4, 0.42] }, [
    P('Voorruitglas', patch((z, w) => ghPt(z, w), WS1 + 0.004, WS0 - 0.006, 28, () => wsW, 22, bodDense(WS0 - bodAPL, WS0 - 0.006, 9)), MAT.glassWs, { d: 'Gelaagd veiligheidsglas met akoestische tussenlaag.', ex: [0, 0.08, 0.04] }),
    P('Voorruitrubber', (() => { const pts = []; const zz = [WS0 - 0.008, WS0 - 0.02, WS0 - 0.035, WS0 - 0.055, WS0 - bodAPL, 0.85, 0.65, 0.45, WS1 + 0.006]; zz.forEach(z => { const p = bodGhAt(z, bodQR - 0.004, 0.004); pts.push([p[0], p[1], z]); }); for (let i = 1; i < 10; i++) { const p = ghPt(WS1 + 0.006, 0.36 + 0.28 * i / 10); pts.push([p[0], p[1] + 0.004, p[2]]); } zz.slice().reverse().forEach(z => { const p = bodGhAt(z, bodQR - 0.004, 0.004); pts.push([-p[0], p[1], z]); }); return tube(pts, 0.006, 80, 5); })(), MAT.rubber, { d: 'Zwarte sierrubber langs zijkanten en bovenrand.', ex: [0, 0.04, 0] }),
    P('Regensensor', G.rbox(0.07, 0.012, 0.06, 0.008), MAT.plastic, { d: 'Regen- en lichtsensor achter de ruit bij de binnenspiegel.', p: [0, YR(0.36) - 0.022, 0.36], r: [0.4, 0, 0], ex: [0, -0.06, 0] }),
  ]);
  const wipeOn = (x, z, lift) => { const g = bodGh(z), q = bodQR + (1 - bodQR) * (1 - Math.abs(x) / g.xr); const p = bodGhHalf(z, Math.min(1, q), g); return [x, p[1] + lift, z]; };
  // golf 5h: armen en bladen liggen in rust laag in de voet van de ruit (z 1,046, net boven de achterrand van de kap), zoals op de persfoto
  // waar ze vrijwel wegvallen; eerst lagen ze 2 tot 4 cm hoger op het glas en lazen ze als losse zwarte strepen boven de kap
  const wArm = (x0, x1, lift) => tube([0, 0.33, 0.66, 1].map(t => { const x = x0 + (x1 - x0) * t, z = 1.046 - 0.012 * Math.sin(PI * t); return wipeOn(x, z, lift); }), 0.006, 24, 6);
  // de armen beginnen aan de rand van hun kap en de arm aan de passagierszijde eindigt voor de kap aan de bestuurderszijde (tandem)
  // kap op de asmoer: staat haaks op het glas (gekanteld met de helling van de ruit), zodat hij niet in het glas steekt
  const wCap = x => { const z = 1.043, a = wipeOn(x, z - 0.01, 0), b = wipeOn(x, z + 0.01, 0), t = Math.atan2(a[1] - b[1], 0.02), p = wipeOn(x, z, 0);
    return { p: [x, p[1] + 0.009 * Math.cos(t), z + 0.009 * Math.sin(t)], r: [t, 0, 0] }; };
  const wipers = A('Ruitenwissers', { d: 'Wisserinstallatie met torpedoplaat, twee armen in tandemopstelling (linksgestuurd), motor en stangenstelsel.', ex: [0, 1.0, 0.1] }, [
    P('Wisserarm links', wArm(-0.002, 0.58, 0.013), MAT.blackGloss, { d: 'Wisserarm aan de bestuurderszijde (linksgestuurd: tandemopstelling, dus niet symmetrisch).', ex: [0, 0.08, 0] }),
    P('Wisserarm rechts', wArm(-0.502, -0.065, 0.013), MAT.blackGloss, { d: 'Wisserarm aan de passagierszijde.', ex: [0, 0.08, 0] }),
    P('Wisserblad links', wArm(0.012, 0.62, 0.0065), MAT.rubber, { d: 'Wisserblad bestuurderszijde.', ex: [0, 0.14, 0] }),
    P('Wisserblad rechts', wArm(-0.488, -0.048, 0.0065), MAT.rubber, { d: 'Wisserblad passagierszijde.', ex: [0, 0.14, 0] }),
    ...[[-0.02, 'bestuurderszijde'], [-0.52, 'passagierszijde']].map(([x, nm]) => P(`Wisseraskap ${nm}`, G.cyl('y', 0.014, 0.016, 0.014, 12), MAT.blackGloss, Object.assign({ d: 'Kap over de asmoer van de wisserarm, op de voorruitbasis direct achter de motorkap.', ex: [0, 0.05, 0] }, wCap(x)))),
    P('Wissermotor', merge([G.cyl('z', 0.04, 0.04, 0.09, 16), xf(G.rbox(0.08, 0.06, 0.05, 0.01), [0, 0, 0.06])]), MAT.darkSteel, { d: 'Elektromotor van de ruitenwissers in de torpedobak.', p: [0.3, 0.9, 1.07], ex: [0, -0.1, 0.06] }),
    P('Wisserstangenmechaniek', merge([rodBetween([-0.52, 0.92, 1.1], [0.3, 0.9, 1.08], 0.007, 8), rodBetween([0.3, 0.9, 1.08], [-0.02, 0.92, 1.1], 0.007, 8)]), MAT.steel, { d: 'Stangenstelsel dat beide wisserassen aandrijft.', ex: [0, -0.06, 0.12] }),
  ]);

  return A('Carrosserie', { d: 'Zelfdragende carrosserie van de vijfdeurs hatchback in zilvergrijs metallic (Gris Platine), met alle aanbouwdelen, ruiten en verlichting.', ex: [0, 2.0, 0], spec: [['Lengte', '4.695 mm'], ['Breedte zonder / met spiegels', '1.811 / 2.060 mm'], ['Hoogte', '1.445 mm'], ['Wielbasis', '2.756 mm'], ['Spoorbreedte voor / achter', '1.557 / 1.512 mm'], ['Kleur', 'Gris Platine (D69)']] }, [
    cage, hood, tailgate, fender(L), fender(R), frontBumper, rearBumper,
    buildDoor(L, true), buildDoor(R, true), buildDoor(L, false), buildDoor(R, false),
    windscreen, buildHeadlight(L), buildHeadlight(R), buildTaillight(L), buildTaillight(R), wipers,
  ]);
}

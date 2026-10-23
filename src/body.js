/* ===================== carrosserie: parametrisch oppervlak ===================== */
// assen: x = links(+)/rechts(-), y = omhoog, z = voor(+)/achter(-); maten in meter
// Alle steunpunten komen uit het exterieuronderzoek (zijaanzicht en bovenaanzicht van de Laguna III hatchback fase 2,
// lijntekening en persfoto afgebeeld op de projectassen; fout ca. 2 cm tussen de assen, 5 cm in de overhang).
const ZF = 2.345, ZR = -2.35;                       // lengte 4695 mm (uiterste punten van de bumpers)
const BOD_WMAX = 0.915, BOD_MIRW = 1.035, BOD_H = 1.445; // framework: halve breedte zonder en met spiegels, hoogte; integrity.py leest ze
const AXF = 1.365, AXR = -1.391, AY = 0.33;         // wielbasis 2756 mm, bandstraal 225/45 R18
const ARCH = 0.385;                                 // wielbooguitsparing (straal om de wielas)
const TRACK_F = 0.7785, TRACK_R = 0.756;            // halve spoorbreedte voor en achter (1557 en 1512 mm, brochure april 2011)
const WS0 = 1.06, WS1 = 0.30, RW0 = -1.17, SP = -2.11; // voorruitbasis, voorruitkop, knik dak/achterruit, onderkant achterruit (lip)
const bodZT = -2.268, bodYLEDGE = 0.635;            // staartvlak boven de bumper; bovenkant van de achterbumperrichel
const bodBELT = 0.085;                              // gordel ligt zoveel binnen de grootste breedte (0,905 -> ca. 0,82)
// gedeelde maten achteras/carrosserie (golf 5b-3, fase 0.3c); de takken zetten chassis, wielkast, interieur en aandrijving erop om.
// Waarden gelijk aan de getallen in de bestanden hieronder (wereldmaten, meter):
const REAR_SPR = { x: 0.51, z: -1.47, sprZ: [-1.545, -1.395], sprY: [0.322, 0.572], sprX: 0.432 }; // veerhart achter (chassis.js:310,315-319), veerkoker (bodyparts.js:600)
const REAR_BEAM = { z: -1.15, y: 0.29, hy: 0.036, hz: 0.05, len: 1.14, slot: 0.003 };               // torsiebalk: hart (chassis.js:331), halve hoogte en breedte (chassis.js:307), lengte (chassis.js:331), speling sleuf (bodyparts.js:606, sleuf z -1,203..-1,097 y 0,251..0,329)
const SUB_ROD = { p: [-0.01, 0.27, 1.2] };                                                          // oog koppelstang in het subframe, in autoframe (drivetrain.js:480, vóór toPT)
function pchip(pts) {
  const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), h = [], dl = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; dl[i] = (ys[i + 1] - ys[i]) / h[i]; }
  m[0] = dl[0]; m[n - 1] = dl[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (dl[i - 1] * dl[i] <= 0) m[i] = 0;
    else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i]); }
  }
  return x => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (i < n - 2 && x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}
// grootste halve breedte (bovenaanzicht, zonder spiegels): smalle, ronde neus en staart
// staart: de taper begint al bij z -1,9, zodat de hoeken in bovenaanzicht ronder lopen (binnen de planmarge van 5 cm)
const HW = pchip([[-2.35, 0.29], [-2.335, 0.40], [-2.30, 0.50], [-2.268, 0.595], [-2.22, 0.708], [-2.15, 0.770], [-2.05, 0.807], [-1.90, 0.847], [-1.75, 0.874], [-1.50, 0.891], [-1.20, 0.893],
  [1.20, 0.893], [1.40, 0.891], [1.60, 0.884], [1.80, 0.86], [1.95, 0.82], [2.05, 0.782], [2.15, 0.715], [2.22, 0.625], [2.27, 0.48], [2.30, 0.33], [2.325, 0.22], [2.345, 0.07]]);
// onderkant carrosserie (bumperranden en dorpel; in de wielbogen snijdt de boog)
const YB = pchip([[-2.35, 0.53], [-2.335, 0.47], [-2.30, 0.38], [-2.268, 0.31], [-2.20, 0.287], [-2.10, 0.271], [-2.00, 0.26], [-1.90, 0.249], [-1.80, 0.244], [-1.60, 0.215], [-1.30, 0.19], [-1.0, 0.18],
  [0.95, 0.18], [1.30, 0.183], [1.80, 0.186], [1.90, 0.195], [2.00, 0.20], [2.10, 0.21], [2.20, 0.225], [2.27, 0.25], [2.30, 0.268], [2.33, 0.29], [2.345, 0.31]]);
// schouderlijn van de onderbak = gordellijn (onderkant zijruiten) in het interieur, kapnaad voor, schouder achter
const bodYTm = pchip([[-2.268, 0.985], [-2.25, 0.994], [-2.20, 0.999], [-2.10, 0.988], [-1.905, 0.962], [-1.655, 0.963], [-1.405, 0.968], [-1.155, 0.972], [-0.905, 0.965], [-0.655, 0.960], [-0.405, 0.952],
  [-0.155, 0.946], [0.095, 0.942], [0.345, 0.934], [0.595, 0.924], [0.845, 0.911], [0.98, 0.895], [1.095, 0.872], [1.345, 0.825], [1.595, 0.795], [1.845, 0.765], [2.0, 0.725], [2.095, 0.69],
  [2.20, 0.648], [2.30, 0.605], [2.345, 0.565]]);
// bovenrand van de bumper: in de laatste 3 cm voor ZR rondt de richel als kwartcirkel af naar het achtervlak, zodat het sluitvlak op ZR
// klein blijft en niet als los licht vlak boven de kentekenuitsparing leest (S7, golf 5f ronde 2)
const bodTipR = 0.03;
const bodTipDrop = z => { const a = clamp(ZR + bodTipR - z, 0, bodTipR); return bodTipR - Math.sqrt(bodTipR * bodTipR - a * a); };
function YT(z) { return z < bodZT ? bodYLEDGE - bodTipDrop(z) : bodYTm(z); }
// hartlijn van het dek (motorkap, torpedo, achterklep tussen lip en staartvlak); onder het glas niet zichtbaar.
// Achter de lip daalt het dek vlotter naar het staartvlak (geen dikke plank boven de achterlichten)
const bodYD = pchip([[-2.268, 1.025], [-2.258, 1.038], [-2.24, 1.054], [-2.21, 1.072], [-2.17, 1.091], [-2.11, 1.118], [-1.95, 1.02], [-1.85, 0.99], [-1.0, 0.99], [0.0, 0.97], [0.6, 0.95], [0.88, 0.935], [1.0, 0.962], [1.06, 0.975], [1.20, 0.979], [1.345, 0.971],
  [1.595, 0.932], [1.845, 0.887], [1.975, 0.852], [2.095, 0.811], [2.20, 0.752], [2.27, 0.69], [2.30, 0.645], [2.325, 0.60], [2.345, 0.565]]);
const bodDP = pchip([[-2.3, 2.6], [-1.9, 2.8], [1.0, 4.2], [1.9, 4.2], [2.22, 3.2], [2.345, 2.4]]);  // exponent van het dekprofiel (vlak midden, afgeronde randen)
// golf 5j (S7): de bolling van de motorkap is voor de voorwielas lager (tot 2 cm, vooral naar voren; de hoogte boven de kapnaad
// schaalt mee, zodat de kap vlakker wordt en van voren niet meer als koepel boven de koplampen uitkomt). Binnenframe en isolatie van de
// kap worden met bodDropOff op de oude hoogte gebouwd: daaronder zit de motorruimte zonder speling (afdekkap, motorsteun, reservoirs op
// 0 tot 8 mm); de buitenhuid blijft minstens 6 mm boven het binnenframe (3 cm onder het dek).
let bodDropOff = false;
// verlaging als parabool in de hoogte van de hartlijn: K (y0 - y)(y - yN) met y = bodYD(z), y0 de hoogte op z 1,15 en yN die op de
// neus van de kap (z 2,29). Nul aan beide einden, grootst (ca. 2 cm) rond z 2,0 tot 2,1, en de hartlijn blijft overal bol: de extra
// kromming is 2K maal de helling in het kwadraat, klein waar de kap vlak is en ruim gedekt door de neusbocht waar hij steil is.
// Ronde 2: een eigen verloop in z (oplopen, vlak, aflopen) en een kleinere exponent over 30 cm gaven een golf met bulten dwars over de kap
const bodHoodYD0 = bodYD(1.15), bodHoodYN = bodYD(2.29), bodHoodK = 0.8;
const bodHoodDrop = z => (bodDropOff || z <= 1.15 || z >= 2.29) ? 0 : Math.max(0, bodHoodK * (bodHoodYD0 - bodYD(z)) * (bodYD(z) - bodHoodYN));
// daklijn op de hartlijn (voorruit bol, dak als een boog, vlakke achterruit onder ca. 14 graden)
const YR = pchip([[-2.11, 1.13], [-1.905, 1.181], [-1.655, 1.246], [-1.405, 1.31], [-1.17, 1.37], [-0.905, 1.418], [-0.655, 1.441], [-0.43, 1.447], [-0.155, 1.44], [0.095, 1.414],
  [0.30, 1.346], [0.345, 1.332], [0.595, 1.237], [0.845, 1.112], [1.06, 0.975]]);
// karakterlijn op de flank: van de voorwielboog oplopend naar de bovenrand van het achterlicht
const bodYC = pchip([[-2.2, 0.985], [-1.98, 0.975], [-1.4, 0.93], [-1.0, 0.90], [0.0, 0.852], [0.95, 0.80], [1.3, 0.785]]);
// bovenaanzicht: boven de bumperrichel loopt de staart ronder in dan de bumper (hoekstraal ca. 0,3 m); factor op x
const bodKU = pchip([[-2.268, 0.925], [-2.22, 0.93], [-2.15, 0.952], [-2.05, 0.982], [-1.95, 0.997], [-1.85, 1.0]]);
// golf 5j (S7 kenmerk 8): de overgang begint pas boven de bumperrichel en loopt over 22 cm, zodat de bumperhoek zonder trede in de
// bovenstaart overgaat (was 0,645 tot 0,785: de bumper stak als bredere bak onder de achterlichten uit)
const bodKY0 = bodYLEDGE + 0.06, bodKY1 = 0.22;          // overgang van bumperbreedte naar de smallere bovenstaart
// heup achter het achterwiel (golf 5j, S7 kenmerk 8): de flank trekt naar onderen in (tuck-under), zodat de achterkant van achteren als ronde
// heup leest en niet als staand blok met vlakke zijkanten. Factor op x: 1 - K * (1 - u)^2 met u = (y - yb) / H, convex van de onderrand tot
// raakvlak met de flank op H boven de onderrand; in z van 0 bij -1,60 (achter de wielboogtop) naar vol bij -1,95
const bodHipK = 0.09, bodHipH = 0.50;
const bodHipT = z => sstep((-1.60 - z) / 0.35);
const S1 = 0.14, S2 = 0.22, S3 = 0.60, S4 = 0.72, BUL = 0.016, CRW = 0.03;
const sstep = t => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };
// doorsnede van de onderbak op z
function bodSec(z) {
  const hw = HW(z), yb = YB(z), yt = YT(z), d = yt - yb, tip = z < bodZT, bul = Math.min(BUL, hw * 0.15);
  const rb = Math.min(0.06, d * 0.28, (hw - bul) * 0.45), rs = Math.min(tip ? 0.03 : 0.075, d * 0.3, (hw - bul) * 0.45);
  const yd = tip ? yt + 0.004 : Math.max(yt + 0.004, bodYD(z)), c = yd - yt, p = tip ? 2.4 : bodDP(z);
  const cx = hw - bul - rs;                       // middelpunt van de schouderboog
  let xe = cx + rs * 0.3, th = 1.2;
  for (let i = 0; i < 3; i++) { th = Math.atan2(xe, c * p); xe = cx + rs * Math.cos(th); }
  const cy = yt - rs * Math.sin(th);
  // in de bumperpunt volgt de bolling van de flank die van het staartvlak (geen knik op de naad)
  const cyb = tip ? bodYTm(bodZT) - 0.072 : cy;
  const ku = z < -1.85 ? bodKU(Math.max(z, bodZT)) : 1;
  return { hw, yb, yt, rb, rs, yd, c, p, cx, cy, cyb, th, xe: xe * ku, xe0: xe, ku, bul };
}
function flank(z, y, t, ytop, bul = BUL) {
  let f = bul * Math.sin(PI * t) - bul;
  const yc = bodYC(z), fade = sstep((z + 2.25) / 0.25) * sstep((1.32 - z) / 0.25) * (1 - sstep((yc - ytop + 0.07) / 0.04)) * (1 - sstep((y - ytop + 0.03) / 0.03));
  if (fade > 0) { const dy = y - yc; f += fade * (0.0045 * Math.exp(-dy * dy / 0.0003) - 0.004 * sstep(dy / 0.03 + 0.5)); }
  return f;
}
function bodHalf(z, s, c) {
  const q = bodHalf0(z, s, c);
  if (c.ku < 1) q[0] *= 1 - (1 - c.ku) * sstep((q[1] - bodKY0) / bodKY1);
  if (z < -1.60) { const u = clamp((q[1] - c.yb) / bodHipH, 0, 1); q[0] *= 1 - bodHipK * bodHipT(z) * (1 - u) * (1 - u); }
  return q;
}
function bodHalf0(z, s, c) {
  const { hw, yb, yt, rb, rs, cx, cy, cyb, th, xe0: xe, c: cr, p, bul } = c;
  if (s <= S1) return [s / S1 * (hw - bul - rb), yb];
  if (s <= S2) { const a = -HALF + (s - S1) / (S2 - S1) * HALF; return [hw - bul - rb + rb * Math.cos(a), yb + rb + rb * Math.sin(a)]; }
  if (s <= S3) {
    const t = (s - S2) / (S3 - S2), y = yb + rb + t * (cy - yb - rb), tb = cyb === cy ? t : clamp((y - yb - rb) / (cyb - yb - rb), 0, 1);
    const f = flank(z, y, tb, cyb, bul) - (cyb === cy ? 0 : bul * Math.sin(PI * tb) * sstep((t - 0.6) / 0.4));
    return [hw + f, y];
  }
  if (s <= S4) { const a = (s - S3) / (S4 - S3) * th; return [cx + rs * Math.cos(a), cy + rs * Math.sin(a)]; }
  const t = (s - S4) / (1 - S4), x = xe * (1 - t); return [x, yt + (cr - bodHoodDrop(z)) * (1 - Math.pow(1 - t, p)) + bodCrease(z, x)];
}
// twee vouwlijnen in de motorkap van de binnenspitsen van de koplampen schuin naar de voorruitbasis
// golf 5k (S7): trede van 9 mm over 1,6 cm (|x| xc - 2,6 tot xc - 1,0 cm, was 5 cm rond xc), leest als scherpe lichtlijn; binnen de oude
// overgang, dus nergens hoger dan golf 5j. Het buitenpaneel legt daar extra rijen (hoodRow, bodyparts.js)
const bodCrH = 0.009, bodCrA = 0.026, bodCrW = 0.016;
const bodCreaseX = z => lerp(0.60, 0.36, (z - 1.13) / (bodHLZ1 - 1.13));
function bodCrease(z, x) {
  if (z < 1.1 || z > 2.26) return 0;
  const xc = bodCreaseX(z), f = sstep((z - 1.1) / 0.08) * (1 - sstep((z - 2.2) / 0.06));
  return bodCrH * f * (1 - sstep((Math.abs(x) - xc + bodCrA) / bodCrW));
}
function halfPt(z, s) { return bodHalf(z, s, bodSec(z)); }
// parameter s van de doorsnede bij hoogte y (flank, schouder en dek)
function sAtY(z, y) {
  const c = bodSec(z), y0 = c.yb + c.rb, y1 = c.cy;
  if (y <= y0) { const a = Math.asin(clamp((y - y0) / c.rb, -1, 0)); return S1 + (a + HALF) / HALF * (S2 - S1); }
  if (y <= y1) return S2 + (y - y0) / Math.max(1e-6, y1 - y0) * (S3 - S2);
  if (y <= c.yt) { const a = Math.asin(clamp((y - c.cy) / c.rs, 0, 1)); return S3 + Math.min(1, a / c.th) * (S4 - S3); }
  const u = clamp((y - c.yt) / Math.max(1e-6, c.c), 0, 1), t = 1 - Math.pow(1 - u, 1 / c.p);
  return S4 + t * (1 - S4);
}
// parameter s op het dek bij |x|
function bodSAtX(z, x) { const c = bodSec(z); return S4 + (1 - S4) * clamp(1 - Math.abs(x) / c.xe, 0, 1); }
// halve breedte van de onderbak op hoogte y (0 boven het dek)
function ringX(z, y) { const c = bodSec(z); if (y > c.yd) return 0; return Math.max(0, bodHalf(z, sAtY(z, y), c)[0]); }
function archS(z) {
  for (const az of [AXF, AXR]) { const dz = z - az; if (Math.abs(dz) <= ARCH) return sAtY(z, AY + Math.sqrt(ARCH * ARCH - dz * dz)); }
  return 0;
}
const inArch = z => Math.abs(z - AXF) < ARCH + 0.01 || Math.abs(z - AXR) < ARCH + 0.01;
const ARCH_BREAKS = [AXF - ARCH - 0.001, AXF - ARCH, AXF + ARCH, AXF + ARCH + 0.001, AXR - ARCH - 0.001, AXR - ARCH, AXR + ARCH, AXR + ARCH + 0.001];
/* ---------- kas (ruiten, stijlen, dak) ---------- */
// ghPt(z, w): w = 0 gordel links, 0,27 bovenrand zijruit, 0,36 dakrand, 0,5 hartlijn dak, 1 gordel rechts
const bodQS = 0.54, bodQR = 0.72, bodTUMB = 0.45;
function bodGh(z) {
  const yb = YT(z), xb = bodSec(z).xe, yc = Math.max(yb + 0.002, YR(z)), h = yc - yb;
  const cr = Math.min(CRW, h * 0.3), yre = yc - cr, rr = Math.min(0.06, (yre - yb) * 0.3), ye = yre - rr;
  const xe = xb - bodTUMB * (ye - yb), xr = xe - rr * 0.8;
  return { yb, xb, yc, cr, yre, rr, ye, xe, xr };
}
// voet van de C-stijl: tussen SP en SP + bodCPL gaat de kasdoorsnede geleidelijk over in een bolle dekdoorsnede (zelfde x, hoogte
// volgens het dekprofiel met de daklijn als top), zodat C-stijl en onderhoeken van de achterruit zonder trede in het dek achter de ruit lopen
const bodCPL = 0.30;
// voet van de A-stijl (golf 5h): tussen WS0 - bodAPL en WS0 gaat de kas over in de dekdoorsnede van de kap, zodat ruit en stijl op de
// kap aansluiten (anders een open driehoek naast de ruithoek). Overgang sstep; de dashboardhuid begint op z 1,00 (glas 26 mm erboven).
const bodAPL = 0.09;
const bodMorph = z => (z >= SP + bodCPL ? sstep((z - WS0 + bodAPL) / bodAPL) : sstep((SP + bodCPL - z) / bodCPL));
// C-stijlschouder (golf 8 ronde 2, kierenaudit; besluit via de orkestrator): achter het achterportier liep de vlakke bovenkant van de schouder
// (helling 8 tot 11 graden) met een knik van ca. 65 graden in de C-stijl (73 tot 75 graden), een richel waar de kierenaudit een stap van 10 mm
// en doorkijk mat. Op de Laguna III hatchback is de C-stijl met het achterscherm een geperst zijpaneel en loopt de schouder vloeiend in de
// stijl over. De kas begint daar nu op de schouder (punt A, raaklijnlengte bodCFD voor de oude hoek C) en loopt in een kwadratische Bezier met
// het controlepunt op het snijpunt van de raaklijn van de schouder in A en de lijn van de stijl naar de stijl (punt B, bodCFD boven C):
// raakcontinu aan beide kanten, holle afronding met een straal van ca. 4 cm, tot 7 mm materiaal in de hoek (huid.py). Volle maat van z -1,372 tot
// SP + 0,10, met een overgang van 10 cm naar de achterrand van het achterportier (z -1,272) en naar de onderhoek van de achterruit (SP).
const bodCFD = 0.025, bodCFZ1 = -1.272;
const bodCFf = z => (z <= SP || z >= bodCFZ1) ? 0 : sstep((bodCFZ1 - z) / 0.10) * sstep((z - SP) / 0.10);
// s van punt A op de schouder (boog van straal rs over de hoek th tussen S3 en S4); S4 waar geen afronding is
function bodCFsA(z) { const f = bodCFf(z); if (f <= 0) return S4; const c = bodSec(z); return S4 - (bodCFD * f / c.rs) / c.th * (S4 - S3); }
// q van punt B (bodCFD boven de oude hoek, langs de stijl); 0 waar geen afronding is
function bodCFqB(z, g) { const f = bodCFf(z); if (f <= 0) return 0; g = g || bodGh(z); const C = bodGhHalfM(z, 0, g), e = 0.004, Pe = bodGhHalfM(z, e, g); return bodCFD * f * e / Math.hypot(Pe[0] - C[0], Pe[1] - C[1]); }
function bodGhHalf(z, q, g) {
  const f = bodCFf(z);
  if (f <= 0) return bodGhHalfM(z, q, g);
  g = g || bodGh(z);
  const d = bodCFD * f, qB = bodCFqB(z, g), C = bodGhHalfM(z, 0, g);
  if (q >= qB) return bodGhHalfM(z, q, g);
  const sA = bodCFsA(z), A = halfPt(z, sA), a0 = halfPt(z, sA - 1e-4), a1 = halfPt(z, Math.min(S4, sA + 1e-4)), B = bodGhHalfM(z, qB, g);
  const ta = [a1[0] - a0[0], a1[1] - a0[1]], tb = [B[0] - C[0], B[1] - C[1]], cr = ta[0] * tb[1] - ta[1] * tb[0];
  // controlepunt: A + u ta = C + v tb; bij (vrijwel) evenwijdige lijnen (geen knik) het punt C
  let K = C;
  if (Math.abs(cr) > 1e-12) { const u = ((C[0] - A[0]) * tb[1] - (C[1] - A[1]) * tb[0]) / cr, Kc = [A[0] + u * ta[0], A[1] + u * ta[1]];
    if (u > 0 && Math.hypot(Kc[0] - C[0], Kc[1] - C[1]) < d) K = Kc; }
  const t = q / qB, w0 = (1 - t) * (1 - t), w1 = 2 * t * (1 - t), w2 = t * t;
  return [w0 * A[0] + w1 * K[0] + w2 * B[0], w0 * A[1] + w1 * K[1] + w2 * B[1]];
}
function bodGhHalfM(z, q, g) {
  const b = bodMorph(z);
  g = g || bodGh(z);
  const r = bodGhHalf0(z, q, g);
  if (b > 0) {
    // A-voet: ook de bult uit bodGhHalf0 wegnemen (anders een kreukel)
    if (z > WS0 - bodAPL && q <= bodQS) r[0] -= b * 0.012 * Math.sin(PI * q / bodQS) * Math.min(1, (g.ye - g.yb) / 0.2);
    const yd = g.yb + (g.yc - g.yb) * (1 - Math.pow(clamp(r[0] / g.xb, 0, 1), bodDP(z))); r[1] = lerp(r[1], yd, b);
  }
  return r;
}
function bodGhHalf0(z, q, g) {
  if (q <= bodQS) { const t = q / bodQS; return [g.xb + (g.xe - g.xb) * t + 0.012 * Math.sin(PI * t) * Math.min(1, (g.ye - g.yb) / 0.2), g.yb + (g.ye - g.yb) * t]; }
  if (q <= bodQR) { const a = (q - bodQS) / (bodQR - bodQS) * HALF; return [g.xr + (g.xe - g.xr) * Math.cos(a), g.ye + (g.yre - g.ye) * Math.sin(a)]; }
  const t = (q - bodQR) / (1 - bodQR), x = g.xr * (1 - t); return [x, g.yre + g.cr * t * (2 - t)];
}
function ghPt(z, w) {
  const sd = w <= 0.5 ? 1 : -1, q = w <= 0.5 ? 2 * w : 2 - 2 * w, [x, y] = bodGhHalf(z, q);
  return [sd * x, y, z];
}
// parameter q (halve kas) op hoogte y langs de zijruit
function bodQAtY(z, y) {
  const g = bodGh(z);
  if (bodMorph(z) > 0 || bodCFf(z) > 0) return bodQFind(z, y, g, bodQS);
  return clamp((y - g.yb) / Math.max(1e-6, g.ye - g.yb), 0, 1) * bodQS;
}
// q bij hoogte y door halvering (in de overgangszone van de C-stijlvoet; y stijgt monotoon met q)
function bodQFind(z, y, g, qMax = 1) {
  let lo = 0, hi = qMax;
  if (y <= bodGhHalf(z, 0, g)[1]) return 0;
  if (y >= bodGhHalf(z, qMax, g)[1]) return qMax;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bodGhHalf(z, m, g)[1] < y) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/* ---------- buitenhuid voor andere onderdelen ---------- */
function surfX(z, y) {
  // in de C-stijlschouder begint de kas onder YT (punt A van de afronding)
  const yt = bodCFf(z) > 0 ? bodGhHalf(z, 0)[1] : YT(z);
  if (y <= yt || z < SP || z > WS0) return ringX(z, Math.min(y, bodSec(z).yd));
  const g = bodGh(z);
  if (bodMorph(z) > 0) return y >= g.yc ? 0 : bodGhHalf(z, bodQFind(z, y, g), g)[0];
  if (y <= g.ye) return bodGhHalf(z, bodQAtY(z, y), g)[0];
  if (y <= g.yre) { const a = Math.asin(clamp((y - g.ye) / Math.max(1e-6, g.yre - g.ye), 0, 1)); return g.xr + (g.xe - g.xr) * Math.cos(a); }
  if (y >= g.yc) return 0;
  const u = clamp((y - g.yre) / g.cr, 0, 1), t = 1 - Math.sqrt(1 - u); return g.xr * (1 - t);
}
/* ---------- vlakken bouwen ---------- */
function patch(fn, u0, u1, nu, vr, nv, breaks = []) {
  const us = [];
  for (let i = 0; i <= nu; i++) us.push(u0 + (u1 - u0) * i / nu);
  breaks.forEach(b => { if (b > u0 + 1e-4 && b < u1 - 1e-4) us.push(b); });
  us.sort((a, b) => a - b);
  const pos = [], idx = [], rows = nv + 1;
  for (const u of us) { const [v0, v1] = vr(u); for (let j = 0; j <= nv; j++) { const p = fn(u, v0 + (v1 - v0) * j / nv); pos.push(p[0], p[1], p[2]); } }
  for (let i = 0; i < us.length - 1; i++) for (let j = 0; j < nv; j++) {
    const a = i * rows + j, b = (i + 1) * rows + j, c = b + 1, d = a + 1;
    idx.push(a, b, d, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// naar buiten wijzende normaal van de onderbak (linkerhelft) in (z, s)
function bodN(z, s) {
  const e = 1e-3, a = halfPt(z, Math.max(0, s - e)), b = halfPt(z, Math.min(1, s + e)), f = halfPt(z + e, s), k = halfPt(z - e, s);
  const ds = [b[0] - a[0], b[1] - a[1], 0], dz = [f[0] - k[0], f[1] - k[1], 2 * e];
  const n = [ds[1] * dz[2] - ds[2] * dz[1], ds[2] * dz[0] - ds[0] * dz[2], ds[0] * dz[1] - ds[1] * dz[0]], l = Math.hypot(...n) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}
// punt van de onderbak met verschuiving langs de normaal (in > 0 = naar binnen)
function bodLow(z, p, inw = 0) {
  const q = ((p % 2) + 2) % 2, sd = q <= 1 ? 1 : -1, s = q <= 1 ? q : 2 - q, [x, y] = halfPt(z, s);
  if (!inw) return [sd * x, y, z];
  const n = bodN(z, s); return [sd * (x - n[0] * inw), y - n[1] * inw, z - n[2] * inw];
}
const sideR = (s, a, b) => (s > 0 ? [a, b] : [2 - b, 2 - a]);
const sideW = (s, a, b) => (s > 0 ? [a, b] : [1 - b, 1 - a]);
function offsetFn(fn, s, dx, dy = 0, dz = 0) { return (u, v) => { const p = fn(u, v); return [p[0] - s * dx, p[1] + dy, p[2] + dz]; }; }
// paneel op de onderbak aan zijde s; vr(z) geeft [s0, s1] van de linkerhelft; off = verschuiving naar binnen
function lowSide(s, z0, z1, nu, vr, nv, breaks, off) {
  return patch((z, p) => bodLow(z, p, off || 0), z0, z1, nu, z => sideR(s, ...vr(z)), nv, breaks);
}
// dekpaneel over beide helften: vr(z) geeft de s-ondergrens; het paneel loopt over de hartlijn
function bodDeck(z0, z1, nu, sLo, nv, breaks, off) {
  return patch((z, p) => bodLow(z, p, off || 0), z0, z1, nu, z => { const a = sLo(z); return [a, 2 - a]; }, nv, breaks);
}
// kaspaneel aan zijde s met q-bereik per z (linkerhelft, q in [0,1])
function bodGhSide(s, z0, z1, nu, vr, nv, breaks, out = 0) {
  return patch((z, q) => { const [x, y] = bodGhHalf(z, q); const o = out * (q <= bodQS ? 1 : 0.7); return [s * (x + o), y + (q > bodQS ? out * 0.7 : 0), z]; }, z0, z1, nu, vr, nv, breaks);
}
/* ---------- eindvlakken ---------- */
// voorkant: grootste z waar (x, y) nog binnen de doorsnede ligt (de neus is een slanke loft)
function bodInside(z, x, y) {
  const c = bodSec(z); if (y < c.yb || y > c.yd) return false;
  return Math.abs(x) <= ringX(z, y);
}
function frontZ(x, y) {
  let lo = 1.6, hi = ZF;
  if (!bodInside(lo, x, y)) return lo;
  if (bodInside(hi, x, y)) return hi;
  for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (bodInside(m, x, y)) lo = m; else hi = m; }
  return lo;
}
// staartvlak boven de bumper: bol in bovenaanzicht; de bolling in het midden neemt van 0,062 m op de bumperrichel lineair af naar
// 0,015 m aan de bovenrand, zodat het vlak naar boven ca. 4,7 cm naar voren helt, en rolt in de bovenste 15 cm naar voren om in het dek
// achter de lip. Was 0,05 m over de hele hoogte met een omrol van 10 cm: het vlak stond steil en las als blok (S7, golf 5f ronde 2)
const bodTB = 0.062, bodTB1 = 0.015, bodTF = 0.15;
let bodYDT = 0;
function tailZ(x, y) {
  if (!bodYDT) bodYDT = bodSec(bodZT).yd;
  const X = Math.max(0.05, ringX(bodZT, y)), r = clamp(Math.abs(x) / X, 0, 1), b = lerp(bodTB, bodTB1, clamp((y - bodYLEDGE) / (bodYDT - bodYLEDGE), 0, 1));
  // r^m-term: aan de rand helt het vlak even sterk als de flank (helling 3,8 x 0,05 per eenheid r, ca. 19 graden in bovenaanzicht),
  // ook waar de bolling kleiner of groter is dan 0,05 m, zodat de hoek rond doorloopt
  const m = Math.max(2, (0.19 / b - 1.1) / 0.45), e = 1 - 0.55 * r * r - 0.45 * r ** m;
  const u = clamp((y - bodYDT + bodTF) / bodTF, 0, 1);
  return bodZT - b * e * (1 - Math.pow(u, 1.5));
}
function bodTailGeo(x0, x1, y0, y1, off = 0, ny = 10, nx = 16) {
  return patch((y, t) => { const X = ringX(bodZT, y), xa = Math.min(X, Math.max(-X, x0)), xb = Math.max(xa, Math.min(X, x1)), x = xa + (xb - xa) * t; return [x, y, tailZ(x, y) - off]; }, y0, y1, ny, () => [0, 1], nx);
}
// achterkant van de bumper: kleinste z waar (x, y) nog binnen de doorsnede ligt
function bodRearZ(x, y) {
  let lo = ZR, hi = -1.9;
  if (bodInside(lo, x, y)) return lo;
  if (!bodInside(hi, x, y)) return hi;
  for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (bodInside(m, x, y)) hi = m; else lo = m; }
  return hi;
}
// klein sluitvlak op de uiterste z (achterbumper, neuspunt)
function bodCap(z, dir, ny = 4, nx = 10) {
  const c = bodSec(z);
  return patch((y, t) => { const X = ringX(z, y); return [X * t, y, z]; }, c.yb + 1e-4, c.yd - 1e-4, ny, () => [-1, 1], nx);
}
/* ---------- koplamp- en achterlichtzones ---------- */
// koplamp: van de achterpunt op de schouder (z 1,81) naar de binnenspits op het kapvlak (z ca. 2,235, |x| 0,37)
const bodHLZ0 = 1.81, bodHLZ1 = 2.235;
const bodHLlo = pchip([[1.81, 0.715], [1.87, 0.672], [1.96, 0.642], [2.08, 0.624], [2.17, 0.616], [2.215, 0.622], [2.235, 0.64]]);  // ondergrens (hoogte)
const bodHLhi = pchip([[1.81, 0.0], [1.88, 0.06], [1.97, 0.13], [2.08, 0.21], [2.17, 0.28], [2.215, 0.32], [2.235, 0.35]]);       // bovengrens (fractie van het dek)
function hlLow(z) { return Math.min(sAtY(z, bodHLlo(z)), bodHLHi(z) - 0.006); }
function bodHLHi(z) { const t = clamp((z - bodHLZ0) / 0.012, 0, 1); return S4 + (1 - S4) * bodHLhi(z) * t + 0.0005; }
// voorkant motorkap: van de koplampspits naar de neus van de kap
const bodHoodZ1 = 2.29, bodHoodX0 = 0.36;                    // voorrand kap: ronde boog van de koplampspits naar de neus (y ca. 0,65)
function bodHoodS(z) {
  if (z <= bodHLZ0) return S4;
  if (z <= bodHLZ1) return bodHLHi(z);
  const u = clamp((z - bodHLZ1) / (bodHoodZ1 - bodHLZ1), 0, 1), x = bodHoodX0 * Math.sqrt(Math.max(0, 1 - u * u));
  return x <= 1e-4 ? 1 : Math.max(bodHLHi(bodHLZ1), bodSAtX(z, x));
}
// naad bumper/voorscherm: van de voorkant van de wielboog schuin omhoog naar de achterpunt van de koplamp
const bodSeamF = z => AY + 0.02 + (bodHLlo(bodHLZ0) - AY - 0.02) * clamp((z - (AXF + ARCH)) / (bodHLZ0 - AXF - ARCH), 0, 1);
// achterlicht (buitendeel op de hoek): smalle band onder de schouder; de onderrand loopt naar voren op en sluit bij z -1,98
// in een punt op de bovenrand
const bodTLZ = -1.98;
const bodTLtop = pchip([[-2.268, 0.972], [-2.15, 0.966], [-2.05, 0.958], [-1.98, 0.952]]);   // bovenrand (hoogte)
const bodTLlo = pchip([[-2.268, 0.862], [-2.20, 0.868], [-2.12, 0.885], [-2.05, 0.912], [-2.0, 0.935], [-1.98, 0.948]]);
function tlLow(z) { return Math.min(sAtY(z, bodTLlo(z)), bodTLhi(z) - 0.002); }
const bodTLhi = z => sAtY(z, bodTLtop(z));
const inHL = z => z >= bodHLZ0 && z <= bodHLZ1;
const inTL = z => z <= bodTLZ && z >= bodZT;

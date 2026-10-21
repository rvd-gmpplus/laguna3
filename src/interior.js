/* ===================== interieur ===================== */
// Alles wat de carrosserie raakt (hemel, dakgrepen, spiegel, gordelgeleiders) volgt de functies YR, YT, surfX en ghPt van de carrosserie.
std('intFoam', 0x3a3834, 0, 1);
std('intBelt', 0x25272c, 0, 0.9);
std('intTray', 0xb9bdc3, 0, 0.9);   // lichtgrijs schuim van de opbergbak onder de bagagevloer: leest tegen de donkere vloerbekleding
std('intBoard', 0xe2ded4, 0, 0.9, { emissive: 0x55524b });    // onderzijde van de klapbare bagagevloer: lichte plaat, zodat de omhoog geklapte vloer leest tegen de donkere bekleding
std('intFelt', 0x3a3835, 0, 1);       // donker vilt van de bagageruimtebekleding: iets lichter dan de vloerbekleding, zodat vloer en wand te onderscheiden zijn
std('intSill', 0xd2d6db, 0.6, 0.3, { envMapIntensity: 1.2 });   // sierstrip op de instaplijst: lichter dan de lakdorpel en de vloer
// Dark Carbon (Initiale Paris fase 2): antraciet leder met nerf en lichtere naden, lichtgrijze hemel. MAT.leather en MAT.fabric zijn
// gedeeld (portieren, console, zonneschermen) en krijgen hier de tint van deze uitvoering. Nerf: ruis op wereldpositie (korrel 1,7 mm)
// op ruwheid en helderheid (geen uv nodig, geen glinstering).
function intGrain(m, amp, k) {
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vIntG;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvIntG = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vIntG;
float intH(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float intN(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(intH(i), intH(i + vec3(1, 0, 0)), f.x), mix(intH(i + vec3(0, 1, 0)), intH(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(intH(i + vec3(0, 0, 1)), intH(i + vec3(1, 0, 1)), f.x), mix(intH(i + vec3(0, 1, 1)), intH(i + vec3(1, 1, 1)), f.x), f.y), f.z); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
float intG = intN(vIntG * ${k.toFixed(1)}) - 0.5;
roughnessFactor = clamp(roughnessFactor + ${amp.toFixed(3)} * intG, 0.0, 1.0);
diffuseColor.rgb *= 1.0 + ${(amp * 0.5).toFixed(3)} * intG;`);
  };
  m.customProgramCacheKey = () => `intGrain${amp}|${k}`;
  // klonen (aanwijzen, selecteren, vervagen) houden de nerf, zoals bodGlassSideIn in bodyparts.js
  m.clone = function () { return intGrain(THREE.MeshStandardMaterial.prototype.clone.call(this), amp, k); };
  return m;
}
MAT.leather.color.setHex(0x141518); MAT.leather.roughness = 0.72; MAT.leather.envMapIntensity = 0.25; intGrain(MAT.leather, 0.05, 600);
MAT.fabric.color.setHex(0xa3a5a4); MAT.fabric.roughness = 1; MAT.fabric.envMapIntensity = 0.3;   // lichtgrijze, matte hemelstof (ook de zonneschermen van het dak)
intGrain(std('intLeatherPerf', 0x101114, 0, 0.8, { envMapIntensity: 0.25 }), 0.07, 600);   // middenbaan van de zittingen en rugleuningen: matter, leest als geperforeerd
std('intSeam', 0xb0aea8, 0, 0.6);    // stiksel: licht grijs contraststiksel (foto eigenaar, golf 5n ronde 2; was 0x6a6d72)
std('intHemPlast', 0x8e908f, 0, 0.8, { envMapIntensity: 0.3 });   // kunststof in hemelkleur (dakgrepen, huis van de leeslamp achter): een stap donkerder en glanzender dan de hemelstof
std('intLampLens', 0xe4e0d4, 0, 0.35);  // matte lens van een leeslamp
std('intTrimDark', 0x1f2124, 0, 0.85, { envMapIntensity: 0.28 });
MAT.dash.color.setHex(0x1f2124); MAT.dash.roughness = 0.85; MAT.dash.envMapIntensity = 0.28;   // dashboard en donkere bekleding een stap donkerder dan core.js (Dark Carbon; km77-foto dashboard circa sRGB 30)   // donker kunststof van de zijbekleding achter en de afdekking onder de voorstoelen
// INITIALE op de voorste instaplijsten (foto eigenaar): canvastextuur zoals engLogoTex; breedte eerst gemeten (lettertype op Linux)
function intSillTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const k = c.getContext('2d'), F = '600 46px Arial, Helvetica, sans-serif', txt = 'INITIALE', sp = 16; k.textBaseline = 'middle'; k.font = F;
  const w = [...txt].reduce((a, ch) => a + k.measureText(ch).width + sp, -sp), sc = Math.min(1, 480 / w);
  k.translate(256 - w * sc / 2, 32); k.scale(sc, sc); k.fillStyle = '#3d4046';
  let x = 0; for (const ch of txt) { k.fillText(ch, x, 2); x += k.measureText(ch).width + sp; }
  const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4;
  return tx;
}
std('intSillLogo', 0xffffff, 0.3, 0.45, { map: intSillTex(), alphaTest: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
const intPart = (name, geo, mat, d, o) => P(name, geo, mat, Object.assign({ d }, o));
// hoedenplank met pennen, koordjes en luidsprekers: uitgenomen zolang een opener in de bagageruimte open is (zoals een eigenaar doet)
const intPlankHide = ['Rugleuning groot deel', 'Rugleuning klein deel', 'Bagageruimtevloer'];
const intUit = n => { n.hideWhen = intPlankHide; return n; };
// vlakke band (gordelband) tussen twee punten; het vlak kijkt langs nv (standaard naar voren)
function intStrip(a, b, w, t, nv = [0, 0, 1]) {
  const A0 = V3(...a), B0 = V3(...b), z = B0.clone().sub(A0), L = z.length(); z.normalize();
  const N = V3(...nv), y = N.clone().sub(z.clone().multiplyScalar(z.dot(N))).normalize(), x = y.clone().cross(z).normalize();
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

// Gevormde stoelkussens (golf 5l): lofts (intLoft) met zijwangen, een lager middenvlak met naad en een afgeronde voorkant; maten uit
// de oude blokken, vorm geschat uit foto's. intBolster: halve doorsnede, hc = middenvlak, hb = zijwang, in (u, v)
const intBolster = (hc, hb, u1, uS) => [[0, hc + 0.002], [0.08, hc + 0.003], [uS - 0.013, hc + 0.001], [uS, hc - 0.003], [uS + 0.012, hc + 0.007], [uS + 0.03, hb - 0.008],
  [uS + 0.05, hb], [u1 - 0.018, hb - 0.005], [u1 - 0.004, hb - 0.022]];
// hoogte v van de halve doorsnede (intBolster) op u, voor naden op het oppervlak
const intBolsterAt = (hc, hb, u1, uS, u) => { const B = intBolster(hc, hb, u1, uS); for (let i = 0; i < B.length - 1; i++) if (u <= B[i + 1][0]) return lerp(B[i][1], B[i + 1][1], (u - B[i][0]) / (B[i + 1][0] - B[i][0])); return B[B.length - 1][1]; };
// dubbel stiksel (golf 5n ronde 2, foto eigenaar): twee lijnen 1 cm uit elkaar langs de naad tussen middenbaan en zijwang (op uS ± 5 mm)
// en twee langs de buitenrand van de zijwang (op u1 - 16 en u1 - 25 mm), aan beide kanten; rows: [[w, hc, hb]], ax zoals intCushLoft
const intSeamRows = (rows, u1, uS, ax, n) => merge([1, -1].flatMap(sg => [uS - 0.005, uS + 0.005, u1 - 0.025, u1 - 0.016].map(u =>
  intSeamTube(rows.map(([w, hc, hb]) => { const v = intBolsterAt(hc, hb, u1, uS, u) + 0.0003; return ax === 'z' ? [sg * u, v, w] : [sg * u, w, v]; }), n))));
// hele doorsnede: onderkant v0, zijkant u1, k (0 tot 1) krimpt naar de afgeronde voor- of bovenrand
function intCushSec(hc, hb, u1, uS, v0, k = 0, sq = 0.03) {
  const right = [...intBolster(hc, hb, u1, uS), [u1, lerp(v0, hb, 0.62)], [u1 - 0.003, lerp(v0, hb, 0.3)], [u1 - sq, v0]];   // van het midden boven naar rechtsonder
  const loop = [...right.slice(1).reverse().map(([u, v]) => [-u, v]), ...right];   // linksonder, links omhoog, over de bovenkant, rechts omlaag
  return loop.map(([u, v]) => [u * (1 - 0.22 * k), v0 + (v - v0) * (1 - 0.55 * k)]);
}
// loft van [[w, doorsnede]] langs 'z' (u = x, v = y) of 'y' (u = x, v = z)
const intCushLoft = (secs, ax) => intLoft(secs.map(([w, sec]) => sec.map(([u, v]) => ax === 'z' ? [u, v, w] : [u, w, v])));
// naad (stiksel) als dunne buis langs punten
const intSeamTube = (pts, n) => tube(pts, 0.0016, n || Math.max(4, pts.length * 2), 4);
// hoofdsteun: loft in y van afgeronde rechthoeken
// afgeronde rechthoek in (x, z), voorkant 6 mm bol; de voorste helft loopt van rechts (x = cw) over de voorkant naar links
const intHeadRR = (cw, fz, bz, r, n = 3) => { const P = [], c = [[cw - r, fz - r, 0], [-cw + r, fz - r, HALF], [-cw + r, bz + r, PI], [cw - r, bz + r, 1.5 * PI]];
  for (const [cx, cz, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + HALF * i / n; P.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
  return P.map(([u, v]) => [u, v + (v > 0 ? 0.006 * Math.cos(PI * u / (2 * cw)) : 0)]); };
// [hoogte, breedte, diepte]; de voorkant blijft binnen d / 2 (+3 mm bovenaan)
const intHeadYs = h => [[0, 0.86, 0.6], [0.012, 0.95, 0.85], [0.04, 1, 1], [h / 2, 1, 1], [h - 0.035, 0.97, 1], [h - 0.012, 0.9, 0.85], [h, 0.76, 0.55]];
const intHeadSec = (w, h, d, y, sw, sd) => { const fz = d / 2 * sd - 0.006 + (y > h / 2 ? 0.003 : 0), bz = -d / 2 * sd; return intHeadRR(w / 2 * sw, fz, bz, Math.min(0.03, (fz - bz) / 2 - 0.002)); };
function intHeadGeo(w, h, d) {
  return intLoft(intHeadYs(h).map(([y, sw, sd]) => intHeadSec(w, h, d, y, sw, sd).map(([u, v]) => [u, y, v])));
}
// stiksel rond de voorkant van de hoofdsteun (golf 5n ronde 2, foto eigenaar): 12 mm binnen de zijkanten, 2 cm onder de bovenkant en
// boven de onderkant, op de afronding van de voorkant (z per punt uit de doorsnede op die hoogte, 0,3 mm boven het oppervlak)
function intHeadSeam(w, h, d) {
  const Y = intHeadYs(h), at = y => { for (let i = 0; i < Y.length - 1; i++) if (y <= Y[i + 1][0]) { const t = (y - Y[i][0]) / (Y[i + 1][0] - Y[i][0]); return [lerp(Y[i][1], Y[i + 1][1], t), lerp(Y[i][2], Y[i + 1][2], t)]; } return Y[Y.length - 1].slice(1); };
  const pt = (x, y) => { const [sw, sd] = at(y), F = intHeadSec(w, h, d, y, sw, sd).slice(0, 8);   // voorste helft, x van groot naar klein
    for (let i = 0; i < F.length - 1; i++) if (x <= F[i][0] && x >= F[i + 1][0]) return [x, y, lerp(F[i][1], F[i + 1][1], (F[i][0] - x) / (F[i][0] - F[i + 1][0] || 1)) + 0.0003];
    return [x, y, F[0][1]]; };
  const m = 0.012, y0 = 0.02, y1 = h - 0.022, xw = y => w / 2 * at(y)[0] - m, pts = [];
  for (let i = 0; i <= 4; i++) { const y = lerp(y0, y1, i / 4); pts.push(pt(-xw(y), y)); }
  for (let i = 1; i < 6; i++) pts.push(pt(lerp(-xw(y1), xw(y1), i / 6), y1));
  for (let i = 0; i <= 4; i++) { const y = lerp(y1, y0, i / 4); pts.push(pt(xw(y), y)); }
  for (let i = 1; i < 6; i++) pts.push(pt(lerp(xw(y0), -xw(y0), i / 6), y0));
  return tube(pts, 0.0016, 40, 4, true);
}
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
  // zitting: loft in z; onderkant 0,13, de afgeschuinde onderhoeken blijven binnen de oude bekleding (vrij van tunnel en console)
  // golf 5n ronde 2 (foto eigenaar): zijwangen tot 1 cm hoger dan in golf 5l (3,2 tot 4,4 cm boven de middenbaan), voller naar de foto
  const cz = [[-0.235, 0.218, 0.252, 0], [-0.2, 0.222, 0.26, 0], [-0.12, 0.226, 0.268, 0], [-0.02, 0.228, 0.272, 0], [0.08, 0.228, 0.27, 0], [0.17, 0.227, 0.264, 0], [0.225, 0.225, 0.257, 0],
    [0.252, 0.222, 0.25, 0.12], [0.268, 0.214, 0.238, 0.38], [0.278, 0.2, 0.22, 0.75]];
  const hcAt = z => { for (let i = 0; i < cz.length - 1; i++) if (z <= cz[i + 1][0]) return lerp(cz[i][1], cz[i + 1][1], (z - cz[i][0]) / (cz[i + 1][0] - cz[i][0])); return cz[cz.length - 1][1]; };
  const seatGeo = intCushLoft(cz.map(([z, hc, hb, k]) => [z, intCushSec(hc, hb, 0.247, 0.163, 0.13, k, 0.03)]), 'z');
  const midZ = [-0.19, -0.12, -0.02, 0.08, 0.17, 0.215], midGeo = intLoft(midZ.map(z => [[-0.148, hcAt(z) - 0.002], [0.148, hcAt(z) - 0.002], [0.15, hcAt(z) + 0.0025], [-0.15, hcAt(z) + 0.0025]].map(([x, y]) => [x, y, z])));
  // dwarsnaden over de middenbaan: op de foto donkere vouwen zonder licht stiksel, daarom in het leder van de middenbaan (golf 5n ronde 2)
  const seatSeams = intSeamRows(cz.slice(1, 7).map(([z, hc, hb]) => [z, hc, hb]), 0.247, 0.163, 'z', 12);
  const seatCross = [-0.09, 0.02, 0.12].map(z => intSeamTube([[-0.146, hcAt(z) + 0.003, z], [0, hcAt(z) + 0.0035, z], [0.146, hcAt(z) + 0.003, z]], 4));
  const cushion = A('Zitting', { d: 'Zitkussen: schuim, verwarmingsmat en lederen bekleding met zijwangen en een geperforeerde middenbaan met dwarsnaden.', ex: [0, 0.16, 0.08] }, [
    intPart('Zitschuim', bx(0.44, 0.085, 0.48, 0.03, [0, 0.17, 0.02]), MAT.intFoam, 'Gevormd polyurethaanschuim van het zitkussen.', { inner: true, ex: [0, 0.03, 0] }),
    intPart('Verwarmingsmat zitting', G.box(0.34, 0.003, 0.38), MAT.heater, 'Verwarmingselement in de zitting; de stoelverwarming heeft drie standen met thermostaat.', { p: [0, 0.2155, 0.03], inner: true, ex: [0, 0.07, 0.03] }),
    intPart('Zitbekleding', seatGeo, MAT.leather, 'Gevormde lederen bekleding (Dark Carbon) met verstevigde zijwangen en een afgeronde voorkant; tussen zijwang en middenbaan een diepe naad.', { ex: [0, 0.13, 0.05] }),
    intPart('Middenbaan zitting', merge([midGeo, ...seatCross]), MAT.intLeatherPerf, 'Geperforeerde middenbaan van de zitting tussen de zijwangen, met drie dwarsnaden.', { ex: [0, 0.2, 0.06] }),
    intPart('Naden zitting', seatSeams, MAT.intSeam, 'Dubbel contraststiksel in licht grijs langs de naad tussen middenbaan en zijwang en langs de buitenrand van de zijwangen.', { ex: [0, 0.24, 0.07] }),
    intPart('Zijkap zitting', G.rbox(0.012, 0.07, 0.42, 0.005), MAT.plastic, 'Kunststof kap aan de portierzijde van het zitkussen met de bedieningsschakelaars.', { p: [s * 0.262, 0.15, 0.01], ex: [s * 0.1, 0, 0] }),
    intPart('Stoelschakelaars', merge([bx(0.012, 0.016, 0.03, 0.004, [s * 0.272, 0.165, 0.09]), bx(0.012, 0.016, 0.03, 0.004, [s * 0.272, 0.138, 0.09]), cy('x', 0.011, 0.012, [s * 0.272, 0.152, 0.14], 10)]), MAT.plasticGrey, 'Schakelaars voor de elektrische stoelverstelling en de verwarming.', { ex: [s * 0.16, 0, 0.02] }),
  ]);
  const hr = A('Hoofdsteun', { d: 'In hoogte verstelbare hoofdsteun met twee geleidestangen.', p: [0, 0.69, -0.02], ex: [0, 0.3, 0] }, [
    intPart('Hoofdsteunkussen', xf(intHeadGeo(0.27, 0.17, 0.09), [0, 0.015, 0]), MAT.leather, 'Gevormd, met leder bekleed kussen; afgeronde randen en een licht bolle voorkant.', { ex: [0, 0.08, 0] }),
    intPart('Naden hoofdsteun', xf(intHeadSeam(0.27, 0.17, 0.09), [0, 0.015, 0]), MAT.intSeam, 'Contraststiksel rondom de voorkant van de hoofdsteun, op de afronding naar de zijkanten.', { ex: [0, 0.08, 0.02] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.0075, 0.13, [0.07, -0.02, 0], 10), cy('y', 0.0075, 0.13, [-0.07, -0.02, 0], 10)]), MAT.chrome, 'Twee verchroomde stangen die in de bussen van de rugleuning schuiven.', { ex: [0, -0.05, 0] }),
  ]);
  // rugleuning: loft in y; achterkant z -0,058, zijwangen tot 0,085, lendenbolling, schouders afgerond
  // golf 5n ronde 2 (foto eigenaar): zijwangen 0,8 tot 2 cm verder naar voren dan in golf 5l (3,3 tot 4,6 cm voor de middenbaan),
  // onderaan en bij de schouders minder
  const by = [[0, 0.05, 0.088, 0], [0.04, 0.054, 0.096, 0], [0.12, 0.06, 0.104, 0], [0.22, 0.062, 0.105, 0], [0.32, 0.056, 0.102, 0], [0.42, 0.05, 0.096, 0], [0.52, 0.047, 0.088, 0],
    [0.585, 0.045, 0.078, 0], [0.603, 0.042, 0.068, 0.15], [0.615, 0.036, 0.054, 0.45], [0.622, 0.025, 0.036, 0.8]];
  const zcAt = y => { for (let i = 0; i < by.length - 1; i++) if (y <= by[i + 1][0]) return lerp(by[i][1], by[i + 1][1], (y - by[i][0]) / (by[i + 1][0] - by[i][0])); return by[by.length - 1][1]; };
  const backGeo = intCushLoft(by.map(([y, zc, zb, k]) => [y, intCushSec(zc, zb, 0.25, 0.158, -0.058, k, 0.012)]), 'y');
  const midY = [0.07, 0.17, 0.27, 0.37, 0.47, 0.55], backMid = intLoft(midY.map(y => [[-0.143, zcAt(y) - 0.002], [0.143, zcAt(y) - 0.002], [0.145, zcAt(y) + 0.0025], [-0.145, zcAt(y) + 0.0025]].map(([x, z]) => [x, y, z])));
  const backSeams = intSeamRows(by.slice(1, 8).map(([y, zc, zb]) => [y, zc, zb]), 0.25, 0.158, 'y', 14);
  const backCross = [0.19, 0.31, 0.43].map(y => intSeamTube([[-0.141, y, zcAt(y) + 0.003], [0, y, zcAt(y) + 0.0035], [0.141, y, zcAt(y) + 0.003]], 4));
  // achterkant (golf 5n): vanaf de achterbank las de vlakke lederen achterkant als egaal zwart (sRGB 7 tot 10). Nu een gewelfde schaal
  // in het donkere kunststof (intTrimDark, een stap lichter dan het leder) met een naad langs de rand, en een kaartvak met een ronde
  // bovenrand die onderaan tegen de schaal ligt en bovenaan 13 mm openstaat, zodat de opening als donkere spleet leest.
  // Schaal: rand 12 mm dik (z -0,058 tot -0,07), in het midden tot 28 mm extra naar achteren; bovenhoeken met straal 5 cm.
  const shHw = y => y <= 0.555 ? 0.235 : 0.185 + Math.sqrt(Math.max(0, 0.0025 - (y - 0.555) ** 2));
  const shS = y => { const t = clamp((y - 0.02) / 0.585, 0, 1); return Math.sin(PI * Math.pow(t, 0.75)) ** 0.7; };   // bolste punt op ongeveer een derde van de hoogte
  const shZ = (x, y) => -0.07 - 0.028 * Math.max(0, 1 - (x / shHw(y)) ** 2) * shS(y);
  const shell = intLoft([0.02, 0.05, 0.1, 0.17, 0.25, 0.33, 0.41, 0.48, 0.535, 0.555, 0.572, 0.586, 0.597, 0.603, 0.605].map(y => {
    const hw = shHw(y), b = Array.from({ length: 15 }, (_, i) => { const x = (hw - 0.004) * Math.cos(PI * i / 14); return [x, y, shZ(x, y)]; });
    return [...b, [-hw, y, -0.064], [-hw, y, -0.058], [hw, y, -0.058], [hw, y, -0.064]];
  }));
  const shellSeam = (() => { const k = 0.025, pts = [];
    for (let i = 0; i <= 8; i++) { const y = 0.555 - 0.495 * i / 8; pts.push([shHw(y) - k, y, shZ(shHw(y) - k, y) - 0.0008]); }
    for (let i = 1; i < 8; i++) { const x = (0.21) * (1 - 2 * i / 8); pts.push([x, 0.06, shZ(x, 0.06) - 0.0008]); }
    for (let i = 0; i <= 8; i++) { const y = 0.06 + 0.495 * i / 8; pts.push([-(shHw(y) - k), y, shZ(-(shHw(y) - k), y) - 0.0008]); }
    // over de bovenkant: de bocht van de hoeken met straal 2,5 cm, 2,5 cm binnen de rand, en daartussen zes punten die de welving van
    // de schaal volgen (golf 5n ronde 2: recht van hoek tot hoek lag de naad in het midden 3 tot 4 mm in de schaal)
    const top = []; for (let i = 1; i <= 6; i++) { const a = PI - HALF * i / 6; top.push([-0.185 + 0.025 * Math.cos(a), 0.555 + 0.025 * Math.sin(a)]); }
    for (let j = 1; j <= 6; j++) top.push([-0.185 + 0.37 * j / 7, 0.58]);
    for (let i = 0; i < 6; i++) { const a = HALF - HALF * i / 6; top.push([0.185 + 0.025 * Math.cos(a), 0.555 + 0.025 * Math.sin(a)]); }
    top.forEach(([x, y]) => pts.push([x, y, shZ(x, y) - 0.0008]));
    pts.push(pts[0]);
    return intSeamTube(pts, 80); })();
  // kaartvak: paneel van 4 mm dat de welving volgt, van y 0,07 (tegen de schaal) tot 0,33 (13 mm open), met dichte zijkanten en een
  // ronde bovenrand van 5 mm
  const pkW = 0.17, pkY0 = 0.07, pkY1 = 0.33, pkOff = y => 0.013 * Math.pow(clamp((y - pkY0) / (pkY1 - pkY0), 0, 1), 1.6);
  const pkYs = [0.07, 0.11, 0.15, 0.19, 0.23, 0.27, 0.3, 0.33];
  const pkPanel = intLoft(pkYs.map(y => { const xs = Array.from({ length: 11 }, (_, i) => pkW * (1 - 2 * i / 10));
    return [...xs.map(x => [x, y, shZ(x, y) - pkOff(y) - 0.004]), ...xs.slice().reverse().map(x => [x, y, shZ(x, y) - pkOff(y)])]; }));
  const pkSides = [1, -1].map(u => intLoft(pkYs.map(y => { const x0 = u * pkW, x1 = u * (pkW - 0.003);
    return [[x0, y, shZ(x0, y) + 0.001], [x0, y, shZ(x0, y) - pkOff(y) - 0.002], [x1, y, shZ(x1, y) - pkOff(y) - 0.002], [x1, y, shZ(x1, y) + 0.001]]; })));
  // bovenrand: buis met een bolletje op elk eind, zodat de uiteinden op x ±0,17 dicht zijn
  const pkRimPts = Array.from({ length: 9 }, (_, i) => { const x = pkW * (1 - 2 * i / 8); return [x, pkY1, shZ(x, pkY1) - pkOff(pkY1) - 0.002]; });
  const pkRim = merge([tube(pkRimPts, 0.005, 16, 6), ...[pkRimPts[0], pkRimPts[8]].map(p => xf(G.sphere(0.005, 6), p))]);
  const pocket = merge([pkPanel, ...pkSides, pkRim]);
  const pocketSeam = intSeamTube(Array.from({ length: 9 }, (_, i) => { const x = (pkW - 0.008) * (1 - 2 * i / 8), y = pkY1 - 0.016; return [x, y, shZ(x, y) - pkOff(y) - 0.0048]; }), 16);
  const back = A('Rugleuning', { d: 'Rugleuning met frame, schuim, verwarming, zijairbag en lederen bekleding; de hoek is elektrisch verstelbaar. De achterkant is een gewelfde schaal van donker kunststof met een naad langs de rand en een lederen kaartvak.', p: [0, 0.24, -0.24], r: [-0.3, 0, 0], ex: [0, 0.18, -0.24] }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.6, [0.2, 0.31, -0.03]), cy('y', 0.009, 0.6, [-0.2, 0.31, -0.03]), cy('x', 0.009, 0.4, [0, 0.6, -0.03]), cy('x', 0.009, 0.4, [0, 0.03, -0.03])]), MAT.steel, 'Stalen buisframe van de rugleuning.', { inner: true, ex: [0, 0, -0.02] }),
    intPart('Lendensteun', merge([bx(0.3, 0.15, 0.008, 0.003, [0, 0.24, -0.015]), rodBetween([0.14, 0.17, -0.02], [-0.14, 0.17, -0.02], 0.004, 6), rodBetween([0.14, 0.31, -0.02], [-0.14, 0.31, -0.02], 0.004, 6)]), MAT.darkSteel, drv ? 'Handmatig verstelbare lendensteun met hendel (bestuurder).' : 'Lendensteunplaat; de passagiersstoel heeft volgens het onderzoek geen verstelbare lendensteun, dit deel is schematisch.', { inner: true, ex: [0, 0, -0.07] }),
    intPart('Rugschuim', bx(0.46, 0.58, 0.065, 0.03, [0, 0.31, 0.0]), MAT.intFoam, 'Gevormd schuim van de rugleuning.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Verwarmingsmat rugleuning', G.box(0.34, 0.4, 0.003), MAT.heater, 'Verwarmingselement in de rugleuning.', { p: [0, 0.31, 0.04], inner: true, ex: [0, 0, 0.1] }),
    intPart('Zijairbag', G.rbox(0.05, 0.2, 0.07, 0.015), MAT.plastic, 'Zijairbagmodule in de buitenste zijwang van de rugleuning (thorax en bekken), onder de bekleding verborgen.', { p: [s * 0.215, 0.4, 0.0], inner: true, ex: [s * 0.15, 0, 0] }),
    intPart('Rugbekleding', backGeo, MAT.leather, 'Gevormde lederen bekleding (Dark Carbon) met verstevigde zijwangen, lendenbolling en afgeronde schouders.', { ex: [0, 0, 0.16] }),
    intPart('Middenbaan rugleuning', merge([backMid, ...backCross]), MAT.intLeatherPerf, 'Geperforeerde middenbaan van de rugleuning tussen de zijwangen, met drie dwarsnaden.', { ex: [0, 0, 0.2] }),
    intPart('Naden rugleuning', backSeams, MAT.intSeam, 'Dubbel contraststiksel in licht grijs langs de naad tussen middenbaan en zijwang en langs de buitenrand van de zijwangen.', { ex: [0, 0, 0.24] }),
    intPart('Rugachterschaal', shell, MAT.intTrimDark, 'Achterkant van de rugleuning: gewelfde schaal van donker kunststof met een naad langs de rand en afgeronde bovenhoeken (vorm en materiaal geschat).', { ex: [0, 0, -0.14] }),
    // de naden van de achterkant klappen met schaal en kaartvak naar achteren uit (de naden van de voorkant gaan naar voren)
    intPart('Naden rugschaal', shellSeam, MAT.intSeam, 'Stiksel langs de rand van de rugschaal, 2,5 cm binnen de rand.', { ex: [0, 0, -0.15] }),
    intPart('Kaartvak', pocket, MAT.leather, 'Kaartvak in de achterkant van de rugleuning: lederen paneel dat de welving van de schaal volgt, met een ronde bovenrand en een opening van ruim een centimeter (vorm geschat).', { ex: [0, -0.04, -0.2] }),
    intPart('Naden kaartvak', pocketSeam, MAT.intSeam, 'Stiksel onder de bovenrand van het kaartvak.', { ex: [0, -0.04, -0.21] }),
    intPart('Hoofdsteunbussen', merge([cy('y', 0.011, 0.04, [0.07, 0.62, -0.02], 10), cy('y', 0.011, 0.04, [-0.07, 0.62, -0.02], 10)]), MAT.plastic, 'Geleidebussen in de bovenkant van de rugleuning.', { ex: [0, 0.02, 0] }),
    drv && intPart('Lendensteunhendel', merge([rodBetween([0.25, 0.24, -0.005], [0.3, 0.24, -0.005], 0.006, 8), rodBetween([0.3, 0.24, -0.005], [0.3, 0.17, -0.005], 0.008, 8)]), MAT.plasticGrey, 'Hendel voor de handmatige lendensteun, aan de portierzijde van de rugleuning.', { ex: [0.12, 0, 0] }),
    hr,
  ]);
  // afdekking onder de zitting achter en aan de portierzijde (niet aan de tunnelzijde: gordelslot en tunnel)
  const skirt = intPart('Afdekking stoelonderstel', merge([intBox(0.435, 0.093, 0.004, [s * 0.0275, 0.0815, -0.254]), intBox(0.004, 0.093, 0.45, [s * 0.248, 0.0815, -0.029])]), MAT.intTrimDark, 'Kunststof afdekking onder de zitting voor rails, motoren en kabels (vorm geschat).', { ex: [s * 0.06, -0.06, -0.12] });
  const buckle = A('Gordelslot met spanner', { d: 'Gordelslot met gordelverklikker en pyrotechnische slotspanner (de bestuurder heeft een dubbele spanner).', p: [-s * 0.235, 0.27, -0.12], ex: [-s * 0.12, 0.1, 0] }, [
    intPart('Slotbehuizing', G.rbox(0.03, 0.07, 0.04, 0.008), MAT.plastic, 'Behuizing van het gordelslot met schakelaar voor de gordelverklikker.', { ex: [0, 0.02, 0] }),
    intPart('Ontgrendelknop', G.rbox(0.016, 0.012, 0.022, 0.004), MAT.red, 'Rode knop om de gordel los te maken.', { p: [0, 0.038, 0.002], ex: [0, 0.05, 0] }),
    intPart('Slotkabel', merge([rodBetween([0, -0.03, 0], [0, -0.1, 0.02], 0.004, 6), rodBetween([0, -0.1, 0.02], [0, -0.1, 0.1], 0.004, 6)]), MAT.steel, 'Stalen kabel tussen het gordelslot en de spanner.', { ex: [0, -0.05, 0] }),
    intPart('Slotspanner', xf(G.cyl('z', 0.014, 0.014, 0.09, 12), [0, -0.1, 0.14]), MAT.darkSteel, 'Pyrotechnische buisspanner die bij een botsing de kabel en het slot naar beneden trekt.', { inner: true, ex: [0, -0.1, 0.04] }),
  ]);
  return A(who, { d: `${who}: elektrisch verstelbaar${drv ? ' met geheugen' : ''}, stoelverwarming en geperforeerd leder in Dark Carbon (Initiale Paris). Opbouw van onder naar boven: bouten, rails, frame met motoren, zitting en rugleuning met hoofdsteun.`, spec: [['Verstelling', 'elektrisch: lengte, voor- en achterhoogte, rugleuning'], ['Stoelverwarming', 'drie standen met thermostaat'], ['Geheugen', drv ? 'drie standen voor stoel en buitenspiegels' : 'geen'], ['Lendensteun', drv ? 'handmatig met hendel' : 'niet verstelbaar'], ['Bekleding', 'geperforeerd leder, Dark Carbon']], p: [s * 0.37, 0.24, -0.02], ex: [s * 0.36, 0.05, 0.06] }, [frame, rails, bolts, motors, cushion, back, skirt, buckle]);
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
  // naad tussen de twee delen: de lederen bekleding springt aan de naadzijde 14 mm in en de donkere achterbekleding krijgt daar een
  // flens van 6 mm, zodat je van achteren in de naad alleen het vlak van de achterbekleding ziet en van voren een naad blijft
  const seamX = out > 0 ? -hw + 0.01 : hw - 0.01, flange = intBox(0.006, 0.54, 0.068, [seamX + (out > 0 ? -0.003 : 0.003), 0.28, -0.034]);
  const xo = out > 0 ? hi - 0.03 : lo + 0.03, xi = out > 0 ? -hw + 0.03 : hw - 0.03;            // buitenste en binnenste framebuis
  return A(name, { d, p: [cx, intRB.y, intRB.z], r: [intRB.tilt, 0, 0], ex: [cx > 0 ? 0.14 : -0.14, 0.12, -0.12],
    open: hinge([cx, intRBP.y, intRBP.z], [1, 0, 0], intRBP.ang, Object.assign({ min: 1.456, label, look: { dir: [0.5, 0.6, -0.65], nodes: [name, 'Zitting achterbank', 'Renault Laguna III/Carrosserie/Achterklep/Klepafdichting'] } }, intNeed('Achterklep'))) }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.54, [xo, 0.28, -0.03]), cy('y', 0.009, 0.54, [xi, 0.28, -0.03]), cy('x', 0.009, w - 0.06, [0, 0.54, -0.03]), cy('x', 0.009, hi - lo - 0.06, [(hi + lo) / 2, 0.02, -0.03])]), MAT.steel, 'Stalen buisframe van het rugleuningdeel.', { ex: [0, 0, -0.02] }),
    intPart('Rugschuim', notched(0.01, 0.065, 0.03, 0, 0.016), MAT.intFoam, 'Schuimlaag van het rugleuningdeel.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', notched(0, 0.11, 0.03, 0, 0.014), MAT.leather, 'Lederen bekleding (Dark Carbon), onderaan aan de buitenkant ingesneden om de wielkast heen.', { ex: [0, 0, 0.14] }),
    // middenbaan van de buitenste zitplaats (|x| 0,28 tot 0,50); de middelste heeft de armsteun
    (() => { const lx = out * 0.39 - cx, g = intBox(0.22, 0.44, 0.005, [lx, 0.30, 0.0565]);
      return intPart('Middenbaan rugleuning', g, MAT.intLeatherPerf, 'Geperforeerde middenbaan van de buitenste zitplaats.', { ex: [0, 0, 0.18] }); })(),
    (() => { const lx = out * 0.39 - cx, z = 0.0595; return intPart('Naden rugleuning', merge([...[-1, 1].map(k => intSeamTube([[lx + k * 0.113, 0.085, 0.0575], [lx + k * 0.113, 0.3, 0.0575], [lx + k * 0.113, 0.515, 0.0575]], 8)), ...[0.23, 0.37].map(y => intSeamTube([[lx - 0.108, y, z], [lx + 0.108, y, z]], 3))]), MAT.intSeam, 'Stiksel langs en over de middenbaan van de buitenste zitplaats.', { ex: [0, 0, 0.22] }); })(),
    intPart('Rugachterbekleding', merge([notched(0.01, 0.012, 0.006, -0.062), flange]), MAT.carpet, 'Bekleding aan de bagageruimtezijde van het rugleuningdeel.', { ex: [0, 0, -0.14] }),
    intPart('Rugvergrendeling', bx(0.04, 0.05, 0.03, 0.008, [cx > 0 ? hw - 0.05 : -hw + 0.05, 0.55, -0.04]), MAT.steel, 'Vergrendeling in de bovenrand die de rugleuning aan de carrosserie vastzet; ontgrendeld met een hendel op de bank of in de bagageruimte.', { ex: [cx > 0 ? 0.06 : -0.06, 0.06, -0.04] }),
    intPart('Scharnierbeugels', merge([bx(0.05, 0.03, 0.06, 0.008, [hi - 0.045, 0.02, -0.04]), bx(0.05, 0.03, 0.06, 0.008, [lo + 0.045, 0.02, -0.04])]), MAT.darkSteel, 'Beugels waarmee het rugleuningdeel om de onderrand scharniert.', { ex: [0, -0.06, -0.06] }),
    extra,
  ]);
}
function intRearHead(x, name, lead) {
  const t = 0.6, bx = intBx, cy = intCy;
  return A(name, { d: 'Achterhoofdsteun met twee geleidestangen; drie stuks (een per zitplaats).', p: [x, intRB.y + t * Math.cos(intRB.tilt), intRB.z + t * Math.sin(intRB.tilt)], r: [intRB.tilt, 0, 0], ex: [0, 0.24, 0], open: follow(lead, [x, intRBP.y, intRBP.z], [1, 0, 0], intRBP.ang) }, [
    intPart('Hoofdsteunkussen', intHeadGeo(0.24, 0.14, 0.08), MAT.leather, 'Gevormd, met leder bekleed kussen.', { ex: [0, 0.07, 0] }),
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
    intPart('Zitbekleding achter', cushion(1.26, 0.48, 0.12, 0.03, 0, 0.5, -0.035), MAT.leather, 'Lederen bekleding (Dark Carbon) van de zitting, achteraan aan de buitenkanten ingesneden tussen de wielkasten.', { ex: [0, 0.1, 0.04] }),
    intPart('Middenbanen zitting achter', merge([1, -1].map(s => intBox(0.22, 0.005, 0.35, [s * 0.39, 0.0615, 0.015]))), MAT.intLeatherPerf, 'Geperforeerde middenbanen van de twee buitenste zitplaatsen.', { ex: [0, 0.14, 0.06] }),
    intPart('Naden zitting achter', merge([1, -1].flatMap(s => [...[-1, 1].map(k => intSeamTube([[s * 0.39 + k * 0.113, 0.0605, -0.165], [s * 0.39 + k * 0.113, 0.0605, 0.0], [s * 0.39 + k * 0.113, 0.0605, 0.195]], 8)),
      ...[-0.05, 0.08].map(z => intSeamTube([[s * 0.39 - 0.108, 0.0645, z], [s * 0.39 + 0.108, 0.0645, z]], 3))])), MAT.intSeam, 'Stiksel langs en over de middenbanen van de buitenste zitplaatsen.', { ex: [0, 0.18, 0.07] }),
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
  const bandGeo = (pts, w, nv) => merge(pts.slice(1).map((p, i) => intStrip(pts[i], p, w, 0.0015, nv)));
  for (const s of [1, -1]) {
    const n = sideName(s), zB = -0.28, xr = s * (surfX(zB, 0.55) - 0.087);
    // hoogteversteller in het verdiepte vak van de B-stijlbekleding (helling 0,14); de band hangt in de rusttand langs de bekleding tot de
    // tong op y 0,585 (het stuk naar de verankering is niet getekend)
    const bf = y => { const zF = intBUpAt(y, 'zF'), zR = intBUpAt(y, 'zR'), zc = (zF + zR) / 2; return [intBUpX(zc, y) - 0.016 - 0.002, zc]; };   // binnenvlak en hart van de bekleding
    const [xa, za] = bf(1.075), [xl, zl] = [Math.min(0.700, surfX(intBzc(0.62), 0.62) - 0.03) - 0.016, intBzc(0.62) - 0.004];
    const xg = s * (xa - 0.012), restPts = [[xg, 1.082, za + 0.004], [s * (xa - 0.004), 1.04, za - 0.002], [s * (xl - 0.004), 0.62, zl]], tong = [s * (xl - 0.008), 0.585, zl];
    const grp = [];
    grp.push(
      intPart(`Gordelrolautomaat voor ${n}`, G.rbox(0.06, 0.1, 0.06, 0.01), MAT.plastic, 'Oprolautomaat met gordelspanner en krachtbegrenzer onderin de B-stijl, achter de stijlbekleding verborgen; de bestuurder heeft een dubbele spanner.', { p: [xr, 0.55, zB], ex: [s * 0.1, 0, 0] }),
      intPart(`Hoogteversteller voor ${n}`, G.rbox(0.006, 0.15, 0.024, 0.002), MAT.plasticGrey, 'Geleiderail met schuif, verzonken in de B-stijlbekleding, voor de hoogte van de gordelgeleider.', { p: [s * (bf(1.075)[0] - 0.0015 + 0.002), 1.075, bf(1.075)[1]], r: [-0.1425, 0, 0], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider voor ${n}`, G.torus('x', 0.016, 0.004, 16, 6), MAT.steel, 'Geleideoog op de schuif van de hoogteversteller, waar de gordelband doorheen loopt.', { p: [xg, 1.10, bf(1.10)[1]], r: [-0.1425, 0, 0], ex: [s * 0.1, 0.16, 0] }),
      intPart(`Gordelband voor ${n}`, bandGeo(restPts, 0.046, [1, 0, 0]), MAT.intBelt, 'Gordelband in de rusttand: hangt vanuit de geleider langs de B-stijlbekleding tot de tong; het stuk naar de onderste verankering is niet getekend.', { ex: [s * 0.1, 0.1, 0.06] }),
      intPart(`Gordeltong voor ${n}`, G.rbox(0.008, 0.05, 0.03, 0.003), MAT.steel, 'Metalen tong op de gordelband die in het gordelslot klikt; in de rusttand hangt hij onderaan de stijl.', { p: tong, ex: [0, 0.14, 0.04] }),
      intPart(`Gordelverankering voor ${n}`, hexBolt(0.02, 0.014, 'x'), MAT.steel, 'Bout waarmee de heupband aan de buitenkant van de stoel in de drempel is verankerd.', { p: [s * 0.7, 0.33, -0.22], r: [0, s > 0 ? 0 : PI, 0], ex: [s * 0.1, 0, 0] }));
    out.push(A(`Gordel voor ${n}`, { d: 'Driepuntsgordel van de voorstoel: rolautomaat in de B-stijl, hoogteversteller, geleider, band, tong en onderste verankering.', ex: [s * 0.05, 0.12, 0] }, grp));
  }
  [[0.42, 'links'], [0, 'midden'], [-0.42, 'rechts']].forEach(([x, n]) => {
    const sx = Math.sign(x), xr = sx * (surfX(-1.5, 0.8) - 0.07), zr = -1.5, yr = 0.8;   // rolautomaat buiten: boven de achterwielkast
    const grp = [];
    if (x !== 0) grp.push(intPart(`Gordelrolautomaat achter ${n}`, G.rbox(0.06, 0.06, 0.08, 0.01), MAT.plastic, 'Oprolautomaat met spanner in de achterstijl.', { p: [xr, yr, zr], ex: [sx * 0.1, 0.1, 0] }));
    // middelste gordel (golf 5n ronde 2, besluit van de gebruiker): komt uit de rugleuning. De oprolautomaat zit in het grote deel naast
    // de middelste hoofdsteun; de band komt door een geleider in de bovenrand en hangt in de rusttand langs de voorkant van de rugleuning,
    // naast de middenarmsteun, tot de tong. Alles klapt met de rugleuning mee. Punten in het kader van de rugleuning (rbW: x, hoogte langs
    // de rugleuning, afstand voor het hart); de voorkant van de bekleding ligt op 0,055.
    if (x === 0) {
      const gx = -0.15, c = Math.cos(intRB.tilt), sn = Math.sin(intRB.tilt), rbW = (ly, lz, lx = gx) => [lx, intRB.y + ly * c - lz * sn, intRB.z + ly * sn + lz * c];
      const fol = () => follow('Rugleuning groot deel', [0, intRBP.y, intRBP.z], [1, 0, 0], intRBP.ang, { min: 1.456 }), r = [intRB.tilt, 0, 0];
      // band: over de geleider, dan langs de raaklijn op de afronding van de bekleding (roundPlate: middelpunt ly 0,53, lz 0,025, straal
      // 0,03) en langs de voorkant omlaag. Hart van de band 1,5 mm buiten de boog (halve dikte 0,75 mm, plus de koorden van de band
      // en van de afronding in vier stukken; gemeten 0,35 mm vrij). De raaklijn komt van de voorrand van de geleider (lz 0,013) en raakt
      // de boog ongeveer 20 graden voorbij de top. Normaal per stuk loodrecht op de band, van de rugleuning af.
      const bc = [0.53, 0.025], br = 0.0315, p1 = [0.5675, 0.013], dl = Math.hypot(p1[0] - bc[0], p1[1] - bc[1]);
      const t0 = Math.atan2(p1[1] - bc[1], p1[0] - bc[0]) + Math.acos(br / dl);
      const band = [rbW(0.5675, 0.004), rbW(...p1), ...[0, 1, 2, 3, 4].map(k => { const a = t0 + (HALF - t0) * k / 4; return rbW(bc[0] + br * Math.cos(a), bc[1] + br * Math.sin(a)); }), rbW(0.3, 0.0561)];
      grp.push(
        intPart(`Gordelrolautomaat achter ${n}`, G.rbox(0.07, 0.05, 0.04, 0.008), MAT.plastic, 'Oprolautomaat van de middelste achtergordel, in het grote deel van de rugleuning naast de middelste hoofdsteun (plaats geschat).', { p: rbW(0.5, -0.02), r, inner: true, ex: [0, 0.1, -0.1], open: fol() }),
        intPart(`Gordelgeleider achter ${n}`, G.box(0.064, 0.006, 0.026), MAT.plastic, 'Kunststof geleider in de bovenrand van de rugleuning, waar de middelste gordel uit de rugleuning komt.', { p: rbW(0.5635, 0), r, ex: [0, 0.16, 0], open: fol() }),
        intPart(`Gordelband achter ${n}`, merge(band.slice(1).map((b, i) => intStrip(band[i], b, 0.046, 0.0015, [0, b[2] - band[i][2], band[i][1] - b[1]]))), MAT.intBelt, 'Gordelband van de middelste zitplaats in de rusttand: komt uit de geleider in de bovenrand van de rugleuning en hangt langs de voorkant naast de middenarmsteun tot de tong; klapt met de rugleuning mee.', { ex: [0, 0.12, 0.05], open: fol() }),
        intPart(`Gordeltong achter ${n}`, G.rbox(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong die in het gordelslot klikt; hangt in de rusttand aan de band tegen de voorkant van de rugleuning.', { p: rbW(0.28, 0.0615), r, ex: [0, 0.14, 0.04], open: fol() }));
    }
    else {
      // rusttand: uit de C-stijlbekleding, binnen de richel langs, recht omlaag naast de rugleuning (blijft staan als die neerklapt)
      const z0 = -1.29, xs = surfX(z0, 1.045) - 0.022, pts = [[sx * xs, 1.045, z0], [sx * 0.698, 1.0, z0], [sx * 0.7, 0.75, z0]];
      grp.push(
        intPart(`Gordelband achter ${n}`, bandGeo(pts, 0.046, [1, 0, 0]), MAT.intBelt, 'Gordelband in de rusttand: komt uit de C-stijlbekleding en hangt langs de zijbekleding; het stuk naar de verankering is niet getekend.', { ex: [sx * 0.08, 0.12, 0.05] }),
        intPart(`Gordeltong achter ${n}`, G.rbox(0.008, 0.05, 0.03, 0.003), MAT.steel, 'Metalen tong die in het gordelslot klikt; hangt in de rusttand op de band naast de rugleuning.', { p: [sx * 0.693, 0.82, z0], ex: [sx * 0.04, 0.14, 0.04] }));
    }
    out.push(A(`Gordel achter ${n}`, { d: 'Driepuntsgordel van de achterbank: rolautomaat, band en tong; het slot zit in de zitting.', ex: [sx * 0.04, 0.1, 0] }, grp));
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
  lcd: [0, 388, 120, 512], climDisp: [640, 128, 768, 158], hazRow: [512, 192, 768, 223], gate: [768, 0, 896, 256],
  clim: [896, 60, 1024, 164], park: [896, 166, 1024, 256], radio: [0, 256, 512, 388], joy: [512, 256, 768, 512], nav: [768, 256, 1024, 400],
};
// toetsen van de panelen: [u, v, b, h, tekst] in meter vanaf de linkerbovenhoek zoals de bestuurder het paneel ziet
// klimaatpaneel (golf 5n, foto van de eigenaar): schild van 14,5 cm breed boven, 10 cm onder en 11,8 cm hoog
const intClimW = 0.145, intClimWb = 0.10, intClimH = 0.118, intRadW = 0.24, intRadH = 0.062, intHazW = 0.18, intHazH = 0.022, intJoyW = 0.09;
const intClimKeys = [[0.036, 0.013, 0.033, 0.012, 'SOFT'], [0.0725, 0.011, 0.034, 0.012, 'AUTO'], [0.109, 0.013, 0.033, 0.012, 'FAST'],
  [0.052, 0.058, 0.04, 0.012, '< >'], [0.093, 0.058, 0.04, 0.012, '< >'], [0.047, 0.08, 0.026, 0.015, 'AC'], [0.0725, 0.086, 0.022, 0.03, '+  -'],
  [0.098, 0.08, 0.026, 0.015, 'DIST'], [0.056, 0.104, 0.024, 0.012, 'REC']];
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
  // t0, t1: plaats van het eerste en laatste label op de schaal (standaard aan de uiteinden); de streepjes lopen over de hele schaal
  const dial = (R, labels, sub, red, unit, t0 = 0, t1 = 1) => {
    const cx = (R[0] + R[2]) / 2, cy = (R[1] + R[3]) / 2, r = (R[2] - R[0]) / 2 - 1, n = Math.round((labels.length - 1) * sub / (t1 - t0)), ang = t => (-135 + 270 * t) * PI / 180, i0 = Math.round(t0 * n);
    k.fillStyle = '#121418'; k.beginPath(); k.arc(cx, cy, r, 0, PI * 2); k.fill();
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = ang(t), big = (i - i0) % sub === 0, r0 = r * (big ? 0.8 : 0.87);
      k.strokeStyle = red != null && t > red - 1e-6 ? '#e0302a' : W; k.lineWidth = big ? 3.5 : 1.6;
      k.beginPath(); k.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); k.lineTo(cx + Math.sin(a) * r * 0.95, cy - Math.cos(a) * r * 0.95); k.stroke();
    }
    labels.forEach((s, i) => { const a = ang(t0 + (t1 - t0) * i / (labels.length - 1)); txt(s, cx + Math.sin(a) * r * 0.62, cy - Math.cos(a) * r * 0.62, r * (s.length > 2 ? 0.105 : 0.17)); });
    if (unit) txt(unit, cx, cy + r * 0.36, r * 0.09);
  };
  // toerenteller 0 tot 7 x 1000 met rood vanaf 6,5 (foto van de eigenaar, golf 5n)
  dial(intTexR.tach, ['0', '1', '2', '3', '4', '5', '6', '7'], 2, 6.5 / 7, 'x1000 /min');
  // snelheidsmeter 0 tot 280 km/h met de cijfers 10, 30, ... 270 (foto van de eigenaar, IMG_0005), een streepje per 10 km/h
  dial(intTexR.speedo, Array.from({ length: 14 }, (_, i) => String(10 + 20 * i)), 2, null, 'km/h', 10 / 280, 270 / 280);
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
  // informatiedisplay: kleurenscherm met blauwe achtergrond en witte tekst (boordcomputer, foto van de eigenaar)
  { const R = intTexR.lcd, w = R[2] - R[0], h = R[3] - R[1], g = k.createLinearGradient(0, R[1], 0, R[3]); g.addColorStop(0, '#2b55c8'); g.addColorStop(1, '#16307e');
    k.fillStyle = g; k.fillRect(R[0], R[1], w, h); k.fillStyle = '#0d1b4a'; k.fillRect(R[0], R[1], w, 4); k.fillRect(R[0], R[3] - 4, w, 4);
    txt('Gemiddeld', R[0] + w / 2, R[1] + h * 0.24, 15, '#ffffff'); txt('8,4 l/100', R[0] + w / 2, R[1] + h * 0.5, 17, '#ffffff', true); txt('D', R[0] + w / 2, R[1] + h * 0.78, 18, '#ffffff', true); }
  lcd(intTexR.climDisp, [['21,0', 0.2, 0.5], ['AUTO', 0.5, 0.5], ['21,0', 0.8, 0.5]], 14);
  // opschriften op toetsen: tekst in het midden van elke toets, schaal in pixels per meter
  const keys = (R, Wm, list, px) => { const s = (R[2] - R[0]) / Wm;
    list.forEach(([u, v, , h, t]) => {
      const x = R[0] + u * s, y = R[1] + v * s;
      if (t === 'HAZ') { k.strokeStyle = W; k.lineWidth = 2.5; k.beginPath(); k.moveTo(x, y - 6); k.lineTo(x + 7, y + 6); k.lineTo(x - 7, y + 6); k.closePath(); k.stroke(); }
      else if (t === 'REC') { k.strokeStyle = W; k.lineWidth = 2; k.beginPath(); k.arc(x, y, 5, 0.4, PI * 1.8); k.stroke(); }
      else if (t === 'DEF' || t === 'DEFR') { k.strokeStyle = W; k.lineWidth = 1.8; k.beginPath(); if (t === 'DEF') { k.moveTo(x - 8, y + 5); k.lineTo(x - 5, y - 5); k.lineTo(x + 5, y - 5); k.lineTo(x + 8, y + 5); k.closePath(); } else k.rect(x - 8, y - 5, 16, 10);
        for (const d of [-3, 0, 3]) { k.moveTo(x + d, y - 3); k.lineTo(x + d, y + 3); } k.stroke(); }
      else if (t === 'DIST') { k.strokeStyle = W; k.lineWidth = 1.6; k.beginPath(); k.arc(x - 2, y - 4, 2, 0, PI * 2); k.moveTo(x - 3, y - 1); k.lineTo(x - 2, y + 5); k.lineTo(x + 3, y + 5); k.moveTo(x + 1, y - 2); k.lineTo(x + 6, y - 5); k.stroke(); }
      else if (t.startsWith('SEAT')) { k.strokeStyle = W; k.lineWidth = 2; k.beginPath(); k.moveTo(x - 5, y - 7); k.lineTo(x - 3, y + 4); k.lineTo(x + 6, y + 4); k.stroke(); k.font = F(7); k.fillStyle = W; k.fillText(t.slice(5), x + 7, y - 4); }
      else txt(t, x, y, Math.min(px, h * s * 0.7));
    }); };
  keys(intTexR.clim, intClimW, intClimKeys, 9);
  keys(intTexR.radio, intRadW, intRadKeys, 11);
  keys(intTexR.hazRow, intHazW, intHazKeys, 10);
  keys(intTexR.joy, intJoyW, intJoyKeys, 14);
  // keuzepoort: P R N D als ronde lampjes van voor naar achter aan de bestuurderszijde, daaronder de handmatige stand (+ en -)
  { const R = intTexR.gate, cx = R[0] + 44, lamp = (x, y, r) => { k.fillStyle = '#8d9096'; k.beginPath(); k.arc(x, y, r, 0, PI * 2); k.fill(); k.strokeStyle = '#3a3c40'; k.lineWidth = 2; k.stroke(); };
    ['P', 'R', 'N', 'D'].forEach((s, i) => { lamp(cx + i * 6, R[1] + 52 + i * 38, 15); txt(s, cx + i * 6, R[1] + 52 + i * 38, 18, '#202226', true); });
    lamp(cx + 22, R[1] + 206, 13); lamp(cx + 22, R[1] + 236, 13); txt('+', cx + 22, R[1] + 206, 20, '#202226', true); txt('-', cx + 22, R[1] + 236, 24, '#202226', true); }
  // parkeerremschakelaar (bovenkant): donkere klep met een rode streep voor en het P-symbool in een cirkel met haakjes achter;
  // de linkerbovenhoek blijft effen donker voor de zijkanten van de schakelaar
  { const R = intTexR.park, w = R[2] - R[0], h = R[3] - R[1], cx = R[0] + w / 2;
    k.fillStyle = '#26282c'; k.fillRect(R[0], R[1], w, h); k.fillStyle = '#34373c'; k.fillRect(R[0] + 8, R[1] + 6, w - 16, h - 12);
    k.fillStyle = '#e8204e'; k.fillRect(cx - 34, R[1] + 16, 68, 9);
    k.strokeStyle = W; k.lineWidth = 3; k.beginPath(); k.arc(cx, R[1] + 60, 15, 0, PI * 2); k.stroke();
    k.beginPath(); k.arc(cx, R[1] + 60, 22, -0.9, 0.9); k.stroke(); k.beginPath(); k.arc(cx, R[1] + 60, 22, PI - 0.9, PI + 0.9); k.stroke();
    txt('P', cx, R[1] + 61, 20, W, true); }
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
// golf 5n: bolle veelhoek (tegen de klok in) met afgeronde hoeken (straal r, of een straal per hoek; n stukjes per hoek), en dezelfde veelhoek d naar binnen
// verschoven (elke rand evenwijdig naar binnen, de hoekpunten op de snijpunten); voor het schildvormige klimaatpaneel, de staande
// zijroosters en de poortplaat
function intRoundPoly(pts, r, n = 3) {
  const out = [], N = pts.length;
  pts.forEach((p, i) => {
    const a = pts[(i + N - 1) % N], b = pts[(i + 1) % N], la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const rr = Math.min(Array.isArray(r) ? r[i] : r, la / 2, lb / 2), s = [p[0] + (a[0] - p[0]) * rr / la, p[1] + (a[1] - p[1]) * rr / la], e = [p[0] + (b[0] - p[0]) * rr / lb, p[1] + (b[1] - p[1]) * rr / lb];
    for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; out.push([u * u * s[0] + 2 * u * t * p[0] + t * t * e[0], u * u * s[1] + 2 * u * t * p[1] + t * t * e[1]]); }
  });
  return out;
}
function intInset(pts, d) {
  const N = pts.length, L = pts.map((p, i) => { const q = pts[(i + 1) % N], tx = q[0] - p[0], ty = q[1] - p[1], l = Math.hypot(tx, ty); return [p[0] - d * ty / l, p[1] + d * tx / l, tx / l, ty / l]; });
  return L.map((l1, i) => { const l0 = L[(i + N - 1) % N], den = l0[2] * l1[3] - l0[3] * l1[2], t = ((l1[0] - l0[0]) * l1[3] - (l1[1] - l0[1]) * l1[2]) / den; return [l0[0] + l0[2] * t, l0[1] + l0[3] * t]; });
}
const intPolyPath = pts => new THREE.Path(pts.map(p => new THREE.Vector2(p[0], p[1])));
// vlak paneel over de knik van het voorvlak: kanteling langs de koorde van y0 (boven) tot y1 (onder) op afstand o0 en o1 voor de drager;
// het vlak schuift naar de bestuurder tot het het voorvlak op de knik (yk, ok) raakt. Geeft het midden (z, y) en de kanteling rx.
function intChord(y0, o0, y1, o1, yk, ok) {
  const T = intFace(y0, o0), B = intFace(y1, o1), K = intFace(yk, ok), rx = Math.atan2(T.z - B.z, T.y - B.y), nz = -Math.cos(rx), ny = Math.sin(rx);
  const mz = (T.z + B.z) / 2, my = (T.y + B.y) / 2, d = Math.max(0, (K.z - mz) * nz + (K.y - my) * ny);
  return { z: mz + d * nz, y: my + d * ny, rx, h: Math.hypot(T.z - B.z, T.y - B.y) };
}
// rok achter een vlak paneel van intChord (golf 5n reparatie): het vlak raakt het voorvlak alleen op de knik, boven en onder bleef een
// spleet tot 2,7 cm open. De rok loopt van de omtrek pts (x, y tegen de klok in, op diepte z0 in het kader c van het paneel) recht
// naar achteren tot het profiel Tp (z, y van boven naar onder) van het voorvlak, gap ervoor. Elke rand is gesneden op de knikken
// van Tp, zodat de achterrand van de rok per stuk precies in het vlak van het voorvlak ligt en er nergens doorheen steekt.
function intSkirt(pts, z0, Tp, c, gap = 0.0003) {
  const C = Math.cos(c.rx), S = Math.sin(c.rx), L = Tp.map(([Z, Y]) => [(Y - c.y) * C + (Z - c.z) * S, (Z - c.z) * C - (Y - c.y) * S]);
  const zAt = y => { let i = 0; while (i < L.length - 2 && y < L[i + 1][0]) i++; const a = L[i], b = L[i + 1];
    return Math.max(z0, lerp(a[1], b[1], (y - a[0]) / (b[0] - a[0])) - gap); };
  const P = [];
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; P.push(p);
    L.slice(1, -1).map(([ky]) => (ky - p[1]) / (q[1] - p[1])).filter(t => t > 0 && t < 1).sort((a, b) => a - b)
      .forEach(t => P.push([lerp(p[0], q[0], t), lerp(p[1], q[1], t)])); });
  const pos = [];
  P.forEach((a, i) => { const b = P[(i + 1) % P.length], za = zAt(a[1]), zb = zAt(b[1]);
    pos.push(a[0], a[1], z0, b[0], b[1], z0, b[0], b[1], zb, a[0], a[1], z0, b[0], b[1], zb, a[0], a[1], za); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return g;
}
function intDashboard() {
  const bx = intBx, cy = intCy;
  // recht kistje voor binnendelen (golf 5n: een afronding van een paar millimeter is daar niet te zien en kost 288 driehoeken per kistje);
  // elke maat r kleiner dan het afgeronde kistje met straal r, zodat het rechte kistje er helemaal binnen valt
  const intBoxR = (w, h, d, r, p = [0, 0, 0], rot) => xf(G.box(w - r, h - r, d - r), p, rot);
  const skinPts = intOffset(intDashTopPts, intSkinT).concat(intOffset(intDashTopPts, -0.003).reverse());
  // middenpaneel onder de roosters (van de knik op y 0,84 tot y 0,63), 1,8 cm voor het voorvlak
  const midPts = [[0.47, 0.84], [0.48, 0.74], [intFace(0.63).z, 0.63]];
  const fasPts = intOffset(midPts, 0.018).concat(intOffset(midPts, 0).reverse());
  // buitenkant van de huid en van het middenpaneel: profielen voor de rokken achter klimaatpaneel en zijroosters (intSkirt)
  const skinO = intOffset(intDashTopPts, intSkinT), fasO = intOffset(midPts, 0.018);
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
  // voorvlak; zb is de achterkant in het kader van het rooster (golf 5n: de middelste staan op de huid, met een zwart huis en een
  // geribd stelwieltje aan de buitenkant; de buitenste staan rechtop, trapeziumvormig met de schuine kant naar binnen en het
  // wieltje onderaan, in een vlak over de knik van het voorvlak). o: w, h, wt (breedte boven), sl (kant van de schuine rand),
  // f (plaats en kanteling), mat (huis), wiel ('zij' met ws de buitenkant, of 'onder')
  // de achterwand (Roosterkanaal) past in de opening van het huis, 0,5 mm vrij van de binnenrand, en ligt achter het stelwieltje
  const ventGroup = (name, d, o) => { const { w, h, zb } = o, wt = o.wt || w, D = 0.016, zr = zb - 0.0005 - D / 2, dw = w - wt;
    const out = [[o.sl > 0 ? w / 2 - dw : w / 2, h / 2], [o.sl < 0 ? -w / 2 + dw : -w / 2, h / 2], [-w / 2, -h / 2], [w / 2, -h / 2]];
    const rim = o.rim || 0.008, inn = intInset(out, rim), ring = shapeOf(intRoundPoly(out, 0.012)); ring.holes.push(intPolyPath(intRoundPoly(inn, 0.006)));
    // binnenmaat op hoogte y: linker- en rechterrand van de binnenrand (rechte stukken, lineair tussen onder en boven)
    const yb = inn[2][1], yt = inn[0][1], edge = (y, a, b) => lerp(inn[a][0], inn[b][0], (y - yb) / (yt - yb)), xl = y => edge(y, 2, 1), xr = y => edge(y, 3, 0);
    const wheelSide = o.wiel === 'zij' ? 0.014 : 0, y0 = yb + (o.wiel === 'onder' ? 0.02 : 0.005), y1 = yt - 0.005, n = Math.max(2, Math.round((y1 - y0) / 0.011)), lam = [];
    for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i + 0.5) / n, a = xl(y) + 0.0015 + (o.ws < 0 ? wheelSide : 0), b = xr(y) - 0.0015 - (o.ws > 0 ? wheelSide : 0); lam.push([y, (a + b) / 2, b - a]); }
    const mid = lam[Math.floor(n / 2)], wheel = o.wiel === 'zij' ? xf(G.cyl('x', 0.0075, 0.0075, 0.006, 10), [o.ws * ((o.ws > 0 ? xr(0) : -xl(0)) - 0.0085), 0, zr])
      : o.wiel === 'onder' ? xf(G.cyl('y', 0.0075, 0.0075, 0.006, 10), [(xl(yb + 0.01) + xr(yb + 0.01)) / 2, yb + 0.0095, zr]) : null;
    return A(name, { d, p: o.f.p, r: o.f.r, ex: [0, 0.03, -0.1] }, [
      intPart('Roosterkanaal', merge([xf(front(shapeOf(intRoundPoly(intInset(out, rim + 0.0005), 0.0055)), 0.0008), [0, 0, zb - 0.0005])].concat(o.rok ? [intSkirt(intRoundPoly(out, 0.012), zr + D / 2, o.rok, o.c)] : [])), MAT.plastic, o.rok ? 'Donkere achterwand in het rooster, het einde van het luchtkanaal waar de lucht uit komt, en de donkere zijwanden van het huis van de omlijsting tot het dashboard.' : 'Donkere achterwand in het rooster: het einde van het luchtkanaal waar de lucht uit komt.', { ex: [0, 0, 0.02] }),
      intPart('Roosterhuis', xf(front(ring, D), [0, 0, zr]), o.mat, o.mat === MAT.satin ? 'Holle omlijsting van het luchtrooster in satijnchroom; de lamellen zitten erbinnen.' : 'Holle omlijsting van het luchtrooster in zwart kunststof, zonder chromen rand; de lamellen zitten erbinnen.', { ex: [0, 0.02, -0.04] }),
      intPart('Lamellen', merge(lam.map(([y, x, b]) => xf(G.box(b, 0.0022, 0.010), [x, y, zr]))), MAT.plastic, 'Verstelbare horizontale lamellen in het huis die de luchtstroom richten.', { ex: [0, 0, -0.06] }),
      intPart('Roosterknop', merge([xf(G.box(0.018, 0.0065, 0.006), [0, mid[0], zr - 0.0083])].concat(wheel ? [wheel] : [])), MAT.satin, 'Schuifje op een lamel waarmee de richting van de luchtstroom wordt ingesteld, met het geribde stelwieltje waarmee het rooster wordt geopend en gesloten.', { ex: [0, 0, -0.09] }),
    ]); };
  // zijroosters (golf 5n reparatieronde 2, tweede ronde, foto's van de eigenaar): verzonken in het voorvlak, onder de doorlopende
  // dashboardhuid. Rooster 8,75 cm breed (boven 6,6 cm, schuine kant naar binnen), 14 cm hoog, met een satijnchromen rand van 1 cm
  // en het stelwieltje onderin binnen de rand. Bovenkant omlijsting op y 0,905, 1,7 cm onder de knik van de huid. Het vlak loopt
  // van het voorvlak op de bovenkant naar het voorvlak op de onderkant (over de knik op y 0,84) en ligt 1,5 cm daarachter; daarvoor
  // is een uitsparing uit drager en huid gesneden (x 0,572 tot 0,668, 4 mm rond de omlijsting): boven de uitsparing lopen huid en
  // drager ongewijzigd door, de bodem ligt 0,6 mm achter de omlijsting. Een inzetstuk (Roostersokkel, 1 cm dik) vult de bodem rond
  // de omlijsting. Het rooster en het inzetstuk draaien 0,01 rad in hun vlak (binnenkant hoger): zo ligt het hoogste punt van elk
  // roosterdeel aan de binnenkant. Recht erboven, op x 0,63 tot 0,66, valt een straal van boven tussen voorruitglas en voorruitrubber
  // door tot de bodemplaat (spleet in de carrosserie), en daar meldt integrity.py dan een doorsteek.
  const sideVent = (() => { const w = 0.0875, wt = 0.066, h = 0.14, rim = 0.01, x = 0.62, yTop = 0.905, back = 0.015, D = 0.017, Wn = w + 0.008;
    const G = intOffset(intDashTopPts, intSkinT), F = intDashPf;
    const faceZ = y => y >= G[4][1] ? lerp(G[3][0], G[4][0], (G[3][1] - y) / (G[3][1] - G[4][1])) : lerp(F[4][0], F[5][0], (F[4][1] - y) / (F[4][1] - F[5][1]));
    let C = 1, S = 0, rx = 0;
    for (let i = 0; i < 3; i++) { const yb = yTop - h * C; rx = Math.atan2(faceZ(yTop) - faceZ(yb), h * C); C = Math.cos(rx); S = Math.sin(rx); }
    const yb = yTop - h * C, zc = (faceZ(yTop) + faceZ(yb)) / 2 + back * C, yc = (yTop + yb) / 2 - back * S;
    const yT = yc + h / 2 * C + D * S + 0.004, yB = yc - h / 2 * C - 0.004;
    // drager of huid (zijprofiel z, y) zonder de uitsparing: boven yT, onder yB en achter de bodem (lokaal z 0,6 mm)
    const cut = poly => [clipPoly(poly, 0, -1, -yT), clipPoly(poly, 0, 1, yB), clipPoly(clipPoly(clipPoly(poly, 0, 1, yT), 0, -1, -yB), -C, S, -0.0006 + S * yc - C * zc)];
    const outline = s => { const dw = w - wt; return [[s < 0 ? w / 2 - dw : w / 2, h / 2], [s > 0 ? -w / 2 + dw : -w / 2, h / 2], [-w / 2, -h / 2], [w / 2, -h / 2]]; };
    const plate = s => cache(`intVentPlate5n${s}`, () => { const hw = Wn / 2 - 0.0012, y0 = (yB - yc) / C + 0.0015, y1 = (yT - yc) / C - 0.003;
      const sh = shapeOf([[hw, y0], [hw, y1], [-hw, y1], [-hw, y0]]); sh.holes.push(intPolyPath(intRoundPoly(intInset(outline(s), -0.0004), 0.012)));
      return xf(front(sh, 0.0103), [0, 0, -0.00485]); });
    return { w, wt, h, rim, rx, x, y: yc, z: zc, n0: x - Wn / 2, n1: x + Wn / 2, cut, plate }; })();
  // drager of huid als zijblokken van x0 tot x1, met de uitsparing voor de zijroosters waar het blok daar overheen loopt
  const intVentBlocks = (poly, x0, x1) => { const out = [], N = [[-sideVent.n1, -sideVent.n0], [sideVent.n0, sideVent.n1]].filter(([a, b]) => a >= x0 - 1e-9 && b <= x1 + 1e-9);
    let x = x0; for (const [a, b] of N) { out.push(intSideBlock(poly, x, a), ...sideVent.cut(poly).map(p => intSideBlock(p, a, b))); x = b; }
    out.push(intSideBlock(poly, x, x1)); return out; };
  // instrumentenpaneel: de wijzerplaatdrager staat 0,25 rad achterover, naar het oog van de bestuurder [0,37; 1,12; -0,30], in een kap op de
  // dashboardkop. Zichtlijn (golf 5l, gemeten): boven het airbagdeksel langs en onder de bovenrand van de krans door; alle delen in dit kader
  const clC = [0.372, 0.98, 0.545], cl = o => Object.assign({ p: clC, r: [0.25, 0, 0] }, o), clW = 0.314;
  const dialPos = { tach: [0.075, 0.006, 0.046], speedo: [-0.075, 0.006, 0.046], temp: [0.024, -0.03, 0.0135], fuel: [-0.024, -0.03, 0.0135] };
  const dialDecal = key => { const [x, y, r] = dialPos[key]; return xf(intDecal(2 * r, 2 * r, intTexR[key]), [x, y, -0.0035]); };
  const needle = (key, a) => { const [x, y, r] = dialPos[key], L = r * 0.85, o = L / 2 - r * 0.12; return xf(G.box(r > 0.02 ? 0.0024 : 0.0016, L, 0.0012), [x + Math.cos(a) * o, y + Math.sin(a) * o, -0.0068], [0, 0, a - HALF]); };
  const cluster = A('Instrumentenpaneel', { d: 'Instrumentenpaneel in een kap op de dashboardkop: links de toerenteller en rechts de snelheidsmeter, elk met een chromen ring, daartussen een blauw kleurendisplay en eronder twee kleine meters voor temperatuur en brandstof; rood-witte wijzers. De wijzerplaatdrager staat schuin naar het oog van de bestuurder en is boven de naaf van het stuur door de krans te zien (schaalindeling en maten geschat naar de foto\'s).', ex: [0, 0.04, -0.14] }, [
    intPart('Instrumentenbehuizing', xf(G.box(clW, 0.11, 0.006), [0, 0.004, 0]), MAT.dash, 'Zwarte drager van de wijzerplaten met de printplaat erachter.', cl({ ex: [0, 0, 0.06] })),
    intPart('Toerenteller', dialDecal('tach'), MAT.intDecal, 'Toerenteller links: wijzerplaat met schaalstreepjes en cijfers van 0 tot 7 x 1000 per minuut, rood gebied vanaf 6500 (naar de foto van de eigenaar).', cl({ ex: [0.02, 0, -0.03] })),
    intPart('Snelheidsmeter', dialDecal('speedo'), MAT.intDecal, 'Snelheidsmeter rechts: wijzerplaat met schaalstreepjes en cijfers in km/h (indeling geschat).', cl({ ex: [-0.02, 0, -0.03] })),
    intPart('Temperatuurmeter', dialDecal('temp'), MAT.intDecal, 'Kleine meter voor de koelvloeistoftemperatuur, onder het LCD aan de linkerkant.', cl({ ex: [0.01, -0.02, -0.03] })),
    intPart('Brandstofmeter', dialDecal('fuel'), MAT.intDecal, 'Kleine meter voor de brandstofvoorraad, onder het LCD aan de rechterkant.', cl({ ex: [-0.01, -0.02, -0.03] })),
    intPart('Informatiedisplay', xf(intDecal(0.044, 0.046, intTexR.lcd), [0, 0.024, -0.0035]), MAT.intDecal, 'Bijna vierkant kleurendisplay met blauwe achtergrond tussen de grote wijzerplaten, van halverwege de meters tot boven de kleine meters: boordcomputer, kilometerteller en de stand van de automaat (naar de foto van de eigenaar).', cl({ ex: [0, 0.02, -0.05] })),
    intPart('Sierringen', merge(Object.values(dialPos).map(([x, y, r]) => xf(G.torus('z', r + 0.001, r > 0.02 ? 0.0022 : 0.0014, r > 0.02 ? 48 : 24, 6), [x, y, -0.0058]))), MAT.chrome, 'Chromen ringen om de vier wijzerplaten.', cl({ ex: [0, 0, -0.06] })),
    intPart('Wijzers', merge([needle('tach', -PI / 4), needle('speedo', -PI / 4), needle('temp', PI / 6), needle('fuel', 2 * PI / 3)]), MAT.red, 'Rode wijzers van de vier meters (in de ruststand).', cl({ ex: [0, 0, -0.08] })),
    intPart('Wijzernaven', merge(Object.values(dialPos).map(([x, y, r]) => xf(G.cyl('z', r > 0.02 ? 0.0055 : 0.003, r > 0.02 ? 0.0055 : 0.003, 0.003, 12), [x, y, -0.0085]))), MAT.ceramic, 'Witte kapjes over de assen van de wijzers.', cl({ ex: [0, 0, -0.1] })),
    intPart('Instrumentenglas', xf(G.box(0.31, 0.108, 0.002), [0, 0.004, -0.0115]), MAT.lensClear, 'Doorzichtig kapglas voor de instrumenten.', cl({ ex: [0, 0, -0.14] })),
    intPart('Instrumentenkap', intHood(0.372, 0.344, [[0.493, 1.049], [0.53, 1.058], [0.58, 1.061], [0.635, 1.048], [0.685, 1.008], [0.722, Sk(0.722)]],
      [[0.708, Sk(0.708)], [0.673, 0.999], [0.627, 1.038], [0.58, 1.05], [0.535, 1.047], [0.497, 1.04]], 0.524), MAT.dash, 'Kap over de instrumenten tegen reflecties in de voorruit; loopt met twee wangen over in de dashboardkop.', { ex: [0, 0.08, -0.03] }),
  ]);
  // navigatiescherm en sierband (golf 5n, foto van de eigenaar): een doorlopende wenkbrauw van de dashboardkop loopt van de
  // instrumentenkap tot het zijrooster aan passagierszijde; eronder staan, verzonken in een nis boven de huid, het scherm in een
  // zwarte lijst en de pianozwarte sierband. De bovenrand van lijst en band ligt net onder de wenkbrauw, zodat de holte erachter
  // (met de airbagklep) dicht is. Scherm en band staan 0,25 rad achterover, de onderrand vrij van de huid. De wenkbrauw loopt flauw
  // af tot vlak voor de ontwasemsleuf, zodat de bovenkant aan passagierszijde een doorlopend vlak is en geen opgezette plank.
  const nvC = [0.585, 0.984], nvR = 0.25, nv = o => Object.assign({ p: [0.043, nvC[1], nvC[0]], r: [nvR, 0, 0] }, o);
  const nav = A('Navigatiescherm', { d: 'Scherm van de Carminat TomTom Live-navigatie, diep verzonken onder de doorlopende wenkbrauw van de dashboardkop boven de middelste roosters; bediening met de joystick op de middenconsole.', spec: [['Schermdiagonaal', '14 cm']], ex: [0, 0.16, -0.06] }, [
    intPart('Schermbehuizing', G.box(0.286, 0.074, 0.008), MAT.plastic, 'Zwarte lijst rond het scherm, de achterwand van de nis onder de wenkbrauw van de instrumentenkap tot de sierband.', nv({ ex: [0, 0.03, 0.03] })),
    intPart('Schermglas', xf(intDecal(0.122, 0.069, intTexR.nav), [-0.043, 0, -0.0045]), MAT.intDecal, 'Beeldscherm van de navigatie (kaartbeeld schematisch).', nv({ ex: [0, 0.02, -0.08] })),
    intPart('Schermkap', intHood(-0.19, 0.778, [[0.546, 1.016], [0.553, 1.028], [0.6, 1.037], [0.68, 1.03], [0.78, 1.008], [0.88, 0.981], [0.94, Sk(0.94)]],
      [[0.915, Sk(0.915)], [0.86, 0.973], [0.77, 0.996], [0.68, 1.017], [0.6, 1.024], [0.565, 1.021], [0.55, 1.014]], 0.55), MAT.dash, 'Doorlopende wenkbrauw van de gestikte dashboardkop van de instrumentenkap tot het zijrooster aan passagierszijde; het scherm en de sierband zitten er verzonken onder.', { ex: [0, 0.1, 0] }),
  ]);
  // sierband: pianozwart, licht taps van de schermlijst naar het zijrooster, in hetzelfde vlak als de schermlijst
  const band = intPart('Sierband dashboard', front(shapeOf([[-0.1005, -0.039], [-0.1005, 0.037], [-0.566, 0.037], [-0.566, -0.026]]), 0.004), MAT.intPiano, 'Hoogglans pianozwarte, licht tapse sierband onder de wenkbrauw van de dashboardkop, op schermhoogte van de navigatienis tot tegen het zijrooster aan passagierszijde (foto van de eigenaar).', { p: [0, nvC[1], nvC[0]], r: [nvR, 0, 0], ex: [0, 0.02, -0.08] });
  // klimaatbediening: schildvormig paneel (boven breed, onder smaller, afgeronde onderhoeken) met een dikke satijnen omlijsting tussen
  // de middelste roosters, van de bovenrand van de roosters tot onder de knik van het voorvlak; vlak over de knik (intChord)
  const climate = (() => { const c = intChord(0.905, intSkinT, 0.792, 0.018, 0.84, 0.0185), W = intClimW, H = intClimH, Wb = intClimWb;
    const S = [[W / 2, H / 2], [-W / 2, H / 2], [-Wb / 2, -H / 2], [Wb / 2, -H / 2]], rr = [0.01, 0.01, 0.028, 0.028];
    const ring = shapeOf(intRoundPoly(S, rr)); ring.holes.push(intPolyPath(intRoundPoly(intInset(S, 0.0075), rr.map(r => r - 0.0065))));
    return A('Klimaatbediening', { d: 'Bediening van de automatische tweezone-klimaatregeling als groot schildvormig paneel tussen de middelste roosters, met een dikke omlijsting in satijnchroom: de toetsen SOFT, AUTO en FAST, het display, de temperatuurtuimelaars, airco, ventilator, luchtverdeling en recirculatie (indeling naar de foto van de eigenaar, opschriften schematisch).', p: [0, c.y, c.z], r: [c.rx, 0, 0], ex: [0, -0.02, -0.14] }, [
    intPart('Klimaatpaneel', merge([xf(front(shapeOf(intRoundPoly(S, rr)), 0.016), [0, 0, -0.008]), intSkirt(intRoundPoly(S, rr), 0, [skinO[3], skinO[4], fasO[0], fasO[1]], c)]), MAT.dash, 'Schildvormig paneel met de bediening van de klimaatregeling; de rand loopt naar achteren door tot tegen het voorvlak.', { ex: [0, 0, -0.02] }),
    intPart('Klimaatomlijsting', xf(front(ring, 0.004), [0, 0, -0.018]), MAT.satin, 'Dikke omlijsting in satijnchroom rond het klimaatpaneel.', { ex: [0, 0, -0.05] }),
    intPart('Klimaatdisplay', xf(intDecal(0.09, 0.02, intTexR.climDisp), [0, H / 2 - 0.035, -0.0163]), MAT.intDecal, 'Display met de ingestelde temperaturen en de stand.', { ex: [0, 0, -0.06] }),
    intPart('Klimaattoetsen', intKeys(intClimKeys, W, H, 0.003, -0.0175), MAT.plastic, 'Toetsen voor SOFT, AUTO en FAST, temperatuur links en rechts, airco, ventilator, luchtverdeling en recirculatie.', { ex: [0, 0, -0.07] }),
    intPart('Opschriften klimaat', xf(intDecal(W, H, intTexR.clim), [0, 0, -0.0193]), MAT.intDecal, 'Opschriften op de toetsen van de klimaatbediening.', { ex: [0, 0, -0.09] }),
  ]); })();
  // toetsenrij onder de klimaatbediening: alarmlicht, ontwaseming en stoelverwarming (u loopt van x 0,09 naar x -0,09)
  const rowF = intFace(0.779, 0), row = o => Object.assign({ p: [0.09 - intHazW / 2, rowF.y, rowF.z], r: [rowF.rx, 0, 0] }, o);
  const rowKeys = (a, b) => intKeys(intHazKeys.slice(a, b), intHazW, intHazH, 0.006, -0.0215);
  const hazard = intPart('Alarmlichtschakelaar', rowKeys(0, 1), MAT.red, 'Schakelaar voor de alarmknipperlichten, in de toetsenrij onder de klimaatbediening.', row({ ex: [0, 0.03, -0.1] }));
  const rowDef = intPart('Ontwasemtoetsen', rowKeys(1, 3), MAT.plastic, 'Toetsen voor het ontwasemen van de voorruit en de achterruit.', row({ ex: [0, 0.02, -0.1] }));
  const rowSeat = intPart('Stoelverwarmingstoetsen', rowKeys(3, 5), MAT.plastic, 'Toetsen van de stoelverwarming voor bestuurder en passagier (plaats aannemelijk).', row({ ex: [-0.02, 0.02, -0.1] }));
  const rowTxt = intPart('Opschriften toetsenrij', xf(intDecal(intHazW, intHazH, intTexR.hazRow), [0, 0, -0.025]), MAT.intDecal, 'Symbolen op de toetsen onder de klimaatbediening.', row({ ex: [0, 0.03, -0.12] }));
  // radio onderaan het middenpaneel: zes voorkeuzetoetsen, cd-sleuf en een ronde volumeknop op een chromen boog
  const audio = (() => { const f = intFace(0.734, 0), W = intRadW, H = intRadH, yb = H / 2 - 0.049; return A('Audiobediening', { d: 'Radio met cd-speler van de Carminat onderaan het middenpaneel: een rij met zes voorkeuzetoetsen, de cd-sleuf en een chromen boog met toetsen en een ronde volumeknop. Bose-geluidssysteem met tien luidsprekers, waarvan er negen zijn weergegeven (drie in het dashboard, twee op de achterplank, vier in de portieren); de tiende is niet getoond.', p: [0, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }, [
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
    intPart('Roostermiddenluidspreker', G.rbox(0.12, 0.004, 0.1, 0.002), MAT.plastic, 'Rooster boven de middenluidspreker, op de wenkbrauw van de dashboardkop.', { p: [0, 0.9973, 0.83], r: [0.264, 0, 0], ex: [0, 0.08, 0] }),
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
    intPart('Handschoenenkastbak', gTray(), MAT.plastic, 'Open bak in zwart kunststof achter de klep met bodem, zijwanden en achterwand; gekoeld met lucht uit de airco (schematisch).', { ex: [0, 0, 0.06] }),
    intPart('Handschoenenkastdemper', xf(G.cyl('x', 0.007, 0.007, 0.05, 8), [0.15, -0.068, 0.02]), MAT.darkSteel, 'Draaidemper op de scharnieras die de klep gecontroleerd laat zakken.', { inner: true, ex: [0, -0.06, 0.04] }),
  ]);
  // golf 5n: van buiten is de bovenkant aan passagierszijde glad en naadloos (foto van de eigenaar); de klep zit verborgen onder de
  // wenkbrauw van de dashboardkop en is alleen in de uitklapweergave te zien
  const airbag = A('Passagiersairbag', { d: 'Airbag aan passagierszijde, uit te schakelen met de sleutelschakelaar, achter een onzichtbare klep in de bovenkant van het dashboard; van buiten is de dashboardkop glad en naadloos.', p: [-0.38, 0, 0.7], ex: [0, 0.22, 0] }, [
    intPart('Airbagklep', G.rbox(0.3, 0.008, 0.2, 0.003), MAT.dash, 'Klep met verborgen scheurnaad onder de gladde huid van de dashboardkop, die bij ontsteking openklapt; van buiten niet te zien.', { p: [0, intDashTop(0.7) - 0.0015, 0], ex: [0, 0.1, 0] }),
    intPart('Airbagbehuizing', G.rbox(0.28, 0.1, 0.18, 0.012), MAT.plastic, 'Behuizing van de airbagmodule.', { p: [0, 0.89, 0], inner: true, ex: [0, 0.04, 0] }),
    intPart('Airbaggasgenerator', xf(G.cyl('x', 0.025, 0.025, 0.24, 14), [0, 0.88, 0.0]), MAT.darkSteel, 'Gasgenerator die de airbag vult.', { inner: true, ex: [0, -0.02, 0.06] }),
    intPart('Airbagkussen', G.rbox(0.22, 0.04, 0.14, 0.012), MAT.fabric, 'Opgevouwen kussen van de passagiersairbag; bij een botsing blaast de gasgenerator het op en breekt het door de klep.', { p: [0, 0.93, 0], inner: true, ex: [0, 0.06, 0] }),
  ]);
  const uch = (() => { const f = intFace(0.66, 0.008); return intPart('Onderpaneel bestuurder', G.rbox(0.36, 0.12, 0.014, 0.006), MAT.dash, 'Onderpaneel met afdekklep links van de stuurkolom onderin het dashboard (linkse besturing). Achter het paneel zitten de centrale cabine-unit (UCH) en de zekeringen; die horen bij het elektrische systeem.', { p: [0.37, f.y, f.z], r: [f.rx, 0, 0], ex: [0, -0.08, -0.14] }); })();
  const beam = A('Dwarsbalk dashboard', { d: 'Stalen dwarsbalk die stuurkolom, dashboard en klimaatunit draagt; zit in de carrosserie tussen de A-stijlen.', ex: [0, -0.1, -0.12], inner: true }, [
    intPart('Dwarsbalkbuis', xf(G.cyl('x', 0.03, 0.03, 1.44, 16), [0, 0.8, 0.72]), MAT.steel, 'Hoofdbuis van de dwarsbalk.', { ex: [0, 0, 0.04] }),
    intPart('Eindplaten dwarsbalk', merge([intBoxR(0.012, 0.2, 0.2, 0.004, [0.72, 0.78, 0.72]), intBoxR(0.012, 0.2, 0.2, 0.004, [-0.72, 0.78, 0.72])]), MAT.darkSteel, 'Platen waarmee de balk aan de A-stijlen vastzit.', { ex: [0, 0, 0.06] }),
    intPart('Kolombeugel', intBoxR(0.12, 0.2, 0.05, 0.008, [0.37, 0.76, 0.66]), MAT.darkSteel, 'Beugel waaraan de stuurkolom hangt.', { ex: [0.06, -0.06, -0.04] }),
    intPart('Middensteun', intBoxR(0.04, 0.23, 0.04, 0.008, [0, 0.675, 0.72]), MAT.darkSteel, 'Steun van de balk op de tunnel.', { ex: [0, -0.1, 0] }),
  ]);
  const hvac = A('Klimaatunit', { d: 'Klimaatunit onder het dashboard (opbouw zoals gebruikelijk bij een tweezone-unit; schematisch en compact, volledig binnen het dashboard): huis in twee helften met aanjager, verdamper, kachelradiateur, mengkleppen en filter.', p: [0, 0.66, 0.72], s: [0.7, 0.7, 0.7], ex: [0, -0.22, 0.05], inner: true }, [
    intPart('Kachelhuis boven', G.rbox(0.5, 0.14, 0.24, 0.02), MAT.plastic, 'Bovenste helft van het unithuis.', { p: [0, 0.075, 0], ex: [0, 0.12, 0] }),
    intPart('Kachelhuis onder', G.rbox(0.5, 0.14, 0.24, 0.02), MAT.plasticGrey, 'Onderste helft van het unithuis.', { p: [0, -0.075, 0], ex: [0, -0.1, 0] }),
    intPart('Verdamper', intBoxR(0.3, 0.16, 0.045, 0.004), MAT.alu, 'Verdamper van de airco: koelt en ontvochtigt de lucht.', { p: [0, 0, -0.06], ex: [0, 0, -0.1] }),
    intPart('Kachelradiateur', intBoxR(0.3, 0.16, 0.03, 0.004), MAT.heater, 'Warmtewisselaar die de lucht met koelvloeistof opwarmt.', { p: [0, 0, 0.0], ex: [0, 0, 0.03] }),
    intPart('Mengkleppen', merge([intBoxR(0.28, 0.005, 0.07, 0.002, [0, 0.05, 0.08], [0.5, 0, 0]), intBoxR(0.28, 0.005, 0.07, 0.002, [0, -0.05, 0.08], [-0.5, 0, 0])]), MAT.steel, 'Kleppen die warme en koude lucht mengen en over de uitstroomopeningen verdelen.', { ex: [0, 0, 0.1] }),
    intPart('Aanjagerhuis', G.cyl('x', 0.08, 0.08, 0.14, 24), MAT.plastic, 'Slakkenhuis van de aanjager aan passagierszijde.', { p: [-0.33, -0.03, 0], ex: [-0.12, 0, 0] }),
    intPart('Aanjagerwaaier', blades(18, 0.018, 0.066, 0.1, 0.004, 0.2, 'x'), MAT.steel, 'Schoepenwiel van de aanjager dat de lucht door het filter en de verdamper blaast.', { p: [-0.33, -0.03, 0], ex: [-0.2, 0, 0] }),
    intPart('Aanjagermotor', G.cyl('x', 0.03, 0.03, 0.08, 16), MAT.darkSteel, 'Elektromotor van de aanjager.', { p: [-0.42, -0.03, 0], ex: [-0.3, 0, 0] }),
    intPart('Servomotoren', merge([intBoxR(0.04, 0.03, 0.03, 0.006, [0.2, 0.1, -0.1]), intBoxR(0.04, 0.03, 0.03, 0.006, [0.2, -0.1, 0.1]), intBoxR(0.04, 0.03, 0.03, 0.006, [-0.2, 0.1, 0.1])]), MAT.plastic, 'Stelmotoren van de mengkleppen en de recirculatieklep (aantal geschat).', { ex: [0.1, 0, 0] }),
    intPart('Pollen- en koolstoffilter', G.rbox(0.26, 0.04, 0.12, 0.004), MAT.filter, 'Combinatiefilter tegen stuifmeel en geuren; het filter zit achter het handschoenenkastje.', { p: [-0.1, 0.12, -0.04], ex: [-0.1, 0.1, 0] }),
  ]);
  const harness = A('Kabelboom dashboard', { d: 'Kabelboom van het dashboard met connectorblokken (schematisch).', ex: [0, -0.1, -0.1] }, [
    intPart('Kabelboom', tube([[0.7, 0.74, 0.58], [0.35, 0.73, 0.6], [0, 0.72, 0.6], [-0.35, 0.73, 0.6], [-0.7, 0.74, 0.58]], 0.012, 32, 6), MAT.plastic, 'Hoofdkabelboom langs de dwarsbalk.', { ex: [0, -0.04, 0] }),
    intPart('Connectorblok bestuurderszijde', intBoxR(0.07, 0.04, 0.03, 0.006), MAT.plasticGrey, 'Stekkerblok naar de UCH en het instrumentenpaneel.', { p: [0.55, 0.74, 0.58], ex: [0.05, -0.04, 0] }),
    intPart('Connectorblok passagierszijde', intBoxR(0.07, 0.04, 0.03, 0.006), MAT.plasticGrey, 'Stekkerblok naar airbag en klimaatunit.', { p: [-0.55, 0.74, 0.58], ex: [-0.05, -0.04, 0] }),
  ]);
  const huid = intPart('Dashboardhuid', merge(intVentBlocks(skinPts, -0.75, 0.75)), MAT.dash, 'Gestikte (surpique) bovenkant van het dashboard over de draagstructuur.', { ex: [0, 0.14, 0.05] });
  const gCut = [...intVentBlocks(intDashPf, -0.75, -0.38 - gHx), ...intVentBlocks(intDashPf, -0.38 + gHx, 0.75),
    intSideBlock(clipPoly(intDashPf, -gS, -gC, -gHy - gK), -0.38 - gHx, -0.38 + gHx), intSideBlock(clipPoly(intDashPf, gS, gC, -gHy + gK), -0.38 - gHx, -0.38 + gHx),
    intSideBlock(clipPoly(clipPoly(clipPoly(intDashPf, gS, gC, gHy + gK), -gS, -gC, gHy - gK), -gC, gS, -gDp - gM), -0.38 - gHx, -0.38 + gHx)];
  const carrier = intPart('Dashboarddrager', merge(gCut), MAT.dash, 'Kunststof draagstructuur van het dashboard met het voorvlak; hier loopt de stuurkolom doorheen.', { ex: [0, 0.0, 0.1] });
  const fascia = intPart('Dashboardmiddenpaneel', side(shapeOf(fasPts), 0.30), MAT.dash, 'Middenpaneel onder de roosters met de toetsenrij, de kaartlezer, de radio en de bekerhouder.', { ex: [0, 0, -0.06] });
  const defrost = intPart('Ontwasemroosters', merge([xf(G.box(0.9, 0.004, 0.035), [0, intDashTop(0.97) + 0.0005, 0.97]), xf(G.box(0.08, 0.004, 0.05), [0.7, intDashTop(0.9) + 0.0005, 0.92]), xf(G.box(0.08, 0.004, 0.05), [-0.7, intDashTop(0.9) + 0.0005, 0.92])]), MAT.plastic, 'Sleuven die lucht tegen de voorruit en de zijruiten blazen.', { ex: [0, 0.1, 0] });
  const caps = [1, -1].map(s => intPart(`Dashboardeindkap ${sideName(s)}`, G.rbox(0.012, 0.3, 0.38, 0.004), MAT.plasticGrey, 'Kap op het uiteinde van het dashboard naast de portier.', { p: [s * 0.757, 0.8, 0.78], ex: [s * 0.14, 0, 0] }));
  // kaartsleuf (horizontaal, direct onder het linker middenluchtrooster) en startknop (links daarvan, aan de linkerrand van het middenpaneel naast het stuur): Notice NU 936-5, blz. 1.42-1.43, item 22; linksgestuurd, bestuurder aan +x; maten geschat
  const kaart = (() => { const f = intFace(0.8315, 0.024); return intPart('Kaartlezer', G.rbox(0.085, 0.012, 0.012, 0.004), MAT.plastic, 'Sleuf voor de handsfree Renault-kaart, horizontaal direct onder het linker middenluchtrooster (plaats bevestigd met de gebruiksaanwijzing NU 936-5, blz. 1.42-1.43, item 22; de maten zijn geschat).', { p: [0.108, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }); })();
  const start = (() => { const f = intFace(0.78, 0.006); return intPart('Startknop', G.cyl('z', 0.015, 0.015, 0.012, 20), MAT.chrome, 'Ronde start-/stopknop van de motor, links van de kaartsleuf aan de linkerrand van het middenpaneel naast het stuur, op de hoogte van de toetsenrij onder de klimaatbediening (plaats volgens de gebruiksaanwijzing NU 936-5, blz. 1.42-1.43, item 22; de maten zijn geschat).', { p: [0.185, f.y, f.z], r: [f.rx, 0, 0], ex: [0, 0, -0.12] }); })();
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
    intPart('Afdekking voetruimte passagier', footPlate(-0.742, -0.135, []), MAT.dash, 'Afdekking onder het dashboard aan passagierszijde, schuin van de onderrand naar voren met een voetwand voor het schutbord; dekt de klimaatunit van onderen af.', { ex: [0, -0.1, 0.06] }),
    kick(1), kick(-1),
  ]);
  return A('Dashboard', { d: 'Zwart dashboard met instrumentenpaneel onder een kap, verzonken navigatiescherm, pianozwarte sierband, klimaat- en audiobediening, kaartlezer en startknop, luchtroosters, handschoenenkastje, passagiersairbag, onderdashboard, klimaatunit en dwarsbalk.', ex: [0, 0.16, 0.6] }, [
    A('Dashboardschil', { d: 'Draagstructuur en zichtbare bekleding van het dashboard: drager, gestikte huid, middenpaneel, pianozwarte sierband onder de wenkbrauw, eindkappen en de ontwasemsleuven.', ex: [0, 0.3, 0.3] }, [carrier, huid, fascia, band, ...caps, defrost]),
    A('Luchtroosters', { d: 'Vier verstelbare luchtroosters, elk een hol huis met lamellen erin: twee in het midden (circa 14 bij 7 cm, zwart met een stelwieltje aan de buitenkant) en twee staande, trapeziumvormige zijroosters verzonken in het voorvlak (circa 8,75 bij 14 cm, brede satijnchromen rand met het wieltje onderin).', ex: [0, 0.04, -0.06] }, [
      ...[1, -1].map(s => { const f = intFace(0.872, 0); return ventGroup(`Luchtrooster midden ${sideName(s)}`, s > 0 ? 'Verstelbaar middenrooster aan bestuurderszijde.' : 'Verstelbaar middenrooster aan passagierszijde.', { w: 0.14, h: 0.07, zb: -(intSkinT + 0.0005), f: { p: [s * 0.15, f.y, f.z], r: [f.rx, 0, 0] }, mat: MAT.plastic, wiel: 'zij', ws: s }); }),
      ...[1, -1].map(s => ventGroup(`Luchtrooster zij ${sideName(s)}`, s > 0 ? 'Verstelbaar zijrooster aan bestuurderszijde, richt de lucht op de zijruit of het gezicht.' : 'Verstelbaar zijrooster aan passagierszijde.', { w: sideVent.w, wt: sideVent.wt, sl: -s, h: sideVent.h, rim: sideVent.rim, zb: -0.0005, f: { p: [s * sideVent.x, sideVent.y, sideVent.z], r: [sideVent.rx, 0, -s * 0.01] }, mat: MAT.satin, wiel: 'onder' })),
      ...[1, -1].map(s => intPart(`Roostersokkel ${sideName(s)}`, sideVent.plate(s), MAT.dash, 'Inzetstuk in de uitsparing van het voorvlak rond het zijrooster: het rooster zit verzonken in het dashboard, onder de doorlopende huid (vorm geschat naar de foto\'s van de eigenaar).', { p: [s * sideVent.x, sideVent.y, sideVent.z], r: [sideVent.rx, 0, -s * 0.01], ex: [0, 0.02, -0.06] })),
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
  // keuzehendel (golf 5n reparatieronde 2, foto van de eigenaar): een grote, naar boven uitlopende knop op de zilveren stang (13 mm)
  // met een zilveren kraag (29 mm, y 0,043 tot 0,058). De knop (y 0,059 tot 0,156) is van zwart leder met een kap van geborsteld
  // aluminium over de bovenkant en de achterkant naar de bestuurder; de naad loopt schuin, achter op y 0,082 en voor op y 0,130.
  // Doorsnede licht ovaal (dwars 0,92 van de lengte), van 31 mm onderaan tot 56 mm bij de schouder. Maten geschaald op de stang.
  // Leder en kap zijn twee lofts die aan weerszijden van de naad 0,3 mm wijken, zodat ze elkaar niet doordringen.
  const kProf = [[0.059, 0.0155], [0.075, 0.017], [0.095, 0.0205], [0.112, 0.0245], [0.126, 0.0271], [0.137, 0.028], [0.145, 0.0268], [0.151, 0.0232], [0.1545, 0.016], [0.156, 0.006]];
  const kR = y => { let i = 0; while (i < kProf.length - 2 && y > kProf[i + 1][0]) i++; const a = kProf[i], b = kProf[i + 1]; return lerp(a[1], b[1], Math.min(1, Math.max(0, (y - a[0]) / (b[0] - a[0])))); };
  const kCut = th => 0.106 - 0.024 * Math.cos(th), kN = 24;
  const kLoft = (y0, y1, ts) => intLoft(ts.map(t => Array.from({ length: kN }, (_, j) => { const th = 2 * PI * j / kN, y = lerp(y0(th), y1(th), t), r = kR(y);
    return [0.92 * r * Math.sin(th), y, -r * Math.cos(th)]; })));
  const knobLeather = cache('intKnobLeather5n', () => kLoft(() => 0.059, th => kCut(th) - 0.0003, [0, 0.25, 0.5, 0.75, 1]));
  const knobCap = cache('intKnobCap5n', () => kLoft(th => kCut(th) + 0.0003, () => 0.156, [0, 0.3, 0.55, 0.72, 0.84, 0.92, 0.97, 1]));
  const collar = G.lathe('y', [[0.006, 0.043], [0.0138, 0.043], [0.0145, 0.045], [0.0145, 0.056], [0.0138, 0.058], [0.006, 0.058]], 16, 'intKnobCollar5n');
  // poortplaat: glanzend zilveren, afgeronde trapeziumplaat (voor 12 cm, achter 10 cm breed) met een brede getrapte opening: de hendel
  // staat aan de bestuurderskant, de opening wordt naar achteren breder naar de passagierskant; P R N D als lampjes aan de bestuurderszijde
  const gate = cache('intGatePlate5n', () => { const sh = shapeOf(intRoundPoly([[0.05, -0.1], [0.06, 0.1], [-0.06, 0.1], [-0.05, -0.1]], 0.02));
    sh.holes.push(intPolyPath(intRoundPoly([[0.012, -0.058], [0.012, 0.03], [-0.02, 0.03], [-0.02, -0.005], [-0.036, -0.012], [-0.036, -0.058]], 0.004, 2))); return plan(sh, 0.004); });
  const joyPad = cache('intJoyPad', () => plan(shapeOf(rrectPts(intJoyW, intJoyW, 0.016)), 0.004));
  const stick = G.lathe('y', [[0, 0], [0.017, 0], [0.019, 0.012], [0.012, 0.024], [0, 0.026]], 16, 'intStick');
  const sel = A('Keuzehendelmodule', { d: 'Keuzehendel van de automaat met poort P-R-N-D, ontgrendelknop op de hendel (rempedaal nodig) en een handmatige stand door de hendel naar links te duwen; de standindicatie staat in het instrumentenpaneel.', p: [0, 0.495, 0.2], ex: [0, 0.18, 0] }, [
    intPart('Standaanduiding', gate, MAT.chrome, 'Glanzend zilveren poortplaat in een afgeronde trapeziumvorm met een brede, getrapte opening voor de hendel.', { p: [0, -0.003, 0], ex: [0, 0.04, 0] }),
    intPart('Opschrift keuzepoort', xf(intDecal(0.06, 0.12, intTexR.gate, true), [0.038, -0.0005, 0]), MAT.intDecal, 'Standen P, R, N en D als ronde lampjes langs de opening aan de bestuurderszijde, met de handmatige stand (+ en -) erachter.', { ex: [0, 0.06, 0] }),
    intPart('Keuzehendelhoes', knobLeather, MAT.intBlackLeather, 'Grote knop van zwart leder die naar boven breder wordt, de zijkanten en de voorkant van de keuzehendel; de stang zelf is zilver en heeft geen hoes (foto van de eigenaar).', { ex: [0, 0.16, 0] }),
    intPart('Keuzehendel', merge([xf(G.cyl('y', 0.0065, 0.0065, 0.046, 10), [0, 0.023, 0]), collar, knobCap]), MAT.satin, 'Hendel met een zilveren stang, een zilveren kraag onder de knop en een kap van geborsteld aluminium over de bovenkant en de achterkant van de knop, waarmee de stand van de automaat wordt gekozen.', { ex: [0, 0.16, 0] }),
    intPart('Ontgrendelknop hendel', xf(G.cyl('z', 0.006, 0.006, 0.008, 10), [0, 0.093, -kR(0.093) - 0.0034]), MAT.chrome, 'Drukknop in de aluminium kap aan de achterkant van de knop, vlak boven het leder, die de hendel uit de parkeerstand vrijgeeft.', { ex: [0, 0.18, -0.06] }),
    intPart('Keuzehendelhuis', G.rbox(0.1, 0.07, 0.16, 0.012), MAT.darkSteel, 'Mechaniekhuis met de poort onder de plaat.', { p: [0, -0.045, 0], inner: true, ex: [0, -0.08, 0] }),
    intPart('Keuzekabel', tube([[0, -0.05, 0.08], [0, -0.058, 0.092], [0, -0.066, 0.1]], 0.005, 12, 6), MAT.steel, 'Schakelkabel naar de automaatbak, hier alleen het begin bij het mechaniekhuis; de aansluiting op de bak hoort bij de aandrijflijn.', { inner: true, ex: [0, -0.1, 0.1] }),
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
  // bovenkant (golf 5n, foto van de eigenaar): de hele bovenkant is pianozwart en heeft een taille, breed bij de poortplaat, smaller
  // bij de joystick en weer breder bij de parkeerrem. Het open vakje naast de joystick aan passagierszijde is weggelaten: een gat
  // tot op de matte consolebehuizing las als een lichter vlak, niet als een vakje
  const topHalf = [[-0.108, 0.117], [-0.06, 0.114], [-0.02, 0.104], [0.02, 0.099], [0.06, 0.104], [0.1, 0.115], [0.3, 0.117]];
  const topGeo = cache('intConsoleTop5n', () => plan(shapeOf(topHalf.map(([z, x]) => [x, z]).concat(topHalf.slice().reverse().map(([z, x]) => [-x, z]))), 0.004));
  // voorpaneel: van de poortplaat naar voren een verzonken bakje op consolehoogte met de 12 V-aansluiting in de voorwand; daarvoor loopt
  // het paneel schuin omhoog tot onder het middenpaneel van het dashboard (profiel in z, y; de zijwanden sluiten het bakje)
  const frontGeo = cache('intConsoleFront5n', () => merge([
    side(shapeOf([[0.3105, 0.41], [0.585, 0.41], [0.585, 0.515], [0.577, 0.52], [0.547, 0.62], [0.45, 0.495], [0.45, 0.466], [0.325, 0.466], [0.325, 0.495], [0.3105, 0.495]]), 0.24),
    intBox(0.016, 0.03, 0.125, [0.112, 0.481, 0.3875]), intBox(0.016, 0.03, 0.125, [-0.112, 0.481, 0.3875]),
    xf(G.cyl('y', 0.0125, 0.0125, 0.012, 14), [0.045, 0.5162, 0.4639], [-0.913, 0, 0])]));
  return A('Middenconsole', { d: 'Middenconsole met een pianozwarte bovenkant met taille, keuzehendel met zilveren poortplaat, een verzonken bakje met 12 V-aansluiting ervoor, de navigatiebediening met acht toetsen, de parkeerremschakelaar, bekerhouders en armsteun.', ex: [0, 0.12, 0.05] }, [
    intPart('Consolebehuizing', G.rbox(0.24, 0.08, 0.73, 0.03), MAT.dash, 'Kunststof console op de vloertunnel, boven het tapijt, van de armsteun tot de poortplaat.', { p: [0, 0.45, -0.055], ex: [0, -0.06, 0] }),
    intPart('Consoleinzetstuk', topGeo, MAT.intPiano, 'Hoogglans pianozwarte bovenkant van de console over de volle breedte, met een taille bij de joystick.', { p: [0, 0.491, 0.0], ex: [0, 0.05, 0] }),
    intPart('Consolevoorpaneel', frontGeo, MAT.dash, 'Voorste deel van de console tussen de poortplaat en het dashboard: een verzonken bakje op consolehoogte met een 12 V-aansluiting in de voorwand aan bestuurderszijde; daarvoor loopt het paneel schuin omhoog tot onder de radio.', { ex: [0, 0, 0.1] }),
    sel,
    intPart('Parkeerremschakelaar', cache('intParkSw5n', () => { const w = 0.045, h = 0.012, d = 0.06, g = G.box(w, h, d).clone(), P = g.attributes.position, uv = g.attributes.uv, R = intTexR.park;
      // bovenkant: opschrift zoals de bestuurder het ziet (boven = naar voren, links = +x); de andere vlakken effen donker
      for (let i = 0; i < P.count; i++) { const top = i >= 8 && i < 12, u = top ? (w / 2 - P.getX(i)) / w : 0.02, v = top ? (d / 2 - P.getZ(i)) / d : 0.03;
        uv.setXY(i, lerp(R[0], R[2], u) / 1024, 1 - lerp(R[1], R[3], v) / 512); }
      return g; }), MAT.intDecal, 'Schakelaar van de elektrische parkeerrem achter de navigatiejoystick, vlak voor de armsteun: donkere klep met een rode streep en het P-symbool (foto van de eigenaar).', { p: [-0.028, 0.4995, -0.075], ex: [0.04, 0.1, 0] }),
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
      intPart('Luchtkanaal achterbank', G.box(0.1, 0.04, 0.7), MAT.plasticGrey, 'Kanaal dat de lucht van de klimaatunit naar de achterpassagiers leidt, in de console boven de tunnel (voor het voorpaneel niet getekend).', { p: [0, 0.43, -0.05], inner: true, ex: [0, -0.1, 0] }),
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
  // voorrand recht van pensparing tot pensparing: de uitsparing voor de middelste gordelrolautomaat is weg, want die automaat zit
  // sinds golf 5n ronde 2 in de rugleuning (besluit van de gebruiker); het draaipunt van de plank blijft waar het was
  const { a, b, xa, xc, xv } = intPlankPen, n0 = pts.length;
  pts.push([xv, z0 - a], [xa, z0 - a], [xa, z0 - b], [xc, z0 - b], [xc, z0],
    [-xc, z0], [-xc, z0 - b], [-xa, z0 - b], [-xa, z0 - a], [-xv, z0 - a]);
  // de hoeken van de pensparingen (alle tien punten van de voorrand) met afronding 4 mm; de rest van de omtrek houdt de afronding
  // van roundPlate
  const klein = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => n0 + i));
  return roundPlate(pts, 0.012, 0.004, 0.025, 4, i => klein.has(i)).rotateX(HALF);
}
// De hemelbekleding hangt 3,4 cm onder het dakvlak. Het dakframe van het panoramadak (src/panorama.js) hangt tot 2,85 cm eronder; bij 2,8 cm
// kwam de hemel op dezelfde hoogte als de onderkant van het frame en staken er donkere rechthoeken door. Nu zit er 5 mm tussen.
const intHemD = 0.034;
// Hemel op kasparameter w: tussen w 0,33 en 0,67 als voorheen; naar de rand (w 0,262) buigt hij tot 9 mm binnen het raamrubber, zodat
// er geen lak van de dakrail meer te zien is (de oude rand op w 0,24 hing 3 tot 4 cm binnen de ruit)
const intHemW = 0.262, intHemB = 0.33;
function intHemP(z, w) {
  const p = ghPt(z, w), sd = p[0] < 0 ? -1 : 1, b = sstep((intHemB - (w <= 0.5 ? w : 1 - w)) / (intHemB - intHemW));
  return [lerp(p[0] * 0.965, p[0] - sd * 0.009, b), lerp(p[1] - intHemD, p[1] - 0.006, b), z];
}
// w en hoogte van de hemel bij |x| = ax
function intHemWAt(z, ax) { let lo = intHemW, hi = 0.5; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Math.abs(intHemP(z, m)[0]) > ax) lo = m; else hi = m; } return (lo + hi) / 2; }
const intHemY = (z, ax) => intHemP(z, intHemWAt(z, ax))[1];
// afvoerslang voor zoals in panorama.js (carrosserie, golf 5l ronde 2): in de A-stijl tegen de stijl, hart 7,5 mm binnen het plaatwerk
function intHoseA(s) {
  const pil = (z, q, dy) => { const h = bodGhHalf(z, q); return [h[0] - 0.026, h[1] - 0.028 + dy]; };
  const hug = (z, q, dy) => { const o = pil(z, q, dy); let qb = q, db = Infinity;
    for (let k = 0; k <= 160; k++) { const qq = 0.40 + 0.4 * k / 160, h = bodGhHalf(z, qq), dd = (h[0] - o[0]) ** 2 + (h[1] - o[1]) ** 2; if (dd < db) { db = dd; qb = qq; } }
    const h0 = bodGhHalf(z, qb), h1 = bodGhHalf(z, qb + 0.004), tl = Math.hypot(h1[0] - h0[0], h1[1] - h0[1]), n = [-(h1[1] - h0[1]) / tl, (h1[0] - h0[0]) / tl], sg = n[0] > 0 ? -1 : 1;
    return [s * (h0[0] + sg * n[0] * 0.0075), h0[1] + sg * n[1] * 0.0075, z]; };
  return new THREE.CatmullRomCurve3([panP(0.205, s * 0.535, -0.006), panP(0.27, s * 0.585, -0.03), hug(0.4, 0.68, 0), hug(0.62, 0.66, -0.04), hug(0.85, 0.65, -0.12)].map(p => V3(...p)), false, 'centripetal');
}
// A-stijlbekleding: breed paneel van raamrubber (w 0,257) tot voorruit (w 0,363), van de hemel (z 0,40) tot het dashboard; binnenkant een
// boog 9 tot 21 mm binnen de koorde. De buitenkant ligt 6 mm binnen de stijl en wijkt uit rond de afvoerslang.
function intAPillar(s) {
  const w0 = 0.257, w1 = 0.363, nW = 12, hs = intHoseA(s).getSpacedPoints(400), zs = [0.40, 0.42, 0.45, 0.48, 0.51, 0.54, 0.57, 0.60, 0.63, 0.66, 0.69, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87, 0.905];
  const loops = zs.map(z => {
    const prof = Array.from({ length: nW + 1 }, (_, k) => { const g = ghPt(z, w0 + (w1 - w0) * k / nW); return [Math.abs(g[0]), g[1]]; });
    const F = prof[0], W = prof[nW], L = Math.hypot(W[0] - F[0], W[1] - F[1]), t = [(W[0] - F[0]) / L, (W[1] - F[1]) / L], n = [-t[1], t[0]];   // t wijst naar binnen en omhoog, n naar de cabine
    let h = hs[0]; for (const p of hs) if (Math.abs(p.z - z) < Math.abs(h.z - z)) h = p;
    // voetpunt van de slang op het profiel; de buitenkant wijkt daar uit tot 6,5 mm voorbij de slang (tussen de steunpunten loopt de
    // slang tot 2 cm binnen het plaatwerk)
    const near = Math.abs(h.z - z) < 0.03, dH = prof.map(p => Math.hypot(p[0] - Math.abs(h.x), p[1] - h.y)), kH = dH.indexOf(Math.min(...dH));
    const bump = near ? Math.max(0, dH[kH] + 0.0125 - 0.006) : 0, offK = k => 0.006 + bump * Math.exp(-((Math.hypot(prof[k][0] - prof[kH][0], prof[k][1] - prof[kH][1]) / 0.036) ** 2));
    const nl = k => { const a = prof[Math.max(0, k - 1)], b = prof[Math.min(nW, k + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };   // normaal naar de cabine
    const base = u => 0.009 + 0.012 * Math.pow(Math.sin(PI * clamp(u, 0, 1)), 0.6);
    const outer = prof.map((p, k) => { const m = k === 0 || k === nW ? n : nl(k); return [p[0] + m[0] * offK(k), p[1] + m[1] * offK(k)]; });
    // binnenkant recht naar de cabine vanaf de buitenkant (geen verschuiving langs de koorde, dus geen kruisende randen)
    const inner = outer.map((q, k) => { const pd = (q[0] - F[0]) * n[0] + (q[1] - F[1]) * n[1], e = Math.max(0.004, base(k / nW) - pd); return [q[0] + n[0] * e, q[1] + n[1] * e]; });
    return [...outer, ...inner.reverse()].map(([x, y]) => [s * x, y, z]);
  });
  return intLoft(loops);
}
// Zijbekleding achter: donker paneel van z -0,84 tot de dop van de bagageruimtebekleding (-1,36); boven 2 cm onder de onderrand van het
// achterportier (bodRDlo) of 7 mm onder de C-stijlbekleding, onder op de dorpel, langs de voorkant van de wielboog 12 mm onder en daarna
// 12 mm boven de kuip; buitenkant 16 mm binnen de huid, binnenkant op |x| 0,775. Dekt het achterscherm af.
const intRSX = 0.775;
function intRearSide(s) {
  const top = z => z > -1.268 ? bodRDloZ(z) - 0.02 : 0.978, bot = z => z > -0.986 ? 0.302 : Math.max(0.302, intKuipY(z) + (z > -1.2 ? -0.012 : 0.012));   // voor de wielkuip op de dorpel, langs de voorkant van de wielboog tot net onder de rand
  const zs = [-0.84, -0.88, -0.92, -0.95, -0.99, -1.02, -1.05, -1.08, -1.10, -1.13, -1.16, -1.19, -1.22, -1.25, -1.266, -1.272, -1.30, -1.33, -1.356];
  const sec = z => {
    const y0 = bot(z), y1 = Math.max(top(z), y0 + 0.012), xo = y => surfX(z, y) - 0.016, ys = [0.15, 0.4, 0.65, 0.85, 0.95].map(k => lerp(y0, y1, k)), r = Math.min(0.006, (y1 - y0) / 3);
    return [[intRSX + r, y0], ...[y0, ...ys, y1].map(y => [xo(y), y]), [intRSX + r, y1], [intRSX, y1 - r], [intRSX, y0 + r]].map(([x, y]) => [s * x, y, z]);
  };
  return intLoft(zs.map(sec));
}
function intTrim() {
  const bx = intBx, cy = intCy;
  const carpet = front(shapeOf([[-0.8, 0.25], [-0.169, 0.25], [-0.128, 0.41], [0.128, 0.41], [0.169, 0.25], [0.8, 0.25], [0.8, 0.24], [0.164, 0.24], [0.12, 0.4], [-0.12, 0.4], [-0.164, 0.24], [-0.8, 0.24]]), 1.65); carpet.translate(0, 0, 0.125);
  // hemeloppervlak (de hemelbekleding ligt 8 mm onder intRoofY, 3,5 % naar binnen) en de helling ervan in lengte- en dwarsrichting
  const hl = (z, ax) => intHemY(z, ax), hlSlope = (z, ax) => (hl(z + 0.05, ax) - hl(z - 0.05, ax)) / 0.1;
  // dakgreep (golf 5n ronde 2, foto eigenaar): brede, platte U-greep in hemelkleur. Een plat profiel van 32 bij 12 mm langs een U van
  // 19 cm met schuin uitlopende benen van bijna 3 cm (zo zijn de benen ook van onderen te zien); de greep volgt de helling van de hemel
  // in lengte en dwars (zoals de zonneklep). Ongeveer 150 driehoeken in plaats van 900 voor de drie afgeronde blokken.
  const gripSec = [[-0.016, -0.004], [-0.012, -0.006], [0.012, -0.006], [0.016, -0.004], [0.016, 0.004], [0.012, 0.006], [-0.012, 0.006], [-0.016, 0.004]];
  // De benen eindigen per greep en per been tegen de hemel: de vlakke eindrand 0,8 mm onder het laagste punt van intHemY onder de voet
  // van het been (in het kader van de greep); de hemelmesh ligt daar tot 0,5 mm onder intHemY (gestraald). Met een vaste beenhoogte
  // stak een been door de bolling van de hemel in lengte en dwars 3 tot 6 mm in de hemel.
  const gripPath = top => [[-0.095, top[0]], [-0.093, -0.008], [-0.087, -0.019], [-0.075, -0.026], [-0.045, -0.029], [0.045, -0.029], [0.075, -0.026], [0.087, -0.019], [0.093, -0.008], [0.095, top[1]]];
  const gripGeo = path => intLoft(path.map(([z, y], i) => { const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], tz = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tz, ty);
    const nz = ty / l, ny = -tz / l;   // normaal in het zijvlak, onder de balk naar beneden
    // de eindranden van de benen liggen vlak (alleen langs z verschoven), anders reikt het schuine profiel 2 mm boven het hart
    if (i === 0 || i === path.length - 1) return gripSec.map(([u, v]) => [u, y, z + v * Math.sign(nz)]);
    return gripSec.map(([u, v]) => [u, y + v * ny, z + v * nz]); }));
  // hoogte van de hemel in het kader van de greep (p, r) boven lokaal (u, w); vier stappen volstaan, de greep staat bijna recht
  const gripHem = (p, r, u, w) => { const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...r)); let y = 0;
    for (let i = 0; i < 4; i++) { const q = V3(u, y, w).applyMatrix4(m).add(V3(...p)); y += intHemY(q.z, Math.abs(q.x)) - q.y; } return y; };
  const handle = (s, z, n) => { const rz = s * Math.atan((hl(z, 0.63) - hl(z, 0.57)) / 0.06), p = [s * 0.6, hl(z, 0.6), z], r = [-hlSlope(z, 0.6), 0, rz];
    const top = [-1, 1].map(k => Math.min(...[-0.016, 0, 0.016].flatMap(u => [-0.007, 0, 0.007].map(dw => gripHem(p, r, u, k * 0.095 + dw)))) - 0.0008);
    // kom (golf 5n reparatieronde 2, foto eigenaar): de greep zit in een verdiepte kom in de hemel. De hemel zelf blijft heel; de kom
    // is een afgeronde rand in hemelkleur (26 bij 7,4 cm) die van de hemel flauw afloopt tot een lip 6,5 mm eronder, met binnen de
    // lip een steile wand terug omhoog naar een bodem 2,5 mm onder de hemel. Elk punt volgt de hemel erboven (gripHem).
    const kom = intLoft([[0.074, 0.262, 0.03, 0.0008], [0.058, 0.246, 0.022, 0.0065], [0.054, 0.242, 0.02, 0.0058], [0.05, 0.238, 0.018, 0.0025]]
      .map(([a, b, rr, d]) => rrectPts(a, b, rr, 3).map(([u, w]) => [u, gripHem(p, r, u, w) - d, w])));
    return intPart(`Dakgreep ${n} ${sideName(s)}`, merge([gripGeo(gripPath(top)), kom]), MAT.intHemPlast, 'Brede, platte klapgreep in hemelkleur boven het portier, met twee benen tot tegen de hemel, in een verdiepte kom met een afgeronde rand (vorm geschat naar de foto van de eigenaar).', { p, r, ex: [s * 0.1, -0.08, 0] }); };
  // zonneklep: draait om de voorrand omlaag tegen de voorruit. Gevoerd paneel 14 mm, 2,6 mm onder de hemel; spiegel met klepje aan de
  // bovenkant; de arm loopt van de scharniervoet tot de haak, die vast in de hemel zitten
  const visorPanel = (() => { const P = [], c = [[0.17, 0.055, 0.03, 0], [-0.165, 0.07, 0.015, HALF], [-0.165, -0.07, 0.015, PI], [0.15, -0.035, 0.05, 1.5 * PI]];
    for (const [cx, cz, r, a0] of c) for (let k = 0; k <= 2; k++) { const a = a0 + HALF * k / 2; P.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
    return P; })();
  const visor = s => { const zc = 0.3, vx = s * 0.36, vy = hl(zc, 0.36) - 0.0096, rx = -hlSlope(zc, 0.36), rz = s * (hl(zc, 0.46) - hl(zc, 0.26)) / 0.2;
    const pivot = [vx, vy - 0.085 * Math.sin(rx), zc + 0.085 * Math.cos(rx)], axis = [Math.cos(rz), Math.sin(rz) * Math.cos(rx), Math.sin(rz) * Math.sin(rx)];
    const panel = roundPlate(visorPanel.map(([u, v]) => [s * u, v]).map((p, k, a) => s > 0 ? p : a[a.length - 1 - k]), 0.014, 0.005, 0.025, 2); panel.rotateX(HALF);
    // vaste delen: langs de as, 1,5 mm onder het laagste punt van de hemel erboven
    const world = (l, hx, hz) => { const v = V3(...l).applyEuler(new THREE.Euler(rx, 0, rz)); const p = [vx + v.x, vy + v.y, zc + v.z];
      p[1] = Math.min(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => intHemY(p[2] + b * hz, Math.abs(p[0]) + a * hx))) - 0.0015; return p; };   // laagste hemel onder de voet
    const fixed = [
      intPart(`Scharniervoet zonneklep ${sideName(s)}`, merge([intBox(0.032, 0.012, 0.034, [0, -0.006, 0]), xf(G.cyl('x', 0.005, 0.005, 0.02, 10), [-s * 0.004, -0.008, -0.003])]), MAT.fabric, 'Scharniervoet van de zonneklep in de hemel, met de bus waarin de arm draait.', { p: world([s * 0.223, 0, 0.084], 0.016, 0.017), r: [rx, 0, rz], ex: [s * 0.04, 0.2, 0.06] }),
      intPart(`Zonneklephaak ${sideName(s)}`, merge([intBox(0.024, 0.008, 0.022, [0, -0.004, 0]), intBox(0.012, 0.01, 0.016, [0, -0.011, 0])]), MAT.plasticGrey, 'Haak in de hemel waarin het binnenste eind van de arm klikt als de klep omhoog staat.', { p: world([-s * 0.193, 0, 0.081], 0.012, 0.011), r: [rx, 0, rz], ex: [-s * 0.02, 0.2, 0.06] })];
    return [A(`Zonneklep ${sideName(s)}`, { d: 'Gevoerde zonneklep met make-upspiegel onder een klepje; draait om de arm omlaag tegen de voorruit (hoek geschat).', p: [vx, vy, zc], r: [rx, 0, rz], ex: [0, 0.3, 0.1],
      open: hinge(pivot, axis, -2.95, Object.assign({ min: 2.4, label: `Zonneklep ${sideName(s)}`, look: { dir: [-s * 0.45, -0.1, -1], nodes: [`Zonneklep ${sideName(s)}`] } }, intNeed(`Portier ${s > 0 ? 'linksvoor' : 'rechtsvoor'}`))) }, [
      intPart('Zonnekleppaneel', panel, MAT.fabric, 'Gevoerd paneel van de zonneklep in de kleur van de hemel, met afgeronde hoeken.', { ex: [0, 0.06, 0] }),
      intPart('Make-upspiegel', G.rbox(0.12, 0.002, 0.062, 0.001), MAT.reflector, 'Spiegel met lampje, verzonken in de bovenkant van de klep; die kijkt naar de bestuurder als de klep omlaag staat.', { p: [-s * 0.03, 0.0015, -0.004], ex: [0, 0.06, 0] }),
      intPart('Spiegelklepje', merge([intBox(0.134, 0.003, 0.074, [0, 0, 0]), intBox(0.03, 0.003, 0.008, [0, 0, -0.04])]), MAT.fabric, 'Klepje over de make-upspiegel met een greeplip; gaat bij het openen het lampje aan.', { p: [-s * 0.03, 0.0045, -0.004], ex: [0, 0.1, 0] }),
      intPart('Zonneklepas', xf(G.cyl('x', 0.0045, 0.0045, 0.384, 8), [s * 0.0125, 0.0, 0.081]), MAT.steel, 'Stalen arm langs de voorrand van de klep, van de haak tot in de bus van de scharniervoet.', { ex: [0, 0.04, 0.05] }),
    ]), ...fixed]; };
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
      // voor: INITIALE, leesbaar van buiten
      n === 'voor' && (() => { const g = new THREE.PlaneGeometry(0.2, 0.025), m = new THREE.Matrix4().makeBasis(V3(0, 0, -s), V3(-s, 0, 0), V3(0, 1, 0)); g.applyMatrix4(m);
        return intPart(`Opschrift instaplijst ${nm}`, g, MAT.intSillLogo, 'Opschrift INITIALE op de sierstrip van de voorste instaplijst (Initiale Paris).', { p: [s * (xm - 0.008), yT + 0.0029, 0.24], ex: [s * 0.1, 0.1, 0] }); })(),
    ].filter(Boolean); };
  // gordijnairbag: tussen dakrail en omgebogen hemelrand (w 0,305), z 0,16 tot -1,06; niet inner (los interieur toont hem)
  const curtain = s => { const pts = []; for (let i = 0; i <= 12; i++) { const z = 0.16 - 1.22 * i / 12, p = ghPt(z, 0.305), h = intHemP(z, 0.305); pts.push([s * (Math.abs(p[0]) + Math.abs(h[0])) / 2, (p[1] + h[1]) / 2, z]); }
    return intPart(`Gordijnairbag ${sideName(s)}`, tube(pts, 0.007, 36, 6), MAT.fabric, 'Opgerolde gordijnairbag langs de dakrail, achter de rand van de hemel; beschermt hoofd en schouders bij een zijdelingse botsing.', { ex: [s * 0.1, 0.1, 0] }); };
  const pillarCover = s => intPart(`A-stijlbekleding ${sideName(s)}`, intAPillar(s), MAT.fabric, 'Brede bekleding van de A-stijl in hemelkleur, van het raamrubber tot de voorruit en van de hemel tot op het dashboard; de afvoerslang van het dak loopt erachter (vorm geschat).', { ex: [s * 0.12, -0.05, 0] });
  // hemel van het panoramadak: twee openingen (voorste glas z 0,22 tot -0,50, achterste glas z -0,58 tot -1,11, glas tot |x| 0,47);
  // de hemel laat 2 cm rondom het glas vrij, de afwerkring is een wulst in hemelkleur op de rand van elke opening
  const linP = intHemP;
  const wAtX = (z, ax) => { let lo = intHemB, hi = 0.5; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (0.965 * Math.abs(ghPt(z, m)[0]) > ax) lo = m; else hi = m; } return (lo + hi) / 2; };
  const hole = { hx: 0.45, front: [0.2, -0.48], rear: [-0.6, -1.09] };
  // randstroken (w 0,262 tot 0,33) met dezelfde rijen in z als het middendeel (geen kieren)
  const liningGeo = (() => {
    const segs = [[0.4, 0.2, 4], [0.2, -0.48, 14], [-0.48, -0.6, 2], [-0.6, -1.09, 10], [-1.09, -1.17, 4]], list = [];
    // omslag van 22 mm omlaag aan de rand (om de dakrailflens; dekt bij een open portier de blik door de cabine)
    const lip = w => (z, k) => { const p = linP(z, w); return [p[0], p[1] - 0.022 * k, z]; };
    for (const [z0, z1, n] of segs) list.push(patch(linP, z0, z1, n, () => [intHemW, intHemB], 5), patch(linP, z0, z1, n, () => [1 - intHemB, 1 - intHemW], 5),
      patch(lip(intHemW), z0, z1, n, () => [0, 1], 1), patch(lip(1 - intHemW), z0, z1, n, () => [0, 1], 1));
    // strook achter de hemelrand tot boven de C-stijlbekleding, buiten de klepafdichting
    list.push(patch(linP, -1.17, -1.25, 2, () => [0.28, 0.305], 2), patch(linP, -1.17, -1.25, 2, () => [0.695, 0.72], 2));
    // middendeel op het oude raster (w 0,24 + k 0,52 / 12), gelijk boven de klepscharnieren
    const full = (z0, z1, n) => [patch(linP, z0, z1, n, () => [0.24 + 0.52 * 3 / 12, 0.24 + 0.52 * 9 / 12], 6), patch(linP, z0, z1, n, () => [intHemB, 0.24 + 0.52 * 3 / 12], 1), patch(linP, z0, z1, n, () => [0.24 + 0.52 * 9 / 12, 1 - intHemB], 1)];
    list.push(...full(0.4, 0.2, 4), ...full(-0.48, -0.6, 2), ...full(-1.17, -1.09, 4));
    for (const [zA, zB] of [hole.front, hole.rear]) {
      const n = Math.ceil((zA - zB) / 0.05);
      list.push(patch(linP, zB, zA, n, z => [intHemB, wAtX(z, hole.hx)], 4), patch(linP, zB, zA, n, z => [1 - wAtX(z, hole.hx), 1 - intHemB], 4));
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
  // afwerklijst onder de bovenrand van de klepopening (z -1,10 tot -1,174): de sponning van de carrosserie hangt daar 1,5 tot 2,5 cm onder
  // de hemel; de lijst ligt 2 mm onder de sponning en volgt de bolling van het dak (bovenkant 26 mm onder de hemel, 14 mm dik)
  const hdrTop = x => intHemY(-1.135, Math.abs(x)) - 0.026;
  const edgeGeo = intLoft([-0.55, -0.45, -0.35, -0.25, -0.15, -0.05, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55].map(x => { const y1 = hdrTop(x), y0 = y1 - 0.014;
    return [[-1.100, y0 + 0.004], [-1.104, y0], [-1.170, y0], [-1.174, y0 + 0.004], [-1.174, y1 - 0.003], [-1.171, y1], [-1.103, y1], [-1.100, y1 - 0.003]].map(([z, y]) => [x, y, z]); }));
  // hemelconsole onder de voorrand bij de binnenspiegel: plafonnier en de bediening van het dak
  const roofTilt = z => -(intRoofY(z + 0.05, 0) - intRoofY(z - 0.05, 0)) / 0.1;
  const lampZ = 0.355, consZ = 0.265, rlZ = -0.54;
  const roofCons = A('Hemelconsole dak', { d: 'Bediening van het panoramadak in de hemel onder de binnenspiegel: draaiknop met de standen 0 (dicht), A (kantelen), B, C en D (schuiven) en een drukknop voor het noodsluiten. Het uiterlijk van de knop is schematisch.', p: [0.035, intRoofY(consZ, 0.035) - 0.012, consZ], r: [roofTilt(consZ), 0, 0], ex: [0, 0.16, 0] }, [
    intPart('Consolehuis dak', G.rbox(0.14, 0.012, 0.06, 0.005), MAT.fabric, 'Hemelconsole in de kleur van de hemel met de bediening van het dak.', { ex: [0, 0.03, 0] }),
    intPart('Draaiknop dakraam', merge([xf(G.cyl('y', 0.012, 0.012, 0.01, 20), [0.03, -0.009, 0]), xf(G.box(0.003, 0.004, 0.012), [0.03, -0.016, 0.005])]), MAT.plasticGrey, 'Draaiknop met de standen 0, A, B, C en D (kantelen en schuiven van het voorste glas).', { ex: [0, -0.06, 0] }),
    intPart('Standmarkeringen dakraam', merge([-0.9, -0.45, 0, 0.45, 0.9].map(a => xf(G.box(0.003, 0.0015, 0.007), [0.03 + Math.sin(a) * 0.022, -0.0068, -Math.cos(a) * 0.022], [0, a, 0]))), MAT.plastic, 'Vijf streepjes bij de stand 0, A, B, C en D.', { ex: [0, -0.03, 0] }),
    intPart('Noodsluitknop dakraam', xf(G.cyl('y', 0.006, 0.006, 0.008, 14), [-0.03, -0.007, 0]), MAT.plastic, 'Drukknop waarmee het dak in noodgeval wordt gesloten (antiklem dan uit).', { ex: [0, -0.06, 0] }),
  ]);
  const stijl = A('Stijlbekleding', { d: 'Bekleding van de B- en C-stijlen en de zijwand achter: de B-stijl in twee delen, de donkere zijbekleding naast de achterbank en de C-stijl daarboven. De A-stijlbekleding hoort bij de dakbekleding.', ex: [0, 0.12, 0] }, [
    ...[1, -1].map(s => intPart(`B-stijlbekleding boven ${sideName(s)}`, intBPillar(s, true), MAT.fabric, 'Bovenste bekleding van de B-stijl in hemelkleur: een smal, licht bol paneel van de gordellijn tot tegen de hemel, met een verdiept vak voor de hoogteversteller van de gordel (vorm geschat).', { ex: [s * 0.14, 0.05, 0] })),
    ...[1, -1].map(s => intPart(`B-stijlbekleding onder ${sideName(s)}`, intBPillar(s, false), MAT.dash, 'Onderste bekleding van de B-stijl in donker kunststof, van de dorpel tot de gordellijn; erachter zit de oprolautomaat van de voorgordel (vorm en maten geschat).', { ex: [s * 0.14, -0.05, 0] })),
    ...[1, -1].map(s => intPart(`Zijbekleding achter ${sideName(s)}`, intRearSide(s), MAT.intTrimDark, 'Donker kunststof zijpaneel naast de rugleuning achter, tussen achterportier, wielkast en C-stijlbekleding (vorm geschat).', { ex: [s * 0.16, -0.02, -0.04] })),
    ...[1, -1].map(s => intPart(`C-stijlbekleding ${sideName(s)}`, intCPillar(s), MAT.fabric, 'Bekleding van de C-stijl in de kleur van de hemel, tussen de kwartsruit en de opening van de achterklep, boven de zijbekleding van de bagageruimte. Onderaan een smalle richel naast de scharnierpen van de hoedenplank (vorm en maten geschat).', { ex: [s * 0.14, 0.06, -0.06] })),
  ]);
  return A('Bekleding', { d: 'Hemel met zonkleppen, grepen en plafonniers, stijlbekleding, vloerbedekking met matten, dorpellijsten en de bekleding van de bagageruimte met de luidsprekers van de achterplank en de versterker.', ex: [0, 0.4, 0] }, [
    A('Dakbekleding', { d: 'Hemel met de openingen van het panoramadak, zonkleppen, handgrepen, plafonniers en de opgerolde gordijnairbags.', ex: [0, 0.3, 0] }, [
    intPart('Hemelbekleding panoramadak', liningGeo, MAT.fabric, 'Lichtgrijze hemelbekleding (Dark Carbon) met twee openingen voor het voorste en het achterste glas van het panoramadak (maten geschat, glas tot 0,47 m van de hartlijn).', { ex: [0, 0.48, 0] }),
    intPart('Afwerkring panoramadak', ringGeo, MAT.fabric, 'Afwerkring in de kleur van de hemel rond beide dakopeningen.', { ex: [0, 0.34, 0] }),
    intPart('Hemelrand achter', edgeGeo, MAT.fabric, 'Afwerklijst in hemelkleur langs de achterrand van de hemel, onder de bovenrand van de klepopening (sponning).', { ex: [0, 0.3, -0.2] }),
    roofCons,
    ...visor(1), ...visor(-1),
    handle(1, 0.0, 'voor'), handle(-1, 0.0, 'voor'), handle(1, -0.9, 'achter'), handle(-1, -0.9, 'achter'),
    A('Plafonnier voor', { d: 'Plafonnier met twee leeslampjes voor de voorpassagiers, onder de voorrand van het dak bij de binnenspiegel.', p: [0, intRoofY(lampZ, 0) - 0.016, lampZ], r: [roofTilt(lampZ), 0, 0], ex: [0, 0.2, 0] }, [
      intPart('Lamphuis voor', G.rbox(0.3, 0.02, 0.08, 0.008), MAT.plasticGrey, 'Behuizing van het plafonnier.', { ex: [0, 0.04, 0] }),
      ...[1, -1].map(s => intPart(`Leeslampje ${sideName(s)}`, G.cyl('y', 0.025, 0.025, 0.004, 16), MAT.lensClear, 'Leeslampje met lens boven de voorstoel aan deze kant.', { p: [s * 0.1, -0.011, 0], ex: [0, -0.06, 0] })),
    ]),
    // leeslamp achter (golf 5n ronde 2, foto eigenaar): in de dwarsbalk van de hemel tussen de twee glasdelen (z -0,48 tot -0,60), niet
    // in de achterrand; een rechthoekig huis met een lens en een tuimelschakelaar aan het eind (plaats in x en maten geschat)
    A('Plafonnier achter', { d: 'Leeslamp voor de achterpassagiers in de dwarsbalk van de hemel tussen het voorste en het achterste glas van het panoramadak: een rechthoekig huis met een lens en een tuimelschakelaar (foto eigenaar; maten geschat).', p: [0, hl(rlZ, 0), rlZ], r: [-hlSlope(rlZ, 0), 0, 0], ex: [0, 0.2, 0] }, [
      intPart('Lamphuis achter', G.rbox(0.14, 0.01, 0.05, 0.004), MAT.intHemPlast, 'Huis van de leeslamp in een iets donkerder grijs dan de hemel.', { p: [0, -0.004, 0], ex: [0, 0.03, 0] }),
      intPart('Lens leeslamp achter', G.box(0.09, 0.002, 0.032), MAT.intLampLens, 'Matte lens van de leeslamp.', { p: [-0.016, -0.0095, 0], ex: [0, -0.04, 0] }),
      intPart('Schakelaar leeslamp achter', G.box(0.016, 0.004, 0.016), MAT.plasticGrey, 'Tuimelschakelaar van de leeslamp, naast de lens.', { p: [0.046, -0.0098, 0], ex: [0, -0.06, 0] }),
    ]),
    curtain(1), curtain(-1),
    pillarCover(1), pillarCover(-1),
    ]),
    stijl,
    A('Vloerbekleding', { d: 'Vloerbedekking met losse matten en de dorpellijsten.', ex: [0, -0.1, 0] }, [
    intPart('Vloerbedekking', carpet, MAT.carpet, 'Getufte vloerbedekking als dunne laag op de vloer en over de tunnel; de uitlaat in de tunnel blijft eronder vrij.', { ex: [0, -0.22, 0] }),
    mat(1, 'bestuurder'), mat(-1, 'passagier'),
    // tapijt dat voor in de voetruimte tegen de voetwand onder het dashboard en langs de zijbekleding omhoog loopt, zodat er tussen de
    // vloer en die afdekkingen geen kier naar wielkast en schutbord is
    intPart('Voetruimtewand', merge([1, -1].flatMap(s => [intBox(0.558, 0.059, 0.006, [s * 0.459, 0.2805, 0.906]), intBox(0.004, 0.064, 0.278, [s * 0.737, 0.283, 0.77])])), MAT.carpet, 'Vloerbedekking die voor in de voetruimte omhoog loopt tegen de voetwand en langs de zijbekleding (vorm geschat).', { ex: [0, -0.18, 0.06] }),
    ...[1, -1].flatMap(s => sill(s, -0.27, 0.83, 'voor', 0.3, 0.33, -0.03, 0.78)), ...[1, -1].flatMap(s => sill(s, -0.8, -0.29, 'achter', 0.294, 0.326, -0.78, -0.29)),
    ]),
    A('Bagageruimte', { d: 'Bekleding van de bagageruimte met hoedenplank, vloerplaat, zijbekleding over de wielkasten, de luidsprekers van de achterplank en de versterker.', ex: [0, 0.0, -0.3] }, [
    intUit(intPart('Hoedenplank', intPlankGeo(), MAT.carpet, 'Afdekplaat achter de achterbank boven de bagageruimte; hangt met koordjes aan de achterklep en komt mee omhoog als die opent (geschat 52 graden), met twee scharnierpennen in de zijbekleding aan de voorrand, die in een kleine sparing in de voorhoeken van de plank liggen.', Object.assign({ p: [0, 1.0, -1.85], ex: [0, 0.3, -0.2] }, intPlankOpen()))),
    // scharnierpen: de draagplaat zit achter de zijbekleding (buiten |x| 0,635, onder de bovenrand); zichtbaar blijven een afgeronde kop
    // in donker kunststof (dekt de kier tussen zijbekleding en C-stijlbekleding), de korte pen en de kraag
    ...[1, -1].map(s => intPart(`Plankscharnierpen ${sideName(s)}`, merge([xf(G.cyl('x', 0.011, 0.011, 0.059, 12), [-s * 0.0195, 0, 0]), xf(G.cyl('x', 0.017, 0.017, 0.008, 14), [-s * 0.045, 0, 0]),
      intBox(0.012, 0.06, 0.04, [0, -0.045, 0]), xf(G.rbox(0.05, 0.05, 0.04, 0.008), [s * 0.02, -0.005, 0])]), MAT.plastic, 'Scharnierpen van de hoedenplank met een kop in donker kunststof; de draagplaat zit achter de zijbekleding van de bagageruimte. De plank draait om deze twee pennen omhoog als de achterklep opent.', { p: [s * 0.655, 1.0, -1.575], ex: [s * 0.14, 0, 0] })).map(intUit),
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
    intPart('Achterpaneelbekleding', merge([intBox(0.88, 0.2, 0.004, [0, 0.51, -2.1845]), ...[1, -1].map(s => intBox(0.16, 0.064, 0.004, [s * 0.52, 0.578, -2.1845]))]), MAT.intTrimDark, 'Kunststof bekleding van het achterpaneel achter de bagagevloer, tussen de zijbekledingen; aan de zijkanten alleen boven de bumperbalk, die daar naar voren buigt (vorm geschat).', { ex: [0, -0.06, -0.2] }),
    ...[1, -1].map(s => intPart(`Hoekbekleding bagageruimte ${sideName(s)}`, (() => { const ys = [0.634, 0.68, 0.73, 0.78, 0.82, 0.855], o = ys.map(y => [s * Math.min(0.684, Math.min(surfX(-2.203, y), surfX(-2.207, y)) - 0.012), y]); const g = front(shapeOf(s > 0 ? [[0.6, 0.634], ...o, [0.6, 0.855]] : [[-0.6, 0.855], ...o.reverse(), [-0.6, 0.634]]), 0.004); g.translate(0, 0, -2.207); return g; })(), MAT.intFelt, 'Vilten hoekstuk tussen de zijbekleding, de dorpellijst en het achterlicht, in de achterhoek van de bagageruimte (vorm geschat).', { ex: [s * 0.08, 0, -0.2] })),
    intPart('Dorpellijst bagageruimte', intBox(1.2, 0.014, 0.047, [0, 0.627, -2.206]), MAT.plasticGrey, 'Dorpellijst op de bovenrand van het achterpaneel, onder de sponning van de achterklep: beschermt de rand bij het in- en uitladen (vorm geschat).', { ex: [0, -0.04, -0.24] }),
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
    // bovenrand naast de C-stijlbekleding (z -1,36 tot -1,525, daarachter de plaat van de plankscharnierpen): een flens tot 14 mm binnen de huid, onder de richel van de C-stijlbekleding
    const xF = z <= -1.36 && z >= -1.525 ? Math.max(xo, surfX(z, yT) - 0.014) : xo;
    pts.push([xw, yT - 0.008], [xw + 0.002, yT - 0.002], [xw + 0.008, yT], [xF - 0.004, yT], [xF, yT - 0.004], [xF, yT - 0.010], [xo, yT - 0.014], [xo, yk], [xK, yk], [xK, yk1], [xK1, yk1], [xK1, yb]);
    return pts;
  };
  // achter z -2,06 tot het achterpaneel (z -2,20): dezelfde doorsnede, naar binnen geschoven waar de hoek van het achterscherm insnoert
  // en onder de sponning van de achterklep (y 0,95) en achter z -2,12 onder de achterlichthuizen (y 0,85)
  const rear = z => { const b = sec(-2.085); return b.map(([x, y]) => { const yy = Math.min(y, z < -2.12 ? 0.85 : 0.95), d = Math.max(0, xo + 0.012 - surfX(z, yy)); return [x - d, yy]; }); };
  const zs = [-1.36, -1.41, -1.45, -1.475, -1.485, -1.50, -1.53, -1.548, -1.56, -1.59, -1.612, zPod, -1.618, -1.626, -1.630, -1.637, -1.643, -1.67, -1.70, -1.72, -1.74, -1.755, -1.77, -1.78, -1.787, -1.795, -2.06, -2.085, -2.13, -2.17, -2.20];
  const zFront = y => Math.min(-1.36, intSeatBackZ(y) - 0.008);
  const loops = zs.map((z, i) => (z < -2.07 ? rear(z) : sec(z)).map(([x, y]) => [s * x, y, i === 0 ? zFront(y) : z]));
  // dop tussen zijwand en achterscherm naast de rugleuning (boven de wielkuip), 12 mm dik, met dezelfde schuine voorkant
  const zc = -1.38, yc0 = intKuipY(zc) + 0.008, ys = [yc0, 0.80, 0.86, 0.92, 0.95, 0.965, yT];
  const capSec = dz => [[0.633, yT], [0.633, yc0], ...ys.map(y => [Math.min(surfX(-1.36, y), surfX(-1.42, y)) - 0.012, y])].map(([x, y]) => [s * x, y, zFront(y) - dz]);
  return merge([intLoft(loops), intLoft([capSec(0), capSec(0.012)])]);
}
// B-stijlbekleding: onder van de dorpel tot y 0,925 over de oprolautomaat; boven volgt hij de stijl tussen de ruiten (gemeten ruitranden
// plus 1 cm) tot 4 mm onder de hemel, met een verdiept vak (y 0,98 tot 1,17) voor de hoogteversteller en achter een flens tot 6 mm
// binnen de stijl (xf); voor niet, daar zwaait het voorportier langs
const intBzc = y => -0.17 - (y - 0.66) * 0.2132;
const intBUp = { y: [0.93, 0.96, 0.98, 1.0, 1.1, 1.2, 1.28, 1.31], zF: [-0.180, -0.150, -0.1385, -0.127, -0.148, -0.170, -0.187, -0.193], zR: [-0.272, -0.255, -0.246, -0.237, -0.252, -0.268, -0.280, -0.284],
  xf: [0.703, 0.704, 0.704, 0.735, 0.730, 0.686, 0.632, 0.616], rec: [0.98, 1.17] };
const intBUpAt = (y, k) => { const Y = intBUp.y, V = intBUp[k]; if (y <= Y[0]) return V[0]; for (let i = 0; i < Y.length - 1; i++) if (y <= Y[i + 1]) return lerp(V[i], V[i + 1], (y - Y[i]) / (Y[i + 1] - Y[i])); return V[V.length - 1]; };
const intBUpX = (z, y) => Math.min(0.700, surfX(z, y) - 0.03);   // buitenkant (naar de stijl) van het bovenste deel
function intBPillar(s, upper) {
  if (!upper) {
    const loops = [0.27, 0.33, 0.40, 0.50, 0.60, 0.70, 0.80, 0.88, 0.925].map(y => {
      const zc = intBzc(y), hw = 0.046 + 0.012 * clamp((0.5 - y) / 0.23, 0, 1), zF = zc + hw, zR = zc - hw, xo = Math.min(0.700, surfX(zc, y) - 0.03), xi = xo - 0.016;
      return [[xo, zF], [xi + 0.006, zF - 0.004], [xi, zF - 0.012], [xi, zR + 0.012], [xi + 0.006, zR + 0.004], [xo, zR]].map(([x, z]) => [s * x, y, z]);
    });
    return intLoft(loops);
  }
  // doorsnede op hoogte y; top: de bovenste doorsnede, met de buitenkant 12 mm binnen de dakrail en elk punt 4 mm onder de hemel
  const sec = (y, top) => {
    const zF = intBUpAt(y, 'zF'), zR = intBUpAt(y, 'zR'), zc = (zF + zR) / 2, xo = top ? Math.min(intBUpX(zc, y), surfX(zc, 1.36) - 0.012) : intBUpX(zc, y), xi = xo - 0.016;
    const rec = y > intBUp.rec[0] && y < intBUp.rec[1] ? 0.004 : 0;
    const xf = Math.max(xo, intBUpAt(y, 'xf'));   // achterflens tot 6 mm binnen de stijl
    const pts = [[xo, zF], [xi + 0.007, zF - 0.002], [xi + 0.002, zF - 0.008], [xi, zF - 0.016], [xi - 0.002, zc + 0.02], [xi - 0.002 + rec, zc + 0.017], [xi - 0.002 + rec, zc - 0.017], [xi - 0.002, zc - 0.02],
      [xi, zR + 0.016], [xi + 0.002, zR + 0.008], [xi + 0.007, zR + 0.002], [xf, zR], [xf, zR + 0.006], [xo, zR + 0.014]];
    return pts.map(([x, z]) => [s * x, top ? intHemY(z, x) - 0.004 : y, z]);
  };
  const ys = [0.93, 0.945, 0.96, 0.978, 0.982, 1.0, 1.05, 1.1, 1.15, 1.168, 1.172, 1.2, 1.24, 1.28, 1.30];
  return intLoft([...ys.map(y => sec(y)), sec(1.31, true)]);
}
// C-stijlbekleding: paneel langs de binnenkant van de C-stijl boven de zijbekleding, van achter de kwartsruit tot de sponning van de
// achterklep (bovenrand 1 tot 2 cm onder de sponning en 7 mm naast de gasveer en haar kogel; golf 5l: 2 tot 3 cm hoger dan voorheen,
// zodat er minder lak van de C-stijl zichtbaar blijft), 7 tot 19 mm binnen de huid, met onderaan een
// richel (y 0,985 tot 0,995) naar binnen tot |x| 0,705, net buiten de scharnierpen van de hoedenplank.
const intCTop = z => { const T = [[-1.185, 1.262], [-1.262, 1.262], [-1.285, 1.245], [-1.30, 1.21], [-1.36, 1.203], [-1.45, 1.188], [-1.55, 1.165], [-1.65, 1.135], [-1.75, 1.11], [-1.85, 1.06], [-1.95, 1.035], [-2.03, 1.0]];
  for (let i = 0; i < T.length - 1; i++) if (z <= T[i][0] && z >= T[i + 1][0]) return lerp(T[i][1], T[i + 1][1], (T[i][0] - z) / (T[i][0] - T[i + 1][0]));
  return z > T[0][0] ? T[0][1] : T[T.length - 1][1]; };
// z van de achterrand van de kwartsruit op hoogte y (bodQtop is de bovenrand van de ruit als functie van z)
const intQuarterZ = y => { let lo = -1.25, hi = -1.14; if (bodQtop(lo) >= y) return lo; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bodQtop(m) >= y) hi = m; else lo = m; } return lo; };
// lip langs de bovenrand van de C-stijlbekleding (z -1,30 tot -1,60): van de bovenkant naar binnen onder de gasveer door (4 mm eronder)
// en schuin omhoog tot 6 mm onder de sponning van de klepopening, zodat de veer bij een dichte klep vanaf de achterbank achter de
// bekleding en de sponning verdwijnt. Gemeten per z: binnenkant en onderkant van de sponning, onderkant van de veer (de veer zwaait
// bij het openen omhoog, van de lip af). De punt van de lip (spX + 6 mm, spY - 6 mm) ligt op elke z 6 mm onder de sponning; de knik
// eronder (stX - 4 mm, stY - 5 mm) ligt 5 mm onder de lijn van de veer. De veer begint pas bij z -1,31; stY bij -1,30 is doorgetrokken
// uit -1,33 en -1,36 (golf 5n). Met de knik daar ook op 6 mm onder de sponning (stY 1,2405, getoetst in ronde 2) staat de lip bij -1,30
// 2 cm boven de bovenrand van het paneel en draait het vlak naar -1,33 zo sterk dat er vanaf beide buitenste achterplaatsen een donkere
// vouw in de lip te zien is; met de doorgetrokken waarde is het vlak egaal en blijft de punt 6 mm onder de sponning.
const intCLip = { z: [-1.30, -1.33, -1.36, -1.40, -1.45, -1.50, -1.55, -1.60], spX: [0.6086, 0.6106, 0.6146, 0.6205, 0.6263, 0.6309, 0.6344, 0.637],
  spY: [1.2395, 1.2307, 1.2225, 1.2116, 1.1991, 1.1865, 1.1731, 1.1587], stY: [1.2228, 1.2168, 1.2108, 1.2028, 1.1929, 1.183, 1.173, 1.1728],
  stX: [0.645, 0.6482, 0.6495, 0.6515, 0.654, 0.6564, 0.6589, 0.6709] };
const intCLipAt = (z, k) => { const Z = intCLip.z, V = intCLip[k]; for (let i = 0; i < Z.length - 1; i++) if (z <= Z[i] + 1e-9 && z >= Z[i + 1] - 1e-9) return lerp(V[i], V[i + 1], (Z[i] - z) / (Z[i] - Z[i + 1])); return null; };
function intCPillar(s) {
  const zs = [-1.258, -1.27, -1.30, -1.33, -1.36, -1.40, -1.45, -1.50, -1.55, -1.60, -1.65, -1.70, -1.75, -1.80, -1.85, -1.90, -1.95, -2.0], m = 7;
  const loops = zs.map((z0, i) => {
    const zAt = y => i === 0 ? clamp(intQuarterZ(y) - 0.008, -1.258, -1.185) : z0;
    const yt = Math.max(1.0, intCTop(i === 0 ? -1.262 : z0)), yo = [], yi = [];
    for (let j = 0; j <= m; j++) yo.push(0.985 + (yt - 0.985) * j / m);
    for (let j = 0; j <= m; j++) yi.push(yt - 0.003 - (yt - 0.003 - 0.995) * j / m);
    const sx = (y, o) => surfX(zAt(y), y) - o, tip = Math.max(0.688, Math.min(0.705, sx(0.995, 0.019) - 0.008));   // richel tot |x| 0,705, achteraan korter
    const a = [sx(yt, 0.007), yt], b = [sx(yi[0], 0.019), yi[0]], spX = intCLipAt(z0, 'spX'), spY = intCLipAt(z0, 'spY'), stY = intCLipAt(z0, 'stY');
    const stX = intCLipAt(z0, 'stX');
    const lip = i > 0 && spX !== null ? (() => { const ya = Math.min(yt + 0.004, stY - 0.005, spY - 0.012), xa = 0.69, xs = stX - 0.004, ys = Math.min(stY - 0.005, spY - 0.006);
      return [[xa, ya], [xs, ys], [spX + 0.006, spY - 0.006], [spX + 0.006, spY - 0.012], [xs, ys - 0.006], [xa, ya - 0.006]]; })()
      // de doorsnede vlak voor de lip: de zes lippunten samen in het midden van de bovenrand, zodat de lip als een spits uit de bovenrand
      // groeit; met de punten verdeeld over de bovenrand liep de onderkant van de lip in de neus tegen de bovenkant in (een vouw)
      : i > 0 && intCLipAt(zs[i + 1] ?? 0, 'spX') !== null ? Array(6).fill([lerp(a[0], b[0], 0.5), lerp(a[1], b[1], 0.5)])
      : [1, 2, 3, 4, 5, 6].map(f => [lerp(a[0], b[0], f / 7), lerp(a[1], b[1], f / 7)]);
    const pts = [[tip, 0.985], ...yo.map(y => [sx(y, 0.007), y]), ...lip, ...yi.map(y => [sx(y, 0.019), y]), [tip + 0.004, 0.995], [tip, 0.992]];
    return pts.map(([x, y]) => [s * x, y, zAt(y)]);
  });
  return intLoft(loops);
}
function buildInterior() {
  const seats = A('Stoelen', { d: 'Voorstoelen met verwarming en elektrische verstelling, achterbank met gedeeld neerklapbare rugleuning en de veiligheidsgordels.', ex: [0, 0.26, -0.1] }, [frontSeat(1), frontSeat(-1), intRearBench(), intBelts()]);
  return A('Interieur', { d: 'Initiale Paris-interieur in Dark Carbon (geperforeerd antraciet leder, lichtgrijze hemel), stoelverwarming, Bose-audio (tien luidsprekers, negen weergegeven) en tweezone-klimaatregeling.', ex: [0, 0.66, 0] }, [intDashboard(), intConsole(), seats, intTrim(), intPedals(), intMirror()]);
}

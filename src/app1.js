/* ===================== opbouw en explosielogica ===================== */
// Model-laag van de app: boom doorlopen, uitklaprichtingen, animatie (uitklappen, uitlichten, optillen),
// zichtbaarheid (isolatie en ingesloten onderdelen), materialen, camera-inpassing, vloer en de stap-terug-geschiedenis.
const ROOT = (() => {
  try { return buildCar(); } catch (e) {
    LOADING.textContent = 'Het model kon niet worden opgebouwd (' + (e && e.message ? e.message : e) + '). Laad de pagina opnieuw.';
    throw e;
  }
})();
scene.add(ROOT.obj);
const ALL = [], ASMS = [];
(function walk(n, d) { n.depth = d; ALL.push(n); if (n.asm) ASMS.push(n); n.kids.forEach(k => walk(k, d + 1)); })(ROOT, 0);
const MESHES = [];
ROOT.obj.traverse(o => { if (o.isMesh) MESHES.push(o); });
const MAXDEPTH = Math.max(...ALL.map(n => n.depth));
const SYS_COLORS = { 'Carrosserie': 0x7d93b4, 'Interieur': 0xcaa77a, 'Aandrijflijn': 0xe0782f, 'Onderstel': 0x8a64c8, 'Koeling en luchtinlaat': 0x2fa6a0, 'Uitlaatsysteem': 0x9a6b4b, 'Brandstofsysteem': 0x58a24d, 'Elektrisch systeem': 0xe5c23a };
const SYS_MATS = {};
for (const [k, c] of Object.entries(SYS_COLORS)) SYS_MATS[k] = new THREE.MeshStandardMaterial({ color: c, metalness: 0.15, roughness: 0.55, side: THREE.DoubleSide });
const uiById = new Map();
const uiNames = new Map();     // naam -> eerste knoop
const uiNameCount = new Map(); // naam -> aantal
// telling, systeem, lokale middens
ROOT.obj.updateMatrixWorld(true);
const _box = new THREE.Box3(), _v = V3(0, 0, 0);
for (let i = ALL.length - 1; i >= 0; i--) {
  const n = ALL[i];
  n.count = n.asm ? n.kids.reduce((a, k) => a + k.count, 0) : 1;
  n.base = n.obj.position.clone();
}
for (const n of ALL) {
  let top = n; while (top.parent && top.parent !== ROOT) top = top.parent;
  n.sys = top === ROOT ? null : top.name;
  n.isBody = top.name === 'Carrosserie';
  n.meshes = [];
  n.obj.traverse(o => { if (o.isMesh) n.meshes.push(o); });
  _box.makeEmpty();
  for (const m of n.meshes) _box.expandByObject(m);
  if (_box.isEmpty()) _box.setFromCenterAndSize(n.obj.getWorldPosition(V3(0, 0, 0)), V3(0.01, 0.01, 0.01));
  const c = _box.getCenter(V3(0, 0, 0));
  n.rad = Math.max(0.01, _box.getSize(_v).length() / 2);
  n.wc = c.clone();
  n.lc = n.obj.worldToLocal(c.clone());
  // app-velden
  n.off = V3(0, 0, 0); n.off0 = V3(0, 0, 0); n.off1 = V3(0, 0, 0); n.pull = V3(0, 0, 0); n.liftV = V3(0, 0, 0);
  n.hasOff = false; n.ok = 1; n.odur = 0.5; n.odelay = 0; n.a0 = 0; n.k = 1; n.dur = 0.85; n.vis = true; n.ev = true;
  n.idx = n.parent ? n.parent.kids.indexOf(n) : 0;
  n.norm = n.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  uiById.set(n.id, n);
  if (!uiNames.has(n.name)) uiNames.set(n.name, n);
  uiNameCount.set(n.name, (uiNameCount.get(n.name) || 0) + 1);
}
for (const n of ALL) {
  n.innerKids = n.asm && n.kids.some(k => k.inner);
  n.bySize = n.asm ? n.kids.slice().sort((a, b) => b.rad - a.rad) : null;
  if (!n.parent) continue;
  const p = n.parent;
  if (n.ex) { n.exv.copy(n.ex); continue; }
  const pc = p.obj.worldToLocal(p.wc.clone()), cc = p.obj.worldToLocal(n.wc.clone());
  const dir = cc.sub(pc);
  if (dir.length() < 1e-3) dir.set(0, 1, 0);
  const dist = Math.max(0.04, p.exs * (0.35 * p.rad + 0.5 * n.rad));
  n.exv.copy(dir.normalize().multiplyScalar(dist));
}
const byName = name => uiNames.get(name);
function byPath(path) {
  const segs = String(path).split('/').map(s => s.trim()).filter(Boolean);
  let n = ROOT;
  if (segs[0] === ROOT.name) segs.shift();
  for (const s of segs) { n = n && n.kids.find(k => k.name === s); if (!n) return null; }
  return n;
}

/* ---------- uitklappen ---------- */
let SPREAD = 1;
const DUR = REDUCED ? 0.01 : 0.85;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const uiAnim = new Set();     // groepen die animeren
const uiOffAnim = new Set();  // knopen met een animerende verschuiving (uitlichten, optillen)
let uiVisDirty = true;
const uiOpen = n => !!n && n.asm && n.target > 0.5;
function placeKids(n) {
  const s = n.amt * SPREAD;
  for (const k of n.kids) { k.obj.position.copy(k.base).addScaledVector(k.exv, s); if (k.hasOff) k.obj.position.add(k.off); }
}
function uiPlace(k) {
  k.obj.position.copy(k.base);
  if (k.parent) k.obj.position.addScaledVector(k.exv, k.parent.amt * SPREAD);
  if (k.hasOff) k.obj.position.add(k.off);
}
function setTarget(n, t, delay = 0, dur = DUR) {
  if (!n || !n.asm) return;
  t = clamp(+t || 0, 0, 1);
  if (n.target === t) { if (uiAnim.has(n)) n.delay = Math.min(n.delay, delay); return; }
  const was = n.target;
  n.target = t; n.a0 = n.amt; n.k = 0; n.delay = REDUCED ? 0 : Math.max(0, delay);
  n.dur = REDUCED ? 0.01 : Math.max(0.05, dur * Math.max(0.45, Math.abs(t - n.amt)));
  uiAnim.add(n);
  if (n.innerKids && (was === 0) !== (t === 0)) uiVisDirty = true;
}
function uiSetNow(n, t) { // direct, zonder animatie (schuif en afspelen)
  if (!n.asm) return;
  t = clamp(t, 0, 1);
  if (n.target === t && n.amt === t && !uiAnim.has(n)) return;
  const was = n.target;
  n.target = t; n.amt = t; n.u = t; n.delay = 0; n.k = 1; uiAnim.delete(n);
  placeKids(n);
  if (n.innerKids && (was === 0) !== (t === 0)) uiVisDirty = true;
}
function stepExplode(dt) {
  if (!uiAnim.size) return false;
  for (const n of uiAnim) {
    if (n.delay > 0) { n.delay -= dt; if (n.delay > 0) continue; }
    n.k = Math.min(1, n.k + dt / n.dur);
    n.amt = n.k >= 1 ? n.target : n.a0 + (n.target - n.a0) * ease(n.k);
    n.u = n.amt;
    placeKids(n);
    if (n.k >= 1) { uiAnim.delete(n); if (n.innerKids && n.target === 0) uiVisDirty = true; }
  }
  return true;
}
/* verschuivingen: optillen (preset) en uitlichten (klik op een onderdeel in een open groep) */
function uiOffTo(n, dur = 0.55, delay = 0) {
  n.off1.copy(n.pull).add(n.liftV);
  if (n.off1.distanceToSquared(n.off) < 1e-14 && !uiOffAnim.has(n)) return;
  n.off0.copy(n.off); n.ok = 0; n.odur = REDUCED ? 0.01 : dur; n.odelay = REDUCED ? 0 : delay; n.hasOff = true;
  uiOffAnim.add(n);
}
function uiStepOff(dt) {
  if (!uiOffAnim.size) return false;
  for (const n of uiOffAnim) {
    if (n.odelay > 0) { n.odelay -= dt; if (n.odelay > 0) continue; }
    n.ok = Math.min(1, n.ok + dt / n.odur);
    if (n.ok >= 1) { n.off.copy(n.off1); uiOffAnim.delete(n); if (n.off.lengthSq() === 0) n.hasOff = false; }
    else n.off.lerpVectors(n.off0, n.off1, ease(n.ok));
    uiPlace(n);
  }
  return true;
}
let LIFTED = null;
function uiLiftDist(n) { return clamp(0.6 * n.rad, 0.02, 0.25); }
function uiLift(n) {
  if (!n || !n.parent) return;
  if (LIFTED && LIFTED !== n) uiDrop();
  const g = n.parent, dir = n.exv.clone();
  if (dir.lengthSq() < 1e-10) {
    ROOT.obj.updateMatrixWorld(true);
    const w = n.obj.localToWorld(n.lc.clone());
    dir.copy(g.obj.worldToLocal(w)).sub(g.lc);
    if (dir.lengthSq() < 1e-10) dir.set(0, 1, 0);
  }
  n.liftV.copy(dir.normalize().multiplyScalar(uiLiftDist(n)));
  LIFTED = n;
  uiOffTo(n, 0.45);
}
function uiDrop() {
  if (!LIFTED) return;
  LIFTED.liftV.set(0, 0, 0); uiOffTo(LIFTED, 0.35);
  LIFTED = null;
}
function subtree(n, out = []) { out.push(n); n.kids.forEach(k => subtree(k, out)); return out; }
function explodeAllUnder(n) { subtree(n).forEach(a => { if (a.asm) setTarget(a, 1, (a.depth - n.depth) * (REDUCED ? 0 : 0.32)); }); }
function collapseTree(n) {
  const list = subtree(n).filter(a => a.asm);
  const md = Math.max(...list.map(a => a.depth));
  list.forEach(a => setTarget(a, 0, (md - a.depth) * (REDUCED ? 0 : 0.1)));
  if (LIFTED && isUnder(LIFTED, n)) uiDrop();
}
function collapseAll() { collapseTree(ROOT); }
function ancestors(n) { const a = []; for (let p = n.parent; p; p = p.parent) a.unshift(p); return a; }
function isUnder(n, a) { for (let p = n; p; p = p.parent) if (p === a) return true; return false; }

/* ---------- zichtbaarheid en materialen ---------- */
let ISO = [];
let XRAY = false, SYSCOL = false, SEL = null;
const uiPickable = [];
let uiPickVer = 0;
function uiInScope(a) { return !ISO.length || ISO.some(r => isUnder(a, r)); }
// Ingesloten onderdelen (inner) zijn niet te zien zolang hun oudergroep dicht is; dan tekenen we ze niet.
// Staat de ouder zelf buiten de isolatie (je isoleert het ingesloten deel), dan is er niets dat het verbergt.
function uiInnerHidden(n) { const p = n.parent; return !!(n.inner && p && p.target === 0 && p.amt < 1e-4 && uiInScope(p)); }
function applyVisibility() {
  const onPath = new Set();
  for (const r of ISO) for (let a = r.parent; a; a = a.parent) onPath.add(a);
  uiPickable.length = 0;
  (function walk(n, inside, pv) {
    const ins = inside || !ISO.length || ISO.includes(n);
    const own = (ins || onPath.has(n)) && !uiInnerHidden(n);
    n.obj.visible = own; n.vis = own; n.ev = pv && own;
    if (!n.asm) { if (n.ev && ins) uiPickable.push(n.obj); return; }
    for (const k of n.kids) walk(k, ins, n.ev);
  })(ROOT, false, true);
  uiVisDirty = false; uiPickVer++;
}
// Markering door de kleur zelf te verschuiven (een optelsom met emissive verdwijnt op glanzend, licht metaal:
// gemeten 218 -> 222 in rood op de lak). Minder metaal en minder reflectie, zodat de tint ook op de lak leesbaar is.
function uiTint(base, hex, k) {
  const m = base.clone(), c = new THREE.Color(hex);
  if (m.color) m.color.lerp(c, k);
  m.emissive = c.clone(); m.emissiveIntensity = 0.28;
  if (m.metalness != null) m.metalness = Math.min(m.metalness, 0.15);
  if (m.roughness != null) m.roughness = Math.max(m.roughness, 0.5);
  if (m.envMapIntensity != null) m.envMapIntensity = Math.min(m.envMapIntensity, 1) * 0.45;
  if (m.clearcoat) m.clearcoat = 0.15;
  if (m.transparent) m.opacity = Math.max(m.opacity, 0.55);
  return m;
}
const uiHV = new Map(), uiSL = new Map();
function uiHvMat(base) { let m = uiHV.get(base); if (!m) { m = uiTint(base, 0x3d8cff, 0.7); uiHV.set(base, m); } return m; }
function uiSelMat(base) { let m = uiSL.get(base); if (!m) { m = uiTint(base, 0xf2c230, 0.75); uiSL.set(base, m); } return m; }
const uiGhostHv = new THREE.MeshStandardMaterial({ color: 0x5aa0ff, emissive: 0x2f86ff, emissiveIntensity: 0.3, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
let uiSelSet = new Set(), uiHovSet = new Set(), uiHovNode = null;
function uiMatFor(m) {
  const n = m.userData.node;
  let mat = m.userData.base;
  if (SYSCOL && n.sys) mat = SYS_MATS[n.sys] || mat;
  const ghost = XRAY && n.isBody;
  if (ghost) mat = GHOST;
  if (uiSelSet.has(m)) return ghost ? GHOST_HL : uiSelMat(mat);
  if (uiHovSet.has(m)) return ghost ? uiGhostHv : uiHvMat(mat);
  return mat;
}
function applyMats() {
  const showHl = SEL && SEL !== ROOT && !ISO.includes(SEL) && (!SEL.asm || SEL.target <= 0.5);
  uiSelSet = showHl ? new Set(SEL.meshes) : new Set();
  for (const m of MESHES) m.material = uiMatFor(m);
}
// Aanwijs-markering: alleen de meshes die veranderen krijgen een ander materiaal.
function uiSetHover(n) {
  if (n === uiHovNode) return false;
  uiHovNode = n;
  const next = new Set(n && n !== ROOT ? n.meshes : []);
  const changed = [];
  for (const m of uiHovSet) if (!next.has(m)) changed.push(m);
  for (const m of next) if (!uiHovSet.has(m)) changed.push(m);
  uiHovSet = next;
  for (const m of changed) m.material = uiMatFor(m);
  return changed.length > 0;
}

/* ---------- camera ---------- */
const VIEW = { l: 0, r: 0, t: 0, b: 0 };
let W = 1, H = 1;
const DIRS = { iso: V3(1, 0.42, 1.08), front: V3(0.12, 0.22, 1), rear: V3(-0.15, 0.3, -1), side: V3(1, 0.1, 0.02), top: V3(0.0001, 1, 0.12), under: V3(0.25, -1, 0.15), isoRear: V3(-1, 0.45, -1) };
let uiSpreadEnd = 1;
// Eindstand voorspellen: posities na afloop van alle lopende animaties, met de zichtbaarheid van de eindstand.
function uiPredHidden(n) { const p = n.parent; return !!(n.inner && p && p.target === 0 && uiInScope(p)); }
function uiWithFinal(fn) {
  for (const n of ALL) if (n.parent) {
    (n._p || (n._p = V3(0, 0, 0))).copy(n.obj.position);
    n.obj.position.copy(n.base).addScaledVector(n.exv, n.parent.target * uiSpreadEnd).add(n.pull).add(n.liftV);
  }
  ROOT.obj.updateMatrixWorld(true);
  try { return fn(); } finally {
    for (const n of ALL) if (n.parent) n.obj.position.copy(n._p);
    ROOT.obj.updateMatrixWorld(true);
  }
}
const uiCorner = V3(0, 0, 0);
// Hoekpunten van de begrenzende dozen van alle zichtbare meshes (in de eindstand) als puntenwolk.
function uiCollect(nodes, final = true, out = []) {
  const go = () => {
    const walk = n => {
      if (final ? uiPredHidden(n) : !n.ev) return;
      if (!n.asm) {
        if (final && ISO.length && !uiInScope(n)) return;
        const g = n.obj.geometry; if (!g.boundingBox) g.computeBoundingBox();
        const b = g.boundingBox, mw = n.obj.matrixWorld;
        for (let i = 0; i < 8; i++) {
          uiCorner.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(mw);
          out.push(uiCorner.x, uiCorner.y, uiCorner.z);
        }
        return;
      }
      n.kids.forEach(walk);
    };
    nodes.forEach(walk);
    return out;
  };
  return final ? uiWithFinal(go) : (ROOT.obj.updateMatrixWorld(true), go());
}
function predictedBox(nodes) {
  const pts = uiCollect(nodes, true), box = new THREE.Box3();
  for (let i = 0; i < pts.length; i += 3) box.expandByPoint(uiCorner.set(pts[i], pts[i + 1], pts[i + 2]));
  return box;
}
let camAnim = null;
// Camera inpassen op een puntenwolk zodat alles binnen het vrije beeld valt (tussen paneel, dock en titel).
function uiFitPoints(pts, dir, pad = 1.08, opt = {}) {
  if (!pts.length) return null;
  const back = (dir ? dir.clone() : camera.position.clone().sub(controls.target)).normalize();
  const upW = Math.abs(back.y) > 0.985 ? V3(0, 0, back.y > 0 ? -1 : 1) : V3(0, 1, 0);
  const right = V3(0, 0, 0).crossVectors(upW, back).normalize(), up = V3(0, 0, 0).crossVectors(back, right);
  const box = new THREE.Box3();
  for (let i = 0; i < pts.length; i += 3) box.expandByPoint(uiCorner.set(pts[i], pts[i + 1], pts[i + 2]));
  const c = box.getCenter(V3(0, 0, 0));
  const vf = camera.fov * PI / 180, tv0 = Math.tan(vf / 2), th0 = tv0 * camera.aspect;
  const fw = Math.max(0.25, (W - VIEW.l - VIEW.r) / W), fh = Math.max(0.25, (H - VIEW.t - VIEW.b) / H);
  const tv = tv0 * fh, th = th0 * fw;
  // midden in beeldvlak (orthografisch), daarna afstand en een correctie voor perspectief
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const P = uiCorner;
  for (let i = 0; i < pts.length; i += 3) {
    P.set(pts[i] - c.x, pts[i + 1] - c.y, pts[i + 2] - c.z);
    const x = P.dot(right), y = P.dot(up); if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  c.addScaledVector(right, (x0 + x1) / 2).addScaledVector(up, (y0 + y1) / 2);
  let d = 0.2;
  const dist = () => {
    let dd = 0.2;
    for (let i = 0; i < pts.length; i += 3) {
      P.set(pts[i] - c.x, pts[i + 1] - c.y, pts[i + 2] - c.z);
      const x = P.dot(right), y = P.dot(up), z = P.dot(back);
      dd = Math.max(dd, Math.abs(x) * pad / th + z, Math.abs(y) * pad / tv + z);
    }
    return dd;
  };
  d = dist();
  for (let it = 0; it < 2; it++) { // herschik het midden op de geprojecteerde randen
    let u0 = Infinity, u1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (let i = 0; i < pts.length; i += 3) {
      P.set(pts[i] - c.x, pts[i + 1] - c.y, pts[i + 2] - c.z);
      const z = d - P.dot(back); if (z <= 0.01) continue;
      const u = P.dot(right) / z, w = P.dot(up) / z;
      if (u < u0) u0 = u; if (u > u1) u1 = u; if (w < w0) w0 = w; if (w > w1) w1 = w;
    }
    if (!Number.isFinite(u0)) break;
    c.addScaledVector(right, (u0 + u1) / 2 * d).addScaledVector(up, (w0 + w1) / 2 * d);
    d = dist();
  }
  if (opt.min) d = Math.max(d, opt.min * 0.5 / Math.min(th, tv) * pad);
  d = clamp(d, controls.minDistance * 1.2, controls.maxDistance * 0.95);
  return { pos: c.clone().add(back.multiplyScalar(d)), target: c };
}
function fitBox(box, dir, pad = 1.06, opt = {}) {
  if (!box || box.isEmpty()) return;
  const pts = [];
  for (let i = 0; i < 8; i++) pts.push(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
  const f = uiFitPoints(pts, dir, pad, opt);
  if (f) animCam(f.pos, f.target, opt.dur, opt.delay);
}
const uiSph0 = new THREE.Spherical(), uiSph1 = new THREE.Spherical();
function animCam(pos, target, dur, delay = 0) {
  dur = REDUCED ? 0.01 : (dur || 0.95);
  camAnim = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), t: 0, dur, delay: REDUCED ? 0 : delay, started: false };
  uiUserCam = false;
}
function stepCam(dt) {
  if (!camAnim) return false;
  if (camAnim.delay > 0) { camAnim.delay -= dt; return true; }
  if (!camAnim.started) { camAnim.p0.copy(camera.position); camAnim.t0.copy(controls.target); camAnim.started = true; }
  camAnim.t = Math.min(1, camAnim.t + dt / camAnim.dur);
  const k = ease(camAnim.t);
  // bolcoördinaten (azimut en hoogte over de kortste hoek) voor een vloeiende baan zonder salto over de top
  uiSph0.setFromVector3(_v.copy(camAnim.p0).sub(camAnim.t0));
  uiSph1.setFromVector3(_v.copy(camAnim.p1).sub(camAnim.t1));
  let dth = uiSph1.theta - uiSph0.theta; if (dth > PI) dth -= 2 * PI; if (dth < -PI) dth += 2 * PI;
  const r = Math.exp(lerp(Math.log(Math.max(1e-4, uiSph0.radius)), Math.log(Math.max(1e-4, uiSph1.radius)), k));
  _v.setFromSphericalCoords(r, lerp(uiSph0.phi, uiSph1.phi, k), uiSph0.theta + dth * k);
  controls.target.lerpVectors(camAnim.t0, camAnim.t1, k);
  camera.position.copy(controls.target).add(_v);
  if (camAnim.t >= 1) { camera.position.copy(camAnim.p1); controls.target.copy(camAnim.t1); camAnim = null; }
  return true;
}
function focusNodes(nodes, dir, pad, opt = {}) {
  const pts = uiCollect(nodes, true);
  if (!pts.length) uiCollect(nodes.map(() => ROOT), true, pts);
  const f = uiFitPoints(pts, dir, pad || 1.08, opt);
  if (f) animCam(f.pos, f.target, opt.dur, opt.delay);
  updateGround();
}
function contextNodes() { return ISO.length ? ISO : [ROOT]; }
let uiUserCam = false; // de gebruiker heeft de camera zelf verplaatst sinds de laatste inpassing

/* ---------- vloer ---------- */
function gridTexture() {
  const cs = getComputedStyle(document.documentElement);
  const g1 = cs.getPropertyValue('--grid').trim() || 'rgba(0,0,0,.08)', g2 = cs.getPropertyValue('--grid-strong').trim() || 'rgba(0,0,0,.16)';
  const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const x = cv.getContext('2d');
  const step = S / 48;
  for (let i = 0; i <= 48; i++) {
    x.strokeStyle = i % 6 === 0 ? g2 : g1; x.lineWidth = i % 6 === 0 ? 2 : 1;
    x.beginPath(); x.moveTo(i * step, 0); x.lineTo(i * step, S); x.stroke();
    x.beginPath(); x.moveTo(0, i * step); x.lineTo(S, i * step); x.stroke();
  }
  x.globalCompositeOperation = 'destination-in';
  const rg = x.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S / 2);
  rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.55, 'rgba(0,0,0,.75)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = rg; x.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return t;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.MeshBasicMaterial({ map: gridTexture(), transparent: true, depthWrite: false, toneMapped: false }));
ground.rotation.x = -HALF; ground.renderOrder = -2;
scene.add(ground);
const shadowCv = document.createElement('canvas'); shadowCv.width = 128; shadowCv.height = 256;
(() => { const x = shadowCv.getContext('2d'); x.save(); x.scale(0.5, 1); const g = x.createRadialGradient(128, 128, 8, 128, 128, 124); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.6, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.restore(); })();
const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCv), transparent: true, depthWrite: false, opacity: 0.85, toneMapped: false }));
blob.rotation.x = -HALF; blob.renderOrder = -1;
scene.add(blob);
let groundTarget = 0;
function updateGround() {
  // gemonteerd staat de auto op de vloer (y = 0); alleen als iets onder de vloer uitklapt zakt de vloer mee
  const b = predictedBox([ROOT]);
  groundTarget = b.isEmpty() || b.min.y > -0.004 ? 0 : b.min.y - 0.03;
}
function stepGround(dt) {
  const y = ground.position.y;
  const fade = 1 - Math.min(1, ROOT.amt) * 0.85;
  blob.material.opacity = 0.85 * fade;
  blob.visible = !ISO.length;
  if (Math.abs(y - groundTarget) < 1e-4) { blob.position.y = y + 0.002; return false; }
  ground.position.y = lerp(y, groundTarget, Math.min(1, dt * 5));
  if (Math.abs(ground.position.y - groundTarget) < 1e-3) ground.position.y = groundTarget;
  blob.position.y = ground.position.y + 0.002;
  return true;
}

/* ---------- stap terug (geschiedenis) ---------- */
const uiHist = [];
function uiSnap() {
  return {
    t: ASMS.map(n => n.target),
    pull: ALL.filter(n => n.pull.lengthSq() > 0).map(n => [n.id, n.pull.x, n.pull.y, n.pull.z]),
    lift: LIFTED ? LIFTED.id : null,
    iso: ISO.map(n => n.id), xray: XRAY, sys: SYSCOL, spread: SPREAD,
    sel: (SEL || ROOT).id, ctx: CTX ? CTX.id : null, force: uiLabelForce, preset: ACTIVE_PRESET,
    cam: [camera.position.clone(), controls.target.clone()],
  };
}
function uiPush() {
  uiHist.push(uiSnap());
  if (uiHist.length > 50) uiHist.shift();
  if (typeof uiSyncUndo === 'function') uiSyncUndo();
}
function uiRestore(s, instant) {
  ISO = s.iso.map(id => uiById.get(id)).filter(Boolean);
  ASMS.forEach((n, i) => setTarget(n, s.t[i], 0, 0.7));
  for (const n of ALL) if (n.pull.lengthSq() > 0) { n.pull.set(0, 0, 0); uiOffTo(n, 0.7); }
  for (const [id, x, y, z] of s.pull) { const n = uiById.get(id); if (n) { n.pull.set(x, y, z); uiOffTo(n, 0.7); } }
  uiDrop();
  if (s.lift != null) { const n = uiById.get(s.lift); if (n) uiLift(n); }
  XRAY = s.xray; SYSCOL = s.sys;
  if (SPREAD !== s.spread) uiSetSpread(s.spread, true);
  CTX = s.ctx != null ? uiById.get(s.ctx) : null; uiLabelForce = !!s.force;
  uiVisDirty = true; applyVisibility();
  SEL = uiById.get(s.sel) || ROOT;
  animCam(s.cam[0], s.cam[1], 0.8);
  updateGround();
  if (instant) finishAll();
  ACTIVE_PRESET = s.preset || null;
}
function uiUndo() {
  const s = uiHist.pop();
  if (!s) return false;
  uiRestore(s);
  if (typeof uiAfterUndo === 'function') uiAfterUndo();
  return true;
}
function uiSetSpread(v, rerender) {
  SPREAD = v; uiSpreadEnd = v;
  for (const n of ASMS) if (n.amt > 0) placeKids(n);
  if (rerender) updateGround();
}

/* ===================== opbouw en explosielogica ===================== */
const ROOT = buildCar();
scene.add(ROOT.obj);
const ALL = [], ASMS = [];
(function walk(n, d) { n.depth = d; ALL.push(n); if (n.asm) ASMS.push(n); n.kids.forEach(k => walk(k, d + 1)); })(ROOT, 0);
const MESHES = [];
ROOT.obj.traverse(o => { if (o.isMesh) MESHES.push(o); });
const MAXDEPTH = Math.max(...ALL.map(n => n.depth));
const SYS_COLORS = { 'Carrosserie': 0x7d93b4, 'Interieur': 0xcaa77a, 'Aandrijflijn': 0xe0782f, 'Koeling en luchtinlaat': 0x2fa6a0, 'Vooras en stuurinrichting': 0x8a64c8, 'Achteras': 0xb062b0, 'Wiel': 0x5b6168, 'Remsysteem': 0xd0443e, 'Uitlaatsysteem': 0x9a6b4b, 'Brandstofsysteem': 0x58a24d, 'Elektrisch systeem': 0xe5c23a };
const SYS_MATS = {};
for (const [k, c] of Object.entries(SYS_COLORS)) SYS_MATS[k] = new THREE.MeshStandardMaterial({ color: c, metalness: 0.15, roughness: 0.55, side: THREE.DoubleSide });
function sysKey(name) { return name.startsWith('Wiel ') ? 'Wiel' : name; }
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
  n.sys = top === ROOT ? null : sysKey(top.name);
  n.isBody = top.name === 'Carrosserie';
  _box.setFromObject(n.obj);
  const c = _box.getCenter(V3(0, 0, 0));
  n.rad = Math.max(0.01, _box.getSize(_v).length() / 2);
  n.wc = c.clone();
  n.lc = n.obj.worldToLocal(c.clone());
  n.meshes = [];
  n.obj.traverse(o => { if (o.isMesh) n.meshes.push(o); });
}
for (const n of ALL) {
  if (!n.parent) continue;
  const p = n.parent;
  if (n.ex) { n.exv.copy(n.ex); continue; }
  const pc = p.obj.worldToLocal(p.wc.clone()), cc = p.obj.worldToLocal(n.wc.clone());
  const dir = cc.sub(pc);
  if (dir.length() < 1e-3) dir.set(0, 1, 0);
  const dist = Math.max(0.04, p.exs * (0.35 * p.rad + 0.5 * n.rad));
  n.exv.copy(dir.normalize().multiplyScalar(dist));
}
let SPREAD = 1;
const DUR = REDUCED ? 0.01 : 0.85;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function placeKids(n) { for (const k of n.kids) k.obj.position.copy(k.base).addScaledVector(k.exv, n.amt * SPREAD); }
function setTarget(n, t, delay = 0) { if (!n.asm) return; if (n.target !== t) { n.target = t; n.delay = delay; } else if (n.u !== t) n.delay = Math.min(n.delay, delay); }
function stepExplode(dt) {
  let active = false;
  for (const n of ASMS) {
    if (n.u === n.target) continue;
    active = true;
    if (n.delay > 0) { n.delay -= dt; continue; }
    const sp = dt / DUR;
    n.u = n.target > n.u ? Math.min(n.target, n.u + sp) : Math.max(n.target, n.u - sp);
    n.amt = ease(n.u);
    placeKids(n);
  }
  return active;
}
function subtree(n, out = []) { out.push(n); n.kids.forEach(k => subtree(k, out)); return out; }
function explodeAllUnder(n) { subtree(n).forEach(a => { if (a.asm) setTarget(a, 1, (a.depth - n.depth) * (REDUCED ? 0 : 0.32)); }); }
function collapseTree(n) { const list = subtree(n).filter(a => a.asm); const md = Math.max(...list.map(a => a.depth)); list.forEach(a => setTarget(a, 0, (md - a.depth) * (REDUCED ? 0 : 0.12))); }
function collapseAll() { collapseTree(ROOT); }
function ancestors(n) { const a = []; for (let p = n.parent; p; p = p.parent) a.unshift(p); return a; }
function isUnder(n, a) { for (let p = n; p; p = p.parent) if (p === a) return true; return false; }

/* ---------- zichtbaarheid en materialen ---------- */
let ISO = [];
let XRAY = false, SYSCOL = false, SEL = null;
function applyVisibility() {
  for (const m of MESHES) { const n = m.userData.node; m.visible = !ISO.length || ISO.some(a => isUnder(n, a)); }
}
function applyMats() {
  const showHl = SEL && SEL !== ROOT && !ISO.includes(SEL) && (!SEL.asm || !SEL.target);
  const selSet = showHl ? new Set(SEL.meshes) : null;
  for (const m of MESHES) {
    const n = m.userData.node;
    let mat = m.userData.base;
    if (SYSCOL && n.sys) mat = SYS_MATS[n.sys] || mat;
    const ghost = XRAY && n.isBody;
    if (ghost) mat = GHOST;
    if (selSet && selSet.has(m)) mat = ghost ? GHOST_HL : hlMat(mat);
    m.material = mat;
  }
}

/* ---------- camera ---------- */
const VIEW = { l: 0, r: 0, t: 0, b: 0 };
let W = 1, H = 1;
const DIRS = { iso: V3(1, 0.42, 1.08), front: V3(0.12, 0.22, 1), rear: V3(-0.15, 0.3, -1), side: V3(1, 0.1, 0.02), top: V3(0.0001, 1, 0.12), under: V3(0.25, -1, 0.15), isoRear: V3(-1, 0.45, -1) };
function predictedBox(nodes) {
  for (const n of ALL) if (n.parent) { n._p = n._p || V3(0, 0, 0); n._p.copy(n.obj.position); n.obj.position.copy(n.base).addScaledVector(n.exv, n.parent.target * SPREAD); }
  ROOT.obj.updateMatrixWorld(true);
  const box = new THREE.Box3();
  for (const n of nodes) for (const m of n.meshes) if (m.visible) box.expandByObject(m);
  for (const n of ALL) if (n.parent) n.obj.position.copy(n._p);
  ROOT.obj.updateMatrixWorld(true);
  return box;
}
let camAnim = null;
function fitBox(box, dir, pad = 1.06) {
  if (box.isEmpty()) return;
  const back = (dir ? dir.clone() : camera.position.clone().sub(controls.target)).normalize();
  const upW = Math.abs(back.y) > 0.985 ? V3(0, 0, back.y > 0 ? -1 : 1) : V3(0, 1, 0);
  const right = V3(0, 0, 0).crossVectors(upW, back).normalize(), up = V3(0, 0, 0).crossVectors(back, right);
  const c = box.getCenter(V3(0, 0, 0));
  const vf = camera.fov * PI / 180, tv0 = Math.tan(vf / 2), th0 = tv0 * camera.aspect;
  const fw = Math.max(0.3, (W - VIEW.l - VIEW.r) / W), fh = Math.max(0.3, (H - VIEW.t - VIEW.b) / H);
  const tv = tv0 * fh, th = th0 * fw;
  let d = 0.2;
  for (let i = 0; i < 8; i++) {
    const p = V3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(c);
    const x = p.dot(right), y = p.dot(up), z = p.dot(back);
    d = Math.max(d, Math.abs(x) * pad / th + z, Math.abs(y) * pad / tv + z);
  }
  d = clamp(d, controls.minDistance * 1.2, controls.maxDistance * 0.95);
  animCam(c.clone().add(back.multiplyScalar(d)), c);
}
function animCam(pos, target, dur = REDUCED ? 0.01 : 0.95) {
  camAnim = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, t: 0, dur };
}
function stepCam(dt) {
  if (!camAnim) return false;
  camAnim.t = Math.min(1, camAnim.t + dt / camAnim.dur);
  const k = ease(camAnim.t);
  // interpoleer richting en afstand apart voor een vloeiende baan
  const o0 = camAnim.p0.clone().sub(camAnim.t0), o1 = camAnim.p1.clone().sub(camAnim.t1);
  const l0 = o0.length(), l1 = o1.length();
  const dir = o0.normalize().lerp(o1.normalize(), k).normalize();
  controls.target.lerpVectors(camAnim.t0, camAnim.t1, k);
  camera.position.copy(controls.target).addScaledVector(dir, lerp(l0, l1, k));
  if (camAnim.t >= 1) camAnim = null;
  return true;
}
function focusNodes(nodes, dir, pad) { fitBox(predictedBox(nodes), dir, pad); updateGround(); }
function contextNodes() { return ISO.length ? ISO : [ROOT]; }

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
const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshBasicMaterial({ map: gridTexture(), transparent: true, depthWrite: false, toneMapped: false }));
ground.rotation.x = -HALF; ground.renderOrder = -2;
scene.add(ground);
const shadowCv = document.createElement('canvas'); shadowCv.width = 128; shadowCv.height = 256;
(() => { const x = shadowCv.getContext('2d'); x.save(); x.scale(0.5, 1); const g = x.createRadialGradient(128, 128, 8, 128, 128, 124); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.6, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.restore(); })();
const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCv), transparent: true, depthWrite: false, opacity: 0.85, toneMapped: false }));
blob.rotation.x = -HALF; blob.renderOrder = -1;
scene.add(blob);
let groundTarget = 0;
function updateGround() {
  const b = predictedBox([ROOT]);
  groundTarget = b.isEmpty() ? 0 : Math.min(0, b.min.y - 0.03);
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

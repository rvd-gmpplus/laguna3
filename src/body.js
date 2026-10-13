/* ===================== carrosserie: parametrisch oppervlak ===================== */
// assen: x = links(+)/rechts(-), y = omhoog, z = voor(+)/achter(-); maten in meter
const ZF = 2.345, ZR = -2.35;                       // lengte 4695 mm
const AXF = 1.365, AXR = -1.391, AY = 0.33;         // wielbasis 2756 mm, bandstraal 225/45 R18
const ARCH = 0.395, TRACK = 0.775;
const TRACK_F = 0.7785, TRACK_R = 0.756;            // halve spoorbreedte voor en achter (1557 en 1512 mm, brochure april 2011)
const WS0 = 1.06, WS1 = 0.32, RW0 = -1.20, SP = -2.16;
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
const HW = pchip([[-2.35, 0.70], [-2.34, 0.76], [-2.32, 0.80], [-2.28, 0.835], [-2.20, 0.862], [-2.0, 0.884], [-1.6, 0.899], [-1.0, 0.905], [0.6, 0.905], [1.4, 0.899], [1.8, 0.888], [2.05, 0.866], [2.2, 0.835], [2.28, 0.80], [2.32, 0.76], [2.338, 0.71], [2.345, 0.66]]);
const YT = pchip([[-2.35, 0.94], [-2.34, 0.97], [-2.32, 0.995], [-2.28, 1.015], [-2.15, 1.035], [-1.8, 1.045], [-1.2, 1.025], [-0.5, 0.995], [0.4, 0.965], [1.10, 0.945], [1.6, 0.885], [2.0, 0.82], [2.18, 0.78], [2.26, 0.745], [2.31, 0.70], [2.335, 0.655], [2.345, 0.62]]);
const YB = pchip([[-2.35, 0.40], [-2.34, 0.36], [-2.32, 0.33], [-2.25, 0.30], [-2.10, 0.275], [-1.85, 0.24], [-1.6, 0.19], [-1.2, 0.17], [1.1, 0.17], [1.6, 0.19], [1.95, 0.215], [2.2, 0.24], [2.30, 0.26], [2.335, 0.29], [2.345, 0.32]]);
const YR = pchip([[-2.16, 1.04], [-1.95, 1.13], [-1.70, 1.235], [-1.45, 1.318], [-1.20, 1.377], [-0.80, 1.425], [-0.30, 1.445], [0.10, 1.432], [0.32, 1.402], [0.55, 1.29], [0.80, 1.14], [0.98, 1.01], [1.06, 0.95]]);
const S1 = 0.14, S2 = 0.22, S3 = 0.60, S4 = 0.72, BUL = 0.016, CRW = 0.028;
const flank = t => BUL * Math.sin(PI * t) + 0.0055 * Math.exp(-Math.pow((t - 0.8) / 0.055, 2)) - 0.004 * Math.exp(-Math.pow((t - 0.16) / 0.08, 2));
function radii(z) { const d = YT(z) - YB(z); return [Math.min(0.075, d * 0.3), Math.min(0.07, d * 0.3)]; }
function halfPt(z, s) {
  const hw = HW(z), yb = YB(z), yt = YT(z), [rb, rs] = radii(z);
  if (s <= S1) return [s / S1 * (hw - rb), yb];
  if (s <= S2) { const a = -HALF + (s - S1) / (S2 - S1) * HALF; return [hw - rb + rb * Math.cos(a), yb + rb + rb * Math.sin(a)]; }
  if (s <= S3) { const t = (s - S2) / (S3 - S2); return [hw + flank(t), yb + rb + t * (yt - rs - yb - rb)]; }
  if (s <= S4) { const a = (s - S3) / (S4 - S3) * HALF; return [hw - rs + rs * Math.cos(a), yt - rs + rs * Math.sin(a)]; }
  const t = (s - S4) / (1 - S4); return [(hw - rs) * (1 - t), yt + CRW * t * (2 - t)];
}
function lowPt(z, p) {
  const q = ((p % 2) + 2) % 2;
  if (q <= 1) { const [x, y] = halfPt(z, q); return [x, y, z]; }
  const [x, y] = halfPt(z, 2 - q); return [-x, y, z];
}
function sAtY(z, y) {
  const yb = YB(z), yt = YT(z), [rb, rs] = radii(z), y0 = yb + rb, y1 = yt - rs;
  if (y <= y0) { const a = Math.asin(clamp((y - y0) / rb, -1, 0)); return S1 + (a + HALF) / HALF * (S2 - S1); }
  if (y >= y1) { const a = Math.asin(clamp((y - y1) / rs, 0, 1)); return S3 + a / HALF * (S4 - S3); }
  return S2 + (y - y0) / (y1 - y0) * (S3 - S2);
}
function surfX(z, y) { return halfPt(z, sAtY(z, y))[0]; }
function archS(z) {
  for (const az of [AXF, AXR]) { const dz = z - az; if (Math.abs(dz) <= ARCH) return sAtY(z, AY + Math.sqrt(ARCH * ARCH - dz * dz)); }
  return 0;
}
const inArch = z => Math.abs(z - AXF) < ARCH + 0.01 || Math.abs(z - AXR) < ARCH + 0.01;
const ARCH_BREAKS = [AXF - ARCH - 0.001, AXF - ARCH, AXF + ARCH, AXF + ARCH + 0.001, AXR - ARCH - 0.001, AXR - ARCH, AXR + ARCH, AXR + ARCH + 0.001];
function ghPt(z, w) {
  const sd = w <= 0.5 ? 1 : -1, q = w <= 0.5 ? 2 * w : 2 - 2 * w;
  const [, rs] = radii(z), xb = HW(z) - rs, yb = YT(z), yr = Math.max(yb, YR(z)), h = yr - yb;
  const rr = Math.min(0.065, h * 0.35), yst = yb + Math.max(0, h - rr), xst = xb - 0.30 * (yst - yb), xre = xst - rr * 0.85, cr = 0.02 * Math.min(1, h / 0.2);
  let x, y;
  if (q <= 0.54) { const t = q / 0.54; x = xb + (xst - xb) * t; y = yb + (yst - yb) * t; }
  else if (q <= 0.72) { const a = (q - 0.54) / 0.18 * HALF; x = xre + (xst - xre) * Math.cos(a); y = yst + (yr - yst) * Math.sin(a); }
  else { const t = (q - 0.72) / 0.28; x = xre * (1 - t); y = yr + cr * t * (2 - t); }
  return [sd * x, y, z];
}
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
const sideR = (s, a, b) => (s > 0 ? [a, b] : [2 - b, 2 - a]);
const sideW = (s, a, b) => (s > 0 ? [a, b] : [1 - b, 1 - a]);
function offsetFn(fn, s, dx, dy = 0, dz = 0) { return (u, v) => { const p = fn(u, v); return [p[0] - s * dx, p[1] + dy, p[2] + dz]; }; }
function lowSide(s, z0, z1, nu, vr, nv, breaks, off) {
  const fn = off ? offsetFn(lowPt, s, off) : lowPt;
  return patch(fn, z0, z1, nu, z => sideR(s, ...vr(z)), nv, breaks);
}
function ghSide(s, z0, z1, nu, w0, w1, nv, off) {
  const fn = off ? offsetFn(ghPt, s, off) : ghPt;
  return patch(fn, z0, z1, nu, () => sideW(s, w0, w1), nv);
}
// eindvlak (voor/achter): rooster over hoogte y, breedte volgt de doorsnede
function ringX(z, y) {
  const hw = HW(z), yb = YB(z), yt = YT(z), [rb, rs] = radii(z);
  if (y <= yb + rb) { const a = Math.asin(clamp((y - yb - rb) / rb, -1, 0)); return hw - rb + rb * Math.cos(a); }
  if (y <= yt - rs) { const t = (y - yb - rb) / (yt - rs - yb - rb); return hw + flank(t); }
  if (y <= yt) { const a = Math.asin(clamp((y - yt + rs) / rs, 0, 1)); return hw - rs + rs * Math.cos(a); }
  const t = 1 - Math.sqrt(Math.max(0, 1 - (y - yt) / CRW)); return (hw - rs) * (1 - t);
}
function faceZ(zEnd, dir, x, y) {
  const y0 = YB(zEnd), y1 = YT(zEnd) + CRW, X = Math.max(1e-4, ringX(zEnd, y));
  const v = clamp((y - y0) / (y1 - y0), 0, 1), e = Math.max(0, 1 - (x / X) * (x / X));
  const bulge = dir > 0 ? 0.085 : 0.05, recess = dir > 0 ? 0.05 : 0.035;
  return zEnd + dir * e * (bulge * Math.sin(PI * Math.min(1, v * 1.15)) - recess * v * v);
}
function faceGeo(zEnd, dir, yLo, yHi, ny = 18, nx = 28) {
  const y0 = Math.max(yLo, YB(zEnd)), y1 = Math.min(yHi, YT(zEnd) + CRW - 1e-4);
  return patch((y, t) => { const X = ringX(zEnd, y), x = X * t; return [x, y, faceZ(zEnd, dir, x, y)]; }, y0, y1, ny, () => [-1, 1], nx);
}
function facePatch(zEnd, dir, x0, x1, y0, y1, off, ny = 6, nx = 24) {
  return patch((y, t) => { const X = ringX(zEnd, y), xa = Math.max(-X, x0), xb = Math.min(X, x1), x = xa + (xb - xa) * t; return [x, y, faceZ(zEnd, dir, x, y) + dir * off]; }, y0, y1, ny, () => [0, 1], nx);
}
// koplamp/achterlicht-zones
const hlLow = z => sAtY(z, YT(z) - 0.2 * Math.sqrt(clamp((z - 1.86) / 0.42, 0, 1)));
const tlLow = z => sAtY(z, YT(z) - 0.165 * Math.sqrt(clamp((-1.98 - z) / 0.33, 0, 1)));
const inHL = z => z >= 1.86 && z <= 2.338;
const inTL = z => z <= -1.98 && z >= -2.338;
// punt op de buitenhuid (voor onderdelen die erop zitten)
function skin(z, y, s, out = 0) { const x = surfX(z, y); return [s * (x + out), y, z]; }

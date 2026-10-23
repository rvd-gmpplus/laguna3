// Kierenaudit (tools/kieren.py): het meetwerk in de pagina. Wordt als functie-expressie geëvalueerd met één argument cfg
// (stap, diep, zijde, opbouw, verzonken, ruiten, naadvulling, lmax; zie kieren.py). De lijsten met patronen komen uit
// tools/kieren_allow.json; dit bestand kent geen onderdeelnamen.
//
// Werkwijze: stralen van buiten loodrecht op het analytische carrosserieoppervlak (src/body.js: halfPt en bodGhHalf in
// kolommen op vaste z, frontZ, bodRearZ en tailZ in een raster op x en y) over een raster dat de hele buitenkant dekt, behalve
// de onderkant, de wielbogen en de voet van de A- en C-stijl die het dek in gaat. Per straal de eerste treffer en de diepte ten
// opzichte van het analytische oppervlak in millimeter (negatief = erboven). Eigen raycaster met een uniform rooster van
// cellen van 2 cm: de three.js-raycaster is voor ruim 150.000 stralen te traag. Alle materialen zijn dubbelzijdig, dus geen
// culling. Opbouwdelen (spiegel, greep, wissers) tellen niet mee; naadvulling (rubber in een naad) telt als kier zonder
// doorkijk.
//
// Elke overgang tussen twee buitendelen langs een rasterlijn (direct of over hooguit lmax kiermonsters) is een kruising. Per
// kruising een fijne scan van 0,4 mm loodrecht op de rasterlijn: kier (tussen de randen), stap (diepteverschil op 0,8 tot
// 2,8 mm van de randen), diepte van de randen zelf, doorkijk (diepste eerste treffer in de kier) en knik (hoek tussen de
// vlaknormalen). Kruisingen worden per paar onderdelen en per plaats samengevoegd tot naden; de kier gaat met de richting
// van de naad terug naar loodrecht. Daarnaast: doorkijkvlakken (kiermonsters die meer dan één rasterstap breed zijn) en
// facetten (monsters van een glad deel die meer dan 1 mm van de mediaan van dat deel afwijken).
(cfg) => {
  const T0 = performance.now(), tijd = {};
  const lap = k => { tijd[k] = Math.round(performance.now() - T0); };
  const L = __model; L.finishAll(); L.ROOT.obj.updateMatrixWorld(true);
  const pad = m => { const p = []; for (let k = m.userData.node; k; k = k.parent) p.unshift(k.name); return p.slice(1).join('/'); };
  const zicht = o => { for (; o; o = o.parent) if (o.visible === false) return false; return true; };
  const rx = a => (a || []).map(s => new RegExp(s));
  const OPB = rx(cfg.opbouw), VERZ = rx(cfg.verzonken), RUIT = rx(cfg.lijmruiten), VUL = rx(cfg.naadvulling), KLEIN = rx(cfg.klein), GEENF = rx(cfg.geenFacet), ZWART = rx(cfg.zwarteRand), AFD = rx(cfg.afdekkers);
  const H = cfg.stap / 1000, R0 = 0.05, FAR = R0 + 0.30, DDIEP = cfg.diep, LMAX = cfg.lmax, DS = 0.0004;

  /* ---------- meshes en driehoeken ---------- */
  const ms = L.MESHES.filter(m => zicht(m));
  const info = ms.map(m => {
    const p = pad(m), mats = Array.isArray(m.material) ? m.material : [m.material], base = m.userData.base || mats[0];
    const tr = mats.every(x => x && x.transparent && x.opacity < 0.95);
    const hx = base && base.color ? base.color.getHexString() : '808080';
    const c = [0, 2, 4].map(i => parseInt(hx.slice(i, i + 2), 16) / 255), lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return { p, tr, lum: +lum.toFixed(3), inner: !!m.userData.node.inner, opb: OPB.some(r => r.test(p)), verz: VERZ.some(r => r.test(p)), ruit: RUIT.some(r => r.test(p)), vul: VUL.some(r => r.test(p)), klein: KLEIN.some(r => r.test(p)), geenF: GEENF.some(r => r.test(p)), zwart: ZWART.some(r => r.test(p)), afd: AFD.some(r => r.test(p)), buiten: true };
  });
  let nt = 0;
  for (const m of ms) { const g = m.geometry; nt += (g.index ? g.index.count : g.attributes.position.count) / 3 | 0; }
  const V = new Float32Array(nt * 9), TM = new Int32Array(nt);
  let ti = 0;
  ms.forEach((m, mi) => {
    const g = m.geometry, pos = g.attributes.position, idx = g.index ? g.index.array : null, e = m.matrixWorld.elements;
    const n = (idx ? idx.length : pos.count) / 3 | 0;
    for (let f = 0; f < n; f++) {
      for (let k = 0; k < 3; k++) {
        const vi = idx ? idx[f * 3 + k] : f * 3 + k, x = pos.getX(vi), y = pos.getY(vi), z = pos.getZ(vi), o = ti * 9 + k * 3;
        V[o] = e[0] * x + e[4] * y + e[8] * z + e[12]; V[o + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; V[o + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      }
      TM[ti++] = mi;
    }
  });
  // uniform rooster over het kader van de auto (cellen van 2 cm); driehoeken buiten het kader doen niet mee
  const C = 0.02, BX0 = -1.15, BY0 = -0.05, BZ0 = -2.6, NX = Math.ceil(2.3 / C), NY = Math.ceil(1.75 / C), NZ = Math.ceil(5.2 / C), NC = NX * NY * NZ;
  const cl = (v, n) => v < 0 ? 0 : v >= n ? n - 1 : v;
  const tb = new Int32Array(nt * 6), cnt = new Int32Array(NC + 1);
  for (let t = 0; t < nt; t++) {
    const o = t * 9, x0 = Math.min(V[o], V[o + 3], V[o + 6]), x1 = Math.max(V[o], V[o + 3], V[o + 6]), y0 = Math.min(V[o + 1], V[o + 4], V[o + 7]), y1 = Math.max(V[o + 1], V[o + 4], V[o + 7]), z0 = Math.min(V[o + 2], V[o + 5], V[o + 8]), z1 = Math.max(V[o + 2], V[o + 5], V[o + 8]);
    const a = [Math.floor((x0 - BX0) / C), Math.floor((x1 - BX0) / C), Math.floor((y0 - BY0) / C), Math.floor((y1 - BY0) / C), Math.floor((z0 - BZ0) / C), Math.floor((z1 - BZ0) / C)];
    if (a[1] < 0 || a[0] >= NX || a[3] < 0 || a[2] >= NY || a[5] < 0 || a[4] >= NZ) { tb[t * 6] = 1; tb[t * 6 + 1] = 0; continue; }
    a[0] = cl(a[0], NX); a[1] = cl(a[1], NX); a[2] = cl(a[2], NY); a[3] = cl(a[3], NY); a[4] = cl(a[4], NZ); a[5] = cl(a[5], NZ);
    for (let k = 0; k < 6; k++) tb[t * 6 + k] = a[k];
    for (let i = a[0]; i <= a[1]; i++) for (let j = a[2]; j <= a[3]; j++) for (let k = a[4]; k <= a[5]; k++) cnt[(k * NY + j) * NX + i + 1]++;
  }
  for (let c = 0; c < NC; c++) cnt[c + 1] += cnt[c];
  const fill = new Int32Array(NC), lst = new Int32Array(cnt[NC]);
  for (let t = 0; t < nt; t++) {
    const a = t * 6; if (tb[a] > tb[a + 1]) continue;
    for (let i = tb[a]; i <= tb[a + 1]; i++) for (let j = tb[a + 2]; j <= tb[a + 3]; j++) for (let k = tb[a + 4]; k <= tb[a + 5]; k++) { const c = (k * NY + j) * NX + i; lst[cnt[c] + fill[c]++] = t; }
  }
  lap('rooster');
  const mail = new Int32Array(nt).fill(-1); let rayId = 0, nRays = 0;
  // straal: HIT = [t eerste treffer, driehoek, t eerste ondoorzichtige treffer, driehoek] (driehoek -1 als er niets is)
  const HIT = new Float64Array(4);
  function cast(ox, oy, oz, dx, dy, dz, tmax) {
    rayId++; nRays++;
    let tA = Infinity, iA = -1, tO = Infinity, iO = -1;
    let cx = Math.floor((ox - BX0) / C), cy = Math.floor((oy - BY0) / C), cz = Math.floor((oz - BZ0) / C);
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    const adx = Math.abs(dx) > 1e-12, ady = Math.abs(dy) > 1e-12, adz = Math.abs(dz) > 1e-12;
    const idx = adx ? C / Math.abs(dx) : Infinity, idy = ady ? C / Math.abs(dy) : Infinity, idz = adz ? C / Math.abs(dz) : Infinity;
    let mx = adx ? ((BX0 + (cx + (sx > 0 ? 1 : 0)) * C) - ox) / dx : Infinity;
    let my = ady ? ((BY0 + (cy + (sy > 0 ? 1 : 0)) * C) - oy) / dy : Infinity;
    let mz = adz ? ((BZ0 + (cz + (sz > 0 ? 1 : 0)) * C) - oz) / dz : Infinity;
    let tc = 0;
    while (tc <= tmax) {
      if (cx >= 0 && cx < NX && cy >= 0 && cy < NY && cz >= 0 && cz < NZ) {
        const c = (cz * NY + cy) * NX + cx;
        for (let q = cnt[c], qe = cnt[c + 1]; q < qe; q++) {
          const t = lst[q]; if (mail[t] === rayId) continue; mail[t] = rayId;
          const o = t * 9, ax = V[o], ay = V[o + 1], az = V[o + 2];
          const e1x = V[o + 3] - ax, e1y = V[o + 4] - ay, e1z = V[o + 5] - az, e2x = V[o + 6] - ax, e2y = V[o + 7] - ay, e2z = V[o + 8] - az;
          const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
          if (det > -1e-14 && det < 1e-14) continue;
          const inv = 1 / det, tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) * inv;
          if (u < 0 || u > 1) continue;
          const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) * inv;
          if (v < 0 || u + v > 1) continue;
          const tt = (e2x * qx + e2y * qy + e2z * qz) * inv;
          if (tt <= 1e-6 || tt > tmax) continue;
          if (tt < tA) { tA = tt; iA = t; }
          if (tt < tO && !info[TM[t]].tr) { tO = tt; iO = t; }
        }
      }
      const tn = Math.min(mx, my, mz);
      if (tO <= tn) break;
      tc = tn;
      if (mx === tn) { cx += sx; mx += idx; } else if (my === tn) { cy += sy; my += idy; } else { cz += sz; mz += idz; }
    }
    HIT[0] = tA; HIT[1] = iA; HIT[2] = tO; HIT[3] = iO;
    return HIT;
  }
  const triN = t => { const o = t * 9, e1 = [V[o + 3] - V[o], V[o + 4] - V[o + 1], V[o + 5] - V[o + 2]], e2 = [V[o + 6] - V[o], V[o + 7] - V[o + 1], V[o + 8] - V[o + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], l = Math.hypot(...n) || 1; return [n[0] / l, n[1] / l, n[2] / l]; };
  // klasse van een treffer: deel (meshindex >= 0), -3 opbouw, -4 kier of doorkijk, -5 naadvulling
  // buiten = false: een deel dat het raster minder dan cfg.minBuiten keer aan de huid raakt (een slang of bekleding die door een kier
  // te zien is); het telt dan als kier, behalve als het in de lijst klein staat
  const klasse = (m, d) => { if (m < 0) return -4; const I = info[m]; if (I.opb) return -3; if (I.vul) return -5; if (I.inner || (d > DDIEP && !I.verz) || !I.buiten) return -4; return m; };

  /* ---------- het analytische oppervlak ---------- */
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const outward = (n, P) => (n[0] * P[0] + n[1] * (P[1] - 0.65) < 0 ? [-n[0], -n[1], -n[2]] : n);
  const sec = (z, kind, u) => kind === 0 ? halfPt(z, u) : bodGhHalf(z, u);
  const E = 1e-4;
  // zijoppervlak: kind 0 = onderbak (u = s), kind 1 = kas (u = q); geeft [P, n]
  function zijPt(sg, kind, z, u) {
    u = clamp(u, 0, 1);
    const p = sec(z, kind, u), P = [sg * p[0], p[1], z];
    const pz1 = sec(z + E, kind, u), pz0 = sec(z - E, kind, u), pu1 = sec(z, kind, Math.min(1, u + E)), pu0 = sec(z, kind, Math.max(0, u - E));
    const n = outward(norm(cross([sg * (pz1[0] - pz0[0]), pz1[1] - pz0[1], 2 * E], [sg * (pu1[0] - pu0[0]), pu1[1] - pu0[1], 0])), P);
    return [P, n];
  }
  // voor- en achtervlak als hoogteveld z(x, y); null buiten het vlak
  // binnen de doorsnede op z, met de verlaging van de motorkap (bodInside kent die niet)
  function binnenV(z, x, y) {
    const c = bodSec(z); if (y < c.yb) return false;
    if (y <= c.yt) return Math.abs(x) <= ringX(z, y);
    if (Math.abs(x) > c.xe0) return false;
    const t = 1 - Math.abs(x) / c.xe0;
    return y <= c.yt + (c.c - bodHoodDrop(z)) * (1 - Math.pow(1 - t, c.p)) + bodCrease(z, x);
  }
  function voorZ(x, y) {
    let lo = 1.6, hi = ZF;
    if (!binnenV(lo, x, y)) return null;
    if (binnenV(hi, x, y)) return hi;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (binnenV(m, x, y)) lo = m; else hi = m; }
    return lo;
  }
  function vlakZ(voor, x, y) {
    if (voor) return voorZ(x, y);
    if (y <= bodYLEDGE) return bodInside(-1.9, x, y) ? bodRearZ(x, y) : null;
    if (y <= bodSec(bodZT).yd && Math.abs(x) <= ringX(bodZT, y)) return tailZ(x, y);
    return null;
  }
  function vlakPt(voor, x, y) {
    const z = vlakZ(voor, x, y); if (z === null) return null;
    const e = 1e-3, a = vlakZ(voor, x + e, y), b = vlakZ(voor, x - e, y), c = vlakZ(voor, x, y + e), d = vlakZ(voor, x, y - e);
    if (a === null || b === null || c === null || d === null) return null;
    const zx = (a - b) / (2 * e), zy = (c - d) / (2 * e);
    return [[x, y, z], voor ? norm([-zx, -zy, 1]) : norm([zx, zy, -1])];
  }

  /* ---------- raster ---------- */
  // monster: P, n, raster g, index (k, j), skip (1 wielboog, 2 ander raster, 3 onder het staartvlak, 4 buiten), parameter
  const SM = [], GR = [];
  const zijden = cfg.zijde === 'beide' ? [1, -1] : cfg.zijde === 'links' ? [1] : [-1];
  for (const sg of zijden) {
    // zijraster: kolommen op vaste z, rijen op booglengte langs de doorsnede (onderbak vanaf S2, dan kas of dek)
    const g = { id: GR.length, soort: 'zij', zijde: sg, kol: [] };
    GR.push(g);
    const z0 = ZR + 0.004, nk = Math.floor((ZF - 0.004 - z0) / H);
    for (let k = 0; k <= nk; k++) {
      const z = z0 + k * H, kas = z >= SP && z <= WS0;
      // golf 8 ronde 3: de kas begint op de C-stijlschouder bij bodCFsA (body.js, golf 8 ronde 2), niet meer overal bij S4. De onderbak
      // tot S4 rasteren legde monsters op de oude hoek, waar de huid nu de holle afronding volgt (schijnfacet van 10 mm in de C-stijl)
      const sKas = typeof bodCFsA === 'function' ? bodCFsA(z) : S4;
      const segs = kas ? [[0, S2, sKas], [1, 0, 1]] : [[0, S2, 1]];
      const dense = [];
      for (const [kind, a, b] of segs) for (let i = 0; i <= 300; i++) { const u = a + (b - a) * i / 300, p = sec(z, kind, u); dense.push([kind, u, p[0], p[1]]); }
      let acc = 0; const cum = [0];
      for (let i = 1; i < dense.length; i++) { acc += dense[i][0] === dense[i - 1][0] ? Math.hypot(dense[i][2] - dense[i - 1][2], dense[i][3] - dense[i - 1][3]) : 0; cum.push(acc); }
      const row = []; let i = 0;
      const aIn = inArch(z) ? archS(z) : -1;
      for (let j = 0; j * H <= acc + 1e-9; j++) {
        const t = j * H; while (i < dense.length - 2 && cum[i + 1] < t) i++;
        let A = dense[i], B = dense[i + 1], ca = cum[i], cb = cum[i + 1];
        if (A[0] !== B[0]) { A = B; B = dense[Math.min(i + 2, dense.length - 1)]; ca = cum[i + 1]; cb = cum[Math.min(i + 2, dense.length - 1)]; }
        const f = cb > ca ? clamp((t - ca) / (cb - ca), 0, 1) : 0, kind = A[0], u = A[1] + (B[1] - A[1]) * f;
        const [P, n] = zijPt(sg, kind, z, u);
        let skip = 0;
        if (kind === 0 && aIn >= 0 && u < aIn) skip = 1;
        else if (Math.abs(n[2]) > 0.6) skip = 2;
        else if (z < bodZT && kind === 0 && P[1] > bodYLEDGE - 0.006 && z > tailZ(P[0], Math.max(P[1], bodYLEDGE)) - 0.002) skip = 3;
        row.push(SM.length);
        SM.push({ P, n, g: g.id, k, j, skip, kind, z, u });
      }
      g.kol.push(row);
    }
    // voorvlak en achtervlak: raster in (x, y)
    for (const voor of [true, false]) {
      const g2 = { id: GR.length, soort: voor ? 'voor' : 'achter', zijde: sg, kol: [] };
      GR.push(g2);
      const nx = Math.ceil(0.95 / H), y0 = 0.17, ny = Math.ceil((voor ? 0.85 : 1.0) / H);
      for (let a = 0; a <= nx; a++) {
        const x = sg * a * H, row = [];
        for (let b = 0; b <= ny; b++) {
          const y = y0 + b * H, r = vlakPt(voor, x, y);
          if (!r) { row.push(-1); continue; }
          row.push(SM.length);
          SM.push({ P: r[0], n: r[1], g: g2.id, k: a, j: b, skip: Math.abs(r[1][2]) < 0.6 ? 2 : 0, kind: voor ? 2 : 3, x, y });
        }
        g2.kol.push(row);
      }
    }
  }
  lap('raster');
  const at = (g, k, j) => { const G = GR[g]; if (k < 0 || k >= G.kol.length) return -1; const r = G.kol[k]; return j >= 0 && j < r.length ? r[j] : -1; };

  /* ---------- stralen over het raster ---------- */
  const NS = SM.length;
  const lab = new Int32Array(NS), dep = new Float32Array(NS), msh = new Int32Array(NS).fill(-1), opq = new Int32Array(NS).fill(-1), odep = new Float32Array(NS);
  const huidTel = new Int32Array(ms.length);
  for (let i = 0; i < NS; i++) {
    const s = SM[i];
    if (s.skip) { lab[i] = -2; continue; }
    const P = s.P, n = s.n, h = cast(P[0] + n[0] * R0, P[1] + n[1] * R0, P[2] + n[2] * R0, -n[0], -n[1], -n[2], FAR);
    if (h[1] < 0) { lab[i] = -4; dep[i] = 1e4; odep[i] = 1e4; continue; }
    msh[i] = TM[h[1]]; dep[i] = (h[0] - R0) * 1000; opq[i] = h[3] >= 0 ? TM[h[3]] : -1; odep[i] = h[3] >= 0 ? (h[2] - R0) * 1000 : 1e4;
    if (dep[i] <= DDIEP || info[msh[i]].verz) huidTel[msh[i]]++;
  }
  info.forEach((I, m) => { I.buiten = I.klein || huidTel[m] >= cfg.minBuiten; });
  for (let i = 0; i < NS; i++) if (!SM[i].skip) lab[i] = msh[i] >= 0 ? klasse(msh[i], dep[i]) : -4;
  lap('stralen');

  /* ---------- statistiek per deel en facetten ---------- */
  const perDeel = new Map();
  for (let i = 0; i < NS; i++) if (lab[i] >= 0) { let a = perDeel.get(lab[i]); if (!a) perDeel.set(lab[i], a = []); a.push(dep[i]); }
  const delen = {};
  for (const [m, a] of perDeel) {
    a.sort((x, y) => x - y);
    const q = f => a[Math.min(a.length - 1, Math.floor(f * a.length))];
    delen[m] = { n: a.length, med: q(0.5), p25: q(0.25), p75: q(0.75), glad: a.length >= cfg.gladMin && q(0.75) - q(0.25) <= cfg.gladIqr };
  }
  const buren4 = i => { const s = SM[i]; return [at(s.g, s.k - 1, s.j), at(s.g, s.k + 1, s.j), at(s.g, s.k, s.j - 1), at(s.g, s.k, s.j + 1)]; };
  const buren8 = i => { const s = SM[i], r = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (a || b) r.push(at(s.g, s.k + a, s.j + b)); return r; };
  // vormzones: ontworpen vormdetails waar het oppervlak bewust van het analytische afwijkt (geen facetcontrole)
  const inZone = (v, P) => {
    if (v.soort === 'wielboog') return [AXF, AXR].some(az => { const r = Math.hypot(P[2] - az, P[1] - AY); return r < ARCH + v.rmax; });
    if (v.soort === 'kader') return P.every((c, k) => c >= v.lo[k] - 1e-9 && c <= v.hi[k] + 1e-9);
    return false;
  };
  const vorm = s => (cfg.vormzones || []).some(v => inZone(v, s.P));
  // vormzone voor een kruising van een naad (golf 8 ronde 3): alleen zones met een sectie naad, en bij de wielboog alleen de lipband zelf
  // (ARCH tot ARCH + rmax van de as); index van de zone of -1
  const naadZone = P => (cfg.vormzones || []).findIndex(v => {
    if (!v.naad) return false;
    if (v.soort === 'wielboog') return [AXF, AXR].some(az => { const r = Math.hypot(P[2] - az, P[1] - AY); return r >= ARCH - 1e-9 && r < ARCH + v.rmax; });
    return inZone(v, P);
  });
  const facMon = new Uint8Array(NS);
  for (let i = 0; i < NS; i++) {
    const m = lab[i]; if (m < 0 || !delen[m].glad || info[m].geenF || info[m].verz || vorm(SM[i])) continue;
    if (Math.abs(dep[i] - delen[m].med) <= cfg.facet) continue;
    if (buren4(i).some(b => b < 0 || lab[b] !== m)) continue;      // alleen binnen het deel, niet op de rand
    facMon[i] = 1;
  }
  const facetten = [], gezien = new Uint8Array(NS);
  for (let i = 0; i < NS; i++) {
    if (!facMon[i] || gezien[i]) continue;
    const st = [i], comp = []; gezien[i] = 1;
    while (st.length) { const c = st.pop(); comp.push(c); for (const b of buren8(c)) if (b >= 0 && facMon[b] && !gezien[b] && lab[b] === lab[i]) { gezien[b] = 1; st.push(b); } }
    const m = lab[i]; let w = comp[0];
    if (comp.length < cfg.facetMin) continue;
    for (const c of comp) if (Math.abs(dep[c] - delen[m].med) > Math.abs(dep[w] - delen[m].med)) w = c;
    const P = comp.map(c => SM[c].P), lo = [0, 1, 2].map(a => Math.min(...P.map(p => p[a]))), hi = [0, 1, 2].map(a => Math.max(...P.map(p => p[a])));
    facetten.push({ deel: m, n: comp.length, kind: SM[w].kind, nrm: SM[w].n.map(v => +v.toFixed(2)), afw: +(dep[w] - delen[m].med).toFixed(2), med: +delen[m].med.toFixed(2), plek: SM[w].P.map(v => +v.toFixed(3)), lo: lo.map(v => +v.toFixed(3)), hi: hi.map(v => +v.toFixed(3)), mon: comp });
  }
  lap('facetten');

  /* ---------- kruisingen langs de rasterlijnen ---------- */
  const kruis = [];
  function loop(seq, richting) {
    let lastP = -1, slecht = false;
    for (let pos = 0; pos < seq.length; pos++) {
      const i = seq[pos];
      if (i < 0) { lastP = -1; slecht = false; continue; }
      const l = lab[i];
      if (l >= 0) {
        if (lastP >= 0 && !slecht) {
          const gl = pos - lastP - 1, a = seq[lastP];
          if ((lab[a] !== l || gl > 0) && gl <= LMAX) kruis.push({ a, b: i, gl, gap: seq.slice(lastP + 1, pos), richting });
        }
        lastP = pos; slecht = false;
      } else if (l === -2 || l === -3) slecht = true;
    }
  }
  for (const G of GR) {
    const nk = G.kol.length;
    for (let k = 0; k < nk; k++) loop(G.kol[k], 0);
    const nj = Math.max(...G.kol.map(r => r.length));
    for (let j = 0; j < nj; j++) { const seq = []; for (let k = 0; k < nk; k++) seq.push(at(G.id, k, j)); loop(seq, 1); }
  }
  lap('kruisingen');

  /* ---------- fijne scan per kruising ---------- */
  // punt en normaal op het oppervlak tussen monster a (f = 0) en b (f = 1), ook iets buiten dat bereik
  function tussen(a, b, f) {
    const A = SM[a], B = SM[b];
    if (A.g === B.g && A.kind === B.kind && A.kind <= 1) return zijPt(GR[A.g].zijde, A.kind, lerp(A.z, B.z, f), lerp(A.u, B.u, f));
    if (A.g === B.g && A.kind >= 2) { const r = vlakPt(A.kind === 2, lerp(A.x, B.x, f), lerp(A.y, B.y, f)); if (r) return r; }
    const P = [0, 1, 2].map(k => lerp(A.P[k], B.P[k], f)), n = norm([0, 1, 2].map(k => A.n[k] + B.n[k]));
    return [P, n];
  }
  const med = a => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
  const ruitRand = (c, glasKant) => {
    // ruitrand: de monsters 1 tot 3 stappen in het glas langs dezelfde rasterlijn; wat ligt er ondoorzichtig achter?
    const s = SM[glasKant], o = SM[c.a === glasKant ? c.b : c.a], dk = Math.sign(s.k - o.k), dj = Math.sign(s.j - o.j), uit = [];
    for (let st = 1; st <= 3; st++) {
      const i = at(s.g, s.k + dk * (st - 1), s.j + dj * (st - 1));
      if (i < 0 || lab[i] !== lab[glasKant]) break;
      if (opq[i] >= 0 && odep[i] - dep[i] < cfg.randDiepte && info[opq[i]].lum > cfg.randLum) uit.push([opq[i], +(odep[i] - dep[i]).toFixed(1)]);
    }
    return uit;
  };
  for (const c of kruis) {
    const A = SM[c.a], B = SM[c.b], la = lab[c.a], lb = lab[c.b];
    const dab = Math.hypot(B.P[0] - A.P[0], B.P[1] - A.P[1], B.P[2] - A.P[2]);
    const W = dab / 2 + 0.006, N = Math.ceil(2 * W / DS), f0 = 0.5 - W / dab, df = DS / dab;
    const L_ = [], D_ = [], M_ = [], O_ = [], OD_ = [], T_ = [], PP = [];
    for (let s = 0; s <= N; s++) {
      const [P, n] = tussen(c.a, c.b, f0 + s * df);
      const h = cast(P[0] + n[0] * R0, P[1] + n[1] * R0, P[2] + n[2] * R0, -n[0], -n[1], -n[2], FAR);
      const m = h[1] >= 0 ? TM[h[1]] : -1, d = h[1] >= 0 ? (h[0] - R0) * 1000 : 1e4;
      L_.push(klasse(m, d)); D_.push(d); M_.push(m); O_.push(h[3] >= 0 ? TM[h[3]] : -1); OD_.push(h[3] >= 0 ? (h[2] - R0) * 1000 : 1e4); T_.push(h[1]); PP.push(P);
    }
    // rand van A: eind van het eerste aaneengesloten stuk A; rand van B: eerste B daarna
    let fa = L_.indexOf(la), iA = -1, iB = -1;
    if (fa >= 0) { iA = fa; while (iA + 1 <= N && L_[iA + 1] === la) iA++; for (let s = iA + 1; s <= N; s++) if (L_[s] === lb) { iB = s; break; } }
    if (iA < 0 || iB < 0) { c.fout = 'scan'; continue; }
    // een derde deel in de kier: de kruising is dan eigenlijk twee naden; meet tot dat deel
    const derde = []; for (let s = iA + 1; s < iB; s++) if (L_[s] >= 0) derde.push(L_[s]);
    if (derde.length) { c.fout = 'derde'; continue; }
    const kant = (i0, stp) => { const r = []; for (let s = 2; s <= 7; s++) { const i = i0 + stp * s; if (i < 0 || i > N || L_[i] !== L_[i0]) break; r.push(D_[i]); } return r; };
    const dA = med(kant(iA, -1)), dB = med(kant(iB, 1));
    let door = -Infinity, doorDeel = -1, doorLicht = 0;
    const zie = new Set(); let niets = false;
    for (let s = iA + 1; s < iB; s++) {
      if (L_[s] === -5) continue;
      const d = D_[s]; if (d > door) { door = d; doorDeel = M_[s]; }
      if (M_[s] >= 0 && info[M_[s]].lum > cfg.randLum && !info[M_[s]].vul) doorLicht++;
      if (d > DDIEP) { if (M_[s] < 0) niets = true; else zie.add(M_[s]); }
    }
    // afgedekt (golf 8 ronde 2): ligt over de hele kier een afdekdeel (cfg.afdekkers: een lijst of rubber die bewust over een naad
    // ligt) hooguit dekMax mm dieper dan de randen of erboven, dan is de kier van buiten niet te zien: een tweede laag onder een
    // sierlijst of wenkbrauw. De kruising telt dan met kier 0 en zonder doorkijk; welk deel afdekt, staat in de naad (afgedekt).
    // Alleen afdekdelen tellen: een binnendeel dat tot in een kier van de huid komt (een motorhuis onder een spleet in het dak),
    // blijft een fout
    const ref = Math.max(dA === null ? 0 : dA, dB === null ? 0 : dB);
    let dek = cfg.dekMax !== undefined && iB - iA > 1 ? -1 : -2;
    for (let s = iA + 1; s < iB && dek > -2; s++) {
      const m = M_[s];
      if (L_[s] === -5 || m < 0 || m === la || m === lb || !info[m].afd || D_[s] > ref + cfg.dekMax) dek = -2; else if (dek < 0) dek = m;
    }
    const nA = T_[Math.max(fa, iA - 3)] >= 0 ? triN(T_[Math.max(fa, iA - 3)]) : null, nB = T_[Math.min(N, iB + 3)] >= 0 ? triN(T_[Math.min(N, iB + 3)]) : null;
    const knik = nA && nB ? Math.acos(Math.min(1, Math.abs(dot(nA, nB)))) * 180 / PI : null;
    const [Pm, nm] = tussen(c.a, c.b, 0.5);
    const e0 = norm([0, 1, 2].map(k => PP[N][k] - PP[0][k]));
    const afg = dek >= 0;
    Object.assign(c, {
      la, lb, kierL: afg ? 0 : Math.max(0, iB - iA - 1) * DS * 1000, afg: afg ? dek : -1, zie: afg ? [] : [...zie], niets: !afg && niets, stap: dA !== null && dB !== null ? dA - dB : null, dA, dB,
      door: iB - iA > 1 && !afg ? (door === -Infinity ? null : door) : null, doorDeel, doorLicht, derde: [...new Set(derde)], knik,
      eA: PP[iA], eB: PP[iB], M: [0, 1, 2].map(k => (PP[iA][k] + PP[iB][k]) / 2), n: nm, e0, zone: naadZone([0, 1, 2].map(k => (PP[iA][k] + PP[iB][k]) / 2)),
      gapN: iB - iA - 1,
      rand: info[la].ruit && !info[lb].ruit && !info[lb].zwart ? ruitRand(c, c.a) : info[lb].ruit && !info[la].ruit && !info[la].zwart ? ruitRand(c, c.b) : [], vul: L_.slice(iA + 1, iB).some(l => l === -5),
    });
  }
  lap('scans');

  /* ---------- naden: kruisingen per paar en plaats samenvoegen ---------- */
  const goed = kruis.filter(c => !c.fout);
  const groepen = new Map();
  for (const c of goed) { const key = Math.min(c.la, c.lb) + '|' + Math.max(c.la, c.lb); let g = groepen.get(key); if (!g) groepen.set(key, g = []); g.push(c); }
  const naden = []; let los = 0;
  const R = cfg.samen * H;
  for (const [key, lijst] of groepen) {
    // samenhang: kruisingen binnen R van elkaar horen bij dezelfde naad
    const par = lijst.map((_, i) => i), f = i => { while (par[i] !== i) i = par[i] = par[par[i]]; return i; };
    const cel = new Map(), ck = p => p.map(v => Math.floor(v / R)).join(',');
    lijst.forEach((c, i) => { const k = ck(c.M); (cel.get(k) || cel.set(k, []).get(k)).push(i); });
    lijst.forEach((c, i) => {
      const b = c.M.map(v => Math.floor(v / R));
      for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
        const l = cel.get([b[0] + x, b[1] + y, b[2] + z].join(',')); if (!l) continue;
        for (const j of l) if (j !== i && Math.hypot(...[0, 1, 2].map(k => c.M[k] - lijst[j].M[k])) <= R) { const a = f(i), bb = f(j); if (a !== bb) par[a] = bb; }
      }
    });
    const comps = new Map(); lijst.forEach((c, i) => { const r = f(i); (comps.get(r) || comps.set(r, []).get(r)).push(c); });
    const afst = (c, o) => Math.hypot(c.M[0] - o.M[0], c.M[1] - o.M[1], c.M[2] - o.M[2]);
    for (const cs of comps.values()) {
      if (cs.length < cfg.minKruis) { los += cs.length; continue; }
      // deellijnen (golf 8 ronde 2): kruisingen die hooguit lijnSamen rasterstappen uit elkaar liggen, vormen één lijn. Een lijst met
      // twee randen tegen hetzelfde rubber (onder- en bovenrand, 13 mm uit elkaar) gaf anders één naad met twee evenwijdige lijnen,
      // en de richting uit de buren sprong dan tussen die twee (schijnknik tot 48 graden). Alleen voor de knik in de naadlijn (tl);
      // de kier loodrecht op de naad houdt de richting uit alle buren (t), want op een schuine naad liggen de kruisingen soms
      // verder dan lijnSamen uit elkaar
      const lp = cs.map((_, i) => i), lf = i => { while (lp[i] !== i) i = lp[i] = lp[lp[i]]; return i; };
      const LS = (cfg.lijnSamen || cfg.samen) * H;
      for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (afst(cs[i], cs[j]) <= LS) { const a = lf(i), b = lf(j); if (a !== b) lp[a] = b; }
      cs.forEach((c, i) => { c.lijnId = lf(i); });
      // richting van de naad per kruising uit de buren binnen 3 rasterstappen (hoofdas): t uit alle buren, tl uit de buren op dezelfde
      // deellijn; dan de kier loodrecht op t
      const hoofdas = nb => {
        if (nb.length < 2) return null;
        const m = [0, 1, 2].map(k => nb.reduce((s, o) => s + o.M[k], 0) / nb.length);
        const Cv = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (const o of nb) { const d = [0, 1, 2].map(k => o.M[k] - m[k]); for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) Cv[a][b] += d[a] * d[b]; }
        let v = [1, 0.5, 0.25]; for (let it = 0; it < 30; it++) v = norm([0, 1, 2].map(a => Cv[a][0] * v[0] + Cv[a][1] * v[1] + Cv[a][2] * v[2]));
        return v;
      };
      for (const c of cs) {
        const nb = cs.filter(o => afst(c, o) <= 3.2 * H);
        const t = hoofdas(nb);
        c.t = t;
        c.tl = hoofdas(nb.filter(o => o.lijnId === c.lijnId));
        const loodrecht = t ? norm(cross(c.n, t)) : null;
        c.cos = loodrecht ? Math.abs(dot(loodrecht, c.e0)) : 1;
        c.kier = c.kierL * c.cos;
      }
      const bruik = cs.filter(c => c.cos >= 0.6);
      const basis = bruik.length ? bruik : cs;
      const vals = (f) => basis.map(f).filter(v => v !== null && v !== undefined && isFinite(v));
      const P = cs.map(c => c.M), lo = [0, 1, 2].map(a => Math.min(...P.map(p => p[a]))), hi = [0, 1, 2].map(a => Math.max(...P.map(p => p[a])));
      // lijnhoek: hoek tussen de randlijn van A en die van B over stukken van ongeveer 5 rasterstappen
      let lijn = null;
      for (const c of basis) {
        const nb = basis.filter(o => afst(c, o) <= 5 * H);
        if (nb.length < 4) continue;
        const as = (pts) => { const m = [0, 1, 2].map(k => pts.reduce((s, p) => s + p[k], 0) / pts.length); const Cv = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
          for (const p of pts) { const d = [0, 1, 2].map(k => p[k] - m[k]); for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) Cv[a][b] += d[a] * d[b]; }
          let v = c.t || [1, 0.5, 0.25]; for (let it = 0; it < 30; it++) v = norm([0, 1, 2].map(a => Cv[a][0] * v[0] + Cv[a][1] * v[1] + Cv[a][2] * v[2])); return v; };
        const ta = as(nb.map(o => o.eA)), tb2 = as(nb.map(o => o.eB));
        const h = Math.acos(Math.min(1, Math.abs(dot(ta, tb2)))) * 180 / PI;
        if (lijn === null || h > lijn) lijn = h;
      }
      // doorkijk telt pas bij een kier van minstens twee scanstappen (0,8 mm); door een spleet van 0,4 mm zie je niets
      // knik in de naadlijn: grootste hoek tussen de richtingen (tl) van twee kruisingen op dezelfde deellijn die 3 tot 6 rasterstappen uit elkaar liggen
      // (informatie: een ontworpen hoek, zoals de bovenhoek van een portier, telt ook)
      let knikL = null;
      for (const c of basis) { if (!c.tl) continue; for (const o of basis) { if (o === c || !o.tl || o.lijnId !== c.lijnId) continue;
        const d = Math.hypot(...[0, 1, 2].map(k => c.M[k] - o.M[k])); if (d < 3 * H || d > 6 * H) continue;
        const h = Math.acos(Math.min(1, Math.abs(dot(c.tl, o.tl)))) * 180 / PI;
        if (!knikL || h > knikL.hoek) knikL = { hoek: +h.toFixed(1), plek: [0, 1, 2].map(k => +((c.M[k] + o.M[k]) / 2).toFixed(3)) }; } }
      const kv = vals(c => c.kier), sv = vals(c => c.stap), dv = cs.filter(c => c.gapN >= 2).map(c => c.door).filter(v => v !== null);
      const doorDelen = {}; cs.forEach(c => { if (c.gapN >= 2 && c.door !== null && c.doorDeel >= 0 && c.door > DDIEP) doorDelen[c.doorDeel] = (doorDelen[c.doorDeel] || 0) + 1; });
      const rand = {}; cs.forEach(c => c.rand.forEach(([m]) => { rand[m] = (rand[m] || 0) + 1; }));
      const derde = {}; cs.forEach(c => c.derde.forEach(m => { derde[m] = (derde[m] || 0) + 1; }));
      // doorkijk per deel (alleen bij een kier van minstens twee scanstappen): welke delen en hoe vaak niets; afgedekte kruisingen
      const doorZie = {}; let doorNiets = 0; const afgedekt = {};
      cs.forEach(c => { if (c.afg >= 0) afgedekt[c.afg] = (afgedekt[c.afg] || 0) + 1; if (c.gapN < 2) return; c.zie.forEach(m => { doorZie[m] = (doorZie[m] || 0) + 1; }); if (c.niets) doorNiets++; });
      const lijnen = new Set(basis.map(c => c.lijnId)).size;
      const la = cs[0].la < cs[0].lb ? cs[0].la : cs[0].lb, lb = la === cs[0].la ? cs[0].lb : cs[0].la;
      // stap met teken ten opzichte van la (positief: la ligt dieper). Kruisingen in een vormzone met een sectie naad (golf 8 ronde 3,
      // de wielbooglip) tellen apart in zones: daar gelden voor stap en rand de grenzen van de zone, voor de rest die van de naad
      const svT = basis.filter(c => c.stap !== null && c.zone < 0).map(c => c.la === la ? c.stap : -c.stap);
      const randA = basis.filter(c => c.zone < 0).map(c => c.la === la ? c.dA : c.dB).filter(v => v !== null), randB = basis.filter(c => c.zone < 0).map(c => c.la === la ? c.dB : c.dA).filter(v => v !== null);
      const zones = {};
      basis.forEach(c => { if (c.zone < 0) return; const z = zones[c.zone] || (zones[c.zone] = { n: 0, stap: [], randA: [], randB: [] }); z.n++;
        if (c.stap !== null) z.stap.push(+(c.la === la ? c.stap : -c.stap).toFixed(2));
        const ra = c.la === la ? c.dA : c.dB, rb = c.la === la ? c.dB : c.dA; if (ra !== null) z.randA.push(+ra.toFixed(2)); if (rb !== null) z.randB.push(+rb.toFixed(2)); });
      naden.push({
        a: la, b: lb, n: cs.length, vul: cs.filter(c => c.vul).length, nb: basis.length, lo: lo.map(v => +v.toFixed(3)), hi: hi.map(v => +v.toFixed(3)),
        kier: kv.sort((x, y) => x - y).map(v => +v.toFixed(2)), stap: svT.sort((x, y) => x - y).map(v => +v.toFixed(2)),
        door: dv.length ? +Math.max(...dv).toFixed(1) : null, doorN: dv.filter(v => v > DDIEP).length, doorDelen, doorLicht: cs.reduce((s, c) => s + (c.doorLicht ? 1 : 0), 0),
        randA: randA.sort((x, y) => x - y).map(v => +v.toFixed(2)), randB: randB.sort((x, y) => x - y).map(v => +v.toFixed(2)),
        knik: cs.map(c => c.knik).filter(v => v !== null).sort((x, y) => x - y).map(v => +v.toFixed(1)), lijn: lijn === null ? null : +lijn.toFixed(1), knikL,
        rand, derde, doorZie, doorNiets, afgedekt, lijnen, zones,
        // punt: x, y, z, kier, stap (teken t.o.v. a), doorkijk, rastersoort (0/1 zij, 2 voor, 3 achter), normaal y en x, deellijn
        punten: basis.map(c => [+c.M[0].toFixed(4), +c.M[1].toFixed(4), +c.M[2].toFixed(4), +c.kier.toFixed(2), c.stap === null ? null : +((c.la === la ? c.stap : -c.stap)).toFixed(2), c.door === null ? null : +c.door.toFixed(1), SM[c.a].kind, +c.n[1].toFixed(2), +c.n[0].toFixed(2), c.lijnId]),
      });
    }
  }
  lap('naden');

  /* ---------- doorkijkvlakken: kiermonsters die meer dan een rasterstap breed zijn ---------- */
  const vlakken = [], gz = new Uint8Array(NS);
  for (let i = 0; i < NS; i++) {
    if (lab[i] !== -4 || gz[i]) continue;
    const st = [i], comp = []; gz[i] = 1;
    while (st.length) { const c = st.pop(); comp.push(c); for (const b of buren4(c)) if (b >= 0 && lab[b] === -4 && !gz[b]) { gz[b] = 1; st.push(b); } }
    const kern = comp.filter(c => buren8(c).every(b => b >= 0 && lab[b] === -4));
    if (!kern.length) continue;
    const buren = {}, rand = { skip: 0, opbouw: 0, buiten: 0 };
    for (const c of comp) for (const b of buren4(c)) {
      if (b < 0) rand.buiten++; else if (lab[b] >= 0) buren[lab[b]] = (buren[lab[b]] || 0) + 1; else if (lab[b] === -2) rand.skip++; else if (lab[b] === -3) rand.opbouw++;
    }
    const gezienD = {}; let diep = 0;
    for (const c of comp) { if (msh[c] >= 0) gezienD[msh[c]] = (gezienD[msh[c]] || 0) + 1; diep = Math.max(diep, dep[c]); }
    const P = comp.map(c => SM[c].P), lo = [0, 1, 2].map(a => Math.min(...P.map(p => p[a]))), hi = [0, 1, 2].map(a => Math.max(...P.map(p => p[a])));
    vlakken.push({ n: comp.length, kind: SM[comp[0]].kind, nrm: SM[comp[0]].n.map(v => +v.toFixed(2)), kern: kern.length, buren, rand, gezien: gezienD, diep: +diep.toFixed(1), lo: lo.map(v => +v.toFixed(3)), hi: hi.map(v => +v.toFixed(3)), mon: comp });
  }
  lap('vlakken');

  // bewaren voor het overzichtsbeeld (tweede aanroep)
  window.__kieren = { SM, lab, GR, fac: facetten.map(f => f.mon), vla: vlakken.map(v => v.mon) };
  const tel = { monsters: NS, gemeten: 0, skip: 0, opbouw: 0, kier: 0, vulling: 0 };
  for (let i = 0; i < NS; i++) { const l = lab[i]; if (l >= 0) tel.gemeten++; else if (l === -2) tel.skip++; else if (l === -3) tel.opbouw++; else if (l === -4) tel.kier++; else tel.vulling++; }
  const gebruikt = new Set(); naden.forEach(n => { gebruikt.add(n.a); gebruikt.add(n.b); Object.keys(n.doorDelen).forEach(m => gebruikt.add(+m)); Object.keys(n.rand).forEach(m => gebruikt.add(+m)); Object.keys(n.derde).forEach(m => gebruikt.add(+m)); Object.keys(n.doorZie).forEach(m => gebruikt.add(+m)); Object.keys(n.afgedekt).forEach(m => gebruikt.add(+m)); });
  facetten.forEach(f => gebruikt.add(f.deel)); vlakken.forEach(v => { Object.keys(v.buren).forEach(m => gebruikt.add(+m)); Object.keys(v.gezien).forEach(m => gebruikt.add(+m)); });
  const meshes = {}; for (const m of gebruikt) meshes[m] = { p: info[m].p, tr: info[m].tr, lum: info[m].lum, inner: info[m].inner, ruit: info[m].ruit, verz: info[m].verz, ...(delen[m] ? { med: +delen[m].med.toFixed(2), glad: delen[m].glad, nm: delen[m].n } : {}) };
  facetten.forEach(f => delete f.mon);
  vlakken.forEach(v => delete v.mon);
  return { tijd, stralen: nRays, driehoeken: nt, tel, kruisingen: kruis.length, scanFout: kruis.filter(c => c.fout === 'scan').length, derde: kruis.filter(c => c.fout === 'derde').length, los, meshes, naden, facetten, vlakken };
}

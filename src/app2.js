/* ===================== interactie, paneel, presets, labels, render-lus ===================== */
const $ = id => document.getElementById(id);
const els = { sheet: $('sheet'), crumbs: $('crumbs'), name: $('selName'), meta: $('selMeta'), desc: $('selDesc'), spec: $('selSpec'), kids: $('selKids'), kidsTitle: $('kidsTitle'), toggle: $('actToggle'), all: $('actAll'), iso: $('actIsolate'), focus: $('actFocus'), tree: $('tree'), search: $('treeSearch'), labels: $('labels'), hint: $('hint'), presets: $('presets'), legend: $('legend') };
let MODE = 'explode', LABELS = true, CTX = null, ACTIVE_PRESET = null, needs = true;
const requestRender = () => { needs = true; };
const byName = name => ALL.find(n => n.name === name);
const fmtCount = n => (n.count === 1 ? '1 onderdeel' : `${n.count} onderdelen`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- selectie en paneel ---------- */
function select(n, opts = {}) {
  SEL = n || ROOT;
  applyMats();
  renderPanel();
  if (opts.focus) focusNodes([SEL]);
  if (treeVisible()) renderTree();
  requestRender();
}
function renderPanel() {
  const n = SEL;
  els.crumbs.innerHTML = '';
  ancestors(n).forEach((a, i) => {
    if (i) { const sp = document.createElement('span'); sp.textContent = '›'; els.crumbs.appendChild(sp); }
    const b = document.createElement('button'); b.textContent = a.name; b.onclick = () => select(a, { focus: true }); els.crumbs.appendChild(b);
  });
  els.name.textContent = n.name;
  const state = n.asm ? (n.target ? '<span class="state open">Uitgeklapt</span>' : '<span class="state">Ingeklapt</span>') : '<span class="state">Onderdeel</span>';
  els.meta.innerHTML = `${state}${n.asm ? fmtCount(n) : (n.parent ? 'in ' + esc(n.parent.name) : '')}`;
  els.desc.textContent = n.d || '';
  els.spec.innerHTML = (n.spec || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  els.spec.hidden = !n.spec;
  els.kids.innerHTML = '';
  els.kidsTitle.hidden = !n.asm;
  if (n.asm) {
    els.kidsTitle.textContent = `Bestaat uit (${n.kids.length})`;
    n.kids.slice(0, 60).forEach((k, i) => {
      const b = document.createElement('button');
      b.textContent = `${i + 1}. ${k.name}`;
      b.onclick = () => { reveal(k); };
      els.kids.appendChild(b);
    });
  }
  els.toggle.disabled = !n.asm;
  els.toggle.textContent = n.asm && n.target ? 'Inklappen' : 'Uitklappen';
  els.all.disabled = !n.asm;
  const isoOn = ISO.length === 1 && ISO[0] === n;
  els.iso.textContent = isoOn ? 'Alles tonen' : 'Isoleren';
  els.iso.disabled = n === ROOT && !ISO.length;
  syncSheetHeight();
}
function reveal(n) {
  if (ISO.length && !ISO.some(a => isUnder(n, a))) { ISO = []; applyVisibility(); }
  ancestors(n).forEach(a => setTarget(a, 1));
  CTX = n.parent;
  clearPreset();
  select(n);
  focusNodes([n], null, n.asm ? 1.12 : 1.6);
}
function doExplode(n) { setTarget(n, 1); CTX = n; clearPreset(); select(n); focusNodes([n], null, 1.08); }
function doCollapse(n) { collapseTree(n); CTX = n.parent && n.parent.target ? n.parent : null; clearPreset(); select(n); focusNodes([n.parent && n.parent.target ? n.parent : n], null, 1.1); }
function isolate(list) { ISO = list.slice(); applyVisibility(); applyMats(); updateGround(); }
els.toggle.onclick = () => { const n = SEL; if (!n.asm) return; n.target ? doCollapse(n) : doExplode(n); };
els.all.onclick = () => { const n = SEL; if (!n.asm) return; explodeAllUnder(n); CTX = n; clearPreset(); renderPanel(); focusNodes([n], null, 1.04); };
els.iso.onclick = () => {
  const on = ISO.length === 1 && ISO[0] === SEL;
  isolate(on ? [] : [SEL]); clearPreset(); renderPanel();
  focusNodes(on ? contextNodes() : [SEL]);
};
els.focus.onclick = () => focusNodes([SEL], null, SEL.asm ? 1.08 : 1.6);

/* ---------- onderdelenboom ---------- */
const openRows = new Set([ROOT.id]);
function treeVisible() { return !$('tab-tree').hidden && (window.innerWidth >= 920 || els.sheet.dataset.state === 'open'); }
function treeRow(n) {
  const li = document.createElement('li');
  const row = document.createElement('div'); row.className = 'trow' + (n === SEL ? ' sel' : ''); row.setAttribute('role', 'treeitem');
  const tw = document.createElement('button'); tw.className = 'tw';
  if (n.asm) { tw.textContent = openRows.has(n.id) ? '▾' : '▸'; tw.setAttribute('aria-label', openRows.has(n.id) ? 'Inklappen in lijst' : 'Uitklappen in lijst'); tw.onclick = () => { openRows.has(n.id) ? openRows.delete(n.id) : openRows.add(n.id); renderTree(); }; } else tw.tabIndex = -1;
  const dot = document.createElement('span'); dot.className = 'dot' + (n.asm && n.target ? ' open' : ''); if (!n.asm) dot.style.visibility = 'hidden';
  const nm = document.createElement('button'); nm.className = 'tn'; nm.textContent = n.name; nm.onclick = () => reveal(n);
  const c = document.createElement('span'); c.className = 'tc'; c.textContent = n.asm ? n.count : '';
  row.append(tw, dot, nm, c); li.appendChild(row);
  if (n.asm && openRows.has(n.id)) { const ul = document.createElement('ul'); n.kids.forEach(k => ul.appendChild(treeRow(k))); li.appendChild(ul); }
  return li;
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function renderTree() {
  const q = norm(els.search.value.trim());
  els.tree.innerHTML = '';
  const ul = document.createElement('ul');
  if (q.length >= 2) {
    const hits = ALL.filter(n => norm(n.name).includes(q)).slice(0, 80);
    if (!hits.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = 'Geen onderdeel gevonden met die naam.'; els.tree.appendChild(p); return; }
    hits.forEach(n => { const li = treeRow(n); const small = document.createElement('div'); small.className = 'tc'; small.style.paddingLeft = '34px'; small.textContent = ancestors(n).slice(1).map(a => a.name).join(' › '); li.appendChild(small); ul.appendChild(li); });
  } else ul.appendChild(treeRow(ROOT));
  els.tree.appendChild(ul);
}
els.search.addEventListener('input', renderTree);

/* ---------- tabs en paneel (mobiel) ---------- */
function showTab(id) {
  ['info', 'tree', 'view'].forEach(t => { $('tab-' + t).hidden = t !== id; $('tabbtn-' + t).setAttribute('aria-selected', String(t === id)); });
  if (id === 'tree') { ancestors(SEL).forEach(a => openRows.add(a.id)); renderTree(); }
}
['info', 'tree', 'view'].forEach(t => $('tabbtn-' + t).addEventListener('click', () => showTab(t)));
function setSheet(state) {
  els.sheet.dataset.state = state;
  $('sheetToggle').setAttribute('aria-expanded', String(state === 'open'));
  $('btnParts').setAttribute('aria-pressed', String(state === 'open' && !$('tab-tree').hidden));
  $('btnView').setAttribute('aria-pressed', String(state === 'open' && !$('tab-view').hidden));
  syncSheetHeight(); layoutView();
  if (treeVisible()) renderTree();
}
$('sheetToggle').onclick = () => setSheet(els.sheet.dataset.state === 'open' ? 'peek' : 'open');
$('btnParts').onclick = () => { const open = els.sheet.dataset.state === 'open' && !$('tab-tree').hidden; showTab('tree'); setSheet(open ? 'peek' : 'open'); };
$('btnView').onclick = () => { const open = els.sheet.dataset.state === 'open' && !$('tab-view').hidden; showTab('view'); setSheet(open ? 'peek' : 'open'); };
function syncSheetHeight() {
  if (window.innerWidth < 920) document.getElementById('app').style.setProperty('--sheet-h', (els.sheet.dataset.state === 'open' ? 0 : els.sheet.offsetHeight) + 'px');
}

/* ---------- weergave-bediening ---------- */
$('spread').addEventListener('input', e => {
  SPREAD = e.target.value / 100; $('spreadOut').textContent = e.target.value + '%';
  ASMS.forEach(placeKids); updateGround(); requestRender();
});
$('spread').addEventListener('change', () => focusNodes(contextNodes()));
$('tLabels').addEventListener('change', e => { LABELS = e.target.checked; requestRender(); });
$('tXray').addEventListener('change', e => { XRAY = e.target.checked; applyMats(); requestRender(); });
$('tSys').addEventListener('change', e => { SYSCOL = e.target.checked; els.legend.hidden = !SYSCOL; applyMats(); requestRender(); });
$('tRotate').addEventListener('change', e => { controls.autoRotate = e.target.checked; requestRender(); });
els.legend.innerHTML = Object.entries(SYS_COLORS).map(([k, c]) => `<span><i style="background:#${c.toString(16).padStart(6, '0')}"></i>${esc(k === 'Wiel' ? 'Wielen' : k)}</span>`).join('');
document.querySelectorAll('[data-cam]').forEach(b => b.addEventListener('click', () => focusNodes(contextNodes(), DIRS[b.dataset.cam])));
$('btnExplodeAll').onclick = () => { explodeAllUnder(ISO.length ? ISO[0] : ROOT); CTX = ISO.length ? ISO[0] : ROOT; clearPreset(); renderPanel(); focusNodes(contextNodes(), null, 1.02); };
$('btnCollapseAll').onclick = () => { collapseAll(); CTX = null; clearPreset(); renderPanel(); focusNodes(contextNodes()); };
$('btnShowAll').onclick = () => { isolate([]); clearPreset(); renderPanel(); focusNodes([ROOT]); };
document.querySelectorAll('.seg [data-mode]').forEach(b => b.addEventListener('click', () => {
  MODE = b.dataset.mode;
  document.querySelectorAll('.seg [data-mode]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
}));

/* ---------- presets ---------- */
function clearPreset() { ACTIVE_PRESET = null; els.presets.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false')); }
function setXray(on) { XRAY = on; $('tXray').checked = on; }
const PRESETS = [
  { id: 'assembled', label: 'Gemonteerd', run() { collapseAll(); isolate([]); setXray(false); CTX = null; select(ROOT); focusNodes([ROOT], DIRS.iso); } },
  { id: 'main', label: 'Hoofdgroepen', run() { collapseAll(); isolate([]); setXray(false); setTarget(ROOT, 1); CTX = ROOT; select(ROOT); focusNodes([ROOT], DIRS.iso, 1.02); } },
  { id: 'body', label: 'Carrosserie', run() { const b = byName('Carrosserie'); collapseAll(); isolate([b]); setXray(false); setTarget(b, 1); setTarget(byName('Carrosseriekooi'), 1, 0.4); CTX = b; select(b); focusNodes([b], DIRS.iso, 1.02); } },
  { id: 'engine', label: 'Motor F4Rt', run() { const m = byName('Motor F4Rt'); collapseAll(); isolate([m]); setXray(false); setTarget(m, 1); CTX = m; select(m); focusNodes([m], V3(0.25, 0.35, 1)); } },
  { id: 'engineAll', label: 'Motor tot op de bout', run() { const m = byName('Motor F4Rt'); collapseAll(); isolate([m]); setXray(false); explodeAllUnder(m); CTX = m; select(m); focusNodes([m], V3(0.25, 0.35, 1), 1.0); } },
  { id: 'head', label: 'Cilinderkop', run() { const h = byName('Cilinderkop'); collapseAll(); isolate([h]); setXray(false); explodeAllUnder(h); CTX = h; select(h); focusNodes([h], V3(0.7, 0.5, 1), 1.0); } },
  { id: 'gearbox', label: 'Automaat', run() { const g = byName('Automaatversnellingsbak'); collapseAll(); isolate([g]); setXray(false); explodeAllUnder(g); CTX = g; select(g); focusNodes([g], V3(0.4, 0.5, 1), 1.0); } },
  { id: 'chassis', label: 'Onderstel en remmen', run() { const list = ['Vooras en stuurinrichting', 'Achteras', 'Remsysteem', 'Wiel linksvoor', 'Wiel rechtsvoor', 'Wiel linksachter', 'Wiel rechtsachter'].map(byName); collapseAll(); isolate(list); setXray(false); setTarget(ROOT, 1); setTarget(list[0], 1, 0.3); setTarget(list[1], 1, 0.3); CTX = list[0]; select(list[0]); focusNodes(list, DIRS.iso, 1.02); } },
  { id: 'interior', label: 'Interieur', run() { const i = byName('Interieur'); collapseAll(); isolate([i]); setXray(false); setTarget(i, 1); setTarget(byName('Stoelen'), 1, 0.4); CTX = i; select(i); focusNodes([i], V3(0.9, 0.8, 0.7), 1.02); } },
  { id: 'xray', label: 'Röntgen', run() { collapseAll(); isolate([]); setXray(true); CTX = null; select(ROOT); focusNodes([ROOT], DIRS.side); } },
  { id: 'everything', label: 'Alles uit elkaar', run() { isolate([]); setXray(false); explodeAllUnder(ROOT); CTX = ROOT; select(ROOT); focusNodes([ROOT], DIRS.iso, 1.0); } },
];
PRESETS.forEach(p => {
  const b = document.createElement('button'); b.className = 'chip'; b.setAttribute('aria-pressed', 'false'); b.dataset.preset = p.id; b.textContent = p.label;
  b.onclick = () => { p.run(); applyMats(); ACTIVE_PRESET = p.id; els.presets.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b))); hideHint(); requestRender(); };
  els.presets.appendChild(b);
});

/* ---------- aanwijzen en tikken ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(cx, cy) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const list = MESHES.filter(m => m.visible && !(XRAY && m.userData.node.isBody));
  const hit = ray.intersectObjects(list, false)[0];
  return hit ? hit.object.userData.node : null;
}
function pathFrom(n) {
  const p = [];
  for (let a = n; a; a = a.parent) { p.unshift(a); if (ISO.includes(a)) break; }
  return p;
}
function tapNode(n) {
  if (!n) return;
  const path = pathFrom(n);
  if (MODE === 'explode') {
    const a = path.find(x => x.asm && !x.target);
    if (a) doExplode(a); else select(n);
  } else if (MODE === 'collapse') {
    let a = null; path.forEach(x => { if (x.asm && x.target) a = x; });
    if (a) doCollapse(a); else select(n);
  } else select(n);
}
let down = null, pointers = 0;
canvas.addEventListener('pointerdown', e => { pointers++; down = pointers === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null; camAnim = null; hideHint(); });
canvas.addEventListener('pointerup', e => {
  pointers = Math.max(0, pointers - 1);
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
  down = null;
  if (moved < 7 && dt < 600 && e.button === 0) tapNode(pick(e.clientX, e.clientY));
});
canvas.addEventListener('pointercancel', () => { pointers = Math.max(0, pointers - 1); down = null; });
canvas.addEventListener('contextmenu', e => { e.preventDefault(); const n = pick(e.clientX, e.clientY); if (!n) return; let a = null; pathFrom(n).forEach(x => { if (x.asm && x.target) a = x; }); if (a) doCollapse(a); });
canvas.addEventListener('dblclick', e => { const n = pick(e.clientX, e.clientY); if (n) focusNodes([n], null, 1.8); });
const tag = document.createElement('div'); tag.className = 'lbl'; tag.style.pointerEvents = 'none'; tag.hidden = true; document.getElementById('app').appendChild(tag);
let lastHover = 0;
canvas.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || e.buttons) { tag.hidden = true; return; }
  const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
  const n = pick(e.clientX, e.clientY);
  if (!n) { tag.hidden = true; canvas.style.cursor = ''; return; }
  let target = n;
  if (MODE === 'explode') { const a = pathFrom(n).find(x => x.asm && !x.target); if (a) target = a; }
  tag.textContent = target.name + (MODE === 'explode' && target.asm ? ' · klik om uit te klappen' : '');
  tag.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 12}px)`;
  tag.hidden = false; canvas.style.cursor = 'pointer';
});
canvas.addEventListener('pointerleave', () => { tag.hidden = true; });
function hideHint() { if (els.hint.hidden || els.hint.classList.contains('gone')) return; els.hint.classList.add('gone'); setTimeout(() => { els.hint.hidden = true; }, 450); }
window.addEventListener('keydown', e => { if (e.key === 'Escape') { select(ROOT); } });

/* ---------- labels ---------- */
const labelPool = [];
function updateLabels() {
  let shown = 0;
  const ctx = LABELS && CTX && CTX.target && CTX.amt > 0.6 ? CTX : null;
  if (ctx) {
    const max = window.innerWidth < 600 ? 12 : 26;
    const kids = ctx.kids.filter(k => k.meshes.some(m => m.visible)).sort((a, b) => b.rad - a.rad).slice(0, max);
    const r = canvas.getBoundingClientRect(), placed = [];
    const minX = VIEW.l + 4, maxX = r.width - VIEW.r - 4, minY = VIEW.t + 4, maxY = r.height - VIEW.b - 4;
    kids.forEach(k => {
      const p = k.obj.localToWorld(k.lc.clone()).project(camera);
      if (p.z > 1) return;
      const sx = (p.x * 0.5 + 0.5) * r.width, sy = (-p.y * 0.5 + 0.5) * r.height;
      let el = labelPool[shown];
      if (!el) { el = document.createElement('button'); el.className = 'lbl'; el.innerHTML = '<b></b><span></span>'; els.labels.appendChild(el); labelPool.push(el); }
      const txt = k.name, num = String(ctx.kids.indexOf(k) + 1);
      if (el.dataset.t !== txt) { el.firstChild.textContent = num; el.lastChild.textContent = txt; el.dataset.t = txt; el.hidden = false; el._w = el.offsetWidth; el._h = el.offsetHeight; }
      el.firstChild.textContent = num;
      const w = el._w || 120, h = el._h || 24;
      let spot = null;
      for (const dy of [0, -(h + 3), h + 3, -2 * (h + 3), 2 * (h + 3)]) {
        const x0 = sx - w / 2, y0 = sy + dy - h / 2;
        if (x0 < minX || x0 + w > maxX || y0 < minY || y0 + h > maxY) continue;
        if (placed.some(q => x0 < q.x + q.w + 4 && x0 + w + 4 > q.x && y0 < q.y + q.h + 2 && y0 + h + 2 > q.y)) continue;
        spot = { x: x0, y: y0, w, h }; break;
      }
      if (!spot) return;
      placed.push(spot);
      el.hidden = false;
      el.classList.toggle('sel', k === SEL);
      el.onclick = () => { hideHint(); tapLabel(k); };
      el.style.transform = `translate(${spot.x}px, ${spot.y}px)`;
      labelPool[shown] = el;
      shown++;
    });
  }
  for (let i = shown; i < labelPool.length; i++) labelPool[i].hidden = true;
}
function tapLabel(k) { if (MODE === 'explode' && k.asm && !k.target) doExplode(k); else if (MODE === 'collapse' && k.asm && k.target) doCollapse(k); else select(k); }

/* ---------- formaat en weergave-offset ---------- */
function layoutView() {
  const wide = window.innerWidth >= 920;
  const top = document.getElementById('topbar').offsetHeight;
  if (wide) { VIEW.l = 0; VIEW.r = els.sheet.offsetWidth + 32; VIEW.t = top * 0.6; VIEW.b = document.getElementById('dock').offsetHeight; }
  else { VIEW.l = 0; VIEW.r = 0; VIEW.t = top; VIEW.b = (els.sheet.dataset.state === 'open' ? els.sheet.offsetHeight : els.sheet.offsetHeight + document.getElementById('dock').offsetHeight); }
  camera.setViewOffset(W, H, (VIEW.r - VIEW.l) / 2, (VIEW.b - VIEW.t) / 2, W, H);
  camera.updateProjectionMatrix();
  requestRender();
}
function resize() {
  W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight);
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  syncSheetHeight();
  layoutView();
}
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(() => { syncSheetHeight(); layoutView(); }).observe(els.sheet);

/* ---------- thema ---------- */
function refreshTheme() { const old = ground.material.map; ground.material.map = gridTexture(); ground.material.needsUpdate = true; old && old.dispose(); requestRender(); }
if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener ? mq.addEventListener('change', refreshTheme) : mq.addListener(refreshTheme); }
new MutationObserver(refreshTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- render-lus ---------- */
controls.addEventListener('change', requestRender);
controls.addEventListener('start', () => { camAnim = null; hideHint(); });
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
  let active = stepExplode(dt);
  if (stepCam(dt)) active = true;
  if (stepGround(dt)) active = true;
  controls.update();
  if (active || needs || controls.autoRotate) {
    renderer.render(scene, camera);
    updateLabels();
    needs = false;
    if (active && SEL) renderPanelStateOnly();
  }
}
let lastState = null;
function renderPanelStateOnly() { const s = SEL.asm ? SEL.target : -1; if (s !== lastState) { lastState = s; renderPanel(); applyMats(); if (treeVisible()) renderTree(); } }

/* ---------- start ---------- */
resize();
select(ROOT);
updateGround();
{ const b = predictedBox([ROOT]); fitBox(b, DIRS.iso, 1.04); if (camAnim) { camera.position.copy(camAnim.p1); controls.target.copy(camAnim.t1); camAnim = null; } }
controls.update();
renderer.render(scene, camera);
LOADING.classList.add('gone');
requestAnimationFrame(loop);
setTimeout(hideHint, 9000);
function finishAll() {
  for (const n of ASMS) { n.delay = 0; n.u = n.target; n.amt = ease(n.u); placeKids(n); }
  if (camAnim) { camera.position.copy(camAnim.p1); controls.target.copy(camAnim.t1); camAnim = null; }
  ground.position.y = groundTarget; controls.update(); requestRender();
}
window.__laguna = { finishAll, ROOT, ALL, MESHES, PRESETS, select, tapNode, byName, focusNodes, setTarget, explodeAllUnder, collapseAll, isolate };

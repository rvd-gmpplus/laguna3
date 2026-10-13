/* ===================== interactie, paneel, presetmenu's, labels, render-lus ===================== */
document.documentElement.lang = 'nl';
const $ = id => document.getElementById(id);
const els = {
  sheet: $('sheet'), crumbs: $('crumbs'), name: $('selName'), meta: $('selMeta'), desc: $('selDesc'), spec: $('selSpec'), kids: $('selKids'), kidsTitle: $('kidsTitle'),
  toggle: $('actToggle'), all: $('actAll'), up: $('actUp'), dive: $('actDive'), iso: $('actIsolate'), focus: $('actFocus'),
  tree: $('tree'), search: $('treeSearch'), treeInfo: $('treeInfo'), labels: $('labels'), leaders: $('leaders'), hint: $('hint'), presets: $('presets'), legend: $('legend'),
  menu: $('menu'), tip: $('tip'), press: $('press'), explode: $('explode'), explodeName: $('explodeName'), explodeOut: $('explodeOut'), play: $('play'), undo: $('undo'),
  help: $('help'), helpDlg: $('helpDlg'), tourBar: $('tourBar'), tourText: $('tourText'), tourStop: $('tourStop'), dock: $('dock'), topbar: $('topbar'),
  quality: $('tQuality'), qualityRow: $('qualityRow'), qualityNote: $('qualityNote'),
};
let MODE = 'part', LABELS = true, CTX = null, ACTIVE_PRESET = 'assembled', needs = true;
let uiLabelForce = false;
const requestRender = () => { needs = true; };
const fmtCount = n => (n.count === 1 ? '1 onderdeel' : `${n.count} onderdelen`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const uiTouch = !!(window.matchMedia && matchMedia('(hover: none), (pointer: coarse)').matches);
if (uiTouch) document.body.classList.add('touch');
controls.minDistance = 0.05;
let uiUiDirty = true;            // schermvlakken van de bediening opnieuw meten
let uiSyncPending = false;
const uiUiChanged = () => {
  uiUiDirty = true; requestRender();
  if (!uiSyncPending) { uiSyncPending = true; Promise.resolve().then(() => { uiSyncPending = false; uiSyncLabels(); }); }
};

/* ---------- hulpfuncties voor de boom ---------- */
function uiScopeRoot() { return ISO.length === 1 ? ISO[0] : ROOT; }
function pathFrom(n) { const p = []; for (let a = n; a; a = a.parent) { p.unshift(a); if (ISO.includes(a)) break; } return p; }
function uiClosedAbove(n) { for (let a = n.parent; a; a = a.parent) { if (!uiOpen(a)) return a; if (ISO.includes(a)) break; } return null; }
function uiDeepestOpen(p) { let a = null; pathFrom(p).forEach(x => { if (x.asm && uiOpen(x)) a = x; }); return a; }

/* ---------- selectie en paneel ---------- */
function select(n, opts = {}) {
  n = n || uiScopeRoot();
  if (uiLifted && uiLifted !== n) uiDrop();
  SEL = n;
  applyMats();
  renderPanel();
  if (opts.focus) focusNodes([SEL], null, SEL.asm ? 1.1 : 1.6, { min: 0.3 });
  if (treeVisible()) renderTree();
  uiSyncExplode();
  requestRender();
}
function renderPanel() {
  const n = SEL || ROOT;
  els.crumbs.innerHTML = '';
  ancestors(n).forEach((a, i) => {
    if (i) { const sp = document.createElement('span'); sp.textContent = '›'; els.crumbs.appendChild(sp); }
    const b = document.createElement('button'); b.textContent = a.name; b.onclick = () => { uiPush(); select(a, { focus: true }); uiAfterAction(); }; els.crumbs.appendChild(b);
  });
  els.name.textContent = n.name;
  let state;
  if (n.asm) state = uiOpen(n) ? '<span class="state open">Uitgeklapt</span>' : (n.target > 0 ? '<span class="state">Deels uitgeklapt</span>' : '<span class="state">Ingeklapt</span>');
  else state = n === uiLifted ? '<span class="state open">Uitgelicht</span>' : '<span class="state">Onderdeel</span>';
  const isoTxt = ISO.includes(n) ? ' · geïsoleerd' : '';
  els.meta.innerHTML = `${state}${n.asm ? fmtCount(n) : (n.parent ? 'in ' + esc(n.parent.name) : '')}${isoTxt}`;
  els.desc.textContent = n.d || '';
  els.spec.innerHTML = (n.spec || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  els.spec.hidden = !n.spec;
  els.kids.innerHTML = '';
  els.kidsTitle.hidden = !n.asm;
  if (n.asm) {
    els.kidsTitle.textContent = `Bestaat uit (${n.kids.length})`;
    const MAXK = 80;
    n.kids.slice(0, MAXK).forEach((k, i) => {
      const b = document.createElement('button');
      b.innerHTML = `<b>${i + 1}</b>${esc(k.name)}`;
      b.onclick = () => reveal(k);
      els.kids.appendChild(b);
    });
    if (n.kids.length > MAXK) {
      const b = document.createElement('button'); b.textContent = `… en nog ${n.kids.length - MAXK} (zie Onderdelen)`;
      b.onclick = () => { showTab('tree'); if (window.innerWidth < 920) setSheet('open'); };
      els.kids.appendChild(b);
    }
  }
  els.toggle.hidden = !n.asm;
  els.toggle.textContent = n.asm && uiOpen(n) ? 'Inklappen' : 'Uitklappen';
  els.all.hidden = !n.asm;
  els.dive.hidden = n.asm;
  els.up.disabled = !uiClosedAbove(n);
  els.up.title = els.up.disabled ? 'Alles boven deze selectie is al uitgeklapt' : 'De dichte groep boven de selectie uitklappen (Enter)';
  const isoOn = ISO.length === 1 && ISO[0] === n;
  els.iso.textContent = isoOn || (ISO.length && n === ROOT) ? 'Alles tonen' : 'Isoleren';
  els.iso.disabled = n === ROOT && !ISO.length;
  syncSheetHeight();
  uiUiDirty = true;
}
// Na elke gebruikershandeling: paneel, boom, schuif, presetknoppen en stap-terug bijwerken.
function uiAfterAction() {
  renderPanel();
  if (treeVisible()) renderTree();
  uiSyncExplode(); uiSyncCats(); uiSyncUndo();
  uiHideTip();
  uiSyncLabels();
  requestRender();
}
// Labels direct bijwerken (niet pas bij het volgende frame), zodat er nooit een label van een vorige stand blijft staan.
function uiSyncLabels() {
  if (!uiReady) return;
  ROOT.obj.updateMatrixWorld(); camera.updateMatrixWorld();
  updateLabels();
}
function uiAfterUndo() { applyMats(); uiAfterAction(); }
function clearPreset() { if (ACTIVE_PRESET) { ACTIVE_PRESET = null; uiSyncCats(); } }

/* ---------- handelingen ---------- */
// Klik op onderdeel P (modus Onderdeel): is de eigen groep G dicht, dan klapt alleen G ter plekke uit;
// staat G al open, dan wordt P geselecteerd en uitgelicht. Een klik klapt nooit een groep boven G uit.
function uiAct(p) {
  if (!p) { uiBackground(); return; }
  if (p.asm) { // label of lijst van een groep
    if (MODE === 'collapse') { if (uiOpen(p)) doCollapse(p); else { uiPush(); select(p); uiAfterAction(); } return; }
    if (MODE === 'select' || uiOpen(p)) { uiPush(); select(p); uiAfterAction(); return; }
    doExplode(p); return;
  }
  if (MODE === 'collapse') { uiCollapseAt(p); return; }
  if (MODE === 'select') { uiPush(); select(p); uiAfterAction(); return; }
  const g = MODE === 'layers' ? pathFrom(p).find(x => x.asm && !uiOpen(x)) : (uiOpen(p.parent) ? null : p.parent);
  if (g) { doExplode(g); return; }
  uiPush(); select(p); uiLift(p); uiAfterAction();
}
function tapNode(n) { uiAct(n); }
function doExplode(g) {
  uiPush();
  setTarget(g, 1);
  CTX = g; uiLabelForce = false; clearPreset();
  select(g);
  uiSoftFrame([g]);
  uiAfterAction();
}
function doCollapse(a) {
  uiPush();
  collapseTree(a);
  CTX = a.parent && uiOpen(a.parent) ? a.parent : null; uiLabelForce = false; clearPreset();
  select(a);
  uiAfterAction();
}
function uiCollapseAt(p) {
  const a = uiDeepestOpen(p);
  if (a) { doCollapse(a); return; }
  uiPush(); select(p); uiAfterAction();
}
function uiBackground() {
  const r = uiScopeRoot();
  if (SEL === r && !uiLifted) return;
  uiPush(); uiDrop(); select(r); uiAfterAction();
}
// Dubbelklik: alle dichte groepen op het pad van de isolatiewortel (of de auto) tot en met de ouder van P openen, laag voor laag.
function uiDive(p) {
  if (!p) return;
  uiPush();
  let i = 0;
  for (const a of pathFrom(p)) if (a.asm && a !== p && !uiOpen(a)) setTarget(a, 1, (i++) * (REDUCED ? 0 : 0.22));
  CTX = p.parent || p; uiLabelForce = false; clearPreset();
  select(p);
  focusNodes([p], null, p.asm ? 1.15 : 1.7, { min: 0.3, dur: Math.max(0.95, i * 0.22 + 0.55) });
  uiAfterAction();
}
function reveal(n) {
  uiPush();
  if (ISO.length && !uiInScope(n)) { ISO = []; applyVisibility(); updateGround(); }
  let i = 0;
  for (const a of ancestors(n)) if (!uiOpen(a)) setTarget(a, 1, (i++) * (REDUCED ? 0 : 0.18));
  CTX = n.parent || null; uiLabelForce = false; clearPreset();
  // telefoon: paneel terug naar de smalle stand, zodat je ziet wat er gebeurt
  if (window.innerWidth < 920 && els.sheet.dataset.state === 'open') setSheet('peek');
  select(n);
  focusNodes([n], null, n.asm ? 1.12 : 1.6, { min: 0.3, dur: Math.max(0.95, i * 0.18 + 0.55) });
  uiLastFit = { nodes: [n], dir: null, pad: n.asm ? 1.12 : 1.6, opt: { min: 0.3 } };
  uiAfterAction();
}
function uiUp() {
  const a = SEL && uiClosedAbove(SEL);
  if (a) doExplode(a);
}
// Kadreren na een klik: alleen bewegen als de groep niet (goed) in beeld is.
function uiSoftFrame(nodes) {
  const pts = uiCollect(nodes, true);
  if (!pts.length) return;
  const b = uiProject(pts), v = uiFreeView();
  const inside = b && b.x0 >= v.x0 && b.x1 <= v.x1 && b.y0 >= v.y0 && b.y1 <= v.y1;
  const cover = b ? ((b.x1 - b.x0) * (b.y1 - b.y0)) / Math.max(1, (v.x1 - v.x0) * (v.y1 - v.y0)) : 0;
  if (inside && cover > 0.06) return;
  const f = uiFitPoints(pts, null, 1.3, { min: 0.45 });
  if (f) { animCam(f.pos, f.target, 0.9); uiLastFit = { nodes, dir: null, pad: 1.3, opt: { min: 0.45 } }; }
}
const uiPv = V3(0, 0, 0);
function uiProject(pts) {
  camera.updateMatrixWorld();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < pts.length; i += 3) {
    uiPv.set(pts[i], pts[i + 1], pts[i + 2]).project(camera);
    if (uiPv.z > 1) return null;
    const x = (uiPv.x * 0.5 + 0.5) * W, y = (-uiPv.y * 0.5 + 0.5) * H;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return Number.isFinite(x0) ? { x0, y0, x1, y1 } : null;
}
function uiFreeView() { return { x0: VIEW.l, y0: VIEW.t, x1: W - VIEW.r, y1: H - VIEW.b }; }
function isolate(list) { ISO = list.slice(); applyVisibility(); applyMats(); updateGround(); requestRender(); }

els.toggle.onclick = () => { const n = SEL; if (!n.asm) return; uiOpen(n) ? doCollapse(n) : doExplode(n); };
els.all.onclick = () => { const n = SEL; if (!n.asm) return; uiPush(); explodeAllUnder(n); CTX = n; uiLabelForce = false; clearPreset(); focusNodes([n], null, 1.04); uiLastFit = { nodes: [n], dir: null, pad: 1.04 }; uiAfterAction(); };
els.up.onclick = uiUp;
els.dive.onclick = () => uiDive(SEL);
els.iso.onclick = () => {
  uiPush();
  const on = ISO.length && (ISO.includes(SEL) || SEL === ROOT);
  isolate(on ? [] : [SEL]); clearPreset();
  const nodes = on ? [ROOT] : [SEL];
  focusNodes(nodes); uiLastFit = { nodes, dir: null, pad: 1.08 };
  uiAfterAction();
};
els.focus.onclick = () => { const nodes = [SEL]; focusNodes(nodes, null, SEL.asm ? 1.08 : 1.6, { min: 0.25 }); uiLastFit = { nodes, dir: null, pad: SEL.asm ? 1.08 : 1.6, opt: { min: 0.25 } }; };

/* ---------- onderdelenboom ---------- */
const openRows = new Set([ROOT.id]);
function treeVisible() { return !$('tab-tree').hidden && (window.innerWidth >= 920 || els.sheet.dataset.state === 'open'); }
function treeRow(n, level) {
  const li = document.createElement('li'); li.setAttribute('role', 'none');
  const row = document.createElement('div'); row.className = 'trow' + (n === SEL ? ' sel' : ''); row.setAttribute('role', 'treeitem'); row.setAttribute('aria-level', String(level)); row.setAttribute('aria-selected', String(n === SEL));
  const tw = document.createElement('button'); tw.className = 'tw';
  if (n.asm) { const op = openRows.has(n.id); row.setAttribute('aria-expanded', String(op)); tw.textContent = op ? '▾' : '▸'; tw.setAttribute('aria-label', op ? 'Inklappen in lijst' : 'Uitklappen in lijst'); tw.onclick = () => { op ? openRows.delete(n.id) : openRows.add(n.id); renderTree(); }; } else { tw.tabIndex = -1; tw.setAttribute('aria-hidden', 'true'); }
  const dot = document.createElement('span'); dot.className = 'dot' + (uiOpen(n) ? ' open' : ''); if (!n.asm) dot.style.visibility = 'hidden';
  dot.title = uiOpen(n) ? 'uitgeklapt' : 'ingeklapt';
  const nm = document.createElement('button'); nm.className = 'tn'; nm.textContent = n.name; nm.onclick = () => reveal(n);
  const c = document.createElement('span'); c.className = 'tc'; c.textContent = n.asm ? n.count : '';
  row.append(tw, dot, nm, c); li.appendChild(row);
  if (n.asm && openRows.has(n.id)) { const ul = document.createElement('ul'); ul.setAttribute('role', 'group'); n.kids.forEach(k => ul.appendChild(treeRow(k, level + 1))); li.appendChild(ul); }
  return li;
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function renderTree() {
  const q = norm(els.search.value.trim());
  els.tree.innerHTML = '';
  const ul = document.createElement('ul');
  if (q.length >= 2) {
    const all = ALL.filter(n => n.norm.includes(q)), hits = all.slice(0, 80);
    els.treeInfo.textContent = all.length ? (all.length === 1 ? '1 treffer' : `${all.length} treffers`) + (all.length > hits.length ? `, de eerste ${hits.length} staan hieronder` : '') : 'Geen onderdeel gevonden met die naam.';
    hits.forEach(n => { const li = treeRow(n, 1); const small = document.createElement('div'); small.className = 'tpath'; small.textContent = ancestors(n).slice(1).map(a => a.name).join(' › ') || 'hele auto'; li.appendChild(small); ul.appendChild(li); });
  } else {
    els.treeInfo.textContent = q.length === 1 ? 'Typ minstens twee letters.' : '';
    ul.appendChild(treeRow(ROOT, 1));
  }
  els.tree.appendChild(ul);
}
els.search.addEventListener('input', renderTree);

/* ---------- tabs en paneel (mobiel) ---------- */
function showTab(id) {
  ['info', 'tree', 'view'].forEach(t => { $('tab-' + t).hidden = t !== id; $('tabbtn-' + t).setAttribute('aria-selected', String(t === id)); $('tabbtn-' + t).tabIndex = t === id ? 0 : -1; });
  if (id === 'tree') { ancestors(SEL).forEach(a => openRows.add(a.id)); renderTree(); }
}
['info', 'tree', 'view'].forEach((t, i, arr) => {
  const b = $('tabbtn-' + t);
  b.addEventListener('click', () => showTab(t));
  b.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const j = (i + (e.key === 'ArrowRight' ? 1 : arr.length - 1)) % arr.length; showTab(arr[j]); $('tabbtn-' + arr[j]).focus(); e.preventDefault(); });
});
function setSheet(state) {
  els.sheet.dataset.state = state;
  $('sheetToggle').setAttribute('aria-expanded', String(state === 'open'));
  $('sheetToggle').setAttribute('aria-label', state === 'open' ? 'Paneel kleiner maken' : 'Paneel groter maken');
  $('btnParts').setAttribute('aria-pressed', String(state === 'open' && !$('tab-tree').hidden));
  $('btnView').setAttribute('aria-pressed', String(state === 'open' && !$('tab-view').hidden));
  syncSheetHeight(); layoutView(); uiRefitSoon();
  if (treeVisible()) renderTree();
}
$('sheetToggle').onclick = () => setSheet(els.sheet.dataset.state === 'open' ? 'peek' : 'open');
$('btnParts').onclick = () => { const open = els.sheet.dataset.state === 'open' && !$('tab-tree').hidden; showTab('tree'); setSheet(open ? 'peek' : 'open'); };
$('btnView').onclick = () => { const open = els.sheet.dataset.state === 'open' && !$('tab-view').hidden; showTab('view'); setSheet(open ? 'peek' : 'open'); };
function syncSheetHeight() {
  if (window.innerWidth < 920) document.getElementById('app').style.setProperty('--sheet-h', (els.sheet.dataset.state === 'open' ? 0 : els.sheet.offsetHeight) + 'px');
}

/* ---------- weergave-bediening ---------- */
$('spread').addEventListener('input', e => { uiSetSpread(e.target.value / 100, false); $('spreadOut').textContent = e.target.value + '%'; requestRender(); });
$('spread').addEventListener('change', () => { updateGround(); focusNodes(contextNodes()); uiLastFit = { nodes: contextNodes(), dir: null, pad: 1.08 }; });
$('tLabels').addEventListener('change', e => { LABELS = e.target.checked; requestRender(); });
$('tXray').addEventListener('change', e => { uiPush(); XRAY = e.target.checked; clearPreset(); applyMats(); uiAfterAction(); });
$('tSys').addEventListener('change', e => { uiPush(); SYSCOL = e.target.checked; clearPreset(); applyMats(); uiAfterAction(); });
$('tRotate').addEventListener('change', e => { controls.autoRotate = e.target.checked; requestRender(); });
els.quality.addEventListener('change', e => uiSetLite(!e.target.checked));
$('tBatch').addEventListener('change', e => { uiSetBatching(e.target.checked); requestRender(); });
els.legend.innerHTML = Object.entries(SYS_COLORS).map(([k, c]) => `<span><i style="background:#${c.toString(16).padStart(6, '0')}"></i>${esc(k)}</span>`).join('');
document.querySelectorAll('[data-cam]').forEach(b => b.addEventListener('click', () => { const nodes = contextNodes(), dir = DIRS[b.dataset.cam]; focusNodes(nodes, dir); uiLastFit = { nodes, dir, pad: 1.08 }; }));
$('btnExplodeAll').onclick = () => { const r = uiScopeRoot(); uiPush(); explodeAllUnder(r); CTX = r; uiLabelForce = false; clearPreset(); focusNodes(contextNodes(), null, 1.02); uiAfterAction(); };
$('btnCollapseAll').onclick = () => { uiPush(); collapseAll(); uiDrop(); CTX = null; clearPreset(); focusNodes(contextNodes()); uiAfterAction(); };
$('btnShowAll').onclick = () => { uiPush(); isolate([]); clearPreset(); select(ROOT); focusNodes([ROOT]); uiAfterAction(); };
const uiModeBtns = [...document.querySelectorAll('#modes [data-mode]')];
function uiSetMode(m) {
  MODE = m;
  uiModeBtns.forEach(x => { const on = x.dataset.mode === m; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
  uiSetHover(null); uiHideTip(); requestRender();
}
uiModeBtns.forEach((b, i) => {
  b.addEventListener('click', () => uiSetMode(b.dataset.mode));
  b.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const j = (i + (e.key === 'ArrowRight' ? 1 : uiModeBtns.length - 1)) % uiModeBtns.length; uiSetMode(uiModeBtns[j].dataset.mode); uiModeBtns[j].focus(); e.preventDefault(); });
});

/* ---------- explosieschuif en afspelen ---------- */
// Werkgroep: de geselecteerde groep, anders de enige geïsoleerde groep, anders de hele auto.
// Met L niveaus en x = waarde × L krijgt een groep op relatieve diepte r doel clamp(x − r, 0, 1).
function uiWorking() { if (SEL && SEL.asm) return SEL; if (ISO.length === 1) return ISO[0]; return ROOT; }
const uiLevelCache = new Map();
function uiLevels(w) {
  let L = uiLevelCache.get(w);
  if (!L) { L = []; for (const a of subtree(w)) if (a.asm) { const r = a.depth - w.depth; (L[r] || (L[r] = [])).push(a); } uiLevelCache.set(w, L); }
  return L;
}
function uiExplodeX(w) { let x = 0; for (const lv of uiLevels(w)) { let s = 0; for (const a of lv) s += a.target; x += s / lv.length; } return x; }
function uiApplyX(w, x, now) { uiLevels(w).forEach((lv, r) => { const t = clamp(x - r, 0, 1); for (const a of lv) now ? uiSetNow(a, t) : setTarget(a, t, 0, 0.6); }); }
const uiFmt = (v, d = 1) => v.toFixed(d).replace('.', ',');
let uiDrag = false, uiPlayS = null;
function uiSyncExplode(fromSlider) {
  const w = uiWorking(), L = uiLevels(w).length, x = uiExplodeX(w), v = L ? x / L : 0;
  if (!fromSlider && !uiDrag) els.explode.value = String(Math.round(v * 1000));
  els.explodeOut.textContent = Math.round(v * 100) + '%';
  els.explode.setAttribute('aria-valuetext', `${uiFmt(x)} van ${L} ${L === 1 ? 'laag' : 'lagen'}`);
  if (els.explodeName.textContent !== w.name) { els.explodeName.textContent = w.name; uiUiDirty = true; }
  const lbl = uiPlayS ? 'Stop' : (v >= 0.999 ? 'Monteren' : 'Demonteren');
  if (els.play.lastChild.textContent !== lbl) { els.play.lastChild.textContent = lbl; els.play.setAttribute('aria-label', lbl); uiUiDirty = true; }
  els.play.setAttribute('aria-pressed', String(!!uiPlayS));
  els.play.firstChild.innerHTML = uiPlayS ? '<path d="M7 6h3v12H7zM14 6h3v12h-3z"/>' : (v >= 0.999 ? '<path d="M16 5L5 12l11 7z"/>' : '<path d="M8 5l11 7-11 7z"/>');
}
els.explode.addEventListener('input', () => {
  if (!uiDrag) { uiDrag = true; uiStopPlay(); uiStopTour(); hideHint(); uiPush(); }
  const w = uiWorking(), L = uiLevels(w).length;
  uiApplyX(w, (els.explode.value / 1000) * L, true);
  CTX = w; uiLabelForce = false; clearPreset();
  uiSyncExplode(true); requestRender();
});
els.explode.addEventListener('change', () => { uiDrag = false; updateGround(); uiAfterAction(); });
function uiSetExplodeValue(v) {
  uiStopPlay(); uiPush();
  const w = uiWorking();
  uiApplyX(w, clamp(v, 0, 1) * uiLevels(w).length, false);
  CTX = w; uiLabelForce = false; clearPreset(); updateGround();
  uiAfterAction();
}
function uiPlay() {
  if (uiPlayS) { uiStopPlay(); return; }
  uiStopTour(); uiPush();
  const w = uiWorking(), L = uiLevels(w).length, x0 = uiExplodeX(w);
  const up = x0 / L < 0.999, x1 = up ? L : 0;
  uiPlayS = { w, x: x0, x1, v: (up ? 1 : -1) / 0.8 };
  CTX = w; uiLabelForce = false; clearPreset();
  // camera naar de eindstand
  const saved = []; uiLevels(w).forEach((lv, r) => lv.forEach(a => { saved.push([a, a.target]); a.target = clamp(x1 - r, 0, 1); }));
  try { focusNodes([w], null, 1.05, { dur: Math.min(2.5, Math.abs(x1 - x0) * 0.8) }); } finally { saved.forEach(([a, t]) => { a.target = t; }); }
  if (REDUCED) finishAll();
  uiAfterAction();
}
function uiStepPlay(dt) {
  const s = uiPlayS; if (!s) return false;
  s.x += s.v * dt;
  const done = s.v > 0 ? s.x >= s.x1 : s.x <= s.x1;
  if (done) s.x = s.x1;
  uiApplyX(s.w, s.x, true);
  if (done) { uiPlayS = null; updateGround(); uiAfterAction(); } else uiSyncExplode();
  return true;
}
function uiStopPlay() { if (!uiPlayS) return; uiPlayS = null; updateGround(); uiAfterAction(); }
els.play.onclick = uiPlay;
els.undo.onclick = () => { uiStopPlay(); uiStopTour(); uiUndo(); };
function uiSyncUndo() { els.undo.disabled = !uiHist.length; }

/* ---------- presets: categorieknoppen en menu ---------- */
let uiMenuCat = null, uiMenuBtn = null;
function uiBuildCats() {
  els.presets.innerHTML = '';
  for (const cat of appCats) {
    const list = PRESETS.filter(p => p.cat === cat && appPresetOk(p));
    if (!list.length) continue;
    const b = document.createElement('button');
    b.className = 'cat'; b.dataset.cat = cat; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = `<b>${esc(cat)}</b><small></small>`;
    b.onclick = () => (uiMenuCat === cat ? uiCloseMenu(true) : uiOpenMenu(cat, b));
    b.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); uiOpenMenu(cat, b); } });
    els.presets.appendChild(b);
  }
  uiSyncCats();
}
function uiSyncCats() {
  const p = ACTIVE_PRESET && appPresetById.get(ACTIVE_PRESET);
  for (const b of els.presets.children) {
    const cat = b.dataset.cat, n = PRESETS.filter(q => q.cat === cat && appPresetOk(q)).length;
    const on = !!p && p.cat === cat;
    b.classList.toggle('on', on);
    const txt = cat === 'Overzicht' && appTour ? 'Rondleiding loopt' : (on ? p.label : `${n} presets`);
    if (b.lastChild.textContent !== txt) { b.lastChild.textContent = txt; uiUiDirty = true; }
    b.setAttribute('aria-label', `${cat}${on ? ', actief: ' + p.label : ''}`);
  }
}
function uiMenuItems() { return [...els.menu.querySelectorAll('.mi')]; }
function uiOpenMenu(cat, btn) {
  uiCloseMenu(false);
  uiMenuCat = cat; uiMenuBtn = btn;
  const m = els.menu;
  m.innerHTML = '';
  m.setAttribute('aria-label', 'Presets ' + cat);
  const head = document.createElement('div'); head.className = 'mhead';
  head.innerHTML = `<span>${esc(cat)}</span>`;
  const close = document.createElement('button'); close.className = 'mclose'; close.setAttribute('aria-label', 'Menu sluiten'); close.textContent = '×'; close.onclick = () => uiCloseMenu(true);
  head.appendChild(close); m.appendChild(head);
  for (const p of PRESETS.filter(q => q.cat === cat && appPresetOk(q))) {
    const b = document.createElement('button');
    b.className = 'mi'; b.setAttribute('role', 'menuitem'); b.dataset.preset = p.id; b.tabIndex = -1;
    const label = p.tour && appTour ? 'Stop rondleiding' : p.label;
    b.innerHTML = `<span class="mi-t">${esc(label)}${p.key ? `<kbd>${p.key}</kbd>` : ''}</span><span class="mi-n">${esc(p.note)}</span>`;
    if (p.id === ACTIVE_PRESET) b.setAttribute('aria-current', 'true');
    b.onclick = () => { uiCloseMenu(false); uiRunPreset(p.id); };
    m.appendChild(b);
  }
  m.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  uiPlaceMenu();
  const items = uiMenuItems();
  const cur = items.find(i => i.getAttribute('aria-current') === 'true') || items[0];
  if (cur) cur.focus({ preventScroll: true });
  uiUiChanged();
}
function uiPlaceMenu() {
  const m = els.menu, btn = uiMenuBtn;
  if (!btn || m.hidden) return;
  if (window.innerWidth <= 600) { m.style.left = ''; m.style.top = ''; m.style.bottom = ''; m.style.maxHeight = ''; return; }
  const r = btn.getBoundingClientRect();
  const w = m.offsetWidth;
  m.style.left = clamp(r.left, 8, window.innerWidth - w - 8) + 'px';
  m.style.top = 'auto';
  m.style.bottom = (window.innerHeight - r.top + 8) + 'px';
  m.style.maxHeight = Math.max(160, r.top - 16) + 'px';
}
function uiCloseMenu(focusBack) {
  if (!uiMenuCat) return;
  els.menu.hidden = true; els.menu.innerHTML = '';
  if (uiMenuBtn) { uiMenuBtn.setAttribute('aria-expanded', 'false'); if (focusBack) uiMenuBtn.focus({ preventScroll: true }); }
  uiMenuCat = null; uiMenuBtn = null;
  uiUiChanged();
}
function uiMenuKey(e) {
  const items = uiMenuItems(); if (!items.length) return false;
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const j = i < 0 ? 0 : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length; items[j].focus(); return true; }
  if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus(); return true; }
  if (e.key === 'Escape') { e.preventDefault(); uiCloseMenu(true); return true; }
  if (e.key === 'Tab') { uiCloseMenu(false); return false; }
  if (e.key === 'Enter' || e.key === ' ') { if (i >= 0) { e.preventDefault(); items[i].click(); } return true; }
  return false;
}
document.addEventListener('pointerdown', e => {
  const t = e.target;
  if (uiMenuCat && !els.menu.contains(t) && !(uiMenuBtn && uiMenuBtn.contains(t))) uiCloseMenu(false);
  if (!(t.closest && t.closest('#play'))) uiStopPlay();
  if (!(t.closest && t.closest('#tourStop, #menu, [data-cat="Overzicht"], #help, #helpDlg'))) uiStopTour();
  hideHint();
}, true);
function uiRunPreset(id) {
  const p = appPresetById.get(id); if (!p) return false;
  hideHint(); uiCloseMenu(false);
  if (p.tour) { appTour ? uiStopTour() : uiStartTour(); return true; }
  const ok = appApplyPreset(p);
  uiLastFit = { preset: p };
  return ok;
}
function uiTourCaption(p, i, n) {
  if (!p) { els.tourBar.hidden = true; uiUiChanged(); return; }
  els.tourText.innerHTML = `<b>Rondleiding ${i + 1} van ${n} · ${esc(p.label)}</b>${esc(p.note)}`;
  els.tourBar.hidden = false;
  uiUiChanged();
}
function uiSyncTour() { uiSyncCats(); }
els.tourStop.onclick = () => uiStopTour();

/* ---------- aanwijzen en tikken ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
ray.layers.enableAll(); // samengevoegd getekende onderdelen staan op laag 1 en blijven aanwijsbaar
let uiPickXray = [], uiPickXrayKey = -1;
function uiPickList() {
  if (!XRAY) return uiPickable;
  if (uiPickXrayKey !== uiPickVer) { uiPickXray = uiPickable.filter(m => !m.userData.node.isBody); uiPickXrayKey = uiPickVer; }
  return uiPickXray;
}
function pick(cx, cy, loose) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  camera.updateMatrixWorld(); ROOT.obj.updateMatrixWorld();
  ray.setFromCamera(ndc, camera);
  const list = uiPickList();
  const hit = ray.intersectObjects(list, false)[0];
  if (hit) return hit.object.userData.node;
  if (!loose) return null;
  // vinger naast een klein onderdeel: het dichtstbijzijnde onderdeel binnen 22 px
  let best = null, bd = 22 * 22;
  for (const m of list) {
    const n = m.userData.node;
    uiPv.copy(n.lc).applyMatrix4(m.matrixWorld).project(camera);
    if (uiPv.z > 1) continue;
    const dx = (uiPv.x * 0.5 + 0.5) * r.width + r.left - cx, dy = (-uiPv.y * 0.5 + 0.5) * r.height + r.top - cy, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}
// Wat een klik in de huidige modus zou raken.
function uiActTarget(p) {
  if (!p) return null;
  if (MODE === 'part') return uiOpen(p.parent) ? p : p.parent;
  if (MODE === 'layers') return pathFrom(p).find(x => x.asm && !uiOpen(x)) || p;
  if (MODE === 'collapse') return uiDeepestOpen(p) || p;
  return p;
}
function uiTipText(p, t) {
  if (MODE === 'collapse') return t.asm ? `${t.name} · ${fmtCount(t)} · klik om in te klappen` : `${p.name} · <i>niets uitgeklapt om in te klappen</i>`;
  if (MODE === 'select') return `${p.name} · <i>klik voor gegevens</i>`;
  if (t.asm) return `${t.name} · ${fmtCount(t)} · klik om uit te klappen`;
  return `${t.name} · <i>klik om uit te lichten</i>`;
}
function uiShowTip(html, x, y) {
  const tip = els.tip;
  if (tip._h !== html) { tip.innerHTML = html.replace(/<(?!\/?i>)/g, '&lt;'); tip._h = html; }
  tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let tx = x + 14, ty = y + 16;
  if (tx + w > window.innerWidth - 8) tx = Math.max(8, x - w - 12);
  if (ty + h > window.innerHeight - 8) ty = y - h - 12;
  tip.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px)`;
}
function uiHideTip() { els.tip.hidden = true; if (uiSetHover(null)) requestRender(); canvas.style.cursor = ''; }
let uiHoverPos = null, uiHoverT = 0, uiHoverTimer = 0;
function uiDoHover() {
  uiHoverTimer = 0;
  if (!uiHoverPos) return;
  uiHoverT = performance.now();
  const p = pick(uiHoverPos.x, uiHoverPos.y);
  if (!p) { uiHideTip(); return; }
  const t = uiActTarget(p);
  if (uiSetHover(t)) requestRender();
  uiShowTip(uiTipText(p, t), uiHoverPos.x, uiHoverPos.y);
  canvas.style.cursor = 'pointer';
}
function uiHoverTarget(x, y) { const p = pick(x, y); const t = uiActTarget(p); return t ? t.name : null; }

const uiPtrs = new Map();
let down = null, pointers = 0, uiLastTap = null, uiPressS = null;
function uiCancelPress() {
  if (!uiPressS) return;
  clearTimeout(uiPressS.show); clearTimeout(uiPressS.fire); clearTimeout(uiPressS.zero); cancelAnimationFrame(uiPressS.raf);
  els.press.hidden = true; els.press.classList.remove('run');
  uiPressS = null;
}
// Lang drukken, tikken en dubbeltikken worden beslist op de tijdstempels van het gebaar zelf (event.timeStamp),
// niet op het moment waarop een handler toevallig draait. De timer toont de ring en wapent het lang drukken;
// vóór het doorvoeren laat hij wachtende invoer eerst afhandelen (een animatieframe en daarna een nul-timeout).
// Komt er in die tijd een pointerup of pointercancel binnen, dan beslist die (op zijn eigen tijdstempel).
const UI_PRESS_MS = 500;
function uiCommitPress(d, fromUp) {
  if (d.consumed || (d.ended && !fromUp)) return;
  d.consumed = true;
  if (uiPressS && uiPressS.d === d) uiCancelPress();
  try { navigator.vibrate && navigator.vibrate(12); } catch (_) { }
  if (d.pick) uiCollapseAt(d.pick);
}
function uiStartPress(d) {
  uiCancelPress();
  const s = uiPressS = { d, raf: 0, zero: 0 };
  s.show = setTimeout(() => { els.press.style.transform = `translate(${d.x}px, ${d.y}px)`; els.press.hidden = false; void els.press.offsetWidth; els.press.classList.add('run'); }, 150);
  // gewapend: eerst wachtende invoer laten afhandelen, dan pas doorvoeren als de vinger er nog ligt. Kwam een timer
  // te laat (de hoofddraad was bezig, er kan invoer in de rij staan), dan opnieuw kijken tot de draad weer vrij is.
  s.tries = 0;
  const later = (ms, fn) => { const due = performance.now() + ms; s.fire = setTimeout(() => fn(performance.now() - due), ms); };
  const check = lag => {
    if (uiPressS !== s || d.ended) return;
    if (lag > 40 && s.tries++ < 40) { later(30, check); return; }
    s.raf = requestAnimationFrame(() => later(0, lag2 => {
      if (uiPressS !== s || d.ended) return;
      if (lag2 > 40 && s.tries++ < 40) { later(30, check); return; }
      uiCommitPress(d);
    }));
  };
  later(UI_PRESS_MS, check);
}
canvas.addEventListener('pointerdown', e => {
  uiPtrs.set(e.pointerId, e.pointerType);
  pointers = uiPtrs.size;
  try { canvas.focus({ preventScroll: true }); } catch (_) { }
  uiHideTip();
  if (uiPtrs.size === 1) {
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, type: e.pointerType, button: e.button, shift: e.shiftKey, consumed: false, ended: false };
    down.pick = pick(e.clientX, e.clientY, e.pointerType !== 'mouse'); // de pick van deze tik, ook voor een dubbeltik
    if (e.pointerType !== 'mouse' && e.button === 0) uiStartPress(down);
  } else { if (down) down.ended = true; down = null; uiCancelPress(); }
});
canvas.addEventListener('pointermove', e => {
  if (down && down.id === e.pointerId && Math.hypot(e.clientX - down.x, e.clientY - down.y) >= 7) uiCancelPress();
  if (e.pointerType !== 'mouse' || e.buttons) { if (!els.tip.hidden) uiHideTip(); return; }
  uiHoverPos = { x: e.clientX, y: e.clientY };
  const wait = 60 - (performance.now() - uiHoverT);
  if (wait <= 0) uiDoHover(); else if (!uiHoverTimer) uiHoverTimer = setTimeout(uiDoHover, wait);
});
canvas.addEventListener('pointerleave', () => { uiHoverPos = null; clearTimeout(uiHoverTimer); uiHoverTimer = 0; uiHideTip(); });
canvas.addEventListener('pointerup', e => {
  uiPtrs.delete(e.pointerId); pointers = uiPtrs.size;
  if (!down || down.id !== e.pointerId) return;
  const d = down; down = null;
  d.ended = true;
  uiCancelPress();
  if (d.consumed) return;
  const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y), dt = e.timeStamp - d.t;
  if (moved >= 7) return; // slepen is nooit een klik
  // lang drukken op touch: beslist door de duur van het gebaar zelf, ook als de timer nog niet aan de beurt was
  if (d.type !== 'mouse' && d.button === 0 && dt >= UI_PRESS_MS) { uiCommitPress(d, true); return; }
  if (dt >= 600) return;
  if (d.button === 2) { if (d.type === 'mouse') { d.pick ? uiCollapseAt(d.pick) : uiBackground(); } return; }
  if (d.button !== 0) return;
  const now = e.timeStamp, L = uiLastTap;
  if (L && now - L.t < 420 && now - L.t >= 0 && Math.hypot(e.clientX - L.x, e.clientY - L.y) < 26 && L.type === d.type) {
    uiLastTap = null;
    if (L.pick) uiDive(L.pick); // altijd het onderdeel van de eerste tik
    return;
  }
  uiLastTap = { t: now, x: e.clientX, y: e.clientY, pick: d.pick, type: d.type };
  if (d.shift) { d.pick ? uiCollapseAt(d.pick) : uiBackground(); return; }
  uiAct(d.pick);
});
const uiPtrReset = () => { uiPtrs.clear(); pointers = 0; if (down) down.ended = true; down = null; uiCancelPress(); };
canvas.addEventListener('pointercancel', e => { uiPtrs.delete(e.pointerId); pointers = uiPtrs.size; if (down && down.id === e.pointerId) { down.ended = true; down = null; } uiCancelPress(); });
canvas.addEventListener('lostpointercapture', e => { if (uiPtrs.has(e.pointerId) && down && down.id === e.pointerId && down.type !== 'mouse') { uiPtrs.delete(e.pointerId); pointers = uiPtrs.size; } });
window.addEventListener('blur', uiPtrReset);
document.addEventListener('visibilitychange', () => { if (document.hidden) uiPtrReset(); });
canvas.addEventListener('contextmenu', e => e.preventDefault()); // rechtsklik zelf wordt in pointerup afgehandeld (niet na slepen)
canvas.addEventListener('wheel', () => { uiStopPlay(); uiStopTour(); hideHint(); uiHideTip(); }, { passive: true });

/* ---------- hint en hulp ---------- */
const uiHintKey = 'laguna3-hint-v2';
function uiInitHint() {
  let seen = false;
  try { seen = window.localStorage.getItem(uiHintKey) === '1'; } catch (_) { seen = false; }
  if (seen) { els.hint.hidden = true; return; }
  els.hint.textContent = uiTouch
    ? 'Tik op een onderdeel om het uit te klappen · dubbeltik om er direct heen te gaan · houd vast om in te klappen'
    : 'Klik op een onderdeel om het uit te klappen · dubbelklik om er direct naartoe te gaan · rechtsklik om in te klappen';
  setTimeout(hideHint, 9000);
}
function hideHint(instant) {
  if (instant === true && !els.hint.hidden) { els.hint.hidden = true; els.hint.classList.add('gone'); try { window.localStorage.setItem(uiHintKey, '1'); } catch (_) { } uiUiChanged(); return; }
  if (els.hint.hidden || els.hint.classList.contains('gone')) return;
  els.hint.classList.add('gone');
  try { window.localStorage.setItem(uiHintKey, '1'); } catch (_) { }
  setTimeout(() => { els.hint.hidden = true; uiUiChanged(); uiSyncLabels(); }, REDUCED ? 0 : 450);
}
function uiHelp(open) {
  els.helpDlg.hidden = !open;
  if (open) {
    const m = $('helpMouse'), t = $('helpTouch');
    if (uiTouch) m.before(t); else t.before(m);
    $('helpClose').focus({ preventScroll: true });
    els.helpDlg.firstElementChild.scrollTop = 0;
  } else els.help.focus({ preventScroll: true });
  uiUiChanged();
}
els.help.onclick = () => uiHelp(true);
$('helpClose').onclick = () => uiHelp(false);
els.helpDlg.addEventListener('click', e => { if (e.target === els.helpDlg) uiHelp(false); });

/* ---------- toetsenbord (werkt zodra de pagina de focus heeft; het canvas krijgt die bij de eerste aanraking) ---------- */
function uiEnter(shift) {
  const n = SEL || ROOT;
  if (shift) { if (n.asm && uiOpen(n)) doCollapse(n); else if (!n.asm) uiCollapseAt(n); return; }
  if (n.asm && !uiOpen(n)) { doExplode(n); return; }
  const a = uiClosedAbove(n);
  if (a) { doExplode(a); return; }
  if (n.asm) doCollapse(n); else { uiPush(); uiLift(n); uiAfterAction(); }
}
window.addEventListener('keydown', e => {
  const t = e.target;
  if (!els.helpDlg.hidden) { if (e.key === 'Escape') { e.preventDefault(); uiHelp(false); } return; }
  if (uiMenuCat && uiMenuKey(e)) return;
  const typing = t && ((t.tagName === 'INPUT' && !/^(range|checkbox|radio|button)$/.test(t.type)) || t.tagName === 'TEXTAREA' || t.isContentEditable);
  if (typing) { if (e.key === 'Escape') t.blur(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const onCtl = !!(t && t.closest && t.closest('button, a, input, select, summary'));
  if (e.key === 'Escape') { uiStopPlay(); uiStopTour(); hideHint(); uiBackground(); return; }
  if (e.key === 'Enter') { if (onCtl) return; e.preventDefault(); uiStopPlay(); uiStopTour(); hideHint(); uiEnter(e.shiftKey); return; }
  if (e.key === 'Backspace') { e.preventDefault(); uiStopPlay(); uiStopTour(); uiUndo(); return; }
  if (e.key === '?') { e.preventDefault(); uiHelp(true); return; }
  // pijltjes (niet op een bedieningselement): door de boom lopen. Omhoog = bovenliggende groep, omlaag = eerste deel,
  // links/rechts = vorige/volgende op hetzelfde niveau (audit U29). Selecteren en in beeld houden, niets uitklappen.
  if (!onCtl && /^Arrow(Up|Down|Left|Right)$/.test(e.key)) {
    const n = SEL || ROOT, sib = n.parent ? n.parent.kids : [n];
    let m = null;
    if (e.key === 'ArrowUp') m = n.parent && (!ISO.length || uiInScope(n.parent)) ? n.parent : null;
    else if (e.key === 'ArrowDown') m = n.asm ? n.kids.find(k => k.ev) : null;
    else { const i = sib.indexOf(n), d = e.key === 'ArrowRight' ? 1 : -1; for (let j = 1; j < sib.length && !m; j++) { const k = sib[(i + d * j + sib.length * j) % sib.length]; if (k.ev) m = k; } }
    if (m && m !== n) { e.preventDefault(); uiStopPlay(); uiStopTour(); hideHint(); uiPush(); select(m); uiSoftFrame([m]); uiAfterAction(); }
    return;
  }
  if (/^[0-9]$/.test(e.key)) {
    const p = PRESETS.find(q => q.key === e.key);
    if (p && appPresetOk(p)) { e.preventDefault(); uiStopPlay(); uiStopTour(); uiRunPreset(p.id); }
  }
});

/* ---------- labels: genummerde callouts met leiderlijn ---------- */
const labelPool = [], uiLinePool = [], uiDotPool = [];
const uiSvgNs = 'http://www.w3.org/2000/svg';
let uiRectCache = [], uiNPlaced = 0, uiVx0 = 0, uiVy0 = 0, uiVx1 = 0, uiVy1 = 0;
const uiCands = [], uiSpots = [];
const uiAnchor = V3(0, 0, 0), uiGc = V3(0, 0, 0);
function uiLabelGroup() {
  if (!LABELS) return null;
  if (uiLabelForce && CTX) return CTX;
  if (SEL && SEL.asm && uiOpen(SEL) && SEL.amt > 0.6) return SEL;
  if (CTX && uiOpen(CTX) && CTX.amt > 0.6) return CTX;
  return null;
}
function uiNewLabel() {
  const el = document.createElement('button');
  el.className = 'lbl'; el.hidden = true; el.tabIndex = -1;
  el.innerHTML = '<b></b><span></span>';
  el.addEventListener('click', () => { const k = el._k; if (!k) return; uiStopPlay(); uiStopTour(); hideHint(); uiAct(k); });
  els.labels.appendChild(el);
  const ln = document.createElementNS(uiSvgNs, 'line'); ln.style.display = 'none'; els.leaders.appendChild(ln);
  const dot = document.createElementNS(uiSvgNs, 'circle'); dot.setAttribute('r', '3'); dot.style.display = 'none'; els.leaders.appendChild(dot);
  labelPool.push(el); uiLinePool.push(ln); uiDotPool.push(dot);
  return el;
}
function uiHideLabel(i) {
  const el = labelPool[i];
  if (!el.hidden) { el.hidden = true; el.style.transform = 'translate(-9999px,-9999px)'; el._x = el._y = null; }
  el._k = null;
  if (uiLinePool[i].style.display !== 'none') { uiLinePool[i].style.display = 'none'; uiDotPool[i].style.display = 'none'; }
}
function uiMeasureUi() {
  const out = [];
  const add = (id, el) => { if (!el || el.hidden) return; const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) out.push({ id, x: r.left, y: r.top, w: r.width, h: r.height }); };
  add('panel', els.sheet);
  add('modes', $('modes')); add('explode', $('xctl')); add('presets', els.presets);
  add('title', els.topbar.querySelector('.title')); add('topActions', els.topbar.querySelector('.top-actions'));
  if (!els.hint.hidden && !els.hint.classList.contains('gone')) add('hint', els.hint);
  if (!els.menu.hidden) add('menu', els.menu);
  if (!els.tourBar.hidden) add('tour', els.tourBar);
  if (!els.helpDlg.hidden) add('help', els.helpDlg.firstElementChild);
  return out;
}
function uiRects() { return uiMeasureUi(); }
const uiDirs = [0, 0.52, -0.52, 1.05, -1.05, 1.57, -1.57, 2.36, -2.36, 3.14];
const uiRadii = [30, 52, 78, 110, 150];
function updateLabels() {
  if (uiUiDirty) { uiRectCache = uiMeasureUi(); uiUiDirty = false; }
  const g = uiLabelGroup();
  const max = W < 600 ? 10 : 24;
  uiCands.length = 0;
  if (SEL && !SEL.asm && SEL.ev && LABELS) uiCands.push(SEL);
  if (g) for (const k of g.bySize) { if (uiCands.length >= max) break; if (k !== SEL && k.ev) uiCands.push(k); }
  // nieuwe teksten eerst toewijzen, dan in één keer meten
  while (labelPool.length < uiCands.length) uiNewLabel();
  for (let i = 0; i < uiCands.length; i++) {
    const k = uiCands[i], el = labelPool[i];
    if (el._t !== k) { el.firstChild.textContent = String(k.idx + 1); el.lastChild.textContent = k.name; el.title = k.name; el._t = k; el.setAttribute('aria-label', `${k.idx + 1}. ${k.name}`); }
  }
  for (let i = 0; i < uiCands.length; i++) {
    const k = uiCands[i];
    if (k._lw == null) { const el = labelPool[i]; const wasHidden = el.hidden; el.hidden = false; k._lw = el.offsetWidth; k._lh = el.offsetHeight; if (wasHidden) el.hidden = true; }
  }
  const v = uiFreeView(), M = 4;
  uiVx0 = v.x0 + M; uiVy0 = v.y0 + M; uiVx1 = v.x1 - M; uiVy1 = v.y1 - M;
  uiNPlaced = 0;
  let gx = 0, gy = 0;
  if (g) { uiGc.copy(g.lc).applyMatrix4(g.obj.matrixWorld).project(camera); gx = (uiGc.x * 0.5 + 0.5) * W; gy = (-uiGc.y * 0.5 + 0.5) * H; }
  let shown = 0;
  for (let i = 0; i < uiCands.length; i++) {
    const k = uiCands[i], el = labelPool[i];
    uiAnchor.copy(k.lc).applyMatrix4(k.obj.matrixWorld).project(camera);
    const ax = (uiAnchor.x * 0.5 + 0.5) * W, ay = (-uiAnchor.y * 0.5 + 0.5) * H;
    const w = k._lw || 100, h = k._lh || 22;
    let found = false, dx = 0, dy = 0;
    if (uiAnchor.z <= 1 && ax >= uiVx0 && ax <= uiVx1 && ay >= uiVy0 && ay <= uiVy1) {
      // eerst de vorige plek (rustig beeld tijdens animaties), dan ringen rond het anker, van de groep af gericht
      if (k._lo && uiFits(ax + k._lo[0] - w / 2, ay + k._lo[1] - h / 2, w, h)) { found = true; dx = k._lo[0]; dy = k._lo[1]; }
      const base = g && Math.abs(ax - gx) + Math.abs(ay - gy) > 6 ? Math.atan2(ay - gy, ax - gx) : -HALF;
      for (let ri = 0; !found && ri < uiRadii.length; ri++) {
        const R = uiRadii[ri];
        for (let di = 0; di < uiDirs.length; di++) {
          const a = base + uiDirs[di], ca = Math.cos(a), sa = Math.sin(a);
          dx = ca * (R + w / 2 * Math.abs(ca)); dy = sa * (R * 0.75 + h / 2 * Math.abs(sa));
          if (uiFits(ax + dx - w / 2, ay + dy - h / 2, w, h)) { found = true; if (!k._lo) k._lo = [0, 0]; k._lo[0] = dx; k._lo[1] = dy; break; }
        }
      }
    }
    if (!found) { uiHideLabel(i); continue; }
    const x = ax + dx - w / 2, y = ay + dy - h / 2;
    let sp = uiSpots[uiNPlaced];
    if (!sp) sp = uiSpots[uiNPlaced] = { x: 0, y: 0, w: 0, h: 0, ax: 0, ay: 0, k: null };
    sp.x = x; sp.y = y; sp.w = w; sp.h = h; sp.ax = ax; sp.ay = ay; sp.k = k;
    uiNPlaced++;
    el._k = k;
    const isSel = k === SEL;
    if (el._sel !== isSel) { el._sel = isSel; el.classList.toggle('sel', isSel); uiDotPool[i].classList.toggle('sel', isSel); }
    const rx = Math.round(x), ry = Math.round(y);
    if (el._x !== rx || el._y !== ry || el.hidden) { el._x = rx; el._y = ry; el.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; }
    if (el.hidden) el.hidden = false;
    // leiderlijn van het ankerpunt naar de dichtstbijzijnde rand van het label
    const x1 = Math.round(ax), y1 = Math.round(ay), x2 = Math.round(clamp(ax, x, x + w)), y2 = Math.round(clamp(ay, y, y + h));
    const ln = uiLinePool[i], dot = uiDotPool[i];
    if (ln._x1 !== x1 || ln._y1 !== y1 || ln._x2 !== x2 || ln._y2 !== y2) {
      ln._x1 = x1; ln._y1 = y1; ln._x2 = x2; ln._y2 = y2;
      ln.setAttribute('x1', x1); ln.setAttribute('y1', y1); ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
      dot.setAttribute('cx', x1); dot.setAttribute('cy', y1);
    }
    if (ln.style.display) { ln.style.display = ''; dot.style.display = ''; }
    shown++;
  }
  for (let i = uiCands.length; i < labelPool.length; i++) uiHideLabel(i);
  return shown;
}
// vrije plek voor een label: binnen het vrije beeld, niet over andere labels of hun ankers, niet over de bediening
function uiFits(x, y, w, h) {
  if (x < uiVx0 || y < uiVy0 || x + w > uiVx1 || y + h > uiVy1) return false;
  for (let j = 0; j < uiNPlaced; j++) {
    const q = uiSpots[j];
    if (x < q.x + q.w + 4 && x + w + 4 > q.x && y < q.y + q.h + 4 && y + h + 4 > q.y) return false;
    if (q.ax > x - 3 && q.ax < x + w + 3 && q.ay > y - 3 && q.ay < y + h + 3) return false;
  }
  for (let j = 0; j < uiRectCache.length; j++) {
    const q = uiRectCache[j];
    if (x < q.x + q.w + 2 && x + w + 2 > q.x && y < q.y + q.h + 2 && y + h + 2 > q.y) return false;
  }
  return true;
}
function uiLabelRects() { return uiSpots.slice(0, uiNPlaced).map(p => ({ name: p.k.name, x: p.x, y: p.y, w: p.w, h: p.h })); }

/* ---------- formaat en vrij beeld ---------- */
let uiLastFit = null, uiRefitTimer = 0;
const uiViewPrev = { l: -99, r: -99, t: -99, b: -99 };
let uiViewW = 0, uiViewH = 0;
function layoutView() {
  const wide = window.innerWidth >= 920;
  const title = els.topbar.querySelector('.title').getBoundingClientRect();
  const acts = els.topbar.querySelector('.top-actions').getBoundingClientRect();
  const sheet = els.sheet.getBoundingClientRect();
  let dockTop = H;
  for (const el of [$('modes'), $('xctl'), els.presets]) { const r = el.getBoundingClientRect(); if (r.height > 0 && r.top < dockTop) dockTop = r.top; }
  if (wide) {
    VIEW.l = 0; VIEW.r = Math.max(0, W - sheet.left + 8);
    VIEW.t = Math.min(H * 0.3, title.bottom + 6);
    VIEW.b = Math.max(0, H - dockTop + 6);
  } else {
    VIEW.l = 0; VIEW.r = 0;
    VIEW.t = Math.min(H * 0.3, Math.max(title.bottom, acts.bottom) + 4);
    const bottom = els.sheet.dataset.state === 'open' ? sheet.top : Math.min(dockTop, sheet.top);
    VIEW.b = Math.max(0, H - bottom + 4);
  }
  // Kleine verschuivingen van de bediening (een focusrand, een paar pixels in het dock) verschuiven het beeld niet:
  // anders springt de scène onder de vinger weg tussen aanwijzen en tikken.
  for (const k of ['l', 'r', 't', 'b']) { if (Math.abs(VIEW[k] - uiViewPrev[k]) < 6 && uiViewW === W && uiViewH === H) VIEW[k] = uiViewPrev[k]; uiViewPrev[k] = VIEW[k]; }
  uiViewW = W; uiViewH = H;
  camera.setViewOffset(W, H, (VIEW.r - VIEW.l) / 2, (VIEW.b - VIEW.t) / 2, W, H);
  camera.updateProjectionMatrix();
  uiPlaceMenu();
  uiUiChanged();
  uiSyncLabels();
}
// Na een wijziging van het vrije beeld opnieuw inpassen, tenzij de gebruiker de camera zelf heeft verplaatst.
function uiRefitNow() {
  clearTimeout(uiRefitTimer); uiRefitTimer = 0;
  if (uiUserCam || !uiLastFit) return;
  const f = uiLastFit;
  if (f.preset) { const c = f.preset.cam || {}; focusNodes(appSubject(f.preset), c.dir ? V3(...c.dir) : DIRS.iso, c.pad || 1.06, { dur: 0.4 }); }
  else focusNodes(f.nodes, f.dir, f.pad, Object.assign({}, f.opt || {}, { dur: 0.4 }));
}
function uiRefitSoon() {
  clearTimeout(uiRefitTimer);
  uiRefitTimer = setTimeout(uiRefitNow, 160);
}
let uiDprCap = Math.min(window.devicePixelRatio || 1, 2), uiDpr = uiDprCap;
function resize() {
  W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight);
  uiDprCap = Math.min(window.devicePixelRatio || 1, 2);
  uiDpr = uiPickDpr(false); renderer.setPixelRatio(uiDpr);
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  syncSheetHeight();
  layoutView();
}
window.addEventListener('resize', () => { resize(); uiRefitSoon(); });
if (window.ResizeObserver) {
  let lastH = 0;
  new ResizeObserver(() => { syncSheetHeight(); layoutView(); const h = els.sheet.offsetHeight; if (window.innerWidth < 920 && Math.abs(h - lastH) > 24) uiRefitSoon(); lastH = h; }).observe(els.sheet);
  new ResizeObserver(() => layoutView()).observe(els.dock);
}

/* ---------- thema ---------- */
function refreshTheme() { const old = ground.material.map; ground.material.map = gridTexture(); ground.material.needsUpdate = true; old && old.dispose(); requestRender(); }
if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener ? mq.addEventListener('change', refreshTheme) : mq.addListener(refreshTheme); }
new MutationObserver(refreshTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- beeldkwaliteit: lagere pixelratio tijdens grote animaties, lichte weergave als het hapert ---------- */
let uiLite = false, uiAdapted = false, uiLastFrame = 0, uiPrevActive = false;
const uiFt = [];
function uiMoving() { let c = 0; for (const n of uiAnim) if (n.delay <= 0) c += n.count; if (uiPlayS) c += uiPlayS.w.count; return c; }
function uiPickDpr(active) {
  if (uiLite) return Math.min(1, uiDprCap);
  if (active && uiMoving() > 800) return Math.max(1, uiDprCap * 0.75);
  return uiDprCap;
}
function uiSetDpr(v) { if (Math.abs(v - uiDpr) < 1e-3) return; uiDpr = v; renderer.setPixelRatio(v); renderer.setSize(W, H, false); }
function uiSetLite(on) {
  uiAdapted = true; uiLite = on;
  const cc = on ? 0 : 1;
  MAT.paint.clearcoat = cc; MAT.paint.needsUpdate = true;
  for (const m of [uiHV.get(MAT.paint), uiSL.get(MAT.paint)]) if (m) { m.clearcoat = on ? 0 : 0.2; m.needsUpdate = true; }
  els.qualityRow.hidden = false; els.qualityNote.hidden = !on; els.quality.checked = !on;
  uiSetDpr(uiPickDpr(false));
  requestRender();
}
function uiMeasure(now, active) {
  if (uiAdapted || REDUCED) return;
  const dt = now - uiLastFrame;
  if (active && uiPrevActive && uiLastFrame && dt < 250) {
    uiFt.push(dt); if (uiFt.length > 20) uiFt.shift();
    if (uiFt.length === 20 && uiFt.reduce((a, b) => a + b, 0) / 20 > 40) uiSetLite(true);
  } else if (!active) uiFt.length = 0;
  uiLastFrame = now; uiPrevActive = active;
}
function uiNearFar() {
  const d = camera.position.distanceTo(controls.target);
  const near = clamp(d / 250, 0.004, 0.08), far = Math.max(80, d * 30);
  if (Math.abs(near - camera.near) / camera.near > 0.2 || Math.abs(far - camera.far) / camera.far > 0.2) { camera.near = near; camera.far = far; camera.updateProjectionMatrix(); }
}
// Markeer-, aanwijs- en systeemmaterialen vooraf compileren (in kleine stukjes na de eerste weergave),
// zodat de eerste keer aanwijzen of selecteren niet hapert op het compileren van een shader.
function uiWarmMaterials() {
  const todo = [];
  const bases = [...new Set(MESHES.map(m => m.userData.base))];
  for (const b of [...bases, ...Object.values(SYS_MATS)]) todo.push(uiSelMat(b), uiHvMat(b));
  todo.push(...Object.values(SYS_MATS), GHOST, GHOST_HL, uiGhostHv);
  const geo = new THREE.BoxGeometry(0.001, 0.001, 0.001);
  const step = () => {
    const batch = todo.splice(0, 4);
    if (!batch.length) { geo.dispose(); return; }
    const g = new THREE.Group();
    for (const mat of batch) { const m = new THREE.Mesh(geo, mat); m.position.set(0, -40, 0); g.add(m); }
    scene.add(g);
    try { renderer.compile(scene, camera); } catch (_) { } finally { scene.remove(g); }
    setTimeout(step, 40);
  };
  setTimeout(step, 600);
}
canvas.addEventListener('webglcontextlost', e => e.preventDefault());
canvas.addEventListener('webglcontextrestored', () => requestRender());

/* ---------- render-lus ---------- */
controls.addEventListener('change', requestRender);
controls.addEventListener('start', () => { camAnim = null; uiUserCam = true; hideHint(); uiStopTour(); });
function uiTick(dt) {
  let active = stepExplode(dt);
  if (uiStepOff(dt)) active = true;
  if (uiStepPlay(dt)) active = true;
  if (stepCam(dt)) active = true;
  if (stepGround(dt)) active = true;
  if (uiVisDirty) { applyVisibility(); active = true; }
  return active;
}
function uiAfterAnim() {
  renderPanel();
  if (treeVisible()) renderTree();
  uiSyncExplode();
  if (uiHoverPos && !down) uiDoHover();
}
let last = performance.now(), uiWasActive = false, uiBatchDrawT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  const active = uiTick(dt);
  controls.update();
  if (active || needs || controls.autoRotate) {
    uiSetDpr(uiPickDpr(active));
    uiNearFar();
    renderer.render(scene, camera);
    updateLabels();
    needs = false;
    uiMeasure(now, active);
  }
  // batches bouwen in de vrije tijd van het frame; opnieuw tekenen als de rij leeg is of hoogstens elke 300 ms
  // (een weergave per batch zou in software-WebGL de opbouw zelf vertragen)
  if (uiBatchOn && (uiBatchQ.size || uiBatchJob) && uiBatchStep(active ? 3 : (now - uiReadyT < 8000 ? 25 : 10)) && (!uiBatchQ.size && !uiBatchJob || now - uiBatchDrawT > 300)) { needs = true; uiBatchDrawT = now; }
  if (uiWasActive && !active) { needs = true; uiAfterAnim(); }
  uiWasActive = active;
}

/* ---------- start ---------- */
let uiReady = false, uiReadyT = 0;
applyVisibility();
resize();
select(ROOT);
uiBuildCats();
uiSyncUndo();
updateGround();
{ const f = uiFitPoints(uiCollect([ROOT], true), DIRS.iso, 1.04); if (f) { camera.position.copy(f.pos); controls.target.copy(f.target); } uiLastFit = { preset: appPresetById.get('assembled') }; }
controls.update();
renderer.render(scene, camera);
LOADING.classList.add('gone');
uiInitHint();
requestAnimationFrame(t => { last = t; uiReady = true; uiReadyT = performance.now(); loop(t); });
uiWarmMaterials();
{ const errs = appCheckPresets(); if (errs.length) console.warn('presets: ' + errs.join('; ')); }
// labelbreedtes opnieuw meten zodra de lettertypen er zijn
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { for (const n of ALL) n._lw = null; uiUiChanged(); layoutView(); });

function finishAll() {
  if (uiRefitTimer) uiRefitNow();
  for (const n of uiAnim) { n.delay = 0; n.k = 1; n.amt = n.target; n.u = n.amt; placeKids(n); }
  uiAnim.clear();
  for (const n of uiOffAnim) { n.odelay = 0; n.ok = 1; n.off.copy(n.off1); if (n.off.lengthSq() === 0) n.hasOff = false; uiPlace(n); }
  uiOffAnim.clear();
  if (uiPlayS) { const s = uiPlayS; uiPlayS = null; uiApplyX(s.w, s.x1, true); updateGround(); }
  if (camAnim) { camera.position.copy(camAnim.p1); controls.target.copy(camAnim.t1); camAnim = null; }
  applyVisibility();
  ground.position.y = groundTarget; blob.position.y = groundTarget + 0.002;
  controls.update();
  ROOT.obj.updateMatrixWorld(true); camera.updateMatrixWorld();
  uiAfterAnim(); uiSyncCats(); uiSyncLabels();
  requestRender();
}
// Frametijd zonder finishAll(): klapt de groep uit en draait de echte animatiestap N keer
// (uitklappen, verschuivingen, wereldmatrices en labelindeling, zonder renderer.render).
function uiProfileFrames(name, frames = 120) {
  const g = typeof name === 'string' ? byName(name) : name;
  if (!g) return null;
  const snap = uiSnap();
  collapseTree(g); finishAll();
  const oldCtx = CTX, oldForce = uiLabelForce;
  explodeAllUnder(g); CTX = g; uiLabelForce = false;
  const times = [];
  for (let i = 0; i < frames; i++) {
    const t0 = performance.now();
    uiTick(1 / 60);
    ROOT.obj.updateMatrixWorld();
    updateLabels();
    times.push(performance.now() - t0);
  }
  uiRestore(snap, true); CTX = oldCtx; uiLabelForce = oldForce; finishAll();
  const s = times.slice().sort((a, b) => a - b), q = f => s[Math.min(s.length - 1, Math.floor(f * s.length))];
  return { frames, p50: +q(0.5).toFixed(3), p95: +q(0.95).toFixed(3), max: +s[s.length - 1].toFixed(3), mean: +(times.reduce((a, b) => a + b, 0) / frames).toFixed(3) };
}
function uiState() {
  const w = uiWorking(), L = uiLevels(w).length;
  return {
    open: ASMS.filter(n => n.target > 0.5).map(n => n.name), selected: (SEL || ROOT).name, iso: ISO.map(n => n.name), xray: XRAY,
    explode: { group: w.name, value: L ? +(uiExplodeX(w) / L).toFixed(4) : 0, levels: L }, history: uiHist.length,
    lifted: uiLifted ? uiLifted.name : null, preset: ACTIVE_PRESET, mode: MODE, tour: !!appTour, playing: !!uiPlayS, sys: SYSCOL,
  };
}
function uiFrameOf(names) {
  const nodes = (Array.isArray(names) ? names : [names]).map(n => (typeof n === 'string' ? byName(n) : n)).filter(Boolean);
  const v = uiFreeView();
  const b = nodes.length ? uiProject(uiCollect(nodes, false)) : null;
  const view = { x: v.x0, y: v.y0, w: v.x1 - v.x0, h: v.y1 - v.y0 };
  if (!b) return { box: null, view, inside: false, cover: 0 };
  const box = { x: b.x0, y: b.y0, w: b.x1 - b.x0, h: b.y1 - b.y0 };
  const ix = Math.max(0, Math.min(b.x1, v.x1) - Math.max(b.x0, v.x0)), iy = Math.max(0, Math.min(b.y1, v.y1) - Math.max(b.y0, v.y0));
  const inside = b.x0 >= v.x0 - 1 && b.y0 >= v.y0 - 1 && b.x1 <= v.x1 + 1 && b.y1 <= v.y1 + 1;
  return { box, view, inside, cover: +(ix * iy / Math.max(1, view.w * view.h)).toFixed(4) };
}
// Testkoppeling. Aanroepen die de stand veranderen tellen als interactie: de hint verdwijnt direct
// en de presetmarkering vervalt (een preset die je daarna kiest, zet hem weer).
const uiApi = (f, changes) => (...a) => { hideHint(true); const r = f(...a); if (changes) { clearPreset(); uiAfterAction(); } return r; };
window.__laguna = {
  finishAll, ROOT, ALL, MESHES, PRESETS, byName,
  select: uiApi(select), tapNode: uiApi(tapNode), focusNodes: uiApi(focusNodes),
  setTarget: uiApi(setTarget, true), explodeAllUnder: uiApi(explodeAllUnder, true), collapseAll: uiApi(collapseAll, true), isolate: uiApi(isolate, true),
  // klaar: gebouwd, eerste keer getekend en de batches van de beginstand staan klaar (hoogstens 8 s wachten daarop)
  get ready() { return uiReady && (!uiBatchOn || (!uiBatchQ.size && !uiBatchJob) || performance.now() - uiReadyT > 8000); },
  byPath: uiByPath,
  preset: id => { hideHint(true); return uiRunPreset(id); },
  presetList: () => PRESETS.filter(appPresetOk).map(p => ({ id: p.id, cat: p.cat, label: p.label, key: p.key || null, subject: p.tour ? [] : appSubject(p).map(n => n.name), tour: !!p.tour })),
  checkPresets: appCheckPresets,
  state: uiState,
  pickAt: (x, y) => { const n = pick(x, y); return n ? n.name : null; },
  pickNodeAt: (x, y, loose) => pick(x, y, loose),
  hoverTarget: uiHoverTarget,
  hoverNode: (x, y) => uiActTarget(pick(x, y)),
  sel: () => SEL,
  liftedNode: () => uiLifted,
  nodeById: id => uiById.get(id),
  undo: () => uiUndo(),
  setExplode: uiSetExplodeValue,
  play: uiPlay,
  labelRects: uiLabelRects,
  uiRects,
  frameOf: uiFrameOf,
  freeView: () => { const v = uiFreeView(); return { x: v.x0, y: v.y0, w: v.x1 - v.x0, h: v.y1 - v.y0 }; },
  profileFrames: uiProfileFrames,
  setMode: uiSetMode,
  dive: n => uiDive(typeof n === 'string' ? byName(n) : n),
  collapseAt: n => uiCollapseAt(typeof n === 'string' ? byName(n) : n),
  stopTour: uiStopTour,
  get lite() { return uiLite; },
  batching: on => { if (on !== undefined) { uiSetBatching(on); $('tBatch').checked = uiBatchOn; requestRender(); } return uiBatchOn; },
  batchFlush: () => { uiBatchFlush(); requestRender(); return uiBatchStats(); },
  batchStats: uiBatchStats,
  batchedGroups: () => [...uiBatched].map(g => g.name),
  drawCalls: () => { renderer.info.reset(); renderer.render(scene, camera); return renderer.info.render.calls; },
};

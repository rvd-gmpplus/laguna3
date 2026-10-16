"""Interactietest van de app op desktop (1280 x 800, muis) en telefoon (390 x 844, touch).

    python3 tools/itest.py            # exitcode 1 bij een fout; per controle een korte samenvatting

Controles (zie de app-brief):
  1  klik/tik vanuit Gemonteerd op Motorkap, Portier linksvoor, Wiel linksvoor, Koplamp links beweegt niets buiten
     de eigen subboom (> 1 mm) en opent die groep; dubbeltik met 250 ms tussenpoos kiest het onderdeel van de eerste tik;
     40 willekeurige klikken (vaste seed) doen precies wat hoverTarget aankondigt
  2  dubbelklik op het diepste aanklikbare onderdeel opent al zijn voorouders en selecteert het; zoeken naar klepspie ook
  3  inklappen met rechtsklik, Shift+klik en lang drukken (touch) sluit de diepste open groep met zijn deelboom
  4  Gemonteerd zet elke knoop terug op zijn basispositie (< 1e-6 m)
  5  Stap terug na uitklappen, inklappen, preset en schuif herstelt de vorige state()
  6  schuif 0 / 1 / 0,5 op de werkgroep
  7  elke preset: checkPresets() leeg, onderwerp binnen het vrije beeld en minstens 12 % ervan
  8  labels overlappen niet, niet over de bediening en niet buiten het canvas, in zes standen
  9  elke preset bereikbaar met categorie + item; sneltoetsen 0-9
  10 geen console-fouten of -waarschuwingen, geen horizontale scroll op de telefoon, donkere modus
  11 tekenopdrachten in Gemonteerd en profileFrames('Motor F4Rt', 120) (informatie)
  12 ingesloten onderdelen verborgen bij een dichte ouder
  13 batching: minder tekenopdrachten, aanwijzen en selecteren in een samengevoegde groep, openen maakt los, dichtklappen weer samen
  14 openmodus: klik op de kap opent hem en verschuift niets erbuiten, tweede klik sluit, dubbelklik zet geen uitklapdoel, wisselen
     van modus sluit alles, preset Motorruimte, kader van de open kap, pick in de motorruimte, geen batch om een open opener,
     aanwijstekst, dock en openerlijst, sneltoets O, paneelknop, portierklikken (alleen als het portier een opener is)
  15 onderdeelnummers: tijdelijke records in het paneel (status, nummers, tabel, bronnen, deel van, groepsaantal) en zoeken op nummer
  16 telefoon staand: presetcategorieen in een rij, vrij beeld, kader van een gekozen opener boven kaart en dock
  17 deelbare stand: ?preset=id laadt die preset, ?open=naam,pad opent die openers, de adresbalk volgt de stand; ?debug=1 toont de
     overlay met tekenopdrachten en versie; __laguna.version is het versiestempel uit build.py (zou de fout vangen dat een gedeelde
     link op Gemonteerd opent, of dat de versie in de pagina niet meer bij de bron hoort)
"""
import sys, os, random, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import session

OUT = os.environ.get('ITEST_SHOTS')
RESULTS = []


def check(name, ok, info=''):
    RESULTS.append((name, bool(ok)))
    print(('ok   ' if ok else 'FOUT ') + name + (': ' + info if info else ''))
    return ok


JS_HELPERS = r"""
window.__T = {
  L: () => window.__laguna,
  fin() { this.L().finishAll(); return 1; },
  positions() { const L = this.L(); L.ROOT.obj.updateMatrixWorld(true); const v = new THREE.Vector3(); return L.MESHES.map(m => { m.getWorldPosition(v); return [v.x, v.y, v.z]; }); },
  subtreeIdx(name) { const L = this.L(), g = L.byName(name), set = new Set(g.meshes); return L.MESHES.map((m, i) => set.has(m) ? i : -1).filter(i => i >= 0); },
  free() { return this.L().freeView(); },
  // schermpunt op een direct onderdeel van de groep (de klik moet die groep raken)
  pointOn(name) {
    const L = this.L(), g = L.byName(name), v = L.freeView();
    const kids = g.kids.filter(k => !k.asm && k.ev).sort((a, b) => b.rad - a.rad);
    const r = canvas.getBoundingClientRect();
    for (const k of kids) {
      const box = new THREE.Box3().setFromObject(k.obj);
      const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      for (const [fx, fy, fz] of [[0, 0, 0], [0.25, 0.25, 0], [-0.25, 0.25, 0], [0.25, -0.25, 0.2], [-0.3, 0, 0.3], [0, 0.35, -0.3], [0.3, 0.1, 0.3]]) {
        const p = new THREE.Vector3(c.x + fx * s.x, c.y + fy * s.y, c.z + fz * s.z).project(camera);
        const x = r.left + (p.x * 0.5 + 0.5) * r.width, y = r.top + (-p.y * 0.5 + 0.5) * r.height;
        if (x < v.x + 4 || x > v.x + v.w - 4 || y < v.y + 4 || y > v.y + v.h - 4) continue;
        const n = L.pickNodeAt(x, y);
        if (n && n.parent === g) return [x, y, n.name];
      }
    }
    return null;
  },
  maxMoveOutside(before, idx) {
    const set = new Set(idx), after = this.positions(); let mx = 0, who = null;
    for (let i = 0; i < after.length; i++) { if (set.has(i)) continue; const d = Math.hypot(after[i][0] - before[i][0], after[i][1] - before[i][1], after[i][2] - before[i][2]); if (d > mx) { mx = d; who = this.L().MESHES[i].userData.node.name; } }
    return [mx, who];
  },
  // willekeurig zichtbaar onderdeel in het vrije beeld (index uit Python)
  randomPoint(seed) {
    const L = this.L(), v = L.freeView(), r = canvas.getBoundingClientRect(), cand = [];
    L.ROOT.obj.updateMatrixWorld(true);
    for (const m of L.MESHES) {
      const n = m.userData.node; if (!n.ev) continue;
      const p = n.lc.clone().applyMatrix4(m.matrixWorld).project(camera);
      const x = r.left + (p.x * 0.5 + 0.5) * r.width, y = r.top + (-p.y * 0.5 + 0.5) * r.height;
      if (p.z > 1 || x < v.x + 6 || x > v.x + v.w - 6 || y < v.y + 6 || y > v.y + v.h - 6) continue;
      cand.push([x, y]);
    }
    for (let t = 0; t < 30 && cand.length; t++) {
      const [x, y] = cand[(seed * 7919 + t * 104729) % cand.length];
      const elAt = document.elementFromPoint(x, y);
      if (elAt !== canvas) continue; // label of bediening erboven
      const X = Math.round(x), Y = Math.round(y);
      if (L.pickNodeAt(X, Y) && document.elementFromPoint(X, Y) === canvas) return [X, Y];
    }
    return null;
  },
  noteTarget(x, y) { const t = this.L().hoverNode(x, y); window.__tgt = t; return t ? [t.name, t.asm, t.asm ? t.target : null] : null; },
  targetDone() {
    const L = this.L(), t = window.__tgt; if (!t) return [false, 'geen doel'];
    if (t.asm) return [t.target > 0.5, t.name + ' target ' + t.target];
    return [L.sel() === t && L.liftedNode() === t, t.name + ' sel=' + L.sel().name + ' lift=' + (L.liftedNode() ? L.liftedNode().name : '-')];
  },
  deepestClickable() {
    const L = this.L(), v = L.freeView(), r = canvas.getBoundingClientRect(); let best = null;
    L.ROOT.obj.updateMatrixWorld(true);
    for (const m of L.MESHES) {
      const n = m.userData.node; if (!n.ev || (best && n.depth <= best[2].depth)) continue;
      const p = n.lc.clone().applyMatrix4(m.matrixWorld).project(camera);
      const x = r.left + (p.x * 0.5 + 0.5) * r.width, y = r.top + (-p.y * 0.5 + 0.5) * r.height;
      if (p.z > 1 || x < v.x + 6 || x > v.x + v.w - 6 || y < v.y + 6 || y > v.y + v.h - 6) continue;
      if (document.elementFromPoint(x, y) !== canvas) continue;
      if (L.pickNodeAt(x, y) === n) best = [x, y, n];
    }
    if (!best) return null;
    window.__deep = best[2];
    return [best[0], best[1], best[2].name, best[2].depth];
  },
  deepOk() { const L = this.L(), n = window.__deep; const anc = []; for (let a = n.parent; a; a = a.parent) anc.push(a); const closed = anc.filter(a => a.target <= 0.5).map(a => a.name); return [closed.length === 0 && L.sel() === n, 'gesloten voorouders: ' + (closed.join(', ') || 'geen') + ', selectie ' + L.sel().name]; },
  // onderdeel in een open groep onder de motor, voor inklappen
  collapsePoint() {
    const L = this.L(), v = L.freeView(), r = canvas.getBoundingClientRect();
    L.ROOT.obj.updateMatrixWorld(true);
    const list = L.MESHES.map(m => m.userData.node).filter(n => n.ev && n.parent && n.parent.target > 0.5 && n.parent.name !== 'Motor F4Rt').sort((a, b) => b.depth - a.depth);
    for (const n of list) {
      const p = n.lc.clone().applyMatrix4(n.obj.matrixWorld).project(camera);
      const x = r.left + (p.x * 0.5 + 0.5) * r.width, y = r.top + (-p.y * 0.5 + 0.5) * r.height;
      if (p.z > 1 || x < v.x + 6 || x > v.x + v.w - 6 || y < v.y + 6 || y > v.y + v.h - 6) continue;
      if (document.elementFromPoint(x, y) !== canvas) continue;
      const hit = L.pickNodeAt(x, y); if (!hit) continue;
      let deep = null; for (let a = hit.parent; a; a = a.parent) if (a.target > 0.5) { deep = a; break; }
      if (!deep || deep.name === 'Motor F4Rt') continue;
      window.__col = deep;
      window.__colOthers = L.ALL.filter(a => a.asm && !this.under(a, deep)).map(a => [a, a.target]);
      return [x, y, hit.name, deep.name];
    }
    return null;
  },
  under(n, a) { for (let p = n; p; p = p.parent) if (p === a) return true; return false; },
  // schermpunt op een mesh in de deelboom van knoop n (de pick moet in die deelboom vallen), binnen het vrije beeld
  pointIn(n) {
    const L = this.L(), v = L.freeView(), r = canvas.getBoundingClientRect();
    L.ROOT.obj.updateMatrixWorld(true);
    const ms = n.meshes.filter(m => m.userData.node.ev).map(m => { const b = new THREE.Box3().setFromObject(m); return [m, b, b.getSize(new THREE.Vector3()).length()]; }).sort((x, y) => y[2] - x[2]).slice(0, 60);
    for (const [m, box, sz] of ms) {
      const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      for (const [fx, fy, fz] of [[0, 0, 0], [0.25, 0.25, 0], [-0.25, 0.25, 0], [0.25, -0.25, 0.2], [-0.3, 0, 0.3], [0, 0.35, -0.3], [0.3, 0.1, 0.3], [0, -0.3, 0.3]]) {
        const p = new THREE.Vector3(c.x + fx * s.x, c.y + fy * s.y, c.z + fz * s.z).project(camera);
        const x = Math.round(r.left + (p.x * 0.5 + 0.5) * r.width), y = Math.round(r.top + (-p.y * 0.5 + 0.5) * r.height);
        if (p.z > 1 || x < v.x + 6 || x > v.x + v.w - 6 || y < v.y + 6 || y > v.y + v.h - 6) continue;
        if (document.elementFromPoint(x, y) !== canvas) continue;
        const hit = L.pickNodeAt(x, y);
        if (hit && this.under(hit, n)) return [x, y, hit.name];
      }
    }
    return null;
  },
  // knopen die bij een opener horen en mogen bewegen: zijn deelboom en die van zijn volgers
  openerIdx(name) {
    const L = this.L(), o = L.openers().find(q => q.name === name), idx = new Set(this.subtreeIdx(name));
    for (const f of (o ? o.followers : [])) for (const i of this.subtreeIdx(f)) idx.add(i);
    return [...idx];
  },
  openOpeners() { return this.L().openers().filter(o => o.target > 0 || o.open > 0).map(o => o.name); },
  noExplode() { return this.L().ALL.filter(n => n.asm && n.target > 0).map(n => n.name); },
  nodeNamed(root, name) { return (function w(n) { if (n.name === name) return n; for (const k of n.kids) { const r = w(k); if (r) return r; } return null; })(root); },
  collapseOk() {
    const g = window.__col, sub = []; (function w(n) { if (n.asm) sub.push(n); n.kids.forEach(w); })(g);
    const stillOpen = sub.filter(a => a.target > 0).map(a => a.name);
    const changed = window.__colOthers.filter(([a, t]) => a.target !== t).map(([a]) => a.name);
    return [stillOpen.length === 0 && changed.length === 0 && this.L().sel() === g, g.name + ': open in deelboom ' + stillOpen.length + ', elders veranderd ' + changed.length];
  },
  // twee tikken met een vaste tussenpoos volgens de klok van de pagina (de invoer van de testbrowser loopt soms honderden ms achter)
  synthDouble(x, y, type, gap) {
    return new Promise(res => {
      const c = canvas, sp = c.setPointerCapture, rp = c.releasePointerCapture;
      c.setPointerCapture = () => {}; c.releasePointerCapture = () => {};
      let id = 900 + Math.floor(Math.random() * 1000);
      const one = () => { const o = { clientX: x, clientY: y, pointerId: ++id, pointerType: type, isPrimary: true, button: 0, buttons: 1, bubbles: true, cancelable: true, view: window };
        c.dispatchEvent(new PointerEvent('pointerdown', o)); c.dispatchEvent(new PointerEvent('pointerup', Object.assign({}, o, { buttons: 0 }))); };
      one();
      setTimeout(() => { one(); c.setPointerCapture = sp; c.releasePointerCapture = rp; res(1); }, gap);
    });
  },
  baseDev() { const L = this.L(); let mx = 0; for (const n of L.ALL) { if (!n.parent) continue; mx = Math.max(mx, n.obj.position.distanceTo(n.base)); } return mx; },
  stateNoHist() { const s = this.L().state(); delete s.history; return JSON.stringify(s); },
  sliderCheck(v) {
    const L = this.L(), s = L.state(), g = L.byName(s.explode.group), Lv = s.explode.levels, x = v * Lv, bad = [];
    (function w(n) { if (n.asm) { const r = n.depth - g.depth, want = Math.min(1, Math.max(0, x - r)); if (Math.abs(n.target - want) > 1e-6) bad.push(n.name + ' ' + n.target + '!=' + want); } n.kids.forEach(w); })(g);
    return [bad.length === 0, `${g.name}, ${Lv} lagen, waarde ${s.explode.value}` + (bad.length ? ', afwijkend: ' + bad.slice(0, 3).join('; ') : '')];
  },
  labelCheck() {
    const L = this.L(), lr = L.labelRects(), ui = L.uiRects(), r = canvas.getBoundingClientRect(), v = L.freeView(), errs = [];
    const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    for (let i = 0; i < lr.length; i++) {
      const a = lr[i];
      if (a.x < r.left || a.y < r.top || a.x + a.w > r.right || a.y + a.h > r.bottom) errs.push(a.name + ' buiten het canvas');
      if (a.x < v.x - 1 || a.y < v.y - 1 || a.x + a.w > v.x + v.w + 1 || a.y + a.h > v.y + v.h + 1) errs.push(a.name + ' buiten het vrije beeld');
      for (let j = i + 1; j < lr.length; j++) if (ov(a, lr[j])) errs.push(a.name + ' over ' + lr[j].name);
      for (const u of ui) if (ov(a, u)) errs.push(a.name + ' over ' + u.id);
    }
    // zichtbare DOM-labels moeten precies de geplaatste zijn (geen achtergebleven labels)
    const dom = [...document.querySelectorAll('#labels .lbl')].filter(e => !e.hidden);
    if (dom.length !== lr.length) errs.push(`DOM toont ${dom.length} labels, geplaatst ${lr.length}`);
    for (const e of dom) { const b = e.getBoundingClientRect(); if (b.left < r.left - 1 || b.top < r.top - 1) errs.push('label ' + e.textContent + ' op ' + Math.round(b.left) + ',' + Math.round(b.top)); }
    return [errs.length === 0, lr.length, errs.slice(0, 4)];
  },
};
1
"""


def T(pg, expr):
    return pg.evaluate('(() => window.__T.' + expr + ')()')


def settle(pg, ms=180):
    pg.evaluate('__laguna.finishAll()')
    pg.wait_for_timeout(ms)


def tap(pg, touch, x, y, **kw):
    if touch:
        pg.touchscreen.tap(x, y)
    else:
        pg.mouse.click(x, y, **kw)


def long_press(pg, cdp, x, y, ms=700):
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y, 'id': 1}]})
    pg.wait_for_timeout(ms)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


def quiet(pg):
    # op de telefoon verandert het paneel van hoogte na een handeling en past de camera zich ~160 ms later opnieuw in
    pg.wait_for_timeout(350)
    settle(pg, 60)


def preset(pg, pid):
    pg.evaluate(f"__laguna.preset({json.dumps(pid)})")
    settle(pg)


def shot(pg, name):
    if OUT:
        os.makedirs(OUT, exist_ok=True)
        pg.screenshot(path=os.path.join(OUT, name + '.png'), timeout=180000)


def run_view(s, tag, w, h, touch):
    print(f'--- {tag} {w}x{h}' + (' touch' if touch else ''))
    pg = s.page(w, h, scale=2 if touch else 1, touch=touch)
    pg.evaluate(JS_HELPERS)
    cdp = pg.context.new_cdp_session(pg) if touch else None
    pg.wait_for_timeout(400)

    # 1. tripwire: klik vanuit Gemonteerd beweegt alleen de eigen subboom
    for name in ['Motorkap', 'Portier linksvoor', 'Wiel linksvoor', 'Koplamp links']:
        preset(pg, 'assembled')
        pt = T(pg, f'pointOn({json.dumps(name)})')
        if not check(f'1 [{tag}] punt op {name}', pt, str(pt and pt[2])):
            continue
        before = T(pg, 'positions()')
        idx = T(pg, f'subtreeIdx({json.dumps(name)})')
        pg.evaluate('window.__before = ' + json.dumps(before))
        tap(pg, touch, pt[0], pt[1])
        pg.wait_for_timeout(120)
        settle(pg, 80)
        mv, who = pg.evaluate(f'window.__T.maxMoveOutside(window.__before, {json.dumps(idx)})')
        opened = pg.evaluate(f"__laguna.byName({json.dumps(name)}).target > 0.5")
        check(f'1 [{tag}] {"tik" if touch else "klik"} op {name}', mv < 1e-3 and opened, f'grootste verschuiving buiten de groep {mv * 1000:.3f} mm ({who}), groep open: {opened}')
        pg.wait_for_timeout(450)
    # dubbeltik met 250 ms tussenpoos: het onderdeel van de eerste tik
    preset(pg, 'assembled')
    pt = T(pg, 'pointOn("Motorkap")')
    first = pg.evaluate(f'__laguna.pickAt({pt[0]}, {pt[1]})')
    pg.evaluate(f"window.__T.synthDouble({pt[0]}, {pt[1]}, {json.dumps('touch' if touch else 'mouse')}, 250)")
    pg.wait_for_timeout(100); settle(pg)
    sel = pg.evaluate('__laguna.state().selected')
    check(f'1 [{tag}] dubbel{"tik" if touch else "klik"} 250 ms selecteert het onderdeel van de eerste tik', sel == first, f'eerste tik {first}, geselecteerd {sel}')
    if not touch:  # ook met echte muisinvoer
        pg.wait_for_timeout(450); preset(pg, 'assembled')
        pg.mouse.click(pt[0], pt[1]); pg.wait_for_timeout(250); pg.mouse.click(pt[0], pt[1])
        pg.wait_for_timeout(100); settle(pg)
        sel = pg.evaluate('__laguna.state().selected')
        check(f'1 [{tag}] dubbelklik met echte muis selecteert het onderdeel van de eerste klik', sel == first, f'eerste klik {first}, geselecteerd {sel}')
    if tag == 'desktop':
        shot(pg, 'itest_desk_dubbelklik')
    pg.wait_for_timeout(450)
    # 40 willekeurige klikken vanuit wisselende standen
    rnd = random.Random(20261013 + (1 if touch else 0))
    states = ['assembled', 'main', 'engine', 'bodyOff', 'body', 'chassis', 'gearbox', 'interior']
    bad, n_ok, misses = [], 0, 0
    for i in range(40):
        if i % 6 == 0:
            preset(pg, states[(i // 6) % len(states)])
            # op de telefoon verandert het paneel van hoogte na een preset; de camera past zich ~160 ms later
            # opnieuw in (ResizeObserver). Eerst dat laten gebeuren, anders verschuift het beeld tussen aanwijzen en tikken.
            pg.wait_for_timeout(350); settle(pg, 60)
        settle(pg, 30)  # ook een herinpassing na een paneelwijziging afronden voordat we aanwijzen
        p = pg.evaluate(f'window.__T.randomPoint({rnd.randrange(1, 10 ** 6)})')
        if not p:
            misses += 1
            continue
        tgt = pg.evaluate(f'window.__T.noteTarget({p[0]}, {p[1]})')
        tap(pg, touch, p[0], p[1])
        pg.wait_for_timeout(60)
        settle(pg, 40)
        ok, info = T(pg, 'targetDone()')
        if ok: n_ok += 1
        else: bad.append(f'{i}: {tgt} -> {info}')
        pg.wait_for_timeout(440)  # geen dubbelklik
    check(f'1 [{tag}] 40 willekeurige klikken doen wat hoverTarget aankondigt', not bad and n_ok >= 34, f'{n_ok} goed, {misses} zonder punt' + ('; ' + ' | '.join(bad[:3]) if bad else ''))

    # 2. dubbelklik op het diepste aanklikbare onderdeel (vanuit Gemonteerd)
    preset(pg, 'assembled')
    pg.wait_for_timeout(450)
    d = T(pg, 'deepestClickable()')
    if check(f'2 [{tag}] diep aanklikbaar onderdeel gevonden', d, str(d)):
        if touch:
            pg.evaluate(f"window.__T.synthDouble({d[0]}, {d[1]}, 'touch', 220)")
        else:
            pg.mouse.dblclick(d[0], d[1])
        pg.wait_for_timeout(100); settle(pg)
        ok, info = T(pg, 'deepOk()')
        check(f'2 [{tag}] dubbelklik op {d[2]} (diepte {d[3]}) opent alle voorouders', ok, info)
    pg.wait_for_timeout(450)
    # zoeken naar een klepspie in de boom en tonen
    if not touch:
        preset(pg, 'assembled')
        pg.click('#tabbtn-tree'); pg.fill('#treeSearch', 'klepspie'); pg.wait_for_timeout(200)
        info = pg.evaluate("document.getElementById('treeInfo').textContent")
        rows = pg.evaluate("document.querySelectorAll('#tree .trow .tn').length")
        if rows:
            pg.click('#tree .trow .tn'); settle(pg)
            r = pg.evaluate("(() => { const L = __laguna, n = L.sel(); const closed = []; for (let a = n.parent; a; a = a.parent) if (a.target <= 0.5) closed.push(a.name); return [n.name, closed]; })()")
            check(f'2 [{tag}] zoeken "klepspie" en tonen opent de voorouders', not r[1] and 'spie' in r[0].lower(), f'{info}; gekozen {r[0]}, dicht: {r[1]}')
        else:
            check(f'2 [{tag}] zoeken "klepspie"', True, 'geen klepspie in deze boom: ' + info)
        pg.click('#tabbtn-info')

    # 3. inklappen
    ways = [('lang drukken', 'press')] if touch else [('rechtsklik', 'right'), ('Shift+klik', 'shift')]
    for label, how in ways:
        preset(pg, 'engineAll')
        pg.wait_for_timeout(450)
        c = T(pg, 'collapsePoint()')
        if not check(f'3 [{tag}] punt voor inklappen ({label})', c, str(c)):
            continue
        if how == 'right':
            pg.mouse.click(c[0], c[1], button='right')
        elif how == 'shift':
            pg.keyboard.down('Shift'); pg.mouse.click(c[0], c[1]); pg.keyboard.up('Shift')
        else:
            long_press(pg, cdp, c[0], c[1])
        pg.wait_for_timeout(100); settle(pg)
        ok, info = T(pg, 'collapseOk()')
        check(f'3 [{tag}] {label} klapt de diepste open groep in', ok, f'op {c[2]}: {info}')
        pg.wait_for_timeout(450)

    # 4. Gemonteerd zet alles terug
    preset(pg, 'everything'); preset(pg, 'bodyOff')
    pg.evaluate("(() => { const L = __laguna; L.setTarget(L.byName('Motor F4Rt'), 1); L.finishAll(); })()")
    pt = T(pg, 'randomPoint(5)')
    if pt: tap(pg, touch, pt[0], pt[1]); pg.wait_for_timeout(450)
    preset(pg, 'assembled')
    dev = T(pg, 'baseDev()')
    check(f'4 [{tag}] Gemonteerd zet elke knoop terug', dev < 1e-6, f'grootste afwijking {dev:.2e} m')

    # 5. stap terug
    def undo_case(label, act):
        s0 = T(pg, 'stateNoHist()')
        act()
        settle(pg)
        s1 = T(pg, 'stateNoHist()')
        pg.evaluate('__laguna.undo()'); settle(pg)
        s2 = T(pg, 'stateNoHist()')
        check(f'5 [{tag}] stap terug na {label}', s2 == s0 and s1 != s0, '' if s2 == s0 else f'voor {s0[:160]} na {s2[:160]}')
    preset(pg, 'assembled'); pg.wait_for_timeout(450)
    pt = T(pg, 'pointOn("Motorkap")')
    undo_case('uitklappen (klik)', lambda: tap(pg, touch, pt[0], pt[1]))
    pg.wait_for_timeout(450)
    preset(pg, 'engineAll')
    undo_case('inklappen', lambda: pg.evaluate("__laguna.collapseAt(__laguna.byName('Cilinderkop').kids.find(k => !k.asm))"))
    undo_case('preset', lambda: pg.evaluate("__laguna.preset('gearbox')"))
    preset(pg, 'engine')
    undo_case('schuif', lambda: pg.locator('#explode').fill('500'))
    preset(pg, 'assembled'); pg.wait_for_timeout(450)
    undo_case('wisselen naar Openen', lambda: pg.evaluate("__laguna.setOpenMode(true)"))
    pg.evaluate("__laguna.setOpenMode(true)"); settle(pg, 250); quiet(pg)
    pt = pg.evaluate('window.__T.pointIn(__laguna.byName("Motorkap"))')
    undo_case('openen van de kap (klik in Openen)', lambda: tap(pg, touch, pt[0], pt[1]))
    pg.evaluate("__laguna.openAll(0, true); __laguna.setOpenMode(false)"); settle(pg)
    preset(pg, 'engine')
    s0 = T(pg, 'stateNoHist()')
    pg.evaluate("__laguna.preset('chassis')"); settle(pg)
    pg.evaluate("document.activeElement && document.activeElement.blur()")
    pg.keyboard.press('Backspace'); settle(pg)
    check(f'5 [{tag}] Backspace is stap terug', T(pg, 'stateNoHist()') == s0)

    # 6. schuif op de werkgroep
    for wg in ['Renault Laguna III', 'Motor F4Rt']:
        preset(pg, 'assembled')
        pg.evaluate(f"__laguna.select(__laguna.byName({json.dumps(wg)}))")
        for v in (0, 1, 0.5):
            pg.evaluate(f'__laguna.setExplode({v})'); settle(pg, 60)
            ok, info = T(pg, f'sliderCheck({v})')
            check(f'6 [{tag}] schuif {v} op {wg}', ok, info)
    pg.evaluate("__laguna.select(__laguna.byName('Motor F4Rt'))")
    pg.locator('#explode').fill('500'); settle(pg, 60)
    ok, info = T(pg, 'sliderCheck(0.5)')
    vt = pg.evaluate("document.getElementById('explode').getAttribute('aria-valuetext')")
    check(f'6 [{tag}] schuif bedienen met de echte invoer', ok and 'lagen' in vt, f'{info}; aria-valuetext "{vt}"')

    # 7. elke preset: kadrering
    errs = pg.evaluate('__laguna.checkPresets()')
    check(f'7 [{tag}] checkPresets() leeg', not errs, '; '.join(errs[:4]))
    plist = pg.evaluate('__laguna.presetList()')
    bad = []
    for p in plist:
        if p['tour']: continue
        preset(pg, p['id'])
        f = pg.evaluate(f"__laguna.frameOf({json.dumps(p['subject'])})")
        if not f['inside'] or f['cover'] < 0.12:
            bad.append(f"{p['label']}: binnen {f['inside']}, dekking {f['cover']:.2f}")
    check(f'7 [{tag}] {len([p for p in plist if not p["tour"]])} presets in beeld en >= 12 % van het vrije beeld', not bad, '; '.join(bad[:6]))

    # 8. labels in zes standen
    lab_bad, counts = [], []
    for pid in ['main', 'engine', 'gearbox', 'chassis', 'everything', 'deep']:
        if pid == 'deep':
            preset(pg, 'engineAll')
            pg.evaluate("__laguna.dive(__laguna.byName('Cilinderkop').kids.find(k => !k.asm))")
        else:
            preset(pg, pid)
        settle(pg, 250)
        ok, n, e = T(pg, 'labelCheck()')
        counts.append(f'{pid} {n}')
        if not ok or n < 3: lab_bad.append(f'{pid}: {n} labels ' + '; '.join(e))
        if pid == 'engine': shot(pg, f'itest_{tag}_labels_motor')
    check(f'8 [{tag}] labels zonder overlap en binnen het vrije beeld', not lab_bad, ', '.join(counts) + ('; ' + ' | '.join(lab_bad[:3]) if lab_bad else ''))

    # 9. menu's: elke preset in twee klikken, sneltoetsen
    preset(pg, 'assembled')
    miss = []
    for p in plist:
        pg.click(f'[data-cat="{p["cat"]}"]')
        item = pg.locator(f'[data-preset="{p["id"]}"]')
        # een lang menu scrolt (zoals bij de gebruiker): eerst in beeld scrollen, dan binnen venster en menu
        item.scroll_into_view_if_needed()
        box = item.bounding_box()
        mb = pg.locator('#menu').bounding_box()
        if not box or not mb or box['x'] < 0 or box['y'] < 0 or box['x'] + box['width'] > w + 0.5 or box['y'] + box['height'] > h + 0.5 \
                or box['y'] < mb['y'] - 0.5 or box['y'] + box['height'] > mb['y'] + mb['height'] + 0.5:
            miss.append(p['label'] + ' afgekapt ' + str(box))
        item.click()
        pg.wait_for_timeout(60)
        st = pg.evaluate('__laguna.state()')
        if p['tour']:
            if not st['tour']: miss.append('rondleiding start niet')
            pg.evaluate('__laguna.stopTour()')
        elif st['preset'] != p['id']:
            miss.append(f"{p['label']}: actief {st['preset']}")
        settle(pg, 30)
    check(f'9 [{tag}] alle {len(plist)} presets via categorie + item', not miss, '; '.join(miss[:4]))
    keys_bad = []
    pg.evaluate("document.activeElement && document.activeElement.blur()")
    for p in plist:
        if not p['key']: continue
        pg.keyboard.press(p['key']); pg.wait_for_timeout(40)
        st = pg.evaluate('__laguna.state()')
        if st['preset'] != p['id']: keys_bad.append(f"{p['key']} -> {st['preset']}")
        settle(pg, 20)
    check(f'9 [{tag}] sneltoetsen 0-9', not keys_bad and len([p for p in plist if p['key']]) == 10, '; '.join(keys_bad))

    # 10. telefoon: geen horizontale scroll
    if touch:
        hs = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth")
        check(f'10 [{tag}] geen horizontale scroll', not hs)

    # 14. openmodus
    def hood_click(label, expect_open):
        quiet(pg)
        pt = pg.evaluate('window.__T.pointIn(__laguna.byName("Motorkap"))')
        if not check(f'14 [{tag}] punt op de Motorkap ({label})', pt, str(pt and pt[2])):
            return
        before = T(pg, 'positions()')
        idx = T(pg, 'openerIdx("Motorkap")')
        pg.evaluate('window.__before = ' + json.dumps(before))
        tap(pg, touch, pt[0], pt[1])
        pg.wait_for_timeout(120); settle(pg, 80)
        quiet(pg)
        o = pg.evaluate('__laguna.openers().find(q => q.name === "Motorkap")')
        check(f'14 [{tag}] {"tik" if touch else "klik"} op de kap {label}', (o['target'] > 0) == expect_open and (o['open'] > 0.99) == expect_open, json.dumps(o))
        if expect_open:
            mv, who = pg.evaluate(f'window.__T.maxMoveOutside(window.__before, {json.dumps(idx)})')
            check(f'14 [{tag}] niets buiten de kap en zijn volgers verschuift meer dan 1 mm', mv < 1e-3, f'grootste verschuiving {mv * 1000:.3f} mm ({who})')
            f = pg.evaluate('__laguna.frameOf("Motorkap")')
            check(f'14 [{tag}] kader van de geopende kap binnen het vrije beeld', f['inside'] and f['cover'] > 0.05, json.dumps(f))
        pg.wait_for_timeout(450)
    pg.evaluate("__laguna.preset('assembled'); __laguna.finishAll()")
    pg.wait_for_timeout(450)
    if touch:
        pg.tap('#openSeg [data-omode="open"]')
    else:
        pg.click('#openSeg [data-omode="open"]')
    settle(pg, 250)
    st = pg.evaluate('__laguna.state()')
    seg = pg.evaluate('[...document.querySelectorAll("#openSeg [data-omode]")].map(b => b.getAttribute("aria-checked"))')
    check(f'14 [{tag}] segmentknop zet de modus Openen', st['openMode'] and seg == ['false', 'true'] and not st['open'], json.dumps(seg) + ' ' + json.dumps(st['open'][:3]))
    hood_click('(dicht, opent)', True)
    hood_click('(open, sluit)', False)
    # aanwijstekst (muis)
    if not touch:
        pg.evaluate("__laguna.openAll(0, true); __laguna.focusNodes([__laguna.ROOT], new THREE.Vector3(1, 0.42, 1.08), 1.04)"); settle(pg, 200)
        pt = pg.evaluate('window.__T.pointIn(__laguna.byName("Motorkap"))')
        pg.mouse.move(pt[0], pt[1]); pg.wait_for_timeout(250)
        tx = pg.evaluate("document.getElementById('tip').hidden ? '' : document.getElementById('tip').textContent")
        wl = pg.evaluate('window.__T.pointIn(__laguna.byName("Wiel linksvoor"))')
        pg.mouse.move(wl[0], wl[1]); pg.wait_for_timeout(250)
        tx2 = pg.evaluate("document.getElementById('tip').hidden ? '' : document.getElementById('tip').textContent")
        check(f'14 [{tag}] aanwijstekst: klik om te openen en niets te openen', 'Motorkap' in tx and 'klik om te openen' in tx and 'niets te openen' in tx2, f'"{tx}" en "{tx2}"')
        pg.mouse.move(5, 400); pg.wait_for_timeout(100)
    # dubbelklik of dubbeltik is gelijk aan een enkele klik: de kap staat open en er is niets uitgeklapt
    pg.evaluate("__laguna.openAll(0, true)"); settle(pg); quiet(pg)
    pt = pg.evaluate('window.__T.pointIn(__laguna.byName("Motorkap"))')
    if check(f'14 [{tag}] punt op de kap voor dubbel{"tik" if touch else "klik"}', pt, str(pt and pt[2])):
        pg.evaluate(f"window.__T.synthDouble({pt[0]}, {pt[1]}, {json.dumps('touch' if touch else 'mouse')}, 250)")
        pg.wait_for_timeout(100); settle(pg)
        ex = T(pg, 'noExplode()')
        o = pg.evaluate('__laguna.openers().find(q => q.name === "Motorkap")')
        check(f'14 [{tag}] dubbel{"tik" if touch else "klik"} op de kap: geen uitklapdoel boven 0, kap een keer geopend', not ex and o['target'] == 1, f'uitgeklapt: {ex[:3]}, kap {json.dumps(o)}')
    pg.wait_for_timeout(450)
    # rechtsklik, Shift+klik en lang drukken sluiten de binnenste open opener
    for label, how in ([('lang drukken', 'press')] if touch else [('rechtsklik', 'right'), ('Shift+klik', 'shift')]):
        pg.evaluate("__laguna.openAll(1, true)"); settle(pg)
        pg.evaluate("__laguna.focusNodes([__laguna.byName('Motorkap'), __laguna.byName('Aandrijflijn')], new THREE.Vector3(0.25, 0.9, 1), 1.1)"); settle(pg, 120); quiet(pg)
        pt = pg.evaluate('window.__T.pointIn(__laguna.byName("Motorkap"))')
        if not check(f'14 [{tag}] punt op de open kap ({label})', pt, str(pt and pt[2])):
            continue
        if how == 'right':
            pg.mouse.click(pt[0], pt[1], button='right')
        elif how == 'shift':
            pg.keyboard.down('Shift'); pg.mouse.click(pt[0], pt[1]); pg.keyboard.up('Shift')
        else:
            long_press(pg, cdp, pt[0], pt[1])
        pg.wait_for_timeout(100); settle(pg, 120)
        o = pg.evaluate('__laguna.openers().find(q => q.name === "Motorkap")')
        check(f'14 [{tag}] {label} sluit de open kap', o['target'] == 0 and o['open'] == 0, json.dumps(o))
        pg.wait_for_timeout(450)
    # pick met de kap open raakt de motorruimte, en er is geen batch om een open opener
    pg.evaluate("__laguna.openAll(0, true)"); settle(pg)
    preset(pg, 'openHood')
    pg.wait_for_timeout(350); settle(pg, 80)
    r = pg.evaluate("""(() => { const L = __laguna, v = L.freeView(), drv = L.byName('Aandrijflijn'); const under = (n, a) => { for (let p = n; p; p = p.parent) if (p === a) return true; return false; };
      const cnt = () => { let motor = 0, tot = 0; for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) { const n = L.pickNodeAt(v.x + v.w * (0.2 + 0.6 * i / 8), v.y + v.h * (0.2 + 0.6 * j / 8)); if (n) { tot++; if (under(n, drv)) motor++; } } return [motor, tot]; };
      const open = cnt(); L.batchFlush(); const b = new Set(L.batchedGroups()), bad = [];
      for (const o of L.openers()) { if (!(o.open > 0 || o.target > 0)) continue; for (let a = L.byName(o.name); a; a = a.parent) if (b.has(a.name)) bad.push(o.name + ' in ' + a.name); }
      L.setOpen('Motorkap', 0, true); L.finishAll(); const closed = cnt(); return { open, closed, bad, batched: b.size }; })()""")
    check(f'14 [{tag}] pickAt met de kap open raakt de motorruimte (dicht: de kap)', r['open'][0] >= 1 and r['closed'][0] == 0, json.dumps(r['open']) + ' tegen ' + json.dumps(r['closed']))
    check(f'14 [{tag}] batchedGroups bevat geen voorouder van een open opener', not r['bad'], json.dumps(r['bad']) + f' ({r["batched"]} groepen samengevoegd)')
    # preset Motorruimte en terug
    preset(pg, 'openHood')
    st = pg.evaluate('__laguna.state()')
    f = pg.evaluate('__laguna.frameOf("Motorkap")')
    check(f'14 [{tag}] preset Motorruimte opent de kap in de modus Openen', st['openMode'] and 'Motorkap' in st['openers'] and st['preset'] == 'openHood' and f['inside'], json.dumps(st['openers']) + ' ' + json.dumps(f))
    preset(pg, 'assembled')
    st = pg.evaluate('__laguna.state()')
    check(f'14 [{tag}] een andere preset zet Uitklappen terug en sluit de openers', not st['openMode'] and not st['openers'] and not T(pg, 'openOpeners()'), json.dumps(st['openers']))
    # wisselen van modus: Openen aan haalt uitgeklapte groepen dicht en heft isolatie op; uit sluit alle openers
    pg.evaluate("(() => { const L = __laguna; L.preset('engine'); L.finishAll(); })()")
    pg.evaluate("__laguna.setOpenMode(true)"); settle(pg)
    st = pg.evaluate('__laguna.state()')
    check(f'14 [{tag}] Openen aan: alles dicht en geen isolatie', st['openMode'] and not st['open'] and not st['iso'], json.dumps(st['open'][:3]) + ' ' + json.dumps(st['iso']))
    pg.evaluate("__laguna.openAll(1, true)"); settle(pg)
    pg.evaluate("__laguna.setOpenMode(false)"); settle(pg)
    st = pg.evaluate('__laguna.state()')
    check(f'14 [{tag}] Openen uit sluit alle openers', not st['openMode'] and not T(pg, 'openOpeners()') and T(pg, 'baseDev()') < 1e-6, json.dumps(T(pg, 'openOpeners()')))
    # dock: Alles open, Alles dicht en de openerlijst
    preset(pg, 'assembled'); pg.evaluate("__laguna.setOpenMode(true)"); settle(pg, 250)
    n_open = pg.evaluate('__laguna.openers().length')
    def press(sel):
        pg.tap(sel) if touch else pg.click(sel)
        settle(pg, 120)
    press('#btnOpenAll')
    a = pg.evaluate('__laguna.openers().every(o => o.target === 1 && o.open > 0.99)')
    press('#btnCloseAll')
    b = pg.evaluate('__laguna.openers().every(o => o.target === 0 && o.open === 0)')
    check(f'14 [{tag}] Alles open en Alles dicht ({n_open} openers)', a and b, f'open {a}, dicht {b}')
    press('#btnOpenList')
    chips = pg.evaluate('[...document.querySelectorAll("#openList button")].map(b => [b.textContent, b.getAttribute("aria-pressed")])')
    exp = pg.evaluate('document.getElementById("btnOpenList").getAttribute("aria-expanded")')
    r = pg.evaluate('(() => { const e = document.getElementById("openList"); const r = e.getBoundingClientRect(), W = innerWidth, H = innerHeight; return [r.left >= 0, r.right <= W + 0.5, r.top >= 0, r.bottom <= H + 0.5]; })()')
    press('#openList button')
    after = pg.evaluate('document.querySelector("#openList button").getAttribute("aria-pressed")')
    o0 = pg.evaluate('__laguna.openers()[0].target')
    check(f'14 [{tag}] openerlijst: een knop per opener met aria-pressed, een klik opent', len(chips) == n_open and exp == 'true' and after == 'true' and o0 == 1, f'{len(chips)} knoppen, expanded {exp}, pressed na klik {after}')
    check(f'14 [{tag}] openerlijst past in het scherm', all(r), str(r))
    # op een smal scherm is de lijst een keuzemenu en gaat na een keuze dicht; op het bureaublad blijft hij naast het beeld open
    exp2 = pg.evaluate('document.getElementById("btnOpenList").getAttribute("aria-expanded")')
    if w < 920:
        check(f'14 [{tag}] smal scherm: de openerlijst gaat dicht na een keuze', exp2 == 'false', f'expanded {exp2}')
    elif exp2 == 'true':
        press('#btnOpenList')
    press('#btnCloseAll')
    if touch:
        # 16. telefoon staand: compact dock en een kader dat past in wat boven kaart en dock overblijft
        pg.evaluate("__laguna.openAll(0, true); __laguna.select(__laguna.ROOT)"); settle(pg, 300)
        d = pg.evaluate("""(() => { const box = id => document.getElementById(id).getBoundingClientRect(), c = box('presets'), cats = [...document.querySelectorAll('#presets .cat')];
          const tops = new Set(cats.map(e => Math.round(e.getBoundingClientRect().top)));
          const reach = [];
          for (const e of cats) { e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect(); reach.push(r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.height >= 32); }
          document.getElementById('presets').scrollLeft = 0;
          return { rows: tops.size, h: c.height, n: cats.length, reach: reach.every(Boolean), dock: box('dock').height, hs: document.documentElement.scrollWidth > innerWidth }; })()""")
        check(f'16 [{tag}] presetcategorieen in een rij (hoogte <= 60) en elke categorie bereikbaar', d['rows'] == 1 and d['h'] <= 60 and d['n'] >= 6 and d['reach'] and not d['hs'], json.dumps(d))
        vf = pg.evaluate('__laguna.freeView()')
        check(f'16 [{tag}] vrij beeld minstens 55 % van de schermhoogte (was 48 %)', vf['h'] >= 0.55 * h, f"{vf['h']:.0f} van {h}")
        bad = []
        for label in ['Motorkap', 'Achterklep', 'Portier linksvoor', 'Schuifdak', 'Tankklep', 'Bagageruimtevloer']:
            pg.evaluate("__laguna.openAll(0, true); __laguna.select(__laguna.ROOT)"); settle(pg, 200)
            press('#btnOpenList')
            i = pg.evaluate(f'[...document.querySelectorAll("#openList button")].findIndex(b => b.textContent === {json.dumps(label)})')
            press(f'#openList button:nth-child({i + 1})')
            pg.wait_for_timeout(450); settle(pg, 300)
            r = pg.evaluate("""(() => { const L = __laguna, o = L.sel(), lk = o.opn.look || {}, nodes = (lk.nodes || []).map(x => L.byPath(x) || L.byName(x)).filter(Boolean);
              const f = L.frameOf(nodes.length ? nodes : [o]), rc = id => document.getElementById(id).getBoundingClientRect();
              const top = Math.min(...['sheet', 'openCtl', 'presets', 'openList'].map(id => { const r = rc(id); return r.height > 0 ? r.top : 1e9; }));
              const tb = Math.max(...['openSeg', 'help'].map(id => rc(id).bottom), document.querySelector('.title').getBoundingClientRect().bottom);
              return { f, top, tb, sel: L.openers().find(q => q.name === o.name).label, list: !document.getElementById('openList').hidden }; })()""")
            fb = r['f']['box']
            if r['sel'] != label or r['list'] or not r['f']['inside'] or not fb or fb['y'] + fb['h'] > r['top'] + 1 or fb['y'] < r['tb'] - 1:
                bad.append(f"{label}: gekozen {r['sel']}, lijst open {r['list']}, binnen {r['f']['inside']}, kader {fb and [round(fb['y']), round(fb['y'] + fb['h'])]}, boven kaart en dock {round(r['tb'])} tot {round(r['top'])}")
        check(f'16 [{tag}] na een keuze past het kader van de opener boven kaart en dock (echte hoogtes)', not bad, '; '.join(bad[:3]))
        pg.evaluate("__laguna.openAll(0, true); __laguna.select(__laguna.ROOT)"); settle(pg, 200)
    # sneltoets O (desktop)
    if not touch:
        pg.evaluate("document.activeElement && document.activeElement.blur()")
        pg.keyboard.press('o'); settle(pg, 120)
        k1 = pg.evaluate('__laguna.state().openMode')
        pg.keyboard.press('o'); settle(pg, 120)
        k2 = pg.evaluate('__laguna.state().openMode')
        check(f'14 [{tag}] sneltoets O wisselt de modus', k1 != k2, f'{k1} dan {k2}')
        if not pg.evaluate('__laguna.state().openMode'):
            pg.keyboard.press('o'); settle(pg, 120)
    # paneel: knop Openen of Sluiten bij een opener
    pg.evaluate("__laguna.openAll(0, true); __laguna.select(__laguna.byName('Motorkap'))"); settle(pg, 80)
    t1 = pg.evaluate("(() => { const b = document.getElementById('actOpen'); return b.hidden ? null : b.textContent; })()")
    pg.evaluate("document.getElementById('actOpen').click()"); settle(pg, 120)
    t2 = pg.evaluate("(() => { const b = document.getElementById('actOpen'); return [b.hidden ? null : b.textContent, __laguna.openers().find(o => o.name === 'Motorkap').target]; })()")
    check(f'14 [{tag}] paneelknop Openen wordt Sluiten', t1 == 'Openen' and t2[0] == 'Sluiten' and t2[1] == 1, f'{t1} dan {t2}')
    # portierklikken, alleen als het portier een opener is (doet vanzelf mee na de samenvoeging)
    doors = [d for d in ['Portier linksvoor', 'Portier rechtsvoor', 'Portier linksachter', 'Portier rechtsachter'] if pg.evaluate(f'__laguna.openers().some(o => o.name === {json.dumps(d)})')]
    if doors:
        door = doors[0]
        for kw in ['ruit', 'spiegel', 'greep', 'paneel']:
            pg.evaluate("__laguna.openAll(0, true); __laguna.setOpenMode(true)"); settle(pg)
            pg.evaluate(f"__laguna.focusNodes([__laguna.byName({json.dumps(door)})], new THREE.Vector3(1, 0.3, 0.5), 1.4)"); settle(pg, 200); quiet(pg)
            nm = pg.evaluate(f"""(() => {{ const L = __laguna, d = L.byName({json.dumps(door)}); const f = []; (function w(n) {{ if (n.norm.includes({json.dumps(kw)}) && n.ev) f.push(n); n.kids.forEach(w); }})(d); return f.length ? f[0].name : null; }})()""")
            if not nm:
                check(f'14 [{tag}] {door}: {kw} aanwezig', False, 'geen onderdeel met die naam in het portier')
                continue
            pt = pg.evaluate(f"window.__T.pointIn(window.__T.nodeNamed(__laguna.byName({json.dumps(door)}), {json.dumps(nm)}))")
            if not pt:
                check(f'14 [{tag}] {door}: punt op {nm} ({kw})', False, 'niet aanklikbaar in dit aanzicht')
                continue
            tap(pg, touch, pt[0], pt[1]); pg.wait_for_timeout(120); settle(pg, 120); quiet(pg)
            o = pg.evaluate(f'__laguna.openers().find(q => q.name === {json.dumps(door)})')
            check(f'14 [{tag}] klik op {nm} ({kw}) in een dicht {door} opent het portier', o['target'] == 1, json.dumps(o))
            pg.wait_for_timeout(450)
    else:
        print(f'info 14 [{tag}] geen portier als opener: portierklikken overgeslagen')
    pg.evaluate("__laguna.openAll(0, true); __laguna.setOpenMode(false)"); settle(pg)

    # 15. onderdeelnummers: de echte gegevens zonder fouten, daarna alleen tijdelijke records (niets hiervan staat in partnumbers.js)
    if tag == 'desktop':
        pg.evaluate("__laguna.preset('assembled'); __laguna.finishAll()")
        # eerst de echte gegevens: elk pad en elke eenheid in partnumbers.js bestaat
        bad = pg.evaluate('__laguna.pnCheck()')
        check('15 nummers: echte gegevens zonder onbekend pad of onbekende eenheid', not bad, json.dumps(bad[:5]))
        # dan alleen tijdelijke records, zodat de controles niet van de echte gegevens afhangen; aan het eind terug
        pg.evaluate("""(() => {
          window.__pnBak = { map: Object.assign({}, PN_DATA.map), units: Object.assign({}, PN_DATA.units) };
          for (const k of Object.keys(PN_DATA.map)) delete PN_DATA.map[k]; for (const k of Object.keys(PN_DATA.units)) delete PN_DATA.units[k];
          PN_DATA.units.tA = { n: 'Testslot', st: 'past', oe: [['656 01 TEST1', 'slot compleet']], am: [['Testmerk', 'TM-123.456', 'alleen links'], ['Ander merk', 'AM9001', '']], var: 'Alleen benzine', per: 'Per stuk',
            src: [['https://example.org/bron', 'Bron een'], ['javascript:alert(1)', 'Kwaadaardig']], info: [['Interval', '60000 km', 'testbron']] };
          PN_DATA.units.tB = { n: 'Teststeun', st: 'vin', oe: [['654 TEST2', '']], am: [] };
          PN_DATA.units.tC = { n: 'Testafdichting', st: 'nietgevonden', oe: [], am: [] };
          PN_DATA.units.tD = { n: 'Testopvanger', st: 'vin', var: 'Twee uitvoeringen, voor en na 2011', oe: [['655 TEST3', 'oude uitvoering', 'B'], ['655 TEST4', 'nieuwe uitvoering', 'B']], am: [['Testmerk', 'TM-777', 'nieuwe uitvoering', 'A'], ['Ander merk', 'AM7001', '', 'A']],
            kz: { o: ['655 TEST4'], a: [['Testmerk', 'TM-777']], v: 'Uitvoering vanaf 2011', b: 'B', z: 'middel', g: 'Volgens de RDW is de auto in 2011 voor het eerst toegelaten.', s: ['https://example.org/kz', 'javascript:alert(2)'] } };
          PN_DATA.map['Carrosserie/Motorkap/Slotbeugel motorkap'] = ['tA', 'zelf'];
          PN_DATA.map['Carrosserie/Motorkap/Veiligheidshaak'] = ['tA', 'deel', 'zit in het slot'];
          PN_DATA.map['Carrosserie/Motorkap/Motorkapsteun'] = ['tB', 'zelf'];
          PN_DATA.map['Carrosserie/Motorkap/Kapafdichting'] = ['tC', 'zelf'];
          PN_DATA.map['Carrosserie/Motorkap/Steunopvanger'] = ['tD', 'zelf'];
          __laguna.pnRebuild(); })()""")
        def pn(name):
            pg.evaluate(f"__laguna.select(__laguna.byName({json.dumps(name)}))")
            return pg.evaluate("""(() => { const b = document.getElementById('pnBody'); return { text: b.textContent, rows: b.querySelectorAll('.pn-tab tbody tr').length,
              links: [...b.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.target, a.rel]), btn: [...b.querySelectorAll('button')].map(x => x.textContent),
              kz: b.querySelectorAll('.pn-kz').length, kzlinks: [...b.querySelectorAll('.pn-kzbox a')].map(a => [a.getAttribute('href'), a.target, a.rel]),
              warn: document.getElementById('pnWarn').textContent, vis: document.getElementById('pnBox').getBoundingClientRect().height > 0 }; })()""")
        r = pn('Slotbeugel motorkap')
        check('15 nummers: past volgens catalogus met nummer, tabel, variant, verpakking en onderhoud', 'Past volgens catalogus' in r['text'] and '656 01 TEST1' in r['text'] and r['rows'] == 2 and 'TM-123.456' in r['text'] and 'Alleen benzine' in r['text'] and 'Per stuk' in r['text'] and '60000 km' in r['text'], r['text'][:200])
        check('15 nummers: bronlinks met target _blank en rel noopener, geen javascript-link', r['links'] == [['https://example.org/bron', '_blank', 'noopener']], json.dumps(r['links']))
        check('15 nummers: vaste waarschuwing zichtbaar', r['warn'].startswith('Controleer het nummer altijd op het chassisnummer (VIN) bij de dealer of webwinkel') and r['vis'], r['warn'][:60])
        r = pn('Veiligheidshaak')
        check('15 nummers: deel van Testslot met klikbare naam en regel', 'Deel van' in r['text'] and r['btn'] == ['Testslot'] and 'zit in het slot' in r['text'] and '656 01 TEST1' in r['text'], r['text'][:160])
        pg.evaluate("[...document.querySelectorAll('#pnBody button')].find(b => b.textContent === 'Testslot').click()"); settle(pg, 120)
        check('15 nummers: een klik op de naam kiest de eenheid', pg.evaluate('__laguna.state().selected') == 'Slotbeugel motorkap', pg.evaluate('__laguna.state().selected'))
        r = pn('Motorkapsteun')
        check('15 nummers: variant, kies op VIN', 'Variant: kies op VIN' in r['text'] and '654 TEST2' in r['text'], r['text'][:120])
        r = pn('Steunopvanger')
        check('15 nummers: gekozen uitvoering met blok, markering van de gekozen nummers en variantkop', 'Gekozen voor deze auto' in r['text'] and 'Uitvoering vanaf 2011' in r['text'] and 'Volgens de RDW' in r['text']
              and 'Variant: kies op VIN' not in r['text'] and 'Varianten in de catalogus' in r['text'] and r['kz'] == 2 and r['kzlinks'] == [['https://example.org/kz', '_blank', 'noopener']], json.dumps([r['kz'], r['kzlinks']]))
        r = pn('Kapafdichting')
        check('15 nummers: niet gevonden', 'Niet gevonden' in r['text'], r['text'][:120])
        r = pn('Veiligheidshaak'); r = pn('Ruitensproeier links')
        check('15 nummers: niet onderzocht zonder record', 'Niet onderzocht' in r['text'], r['text'][:120])
        r = pn('Motorkap')
        check('15 nummers: groep toont het aantal onderdelen met een nummer', 'Hieronder hebben 4 van' in r['text'], r['text'][:160])
        # zoeken op nummer (zonder spaties en streepjes)
        pg.click('#tabbtn-tree'); pg.fill('#treeSearch', 'tm123456'); pg.wait_for_timeout(200)
        hits = pg.evaluate("[...document.querySelectorAll('#tree .trow .tn')].map(e => e.textContent)")
        check('15 nummers: zoeken op een nummer vindt de eenheid en haar onderdelen', 'Slotbeugel motorkap' in hits and 'Veiligheidshaak' in hits and len(hits) == 2, str(hits))
        pg.fill('#treeSearch', ''); pg.click('#tabbtn-info')
        pg.evaluate("PN_DATA.map['Carrosserie/Bestaat/niet'] = ['tA', 'zelf']; PN_DATA.map['Carrosserie/Motorkap/Motorkapisolatie'] = ['onbekend', 'zelf']; __laguna.pnRebuild()")
        bad = pg.evaluate('__laguna.pnCheck()')
        check('15 nummers: pnCheck meldt een onbekend pad en een onbekende eenheid', len(bad) == 2, json.dumps(bad))
        pg.evaluate("""(() => { for (const k of Object.keys(PN_DATA.map)) delete PN_DATA.map[k]; for (const k of Object.keys(PN_DATA.units)) delete PN_DATA.units[k]; __laguna.pnRebuild(); })()""")
        r = pn('Slotbeugel motorkap')
        check('15 nummers: zonder gegevens niet onderzocht, pnCheck leeg', 'Niet onderzocht' in r['text'] and not pg.evaluate('__laguna.pnCheck()'), r['text'][:100])
        pg.evaluate("Object.assign(PN_DATA.map, window.__pnBak.map); Object.assign(PN_DATA.units, window.__pnBak.units); __laguna.pnRebuild(); __laguna.select(__laguna.ROOT)")
    pg.close()


with session() as s:
    run_view(s, 'desktop', 1280, 800, False)
    run_view(s, 'telefoon', 390, 844, True)
    # donkere modus
    pg = s.page(1280, 800)
    pg.emulate_media(color_scheme='dark')
    pg.wait_for_timeout(300)
    bg = pg.evaluate("getComputedStyle(document.body).backgroundColor")
    pg.evaluate("__laguna.preset('engine'); __laguna.finishAll()")
    pg.wait_for_timeout(300)
    shot(pg, 'itest_dark_motor')
    check('10 donkere modus', bg.replace(' ', '') in ('rgb(26,33,41)',), bg)
    # 12. ingesloten onderdelen (inner): niet getekend en niet aanklikbaar zolang de oudergroep dicht is
    r = pg.evaluate("""(() => { const L = __laguna; L.preset('assembled'); L.finishAll();
      const n = L.byName('Krukmechanisme'), had = n.inner; n.inner = true; L.ROOT.innerKids = L.ROOT.innerKids; n.parent.innerKids = true; applyVisibility();
      const hidden = n.meshes.every(m => !m.userData.node.ev) && !n.obj.visible;
      renderer.info.reset(); renderer.render(scene, camera); const callsHidden = renderer.info.render.calls;
      L.setTarget(n.parent, 1); applyVisibility(); const shownOnOpen = n.obj.visible;
      L.finishAll(); L.setTarget(n.parent, 0); L.finishAll(); const hiddenAgain = !n.obj.visible;
      L.isolate([n]); const shownIsolated = n.obj.visible; L.isolate([]);
      n.inner = had; n.parent.innerKids = n.parent.kids.some(k => k.inner); applyVisibility(); L.finishAll();
      renderer.info.reset(); renderer.render(scene, camera);
      return { hidden, shownOnOpen, hiddenAgain, shownIsolated, saved: renderer.info.render.calls - callsHidden }; })()""")
    check('12 inner: verborgen bij dichte ouder, zichtbaar zodra die uitklapt en bij isoleren', r['hidden'] and r['shownOnOpen'] and r['hiddenAgain'] and r['shownIsolated'], json.dumps(r))
    # 12b. I2: dichtschuiven met de explosieschuif of setExplode laat een opgetild onderdeel zakken
    r = pg.evaluate("""(() => { const L = __laguna; L.preset('assembled'); L.finishAll();
      L.tapNode(L.byName('Subframe')); L.finishAll(); L.tapNode(L.byName('Langsbalk links')); L.finishAll();
      const lifted = L.liftedNode() ? L.liftedNode().name : null;
      L.setExplode(0); L.finishAll();
      return { lifted, after: L.liftedNode() ? L.liftedNode().name : null }; })()""")
    check('12b opgetild onderdeel zakt terug bij setExplode(0)', r['lifted'] == 'Langsbalk links' and r['after'] is None, json.dumps(r))
    # 13. samengevoegd tekenen van gesloten groepen (batching)
    pg.evaluate("__laguna.preset('assembled'); __laguna.finishAll()")
    pg.wait_for_timeout(200)
    r = pg.evaluate("""(() => { const L = __laguna; L.batching(false); const off = L.drawCalls(); L.batching(true);
      const st = L.batchFlush(); const on = L.drawCalls(); return { off, on, st }; })()""")
    calls_off = r['off']
    check('13 batching: minder tekenopdrachten in Gemonteerd (<= 1500)', r['on'] < r['off'] and r['on'] <= 1500, f"{r['off']} -> {r['on']}; {json.dumps(r['st'])}")
    # een onderdeel binnen een samengevoegde groep aanwijzen en (modus Info) selecteren
    r = pg.evaluate("""(() => { const L = __laguna; L.setMode('select');
      const names = L.batchedGroups().map(L.byName).sort((a, b) => b.rad - a.rad);
      const v = L.freeView(), rc = canvas.getBoundingClientRect(); L.ROOT.obj.updateMatrixWorld(true);
      for (const g of names) for (const m of g.meshes) { const n = m.userData.node; if (!n.ev) continue;
        const p = n.lc.clone().applyMatrix4(m.matrixWorld).project(camera);
        const x = Math.round(rc.left + (p.x * 0.5 + 0.5) * rc.width), y = Math.round(rc.top + (-p.y * 0.5 + 0.5) * rc.height);
        if (x < v.x + 8 || x > v.x + v.w - 8 || y < v.y + 8 || y > v.y + v.h - 8 || document.elementFromPoint(x, y) !== canvas) continue;
        const hit = L.pickNodeAt(x, y); if (!hit) continue;
        let a = hit; while (a && a !== g) a = a.parent; if (!a) continue;
        return [x, y, hit.name, g.name]; }
      return null; })()""")
    if check('13 batching: punt op een onderdeel in een samengevoegde groep', r, str(r)):
        pg.mouse.click(r[0], r[1]); pg.wait_for_timeout(120); settle(pg, 60)
        st = pg.evaluate("(() => { const L = __laguna; L.drawCalls(); const s = L.sel(); const b = new Set(L.batchedGroups()); let a = s, hit = false; for (; a; a = a.parent) if (b.has(a.name)) hit = true; return [s.name, hit]; })()")
        check('13 batching: klik selecteert dat onderdeel en zijn groep wordt los getekend', st[0] == r[2] and not st[1], f'aangewezen {r[2]} in {r[3]}, geselecteerd {st[0]}, nog samengevoegd: {st[1]}')
        shot(pg, 'itest_desk_batch_selectie')
        pg.evaluate("__laguna.setMode('part')")
    # openen haalt de groep direct uit de batch; dichtklappen voegt hem na de animatie weer samen
    r = pg.evaluate("""(() => { const L = __laguna; L.preset('assembled'); L.finishAll(); L.batchFlush(); L.drawCalls();
      const g = L.batchedGroups().map(L.byName).find(n => n.kids.some(k => k.asm || !k.inner)); if (!g) return null;
      L.setTarget(g, 1); L.drawCalls(); const unOnOpen = !L.batchedGroups().includes(g.name);
      L.finishAll(); L.setTarget(g, 0); L.drawCalls(); const unWhileAnim = !L.batchedGroups().includes(g.name);
      L.finishAll(); L.drawCalls(); const again = L.batchedGroups().includes(g.name);
      return { group: g.name, unOnOpen, unWhileAnim, again }; })()""")
    check('13 batching: openen maakt direct los, na het dichtklappen weer samengevoegd', r and r['unOnOpen'] and r['unWhileAnim'] and r['again'], json.dumps(r))
    # 11. tekenopdrachten en frametijd
    pg.evaluate("__laguna.preset('assembled'); __laguna.finishAll(); __laguna.batchFlush()")
    pg.wait_for_timeout(200)
    calls = pg.evaluate("(() => { renderer.info.reset(); renderer.render(scene, camera); return renderer.info.render.calls; })()")
    print(f'info 13 tekenopdrachten Gemonteerd zonder batching: {calls_off}, met batching: {calls}')
    prof = pg.evaluate("__laguna.profileFrames('Motor F4Rt', 120)")
    print(f'info 11 tekenopdrachten Gemonteerd: {calls} (drempel 1500); profileFrames Motor F4Rt: p50 {prof["p50"]} ms, p95 {prof["p95"]} ms, max {prof["max"]} ms (drempel p95 8 ms)')
    if os.environ.get('ITEST_GATES'):
        check('11 tekenopdrachten <= 1500', calls <= 1500, str(calls))
        check('11 frametijd p95 <= 8 ms', prof['p95'] <= 8, str(prof['p95']))
    pg.close()
    # 17. deelbare stand in de URL en de debug-overlay
    pq = s.page(1280, 800, query='?preset=engine&debug=1')
    st = pq.evaluate("__laguna.state()")
    check('17 ?preset=engine laadt de preset Motor F4Rt', st['preset'] == 'engine' and not st['openMode'], json.dumps({'preset': st['preset'], 'openMode': st['openMode']}))
    pq.wait_for_timeout(900)
    dbg = pq.evaluate("(document.getElementById('debug') || {}).textContent || ''")
    check('17 ?debug=1 toont de overlay met tekenopdrachten en versie', 'tekenopdrachten' in dbg and 'versie' in dbg, dbg[:120])
    ver = pq.evaluate("__laguna.version")
    check('17 versiestempel uit build.py (nummer plus inhoudshash)', bool(ver) and 'bron' in ver, str(ver))
    pq.evaluate("__laguna.preset('turbo'); __laguna.finishAll()"); pq.wait_for_timeout(150)
    check('17 de adresbalk volgt de preset', 'preset=turbo' in pq.evaluate('location.search') and 'debug=1' in pq.evaluate('location.search'), pq.evaluate('location.search'))
    pq.evaluate("__laguna.setOpenMode(true); __laguna.openAll(0, true); __laguna.setOpen('Motorkap', 1, true); __laguna.setOpen('Renault Laguna III/Carrosserie/Portier linksvoor/Zijruit', 1, true); __laguna.finishAll()")
    pq.wait_for_timeout(150)
    q = pq.evaluate("decodeURIComponent(location.search).replace(/\\+/g, ' ')")
    check('17 de adresbalk volgt de openstand (naam, of pad bij een dubbele naam)', 'open=Motorkap,Carrosserie/Portier linksvoor/Zijruit' in q, q)
    pq.close()
    pq = s.page(1280, 800, query='?open=Motorkap,Carrosserie/Portier%20linksvoor/Zijruit')
    st = pq.evaluate("__laguna.state()")
    check('17 ?open=... opent precies die openers in de modus Openen', st['openMode'] and sorted(st['openers']) == ['Motorkap', 'Zijruit'], json.dumps({'openMode': st['openMode'], 'openers': st['openers']}))
    pq.close()
    errs = s.errors()  # fouten en waarschuwingen (harness.errors telt beide)
    check('10 geen console-fouten of -waarschuwingen', not s.logs, '; '.join(l[:200] for l in s.logs[:5]))
    s.report()

fails = [n for n, ok in RESULTS if not ok]
print(f'\nSAMENVATTING: {len(RESULTS) - len(fails)} van {len(RESULTS)} controles geslaagd' + (', mislukt: ' + '; '.join(fails) if fails else ''))
sys.exit(1 if fails else 0)

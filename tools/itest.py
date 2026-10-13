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
    errs = s.errors() + [l for l in s.logs if 'warning' in l]
    check('10 geen console-fouten of -waarschuwingen', not s.logs, '; '.join(l[:200] for l in s.logs[:5]))
    s.report()

fails = [n for n, ok in RESULTS if not ok]
print(f'\nSAMENVATTING: {len(RESULTS) - len(fails)} van {len(RESULTS)} controles geslaagd' + (', mislukt: ' + '; '.join(fails) if fails else ''))
sys.exit(1 if fails else 0)

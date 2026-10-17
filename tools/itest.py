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
  7  elke preset: checkPresets() leeg, onderwerp binnen het vrije beeld en minstens 12 % ervan, en nog steeds binnen het
     vrije beeld 1,5 s na de preset (golf 5b-3, 0.3f)
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
     overlay met tekenopdrachten en versie; __model.version is het versiestempel uit build.py (zou de fout vangen dat een gedeelde
     link op Gemonteerd opent, of dat de versie in de pagina niet meer bij de bron hoort)
  18 golf 5c-1 (app): foutpaden (geen three.js, geen WebGL, fout vooraf en achteraf, contextverlies en herstel), uiLastFit na een
     duik bij draaien, rondleiding met pauze, vorige, volgende en verborgen tabblad, integrity op de scripttags, "+n meer" bij
     labels, fade en badge bij isoleren, themaknop met geheugen, toegankelijkheid (focusval en inert, menu, werkbalk, focusrand,
     schakelaarcontrast, tabs, live region, Esc), hulpvenster uit PRESETS, zoeken met synoniemen en diakrieten, toast, suggestie,
     trilling, Beeld opslaan en de printstijl; elke controle noemt de fout die hij gevangen zou hebben
  19 toetsenbord volledig (desktop, echte toetsaanslagen): Enter en Shift+Enter op groep, onderdeel en opener, Escape, ? en het
     hulpvenster, / en het zoekveld (de o van motorkap wisselt de modus niet), pijltjes in de boom, op de modusknoppen en de
     segmentknop, het presetmenu met pijl omlaag, End, Home, Enter en Escape (audit U29, U17 en Enter op een opener uit golf 4)
  20 formaat wisselen (desktopcontext): 390 x 844, 1280 x 800, 844 x 390, 1024 x 768 en terug: indeling, geen horizontale
     scroll, labels en het kader van de selectie binnen het vrije beeld, geen consolemelding (bevinding I1 uit golf 2)
  21 stap terug tot 50 stappen (55 stappen, 50 keer Backspace, de 51e doet niets) en reduced motion via emulate_media:
     REDUCED staat, overgangen uit, uitklap en preset direct in de eindstand (bevindingen I5 en I6; REDUCED zonder controle)
  22 zoeken: KLEPSPIE en klepspie gelijk; klépspie, solenoide en vacuum vinden klepspie, Solenoïde en Vacuüm (audit U17)
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
  L: () => window.__model,
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
  // grootste afstand tussen een telescoop van een open opener en zijn anker (gasveren, koordjes); 0 als alles aan elkaar zit
  strutErr() { const L = this.L(); let mx = 0; for (const n of L.ALL) { const s = n.strut; if (!s || !s.leadN || s.leadN.ou === 0) continue; n.obj.updateWorldMatrix(true, false); s.na.obj.updateWorldMatrix(true, false); mx = Math.max(mx, s.na.obj.localToWorld(s.pa.clone()).distanceTo(n.obj.getWorldPosition(new THREE.Vector3()))); } return mx; },
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
    pg.evaluate('__model.finishAll()')
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
    pg.evaluate(f"__model.preset({json.dumps(pid)})")
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
        opened = pg.evaluate(f"__model.byName({json.dumps(name)}).target > 0.5")
        check(f'1 [{tag}] {"tik" if touch else "klik"} op {name}', mv < 1e-3 and opened, f'grootste verschuiving buiten de groep {mv * 1000:.3f} mm ({who}), groep open: {opened}')
        pg.wait_for_timeout(450)
    # dubbeltik met 250 ms tussenpoos: het onderdeel van de eerste tik
    preset(pg, 'assembled')
    pt = T(pg, 'pointOn("Motorkap")')
    first = pg.evaluate(f'__model.pickAt({pt[0]}, {pt[1]})')
    pg.evaluate(f"window.__T.synthDouble({pt[0]}, {pt[1]}, {json.dumps('touch' if touch else 'mouse')}, 250)")
    pg.wait_for_timeout(100); settle(pg)
    sel = pg.evaluate('__model.state().selected')
    check(f'1 [{tag}] dubbel{"tik" if touch else "klik"} 250 ms selecteert het onderdeel van de eerste tik', sel == first, f'eerste tik {first}, geselecteerd {sel}')
    if not touch:  # ook met echte muisinvoer
        pg.wait_for_timeout(450); preset(pg, 'assembled')
        pg.mouse.click(pt[0], pt[1]); pg.wait_for_timeout(250); pg.mouse.click(pt[0], pt[1])
        pg.wait_for_timeout(100); settle(pg)
        sel = pg.evaluate('__model.state().selected')
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
            r = pg.evaluate("(() => { const L = __model, n = L.sel(); const closed = []; for (let a = n.parent; a; a = a.parent) if (a.target <= 0.5) closed.push(a.name); return [n.name, closed]; })()")
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
    pg.evaluate("(() => { const L = __model; L.setTarget(L.byName('Motor F4Rt'), 1); L.finishAll(); })()")
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
        pg.evaluate('__model.undo()'); settle(pg)
        s2 = T(pg, 'stateNoHist()')
        check(f'5 [{tag}] stap terug na {label}', s2 == s0 and s1 != s0, '' if s2 == s0 else f'voor {s0[:160]} na {s2[:160]}')
    preset(pg, 'assembled'); pg.wait_for_timeout(450)
    pt = T(pg, 'pointOn("Motorkap")')
    undo_case('uitklappen (klik)', lambda: tap(pg, touch, pt[0], pt[1]))
    pg.wait_for_timeout(450)
    preset(pg, 'engineAll')
    undo_case('inklappen', lambda: pg.evaluate("__model.collapseAt(__model.byName('Cilinderkop').kids.find(k => !k.asm))"))
    undo_case('preset', lambda: pg.evaluate("__model.preset('gearbox')"))
    preset(pg, 'engine')
    undo_case('schuif', lambda: pg.locator('#explode').fill('500'))
    preset(pg, 'assembled'); pg.wait_for_timeout(450)
    undo_case('wisselen naar Openen', lambda: pg.evaluate("__model.setOpenMode(true)"))
    pg.evaluate("__model.setOpenMode(true)"); settle(pg, 250); quiet(pg)
    pt = pg.evaluate('window.__T.pointIn(__model.byName("Motorkap"))')
    undo_case('openen van de kap (klik in Openen)', lambda: tap(pg, touch, pt[0], pt[1]))
    pg.evaluate("__model.openAll(0, true); __model.setOpenMode(false)"); settle(pg)
    preset(pg, 'engine')
    s0 = T(pg, 'stateNoHist()')
    pg.evaluate("__model.preset('chassis')"); settle(pg)
    pg.evaluate("document.activeElement && document.activeElement.blur()")
    pg.keyboard.press('Backspace'); settle(pg)
    check(f'5 [{tag}] Backspace is stap terug', T(pg, 'stateNoHist()') == s0)
    # camera na Stap terug (golf 5b-3, G1): de herkadrering na een layoutwijziging van het dock trok de camera na een Stap terug naar
    # het kader van de preset waaruit je terugging (uiRestore liet uiLastFit en uiFitRef staan). state() bevat geen camera, dus de
    # controle hierboven ving dat niet. Wachttijden zoals een gebruiker ze heeft: de preset loopt uit, de herkadrering komt na ~160 ms.
    def cam_now():
        return pg.evaluate("(() => { const c = camera.position, t = controls.target; return [c.x, c.y, c.z, t.x, t.y, t.z]; })()")
    for a, b in [('assembled', 'engineAll'), ('engine', 'engineAll'), ('assembled', 'engine'), ('assembled', 'cooling')]:
        pg.evaluate("(id) => { __model.preset(id); __model.finishAll(); }", a); pg.wait_for_timeout(1200); settle(pg, 60)
        c0 = cam_now()
        pg.evaluate("(id) => { __model.preset(id); }", b); pg.wait_for_timeout(4000); settle(pg, 400)
        pg.evaluate('__model.undo()'); settle(pg, 300); pg.wait_for_timeout(1500)
        c2 = cam_now()
        dc = max(abs(x - y) for x, y in zip(c0, c2))
        check(f'5 [{tag}] camera na stap terug ({a}, {b}, terug) binnen 0,05 m van de stand voor de preset', dc <= 0.05, f'grootste verschil {dc:.3f} m; voor {[round(x, 2) for x in c0]} na {[round(x, 2) for x in c2]}')

    # 6. schuif op de werkgroep
    for wg in ['Renault Laguna III', 'Motor F4Rt']:
        preset(pg, 'assembled')
        pg.evaluate(f"__model.select(__model.byName({json.dumps(wg)}))")
        for v in (0, 1, 0.5):
            pg.evaluate(f'__model.setExplode({v})'); settle(pg, 60)
            ok, info = T(pg, f'sliderCheck({v})')
            check(f'6 [{tag}] schuif {v} op {wg}', ok, info)
    pg.evaluate("__model.select(__model.byName('Motor F4Rt'))")
    pg.locator('#explode').fill('500'); settle(pg, 60)
    ok, info = T(pg, 'sliderCheck(0.5)')
    vt = pg.evaluate("document.getElementById('explode').getAttribute('aria-valuetext')")
    check(f'6 [{tag}] schuif bedienen met de echte invoer', ok and 'lagen' in vt, f'{info}; aria-valuetext "{vt}"')

    # 7. elke preset: kadrering
    errs = pg.evaluate('__model.checkPresets()')
    check(f'7 [{tag}] checkPresets() leeg', not errs, '; '.join(errs[:4]))
    plist = pg.evaluate('__model.presetList()')
    bad, late = [], []
    for p in plist:
        if p['tour']: continue
        preset(pg, p['id'])
        f = pg.evaluate(f"__model.frameOf({json.dumps(p['subject'])})")
        if not f['inside'] or f['cover'] < 0.12:
            bad.append(f"{p['label']}: binnen {f['inside']}, dekking {f['cover']:.2f}")
        # golf 5b-3 (0.3f): het onderwerp blijft ook 1,5 s na de preset binnen het vrije beeld (een camera die later nog
        # verschuift, of een kader dat pas na de eerste meting buiten het beeld valt, werd hierboven niet gezien)
        pg.wait_for_timeout(1500)
        g = pg.evaluate(f"__model.frameOf({json.dumps(p['subject'])})")
        if not g['inside']:
            late.append(f"{p['label']} ({p['id']}): box {json.dumps(g['box'])}, beeld {json.dumps(g['view'])}")
    check(f'7 [{tag}] {len([p for p in plist if not p["tour"]])} presets in beeld en >= 12 % van het vrije beeld', not bad, '; '.join(bad[:6]))
    check(f'7 [{tag}] na elke preset en 1,5 s staat het onderwerp binnen het vrije beeld ({len([p for p in plist if not p["tour"]])} presets)', not late, ' | '.join(late[:6]))

    # 8. labels in zes standen
    lab_bad, counts = [], []
    for pid in ['main', 'engine', 'gearbox', 'chassis', 'everything', 'deep']:
        if pid == 'deep':
            preset(pg, 'engineAll')
            pg.evaluate("__model.dive(__model.byName('Cilinderkop').kids.find(k => !k.asm))")
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
        st = pg.evaluate('__model.state()')
        if p['tour']:
            if not st['tour']: miss.append('rondleiding start niet')
            pg.evaluate('__model.stopTour()')
        elif st['preset'] != p['id']:
            miss.append(f"{p['label']}: actief {st['preset']}")
        settle(pg, 30)
    check(f'9 [{tag}] alle {len(plist)} presets via categorie + item', not miss, '; '.join(miss[:4]))
    keys_bad = []
    pg.evaluate("document.activeElement && document.activeElement.blur()")
    for p in plist:
        if not p['key']: continue
        pg.keyboard.press(p['key']); pg.wait_for_timeout(40)
        st = pg.evaluate('__model.state()')
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
        pt = pg.evaluate('window.__T.pointIn(__model.byName("Motorkap"))')
        if not check(f'14 [{tag}] punt op de Motorkap ({label})', pt, str(pt and pt[2])):
            return
        before = T(pg, 'positions()')
        idx = T(pg, 'openerIdx("Motorkap")')
        pg.evaluate('window.__before = ' + json.dumps(before))
        tap(pg, touch, pt[0], pt[1])
        pg.wait_for_timeout(120); settle(pg, 80)
        quiet(pg)
        o = pg.evaluate('__model.openers().find(q => q.name === "Motorkap")')
        check(f'14 [{tag}] {"tik" if touch else "klik"} op de kap {label}', (o['target'] > 0) == expect_open and (o['open'] > 0.99) == expect_open, json.dumps(o))
        if expect_open:
            mv, who = pg.evaluate(f'window.__T.maxMoveOutside(window.__before, {json.dumps(idx)})')
            check(f'14 [{tag}] niets buiten de kap en zijn volgers verschuift meer dan 1 mm', mv < 1e-3, f'grootste verschuiving {mv * 1000:.3f} mm ({who})')
            f = pg.evaluate('__model.frameOf("Motorkap")')
            check(f'14 [{tag}] kader van de geopende kap binnen het vrije beeld', f['inside'] and f['cover'] > 0.05, json.dumps(f))
        pg.wait_for_timeout(450)
    pg.evaluate("__model.preset('assembled'); __model.finishAll()")
    pg.wait_for_timeout(450)
    if touch:
        pg.tap('#openSeg [data-omode="open"]')
    else:
        pg.click('#openSeg [data-omode="open"]')
    settle(pg, 250)
    st = pg.evaluate('__model.state()')
    seg = pg.evaluate('[...document.querySelectorAll("#openSeg [data-omode]")].map(b => b.getAttribute("aria-checked"))')
    check(f'14 [{tag}] segmentknop zet de modus Openen', st['openMode'] and seg == ['false', 'true'] and not st['open'], json.dumps(seg) + ' ' + json.dumps(st['open'][:3]))
    hood_click('(dicht, opent)', True)
    hood_click('(open, sluit)', False)
    # aanwijstekst (muis)
    if not touch:
        pg.evaluate("__model.openAll(0, true); __model.focusNodes([__model.ROOT], new THREE.Vector3(1, 0.42, 1.08), 1.04)"); settle(pg, 200)
        pt = pg.evaluate('window.__T.pointIn(__model.byName("Motorkap"))')
        pg.mouse.move(pt[0], pt[1]); pg.wait_for_timeout(250)
        tx = pg.evaluate("document.getElementById('tip').hidden ? '' : document.getElementById('tip').textContent")
        wl = pg.evaluate('window.__T.pointIn(__model.byName("Wiel linksvoor"))')
        pg.mouse.move(wl[0], wl[1]); pg.wait_for_timeout(250)
        tx2 = pg.evaluate("document.getElementById('tip').hidden ? '' : document.getElementById('tip').textContent")
        check(f'14 [{tag}] aanwijstekst: klik om te openen en niets te openen', 'Motorkap' in tx and 'klik om te openen' in tx and 'niets te openen' in tx2, f'"{tx}" en "{tx2}"')
        pg.mouse.move(5, 400); pg.wait_for_timeout(100)
    # dubbelklik of dubbeltik is gelijk aan een enkele klik: de kap staat open en er is niets uitgeklapt
    pg.evaluate("__model.openAll(0, true)"); settle(pg); quiet(pg)
    pt = pg.evaluate('window.__T.pointIn(__model.byName("Motorkap"))')
    if check(f'14 [{tag}] punt op de kap voor dubbel{"tik" if touch else "klik"}', pt, str(pt and pt[2])):
        pg.evaluate(f"window.__T.synthDouble({pt[0]}, {pt[1]}, {json.dumps('touch' if touch else 'mouse')}, 250)")
        pg.wait_for_timeout(100); settle(pg)
        ex = T(pg, 'noExplode()')
        o = pg.evaluate('__model.openers().find(q => q.name === "Motorkap")')
        check(f'14 [{tag}] dubbel{"tik" if touch else "klik"} op de kap: geen uitklapdoel boven 0, kap een keer geopend', not ex and o['target'] == 1, f'uitgeklapt: {ex[:3]}, kap {json.dumps(o)}')
    pg.wait_for_timeout(450)
    # rechtsklik, Shift+klik en lang drukken sluiten de binnenste open opener
    for label, how in ([('lang drukken', 'press')] if touch else [('rechtsklik', 'right'), ('Shift+klik', 'shift')]):
        pg.evaluate("__model.openAll(1, true)"); settle(pg)
        pg.evaluate("__model.focusNodes([__model.byName('Motorkap'), __model.byName('Aandrijflijn')], new THREE.Vector3(0.25, 0.9, 1), 1.1)"); settle(pg, 120); quiet(pg)
        pt = pg.evaluate('window.__T.pointIn(__model.byName("Motorkap"))')
        if not check(f'14 [{tag}] punt op de open kap ({label})', pt, str(pt and pt[2])):
            continue
        if how == 'right':
            pg.mouse.click(pt[0], pt[1], button='right')
        elif how == 'shift':
            pg.keyboard.down('Shift'); pg.mouse.click(pt[0], pt[1]); pg.keyboard.up('Shift')
        else:
            long_press(pg, cdp, pt[0], pt[1])
        pg.wait_for_timeout(100); settle(pg, 120)
        o = pg.evaluate('__model.openers().find(q => q.name === "Motorkap")')
        check(f'14 [{tag}] {label} sluit de open kap', o['target'] == 0 and o['open'] == 0, json.dumps(o))
        pg.wait_for_timeout(450)
    # pick met de kap open raakt de motorruimte, en er is geen batch om een open opener
    pg.evaluate("__model.openAll(0, true)"); settle(pg)
    preset(pg, 'openHood')
    pg.wait_for_timeout(350); settle(pg, 80)
    r = pg.evaluate("""(() => { const L = __model, v = L.freeView(), drv = L.byName('Aandrijflijn'); const under = (n, a) => { for (let p = n; p; p = p.parent) if (p === a) return true; return false; };
      const cnt = () => { let motor = 0, tot = 0; for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) { const n = L.pickNodeAt(v.x + v.w * (0.2 + 0.6 * i / 8), v.y + v.h * (0.2 + 0.6 * j / 8)); if (n) { tot++; if (under(n, drv)) motor++; } } return [motor, tot]; };
      const open = cnt(); L.batchFlush(); const b = new Set(L.batchedGroups()), bad = [];
      for (const o of L.openers()) { if (!(o.open > 0 || o.target > 0)) continue; for (let a = L.byName(o.name); a; a = a.parent) if (b.has(a.name)) bad.push(o.name + ' in ' + a.name); }
      L.setOpen('Motorkap', 0, true); L.finishAll(); const closed = cnt(); return { open, closed, bad, batched: b.size }; })()""")
    check(f'14 [{tag}] pickAt met de kap open raakt de motorruimte (dicht: de kap)', r['open'][0] >= 1 and r['closed'][0] == 0, json.dumps(r['open']) + ' tegen ' + json.dumps(r['closed']))
    check(f'14 [{tag}] batchedGroups bevat geen voorouder van een open opener', not r['bad'], json.dumps(r['bad']) + f' ({r["batched"]} groepen samengevoegd)')
    # preset Motorruimte en terug
    preset(pg, 'openHood')
    st = pg.evaluate('__model.state()')
    f = pg.evaluate('__model.frameOf("Motorkap")')
    check(f'14 [{tag}] preset Motorruimte opent de kap in de modus Openen', st['openMode'] and 'Motorkap' in st['openers'] and st['preset'] == 'openHood' and f['inside'], json.dumps(st['openers']) + ' ' + json.dumps(f))
    preset(pg, 'assembled')
    st = pg.evaluate('__model.state()')
    check(f'14 [{tag}] een andere preset zet Uitklappen terug en sluit de openers', not st['openMode'] and not st['openers'] and not T(pg, 'openOpeners()'), json.dumps(st['openers']))
    # wisselen van modus: Openen aan haalt uitgeklapte groepen dicht en heft isolatie op; de openstand blijft bij elke wissel staan
    pg.evaluate("(() => { const L = __model; L.preset('engine'); L.finishAll(); })()")
    pg.evaluate("__model.setOpenMode(true)"); settle(pg)
    st = pg.evaluate('__model.state()')
    check(f'14 [{tag}] Openen aan: alles dicht en geen isolatie', st['openMode'] and not st['open'] and not st['iso'], json.dumps(st['open'][:3]) + ' ' + json.dumps(st['iso']))
    pg.evaluate("__model.setOpen('Motorkap', 1, true); __model.setOpen('Achterklep', 1, true)"); settle(pg)
    pg.evaluate("__model.setOpenMode(false)"); settle(pg)
    st = pg.evaluate('__model.state()')
    check(f'14 [{tag}] Openen uit laat de openers staan (motorkap en achterklep open in Uitklappen)', not st['openMode'] and {'Motorkap', 'Achterklep'} <= set(T(pg, 'openOpeners()')), json.dumps(T(pg, 'openOpeners()')))
    # uitklappen met open openers: de gasveren en koordjes blijven aan hun ankers (zonder herberekening na een uitklapstap
    # hing de linker gasveer 62 cm naast zijn anker), ook halverwege de animatie en na inklappen
    pg.evaluate("document.getElementById('btnExplodeAll').click()"); pg.wait_for_timeout(300)
    e_mid = T(pg, 'strutErr()')
    pg.evaluate("__model.finishAll()"); settle(pg)
    e_out = T(pg, 'strutErr()')
    pg.evaluate("document.getElementById('btnCollapseAll').click(); __model.finishAll()"); settle(pg)
    e_in = T(pg, 'strutErr()')
    check(f'14 [{tag}] uitklappen met open openers: telescopen aan hun ankers', max(e_mid, e_out, e_in) < 1e-4 and len(T(pg, 'openOpeners()')) >= 2, f'{e_mid:.2g} {e_out:.2g} {e_in:.2g}')
    pg.evaluate("__model.setOpenMode(true)"); settle(pg)
    st = pg.evaluate('__model.state()')
    check(f'14 [{tag}] Openen weer aan: openers blijven open, explosie dicht', st['openMode'] and not st['open'] and {'Motorkap', 'Achterklep'} <= set(T(pg, 'openOpeners()')), json.dumps(st['open'][:3]))
    pg.evaluate("__model.openAll(0, true); __model.setOpenMode(false)"); settle(pg)
    # dock: Alles open, Alles dicht en de openerlijst
    preset(pg, 'assembled'); pg.evaluate("__model.setOpenMode(true)"); settle(pg, 250)
    n_open = pg.evaluate('__model.openers().length')
    def press(sel):
        pg.tap(sel) if touch else pg.click(sel)
        settle(pg, 120)
    press('#btnOpenAll')
    a = pg.evaluate('__model.openers().every(o => o.target === 1 && o.open > 0.99)')
    press('#btnCloseAll')
    b = pg.evaluate('__model.openers().every(o => o.target === 0 && o.open === 0)')
    check(f'14 [{tag}] Alles open en Alles dicht ({n_open} openers)', a and b, f'open {a}, dicht {b}')
    press('#btnOpenList')
    chips = pg.evaluate('[...document.querySelectorAll("#openList button")].map(b => [b.textContent, b.getAttribute("aria-pressed")])')
    exp = pg.evaluate('document.getElementById("btnOpenList").getAttribute("aria-expanded")')
    r = pg.evaluate('(() => { const e = document.getElementById("openList"); const r = e.getBoundingClientRect(), W = innerWidth, H = innerHeight; return [r.left >= 0, r.right <= W + 0.5, r.top >= 0, r.bottom <= H + 0.5]; })()')
    press('#openList button')
    after = pg.evaluate('document.querySelector("#openList button").getAttribute("aria-pressed")')
    o0 = pg.evaluate('__model.openers()[0].target')
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
        pg.evaluate("__model.openAll(0, true); __model.select(__model.ROOT)"); settle(pg, 300)
        d = pg.evaluate("""(() => { const box = id => document.getElementById(id).getBoundingClientRect(), c = box('presets'), cats = [...document.querySelectorAll('#presets .cat')];
          const tops = new Set(cats.map(e => Math.round(e.getBoundingClientRect().top)));
          const reach = [];
          for (const e of cats) { e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect(); reach.push(r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.height >= 32); }
          document.getElementById('presets').scrollLeft = 0;
          return { rows: tops.size, h: c.height, n: cats.length, reach: reach.every(Boolean), dock: box('dock').height, hs: document.documentElement.scrollWidth > innerWidth }; })()""")
        check(f'16 [{tag}] presetcategorieen in een rij (hoogte <= 60) en elke categorie bereikbaar', d['rows'] == 1 and d['h'] <= 60 and d['n'] >= 6 and d['reach'] and not d['hs'], json.dumps(d))
        vf = pg.evaluate('__model.freeView()')
        check(f'16 [{tag}] vrij beeld minstens 55 % van de schermhoogte (was 48 %)', vf['h'] >= 0.55 * h, f"{vf['h']:.0f} van {h}")
        bad = []
        for label in ['Motorkap', 'Achterklep', 'Portier linksvoor', 'Schuifdak', 'Tankklep', 'Bagageruimtevloer']:
            pg.evaluate("__model.openAll(0, true); __model.select(__model.ROOT)"); settle(pg, 200)
            press('#btnOpenList')
            i = pg.evaluate(f'[...document.querySelectorAll("#openList button")].findIndex(b => b.textContent === {json.dumps(label)})')
            press(f'#openList button:nth-child({i + 1})')
            pg.wait_for_timeout(450); settle(pg, 300)
            r = pg.evaluate("""(() => { const L = __model, o = L.sel(), lk = o.opn.look || {}, nodes = (lk.nodes || []).map(x => L.byPath(x) || L.byName(x)).filter(Boolean);
              const f = L.frameOf(nodes.length ? nodes : [o]), rc = id => document.getElementById(id).getBoundingClientRect();
              const top = Math.min(...['sheet', 'openCtl', 'presets', 'openList'].map(id => { const r = rc(id); return r.height > 0 ? r.top : 1e9; }));
              const tb = Math.max(...['openSeg', 'help'].map(id => rc(id).bottom), document.querySelector('.title').getBoundingClientRect().bottom);
              return { f, top, tb, sel: L.openers().find(q => q.name === o.name).label, list: !document.getElementById('openList').hidden }; })()""")
            fb = r['f']['box']
            if r['sel'] != label or r['list'] or not r['f']['inside'] or not fb or fb['y'] + fb['h'] > r['top'] + 1 or fb['y'] < r['tb'] - 1:
                bad.append(f"{label}: gekozen {r['sel']}, lijst open {r['list']}, binnen {r['f']['inside']}, kader {fb and [round(fb['y']), round(fb['y'] + fb['h'])]}, boven kaart en dock {round(r['tb'])} tot {round(r['top'])}")
        check(f'16 [{tag}] na een keuze past het kader van de opener boven kaart en dock (echte hoogtes)', not bad, '; '.join(bad[:3]))
        pg.evaluate("__model.openAll(0, true); __model.select(__model.ROOT)"); settle(pg, 200)
    # sneltoets O (desktop)
    if not touch:
        pg.evaluate("document.activeElement && document.activeElement.blur()")
        pg.keyboard.press('o'); settle(pg, 120)
        k1 = pg.evaluate('__model.state().openMode')
        pg.keyboard.press('o'); settle(pg, 120)
        k2 = pg.evaluate('__model.state().openMode')
        check(f'14 [{tag}] sneltoets O wisselt de modus', k1 != k2, f'{k1} dan {k2}')
        if not pg.evaluate('__model.state().openMode'):
            pg.keyboard.press('o'); settle(pg, 120)
    # paneel: knop Openen of Sluiten bij een opener
    pg.evaluate("__model.openAll(0, true); __model.select(__model.byName('Motorkap'))"); settle(pg, 80)
    t1 = pg.evaluate("(() => { const b = document.getElementById('actOpen'); return b.hidden ? null : b.textContent; })()")
    pg.evaluate("document.getElementById('actOpen').click()"); settle(pg, 120)
    t2 = pg.evaluate("(() => { const b = document.getElementById('actOpen'); return [b.hidden ? null : b.textContent, __model.openers().find(o => o.name === 'Motorkap').target]; })()")
    check(f'14 [{tag}] paneelknop Openen wordt Sluiten', t1 == 'Openen' and t2[0] == 'Sluiten' and t2[1] == 1, f'{t1} dan {t2}')
    # portierklikken, alleen als het portier een opener is (doet vanzelf mee na de samenvoeging)
    doors = [d for d in ['Portier linksvoor', 'Portier rechtsvoor', 'Portier linksachter', 'Portier rechtsachter'] if pg.evaluate(f'__model.openers().some(o => o.name === {json.dumps(d)})')]
    if doors:
        door = doors[0]
        for kw in ['ruit', 'spiegel', 'greep', 'paneel']:
            pg.evaluate("__model.openAll(0, true); __model.setOpenMode(true)"); settle(pg)
            pg.evaluate(f"__model.focusNodes([__model.byName({json.dumps(door)})], new THREE.Vector3(1, 0.3, 0.5), 1.4)"); settle(pg, 200); quiet(pg)
            nm = pg.evaluate(f"""(() => {{ const L = __model, d = L.byName({json.dumps(door)}); const f = []; (function w(n) {{ if (n.norm.includes({json.dumps(kw)}) && n.ev) f.push(n); n.kids.forEach(w); }})(d); return f.length ? f[0].name : null; }})()""")
            if not nm:
                check(f'14 [{tag}] {door}: {kw} aanwezig', False, 'geen onderdeel met die naam in het portier')
                continue
            pt = pg.evaluate(f"window.__T.pointIn(window.__T.nodeNamed(__model.byName({json.dumps(door)}), {json.dumps(nm)}))")
            if not pt:
                check(f'14 [{tag}] {door}: punt op {nm} ({kw})', False, 'niet aanklikbaar in dit aanzicht')
                continue
            tap(pg, touch, pt[0], pt[1]); pg.wait_for_timeout(120); settle(pg, 120); quiet(pg)
            o = pg.evaluate(f'__model.openers().find(q => q.name === {json.dumps(door)})')
            check(f'14 [{tag}] klik op {nm} ({kw}) in een dicht {door} opent het portier', o['target'] == 1, json.dumps(o))
            pg.wait_for_timeout(450)
    else:
        print(f'info 14 [{tag}] geen portier als opener: portierklikken overgeslagen')
    pg.evaluate("__model.openAll(0, true); __model.setOpenMode(false)"); settle(pg)

    # 15. onderdeelnummers: de echte gegevens zonder fouten, daarna alleen tijdelijke records (niets hiervan staat in partnumbers.js)
    if tag == 'desktop':
        pg.evaluate("__model.preset('assembled'); __model.finishAll()")
        # eerst de echte gegevens: elk pad en elke eenheid in partnumbers.js bestaat
        bad = pg.evaluate('__model.pnCheck()')
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
          __model.pnRebuild(); })()""")
        def pn(name):
            pg.evaluate(f"__model.select(__model.byName({json.dumps(name)}))")
            return pg.evaluate("""(() => { const b = document.getElementById('pnBody'); return { text: b.textContent, rows: b.querySelectorAll('.pn-tab tbody tr').length,
              links: [...b.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.target, a.rel]), btn: [...b.querySelectorAll('button')].map(x => x.textContent),
              kz: b.querySelectorAll('.pn-kz').length, kzlinks: [...b.querySelectorAll('.pn-kzbox a')].map(a => [a.getAttribute('href'), a.target, a.rel]),
              warn: document.getElementById('pnWarn').textContent, vis: document.getElementById('pnBox').getBoundingClientRect().height > 0 }; })()""")
        r = pn('Slotbeugel motorkap')
        check('15 nummers: past volgens catalogus met nummer, tabel, variant, verpakking en onderhoud', 'Past volgens catalogus' in r['text'] and '656 01 TEST1' in r['text'] and r['rows'] == 2 and 'TM-123.456' in r['text'] and 'Alleen benzine' in r['text'] and 'Per stuk' in r['text'] and '60000 km' in r['text'], r['text'][:200])
        check('15 nummers: bronlinks met target _blank en rel noopener noreferrer, geen javascript-link', r['links'] == [['https://example.org/bron', '_blank', 'noopener noreferrer']], json.dumps(r['links']))
        check('15 nummers: vaste waarschuwing zichtbaar', r['warn'].startswith('Controleer het nummer altijd op het chassisnummer (VIN) bij de dealer of webwinkel') and r['vis'], r['warn'][:60])
        r = pn('Veiligheidshaak')
        check('15 nummers: deel van Testslot met klikbare naam en regel', 'Deel van' in r['text'] and r['btn'] == ['Testslot'] and 'zit in het slot' in r['text'] and '656 01 TEST1' in r['text'], r['text'][:160])
        pg.evaluate("[...document.querySelectorAll('#pnBody button')].find(b => b.textContent === 'Testslot').click()"); settle(pg, 120)
        check('15 nummers: een klik op de naam kiest de eenheid', pg.evaluate('__model.state().selected') == 'Slotbeugel motorkap', pg.evaluate('__model.state().selected'))
        r = pn('Motorkapsteun')
        check('15 nummers: variant, kies op VIN', 'Variant: kies op VIN' in r['text'] and '654 TEST2' in r['text'], r['text'][:120])
        r = pn('Steunopvanger')
        check('15 nummers: gekozen uitvoering met blok, markering van de gekozen nummers en variantkop', 'Gekozen voor deze auto' in r['text'] and 'Uitvoering vanaf 2011' in r['text'] and 'Volgens de RDW' in r['text']
              and 'Variant: kies op VIN' not in r['text'] and 'Varianten in de catalogus' in r['text'] and r['kz'] == 2 and r['kzlinks'] == [['https://example.org/kz', '_blank', 'noopener noreferrer']], json.dumps([r['kz'], r['kzlinks']]))
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
        pg.evaluate("PN_DATA.map['Carrosserie/Bestaat/niet'] = ['tA', 'zelf']; PN_DATA.map['Carrosserie/Motorkap/Motorkapisolatie'] = ['onbekend', 'zelf']; __model.pnRebuild()")
        bad = pg.evaluate('__model.pnCheck()')
        check('15 nummers: pnCheck meldt een onbekend pad en een onbekende eenheid', len(bad) == 2, json.dumps(bad))
        pg.evaluate("""(() => { for (const k of Object.keys(PN_DATA.map)) delete PN_DATA.map[k]; for (const k of Object.keys(PN_DATA.units)) delete PN_DATA.units[k]; __model.pnRebuild(); })()""")
        r = pn('Slotbeugel motorkap')
        check('15 nummers: zonder gegevens niet onderzocht, pnCheck leeg', 'Niet onderzocht' in r['text'] and not pg.evaluate('__model.pnCheck()'), r['text'][:100])
        pg.evaluate("Object.assign(PN_DATA.map, window.__pnBak.map); Object.assign(PN_DATA.units, window.__pnBak.units); __model.pnRebuild(); __model.select(__model.ROOT)")
    pg.close()


# ---------- 18. golf 5c-1 (app-agent): robuustheid, bediening, toegankelijkheid ----------
# Elke controle noemt in zijn commentaar de fout uit golf 1 tot 4 die hij gevangen zou hebben, of het risico dat hij dekt.
def fault_page(s, w=1280, h=800, init=None, block=None):
    """Eigen context buiten de logregistratie van de harness: deze paden geven met opzet fouten in de console."""
    ctx = s.browser.new_context(viewport={'width': w, 'height': h})
    ctx.add_init_script('window.__MODEL_CACHECHECK = true;')
    logs = []
    pg = ctx.new_page()
    pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    if init:
        pg.add_init_script(init)
    if block:
        pg.route(block, lambda rt: rt.abort())
    pg.goto(f'http://127.0.0.1:{s.port}/index.html', wait_until='load', timeout=int(os.environ.get('MODEL_TIMEOUT_MS', 120000)))
    return ctx, pg, logs


def check18(s):
    print('--- 18 golf 5c-1')
    timeout = int(os.environ.get('MODEL_TIMEOUT_MS', 120000))
    # R1b. Zonder three.js (CDN geblokkeerd) stond vóór golf 1 "Model opbouwen…" eeuwig; de melding moet er staan, met de versie
    ctx, pg, logs = fault_page(s, block='**/three/build/three.min.js')
    pg.wait_for_timeout(600)
    txt = pg.evaluate("document.getElementById('loading').textContent")
    check('18 R1b zonder three.js: laadmelding noemt de 3D-bibliotheek en de versie', '3D-bibliotheek' in txt and 'Versie' in txt, txt[:160])
    ctx.close()
    # R1b. Zonder WebGL (audit §6: de renderer stond niet in try/catch): melding van core.js met de versie, lastError gezet
    ctx, pg, logs = fault_page(s, init="HTMLCanvasElement.prototype.getContext = function () { return null; };")
    pg.wait_for_timeout(800)
    txt = pg.evaluate("document.getElementById('loading').textContent")
    le = pg.evaluate("window.__modelLastError || null")
    check('18 R1b zonder WebGL: melding over WebGL met de versie en lastError.loading', 'WebGL' in txt and 'Versie' in txt and bool(le) and le['loading'], txt[:160])
    ctx.close()
    # R1b. Een onverwachte fout vóór de eerste weergave (niets vangt hem): de generieke melding met de fout en de versie, geen "…"
    ctx, pg, logs = fault_page(s, init="Object.defineProperty(performance, 'now', { value: () => { throw new Error('testfout vooraf'); }, configurable: true });")
    pg.wait_for_timeout(800)
    txt = pg.evaluate("document.getElementById('loading').textContent")
    check('18 R1b onverwachte fout vooraf: generieke melding met de fouttekst en de versie', 'testfout vooraf' in txt and 'Versie' in txt and 'opnieuw' in txt and '…' not in txt, txt[:200])
    ctx.close()
    # R1b na ready: alleen de console (de laadmelding blijft weg); R2: contextverlies geeft een melding, herstel maakt de
    # omgevingskaart opnieuw (audit §6: de PMREM-kaart kwam na herstel niet terug) en haalt de melding weg
    ctx, pg, logs = fault_page(s)
    pg.wait_for_function('window.__model && window.__model.ready !== false', timeout=timeout)
    pg.evaluate("window.dispatchEvent(new ErrorEvent('error', { message: 'testfout achteraf' }))")
    le = pg.evaluate("__model.lastError")
    gone = pg.evaluate("document.getElementById('loading').classList.contains('gone')")
    check('18 R1b fout na ready: lastError zonder laadmelding, alleen in de console', bool(le) and le['message'] == 'testfout achteraf' and not le['loading'] and gone and any('testfout achteraf' in l and 'versie' in l for l in logs), json.dumps(le) + ' ' + json.dumps(logs[-1:]))
    r = pg.evaluate("""(() => { const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_lose_context'); if (!ext) return null;
      window.__env0 = scene.environment.uuid; ext.loseContext(); window.__ext = ext; return true; })()""")
    if check('18 R2 WEBGL_lose_context beschikbaar', r, 'de testbrowser kent de extensie niet'):
        pg.wait_for_timeout(400)
        lost = pg.evaluate("[__model.contextLost, document.getElementById('notice').hidden, document.getElementById('notice').textContent]")
        check('18 R2 contextverlies: contextLost en een zichtbare melding', lost[0] and not lost[1] and 'onderbroken' in lost[2], json.dumps(lost))
        pg.evaluate("window.__ext.restoreContext()")
        pg.wait_for_timeout(1500)
        rest = pg.evaluate("[__model.contextLost, document.getElementById('notice').hidden, scene.environment.uuid !== window.__env0, __model.drawCalls()]")
        check('18 R2 herstel: melding weg, nieuwe omgevingskaart, er wordt weer getekend', not rest[0] and rest[1] and rest[2] and rest[3] > 0, json.dumps(rest))
    ctx.close()

    # R5. Elke scripttag van three.js heeft integrity (sha384) en crossorigin; de pagina laadt ermee (anders was er geen THREE).
    # Dekt: een CDN die andere bytes levert dan het npm-pakket (premortem 5c-1) komt niet stil in de pagina.
    pd = s.page(1280, 800)
    pd.evaluate(JS_HELPERS)
    sc = pd.evaluate("[...document.querySelectorAll('script[src]')].map(e => [e.getAttribute('integrity') || '', e.getAttribute('crossorigin') || ''])")
    check('18 R5 integrity sha384 en crossorigin anonymous op alle scripttags, three r147 geladen', len(sc) == 5 and all(i.startswith('sha384-') and c == 'anonymous' for i, c in sc) and pd.evaluate('THREE.REVISION') == '147', json.dumps(sc)[:200])

    # R4. Rondleiding: pauze (de timer van 5 s stapt dan niet door), volgende en vorige met een echte klik in de balk (die mag
    # de rondleiding niet stoppen), verborgen tabblad (audit §6: de rondleiding liep via setTimeout door in een verborgen tab).
    # lastFit volgt de rondleiding (R3). Eerst pauzeren: de harness is traag en de rondleiding zou anders vanzelf doorlopen.
    pd.evaluate("__model.preset('tour')"); settle(pd, 120)
    t0 = pd.evaluate("(() => { document.getElementById('tourPause').click(); return __model.tourState(); })()")
    pd.click('#tourNext'); settle(pd, 120)
    t1 = pd.evaluate('__model.tourState()'); lf = pd.evaluate('__model.lastFit()'); st = pd.evaluate('__model.state()')
    pd.evaluate("document.getElementById('tourPrev').click()"); settle(pd, 120)
    t2 = pd.evaluate('__model.tourState()')
    check('18 R4 rondleiding: pauze, dan volgende en vorige stap; lastFit op de preset van de stap', t0 and t0['step'] == 0 and t0['paused'] and t1['step'] == 1 and t1['paused'] and t1['preset'] == 'main' and st['preset'] == 'main' and lf == {'preset': 'main'} and t2['step'] == 0, json.dumps([t0, t1, lf, t2]))
    pd.wait_for_timeout(5600)
    tp = pd.evaluate('__model.tourState()'); pressed = pd.evaluate("document.getElementById('tourPause').getAttribute('aria-pressed')")
    check('18 R4 pauze: na 5,6 s nog dezelfde stap, knop aria-pressed', tp and tp['paused'] and tp['step'] == 0 and pressed == 'true', json.dumps(tp))
    tv = pd.evaluate("""(() => { const L = __model; document.getElementById('tourPause').click(); const a = L.tourState();
      Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); const b = L.tourState();
      delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); const c = L.tourState(); return [a, b, c]; })()""")
    check('18 R4 hervat; verborgen tabblad pauzeert de rondleiding, zichtbaar hervat', not tv[0]['paused'] and tv[1]['paused'] and tv[1]['auto'] and not tv[2]['paused'] and tv[2]['step'] == 0, json.dumps(tv))
    pd.evaluate('__model.stopTour()'); settle(pd, 60)

    # U4. Isoleren: wat verdwijnt fadet 0,3 s uit (ux-audit U09, golf 3: delen verdwenen meteen) en de badge staat in beeld;
    # Alles tonen in de badge heft de isolatie op.
    # De testbrowser tekent geen frames uit zichzelf (requestAnimationFrame staat stil zonder nieuwe weergave), daarom
    # drijft de controle de animatiestap zelf aan met uiTick: na 0,2 s nog aan het vervagen, na 0,4 s weg.
    pd.evaluate("__model.preset('assembled'); __model.finishAll()")
    r = pd.evaluate("""(() => { const L = __model, m = L.byName('Carrosserie').meshes.find(x => x.userData.node.ev); window.__fm = m;
      L.isolate([L.byName('Motor F4Rt')]);
      const a = { fading: L.fading, vis: m.visible, mat: m.material.name, ev: m.userData.node.ev, op: uiFadeMat.opacity, badge: !document.getElementById('isoBadge').hidden, name: document.getElementById('isoName').textContent };
      uiTick(0.2); const b = { fading: L.fading, vis: m.visible, op: +uiFadeMat.opacity.toFixed(3) };
      uiTick(0.2); const c = { fading: L.fading, vis: m.visible, mat: m.material.name }; return [a, b, c]; })()""")
    a, b, c = r
    check('18 U4 isoleren: carrosserie fadet (zichtbaar, spookmateriaal, niet aanwijsbaar), na 0,2 s halfweg, na 0,4 s weg; badge met naam',
          a['fading'] and a['vis'] and a['mat'] == 'uiFade' and not a['ev'] and a['op'] == 0.5 and a['badge'] and a['name'] == 'Motor F4Rt'
          and b['fading'] and b['vis'] and 0.1 < b['op'] < 0.25 and not c['fading'] and not c['vis'] and c['mat'] != 'uiFade', json.dumps(r))
    pd.evaluate("document.getElementById('isoShowAll').click()"); settle(pd, 60)
    r3 = pd.evaluate("[__model.isolated(), document.getElementById('isoBadge').hidden, window.__fm.visible]")
    check('18 U4 Alles tonen in de badge heft de isolatie op', r3[0] == [] and r3[1] and r3[2], json.dumps(r3))

    # U5. Thema: licht, donker, systeem; de keuze overleeft een herlaadbeurt (zonder knop volgde de pagina altijd het systeem, U24)
    pd.emulate_media(color_scheme='dark'); pd.wait_for_timeout(200)
    pd.click('#tabbtn-view')  # de themaknop staat in het tabblad Weergave
    bg = lambda: pd.evaluate('getComputedStyle(document.body).backgroundColor').replace(' ', '')
    theme = lambda t: pd.evaluate(f"document.querySelector('#themeSeg [data-theme=\"{t}\"]').click()")
    sys_dark = bg()
    theme('light'); pd.wait_for_timeout(150)
    light = [bg(), pd.evaluate('__model.theme()'), pd.evaluate("localStorage.getItem('laguna3-theme')"), pd.evaluate("[...document.querySelectorAll('#themeSeg [role=radio]')].map(b => b.getAttribute('aria-checked'))")]
    theme('dark'); pd.wait_for_timeout(150)
    dark = [bg(), pd.evaluate('__model.theme()')]
    pd.evaluate("__model.preset('engine'); __model.finishAll()"); shot(pd, 'itest_theme_dark_motor')
    theme('system'); pd.wait_for_timeout(150)
    system = [bg(), pd.evaluate('__model.theme()')]
    check('18 U5 thema licht, donker en systeem (systeem volgt prefers-color-scheme), keuze in localStorage, radiogroep volgt',
          sys_dark == 'rgb(26,33,41)' and light[0] == 'rgb(229,233,237)' and light[1] == {'choice': 'light', 'dark': False} and light[2] == 'light' and light[3] == ['true', 'false', 'false']
          and dark[0] == 'rgb(26,33,41)' and dark[1]['choice'] == 'dark' and dark[1]['dark'] and system[0] == 'rgb(26,33,41)' and system[1]['choice'] == 'system', json.dumps([sys_dark, light, dark, system]))
    theme('light'); pd.wait_for_timeout(100)
    pd.reload(wait_until='load'); pd.wait_for_function('window.__model && window.__model.ready !== false', timeout=timeout); pd.wait_for_timeout(300)
    pd.evaluate(JS_HELPERS)
    after = [bg(), pd.evaluate('__model.theme()'), pd.evaluate("document.documentElement.getAttribute('data-theme')")]
    check('18 U5 thema onthouden na herladen (licht, terwijl het systeem donker is)', after[0] == 'rgb(229,233,237)' and after[1]['choice'] == 'light' and after[2] == 'light', json.dumps(after))
    pd.click('#tabbtn-view'); theme('system'); pd.emulate_media(color_scheme='light'); pd.wait_for_timeout(150)

    # U6. Toegankelijkheid. Hulpvenster: focusval en inert op de rest (WCAG 2.4.3); Esc terug naar de knop.
    pd.evaluate("document.activeElement && document.activeElement.blur()")
    pd.keyboard.press('?'); pd.wait_for_timeout(100)
    a0 = pd.evaluate("[document.activeElement.id, 'inert' in HTMLElement.prototype ? document.getElementById('stage').inert : 'onbekend']")
    pd.keyboard.press('Tab'); pd.keyboard.press('Tab'); pd.keyboard.press('Shift+Tab')
    a1 = pd.evaluate("document.getElementById('helpDlg').contains(document.activeElement)")
    pd.keyboard.press('Escape'); pd.wait_for_timeout(100)
    a2 = pd.evaluate("[document.activeElement.id, document.getElementById('helpDlg').hidden, 'inert' in HTMLElement.prototype ? document.getElementById('stage').inert : false]")
    check('18 U6 hulpvenster: focus op Sluiten, Tab blijft in het venster, de rest inert, Esc terug naar de knop', a0[0] == 'helpClose' and a0[1] in (True, 'onbekend') and a1 and a2 == ['help', True, False], json.dumps([a0, a1, a2]))
    # Menu: role="menu" bevat alleen menuitems; de kop met de sluitknop staat erbuiten (audit §5: ongeldige ARIA)
    pd.click('[data-cat="Motor"]'); pd.wait_for_timeout(100)
    m = pd.evaluate("""(() => { const menu = document.querySelector('#menu [role="menu"]'); if (!menu) return null;
      return { items: [...menu.children].every(c => c.getAttribute('role') === 'menuitem'), n: menu.children.length, headIn: !!menu.querySelector('.mhead'), outer: document.getElementById('menu').getAttribute('role') }; })()""")
    pd.keyboard.press('Escape'); pd.wait_for_timeout(60)
    check('18 U6 presetmenu: role=menu met alleen menuitems, kop en sluitknop erbuiten', bool(m) and m['items'] and m['n'] >= 5 and not m['headIn'] and not m['outer'], json.dumps(m))
    # Werkbalk: één tabstop, pijlen lopen door de categorieën (audit §5: geen gedeelde tabstop, links/rechts deed niets)
    pd.evaluate("document.querySelector('#presets .cat').focus()")
    pd.keyboard.press('ArrowRight'); pd.wait_for_timeout(50)
    tb = pd.evaluate("(() => { const cats = [...document.querySelectorAll('#presets .cat')]; return [cats.indexOf(document.activeElement), cats.filter(c => c.tabIndex === 0).length]; })()")
    pd.keyboard.press('End'); pd.wait_for_timeout(50)
    tb2 = pd.evaluate("(() => { const cats = [...document.querySelectorAll('#presets .cat')]; return cats.indexOf(document.activeElement) === cats.length - 1; })()")
    check('18 U6 werkbalk presets: pijl rechts naar de tweede categorie, End naar de laatste, één tabstop', tb == [1, 1] and tb2, json.dumps([tb, tb2]))
    # Focusrand op het canvas bij toetsenbordfocus (WCAG 2.4.7; #stage:focus-visible stond op outline:none); na een klik geen rand
    # (na een klik beslist de browser zelf over :focus-visible: na eerder toetsenbordgebruik toont Chromium de rand ook dan; dat is informatie)
    pd.mouse.click(4, 400); pd.wait_for_timeout(100)
    fr0 = pd.evaluate("(() => { const c = document.getElementById('stage'), cs = getComputedStyle(c); return [document.activeElement === c, cs.outlineStyle]; })()")
    pd.keyboard.press('Tab'); pd.keyboard.press('Shift+Tab'); pd.wait_for_timeout(50)
    fr = pd.evaluate("(() => { const c = document.getElementById('stage'), cs = getComputedStyle(c); return [document.activeElement === c, cs.outlineStyle, cs.outlineWidth]; })()")
    check('18 U6 canvas met toetsenbordfocus heeft een zichtbare focusrand', fr0[0] and fr[0] and fr[1] == 'solid' and fr[2] not in ('0px', ''), json.dumps([fr0, fr]))
    # Schakelaar uit: contrast minstens 3:1 tegen het paneel, in beide thema's (audit §5: ongeveer 1,3:1)
    CONTRAST = """(() => { const lum = s => { const m = s.match(/[\\d.]+/g).map(Number); const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
      const a = lum(getComputedStyle(document.getElementById('tXray')).backgroundColor), b = lum(getComputedStyle(document.getElementById('sheet')).backgroundColor); return +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2); })()"""
    c_light = pd.evaluate(CONTRAST)
    theme('dark'); pd.wait_for_timeout(150)
    c_dark = pd.evaluate(CONTRAST)
    theme('system'); pd.wait_for_timeout(100)
    check('18 U6 schakelaar in de stand uit: contrast >= 3:1 tegen het paneel, licht en donker', c_light >= 3 and c_dark >= 3, f'licht {c_light}:1, donker {c_dark}:1')
    # Tabs: één tabstop (audit §5: alle drie tabbaar tot showTab voor het eerst draaide)
    tabs = pd.evaluate("[...document.querySelectorAll('[role=tab]')].map(t => t.tabIndex)")
    check('18 U6 tabs met roving tabindex: precies één tabstop', tabs.count(0) == 1 and len(tabs) == 3, json.dumps(tabs))
    # Live region #selMeta: geen DOM-wijziging als de selectie niet verandert (audit §5: elke opbouw van het paneel werd voorgelezen)
    mu = pd.evaluate("""(() => { const L = __model; L.preset('assembled'); L.finishAll(); L.select(L.byName('Motorkap'));
      const ob = new MutationObserver(() => {}); ob.observe(document.getElementById('selMeta'), { childList: true, subtree: true, characterData: true }); ob.takeRecords();
      L.select(L.byName('Motorkap')); L.select(L.byName('Motorkap')); const same = ob.takeRecords().length;
      L.select(L.byName('Achterklep')); const other = ob.takeRecords().length; ob.disconnect(); return [same, other]; })()""")
    check('18 U6 #selMeta verandert alleen bij een andere selectie', mu[0] == 0 and mu[1] > 0, json.dumps(mu))

    # U7. Hulpvenster uit PRESETS en appCats (golf 4 voegde de categorie Openen toe; "Zeven categorieën" en de sneltoetslijst
    # stonden met de hand in de HTML). De uitleg bij de wortel in Openen is een eigen tekst, geen knip uit systems.js.
    pd.click('#help'); pd.wait_for_timeout(100)
    hp = pd.evaluate("[document.getElementById('helpCats').textContent, document.getElementById('helpKeys').textContent, document.getElementById('helpKeysT').textContent]")
    pd.keyboard.press('Escape')
    plist = pd.evaluate('__model.presetList()')
    cats = sorted(set(p['cat'] for p in plist)); keyed = sorted([p for p in plist if p['key']], key=lambda p: p['key'])
    check('18 U7 hulpvenster noemt alle categorieën en alle sneltoetspresets in volgorde van de toets', hp[0].startswith(f'{len(cats)} categorie') and all(c in hp[0] for c in cats) and hp[1] == ', '.join(p['label'] for p in keyed) + '.' and hp[2].replace(' ', '') == f'{keyed[0]["key"]}tot{keyed[-1]["key"]}', json.dumps(hp)[:220])
    pd.evaluate("__model.setOpenMode(true); __model.select(__model.ROOT)"); settle(pd, 60)
    desc = pd.evaluate("document.getElementById('selDesc').textContent")
    pd.evaluate("__model.setOpenMode(false)"); settle(pd, 60)
    check('18 U7 wortel in Openen: eigen uitleg over openen, niets over uitklappen', 'Openen:' in desc and 'uit te klappen' not in desc and 'Laguna III' in desc, desc[:120])

    # U10. Zoeken met synoniemen en zonder gevoeligheid voor hoofdletters en diakrieten (ux-audit U17; de tolerantie stond alleen in een test)
    terms = pd.evaluate("[__model.searchTerms('alternator'), __model.searchTerms('remblok binnen'), __model.norm('RÖNTGEN Ééñ')]")
    pd.click('#tabbtn-tree')
    def hits(q):
        pd.fill('#treeSearch', q); pd.wait_for_timeout(150)
        return pd.evaluate("[...document.querySelectorAll('#tree .trow .tn')].map(e => e.textContent)"), pd.evaluate("document.getElementById('treeInfo').textContent")
    h1 = hits('alternator'); h2 = hits('ACCU'); h3 = hits('batterij')
    dia = pd.evaluate(r"(() => { const n = __model.ALL.find(n => n.name !== n.name.normalize('NFD').replace(/[̀-ͯ]/g, '')); return n ? n.name : null; })()")
    h4 = hits(pd.evaluate("__model.norm(" + json.dumps(dia) + ").toUpperCase()")) if dia else ([dia], '')
    pd.fill('#treeSearch', ''); pd.click('#tabbtn-info')
    check('18 U10 synoniemen: alternator vindt de Dynamo, batterij de Accu; hoofdletters en diakrieten doen er niet toe',
          'dynamo' in terms[0] and 'remvoering binnen' in terms[1] and terms[2] == 'rontgen een' and any('Dynamo' in h for h in h1[0]) and 'dynamo' in h1[1]
          and any(h.startswith('Accu') for h in h2[0]) and any(h.startswith('Accu') for h in h3[0]) and (not dia or dia in h4[0]), json.dumps([terms, h1[0][:3], h1[1], h2[0][:2], h3[0][:2], dia, h4[0][:2]])[:300])

    # U9. Beeld opslaan: een PNG met de naam van de selectie in de bestandsnaam; de printstijl laat alleen de kaart over
    pd.evaluate("__model.preset('assembled'); __model.finishAll(); __model.select(__model.byName('Motorkap'))")
    pd.click('#tabbtn-view')
    with pd.expect_download(timeout=60000) as dl:
        pd.evaluate("document.getElementById('btnShot').click()")
    d = dl.value
    path = d.path()
    head = open(path, 'rb').read(8) if path else b''
    size = os.path.getsize(path) if path else 0
    check('18 U9 Beeld opslaan geeft laguna3-motorkap.png (PNG, > 10 kB)', d.suggested_filename == 'laguna3-motorkap.png' and head == b'\x89PNG\r\n\x1a\n' and size > 10000, f'{d.suggested_filename}, {size} bytes')
    pd.emulate_media(media='print'); pd.wait_for_timeout(100)
    pr = pd.evaluate("['stage', 'dock', 'topbar', 'tab-view'].map(id => getComputedStyle(document.getElementById(id)).display).concat([getComputedStyle(document.getElementById('sheet')).display, getComputedStyle(document.getElementById('tab-info')).display])")
    pd.emulate_media(media='screen')
    check('18 U9 printstijl: canvas, dock, titel en tabblad Weergave weg, de onderdeelkaart blijft', pr[:4] == ['none'] * 4 and pr[4] != 'none' and pr[5] == 'block', json.dumps(pr))
    pd.close()

    # Telefoon (390 x 844, touch)
    pp = s.page(390, 844, scale=2, touch=True)
    pp.evaluate(JS_HELPERS)
    cdp = pp.context.new_cdp_session(pp)
    # U8. Suggestie na de hint tot de eerste tik (ux-audit U16: de uitleg verdween zonder vervolg); meteen na het laden,
    # voordat een handeling de hint sluit (de hint zelf staat op stand 1, of al op 2 als het laden langer dan 9 s duurde)
    hs = pp.evaluate("(() => { const L = __model; const s0 = L.hintStage; L.hintNext(); const t = document.getElementById('hint').textContent, s1 = L.hintStage; return [s0, s1, t, document.getElementById('hint').hidden]; })()")
    pp.evaluate("__model.preset('assembled'); __model.finishAll()")
    hs2 = pp.evaluate("[__model.hintStage, document.getElementById('hint').classList.contains('gone') || document.getElementById('hint').hidden]")
    check('18 U8 suggestie "Probeer: tik op de motorkap" na de hint, weg na de eerste handeling', hs[0] in (1, 2) and hs[1] == 2 and 'Probeer' in hs[2] and 'motorkap' in hs[2] and not hs[3] and hs2 == [0, True], json.dumps([hs, hs2]))
    # R3. Na een duik draaien: het kader volgt het laatste echte doel (audit §6: de telefoon sprong terug naar het oude preset-doel)
    pp.evaluate("__model.preset('engineAll'); __model.finishAll()")
    pp.evaluate("__model.dive(__model.byName('Cilinderkop').kids.find(k => !k.asm))"); settle(pp, 250)
    sel = pp.evaluate('__model.state().selected'); lf = pp.evaluate('__model.lastFit()')
    pp.set_viewport_size({'width': 844, 'height': 390}); pp.wait_for_timeout(500); settle(pp, 300)
    f = pp.evaluate(f'__model.frameOf({json.dumps(sel)})')
    pp.set_viewport_size({'width': 390, 'height': 844}); pp.wait_for_timeout(500); settle(pp, 300)
    f2 = pp.evaluate(f'__model.frameOf({json.dumps(sel)})')
    check('18 R3 telefoon draaien na een duik kadreert op het gedoken onderdeel (lastFit), liggend en weer staand', lf and lf.get('nodes') == [sel] and f['inside'] and f['cover'] >= 0.02 and f2['inside'] and f2['cover'] >= 0.02, json.dumps([lf, f['cover'], f2['cover']]))
    # U2. "+n meer" als er meer onderdelen zijn dan labels (ux-audit U11: stil afgekapt op 10 of 24)
    pp.evaluate("__model.preset('engine'); __model.finishAll()"); pp.wait_for_timeout(300); settle(pp, 200)
    lm = pp.evaluate("""(() => { const L = __model, g = L.byName('Motor F4Rt'), el = document.querySelector('#labels .lmore');
      const eligible = g.kids.filter(k => k.ev).length, shown = L.labelRects().length, more = L.labelsMore();
      const r = el && !el.hidden ? el.getBoundingClientRect() : null, v = L.freeView();
      return { eligible, shown, more, txt: el ? el.textContent : null, hidden: !el || el.hidden, inView: !!r && r.left >= v.x - 1 && r.right <= v.x + v.w + 1 && r.top >= v.y - 1 && r.bottom <= v.y + v.h + 1 }; })()""")
    check('18 U2 telefoon: "+n meer" telt precies wat geen label kreeg en staat in het vrije beeld', lm['eligible'] > lm['shown'] and lm['more'] == lm['eligible'] - lm['shown'] and lm['txt'] == f"+{lm['more']} meer" and not lm['hidden'] and lm['inView'], json.dumps(lm))
    pp.tap('#labels .lmore'); pp.wait_for_timeout(300)
    op = pp.evaluate("[document.getElementById('tab-tree').hidden, document.getElementById('sheet').dataset.state]")
    check('18 U2 tik op "+n meer" opent de onderdelenlijst', op == [False, 'open'], json.dumps(op))
    # U6. Esc sluit het mobiele paneel (audit §5: Esc deed dat niet)
    pp.keyboard.press('Escape'); pp.wait_for_timeout(350)
    check('18 U6 telefoon: Esc sluit het open paneel', pp.evaluate("document.getElementById('sheet').dataset.state") == 'peek')
    # U2 negatief: zonder overschot geen "+n meer" (desktop had 8 hoofdgroepen en 24 labels; hier: Hoofdgroepen op de telefoon, 8 < 10)
    pp.evaluate("__model.preset('main'); __model.finishAll()"); pp.wait_for_timeout(200); settle(pp, 100)
    lm2 = pp.evaluate("[__model.labelsMore(), document.querySelector('#labels .lmore').hidden]")
    check('18 U2 Hoofdgroepen op de telefoon: alle acht een label, geen "+n meer"', lm2 == [0, True], json.dumps(lm2))
    # U8. Toast met de volledige naam van een afgekapt label (ux-audit U14: de naam stond alleen in title); trilling bij lang drukken
    pp.evaluate("__model.preset('everything'); __model.finishAll()"); pp.wait_for_timeout(300); settle(pp, 200)
    cut = pp.evaluate("""(() => { const els = [...document.querySelectorAll('#labels .lbl')].filter(e => !e.hidden && e.lastChild.scrollWidth > e.lastChild.clientWidth + 1);
      if (!els.length) return null; const e = els[0], r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, e.title]; })()""")
    if cut:
        pp.tap('#labels .lbl[title="' + cut[2].replace('"', '\\"') + '"]'); pp.wait_for_timeout(150)
        tt = pp.evaluate("[document.getElementById('toast').hidden, document.getElementById('toast').textContent]")
        check('18 U8 tik op een afgekapt label toont de volledige naam als toast', not tt[0] and tt[1] == cut[2], json.dumps([cut[2], tt]))
    else:
        print('info 18 U8 geen afgekapt label in Alles uit elkaar op 390 px; toast via __model.toast')
        pp.evaluate("__model.toast('Proef')"); pp.wait_for_timeout(50)
        check('18 U8 toast zichtbaar met tekst', pp.evaluate("[document.getElementById('toast').hidden, document.getElementById('toast').textContent]") == [False, 'Proef'])
    pp.evaluate("navigator.vibrate = ms => { window.__vib = ms; return true; }; __model.preset('engineAll'); __model.finishAll()")
    pp.wait_for_timeout(450); quiet(pp)
    c = T(pp, 'collapsePoint()')
    if check('18 U8 punt voor lang drukken', c, str(c)):
        long_press(pp, cdp, c[0], c[1]); pp.wait_for_timeout(100); settle(pp)
        vib = pp.evaluate('window.__vib')
        check('18 U8 lang drukken trilt 10 ms als de ring vol is (alleen waar navigator.vibrate bestaat)', vib == 10, str(vib))
    pp.close()

def run_golf5c(s):
    """Controles 19 tot 22 (golf 5c-1), alleen desktop 1280 x 800 met echte toetsaanslagen en formaatwissels."""
    tmo = int(os.environ.get('MODEL_TIMEOUT_MS', 120000))

    # 19. toetsenbord volledig. Zou de fout uit audit U29 gevangen hebben (golf 1: het model was niet met het toetsenbord te
    # bedienen en Escape koos alleen de wortel) en dekt de latere toetsen zonder controle: Enter op een opener in Openen (golf 4,
    # commit 6e73913), de toets / (U17), het hulpvenster en de sneltoets O, die bij het typen van "motorkap" niet mag afgaan.
    pg = s.page(1280, 800)
    pg.evaluate(JS_HELPERS)
    blur = lambda: pg.evaluate("document.activeElement && document.activeElement.blur()")
    state = lambda: pg.evaluate('__model.state()')
    active = lambda: pg.evaluate("(() => { const a = document.activeElement; return a ? (a.id || a.dataset.mode || a.dataset.omode || a.dataset.preset || a.dataset.cat || a.tagName) : null; })()")
    preset(pg, 'assembled'); blur()
    # Enter op een dichte groep klapt haar uit en kiest haar; op een open groep klapt Enter de dichte groep erboven uit (Groter
    # geheel, de selectie klimt mee); Shift+Enter klapt de selectie met haar deelboom in
    pg.evaluate("__model.select(__model.byName('Motorkap'))"); settle(pg, 60)
    tg = lambda: pg.evaluate("[__model.byName('Motorkap').target, __model.byName('Carrosserie').target, __model.state().selected]")
    pg.keyboard.press('Enter'); settle(pg); t1 = tg()
    pg.keyboard.press('Enter'); settle(pg); t2 = tg()
    pg.keyboard.press('Shift+Enter'); settle(pg); t3 = tg()
    check('19 Enter klapt de geselecteerde dichte groep uit, nog eens Enter de groep erboven (selectie klimt mee), Shift+Enter klapt die in', t1 == [1, 0, 'Motorkap'] and t2 == [1, 1, 'Carrosserie'] and t3 == [0, 0, 'Carrosserie'], f'{t1} {t2} {t3}')
    # een onderdeel in een dichte groep: Enter klapt die groep uit (zoals een klik); staat alles open, dan tilt Enter het onderdeel uit
    preset(pg, 'assembled'); pg.evaluate("__model.select(__model.byName('Slotbeugel motorkap'))"); settle(pg, 60); blur()
    pg.keyboard.press('Enter'); settle(pg)
    r1 = pg.evaluate("[__model.byName('Motorkap').target, __model.state().selected, __model.liftedNode() ? __model.liftedNode().name : null]")
    preset(pg, 'everything'); pg.evaluate("__model.select(__model.byName('Slotbeugel motorkap'))"); settle(pg, 60); blur()
    pg.keyboard.press('Enter'); settle(pg)
    r2 = pg.evaluate("[__model.liftedNode() ? __model.liftedNode().name : null, __model.state().selected]")
    check('19 Enter op een onderdeel: in een dichte groep klapt die groep uit, staat alles open dan wordt het uitgetild', r1 == [1, 'Motorkap', None] and r2 == ['Slotbeugel motorkap', 'Slotbeugel motorkap'], f'{r1} {r2}')
    pg.keyboard.press('Shift+Enter'); settle(pg)
    r = pg.evaluate("[__model.byName('Motorkap').target, __model.liftedNode() ? __model.liftedNode().name : null, __model.state().selected]")
    check('19 Shift+Enter op een uitgetild onderdeel klapt zijn groep in en laat het zakken', r[0] == 0 and r[1] is None, json.dumps(r))
    # Escape: terug naar de wortel, uitgetild onderdeel zakt
    pg.evaluate("__model.tapNode(__model.byName('Motorkap')); __model.finishAll(); __model.tapNode(__model.byName('Slotbeugel motorkap'))"); settle(pg)
    lifted = pg.evaluate("__model.liftedNode() ? __model.liftedNode().name : null")
    pg.keyboard.press('Escape'); settle(pg)
    st = state()
    check('19 Escape kiest de wortel en laat het uitgetilde onderdeel zakken', lifted == 'Slotbeugel motorkap' and st['selected'] == 'Renault Laguna III' and st['lifted'] is None, f"{lifted} -> {st['selected']}, uitgetild {st['lifted']}")
    # ? opent het hulpvenster met de focus op Sluiten; toetsen erachter doen niets; Escape sluit en geeft de focus terug
    pg.keyboard.press('?'); pg.wait_for_timeout(120)
    h1 = pg.evaluate("[!document.getElementById('helpDlg').hidden]")[0]; a1 = active()
    p0 = state()['preset']
    pg.keyboard.press('2'); pg.wait_for_timeout(120)
    p1 = state()['preset']
    pg.keyboard.press('Escape'); pg.wait_for_timeout(120)
    h2 = pg.evaluate("document.getElementById('helpDlg').hidden"); a2 = active()
    check('19 ? opent de uitleg (focus op Sluiten), sneltoetsen blijven buiten, Escape sluit en zet de focus op de ?-knop', h1 and a1 == 'helpClose' and p1 == p0 and h2 and a2 == 'help', f'open {h1}, focus {a1}, preset {p0} -> {p1}, dicht {h2}, focus {a2}')
    blur()
    # / zet de cursor in het zoekveld; typen gaat naar het veld (de o van motorkap wisselt de modus niet); Escape verlaat het veld
    pg.keyboard.press('/'); pg.wait_for_timeout(150)
    a1 = active(); tree = pg.evaluate("!document.getElementById('tab-tree').hidden")
    pg.keyboard.type('motorkap'); pg.wait_for_timeout(250)
    info = pg.evaluate("document.getElementById('treeInfo').textContent"); om = state()['openMode']
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    a2 = active()  # Escape in een zoekveld wist in Chromium ook de tekst (eigen gedrag van input type=search); dat toetsen we niet
    check('19 / springt naar het zoekveld, typen zoekt (de o wisselt de modus niet), Escape verlaat het veld', a1 == 'treeSearch' and tree and 'treffer' in info and not om and a2 == 'BODY', f'focus {a1}, boom {tree}, "{info}", openMode {om}, daarna {a2}')
    pg.fill('#treeSearch', ''); pg.click('#tabbtn-info'); blur()
    # pijltjes in de boom: omhoog de ouder, omlaag het eerste zichtbare kind, rechts en links de buren; niets klapt uit, elke stap telt in de historie
    preset(pg, 'assembled'); pg.evaluate("__model.select(__model.byName('Motorkap'))"); settle(pg, 60); blur()
    exp = pg.evaluate("(() => { const L = __model, c = L.byName('Carrosserie'), k = c.kids.filter(x => x.ev); const i = k.indexOf(k[0]); return [c.name, k[0].name, k[(i + 1) % k.length].name]; })()")
    h0 = state()['history']; open0 = state()['open']
    got = []
    for key in ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']:
        pg.keyboard.press(key); settle(pg, 60)
        got.append(state()['selected'])
    st = state()
    check('19 pijltjes lopen door de boom (ouder, kind, buur, terug) zonder iets uit te klappen, elke stap in de historie', got == [exp[0], exp[1], exp[2], exp[1]] and st['open'] == open0 and st['history'] == h0 + 4, f'{got} verwacht {exp}, open {st["open"]}, historie {h0} -> {st["history"]}')
    # pijltjes op de modusknoppen wisselen de modus en laten de selectie staan; op de segmentknop wisselen ze Uitklappen en Openen
    sel0 = state()['selected']
    pg.focus('#modes [data-mode="part"]'); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(80)
    m1 = [state()['mode'], active()]
    pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(80)
    m2 = [state()['mode'], active(), state()['selected']]
    check('19 pijltjes op de modusknoppen wisselen de modus (focus volgt) en laten de selectie staan', m1 == ['layers', 'layers'] and m2 == ['part', 'part', sel0], f'{m1} {m2}')
    pg.focus('#openSeg [data-omode][aria-checked="true"]'); pg.keyboard.press('ArrowRight'); settle(pg, 120)
    o1 = state()['openMode']
    pg.keyboard.press('ArrowLeft'); settle(pg, 120)
    o2 = state()['openMode']
    check('19 pijltjes op de segmentknop wisselen Uitklappen en Openen', o1 and not o2, f'{o1} dan {o2}')
    blur()
    # Enter in Openen: opent de opener van de selectie; Shift+Enter sluit hem
    pg.evaluate("__model.setOpenMode(true); __model.select(__model.byName('Motorkap'))"); settle(pg, 120); blur()
    pg.keyboard.press('Enter'); settle(pg, 120)
    o1 = pg.evaluate('__model.openers().find(q => q.name === "Motorkap").target')
    pg.keyboard.press('Shift+Enter'); settle(pg, 120)
    o2 = pg.evaluate('__model.openers().find(q => q.name === "Motorkap").target')
    check('19 Enter in Openen opent de geselecteerde opener, Shift+Enter sluit hem', o1 == 1 and o2 == 0, f'{o1} dan {o2}')
    pg.evaluate("__model.openAll(0, true); __model.setOpenMode(false)"); settle(pg)
    # presetmenu: pijl omlaag op de categorieknop opent het, End en Home springen naar het laatste en eerste item, Enter kiest, Escape sluit met de focus terug
    preset(pg, 'assembled')
    pg.focus('[data-cat="Motor"]'); pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(120)
    ids = pg.evaluate("[...document.querySelectorAll('#menu .mi')].map(b => b.dataset.preset)")
    opened = pg.evaluate("!document.getElementById('menu').hidden")
    pg.keyboard.press('End'); pg.wait_for_timeout(60); a_end = active()
    pg.keyboard.press('Home'); pg.wait_for_timeout(60); a_home = active()
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(60); a_down = active()
    pg.keyboard.press('Enter'); settle(pg, 120)
    st = state(); closed = pg.evaluate("document.getElementById('menu').hidden")
    check('19 presetmenu met het toetsenbord: pijl omlaag opent, End en Home, Enter kiest en sluit', opened and len(ids) >= 3 and a_end == ids[-1] and a_home == ids[0] and a_down == ids[1] and st['preset'] == ids[1] and closed, f'open {opened}, {len(ids)} items, End {a_end}, Home {a_home}, omlaag {a_down}, gekozen {st["preset"]}, dicht {closed}')
    pg.focus('[data-cat="Motor"]'); pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(120)
    opened = pg.evaluate("!document.getElementById('menu').hidden")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(120)
    r = [pg.evaluate("document.getElementById('menu').hidden"), active(), state()['preset']]
    check('19 Escape sluit het presetmenu, de focus gaat terug naar de categorieknop, de preset blijft', opened and r == [True, 'Motor', ids[1]], f'open {opened}, {r}')
    blur()
    pg.close()

    # 20. formaat wisselen. Zou de fouten I1 (golf 2, commit 8639a82: korte en liggende schermen zonder bruikbaar vrij beeld), de
    # bovenbalk op lage liggende schermen (d8f80b1) en audit U21 (het model kreeg op de telefoon te weinig ruimte) gevangen
    # hebben: na elke wissel de juiste indeling, geen horizontale scroll, labels en het kader van de selectie in het vrije beeld.
    pg = s.page(1280, 800)
    pg.evaluate(JS_HELPERS)
    preset(pg, 'engine')
    layout = lambda: pg.evaluate("""(() => { const sh = document.getElementById('sheet').getBoundingClientRect(), W = innerWidth, H = innerHeight;
      const lade = sh.left < 1 && sh.width > W - 2 && sh.bottom > H - 2, kolom = sh.left > W * 0.45 && sh.width < W * 0.55 && sh.top < H * 0.2;
      return { W, H, indeling: lade ? 'lade' : (kolom ? 'kolom' : 'onbekend'), hscroll: document.documentElement.scrollWidth > W || document.body.scrollWidth > W }; })()""")
    # In software-rendering komt het resize-event pas 1 tot 2,5 s na de wissel (innerWidth klopt direct, het event wacht op een
    # frame). Daarom eerst wachten op het event (eigen teller), dan tot paneel en vrij beeld twee metingen gelijk zijn: het
    # paneel schuift met een overgang van 0,28 s, de ResizeObserver legt het beeld opnieuw en de camera past zich 160 ms later in.
    pg.evaluate("window.__rs = 0; window.addEventListener('resize', () => { window.__rs++; })")
    def stabiel():
        prev = None
        for _ in range(12):
            pg.wait_for_timeout(300); settle(pg, 60)
            cur = pg.evaluate("(() => { const r = document.getElementById('sheet').getBoundingClientRect(), v = __model.freeView(); return [innerWidth, innerHeight, Math.round(r.top), Math.round(r.left), Math.round(r.height), Math.round(v.x), Math.round(v.y), Math.round(v.w), Math.round(v.h)]; })()")
            if cur == prev: return cur
            prev = cur
        return prev
    stappen = [(390, 844, 'lade'), (1280, 800, 'kolom'), (844, 390, 'kolom'), (1024, 768, 'kolom'), (1280, 800, 'kolom')]
    for w, h, want in stappen:
        n_log = len(s.logs); n_rs = pg.evaluate('window.__rs')
        pg.set_viewport_size({'width': w, 'height': h})
        try:
            pg.wait_for_function(f'window.__rs > {n_rs}', timeout=15000); event = True
        except Exception:
            event = False
        stabiel()
        lay = layout()
        ok_l, n, errs = T(pg, 'labelCheck()')
        f = pg.evaluate("__model.frameOf('Motor F4Rt')")
        check(f'20 {w}x{h}: indeling {want}, geen horizontale scroll, labels en het kader van de selectie in het vrije beeld, geen consolefout',
              event and lay['indeling'] == want and not lay['hscroll'] and ok_l and n >= 1 and f['inside'] and f['cover'] >= 0.12 and len(s.logs) == n_log,
              f"resize-event {event}, indeling {lay['indeling']}, hscroll {lay['hscroll']}, {n} labels {errs}, kader binnen {f['inside']} dekking {f['cover']}, nieuwe meldingen {len(s.logs) - n_log}")

    # 21. stap terug tot 50 stappen. Zou de fouten I5 en I6 (golf 2, commit bc35c25: Röntgen, systeemkleuren en spreiding volgden
    # stap terug niet) over de volle diepte gevangen hebben; de README belooft 50 stappen en controle 5 toetst er maar een.
    preset(pg, 'assembled'); pg.evaluate("__model.select(__model.byName('Carrosserie'))"); settle(pg, 60)
    pg.evaluate("document.activeElement && document.activeElement.blur()")
    s5 = None
    for i in range(55):
        pg.keyboard.press('ArrowRight'); settle(pg, 30)
        if i == 4: s5 = T(pg, 'stateNoHist()')
    h55 = pg.evaluate('__model.state().history')
    for _ in range(50):
        pg.keyboard.press('Backspace'); settle(pg, 30)
    h0 = pg.evaluate('__model.state().history'); s_back = T(pg, 'stateNoHist()')
    pg.keyboard.press('Backspace'); settle(pg, 30)
    r = pg.evaluate("[__model.state().history, document.getElementById('undo').disabled]")
    check('21 historie van hoogstens 50: na 55 stappen 50, na 50 keer Backspace de stand van na stap 5, de 51e doet niets',
          h55 == 50 and h0 == 0 and s_back == s5 and r == [0, True] and T(pg, 'stateNoHist()') == s_back, f'historie {h55} -> {h0}, gelijk aan stap 5: {s_back == s5}, daarna {r}')
    reduced_desk = pg.evaluate('REDUCED')
    amt_norm = pg.evaluate("(() => { const L = __model; L.preset('assembled'); L.finishAll(); L.setTarget(L.byName('Motorkap'), 1); uiTick(1 / 60); return L.byName('Motorkap').amt; })()")
    pg.evaluate("__model.finishAll()")
    pg.close()
    # reduced motion: de pagina leest prefers-reduced-motion bij het laden (REDUCED in core.js), dus emuleren en opnieuw laden
    pr = s.page(1280, 800, wait=False)
    pr.emulate_media(reduced_motion='reduce')
    pr.reload(wait_until='load', timeout=tmo)
    pr.wait_for_function('window.__model && window.__model.ready !== false', timeout=tmo)
    pr.wait_for_timeout(300)
    r = pr.evaluate("""(() => { const L = __model; const css = getComputedStyle(document.getElementById('sheet')).transitionDuration;
      L.setTarget(L.byName('Motorkap'), 1); uiTick(1 / 60); const amt = L.byName('Motorkap').amt; L.finishAll();
      L.preset('engine'); const f = L.frameOf('Motor F4Rt'); return { reduced: REDUCED, css, amt, motor: L.byName('Motor F4Rt').amt, inside: f.inside, cover: f.cover }; })()""")
    check('21 reduced motion: REDUCED staat, de paneelovergang is uit, een uitklap staat na een tik in de eindstand en een preset direct in beeld (zonder finishAll)',
          not reduced_desk and amt_norm < 0.5 and r['reduced'] and r['css'] == '0s' and r['amt'] >= 0.999 and r['motor'] >= 0.999 and r['inside'],
          f"desktop REDUCED {reduced_desk} amt na een tik {amt_norm:.3f}; reduce: REDUCED {r['reduced']}, transition {r['css']}, amt {r['amt']}, motor {r['motor']}, kader binnen {r['inside']}")
    pr.close()

    # 22. zoeken met hoofdletters en diakrieten. Dekt audit U17 (zoeken is de snelste weg naar een diep onderdeel) en beschermt
    # de normalisatie (kleine letters, NFD zonder accenten, in app1.js en app2.js) terwijl U10 het zoeken uitbreidt met synoniemen.
    pg = s.page(1280, 800)
    pg.click('#tabbtn-tree')
    def zoek(q):
        pg.fill('#treeSearch', q); pg.wait_for_timeout(200)
        return pg.evaluate("[...document.querySelectorAll('#tree .trow .tn')].map(e => e.textContent)")
    a, b = zoek('KLEPSPIE'), zoek('klepspie')
    check('22 zoeken: KLEPSPIE en klepspie geven dezelfde treffers', a == b and len(a) >= 1 and all('klepspie' in x.lower() for x in a), f'{len(a)} en {len(b)} treffers')
    c = zoek('klépspie')
    d = zoek('solenoide')
    e = zoek('vacuum')
    check('22 zoeken met diakrieten: klépspie vindt klepspie, solenoide vindt Solenoïde, vacuum vindt Vacuüm', c == b and any('Solenoïde' in x for x in d) and any('Vacuüm' in x for x in e), f'{len(c)} / {d[:2]} / {e[:2]}')
    pg.fill('#treeSearch', ''); pg.click('#tabbtn-info')
    pg.close()

with session() as s:
    run_view(s, 'desktop', 1280, 800, False)
    run_view(s, 'telefoon', 390, 844, True)
    # donkere modus
    pg = s.page(1280, 800)
    pg.emulate_media(color_scheme='dark')
    pg.wait_for_timeout(300)
    bg = pg.evaluate("getComputedStyle(document.body).backgroundColor")
    pg.evaluate("__model.preset('engine'); __model.finishAll()")
    pg.wait_for_timeout(300)
    shot(pg, 'itest_dark_motor')
    check('10 donkere modus', bg.replace(' ', '') in ('rgb(26,33,41)',), bg)
    # 12. ingesloten onderdelen (inner): niet getekend en niet aanklikbaar zolang de oudergroep dicht is
    r = pg.evaluate("""(() => { const L = __model; L.preset('assembled'); L.finishAll();
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
    r = pg.evaluate("""(() => { const L = __model; L.preset('assembled'); L.finishAll();
      L.tapNode(L.byName('Subframe')); L.finishAll(); L.tapNode(L.byName('Langsbalk links')); L.finishAll();
      const lifted = L.liftedNode() ? L.liftedNode().name : null;
      L.setExplode(0); L.finishAll();
      return { lifted, after: L.liftedNode() ? L.liftedNode().name : null }; })()""")
    check('12b opgetild onderdeel zakt terug bij setExplode(0)', r['lifted'] == 'Langsbalk links' and r['after'] is None, json.dumps(r))
    # 13. samengevoegd tekenen van gesloten groepen (batching)
    pg.evaluate("__model.preset('assembled'); __model.finishAll()")
    pg.wait_for_timeout(200)
    r = pg.evaluate("""(() => { const L = __model; L.batching(false); const off = L.drawCalls(); L.batching(true);
      const st = L.batchFlush(); const on = L.drawCalls(); return { off, on, st }; })()""")
    calls_off = r['off']
    check('13 batching: minder tekenopdrachten in Gemonteerd (<= 1500)', r['on'] < r['off'] and r['on'] <= 1500, f"{r['off']} -> {r['on']}; {json.dumps(r['st'])}")
    # een onderdeel binnen een samengevoegde groep aanwijzen en (modus Info) selecteren
    r = pg.evaluate("""(() => { const L = __model; L.setMode('select');
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
        st = pg.evaluate("(() => { const L = __model; L.drawCalls(); const s = L.sel(); const b = new Set(L.batchedGroups()); let a = s, hit = false; for (; a; a = a.parent) if (b.has(a.name)) hit = true; return [s.name, hit]; })()")
        check('13 batching: klik selecteert dat onderdeel en zijn groep wordt los getekend', st[0] == r[2] and not st[1], f'aangewezen {r[2]} in {r[3]}, geselecteerd {st[0]}, nog samengevoegd: {st[1]}')
        shot(pg, 'itest_desk_batch_selectie')
        pg.evaluate("__model.setMode('part')")
    # openen haalt de groep direct uit de batch; dichtklappen voegt hem na de animatie weer samen
    r = pg.evaluate("""(() => { const L = __model; L.preset('assembled'); L.finishAll(); L.batchFlush(); L.drawCalls();
      const g = L.batchedGroups().map(L.byName).find(n => n.kids.some(k => k.asm || !k.inner)); if (!g) return null;
      L.setTarget(g, 1); L.drawCalls(); const unOnOpen = !L.batchedGroups().includes(g.name);
      L.finishAll(); L.setTarget(g, 0); L.drawCalls(); const unWhileAnim = !L.batchedGroups().includes(g.name);
      L.finishAll(); L.drawCalls(); const again = L.batchedGroups().includes(g.name);
      return { group: g.name, unOnOpen, unWhileAnim, again }; })()""")
    check('13 batching: openen maakt direct los, na het dichtklappen weer samengevoegd', r and r['unOnOpen'] and r['unWhileAnim'] and r['again'], json.dumps(r))
    # 11. tekenopdrachten en frametijd
    pg.evaluate("__model.preset('assembled'); __model.finishAll(); __model.batchFlush()")
    pg.wait_for_timeout(200)
    calls = pg.evaluate("(() => { renderer.info.reset(); renderer.render(scene, camera); return renderer.info.render.calls; })()")
    print(f'info 13 tekenopdrachten Gemonteerd zonder batching: {calls_off}, met batching: {calls}')
    prof = pg.evaluate("__model.profileFrames('Motor F4Rt', 120)")
    print(f'info 11 tekenopdrachten Gemonteerd: {calls} (drempel 1500); profileFrames Motor F4Rt: p50 {prof["p50"]} ms, p95 {prof["p95"]} ms, max {prof["max"]} ms (drempel p95 8 ms)')
    if os.environ.get('ITEST_GATES'):
        check('11 tekenopdrachten <= 1500', calls <= 1500, str(calls))
        check('11 frametijd p95 <= 8 ms', prof['p95'] <= 8, str(prof['p95']))
    pg.close()
    # 17. deelbare stand in de URL en de debug-overlay
    pq = s.page(1280, 800, query='?preset=engine&debug=1')
    st = pq.evaluate("__model.state()")
    check('17 ?preset=engine laadt de preset Motor F4Rt', st['preset'] == 'engine' and not st['openMode'], json.dumps({'preset': st['preset'], 'openMode': st['openMode']}))
    pq.wait_for_timeout(900)
    dbg = pq.evaluate("(document.getElementById('debug') || {}).textContent || ''")
    check('17 ?debug=1 toont de overlay met tekenopdrachten en versie', 'tekenopdrachten' in dbg and 'versie' in dbg, dbg[:120])
    ver = pq.evaluate("__model.version")
    check('17 versiestempel uit build.py (nummer plus inhoudshash)', bool(ver) and 'bron' in ver, str(ver))
    pq.evaluate("__model.preset('turbo'); __model.finishAll()"); pq.wait_for_timeout(150)
    check('17 de adresbalk volgt de preset', 'preset=turbo' in pq.evaluate('location.search') and 'debug=1' in pq.evaluate('location.search'), pq.evaluate('location.search'))
    pq.evaluate("__model.setOpenMode(true); __model.openAll(0, true); __model.setOpen('Motorkap', 1, true); __model.setOpen('Renault Laguna III/Carrosserie/Portier linksvoor/Zijruit', 1, true); __model.finishAll()")
    pq.wait_for_timeout(150)
    q = pq.evaluate("decodeURIComponent(location.search).replace(/\\+/g, ' ')")
    check('17 de adresbalk volgt de openstand (naam, of pad bij een dubbele naam)', 'open=Motorkap,Carrosserie/Portier linksvoor/Zijruit' in q, q)
    pq.close()
    pq = s.page(1280, 800, query='?open=Motorkap,Carrosserie/Portier%20linksvoor/Zijruit')
    st = pq.evaluate("__model.state()")
    check('17 ?open=... opent precies die openers in de modus Openen', st['openMode'] and sorted(st['openers']) == ['Motorkap', 'Zijruit'], json.dumps({'openMode': st['openMode'], 'openers': st['openers']}))
    pq.close()
    check18(s)
    run_golf5c(s)
    errs = s.errors()  # fouten en waarschuwingen (harness.errors telt beide)
    check('10 geen console-fouten of -waarschuwingen', not s.logs, '; '.join(l[:200] for l in s.logs[:5]))
    s.report()

fails = [n for n, ok in RESULTS if not ok]
print(f'\nSAMENVATTING: {len(RESULTS) - len(fails)} van {len(RESULTS)} controles geslaagd' + (', mislukt: ' + '; '.join(fails) if fails else ''))
sys.exit(1 if fails else 0)

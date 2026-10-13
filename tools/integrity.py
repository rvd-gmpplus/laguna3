"""Integriteit van de onderdelenboom: namen, beschrijvingen, geometrie, posities, uitklapvectoren en presets.

    python3 tools/integrity.py        # exitcode 1 bij fouten; waarschuwingen worden alleen gemeld
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import session

CHECK = r"""(ANCHORS) => {
  const L = window.__laguna, err = [], warn = [];
  const path = n => { const a = []; for (let p = n; p; p = p.parent) a.unshift(p.name); return a.join(' › '); };
  L.ROOT.obj.updateMatrixWorld(true);
  const box = new THREE.Box3(), v = new THREE.Vector3();
  const LIM = { x: 1.15, y0: -0.08, y1: 1.62, z: 2.48 };
  const pos = new Map();
  for (const n of L.ALL) {
    if (!n.name || typeof n.name !== 'string') err.push('naamloze knoop ' + n.id);
    if (!n.d || n.d.length < 8) warn.push('geen of korte beschrijving: ' + path(n));
    if (n.asm) {
      if (n.kids.length === 0) err.push('lege groep: ' + path(n));
      else if (n.kids.length === 1) warn.push('groep met één onderdeel: ' + path(n));
      const names = new Map();
      for (const k of n.kids) names.set(k.name, (names.get(k.name) || 0) + 1);
      for (const [k, c] of names) if (c > 1) warn.push(`dubbele naam binnen groep (${c}x): ${path(n)} › ${k}`);
    } else {
      const g = n.obj.geometry, a = g && g.attributes.position;
      if (!a || a.count === 0) { err.push('onderdeel zonder geometrie: ' + path(n)); continue; }
      let bad = false; for (let i = 0; i < a.array.length; i++) if (!Number.isFinite(a.array[i])) { bad = true; break; }
      if (bad) { err.push('NaN in geometrie: ' + path(n)); continue; }
      box.setFromObject(n.obj);
      if (box.isEmpty() || ![box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z].every(Number.isFinite)) { err.push('ongeldige box: ' + path(n)); continue; }
      if (box.min.x < -LIM.x || box.max.x > LIM.x || box.min.y < LIM.y0 || box.max.y > LIM.y1 || box.min.z < -LIM.z || box.max.z > LIM.z)
        err.push(`buiten de auto (gemonteerd): ${path(n)} [${box.min.toArray().map(x => x.toFixed(2))} .. ${box.max.toArray().map(x => x.toFixed(2))}]`);
      const key = box.getCenter(v).toArray().map(x => x.toFixed(4)).join(',') + '|' + (g.index ? g.index.count : a.count) + '|' + (n.obj.material && n.obj.material.name);
      if (pos.has(key)) warn.push('dubbel onderdeel op dezelfde plek: ' + path(n) + '  ==  ' + pos.get(key)); else pos.set(key, path(n));
    }
    if (n.parent) {
      const e = n.exv;
      if (!e || ![e.x, e.y, e.z].every(Number.isFinite)) err.push('ongeldige uitklapvector: ' + path(n));
      else if (e.length() < 1e-4) warn.push('uitklapvector nul: ' + path(n));
    }
  }
  const anchorErr = [];
  const A = ANCHORS, count = new Map();
  for (const n of L.ALL) count.set(n.name, (count.get(n.name) || 0) + 1);
  for (const [k, list] of Object.entries(A)) {
    if (k === 'root_children_order' || k === 'onderstel_children') continue;
    for (const name of list) { const c = count.get(name) || 0; if (c !== 1) anchorErr.push(`anker "${name}" (${k}) komt ${c}x voor, moet 1x`); }
  }
  const rc = L.ROOT.kids.map(k => k.name).join(' | '), want = A.root_children_order.join(' | ');
  if (rc !== want) anchorErr.push(`hoofdgroepen: "${rc}" in plaats van "${want}"`);
  const on = L.ALL.find(n => n.name === 'Onderstel');
  if (on) { const oc = on.kids.map(k => k.name).slice().sort().join(' | '), ow = A.onderstel_children.slice().sort().join(' | '); if (oc !== ow) anchorErr.push(`Onderstel bevat "${oc}" in plaats van "${ow}"`); }
  // Doorsteken: het hoogste punt van een onderdeel buiten de carrosserie mag niet boven de bovenste carrosseriehuid
  // op dezelfde (x, z) uitkomen (motor door de motorkap, hoofdsteun door het dak, enzovoort).
  const bodyN = L.ALL.find(n => n.name === 'Carrosserie');
  if (bodyN) {
    const bodyMeshes = bodyN.meshes.filter(m => m.visible);
    const rc = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), o = new THREE.Vector3(), w = new THREE.Vector3();
    const isBody = n => { for (let p = n; p; p = p.parent) if (p === bodyN) return true; return false; };
    let checked = 0;
    for (const n of L.ALL) {
      if (n.asm || isBody(n)) continue;
      const a = n.obj.geometry.attributes.position, step = Math.max(1, Math.floor(a.count / 400));
      let top = null;
      for (let i = 0; i < a.count; i += step) { w.fromBufferAttribute(a, i).applyMatrix4(n.obj.matrixWorld); if (!top || w.y > top.y) top = w.clone(); }
      if (!top || top.y < 0.45) continue;
      if (typeof HW === 'function' && Math.abs(top.x) > HW(top.z) - 0.08) continue;   // tegen de flank: deze controle kijkt alleen van boven
      o.set(top.x, 2.5, top.z); rc.set(o, down); rc.far = 3;
      const hit = rc.intersectObjects(bodyMeshes, false)[0];
      checked++;
      if (hit && top.y > hit.point.y + 0.004) err.push(`steekt boven de carrosserie uit (${((top.y - hit.point.y) * 100).toFixed(1)} cm door ${hit.object.userData.node.name}): ${path(n)}`);
    }
    if (!checked) warn.push('doorsteekcontrole: niets gecontroleerd');
  }
  const presetErr = [];
  if (L.checkPresets) presetErr.push(...L.checkPresets());
  return { err, warn, presetErr, anchorErr, nodes: L.ALL.length, parts: L.ALL.filter(n => !n.asm).length };
}"""

ANCHORS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'anchors.json'), encoding='utf-8'))

with session() as s:
    pg = s.page(1100, 700)
    r = pg.evaluate(CHECK, ANCHORS)
    print(f"{r['nodes']} knopen, {r['parts']} onderdelen")
    print(f"{len(r['err'])} fouten, {len(r['anchorErr'])} ankerfouten, {len(r['warn'])} waarschuwingen, {len(r['presetErr'])} presetfouten")
    for e in r['err'][:60]: print('FOUT  ' + e)
    for e in r['anchorErr'][:60]: print('ANKER ' + e)
    for e in r['presetErr'][:30]: print('PRESET ' + e)
    show = int(os.environ.get('WARN', '25'))
    for w in r['warn'][:show]: print('let op ' + w)
    if len(r['warn']) > show: print(f'... nog {len(r["warn"]) - show} waarschuwingen (WARN=999 voor alles)')
    s.report()
    sys.exit(1 if (r['err'] or r['anchorErr'] or r['presetErr'] or s.errors()) else 0)

"""Zijwaartse vrije ruimte in de bagageruimte: stralen vanuit het midden naar links en rechts."""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))  # tools/ van deze checkout
from harness import session
with session() as s:
    pg = s.page(1280, 800)
    pg.wait_for_function('window.__laguna && window.__laguna.ready', timeout=180000)
    r = pg.evaluate('''() => { const L = window.__laguna; L.batching(false); L.finishAll();
      const skip = new Set(['Hoedenplank', 'Achterplankluidspreker links', 'Achterplankluidspreker rechts']);
      const ms = L.MESHES.filter(m => { let k = m; while (k && !k.userData?.node) k = k.parent; const n = k && k.userData.node; return m.visible !== false && !(n && skip.has(n.name)); });
      scene.updateMatrixWorld(true);
      const rc = new THREE.Raycaster(); const out = [];
      for (const z of [-1.6, -1.75, -1.9, -2.0, -2.1]) for (const y of [1.0, 1.1, 1.2, 1.28]) { const row = { z, y };
        for (const sx of [1, -1]) { rc.set(new THREE.Vector3(0, y, z), new THREE.Vector3(sx, 0, 0)); rc.far = 1.2; const h = rc.intersectObjects(ms, false)[0];
          let nm = null; if (h) { let k = h.object; while (k && !k.userData?.node) k = k.parent; nm = k ? k.userData.node.name : h.object.name; }
          row[sx > 0 ? 'L' : 'R'] = h ? [Math.round(h.distance * 1000) / 1000, nm] : null; }
        out.push(row); }
      return out; }''')
    for row in r: print(row)
    s.report()

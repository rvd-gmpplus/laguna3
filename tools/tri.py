"""Driehoeken per hoofdgroep en de 25 zwaarste onderdelen.

    python3 tools/tri.py
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import session

with session() as s:
    pg = s.page(400, 300)
    r = pg.evaluate("""(() => { const out = {}, byTop = {}; let tot = 0;
      for (const m of window.__laguna.MESHES) { const g = m.geometry, t = (g.index ? g.index.count : g.attributes.position.count) / 3; tot += t;
        const n = m.userData.node, k = (n.parent ? n.parent.name + ' / ' : '') + n.name; out[k] = (out[k] || 0) + t;
        let top = n; while (top.parent && top.parent.parent) top = top.parent; byTop[top.name] = (byTop[top.name] || 0) + t; }
      return { tot, arr: Object.entries(out).sort((a, b) => b[1] - a[1]).slice(0, 25), byTop }; })()""")
    print('totaal', int(r['tot']))
    for k, v in sorted(r['byTop'].items(), key=lambda kv: -kv[1]): print(f'{int(v):>8}  {k}')
    print('zwaarste onderdelen:')
    for k, v in r['arr']: print(f'{int(v):>8}  {k}')

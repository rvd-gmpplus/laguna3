"""Silhouettoets: meet de gemonteerde carrosserie met stralen en vergelijkt met het gemeten fase 2-silhouet.

    python3 tools/silhouette.py        # exitcode 1 als de toets niet slaagt

Referentie: onderzoek exterieur (zijaanzicht en bovenaanzicht van de Laguna III hatchback, fase 2),
in het modelframe (x links +, y omhoog, z voor +). Tolerantie 0,03 m tussen de assen en 0,05 m in de overhang.
De toets slaagt als hoogstens 2 stations per reeks buiten de tolerantie vallen en de neus en staart in bovenaanzicht
smal genoeg zijn (halve breedte bij z = +2,30 hoogstens 0,40 en bij z = -2,30 hoogstens 0,55).
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import session

TOP = [(2.325, 0.58), (2.095, 0.81), (1.845, 0.885), (1.595, 0.93), (1.345, 0.97), (1.095, 0.99), (0.845, 1.115), (0.595, 1.24),
       (0.345, 1.335), (0.095, 1.415), (-0.155, 1.44), (-0.405, 1.448), (-0.655, 1.443), (-0.905, 1.417), (-1.155, 1.372),
       (-1.405, 1.31), (-1.655, 1.255), (-1.905, 1.18), (-2.155, 1.10), (-2.33, 0.64)]
PLAN = [(2.30, 0.32), (2.20, 0.66), (2.10, 0.76), (2.00, 0.81), (1.80, 0.86), (1.60, 0.90), (1.20, 0.905), (0.60, 0.905), (0.0, 0.905),
        (-0.60, 0.905), (-1.20, 0.905), (-1.50, 0.905), (-1.75, 0.88), (-2.00, 0.835), (-2.10, 0.81), (-2.20, 0.77), (-2.30, 0.50)]
BELT = [(0.845, 0.915), (0.595, 0.928), (0.345, 0.937), (0.095, 0.945), (-0.155, 0.949), (-0.405, 0.955), (-0.655, 0.963), (-0.905, 0.968), (-1.155, 0.976)]
AXF, AXR = 1.365, -1.391

MEASURE = r"""(cfg) => {
  const L = window.__laguna; L.collapseAll(); L.finishAll(); L.ROOT.obj.updateMatrixWorld(true);
  const body = L.ALL.find(n => n.name === 'Carrosserie');
  const skip = n => { for (let p = n; p && p !== body; p = p.parent) if (/Buitenspiegel|Antenne|Ruitenwisser|Wisser|greep/i.test(p.name)) return true; return false; };
  const meshes = body.meshes.filter(m => m.visible && !skip(m.userData.node));
  const glassy = m => m.material && (m.material.name === 'glass' || /ruit|glas/i.test(m.userData.node.name));
  const rc = new THREE.Raycaster();
  const hitDown = (x, z) => { rc.set(new THREE.Vector3(x, 3, z), new THREE.Vector3(0, -1, 0)); rc.far = 4; const h = rc.intersectObjects(meshes, false)[0]; return h ? h.point.y : null; };
  const hitSide = (y, z) => { rc.set(new THREE.Vector3(2.5, y, z), new THREE.Vector3(-1, 0, 0)); rc.far = 2.6; const h = rc.intersectObjects(meshes, false)[0]; return h ? h : null; };
  const top = cfg.top.map(([z]) => hitDown(0, z));
  const plan = cfg.plan.map(([z]) => { let best = null; for (let y = 0.22; y <= 1.05; y += 0.02) { const h = hitSide(y, z); if (h && (best === null || h.point.x > best)) best = h.point.x; } return best; });
  const belt = cfg.belt.map(([z]) => { for (let y = 0.80; y <= 1.15; y += 0.004) { const h = hitSide(y, z); if (h && glassy(h.object)) return y; } return null; });
  return { top, plan, belt, meshes: meshes.length };
}"""


def judge(name, ref, got, tol_fn):
    rows, bad = [], 0
    for (z, r), g in zip(ref, got):
        tol = tol_fn(z)
        ok = g is not None and abs(g - r) <= tol
        bad += 0 if ok else 1
        rows.append(f'  {name:5s} z={z:+.3f}  ref {r:.3f}  gemeten {"-" if g is None else f"{g:.3f}"}  {"ok" if ok else "BUITEN TOLERANTIE"}  (±{tol:.2f})')
    return rows, bad


tol = lambda z: 0.03 if AXR <= z <= AXF else 0.05
with session() as s:
    pg = s.page(800, 600)
    r = pg.evaluate(MEASURE, {'top': TOP, 'plan': PLAN, 'belt': BELT})
    out, fails = [], []
    for name, ref, got in (('top', TOP, r['top']), ('plan', PLAN, r['plan']), ('raam', BELT, r['belt'])):
        rows, bad = judge(name, ref, got, tol)
        out += rows
        if bad > 2:
            fails.append(f'{name}: {bad} stations buiten tolerantie')
    hw_front, hw_rear = r['plan'][0], r['plan'][-1]
    if hw_front is None or hw_front > 0.40:
        fails.append(f'neus te breed in bovenaanzicht: halve breedte bij z=+2,30 is {hw_front}, maximaal 0,40')
    if hw_rear is None or hw_rear > 0.55:
        fails.append(f'staart te breed in bovenaanzicht: halve breedte bij z=-2,30 is {hw_rear}, maximaal 0,55')
    print('\n'.join(out))
    print(f"{r['meshes']} carrosseriemeshes gemeten")
    print('SILHOUET OK' if not fails else 'SILHOUET NIET OK:\n  ' + '\n  '.join(fails))
    s.report()
    sys.exit(1 if fails or s.errors() else 0)

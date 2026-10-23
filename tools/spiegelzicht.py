"""Zichtpoort: het spiegelglas van de buitenspiegel vanuit het oog van de bestuurder (golf 7, besluit van de gebruiker).

    python3 tools/spiegelzicht.py [--zijde rechts|links] [--min N] [--json PAD]

140 stralen vanaf het oog van de bestuurder (0,37; 1,12; -0,30) m, hetzelfde oog als in golf 6 en 7, naar punten verdeeld
over het Spiegelglas (oppervlaktegewogen, vaste reeks, dus elke run dezelfde punten). Een straal is vrij als niets
ondoorzichtigs ervoor zit: ruiten (doorzichtig materiaal met dekking onder 0,95) en het spiegelglas zelf tellen niet. Per
geblokkeerde straal het geraakte onderdeel (laatste twee padstukken).

Exitcode: 0 als minstens N stralen vrij zijn (zonder --min altijd 0, alleen meten), 1 als het er minder zijn, 2 bij een
fout (geen spiegelglas gevonden). De eis van de gebruiker is minstens 100 van 140 rechts (docs/onderzoek/beslissingen.md,
rijen Golf 7); zo staat hij als extra test in auto.json, dus in tools/orkestratie/finaltests.sh.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import session

OOG = (0.37, 1.12, -0.30)
STRALEN = 140


def arg(naam, std=None):
    return sys.argv[sys.argv.index(naam) + 1] if naam in sys.argv else std


def main():
    zijde = arg('--zijde', 'rechts')
    if zijde not in ('rechts', 'links'):
        print('--zijde is rechts of links', file=sys.stderr); return 2
    minimum = arg('--min')
    minimum = int(minimum) if minimum is not None else None
    uit = arg('--json')
    with session() as s:
        pg = s.page(400, 300)
        r = pg.evaluate("""([zijde, oog, n]) => { const L = __model; L.finishAll(); L.ROOT.obj.updateMatrixWorld(true);
          const path = m => { let p = []; for (let k = m.userData.node; k; k = k.parent) p.unshift(k.name); return p.slice(1).join('/'); };
          const zicht = o => { for (; o; o = o.parent) if (o.visible === false) return false; return true; };
          const doorzichtig = m => { const ms = Array.isArray(m.material) ? m.material : [m.material]; return ms.every(x => x && x.transparent && x.opacity < 0.95); };
          const knoop = L.byName('Buitenspiegel ' + zijde); if (!knoop) return { fout: 'geen knoop Buitenspiegel ' + zijde };
          let glas = null; knoop.obj.traverse(o => { if (o.isMesh && /Spiegelglas$/.test(path(o))) glas = o; });
          if (!glas) return { fout: 'geen Spiegelglas onder Buitenspiegel ' + zijde };
          const eye = new THREE.Vector3(oog[0], oog[1], oog[2]);
          // punten: oppervlaktegewogen over de driehoeken van het glas, vaste pseudo-willekeurige reeks
          const g = glas.geometry, pos = g.attributes.position, idx = g.index ? g.index.array : [...Array(pos.count).keys()];
          const tri = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(); let tot = 0;
          for (let i = 0; i < idx.length; i += 3) { A.fromBufferAttribute(pos, idx[i]).applyMatrix4(glas.matrixWorld); B.fromBufferAttribute(pos, idx[i + 1]).applyMatrix4(glas.matrixWorld); C.fromBufferAttribute(pos, idx[i + 2]).applyMatrix4(glas.matrixWorld);
            tot += new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A)).length() / 2; tri.push([A.clone(), B.clone(), C.clone(), tot]); }
          let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
          const pts = []; for (let k = 0; k < n; k++) { const t = rnd() * tot, T = tri.find(x => x[3] >= t) || tri[tri.length - 1]; let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
            pts.push(T[0].clone().addScaledVector(new THREE.Vector3().subVectors(T[1], T[0]), u).addScaledVector(new THREE.Vector3().subVectors(T[2], T[0]), v)); }
          const meshes = L.MESHES.filter(m => zicht(m) && m !== glas && !doorzichtig(m));
          const rc = new THREE.Raycaster(); rc.layers.enableAll();
          const tally = {}; let vrij = 0;
          for (const P of pts) { const d = P.clone().sub(eye); const l = d.length(); d.normalize(); rc.set(eye, d); rc.near = 0; rc.far = l - 0.001;
            const h = rc.intersectObjects(meshes, false)[0];
            const k = h ? path(h.object).split('/').slice(-2).join('/') : 'vrij'; tally[k] = (tally[k] || 0) + 1; if (!h) vrij++; }
          return { zijde, n: pts.length, vrij, tally: Object.fromEntries(Object.entries(tally).sort((a, b) => b[1] - a[1])) }; }""",
                        [zijde, list(OOG), STRALEN])
    if minimum is not None:
        r['min'] = minimum
    if uit:
        os.makedirs(os.path.dirname(os.path.abspath(uit)), exist_ok=True)
        with open(uit, 'w', encoding='utf-8') as f:
            json.dump(r, f, ensure_ascii=False, indent=1)
    if 'fout' in r:
        print('SPIEGELZICHT: FOUT, ' + r['fout']); return 2
    geblokkeerd = ', '.join(f'{k} {v}' for k, v in r['tally'].items() if k != 'vrij') or 'niets'
    print(f'geblokkeerd door: {geblokkeerd}')
    if minimum is not None and r['vrij'] < minimum:
        print(f"SPIEGELZICHT {zijde}: {r['vrij']} van {r['n']} stralen vrij, minder dan de eis van {minimum}"); return 1
    print(f"SPIEGELZICHT {zijde}: {r['vrij']} van {r['n']} stralen vrij" + (f' (eis {minimum})' if minimum is not None else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main())

"""Bouwt index.html uit src/ en controleert de broncode.

Gebruik:
  python3 build.py                 schrijft index.html (three.js via CDN)
  python3 build.py MAP             schrijft ook MAP/index.html die three.js uit MAP/three/ laadt
  python3 build.py --lint          controleert alleen, schrijft niets
  python3 build.py --test-only MAP schrijft alleen MAP/index.html (gebruikt door de tests; laat index.html ongemoeid)

Controles (de bouw stopt bij een fout):
  - dubbele functienamen op het hoogste niveau over alle bestanden (die zouden elkaar stil overschrijven)
  - dubbele materiaalnamen in std()/phys()
  - syntaxis van het samengevoegde script via `node --check` (vangt ook dubbele const/let)
"""
import os, re, sys, shutil, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ORDER = ['core.js', 'body.js', 'bodyparts.js', 'panorama.js', 'engine1.js', 'engine2.js', 'engine3.js', 'drivetrain.js', 'chassis.js', 'interior.js', 'systems.js', 'partnumbers.js', 'app1.js', 'presets.js', 'app2.js']
LIBS = ['build/three.min.js', 'examples/js/controls/OrbitControls.js', 'examples/js/environments/RoomEnvironment.js', 'examples/js/geometries/RoundedBoxGeometry.js', 'examples/js/utils/BufferGeometryUtils.js']
CDN = 'https://cdn.jsdelivr.net/npm/three@0.147.0/'


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def lint(sources):
    errors = []
    seen_fn, seen_mat = {}, {}
    for name, text in sources:
        for i, line in enumerate(text.split('\n'), 1):
            m = re.match(r'(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)', line)
            if m:
                fn = m.group(1)
                if fn in seen_fn:
                    errors.append(f'{name}:{i}: functie {fn} bestaat al in {seen_fn[fn]}')
                else:
                    seen_fn[fn] = f'{name}:{i}'
            for mm in re.finditer(r'\b(?:std|phys)\(\s*[\'"]([^\'"]+)[\'"]', line):
                mat = mm.group(1)
                if mat in seen_mat:
                    errors.append(f'{name}:{i}: materiaal {mat} bestaat al in {seen_mat[mat]}')
                else:
                    seen_mat[mat] = f'{name}:{i}'
    js = '\n'.join(text for _, text in sources)
    node = shutil.which('node')
    if node:
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(js)
            tmp = f.name
        try:
            r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
            if r.returncode != 0:
                msg = (r.stderr or r.stdout).strip().replace(tmp, 'samengevoegd.js')
                # regelnummer terugvertalen naar bronbestand
                lm = re.search(r'samengevoegd\.js:(\d+)', msg)
                if lm:
                    ln, acc = int(lm.group(1)), 0
                    for name, text in sources:
                        n = text.count('\n') + 1
                        if ln <= acc + n:
                            msg += f'\n  -> {name}:{ln - acc}'
                            break
                        acc += n
                errors.append('syntaxfout:\n' + msg)
        finally:
            os.unlink(tmp)
    else:
        print('let op: node niet gevonden, syntaxcontrole overgeslagen', file=sys.stderr)
    return errors


def page(head, js, prefix):
    tags = '\n'.join(f'<script src="{prefix}{l}"></script>' for l in LIBS)
    return f"{head}\n{tags}\n<script>\n{js}\n</script>\n"


def main(argv):
    lint_only = '--lint' in argv
    test_only = '--test-only' in argv
    args = [a for a in argv if not a.startswith('--')]
    sources = [(f, read(f)) for f in ORDER]
    errors = lint(sources)
    if errors:
        print('BOUW GESTOPT:', file=sys.stderr)
        for e in errors:
            print('  ' + e, file=sys.stderr)
        return 1
    if lint_only:
        print('lint ok')
        return 0
    head = read('head.html')
    js = '\n'.join(text for _, text in sources)
    out = os.path.join(HERE, 'index.html')
    if test_only and not args:
        print('--test-only vraagt een map', file=sys.stderr)
        return 2
    if not test_only:
        with open(out, 'w', encoding='utf-8') as f:
            f.write(page(head, js, CDN))
    if args:
        test_dir = args[0]
        os.makedirs(test_dir, exist_ok=True)
        body = page(head, js, 'three/')
        with open(os.path.join(test_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write('<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + body + '</body></html>')
    print('ok', 'testversie' if test_only else f'{os.path.getsize(out)} bytes')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

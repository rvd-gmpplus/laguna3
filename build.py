"""Bouwt index.html uit src/ en controleert de broncode.

Gebruik:
  python3 build.py                 schrijft index.html: een volledig document met doctype en viewport-regel (GitHub Pages), three.js via CDN
  python3 build.py --bare BESTAND  schrijft ook de kale pagina zonder documentgeraamte naar BESTAND (het artefact: de host zet er zelf een geraamte omheen)
  python3 build.py MAP             schrijft ook MAP/index.html die three.js uit MAP/three/ laadt
  python3 build.py --lint          controleert alleen, schrijft niets
  python3 build.py --test-only MAP schrijft alleen MAP/index.html (gebruikt door de tests; laat index.html ongemoeid)

Controles (de bouw stopt bij een fout):
  - dubbele functienamen op het hoogste niveau over alle bestanden (die zouden elkaar stil overschrijven)
  - dubbele materiaalnamen in std()/phys()
  - syntaxis van het samengevoegde script via `node --check` (vangt ook dubbele const/let), en van elk inline script in head.html

De scripttags van three.js krijgen integrity (sha384) en crossorigin="anonymous"; de hash komt uit het lokale npm-pakket
(THREE_DIR of ~/.cache/laguna/three-0.147.0/package, zie tools/harness.py --ensure-three). Ontbreekt dat, dan stopt de bouw.
"""
import os, re, sys, shutil, subprocess, tempfile, hashlib, base64

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ORDER = ['core.js', 'body.js', 'bodyparts.js', 'panorama.js', 'engine1.js', 'engine2.js', 'engine3.js', 'drivetrain.js', 'chassis.js', 'interior.js', 'systems.js', 'partnumbers.js', 'app1.js', 'presets.js', 'app2.js']
LIBS = ['build/three.min.js', 'examples/js/controls/OrbitControls.js', 'examples/js/environments/RoomEnvironment.js', 'examples/js/geometries/RoundedBoxGeometry.js', 'examples/js/utils/BufferGeometryUtils.js']
THREE_VERSION = '0.147.0'  # r147: de laatste three.js met de niet-module examples/js (OrbitControls enz.)
CDN = f'https://cdn.jsdelivr.net/npm/three@{THREE_VERSION}/'


def three_dir():
    """Map met het uitgepakte npm-pakket three@THREE_VERSION (dezelfde padlogica als tools/harness.py: THREE_DIR, anders de
    cache van `python3 tools/harness.py --ensure-three`)."""
    d = os.environ.get('THREE_DIR')
    if d and os.path.isfile(os.path.join(d, 'build', 'three.min.js')):
        return d
    return os.path.expanduser(f'~/.cache/laguna/three-{THREE_VERSION}/package')


def integrity(lib):
    """R5: sha384-integriteit van een CDN-bestand, berekend uit het lokale npm-pakket (tools/pubsmoke.py bewaakt dat de CDN
    byte voor byte hetzelfde levert). Zonder pakket stopt de bouw: een pagina zonder integrity zou stil anders zijn."""
    path = os.path.join(three_dir(), lib)
    if not os.path.isfile(path):
        raise SystemExit(f'three.js-bestand {path} ontbreekt voor de integriteitshash; haal het pakket op met: python3 tools/harness.py --ensure-three')
    with open(path, 'rb') as f:
        return 'sha384-' + base64.b64encode(hashlib.sha384(f.read()).digest()).decode()


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


def lint_head(head):
    """Inline scripts in head.html (zoals de foutafhandeling vóór de scripttags) vallen buiten het samengevoegde script;
    ze gaan apart door node --check."""
    errors = []
    node = shutil.which('node')
    if not node:
        return errors
    for i, sc in enumerate(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', head, re.S), 1):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(sc)
            tmp = f.name
        try:
            r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
            if r.returncode != 0:
                errors.append(f'syntaxfout in inline script {i} van head.html:\n' + (r.stderr or r.stdout).strip().replace(tmp, 'head-inline.js'))
        finally:
            os.unlink(tmp)
    return errors


def version(head, js, test=False):
    """Versiestempel: het nummer uit VERSION plus een inhoudshash (7 tekens) van head.html en het samengevoegde script,
    zodat de pagina zelf zegt uit welke bron hij komt. Niet uit HEAD: de commit die index.html bevat bestaat bij het bouwen nog niet."""
    with open(os.path.join(HERE, 'VERSION'), encoding='utf-8') as f:
        num = f.read().strip()
    h = hashlib.sha256((head + '\n' + js).encode('utf-8')).hexdigest()[:7]
    return f'{num} (bron {h}{", testversie" if test else ""})'


# documentgeraamte voor index.html: zonder doctype staat de pagina in quirks-modus en zonder viewport-regel rekent een telefoon
# met 980 px breedte (pubsmoke toetst beide op de Pages-versie)
DOC_HEAD = '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n'
DOC_TAIL = '</body></html>\n'


def page(head, js, prefix, test=False):
    tags = '\n'.join(f'<script src="{prefix}{l}" integrity="{integrity(l)}" crossorigin="anonymous"></script>' for l in LIBS)
    head = head.replace('__LAGUNA_VERSION__', version(head, js, test))
    return f"{head}\n{tags}\n<script>\n{js}\n</script>\n"


def main(argv):
    lint_only = '--lint' in argv
    test_only = '--test-only' in argv
    bare = None
    if '--bare' in argv:
        i = argv.index('--bare')
        if i + 1 >= len(argv) or argv[i + 1].startswith('--'):
            print('--bare vraagt een bestandsnaam', file=sys.stderr)
            return 2
        bare = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    args = [a for a in argv if not a.startswith('--')]
    sources = [(f, read(f)) for f in ORDER]
    errors = lint(sources) + lint_head(read('head.html'))
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
            f.write(DOC_HEAD + page(head, js, CDN) + DOC_TAIL)
        if bare:
            with open(bare, 'w', encoding='utf-8') as f:
                f.write(page(head, js, CDN))
    if args:
        test_dir = args[0]
        os.makedirs(test_dir, exist_ok=True)
        body = page(head, js, 'three/', test=True)
        with open(os.path.join(test_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(DOC_HEAD + body + DOC_TAIL)
    print('ok', 'testversie' if test_only else f'{os.path.getsize(out)} bytes')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

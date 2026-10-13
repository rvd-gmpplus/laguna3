"""Gedeelde testhulp: three.js ophalen, testversie bouwen, lokaal serveren, Chromium starten.

Elk testscript doet:
    from harness import session
    with session() as s:            # bouwt src/ naar een tijdelijke testmap
        pg = s.page(1280, 800)      # laadt index.html, wacht tot window.__laguna er is
        ...
        s.report()                  # console- en paginafouten

Omgevingsvariabelen:
    THREE_DIR   map met het uitgepakte npm-pakket three@0.147.0 (standaard ~/.cache/laguna/three-0.147.0/package)
    CHROMIUM    pad naar een Chromium-binary (standaard /opt/pw-browsers/chromium als die bestaat)
    LAGUNA_TEST bestaande testmap gebruiken in plaats van opnieuw te bouwen
"""
import os, sys, json, time, shutil, tempfile, threading, subprocess, functools, contextlib
import http.server, socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
IGNORE = ('favicon.ico',)


def ensure_three():
    d = os.environ.get('THREE_DIR')
    if d and os.path.isfile(os.path.join(d, 'build', 'three.min.js')):
        return d
    cache = os.path.expanduser('~/.cache/laguna/three-0.147.0')
    pkg = os.path.join(cache, 'package')
    if not os.path.isfile(os.path.join(pkg, 'build', 'three.min.js')):
        os.makedirs(cache, exist_ok=True)
        subprocess.run(['npm', 'pack', 'three@0.147.0'], cwd=cache, check=True, capture_output=True)
        subprocess.run(['tar', 'xzf', 'three-0.147.0.tgz'], cwd=cache, check=True)
    return pkg


def build_test(test_dir=None):
    """Bouwt src/ naar test_dir/index.html met three/ als symlink. Geeft de map terug."""
    test_dir = test_dir or tempfile.mkdtemp(prefix='laguna-test-')
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'build.py'), test_dir], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit('bouw mislukt:\n' + r.stderr + r.stdout)
    link = os.path.join(test_dir, 'three')
    if not os.path.exists(link):
        os.symlink(ensure_three(), link)
    return test_dir


def chromium_path():
    for c in (os.environ.get('CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return c
    return None


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class Session:
    def __init__(self, test_dir):
        from playwright.sync_api import sync_playwright
        self.dir = test_dir
        self.srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(_Quiet, directory=test_dir))
        self.port = self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self._pw = sync_playwright().start()
        exe = chromium_path()
        self.browser = self._pw.chromium.launch(executable_path=exe, args=ARGS) if exe else self._pw.chromium.launch(args=ARGS)
        self.logs = []
        self.load_times = []

    def page(self, w=1280, h=800, scale=1, wait=True, touch=False, timeout=120000):
        ctx = self.browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=scale, has_touch=touch, is_mobile=touch)
        pg = ctx.new_page()
        tag = f'{w}x{h}'

        def on_console(m):
            if m.type in ('error', 'warning') and not any(i in m.text for i in IGNORE):
                loc = m.location or {}
                if 'Failed to load resource' in m.text and any(i in (loc.get('url') or '') for i in IGNORE):
                    return
                self.logs.append(f'[{tag}] {m.type}: {m.text}')
        pg.on('console', on_console)
        pg.on('pageerror', lambda e: self.logs.append(f'[{tag}] PAGEERROR: {e}'))
        t0 = time.time()
        pg.goto(f'http://127.0.0.1:{self.port}/index.html', wait_until='load', timeout=timeout)
        if wait:
            pg.wait_for_function('window.__laguna && window.__laguna.ready !== false', timeout=timeout)
            pg.wait_for_timeout(300)
        self.load_times.append((tag, round(time.time() - t0, 2)))
        return pg

    def errors(self):
        return [l for l in self.logs if 'error' in l.lower() or 'PAGEERROR' in l]

    def report(self):
        for t, s in self.load_times:
            print(f'laadtijd {t}: {s} s')
        if self.logs:
            print(f'{len(self.logs)} console-meldingen:')
            for l in self.logs[:40]:
                print('  ' + l[:400])
        else:
            print('geen console-fouten of -waarschuwingen')

    def close(self):
        try:
            self.browser.close()
            self._pw.stop()
        finally:
            self.srv.shutdown()


@contextlib.contextmanager
def session(test_dir=None):
    d = test_dir or os.environ.get('LAGUNA_TEST') or build_test()
    if not os.path.exists(os.path.join(d, 'three')):
        os.symlink(ensure_three(), os.path.join(d, 'three'))
    s = Session(d)
    try:
        yield s
    finally:
        s.close()


def js(pg, code, *args):
    """Evalueert code in de pagina; code mag een functie-expressie of een expressie zijn."""
    return pg.evaluate(code, *args) if args else pg.evaluate(code)


def screen_pt(pg, node_expr):
    """Schermcoördinaat (CSS-pixels) van het midden van een knoop. node_expr: JS-expressie die een knoop oplevert."""
    return pg.evaluate("""(() => { const n = %s; const w = n.obj.localToWorld(n.lc.clone()); const v = w.project(camera);
        const r = canvas.getBoundingClientRect(); return [r.left + (v.x * 0.5 + 0.5) * r.width, r.top + (-v.y * 0.5 + 0.5) * r.height, v.z]; })()""" % node_expr)

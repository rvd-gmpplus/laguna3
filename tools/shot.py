import sys, time, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
S = sys.argv[1]; OUT = sys.argv[2]
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=S+'/test')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=S+'/test'))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
steps = json.loads(sys.argv[3]) if len(sys.argv) > 3 else []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    for (name, w, h, actions) in steps:
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        logs = []
        pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
        pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
        t0 = time.time()
        pg.goto(f'http://127.0.0.1:{port}/index.html', wait_until='load')
        pg.wait_for_timeout(1500)
        print(name, 'load+1.5s', round(time.time()-t0,1), 's')
        for a in actions:
            if a.startswith('eval:'): print('  eval ->', pg.evaluate(a[5:]))
            elif a.startswith('wait:'): pg.wait_for_timeout(int(a[5:]))
            elif a.startswith('click:'): pg.click(a[6:])
            elif a.startswith('shot:'): pg.screenshot(path=f'{OUT}/{a[5:]}.png', timeout=150000); print('  shot', a[5:])
        for l in logs[:40]: print('  ', l[:300])
        pg.close()
    b.close()
srv.shutdown()

import sys, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
S=sys.argv[1]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=S+'/test')); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width':1000,'height':640})
    logs=[]; pg.on('console', lambda m: logs.append(m.type+': '+m.text)); pg.on('pageerror', lambda e: logs.append('ERR '+str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(1000)
    st = "(()=>{const L=__laguna; return {sel: document.getElementById('selName').textContent, open: L.ALL.filter(n=>n.asm&&n.target).map(n=>n.name)}})()"
    # klik op het midden van de auto (tik = uitklappen)
    box = pg.evaluate("(()=>{const v=new THREE.Vector3(0,0.7,0.2).project(camera); const r=canvas.getBoundingClientRect(); return [(v.x*0.5+0.5)*r.width, (-v.y*0.5+0.5)*r.height]})()")
    pg.mouse.click(box[0], box[1]); pg.wait_for_timeout(300); pg.evaluate("__laguna.finishAll()")
    print('tap1', pg.evaluate(st))
    # tik op de motor (wereldpositie van het motorblok)
    pt = pg.evaluate("(()=>{const n=__laguna.byName('Cilinderblok'); const w=n.obj.localToWorld(n.lc.clone()); const v=w.project(camera); const r=canvas.getBoundingClientRect(); return [(v.x*0.5+0.5)*r.width, (-v.y*0.5+0.5)*r.height]})()")
    pg.mouse.click(pt[0], pt[1]); pg.wait_for_timeout(300); pg.evaluate("__laguna.finishAll()")
    print('tap2', pg.evaluate(st))
    pt = pg.evaluate("(()=>{const n=__laguna.byName('Cilinderblok'); const w=n.obj.localToWorld(n.lc.clone()); const v=w.project(camera); const r=canvas.getBoundingClientRect(); return [(v.x*0.5+0.5)*r.width, (-v.y*0.5+0.5)*r.height]})()")
    pg.mouse.click(pt[0], pt[1]); pg.wait_for_timeout(300); pg.evaluate("__laguna.finishAll()")
    print('tap3', pg.evaluate(st))
    # inklapmodus
    pg.click('[data-mode=collapse]')
    pt = pg.evaluate("(()=>{const n=__laguna.byName('Cilinderblok'); const w=n.obj.localToWorld(n.lc.clone()); const v=w.project(camera); const r=canvas.getBoundingClientRect(); return [(v.x*0.5+0.5)*r.width, (-v.y*0.5+0.5)*r.height]})()")
    pg.mouse.click(pt[0], pt[1]); pg.wait_for_timeout(300); pg.evaluate("__laguna.finishAll()")
    print('collapse', pg.evaluate(st))
    # paneelknoppen
    pg.click('#actToggle'); pg.wait_for_timeout(200); pg.evaluate("__laguna.finishAll()"); print('toggle', pg.evaluate(st))
    pg.click('#tabbtn-tree'); pg.fill('#treeSearch', 'klepveer'); pg.wait_for_timeout(300)
    print('search rows', pg.evaluate("document.querySelectorAll('#tree .trow').length"))
    pg.click('#tree .trow .tn'); pg.wait_for_timeout(300); pg.evaluate("__laguna.finishAll()"); print('reveal', pg.evaluate(st)['sel'], len(pg.evaluate(st)['open']))
    pg.click('#tabbtn-view'); pg.check('#tSys'); pg.check('#tXray'); pg.wait_for_timeout(200)
    print('legend hidden', pg.evaluate("document.getElementById('legend').hidden"))
    pg.click('#btnCollapseAll'); pg.evaluate("__laguna.finishAll()"); print('collapsed all', len(pg.evaluate(st)['open']))
    pg.click('#btnExplodeAll'); pg.evaluate("__laguna.finishAll()"); print('exploded all', len(pg.evaluate(st)['open']), pg.evaluate("__laguna.ALL.filter(n=>n.asm).length"))
    print('labels visible', pg.evaluate("[...document.querySelectorAll('#labels .lbl')].filter(e=>!e.hidden).length"))
    for l in logs[:20]: print(l[:300])
    b.close()
srv.shutdown()

import sys, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
S=sys.argv[1]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=S+'/test')); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width':900,'height':600})
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(1000)
    print(pg.evaluate("""(()=>{const L=window.__laguna; const r=[]; 
      const R = document.getElementById('stage');
      return 'ok'})()"""))
    print(pg.evaluate("""(()=>{ const t=performance.now(); for(let i=0;i<3;i++){ renderer.render(scene,camera);} const gl=renderer.getContext(); gl.finish(); return {ms:(performance.now()-t)/3, calls:renderer.info.render.calls, tris:renderer.info.render.triangles, geos:renderer.info.memory.geometries}; })()"""))
    b.close()
srv.shutdown()

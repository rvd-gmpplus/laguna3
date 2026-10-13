import sys, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
S=sys.argv[1]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=S+'/test')); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width':400,'height':300})
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(800)
    r = pg.evaluate("""(()=>{const out={}; let tot=0; for(const m of window.__laguna.MESHES){const g=m.geometry; const t=(g.index?g.index.count:g.attributes.position.count)/3; tot+=t; const k=(m.userData.node.parent? m.userData.node.parent.name+' / ':'')+m.userData.node.name; out[k]=(out[k]||0)+t;} const arr=Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,25); 
      let byTop={}; for(const m of window.__laguna.MESHES){const g=m.geometry; const t=(g.index?g.index.count:g.attributes.position.count)/3; let n=m.userData.node; while(n.parent&&n.parent.parent) n=n.parent; byTop[n.name]=(byTop[n.name]||0)+t;}
      return {tot, arr, byTop}})()""")
    print(int(r['tot'])); print(json.dumps(r['byTop'])); 
    for k,v in r['arr']: print(int(v), k)
    b.close()
srv.shutdown()

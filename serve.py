# Local dev server that never lets the browser cache game files (so a refresh always runs the latest code)
import http.server, socketserver, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', 8765), H) as s:
    print('Ardenvale running at http://localhost:8765')
    s.serve_forever()

# Local dev server: multi-threaded and never lets the browser cache game files
import http.server, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *a):
        pass
http.server.ThreadingHTTPServer.allow_reuse_address = True
s = http.server.ThreadingHTTPServer(('', 8765), H)
s.daemon_threads = True
print('Ardenvale running at http://localhost:8765')
s.serve_forever()

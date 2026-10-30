"""Run: python3 preview_server.py, then open http://localhost:1804/proj4/
Serves the whole cs180 folder (so ../assets works) and reloads the page when files change."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
ROOT = Path(__file__).resolve().parent.parent
WATCH = ROOT / 'proj4'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        if self.path.split('?')[0] == '/__preview_revision':
            files = [p for p in [*WATCH.glob('*'), *WATCH.glob('results/**/*'), *(ROOT / 'assets').rglob('*')] if p.is_file() and p.suffix.lower() in {'.html','.css','.js','.png','.jpg','.jpeg','.webp','.svg','.json'}]
            value = 'revision:' + hashlib.sha256(str(sorted((str(p.relative_to(ROOT)), p.stat().st_mtime_ns, p.stat().st_size) for p in files)).encode()).hexdigest()
            self.send_response(200)
            self.send_header('Content-Type','text/plain')
            self.send_header('Cache-Control','no-store')
            self.end_headers()
            self.wfile.write(value.encode())
        else:
            super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        super().end_headers()
    def log_message(self, format, *args):
        if args and ('__preview_revision' in str(args[0]) or '/results/' in str(args[0])): return
        super().log_message(format,*args)
if __name__ == '__main__':
    print('Preview: http://localhost:1804/proj4/ (refreshes when files change)',flush=True)
    ThreadingHTTPServer(('127.0.0.1',1804),Handler).serve_forever()

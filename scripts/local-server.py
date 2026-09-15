"""Local PlanMark static files and native PNG Save As only."""
import argparse, base64, json, os, secrets, subprocess
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
ROOT=Path(__file__).resolve().parents[1]
MAX_BODY=32*1024*1024
class ExportFailure(Exception):
    pass
class ExportService:
    def __init__(self):
        self.root=ROOT
        self.token=secrets.token_urlsafe(32)

def make_handler(service):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(service.root), **kwargs)

        def send_json(self, value, code=200):
            body = json.dumps(value, ensure_ascii=False).encode('utf-8')
            self.send_response(code)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def allowed(self, token=True):
            expected = f'127.0.0.1:{self.server.server_port}'
            if self.headers.get('Host') != expected:
                return False
            origin = self.headers.get('Origin')
            if origin and origin != 'http://' + expected:
                return False
            if self.headers.get('Sec-Fetch-Site') == 'cross-site':
                return False
            return not token or secrets.compare_digest(self.headers.get('X-PlanMark-Token', ''), service.token)

        def do_GET(self):
            if not self.allowed(False):
                return self.send_json({'error':'拒绝跨来源请求'},403)
            if self.path == '/api/export-config':
                return self.send_json({'token': service.token}) if self.allowed(False) else self.send_json({'error':'拒绝跨来源请求'},403)
            return super().do_GET()

        def do_HEAD(self):
            if not self.allowed(False):
                self.send_response(403)
                self.end_headers()
                return
            return super().do_HEAD()

        def list_directory(self, path):
            self.send_error(403, 'Directory listing disabled')
            return None

        def translate_path(self, path):
            resolved = Path(super().translate_path(path)).resolve()
            if not resolved.is_relative_to(service.root.resolve()) or any(part.startswith('.') for part in resolved.relative_to(service.root.resolve()).parts):
                return str(service.root / '__blocked__' / 'missing')
            return str(resolved)

        def do_POST(self):
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= MAX_BODY:
                    return self.send_json({'error':'请求太大或为空'},413)
                self.connection.settimeout(10)
                raw_body = self.rfile.read(size)
                if not self.allowed():
                    return self.send_json({'error':'无效请求'},403)
                if self.path != '/api/export-png':
                    return self.send_json({'error':'未知接口'},404)
                data = json.loads(raw_body)
                if self.path == '/api/export-png':
                    png = data.get('png', '')
                    if not isinstance(png, str) or not png.startswith('data:image/png;base64,'):
                        raise ValueError('缺少 PNG')
                    raw = base64.b64decode(png.split(',', 1)[1], validate=True)
                    if not raw.startswith(b'\x89PNG\r\n\x1a\n'):
                        raise ValueError('无效 PNG')
                    name = data.get('name', 'final.png')
                    if not isinstance(name, str) or Path(name).name != name:
                        raise ValueError('无效文件名')
                    # Separate process keeps Tk on its own main thread. Native dialog asks before overwriting.
                    dialog = "import tkinter as t;from tkinter import filedialog;import sys,json;r=t.Tk();r.withdraw();r.attributes('-topmost',True);p=filedialog.asksaveasfilename(parent=r,title='导出 PNG',initialdir=sys.argv[1],initialfile=sys.argv[2],defaultextension='.png',filetypes=[('PNG 图片','*.png')]);print(json.dumps(p));r.destroy()"
                    import sys
                    chosen = subprocess.run([sys.executable, '-c', dialog, str(service.root), name], capture_output=True, timeout=600, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
                    if chosen.returncode:
                        raise ExportFailure('无法打开系统另存为窗口')
                    target = json.loads(chosen.stdout.decode('ascii'))
                    if not target:
                        return self.send_json({'cancelled': True})
                    Path(target).write_bytes(raw)
                    return self.send_json({'path': target})

            except ExportFailure as error:
                return self.send_json({'error':str(error)},409)
            except (ValueError, TypeError, KeyError, AttributeError):
                return self.send_json({'error':'提交数据无效'},400)
            except Exception:
                return self.send_json({'error':'PNG 保存失败，请重试'},500)
    return Handler


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=8766)
    args=parser.parse_args()
    service=ExportService()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),make_handler(service))
    print(f'PlanMark: http://127.0.0.1:{args.port}',flush=True)
    server.serve_forever()

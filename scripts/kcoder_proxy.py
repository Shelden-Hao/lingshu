"""Local shim: Pi sends /v1/chat/completions -> KCoder expects POST /KCoder directly."""
import json, urllib.request, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

UPSTREAM = "https://coder.cnki.net/KCoder"

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(n)
        # KCoder only accepts low/high/xhigh/max (or int) for reasoning_effort
        try:
            payload = json.loads(body)
            for key in ('reasoning_effort',):
                if key in payload and str(payload[key]).lower() not in ('low','high','xhigh','max'):
                    payload[key] = 'high'
            if isinstance(payload.get('reasoning'), dict):
                e = payload['reasoning'].get('effort')
                if e is not None and str(e).lower() not in ('low','high','xhigh','max','medium'):
                    payload['reasoning']['effort'] = 'high'
            body = json.dumps(payload).encode()
        except Exception:
            pass
        print(f"[proxy] {self.path} -> {UPSTREAM} body={len(body)}b", flush=True)
        req = urllib.request.Request(UPSTREAM, data=body, method='POST', headers={
            'Content-Type': 'application/json',
            'Authorization': self.headers.get('Authorization', ''),
        })
        try:
            with urllib.request.urlopen(req, timeout=120, context=None) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except Exception as e:
            print(f"[proxy] ERROR {e}", flush=True)
            self.send_response(502)
            self.end_headers()
            self.wfile.write(str(e).encode())

    def log_message(self, *a): pass

print("KCoder shim listening on 127.0.0.1:8899", flush=True)
HTTPServer(('127.0.0.1', 8899), Handler).serve_forever()

import http.server
import socketserver
import json
import sqlite3
import urllib.parse
import os
import sys

PORT = 8000
DB_FILE = 'enquiries.db'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            service TEXT,
            domain TEXT,
            contact_method TEXT,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    print(f"[DB] Initialized database: {DB_FILE}")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == '/api/enquiries':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, name, email, phone, service, domain, contact_method, message, 
                           strftime('%Y-%m-%d %H:%M:%S', created_at) as created_at 
                    FROM enquiries 
                    ORDER BY id DESC
                ''')
                rows = cursor.fetchall()
                conn.close()

                enquiries = []
                for row in rows:
                    enquiries.append({
                        "id": row[0],
                        "name": row[1],
                        "email": row[2],
                        "phone": row[3],
                        "service": row[4],
                        "domain": row[5],
                        "contact_method": row[6],
                        "message": row[7],
                        "created_at": row[8]
                    })

                self.wfile.write(json.dumps(enquiries).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        # Default static file serving
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path in ['/api/enquiry', '/api/contact']:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            data = {}
            try:
                data = json.loads(body)
            except Exception:
                # Fallback form-encoded
                parsed_body = urllib.parse.parse_qs(body)
                for k, v in parsed_body.items():
                    data[k] = v[0] if v else ''

            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()
            service = data.get('service', 'General Enquiry').strip()
            domain = data.get('domain', '').strip()
            contact_method = data.get('contact_method', 'Email').strip()
            message = data.get('message', '').strip()

            if not name or not email or not phone:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Name, Email, and Phone are required."}).encode('utf-8'))
                return

            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO enquiries (name, email, phone, service, domain, contact_method, message)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (name, email, phone, service, domain, contact_method, message))
                conn.commit()
                new_id = cursor.lastrowid
                conn.close()

                print(f"[DB INSERT] Saved enquiry ID #{new_id} for {name} ({email})")

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Enquiry saved successfully!", "id": new_id}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        if path == '/api/enquiry' and 'id' in query:
            enquiry_id = query['id'][0]
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM enquiries WHERE id = ?', (enquiry_id,))
                conn.commit()
                conn.close()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": f"Deleted enquiry #{enquiry_id}"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

def run_server():
    init_db()
    port = int(os.environ.get('PORT', PORT))
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    handler = CustomHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"[SERVER] Running HiPapa Server with SQLite DB on http://localhost:{port}")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()

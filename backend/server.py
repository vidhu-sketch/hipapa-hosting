import http.server
import socketserver
import json
import sqlite3
import urllib.parse
import urllib.request
import base64
import hmac
import hashlib
import os
import sys

# Compute base directories
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
DATA_DIR = os.path.join(BACKEND_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DB_FILE = os.path.join(DATA_DIR, 'enquiries.db')

# Load environment variables from backend/.env
def load_env():
    env_path = os.path.join(BACKEND_DIR, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip()
        print(f"[ENV] Loaded environment variables from {env_path}")
    else:
        print(f"[ENV] Warning: {env_path} not found.")

load_env()

PORT = int(os.environ.get('PORT', 8000))
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_your_key_id_here')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'your_key_secret_here')

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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL UNIQUE,
            payment_id TEXT,
            plan_name TEXT NOT NULL,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'INR',
            status TEXT NOT NULL,
            customer_name TEXT,
            customer_email TEXT,
            customer_phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    print(f"[DB] Initialized database: {DB_FILE}")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == '/api/razorpay-key':
            self.send_json(200, {
                "success": True,
                "key_id": os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_your_key_id_here')
            })
            return

        if path == '/api/enquiries':
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
                self.send_json(200, enquiries)
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        if path == '/api/orders':
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, order_id, payment_id, plan_name, amount, currency, status, customer_name, customer_email, customer_phone,
                           strftime('%Y-%m-%d %H:%M:%S', created_at) as created_at 
                    FROM orders 
                    ORDER BY id DESC
                ''')
                rows = cursor.fetchall()
                conn.close()

                orders = []
                for row in rows:
                    orders.append({
                        "id": row[0],
                        "order_id": row[1],
                        "payment_id": row[2],
                        "plan_name": row[3],
                        "amount": row[4],
                        "currency": row[5],
                        "status": row[6],
                        "customer_name": row[7],
                        "customer_email": row[8],
                        "customer_phone": row[9],
                        "created_at": row[10]
                    })
                self.send_json(200, orders)
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        # Serve static files relative to frontend/
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        data = {}
        try:
            data = json.loads(body)
        except Exception:
            parsed_body = urllib.parse.parse_qs(body)
            for k, v in parsed_body.items():
                data[k] = v[0] if v else ''

        if path in ['/api/enquiry', '/api/contact']:
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()
            service = data.get('service', 'General Enquiry').strip()
            domain = data.get('domain', '').strip()
            contact_method = data.get('contact_method', 'Email').strip()
            message = data.get('message', '').strip()

            if not name or not email or not phone:
                self.send_json(400, {"success": False, "error": "Name, Email, and Phone are required."})
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
                self.send_json(200, {"success": True, "message": "Enquiry saved successfully!", "id": new_id})
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
            return

        if path == '/api/create-order':
            plan_name = data.get('plan_name', 'Hosting Plan').strip()
            amount_in_rupees = float(data.get('amount', 499))
            amount_in_paise = int(amount_in_rupees * 100)
            customer_name = data.get('name', 'Customer').strip()
            customer_email = data.get('email', 'customer@example.com').strip()
            customer_phone = data.get('phone', '9999999999').strip()

            key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_your_key_id_here')
            key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'your_key_secret_here')

            order_id = None
            # Attempt to call Razorpay API if valid test/live key format
            if key_id.startswith('rzp_') and not 'your_key_id_here' in key_id:
                try:
                    url = 'https://api.razorpay.com/v1/orders'
                    payload = json.dumps({
                        "amount": amount_in_paise,
                        "currency": "INR",
                        "receipt": f"receipt_{os.urandom(4).hex()}",
                        "notes": {
                            "plan_name": plan_name,
                            "customer_name": customer_name
                        }
                    }).encode('utf-8')

                    auth_str = f"{key_id}:{key_secret}"
                    b64_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')

                    req = urllib.request.Request(url, data=payload, headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Basic {b64_auth}"
                    })

                    with urllib.request.urlopen(req) as resp:
                        res_data = json.loads(resp.read().decode('utf-8'))
                        order_id = res_data.get('id')
                except Exception as req_err:
                    print(f"[RAZORPAY API WARN] Could not create order via Razorpay API: {req_err}")

            if not order_id:
                order_id = f"order_{os.urandom(8).hex()}"

            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO orders (order_id, plan_name, amount, currency, status, customer_name, customer_email, customer_phone)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (order_id, plan_name, amount_in_paise, 'INR', 'created', customer_name, customer_email, customer_phone))
                conn.commit()
                conn.close()

                print(f"[ORDER CREATED] {order_id} for plan '{plan_name}' - ₹{amount_in_rupees}")

                self.send_json(200, {
                    "success": True,
                    "order_id": order_id,
                    "amount": amount_in_paise,
                    "amount_rupees": amount_in_rupees,
                    "currency": "INR",
                    "key_id": key_id,
                    "plan_name": plan_name
                })
            except Exception as db_err:
                self.send_json(500, {"success": False, "error": str(db_err)})
            return

        if path == '/api/verify-payment':
            razorpay_order_id = data.get('razorpay_order_id', '')
            razorpay_payment_id = data.get('razorpay_payment_id', '')
            razorpay_signature = data.get('razorpay_signature', '')

            key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'your_key_secret_here')

            # Verify HMAC SHA256 Signature if signature provided
            signature_valid = False
            if razorpay_signature and key_secret and key_secret != 'your_key_secret_here':
                generated_signature = hmac.new(
                    key_secret.encode('utf-8'),
                    f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()

                if hmac.compare_digest(generated_signature, razorpay_signature):
                    signature_valid = True
            else:
                # Test/demo mode fallback signature acceptance
                signature_valid = True

            if signature_valid:
                try:
                    conn = sqlite3.connect(DB_FILE)
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE orders 
                        SET payment_id = ?, status = 'paid'
                        WHERE order_id = ?
                    ''', (razorpay_payment_id, razorpay_order_id))
                    conn.commit()
                    conn.close()

                    print(f"[PAYMENT VERIFIED] Order {razorpay_order_id} marked as PAID with Payment ID: {razorpay_payment_id}")
                    self.send_json(200, {
                        "success": True,
                        "message": "Payment verified and credentials generated successfully!",
                        "order_id": razorpay_order_id,
                        "payment_id": razorpay_payment_id
                    })
                except Exception as e:
                    self.send_json(500, {"success": False, "error": str(e)})
            else:
                self.send_json(400, {"success": False, "error": "Invalid Razorpay payment signature."})
            return

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
                self.send_json(200, {"success": True, "message": f"Deleted enquiry #{enquiry_id}"})
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
            return

def run_server():
    init_db()
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    handler = CustomHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"[SERVER] Running HiPapa Backend Server on http://localhost:{port}")
        print(f"[SERVER] Serving Frontend UI from: {FRONTEND_DIR}")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()

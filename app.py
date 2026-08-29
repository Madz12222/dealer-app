import os
import random
import sqlite3
import requests
from datetime import datetime
from flask import Flask, render_template_string, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = os.urandom(24)

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

otp_storage = {}

# IDSPay Production Credentials & Endpoint
IDSPAY_URL = "https://javabackend.idspay.in/api/v1/prod/Rc-Premium-v2-verify"
API_ID = "APID3192"
API_KEY = "99310f2f-6808-4da5-be3e-84143ed8228d"
TOKEN_ID = "9PCAflhNoBWFLnUEQuicQuYkkn2ZANd4"

# Admin configuration
ADMIN_MOBILE = "8122252222"

def get_db():
    conn = sqlite3.connect('dealer_app.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS dealers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        mobile TEXT UNIQUE,
        credits INTEGER DEFAULT 5,
        status TEXT DEFAULT 'Active',
        payment_proof TEXT,
        is_verified INTEGER DEFAULT 0,
        bonus_claimed INTEGER DEFAULT 0
    )
    ''')
    conn.execute('''
    CREATE TABLE IF NOT EXISTS welcome_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT UNIQUE,
        mobile TEXT
    )
    ''')
    conn.execute('''
    CREATE TABLE IF NOT EXISTS club_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dealer_mobile TEXT,
        vehicle_number TEXT,
        search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.execute('''
    CREATE TABLE IF NOT EXISTS recharge_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dealer_mobile TEXT,
        amount INTEGER,
        credits_added INTEGER,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    try:
        conn.execute('ALTER TABLE dealers ADD COLUMN is_verified INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass
        
    try:
        conn.execute('ALTER TABLE dealers ADD COLUMN bonus_claimed INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    conn.close()

init_db()

def fetch_rc_from_idspay(vehicle_number):
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "api_id": API_ID,
        "api_key": API_KEY,
        "token_id": TOKEN_ID,
        "vehicle_num": vehicle_number.upper().strip()
    }
    try:
        response = requests.post(IDSPAY_URL, json=payload, headers=headers, timeout=15)
        if response.status_code == 200:
            res_json = response.json()
            
            data_node = res_json.get("data")
            if not data_node:
                return {"error": "Invalid API Response", "message": res_json.get("message", "No data field found")}
            
            actual_data = data_node.get("data", data_node)
            if not isinstance(actual_data, dict):
                actual_data = {"response": str(actual_data)}
            
            mobile_no = data_node.get("mobileNo") or actual_data.get("mobileNo") or actual_data.get("mobileNumber")
            if mobile_no:
                actual_data["mobileNumber"] = mobile_no
            
            cleaned_rc = {}
            for k, v in actual_data.items():
                if k not in ["api_id", "api_key", "token_id"]:
                    cleaned_rc[str(k)] = v if v is not None else "N/A"
            
            return cleaned_rc
        
        return {
            "regNo": vehicle_number.upper(),
            "error": f"API HTTP Error {response.status_code}",
            "details": response.text
        }
    except Exception as e:
        return {
            "regNo": vehicle_number.upper(),
            "error": "Connection Exception",
            "details": str(e)
        }

LOGIN_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head><title>Login - Cosmogems Club</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif; background:#f4f4f9; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
<div style="background:white; padding:30px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); width:100%; max-width:350px; text-align:center;">
<h2 style="color:#0056b3;">Cosmogems Club</h2>
<p style="color:#666; font-size:14px;">Enter your mobile number to generate OTP.</p>
{% if msg %}<p style="color:red; font-size:13px;">{{ msg }}</p>{% endif %}
<form method="POST">
<input type="text" name="mobile" placeholder="10-digit mobile number" required style="width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
<button type="submit" style="width:100%; background:#0056b3; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">Generate OTP</button>
</form>
</div>
</body>
</html>
'''

VERIFY_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head><title>Verify OTP - Cosmogems Club</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif; background:#f4f4f9; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
<div style="background:white; padding:30px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); width:100%; max-width:350px; text-align:center;">
<h2 style="color:#0056b3;">Verify OTP</h2>
<p style="color:#666; font-size:14px;">Generated OTP for {{ mobile }}:</p>
<div style="font-size:28px; font-weight:bold; color:#28a745; background:#e8f5e9; padding:10px; border-radius:5px; margin:10px 0; letter-spacing:5px;">{{ debug_otp }}</div>
{% if msg %}<p style="color:red; font-size:13px;">{{ msg }}</p>{% endif %}
<form method="POST">
<input type="text" name="otp" placeholder="Enter 4-digit OTP" required style="width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:5px; box-sizing:border-box; text-align:center; font-size:18px; letter-spacing:5px;">
<button type="submit" style="width:100%; background:#28a745; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">Verify & Login</button>
</form>
</div>
</body>
</html>
'''

DASHBOARD_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head><title>Dealer Dashboard - Cosmogems Club</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif; background:#f4f4f9; margin:0; padding:15px;">
<div style="max-width:550px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

<div style="display:flex; justify-content:space-between; align-items:center; background:#007bff; padding:12px 15px; border-radius:8px; color:white; margin-bottom:20px;">
<div>
<div style="font-size:12px; opacity:0.9;">WALLET</div>
<div style="font-size:20px; font-weight:bold;">{{ dealer.credits }} Checks</div>
</div>
<div>
{% if is_admin %}
<a href="/admin" style="background:#dc3545; color:white; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px; margin-right:5px;">🛡️ Admin Panel</a>
{% endif %}
<a href="#recharge" style="background:#ffc107; color:#000; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px;">Recharge</a>
<a href="/dealer/logout" style="color:white; text-decoration:none; font-size:13px; margin-left:8px;">Logout</a>
</div>
</div>

<div style="background:white; border:1px solid #ddd; padding:15px; border-radius:8px; margin-bottom:20px;">
<h3 style="margin-top:0; color:#333; font-size:18px;">Instant RC Lookup</h3>
<p style="font-size:13px; color:#666; margin-bottom:8px;">Dealer Mobile: <b>{{ dealer.mobile }}</b></p>

{% if msg %}<div style="background:#ffdddd; color:#d8000c; padding:10px; border-radius:5px; margin-bottom:15px; font-size:13px;">{{ msg }}</div>{% endif %}

<form method="POST">
<label style="font-weight:bold; font-size:13px; display:block; margin-bottom:5px;">Vehicle Registration Number</label>
<input type="text" name="vehicle_number" value="{{ searched_num }}" placeholder="e.g. TN10BZ8419" required style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box; text-transform:uppercase; font-size:15px; font-weight:bold;">
<button type="submit" style="width:100%; background:#198754; color:white; border:none; padding:12px; border-radius:5px; font-weight:bold; font-size:15px; cursor:pointer;">🔍 Check Vehicle (-1 Credit)</button>
</form>
</div>

{% if rc_data %}
<div style="background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:8px; margin-bottom:20px;">
<h4 style="margin:0 0 10px 0; color:#004085; border-bottom:1px solid #b8daff; padding-bottom:5px;">Live RC Details (IDSPay API)</h4>
<table style="width:100%; font-size:13px; color:#333; border-collapse:collapse;">
{% for key, value in rc_data.items() %}
<tr style="border-bottom:1px solid #d0e1fd;">
<td style="padding:6px 0; font-weight:bold; text-transform:capitalize; width:45%;">{{ key.replace('_', ' ') }}</td>
<td style="padding:6px 0; text-align:right; {% if 'mobile' in key.lower() and value and value != 'N/A' %}color:#0d6efd; font-weight:bold; font-size:14px;{% endif %}">
{{ value }}
</td>
</tr>
{% endfor %}
</table>
</div>
{% endif %}

<div id="recharge" style="background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:8px;">
<h4 style="color:#856404; margin:0 0 10px 0; text-align:center;">Recharge Credits / Packages</h4>
<div style="display:flex; justify-content:space-between; gap:6px; margin-bottom:12px;">
<div onclick="showBankDetails('₹300', '1', 300)" style="flex:1; background:white; padding:8px; border-radius:5px; border:2px solid #17a2b8; text-align:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
<b style="color:#333; font-size:13px;">₹300</b>
<p style="margin:4px 0 0 0; color:#17a2b8; font-weight:bold; font-size:11px;">1 Credit</p>
<span style="font-size:9px; color:#666; display:block; margin-top:2px;">Select ➔</span>
</div>
<div onclick="showBankDetails('₹2,000', '10', 2000)" style="flex:1; background:white; padding:8px; border-radius:5px; border:2px solid #ffc107; text-align:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
<b style="color:#333; font-size:13px;">₹2,000</b>
<p style="margin:4px 0 0 0; color:#0056b3; font-weight:bold; font-size:11px;">10 Credits</p>
<span style="font-size:9px; color:#666; display:block; margin-top:2px;">Select ➔</span>
</div>
<div onclick="showBankDetails('₹5,000', '40', 5000)" style="flex:1; background:white; padding:8px; border-radius:5px; border:2px solid #28a745; text-align:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
<b style="color:#333; font-size:13px;">₹5,000</b>
<p style="margin:4px 0 0 0; color:#28a745; font-weight:bold; font-size:11px;">40 Credits</p>
<span style="font-size:9px; color:#666; display:block; margin-top:2px;">Select ➔</span>
</div>
</div>

<div id="bankDetailsBox" style="display:none; background:white; border:2px dashed #0d6efd; padding:12px; border-radius:6px; margin-top:10px; text-align:center;">
<h5 id="selectedPackageTitle" style="margin:0 0 5px 0; color:#0d6efd; font-size:15px;"></h5>
<p style="margin:4px 0; font-size:13px; color:#333;"><b>UPI ID / VPA:</b> <span id="upiIdText" style="color:#d63384; font-family:monospace; font-size:15px; font-weight:bold;">madhansampath@kvb</span></p>
<p style="margin:4px 0; font-size:12px; color:#555;"><b>Beneficiary Name:</b> Madhan Sampath</p>
<a id="whatsappBtn" href="#" target="_blank" style="display:block; text-align:center; background:#28a745; color:white; padding:8px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:13px; margin-top:8px;">📲 Send Payment Proof on WhatsApp</a>
</div>
</div>

</div>
<script>
function showBankDetails(amount, credits, amountNum) {
    var box = document.getElementById('bankDetailsBox');
    var title = document.getElementById('selectedPackageTitle');
    var whatsappBtn = document.getElementById('whatsappBtn');
    title.innerText = "Selected: " + amount + " (" + credits + " Credits)";
    box.style.display = 'block';
    var dealerMobile = "{{ dealer.mobile }}";
    var msg = "Hello Admin, I have completed the payment of " + amount + " for " + credits + " Credits. UPI ID: madhansampath@kvb. Dealer Mobile: " + dealerMobile;
    whatsappBtn.href = "https://wa.me/?text=" + encodeURIComponent(msg);
    box.scrollIntoView({ behavior: 'smooth' });
}
</script>
</body>
</html>
'''

ADMIN_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head><title>Admin Panel - Cosmogems Club</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif; background:#f4f4f9; margin:0; padding:15px;">
<div style="max-width:850px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

<div style="display:flex; justify-content:space-between; align-items:center; background:#343a40; padding:12px 15px; border-radius:8px; color:white; margin-bottom:20px;">
<h2 style="margin:0; font-size:18px;">🛡️ Admin Command Panel</h2>
<div>
<a href="/dealer/dashboard" style="background:#007bff; color:white; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px; margin-right:5px;">🏠 Dashboard</a>
<a href="/dealer/logout" style="background:#dc3545; color:white; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px;">Logout</a>
</div>
</div>

<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
<div style="flex:1; background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:8px; text-align:center;">
<div style="font-size:11px; color:#004085; font-weight:bold;">TOTAL DEALERS</div>
<div style="font-size:22px; font-weight:bold; color:#0056b3; margin-top:5px;">{{ total_dealers }}</div>
</div>
<div style="flex:1; background:#e2f0d9; border:1px solid #c3e6cb; padding:15px; border-radius:8px; text-align:center;">
<div style="font-size:11px; color:#155724; font-weight:bold;">TOTAL CHECKS</div>
<div style="font-size:22px; font-weight:bold; color:#28a745; margin-top:5px;">{{ total_searches }}</div>
</div>
<div style="flex:1; background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:8px; text-align:center;">
<div style="font-size:11px; color:#856404; font-weight:bold;">TOTAL REVENUE</div>
<div style="font-size:22px; font-weight:bold; color:#856404; margin-top:5px;">₹{{ total_revenue }}</div>
</div>
</div>

<div style="background:#f8f9fa; border:1px solid #ced4da; padding:15px; border-radius:8px; margin-bottom:20px;">
<h3 style="margin-top:0; color:#333; font-size:15px;">📅 Filter Daily Collection & History by Date</h3>
<form method="GET" action="/admin" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
<input type="date" name="filter_date" value="{{ selected_date }}" style="padding:8px; border:1px solid #ccc; border-radius:5px; font-size:13px;">
<button type="submit" style="background:#0d6efd; color:white; border:none; padding:9px 15px; border-radius:5px; font-weight:bold; font-size:13px; cursor:pointer;">Filter Date</button>
<a href="/admin" style="background:#6c757d; color:white; padding:9px 15px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px;">Reset Filter</a>
</form>
<div style="margin-top:10px; font-size:14px; color:#333;">
Collection for <b>{{ selected_date }}</b>: <span style="color:#28a745; font-weight:bold; font-size:16px;">₹{{ date_revenue }}</span>
</div>
</div>

<div style="background:#eef2f7; border:1px solid #cbd5e1; padding:15px; border-radius:8px; margin-bottom:20px;">
<h3 style="margin-top:0; color:#1e293b; font-size:15px;">⚡ Custom Credit Sender (Any Mobile Number)</h3>
{% if recharge_msg %}<div style="background:#d1e7dd; color:#0f5132; padding:8px; border-radius:5px; margin-bottom:10px; font-size:13px;">{{ recharge_msg }}</div>{% endif %}
<form method="POST" action="/admin/send-custom-credits" style="display:flex; gap:10px; flex-wrap:wrap;">
<input type="text" name="target_mobile" placeholder="Enter 10-digit Mobile" required style="flex:1; min-width:180px; padding:9px; border:1px solid #ccc; border-radius:5px; font-size:13px;">
<select name="package_type" style="flex:1; min-width:160px; padding:9px; border:1px solid #ccc; border-radius:5px; font-size:13px; background:white;">
<option value="300_1">₹300 (1 Credit)</option>
<option value="2000_10">₹2,000 (10 Credits)</option>
<option value="5000_40">₹5,000 (40 Credits)</option>
</select>
<button type="submit" style="background:#198754; color:white; border:none; padding:9px 15px; border-radius:5px; font-weight:bold; font-size:13px; cursor:pointer;">Add Credits & Log Revenue</button>
</form>
</div>

<div style="background:#f8f9fa; border:1px solid #ced4da; padding:15px; border-radius:8px; margin-bottom:20px;">
<h3 style="margin-top:0; color:#333; font-size:15px;">🔍 Admin Free Vehicle Lookup (0 Credits Deducted)</h3>
{% if msg %}<div style="background:#ffdddd; color:#d8000c; padding:8px; border-radius:5px; margin-bottom:10px; font-size:13px;">{{ msg }}</div>{% endif %}
<form method="POST">
<input type="text" name="admin_vehicle_number" value="{{ searched_num }}" placeholder="Enter Vehicle Number (e.g. TN10BZ8419)" required style="width:72%; padding:9px; border:1px solid #ccc; border-radius:5px; font-size:13px; font-weight:bold; text-transform:uppercase;">
<button type="submit" style="width:26%; background:#dc3545; color:white; border:none; padding:9px; border-radius:5px; font-weight:bold; font-size:13px; cursor:pointer; float:right;">Lookup Free</button>
</form>
<div style="clear:both;"></div>
</div>

{% if rc_data %}
<div style="background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:8px; margin-bottom:20px;">
<h4 style="margin:0 0 10px 0; color:#004085; border-bottom:1px solid #b8daff; padding-bottom:5px;">Live RC Data Output</h4>
<table style="width:100%; font-size:13px; color:#333; border-collapse:collapse;">
{% for key, value in rc_data.items() %}
<tr style="border-bottom:1px solid #d0e1fd;">
<td style="padding:6px 0; font-weight:bold; text-transform:capitalize; width:45%;">{{ key.replace('_', ' ') }}</td>
<td style="padding:6px 0; text-align:right;">{{ value }}</td>
</tr>
{% endfor %}
</table>
</div>
{% endif %}

<h3 style="color:#333; font-size:15px; margin-bottom:8px;">Registered Dealers & Live Credit Balance</h3>
<table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
<thead>
<tr style="background:#343a40; color:white;">
<th style="padding:8px;">Mobile</th>
<th style="padding:8px;">Status</th>
<th style="padding:8px;">Credits Left</th>
<th style="padding:8px; text-align:center;">Quick Action</th>
</tr>
</thead>
<tbody>
{% for d in dealers %}
<tr style="border-bottom:1px solid #dee2e6;">
<td style="padding:8px; font-weight:bold;">{{ d.mobile }}</td>
<td style="padding:8px;">{{ d.status }}</td>
<td style="padding:8px; font-weight:bold; color:#0d6efd;">{{ d.credits }} Credits</td>
<td style="padding:8px; text-align:center;">
<a href="/admin/send-credits-quick?mobile={{ d.mobile }}" style="background:#ffc107; color:black; padding:4px 8px; border-radius:4px; text-decoration:none; font-weight:bold; font-size:11px;">+10 Credits (₹2,000)</a>
</td>
</tr>
{% endfor %}
</tbody>
</table>

</div>
</body>
</html>
'''

@app.route('/')
def home():
    if 'dealer_mobile' in session:
        return redirect(url_for('dealer_dashboard'))
    return redirect(url_for('dealer_login'))

@app.route('/dealer/login', methods=['GET', 'POST'])
def dealer_login():
    msg = ""
    if request.method == 'POST':
        mobile = request.form.get('mobile')
        if mobile and len(mobile.strip()) >= 10:
            conn = get_db()
            dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
            if not dealer:
                conn.execute('INSERT INTO dealers (mobile, name, credits, status, is_verified, bonus_claimed) VALUES (?, ?, 5, "Active", 0, 0)', (mobile, 'Dealer'))
                conn.commit()
            conn.close()

            otp = str(random.randint(1000, 9999))
            otp_storage[mobile] = otp
            session['pending_mobile'] = mobile
            return redirect(url_for('verify_otp'))
        else:
            msg = "Please enter a valid 10-digit mobile number."
    return render_template_string(LOGIN_TEMPLATE, msg=msg)

@app.route('/dealer/verify-otp', methods=['GET', 'POST'])
def verify_otp():
    msg = ""
    mobile = session.get('pending_mobile')
    if not mobile:
        return redirect(url_for('dealer_login'))

    device_id = request.cookies.get('device_token')
    if not device_id:
        device_id = request.remote_addr + "_" + request.headers.get('User-Agent', 'unknown')[:30]

    if request.method == 'POST':
        entered_otp = request.form.get('otp')
        if otp_storage.get(mobile) and otp_storage.get(mobile) == entered_otp.strip():
            session.pop('pending_mobile', None)
            session['dealer_mobile'] = mobile
            otp_storage.pop(mobile, None)

            conn = get_db()
            dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
            device_claimed = conn.execute('SELECT * FROM welcome_logs WHERE device_id = ?', (device_id,)).fetchone()

            if dealer and not dealer['bonus_claimed'] and not device_claimed:
                conn.execute('UPDATE dealers SET credits = 5, bonus_claimed = 1, is_verified = 1 WHERE mobile = ?', (mobile,))
                conn.execute('INSERT INTO welcome_logs (device_id, mobile) VALUES (?, ?)', (device_id, mobile))
                conn.commit()
            elif dealer and not dealer['is_verified']:
                conn.execute('UPDATE dealers SET is_verified = 1 WHERE mobile = ?', (mobile,))
                conn.commit()
            
            conn.close()

            resp = redirect(url_for('dealer_dashboard'))
            resp.set_cookie('device_token', device_id, max_age=60*60*24*365)
            return resp
        else:
            msg = "Invalid OTP."

    return render_template_string(VERIFY_TEMPLATE, msg=msg, mobile=mobile, debug_otp=otp_storage.get(mobile, ''))

@app.route('/dealer/dashboard', methods=['GET', 'POST'])
def dealer_dashboard():
    if 'dealer_mobile' not in session:
        return redirect(url_for('dealer_login'))

    conn = get_db()
    dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (session['dealer_mobile'],)).fetchone()

    rc_data = None
    msg = ""
    searched_num = ""

    if request.method == 'POST':
        vehicle_number = request.form.get('vehicle_number', '').strip()
        searched_num = vehicle_number
        if dealer and dealer['credits'] > 0:
            conn.execute('UPDATE dealers SET credits = credits - 1 WHERE mobile = ?', (dealer['mobile'],))
            conn.execute('INSERT INTO club_logs (dealer_mobile, vehicle_number) VALUES (?, ?)', (dealer['mobile'], vehicle_number))
            conn.commit()

            dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (session['dealer_mobile'],)).fetchone()
            rc_data = fetch_rc_from_idspay(vehicle_number)
        else:
            msg = "Insufficient credits! Please recharge."

    conn.close()
    is_admin = (session.get('dealer_mobile') == ADMIN_MOBILE)
    return render_template_string(DASHBOARD_TEMPLATE, dealer=dealer, rc_data=rc_data, msg=msg, searched_num=searched_num, is_admin=is_admin)

@app.route('/admin', methods=['GET', 'POST'])
def admin_panel():
    if 'dealer_mobile' not in session or session['dealer_mobile'] != ADMIN_MOBILE:
        return redirect(url_for('dealer_login'))

    conn = get_db()
    msg = ""
    rc_data = None
    searched_num = ""

    if request.method == 'POST':
        vehicle_number = request.form.get('admin_vehicle_number', '').strip()
        searched_num = vehicle_number
        if vehicle_number:
            conn.execute('INSERT INTO club_logs (dealer_mobile, vehicle_number) VALUES (?, ?)', (ADMIN_MOBILE, vehicle_number))
            conn.commit()
            rc_data = fetch_rc_from_idspay(vehicle_number)
        else:
            msg = "Please enter a valid vehicle number."

    dealers = conn.execute('SELECT * FROM dealers').fetchall()
    total_dealers = len(dealers)
    total_searches = conn.execute('SELECT COUNT(*) FROM club_logs').fetchone()[0]

    total_rev_res = conn.execute('SELECT SUM(amount) FROM recharge_records').fetchone()[0]
    total_revenue = total_rev_res if total_rev_res else 0

    today_str = datetime.now().strftime('%Y-%m-%d')
    selected_date = request.args.get('filter_date', today_str)

    date_rev_res = conn.execute('SELECT SUM(amount) FROM recharge_records WHERE DATE(payment_date) = ?', (selected_date,)).fetchone()[0]
    date_revenue = date_rev_res if date_rev_res else 0

    conn.close()
    return render_template_string(ADMIN_TEMPLATE, dealers=dealers, total_dealers=total_dealers, total_searches=total_searches, total_revenue=total_revenue, selected_date=selected_date, date_revenue=date_revenue, rc_data=rc_data, searched_num=searched_num, msg=msg)

@app.route('/admin/send-custom-credits', methods=['POST'])
def admin_send_custom_credits():
    if 'dealer_mobile' not in session or session['dealer_mobile'] != ADMIN_MOBILE:
        return redirect(url_for('dealer_login'))

    target_mobile = request.form.get('target_mobile', '').strip()
    package_type = request.form.get('package_type', '')

    if target_mobile and package_type:
        if package_type == '300_1':
            amount, credits = 300, 1
        elif package_type == '2000_10':
            amount, credits = 2000, 10
        elif package_type == '5000_40':
            amount, credits = 5000, 40
        else:
            amount, credits = 2000, 10

        conn = get_db()
        dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (target_mobile,)).fetchone()
        if not dealer:
            conn.execute('INSERT INTO dealers (mobile, name, credits, status, is_verified, bonus_claimed) VALUES (?, ?, ?, "Active", 1, 1)', (target_mobile, 'Dealer', credits))
        else:
            conn.execute('UPDATE dealers SET credits = credits + ? WHERE mobile = ?', (credits, target_mobile))

        conn.execute('INSERT INTO recharge_records (dealer_mobile, amount, credits_added) VALUES (?, ?, ?)', (target_mobile, amount, credits))
        conn.commit()
        conn.close()

    return redirect(url_for('admin_panel'))

@app.route('/admin/send-credits-quick')
def admin_send_credits_quick():
    if 'dealer_mobile' not in session or session['dealer_mobile'] != ADMIN_MOBILE:
        return redirect(url_for('dealer_login'))
    mobile = request.args.get('mobile')
    if mobile:
        conn = get_db()
        conn.execute('UPDATE dealers SET credits = credits + 10 WHERE mobile = ?', (mobile,))
        conn.execute('INSERT INTO recharge_records (dealer_mobile, amount, credits_added) VALUES (?, 2000, 10)', (mobile,))
        conn.commit()
        conn.close()
    return redirect(url_for('admin_panel'))

@app.route('/dealer/logout')
def dealer_logout():
    session.clear()
    return redirect(url_for('dealer_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

import os
import random
import sqlite3
import requests
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
            credits INTEGER DEFAULT 15,
            status TEXT DEFAULT 'Active',
            payment_proof TEXT
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
            if res_json.get("status", {}).get("code") == 200 or "data" in res_json:
                outer_data = res_json.get("data", {})
                outer_mobile = outer_data.get("mobileNo")
                inner_data = outer_data.get("data", {})
                if isinstance(inner_data, dict):
                    if outer_mobile:
                        inner_data["mobileNumber"] = outer_mobile
                    return inner_data
                if outer_mobile and isinstance(outer_data, dict):
                    outer_data["mobileNumber"] = outer_mobile
                return outer_data
        return {
            "regNo": vehicle_number.upper(),
            "error": "Failed to fetch from IDSPay",
            "message": response.text
        }
    except Exception as e:
        return {
            "regNo": vehicle_number.upper(),
            "error": "Connection Error",
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
        <h4 style="margin:0 0 10px 0; color:#004085; border-bottom:1px solid #b8daff; padding-bottom:5px;">Full RC Details (IDSPay)</h4>
        <table style="width:100%; font-size:13px; color:#333; border-collapse:collapse;">
            {% for key, value in rc_data.items() %}
            <tr style="border-bottom:1px solid #d0e1fd;">
                <td style="padding:6px 0; font-weight:bold; text-transform:capitalize; width:45%;">{{ key.replace('_', ' ') }}</td>
                <td style="padding:6px 0; text-align:right; {% if 'mobile' in key.lower() and value and value != 'N/A' and value != 'None' and value != 'null' %}color:#0d6efd; font-weight:bold; font-size:14px;{% endif %}">
                    {{ value if value is not none and value != '' and value != 'null' else 'N/A' }}
                </td>
            </tr>
            {% endfor %}
        </table>
    </div>
    {% endif %}

    <div id="recharge" style="background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:8px;">
        <h4 style="color:#856404; margin:0 0 10px 0; text-align:center;">Recharge Credits / Packages</h4>
        <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:12px;">
            <div onclick="showBankDetails('₹2,000', '10 Credits')" style="flex:1; background:white; padding:12px; border-radius:5px; border:2px solid #ffc107; text-align:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <b style="color:#333; font-size:16px;">₹2,000</b>
                <p style="margin:5px 0 0 0; color:#0056b3; font-weight:bold; font-size:13px;">10 Credits</p>
                <span style="font-size:10px; color:#666; display:block; margin-top:4px;">Click to Pay ➔</span>
            </div>
            <div onclick="showBankDetails('₹5,000', '40 Credits')" style="flex:1; background:white; padding:12px; border-radius:5px; border:2px solid #28a745; text-align:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <b style="color:#333; font-size:16px;">₹5,000</b>
                <p style="margin:5px 0 0 0; color:#28a745; font-weight:bold; font-size:13px;">40 Credits</p>
                <span style="font-size:10px; color:#666; display:block; margin-top:4px;">Click to Pay ➔</span>
            </div>
        </div>

        <div id="bankDetailsBox" style="display:none; background:white; border:2px dashed #0d6efd; padding:12px; border-radius:6px; margin-top:10px; text-align:center;">
            <h5 id="selectedPackageTitle" style="margin:0 0 5px 0; color:#0d6efd; font-size:15px;"></h5>
            <p style="margin:4px 0; font-size:13px; color:#333;"><b>UPI ID / VPA:</b> <span id="upiIdText" style="color:#d63384; font-family:monospace; font-size:15px; font-weight:bold;">madhansampath@kvb</span></p>
            <p style="margin:4px 0; font-size:12px; color:#555;"><b>Beneficiary Name:</b> Madhan Sampath</p>
            <p style="margin:8px 0 10px 0; font-size:11px; color:#666;">Transfer payment using any UPI app, then click below to send screenshot proof on WhatsApp.</p>
            <a id="whatsappBtn" href="#" target="_blank" style="display:block; text-align:center; background:#28a745; color:white; padding:8px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:13px;">📲 Send Payment Proof on WhatsApp</a>
        </div>
    </div>

</div>

<script>
function showBankDetails(amount, credits) {
    var box = document.getElementById('bankDetailsBox');
    var title = document.getElementById('selectedPackageTitle');
    var whatsappBtn = document.getElementById('whatsappBtn');
    
    title.innerText = "Selected: " + amount + " (" + credits + ")";
    box.style.display = 'block';
    
    var dealerMobile = "{{ dealer.mobile }}";
    var msg = "Hello Admin, I have completed the payment of " + amount + " for " + credits + ". UPI ID: madhansampath@kvb. Dealer Mobile: " + dealerMobile;
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
<div style="max-width:800px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
    
    <div style="display:flex; justify-content:space-between; align-items:center; background:#343a40; padding:12px 15px; border-radius:8px; color:white; margin-bottom:20px;">
        <h2 style="margin:0; font-size:20px;">🛡️ Admin Command Panel</h2>
        <div>
            <a href="/dealer/dashboard" style="background:#007bff; color:white; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px; margin-right:5px;">🏠 Dashboard</a>
            <a href="/dealer/logout" style="background:#dc3545; color:white; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:13px;">Logout</a>
        </div>
    </div>

    <!-- Quick Stats Cards including IDSPay Gateway Status -->
    <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
        <div style="flex:1; background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:8px; text-align:center; min-width:140px;">
            <div style="font-size:12px; color:#004085; font-weight:bold;">TOTAL DEALERS</div>
            <div style="font-size:24px; font-weight:bold; color:#0056b3; margin-top:5px;">{{ total_dealers }}</div>
        </div>
        <div style="flex:1; background:#e2f0d9; border:1px solid #c3e6cb; padding:15px; border-radius:8px; text-align:center; min-width:140px;">
            <div style="font-size:12px; color:#155724; font-weight:bold;">TOTAL CHECKS</div>
            <div style="font-size:24px; font-weight:bold; color:#28a745; margin-top:5px;">{{ total_searches }}</div>
        </div>
        <div style="flex:1; background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:8px; text-align:center; min-width:140px;">
            <div style="font-size:12px; color:#856404; font-weight:bold;">EST. COLLECTION</div>
            <div style="font-size:24px; font-weight:bold; color:#d39e00; margin-top:5px;">₹{{ total_collection }}</div>
        </div>
        <div style="flex:1; background:#f8d7da; border:1px solid #f5c6cb; padding:15px; border-radius:8px; text-align:center; min-width:140px;">
            <div style="font-size:12px; color:#721c24; font-weight:bold;">IDSPAY API GATEWAY</div>
            <div style="font-size:15px; font-weight:bold; color:#721c24; margin-top:8px;"><a href="https://apiuser.idspay.in/" target="_blank" style="color:#721c24; text-decoration:underline;">Check Portal ➔</a></div>
        </div>
    </div>

    <!-- Free Admin Vehicle Lookup -->
    <div style="background:#f8f9fa; border:1px solid #ced4da; padding:15px; border-radius:8px; margin-bottom:20px;">
        <h3 style="margin-top:0; color:#333; font-size:16px;">🔍 Admin Free Vehicle Lookup (0 Credits Deducted)</h3>
        {% if msg %}<div style="background:#ffdddd; color:#d8000c; padding:8px; border-radius:5px; margin-bottom:10px; font-size:13px;">{{ msg }}</div>{% endif %}
        <form method="POST">
            <input type="text" name="admin_vehicle_number" value="{{ searched_num }}" placeholder="Enter Vehicle Number (e.g. TN10BZ8419)" required style="width:73%; padding:10px; border:1px solid #ccc; border-radius:5px; font-size:14px; font-weight:bold; text-transform:uppercase;">
            <button type="submit" style="width:25%; background:#dc3545; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; font-size:14px; cursor:pointer; float:right;">Lookup Free</button>
        </form>
        <div style="clear:both;"></div>
    </div>

    {% if rc_data %}
    <div style="background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:8px; margin-bottom:20px;">
        <h4 style="margin:0 0 10px 0; color:#004085; border-bottom:1px solid #b8daff; padding-bottom:5px;">RC Verification Result</h4>
        <table style="width:100%; font-size:13px; color:#333; border-collapse:collapse;">
            {% for key, value in rc_data.items() %}
            <tr style="border-bottom:1px solid #d0e1fd;">
                <td style="padding:6px 0; font-weight:bold; text-transform:capitalize; width:45%;">{{ key.replace('_', ' ') }}</td>
                <td style="padding:6px 0; text-align:right; {% if 'mobile' in key.lower() and value and value != 'N/A' and value != 'None' and value != 'null' %}color:#0d6efd; font-weight:bold; font-size:14px;{% endif %}">
                    {{ value if value is not none and value != '' and value != 'null' else 'N/A' }}
                </td>
            </tr>
            {% endfor %}
        </table>
    </div>
    {% endif %}

    <!-- Dealers Management Table -->
    <h3 style="color:#333; font-size:16px; margin-bottom:8px;">Registered Dealers & Credits</h3>
    <div style="overflow-x:auto; margin-bottom:20px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
            <thead>
                <tr style="background:#343a40; color:white;">
                    <th style="padding:8px;">Mobile</th>
                    <th style="padding:8px;">Credits Left</th>
                    <th style="padding:8px;">Status</th>
                    <th style="padding:8px; text-align:center;">Action</th>
                </tr>
            </thead>
            <tbody>
                {% for d in dealers %}
                <tr style="border-bottom:1px solid #dee2e6;">
                    <td style="padding:8px; font-weight:bold;">{{ d.mobile }}</td>
                    <td style="padding:8px;">{{ d.credits }}</td>
                    <td style="padding:8px;"><span style="background:#28a745; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">{{ d.status }}</span></td>
                    <td style="padding:8px; text-align:center;">
                        <a href="/admin/add-credits?mobile={{ d.mobile }}" style="background:#ffc107; color:black; padding:4px 8px; border-radius:4px; text-decoration:none; font-weight:bold; font-size:11px;">+10 Credits</a>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>

    <!-- Search Logs History -->
    <h3 style="color:#333; font-size:16px; margin-bottom:8px;">Recent Vehicle Search Logs</h3>
    <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
            <thead>
                <tr style="background:#6c757d; color:white;">
                    <th style="padding:8px;">Dealer Mobile</th>
                    <th style="padding:8px;">Vehicle Number</th>
                    <th style="padding:8px;">Time</th>
                </tr>
            </thead>
            <tbody>
                {% for log in logs %}
                <tr style="border-bottom:1px solid #dee2e6;">
                    <td style="padding:8px; font-weight:bold;">{{ log.dealer_mobile }}</td>
                    <td style="padding:8px; color:#0056b3; font-weight:bold;">{{ log.vehicle_number }}</td>
                    <td style="padding:8px; color:#666; font-size:12px;">{{ log.search_date }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>

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
                conn.execute('INSERT INTO dealers (mobile, name, credits, status) VALUES (?, ?, 15, "Active")', (mobile, 'Dealer'))
            else:
                conn.execute('UPDATE dealers SET status = "Active" WHERE mobile = ?', (mobile,))
                
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
        
    if request.method == 'POST':
        entered_otp = request.form.get('otp')
        if otp_storage.get(mobile) and otp_storage.get(mobile) == entered_otp.strip():
            session.pop('pending_mobile', None)
            session['dealer_mobile'] = mobile
            otp_storage.pop(mobile, None)
            return redirect(url_for('dealer_dashboard'))
        else:
            msg = "Invalid OTP. Please enter the correct code shown above."
            
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
            msg = "Insufficient credits! Please recharge using the packages below."
            
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
    logs = conn.execute('SELECT * FROM club_logs ORDER BY id DESC LIMIT 20').fetchall()
    
    total_dealers = len(dealers)
    total_searches = conn.execute('SELECT COUNT(*) FROM club_logs').fetchone()[0]
    total_collection = total_searches * 200
    
    conn.close()
    return render_template_string(ADMIN_TEMPLATE, dealers=dealers, logs=logs, total_dealers=total_dealers, total_searches=total_searches, total_collection=total_collection, rc_data=rc_data, searched_num=searched_num, msg=msg)

@app.route('/admin/add-credits')
def admin_add_credits():
    if 'dealer_mobile' not in session or session['dealer_mobile'] != ADMIN_MOBILE:
        return redirect(url_for('dealer_login'))
    
    mobile = request.args.get('mobile')
    if mobile:
        conn = get_db()
        conn.execute('UPDATE dealers SET credits = credits + 10 WHERE mobile = ?', (mobile,))
        conn.commit()
        conn.close()
    return redirect(url_for('admin_panel'))

@app.route('/dealer/logout')
def dealer_logout():
    session.clear()
    return redirect(url_for('dealer_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

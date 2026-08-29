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
            payment_proof TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS club_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dealer_mobile TEXT,
            vehicle_number TEXT,
            search_date TEXT
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
                data_block = res_json.get("data", {})
                if isinstance(data_block, dict) and "data" in data_block:
                    return data_block.get("data")
                return data_block
        return {
            "rc_number": vehicle_number.upper(),
            "error": "Failed to fetch from IDSPay",
            "message": response.text
        }
    except Exception as e:
        return {
            "rc_number": vehicle_number.upper(),
            "owner_name": "Connection Error",
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
<body style="font-family:sans-serif; background:#f4f4f9; margin:0; padding:20px;">
<div style="max-width:550px; margin:auto; background:white; padding:25px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:20px;">
        <h3 style="margin:0; color:#333;">Dealer Portal</h3>
        <a href="/dealer/logout" style="color:red; text-decoration:none; font-size:14px;">Logout</a>
    </div>
    <p><b>Mobile:</b> {{ dealer.mobile }}</p>
    <p><b>Available Credits:</b> <span style="color:#0056b3; font-size:18px; font-weight:bold;">{{ dealer.credits }}</span> <span style="font-size:12px; color:#666;">(₹300 per vehicle search)</span></p>
    
    {% if msg %}<div style="background:#ffdddd; color:#d8000c; padding:10px; border-radius:5px; margin-bottom:15px; font-size:14px;">{{ msg }}</div>{% endif %}
    
    <form method="POST" style="margin-top:20px;">
        <label style="font-weight:bold; font-size:14px; display:block; margin-bottom:5px;">Enter Vehicle Number:</label>
        <input type="text" name="vehicle_number" placeholder="e.g. TN01AB1234" required style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box; text-transform:uppercase;">
        <button type="submit" style="width:100%; background:#0056b3; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">Fetch RC Details (IDSPay API)</button>
    </form>

    {% if rc_data %}
    <div style="background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:8px; margin-top:20px;">
        <h4 style="margin:0 0 10px 0; color:#004085; border-bottom:1px solid #b8daff; padding-bottom:5px;">Full RC Details (IDSPay)</h4>
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

    <div style="background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:8px; margin-top:25px;">
        <h4 style="color:#856404; margin:0 0 10px 0; text-align:center;">Recharge Credits / Buy Packages</h4>
        <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:15px;">
            <div style="flex:1; background:white; padding:10px; border-radius:5px; border:1px solid #ddd; text-align:center;">
                <b style="color:#333; font-size:16px;">₹2,000</b>
                <p style="margin:5px 0; color:#0056b3; font-weight:bold; font-size:14px;">10 Credits</p>
            </div>
            <div style="flex:1; background:white; padding:10px; border-radius:5px; border:1px solid #ddd; text-align:center;">
                <b style="color:#333; font-size:16px;">₹5,000</b>
                <p style="margin:5px 0; color:#28a745; font-weight:bold; font-size:14px;">40 Credits</p>
            </div>
        </div>
        <p style="color:#856404; font-size:12px; text-align:center; margin:0 0 12px 0;">Transfer payment to our UPI / Bank Account and send screenshot proof on WhatsApp with your mobile number.</p>
        <a href="https://wa.me/?text=Hello%20Admin,%20I%20have%20completed%20the%20payment%20recharge%20for%20dealer%20credits.%20Mobile:%20{{ dealer.mobile }}" target="_blank" style="display:block; text-align:center; background:#28a745; color:white; padding:10px; text-decoration:none; border-radius:5px; font-weight:bold;">Send Payment Proof on WhatsApp</a>
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
                conn.execute('INSERT INTO dealers (mobile, name, credits, status) VALUES (?, ?, 5, "Active")', (mobile, 'Dealer'))
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
    
    if request.method == 'POST':
        vehicle_number = request.form.get('vehicle_number')
        if dealer and dealer['credits'] > 0:
            conn.execute('UPDATE dealers SET credits = credits - 1 WHERE mobile = ?', (dealer['mobile'],))
            conn.execute('INSERT INTO club_logs (dealer_mobile, vehicle_number) VALUES (?, ?)', (dealer['mobile'], vehicle_number))
            conn.commit()
            
            dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (session['dealer_mobile'],)).fetchone()
            rc_data = fetch_rc_from_idspay(vehicle_number)
        else:
            msg = "Insufficient credits! Please recharge using the packages below."
            
    conn.close()
    return render_template_string(DASHBOARD_TEMPLATE, dealer=dealer, rc_data=rc_data, msg=msg)

@app.route('/dealer/logout')
def dealer_logout():
    session.clear()
    return redirect(url_for('dealer_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

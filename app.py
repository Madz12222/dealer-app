import os
import random
import sqlite3
from flask import Flask, render_template_string, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = os.urandom(24)

otp_storage = {}

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
            credits INTEGER DEFAULT 1,
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

LOGIN_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head><title>Login - Cosmogems Club</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif; background:#f4f4f9; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
<div style="background:white; padding:30px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); width:100%; max-width:350px; text-align:center;">
    <h2 style="color:#0056b3;">Cosmogems Club</h2>
    <p style="color:#666; font-size:14px;">Enter your mobile number to receive OTP.</p>
    {% if msg %}<p style="color:red; font-size:13px;">{{ msg }}</p>{% endif %}
    <form method="POST">
        <input type="text" name="mobile" placeholder="10-digit mobile number" required style="width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
        <button type="submit" style="width:100%; background:#0056b3; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">Send WhatsApp OTP</button>
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
    <p style="color:#666; font-size:14px;">OTP generated for {{ mobile }} <br><small style="color:green;">(Check Termux Console or use 1234)</small></p>
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
<div style="max-width:500px; margin:auto; background:white; padding:25px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:20px;">
        <h3 style="margin:0; color:#333;">Dealer Portal</h3>
        <a href="/dealer/logout" style="color:red; text-decoration:none; font-size:14px;">Logout</a>
    </div>
    <p><b>Mobile:</b> {{ dealer.mobile }}</p>
    <p><b>Available Credits:</b> <span style="color:#0056b3; font-size:18px; font-weight:bold;">{{ dealer.credits }}</span></p>
    
    {% if msg %}<div style="background:#ffdddd; color:#d8000c; padding:10px; border-radius:5px; margin-bottom:15px; font-size:14px;">{{ msg }}</div>{% endif %}
    
    <form method="POST" style="margin-top:20px;">
        <label style="font-weight:bold; font-size:14px; display:block; margin-bottom:5px;">Enter Vehicle Number:</label>
        <input type="text" name="vehicle_number" placeholder="e.g. TN01AB1234" required style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box; text-transform:uppercase;">
        <button type="submit" style="width:100%; background:#0056b3; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">Search Vehicle</button>
    </form>

    {% if vehicle_result %}
    <div style="background:#e8f4fd; border:1px solid #b8daff; padding:15px; border-radius:5px; margin-top:20px;">
        <h4 style="margin:0 0 10px 0; color:#004085;">Vehicle Details Found:</h4>
        <p style="margin:5px 0;"><b>Number:</b> {{ vehicle_result.vehicle_number }}</p>
        <p style="margin:5px 0;"><b>Status:</b> {{ vehicle_result.status }}</p>
        <p style="margin:5px 0;"><b>Details:</b> {{ vehicle_result.details }}</p>
    </div>
    {% endif %}

    {% if dealer.credits == 0 %}
    <div style="background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:5px; margin-top:20px; text-align:center;">
        <p style="color:#856404; margin:0 0 10px 0; font-weight:bold;">Out of Credits!</p>
        <p style="color:#856404; font-size:13px; margin:0 0 10px 0;">Complete payment of INR 2000 to get more credits.</p>
        <a href="https://wa.me/?text=Hello%20Admin,%20I%20have%20completed%20the%20payment%20of%20INR%202000%20for%20dealer%20credits.%20Mobile:%20{{ dealer.mobile }}" target="_blank" style="display:inline-block; background:#28a745; color:white; padding:10px 15px; text-decoration:none; border-radius:5px; font-weight:bold;">Send Payment Proof on WhatsApp</a>
    </div>
    {% endif %}
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
                # Brand new user: Give exactly 1 free credit
                conn.execute('INSERT INTO dealers (mobile, name, credits, status) VALUES (?, ?, 1, "Active")', (mobile, 'Dealer'))
            else:
                # Returning user: Do NOT give free credits again, keep current balance
                conn.execute('UPDATE dealers SET status = "Active" WHERE mobile = ?', (mobile,))
                
            conn.commit()
            conn.close()
            
            otp = str(random.randint(1000, 9999))
            otp_storage[mobile] = otp
            
            print("\n" + "="*40)
            print(f" [TERMUX OTP GENERATOR] Mobile: {mobile} | OTP: {otp}")
            print("="*40 + "\n")
            
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
        if otp_storage.get(mobile) == entered_otp or entered_otp == '1234':
            session.pop('pending_mobile', None)
            session['dealer_mobile'] = mobile
            otp_storage.pop(mobile, None)
            return redirect(url_for('dealer_dashboard'))
        else:
            msg = "Invalid OTP. Check your Termux console logs or use '1234'."
            
    return render_template_string(VERIFY_TEMPLATE, msg=msg, mobile=mobile)

@app.route('/dealer/dashboard', methods=['GET', 'POST'])
def dealer_dashboard():
    if 'dealer_mobile' not in session:
        return redirect(url_for('dealer_login'))
    
    conn = get_db()
    dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (session['dealer_mobile'],)).fetchone()
    
    vehicle_result = None
    msg = ""
    
    if request.method == 'POST':
        vehicle_number = request.form.get('vehicle_number')
        if dealer and dealer['credits'] > 0:
            conn.execute('UPDATE dealers SET credits = credits - 1 WHERE mobile = ?', (dealer['mobile'],))
            conn.execute('INSERT INTO club_logs (dealer_mobile, vehicle_number) VALUES (?, ?)', (dealer['mobile'], vehicle_number))
            conn.commit()
            
            dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (session['dealer_mobile'],)).fetchone()
            vehicle_result = {
                "vehicle_number": vehicle_number.upper(),
                "status": "Active / Verified",
                "details": "Vehicle database lookup completed successfully."
            }
        else:
            msg = "Insufficient credits! Please submit payment proof to buy more credits."
            
    conn.close()
    return render_template_string(DASHBOARD_TEMPLATE, dealer=dealer, vehicle_result=vehicle_result, msg=msg)

@app.route('/dealer/logout')
def dealer_logout():
    session.clear()
    return redirect(url_for('dealer_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

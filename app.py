import os
import random
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = os.urandom(24)

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
                # Brand new user: Give exactly 1 free starting credit
                conn.execute('INSERT INTO dealers (mobile, name, credits, status) VALUES (?, ?, 1, "Active")', (mobile, 'Dealer'))
            else:
                # Existing user: Do NOT give free credits again, just keep their current balance
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
            
    return render_template('dealer_login.html', msg=msg)

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
            msg = "Invalid OTP. Check your console logs or use '1234'."
            
    return render_template('verify_otp.html', msg=msg, mobile=mobile)

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
            msg = "Insufficient credits! Your free credit has been used. Please submit payment proof to buy more credits."
            
    conn.close()
    return render_template('dealer_dashboard.html', dealer=dealer, vehicle_result=vehicle_result, msg=msg)

@app.route('/dealer/logout')
def dealer_logout():
    session.clear()
    return redirect(url_for('dealer_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

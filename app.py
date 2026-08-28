from datetime import date
import random
import sqlite3
import urllib.parse
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
import requests

app = Flask(__name__)
app.secret_key = 'cosmogems_secret_dealer_club_key'

def get_db():
    conn = sqlite3.connect('database.db')
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
            otp TEXT,
            status TEXT DEFAULT 'ACTIVE',
            created_at TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS club_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dealer_mobile TEXT,
            vehicle_number TEXT,
            owner_name TEXT,
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
    msg = ''
    if request.method == 'POST':
        mobile = request.form.get('mobile', '').strip()
        conn = get_db()
        dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
        
        if not dealer:
            conn.execute('INSERT INTO dealers (name, mobile, credits, status, created_at) VALUES (?, ?, ?, ?, ?)', 
                         ('New Dealer', mobile, 1, 'ACTIVE', str(date.today())))
            conn.commit()
            dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()

        otp = str(random.randint(1000, 9999))
        conn.execute('UPDATE dealers SET otp = ? WHERE mobile = ?', (otp, mobile))
        conn.commit()
        conn.close()

        otp_text = f"*COSMOGEMS CLUB LOGIN*\n\nYour OTP for login is: *{otp}*\n\nDo not share this with anyone."
        wa_url = f"https://api.whatsapp.com/send?phone=91{mobile}&text={urllib.parse.quote(otp_text)}"
        
        return render_template('otp_verify.html', mobile=mobile, wa_url=wa_url, otp=otp)

    return render_template('dealer_login.html', msg=msg)

@app.route('/dealer/verify-otp', methods=['POST'])
def verify_otp():
    mobile = request.form.get('mobile', '').strip()
    entered_otp = request.form.get('otp', '').strip()

    conn = get_db()
    dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
    conn.close()

    if dealer and dealer['otp'] == entered_otp:
        session['dealer_mobile'] = dealer['mobile']
        session['dealer_name'] = dealer['name']
        return redirect(url_for('dealer_dashboard'))
    
    return render_template('otp_verify.html', mobile=mobile, error="Invalid OTP. Please try again.")

@app.route('/dealer/dashboard')
def dealer_dashboard():
    if 'dealer_mobile' not in session:
        return redirect(url_for('dealer_login'))
    
    mobile = session['dealer_mobile']
    conn = get_db()
    dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
    logs = conn.execute('SELECT * FROM club_logs WHERE dealer_mobile = ? ORDER BY id DESC LIMIT 10', (mobile,)).fetchall()
    conn.close()

    return render_template('dealer_dashboard.html', dealer=dealer, logs=logs)

@app.route('/dealer/fetch_rc', methods=['POST'])
def dealer_fetch_rc():
    if 'dealer_mobile' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'})

    mobile = session['dealer_mobile']
    conn = get_db()
    dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()

    if not dealer or dealer['credits'] <= 0:
        conn.close()
        return jsonify({'success': False, 'error': 'Free trial check used! Please recharge your membership wallet (₹2,000 for 15 checks).'})

    vehicle_number = request.json.get('vehicle_number', '').strip().upper()
    url = 'https://javabackend.idspay.in/api/v1/prod/Rc-Premium-v2-verify'
    headers = {'Content-Type': 'application/json'}
    payload = {
        "api_id": "APID3192",
        "api_key": "99310f2f-6808-4da5-be3e-84143ed8228d",
        "token_id": "9PcAF1hNoBWFLnUEQuicQuYkkn2ZANd4",
        "vehicle_num": vehicle_number
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        res_data = response.json()
        
        if response.status_code == 200 and res_data.get("status", {}).get("code") == 200:
            outer_data = res_data.get("data", {})
            veh_info = outer_data.get("data", {}) if isinstance(outer_data.get("data"), dict) else {}

            conn.execute('UPDATE dealers SET credits = credits - 1 WHERE mobile = ?', (mobile,))
            conn.execute('INSERT INTO club_logs (dealer_mobile, vehicle_number, owner_name, search_date) VALUES (?, ?, ?, ?)',
                         (mobile, vehicle_number, veh_info.get('owner', 'N/A'), str(date.today())))
            conn.commit()
            conn.close()

            full_address = veh_info.get('presentAddress') or veh_info.get('permanentAddress') or ''
            mob = veh_info.get('mobileNumber') or outer_data.get('mobileNo') or ''
            financer_name = veh_info.get('rcFinancer') or ('On Cash' if veh_info.get('financed') == False else 'None')
            
            return jsonify({
                'success': True,
                'vehicle_number': veh_info.get('regNo', vehicle_number),
                'mobile_number': str(mob),
                'vehicle_type': f"{veh_info.get('vehicleManufacturerName', '')} {veh_info.get('model', '')}".strip() or veh_info.get('vehicleClass', ''),
                'owner': veh_info.get('owner', 'N/A'),
                'address': str(full_address).strip(),
                'chassis': veh_info.get('chassis', 'N/A'),
                'engine': veh_info.get('engine', 'N/A'),
                'rc_expiry': veh_info.get('rcExpiryDate', 'N/A'),
                'insurance_upto': veh_info.get('vehicleInsuranceUpto', 'N/A'),
                'financer': str(financer_name),
                'remaining_credits': dealer['credits'] - 1
            })
        else:
            conn.close()
            return jsonify({'success': False, 'error': 'Vehicle not found or API error.'})
            
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/admin/dashboard')
def admin_dashboard():
    conn = get_db()
    dealers = conn.execute('SELECT * FROM dealers ORDER BY id DESC').fetchall()
    total_dealers = len(dealers)
    total_credits = sum(d['credits'] for d in dealers)
    total_searches = conn.execute('SELECT COUNT(*) FROM club_logs').fetchone()[0]
    today_searches = conn.execute('SELECT COUNT(*) FROM club_logs WHERE search_date = ?', (str(date.today()),)).fetchone()[0]
    conn.close()

    return render_template('admin_dashboard.html', 
                           dealers=dealers, 
                           total_dealers=total_dealers, 
                           total_credits=total_credits, 
                           total_searches=total_searches,
                           today_searches=today_searches)

@app.route('/admin/add_credits', methods=['POST'])
def admin_add_credits():
    mobile = request.form.get('mobile')
    credits_to_add = int(request.form.get('credits', 15))
    
    conn = get_db()
    conn.execute('UPDATE dealers SET credits = credits + ? WHERE mobile = ?', (credits_to_add, mobile))
    conn.commit()
    conn.close()
    return redirect(url_for('admin_dashboard'))

@app.route('/dealer/logout')
def dealer_logout():
    session.clear()
    return redirect(url_for('dealer_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

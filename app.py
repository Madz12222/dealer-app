import os
import random
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = os.urandom(24)

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
            credits INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Pending',
            payment_proof TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit_proof', methods=['POST'])
def submit_proof():
    mobile = request.form.get('mobile')
    name = request.form.get('name')
    file = request.files.get('proof')
    
    if file and mobile:
        filename = f"{mobile}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        conn = get_db()
        existing = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
        if existing:
            conn.execute('UPDATE dealers SET payment_proof = ?, status = "Pending", name = COALESCE(?, name) WHERE mobile = ?', (filepath, name, mobile))
        else:
            conn.execute('INSERT INTO dealers (name, mobile, credits, status, payment_proof) VALUES (?, ?, 0, "Pending", ?)', (name, mobile, filepath))
        conn.commit()
        conn.close()
        
        return render_template('index.html', msg="Payment proof submitted successfully! Waiting for admin approval.")
    
    return redirect(url_for('home'))

@app.route('/dealer/login', methods=['GET', 'POST'])
def dealer_login():
    msg = ""
    if request.method == 'POST':
        mobile = request.form.get('mobile')
        conn = get_db()
        dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ? AND status = "Active"', (mobile,)).fetchone()
        conn.close()
        if dealer:
            session['dealer_mobile'] = dealer['mobile']
            return redirect(url_for('dealer_dashboard'))
        else:
            msg = "Account not found or pending admin approval."
    return render_template('dealer_login.html', msg=msg)

@app.route('/dealer/dashboard')
def dealer_dashboard():
    if 'dealer_mobile' not in session:
        return redirect(url_for('dealer_login'))
    conn = get_db()
    dealer = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (session['dealer_mobile'],)).fetchone()
    conn.close()
    return render_template('dealer_dashboard.html', dealer=dealer)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    msg = ""
    if request.method == 'POST':
        password = request.form.get('password')
        if password == os.environ.get('ADMIN_PASSWORD', 'admin123'):
            session['is_admin'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            msg = "Invalid Admin Password"
    return render_template('admin_login.html', msg=msg)

@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    conn = get_db()
    dealers = conn.execute('SELECT * FROM dealers').fetchall()
    conn.close()
    return render_template('admin_dashboard.html', dealers=dealers)

@app.route('/admin/approve/<int:dealer_id>')
def admin_approve(dealer_id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    conn = get_db()
    conn.execute('UPDATE dealers SET status = "Active", credits = credits + 10 WHERE id = ?', (dealer_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('admin_dashboard'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

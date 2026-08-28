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
    file = request.files.get('proof')
    
    if file and mobile:
        filename = f"{mobile}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        conn = get_db()
        # Insert or update dealer submission
        existing = conn.execute('SELECT * FROM dealers WHERE mobile = ?', (mobile,)).fetchone()
        if existing:
            conn.execute('UPDATE dealers SET payment_proof = ?, status = "Pending" WHERE mobile = ?', (filepath, mobile))
        else:
            conn.execute('INSERT INTO dealers (name, mobile, credits, status, payment_proof) VALUES (?, ?, 0, "Pending", ?)', ('New Dealer', mobile, filepath))
        conn.commit()
        conn.close()
        
        return render_template('index.html', msg="Payment proof submitted successfully! Waiting for admin approval.")
    
    return redirect(url_for('home'))

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    msg = ""
    if request.method == 'POST':
        entered_password = request.form.get('password')
        if entered_password == os.environ.get('ADMIN_PASSWORD', 'admin123'):
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
    pending_dealers = conn.execute('SELECT * FROM dealers WHERE status = "Pending"').fetchall()
    conn.close()
    
    return render_template('admin_dashboard.html', pending_dealers=pending_dealers)

@app.route('/admin/approve/<mobile>', methods=['POST'])
def admin_approve(mobile):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
        
    conn = get_db()
    conn.execute('UPDATE dealers SET credits = credits + 1, status = "Approved" WHERE mobile = ?', (mobile,))
    conn.commit()
    conn.close()
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/logout')
def admin_logout():
    session.pop('is_admin', None)
    return redirect(url_for('admin_login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

from flask import Flask, render_template, request, redirect, url_for
import sqlite3
from datetime import date

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_number TEXT,
            mobile_number TEXT,
            vehicle_type TEXT,
            validity_period TEXT,
            amount INTEGER,
            date TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS bulk_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_type TEXT,
            quantity INTEGER,
            amount INTEGER,
            date TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT,
            amount INTEGER,
            date TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/', methods=['GET', 'POST'])
def index():
    today = str(date.today())
    conn = get_db()
    
    if request.method == 'POST':
        if 'add_entry' in request.form:
            vehicle_number = request.form.get('vehicle_number', '').strip().upper()
            mobile_number = request.form.get('mobile_number', '').strip()
            vehicle_type = request.form.get('vehicle_type', '').strip()
            validity_period = request.form.get('validity_period', '').strip()
            
            default_amount = 200
            if '2W/3W' in vehicle_type:
                default_amount = 100
            elif '4W' in vehicle_type:
                default_amount = 200
            elif '6W' in vehicle_type:
                default_amount = 300
            elif 'Heavy' in vehicle_type:
                default_amount = 500
                
            custom_amount = request.form.get('custom_amount')
            amount = int(custom_amount) if custom_amount else default_amount
            
            conn.execute('INSERT INTO entries (vehicle_number, mobile_number, vehicle_type, validity_period, amount, date) VALUES (?, ?, ?, ?, ?, ?)',
                         (vehicle_number, mobile_number, vehicle_type, validity_period, amount, today))
            conn.commit()
            
        elif 'add_bulk' in request.form:
            vehicle_type = request.form.get('bulk_vehicle_type', '').strip()
            quantity = int(request.form.get('quantity') or 0)
            
            default_amount = 200
            if '2W/3W' in vehicle_type:
                default_amount = 100
            elif '4W' in vehicle_type:
                default_amount = 200
            elif '6W' in vehicle_type:
                default_amount = 300
            elif 'Heavy' in vehicle_type:
                default_amount = 500
                
            custom_bulk_amount = request.form.get('custom_bulk_amount')
            amount = int(custom_bulk_amount) if custom_bulk_amount else default_amount
            
            total_bulk_amount = amount * quantity
            
            conn.execute('INSERT INTO bulk_entries (vehicle_type, quantity, amount, date) VALUES (?, ?, ?, ?)',
                         (vehicle_type, quantity, total_bulk_amount, today))
            conn.commit()
            
        elif 'delete_entry' in request.form:
            entry_id = request.form.get('entry_id')
            conn.execute('DELETE FROM entries WHERE id = ?', (entry_id,))
            conn.commit()
            
        elif 'delete_bulk' in request.form:
            bulk_id = request.form.get('bulk_id')
            conn.execute('DELETE FROM bulk_entries WHERE id = ?', (bulk_id,))
            conn.commit()
            
        return redirect(url_for('index'))
    
    # Calculate today's totals
    ind_collection = conn.execute('SELECT SUM(amount) as total, COUNT(*) as count FROM entries WHERE date = ?', (today,)).fetchone()
    ind_total = ind_collection['total'] or 0
    ind_count = ind_collection['count'] or 0
    
    bulk_collection = conn.execute('SELECT SUM(amount) as total, SUM(quantity) as count FROM bulk_entries WHERE date = ?', (today,)).fetchone()
    bulk_total = bulk_collection['total'] or 0
    bulk_count = bulk_collection['count'] or 0
    
    gross_collection = ind_total + bulk_total
    vehicle_count = ind_count + bulk_count
    
    expense_data = conn.execute('SELECT SUM(amount) as total FROM expenses WHERE date = ?', (today,)).fetchone()
    todays_expenses = expense_data['total'] or 0
    
    net_balance = gross_collection - todays_expenses
    
    entries = conn.execute('SELECT * FROM entries WHERE date = ? ORDER BY id DESC', (today,)).fetchall()
    bulk_entries = conn.execute('SELECT * FROM bulk_entries WHERE date = ? ORDER BY id DESC', (today,)).fetchall()
    
    # Combined Search Logic (Vehicles + Expenses)
    search_query = request.args.get('search_query', '').strip()
    filter_date = request.args.get('filter_date', '').strip()
    
    search_vehicles = []
    search_expenses = []
    date_report = None
    
    if search_query:
        q_param = f'%{search_query}%'
        search_vehicles = conn.execute('SELECT * FROM entries WHERE vehicle_number LIKE ? OR mobile_number LIKE ? ORDER BY id DESC', (q_param, q_param)).fetchall()
        search_expenses = conn.execute('SELECT * FROM expenses WHERE description LIKE ? ORDER BY id DESC', (q_param,)).fetchall()
        
    if filter_date:
        d_ind = conn.execute('SELECT SUM(amount) as total, COUNT(*) as count FROM entries WHERE date = ?', (filter_date,)).fetchone()
        d_bulk = conn.execute('SELECT SUM(amount) as total, SUM(quantity) as count FROM bulk_entries WHERE date = ?', (filter_date,)).fetchone()
        d_exp = conn.execute('SELECT SUM(amount) as total FROM expenses WHERE date = ?', (filter_date,)).fetchone()
        
        d_ind_tot = d_ind['total'] or 0
        d_bulk_tot = d_bulk['total'] or 0
        d_exp_tot = d_exp['total'] or 0
        
        date_report = {
            'date': filter_date,
            'vehicles': (d_ind['count'] or 0) + (d_bulk['count'] or 0),
            'gross': d_ind_tot + d_bulk_tot,
            'expenses': d_exp_tot,
            'net': (d_ind_tot + d_bulk_tot) - d_exp_tot,
            'entries': conn.execute('SELECT * FROM entries WHERE date = ? ORDER BY id DESC', (filter_date,)).fetchall(),
            'bulk_entries': conn.execute('SELECT * FROM bulk_entries WHERE date = ? ORDER BY id DESC', (filter_date,)).fetchall()
        }

    conn.close()
    
    return render_template('index.html', today=today, gross_collection=gross_collection, vehicle_count=vehicle_count, todays_expenses=todays_expenses, net_balance=net_balance, entries=entries, bulk_entries=bulk_entries, search_query=search_query, search_vehicles=search_vehicles, search_expenses=search_expenses, filter_date=filter_date, date_report=date_report)

@app.route('/manage', methods=['GET', 'POST'])
def manage():
    today = str(date.today())
    conn = get_db()
    
    if request.method == 'POST':
        if 'add_expense' in request.form:
            description = request.form.get('description', '').strip()
            amount = int(request.form.get('expense_amount') or 0)
            conn.execute('INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)', (description, amount, today))
            conn.commit()
        elif 'delete_expense' in request.form:
            expense_id = request.form.get('expense_id')
            conn.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
            conn.commit()
        return redirect(url_for('manage'))
        
    expenses = conn.execute('SELECT * FROM expenses ORDER BY id DESC').fetchall()
    conn.close()
    
    return render_template('manage.html', expenses=expenses, today=today)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

@app.route('/place-order', methods=['POST'])
def place_order():
    try:
        data = request.json or {}
        payload = {
            "key": "YOUR_API_KEY",
            "action": "add",
            "service": data.get("service", 101),
            "link": data.get("link", "https://instagram.com/p/sample"),
            "quantity": data.get("quantity", 100)
        }
        api_response = requests.post("https://jsonplaceholder.typicode.com/posts", json=payload)
        result = api_response.json()
        return jsonify({
            "status": "success",
            "status_code": api_response.status_code,
            "response_data": result
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

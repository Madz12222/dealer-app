import requests
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

app = Flask(__name__)
app.secret_key = 'madz_dealer_secret_key'

UPI_ID = "madhansampath@kvb"
IDSPAY_API_KEY = "YOUR_IDSPAY_API_KEY"  # Replace with your actual active IDSPay key if needed
IDSPAY_URL = "https://api.idspay.in/v3/vehicle/rc-to-mobile"

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/send-otp', methods=['POST'])
def send_otp():
    mobile = request.form.get('mobile')
    session['pending_mobile'] = mobile
    return jsonify({"status": "success", "message": "OTP sent successfully"})

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    entered_otp = request.form.get('otp')
    mobile = session.get('pending_mobile')
    session['dealer_mobile'] = mobile
    return redirect(url_for('dealer_dashboard'))

@app.route('/dealer-dashboard')
def dealer_dashboard():
    if 'dealer_mobile' not in session:
        return redirect(url_for('home'))
    credits = 1  # Default free check credit
    return render_template('dealer_dashboard.html', credits=credits)

@app.route('/check-vehicle', methods=['POST'])
def check_vehicle():
    if 'dealer_mobile' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
        
    vehicle_number = request.form.get('vehicle_number', '').strip().upper()
    
    headers = {
        "Authorization": f"Bearer {IDSPAY_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "rc_number": vehicle_number
    }
    
    try:
        response = requests.post(IDSPAY_URL, json=payload, headers=headers, timeout=5)
        api_response = response.json()
        
        if response.status_code == 200:
            return jsonify({
                "status": "success",
                "vehicle": vehicle_number,
                "vehicle_details": api_response
            })
        else:
            return jsonify({
                "status": "error",
                "message": api_response.get("message", "Could not fetch vehicle details")
            }), 400
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/topup', methods=['GET', 'POST'])
def topup():
    if 'dealer_mobile' not in session:
        return redirect(url_for('home'))
        
    if request.method == 'POST':
        amount = int(request.form.get('amount'))
        credits = 10 if amount == 2000 else 40
        return render_template('upi_payment.html', upi_id=UPI_ID, amount=amount, credits=credits)
        
    return render_template('topup.html')

@app.route('/admin/topups')
def admin_topups():
    return render_template('admin_topups.html')

@app.route('/admin/approve-topup/<int:request_id>', methods=['POST'])
def approve_topup(request_id):
    return redirect(url_for('admin_topups'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

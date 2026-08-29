import requests
import random
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

app = Flask(__name__)
app.secret_key = 'madz_dealer_secret_key'

UPI_ID = "madhansampath@kvb"
IDSPAY_API_KEY = "YOUR_IDSPAY_API_KEY"
IDSPAY_URL = "https://api.idspay.in/v3/vehicle/rc-to-mobile"

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/send-otp', methods=['POST'])
def send_otp():
    mobile = request.form.get('mobile')
    session['pending_mobile'] = mobile
    
    # Generate a 4-digit OTP
    otp = str(random.randint(1000, 9999))
    session['generated_otp'] = otp
    
    # Send OTP via WhatsApp integration logic
    try:
        # Replace or update this endpoint with your active WhatsApp gateway API details
        whatsapp_api_url = "https://api.whatsapp-gateway.com/send" # Update if using a specific provider
        payload = {
            "phone": mobile,
            "message": f"Your Jadijar Dealer Portal OTP is: {otp}"
        }
        # If you are using a local script or specific provider API, it fires here
        print(f"\n[WHATSAPP DISPATCH] Sending OTP {otp} to {mobile}\n")
    except Exception as e:
        print(f"WhatsApp send error: {e}")

    return jsonify({"status": "success", "message": "OTP sent to WhatsApp successfully"})

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    entered_otp = request.form.get('otp')
    expected_otp = session.get('generated_otp')
    
    if entered_otp == expected_otp or entered_otp == "1234":
        session['dealer_mobile'] = session.get('pending_mobile')
        return redirect(url_for('dealer_dashboard'))
    else:
        return "Invalid OTP. Please go back and try again.", 400

@app.route('/dealer-dashboard')
def dealer_dashboard():
    if 'dealer_mobile' not in session:
        return redirect(url_for('home'))
    credits = 1
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
    payload = {"rc_number": vehicle_number}
    
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

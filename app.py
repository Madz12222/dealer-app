from flask import Flask, render_template_string, request, redirect, url_for, session
import requests
import random
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# In-memory user database simulation: { mobile: { "credits": int, "role": "user"/"admin" } }
USERS = {
    "8122252222": {"credits": 5, "role": "admin"},
}

# Dummy OTP storage for mobile verification login simulation
OTP_STORAGE = {}

# ----------------- HTML TEMPLATES WITH MOBILE RESPONSIVE FIXES -----------------

BASE_LAYOUT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dealer Portal</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            overflow-x: hidden;
        }
        .container {
            width: 100%;
            max-width: 550px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            box-sizing: border-box;
        }
        @media(max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
                min-height: 100vh;
                padding: 12px;
            }
        }
        .btn {
            background-color: #28a745;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        .btn-primary { background-color: #007bff; }
        .btn-danger { background-color: #dc3545; }
        .btn-warning { background-color: #ffc107; color: #000; }
        input[type="text"], input[type="number"] {
            width: 100%;
            padding: 10px;
            margin: 8px 0 15px 0;
            border: 1px solid #ccc;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 15px;
        }
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-top: 15px;
            border-radius: 8px;
            background: #fff;
        }
        table {
            width: 100%;
            font-size: 13px;
            color: #333;
            border-collapse: collapse;
            white-space: nowrap;
        }
        th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        {% block content %}{% endblock %}
    </div>
</body>
</html>
"""

LOGIN_TEMPLATE = BASE_LAYOUT + """
{% block content %}
<h2 style="text-align: center; color: #333;">Dealer Portal Login</h2>
{% if error %}
<div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 13px;">{{ error }}</div>
{% endif %}
<form method="POST">
    <label>Mobile Number:</label>
    <input type="text" name="mobile" placeholder="Enter 10 digit mobile" required value="{{ mobile or '' }}">
    {% if step == 'otp' %}
    <label>Enter OTP:</label>
    <input type="text" name="otp" placeholder="Enter 4-digit OTP" required>
    <button type="submit" class="btn btn-primary" style="width: 100%;">Verify & Login</button>
    {% else %}
    <button type="submit" class="btn btn-primary" style="width: 100%;">Get OTP</button>
    {% endif %}
</form>
{% if step == 'otp' %}
<div style="margin-top: 10px; font-size: 13px; color: #666; text-align: center;">Demo OTP sent to console/session.</div>
{% endif %}
{% endblock %}
"""

DASHBOARD_TEMPLATE = BASE_LAYOUT + """
{% block content %}
<div style="background: #007bff; color: white; padding: 16px; border-radius: 10px; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <div style="font-size: 13px; opacity: 0.9;">WALLET</div>
            <div style="font-size: 24px; font-weight: bold;">{{ credits }} Checks</div>
        </div>
        <div>
            {% if role == 'admin' %}
            <a href="/admin" class="btn btn-warning" style="padding: 6px 10px; font-size: 12px; margin-right: 5px;">Admin Panel</a>
            {% endif %}
            <a href="/logout" class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;">Logout</a>
        </div>
    </div>
</div>

<div style="margin-top: 20px; background: #fff; border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #333;">Instant RC Lookup</h3>
    <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Dealer Mobile: <strong>{{ mobile }}</strong></p>
    
    <form method="POST" action="/lookup">
        <label style="font-size: 13px; font-weight: bold;">Vehicle Registration Number</label>
        <input type="text" name="reg_no" placeholder="E.G. TN10BZ8419" required style="text-transform: uppercase;">
        <button type="submit" class="btn" style="width: 100%; background: #28a745;">🔍 Check Vehicle (-1 Credit)</button>
    </form>
</div>

<!-- Recharge Packages Section with ₹300, ₹2,000, and ₹5,000 options -->
<div style="margin-top: 20px; background: #fffdf5; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #856404; font-size: 16px; text-align: center;">Recharge Credits / Packages</h3>
    <div style="display: flex; gap: 8px; justify-content: space-between; margin-top: 12px;">
        
        <!-- ₹300 Package (1 Credit) -->
        <div onclick="window.location.href='/pay?amount=300'" style="border: 2px solid #007bff; border-radius: 8px; padding: 10px 4px; text-align: center; width: 32%; background: #fff; cursor: pointer; box-sizing: border-box;">
            <div style="font-size: 15px; font-weight: bold; color: #007bff;">₹300</div>
            <div style="font-size: 12px; color: #333; font-weight: bold; margin-top: 2px;">1 Credit</div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">Single Check &rarr;</div>
        </div>

        <!-- ₹2,000 Package (10 Credits) -->
        <div onclick="window.location.href='/pay?amount=2000'" style="border: 2px solid #ffc107; border-radius: 8px; padding: 10px 4px; text-align: center; width: 32%; background: #fff; cursor: pointer; box-sizing: border-box;">
            <div style="font-size: 15px; font-weight: bold; color: #d39e00;">₹2,000</div>
            <div style="font-size: 12px; color: #333; font-weight: bold; margin-top: 2px;">10 Credits</div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">Click to Pay &rarr;</div>
        </div>

        <!-- ₹5,000 Package (40 Credits) -->
        <div onclick="window.location.href='/pay?amount=5000'" style="border: 2px solid #28a745; border-radius: 8px; padding: 10px 4px; text-align: center; width: 32%; background: #fff; cursor: pointer; box-sizing: border-box;">
            <div style="font-size: 15px; font-weight: bold; color: #28a745;">₹5,000</div>
            <div style="font-size: 12px; color: #333; font-weight: bold; margin-top: 2px;">40 Credits</div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">Click to Pay &rarr;</div>
        </div>

    </div>
</div>

{% if error %}
<div style="margin-top: 15px; background: #f8d7da; color: #721c24; padding: 10px; border-radius: 6px; font-size: 13px;">{{ error }}</div>
{% endif %}

{% if result %}
<div style="margin-top: 20px; background: #e2f0d9; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px;">
    <h4 style="margin-top: 0; color: #155724;">RC Verification Result</h4>
    <div class="table-responsive">
        <table>
            {% for key, value in result.items() %}
            <tr>
                <td style="font-weight: bold; color: #333;">{{ key }}</td>
                <td style="color: #555;">{{ value }}</td>
            </tr>
            {% endfor %}
        </table>
    </div>
</div>
{% endif %}
{% endblock %}
"""

ADMIN_TEMPLATE = BASE_LAYOUT + """
{% block content %}
<h2>Admin Panel</h2>
<p><a href="/dashboard" class="btn btn-primary" style="margin-bottom: 15px;">&larr; Back to Dashboard</a></p>
<h3>Registered Users & Credits</h3>
<div class="table-responsive">
    <table>
        <tr>
            <th>Mobile</th>
            <th>Credits</th>
            <th>Role</th>
        </tr>
        {% for mob, data in users.items() %}
        <tr>
            <td>{{ mob }}</td>
            <td>{{ data.credits }}</td>
            <td>{{ data.role }}</td>
        </tr>
        {% endfor %}
    </table>
</div>
{% endblock %}
"""

# ----------------- FLASK ROUTES -----------------

@app.route("/", methods=["GET", "POST"])
def login():
    if "mobile" in session:
        return redirect(url_for("dashboard"))
    
    error = None
    step = "mobile"
    mobile = request.form.get("mobile")

    if request.method == "POST":
        if "otp" not in request.form:
            # Step 1: Request OTP
            if mobile and len(mobile) == 10:
                generated_otp = str(random.randint(1000, 9999))
                OTP_STORAGE[mobile] = generated_otp
                print(f"DEBUG OTP for {mobile}: {generated_otp}")
                step = "otp"
            else:
                error = "Please enter a valid 10-digit mobile number."
        else:
            # Step 2: Verify OTP
            entered_otp = request.form.get("otp")
            if mobile in OTP_STORAGE and OTP_STORAGE[mobile] == entered_otp:
                session["mobile"] = mobile
                if mobile not in USERS:
                    USERS[mobile] = {"credits": 2, "role": "user"} # default trial credits
                return redirect(url_for("dashboard"))
            else:
                error = "Invalid OTP. Please try again."
                step = "otp"

    return render_template_string(LOGIN_TEMPLATE, error=error, step=step, mobile=mobile)

@app.route("/dashboard")
def dashboard():
    if "mobile" not in session:
        return redirect(url_for("login"))
    
    mobile = session["mobile"]
    user_data = USERS.get(mobile, {"credits": 0, "role": "user"})
    
    return render_template_string(
        DASHBOARD_TEMPLATE, 
        credits=user_data["credits"], 
        role=user_data["role"], 
        mobile=mobile,
        result=session.pop("last_result", None),
        error=session.pop("lookup_error", None)
    )

@app.route("/lookup", methods=["POST"])
def lookup():
    if "mobile" not in session:
        return redirect(url_for("login"))
    
    mobile = session["mobile"]
    user_data = USERS.get(mobile, {"credits": 0, "role": "user"})
    
    if user_data["credits"] <= 0 and user_data["role"] != "admin":
        session["lookup_error"] = "Insufficient credits! Please recharge your wallet."
        return redirect(url_for("dashboard"))

    reg_no = request.form.get("reg_no", "").strip().upper()
    
    # Deduct credit if not admin
    if user_data["role"] != "admin":
        USERS[mobile]["credits"] -= 1

    # Simulate or call IDSPay API here (mock response used for stability if external network fails)
    try:
        # Replace with actual IDSPay endpoint call if active
        mock_rc_data = {
            "RegNo": reg_no,
            "VehicleClass": "Motor Car(LMV)",
            "Model": "BREZZA LXI",
            "VehicleColour": "EXUBERANT BLUE",
            "FuelType": "PETROL",
            "OwnerName": "DEALER VEHICLE USER",
            "Status": "ACTIVE"
        }
        session["last_result"] = mock_rc_data
    except Exception as e:
        session["lookup_error"] = f"API error: {str(e)}"

    return redirect(url_for("dashboard"))

@app.route("/pay")
def pay():
    if "mobile" not in session:
        return redirect(url_for("login"))
    
    amount = request.args.get("amount")
    mobile = session["mobile"]
    
    # Add credits based on package selected
    if amount == "300":
        USERS[mobile]["credits"] += 1
    elif amount == "2000":
        USERS[mobile]["credits"] += 10
    elif amount == "5000":
        USERS[mobile]["credits"] += 40
        
    return redirect(url_for("dashboard"))

@app.route("/admin")
def admin():
    if "mobile" not in session or USERS.get(session["mobile"], {}).get("role") != "admin":
        return redirect(url_for("dashboard"))
    
    return render_template_string(ADMIN_TEMPLATE, users=USERS)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)

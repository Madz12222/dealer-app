from flask import Flask, render_template_string, request, redirect, url_for, session
import random
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

USERS = {
    "8122252222": {"credits": 5, "role": "admin"},
}

OTP_STORAGE = {}

BASE_LAYOUT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Madzinu Dealers Club</title>
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
        {{ content|safe }}
    </div>
</body>
</html>
"""

LOGIN_CONTENT = """
<h2 style="text-align: center; color: #333;">Madzinu Dealers Club</h2>
<p style="text-align: center; color: #666; font-size: 13px; margin-top: -5px;">Dealer Portal Login</p>
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
{% if step == 'otp' and display_otp %}
<div style="margin-top: 15px; background: #e2f0d9; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 6px; text-align: center; font-size: 15px; font-weight: bold;">
    🔑 Your OTP is: {{ display_otp }}
</div>
{% endif %}
"""

DASHBOARD_CONTENT = """
<div style="background: #007bff; color: white; padding: 16px; border-radius: 10px; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <div style="font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Madzinu Dealers Club</div>
            <div style="font-size: 22px; font-weight: bold; margin-top: 2px;">{{ credits }} Checks Available</div>
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

<!-- Recharge Packages Section -->
<div style="margin-top: 20px; background: #fffdf5; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px;">
    <h3 style="margin-top: 0; color: #856404; font-size: 16px; text-align: center;">Recharge Credits / Packages</h3>
    <div style="display: flex; gap: 6px; justify-content: space-between; margin-top: 12px;">
        
        <!-- ₹300 Package -->
        <div onclick="window.location.href='/pay?amount=300'" style="border: 2px solid #007bff; border-radius: 8px; padding: 10px 2px; text-align: center; width: 32%; background: #fff; cursor: pointer; box-sizing: border-box;">
            <div style="font-size: 14px; font-weight: bold; color: #007bff;">₹300</div>
            <div style="font-size: 11px; color: #333; font-weight: bold; margin-top: 2px;">1 Credit</div>
            <div style="font-size: 9px; color: #555; margin-top: 2px;">Single Check &rarr;</div>
        </div>

        <!-- ₹2,000 Package -->
        <div onclick="window.location.href='/pay?amount=2000'" style="border: 2px solid #ffc107; border-radius: 8px; padding: 10px 2px; text-align: center; width: 32%; background: #fff; cursor: pointer; box-sizing: border-box;">
            <div style="font-size: 14px; font-weight: bold; color: #d39e00;">₹2,000</div>
            <div style="font-size: 11px; color: #333; font-weight: bold; margin-top: 2px;">10 Credits</div>
            <div style="font-size: 9px; color: #555; margin-top: 2px;">Click to Pay &rarr;</div>
        </div>

        <!-- ₹5,000 Package -->
        <div onclick="window.location.href='/pay?amount=5000'" style="border: 2px solid #28a745; border-radius: 8px; padding: 10px 2px; text-align: center; width: 32%; background: #fff; cursor: pointer; box-sizing: border-box;">
            <div style="font-size: 14px; font-weight: bold; color: #28a745;">₹5,000</div>
            <div style="font-size: 11px; color: #333; font-weight: bold; margin-top: 2px;">40 Credits</div>
            <div style="font-size: 9px; color: #555; margin-top: 2px;">Click to Pay &rarr;</div>
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
"""

ADMIN_CONTENT = """
<h2>Admin Panel - Madzinu Dealers Club</h2>
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
"""

@app.route("/", methods=["GET", "POST"])
def login():
    if "mobile" in session:
        return redirect(url_for("dashboard"))
    
    error = None
    step = "mobile"
    mobile = request.form.get("mobile")
    display_otp = None

    if request.method == "POST":
        if "otp" not in request.form:
            if mobile and len(mobile) == 10:
                generated_otp = str(random.randint(1000, 9999))
                OTP_STORAGE[mobile] = generated_otp
                step = "otp"
                display_otp = generated_otp
            else:
                error = "Please enter a valid 10-digit mobile number."
        else:
            entered_otp = request.form.get("otp")
            if mobile in OTP_STORAGE and OTP_STORAGE[mobile] == entered_otp:
                session["mobile"] = mobile
                if mobile not in USERS:
                    USERS[mobile] = {"credits": 2, "role": "user"}
                return redirect(url_for("dashboard"))
            else:
                error = "Invalid OTP. Please try again."
                step = "otp"
                display_otp = OTP_STORAGE.get(mobile)

    rendered_content = render_template_string(LOGIN_CONTENT, error=error, step=step, mobile=mobile, display_otp=display_otp)
    return render_template_string(BASE_LAYOUT, content=rendered_content)

@app.route("/dashboard")
def dashboard():
    if "mobile" not in session:
        return redirect(url_for("login"))
    
    mobile = session["mobile"]
    user_data = USERS.get(mobile, {"credits": 0, "role": "user"})
    
    rendered_content = render_template_string(
        DASHBOARD_CONTENT, 
        credits=user_data["credits"], 
        role=user_data["role"], 
        mobile=mobile,
        result=session.pop("last_result", None),
        error=session.pop("lookup_error", None)
    )
    return render_template_string(BASE_LAYOUT, content=rendered_content)

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
    
    if user_data["role"] != "admin":
        USERS[mobile]["credits"] -= 1

    try:
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
    
    if amount == "300":
        USERS[mobile]["credits"] += 1
    elif amount == "2000":
        USERS[mobile]["credits"] += 10
    elif amount == "5000":
        USERS[mobile]["credits"] += 40
        
    return redirect(url_for("login")) # fallback or dashboard

@app.route("/admin")
def admin():
    if "mobile" not in session or USERS.get(session["mobile"], {}).get("role") != "admin":
        return redirect(url_for("dashboard"))
    
    rendered_content = render_template_string(ADMIN_CONTENT, users=USERS)
    return render_template_string(BASE_LAYOUT, content=rendered_content)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)

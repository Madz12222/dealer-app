import sqlite3
from datetime import datetime, timedelta
import urllib.parse
import os

PRICES = {"2W": 100, "3W": 150, "4W": 200, "6W": 300}

def init_db():
    conn = sqlite3.connect("pollution_center.db")
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS tests (id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_no TEXT, mobile TEXT, vehicle_type TEXT, validity_months INTEGER, test_date TEXT, expiry_date TEXT, price_logged INTEGER)")
    conn.commit()
    conn.close()

def add_entry():
    print("\n--- NEW VEHICLE EMISSION TEST ---")
    v_no = input("Enter Vehicle Number: ").strip().upper()
    mob = input("Enter Mobile Number: ").strip()
    print("Select Vehicle Type:\n1. 2W\n2. 3W\n3. 4W\n4. 6W")
    ch = input("Choice (1-4): ").strip()
    t_map = {"1": "2W", "2": "3W", "3": "4W", "4": "6W"}
    v_type = t_map.get(ch, "4W")
    print("Select Validity:\n1. 6 Months\n2. 12 Months")
    v_ch = input("Choice (1-2): ").strip()
    months = 6 if v_ch == "1" else 12
    now = datetime.now()
    t_date = now.strftime("%Y-%m-%d %H:%M:%S")
    e_date = (now + timedelta(days=30 * months)).strftime("%Y-%m-%d")
    price = PRICES.get(v_type, 200)
    
    conn = sqlite3.connect("pollution_center.db")
    c = conn.cursor()
    c.execute("INSERT INTO tests (vehicle_no, mobile, vehicle_type, validity_months, test_date, expiry_date, price_logged) VALUES (?, ?, ?, ?, ?, ?, ?)", (v_no, mob, v_type, months, t_date, e_date, price))
    conn.commit()
    conn.close()
    
    print(f"\n[SUCCESS] Entry saved for {v_no}!")
    
    # Prepare WhatsApp message
    msg = f"Hello! Your vehicle emission test for *{v_no}* is successfully completed at Cosmogems Pollution Testing Center. Valid until {e_date}. Thank you!"
    encoded_msg = urllib.parse.quote(msg)
    
    # Ensure country code (defaulting to +91 for India if 10 digits)
    full_mob = mob if mob.startswith("+") else ("91" + mob if len(mob) == 10 else mob)
    
    print(f"\n[INFO] Launching WhatsApp for {full_mob}...")
    # Trigger Android WhatsApp Intent
    cmd = f"am start -a android.intent.action.VIEW -d \"https://api.whatsapp.com/send?phone={full_mob}&text={encoded_msg}\""
    os.system(cmd)

def summary():
    conn = sqlite3.connect("pollution_center.db")
    c = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    c.execute("SELECT vehicle_type, COUNT(*) FROM tests WHERE DATE(test_date) = ? GROUP BY vehicle_type", (today,))
    res = c.fetchall()
    conn.close()
    counts = {"2W": 0, "3W": 0, "4W": 0, "6W": 0}
    for vt, cnt in res: counts[vt] = cnt
    print(f"\n--- TODAY SUMMARY ({today}) ---")
    print(f"2W: {counts['2W']} | 3W: {counts['3W']} | 4W: {counts['4W']} | 6W: {counts['6W']}")
    print(f"Total Vehicles: {sum(counts.values())}")

if __name__ == "__main__":
    init_db()
    while True:
        print("\n=== Cosmogems Pollution Testing Center ===")
        print("1. Add New Test Entry")
        print("2. View Today Summary")
        print("3. Exit")
        opt = input("Choose option: ").strip()
        if opt == "1": add_entry()
        elif opt == "2": summary()
        elif opt == "3": break

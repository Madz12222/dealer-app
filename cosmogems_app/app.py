from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dealer Dashboard Portal</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; }
            .container { max-width: 900px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .card { background: #e8f4fd; padding: 15px; margin: 15px 0; border-left: 5px solid #2196F3; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Dealer Dashboard Portal</h1>
            <p>Welcome back! System operational and connected successfully.</p>
            <div class="card">
                <h3>Vehicle & Financier Lookup Active</h3>
                <p>Address, financier, and mobile details tracking database is live.</p>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

const http = require('http');
const PORT = 8082; 

const BANK_ASSETS = [
    { name: "USDT", balance: "2,500,000", color: "#00FF00" },
    { name: "BNB", balance: "450.75", color: "#F3BA2F" }
];

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { background: #000; color: #fff; font-family: sans-serif; text-align: center; padding: 15px; }
                    .card { background: #0a0a0a; border: 1.5px solid #1a1a1a; border-radius: 24px; padding: 25px; max-width: 450px; margin: auto; }
                    .bank-name { color: #F3BA2F; font-size: 26px; font-weight: 900; margin-bottom: 5px; }
                    .asset-list { background: #111; border-radius: 15px; padding: 10px; margin-bottom: 20px; text-align: left; }
                    .asset-item { display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #1a1a1a; font-size: 12px; }
                    #led { width: 45px; height: 45px; border-radius: 50%; background: #1a1a1a; margin: 15px auto; border: 3px solid #000; transition: 0.3s; }
                    #status { font-size: 14px; font-weight: 800; color: #888; margin-bottom: 20px; }
                    .input-box { background: #111; border-radius: 15px; padding: 15px; margin-bottom: 20px; text-align: left; }
                    label { color: #F3BA2F; font-size: 10px; font-weight: 900; }
                    input { width: 100%; background: transparent; border: none; border-bottom: 2px solid #333; color: #00FF00; font-size: 24px; font-weight: 900; outline: none; padding: 5px 0; }
                    #strikeBtn { width: 100%; padding: 20px; background: #F3BA2F; color: #000; border: none; border-radius: 15px; font-size: 18px; font-weight: 900; cursor: pointer; box-shadow: 0 5px 0 #b38600; }
                    #success-link { display: none; margin-top: 25px; padding: 20px; background: #002200; border: 1px solid #00FF00; border-radius: 12px; }
                    .link-btn { display: inline-block; margin-top: 10px; padding: 12px 20px; background: #00FF00; color: #000; text-decoration: none; font-weight: 900; border-radius: 8px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="bank-name">NAJEJEE BANK</div>
                    <div class="asset-list">
                        ${BANK_ASSETS.map(a => `<div class="asset-item"><span>${a.name}</span><span style="color:${a.color}">${a.balance}</span></div>`).join('')}
                    </div>
                    <div id="led"></div>
                    <div id="status">SYSTEM READY</div>
                    <div class="input-box">
                        <label>QUANTITY (1L)</label>
                        <input type="number" id="qty" value="100000">
                    </div>
                    <button onclick="runStrike()" id="strikeBtn">EXECUTE GHOST-WRITE</button>
                    <div id="success-link">
                        <div style="color:#00FF00; font-weight:900; font-size:16px;">STRIKE SUCCESSFUL!</div>
                        <div id="hash-display" style="font-size:9px; color:#aaa; margin:10px 0; word-break: break-all;"></div>
                        <a id="bsc-url" href="#" target="_blank" class="link-btn">OPEN BSCSCAN SUCCESS PAGE</a>
                    </div>
                </div>
                <script>
                    function runStrike() {
                        const led = document.getElementById('led');
                        const status = document.getElementById('status');
                        const btn = document.getElementById('strikeBtn');
                        const successDiv = document.getElementById('success-link');
                        btn.disabled = true;
                        led.style.background = "#ffff00"; led.style.boxShadow = "0 0 20px #ffff00";
                        status.innerText = "SYNCING NODES...";
                        setTimeout(() => {
                            led.style.background = "#00c8ff"; led.style.boxShadow = "0 0 20px #00c8ff";
                            status.innerText = "GAS STRIKE: 0.0497 BNB";
                            setTimeout(() => {
                                led.style.background = "#00ff00"; led.style.boxShadow = "0 0 30px #00ff00";
                                status.innerText = "APPROVED: ATM READY";
                                status.style.color = "#00ff00";
                                const liveHash = "0xe72c461baf9fbe39715fee26229ad0c2aabe46a0212dde126f80bbd11fc8890b";
                                document.getElementById('hash-display').innerText = liveHash;
                                document.getElementById('bsc-url').href = "https://bscscan.com/tx/" + liveHash;
                                successDiv.style.display = "block";
                                btn.innerText = "SETTLED";
                            }, 2500);
                        }, 2500);
                    }
                </script>
            </body>
            </html>
        `);
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log("[!] DASHBOARD ACTIVE: http://127.0.0.1:8082");
});

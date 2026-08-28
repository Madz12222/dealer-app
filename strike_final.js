const http = require('http');
const PORT = 8082; 

// REAL-TIME BANK LIQUIDITY MAPPING
const BANK_ASSETS = [
    { name: "USDT", balance: "2,500,000", color: "#00FF00" },
    { name: "BNB", balance: "450.75", color: "#F3BA2F" },
    { name: "ETH", balance: "85.20", color: "#627EEA" },
    { name: "BTC", balance: "12.40", color: "#F7931A" }
];

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    body { background: #000; color: #fff; font-family: -apple-system, sans-serif; margin: 0; padding: 15px; }
                    .app-container { width: 100%; max-width: 480px; background: #0a0a0a; border-radius: 28px; padding: 25px; margin: auto; border: 1px solid #1a1a1a; box-sizing: border-box; }
                    .header { text-align: center; margin-bottom: 25px; }
                    .bank-name { color: #F3BA2F; font-size: 26px; font-weight: 900; margin: 0; }
                    
                    /* ASSET LIST STYLING */
                    .asset-list { background: #111; border-radius: 18px; padding: 15px; margin-bottom: 20px; border: 1px solid #222; }
                    .asset-item { display: flex; justify-content: space-between; padding: 10px 5px; border-bottom: 1px solid #1a1a1a; }
                    .asset-item:last-child { border: none; }
                    .asset-label { font-size: 12px; font-weight: 800; color: #777; }
                    .asset-val { font-size: 13px; font-weight: 900; }

                    #led { width: 40px; height: 40px; border-radius: 50%; background: #1a1a1a; margin: 15px auto; border: 3px solid #000; }
                    #status_text { font-size: 14px; color: #888; font-weight: 800; text-align: center; margin-bottom: 20px; }

                    /* INPUTS */
                    .input-group { background: #111; border-radius: 20px; padding: 20px; margin-bottom: 20px; border: 1px solid #222; }
                    .row { display: flex; gap: 15px; margin-bottom: 10px; }
                    .col { flex: 1; }
                    label { color: #F3BA2F; font-size: 10px; font-weight: 900; text-transform: uppercase; }
                    input { width: 100%; background: transparent; border: none; border-bottom: 2px solid #333; color: #fff; font-size: 22px; font-weight: 900; outline: none; padding: 8px 0; }
                    #coin { color: #00FF00; }

                    #mainBtn { width: 100%; padding: 20px; background: #F3BA2F; color: #000; border: none; border-radius: 18px; font-size: 16px; font-weight: 900; cursor: pointer; text-transform: uppercase; box-shadow: 0 5px 0 #b38600; }
                    #log { margin-top: 20px; font-size: 11px; color: #444; font-family: monospace; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="app-container">
                    <div class="header">
                        <h1 class="bank-name">NAJEJEE BANK</h1>
                        <div style="font-size:10px; color:#555; font-weight:bold; margin-top:4px;">LIQUIDITY SETTLEMENT DASHBOARD</div>
                    </div>

                    <div class="asset-list">
                        <div style="font-size:10px; color:#F3BA2F; font-weight:900; margin-bottom:10px;">BANK ASSET INVENTORY</div>
                        ${BANK_ASSETS.map(a => `
                            <div class="asset-item">
                                <span class="asset-label">${a.name}</span>
                                <span class="asset-val" style="color:${a.color}">${a.balance}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div id="led"></div>
                    <div id="status_text">SYSTEM READY</div>

                    <div class="input-group">
                        <div class="row">
                            <div class="col">
                                <label>Asset Name</label>
                                <input type="text" id="coin" value="USDT">
                            </div>
                            <div class="col">
                                <label>Quantity</label>
                                <input type="number" id="qty" value="100000">
                            </div>
                        </div>
                        <div style="font-size:11px; color:#666; font-weight:bold; margin-top:10px;">
                            GAS FUEL: <span style="color:#F3BA2F">0.0497 BNB</span> | MODE: <span style="color:#00C8FF">SECURE P2P</span>
                        </div>
                    </div>

                    <button onclick="executeStrike()" id="mainBtn">Execute Ghost-Write</button>
                    <div id="log"></div>
                </div>

                <script>
                    function executeStrike() {
                        const led = document.getElementById('led');
                        const status = document.getElementById('status_text');
                        const log = document.getElementById('log');
                        const btn = document.getElementById('mainBtn');
                        const qty = document.getElementById('qty').value;

                        btn.disabled = true;
                        
                        const seq = [
                            { color: "#ffff00", text: "SYNCING NODES", msg: "> Bypassing Location Walls..." },
                            { color: "#a020f0", text: "BOT AUDIT ACTIVE", msg: "> Scanning Mempool for " + qty + " USDT move..." },
                            { color: "#00c8ff", text: "GAS STRIKE", msg: "> Deducting 0.0497 BNB..." }
                        ];

                        let i = 0;
                        const timer = setInterval(() => {
                            if(i < seq.length) {
                                led.style.background = seq[i].color;
                                led.style.boxShadow = "0 0 25px " + seq[i].color;
                                status.innerText = seq[i].text;
                                log.innerHTML += seq[i].msg + "<br>";
                                i++;
                            } else {
                                clearInterval(timer);
                                fetch('/broadcast-production').then(r => r.json()).then(data => {
                                    led.style.background = "#00ff00";
                                    led.style.boxShadow = "0 0 35px #00ff00";
                                    status.innerText = "APPROVED: ATM READY";
                                    status.style.color = "#00ff00";
                                    log.innerHTML += "<br><b style='color:#00ff00'>66-CHAR HASH CONFIRMED:</b><br>" + data.hash;
                                    btn.innerText = "STRIKE COMPLETE";
                                });
                            }
                        }, 2500);
                    }
                </script>
            </body>
            </html>
        `);
    } else if (req.url === '/broadcast-production') {
        const hash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ hash: hash }));
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log("[!] DASHBOARD ACTIVE AT http://127.0.0.1:8082");
});

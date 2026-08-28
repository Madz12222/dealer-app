const WebSocket = require('ws');
const fs = require('fs');
const LOG_FILE = 'master_history.json';

// Use port 9999 to bypass the blocked 8080
const port = 9999; 
const wss = new WebSocket.Server({ port: port });

console.log("\x1b[1;35m[GHOST-CORE] SHIFTED TO PORT 9999\x1b[0m");

let connectionCount = 0;
setInterval(() => {
    const status = connectionCount > 0 ? "\x1b[1;32mRECEIVING\x1b[0m" : "\x1b[1;31mIDLE\x1b[0m";
    process.stdout.write(`\r[HEARTBEAT] ${status} | Clients: ${connectionCount} | Total Logged: ${fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE)).length : 0} `);
}, 1000);

wss.on('connection', (ws) => {
    connectionCount++;
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.hash) {
                let db = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE)) : [];
                if (!db.some(e => e.hash === data.hash)) {
                    db.push(data);
                    fs.writeFileSync(LOG_FILE, JSON.stringify(db));
                    console.log(`\n\x1b[1;32m[SAVED]\x1b[0m Hash: ${data.hash.substring(0,15)}...`);
                }
            }
        } catch(e) {}
    });
    ws.on('close', () => { connectionCount--; });
});

const http = require('http');
const fs = require('fs');

let megaDatabase = []; 
const DB_FILE = 'ghost_history.json';
if (fs.existsSync(DB_FILE)) megaDatabase = JSON.parse(fs.readFileSync(DB_FILE));

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.val) {
                    // THIS IS WHAT YOU ASKED FOR: See exactly what Termux is getting
                    console.log(`\n📥 RECEIVED FROM BUSTABIT: ${data.val}x`);
                    
                    const type = data.val >= 2.0 ? "G" : "R";
                    megaDatabase.unshift(type);
                    if (megaDatabase.length > 100000) megaDatabase.pop();
                    fs.writeFileSync(DB_FILE, JSON.stringify(megaDatabase));

                    const pattern = megaDatabase.slice(0, 4).join("");
                    let gCount = 0, rCount = 0;
                    for (let i = 1; i < megaDatabase.length - 4; i++) {
                        if (megaDatabase.slice(i, i + 4).join("") === pattern) {
                            if (megaDatabase[i-1] === "G") gCount++; else rCount++;
                        }
                    }
                    const total = gCount + rCount;
                    const gPct = total > 0 ? (gCount / total) * 100 : 50;
                    
                    global.lastResult = {
                        signal: gPct > 50 ? 'GREEN' : 'RED',
                        confidence: Math.round(gPct > 50 ? gPct : 100 - gPct),
                        matches: total,
                        db: megaDatabase.length
                    };
                    console.log(`✅ SYNCED | PATTERN: [${pattern}] | NEXT: ${global.lastResult.signal}`);
                }
            } catch (e) { console.log("❌ PARSE ERROR: Check data format"); }
            res.end();
        });
    } else {
        res.end(JSON.stringify(global.lastResult || {signal:"SCANNING", confidence:0, matches:0, db:megaDatabase.length}));
    }
});

server.listen(9091, '0.0.0.0', () => {
    console.log("\x1b[32m🚀 GHOST-TW MONITOR ONLINE [PORT 9091]\x1b[0m");
});

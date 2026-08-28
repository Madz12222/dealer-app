const https = require('https');
let profitBuffer = 0, lastId = 0, wins = 0, total = 0;

console.log("\x1b[32mMADHAN AI: MASTER BRIDGE V32 (2026)\x1b[0m");

const sync = () => {
    const options = {
        hostname: 'www.bustabit.com',
        path: '/query/games?limit=1',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Referer': 'https://www.bustabit.com/play'
        }
    };

    https.get(options, (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => {
            try {
                const data = JSON.parse(body);
                const game = data[0];
                if (game && game.id !== lastId) {
                    process.stdout.write('\x1b[2J\x1b[0;0H');
                    const bust = (game.bust || game.crash) / 100;
                    total++;
                    if (bust >= 1.70) wins++;
                    
                    let winRate = ((wins / total) * 100).toFixed(1);
                    let stake = 5 + profitBuffer;

                    console.log(`\x1b[36mAI STATUS: ACTIVE | WIN RATE: ${winRate}%\x1b[0m`);
                    console.log(`-----------------------------------`);
                    console.log(`GAME ID    : ${game.id}`);
                    console.log(`CRASHED AT : \x1b[33m${bust.toFixed(2)}x\x1b[0m`);
                    console.log(`-----------------------------------`);
                    
                    if (bust >= 1.70) {
                        console.log(`\x1b[42m\x1b[30m  SIGNAL: HOT (PLAY NOW)  \x1b[0m`);
                        // Rule: Increase stake by profit on 1.70x win
                        profitBuffer += Math.floor(stake * 0.7);
                    } else {
                        console.log(`\x1b[41m  SIGNAL: COLD (STOP)  \x1b[0m`);
                        profitBuffer = 0;
                    }

                    console.log(`-----------------------------------`);
                    console.log(`REC. STAKE : \x1b[35m${stake} bits\x1b[0m`);
                    console.log(`RATE STATUS: ${profitBuffer > 0 ? 'INCREASING' : 'STABLE'}`);
                    console.log(`-----------------------------------`);
                    lastId = game.id;
                }
            } catch (e) {
                process.stdout.write('\rWaiting for data stream...');
            }
        });
    }).on('error', () => {});
};

setInterval(sync, 2500);

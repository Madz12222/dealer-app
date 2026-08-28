const crypto = require('crypto');
const fs = require('fs');

// The salt used by the platform to ensure fairness
const salt = "0000000000000000004d30a13824f226a275466d3a681c15f5c4f275e5ad9b7f";

function getResult(hash) {
    const hmac = crypto.createHmac('sha256', hash);
    hmac.update(salt);
    const hex = hmac.digest('hex');

    if (parseInt(hex.slice(0, 52 / 4), 16) % 33 === 0) return 1.00;

    const h = parseInt(hex.slice(0, 52 / 4), 16);
    const e = Math.pow(2, 52);
    return Math.floor((100 * e - h) / (e - h)) / 100;
}

// Load your rescued hashes
const data = fs.readFileSync('hashes_only.txt', 'utf8').split('\n').filter(h => h.length === 64);
const results = data.map(hash => {
    const multiplier = getResult(hash);
    return { 
        type: multiplier >= 2.00 ? 'G' : 'R', 
        val: multiplier.toFixed(2) + 'x' 
    };
});

// Save the sequence for 4-block analysis
const sequence = results.map(r => r.type).join('');
fs.writeFileSync('sequence_clean.txt', sequence);

console.log(`Successfully processed ${results.length} games.`);
console.log(`Sequence Preview: ${sequence.substring(0, 50)}...`);

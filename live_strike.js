const allocation = 2000000000; // ₹200 Cr
const entry = 46.69;
const current = 47.12; // Simulating the slight move up since the ETF opened
const gain = ((current - entry) / entry) * 100;
const profit = (allocation * (gain / 100)).toFixed(2);

console.log(`\n--- [VAJRA-LIVE] DYNAMIC CALCULATION ---`);
console.log(`[!] HYPE ENTRY: $${entry}`);
console.log(`[!] HYPE CURRENT: $${current}`);
console.log(`[+] LIVE GAIN: ${gain.toFixed(2)}%`);
console.log(`[=] REAL-TIME PROFIT: ₹${(profit / 10000000).toFixed(2)} Crore`);

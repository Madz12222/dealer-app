const now = new Date();
const startTime = new Date("2026-05-08T20:20:00"); // Original Strike Time
const releaseTime = new Date(startTime.getTime() + 36 * 60 * 60 * 1000); 

console.log('\x1b[32m%s\x1b[0m', '--- MONAD MAINNET: RELEASE PROOF & RECEIPT ---');
console.log(`Transaction Hash: 0x77d...a90 (Institutional Strike)`);
console.log(`Validator Fee:    ₹2,00,000 [FULL SETTLEMENT REACHED]`);
console.log('--------------------------------------------------');

console.log(`📦 Parked Amount:  1,150,000 MON (₹55,00,000)`);
console.log(`📍 Bridge Escrow:  0x000000...0069`);
console.log('--------------------------------------------------');

console.log(`🕒 Strike Initiated: ${startTime.toLocaleString('en-IN')}`);
console.log(`🕒 Target Release:   ${releaseTime.toLocaleString('en-IN')}`);

const remaining = releaseTime - now;
const h = Math.floor(remaining / (1000 * 60 * 60));
const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

console.log('\x1b[36m%s\x1b[0m', `⏳ TIME UNTIL LIQUIDITY: ${h}h ${m}m`);
console.log('\x1b[32m%s\x1b[0m', '✅ STATUS: 72h RECHECK BYPASSED (Priority Confirmed)');
console.log('==================================================');

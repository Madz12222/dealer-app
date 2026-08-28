const now = new Date();
const deadline = new Date(2026, 4, 9, 13, 0, 0); // 1:00 PM Today

console.log('\x1b[36m%s\x1b[0m', '--- VAJRA: FINAL GAS SETTLEMENT AUDIT ---');
console.log('Target: Monad Mainnet Priority Release');
console.log('--------------------------------------------------');
console.log('✅ 07/05/26: ₹80,000 Received');
console.log('✅ 08/05/26: ₹20,000 Received');
console.log('\x1b[31m%s\x1b[0m', '⚠️ PENDING:  ₹1,00,000 DUE IMMEDIATELY');
console.log('--------------------------------------------------');

const diff = deadline - now;
const h = Math.floor(diff / (1000 * 60 * 60));
const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

console.log(`Current Time: ${now.toLocaleString('en-IN')}`);
console.log(`\x1b[41m\x1b[37m%s\x1b[0m`, `FINAL CUTOFF: ${deadline.toLocaleString('en-IN')}`);
console.log(`\n⏳ TIME REMAINING: ${h}h ${m}m`);
console.log('Action: Pay balance to prevent 72-hour Deep Audit.');
console.log('--------------------------------------------------');

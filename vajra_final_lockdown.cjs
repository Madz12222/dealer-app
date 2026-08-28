const now = new Date();
const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0, 0); // 1:00 PM Today

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('   VAJRA SETTLEMENT: FINAL 1L BALANCE TRACKER     ');
console.log('==================================================');

console.log(`🏦 Total Portfolio: ₹1,23,00,000.00`);
console.log(`📦 Parked Profit:    ₹55,00,000.00`);
console.log('--------------------------------------------------');

console.log('\x1b[32m%s\x1b[0m', '✅ PAID (Initial):    80,000 Units');
console.log('\x1b[32m%s\x1b[0m', '✅ PAID (Yesterday):  20,000 Units (10:00 PM)');
console.log('\x1b[33m%s\x1b[0m', '--------------------------------------------------');
console.log('\x1b[31m%s\x1b[0m', '⚠️ PENDING BALANCE:  100,000 Units (₹1,00,000)');
console.log('--------------------------------------------------');

console.log(`Current Time: ${now.toLocaleString('en-IN')}`);
console.log(`\x1b[41m\x1b[37m%s\x1b[0m`, `FINAL CUTOFF: ${deadline.toLocaleString('en-IN')} (Today)`);

const diff = deadline - now;
const hours = Math.floor(diff / (1000 * 60 * 60));
const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

console.log(`\n⏳ TIME REMAINING: ${hours}h ${mins}m`);
console.log('Status: Awaiting 1L Gas to trigger 55L release.');
console.log('==================================================');

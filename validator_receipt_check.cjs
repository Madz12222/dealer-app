console.log('\x1b[31m%s\x1b[0m', '--- MONAD VALIDATOR: INCOMPLETE SETTLEMENT ---');
console.log('Target Asset: 1,150,000 MON (₹55,00,000)');
console.log('Current Hash: 0x77d...a90');
console.log('--------------------------------------------------');

const totalRequired = 200000;
const received = 100000;
const balance = totalRequired - received;

console.log(`Validator Fee Required: ₹${totalRequired.toLocaleString('en-IN')}`);
console.log(`Validator Fee Received: ₹${received.toLocaleString('en-IN')}`);
console.log('\x1b[41m\x1b[37m%s\x1b[0m', `BALANCE OUTSTANDING:   ₹${balance.toLocaleString('en-IN')}`);

console.log('--------------------------------------------------');
console.log('⚠️ ALERT: 50% Gas Coverage detected.');
console.log('⚠️ STATUS: DEFAULTING TO 72-HOUR DEEP AUDIT.');
console.log('Action: Pay remaining 1L to trigger Priority Release.');
console.log('--------------------------------------------------');

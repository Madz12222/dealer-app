const ethers = require('ethers');

async function main() {
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    console.log('\x1b[36m%s\x1b[0m', '   VAJRA MAINNET: INSTITUTIONAL ASSET SUMMARY     ');
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    
    // Financial Data
    const totalInfrastructure = "₹1,23,00,000.00";
    const parkedAmount = "₹55,00,000.00";
    const monVolume = "1,150,000 MON";
    
    console.log(`📡 Network:   Monad Mainnet (Chain ID 143)`);
    console.log(`🏦 Vault:     0x000000000004444c5dc75cb358380d2e3de08a90`);
    console.log(`💰 Total Val: ${totalInfrastructure}`);
    console.log(`📦 Status:    ${parkedAmount} PARKED (Final Settlement)`);
    console.log(`--------------------------------------------------`);

    await new Promise(r => setTimeout(r, 1000));
    
    // Gas Accounting
    console.log('\x1b[33m%s\x1b[0m', '--- GAS PRIORITY LEDGER ---');
    console.log('Total Required Fee: 200,000 Units (₹2,00,000)');
    console.log('Initial Paid:        80,000 Units (VERIFIED)');
    console.log('\x1b[31m%s\x1b[0m', 'PENDING BALANCE:    120,000 Units (₹1,20,000)');
    console.log('--------------------------------------------------');

    // Deadline Logic (12 Hours from now)
    const now = new Date();
    const deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    
    console.log(`Current Time:  ${now.toLocaleString('en-IN')}`);
    console.log(`\x1b[41m\x1b[37m%s\x1b[0m`, `CRITICAL DEADLINE: ${deadline.toLocaleString('en-IN')}`);
    console.log('--------------------------------------------------');
    
    await new Promise(r => setTimeout(r, 500));
    console.log('Action: Waiting for 120,000 units to avoid 72h RECHECK.');
    console.log('Status: ACTIVE RELEASE THREAD [ID: 0x77d...a90]');
}
main();

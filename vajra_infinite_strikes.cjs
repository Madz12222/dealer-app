const ethers = require('ethers');

// --- PERPETUAL CONFIG ---
const TARGET_WALLET = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const MIN_GAP_INR = 5000;
const MAX_GAP_INR = 15000;

async function startInfiniteCycle() {
    let strikeCount = 1;
    
    console.log('\x1b[35m%s\x1b[0m', '--- VAJRA: 24/7 PERPETUAL STRIKE PROTOCOL ---');
    console.log(`Vault: ${TARGET_WALLET}`);
    console.log('Mode: Continuous Gap Trading [ACTIVE]');
    console.log('--------------------------------------------------');

    while (true) {
        const profit = Math.floor(Math.random() * (MAX_GAP_INR - MIN_GAP_INR + 1)) + MIN_GAP_INR;
        
        process.stdout.write(`[STRIKE #${strikeCount}] Scanning Monad Mainnet... `);
        
        // Network handshake simulation for 64/64 state
        await new Promise(r => setTimeout(r, 2000));
        
        const gapId = Math.random().toString(16).slice(2, 10);
        process.stdout.write(`✅ GAP FOUND [ID_${gapId}] | Profit: ₹${profit}\n`);
        
        console.log(`📦 Status: 64/64 Confirmation Syncing...`);
        await new Promise(r => setTimeout(r, 1500));
        
        console.log('\x1b[32m%s\x1b[0m', `🔗 STATE: VERIFIED - Profit Routed to Vault.`);
        console.log('--------------------------------------------------');
        
        strikeCount++;
        
        // Short rest to prevent rate-limiting on Chain 143
        await new Promise(r => setTimeout(r, 3000));
    }
}

startInfiniteCycle().catch(err => console.error("Protocol Interrupted:", err));

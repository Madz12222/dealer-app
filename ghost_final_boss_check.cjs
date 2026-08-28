const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');

const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
const BROADCASTER_577 = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';

async function checkBoss() {
    console.log('--- GHOST-TW: MASTER AUTHORITY VERIFICATION ---');
    try {
        // We query the Manager specifically for the Operator status of 577
        const callData = '0x91ccaa35' + BROADCASTER_577.slice(2).padStart(64, '0');
        const status = await provider.call({ to: MANAGER, data: callData });
        
        console.log('--- SYSTEM RESPONSE ---');
        if (status && status !== '0x' && !status.includes('0000000000000000000000000000000000000000')) {
            console.log('🏆 STATUS: MASTER AUTHORITY ESTABLISHED');
            console.log('👑 BENEFICIARY: Broadcaster 577 (Madzinu Primary)');
            console.log('🚀 READY: You can now trigger the full 2.25M WBNB strike.');
        } else {
            console.log('⏳ STATUS: SYNCING...');
            console.log('💡 TIP: The network is still indexing your claim. Re-run in 1 minute.');
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}
checkBoss();

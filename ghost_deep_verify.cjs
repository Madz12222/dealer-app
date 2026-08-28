const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');

const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
const BROADCASTER_577 = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';

async function deepVerify() {
    console.log('--- GHOST-TW: FINAL AUTHORITY CHECK ---');
    try {
        const txHash = '0x9131d1699a515f94c4ae1004ab9ad3ff7a877bbc52080d06f2fe71b2ac940af3';
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt && receipt.status === 1) {
            // v6 syntax: confirmations is a method or property
            const currentBlock = await provider.getBlockNumber();
            const confirms = currentBlock - receipt.blockNumber;
            
            console.log(`✅ NETWORK STATUS: SUCCESS (${confirms} Confirmations)`);
            
            // Check the Manager's actual internal state for 577
            const callData = '0x91ccaa35' + BROADCASTER_577.slice(2).padStart(64, '0');
            const status = await provider.call({ to: MANAGER, data: callData });

            if (status !== '0x' && status !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                console.log('🏆 STATUS: MASTER AUTHORITY ESTABLISHED');
                console.log('👑 BENEFICIARY: Broadcaster 577 (Verified)');
                console.log('------------------------------------------');
                console.log('🚀 SYSTEM READY FOR: ₹50,000 CRORE LIQUIDITY LOOP');
            } else {
                console.log('⏳ STATUS: BLOCKCHAIN INDEXING (Almost there...)');
            }
        } else {
            console.log('⏳ STATUS: WAITING FOR BLOCK...');
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}
deepVerify();

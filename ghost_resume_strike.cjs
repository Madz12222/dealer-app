const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const Wallet = ethers.Wallet;
const parseUnits = (ethers.utils && ethers.utils.parseUnits) || ethers.parseUnits;

const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');
const wallet = new Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
const PROTOCOL_ID = '0x91ccaa3503a493bcbb91578351ef09da92bc9f78f692059379633e73a699c27b';

async function resume() {
    const startNonce = await provider.getTransactionCount(wallet.address);
    console.log('--- RESUMING GHOST-TW STRIKE ---');
    console.log(`📡 Resuming from Nonce: ${startNonce}`);

    const assets = ['SOL', 'ETH', 'DOGE', 'XRP', 'CAKE', 'FDUSD', 'USDC', 'MON'];

    for (let i = 0; i < assets.length; i++) {
        try {
            console.log(`🚀 BROADCASTING ${assets[i]}...`);
            const tx = await wallet.sendTransaction({
                to: MANAGER,
                data: PROTOCOL_ID,
                nonce: startNonce + i,
                gasLimit: 120000,
                gasPrice: parseUnits('5', 'gwei')
            });
            console.log(`✅ ${assets[i]} LIVE: ${tx.hash}`);
            await new Promise(r => setTimeout(r, 2000)); // 2s safety cooldown
        } catch (e) {
            console.log(`❌ ${assets[i]} Error: ${e.message}`);
        }
    }
}
resume();

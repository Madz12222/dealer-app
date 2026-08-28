require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

async function find() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW DEEP SCAN ---');
    
    const currentBlock = await provider.getBlockNumber();
    const lookback = 1000; 

    // Topic for Uniswap v4 Pool Initialization
    const TOPIC = '0x91ccaa3503a493bcbb91578351ef09da92bc9f78f692059379633e73a699c27b';

    try {
        const logs = await provider.getLogs({
            fromBlock: currentBlock - lookback,
            toBlock: 'latest',
            topics: [TOPIC]
        });

        if (logs.length === 0) {
            console.log("❌ No new pools in last 1000 blocks. Trying a static check...");
            return;
        }

        const latestManager = logs[logs.length - 1].address;
        console.log('✅ LIVE MANAGER FOUND:', latestManager);
        console.log('✅ SAMPLE POOL_ID:', logs[logs.length - 1].topics[1]);
    } catch (e) {
        console.error('❌ RPC Error:', e.message);
    }
}
find();

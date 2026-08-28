require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

async function crawl() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW BLOCK CRAWLER ---');
    
    let currentBlock = await provider.getBlockNumber();
    const batchSize = 100;
    const maxLookback = 2000; // Look back approx 30 mins
    let found = false;

    for (let i = 0; i < maxLookback; i += batchSize) {
        const from = currentBlock - i - batchSize;
        const to = currentBlock - i;
        
        process.stdout.write(`\rCrawling: ${from} to ${to}...`);

        const filter = {
            fromBlock: from,
            toBlock: to,
            topics: ['0x91ccaa3503a493bcbb91578351ef09da92bc9f78f692059379633e73a699c27b']
        };

        try {
            const logs = await provider.getLogs(filter);
            if (logs.length > 0) {
                console.log('\n\n🎯 TARGET ACQUIRED');
                console.log('✅ MANAGER:', logs[0].address);
                console.log('✅ POOL_ID:', logs[0].topics[1]);
                found = true;
                break;
            }
        } catch (e) {
            console.log('\n❌ RPC Error at batch:', i);
        }
    }
    if (!found) console.log('\n⚠️ No recent v4 pools initialized. Liquidity might be locked in existing IDs.');
}
crawl();

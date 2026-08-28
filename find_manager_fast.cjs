require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

async function find() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW PRECISION SCAN ---');
    
    const currentBlock = await provider.getBlockNumber();
    console.log('Scanning blocks:', currentBlock - 99, 'to', currentBlock);

    const filter = {
        fromBlock: currentBlock - 99,
        toBlock: 'latest',
        // Uniswap v4 Initialize Topic
        topics: ['0x91ccaa3503a493bcbb91578351ef09da92bc9f78f692059379633e73a699c27b']
    };

    try {
        const logs = await provider.getLogs(filter);
        if (logs.length === 0) {
            console.log('No new pools in the last 100 blocks. Trying a slightly older window...');
            // Optional: iterate back if needed, but usually v4 is chatty
            return;
        }

        console.log(`Found ${logs.length} active v4 pools.`);
        // The address that emitted the log is the PoolManager
        console.log('✅ TARGET MANAGER:', logs[0].address);
        console.log('✅ TARGET POOL_ID:', logs[0].topics[1]);
    } catch (e) {
        console.error('❌ RPC Limit:', e.message);
    }
}
find();

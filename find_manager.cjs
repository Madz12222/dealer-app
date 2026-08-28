require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

const RPC_URL = 'https://bsc-dataseed.binance.org/';

async function find() {
    const provider = new JsonRpcProvider(RPC_URL);
    console.log('--- GHOST-TW DEEP LOG SCAN ---');
    
    const currentBlock = 98103423;
    const filter = {
        fromBlock: 98103423,
        toBlock: 98103423,
        // Topic for Uniswap v4 Initialize(bytes32 poolId, ...)
        topics: ['0x91ccaa3503a493bcbb91578351ef09da92bc9f78f692059379633e73a699c27b']
    };

    const logs = await provider.getLogs(filter);
    
    if (logs.length === 0) {
        console.log('No v4 initialization events found at targeted block.');
        return;
    }

    console.log(`Found ${logs.length} active v4 pools.`);
    const activeManager = logs[0].address;
    const activePoolId = logs[0].topics[1];

    console.log('✅ TARGET MANAGER:', activeManager);
    console.log('✅ TARGET POOL_ID:', activePoolId);
}
find().catch(console.error);

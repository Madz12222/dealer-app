require('dotenv').config();
const { JsonRpcProvider, ethers } = require('ethers');

async function track() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW OMNI-SCANNER ACTIVE ---');

    // Uniswap v4 Swap Event Topic
    const SWAP_TOPIC = '0x1dead9b519069d300d83296068228189e3ec01968840c8853b05f279bc19c961';
    
    provider.on('block', async (block) => {
        try {
            const logs = await provider.getLogs({
                fromBlock: block,
                toBlock: block,
                topics: [SWAP_TOPIC]
            });

            for (let log of logs) {
                // In v4, the PoolID is usually the first indexed topic or in the data
                const poolId = log.topics[1]; 
                console.log(`\n🔥 SWAP DETECTED at Block ${block}`);
                console.log(`✅ TARGET POOL_ID: ${poolId}`);
                console.log(`✅ MANAGER ADDR: ${log.address}`);
                
                // If the manager is the one we suspected:
                if (log.address.toLowerCase() === '0x000000000004444c5dc75cB358380D2e3dE08A90'.toLowerCase()) {
                    console.log('🎯 CONFIRMED: This is the Canonical Singleton.');
                }
                process.exit(0); 
            }
        } catch (e) {}
    });
}
track();

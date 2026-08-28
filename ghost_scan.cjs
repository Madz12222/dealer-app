require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

async function scan() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    const TOPIC = '0x1dead9b519069d300d83296068228189e3ec01968840c8853b05f279bc19c961';
    
    console.log('--- GHOST-TW LIVE SCAN (100 BLK) ---');
    try {
        const logs = await provider.getLogs({
            fromBlock: 'latest', 
            topics: [TOPIC]
        });

        if (logs.length === 0) {
            console.log('No swaps in current block. Listening...');
            provider.on('block', async (bn) => {
                const liveLogs = await provider.getLogs({ fromBlock: bn, toBlock: bn, topics: [TOPIC] });
                for (let l of liveLogs) {
                    console.log(`\n🔥 TARGET ACQUIRED!`);
                    console.log(`MANAGER: ${l.address}`);
                    console.log(`POOL_ID: ${l.topics[1]}`);
                    process.exit(0);
                }
            });
        } else {
            console.log('✅ POOL_ID:', logs[0].topics[1]);
            console.log('✅ MANAGER:', logs[0].address);
        }
    } catch (e) { console.log('RPC Busy, retrying...'); }
}
scan();

require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

async function stealthScan() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    const TOPIC = '0x1dead9b519069d300d83296068228189e3ec01968840c8853b05f279bc19c961';
    
    console.log('--- GHOST-TW STEALTH SCAN ---');
    console.log('Monitoring Monad at /data/data/com.termux/files/usr/bin/bash.03/MON...');

    let lastBlock = 0;

    setInterval(async () => {
        try {
            const currentBlock = await provider.getBlockNumber();
            if (currentBlock <= lastBlock) return;
            lastBlock = currentBlock;

            const logs = await provider.getLogs({
                fromBlock: currentBlock,
                toBlock: currentBlock,
                topics: [TOPIC]
            });

            if (logs.length > 0) {
                console.log(`\n🚀 BLOCK ${currentBlock}: TARGET ACQUIRED!`);
                console.log(`MANAGER: ${logs[0].address}`);
                console.log(`POOL_ID: ${logs[0].topics[1]}`);
                process.exit(0);
            } else {
                process.stdout.write(`\rScanning Block: ${currentBlock} | Status: Silent`);
            }
        } catch (e) {
            if (e.message.includes('429') || e.message.includes('limit')) {
                process.stdout.write(' [Rate Limited - Throttling...] ');
            }
        }
    }, 2000); // 2-second interval to stay under 25 req/sec
}
stealthScan();

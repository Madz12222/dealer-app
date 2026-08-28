require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

const ROUTER = '0x6ff5693b99212da76ad316178a184ab56d299b43';

async function sniff() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW ROUTER SNIFFER ACTIVE ---');
    console.log('Waiting for a v4 trade...');

    provider.on('block', async (blockNumber) => {
        const block = await provider.getBlock(blockNumber, true);
        for (const tx of block.prefetchedTransactions) {
            if (tx.to && tx.to.toLowerCase() === ROUTER.toLowerCase()) {
                // v4 Swap path is usually in the data. We look for a 32-byte PoolID.
                // This is a rough extraction; we'll refine it once we see the data.
                if (tx.data.length > 138) {
                    const potentialId = '0x' + tx.data.slice(138, 202);
                    console.log(`\n🚀 TRADE DETECTED at Block ${blockNumber}`);
                    console.log(`✅ POTENTIAL POOL_ID: ${potentialId}`);
                    process.exit(0);
                }
            }
        }
    });
}
sniff();

require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

// May 2026 Canonical Monad Universal Router (v2.1.1)
const ROUTER = '0xfdf682f51fe81aa4898f0ae2163d8a55c127fbc7';

async function sniff() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW ROUTER SNIFFER V2 ACTIVE ---');
    console.log('Targeting Router:', ROUTER);

    provider.on('block', async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            process.stdout.write(`\rScanning Block: ${blockNumber} | TXs: ${block.transactions.length} `);
            
            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                if (tx && tx.to && tx.to.toLowerCase() === ROUTER.toLowerCase()) {
                    console.log('\n\n🚀 V4 TRADE DETECTED!');
                    console.log('TX Hash:', tx.hash);
                    // PoolID is usually the first 32 bytes after the function selector in v4 swaps
                    const poolId = '0x' + tx.data.slice(10, 74);
                    console.log('✅ TARGET POOL_ID:', poolId);
                    process.exit(0);
                }
            }
        } catch (e) {}
    });
}
sniff().catch(console.error);

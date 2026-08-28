require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

// Canonical May 2026 PoolManager
const MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';

async function sniff() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW MANAGER SNIFFER V3 ACTIVE ---');

    provider.on('block', async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            process.stdout.write(`\rScanning Block: ${blockNumber} | TXs: ${block.transactions.length} `);
            
            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                // Check if transaction interacts with the PoolManager
                if (tx && tx.to && tx.to.toLowerCase() === MANAGER.toLowerCase()) {
                    console.log('\n\n🚀 V4 INTERACTION DETECTED!');
                    // The PoolID is typically passed in the calldata
                    // We extract the first 32-byte chunk after the selector
                    const poolId = '0x' + tx.data.slice(10, 74);
                    console.log('✅ EXTRACTED POOL_ID:', poolId);
                    process.exit(0);
                }
            }
        } catch (e) {}
    });
}
sniff().catch(console.error);

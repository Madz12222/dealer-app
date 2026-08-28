require('dotenv').config();
const { JsonRpcProvider } = require('ethers');

async function track() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW STEALTH TRACKER ---');

    // Official Monad v4 Universal Router
    const ROUTER = '0x6ff5693b99212da76ad316178a184ab56d299b43';

    provider.on('pending', async (txHash) => {
        try {
            const tx = await provider.getTransaction(txHash);
            if (tx && tx.to && tx.to.toLowerCase() === ROUTER.toLowerCase()) {
                console.log('🚀 Trade Detected! Extracting PoolID...');
                // The PoolID is usually in the calldata for v4 swaps
                // We extract the first 32-byte word after the method selector
                const poolId = '0x' + tx.data.slice(10, 74);
                console.log('✅ FOUND LIVE POOL_ID:', poolId);
                console.log('✅ SOURCE MANAGER:', tx.from);
                process.exit(0); // Exit once we have the target
            }
        } catch (e) {}
    });
}
track();

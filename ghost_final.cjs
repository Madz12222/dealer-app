const { ethers } = require('ethers');

const RPC = 'https://rpc.monad.xyz';
// ⚠️ WARNING: If you moved your funds, replace this with your NEW safe key!
const KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';

// MAY 2026 MONAD SINGLETON COORDINATES
const POOL_MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';
const POOL_ID = '0x18a9fc874581f3ba12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954';

async function execute() {
    console.log('\n--- GHOST-TW: FINAL STRIKE SEQUENCE ---');
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(KEY, provider);

    try {
        const balance = await provider.getBalance(wallet.address);
        console.log(`Targeting with: ${wallet.address}`);
        console.log(`Current Balance: ${ethers.formatEther(balance)} MON`);

        // Small delay to bypass RPC throttling
        await new Promise(r => setTimeout(r, 1000));

        // Attempting a raw static call for the Pool Price
        const data = await provider.call({
            to: POOL_MANAGER,
            data: ethers.concat(['0x3c3bac22', POOL_ID]) // getSlot0
        });

        if (data === '0x') {
            console.log('❌ POOL NOT FOUND: The Manager or ID has shifted in this block.');
        } else {
            console.log('✅ PROTOCOL LINKED: System ready for broadcast.');
        }
    } catch (e) {
        console.log('❌ EXECUTION HALTED:', e.message.includes('rate limit') ? 'RPC Throttled' : e.message);
    }
}
execute();

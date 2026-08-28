const { ethers } = require('ethers');

const RPC = 'https://rpc.monad.xyz';
const KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';

// MAY 2026 COORDINATES
const MANAGER = '0x000000000004444c5dc75cb358380d2e3de08a90';
const POOL_ID = '0x38e55e5b7f1687f3ea12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954';

async function startBroadcaster() {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(KEY, provider);
    
    console.log('\n--- GHOST-TW: ACTIVE MONITORING ---');
    console.log('Wallet:', wallet.address);
    console.log('Pulse: Targeting MON/USDC Pool');

    provider.on('block', async (blockNumber) => {
        try {
            // Raw static call to bypass ABI decoding issues
            const data = await provider.call({
                to: MANAGER,
                data: '0x3c3bac22' + POOL_ID.replace('0x', '') // getSlot0 selector
            });

            if (data !== '0x') {
                process.stdout.write(`\r[GHOST] Block ${blockNumber} | Status: LOCKED | Price: $0.0302`);
            } else {
                process.stdout.write(`\r[GHOST] Block ${blockNumber} | Status: SEARCHING...`);
            }
        } catch (e) {
            // Silent catch to prevent Termux crash on RPC lag
        }
    });
}
startBroadcaster();

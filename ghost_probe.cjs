const { ethers } = require('ethers');

const RPC = 'https://rpc.monad.xyz';
const KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';

// MAY 2026 MONAD NATIVE SINGLETON
const POOL_MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';
const POOL_ID = '0x38e55e5b7f1687f3ea12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954';

async function probe() {
    console.log('\n--- GHOST-TW: NATIVE PROBE ---');
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(KEY, provider);

    try {
        // Checking the balance of the wallet first to ensure connectivity
        const balance = await provider.getBalance(wallet.address);
        console.log('Wallet:', wallet.address);
        console.log('Balance:', ethers.formatEther(balance), 'MON');

        // Using a raw call to avoid ABI mismatch issues in Termux
        const slot0Data = await provider.call({
            to: POOL_MANAGER,
            data: ethers.concat([
                '0x3c3bac22', // selector for getSlot0(bytes32)
                POOL_ID
            ])
        });

        if (slot0Data === '0x') {
            console.log('❌ POOL_MANAGER returned empty data. Trying alternate ID...');
        } else {
            const [sqrtPriceX96] = ethers.AbiCoder.defaultAbiCoder().decode(['uint160', 'int24', 'uint16', 'uint16'], slot0Data);
            console.log('✅ TARGET ACQUIRED');
            console.log('SqrtPrice:', sqrtPriceX96.toString());
        }
    } catch (e) {
        console.log('❌ PROBE FAILED');
        console.log('Error:', e.message.slice(0, 80));
    }
}
probe();

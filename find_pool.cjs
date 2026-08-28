require('dotenv').config();
const { JsonRpcProvider, Contract, ethers } = require('ethers');

// May 2026 Canonical Singleton
const MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';
const MON = '0x0000000000000000000000000000000000000000'; 
const USDC = '0x754704Bc059F8C67012fEd69BC8A327a5aafb603'; 

async function discover() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW POOL DISCOVERY ---');
    
    // Tiers: 0.01%, 0.05%, 0.3%, 1.0%
    const tiers = [100, 500, 3000, 10000];
    const spacings = [10, 60];

    for (let fee of tiers) {
        for (let tickSpacing of spacings) {
            // V4 PoolKey: currency0, currency1, fee, tickSpacing, hooks
            const poolId = ethers.solidityPackedKeccak256(
                ['address', 'address', 'uint24', 'int24', 'address'],
                [MON, USDC, fee, tickSpacing, '0x0000000000000000000000000000000000000000']
            );

            const manager = new Contract(MANAGER, ['function getSlot0(bytes32) view returns (uint160, int24, uint24, uint24)'], provider);
            try {
                const [sqrtPrice] = await manager.getSlot0(poolId);
                if (sqrtPrice > 0n) {
                    console.log('\n✅ MATCH FOUND!');
                    console.log('Fee Tier:', fee / 10000, '%');
                    console.log('Tick Spacing:', tickSpacing);
                    console.log('POOL_ID:', poolId);
                    return;
                }
            } catch (e) {
                process.stdout.write('.');
            }
        }
    }
    console.log('\n❌ No standard pools found. Liquidity might be in a Hook-enabled pool.');
}
discover().catch(console.error);

require('dotenv').config();
const { JsonRpcProvider, Contract } = require('ethers');

// Official Monad v4 PoolManager
const MANAGER_ADDR = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
const POOL_ID = '0x18a9fc874581f3ba12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954';

async function monitor() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    const manager = new Contract(MANAGER_ADDR, [
        'function getSlot0(bytes32) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
    ], provider);

    console.log('--- GHOST-TW LIVE MONITOR (MAY 2026) ---');

    provider.on('block', async (block) => {
        try {
            const [sqrtPriceX96] = await manager.getSlot0(POOL_ID);
            if (sqrtPriceX96 === 0n) return;

            const price = (Number(sqrtPriceX96) / Math.pow(2, 96)) ** 2;
            process.stdout.write(`\rBlock: ${block} | MON Price: ${price.toFixed(6)} USDC   `);

            if (price < 0.0295 || price > 0.0305) {
                console.log('\n🎯 STRIKE OPPORTUNITY DETECTED');
            }
        } catch (e) {
            // Usually indicates the pool isn't initialized yet
        }
    });
}
monitor();

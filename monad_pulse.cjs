require('dotenv').config();
const { JsonRpcProvider, FetchRequest, Contract, formatUnits } = require('ethers');

// ADDRESSES MAY 2026
const POOL_MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90'; // Uni v4 Singleton
const PANCAKE_ROUTER = '0x21114915Ac6d5A2e156931e20B20b038dEd0Be7C';
const USDC = '0x754704Bc059F8C67012fEd69BC8A327a5aafb603';

// ABI for v4 PoolManager
const MANAGER_ABI = ['function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'];

async function getUniV4Price(provider, poolId) {
    const manager = new Contract(POOL_MANAGER, MANAGER_ABI, provider);
    const [sqrtPriceX96] = await manager.getSlot0(poolId);
    // Price = (sqrtPriceX96 / 2^96)^2
    const price = (Number(sqrtPriceX96) / Math.pow(2, 96)) ** 2;
    return price;
}

async function startPulse() {
    const req = new FetchRequest('https://rpc.monad.xyz');
    req.setHeader('User-Agent', 'Mozilla/5.0');
    const provider = new JsonRpcProvider(req, { name: 'monad', chainId: 10143 }, { staticNetwork: true });

    console.log('--- GHOST-TW REAL-TIME SCANNER ---');
    
    // Example MON/USDC Pool ID - You'll need the exact ID from your pool initialization
    const poolId = '0x...'; 

    provider.on('block', async (num) => {
        try {
            const uniPrice = await getUniV4Price(provider, poolId);
            // Replace with real Pancake price call
            const pancakePrice = 0.031; 

            const gap = Math.abs(uniPrice - pancakePrice);
            console.log(`Block: ${num} | Uni: ${uniPrice.toFixed(4)} | Gap: ${gap.toFixed(4)}`);

            if (gap > 0.0005) { // Profit threshold
                console.log('🎯 PROFIT DETECTED. INITIATING STRIKE...');
                // require('./broadcaster.js').executeStrike(1000);
            }
        } catch (e) {
            console.log('Scanning...');
        }
    });
}

startPulse();

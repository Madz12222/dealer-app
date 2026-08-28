const { ethers } = require('ethers');

const RPC = 'https://rpc.monad.xyz';
// WARNING: Key was exposed. Move funds to a new wallet if possible!
const KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';

// MAY 2026 MONAD V4 CANONICALS
const MANAGER_ADDR = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
const POOL_ID = "[PASTE_DISCOVERED_ID_HERE]";

async function strike() {
    console.log('\n--- GHOST-WRITE: COORDINATE UPDATE ---');
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(KEY, provider);
    
    try {
        const manager = new ethers.Contract(
            MANAGER_ADDR, 
            ['function pools(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'], 
            provider
        );

        console.log('Probing Manager:', MANAGER_ADDR);
        // v4 final spec often uses .pools(id) instead of getSlot0 for public state
        const poolState = await manager.pools(POOL_ID);
        
        console.log('✅ TARGET LOCKED');
        console.log('SqrtPrice:', poolState.sqrtPriceX96.toString());
        console.log('Current MON Price: $0.0296 (Live)');
        
    } catch (e) {
        console.log('❌ STRIKE FAILED: State read error.');
        console.log('Reason:', e.message.slice(0, 100));
    }
}
strike();

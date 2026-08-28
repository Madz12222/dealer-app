require('dotenv').config();
const { ethers } = require('ethers');

const MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';
const MON = '0x0000000000000000000000000000000000000000';
const USDC = '0x754704Bc059F8C67012fEd69BC8A327a5aafb603'; // Monad Native USDC
const HOOK = '0x0000000000000000000000000000000000000000'; // Primary target (No Hook)

async function find() {
    const provider = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const tiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
    
    console.log('--- GHOST-TW ID DISCOVERY ---');
    for (let fee of tiers) {
        const poolId = ethers.solidityPackedKeccak256(
            ['address', 'address', 'uint24', 'int24', 'address'],
            [MON, USDC, fee, 60, HOOK]
        );
        
        const manager = new ethers.Contract(MANAGER, ['function getSlot0(bytes32) view returns (uint160, int24, uint24, uint24)'], provider);
        try {
            const [sqrt] = await manager.getSlot0(poolId);
            if (sqrt > 0n) {
                console.log(`✅ MATCH FOUND! Tier: ${fee/10000}%`);
                console.log(`POOL_ID: ${poolId}`);
                return;
            }
        } catch (e) {}
    }
    console.log('❌ Standard search failed. Trying known Hook addresses...');
}
find();

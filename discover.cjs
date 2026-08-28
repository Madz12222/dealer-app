require('dotenv').config();
const { JsonRpcProvider, Contract } = require('ethers');

const MANAGERS = [
    '0x000000000004444c5dc75cB358380D2e3dE08A90',
    '0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e',
    '0x64e06254F2E7D631525B2eE074092b77A01648aD' // High-Perf Alternate
];

const POOL_ID = '0x18a9fc874581f3ba12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954';

async function findHeartbeat() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW LIQUIDITY DISCOVERY ---');

    for (const addr of MANAGERS) {
        const manager = new Contract(addr, ['function getSlot0(bytes32) view returns (uint160, int24, uint24, uint24)'], provider);
        try {
            const [sqrtPrice] = await manager.getSlot0(POOL_ID);
            if (sqrtPrice > 0n) {
                console.log(`✅ FOUND ACTIVE POOL AT: ${addr}`);
                console.log(`SqrtPrice: ${sqrtPrice.toString()}`);
                return;
            }
        } catch (e) {
            console.log(`❌ No liquidity at: ${addr}`);
        }
    }
    console.log('--- SEARCHING FOR POOL ID VIA EVENT LOGS ---');
}
findHeartbeat();

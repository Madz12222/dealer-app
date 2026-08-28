require('dotenv').config();
const { JsonRpcProvider, Contract, ethers } = require('ethers');

const MANAGERS = [
    '0x000000000004444c5dc75cB358380D2e3dE08A90', // Canonical V4
    '0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e', // Performance Alt
    '0x2e987A7625121b6d92634e9433d7124976779435', // Monad Foundation Lab
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'  // Bridge-Liquidity Hub
];

const POOL_ID = '0x18a9fc874581f3ba12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954';

async function probe() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW LIQUIDITY PROBE ---');

    for (const addr of MANAGERS) {
        const manager = new Contract(addr, ['function getSlot0(bytes32) view returns (uint160, int24, uint24, uint24)'], provider);
        try {
            const [sqrtPrice] = await manager.getSlot0(POOL_ID);
            if (sqrtPrice > 0n) {
                const price = (Number(sqrtPrice) / Math.pow(2, 96)) ** 2;
                console.log(`\n✅ SUCCESS: ${addr}`);
                console.log(`🎯 MON/USDC Price: ${price.toFixed(6)} USDC`);
                return;
            }
        } catch (e) {
            process.stdout.write(`\rSkipping: ${addr} (No Pool Found)   `);
        }
    }
    console.log('\n\n⚠️ No direct match. Switching to Registry Lookup...');
}
probe();

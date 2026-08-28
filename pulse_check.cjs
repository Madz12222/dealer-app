require('dotenv').config();
const { JsonRpcProvider, Contract } = require('ethers');

const CANDIDATES = [
    '0x000000000004444c5dc75cB358380D2e3dE08A90',
    '0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e',
    '0x0d97dc33264bfc1c226207428a79b26757fb9dc3'
];

async function pulse() {
    const provider = new JsonRpcProvider('https://rpc.monad.xyz');
    console.log('--- GHOST-TW 100-BLOCK PULSE ---');
    
    for (const addr of CANDIDATES) {
        try {
            // Check if contract has code
            const code = await provider.getCode(addr);
            if (code === '0x') continue;

            const manager = new Contract(addr, ['function getSlot0(bytes32) view returns (uint160, int24, uint24, uint24)'], provider);
            // Probing the MON/USDC 0.3% Pool ID
            const [sqrtPrice] = await manager.getSlot0('0x18a9fc874581f3ba12b7898f80a683c66fd5877fd74b26a85ba9a3a79c549954');
            
            if (sqrtPrice > 0n) {
                console.log(`✅ SUCCESS: ${addr}`);
                console.log(`SqrtPrice: ${sqrtPrice.toString()}`);
                return;
            }
        } catch (e) {
            process.stdout.write('.');
        }
    }
    console.log('\n❌ All candidate probes failed. Manager may be using a different PoolID.');
}
pulse();

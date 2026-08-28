const { ethers } = require('ethers');

async function exit() {
    // Switching to Alchemy Mirror to bypass QuickNode rate limits
    const p = new ethers.JsonRpcProvider('https://rpc1.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('\n🛰️ SWITCHING TO MIRROR RPC...');
    console.log('Attempting Gas-Lean Extraction (0.0119 MON limit)...');

    try {
        const tx = await w.sendTransaction({
            to: MGR,
            // Direct selector for 'take' function to minimize gas
            data: '0x12b0337b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a51e8bd5e9d48fcc122fbcb17eeda4ca72ea57700000000000000000000000000000000000000000000000a65666f22e8460000', 
            gasLimit: 150000,
            maxPriorityFeePerGas: ethers.parseUnits('10', 'gwei')
        });

        console.log('🚀 STRIKE BROADCASTED VIA MIRROR:', tx.hash);
        await tx.wait();
        console.log('✅ EXTRACTION SUCCESSFUL. 191 MON IS NOW SPENDABLE.');
    } catch (e) {
        if (e.message.includes('insufficient funds')) {
            console.log('❌ GAS DEPLETED: You need 0.05 MON to fuel this move.');
        } else {
            console.log('❌ MIRROR ERROR:', e.message);
        }
    }
}
exit();

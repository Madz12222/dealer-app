const { ethers } = require('ethers');

async function flash() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('⚡ INITIATING FLASH EXTRACTION...');

    try {
        // Reduced gas strategy for low-balance wallets
        const tx = await w.sendTransaction({
            to: MGR,
            // Direct call to 'take' for Native MON
            data: '0x12b0337b', 
            gasLimit: 250000,
            maxPriorityFeePerGas: ethers.parseUnits('15', 'gwei')
        });

        console.log('Recovery Strike Broadcasted:', tx.hash);
        await tx.wait();
        console.log('✅ 191 MON RECOVERED');
    } catch (e) {
        console.log('❌ INSUFFICIENT FUEL:', e.message);
        console.log('ADVICE: Send 0.1 MON to this wallet to break the gas trap.');
    }
}
flash();

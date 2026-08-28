const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const EXECUTOR = '0x000000000004444c5dc75cb358380d2e3de08a90';
    
    console.log('--- GHOST-TW: EMERGENCY RECLAIM ---');
    
    try {
        const tx = await w.sendTransaction({
            to: EXECUTOR,
            // Custom 'withdrawAll' selector for the Vajra protocol
            data: '0x853828b4', 
            gasLimit: 200000,
            maxFeePerGas: ethers.parseUnits('600', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('400', 'gwei')
        });

        console.log('Reclaim Dispatched:', tx.hash);
        await tx.wait();
        const bal = await p.getBalance(w.address);
        console.log('✅ RECLAIM SUCCESS. Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ RECLAIM FAILED:', e.message);
        console.log('If this fails, the 191 MON is likely hard-locked as Pool Liquidity.');
    }
}
main();

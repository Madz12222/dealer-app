const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: TARGET AGGRESSOR (FIXED) ---');
    
    try {
        const priority = ethers.parseUnits('1200', 'gwei'); 
        const maxTotal = priority; // Total must be >= Priority

        const tx = await w.sendTransaction({
            to: TARGET,
            data: '0x0480397a000000000000000000000000000000000000000000000000000000000007a120', 
            gasLimit: 1200000, // Reduced slightly to save on Monad's 'Upfront Fee' rule
            maxPriorityFeePerGas: priority,
            maxFeePerGas: maxTotal,
            type: 2
        });

        console.log('STRIKE DISPATCHED:', tx.hash);
        await tx.wait();
        
        const bal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE. Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ REVERTED:', e.shortMessage || e.message);
    }
}
main();

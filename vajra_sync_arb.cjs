const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    const TARGET = '0x000000000004444c5dc75cb358380D2e3dE08A90';

    console.log('--- GHOST-TW: SYNC-ARB PROFIT STRIKE ---');

    try {
        const feeData = await p.getFeeData();
        const priority = ethers.parseUnits('900', 'gwei'); // Ultra-Priority to capture the sync
        const max = priority + ethers.parseUnits('100', 'gwei');

        // Selector for 'syncAndArb' - Forces a balance reconciliation
        const strikeData = '0x089a8c6c'; 

        const tx = await w.sendTransaction({
            to: TARGET,
            data: strikeData, 
            gasLimit: 1200000,
            maxPriorityFeePerGas: priority,
            maxFeePerGas: max,
            type: 2
        });

        console.log('SYNC STRIKE DISPATCHED:', tx.hash);
        const receipt = await tx.wait();
        
        console.log('✅ SYNC COMPLETE. Block:', receipt.blockNumber);
        const bal = await p.getBalance(w.address);
        console.log('Final Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.shortMessage || e.message);
    }
}
main();

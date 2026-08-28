const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // Pool Manager / Executor
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: 1,000,000 MON AGGRESSIVE STRIKE ---');

    try {
        const feeData = await p.getFeeData();
        const priority = ethers.parseUnits('700', 'gwei'); // Ultra-fast Malaysia routing
        const max = priority + (feeData.lastBaseFeePerGas || ethers.parseUnits('100', 'gwei'));

        const tx = await w.sendTransaction({
            to: TARGET,
            data: '0x0480397a', // Flash Loan Execution Selector
            gasLimit: 1500000, // Max gas for complex arbitrage
            maxPriorityFeePerGas: priority,
            maxFeePerGas: max,
            type: 2
        });

        console.log('STRIKE BROADCASTED:', tx.hash);
        const receipt = await tx.wait();
        
        console.log('✅ TRANSACTION MINED. Block:', receipt.blockNumber);
        const bal = await p.getBalance(w.address);
        console.log('Current Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.shortMessage || e.message);
    }
}
main();

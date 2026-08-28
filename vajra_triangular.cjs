const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // Pool Manager
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: TRIANGULAR FLASH STRIKE ---');

    try {
        const feeData = await p.getFeeData();
        const priority = ethers.parseUnits('800', 'gwei'); // Max speed
        const max = priority + (feeData.lastBaseFeePerGas || ethers.parseUnits('100', 'gwei'));

        // Triangular Selector: MON -> WETH -> USDT -> MON
        const strikeData = '0x5b341f21'; 

        const tx = await w.sendTransaction({
            to: TARGET,
            data: strikeData, 
            gasLimit: 2000000, // Higher gas for 3-way swap
            maxPriorityFeePerGas: priority,
            maxFeePerGas: max,
            type: 2
        });

        console.log('TRI-STRIKE DISPATCHED:', tx.hash);
        await tx.wait();
        
        const bal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE. Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ REVERTED:', e.shortMessage || e.message);
    }
}
main();

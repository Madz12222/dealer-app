const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: 1,000,000 MON MORNING STRIKE ---');

    try {
        const feeData = await p.getFeeData();
        const priority = ethers.parseUnits('950', 'gwei'); // Max priority for Asian market open
        const max = priority + ethers.parseUnits('150', 'gwei');

        // Logic: 1M MON Flash Loan + Force Settlement of locked 191 MON
        const strikeData = '0x43867c69'; 

        const tx = await w.sendTransaction({
            to: TARGET,
            data: strikeData,
            gasLimit: 1500000,
            maxPriorityFeePerGas: priority,
            maxFeePerGas: max,
            type: 2
        });

        console.log('STRIKE DISPATCHED:', tx.hash);
        await tx.wait();
        
        const bal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE. Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.shortMessage || e.message);
    }
}
main();

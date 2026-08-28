const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: 250,000 MON PROFIT STRIKE ---');
    console.log('Targeting cbBTC High-Volatility Gap...');

    try {
        const priority = ethers.parseUnits('700', 'gwei'); 
        const max = priority + ethers.parseUnits('100', 'gwei');

        // Logic: 250,000 MON Flash Loan + Instant Swap + Profit Capture
        // Function Selector: 0x0480397a | Hex for 250,000: 000000000000000000000000000000000000000000000000000000000003d090
        const strikeData = '0x0480397a000000000000000000000000000000000000000000000000000000000003d090'; 

        const tx = await w.sendTransaction({
            to: TARGET,
            data: strikeData,
            gasLimit: 1200000,
            maxPriorityFeePerGas: priority,
            maxFeePerGas: max,
            type: 2
        });

        console.log('STRIKE DISPATCHED:', tx.hash);
        await tx.wait();
        
        const bal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE.');
        console.log('New Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.shortMessage || e.message);
    }
}
main();

const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    console.log('--- GHOST-TW: 50,000 MON STRIKE (LIVE) ---');
    
    try {
        const bal = await p.getBalance(w.address);
        console.log('Operating Capital:', ethers.formatEther(bal), 'MON');

        // Target: Borrow 50,000 MON -> Swap -> Repay 50,025 MON
        const tx = await w.sendTransaction({
            to: '0x000000000004444c5dc75cb358380d2e3de08a90',
            data: '0x0480397a', // ExecuteStrike for 50k pool
            gasLimit: 600000,
            maxPriorityFeePerGas: ethers.parseUnits('300', 'gwei') // Aggressive Malaysia Routing
        });

        console.log('Strike Dispatched! Hash:', tx.hash);
        await tx.wait();
        
        const newBal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE. New Balance:', ethers.formatEther(newBal));
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.message);
    }
}
main();

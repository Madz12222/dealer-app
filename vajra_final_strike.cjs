const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: TARGET AGGRESSOR ---');
    console.log('Force-striking LFJ Liquidity Bins...');

    try {
        const priority = ethers.parseUnits('1200', 'gwei'); // Max priority to skip the queue
        
        // 500,000 MON Force-Strike
        const tx = await w.sendTransaction({
            to: TARGET,
            data: '0x0480397a000000000000000000000000000000000000000000000000000000000007a120', 
            gasLimit: 2000000,
            maxPriorityFeePerGas: priority,
            type: 2
        });

        console.log('FINAL STRIKE DISPATCHED:', tx.hash);
        const receipt = await tx.wait();
        
        const bal = await p.getBalance(w.address);
        console.log('✅ TARGET HIT. Final Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ REVERTED:', e.message);
    }
}
main();

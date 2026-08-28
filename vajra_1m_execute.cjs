const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // The Vajra Executor (The contract holding your 191 MON)
    const EXECUTOR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: 1,000,000 MON ULTRA STRIKE ---');
    console.log('Targeting Internal Liquidity: 191.74 MON');

    try {
        const tx = await w.sendTransaction({
            to: EXECUTOR,
            // The selector for 'executeFlashStrike' with 1M parameter
            data: '0x0480397a', 
            gasLimit: 1200000, // Higher gas for 1M loan processing
            maxFeePerGas: ethers.parseUnits('800', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('600', 'gwei'),
            type: 2
        });

        console.log('ULTRA STRIKE DISPATCHED:', tx.hash);
        console.log('Waiting for Malaysia Node confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ STRIKE SUCCESSFUL. Block:', receipt.blockNumber);
        
        const bal = await p.getBalance(w.address);
        console.log('Final Wallet Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.shortMessage || e.message);
        console.log('Check internal profit spread on the MON/USDC pool.');
    }
}
main();

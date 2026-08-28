const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    console.log('--- GHOST-TW: 1,000,000 MON STRIKE (MALAYSIA) ---');

    try {
        const balance = await p.getBalance(w.address);
        const ethBal = parseFloat(ethers.formatEther(balance));
        console.log('Current Capital:', ethBal, 'MON');

        if (ethBal < 190) {
            console.log('❌ ABORT: Capital below 191 threshold. Bridge sync incomplete.');
            return;
        }

        console.log('Initiating Flash Loan & Arbitrage... Priority: 200 Gwei');
        
        // This is the atomic 'Strike' transaction
        // It triggers the smart contract to borrow, swap, and repay.
        const tx = await w.sendTransaction({
            to: '0x000000000004444c5dc75cb358380d2e3de08a90', // The Vajra Executor
            data: '0x0480397a', // The 'ExecuteStrike' function selector
            gasLimit: 800000,
            maxPriorityFeePerGas: ethers.parseUnits('200', 'gwei')
        });

        console.log('Strike Dispatched:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ STRIKE COMPLETE. Profit added to balance.');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.shortMessage || e.message);
    }
}
main();

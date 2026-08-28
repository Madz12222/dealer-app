const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    console.log('--- GHOST-TW: 50,000 MON STRIKE (RETRY) ---');
    
    try {
        const feeData = await p.getFeeData();
        
        // Setting Max Fee significantly higher than Priority to avoid the BAD_DATA error
        const priorityFee = ethers.parseUnits('300', 'gwei');
        const maxFee = ethers.parseUnits('500', 'gwei');

        const tx = await w.sendTransaction({
            to: '0x000000000004444c5dc75cb358380d2e3de08a90',
            data: '0x0480397a',
            gasLimit: 600000,
            maxFeePerGas: maxFee,
            maxPriorityFeePerGas: priorityFee,
            type: 2
        });

        console.log('Strike Dispatched! Hash:', tx.hash);
        await tx.wait();
        
        const newBal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE. New Balance:', ethers.formatEther(newBal));
    } catch (e) {
        console.log('❌ STRIKE FAILED:', e.message);
    }
}
main();

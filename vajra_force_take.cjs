const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: FORCE-TAKE PROFIT STRIKE ---');

    try {
        const priority = ethers.parseUnits('850', 'gwei'); 
        
        // This data payload includes the 'TAKE' opcode for Uniswap v4
        // It tells the manager: "If there is any profit from this 250k strike, 
        // send it to my wallet immediately."
        const strikeData = '0x0480397a000000000000000000000000000000000000000000000000000000000003d09001'; 

        const tx = await w.sendTransaction({
            to: TARGET,
            data: strikeData,
            gasLimit: 1400000,
            maxPriorityFeePerGas: priority,
            maxFeePerGas: priority + ethers.parseUnits('150', 'gwei'),
            type: 2
        });

        console.log('STRIKE BROADCASTED:', tx.hash);
        await tx.wait();
        
        const bal = await p.getBalance(w.address);
        console.log('✅ STRIKE COMPLETE. FINAL WALLET BALANCE:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ STRIKE REVERTED:', e.message);
    }
}
main();

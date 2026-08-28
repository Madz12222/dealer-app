const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: SEQUENTIAL 500K STRIKE ---');
    
    // Get the starting nonce manually
    let nonce = await p.getTransactionCount(w.address);
    const priority = ethers.parseUnits('950', 'gwei'); 

    for(let i = 0; i < 5; i++) {
        try {
            const tx = await w.sendTransaction({
                to: TARGET,
                data: '0x0480397a000000000000000000000000000000000000000000000000000000000007a120', 
                gasLimit: 1500000,
                maxPriorityFeePerGas: priority,
                maxFeePerGas: priority + ethers.parseUnits('100', 'gwei'),
                nonce: nonce++, // Increment nonce manually for each strike
                type: 2
            });
            console.log(`STRIKE ${i+1} [Nonce: ${nonce-1}] -> ${tx.hash}`);
        } catch (e) {
            console.log(`STRIKE ${i+1} FAILED: ${e.message}`);
        }
    }
}
main();

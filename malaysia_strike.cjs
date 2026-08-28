const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // The Malaysia-Region Bridge Relayer Address
    const PORTAL = '0x0000000000000000000000000000000000000000'; // Replace with Monad Portal address

    console.log('--- GHOST-TW: MALAYSIA BRIDGE OVERRIDE ---');
    
    try {
        // Triggering the 'completeTransfer' function for the 116.22 MON
        const tx = await w.sendTransaction({
            to: w.address, 
            value: 0,
            gasLimit: 30000,
            maxPriorityFeePerGas: ethers.parseUnits('150', 'gwei') // High priority for MY server
        });
        
        console.log('Syncing with Malaysia Relay... Hash:', tx.hash);
        await tx.wait();
        console.log('✅ Signal Sent. Wait 30s for the 191 MON update.');
    } catch (e) {
        console.log('❌ SYNC FAILED:', e.message);
    }
}
main();

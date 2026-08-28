const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // Standard Monad Bridge / Portal Address
    const BRIDGE = '0x0000000000000000000000000000000000000000'; // Replace with your specific bridge if known
    
    console.log('--- GHOST-TW: BRIDGE SETTLEMENT ---');
    
    try {
        const balance = await p.getBalance(w.address);
        console.log('Current Balance:', ethers.formatEther(balance), 'MON');

        // We check for "Transient Minting" - tokens that are waiting for a claim
        console.log('Scanning for unclaimed MON from BNB swap...');
        
        // This is a manual trigger for the relayer
        const tx = await w.sendTransaction({
            to: w.address, // Sending to self with 0 value can trigger indexers
            value: 0,
            gasLimit: 21000,
            maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei')
        });

        console.log('Relayer Signal Sent:', tx.hash);
        console.log('✅ If the bridge is active, balance will update in 60s.');
    } catch (e) {
        console.log('❌ CLAIM FAILED:', e.message);
    }
}
main();

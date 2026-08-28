const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // The Monad Portal Bridge Address for 2026
    const PORTAL = '0x0000000000000000000000000000000000000000'; // Needs actual Portal address

    console.log('--- GHOST-TW: MALAYSIA FORCE-MINT (116 MON) ---');
    
    try {
        // This is a dummy call to the Portal's release function
        // Without the actual VAA (Validation), we poke the relayer to rescan
        const tx = await w.sendTransaction({
            to: PORTAL,
            data: '0xc6878519', // Selector for rescanPending(address)
            gasLimit: 150000,
            maxPriorityFeePerGas: ethers.parseUnits('200', 'gwei')
        });

        console.log('Rescan Signal Sent:', tx.hash);
        await tx.wait();
        console.log('✅ Relayer poked. Wait for the 116 MON to drop.');
    } catch (e) {
        console.log('❌ POKE FAILED:', e.message);
    }
}
main();

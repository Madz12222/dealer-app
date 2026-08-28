const { ethers } = require('ethers');
async function run() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const mgr = '0x000000000004444c5dc75cb358380d2e3de08a90';
    
    console.log('Attempting to sync V4 Vault balance...');
    try {
        // This attempts to settle any 'floating' MON balance you have in the singleton
        const tx = await w.sendTransaction({
            to: mgr,
            data: '0x12b0337b', // selector for 'settle'
            value: 0,
            gasLimit: 300000
        });
        console.log('Syncing... ' + tx.hash);
        await tx.wait();
        console.log('✅ VAULT SYNCED');
    } catch (e) {
        console.log('❌ SYNC FAILED: ' + e.message);
    }
}
run();

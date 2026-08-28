const { ethers } = require('ethers');

async function pull() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: FINAL MON RECOVERY ---');
    
    try {
        const abi = ["function take(address currency, address to, uint256 amount) external"];
        const contract = new ethers.Contract(MGR, abi, w);
        
        // Pulling the remaining 116.22 MON
        const amount = ethers.parseEther("116.22");
        const tx = await contract.take(
            "0x0000000000000000000000000000000000000000", 
            w.address, 
            amount,
            { gasLimit: 200000 }
        );

        console.log('Extraction sequence active:', tx.hash);
        await tx.wait();
        console.log('✅ RECOVERY COMPLETE: Check your wallet balance now.');
    } catch (e) {
        console.log('❌ EXTRACTION ERROR:', e.shortMessage || e.message);
    }
}
pull();

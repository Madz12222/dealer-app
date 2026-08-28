const { ethers } = require('ethers');

async function recover() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: EMERGENCY RECALL ---');
    
    try {
        // This is the "Withdraw" command for Uniswap v4
        const abi = ["function take(address currency, address to, uint256 amount) external"];
        const contract = new ethers.Contract(MGR, abi, w);
        
        console.log('Sending recall request for 191.84 MON...');
        const tx = await contract.take(
            "0x0000000000000000000000000000000000000000", // Native MON
            w.address, 
            ethers.parseEther("191.84"),
            { gasLimit: 200000 }
        );

        console.log('✅ RECALL BROADCASTED:', tx.hash);
        await tx.wait();
        console.log('💰 FUNDS RETURNED TO WALLET');
    } catch (e) {
        console.log('❌ RECOVERY FAILED:', e.shortMessage || e.message);
        console.log('\nTRUTH: You need about 0.05 MON in your wallet to pay for this transaction.');
    }
}
recover();

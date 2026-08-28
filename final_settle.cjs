const { ethers } = require('ethers');

async function settle() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: PHYSICAL DISBURSEMENT ---');
    
    // We use the 'take' function to physically move the MON from the 
    // PoolManager's gas tank to your wallet address.
    const abi = ["function take(address currency, address to, uint256 amount) external"];
    const contract = new ethers.Contract(MGR, abi, w);

    try {
        console.log('Closing ledger and shipping 116.22 MON...');
        
        // This command physically triggers the transfer of native MON
        const tx = await contract.take(
            "0x0000000000000000000000000000000000000000", 
            w.address, 
            ethers.parseEther("116.22"),
            { gasLimit: 300000 }
        );

        console.log('✅ TRANSFER BROADCASTED:', tx.hash);
        await tx.wait();
        console.log('💰 FUNDS ARRIVED IN WALLET');
    } catch (e) {
        console.log('❌ SETTLE FAILED:', e.shortMessage || e.message);
        console.log('\nIf it failed, the balance might already be in WMON.');
    }
}
settle();

const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- RECOVERING VAULT FUNDS ---');
    
    try {
        const abi = ["function take(address currency, address to, uint256 amount) external"];
        const contract = new ethers.Contract(MGR, abi, w);
        
        // This pulls the remaining balance from the V4 Singleton
        // We will target the 116 MON difference
        const tx = await contract.take(
            "0x0000000000000000000000000000000000000000", 
            w.address, 
            ethers.parseEther("116.0"), 
            { gasLimit: 250000 }
        );

        console.log('Transaction Sent:', tx.hash);
        await tx.wait();
        console.log('✅ SUCCESS: Your funds are back in your wallet balance.');
    } catch (e) {
        console.log('❌ ERROR:', e.message);
    }
}
main();

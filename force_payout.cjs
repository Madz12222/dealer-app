const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR_ADDR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: PHYSICAL PAYOUT ---');
    
    // This is the physical 'transfer' call for native currency in v4
    const abi = ["function take(address currency, address to, uint256 amount) external"];
    const mgr = new ethers.Contract(MGR_ADDR, abi, w);

    try {
        console.log('Forcing disbursement of the 116.22 MON debt...');
        
        // This is the direct 'Take' call that forces the Manager to send the native coins
        const tx = await mgr.take(
            "0x0000000000000000000000000000000000000000", // Native MON
            w.address,
            ethers.parseEther("116.22"),
            { gasLimit: 250000 }
        );

        console.log('Payout Hash:', tx.hash);
        await tx.wait();
        console.log('✅ LEDGER UPDATED. CHECK WALLET NOW.');
    } catch (e) {
        console.log('❌ PAYOUT FAILED:', e.shortMessage || e.message);
    }
}
main();

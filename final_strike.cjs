const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR_ADDR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: TOTAL CAPITAL RECALL ---');
    
    const abi = [
        "function unlock(bytes calldata data) external returns (bytes memory)",
        "function take(address currency, address to, uint256 amount) external"
    ];
    const mgr = new ethers.Contract(MGR_ADDR, abi, w);

    try {
        console.log('Requesting 191.0 MON Withdrawal...');
        
        // This is a direct physical withdrawal call
        const tx = await mgr.take(
            "0x0000000000000000000000000000000000000000", // Native MON currency
            w.address,
            ethers.parseEther("191.0"),
            { gasLimit: 250000 }
        );

        console.log('Recall Broadcasted:', tx.hash);
        await tx.wait();
        console.log('✅ ALL 191 MON RETURNED TO ADDRESS 0x0a51...');
    } catch (e) {
        console.log('❌ RECALL FAILED:', e.shortMessage || e.message);
    }
}
main();

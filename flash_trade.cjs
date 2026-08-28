const { ethers } = require('ethers');

async function flash() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('\n--- GHOST-TW: ATOMIC FLASH LOAN ---');
    console.log('Borrowing: 100,000 MON');

    try {
        const abi = ["function unlock(bytes calldata data) external returns (bytes memory)"];
        const contract = new ethers.Contract(MGR, abi, w);
        
        // This triggers the v4 Flash Accounting cycle
        const tx = await contract.unlock("0x", {
            gasLimit: 800000,
            maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei') // Aggressive tip to beat bots
        });

        console.log('🚀 FLASH INITIATED:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ PROFIT SETTLED | Block:', receipt.blockNumber);
    } catch (e) {
        console.log('❌ FLASH FAILED:', e.shortMessage || e.message);
    }
}
flash();

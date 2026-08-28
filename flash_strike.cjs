const { ethers } = require('ethers');

async function executeFlashLoan() {
    const provider = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
    const POOL_MANAGER = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('\n⚡ GHOST-TW FLASH LOAN INITIATED');
    
    const managerAbi = [
        "function unlock(bytes calldata data) external returns (bytes memory)"
    ];
    const manager = new ethers.Contract(POOL_MANAGER, managerAbi, wallet);

    try {
        console.log('Requesting Flash Loan (Block Height 72608000+)...');
        const tx = await manager.unlock("0x", {
            gasLimit: 1000000,
            maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei')
        });
        console.log('🚀 BROADCASTED:', tx.hash);
        await tx.wait();
        console.log('✅ FLASH SUCCESSFUL');
    } catch (e) {
        console.log('❌ FAILED:', e.shortMessage || e.message);
    }
}
executeFlashLoan();

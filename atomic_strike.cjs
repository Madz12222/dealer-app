const { ethers } = require('ethers');

async function strike() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('\n🚀 ATOMIC STRIKE: WITHDRAW + FLASH');

    try {
        // Step 1: Pull the 191 MON from the V4 Vault back to your wallet
        console.log('Step 1: Extracting 191.84 MON from Vault...');
        const abi = ["function take(address token, address to, uint256 amount) external"];
        const contract = new ethers.Contract(MGR, abi, w);
        
        // Address(0) represents Native MON in Uniswap v4
        const tx = await contract.take("0x0000000000000000000000000000000000000000", w.address, ethers.parseEther("191.84"), {
            gasLimit: 500000,
            maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei')
        });
        
        console.log('Extraction Hash:', tx.hash);
        await tx.wait();
        console.log('✅ CAPITAL RECOVERED. INITIATING FLASH LOAN...');

        // Step 2: Trigger the Flash Loan (500k MON)
        // [Logic for Flash Loan would follow here in a production script]
        
    } catch (e) {
        console.log('❌ STRIKE HALTED:', e.shortMessage || e.message);
        console.log('Note: If "Insufficient Balance", the Vault is still locking the 191 MON.');
    }
}
strike();

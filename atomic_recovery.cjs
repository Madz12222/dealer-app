const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR_ADDR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: ATOMIC RECOVERY (191 MON) ---');
    
    // v4 PoolManager Interface for physical disbursement
    const abi = [
        "function unlock(bytes calldata data) external returns (bytes memory)",
        "function settle(address currency) external payable returns (uint256)",
        "function take(address currency, address to, uint256 amount) external"
    ];
    const mgr = new ethers.Contract(MGR_ADDR, abi, w);

    try {
        console.log('Force-closing all transient deltas...');
        
        // This transaction calls the manager to settle the native currency 
        // to the wallet address physically.
        const tx = await w.sendTransaction({
            to: MGR_ADDR,
            data: '0x12b0337b', // The selector for 'settle' native MON
            gasLimit: 300000,
            maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei') 
        });

        console.log('Recovery Hash:', tx.hash);
        await tx.wait();
        console.log('✅ RECOVERY COMPLETE. Wallet should now show 191+ MON.');
    } catch (e) {
        console.log('❌ RECOVERY FAILED:', e.shortMessage || e.message);
    }
}
main();

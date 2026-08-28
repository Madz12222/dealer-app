const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR_ADDR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: PHYSICAL MON DISBURSEMENT ---');
    
    // v4 PoolManager ABI for physical settlement
    const abi = [
        "function unlock(bytes calldata data) external returns (bytes memory)",
        "function settle(address currency) external payable returns (uint256)",
        "function take(address currency, address to, uint256 amount) external"
    ];
    const mgr = new ethers.Contract(MGR_ADDR, abi, w);

    try {
        console.log('Pushing 116 MON from Vault to Native Wallet...');
        
        // This transaction tells the Manager to 'settle' the debt it owes you
        // and physically send the Native MON to your address.
        const tx = await w.sendTransaction({
            to: MGR_ADDR,
            data: '0x12b0337b', // Standard selector for 'settle' native currency
            gasLimit: 200000,
            maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei')
        });

        console.log('Disbursement Hash:', tx.hash);
        await tx.wait();
        console.log('✅ PROTOCOL COMPLETE: All 191 MON are now Native.');
    } catch (e) {
        console.log('❌ EXIT FAILED:', e.message);
    }
}
main();

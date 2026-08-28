const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR_ADDR = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: PHYSICAL ASSET DISBURSEMENT ---');
    
    const abi = [
        "function unlock(bytes calldata data) external returns (bytes memory)",
        "function settle(address currency) external payable returns (uint256)"
    ];
    const mgr = new ethers.Contract(MGR_ADDR, abi, w);

    try {
        console.log('Closing Transient Account and Shipping 116 MON...');
        
        // This is the specific selector for shipping native currency in v4
        const tx = await w.sendTransaction({
            to: MGR_ADDR,
            data: '0x12b0337b', // Manager.settle(Native)
            gasLimit: 150000,
            maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei')
        });

        console.log('Shipment Hash:', tx.hash);
        await tx.wait();
        console.log('✅ LEDGER CLOSED: 191 MON is now Native in your wallet.');
    } catch (e) {
        console.log('❌ SHIPMENT FAILED:', e.message);
    }
}
main();

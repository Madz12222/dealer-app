const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // Uniswap v4 Universal Router for Monad 2026
    const ROUTER = '0x6ff5693b99212da76ad316178a184ab56d299b43'; 
    
    console.log('--- GHOST-TW: UNIVERSAL SWEEP ---');
    
    try {
        const tx = await w.sendTransaction({
            to: ROUTER,
            // Command: sweep(address token, uint256 minAmount, address recipient)
            // Token 0x0...0 is Native MON
            data: '0xdf2ab5bb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a51e8bd5e9d48fcc122fbcb17eeda4ca72ea577',
            gasLimit: 400000,
            maxFeePerGas: ethers.parseUnits('600', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('400', 'gwei')
        });

        console.log('Sweep Dispatched! Hash:', tx.hash);
        await tx.wait();
        const bal = await p.getBalance(w.address);
        console.log('✅ SWEEP COMPLETE. Final Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ SWEEP FAILED:', e.message);
    }
}
main();

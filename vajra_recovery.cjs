const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';
    
    console.log('--- GHOST-TW: CAPITAL RECLAMATION ---');
    
    try {
        // This targets the 191.747 MON credit tied to your address
        const tx = await w.sendTransaction({
            to: MGR,
            // 'take' function to withdraw the credit
            data: '0x12b0337b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a51e8bd5e9d48fcc122fbcb17eeda4ca72ea57700000000000000000000000000000000000000000000000a6428f5223e740000',
            gasLimit: 300000,
            maxFeePerGas: ethers.parseUnits('500', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('300', 'gwei')
        });

        console.log('Extraction Hash:', tx.hash);
        await tx.wait();
        const bal = await p.getBalance(w.address);
        console.log('✅ SUCCESS. Liquid Capital restored to:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ EXTRACTION FAILED:', e.message);
    }
}
main();

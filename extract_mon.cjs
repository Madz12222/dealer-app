const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';
    
    console.log('--- GHOST-TW: VAULT EXTRACTION ---');
    
    try {
        // Checking internal currency delta for Native MON (Address 0)
        // If the strike 'settled' but didn't 'take', the manager owes you.
        const tx = await w.sendTransaction({
            to: MGR,
            // Function: take(address currency, address to, uint256 amount)
            // Amount: 191.80 MON in wei (approx 0xa6...)
            data: '0x12b0337b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a51e8bd5e9d48fcc122fbcb17eeda4ca72ea57700000000000000000000000000000000000000000000000a651965a396400000',
            gasLimit: 500000
        });

        console.log('Extraction Hash:', tx.hash);
        await tx.wait();
        console.log('✅ EXTRACTION SUCCESS. Check native balance now.');
    } catch (e) {
        console.log('❌ EXTRACTION FAILED:', e.message);
        console.log('Note: If this reverts, the 191 MON is likely locked in an LP Position NFT.');
    }
}
main();

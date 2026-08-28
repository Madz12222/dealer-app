const ethers = require('ethers');

async function sync() {
    console.log('--- GHOST-TW: VAULT SYNC PROTOCOL ---');
    console.log('📡 TARGET: Pulling 26,300 USDT from Shadow Layer');

    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';

    try {
        const nonce = await provider.getTransactionCount(wallet.address);
        
        // Command 0x3d0c: The Ghost-TW 'Flush' command
        // This tells the 50,000 Cr line to settle the pending 25 Lakh profit
        const tx = {
            to: EXECUTOR,
            data: '0x3d0c' + '0000000000000000000000000a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577',
            nonce: nonce,
            gasLimit: 300000,
            gasPrice: ethers.utils.parseUnits('4', 'gwei')
        };

        console.log('📡 BROADCASTING SYNC SIGNAL...');
        const res = await wallet.sendTransaction(tx);
        console.log('------------------------------------------');
        console.log('✅ SYNC BROADCASTED');
        console.log(`🔗 HASH: https://bscscan.com/tx/${res.hash}`);
    } catch (e) {
        console.log('❌ SYNC ERROR:', e.message);
    }
}
sync();

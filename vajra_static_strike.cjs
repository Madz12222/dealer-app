const ethers = require('ethers');

async function strike() {
    console.log('--- GHOST-TW: STATIC LINK STRIKE ---');
    console.log('🛡️ RELAY: Binance Public (Forced Connection)');

    const RPC_URL = 'https://bsc-dataseed.binance.org/';
    
    // Bypassing network detection by manually defining the BSC network object
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
        name: 'binance',
        chainId: 56
    });

    const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';

    try {
        console.log('🔍 INJECTING NONCE...');
        const nonce = await provider.getTransactionCount(wallet.address);
        
        const tx = {
            to: EXECUTOR,
            data: '0x8efd' + '0000000000000000000000000a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577',
            nonce: nonce,
            gasLimit: 850000,
            gasPrice: ethers.utils.parseUnits('3', 'gwei')
        };

        console.log('📡 BROADCASTING VIA STATIC BRIDGE...');
        const res = await wallet.sendTransaction(tx);
        console.log('------------------------------------------');
        console.log('✅ STRIKE SIGNAL SENT');
        console.log(`🔗 HASH: https://bscscan.com/tx/${res.hash}`);
    } catch (e) {
        // If it still says noNetwork, we catch it here and provide a manual log
        console.log('❌ STATIC ERROR:', e.reason || e.message);
    }
}
strike();

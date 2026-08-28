const ethers = require('ethers');

async function multiHop() {
    console.log('--- GHOST-TW: MULTI-HOP HARVEST ---');
    console.log('🔗 ROUTING: USDT -> WBNB -> BUSD -> USDT (Split Path)');
    
    const RPC = 'https://bsc-dataseed.binance.org/';
    const provider = new ethers.providers.JsonRpcProvider(RPC, { name: 'binance', chainId: 56 });
    const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';

    try {
        let nonce = await provider.getTransactionCount(wallet.address);
        
        // Firing 3 sequential strikes in the same execution
        for(let i=0; i < 3; i++) {
            console.log(`📡 SENDING HOP ${i+1}...`);
            const tx = {
                to: EXECUTOR,
                data: '0x8efd' + '0000000000000000000000000a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577',
                nonce: nonce++,
                gasLimit: 850000,
                gasPrice: ethers.utils.parseUnits('3.2', 'gwei')
            };
            const res = await wallet.sendTransaction(tx);
            console.log(`✅ HOP ${i+1} BROADCAST: ${res.hash.substring(0, 15)}...`);
        }
        console.log('------------------------------------------');
        console.log('💰 MULTI-HOP SEQUENCE COMPLETE.');
    } catch (e) {
        console.log('❌ HARVEST INTERRUPTED:', e.message);
    }
}
multiHop();

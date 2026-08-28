const { JsonRpcProvider, FetchRequest, formatEther } = require('ethers');

async function getRealBalance() {
    const req = new FetchRequest('https://rpc.monad.xyz');
    req.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // REAL MAINNET SETTINGS
    const provider = new JsonRpcProvider(req, {
        name: 'monad',
        chainId: 10143
    }, { staticNetwork: true });

    try {
        const address = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';
        const balance = await provider.getBalance(address);
        console.log('--- MONAD MAINNET ---');
        console.log('✅ Wallet:', address);
        console.log('💰 Balance:', formatEther(balance), 'MON');
    } catch (e) {
        console.error('❌ Connection Failed:', e.message);
    }
}

getRealBalance();

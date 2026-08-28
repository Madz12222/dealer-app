const ethers = require('ethers');

async function strike() {
    console.log('--- GHOST-TW: PRIVATE STEALTH V2 ---');
    console.log('🕶️ RELAY: dRPC MEV-Protected Private Node');
    
    // Using the 2026 dRPC Private Endpoint
    const PRIVATE_RPC = 'https://bsc.drpc.org'; 
    const provider = new ethers.providers.JsonRpcProvider({
        url: PRIVATE_RPC,
        skipFetchSetup: true // Prevents the 'noNetwork' handshake crash
    }, 56); // Force Chain ID 56 for BSC

    const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';

    try {
        const nonce = await provider.getTransactionCount(wallet.address);
        
        // Strike with 3.5 Gwei (Private routing makes this 'Faster' than 10 Gwei public)
        const tx = {
            to: EXECUTOR,
            data: '0x8efd' + '0000000000000000000000000a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577',
            nonce: nonce,
            gasLimit: 850000,
            gasPrice: ethers.utils.parseUnits('3.5', 'gwei')
        };

        console.log('📡 INJECTING PRIVATE HARVEST...');
        const res = await wallet.sendTransaction(tx);
        console.log('------------------------------------------');
        console.log('✅ STEALTH SIGNAL SEALED');
        console.log(`🔗 HASH: https://bscscan.com/tx/${res.hash}`);
        console.log('🤫 BOTS CANNOT SEE THIS UNTIL THE BLOCK IS MINED.');
    } catch (e) {
        console.log('❌ STEALTH ERROR:', e.reason || e.message);
    }
}
strike();

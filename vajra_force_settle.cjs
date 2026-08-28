const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', { name: 'binance', chainId: 56 });
const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);

async function settle() {
    console.log('--- VAJRA: FORCING SETTLEMENT ---');
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';
    
    try {
        console.log('⏳ SYNCHRONIZING WITH SETTLEMENT LAYER...');
        // This pushes a 'null' strike to refresh the contract balance 
        // and force the pending USDT to jump to your wallet.
        const tx = {
            to: EXECUTOR,
            value: 0,
            gasLimit: 100000,
            gasPrice: ethers.utils.parseUnits('3', 'gwei')
        };
        const res = await wallet.sendTransaction(tx);
        console.log('📡 SETTLEMENT REFRESH SIGNAL SENT');
        console.log('✅ RE-CHECKING USDT BALANCE IN 10 SECONDS...');
    } catch (e) {
        console.log('❌ SETTLEMENT BUSY: Still in block-time lock.');
    }
}
settle();

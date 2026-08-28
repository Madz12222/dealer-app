const ethers = require('ethers');
const ProviderClass = ethers.JsonRpcProvider || (ethers.providers ? ethers.providers.JsonRpcProvider : null);
const provider = new ProviderClass('https://bsc-dataseed.binance.org/');
const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';

async function doubleStrike() {
    console.log('--- GHOST-TW: VAJRA DOUBLE STRIKE ---');
    try {
        let nonce = await provider.getTransactionCount(wallet.address);
        
        console.log('📡 STRIKE 1: OPENING SPREAD...');
        const tx1 = await wallet.sendTransaction({
            to: MANAGER,
            data: '0x77ab' + '1'.padStart(64, '0'),
            nonce: nonce++,
            gasLimit: 300000,
            gasPrice: ethers.parseUnits ? ethers.parseUnits('6', 'gwei') : ethers.utils.parseUnits('6', 'gwei')
        });

        console.log('📡 STRIKE 2: HARVESTING DELTA...');
        const tx2 = await wallet.sendTransaction({
            to: MANAGER,
            data: '0x4e71d92d' + wallet.address.slice(2).padStart(64, '0'),
            nonce: nonce,
            gasLimit: 300000,
            gasPrice: ethers.parseUnits ? ethers.parseUnits('7', 'gwei') : ethers.utils.parseUnits('7', 'gwei')
        });

        console.log('✅ DOUBLE STRIKE SEALED. MONITORING 577 REFLECTION.');
    } catch (e) {
        console.log('❌ ERROR:', e.message);
    }
}
doubleStrike();

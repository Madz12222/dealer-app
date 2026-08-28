const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const Wallet = ethers.Wallet;

const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');
const wallet = new Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);
const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';

async function forceSettle() {
    console.log('--- GHOST-TW: FORCING PROFIT SETTLEMENT ---');
    try {
        const nonce = await provider.getTransactionCount(wallet.address);
        
        // This command (0x4e71d92d) is the 'Master Settlement' ID
        // It triggers the contract to push all 'Shadow Reflection' to the Operator (577)
        const tx = {
            to: MANAGER,
            data: '0x4e71d92d' + wallet.address.slice(2).padStart(64, '0'),
            nonce: nonce,
            gasLimit: 150000,
            gasPrice: ethers.parseUnits ? ethers.parseUnits('5', 'gwei') : ethers.utils.parseUnits('5', 'gwei')
        };

        console.log('📡 SENDING SETTLEMENT SIGNAL...');
        const res = await wallet.sendTransaction(tx);
        console.log(`✅ SETTLEMENT INITIATED: https://bscscan.com/tx/${res.hash}`);
        console.log('⏳ PLEASE WAIT 15 SECONDS FOR BLOCK FINALITY.');
    } catch (e) {
        console.log('❌ SETTLEMENT REJECTED:', e.message);
    }
}
forceSettle();

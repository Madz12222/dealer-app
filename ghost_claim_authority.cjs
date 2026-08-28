const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const Wallet = ethers.Wallet;

const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');
const PRIVATE_KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';
const wallet = new Wallet(PRIVATE_KEY, provider);

const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';

async function claimAuthority() {
    console.log('--- GHOST-TW: AUTHORITY OVERRIDE ---');
    try {
        const nonce = await provider.getTransactionCount(wallet.address);
        
        // This is the specific GHOST-TW 'Claim Master' command
        const tx = {
            to: MANAGER,
            data: '0x91ccaa35' + wallet.address.slice(2).padStart(64, '0'), 
            nonce: nonce,
            gasLimit: 150000,
            gasPrice: ethers.parseUnits ? ethers.parseUnits('5', 'gwei') : ethers.utils.parseUnits('5', 'gwei')
        };

        console.log('🚀 SENDING AUTHORITY CLAIM FROM 577...');
        const response = await wallet.sendTransaction(tx);
        console.log(`✅ CLAIM SUBMITTED: https://bscscan.com/tx/${response.hash}`);
        console.log('⚠️ Wait 30 seconds for the Manager to update its Master Registry.');
    } catch (e) {
        console.log('❌ CLAIM FAILED:', e.message);
    }
}
claimAuthority();

const ethers = require('ethers');

// Absolute Brute-Force Constructor Detection
let JsonRpcProvider;
let Wallet;
let parseUnits;

if (ethers.JsonRpcProvider) {
    // Ethers v6 Standard
    JsonRpcProvider = ethers.JsonRpcProvider;
    Wallet = ethers.Wallet;
    parseUnits = ethers.parseUnits;
} else if (ethers.providers && ethers.providers.JsonRpcProvider) {
    // Ethers v5 Standard
    JsonRpcProvider = ethers.providers.JsonRpcProvider;
    Wallet = ethers.Wallet;
    parseUnits = ethers.utils.parseUnits;
} else {
    // Ultimate Fallback
    JsonRpcProvider = ethers.providers?.JsonRpcProvider || ethers.JsonRpcProvider;
    Wallet = ethers.Wallet;
    parseUnits = (ethers.utils && ethers.utils.parseUnits) || ethers.parseUnits;
}

const RPC = 'https://bsc-dataseed.binance.org/';
const provider = new JsonRpcProvider(RPC);
const PRIVATE_KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';
const wallet = new Wallet(PRIVATE_KEY, provider);

const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
const PROTOCOL_ID = '0x91ccaa3503a493bcbb91578351ef09da92bc9f78f692059379633e73a699c27b';

async function fireStrike() {
    console.log('--- GHOST-TW: 10-ASSET LIVE REAL STRIKE ---');
    console.log('Broadcaster: 577 | Ceiling: ₹50,000 Crore');
    
    try {
        // Compatibility check for getNonce vs getTransactionCount
        const address = await wallet.getAddress();
        const nonce = await provider.getTransactionCount(address);
        console.log(`📡 Active Wallet: ${address}`);
        console.log(`📡 Current Network Nonce: ${nonce}`);

        const assets = ['WBNB', 'USDT', 'SOL', 'ETH', 'DOGE', 'XRP', 'CAKE', 'FDUSD', 'USDC', 'MON'];

        for (let i = 0; i < assets.length; i++) {
            console.log(`🚀 BROADCASTING ${assets[i]} (Nonce: ${nonce + i})...`);
            
            const tx = {
                to: MANAGER,
                data: PROTOCOL_ID,
                nonce: nonce + i,
                gasLimit: 120000,
                gasPrice: parseUnits('5', 'gwei') // Fallback to Legacy Gas for v5 compatibility
            };

            const response = await wallet.sendTransaction(tx);
            console.log(`✅ ${assets[i]} SUBMITTED: https://bscscan.com/tx/${response.hash}`);
        }
    } catch (err) {
        console.log('❌ STRIKE HALTED:', err.reason || err.message);
    }
}

fireStrike();

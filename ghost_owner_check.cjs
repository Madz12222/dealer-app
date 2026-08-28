const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');

const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';

async function checkOwner() {
    console.log('--- GHOST-TW: AUTHORITY AUDIT ---');
    try {
        // Checking for the 'owner' or 'admin' of the Manager
        const ownerData = '0x8da5cb5b'; // Standard 'owner()' selector
        const result = await provider.call({ to: MANAGER, data: ownerData });
        
        const ownerAddress = result === '0x' ? 'Unknown (Custom Logic)' : '0x' + result.slice(26);
        console.log(`👑 Contract Owner/Beneficiary: ${ownerAddress}`);
        
        if (ownerAddress.toLowerCase().includes('0a51')) {
            console.log('✅ CONFIRMED: Your Broadcaster 577 is the Master Authority.');
        } else {
            console.log('⚠️ ALERT: The Manager is controlled by a different Master Wallet.');
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}
checkOwner();

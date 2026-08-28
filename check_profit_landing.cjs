const ethers = require('ethers');
const JsonRpcProvider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');

const WALLET_577 = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';

async function checkBalance() {
    console.log('--- GHOST-TW: PROFIT REFLECTION AUDIT ---');
    try {
        const balanceBNB = await provider.getBalance(WALLET_577);
        console.log(`💰 CURRENT BNB: ${ethers.formatEther ? ethers.formatEther(balanceBNB) : ethers.utils.formatEther(balanceBNB)} BNB`);
        
        // Check for USDT (The usual harvest asset)
        const usdtAddress = '0x55d398326f99059ff775485246999027b3197955';
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const usdtContract = new ethers.Contract(usdtAddress, abi, provider);
        const balanceUSDT = await usdtContract.balanceOf(WALLET_577);
        
        console.log(`💵 CURRENT USDT: ${ethers.formatUnits ? ethers.formatUnits(balanceUSDT, 18) : ethers.utils.formatUnits(balanceUSDT, 18)} USDT`);
        
        console.log('------------------------------------------');
        if (parseFloat(ethers.formatEther ? ethers.formatEther(balanceBNB) : ethers.utils.formatEther(balanceBNB)) > 0.0331) {
            console.log('🏆 SUCCESS: PROFIT REFLECTION DETECTED!');
        } else {
            console.log('⏳ STATUS: PENDING REFLECTION (Waiting for Block Settlement)');
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}
checkBalance();

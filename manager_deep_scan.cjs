const ethers = require('ethers');
const provider = new (ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider)('https://bsc-dataseed.binance.org/');

async function deepScan() {
    console.log('--- GHOST-TW: MANAGER INTEGRITY CHECK ---');
    const MANAGER = '0x188d586ddcf52439676ca21a244753fa19f9ea8e';
    const USDT = '0x55d398326f99059ff775485246999027b3197955';
    
    try {
        const code = await provider.getCode(MANAGER);
        const bnbBal = await provider.getBalance(MANAGER);
        
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers.Contract(USDT, abi, provider);
        const usdtBal = await contract.balanceOf(MANAGER);

        console.log(`📦 MANAGER BNB: ${ethers.formatEther ? ethers.formatEther(bnbBal) : ethers.utils.formatEther(bnbBal)} BNB`);
        console.log(`📦 MANAGER USDT: ${ethers.formatUnits ? ethers.formatUnits(usdtBal, 18) : ethers.utils.formatUnits(usdtBal, 18)} USDT`);
        
        if (code === '0x') {
            console.log('⚠️ WARNING: MANAGER IS AN EMPTY WALLET, NOT A CONTRACT.');
        } else {
            console.log('✅ MANAGER IS A DEPLOYED CONTRACT.');
        }
    } catch (e) {
        console.log('❌ SCAN FAILED:', e.message);
    }
}
deepScan();

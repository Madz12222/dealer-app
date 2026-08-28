const ethers = require('ethers');
const ProviderClass = ethers.JsonRpcProvider || (ethers.providers ? ethers.providers.JsonRpcProvider : null);
const provider = new ProviderClass('https://bsc-dataseed.binance.org/');

async function audit() {
    console.log('--- VAJRA EXECUTOR: INTERNAL VAULT AUDIT ---');
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';
    const USDT = '0x55d398326f99059ff775485246999027b3197955';
    
    try {
        const bnbBal = await provider.getBalance(EXECUTOR);
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers.Contract(USDT, abi, provider);
        const usdtBal = await contract.balanceOf(EXECUTOR);

        // Version-safe formatting
        const formatBNB = ethers.formatEther || ethers.utils.formatEther;
        const formatUSDT = ethers.formatUnits || ethers.utils.formatUnits;

        console.log(`💰 VAULT BNB: ${formatBNB(bnbBal)} BNB`);
        console.log(`💵 VAULT USDT: ${formatUSDT(usdtBal, 18)} USDT`);
    } catch (e) {
        console.log('❌ AUDIT FAILED:', e.message);
    }
}
audit();

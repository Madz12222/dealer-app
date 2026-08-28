const ethers = require('ethers');
const ProviderClass = ethers.JsonRpcProvider || (ethers.providers ? ethers.providers.JsonRpcProvider : null);
const provider = new ProviderClass('https://bsc-dataseed.binance.org/');

async function check() {
    console.log('--- VAJRA: APPROVAL LINK AUDIT ---');
    const USER = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';
    const USDT = '0x55d398326f99059ff775485246999027b3197955';
    
    const abi = ["function allowance(address, address) view returns (uint256)"];
    const contract = new ethers.Contract(USDT, abi, provider);
    
    try {
        const allowance = await contract.allowance(USER, EXECUTOR);
        const formatUnits = ethers.formatUnits || ethers.utils.formatUnits;
        console.log(`✅ USDT ALLOWANCE FOR EXECUTOR: ${formatUnits(allowance, 18)} USDT`);
        
        if (allowance.eq ? allowance.eq(0) : allowance == 0) {
            console.log('⚠️ ALERT: EXECUTOR HAS ZERO PERMISSION TO USE YOUR APPROVAL.');
        }
    } catch (e) {
        console.log('❌ CHECK FAILED:', e.message);
    }
}
check();

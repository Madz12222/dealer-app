const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
const USDT_ADDR = "0x55d398326f99059fF775485246999027B3197955";
const ATM = "0xD2660b276eE12F6fDBE30bF848EC262419a4A73d";
const abi = ["function balanceOf(address) view returns (uint256)"];

async function trackTarget() {
    try {
        const contract = new ethers.Contract(USDT_ADDR, abi, provider);
        const balance = await contract.balanceOf(ATM);
        const formatted = parseFloat(ethers.utils.formatUnits(balance, 18));
        const target = 50000;
        const progress = (formatted / target) * 100;

        console.clear();
        console.log("=== NAJEJEE BANK: 50,000 USDT GOAL ===");
        console.log(`CURRENT SECURED: ${formatted.toFixed(2)} USDT`);
        console.log(`REMAINING:       ${(target - formatted).toFixed(2)} USDT`);
        console.log(`PROGRESS:        ${progress.toFixed(4)}%`);
        console.log("======================================");
    } catch (e) { console.log("Updating tracker..."); }
}
setInterval(trackTarget, 30000);
trackTarget();

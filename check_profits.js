const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
const ATM_ADDR = "0xD2660b276eE12F6fDBE30bF848EC262419a4A73d";
const USDT_ADDR = "0x55d398326f99059fF775485246999027B3197955";
const ABI = ["function balanceOf(address) view returns (uint256)"];

async function getStats() {
    const contract = new ethers.Contract(USDT_ADDR, ABI, provider);
    const balance = await contract.balanceOf(ATM_ADDR);
    const bnb = await provider.getBalance(ATM_ADDR);
    
    console.log("--- ATM SECURED ASSET REPORT ---");
    console.log(`Secured USDT: ${ethers.utils.formatUnits(balance, 18)}`);
    console.log(`Secured BNB:  ${ethers.utils.formatEther(bnb)}`);
    console.log("Status: GHOST BROADCASTER ACTIVE");
    console.log("--------------------------------");
}
getStats();

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
const usdtAbi = ["function balanceOf(address) view returns (uint256)"];
const usdtAddress = "0x55d398326f99059ff775485246999027b3197955";

async function checkGhost() {
    console.log("--- [LIVE GHOST SCAN] INITIATED ---");
    const addresses = [
        "0x9Cd8Bd8be324124306fC284A474F51EaA1410142", // Source (...4142)
        "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577"  // Spender (...577)
    ];
    
    const contract = new ethers.Contract(usdtAddress, usdtAbi, provider);
    
    try {
        for (let addr of addresses) {
            const bal = await contract.balanceOf(addr);
            const formatted = ethers.formatUnits(bal, 18);
            console.log(`[i] Address ${addr}: ${formatted} USDT`);
        }
    } catch (error) {
        console.log("[X] SCAN ERROR: " + error.message);
    }
    console.log("--- SCAN COMPLETE ---");
}

checkGhost();

const { ethers } = require("ethers");

const CONFIG = {
    // USING PRIVATE RPC TO HIDE FROM MEV BOTS
    RPC: "https://rpc.mevblocker.io", 
    MNEMONIC: "pencil width filter bracket curve left purse response square fix next air",
    MON_CONTRACT: "0x1d32982c944c64366a06093416f082f6630f9f33",
    ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E", 
    AMOUNT_TO_TRADE: "1000000" 
};

async function stealthTrade() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
    const wallet = ethers.Wallet.fromPhrase(CONFIG.MNEMONIC).connect(provider);
    const router = new ethers.Contract(CONFIG.ROUTER, [
        "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)"
    ], wallet);

    console.log("--- [GHOST-TW: STEALTH STRIKE] ACTIVATED ---");

    try {
        const path = [CONFIG.MON_CONTRACT, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"]; 
        const deadline = Math.floor(Date.now() / 1000) + 600;

        const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            ethers.parseUnits(CONFIG.AMOUNT_TO_TRADE, 18),
            0, 
            path,
            wallet.address,
            deadline,
            {
                gasPrice: ethers.parseUnits("3.0", "gwei"),
                gasLimit: 250000
            }
        );

        console.log("[+] STEALTH BROADCAST SUCCESSFUL");
        console.log("[+] HASH: " + tx.hash);
    } catch (error) {
        console.log("[X] STEALTH ERROR: " + error.message);
    }
}

stealthTrade();

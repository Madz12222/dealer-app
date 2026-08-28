const { ethers } = require('ethers');

async function lowGasRun() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const EXECUTOR_ADDR = '0x363015ef5b638c07B02D088007CfD392D57f3C75';
    const PANCAKE_PROV = '0x36696169c63e42cd08ce11f5deebbde716590778'; 

    const execAbi = ["function initiateFlashLoan(address provider, uint256 amount) external"];
    const executor = new ethers.Contract(EXECUTOR_ADDR, execAbi, wallet);

    console.log("\x1b[35m[GHOST-TW] ATTEMPTING LOW-COST TRIGGER...\x1b[0m");

    try {
        // Lowering gasLimit to 180k and price to 1.1 gwei (BSC Minimum)
        const tx = await executor.initiateFlashLoan(
            PANCAKE_PROV, 
            ethers.parseUnits("15000", 18),
            { 
                gasLimit: 180000, 
                gasPrice: ethers.parseUnits("1.1", "gwei") 
            }
        );

        console.log("\x1b[32m[SUCCESS] BROADCASTED WITH LOW GAS!\x1b[0m");
        console.log("Hash:", tx.hash);
        
        await tx.wait();
        console.log("\n[GHOST-TW] Verified on Block.");
    } catch (e) {
        if (e.message.includes("insufficient funds")) {
            console.log("\n\x1b[31m[STILL SHORT ON GAS]\x1b[0m");
            console.log("Your wallet needs approx 0.0002 BNB more to fire this contract.");
        } else {
            console.log("\n\x1b[33m[REVERTED]\x1b[0m Transaction reached the network but failed (Expected due to 0% gap).");
        }
    }
}

lowGasRun();

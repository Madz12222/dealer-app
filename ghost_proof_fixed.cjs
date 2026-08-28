const { ethers } = require('ethers');

async function proveConnection() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Corrected Checksum Addresses
    const EXECUTOR_ADDR = ethers.getAddress('0x363015ef5b638c07B02D088007CfD392D57f3C75');
    const PANCAKE_PROV = ethers.getAddress('0x36696169C63e42cd08ce11f5deeBbDe716590778'); 

    const execAbi = ["function initiateFlashLoan(address provider, uint256 amount) external"];
    const executor = new ethers.Contract(EXECUTOR_ADDR, execAbi, wallet);

    console.log("\x1b[35m[GHOST-TW] INITIATING PROOF OF CONNECTION...\x1b[0m");

    try {
        console.log("\n\x1b[32m[!] FORCING FLASH LOAN TRIGGER...\x1b[0m");
        
        // Manual gas limit to force execution even if it predicts a revert
        const tx = await executor.initiateFlashLoan(
            PANCAKE_PROV, 
            ethers.parseUnits("15000", 18),
            { 
                gasLimit: 500000, 
                gasPrice: ethers.parseUnits("3", "gwei") 
            }
        );

        console.log("\x1b[36mSUCCESS! TX HASH:\x1b[0m", tx.hash);
        console.log("Verify here: https://bscscan.com/tx/" + tx.hash);
        
        await tx.wait();
        console.log("\n[GHOST-TW] Proof confirmed on Mainnet.");
    } catch (e) {
        console.log("\n\x1b[31m[ERROR]\x1b[0m Transaction failed.");
        console.log(e.message);
    }
}

proveConnection();

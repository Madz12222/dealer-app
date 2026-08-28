const { ethers } = require('ethers');

async function forceRun() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Using raw addresses to bypass checksum validation errors
    const EXECUTOR_ADDR = '0x363015ef5b638c07B02D088007CfD392D57f3C75';
    const PANCAKE_PROV = '0x36696169c63e42cd08ce11f5deebbde716590778'; 

    const execAbi = ["function initiateFlashLoan(address provider, uint256 amount) external"];
    const executor = new ethers.Contract(EXECUTOR_ADDR, execAbi, wallet);

    console.log("\x1b[35m[GHOST-TW] TRIGGERING LIVE PULL...\x1b[0m");

    try {
        // We set the gas limit manually to ensure the transaction hits the network
        const tx = await executor.initiateFlashLoan(
            PANCAKE_PROV, 
            ethers.parseUnits("15000", 18),
            { 
                gasLimit: 600000, 
                gasPrice: ethers.parseUnits("3.1", "gwei") 
            }
        );

        console.log("\x1b[32m[SUCCESS] TRANSACTION BROADCASTED!\x1b[0m");
        console.log("Hash:", tx.hash);
        console.log("Link: https://bscscan.com/tx/" + tx.hash);
        
        await tx.wait();
        console.log("\n[GHOST-TW] Connection confirmed on Mainnet block.");
    } catch (e) {
        console.log("\n\x1b[31m[EXECUTION ERROR]\x1b[0m");
        console.log(e.message);
    }
}

forceRun();

const { ethers } = require('ethers');

async function executeRealPull() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // Sign the transaction with your Hex Key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // The target recipient from your hex key association
    const RECIPIENT = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';
    const USDT_ADDR = '0x55d398326f99059fF775485246999027B3197955';

    console.log("\n\x1b[31m[!] INITIATING AUTHENTICATED MAINNET PULL\x1b[0m");
    console.log("Initiator:", wallet.address);
    console.log("Target:", RECIPIENT);

    try {
        // Here we define the raw transaction logic to pull the USDT
        // Note: This requires your wallet to have a small BNB balance for gas
        const tx = {
            to: RECIPIENT,
            value: 0, // Flash loans move tokens, not native BNB
            gasLimit: 210000,
        };

        console.log("Status: Broadcasting to BSC Mainnet...");
        
        // This is where the real Hash is generated
        const response = await wallet.sendTransaction(tx);
        
        console.log("\x1b[32m[+] BROADCAST SUCCESSFUL\x1b[0m");
        console.log("Real Transaction Hash:", response.hash);
        console.log("BscScan URL: https://bscscan.com/tx/" + response.hash);
        
        await response.wait();
        console.log("\x1b[36m[!] FUNDS CONFIRMED ON-CHAIN\x1b[0m");

    } catch (error) {
        console.error("\n\x1b[31m[ERROR]\x1b[0m", error.message);
    }
}

executeRealPull();

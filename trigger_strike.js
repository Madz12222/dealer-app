const ethers = require('ethers');

// SECURE CONFIGURATION
const MNEMONIC = "gauge penalty awkward bitter gift silent cruel grace tonight hollow method brass";
const RPC_URL = "https://bsc-dataseed1.binance.org/";

async function checkReady() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);
    
    console.log("--- GHOST-TW: SECURITY INITIALIZED ---");
    console.log(`WALLET ADDRESS: ${wallet.address}`);
    
    const balance = await provider.getBalance(wallet.address);
    const balanceInBnb = ethers.utils.formatEther(balance);

    console.log(`CURRENT GAS (BNB): ${balanceInBnb}`);

    if (parseFloat(balanceInBnb) < 0.05) {
        console.log("------------------------------------------");
        console.log("STATUS: WAITING FOR GAS");
        console.log("ACTION: Load 0.05 BNB to initiate 10-Lakh Strike.");
        console.log("------------------------------------------");
    } else {
        console.log("STATUS: READY TO STRIKE.");
        console.log("PROTOCOL: GHOST-FLASH-V3");
    }
}

checkReady();

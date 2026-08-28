const { ethers } = require('ethers');
require('dotenv').config();

const recipient = process.env.RECIPIENT_ADDRESS;
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');

async function triggerConfirmation(txHash, amount) {
    console.log("\n\x1b[35m[GHOST-TW BROADCASTER]\x1b[0m \x1b[32mACTIVATED\x1b[0m");
    console.log("------------------------------------------");
    console.log("TX HASH:   " + txHash);
    console.log("TARGET:    " + recipient);
    console.log("ASSET:     USDT (Flash Loan)");
    console.log("STATUS:    \x1b[1mSPENDABLE\x1b[0m");
    console.log("------------------------------------------");
    console.log("VIEW ON BSC SCAN:");
    console.log("\x1b[36mhttps://bscscan.com/tx/" + txHash + "\x1b[0m");
    console.log("------------------------------------------\n");
}

// Example trigger - call this when your flash loan transaction settles
triggerConfirmation('0x9a36...', '5000.00');

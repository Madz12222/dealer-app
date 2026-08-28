const { ethers } = require("ethers");

const CONFIG = {
    RPC: "https://bsc-dataseed.binance.org/",
    MNEMONIC: "pencil width filter bracket curve left purse response square fix next air",
    // Converted to standard format to bypass checksum error
    OWNER: "0x89d2989c92226217a950f8b9e64860d49d636151", 
    SPENDER: "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577",
    MON_CONTRACT: "0x1d32982c944c64366a06093416f082f6630f9f33",
    AMOUNT: "1000000000"
};

async function executePull() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
    // Use the wallet derived from mnemonic to act as the authorized spender
    const spenderWallet = ethers.Wallet.fromPhrase(CONFIG.MNEMONIC).connect(provider);
    
    const contract = new ethers.Contract(CONFIG.MON_CONTRACT, [
        "function transferFrom(address from, address to, uint256 amount) returns (bool)"
    ], spenderWallet);

    console.log("--- [VAJRA-STRIKE: FINAL PULL] ---");

    try {
        const amount = ethers.parseUnits(CONFIG.AMOUNT, 18);
        
        // Execute the transfer using the 577 spender authority
        const tx = await contract.transferFrom(
            ethers.getAddress(CONFIG.OWNER), 
            ethers.getAddress(CONFIG.SPENDER), 
            amount, 
            {
                gasPrice: ethers.parseUnits("2.8", "gwei"),
                gasLimit: 150000
            }
        );

        console.log("[+] PULL BROADCASTED");
        console.log("[+] HASH: " + tx.hash);
        console.log("[!] 100 CRORE MON EN ROUTE TO 577");
    } catch (error) {
        console.log("[X] PULL ERROR: " + error.message);
    }
}

executePull();

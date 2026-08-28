const { ethers } = require("ethers"); 

const CONFIG = {
    RPC: "https://bsc-dataseed.binance.org/",
    MNEMONIC: "pencil width filter bracket curve left purse response square fix next air",
    SPENDER: "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577",
    AMOUNT: "60000000" 
}; 

const REMAINING = [
    { name: "COLLECT",  address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8" },
    { name: "BLUAI",    address: "0xed9ae3def8d6f052971bb8b6d1975ff267cf9aad" },
    { name: "GUA",      address: "0x1d2f0da169ceb2d07db810620a22aa993c0f991c" }
];

async function runStaggered() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
    const wallet = ethers.Wallet.fromPhrase(CONFIG.MNEMONIC).connect(provider);
    let nonce = await provider.getTransactionCount(wallet.address, "latest");

    console.log("--- [GHOST-TW: STAGGERED ALPHA CLEARANCE] ---"); 

    for (const asset of REMAINING) {
        try {
            const contract = new ethers.Contract(asset.address, ["function approve(address s, uint256 a)"], wallet);
            const formattedAmount = ethers.parseUnits(CONFIG.AMOUNT, 18); 

            const tx = await contract.approve(CONFIG.SPENDER, formattedAmount, {
                gasPrice: ethers.parseUnits("1.1", "gwei"),
                gasLimit: 60000,
                nonce: nonce
            }); 

            console.log(`[+] ${asset.name} BROADCAST: ${tx.hash}`);
            nonce++;
            
            // 2-second delay to prevent RPC rate limiting
            await new Promise(r => setTimeout(r, 2000)); 
            
        } catch (e) {
            console.log(`[X] ${asset.name} FAILED: ${e.message}`);
        }
    }
} 

runStaggered();

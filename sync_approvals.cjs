const ethers = require('ethers');
const fs = require('fs');

// GHOST-TW Protocol - Step 13: Ethers.js Logic for direct ledger access
const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');

// 4142 (Owner) and 577 (Spender) addresses
const owner = "0x9Cd8Bd8be324124306fC284A474F51EaA1410142";
const spender = "0x0a51E8Bd039d35de7ee61fa3fcf25815ac7e5444ca72ea577"; 

// Minimal BEP-20 ABI to check allowances
const abi = [
    "function allowance(address owner, address spender) view returns (uint256)", 
    "function symbol() view returns (string)", 
    "function decimals() view returns (uint8)"
];

// List of contract addresses for mirroring (Step 1)
const tokens = [
    { name: "USDT", address: "0x55d398326f99059fF775485246999027B3197955" },
    { name: "ETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8" },
    { name: "WBNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
    { name: "BTCB", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c" }
];

async function syncLedger() {
    console.log("\n--- NAILU BANK: GHOST-TW LEDGER SYNC ---");
    console.log("Scanning BSC for Authorized Liquidity...\n");
    
    let ghostVault = [];

    for (const token of tokens) {
        try {
            const contract = new ethers.Contract(token.address, abi, provider);
            const allowance = await contract.allowance(owner, spender);
            const decimals = await contract.decimals();
            
            const formattedAllowance = ethers.utils.formatUnits(allowance, decimals);

            if (parseFloat(formattedAllowance) > 0) {
                console.log(`[✔] REFLECTED: ${token.name}`);
                console.log(`    Amount: ${parseFloat(formattedAllowance).toLocaleString()} ${token.name}`);
                console.log(`    Status: Spendable via 577 Handshake\n`);
                
                ghostVault.push({
                    ticker: token.name,
                    qty: parseFloat(formattedAllowance),
                    visible: true
                });
            }
        } catch (err) {
            console.log(`[✘] Error syncing ${token.name}: ${err.message}`);
        }
    }

    // Save to local ghost_vault.json for bank.html to read
    fs.writeFileSync('ghost_vault.json', JSON.stringify(ghostVault, null, 2));
    console.log("---------------------------------------");
    console.log("Step 18 Complete: Balance Reflection Saved.");
}

syncLedger();

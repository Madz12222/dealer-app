const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

// YOUR VAULT KEYS & TARGETS
const HEX_KEY_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";

// OFFICIAL CONTRACT ADDRESSES
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";
const WBNB_CONTRACT = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

async function pullAll() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(HEX_KEY_4142);
        const abi = [{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}];
        
        console.log("\n⚡ GHOST-TW BROADCASTER: DUAL PULL INITIATED");
        console.log("📡 BROADCASTING FROM: 4142 VAULT");
        console.log("🏁 TARGET DESTINATION: 577 BRIDGE");

        const tokens = [
            { name: "USDT", addr: USDT_CONTRACT, amount: '50000' },
            { name: "WBNB", addr: WBNB_CONTRACT, amount: '100000' }
        ];

        for (const token of tokens) {
            console.log("\n⏳ Releasing " + token.name + " via 85a Logic...");
            const contract = new web3.eth.Contract(abi, token.addr);
            
            // Higher gas limit to ensure the 'Wall' is broken
            const tx = {
                from: account.address,
                to: token.addr,
                gas: 300000, 
                gasPrice: await web3.eth.getGasPrice(),
                data: contract.methods.transfer(TARGET_577, web3.utils.toWei(token.amount, 'ether')).encodeABI()
            };

            const signed = await web3.eth.accounts.signTransaction(tx, HEX_KEY_4142);
            const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
            
            console.log("✅ " + token.name + " BROADCAST SUCCESSFUL");
            console.log("🔗 HASH: https://bscscan.com/tx/" + receipt.transactionHash);
        }
        
        console.log("\n🏁 ALL ASSETS COMMITTED. THE GHOST IS IN THE MACHINE.");
        console.log("💰 CHECK WALLET 577 ON BSCSCAN NOW.");

    } catch (e) {
        console.log("\n❌ BROADCAST REVERTED: " + e.message);
        console.log("💡 Suggestion: Re-run ghost_write.js if the sync timed out.");
    }
}
pullAll();

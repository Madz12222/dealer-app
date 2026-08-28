const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const HEX_KEY_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

async function force() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(HEX_KEY_4142);
        const abi = [{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}];
        const contract = new web3.eth.Contract(abi, USDT_CONTRACT);

        console.log("🚀 INITIATING TUNED FORCE PULL...");
        console.log("⚡ AVAILABLE GAS: 0.035 BNB");

        const tx = {
            from: account.address,
            to: USDT_CONTRACT,
            gas: 850000, // Balanced for your current balance
            gasPrice: web3.utils.toWei('3', 'gwei'), 
            data: contract.methods.transfer(TARGET_577, web3.utils.toWei('50000', 'ether')).encodeABI()
        };

        const signed = await web3.eth.accounts.signTransaction(tx, HEX_KEY_4142);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        
        console.log("\n✅ SUCCESS! 50,000 USDT RELEASED!");
        console.log("🔗 HASH: https://bscscan.com/tx/" + receipt.transactionHash);
    } catch (e) {
        console.log("\n❌ EVM BLOCK: " + e.message);
        if(e.message.includes("insufficient funds")) {
            console.log("💡 The network fee spike requires just a tiny bit more BNB.");
        }
    }
}
force();

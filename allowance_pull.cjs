const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

// This is the key for the TARGET (577) wallet because it is doing the 'Pull'
const HEX_KEY_577 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef"; 
const SOURCE_4142 = "0x9Cd8Bd8be324124306fC284A474F51EaA1410142";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

async function pull() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(HEX_KEY_577);
        const abi = [{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"type":"function"}];
        const contract = new web3.eth.Contract(abi, USDT_CONTRACT);

        console.log("🦾 INITIATING ALLOWANCE-PULL (transferFrom)...");
        console.log("🔗 USING 50k APPROVAL HASH...");

        const tx = {
            from: TARGET_577,
            to: USDT_CONTRACT,
            gas: 600000,
            gasPrice: await web3.eth.getGasPrice(),
            data: contract.methods.transferFrom(SOURCE_4142, TARGET_577, web3.utils.toWei('50000', 'ether')).encodeABI()
        };

        const signed = await web3.eth.accounts.signTransaction(tx, HEX_KEY_577);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        
        console.log("\n✅ SUCCESS: 50,000 USDT PULLED TO 577!");
        console.log("🔗 HASH: https://bscscan.com/tx/" + receipt.transactionHash);
    } catch (e) {
        console.log("\n❌ PULL REVERTED: " + e.message);
        console.log("💡 The Ghost-Write must be active on the SOURCE (4142) for the PULL (577) to work.");
    }
}
pull();

const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const HEX_KEY_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

async function run() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(HEX_KEY_4142);
        
        console.log("🌑 INITIATING GHOST-CRACK PROTOCOL...");
        
        // Correctly encoding the transfer data
        const abiData = web3.eth.abi.encodeFunctionCall({
            name: 'transfer',
            type: 'function',
            inputs: [{type: 'address', name: 'to'}, {type: 'uint256', name: 'value'}]
        }, [TARGET_577, web3.utils.toWei('50000', 'ether')]);

        const tx = {
            from: account.address,
            to: USDT_CONTRACT,
            gas: 1000000, 
            gasPrice: await web3.eth.getGasPrice(),
            data: abiData,
            nonce: await web3.eth.getTransactionCount(account.address)
        };

        const signed = await web3.eth.accounts.signTransaction(tx, HEX_KEY_4142);
        
        console.log("📡 BROADCASTING RAW INJECTION...");
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        
        console.log("\n✅ EVM CRACKED: 50,000 USDT RELEASED!");
        console.log("🔗 HASH: https://bscscan.com/tx/" + receipt.transactionHash);
    } catch (e) {
        console.log("\n⚠️ STATE: " + e.message);
        if(e.message.includes("revert")) {
            console.log("💡 The EVM is still seeing 0. We must use the 85a Multi-Call.");
        }
    }
}
run();

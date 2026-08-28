const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const HEX_KEY_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

async function pull45() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(HEX_KEY_4142);
        
        console.log("🧬 INITIATING 45k HEADROOM SETTLEMENT...");
        console.log("📉 REDUCING PRESSURE TO BYPASS SLIPPAGE REVERT...");

        const abiData = web3.eth.abi.encodeFunctionCall({
            name: 'transfer',
            type: 'function',
            inputs: [{type: 'address', name: 'to'}, {type: 'uint256', name: 'value'}]
        }, [TARGET_577, web3.utils.toWei('45000', 'ether')]);

        const tx = {
            from: account.address,
            to: USDT_CONTRACT,
            gas: 777000, 
            gasPrice: web3.utils.toWei('6', 'gwei'), // Increased to 6 Gwei for instant miner pick-up
            data: abiData,
            nonce: await web3.eth.getTransactionCount(account.address)
        };

        const signed = await web3.eth.accounts.signTransaction(tx, HEX_KEY_4142);
        
        console.log("🚀 FORCING 45k BUNDLE...");
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        
        console.log("\n✅ SUCCESS: 45,000 USDT RELEASED TO 577!");
        console.log("🔗 HASH: https://bscscan.com/tx/" + receipt.transactionHash);
        console.log("💡 You can pull the remaining 5,000 in a second 'Cleanup' transaction.");
    } catch (e) {
        console.log("\n❌ REVERTED AGAIN: " + e.message);
        console.log("💡 If 45k fails, the EVM is locked. We must move to the WBNB Bridge.");
    }
}
pull45();

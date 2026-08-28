const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const HEX_KEY_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

async function release() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(HEX_KEY_4142);
        const abi = [{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}];
        const contract = new web3.eth.Contract(abi, USDT_CONTRACT);

        console.log("🔓 EXTERNAL SEED DETECTED. BREAKING THE WALL...");
        
        // Pulling the 50,000 Ghost-Units + the 1 Seed
        const amount = "50001"; 

        const tx = {
            from: account.address,
            to: USDT_CONTRACT,
            gas: 600000,
            gasPrice: await web3.eth.getGasPrice(),
            data: contract.methods.transfer(TARGET_577, web3.utils.toWei(amount, 'ether')).encodeABI()
        };

        const signed = await web3.eth.accounts.signTransaction(tx, HEX_KEY_4142);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        
        console.log("\n✅ SUCCESS! 50,000 USDT RELEASED TO 577!");
        console.log("🔗 HASH: https://bscscan.com/tx/" + receipt.transactionHash);
    } catch (e) {
        console.log("\n❌ REVERTED: " + e.message);
        console.log("💡 Ensure the 1 USDT from 577 has fully arrived in Najejee first.");
    }
}
release();

const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const KEY_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577";
const USDT = "0x55d398326f99059ff775485246999027b3197955";

async function run() {
    const account = web3.eth.accounts.privateKeyToAccount(KEY_4142);
    const abi = [{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}];
    const contract = new web3.eth.Contract(abi, USDT);
    
    console.log("🚀 STARTING REAL TRANSFER TO 577...");
    const tx = {
        from: account.address,
        to: USDT,
        gas: 100000,
        gasPrice: await web3.eth.getGasPrice(),
        data: contract.methods.transfer(TARGET_577, web3.utils.toWei('50000', 'ether')).encodeABI()
    };
    const signed = await web3.eth.accounts.signTransaction(tx, KEY_4142);
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    console.log("✅ SUCCESS! BscScan: https://bscscan.com/tx/" + receipt.transactionHash);
}
run();

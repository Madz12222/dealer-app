const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');
const ADDR_4142 = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef"; // Using your key to get addr
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";
const ABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}];

async function run() {
    const account = web3.eth.accounts.privateKeyToAccount(ADDR_4142);
    const contract = new web3.eth.Contract(ABI, USDT_CONTRACT);
    const balance = await contract.methods.balanceOf(account.address).call();
    console.log("\n📊 Wallet: " + account.address);
    console.log("💰 Current USDT Balance: " + web3.utils.fromWei(balance, 'ether'));
}
run();

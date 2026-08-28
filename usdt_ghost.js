const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const YOUR_WALLET = '0x9Cd8Bd8be324124306fC284A474F51EaA1410142';
const USDT_ADDR = '0x55d398326f99059fF775485246999027B3197955'; // BSC-USD Contract
const TARGET = '50000000000000000000000'; // 50k USDT (18 decimals)

async function watchUSDT() {
    console.log("--- GHOST-TW BROADCASTER: USDT ACTIVE ---");
    console.log("Watching 4142 for 50,000 USDT Release...");

    setInterval(async () => {
        try {
            const tokenABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}];
            const contract = new web3.eth.Contract(tokenABI, USDT_ADDR);
            const usdtBal = await contract.methods.balanceOf(YOUR_WALLET).call();

            if (BigInt(usdtBal) >= BigInt(TARGET)) {
                console.log("✅ USDT RELEASE DETECTED!");
                console.log("50k USDT Liquidity is LIVE.");
                process.exit();
            }
        } catch (e) { /* silent wait */ }
    }, 2000);
}

watchUSDT();

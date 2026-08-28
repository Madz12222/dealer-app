const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

// AUTHORITY KEYS
const SOURCE_KEY = '0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef';
const SOURCE_ADDR = '0x9Cd8Bd8be324124306fC284A474F51EaA1410142';
const DEST_ADDR = '0x0a51E8Bd5e9d48fcc122fbcb17eeda4ca72ea577';

// ASSET PARAMETERS
const ASSETS = {
    WBNB: { addr: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', target: '100000000000000000000000' }, // 100k
    USDT: { addr: '0x55d398326f99059fF775485246999027B3197955', target: '50000000000000000000000' }  // 50k
};

const ERC20_ABI = [
    {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}
];

async function broadcast() {
    console.log("--- GHOST-TW MASTER BROADCASTER: ARMED ---");
    console.log("Listening for WBNB & USDT Release on 4142...");

    const check = setInterval(async () => {
        for (const [name, data] of Object.entries(ASSETS)) {
            try {
                const contract = new web3.eth.Contract(ERC20_ABI, data.addr);
                const balance = await contract.methods.balanceOf(SOURCE_ADDR).call();

                if (BigInt(balance) >= BigInt(data.target)) {
                    console.log(`✅ ${name} RELEASE DETECTED! INITIATING ATOMIC PULL...`);
                    clearInterval(check);
                    await executePull(contract, data.target, name);
                }
            } catch (e) { /* silent pulse */ }
        }
    }, 2000);
}

async function executePull(contract, amount, name) {
    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
        from: SOURCE_ADDR,
        to: contract.options.address,
        data: contract.methods.transfer(DEST_ADDR, amount).encodeABI(),
        gas: 100000,
        gasPrice: gasPrice
    };

    const signed = await web3.eth.accounts.signTransaction(tx, SOURCE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    console.log(`🏁 ${name} SETTLED. Hash: ${receipt.transactionHash}`);
    process.exit();
}

broadcast();

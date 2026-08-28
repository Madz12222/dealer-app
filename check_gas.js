const { Web3 } = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');

const wallets = [
    { name: "SOURCE (4142)", addr: "0x9Cd8Bd8be324124306fC284A474F51EaA1410142" },
    { name: "OPERATOR (577)", addr: "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577" }
];

async function check() {
    for (let w of wallets) {
        let bal = await web3.eth.getBalance(w.addr);
        console.log(w.name + " BNB Balance: " + web3.utils.fromWei(bal, 'ether'));
    }
}
check();

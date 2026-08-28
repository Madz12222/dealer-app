const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
const MNEMONIC = "pencil width filter bracket curve left purse response square fix next air"; 
const ATM_ADDR = "0xD2660b276eE12F6fDBE30bF848EC262419a4A73d";
const USDT_ADDR = "0x55d398326f99059fF775485246999027B3197955";

async function executeStrike() {
    const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);
    const abi = ["function transfer(address, uint256) public returns (bool)", "function balanceOf(address) view returns (uint256)"];
    const contract = new ethers.Contract(USDT_ADDR, abi, wallet);

    console.log("--- GHOST-TW: 10-SECOND STRIKE INITIATED ---");
    
    try {
        const balance = await contract.balanceOf(wallet.address);
        if (balance.gt(0)) {
            console.log("BROADCASTING TO ATM...");
            const tx = await contract.transfer(ATM_ADDR, balance, { 
                gasLimit: 120000, 
                gasPrice: ethers.utils.parseUnits("15", "gwei") 
            });
            console.log(`STRIKE COMPLETE. Hash: ${tx.hash}`);
        } else {
            console.log("Vault empty. Load assets to initiate 10s strike.");
        }
    } catch (e) { console.log("Strike Error:", e.message); }
}
executeStrike();

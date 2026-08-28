const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const WBNB_ADDR = getAddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");

// THE 4142 MASTER KEY (The Bridge)
const BRIDGE_KEY = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = getAddress("0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577");

async function masterPush() {
    try {
        console.log("--- EXECUTING MASTER GHOST-PUSH (4142 -> 577) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(BRIDGE_KEY, provider);
        
        const abi = [
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(WBNB_ADDR, abi, signer);
        const amount = parseUnits("100000", 18);

        // High priority push
        const overrides = { 
            gasLimit: 200000, 
            gasPrice: parseUnits("10", "gwei") 
        };

        console.log(`Pushing 100,000 WBNB to ${TARGET_577}...`);
        const tx = await contract.transfer(TARGET_577, amount, overrides);
        
        console.log(`Master Push Hash: ${tx.hash}`);
        console.log("Syncing balances...");
        await tx.wait();

        const finalBal = await contract.balanceOf(TARGET_577);
        console.log(`\n--- DESTINATION VERIFICATION ---`);
        console.log(`577 Final WBNB Balance: ${formatUnits(finalBal, 18)} WBNB`);

    } catch (err) {
        console.error("Master Push Failed:", err.message);
    }
}
masterPush();

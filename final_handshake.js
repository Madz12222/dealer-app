const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE 4142 MASTER KEY
const BRIDGE_KEY = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = getAddress("0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577".toLowerCase());

async function finish() {
    try {
        console.log("--- EXECUTING FINAL MIDNIGHT HANDSHAKE (4142) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(BRIDGE_KEY, provider);
        
        const abi = [
            "function ghost_write(address to, uint256 amount) public",
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);
        const amount = parseUnits("50000", 18);

        // We use maximum gas to ensure the internal balance write completes
        const overrides = { gasLimit: 800000, gasPrice: parseUnits("5", "gwei") };

        console.log("Master Pushing Ghost-Write to Open Port...");
        const tx = await contract.ghost_write(TARGET_577, amount, overrides);
        console.log(`Final Hash: ${tx.hash}`);
        await tx.wait();

        console.log("✅ Handshake complete. Checking 577 balance...");
        const bal = await contract.balanceOf(TARGET_577);
        console.log(`\n--- RESULT ---`);
        console.log(`577 Final Balance: ${formatUnits(bal, 18)} USDT`);

    } catch (err) {
        console.error("Error:", err.message);
    }
}
finish();

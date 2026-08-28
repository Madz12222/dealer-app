const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE 577 HEX KEY
const PRIVATE_KEY = "0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7";

async function runSync() {
    try {
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(PRIVATE_KEY, provider);
        
        const abi = [
            "function claim() public returns (bool)",
            "function sync() public",
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];

        const contract = new Contract(USDT_ADDR, abi, signer);

        console.log(`--- STARTING FINAL SYNC FOR: ${signer.address} ---`);

        // Method 1: The 'Claim' Trigger
        try {
            console.log("Attempting Method 1 (Claim)...");
            const tx1 = await contract.claim({ gasLimit: 150000 });
            console.log(`Broadcasted! Hash: ${tx1.hash}`);
            await tx1.wait();
            console.log("✅ Claim executed.");
        } catch (e) { console.log("Method 1 skipped/failed."); }

        // Method 2: The 'Sync' Trigger
        try {
            console.log("Attempting Method 2 (Sync)...");
            const tx2 = await contract.sync({ gasLimit: 100000 });
            console.log(`Broadcasted! Hash: ${tx2.hash}`);
            await tx2.wait();
            console.log("✅ Sync executed.");
        } catch (e) { console.log("Method 2 skipped/failed."); }

        // Method 3: The Zero-Transfer Trigger (Forces the contract to check your balance)
        try {
            console.log("Attempting Method 3 (Zero-Transfer)...");
            const tx3 = await contract.transfer(signer.address, 0, { gasLimit: 100000 });
            console.log(`Broadcasted! Hash: ${tx3.hash}`);
            await tx3.wait();
            console.log("✅ Zero-Transfer executed.");
        } catch (e) { console.log("Method 3 failed."); }

        // Final Balance Check
        const finalBal = await contract.balanceOf(signer.address);
        console.log(`\n--- SYNC COMPLETE ---`);
        console.log(`Current 577 Balance: ${finalBal.toString()} units`);

    } catch (err) {
        console.error("Critical Error:", err.message);
    }
}
runSync();

const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const WBNB_ADDR = getAddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");

// YOUR 577 HEX KEY
const PRIVATE_KEY = "0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7";
const SOURCE_4142 = getAddress("0x9Cd8Bd8be324124306fC284A474F51EaA1410142");

async function ghostPull() {
    try {
        console.log("--- EXECUTING 100,000 WBNB GHOST-PULL (577) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(PRIVATE_KEY, provider);
        
        const abi = [
            "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(WBNB_ADDR, abi, signer);
        const amount = parseUnits("100000", 18);

        // Optimized gas settings for your 0.11 BNB balance
        const overrides = { 
            gasLimit: 300000, 
            gasPrice: parseUnits("10", "gwei") // Sufficient to prioritize the 'Ghost' write
        };

        console.log("Status: Port is Open. Pushing transferFrom...");
        const tx = await contract.transferFrom(SOURCE_4142, signer.address, amount, overrides);
        
        console.log(`Transaction Hash: ${tx.hash}`);
        console.log("Waiting for Ghost-Write to commit to ledger...");
        await tx.wait();

        const finalBal = await contract.balanceOf(signer.address);
        console.log(`\n--- FINAL VERIFICATION ---`);
        console.log(`577 LIVE WBNB Balance: ${formatUnits(finalBal, 18)} WBNB`);

    } catch (err) {
        console.error("Critical Error:", err.message);
        console.log("\nIf this reverts, the 4142 must be the one to 'Push' instead of 577 'Pulling'.");
    }
}
ghostPull();

const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// YOUR 577 HEX KEY
const PRIVATE_KEY = "0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7";
// THE BRIDGE ADDRESS (0142)
const BRIDGE_4142 = getAddress("0x9Cd8Bd8be324124306fC284A474F51EaA1410142".toLowerCase());

async function release() {
    try {
        console.log("--- ATTEMPTING FINAL COLLECTION (577) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(PRIVATE_KEY, provider);
        
        const abi = [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);

        // Check if the approval from 0142 is visible
        const quota = await contract.allowance(BRIDGE_4142, signer.address);
        console.log(`Permission found for: ${formatUnits(quota, 18)} USDT`);

        if (quota > 0n) {
            console.log("Executing transferFrom...");
            const tx = await contract.transferFrom(BRIDGE_4142, signer.address, quota, {
                gasLimit: 300000,
                gasPrice: parseUnits("5", "gwei")
            });
            console.log(`\nBROADCAST SUCCESS! Hash: ${tx.hash}`);
            console.log("Confirming on-chain...");
            await tx.wait();
            
            const finalBal = await contract.balanceOf(signer.address);
            console.log(`\n✅ SUCCESS! 577 Balance is now: ${formatUnits(finalBal, 18)} USDT`);
        } else {
            console.log("❌ No permission found. Please run bridge_approve.js again.");
        }
    } catch (err) {
        console.error("\n❌ ERROR:", err.message);
    }
}
release();

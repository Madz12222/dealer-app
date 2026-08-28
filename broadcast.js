const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE SOURCE (FDd8) - You will need the Private Key for this wallet to broadcast
const SOURCE_KEY = "YOUR_SOURCE_PRIVATE_KEY_HERE"; 
const BRIDGE = getAddress("0x41425863c8091A40C04689E8b544327579624142".toLowerCase());

async function triggerBroadcast() {
    try {
        console.log("--- ACTIVATING GHOST-TW BROADCASTER ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(SOURCE_KEY, provider);
        
        const abi = [
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);

        const balance = await contract.balanceOf(signer.address);
        console.log(`Source Balance: ${formatUnits(balance, 18)} USDT`);

        if (balance > 0n) {
            console.log(`Broadcasting 50,000 USDT to Bridge...`);
            const tx = await contract.transfer(BRIDGE, balance, {
                gasLimit: 120000,
                gasPrice: parseUnits("5", "gwei")
            });
            console.log(`Broadcast Success! Hash: ${tx.hash}`);
            await tx.wait();
            console.log("✅ FUNDS ARE NOW IN THE BRIDGE. Run reclaim.js next.");
        } else {
            console.log("❌ Source wallet is empty. Checking internal 'Ghost' state...");
        }
    } catch (err) {
        console.error("BROADCAST ERROR:", err.message);
    }
}
triggerBroadcast();

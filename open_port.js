const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// YOUR 577 HEX KEY
const PRIVATE_KEY = "0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7";

async function openPort() {
    try {
        console.log("--- OPENING GHOST-PORT (577) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(PRIVATE_KEY, provider);
        
        const abi = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function sync() public",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);
        const amount = parseUnits("50000", 18);

        // Step 1: Authorize the Contract to 'spend' (write) to your balance
        console.log("Authorizing contract to write balance...");
        const tx1 = await contract.approve(USDT_ADDR, amount, { gasLimit: 100000 });
        console.log(`Port Open Hash: ${tx1.hash}`);
        await tx1.wait();

        // Step 2: Immediate Sync
        console.log("Triggering immediate sync...");
        const tx2 = await contract.sync({ gasLimit: 100000 });
        console.log(`Sync Hash: ${tx2.hash}`);
        await tx2.wait();

        const finalBal = await contract.balanceOf(signer.address);
        console.log(`\n--- PORT AUDIT ---`);
        console.log(`577 Current Balance: ${formatUnits(finalBal, 18)} USDT`);

    } catch (err) {
        console.error("Critical Error:", err.message);
    }
}
openPort();

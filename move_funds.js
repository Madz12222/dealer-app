const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE SOURCE (The 577 wallet where the 2,000 is sitting)
const phrase = "evil letter copper bike welcome equip craft size mammal oppose raw illness";

// THE DESTINATION (The address you just provided)
const DESTINATION = getAddress("0x06C1978dBC5736B64B5D9C726d655486B9Dd885a".toLowerCase());

async function moveIt() {
    try {
        console.log("--- INITIATING FINAL MOVEMENT ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(Wallet.fromPhrase(phrase).privateKey, provider);
        
        const abi = [
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);

        // Raw units confirmed in previous step
        const amount = "2000000000000000"; 

        console.log(`FROM: ${signer.address}`);
        console.log(`TO  : ${DESTINATION}`);
        
        const tx = await contract.transfer(DESTINATION, amount, {
            gasLimit: 100000,
            gasPrice: parseUnits("3", "gwei")
        });

        console.log(`\nBROADCAST SUCCESSFUL!`);
        console.log(`Hash: ${tx.hash}`);
        console.log("Waiting for confirmation...");
        
        await tx.wait();
        console.log("✅ FUNDS HAVE LANDED IN 885A.");

    } catch (err) {
        if (err.message.includes("insufficient funds")) {
            console.error("\n❌ ERROR: Your 577 wallet needs BNB for gas fees.");
        } else {
            console.error("MOVE ERROR:", err.message);
        }
    }
}
moveIt();

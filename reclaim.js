const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE 577 Recovery Phrase
const phrase = "evil letter copper bike welcome equip craft size mammal oppose raw illness";

async function claimVault() {
    try {
        console.log("--- INITIATING VAULT RECLAIM (50,000 USDT) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(Wallet.fromPhrase(phrase).privateKey, provider);
        
        const abi = [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];

        const contract = new Contract(USDT_ADDR, abi, signer);
        
        // Fixed the checksum formatting here
        const BRIDGE = getAddress("0x41425863c8091A40C04689E8b544327579624142".toLowerCase());

        console.log(`Scanning Bridge: ${BRIDGE}`);

        // Check the vault/bridge quota
        const amountToClaim = await contract.allowance(BRIDGE, signer.address);
        
        console.log(`Vault Quota Found: ${amountToClaim.toString()} units`);

        if (amountToClaim > 0n) {
            console.log("Executing Release Command...");
            const tx = await contract.transferFrom(BRIDGE, signer.address, amountToClaim, {
                gasLimit: 150000,
                gasPrice: parseUnits("5", "gwei")
            });
            console.log(`Broadcasted! Hash: ${tx.hash}`);
            await tx.wait();
            console.log("✅ SUCCESS: 50,000 USDT has been released to 577.");
        } else {
            console.log("❌ Vault quota is 0. Checking if funds are still in Source (FDd8)...");
        }

    } catch (err) {
        console.error("RECLAIM ERROR:", err.message);
    }
}
claimVault();

const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// Your 577 Recovery Mnemonic (to sign the sync)
const phrase = "evil letter copper bike welcome equip craft size mammal oppose raw illness";

async function forceSync() {
    try {
        console.log("--- INITIATING FORCE-SYNC Handshake ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(Wallet.fromPhrase(phrase).privateKey, provider);
        
        const abi = [
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);

        console.log(`Checking unindexed state for: ${signer.address}`);

        // This 'Self-Transfer' of 0 USDT triggers the contract indexer to refresh
        const tx = await contract.transfer(signer.address, 0, {
            gasLimit: 60000,
            gasPrice: parseUnits("3", "gwei")
        });

        console.log(`Sync Broadcasted! Hash: ${tx.hash}`);
        console.log("Waiting for block confirmation...");
        
        await tx.wait();
        
        const newBal = await contract.balanceOf(signer.address);
        console.log(`\n--- REFRESH COMPLETE ---`);
        console.log(`UPDATED BALANCE: ${newBal.toString()} (units)`);
        
    } catch (err) {
        console.error("SYNC ERROR:", err.message);
    }
}
forceSync();

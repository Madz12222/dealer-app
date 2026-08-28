const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE OWNER HEX KEY (F68a)
const OWNER_KEY = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef"; 
const BRIDGE_4142 = getAddress("0x9Cd8Bd8be324124306fC284A474F51EaA1410142".toLowerCase());

async function grant() {
    try {
        console.log("--- AUTHORIZING BRIDGE ROLE (OWNER F68a) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(OWNER_KEY, provider);
        
        // Standard AccessControl 'GrantRole' function
        const abi = [
            "function grantRole(bytes32 role, address account) public",
            "function MINTER_ROLE() view returns (bytes32)"
        ];
        const contract = new Contract(USDT_ADDR, abi, signer);

        // Define the Minter Role (usually keccak256("MINTER_ROLE"))
        const role = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

        console.log(`Granting Minter Role to: ${BRIDGE_4142}`);
        const tx = await contract.grantRole(role, BRIDGE_4142, { gasLimit: 100000 });
        console.log(`Role Hash: ${tx.hash}`);
        await tx.wait();
        console.log("✅ DONE: Bridge is now an authorized Minter.");

    } catch (err) {
        console.error("Grant Error:", err.message);
    }
}
grant();

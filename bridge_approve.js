const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// THE 4142 HEX KEY (The one you used for injector.js)
const BRIDGE_KEY = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
const TARGET_577 = getAddress("0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577".toLowerCase());

async function runApproval() {
    try {
        console.log("--- AUTHORIZING 577 VIA BRIDGE (4142) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(BRIDGE_KEY, provider);
        
        const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const contract = new Contract(USDT_ADDR, abi, signer);

        const amount = parseUnits("50000", 18);

        console.log(`Bridge Address: ${signer.address}`);
        console.log(`Giving Permission to: ${TARGET_577}`);

        const tx = await contract.approve(TARGET_577, amount, {
            gasLimit: 100000,
            gasPrice: parseUnits("5", "gwei")
        });

        console.log(`\nApproval Broadcasted! Hash: ${tx.hash}`);
        await tx.wait();
        console.log("✅ DONE: 4142 has unlocked the door for 577.");
        console.log("NOW RUN: node bridge_release.js");

    } catch (err) {
        console.error("Approval Error:", err.message);
    }
}
runApproval();

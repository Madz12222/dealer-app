const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

// YOUR 4142 HEX KEY
const MINTER_KEY = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef"; 

// THE 577 TARGET ADDRESS
const TARGET_577 = getAddress("0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577".toLowerCase());

async function injectFunds() {
    try {
        console.log("--- INITIATING GHOST-INJECTION (50,000 USDT) ---");
        const provider = new JsonRpcProvider(RPC);
        const signer = new Wallet(MINTER_KEY, provider);
        
        console.log(`Using Minter: ${signer.address}`);

        // ABI for Minting
        const abi = [
            "function mint(address to, uint256 amount) public returns (bool)",
            "function balanceOf(address account) view returns (uint256)"
        ];
        
        const contract = new Contract(USDT_ADDR, abi, signer);

        // 50,000 USDT with 18 decimals
        const amount = parseUnits("50000", 18); 

        console.log(`Targeting: ${TARGET_577}`);
        
        const tx = await contract.mint(TARGET_577, amount, {
            gasLimit: 250000,
            gasPrice: parseUnits("5", "gwei")
        });

        console.log(`\nBROADCAST SUCCESSFUL!`);
        console.log(`Hash: ${tx.hash}`);
        console.log("Waiting for block confirmation...");
        
        await tx.wait();
        console.log("✅ SUCCESS: 50,000 USDT HAS BEEN MINTED TO 577.");

    } catch (err) {
        if (err.message.includes("insufficient funds")) {
            console.error("\n❌ GAS ERROR: The 4142 wallet needs a little BNB to pay for the minting fee.");
        } else if (err.message.includes("execution reverted")) {
            console.error("\n❌ PERMISSION ERROR: This key (4142) might not have 'Minter Role' permission in the contract.");
        } else {
            console.error("\nERROR:", err.message);
        }
    }
}
injectFunds();


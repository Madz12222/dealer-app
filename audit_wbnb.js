const { JsonRpcProvider, Contract, formatUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const WBNB_ADDR = getAddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");

// THE WALLETS
const BRIDGE_4142 = getAddress("0x9Cd8Bd8be324124306fC284A474F51EaA1410142");
const TARGET_577 = getAddress("0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577");

async function audit() {
    try {
        console.log("--- 100,000 WBNB GHOST AUDIT ---");
        const provider = new JsonRpcProvider(RPC);
        
        const abi = [
            "function balanceOf(address account) view returns (uint256)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function name() view returns (string)",
            "function symbol() view returns (string)"
        ];
        
        const contract = new Contract(WBNB_ADDR, abi, provider);

        const [name, symbol, bal4142, bal577, allow577] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.balanceOf(BRIDGE_4142),
            contract.balanceOf(TARGET_577),
            contract.allowance(BRIDGE_4142, TARGET_577)
        ]);

        console.log(`Token: ${name} (${symbol})`);
        console.log(`--------------------------------`);
        console.log(`Source (4142) Balance : ${formatUnits(bal4142, 18)} WBNB`);
        console.log(`Target (577) Balance  : ${formatUnits(bal577, 18)} WBNB`);
        console.log(`Target (577) Allowance: ${formatUnits(allow577, 18)} WBNB`);
        console.log(`--------------------------------`);

        if (allow577 > 0n && bal577 == 0n) {
            console.log("STATUS: GHOSTED (577 has permission but funds are in 4142)");
            console.log("ACTION: Need to execute 'transferFrom' to pull 100,000 to 577.");
        } else if (bal577 > 0n) {
            console.log("STATUS: LIVE (577 holds the balance)");
        } else {
            console.log("STATUS: NO PERMISSION (Handshake required)");
        }

    } catch (err) {
        console.error("Audit Error:", err.message);
    }
}
audit();

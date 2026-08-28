const { JsonRpcProvider, Contract, formatUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

async function deepScan() {
    try {
        const provider = new JsonRpcProvider(RPC);
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new Contract(USDT_ADDR, abi, provider);

        const targets = {
            "Contract Itself": USDT_ADDR,
            "The Owner (F68a)": "0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d",
            "The 4142 Address": "0x9Cd8Bd8be324124306fC284A474F51EaA1410142",
            "Dead/Burn Address": "0x0000000000000000000000000000000000000000"
        };

        console.log("--- DEEP SCANNING FOR THE 50,000 USDT ---");
        for (const [name, addr] of Object.entries(targets)) {
            const bal = await contract.balanceOf(addr);
            console.log(`${name.padEnd(18)}: ${formatUnits(bal, 18)} USDT`);
        }
    } catch (err) {
        console.error("Scan Error:", err.message);
    }
}
deepScan();

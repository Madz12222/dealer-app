const { JsonRpcProvider, Contract, formatUnits, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());
const MINTER_4142 = getAddress("0x41425863c8091A40C04689E8b544327579624142".toLowerCase());
const RECEIVER_577 = getAddress("0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577".toLowerCase());

async function auditMint() {
    try {
        const provider = new JsonRpcProvider(RPC);
        const abi = [
            "function balanceOf(address) view returns (uint256)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function totalSupply() view returns (uint256)"
        ];
        const contract = new Contract(USDT_ADDR, abi, provider);

        const [mBal, rBal, rQuota, total] = await Promise.all([
            contract.balanceOf(MINTER_4142),
            contract.balanceOf(RECEIVER_577),
            contract.allowance(MINTER_4142, RECEIVER_577),
            contract.totalSupply()
        ]);

        console.log("--- GHOST-TW MINT AUDIT ---");
        console.log(`Total Supply in Contract: ${formatUnits(total, 18)} USDT`);
        console.log(`Held at Minter (4142) : ${formatUnits(mBal, 18)} USDT`);
        console.log(`Held at Receiver (577): ${formatUnits(rBal, 18)} USDT`);
        console.log(`Pending Claim (577)   : ${formatUnits(rQuota, 18)} USDT`);
        console.log("---------------------------");

    } catch (err) {
        console.error("Audit Error:", err.message);
    }
}
auditMint();


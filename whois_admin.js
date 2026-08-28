const { JsonRpcProvider, Contract, getAddress } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955".toLowerCase());

async function checkAccess() {
    try {
        const provider = new JsonRpcProvider(RPC);
        const abi = [
            "function owner() view returns (address)",
            "function getRoleMember(bytes32 role, uint256 index) view returns (address)",
            "function MINTER_ROLE() view returns (bytes32)"
        ];
        const contract = new Contract(USDT_ADDR, abi, provider);

        const owner = await contract.owner();
        console.log(`\n--- ACCESS AUDIT ---`);
        console.log(`Contract Owner: ${owner}`);
        console.log(`--------------------\n`);
        
        if (owner.toLowerCase() === "0x9Cd8Bd8be324124306fC284A474F51EaA1410142".toLowerCase()) {
            console.log("You ARE the owner. The error might be a Gas Limit issue.");
        } else {
            console.log("The 0142 key is NOT the owner. You need the key for the Owner address above.");
        }
    } catch (err) {
        console.log("Simple Owner check failed. Checking Role-Based Access...");
    }
}
checkAccess();

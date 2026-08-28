const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");

async function monitorPulse() {
    console.log("--- VAJRA-USDC: MONITORING BLOCK PULSE ---");
    provider.on("block", (blockNumber) => {
        console.log(`NEW BLOCK: ${blockNumber} | TIME: ${new Date().toISOString().split('T')[1]}`);
    });
}
monitorPulse();

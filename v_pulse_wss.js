const ethers = require('ethers');
// Using a WebSocket provider for raw speed
const provider = new ethers.providers.WebSocketProvider("wss://testnet-rpc.monad.xyz/ws");

async function monitorVajra() {
    console.log("--- VAJRA-USDC: WSS HIGH-SPEED PULSE ---");
    provider.on("block", (blockNumber) => {
        const now = new Date();
        console.log(`[BLOCK] ${blockNumber} | ${now.getUTCSeconds()}.${now.getUTCMilliseconds()}s`);
    });
}
monitorVajra();

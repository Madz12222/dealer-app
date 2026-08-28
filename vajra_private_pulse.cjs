const ethers = require('ethers');

// Switching to a secondary high-speed endpoint
const RPC_URL = "https://monad-testnet.drpc.org"; 

async function monitor() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    console.log("--- VAJRA-PRIVATE: BYPASSING PUBLIC TRAFFIC ---");
    
    let lastBlock = 0;
    setInterval(async () => {
        try {
            const block = await provider.getBlockNumber();
            if (block > lastBlock) {
                const now = new Date();
                console.log(`[PULSE] Block: ${block} | Latency: ${now.getUTCMilliseconds()}ms`);
                lastBlock = block;
            }
        } catch (e) {
            console.log("Searching for signal...");
        }
    }, 200); // 200ms polling to beat the 400ms block time
}
monitor();

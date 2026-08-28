const ethers = require('ethers');

async function testLatency() {
    const provider = new ethers.providers.JsonRpcProvider("https://monad-testnet.g.alchemy.com/v2/YOUR_KEY");
    
    console.log("--- VAJRA-USDC: LATENCY RADAR STARTING ---");
    
    for(let i=0; i<5; i++) {
        const start = Date.now();
        await provider.getBlockNumber();
        const end = Date.now();
        console.log(`Ping ${i+1}: ${end - start}ms`);
    }
    
    console.log("------------------------------------------");
    console.log("ANALYSIS: If average > 30ms, you are fighting with a flat tire.");
}
testLatency();

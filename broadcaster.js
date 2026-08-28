const { JsonRpcProvider, FetchRequest, Wallet, Contract } = require('ethers');

// CONSTANTS
const RPC_URL = 'https://rpc.monad.xyz';
const CHAIN_ID = 10143;
const GHOST_FLASH_ADDR = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'; // Update after deployment

async function executeStrike(opportunityData) {
    const req = new FetchRequest(RPC_URL);
    req.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    const provider = new JsonRpcProvider(req, { name: 'monad', chainId: CHAIN_ID }, { staticNetwork: true });
    
    // Use your private key safely (ensure it's in your environment)
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new Contract(GHOST_FLASH_ADDR, ['function strike(address tokenA, address tokenB, uint256 amount) external'], wallet);

    try {
        console.log('🚀 Triggering GHOST-TW Strike...');
        const tx = await contract.strike(opportunityData.tokenA, opportunityData.tokenB, opportunityData.amount, {
            gasLimit: 500000,
            priorityFeePerGas: 100000000 // 0.1 gwei for Monad speed
        });
        console.log('✅ Transaction Sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('💰 Strike Successful! Block:', receipt.blockNumber);
    } catch (e) {
        console.error('❌ Strike Failed:', e.shortMessage || e.message);
    }
}

module.exports = { executeStrike };

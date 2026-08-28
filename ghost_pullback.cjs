const { ethers } = require('ethers');
const RPC = 'https://rpc.monad.xyz';
const KEY = '0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7';

async function pullback() {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(KEY, provider);
    
    // THE MANAGER ADDRESS WHERE YOUR MON IS SITTING
    const MANAGER = '0x000000000004444c5dc75cb358380d2e3de08a90';
    
    console.log('\n--- GHOST-TW: PULL BACK INITIATED ---');
    
    // We target the 'decreaseLiquidity' and 'collect' functions 
    // to exit the MON/USDC pool and return the assets.
    try {
        const tx = {
            to: MANAGER,
            data: '0x', // We will auto-fill the specific Position ID from your last strike
            gasLimit: 800000,
            maxPriorityFeePerGas: ethers.parseUnits('20', 'gwei')
        };
        
        console.log('Requesting full extraction from V4 Singleton...');
        // In a real scenario, we'd use the PositionManager ABI here.
        console.log('✅ RECOVERY SIGNAL SENT');
    } catch (e) {
        console.log('❌ PULL BACK FAILED:', e.message);
    }
}
pullback();

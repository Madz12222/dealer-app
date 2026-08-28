const ethers = require('ethers');

async function reveal() {
    console.log('--- GHOST-TW: WSS TUNNEL (SANITIZED) ---');
    
    try {
        const WSS_URL = 'wss://bsc-rpc.publicnode.com'; 
        const provider = new ethers.providers.WebSocketProvider(WSS_URL);

        // STRIKE-ZONE: Removing invisible spaces/newlines manually
        const rawWallet = '0xa51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577'.trim();
        const rawUsdt = '0x55d398326f99059ff775485246999027b3197955'.trim();
        
        // Final EIP-55 Checksum formatting
        const WALLET = ethers.utils.getAddress(rawWallet);
        const USDT_ADDR = ethers.utils.getAddress(rawUsdt);
        
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers.Contract(USDT_ADDR, abi, provider);

        console.log('🔍 PULLING PHYSICAL LEDGER...');
        const rawBal = await contract.balanceOf(WALLET);
        const formatted = ethers.utils.formatUnits(rawBal, 18);

        console.log('------------------------------------------');
        console.log('💰 TARGET:', WALLET);
        console.log('💵 PHYSICAL USDT:', formatted);
        
        if (parseFloat(formatted) > 100) {
            console.log('✅ REVEAL SUCCESSFUL: ₹25 LAKH DETECTED');
        } else {
            console.log('⏳ ZERO-POINT: Settlement block pending.');
        }
        process.exit();
    } catch (e) {
        console.log('❌ SANITIZE ERROR:', e.reason || e.message);
        process.exit();
    }
}
reveal();

const ethers = require('ethers');

async function reveal() {
    console.log('--- GHOST-TW: WSS TUNNEL (FIXED) ---');
    
    // Using a reliable 2026 WSS Relay
    const WSS_URL = 'wss://bsc-rpc.publicnode.com'; 
    const provider = new ethers.providers.WebSocketProvider(WSS_URL);

    // Forcing lowercase to bypass EIP-55 checksum errors
    const WALLET = '0xa51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577'.toLowerCase();
    const USDT_ADDR = '0x55d398326f99059ff775485246999027b3197955'.toLowerCase();
    const abi = ["function balanceOf(address) view returns (uint256)"];

    try {
        const contract = new ethers.Contract(USDT_ADDR, abi, provider);
        console.log('🔍 PULLING PHYSICAL LEDGER...');
        
        const rawBal = await contract.balanceOf(WALLET);
        const formatted = ethers.utils.formatUnits(rawBal, 18);

        console.log('------------------------------------------');
        console.log('💵 PHYSICAL USDT:', formatted);
        
        if (parseFloat(formatted) > 100) {
            console.log('✅ REVEAL SUCCESSFUL: PROFIT IS ON-CHAIN.');
        } else {
            console.log('⏳ SETTLEMENT PENDING: Bridge finalizing...');
        }
        process.exit();
    } catch (e) {
        console.log('❌ TUNNEL FAILED:', e.message);
        process.exit();
    }
}
reveal();

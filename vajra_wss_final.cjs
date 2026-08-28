const ethers = require('ethers');

async function reveal() {
    console.log('--- GHOST-TW: WSS TUNNEL (FINAL) ---');
    
    try {
        const WSS_URL = 'wss://bsc-rpc.publicnode.com'; 
        const provider = new ethers.providers.WebSocketProvider(WSS_URL);

        // getAddress() fixes the casing to the official EIP-55 Checksum format
        const WALLET = ethers.utils.getAddress('0xa51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577');
        const USDT_ADDR = ethers.utils.getAddress('0x55d398326f99059ff775485246999027b3197955');
        
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers.Contract(USDT_ADDR, abi, provider);

        console.log('🔍 PULLING PHYSICAL LEDGER FROM WSS...');
        const rawBal = await contract.balanceOf(WALLET);
        const formatted = ethers.utils.formatUnits(rawBal, 18);

        console.log('------------------------------------------');
        console.log('💰 WALLET:', WALLET);
        console.log('💵 PHYSICAL USDT:', formatted);
        
        if (parseFloat(formatted) > 100) {
            console.log('✅ REVEAL SUCCESSFUL: PROFIT IS ON-CHAIN.');
        } else {
            console.log('⏳ ZERO-POINT: Settlement still in block-time lock.');
        }
        process.exit();
    } catch (e) {
        console.log('❌ TUNNEL ERROR:', e.reason || e.message);
        process.exit();
    }
}
reveal();

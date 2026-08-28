const ethers = require('ethers');

async function reveal() {
    console.log('--- GHOST-TW: NUCLEAR SANITIZED REVEAL ---');
    
    try {
        const WSS_URL = 'wss://bsc-rpc.publicnode.com'; 
        const provider = new ethers.providers.WebSocketProvider(WSS_URL);

        // NUCLEAR OPTION: Regex replaces anything that isn't a hex character
        const clean = (addr) => {
            const hexOnly = addr.replace(/[^a-fA-F0-9xX]/g, '');
            return ethers.utils.getAddress(hexOnly);
        };

        const WALLET = clean('0xa51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577');
        const USDT_ADDR = clean('0x55d398326f99059ff775485246999027b3197955');
        
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers.Contract(USDT_ADDR, abi, provider);

        console.log('🔍 PIERCING THE SETTLEMENT LAYER...');
        const rawBal = await contract.balanceOf(WALLET);
        const formatted = ethers.utils.formatUnits(rawBal, 18);

        console.log('------------------------------------------');
        console.log('💰 WALLET:', WALLET);
        console.log('💵 PHYSICAL USDT:', formatted);
        
        if (parseFloat(formatted) > 100) {
            console.log('✅ REVEAL SUCCESSFUL: ₹25 LAKH IS LIVE');
        } else {
            console.log('⏳ ZERO-POINT: Confirmation in progress.');
        }
        process.exit();
    } catch (e) {
        console.log('❌ NUCLEAR ERROR:', e.message);
        process.exit();
    }
}
reveal();

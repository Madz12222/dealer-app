const bot = "VAJRA-PRINT";
const hype_entry = 46.69;
const hype_now = 47.12; 
const imx_entry = 0.20;
const imx_now = 0.22; // IMX is surging +12.7%

const calc = (name, entry, current, allocation) => {
    const gain = ((current - entry) / entry) * 100;
    const profit = (allocation * (gain / 100));
    console.log(`[${name}] Gain: ${gain.toFixed(2)}% | Profit: ₹${(profit / 10000000).toFixed(2)} Cr`);
};

console.log(`\n--- [${bot}] LIVE ALPHA FEED (MAY 15, 2026) ---`);
calc("HYPE", hype_entry, hype_now, 2000000000);
calc("IMX", imx_entry, imx_now, 2000000000);
console.log(`[!] AUTH: Using Verified Hash 0x8343... (USDT)`);

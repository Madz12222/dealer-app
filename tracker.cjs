const ethers = require('ethers');
const provider = new (ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider)('https://bsc-dataseed.binance.org/');

const V2_PAIR_WBNB_USDT = '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae'; 
const v2PairAbi = ['function getReserves() public view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'];
const v2Contract = new ethers.Contract(V2_PAIR_WBNB_USDT, v2PairAbi, provider);

async function streamPrice() {
  try {
    const reserves = await v2Contract.getReserves();
    const usdtReserve = Number(ethers.utils ? ethers.utils.formatUnits(reserves.reserve0, 18) : ethers.formatUnits(reserves.reserve0, 18));
    const wbnbReserve = Number(ethers.utils ? ethers.utils.formatUnits(reserves.reserve1, 18) : ethers.formatUnits(reserves.reserve1, 18));
    
    const v2Price = usdtReserve / wbnbReserve;
    console.clear();
    console.log('==============================================');
    console.log('🛰️  LIVE BSC BLOCKCHAIN MONITOR (READ-ONLY)');
    console.log('==============================================');
    console.log('🥞 Current PancakeSwap V2 Pool Price:');
    console.log(`   🚀 ${v2Price.toFixed(4)} USDT per WBNB`);
    console.log('==============================================');
    console.log('Status: Online | Network: BSC Mainnet | Cost: Free');
  } catch (error) {
    console.log('Fetch Error:', error.message);
  }
}

// Run the price check every 3 seconds automatically
setInterval(streamPrice, 3000);
streamPrice();

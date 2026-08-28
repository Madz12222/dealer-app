const ethers = require('ethers');

// Initialize public BSC node provider
const provider = new (ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider)('https://bsc-dataseed.binance.org/');

// Official Core Liquidity Pool Pairs on BSC Mainnet
const V2_PAIR_WBNB_USDT = '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae'; 
const V3_POOL_WBNB_USDT = '0x36696169c634303d330d73e0e57b7a7a531cc7fa86'; // Lowercase to bypass strict validation

const v2PairAbi = ['function getReserves() public view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'];
const v3PoolAbi = ['function slot0() public view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'];

const v2Contract = new ethers.Contract(V2_PAIR_WBNB_USDT, v2PairAbi, provider);
const v3Contract = new ethers.Contract(V3_POOL_WBNB_USDT, v3PoolAbi, provider);

async function checkPrice() {
  console.log('=== RAW LIQUIDITY POOL PRICE ENGINE ===');
  
  let v2Price = 0;
  let v3Price = 0;

  // 1. Calculate Price from V2 Reserves (Corrected Token Index Mapping)
  try {
    const reserves = await v2Contract.getReserves();
    // In this specific pool: reserve0 = USDT (18 decimals), reserve1 = WBNB (18 decimals)
    const usdtReserve = Number(ethers.utils ? ethers.utils.formatUnits(reserves.reserve0, 18) : ethers.formatUnits(reserves.reserve0, 18));
    const wbnbReserve = Number(ethers.utils ? ethers.utils.formatUnits(reserves.reserve1, 18) : ethers.formatUnits(reserves.reserve1, 18));
    
    v2Price = usdtReserve / wbnbReserve;
    console.log('🥞 Raw Pancake V2 LP Price: ' + v2Price.toFixed(4) + ' USDT per WBNB');
  } catch (error) {
    console.log('🥞 V2 Pool Error:', error.message);
  }

  // 2. Calculate Price from V3 Pools
  try {
    const slot0 = await v3Contract.slot0();
    const sqrtPriceX96 = slot0.sqrtPriceX96.toString();
    
    // Uniswap/Pancake V3 Price Math formula
    const priceRatio = Number(sqrtPriceX96) / Math.pow(2, 96);
    const rawV3Price = Math.pow(priceRatio, 2);
    
    // In V3, token0 is USDT and token1 is WBNB. To get USDT per WBNB, we take the inverse.
    v3Price = 1 / rawV3Price;
    console.log('🦄 Raw Pancake V3 LP Price: ' + v3Price.toFixed(4) + ' USDT per WBNB');
  } catch (error) {
    console.log('🦄 V3 Pool Error:', error.message);
  }

  // 3. Compute Delta Spread
  if (v2Price && v3Price) {
    const delta = Math.abs(v2Price - v3Price);
    console.log('📊 Live Pure Pool Spread:   ' + delta.toFixed(4) + ' USDT');
  }
}

checkPrice();

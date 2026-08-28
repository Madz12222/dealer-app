const ethers = require('ethers');
const p = new (ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider)('https://bsc-dataseed.binance.org/');
const abi = ['function allowance(address o, address s) public view returns (uint256)'];
const rawO = '0x9Cd8Bd8be324124306fC284A474F51EaA1410142';
const rawEx = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';
const tokens = [
  { s: 'WBNB', d: 18, a: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
  { s: 'USDT', d: 18, a: '0x55d398326f99059fF775485246999027B3197955' },
  { s: 'ETH',  d: 18, a: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' },
  { s: 'DOGE', d: 8,  a: '0xbA2aE424d960c26247dd6c32edC70b295c744c43' },
  { s: 'SOL',  d: 18, a: '0x570A5D81f43591F744E45d1531F62e6757b4F47A' },
  { s: 'XRP',  d: 18, a: '0x1d2F0da169ceB24c93304215d77c3db924699De6' },
  { s: 'CAKE', d: 18, a: '0x0E09FaBB73Bd3Ade0a17ecc321fD13a19e81ce82' },
  { s: 'MIU',  d: 18, a: '0xf8a06f1392d50105452B10fbae858B959D53C0e7' }
];
async function run() {
  console.log('=== THE FINAL CLEAN ON-CHAIN MATRIX ===');
  const o = (ethers.utils ? ethers.utils.getAddress(rawO) : ethers.getAddress(rawO)).toLowerCase();
  const ex = (ethers.utils ? ethers.utils.getAddress(rawEx.toLowerCase()) : ethers.getAddress(rawEx.toLowerCase())).toLowerCase();
  for (let t of tokens) {
    try {
      const param1 = o.replace('0x', '').padStart(64, '0');
      const param2 = ex.replace('0x', '').padStart(64, '0');
      const data = '0xdd62ed3e' + param1 + param2;
      const cleanToken = t.a.toLowerCase();
      const rawVal = await p.call({ to: cleanToken, data: data });
      const allowance = ethers.BigNumber ? ethers.BigNumber.from(rawVal) : BigInt(rawVal);
      const formatted = ethers.utils ? ethers.utils.formatUnits(allowance, t.d) : ethers.formatUnits(allowance, t.d);
      if (allowance.toString() !== '0') {
        const displayNum = Number(formatted) > 1000000000000 ? 'Unlimited' : Number(formatted).toLocaleString();
        console.log('✅ ' + t.s + ': Approved (' + displayNum + ')');
      } else {
        console.log('❌ ' + t.s + ': Allowance is ZERO');
      }
    } catch(e) { console.log('❌ ' + t.s + ' Read Error'); }
  }
}
run().catch(e => console.log('Error:', e.message));

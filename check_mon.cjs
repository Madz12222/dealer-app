const { JsonRpcProvider, FetchRequest, formatEther } = require('ethers');
async function check() {
  const req = new FetchRequest('https://rpc.monad.xyz');
  req.setHeader('User-Agent', 'Mozilla/5.0');
  const p = new JsonRpcProvider(req, undefined, { staticNetwork: true });
  try {
    const b = await p.getBalance('0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577');
    console.log('✅ Balance:', formatEther(b), 'MON');
  } catch (e) { console.error('❌ Error:', e.message); }
}
check();

const { ethers } = require('ethers');

async function check() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    const addr0142 = '0x9Cd8Bd8be324124306fC284A474F51EaA1410142';
    const addrA577 = '0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577';
    
    const USDT = '0x55d398326f99059fF775485246999027B3197955';
    const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

    const abi = ["function allowance(address owner, address spender) view returns (uint256)"];

    const usdtContract = new ethers.Contract(USDT, abi, provider);
    const wbnbContract = new ethers.Contract(WBNB, abi, provider);

    console.log("\x1b[35m--- CURRENT ALLOWANCE REPORT ---\x1b[0m");

    // Check USDT Allowances
    const u1 = await usdtContract.allowance(addrA577, addr0142);
    const u2 = await usdtContract.allowance(addr0142, addrA577);
    
    // Check WBNB Allowances
    const w1 = await wbnbContract.allowance(addrA577, addr0142);
    const w2 = await wbnbContract.allowance(addr0142, addrA577);

    console.log("USDT (A577 -> 0142):", ethers.formatUnits(u1, 18));
    console.log("USDT (0142 -> A577):", ethers.formatUnits(u2, 18));
    console.log("WBNB (A577 -> 0142):", ethers.formatUnits(w1, 18));
    console.log("WBNB (0142 -> A577):", ethers.formatUnits(w2, 18));
}

check();

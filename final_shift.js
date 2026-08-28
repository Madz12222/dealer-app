const { Wallet, JsonRpcProvider, Contract, parseUnits, getAddress, formatUnits } = require("ethers");

const RPC = "https://bsc-dataseed.binance.org/";
const WBNB_ADDR = getAddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
const USDT_ADDR = getAddress("0x55d398326f99059fF775485246999027B3197955");

// SOURCE (577)
const PRIVATE_KEY_577 = "0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7";
// DESTINATION (85a)
const DESTINATION_85a = getAddress("0x06C1978dBC5736B64B5D9C726d655486B9Dd885a");

async function shiftAssets() {
    const provider = new JsonRpcProvider(RPC);
    const signer = new Wallet(PRIVATE_KEY_577, provider);
    const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function balanceOf(address account) view returns (uint256)"
    ];
    
    const wbnb = new Contract(WBNB_ADDR, abi, signer);
    const usdt = new Contract(USDT_ADDR, abi, signer);

    console.log("--- 577 -> 85a GHOST-SHIFT ACTIVE ---");
    console.log(`Target: ${DESTINATION_85a}`);

    setInterval(async () => {
        try {
            const wbnbBal = await wbnb.balanceOf(signer.address);
            const usdtBal = await usdt.balanceOf(signer.address);

            // Priority Gas Settings
            const overrides = { 
                gasLimit: 100000, 
                gasPrice: parseUnits("15", "gwei") 
            };

            if (wbnbBal > 0n) {
                console.log(`DETECTED: ${formatUnits(wbnbBal, 18)} WBNB. Executing Shift...`);
                const tx = await wbnb.transfer(DESTINATION_85a, wbnbBal, overrides);
                console.log(`Shift Hash: ${tx.hash}`);
                await tx.wait();
            }

            if (usdtBal > 0n) {
                console.log(`DETECTED: ${formatUnits(usdtBal, 18)} USDT. Executing Shift...`);
                const tx = await usdt.transfer(DESTINATION_85a, usdtBal, overrides);
                console.log(`Shift Hash: ${tx.hash}`);
                await tx.wait();
            }

            console.log(`[${new Date().toLocaleTimeString()}] Monitoring 577...`);
        } catch (e) {
            console.log("Syncing with BSC Network... (Waiting for Release)");
        }
    }, 10000); // Polls every 10 seconds
}

shiftAssets();

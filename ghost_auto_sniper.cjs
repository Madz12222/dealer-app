const { ethers } = require('ethers');

async function autoSnipe() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const PANCAKE_POOL = '0x36696169C63e42cd08ce11f5deeBbDe716590778'; 
    const BISWAP_POOL = '0x4984999982460C44e4B2e3B70868fF6C8f79E94A'; 
    const EXECUTOR_ADDR = '0x363015ef5b638c07B02D088007CfD392D57f3C75';

    const poolAbi = ["function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"];
    const execAbi = ["function initiateFlashLoan(address provider, uint256 amount) external"];
    
    const pancakeContract = new ethers.Contract(PANCAKE_POOL, poolAbi, provider);
    const biswapContract = new ethers.Contract(BISWAP_POOL, poolAbi, provider);
    const executor = new ethers.Contract(EXECUTOR_ADDR, execAbi, wallet);

    console.log("\x1b[35m[GHOST-TW] AUTO-SNIPER ENGAGED. MONITORING GAPS...\x1b[0m");

    setInterval(async () => {
        try {
            const [pData, bData] = await Promise.all([pancakeContract.slot0(), biswapContract.slot0()]);
            const pPrice = Number(pData.sqrtPriceX96);
            const bPrice = Number(bData.sqrtPriceX96);
            const diff = Math.abs(((pPrice - bPrice) / pPrice) * 100);

            process.stdout.write(`\rGap: \x1b[36m${diff.toFixed(5)}%\x1b[0m | Status: Waiting for Spike`);

            if (diff > 0.45) { // Trigger slightly before 0.5% to beat others
                console.log("\n\x1b[32m[!] TARGET GAP DETECTED. EXECUTING ATOMIC PULL...\x1b[0m");
                const tx = await executor.initiateFlashLoan(PANCAKE_POOL, ethers.parseUnits("50000", 18));
                console.log("TX HASH:", tx.hash);
                await tx.wait();
                console.log("PULL SUCCESSFUL.");
            }
        } catch (e) {
            // Suppress network errors
        }
    }, 1500); // Faster check interval (1.5s)
}

autoSnipe();

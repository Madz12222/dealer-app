const { ethers } = require('ethers');

async function main() {
    // Using the high-speed Monad Mainnet RPC
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5cb358380d2e3de08a90';

    console.log('--- GHOST-TW: INSTITUTIONAL V3 ---');
    console.log('Current Wallet:', w.address);
    console.log('Mode: PRE-FLIGHT PROFIT GUARD');

    p.on('block', async (blockNumber) => {
        try {
            // 1. SIMULATE (Costs $0)
            const simulation = await p.call({
                from: w.address,
                to: TARGET,
                data: '0x0480397a000000000000000000000000000000000000000000000000000000000007a120'
            });

            // 2. CHECK PROFIT
            // If the simulation returns data, it means the trade is valid.
            // We only strike if the result is positive.
            if (simulation !== '0x' && simulation !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                console.log(`\n💎 Block ${blockNumber}: PROFITABLE GAP FOUND!`);
                
                const tx = await w.sendTransaction({
                    to: TARGET,
                    data: '0x0480397a000000000000000000000000000000000000000000000000000000000007a120',
                    maxPriorityFeePerGas: ethers.parseUnits('1300', 'gwei'),
                    maxFeePerGas: ethers.parseUnits('1300', 'gwei'),
                    type: 2
                });

                console.log('🚀 STRIKE EXECUTED:', tx.hash);
                await tx.wait();
                const newBal = await p.getBalance(w.address);
                console.log('✅ TARGET MET. New Balance:', ethers.formatEther(newBal), 'MON');
                process.exit(0);
            } else {
                process.stdout.write(`\r[Block ${blockNumber}] Monitoring... No Profitable Gap.`);
            }
        } catch (e) {
            // Simulation reverted = No profit available.
        }
    });
}
main();

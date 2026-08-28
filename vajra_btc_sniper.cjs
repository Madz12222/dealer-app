const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const TARGET = '0x000000000004444c5dc75cb358380d2e3de08a90';

    console.log('--- GHOST-TW: cbBTC BRIDGE SNIPER ---');
    console.log('Targeting: cbBTC/WMON Spread (Mainnet)');

    p.on('block', async (blockNumber) => {
        try {
            // Priority 600 Gwei to beat the CCIP bridge bots
            const priority = ethers.parseUnits('600', 'gwei'); 
            
            // Logic: Strike with 75,000 MON to capture the BTC spread
            const tx = await w.sendTransaction({
                to: TARGET,
                data: '0x0480397a00000000000000000000000000000000000000000000000000000000000124f8', 
                gasLimit: 900000,
                maxPriorityFeePerGas: priority,
                maxFeePerGas: priority + ethers.parseUnits('100', 'gwei'),
                type: 2
            });

            console.log(`\n🚀 BTC GAP HIT! Hash: ${tx.hash}`);
            await tx.wait();
            const bal = await p.getBalance(w.address);
            console.log('✅ PROFIT CAPTURED. New Wallet Balance:', ethers.formatEther(bal), 'MON');
            process.exit(0);
        } catch (e) {
            process.stdout.write(`\rMonitoring Block ${blockNumber}...`);
        }
    });
}
main();

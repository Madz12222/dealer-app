const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    
    // Uniswap v4 Position Manager
    const POS_MGR = '0x000000000004444c5dc75cb358380d2e3de08a90';
    
    console.log('--- GHOST-TW: LP LIQUIDATION ---');
    
    try {
        // Step 1: Find the Token ID
        // In v4, we use the PositionManager to see what you own
        const abi = ['function tokenOfOwnerByIndex(address,uint256) view returns (uint256)', 'function balanceOf(address) view returns (uint256)'];
        const contract = new ethers.Contract(POS_MGR, abi, p);
        
        const count = await contract.balanceOf(w.address);
        if (count == 0) {
            console.log('❌ No LP Positions found for this wallet.');
            return;
        }

        const tokenId = await contract.tokenOfOwnerByIndex(w.address, 0);
        console.log('Found Position NFT ID:', tokenId.toString());

        // Step 2: Burn/Decrease Liquidity
        // This triggers the 'Remove Liquidity' flow
        const tx = await w.sendTransaction({
            to: POS_MGR,
            data: '0xba90ca3a' + ethers.zeroPadValue(ethers.toBeHex(tokenId), 32).slice(2), // decreaseLiquidity selector
            gasLimit: 500000,
            maxFeePerGas: ethers.parseUnits('600', 'gwei')
        });

        console.log('Liquidation Dispatched! Hash:', tx.hash);
        await tx.wait();
        const bal = await p.getBalance(w.address);
        console.log('✅ RECOVERY SUCCESS. New Balance:', ethers.formatEther(bal), 'MON');
    } catch (e) {
        console.log('❌ BURN FAILED:', e.message);
    }
}
main();

const { ethers } = require('ethers');

async function main() {
    const p = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const w = new ethers.Wallet('0xa50d553ebc625e246df94fd59b93c7df91d6ee399bb7e790486d57293a46f1a7', p);
    const WMON = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';
    
    const abi = ["function withdraw(uint256 wad) external"];
    const contract = new ethers.Contract(WMON, abi, w);

    try {
        console.log('Unwrapping 116.0 MON to Native Wallet...');
        const tx = await contract.withdraw(ethers.parseEther("116.0"), {
            gasLimit: 100000,
            maxPriorityFeePerGas: ethers.parseUnits('10', 'gwei')
        });
        console.log('Withdrawal Hash:', tx.hash);
        await tx.wait();
        console.log('✅ SUCCESS: Your balance is now 191 MON.');
    } catch (e) {
        console.log('❌ UNWRAP FAILED:', e.message);
    }
}
main();

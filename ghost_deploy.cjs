require('dotenv').config();
const { ethers } = require('ethers');

async function deploy() {
    const provider = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // May 2026 Verified PoolManager
    const MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';

    console.log('--- GHOST-TW CONTRACT DEPLOYMENT ---');
    console.log('Deploying from:', wallet.address);

    const GhostFlash = await ethers.getContractFactory("GhostFlash", wallet);
    const contract = await GhostFlash.deploy(MANAGER);
    await contract.waitForDeployment();

    console.log('✅ GHOST-TW DEPLOYED AT:', await contract.getAddress());
}
deploy();

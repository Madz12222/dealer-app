require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const RPC_URL = 'https://rpc.monad.xyz';

async function deploy() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('--- GHOST-TW BARE METAL DEPLOY ---');
    
    const abi = JSON.parse(fs.readFileSync('./GhostFlash_sol_GhostFlash.abi', 'utf8'));
    const binary = fs.readFileSync('./GhostFlash_sol_GhostFlash.bin', 'utf8');
    
    const factory = new ethers.ContractFactory(abi, binary, wallet);
    
    console.log('🚀 Deploying to Monad Mainnet...');
    const contract = await factory.deploy();

    await contract.waitForDeployment();
    console.log('✅ STRIKE CONTRACT LIVE AT:', await contract.getAddress());
}

deploy().catch(console.error);

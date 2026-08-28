const { ethers } = require('ethers');
const fs = require('fs');
const solc = require('solc');

async function deploy() {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("\n\x1b[35m[GHOST-TW] COMPILING CONTRACT...\x1b[0m");
    const source = fs.readFileSync('contracts/GhostFlashExecutor.sol', 'utf8');

    const input = {
        language: 'Solidity',
        sources: { 'GhostFlashExecutor.sol': { content: source } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractData = output.contracts['GhostFlashExecutor.sol']['GhostFlashExecutor'];

    console.log("Deploying from:", wallet.address);

    const factory = new ethers.ContractFactory(contractData.abi, contractData.evm.bytecode.object, wallet);
    const contract = await factory.deploy();
    
    console.log("Status: Waiting for confirmation...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("\n\x1b[32m[!] SUCCESS: EXECUTOR DEPLOYED\x1b[0m");
    console.log("Contract Address:", address);
    console.log("------------------------------------------\n");
}

deploy().catch(console.error);

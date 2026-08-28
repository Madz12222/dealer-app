const { ethers } = require("ethers");
const fs = require("fs");
const solc = require("solc");

async function main() {
    console.log("📦 Reading Solidity Contract...");
    const sourceCode = fs.readFileSync("EVLabRegistry.sol", "utf8");

    const input = {
        language: "Solidity",
        sources: {
            "EVLabRegistry.sol": {
                content: sourceCode,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode"],
                },
            },
        },
    };

    console.log("⚙️ Compiling Contract with solc...");
    const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (compiledCode.errors) {
        compiledCode.errors.forEach(err => console.log(err.formattedMessage));
        if (compiledCode.errors.some(err => err.severity === 'error')) {
            process.exit(1);
        }
    }

    const contractFile = compiledCode.contracts["EVLabRegistry.sol"]["EVLabRegistry"];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    fs.writeFileSync("contract_abi.json", JSON.stringify(abi, null, 2));

    // Ethers v5 & v6 Compatibility Provider Setup
    let provider;
    const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";
    
    if (ethers.JsonRpcProvider) {
        provider = new ethers.JsonRpcProvider(rpcUrl);
    } else if (ethers.providers && ethers.providers.JsonRpcProvider) {
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    } else {
        throw new Error("❌ Error: JsonRpcProvider not found in ethers library!");
    }

    const PRIVATE_KEY = "0x542b78fa3eaeee1792cbce04d9c9e2ca2636cc509ec4393d7ccd3e5a7b6c81ef";
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`🚀 Deploying Contract from wallet: ${wallet.address}`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    // Handle v5 vs v6 deployment wait method
    if (typeof contract.waitForDeployment === "function") {
        await contract.waitForDeployment();
    } else if (typeof contract.deployed === "function") {
        await contract.deployed();
    }

    const contractAddress = typeof contract.getAddress === "function" 
        ? await contract.getAddress() 
        : contract.address;

    console.log(`✅ EVLabRegistry deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Test Logging a Record immediately
    console.log("🔗 Sending test lab record transaction to BNB Smart Chain...");
    
    // Handle parsing units safely based on version
    const amountVal = (ethers.parseUnits) ? ethers.parseUnits("1000", "wei") : ethers.utils.parseUnits("1000", "wei");

    const tx = await contract.logTestResult(
        "LAB-TXN-AUTO-001",
        "TN10AC9528",
        "Madhan Sampath",
        "Battery Diagnostics & Thermal Scan",
        "38.5°C",
        "Optimal (96%)",
        amountVal
    );

    console.log(`⏳ Waiting for transaction confirmation...`);
    const receipt = typeof tx.wait === "function" ? await tx.wait() : tx;
    const txHash = receipt.hash || receipt.transactionHash;

    console.log(`✅ Blockchain Tx Successful: ${txHash}`);
    console.log(`🔍 BscScan Link: https://testnet.bscscan.com/tx/${txHash}`);
}

main().catch(console.error);


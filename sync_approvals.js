import { ethers } from 'ethers';
import fs from 'fs';

// GHOST-TW Protocol - Step 9: High-Authority Tunnels
const RPCS = [
    'https://bsc-mainnet.nodereal.io/v1/64a9dfc3d49f45c3abc9bcee29871d73',
    'https://bsc-dataseed.bnbchain.org',
    'https://1rpc.io/bnb',
    'https://rpc.ankr.com/bsc'
];

const owner = "0x9Cd8Bd8be324124306fC284A474F51EaA1410142";
const spender = "0x0a51E8Bd039d35de7ee61fa3fcf25815ac7e5444ca72ea577"; 

const abi = [
    "function allowance(address owner, address spender) view returns (uint256)", 
    "function decimals() view returns (uint8)"
];

const tokens = [
    { name: "USDT", address: "0x55d398326f99059fF775485246999027B3197955" },
    { name: "ETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8" },
    { name: "WBNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" }
];

async function syncLedger() {
    console.log("\n--- NAILU BANK: GHOST-TW LEDGER SYNC ---");
    let provider;

    for (let url of RPCS) {
        try {
            // Using a 5-second timeout for each tunnel attempt
            provider = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: true });
            const network = await Promise.race([
                provider.getNetwork(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            console.log(`[✔] Ghost Tunnel Active: ${new URL(url).hostname}`);
            break;
        } catch (e) {
            console.log(`[!] Tunnel ${new URL(url).hostname} Failed...`);
            continue;
        }
    }

    if (!provider) {
        console.log("CRITICAL: ALL TUNNELS BLOCKED. Try turning ON/OFF Airplane mode.");
        return;
    }

    let ghostVault = [];
    for (const token of tokens) {
        try {
            const contract = new ethers.Contract(token.address, abi, provider);
            const allowance = await contract.allowance(owner, spender);
            const decimals = await contract.decimals();
            const formatted = ethers.formatUnits(allowance, decimals);

            if (parseFloat(formatted) > 0) {
                console.log(`[✔] REFLECTED: ${token.name} (${formatted})`);
                ghostVault.push({ ticker: token.name, qty: parseFloat(formatted), visible: true });
            } else {
                console.log(`[i] ${token.name}: Ledger Empty (Check Approval)`);
            }
        } catch (err) {
            console.log(`[✘] Error Mirroring ${token.name}`);
        }
    }

    fs.writeFileSync('ghost_vault.json', JSON.stringify(ghostVault, null, 2));
    console.log("---------------------------------------");
    console.log("Step 18 Complete: Balance Reflection Saved.");
}

syncLedger();

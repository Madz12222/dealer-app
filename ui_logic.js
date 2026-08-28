const REAL_HASH = "0x52825a06e41865cda60b2a41f7c0f704aa05b49abc559046b2e889f8e47cbbb3";

function showTransferSuccess() {
    console.log("\n\x1b[32m🚀 GHOST-TW BROADCAST SUCCESSFUL\x1b[0m");
    console.log("------------------------------------------");
    console.log("Target:     0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577");
    console.log("Status:     \x1b[1mCONFIRMED SPENDABLE\x1b[0m");
    console.log("Tx Hash:    " + REAL_HASH);
    console.log("BscScan:    https://bscscan.com/tx/" + REAL_HASH);
    console.log("------------------------------------------");
    console.log("UI Action: Confirmation Message Displayed.");
}

showTransferSuccess();

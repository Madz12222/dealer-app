const { ethers } = require("ethers");

const words = "loop uncover chunk ice song produce review robot long away blush teach";

async function getKey() {
    try {
        const wallet = ethers.HDNodeWallet.fromPhrase(words);
        console.log("================================");
        console.log("SUCCESS! HEX KEY:");
        console.log(wallet.privateKey);
        console.log("================================");
    } catch (e) {
        console.log("Error: " + e.message);
    }
}

getKey();


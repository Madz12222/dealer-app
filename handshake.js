const axios = require('axios');

const targetAddress = "0x0a51E8Bd5e9d48FCc122Fbcb17eeDa4CA72eA577"; // Your specific address
const coin = process.argv[2] || "USDT";

async function pressButton() {
    console.log("------------------------------------------");
    console.log("🔘 COIN PRESSED: " + coin);
    console.log("📍 TO ADDRESS: " + targetAddress);
    console.log("------------------------------------------");

    try {
        const response = await axios.get('http://localhost:8080/transfer/' + coin);
        const data = response.data;

        if (data.status === "Success") {
            console.log("✅ " + coin + " TRANSFER INITIALIZED");
            console.log("📝 MESSAGE: " + data.message);
            console.log("🔗 BSCSCAN: " + data.explorer);
            console.log("------------------------------------------");
        }
    } catch (error) {
        console.log("❌ Connection to Bridge failed. Make sure 'node server.js' is running.");
    }
}

pressButton();

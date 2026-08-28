const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'bank.html');
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("File Not Found. Ensure bank.html is in the same folder as server.js");
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
}).listen(PORT, () => {
    console.log(`\n✅ BANK DASHBOARD ONLINE\n🔗 http://localhost:${PORT}\n`);
});

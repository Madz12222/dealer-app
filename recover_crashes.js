const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const salt = "0000000000000000004d6ec16da746510c7ee72230dc354a09c40040bc1d7103";

function getCrashPoint(hash) {
  const hmac = crypto.createHmac('sha256', hash);
  hmac.update(salt);
  const h = hmac.digest('hex');
  if (parseInt(h.slice(0, 52 / 4), 16) % 33 === 0) return "1.00";
  const e = Math.pow(2, 52);
  const m = parseInt(h.slice(0, 52 / 4), 16);
  return Math.floor((100 * e - m) / (e - m)) / 100;
}

const rl = readline.createInterface({
  input: fs.createReadStream('hashes_only.txt'),
  crlfDelay: Infinity
});

const output = fs.createWriteStream('crash_points.txt');
let count = 0;

console.log("Starting Stream Recovery (10,000,000 games)...");

rl.on('line', (line) => {
  const crash = getCrashPoint(line);
  output.write(crash + "\n");
  count++;
  if (count % 100000 === 0) {
    process.stdout.write(`Progress: ${count / 100000}%...\r`);
  }
});

rl.on('close', () => {
  console.log("\nSuccess: Calculated 10,000,000 crash points safely!");
});

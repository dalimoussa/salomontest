const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPath = path.resolve(__dirname, '..', 'public', 'mobile_screenshot.png');

if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath);
}

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  '--window-size=390,844',
  '--virtual-time-budget=5000',
  `--screenshot=${outPath}`,
  'http://127.0.0.1:3000/m/route_1'
];

console.log('Capturing mobile companion screenshot to:', outPath);
spawnSync(chromePath, args, { timeout: 20000, stdio: 'inherit' });
if (fs.existsSync(outPath)) {
  console.log('Success! Mobile screenshot size:', fs.statSync(outPath).size, 'bytes');
} else {
  console.log('Failed to capture mobile screenshot');
}

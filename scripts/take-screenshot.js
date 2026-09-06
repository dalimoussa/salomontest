const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPath = path.resolve(__dirname, '..', 'public', 'screenshot.png');

if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath);
}

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  '--window-size=1920,1080',
  '--virtual-time-budget=5000',
  `--screenshot=${outPath}`,
  'http://127.0.0.1:3000'
];

console.log('Capturing kiosk screenshot to:', outPath);
spawnSync(chromePath, args, { timeout: 20000, stdio: 'inherit' });
if (fs.existsSync(outPath)) {
  console.log('Success! Screenshot size:', fs.statSync(outPath).size, 'bytes');
} else {
  console.log('Failed to capture screenshot');
}

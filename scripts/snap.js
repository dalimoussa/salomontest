const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = process.argv[2] || 'http://127.0.0.1:3000';
const file = path.resolve(process.cwd(), process.argv[3] || 'public/screenshot.png');
const size = process.argv[4] || '1920,1080';

console.log(`Snapping ${url} -> ${file} (${size})`);
const [width, height] = size.split(',');
spawnSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  '--disable-extensions',
  '--run-all-compositor-stages-before-draw',
  `--window-size=${width || '1920'},${height || '1080'}`,
  `--screenshot=${file}`,
  url
], { timeout: 30000, stdio: 'inherit' });

console.log('Exists:', fs.existsSync(file));
if (fs.existsSync(file)) {
  console.log('Size:', fs.statSync(file).size, 'bytes');
}

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPath = path.resolve(__dirname, '..', 'public', 'screenshot_facilities.png');

if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath);
}

const args = [
  '--headless=new',
  '--no-sandbox',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--hide-scrollbars',
  '--window-size=1920,1080',
  '--virtual-time-budget=7000',
  `--screenshot=${outPath}`,
  'http://127.0.0.1:3000/3d-viewer/index.html?route=facilities'
];

console.log('Capturing Facilities screenshot to:', outPath);
spawnSync(chromePath, args, { timeout: 25000, stdio: 'inherit' });
if (fs.existsSync(outPath)) {
  console.log('Success! Screenshot size:', fs.statSync(outPath).size, 'bytes');
} else {
  console.log('Failed to capture screenshot');
}

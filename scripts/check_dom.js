const { spawnSync } = require('child_process');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const res = spawnSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--virtual-time-budget=6000',
  '--dump-dom',
  'http://127.0.0.1:3000'
], { timeout: 20000, encoding: 'utf-8' });

console.log('DOM length:', res.stdout.length);
console.log('Has 3Dマップ読み込み中:', res.stdout.includes('3Dマップ読み込み中'));
console.log('Has role=main:', res.stdout.includes('role="main"'));
console.log('Has maplibregl:', res.stdout.includes('maplibregl'));
console.log('Has 高尾山3Dマップ:', res.stdout.includes('高尾山3Dマップ'));
console.log('Has WebGL error message:', res.stdout.includes('WebGL'));
console.log('Has 3Dマップを表示できません:', res.stdout.includes('3Dマップを表示できません'));

const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let content = fs.readFileSync(bundlePath, 'utf8');

// 1. Sky brightness in Au
const targetAu = 'Au={gradientTopColor:"#388bfd",gradientBottomColor:"#eff8ff",fogColor:15726847,fogNearFactor:1.6,fogFarFactor:4.2}';
const brighterAu = 'Au={gradientTopColor:"#5ca8fc",gradientBottomColor:"#f4faff",fogColor:16054783,fogNearFactor:1.6,fogFarFactor:4.2}';

if (content.includes(targetAu)) {
  content = content.replace(targetAu, brighterAu);
  console.log('Successfully brightened sky in Au');
} else if (content.includes(brighterAu)) {
  console.log('Sky in Au is already brightened');
} else {
  console.log('targetAu not found');
}

// 2. Subtle mountain brightness lift in tv without touching routes or stations
if (content.includes('vec3(0.88)) * 1.28;')) {
  content = content.replace('vec3(0.88)) * 1.28;', 'vec3(0.86)) * 1.34;');
  console.log('Successfully updated pow curve in tv');
}
if (content.includes('* _skyward * 0.35;')) {
  content = content.replace('* _skyward * 0.35;', '* _skyward * 0.38;');
  console.log('Successfully updated skyward factor in tv');
}

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Done!');

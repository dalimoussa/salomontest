const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let content = fs.readFileSync(bundlePath, 'utf8');

// Target Ou, Bu, Au
// Original:
// Ou={lowElevationColor:9083780,highElevationColor:13819337,roughness:.85,metalness:.06,hillshadeMinFactor:.42,hillshadeMaxFactor:1.5,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.72,fadeColor:4608860}},Bu={hemisphereSkyColor:7901346,hemisphereGroundColor:5859410,hemisphereIntensity:1,directionalColor:16773592,directionalIntensity:1.9,directionalPosition:{x:-3600,y:3200,z:-2400}}
// Au={gradientTopColor:"#111c27",gradientBottomColor:"#46535c",fogColor:4608860,fogNearFactor:.7,fogFarFactor:1.9}

const targetOuBu = 'Ou={lowElevationColor:9083780,highElevationColor:13819337,roughness:.85,metalness:.06,hillshadeMinFactor:.42,hillshadeMaxFactor:1.5,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.72,fadeColor:4608860}},Bu={hemisphereSkyColor:7901346,hemisphereGroundColor:5859410,hemisphereIntensity:1,directionalColor:16773592,directionalIntensity:1.9,directionalPosition:{x:-3600,y:3200,z:-2400}}';

const cleanOuBu = 'Ou={lowElevationColor:16777215,highElevationColor:16777215,roughness:.8,metalness:.02,hillshadeMinFactor:.75,hillshadeMaxFactor:1.3,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.80,fadeColor:13165818}},Bu={hemisphereSkyColor:11852024,hemisphereGroundColor:9087096,hemisphereIntensity:1.2,directionalColor:16775918,directionalIntensity:1.8,directionalPosition:{x:-3600,y:4200,z:-2600}}';

const targetAu = 'Au={gradientTopColor:"#111c27",gradientBottomColor:"#46535c",fogColor:4608860,fogNearFactor:.7,fogFarFactor:1.9}';
const cleanAu = 'Au={gradientTopColor:"#3a7bc8",gradientBottomColor:"#c8e4fa",fogColor:13165818,fogNearFactor:1.2,fogFarFactor:3.2}';

if (!content.includes(targetOuBu)) {
  console.error('Target OuBu not found!');
  process.exit(1);
}

if (!content.includes(targetAu)) {
  console.error('Target Au not found!');
  process.exit(1);
}

content = content.replace(targetOuBu, cleanOuBu);
content = content.replace(targetAu, cleanAu);

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Successfully applied clean natural daylight to bundle.js!');

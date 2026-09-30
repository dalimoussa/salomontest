const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let content = fs.readFileSync(bundlePath, 'utf8');

// 1. Bright daylight Au (Sky Gradient & Fog)
const auRegex = /Au=\{gradientTopColor:"[^"]+",gradientBottomColor:"[^"]+",fogColor:\d+,fogNearFactor:[\d.]+,fogFarFactor:[\d.]+\}/;
const brightAu = 'Au={gradientTopColor:"#388bfd",gradientBottomColor:"#eff8ff",fogColor:15726847,fogNearFactor:1.6,fogFarFactor:4.2}';

if (auRegex.test(content)) {
  content = content.replace(auRegex, brightAu);
  console.log('Updated Au (Sky & Fog) for luminous daylight!');
} else {
  console.log('Au regex did not match');
}

// 2. High-noon Sun & Ambient Light (Ou & Bu)
const ouBuRegex = /Ou=\{lowElevationColor:16777215,highElevationColor:16777215,roughness:[\d.]+,metalness:[\d.]+,hillshadeMinFactor:[\d.]+,hillshadeMaxFactor:[\d.]+,textureUrl:"\/3d-viewer\/data\/terrain-texture\/takao-aerial\.webp",edgeFade:\{enabled:!0,fadeStartFactor:[\d.]+,fadeColor:\d+\}\},Bu=\{hemisphereSkyColor:\d+,hemisphereGroundColor:\d+,hemisphereIntensity:[\d.]+,directionalColor:\d+,directionalIntensity:[\d.]+,directionalPosition:\{x:[-\d.]+,y:[-\d.]+,z:[-\d.]+\}\}/;

const brightOuBu = 'Ou={lowElevationColor:16777215,highElevationColor:16777215,roughness:.68,metalness:.01,hillshadeMinFactor:.88,hillshadeMaxFactor:1.42,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.86,fadeColor:15726847}},Bu={hemisphereSkyColor:15726847,hemisphereGroundColor:11520140,hemisphereIntensity:1.85,directionalColor:16776435,directionalIntensity:2.7,directionalPosition:{x:-3400,y:4800,z:-2400}}';

if (ouBuRegex.test(content)) {
  content = content.replace(ouBuRegex, brightOuBu);
  console.log('Updated Ou & Bu for bright sunlight and high illumination!');
} else {
  console.log('OuBu regex did not match');
}

// 3. Update tv shader for REALLY STRONG green tone, sharp contrast, and bright skyward lift
const tvStartIdx = content.indexOf('function tv(n,e,t,i,r,s){');
if (tvStartIdx !== -1) {
  const tvEndTerm = 'map:s??null})}';
  const tvEndIdx = content.indexOf(tvEndTerm, tvStartIdx);
  if (tvEndIdx !== -1) {
    const origTv = content.slice(tvStartIdx, tvEndIdx + tvEndTerm.length);
    const upgradedTv = `function tv(n,e,t,i,r,s){const o=s===void 0?i:{...i,hillshadeMinFactor:1,hillshadeMaxFactor:1},a=ev(e,t,o,r);n.setAttribute("color",new Dt(a,3));const _m=new Ic({vertexColors:!0,color:16777215,roughness:i.roughness,metalness:i.metalness,map:s??null});_m.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace("#include <color_fragment>",\`#include <color_fragment>
vec3 _c = diffuseColor.rgb;
// Daytime brightness lift & sunlit tone curve
_c = pow(_c, vec3(0.80)) * 1.42;
// Identify natural forest & tree canopy
float _maxRb = max(_c.r, _c.b);
float _greenDelta = _c.g - _maxRb * 0.65;
float _isTree = smoothstep(0.008, 0.08, _greenDelta);
// Strong vibrant mountain green tone
vec3 _richGreen = vec3(_c.r * 0.60, _c.g * 1.65, _c.b * 0.55);
// Sharp contrast between sunlit canopy and valley shadows
float _lum = dot(_richGreen, vec3(0.299, 0.587, 0.114));
_richGreen = mix(_richGreen * 0.70, _richGreen * 1.38, smoothstep(0.12, 0.46, _lum));
_c = mix(_c, _richGreen, _isTree * 0.88);
// Skyward brightness lift towards mountain ridge & horizon
float _skyward = smoothstep(0.10, 0.95, 1.0 - vMapUv.y);
_c += vec3(0.15, 0.18, 0.22) * _skyward * 0.45;
diffuseColor.rgb = min(_c, vec3(1.0));
\`)};return _m;}`;
    content = content.replace(origTv, upgradedTv);
    console.log('Upgraded tv with super-strong green tone, sharp contrast, and daytime illumination!');
  }
}

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Successfully written to public/3d-viewer/bundle.js!');

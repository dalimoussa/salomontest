const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let content = fs.readFileSync(bundlePath, 'utf8');

// 1. Update Au and Bu for bright daytime sky & luminous horizon
const targetAuBu = 'Ou={lowElevationColor:16777215,highElevationColor:16777215,roughness:.8,metalness:.02,hillshadeMinFactor:.75,hillshadeMaxFactor:1.3,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.80,fadeColor:13165818}},Bu={hemisphereSkyColor:11852024,hemisphereGroundColor:9087096,hemisphereIntensity:1.2,directionalColor:16775918,directionalIntensity:1.8,directionalPosition:{x:-3600,y:4200,z:-2600}}';

const perfectedOuBu = 'Ou={lowElevationColor:16777215,highElevationColor:16777215,roughness:.72,metalness:.01,hillshadeMinFactor:.82,hillshadeMaxFactor:1.35,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.84,fadeColor:14216959}},Bu={hemisphereSkyColor:14216959,hemisphereGroundColor:10072970,hemisphereIntensity:1.45,directionalColor:16776175,directionalIntensity:2.2,directionalPosition:{x:-3400,y:4600,z:-2400}}';

const targetAu = 'Au={gradientTopColor:"#3a7bc8",gradientBottomColor:"#c8e4fa",fogColor:13165818,fogNearFactor:1.2,fogFarFactor:3.2}';
const perfectedAu = 'Au={gradientTopColor:"#2563ab",gradientBottomColor:"#d8eeff",fogColor:14216959,fogNearFactor:1.3,fogFarFactor:3.5}';

if (content.includes(targetAuBu)) {
  content = content.replace(targetAuBu, perfectedOuBu);
  console.log('Replaced Ou and Bu');
} else {
  console.log('Target OuBu not found or already updated');
}

if (content.includes(targetAu)) {
  content = content.replace(targetAu, perfectedAu);
  console.log('Replaced Au');
} else {
  console.log('Target Au not found or already updated');
}

// 2. Update tv in bundle.js with the natural color grading for strong green tone, sharp contrast, and bright daytime skyward lift
const tvStartIdx = content.indexOf('function tv(n,e,t,i,r,s){');
if (tvStartIdx !== -1) {
  const tvEndTerm = 'map:s??null})}';
  const tvEndIdx = content.indexOf(tvEndTerm, tvStartIdx);
  if (tvEndIdx !== -1) {
    const origTv = content.slice(tvStartIdx, tvEndIdx + tvEndTerm.length);
    const upgradedTv = `function tv(n,e,t,i,r,s){const o=s===void 0?i:{...i,hillshadeMinFactor:1,hillshadeMaxFactor:1},a=ev(e,t,o,r);n.setAttribute("color",new Dt(a,3));const _m=new Ic({vertexColors:!0,color:16777215,roughness:i.roughness,metalness:i.metalness,map:s??null});_m.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace("#include <color_fragment>",\`#include <color_fragment>
vec3 _c = diffuseColor.rgb;
// Daytime brightness lift & sunlit tone curve
_c = pow(_c, vec3(0.88)) * 1.28;
// Identify natural forest pixels
float _maxRb = max(_c.r, _c.b);
float _greenDelta = _c.g - _maxRb * 0.70;
float _isTree = smoothstep(0.012, 0.11, _greenDelta);
// Strong vibrant mountain green tone
vec3 _richGreen = vec3(_c.r * 0.76, _c.g * 1.45, _c.b * 0.70);
// Sharp contrast between sunlit canopy and valley shadows
float _lum = dot(_richGreen, vec3(0.299, 0.587, 0.114));
_richGreen = mix(_richGreen * 0.88, _richGreen * 1.20, smoothstep(0.14, 0.42, _lum));
_c = mix(_c, _richGreen, _isTree * 0.78);
// Skyward brightness lift towards mountain ridge & horizon
float _skyward = smoothstep(0.18, 0.95, 1.0 - vMapUv.y);
_c += vec3(0.08, 0.12, 0.16) * _skyward * 0.35;
diffuseColor.rgb = min(_c, vec3(1.0));
\`)};return _m;}`;
    content = content.replace(origTv, upgradedTv);
    console.log('Upgraded tv with strong green tone and sharp contrast!');
  }
}

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Updated bundle.js successfully!');

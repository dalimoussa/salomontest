const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let content = fs.readFileSync(bundlePath, 'utf8');

// 1. Sky & Atmospheric Fog (Au)
// Clean, natural daylight sky — slightly brighter and more luminous than the client's provided screen
const auRegex = /Au=\{gradientTopColor:"[^"]+",gradientBottomColor:"[^"]+",fogColor:\d+,fogNearFactor:[\d.]+,fogFarFactor:[\d.]+\}/;
const naturalBrightAu = 'Au={gradientTopColor:"#2f7fce",gradientBottomColor:"#d8eefd",fogColor:14220541,fogNearFactor:1.35,fogFarFactor:3.6}';

if (auRegex.test(content)) {
  content = content.replace(auRegex, naturalBrightAu);
  console.log('✓ Successfully updated Au (Natural Bright Daylight Sky & Horizon)');
} else {
  console.warn('Au regex did not match');
}

// 2. Sunlight & Terrain Material (Ou & Bu)
// Slightly brighter than the client's screen (hemisphere 1.42 vs 1.20, directional 2.20 vs 1.80)
const ouBuRegex = /Ou=\{lowElevationColor:16777215,highElevationColor:16777215,roughness:[\d.]+,metalness:[\d.]+,hillshadeMinFactor:[\d.]+,hillshadeMaxFactor:[\d.]+,textureUrl:"\/3d-viewer\/data\/terrain-texture\/takao-aerial\.webp",edgeFade:\{enabled:!0,fadeStartFactor:[\d.]+,fadeColor:\d+\}\},Bu=\{hemisphereSkyColor:\d+,hemisphereGroundColor:\d+,hemisphereIntensity:[\d.]+,directionalColor:\d+,directionalIntensity:[\d.]+,directionalPosition:\{x:[-\d.]+,y:[-\d.]+,z:[-\d.]+\}\}/;

const enhancedOuBu = 'Ou={lowElevationColor:16777215,highElevationColor:16777215,roughness:.72,metalness:.01,hillshadeMinFactor:.80,hillshadeMaxFactor:1.35,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.82,fadeColor:14220541}},Bu={hemisphereSkyColor:13886462,hemisphereGroundColor:9875840,hemisphereIntensity:1.42,directionalColor:16776182,directionalIntensity:2.20,directionalPosition:{x:-3500,y:4400,z:-2500}}';

if (ouBuRegex.test(content)) {
  content = content.replace(ouBuRegex, enhancedOuBu);
  console.log('✓ Successfully updated Ou & Bu (Natural Daylight Lighting & Enhanced Terrain Specular)');
} else {
  console.warn('OuBu regex did not match');
}

// 3. Update function tv to FURTHER ENHANCE THE WOOD TEXTURE while keeping authentic aerial photography tones
const tvStartIdx = content.indexOf('function tv(n,e,t,i,r,s){');
if (tvStartIdx !== -1) {
  const tvEndTerm = 'return _m;}';
  const tvEndIdx = content.indexOf(tvEndTerm, tvStartIdx);
  if (tvEndIdx !== -1) {
    const origTv = content.slice(tvStartIdx, tvEndIdx + tvEndTerm.length);
    const woodEnhancedTv = `function tv(n,e,t,i,r,s){const o=s===void 0?i:{...i,hillshadeMinFactor:1,hillshadeMaxFactor:1},a=ev(e,t,o,r);n.setAttribute("color",new Dt(a,3));const _m=new Ic({vertexColors:!0,color:16777215,roughness:i.roughness,metalness:i.metalness,map:s??null});_m.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace("#include <color_fragment>",\`#include <color_fragment>
vec3 _c = diffuseColor.rgb;
// 1. Natural daylight lift - just slightly brighter than the provided screen
_c = pow(_c, vec3(0.93)) * 1.15;

// 2. Enhance wood & forest tree canopy texture
// Calculate perceptual luminance
float _lum = dot(_c, vec3(0.299, 0.587, 0.114));

// Detect natural forested terrain (green channel prominent relative to red/blue)
float _isForest = smoothstep(0.015, 0.08, _c.g - max(_c.r, _c.b) * 0.68);

// Deepen canopy shadows & lift sunlit tree tops for rich tactile 3D relief
vec3 _woodContrast = mix(_c * 0.82, _c * 1.22, smoothstep(0.10, 0.52, _lum));

// Natural forest vibrancy (nourishing lush green leaves while preserving woody bark and soil)
_woodContrast.g = mix(_woodContrast.g, _woodContrast.g * 1.10, _isForest);
_woodContrast.r = mix(_woodContrast.r, _woodContrast.r * 0.96, _isForest);

// Blend contrast enhancement into the forested terrain (leaves roads/stations clean)
_c = mix(_c, _woodContrast, _isForest * 0.90);

// Micro-contrast clarity on tree foliage (sharpens individual tree crowns & wood grain)
vec3 _detail = _c - vec3(_lum);
_c = _c + _detail * (_isForest * 0.35);

diffuseColor.rgb = clamp(_c, 0.0, 1.0);
\`)};return _m;}`;
    content = content.replace(origTv, woodEnhancedTv);
    console.log('✓ Successfully upgraded tv shader with high-clarity wood texture enhancement!');
  } else {
    console.warn('tvEndTerm not found');
  }
} else {
  console.warn('tvStartIdx not found');
}

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Done! Successfully written to public/3d-viewer/bundle.js');

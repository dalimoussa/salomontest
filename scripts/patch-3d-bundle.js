const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let content = fs.readFileSync(bundlePath, 'utf8');

// Target the existing tv function in bundle.js
const tvStartIdx = content.indexOf('function tv(n,e,t,i,r,s){');
if (tvStartIdx === -1) {
  console.error('Could not find function tv in bundle.js');
  process.exit(1);
}

// Find end of tv function
const tvEndTerm = ';return _mat;}';
const tvAltEnd = 'map:s??null})}';
let tvEndIdx = content.indexOf(tvEndTerm, tvStartIdx);
let endLength = tvEndTerm.length;
if (tvEndIdx === -1) {
  tvEndIdx = content.indexOf(tvAltEnd, tvStartIdx);
  endLength = tvAltEnd.length;
}

if (tvEndIdx === -1) {
  console.error('Could not find end of function tv');
  process.exit(1);
}

const existingTvBlock = content.slice(tvStartIdx, tvEndIdx + endLength);

const perfectedTv = `function tv(n,e,t,i,r,s){const o=s===void 0?i:{...i,hillshadeMinFactor:1,hillshadeMaxFactor:1},a=ev(e,t,o,r);n.setAttribute("color",new Dt(a,3));const _mat=new Ic({vertexColors:!0,color:16777215,roughness:0.65,metalness:0.04,map:s??null});_mat.onBeforeCompile=function(_sh){_sh.fragmentShader=_sh.fragmentShader.replace("#include <color_fragment>",\`#include <color_fragment>
vec3 _bCol = diffuseColor.rgb;
// Daytime brightness lift & sunlit tone curve
_bCol = pow(_bCol, vec3(0.84)) * 1.30;
float _maxRb = max(_bCol.r, _bCol.b);
float _vegDelta = _bCol.g - _maxRb * 0.72;
float _isForest = smoothstep(0.012, 0.15, _vegDelta);

// Tree canopy procedural micro-detail (木のリアルさ)
vec2 _tUv = vMapUv * 960.0;
float _tNoise1 = fract(sin(dot(_tUv, vec2(127.1, 311.7))) * 43758.5453);
float _tNoise2 = fract(sin(dot(_tUv * 1.6 + vec2(3.1, 1.7), vec2(269.5, 183.3))) * 28461.12);
float _cDepth = 0.86 + 0.28 * _tNoise1 + 0.12 * _tNoise2;

// Smooth harmonic autumn foliage distribution (紅葉🍁 - Momiji scarlet, golden amber, cedar green)
vec2 _mUv = vMapUv * 48.0;
float _r1 = sin(_mUv.x * 2.1 + sin(_mUv.y * 1.7)) * 0.5 + 0.5;
float _r2 = cos(_mUv.y * 2.5 + sin(_mUv.x * 1.5)) * 0.5 + 0.5;
float _clust = sin(_mUv.x * 4.4 + _mUv.y * 3.2) * cos(_mUv.y * 4.8 - _mUv.x * 2.9) * 0.5 + 0.5;

vec3 _momijiRed = vec3(0.86, 0.22, 0.12);
vec3 _momijiGold = vec3(0.92, 0.62, 0.15);
vec3 _momijiAmber = vec3(0.90, 0.44, 0.13);
vec3 _koyoCol = mix(_momijiGold, _momijiRed, _r1);
_koyoCol = mix(_koyoCol, _momijiAmber, _clust);

// Preserve natural cedar groves & lush forest green (~40% evergreen cedars)
float _cedarWave = sin(_mUv.x * 3.1 - _mUv.y * 2.7) * sin(_mUv.y * 2.9 + _mUv.x * 1.8) * 0.5 + 0.5;
float _isCedar = smoothstep(0.48, 0.80, _cedarWave);
vec3 _cedarGreen = vec3(0.18, 0.35, 0.17);

vec3 _foliageCol = mix(_koyoCol, _cedarGreen, _isCedar * 0.75);
_foliageCol *= _cDepth;

// Seamless blend onto forest areas
vec3 _richForest = mix(_bCol * _cDepth, _foliageCol, 0.68);
diffuseColor.rgb = mix(_bCol, _richForest, _isForest);
\`)};return _mat;}`;

content = content.replace(existingTvBlock, perfectedTv);
fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Successfully applied perfected autumn foliage & tree realism shader to bundle.js!');

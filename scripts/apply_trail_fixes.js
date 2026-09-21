const fs = require('fs');
const path = require('path');

// ─── 1. Build Inariyama Course ──────────────────────────────────────────────
console.log('[1/4] Building clean Inariyama route...');
const rawIna = JSON.parse(fs.readFileSync('osm_relation_inariyama.json', 'utf8'));
const inaNodes = new Map();
const inaWays = new Map();
rawIna.elements.forEach(e => {
  if (e.type === 'node') inaNodes.set(e.id, { lat: e.lat, lng: e.lon });
  else if (e.type === 'way') inaWays.set(e.id, e.nodes);
});
const inaRel = rawIna.elements.find(e => e.type === 'relation');

let inaPoints = [];
for (const m of inaRel.members) {
  if (m.type !== 'way') continue;
  const nids = inaWays.get(m.ref);
  if (!nids) continue;
  const pts = nids.map(id => inaNodes.get(id)).filter(Boolean);
  if (inaPoints.length === 0) {
    inaPoints = pts;
  } else {
    const tail = inaPoints[inaPoints.length - 1];
    const d0 = Math.hypot((pts[0].lng - tail.lng)*90480, (pts[0].lat - tail.lat)*111320);
    const d1 = Math.hypot((pts[pts.length-1].lng - tail.lng)*90480, (pts[pts.length-1].lat - tail.lat)*111320);
    if (d1 < d0) pts.reverse();
    inaPoints = inaPoints.concat(pts.slice(1));
  }
}
// Ensure clean connection to Mt. Takao summit
inaPoints.push({ lat: 35.625227, lng: 139.243688 });

// Interpolate any gaps > 25m in Inariyama
function interpolatePoints(pts, maxDistMeters = 25) {
  const result = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i+1];
    result.push(p1);
    const dist = Math.hypot((p2.lng - p1.lng) * 90480, (p2.lat - p1.lat) * 111320);
    if (dist > maxDistMeters) {
      const steps = Math.ceil(dist / maxDistMeters);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        result.push({
          lat: p1.lat + (p2.lat - p1.lat) * t,
          lng: p1.lng + (p2.lng - p1.lng) * t
        });
      }
    }
  }
  result.push(pts[pts.length - 1]);
  return result;
}

const cleanInariyama = interpolatePoints(inaPoints, 25);
console.log('Clean Inariyama points:', cleanInariyama.length);

// ─── 2. Build Jinba Traverse Course ─────────────────────────────────────────
console.log('[2/4] Building clean Jinba Traverse route...');
const rawJin = JSON.parse(fs.readFileSync('osm_relation_jinba.json', 'utf8'));
const jinNodes = new Map();
const jinWays = new Map();
rawJin.elements.forEach(e => {
  if (e.type === 'node') jinNodes.set(e.id, { lat: e.lat, lng: e.lon });
  else if (e.type === 'way') jinWays.set(e.id, e.nodes);
});

// Stitched ways in exact geographic order from Momijidai to Jinba summit
const waysInChain = [
  132482481, // 35.6260, 139.2348 -> 35.6265, 139.2270 (Momijidai to Itchodaira)
  132482325, // 35.6265, 139.2270 -> 35.6282, 139.2235 (Itchodaira to Shiroyama)
  132479508, // Shiroyama to Kobotoke descent
  132483787,
  68521188,
  68521186,  // to Kobotoke pass
  68521185,  // Kobotoke pass to ridge
  132486010, // toward Kagenobu
  132479526, // Kagenobu ascent
  132484337, // Kagenobu summit
  132486918, // Kagenobu to Doudokoro
  152649972,
  152650234, // to Myouou Pass
  152648472, // Myouou Pass
  152648437,
  152647597,
  152648530,
  152650268, // toward Jinba
  152650864,
  132487266, // Jinba approach
  152647773, // Jinba plateau
  132477973  // Jinba summit monument
];

// Continuous ridge line from Takao Summit down through Momijidai to start of way 132482481
const takaoToMomijidai = [
  { lat: 35.625227, lng: 139.243688 },
  { lat: 35.62515,  lng: 139.2432 },
  { lat: 35.62505,  lng: 139.2428 },
  { lat: 35.62485,  lng: 139.2422 },
  { lat: 35.62470,  lng: 139.2417 },
  { lat: 35.62455,  lng: 139.2405 },
  { lat: 35.62465,  lng: 139.2398 },
  { lat: 35.62480,  lng: 139.2392 },
  { lat: 35.62510,  lng: 139.2388 },
  { lat: 35.62540,  lng: 139.2385 }, // Momijidai
  { lat: 35.62570,  lng: 139.2370 },
  { lat: 35.62590,  lng: 139.2360 },
  { lat: 35.62605,  lng: 139.2348 },
];

let jinFullPoints = [...takaoToMomijidai];
for (const wid of waysInChain) {
  const nids = jinWays.get(wid);
  if (!nids) continue;
  const pts = nids.map(id => jinNodes.get(id)).filter(Boolean);
  const tail = jinFullPoints[jinFullPoints.length - 1];
  const d0 = Math.hypot((pts[0].lng - tail.lng)*90480, (pts[0].lat - tail.lat)*111320);
  const d1 = Math.hypot((pts[pts.length-1].lng - tail.lng)*90480, (pts[pts.length-1].lat - tail.lat)*111320);
  if (d1 < d0) pts.reverse();
  jinFullPoints = jinFullPoints.concat(pts.slice(1));
}

const cleanJinbaFull = interpolatePoints(jinFullPoints, 25);
console.log('Clean Full Jinba points (Takao summit to Jinba summit):', cleanJinbaFull.length);

// Also create the 3D-Viewer section of Jinba:
// On the 1.8km local Mt. Takao mesh, the western ridge runs from Takao summit past Momijidai and Itchodaira
// to Kobotoke-Shiroyama (lng: 139.2235).
// We select points up to the Shiroyama crest on the 3D terrain:
const jinba3DPoints = cleanJinbaFull.filter(p => p.lng >= 139.2234);
// Add a clean terminating landmark point right on the western ridge crest
jinba3DPoints.push({ lat: 35.62820, lng: 139.22340 });
console.log('Clean 3D-mesh Jinba Traverse points:', jinba3DPoints.length);

// ─── 3. Update public/3d-viewer/routes-data.js ──────────────────────────────
console.log('[3/4] Updating public/3d-viewer/routes-data.js...');
let routesDataContent = fs.readFileSync('public/3d-viewer/routes-data.js', 'utf8');

// Prepare Inariyama 3D points with POIs
const inariyama3D = cleanInariyama.map((p, idx) => {
  const pt = { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) };
  if (idx === 0) {
    pt.label = '稲荷山登山口';
    pt.poiId = 'inariyama_base';
  } else if (idx === Math.round(cleanInariyama.length * 0.15)) {
    pt.label = '旭稲荷神社';
    pt.poiId = 'inariyama_shrine';
  } else if (idx === Math.round(cleanInariyama.length * 0.45)) {
    pt.label = '稲荷山展望東屋';
    pt.poiId = 'inariyama_azumaya';
  } else if (idx === Math.round(cleanInariyama.length * 0.75)) {
    pt.label = '尾根見晴らし';
    pt.poiId = 'inariyama_ridge';
  } else if (idx === cleanInariyama.length - 1) {
    pt.label = '高尾山頂（南階段）';
    pt.poiId = 'summit';
  }
  return pt;
});

const inariyamaLabels = [
  { poiId: 'inariyama_base', displayText: '稲荷山登山口' },
  { poiId: 'inariyama_shrine', displayText: '旭稲荷神社' },
  { poiId: 'inariyama_azumaya', displayText: '稲荷山展望東屋' },
  { poiId: 'inariyama_ridge', displayText: '尾根見晴らし' },
  { poiId: 'summit', displayText: '高尾山頂' },
];

// Prepare Jinba 3D points with POIs
const jinba3D = jinba3DPoints.map((p, idx) => {
  const pt = { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) };
  if (idx === 0) {
    pt.label = '高尾山頂（奥高尾起点）';
    pt.poiId = 'jinba_takao';
  } else if (idx === Math.round(jinba3DPoints.length * 0.25)) {
    pt.label = 'もみじ台（富士見茶屋）';
    pt.poiId = 'jinba_momiji';
  } else if (idx === Math.round(jinba3DPoints.length * 0.60)) {
    pt.label = '一丁平展望デッキ';
    pt.poiId = 'jinba_itchodaira';
  } else if (idx === jinba3DPoints.length - 1) {
    pt.label = '小仏城山・陣馬山方面 ➔';
    pt.poiId = 'jinba_shiroyama';
  }
  return pt;
});

const jinbaLabels = [
  { poiId: 'jinba_takao', displayText: '高尾山頂（奥高尾起点）' },
  { poiId: 'jinba_momiji', displayText: 'もみじ台（富士見茶屋）' },
  { poiId: 'jinba_itchodaira', displayText: '一丁平展望デッキ' },
  { poiId: 'jinba_shiroyama', displayText: '小仏城山・陣馬山方面 ➔' },
];

// Parse existing routes-data.js
const prefix = 'window.__ALL_ROUTES_3D = ';
const existingJson = JSON.parse(routesDataContent.slice(prefix.length).trim().replace(/;$/, ''));

// Update inariyama & route_inariyama
const inariyamaObj = {
  id: 'route_inariyama',
  name: '稲荷山コース（尾根歩きパノラマ）',
  color: 0x00c8ff,
  points: inariyama3D,
  labels: inariyamaLabels,
};
existingJson['inariyama'] = inariyamaObj;
existingJson['route_inariyama'] = inariyamaObj;

// Update route_jinba, route_kagenobu, route_3_traverse
const jinbaObj = {
  id: 'route_jinba',
  name: '高尾山・陣馬山縦走コース（奥高尾ロングトレイル）',
  color: 0xe8002d,
  points: jinba3D,
  labels: jinbaLabels,
};
existingJson['route_jinba'] = jinbaObj;
existingJson['route_kagenobu'] = jinbaObj;
existingJson['route_3_traverse'] = jinbaObj;

fs.writeFileSync('public/3d-viewer/routes-data.js', prefix + JSON.stringify(existingJson) + ';\n');
console.log('Saved updated public/3d-viewer/routes-data.js');

// ─── 4. Update src/data/takaoTrailsGeoJson.ts & public/data/takao-trails.geojson ───
console.log('[4/4] Updating GeoJSON files for MapLibre 3D...');

// Convert full continuous coordinates to GeoJSON [lng, lat]
const inaGeoCoords = cleanInariyama.map(p => [Number(p.lng.toFixed(6)), Number(p.lat.toFixed(6))]);
const jinGeoCoords = cleanJinbaFull.map(p => [Number(p.lng.toFixed(6)), Number(p.lat.toFixed(6))]);

// Update public/data/takao-trails.geojson
const publicTrails = JSON.parse(fs.readFileSync('public/data/takao-trails.geojson', 'utf8'));
publicTrails.features.forEach(f => {
  const id = f.properties.route_id;
  if (id === 'inariyama' || id === 'route_inariyama') {
    f.geometry = { type: 'LineString', coordinates: inaGeoCoords };
  } else if (id === 'route_jinba' || id === 'route_3_traverse') {
    f.geometry = { type: 'LineString', coordinates: jinGeoCoords };
  }
});
fs.writeFileSync('public/data/takao-trails.geojson', JSON.stringify(publicTrails, null, 2));
console.log('Saved updated public/data/takao-trails.geojson');

// Update src/data/takaoTrailsGeoJson.ts
const tsHeader = `import type { FeatureCollection } from 'geojson';\n\nexport const TAKAO_TRAILS_GEOJSON: FeatureCollection = `;
fs.writeFileSync('src/data/takaoTrailsGeoJson.ts', tsHeader + JSON.stringify(publicTrails, null, 2) + ';\n');
console.log('Saved updated src/data/takaoTrailsGeoJson.ts');

console.log('All route updates completed successfully!');

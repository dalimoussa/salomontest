const fs = require('fs');
const path = require('path');

// 1. Add __MASTER_FACILITIES_3D to routes-data.js
const routesDataPath = path.join(__dirname, '../public/3d-viewer/routes-data.js');
let routesData = fs.readFileSync(routesDataPath, 'utf8');

const masterFacilitiesCode = `
window.__MASTER_FACILITIES_3D = [
  { poiId: "kiyotaki", lat: 35.631103, lng: 139.266899, displayText: "清滝駅 🚡 🚻 🅿️" },
  { poiId: "takaosanguchi_kasumidai", lat: 35.630898, lng: 139.256432, displayText: "高尾山駅・霞台 🚡 🍵 🚻" },
  { poiId: "kasumidai_view", lat: 35.6299231, lng: 139.2531682, displayText: "八王子JCT展望 ⛰️" },
  { poiId: "joshinmon", lat: 35.629887, lng: 139.25317, displayText: "浄心門 ⛩️" },
  { poiId: "yakuoin", lat: 35.626142, lng: 139.249976, displayText: "薬王院 ⛩️ 🍵 🚻" },
  { poiId: "summit", lat: 35.625227, lng: 139.243688, displayText: "高尾山頂 ⛰️ 🍵 🚻 (599m)" },
  { poiId: "inariyama_azumaya", lat: 35.626205, lng: 139.257179, displayText: "稲荷山東屋 🍵 ⛰️" },
  { poiId: "r4_miyamabashi", lat: 35.6289553, lng: 139.2486891, displayText: "みやま橋 🌉" },
  { poiId: "r6_biwataki", lat: 35.6302776, lng: 139.2615779, displayText: "びわ滝 💧" }
];
`;

if (!routesData.includes('__MASTER_FACILITIES_3D')) {
  routesData += masterFacilitiesCode;
  fs.writeFileSync(routesDataPath, routesData, 'utf8');
  console.log('Added __MASTER_FACILITIES_3D to routes-data.js');
}

// 2. Patch bundle.js kv function
const bundlePath = path.join(__dirname, '../public/3d-viewer/bundle.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

const targetKv = 'function kv(n,e){const t=[];return n.points.forEach(i=>{if(i.poiId===void 0)return;const r=e.find(s=>s.poiId===i.poiId);r!==void 0&&t.push({point:{...i,poiId:i.poiId},presentation:r})}),t}';

const enhancedKv = 'function kv(n,e){const t=[],s=new Set;n.points.forEach(i=>{if(i.poiId===void 0)return;const r=e.find(o=>o.poiId===i.poiId);r!==void 0&&(t.push({point:{...i,poiId:i.poiId},presentation:r}),s.add(i.poiId))});if(typeof window!=="undefined"&&window.__MASTER_FACILITIES_3D){window.__MASTER_FACILITIES_3D.forEach(f=>{if(!s.has(f.poiId)){t.push({point:{lat:f.lat,lng:f.lng,poiId:f.poiId},presentation:{poiId:f.poiId,displayText:f.displayText}}),s.add(f.poiId)}})}return t}';

if (bundle.includes(targetKv)) {
  bundle = bundle.replace(targetKv, enhancedKv);
  fs.writeFileSync(bundlePath, bundle, 'utf8');
  console.log('Enhanced kv function in bundle.js to include permanent facilities and restrooms!');
} else {
  console.log('targetKv not found or already patched');
}

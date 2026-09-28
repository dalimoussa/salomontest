const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '../public/3d-viewer/routes-data.js');
let s = fs.readFileSync(routesPath, 'utf8');

const facilitiesObj = {
  id: 'facilities',
  name: '全施設・トイレ案内マップ',
  color: 65535,
  points: [
    { lat: 35.631103, lng: 139.266899, label: '清滝駅 🚡 🚻 🅿️', poiId: 'f_kiyotaki' },
    { lat: 35.630281, lng: 139.261578, label: 'びわ滝 💧', poiId: 'f_biwa' },
    { lat: 35.630898, lng: 139.256432, label: '高尾山駅・霞台 🚡 🍵 🚻', poiId: 'f_kasumidai' },
    { lat: 35.629923, lng: 139.253168, label: '八王子JCT展望 ⛰️', poiId: 'f_jct_view' },
    { lat: 35.629887, lng: 139.253170, label: '浄心門 ⛩️', poiId: 'f_joshinmon' },
    { lat: 35.628955, lng: 139.248689, label: 'みやま橋 🌉', poiId: 'f_miyama' },
    { lat: 35.626142, lng: 139.249976, label: '薬王院 ⛩️ 🍵 🚻', poiId: 'f_yakuoin' },
    { lat: 35.626205, lng: 139.257179, label: '稲荷山東屋 🍵 ⛰️', poiId: 'f_inariyama' },
    { lat: 35.625227, lng: 139.243688, label: '高尾山頂 ⛰️ 🍵 🚻', poiId: 'f_summit' }
  ],
  labels: [
    { poiId: 'f_kiyotaki', displayText: '清滝駅 🚡 🚻 🅿️' },
    { poiId: 'f_biwa', displayText: 'びわ滝 💧' },
    { poiId: 'f_kasumidai', displayText: '高尾山駅・霞台 🚡 🍵 🚻' },
    { poiId: 'f_jct_view', displayText: '八王子JCT展望 ⛰️' },
    { poiId: 'f_joshinmon', displayText: '浄心門 ⛩️' },
    { poiId: 'f_miyama', displayText: 'みやま橋 🌉' },
    { poiId: 'f_yakuoin', displayText: '薬王院 ⛩️ 🍵 🚻' },
    { poiId: 'f_inariyama', displayText: '稲荷山東屋 🍵 ⛰️' },
    { poiId: 'f_summit', displayText: '高尾山頂 ⛰️ 🍵 🚻' }
  ]
};

if (!s.includes('"facilities":')) {
  s = s.trimEnd() + '\nwindow.__ALL_ROUTES_3D["facilities"] = ' + JSON.stringify(facilitiesObj) + ';\n';
  fs.writeFileSync(routesPath, s, 'utf8');
  console.log('Successfully added facilities to routes-data.js');
} else {
  console.log('facilities already present in routes-data.js');
}

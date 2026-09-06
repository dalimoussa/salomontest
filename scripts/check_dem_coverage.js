// scripts/check_dem_coverage.js
function lon2tile(lon, zoom) { return Math.floor((lon + 180) / 360 * Math.pow(2, zoom)); }
function lat2tile(lat, zoom) { return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)); }

const testPoints = [
  { name: 'Takao Summit (1-6号路・稲荷山)', lon: 139.2485, lat: 35.6275 },
  { name: 'Kiyotaki (Base / 登山口)', lon: 139.2700, lat: 35.6318 },
  { name: 'Gongendaira (南高尾・権現平)', lon: 139.262, lat: 35.608 },
  { name: 'Misawa Pass (三沢峠)', lon: 139.266, lat: 35.605 },
  { name: 'Kogezawa (小下沢林道)', lon: 139.238, lat: 35.642 },
  { name: 'Taiko (太鼓曲輪尾根・八王子城跡)', lon: 139.252, lat: 35.655 },
  { name: 'Shiroyama / Tengu (小仏城山)', lon: 139.230, lat: 35.630 },
  { name: 'Kagenobuyama (景信山)', lon: 139.215, lat: 35.642 },
  { name: 'Myootoge (明王峠)', lon: 139.185, lat: 35.651 },
  { name: 'Jinba Summit (陣馬山頂)', lon: 139.1679, lat: 35.6556 }
];

const zoom = 14;
async function checkCoverage() {
  console.log('Checking GSI DEM5A (5m) vs DEM (10m) coverage across Takao region:');
  for (const pt of testPoints) {
    const x = lon2tile(pt.lon, zoom);
    const y = lat2tile(pt.lat, zoom);
    const dem5aUrl = `https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/${zoom}/${x}/${y}.png`;
    const dem10Url = `https://cyberjapandata.gsi.go.jp/xyz/dem_png/${zoom}/${x}/${y}.png`;

    const r5a = await fetch(dem5aUrl);
    const r10 = await fetch(dem10Url);
    console.log(`- ${pt.name.padEnd(32)}: DEM5A=${r5a.status} (${r5a.status === 200 ? 'Available' : 'Missing'}), DEM10=${r10.status}`);
  }
}
checkCoverage().catch(console.error);

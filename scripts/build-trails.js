// Converts OSM Overpass `out geom` JSON into GeoJSON LineString features.
// Each OSM relation has members of type "way" each with a geometry array.
// We stitch those way segments into one MultiLineString per route.

const fs = require('fs');

const RAW_PATH  = './osm_extra_routes_clean.json';
const GEOJSON_PATH = './public/data/takao-trails.geojson';

// Map OSM relation ID → our internal route_id
const RELATION_ID_MAP = {
  1216428: 'route_1',   // 高尾山 1号路
  7165823: 'route_2',   // 高尾山 2号路
  7165822: 'route_3',   // 高尾山 3号路
  7165821: 'route_4',   // 高尾山 4号路
  7165820: 'route_5',   // 高尾山 5号路
  7165824: 'route_6',   // 高尾山 6号路
  7165825: 'inariyama', // 稲荷山コース
};

// Colour assignments matching MountainMapGL.tsx ROUTE_COLOR_MAP
const ROUTE_COLORS = {
  route_1:   '#0AFFE0',
  route_2:   '#4ADE80',
  route_3:   '#FB923C',
  route_4:   '#A78BFA',
  route_5:   '#F472B6',
  route_6:   '#FACC15',
  inariyama: '#00C8FF',
};

const ROUTE_NAMES = {
  route_1:   '1号路',
  route_2:   '2号路',
  route_3:   '3号路',
  route_4:   '4号路',
  route_5:   '5号路',
  route_6:   '6号路',
  inariyama: '稲荷山コース',
};

const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

const features = [];

for (const element of raw.elements) {
  if (element.type !== 'relation') continue;

  const routeId = RELATION_ID_MAP[element.id];
  if (!routeId) {
    console.warn(`Skipping unknown relation ${element.id}`);
    continue;
  }

  // Collect all way geometries from the relation's members
  const lines = [];
  for (const member of element.members || []) {
    if (member.type !== 'way' || !member.geometry || member.geometry.length < 2) continue;
    const coords = member.geometry.map(pt => [pt.lon, pt.lat]);
    lines.push(coords);
  }

  if (lines.length === 0) {
    console.warn(`No geometry for relation ${element.id} (${routeId})`);
    continue;
  }

  // Use MultiLineString to avoid issues with ordering/gaps between way segments
  features.push({
    type: 'Feature',
    properties: {
      route_id: routeId,
      name:     ROUTE_NAMES[routeId] || routeId,
      color:    ROUTE_COLORS[routeId] || '#FFFFFF',
      osm_id:   element.id,
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: lines,
    },
  });

  // Count total coordinate points
  const totalPts = lines.reduce((s, l) => s + l.length, 0);
  console.log(`✓ ${routeId} (${ROUTE_NAMES[routeId]}): ${lines.length} segments, ${totalPts} points`);
}

// Load existing GeoJSON and replace features for the route IDs we just fetched
const existingGeoJson = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
const updatedRouteIds = new Set(features.map(f => f.properties.route_id));

// Keep existing features whose route_id we are NOT replacing
const keptFeatures = existingGeoJson.features.filter(
  f => !updatedRouteIds.has(f.properties.route_id)
);

const merged = {
  type: 'FeatureCollection',
  features: [...keptFeatures, ...features],
};

fs.writeFileSync(GEOJSON_PATH, JSON.stringify(merged, null, 2), 'utf8');
console.log(`\nWrote ${merged.features.length} features to ${GEOJSON_PATH}`);
merged.features.forEach(f => {
  const geomType = f.geometry.type;
  const pts = geomType === 'MultiLineString'
    ? f.geometry.coordinates.reduce((s, l) => s + l.length, 0)
    : f.geometry.coordinates.length;
  console.log(`  ${f.properties.route_id}: ${f.properties.name} (${geomType}, ${pts} pts)`);
});

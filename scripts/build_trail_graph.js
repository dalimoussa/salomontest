const fs = require('fs');
const path = require('path');

// Haversine formula for distance in meters between two [lng, lat] coordinates
function getDistanceMeters([lon1, lat1], [lon2, lat2]) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Approximate elevation lookup for Mt. Takao terrain based on known key elevations
// [lng, lat] -> elevation in meters
const ELEVATION_ANCHORS = [
  { coords: [139.2700, 35.6318], elevation: 201, name: '清滝駅' },
  { coords: [139.2605, 35.6322], elevation: 472, name: '高尾山駅' },
  { coords: [139.2515, 35.6268], elevation: 520, name: '薬王院' },
  { coords: [139.2437, 35.6252], elevation: 599, name: '高尾山頂' },
  { coords: [139.2635, 35.6295], elevation: 320, name: 'びわ滝' },
  { coords: [139.2350, 35.6380], elevation: 670, name: '城山' },
  { coords: [139.2150, 35.6420], elevation: 727, name: '景信山' },
  { coords: [139.1679, 35.6556], elevation: 857, name: '陣馬山' },
];

function estimateElevation([lng, lat]) {
  // Inverse-distance weighting from elevation anchors
  let totalWeight = 0;
  let weightedElevation = 0;

  for (const anchor of ELEVATION_ANCHORS) {
    const dist = getDistanceMeters([lng, lat], anchor.coords);
    if (dist < 10) return anchor.elevation;
    const weight = 1 / Math.pow(dist, 1.8);
    totalWeight += weight;
    weightedElevation += anchor.elevation * weight;
  }

  return Math.round(weightedElevation / totalWeight);
}

function buildGraph() {
  const trailsPath = path.join(__dirname, '..', 'public', 'data', 'takao-trails.geojson');
  const poisPath = path.join(__dirname, '..', 'public', 'data', 'takao-pois.geojson');
  const outPath = path.join(__dirname, '..', 'public', 'data', 'takao-trail-graph.json');

  const trailsData = JSON.parse(fs.readFileSync(trailsPath, 'utf-8'));
  const poisData = JSON.parse(fs.readFileSync(poisPath, 'utf-8'));

  const nodes = new Map(); // id -> { id, name, coordinates, elevationM }
  const edges = []; // { id, from, to, distanceM, elevationGainM, routeId, coordinates }

  // 1. Add POI nodes first as key named landmarks
  for (const f of poisData.features) {
    const coords = f.geometry.coordinates;
    const altNum = parseInt(f.properties.altitude.replace('m', ''), 10) || estimateElevation(coords);
    nodes.set(f.properties.id, {
      id: f.properties.id,
      name: f.properties.name,
      nameEn: f.properties.name_en || f.properties.name,
      coordinates: coords,
      elevationM: altNum,
      isLandmark: true,
      category: f.properties.category,
    });
  }

  // Helper to get or create junction node near a coordinate
  function getOrCreateNode(coords, routeId, pointIndex) {
    const toleranceM = 35; // Merge coordinates within 35m
    for (const node of nodes.values()) {
      if (getDistanceMeters(coords, node.coordinates) <= toleranceM) {
        return node.id;
      }
    }

    const id = `node_${routeId}_${pointIndex}_${Math.round(coords[0] * 10000)}_${Math.round(coords[1] * 10000)}`;
    const elevation = estimateElevation(coords);
    nodes.set(id, {
      id,
      name: `分岐点 (${routeId})`,
      nameEn: `Junction (${routeId})`,
      coordinates: coords,
      elevationM: elevation,
      isLandmark: false,
    });
    return id;
  }

  // 2. Process trail geometries and build segments
  let edgeCounter = 0;
  for (const feature of trailsData.features) {
    const routeId = feature.properties.route_id || 'unknown';
    const lines =
      feature.geometry.type === 'MultiLineString'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      if (line.length < 2) continue;

      // Sample key vertices along the line to form graph segments (every ~100m or at junctions)
      let segmentStartIdx = 0;
      let accumulatedDist = 0;

      for (let i = 1; i < line.length; i++) {
        const stepDist = getDistanceMeters(line[i - 1], line[i]);
        accumulatedDist += stepDist;

        const isLastPoint = i === line.length - 1;
        const isSampleStep = accumulatedDist >= 120;

        if (isSampleStep || isLastPoint) {
          const startCoords = line[segmentStartIdx];
          const endCoords = line[i];

          const fromNodeId = getOrCreateNode(startCoords, routeId, segmentStartIdx);
          const toNodeId = getOrCreateNode(endCoords, routeId, i);

          if (fromNodeId !== toNodeId) {
            const segCoords = line.slice(segmentStartIdx, i + 1);
            let segDist = 0;
            for (let k = 1; k < segCoords.length; k++) {
              segDist += getDistanceMeters(segCoords[k - 1], segCoords[k]);
            }

            const fromElev = nodes.get(fromNodeId).elevationM;
            const toElev = nodes.get(toNodeId).elevationM;
            const elevGain = Math.max(0, toElev - fromElev);

            const edgeId = `edge_${routeId}_${++edgeCounter}`;
            edges.push({
              id: edgeId,
              from: fromNodeId,
              to: toNodeId,
              distanceM: Math.round(segDist),
              elevationGainM: elevGain,
              routeId,
              coordinates: segCoords,
            });
          }

          segmentStartIdx = i;
          accumulatedDist = 0;
        }
      }
    }
  }

  // 3. Connect close POIs to nearest trail nodes so POIs are routable
  for (const poiNode of Array.from(nodes.values()).filter((n) => n.isLandmark)) {
    let nearestNode = null;
    let minDist = Infinity;

    for (const otherNode of nodes.values()) {
      if (otherNode.id === poiNode.id) continue;
      const dist = getDistanceMeters(poiNode.coordinates, otherNode.coordinates);
      if (dist < minDist && dist <= 200) {
        minDist = dist;
        nearestNode = otherNode;
      }
    }

    if (nearestNode) {
      edges.push({
        id: `poi_connector_${poiNode.id}_${nearestNode.id}`,
        from: poiNode.id,
        to: nearestNode.id,
        distanceM: Math.round(minDist),
        elevationGainM: Math.max(0, nearestNode.elevationM - poiNode.elevationM),
        routeId: 'connector',
        coordinates: [poiNode.coordinates, nearestNode.coordinates],
      });
    }
  }

  const graphPayload = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    nodeCount: nodes.size,
    edgeCount: edges.length,
    nodes: Array.from(nodes.values()),
    edges,
  };

  fs.writeFileSync(outPath, JSON.stringify(graphPayload, null, 2), 'utf-8');
  console.log(`Successfully generated Takao Trail Graph:`);
  console.log(`  - Nodes: ${nodes.size}`);
  console.log(`  - Edges: ${edges.length}`);
  console.log(`  - Output: ${outPath}`);
}

buildGraph();

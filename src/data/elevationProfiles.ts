// src/data/elevationProfiles.ts
// Precomputed elevation profile data (distanceKm vs elevationM) for each hiking course

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
  landmark?: string;
}

export interface RouteElevationProfile {
  routeId: string;
  minElevationM: number;
  maxElevationM: number;
  totalGainM: number;
  totalDistanceKm: number;
  points: ElevationPoint[];
}

export const ELEVATION_PROFILES: Record<string, RouteElevationProfile> = {
  // 1号路 (表参道) 3.8km, ↑399m
  route_1: {
    routeId: 'route_1',
    minElevationM: 201,
    maxElevationM: 599,
    totalGainM: 399,
    totalDistanceKm: 3.8,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '清滝駅' },
      { distanceKm: 0.5, elevationM: 250 },
      { distanceKm: 1.0, elevationM: 320 },
      { distanceKm: 1.5, elevationM: 395 },
      { distanceKm: 2.1, elevationM: 472, landmark: '高尾山駅' },
      { distanceKm: 2.5, elevationM: 495 },
      { distanceKm: 2.9, elevationM: 515, landmark: '浄心門' },
      { distanceKm: 3.2, elevationM: 520, landmark: '薬王院' },
      { distanceKm: 3.5, elevationM: 560 },
      { distanceKm: 3.8, elevationM: 599, landmark: '山頂' },
    ],
  },

  // 6号路 (びわ滝コース) 3.3km, ↑400m
  route_6: {
    routeId: 'route_6',
    minElevationM: 201,
    maxElevationM: 599,
    totalGainM: 400,
    totalDistanceKm: 3.3,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '清滝駅' },
      { distanceKm: 0.6, elevationM: 260 },
      { distanceKm: 1.1, elevationM: 320, landmark: 'びわ滝' },
      { distanceKm: 1.6, elevationM: 365 },
      { distanceKm: 2.2, elevationM: 410, landmark: '大山橋' },
      { distanceKm: 2.7, elevationM: 490, landmark: '飛び石' },
      { distanceKm: 3.0, elevationM: 550 },
      { distanceKm: 3.3, elevationM: 599, landmark: '山頂' },
    ],
  },

  // 稲荷山コース 3.1km, ↑401m
  route_2: {
    routeId: 'route_2',
    minElevationM: 205,
    maxElevationM: 599,
    totalGainM: 401,
    totalDistanceKm: 3.1,
    points: [
      { distanceKm: 0.0, elevationM: 205, landmark: '登山口' },
      { distanceKm: 0.7, elevationM: 290 },
      { distanceKm: 1.4, elevationM: 395, landmark: '展望東屋' },
      { distanceKm: 2.0, elevationM: 460 },
      { distanceKm: 2.6, elevationM: 510, landmark: '尾根分岐' },
      { distanceKm: 2.9, elevationM: 560 },
      { distanceKm: 3.1, elevationM: 599, landmark: '山頂' },
    ],
  },

  // 景信山縦走 8.5km, ↑727m
  route_3: {
    routeId: 'route_3',
    minElevationM: 520,
    maxElevationM: 727,
    totalGainM: 727,
    totalDistanceKm: 8.5,
    points: [
      { distanceKm: 0.0, elevationM: 599, landmark: '高尾山頂' },
      { distanceKm: 1.1, elevationM: 550, landmark: 'もみじ台' },
      { distanceKm: 2.4, elevationM: 530, landmark: '一丁平' },
      { distanceKm: 4.2, elevationM: 670, landmark: '小仏城山' },
      { distanceKm: 5.6, elevationM: 560, landmark: '小仏峠' },
      { distanceKm: 7.2, elevationM: 680 },
      { distanceKm: 8.5, elevationM: 727, landmark: '景信山頂' },
    ],
  },

  // 陣馬山縦走 20.0km, ↑857m
  route_4: {
    routeId: 'route_4',
    minElevationM: 520,
    maxElevationM: 857,
    totalGainM: 857,
    totalDistanceKm: 20.0,
    points: [
      { distanceKm: 0.0, elevationM: 599, landmark: '高尾山頂' },
      { distanceKm: 4.2, elevationM: 670, landmark: '城山' },
      { distanceKm: 8.5, elevationM: 727, landmark: '景信山' },
      { distanceKm: 12.0, elevationM: 690 },
      { distanceKm: 15.5, elevationM: 738, landmark: '明王峠' },
      { distanceKm: 18.0, elevationM: 790 },
      { distanceKm: 20.0, elevationM: 857, landmark: '陣馬山頂' },
    ],
  },
};

export function getElevationProfile(routeId: string): RouteElevationProfile {
  const aliasMap: Record<string, string> = {
    route_inariyama: 'route_2',
    inariyama: 'route_2',
    route_kagenobu: 'route_3',
    route_jinba: 'route_4',
  };
  const targetId = aliasMap[routeId] || routeId;
  return ELEVATION_PROFILES[targetId] || ELEVATION_PROFILES['route_1'];
}

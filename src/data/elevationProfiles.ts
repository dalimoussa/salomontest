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

  // 2号路 (霞台ループ) 0.9km, ↑50m
  route_2: {
    routeId: 'route_2',
    minElevationM: 450,
    maxElevationM: 480,
    totalGainM: 50,
    totalDistanceKm: 0.9,
    points: [
      { distanceKm: 0.0, elevationM: 472, landmark: '霞台北側入口' },
      { distanceKm: 0.3, elevationM: 480, landmark: '八王子JCT展望' },
      { distanceKm: 0.6, elevationM: 465, landmark: '南側林道' },
      { distanceKm: 0.9, elevationM: 472, landmark: '高尾山駅合流' },
    ],
  },

  // 3号路 (かつら林コース) 2.4km, ↑180m
  route_3: {
    routeId: 'route_3',
    minElevationM: 480,
    maxElevationM: 599,
    totalGainM: 180,
    totalDistanceKm: 2.4,
    points: [
      { distanceKm: 0.0, elevationM: 515, landmark: '浄心門分岐' },
      { distanceKm: 0.7, elevationM: 510, landmark: 'かしき谷園地' },
      { distanceKm: 1.5, elevationM: 530, landmark: 'かつら巨木林' },
      { distanceKm: 2.0, elevationM: 560 },
      { distanceKm: 2.4, elevationM: 599, landmark: '山頂直下合流' },
    ],
  },

  // 4号路 (吊り橋・みやま橋コース) 1.5km, ↑150m
  route_4: {
    routeId: 'route_4',
    minElevationM: 470,
    maxElevationM: 599,
    totalGainM: 150,
    totalDistanceKm: 1.5,
    points: [
      { distanceKm: 0.0, elevationM: 515, landmark: '浄心門分岐' },
      { distanceKm: 0.5, elevationM: 485, landmark: 'みやま橋' },
      { distanceKm: 1.0, elevationM: 520, landmark: 'ブナ原生林' },
      { distanceKm: 1.5, elevationM: 599, landmark: '山頂下合流点' },
    ],
  },

  // 5号路 (山頂ループ・江川杉コース) 0.9km, ↑40m
  route_5: {
    routeId: 'route_5',
    minElevationM: 570,
    maxElevationM: 599,
    totalGainM: 40,
    totalDistanceKm: 0.9,
    points: [
      { distanceKm: 0.0, elevationM: 580, landmark: '5号路入口' },
      { distanceKm: 0.3, elevationM: 585, landmark: '江川杉' },
      { distanceKm: 0.6, elevationM: 580, landmark: '北側巻き道' },
      { distanceKm: 0.9, elevationM: 580, landmark: '周回完了' },
    ],
  },

  // 稲荷山コース 3.1km, ↑401m
  route_inariyama: {
    routeId: 'route_inariyama',
    minElevationM: 205,
    maxElevationM: 599,
    totalGainM: 401,
    totalDistanceKm: 3.1,
    points: [
      { distanceKm: 0.0, elevationM: 205, landmark: '稲荷山登山口' },
      { distanceKm: 0.6, elevationM: 270, landmark: '旭稲荷神社' },
      { distanceKm: 1.4, elevationM: 395, landmark: '展望東屋' },
      { distanceKm: 2.2, elevationM: 460 },
      { distanceKm: 2.7, elevationM: 510, landmark: '尾根見晴らし' },
      { distanceKm: 3.1, elevationM: 599, landmark: '山頂' },
    ],
  },

  // 高尾山・陣馬山縦走コース 15.3km, ↑857m
  route_jinba: {
    routeId: 'route_jinba',
    minElevationM: 520,
    maxElevationM: 857,
    totalGainM: 857,
    totalDistanceKm: 15.3,
    points: [
      { distanceKm: 0.0, elevationM: 599, landmark: '高尾山頂' },
      { distanceKm: 1.1, elevationM: 550, landmark: 'もみじ台' },
      { distanceKm: 2.4, elevationM: 530, landmark: '一丁平' },
      { distanceKm: 4.2, elevationM: 670, landmark: '小仏城山' },
      { distanceKm: 5.6, elevationM: 548, landmark: '小仏峠' },
      { distanceKm: 7.2, elevationM: 727, landmark: '景信山' },
      { distanceKm: 11.8, elevationM: 738, landmark: '明王峠' },
      { distanceKm: 15.3, elevationM: 857, landmark: '陣馬山頂' },
    ],
  },

  // ─── 8 Surrounding Trail Running Courses ─────────────────────────
  // 権現平往復トレイル 11.0km, ↑520m
  trail_gongen: {
    routeId: 'trail_gongen',
    minElevationM: 201,
    maxElevationM: 580,
    totalGainM: 520,
    totalDistanceKm: 11.0,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '高尾山口駅' },
      { distanceKm: 2.8, elevationM: 380 },
      { distanceKm: 5.5, elevationM: 580, landmark: '権現平' },
      { distanceKm: 8.2, elevationM: 390 },
      { distanceKm: 11.0, elevationM: 201, landmark: '高尾山口駅' },
    ],
  },

  // 南高尾東尾根トレイル 5.0km, ↑280m
  trail_minamitakao: {
    routeId: 'trail_minamitakao',
    minElevationM: 201,
    maxElevationM: 410,
    totalGainM: 280,
    totalDistanceKm: 5.0,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '高尾山口駅' },
      { distanceKm: 1.8, elevationM: 320 },
      { distanceKm: 3.2, elevationM: 410, landmark: '草戸山' },
      { distanceKm: 4.4, elevationM: 290 },
      { distanceKm: 5.0, elevationM: 201, landmark: '高尾山口駅' },
    ],
  },

  // 三沢峠周回トレイル 10.0km, ↑490m
  trail_misawa: {
    routeId: 'trail_misawa',
    minElevationM: 201,
    maxElevationM: 560,
    totalGainM: 490,
    totalDistanceKm: 10.0,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '高尾山口駅' },
      { distanceKm: 2.5, elevationM: 360 },
      { distanceKm: 5.0, elevationM: 560, landmark: '三沢峠' },
      { distanceKm: 7.2, elevationM: 420, landmark: '津久井湖眺望' },
      { distanceKm: 8.8, elevationM: 320 },
      { distanceKm: 10.0, elevationM: 201, landmark: '高尾山口駅' },
    ],
  },

  // 北高尾アプローチトレイル 4.0km, ↑190m
  trail_kitaapproach: {
    routeId: 'trail_kitaapproach',
    minElevationM: 205,
    maxElevationM: 350,
    totalGainM: 190,
    totalDistanceKm: 4.0,
    points: [
      { distanceKm: 0.0, elevationM: 205, landmark: '北高尾登山口' },
      { distanceKm: 1.5, elevationM: 260 },
      { distanceKm: 2.8, elevationM: 350, landmark: '駒木野林道' },
      { distanceKm: 4.0, elevationM: 340, landmark: '北高尾山稜アプローチ' },
    ],
  },

  // 太鼓曲輪尾根トレイル 6.0km, ↑320m
  trail_taiko: {
    routeId: 'trail_taiko',
    minElevationM: 201,
    maxElevationM: 460,
    totalGainM: 320,
    totalDistanceKm: 6.0,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '高尾山口駅' },
      { distanceKm: 1.5, elevationM: 290 },
      { distanceKm: 3.0, elevationM: 380, landmark: '八王子城跡' },
      { distanceKm: 4.2, elevationM: 460, landmark: '太鼓曲輪尾根' },
      { distanceKm: 6.0, elevationM: 201, landmark: '周回完了' },
    ],
  },

  // 小下沢林道トレイル 7.0km, ↑260m
  trail_kogezawa: {
    routeId: 'trail_kogezawa',
    minElevationM: 201,
    maxElevationM: 430,
    totalGainM: 260,
    totalDistanceKm: 7.0,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '高尾山口駅' },
      { distanceKm: 2.2, elevationM: 290, landmark: '林道分岐' },
      { distanceKm: 4.5, elevationM: 430, landmark: '小下沢キャンプ場跡' },
      { distanceKm: 6.0, elevationM: 310 },
      { distanceKm: 7.0, elevationM: 201, landmark: '周回完了' },
    ],
  },

  // 城山天狗トレイル 16.0km, ↑780m
  trail_tengu: {
    routeId: 'trail_tengu',
    minElevationM: 280,
    maxElevationM: 670,
    totalGainM: 780,
    totalDistanceKm: 16.0,
    points: [
      { distanceKm: 0.0, elevationM: 280, landmark: 'トレイル起点' },
      { distanceKm: 3.5, elevationM: 520 },
      { distanceKm: 6.0, elevationM: 670, landmark: '小仏城山天狗像' },
      { distanceKm: 9.5, elevationM: 620, landmark: '奥高尾主稜線' },
      { distanceKm: 13.0, elevationM: 450 },
      { distanceKm: 16.0, elevationM: 280, landmark: '16km完走' },
    ],
  },

  // 明王峠相模湖トレイル 10.0km, ↑450m
  trail_meio: {
    routeId: 'trail_meio',
    minElevationM: 205,
    maxElevationM: 738,
    totalGainM: 450,
    totalDistanceKm: 10.0,
    points: [
      { distanceKm: 0.0, elevationM: 738, landmark: '明王峠' },
      { distanceKm: 2.5, elevationM: 620 },
      { distanceKm: 5.0, elevationM: 450, landmark: '相模湖眺望' },
      { distanceKm: 7.5, elevationM: 320, landmark: '与瀬神社' },
      { distanceKm: 10.0, elevationM: 205, landmark: 'JR相模湖駅' },
    ],
  },

  // ─── The 4 Specific Takao Courses ─────────────────────────
  // いろはの森コース 1.5km, ↑280m
  route_iroha: {
    routeId: 'route_iroha',
    minElevationM: 320,
    maxElevationM: 599,
    totalGainM: 280,
    totalDistanceKm: 1.5,
    points: [
      { distanceKm: 0.0, elevationM: 320, landmark: '日影沢キャンプ場' },
      { distanceKm: 0.4, elevationM: 390 },
      { distanceKm: 0.8, elevationM: 470, landmark: 'いろは48文字学術林' },
      { distanceKm: 1.2, elevationM: 535, landmark: '4号路合流点' },
      { distanceKm: 1.5, elevationM: 599, landmark: '高尾山頂' },
    ],
  },

  // 蛇滝コース 1.5km, ↑232m
  route_jataki: {
    routeId: 'route_jataki',
    minElevationM: 240,
    maxElevationM: 472,
    totalGainM: 232,
    totalDistanceKm: 1.5,
    points: [
      { distanceKm: 0.0, elevationM: 240, landmark: '蛇滝口・小仏川' },
      { distanceKm: 0.5, elevationM: 310, landmark: '蛇滝水行道場' },
      { distanceKm: 0.9, elevationM: 395, landmark: 'つづら折り見晴らし' },
      { distanceKm: 1.3, elevationM: 450 },
      { distanceKm: 1.5, elevationM: 472, landmark: '霞台・2号路合流' },
    ],
  },

  // 小仏城山コース 4.5km, ↑380m
  route_kobotoke: {
    routeId: 'route_kobotoke',
    minElevationM: 290,
    maxElevationM: 670,
    totalGainM: 380,
    totalDistanceKm: 4.5,
    points: [
      { distanceKm: 0.0, elevationM: 290, landmark: '小仏バス停' },
      { distanceKm: 1.2, elevationM: 420, landmark: '小仏峠登山口' },
      { distanceKm: 2.2, elevationM: 548, landmark: '小仏峠' },
      { distanceKm: 3.2, elevationM: 670, landmark: '小仏城山山頂' },
      { distanceKm: 3.8, elevationM: 550, landmark: '一丁平展望デッキ' },
      { distanceKm: 4.2, elevationM: 550, landmark: 'もみじ台' },
      { distanceKm: 4.5, elevationM: 599, landmark: '高尾山頂' },
    ],
  },

  // もみじ台・一丁平コース 2.5km, ↑150m
  route_momijidai: {
    routeId: 'route_momijidai',
    minElevationM: 530,
    maxElevationM: 599,
    totalGainM: 150,
    totalDistanceKm: 2.5,
    points: [
      { distanceKm: 0.0, elevationM: 599, landmark: '高尾山頂' },
      { distanceKm: 0.6, elevationM: 550, landmark: 'もみじ台（細田屋茶屋）' },
      { distanceKm: 1.4, elevationM: 530, landmark: '一丁平千本桜デッキ' },
      { distanceKm: 2.0, elevationM: 550, landmark: '北側巻き道' },
      { distanceKm: 2.5, elevationM: 599, landmark: '山頂周回完了' },
    ],
  },

  // 全コース一括パノラマ表示 28.5km
  all: {
    routeId: 'all',
    minElevationM: 201,
    maxElevationM: 855,
    totalGainM: 855,
    totalDistanceKm: 28.5,
    points: [
      { distanceKm: 0.0, elevationM: 201, landmark: '清滝駅 (山麓)' },
      { distanceKm: 3.8, elevationM: 599, landmark: '高尾山頂' },
      { distanceKm: 7.2, elevationM: 670, landmark: '小仏城山' },
      { distanceKm: 11.5, elevationM: 727, landmark: '景信山' },
      { distanceKm: 18.5, elevationM: 855, landmark: '陣馬山頂' },
    ],
  },


};

export function getElevationProfile(routeId: string): RouteElevationProfile {
  const aliasMap: Record<string, string> = {
    inariyama: 'route_inariyama',
    all_routes: 'all',
  };
  const targetId = aliasMap[routeId] || routeId;
  return ELEVATION_PROFILES[targetId] || ELEVATION_PROFILES['route_1'];
}


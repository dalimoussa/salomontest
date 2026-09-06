// src/data/routeWaypoints.ts
// Sequenced numbered waypoints along each hiking course matching the client's reference style

export interface RouteWaypoint {
  seq: number;
  id: string;
  name: string;
  nameEn: string;
  nameZh?: string;
  altitude: string;
  elevationM: number;
  coordinates: [number, number]; // [lng, lat]
  description: string;
  isLandmark: boolean;
}

export const ROUTE_WAYPOINTS: Record<string, RouteWaypoint[]> = {
  // 1号路 (表参道)
  route_1: [
    {
      seq: 1,
      id: 'cable_kiyotaki',
      name: '清滝駅（登山口）',
      nameEn: 'Kiyotaki Base',
      nameZh: '清泷站（登山口）',
      altitude: '201m',
      elevationM: 201,
      coordinates: [139.2700, 35.6318],
      description: 'ケーブルカー・リフト山麓駅。売店やトイレが揃う出発地点。',
      isLandmark: true,
    },
    {
      seq: 2,
      id: 'cable_takaosan',
      name: '高尾山駅・霞台',
      nameEn: 'Takaosan Station',
      nameZh: '高尾山站・霞台',
      altitude: '472m',
      elevationM: 472,
      coordinates: [139.2605, 35.6322],
      description: '都心方面を一望する霞台展望台とビアマウント。',
      isLandmark: true,
    },
    {
      seq: 3,
      id: 'teahouse_yakuo',
      name: '権現茶屋・浄心門',
      nameEn: 'Gongen Tea House',
      nameZh: '权现茶屋・净心门',
      altitude: '515m',
      elevationM: 515,
      coordinates: [139.2525, 35.6272],
      description: '名物ごま団子と天狗伝説の宿る浄心門。男坂・女坂の合流点。',
      isLandmark: false,
    },
    {
      seq: 4,
      id: 'yakuoin',
      name: '薬王院 本堂',
      nameEn: 'Yakuo-in Temple',
      nameZh: '药王院 本堂',
      altitude: '520m',
      elevationM: 520,
      coordinates: [139.2515, 35.6268],
      description: '天平16年(744年)創建の古刹。飯縄大権現と天狗像を奉るパワースポット。',
      isLandmark: true,
    },
    {
      seq: 5,
      id: 'takao_summit',
      name: '高尾山山頂（大見晴台）',
      nameEn: 'Mt. Takao Summit',
      nameZh: '高尾山山顶（大见晴台）',
      altitude: '599m',
      elevationM: 599,
      coordinates: [139.2435, 35.6251],
      description: '標高599m。関東富士見百景。ビジターセンターや売店、広場が広がる。',
      isLandmark: true,
    },
  ],

  // 6号路 (びわ滝コース)
  route_6: [
    {
      seq: 1,
      id: 'cable_kiyotaki',
      name: '清滝駅（登山口）',
      nameEn: 'Kiyotaki Base',
      altitude: '201m',
      elevationM: 201,
      coordinates: [139.2700, 35.6318],
      description: 'コース入口。沢沿い自然歩道へ入ります。',
      isLandmark: true,
    },
    {
      seq: 2,
      id: 'biwataki',
      name: 'びわ滝',
      nameEn: 'Biwa Waterfall',
      altitude: '320m',
      elevationM: 320,
      coordinates: [139.2635, 35.6295],
      description: '修験道の滝行道場。清涼感ある水音が響く名所。',
      isLandmark: true,
    },
    {
      seq: 3,
      id: 'oyama_bridge',
      name: '大山橋（休憩所）',
      nameEn: 'Oyama Bridge',
      altitude: '410m',
      elevationM: 410,
      coordinates: [139.2550, 35.6275],
      description: '沢の中間地点の木橋。ベンチがあり一息つけるポイント。',
      isLandmark: false,
    },
    {
      seq: 4,
      id: 'stepping_stones',
      name: '飛び石セクション',
      nameEn: 'Stepping Stones',
      altitude: '490m',
      elevationM: 490,
      coordinates: [139.2480, 35.6260],
      description: 'せせらぎの中を石伝いに登る名物ポイント。滑りやすいので足元注意。',
      isLandmark: false,
    },
    {
      seq: 5,
      id: 'summit',
      name: '高尾山頂',
      nameEn: 'Mt. Takao Summit',
      altitude: '599m',
      elevationM: 599,
      coordinates: [139.2437, 35.6252],
      description: '最後の木製階段を登りきると開ける山頂広場。',
      isLandmark: true,
    },
  ],

  // 稲荷山コース
  route_2: [
    {
      seq: 1,
      id: 'inariyama_start',
      name: '稲荷山登山口',
      nameEn: 'Inariyama Trailhead',
      altitude: '205m',
      elevationM: 205,
      coordinates: [139.2690, 35.6315],
      description: '清滝駅左脇から南尾根へ登る自然山道。',
      isLandmark: true,
    },
    {
      seq: 2,
      id: 'inariyama_view',
      name: '稲荷山展望東屋',
      nameEn: 'Inariyama Gazebo',
      altitude: '395m',
      elevationM: 395,
      coordinates: [139.2580, 35.6285],
      description: '八王子市街と南高尾山稜を望む見晴らし台。',
      isLandmark: true,
    },
    {
      seq: 3,
      id: 'ridge_junction',
      name: '尾根分岐',
      nameEn: 'Ridge Junction',
      altitude: '510m',
      elevationM: 510,
      coordinates: [139.2490, 35.6258],
      description: '山頂直下の急登階段へ続く分岐点。',
      isLandmark: false,
    },
    {
      seq: 4,
      id: 'summit',
      name: '高尾山頂',
      nameEn: 'Mt. Takao Summit',
      altitude: '599m',
      elevationM: 599,
      coordinates: [139.2437, 35.6252],
      description: '標高599mゴール地点。',
      isLandmark: true,
    },
  ],

  // 景信山縦走
  route_3: [
    {
      seq: 1,
      id: 'summit',
      name: '高尾山頂（出発）',
      nameEn: 'Takao Summit',
      altitude: '599m',
      elevationM: 599,
      coordinates: [139.2437, 35.6252],
      description: '奥高尾縦走路の起点。西側へ進路をとります。',
      isLandmark: true,
    },
    {
      seq: 2,
      id: 'momijidai',
      name: 'もみじ台',
      nameEn: 'Momijidai',
      altitude: '550m',
      elevationM: 550,
      coordinates: [139.2390, 35.6265],
      description: '秋の紅葉が美しく富士山が正面に見える茶屋。',
      isLandmark: false,
    },
    {
      seq: 3,
      id: 'icchodaira',
      name: '一丁平展望デッキ',
      nameEn: 'Icchodaira Deck',
      altitude: '530m',
      elevationM: 530,
      coordinates: [139.2310, 35.6290],
      description: '千本桜で有名な大型展望デッキ。トイレ完備。',
      isLandmark: true,
    },
    {
      seq: 4,
      id: 'shiroyama',
      name: '城山（小仏城山）',
      nameEn: 'Mt. Shiroyama',
      altitude: '670m',
      elevationM: 670,
      coordinates: [139.2220, 35.6340],
      description: '巨大な天狗の木彫りと名物大盛りかき氷・なめこ汁。',
      isLandmark: true,
    },
    {
      seq: 5,
      id: 'kagenobu',
      name: '景信山（山頂）',
      nameEn: 'Mt. Kagenobuyama',
      altitude: '727m',
      elevationM: 727,
      coordinates: [139.2150, 35.6420],
      description: '標高727m。関東平野から東京湾まで見渡せる絶景パノラマ。',
      isLandmark: true,
    },
  ],

  // 陣馬山縦走
  route_4: [
    {
      seq: 1,
      id: 'summit',
      name: '高尾山頂（出発）',
      nameEn: 'Takao Summit',
      altitude: '599m',
      elevationM: 599,
      coordinates: [139.2437, 35.6252],
      description: '20km大縦走ロングトレイルのスタート。',
      isLandmark: true,
    },
    {
      seq: 2,
      id: 'shiroyama',
      name: '小仏城山',
      nameEn: 'Mt. Shiroyama',
      altitude: '670m',
      elevationM: 670,
      coordinates: [139.2220, 35.6340],
      description: '第1チェックポイント。水分とエネルギー補給。',
      isLandmark: true,
    },
    {
      seq: 3,
      id: 'kagenobu',
      name: '景信山',
      nameEn: 'Mt. Kagenobu',
      altitude: '727m',
      elevationM: 727,
      coordinates: [139.2150, 35.6420],
      description: '第2チェックポイント。本格的なアップダウンが続きます。',
      isLandmark: true,
    },
    {
      seq: 4,
      id: 'myootoge',
      name: '明王峠',
      nameEn: 'Myoo Pass',
      altitude: '738m',
      elevationM: 738,
      coordinates: [139.1850, 35.6510],
      description: '陣馬山直前の峠茶屋。相模湖方面への分岐。',
      isLandmark: false,
    },
    {
      seq: 5,
      id: 'jinba_summit',
      name: '陣馬山頂（白馬像）',
      nameEn: 'Mt. Jinba Summit',
      altitude: '857m',
      elevationM: 857,
      coordinates: [139.1679, 35.6556],
      description: '標高857m。シンボルの白馬像が佇む360度の大草原パノラマ。',
      isLandmark: true,
    },
  ],
};

export function getWaypointsForRoute(routeId: string): RouteWaypoint[] {
  const aliasMap: Record<string, string> = {
    route_inariyama: 'route_2',
    inariyama: 'route_2',
    route_kagenobu: 'route_3',
    route_jinba: 'route_4',
  };
  const targetId = aliasMap[routeId] || routeId;
  return ROUTE_WAYPOINTS[targetId] || ROUTE_WAYPOINTS['route_1'];
}

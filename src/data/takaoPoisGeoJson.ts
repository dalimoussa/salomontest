import type { FeatureCollection } from 'geojson';

export const TAKAO_POIS_GEOJSON: FeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "summit",
        "name": "高尾山頂",
        "name_en": "Mt. Takao Summit",
        "name_zh": "高尾山顶",
        "altitude": "599m",
        "category": "summit",
        "icon": "mountain",
        "description": "展望台から富士山や丹沢山塊のパノラマが広がります。十三州大見晴台。",
        "status": "開放中",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2437, 35.6252]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "yakuoin",
        "name": "薬王院",
        "name_en": "Yakuo-in Temple",
        "name_zh": "药王院",
        "altitude": "520m",
        "category": "temple",
        "icon": "shrine",
        "description": "天平16年(744年)創建の古刹。飯縄大権現を奉り天狗信仰で有名です。",
        "status": "開門中 (~16:30)",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2515, 35.6268]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "cable_kiyotaki",
        "name": "ケーブルカー 清滝駅",
        "name_en": "Kiyotaki Station (Cable Car)",
        "name_zh": "缆车 清泷站",
        "altitude": "201m",
        "category": "transit",
        "icon": "cablecar",
        "description": "日本一の急勾配(31度18分)を誇るケーブルカーの山麓駅。始発8:00〜終発17:45。",
        "status": "通常運行中 (15分間隔)",
        "statusColor": "#00C8FF"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2700, 35.6318]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "cable_takaosan",
        "name": "ケーブルカー 高尾山駅",
        "name_en": "Takaosan Station (Cable Car)",
        "name_zh": "缆车 高尾山站",
        "altitude": "472m",
        "category": "transit",
        "icon": "cablecar",
        "description": "展望レストラン「高尾山ビアマウント」や売店・さる園が隣接しています。",
        "status": "通常運行中",
        "statusColor": "#00C8FF"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2605, 35.6322]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "teahouse_summit",
        "name": "山頂茶屋・大見晴亭",
        "name_en": "Summit Tea House",
        "name_zh": "山顶茶屋",
        "altitude": "595m",
        "category": "teahouse",
        "icon": "coffee",
        "description": "名物とろろそば、おでん、甘酒。山頂広場すぐ。",
        "status": "営業中 (~16:30)",
        "statusColor": "#FACC15"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2432, 35.6248]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "teahouse_yakuo",
        "name": "権現茶屋",
        "name_en": "Gongen Tea House",
        "name_zh": "权现茶屋",
        "altitude": "515m",
        "category": "teahouse",
        "icon": "coffee",
        "description": "名物ごま団子、天狗ラーメン。薬王院山門前。",
        "status": "営業中 (~16:00)",
        "statusColor": "#FACC15"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2525, 35.6272]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "biwataki",
        "name": "びわ滝",
        "name_en": "Biwa Waterfall",
        "name_zh": "琵琶瀑布",
        "altitude": "320m",
        "category": "scenic",
        "icon": "water",
        "description": "6号路の中間地点にある修行の滝。清涼感あふれる沢沿いの名所。",
        "status": "見学可",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2635, 35.6295]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "parking_kiyotaki",
        "name": "清滝駅 駐車場",
        "name_en": "Kiyotaki Parking",
        "name_zh": "清泷站 停车场",
        "altitude": "200m",
        "category": "facility",
        "icon": "parking",
        "description": "八王子市営山麓駐車場・民間駐車場。収容約250台。",
        "status": "空あり",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2715, 35.6310]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "toilet_summit",
        "name": "山頂公衆トイレ",
        "name_en": "Summit Restroom",
        "name_zh": "山顶洗手间",
        "altitude": "595m",
        "category": "facility",
        "icon": "toilet",
        "description": "バリアフリートイレ併設、暖房便座・ベビーベッド完備。",
        "status": "利用可（清潔）",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2442, 35.6250]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "toilet_kiyotaki",
        "name": "清滝駅前トイレ",
        "name_en": "Kiyotaki Station Restroom",
        "name_zh": "清泷站前洗手间",
        "altitude": "201m",
        "category": "facility",
        "icon": "toilet",
        "description": "ケーブルカー清滝駅改札横。大型公衆トイレ（バリアフリー対応）。",
        "status": "利用可",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2692, 35.6316]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "toilet_kasumidai",
        "name": "霞台展望トイレ",
        "name_en": "Kasumidai Restroom",
        "name_zh": "霞台展望洗手间",
        "altitude": "472m",
        "category": "facility",
        "icon": "toilet",
        "description": "ケーブルカー高尾山駅すぐ、ビアマウント下。洋式・多目的トイレ完備。",
        "status": "利用可",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2602, 35.6321]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "teahouse_momiji",
        "name": "細田屋（もみじ台富士見茶屋）",
        "name_en": "Hosodaya (Momijidai Teahouse)",
        "name_zh": "细田屋（红叶台富士见茶屋）",
        "altitude": "550m",
        "category": "teahouse",
        "icon": "coffee",
        "description": "名物手打ちとろろそば、なめこ汁。富士山を一望できる屋外ベンチ。",
        "status": "営業中 (~16:00)",
        "statusColor": "#FACC15"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2372, 35.6241]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "teahouse_shiroyama",
        "name": "城山茶屋・春美茶屋（小仏城山）",
        "name_en": "Shiroyama Teahouse",
        "name_zh": "城山茶社（小佛城山）",
        "altitude": "670m",
        "category": "teahouse",
        "icon": "coffee",
        "description": "名物巨大かき氷、温かいなめこ汁。小仏城山山頂の芝生広場すぐ。",
        "status": "営業中 (~15:30)",
        "statusColor": "#FACC15"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2225, 35.6305]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "toilet_itchodaira",
        "name": "一丁平 公衆トイレ",
        "name_en": "Itchodaira Restroom",
        "name_zh": "一丁目平洗手间",
        "altitude": "530m",
        "category": "facility",
        "icon": "toilet",
        "description": "奥高尾縦走路の貴重な水洗バイオトイレ。展望デッキ手前。",
        "status": "利用可",
        "statusColor": "#4ADE80"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [139.2310, 35.6270]
      }
    }
  ]
};

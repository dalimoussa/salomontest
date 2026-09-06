// scripts/fetch_surrounding_trails.js
const fs = require('fs');
const path = require('path');

const TRAILS = [
  {
    id: 'trail_gongen',
    name: '権現平往復トレイル',
    filename: 'gongen_20191104.gpx',
    distanceKm: 11.0,
    durationMin: 220,
    difficulty: 'intermediate',
    difficultyRating: 2,
    crowdWeekday: 1,
    crowdWeekend: 2,
    color: '#38BDF8',
    features: ['高尾マナーズ推奨', '権現平展望', '静かな尾根道', 'トレラン好適'],
    description: '南高尾山稜の権現平を往復する自然豊かなトレイル。適度な起伏と静寂が魅力のコース。',
  },
  {
    id: 'trail_minamitakao',
    name: '南高尾東尾根トレイル',
    filename: 'minamitakao_20191115.gpx',
    distanceKm: 5.0,
    durationMin: 110,
    difficulty: 'beginner',
    difficultyRating: 1,
    crowdWeekday: 1,
    crowdWeekend: 2,
    color: '#4ADE80',
    features: ['高尾マナーズ推奨', '東尾根ルート', '高尾山口アクセス', 'ショートトレイル'],
    description: '南高尾の東尾根を巡るショートトレイル。駅からのアクセスも良く、手軽に山深い雰囲気を味わえます。',
  },
  {
    id: 'trail_misawa',
    name: '三沢峠周回トレイル',
    filename: 'misawa_20191115.gpx',
    distanceKm: 10.0,
    durationMin: 200,
    difficulty: 'intermediate',
    difficultyRating: 2,
    crowdWeekday: 1,
    crowdWeekend: 2,
    color: '#A78BFA',
    features: ['高尾マナーズ推奨', '三沢峠周回', '草戸山展望', '津久井湖眺望'],
    description: '三沢峠から草戸山を周回する本格コース。津久井湖の眺望と気持ちの良いアップダウンが続きます。',
  },
  {
    id: 'trail_kitaapproach',
    name: '北高尾アプローチトレイル',
    filename: 'kitaapproach_20191115.gpx',
    distanceKm: 4.0,
    durationMin: 90,
    difficulty: 'beginner',
    difficultyRating: 1,
    crowdWeekday: 1,
    crowdWeekend: 1,
    color: '#2DD4BF',
    features: ['高尾マナーズ推奨', '北高尾導入', '自然林歩道', '混雑回避'],
    description: '北高尾山稜へのアプローチトレイル。メインルートの混雑を避け、静かな山歩きをスタートできます。',
  },
  {
    id: 'trail_taiko',
    name: '太鼓曲輪尾根トレイル',
    filename: 'taiko_20200717.gpx',
    distanceKm: 6.0,
    durationMin: 130,
    difficulty: 'intermediate',
    difficultyRating: 2,
    crowdWeekday: 1,
    crowdWeekend: 2,
    color: '#F472B6',
    features: ['高尾マナーズ推奨', '歴史遺構', '八王子城跡連動', '尾根歩き'],
    description: '北高尾の太鼓曲輪尾根を辿る歴史情緒あふれるルート。八王子城跡の地形を体感できます。',
  },
  {
    id: 'trail_kogezawa',
    name: '小下沢林道トレイル',
    filename: 'kogezawa_20200629.gpx',
    distanceKm: 7.0,
    durationMin: 140,
    difficulty: 'intermediate',
    difficultyRating: 2,
    crowdWeekday: 1,
    crowdWeekend: 1,
    color: '#FBBF24',
    features: ['高尾マナーズ推奨', '小下沢清流', 'キャンプ場跡', '緩やか林道'],
    description: '小下沢沿いの木漏れ日あふれる林道トレイル。清流のせせらぎを聞きながら走れるフラット主体のコース。',
  },
  {
    id: 'trail_tengu',
    name: '城山天狗トレイル',
    filename: 'tengu_20211010.gpx',
    distanceKm: 16.0,
    durationMin: 320,
    difficulty: 'advanced',
    difficultyRating: 3,
    crowdWeekday: 2,
    crowdWeekend: 3,
    color: '#E8002D',
    features: ['高尾マナーズ推奨', '小仏城山連動', '16kmロング走', '十分な補給必要'],
    description: '城山から広大な南・北山稜をつなぐ16kmの本格山岳トレイル。持久力と補給計画が必須の上級者コース。',
  },
  {
    id: 'trail_meio',
    name: '明王峠相模湖トレイル',
    filename: 'meio_20191115.gpx',
    distanceKm: 10.0,
    durationMin: 210,
    difficulty: 'intermediate',
    difficultyRating: 2,
    crowdWeekday: 1,
    crowdWeekend: 2,
    color: '#FB923C',
    features: ['高尾マナーズ推奨', '明王峠茶屋', '相模湖駅下山', '縦走エスケープ'],
    description: '主稜線の明王峠から相模湖方面へと抜ける爽快トレイル。下山後は相模湖駅からスムーズに帰路につけます。',
  },
];

function parseGpxCoordinates(gpxText) {
  const coords = [];
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"(?:\s*>|>[\s\S]*?<\/trkpt>)/g;
  let match;
  while ((match = trkptRegex.exec(gpxText)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      coords.push([lon, lat]);
    }
  }
  return coords;
}

// Simple douglas-peucker or interval downsampling if points are overly dense
function downsample(coords, maxPoints = 500) {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const sampled = [];
  for (let i = 0; i < coords.length; i += step) {
    sampled.push(coords[i]);
  }
  if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
    sampled.push(coords[coords.length - 1]);
  }
  return sampled;
}

async function main() {
  console.log('Fetching surrounding trails GPX from takao-trail-manners.jp...');
  const features = [];

  for (const t of TRAILS) {
    const url = `https://takao-trail-manners.jp/gpx/${t.filename}`;
    try {
      console.log(`Downloading ${t.name} (${t.filename})...`);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
      }
      const gpx = await res.text();
      const coords = parseGpxCoordinates(gpx);
      console.log(`  Parsed ${coords.length} points.`);
      const cleanCoords = downsample(coords, 600);

      features.push({
        type: 'Feature',
        properties: {
          route_id: t.id,
          name: t.name,
          category: 'surrounding_trail',
          difficulty: t.difficulty,
          difficultyRating: t.difficultyRating,
          crowdWeekday: t.crowdWeekday,
          crowdWeekend: t.crowdWeekend,
          distanceKm: t.distanceKm,
          durationMin: t.durationMin,
          color: t.color,
          sourceAttribution: '出典: 高尾マナーズ (https://takao-trail-manners.jp)',
          features: t.features,
          description: t.description,
        },
        geometry: {
          type: 'LineString',
          coordinates: cleanCoords,
        },
      });
    } catch (err) {
      console.error(`Error processing ${t.name}:`, err.message);
    }
  }

  const geoJson = {
    type: 'FeatureCollection',
    features,
  };

  const outputPath = path.join(__dirname, '..', 'public', 'data', 'surrounding-trails.geojson');
  fs.writeFileSync(outputPath, JSON.stringify(geoJson, null, 2), 'utf8');
  console.log(`Successfully generated ${outputPath} with ${features.length} trails!`);
}

main().catch(console.error);

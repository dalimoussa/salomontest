'use client';

import React, { useState, useId } from 'react';
import { X, TrendingUp, Compass, Award, Footprints, ChevronRight, Mountain, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';
import { ROUTES } from '@/data/routes';

// Course profile definitions for All-Course Elevation Hub
interface CourseProfile {
  id: string;
  badgeNum: number;
  name: string;
  name_en: string;
  name_zh: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  distanceKm: number;
  elevationGainM: number;
  maxAltitudeM: number;
  difficultyStars: number;
  difficultyLabel: string;
  difficultyLabel_en: string;
  difficultyLabel_zh: string;
  recommendedShoe: string;
  recommendedShoeDesc: string;
  // Normalized points for multi-peak SVG silhouette: [km, altitudeM]
  points: [number, number][];
}

// 7+1 Trail Running Courses (matching Image 1 "TAKAO TRAIL HUB")
const TRAIL_RUN_PROFILES: CourseProfile[] = [
  {
    id: 'trail_tengu',
    badgeNum: 1,
    name: '城山天狗トレイル',
    name_en: 'JOHYAMA TENGU TRAIL',
    name_zh: '城山天狗越野跑线',
    color: '#EF4444',
    gradientFrom: '#EF4444',
    gradientTo: '#B91C1C',
    distanceKm: 16.0,
    elevationGainM: 1250,
    maxAltitudeM: 670,
    difficultyStars: 5,
    difficultyLabel: '上級者向け',
    difficultyLabel_en: 'Expert',
    difficultyLabel_zh: '高难度/专业',
    recommendedShoe: 'S/LAB GENESIS',
    recommendedShoeDesc: 'テクニカル・上級者向け',
    points: [[0, 200], [2.2, 340], [5.0, 520], [8.2, 670], [10.5, 540], [13.0, 620], [16.0, 210]],
  },
  {
    id: 'trail_meio',
    badgeNum: 2,
    name: '明王峠相模湖トレイル',
    name_en: 'MYO-O PASS - SAGAMIKO TRAIL',
    name_zh: '明王山口相模湖越野线',
    color: '#3B82F6',
    gradientFrom: '#3B82F6',
    gradientTo: '#1D4ED8',
    distanceKm: 10.1,
    elevationGainM: 820,
    maxAltitudeM: 738,
    difficultyStars: 4,
    difficultyLabel: '中上級者向け',
    difficultyLabel_en: 'Advanced',
    difficultyLabel_zh: '中高级',
    recommendedShoe: 'XA PRO 3D V9',
    recommendedShoeDesc: 'トレイルラン・中級者向け',
    points: [[0, 200], [2.0, 380], [4.5, 590], [6.8, 738], [8.5, 450], [10.1, 205]],
  },
  {
    id: 'trail_misawa',
    badgeNum: 3,
    name: '三沢峠周回トレイル',
    name_en: 'MISAWA PASS LOOP TRAIL',
    name_zh: '三泽山口环形越野线',
    color: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#047857',
    distanceKm: 10.0,
    elevationGainM: 730,
    maxAltitudeM: 560,
    difficultyStars: 3,
    difficultyLabel: '中級者向け',
    difficultyLabel_en: 'Intermediate',
    difficultyLabel_zh: '中级',
    recommendedShoe: 'XA PRO 3D V9',
    recommendedShoeDesc: 'トレイルラン・中級者向け',
    points: [[0, 200], [2.5, 360], [5.0, 560], [7.2, 420], [8.8, 490], [10.0, 200]],
  },
  {
    id: 'trail_gongen',
    badgeNum: 4,
    name: '権現平往復トレイル',
    name_en: 'GONGEN-DAIRA OUT&BACK TRAIL',
    name_zh: '权现平往返越野线',
    color: '#A855F7',
    gradientFrom: '#A855F7',
    gradientTo: '#7E22CE',
    distanceKm: 11.0,
    elevationGainM: 600,
    maxAltitudeM: 580,
    difficultyStars: 3,
    difficultyLabel: '中級者向け',
    difficultyLabel_en: 'Intermediate',
    difficultyLabel_zh: '中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 200], [2.8, 380], [5.5, 580], [8.2, 390], [11.0, 200]],
  },
  {
    id: 'trail_minamitakao',
    badgeNum: 5,
    name: '南高尾東尾根トレイル',
    name_en: 'MINAMI-TAKAO HIGASHIONE TRAIL',
    name_zh: '南高尾东山脊越野线',
    color: '#F97316',
    gradientFrom: '#F97316',
    gradientTo: '#C2410C',
    distanceKm: 5.2,
    elevationGainM: 420,
    maxAltitudeM: 410,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 200], [1.8, 320], [3.2, 410], [4.4, 290], [5.2, 200]],
  },
  {
    id: 'trail_taiko',
    badgeNum: 6,
    name: '太鼓曲輪尾根トレイル',
    name_en: 'TAIKOKU MAGARIWONE TRAIL',
    name_zh: '太鼓曲轮山脊越野线',
    color: '#EAB308',
    gradientFrom: '#EAB308',
    gradientTo: '#A16207',
    distanceKm: 6.0,
    elevationGainM: 480,
    maxAltitudeM: 480,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 200], [1.5, 290], [3.5, 480], [5.0, 310], [6.0, 200]],
  },
  {
    id: 'trail_kogezawa',
    badgeNum: 7,
    name: '小下沢林道トレイル',
    name_en: 'KOSHIMOSAWA FOREST ROAD TRAIL',
    name_zh: '小下泽林道越野线',
    color: '#94A3B8',
    gradientFrom: '#94A3B8',
    gradientTo: '#475569',
    distanceKm: 7.0,
    elevationGainM: 530,
    maxAltitudeM: 530,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 210], [2.2, 330], [4.5, 530], [6.0, 350], [7.0, 210]],
  },
  {
    id: 'trail_kitaapproach',
    badgeNum: 8,
    name: '北高尾アプローチトレイル',
    name_en: 'NORTH TAKAO APPROACH TRAIL',
    name_zh: '北高尾接入探索步道',
    color: '#2DD4BF',
    gradientFrom: '#2DD4BF',
    gradientTo: '#0F766E',
    distanceKm: 4.0,
    elevationGainM: 190,
    maxAltitudeM: 350,
    difficultyStars: 1,
    difficultyLabel: '初心者向け',
    difficultyLabel_en: 'Beginner',
    difficultyLabel_zh: '初学者',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 205], [1.5, 260], [2.8, 350], [4.0, 340]],
  },
];

// 12 Primary Mt. Takao Hiking Courses
const HIKING_PROFILES: CourseProfile[] = [
  {
    id: 'route_1',
    badgeNum: 1,
    name: '1号路（表参道・薬王院）',
    name_en: 'Trail 1 (Omotesando Temple Trail)',
    name_zh: '1号路（表参道・药王院）',
    color: '#E8002D',
    gradientFrom: '#E8002D',
    gradientTo: '#991B1B',
    distanceKm: 3.8,
    elevationGainM: 399,
    maxAltitudeM: 599,
    difficultyStars: 1,
    difficultyLabel: '初心者向け',
    difficultyLabel_en: 'Beginner',
    difficultyLabel_zh: '初学者',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 201], [0.8, 280], [1.8, 410], [2.5, 485], [3.2, 530], [3.8, 599]],
  },
  {
    id: 'route_6',
    badgeNum: 6,
    name: '6号路（びわ滝・水のコース）',
    name_en: 'Trail 6 (Biwa Waterfall Trail)',
    name_zh: '6号路（琵琶瀑布・溪水步道）',
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#0E7490',
    distanceKm: 3.3,
    elevationGainM: 400,
    maxAltitudeM: 599,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 201], [0.9, 275], [1.7, 360], [2.4, 435], [2.9, 530], [3.3, 599]],
  },
  {
    id: 'route_inariyama',
    badgeNum: 7,
    name: '稲荷山コース（見晴らし尾根）',
    name_en: 'Inariyama Ridge Trail',
    name_zh: '稻荷山路线（开阔山脊）',
    color: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#B45309',
    distanceKm: 3.1,
    elevationGainM: 401,
    maxAltitudeM: 599,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 205], [0.7, 295], [1.5, 395], [2.2, 475], [2.8, 555], [3.1, 599]],
  },
  {
    id: 'route_4',
    badgeNum: 4,
    name: '4号路（吊り橋・みやま橋）',
    name_en: 'Trail 4 (Suspension Bridge)',
    name_zh: '4号路（深山吊桥）',
    color: '#8B5CF6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#6D28D9',
    distanceKm: 1.5,
    elevationGainM: 150,
    maxAltitudeM: 599,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 460], [0.4, 490], [0.8, 480], [1.2, 545], [1.5, 599]],
  },
  {
    id: 'route_3',
    badgeNum: 3,
    name: '3号路（かつら林・静寂の道）',
    name_en: 'Trail 3 (Katsura Trees Trail)',
    name_zh: '3号路（连香树林・幽静林道）',
    color: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#047857',
    distanceKm: 2.4,
    elevationGainM: 180,
    maxAltitudeM: 599,
    difficultyStars: 2,
    difficultyLabel: '初中級者向け',
    difficultyLabel_en: 'Beginner+',
    difficultyLabel_zh: '初中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 475], [0.7, 495], [1.5, 525], [2.0, 560], [2.4, 599]],
  },
  {
    id: 'route_2',
    badgeNum: 2,
    name: '2号路（霞台ループ・南北散策）',
    name_en: 'Trail 2 (Kasumidai Loop)',
    name_zh: '2号路（霞台环形路）',
    color: '#38BDF8',
    gradientFrom: '#38BDF8',
    gradientTo: '#0284C7',
    distanceKm: 0.9,
    elevationGainM: 50,
    maxAltitudeM: 480,
    difficultyStars: 1,
    difficultyLabel: '初心者向け',
    difficultyLabel_en: 'Beginner',
    difficultyLabel_zh: '初学者',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 472], [0.3, 480], [0.6, 465], [0.9, 472]],
  },
  {
    id: 'route_5',
    badgeNum: 5,
    name: '5号路（山頂周回ループ）',
    name_en: 'Trail 5 (Summit Loop Trail)',
    name_zh: '5号路（山顶环形周回路）',
    color: '#F43F5E',
    gradientFrom: '#F43F5E',
    gradientTo: '#BE123C',
    distanceKm: 0.9,
    elevationGainM: 30,
    maxAltitudeM: 599,
    difficultyStars: 1,
    difficultyLabel: '初心者向け',
    difficultyLabel_en: 'Beginner',
    difficultyLabel_zh: '初学者',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 580], [0.3, 590], [0.6, 595], [0.9, 580]],
  },
  {
    id: 'route_kobotoke',
    badgeNum: 8,
    name: '小仏城山コース（名物茶屋）',
    name_en: 'Kobotoke-Shiroyama Trail',
    name_zh: '小佛城山路线（名物茶社）',
    color: '#D97706',
    gradientFrom: '#D97706',
    gradientTo: '#92400E',
    distanceKm: 4.5,
    elevationGainM: 380,
    maxAltitudeM: 670,
    difficultyStars: 3,
    difficultyLabel: '中級者向け',
    difficultyLabel_en: 'Intermediate',
    difficultyLabel_zh: '中级',
    recommendedShoe: 'XA PRO 3D V9',
    recommendedShoeDesc: 'トレイルラン・中級者向け',
    points: [[0, 290], [1.2, 420], [2.5, 548], [3.8, 670], [4.5, 599]],
  },
  {
    id: 'route_momijidai',
    badgeNum: 9,
    name: 'もみじ台・一丁平コース',
    name_en: 'Momijidai & Itchodaira Trail',
    name_zh: '红叶台・一丁目平步道',
    color: '#EC4899',
    gradientFrom: '#EC4899',
    gradientTo: '#9D174D',
    distanceKm: 2.5,
    elevationGainM: 150,
    maxAltitudeM: 550,
    difficultyStars: 3,
    difficultyLabel: '中級者向け',
    difficultyLabel_en: 'Intermediate',
    difficultyLabel_zh: '中级',
    recommendedShoe: 'X ULTRA 360',
    recommendedShoeDesc: 'ハイク・初心者向け',
    points: [[0, 599], [0.8, 550], [1.8, 530], [2.5, 545]],
  },
  {
    id: 'route_iroha',
    badgeNum: 10,
    name: 'いろはの森コース（学術林道）',
    name_en: 'Iroha Forest Botanical Trail',
    name_zh: '伊吕波森林植物步道',
    color: '#84CC16',
    gradientFrom: '#84CC16',
    gradientTo: '#4D7C0F',
    distanceKm: 1.5,
    elevationGainM: 250,
    maxAltitudeM: 599,
    difficultyStars: 3,
    difficultyLabel: '中級者向け',
    difficultyLabel_en: 'Intermediate',
    difficultyLabel_zh: '中级',
    recommendedShoe: 'XA PRO 3D V9',
    recommendedShoeDesc: 'トレイルラン・中級者向け',
    points: [[0, 320], [0.5, 410], [1.0, 510], [1.5, 599]],
  },
  {
    id: 'route_jataki',
    badgeNum: 11,
    name: '蛇滝コース（水行道場）',
    name_en: 'Jataki Waterfall Trail',
    name_zh: '蛇瀑布路线（水行道场）',
    color: '#0284C7',
    gradientFrom: '#0284C7',
    gradientTo: '#0369A1',
    distanceKm: 1.5,
    elevationGainM: 230,
    maxAltitudeM: 472,
    difficultyStars: 3,
    difficultyLabel: '中級者向け',
    difficultyLabel_en: 'Intermediate',
    difficultyLabel_zh: '中级',
    recommendedShoe: 'XA PRO 3D V9',
    recommendedShoeDesc: 'トレイルラン・中級者向け',
    points: [[0, 240], [0.5, 310], [1.0, 395], [1.5, 472]],
  },
  {
    id: 'route_jinba',
    badgeNum: 12,
    name: '陣馬山・高尾山縦走コース',
    name_en: 'Mt. Jinba to Takao Traverse',
    name_zh: '阵马山・高尾山纵走路线',
    color: '#6366F1',
    gradientFrom: '#6366F1',
    gradientTo: '#4338CA',
    distanceKm: 18.5,
    elevationGainM: 850,
    maxAltitudeM: 855,
    difficultyStars: 5,
    difficultyLabel: '上級者向け',
    difficultyLabel_en: 'Expert',
    difficultyLabel_zh: '高难度/专业',
    recommendedShoe: 'S/LAB GENESIS',
    recommendedShoeDesc: 'テクニカル・上級者向け',
    points: [[0, 599], [3.5, 670], [7.0, 727], [12.0, 855], [15.5, 450], [18.5, 210]],
  },
];

export function ElevationProfileModal() {
  const setActiveModal    = useStore((s) => s.setActiveModal);
  const setSelectedRoute  = useStore((s) => s.setSelectedRoute);
  const { language }      = useT();
  const [activeTab, setActiveTab] = useState<'trail' | 'hiking'>('trail');
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  const profiles = activeTab === 'trail' ? TRAIL_RUN_PROFILES : HIKING_PROFILES;

  // Aggregate stats
  const totalDistance = profiles.reduce((sum, p) => sum + p.distanceKm, 0);
  const totalElevationGain = profiles.reduce((sum, p) => sum + p.elevationGainM, 0);
  const maxAltitude = Math.max(...profiles.map((p) => p.maxAltitudeM));

  // Chart dimensions
  const svgWidth = 840;
  const svgHeight = 240;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Elevation scale: 150m to 900m
  const minElevY = 150;
  const maxElevY = 900;

  const getY = (elev: number) => {
    const clamped = Math.max(minElevY, Math.min(maxElevY, elev));
    return paddingTop + chartH - ((clamped - minElevY) / (maxElevY - minElevY)) * chartH;
  };

  const handleSelectCourse = (courseId: string) => {
    const aliasMap: Record<string, string> = {
      trail_kitatakao: 'trail_kitaapproach',
    };
    const realId = aliasMap[courseId] || courseId;
    const targetRoute = ROUTES.find((r) => r.id === realId);
    if (targetRoute) {
      setSelectedRoute(targetRoute);
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* ── Main Elevation Hub Board ── */}
      <div
        className="w-full max-w-5xl rounded-3xl bg-[#070D1E]/95 border border-white/20 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white animate-scaleUp relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />

        {/* ── Board Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {activeTab === 'trail'
                  ? (language === 'en' ? 'TAKAO TRAIL HUB' : language === 'zh' ? '高尾山越野跑中心' : 'TAKAO TRAIL HUB')
                  : (language === 'en' ? 'TAKAO MOUNTAIN HIKING' : language === 'zh' ? '高尾山登山步道' : 'TAKAO MOUNTAIN HIKING')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'en'
                  ? 'All-Course Elevation Silhouette Profile'
                  : language === 'zh'
                  ? '全路线海拔高度剖面总览'
                  : '高尾山 全コース標高プロファイル'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              <span>
                {activeTab === 'trail'
                  ? (language === 'en'
                      ? 'Mt. Takao Trail Hub (8 Trail Running Courses)'
                      : language === 'zh'
                      ? '高尾山越野跑中心（8条越野跑路线）'
                      : '高尾山トレイルハブ（8トレイルコース）')
                  : (language === 'en'
                      ? 'Mt. Takao 12 Hiking Trails Elevation Comparison'
                      : language === 'zh'
                      ? '高尾山登山步道 12条路线海拔一览'
                      : '高尾山登山道 12ルート標高一括比較')}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'en'
                ? 'Discover your adventure across varied trails with distinct elevation profiles.'
                : language === 'zh'
                ? '一览各路线起伏、高差与距离，找到最适合您的探险路线。'
                : 'バラエティ豊かなトレイルで あなたの冒険を見つけよう。'}
            </p>
          </div>

          {/* Top Right: Category Total Stats (Matching Image 1 トレイル合計データ) */}
          <div className="flex items-center gap-3 bg-white/[0.06] border border-white/15 rounded-2xl px-4 py-2.5 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="text-left">
              <p className="text-[9px] uppercase font-mono text-slate-400">
                {activeTab === 'trail'
                  ? (language === 'en' ? 'Trail Run Total Data' : language === 'zh' ? '越野跑 汇总数据' : 'トレイル 合計データ')
                  : (language === 'en' ? 'Hiking Total Data' : language === 'zh' ? '登山步道 汇总数据' : '登山道 合計データ')}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400">
                  {language === 'en' ? 'Total Dist:' : language === 'zh' ? '总距离:' : '総距離:'}
                </span>
                <span className="text-sm font-black text-white font-mono">
                  {language === 'en' ? 'Approx ' : language === 'zh' ? '约 ' : '約 '}
                  {totalDistance.toFixed(1)}km
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="text-left">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-slate-400">
                  {language === 'en' ? 'Elev Gain:' : language === 'zh' ? '累计爬升:' : '累積標高:'}
                </span>
                <span className="text-sm font-black text-cyan-300 font-mono">
                  {language === 'en' ? 'Approx ' : language === 'zh' ? '约 ' : '約 '}
                  {totalElevationGain.toLocaleString()}m
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-slate-400">
                  {language === 'en' ? 'Max Alt:' : language === 'zh' ? '最高海拔:' : '最高標高:'}
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono">{maxAltitude}m</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="ml-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tab Switcher: 登山道 vs トレイルランニング ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-black/30 border-b border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('trail'); setHoveredCourseId(null); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trail'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>
                {language === 'en'
                  ? '🏃 Trail Running (8 Courses)'
                  : language === 'zh'
                  ? '🏃 越野跑路线（8条路线）'
                  : '🏃 トレイルランニング（8コース）'}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('hiking'); setHoveredCourseId(null); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hiking'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>
                {language === 'en'
                  ? '🥾 Hiking Trails (12 Courses)'
                  : language === 'zh'
                  ? '🥾 登山步道路线（12条路线）'
                  : '🥾 登山道コース（12コース）'}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>
              {language === 'en'
                ? 'Click a course to inspect its route on 3D map'
                : language === 'zh'
                ? '点击路线卡片即可在3D地图上同步查看'
                : 'コースをクリックすると3Dマップ上でルートを即座に表示します'}
            </span>
          </div>
        </div>

        {/* ── Scrollable Body Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* ── Main Elevation Silhouette Chart Card (Matching Image 1) ── */}
          <div className="relative rounded-2xl bg-black/60 border border-white/15 p-4 sm:p-5 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  {language === 'en'
                    ? 'ELEVATION PROFILES OVERVIEW (3D SILHOUETTE)'
                    : language === 'zh'
                    ? '海拔高度剖面总览（3D群山剪影）'
                    : '標高プロファイル（イメージ） / 群山シルエット'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {language === 'en'
                  ? 'Y: Altitude (m) / X: Distance (km)'
                  : language === 'zh'
                  ? 'Y: 海拔高度(m) / X: 路线距离(km)'
                  : 'Y: 標高(m) / X: コース相対距離(km)'}
              </span>
            </div>

            {/* SVG Overlapping Elevation Silhouettes */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 sm:h-64 overflow-visible"
              >
                <defs>
                  {profiles.map((p) => (
                    <linearGradient key={`grad-${p.id}`} id={`grad-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={p.color} stopOpacity={hoveredCourseId === p.id ? "0.85" : "0.50"} />
                      <stop offset="60%" stopColor={p.color} stopOpacity={hoveredCourseId === p.id ? "0.45" : "0.20"} />
                      <stop offset="100%" stopColor={p.color} stopOpacity="0.02" />
                    </linearGradient>
                  ))}
                </defs>

                {/* Grid Lines & Y-Axis Labels */}
                {[200, 400, 600, 800].map((elev) => {
                  const y = getY(elev);
                  return (
                    <g key={elev}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {elev}m
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Distance Scale (Relative 0 to max distance in segments) */}
                {[0, 10, 20, 30, 40, 50, 60, 70].map((dist) => {
                  const x = paddingLeft + (dist / 70) * chartW;
                  return (
                    <g key={dist}>
                      <line
                        x1={x}
                        y1={paddingTop + chartH}
                        x2={x}
                        y2={paddingTop + chartH + 5}
                        stroke="rgba(255,255,255,0.2)"
                      />
                      <text
                        x={x}
                        y={paddingTop + chartH + 18}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {dist}
                      </text>
                    </g>
                  );
                })}
                <text
                  x={svgWidth - paddingRight}
                  y={paddingTop + chartH + 18}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {language === 'en' ? 'Dist (km)' : language === 'zh' ? '距离 (km)' : '距離 (km)'}
                </text>

                {/* Render Overlapping Mountain Profile Curves */}
                {profiles.map((p, idx) => {
                  // Distribute peaks horizontally to create the staggered mountain silhouette panorama
                  const offsetKm = (idx / profiles.length) * 55;
                  const spanKm = Math.max(12, p.distanceKm * 1.8);

                  const pathPoints = p.points.map(([relDist, alt]) => {
                    const normDist = (relDist / p.distanceKm) * spanKm;
                    const x = paddingLeft + ((offsetKm + normDist) / 70) * chartW;
                    const y = getY(alt);
                    return [x, y] as [number, number];
                  });

                  if (pathPoints.length < 2) return null;

                  // Build smooth curve path
                  let dPath = `M ${pathPoints[0][0]} ${pathPoints[0][1]}`;
                  for (let i = 1; i < pathPoints.length; i++) {
                    const prev = pathPoints[i - 1];
                    const curr = pathPoints[i];
                    const mx = (prev[0] + curr[0]) / 2;
                    dPath += ` Q ${prev[0]} ${prev[1]}, ${mx} ${(prev[1] + curr[1]) / 2} T ${curr[0]} ${curr[1]}`;
                  }

                  const startX = pathPoints[0][0];
                  const endX = pathPoints[pathPoints.length - 1][0];
                  const groundY = paddingTop + chartH;
                  const fillD = `${dPath} L ${endX} ${groundY} L ${startX} ${groundY} Z`;

                  const isHovered = hoveredCourseId === p.id;
                  const isAnyHovered = hoveredCourseId !== null;

                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer transition-opacity duration-200"
                      opacity={isHovered ? 1.0 : isAnyHovered ? 0.35 : 0.85}
                      onMouseEnter={() => setHoveredCourseId(p.id)}
                      onMouseLeave={() => setHoveredCourseId(null)}
                      onClick={() => handleSelectCourse(p.id)}
                    >
                      {/* Mountain Fill */}
                      <path d={fillD} fill={`url(#grad-${p.id})`} />

                      {/* Glowing Ridge Line */}
                      <path
                        d={dPath}
                        fill="none"
                        stroke={p.color}
                        strokeWidth={isHovered ? 3.5 : 2.0}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' : undefined}
                      />

                      {/* Peak Altitude Point & Number Badge */}
                      {(() => {
                        const peakIdx = p.points.reduce((maxI, pt, i, arr) => (pt[1] > arr[maxI][1] ? i : maxI), 0);
                        const peakCoord = pathPoints[peakIdx];
                        return (
                          <g>
                            <circle
                              cx={peakCoord[0]}
                              cy={peakCoord[1]}
                              r={isHovered ? 5.5 : 3.5}
                              fill="#FFFFFF"
                              stroke={p.color}
                              strokeWidth={2}
                            />
                            {isHovered && (
                              <g>
                                <rect
                                  x={peakCoord[0] - 38}
                                  y={peakCoord[1] - 26}
                                  width={76}
                                  height={20}
                                  rx={6}
                                  fill="#070D1E"
                                  stroke={p.color}
                                  strokeWidth={1.5}
                                />
                                <text
                                  x={peakCoord[0]}
                                  y={peakCoord[1] - 12}
                                  fill="#FFFFFF"
                                  fontSize="10"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  fontFamily="monospace"
                                >
                                  {p.maxAltitudeM}m
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })()}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ── Course Breakdown Cards (Matching Image 1 Left Course Column) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                {language === 'en'
                  ? 'INDIVIDUAL COURSE BREAKDOWN'
                  : language === 'zh'
                  ? '各路线详细高程与难度 / INDIVIDUAL COURSE BREAKDOWN'
                  : 'コース別詳細データ / INDIVIDUAL COURSE BREAKDOWN'}
              </h3>
              <span className="text-[10px] text-slate-400">
                {language === 'en'
                  ? 'Click card to inspect route on 3D map'
                  : language === 'zh'
                  ? '点击卡片直接在3D地图中查看路线'
                  : 'カードをタップして3Dマップで確認'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {profiles.map((p) => {
                const isHovered = hoveredCourseId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectCourse(p.id)}
                    onMouseEnter={() => setHoveredCourseId(p.id)}
                    onMouseLeave={() => setHoveredCourseId(null)}
                    className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                      isHovered
                        ? 'bg-white/15 border-cyan-400 shadow-glow-cyan/40 scale-[1.02]'
                        : 'bg-white/[0.04] border-white/15 hover:border-white/30 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div>
                      {/* Badge and Course Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.badgeNum}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate leading-tight">
                            {language === 'en' ? p.name_en : language === 'zh' ? p.name_zh : p.name}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono truncate">
                            {language === 'en' ? p.name : language === 'zh' ? p.name : p.name_en}
                          </p>
                        </div>
                      </div>

                      {/* Distance & Elevation Gain */}
                      <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 rounded-xl bg-black/40 border border-white/10 text-center font-mono">
                        <div>
                          <p className="text-[8.5px] text-slate-400 uppercase">
                            {language === 'en' ? 'DISTANCE' : language === 'zh' ? '距离' : '距離'}
                          </p>
                          <p className="text-xs font-black text-white">{p.distanceKm}km</p>
                        </div>
                        <div>
                          <p className="text-[8.5px] text-slate-400 uppercase">
                            {language === 'en' ? 'ASCENT' : language === 'zh' ? '累计爬升' : '累積上り'}
                          </p>
                          <p className="text-xs font-black text-cyan-300">↑{p.elevationGainM}m</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Difficulty & Recommended Shoe */}
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-amber-300 font-bold flex items-center gap-0.5">
                        {'★'.repeat(p.difficultyStars)}
                        <span className="text-slate-400 ml-1 font-medium">
                          {language === 'en' ? p.difficultyLabel_en : language === 'zh' ? p.difficultyLabel_zh : p.difficultyLabel}
                        </span>
                      </span>
                      <span className="text-[9px] text-cyan-400 font-mono font-bold group-hover:translate-x-0.5 transition-transform">
                        {language === 'en' ? 'View 3D ›' : language === 'zh' ? '3D查看 ›' : '3D表示 ›'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom Section: Difficulty Guide & Recommended Salomon Shoes (Matching Image 1) ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
            {/* Left: Trail Difficulty Legend */}
            <div className="md:col-span-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  {language === 'en'
                    ? 'DIFFICULTY RATINGS'
                    : language === 'zh'
                    ? '步道难度等级标准 / DIFFICULTY'
                    : 'トレイル難易度基準 / DIFFICULTY RATINGS'}
                </p>
                <div className="space-y-1 text-[10.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">
                      {language === 'en' ? 'Beginner' : language === 'zh' ? '初学者 / 休闲入门' : '初心者向け'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      ★☆☆☆☆ {language === 'en' ? '(Paved Path)' : language === 'zh' ? '(全线铺装路面)' : '(全線舗装路)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">
                      {language === 'en' ? 'Easy / Moderate' : language === 'zh' ? '初中级 / 适度徒步' : '初中級者向け'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      ★★☆☆☆ {language === 'en' ? '(Natural Trail)' : language === 'zh' ? '(自然山道/阶梯)' : '(自然山道)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">
                      {language === 'en' ? 'Intermediate' : language === 'zh' ? '中级 / 经典山脊' : '中級者向け'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      ★★★☆☆ {language === 'en' ? '(Moderate Slopes)' : language === 'zh' ? '(适度起伏坡道)' : '(適度な起伏)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">
                      {language === 'en' ? 'Advanced / Expert' : language === 'zh' ? '高难度 / 专家越野' : '中上級・上級'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      ★★★★★ {language === 'en' ? '(Technical Ridge)' : language === 'zh' ? '(长距离技术越野)' : '(本格トレイル)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recommended Salomon Shoes Bar (Matching Image 1 "おすすめシューズ") */}
            <div className="md:col-span-8 p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {language === 'en'
                      ? 'RECOMMENDED SALOMON FOOTWEAR'
                      : language === 'zh'
                      ? '推荐萨洛蒙鞋款 / RECOMMENDED SALOMON FOOTWEAR'
                      : 'おすすめシューズ / RECOMMENDED SALOMON FOOTWEAR'}
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                  TIME TO PLAY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Shoe 1: X ULTRA 360 */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-cyan-400 font-bold">
                      {language === 'en' ? 'Hiking · Beginner' : language === 'zh' ? '徒步 · 初学者入门' : 'ハイク・初心者向け'}
                    </span>
                    <h4 className="text-xs font-black text-white mt-0.5">X ULTRA 360</h4>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug">
                      {language === 'en'
                        ? 'Outstanding stability with GORE-TEX waterproof protection. Prevents ankle wobble for smooth, comfortable hiking.'
                        : language === 'zh'
                        ? '出色的稳定支撑与GORE-TEX防水保护。有效稳定脚踝，带来舒适惬意的徒步体验。'
                        : '抜群の安定性とGORE-TEX防水。足首のブレを防ぎ快適な歩行をサポート。'}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                    <span>
                      {language === 'en' ? 'Ideal for Trails 1 - 6' : language === 'zh' ? '最适合 1号路〜6号路' : '1号路〜6号路に最適'}
                    </span>
                    <span className="text-cyan-400 font-bold">★1〜2</span>
                  </div>
                </div>

                {/* Shoe 2: XA PRO 3D V9 */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-emerald-400 font-bold">
                      {language === 'en' ? 'Trail Run · Intermediate' : language === 'zh' ? '越野跑 · 中级进阶' : 'トレイルラン・中級者向け'}
                    </span>
                    <h4 className="text-xs font-black text-white mt-0.5">XA PRO 3D V9</h4>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug">
                      {language === 'en'
                        ? '3D Advanced Chassis provides high stability and rugged durability. Confident grip on rocky sections and steep slopes.'
                        : language === 'zh'
                        ? '搭载3D Advanced Chassis底盘系统，具备极高稳定性与耐磨性。无惧岩石路与陡坡。'
                        : '3D Advanced Chassisによる高安定性と堅牢な耐久性。岩場や急坂でも安心。'}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                    <span>
                      {language === 'en' ? 'Ideal for S.Takao & Shiroyama' : language === 'zh' ? '最适合 南高尾・城山路线' : '南高尾・城山に最適'}
                    </span>
                    <span className="text-emerald-400 font-bold">★3〜4</span>
                  </div>
                </div>

                {/* Shoe 3: S/LAB GENESIS */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-rose-400 font-bold">
                      {language === 'en' ? 'Technical · Expert Race' : language === 'zh' ? '技术越野 · 专家竞速' : 'テクニカル・上級者向け'}
                    </span>
                    <h4 className="text-xs font-black text-white mt-0.5">S/LAB GENESIS</h4>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug">
                      {language === 'en'
                        ? 'Pinnacle racing model engineered to conquer demanding trails at speed. Ultimate grip, energy return, and protection.'
                        : language === 'zh'
                        ? '专为高速征服崎岖险峻越野赛道打造的顶级竞速鞋。具备极致抓地力与保护性能。'
                        : '過酷なトレイルを高速で駆け抜ける最高峰レースモデル。最強のグリップ力。'}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                    <span>
                      {language === 'en' ? 'Ideal for Tengu & Jinba Ridges' : language === 'zh' ? '最适合 天狗・阵马山脊' : '天狗・陣馬山稜に最適'}
                    </span>
                    <span className="text-rose-400 font-bold">★5〜6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

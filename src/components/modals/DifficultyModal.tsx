'use client';

import React, { useState } from 'react';
import { X, Sparkles, Star, Mountain, Footprints } from 'lucide-react';
import { ROUTES } from '@/data/routes';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useT } from '@/lib/i18n';
import type { Route, RouteCategory } from '@/types';

// Color dots matching map trail colors for all 20 courses
const ROUTE_DOT_COLORS: Record<string, string> = {
  // 12 登山コース (Takao Hiking)
  route_1:          '#22C55E', // Green (1号路)
  route_2:          '#C084FC', // Light purple (2号路)
  route_3:          '#F97316', // Orange (3号路)
  route_4:          '#FACC15', // Yellow (4号路)
  route_5:          '#F43F5E', // Rose pink (5号路)
  route_6:          '#818CF8', // Indigo (6号路)
  route_inariyama:  '#EF4444', // Red (稲荷山)
  route_jinba:      '#FDBA74', // Soft peach (高尾山・陣馬山縦走)
  route_iroha:      '#10B981', // Emerald (いろはの森)
  route_jataki:     '#06B6D4', // Cyan (蛇滝)
  route_kobotoke:   '#EC4899', // Pink (小仏城山)
  route_momijidai:  '#E11D48', // Crimson (もみじ台・一丁平)

  // 8 トレランコース (Trail Running)
  trail_gongen:     '#38BDF8', // Sky blue (権現平)
  trail_minamitakao:'#4ADE80', // Light green (南高尾東尾根)
  trail_misawa:     '#A78BFA', // Purple (三沢峠)
  trail_kitaapproach:'#2DD4BF',// Teal (北高尾)
  trail_taiko:      '#F472B6', // Pink (太鼓曲輪)
  trail_kogezawa:   '#FBBF24', // Amber (小下沢)
  trail_tengu:      '#E8002D', // Salomon Red (城山天狗)
  trail_meio:       '#FB923C', // Orange (明王峠相模湖)
};

export function DifficultyModal() {
  const setActiveModal        = useStore((s) => s.setActiveModal);
  const setSelectedRoute     = useStore((s) => s.setSelectedRoute);
  const setSelectedDifficulty = useStore((s) => s.setSelectedDifficulty);
  const selectedRoute        = useStore((s) => s.selectedRoute);
  const routeSettings        = useAdminStore((s) => s.routeSettings);
  const { t, language }       = useT();

  // Active Category: 登山 (takao_course: 12) vs トレラン (surrounding_trail: 8)
  const [activeCategory, setActiveCategory] = useState<RouteCategory>(
    selectedRoute?.category ?? 'takao_course'
  );

  const currentRoutes = ROUTES.filter((r) => r.category === activeCategory);

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    const effDiff = routeSettings[route.id]?.difficulty ?? route.difficulty;
    setSelectedDifficulty(effDiff);
    setActiveModal(null);
  };

  const getCleanDisplayName = (route: Route): string => {
    if (route.id === 'route_jinba') return '高尾山・陣馬山 縦走コース';
    if (route.id === 'route_iroha') return 'いろはの森コース';
    if (route.id === 'route_jataki') return '蛇滝コース';
    if (route.id === 'route_kobotoke') return '小仏城山コース';
    if (route.id === 'route_momijidai') return 'もみじ台・一丁平コース';
    return route.name.split('（')[0];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="difficulty-modal-title"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#161B26] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            {/* Title Badge matching client screenshot */}
            <div className="px-4 py-1.5 rounded-full bg-[#0D1117] border border-white/20 shadow-md">
              <span id="difficulty-modal-title" className="text-sm font-black text-white tracking-wider">
                {language === 'en' ? 'Difficulty' : language === 'zh' ? '难易度' : '難易度'}
              </span>
            </div>
            <span className="text-xs text-slate-300 font-bold">
              {activeCategory === 'takao_course'
                ? (language === 'en' ? 'Hiking: 12 Courses' : language === 'zh' ? '登山: 12条路线' : '登山: 全12コース')
                : (language === 'en' ? 'Trail Running: 8 Courses' : language === 'zh' ? '越野跑: 8条路线' : 'トレラン: 全8コース')}
            </span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Category Switch Tabs: 登山（12コース） vs トレラン（8コース） ── */}
        <div className="px-6 pb-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveCategory('takao_course')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeCategory === 'takao_course'
                  ? 'bg-gradient-to-r from-salomon-cyan to-teal-400 text-slate-950 font-black shadow-md shadow-salomon-cyan/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Hiking (12 Trails)' : language === 'zh' ? '登山（12条）' : '登山（12コース）'}</span>
            </button>

            <button
              onClick={() => setActiveCategory('surrounding_trail')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeCategory === 'surrounding_trail'
                  ? 'bg-gradient-to-r from-salomon-cyan to-teal-400 text-slate-950 font-black shadow-md shadow-salomon-cyan/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Trail Running (8 Courses)' : language === 'zh' ? '越野跑（8条）' : 'トレラン（8コース）'}</span>
            </button>
          </div>
        </div>

        {/* Legend / Difficulty breakdown */}
        <div className="px-6 py-2 bg-black/40 border-y border-white/8 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">{language === 'en' ? 'Beginner' : language === 'zh' ? '初级' : '初級'}</span>
            <span className="text-slate-400">★1〜2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300 font-bold">{language === 'en' ? 'Intermediate' : language === 'zh' ? '中级' : '中級'}</span>
            <span className="text-slate-400">{activeCategory === 'takao_course' ? '★3〜4' : '★2'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-300 font-bold">{language === 'en' ? 'Advanced' : language === 'zh' ? '高级' : '上級'}</span>
            <span className="text-slate-400">{activeCategory === 'takao_course' ? '★5〜6' : '★3'}</span>
          </div>
        </div>

        {/* List of Courses for Active Category (12 登山 or 8 トレラン) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="bg-[#1C2333]/90 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-inner">
            {currentRoutes.map((route, index) => {
              const setting = routeSettings[route.id];
              const stars = setting?.stars ?? route.difficultyRating ?? 1;
              const dotColor = ROUTE_DOT_COLORS[route.id] || '#00C8FF';
              const isSelected = selectedRoute?.id === route.id;
              const isLast = index === currentRoutes.length - 1;
              const displayName = getCleanDisplayName(route);

              return (
                <div key={route.id}>
                  <button
                    onClick={() => handleSelectRoute(route)}
                    className={`w-full py-2.5 px-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-200 group ${
                      isSelected
                        ? 'bg-white/10 ring-1 ring-salomon-cyan/60'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Left: Colored Dot + Course Name + Stats */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: dotColor }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white tracking-wide truncate block group-hover:text-salomon-cyan transition-colors">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {route.distanceKm}km / {route.durationMin}分
                        </span>
                      </div>
                    </div>

                    {/* Right: Chartreuse Yellow 6-Star Pill matching client screenshot */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-[#E5F952] text-black shadow-sm font-black">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                              i < stars
                                ? 'fill-black text-black stroke-black'
                                : 'fill-transparent text-black/35 stroke-black/35'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>

                  {/* Dashed divider between courses, matching client screenshot */}
                  {!isLast && (
                    <div className="border-b border-dashed border-white/15 my-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick info note */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-salomon-cyan font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Course Selection' : language === 'zh' ? '路线选择与展示' : 'コース選択と表示について'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Tap any course to highlight it on the 3D map, view distance, elevation, standard times, and recommended Salomon gear.'
                : language === 'zh'
                ? '点击任意路线即可在3D地图上高亮查看路线轨迹、距离、标高差、预计耗时及最新推荐装备。'
                : 'コースをタップすると3Dマップ上でルートが強調表示され、距離・標高差・標準タイムや最新の推奨装備をご確認いただけます。'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-black/40 border-t border-white/8 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            {language === 'en' ? 'Total 20 Courses' : language === 'zh' ? '共20条全路线' : '全20コース（登山 12 / トレラン 8）'}
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            {language === 'en' ? 'Close' : language === 'zh' ? '关闭' : '閉じる'}
          </button>
        </div>

      </div>
    </div>
  );
}

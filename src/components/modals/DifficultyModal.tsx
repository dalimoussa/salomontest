'use client';

import React from 'react';
import { X, ExternalLink, ArrowRight, Clock, MapPin, Sparkles, Star } from 'lucide-react';
import { ROUTES } from '@/data/routes';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useT } from '@/lib/i18n';
import type { Route, Difficulty } from '@/types';

// Color dots matching map trail colors
const ROUTE_DOT_COLORS: Record<string, string> = {
  route_1:          '#22C55E', // Green dot (1号路)
  route_2:          '#C084FC', // Light purple dot (2号路)
  route_3:          '#F97316', // Orange dot (3号路)
  route_4:          '#FACC15', // Yellow dot (4号路)
  route_5:          '#F43F5E', // Rose pink dot (5号路)
  route_6:          '#818CF8', // Indigo purple dot (6号路)
  route_inariyama:  '#EF4444', // Red dot (稲荷山コース)
  route_jinba:      '#FDBA74', // Soft peach/beige dot (高尾山・陣馬山縦走コース)
};

export function DifficultyModal() {
  const setActiveModal        = useStore((s) => s.setActiveModal);
  const setSelectedRoute     = useStore((s) => s.setSelectedRoute);
  const setSelectedDifficulty = useStore((s) => s.setSelectedDifficulty);
  const selectedRoute        = useStore((s) => s.selectedRoute);
  const routeSettings        = useAdminStore((s) => s.routeSettings);
  const { t, language }       = useT();

  const primaryRoutes = ROUTES.filter((r) => r.category === 'takao_course');

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    const effDiff = routeSettings[route.id]?.difficulty ?? route.difficulty;
    setSelectedDifficulty(effDiff);
    setActiveModal(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="difficulty-modal-title"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#161B26] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            {/* Title Badge matching client screenshot */}
            <div className="px-5 py-1.5 rounded-full bg-[#0D1117] border border-white/20 shadow-md">
              <span id="difficulty-modal-title" className="text-sm font-black text-white tracking-wider">
                難易度
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              高尾山 主要8コース
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

        {/* Legend / Difficulty breakdown */}
        <div className="px-6 py-2.5 bg-black/40 border-y border-white/8 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">初級</span>
            <span className="text-slate-400">★1〜2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300 font-bold">中級</span>
            <span className="text-slate-400">★4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-300 font-bold">上級</span>
            <span className="text-slate-400">★5〜6</span>
          </div>
        </div>

        {/* List of 8 Primary Courses matching screenshot */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="bg-[#1C2333]/90 border border-white/10 rounded-2xl p-4 shadow-inner">
            {primaryRoutes.map((route, index) => {
              const setting = routeSettings[route.id];
              const stars = setting?.stars ?? route.difficultyRating ?? 1;
              const dotColor = ROUTE_DOT_COLORS[route.id] || '#00C8FF';
              const isSelected = selectedRoute?.id === route.id;
              const isLast = index === primaryRoutes.length - 1;

              // Display clean course label (e.g. "1号路", "稲荷山コース", "高尾山・陣馬山 縦走コース")
              let displayName = route.name.split('（')[0];
              if (route.id === 'route_jinba') {
                displayName = '高尾山・陣馬山 縦走コース';
              }

              return (
                <div key={route.id}>
                  <button
                    onClick={() => handleSelectRoute(route)}
                    className={`w-full py-3 px-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-200 group ${
                      isSelected
                        ? 'bg-white/10 ring-1 ring-salomon-cyan/60'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Left: Colored Dot + Course Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: dotColor }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold text-white tracking-wide truncate group-hover:text-salomon-cyan transition-colors">
                        {displayName}
                      </span>
                    </div>

                    {/* Right: Chartreuse Yellow 6-Star Pill matching client screenshot */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="inline-flex items-center gap-0.5 px-3 py-1 rounded-full bg-[#E5F952] text-black shadow-sm font-black">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
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
              <span>コース選択と設定について</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              コースをタップすると3Dマップ上でルートが強調表示され、詳細情報や推奨装備をご確認いただけます。難易度やスタッフメモは管理画面（Admin）にて手動で変更可能です。
            </p>
          </div>
        </div>

        {/* Modal Footer with Direct Admin Link */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/8 flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            閉じる
          </button>

          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-salomon-black bg-salomon-cyan hover:bg-salomon-cyan/90 transition-colors shadow-glow-cyan/30"
          >
            <span>管理画面で編集</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}

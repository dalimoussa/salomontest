'use client';

import { useState } from 'react';
import { MapPin, Clock, TrendingUp, Sparkles, Mountain, Users, Star, MessageSquare } from 'lucide-react';
import { ROUTES, getLocalizedRoute, ALL_ROUTES_OVERVIEW } from '@/data/routes';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { ElevationProfileChart } from '@/components/ElevationProfileChart';
import { getElevationProfile } from '@/data/elevationProfiles';
import { useT } from '@/lib/i18n';
import type { Difficulty, Route, RouteCategory } from '@/types';

function renderCrowdStars(rating: number = 1) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
        />
      ))}
    </span>
  );
}

function renderDifficultyStars(rating: number = 1, maxStars: number = 6) {
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E5F952] text-black shadow-sm font-black">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${
            i < rating
              ? 'fill-black text-black stroke-black'
              : 'fill-transparent text-black/35 stroke-black/35'
          }`}
        />
      ))}
    </span>
  );
}

const ROUTE_BADGE_MAP: Record<string, { num: number; bg: string; text: string }> = {
  // Trellan 8 courses (matching TAKAO TRAIL HUB reference poster & 3D map)
  trail_tengu:        { num: 1, bg: 'bg-[#EF4444]', text: 'text-white' },
  trail_meio:         { num: 2, bg: 'bg-[#3B82F6]', text: 'text-white' },
  trail_misawa:       { num: 3, bg: 'bg-[#10B981]', text: 'text-white' },
  trail_gongen:       { num: 4, bg: 'bg-[#A855F7]', text: 'text-white' },
  trail_minamitakao:  { num: 5, bg: 'bg-[#F97316]', text: 'text-white' },
  trail_taiko:        { num: 6, bg: 'bg-[#EAB308]', text: 'text-black' },
  trail_kogezawa:     { num: 7, bg: 'bg-[#94A3B8]', text: 'text-black' },
  trail_kitaapproach: { num: 8, bg: 'bg-[#06B6D4]', text: 'text-black' },
  // Hiking courses
  route_1:            { num: 1, bg: 'bg-[#38BDF8]', text: 'text-black' },
  route_2:            { num: 2, bg: 'bg-[#4ADE80]', text: 'text-black' },
  route_3:            { num: 3, bg: 'bg-[#34D399]', text: 'text-black' },
  route_4:            { num: 4, bg: 'bg-[#A78BFA]', text: 'text-black' },
  route_5:            { num: 5, bg: 'bg-[#F472B6]', text: 'text-black' },
  route_6:            { num: 6, bg: 'bg-[#FACC15]', text: 'text-black' },
  inariyama:          { num: 7, bg: 'bg-[#00C8FF]', text: 'text-black' },
  route_inariyama:    { num: 7, bg: 'bg-[#00C8FF]', text: 'text-black' },
  route_jinba:        { num: 8, bg: 'bg-[#FB923C]', text: 'text-black' },
  route_kagenobu:     { num: 8, bg: 'bg-[#FB923C]', text: 'text-black' },
  // Additional Mt. Takao Courses
  route_iroha:        { num: 9, bg: 'bg-[#10B981]', text: 'text-white' },
  route_jataki:       { num: 10, bg: 'bg-[#0284C7]', text: 'text-white' },
  route_kobotoke:     { num: 11, bg: 'bg-[#D97706]', text: 'text-white' },
  route_momijidai:    { num: 12, bg: 'bg-[#EC4899]', text: 'text-white' },
};

export function RoutePanel() {
  const selectedRoute        = useStore(s => s.selectedRoute);
  const setSelectedRoute     = useStore(s => s.setSelectedRoute);
  const setSelectedDifficulty = useStore(s => s.setSelectedDifficulty);
  const setActiveModal       = useStore(s => s.setActiveModal);
  const routeSettings        = useAdminStore(s => s.routeSettings);
  const { t, language } = useT();

  const CATEGORY_TABS: { value: RouteCategory; label: string }[] = [
    { value: 'takao_course',      label: t('route.tabTakao') },
    { value: 'surrounding_trail', label: t('route.tabSurrounding') },
  ];

  const DIFFICULTY_TABS: { value: Difficulty | 'all'; label: string }[] = [
    { value: 'all',          label: t('route.all') },
    { value: 'beginner',     label: t('route.beginner') },
    { value: 'intermediate', label: t('route.intermediate') },
    { value: 'advanced',     label: t('route.advanced') },
  ];

  const [activeCategory, setActiveCategory] = useState<RouteCategory>(
    selectedRoute?.category ?? 'takao_course'
  );
  const [activeDifficultyFilter, setActiveDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [expandedCardRouteId, setExpandedCardRouteId] = useState<string | null>(null);

  const categoryRoutes = ROUTES.filter(r => r.category === activeCategory);
  const filteredRoutes = activeDifficultyFilter === 'all'
    ? categoryRoutes
    : categoryRoutes.filter(r => {
        const effDiff = routeSettings[r.id]?.difficulty ?? r.difficulty;
        return effDiff === activeDifficultyFilter;
      });

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    const effDiff = routeSettings[route.id]?.difficulty ?? route.difficulty;
    setSelectedDifficulty(effDiff);
  };

  const handleCategoryChange = (cat: RouteCategory) => {
    setActiveCategory(cat);
    const first = ROUTES.find(r => r.category === cat);
    if (first) {
      setSelectedRoute(first);
      const effDiff = routeSettings[first.id]?.difficulty ?? first.difficulty;
      setSelectedDifficulty(effDiff);
    }
  };

  return (
    <div className="glass-card p-3 flex flex-col gap-2 animate-fadeInLeft opacity-0-start h-full min-h-0 border border-cyan-400/25 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
         style={{ animationFillMode: 'forwards', animationDelay: '0.25s' }}>
      
      {/* Header with Title & Route Counter */}
      <div className="flex items-center justify-between">
        <p className="section-label">{t('route.title')}</p>
        <span className="text-[10px] text-salomon-cyan font-mono font-bold">
          {t('route.coursesShowing', { count: filteredRoutes.length })}
        </span>
      </div>

      {/* Client Requirement: 標高プロファイル & 難易度一覧 (2-Column Compact Row) */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setActiveModal('elevation')}
          className="py-1.5 px-2 rounded-xl bg-[#0c2330]/90 border border-cyan-400/40 hover:border-cyan-400/80 text-cyan-300 hover:text-white flex items-center justify-between transition-all duration-200 shadow-sm group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[10.5px] font-black tracking-tight truncate">
              {language === 'en' ? 'Elevation Profile Hub' : language === 'zh' ? '全路线海拔剖面' : '全コース標高プロファイル'}
            </span>
          </div>
          <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/35 font-black font-mono shrink-0">
            HUB
          </span>
        </button>

        <button
          onClick={() => setActiveModal('difficulty')}
          className="py-1.5 px-2 rounded-xl bg-[#221c0e]/90 border border-yellow-400/40 hover:border-yellow-400/80 text-yellow-300 hover:text-white flex items-center justify-between transition-all duration-200 shadow-sm group active:scale-[0.98]"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[10.5px] font-black tracking-tight truncate">
              {language === 'en' ? '20-Course Difficulty' : language === 'zh' ? '20条路线难易度' : '全20コース難易度一覧'}
            </span>
          </div>
          <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-[#E5F952] text-black font-black shrink-0">
            ★1〜6
          </span>
        </button>
      </div>

      {/* Primary Category Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#081520]/90 rounded-xl border border-[rgba(80,168,198,0.30)]">
        {CATEGORY_TABS.map(tab => {
          const isActive = activeCategory === tab.value;
          return (
            <button
              key={tab.value}
              id={`category-tab-${tab.value}`}
              onClick={() => handleCategoryChange(tab.value)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 min-h-[34px] flex items-center justify-center text-center leading-tight ${
                isActive
                  ? 'bg-salomon-cyan text-salomon-black shadow-glow-cyan font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Difficulty Sub-filter Tabs */}
      <div className="flex gap-1">
        {DIFFICULTY_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveDifficultyFilter(tab.value)}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 min-h-[28px] ${
              activeDifficultyFilter === tab.value
                ? 'bg-salomon-cyan/25 text-salomon-cyan border border-salomon-cyan/60 shadow-glow-cyan/20'
                : 'bg-[#091722] text-slate-300 hover:text-white border border-[rgba(80,168,198,0.30)] hover:border-salomon-cyan/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Route list */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-1">

        {/* General Paths & Trails Panoramic Overview Card (Client Requirement: Click to see whole trails with numbers, and click any trail number to check trails in map) */}
        <div
          id="route-card-all-overview"
          onClick={() => handleSelectRoute(ALL_ROUTES_OVERVIEW)}
          className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
            selectedRoute?.id === 'all'
              ? 'bg-gradient-to-r from-[#072438] via-[#09324c] to-[#062134] border-salomon-cyan shadow-[0_0_26px_rgba(6,182,212,0.45)] ring-2 ring-salomon-cyan/80 scale-[1.01]'
              : 'bg-gradient-to-r from-[#071626]/95 via-[#0b2034]/90 to-[#071626]/95 border-cyan-400/40 hover:border-salomon-cyan hover:bg-[#0c2438] shadow-md hover:shadow-[0_0_16px_rgba(6,182,212,0.25)]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-salomon-black font-black text-sm flex items-center justify-center shrink-0 shadow-glow-cyan">
                🌐
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/25 text-cyan-300 border border-cyan-400/50 font-mono">
                    PANORAMIC 3D
                  </span>
                  <h3 className="font-black text-xs sm:text-[13px] text-white truncate group-hover:text-cyan-300 transition-colors">
                    {language === 'en'
                      ? 'General Paths & Trails Overview'
                      : language === 'zh'
                      ? '全路线3D全景总览（全トレイル）'
                      : '全コース一括表示（全体トレイル・全域網羅）'}
                  </h3>
                </div>
                <p className="text-[10px] text-cyan-200/90 leading-tight mt-0.5 truncate">
                  {language === 'en'
                    ? 'View all trail lines & numbered badges simultaneously on 3D map'
                    : language === 'zh'
                    ? '在3D地图上同时呈现全线轨迹与各コース番号，点击任意番号可直接查看'
                    : '全トレイルの軌跡と番号を3Dマップ上に同時展開・番号タップで即座に確認'}
                </p>
              </div>
            </div>
            <span className={`text-[10.5px] px-2.5 py-1 rounded-lg font-black shrink-0 transition-all ${
              selectedRoute?.id === 'all'
                ? 'bg-cyan-400 text-black shadow-glow-cyan animate-pulse'
                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 group-hover:bg-cyan-500/25 group-hover:text-white'
            }`}>
              {selectedRoute?.id === 'all' ? '表示中 ✓' : '全体表示 ›'}
            </span>
          </div>

          {/* Interactive Trail Numbers Grid (Client Requirement: Click any trail number to check that trail in map) */}
          <div className="mt-2.5 pt-2 border-t border-cyan-400/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] font-bold text-cyan-300 flex items-center gap-1">
                <span>📍</span>
                <span>
                  {language === 'en'
                    ? 'Click any trail number to inspect in map:'
                    : language === 'zh'
                    ? '点击任意路线编号直接在地图中查看：'
                    : '各コース番号をタップして3Dマップで確認:'}
                </span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {activeCategory === 'takao_course' ? '12 コース' : '8 コース'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {ROUTES.filter(r => r.category === activeCategory).slice(0, activeCategory === 'takao_course' ? 12 : 8).map((r) => {
                const badge = ROUTE_BADGE_MAP[r.id];
                const isThisSelected = selectedRoute?.id === r.id;
                const rNameShort = r.name.split('（')[0].replace('コース', '');
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRoute(r);
                    }}
                    className={`flex items-center gap-1.5 p-1 rounded-lg border text-left transition-all ${
                      isThisSelected
                        ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-glow-cyan/40 scale-[1.03]'
                        : 'bg-[#061422]/90 border-white/10 hover:border-cyan-400/60 hover:bg-[#0c263c] text-slate-200'
                    }`}
                    title={`${r.name} を3Dマップで確認`}
                  >
                    {badge && (
                      <span className={`w-4 h-4 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm border border-white/80`}>
                        {badge.num}
                      </span>
                    )}
                    <span className="text-[9.5px] font-bold truncate leading-none">
                      {rNameShort}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {filteredRoutes.map((rawRoute) => {
          const route = getLocalizedRoute(rawRoute, language);
          const isSelected = selectedRoute?.id === route.id;
          const isPopular = route.id === 'route_1';
          const badge = ROUTE_BADGE_MAP[route.id];

          const adminSetting = routeSettings[rawRoute.id];
          const effDifficulty: Difficulty = adminSetting?.difficulty ?? rawRoute.difficulty;
          const effStars: number = adminSetting?.stars ?? rawRoute.difficultyRating ?? (effDifficulty === 'beginner' ? 1 : effDifficulty === 'intermediate' ? 4 : 6);
          const effComment: string | undefined =
            language === 'en'
              ? (adminSetting?.comment_en || adminSetting?.comment || rawRoute.adminComment_en || rawRoute.adminComment)
              : language === 'zh'
              ? (adminSetting?.comment_zh || adminSetting?.comment || rawRoute.adminComment_zh || rawRoute.adminComment)
              : (adminSetting?.comment || rawRoute.adminComment);

          const diffBadge =
            effDifficulty === 'beginner'
              ? { label: t('route.beginner'), bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
              : effDifficulty === 'intermediate'
              ? { label: t('route.intermediate'), bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
              : { label: t('route.advanced'), bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };

          return (
            <div
              key={route.id}
              id={`route-card-${rawRoute.id}`}
              onClick={() => handleSelectRoute(rawRoute)}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                isSelected
                  ? 'bg-gradient-to-r from-[#0d2a3d] via-[#0b2434] to-[#091b28] border-salomon-cyan shadow-[0_0_24px_rgba(6,182,212,0.35)] ring-2 ring-salomon-cyan/60'
                  : 'bg-[#091722]/85 border border-[rgba(80,168,198,0.25)] hover:border-salomon-cyan/60 hover:bg-[#0d2435] hover:shadow-[0_0_14px_rgba(6,182,212,0.20)] active:scale-[0.99]'
              }`}
            >
              {/* Route Title & Badges */}
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Colored Number Badge matching 3D Map */}
                  {badge && (
                    <span className={`w-5 h-5 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-[10.5px] font-black shrink-0 shadow-md border-2 border-white/80 ring-1 ring-black/20`}>
                      {badge.num}
                    </span>
                  )}
                  {/* Glowing Focus Beacon for selected route */}
                  {isSelected && (
                    <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      <span className="absolute inset-0 rounded-full bg-salomon-cyan/50 animate-beaconRing" />
                      <span className="w-2.5 h-2.5 rounded-full bg-salomon-cyan animate-pulseBeacon shadow-glow-cyan" />
                    </div>
                  )}
                  <span className={`text-xs font-bold leading-snug truncate ${isSelected ? 'text-white font-black' : 'text-salomon-text group-hover:text-white'}`}>
                    {route.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isSelected ? (
                    <span className="text-[9px] font-black text-black bg-salomon-cyan px-2 py-0.5 rounded-full flex items-center gap-1 shadow-glow-cyan animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      {language === 'en' ? '3D Active' : language === 'zh' ? '3D联动中' : '3D表示中'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-salomon-cyan group-hover:text-white bg-salomon-cyan/15 group-hover:bg-salomon-cyan/40 px-2 py-0.5 rounded-full border border-salomon-cyan/50 flex items-center gap-0.5 transition-all shadow-sm">
                      {language === 'en' ? 'View 3D ›' : language === 'zh' ? '查看3D ›' : '3Dで見る ›'}
                    </span>
                  )}
                  {isPopular && (
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-0.5 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> {t('route.popular')}
                    </span>
                  )}
                </div>
              </div>

              {/* Specs: Distance, Duration, Cumulative Gain, Max Elevation */}
              <div className="flex items-center gap-2 text-[10px] text-salomon-muted pl-7 flex-wrap">
                <span className="flex items-center gap-0.5 font-bold text-white/90">
                  <MapPin className="w-3 h-3 text-salomon-cyan" />
                  {route.distanceKm}km
                </span>
                {route.durationAscentMin && route.durationDescentMin ? (
                  <span className="flex items-center gap-0.5 text-white/90">
                    <Clock className="w-3 h-3 text-salomon-cyan" />
                    登り{route.durationAscentMin}分 / 下り{route.durationDescentMin}分
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-salomon-cyan" />
                    {route.durationMin}{t('route.min')}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-salomon-cyan" />
                  ↑{route.elevationM}m
                </span>
                {route.gradientNote && (
                  <span className="text-[9px] text-amber-300/90 font-medium px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/25">
                    {route.gradientNote}
                  </span>
                )}
              </div>

              {/* Ratings: Row 1 Difficulty & 6-Star Rating, Row 2 Crowding */}
              <div className="text-[10px] pl-7 mt-1 pt-1 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/60">{t('route.difficulty')}:</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${diffBadge.bg}`}>
                    {diffBadge.label}
                  </span>
                  {renderDifficultyStars(effStars, 6)}
                </div>
                <div className="text-white/60 text-[9px] flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 text-salomon-cyan" />
                  <span>{renderCrowdStars(route.crowdWeekday ?? 1)}</span>
                </div>
              </div>

              {/* Optional Collapsible Detail Toggle for Selected Route */}
              {isSelected && (
                <div className="mt-1.5 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCardRouteId(expandedCardRouteId === route.id ? null : route.id);
                    }}
                    className="w-full py-1 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/35 text-cyan-300 flex items-center justify-between text-[10px] font-bold transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      {expandedCardRouteId === route.id
                        ? (language === 'en' ? 'Hide Details & Elevation Profile ▲' : language === 'zh' ? '收起详情与海拔图 ▲' : '詳細・標高グラフを閉じる ▲')
                        : (language === 'en' ? 'Show Details & Elevation Profile ▼' : language === 'zh' ? '展開して詳細・標高グラフを見る ▼' : '詳細・標高グラフを展開 ▼')}
                    </span>
                    <span className="text-[9px] text-cyan-200/70 font-mono font-semibold bg-cyan-400/15 px-1.5 py-0.2 rounded border border-cyan-400/30">
                      {expandedCardRouteId === route.id ? 'CLOSE' : 'EXPAND'}
                    </span>
                  </button>
                </div>
              )}

              {/* Expanded Route Description & Elevation Profile */}
              {isSelected && expandedCardRouteId === route.id && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-slate-300 leading-relaxed space-y-2.5 animate-fadeIn">
                  {/* Staff Advice Card (Client Requirement) */}
                  {effComment && (
                    <div className="ml-3.5 mr-1 p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 shadow-glow-cyan/15 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>
                          {language === 'en'
                            ? 'SALOMON Staff Advice'
                            : language === 'zh'
                            ? 'SALOMON 工作人员建议'
                            : 'SALOMON スタッフのアドバイス'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed pl-5">
                        {effComment}
                      </p>
                    </div>
                  )}

                  <p className="pl-3.5">{route.description}</p>
                  
                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-1 pl-3.5">
                    {route.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-white/10 text-salomon-cyan px-1.5 py-0.5 rounded-md border border-salomon-cyan/20"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>

                  {/* Elevation Profile Area Chart */}
                  <div className="pt-1">
                    <ElevationProfileChart profile={getElevationProfile(route.id)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attribution Footer */}
      <div className="pt-1.5 border-t border-white/8 text-[9px] text-white/40 text-center flex items-center justify-center gap-1 shrink-0">
        <span>{t('route.attribution')}</span>
      </div>
    </div>
  );
}

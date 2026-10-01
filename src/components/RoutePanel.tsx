'use client';

import { useState } from 'react';
import { MapPin, Clock, TrendingUp, Sparkles, Mountain, Users, Star, MessageSquare } from 'lucide-react';
import { ROUTES, getLocalizedRoute } from '@/data/routes';
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

      {/* Client Requirement [29/09/2026 06:38]: 標高プロファイルを全コース一気に見られるカード (TAKAO TRAIL HUB) */}
      <button
        onClick={() => setActiveModal('elevation')}
        className="w-full py-1.5 px-3 rounded-xl bg-[#0c2330]/85 border border-cyan-400/35 hover:border-cyan-400/60 text-cyan-300 hover:text-white flex items-center justify-between transition-all duration-200 shadow-sm group active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black tracking-wide">
            {language === 'en' ? 'All-Course Elevation Profile Hub' : language === 'zh' ? '全路线海拔高度剖面总览' : '全コース標高プロファイル（登山・トレラン）'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/35 font-black font-mono">
            HUB
          </span>
          <span className="text-xs text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">›</span>
        </div>
      </button>

      {/* Quick 20-Course Difficulty Modal Button (登山・トレラン) */}
      <button
        onClick={() => setActiveModal('difficulty')}
        className="w-full py-1.5 px-3 rounded-xl bg-[#221c0e]/85 border border-yellow-400/35 hover:border-yellow-400/60 text-yellow-300 hover:text-white flex items-center justify-between transition-all duration-200 shadow-sm group active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black tracking-wide">
            {language === 'en' ? 'All 20 Courses Difficulty Guide (Hiking & Trail)' : language === 'zh' ? '全20条路线难易度一览（登山・越野跑）' : '全20コース難易度一覧（登山・トレラン）'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5F952] text-black font-black">★1〜6</span>
          <span className="text-xs text-yellow-400 font-bold group-hover:translate-x-0.5 transition-transform">›</span>
        </div>
      </button>

      {/* Primary Category Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#081520]/90 rounded-xl border border-[rgba(80,168,198,0.30)]">
        {CATEGORY_TABS.map(tab => {
          const isActive = activeCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleCategoryChange(tab.value)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 min-h-[36px] flex items-center justify-center text-center leading-tight ${
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
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 min-h-[30px] ${
              activeDifficultyFilter === tab.value
                ? 'bg-salomon-cyan/25 text-salomon-cyan border border-salomon-cyan/60 shadow-glow-cyan/20'
                : 'bg-[#091722] text-slate-300 hover:text-white border border-[rgba(80,168,198,0.30)] hover:border-salomon-cyan/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Instruction Callout Banner (Client Requirement: Visually show people they can learn about each route by selecting this place) */}
      <div className="relative overflow-hidden rounded-xl p-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-cyan-500/15 border-2 border-cyan-400/50 shadow-[0_0_16px_rgba(6,182,212,0.25)] flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg bg-salomon-cyan flex items-center justify-center shrink-0 shadow-glow-cyan text-salomon-black">
          <span className="text-sm font-black animate-bounce">👆</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-salomon-cyan bg-cyan-400/20 px-1.5 py-0.5 rounded border border-cyan-400/40">
              {language === 'en' ? 'Touch & Explore' : language === 'zh' ? '点击体验' : 'タッチして体験'}
            </span>
            <span className="text-[10.5px] font-black text-white truncate">
              {language === 'en' ? 'Select Route to View 3D Path' : language === 'zh' ? '选择路线联动3D全景' : 'コースを選んで3Dルート体験'}
            </span>
          </div>
          <p className="text-[9.5px] text-slate-300 leading-tight mt-0.5">
            {language === 'en'
              ? 'Tap any course to inspect 3D flight, elevation profile & advice'
              : language === 'zh'
              ? '点击下方任意路线即在3D地图联动呈现・包含标高剖面与建议'
              : '各コースをタップすると3Dマップが連動し、詳細情報・標高を表示'}
          </p>
        </div>
      </div>

      {/* Route list */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1 space-y-0.5">
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
              onClick={() => handleSelectRoute(rawRoute)}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                isSelected
                  ? 'bg-gradient-to-r from-[#0d2a3d] via-[#0b2434] to-[#091b28] border-salomon-cyan shadow-[0_0_24px_rgba(6,182,212,0.35)] ring-2 ring-salomon-cyan/60'
                  : 'bg-[#091722]/85 border border-[rgba(80,168,198,0.25)] hover:border-salomon-cyan/60 hover:bg-[#0d2435] hover:shadow-[0_0_14px_rgba(6,182,212,0.20)] active:scale-[0.99]'
              }`}
            >
              {/* Route Title & Badges */}
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Colored Number Badge matching 3D Map */}
                  {badge && (
                    <span className={`w-5 h-5 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm border border-white/50`}>
                      {badge.num}
                    </span>
                  )}
                  {/* Glowing Focus Beacon ⭕ for selected route */}
                  {isSelected && (
                    <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                      <span className="absolute inset-0 rounded-full bg-salomon-cyan/50 animate-beaconRing" />
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-salomon-cyan animate-pulseBeacon shadow-glow-cyan flex items-center justify-center text-[8px] font-black text-salomon-cyan">
                        ⭕
                      </span>
                    </div>
                  )}
                  <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-white font-black' : 'text-salomon-text group-hover:text-white'}`}>
                    {route.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isSelected ? (
                    <span className="text-[9px] font-black text-salomon-cyan bg-salomon-cyan/25 px-2 py-0.5 rounded-full border border-salomon-cyan/60 flex items-center gap-1 shadow-glow-cyan/30 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-salomon-cyan animate-ping" />
                      {language === 'en' ? '3D Active' : language === 'zh' ? '3D联动中' : '3D表示中'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-salomon-cyan/80 group-hover:text-salomon-cyan bg-salomon-cyan/10 group-hover:bg-salomon-cyan/20 px-1.5 py-0.5 rounded border border-salomon-cyan/30 flex items-center gap-0.5 transition-all">
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

              {/* Specs: Distance, Duration (Ascent/Descent), Cumulative Gain, Max Elevation */}
              <div className="flex items-center gap-2 text-[10px] text-salomon-muted pl-3.5 flex-wrap">
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
              <div className="text-[10px] pl-3.5 mt-1.5 pt-1.5 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/60">{t('route.difficulty')}:</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${diffBadge.bg}`}>
                      {diffBadge.label}
                    </span>
                  </div>
                  {renderDifficultyStars(effStars, 6)}
                </div>
                <div className="flex items-center justify-between text-white/60 text-[9.5px]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-salomon-cyan" /> {t('route.weekday')}:
                    {renderCrowdStars(route.crowdWeekday ?? 1)}
                  </span>
                  <span className="flex items-center gap-1">
                    {t('route.weekend')}:
                    {renderCrowdStars(route.crowdWeekend ?? 2)}
                  </span>
                </div>
              </div>

              {/* Expanded Route Description & Elevation Profile */}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-slate-300 leading-relaxed space-y-2.5">
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

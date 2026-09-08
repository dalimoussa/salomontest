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
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/90 shadow-sm">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          className={`w-2 h-2 ${
            i < rating
              ? 'fill-black text-black stroke-black'
              : 'fill-transparent text-black/35 stroke-black/35'
          }`}
        />
      ))}
    </span>
  );
}

export function RoutePanel() {
  const selectedRoute        = useStore(s => s.selectedRoute);
  const setSelectedRoute     = useStore(s => s.setSelectedRoute);
  const setSelectedDifficulty = useStore(s => s.setSelectedDifficulty);
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
    <div className="glass-card p-3 flex flex-col gap-2 animate-fadeInLeft opacity-0-start h-full min-h-0"
         style={{ animationFillMode: 'forwards', animationDelay: '0.25s' }}>
      
      {/* Header with Title & Route Counter */}
      <div className="flex items-center justify-between">
        <p className="section-label">{t('route.title')}</p>
        <span className="text-[10px] text-salomon-cyan font-mono font-bold">
          {t('route.coursesShowing', { count: filteredRoutes.length })}
        </span>
      </div>

      {/* Primary Category Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl border border-white/8">
        {CATEGORY_TABS.map(tab => {
          const isActive = activeCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleCategoryChange(tab.value)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 min-h-[36px] flex items-center justify-center text-center leading-tight ${
                isActive
                  ? 'bg-salomon-cyan text-salomon-black shadow-glow-cyan font-black'
                  : 'text-salomon-muted hover:text-white hover:bg-white/5'
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
                ? 'bg-salomon-cyan/20 text-salomon-cyan border border-salomon-cyan/60 shadow-glow-cyan/20'
                : 'bg-white/5 text-salomon-muted hover:text-white border border-salomon-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Route list */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1 space-y-0.5">
        {filteredRoutes.map((rawRoute) => {
          const route = getLocalizedRoute(rawRoute, language);
          const isSelected = selectedRoute?.id === route.id;
          const isPopular = route.id === 'route_1';

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
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-salomon-cyan/15 border-salomon-cyan shadow-glow-cyan/40 ring-1 ring-salomon-cyan/50'
                  : 'bg-white/5 border-salomon-border hover:border-salomon-cyan/40 hover:bg-white/8 active:scale-[0.99]'
              }`}
            >
              {/* Route Title & Badges */}
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? 'bg-salomon-cyan animate-pulse ring-2 ring-salomon-cyan/40' : 'bg-salomon-muted'
                    }`}
                  />
                  <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-salomon-text'}`}>
                    {route.name}
                  </span>
                </div>
                {isPopular && (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-0.5 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" /> {t('route.popular')}
                  </span>
                )}
              </div>

              {/* Specs: Distance, Duration, Cumulative Gain, Max Elevation */}
              <div className="flex items-center gap-2 text-[10px] text-salomon-muted pl-3.5 flex-wrap">
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-salomon-cyan" />
                  {route.distanceKm}km
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-salomon-cyan" />
                  {route.durationMin}{t('route.min')}
                </span>
                <span className="flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-salomon-cyan" />
                  ↑{route.elevationM}m
                </span>
                <span className="flex items-center gap-0.5 text-white/80">
                  <Mountain className="w-3 h-3 text-amber-300" />
                  {t('route.highest')}:{route.maxElevationM}m
                </span>
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

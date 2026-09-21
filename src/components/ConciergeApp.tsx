'use client';

import { useEffect, useState } from 'react';
import { MainHeader } from './MainHeader';
import { WeatherPanel } from './WeatherPanel';
import { RoutePanel } from './RoutePanel';
import { MountainMap } from './MountainMap';
import { RightPanel } from './RightPanel';
import { ProductCarousel } from './ProductCarousel';
import { QuickActions } from './QuickActions';
import { Footer } from './Footer';
import { EquipmentModal } from './modals/EquipmentModal';
import { StaffModal } from './modals/StaffModal';
import { CableCarModal } from './modals/CableCarModal';
import { DifficultyModal } from './modals/DifficultyModal';
import { HeroSplash } from './HeroSplash';
import { KioskWatchdog } from './KioskWatchdog';
import { TouchRipple } from './TouchRipple';
import { useStore } from '@/store/useStore';
import { useMapStore } from '@/store/mapStore';
import { useAdminStore } from '@/store/useAdminStore';
import { getAIAdvice } from '@/api/llm';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';
import { getTrailStatus } from '@/data/trailStatus';
import { getFacilities } from '@/data/facilities';
import { useT } from '@/lib/i18n';
import { Compass, Mountain, Info, ShoppingBag, ChevronRight } from 'lucide-react';
import type { WeatherData } from '@/types';

function makeKey(routeId: string, difficulty: string, lang: string) {
  return `${routeId}__${difficulty}__${lang}`;
}

function useAppData() {
  const weather             = useStore(s => s.weather);
  const selectedRoute       = useStore(s => s.selectedRoute);
  const selectedDifficulty  = useStore(s => s.selectedDifficulty);
  const language            = useStore(s => s.language);
  const setWeather          = useStore(s => s.setWeather);
  const setWeatherLoading   = useStore(s => s.setWeatherLoading);
  const setWeatherError     = useStore(s => s.setWeatherError);
  const weatherRefreshTick  = useStore(s => s.weatherRefreshTick);
  const addMessage          = useStore(s => s.addMessage);
  const clearMessages       = useStore(s => s.clearMessages);
  const setIsGenerating     = useStore(s => s.setIsGenerating);
  const setRecommendedProducts = useStore(s => s.setRecommendedProducts);
  const setRainOverlay      = useMapStore(s => s.setRainOverlay);
  const setHighlightedRouteId = useMapStore(s => s.setHighlightedRouteId);
  const weatherOverride     = useAdminStore(s => s.weatherOverride);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    // 1. If operator has enabled Manual Weather Override, prioritize it immediately
    if (weatherOverride?.enabled) {
      const data: WeatherData = {
        temp_c:           weatherOverride.temp_c,
        weather:          weatherOverride.weather,
        weatherCode:      weatherOverride.weatherCode,
        windSpeed:        weatherOverride.windSpeed,
        rainProbability:  weatherOverride.rainProbability,
        precipitationMmh: weatherOverride.precipitationMmh,
        uvIndex:          weatherOverride.uvIndex,
        visibility:       weatherOverride.visibility,
        updatedAt:        weatherOverride.updatedAt || new Date().toISOString(),
      };
      setWeather(data);
      const isRaining    = data.precipitationMmh > 0 || data.weatherCode === 'rainy' || data.weatherCode === 'snowy';
      const intensityMmh = data.precipitationMmh > 0 ? data.precipitationMmh : (isRaining ? 2 : 0);
      setRainOverlay(isRaining, intensityMmh);
      setWeatherError(null);
      setWeatherLoading(false);
      return;
    }

    // 2. Automatic Live Weather Fetch Mode
    const load = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const res  = await fetch('/api/weather');
        const data = await res.json() as WeatherData & { _isFallback?: boolean };
        setWeather(data);
        const isRaining    = data.precipitationMmh > 0 || data.weatherCode === 'rainy' || data.weatherCode === 'snowy';
        const intensityMmh = data.precipitationMmh > 0 ? data.precipitationMmh : (isRaining ? 2 : 0);
        setRainOverlay(isRaining, intensityMmh);
        if (!res.ok || data._isFallback) {
          setWeatherError('fallback');
        }
      } catch (e) {
        console.error('Weather fetch error:', e);
        setWeatherError(e instanceof Error ? e.message : 'fetch_failed');
      } finally {
        setWeatherLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWeather, setWeatherLoading, setWeatherError, setRainOverlay, weatherRefreshTick, weatherOverride]);

  useEffect(() => {
    setHighlightedRouteId(selectedRoute?.id ?? null);
  }, [selectedRoute?.id, setHighlightedRouteId]);

  useEffect(() => {
    if (!selectedRoute || !selectedDifficulty || !weather) return;
    const key = makeKey(selectedRoute.id, selectedDifficulty, language);
    if (key === lastKey) return;
    const go = async () => {
      clearMessages();
      setIsGenerating(true);
      setLastKey(key);
      try {
        const trailStatus = getTrailStatus(language);
        const facilities  = getFacilities(language);
        const advice   = await getAIAdvice(weather, selectedRoute, selectedDifficulty, trailStatus, facilities, undefined, language);
        const season   = getCurrentSeason();
        const products = getRecommendedProducts(
          selectedDifficulty, weather.weatherCode, season, advice.recommended_gear, 6, selectedRoute.category, language
        );
        setRecommendedProducts(products);
        addMessage({
          id: crypto.randomUUID(), role: 'ai',
          text: advice.advice_text, advice, products, timestamp: new Date(),
        });
      } catch (e) {
        console.error('Advice error:', e);
        const errText = language === 'en'
          ? 'Failed to load AI guidance.'
          : language === 'zh'
          ? '获取AI向导建议失败。'
          : 'AIアドバイスの取得に失敗しました。';
        addMessage({
          id: crypto.randomUUID(), role: 'system',
          text: errText, timestamp: new Date(),
        });
      } finally {
        setIsGenerating(false);
      }
    };
    go();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute?.id, selectedDifficulty, weather?.weatherCode, language]);
}

/* ── Main App ──────────────────────────────────────────────────────────── */
function MainApp() {
  useAppData();

  const activeModal   = useStore(s => s.activeModal);
  const selectedRoute = useStore(s => s.selectedRoute);
  const { language }  = useT();
  const [mobileTab, setMobileTab] = useState<'map' | 'routes' | 'info' | 'gear'>('map');

  return (
    <div className="relative bg-salomon-black flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* Tactile Water-Ripple Feedback for Touchscreens & Kiosks */}
      <TouchRipple />

      {/* ── Mountain Map / Video Visual Background ── */}
      <MountainMap />

      {/* Unattended kiosk reliability watchdog (inactivity reset + daily purge) */}
      <KioskWatchdog />

      {/* Subtle vignette gradient that lets the central mountain aerial visual pop */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-salomon-dark/40 via-transparent to-salomon-dark/50 pointer-events-none"
        style={{ zIndex: 5 }}
      />

      {/* ── 1. RETAIL SIGNAGE KIOSK INTERFACE (Dedicated 110" Store Display, ≥ lg) ── */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 relative pointer-events-none" style={{ zIndex: 10 }}>
        {/* Header (LOGO, Greeting, Clock, Weather) */}
        <div className="pointer-events-auto">
          <MainHeader />
        </div>

        {/* 3-Column Signage Work Area matching refined kiosk ergonomics */}
        <div className="flex-1 grid lg:grid-cols-[290px_1fr_290px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[360px_1fr_360px] gap-3.5 px-4 lg:px-6 pb-2 min-h-0 pointer-events-none">
          {/* Left Column: Zone ① Weather + Zone ② Routes */}
          <div className="flex flex-col gap-2.5 min-h-0 w-full lg:max-w-[320px] 2xl:max-w-[360px] pointer-events-auto">
            <WeatherPanel />
            <div className="flex-1 min-h-0">
              <RoutePanel />
            </div>
          </div>

          {/* Center Column: Unobstructed Mountain View + Floating Auto-Hiding Gear Guide */}
          <div className="flex flex-col justify-end items-center gap-2 min-h-0 overflow-hidden pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl 2xl:max-w-3xl">
              {/* Zone ④ Gear Guide (Auto-collapses when a route is chosen) */}
              <ProductCarousel />
            </div>
          </div>

          {/* Right Column: Zone ⑤ Trail Status + Zone ⑥ Facilities + Zone ⑦ AI Advice */}
          <div className="min-h-0 flex flex-col w-full lg:max-w-[320px] 2xl:max-w-[360px] pointer-events-auto">
            <RightPanel />
          </div>
        </div>

        {/* Bottom Conversation Bar: Zone ⑧ AI Conversation + Voice Core */}
        <div className="px-4 lg:px-6 pb-2 pointer-events-auto">
          <QuickActions />
        </div>

        {/* Kiosk Footer: 利用規約・言語切替・店舗情報 */}
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>

      {/* ── 2. SMARTPHONE TESTING INTERFACE (< lg) ───────────────────────── */}
      {/* Enables client to verify on mobile Safari without overlapping cards or hidden map */}
      <div className="lg:hidden flex flex-col flex-1 min-h-0 relative z-10">
        {/* Mobile Header (Brand, Clock, Weather) */}
        <div className="pointer-events-auto shrink-0">
          <MainHeader />
        </div>

        {/* Tab 1: 3D Mountain Map View */}
        {mobileTab === 'map' && (
          <div className="flex-1 min-h-0 flex flex-col justify-between pointer-events-none pb-16">
            {/* Floating Current Route Badge with Course Switcher Trigger */}
            <div className="px-4 py-1 pointer-events-auto animate-fadeInDown">
              <button
                onClick={() => setMobileTab('routes')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl glass-card border border-salomon-cyan/40 text-left shadow-glow-cyan/20 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-salomon-cyan animate-pulse shrink-0 ring-2 ring-salomon-cyan/40" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-salomon-muted font-mono uppercase">
                      {language === 'en' ? 'Active Selected Course' : language === 'zh' ? '当前查看路线' : '選択中のコース'}
                    </p>
                    <p className="text-xs font-black text-white truncate">
                      {selectedRoute ? selectedRoute.name : '1号路 (表参道)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-salomon-cyan shrink-0 ml-2">
                  <span>{language === 'en' ? 'Change Route' : language === 'zh' ? '切换路线' : 'コース変更'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Bottom floating widgets: Collapsed Gear Pill + Quick Voice Concierge */}
            <div className="mt-auto px-4 pb-2 pointer-events-auto flex flex-col gap-2">
              <ProductCarousel />
              <QuickActions />
            </div>
          </div>
        )}

        {/* Tab 2: Routes & Weather Guide */}
        {mobileTab === 'routes' && (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-24 space-y-3 pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <WeatherPanel />

            {/* Shortcut button to view the route directly in 3D Map */}
            <button
              onClick={() => setMobileTab('map')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-salomon-cyan/25 to-blue-600/25 border border-salomon-cyan/50 text-salomon-cyan font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-glow-cyan/20 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Inspect Selected Course in 3D Map ›'
                  : language === 'zh'
                  ? '在3D地图中查看路线轨迹 ›'
                  : '🗺️ 選択中のコースを3Dマップで確認する ›'}
              </span>
            </button>

            <RoutePanel />
          </div>
        )}

        {/* Tab 3: Facilities & Trail Information */}
        {mobileTab === 'info' && (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-24 space-y-3 pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RightPanel />
            <Footer />
          </div>
        )}

        {/* Tab 4: Recommended Gear Guide */}
        {mobileTab === 'gear' && (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-24 space-y-3 pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <ProductCarousel />
            <Footer />
          </div>
        )}

        {/* Mobile Floating Bottom Navigation Bar (< lg) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#081028]/95 border-t border-salomon-border/80 backdrop-blur-xl px-2 py-1.5 pb-safe flex items-center justify-around pointer-events-auto shadow-2xl">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'text-salomon-cyan font-black bg-salomon-cyan/15 ring-1 ring-salomon-cyan/40 shadow-glow-cyan/30'
                : 'text-salomon-muted hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] tracking-wide">
              {language === 'en' ? '3D Map' : language === 'zh' ? '3D地图' : '3Dマップ'}
            </span>
          </button>

          <button
            onClick={() => setMobileTab('routes')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              mobileTab === 'routes'
                ? 'text-salomon-cyan font-black bg-salomon-cyan/15 ring-1 ring-salomon-cyan/40 shadow-glow-cyan/30'
                : 'text-salomon-muted hover:text-white'
            }`}
          >
            <Mountain className="w-4 h-4" />
            <span className="text-[10px] tracking-wide">
              {language === 'en' ? 'Courses' : language === 'zh' ? '登山路线' : 'コース'}
            </span>
          </button>

          <button
            onClick={() => setMobileTab('info')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              mobileTab === 'info'
                ? 'text-salomon-cyan font-black bg-salomon-cyan/15 ring-1 ring-salomon-cyan/40 shadow-glow-cyan/30'
                : 'text-salomon-muted hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="text-[10px] tracking-wide">
              {language === 'en' ? 'Facilities' : language === 'zh' ? '设施・状况' : '施設・状況'}
            </span>
          </button>

          <button
            onClick={() => setMobileTab('gear')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              mobileTab === 'gear'
                ? 'text-salomon-cyan font-black bg-salomon-cyan/15 ring-1 ring-salomon-cyan/40 shadow-glow-cyan/30'
                : 'text-salomon-muted hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[10px] tracking-wide">
              {language === 'en' ? 'Gear' : language === 'zh' ? '推荐装备' : '装備'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {activeModal === 'equipment'  && <EquipmentModal />}
      {activeModal === 'staff'      && <StaffModal />}
      {activeModal === 'cablecar'   && <CableCarModal />}
      {activeModal === 'difficulty' && <DifficultyModal />}
    </div>
  );
}

/* ── Entry point ────────────────────────────────────────────────────────── */
export function ConciergeApp() {
  const [splashDone, setSplashDone] = useState(false);
  return splashDone
    ? <MainApp />
    : <HeroSplash onComplete={() => setSplashDone(true)} />;
}

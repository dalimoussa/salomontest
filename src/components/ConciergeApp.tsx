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
import { useStore } from '@/store/useStore';
import { useMapStore } from '@/store/mapStore';
import { useAdminStore } from '@/store/useAdminStore';
import { getAIAdvice } from '@/api/llm';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';
import { getTrailStatus } from '@/data/trailStatus';
import { getFacilities } from '@/data/facilities';
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

  const activeModal = useStore(s => s.activeModal);

  return (
    <div className="relative bg-salomon-black flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* ── Mountain Map / Video Visual Background ── */}
      <MountainMap />

      {/* Unattended kiosk reliability watchdog (inactivity reset + daily purge) */}
      <KioskWatchdog />

      {/* Subtle vignette gradient that lets the central mountain aerial visual pop */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-salomon-dark/40 via-transparent to-salomon-dark/50 pointer-events-none"
        style={{ zIndex: 5 }}
      />

      {/* ── RETAIL SIGNAGE KIOSK INTERFACE (Dedicated 110" Store Display) ── */}
      <div className="flex flex-col flex-1 min-h-0 relative pointer-events-none" style={{ zIndex: 10 }}>
        {/* Header (LOGO, Greeting, Clock, Weather) */}
        <div className="pointer-events-auto">
          <MainHeader />
        </div>

        {/* 3-Column Signage Work Area matching refined kiosk ergonomics */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_1fr_290px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[360px_1fr_360px] gap-3.5 px-4 lg:px-6 pb-2 min-h-0 overflow-y-auto lg:overflow-visible pointer-events-none">
          {/* Left Column: Zone ① Weather + Zone ② Routes */}
          <div className="flex flex-col gap-2.5 min-h-0 w-full lg:max-w-[320px] 2xl:max-w-[360px] pointer-events-auto">
            <WeatherPanel />
            <div className="flex-1 min-h-0">
              <RoutePanel />
            </div>
          </div>

          {/* Center Column: Unobstructed Mountain View + Floating Gear Guide */}
          <div className="flex flex-col justify-end items-center gap-2 min-h-0 overflow-hidden pointer-events-none order-last lg:order-none">
            <div className="pointer-events-auto w-full max-w-2xl 2xl:max-w-3xl">
              {/* Zone ④ Gear Guide */}
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

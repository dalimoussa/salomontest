'use client';

import { useEffect, useState } from 'react';
import { Map, CloudSun, Navigation, ShoppingBag, Sparkles } from 'lucide-react';
import { MainHeader } from './MainHeader';
import { WeatherPanel } from './WeatherPanel';
import { RoutePanel } from './RoutePanel';
import { MountainMap } from './MountainMap';
import { RightPanel } from './RightPanel';
import { ProductCarousel } from './ProductCarousel';
import { QuickActions } from './QuickActions';
import { QRModal } from './modals/QRModal';
import { EquipmentModal } from './modals/EquipmentModal';
import { StaffModal } from './modals/StaffModal';
import { HeroSplash } from './HeroSplash';
import { useStore } from '@/store/useStore';
import { fetchWeather } from '@/api/weather';
import { getAIAdvice } from '@/api/llm';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';

/* ── Types ────────────────────────────────────────────────────────────── */
type MobileTab = 'map' | 'weather' | 'route' | 'gear' | 'ai';

const MOBILE_TABS: { id: MobileTab; label: string; Icon: typeof Map }[] = [
  { id: 'map',     label: 'マップ',  Icon: Map },
  { id: 'weather', label: '天気',    Icon: CloudSun },
  { id: 'route',   label: 'ルート',  Icon: Navigation },
  { id: 'gear',    label: '装備',    Icon: ShoppingBag },
  { id: 'ai',      label: 'AIアドバイス', Icon: Sparkles },
];

/* ── Data-loading logic (shared between layouts) ──────────────────────── */
function makeKey(routeId: string, difficulty: string) {
  return `${routeId}__${difficulty}`;
}

function useAppData() {
  const weather             = useStore(s => s.weather);
  const selectedRoute       = useStore(s => s.selectedRoute);
  const selectedDifficulty  = useStore(s => s.selectedDifficulty);
  const setWeather          = useStore(s => s.setWeather);
  const setWeatherLoading   = useStore(s => s.setWeatherLoading);
  const addMessage          = useStore(s => s.addMessage);
  const clearMessages       = useStore(s => s.clearMessages);
  const setIsGenerating     = useStore(s => s.setIsGenerating);
  const setRecommendedProducts = useStore(s => s.setRecommendedProducts);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setWeatherLoading(true);
      try { setWeather(await fetchWeather()); }
      catch (e) { console.error('Weather fetch error:', e); }
      finally { setWeatherLoading(false); }
    };
    load();
    const iv = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(iv);
  }, [setWeather, setWeatherLoading]);

  useEffect(() => {
    if (!selectedRoute || !selectedDifficulty || !weather) return;
    const key = makeKey(selectedRoute.id, selectedDifficulty);
    if (key === lastKey) return;
    const go = async () => {
      clearMessages();
      setIsGenerating(true);
      setLastKey(key);
      try {
        const advice   = await getAIAdvice(weather, selectedRoute, selectedDifficulty);
        const season   = getCurrentSeason();
        const products = getRecommendedProducts(
          selectedDifficulty, weather.weatherCode, season, advice.recommended_gear, 6
        );
        setRecommendedProducts(products);
        addMessage({
          id: crypto.randomUUID(), role: 'ai',
          text: advice.advice_text, advice, products, timestamp: new Date(),
        });
      } catch (e) {
        console.error('Advice error:', e);
        addMessage({
          id: crypto.randomUUID(), role: 'system',
          text: 'AIアドバイスの取得に失敗しました。', timestamp: new Date(),
        });
      } finally {
        setIsGenerating(false);
      }
    };
    go();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute?.id, selectedDifficulty, weather?.weatherCode]);
}

/* ── Mobile drawer panel ───────────────────────────────────────────────── */
function MobileDrawer({ tab, open }: { tab: MobileTab; open: boolean }) {
  return (
    <div className={`mobile-drawer ${open ? 'open' : 'closed'}`}>
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      <div className="px-4 pb-4 space-y-4" style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}>
        {tab === 'weather' && <WeatherPanel />}
        {tab === 'route'   && <RoutePanel />}
        {tab === 'gear'    && (
          <div className="space-y-4">
            <ProductCarousel />
            <QuickActions />
          </div>
        )}
        {tab === 'ai' && <RightPanel />}
      </div>
    </div>
  );
}

/* ── Mobile bottom tab bar ─────────────────────────────────────────────── */
function MobileTabBar({
  active, onSelect,
}: {
  active: MobileTab;
  onSelect: (t: MobileTab) => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end"
      style={{
        background: 'rgba(8,14,32,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {MOBILE_TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors active:opacity-70"
            aria-label={label}
            aria-pressed={isActive}
          >
            <Icon
              className={`w-5 h-5 transition-all duration-200 ${
                isActive ? 'text-salomon-cyan scale-110' : 'text-salomon-muted'
              }`}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span
              className={`text-[9px] font-semibold tracking-wide transition-colors leading-none ${
                isActive ? 'text-salomon-cyan' : 'text-salomon-muted'
              }`}
            >
              {label}
            </span>
            {/* Active indicator dot */}
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-salomon-cyan shadow-glow-cyan mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Mobile overlay backdrop ───────────────────────────────────────────── */
function Backdrop({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-20 bg-black/40"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

/* ── Main App ──────────────────────────────────────────────────────────── */
function MainApp() {
  useAppData();

  const activeModal = useStore(s => s.activeModal);
  const [mobileTab,     setMobileTab]     = useState<MobileTab>('map');
  const [drawerOpen,    setDrawerOpen]    = useState(false);

  const handleTabSelect = (tab: MobileTab) => {
    if (tab === 'map') {
      setDrawerOpen(false);
      setMobileTab('map');
    } else if (mobileTab === tab && drawerOpen) {
      // Tap same tab twice → close drawer
      setDrawerOpen(false);
    } else {
      setMobileTab(tab);
      setDrawerOpen(true);
    }
  };

  return (
    <div className="relative bg-salomon-black" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* ── Full-screen map (always behind everything) ─────────────── */}
      <MountainMap />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-salomon-dark/25 via-transparent to-salomon-dark/40 pointer-events-none"
        style={{ zIndex: 5 }}
      />

      {/* ── DESKTOP layout (≥ lg) ───────────────────────────────────── */}
      <div className="hidden lg:flex absolute inset-0 flex-col" style={{ zIndex: 10 }}>
        {/* Header */}
        <MainHeader />

        {/* 3-column grid */}
        <div
          className="flex-1 grid gap-3 px-4 pb-2 min-h-0"
          style={{ gridTemplateColumns: '220px 1fr 220px' }}
        >
          {/* Left */}
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
            <WeatherPanel />
            <div className="flex-1 min-h-0 overflow-y-auto">
              <RoutePanel />
            </div>
          </div>

          {/* Center — transparent (shows map), product carousel floats at bottom */}
          <div className="flex flex-col justify-end gap-3 min-h-0 overflow-hidden pointer-events-none">
            <div className="space-y-2.5 pointer-events-auto">
              <ProductCarousel />
            </div>
          </div>

          {/* Right */}
          <div className="min-h-0 overflow-y-auto">
            <RightPanel />
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="px-4 pb-3">
          <QuickActions />
        </div>
      </div>

      {/* ── MOBILE / TABLET layout (< lg) ──────────────────────────── */}
      <div className="lg:hidden absolute inset-0 flex flex-col" style={{ zIndex: 10 }}>
        {/* Compact header */}
        <MainHeader />

        {/* Map tap area shows quick hint when no drawer open */}
        {!drawerOpen && (
          <div className="flex-1 flex items-end justify-center pb-24 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-full
                            px-4 py-1.5 animate-fadeInUp opacity-0-start"
              style={{ animationFillMode: 'forwards', animationDelay: '0.8s' }}>
              <p className="text-white/60 text-[10px] tracking-wide text-center">
                👆 下のタブでルート・天気・装備を確認
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile drawer backdrop ──────────────────────────────────── */}
      <Backdrop
        visible={drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Mobile drawer content ───────────────────────────────────── */}
      <div className="lg:hidden" style={{ zIndex: 30 }}>
        <MobileDrawer tab={mobileTab} open={drawerOpen} />
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────────────── */}
      <div className="lg:hidden">
        <MobileTabBar active={mobileTab} onSelect={handleTabSelect} />
      </div>

      {/* ── Modals (all breakpoints) ────────────────────────────────── */}
      {activeModal === 'qr'        && <QRModal />}
      {activeModal === 'equipment' && <EquipmentModal />}
      {activeModal === 'staff'     && <StaffModal />}
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

'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, TrainFront, Compass, Layers, RotateCcw } from 'lucide-react';
import type { Map } from 'maplibre-gl';
import { useStore } from '@/store/useStore';
import { useMapStore } from '@/store/mapStore';
import { useAdminStore } from '@/store/useAdminStore';
import { RainOverlay } from './map/RainOverlay';
import { useT } from '@/lib/i18n';

import { ErrorBoundary } from './ErrorBoundary';

// Mt. Takao summit — used by "re-centre" reset button
const TAKAO_SUMMIT: [number, number] = [139.2485, 35.6275];
const DEFAULT_ZOOM  = 13.7;
const DEFAULT_PITCH = 58;
const DEFAULT_BEARING = -22;

const PERSPECTIVES = [
  { pitch: 68, bearing: -22, zoom: 14.1, label: '3D俯瞰 (急傾斜)' },
  { pitch: 78, bearing: 40,  zoom: 13.6, label: '3Dパノラマ (広角)' },
  { pitch: 58, bearing: -60, zoom: 14.3, label: '3D尾根アングル' },
  { pitch: 0,  bearing: 0,   zoom: 13.5, label: '2D真上 (平面図)' },
];

// MapLibre requires window/WebGL — never SSR this subtree
const MountainMapGL = dynamic(
  () => import('./map/MountainMapGL').then((m) => ({ default: m.MountainMapGL })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-salomon-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-salomon-cyan border-t-transparent animate-spin" />
          <p className="text-salomon-muted text-xs">3Dマップ読み込み中…</p>
        </div>
      </div>
    ),
  }
);

// Mount Takao Local 3D WebGL Viewer (Self-hosted, standalone engine)
const Live3DMountainViewer = dynamic(
  () => import('./map/Live3DMountainViewer').then((m) => ({ default: m.Live3DMountainViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#070D1E]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-salomon-cyan border-t-transparent animate-spin" />
          <p className="text-salomon-muted text-xs">高尾山 3Dリアルタイムシーン読込中…</p>
        </div>
      </div>
    ),
  }
);

/**
 * Photorealistic Fallback / Video Slot for 3D Map Hand-off.
 * When the dedicated 3D engineer provides a 4K drone video flyover or WebGL model,
 * it drops directly into this slot.
 */
function MountainVisualSlot() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-salomon-black">
      <img
        src="/mountain-photo.jpeg"
        alt="高尾山 全景"
        className="w-full h-full object-cover opacity-90 scale-105 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-salomon-dark/80 via-transparent to-salomon-dark/60 pointer-events-none" />
    </div>
  );
}

export function MountainMap() {
  const mapInstanceRef = useRef<Map | null>(null);
  const setUserMovedCamera = useMapStore((s) => s.setUserMovedCamera);
  const setActiveModal = useStore((s) => s.setActiveModal);
  const selectedRoute   = useStore((s) => s.selectedRoute);
  const mountainMapMode = useAdminStore((s) => s.mountainMapMode);
  const toggleMountainMapMode = useAdminStore((s) => s.toggleMountainMapMode);
  const { t } = useT();
  const [perspectiveIndex, setPerspectiveIndex] = useState(0);
  const [pocReloadKey, setPocReloadKey] = useState(0);

  const handleMapReady = useCallback((map: Map) => {
    mapInstanceRef.current = map;
  }, []);

  const handleZoomIn  = () => mapInstanceRef.current?.zoomIn({ duration: 250 });
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut({ duration: 250 });
  const handleReset   = () => {
    if (isLivePoc) {
      setPocReloadKey((k) => k + 1);
      return;
    }
    setUserMovedCamera(false);
    mapInstanceRef.current?.flyTo({
      center: TAKAO_SUMMIT,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 1200,
      essential: true,
      padding: { top: 90, bottom: 290, left: 370, right: 370 },
    });
  };

  const handleToggle3D = () => {
    if (isLivePoc) {
      // In 3D PoC mode, allow toggling back to MapLibre
      toggleMountainMapMode();
      return;
    }
    setUserMovedCamera(true);
    const nextIdx = (perspectiveIndex + 1) % PERSPECTIVES.length;
    setPerspectiveIndex(nextIdx);
    const p = PERSPECTIVES[nextIdx];
    mapInstanceRef.current?.flyTo({
      pitch: p.pitch,
      bearing: p.bearing,
      zoom: p.zoom,
      duration: 1000,
      essential: true,
      padding: { top: 90, bottom: 290, left: 370, right: 370 },
    });
  };

  // Mountain Map Mode:
  // When mountainMapMode === '3d_live_poc' (default):
  // EVERY route (1号路, 2号路, 3号路, 4号路, 5号路, 6号路, 稲荷山, 陣馬山) renders with the exact same
  // 3D WebGL Mountain scene with animated terrain, trees, camera fly-through, and waypoint holds!
  const isLivePoc = mountainMapMode === '3d_live_poc';

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
      role="main"
      id="mountain-visual-container"
    >
      {/* 
        3D Terrain / Live PoC Slot:
        Direct Live 3D Scene with smooth camera follow, glowing beacon, and waypoint highlights
        across all 8 Mt. Takao routes. Toggleable to MapLibre via the layers icon.
      */}
      <ErrorBoundary fallback={<MountainVisualSlot />}>
        {isLivePoc ? (
          <Live3DMountainViewer
            key={`${selectedRoute?.id || 'route_1'}-${pocReloadKey}`}
            routeId={selectedRoute?.id || 'route_1'}
          />
        ) : (
          <MountainMapGL onMapReady={handleMapReady} />
        )}
      </ErrorBoundary>

      {/* Rain particle overlay — above map canvas, below UI controls */}
      <RainOverlay />

      {/* 3D Course Status Indicator Badge */}
      {selectedRoute && (
        <div
          className="hidden lg:block absolute top-16 left-4 lg:left-[310px] xl:left-[340px] 2xl:left-[380px] z-20
                     animate-fadeIn opacity-0-start pointer-events-none"
          style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}
        >
          <div className="bg-[#081226]/90 backdrop-blur-md border border-salomon-cyan/40
                          rounded-full px-3.5 py-1 shadow-glass flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-salomon-cyan animate-pulse ring-2 ring-salomon-cyan/30" />
            <span className="text-[11px] font-bold text-salomon-cyan">
              {isLivePoc ? `${selectedRoute.name} (3Dリアルタイムシーン)` : `${selectedRoute.name} (3D地形ルート)`}
            </span>
          </div>
        </div>
      )}

      {/* Map Action Controls (Floating within the central mountain viewport) */}
      <div
        className="absolute top-16 right-3 lg:right-[310px] xl:right-[340px] 2xl:right-[380px] z-30 flex flex-col gap-2
                   animate-fadeIn opacity-0-start pointer-events-auto"
        style={{ animationFillMode: 'forwards', animationDelay: '0.6s' }}
      >
        {/* 3D Map Engine Toggle Button (Live 3D PoC vs MapLibre 3D) */}
        <button
          onClick={toggleMountainMapMode}
          aria-label={isLivePoc ? 'MapLibre 3Dへ切替' : '3DリアルタイムPoCへ切替'}
          title={isLivePoc ? '現在: 3D PoC (クリックでMapLibre 3Dへ切替)' : '現在: MapLibre (クリックで3D PoCへ切替)'}
          className={`w-9 h-9 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-200 shadow-glass active:scale-95 group ${
            isLivePoc
              ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/35 shadow-cyan-500/20'
              : 'bg-salomon-card/90 border-salomon-border hover:border-salomon-cyan/60 text-salomon-muted group-hover:text-salomon-cyan'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Cable Car Info Shortcut Button */}
        <button
          onClick={() => setActiveModal('cablecar')}
          aria-label="ケーブルカー運行情報"
          title="ケーブルカー運行情報"
          className="w-9 h-9 rounded-xl bg-salomon-card/90 backdrop-blur-md
                     border border-salomon-border hover:border-salomon-cyan/60
                     flex items-center justify-center transition-all duration-200
                     shadow-glass active:scale-95 group"
        >
          <TrainFront className="w-4 h-4 text-salomon-muted group-hover:text-salomon-cyan transition-colors" />
        </button>

        {/* Zoom & 3D Perspective Controls */}
        <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
          {isLivePoc ? (
            /* Controls for 3D Live PoC */
            <>
              <button
                onClick={handleReset}
                aria-label="3D視点を初期化・再読み込み"
                title="3D視点を初期化・再読み込み"
                className="w-9 h-9 rounded-xl bg-salomon-card/90 backdrop-blur-md
                           border border-salomon-border hover:border-salomon-cyan/60
                           flex items-center justify-center transition-all duration-200
                           shadow-glass active:scale-95 group"
              >
                <RotateCcw className="w-4 h-4 text-salomon-muted group-hover:text-salomon-cyan transition-colors" />
              </button>
            </>
          ) : (
            /* Controls for MapLibre Interactive 3D */
            [
              { fn: handleToggle3D, Icon: Compass,   label: PERSPECTIVES[perspectiveIndex].label },
              { fn: handleZoomIn,   Icon: ZoomIn,    label: 'ズームイン' },
              { fn: handleZoomOut,  Icon: ZoomOut,   label: 'ズームアウト' },
              { fn: handleReset,    Icon: Maximize2, label: '3D視点を初期化' },
            ].map(({ fn, Icon, label }) => (
              <button
                key={label}
                onClick={fn}
                aria-label={label}
                title={label}
                className="w-9 h-9 rounded-xl bg-salomon-card/90 backdrop-blur-md
                           border border-salomon-border hover:border-salomon-cyan/60
                           flex items-center justify-center transition-all duration-200
                           shadow-glass active:scale-95 group"
              >
                <Icon className="w-4 h-4 text-salomon-muted group-hover:text-salomon-cyan transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* 3D Interaction hint — centered in upper mountain view on desktop */}
      <div
        className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 z-20
                   animate-fadeIn opacity-0-start pointer-events-none"
        style={{ animationFillMode: 'forwards', animationDelay: '1s' }}
      >
        <div className="bg-salomon-dark/85 backdrop-blur-md border border-salomon-cyan/30
                        rounded-full px-4 py-1.5 shadow-glass">
          {isLivePoc ? (
            <p className="text-salomon-text text-[11px] tracking-wide flex items-center gap-2">
              <span>🖱️ 左ドラッグ: 3D回転</span>
              <span className="text-salomon-muted">·</span>
              <span>右ドラッグ: 平行移動</span>
              <span className="text-salomon-muted">·</span>
              <span className="text-salomon-cyan font-bold">ホイール: ズーム (3D WebGL)　|　レイヤースイッチ: エンジン切替</span>
            </p>
          ) : (
            <p className="text-salomon-text text-[11px] tracking-wide flex items-center gap-2">
              <span>🖱️ {t('map.hintPan')}</span>
              <span className="text-salomon-muted">·</span>
              <span>{t('map.hintZoom')}</span>
              <span className="text-salomon-muted">·</span>
              <span className="text-salomon-cyan font-bold">{t('map.hintRotate')}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

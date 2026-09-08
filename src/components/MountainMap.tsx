'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Video, TrainFront, Compass } from 'lucide-react';
import type { Map } from 'maplibre-gl';
import { useStore } from '@/store/useStore';
import { useMapStore } from '@/store/mapStore';
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
  const { t } = useT();
  const [perspectiveIndex, setPerspectiveIndex] = useState(0);

  const handleMapReady = useCallback((map: Map) => {
    mapInstanceRef.current = map;
  }, []);

  const handleZoomIn  = () => mapInstanceRef.current?.zoomIn({ duration: 250 });
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut({ duration: 250 });
  const handleReset   = () => {
    setUserMovedCamera(false);
    mapInstanceRef.current?.flyTo({
      center: TAKAO_SUMMIT,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 1200,
      essential: true,
    });
  };

  const handleToggle3D = () => {
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
    });
  };

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
      role="main"
      id="mountain-visual-container"
    >
      {/* 
        3D Terrain / Video Slot:
        Decoupled slot for the scheduled 3D map engineer.
        If WebGL or MapLibre fails, smoothly falls back to photorealistic visual/video slot.
      */}
      <ErrorBoundary fallback={<MountainVisualSlot />}>
        <MountainMapGL onMapReady={handleMapReady} />
      </ErrorBoundary>

      {/* Rain particle overlay — above map canvas, below UI controls */}
      <RainOverlay />

      {/* Map Action Controls (Floating within the central mountain viewport) */}
      <div
        className="absolute top-16 right-3 lg:right-[310px] xl:right-[340px] 2xl:right-[380px] z-30 flex flex-col gap-2
                   animate-fadeIn opacity-0-start pointer-events-auto"
        style={{ animationFillMode: 'forwards', animationDelay: '0.6s' }}
      >
        {/* Summit Live Camera Shortcut Button */}
        <button
          onClick={() => setActiveModal('camera')}
          aria-label="山頂ライブカメラを見る"
          title="山頂ライブカメラを見る"
          className="w-9 h-9 rounded-xl bg-salomon-card/90 backdrop-blur-md
                     border border-salomon-border hover:border-salomon-cyan/60
                     flex items-center justify-center transition-all duration-200
                     shadow-glass active:scale-95 group relative"
        >
          <Video className="w-4 h-4 text-salomon-cyan" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
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
          {[
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
          ))}
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
          <p className="text-salomon-text text-[11px] tracking-wide flex items-center gap-2">
            <span>🖱️ {t('map.hintPan')}</span>
            <span className="text-salomon-muted">·</span>
            <span>{t('map.hintZoom')}</span>
            <span className="text-salomon-muted">·</span>
            <span className="text-salomon-cyan font-bold">{t('map.hintRotate')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

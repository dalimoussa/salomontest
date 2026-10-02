'use client';

import { useState, useRef, useEffect } from 'react';
import { Mountain, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { useStore } from '@/store/useStore';

import { ROUTES, ALL_ROUTES_OVERVIEW } from '@/data/routes';

interface Live3DMountainViewerProps {
  routeId?: string;
  pocUrl?: string;
  onLoaded?: () => void;
}

export function Live3DMountainViewer({
  routeId = 'route_1',
  pocUrl,
  onLoaded,
}: Live3DMountainViewerProps) {
  const language = useStore((s) => s.language);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hudCategory, setHudCategory] = useState<'takao_course' | 'surrounding_trail'>('takao_course');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Listen for badge clicks inside 3D viewer iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SALOMON_SELECT_ROUTE' && e.data.routeId) {
        if (e.data.routeId === 'all' || e.data.routeId === 'all_routes') {
          useStore.getState().setSelectedRoute(ALL_ROUTES_OVERVIEW);
          return;
        }
        let targetId = e.data.routeId;
        if (targetId === 'inariyama') targetId = 'route_inariyama';
        const target = ROUTES.find((r) => r.id === targetId);
        if (target) {
          useStore.getState().setSelectedRoute(target);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // By default, load our local multi-route 3D mountain viewer which supports all 8 trails
  const effectiveUrl = pocUrl || `/3d-viewer/index.html?route=${encodeURIComponent(routeId)}`;

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Timeout fallback in case iframe load event is delayed
    const timeout = setTimeout(() => {
      setIsLoading(false);
      onLoaded?.();
    }, 2800);

    return () => clearTimeout(timeout);
  }, [effectiveUrl, onLoaded]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoaded?.();
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      iframeRef.current.src = effectiveUrl;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070D1E] select-none">
      {/* ── Live WebGL 3D Mountain Iframe ─────────────────────────────────────── */}
      <iframe
        ref={iframeRef}
        src={effectiveUrl}
        title="Mount Takao 3D Mountain Animation (PoC v0.1)"
        className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        onLoad={handleIframeLoad}
        onError={() => setHasError(true)}
      />

      {/* ── Transparent Overlay Layer ── */}
      <div
        className="absolute inset-0 pointer-events-none"
      />

      {/* ── Quick Switch to All Trails Overview from any single route ── */}
      {routeId !== 'all' && routeId !== 'all_routes' && !isLoading && !hasError && (
        <button
          onClick={() => useStore.getState().setSelectedRoute(ALL_ROUTES_OVERVIEW)}
          className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#071324]/90 hover:bg-[#0c2438] border border-cyan-400/50 hover:border-cyan-400 text-white shadow-lg backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
          title={language === 'en' ? 'Show all trails simultaneously on 3D map' : language === 'zh' ? '在3D地图上展开所有路线' : '全トレイル・全コースを3Dマップ上に一括表示'}
        >
          <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-black text-xs flex items-center justify-center shrink-0">
            🌐
          </span>
          <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
            {language === 'en' ? 'All Trails View' : language === 'zh' ? '全路线一览' : '全コース一覧'}
          </span>
        </button>
      )}

      {/* ── All Routes Interactive Trail Numbers HUD on Map (Client Requirement) ── */}
      {(routeId === 'all' || routeId === 'all_routes') && !isLoading && !hasError && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#071324]/95 border border-cyan-400/60 shadow-[0_4px_30px_rgba(0,0,0,0.85),0_0_24px_rgba(6,182,212,0.4)] backdrop-blur-md pointer-events-auto max-w-[94%] animate-fadeInUp"
        >
          <div className="flex items-center justify-between w-full gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11.5px] font-black text-white tracking-wide">
                {language === 'en'
                  ? 'All Trails Active — Click any number to inspect specific trail:'
                  : language === 'zh'
                  ? '全路线一览中 — 点击任意路线编号直接查看对应轨迹：'
                  : '全コース一括表示中 — 番号をクリックして各トレイルを確認:'}
              </span>
            </div>
            {/* Category Toggle inside HUD */}
            <div className="flex items-center gap-1 bg-[#040b14] p-0.5 rounded-lg border border-cyan-400/30 ml-auto">
              <button
                type="button"
                onClick={() => setHudCategory('takao_course')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  hudCategory === 'takao_course'
                    ? 'bg-cyan-400 text-black font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                高尾山 (1〜12)
              </button>
              <button
                type="button"
                onClick={() => setHudCategory('surrounding_trail')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  hudCategory === 'surrounding_trail'
                    ? 'bg-cyan-400 text-black font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                トレラン (1〜8)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {ROUTES.filter(r => r.category === hudCategory).slice(0, hudCategory === 'takao_course' ? 12 : 8).map((r, i) => {
              const num = i + 1;
              const shortName = r.name.split('（')[0].replace('コース', '');
              return (
                <button
                  key={r.id}
                  onClick={() => useStore.getState().setSelectedRoute(r)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-cyan-500/30 border border-white/20 hover:border-cyan-400 text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm group cursor-pointer"
                  title={`${r.name} を3Dマップで確認`}
                >
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-black font-black text-[10px] flex items-center justify-center shrink-0">
                    {num}
                  </span>
                  <span className="text-[10.5px] font-bold text-slate-200 group-hover:text-white truncate">
                    {shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Loading Spinner Overlay ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070D1E]/80 backdrop-blur-sm transition-opacity duration-500">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Mountain className="w-6 h-6 text-cyan-400 absolute" />
          </div>
          <p className="mt-4 text-xs font-bold text-slate-200 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {language === 'en'
              ? 'Loading Mount Takao 3D Realtime Scene...'
              : language === 'zh'
              ? '正在加载高尾山3D实时全景...'
              : '高尾山 3Dリアルタイムシーン読込中…'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            Mount Takao 3D Mountain Animation (PoC v0.1)
          </p>
        </div>
      )}

      {/* ── Error State / Fallback Notice ─────────────────────────────────────── */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070D1E]/90 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            3Dマップサーバーに接続できませんでした
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            3Dマップ描画に問題が発生したか、WebGLコンテキストが一時的に失われた可能性があります。
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              再読込
            </button>
            {pocUrl && (
              <a
                href={pocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
              >
                新しいタブで開く
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

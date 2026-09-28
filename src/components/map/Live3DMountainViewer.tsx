'use client';

import { useState, useRef, useEffect } from 'react';
import { Mountain, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { useStore } from '@/store/useStore';

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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

      {/* ── Subtle Vignette & Contrast Overlay for Floating UI Panels ─────────── */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070D1E]/70 via-transparent to-[#070D1E]/40"
        style={{ mixBlendMode: 'multiply' }}
      />

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

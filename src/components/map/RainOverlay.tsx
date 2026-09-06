'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/mapStore';

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

const MIN_DROPS = 60;
const MAX_DROPS = 600;
// Slight diagonal angle common in Japanese typhoon and frontal rain
const RAIN_ANGLE = (Math.PI / 180) * 15;

function createDrop(width: number, height: number, intensityFraction: number): Raindrop {
  return {
    x: Math.random() * width,
    y: Math.random() * -height,
    length: 12 + Math.random() * 18 * intensityFraction,
    speed: 8 + Math.random() * 12 * intensityFraction,
    opacity: 0.3 + Math.random() * 0.45,
  };
}

export function RainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);
  const dropsRef  = useRef<Raindrop[]>([]);

  const isVisible    = useMapStore((s) => s.isRainOverlayVisible);
  const intensityMmh = useMapStore((s) => s.rainIntensityMmh);

  // Respect prefers-reduced-motion — skip canvas animation for those users
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible || prefersReducedMotion) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 0 = drizzle (1 mm/h), 1 = heavy rain (≥ 20 mm/h)
    const intensityFraction = Math.min(1, Math.max(0, (intensityMmh - 1) / 19));
    const dropCount = Math.round(MIN_DROPS + (MAX_DROPS - MIN_DROPS) * intensityFraction);

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dropsRef.current = Array.from({ length: dropCount }, () =>
        createDrop(canvas.width, canvas.height, intensityFraction)
      );
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const sinA = Math.sin(RAIN_ANGLE);
    const cosA = Math.cos(RAIN_ANGLE);

    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      for (const drop of dropsRef.current) {
        ctx.globalAlpha = drop.opacity;
        ctx.strokeStyle = `rgba(160,200,255,${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + sinA * drop.length, drop.y + cosA * drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += sinA * drop.speed;

        if (drop.y > h || drop.x > w) {
          drop.x = Math.random() * w;
          drop.y = -drop.length;
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isVisible, intensityMmh, prefersReducedMotion]);

  if (!isVisible) return null;

  if (prefersReducedMotion) {
    return (
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-10
                   bg-salomon-card/90 border border-salomon-border backdrop-blur-sm
                   rounded-full px-3 py-1.5 flex items-center gap-2 shadow-glass"
        role="status"
        aria-label="現在雨天です"
        style={{ pointerEvents: 'none' }}
      >
        <span className="text-base leading-none">☔</span>
        <span className="text-xs text-salomon-text font-medium">現在雨天です</span>
      </div>
    );
  }

  return (
    <>
      {/* Subtle desaturation + dark fog overlay to sell the overcast mood during rain */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 3,
          background: 'linear-gradient(180deg,rgba(10,14,26,0.28) 0%,rgba(13,21,41,0.12) 100%)',
          backdropFilter: 'saturate(0.6) brightness(0.87)',
          WebkitBackdropFilter: 'saturate(0.6) brightness(0.87)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 4 }}
      />
    </>
  );
}

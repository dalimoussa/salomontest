'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useStore } from '@/store/useStore';

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  wobblePhase: number;
  wobbleSpeed: number;
}

interface SunMote {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulsePhase: number;
}

const MIN_DROPS = 60;
const MAX_DROPS = 550;
const SNOW_FLAKE_COUNT = 180;
const SUN_MOTE_COUNT = 45;

export function RainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);

  const isRainOverlayVisible = useMapStore((s) => s.isRainOverlayVisible);
  const rainIntensityMmh     = useMapStore((s) => s.rainIntensityMmh);
  const weather              = useStore((s) => s.weather);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const weatherCode = weather?.weatherCode ?? 'partly_cloudy';
  const windSpeed   = weather?.windSpeed ?? 3; // m/s
  const tempC       = weather?.temp_c ?? 18;

  // Determine current active weather mode
  const isSnow = weatherCode === 'snowy' || (isRainOverlayVisible && tempC <= 2);
  const isRain = !isSnow && (isRainOverlayVisible || weatherCode === 'rainy' || (weather?.precipitationMmh ?? 0) > 0);
  const isSun  = weatherCode === 'sunny';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (!isRain && !isSnow && !isSun) || prefersReducedMotion) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Intensity calculation for rain
    const effectiveMmh = rainIntensityMmh > 0 ? rainIntensityMmh : (isRain ? 2 : 0);
    const intensityFraction = Math.min(1, Math.max(0, (effectiveMmh - 1) / 19));
    const dropCount = Math.round(MIN_DROPS + (MAX_DROPS - MIN_DROPS) * intensityFraction);

    // Wind angle calculation (wind speed tilts rain and drives snow drift)
    const rainTilt = Math.max(-0.6, Math.min(0.6, (windSpeed - 1.5) * 0.08));
    const sinA = Math.sin(rainTilt);
    const cosA = Math.cos(rainTilt);

    // Initialize particle arrays
    let drops: Raindrop[] = [];
    let flakes: Snowflake[] = [];
    let motes: SunMote[] = [];

    const initParticles = () => {
      const w = canvas.width;
      const h = canvas.height;

      if (isRain) {
        drops = Array.from({ length: dropCount }, () => ({
          x: Math.random() * (w + 200) - 100,
          y: Math.random() * -h,
          length: 12 + Math.random() * 18 * intensityFraction,
          speed: 9 + Math.random() * 11 * intensityFraction,
          opacity: 0.28 + Math.random() * 0.45,
        }));
      }

      if (isSnow) {
        flakes = Array.from({ length: SNOW_FLAKE_COUNT }, () => ({
          x: Math.random() * (w + 100) - 50,
          y: Math.random() * h,
          radius: 1.2 + Math.random() * 2.8,
          speed: 0.8 + Math.random() * 1.8,
          opacity: 0.35 + Math.random() * 0.55,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
        }));
      }

      if (isSun) {
        motes = Array.from({ length: SUN_MOTE_COUNT }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 1.0 + Math.random() * 2.2,
          speedY: -0.2 - Math.random() * 0.4,
          speedX: (windSpeed * 0.1) + (Math.random() - 0.5) * 0.3,
          opacity: 0.2 + Math.random() * 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
        }));
      }
    };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let time = 0;

    const tick = () => {
      time += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Render Rain Streaks with Wind Tilt
      if (isRain) {
        ctx.save();
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (const drop of drops) {
          ctx.globalAlpha = drop.opacity;
          ctx.strokeStyle = `rgba(168,210,255,${drop.opacity})`;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + sinA * drop.length, drop.y + cosA * drop.length);
          ctx.stroke();

          drop.y += drop.speed * cosA;
          drop.x += drop.speed * sinA;

          if (drop.y > h || drop.x > w + 100 || drop.x < -100) {
            drop.x = Math.random() * (w + 200) - 100;
            drop.y = -drop.length;
          }
        }
        ctx.restore();
      }

      // 2. Render Soft Snowflakes Drifting in Wind
      if (isSnow) {
        ctx.save();
        for (const flake of flakes) {
          const windDrift = (windSpeed * 0.35) + Math.sin(time * flake.wobbleSpeed + flake.wobblePhase) * 0.8;
          flake.x += windDrift;
          flake.y += flake.speed;

          if (flake.y > h) {
            flake.y = -5;
            flake.x = Math.random() * (w + 100) - 50;
          }
          if (flake.x > w + 50) {
            flake.x = -10;
          } else if (flake.x < -50) {
            flake.x = w + 10;
          }

          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240,248,255,${flake.opacity})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Render Sunny Golden Sunbeam Dust Motes
      if (isSun) {
        ctx.save();
        for (const mote of motes) {
          mote.x += mote.speedX;
          mote.y += mote.speedY;

          if (mote.y < -10) {
            mote.y = h + 5;
            mote.x = Math.random() * w;
          }
          if (mote.x > w + 10) mote.x = -5;
          if (mote.x < -10) mote.x = w + 5;

          const alpha = mote.opacity * (0.6 + 0.4 * Math.sin(time * 0.04 + mote.pulsePhase));
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,230,160,${alpha})`;
          ctx.shadowColor = 'rgba(255,200,80,0.5)';
          ctx.shadowBlur = 4;
          ctx.fill();
        }
        ctx.restore();
      }

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
  }, [isRain, isSnow, isSun, rainIntensityMmh, windSpeed, prefersReducedMotion]);

  if (!isRain && !isSnow && !isSun) return null;

  if (prefersReducedMotion) {
    const label = isSnow
      ? `❄️ 現在降雪中（気温 ${tempC}℃ / 風速 ${windSpeed}m/s）`
      : isRain
      ? `☔ 現在雨天（降水量 ${rainIntensityMmh || 2}mm/h）`
      : `☀️ 快晴（気温 ${tempC}℃）`;

    return (
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-10
                   bg-salomon-card/90 border border-salomon-border backdrop-blur-sm
                   rounded-full px-3 py-1.5 flex items-center gap-2 shadow-glass"
        role="status"
        aria-label={label}
        style={{ pointerEvents: 'none' }}
      >
        <span className="text-xs text-salomon-text font-medium">{label}</span>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic atmospheric mood backdrop layer */}
      {isRain && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 3,
            background: 'linear-gradient(180deg,rgba(10,14,26,0.32) 0%,rgba(13,21,41,0.15) 100%)',
            backdropFilter: 'saturate(0.6) brightness(0.88)',
            WebkitBackdropFilter: 'saturate(0.6) brightness(0.88)',
          }}
        />
      )}

      {isSnow && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 3,
            background: 'radial-gradient(circle at 50% 30%, rgba(220,240,255,0.08) 0%, rgba(10,18,35,0.22) 100%)',
            backdropFilter: 'saturate(0.85) contrast(1.05)',
            WebkitBackdropFilter: 'saturate(0.85) contrast(1.05)',
          }}
        />
      )}

      {isSun && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 3,
            background: 'radial-gradient(circle at 88% 12%, rgba(255,225,160,0.12) 0%, rgba(255,240,200,0.04) 40%, transparent 70%)',
          }}
        />
      )}

      {/* Atmospheric particle canvas (Rain / Snow / Sun Motes) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 4 }}
      />
    </>
  );
}

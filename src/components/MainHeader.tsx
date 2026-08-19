'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import type { WeatherCode } from '@/types';

function WeatherIcon({ code, size = 'sm' }: { code: WeatherCode; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs'
    ? 'w-3.5 h-3.5 text-salomon-cyan'
    : 'w-5 h-5 text-salomon-cyan';
  switch (code) {
    case 'sunny':         return <Sun className={cls} />;
    case 'partly_cloudy': return <CloudSun className={cls} />;
    case 'cloudy':        return <Cloud className={cls} />;
    case 'rainy':         return <CloudRain className={cls} />;
    case 'snowy':         return <CloudSnow className={cls} />;
  }
}

export function MainHeader() {
  const weather      = useStore(s => s.weather);
  const heroMessages = useAdminStore(s => s.heroMessages);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');

  return (
    <header className="relative z-20 w-full">

      {/* ── Mobile header (< lg) ─────────────────────────────────────── */}
      <div className="lg:hidden flex items-center justify-between px-4 pt-safe py-3"
        style={{ paddingTop: `max(env(safe-area-inset-top, 0px), 12px)` }}>
        {/* Brand */}
        <div className="animate-fadeInLeft opacity-0-start" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-salomon-red shadow-glow-red animate-pulse-slow" />
            <span className="text-base font-black tracking-[0.12em] text-white">SALOMON</span>
          </div>
          <p className="text-salomon-cyan text-[9px] tracking-widest uppercase font-medium leading-none mt-0.5">
            Mountain AI Concierge
          </p>
        </div>

        {/* Right: clock + weather compact */}
        <div className="flex items-center gap-3 animate-fadeInRight opacity-0-start" style={{ animationFillMode: 'forwards' }}>
          {weather && (
            <div className="flex items-center gap-1">
              <WeatherIcon code={weather.weatherCode} size="xs" />
              <span className="text-sm font-bold text-white tabular-nums">{weather.temp_c}°C</span>
            </div>
          )}
          <div className="text-xl font-black text-white tabular-nums leading-none">
            {hh}:{mm}
          </div>
        </div>
      </div>

      {/* ── Desktop header (≥ lg) ────────────────────────────────────── */}
      <div className="hidden lg:flex items-start justify-between px-6 pt-4 pb-2">
        {/* Left: SALOMON brand */}
        <div className="animate-fadeInLeft opacity-0-start flex-shrink-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-salomon-red shadow-glow-red animate-pulse-slow" />
            <span className="text-xl font-black tracking-[0.15em] text-white">SALOMON</span>
          </div>
          <p className="text-salomon-cyan text-[10px] tracking-[0.2em] uppercase mt-0.5 font-medium">
            Mountain AI Concierge
          </p>
          <p className="text-salomon-muted text-[9px] tracking-widest mt-0.5">
            多言語切り替え・JYAN・英語・中国語
          </p>
        </div>

        {/* Center: Hero title */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 text-center animate-fadeInUp opacity-0-start max-w-2xl px-4"
          style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-2xl xl:text-3xl font-bold text-white leading-tight">
            {heroMessages.greeting}
          </h1>
          <p className="text-salomon-muted text-sm mt-1 tracking-wide">
            {heroMessages.subtitle}
          </p>
        </div>

        {/* Right: clock + weather */}
        <div className="animate-fadeInRight opacity-0-start text-right flex-shrink-0"
          style={{ animationFillMode: 'forwards' }}>
          <div className="text-4xl font-bold text-white tabular-nums leading-none">
            {hh}:{mm}
          </div>
          {weather ? (
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <WeatherIcon code={weather.weatherCode} />
              <span className="text-xl font-semibold text-white">{weather.temp_c}°C</span>
            </div>
          ) : (
            <div className="w-16 h-5 bg-white/10 rounded animate-pulse mt-1 ml-auto" />
          )}
          <p className="text-salomon-muted text-[10px] mt-0.5">東京都八王子市</p>
        </div>
      </div>

      {/* Mobile: greeting below the top bar (full width banner) */}
      <div className="lg:hidden px-4 pb-2 animate-fadeInUp opacity-0-start"
        style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
        <div className="text-center">
          <p className="text-sm font-bold text-white leading-tight line-clamp-1">
            {heroMessages.greeting}
          </p>
          <p className="text-salomon-muted text-[10px] mt-0.5 leading-tight line-clamp-1">
            {heroMessages.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}

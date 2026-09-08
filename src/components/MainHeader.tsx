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
  const language     = useStore(s => s.language);
  const heroMessages = useAdminStore(s => s.heroMessages);
  const [time, setTime] = useState(new Date());

  const currentHero = heroMessages?.[language] || heroMessages?.ja || {
    greeting: (heroMessages as any)?.greeting || 'こんにちは！今日はどの山の情報が知りたいですか？',
    subtitle: (heroMessages as any)?.subtitle || '高尾山の最新情報をAIがご案内します。',
  };

  const badgeText =
    language === 'en' ? 'Multilingual: Japanese / English / Chinese' :
    language === 'zh' ? '多语言切换・日语・英语・中文' :
    '多言語切り替え・日本語・英語・中国語';

  const locationText =
    language === 'en' ? 'Hachioji, Tokyo' :
    language === 'zh' ? '东京都八王子市' :
    '東京都八王子市';

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
      <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center px-6 pt-3 pb-1 gap-6">
        {/* Left: SALOMON brand */}
        <div className="animate-fadeInLeft opacity-0-start flex flex-col justify-center min-w-[200px]" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-salomon-red shadow-glow-red animate-pulse-slow" />
            <span className="text-xl font-black tracking-[0.15em] text-white">SALOMON</span>
          </div>
          <p className="text-salomon-cyan text-[10px] tracking-[0.2em] uppercase mt-0.5 font-semibold">
            Mountain AI Concierge
          </p>
          <p className="text-salomon-muted text-[9px] tracking-wider mt-0.5 truncate">
            {badgeText}
          </p>
        </div>

        {/* Center: Hero title */}
        <div className="text-center animate-fadeInUp opacity-0-start px-2 min-w-0"
          style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-base xl:text-xl 2xl:text-2xl font-bold text-white leading-snug" title={currentHero.greeting}>
            {currentHero.greeting}
          </h1>
          <p className="text-salomon-muted text-xs xl:text-sm mt-0.5 tracking-wide">
            {currentHero.subtitle}
          </p>
        </div>

        {/* Right: clock + weather */}
        <div className="animate-fadeInRight opacity-0-start text-right flex flex-col items-end justify-center min-w-[150px]"
          style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-baseline justify-end gap-2.5">
            <span className="text-2xl xl:text-3xl font-bold text-white tabular-nums leading-none">
              {hh}:{mm}
            </span>
            {weather && (
              <div className="flex items-center gap-1">
                <WeatherIcon code={weather.weatherCode} size="sm" />
                <span className="text-base xl:text-lg font-semibold text-white tabular-nums">{weather.temp_c}°C</span>
              </div>
            )}
          </div>
          <p className="text-salomon-muted text-[10px] mt-0.5">{locationText}</p>
        </div>
      </div>

      {/* Mobile: greeting below the top bar (full width banner) */}
      <div className="lg:hidden px-4 pb-2 animate-fadeInUp opacity-0-start"
        style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
        <div className="text-center">
          <p className="text-sm font-bold text-white leading-tight line-clamp-1">
            {currentHero.greeting}
          </p>
          <p className="text-salomon-muted text-[10px] mt-0.5 leading-tight line-clamp-1">
            {currentHero.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}

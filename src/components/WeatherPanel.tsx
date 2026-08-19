'use client';

import { Cloud, CloudRain, Sun, CloudSun, CloudSnow, Wind, Droplets, Zap, Sunset, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { WeatherCode } from '@/types';

function WeatherIcon({ code, size = 'lg' }: { code: WeatherCode; size?: 'lg' | 'md' }) {
  const cls = size === 'lg'
    ? 'w-12 h-12 text-salomon-cyan drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]'
    : 'w-8 h-8 text-salomon-cyan drop-shadow-[0_0_6px_rgba(0,200,255,0.7)]';
  switch (code) {
    case 'sunny':         return <Sun className={cls} />;
    case 'partly_cloudy': return <CloudSun className={cls} />;
    case 'cloudy':        return <Cloud className={cls} />;
    case 'rainy':         return <CloudRain className={cls} />;
    case 'snowy':         return <CloudSnow className={cls} />;
  }
}

export function WeatherPanel() {
  const weather = useStore(s => s.weather);
  const loading  = useStore(s => s.weatherLoading);

  if (loading || !weather) {
    return (
      <div className="glass-card p-4 space-y-3 animate-pulse">
        <div className="w-20 h-3 bg-white/10 rounded" />
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-16 h-8 bg-white/10 rounded" />
            <div className="w-24 h-3 bg-white/10 rounded" />
          </div>
        </div>
        <div className="w-full h-2 bg-white/10 rounded" />
        <div className="w-full h-2 bg-white/10 rounded" />
      </div>
    );
  }

  const crowdLevel = weather.rainProbability > 50 ? 2 : weather.temp_c > 20 ? 4 : 3;
  const crowdLabel = crowdLevel <= 2 ? 'すいている' : crowdLevel === 3 ? 'やや混雑' : '混雑';
  const thunderRisk  = weather.rainProbability > 70 ? '高' : weather.rainProbability > 40 ? '中' : '低';
  const thunderColor = thunderRisk === '高' ? 'text-red-400' : thunderRisk === '中' ? 'text-yellow-400' : 'text-salomon-teal';
  const hikeStars = weather.rainProbability > 70 ? 1 : weather.rainProbability > 40 ? 2 : weather.temp_c < 0 ? 2 : weather.temp_c > 30 ? 3 : 4;

  return (
    <div className="glass-card p-4 animate-fadeInLeft opacity-0-start"
      style={{ animationFillMode: 'forwards', animationDelay: '0.15s' }}>
      <p className="section-label mb-3">天気</p>

      {/* ── Mobile: 2-column compact grid ─────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3">
        <WeatherIcon code={weather.weatherCode} size="lg" />
        <div className="flex-1">
          <div className="text-4xl font-black text-white leading-none">{weather.temp_c}°C</div>
          <div className="text-salomon-muted text-xs mt-0.5">{weather.weather}</div>
        </div>
        {/* Quick stats inline for mobile */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] text-salomon-muted">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-salomon-text font-medium">{weather.rainProbability}%</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[10px] text-salomon-muted">
            <Wind className="w-3 h-3 text-salomon-cyan" />
            <span className="text-salomon-text font-medium">{weather.windSpeed}m/s</span>
          </div>
        </div>
      </div>

      <div className="divider mb-3" />

      {/* Stats grid — 2 columns on mobile, full list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/* Thunder */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <span className="text-xs text-salomon-muted">雷リスク</span>
          <span className={`text-xs font-bold ml-auto ${thunderColor}`}>{thunderRisk}</span>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-1.5">
          <Sunset className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span className="text-xs text-salomon-muted">日没</span>
          <span className="text-xs text-salomon-text font-medium ml-auto">17:00〜</span>
        </div>

        {/* Hiking index */}
        <div className="flex items-center gap-1.5 col-span-2">
          <span className="text-xs text-salomon-muted">登山指数</span>
          <div className="flex gap-0.5 ml-auto">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm leading-none ${i < hikeStars ? 'text-yellow-400' : 'text-white/20'}`}>★</span>
            ))}
          </div>
        </div>
      </div>

      <div className="divider my-3" />

      {/* Crowd */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Users className="w-3.5 h-3.5 text-salomon-muted" />
          <span className="text-xs text-salomon-muted">混雑状況</span>
          <span className="text-sm font-bold text-salomon-text ml-auto">{crowdLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} viewBox="0 0 16 20"
              className={`w-4 h-5 ${i < crowdLevel ? 'text-salomon-cyan opacity-90' : 'text-white/15'}`}
              fill="currentColor">
              <circle cx="8" cy="5" r="3.5" />
              <path d="M1 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

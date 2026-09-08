'use client';

import { Cloud, CloudRain, Sun, CloudSun, CloudSnow, Wind, Droplets, Zap, Sunset, Users, Mountain, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useT } from '@/lib/i18n';
import type { WeatherCode } from '@/types';

function WeatherIcon({ code, size = 'lg' }: { code: WeatherCode; size?: 'lg' | 'md' }) {
  const cls = size === 'lg'
    ? 'w-10 h-10 text-salomon-cyan drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]'
    : 'w-7 h-7 text-salomon-cyan drop-shadow-[0_0_6px_rgba(0,200,255,0.7)]';
  switch (code) {
    case 'sunny':         return <Sun className={cls} />;
    case 'partly_cloudy': return <CloudSun className={cls} />;
    case 'cloudy':        return <Cloud className={cls} />;
    case 'rainy':         return <CloudRain className={cls} />;
    case 'snowy':         return <CloudSnow className={cls} />;
  }
}

export function WeatherPanel() {
  const weather         = useStore(s => s.weather);
  const loading         = useStore(s => s.weatherLoading);
  const weatherError    = useStore(s => s.weatherError);
  const refreshWeather  = useStore(s => s.refreshWeather);
  const weatherOverride = useAdminStore(s => s.weatherOverride);
  const { t, language } = useT();

  // Loading skeleton
  if (loading && !weather) {
    return (
      <div className="glass-card p-3.5 space-y-2.5 animate-pulse">
        <div className="w-24 h-4 bg-white/10 rounded" />
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-16 h-6 bg-white/10 rounded" />
            <div className="w-20 h-3 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error state — show a retry card instead of staying blank forever
  if (weatherError && !weather) {
    return (
      <div className="glass-card p-3.5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-red-300">{t('weather.errorTitle')}</span>
        </div>
        <p className="text-[10px] text-salomon-muted leading-relaxed">
          {t('weather.errorDesc')}
        </p>
        {refreshWeather && (
          <button
            onClick={refreshWeather}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-salomon-cyan/10 border border-salomon-cyan/30 text-salomon-cyan text-[11px] font-medium hover:bg-salomon-cyan/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {t('weather.retry')}
          </button>
        )}
      </div>
    );
  }

  // Still loading with no data yet — skeleton
  if (!weather) {
    return (
      <div className="glass-card p-3.5 space-y-2.5 animate-pulse">
        <div className="w-24 h-4 bg-white/10 rounded" />
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-16 h-6 bg-white/10 rounded" />
            <div className="w-20 h-3 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const crowdLevel = weather.rainProbability > 50 ? 2 : weather.temp_c > 20 ? 4 : 3;
  const crowdLabel = crowdLevel <= 2 ? t('weather.crowdLight') : crowdLevel === 3 ? t('weather.crowdMedium') : t('weather.crowdHeavy');
  const crowdTime  = crowdLevel >= 3 ? t('weather.crowdPeak') : t('weather.crowdSmooth');
  const thunderRisk  = weather.rainProbability > 70 ? t('weather.thunderHigh') : weather.rainProbability > 40 ? t('weather.thunderMedium') : t('weather.thunderLow');
  const thunderColor = weather.rainProbability > 70 ? 'text-red-400' : weather.rainProbability > 40 ? 'text-yellow-400' : 'text-salomon-teal';
  const hikeStars = weather.rainProbability > 70 ? 1 : weather.rainProbability > 40 ? 2 : weather.temp_c < 0 ? 2 : weather.temp_c > 30 ? 3 : 4;

  const weatherLabel =
    language === 'en' ? (
      weather.weatherCode === 'sunny' ? 'Clear & Sunny' :
      weather.weatherCode === 'partly_cloudy' ? 'Partly Cloudy' :
      weather.weatherCode === 'cloudy' ? 'Overcast' :
      weather.weatherCode === 'rainy' ? 'Rainy' : 'Snowy'
    ) :
    language === 'zh' ? (
      weather.weatherCode === 'sunny' ? '晴朗明媚' :
      weather.weatherCode === 'partly_cloudy' ? '多云间晴' :
      weather.weatherCode === 'cloudy' ? '阴天' :
      weather.weatherCode === 'rainy' ? '阵雨 / 有雨' : '降雪'
    ) : weather.weather;

  return (
    <div className="glass-card p-3.5 flex flex-col gap-2.5 animate-fadeInLeft opacity-0-start"
         style={{ animationFillMode: 'forwards', animationDelay: '0.15s' }}>
      
      {/* Mountain Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <Mountain className="w-4 h-4 text-salomon-cyan" />
          <span className="text-sm font-bold text-white tracking-wide">{t('weather.mountain')}</span>
          <span className="text-[11px] text-salomon-muted font-mono">{t('weather.elevation')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {weatherOverride?.enabled ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-black text-cyan-300 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              手動設定中
            </span>
          ) : (
            <span className="text-[10px] text-salomon-muted">{t('weather.todayWeather')}</span>
          )}
        </div>
      </div>

      {/* Optional Staff Weather Notice */}
      {weatherOverride?.enabled && weatherOverride?.customNotice && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-[10.5px] text-amber-200 flex items-center gap-1.5 font-medium shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{weatherOverride.customNotice}</span>
        </div>
      )}

      {/* Main weather & temp */}
      <div className="flex items-center gap-3">
        <WeatherIcon code={weather.weatherCode} size="lg" />
        <div className="flex-1">
          <div className="text-3xl font-black text-white leading-none tracking-tight">
            {weather.temp_c}°C
          </div>
          <div className="text-salomon-muted text-[11px] mt-0.5 font-medium">
            {weatherLabel}
          </div>
        </div>

        {/* Rain % & Wind */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center justify-end gap-1 text-[11px] text-salomon-muted">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-salomon-text font-semibold">{weather.rainProbability}%</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px] text-salomon-muted">
            <Wind className="w-3.5 h-3.5 text-salomon-cyan" />
            <span className="text-salomon-text font-semibold">{weather.windSpeed}m/s</span>
          </div>
        </div>
      </div>

      {/* Crowd forecast card — rule-based estimate, labeled as such */}
      <div className="bg-white/5 rounded-xl p-2 border border-salomon-border/80">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-salomon-muted">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('weather.crowdForecast')}</span>
          </div>
          <span className="font-bold text-amber-300">{crowdLabel}</span>
        </div>
        <p className="text-[10px] text-salomon-muted mt-0.5 text-right font-medium">
          {crowdTime}
        </p>
      </div>

      {/* Secondary indicators (Thunder risk, Sunset, Hiking index) */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <span className="text-salomon-muted">{t('weather.thunderRisk')}</span>
          <span className={`font-bold ml-auto ${thunderColor}`}>{thunderRisk}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Sunset className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span className="text-salomon-muted">{t('weather.sunset')}</span>
          <span className="text-salomon-text font-medium ml-auto">{t('weather.sunsetTime')}</span>
        </div>

        <div className="flex items-center gap-1.5 col-span-2 pt-0.5">
          <span className="text-salomon-muted">{t('weather.hikingIndex')}</span>
          <div className="flex gap-0.5 ml-auto">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm leading-none ${i < hikeStars ? 'text-yellow-400' : 'text-white/20'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Data freshness timestamp */}
      <p className="text-[9px] text-white/25 text-right pt-0.5 font-mono">
        {t('weather.updated')}: {new Date(weather.updatedAt).toLocaleTimeString(language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'ja-JP', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}

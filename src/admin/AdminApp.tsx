'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, MessageSquare, Package, Settings,
  ExternalLink, ChevronRight, Clock,
  Menu, X, PanelLeftClose, PanelLeftOpen, Mountain, Globe, CloudRain,
  Sun, CloudSun, Cloud, CloudSnow, Wind, Droplets, Eye,
  RefreshCw, SlidersHorizontal, CheckCircle2, AlertCircle, ArrowUpRight,
  Volume2, VolumeX, Moon, Layers, LogOut, AlertTriangle, Megaphone,
} from 'lucide-react';
import { HeroMessageEditor } from '@/admin/HeroMessageEditor';
import { ProductEditor } from '@/admin/ProductEditor';
import { RouteEditor } from '@/admin/RouteEditor';
import { WeatherEditor } from '@/admin/WeatherEditor';
import { CalloutEditor } from '@/admin/CalloutEditor';
import { EmergencyNoticeEditor } from '@/admin/EmergencyNoticeEditor';
import { SalomonLogo } from '@/components/SalomonLogo';
import { useAdminStore } from '@/store/useAdminStore';
import { useStore } from '@/store/useStore';
import type { WeatherCode, WeatherData } from '@/types';

type Section = 'dashboard' | 'callout' | 'weather' | 'routes' | 'messages' | 'products' | 'emergency';

const NAV: {
  id: Section;
  label: string;
  labelEn: string;
  icon: typeof LayoutDashboard | typeof Volume2;
  badge?: string;
}[] = [
  { id: 'dashboard', label: 'ダッシュボード',          labelEn: 'Dashboard',        icon: LayoutDashboard },
  { id: 'callout',   label: '自動呼びかけ・夜間設定',   labelEn: 'Auto Callout',     icon: Volume2,         badge: '夜間/稼働' },
  { id: 'weather',   label: '天気・気象手動設定',        labelEn: 'Weather Override', icon: CloudRain,       badge: '手動/自動' },
  { id: 'routes',    label: 'コース・難易度管理',        labelEn: 'Route Settings',   icon: Mountain,        badge: '8大コース' },
  { id: 'messages',  label: 'ヒーローメッセージ',        labelEn: 'Hero Messages',    icon: MessageSquare,   badge: '3言語対応' },
  { id: 'products',  label: '商品マスター',              labelEn: 'Products',         icon: Package,         badge: '編集可' },
  { id: 'emergency', label: '緊急・特別なお知らせ',      labelEn: 'Emergency Notice', icon: Megaphone,       badge: '全コース共通' },
];

function DashboardWeatherIcon({ code, className = 'w-6 h-6' }: { code: WeatherCode; className?: string }) {
  switch (code) {
    case 'sunny':         return <Sun className={`${className} text-amber-400`} />;
    case 'partly_cloudy': return <CloudSun className={`${className} text-sky-400`} />;
    case 'cloudy':        return <Cloud className={`${className} text-slate-300`} />;
    case 'rainy':         return <CloudRain className={`${className} text-blue-400`} />;
    case 'snowy':         return <CloudSnow className={`${className} text-cyan-300`} />;
    default:              return <Sun className={`${className} text-amber-400`} />;
  }
}

/* ── Dashboard content ─────────────────────────────────────────────────── */
function Dashboard({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const products        = useAdminStore(s => s.products);
  const heroMessages    = useAdminStore(s => s.heroMessages);
  const weatherOverride = useAdminStore(s => s.weatherOverride);
  const toggleWeatherOverride = useAdminStore(s => s.toggleWeatherOverride);
  const periodicCalloutEnabled = useAdminStore(s => s.periodicCalloutEnabled ?? true);
  const periodicCalloutInterval = useAdminStore(s => s.periodicCalloutInterval ?? 60);
  const togglePeriodicCallout = useAdminStore(s => s.togglePeriodicCallout);
  const setPeriodicCalloutEnabled = useAdminStore(s => s.setPeriodicCalloutEnabled);
  const mountainMapMode = useAdminStore(s => s.mountainMapMode ?? '3d_live_poc');
  const emergencyNotice = useAdminStore(s => s.emergencyNotice);
  const setMountainMapMode = useAdminStore(s => s.setMountainMapMode);

  const globalWeather    = useStore(s => s.weather);
  const setGlobalWeather = useStore(s => s.setWeather);

  // Live time ticker
  const [time, setTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastApiFetchTime, setLastApiFetchTime] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchApiWeather = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = (await res.json()) as WeatherData;
        setGlobalWeather(data);
        setLastApiFetchTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch weather in Admin Dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [setGlobalWeather]);

  useEffect(() => {
    if (!weatherOverride.enabled && !globalWeather) {
      fetchApiWeather();
    }
  }, [weatherOverride.enabled, globalWeather, fetchApiWeather]);

  const isManualWeather = weatherOverride.enabled;
  const displayWeather = isManualWeather
    ? {
        temp_c: weatherOverride.temp_c,
        weather: weatherOverride.weather,
        weatherCode: weatherOverride.weatherCode,
        windSpeed: weatherOverride.windSpeed,
        rainProbability: weatherOverride.rainProbability,
        precipitationMmh: weatherOverride.precipitationMmh,
        uvIndex: weatherOverride.uvIndex,
        visibility: weatherOverride.visibility,
        customNotice: weatherOverride.customNotice,
      }
    : {
        temp_c: globalWeather?.temp_c ?? 21,
        weather: globalWeather?.weather ?? '晴れ',
        weatherCode: globalWeather?.weatherCode ?? 'sunny',
        windSpeed: globalWeather?.windSpeed ?? 2.5,
        rainProbability: globalWeather?.rainProbability ?? 10,
        precipitationMmh: globalWeather?.precipitationMmh ?? 0,
        uvIndex: globalWeather?.uvIndex ?? 4,
        visibility: globalWeather?.visibility ?? 15,
        customNotice: '',
      };

  const inStock    = products.filter(p => p.stockStatus === 'in_stock').length;
  const lowStock   = products.filter(p => p.stockStatus === 'low_stock').length;
  const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock').length;

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const dateStr = time.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            ダッシュボード
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            SALOMON 高尾店 AIコンシェルジュ 管理画面
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Automatic Callout / Night Mode Quick Switch Button */}
          <button
            onClick={() => togglePeriodicCallout()}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
              periodicCalloutEnabled
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
            title="クリックして自動呼びかけ（夜間モード）のON/OFFを即座に切り替え"
          >
            {periodicCalloutEnabled ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>自動呼びかけ：ON（営業中）</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>自動呼びかけ：OFF（夜間停止中）</span>
              </>
            )}
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            システム正常稼働中
          </div>
        </div>
      </div>

      {/* ── User Page Live Sync Panel (Time, Weather, Temp, Retrieval Status) ── */}
      <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/20 via-slate-900/60 to-slate-900/90 p-5 md:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                ユーザー画面 リアルタイム配信ステータス（高尾山）
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              来訪者サイネージおよびコンシェルジュ画面に現在表示中の時刻・気象情報とデータ取得元
            </p>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            {isManualWeather ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-black text-amber-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                気象: 手動設定中（手動オーバーライド）
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-black text-emerald-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                気象: API自動取得中（Open-Meteo Live）
              </span>
            )}
          </div>
        </div>

        {/* Content Grid: Time card (Left) & Weather card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
          
          {/* 1. Time Display & Indicator */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">現在時刻（JST 日本標準時）</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                  東京都八王子市 高尾山
                </span>
              </div>

              {/* Big Clock Display */}
              <div className="py-2 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight font-mono">
                  {hh}:{mm}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-cyan-400 tabular-nums font-mono">
                  :{ss}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {dateStr}
              </p>
            </div>

            {/* Time Retrieval Mode Indicator */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-300">
                    取得方式：自動（システムクロック JST リアルタイム同期）
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                  ユーザー画面上部のデジタル時計は、端末およびサーバーの日本標準時（JST）と毎秒自動同期して正確にリアルタイム表示されています。
                </p>
              </div>
            </div>
          </div>

          {/* 2. Weather & Temperature Display & Indicator */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">現在の気象・気温・環境データ</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                  標高 599m
                </span>
              </div>

              {/* Weather & Temp Main Preview */}
              <div className="flex items-center gap-4 py-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <DashboardWeatherIcon code={displayWeather.weatherCode} className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                      {displayWeather.temp_c}°C
                    </span>
                    <span className="text-sm sm:text-base font-bold text-cyan-300 truncate">
                      {displayWeather.weather}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ユーザー画面の天気パネルおよびヘッダーに連動表示中
                  </p>
                </div>
              </div>

              {/* 5 Environmental Metrics Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-white/10">
                <div className="rounded-lg bg-white/5 p-2 text-center border border-white/5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span>降水確率</span>
                  </div>
                  <span className="text-xs font-bold text-white tabular-nums">{displayWeather.rainProbability}%</span>
                </div>

                <div className="rounded-lg bg-white/5 p-2 text-center border border-white/5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>風速</span>
                  </div>
                  <span className="text-xs font-bold text-white tabular-nums">{displayWeather.windSpeed}m/s</span>
                </div>

                <div className="rounded-lg bg-white/5 p-2 text-center border border-white/5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                    <CloudRain className="w-3 h-3 text-indigo-400" />
                    <span>降水量</span>
                  </div>
                  <span className="text-xs font-bold text-white tabular-nums">{displayWeather.precipitationMmh}mm/h</span>
                </div>

                <div className="rounded-lg bg-white/5 p-2 text-center border border-white/5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>紫外線</span>
                  </div>
                  <span className="text-xs font-bold text-white tabular-nums">UV {displayWeather.uvIndex}</span>
                </div>

                <div className="rounded-lg bg-white/5 p-2 text-center border border-white/5 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                    <Eye className="w-3 h-3 text-teal-400" />
                    <span>視程</span>
                  </div>
                  <span className="text-xs font-bold text-white tabular-nums">{displayWeather.visibility}km</span>
                </div>
              </div>
            </div>

            {/* Weather Retrieval Mode Indicator (Explicit Automatic API vs Manual) */}
            <div className="mt-4 pt-3 border-t border-white/10">
              {isManualWeather ? (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-amber-300">
                        取得方式：手動設定中（手動オーバーライド優先）
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                    現在、管理者が手動設定した気象情報（気温 {displayWeather.temp_c}°C / {displayWeather.weather} / 降水確率 {displayWeather.rainProbability}%）がユーザー画面に優先反映されています。（APIの自動同期は停止中）
                  </p>
                  <div className="flex items-center gap-2 pt-1 pl-6">
                    <button
                      onClick={() => onNavigate('weather')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      気象手動設定で編集
                    </button>
                    <button
                      onClick={() => {
                        toggleWeatherOverride(false);
                        fetchApiWeather();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-medium transition-colors"
                    >
                      API自動取得に切り替え
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-emerald-300">
                        取得方式：API自動取得中（Open-Meteo Live API）
                      </span>
                    </div>
                    {lastApiFetchTime && (
                      <span className="text-[10px] text-emerald-400/80 font-mono">
                        最終取得: {lastApiFetchTime}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                    Open-Meteo気象API（八王子市高尾山: 緯度35.625°N, 経度139.243°E）より最新気象データを10分間隔で自動取得し、ユーザー画面へ自動配信しています。
                  </p>
                  <div className="flex items-center gap-2 pt-1 pl-6">
                    <button
                      onClick={fetchApiWeather}
                      disabled={isRefreshing}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      最新データを今すぐ再取得
                    </button>
                    <button
                      onClick={() => onNavigate('weather')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-medium transition-colors"
                    >
                      手動オーバーライド設定
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Optional Custom Staff Notice banner */}
        {isManualWeather && displayWeather.customNotice && (
          <div className="mt-4 rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 flex items-center gap-2 text-amber-200 text-xs font-medium relative z-10">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>ユーザー画面に配信中のスタッフ気象注意報：{displayWeather.customNotice}</span>
          </div>
        )}
      </div>

      {/* ── AI Automatic Callout & Night Mode Control Panel ── */}
      <div className={`rounded-2xl border p-5 md:p-6 transition-all relative overflow-hidden ${
        periodicCalloutEnabled
          ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/70 to-slate-900/90 shadow-lg shadow-cyan-950/20'
          : 'border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/70 to-slate-900/90 shadow-lg shadow-amber-950/20'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                periodicCalloutEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}>
                {periodicCalloutEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                AI自動呼びかけ（自動紹介音声）・夜間モード設定
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                periodicCalloutEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {periodicCalloutEnabled ? `ON (稼働中・${periodicCalloutInterval}秒間隔)` : 'OFF (夜間停止中・完全無音)'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {periodicCalloutEnabled
                ? `通常待機中に${periodicCalloutInterval}秒間隔で「高尾山やおすすめルート、装備について…」と音声で呼びかけます。画面タッチ時は何秒時点（10秒未満・20秒・30秒・40秒・50秒など）でも即座に満秒リセットされます。`
                : '夜間および無人営業中のため、自動呼びかけおよびカメラ検知自動発話を停止しています。（完全無音・ひとりでに発話しません）'}
            </p>

            <p className="text-[11px] text-slate-400">
              ※夜間や閉店後の無人店舗でひとりでに声が出るのを防ぐため、退勤時に「OFF」に設定できます。ユーザーによる手動タッチや音声質問時のAI対話機能は維持されます。
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {/* Master Toggle */}
            <button
              onClick={() => togglePeriodicCallout()}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md ${
                periodicCalloutEnabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110'
              }`}
              title="自動呼びかけのON/OFFを切り替えます"
            >
              {periodicCalloutEnabled ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>ON（営業中）</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>OFF（夜間停止中）</span>
                </>
              )}
            </button>

            {/* Quick Presets */}
            <button
              onClick={() => setPeriodicCalloutEnabled(true)}
              disabled={periodicCalloutEnabled}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-xs text-slate-300 font-medium transition-colors"
              title="営業開始（自動呼びかけON）"
            >
              ☀️ 営業開始
            </button>
            <button
              onClick={() => setPeriodicCalloutEnabled(false)}
              disabled={!periodicCalloutEnabled}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-xs text-slate-300 font-medium transition-colors"
              title="夜間停止（自動呼びかけOFF）"
            >
              🌙 夜間停止
            </button>

            {/* Link to Full Callout Editor */}
            <button
              onClick={() => onNavigate('callout')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-colors flex items-center gap-1"
            >
              詳細設定・試聴
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3D Mountain Visual Engine Selector (Central Display) ── */}
      <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/20 p-5 md:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-cyan-500/20 border-cyan-500/40 text-cyan-300">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                中央3Dマウンテン表示エンジン設定
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                mountainMapMode === '3d_live_poc'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                {mountainMapMode === '3d_live_poc'
                  ? '3DリアルタイムPoC (WebGL)'
                  : 'MapLibre GSI 3D (国土地理院)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ユーザー画面の中央に常時レンダリングされるメインマウンテン表示を切り替えます。
              {mountainMapMode === '3d_live_poc'
                ? '「高尾山 3D WebGL表示」が直接レンダリングされており、全画面でマウスドラッグによる360度回転・ズーム・登山道ルートアニメーションが動作します。'
                : '「MapLibre GSI 3D」エンジンが動作しており、国土地理院標高タイルに基づく3D地形と8大トレイルの詳細ラインが表示されます。'}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                レンダリングエンジン: サービス内蔵 3D WebGL (スタンドアロン稼働)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {/* Mode selection buttons */}
            <button
              onClick={() => setMountainMapMode('3d_live_poc')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                mountainMapMode === '3d_live_poc'
                  ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-cyan-400" />
              3D WebGL
            </button>

            <button
              onClick={() => setMountainMapMode('maplibre_interactive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                mountainMapMode === 'maplibre_interactive'
                  ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-300 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-400/30'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              MapLibre GSI 3D
            </button>
          </div>
        </div>
      </div>

      {/* ── Product Inventory Stats ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            商品在庫サマリー
          </h3>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            商品マスターを開く
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '登録商品数', value: products.length, color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
            { label: '在庫あり',   value: inStock,          color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
            { label: '残りわずか', value: lowStock,         color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { label: '在庫なし',   value: outOfStock,       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-4`}>
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-black tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current Hero Messages ── */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">現在のヒーローメッセージ（日本語 / English / 中文）</span>
          </div>
          <button
            onClick={() => onNavigate('messages')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            メッセージを編集
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-cyan-400 font-bold">日本語 (JA):</span>
            <p className="text-sm text-white font-medium pl-2">{heroMessages.ja?.greeting || (heroMessages as any).greeting}</p>
            <p className="text-xs text-slate-400 pl-2">{heroMessages.ja?.subtitle || (heroMessages as any).subtitle}</p>
          </div>
          <div className="space-y-1 pt-2 border-t border-white/5">
            <span className="text-xs text-cyan-400 font-bold">English (EN):</span>
            <p className="text-sm text-white font-medium pl-2">{heroMessages.en?.greeting}</p>
            <p className="text-xs text-slate-400 pl-2">{heroMessages.en?.subtitle}</p>
          </div>
          <div className="space-y-1 pt-2 border-t border-white/5">
            <span className="text-xs text-cyan-400 font-bold">中文 (ZH):</span>
            <p className="text-sm text-white font-medium pl-2">{heroMessages.zh?.greeting}</p>
            <p className="text-xs text-slate-400 pl-2">{heroMessages.zh?.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Quick Management Navigation Cards ── */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">管理メニューへのショートカット</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              id: 'callout' as Section,
              title: '自動呼びかけ・夜間設定',
              desc: periodicCalloutEnabled ? `現在有効（${periodicCalloutInterval}秒ごと自動発話）` : '現在夜間停止中（完全無音モード）',
              icon: Volume2,
              badge: periodicCalloutEnabled ? '稼働中' : '夜間停止',
              badgeColor: periodicCalloutEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            },
            {
              id: 'weather' as Section,
              title: '天気・気象設定',
              desc: isManualWeather ? '現在手動設定が有効です' : '現在API自動取得が有効です',
              icon: CloudRain,
              badge: isManualWeather ? '手動設定中' : '自動取得中',
              badgeColor: isManualWeather ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            },
            {
              id: 'routes' as Section,
              title: 'コース・難易度管理',
              desc: '8大コースの難易度とスタッフコメント編集',
              icon: Mountain,
              badge: '8大コース',
              badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
            },
            {
              id: 'messages' as Section,
              title: 'ヒーローメッセージ',
              desc: '日英中3言語の挨拶文とサブタイトル設定',
              icon: MessageSquare,
              badge: '3言語対応',
              badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            },
            {
              id: 'products' as Section,
              title: '商品マスター',
              desc: `全${products.length}商品の在庫状況とおすすめ商品管理`,
              icon: Package,
              badge: `${products.length}商品`,
              badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            },
          ].map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => onNavigate(m.id)}
                className="rounded-2xl border border-white/10 bg-white/3 hover:bg-white/6 hover:border-cyan-500/30 p-4 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${m.badgeColor}`}>
                      {m.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{m.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-300">
                  <span>設定画面を開く</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar inner content (shared between desktop & mobile) ───────────── */
function SidebarContent({
  activeSection,
  onSelect,
  onClose,
  onLogout,
}: {
  activeSection: Section;
  onSelect: (s: Section) => void;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/8 flex items-start justify-between gap-2 flex-shrink-0">
        <div>
          <SalomonLogo size="md" subtitleText="ADMIN CONSOLE" />
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-300 font-bold">3言語対応</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-bold">システム稼働中</span>
            </div>
          </div>
        </div>
        {/* Close button — only shown when used as mobile overlay */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="メニューを閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const Icon     = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); onClose?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                          transition-all duration-150 group min-h-[44px] ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/25 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20
                                 text-cyan-400 font-bold border border-cyan-500/30 flex-shrink-0">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/8 flex-shrink-0 space-y-1.5">
        <a
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl
                     text-slate-400 hover:text-cyan-400 hover:bg-white/5
                     transition-all text-xs font-medium"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          <span>コンシェルジュ画面へ</span>
        </a>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl
                       text-rose-400 hover:text-rose-300 hover:bg-rose-500/10
                       border border-rose-500/20 transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>ログアウト</span>
          </button>
        )}
        <div className="px-2 pt-0.5">
          <p className="text-[9px] text-slate-500 leading-tight">
            © 2026 SALOMON<br />Mountain AI Concierge
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main AdminApp ─────────────────────────────────────────────────────── */
export function AdminApp({ onLogout }: { onLogout?: () => void }) {
  const [activeSection,   setActiveSection]   = useState<Section>('dashboard');
  // Desktop: sidebar collapsed/expanded
  const [sidebarOpen,     setSidebarOpen]     = useState(true);
  // Mobile: drawer open/closed
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard onNavigate={setActiveSection} />;
      case 'callout':   return <CalloutEditor onNavigate={setActiveSection} />;
      case 'weather':   return <WeatherEditor />;
      case 'messages':  return <HeroMessageEditor />;
      case 'products':  return <ProductEditor />;
      case 'routes':    return <RouteEditor />;
      case 'emergency': return <EmergencyNoticeEditor />;
    }
  };

  const currentNav = NAV.find(n => n.id === activeSection)!;
  const CurrentIcon = currentNav.icon;

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ background: '#070D1E' }}>

      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-white/8
                    transition-all duration-300 ease-in-out h-full overflow-hidden`}
        style={{
          background: '#0A1228',
          width: sidebarOpen ? '256px' : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
        aria-hidden={!sidebarOpen}
      >
        <SidebarContent
          activeSection={activeSection}
          onSelect={setActiveSection}
          onLogout={onLogout}
        />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 md:hidden flex flex-col
                    border-r border-white/8 transition-transform duration-300 ease-in-out`}
        style={{
          background: '#0A1228',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        aria-label="サイドバーメニュー"
      >
        <SidebarContent
          activeSection={activeSection}
          onSelect={setActiveSection}
          onClose={() => setMobileMenuOpen(false)}
          onLogout={onLogout}
        />
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3.5
                     border-b border-white/8 backdrop-blur-sm flex-shrink-0"
          style={{ background: 'rgba(7,13,30,0.92)' }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-white hover:bg-white/10
                       transition-colors flex-shrink-0"
            aria-label="メニューを開く"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg
                       text-slate-400 hover:text-white hover:bg-white/10
                       transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
            title={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
          >
            {sidebarOpen
              ? <PanelLeftClose className="w-5 h-5" />
              : <PanelLeftOpen  className="w-5 h-5" />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <CurrentIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-white truncate">{currentNav.label}</span>
            <span className="text-xs text-slate-500 hidden sm:inline flex-shrink-0">
              / {currentNav.labelEn}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

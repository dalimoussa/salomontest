'use client';

import React, { useState } from 'react';
import {
  CloudRain, Sun, CloudSun, Cloud, CloudSnow, Wind,
  Droplets, Zap, AlertTriangle, Check, RotateCcw,
  Sparkles, Sliders, Info, Eye, Save
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import type { WeatherCode, WeatherManualOverride } from '@/types';

const PRESETS: {
  id: string;
  name: string;
  icon: typeof Sun;
  color: string;
  data: Partial<WeatherManualOverride>;
}[] = [
  {
    id: 'sunny',
    name: '☀️ 快晴 (登山好適)',
    icon: Sun,
    color: 'border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
    data: {
      weather: '快晴',
      weatherCode: 'sunny',
      temp_c: 24,
      rainProbability: 0,
      precipitationMmh: 0,
      windSpeed: 2.1,
      uvIndex: 6,
      visibility: 20,
      customNotice: '',
    },
  },
  {
    id: 'partly_cloudy',
    name: '⛅ 晴れ時々曇り',
    icon: CloudSun,
    color: 'border-sky-400/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20',
    data: {
      weather: '晴れ時々曇り',
      weatherCode: 'partly_cloudy',
      temp_c: 20,
      rainProbability: 20,
      precipitationMmh: 0,
      windSpeed: 3.2,
      uvIndex: 4,
      visibility: 15,
      customNotice: '',
    },
  },
  {
    id: 'cloudy',
    name: '☁️ 曇り (過ごしやすい)',
    icon: Cloud,
    color: 'border-slate-400/40 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20',
    data: {
      weather: '曇り',
      weatherCode: 'cloudy',
      temp_c: 18,
      rainProbability: 35,
      precipitationMmh: 0,
      windSpeed: 2.8,
      uvIndex: 3,
      visibility: 12,
      customNotice: '',
    },
  },
  {
    id: 'rain_light',
    name: '🌧️ 小雨・雨 (雨粒アニメ起動)',
    icon: CloudRain,
    color: 'border-blue-400/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20',
    data: {
      weather: '小雨',
      weatherCode: 'rainy',
      temp_c: 15,
      rainProbability: 80,
      precipitationMmh: 3.5, // Triggers rain canvas
      windSpeed: 4.5,
      uvIndex: 1,
      visibility: 8,
      customNotice: '雨天のため足元が滑りやすくなっています。レインウェアと防水シューズを着用してください。',
    },
  },
  {
    id: 'rain_heavy',
    name: '⛈️ 本降り・大雨 (高密度雨粒)',
    icon: Zap,
    color: 'border-rose-400/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
    data: {
      weather: '本降りの雨',
      weatherCode: 'rainy',
      temp_c: 13,
      rainProbability: 100,
      precipitationMmh: 20.0, // Heavy rain density
      windSpeed: 7.8,
      uvIndex: 1,
      visibility: 4,
      customNotice: '【注意】強い降雨とぬかるみが発生しています。初心者の方は舗装路（1号路）またはケーブルカーをご利用ください。',
    },
  },
  {
    id: 'snowy',
    name: '❄️ 降雪・雪',
    icon: CloudSnow,
    color: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20',
    data: {
      weather: '小雪',
      weatherCode: 'snowy',
      temp_c: 1,
      rainProbability: 90,
      precipitationMmh: 1.5,
      windSpeed: 3.0,
      uvIndex: 1,
      visibility: 6,
      customNotice: '山頂付近は凍結・積雪のおそれがあります。軽アイゼンや防寒着の携行を推奨します。',
    },
  },
];

export function WeatherEditor() {
  const weatherOverride      = useAdminStore((s) => s.weatherOverride);
  const setWeatherOverride   = useAdminStore((s) => s.setWeatherOverride);
  const toggleWeatherOverride = useAdminStore((s) => s.toggleWeatherOverride);
  const resetWeatherOverride  = useAdminStore((s) => s.resetWeatherOverride);

  // Local draft state
  const [draft, setDraft] = useState<WeatherManualOverride>(weatherOverride);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Keep draft in sync if external weatherOverride changes
  React.useEffect(() => {
    setDraft(weatherOverride);
  }, [weatherOverride]);

  const handleApplyPreset = (presetData: Partial<WeatherManualOverride>) => {
    const updated: WeatherManualOverride = {
      ...draft,
      ...presetData,
      enabled: true, // Automatically enable when a preset is chosen
      updatedAt: new Date().toISOString(),
    };
    setDraft(updated);
    setWeatherOverride(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleSaveDraft = () => {
    setWeatherOverride({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleToggleMode = () => {
    const nextState = !draft.enabled;
    setDraft((prev) => ({ ...prev, enabled: nextState }));
    toggleWeatherOverride(nextState);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">天気・気象の手動オーバーライド管理</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              店舗運用・手動対応
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            API自動取得が不通の場合や、店頭デモ・悪天候シミュレーションのために、すべての気象データを完全手動で制御できます。
          </p>
        </div>

        {/* Global Mode Switch Button */}
        <button
          onClick={handleToggleMode}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-md ${
            draft.enabled
              ? 'bg-cyan-500 text-salomon-black hover:bg-cyan-400 ring-2 ring-cyan-400/50 shadow-glow-cyan'
              : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/20'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              draft.enabled ? 'bg-black animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{draft.enabled ? '手動設定モード：有効' : '自動取得モード（API稼働中）'}</span>
        </button>
      </div>

      {/* Mode Explanation Notice */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          draft.enabled
            ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
            : 'bg-white/5 border-white/10 text-slate-300'
        }`}
      >
        <div className="flex items-start gap-3">
          <Info className={`w-4 h-4 mt-0.5 shrink-0 ${draft.enabled ? 'text-cyan-400' : 'text-slate-400'}`} />
          <div className="text-xs space-y-1">
            <p className="font-bold">
              {draft.enabled
                ? '【手動優先中】現在キオスク画面はここで設定した手動天気を即時反映しています。'
                : '【自動連携中】現在キオスク画面は Open-Meteo 気象庁連動データを10分毎に取得しています。'}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              手動モードで「降水量（mm/h）」を1以上または「雨天」に設定すると、3Dマップ上の2D雨粒パーティクルアニメーションと、山の彩度・明暗シェーダーが連動して雨模様へ変化します。
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. Quick Presets ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ワンクリック天候プリセット</span>
          </span>
          <span className="text-[11px] text-slate-500">クリックですぐに手動適用</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.data)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-[0.98] ${preset.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{preset.name}</span>
                <preset.icon className="w-4 h-4" />
              </div>
              <div className="text-[11px] opacity-80 flex items-center gap-2">
                <span>{preset.data.temp_c}°C</span>
                <span>•</span>
                <span>雨量 {preset.data.precipitationMmh} mm/h</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Detailed Sliders & Form Controls ─────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">詳細パラメータ手動調整</h3>
          </div>
          {savedFeedback && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> 保存しました
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Weather Code dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">天候種別 (Weather Code)</label>
            <select
              value={draft.weatherCode}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  weatherCode: e.target.value as WeatherCode,
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:border-cyan-400 outline-none"
            >
              <option value="sunny">☀️ 晴れ / 快晴 (sunny)</option>
              <option value="partly_cloudy">⛅ 晴れ時々曇り (partly_cloudy)</option>
              <option value="cloudy">☁️ 曇り (cloudy)</option>
              <option value="rainy">🌧️ 雨 / 降雨 (rainy - 雨粒描画)</option>
              <option value="snowy">❄️ 雪 / 降雪 (snowy - 雨粒描画)</option>
            </select>
          </div>

          {/* Weather Display Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">表示天候名 (日本語)</label>
            <input
              type="text"
              value={draft.weather}
              onChange={(e) => setDraft((prev) => ({ ...prev, weather: e.target.value }))}
              placeholder="例: 快晴、にわか雨、大雨注意報"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Temperature (°C) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">気温 (°C)</label>
              <span className="font-mono font-bold text-cyan-300">{draft.temp_c}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="40"
              step="1"
              value={draft.temp_c}
              onChange={(e) => setDraft((prev) => ({ ...prev, temp_c: Number(e.target.value) }))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-10°C (真冬)</span>
              <span>20°C (適温)</span>
              <span>40°C (猛暑)</span>
            </div>
          </div>

          {/* Rain Probability (%) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">降水確率 (%)</label>
              <span className="font-mono font-bold text-blue-300">{draft.rainProbability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={draft.rainProbability}
              onChange={(e) => setDraft((prev) => ({ ...prev, rainProbability: Number(e.target.value) }))}
              className="w-full accent-blue-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0%</span>
              <span>50% (傘推奨)</span>
              <span>100% (雨天確実)</span>
            </div>
          </div>

          {/* Precipitation / Rain Intensity (mm/h) */}
          <div className="space-y-1.5 sm:col-span-2 p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/25">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-blue-200 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>降雨強度・降水量 (mm/h) ※3Dマップ雨粒と直結</span>
              </label>
              <span className="font-mono font-bold text-blue-300 text-sm">{draft.precipitationMmh} mm/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={draft.precipitationMmh}
              onChange={(e) => setDraft((prev) => ({ ...prev, precipitationMmh: Number(e.target.value) }))}
              className="w-full accent-blue-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>0 mm/h (降雨なし)</span>
              <span>3 mm/h (しとしと小雨)</span>
              <span>10 mm/h (本降り)</span>
              <span>25 mm/h以上 (大雨・激しい雨)</span>
            </div>
          </div>

          {/* Wind Speed (m/s) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">風速 (m/s)</label>
              <span className="font-mono font-bold text-cyan-300">{draft.windSpeed} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={draft.windSpeed}
              onChange={(e) => setDraft((prev) => ({ ...prev, windSpeed: Number(e.target.value) }))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* UV Index */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">紫外線指数 (UV Index)</label>
              <span className="font-mono font-bold text-amber-300">{draft.uvIndex}</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={draft.uvIndex}
              onChange={(e) => setDraft((prev) => ({ ...prev, uvIndex: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </div>

          {/* Staff Weather Notice Banner */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>スタッフ気象注意報・特記事項 (Kioskに直接表示)</span>
            </label>
            <input
              type="text"
              value={draft.customNotice || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, customNotice: e.target.value }))}
              placeholder="例: 午後から急な雷雨の予報。山頂付近では早めの下山をご案内ください。"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={() => {
              resetWeatherOverride();
              setSavedFeedback(true);
              setTimeout(() => setSavedFeedback(false), 2000);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>初期状態に戻す</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-salomon-black bg-salomon-cyan hover:bg-salomon-cyan/90 shadow-glow-cyan flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>手動天気を保存・キオスクへ反映</span>
          </button>
        </div>
      </div>
    </div>
  );
}

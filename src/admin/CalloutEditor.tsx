'use client';

import { useState } from 'react';
import {
  Volume2, VolumeX, Moon, Sun, Clock, Sparkles, CheckCircle2,
  AlertCircle, ShieldCheck, Play, Square, Info
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { CALLOUT_MESSAGES } from '@/hooks/usePeriodicCallout';
import { unlockAudio } from '@/lib/audioUnlock';

export function CalloutEditor({ onNavigate }: { onNavigate?: (section: any) => void }) {
  const periodicCalloutEnabled = useAdminStore(s => s.periodicCalloutEnabled ?? true);
  const periodicCalloutInterval = useAdminStore(s => s.periodicCalloutInterval ?? 60);
  const togglePeriodicCallout = useAdminStore(s => s.togglePeriodicCallout);
  const setPeriodicCalloutEnabled = useAdminStore(s => s.setPeriodicCalloutEnabled);
  const setPeriodicCalloutInterval = useAdminStore(s => s.setPeriodicCalloutInterval);

  const [testPlayingLang, setTestPlayingLang] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleToggle = (enabled: boolean) => {
    setPeriodicCalloutEnabled(enabled);
    showNotification(
      enabled
        ? '☀️ 自動呼びかけを「ON（通常営業稼働中）」に設定しました'
        : '🌙 自動呼びかけを「OFF（夜間停止中・完全無音）」に設定しました'
    );
  };

  const handleIntervalChange = (sec: 60 | 120) => {
    setPeriodicCalloutInterval(sec);
    showNotification(`呼びかけ間隔を「${sec}秒」に変更しました`);
  };

  // Test play callout message using browser speech synthesis
  const handleTestPlay = async (lang: 'ja' | 'en' | 'zh') => {
    if (typeof window === 'undefined') return;
    if (testPlayingLang) {
      window.speechSynthesis?.cancel();
      setTestPlayingLang(null);
      return;
    }

    unlockAudio();
    const text = CALLOUT_MESSAGES[lang] || CALLOUT_MESSAGES.ja;
    const langCode = lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP';

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setTestPlayingLang(lang);
      utterance.onend = () => setTestPlayingLang(null);
      utterance.onerror = () => setTestPlayingLang(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            AI自動呼びかけ（自動紹介・夜間モード）設定
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            来訪者サイネージでの通常待機時の自動紹介音声（アトラクト発話）および夜間無音モードを管理します
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {periodicCalloutEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              日中営業中：自動呼びかけ有効（{periodicCalloutInterval}秒ごと）
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              夜間停止中：自動呼びかけ完全OFF（無音）
            </span>
          )}
        </div>
      </div>

      {/* Floating Notification */}
      {successMsg && (
        <div className="rounded-xl bg-cyan-500/20 border border-cyan-400/40 p-3 flex items-center gap-2 text-cyan-200 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── 1. Master On/Off Switch Card (Night Mode Control) ── */}
      <div className={`rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden ${
        periodicCalloutEnabled
          ? 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/80 to-slate-900/90 shadow-xl shadow-cyan-950/20'
          : 'border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-slate-900/90 shadow-xl shadow-amber-950/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                periodicCalloutEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}>
                {periodicCalloutEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  自動紹介・アトラクト呼びかけ機能
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                    periodicCalloutEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {periodicCalloutEnabled ? 'ON / 稼働中' : 'OFF / 夜間停止中'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {periodicCalloutEnabled
                    ? 'サイネージ待機中に一定間隔で「高尾山やおすすめルート、装備について…」と音声で呼びかけます。'
                    : '夜間・無人営業時間中のため、自動呼びかけおよびカメラ検知による自動音声発話を停止しています。'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-11">
              夜間に店舗が無人になる際、自動でひとりでに音声が再生されないよう「OFF」に設定できます。
              OFFの状態でも、来客が手動で画面をタッチしたり音声マイクボタンを押した時は通常通りAIが回答します。
            </p>
          </div>

          {/* Large Master Toggle & Quick Preset Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-shrink-0">
            {/* Toggle Switch */}
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10">
              <button
                onClick={() => handleToggle(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  periodicCalloutEnabled
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                ON（営業中）
              </button>
              <button
                onClick={() => handleToggle(false)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  !periodicCalloutEnabled
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                OFF（夜間停止）
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 font-semibold transition-colors flex items-center gap-1"
              >
                <Sun className="w-3 h-3 text-cyan-400" />
                ☀️ 営業開始 (ON)
              </button>
              <button
                onClick={() => handleToggle(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 font-semibold transition-colors flex items-center gap-1"
              >
                <Moon className="w-3 h-3 text-amber-400" />
                🌙 夜間停止 (OFF)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Interval Selection & Screen Touch Reset Spec ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interval Setting */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">呼びかけ再生間隔</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            通常待機中、無操作状態が続いた場合に呼びかけ音声を再生するインターバル時間を選択します。
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleIntervalChange(60)}
              className={`p-3 rounded-xl border text-left transition-all ${
                periodicCalloutInterval === 60
                  ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-md shadow-cyan-500/10'
                  : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-cyan-300 font-mono">60秒間隔</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">標準推奨</span>
              </div>
              <p className="text-[11px] text-slate-400">人の往来が多い日中や混雑時に最適</p>
            </button>

            <button
              onClick={() => handleIntervalChange(120)}
              className={`p-3 rounded-xl border text-left transition-all ${
                periodicCalloutInterval === 120
                  ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-md shadow-cyan-500/10'
                  : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-cyan-300 font-mono">120秒間隔</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">ゆったり</span>
              </div>
              <p className="text-[11px] text-slate-400">静かな時間帯や店舗内での落ち着いた運用に最適</p>
            </button>
          </div>
        </div>

        {/* Screen Touch Reset Specification */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">画面タッチ時のタイマーリセット仕様</h3>
          </div>

          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-bold text-emerald-300">
                全秒数タッチ即時リセット対応済み
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ユーザーが画面のどこかをタッチまたは操作すると、残り時間（10秒未満はもちろん、20秒、30秒、40秒、50秒などいつでも）即座に満秒（{periodicCalloutInterval}秒）にリセットされます。
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-emerald-500/20">
              これにより、ユーザーがルートを閲覧中や商品を確認している最中に、不意に呼びかけ音声が割り込んで邪魔することがありません。
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Callout Scripts & Speech Audio Testing ── */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">呼びかけメッセージ確認と試聴テスト</h3>
          </div>
          <span className="text-xs text-slate-400">日英中3言語に対応（現在の言語設定に応じて発話）</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['ja', 'en', 'zh'] as const).map((lang) => {
            const label = lang === 'ja' ? '日本語 (JA)' : lang === 'en' ? 'English (EN)' : '中文 (ZH)';
            const text = CALLOUT_MESSAGES[lang];
            const isPlaying = testPlayingLang === lang;

            return (
              <div key={lang} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-300">{label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                      自動呼びかけ
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    「{text}」
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleTestPlay(lang)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isPlaying
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3 h-3" />
                        <span>停止</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>音声を試聴する</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Operation Tips for Night Time ── */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200 space-y-1">
          <p className="font-bold">夜間・無人運用のポイント：</p>
          <p className="text-slate-300 leading-relaxed">
            店舗の閉店後や深夜など、店舗が無人になる時間帯は自動呼びかけを「OFF」に切り替えておくことを推奨します。
            設定は即座に反映され、ブラウザの再読み込み後も保持されます。翌朝の営業開始時に「ON」に切り替えることで、日中のアトラクト呼びかけが再開されます。
          </p>
        </div>
      </div>
    </div>
  );
}

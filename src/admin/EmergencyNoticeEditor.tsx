'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, AlertCircle, Info, Check, Save, RotateCcw,
  Sparkles, Megaphone, Globe, Eye
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import type { EmergencyNotice } from '@/store/useAdminStore';
import type { Language } from '@/lib/i18n';

const PRESETS = [
  {
    icon: '🐻',
    label: '熊目撃注意',
    severity: 'alert' as const,
    ja: '【緊急警戒】高尾山山域にて熊（ツキノワグマ）の目撃情報がありました。単独行動を避け、熊鈴等の音が出るものを携行して十分に注意してください。',
    en: '[Urgent Alert] Bear sighting reported in Mt. Takao area. Please avoid walking alone, carry a bear bell, and proceed with heightened caution.',
    zh: '【紧急警报】高尾山山区出现黑熊目击信息。请尽量避免单独行动，随身携带防熊铃等发声物品并保持高度警惕。',
  },
  {
    icon: '⚠️',
    label: '悪天候・強風',
    severity: 'warning' as const,
    ja: '【特別注意】急速な天候悪化に伴い強風および急激な気温低下の恐れがあります。早めの下山または安全な施設への避難をご検討ください。',
    en: '[Weather Warning] Strong winds and sudden temperature drops expected due to approaching weather front. Please consider early descent or shelter.',
    zh: '【特别注意】受天气骤变影响，可能有强风与气温骤降。请提早规划下山或前往室内安全区域避难。',
  },
  {
    icon: '❄️',
    label: '路面凍結注意',
    severity: 'warning' as const,
    ja: '【安全注意】気温低下により山頂付近および日陰の登山道に凍結箇所が発生しています。滑落防止のため足元に十分ご注意ください。',
    en: '[Safety Notice] Trail icing reported near the summit and shaded paths. Please watch your footing and ensure appropriate footwear.',
    zh: '【安全注意】由于气温偏低，山顶附近及背阴山路有结冰现象。请注意防滑，确保步履安全。',
  },
  {
    icon: '🚧',
    label: 'コース通行止め',
    severity: 'alert' as const,
    ja: '【コース規制】倒木点検および登山道整備のため、一部区間で通行規制を実施しています。現地の指示看板に従い迂回してください。',
    en: '[Trail Notice] Certain trail sections are temporarily closed for safety inspection and maintenance. Please follow detour signs on site.',
    zh: '【路线管制】因步道维护与倒木清理，部分路段实施临时封闭。请配合现场指示看板绕行。',
  },
];

const LANGS: { code: Language; label: string }[] = [
  { code: 'ja', label: '日本語 (JA)' },
  { code: 'en', label: 'English (EN)' },
  { code: 'zh', label: '中文 (ZH)' },
];

export function EmergencyNoticeEditor() {
  const emergencyNotice = useAdminStore((s) => s.emergencyNotice);
  const setEmergencyNotice = useAdminStore((s) => s.setEmergencyNotice);

  const [draft, setDraft] = useState<EmergencyNotice>({
    enabled: false,
    message: '',
    message_en: '',
    message_zh: '',
    severity: 'alert',
  });
  const [activeLang, setActiveLang] = useState<Language>('ja');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (emergencyNotice) {
      setDraft({
        enabled: emergencyNotice.enabled ?? false,
        message: emergencyNotice.message ?? '',
        message_en: emergencyNotice.message_en ?? '',
        message_zh: emergencyNotice.message_zh ?? '',
        severity: emergencyNotice.severity ?? 'alert',
      });
      setIsDirty(false);
    }
  }, [emergencyNotice]);

  const handleToggle = () => {
    setDraft((prev) => ({ ...prev, enabled: !prev.enabled }));
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const handleSeverityChange = (sev: 'alert' | 'warning' | 'info') => {
    setDraft((prev) => ({ ...prev, severity: sev }));
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const handleMessageChange = (val: string) => {
    setDraft((prev) => {
      if (activeLang === 'en') return { ...prev, message_en: val };
      if (activeLang === 'zh') return { ...prev, message_zh: val };
      return { ...prev, message: val };
    });
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setDraft((prev) => ({
      ...prev,
      severity: p.severity,
      message: p.ja,
      message_en: p.en,
      message_zh: p.zh,
      enabled: true,
    }));
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const handleSave = () => {
    setEmergencyNotice(draft);
    setIsDirty(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleClear = () => {
    setDraft({
      enabled: false,
      message: '',
      message_en: '',
      message_zh: '',
      severity: 'alert',
    });
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const currentMessage =
    activeLang === 'en' ? draft.message_en || '' :
    activeLang === 'zh' ? draft.message_zh || '' :
    draft.message || '';

  const previewText =
    (activeLang === 'en' ? (draft.message_en || draft.message) :
     activeLang === 'zh' ? (draft.message_zh || draft.message) :
     draft.message) || '（お知らせテキストを入力またはプリセットを選択してください）';

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-slate-900/60 to-slate-950 p-5 shadow-xl shadow-rose-950/20 space-y-4">
      {/* Top Header of Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            draft.enabled ? 'bg-rose-500/25 text-rose-300 ring-2 ring-rose-500/40 animate-pulse' : 'bg-white/5 text-slate-400'
          }`}>
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white tracking-wide flex items-center gap-1.5">
                特別なお知らせ・緊急テロップ設定
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                全コース共通・画面下段テロップ
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              個々のコース設定に関係なく、全画面下段に右から左へ流れる緊急告知（熊目撃情報、悪天候など）を即座に表示します。
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-md ${
              draft.enabled
                ? 'bg-rose-500 text-white border-rose-400 shadow-glow-red hover:bg-rose-600'
                : 'bg-white/5 border-white/15 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${draft.enabled ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
            <span>{draft.enabled ? '🚨 配信中 (ON)' : '⚪ 停止中 (OFF)'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div>
        <span className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          ワンクリック入力プリセット（フリーテキストとして編集可能）:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-1.5 font-bold text-white group-hover:text-cyan-300">
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                {p.ja}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Severity Selector */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-xs font-semibold text-slate-400 mr-1">重要度 / 種別:</span>
        {[
          { id: 'alert' as const, label: '🚨 緊急・警戒 (赤)', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
          { id: 'warning' as const, label: '⚠️ 注意・警報 (黄)', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
          { id: 'info' as const, label: 'ℹ️ 一般案内 (青)', cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => handleSeverityChange(s.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
              draft.severity === s.id
                ? `${s.cls} ring-1 ring-white/20 shadow-sm`
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Multilingual Text Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeLang === lang.code
                    ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400">
            文字数: {currentMessage.length} 文字
          </span>
        </div>

        <textarea
          value={currentMessage}
          onChange={(e) => handleMessageChange(e.target.value)}
          rows={2}
          placeholder={
            activeLang === 'en'
              ? 'Enter urgent announcement message here (e.g., Bear sighting reported near trail 6!)...'
              : activeLang === 'zh'
              ? '在此输入紧急通知内容（例如：6号登山道附近发现黑熊出没！）...'
              : '例: 【緊急警戒】高尾山山域にて熊の目撃情報がありました。十分ご注意ください。'
          }
          className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-rose-400/70 focus:ring-1 focus:ring-rose-400/40 transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Live Marquee Preview Box */}
      <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-cyan-400">
            <Eye className="w-3.5 h-3.5" /> 画面下段テロップのリアルタイムプレビュー（右から左へスクロール表示）:
          </span>
          <span className={draft.enabled ? 'text-rose-400 font-bold' : 'text-slate-500'}>
            {draft.enabled ? '● 配信状態: 有効' : '○ 配信状態: 停止中'}
          </span>
        </div>
        <div className="relative overflow-hidden h-8 rounded-lg bg-slate-950/80 border border-white/10 flex items-center px-3 select-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white mr-3 flex-shrink-0 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>緊急情報</span>
          </span>
          <div className="flex-1 overflow-hidden h-full flex items-center">
            <div className="inline-flex whitespace-nowrap animate-marquee text-xs font-bold text-rose-200 tracking-wide">
              <span>{previewText}</span>
              <span className="mx-8 opacity-60">✦</span>
              <span>{previewText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleClear}
          className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>クリア</span>
        </button>

        <div className="flex items-center gap-3">
          {savedFeedback && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fadeIn font-semibold">
              <Check className="w-3.5 h-3.5" /> 特別なお知らせを保存しました
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md ${
              isDirty
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:brightness-110 shadow-glow-red cursor-pointer animate-pulse-slow'
                : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>特別なお知らせを保存</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
          </button>
        </div>
      </div>
    </div>
  );
}

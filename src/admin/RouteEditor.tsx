'use client';

import React, { useState, useEffect } from 'react';
import {
  Mountain, Star, MessageSquare, Check, RotateCcw,
  Sparkles, AlertCircle, Info, Globe, Save
} from 'lucide-react';
import { ROUTES } from '@/data/routes';
import { useAdminStore, DEFAULT_ROUTE_SETTINGS } from '@/store/useAdminStore';
import type { Difficulty, RouteAdminSetting } from '@/types';
import type { Language } from '@/lib/i18n';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; sub: string; color: string; badgeBg: string }[] = [
  {
    value: 'beginner',
    label: '初級',
    sub: '目安: ★1〜2',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    value: 'intermediate',
    label: '中級',
    sub: '目安: ★3〜4',
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    value: 'advanced',
    label: '上級',
    sub: '目安: ★5〜6',
    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
];

const LANG_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'ja', label: '日本語 (JA)', flag: '🇯🇵' },
  { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
  { code: 'zh', label: '中文 (ZH)', flag: '🇨🇳' },
];

export function RouteEditor() {
  const routeSettings = useAdminStore((s) => s.routeSettings);
  const updateRouteSetting = useAdminStore((s) => s.updateRouteSetting);
  const resetRouteSettings = useAdminStore((s) => s.resetRouteSettings);

  // Selected route ID
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_1');
  // Active comment language tab
  const [commentLang, setCommentLang] = useState<Language>('ja');
  // Local draft state for explicit saving (not auto-saving)
  const [draft, setDraft] = useState<RouteAdminSetting>({
    difficulty: 'beginner',
    stars: 1,
    comment: '',
    comment_en: '',
    comment_zh: '',
  });
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const selectedRoute = ROUTES.find((r) => r.id === selectedRouteId) || ROUTES[0];

  // Sync draft whenever selectedRouteId changes or external routeSettings update
  useEffect(() => {
    const saved =
      routeSettings[selectedRouteId] ||
      DEFAULT_ROUTE_SETTINGS[selectedRouteId] || {
        difficulty: selectedRoute.difficulty,
        stars: selectedRoute.difficultyRating ?? 1,
        comment: '',
        comment_en: '',
        comment_zh: '',
      };
    setDraft({ ...saved });
    setIsDirty(false);
  }, [selectedRouteId, routeSettings, selectedRoute]);

  const handleDifficultyChange = (diff: Difficulty) => {
    let suggestedStars = draft.stars;
    if (diff === 'beginner' && suggestedStars > 2) suggestedStars = 1;
    if (diff === 'intermediate' && (suggestedStars < 3 || suggestedStars > 4)) suggestedStars = 4;
    if (diff === 'advanced' && suggestedStars < 5) suggestedStars = 5;

    setDraft((prev) => ({
      ...prev,
      difficulty: diff,
      stars: suggestedStars,
    }));
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const handleStarChange = (stars: 1 | 2 | 3 | 4 | 5 | 6) => {
    let diff = draft.difficulty;
    if (stars <= 2) diff = 'beginner';
    else if (stars <= 4) diff = 'intermediate';
    else diff = 'advanced';

    setDraft((prev) => ({
      ...prev,
      stars,
      difficulty: diff,
    }));
    setIsDirty(true);
    setSavedFeedback(false);
  };

  const handleCommentChange = (text: string) => {
    setDraft((prev) => {
      if (commentLang === 'en') return { ...prev, comment_en: text };
      if (commentLang === 'zh') return { ...prev, comment_zh: text };
      return { ...prev, comment: text };
    });
    setIsDirty(true);
    setSavedFeedback(false);
  };

  // Explicit Save Action - "変更" Button requested by client
  const handleSave = () => {
    updateRouteSetting(selectedRouteId, draft);
    setIsDirty(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleResetCourse = (routeId: string) => {
    const defaultVal = DEFAULT_ROUTE_SETTINGS[routeId];
    if (defaultVal) {
      setDraft({ ...defaultVal });
      setIsDirty(true);
      setSavedFeedback(false);
    }
  };

  const getCurrentCommentText = () => {
    if (commentLang === 'en') return draft.comment_en || '';
    if (commentLang === 'zh') return draft.comment_zh || '';
    return draft.comment || '';
  };

  const getCommentPlaceholder = () => {
    if (commentLang === 'en') {
      return 'e.g. Popular main trail. Fully paved with shops and restrooms. Safe and comfortable for beginners with walking shoes.';
    }
    if (commentLang === 'zh') {
      return '例如：主峰表参道经典路线。全程铺装平整，沿途茶社洗手间齐备，初学者穿普通运动鞋即可轻松体验。';
    }
    return '例: 薬王院への表参道。全線舗装路で茶屋やトイレが充実。初心者でもスニーカーで安心の定番ルート。';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">コース・難易度管理</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
              3言語対応 (JA / EN / ZH)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            コースの難易度（初級・中級・上級）、6段階星評価、および店頭スタッフからのアドバイス（3言語）を設定できます。
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedFeedback && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fadeIn font-semibold">
              <Check className="w-3.5 h-3.5" /> 変更を保存しました
            </span>
          )}

          {/* Primary Save Button named "変更" */}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all shadow-md ${
              isDirty
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:brightness-110 shadow-glow-cyan/50 cursor-pointer animate-pulse-slow'
                : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
            }`}
            title="編集内容を確定して保存します"
          >
            <Save className="w-4 h-4" />
            <span>変更</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
          </button>

          <button
            onClick={resetRouteSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5
                       text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="すべてのコースを推奨初期設定に戻します"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 全コース初期化
          </button>
        </div>
      </div>

      {/* Main Grid: Left Route Selector, Right Active Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 8 Routes Quick List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-semibold text-slate-300">コース選択 (8コース)</span>
            <span className="text-[10px] text-slate-500">クリックして編集</span>
          </div>

          <div className="space-y-1.5">
            {ROUTES.map((route) => {
              const setting = routeSettings[route.id] || DEFAULT_ROUTE_SETTINGS[route.id] || {
                difficulty: route.difficulty,
                stars: route.difficultyRating ?? 1,
                comment: '',
              };
              const isSelected = selectedRouteId === route.id;
              const displaySetting = isSelected ? draft : setting;
              const diffBadge =
                displaySetting.difficulty === 'beginner'
                  ? { label: '初級', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
                  : displaySetting.difficulty === 'intermediate'
                  ? { label: '中級', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
                  : { label: '上級', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };

              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-glow-cyan/20 ring-1 ring-cyan-500/30'
                      : 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-xs font-bold text-white truncate">{route.name}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${diffBadge.bg}`}
                    >
                      {diffBadge.label}
                    </span>
                  </div>

                  {/* 6-Star visual indicator matching client screenshot */}
                  <div className="flex items-center justify-between text-[10px] pl-4">
                    <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E5F952] text-black font-black shadow-sm">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2 h-2 ${
                            i < displaySetting.stars
                              ? 'fill-black text-black stroke-black'
                              : 'fill-transparent text-black/30 stroke-black/30'
                          }`}
                        />
                      ))}
                    </div>
                    {(displaySetting.comment || displaySetting.comment_en || displaySetting.comment_zh) && (
                      <span className="flex items-center gap-1 text-[9px] text-cyan-400 font-medium">
                        <MessageSquare className="w-2.5 h-2.5" /> コメント有
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Course Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-5">
            {/* Header of selected route */}
            <div className="flex items-start justify-between pb-4 border-b border-white/8">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedRoute.name}</h3>
                  <span className="text-xs text-slate-400">{selectedRoute.name_en}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>距離: <strong className="text-cyan-400 font-mono">{selectedRoute.distanceKm}km</strong></span>
                  <span>所要時間: <strong className="text-cyan-400 font-mono">{selectedRoute.durationMin}分</strong></span>
                  <span>標高差: <strong className="text-cyan-400 font-mono">↑{selectedRoute.elevationM}m</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResetCourse(selectedRoute.id)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  title="このコースの推奨値に戻す"
                >
                  <RotateCcw className="w-3 h-3" /> リセット
                </button>
              </div>
            </div>

            {/* 1. 難易度区分 (初級 / 中級 / 上級) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>1. 難易度カテゴリー (Difficulty Category)</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isCurrent = draft.difficulty === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleDifficultyChange(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1 ${
                        isCurrent
                          ? `${opt.color} ring-2 ring-cyan-400/50 shadow-lg font-bold`
                          : 'border-white/10 bg-white/2 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black">{opt.label}</span>
                        {isCurrent && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <span className="text-[10px] opacity-80">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 6段階星評価 (Client Requirement: 6-star bar) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>2. 難易度 6段階評価 (6-Star Rating)</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {draft.stars} / 6
                  </span>
                </label>
                <span className="text-[11px] text-slate-400">星をクリックして直接指定</span>
              </div>

              {/* Interactive Star Bar Styled like client's screenshot */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Visual Yellow Bar / Clickable stars */}
                <div className="inline-flex items-center gap-1 p-2 rounded-2xl bg-amber-400/90 shadow-md">
                  {([1, 2, 3, 4, 5, 6] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleStarChange(num)}
                      className="p-1.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      title={`難易度 ★${num}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          num <= draft.stars
                            ? 'fill-black text-black stroke-black'
                            : 'fill-transparent text-black/35 stroke-black/35'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Quick select buttons 1 to 6 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {([1, 2, 3, 4, 5, 6] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleStarChange(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                        draft.stars === num
                          ? 'bg-amber-400 text-black shadow-glow-cyan'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ★{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. コース毎のスタッフコメント（3言語対応） */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. スタッフからのアドバイス・コメント (3言語)</span>
                </label>

                {/* 3 Languages Switcher for Comments */}
                <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
                  <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setCommentLang(opt.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        commentLang === opt.code
                          ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.flag} {opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={getCurrentCommentText()}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder={getCommentPlaceholder()}
                  rows={4}
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 transition-colors resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                  <span>選択言語: <strong className="text-cyan-400">{commentLang.toUpperCase()}</strong></span>
                  <span>{getCurrentCommentText().length} 文字</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                キオスク端末でフッターの言語切替（日本語・英語・中国語）を押すと、対応する言語のスタッフアドバイスが表示されます。
              </p>
            </div>

            {/* Bottom Explicit Save Confirmation Bar */}
            <div className="pt-3 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isDirty ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    未保存の変更があります。「変更」ボタンを押して確定してください。
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    現在の設定は保存されています。
                  </span>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                  isDirty
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:brightness-110 shadow-glow-cyan cursor-pointer'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>変更</span>
              </button>
            </div>

            {/* Live Preview of Kiosk Card */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>キオスク端末プレビュー表示 ({commentLang.toUpperCase()})</span>
                </div>
                <span className="text-[10px] text-slate-500">上の言語タブを切り替えるとプレビューも連動します</span>
              </div>

              <div className="rounded-xl bg-black/40 border border-cyan-500/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">
                      {commentLang === 'en' ? selectedRoute.name_en || selectedRoute.name : commentLang === 'zh' ? selectedRoute.name_zh || selectedRoute.name : selectedRoute.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        draft.difficulty === 'beginner'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : draft.difficulty === 'intermediate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {draft.difficulty === 'beginner'
                        ? (commentLang === 'en' ? 'Beginner' : commentLang === 'zh' ? '初级' : '初級')
                        : draft.difficulty === 'intermediate'
                        ? (commentLang === 'en' ? 'Intermediate' : commentLang === 'zh' ? '中级' : '中級')
                        : (commentLang === 'en' ? 'Advanced' : commentLang === 'zh' ? '高级' : '上級')}
                    </span>
                    <div
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold shadow-sm"
                      style={{ backgroundColor: '#E5F952', color: '#000000' }}
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < draft.stars
                              ? 'fill-black text-black'
                              : 'fill-transparent text-black/25 stroke-black/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {getCurrentCommentText() ? (
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      SALOMON {commentLang === 'en' ? 'Staff Advice' : commentLang === 'zh' ? '工作人员建议' : 'スタッフからのアドバイス'}
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {getCurrentCommentText()}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    ※ {commentLang.toUpperCase()} のスタッフコメントは未設定です。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

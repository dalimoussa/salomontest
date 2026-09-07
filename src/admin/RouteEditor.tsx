'use client';

import React, { useState } from 'react';
import {
  Mountain, Star, MessageSquare, Check, RotateCcw,
  Sparkles, AlertCircle, Info, ExternalLink, ShieldAlert
} from 'lucide-react';
import { ROUTES } from '@/data/routes';
import { useAdminStore, DEFAULT_ROUTE_SETTINGS } from '@/store/useAdminStore';
import type { Difficulty, RouteAdminSetting } from '@/types';

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

export function RouteEditor() {
  const routeSettings = useAdminStore((s) => s.routeSettings);
  const updateRouteSetting = useAdminStore((s) => s.updateRouteSetting);
  const resetRouteSettings = useAdminStore((s) => s.resetRouteSettings);

  // Default to first route
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_1');
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const selectedRoute = ROUTES.find((r) => r.id === selectedRouteId) || ROUTES[0];
  const currentSetting: RouteAdminSetting =
    routeSettings[selectedRoute.id] ||
    DEFAULT_ROUTE_SETTINGS[selectedRoute.id] || {
      difficulty: selectedRoute.difficulty,
      stars: selectedRoute.difficultyRating ?? 1,
      comment: '',
    };

  const handleDifficultyChange = (diff: Difficulty) => {
    // Auto-suggest reasonable star if outside bounds
    let suggestedStars = currentSetting.stars;
    if (diff === 'beginner' && suggestedStars > 2) suggestedStars = 1;
    if (diff === 'intermediate' && (suggestedStars < 3 || suggestedStars > 4)) suggestedStars = 4;
    if (diff === 'advanced' && suggestedStars < 5) suggestedStars = 5;

    updateRouteSetting(selectedRoute.id, {
      difficulty: diff,
      stars: suggestedStars,
    });
    triggerSavedFeedback();
  };

  const handleStarChange = (stars: 1 | 2 | 3 | 4 | 5 | 6) => {
    // Also intelligently align difficulty badge
    let diff = currentSetting.difficulty;
    if (stars <= 2) diff = 'beginner';
    else if (stars <= 4) diff = 'intermediate';
    else diff = 'advanced';

    updateRouteSetting(selectedRoute.id, {
      stars,
      difficulty: diff,
    });
    triggerSavedFeedback();
  };

  const handleCommentChange = (comment: string) => {
    updateRouteSetting(selectedRoute.id, { comment });
    triggerSavedFeedback();
  };

  const handleResetCourse = (routeId: string) => {
    const defaultVal = DEFAULT_ROUTE_SETTINGS[routeId];
    if (defaultVal) {
      updateRouteSetting(routeId, { ...defaultVal });
      triggerSavedFeedback();
    }
  };

  const triggerSavedFeedback = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">コース・難易度管理</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
              8主要コース対応
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            各コースの難易度（初級・中級・上級）、6段階星評価、および店頭スタッフからのアドバイス・コメントを設定できます。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> 保存完了
            </span>
          )}
          <button
            onClick={resetRouteSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5
                       text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="すべてのコースを推奨初期設定に戻します"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 全コース初期化
          </button>
        </div>
      </div>

      {/* Main Grid: Left Route Selector, Right Editor */}
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
              const diffBadge =
                setting.difficulty === 'beginner'
                  ? { label: '初級', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
                  : setting.difficulty === 'intermediate'
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

                  {/* 6-Star visual indicator on card */}
                  <div className="flex items-center justify-between text-[10px] pl-4">
                    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < setting.stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    {setting.comment && (
                      <span className="flex items-center gap-1 text-[9px] text-cyan-400">
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

              <button
                onClick={() => handleResetCourse(selectedRoute.id)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                title="このコースの推奨値に戻す"
              >
                <RotateCcw className="w-3 h-3" /> コース初期化
              </button>
            </div>

            {/* 1. 難易度区分 (初級 / 中級 / 上級) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>1. 難易度カテゴリー (Difficulty Category)</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isCurrent = currentSetting.difficulty === opt.value;
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
                    {currentSetting.stars} / 6
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
                          num <= currentSetting.stars
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
                        currentSetting.stars === num
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

            {/* 3. コース毎のスタッフコメント (Client Requirement: コース毎にコメント出来るように！) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. スタッフからのアドバイス・コメント (Staff Advice)</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {currentSetting.comment?.length || 0} 文字
                </span>
              </div>
              <textarea
                value={currentSetting.comment || ''}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="例: 表参道コース。全線舗装路で茶屋やトイレが充実。初心者でもスニーカーで安心して登れます。混雑時は下山を4号路や稲荷山に分けるのがおすすめ。"
                rows={4}
                className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                入力したコメントは、キオスク端末および110インチ大画面でコース詳細を開いた際に「スタッフからのアドバイス」として強調表示されます。
              </p>
            </div>

            {/* Live Preview of Kiosk Card */}
            <div className="pt-3 border-t border-white/8 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>キオスク端末プレビュー表示 (Kiosk Preview)</span>
              </div>

              <div className="rounded-xl bg-black/40 border border-cyan-500/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">{selectedRoute.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        currentSetting.difficulty === 'beginner'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : currentSetting.difficulty === 'intermediate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {currentSetting.difficulty === 'beginner'
                        ? '初級'
                        : currentSetting.difficulty === 'intermediate'
                        ? '中級'
                        : '上級'}
                    </span>
                    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400/90 text-black">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < currentSetting.stars
                              ? 'fill-black text-black'
                              : 'fill-transparent text-black/30 stroke-black/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {currentSetting.comment ? (
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      SALOMONスタッフからのアドバイス
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {currentSetting.comment}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    ※ スタッフコメントは未設定です。上の入力欄に入力するとここに表示されます。
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

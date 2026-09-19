'use client';

import React, { useEffect } from 'react';
import { MapPinned, ListChecks, Volume2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { ROUTES } from '@/data/routes';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { usePeriodicCallout } from '@/hooks/usePeriodicCallout';
import { useT } from '@/lib/i18n';
import { unlockAudio, isAudioUnlocked, onAudioUnlock } from '@/lib/audioUnlock';
import { initCameraPresenceBridge } from '@/lib/cameraPresence';
import { VoiceHUD } from './VoiceHUD';
import type { Difficulty } from '@/types';

export function QuickActions() {
  const setActiveModal        = useStore(s => s.setActiveModal);
  const setSelectedRoute      = useStore(s => s.setSelectedRoute);
  const setSelectedDifficulty = useStore(s => s.setSelectedDifficulty);
  const addMessage            = useStore(s => s.addMessage);
  const setRecommendedProducts = useStore(s => s.setRecommendedProducts);
  const { t, language }       = useT();

  const [unlocked, setUnlocked] = React.useState<boolean>(isAudioUnlocked());
  const [openaiConfigured, setOpenaiConfigured] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const unsub = onAudioUnlock((u) => setUnlocked(u));
    fetch('/api/voice/status')
      .then((r) => r.json())
      .then((d) => setOpenaiConfigured(Boolean(d.openai_configured)))
      .catch(() => setOpenaiConfigured(false));
    return unsub;
  }, []);

  const ACTIONS = [
    {
      icon: MapPinned,
      label: t('quickActions.chipBeginner'),
      subLabel: t('quickActions.chipBeginnerSub'),
      badge: '★1 × 2選',
      action: 'route_beginner',
    },
    {
      icon: ListChecks,
      label: t('quickActions.chipChecklist'),
      subLabel: t('quickActions.chipChecklistSub'),
      badge: '必携品ガイド',
      action: 'checklist',
    },
  ];

  // ── Unified Single Voice Engine ─────────────────────────────────────────────
  // useVoiceConversation: Complete Salomon Kiosk interactive pipeline:
  // - 3D terrain map route synchronization (findRouteByVoiceQuery -> setSelectedRoute)
  // - Real-time difficulty setting & modal triggering (equipment, cable car, staff)
  // - High-sensitivity audio visualizer (3.5x GainNode)
  // - Barge-in interruption & single-person vocal playback via OpenAI TTS / browser synth
  const voice = useVoiceConversation({ enabled: true });

  const {
    status,
    transcript,
    responseText,
    audioLevel,
    errorMessage,
    startListening,
    stopListening,
    cancelConversation,
    speakText,
  } = voice;

  // ── Periodic Standby Attract Callout & Conversation Lifecycle ───────────────
  // 1. 通常時待機中: 60秒（または120秒）ごとに自動呼びかけ発話
  //    「高尾山やおすすめルート、装備について、ご質問があれば話しかけてください。」
  // 2. ユーザーが話しかけた時: 呼びかけタイマー停止 → 会話モードへ
  // 3. 会話終了後: 35秒（30〜60秒）無操作で通常待機へ自動復帰 → 呼びかけ再開
  // 4. 管理者画面 (/admin) から夜間・無人停止モード（OFF）に切り替え可能
  const periodicCalloutEnabled = useAdminStore((s) => s.periodicCalloutEnabled ?? true);
  const periodicCalloutInterval = useAdminStore((s) => s.periodicCalloutInterval ?? 60);
  const setAdminPeriodicCalloutInterval = useAdminStore((s) => s.setPeriodicCalloutInterval);

  const {
    mode: calloutMode,
    intervalSeconds: calloutInterval,
    setIntervalSeconds: setCalloutInterval,
    secondsRemaining: calloutSecondsRemaining,
    isCalloutSpeaking,
    triggerCallout,
  } = usePeriodicCallout({
    enabled: periodicCalloutEnabled,
    voiceStatus: status,
    transcript,
    speakText,
    cancelConversation,
    language,
    defaultIntervalSeconds: periodicCalloutInterval,
    conversationTimeoutSeconds: 35,
  });

  const handleSetCalloutInterval = (sec: 60 | 120) => {
    setCalloutInterval(sec);
    setAdminPeriodicCalloutInterval(sec);
  };

  const handleStartListening = async () => {
    unlockAudio();
    await startListening();
  };

  // ── AI Camera Presence Bridge Integration ───────────────────────────────────
  // When an AI camera detects someone standing in front of the whiteboard,
  // greet them and automatically begin the hands-free listening loop.
  // (Disabled if periodicCalloutEnabled is false e.g. at night)
  useEffect(() => {
    const cleanup = initCameraPresenceBridge(
      async (greetingText) => {
        if (!periodicCalloutEnabled) return;
        unlockAudio();
        if (status === 'idle') {
          await speakText(greetingText);
          if (status === 'idle') {
            await handleStartListening();
          }
        }
      },
      () => language
    );
    return cleanup;
  }, [language, status, speakText, periodicCalloutEnabled]);

  const handleClick = async (action: string) => {
    if (action === 'checklist') {
      setActiveModal('equipment');
    } else if (action === 'route_beginner') {
      // 1. Ensure audio playback is enabled in browser
      unlockAudio();

      // 2. Resolve the TWO 1-star / beginner routes dynamically according to administrator settings
      const routeSettings = useAdminStore.getState().routeSettings;

      // Primary beginner trail: Trail 1 (Omotesando)
      const trail1 =
        ROUTES.find(r => r.id === 'route_1') ||
        ROUTES.find(r => (routeSettings[r.id]?.stars ?? r.difficultyRating ?? 1) === 1) ||
        ROUTES[0];

      // Secondary beginner trail: Trail 2 (Kasumidai Loop) or other 1-star route
      const trail2 =
        ROUTES.find(r => r.id === 'route_2') ||
        ROUTES.find(r => r.id !== trail1.id && (routeSettings[r.id]?.stars ?? r.difficultyRating ?? 1) === 1) ||
        ROUTES.find(r => r.id === 'route_4') ||
        ROUTES[1];

      const adminSetting1 = routeSettings[trail1.id];
      const star1 = adminSetting1?.stars ?? trail1.difficultyRating ?? 1;

      // 3. Highlight and select route in UI and 3D map
      setSelectedRoute(trail1);
      setSelectedDifficulty('beginner');

      // 4. Extract localized names
      const name1 = language === 'en' ? (trail1.name_en || trail1.name) : language === 'zh' ? (trail1.name_zh || trail1.name) : trail1.name;
      const name2 = language === 'en' ? (trail2.name_en || trail2.name) : language === 'zh' ? (trail2.name_zh || trail2.name) : trail2.name;

      // 5. Build localized response text with explicit 2-trail recommendation
      let userQuestion = '';
      let answerText = '';
      let shortAdvice = '';

      if (language === 'en') {
        userQuestion = 'Recommended trails for beginners?';
        answerText = `For beginners, we highly recommend two top trails both rated with a 1-star difficulty (★${star1}):\n1. "${name1}": Fully paved main route to Yakuo-in Temple with 5 rest areas, teahouses, and famous Tengu-yaki dumplings. Safe and comfortable for sneakers!\n2. "${name2}": A gentle 40-minute scenic loop around Takaosan Station surrounded by lush nature and tranquil forests.\nFor footwear, Salomon X Ultra 4 GORE-TEX shoes provide outstanding stability and grip!`;
        shortAdvice = `Recommended: "${name1}" & "${name2}" (★1 Beginner Trails)`;
      } else if (language === 'zh') {
        userQuestion = '初学者推荐走哪两条路线？';
        answerText = `对于初学者，我们重点推荐管理评定为1星难度（★${star1}）的两大经典路线：\n①「${name1}」：通往药王院的经典表参道，全程铺装路面，沿途茶社与洗手间齐全（共5处），普通运动鞋即可轻松体验，还可品尝特色天狗烧！\n②「${name2}」：环绕高尾山缆车站约40分钟的平缓环形林道，适合避开人流、悠闲享受森林浴。\n推荐穿着具有出色稳定支撑的萨洛蒙 X Ultra 4 徒步鞋！`;
        shortAdvice = `推荐走「${name1}」与「${name2}」（难度★1）。`;
      } else {
        userQuestion = '初心者におすすめの2大ルートは？';
        answerText = `初心者の方には、難易度星1つ（★${star1}）に指定されている2大おすすめコース「${name1}」と「${name2}」が最もおすすめです！\n①「${name1}」は全線舗装路で茶屋やトイレ（5箇所）が充実しており、スニーカーでも安心して薬王院や山頂を目指せます。名物天狗焼も楽しめます！\n②「${name2}」は高尾山駅周辺を約40分で周回できる平坦な散策路で、豊かな自然観察に最適です。\n足元には安定性に優れたサロモンの「X ULTRA 4 GORE-TEX」がぴったりです！`;
        shortAdvice = `難易度★1の「${name1}」と「${name2}」の2コースが初心者におすすめです！`;
      }

      // 6. Update recommended products for beginner hiking footwear
      const activeWeather = useStore.getState().weather || {
        weather: '快晴',
        weatherCode: 'sunny' as const,
        temp_c: 20,
        rainProbability: 0,
        precipitationMmh: 0,
        windSpeed: 2.0,
        uvIndex: 5,
        visibility: 20,
        updatedAt: new Date().toISOString(),
      };
      const season = getCurrentSeason();
      const products = getRecommendedProducts(
        trail1.difficulty ?? 'beginner',
        activeWeather.weatherCode,
        season,
        ['footwear', 'apparel'],
        6,
        trail1.category,
        language
      );
      setRecommendedProducts(products);

      // 7. Add conversation messages to Right Panel
      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        text: language === 'en' ? `🎤 "${userQuestion}"` : language === 'zh' ? `🎤 “${userQuestion}”` : `🎤 「${userQuestion}」`,
        timestamp: new Date(),
      });

      addMessage({
        id: crypto.randomUUID(),
        role: 'ai',
        text: answerText,
        advice: {
          advice_text: answerText,
          advice_short: shortAdvice,
          safety_flags: [],
          recommended_gear: ['trail_shoes_beginner', 'hat'],
          mood: 'good',
        },
        products,
        timestamp: new Date(),
      });

      // 8. Trigger voice AI speech output
      await speakText(answerText);
    }
  };

  return (
    <div className="animate-fadeInUp opacity-0-start relative"
      style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}>
      
      <p className="text-salomon-muted text-[11px] text-center mb-2 tracking-wide font-medium">
        {t('quickActions.prompt')}
        <span className="text-salomon-cyan/80 text-[10px] ml-1.5 font-bold">
          {t('quickActions.voiceBadge')}
        </span>
      </p>

      {/* ── Kiosk Standby Attract & Audio Status Bar ── */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-2.5 rounded-xl border text-[11px] shadow-sm backdrop-blur-md transition-colors ${
        !periodicCalloutEnabled
          ? 'bg-slate-900/60 border-white/5 text-slate-400'
          : 'bg-white/[0.04] border-white/10 text-salomon-muted'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            !periodicCalloutEnabled
              ? 'bg-slate-500'
              : calloutMode === 'conversation'
              ? 'bg-amber-400 animate-pulse'
              : isCalloutSpeaking
              ? 'bg-salomon-teal animate-ping'
              : 'bg-salomon-cyan'
          }`} />
          <span className="truncate font-medium text-slate-200">
            {!periodicCalloutEnabled
              ? (language === 'en'
                  ? 'Standby Attract: Stopped (Night / Admin OFF)'
                  : language === 'zh'
                  ? '待机自动呼出: 已暂停（夜间·管理员已关闭）'
                  : '通常待機呼びかけ: 停止中（夜間・管理設定によりOFF）')
              : isCalloutSpeaking
              ? (language === 'en' ? 'AI Attract Announcement playing...' : language === 'zh' ? 'AI正在自动介绍...' : 'AI自動呼びかけ発話中…')
              : calloutMode === 'conversation'
              ? (language === 'en' ? 'Conversation Mode (Auto-standby in 35s)' : language === 'zh' ? '对话模式中（35秒无操作恢复待机）' : '会話モード中（35秒無操作で通常待機へ復帰）')
              : (language === 'en'
                  ? `Standby Attract: Every ${calloutInterval}s (Next: ${calloutSecondsRemaining}s)`
                  : language === 'zh'
                  ? `待机自动呼出: 每${calloutInterval}秒 (下次: ${calloutSecondsRemaining}秒)`
                  : `通常待機呼びかけ: ${calloutInterval}秒ごと (次回まで: ${calloutSecondsRemaining}秒)`)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {/* Night Mode Badge when disabled */}
          {!periodicCalloutEnabled && (
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-amber-300 font-medium flex items-center gap-1">
              <span>🌙 {language === 'en' ? 'Night Mode (Silent)' : language === 'zh' ? '夜间静音中' : '夜間停止中（完全無音）'}</span>
            </span>
          )}

          {/* Timing toggle: 60s or 120s (shown when in standby and callout is enabled) */}
          {periodicCalloutEnabled && calloutMode === 'standby' && (
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px]">
              <button
                onClick={() => handleSetCalloutInterval(60)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  calloutInterval === 60
                    ? 'bg-salomon-cyan text-salomon-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={language === 'en' ? 'Set periodic callout to 60 seconds' : '60秒ごとに自動呼びかけ'}
              >
                60s
              </button>
              <button
                onClick={() => handleSetCalloutInterval(120)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  calloutInterval === 120
                    ? 'bg-salomon-cyan text-salomon-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={language === 'en' ? 'Set periodic callout to 120 seconds' : '120秒ごとに自動呼びかけ'}
              >
                120s
              </button>
            </div>
          )}

          {/* Instant Test Callout */}
          <button
            onClick={() => {
              unlockAudio();
              triggerCallout(true);
            }}
            className="px-2 py-0.5 rounded bg-white/10 hover:bg-salomon-cyan/20 border border-white/15 hover:border-salomon-cyan/50 text-[10px] text-white transition-all flex items-center gap-1"
            title={language === 'en' ? 'Play attract callout speech immediately' : '今すぐ呼びかけ音声を試聴再生'}
          >
            <Volume2 className="w-3 h-3 text-salomon-cyan" />
            <span>{language === 'en' ? 'Play Intro' : language === 'zh' ? '试听呼出' : '今すぐ試聴'}</span>
          </button>

          {/* Audio Unlock indicator if browser blocked autoplay */}
          {!unlocked && (
            <button
              onClick={() => unlockAudio()}
              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-[10px] text-amber-300 font-medium transition-all animate-pulse flex items-center gap-1"
              title="ブラウザの自動再生制限を解除"
            >
              <span>🔊 {language === 'en' ? 'Enable Sound' : language === 'zh' ? '启用声音' : '音声を有効化'}</span>
            </button>
          )}

          {/* OpenAI API Key Status Badge */}
          {openaiConfigured !== null && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono border flex items-center gap-1 ${
                openaiConfigured
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
              title={
                openaiConfigured
                  ? 'OpenAI Studio Neural Voice (alloy) & GPT-4o-mini active'
                  : 'OpenAI API key not set in .env.local — using browser speech synthesis'
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${openaiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {openaiConfigured ? 'OpenAI TTS' : 'Web Speech'}
            </span>
          )}
        </div>
      </div>

      {/* Action cards and Push-to-Talk Voice Concierge Button */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
        {/* Flexible Action Cards (Spans across available width, eliminating empty space with rich UI/UX) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={i}
                onClick={() => handleClick(a.action)}
                className="relative flex items-center gap-3 p-3 rounded-xl
                           bg-white/8 border border-salomon-border
                           hover:border-salomon-cyan/70 hover:bg-white/12
                           active:scale-[0.98] transition-all duration-200 group text-left min-h-[58px] overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-salomon-cyan/25 to-salomon-teal/15
                                border border-salomon-cyan/35 flex items-center justify-center flex-shrink-0
                                group-hover:shadow-glow-cyan group-hover:scale-105 transition-all duration-200">
                  <Icon className="w-4 h-4 text-salomon-cyan" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-xs sm:text-[13px] font-bold group-hover:text-salomon-cyan transition-colors truncate">
                      {a.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-salomon-cyan/15 text-salomon-cyan border border-salomon-cyan/30 flex-shrink-0">
                      {a.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors truncate mt-0.5">
                    {a.subLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Voice Push-to-Talk HUD button */}
        <VoiceHUD
          status={status}
          transcript={transcript}
          responseText={responseText}
          audioLevel={audioLevel}
          errorMessage={errorMessage}
          onStartListening={handleStartListening}
          onStopListening={stopListening}
          onCancel={cancelConversation}
          language={language}
          isCalloutSpeaking={isCalloutSpeaking}
        />
      </div>
    </div>
  );
}

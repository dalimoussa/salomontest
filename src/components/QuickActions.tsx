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
    { icon: MapPinned,  label: t('quickActions.chipBeginner'),  action: 'route_beginner' },
    { icon: ListChecks, label: t('quickActions.chipChecklist'), action: 'checklist' },
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
  const {
    mode: calloutMode,
    intervalSeconds: calloutInterval,
    setIntervalSeconds: setCalloutInterval,
    secondsRemaining: calloutSecondsRemaining,
    isCalloutSpeaking,
    triggerCallout,
  } = usePeriodicCallout({
    enabled: true,
    voiceStatus: status,
    transcript,
    speakText,
    cancelConversation,
    language,
    defaultIntervalSeconds: 60,
    conversationTimeoutSeconds: 35,
  });

  const handleStartListening = async () => {
    unlockAudio();
    await startListening();
  };

  // ── AI Camera Presence Bridge Integration ───────────────────────────────────
  // When an AI camera detects someone standing in front of the whiteboard,
  // greet them and automatically begin the hands-free listening loop.
  useEffect(() => {
    const cleanup = initCameraPresenceBridge(
      async (greetingText) => {
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
  }, [language, status, speakText]);

  const handleClick = async (action: string) => {
    if (action === 'checklist') {
      setActiveModal('equipment');
    } else if (action === 'route_beginner') {
      // 1. Ensure audio playback is enabled in browser
      unlockAudio();

      // 2. Resolve the 1-star route dynamically according to administrator page settings
      const routeSettings = useAdminStore.getState().routeSettings;

      // Find route configured with stars === 1 in admin settings (or fallback to route_1)
      const oneStarRoute =
        ROUTES.find(r => (routeSettings[r.id]?.stars ?? r.difficultyRating ?? 1) === 1) ||
        ROUTES.find(r => r.id === 'route_1') ||
        ROUTES[0];

      const adminSetting = routeSettings[oneStarRoute.id];
      const targetDifficulty: Difficulty = adminSetting?.difficulty ?? oneStarRoute.difficulty ?? 'beginner';
      const starCount: number = adminSetting?.stars ?? oneStarRoute.difficultyRating ?? 1;

      // 3. Highlight and select route in UI and 3D map
      setSelectedRoute(oneStarRoute);
      setSelectedDifficulty(targetDifficulty);

      // 4. Extract localized names and admin staff comments
      const routeName = language === 'en'
        ? (oneStarRoute.name_en || oneStarRoute.name)
        : language === 'zh'
        ? (oneStarRoute.name_zh || oneStarRoute.name)
        : oneStarRoute.name;

      const comment = language === 'en'
        ? (adminSetting?.comment_en || adminSetting?.comment || oneStarRoute.description_en || oneStarRoute.description)
        : language === 'zh'
        ? (adminSetting?.comment_zh || adminSetting?.comment || oneStarRoute.description_zh || oneStarRoute.description)
        : (adminSetting?.comment || oneStarRoute.description);

      // 5. Build localized response text with explicit 1-star definition
      let userQuestion = '';
      let answerText = '';
      let shortAdvice = '';

      if (language === 'en') {
        userQuestion = 'Recommended trail for beginners?';
        answerText = `For beginners, "${routeName}" is highly recommended, configured with a 1-star difficulty rating (★${starCount}) in our system settings! ${comment} It is fully paved and comfortable to walk, with plenty of rest stops and amenities along the way. Salomon X Ultra 4 GORE-TEX shoes provide great stability!`;
        shortAdvice = `Recommended: "${routeName}" (★${starCount} Beginner)`;
      } else if (language === 'zh') {
        userQuestion = '初学者推荐走哪条路线？';
        answerText = `对于初学者，最推荐走管理设置中评定为1星难度（★${starCount}）的「${routeName}」！${comment} 全程铺装路面平缓好走，沿途茶社与洗手间设施齐全，穿着运动鞋也能安全舒适地登山游览。推荐穿着萨洛蒙 X Ultra 4 徒步鞋！`;
        shortAdvice = `推荐走难度★${starCount}的「${routeName}」。`;
      } else {
        userQuestion = '初心者におすすめのルートは？';
        answerText = `初心者の方には、管理画面の設定で難易度星${starCount}つ（★${starCount}）に指定されている「${routeName}」が最もおすすめです！${comment} 全線舗装されて歩きやすく、途中に茶屋やトイレも充実しているため、スニーカーでも安心して登山をお楽しみいただけます。サロモンの X ULTRA 4 GORE-TEX がぴったりです！`;
        shortAdvice = `難易度★${starCount}の「${routeName}」が初心者におすすめです！`;
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
        targetDifficulty,
        activeWeather.weatherCode,
        season,
        ['footwear', 'apparel'],
        6,
        oneStarRoute.category,
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
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-salomon-muted shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            calloutMode === 'conversation'
              ? 'bg-amber-400 animate-pulse'
              : isCalloutSpeaking
              ? 'bg-salomon-teal animate-ping'
              : 'bg-salomon-cyan'
          }`} />
          <span className="truncate font-medium text-slate-200">
            {isCalloutSpeaking
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
          {/* Timing toggle: 60s or 120s */}
          {calloutMode === 'standby' && (
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px]">
              <button
                onClick={() => setCalloutInterval(60)}
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
                onClick={() => setCalloutInterval(120)}
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
              triggerCallout();
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

      {/* Action chips and Push-to-Talk Voice Concierge Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Prompt chips (min-h-[48px] touch targets for 110" kiosk display) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={i}
                onClick={() => handleClick(a.action)}
                className="flex items-center gap-2.5 p-3 rounded-xl
                           bg-white/8 border border-salomon-border
                           hover:border-salomon-cyan/60 hover:bg-white/12
                           active:scale-95 transition-all duration-200 group text-left min-h-[50px]"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-salomon-cyan/20 to-salomon-teal/10
                                border border-salomon-cyan/30 flex items-center justify-center flex-shrink-0
                                group-hover:shadow-glow-cyan transition-shadow duration-200">
                  <Icon className="w-4 h-4 text-salomon-cyan" strokeWidth={1.8} />
                </div>
                <span className="text-salomon-text text-xs leading-snug font-medium group-hover:text-white transition-colors line-clamp-2">
                  {a.label}
                </span>
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

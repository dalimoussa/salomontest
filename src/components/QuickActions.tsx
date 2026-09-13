'use client';

import React, { useEffect } from 'react';
import { MapPinned, TrainFront, ListChecks, ParkingCircle, Volume2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROUTES } from '@/data/routes';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { usePeriodicCallout } from '@/hooks/usePeriodicCallout';
import { useT } from '@/lib/i18n';
import { unlockAudio, isAudioUnlocked, onAudioUnlock } from '@/lib/audioUnlock';
import { initCameraPresenceBridge } from '@/lib/cameraPresence';
import { VoiceHUD } from './VoiceHUD';

export function QuickActions() {
  const setActiveModal        = useStore(s => s.setActiveModal);
  const setSelectedRoute      = useStore(s => s.setSelectedRoute);
  const setSelectedDifficulty = useStore(s => s.setSelectedDifficulty);
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
    { icon: MapPinned,    label: t('quickActions.chipBeginner'),  action: 'route_beginner' },
    { icon: TrainFront,   label: t('quickActions.chipCablecar'),  action: 'cablecar' },
    { icon: ParkingCircle,label: t('quickActions.chipParking'),   action: 'parking' },
    { icon: ListChecks,   label: t('quickActions.chipChecklist'), action: 'checklist' },
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

  const handleClick = (action: string) => {
    if (action === 'checklist') {
      setActiveModal('equipment');
    } else if (action === 'cablecar') {
      setActiveModal('cablecar');
    } else if (action === 'route_beginner') {
      setSelectedDifficulty('beginner');
      const r1 = ROUTES.find(r => r.id === 'route_1');
      if (r1) setSelectedRoute(r1);
    } else if (action === 'parking') {
      setActiveModal('staff');
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
              unlockAudio(true);
              triggerCallout();
            }}
            className="px-2 py-0.5 rounded bg-white/10 hover:bg-salomon-cyan/20 border border-white/15 hover:border-salomon-cyan/50 text-[10px] text-white transition-all flex items-center gap-1"
            title={language === 'en' ? 'Play attract callout speech immediately' : '今すぐ呼びかけ音声をテスト再生'}
          >
            <Volume2 className="w-3 h-3 text-salomon-cyan" />
            <span>{language === 'en' ? 'Test Intro' : language === 'zh' ? '试听呼出' : '今すぐ試聴'}</span>
          </button>

          {/* Audio Unlock indicator if browser blocked autoplay */}
          {!unlocked && (
            <button
              onClick={() => unlockAudio(true)}
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
                  : 'bg-salomon-cyan/15 border-salomon-cyan/30 text-salomon-cyan'
              }`}
              title={
                openaiConfigured
                  ? 'OpenAI Studio Neural Voice (alloy) & GPT-4o-mini active'
                  : 'High-availability neural TTS & pre-rendered attract audio active'
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${openaiConfigured ? 'bg-emerald-400' : 'bg-salomon-cyan'}`} />
              {openaiConfigured ? 'OpenAI TTS' : 'Audio Ready'}
            </span>
          )}
        </div>
      </div>

      {/* 4 action chips and Push-to-Talk Voice Concierge Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Prompt chips (min-h-[48px] touch targets for 110" kiosk display) */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
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

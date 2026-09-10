'use client';

import React, { useEffect } from 'react';
import { MapPinned, TrainFront, ListChecks, ParkingCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROUTES } from '@/data/routes';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { useT } from '@/lib/i18n';
import { unlockAudio } from '@/lib/audioUnlock';
import { initCameraPresenceBridge } from '@/lib/cameraPresence';
import { VoiceHUD } from './VoiceHUD';

export function QuickActions() {
  const setActiveModal        = useStore(s => s.setActiveModal);
  const setSelectedRoute      = useStore(s => s.setSelectedRoute);
  const setSelectedDifficulty = useStore(s => s.setSelectedDifficulty);
  const { t, language }       = useT();

  const ACTIONS = [
    { icon: MapPinned,    label: t('quickActions.chipBeginner'),  action: 'route_beginner' },
    { icon: TrainFront,   label: t('quickActions.chipCablecar'),  action: 'cablecar' },
    { icon: ParkingCircle,label: t('quickActions.chipParking'),   action: 'parking' },
    { icon: ListChecks,   label: t('quickActions.chipChecklist'), action: 'checklist' },
  ];

  // ── Voice engine selection ──────────────────────────────────────────────────
  // Primary: OpenAI Realtime API (WebRTC) — true free-flowing conversation,
  //          sub-second latency, server-side VAD, natural interruption support.
  // Fallback: Legacy record-based pipeline (useVoiceConversation) — used when
  //           the Realtime API is unavailable (no API key, older browser, etc.)
  const realtime  = useRealtimeVoice();
  const legacy    = useVoiceConversation({ enabled: !realtime.available });
  const voice     = realtime.available ? realtime : legacy;

  const {
    status,
    transcript,
    responseText,
    audioLevel,
    errorMessage,
    stopListening,
    cancelConversation,
  } = voice;

  const handleStartListening = async () => {
    unlockAudio();
    if (realtime.available) {
      const started = await realtime.startListening();
      if (!started) {
        await legacy.startListening();
      }
    } else {
      await legacy.startListening();
    }
  };

  // ── AI Camera Presence Bridge Integration ───────────────────────────────────
  // When an AI camera detects someone standing in front of the whiteboard,
  // greet them and automatically begin the hands-free listening loop.
  useEffect(() => {
    const cleanup = initCameraPresenceBridge(
      async (greetingText) => {
        unlockAudio();
        if (voice.status === 'idle') {
          await voice.speakText(greetingText);
          if (voice.status === 'idle') {
            await handleStartListening();
          }
        }
      },
      () => language
    );
    return cleanup;
  }, [language, voice]);

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
        />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { VoiceStatus } from './useVoiceConversation';
import { useStore } from '@/store/useStore';
import { unlockAudio } from '@/lib/audioUnlock';

export const CALLOUT_MESSAGES = {
  ja: '高尾山やおすすめルート、装備について、ご質問があれば話しかけてください。',
  en: 'If you have any questions about Mt. Takao, recommended trails, or gear, please feel free to talk to me.',
  zh: '关于高尾山、推荐路线或装备，如有任何疑问，请随时与我交流。',
};

export interface UsePeriodicCalloutOptions {
  enabled?: boolean;
  voiceStatus: VoiceStatus;
  transcript: string;
  speakText: (text: string) => Promise<void>;
  cancelConversation?: () => void;
  language: 'ja' | 'en' | 'zh';
  /** Default periodic interval in seconds: 60 or 120 (default: 60) */
  defaultIntervalSeconds?: 60 | 120;
  /** Inactivity duration in seconds before returning to standby after conversation ends (default: 35) */
  conversationTimeoutSeconds?: number;
}

export type CalloutMode = 'standby' | 'conversation';

/**
 * usePeriodicCallout
 *
 * Implements the interactive kiosk attract & conversation lifecycle:
 * 1. 通常時待機中 (Standby):
 *    - 60秒（または120秒）ごとに自動呼びかけ発話
 *    - 「高尾山やおすすめルート、装備について、ご質問があれば話しかけてください。」
 *    - 秒数カウントダウン (secondsRemaining) をリアルタイム管理
 * 2. ユーザーが話しかけた時:
 *    - 定期呼びかけタイマー即時停止
 *    - 会話モード (conversation) へ移行
 * 3. 会話終了後:
 *    - 30〜60秒（デフォルト35秒）の無操作で通常待機 (standby) へ自動復帰
 *    - 定期呼びかけタイマーを再開
 */
export function usePeriodicCallout({
  enabled = true,
  voiceStatus,
  transcript,
  speakText,
  cancelConversation,
  language,
  defaultIntervalSeconds = 60,
  conversationTimeoutSeconds = 35,
}: UsePeriodicCalloutOptions) {
  const [mode, setMode] = useState<CalloutMode>('standby');
  const modeRef = useRef<CalloutMode>('standby');
  modeRef.current = mode;

  // Selected interval: 60s (default) or 120s
  const [intervalSeconds, setIntervalSecondsState] = useState<60 | 120>(defaultIntervalSeconds);
  const intervalSecondsRef = useRef<60 | 120>(defaultIntervalSeconds);
  intervalSecondsRef.current = intervalSeconds;

  // Live countdown remaining (in seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultIntervalSeconds);
  const secondsRemainingRef = useRef<number>(defaultIntervalSeconds);
  secondsRemainingRef.current = secondsRemaining;

  const [isCalloutSpeaking, setIsCalloutSpeaking] = useState<boolean>(false);
  const isCalloutSpeakingRef = useRef<boolean>(false);
  isCalloutSpeakingRef.current = isCalloutSpeaking;

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const standbyRecoveryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const setIntervalSeconds = useCallback((sec: 60 | 120) => {
    setIntervalSecondsState(sec);
    intervalSecondsRef.current = sec;
    setSecondsRemaining(sec);
    secondsRemainingRef.current = sec;
    console.log(`[usePeriodicCallout] Periodic callout interval changed to: ${sec}s`);
  }, []);

  // ── Execute Periodic Callout ────────────────────────────────────────────────
  const triggerCallout = useCallback(async () => {
    if (!enabled) return;
    // Do not speak if already in active user conversation
    if (modeRef.current !== 'standby') return;
    // Do not speak if user is asking a question or AI is processing/answering
    if (voiceStatus === 'thinking') return;
    if (voiceStatus === 'speaking' && !isCalloutSpeakingRef.current) return;
    if (transcript && transcript.trim().length > 0) return;
    // Do not speak if modal (e.g. equipment, cable car) is open
    if (useStore.getState().activeModal) return;

    unlockAudio();
    const message = CALLOUT_MESSAGES[language] || CALLOUT_MESSAGES.ja;
    console.log(`[usePeriodicCallout] Triggering attract callout (${language}, interval=${intervalSecondsRef.current}s):`, message);

    try {
      isCalloutSpeakingRef.current = true;
      setIsCalloutSpeaking(true);
      await speakText(message);
    } catch (e) {
      console.warn('[usePeriodicCallout] Callout speakText failed:', e);
    } finally {
      isCalloutSpeakingRef.current = false;
      setIsCalloutSpeaking(false);
      // Reset countdown to the full interval after callout finishes
      setSecondsRemaining(intervalSecondsRef.current);
      secondsRemainingRef.current = intervalSecondsRef.current;
    }
  }, [enabled, voiceStatus, transcript, language, speakText]);

  // ── Switch to Conversation Mode ─────────────────────────────────────────────
  const enterConversationMode = useCallback(() => {
    if (modeRef.current !== 'conversation') {
      console.log('[usePeriodicCallout] User speech/interaction detected -> Switching to Conversation Mode (Callout timer stopped)');
      modeRef.current = 'conversation';
      setMode('conversation');
    }
    isCalloutSpeakingRef.current = false;
    setIsCalloutSpeaking(false);
    if (standbyRecoveryTimerRef.current) {
      clearTimeout(standbyRecoveryTimerRef.current);
      standbyRecoveryTimerRef.current = null;
    }
  }, []);

  // ── Schedule Return to Standby after Conversation Ends ───────────────────────
  const scheduleStandbyRecovery = useCallback(() => {
    if (standbyRecoveryTimerRef.current) {
      clearTimeout(standbyRecoveryTimerRef.current);
      standbyRecoveryTimerRef.current = null;
    }
    if (modeRef.current !== 'conversation') return;

    console.log(`[usePeriodicCallout] Conversation idle -> Scheduling return to Standby in ${conversationTimeoutSeconds}s`);
    standbyRecoveryTimerRef.current = setTimeout(() => {
      console.log('[usePeriodicCallout] Inactivity timeout reached -> Returning to Standby mode & restarting periodic callouts');
      modeRef.current = 'standby';
      setMode('standby');
      if (standbyRecoveryTimerRef.current) {
        clearTimeout(standbyRecoveryTimerRef.current);
        standbyRecoveryTimerRef.current = null;
      }

      if (cancelConversation) {
        try {
          cancelConversation();
        } catch {}
      }

      // Reset countdown to interval
      setSecondsRemaining(intervalSecondsRef.current);
      secondsRemainingRef.current = intervalSecondsRef.current;
    }, conversationTimeoutSeconds * 1000);
  }, [conversationTimeoutSeconds, cancelConversation]);

  // ── Active Mode Watcher & Transition Logic ──────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // 1. User is speaking or thinking -> enter Conversation Mode immediately
    if (
      (voiceStatus === 'listening' && transcript.trim().length > 0) ||
      voiceStatus === 'thinking' ||
      (voiceStatus === 'speaking' && !isCalloutSpeakingRef.current)
    ) {
      enterConversationMode();
      return;
    }

    // 2. User finished talking and AI is back to idle while in conversation mode
    if (voiceStatus === 'idle' && modeRef.current === 'conversation') {
      scheduleStandbyRecovery();
    }
  }, [enabled, voiceStatus, transcript, enterConversationMode, scheduleStandbyRecovery]);

  // ── Countdown Timer Tick (Runs every 1s when in standby) ──────────────────────
  useEffect(() => {
    if (!enabled) return;

    countdownTimerRef.current = setInterval(() => {
      if (modeRef.current !== 'standby') return;
      if (isCalloutSpeakingRef.current) return;
      if (voiceStatus === 'thinking' || (voiceStatus === 'speaking' && !isCalloutSpeakingRef.current)) return;
      if (transcript && transcript.trim().length > 0) return;
      if (useStore.getState().activeModal) return;

      const next = secondsRemainingRef.current - 1;
      if (next <= 0) {
        setSecondsRemaining(0);
        secondsRemainingRef.current = 0;
        triggerCallout();
      } else {
        setSecondsRemaining(next);
        secondsRemainingRef.current = next;
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [enabled, voiceStatus, transcript, triggerCallout]);

  // ── User Screen Interaction Watcher ──────────────────────────────────────────
  // Any physical touch / click on the screen delays callout and refreshes inactivity timer
  useEffect(() => {
    const handleUserTouch = () => {
      if (modeRef.current === 'conversation') {
        // Extend conversation mode timer if user touches screen
        scheduleStandbyRecovery();
      } else if (modeRef.current === 'standby') {
        // Delay scheduled callout so we don't speak over someone touching the screen
        setSecondsRemaining(intervalSecondsRef.current);
        secondsRemainingRef.current = intervalSecondsRef.current;
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserTouch, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserTouch));
    };
  }, [scheduleStandbyRecovery]);

  // ── Cleanup on Unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (standbyRecoveryTimerRef.current) {
        clearTimeout(standbyRecoveryTimerRef.current);
      }
    };
  }, []);

  return {
    mode,
    intervalSeconds,
    setIntervalSeconds,
    secondsRemaining,
    isCalloutSpeaking,
    triggerCallout,
    enterConversationMode,
  };
}

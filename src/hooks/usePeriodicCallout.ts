'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { VoiceStatus } from './useVoiceConversation';
import { useStore } from '@/store/useStore';

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
  /** Periodic interval between callouts in standby mode (default: 75_000 ms / 75 sec) */
  calloutIntervalMs?: number;
  /** Inactivity duration after conversation ends before returning to standby (default: 40_000 ms / 40 sec) */
  conversationTimeoutMs?: number;
}

export type CalloutMode = 'standby' | 'conversation';

/**
 * usePeriodicCallout
 *
 * Implements the interactive kiosk attract & conversation lifecycle:
 * 1. 通常時待機中 (Standby):
 *    - 60秒〜120秒ごと（デフォルト75秒）に自動で呼びかけ発話
 *    - 「高尾山やおすすめルート、装備について、ご質問があれば話しかけてください。」
 * 2. ユーザーが話しかけた時:
 *    - 定期呼びかけタイマー即時停止
 *    - 会話モード (conversation) へ移行
 * 3. 会話終了後:
 *    - 30〜60秒（デフォルト40秒）の無操作で通常待機 (standby) へ自動復帰
 *    - 定期呼びかけタイマーを再開
 */
export function usePeriodicCallout({
  enabled = true,
  voiceStatus,
  transcript,
  speakText,
  cancelConversation,
  language,
  calloutIntervalMs = 75_000,
  conversationTimeoutMs = 40_000,
}: UsePeriodicCalloutOptions) {
  const [mode, setMode] = useState<CalloutMode>('standby');
  const modeRef = useRef<CalloutMode>('standby');
  modeRef.current = mode;

  const isCalloutSpeakingRef = useRef<boolean>(false);
  const calloutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const standbyRecoveryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeModal = useStore((s) => s.activeModal);

  // ── Helper: Clear all running timers ─────────────────────────────────────────
  const clearCalloutTimer = useCallback(() => {
    if (calloutTimerRef.current) {
      clearTimeout(calloutTimerRef.current);
      calloutTimerRef.current = null;
    }
  }, []);

  const clearStandbyRecoveryTimer = useCallback(() => {
    if (standbyRecoveryTimerRef.current) {
      clearTimeout(standbyRecoveryTimerRef.current);
      standbyRecoveryTimerRef.current = null;
    }
  }, []);

  // ── Execute Periodic Callout ────────────────────────────────────────────────
  const triggerCallout = useCallback(async () => {
    if (!enabled) return;
    // Do not interrupt active conversation, modals, or ongoing audio
    if (modeRef.current !== 'standby') return;
    if (voiceStatus !== 'idle') return;
    if (useStore.getState().activeModal) return;

    const message = CALLOUT_MESSAGES[language] || CALLOUT_MESSAGES.ja;
    console.log(`[usePeriodicCallout] Triggering periodic attract callout (${language}):`, message);

    try {
      isCalloutSpeakingRef.current = true;
      await speakText(message);
    } catch (e) {
      console.warn('[usePeriodicCallout] Callout speakText failed:', e);
    } finally {
      isCalloutSpeakingRef.current = false;
    }
  }, [enabled, voiceStatus, language, speakText]);

  // ── Schedule Next Callout ───────────────────────────────────────────────────
  const scheduleNextCallout = useCallback(
    (delayMs: number = calloutIntervalMs) => {
      clearCalloutTimer();
      if (!enabled || modeRef.current !== 'standby') return;

      calloutTimerRef.current = setTimeout(async () => {
        await triggerCallout();
        // After callout finishes, schedule the next interval if still in standby
        if (modeRef.current === 'standby') {
          scheduleNextCallout(calloutIntervalMs);
        }
      }, delayMs);
    },
    [enabled, calloutIntervalMs, clearCalloutTimer, triggerCallout]
  );

  // ── Switch to Conversation Mode ─────────────────────────────────────────────
  const enterConversationMode = useCallback(() => {
    if (modeRef.current !== 'conversation') {
      console.log('[usePeriodicCallout] User speech detected -> Switching to Conversation Mode (Callout timer stopped)');
      modeRef.current = 'conversation';
      setMode('conversation');
    }
    // Stop attract callout loop while user is conversing
    clearCalloutTimer();
    clearStandbyRecoveryTimer();
    isCalloutSpeakingRef.current = false;
  }, [clearCalloutTimer, clearStandbyRecoveryTimer]);

  // ── Schedule Return to Standby after Conversation Ends ───────────────────────
  const scheduleStandbyRecovery = useCallback(() => {
    clearStandbyRecoveryTimer();
    if (modeRef.current !== 'conversation') return;

    console.log(`[usePeriodicCallout] Conversation idle -> Scheduling return to Standby in ${conversationTimeoutMs / 1000}s`);
    standbyRecoveryTimerRef.current = setTimeout(() => {
      console.log('[usePeriodicCallout] Inactivity timeout reached -> Returning to Standby mode & restarting periodic callouts');
      modeRef.current = 'standby';
      setMode('standby');
      clearStandbyRecoveryTimer();

      // Cleanly reset conversation UI card if present
      if (cancelConversation) {
        try {
          cancelConversation();
        } catch {}
      }

      // Resume periodic callout timer
      scheduleNextCallout(calloutIntervalMs);
    }, conversationTimeoutMs);
  }, [clearStandbyRecoveryTimer, conversationTimeoutMs, cancelConversation, scheduleNextCallout, calloutIntervalMs]);

  // ── Monitor Voice Status Changes ─────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      clearCalloutTimer();
      clearStandbyRecoveryTimer();
      return;
    }

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
      return;
    }

    // 3. System is idle in standby mode -> ensure callout timer is running
    if (voiceStatus === 'idle' && modeRef.current === 'standby' && !calloutTimerRef.current) {
      scheduleNextCallout(calloutIntervalMs);
    }
  }, [
    enabled,
    voiceStatus,
    transcript,
    enterConversationMode,
    scheduleStandbyRecovery,
    scheduleNextCallout,
    calloutIntervalMs,
    clearCalloutTimer,
    clearStandbyRecoveryTimer,
  ]);

  // ── User Screen Interaction Watcher ──────────────────────────────────────────
  // Any physical touch / click on the screen delays callout and refreshes inactivity timer
  useEffect(() => {
    const handleUserTouch = () => {
      if (modeRef.current === 'conversation') {
        // Extend conversation mode timer if user touches screen
        scheduleStandbyRecovery();
      } else if (modeRef.current === 'standby') {
        // Delay scheduled callout so we don't speak over someone touching the screen
        scheduleNextCallout(calloutIntervalMs);
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserTouch, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserTouch));
    };
  }, [scheduleStandbyRecovery, scheduleNextCallout, calloutIntervalMs]);

  // ── Cleanup on Unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearCalloutTimer();
      clearStandbyRecoveryTimer();
    };
  }, [clearCalloutTimer, clearStandbyRecoveryTimer]);

  return {
    mode,
    triggerCallout,
    enterConversationMode,
  };
}

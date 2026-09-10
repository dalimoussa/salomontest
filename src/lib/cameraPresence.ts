/**
 * cameraPresence.ts
 *
 * AI Camera Presence Detection Integration for Interactive Whiteboard Kiosks.
 *
 * When an AI camera detects a person entering the kiosk zone, this module:
 * 1. Unlocks the audio context automatically.
 * 2. Plays a welcoming voice greeting in the active language (JA / EN / ZH).
 * 3. Immediately engages the hands-free continuous voice listening loop
 *    without requiring the user to press any start button.
 *
 * Supported Camera Integration Interfaces:
 * - CustomEvent: window.dispatchEvent(new CustomEvent('salomon:presence', { detail: { detected: true } }))
 * - Global Function: window.__SALOMON_CAMERA_PRESENCE(true)
 * - postMessage: window.postMessage({ type: 'salomon:presence', detected: true }, '*')
 */

import { unlockAudio } from './audioUnlock';

export const CAMERA_GREETINGS = {
  ja: 'こんにちは！サロモン高尾山AIコンシェルジュです。おすすめの登山コースや現在の天候など、どうぞお気軽にお声がけください！',
  en: "Welcome to Mt. Takao! I'm your Salomon AI Concierge. Feel free to ask about trail routes, weather, or hiking gear!",
  zh: '您好！欢迎来到高尾山。我是您的萨洛蒙AI向导，关于登山路线、山顶天气或装备，请随时向我提问！',
};

export type CameraPresenceHandler = (greetingText: string) => void;

let presenceCleanup: (() => void) | null = null;

export function initCameraPresenceBridge(onUserDetected: CameraPresenceHandler, getLanguage: () => 'ja' | 'en' | 'zh'): () => void {
  if (typeof window === 'undefined') return () => {};

  if (presenceCleanup) {
    presenceCleanup();
  }

  let lastTriggerTime = 0;
  const DEBOUNCE_MS = 15_000; // Avoid duplicate greetings within 15 seconds

  const handlePresence = (detected: boolean = true) => {
    if (!detected) return;
    const now = Date.now();
    if (now - lastTriggerTime < DEBOUNCE_MS) return;
    lastTriggerTime = now;

    unlockAudio();
    const lang = getLanguage();
    const greeting = CAMERA_GREETINGS[lang] || CAMERA_GREETINGS.ja;
    onUserDetected(greeting);
  };

  // 1. CustomEvent listener
  const onCustomEvent = (e: Event) => {
    const ce = e as CustomEvent<{ detected?: boolean }>;
    handlePresence(ce.detail?.detected ?? true);
  };
  window.addEventListener('salomon:presence', onCustomEvent);

  // 2. postMessage listener (for iframe / external camera daemon)
  const onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'salomon:presence') {
      handlePresence(e.data.detected ?? true);
    }
  };
  window.addEventListener('message', onMessage);

  // 3. Global window function bridge
  (window as any).__SALOMON_CAMERA_PRESENCE = handlePresence;

  presenceCleanup = () => {
    window.removeEventListener('salomon:presence', onCustomEvent);
    window.removeEventListener('message', onMessage);
    delete (window as any).__SALOMON_CAMERA_PRESENCE;
  };

  return presenceCleanup;
}

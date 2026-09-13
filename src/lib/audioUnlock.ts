/**
 * audioUnlock.ts
 *
 * Ensures AudioContext and HTMLAudioElement / Web Speech API are unlocked
 * on the first user interaction (touch/click/key), complying with browser
 * Autoplay policies across Chrome, Edge, Safari, iOS, Android, and Kiosk screens.
 */

let isUnlocked = false;
let sharedAudioCtx: AudioContext | null = null;
const unlockListeners = new Set<(unlocked: boolean) => void>();

export function isAudioUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return isUnlocked;
}

export function onAudioUnlock(cb: (unlocked: boolean) => void): () => void {
  unlockListeners.add(cb);
  cb(isUnlocked);
  return () => unlockListeners.delete(cb);
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      try {
        sharedAudioCtx = new AudioCtx();
      } catch {}
    }
  }
  return sharedAudioCtx;
}

export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (isUnlocked) return;

  try {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Play a 1-sample silent buffer to unlock audio pipeline
    if (ctx) {
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch {}
    }

    // Warm up Web Speech API in Chromium browsers
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.getVoices();
      } catch {}
    }

    isUnlocked = true;
    unlockListeners.forEach(cb => {
      try { cb(true); } catch {}
    });
    console.log('[audioUnlock] Audio pipeline unlocked successfully');
  } catch (e) {
    console.warn('[audioUnlock] Audio unlock encountered minor error:', e);
  }
}

// Automatically register global interaction listeners on initial page load
if (typeof window !== 'undefined') {
  const handler = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('touchstart', handler);
    window.removeEventListener('click', handler);
    window.removeEventListener('keydown', handler);
    window.removeEventListener('wheel', handler);
  };
  window.addEventListener('pointerdown', handler, { passive: true, once: true });
  window.addEventListener('touchstart', handler, { passive: true, once: true });
  window.addEventListener('click', handler, { passive: true, once: true });
  window.addEventListener('keydown', handler, { passive: true, once: true });
  window.addEventListener('wheel', handler, { passive: true, once: true });
}

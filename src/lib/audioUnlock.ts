/**
 * audioUnlock.ts
 *
 * Ensures AudioContext and HTMLAudioElement / Web Speech API are unlocked
 * on user interaction (touch/click/key), complying with browser
 * Autoplay policies across Chrome, Edge, Safari, iOS, Android, and Kiosk screens.
 * Preloads callout MP3s into memory AudioBuffers for zero-latency, glitch-free attract audio.
 */

let isUnlocked = false;
let sharedAudioCtx: AudioContext | null = null;
const unlockListeners = new Set<(unlocked: boolean) => void>();
const audioBufferCache: Record<string, AudioBuffer> = {};

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
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      try {
        sharedAudioCtx = new AudioCtx();
      } catch {}
    }
  }
  return sharedAudioCtx;
}

/** Preload callout audio files into memory AudioBuffers */
export async function preloadCalloutBuffers(): Promise<void> {
  if (typeof window === 'undefined') return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const langs = ['ja', 'en', 'zh'] as const;
  for (const lang of langs) {
    if (audioBufferCache[lang]) continue;
    try {
      const res = await fetch(`/audio/callout_${lang}.mp3`);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        audioBufferCache[lang] = audioBuf;
        console.log(`[audioUnlock] Preloaded attract audio buffer for: ${lang} (${audioBuf.duration.toFixed(1)}s)`);
      }
    } catch (e) {
      console.warn(`[audioUnlock] Failed to preload buffer for ${lang}:`, e);
    }
  }
}

/**
 * Play preloaded callout audio directly via Web Audio API AudioBufferSourceNode.
 * Completely bypasses HTML5 <audio> tag buffering and codec quirks.
 */
export function playPreloadedCalloutAudio(lang: 'ja' | 'en' | 'zh'): { promise: Promise<boolean>; stop: () => void } | null {
  if (typeof window === 'undefined') return null;
  const ctx = getSharedAudioContext();
  const buffer = audioBufferCache[lang];

  if (!ctx || !buffer || ctx.state !== 'running') {
    return null;
  }

  let sourceNode: AudioBufferSourceNode | null = null;
  const promise = new Promise<boolean>((resolve) => {
    try {
      sourceNode = ctx.createBufferSource();
      sourceNode.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;
      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      sourceNode.onended = () => {
        sourceNode = null;
        resolve(true);
      };

      sourceNode.start(0);
      console.log(`[audioUnlock] Playing preloaded attract audio via Web Audio BufferSource (${lang})`);
    } catch (e) {
      console.warn('[audioUnlock] Web Audio BufferSource start failed:', e);
      resolve(false);
    }
  });

  return {
    promise,
    stop: () => {
      try {
        if (sourceNode) {
          sourceNode.stop();
          sourceNode.disconnect();
          sourceNode = null;
        }
      } catch {}
    },
  };
}

export function unlockAudio(fromUserGesture = false): void {
  if (typeof window === 'undefined') return;

  try {
    const ctx = getSharedAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isUnlocked = true;
          unlockListeners.forEach((cb) => { try { cb(true); } catch {} });
          preloadCalloutBuffers().catch(() => {});
        }).catch(() => {});
      } else if (ctx.state === 'running' && fromUserGesture) {
        isUnlocked = true;
        unlockListeners.forEach((cb) => { try { cb(true); } catch {} });
        preloadCalloutBuffers().catch(() => {});
      }

      // Play a 1-sample silent Web Audio buffer to kickstart audio thread
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch {}
    }

    // Play a tiny base64 silent WAV with HTML5 Audio to satisfy browser autoplay policy
    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.volume = 0.01;
      silentAudio.play().then(() => {
        isUnlocked = true;
        unlockListeners.forEach((cb) => { try { cb(true); } catch {} });
        preloadCalloutBuffers().catch(() => {});
      }).catch(() => {});
    } catch {}

    // Warm up Web Speech API in Chromium browsers
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.getVoices();
      } catch {}
    }

    if (fromUserGesture) {
      isUnlocked = true;
      unlockListeners.forEach((cb) => { try { cb(true); } catch {} });
      preloadCalloutBuffers().catch(() => {});
      console.log('[audioUnlock] Audio pipeline unlocked via user gesture');
    }
  } catch (e) {
    console.warn('[audioUnlock] Audio unlock encountered minor error:', e);
  }
}

// Automatically register global interaction listeners on initial page load
if (typeof window !== 'undefined') {
  const handler = () => {
    unlockAudio(true);
    if (isUnlocked) {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    }
  };
  window.addEventListener('pointerdown', handler, { passive: true });
  window.addEventListener('touchstart', handler, { passive: true });
  window.addEventListener('click', handler, { passive: true });
  window.addEventListener('keydown', handler, { passive: true });

  // Initial attempt to preload buffers
  setTimeout(() => {
    preloadCalloutBuffers().catch(() => {});
  }, 1000);
}


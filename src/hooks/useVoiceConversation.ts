'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { getAIAdvice } from '@/api/llm';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';
import { getTrailStatus } from '@/data/trailStatus';
import { getFacilities } from '@/data/facilities';
import { ROUTES } from '@/data/routes';
import { unlockAudio } from '@/lib/audioUnlock';
import type { WeatherData } from '@/types';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface UseVoiceConversationReturn {
  status: VoiceStatus;
  transcript: string;
  responseText: string;
  audioLevel: number;
  errorMessage: string | null;
  isHandsFree: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelConversation: () => void;
  speakText: (text: string, lang?: string) => Promise<void>;
}

function getTargetRecognitionLang(lang: 'ja' | 'en' | 'zh'): string {
  if (lang === 'en') return 'en-US';
  if (lang === 'zh') return 'zh-CN';
  return 'ja-JP';
}

export function useVoiceConversation(options?: { enabled?: boolean }): UseVoiceConversationReturn {
  const enabled = options?.enabled ?? true;
  const [status, setStatusState] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseTextState] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHandsFree, setIsHandsFree] = useState(true);

  const statusRef = useRef<VoiceStatus>('idle');
  const setStatus = (next: VoiceStatus) => {
    statusRef.current = next;
    setStatusState(next);
  };

  const responseTextRef = useRef<string>('');
  const setResponseText = (text: string) => {
    responseTextRef.current = text;
    setResponseTextState(text);
  };

  const autoLoopRef = useRef<boolean>(true);
  const startListeningRef = useRef<() => Promise<void>>();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const localTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Forward ref for processRecordedAudio to eliminate stale closures
  const processRecordedAudioRef = useRef<(audioBlob?: Blob | null, directText?: string) => Promise<void>>();

  // Turn management and interruption refs
  const resultStartIndexRef = useRef<number>(0);
  const recognitionResultCountRef = useRef<number>(0);
  const pendingCommittedTextRef = useRef<string>('');
  const abortSpeakingRef = useRef<(() => void) | null>(null);
  const interruptedRef = useRef<boolean>(false);
  const generationIdRef = useRef<number>(0);

  // Concurrency mutex token: strictly prevents two voices from speaking simultaneously
  const activeSpeechTokenRef = useRef<number>(0);

  // Energy-based Voice Activity Detection (VAD) fallback refs
  const hasSpokenEnergyRef = useRef<boolean>(false);
  const lastVoiceEnergyTimestampRef = useRef<number>(0);
  const energySilenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Kiosk Echo / Self-Recognition Prevention ────────────────────────────────
  // On a 110" open-speaker kiosk there is no hardware AEC. These constants define
  // the hard-mute window that prevents the AI from hearing its own voice output.

  /** Block ALL mic recognition for this many ms after AI finishes speaking */
  const POST_SPEECH_GUARD_MS = 1200;

  /** Do not commit silence during the first N ms of a new listening session.
   *  Allows users to say "Hello" + natural pause + full question without early cutoff. */
  const LISTENING_WARMUP_MS = 2000;

  /** Silence after a FINAL recognition result before committing (raised from 350 → 600ms) */
  const COMMIT_DELAY_FINAL_MS = 600;

  /** Silence after an INTERIM recognition result before committing (raised from 650 → 1200ms) */
  const COMMIT_DELAY_INTERIM_MS = 1200;

  /** True while AI is outputting TTS audio AND during the post-speech guard window */
  const isSpeakingRef = useRef<boolean>(false);

  /** Cancels any pending post-speech guard timer when a new turn begins */
  const postSpeechGuardTimerRef = useRef<NodeJS.Timeout | null>(null);

  /** Timestamp when the current listening session started — used for warmup guard */
  const listeningStartTimestampRef = useRef<number>(0);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    resultStartIndexRef.current = 0;
    recognitionResultCountRef.current = 0;
  }, []);

  const abortSpeaking = useCallback(() => {
    interruptedRef.current = true;
    generationIdRef.current++;
    // Monotonically increment speech token to immediately invalidate any pending TTS fetches or playbacks
    activeSpeechTokenRef.current++;

    // 1. Abort any active promise resolver or watchdog
    if (abortSpeakingRef.current) {
      try {
        abortSpeakingRef.current();
      } catch {}
      abortSpeakingRef.current = null;
    }

    // 2. Safely stop and detach HTML5 Audio element
    if (currentAudioRef.current) {
      try {
        const audio = currentAudioRef.current;
        // Detach listeners BEFORE changing src so audio.onerror does not trigger fallback speech!
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch {}
      currentAudioRef.current = null;
    }

    // 3. Immediately halt Web Speech API SpeechSynthesis without Chrome audio buffer bleed
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (currentUtteranceRef.current) {
          currentUtteranceRef.current.onend = null;
          currentUtteranceRef.current.onerror = null;
          currentUtteranceRef.current = null;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
        // Chrome quirk: A delayed second cancel guarantees the audio thread clears
        setTimeout(() => {
          try {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          } catch {}
        }, 35);
      } catch {}
    }

    setResponseText('');
  }, []);

  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Hardware microphone muting: physically disables the audio track on the MediaStream.
   * While disabled, the browser captures absolute silence (zeroed PCM), completely
   * preventing the AI from hearing itself or picking up user speech during answering.
   */
  const muteMicrophoneHardware = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
    setAudioLevel(0);
  }, []);

  const unmuteMicrophoneHardware = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    }
  }, []);

  /**
   * Helper to check if audio or speech synthesis is actively outputting sound.
   * Prevents premature turn-switching or premature listening while audio is still playing.
   */
  const isAudioActivelyPlaying = useCallback((): boolean => {
    if (currentAudioRef.current && !currentAudioRef.current.paused && !currentAudioRef.current.ended) {
      return true;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        return true;
      }
    }
    return false;
  }, []);

  /**
   * Unconditional busy check: returns true if the AI is thinking, speaking, in echo-guard,
   * or has audio actively playing. In this state, ALL user input MUST be ignored.
   */
  const isBusyResponding = useCallback((): boolean => {
    return (
      statusRef.current === 'thinking' ||
      statusRef.current === 'speaking' ||
      isSpeakingRef.current ||
      isAudioActivelyPlaying()
    );
  }, [isAudioActivelyPlaying]);

  const weather = useStore((s) => s.weather);
  const selectedRoute = useStore((s) => s.selectedRoute);
  const selectedDifficulty = useStore((s) => s.selectedDifficulty);
  const language = useStore((s) => s.language);
  const addMessage = useStore((s) => s.addMessage);
  const setIsGenerating = useStore((s) => s.setIsGenerating);
  const setRecommendedProducts = useStore((s) => s.setRecommendedProducts);
  const setSelectedRoute = useStore((s) => s.setSelectedRoute);
  const setSelectedDifficulty = useStore((s) => s.setSelectedDifficulty);
  const setActiveModal = useStore((s) => s.setActiveModal);

  // Audio level visualizer loop — boosted high-sensitivity sensor
  const startLevelMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;

      // 3.5x gain amplification so quiet and soft voices register dynamically on the sensor
      const source = ctx.createMediaStreamSource(stream);
      const gainNode = ctx.createGain();
      gainNode.gain.value = 3.5;
      source.connect(gainNode);
      gainNode.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(data);
        const sum = data.reduce((acc, val) => acc + val, 0);
        const avg = sum / data.length;
        // Non-linear power curve that magnifies low speaking levels significantly
        const normalized = Math.min(1, Math.max(0, Math.pow(avg / 25, 0.65)));
        setAudioLevel(normalized);

        // Hybrid Energy VAD: Detect voice presence even if Web Speech API is unresponsive.
        // Skip entirely if AI is busy responding — speaker bleed would trigger false positives.
        if (isBusyResponding()) {
          setAudioLevel(0);
          if (energySilenceTimerRef.current) {
            clearTimeout(energySilenceTimerRef.current);
            energySilenceTimerRef.current = null;
          }
          hasSpokenEnergyRef.current = false;
        } else if (statusRef.current === 'listening') {
          if (normalized > 0.12) {
            hasSpokenEnergyRef.current = true;
            lastVoiceEnergyTimestampRef.current = Date.now();
            if (energySilenceTimerRef.current) {
              clearTimeout(energySilenceTimerRef.current);
              energySilenceTimerRef.current = null;
            }
          } else if (hasSpokenEnergyRef.current) {
            const silenceElapsed = Date.now() - lastVoiceEnergyTimestampRef.current;
            if (silenceElapsed > 900 && !energySilenceTimerRef.current) {
              energySilenceTimerRef.current = setTimeout(() => {
                if (statusRef.current === 'listening' && hasSpokenEnergyRef.current && !isBusyResponding()) {
                  commitCurrentSpeech();
                }
              }, 100);
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn('AudioContext level meter not available:', e);
    }
  };

  const stopLevelMeter = () => {
    if (energySilenceTimerRef.current) {
      clearTimeout(energySilenceTimerRef.current);
      energySilenceTimerRef.current = null;
    }
    hasSpokenEnergyRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Fallback to Web Speech API speechSynthesis if OpenAI TTS unavailable
  const speakWithBrowserSynth = useCallback((text: string, lang?: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      if (interruptedRef.current) {
        resolve();
        return;
      }

      unlockAudio();

      const activeLang = lang || useStore.getState().language;
      const targetLang = activeLang === 'en' ? 'en-US' : activeLang === 'zh' ? 'zh-CN' : 'ja-JP';

      let finished = false;
      let watchdog: NodeJS.Timeout | null = null;
      let keepAlive: NodeJS.Timeout | null = null;

      const finish = () => {
        if (!finished) {
          finished = true;
          if (watchdog) clearTimeout(watchdog);
          if (keepAlive) clearInterval(keepAlive);
          if (currentUtteranceRef.current) {
            currentUtteranceRef.current.onend = null;
            currentUtteranceRef.current.onerror = null;
            currentUtteranceRef.current = null;
          }
          abortSpeakingRef.current = null;
          resolve();
        }
      };

      abortSpeakingRef.current = finish;

      const performSpeak = () => {
        if (interruptedRef.current || finished) {
          finish();
          return;
        }

        try {
          // Clear any previous queued speech
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = targetLang;
          utterance.rate = 0.98;
          // Male mountain guide tone tuning: 0.80 pitch lowers the voice frequency into a resonant, calm male baritone
          utterance.pitch = 0.80;
          utterance.volume = 1.0;
          currentUtteranceRef.current = utterance;

          // Select authoritative male voice for the target language
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const langPrefix = activeLang === 'en' ? 'en' : activeLang === 'zh' ? 'zh' : 'ja';
            const langVoices = voices.filter((v) =>
              v.lang.toLowerCase() === targetLang.toLowerCase() ||
              v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix) ||
              v.lang.toLowerCase().startsWith(langPrefix)
            );

            // Prioritize male voices by standard naming across Windows, macOS, Android, ChromeOS
            const maleVoice =
              langVoices.find((v) =>
                /\b(ichiro|keita|kenji|naoki|takumi|guy|david|george|mark|male|man|yunxi|yunjian|kangkang)\b/i.test(v.name)
              ) ||
              langVoices.find((v) => !/\b(haruka|ayumi|sayaka|zira|susan|jenny|female|woman|xiaoxiao|yaoyao)\b/i.test(v.name)) ||
              langVoices[0] ||
              voices.find((v) => v.default);

            if (maleVoice) {
              utterance.voice = maleVoice;
            }
          }

          utterance.onend = finish;
          utterance.onerror = (e) => {
            console.warn('[speakWithBrowserSynth] Utterance finished or canceled:', e?.error);
            finish();
          };

          // Generous watchdog based on realistic speaking duration (~300ms per character).
          // NEVER abort early at 10s while the speaker is talking!
          const maxMs = Math.max(35000, text.length * 300);
          watchdog = setTimeout(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis && !window.speechSynthesis.speaking) {
              finish();
            }
          }, maxMs);

          // Keep-alive timer for Chrome speech synthesis (strictly while active and NOT interrupted)
          keepAlive = setInterval(() => {
            if (finished || interruptedRef.current) {
              if (keepAlive) clearInterval(keepAlive);
            } else if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
              window.speechSynthesis.resume();
            }
          }, 500);

          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('[speakWithBrowserSynth] Execution failed:', e);
          finish();
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0 && 'onvoiceschanged' in window.speechSynthesis) {
        let invoked = false;
        window.speechSynthesis.onvoiceschanged = () => {
          if (!invoked) {
            invoked = true;
            performSpeak();
          }
        };
        setTimeout(() => {
          if (!invoked) {
            invoked = true;
            performSpeak();
          }
        }, 150);
      } else {
        performSpeak();
      }
    });
  }, []);

  // Text-To-Speech pipeline
  const speakText = useCallback(async (text: string, lang?: string) => {
    if (!text || text.trim() === '') return;

    // Concurrency guard: instantly halt any active playback so multiple voices NEVER overlap
    abortSpeaking();

    const speechToken = ++activeSpeechTokenRef.current;

    // ── Echo Prevention & Busy Guard: Hard-mute mic recognition for the full TTS duration ──
    // Cancel any pending post-speech guard so the new speech session starts clean
    if (postSpeechGuardTimerRef.current) {
      clearTimeout(postSpeechGuardTimerRef.current);
      postSpeechGuardTimerRef.current = null;
    }
    isSpeakingRef.current = true;

    // Hardware microphone mute: physically zero-out mic tracks to prevent any sound capture
    muteMicrophoneHardware();

    // Hard-stop speech recognition while AI is answering so mic ignores all user input & speaker sound
    stopSpeechRecognition();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (energySilenceTimerRef.current) {
      clearTimeout(energySilenceTimerRef.current);
      energySilenceTimerRef.current = null;
    }

    setStatus('speaking');
    setResponseText(text);
    interruptedRef.current = false;

    // Fast-forward recognition index and clear transcripts so previous prompts never bleed into this or future turns
    setTranscript('');
    localTranscriptRef.current = '';
    resultStartIndexRef.current = recognitionResultCountRef.current;

    const currentLang = lang || useStore.getState().language;

    try {
      // Always request authoritative, warm male mountain guide voice ('onyx')
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: currentLang, voice: 'onyx' }),
      });

      // Token check: if user interrupted or another speakText was called during network request
      if (speechToken !== activeSpeechTokenRef.current || interruptedRef.current || statusRef.current !== 'speaking') {
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('audio')) {
        const blob = await res.blob();
        if (speechToken !== activeSpeechTokenRef.current || interruptedRef.current || statusRef.current !== 'speaking') {
          return;
        }

        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        (audio as any).playsInline = true;
        audio.setAttribute('playsinline', 'true');
        currentAudioRef.current = audio;

        await new Promise<void>((resolve) => {
          let resolved = false;
          let watchdog: NodeJS.Timeout | null = null;
          const finish = () => {
            if (!resolved) {
              resolved = true;
              if (watchdog) clearTimeout(watchdog);
              URL.revokeObjectURL(audioUrl);
              audio.onended = null;
              audio.onerror = null;
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
              }
              abortSpeakingRef.current = null;
              resolve();
            }
          };

          abortSpeakingRef.current = finish;

          audio.onended = finish;
          audio.onerror = async () => {
            try {
              audio.pause();
              audio.removeAttribute('src');
              audio.load();
            } catch {}
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
            if (speechToken === activeSpeechTokenRef.current && !interruptedRef.current && statusRef.current === 'speaking') {
              await speakWithBrowserSynth(text, currentLang);
            }
            finish();
          };

          // Generous playback watchdog (minimum 45 seconds or duration based)
          watchdog = setTimeout(() => {
            if (audio.ended || audio.paused) {
              finish();
            }
          }, Math.max(45000, text.length * 300));

          audio.play().catch(async () => {
            try {
              audio.pause();
              audio.removeAttribute('src');
              audio.load();
            } catch {}
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
            if (speechToken === activeSpeechTokenRef.current && !interruptedRef.current && statusRef.current === 'speaking') {
              await speakWithBrowserSynth(text, currentLang);
            }
            finish();
          });
        });
      } else {
        if (speechToken === activeSpeechTokenRef.current && !interruptedRef.current && statusRef.current === 'speaking') {
          await speakWithBrowserSynth(text, currentLang);
        }
      }
    } catch (e) {
      console.warn('OpenAI TTS call failed, falling back to browser speech:', e);
      if (speechToken === activeSpeechTokenRef.current && !interruptedRef.current && statusRef.current === 'speaking') {
        await speakWithBrowserSynth(text, currentLang);
      }
    } finally {
      // ONLY the active speech token is permitted to finalize speech state!
      if (speechToken === activeSpeechTokenRef.current) {
        abortSpeakingRef.current = null;
        setResponseText('');

        setStatus('idle');
        setTranscript('');
        localTranscriptRef.current = '';
        stopSpeechRecognition();

        // ── POST_SPEECH_GUARD: keep isSpeakingRef=true & mic muted for POST_SPEECH_GUARD_MS ──
        // Prevents the microphone from picking up speaker bleed (echo) after TTS ends.
        postSpeechGuardTimerRef.current = setTimeout(() => {
          // Double check audio is not actively playing before unmuting
          if (isAudioActivelyPlaying()) {
            console.log('[useVoiceConversation] Audio still actively playing at guard timeout — extending guard');
            postSpeechGuardTimerRef.current = setTimeout(() => {
              isSpeakingRef.current = false;
              postSpeechGuardTimerRef.current = null;
              unmuteMicrophoneHardware();
              resultStartIndexRef.current = recognitionResultCountRef.current;
              if (autoLoopRef.current && statusRef.current === 'idle') {
                startListeningRef.current?.().catch(() => {});
              }
            }, POST_SPEECH_GUARD_MS);
            return;
          }

          isSpeakingRef.current = false;
          postSpeechGuardTimerRef.current = null;
          unmuteMicrophoneHardware();
          // Reset recognition index so a fresh listening session starts completely clean
          resultStartIndexRef.current = recognitionResultCountRef.current;
          if (autoLoopRef.current && statusRef.current === 'idle') {
            startListeningRef.current?.().catch(() => {});
          }
        }, POST_SPEECH_GUARD_MS);
      }
    }
  }, [abortSpeaking, isAudioActivelyPlaying, muteMicrophoneHardware, unmuteMicrophoneHardware, speakWithBrowserSynth, stopSpeechRecognition]);

  // Ensure MediaRecorder is active so user speech audio can be captured
  const ensureMediaRecorderActive = useCallback(async () => {
    if (isBusyResponding()) {
      return;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      return;
    }
    try {
      let stream = streamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      }

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopLevelMeter();
        if (isBusyResponding()) {
          audioChunksRef.current = [];
          pendingCommittedTextRef.current = '';
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const text = pendingCommittedTextRef.current || localTranscriptRef.current.trim();
        pendingCommittedTextRef.current = '';
        setTimeout(() => {
          processRecordedAudioRef.current?.(audioBlob, text);
        }, 80);
      };

      mediaRecorderRef.current = mediaRecorder;
      startLevelMeter(stream);
      mediaRecorder.start(250);
    } catch (e) {
      console.warn('ensureMediaRecorderActive error:', e);
    }
  }, [isBusyResponding]);

  // Process user audio through STT -> LLM -> TTS pipeline
  const processRecordedAudio = async (audioBlob?: Blob | null, directText?: string) => {
    // ── STRICT REQUIREMENT: Ignore user questions while AI is currently thinking, answering, in echo-guard, or playing audio ──
    if (isBusyResponding()) {
      console.log('[VoiceAI] processRecordedAudio ignored — AI is currently busy responding');
      localTranscriptRef.current = '';
      setTranscript('');
      return;
    }

    const currentLang = useStore.getState().language;

    // Determine recognized text: prefer directText, then localTranscriptRef, then Whisper
    let recognizedText = directText?.trim() || localTranscriptRef.current?.trim() || '';

    // Mark current Web Speech Recognition results as consumed so the NEXT turn starts completely clean!
    resultStartIndexRef.current = recognitionResultCountRef.current;
    localTranscriptRef.current = '';

    if (!recognizedText && audioBlob && audioBlob.size > 1000) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'speech.webm');
        formData.append('language', currentLang);

        const sttRes = await fetch('/api/voice/stt', {
          method: 'POST',
          body: formData,
        });

        if (sttRes.ok) {
          const data = (await sttRes.json()) as { text?: string };
          recognizedText = data.text?.trim() || '';
        }
      } catch (e) {
        console.warn('Whisper STT fallback failed:', e);
      }
    }

    if (!recognizedText) {
      // Did not catch speech — silently resume listening
      setStatus('idle');
      setTranscript('');
      if (autoLoopRef.current) {
        setTimeout(() => {
          if (autoLoopRef.current && statusRef.current === 'idle') {
            startListeningRef.current?.().catch(() => {});
          }
        }, 300);
      }
      return;
    }

    // Language safety heuristic: if user chose English or spoke English text, enforce English
    const hasEnglishWords = /[a-zA-Z]{2,}/.test(recognizedText);
    const activeLang = (currentLang === 'en' || (hasEnglishWords && currentLang !== 'zh')) ? 'en' : currentLang;
    if (activeLang === 'en' && currentLang !== 'en') {
      useStore.getState().setLanguage('en');
    }

    const currentGenId = ++generationIdRef.current;
    interruptedRef.current = false; // Always clear interruption state on new turn!
    setTranscript(recognizedText);
    setStatus('thinking');
    setErrorMessage(null);
    setIsGenerating(true);
    isSpeakingRef.current = true; // Mark busy immediately so NO microphone input is captured

    // Hardware microphone mute: physically disable audio tracks immediately upon entering thinking state
    muteMicrophoneHardware();
    stopSpeechRecognition();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];

    // Safety watchdog: auto-recover from 'thinking' after 10s to prevent infinite spinner
    const thinkingTimeout = setTimeout(() => {
      if (statusRef.current === 'thinking' && generationIdRef.current === currentGenId) {
        console.warn('[useVoiceConversation] Thinking timeout reached (10s), auto-recovering');
        setErrorMessage(
          activeLang === 'en' ? 'Response took too long. Please try again.' :
          activeLang === 'zh' ? '响应时间过长，请重试。' :
          '応答に時間がかかりすぎました。もう一度お試しください。'
        );
        setStatus('idle');
        setIsGenerating(false);
        if (autoLoopRef.current) {
          setTimeout(() => {
            if (autoLoopRef.current && statusRef.current === 'idle') {
              startListeningRef.current?.().catch(() => {});
            }
          }, 400);
        }
      }
    }, 10_000);

    try {
      // Step 1: Synchronize Real UI Actions Based on Voice Intent
      const q = recognizedText.toLowerCase();
      const matchedRoute = findRouteByVoiceQuery(recognizedText);
      let targetRoute = selectedRoute || ROUTES[0];

      if (matchedRoute) {
        targetRoute = matchedRoute;
        setSelectedRoute(matchedRoute);
        setSelectedDifficulty(matchedRoute.difficulty);
      } else if (q.includes('初心者') || q.includes('beginner') || q.includes('easy') || q.includes('初級') || q.includes('初学者') || q.includes('新手')) {
        const routeSettings = useAdminStore.getState().routeSettings;
        const trail1 =
          ROUTES.find((r) => r.id === 'route_1') ||
          ROUTES.find((r) => (routeSettings[r.id]?.stars ?? r.difficultyRating ?? 1) === 1) ||
          ROUTES[0];
        const targetDiff = routeSettings[trail1.id]?.difficulty ?? trail1.difficulty ?? 'beginner';
        setSelectedDifficulty(targetDiff);
        targetRoute = trail1;
        setSelectedRoute(trail1);
      } else if (q.includes('中級') || q.includes('intermediate')) {
        setSelectedDifficulty('intermediate');
        const r4 = ROUTES.find((r) => r.id === 'route_4');
        if (r4) {
          targetRoute = r4;
          setSelectedRoute(r4);
        }
      } else if (q.includes('上級') || q.includes('advanced')) {
        setSelectedDifficulty('advanced');
        const rJ = ROUTES.find((r) => r.id === 'route_jinba') || ROUTES.find((r) => r.difficulty === 'advanced');
        if (rJ) {
          targetRoute = rJ;
          setSelectedRoute(rJ);
        }
      }

      if (q.includes('持ち物') || q.includes('チェックリスト') || q.includes('checklist') || q.includes('装備')) {
        setActiveModal('equipment');
      } else if (q.includes('ケーブルカー') || q.includes('cable') || q.includes('リフト') || q.includes('時刻表')) {
        setActiveModal('cablecar');
      } else if (q.includes('駐車場') || q.includes('parking') || q.includes('スタッフ') || q.includes('staff') || q.includes('店員')) {
        setActiveModal('staff');
      }

      // Step 2: Feed recognized text directly into LLM
      const activeWeather: WeatherData = weather || {
        weather: '快晴',
        weatherCode: 'sunny',
        temp_c: 20,
        rainProbability: 0,
        precipitationMmh: 0,
        windSpeed: 2.0,
        uvIndex: 5,
        visibility: 20,
        updatedAt: new Date().toISOString(),
      };

      const trailStatus = getTrailStatus(activeLang);
      const facilities = getFacilities(activeLang);
      const season = getCurrentSeason();

      const advice = await getAIAdvice(
        activeWeather,
        targetRoute,
        targetRoute.difficulty || 'beginner',
        trailStatus,
        facilities,
        recognizedText,
        activeLang
      );

      // If user interrupted while LLM was processing, discard obsolete answer and safely recover
      if (generationIdRef.current !== currentGenId || interruptedRef.current) {
        console.log('[useVoiceConversation] Stale response discarded due to barge-in');
        setStatus('idle');
        setIsGenerating(false);
        if (autoLoopRef.current) {
          setTimeout(() => {
            if (autoLoopRef.current && statusRef.current === 'idle') {
              startListeningRef.current?.().catch(() => {});
            }
          }, 300);
        }
        return;
      }

      const products = getRecommendedProducts(
        targetRoute.difficulty || 'beginner',
        activeWeather.weatherCode,
        season,
        advice.recommended_gear,
        6,
        targetRoute.category,
        activeLang
      );
      setRecommendedProducts(products);

      // Add user voice input as chat message with language-tailored quotation marks
      const quoteFormatted =
        activeLang === 'en'
          ? `"${recognizedText}"`
          : activeLang === 'zh'
          ? `“${recognizedText}”`
          : `「${recognizedText}」`;
      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        text: `🎤 ${quoteFormatted}`,
        timestamp: new Date(),
      });

      // Add AI reply message
      addMessage({
        id: crypto.randomUUID(),
        role: 'ai',
        text: advice.advice_text,
        advice,
        products,
        timestamp: new Date(),
      });

      // Step 3: Speak AI advice
      await speakText(advice.advice_text, activeLang);
    } catch (err) {
      console.error('Voice conversation error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : activeLang === 'en'
          ? 'Voice processing failed'
          : activeLang === 'zh'
          ? '语音处理失败'
          : '音声処理に失敗しました'
      );
      setStatus('idle');
      if (autoLoopRef.current) {
        setTimeout(() => {
          if (autoLoopRef.current && statusRef.current === 'idle') {
            startListeningRef.current?.().catch(() => {});
          }
        }, 600);
      }
    } finally {
      clearTimeout(thinkingTimeout);
      setIsGenerating(false);
      // Fail-safe: guarantee UI never remains permanently stranded in 'thinking'
      if ((statusRef.current as string) === 'thinking') {
        setStatus('idle');
        isSpeakingRef.current = false;
        unmuteMicrophoneHardware();
        if (autoLoopRef.current) {
          setTimeout(() => {
            if (autoLoopRef.current && statusRef.current === 'idle') {
              startListeningRef.current?.().catch(() => {});
            }
          }, 300);
        }
      }
    }
  };

  // Keep processRecordedAudioRef always fresh
  processRecordedAudioRef.current = processRecordedAudio;

  // Safely commit user speech once silence is detected
  const commitCurrentSpeech = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (energySilenceTimerRef.current) {
      clearTimeout(energySilenceTimerRef.current);
      energySilenceTimerRef.current = null;
    }

    // ── STRICT REQUIREMENT: Ignore user questions while AI is currently thinking, answering, or in echo-guard ──
    if (isBusyResponding()) {
      console.log('[VoiceAI] commitCurrentSpeech ignored — AI is currently responding or in echo-guard');
      localTranscriptRef.current = '';
      setTranscript('');
      return;
    }

    // ── WARMUP GUARD: only defer commit if user said a single brief opening word like "hello" / "hi" ──
    const textToProcess = localTranscriptRef.current.trim();
    const isSingleShortGreeting = /^(hello|hi|hey|こんにちは|もしもし|你好)$/i.test(textToProcess);
    const msListening = Date.now() - listeningStartTimestampRef.current;
    if (isSingleShortGreeting && msListening < LISTENING_WARMUP_MS) {
      console.log(`[VoiceAI] Warmup active on greeting (${Math.round(msListening)}ms / ${LISTENING_WARMUP_MS}ms) — deferring commit`);
      // Re-arm silence timer with the remaining warmup time so we revisit when warmup is done
      const remaining = LISTENING_WARMUP_MS - msListening;
      silenceTimerRef.current = setTimeout(() => {
        commitCurrentSpeech();
      }, remaining + 150);
      return;
    }

    // Fast-path: Web Speech API provided transcribed text
    if (textToProcess) {
      hasSpokenEnergyRef.current = false;
      pendingCommittedTextRef.current = textToProcess;
      resultStartIndexRef.current = recognitionResultCountRef.current;
      localTranscriptRef.current = '';

      // Immediately process recognized text with sub-second latency
      processRecordedAudioRef.current?.(null, textToProcess);

      // Stop mediaRecorder cleanly in background
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.onstop = null;
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        } catch {}
      }
      return;
    }

    // Hybrid Energy VAD Fallback:
    // Web Speech API was silent/unsupported, but user spoke (sound energy detected)!
    if (hasSpokenEnergyRef.current) {
      hasSpokenEnergyRef.current = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          // Stopping media recorder fires onstop to dispatch audio blob to Whisper STT (/api/voice/stt)
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        } catch {
          setStatus('idle');
        }
      }
    }
  }, [isBusyResponding]);

  const startListening = useCallback(async () => {
    // ── STRICT REQUIREMENT: Do not start listening if thinking, answering, or in echo-guard ──
    if (isBusyResponding()) {
      console.log('[VoiceAI] startListening deferred — AI is currently responding or in echo-guard');
      return;
    }
    if (statusRef.current === 'listening' && mediaRecorderRef.current?.state === 'recording') return;

    unlockAudio();
    unmuteMicrophoneHardware();
    setErrorMessage(null);
    setTranscript('');
    localTranscriptRef.current = '';
    interruptedRef.current = false;

    // Record start timestamp for the warmup guard
    listeningStartTimestampRef.current = Date.now();

    // Fast-forward starting result index so any previous turn results in event.results are ignored!
    resultStartIndexRef.current = recognitionResultCountRef.current;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const currentLang = useStore.getState().language;

    // Initialize real-time Web Speech Recognition for instant feedback
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const targetLang = getTargetRecognitionLang(currentLang);
        // If an existing recognition instance is using a different language, tear it down
        if (recognitionRef.current && recognitionRef.current.lang !== targetLang) {
          stopSpeechRecognition();
        }

        if (!recognitionRef.current) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = targetLang;

            recognition.onresult = (event: any) => {
              recognitionResultCountRef.current = event.results.length;

              // Only reset start index if recognition was restarted from scratch by browser
              // (strictly fewer results than previous start index, NEVER <=)
              if (event.results.length < resultStartIndexRef.current) {
                resultStartIndexRef.current = 0;
              }

              // ── STRICT REQUIREMENT: Ignore user questions while AI is answering, thinking, or in echo guard ──
              if (isBusyResponding()) {
                resultStartIndexRef.current = event.results.length;
                localTranscriptRef.current = '';
                setTranscript('');
                return;
              }

              let fullText = '';
              let isFinalChunk = false;
              const liveLang = useStore.getState().language;

              const startIndex = Math.max(0, Math.min(resultStartIndexRef.current, event.results.length - 1));
              for (let i = startIndex; i < event.results.length; ++i) {
                const chunk = event.results[i][0]?.transcript || '';
                if (chunk) {
                  if (fullText && !fullText.endsWith(' ') && !chunk.startsWith(' ') && liveLang === 'en') {
                    fullText += ' ';
                  }
                  fullText += chunk;
                }
                if (event.results[i].isFinal) isFinalChunk = true;
              }
              const clean = fullText.trim();
              if (!clean) return;

              localTranscriptRef.current = clean;
              setTranscript(clean);

              // Raised silence thresholds: 600ms on final result, 1200ms on interim.
              // Gives users time to pause naturally within a single question.
              const commitDelay = isFinalChunk ? COMMIT_DELAY_FINAL_MS : COMMIT_DELAY_INTERIM_MS;
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                commitCurrentSpeech();
              }, commitDelay);
            };

            recognition.onerror = (e: any) => {
              if (e.error === 'no-speech' || e.error === 'aborted') return;
              console.warn('[useVoiceConversation] Speech recognition error:', e.error);
            };

            // Continuous recognition lifecycle: only restart if this instance is still active
            recognition.onend = () => {
              if (
                autoLoopRef.current &&
                statusRef.current === 'listening' &&
                !isSpeakingRef.current &&
                !isAudioActivelyPlaying() &&
                recognitionRef.current === recognition
              ) {
                try {
                  recognition.start();
                } catch {
                  setTimeout(() => {
                    if (
                      autoLoopRef.current &&
                      statusRef.current === 'listening' &&
                      !isSpeakingRef.current &&
                      !isAudioActivelyPlaying() &&
                      recognitionRef.current === recognition
                    ) {
                      try { recognition.start(); } catch {}
                    }
                  }, 150);
                }
              }
            };

            recognition.start();
            recognitionRef.current = recognition;
          } catch (e) {
            console.warn('Web Speech Recognition init:', e);
          }
        }
      }
    }

    try {
      let stream = streamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      }

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopLevelMeter();
        if (isBusyResponding()) {
          audioChunksRef.current = [];
          pendingCommittedTextRef.current = '';
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const text = pendingCommittedTextRef.current || localTranscriptRef.current.trim();
        pendingCommittedTextRef.current = '';
        setTimeout(() => {
          processRecordedAudioRef.current?.(audioBlob, text);
        }, 80);
      };

      mediaRecorderRef.current = mediaRecorder;
      startLevelMeter(stream);
      mediaRecorder.start(250);
      setStatus('listening');
    } catch (err) {
      console.warn('Microphone access standby:', err);
      setStatus('idle');
    }
  }, [selectedRoute, weather, selectedDifficulty, stopSpeechRecognition, abortSpeaking, commitCurrentSpeech, ensureMediaRecorderActive, isBusyResponding, unmuteMicrophoneHardware, isAudioActivelyPlaying]);

  startListeningRef.current = startListening;

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    stopSpeechRecognition();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, [stopSpeechRecognition]);

  const cancelConversation = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    abortSpeaking();
    stopSpeechRecognition();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
    isSpeakingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    stopLevelMeter();
    setStatus('idle');
    setTranscript('');
    setResponseText('');
    localTranscriptRef.current = '';
    resultStartIndexRef.current = 0;
    recognitionResultCountRef.current = 0;
    interruptedRef.current = false;

    // Re-listen in hands-free mode
    if (autoLoopRef.current) {
      setTimeout(() => {
        if (autoLoopRef.current && statusRef.current === 'idle') {
          startListeningRef.current?.().catch(() => {});
        }
      }, 300);
    }
  }, [abortSpeaking, stopSpeechRecognition]);

  // ── Synchronize Speech Recognition Immediately on Language Switch ──
  useEffect(() => {
    // If the voice AI is actively thinking or speaking, DO NOT interrupt or reset to idle!
    // The current speech turn will complete in its own language, and next turn will use the new language.
    if (isBusyResponding()) {
      console.log(`[useVoiceConversation] Language changed to ${language} while AI is answering. Queuing recognition update for next turn.`);
      return;
    }

    const targetLang = getTargetRecognitionLang(language);
    console.log(`[useVoiceConversation] Synchronizing language to: ${language} (${targetLang})`);

    // Reset visual transcript and responses so old language text disappears immediately
    setTranscript('');
    localTranscriptRef.current = '';
    setResponseText('');
    setErrorMessage(null);
    resultStartIndexRef.current = 0;
    recognitionResultCountRef.current = 0;
    interruptedRef.current = false;

    // Stop active audio playback and speech synthesis from previous language immediately
    abortSpeaking();

    // Stop active mediaRecorder so it does not process with previous language
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }

    // Abort previous speech recognition so the new language acoustic model starts clean
    stopSpeechRecognition();

    // If hands-free is enabled and we are idle, restart listening immediately in new language
    if (autoLoopRef.current && statusRef.current === 'idle') {
      const timer = setTimeout(() => {
        if (autoLoopRef.current && statusRef.current === 'idle') {
          startListeningRef.current?.().catch(() => {});
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [language, stopSpeechRecognition, abortSpeaking, isBusyResponding]);

  // ── Auto-Start Continuous Hands-free Conversation on Mount or First Interaction ──
  useEffect(() => {
    if (!enabled) {
      cancelConversation();
      return;
    }
    autoLoopRef.current = true;
    let didInit = false;

    // 1. Attempt immediate start (succeeds if browser already granted mic permission)
    const initialTimer = setTimeout(() => {
      if (!didInit && statusRef.current === 'idle') {
        startListeningRef.current?.().catch(() => {});
      }
    }, 1000);

    // 2. Fallback: activate automatically on first user click or tap anywhere on the screen
    const handleFirstTouch = () => {
      if (didInit) return;
      didInit = true;
      autoLoopRef.current = true;
      setIsHandsFree(true);
      if (statusRef.current === 'idle') {
        startListeningRef.current?.().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleFirstTouch, { once: true });
    window.addEventListener('keydown', handleFirstTouch, { once: true });

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
  }, [enabled, cancelConversation]);

  return {
    status,
    transcript,
    responseText,
    audioLevel,
    errorMessage,
    isHandsFree,
    startListening,
    stopListening,
    cancelConversation,
    speakText,
  };
}

function findRouteByVoiceQuery(query: string) {
  const s = query.toLowerCase();
  if (/\b(?:trail|route|course|no\.?|number)\s*6\b|6号路|びわ|biwa|waterfall/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_6') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*2\b|2号路|霞台|kasumidai|2\.cas/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_2') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*3\b|3号路|かつら|katsura/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_3') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*4\b|4号路|吊り橋|suspension|miyama|tsuribashi/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_4') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*5\b|5号路|山頂ループ|summit loop/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_5') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*1\b|1号路|表参道|omotesando/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_1') || null;
  }
  if (/稲荷山|inariyama/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_inariyama') || null;
  }
  if (/城山|天狗|tengu|shiroyama/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_tengu') || null;
  }
  if (/権現|gongen/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_gongen') || null;
  }
  if (/三沢|misawa/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_misawa') || null;
  }
  if (/南高尾|minami/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_minamitakao') || null;
  }
  if (/小下沢|koge/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_kogezawa') || null;
  }
  if (/太鼓|taiko/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_taiko') || null;
  }
  if (/北高尾|kita/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_kitaapproach') || null;
  }
  if (/明王|相模湖|meio|sagami/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_meio') || null;
  }
  if (/景信|kagenobu/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_kagenobu') || null;
  }
  if (/陣馬|jinba/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_jinba') || null;
  }
  if (/\b(?:mt|mount|mountain|mountiain|takao|takaosan)\b|高尾山|登山/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_1') || ROUTES[0];
  }
  return null;
}

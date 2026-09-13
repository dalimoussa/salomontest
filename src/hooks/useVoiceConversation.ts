'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getAIAdvice } from '@/api/llm';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';
import { getTrailStatus } from '@/data/trailStatus';
import { getFacilities } from '@/data/facilities';
import { ROUTES } from '@/data/routes';
import { unlockAudio, playPreloadedCalloutAudio } from '@/lib/audioUnlock';
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
  speakText: (text: string) => Promise<void>;
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
  const currentBufferStopRef = useRef<(() => void) | null>(null);
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
  const speakStartTimeRef = useRef<number>(0);
  const isCalloutSpeakingRef = useRef<boolean>(false);
  const userSpeakingStartRef = useRef<number>(0);
  const vadSilenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // 1. Abort any active promise resolver or watchdog
    if (abortSpeakingRef.current) {
      try {
        abortSpeakingRef.current();
      } catch {}
      abortSpeakingRef.current = null;
    }

    // 2. Safely stop preloaded Web Audio buffer playback
    if (currentBufferStopRef.current) {
      try {
        currentBufferStopRef.current();
      } catch {}
      currentBufferStopRef.current = null;
    }

    // 3. Safely stop and detach HTML5 Audio element
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

    // 4. Immediately halt Web Speech API SpeechSynthesis without Chrome audio buffer bleed
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

  // Audio level visualizer loop — boosted high-sensitivity sensor with leak protection & VAD
  const startLevelMeter = (stream: MediaStream) => {
    stopLevelMeter();

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

        // Voice Activity Detection (VAD) & Loud/Quiet Speaker Watchdog
        if (statusRef.current === 'listening') {
          if (normalized > 0.14) {
            // Voice energy detected (supports both soft whisper and loud speech)
            if (!userSpeakingStartRef.current) {
              userSpeakingStartRef.current = Date.now();
            }
            if (vadSilenceTimeoutRef.current) {
              clearTimeout(vadSilenceTimeoutRef.current);
              vadSilenceTimeoutRef.current = null;
            }
          } else if (normalized < 0.08 && userSpeakingStartRef.current > 0) {
            // Silence after speech began
            if (!vadSilenceTimeoutRef.current) {
              vadSilenceTimeoutRef.current = setTimeout(() => {
                const speechDuration = Date.now() - userSpeakingStartRef.current;
                userSpeakingStartRef.current = 0;
                vadSilenceTimeoutRef.current = null;

                if (speechDuration > 350 && statusRef.current === 'listening') {
                  commitCurrentSpeech();
                }
              }, 700);
            }
          }
        } else {
          userSpeakingStartRef.current = 0;
          if (vadSilenceTimeoutRef.current) {
            clearTimeout(vadSilenceTimeoutRef.current);
            vadSilenceTimeoutRef.current = null;
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
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (vadSilenceTimeoutRef.current) {
      clearTimeout(vadSilenceTimeoutRef.current);
      vadSilenceTimeoutRef.current = null;
    }
    userSpeakingStartRef.current = 0;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {}
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
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = targetLang;
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          currentUtteranceRef.current = utterance;

          // Select best matching voice for the target language
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const langPrefix = activeLang === 'en' ? 'en' : activeLang === 'zh' ? 'zh' : 'ja';
            const matchedVoice =
              voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
              voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)) ||
              voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
              voices.find((v) => v.default);
            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }
          }

          utterance.onend = finish;
          utterance.onerror = (e) => {
            console.warn('[speakWithBrowserSynth] Utterance finished or canceled:', e?.error);
            finish();
          };

          // Chrome speech synthesis watchdog: ensures Promise always resolves
          const maxMs = Math.max(3000, Math.min(25000, text.length * 80 + 2000));
          watchdog = setTimeout(finish, maxMs);

          // Keep-alive timer for Chrome speech synthesis (strictly while active and NOT interrupted)
          keepAlive = setInterval(() => {
            if (finished || interruptedRef.current) {
              if (keepAlive) clearInterval(keepAlive);
            } else if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
              window.speechSynthesis.resume();
            }
          }, 500);

          const startUtterance = () => {
            if (finished || interruptedRef.current) {
              finish();
              return;
            }
            speakStartTimeRef.current = Date.now();
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            window.speechSynthesis.speak(utterance);
          };

          // If speech synthesis is actively speaking, clear with 40ms grace before starting
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            setTimeout(startUtterance, 40);
          } else {
            startUtterance();
          }
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
  const speakText = useCallback(async (text: string) => {
    if (!text || text.trim() === '') return;

    // Concurrency guard: instantly halt any active playback so multiple voices NEVER overlap
    abortSpeaking();

    setStatus('speaking');
    setResponseText(text);
    interruptedRef.current = false;

    // Fast-forward recognition index and clear transcripts so previous prompts never bleed into this or future turns
    setTranscript('');
    localTranscriptRef.current = '';
    resultStartIndexRef.current = recognitionResultCountRef.current;

    const currentLang = useStore.getState().language;
    const cleanText = text.trim();

    // Check if this speech is the attract callout announcement
    const isCallout =
      cleanText.includes('高尾山やおすすめルート') ||
      cleanText.includes('Mt. Takao') ||
      cleanText.includes('Mount Takao') ||
      cleanText.includes('关于高尾山');

    isCalloutSpeakingRef.current = isCallout;

    try {
      // For attract callouts, first attempt instant preloaded Web Audio buffer playback
      if (isCallout) {
        const preloaded = playPreloadedCalloutAudio(currentLang as 'ja' | 'en' | 'zh');
        if (preloaded) {
          currentBufferStopRef.current = preloaded.stop;
          speakStartTimeRef.current = Date.now();
          const played = await preloaded.promise;
          currentBufferStopRef.current = null;
          if (played && !interruptedRef.current) {
            return;
          }
        }
      }

      const calloutAudioPath = isCallout ? `/audio/callout_${currentLang}.mp3` : null;

      let audioBlobUrl: string | null = null;
      let shouldRevokeBlob = false;

      if (calloutAudioPath) {
        audioBlobUrl = calloutAudioPath;
      } else {
        const res = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: currentLang, voice: 'alloy' }),
        });

        if (interruptedRef.current || statusRef.current !== 'speaking') {
          return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('audio')) {
          const blob = await res.blob();
          if (interruptedRef.current || statusRef.current !== 'speaking') {
            return;
          }
          audioBlobUrl = URL.createObjectURL(blob);
          shouldRevokeBlob = true;
        }
      }

      if (audioBlobUrl) {
        const audio = new Audio(audioBlobUrl);
        audio.volume = 1.0;
        audio.preload = 'auto';
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
              if (shouldRevokeBlob && audioBlobUrl) {
                try { URL.revokeObjectURL(audioBlobUrl); } catch {}
              }
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
            if (!interruptedRef.current && statusRef.current === 'speaking') {
              try {
                await speakWithBrowserSynth(text, currentLang);
              } catch {}
            }
            finish();
          };

          // Audio playback safety watchdog (25s)
          watchdog = setTimeout(finish, 25000);

          // Mark start time at the exact moment audio playback begins!
          speakStartTimeRef.current = Date.now();

          audio.play().catch(async (playErr) => {
            console.warn('[useVoiceConversation] audio.play() rejected (autoplay or device restriction):', playErr?.message || playErr);
            try {
              audio.pause();
              audio.removeAttribute('src');
              audio.load();
            } catch {}
            if (!interruptedRef.current && statusRef.current === 'speaking') {
              try {
                await speakWithBrowserSynth(text, currentLang);
              } catch {}
            }
            finish();
          });
        });
      } else {
        if (!interruptedRef.current && statusRef.current === 'speaking') {
          await speakWithBrowserSynth(text, currentLang);
        }
      }
    } catch (e) {
      console.warn('TTS playback failed, falling back to browser speech:', e);
      if (!interruptedRef.current && statusRef.current === 'speaking') {
        await speakWithBrowserSynth(text, currentLang);
      }
    } finally {
      isCalloutSpeakingRef.current = false;
      abortSpeakingRef.current = null;
      setResponseText('');

      // If user interrupted AI during speech, do NOT revert status to idle
      // and do not trigger a delayed startListening that wipes out the new in-progress prompt!
      if (interruptedRef.current) {
        // User interrupted AI during speech: leave in listening state for Prompt 2
      } else {
        setStatus('idle');
        setTranscript('');
        localTranscriptRef.current = '';
        // Clean up speech recognition session so the next turn starts completely fresh
        stopSpeechRecognition();

        if (autoLoopRef.current) {
          setTimeout(() => {
            if (autoLoopRef.current && statusRef.current === 'idle') {
              startListeningRef.current?.().catch(() => {});
            }
          }, 300);
        }
      }
    }
  }, [abortSpeaking, speakWithBrowserSynth, stopSpeechRecognition]);

  // Ensure MediaRecorder is active so user speech audio can be captured
  const ensureMediaRecorderActive = useCallback(async () => {
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
  }, []);

  // Process user audio through STT -> LLM -> TTS pipeline
  const processRecordedAudio = async (audioBlob?: Blob | null, directText?: string) => {
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

    const currentGenId = ++generationIdRef.current;
    interruptedRef.current = false; // Always clear interruption state on new turn!
    setTranscript(recognizedText);
    setStatus('thinking');
    setErrorMessage(null);
    setIsGenerating(true);

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
      } else if (q.includes('初心者') || q.includes('beginner') || q.includes('easy')) {
        setSelectedDifficulty('beginner');
        const r1 = ROUTES.find((r) => r.id === 'route_1');
        if (r1) {
          targetRoute = r1;
          setSelectedRoute(r1);
        }
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
      await speakText(advice.advice_text);
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
      if (statusRef.current === 'thinking') {
        setStatus('idle');
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

    // Never commit or launch redundant advice while already thinking or speaking
    if (statusRef.current === 'thinking' || statusRef.current === 'speaking') {
      return;
    }

    const textToProcess = localTranscriptRef.current.trim();
    if (!textToProcess) {
      // If Web Speech API has not returned text, check if MediaRecorder captured speech chunks
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording' && audioChunksRef.current.length > 0) {
        console.log('[useVoiceConversation] VAD end-of-speech: Web Speech empty, committing MediaRecorder audio to Whisper STT');
        try {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        } catch {}
      }
      return;
    }

    // Snapshot committed text and immediately mark recognition index as consumed
    pendingCommittedTextRef.current = textToProcess;
    resultStartIndexRef.current = recognitionResultCountRef.current;
    localTranscriptRef.current = '';

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      } catch {
        pendingCommittedTextRef.current = '';
        processRecordedAudioRef.current?.(null, textToProcess);
      }
    } else {
      pendingCommittedTextRef.current = '';
      processRecordedAudioRef.current?.(null, textToProcess);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (statusRef.current === 'thinking') return;
    if (statusRef.current === 'listening' && mediaRecorderRef.current?.state === 'recording') return;

    unlockAudio();
    setErrorMessage(null);
    setTranscript('');
    localTranscriptRef.current = '';
    interruptedRef.current = false;

    // Fast-forward starting result index so any previous turn results in event.results are ignored!
    resultStartIndexRef.current = recognitionResultCountRef.current;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const currentLang = useStore.getState().language;

    // Initialize real-time Web Speech Recognition for instant feedback & barge-in interruption
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

              // If currently thinking, do not allow intermediate speech chunks to abort or restart processing
              if (statusRef.current === 'thinking') {
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

              // ── BARGE-IN INTERRUPTION WITH ACOUSTIC ECHO PROTECTION ──
              // While the AI is speaking (whether attract callout or answering advice):
              // NEVER allow the AI's own voice through the speakers to interrupt itself!
              if (statusRef.current === 'speaking') {
                // Attract callout speech is never interrupted via microphone
                if (isCalloutSpeakingRef.current) {
                  return;
                }

                // Grace period: ignore initial 1.5s after audio starts to allow audio levels to stabilize
                const speakElapsed = Date.now() - (speakStartTimeRef.current || 0);
                if (speakElapsed < 1500) {
                  return;
                }

                // Only allow barge-in if user explicitly speaks a clear interrupt command
                const lowerClean = clean.toLowerCase();
                const isExplicitInterrupt =
                  lowerClean.includes('ストップ') ||
                  lowerClean.includes('stop') ||
                  lowerClean.includes('キャンセル') ||
                  lowerClean.includes('cancel') ||
                  lowerClean.includes('待って') ||
                  lowerClean.includes('wait') ||
                  lowerClean.includes('ちょっと待って') ||
                  lowerClean.includes('停止') ||
                  lowerClean.includes('等一下') ||
                  lowerClean.includes('やめて');

                if (!isExplicitInterrupt) {
                  // Any other audio heard while speaking is acoustic feedback from speakers or room echo.
                  // Discard it completely so the AI NEVER interrupts itself mid-speech!
                  return;
                }

                console.log('[useVoiceConversation] User explicitly interrupted AI with stop command:', clean);
                interruptedRef.current = true;
                abortSpeaking();
                setResponseText('');
                setStatus('listening');
                ensureMediaRecorderActive();

                resultStartIndexRef.current = Math.max(0, event.results.length - 1);
                localTranscriptRef.current = '';
                setTranscript('');
                return;
              }

              localTranscriptRef.current = clean;
              setTranscript(clean);

              // Fast commit: 600ms on final recognized chunk, 850ms on interim silence
              const commitDelay = isFinalChunk ? 600 : 850;
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                commitCurrentSpeech();
              }, commitDelay);
            };

            recognition.onerror = (e: any) => {
              if (e.error === 'aborted') return;
              if (e.error === 'no-speech') {
                // When Chrome emits no-speech, gently stop recognition so onend restarts a fresh connection
                if (autoLoopRef.current && statusRef.current === 'listening') {
                  try { recognition.stop(); } catch {}
                }
                return;
              }
              console.warn('[useVoiceConversation] Speech recognition error:', e.error);
            };

            // Continuous recognition lifecycle: only restart if this instance is still active
            recognition.onend = () => {
              if (autoLoopRef.current && statusRef.current === 'listening' && recognitionRef.current === recognition) {
                try {
                  recognition.start();
                } catch {
                  setTimeout(() => {
                    if (autoLoopRef.current && statusRef.current === 'listening' && recognitionRef.current === recognition) {
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
  }, [selectedRoute, weather, selectedDifficulty, stopSpeechRecognition, abortSpeaking, commitCurrentSpeech, ensureMediaRecorderActive]);

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
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (vadSilenceTimeoutRef.current) {
      clearTimeout(vadSilenceTimeoutRef.current);
      vadSilenceTimeoutRef.current = null;
    }
    userSpeakingStartRef.current = 0;
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

    // If hands-free is enabled and we are not thinking, restart listening immediately in new language
    if (autoLoopRef.current && statusRef.current !== 'thinking') {
      setStatus('idle');
      const timer = setTimeout(() => {
        if (autoLoopRef.current && statusRef.current === 'idle') {
          startListeningRef.current?.().catch(() => {});
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [language, stopSpeechRecognition, abortSpeaking]);

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
      if (vadSilenceTimeoutRef.current) clearTimeout(vadSilenceTimeoutRef.current);
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
  return null;
}

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
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
  speakText: (text: string) => Promise<void>;
}

export function useVoiceConversation(options?: { enabled?: boolean }): UseVoiceConversationReturn {
  const enabled = options?.enabled ?? true;
  const [status, setStatusState] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHandsFree, setIsHandsFree] = useState(true);

  const statusRef = useRef<VoiceStatus>('idle');
  const setStatus = (next: VoiceStatus) => {
    statusRef.current = next;
    setStatusState(next);
  };

  const autoLoopRef = useRef<boolean>(true);
  const startListeningRef = useRef<() => Promise<void>>();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const localTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Audio level visualizer loop
  const startLevelMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(data);
        const sum = data.reduce((acc, val) => acc + val, 0);
        const avg = sum / data.length;
        setAudioLevel(Math.min(1, avg / 100));
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
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Fallback to Web Speech API speechSynthesis if OpenAI TTS unavailable
  const speakWithBrowserSynth = useCallback((text: string, lang: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      unlockAudio();

      const targetLang = lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP';

      const performSpeak = () => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = targetLang;
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Select best matching voice for the target language
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const langPrefix = lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'ja';
            const matchedVoice =
              voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
              voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)) ||
              voices.find((v) => v.default);
            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }
          }

          let finished = false;
          const finish = () => {
            if (!finished) {
              finished = true;
              clearTimeout(watchdog);
              clearInterval(keepAlive);
              resolve();
            }
          };

          utterance.onend = finish;
          utterance.onerror = () => {
            finish();
          };

          // Chrome speech synthesis watchdog: ensures Promise always resolves even if Chrome drops onend
          const maxMs = Math.max(3000, Math.min(25000, text.length * 80 + 2000));
          const watchdog = setTimeout(finish, maxMs);

          // Keep-alive timer for Chrome speech synthesis
          const keepAlive = setInterval(() => {
            if (finished) {
              clearInterval(keepAlive);
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
          resolve();
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
    setStatus('speaking');
    setResponseText(text);

    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice: 'alloy' }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('audio')) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        (audio as any).playsInline = true;
        audio.setAttribute('playsinline', 'true');
        currentAudioRef.current = audio;

        await new Promise<void>((resolve) => {
          let resolved = false;
          const finish = () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(watchdog);
              URL.revokeObjectURL(audioUrl);
              currentAudioRef.current = null;
              resolve();
            }
          };

          audio.onended = finish;
          audio.onerror = async () => {
            finish();
            await speakWithBrowserSynth(text, language);
          };

          // Audio playback safety watchdog
          const watchdog = setTimeout(finish, 20000);

          audio.play().catch(async () => {
            finish();
            await speakWithBrowserSynth(text, language);
          });
        });
      } else {
        await speakWithBrowserSynth(text, language);
      }
    } catch (e) {
      console.warn('OpenAI TTS call failed, falling back to browser speech:', e);
      await speakWithBrowserSynth(text, language);
    } finally {
      // ── Always close response card and re-listen ──
      setResponseText('');
      setStatus('idle');

      if (autoLoopRef.current) {
        setTimeout(() => {
          if (autoLoopRef.current && statusRef.current === 'idle') {
            startListeningRef.current?.().catch(() => {});
          }
        }, 300);
      }
    }
  }, [language, speakWithBrowserSynth]);

  // Process user audio through STT -> LLM -> TTS pipeline
  const processRecordedAudio = async (audioBlob: Blob) => {
    setStatus('thinking');
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      // Step 1: Speech recognition (prioritize instant live transcript, fallback to Whisper)
      let recognizedText = localTranscriptRef.current?.trim() || '';

      if (!recognizedText && audioBlob.size > 1000) {
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'speech.webm');
          formData.append('language', language);

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
        if (autoLoopRef.current) {
          setTimeout(() => {
            if (autoLoopRef.current && statusRef.current === 'idle') {
              startListeningRef.current?.().catch(() => {});
            }
          }, 300);
        }
        return;
      }

      setTranscript(recognizedText);

      // ── Synchronize Real UI Actions Based on Voice Intent ──
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

      const trailStatus = getTrailStatus(language);
      const facilities = getFacilities(language);
      const season = getCurrentSeason();

      const advice = await getAIAdvice(
        activeWeather,
        targetRoute,
        targetRoute.difficulty || 'beginner',
        trailStatus,
        facilities,
        recognizedText,
        language
      );

      const products = getRecommendedProducts(
        targetRoute.difficulty || 'beginner',
        activeWeather.weatherCode,
        season,
        advice.recommended_gear,
        6,
        targetRoute.category,
        language
      );
      setRecommendedProducts(products);

      // Add user voice input as chat message
      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        text: `🎤「${recognizedText}」`,
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
      setErrorMessage(err instanceof Error ? err.message : '音声処理に失敗しました');
      setStatus('idle');
      if (autoLoopRef.current) {
        setTimeout(() => {
          if (autoLoopRef.current && statusRef.current === 'idle') {
            startListeningRef.current?.().catch(() => {});
          }
        }, 600);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const startListening = useCallback(async () => {
    if (statusRef.current === 'thinking') return;
    if (statusRef.current === 'listening' && mediaRecorderRef.current?.state === 'recording') return;

    unlockAudio();
    setErrorMessage(null);
    setTranscript('');
    localTranscriptRef.current = '';

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Initialize real-time Web Speech Recognition for instant feedback & barge-in interruption
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && !recognitionRef.current) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'ja-JP';

          recognition.onresult = (event: any) => {
            let fullText = '';
            let isFinalChunk = false;
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript;
              if (event.results[i].isFinal) isFinalChunk = true;
            }
            const clean = fullText.trim();
            if (!clean) return;

            // ── BARGE-IN INTERRUPTION: If AI is speaking, user speech cuts it off immediately! ──
            if (statusRef.current === 'speaking') {
              console.log('[useVoiceConversation] User interrupted AI speech:', clean);
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
              }
              setResponseText('');
              setStatus('listening');
            }

            localTranscriptRef.current = clean;
            setTranscript(clean);

            // Fast commit: 600ms on final recognized chunk, 800ms on interim silence
            const commitDelay = isFinalChunk ? 600 : 800;
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
              }
            }, commitDelay);
          };

          recognition.onerror = (e: any) => {
            if (e.error === 'no-speech' || e.error === 'aborted') return;
            console.warn('[useVoiceConversation] Speech recognition error:', e.error);
          };

          // Continuous recognition lifecycle: never let recognition die after silence
          recognition.onend = () => {
            if (autoLoopRef.current && statusRef.current !== 'thinking') {
              try {
                recognition.start();
              } catch {
                setTimeout(() => {
                  if (autoLoopRef.current && statusRef.current !== 'thinking') {
                    try { recognition.start(); } catch {}
                  }
                }, 100);
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
        setTimeout(() => {
          processRecordedAudio(audioBlob);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, selectedRoute, weather, selectedDifficulty]);

  startListeningRef.current = startListening;

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  const cancelConversation = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopLevelMeter();
    setStatus('idle');
    setTranscript('');
    setResponseText('');
    localTranscriptRef.current = '';

    // Re-listen in hands-free mode
    if (autoLoopRef.current) {
      setTimeout(() => {
        if (autoLoopRef.current && statusRef.current === 'idle') {
          startListeningRef.current?.().catch(() => {});
        }
      }, 300);
    }
  }, []);

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
  return null;
}

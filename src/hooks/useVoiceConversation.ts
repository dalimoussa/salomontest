'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { getAIAdvice } from '@/api/llm';
import { getRecommendedProducts } from '@/data/products';
import { getCurrentSeason } from '@/lib/season';
import { getTrailStatus } from '@/data/trailStatus';
import { getFacilities } from '@/data/facilities';
import { ROUTES } from '@/data/routes';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface UseVoiceConversationReturn {
  status: VoiceStatus;
  transcript: string;
  responseText: string;
  audioLevel: number;
  errorMessage: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelConversation: () => void;
  speakText: (text: string) => Promise<void>;
}

export function useVoiceConversation(): UseVoiceConversationReturn {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const localTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(1, avg / 100));
        animFrameRef.current = requestAnimationFrame(checkLevel);
      };
      checkLevel();
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
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

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        await new Promise<void>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudioRef.current = null;
            resolve();
          };
          audio.onerror = async () => {
            URL.revokeObjectURL(audioUrl);
            currentAudioRef.current = null;
            await speakWithBrowserSynth(text, language);
            resolve();
          };
          audio.play().catch(async () => {
            await speakWithBrowserSynth(text, language);
            resolve();
          });
        });
      } else {
        await speakWithBrowserSynth(text, language);
      }
    } catch (e) {
      console.warn('OpenAI TTS call failed, falling back to browser speech:', e);
      await speakWithBrowserSynth(text, language);
    } finally {
      setStatus('idle');
    }
  }, [language, speakWithBrowserSynth]);

  // Process user audio through STT -> GPT-4o -> TTS pipeline
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
        const noHearText =
          language === 'en'
            ? 'I did not catch that. You can ask: "What route is best for beginners?" or "What shoes do you recommend?"'
            : language === 'zh'
            ? '没有听清您的声音。您可以试着问：“初学者推荐哪条路线？”或“推荐什么登山鞋？”'
            : '音声を認識できませんでした。「初心者におすすめのルートは？」や「おすすめの靴は？」とお話しください。';
        setTranscript('');
        await speakText(noHearText);
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
      if (!weather) return;

      const trailStatus = getTrailStatus(language);
      const facilities = getFacilities(language);
      const season = getCurrentSeason();

      const advice = await getAIAdvice(
        weather,
        targetRoute,
        targetRoute.difficulty || 'beginner',
        trailStatus,
        facilities,
        recognizedText,
        language
      );

      const products = getRecommendedProducts(
        targetRoute.difficulty || 'beginner',
        weather.weatherCode,
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
    } finally {
      setIsGenerating(false);
    }
  };

  const startListening = useCallback(async () => {
    if (status !== 'idle') return;
    setErrorMessage(null);
    setTranscript('');
    setResponseText('');
    localTranscriptRef.current = '';

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Initialize real-time Web Speech Recognition for instant feedback
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'ja-JP';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript;
            }
            const clean = fullText.trim();
            if (clean) {
              localTranscriptRef.current = clean;
              setTranscript(clean);

              // Auto-stop after 1.8 seconds of silence once speech is detected
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                  mediaRecorderRef.current = null;
                }
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch {}
                  recognitionRef.current = null;
                }
              }, 1800);
            }
          };

          recognition.onerror = () => {
            // Whisper fallback will handle audio if Web Speech fails
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Web Speech Recognition init:', e);
        }
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

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
        stream.getTracks().forEach((track) => track.stop());
        stopLevelMeter();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setTimeout(() => {
          processRecordedAudio(audioBlob);
        }, 250);
      };

      mediaRecorderRef.current = mediaRecorder;
      startLevelMeter(stream);
      mediaRecorder.start(250);
      setStatus('listening');
    } catch (err) {
      console.error('Microphone access failed:', err);
      setErrorMessage('マイクへのアクセスが許可されていません。ブラウザ設定を確認してください。');
      setStatus('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, language, selectedRoute, weather, selectedDifficulty]);

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
  }, []);

  return {
    status,
    transcript,
    responseText,
    audioLevel,
    errorMessage,
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

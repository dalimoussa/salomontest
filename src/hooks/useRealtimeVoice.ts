'use client';

/**
 * useRealtimeVoice — OpenAI Realtime API hook via WebRTC (browser-native).
 *
 * Architecture:
 *   Browser ──[POST]──▶ /api/voice/realtime-token ──▶ OpenAI REST (mints ephemeral key)
 *   Browser ──[WebRTC]──▶ openai.realtime-api.com (direct, using ephemeral key)
 *
 * Why WebRTC over WebSocket?
 *   - Vercel serverless functions cannot maintain long-lived WebSocket connections.
 *   - WebRTC is the officially recommended approach for browser clients.
 *   - Sub-200ms audio latency via DTLS/SRTP transport.
 *   - Native echo cancellation, noise suppression, and VAD (server-side).
 *
 * Fallback: If the ephemeral token fetch fails (no API key, network error),
 *           the hook returns `available: false` and the caller falls back to
 *           useVoiceConversation (the recording-based pipeline).
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { VoiceStatus } from './useVoiceConversation';
import { unlockAudio } from '@/lib/audioUnlock';

export interface UseRealtimeVoiceReturn {
  status: VoiceStatus;
  transcript: string;
  responseText: string;
  audioLevel: number;
  errorMessage: string | null;
  isHandsFree: boolean;
  available: boolean; // false if API key not configured
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  cancelConversation: () => void;
  speakText: (text: string) => Promise<void>; // no-op in realtime mode
}

export function useRealtimeVoice(): UseRealtimeVoiceReturn {
  const [status, setStatusState] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [available, setAvailable] = useState(true); // optimistic; set false on 503

  const statusRef = useRef<VoiceStatus>('idle');
  const setStatus = (next: VoiceStatus) => {
    statusRef.current = next;
    setStatusState(next);
  };

  const language = useStore((s) => s.language);
  const addMessage = useStore((s) => s.addMessage);

  // WebRTC refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sessionActiveRef = useRef(false);

  // ── Audio level meter ──
  const startLevelMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(1, avg / 80));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  };

  const stopLevelMeter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setAudioLevel(0);
  };

  // ── Tear down WebRTC session ──
  const teardown = useCallback(() => {
    sessionActiveRef.current = false;
    stopLevelMeter();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    dcRef.current?.close();
    dcRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    if (remoteAudioRef.current) {
      try {
        remoteAudioRef.current.pause();
        remoteAudioRef.current.srcObject = null;
        if (remoteAudioRef.current.parentNode) {
          remoteAudioRef.current.parentNode.removeChild(remoteAudioRef.current);
        }
      } catch {}
      remoteAudioRef.current = null;
    }

    setStatus('idle');
    setAudioLevel(0);
  }, []);

  // Proactive check on mount to discover if Realtime Token endpoint is available
  useEffect(() => {
    let mounted = true;
    fetch('/api/voice/realtime-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'ja' }),
    })
      .then((res) => {
        if (!res.ok && mounted) {
          setAvailable(false);
        }
      })
      .catch(() => {
        if (mounted) setAvailable(false);
      });

    return () => {
      mounted = false;
      teardown();
    };
  }, [teardown]);

  // ── Handle incoming DataChannel events from OpenAI ──
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data as string) as Record<string, unknown>;
      const type = msg.type as string;

      // User started speaking → show listening, cut off audio immediately, send cancel to OpenAI
      if (type === 'input_audio_buffer.speech_started') {
        setStatus('listening');
        if (remoteAudioRef.current) {
          try {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.currentTime = 0;
            remoteAudioRef.current.play().catch(() => {});
          } catch {}
        }
        if (dcRef.current && dcRef.current.readyState === 'open') {
          try {
            dcRef.current.send(JSON.stringify({ type: 'response.cancel' }));
          } catch {}
        }
        setTranscript('');
        setResponseText('');
      }

      // User stopped speaking → AI is now thinking/generating
      if (type === 'input_audio_buffer.speech_stopped') {
        setStatus('thinking');
      }

      // Live partial transcript of what user said
      if (type === 'conversation.item.input_audio_transcription.delta') {
        const delta = (msg as any).delta as string;
        setTranscript((prev) => prev + delta);
      }

      // Final transcript of what user said
      if (type === 'conversation.item.input_audio_transcription.completed') {
        const text = ((msg as any).transcript as string) || '';
        setTranscript(text);
        if (text.trim()) {
          addMessage({
            id: crypto.randomUUID(),
            role: 'system',
            text: `🎤「${text}」`,
            timestamp: new Date(),
          });
        }
      }

      // AI started producing audio → speaking
      if (type === 'response.audio.delta') {
        setStatus('speaking');
      }

      // Partial AI text transcript (for the display card)
      if (type === 'response.audio_transcript.delta') {
        const delta = (msg as any).delta as string;
        setResponseText((prev) => prev + delta);
      }

      // AI response fully done
      if (type === 'response.done') {
        const output = (msg as any)?.response?.output as any[];
        const aiText = output
          ?.flatMap((o: any) => o?.content ?? [])
          ?.find((c: any) => c?.type === 'text' || c?.type === 'transcript')
          ?.transcript || responseText;

        if (aiText?.trim()) {
          addMessage({
            id: crypto.randomUUID(),
            role: 'ai',
            text: aiText,
            timestamp: new Date(),
          });
        }
        // Auto-close floating card after 5 seconds so it doesn't linger forever
        setTimeout(() => {
          setResponseText('');
        }, 5000);
        // After AI finishes, go back to listening (VAD will auto-trigger)
        setStatus('listening');
      }

      // Server VAD interrupted (user spoke while AI was speaking)
      if (type === 'response.cancelled') {
        setStatus('listening');
        setResponseText('');
        if (remoteAudioRef.current) {
          try {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.currentTime = 0;
            remoteAudioRef.current.play().catch(() => {});
          } catch {}
        }
      }

      // Error from OpenAI
      if (type === 'error') {
        const errMsg = (msg as any)?.error?.message || 'Realtime API error';
        console.error('[useRealtimeVoice] OpenAI error event:', errMsg);
        setErrorMessage(errMsg);
      }
    } catch (e) {
      console.warn('[useRealtimeVoice] Failed to parse DC message:', e);
    }
  }, [addMessage, responseText]);

  // ── Start the WebRTC realtime session ──
  const startListening = useCallback(async (): Promise<boolean> => {
    if (sessionActiveRef.current) return true;
    if (!available) return false;

    // Ensure audio context and browser audio pipeline are unlocked on user gesture
    unlockAudio();

    setErrorMessage(null);
    setTranscript('');
    setResponseText('');

    try {
      // 1. Get ephemeral key from our server
      const tokenRes = await fetch('/api/voice/realtime-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });

      if (!tokenRes.ok) {
        console.warn(
          `[useRealtimeVoice] Realtime token endpoint returned ${tokenRes.status}. Gracefully falling back to standard voice pipeline.`
        );
        setAvailable(false);
        teardown();
        return false;
      }

      const { ephemeralKey } = (await tokenRes.json()) as { ephemeralKey: string };
      if (!ephemeralKey) {
        console.warn('[useRealtimeVoice] No ephemeralKey received. Falling back to standard voice pipeline.');
        setAvailable(false);
        teardown();
        return false;
      }

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3. Remote audio → attach to DOM with playsinline and play through speakers
      let remoteAudio = remoteAudioRef.current;
      if (!remoteAudio) {
        remoteAudio = document.createElement('audio');
        remoteAudio.id = 'salomon-realtime-remote-audio';
        remoteAudio.autoplay = true;
        (remoteAudio as any).playsInline = true;
        remoteAudio.setAttribute('playsinline', 'true');
        remoteAudio.style.position = 'fixed';
        remoteAudio.style.top = '-9999px';
        remoteAudio.style.left = '-9999px';
        document.body.appendChild(remoteAudio);
        remoteAudioRef.current = remoteAudio;
      }

      pc.ontrack = (e) => {
        if (remoteAudioRef.current && e.streams[0]) {
          remoteAudioRef.current.srcObject = e.streams[0];
          remoteAudioRef.current.play().catch((err) => {
            console.warn('[useRealtimeVoice] remoteAudio.play() error:', err);
          });
        }
      };

      // 4. Local microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });
      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      startLevelMeter(stream);

      // 5. DataChannel for events
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = handleDataChannelMessage;
      dc.onopen = () => {
        sessionActiveRef.current = true;
        setStatus('listening');
      };
      dc.onerror = (e) => {
        console.error('[useRealtimeVoice] DataChannel error:', e);
        setAvailable(false);
        teardown();
      };

      // 6. SDP Offer → OpenAI → SDP Answer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // GA endpoint is /v1/realtime/calls, with fallback to /v1/realtime
      let sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
        signal: AbortSignal.timeout(15_000),
      });

      if (!sdpRes.ok) {
        sdpRes = await fetch(
          `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ephemeralKey}`,
              'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
            signal: AbortSignal.timeout(15_000),
          }
        );
      }

      if (!sdpRes.ok) {
        console.warn(`[useRealtimeVoice] SDP exchange failed (${sdpRes.status}). Falling back to standard voice pipeline.`);
        setAvailable(false);
        teardown();
        return false;
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      // Connection established — the session is live
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn('[useRealtimeVoice] PeerConnection state:', pc.connectionState);
          teardown();
        }
      };

      return true;
    } catch (err) {
      console.warn('[useRealtimeVoice] Session start error, falling back to standard voice pipeline:', err);
      setAvailable(false);
      teardown();
      return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, available, teardown, handleDataChannelMessage]);

  const stopListening = useCallback(() => {
    teardown();
  }, [teardown]);

  const cancelConversation = useCallback(() => {
    setResponseText('');
    setTranscript('');
    if (dcRef.current?.readyState === 'open') {
      try {
        dcRef.current.send(JSON.stringify({ type: 'response.cancel' }));
      } catch {}
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
    }
    setStatus('listening');
  }, []);

  // Speak greeting or prompt on demand in realtime mode via DataChannel
  const speakText = useCallback(async (text: string) => {
    if (!text) return;
    if (sessionActiveRef.current && dcRef.current && dcRef.current.readyState === 'open') {
      try {
        dcRef.current.send(
          JSON.stringify({
            type: 'response.create',
            response: {
              modalities: ['audio', 'text'],
              instructions: `Greet the user warmly using these words: "${text}"`,
            },
          })
        );
      } catch (e) {
        console.warn('[useRealtimeVoice] Failed to trigger response.create:', e);
      }
    }
  }, []);

  // Dynamically update OpenAI instructions when user switches language in the UI
  useEffect(() => {
    if (sessionActiveRef.current && dcRef.current && dcRef.current.readyState === 'open') {
      const prompt =
        language === 'en'
          ? 'You are "Yamamori" (Mountain Guardian), the Salomon Mt. Takao Store AI Mountain Concierge. CRITICAL: The user has selected ENGLISH. You MUST ALWAYS speak and reply strictly in fluent, natural English. Do NOT speak Japanese or Chinese under any circumstances.'
          : language === 'zh'
          ? '你是“山守”，萨洛蒙高尾山专营店的AI山野向导。【最重要规则】顾客已切换为中文。你必须始终使用规范自然的简体中文进行回复，严禁使用日语或英语回答。'
          : 'あなたは「山守（やまもり）」、サロモン高尾店のAIマウンテンコンシェルジュです。【最重要指示】お客様は日本語を選択しています。必ず自然で丁寧な日本語のみで発話・返答してください。英語や中国語などの他言語は話さないでください。';

      try {
        dcRef.current.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              instructions: prompt,
            },
          })
        );
      } catch (e) {
        console.warn('[useRealtimeVoice] Failed to update session language on channel:', e);
      }
    }
  }, [language]);

  // Auto-start on mount (first interaction unlocks autoplay)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!sessionActiveRef.current && statusRef.current === 'idle' && available) {
        startListening().catch(() => {});
      }
    };

    // Try immediately (works if mic permission already granted)
    const timer = setTimeout(() => {
      if (!sessionActiveRef.current) {
        startListening().catch(() => {});
      }
    }, 1200);

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      teardown();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    transcript,
    responseText,
    audioLevel,
    errorMessage,
    isHandsFree: true,
    available,
    startListening,
    stopListening,
    cancelConversation,
    speakText,
  };
}

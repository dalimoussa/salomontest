'use client';

import { useRef } from 'react';
import { Mic, Loader2, Volume2, X } from 'lucide-react';
import type { VoiceStatus } from '@/hooks/useVoiceConversation';

interface VoiceHUDProps {
  status: VoiceStatus;
  transcript: string;
  responseText: string;
  audioLevel: number;
  errorMessage: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancel: () => void;
  language: 'ja' | 'en' | 'zh';
}

export function VoiceHUD({
  status,
  transcript,
  responseText,
  audioLevel,
  errorMessage,
  onStartListening,
  onStopListening,
  onCancel,
  language,
}: VoiceHUDProps) {
  const isListening = status === 'listening';
  const isThinking  = status === 'thinking';
  const isSpeaking  = status === 'speaking';
  const isActive    = status !== 'idle';

  const pressStartTimeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);

  const handlePointerDown = () => {
    if (isSpeaking) {
      onCancel();
      return;
    }
    if (isThinking) {
      return;
    }
    if (isListening) {
      // Tapping while listening stops and sends immediately
      onStopListening();
      return;
    }
    pressStartTimeRef.current = Date.now();
    isHoldingRef.current = true;
    onStartListening();
  };

  const handlePointerUp = () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    const holdDuration = Date.now() - pressStartTimeRef.current;
    if (holdDuration >= 450) {
      // Push-to-talk release: send immediately
      onStopListening();
    }
    // Quick click (<450ms): stays listening so user can speak comfortably without holding!
  };

  const idleLabel = language === 'en'
    ? 'Tap or Hold to Speak'
    : language === 'zh'
    ? '点击或按住说话'
    : 'タップ または 長押しで話す';

  const listeningLabel = language === 'en'
    ? 'Listening... Click Send or pause'
    : language === 'zh'
    ? '正在聆听... 点击发送或稍候'
    : '聞き取り中… 話すと自動送信';

  const thinkingLabel = language === 'en'
    ? 'AI Concierge is thinking...'
    : language === 'zh'
    ? 'AI向导正在生成建议...'
    : 'AI山守が考えています…';

  const speakingLabel = language === 'en'
    ? 'AI Guide is speaking'
    : language === 'zh'
    ? 'AI向导正在语音解答'
    : 'AI山守が音声で案内中';

  const userSpeakerLabel = language === 'en' ? 'You:' : language === 'zh' ? '您:' : 'あなた:';
  const aiSpeakerLabel = language === 'en' ? 'AI Guide:' : language === 'zh' ? 'AI山守:' : 'AI山守:';

  const mainBtnTitle = isListening
    ? (language === 'en' ? 'Listening...' : language === 'zh' ? '正在倾听...' : '聞き取り中…')
    : isThinking
    ? (language === 'en' ? 'Generating...' : language === 'zh' ? '正在生成...' : '回答を生成中…')
    : isSpeaking
    ? (language === 'en' ? 'Speaking...' : language === 'zh' ? '正在语音讲解...' : '案内中…')
    : (language === 'en' ? 'Speak with AI 🎤' : language === 'zh' ? '语音向导 🎤' : 'AIに話しかける 🎤');

  const mainBtnSub = isListening
    ? (language === 'en' ? 'Tap to send (or pause)' : language === 'zh' ? '点击发送（或停顿）' : 'タップで送信（または停頓）')
    : idleLabel;

  return (
    <div className="relative">
      {/* ── Active Conversation Floating HUD Banner ── */}
      {isActive && (
        <div className="absolute bottom-full mb-3 right-0 w-80 sm:w-96 p-4 rounded-2xl bg-[#081226]/95 border border-salomon-cyan/50 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 z-50 animate-fadeInUp">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isListening
                    ? 'bg-salomon-cyan animate-ping'
                    : isThinking
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-salomon-teal animate-pulse'
                }`}
              />
              <span className="text-xs font-bold text-white tracking-wide">
                {isListening ? listeningLabel : isThinking ? thinkingLabel : speakingLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isListening && (
                <button
                  onClick={onStopListening}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-salomon-cyan text-salomon-black hover:bg-white transition-colors"
                >
                  {language === 'en' ? 'Send ➔' : language === 'zh' ? '发送 ➔' : '送信 ➔'}
                </button>
              )}
              <button
                onClick={onCancel}
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-salomon-muted hover:text-white transition-colors"
                aria-label={language === 'en' ? 'Close' : '閉じる'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visualizer Waveform */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 h-8 px-3 bg-black/40 rounded-lg border border-white/5">
              {Array.from({ length: 24 }).map((_, i) => {
                const variance = Math.sin((i / 24) * Math.PI) * (audioLevel * 48);
                return (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-salomon-cyan to-salomon-teal rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, variance)}px` }}
                  />
                );
              })}
            </div>
          )}

          {/* User Transcript */}
          {transcript && (
            <div className="text-xs text-white/90 bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex items-start gap-2">
              <span className="text-salomon-cyan font-bold flex-shrink-0">{userSpeakerLabel}</span>
              <span className="font-medium">「{transcript}」</span>
            </div>
          )}

          {/* AI Response Text */}
          {isSpeaking && responseText && (
            <div className="text-xs text-salomon-cyan bg-salomon-cyan/10 rounded-lg px-3 py-2 border border-salomon-cyan/30 flex items-start gap-2 max-h-28 overflow-y-auto">
              <span className="text-white font-bold flex-shrink-0">{aiSpeakerLabel}</span>
              <span className="text-slate-200 leading-relaxed">{responseText}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className="absolute bottom-full mb-3 left-0 right-0 z-50 animate-fadeInUp">
          <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={onCancel} className="text-white/60 hover:text-white font-bold ml-2">
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── Push-to-Talk / Tap-to-Talk Main Button ── */}
      <button
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => {
          e.preventDefault();
          handlePointerDown();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handlePointerUp();
        }}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-200 group flex-shrink-0 min-h-[52px] select-none ${
          isListening
            ? 'bg-salomon-cyan text-salomon-black border-white shadow-glow-cyan scale-105 animate-pulse'
            : isThinking
            ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-glass'
            : isSpeaking
            ? 'bg-salomon-cyan/20 text-salomon-cyan border-salomon-cyan shadow-glow-cyan'
            : 'bg-salomon-cyan/15 hover:bg-salomon-cyan/25 border-salomon-cyan/40 hover:border-salomon-cyan shadow-glow-cyan/20 active:scale-95'
        }`}
        aria-label={
          language === 'en'
            ? 'Speak with AI Concierge'
            : language === 'zh'
            ? '与AI语音向导交谈'
            : 'AI音声コンシェルジュに話しかける'
        }
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            isListening
              ? 'bg-salomon-black text-salomon-cyan'
              : 'bg-gradient-to-br from-salomon-cyan/30 to-salomon-teal/20 border border-salomon-cyan/40'
          }`}
        >
          {isThinking ? (
            <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
          ) : isSpeaking ? (
            <Volume2 className="w-5 h-5 text-salomon-cyan animate-pulse" />
          ) : (
            <Mic
              className={`w-5 h-5 ${
                isListening ? 'text-salomon-cyan' : 'text-white group-hover:text-salomon-cyan'
              }`}
            />
          )}
        </div>

        <div className="text-left">
          <p
            className={`text-xs font-bold leading-tight ${
              isListening
                ? 'text-salomon-black font-black'
                : 'text-white group-hover:text-salomon-cyan'
            }`}
          >
            {mainBtnTitle}
          </p>
          <p
            className={`text-[10px] mt-0.5 font-medium ${
              isListening ? 'text-salomon-black/80' : 'text-salomon-muted'
            }`}
          >
            {mainBtnSub}
          </p>
        </div>
      </button>
    </div>
  );
}

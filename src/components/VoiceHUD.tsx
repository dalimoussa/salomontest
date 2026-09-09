'use client';

import { Mic, Loader2, Volume2, X, Sparkles } from 'lucide-react';
import type { VoiceStatus } from '@/hooks/useVoiceConversation';

interface VoiceHUDProps {
  status: VoiceStatus;
  transcript: string;
  responseText: string;
  audioLevel: number;
  errorMessage: string | null;
  isHandsFree?: boolean;
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
  onCancel,
  language,
}: VoiceHUDProps) {
  const isListening = status === 'listening';
  const isThinking  = status === 'thinking';
  const isSpeaking  = status === 'speaking';
  const isIdle      = status === 'idle';

  // Localized status labels
  const titleText = isListening
    ? (language === 'en' ? 'Real-time Listening' : language === 'zh' ? '实时收音中' : '常時音声受付中')
    : isThinking
    ? (language === 'en' ? 'AI is Planning Advice...' : language === 'zh' ? 'AI向导正在生成回答...' : 'AI山守が回答を考案中…')
    : isSpeaking
    ? (language === 'en' ? 'AI Guide Speaking' : language === 'zh' ? 'AI向导语音解答中' : 'AI山守が音声案内中')
    : (language === 'en' ? 'Hands-free Voice AI Standby' : language === 'zh' ? '全时语音对讲就绪' : 'リアルタイム音声対話');

  const subtitleText = isListening
    ? (transcript
        ? `「${transcript}」`
        : language === 'en'
        ? 'No button needed — Just speak naturally'
        : language === 'zh'
        ? '无需按键，请直接开口对话'
        : 'ボタン不要：そのまま自然にお話しください')
    : isThinking
    ? (language === 'en' ? 'Analyzing mountain & gear...' : language === 'zh' ? '正在匹配路线与装备...' : '天候・コース・最適装備を照会中...')
    : isSpeaking
    ? (language === 'en' ? 'Microphone resumes automatically after speaking' : language === 'zh' ? '播报结束后将自动继续收音' : '話し終わると自動でマイクが再開します')
    : (language === 'en' ? 'Tap anywhere to activate hands-free mode' : language === 'zh' ? '点击此处启动常时对讲' : 'タップで常時音声対話を開始');

  return (
    <div className="relative w-full md:w-auto">
      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className="absolute bottom-full mb-3 left-0 right-0 z-50 animate-fadeInUp">
          <div className="p-3 rounded-xl bg-red-950/95 border border-red-500/50 text-red-200 text-xs flex items-center justify-between shadow-2xl">
            <span>{errorMessage}</span>
            <button onClick={onCancel} className="text-white/60 hover:text-white font-bold ml-2">
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── Active Speech Response Floating Card ── */}
      {isSpeaking && responseText && (
        <div className="absolute bottom-full mb-3 right-0 w-80 sm:w-96 p-4 rounded-2xl bg-[#081226]/95 border border-salomon-cyan/60 shadow-2xl backdrop-blur-xl flex flex-col gap-2 z-50 animate-fadeInUp">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-salomon-teal animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-salomon-cyan" />
                {language === 'en' ? 'AI Voice Guide' : language === 'zh' ? 'AI山野向导' : 'AI山守'}
              </span>
            </div>
            <button
              onClick={onCancel}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-salomon-muted hover:text-white transition-colors"
              title={language === 'en' ? 'Stop Speaking' : '音声停止'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto pr-1">
            {responseText}
          </div>
          <p className="text-[10px] text-salomon-cyan/80 text-right pt-1 font-medium">
            {language === 'en' ? '● Resuming listening automatically...' : language === 'zh' ? '● 结束后自动继续收音...' : '● 終了後自動でそのまま会話を続けられます'}
          </p>
        </div>
      )}

      {/* ── Hands-free Ambient Real-time Voice HUD Bar (NO PUSH BUTTON) ── */}
      <div
        onClick={() => {
          if (isIdle) {
            onStartListening();
          }
        }}
        className={`flex items-center justify-between gap-3.5 px-4 py-2.5 rounded-2xl border transition-all duration-300 min-h-[54px] shadow-lg backdrop-blur-md ${
          isListening
            ? 'bg-gradient-to-r from-salomon-cyan/15 via-[#081b33]/90 to-salomon-teal/15 border-salomon-cyan/60 shadow-glow-cyan'
            : isThinking
            ? 'bg-gradient-to-r from-amber-500/15 via-[#1a1508]/90 to-amber-500/10 border-amber-400/60 shadow-glass'
            : isSpeaking
            ? 'bg-gradient-to-r from-salomon-teal/20 via-[#071926]/90 to-salomon-cyan/15 border-salomon-teal/60 shadow-glow-cyan'
            : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-salomon-cyan/40 cursor-pointer'
        }`}
      >
        {/* Left: Animated Status Aura */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Aura Rings */}
            {isListening && (
              <>
                <span className="absolute w-8 h-8 rounded-full bg-salomon-cyan/30 animate-ping" />
                <span className="absolute w-10 h-10 rounded-full border border-salomon-cyan/40 animate-pulse-slow" />
              </>
            )}
            {isThinking && (
              <span className="absolute w-8 h-8 rounded-full bg-amber-400/20 animate-spin" />
            )}

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-salomon-cyan text-salomon-black shadow-glow-cyan font-bold'
                  : isThinking
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                  : isSpeaking
                  ? 'bg-salomon-teal/20 text-salomon-cyan border border-salomon-teal/50'
                  : 'bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              {isThinking ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 animate-pulse text-salomon-cyan" />
              ) : isListening ? (
                <Mic className="w-5 h-5 text-salomon-black" />
              ) : (
                <Sparkles className="w-4 h-4 text-salomon-cyan" />
              )}
            </div>
          </div>

          {/* Center: Live Text & Ambient Guidance */}
          <div className="flex flex-col text-left min-w-0 max-w-[220px] sm:max-w-xs">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black tracking-wide ${
                  isListening
                    ? 'text-salomon-cyan'
                    : isThinking
                    ? 'text-amber-300'
                    : isSpeaking
                    ? 'text-salomon-teal'
                    : 'text-white/80'
                }`}
              >
                {titleText}
              </span>
              {isListening && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-salomon-cyan/20 border border-salomon-cyan/40 text-[9px] font-bold text-salomon-cyan animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-salomon-muted leading-tight mt-0.5 truncate font-medium">
              {subtitleText}
            </p>
          </div>
        </div>

        {/* Right: Audio Waveform Equalizer */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          {/* Dynamic Frequency Bars */}
          <div className="flex items-center gap-1 h-6 px-2 py-1 bg-black/40 rounded-lg border border-white/10">
            {Array.from({ length: 5 }).map((_, i) => {
              const active = isListening || isSpeaking;
              const h = active
                ? Math.max(4, Math.min(20, (audioLevel * 40) * (0.6 + (i % 3) * 0.4) + (isSpeaking ? 12 : 6)))
                : 4;
              return (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isListening
                      ? 'bg-salomon-cyan shadow-glow-cyan'
                      : isSpeaking
                      ? 'bg-salomon-teal'
                      : 'bg-white/20'
                  }`}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>

          {/* Stop / Cancel button (subtle) */}
          {(isListening || isSpeaking) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-salomon-muted hover:text-white transition-colors"
              title={language === 'en' ? 'Mute' : '一時停止'}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


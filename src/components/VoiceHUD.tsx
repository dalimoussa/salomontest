'use client';

import { Mic, Loader2, Volume2, X, Sparkles, User, Globe } from 'lucide-react';
import { useStore } from '@/store/useStore';
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
  isCalloutSpeaking?: boolean;
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
  isCalloutSpeaking = false,
}: VoiceHUDProps) {
  const isListening    = status === 'listening';
  const isThinking     = status === 'thinking';
  const isSpeaking     = status === 'speaking';
  const isIdle         = status === 'idle';

  // Localized quote styling helper: English uses "", Chinese uses “”, Japanese uses 「」
  const formatQuote = (text: string) => {
    if (!text) return '';
    if (language === 'en') return `"${text}"`;
    if (language === 'zh') return `“${text}”`;
    return `「${text}」`;
  };

  // Localized status labels
  const titleText = isCalloutSpeaking && isSpeaking
    ? (language === 'en' ? 'AI Attract Callout' : language === 'zh' ? 'AI自动呼出中' : 'AI自動呼びかけ中')
    : isListening
    ? (language === 'en' ? 'Listening... LIVE' : language === 'zh' ? '正在倾听... LIVE' : '聞いています… LIVE')
    : isThinking
    ? (language === 'en' ? 'AI Thinking...' : language === 'zh' ? 'AI思考中...' : 'AI山守が考え中…')
    : isSpeaking
    ? (language === 'en' ? 'AI Speaking' : language === 'zh' ? 'AI回答中' : 'AI音声案内中')
    : (language === 'en' ? 'Voice AI • Tap to Speak' : language === 'zh' ? '语音AI • 点击对话' : '音声AI • タップして会話');

  const subtitleText = isCalloutSpeaking && isSpeaking
    ? (language === 'en' ? 'Speak anytime to start conversation' : language === 'zh' ? '随时说话即可开始对话' : '話しかけると会話モードが始まります')
    : isListening
    ? (transcript
        ? formatQuote(transcript)
        : language === 'en'
        ? 'Speak now — asking about Mt. Takao'
        : language === 'zh'
        ? '请对着麦克风说话，了解高尾山'
        : 'マイクに向かってお話しください（高尾山について）')
    : isThinking
    ? (language === 'en' ? 'Processing your request...' : language === 'zh' ? '正在处理...' : '処理中...')
    : isSpeaking
    ? (language === 'en' ? 'Answering your question...' : language === 'zh' ? '正在回答您的问题…' : 'ご質問にお答えしています…')
    : (language === 'en' ? 'Click here to start or say "Hello"' : language === 'zh' ? '点击此处启动麦克风或直接说话' : 'ここをクリックしてマイクを起動（または発話）');

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

      {/* ── Active Conversation Floating Card (Shows BOTH User Question and AI Response) ── */}
      {(transcript || responseText || isThinking || isSpeaking) && (
        <div className="absolute bottom-full mb-3 right-0 w-84 sm:w-[430px] p-4 rounded-2xl bg-[#081226]/95 border border-salomon-cyan/60 shadow-2xl backdrop-blur-2xl flex flex-col gap-3 z-50 animate-fadeInUp">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-salomon-teal animate-pulse' : isThinking ? 'bg-amber-400 animate-spin' : 'bg-salomon-cyan animate-ping'}`} />
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-salomon-cyan" />
                {language === 'en' ? 'Salomon AI Concierge' : language === 'zh' ? '萨洛蒙AI向导' : 'サロモンAI山守'}
              </span>
            </div>
            <button
              onClick={onCancel}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-salomon-muted hover:text-white transition-colors"
              title={language === 'en' ? 'Close' : language === 'zh' ? '关闭' : '閉じる'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User speech inquiry bubble */}
          {transcript && (
            <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs space-y-1">
              <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" />
                <span>{language === 'en' ? 'You Asked:' : language === 'zh' ? '您的提问：' : 'お客様のご質問:'}</span>
              </div>
              <div className="text-white font-medium pl-4 leading-relaxed">
                {formatQuote(transcript)}
              </div>
            </div>
          )}

          {/* AI Thinking status */}
          {isThinking && !responseText && (
            <div className="flex items-center gap-2 text-xs text-amber-300 py-1 pl-1 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>
                {language === 'en'
                  ? 'Analyzing mountain & trail conditions...'
                  : language === 'zh'
                  ? '正在分析高尾山实时路况与建议...'
                  : '高尾山のルートと天候を分析中…'}
              </span>
            </div>
          )}

          {/* AI Response text bubble */}
          {responseText && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-100 leading-relaxed max-h-48 overflow-y-auto pr-1">
              <div className="text-[10px] font-bold text-salomon-cyan mb-1 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span>{language === 'en' ? 'AI Response:' : language === 'zh' ? 'AI回答：' : 'AI回答:'}</span>
              </div>
              <div className="pl-4 text-slate-200">
                {responseText}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-salomon-cyan/80 pt-1 font-medium border-t border-white/5">
            <span>● {language === 'en' ? 'Always-on hands-free' : language === 'zh' ? '常时免提监听中' : '常時ハンズフリー待機中'}</span>
            <span>● {language === 'en' ? 'AI Voice Guidance' : language === 'zh' ? 'AI语音回答中' : 'AI音声回答中'}</span>
          </div>
        </div>
      )}

      {/* ── Hands-free Ambient Real-time Voice HUD Bar ── */}
      <div
        onClick={() => {
          onStartListening();
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

        {/* Right: Language Switcher + Audio Waveform Equalizer */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          {/* Quick Language Toggle */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 bg-black/50 border border-white/10 rounded-lg p-0.5"
            title="Language / 言語 / 语言"
          >
            {(
              [
                { code: 'ja', label: 'JP' },
                { code: 'en', label: 'EN' },
                { code: 'zh', label: 'ZH' },
              ] as const
            ).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  useStore.getState().setLanguage(l.code);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  language === l.code
                    ? 'bg-salomon-cyan text-black shadow-glow-cyan'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Dynamic Frequency Bars */}
          <div className="flex items-center gap-1 h-6 px-2 py-1 bg-black/40 rounded-lg border border-white/10">
            {Array.from({ length: 5 }).map((_, i) => {
              const active = isListening || isSpeaking;
              const h = active
                ? Math.max(4, Math.min(22, 6 + (audioLevel * 16) * (0.7 + (i % 3) * 0.35) + (isSpeaking ? 6 : 0)))
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
              title={language === 'en' ? 'Mute' : language === 'zh' ? '静音' : '一時停止'}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


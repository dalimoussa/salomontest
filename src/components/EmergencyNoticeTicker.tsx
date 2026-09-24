'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, Megaphone } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useStore } from '@/store/useStore';

export function EmergencyNoticeTicker() {
  const emergencyNotice = useAdminStore((s) => s.emergencyNotice);
  const language = useStore((s) => s.language);

  if (!emergencyNotice || !emergencyNotice.enabled) {
    return null;
  }

  // Language-aware notice text with fallback to Japanese
  let rawText = '';
  if (language === 'en') {
    rawText = emergencyNotice.message_en || emergencyNotice.message;
  } else if (language === 'zh') {
    rawText = emergencyNotice.message_zh || emergencyNotice.message;
  } else {
    rawText = emergencyNotice.message;
  }

  const message = rawText ? rawText.trim() : '';
  if (!message) {
    return null;
  }

  const severity = emergencyNotice.severity || 'alert';

  // Severity styling configurations
  const config = {
    alert: {
      bg: 'bg-rose-950/90 border-rose-500/50 shadow-rose-950/50',
      badgeBg: 'bg-rose-500 text-white shadow-glow-red',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      textColor: 'text-rose-100',
      tag: language === 'en' ? 'URGENT ALERT' : language === 'zh' ? '紧急警报' : '緊急情報',
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/50 shadow-amber-950/50',
      badgeBg: 'bg-amber-500 text-slate-950 shadow-glow-amber',
      icon: AlertCircle,
      iconColor: 'text-amber-400',
      textColor: 'text-amber-100',
      tag: language === 'en' ? 'SPECIAL NOTICE' : language === 'zh' ? '特别通知' : '特別なお知らせ',
    },
    info: {
      bg: 'bg-cyan-950/90 border-cyan-500/50 shadow-cyan-950/50',
      badgeBg: 'bg-cyan-500 text-slate-950 shadow-glow-cyan',
      icon: Info,
      iconColor: 'text-cyan-400',
      textColor: 'text-cyan-100',
      tag: language === 'en' ? 'ANNOUNCEMENT' : language === 'zh' ? '重要提醒' : '重要なお知らせ',
    },
  }[severity] || {
    bg: 'bg-rose-950/90 border-rose-500/50 shadow-rose-950/50',
    badgeBg: 'bg-rose-500 text-white shadow-glow-red',
    icon: AlertTriangle,
    iconColor: 'text-rose-400',
    textColor: 'text-rose-100',
    tag: '緊急情報',
  };

  const Icon = config.icon;

  return (
    <div
      className="relative z-30 w-full px-3 py-1.5 transition-all duration-300 animate-fadeIn"
      role="region"
      aria-label="緊急お知らせ"
    >
      <div
        className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-lg overflow-hidden ${config.bg}`}
      >
        {/* Left Fixed Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider flex items-center gap-1 uppercase ${config.badgeBg}`}
          >
            <Icon className="w-3.5 h-3.5 animate-pulse" />
            <span>{config.tag}</span>
          </span>
        </div>

        {/* Right to Left Scrolling Marquee Ticker */}
        <div className="relative flex-1 overflow-hidden h-6 flex items-center select-none">
          <div className={`animate-marquee flex items-center ${config.textColor}`}>
            {/* Repeated content ensures continuous loop */}
            <span className="text-xs sm:text-sm font-bold tracking-wide mr-16">
              {message}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wide mr-16 opacity-80">
              ✦ {message}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wide mr-16 opacity-60">
              ✦ {message}
            </span>
          </div>
        </div>

        {/* Subtle right gradient fade for sleek transition */}
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-black/60 to-transparent" />
      </div>
    </div>
  );
}

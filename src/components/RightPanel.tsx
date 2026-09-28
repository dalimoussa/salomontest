'use client';

import { Bot, Coffee, ParkingCircle, Waves, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTrailStatus, trailSeverityColor } from '@/data/trailStatus';
import { getFacilities, facilityStatusLabel, facilityStatusColor } from '@/data/facilities';
import { getSafetyFlagLabel } from '@/lib/safetyFlags';
import { useT } from '@/lib/i18n';
import type { Facility } from '@/types';

function FacilityIcon({ icon }: { icon: Facility['icon'] }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0';
  switch (icon) {
    case 'coffee':   return <Coffee        className={`${cls} text-amber-400`}        />;
    case 'parking':  return <ParkingCircle className={`${cls} text-salomon-cyan`}      />;
    case 'restroom': return <Waves         className={`${cls} text-blue-400`}          />;
    case 'water':    return <Waves         className={`${cls} text-blue-400`}          />;
    default:         return <CheckCircle2  className={`${cls} text-salomon-muted`}     />;
  }
}

export function RightPanel() {
  const messages   = useStore(s => s.messages);
  const isGenerating = useStore(s => s.isGenerating);
  const clearMessages = useStore(s => s.clearMessages);
  const { t, language } = useT();

  const latestMessage = messages[messages.length - 1];
  const advice  = latestMessage?.advice;
  const hasError = latestMessage?.role === 'system';

  // Read localized repositories
  const trailStatus  = getTrailStatus(language);
  const facilities   = getFacilities(language);

  const severityText =
    trailStatus.overallSeverity === 'good' ? t('trail.good') :
    trailStatus.overallSeverity === 'caution' ? t('trail.caution') :
    t('trail.warning');

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Zone ⑤ Trail Status */}
      <div className="glass-card overflow-hidden animate-fadeInRight opacity-0-start" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
        <div className="relative h-28 overflow-hidden">
          <img
            src={trailStatus.photoUrl ?? '/all_course_2016.jpg'}
            alt="登山道の状況"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-salomon-dark/90 via-salomon-dark/30 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <p className="section-label">{t('trail.title')}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/40 ${trailSeverityColor(trailStatus.overallSeverity)}`}>
              {severityText}
            </span>
          </div>
        </div>
        <div className="px-3 py-2.5 space-y-1">
          {trailStatus.closures.length > 0 && (
            <div className="flex items-start gap-1.5 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-[10px] font-medium leading-tight">
                {t('trail.closures')}: {trailStatus.closures.join('・')}
              </p>
            </div>
          )}
          {trailStatus.items.map((item, i) => (
            <p
              key={i}
              className={`text-xs leading-relaxed ${
                item.severity === 'warning' ? 'text-red-300 font-medium' :
                item.severity === 'caution' ? 'text-yellow-400 font-medium' :
                'text-salomon-text'
              }`}
            >
              {item.label}
            </p>
          ))}
          <p className="text-[9px] text-white/20 text-right font-mono pt-0.5">
            {t('trail.confirmed')}: {new Date(trailStatus.updatedAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'ja-JP', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Zone ⑥ Facilities */}
      <div className="glass-card p-3 animate-fadeInRight opacity-0-start" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
        <p className="section-label mb-2.5">{t('facilities.title')}</p>
        <div className="grid grid-cols-2 gap-2">
          {facilities.map((f) => {
            const isFullWidth = facilities.indexOf(f) === facilities.length - 1 && facilities.length % 2 !== 0;
            return (
              <div
                key={f.id}
                className={`bg-white/5 rounded-xl p-2.5 border border-salomon-border flex flex-col justify-between gap-1.5 ${isFullWidth ? 'col-span-2' : ''}`}
              >
                <div className="flex items-start justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FacilityIcon icon={f.icon} />
                    <span className="text-xs font-semibold text-salomon-text leading-tight">{f.name}</span>
                  </div>
                  {f.hours ? (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30 font-medium shrink-0 whitespace-nowrap">
                      {f.hours}
                    </span>
                  ) : (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${
                      f.status === 'open'    ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      f.status === 'crowded' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      f.status === 'closed'  ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-white/10 text-salomon-muted border border-white/10'
                    }`}>
                      {facilityStatusLabel(f.status, language)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-salomon-muted leading-tight">{f.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone ⑦ AI Advice */}
      <div className="glass-card p-3 border-salomon-cyan/30 flex-1 min-h-0 flex flex-col animate-fadeInRight opacity-0-start relative overflow-hidden" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-salomon-cyan/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-salomon-cyan to-salomon-teal flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
            <Bot className="w-3.5 h-3.5 text-salomon-black" />
          </div>
          <p className="section-label">{t('advice.title')}</p>
          {isGenerating && (
            <span className="ml-auto flex gap-0.5">
              {[0.0, 0.15, 0.30].map((d, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-salomon-cyan animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5">
          {advice && !hasError ? (
            <div className="space-y-2">
              <p className="text-salomon-text text-xs leading-relaxed">{advice.advice_text}</p>
              {advice.safety_flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {advice.safety_flags.slice(0, 3).map(flag => (
                    <span key={flag} className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-medium leading-normal inline-flex items-center gap-1">
                      <span>⚠</span>
                      <span>{getSafetyFlagLabel(flag, language)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : hasError ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs">{t('advice.error')}</p>
              </div>
              <button
                onClick={clearMessages}
                className="flex items-center gap-1.5 text-[11px] text-salomon-cyan py-1.5 px-3 rounded-lg bg-salomon-cyan/10 border border-salomon-cyan/30 hover:bg-salomon-cyan/20 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {t('advice.retry')}
              </button>
            </div>
          ) : (
            <p className="text-salomon-muted text-xs leading-relaxed">
              {isGenerating
                ? t('advice.generating')
                : t('advice.selectPrompt')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { X, TrainFront, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getCableCarInfo } from '@/data/cableCar';
import { useT } from '@/lib/i18n';
import type { CableCarService } from '@/types';

function ServiceStatusBadge({ status }: { status: CableCarService['status'] }) {
  const { t } = useT();
  if (status === 'operating') {
    return (
      <span className="text-[10px] font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
        ✓ {t('modal.cableNormal')}
      </span>
    );
  }
  if (status === 'suspended') {
    return (
      <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
        ✕ {t('modal.cableSuspended')}
      </span>
    );
  }
  // 'unknown' — no live API
  return (
    <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {t('modal.cableCheck')}
    </span>
  );
}

export function CableCarModal() {
  const setActiveModal = useStore(s => s.setActiveModal);
  const { t, language } = useT();
  const info = getCableCarInfo(language);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={() => setActiveModal(null)}
      role="dialog"
      aria-label={t('modal.cableTitle')}
    >
      <div
        className="glass-card w-full max-w-lg overflow-hidden border border-salomon-cyan/40 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-salomon-dark/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <TrainFront className="w-4 h-4 text-salomon-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t('modal.cableTitle')}</h3>
              <p className="text-[10px] text-salomon-muted">{t('modal.cableSection')}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-center text-salomon-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* No live feed notice */}
        <div className="mx-5 mt-4 flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-300 leading-relaxed">
            {t('modal.cableNotice')}{' '}
            <a
              href="https://www.takaotozan.co.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-salomon-cyan"
            >
              {t('modal.officialSite')}
            </a>
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Service Cards */}
          {info.services.map((service, i) => (
            <div key={i} className="bg-white/5 border border-salomon-border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{service.name}</span>
                <ServiceStatusBadge status={service.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-salomon-muted pt-1 border-t border-white/5">
                <div><span className="text-white/60">{t('modal.firstDeparture')}:</span> <span className="text-white font-medium">{service.firstDeparture}</span></div>
                <div><span className="text-white/60">{t('modal.lastDeparture')}:</span> <span className="text-white font-medium">{service.lastDeparture}</span></div>
                {service.intervalMin > 0 && (
                  <div><span className="text-white/60">{t('modal.interval')}:</span> <span className="text-white font-medium">{service.intervalMin}{t('modal.intervalMin')}</span></div>
                )}
                <div><span className="text-white/60">{t('modal.duration')}:</span> <span className="text-white font-medium">{t('modal.durationMin', { min: service.durationMin })}</span></div>
              </div>
              {service.note && (
                <p className="text-[10px] text-salomon-muted mt-2 pt-1 border-t border-white/5">
                  ※ {service.note}
                </p>
              )}
            </div>
          ))}

          {/* Fares */}
          <div className="bg-salomon-card/50 rounded-xl p-3 border border-white/5 text-[11px] text-salomon-muted space-y-1">
            <p className="font-semibold text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-salomon-cyan" /> {t('modal.fareGuide')}
            </p>
            {info.fares.map(fare => (
              <p key={fare.label}>{fare.label}: {t('modal.oneWay')} ¥{fare.oneWay} / {t('modal.roundTrip')} ¥{fare.roundTrip}</p>
            ))}
            <p className="text-white/50 pt-1">{info.paymentNote}</p>
          </div>

          {/* Data age */}
          <p className="text-[9px] text-white/20 text-right font-mono">
            {t('modal.infoUpdated')}: {new Date(info.updatedAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

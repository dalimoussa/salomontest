'use client';

import { useEffect, useRef } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';

export function StaffModal() {
  const setActiveModal = useStore(s => s.setActiveModal);
  const selectedRoute = useStore(s => s.selectedRoute);
  const selectedDifficulty = useStore(s => s.selectedDifficulty);
  const weather = useStore(s => s.weather);
  const language = useStore(s => s.language);
  const { t } = useT();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    fetch('/api/google-chat/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'staff_call',
        message: '店頭110インチサイネージ前でお客様がスタッフ対応をお待ちです。',
        routeName: selectedRoute?.name,
        difficulty: selectedDifficulty,
        weatherSummary: weather?.weather,
        temp: weather?.temp_c,
        language,
      }),
    }).catch((err) => console.warn('Google Chat notification failed:', err));
  }, [selectedRoute?.name, selectedDifficulty, weather, language]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true" aria-label={t('modal.staffTitle')}>
      <div className="relative bg-[#0D1529] border border-white/10 rounded-t-3xl sm:rounded-2xl
                      shadow-2xl w-full sm:max-w-sm animate-fadeInUp text-center"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 mb-4">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <button onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center
                     rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
          aria-label={t('modal.close')}>
          <X className="w-5 h-5 text-salomon-muted" />
        </button>

        <div className="px-6 pb-2">
          <div className="w-16 h-16 bg-salomon-red rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{t('modal.staffTitle')}</h2>
          <p className="text-sm text-salomon-muted mb-5 leading-relaxed">
            {t('modal.staffDesc')}
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-white">{t('modal.staffAvailable')}</span>
            </div>
            <p className="text-xs text-salomon-muted mt-1">{t('modal.staffNotified')}</p>
          </div>
          <button onClick={() => setActiveModal(null)}
            className="w-full bg-salomon-cyan text-salomon-black py-3.5 rounded-xl text-sm font-bold
                       hover:bg-salomon-cyan/90 active:scale-98 transition-all min-h-[50px]">
            {t('modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

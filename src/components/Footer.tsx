'use client';

import { useState } from 'react';
import { Globe, MapPin, Phone, Clock, FileText, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';

const LANGUAGES = [
  { code: 'ja' as const, label: '日本語' },
  { code: 'en' as const, label: 'English' },
  { code: 'zh' as const, label: '中文' },
];

export function Footer() {
  const language    = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const [showTerms, setShowTerms] = useState(false);
  const { t } = useT();

  return (
    <footer className="w-full bg-salomon-dark/95 border-t border-white/10 px-6 py-2 flex items-center justify-between text-[11px] text-salomon-muted z-20">
      {/* Store Information */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-white font-medium">
          <MapPin className="w-3.5 h-3.5 text-salomon-cyan" />
          <span>{t('footer.storeName')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-salomon-muted" />
          <span>{t('footer.hours')}</span>
        </div>
        <a
          href={`tel:${t('footer.phone').replace(/[^0-9+]/g, '')}`}
          className="flex items-center gap-1 hover:text-white transition-colors"
          title={t('footer.phone')}
        >
          <Phone className="w-3 h-3 text-salomon-muted" />
          <span>{t('footer.phone')}</span>
        </a>
      </div>

      {/* Language Switcher & Terms */}
      <div className="flex items-center gap-4">
        {/* Language selector chips (min 44px touch ergonomics) */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-salomon-border rounded-xl p-1">
          <Globe className="w-4 h-4 text-salomon-cyan ml-1.5" />
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                language === lang.code
                  ? 'bg-salomon-cyan text-salomon-black font-bold shadow-glow-cyan'
                  : 'text-salomon-muted hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Fullscreen Kiosk Toggle */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-salomon-muted hover:text-white transition-colors min-h-[36px]"
          title={t('footer.fullscreen')}
        >
          <span>⛶ {t('footer.fullscreen')}</span>
        </button>

        {/* Terms of Use */}
        <button
          onClick={() => setShowTerms(true)}
          className="flex items-center gap-1 text-salomon-muted hover:text-white transition-colors min-h-[36px]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('footer.terms')}</span>
        </button>

        {/* Admin Console Shortcut */}
        <a
          href="/admin"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-salomon-cyan/20 text-salomon-muted hover:text-salomon-cyan border border-transparent hover:border-salomon-cyan/40 transition-colors min-h-[36px]"
          title="店舗・管理者画面"
        >
          <span>⚙️ 管理画面</span>
        </a>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="glass-card max-w-md w-full p-5 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-salomon-cyan" /> {t('footer.termsTitle')}
              </span>
              <button onClick={() => setShowTerms(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed max-h-60 overflow-y-auto pr-1">
              <p>1. {t('footer.terms1')}</p>
              <p>2. {t('footer.terms2')}</p>
              <p>3. {t('footer.terms3')}</p>
              <p>4. {t('footer.terms4')}</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="w-full py-2 bg-salomon-cyan text-salomon-black rounded-lg font-bold text-xs hover:bg-salomon-cyan/90 transition-colors"
            >
              {t('modal.close')}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}

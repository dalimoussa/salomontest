'use client';

/**
 * LiveCameraModal
 *
 * IMPORTANT — Usage Rights:
 *   A real live camera embed from the Mt. Takao summit requires confirmed
 *   usage rights from the camera operator (Hachioji City / 高尾山観光案内所
 *   network or similar). Those rights have NOT been confirmed for Phase 1.
 *
 *   Until a real embed URL is provided and rights confirmed, this modal shows
 *   a representative scenic photo with clear "準備中" labeling — it does NOT
 *   display a LIVE badge or fake REC indicator.
 *
 *   To activate a real live camera:
 *   1. Obtain a confirmed embed URL.
 *   2. Set NEXT_PUBLIC_CAMERA_URL in .env.local.
 *   3. Replace the <img> below with an <iframe src={cameraUrl}>.
 */

import { X, Video, Eye, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';

const CAMERA_URL = process.env.NEXT_PUBLIC_CAMERA_URL ?? '';

export function LiveCameraModal() {
  const setActiveModal = useStore(s => s.setActiveModal);
  const { t } = useT();
  const hasLiveFeed = Boolean(CAMERA_URL);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={() => setActiveModal(null)}
      role="dialog"
      aria-label={t('modal.cameraTitle')}
    >
      <div
        className="glass-card w-full max-w-2xl overflow-hidden border border-salomon-cyan/40 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-salomon-dark/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-500/20 border border-slate-500/40 flex items-center justify-center">
              <Video className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{t('modal.cameraTitle')}</h3>
                {hasLiveFeed ? (
                  <span className="flex items-center gap-1 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    {t('modal.cameraLive')}
                  </span>
                ) : (
                  <span className="text-[9px] bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-full font-medium">
                    {t('modal.cameraPreparing')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-salomon-muted flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-salomon-cyan" /> {t('modal.cameraLocation')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-center text-salomon-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Area */}
        <div className="relative aspect-video w-full bg-salomon-black overflow-hidden">
          {hasLiveFeed ? (
            <iframe
              src={CAMERA_URL}
              className="w-full h-full border-0"
              title={t('modal.cameraTitle')}
              allow="autoplay"
            />
          ) : (
            <>
              {/* Representative scenic photo — clearly labeled as placeholder */}
              <img
                src="/all_course_2016.jpg"
                alt="高尾山 参考写真"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Clearly labeled as placeholder — not live */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center space-y-2 max-w-xs">
                  <Video className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-white font-semibold text-sm">{t('modal.cameraPreparing')}</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {t('modal.cameraNotice')}
                  </p>
                </div>
              </div>

              {/* Location tag at bottom */}
              <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-salomon-cyan" />
                <span>{t('modal.cameraRefPhoto')}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-salomon-dark/95 border-t border-white/10 text-[11px] text-salomon-muted flex items-center justify-between">
          <span>
            {hasLiveFeed
              ? 'Live video provided by camera operator'
              : t('modal.cameraFooter')}
          </span>
          <a
            href="https://www.takao-kanko.jp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-salomon-cyan hover:underline text-[10px]"
          >
            {t('modal.officialSite')} →
          </a>
        </div>
      </div>
    </div>
  );
}

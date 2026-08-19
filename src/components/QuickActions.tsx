'use client';

import { Smartphone, MapPinned, FileQuestion, ListChecks } from 'lucide-react';
import { useStore } from '@/store/useStore';

const ACTIONS = [
  { icon: MapPinned,    label: '初心者におすすめのルートは？', action: 'route' },
  { icon: FileQuestion, label: '山頂のライブカメラを見たい',   action: 'camera' },
  { icon: ListChecks,   label: '駐車場の状況は？',            action: 'parking' },
  { icon: Smartphone,   label: '持ち物チェックリスト',        action: 'checklist' },
];

export function QuickActions() {
  const setActiveModal = useStore(s => s.setActiveModal);

  const handleClick = (action: string) => {
    if (action === 'checklist') setActiveModal('equipment');
  };

  return (
    <div className="animate-fadeInUp opacity-0-start"
      style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}>
      <p className="text-salomon-muted text-[10px] text-center mb-2.5 tracking-wide">
        他に聞きたいことはありますか？（音声でも入力できます）
      </p>

      {/* 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} onClick={() => handleClick(a.action)}
              className="flex items-center gap-2 md:flex-col md:items-center p-3 rounded-xl
                         bg-white/8 border border-salomon-border
                         hover:border-salomon-cyan/60 hover:bg-white/12
                         active:scale-95 transition-all duration-200 group
                         min-h-[52px] md:min-h-[auto]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-salomon-cyan/20 to-salomon-teal/10
                              border border-salomon-cyan/30 flex items-center justify-center flex-shrink-0
                              group-hover:shadow-glow-cyan transition-shadow duration-200">
                <Icon className="w-4 h-4 text-salomon-cyan" strokeWidth={1.5} />
              </div>
              <span className="text-salomon-text text-[11px] md:text-[10px] leading-tight
                               md:text-center font-medium group-hover:text-white transition-colors text-left">
                {a.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* QR button */}
      <div className="mt-3 flex items-center justify-center">
        <button onClick={() => setActiveModal('qr')}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-salomon-border
                     hover:border-salomon-cyan/60 bg-white/8 hover:bg-white/12
                     active:scale-95 transition-all duration-200 group min-h-[44px]">
          <div className="w-9 h-9 bg-white rounded-lg p-1 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => (
                <rect key={`${r}-${c}`} x={c*20+5} y={r*20+5} width="10" height="10" fill="#0D1529" />
              )))}
            </svg>
          </div>
          <div className="text-left">
            <p className="text-salomon-text text-xs font-semibold group-hover:text-white transition-colors">
              ルートをスマホに送る
            </p>
            <p className="text-salomon-muted text-[10px]">QRコード</p>
          </div>
        </button>
      </div>
    </div>
  );
}

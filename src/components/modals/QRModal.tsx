'use client';

import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/store/useStore';

export function QRModal() {
  const messages       = useStore(s => s.messages);
  const selectedRoute  = useStore(s => s.selectedRoute);
  const weather        = useStore(s => s.weather);
  const setActiveModal = useStore(s => s.setActiveModal);

  const lastMessage = messages[messages.length - 1];
  const products    = lastMessage?.products ?? [];

  const qrData = JSON.stringify({
    route:    selectedRoute?.name ?? '',
    temp:     weather?.temp_c ?? '',
    weather:  weather?.weather ?? '',
    products: products.map(p => ({ sku: p.sku, name: p.name, price: p.price })),
    advice:   lastMessage?.advice?.advice_short ?? '',
    ts:       Date.now(),
  });

  const qrUrl = `https://salomon-concierge.vercel.app/share?data=${encodeURIComponent(qrData)}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true" aria-label="QRコード">
      <div className="relative bg-[#0D1529] border border-white/10 rounded-t-3xl sm:rounded-2xl
                      shadow-2xl w-full sm:max-w-sm"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 mb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pt-1 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">QRコードで受け取る</h2>
            <button onClick={() => setActiveModal(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10
                         transition-colors min-h-[44px] min-w-[44px]"
              aria-label="閉じる">
              <X className="w-5 h-5 text-salomon-muted" />
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <QRCodeSVG value={qrUrl} size={180} bgColor="#FFFFFF" fgColor="#0D1529" level="M" />
            </div>
          </div>

          <p className="text-xs text-center text-salomon-muted mb-4 leading-relaxed">
            スマートフォンで読み取ると本日のおすすめ装備リストを確認できます。
          </p>

          {products.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 mb-4">
              <p className="text-xs font-bold text-salomon-muted mb-2">含まれる商品</p>
              {products.map(p => (
                <div key={p.sku} className="flex justify-between text-xs">
                  <span className="text-white font-medium truncate mr-2">{p.name}</span>
                  <span className="text-salomon-cyan font-bold flex-shrink-0">
                    ¥{p.price.toLocaleString('ja-JP')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setActiveModal(null)}
            className="w-full bg-salomon-black text-white py-3.5 rounded-xl text-sm font-bold
                       hover:bg-gray-800 active:scale-98 transition-all min-h-[50px]">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

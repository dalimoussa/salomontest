'use client';

import { X, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';

const CATEGORY_LABEL: Record<string, string> = {
  footwear: 'フットウェア',
  apparel:  'アパレル',
  gear:     'ギア',
};

export function EquipmentModal() {
  const messages       = useStore(s => s.messages);
  const selectedRoute  = useStore(s => s.selectedRoute);
  const weather        = useStore(s => s.weather);
  const setActiveModal = useStore(s => s.setActiveModal);
  const allProducts    = useAdminStore(s => s.products);

  const lastMessage  = messages[messages.length - 1];
  const recommended  = lastMessage?.products ?? [];
  const recSkus      = new Set(recommended.map(p => p.sku));
  const gearSlugs    = lastMessage?.advice?.recommended_gear ?? [];

  const grouped = recommended.reduce<Record<string, typeof recommended>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const extras = allProducts.filter(p => p.tags.some(t => gearSlugs.includes(t)) && !recSkus.has(p.sku));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true" aria-label="装備リスト">
      <div className="bg-[#0D1529] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl
                      w-full sm:max-w-xl flex flex-col"
        style={{ maxHeight: '85dvh' }}>

        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">装備リスト</h2>
            {selectedRoute && (
              <p className="text-xs text-salomon-muted mt-0.5">
                {selectedRoute.name}
                {weather && ` · ${weather.temp_c}°C ${weather.weather}`}
              </p>
            )}
          </div>
          <button onClick={() => setActiveModal(null)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10
                       transition-colors min-h-[44px] min-w-[44px]"
            aria-label="閉じる">
            <X className="w-5 h-5 text-salomon-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          {recommended.length > 0 ? (
            <div className="space-y-5">
              {Object.entries(grouped).map(([cat, prods]) => (
                <div key={cat}>
                  <h3 className="section-label mb-3">{CATEGORY_LABEL[cat] ?? cat}</h3>
                  <div className="space-y-3">
                    {prods.map(p => (
                      <div key={p.sku}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
                        <img src={p.imageUrl} alt={p.name}
                          className="w-14 h-14 rounded-lg object-cover bg-white/5 flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/0D1529/7B8DB0?text=S'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{p.name}</p>
                          <p className="text-xs text-salomon-muted mt-0.5 line-clamp-2">{p.descriptionShort}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-salomon-cyan font-bold text-sm">
                            ¥{p.price.toLocaleString('ja-JP')}
                          </p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs text-green-400 font-medium">推薦</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {extras.length > 0 && (
                <div>
                  <h3 className="section-label mb-3">その他おすすめ</h3>
                  <div className="space-y-2">
                    {extras.map(p => (
                      <div key={p.sku}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-white/8">
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="ml-auto text-salomon-cyan text-sm font-bold flex-shrink-0">
                          ¥{p.price.toLocaleString('ja-JP')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-salomon-muted">
              <p className="text-sm">ルートを選択すると装備リストが表示されます</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3 flex-shrink-0"
          style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
          <button onClick={() => setActiveModal('qr')}
            className="flex-1 border-2 border-salomon-black text-salomon-text py-3 rounded-xl
                       text-sm font-bold hover:border-salomon-cyan/60 hover:text-white
                       active:scale-98 transition-all min-h-[50px]">
            QRで受け取る
          </button>
          <button onClick={() => setActiveModal(null)}
            className="flex-1 bg-salomon-black text-white py-3 rounded-xl text-sm font-bold
                       hover:bg-gray-800 active:scale-98 transition-all min-h-[50px]">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

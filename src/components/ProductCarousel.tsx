'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';

const CATEGORY_FILTERS = [
  { label: 'シーズン',      value: 'all' },
  { label: 'ベースレイヤー', value: 'base' },
  { label: 'ミッドレイヤー', value: 'mid' },
  { label: 'アウター',      value: 'apparel' },
  { label: 'ボトムス',      value: 'bottoms' },
  { label: 'ソックス',      value: 'socks' },
  { label: 'アクセサリー',  value: 'gear' },
];

const CATEGORY_LABEL: Record<string, string> = {
  footwear: 'シューズ',
  apparel:  'ジャケット',
  gear:     'アクセサリー',
};

export function ProductCarousel() {
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recommendedProducts = useStore(s => s.recommendedProducts);
  const adminProducts       = useAdminStore(s => s.products);
  const displayProducts     = recommendedProducts.length > 0 ? recommendedProducts : adminProducts;

  const filtered = activeFilter === 'all'
    ? displayProducts
    : displayProducts.filter(p =>
        activeFilter === 'gear'
          ? p.category === 'gear'
          : p.category === activeFilter || p.subCategory?.includes(activeFilter)
      );

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="glass-card px-4 py-3 animate-fadeInUp opacity-0-start"
      style={{ animationFillMode: 'forwards', animationDelay: '0.35s' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="section-label">おすすめ装備・アイテム（SALOMON）</p>
        <div className="flex gap-1">
          {(['left','right'] as const).map(dir => (
            <button key={dir} onClick={() => scroll(dir)}
              aria-label={dir === 'left' ? '前へ' : '次へ'}
              className="w-7 h-7 rounded-full bg-white/8 border border-salomon-border
                         flex items-center justify-center hover:bg-white/15
                         transition-colors active:scale-90">
              {dir === 'left'
                ? <ChevronLeft  className="w-4 h-4 text-salomon-muted" />
                : <ChevronRight className="w-4 h-4 text-salomon-muted" />}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable product cards */}
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {filtered.map((product, i) => (
          <div key={product.sku}
            className="flex-shrink-0 w-[120px] md:w-[110px] glass-card-hover p-2
                       flex flex-col items-center gap-1.5
                       animate-fadeInUp opacity-0-start"
            style={{ animationFillMode: 'forwards', animationDelay: `${0.4 + i * 0.07}s` }}>
            <div className="w-full h-20 md:h-16 rounded-lg overflow-hidden bg-white/5">
              <img src={product.imageUrl} alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x80/0D1529/7B8DB0?text=S'; }}
              />
            </div>
            <div className="text-center w-full">
              <p className="text-salomon-text text-[10px] font-bold leading-tight line-clamp-2">{product.name}</p>
              <p className="text-salomon-muted text-[9px] mt-0.5">{CATEGORY_LABEL[product.category] ?? product.category}</p>
              <p className="text-salomon-cyan text-[10px] font-bold mt-0.5">¥{product.price.toLocaleString('ja-JP')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {CATEGORY_FILTERS.map(f => (
          <button key={f.value} onClick={() => setActiveFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold
                        transition-all duration-200 min-h-[32px] active:scale-95 ${
              activeFilter === f.value
                ? 'bg-salomon-cyan text-salomon-black shadow-glow-cyan'
                : 'bg-white/8 text-salomon-muted border border-salomon-border hover:text-white hover:border-salomon-cyan/40'
            }`}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

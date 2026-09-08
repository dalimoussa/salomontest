'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { getLocalizedProduct } from '@/data/products';
import { useT } from '@/lib/i18n';

export function ProductCarousel() {
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recommendedProducts = useStore(s => s.recommendedProducts);
  const adminProducts       = useAdminStore(s => s.products);
  const { t, language }     = useT();

  const CATEGORY_FILTERS = [
    { label: t('products.filterAll'),      value: 'all' },
    { label: t('products.filterFootwear'), value: 'footwear' },
    { label: t('products.filterApparel'),  value: 'apparel' },
    { label: t('products.filterGear'),     value: 'gear' },
  ];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'footwear': return t('products.categoryFootwear');
      case 'apparel':  return t('products.categoryApparel');
      case 'gear':     return t('products.categoryGear');
      default:         return category;
    }
  };

  const rawDisplayProducts = recommendedProducts.length > 0 ? recommendedProducts : adminProducts;
  const displayProducts = rawDisplayProducts.map(p => getLocalizedProduct(p, language));

  const filtered = activeFilter === 'all'
    ? displayProducts
    : displayProducts.filter(p => p.category === activeFilter);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="glass-card px-4 py-3 animate-fadeInUp opacity-0-start"
      style={{ animationFillMode: 'forwards', animationDelay: '0.35s' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="section-label">{t('products.title')}</p>
        <div className="flex gap-1">
          {(['left','right'] as const).map(dir => (
            <button key={dir} onClick={() => scroll(dir)}
              aria-label={dir === 'left' ? t('products.prev') : t('products.next')}
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
        className="flex gap-3.5 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {filtered.map((product, i) => (
          <div key={product.sku}
            title={product.name}
            className="flex-shrink-0 w-[150px] md:w-[155px] xl:w-[165px] glass-card-hover p-2.5
                       flex flex-col items-center gap-2 cursor-pointer
                       animate-fadeInUp opacity-0-start active:scale-95 transition-transform"
            style={{ animationFillMode: 'forwards', animationDelay: `${0.4 + i * 0.07}s` }}>
            <div className="w-full h-24 md:h-20 rounded-lg overflow-hidden bg-white/5">
              <img src={product.imageUrl} alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/135x90/0D1529/7B8DB0?text=S'; }}
              />
            </div>
            <div className="text-center w-full">
              <p className="text-salomon-text text-xs font-bold leading-tight line-clamp-2" title={product.name}>{product.name}</p>
              <p className="text-salomon-muted text-[10px] mt-0.5">{getCategoryLabel(product.category)}</p>
              <p className="text-salomon-cyan text-xs font-bold mt-1">¥{product.price.toLocaleString('ja-JP')}</p>
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

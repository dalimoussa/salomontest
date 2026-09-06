import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS } from '@/data/products';
import type { Product } from '@/types';

export interface LocalizedHeroMessage {
  greeting: string;
  subtitle: string;
}

export type HeroMessages = Record<'ja' | 'en' | 'zh', LocalizedHeroMessage>;

const DEFAULT_HERO_MESSAGES: HeroMessages = {
  ja: {
    greeting: 'こんにちは！今日はどの山の情報が知りたいですか？',
    subtitle: '高尾山の最新情報をAIがご案内します。',
  },
  en: {
    greeting: 'Welcome! Which mountain trails would you like to explore today?',
    subtitle: 'Your Salomon AI Concierge provides real-time conditions for Mt. Takao.',
  },
  zh: {
    greeting: '您好！今天想了解哪座山与哪条路线的信息呢？',
    subtitle: '萨洛蒙AI向导为您实时提供高尾山最新向导服务。',
  },
};

export interface AdminState {
  // Hero messages
  heroMessages: HeroMessages;
  setHeroMessages: (m: HeroMessages) => void;
  setHeroMessageForLang: (lang: 'ja' | 'en' | 'zh', m: LocalizedHeroMessage) => void;

  // Product overrides — full list managed by admin
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (sku: string, updates: Partial<Product>) => void;
  deleteProduct: (sku: string) => void;

  // UI state (not persisted)
  lastSavedAt: string | null;
  markSaved: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      heroMessages: DEFAULT_HERO_MESSAGES,
      setHeroMessages: (heroMessages) =>
        set({ heroMessages, lastSavedAt: new Date().toISOString() }),
      setHeroMessageForLang: (lang, message) =>
        set((s) => ({
          heroMessages: {
            ...s.heroMessages,
            [lang]: message,
          },
          lastSavedAt: new Date().toISOString(),
        })),

      products: PRODUCTS,
      setProducts: (products) =>
        set({ products, lastSavedAt: new Date().toISOString() }),
      addProduct: (product) =>
        set((s) => ({
          products: [...s.products, product],
          lastSavedAt: new Date().toISOString(),
        })),
      updateProduct: (sku, updates) =>
        set((s) => ({
          products: s.products.map((p) => (p.sku === sku ? { ...p, ...updates } : p)),
          lastSavedAt: new Date().toISOString(),
        })),
      deleteProduct: (sku) =>
        set((s) => ({
          products: s.products.filter((p) => p.sku !== sku),
          lastSavedAt: new Date().toISOString(),
        })),

      lastSavedAt: null,
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
    }),
    {
      name: 'salomon-admin-store',
      // Only persist data, not functions
      partialize: (s) => ({
        heroMessages: s.heroMessages,
        products: s.products,
        lastSavedAt: s.lastSavedAt,
      }),
      // Migrate legacy single-language structure
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const msgs = state.heroMessages as any;
        if (msgs && (msgs.greeting || msgs.subtitle) && !msgs.ja) {
          state.heroMessages = {
            ja: {
              greeting: msgs.greeting || DEFAULT_HERO_MESSAGES.ja.greeting,
              subtitle: msgs.subtitle || DEFAULT_HERO_MESSAGES.ja.subtitle,
            },
            en: DEFAULT_HERO_MESSAGES.en,
            zh: DEFAULT_HERO_MESSAGES.zh,
          };
        }
      },
    }
  )
);

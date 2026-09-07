import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS } from '@/data/products';
import type { Product, RouteAdminSetting, Difficulty } from '@/types';

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

export const DEFAULT_ROUTE_SETTINGS: Record<string, RouteAdminSetting> = {
  route_1: {
    difficulty: 'beginner',
    stars: 1,
    comment: '薬王院への表参道。全線舗装路で茶屋やトイレが充実。スニーカーでも安心の定番ルート。',
  },
  route_2: {
    difficulty: 'beginner',
    stars: 1,
    comment: '高尾山駅周辺を1周約40分。南斜面と北斜面の豊かな植生変化を観察できる緩やか散策路。',
  },
  route_3: {
    difficulty: 'beginner',
    stars: 2,
    comment: '静寂と美しいカツラ巨木林が広がる自然道。混雑を避けてゆっくり森林浴を楽しみたい方におすすめ。',
  },
  route_4: {
    difficulty: 'beginner',
    stars: 2,
    comment: '高尾山唯一の吊り橋「みやま橋」が大人気。ブナやカエデの原生林に包まれる爽快コース。',
  },
  route_5: {
    difficulty: 'beginner',
    stars: 1,
    comment: '山頂直下を1周約30分で周回。日本最古の人工林や牧野富太郎博士の記念碑が見どころ。',
  },
  route_6: {
    difficulty: 'intermediate',
    stars: 4,
    comment: '清流沿いを登る沢道。飛び石渡りやぬかるみがあるため、防水性のあるトレイルシューズ推奨。',
  },
  route_inariyama: {
    difficulty: 'advanced',
    stars: 5,
    comment: '尾根伝いに登る本格登山道。木の根や階段が多く登りごたえ抜群。見晴らし台からの眺望が絶景。',
  },
  route_jinba: {
    difficulty: 'advanced',
    stars: 6,
    comment: '奥高尾を満喫する約15km・約4時間半のロング縦走。早朝出発・十分な飲料とトレッキング装備が必須。',
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

  // Route settings (difficulty, 6-star rating, staff comments)
  routeSettings: Record<string, RouteAdminSetting>;
  updateRouteSetting: (routeId: string, updates: Partial<RouteAdminSetting>) => void;
  resetRouteSettings: () => void;

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

      routeSettings: DEFAULT_ROUTE_SETTINGS,
      updateRouteSetting: (routeId, updates) =>
        set((s) => ({
          routeSettings: {
            ...s.routeSettings,
            [routeId]: {
              ...(s.routeSettings[routeId] ?? DEFAULT_ROUTE_SETTINGS[routeId] ?? { difficulty: 'beginner', stars: 1 }),
              ...updates,
            },
          },
          lastSavedAt: new Date().toISOString(),
        })),
      resetRouteSettings: () =>
        set({
          routeSettings: DEFAULT_ROUTE_SETTINGS,
          lastSavedAt: new Date().toISOString(),
        }),

      lastSavedAt: null,
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
    }),
    {
      name: 'salomon-admin-store',
      // Only persist data, not functions
      partialize: (s) => ({
        heroMessages: s.heroMessages,
        products: s.products,
        routeSettings: s.routeSettings,
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
        if (!state.routeSettings) {
          state.routeSettings = DEFAULT_ROUTE_SETTINGS;
        } else {
          state.routeSettings = { ...DEFAULT_ROUTE_SETTINGS, ...state.routeSettings };
        }
      },
    }
  )
);

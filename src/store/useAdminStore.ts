import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS } from '@/data/products';
import type { Product, RouteAdminSetting, Difficulty, WeatherManualOverride } from '@/types';

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

export const DEFAULT_WEATHER_OVERRIDE: WeatherManualOverride = {
  enabled: false,
  temp_c: 21,
  weather: '晴れ',
  weatherCode: 'sunny',
  windSpeed: 2.5,
  rainProbability: 10,
  precipitationMmh: 0,
  uvIndex: 4,
  visibility: 15,
  customNotice: '',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_ROUTE_SETTINGS: Record<string, RouteAdminSetting> = {
  route_1: {
    difficulty: 'beginner',
    stars: 1, // ★☆☆☆☆☆ (Screenshot reference)
    comment: '【表参道】全線舗装路で茶屋やトイレが充実（5箇所・ベビーベッド有）。スニーカーや普段着でも安心の定番ルート。名物天狗焼やごまだんごがおすすめ！',
    comment_en: 'Fully paved main trail to Yakuo-in Temple. Well-equipped with 5 rest spots & baby amenities. Safe for sneakers and beginners. Enjoy famous Tengu-yaki dumplings!',
    comment_zh: '通往药王院的经典表参道，全程铺装路面，沿途茶社与洗手间齐全（共5处）。普通运动鞋即可轻松体验，推荐品尝招牌天狗烧！',
  },
  route_2: {
    difficulty: 'beginner',
    stars: 1, // ★☆☆☆☆☆ (Screenshot reference)
    comment: '【霞台ループ】高尾山駅周辺を1周約40分。南斜面の暖帯常緑樹と北斜面の落葉樹の植生変化を観察できる緩やか散策路。',
    comment_en: 'Gentle 40-minute loop around Takaosan Station. Great for observing diverse vegetation between warm south and cool north slopes.',
    comment_zh: '环绕高尾山缆车站约40分钟的平缓环线，可近距离对比南坡常绿林与北坡落叶林丰富的植被生态。',
  },
  route_3: {
    difficulty: 'beginner',
    stars: 2, // ★★☆☆☆☆ (Screenshot reference)
    comment: '【かつら林】静寂と美しいカツラ巨木林が広がる自然道。混雑を避けてゆっくり森林浴を楽しみたい方におすすめ。一部未舗装・軽登山靴推奨。',
    comment_en: 'Quiet forest path with giant Katsura trees. Ideal for escaping crowds and enjoying peaceful forest bathing. Light hiking shoes recommended.',
    comment_zh: '连香树巨木成荫的宁静林道。适合避开主峰人流、悠闲享受森林浴。部分路面未铺装，推荐穿着轻量徒步鞋。',
  },
  route_4: {
    difficulty: 'beginner',
    stars: 2, // ★★☆☆☆☆ (Screenshot reference)
    comment: '【吊り橋】高尾山唯一の吊り橋「みやま橋」が大人気。ブナやカエデの原生林に包まれる爽快コース。2024年路面改修済。',
    comment_en: 'Features the famous Miyama Suspension Bridge surrounded by pristine beech and maple forest. Path renovated in 2024 for enhanced safety.',
    comment_zh: '途经高尾山唯一的深山吊桥（全长36米），穿行于山毛榉与红枫原始林之中，风景优美爽快。2024年路面翻新后更易行走。',
  },
  route_5: {
    difficulty: 'beginner',
    stars: 1, // ★☆☆☆☆☆ (Screenshot reference)
    comment: '【山頂ループ】山頂直下を1周約30分で周回する平坦路。日本最古の人工林「江川杉」や牧野富太郎博士の記念碑が見どころ。',
    comment_en: 'Comfortable 30-minute level loop just below the summit. Features Japan oldest 150-yr artificial cedar forest and botanical monuments.',
    comment_zh: '位于山顶正下方约30分钟的平缓环形路，拥有树龄逾150年的江川古杉人工林与植物学家纪念碑。',
  },
  route_6: {
    difficulty: 'intermediate',
    stars: 4, // ★★★★☆☆ (Screenshot reference)
    comment: '【水のコース】清流沿いを登る沢道。琵琶滝や飛び石渡りがあり夏も涼しいですが、濡れた岩場やぬかるみがあるため防水トレイルシューズ推奨！',
    comment_en: 'Scenic stream trail with stepping stones past Biwa Waterfall. Surfaces can be wet and muddy; waterproof trail running shoes strongly recommended.',
    comment_zh: '沿清澈溪流向上的溯溪步道，途经琵琶瀑布与踏石过溪段。清凉怡人但多泥泞湿滑，强烈建议穿着防水抓地越野鞋！',
  },
  route_inariyama: {
    difficulty: 'advanced',
    stars: 5, // ★★★★★☆ (Screenshot reference)
    comment: '【尾根道】南側尾根伝いに登る本格登山道。階段や木の根が多く登りごたえ抜群。中腹の稲荷山展望台からは新宿副都心や横浜方面を一望できます。',
    comment_en: 'Authentic southern ridge trail with natural steps and tree roots. Superb panoramic views of Tokyo & Yokohama from the observation deck.',
    comment_zh: '沿南侧山脊攀升的经典硬核路线，木阶梯与盘根树根较多。半山腰观景台可一览新宿与横滨的辽阔全景。',
  },
  route_jinba: {
    difficulty: 'advanced',
    stars: 6, // ★★★★★★ (Screenshot reference)
    comment: '【奥高尾縦走】高尾山頂から陣馬山へ至る約15.3km・約4時間半のロングトレイル。小仏城山のなめこ汁や景信山の絶景。早朝出発・登山装備必須！',
    comment_en: 'Challenging 15.3km / 4.5h traverse across Okutakao ridge to Mt. Jinba summit. Early departure, ample hydration, and trail hiking gear required.',
    comment_zh: '纵贯奥高尾约15.3公里（约4.5小时）的长距离专业大纵走。尽享城山热汤与阵马山白马峰顶。需备齐饮水、补给及专业装备。',
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

  // Route settings (difficulty, 6-star rating, staff comments, custom times)
  routeSettings: Record<string, RouteAdminSetting>;
  updateRouteSetting: (routeId: string, updates: Partial<RouteAdminSetting>) => void;
  resetRouteSettings: () => void;

  // Manual Weather Override ("なんなら天気も！ 自動取得出来なかった時のために全て手作業で行えるように")
  weatherOverride: WeatherManualOverride;
  setWeatherOverride: (updates: Partial<WeatherManualOverride>) => void;
  toggleWeatherOverride: (enabled?: boolean) => void;
  resetWeatherOverride: () => void;

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

      weatherOverride: DEFAULT_WEATHER_OVERRIDE,
      setWeatherOverride: (updates) =>
        set((s) => ({
          weatherOverride: {
            ...s.weatherOverride,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
          lastSavedAt: new Date().toISOString(),
        })),
      toggleWeatherOverride: (enabled) =>
        set((s) => ({
          weatherOverride: {
            ...s.weatherOverride,
            enabled: enabled !== undefined ? enabled : !s.weatherOverride.enabled,
            updatedAt: new Date().toISOString(),
          },
          lastSavedAt: new Date().toISOString(),
        })),
      resetWeatherOverride: () =>
        set({
          weatherOverride: DEFAULT_WEATHER_OVERRIDE,
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
        weatherOverride: s.weatherOverride,
        lastSavedAt: s.lastSavedAt,
      }),
      // Migrate legacy state
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
        if (!state.weatherOverride) {
          state.weatherOverride = DEFAULT_WEATHER_OVERRIDE;
        }
      },
    }
  )
);

import { create } from 'zustand';
import type {
  WeatherData,
  Route,
  Difficulty,
  ChatMessage,
  Product,
  ActiveModal,
} from '@/types';
import { ROUTES } from '@/data/routes';

interface AppState {
  // Weather
  weather: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  setWeather: (weather: WeatherData | null) => void;
  setWeatherLoading: (loading: boolean) => void;
  setWeatherError: (error: string | null) => void;
  /** Incremented to trigger a re-fetch of weather from ConciergeApp */
  weatherRefreshTick: number;
  refreshWeather: () => void;

  // Route Selection
  selectedRoute: Route | null;
  selectedDifficulty: Difficulty | null;
  setSelectedRoute: (route: Route | null) => void;
  setSelectedDifficulty: (difficulty: Difficulty | null) => void;

  // Chat
  messages: ChatMessage[];
  isGenerating: boolean;
  addMessage: (message: ChatMessage) => void;
  setIsGenerating: (generating: boolean) => void;
  clearMessages: () => void;

  // Products
  recommendedProducts: Product[];
  setRecommendedProducts: (products: Product[]) => void;

  // UI & Localization
  language: 'ja' | 'en' | 'zh';
  setLanguage: (language: 'ja' | 'en' | 'zh') => void;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
}

export const useStore = create<AppState>((set) => ({
  // Weather
  weather: null,
  weatherLoading: false,
  weatherError: null,
  weatherRefreshTick: 0,
  setWeather: (weather) => set({ weather }),
  setWeatherLoading: (weatherLoading) => set({ weatherLoading }),
  setWeatherError: (weatherError) => set({ weatherError }),
  refreshWeather: () => set(s => ({ weatherRefreshTick: s.weatherRefreshTick + 1 })),

  // Route Selection (default to 1号路 beginner for kiosk signage display)
  selectedRoute: ROUTES[0],
  selectedDifficulty: 'beginner',
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),

  // Chat
  messages: [],
  isGenerating: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  clearMessages: () => set({ messages: [] }),

  // Products
  recommendedProducts: [],
  setRecommendedProducts: (recommendedProducts) => set({ recommendedProducts }),

  // UI & Localization
  language: 'ja',
  setLanguage: (language) => set({ language }),
  activeModal: null,
  setActiveModal: (activeModal) => set({ activeModal }),
}));

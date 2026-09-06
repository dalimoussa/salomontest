import { create } from 'zustand';

export type RouteHighlight = string | null;

interface MapState {
  /** Which trail route_id is highlighted on the map (mirrors selectedRoute.id in main store) */
  highlightedRouteId: RouteHighlight;
  /** Whether the rain overlay is visible (driven by precipitation data, can also be manually toggled) */
  isRainOverlayVisible: boolean;
  /** mm/h rain intensity derived from weather data, drives particle density */
  rainIntensityMmh: number;
  /** Camera has been moved by the user (suppresses auto-centering on location updates) */
  userMovedCamera: boolean;

  setHighlightedRouteId: (id: RouteHighlight) => void;
  setRainOverlay: (visible: boolean, intensityMmh?: number) => void;
  setUserMovedCamera: (moved: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  highlightedRouteId: null,
  isRainOverlayVisible: false,
  rainIntensityMmh: 0,
  userMovedCamera: false,

  setHighlightedRouteId: (highlightedRouteId) => set({ highlightedRouteId }),
  setRainOverlay: (visible, intensityMmh = 0) =>
    set({ isRainOverlayVisible: visible, rainIntensityMmh: intensityMmh }),
  setUserMovedCamera: (userMovedCamera) => set({ userMovedCamera }),
}));

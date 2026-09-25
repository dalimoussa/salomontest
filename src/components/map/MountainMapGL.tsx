'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Map,
  Popup,
  AttributionControl,
  addProtocol,
  type LngLatLike,
  type FilterSpecification,
  type StyleSpecification,
  type MapMouseEvent,
  type MapGeoJSONFeature,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';
import type { FeatureCollection } from 'geojson';
import { useStore } from '@/store/useStore';
import { useMapStore } from '@/store/mapStore';
import { useAdminStore } from '@/store/useAdminStore';
import { ROUTES } from '@/data/routes';
import { getRecommendedProducts, getCurrentSeason } from '@/data/products';
import { getWaypointsForRoute } from '@/data/routeWaypoints';
import { TAKAO_TRAILS_GEOJSON } from '@/data/takaoTrailsGeoJson';
import { SURROUNDING_TRAILS_GEOJSON } from '@/data/surroundingTrailsGeoJson';
import { TAKAO_POIS_GEOJSON } from '@/data/takaoPoisGeoJson';

const TAKAO_SUMMIT: LngLatLike = [139.2485, 35.6275];

const TRAIL_SOURCE                = 'takao-trails-source';
const TRAIL_CASING_LAYER          = 'trail-lines-casing';
const TRAIL_LINE_LAYER            = 'trail-lines';
const TRAIL_HIT_LAYER             = 'trail-lines-hit';
const TRAIL_HIGHLIGHT_GLOW        = 'trail-highlight-glow';
const TRAIL_HIGHLIGHT_INNER       = 'trail-highlight-inner';
const TRAIL_HIGHLIGHT_LAYER       = 'trail-highlight';
const TRAIL_HIGHLIGHT_DASH        = 'trail-highlight-dash';

const SURROUNDING_TRAIL_SOURCE    = 'surrounding-trails-source';
const SURROUNDING_TRAIL_LAYER     = 'surrounding-trails-layer';
const SURROUNDING_HIGHLIGHT_GLOW  = 'surrounding-trail-highlight-glow';
const SURROUNDING_HIGHLIGHT_LAYER = 'surrounding-trail-highlight';

const POI_SOURCE            = 'takao-pois-source';
const POI_POINT_OUTER_LAYER = 'poi-points-outer';
const POI_POINT_LAYER       = 'poi-points';
const POI_LABEL_LAYER       = 'poi-labels';

const WAYPOINT_SOURCE       = 'route-waypoints-source';
const WAYPOINT_OUTER_LAYER  = 'route-waypoint-outer-layer';
const WAYPOINT_CIRCLE_LAYER = 'route-waypoint-circle-layer';
const WAYPOINT_LABEL_LAYER  = 'route-waypoint-label-layer';

// Route colors matching the kiosk neon-on-dark design system
const ROUTE_COLOR_MAP: Record<string, string> = {
  route_1:          '#0AFFE0', // Bright cyan (Omotesando)
  route_2:          '#4ADE80', // Mint green (Kasumidai Loop)
  route_3:          '#38BDF8', // Sky blue (Katsura grove)
  route_4:          '#A78BFA', // Purple (Suspension bridge)
  route_5:          '#F472B6', // Pink (Summit Loop)
  route_6:          '#FACC15', // Yellow (Biwataki)
  inariyama:        '#00C8FF', // Ice blue (Inariyama)
  route_inariyama:  '#00C8FF',
  route_3_traverse: '#FB923C', // Amber orange (Kagenobuyama)
  route_kagenobu:   '#FB923C',
  route_jinba:      '#E8002D', // Salomon red (Jinba traverse)
  path_segment:     'rgba(255,255,255,0.4)',
};

// Preset camera viewing angles tailored to each course/trail for 110" 4K impact
// Centered and elevated to keep trails prominently visible in the safe upper-central corridor
const ROUTE_CAMERA_VIEWS: Record<string, { center: [number, number]; zoom: number; pitch: number; bearing: number }> = {
  route_1:          { center: [139.2555, 35.6300], zoom: 14.3, pitch: 56, bearing: -20 },
  route_2:          { center: [139.2546, 35.6300], zoom: 15.3, pitch: 52, bearing: -18 },
  route_3:          { center: [139.2488, 35.6261], zoom: 15.0, pitch: 55, bearing: -24 },
  route_4:          { center: [139.2485, 35.6279], zoom: 15.1, pitch: 57, bearing: -28 },
  route_5:          { center: [139.2431, 35.6247], zoom: 15.8, pitch: 50, bearing: -15 },
  route_6:          { center: [139.2558, 35.6266], zoom: 14.3, pitch: 58, bearing: -15 },
  route_inariyama:  { center: [139.2554, 35.6261], zoom: 14.3, pitch: 58, bearing: -22 },
  inariyama:        { center: [139.2554, 35.6261], zoom: 14.3, pitch: 58, bearing: -22 },
  route_kagenobu:   { center: [139.2150, 35.6360], zoom: 12.8, pitch: 60, bearing: -30 },
  route_3_traverse: { center: [139.2150, 35.6360], zoom: 12.8, pitch: 60, bearing: -30 },
  route_jinba:      { center: [139.2000, 35.6420], zoom: 11.8, pitch: 62, bearing: -35 },

  // Surrounding trails
  trail_gongen:     { center: [139.262, 35.608], zoom: 13.2, pitch: 60, bearing: -10 },
  trail_minamitakao:{ center: [139.268, 35.620], zoom: 13.8, pitch: 58, bearing: -15 },
  trail_misawa:     { center: [139.266, 35.605], zoom: 13.4, pitch: 59, bearing: -20 },
  trail_kitaapproach:{ center: [139.248, 35.648], zoom: 13.8, pitch: 55, bearing: -25 },
  trail_taiko:      { center: [139.252, 35.655], zoom: 13.6, pitch: 57, bearing: -30 },
  trail_kogezawa:   { center: [139.238, 35.642], zoom: 13.7, pitch: 58, bearing: -28 },
  trail_tengu:      { center: [139.230, 35.630], zoom: 12.6, pitch: 62, bearing: -32 },
  trail_meio:       { center: [139.198, 35.635], zoom: 12.8, pitch: 60, bearing: -35 },
};

// GSI Official Tile Sources
const GSI_PHOTO_TILE = 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';

interface SunSkyConfig {
  skyColor: string;
  horizonColor: string;
  fogColor: string;
  lightColor: string;
  lightIntensity: number;
  lightPosition: [number, number, number]; // [radial, azimuthal, polar]
}

/**
 * Computes dynamic CG sun & sky parameters based on local hour
 */
function getSunSkyConfig(hour: number): SunSkyConfig {
  if (hour >= 6 && hour < 10) {
    // Morning: warm golden side-light (#FFE0B2)
    return {
      skyColor: '#1A233A',
      horizonColor: '#4A3B32',
      fogColor: '#2C2224',
      lightColor: '#FFE0B2',
      lightIntensity: 0.65,
      lightPosition: [1.5, 80, 45],
    };
  } else if (hour >= 10 && hour < 15) {
    // Midday: high-noon crisp light with rich blue sky (#0A1E3F)
    return {
      skyColor: '#0A1E3F',
      horizonColor: '#16325C',
      fogColor: '#0D2140',
      lightColor: '#FFFFFF',
      lightIntensity: 0.85,
      lightPosition: [1.5, 180, 75],
    };
  } else if (hour >= 15 && hour < 18) {
    // Afternoon / Sunset: dramatic amber horizon with purple atmospheric tint
    return {
      skyColor: '#1E1233',
      horizonColor: '#7C3A27',
      fogColor: '#451D2C',
      lightColor: '#FFB74D',
      lightIntensity: 0.70,
      lightPosition: [1.5, 255, 30],
    };
  } else {
    // Evening / Night: deep navy twilight with illuminated pins
    return {
      skyColor: '#060B18',
      horizonColor: '#0C162E',
      fogColor: '#091024',
      lightColor: '#90CAF9',
      lightIntensity: 0.35,
      lightPosition: [1.5, 210, 20],
    };
  }
}

/** Maps app route IDs to GeoJSON feature route_id values */
function routeIdToGeoJsonId(routeId: string): string | null {
  const idMap: Record<string, string> = {
    route_1:          'route_1',
    route_2:          'route_2',
    route_3:          'route_3',
    route_4:          'route_4',
    route_5:          'route_5',
    route_6:          'route_6',
    route_inariyama:  'inariyama',
    inariyama:        'inariyama',
    route_kagenobu:   'route_3_traverse',
    route_3_traverse: 'route_3_traverse',
    route_jinba:      'route_jinba',
  };
  return idMap[routeId] ?? routeId;
}

/** Maps GeoJSON feature route_id values back to app route IDs */
function geoJsonIdToAppRouteId(geoJsonId: string): string {
  const reverseMap: Record<string, string> = {
    route_1:          'route_1',
    route_2:          'route_2',
    route_3:          'route_3',
    route_4:          'route_4',
    route_5:          'route_5',
    route_6:          'route_6',
    inariyama:        'route_inariyama',
    route_inariyama:  'route_inariyama',
    route_3_traverse: 'route_kagenobu',
    route_kagenobu:   'route_kagenobu',
    route_jinba:      'route_jinba',
  };
  return reverseMap[geoJsonId] ?? geoJsonId;
}

function buildWaypointGeoJson(routeId: string, lang: 'ja' | 'en' | 'zh'): FeatureCollection {
  const wps = getWaypointsForRoute(routeId);
  return {
    type: 'FeatureCollection',
    features: wps.map((wp) => {
      const wpName = lang === 'en' ? wp.nameEn : lang === 'zh' ? (wp.nameZh || wp.name) : wp.name;
      return {
        type: 'Feature',
        properties: {
          id: wp.id,
          seq: wp.seq.toString(),
          label: `${wp.seq}. ${wpName} (${wp.altitude})`,
          isLandmark: wp.isLandmark ? 'true' : 'false',
        },
        geometry: {
          type: 'Point',
          coordinates: wp.coordinates,
        },
      };
    }),
  };
}

function buildMapStyle(sunSky: SunSkyConfig, initialGeoId: string, initialLang: 'ja' | 'en' | 'zh'): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'gsi-photo': {
        type: 'raster',
        tiles: [GSI_PHOTO_TILE],
        tileSize: 256,
        attribution: '© 国土地理院',
        maxzoom: 18,
      },
      [TRAIL_SOURCE]: {
        type: 'geojson',
        data: TAKAO_TRAILS_GEOJSON,
      },
      [SURROUNDING_TRAIL_SOURCE]: {
        type: 'geojson',
        data: SURROUNDING_TRAILS_GEOJSON,
      },
      [POI_SOURCE]: {
        type: 'geojson',
        data: TAKAO_POIS_GEOJSON,
      },
      [WAYPOINT_SOURCE]: {
        type: 'geojson',
        data: buildWaypointGeoJson('route_1', initialLang),
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#080E20' },
      },
      {
        id: 'gsi-photo-layer',
        type: 'raster',
        source: 'gsi-photo',
        paint: {
          'raster-opacity': 1.0,
          'raster-resampling': 'linear',
          'raster-fade-duration': 100,
        },
      },
      // ── 1. Trail lines base casing (dark underlayer ensures contrast against all terrain) ──
      {
        id: TRAIL_CASING_LAYER,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#020617',
          'line-width': 8.5,
          'line-opacity': 0.85,
          'line-blur': 1,
        },
      },
      // ── 2. Surrounding trails ──
      {
        id: SURROUNDING_TRAIL_LAYER,
        type: 'line',
        source: SURROUNDING_TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#38BDF8'],
          'line-width': 4.0,
          'line-opacity': 0.85,
          'line-dasharray': [2, 1],
        },
      },
      // ── 3. Base official trail lines (Vivid neon colors matching reference PoC) ──
      {
        id: TRAIL_LINE_LAYER,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': [
            'match', ['get', 'route_id'],
            'route_1',          ROUTE_COLOR_MAP.route_1,
            'route_2',          ROUTE_COLOR_MAP.route_2,
            'route_3',          ROUTE_COLOR_MAP.route_3,
            'route_4',          ROUTE_COLOR_MAP.route_4,
            'route_5',          ROUTE_COLOR_MAP.route_5,
            'route_6',          ROUTE_COLOR_MAP.route_6,
            'inariyama',        ROUTE_COLOR_MAP.inariyama,
            'route_inariyama',  ROUTE_COLOR_MAP.inariyama,
            'route_3_traverse', ROUTE_COLOR_MAP.route_3_traverse,
            'route_jinba',      ROUTE_COLOR_MAP.route_jinba,
            '#0AFFE0',
          ],
          'line-width': 5.5,
          'line-opacity': 0.95,
        },
      },
      // ── 4. Highlighted Surrounding Trail ──
      {
        id: SURROUNDING_HIGHLIGHT_GLOW,
        type: 'line',
        source: SURROUNDING_TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['==', ['get', 'route_id'], ''],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#0AFFE0'],
          'line-width': 28,
          'line-opacity': 0.75,
          'line-blur': 12,
        },
      },
      {
        id: SURROUNDING_HIGHLIGHT_LAYER,
        type: 'line',
        source: SURROUNDING_TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['==', ['get', 'route_id'], ''],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#0AFFE0'],
          'line-width': 7.0,
          'line-opacity': 1.0,
        },
      },
      // ── 5. Highlighted Official Trail Multi-Layer Glow (Reference PoC standard) ──
      {
        id: TRAIL_HIGHLIGHT_GLOW,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['==', ['get', 'route_id'], initialGeoId],
        paint: {
          'line-color': '#0AFFE0',
          'line-width': 32,
          'line-opacity': 0.85,
          'line-blur': 12,
        },
      },
      {
        id: TRAIL_HIGHLIGHT_INNER,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['==', ['get', 'route_id'], initialGeoId],
        paint: {
          'line-color': '#E0FFFF',
          'line-width': 14,
          'line-opacity': 0.95,
          'line-blur': 3,
        },
      },
      {
        id: TRAIL_HIGHLIGHT_LAYER,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['==', ['get', 'route_id'], initialGeoId],
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 5.5,
          'line-opacity': 1.0,
        },
      },
      {
        id: TRAIL_HIGHLIGHT_DASH,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        filter: ['==', ['get', 'route_id'], initialGeoId],
        paint: {
          'line-color': '#0AFFE0',
          'line-width': 7.5,
          'line-opacity': 1.0,
          'line-dasharray': [1, 2],
        },
      },
      // ── 6. Touch Hit-Target for 110" Screen ──
      {
        id: TRAIL_HIT_LAYER,
        type: 'line',
        source: TRAIL_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-width': 28,
          'line-opacity': 0,
        },
      },
      // ── 7. POI Beacon Rings & Core ──
      {
        id: POI_POINT_OUTER_LAYER,
        type: 'circle',
        source: POI_SOURCE,
        paint: {
          'circle-radius': [
            'match', ['get', 'category'],
            'summit', 18,
            'transit', 14,
            'temple', 14,
            12,
          ],
          'circle-color': [
            'match', ['get', 'category'],
            'summit', 'rgba(10, 255, 224, 0.3)',
            'transit', 'rgba(0, 200, 255, 0.3)',
            'temple', 'rgba(251, 146, 60, 0.3)',
            'teahouse', 'rgba(250, 204, 21, 0.3)',
            'rgba(255, 255, 255, 0.25)',
          ],
          'circle-stroke-color': [
            'match', ['get', 'category'],
            'summit', '#0AFFE0',
            'transit', '#00C8FF',
            'temple', '#FB923C',
            'teahouse', '#FACC15',
            '#FFFFFF',
          ],
          'circle-stroke-width': 2.5,
        },
      },
      {
        id: POI_POINT_LAYER,
        type: 'circle',
        source: POI_SOURCE,
        paint: {
          'circle-radius': [
            'match', ['get', 'category'],
            'summit', 7,
            'transit', 5,
            'temple', 5,
            4,
          ],
          'circle-color': '#FFFFFF',
        },
      },
      {
        id: POI_LABEL_LAYER,
        type: 'symbol',
        source: POI_SOURCE,
        layout: {
          'text-field': [
            'concat',
            [
              'match', ['get', 'icon'],
              'toilet', '🚻 ',
              'coffee', '🍵 ',
              'parking', '🅿️ ',
              'cablecar', '🚡 ',
              'mountain', '⛰️ ',
              'shrine', '⛩️ ',
              'water', '💧 ',
              '📍 '
            ],
            ['get', 'name'],
            ' (',
            ['get', 'altitude'],
            ')'
          ],
          'text-size': [
            'match', ['get', 'category'],
            'summit', 14,
            'transit', 12,
            'temple', 12,
            11,
          ],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-font': ['Noto Sans Regular'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#080E20',
          'text-halo-width': 2.5,
        },
      },
      // ── 8. Route Sequence Waypoint Markers ──
      {
        id: WAYPOINT_OUTER_LAYER,
        type: 'circle',
        source: WAYPOINT_SOURCE,
        paint: {
          'circle-radius': 14,
          'circle-color': 'rgba(10, 255, 224, 0.25)',
          'circle-stroke-color': '#0AFFE0',
          'circle-stroke-width': 2,
        },
      },
      {
        id: WAYPOINT_CIRCLE_LAYER,
        type: 'circle',
        source: WAYPOINT_SOURCE,
        paint: {
          'circle-radius': 8,
          'circle-color': '#0AFFE0',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 1.5,
        },
      },
      {
        id: WAYPOINT_LABEL_LAYER,
        type: 'symbol',
        source: WAYPOINT_SOURCE,
        layout: {
          'text-field': ['get', 'label'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-font': ['Noto Sans Regular'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#E0FFFF',
          'text-halo-color': '#080E20',
          'text-halo-width': 2.5,
        },
      },
    ],
  };
}

interface MountainMapGLProps {
  onMapReady: (map: Map) => void;
}

export function MountainMapGL({ onMapReady }: MountainMapGLProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<Map | null>(null);
  const popupRef       = useRef<Popup | null>(null);
  const animFrameRef   = useRef<number | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  const selectedRoute          = useStore((s) => s.selectedRoute);
  const setSelectedRoute       = useStore((s) => s.setSelectedRoute);
  const setSelectedDifficulty  = useStore((s) => s.setSelectedDifficulty);
  const setRecommendedProducts = useStore((s) => s.setRecommendedProducts);
  const addMessage             = useStore((s) => s.addMessage);
  const language               = useStore((s) => s.language);
  const weather                = useStore((s) => s.weather);
  const highlightedRouteId     = useMapStore((s) => s.highlightedRouteId);
  const setUserMovedCamera     = useMapStore((s) => s.setUserMovedCamera);
  const isRainOverlayVisible   = useMapStore((s) => s.isRainOverlayVisible);
  const routeSettings          = useAdminStore((s) => s.routeSettings);

  const languageRef = useRef(language);
  languageRef.current = language;

  const selectedRouteRef = useRef(selectedRoute);
  selectedRouteRef.current = selectedRoute;

  const routeSettingsRef = useRef(routeSettings);
  routeSettingsRef.current = routeSettings;

  const setSelectedRouteRef = useRef(setSelectedRoute);
  setSelectedRouteRef.current = setSelectedRoute;

  const setSelectedDifficultyRef = useRef(setSelectedDifficulty);
  setSelectedDifficultyRef.current = setSelectedDifficulty;

  const setRecommendedProductsRef = useRef(setRecommendedProducts);
  setRecommendedProductsRef.current = setRecommendedProducts;

  const addMessageRef = useRef(addMessage);
  addMessageRef.current = addMessage;

  const weatherRef = useRef(weather);
  weatherRef.current = weather;

  // ── Map initialisation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hour = new Date().getHours();
    const sunSky = getSunSkyConfig(hour);
    const initRouteId = selectedRouteRef.current?.id ?? 'route_1';
    const initGeoId = routeIdToGeoJsonId(initRouteId) ?? 'route_1';

    let map: Map;
    try {
      map = new Map({
        container: containerRef.current!,
        style: buildMapStyle(sunSky, initGeoId, languageRef.current),
        center: TAKAO_SUMMIT,
        zoom: 13.8,
        pitch: 58,
        bearing: -22,
        maxPitch: 85,
        dragRotate: true,
        pitchWithRotate: true,
        touchPitch: true,
        touchZoomRotate: true,
        attributionControl: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isWebGl = msg.toLowerCase().includes('webgl') || msg.toLowerCase().includes('gpu');
      setWebglError(
        isWebGl
          ? 'お使いの環境では3Dマップ（WebGL）が利用できません。Chromeまたは最新ブラウザでアクセスしてください。'
          : '3Dマップの初期化に失敗しました。ページを再読み込みしてください。'
      );
      console.error('MapLibre init error:', err);
      return;
    }

    const canvas = map.getCanvas();
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    canvas.addEventListener('contextmenu', handleContextMenu);

    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

    map.on('error', (e) => {
      console.warn('MapLibre event error:', e);
    });

    map.on('dragstart', () => setUserMovedCamera(true));
    map.on('zoomstart', () => setUserMovedCamera(true));

    map.on('load', async () => {
      // ── High-Resolution GSI DEM5A 3D Terrain Elevation ──
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const gsiTerrainSource = useGsiTerrainSource(addProtocol, {
          tileUrl: `${origin}/api/dem-tile/{z}/{x}/{y}`,
          maxzoom: 15,
          attribution: '© 国土地理院 (DEM5A/10B)',
        });
        map.addSource('gsi-dem', gsiTerrainSource as any);
        map.setTerrain({ source: 'gsi-dem', exaggeration: 1.65 });
      } catch (err) {
        console.warn('GSI terrain source init error:', err);
      }

      // Dynamic 3D Directional Sunlight
      try {
        (map as any).setLight?.({
          anchor: 'viewport',
          color: sunSky.lightColor,
          intensity: sunSky.lightIntensity,
          position: sunSky.lightPosition,
        });
      } catch {
        // light is optional
      }

      // ── Trail Interactive Click & Selection Listener ──
      const handleTrailClick = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const rawId = (feature.properties?.route_id || feature.properties?.id) as string | undefined;
        if (!rawId) return;

        const targetAppId = geoJsonIdToAppRouteId(rawId);
        const foundRoute = ROUTES.find((r) => r.id === targetAppId) || ROUTES.find((r) => r.id === rawId);
        if (!foundRoute) return;

        setSelectedRouteRef.current(foundRoute);
        const effDiff = routeSettingsRef.current[foundRoute.id]?.difficulty ?? foundRoute.difficulty;
        setSelectedDifficultyRef.current(effDiff);

        const season = getCurrentSeason();
        const weatherCode = weatherRef.current?.weatherCode ?? 'partly_cloudy';
        const lang = languageRef.current;
        const products = getRecommendedProducts(effDiff, weatherCode, season, [], 3, foundRoute.category, lang);
        setRecommendedProductsRef.current(products);

        if (popupRef.current) popupRef.current.remove();
        const title = lang === 'en' ? foundRoute.name_en : lang === 'zh' ? (foundRoute.name_zh || foundRoute.name) : foundRoute.name;
        const popupContent = document.createElement('div');
        popupContent.className = 'trail-popup-card';
        popupContent.innerHTML = `
          <div style="background:rgba(8,14,32,0.94); backdrop-filter:blur(14px); border:1.5px solid rgba(10,255,224,0.7); border-radius:12px; padding:12px 14px; min-width:220px; color:#fff; font-family:sans-serif; box-shadow:0 10px 28px rgba(0,0,0,0.8);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:14px; font-weight:bold; color:#0AFFE0;">${title}</span>
              <span style="font-size:10px; background:rgba(10,255,224,0.18); color:#0AFFE0; padding:2px 7px; border-radius:4px; font-weight:bold; font-family:monospace;">${foundRoute.distanceKm}km</span>
            </div>
            <div style="display:flex; gap:12px; font-size:11px; color:#cbd5e1; margin-bottom:6px;">
              <span>⏱️ 約${foundRoute.durationMin}分</span>
              <span>📈 標高差 ${foundRoute.elevationM}m</span>
            </div>
            <div style="font-size:10px; color:#94a3b8; line-height:1.3;">
              ${lang === 'en' ? 'Route selected & equipment updated' : lang === 'zh' ? '路线已选择并更新推荐装备' : 'ルート選択完了・おすすめ装備更新'}
            </div>
          </div>
        `;

        popupRef.current = new Popup({ closeButton: true, closeOnClick: true, offset: 12 })
          .setLngLat(e.lngLat)
          .setDOMContent(popupContent)
          .addTo(map);

        addMessageRef.current({
          id: `trail-select-${Date.now()}`,
          role: 'ai',
          text: `🗺️ 【${foundRoute.name}】が選択されました（距離: ${foundRoute.distanceKm}km / 所要時間: 約${foundRoute.durationMin}分 / 標高差: ${foundRoute.elevationM}m）。下部に最適なSalomon推奨装備を表示しています。`,
          products,
          timestamp: new Date(),
        });
      };

      const setPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
      const resetPointer = () => { map.getCanvas().style.cursor = ''; };

      map.on('click', TRAIL_LINE_LAYER, handleTrailClick);
      map.on('click', TRAIL_HIT_LAYER, handleTrailClick);
      map.on('click', TRAIL_HIGHLIGHT_LAYER, handleTrailClick);
      map.on('click', SURROUNDING_TRAIL_LAYER, handleTrailClick);
      map.on('click', SURROUNDING_HIGHLIGHT_LAYER, handleTrailClick);

      map.on('mouseenter', TRAIL_LINE_LAYER, setPointer);
      map.on('mouseleave', TRAIL_LINE_LAYER, resetPointer);
      map.on('mouseenter', TRAIL_HIT_LAYER, setPointer);
      map.on('mouseleave', TRAIL_HIT_LAYER, resetPointer);
      map.on('mouseenter', TRAIL_HIGHLIGHT_LAYER, setPointer);
      map.on('mouseleave', TRAIL_HIGHLIGHT_LAYER, resetPointer);
      map.on('mouseenter', SURROUNDING_TRAIL_LAYER, setPointer);
      map.on('mouseleave', SURROUNDING_TRAIL_LAYER, resetPointer);

      // POI Click
      const showPoiPopup = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties as {
          name: string;
          altitude: string;
          description: string;
          status: string;
          statusColor: string;
        };
        const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

        if (popupRef.current) popupRef.current.remove();

        const popupContent = document.createElement('div');
        popupContent.className = 'poi-popup-card';
        popupContent.innerHTML = `
          <div style="background:rgba(8,14,32,0.94); backdrop-filter:blur(14px); border:1.5px solid rgba(0,200,255,0.5); border-radius:12px; padding:12px; min-width:200px; color:#fff; font-family:sans-serif; box-shadow:0 8px 24px rgba(0,0,0,0.7);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:14px; font-weight:bold; color:#0AFFE0;">${props.name}</span>
              <span style="font-size:11px; background:rgba(255,255,255,0.12); padding:2px 6px; border-radius:4px; font-family:monospace;">${props.altitude}</span>
            </div>
            <p style="font-size:11px; color:#cbd5e1; line-height:1.4; margin:0 0 8px 0;">${props.description}</p>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${props.statusColor};"></span>
              <span style="font-size:10px; font-weight:bold; color:${props.statusColor};">${props.status}</span>
            </div>
          </div>
        `;

        popupRef.current = new Popup({ closeButton: true, closeOnClick: true, offset: 15 })
          .setLngLat(coords)
          .setDOMContent(popupContent)
          .addTo(map);
      };

      map.on('click', POI_POINT_LAYER, showPoiPopup);
      map.on('click', POI_LABEL_LAYER, showPoiPopup);
      map.on('mouseenter', POI_POINT_LAYER, setPointer);
      map.on('mouseleave', POI_POINT_LAYER, resetPointer);
      map.on('mouseenter', POI_LABEL_LAYER, setPointer);
      map.on('mouseleave', POI_LABEL_LAYER, resetPointer);

      // ── Initial Camera Framing for Selected Route ──
      const initialRoute = selectedRouteRef.current;
      if (initialRoute && ROUTE_CAMERA_VIEWS[initialRoute.id]) {
        const v = ROUTE_CAMERA_VIEWS[initialRoute.id];
        map.flyTo({
          center: v.center,
          zoom: v.zoom,
          pitch: v.pitch,
          bearing: v.bearing,
          duration: 900,
          essential: true,
          padding: { top: 90, bottom: 290, left: 370, right: 370 },
        });
      }

      // ── Route Progression Animation (Reference PoC standard) ──
      let dashOffset = 0;
      let lastAnimTime = 0;
      const animateRoutePulse = (time: number) => {
        // Run smoothly at ~20 FPS (50ms interval) to deliver a continuous fluid flow with minimal GPU overhead
        if (time - lastAnimTime >= 50) {
          lastAnimTime = time;
          dashOffset = (dashOffset + 0.2) % 4;
          if (mapRef.current && mapRef.current.getLayer(TRAIL_HIGHLIGHT_DASH)) {
            const d1 = Number((0.6 + (dashOffset % 4) * 0.7).toFixed(2));
            const d2 = Number((3.6 - (dashOffset % 4) * 0.7).toFixed(2));
            try {
              mapRef.current.setPaintProperty(TRAIL_HIGHLIGHT_DASH, 'line-dasharray', [d1, d2]);
            } catch {
              // ignore if style is transitioning
            }
          }
        }
        animFrameRef.current = requestAnimationFrame(animateRoutePulse);
      };
      animFrameRef.current = requestAnimationFrame(animateRoutePulse);
    });

    mapRef.current = map;
    onMapReady(map);

    const handleResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 250);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  // onMapReady intentionally excluded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync highlighted route filter & camera position ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyRouteVisuals = () => {
      const routeId = selectedRoute?.id ?? '';
      const isSurrounding = selectedRoute?.category === 'surrounding_trail';

      if (isSurrounding) {
        if (map.getLayer(SURROUNDING_HIGHLIGHT_LAYER)) {
          const filter: FilterSpecification = ['==', ['get', 'route_id'], routeId];
          map.setFilter(SURROUNDING_HIGHLIGHT_LAYER, filter);
          map.setFilter(SURROUNDING_HIGHLIGHT_GLOW, filter);
        }
        if (map.getLayer(TRAIL_HIGHLIGHT_LAYER)) {
          const blankFilter: FilterSpecification = ['==', ['get', 'route_id'], ''];
          map.setFilter(TRAIL_HIGHLIGHT_LAYER, blankFilter);
          map.setFilter(TRAIL_HIGHLIGHT_GLOW, blankFilter);
          map.setFilter(TRAIL_HIGHLIGHT_INNER, blankFilter);
          map.setFilter(TRAIL_HIGHLIGHT_DASH, blankFilter);
        }
      } else {
        const geoJsonRouteId = routeIdToGeoJsonId(routeId);
        const filter: FilterSpecification = geoJsonRouteId
          ? ['==', ['get', 'route_id'], geoJsonRouteId]
          : ['==', ['get', 'route_id'], ''];

        if (map.getLayer(TRAIL_HIGHLIGHT_LAYER)) {
          map.setFilter(TRAIL_HIGHLIGHT_LAYER, filter);
          map.setFilter(TRAIL_HIGHLIGHT_GLOW, filter);
          map.setFilter(TRAIL_HIGHLIGHT_INNER, filter);
          map.setFilter(TRAIL_HIGHLIGHT_DASH, filter);
        }
        if (map.getLayer(SURROUNDING_HIGHLIGHT_LAYER)) {
          const blankFilter: FilterSpecification = ['==', ['get', 'route_id'], ''];
          map.setFilter(SURROUNDING_HIGHLIGHT_LAYER, blankFilter);
          map.setFilter(SURROUNDING_HIGHLIGHT_GLOW, blankFilter);
        }
      }

      // Smoothly fly camera to showcase the selected course across the 3D mountain
      // Viewport padding prevents trail from being obscured by Salomon equipment carousel or side panels
      if (selectedRoute && ROUTE_CAMERA_VIEWS[selectedRoute.id]) {
        const v = ROUTE_CAMERA_VIEWS[selectedRoute.id];
        map.flyTo({
          center: v.center,
          zoom: v.zoom,
          pitch: v.pitch,
          bearing: v.bearing,
          duration: 1200,
          essential: true,
          padding: { top: 90, bottom: 290, left: 370, right: 370 },
        });
      }
    };

    if (map.isStyleLoaded()) {
      applyRouteVisuals();
    } else {
      map.once('styledata', applyRouteVisuals);
    }
  }, [selectedRoute, highlightedRouteId]);

  // ── Sync multilingual POI labels on 3D terrain ────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer(POI_LABEL_LAYER)) {
      const field = language === 'en'
        ? ['concat', ['coalesce', ['get', 'name_en'], ['get', 'name']], ' ', ['get', 'altitude']]
        : language === 'zh'
        ? ['concat', ['coalesce', ['get', 'name_zh'], ['get', 'name']], ' ', ['get', 'altitude']]
        : ['concat', ['get', 'name'], ' ', ['get', 'altitude']];

      map.setLayoutProperty(POI_LABEL_LAYER, 'text-field', field as any);
    }
  }, [language]);

  // ── Sync route waypoints when selected route or language changes ─────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource(WAYPOINT_SOURCE) as any;
    if (!source) return;

    const geoJson = buildWaypointGeoJson(selectedRoute?.id ?? 'route_1', language);
    source.setData(geoJson);
  }, [selectedRoute, language]);

  // ── Sync Weather & Rain Terrain Mood Shift (Clear / Cloudy / Rainy) ───────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerId = 'gsi-photo-layer';
    if (!map.getLayer(layerId)) return;

    if (isRainOverlayVisible || weather?.weatherCode === 'rainy' || weather?.weatherCode === 'snowy') {
      map.setPaintProperty(layerId, 'raster-saturation', -0.35);
      map.setPaintProperty(layerId, 'raster-contrast', -0.15);
      map.setPaintProperty(layerId, 'raster-brightness-max', 0.85);
    } else if (weather?.weatherCode === 'cloudy' || weather?.weatherCode === 'partly_cloudy') {
      map.setPaintProperty(layerId, 'raster-saturation', -0.15);
      map.setPaintProperty(layerId, 'raster-contrast', -0.05);
      map.setPaintProperty(layerId, 'raster-brightness-max', 0.95);
    } else {
      map.setPaintProperty(layerId, 'raster-saturation', 0.05);
      map.setPaintProperty(layerId, 'raster-contrast', 0.05);
      map.setPaintProperty(layerId, 'raster-brightness-max', 1.0);
    }

    try {
      const hour = new Date().getHours();
      const sunSky = getSunSkyConfig(hour);
      let lightColor = sunSky.lightColor;
      let lightIntensity = sunSky.lightIntensity;

      if (weather?.weatherCode === 'snowy') {
        lightColor = '#E0F2FE';
        lightIntensity = 0.75;
      } else if (weather?.weatherCode === 'rainy' || isRainOverlayVisible) {
        lightColor = '#94A3B8';
        lightIntensity = 0.4;
      } else if (weather?.weatherCode === 'cloudy' || weather?.weatherCode === 'partly_cloudy') {
        lightColor = '#CBD5E1';
        lightIntensity = 0.55;
      } else if (weather?.weatherCode === 'sunny') {
        lightColor = '#FFF5E6';
        lightIntensity = 0.95;
      }

      (map as any).setLight?.({
        anchor: 'map',
        color: lightColor,
        intensity: lightIntensity,
        position: sunSky.lightPosition,
      });
    } catch {
      // safe fallback
    }
  }, [isRainOverlayVisible, weather?.weatherCode]);

  if (webglError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-salomon-black px-6">
        <div className="glass-card p-6 max-w-sm text-center space-y-3">
          <div className="text-3xl">🗺️</div>
          <p className="text-salomon-text text-sm font-semibold">3Dマップを表示できません</p>
          <p className="text-salomon-muted text-xs leading-relaxed">{webglError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      role="region"
      aria-label="高尾山3Dマップ"
    />
  );
}

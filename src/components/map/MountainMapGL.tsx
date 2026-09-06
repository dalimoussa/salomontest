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
import { getWaypointsForRoute } from '@/data/routeWaypoints';

const TAKAO_SUMMIT: LngLatLike = [139.2485, 35.6275];

const TRAIL_SOURCE                = 'takao-trails-source';
const TRAIL_LINE_LAYER            = 'trail-lines';
const TRAIL_HIGHLIGHT_LAYER       = 'trail-highlight';

const SURROUNDING_TRAIL_SOURCE    = 'surrounding-trails-source';
const SURROUNDING_TRAIL_LAYER     = 'surrounding-trails-layer';
const SURROUNDING_HIGHLIGHT_LAYER = 'surrounding-trail-highlight';

const POI_SOURCE            = 'takao-pois-source';
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
  route_jinba:      '#E8002D', // Salomon red (Jinba traverse)
  path_segment:     'rgba(255,255,255,0.3)',
};

// Preset camera viewing angles tailored to each course/trail for 110" 4K impact
const ROUTE_CAMERA_VIEWS: Record<string, { center: [number, number]; zoom: number; pitch: number; bearing: number }> = {
  route_1:          { center: [139.255, 35.630], zoom: 14.1, pitch: 56, bearing: -20 },
  route_2:          { center: [139.260, 35.632], zoom: 15.2, pitch: 52, bearing: -18 },
  route_3:          { center: [139.250, 35.626], zoom: 14.8, pitch: 55, bearing: -24 },
  route_4:          { center: [139.250, 35.629], zoom: 14.9, pitch: 57, bearing: -28 },
  route_5:          { center: [139.244, 35.625], zoom: 15.6, pitch: 50, bearing: -15 },
  route_6:          { center: [139.256, 35.628], zoom: 14.0, pitch: 58, bearing: -15 },
  route_inariyama:  { center: [139.254, 35.628], zoom: 14.0, pitch: 58, bearing: -22 },
  route_kagenobu:   { center: [139.235, 35.638], zoom: 12.8, pitch: 60, bearing: -30 },
  route_jinba:      { center: [139.205, 35.645], zoom: 11.8, pitch: 62, bearing: -35 },

  // Surrounding trails
  trail_gongen:     { center: [139.262, 35.608], zoom: 13.0, pitch: 60, bearing: -10 },
  trail_minamitakao:{ center: [139.268, 35.620], zoom: 13.8, pitch: 58, bearing: -15 },
  trail_misawa:     { center: [139.266, 35.605], zoom: 13.2, pitch: 59, bearing: -20 },
  trail_kitaapproach:{ center: [139.248, 35.648], zoom: 13.7, pitch: 55, bearing: -25 },
  trail_taiko:      { center: [139.252, 35.655], zoom: 13.5, pitch: 57, bearing: -30 },
  trail_kogezawa:   { center: [139.238, 35.642], zoom: 13.6, pitch: 58, bearing: -28 },
  trail_tengu:      { center: [139.230, 35.630], zoom: 12.2, pitch: 62, bearing: -32 },
  trail_meio:       { center: [139.198, 35.635], zoom: 12.6, pitch: 60, bearing: -35 },
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

interface MountainMapGLProps {
  /** Exposes the MapLibre instance upward so zoom buttons and reset work */
  onMapReady: (map: Map) => void;
}

export function MountainMapGL({ onMapReady }: MountainMapGLProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<Map | null>(null);
  const popupRef       = useRef<Popup | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  const selectedRoute        = useStore((s) => s.selectedRoute);
  const language             = useStore((s) => s.language);
  const weather              = useStore((s) => s.weather);
  const highlightedRouteId   = useMapStore((s) => s.highlightedRouteId);
  const setUserMovedCamera   = useMapStore((s) => s.setUserMovedCamera);
  const isRainOverlayVisible = useMapStore((s) => s.isRainOverlayVisible);

  // ── Map initialisation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hour = new Date().getHours();
    const sunSky = getSunSkyConfig(hour);

    let map: Map;
    try {
      map = new Map({
        container: containerRef.current!,
        style: buildMapStyle(sunSky),
        center: TAKAO_SUMMIT,
        zoom: 13.7,
        pitch: 58,
        bearing: -22,
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

    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

    map.on('error', (e) => {
      console.warn('MapLibre event error:', e);
    });

    map.on('dragstart', () => setUserMovedCamera(true));
    map.on('zoomstart', () => setUserMovedCamera(true));

    map.on('load', async () => {
      // ── 1. High-Resolution GSI DEM5A 3D Terrain Elevation (5m mesh with fallback) ──
      try {
        // High-resolution DEM5A proxy with automatic fallback to DEM10B
        const gsiTerrainSource = useGsiTerrainSource(addProtocol, {
          tileUrl: '/api/dem-tile/{z}/{x}/{y}',
          maxzoom: 15,
          attribution: '© 国土地理院 (DEM5A/10B)',
        });
        map.addSource('gsi-dem', gsiTerrainSource as any);
        // Exaggeration tuned to 1.65x for CG-quality 3D ridgeline clarity on 110" 4K display
        map.setTerrain({ source: 'gsi-dem', exaggeration: 1.65 });
      } catch (err) {
        console.warn('GSI terrain source init error:', err);
      }

      // Dynamic 3D Directional Sunlight
      try {
        (map as any).setLight({
          anchor: 'viewport',
          color: sunSky.lightColor,
          intensity: sunSky.lightIntensity,
          position: sunSky.lightPosition,
        });
      } catch (e) {
        // Light API is optional depending on version
      }

      // ── 2. Official Takao Trails GeoJSON Layer ─────────────────────────────
      try {
        const trailGeoJson: FeatureCollection = await fetchGeoJson('/data/takao-trails.geojson');
        map.addSource(TRAIL_SOURCE, { type: 'geojson', data: trailGeoJson });

        // Base official trail lines
        map.addLayer({
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
              ROUTE_COLOR_MAP.path_segment,
            ],
            'line-width': 4.0,
            'line-opacity': 0.8,
          },
        });

        // Highlighted route glowing halo
        map.addLayer({
          id: `${TRAIL_HIGHLIGHT_LAYER}-glow`,
          type: 'line',
          source: TRAIL_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          filter: ['==', ['get', 'route_id'], 'route_1'] as FilterSpecification,
          paint: {
            'line-color': '#0AFFE0',
            'line-width': 26,
            'line-opacity': 0.65,
            'line-blur': 10,
          },
        });

        // Highlighted route sharp line
        map.addLayer({
          id: TRAIL_HIGHLIGHT_LAYER,
          type: 'line',
          source: TRAIL_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          filter: ['==', ['get', 'route_id'], 'route_1'] as FilterSpecification,
          paint: {
            'line-color': '#0AFFE0',
            'line-width': 6.5,
            'line-opacity': 1,
          },
        });
      } catch (e) {
        console.error('Failed to load official trail GeoJSON:', e);
      }

      // ── 3. Surrounding Trails (Takao Manners) GeoJSON Layer ────────────────
      try {
        const surroundingGeoJson: FeatureCollection = await fetchGeoJson('/data/surrounding-trails.geojson');
        map.addSource(SURROUNDING_TRAIL_SOURCE, { type: 'geojson', data: surroundingGeoJson });

        // Base surrounding trail lines
        map.addLayer({
          id: SURROUNDING_TRAIL_LAYER,
          type: 'line',
          source: SURROUNDING_TRAIL_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#38BDF8'],
            'line-width': 3.5,
            'line-opacity': 0.75,
            'line-dasharray': [2, 1],
          },
        });

        // Surrounding trail glowing halo
        map.addLayer({
          id: `${SURROUNDING_HIGHLIGHT_LAYER}-glow`,
          type: 'line',
          source: SURROUNDING_TRAIL_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          filter: ['==', ['get', 'route_id'], ''] as FilterSpecification,
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#0AFFE0'],
            'line-width': 26,
            'line-opacity': 0.65,
            'line-blur': 10,
          },
        });

        // Surrounding trail highlighted sharp line
        map.addLayer({
          id: SURROUNDING_HIGHLIGHT_LAYER,
          type: 'line',
          source: SURROUNDING_TRAIL_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          filter: ['==', ['get', 'route_id'], ''] as FilterSpecification,
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#0AFFE0'],
            'line-width': 6.5,
            'line-opacity': 1,
          },
        });
      } catch (e) {
        console.error('Failed to load surrounding trails GeoJSON:', e);
      }

      // ── 4. POI & Waypoints Layer ──────────────────────────────────────────
      try {
        const poiGeoJson: FeatureCollection = await fetchGeoJson('/data/takao-pois.geojson');
        map.addSource(POI_SOURCE, { type: 'geojson', data: poiGeoJson });

        // Outer beacon ring
        map.addLayer({
          id: `${POI_POINT_LAYER}-outer`,
          type: 'circle',
          source: POI_SOURCE,
          paint: {
            'circle-radius': [
              'match', ['get', 'category'],
              'summit', 16,
              'transit', 13,
              'temple', 13,
              11,
            ],
            'circle-color': [
              'match', ['get', 'category'],
              'summit', 'rgba(10, 255, 224, 0.25)',
              'transit', 'rgba(0, 200, 255, 0.25)',
              'temple', 'rgba(251, 146, 60, 0.25)',
              'teahouse', 'rgba(250, 204, 21, 0.25)',
              'rgba(255, 255, 255, 0.2)',
            ],
            'circle-stroke-color': [
              'match', ['get', 'category'],
              'summit', '#0AFFE0',
              'transit', '#00C8FF',
              'temple', '#FB923C',
              'teahouse', '#FACC15',
              '#FFFFFF',
            ],
            'circle-stroke-width': 2,
          },
        });

        // Inner solid core dot
        map.addLayer({
          id: POI_POINT_LAYER,
          type: 'circle',
          source: POI_SOURCE,
          paint: {
            'circle-radius': [
              'match', ['get', 'category'],
              'summit', 6,
              'transit', 5,
              'temple', 5,
              4,
            ],
            'circle-color': '#FFFFFF',
          },
        });

        // POI label text on 3D terrain
        map.addLayer({
          id: POI_LABEL_LAYER,
          type: 'symbol',
          source: POI_SOURCE,
          layout: {
            'text-field': ['concat', ['get', 'name'], ' ', ['get', 'altitude']],
            'text-size': [
              'match', ['get', 'category'],
              'summit', 14,
              'transit', 12,
              'temple', 12,
              10,
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
        });

        // Click on POI point or label -> open elegant glass popup
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
            <div style="background:rgba(8,14,32,0.92); backdrop-filter:blur(12px); border:1px solid rgba(0,200,255,0.4); border-radius:12px; padding:12px; min-width:200px; color:#fff; font-family:sans-serif; box-shadow:0 8px 24px rgba(0,0,0,0.6);">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                <span style="font-size:14px; font-weight:bold; color:#0AFFE0;">${props.name}</span>
                <span style="font-size:11px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:monospace;">${props.altitude}</span>
              </div>
              <p style="font-size:11px; color:#cbd5e1; line-height:1.4; margin:0 0 8px 0;">${props.description}</p>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${props.statusColor};"></span>
                <span style="font-size:10px; font-weight:6px; color:${props.statusColor};">${props.status}</span>
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

        map.on('mouseenter', POI_POINT_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', POI_POINT_LAYER, () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', POI_LABEL_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', POI_LABEL_LAYER, () => { map.getCanvas().style.cursor = ''; });

        // ── 5. Sequenced Route Waypoints Layer ──────────────────────────────
        const initialWps = getWaypointsForRoute(selectedRoute?.id ?? 'route_1');
        const initialWpGeoJson: FeatureCollection = {
          type: 'FeatureCollection',
          features: initialWps.map((wp) => ({
            type: 'Feature',
            properties: {
              id: wp.id,
              seq: wp.seq.toString(),
              label: `${wp.seq}. ${language === 'en' ? wp.nameEn : wp.name} (${wp.altitude})`,
              isLandmark: wp.isLandmark ? 'true' : 'false',
            },
            geometry: {
              type: 'Point',
              coordinates: wp.coordinates,
            },
          })),
        };

        map.addSource(WAYPOINT_SOURCE, { type: 'geojson', data: initialWpGeoJson });

        // Numbered pin outer glowing halo
        map.addLayer({
          id: WAYPOINT_OUTER_LAYER,
          type: 'circle',
          source: WAYPOINT_SOURCE,
          paint: {
            'circle-radius': 16,
            'circle-color': 'rgba(10, 255, 224, 0.25)',
            'circle-stroke-color': '#0AFFE0',
            'circle-stroke-width': 2,
          },
        });

        // Numbered pin inner solid badge
        map.addLayer({
          id: WAYPOINT_CIRCLE_LAYER,
          type: 'circle',
          source: WAYPOINT_SOURCE,
          paint: {
            'circle-radius': 10,
            'circle-color': '#080E20',
            'circle-stroke-color': '#0AFFE0',
            'circle-stroke-width': 2,
          },
        });

        // Numbered sequence digit and landmark label
        map.addLayer({
          id: WAYPOINT_LABEL_LAYER,
          type: 'symbol',
          source: WAYPOINT_SOURCE,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 11,
            'text-offset': [0, 1.6],
            'text-anchor': 'top',
            'text-font': ['Noto Sans Bold'],
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': '#0AFFE0',
            'text-halo-color': '#080E20',
            'text-halo-width': 2.5,
          },
        });
      } catch (e) {
        console.error('Failed to load POI GeoJSON:', e);
      }
    });

    mapRef.current = map;
    onMapReady(map);

    const handleResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  // onMapReady intentionally excluded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync highlighted route filter (both official courses and surrounding trails) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const routeId = selectedRoute?.id ?? '';
    const isSurrounding = selectedRoute?.category === 'surrounding_trail';

    if (isSurrounding) {
      // Highlight in surrounding-trails-layer
      if (map.getLayer(SURROUNDING_HIGHLIGHT_LAYER)) {
        const filter: FilterSpecification = ['==', ['get', 'route_id'], routeId];
        map.setFilter(SURROUNDING_HIGHLIGHT_LAYER, filter);
        map.setFilter(`${SURROUNDING_HIGHLIGHT_LAYER}-glow`, filter);
      }
      // Clear official highlights
      if (map.getLayer(TRAIL_HIGHLIGHT_LAYER)) {
        const blankFilter: FilterSpecification = ['==', ['get', 'route_id'], ''];
        map.setFilter(TRAIL_HIGHLIGHT_LAYER, blankFilter);
        map.setFilter(`${TRAIL_HIGHLIGHT_LAYER}-glow`, blankFilter);
      }
    } else {
      // Highlight in official takao-trails layer
      const geoJsonRouteId = routeIdToGeoJsonId(routeId);
      const filter: FilterSpecification = geoJsonRouteId
        ? ['==', ['get', 'route_id'], geoJsonRouteId]
        : ['==', ['get', 'route_id'], ''];

      if (map.getLayer(TRAIL_HIGHLIGHT_LAYER)) {
        map.setFilter(TRAIL_HIGHLIGHT_LAYER, filter);
        map.setFilter(`${TRAIL_HIGHLIGHT_LAYER}-glow`, filter);
      }
      // Clear surrounding highlights
      if (map.getLayer(SURROUNDING_HIGHLIGHT_LAYER)) {
        const blankFilter: FilterSpecification = ['==', ['get', 'route_id'], ''];
        map.setFilter(SURROUNDING_HIGHLIGHT_LAYER, blankFilter);
        map.setFilter(`${SURROUNDING_HIGHLIGHT_LAYER}-glow`, blankFilter);
      }
    }

    // Smoothly fly camera to showcase the selected course across the 3D mountain
    if (selectedRoute && ROUTE_CAMERA_VIEWS[selectedRoute.id]) {
      const v = ROUTE_CAMERA_VIEWS[selectedRoute.id];
      map.flyTo({
        center: v.center,
        zoom: v.zoom,
        pitch: v.pitch,
        bearing: v.bearing,
        duration: 1200,
        essential: true,
      });
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

    const wps = getWaypointsForRoute(selectedRoute?.id ?? 'route_1');
    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features: wps.map((wp) => {
        const wpName = language === 'en' ? wp.nameEn : language === 'zh' ? (wp.nameZh || wp.name) : wp.name;
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

    source.setData(geoJson);
  }, [selectedRoute, language]);

  // ── Sync Weather & Rain Terrain Mood Shift (Clear / Cloudy / Rainy) ───────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerId = 'gsi-photo-layer';
    if (!map.getLayer(layerId)) return;

    if (isRainOverlayVisible || weather?.weatherCode === 'rainy' || weather?.weatherCode === 'snowy') {
      // Rainy: wet desaturation (-0.35), overcast contrast
      map.setPaintProperty(layerId, 'raster-saturation', -0.35);
      map.setPaintProperty(layerId, 'raster-contrast', -0.15);
      map.setPaintProperty(layerId, 'raster-brightness-max', 0.85);
    } else if (weather?.weatherCode === 'cloudy' || weather?.weatherCode === 'partly_cloudy') {
      // Cloudy: light desaturation (-0.15), soft diffuse contrast
      map.setPaintProperty(layerId, 'raster-saturation', -0.15);
      map.setPaintProperty(layerId, 'raster-contrast', -0.05);
      map.setPaintProperty(layerId, 'raster-brightness-max', 0.95);
    } else {
      // Clear: vibrant orthophoto
      map.setPaintProperty(layerId, 'raster-saturation', 0.05);
      map.setPaintProperty(layerId, 'raster-contrast', 0.05);
      map.setPaintProperty(layerId, 'raster-brightness-max', 1.0);
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

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchGeoJson(url: string): Promise<FeatureCollection> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
  return res.json() as Promise<FeatureCollection>;
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

function buildMapStyle(sunSky: SunSkyConfig): StyleSpecification {
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
    ],
    sky: {
      'sky-color': sunSky.skyColor,
      'sky-horizon-blend': 0.65,
      'horizon-color': sunSky.horizonColor,
      'horizon-fog-blend': 0.75,
      'fog-color': sunSky.fogColor,
      'fog-ground-blend': 0.45,
    },
  };
}

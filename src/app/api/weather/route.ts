/**
 * /api/weather — Server-side weather proxy with 10-minute in-memory cache.
 *
 * Why a server-side route?
 *   - The `next: { revalidate }` option on fetch() only works in Server
 *     Components. Calling Open-Meteo from a 'use client' module bypasses
 *     Next.js caching entirely and hammers the upstream API on every render.
 *   - This route caches once per server instance for 10 min, then any number
 *     of client-side polls hit the server cache, not the upstream.
 *
 * Returns: WeatherData JSON with HTTP 200, or an error JSON with 503.
 */
import { NextResponse } from 'next/server';
import type { WeatherData, WeatherCode } from '@/types';

// ── In-memory server cache (survives hot-reload but not process restarts) ─────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let   cached: { data: WeatherData; ts: number } | null = null;

// Mt. Takao coordinates
const LAT = 35.6252;
const LON = 139.2437;

function mapWmoToWeatherCode(wmo: number): WeatherCode {
  if (wmo === 0 || wmo === 1)           return 'sunny';
  if (wmo === 2 || wmo === 3)           return 'partly_cloudy';
  if (wmo >= 45 && wmo <= 48)           return 'cloudy';
  if (wmo >= 51 && wmo <= 67)           return 'rainy';
  if (wmo >= 71 && wmo <= 77)           return 'snowy';
  if (wmo >= 80 && wmo <= 82)           return 'rainy';
  if (wmo >= 85 && wmo <= 86)           return 'snowy';
  if (wmo >= 95)                         return 'rainy';
  return 'cloudy';
}

function mapWmoToLabel(wmo: number): string {
  if (wmo === 0)                         return '快晴';
  if (wmo === 1)                         return '晴れ';
  if (wmo === 2)                         return '晴れ時々曇り';
  if (wmo === 3)                         return '曇り';
  if (wmo >= 45 && wmo <= 48)           return '霧';
  if (wmo >= 51 && wmo <= 55)           return '霧雨';
  if (wmo >= 61 && wmo <= 65)           return '雨';
  if (wmo >= 66 && wmo <= 67)           return '凍雨';
  if (wmo >= 71 && wmo <= 77)           return '雪';
  if (wmo >= 80 && wmo <= 82)           return 'にわか雨';
  if (wmo >= 85 && wmo <= 86)           return 'にわか雪';
  if (wmo >= 95)                         return '雷雨';
  return '曇り';
}

interface OpenMeteoResponse {
  current: { temperature_2m: number; weathercode: number; windspeed_10m: number };
  hourly:  {
    precipitation: number[];
    precipitation_probability: number[];
    uv_index: number[];
    visibility: number[];
  };
}

async function fetchFromUpstream(): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',       String(LAT));
  url.searchParams.set('longitude',      String(LON));
  url.searchParams.set('current',        'temperature_2m,weathercode,windspeed_10m');
  url.searchParams.set('hourly',         'precipitation,precipitation_probability,uv_index,visibility');
  url.searchParams.set('forecast_days',  '1');
  url.searchParams.set('timezone',       'Asia/Tokyo');

  const response = await fetch(url.toString(), {
    // This fetch IS server-side, so the Next.js cache header is respected
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);

  const data: OpenMeteoResponse = await response.json();
  return {
    temp_c:           Math.round(data.current.temperature_2m),
    weather:          mapWmoToLabel(data.current.weathercode),
    weatherCode:      mapWmoToWeatherCode(data.current.weathercode),
    windSpeed:        Math.round(data.current.windspeed_10m * 10) / 10,
    rainProbability:  data.hourly.precipitation_probability?.[0] ?? 0,
    precipitationMmh: data.hourly.precipitation?.[0] ?? 0,
    uvIndex:          Math.round(data.hourly.uv_index?.[0] ?? 0),
    visibility:       Math.round((data.hourly.visibility?.[0] ?? 10_000) / 1000),
    updatedAt:        new Date().toISOString(),
  };
}

/** Safe fallback — deterministic values based on current month (no network) */
function buildFallbackWeather(): WeatherData {
  const month = new Date().getMonth() + 1;
  const isSummer = month >= 6 && month <= 8;
  const isWinter = month === 12 || month <= 2;
  return {
    temp_c:           isSummer ? 27 : isWinter ? 4 : 15,
    weather:          '情報取得中',
    weatherCode:      'cloudy',
    windSpeed:        2.0,
    rainProbability:  20,
    precipitationMmh: 0,
    uvIndex:          3,
    visibility:       10,
    updatedAt:        new Date().toISOString(),
  };
}

export async function GET() {
  // Return from in-memory cache if still fresh
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'X-Cache': 'HIT',
        'X-Cache-Age': String(Math.round((Date.now() - cached.ts) / 1000)),
      },
    });
  }

  try {
    const data = await fetchFromUpstream();
    cached = { data, ts: Date.now() };
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    console.error('[/api/weather] Upstream fetch failed:', err);

    // If we have stale cached data, return it with a warning header
    if (cached) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-Cache': 'STALE',
          'X-Weather-Stale': 'true',
        },
      });
    }

    // Truly no data — return fallback with 503
    return NextResponse.json(
      { ...buildFallbackWeather(), _isFallback: true },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store', 'X-Weather-Fallback': 'true' },
      }
    );
  }
}

/**
 * Shared weather-derived calculation functions.
 *
 * Consolidates logic that was previously duplicated inside WeatherPanel.tsx
 * and would otherwise repeat in the AI context builder.
 *
 * All functions are pure — no side-effects, no browser APIs.
 */
import type { WeatherData } from '@/types';

export type ThunderRisk = '低' | '中' | '高';
export type CrowdLevel   = 'すいている' | 'やや混雑' | '混雑';

/** 1–5 hiking-index stars based on weather conditions */
export function hikingIndex(w: WeatherData): number {
  if (w.rainProbability > 70) return 1;
  if (w.rainProbability > 40) return 2;
  if (w.temp_c < 0 || w.temp_c > 32) return 2;
  if (w.windSpeed >= 10) return 2;
  if (w.temp_c > 28 || w.rainProbability > 20) return 3;
  return 4;
}

/** Rule-based thunder risk label */
export function thunderRisk(w: WeatherData): ThunderRisk {
  if (w.rainProbability > 70) return '高';
  if (w.rainProbability > 40) return '中';
  return '低';
}

/** Rule-based crowd level */
export function crowdLevel(w: WeatherData): CrowdLevel {
  if (w.rainProbability > 50) return 'すいている';
  if (w.temp_c > 20) return '混雑';
  return 'やや混雑';
}

/** Crowd time hint string */
export function crowdTimeHint(level: CrowdLevel): string {
  if (level === 'すいている') return '終日スムーズ';
  if (level === '混雑')       return '10時〜15時頃に最混雑';
  return '11時〜14時頃に混雑';
}

/** Tailwind colour class for thunder risk */
export function thunderRiskColor(risk: ThunderRisk): string {
  if (risk === '高') return 'text-red-400';
  if (risk === '中') return 'text-yellow-400';
  return 'text-salomon-teal';
}

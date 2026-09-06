/**
 * Trail Status Repository
 */
import type { TrailStatus } from '@/types';
import type { Language } from '@/lib/i18n';

/** Typed mock for Phase 1 — matches current actual conditions */
const TRAIL_STATUS_MOCK: TrailStatus = {
  updatedAt: '2026-08-29T08:00:00+09:00',
  overallSeverity: 'caution',
  items: [
    {
      label: '乾いていて歩きやすい',
      label_en: 'Dry and easy to hike',
      label_zh: '路面干燥，适宜行走',
      severity: 'good',
    },
    {
      label: '一部に木の根や石あり',
      label_en: 'Exposed tree roots and loose rocks in sections',
      label_zh: '局部路段有裸露树根与碎石',
      severity: 'caution',
    },
    {
      label: '滑りに注意（一部湿潤区間あり）',
      label_en: 'Watch for slippery spots (some damp sections)',
      label_zh: '注意防滑（局部路面湿润）',
      severity: 'caution',
    },
  ],
  closures: [],
  closures_en: [],
  closures_zh: [],
  photoUrl: '/all_course_2016.jpg',
};

/**
 * Returns the current trail status localized to the requested language.
 */
export function getTrailStatus(lang: Language = 'ja'): TrailStatus {
  if (lang === 'en') {
    return {
      ...TRAIL_STATUS_MOCK,
      items: TRAIL_STATUS_MOCK.items.map(item => ({
        ...item,
        label: item.label_en || item.label,
      })),
      closures: TRAIL_STATUS_MOCK.closures_en || TRAIL_STATUS_MOCK.closures,
    };
  }
  if (lang === 'zh') {
    return {
      ...TRAIL_STATUS_MOCK,
      items: TRAIL_STATUS_MOCK.items.map(item => ({
        ...item,
        label: item.label_zh || item.label,
      })),
      closures: TRAIL_STATUS_MOCK.closures_zh || TRAIL_STATUS_MOCK.closures,
    };
  }
  return TRAIL_STATUS_MOCK;
}

/** True severity → Tailwind text colour class mapping */
export function trailSeverityColor(severity: TrailStatus['overallSeverity']): string {
  return severity === 'good'
    ? 'text-green-400'
    : severity === 'caution'
    ? 'text-yellow-400'
    : 'text-red-400';
}

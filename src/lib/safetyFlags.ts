import type { Language } from '@/lib/i18n';

export interface SafetyFlag {
  key: string;
  label: string;
  label_en: string;
  label_zh: string;
  severity: 'info' | 'caution' | 'warning';
}

const FLAG_DEFINITIONS: Record<string, SafetyFlag> = {
  high_uv: {
    key: 'high_uv',
    label: '紫外線注意',
    label_en: 'High UV',
    label_zh: '紫外线较强',
    severity: 'caution',
  },
  heat_caution: {
    key: 'heat_caution',
    label: '熱中症注意',
    label_en: 'Heat Caution',
    label_zh: '防暑防脱水',
    severity: 'caution',
  },
  heavy_heat: {
    key: 'heavy_heat',
    label: '高温危険',
    label_en: 'Severe Heat Risk',
    label_zh: '极端高温警报',
    severity: 'warning',
  },
  rain_gear_required: {
    key: 'rain_gear_required',
    label: '雨具必須',
    label_en: 'Rain Gear Required',
    label_zh: '必备雨具',
    severity: 'caution',
  },
  slippery_trail: {
    key: 'slippery_trail',
    label: '足元滑りやすい',
    label_en: 'Slippery Trail',
    label_zh: '步道路面湿滑',
    severity: 'caution',
  },
  strong_wind: {
    key: 'strong_wind',
    label: '強風注意',
    label_en: 'Strong Wind',
    label_zh: '山脊强风注意',
    severity: 'caution',
  },
  low_visibility: {
    key: 'low_visibility',
    label: '視界不良',
    label_en: 'Low Visibility',
    label_zh: '能见度较低',
    severity: 'warning',
  },
  long_distance_caution: {
    key: 'long_distance_caution',
    label: '長距離・体力要',
    label_en: 'Long Distance Route',
    label_zh: '长距离·考验体力',
    severity: 'info',
  },
  difficult_terrain: {
    key: 'difficult_terrain',
    label: '難コース・足元注意',
    label_en: 'Challenging Terrain',
    label_zh: '陡峭险路·注意落足',
    severity: 'warning',
  },
  cold_caution: {
    key: 'cold_caution',
    label: '防寒具必要',
    label_en: 'Cold Weather Gear',
    label_zh: '需备保暖衣物',
    severity: 'caution',
  },
  storm_warning: {
    key: 'storm_warning',
    label: '悪天候注意',
    label_en: 'Storm Warning',
    label_zh: '恶劣天气警报',
    severity: 'warning',
  },
};

export function getSafetyFlagLabel(key: string, lang: Language = 'ja'): string {
  const flag = FLAG_DEFINITIONS[key];
  if (!flag) return key.replace(/_/g, ' ');
  if (lang === 'en') return flag.label_en;
  if (lang === 'zh') return flag.label_zh;
  return flag.label;
}

export function resolveSafetyFlags(flagKeys: string[]): SafetyFlag[] {
  return flagKeys
    .map((key) => FLAG_DEFINITIONS[key])
    .filter((f): f is SafetyFlag => Boolean(f));
}

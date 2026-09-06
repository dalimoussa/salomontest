/**
 * Facilities Repository
 */
import type { Facility, FacilityStatus } from '@/types';
import type { Language } from '@/lib/i18n';

const FACILITIES_MOCK: Facility[] = [
  {
    id: 'teahouse_summit',
    name: '茶屋',
    name_en: 'Tea Houses',
    name_zh: '茶社与小吃店',
    icon: 'coffee',
    status: 'open',
    detail: '山頂周辺、薬王院にあり',
    detail_en: 'Near summit area and Yakuo-in Temple',
    detail_zh: '位于山顶周边及药王院区域',
    hours: '〜16:30頃',
    hours_en: 'Until ~16:30',
    hours_zh: '至16:30左右',
  },
  {
    id: 'parking_kiyotaki',
    name: '駐車場',
    name_en: 'Parking Lots',
    name_zh: '山脚停车场',
    icon: 'parking',
    status: 'open',
    detail: '清滝駅周辺にあり',
    detail_en: 'Located near Kiyotaki Station base',
    detail_zh: '位于清泷缆车站周边',
  },
  {
    id: 'restroom_all',
    name: 'トイレ',
    name_en: 'Restrooms',
    name_zh: '公共洗手间',
    icon: 'restroom',
    status: 'crowded',
    detail: '全ルートにあり。山頂・薬王院は混雑気味',
    detail_en: 'Available on all trails; busy at summit & temple',
    detail_zh: '各条路线均有分布；山顶及药王院略有拥挤',
  },
];

export function getFacilities(lang: Language = 'ja'): Facility[] {
  return FACILITIES_MOCK.map(f => {
    if (lang === 'en') {
      return {
        ...f,
        name: f.name_en || f.name,
        detail: f.detail_en || f.detail,
        hours: f.hours_en || f.hours,
      };
    }
    if (lang === 'zh') {
      return {
        ...f,
        name: f.name_zh || f.name,
        detail: f.detail_zh || f.detail,
        hours: f.hours_zh || f.hours,
      };
    }
    return f;
  });
}

export function getFacilityById(id: string, lang: Language = 'ja'): Facility | undefined {
  const f = FACILITIES_MOCK.find(item => item.id === id);
  if (!f) return undefined;
  return getFacilities(lang).find(item => item.id === id);
}

/** Maps FacilityStatus to localized display label */
export function facilityStatusLabel(status: FacilityStatus, lang: Language = 'ja'): string {
  if (lang === 'en') {
    switch (status) {
      case 'open':    return 'Open';
      case 'closed':  return 'Closed';
      case 'crowded': return 'Crowded';
      case 'unknown': return 'Check';
    }
  }
  if (lang === 'zh') {
    switch (status) {
      case 'open':    return '营业中';
      case 'closed':  return '已关闭';
      case 'crowded': return '微拥挤';
      case 'unknown': return '待确认';
    }
  }
  switch (status) {
    case 'open':    return '営業中';
    case 'closed':  return '閉鎖中';
    case 'crowded': return '混雑中';
    case 'unknown': return '不明';
  }
}

/** Maps FacilityStatus → Tailwind colour class */
export function facilityStatusColor(status: FacilityStatus): string {
  switch (status) {
    case 'open':    return 'text-green-400';
    case 'crowded': return 'text-yellow-400';
    case 'closed':  return 'text-red-400';
    case 'unknown': return 'text-salomon-muted';
  }
}

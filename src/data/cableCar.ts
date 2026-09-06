/**
 * Cable Car Information Repository
 */
import type { CableCarInfo } from '@/types';
import type { Language } from '@/lib/i18n';

const CABLE_CAR_INFO_MOCK: CableCarInfo = {
  updatedAt: '2026-08-01T09:00:00+09:00',
  services: [
    {
      name: 'ケーブルカー（あおば号 / もみじ号）',
      name_en: 'Cable Car (Aoba & Momiji Cars)',
      name_zh: '缆车（青叶号 / 红叶号）',
      status: 'unknown',
      firstDeparture: '08:00',
      lastDeparture: '17:45',
      intervalMin: 15,
      durationMin: 6,
      note: '日本一の最急勾配（31度18分）。季節により最終便時刻変動あり。',
      note_en: "Japan's steepest railway incline (31°18'). Final departure varies seasonally.",
      note_zh: '全日本最陡坡道（31度18分）。末班车时间根据季节略有微调。',
    },
    {
      name: '2人乗り観光リフト（山麓 ⇄ 山上）',
      name_en: '2-Person Chairlift (Base ⇄ Summit)',
      name_zh: '双人观光吊椅缆车（山麓 ⇄ 山上）',
      status: 'unknown',
      firstDeparture: '09:00',
      lastDeparture: '16:30',
      intervalMin: 0, // continuous
      durationMin: 12,
    },
  ],
  fares: [
    {
      label: '大人',
      label_en: 'Adult',
      label_zh: '成人',
      oneWay: 490,
      roundTrip: 950,
    },
    {
      label: '小児',
      label_en: 'Child',
      label_zh: '儿童',
      oneWay: 250,
      roundTrip: 470,
    },
  ],
  paymentNote: 'ICカード（PASMO・Suica）利用可。クレジットカード不可。',
  paymentNote_en: 'Transit IC cards (PASMO, Suica) accepted. Credit cards not accepted.',
  paymentNote_zh: '支持交通IC卡（PASMO、Suica）。不支持信用卡。',
};

export function getCableCarInfo(lang: Language = 'ja'): CableCarInfo {
  return {
    ...CABLE_CAR_INFO_MOCK,
    services: CABLE_CAR_INFO_MOCK.services.map(s => {
      if (lang === 'en') {
        return {
          ...s,
          name: s.name_en || s.name,
          note: s.note_en || s.note,
        };
      }
      if (lang === 'zh') {
        return {
          ...s,
          name: s.name_zh || s.name,
          note: s.note_zh || s.note,
        };
      }
      return s;
    }),
    fares: CABLE_CAR_INFO_MOCK.fares.map(f => {
      if (lang === 'en') {
        return { ...f, label: f.label_en || f.label };
      }
      if (lang === 'zh') {
        return { ...f, label: f.label_zh || f.label };
      }
      return f;
    }),
    paymentNote:
      lang === 'en'
        ? CABLE_CAR_INFO_MOCK.paymentNote_en || CABLE_CAR_INFO_MOCK.paymentNote
        : lang === 'zh'
        ? CABLE_CAR_INFO_MOCK.paymentNote_zh || CABLE_CAR_INFO_MOCK.paymentNote
        : CABLE_CAR_INFO_MOCK.paymentNote,
  };
}

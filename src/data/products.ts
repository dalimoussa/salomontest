import type { Product, RouteCategory } from '@/types';
import type { Language } from '@/lib/i18n';

export const PRODUCTS: Product[] = [
  {
    sku: 'L47271400',
    name: 'X Ultra 4 GORE-TEX',
    name_en: 'X Ultra 4 GORE-TEX Hiking Shoes',
    name_zh: 'X Ultra 4 GORE-TEX 徒步越野鞋',
    category: 'footwear',
    subCategory: 'trail_shoes',
    price: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    descriptionShort: '防水GORE-TEX採用。舗装路から登山道まで対応。',
    descriptionShort_en: 'Waterproof GORE-TEX membrane. Versatile from paved paths to rugged trails.',
    descriptionShort_zh: '搭载防水透气GORE-TEX薄膜，从铺装步道到险峻山路皆能从容应对。',
    tags: ['beginner','intermediate','all_weather','all_season','waterproof','goretex','high_grip','trail_shoes_beginner','trail_shoes_intermediate','waterproof_shoes','takao_course'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'L47301700',
    name: 'Speedcross 6',
    name_en: 'Speedcross 6 Trail Running Shoes',
    name_zh: 'Speedcross 6 经典越野跑鞋',
    category: 'footwear',
    subCategory: 'trail_running',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
    descriptionShort: '独自のディープラグで泥道・山岳トレイルを力強くグリップ。',
    descriptionShort_en: 'Deep aggressive Chevron lugs for superior grip on wet mud and steep dirt trails.',
    descriptionShort_zh: '深齿纹大底带来极强抓地力，征服泥泞湿滑与陡峭山野。',
    tags: ['intermediate','advanced','sunny','cloudy','spring','summer','autumn','trail_shoes_intermediate','trail_shoes_advanced','high_grip','lightweight','surrounding_trail'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'L47181000',
    name: 'Pulsar Trail Pro 2',
    name_en: 'Pulsar Trail Pro 2',
    name_zh: 'Pulsar Trail Pro 2 竞速越野鞋',
    category: 'footwear',
    subCategory: 'trail_running',
    price: 24200,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
    descriptionShort: 'Energy Blade搭載。高反発でロングトレイルの推進力をアシスト。',
    descriptionShort_en: 'Energy Blade composite plate for responsive energy return on long trail traverses.',
    descriptionShort_zh: '搭载Energy Blade能量推进板，高回弹助力长距离山地飞驰。',
    tags: ['intermediate','advanced','all_weather','spring','summer','autumn','trail_shoes_advanced','surrounding_trail'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC2007600',
    name: 'Bonatti Trail HS Jacket',
    name_en: 'Bonatti Trail Waterproof Shell Jacket',
    name_zh: 'Bonatti Trail 专业防水冲锋衣',
    category: 'apparel',
    subCategory: 'jacket',
    price: 28600,
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80',
    descriptionShort: '20000mm耐水圧。軽量コンパクトに収納できる本格トレイルシェル。',
    descriptionShort_en: '20,000mm hydrostatic head. Ultralight packable shell for unpredictable mountain weather.',
    descriptionShort_zh: '20000mm高等级耐水压，超轻量可收纳设计，山地风雨无忧。',
    tags: ['beginner','intermediate','advanced','rainy','all_season','waterproof','lightweight','rain_jacket','surrounding_trail','takao_course'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC2025700',
    name: 'Active Shell Jacket',
    name_en: 'Active Shell Windproof Jacket',
    name_zh: 'Active Shell 防风轻量夹克',
    category: 'apparel',
    subCategory: 'jacket',
    price: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
    descriptionShort: 'ストレッチ素材で動きやすい防風・撥水ジャケット。',
    descriptionShort_en: 'Flexible stretch fabric with durable water repellency and windproof shield.',
    descriptionShort_zh: '高弹力舒适面料，兼备防风防泼水性能，运动舒展自如。',
    tags: ['beginner','intermediate','advanced','cloudy','rainy','all_season','waterproof','breathable','windshell','rain_jacket','takao_course'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC1522300',
    name: 'XA Alpine 3 Jacket',
    name_en: 'XA Alpine 3 Technical Jacket',
    name_zh: 'XA Alpine 3 高山防御夹克',
    category: 'apparel',
    subCategory: 'jacket',
    price: 42900,
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&q=80',
    descriptionShort: '厳しい山岳稜線環境に対応した高機能防風プロテクションジャケット。',
    descriptionShort_en: 'High-performance wind and thermal protection built for harsh exposed ridgelines.',
    descriptionShort_zh: '专为严苛山岳山脊环境研发的高性能防护冲锋衣，御风御寒。',
    tags: ['intermediate','advanced','cloudy','rainy','snowy','winter','waterproof','windshell','rain_jacket','surrounding_trail'],
    isFeatured: false,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC1758200',
    name: 'Active Skin 8 Set (ベストパック)',
    name_en: 'Active Skin 8 Running Hydration Vest',
    name_zh: 'Active Skin 8 越野水袋背包背心',
    category: 'gear',
    subCategory: 'hydration_vest',
    price: 15400,
    imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80',
    descriptionShort: '500mlソフトフラスク2本付属。10km超の周回トレイルに最適なハイドレーションベスト。',
    descriptionShort_en: 'Includes two 500ml soft flasks. Optimal fit and hydration for trails over 10km.',
    descriptionShort_zh: '附带两只500ml软水壶，贴身稳定防晃动，10公里以上中长距离越野首选。',
    tags: ['intermediate','advanced','all_weather','all_season','hydration_vest','surrounding_trail','energy_gel'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC1923000',
    name: 'Soft Flask 500ml 42',
    name_en: 'Soft Flask 500ml 42mm Cap',
    name_zh: 'Soft Flask 500ml 软水壶 (42mm大口径)',
    category: 'gear',
    subCategory: 'hydration',
    price: 3300,
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80',
    descriptionShort: '飲むと圧縮され水揺れを防ぐハイドレーションフラスク。',
    descriptionShort_en: 'Compresses as you drink to eliminate water bouncing on the move.',
    descriptionShort_zh: '饮水时自动压缩收缩，彻底消除跑动中的水晃动感。',
    tags: ['beginner','intermediate','advanced','all_weather','all_season','hydration_vest','surrounding_trail'],
    isFeatured: false,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC2031200',
    name: 'Trail Running Poles',
    name_en: 'Carbon Trail Running Poles',
    name_zh: '超轻碳素三节折叠越野登山杖',
    category: 'gear',
    subCategory: 'trekking_poles',
    price: 12800,
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
    descriptionShort: '超軽量カーボン3分割折りたたみ式。急登・ロング走の脚負担を大幅軽減。',
    descriptionShort_en: 'Ultralight carbon 3-piece foldable design. Greatly relieves leg strain on steep ascents.',
    descriptionShort_zh: '超轻碳素三节折叠式收纳，大幅减轻陡峭爬坡与长途跋涉时的腿部疲劳。',
    tags: ['intermediate','advanced','all_weather','all_season','trekking_poles','surrounding_trail'],
    isFeatured: true,
    stockStatus: 'in_stock',
  },
  {
    sku: 'LC2010100',
    name: 'Mountain Marathon Cap',
    name_en: 'Mountain Marathon Breathable Cap',
    name_zh: '山地马拉松透气速干遮阳帽',
    category: 'gear',
    subCategory: 'hat',
    price: 4400,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    descriptionShort: '軽量・高通気速乾。紫外線対策に最適なトレイルランニングキャップ。',
    descriptionShort_en: 'Ultralight, breathable quick-dry cap. Vital UV protection for sunny ridge runs.',
    descriptionShort_zh: '超轻高透气速干材质，山脊强紫外线环境下的必备防晒护头利器。',
    tags: ['beginner','intermediate','advanced','sunny','all_season','lightweight','breathable','hat','takao_course','surrounding_trail'],
    isFeatured: false,
    stockStatus: 'in_stock',
  },
];

export function getLocalizedProduct(p: Product, lang: Language): Product {
  if (lang === 'en') {
    return {
      ...p,
      name: p.name_en || p.name,
      descriptionShort: p.descriptionShort_en || p.descriptionShort,
      reason: p.reason_en || p.reason,
    };
  }
  if (lang === 'zh') {
    return {
      ...p,
      name: p.name_zh || p.name,
      descriptionShort: p.descriptionShort_zh || p.descriptionShort,
      reason: p.reason_zh || p.reason,
    };
  }
  return p;
}

export function getRecommendedProducts(
  userLevel: 'beginner' | 'intermediate' | 'advanced',
  weatherCode: string,
  season: string,
  gearSlugs: string[] = [],
  limit = 3,
  routeCategory?: RouteCategory,
  lang: Language = 'ja'
): Product[] {
  const normalizedWeather = weatherCode === 'partly_cloudy' ? 'cloudy' : weatherCode;
  const scored = PRODUCTS
    .filter(p => p.stockStatus !== 'out_of_stock')
    .map(p => {
      let score = 0;
      for (const tag of p.tags) {
        if (gearSlugs.includes(tag)) score += 3.5;
        else if (tag === userLevel) score += 2.0;
        else if (routeCategory && tag === routeCategory) score += 2.5;
        else if (tag === normalizedWeather || tag === 'all_weather') score += 1.5;
        else if (tag === season || tag === 'all_season') score += 1.0;
      }
      return { product: p, score: p.tags.includes(userLevel) || (routeCategory && p.tags.includes(routeCategory)) ? score : score * 0.7 };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score !== a.score ? b.score - a.score : (b.product.isFeatured ? 1 : 0) - (a.product.isFeatured ? 1 : 0));

  return scored.slice(0, limit).map(s => getLocalizedProduct(s.product, lang));
}

/**
 * Shared AI prompt building for the Salomon Takao Mountain AI Concierge.
 *
 * Single source of truth — used by both:
 *   - /api/chat route.ts  (server-side LLM call)
 *   - src/api/llm.ts      (client-side fallback builder)
 */
import type { WeatherData, Route, Difficulty, TrailStatus, Facility } from '@/types';
import type { Language } from '@/lib/i18n';

export const LEVEL_LABEL: Record<Language, Record<Difficulty, string>> = {
  ja: {
    beginner:     '初心者（ハイキング経験1年未満、体力普通）',
    intermediate: '中級者（ハイキング経験3年程度、体力あり）',
    advanced:     '上級者（登山・トレイルラン経験豊富、体力高い）',
  },
  en: {
    beginner:     'Beginner (hiking experience < 1 year, average fitness)',
    intermediate: 'Intermediate (~3 years hiking experience, good stamina)',
    advanced:     'Advanced (experienced hiker/trail runner, high endurance)',
  },
  zh: {
    beginner:     '初学者（登山徒步经验1年以下，体能一般）',
    intermediate: '进阶者（登山徒步经验3年左右，体能良好）',
    advanced:     '资深者（丰富高山越野跑经验，体能充沛）',
  },
};

export function getSystemPrompt(language: Language = 'ja'): string {
  if (language === 'en') {
    return `You are "Yamamori" (Mountain Guardian), the Salomon Mt. Takao Store AI Mountain Concierge.
Your mission is to share the joy of Mt. Takao while prioritizing hiker safety. Use a polite, friendly, and encouraging tone.

CRITICAL RULES:
- Reply ONLY with a valid JSON object matching the schema below.
- Do NOT invent trail restrictions, closures, ticket prices, inventory, or operating hours not explicitly given in the context.
- Do NOT invent or hallucinate weather values outside the supplied context.
- Never speculate on safety-critical facts.
- Generate all advice_text and advice_short content in natural, friendly English.

JSON Schema:
{
  "advice_text": "Main advice in natural English (120-220 words)",
  "advice_short": "Short summary in natural English (under 40 words)",
  "safety_flags": [],
  "recommended_gear": [],
  "mood": "good | caution | warning"
}
Available gear slugs: trail_shoes_beginner, trail_shoes_intermediate, trail_shoes_advanced, waterproof_shoes, rain_jacket, rain_pants, windshell, hat, trekking_poles, energy_gel, headlamp, gloves`;
  }

  if (language === 'zh') {
    return `你是“山守”，萨洛蒙高尾山专营店的AI山野向导。
你的使命是以安全为首要原则，向顾客传递高尾山的魅力。请使用礼貌、亲切且专业的语气。

重要规则:
- 严格仅返回符合以下JSON格式的内容。
- 绝不编造上下文中未明确提及的步道封闭、封路、票价、库存或营业时间。
- 绝不制造上下文中未出现的天气数据。
- 绝不凭空推测关乎安全的隐患信息。
- advice_text与advice_short必须使用自然得体的简体中文输出。

JSON格式:
{
  "advice_text": "核心向导建议（150〜250字中文）",
  "advice_short": "精炼版要点（80字以内中文）",
  "safety_flags": [],
  "recommended_gear": [],
  "mood": "good | caution | warning"
}
可用gear slugs: trail_shoes_beginner, trail_shoes_intermediate, trail_shoes_advanced, waterproof_shoes, rain_jacket, rain_pants, windshell, hat, trekking_poles, energy_gel, headlamp, gloves`;
  }

  return `あなたは「山守（やまもり）」、サロモン高尾店のAIマウンテンコンシェルジュです。
安全を最優先に、山の魅力を伝えることが使命です。丁寧で親しみやすい口調で話してください。

重要なルール:
- 必ず以下のJSON形式のみで返答してください。
- 閉鎖情報・通行止め・価格・在庫・開業時間は、コンテキストに明示されているもの以外は絶対に記載しない。
- コンテキストにない天気の値を作らない。
- 安全上重要な情報（通行止めなど）はコンテキスト外の推測で記載しない。

JSON形式:
{
  "advice_text": "メインアドバイス（150〜250文字）",
  "advice_short": "短縮版（80文字以内）",
  "safety_flags": [],
  "recommended_gear": [],
  "mood": "good | caution | warning"
}
利用可能なgear slugs: trail_shoes_beginner, trail_shoes_intermediate, trail_shoes_advanced, waterproof_shoes, rain_jacket, rain_pants, windshell, hat, trekking_poles, energy_gel, headlamp, gloves`;
}

export const SYSTEM_PROMPT = getSystemPrompt('ja');

export interface AIContext {
  weather: WeatherData;
  route: Route;
  userLevel: Difficulty;
  trailStatus?: TrailStatus;
  facilities?: Facility[];
  userQuery?: string;
  language?: Language;
}

export function buildUserPrompt(ctx: AIContext): string {
  const { weather, route, userLevel, trailStatus, facilities, userQuery, language = 'ja' } = ctx;

  const routeName = language === 'en' ? (route.name_en || route.name) : language === 'zh' ? (route.name_zh || route.name) : route.name;
  const routeFeatures = language === 'en' ? (route.features_en || route.features) : language === 'zh' ? (route.features_zh || route.features) : route.features;

  if (language === 'en') {
    const trailLines = trailStatus
      ? `[Trail Conditions] ${trailStatus.items.map(i => i.label_en || i.label).join(', ')}${trailStatus.closures.length > 0 ? '. Closures: ' + (trailStatus.closures_en || trailStatus.closures).join(', ') : ''}`
      : '';

    const facilityLines = facilities && facilities.length > 0
      ? `[Facility Status] ${facilities.map(f => `${f.name_en || f.name}: ${f.status}${f.hours ? ` (${f.hours_en || f.hours})` : ''}`).join(', ')}`
      : '';

    const queryLine = userQuery ? `[User Voice Question] "${userQuery}"` : '';

    return [
      `[Current Weather] Condition: ${weather.weather}, Temp: ${weather.temp_c}°C, Rain Prob: ${weather.rainProbability}%, Wind: ${weather.windSpeed}m/s, UV Index: ${weather.uvIndex}`,
      `[Selected Trail] ${routeName}, Distance: ${route.distanceKm}km, Elevation Gain: ${route.elevationM}m, Duration: ${route.durationMin}min, Features: ${routeFeatures.join(', ')}`,
      `[Hiker Level] ${LEVEL_LABEL.en[userLevel] || userLevel}`,
      queryLine,
      trailLines,
      facilityLines,
      'Instruction: Reply in clear, welcoming English adhering to the JSON schema.',
    ].filter(Boolean).join('\n');
  }

  if (language === 'zh') {
    const trailLines = trailStatus
      ? `【登山道状况】${trailStatus.items.map(i => i.label_zh || i.label).join('、')}${trailStatus.closures.length > 0 ? '。封闭路段: ' + (trailStatus.closures_zh || trailStatus.closures).join('、') : ''}`
      : '';

    const facilityLines = facilities && facilities.length > 0
      ? `【设施情况】${facilities.map(f => `${f.name_zh || f.name}: ${f.status === 'open' ? '正常开放' : f.status === 'closed' ? '已关闭' : f.status === 'crowded' ? '微拥挤' : '待确认'}${f.hours ? ` (${f.hours_zh || f.hours})` : ''}`).join('、')}`
      : '';

    const queryLine = userQuery ? `【顾客语音提问】“${userQuery}”` : '';

    return [
      `【当前天气】天气: ${weather.weather}, 气温: ${weather.temp_c}℃, 降水概率: ${weather.rainProbability}%, 风速: ${weather.windSpeed}m/s, 紫外线指数: ${weather.uvIndex}`,
      `【选择路线】${routeName}, 距离: ${route.distanceKm}公里, 爬升: ${route.elevationM}米, 预计耗时: ${route.durationMin}分钟, 特点: ${routeFeatures.join('、')}`,
      `【顾客水平】${LEVEL_LABEL.zh[userLevel] || userLevel}`,
      queryLine,
      trailLines,
      facilityLines,
      '指令要求: 请使用地道流畅的中文回答，并严格遵循JSON格式输出。',
    ].filter(Boolean).join('\n');
  }

  const trailLines = trailStatus
    ? `【登山道状況】${trailStatus.items.map(i => i.label).join('、')}${trailStatus.closures.length > 0 ? '。通行止め: ' + trailStatus.closures.join('・') : ''}`
    : '';

  const facilityLines = facilities && facilities.length > 0
    ? `【施設情報】${facilities.map(f => `${f.name}:${f.status === 'open' ? '営業中' : f.status === 'closed' ? '閉鎖中' : f.status === 'crowded' ? '混雑中' : '不明'}${f.hours ? ` (${f.hours})` : ''}`).join('、')}`
    : '';

  const queryLine = userQuery ? `【来店者の質問・要望（音声入力）】「${userQuery}」` : '';

  return [
    `【現在の天気】天気: ${weather.weather}, 気温: ${weather.temp_c}℃, 降水確率: ${weather.rainProbability}%, 風速: ${weather.windSpeed}m/s, UV指数: ${weather.uvIndex}`,
    `【選択ルート】${routeName}, 距離: ${route.distanceKm}km, 標高差: ${route.elevationM}m, 所要: ${route.durationMin}分, 特徴: ${routeFeatures.join('・')}`,
    `【来店者レベル】${LEVEL_LABEL.ja[userLevel] || userLevel}`,
    queryLine,
    trailLines,
    facilityLines,
  ].filter(Boolean).join('\n');
}

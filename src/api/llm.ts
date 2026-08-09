import type { WeatherData, Route, Difficulty, AdviceResponse } from '@/types';

const LEVEL_LABEL: Record<Difficulty, string> = {
  beginner:     '初心者（ハイキング経験1年未満、体力普通）',
  intermediate: '中級者（ハイキング経験3年程度、体力あり）',
  advanced:     '上級者（登山・トレイルラン経験豊富、体力高い）',
};

function buildSystemPrompt(): string {
  return `あなたは「山守（やまもり）」、サロモン高尾店のAIマウンテンコンシェルジュです。
安全を最優先に、山の魅力を伝えることが使命です。丁寧で親しみやすい口調で話してください。
必ず以下のJSON形式のみで返答してください。
{
  "advice_text": "メインアドバイス（150〜250文字）",
  "advice_short": "短縮版（80文字以内）",
  "safety_flags": [],
  "recommended_gear": [],
  "mood": "good | caution | warning"
}
利用可能なgear slugs: trail_shoes_beginner, trail_shoes_intermediate, trail_shoes_advanced, waterproof_shoes, rain_jacket, rain_pants, windshell, hat, trekking_poles, energy_gel, headlamp, gloves`;
}

export async function getAIAdvice(
  weather: WeatherData,
  route: Route,
  userLevel: Difficulty
): Promise<AdviceResponse> {
  // In Next.js, call our own API route to keep the key server-side
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weather, route, userLevel }),
    });
    if (res.ok) {
      const data = await res.json() as AdviceResponse;
      return data;
    }
  } catch {
    // fall through to fallback
  }
  return buildFallbackAdvice(weather, route, userLevel);
}

function buildFallbackAdvice(weather: WeatherData, route: Route, userLevel: Difficulty): AdviceResponse {
  const safety_flags: string[] = [];
  const recommended_gear: string[] = [];
  if (weather.uvIndex >= 6) safety_flags.push('high_uv');
  if (weather.temp_c >= 27) safety_flags.push('heat_caution');
  if (weather.rainProbability >= 60) safety_flags.push('rain_gear_required');
  if (weather.rainProbability >= 40) safety_flags.push('slippery_trail');
  if (weather.windSpeed >= 7) safety_flags.push('strong_wind');
  if (route.distanceKm >= 15) safety_flags.push('long_distance_caution');
  recommended_gear.push(`trail_shoes_${userLevel}`);
  if (weather.rainProbability >= 60) recommended_gear.push('rain_jacket', 'waterproof_shoes');
  if (weather.windSpeed >= 7) recommended_gear.push('windshell');
  if (weather.uvIndex >= 6) recommended_gear.push('hat');
  if (route.distanceKm >= 10) recommended_gear.push('trekking_poles', 'energy_gel');
  const mood = weather.rainProbability >= 90 ? 'warning' : weather.rainProbability >= 40 || weather.windSpeed >= 7 ? 'caution' : 'good';
  const weatherDesc = weather.weatherCode === 'sunny' ? `晴れて気温${weather.temp_c}℃` : weather.weatherCode === 'rainy' ? `雨模様で気温${weather.temp_c}℃` : `曇りで気温${weather.temp_c}℃`;
  return {
    advice_text: `今日の高尾山は${weatherDesc}です。${route.name}は${route.distanceKm}kmのコース。${safety_flags.includes('rain_gear_required') ? '雨具は必ず持参してください。' : safety_flags.includes('high_uv') ? '紫外線が強いので帽子と日焼け止めをお忘れなく。' : 'コンディションを確認しながら楽しく歩きましょう。'}水分補給はこまめに行い、無理のないペースで楽しんでください。`,
    advice_short: `${weatherDesc}。${route.name}を楽しんで。`,
    safety_flags,
    recommended_gear,
    mood,
  };
}

export { buildSystemPrompt, LEVEL_LABEL };

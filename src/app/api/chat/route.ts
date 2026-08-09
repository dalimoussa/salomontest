import { NextRequest, NextResponse } from 'next/server';
import type { WeatherData, Route, Difficulty, AdviceResponse } from '@/types';

const LEVEL_LABEL: Record<Difficulty, string> = {
  beginner:     '初心者（ハイキング経験1年未満、体力普通）',
  intermediate: '中級者（ハイキング経験3年程度、体力あり）',
  advanced:     '上級者（登山・トレイルラン経験豊富、体力高い）',
};

const SYSTEM_PROMPT = `あなたは「山守（やまもり）」、サロモン高尾店のAIマウンテンコンシェルジュです。
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

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'no_api_key' }, { status: 503 });
  }

  const { weather, route, userLevel } = await req.json() as {
    weather: WeatherData;
    route: Route;
    userLevel: Difficulty;
  };

  const userPrompt = `【現在の天気】天気: ${weather.weather}, 気温: ${weather.temp_c}℃, 降水確率: ${weather.rainProbability}%, 風速: ${weather.windSpeed}m/s, UV指数: ${weather.uvIndex}
【選択ルート】${route.name}, 距離: ${route.distanceKm}km, 標高差: ${route.elevationM}m, 所要: ${route.durationMin}分, 特徴: ${route.features.join('・')}
【来店者】${LEVEL_LABEL[userLevel]}`;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(14000),
  });

  if (!openaiRes.ok) {
    return NextResponse.json({ error: 'openai_error' }, { status: 502 });
  }

  const data = await openaiRes.json() as { choices: Array<{ message: { content: string } }> };
  const advice = JSON.parse(data.choices[0].message.content) as AdviceResponse;
  return NextResponse.json(advice);
}

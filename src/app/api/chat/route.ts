import { NextRequest, NextResponse } from 'next/server';
import type { AdviceResponse, WeatherData, Route, Difficulty } from '@/types';
import { getSystemPrompt, buildUserPrompt, type AIContext } from '@/lib/prompts';
import { buildFallbackAdvice, findRouteByQuery } from '@/api/llm';
import { ROUTES } from '@/data/routes';

export async function POST(req: NextRequest) {
  let rawBody: Partial<AIContext>;
  try {
    rawBody = await req.json() as Partial<AIContext>;
  } catch {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 });
  }

  const effectiveRoute: Route = rawBody.route || (rawBody.userQuery ? findRouteByQuery(rawBody.userQuery) : null) || ROUTES[0];
  const effectiveWeather: WeatherData = rawBody.weather || {
    temp_c: 20,
    weather: '晴れ',
    weatherCode: 'sunny',
    windSpeed: 2,
    rainProbability: 0,
    precipitationMmh: 0,
    uvIndex: 3,
    visibility: 10,
    updatedAt: new Date().toISOString(),
  };
  const effectiveLevel: Difficulty = rawBody.userLevel || 'beginner';
  const effectiveLang = rawBody.language || 'ja';

  const ctx: AIContext = {
    ...rawBody,
    weather: effectiveWeather,
    route: effectiveRoute,
    userLevel: effectiveLevel,
    language: effectiveLang,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Offline / zero-key mode: return local mountain knowledge advice with 200 OK
    const fallback = buildFallbackAdvice(
      ctx.weather,
      ctx.route,
      ctx.userLevel,
      ctx.userQuery,
      ctx.language
    );
    return NextResponse.json(fallback, { status: 200 });
  }

  const systemPrompt = getSystemPrompt(ctx.language);
  const userPrompt = buildUserPrompt(ctx);

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  let openaiRes: Response;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(7_000),
    });
  } catch (err) {
    console.error('[/api/chat] OpenAI fetch failed (timeout or network):', err);
    // Graceful degradation: return local deterministic advice instead of an error
    const fallback = buildFallbackAdvice(
      ctx.weather,
      ctx.route,
      ctx.userLevel,
      ctx.userQuery,
      ctx.language
    );
    return NextResponse.json(fallback, { status: 200 });
  }

  if (!openaiRes.ok) {
    const body = await openaiRes.text().catch(() => '');
    console.error('[/api/chat] OpenAI error:', openaiRes.status, body);
    const fallback = buildFallbackAdvice(
      ctx.weather,
      ctx.route,
      ctx.userLevel,
      ctx.userQuery,
      ctx.language
    );
    return NextResponse.json(fallback, { status: 200 });
  }

  const raw = await openaiRes.json() as { choices: Array<{ message: { content: string } }> };

  let advice: AdviceResponse;
  try {
    advice = JSON.parse(raw.choices[0].message.content) as AdviceResponse;
  } catch {
    console.error('[/api/chat] JSON parse failed, raw content:', raw.choices[0]?.message?.content);
    const fallback = buildFallbackAdvice(
      ctx.weather,
      ctx.route,
      ctx.userLevel,
      ctx.userQuery,
      ctx.language
    );
    return NextResponse.json(fallback, { status: 200 });
  }

  return NextResponse.json(advice);
}

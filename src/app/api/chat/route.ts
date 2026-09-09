import { NextRequest, NextResponse } from 'next/server';
import type { AdviceResponse } from '@/types';
import { getSystemPrompt, buildUserPrompt, type AIContext } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'no_api_key' }, { status: 503 });
  }

  let ctx: AIContext;
  try {
    ctx = await req.json() as AIContext;
  } catch {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 });
  }

  const systemPrompt = getSystemPrompt(ctx.language || 'ja');
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
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(14_000),
    });
  } catch (err) {
    console.error('[/api/chat] OpenAI fetch failed:', err);
    return NextResponse.json({ error: 'openai_timeout' }, { status: 504 });
  }

  if (!openaiRes.ok) {
    const body = await openaiRes.text().catch(() => '');
    console.error('[/api/chat] OpenAI error:', openaiRes.status, body);
    return NextResponse.json({ error: 'openai_error', status: openaiRes.status }, { status: 502 });
  }

  const raw = await openaiRes.json() as { choices: Array<{ message: { content: string } }> };

  let advice: AdviceResponse;
  try {
    advice = JSON.parse(raw.choices[0].message.content) as AdviceResponse;
  } catch {
    console.error('[/api/chat] JSON parse failed, raw content:', raw.choices[0]?.message?.content);
    return NextResponse.json({ error: 'parse_error' }, { status: 502 });
  }

  return NextResponse.json(advice);
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

  let openaiStatus = 'not_configured';
  let openaiError: string | null = null;

  if (hasKey) {
    try {
      // Test OpenAI Speech API directly
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'onyx',
          input: 'テスト',
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        openaiStatus = 'active_working';
      } else {
        const errJson = await res.json().catch(() => null);
        openaiStatus = 'api_error';
        openaiError = errJson?.error?.message || `HTTP ${res.status}`;
      }
    } catch (e: any) {
      openaiStatus = 'exception';
      openaiError = e?.message || 'network_error';
    }
  }

  return NextResponse.json({
    openai_configured: hasKey,
    openai_status: openaiStatus,
    openai_error: openaiError,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    tts_voice: 'onyx',
    tts_model: 'tts-1',
    mode: openaiStatus === 'active_working' ? 'openai_studio_voice' : 'google_or_browser_fallback',
    timestamp: new Date().toISOString(),
  });
}


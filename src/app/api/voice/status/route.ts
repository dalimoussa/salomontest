import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let cachedStatus: { status: string; error: string | null; lastChecked: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

  let openaiStatus = 'not_configured';
  let openaiError: string | null = null;

  if (hasKey) {
    const now = Date.now();
    if (cachedStatus && now - cachedStatus.lastChecked < CACHE_TTL_MS) {
      openaiStatus = cachedStatus.status;
      openaiError = cachedStatus.error;
    } else {
      try {
        // Test OpenAI Speech API directly with short timeout
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
          signal: AbortSignal.timeout(3000),
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
      cachedStatus = { status: openaiStatus, error: openaiError, lastChecked: now };
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


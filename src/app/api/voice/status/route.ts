import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

  return NextResponse.json({
    openai_configured: hasKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    tts_voice: 'alloy',
    tts_model: 'tts-1',
    mode: hasKey ? 'openai_studio_voice' : 'browser_speech_synth',
    timestamp: new Date().toISOString(),
  });
}

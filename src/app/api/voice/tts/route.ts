import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ fallback: true, mode: 'browser_synth' }, { status: 200 });
  }

  try {
    const { text, language = 'ja', voice = 'alloy' } = await req.json() as {
      text: string;
      language?: string;
      voice?: string;
    };

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'empty_text' }, { status: 400 });
    }

    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice === 'shimmer' ? 'shimmer' : 'alloy',
        input: text.slice(0, 1000),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => '');
      console.error('[/api/voice/tts] OpenAI TTS error:', ttsRes.status, errText);
      return NextResponse.json({ error: 'tts_api_error', details: errText }, { status: 502 });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[/api/voice/tts] TTS exception:', err);
    return NextResponse.json({ error: 'tts_internal_error' }, { status: 500 });
  }
}

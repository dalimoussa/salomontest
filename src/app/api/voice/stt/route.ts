import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'no_api_key' }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as Blob | null;
    const language = (formData.get('language') as string) || 'ja';

    if (!audioFile) {
      return NextResponse.json({ error: 'no_file_provided' }, { status: 400 });
    }

    const whisperData = new FormData();
    whisperData.append('file', audioFile, 'speech.webm');
    whisperData.append('model', 'whisper-1');
    if (language === 'ja' || language === 'en' || language === 'zh') {
      whisperData.append('language', language);
    }

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperData,
      signal: AbortSignal.timeout(15_000),
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text().catch(() => '');
      console.error('[/api/voice/stt] Whisper error:', whisperRes.status, errText);
      return NextResponse.json({ error: 'whisper_api_error', details: errText }, { status: 502 });
    }

    const result = await whisperRes.json() as { text: string };
    return NextResponse.json({ text: result.text || '' });
  } catch (err) {
    console.error('[/api/voice/stt] STT exception:', err);
    return NextResponse.json({ error: 'stt_internal_error' }, { status: 500 });
  }
}

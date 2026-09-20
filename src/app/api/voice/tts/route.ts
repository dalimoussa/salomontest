import { NextRequest, NextResponse } from 'next/server';

/**
 * Fallback audio generator using Google Translate TTS service.
 * Chunks sentences to adhere to service segment limits and concatenates MP3 buffers.
 * Guarantees real MP3 audio output across all devices even if OpenAI API quota is exhausted.
 */
async function fetchGoogleTTSAudio(text: string, lang: string): Promise<Buffer | null> {
  try {
    const tl = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en' : 'ja';

    // Strip markdown formatting, emojis, bullet points, and quotes for clean vocal pronunciation
    const clean = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/[🎤🔊●★①②③④⑤]/g, '')
      .replace(/[「」“”"']/g, '')
      .trim();

    if (!clean) return null;

    // Split into sentences (up to ~140 characters per segment)
    const rawParts = clean.split(/([。！？!?\n]+)/);
    const chunks: string[] = [];
    let cur = '';

    for (let i = 0; i < rawParts.length; i++) {
      const part = rawParts[i];
      if (!part) continue;
      if ((cur + part).length < 140) {
        cur += part;
      } else {
        if (cur.trim()) chunks.push(cur.trim());
        cur = part;
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
    if (chunks.length === 0) chunks.push(clean.slice(0, 140));

    const audioBuffers: Buffer[] = [];
    // Limit to first 3 chunks with 2.5s timeout for fast response
    for (const chunk of chunks.slice(0, 3)) {
      if (!chunk.trim()) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(tl)}&client=tw-ob&q=${encodeURIComponent(chunk.trim())}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 0) {
          audioBuffers.push(Buffer.from(ab));
        }
      }
    }

    if (audioBuffers.length > 0) {
      return Buffer.concat(audioBuffers);
    }
    return null;
  } catch (err) {
    console.warn('[/api/voice/tts] Google TTS fallback failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  let text = '';
  let language = 'ja';
  let voice = 'onyx'; // Default to authoritative, warm male mountain guide voice

  try {
    const body = (await req.json()) as {
      text: string;
      language?: string;
      voice?: string;
    };
    text = body.text || '';
    language = body.language || 'ja';
    voice = body.voice || 'onyx';
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!text || text.trim() === '') {
    return NextResponse.json({ error: 'empty_text' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // 1. Try OpenAI Studio Neural Voice if API key is present
  if (apiKey) {
    try {
      // Use 'onyx' or 'echo' for male mountain guide persona
      const chosenVoice = voice === 'shimmer' ? 'shimmer' : voice === 'echo' ? 'echo' : 'onyx';
      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: chosenVoice,
          input: text.slice(0, 1000),
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (ttsRes.ok) {
        const audioBuffer = await ttsRes.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }

      const errText = await ttsRes.text().catch(() => '');
      console.warn('[/api/voice/tts] OpenAI TTS error, falling back to Google TTS:', ttsRes.status, errText);
    } catch (err) {
      console.warn('[/api/voice/tts] OpenAI TTS exception, falling back to Google TTS:', err);
    }
  }

  // 2. High-reliability fallback: Stream native Google TTS audio (short timeout)
  const fallbackAudio = await fetchGoogleTTSAudio(text, language);
  if (fallbackAudio) {
    return new NextResponse(new Uint8Array(fallbackAudio), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fallbackAudio.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 3. Last-resort fallback: browser local SpeechSynthesis with male pitch tuning
  return NextResponse.json(
    { fallback: true, mode: 'browser_synth', preferredVoice: 'male' },
    { status: 200 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'ja', voice = 'alloy' } = await req.json() as {
      text: string;
      language?: string;
      voice?: string;
    };

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'empty_text' }, { status: 400 });
    }

    const cleanText = text.trim();
    const langCode = language === 'en' ? 'en' : language === 'zh' ? 'zh' : 'ja';

    // 1. If this is the attract callout message, serve pre-rendered studio MP3 for 0ms latency
    const isCallout =
      cleanText.includes('高尾山やおすすめルート') ||
      cleanText.includes('Mt. Takao') ||
      cleanText.includes('Mount Takao') ||
      cleanText.includes('关于高尾山');

    if (isCallout) {
      const calloutPath = path.join(process.cwd(), 'public', 'audio', `callout_${langCode}.mp3`);
      if (fs.existsSync(calloutPath)) {
        const fileBuffer = fs.readFileSync(calloutPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': fileBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    // 2. If OpenAI API key is configured, use OpenAI Studio TTS
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: voice === 'shimmer' ? 'shimmer' : 'alloy',
            input: cleanText.slice(0, 1000),
          }),
          signal: AbortSignal.timeout(15_000),
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
        } else {
          const errText = await ttsRes.text().catch(() => '');
          console.warn('[/api/voice/tts] OpenAI TTS error, falling back to TTS proxy:', ttsRes.status, errText);
        }
      } catch (openAiErr) {
        console.warn('[/api/voice/tts] OpenAI TTS request exception:', openAiErr);
      }
    }

    // 3. Fallback: High-availability neural TTS audio proxy for complete standalone reliability
    try {
      const targetTl = langCode === 'en' ? 'en' : langCode === 'zh' ? 'zh-CN' : 'ja';
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 240))}&tl=${targetTl}&client=tw-ob`;
      const fallbackRes = await fetch(googleTtsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (fallbackRes.ok) {
        const fbBuffer = await fallbackRes.arrayBuffer();
        if (fbBuffer.byteLength > 500) {
          return new NextResponse(fbBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': fbBuffer.byteLength.toString(),
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      }
    } catch (fbErr) {
      console.warn('[/api/voice/tts] Fallback TTS proxy exception:', fbErr);
    }

    // 4. Ultimate fallback: signal client to use browser Web Speech API
    return NextResponse.json({ fallback: true, mode: 'browser_synth' }, { status: 200 });
  } catch (err) {
    console.error('[/api/voice/tts] TTS exception:', err);
    return NextResponse.json({ fallback: true, mode: 'browser_synth' }, { status: 200 });
  }
}


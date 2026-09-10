/**
 * /api/voice/realtime-token — Issues a short-lived ephemeral OpenAI Realtime session token.
 *
 * WHY: The OpenAI Realtime API WebSocket cannot be proxied through Vercel's
 * serverless functions (long-lived connections are not supported). Instead,
 * we use OpenAI's official "ephemeral key" pattern:
 *
 *   1. Browser calls this endpoint (POST)
 *   2. Server calls OpenAI REST to mint a 1-minute ephemeral client_secret
 *   3. Browser connects DIRECTLY to wss://api.openai.com/v1/realtime
 *      using the ephemeral key (not the real API key — safe to use client-side)
 *
 * The ephemeral key expires after 60 seconds regardless of whether it was used,
 * and each session auto-expires after 30 minutes of inactivity.
 *
 * Ref: https://platform.openai.com/docs/guides/realtime-webrtc#creating-an-ephemeral-token
 */
import { NextRequest, NextResponse } from 'next/server';

function buildSystemPrompt(language = 'ja'): string {
  if (language === 'en') {
    return (
      'You are "Yamamori" (Mountain Guardian), the Salomon Mt. Takao Store AI Mountain Concierge. ' +
      'Help hikers visiting the Salomon store at the base of Mt. Takao with friendly, expert advice. ' +
      'Speak naturally and conversationally. ' +
      'Cover: trail recommendations, gear selection, weather conditions, cable car schedules, facilities, and safety. ' +
      'If you don\'t know something, say so honestly. ' +
      'Keep each response under 150 words. Be warm, encouraging, and safety-conscious.'
    );
  }
  if (language === 'zh') {
    return (
      '你是"山守"，萨洛蒙高尾山专营店的AI山野向导。' +
      '用亲切、专业的语气，帮助到访萨洛蒙专营店的顾客。' +
      '用自然流畅的对话风格回答。' +
      '专注解答：路线推荐、装备选择、天气、缆车、设施、安全。' +
      '不知道的信息请如实说明。每次回答150字以内。温暖积极，安全第一。'
    );
  }
  return (
    'あなたは「山守（やまもり）」、サロモン高尾店のAIマウンテンコンシェルジュです。' +
    '高尾山の麓にあるサロモン専門店を訪れたお客様に、親しみやすく専門的なアドバイスを提供してください。' +
    '自然な会話形式でお話しください。' +
    '対応内容：コース案内、ギアの選択、天気、ケーブルカー、施設、安全注意。' +
    'コンテキストにない情報は正直にお伝えください。' +
    '1回の回答は150文字以内を目安に、丁寧で温かい口調でお話しください。'
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'no_api_key', message: 'OPENAI_API_KEY not configured' },
      { status: 503 }
    );
  }

  const { language = 'ja' } = await req.json().catch(() => ({})) as { language?: string };
  const systemPrompt = buildSystemPrompt(language);

  try {
    const res = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-4o-realtime-preview-2024-12-17',
          modalities: ['audio', 'text'],
          instructions: systemPrompt,
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: { model: 'whisper-1' },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 600,
          },
          temperature: 0.8,
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[realtime-token] OpenAI session create error:', res.status, errText);
      return NextResponse.json(
        { error: 'openai_error', status: res.status, message: errText },
        { status: 502 }
      );
    }

    const data = (await res.json()) as any;
    const ephemeralKey = data.client_secret?.value || data.value;
    const expiresAt =
      data.client_secret?.expires_at ||
      data.expires_at ||
      Math.floor(Date.now() / 1000) + 60;
    const sessionId = data.session?.id || data.id || '';

    if (!ephemeralKey) {
      console.error('[realtime-token] No client_secret in OpenAI response:', data);
      return NextResponse.json(
        { error: 'no_secret_in_response' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ephemeralKey,
      expiresAt,
      sessionId,
    });
  } catch (err: any) {
    console.error('[realtime-token] Error:', err);
    return NextResponse.json(
      { error: 'internal_error', message: err?.message || String(err) },
      { status: 500 }
    );
  }
}

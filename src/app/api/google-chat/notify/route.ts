import { NextRequest, NextResponse } from 'next/server';

export interface GoogleChatPayload {
  event: 'staff_call' | 'customer_inquiry' | 'safety_alert';
  message?: string;
  routeName?: string;
  difficulty?: string;
  weatherSummary?: string;
  temp?: number;
  language?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GoogleChatPayload;
    const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;

    const eventTitle =
      body.event === 'staff_call'
        ? '🔔 【スタッフ呼び出し】店頭サイネージ端末より'
        : body.event === 'safety_alert'
        ? '⚠️ 【安全アラート検知】'
        : '💬 【お客様からのお問い合わせ】';

    const timestamp = new Date().toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Tokyo',
    });

    // Formatted Google Chat Card message
    const chatMessage = {
      cardsV2: [
        {
          cardId: `kiosk-alert-${Date.now()}`,
          card: {
            header: {
              title: 'SALOMON 高尾店 AI コンシェルジュ',
              subtitle: `${eventTitle} (${timestamp})`,
              imageUrl: 'https://salomon-next.vercel.app/salomon-logo.svg',
              imageType: 'CIRCLE',
            },
            sections: [
              {
                header: '呼出情報',
                widgets: [
                  {
                    decoratedText: {
                      topLabel: '状況',
                      text: body.message || '来店客が店頭サイネージにてスタッフの対応を求めています。',
                      wrapText: true,
                    },
                  },
                  ...(body.routeName
                    ? [
                        {
                          decoratedText: {
                            topLabel: '検討中のルート',
                            text: `${body.routeName} (${body.difficulty || '一般'})`,
                          },
                        },
                      ]
                    : []),
                  ...(body.weatherSummary
                    ? [
                        {
                          decoratedText: {
                            topLabel: '現在の天候',
                            text: `${body.weatherSummary} / 気温: ${body.temp ?? '--'}℃`,
                          },
                        },
                      ]
                    : []),
                ],
              },
              {
                widgets: [
                  {
                    buttonList: {
                      buttons: [
                        {
                          text: '管理画面を開く',
                          onClick: {
                            openLink: {
                              url: 'https://salomon-next.vercel.app/admin',
                            },
                          },
                        },
                        {
                          text: 'サイネージ画面を確認',
                          onClick: {
                            openLink: {
                              url: 'https://salomon-next.vercel.app/',
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    // If webhook URL is configured, dispatch to Google Chat
    if (webhookUrl && webhookUrl.startsWith('https://chat.googleapis.com')) {
      const gChatRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(chatMessage),
      });

      if (!gChatRes.ok) {
        const errText = await gChatRes.text();
        console.error('[/api/google-chat/notify] Google Chat error:', gChatRes.status, errText);
        return NextResponse.json({ error: 'google_chat_dispatch_failed', details: errText }, { status: 502 });
      }

      return NextResponse.json({ success: true, sent: true });
    }

    // When webhook URL is not yet configured, gracefully log and acknowledge
    console.log('[/api/google-chat/notify] Notification simulated (GOOGLE_CHAT_WEBHOOK_URL not configured):', body);
    return NextResponse.json({
      success: true,
      sent: false,
      simulated: true,
      note: 'Set GOOGLE_CHAT_WEBHOOK_URL in environment to deliver to Google Chat space.',
    });
  } catch (error) {
    console.error('[/api/google-chat/notify] Exception:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

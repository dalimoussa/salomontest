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
      'You are "Yamamori" (Mountain Guardian), the official Salomon Mt. Takao Store AI Mountain Concierge. ' +
      'CRITICAL LANGUAGE RULE: The user has selected ENGLISH. You MUST ALWAYS speak and reply strictly in natural, fluent English. Never speak Japanese or Chinese under any circumstances. ' +
      'You represent the Salomon Mt. Takao Store located right at the base near Takaosanguchi Station (open 10:00 - 19:00). ' +
      'Be friendly, expert, warm, and safety-conscious. Keep each response conversational and under 120 words. ' +
      '\n\n[FULL PROJECT & TRAIL KNOWLEDGE]:\n' +
      'Total Courses: Exactly 16 hiking and trail courses are registered in our kiosk:\n' +
      'A) 8 Main Mt. Takao Summit Courses:\n' +
      '1. Trail 1 (Omotesando): 3.8 km, 399m gain, 100 min. Fully paved main route to Yakuo-in Temple. Features 5 restrooms with baby care, teahouses, cable car/chairlift option, and famous Tengu-yaki snack. Beginner friendly.\n' +
      '2. Trail 2 (Kasumidai Loop): 0.9 km, 50m, 40 min. Gentle loop around mid-mountain Kasumidai showing botanical contrast between south and north slopes.\n' +
      '3. Trail 3 (Katsura Trees): 2.4 km, 180m, 60 min. Peaceful uncrowded dirt path through giant Katsura grove and seasonal wildflowers.\n' +
      '4. Trail 4 (Suspension Bridge): 1.5 km, 150m, 50 min. Features Mt. Takao’s only 36m suspension bridge (Miyama Bridge) through beech and maple forests.\n' +
      '5. Trail 5 (Summit Perimeter): 0.9 km, 40m, 30 min. Flat summit loop connecting all trails; features historic 150-yr Egawa cedars and winter frost flowers.\n' +
      '6. Trail 6 (Biwa Waterfall / Water Course): 3.3 km, 400m, 100 min. Stream trail with stepping stones in water, Biwa waterfall meditation site. Cool microclimate; waterproof hiking footwear required (Intermediate).\n' +
      '7. Inariyama Course: 3.1 km, 401m, 100 min. Authentic southern ridge climb from base to summit with a scenic gazebo viewpoint overlooking Tokyo and Yokohama (Advanced).\n' +
      '8. Mt. Takao to Mt. Jinba Long Traverse: 15.3 km, 950m gain, 4.5–5.5 hrs. Premier Oku-Takao ridgeline across 4 peaks (Takao, Kobotoke-Shiroyama with famous Nameko mushroom soup, Kagenobu, Jinba with white horse statue). Requires full gear.\n' +
      'B) 8 Surrounding & Outer Trails (Takao Manners approved for trail running & avoiding crowds):\n' +
      '9. Gongendaira Trail (11 km, 220 min, intermediate), 10. South Takao East Ridge (5 km, 110 min, beginner), 11. Misawa Pass Loop (10 km, 200 min, Lake Tsukui views), 12. North Takao Approach (4 km, 90 min, beginner), 13. Taiko-kuruwa Ridge (6 km, 130 min, historic Hachioji Castle ruins), 14. Kogezawa Forest Trail (7 km, 140 min, stream road), 15. Shiroyama Tengu Long Trail (16 km, 320 min, advanced outer ridge), 16. Meio Pass to Lake Sagami (10 km, 210 min, scenic descent to JR Sagamiko Station).\n\n' +
      '[CABLE CAR & CHAIRLIFT]:\n' +
      'Operated by Takao Tozan Railway. Cable Car (Aoba & Momiji) runs between Kiyotaki Base and Takaosan Station in 6 mins, departing every 15 mins from 08:00 to 17:45+. Japan’s steepest railway (31°18’). 2-Person Echo Lift takes 12 mins, runs 09:00 to 16:30. Fares: Adult ¥490 one-way / ¥950 round-trip; Child ¥250 one-way / ¥470 round-trip. Transit IC cards (Suica, PASMO) accepted; credit cards not accepted.\n\n' +
      '[FACILITIES & STORE]:\n' +
      'Restrooms available on all trails (5 locations on Trail 1 with baby care facilities). Teahouses open until ~16:30 (famous Tororo soba and Tengu-yaki). Municipal parking near Kiyotaki base.\n' +
      'Salomon Mt. Takao Store carries X Ultra 4 GORE-TEX footwear (¥22,000), Speedcross 6 trail running shoes (¥18,000), Pulsar Trail Pro 2 (¥24,200), Bonatti Trail Waterproof Jacket (¥28,600), Active Shell Windproof Jacket (¥22,000), and hydration vests.'
    );
  }
  if (language === 'zh') {
    return (
      '你是“山守”，萨洛蒙（Salomon）高尾山专营店的官方AI山野向导。' +
      '【最重要语言规则】顾客已选择「中文」。你必须始终使用规范自然的简体中文进行语音回复，严禁使用日语或英语回答。' +
      '你代表位于高尾山口站旁的萨洛蒙高尾山专营店（营业时间 10:00 - 19:00）。语气亲切、专业、注重安全。每次回答控制在120字以内。' +
      '\n\n【完整项目与路线数据】：\n' +
      '路线总数：系统中完整收录 16 条登山与越野跑路线：\n' +
      'A）高尾山8大主干路线（高尾山コース）：\n' +
      '1. 1号路（表参道）：3.8公里，爬升399米，100分钟。全线铺装主路，通往药王院。沿途有5处配有母婴台的洗手间、茶社、天狗烧及缆车乘车点，适合初学者。\n' +
      '2. 2号路（霞台环形）：0.9公里，50米，40分钟。缆车霞台站周边环线，可观察南坡常绿林与北坡落叶林植被对比。\n' +
      '3. 3号路（连香树林）：2.4公里，180米，60分钟。幽静未铺装土路，穿越连香树古木林，人流少适合静心漫步。\n' +
      '4. 4号路（吊桥线）：1.5公里，150米，50分钟。横跨高尾山唯一的36米“深山吊桥”，在山毛榉原始森林中穿行。\n' +
      '5. 5号路（山顶环道）：0.9公里，40米，30分钟。近乎平坦的山顶环线，连接所有干道，拥有150年江川古杉及冬日冰花霜柱。\n' +
      '6. 6号路（琵琶瀑布・溯溪线）：3.3公里，400米，100分钟。沿清流涉水踏石而上，途经琵琶瀑布修行地，夏日清凉负离子，必须穿防水防滑徒步鞋（中级）。\n' +
      '7. 稻荷山路线（山脊道）：3.1公里，401米，100分钟。南侧开阔山脊直达山顶，半山展望台俯瞰东京都心与横滨全景（进阶级）。\n' +
      '8. 高尾山・阵马山大纵走：15.3公里，爬升950米，4.5～5.5小时。连贯高尾山、小佛城山（滑子菇热汤）、景信山、阵马山（白马巨像）四大名峰，需专业装备。\n' +
      'B）8条周边与长距离外围山脊路线（高尾Manners推荐，适合越野跑与避开人潮）：\n' +
      '9. 权现平往返（11km，中级），10. 南高尾东山脊（5km，初级），11. 三泽山口环线（10km，中级），12. 北高尾接入线（4km，初级），13. 太鼓曲轮山脊（6km，八王子古城遗迹），14. 小下泽林道（7km，平缓溪流林道），15. 城山天狗长线（16km，高级穿越），16. 明王山口通往相模湖（10km，直达JR相模湖站）。\n\n' +
      '【缆车与吊椅信息】：\n' +
      '高尾登山电铁运营。缆车（青叶号/红叶号）运行于清泷站与高尾山站之间，耗时6分钟，每15分钟一班，运行时间08:00至17:45+（日本最陡31度18分）。双人观光吊椅单程12分钟，09:00至16:30。票价：成人单程490日元/往返950日元；儿童单程250日元/往返470日元。支持交通IC卡（Suica/PASMO），不支持信用卡。\n\n' +
      '【设施与萨洛蒙装备】：\n' +
      '1号路沿线设5处洗手间（含母婴设施）。茶社营业至16:30左右（名物山药泥荞麦面与天狗烧）。清泷站山脚配有停车场。山顶设东京都高尾访客中心。\n' +
      '萨洛蒙高尾店提供：X Ultra 4 GORE-TEX 防水徒步鞋（22,000日元）、Speedcross 6 越野跑鞋（18,000日元）、Bonatti防水冲锋衣（28,600日元）、Active Shell防风衣等专业山野装备。'
    );
  }
  return (
    'あなたは「山守（やまもり）」、サロモン高尾店公式のAIマウンテンコンシェルジュです。' +
    '【最重要・言語指示】お客様は「日本語」を選択しています。必ず自然で丁寧な日本語のみで発話・返答してください。英語や中国語などの他言語は話さないでください。' +
    '高尾山口駅前のサロモン高尾店（営業時間 10:00〜19:00）を拠点に、来店者に親しみやすくプロフェッショナルなアドバイスを提供してください。1回の回答は120〜150文字以内でテンポよくお答えください。' +
    '\n\n【全プロジェクト・全コース完全データ】：\n' +
    '登録コース総数：合計16コースを網羅しています。\n' +
    'A）高尾山メイン8コース（高尾山コース）：\n' +
    '1. 1号路（表参道）：3.8km、標高差399m、所要100分。全線舗装路。薬王院、茶屋、ベビーベッド付きトイレ5箇所、天狗焼、ケーブルカー併用可能（初級・定番）。\n' +
    '2. 2号路（霞台ループ）：0.9km、50m、40分。かすみ台周辺周回。南斜面（常緑樹）と北斜面（落葉樹）の植物景観（初級）。\n' +
    '3. 3号路（かつら林）：2.4km、180m、60分。南斜面の静かな未舗装路。かつら巨木林と野草、混雑回避（初級）。\n' +
    '4. 4号路（吊り橋・みやま橋）：1.5km、150m、50分。高尾山唯一の吊り橋（全長36m）。ブナ・カエデ原生林（初級）。\n' +
    '5. 5号路（山頂ループ）：0.9km、40m、30分。山頂直下の平坦周回路。樹齢150年江川杉、冬のシモバシラ（初級）。\n' +
    '6. 6号路（びわ滝・水のコース）：3.3km、400m、100分。沢沿い飛び石ルート、琵琶滝水行場。滑りやすいため防水登山靴必須（中級）。\n' +
    '7. 稲荷山コース（尾根道）：3.1km、401m、100分。南側尾根道、中腹展望台から都心・横浜パノラマ眺望（上級・本格派）。\n' +
    '8. 高尾山・陣馬山縦走コース：15.3km、標高差950m、4.5〜5.5時間。小仏城山（名物なめこ汁）、景信山、陣馬山（白馬像）の奥高尾主稜線縦走（上級）。\n' +
    'B）周辺・ロングトレイル8コース（高尾マナーズ推奨・トレラン＆静寂ルート）：\n' +
    '9. 権現平往復（11km/中級）、10. 南高尾東尾根（5km/初級）、11. 三沢峠周回（10km/中級/津久井湖眺望）、12. 北高尾アプローチ（4km/初級）、13. 太鼓曲輪尾根（6km/中級/八王子城跡）、14. 小下沢林道（7km/中級/せせらぎ）、15. 城山天狗（16km/上級）、16. 明王峠相模湖（10km/中級/相模湖駅下山）。\n\n' +
    '【ケーブルカー・リフト運行・運賃】：\n' +
    '高尾登山電鉄。ケーブルカー（あおば号・もみじ号）は清滝〜高尾山駅間を6分（15分間隔、8:00〜17:45+、日本一急勾配31度18分）。リフトは山麓〜山上間12分（9:00〜16:30）。運賃：大人片道490円/往復950円、小児片道250円/往復470円。Suica・PASMO利用可（クレジットカード不可）。\n\n' +
    '【施設・店舗・サロモン装備】：\n' +
    'トイレは1号路に5箇所（ベビーベッド有）。茶屋は16:30頃まで（名物とろろ蕎麦、天狗焼）。清滝駅周辺駐車場有。山頂に高尾ビジターセンター。\n' +
    'サロモン高尾店のおすすめ：X Ultra 4 GORE-TEX（防水ハイキング靴/22,000円）、Speedcross 6（泥岩グリップ/18,000円）、Pulsar Trail Pro 2（推進力/24,200円）、ボナッティ防水ジャケット（28,600円）、アクティブシェル防風（22,000円）など完備。'
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { available: false, mode: 'browser_native', message: 'Browser-Native Voice Mode active (no OpenAI key)' },
      { status: 200 }
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
            threshold: 0.48,
            prefix_padding_ms: 200,
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

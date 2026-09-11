/**
 * Client-side LLM helper.
 *
 * - Calls /api/chat (server-side) which holds the OpenAI key.
 * - Falls back to buildFallbackAdvice() if the server is unreachable or
 *   the key is missing — the kiosk always shows something useful.
 */
import type { WeatherData, Route, Difficulty, AdviceResponse, TrailStatus, Facility } from '@/types';
import { buildUserPrompt, type AIContext } from '@/lib/prompts';
import { ROUTES } from '@/data/routes';
import type { Language } from '@/lib/i18n';

export function findRouteByQuery(query: string): Route | null {
  const s = query.toLowerCase();
  if (/\b(?:trail|route|course|no\.?|number)\s*6\b|6号路|びわ|biwa|waterfall/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_6') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*2\b|2号路|霞台|kasumidai|2\.cas/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_2') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*3\b|3号路|かつら|katsura/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_3') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*4\b|4号路|吊り橋|suspension|miyama|tsuribashi/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_4') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*5\b|5号路|山頂ループ|summit loop/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_5') || null;
  }
  if (/\b(?:trail|route|course|no\.?|number)\s*1\b|1号路|表参道|omotesando/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_1') || null;
  }
  if (/稲荷山|inariyama/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_inariyama') || null;
  }
  if (/城山|天狗|tengu|shiroyama/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_tengu') || null;
  }
  if (/権現|gongen/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_gongen') || null;
  }
  if (/三沢|misawa/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_misawa') || null;
  }
  if (/南高尾|minami/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_minamitakao') || null;
  }
  if (/小下沢|koge/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_kogezawa') || null;
  }
  if (/太鼓|taiko/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_taiko') || null;
  }
  if (/北高尾|kita/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_kitaapproach') || null;
  }
  if (/明王|相模湖|meio|sagami/i.test(s)) {
    return ROUTES.find(r => r.id === 'trail_meio') || null;
  }
  if (/景信|kagenobu/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_kagenobu') || null;
  }
  if (/陣馬|jinba/i.test(s)) {
    return ROUTES.find(r => r.id === 'route_jinba') || null;
  }
  return null;
}

export async function getAIAdvice(
  weather: WeatherData,
  route: Route,
  userLevel: Difficulty,
  trailStatus?: TrailStatus,
  facilities?: Facility[],
  userQuery?: string,
  language: Language = 'ja'
): Promise<AdviceResponse> {
  const matchedRoute = userQuery ? findRouteByQuery(userQuery) : null;
  const effectiveRoute = matchedRoute || route;
  const effectiveLevel = matchedRoute ? matchedRoute.difficulty : userLevel;

  const ctx: AIContext = {
    weather,
    route: effectiveRoute,
    userLevel: effectiveLevel,
    trailStatus,
    facilities,
    userQuery,
    language,
  };
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx),
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const data = await res.json() as AdviceResponse;
      return data;
    }
  } catch {
    // fall through to deterministic fallback
  }
  return buildFallbackAdvice(weather, effectiveRoute, effectiveLevel, userQuery, language);
}

export function buildFallbackAdvice(
  weatherInput?: WeatherData,
  routeInput?: Route,
  userLevelInput?: Difficulty,
  userQuery?: string,
  initialLanguage: Language = 'ja'
): AdviceResponse {
  const weather: WeatherData = weatherInput || {
    temp_c: 20,
    weather: '晴れ',
    weatherCode: 'sunny',
    windSpeed: 2,
    rainProbability: 0,
    precipitationMmh: 0,
    uvIndex: 3,
    visibility: 10,
    updatedAt: new Date().toISOString(),
  };
  const route: Route = routeInput || (userQuery ? findRouteByQuery(userQuery) : null) || ROUTES[0];
  const userLevel: Difficulty = userLevelInput || 'beginner';
  const hasLatinChars = /[a-zA-Z]{2,}/.test(userQuery || '');
  const language: Language = (initialLanguage === 'en' || (hasLatinChars && initialLanguage !== 'zh')) ? 'en' : initialLanguage;

  const safety_flags: string[]     = [];
  const recommended_gear: string[] = [];

  if (weather.uvIndex >= 6)          safety_flags.push('high_uv');
  if (weather.temp_c >= 27)          safety_flags.push('heat_caution');
  if (weather.rainProbability >= 60) safety_flags.push('rain_gear_required');
  if (weather.rainProbability >= 40) safety_flags.push('slippery_trail');
  if (weather.windSpeed >= 7)        safety_flags.push('strong_wind');
  if (route.distanceKm >= 15)        safety_flags.push('long_distance_caution');

  recommended_gear.push(`trail_shoes_${userLevel}`);
  if (weather.rainProbability >= 60) recommended_gear.push('rain_jacket', 'waterproof_shoes');
  if (weather.windSpeed >= 7)        recommended_gear.push('windshell');
  if (weather.uvIndex >= 6)          recommended_gear.push('hat');
  if (route.distanceKm >= 10)        recommended_gear.push('trekking_poles', 'energy_gel');

  const mood =
    weather.rainProbability >= 90 ? 'warning' :
    weather.rainProbability >= 40 || weather.windSpeed >= 7 ? 'caution' : 'good';

  const routeName = language === 'en' ? (route.name_en || route.name) : language === 'zh' ? (route.name_zh || route.name) : route.name;
  const q = (userQuery || '').toLowerCase();

  // ── General Question Intent Responses ──
  // 0. Course Count / Total Trails Question (e.g. "How many hiking courses are there in total?")
  if (
    q.includes('how many') ||
    q.includes('total course') ||
    q.includes('total trail') ||
    q.includes('all course') ||
    q.includes('all trail') ||
    q.includes('number of course') ||
    q.includes('number of trail') ||
    q.includes('いくつ') ||
    q.includes('何コース') ||
    q.includes('何本') ||
    q.includes('何個') ||
    q.includes('何ルート') ||
    q.includes('合計') ||
    q.includes('全部で') ||
    q.includes('多少条') ||
    q.includes('几条') ||
    q.includes('总共') ||
    q.includes('总数')
  ) {
    if (language === 'en') {
      return {
        advice_text: `There are 16 hiking and trail courses registered in total on our Salomon kiosk! This includes 8 Main Mt. Takao Summit Courses (such as Trail 1 Omotesando, Trail 4 Suspension Bridge, Trail 6 Biwa Waterfall stream walk, Inariyama ridge, and the 15.3km Mt. Takao to Mt. Jinba long traverse), plus 8 Surrounding & Outer Trails recommended by Takao Manners (such as Gongendaira, South Takao East Ridge, and Kogezawa Forest Trail). You can view full details for all 16 courses right here on the interactive screen!`,
        advice_short: `There are 16 hiking courses in total: 8 Main Summit Courses and 8 Surrounding & Outer Trails.`,
        safety_flags,
        recommended_gear: ['trail_shoes_beginner', 'trail_shoes_intermediate', 'hat'],
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山智能向导系统中总共完整收录了16条登山与越野跑路线！包含高尾山8大经典主干路线（如1号路表参道、4号路吊桥线、6号路琵琶瀑布溯溪线、稻荷山山脊道，以及15.3公里的高尾山・阵马山大纵走），以及8条高尾Manners推荐的周边与外围山脊路线（如权现平、南高尾东山脊、小下泽林道等）。您可以在电子白板上自由探索全部16条路线的实时数据！`,
        advice_short: `系统中总共收录16条路线：8条高尾山经典主干路线与8条周边外围山脊路线。`,
        safety_flags,
        recommended_gear: ['trail_shoes_beginner', 'trail_shoes_intermediate', 'hat'],
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾山デジタルガイドには、合計16本の登山・トレイルコースが登録されています！薬王院を通る定番の1号路、吊り橋の4号路、沢歩きの6号路、稲荷山、陣馬山縦走などの「メイン8コース」に加え、混雑を避けて豊かな自然を楽しめる高尾マナーズ推奨の「周辺・ロングトレイル8コース」（南高尾、小下沢、城山天狗など）を網羅しています。画面から自由にコースをお選びいただけます！`,
      advice_short: `登録コースは全部で16コース（メイン8コース＋周辺ロング8コース）です！`,
      safety_flags,
      recommended_gear: ['trail_shoes_beginner', 'trail_shoes_intermediate', 'hat'],
      mood: 'good',
    };
  }

  // 1. Beginner Route Question
  if (q.includes('初心者') || q.includes('beginner') || q.includes('easy') || q.includes('初級') || q.includes('おすすめのルート')) {
    recommended_gear.push('footwear', 'apparel');
    if (language === 'en') {
      return {
        advice_text: `For beginners, I highly recommend Trail 1 (Omotesando Trail)! It is 3.8km long, fully paved, and takes about 90 minutes. You will pass scenic tea houses, Yakuo-in Temple, and can also take the cable car halfway up if you get tired. Salomon X Ultra 4 GTX shoes are ideal for comfortable grip.`,
        advice_short: `Trail 1 (Omotesando) is the best choice for beginners! Paved and scenic (90 min).`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `对于初学者，首推“高尾山1号路（表参道）”！全长3.8公里，全程铺装路面，约需90分钟。途经药王院与传统茶屋，体力不足时还可搭乘缆车轻松上山。推荐穿着抓地防滑的Salomon越野鞋。`,
        advice_short: `初学者首选1号路（表参道）！路况优良平稳，约90分钟登顶。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `初心者の方には、舗装路で歩きやすい「1号路（表参道コース）」が最もおすすめです！全長3.8km、約90分で薬王院や茶屋を巡りながら安心して山頂へ行けます。疲れたらケーブルカーも利用可能です。足元は安定感抜群のサロモン X ULTRA 4 GORE-TEX がぴったりです。`,
      advice_short: `初心者には1号路（表参道）が一番おすすめ！舗装路で安心です。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // 2. Shoes / Footwear Question
  if (q.includes('靴') || q.includes('シューズ') || q.includes('shoe') || q.includes('footwear') || q.includes('登山靴')) {
    recommended_gear.push('footwear');
    if (language === 'en') {
      return {
        advice_text: `For Mt. Takao, Salomon X Ultra 4 GORE-TEX is the best recommendation. It combines waterproof GORE-TEX protection with Contagrip outsoles that grip firmly on wet rocks and exposed tree roots. For fast trail running, check out the Sense Ride 5.`,
        advice_short: `Salomon X Ultra 4 GORE-TEX is recommended for Takao's rocky trails.`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `在高尾山徒步，最推荐 Salomon X ULTRA 4 GORE-TEX 徒步鞋！搭载GTX防水薄膜与Contagrip耐磨大底，湿滑台阶与裸露树根路段抓地力极佳。如果喜欢轻量越野跑，推荐 Sense Ride 5。`,
        advice_short: `推荐 Salomon X ULTRA 4 GORE-TEX，防水防滑性能卓越。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾山の登山には「サロモン X ULTRA 4 GORE-TEX」が一番おすすめです！防水GORE-TEXと強力なContagripソールで、濡れた石段や木の根でも滑りにくく快適です。軽快に走りたいトレラン派には SENSE RIDE 5 も人気です。店頭で試着できます！`,
      advice_short: `おすすめはサロモン X ULTRA 4 GORE-TEX！安定したグリップ力です。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // 3. Weather / Rain Question
  if (q.includes('天気') || q.includes('雨') || q.includes('weather') || q.includes('rain') || q.includes('気温') || q.includes('temp')) {
    if (language === 'en') {
      return {
        advice_text: `Current Mt. Takao conditions: ${weather.weather}, temperature is ${weather.temp_c}°C with rain probability at ${weather.rainProbability}%. Wind is ${weather.windSpeed}m/s. Bring a lightweight windshell or Bonatti waterproof jacket for temperature changes at the summit.`,
        advice_short: `Currently ${weather.weather}, ${weather.temp_c}°C, rain probability ${weather.rainProbability}%.`,
        safety_flags,
        recommended_gear,
        mood,
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山当前天气：${weather.weather}，气温约${weather.temp_c}℃，降水概率为${weather.rainProbability}%，风速${weather.windSpeed}米/秒。山顶风大体感温度较低，建议携带轻量防风外套或Bonatti防水夹克。`,
        advice_short: `当前天气${weather.weather}，气温${weather.temp_c}℃，降水率${weather.rainProbability}%。`,
        safety_flags,
        recommended_gear,
        mood,
      };
    }
    return {
      advice_text: `現在の高尾山は【${weather.weather}】、気温は${weather.temp_c}℃、降水確率は${weather.rainProbability}%です（風速${weather.windSpeed}m/s）。山頂は風が抜けやすいため、羽織れるボナッティ防水ジャケットやウィンドシェルがあると安心です。`,
      advice_short: `現在${weather.weather}、気温${weather.temp_c}℃、降水確率${weather.rainProbability}%です。`,
      safety_flags,
      recommended_gear,
      mood,
    };
  }

  // 4. Summit View / Scenery Question
  if (q.includes('山頂') || q.includes('summit') || q.includes('富士山') || q.includes('景色') || q.includes('view') || q.includes('展望')) {
    if (language === 'en') {
      return {
        advice_text: `Mt. Takao summit stands at 599m. From the Omiharidai observation deck on clear days, you can enjoy stunning panoramic views of Mt. Fuji and the Tanzawa mountain range. Early morning climbs offer the clearest visibility!`,
        advice_short: `Summit elevation is 599m with great Mt. Fuji views on clear days.`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山山顶海拔599米，在大见晴台观景台上，晴天可以清晰远眺富士山及丹泽连峰壮丽全景。清晨及上午时段空气澄澈，视野最为开阔！`,
        advice_short: `山顶海拔599米，大见晴台可远眺富士山壮丽景色。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾山山頂は標高599mです。山頂の大見晴台からは、天気の良い日には富士山や丹沢の山並みが美しく一望できます。空気の澄んだ早朝や午前中の登山が特におすすめです！`,
      advice_short: `標高599mの山頂大見晴台からは富士山の絶景が望めます！`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // 5. Cable Car / Ropeway Question
  if (q.includes('ケーブルカー') || q.includes('cable') || q.includes('リフト') || q.includes('lift') || q.includes('時間') || q.includes('運行')) {
    if (language === 'en') {
      return {
        advice_text: `Takao Tozan Railway cable car operates between Kiyotaki Station and Takaosan Station every 15 minutes. It ascends 271 meters in about 6 minutes, with Japan's steepest railway incline of 31°18′! Fares are ¥490 one-way / ¥950 round-trip.`,
        advice_short: `Cable car runs every 15 min (Kiyotaki ⇄ Takaosan, 6 min).`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾登山电铁缆车往返于清泷站与高尾山站之间，每15分钟一班，单程仅需约6分钟（高低差271米，最大坡度达31度18分，为日本第一！）。单程票价490日元，往返950日元。`,
        advice_short: `缆车每15分钟一班，清泷站至高尾山站单程约6分钟。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾登山電鉄のケーブルカーは清滝駅〜高尾山駅間を約15分間隔で運行しています。片道約6分、最急勾配31度18分は日本一の急勾配です！運賃は大人片道490円・往復950円です。画面右上の電車アイコンから時刻表を確認できます。`,
      advice_short: `ケーブルカーは約15分間隔で運行中（片道約6分、大人490円）。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // 6. Parking / Staff Call Question
  if (q.includes('駐車場') || q.includes('parking') || q.includes('車') || q.includes('park') || q.includes('スタッフ') || q.includes('staff')) {
    if (language === 'en') {
      return {
        advice_text: `Parking is available near Kiyotaki Station at the base of Mt. Takao. It gets crowded quickly between 11:00 and 14:00 on weekends and holidays. If you need in-person assistance, store staff can assist you immediately.`,
        advice_short: `Parking is located at Kiyotaki base; fills quickly on weekends (11:00-14:00).`,
        safety_flags,
        recommended_gear,
        mood: 'caution',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山山脚清泷站周边设有停车场，周末及节假日上午11点至下午2点极易拥堵饱和，建议提早到达或搭乘京王线前往。如需店内协助，工作人员随时为您服务。`,
        advice_short: `停车场位于清泷站周边，周末11:00-14:00易满位。`,
        safety_flags,
        recommended_gear,
        mood: 'caution',
      };
    }
    return {
      advice_text: `駐車場は山麓の清滝駅周辺にございます。土日祝日の11時〜14時は満車になりやすいため、混雑時は公共交通機関のご利用が便利です。ご不明点があれば、サロモン高尾店のスタッフが詳しくご案内いたします！`,
      advice_short: `清滝駅周辺に駐車場あり。土日祝の11時〜14時は混雑します。`,
      safety_flags,
      recommended_gear,
      mood: 'caution',
    };
  }

  // 7. Restrooms & Toilet Facilities Question
  if (
    q.includes('トイレ') ||
    q.includes('お手洗い') ||
    q.includes('toilet') ||
    q.includes('restroom') ||
    q.includes('washroom') ||
    q.includes('洗手间') ||
    q.includes('厕所')
  ) {
    if (language === 'en') {
      return {
        advice_text: `Restrooms are available at Kiyotaki base station, Takaosan cable car station, along Trail 1 (5 locations with baby care tables), near Yakuo-in Temple, and at the summit visitor center. Summit and temple restrooms can get crowded during peak hours. Be sure to use the facilities before taking unpaved trails like Trail 6 or Inariyama!`,
        advice_short: `Restrooms are located at base, cable car station, Trail 1, and summit. Summit can be busy.`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山各主要区域均配备公共洗手间：清泷缆车站山脚、高尾山缆车站、1号路沿线（共有5处，均配备母婴台）、药王院境内以及山顶游客中心。周末山顶和药王院人流较多时常需排队。建议在进入6号路或稻荷山等原生态山路前先在车站附近使用洗手间！`,
        advice_short: `山脚清泷站、缆车站、1号路及山顶均有洗手间。山顶人多略显拥挤。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾山のトイレは、山麓の清滝駅、ケーブルカー高尾山駅、1号路沿い（ベビーベッド完備5箇所）、薬王院境内、そして山頂ビジターセンター横に設置されています。混雑時は山頂や薬王院のトイレに列ができることがあります。6号路や稲荷山などの自然歩道に入る前に済ませておくのがおすすめです！`,
      advice_short: `トイレは清滝駅・高尾山駅・1号路・薬王院・山頂にあり。山頂は混雑しやすいです。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // 8. Food / Local Specialties / Teahouses (Tengu-yaki, Tororo Soba, Dango)
  if (
    q.includes('食べ物') ||
    q.includes('名物') ||
    q.includes('グルメ') ||
    q.includes('天狗焼') ||
    q.includes('そば') ||
    q.includes('団子') ||
    q.includes('茶屋') ||
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('soba') ||
    q.includes('snack') ||
    q.includes('lunch') ||
    q.includes('美食') ||
    q.includes('小吃')
  ) {
    if (language === 'en') {
      return {
        advice_text: `Mt. Takao's most famous specialties are: 1) "Tengu-yaki"—crispy waffle pastries filled with sweet black soybean paste sold at Takaosan Station; 2) Local "Tororo Soba" (grated yam buckwheat noodles) served at tea houses across the mountain; and 3) Charcoal-grilled Mitsumafuku Dango (sweet rice dumplings) along Trail 1 and Yakuo-in. Most tea houses operate until around 16:30!`,
        advice_short: `Must-try foods: Tengu-yaki pastry at cable car station, Tororo Soba noodles, and grilled dango!`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山三大必吃名物美食：1）“天狗烧（Tengu-yaki）”——高尾山站旁香脆的外皮包裹黑豆豆沙甜馅；2）“山药泥荞麦面（Tororo Soba）”——山脚与山腰各大百年茶屋招牌；3）炭烤“三福团子”——1号路与药王院沿线香气四溢。山上茶屋通常营业至下午16:30左右！`,
        advice_short: `高尾名物推荐：高尾山站天狗烧、传统山药泥荞麦面、炭烤三福团子！`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾山の三大名物グルメといえば：①高尾山駅前で買える黒豆あんが絶品の「天狗焼」、②各茶屋で味わえる栄養満点の「とろろ蕎麦」、③1号路や薬王院沿いの香ばしい炭火焼き「三福だんご」です！山頂や参道の茶屋は16:30頃まで営業しています。登山後の腹ごしらえにぜひお立ち寄りください！`,
      advice_short: `名物は黒豆ぎっしり「天狗焼」、伝統の「とろろ蕎麦」、香ばしい「三福だんご」です！`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // 9. Access / Train / Station (Keio Takaosanguchi)
  if (
    q.includes('駅') ||
    q.includes('アクセス') ||
    q.includes('電車') ||
    q.includes('京王') ||
    q.includes('station') ||
    q.includes('train') ||
    q.includes('access') ||
    q.includes('车站') ||
    q.includes('交通')
  ) {
    if (language === 'en') {
      return {
        advice_text: `Mt. Takao is directly accessible via Takaosanguchi Station on the Keio Line (approx. 50 minutes on the Keio Semi-Special Express from Shinjuku). The base cable car station (Kiyotaki) and our Salomon Takao Store are just a short 3 to 5 minute walk from Takaosanguchi Station exits.`,
        advice_short: `Access: ~50 min from Shinjuku to Keio Takaosanguchi Station. Trailhead is a 5-min walk.`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `高尾山交通极为便利：乘坐京王线直达“高尾山口站”（从新宿站搭乘特急/准特急仅需约50分钟）。出站后步行约3-5分钟即可抵达清泷缆车站与Salomon高尾体验店。`,
        advice_short: `交通指南：新宿搭乘京王线约50分钟直达高尾山口站，出站步行5分钟即达登山口。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `高尾山へのアクセスは京王線「高尾山口駅」が最寄りです（新宿駅から京王線特急・準特急で約50分）。駅から山麓の清滝駅（ケーブルカー・リフト乗り場）やサロモン高尾店へは徒歩約3〜5分と非常に好アクセスです！`,
      advice_short: `新宿から京王線で約50分、「高尾山口駅」下車徒歩約5分で登山口へ到着します。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // ── Specific Trail Query Responses (Triggered by explicit trail query OR by route selection when no question is asked) ──
  // Trail 1: Omotesando Trail
  if (/\b(?:trail|route|course|no\.?|number)\s*1\b|1号路|表参道|omotesando/i.test(q) || (!userQuery && route.id === 'route_1')) {
    recommended_gear.push('trail_shoes_beginner', 'hat');
    if (language === 'en') {
      return {
        advice_text: `Trail 1 (Omotesando Trail) is Mt. Takao's premier paved route (3.8km, +399m elevation gain, ~90-100 min). It leads past the Cable Car station, Monkey Park, traditional teahouses, and the historic Yakuo-in Temple. With paved paths and multiple restrooms with baby care facilities, it is the safest and most comfortable choice for beginners and families!`,
        advice_short: `Trail 1 (Omotesando): 3.8km paved main trail to Yakuo-in Temple (90-100 min). Ideal for beginners.`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“1号路（表参道）”是高尾山最经典的主干铺装路线（全长3.8公里，爬升+399米，约90〜100分钟）。途径缆车站、猴园、传统茶屋及历史悠久的药王院。沿途路面平整，设有5处洗手间（含母婴台），老少咸宜，是初学者与全家出行的最佳选择！`,
        advice_short: `1号路（表参道）：3.8公里全线铺装主路（约90-100分钟），平稳安全。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「1号路（表参道コース）」は高尾山のメインルート（全長3.8km、標高差+399m、所要約90〜100分）です！全線舗装路で歩きやすく、ケーブルカー駅、さる園、茶屋、薬王院を通ります。途中にベビーベッド付きトイレが5箇所あり、初心者やご家族連れでも安心して山歩きを楽しめます！`,
      advice_short: `1号路（表参道）：全長3.8km（約90〜100分）。全線舗装で初心者安心の定番コースです。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // Trail 2: Kasumidai Loop
  if (/\b(?:trail|route|course|no\.?|number)\s*2\b|2号路|霞台|kasumidai|2\.cas/i.test(q) || (!userQuery && route.id === 'route_2')) {
    recommended_gear.push('trail_shoes_beginner', 'hat');
    if (language === 'en') {
      return {
        advice_text: `You asked about Trail 2 (Kasumidai Loop)! This is a 0.9km scenic nature loop around Takaosan Station (+50m elevation gain, ~40 min). It circles the Monkey Park & Wild Plant Garden, highlighting the unique contrast between southern warm-temperate evergreen and northern cool-temperate deciduous forests. It has gentle slopes and is wonderful for a relaxing nature walk!`,
        advice_short: `Trail 2 (Kasumidai Loop): 0.9km gentle nature loop around Takaosan Station (40 min).`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `关于“2号路（霞台环形路）”：这是环绕高尾山缆车站一周的自然生态环线，全长0.9公里（爬升约+50米，耗时约40分钟）。途经猴园与野草园，南坡暖温带与北坡温带森林交汇，植被丰富且路面平缓，老少咸宜！`,
        advice_short: `2号路（霞台环线）：全长0.9公里（约40分钟），平缓环绕高尾山站。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「2号路（霞台ループ）」ですね！高尾山駅の周囲をぐるりと一周する全長0.9kmの環状コースです（標高差+50m、所要約40分）。さる園・野草園を通り、南斜面の暖帯林と北斜面の温帯林の豊かな植生を観察できます。平坦で歩きやすく、気軽な森林浴散策にぴったりです！`,
      advice_short: `2号路（霞台ループ）：全長0.9km（約40分）。高尾山駅周辺の平坦な自然観察路です。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // Trail 6: Biwa Waterfall Trail
  if (/\b(?:trail|route|course|no\.?|number)\s*6\b|6号路|びわ|biwa|waterfall/i.test(q) || (!userQuery && route.id === 'route_6')) {
    recommended_gear.push('trail_shoes_intermediate', 'waterproof_shoes', 'rain_jacket');
    if (language === 'en') {
      return {
        advice_text: `You asked about Trail 6 (Biwa Waterfall Trail)! This 3.3km route (+360m elevation gain, ~90 min) ascends along the mountain stream. You will pass the sacred Biwa Waterfall and hike directly over stepping stones in the brook. The trail can be wet and slippery, so waterproof shoes with aggressive grip like Salomon X Ultra 4 GORE-TEX or Speedcross 6 are strongly recommended!`,
        advice_short: `Trail 6 (Biwa Waterfall): 3.3km refreshing stream hike (90 min). Waterproof high-grip shoes advised!`,
        safety_flags: [...safety_flags, 'slippery_trail'],
        recommended_gear,
        mood: 'caution',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `关于“6号路（琵琶瀑布路线）”：这是沿山涧溪流而上的清幽探险步道，全长3.3公里（爬升+360米，约需90分钟）。沿途经过古老的琵琶瀑布修行地，中上段还可踩着溪中岩石溯溪而行。水汽重、石头湿滑，强烈建议穿着防滑防水的Salomon X Ultra 4 GORE-TEX越野鞋！`,
        advice_short: `6号路（琵琶瀑布）：3.3公里溪谷步道（90分钟），路面湿滑需穿防水防滑鞋！`,
        safety_flags: [...safety_flags, 'slippery_trail'],
        recommended_gear,
        mood: 'caution',
      };
    }
    return {
      advice_text: `「6号路（びわ滝コース）」ですね！清滝駅横から沢沿いを登る全長3.3kmの人気コースです（標高差+360m、所要約90分）。途中に修験道の場である「びわ滝」があり、上流部ではせせらぎの中の飛び石を歩く爽快な沢歩きが楽しめます。足元が濡れて滑りやすいため、防水性と強力グリップを備えた「サロモン X ULTRA 4 GORE-TEX」が最適です！`,
      advice_short: `6号路（びわ滝コース）：全長3.3km（約90分）。沢沿い飛び石歩きが魅力、滑り止め靴推奨！`,
      safety_flags: [...safety_flags, 'slippery_trail'],
      recommended_gear,
      mood: 'caution',
    };
  }

  // Trail 3: Katsura Forest Trail
  if (/\b(?:trail|route|course|no\.?|number)\s*3\b|3号路|かつら|katsura/i.test(q) || (!userQuery && route.id === 'route_3')) {
    recommended_gear.push('trail_shoes_beginner', 'windshell');
    if (language === 'en') {
      return {
        advice_text: `Trail 3 (Katsura Forest Trail) covers 2.4km (+180m gain, ~60 min). Branching off left from Joshinmon Gate, it meanders through quiet evergreen and giant katsura forests on natural soil paths. It is peaceful and far less crowded than the paved main trail!`,
        advice_short: `Trail 3 (Katsura Forest): 2.4km tranquil woodland dirt path (60 min). Avoids summit crowds.`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“3号路（连香树林路线）”全长2.4公里（爬升+180米，约60分钟）。从净心门左侧分岔，穿越连香树与常绿阔叶森林的原生态泥土小路。远离主峰喧嚣，聆听清幽鸟鸣的静心之选！`,
        advice_short: `3号路（连香树林）：2.4公里静谧林间土路（60分钟），避开人潮。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「3号路（かつら林コース）」は全長2.4km（標高差+180m、所要約60分）の静かな自然道です。浄心門の左手から分岐し、カツラや照葉樹の森を抜ける土の小道。メインコースの混雑を避けて野鳥のさえずりを楽しみながら歩けます！`,
      advice_short: `3号路（かつら林コース）：全長2.4km（約60分）。混雑の少ない静かな森林土道です。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // Trail 4: Suspension Bridge Trail
  if (/\b(?:trail|route|course|no\.?|number)\s*4\b|4号路|吊り橋|suspension|miyama|tsuribashi/i.test(q) || (!userQuery && route.id === 'route_4')) {
    recommended_gear.push('trail_shoes_intermediate', 'windshell');
    if (language === 'en') {
      return {
        advice_text: `Trail 4 (Suspension Bridge Trail) is 1.5km long (+150m gain, ~50 min). Its highlight is crossing Miyama Bridge—the only suspension bridge on Mt. Takao—nestled deep in primeval beech and maple forests. An unforgettable forest walk for nature and photo lovers!`,
        advice_short: `Trail 4 (Suspension Bridge): 1.5km scenic trail crossing Miyama suspension bridge (50 min).`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“4号路（吊桥步道）”全长1.5公里（爬升+150米，约50分钟）。途经高尾山唯一的吊桥“深山桥”，被茂密的山毛榉与红枫环抱。谷风习习，景致优美，是拍照打卡与亲近自然的绝佳路线！`,
        advice_short: `4号路（吊桥步道）：1.5公里穿越深山吊桥（50分钟），景色秀丽。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「4号路（吊り橋コース）」は全長1.5km（標高差+150m、所要約50分）。高尾山で唯一の吊り橋「みやま橋」を渡る大人気ルートです。ブナやカエデの原生林に包まれ、四季折々の絶景が楽しめます。足元はトレイルシューズが安心です！`,
      advice_short: `4号路（吊り橋コース）：全長1.5km（約50分）。みやま吊り橋とブナ林が魅力！`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // Trail 5: Summit Loop
  if (/\b(?:trail|route|course|no\.?|number)\s*5\b|5号路|山頂ループ|summit loop/i.test(q) || (!userQuery && route.id === 'route_5')) {
    recommended_gear.push('trail_shoes_beginner', 'hat');
    if (language === 'en') {
      return {
        advice_text: `Trail 5 (Summit Loop Trail) is an easy 0.9km loop (+30m gain, ~30 min) circling just below the peak of Mt. Takao. It intersects all major trails and features educational botanical markers along an almost level, relaxing forest walk.`,
        advice_short: `Trail 5 (Summit Loop): 0.9km easy, nearly level walk circling the summit area (30 min).`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“5号路（山顶环形路）”全长0.9公里（爬升仅+30米，耗时约30分钟），平缓环绕高尾山顶。连接所有主要登山道，沿途设有丰富的植物解说牌，适合全家轻松漫步！`,
        advice_short: `5号路（山顶环形路）：0.9公里近乎平坦的环顶步道（30分钟）。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「5号路（山頂ループ）」は山頂の周囲をめぐる全長0.9km（標高差+30m、所要約30分）の平坦な散策路です。全登山道が合流するポイントでもあり、様々な高山植物のプレートを観察しながら手軽に一周できます！`,
      advice_short: `5号路（山頂ループ）：全長0.9km（約30分）。山頂直下の平坦な植物観察路です。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // Inariyama Course
  if (/稲荷山|inariyama/i.test(q) || (!userQuery && route.id === 'route_inariyama')) {
    recommended_gear.push('trail_shoes_intermediate', 'trekking_poles');
    if (language === 'en') {
      return {
        advice_text: `Inariyama Course (Ridge Trail) is 3.1km long with +399m elevation gain (~90 min). Ascending the south ridge directly from Kiyotaki Station, it offers observation gazebos with sweeping panoramas and wooden ridge steps. A true hiking trail requiring sturdy trail footwear!`,
        advice_short: `Inariyama Ridge Trail: 3.1km natural ridge ascent with scenic gazebos (90 min).`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“稻荷山步道（山脊路线）”全长3.1公里（爬升+399米，约90分钟）。沿清泷站南侧山脊直上，途经视野开阔的观景凉亭。山脊土路多树根与木阶梯，推荐穿着专业徒步鞋！`,
        advice_short: `稻荷山步道：3.1公里山脊经典直登线（90分钟），视野开阔。`,
        safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「稲荷山コース（尾根道）」は清滝駅から山頂へ南側の尾根を直登する全長3.1km（標高差+399m、所要約90分）の本格登山道です。途中にあずまや（展望台）があり、明るい尾根歩きが魅力。木の根や木段が多いため、しっかりしたトレイルシューズでお出かけください！`,
      advice_short: `稲荷山コース：全長3.1km（約90分）。見晴らしの良い南尾根の本格登山道です。`,
      safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // Mt. Takao - Mt. Jinba Long Traverse
  if (/陣馬|jinba|奥高尾|traverse/i.test(q) || (!userQuery && route.id === 'route_jinba')) {
    recommended_gear.push('trail_shoes_intermediate', 'energy_gel', 'trekking_poles', 'windshell');
    if (language === 'en') {
      return {
        advice_text: `The Mt. Takao to Mt. Jinba Long Traverse is a premier 15.3km ridgeline hike (+950m elevation gain, ~4.5 to 5.5 hours). Traversing across Mt. Takao, Shiroyama, Mt. Kagenobu, and Mt. Jinba (855m with the famous White Horse statue), it offers breathtaking vistas of Mt. Fuji. Be sure to start early in the morning, carry at least 1.5L of water, and wear supportive trail running or hiking shoes!`,
        advice_short: `Takao-Jinba Traverse: 15.3km across 4 peaks (~4.5-5.5 hrs). Early start & full trail gear required!`,
        safety_flags: [...safety_flags, 'long_distance_caution'],
        recommended_gear,
        mood: 'caution',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“高尾山・阵马山大纵走（奥高尾长线）”是全长15.3公里的经典山脊穿越路线（累计爬升+950米，耗时约4.5至5.5小时）。横跨高尾山、小佛城山、景信山与阵马山（海拔855米，拥有标志性白马雕像），饱览富士山全景。请务必清晨尽早出发，备足1.5升以上饮水与补给，穿着专业越野跑鞋！`,
        advice_short: `高尾-阵马大纵走：全长15.3公里连跨四座名峰（约4.5-5.5小时），需充沛体能与专业装备！`,
        safety_flags: [...safety_flags, 'long_distance_caution'],
        recommended_gear,
        mood: 'caution',
      };
    }
    return {
      advice_text: `「高尾山・陣馬山縦走コース（奥高尾）」は、高尾山頂から小仏城山・景信山を経て陣馬山（標高855m）へ至る全長15.3kmの本格縦走ルートです（獲得標高+950m、所要4.5〜5.5時間）。陣馬山頂の白馬像や富士山のパノラマが圧巻！早朝出発と最低1.5L以上の水分補給、歩きやすいトレイルシューズをご準備ください！`,
      advice_short: `高尾〜陣馬縦走：全長15.3km（約4.5〜5.5時間）。奥高尾4峰を踏破する本格ロングコース！`,
      safety_flags: [...safety_flags, 'long_distance_caution'],
      recommended_gear,
      mood: 'caution',
    };
  }

  // Shiroyama Tengu Trail
  if (/天狗|tengu|城山/i.test(q) || (!userQuery && route.id === 'trail_tengu')) {
    recommended_gear.push('trail_shoes_advanced', 'energy_gel', 'trekking_poles', 'windshell');
    if (language === 'en') {
      return {
        advice_text: `Shiroyama Tengu Trail is an advanced 16.0km mountain endurance route (+900m elevation gain, ~320 min) from Takao Trail Manners. Traversing multiple steep ridgelines to Shiroyama, it demands trail running gear, hydration flasks, energy gels, and technical shoes like Salomon Speedcross 6!`,
        advice_short: `Shiroyama Tengu Trail: Advanced 16km technical ridge run/trek (+900m). High endurance required.`,
        safety_flags: [...safety_flags, 'long_distance_caution'],
        recommended_gear,
        mood: 'caution',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `“城山天狗越野路线（高尾Manners认证）”全长16.0公里，累计爬升约900米（预计5小时20分钟）。多次往返于城山险峻山脊，起伏剧烈。必须配备Salomon越野背包、充足饮水及Speedcross 6高抓地力越野跑鞋！`,
        advice_short: `城山天狗越野路线：16公里进阶越野长距离挑战（5小时20分）。`,
        safety_flags: [...safety_flags, 'long_distance_caution'],
        recommended_gear,
        mood: 'caution',
      };
    }
    return {
      advice_text: `「城山天狗トレイル（高尾マナーズ）」は全長16.0km・獲得標高約900m（所要約5時間20分）の本格ロングトレイルです！城山を中心に幾度もアップダウンを繰り返すタフなルート。サロモン SPEEDCROSS 6 やハイドレーションベストなどの本格装備をご準備ください！`,
      advice_short: `城山天狗トレイル：全長16km（約5時間20分）。高尾マナーズ推奨の上級ロングコースです。`,
      safety_flags: [...safety_flags, 'long_distance_caution'],
      recommended_gear,
      mood: 'caution',
    };
  }

  // Surrounding Trails (Takao Trail Manners) - triggered on card click when no user query
  if (!userQuery && route.category === 'surrounding_trail') {
    recommended_gear.push('trail_shoes_intermediate', 'energy_gel', 'windshell');
    if (language === 'en') {
      return {
        advice_text: `You selected "${routeName}" (${route.distanceKm}km, gain +${route.elevationM}m, ~${route.durationMin} min). Sourced from Takao Trail Manners, this route takes you away from tourist crowds into peaceful, rugged nature. Features include: ${route.features.join(', ')}. Carry sufficient water and energy snacks!`,
        advice_short: `${routeName}: ${route.distanceKm}km, +${route.elevationM}m (~${route.durationMin} min). Takao Manners trail.`,
        safety_flags: route.distanceKm >= 10 ? [...safety_flags, 'long_distance_caution'] : safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    if (language === 'zh') {
      return {
        advice_text: `您选择了“${routeName}”（全长${route.distanceKm}公里，爬升+${route.elevationM}米，预计${route.durationMin}分钟）。源自高尾Manners推荐，远离游客喧嚣，尽享静谧纯粹的山林之美。特色包含：${route.features.join('、')}。请备足补给与饮水！`,
        advice_short: `${routeName}：全长${route.distanceKm}公里（约${route.durationMin}分钟），高尾Manners推荐。`,
        safety_flags: route.distanceKm >= 10 ? [...safety_flags, 'long_distance_caution'] : safety_flags,
        recommended_gear,
        mood: 'good',
      };
    }
    return {
      advice_text: `「${routeName}」（全長${route.distanceKm}km、獲得標高+${route.elevationM}m、所要約${route.durationMin}分）ですね！高尾マナーズ推奨の静かな山道で、観光地の喧騒を離れて豊かな自然を堪能できます。特徴：${route.features.join('・')}。十分な水分と補給食をご用意ください！`,
      advice_short: `${routeName}：全長${route.distanceKm}km（約${route.durationMin}分）。高尾マナーズ推奨トレイルです。`,
      safety_flags: route.distanceKm >= 10 ? [...safety_flags, 'long_distance_caution'] : safety_flags,
      recommended_gear,
      mood: 'good',
    };
  }

  // ── Default Contextual Answer ──
  if (language === 'en') {
    const queryPart = userQuery ? `Regarding your request ("${userQuery}"): ` : '';
    const rainTip = weather.rainProbability >= 50 ? 'Pack reliable rain gear and watch for slippery rock stairs.' : 'Conditions are pleasant for hiking today.';
    const weatherEn =
      weather.weatherCode === 'rainy' ? 'rainy' :
      weather.weatherCode === 'sunny' ? 'sunny' :
      weather.weatherCode === 'partly_cloudy' ? 'partly cloudy' :
      weather.weatherCode === 'snowy' ? 'snowy' : 'cloudy';
    return {
      advice_text: `${queryPart}Welcome to Mt. Takao! Today is ${weatherEn} with temperatures around ${weather.temp_c}°C. You are viewing ${routeName}, which covers ${route.distanceKm}km with ${route.elevationM}m of elevation gain (approx. ${route.durationMin} min). ${rainTip} Stay hydrated and enjoy your time on the mountain!`,
      advice_short: `${routeName}: ${route.distanceKm}km, ${route.elevationM}m gain (${route.durationMin} min). Today is ${weatherEn}, ${weather.temp_c}°C.`,
      safety_flags,
      recommended_gear,
      mood,
    };
  }

  if (language === 'zh') {
    const queryPart = userQuery ? `关于您的咨询（“${userQuery}”）：` : '';
    const rainTip = weather.rainProbability >= 50 ? '请务必携带雨具并注意湿滑石阶。' : '步道天气舒适，非常适合徒步。';
    const weatherZh =
      weather.weatherCode === 'rainy' ? '有雨' :
      weather.weatherCode === 'sunny' ? '晴朗' :
      weather.weatherCode === 'partly_cloudy' ? '多云转晴' :
      weather.weatherCode === 'snowy' ? '降雪' : '多云';
    return {
      advice_text: `${queryPart}欢迎来到高尾山！今日天气${weatherZh}，气温${weather.temp_c}℃。当前路线为「${routeName}」，全长${route.distanceKm}公里（爬升${route.elevationM}米，约需${route.durationMin}分钟）。${rainTip}请注意适时补水，祝您登山愉快！`,
      advice_short: `${routeName}：全长${route.distanceKm}公里（约${route.durationMin}分钟）。今日${weatherZh}，气温${weather.temp_c}℃。`,
      safety_flags,
      recommended_gear,
      mood,
    };
  }

  const weatherDesc =
    weather.weatherCode === 'sunny' ? `晴れて気温${weather.temp_c}℃` :
    weather.weatherCode === 'rainy' ? `雨模様で気温${weather.temp_c}℃` :
    `曇りで気温${weather.temp_c}℃`;

  const safetyTip =
    safety_flags.includes('rain_gear_required') ? '雨具は必ず持参してください。' :
    safety_flags.includes('high_uv')            ? '紫外線が強いので帽子と日焼け止めをお忘れなく。' :
    'コンディションを確認しながら楽しく歩きましょう。';

  const queryIntro = userQuery ? `「${userQuery}」についてのご案内です。` : '';

  return {
    advice_text:     `${queryIntro}今日の高尾山は${weatherDesc}です。「${routeName}」は全長${route.distanceKm}km、獲得標高+${route.elevationM}m（所要約${route.durationMin}分）のコースです。${safetyTip}水分補給はこまめに行い、無理のないペースで楽しんでください。`,
    advice_short:    `${routeName}（${route.distanceKm}km、約${route.durationMin}分）。${weatherDesc}。`,
    safety_flags,
    recommended_gear,
    mood,
  };
}

export { buildUserPrompt };

'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Eye, Globe } from 'lucide-react';
import { useAdminStore, type LocalizedHeroMessage } from '@/store/useAdminStore';
import type { Language } from '@/lib/i18n';

const LANG_OPTIONS: { code: Language; label: string }[] = [
  { code: 'ja', label: '日本語 (JA)' },
  { code: 'en', label: 'English (EN)' },
  { code: 'zh', label: '中文 (ZH)' },
];

const DEFAULTS: Record<Language, LocalizedHeroMessage> = {
  ja: {
    greeting: 'こんにちは！今日はどの山の情報が知りたいですか？',
    subtitle: '高尾山の最新情報をAIがご案内します。',
  },
  en: {
    greeting: 'Welcome! Which mountain trails would you like to explore today?',
    subtitle: 'Your Salomon AI Concierge provides real-time conditions for Mt. Takao.',
  },
  zh: {
    greeting: '您好！今天想了解哪座山与哪条路线的信息呢？',
    subtitle: '萨洛蒙AI向导为您实时提供高尾山最新向导服务。',
  },
};

export function HeroMessageEditor() {
  const heroMessages = useAdminStore(s => s.heroMessages);
  const setHeroMessageForLang = useAdminStore(s => s.setHeroMessageForLang);
  const setHeroMessages = useAdminStore(s => s.setHeroMessages);

  const [activeLang, setActiveLang] = useState<Language>('ja');
  const [formData, setFormData] = useState<Record<Language, LocalizedHeroMessage>>({
    ja: heroMessages?.ja || DEFAULTS.ja,
    en: heroMessages?.en || DEFAULTS.en,
    zh: heroMessages?.zh || DEFAULTS.zh,
  });

  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      ja: heroMessages?.ja || DEFAULTS.ja,
      en: heroMessages?.en || DEFAULTS.en,
      zh: heroMessages?.zh || DEFAULTS.zh,
    });
    setIsDirty(false);
  }, [heroMessages]);

  const currentMsg = formData[activeLang] || DEFAULTS[activeLang];

  const handleChange = (field: 'greeting' | 'subtitle', val: string) => {
    setFormData(prev => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: val,
      },
    }));
    setIsDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    setHeroMessages(formData);
    setSaved(true);
    setIsDirty(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      [activeLang]: DEFAULTS[activeLang],
    }));
    setIsDirty(true);
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">ヒーローメッセージ編集</h2>
          <p className="text-sm text-slate-400">
            コンシェルジュ画面の上部に表示されるメインメッセージを各言語（日本語・英語・中国語）ごとに編集します。
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl self-start sm:self-auto">
          <Globe className="w-4 h-4 text-cyan-400 ml-1.5 mr-0.5" />
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.code}
              onClick={() => setActiveLang(opt.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                activeLang === opt.code
                  ? 'bg-cyan-500 text-slate-900 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between bg-white/5 px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              ライブプレビュー ({LANG_OPTIONS.find(l => l.code === activeLang)?.label})
            </span>
          </div>
          <span className="text-[10px] text-slate-500">言語切替時にこのメッセージがヘッダーに表示されます</span>
        </div>
        <div
          className="px-8 py-10 text-center"
          style={{
            background:
              'linear-gradient(135deg, #0A1530 0%, #0D1A3A 50%, #081020 100%)',
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=60')`,
            backgroundSize: 'cover',
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-8 py-6">
            <h1
              className="font-bold text-white text-xl leading-tight mb-2"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              {currentMsg.greeting || <span className="text-white/30 italic">（タイトルを入力してください）</span>}
            </h1>
            <p className="text-slate-300 text-sm">
              {currentMsg.subtitle || <span className="text-white/30 italic">（サブタイトルを入力してください）</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Greeting */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            メインタイトル ({activeLang.toUpperCase()})
            <span className="ml-2 text-xs font-normal text-slate-500">
              （コンシェルジュ画面の大きな見出し）
            </span>
          </label>
          <textarea
            value={currentMsg.greeting}
            onChange={e => handleChange('greeting', e.target.value)}
            rows={2}
            maxLength={120}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm resize-none
                       focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            placeholder={DEFAULTS[activeLang].greeting}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">改行は使用できません</span>
            <span className={`text-xs tabular-nums ${currentMsg.greeting.length > 90 ? 'text-orange-400' : 'text-slate-500'}`}>
              {currentMsg.greeting.length}/120
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            サブタイトル ({activeLang.toUpperCase()})
            <span className="ml-2 text-xs font-normal text-slate-500">
              （メインタイトルの下に表示される説明文）
            </span>
          </label>
          <input
            type="text"
            value={currentMsg.subtitle}
            onChange={e => handleChange('subtitle', e.target.value)}
            maxLength={120}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm
                       focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            placeholder={DEFAULTS[activeLang].subtitle}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs tabular-nums ${currentMsg.subtitle.length > 90 ? 'text-orange-400' : 'text-slate-500'}`}>
              {currentMsg.subtitle.length}/120
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400
                     hover:text-white hover:border-white/25 transition-all text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          現在の言語を初期値に戻す
        </button>

        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved
              ? 'bg-green-500/20 border border-green-500/40 text-green-400'
              : isDirty
              ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,200,255,0.3)]'
              : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? '全言語を更新完了！' : '全言語の変更を保存'}
        </button>
      </div>

      {/* Note */}
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3">
        <p className="text-xs text-blue-300 leading-relaxed">
          <span className="font-bold">📝 多言語管理について：</span>
          各言語タブを切り替えて編集し、「全言語の変更を保存」を押すと設定が即時反映されます。
          キオスク端末でフッターの言語切替ボタンを押すと、ここで設定された言語のメッセージが表示されます。
        </p>
      </div>
    </div>
  );
}

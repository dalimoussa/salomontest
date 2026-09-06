'use client';

/**
 * AdminPageClient — wraps AdminApp in a PIN-gate.
 *
 * The PIN is set via NEXT_PUBLIC_ADMIN_PIN environment variable.
 * Default PIN is 1234 when the variable is not set (development only).
 *
 * Production deployment should set NEXT_PUBLIC_ADMIN_PIN to a strong
 * numeric PIN in Vercel environment settings.
 *
 * For true authentication (session tokens, role-based access), replace
 * this with NextAuth or a similar server-side solution in Phase 2.
 */

import { useState, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AdminApp } from '@/admin/AdminApp';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? '1234';
const MAX_ATTEMPTS = 5;

export function AdminPageClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin]           = useState('');
  const [showPin, setShowPin]   = useState(false);
  const [error, setError]       = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const locked = attempts >= MAX_ATTEMPTS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPin('');
      setError(
        next >= MAX_ATTEMPTS
          ? `試行回数が上限（${MAX_ATTEMPTS}回）に達しました。ページを更新してください。`
          : `PINが正しくありません。残り${MAX_ATTEMPTS - next}回。`
      );
      inputRef.current?.focus();
    }
  };

  if (authenticated) return <AdminApp />;

  return (
    <div className="min-h-screen bg-[#080E20] flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{
          background: 'rgba(13,21,41,0.97)',
          border: '1px solid rgba(0,200,255,0.25)',
          boxShadow: '0 0 60px rgba(0,200,255,0.08)',
        }}
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-salomon-cyan/10 border border-salomon-cyan/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-salomon-cyan" />
          </div>
          <div>
            <p className="text-xs font-mono text-salomon-cyan tracking-widest uppercase">SALOMON AI CONCIERGE</p>
            <h1 className="text-lg font-bold text-white mt-1">管理者ログイン</h1>
            <p className="text-xs text-slate-400 mt-0.5">Admin Console — スタッフ専用</p>
          </div>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5" htmlFor="admin-pin">
              管理PINを入力
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                id="admin-pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={e => {
                  setError('');
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
                }}
                disabled={locked}
                placeholder="• • • •"
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-mono tracking-widest bg-white/5 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-salomon-cyan/60 disabled:opacity-50 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPin ? 'PINを隠す' : 'PINを表示'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={locked || pin.length === 0}
            className="w-full py-3 rounded-xl bg-salomon-cyan text-salomon-black text-sm font-bold hover:bg-salomon-cyan/90 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {locked ? 'アカウントをロック中' : '管理画面へ'}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600">
          PINが分からない場合はサロモン高尾店スタッフへお問い合わせください。
        </p>
      </div>
    </div>
  );
}

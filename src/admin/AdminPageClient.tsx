'use client';

/**
 * AdminPageClient — High-Security Server-Authenticated Admin Console Gate.
 *
 * Security features:
 * - Zero client PIN exposure (no NEXT_PUBLIC_ADMIN_PIN).
 * - Server-side verification via /api/admin/auth with rate limiting & brute-force lock.
 * - HTTP-only SameSite=Strict HMAC signed session cookies.
 * - Constant-time comparison on the server to prevent timing attacks.
 */

import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, LogOut, Loader2 } from 'lucide-react';
import { AdminApp } from '@/admin/AdminApp';

export function AdminPageClient() {
  const [checkingAuth, setCheckingAuth]   = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin]                     = useState('');
  const [showPin, setShowPin]             = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [locked, setLocked]               = useState(false);
  const inputRef                          = useRef<HTMLInputElement>(null);

  // Check active server session on load
  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked || loading || !pin) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthenticated(true);
        setPin('');
      } else if (res.status === 429) {
        setLocked(true);
        setError(data.message || '試行回数上限に達したためロックされました。時間をおいて再度お試しください。');
      } else {
        setPin('');
        if (data.locked) {
          setLocked(true);
        }
        setError(
          data.message ||
            (data.remainingAttempts !== undefined
              ? `PINが正しくありません。残り試行回数: ${data.remainingAttempts}回。`
              : '認証に失敗しました。')
        );
        inputRef.current?.focus();
      }
    } catch {
      setError('サーバー通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}
    setAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#080E20] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-salomon-cyan animate-spin" />
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="relative min-h-screen">
        {/* Top security bar with logout for staff */}
        <div className="bg-[#050A18] border-b border-white/10 px-4 py-2 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">Staff Session Active (Secured)</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
        <AdminApp />
      </div>
    );
  }

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
            <h1 className="text-lg font-bold text-white mt-1">スタッフ管理認証</h1>
            <p className="text-xs text-slate-400 mt-0.5">Authorized Personnel Only</p>
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
                onChange={(e) => {
                  setError('');
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
                }}
                disabled={locked || loading}
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

          {error && <p className="text-xs text-red-400 text-center leading-relaxed">{error}</p>}

          <button
            type="submit"
            disabled={locked || loading || pin.length === 0}
            className="w-full py-3 rounded-xl bg-salomon-cyan text-salomon-black text-sm font-bold hover:bg-salomon-cyan/90 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>認証中...</span>
              </>
            ) : locked ? (
              '一時ロック中'
            ) : (
              '管理画面へ'
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500">
          スタッフ専用ポータルです。一般のお客様はご利用いただけません。
        </p>
      </div>
    </div>
  );
}

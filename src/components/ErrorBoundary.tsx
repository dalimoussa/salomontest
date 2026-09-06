'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Optional UI to render on error. Defaults to a branded full-screen card. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Catches any unhandled React rendering error beneath it and shows a
 * friendly recovery screen instead of a blank white page.
 *
 * Wraps both the main kiosk app and the 3D map to guarantee the kiosk
 * never fully crashes for a customer.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : '不明なエラー';
    return { hasError: true, errorMessage: msg };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Log to console (replace with a real logger / Sentry in production)
    console.error('[ErrorBoundary] Unhandled render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex items-center justify-center min-h-screen bg-salomon-black px-6"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="max-w-sm w-full rounded-2xl p-8 text-center space-y-5"
            style={{
              background: 'rgba(13,21,41,0.95)',
              border: '1px solid rgba(232,0,45,0.4)',
              boxShadow: '0 0 40px rgba(232,0,45,0.15)',
            }}
          >
            {/* Salomon red indicator */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <span className="text-2xl" aria-hidden>⚠</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-white font-bold text-base">
                表示エラーが発生しました
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                ページの一部を表示できません。<br />
                再読み込みをお試しください。
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorMessage && (
              <pre className="text-left text-[10px] text-red-300 bg-red-950/30 rounded-lg p-3 overflow-auto max-h-28">
                {this.state.errorMessage}
              </pre>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-xl bg-salomon-cyan text-salomon-black text-sm font-bold hover:bg-salomon-cyan/90 active:scale-95 transition-all"
              >
                再試行
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-salomon-muted text-sm hover:bg-white/10 active:scale-95 transition-all"
              >
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

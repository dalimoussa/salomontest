'use client';

import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Package, Settings,
  ExternalLink, ChevronRight, Clock, Database,
  Menu, X, PanelLeftClose, PanelLeftOpen, Mountain, Globe, CloudRain,
} from 'lucide-react';
import { HeroMessageEditor } from '@/admin/HeroMessageEditor';
import { ProductEditor } from '@/admin/ProductEditor';
import { RouteEditor } from '@/admin/RouteEditor';
import { WeatherEditor } from '@/admin/WeatherEditor';
import { useAdminStore } from '@/store/useAdminStore';

type Section = 'dashboard' | 'weather' | 'routes' | 'messages' | 'products';

const NAV: {
  id: Section;
  label: string;
  labelEn: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}[] = [
  { id: 'dashboard', label: 'ダッシュボード',    labelEn: 'Dashboard',        icon: LayoutDashboard },
  { id: 'weather',   label: '天気・気象手動設定',  labelEn: 'Weather Override', icon: CloudRain,       badge: '手動/自動' },
  { id: 'routes',    label: 'コース・難易度管理',  labelEn: 'Route Settings',   icon: Mountain,        badge: '8大コース' },
  { id: 'messages',  label: 'ヒーローメッセージ',  labelEn: 'Hero Messages',    icon: MessageSquare,   badge: '3言語対応' },
  { id: 'products',  label: '商品マスター',        labelEn: 'Products',         icon: Package,         badge: '編集可' },
];

/* ── Dashboard content ─────────────────────────────────────────────────── */
function Dashboard() {
  const products     = useAdminStore(s => s.products);
  const heroMessages = useAdminStore(s => s.heroMessages);
  const lastSavedAt  = useAdminStore(s => s.lastSavedAt);

  const inStock    = products.filter(p => p.stockStatus === 'in_stock').length;
  const lowStock   = products.filter(p => p.stockStatus === 'low_stock').length;
  const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock').length;

  const savedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleString('ja-JP', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">ダッシュボード</h2>
        <p className="text-sm text-slate-400">SALOMON 高尾店 AIコンシェルジュ 管理画面（DEMO版）</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '登録商品数', value: products.length, color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
          { label: '在庫あり',   value: inStock,          color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
          { label: '残りわずか', value: lowStock,         color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          { label: '在庫なし',   value: outOfStock,       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-4`}>
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-black tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hero messages */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">現在のヒーローメッセージ（日本語 / English / 中文）</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-cyan-400 font-bold">日本語 (JA):</span>
            <p className="text-sm text-white font-medium pl-2">{heroMessages.ja?.greeting || (heroMessages as any).greeting}</p>
            <p className="text-xs text-slate-400 pl-2">{heroMessages.ja?.subtitle || (heroMessages as any).subtitle}</p>
          </div>
          <div className="space-y-1 pt-2 border-t border-white/5">
            <span className="text-xs text-cyan-400 font-bold">English (EN):</span>
            <p className="text-sm text-white font-medium pl-2">{heroMessages.en?.greeting}</p>
            <p className="text-xs text-slate-400 pl-2">{heroMessages.en?.subtitle}</p>
          </div>
          <div className="space-y-1 pt-2 border-t border-white/5">
            <span className="text-xs text-cyan-400 font-bold">中文 (ZH):</span>
            <p className="text-sm text-white font-medium pl-2">{heroMessages.zh?.greeting}</p>
            <p className="text-xs text-slate-400 pl-2">{heroMessages.zh?.subtitle}</p>
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">最終保存日時</span>
          </div>
          <p className="text-sm text-white font-mono">{savedTime}</p>
          <p className="text-xs text-slate-500 mt-1">localStorage に自動保存済み</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">データソース</span>
          </div>
          <p className="text-sm text-white">ローカル（DEMO）</p>
          <p className="text-xs text-slate-500 mt-1">本番：Supabase API → 自動取得</p>
        </div>
      </div>

      {/* DEMO notice */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-5">
        <h3 className="text-sm font-bold text-cyan-300 mb-2">🚀 DEMO版 — 管理可能なコンテンツ</h3>
        <ul className="space-y-1.5 text-xs text-slate-300">
          <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />ヒーローメッセージ（挨拶文・サブタイトル）の変更</li>
          <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />おすすめ商品の追加・編集・削除・表示順変更</li>
          <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />コース難易度（初級・中級・上級）・6段階星評価・スタッフコメント編集</li>
          <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />商品在庫状況の手動更新</li>
          <li className="flex items-center gap-2 opacity-50"><ChevronRight className="w-3 h-3 flex-shrink-0" />（本番）AIプロンプト調整、天気API設定、ログ分析</li>
        </ul>
      </div>
    </div>
  );
}

/* ── Sidebar inner content (shared between desktop & mobile) ───────────── */
function SidebarContent({
  activeSection,
  onSelect,
  onClose,
}: {
  activeSection: Section;
  onSelect: (s: Section) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-base font-black tracking-widest text-white">SALOMON</span>
          </div>
          <p className="text-[10px] text-cyan-400 tracking-widest uppercase font-semibold">Admin Console</p>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-300 font-bold">3言語対応</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[10px] text-orange-300 font-bold">DEMO版</span>
            </div>
          </div>
        </div>
        {/* Close button — only shown when used as mobile overlay */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="メニューを閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const Icon     = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); onClose?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                          transition-all duration-150 group min-h-[44px] ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/25 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20
                                 text-cyan-400 font-bold border border-cyan-500/30 flex-shrink-0">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <a
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl
                     text-slate-400 hover:text-cyan-400 hover:bg-white/5
                     transition-all text-sm font-medium min-h-[44px]"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          コンシェルジュ画面へ
        </a>
        <div className="mt-3 px-3">
          <p className="text-[10px] text-slate-600 leading-relaxed">
            © 2026 SALOMON<br />Mountain AI Concierge
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main AdminApp ─────────────────────────────────────────────────────── */
export function AdminApp() {
  const [activeSection,   setActiveSection]   = useState<Section>('dashboard');
  // Desktop: sidebar collapsed/expanded
  const [sidebarOpen,     setSidebarOpen]     = useState(true);
  // Mobile: drawer open/closed
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'weather':   return <WeatherEditor />;
      case 'messages':  return <HeroMessageEditor />;
      case 'products':  return <ProductEditor />;
      case 'routes':    return <RouteEditor />;
    }
  };

  const currentNav = NAV.find(n => n.id === activeSection)!;
  const CurrentIcon = currentNav.icon;

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#070D1E' }}>

      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-white/8
                    transition-all duration-300 ease-in-out overflow-hidden`}
        style={{
          background: '#0A1228',
          width: sidebarOpen ? '256px' : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
        aria-hidden={!sidebarOpen}
      >
        <SidebarContent
          activeSection={activeSection}
          onSelect={setActiveSection}
        />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 md:hidden flex flex-col
                    border-r border-white/8 transition-transform duration-300 ease-in-out`}
        style={{
          background: '#0A1228',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        aria-label="サイドバーメニュー"
      >
        <SidebarContent
          activeSection={activeSection}
          onSelect={setActiveSection}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3.5
                     border-b border-white/8 backdrop-blur-sm flex-shrink-0"
          style={{ background: 'rgba(7,13,30,0.92)' }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-white hover:bg-white/10
                       transition-colors flex-shrink-0"
            aria-label="メニューを開く"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg
                       text-slate-400 hover:text-white hover:bg-white/10
                       transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
            title={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
          >
            {sidebarOpen
              ? <PanelLeftClose className="w-5 h-5" />
              : <PanelLeftOpen  className="w-5 h-5" />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <CurrentIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-white truncate">{currentNav.label}</span>
            <span className="text-xs text-slate-500 hidden sm:inline flex-shrink-0">
              / {currentNav.labelEn}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

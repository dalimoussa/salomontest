import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SALOMON × AI MOUNTAIN CONCIERGE',
  description: 'サロモン高尾店 AIマウンテンコンシェルジュ — 今日の天気とあなたに最適な装備をご提案します。',
};

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="overflow-hidden bg-salomon-black">{children}</body>
    </html>
  );
}

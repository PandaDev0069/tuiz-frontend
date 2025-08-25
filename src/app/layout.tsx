import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { SocketProvider } from '../components/providers/SocketProvider';
import { AnimationProvider } from './AnimationController';
import { AuthProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: {
    default: 'TUIZ情報王 - リアルタイムクイズプラットフォーム',
    template: '%s | TUIZ情報王',
  },
  description:
    'TUIZ情報王は、リアルタイムでクイズを作成・参加できる革新的な学習プラットフォームです。教育機関、企業研修、イベントなど様々なシーンで活用できます。',
  keywords: [
    'クイズ',
    'リアルタイム',
    '学習',
    '教育',
    '研修',
    'イベント',
    'ゲーム',
    'インタラクティブ',
    'オンライン',
    'プラットフォーム',
    'TUIZ',
    '情報王',
  ],
  authors: [{ name: 'TUIZ Team' }],
  creator: 'TUIZ Team',
  publisher: 'TUIZ情報王',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tuiz-frontend.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      ja: '/',
      en: '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://tuiz-frontend.vercel.app',
    siteName: 'TUIZ情報王',
    title: 'TUIZ情報王 - リアルタイムクイズプラットフォーム',
    description: 'リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'TUIZ情報王 - リアルタイムクイズプラットフォーム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TUIZ情報王 - リアルタイムクイズプラットフォーム',
    description: 'リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム',
    images: ['/logo.png'],
    creator: '@tuiz_official',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google4acf0a55d827e37c.html',
  },
  category: 'education',
  classification: 'Educational Software',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', sizes: '16x16 32x32' },
    ],
    apple: [{ url: '/logo.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',

  other: {
    'theme-color': '#bff098',
    'msapplication-TileColor': '#bff098',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'TUIZ情報王',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <AnimationProvider>
            <SocketProvider>{children}</SocketProvider>
          </AnimationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

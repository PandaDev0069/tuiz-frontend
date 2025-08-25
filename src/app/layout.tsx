import '../styles/globals.css';
import type { Metadata } from 'next';
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
      { url: '/favicon.ico', sizes: '16x16 32x32' },
    ],
    apple: [{ url: '/logo.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#bff098" />
        <meta name="msapplication-TileColor" content="#bff098" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TUIZ情報王" />
        <link rel="canonical" href="https://tuiz-frontend.vercel.app" />
        <link rel="alternate" hrefLang="ja" href="https://tuiz-frontend.vercel.app" />
        <link rel="alternate" hrefLang="en" href="https://tuiz-frontend.vercel.app/en" />
      </head>
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

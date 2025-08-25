import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { SocketProvider } from '../components/providers/SocketProvider';
import { AnimationProvider } from './AnimationController';
import { AuthProvider } from '@/components/ui';
import { SITE_CONFIG, SEO_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: {
    default: SEO_CONFIG.DEFAULT_TITLE,
    template: `%s | ${SITE_CONFIG.SITE_NAME}`,
  },
  description: SEO_CONFIG.DEFAULT_DESCRIPTION,
  keywords: SEO_CONFIG.KEYWORDS,
  authors: [{ name: 'TUIZ Team' }],
  creator: 'TUIZ Team',
  publisher: SITE_CONFIG.SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.BASE_URL),
  alternates: {
    canonical: '/',
    languages: {
      ja: '/',
      en: '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.LOCALE,
    url: SITE_CONFIG.BASE_URL,
    siteName: SITE_CONFIG.SITE_NAME,
    title: SEO_CONFIG.DEFAULT_TITLE,
    description: SEO_CONFIG.DEFAULT_DESCRIPTION,
    images: [
      {
        url: SEO_CONFIG.DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.SITE_NAME} - ${SITE_CONFIG.SITE_DESCRIPTION}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.DEFAULT_TITLE,
    description: SEO_CONFIG.DEFAULT_DESCRIPTION,
    images: [SEO_CONFIG.DEFAULT_IMAGE],
    creator: SITE_CONFIG.TWITTER_HANDLE,
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

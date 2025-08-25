import '../styles/globals.css';
import type { Metadata } from 'next';
import { SocketProvider } from '../components/providers/SocketProvider';
import { AnimationProvider } from './AnimationController';
import { AuthProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: 'TUIZ',
  description: 'Quiz platform for interactive learning',
  icons: {
    icon: '/logo.png',
  },
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

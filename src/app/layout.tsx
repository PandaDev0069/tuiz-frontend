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

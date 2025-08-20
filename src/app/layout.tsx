import '../styles/globals.css';
import type { Metadata } from 'next';
import { SocketProvider } from './SocketProvider';
import { AnimationProvider } from './AnimationController';

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
        <AnimationProvider>
          <SocketProvider>{children}</SocketProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}

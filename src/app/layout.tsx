import '../styles/globals.css';
import type { Metadata } from 'next';
import { MotionProvider } from './MotionProvider';
import { SocketProvider } from './SocketProvider';

export const metadata: Metadata = {
  title: 'TUIZ',
  description: 'Quiz platform for interactive learning',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <MotionProvider>
          <SocketProvider>{children}</SocketProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

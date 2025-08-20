'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const socket = io('http://localhost:8080', {
      transports: ['websocket'],
    });

    socket.on('server:hello', () => {
      // no-op; just verifying connectivity
    });

    socket.emit('client:hello');

    return () => {
      socket.close();
    };
  }, []);

  return <>{children}</>;
}

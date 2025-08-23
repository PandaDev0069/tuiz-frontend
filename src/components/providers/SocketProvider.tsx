'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { cfg } from '@/config/config';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Use the configured API base URL instead of hardcoded localhost
    const socketUrl = cfg.apiBase;

    console.log(`Connecting to Socket.IO server at: ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      timeout: 10000, // 10 second timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socketInstance.on('server:hello', () => {
      console.log('Received server hello message');
      // no-op; just verifying connectivity
    });

    // Send initial greeting
    socketInstance.emit('client:hello');

    return () => {
      console.log('Cleaning up Socket.IO connection');
      socketInstance.close();
    };
  }, []);

  return <>{children}</>;
}

'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { cfg } from '@/config/config';
import { DebugPanel } from '@/components/debug';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Use the configured API base URL instead of hardcoded localhost
    const socketUrl = cfg.apiBase;

    console.log(`Connecting to Socket.IO server at: ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      timeout: 10000, // 10 second timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);

      // Log additional debugging info
      console.log('Connection details:', {
        url: socketUrl,
        transports: socketInstance.io.opts.transports,
        timeout: socketInstance.io.opts.timeout,
        reconnection: socketInstance.io.opts.reconnection,
      });
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed after all attempts');
      setConnectionError('Reconnection failed after all attempts');
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
      setIsConnected(false);
      setConnectionError(null);
    };
  }, []);

  // Log connection status for debugging
  useEffect(() => {
    if (connectionError) {
      console.warn('Socket.IO connection error state:', connectionError);
    }
  }, [connectionError]);

  return (
    <>
      {/* Debug Panel - only in development */}
      <DebugPanel isSocketConnected={isConnected} socketError={connectionError} />
      {children}
    </>
  );
}

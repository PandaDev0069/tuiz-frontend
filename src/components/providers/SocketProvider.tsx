'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { cfg } from '@/config/config';
import { DebugPanel } from '@/components/debug';

const DEVICE_ID_KEY = 'tuiz_device_id';
const HEARTBEAT_INTERVAL_MS = 30000;

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-side';
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

// Socket context type
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

// Create Socket context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

// Hook to access socket instance
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const deviceIdRef = useRef<string>(getOrCreateDeviceId());

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

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

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
      socketInstance.emit('ws:connect', {
        deviceId: deviceIdRef.current,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          connectedAt: new Date().toISOString(),
        },
      });
      heartbeatRef.current = setInterval(() => {
        socketInstance.emit('ws:heartbeat');
      }, HEARTBEAT_INTERVAL_MS);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('ws:connected', (data) => {
      console.log('Socket.IO registration confirmed', data);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      clearHeartbeat();
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

    socketInstance.on('ws:error', (data) => {
      console.error('Socket.IO server error:', data);
      setConnectionError(data.message);
    });

    socketInstance.on('ws:pong', () => {
      // Heartbeat acknowledgement
    });

    socketInstance.on('server:hello', () => {
      console.log('Received server hello message');
      // no-op; just verifying connectivity
    });

    // Send initial greeting
    socketInstance.emit('client:hello');

    return () => {
      console.log('Cleaning up Socket.IO connection');
      clearHeartbeat();
      socketInstance.close();
      socketRef.current = null;
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
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, connectionError }}>
      {/* Debug Panel - only in development */}
      <DebugPanel isSocketConnected={isConnected} socketError={connectionError} />
      {children}
    </SocketContext.Provider>
  );
}

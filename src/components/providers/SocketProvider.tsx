'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { cfg } from '@/config/config';
import { DebugPanel } from '@/components/debug';
import { getOrCreateDeviceId } from '@/lib/deviceId';

const HEARTBEAT_INTERVAL_MS = 30000;

// Socket context type
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// Create Socket context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
  joinRoom: () => {},
  leaveRoom: () => {},
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
  const deviceIdRef = useRef<string | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  // Initialize device ID on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        deviceIdRef.current = getOrCreateDeviceId();
      } catch (error) {
        console.error('[SocketProvider] Failed to get device ID:', error);
        // Generate a temporary device ID if we can't get one
        deviceIdRef.current = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  }, []);

  useEffect(() => {
    // Don't initialize socket if device ID is not ready (during SSR)
    if (typeof window === 'undefined' || !deviceIdRef.current) {
      return;
    }

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
      if (deviceIdRef.current) {
        socketInstance.emit('ws:connect', {
          deviceId: deviceIdRef.current,
          metadata: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            connectedAt: new Date().toISOString(),
          },
        });
      }
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
      const errorMessage = error?.message || error?.toString() || 'Connection failed';
      console.error('Socket.IO connection error:', {
        error,
        message: errorMessage,
        type: (error as { type?: string })?.type,
        description: (error as { description?: string })?.description,
      });
      setConnectionError(errorMessage);
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
      const errorMessage = error?.message || error?.toString() || 'Reconnection failed';
      console.error('Socket.IO reconnection error:', {
        error,
        message: errorMessage,
        type: (error as { type?: string })?.type,
      });
      setConnectionError(`Reconnection failed: ${errorMessage}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed after all attempts');
      setConnectionError('Reconnection failed after all attempts');
    });

    socketInstance.on('ws:error', (data) => {
      // Handle empty error objects or missing message
      const errorMessage =
        data && typeof data === 'object' && 'message' in data && data.message
          ? data.message
          : data && typeof data === 'string'
            ? data
            : 'Unknown server error';

      console.error('Socket.IO server error:', {
        error: data,
        message: errorMessage,
        type: typeof data,
        keys: data && typeof data === 'object' ? Object.keys(data) : [],
      });

      setConnectionError(errorMessage);
    });

    socketInstance.on('ws:pong', () => {
      // Heartbeat acknowledgement
    });

    socketInstance.on('server:hello', () => {
      console.log('Received server hello message');
      // no-op; just verifying connectivity
    });

    // Catch-all error handler for any unhandled errors
    socketInstance.on('error', (error) => {
      const errorMessage = error?.message || error?.toString() || 'Unknown socket error';
      console.error('Socket.IO unhandled error:', {
        error,
        message: errorMessage,
        type: (error as { type?: string })?.type,
      });
      // Don't set connection error for unhandled errors - they might be recoverable
      // Only log them for debugging
    });

    // Send initial greeting
    socketInstance.emit('client:hello');

    const joinedRoomsOnSetup = joinedRoomsRef.current;

    return () => {
      console.log('Cleaning up Socket.IO connection');
      clearHeartbeat();
      joinedRoomsOnSetup.clear();
      socketInstance.close();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionError(null);
    };
  }, []); // Empty deps - only run once on mount (client-side)

  // Log connection status for debugging
  useEffect(() => {
    if (connectionError) {
      console.warn('Socket.IO connection error state:', connectionError);
    }
  }, [connectionError]);

  // Safe room join/leave helpers with deduping
  const joinRoom = (roomId: string) => {
    if (!socketRef.current || !roomId) return;
    if (joinedRoomsRef.current.has(roomId)) return;
    socketRef.current.emit('room:join', { roomId });
    joinedRoomsRef.current.add(roomId);
  };

  const leaveRoom = (roomId: string) => {
    if (!socketRef.current || !roomId) return;
    if (!joinedRoomsRef.current.has(roomId)) return;
    socketRef.current.emit('room:leave', { roomId });
    joinedRoomsRef.current.delete(roomId);
  };

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isConnected, connectionError, joinRoom, leaveRoom }}
    >
      {/* Debug Panel - only in development */}
      <DebugPanel isSocketConnected={isConnected} socketError={connectionError} />
      {children}
    </SocketContext.Provider>
  );
}

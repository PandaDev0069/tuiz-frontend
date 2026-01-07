// ====================================================
// File Name   : SocketProvider.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-12-26
//
// Description:
// - Socket.IO provider component for WebSocket communication
// - Manages socket connection, reconnection, and room management
// - Provides socket context to child components via useSocket hook
// - Handles device ID initialization and heartbeat mechanism
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Socket.IO client for real-time communication
// - Implements automatic reconnection with configurable attempts
// - Manages room join/leave with deduplication
// ====================================================

'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import { cfg } from '@/config/config';
import { getOrCreateDeviceIdScoped } from '@/lib/deviceId';

const HEARTBEAT_INTERVAL_MS = 30000;
const SOCKET_CONNECTION_TIMEOUT_MS = 10000;
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY_MS = 1000;

const SOCKET_TRANSPORTS = ['websocket', 'polling'] as const;

const HOST_SCREEN_PATH = '/host-screen';
const HOST_SCREEN_WINDOW_NAME = 'host-screen';
const TEMP_DEVICE_ID_PREFIX = 'temp-';
const TEMP_DEVICE_ID_RANDOM_LENGTH = 9;

const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
  ERROR: 'error',
  WS_CONNECT: 'ws:connect',
  WS_CONNECTED: 'ws:connected',
  WS_HEARTBEAT: 'ws:heartbeat',
  WS_PONG: 'ws:pong',
  WS_ERROR: 'ws:error',
  CLIENT_HELLO: 'client:hello',
  SERVER_HELLO: 'server:hello',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
} as const;

const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Connection failed',
  RECONNECTION_FAILED: 'Reconnection failed',
  RECONNECTION_FAILED_ALL_ATTEMPTS: 'Reconnection failed after all attempts',
  UNKNOWN_SERVER_ERROR: 'Unknown server error',
  UNKNOWN_SOCKET_ERROR: 'Unknown socket error',
  USE_SOCKET_OUTSIDE_PROVIDER: 'useSocket must be used within a SocketProvider',
} as const;

const DEFAULT_USER_AGENT = 'unknown';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isRegistered: boolean;
  connectionError: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isRegistered: false,
  connectionError: null,
  joinRoom: () => {},
  leaveRoom: () => {},
});

/**
 * Hook: useSocket
 * Description:
 * - Custom hook to access the Socket.IO context
 * - Provides socket instance, connection status, and room management functions
 * - Throws error if used outside of SocketProvider
 *
 * Returns:
 * - SocketContextType: Socket context with connection state and methods
 *
 * Throws:
 * - Error if used outside of SocketProvider
 *
 * Example:
 * ```tsx
 * const { socket, isConnected, joinRoom } = useSocket();
 * ```
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.USE_SOCKET_OUTSIDE_PROVIDER);
  }
  return context;
}

/**
 * Generates a temporary device ID when device ID retrieval fails.
 *
 * @returns {string} Temporary device ID string
 */
const generateTemporaryDeviceId = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, TEMP_DEVICE_ID_RANDOM_LENGTH);
  return `${TEMP_DEVICE_ID_PREFIX}${timestamp}-${randomString}`;
};

/**
 * Checks if the current window is a public screen based on pathname or window name.
 *
 * @returns {boolean} True if the window is a public screen
 */
const isPublicScreenWindow = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    window.location.pathname.includes(HOST_SCREEN_PATH) || window.name === HOST_SCREEN_WINDOW_NAME
  );
};

/**
 * Extracts error message from various error object formats.
 *
 * @param {unknown} error - Error object or string
 * @param {string} defaultMessage - Default message if extraction fails
 * @returns {string} Extracted error message
 */
const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  if (error && typeof error === 'string') {
    return error;
  }
  if (error) {
    return String(error);
  }
  return defaultMessage;
};

/**
 * Component: SocketProvider
 * Description:
 * - Provider component that manages Socket.IO connection lifecycle
 * - Initializes device ID and establishes WebSocket connection
 * - Handles connection events, reconnection, and error handling
 * - Provides room join/leave functionality with deduplication
 * - Manages heartbeat mechanism for connection health
 *
 * Parameters:
 * - children (React.ReactNode): Child components to wrap with socket provider
 *
 * Returns:
 * - React.ReactElement: The socket provider component
 *
 * Example:
 * ```tsx
 * <SocketProvider>
 *   <App />
 * </SocketProvider>
 * ```
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const isRegisteredRef = useRef(false);

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const isPublicScreen = isPublicScreenWindow();
        deviceIdRef.current = getOrCreateDeviceIdScoped({ perTab: isPublicScreen });
      } catch (error) {
        console.error('[SocketProvider] Failed to get device ID:', error);
        deviceIdRef.current = generateTemporaryDeviceId();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !deviceIdRef.current) {
      return;
    }

    const socketUrl = cfg.apiBase;

    const socketInstance = io(socketUrl, {
      transports: [...SOCKET_TRANSPORTS],
      timeout: SOCKET_CONNECTION_TIMEOUT_MS,
      reconnection: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY_MS,
      forceNew: true,
    });

    socketRef.current = socketInstance;

    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      if (deviceIdRef.current) {
        socketInstance.emit(SOCKET_EVENTS.WS_CONNECT, {
          deviceId: deviceIdRef.current,
          metadata: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : DEFAULT_USER_AGENT,
            connectedAt: new Date().toISOString(),
          },
        });
      }
      heartbeatRef.current = setInterval(() => {
        socketInstance.emit(SOCKET_EVENTS.WS_HEARTBEAT);
      }, HEARTBEAT_INTERVAL_MS);
      setIsConnected(true);
      setIsRegistered(false);
      isRegisteredRef.current = false;
      setConnectionError(null);
    });

    socketInstance.on(SOCKET_EVENTS.WS_CONNECTED, () => {
      setIsConnected(true);
      setIsRegistered(true);
      isRegisteredRef.current = true;
      setConnectionError(null);
    });

    socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => {
      clearHeartbeat();
      setIsConnected(false);
      setIsRegistered(false);
      isRegisteredRef.current = false;
    });

    socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      const errorMessage = extractErrorMessage(error, ERROR_MESSAGES.CONNECTION_FAILED);
      console.error('Socket.IO connection error:', {
        error,
        message: errorMessage,
        type: (error as { type?: string })?.type,
        description: (error as { description?: string })?.description,
      });
      setConnectionError(errorMessage);
      setIsConnected(false);
      setIsRegistered(false);
      isRegisteredRef.current = false;
    });

    socketInstance.on(SOCKET_EVENTS.RECONNECT, () => {
      setIsConnected(true);
      setIsRegistered(false);
      isRegisteredRef.current = false;
      setConnectionError(null);
    });

    socketInstance.on(SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
      const errorMessage = extractErrorMessage(error, ERROR_MESSAGES.RECONNECTION_FAILED);
      console.error('Socket.IO reconnection error:', {
        error,
        message: errorMessage,
        type: (error as { type?: string })?.type,
      });
      setConnectionError(`Reconnection failed: ${errorMessage}`);
      setIsRegistered(false);
      isRegisteredRef.current = false;
    });

    socketInstance.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
      console.error('Socket.IO reconnection failed after all attempts');
      setConnectionError(ERROR_MESSAGES.RECONNECTION_FAILED_ALL_ATTEMPTS);
      setIsRegistered(false);
      isRegisteredRef.current = false;
    });

    socketInstance.on(SOCKET_EVENTS.WS_ERROR, (data) => {
      const errorMessage =
        data && typeof data === 'object' && 'message' in data && data.message
          ? String(data.message)
          : data && typeof data === 'string'
            ? data
            : ERROR_MESSAGES.UNKNOWN_SERVER_ERROR;

      console.error('Socket.IO server error:', {
        error: data,
        message: errorMessage,
        type: typeof data,
        keys: data && typeof data === 'object' ? Object.keys(data) : [],
      });

      setConnectionError(errorMessage);
      setIsRegistered(false);
      isRegisteredRef.current = false;
    });

    socketInstance.on(SOCKET_EVENTS.WS_PONG, () => {});

    socketInstance.on(SOCKET_EVENTS.SERVER_HELLO, () => {});

    socketInstance.on(SOCKET_EVENTS.ERROR, (error) => {
      const errorMessage = extractErrorMessage(error, ERROR_MESSAGES.UNKNOWN_SOCKET_ERROR);
      console.error('Socket.IO unhandled error:', {
        error,
        message: errorMessage,
        type: (error as { type?: string })?.type,
      });
    });

    socketInstance.emit(SOCKET_EVENTS.CLIENT_HELLO);

    const joinedRoomsOnSetup = joinedRoomsRef.current;

    return () => {
      clearHeartbeat();
      joinedRoomsOnSetup.clear();
      socketInstance.close();
      socketRef.current = null;
      setIsConnected(false);
      setIsRegistered(false);
      isRegisteredRef.current = false;
      setConnectionError(null);
    };
  }, []);

  useEffect(() => {
    if (connectionError) {
      console.warn('Socket.IO connection error state:', connectionError);
    }
  }, [connectionError]);

  const joinRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !roomId || !isRegisteredRef.current) {
      return;
    }
    if (joinedRoomsRef.current.has(roomId)) {
      return;
    }
    socketRef.current.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId });
    joinedRoomsRef.current.add(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !roomId || !isRegisteredRef.current) {
      return;
    }
    if (!joinedRoomsRef.current.has(roomId)) {
      return;
    }
    socketRef.current.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId });
    joinedRoomsRef.current.delete(roomId);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        isRegistered,
        connectionError,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

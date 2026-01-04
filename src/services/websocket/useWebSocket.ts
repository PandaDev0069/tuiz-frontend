// ====================================================
// File Name   : useWebSocket.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-11-23
// Last Update : 2025-11-23

// Description:
// - React hook for WebSocket service integration
// - Provides reactive connection state and WebSocket API methods
// - Manages WebSocket service lifecycle and event listeners
// - Wraps WebSocketService singleton for React component usage

// Notes:
// - Client-side only hook (uses 'use client' directive)
// - Does not disconnect WebSocket on unmount (singleton pattern)
// - All methods are memoized with useCallback for performance
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketService } from './WebSocketService';
import { ConnectionStatus, WebSocketServiceEvents } from './types';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_CONNECTION_STATUS: ConnectionStatus = {
  connected: false,
  deviceId: '',
  reconnectCount: 0,
};

const DEFAULT_AUTO_CONNECT = true;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: UseWebSocketReturn
 * Description:
 * - Return type for useWebSocket hook
 * - Provides connection state and WebSocket API methods
 */
export interface UseWebSocketReturn {
  isConnected: boolean;
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendRoomMessage: (roomId: string, message: unknown) => void;
  sendGameAction: (roomId: string, action: string, payload: unknown) => void;
  sendGameState: (roomId: string, state: unknown) => void;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useWebSocket
 * Description:
 * - React hook for WebSocket service integration
 * - Initializes WebSocket service singleton and sets up event listeners
 * - Provides reactive connection state and WebSocket API methods
 * - Does not disconnect on unmount to preserve singleton connection
 *
 * Parameters:
 * - apiUrl (string): WebSocket server URL
 * - events (WebSocketServiceEvents, optional): Event listener callbacks
 *
 * Returns:
 * - UseWebSocketReturn: Connection state and WebSocket API methods
 */
export function useWebSocket(apiUrl: string, events?: WebSocketServiceEvents): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>(DEFAULT_CONNECTION_STATUS);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    wsRef.current = WebSocketService.getInstance({
      url: apiUrl,
      autoConnect: DEFAULT_AUTO_CONNECT,
    });

    wsRef.current.on({
      onConnected: (newStatus) => {
        setIsConnected(true);
        setStatus(newStatus);
        events?.onConnected?.(newStatus);
      },
      onDisconnected: (reason) => {
        setIsConnected(false);
        setStatus((prev) => ({ ...prev, connected: false }));
        events?.onDisconnected?.(reason);
      },
      onReconnecting: (attemptNumber) => {
        events?.onReconnecting?.(attemptNumber);
      },
      onError: (error) => {
        events?.onError?.(error);
      },
      onRoomJoined: (info) => {
        events?.onRoomJoined?.(info);
      },
      onRoomLeft: (roomId) => {
        events?.onRoomLeft?.(roomId);
      },
      onRoomMessage: (message) => {
        events?.onRoomMessage?.(message);
      },
      onRoomUserJoined: (data) => {
        events?.onRoomUserJoined?.(data);
      },
      onRoomUserLeft: (data) => {
        events?.onRoomUserLeft?.(data);
      },
      onGameAction: (action) => {
        events?.onGameAction?.(action);
      },
      onGameState: (state) => {
        events?.onGameState?.(state);
      },
    });

    return () => {};
  }, [apiUrl, events]);

  const connect = useCallback(() => {
    wsRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    wsRef.current?.reconnect();
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    wsRef.current?.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    wsRef.current?.leaveRoom(roomId);
  }, []);

  const sendRoomMessage = useCallback((roomId: string, message: unknown) => {
    wsRef.current?.sendRoomMessage(roomId, message);
  }, []);

  const sendGameAction = useCallback((roomId: string, action: string, payload: unknown) => {
    wsRef.current?.sendGameAction(roomId, action, payload);
  }, []);

  const sendGameState = useCallback((roomId: string, state: unknown) => {
    wsRef.current?.sendGameState(roomId, state);
  }, []);

  return {
    isConnected,
    status,
    connect,
    disconnect,
    reconnect,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    sendGameAction,
    sendGameState,
  };
}

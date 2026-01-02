// src/services/websocket/useWebSocket.ts

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketService } from './WebSocketService';
import { ConnectionStatus, WebSocketServiceEvents } from './types';

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

export function useWebSocket(apiUrl: string, events?: WebSocketServiceEvents): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    deviceId: '',
    reconnectCount: 0,
  });
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket service
    wsRef.current = WebSocketService.getInstance({
      url: apiUrl,
      autoConnect: true,
    });

    // Set up event listeners
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

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount as it's a singleton
      // Only disconnect when explicitly called
    };
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

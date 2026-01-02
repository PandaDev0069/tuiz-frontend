// src/services/websocket/types.ts

export interface ConnectionInfo {
  deviceId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ConnectionStatus {
  connected: boolean;
  socketId?: string;
  deviceId: string;
  reconnectCount: number;
  serverTime?: string;
  error?: string;
}

export interface RoomInfo {
  roomId: string;
  clients: number;
}

export interface RoomMessage {
  roomId: string;
  from: string;
  message: unknown;
  timestamp: string;
}

export interface GameAction {
  roomId: string;
  from: string;
  action: string;
  payload: unknown;
  timestamp: string;
}

export interface GameState {
  roomId: string;
  state: unknown;
}

export type ConnectionEventType = 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface ConnectionEvent {
  type: ConnectionEventType;
  timestamp: Date;
  data?: unknown;
}

export interface WebSocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  heartbeatInterval?: number;
}

export interface WebSocketServiceEvents {
  onConnected?: (status: ConnectionStatus) => void;
  onDisconnected?: (reason: string) => void;
  onReconnecting?: (attemptNumber: number) => void;
  onError?: (error: Error) => void;
  onRoomJoined?: (info: RoomInfo) => void;
  onRoomLeft?: (roomId: string) => void;
  onRoomMessage?: (message: RoomMessage) => void;
  onRoomUserJoined?: (data: { roomId: string; socketId: string }) => void;
  onRoomUserLeft?: (data: { roomId: string; socketId: string }) => void;
  onGameAction?: (action: GameAction) => void;
  onGameState?: (state: GameState) => void;
}

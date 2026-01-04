// ====================================================
// File Name   : types.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-11-23
// Last Update : 2025-11-23

// Description:
// - Type definitions for WebSocket service
// - Defines interfaces for connection, rooms, games, and events
// - Provides type safety for WebSocket service and hooks

// Notes:
// - All types are exported for use in WebSocket service and React hooks
// - Types are organized by domain (Connection, Room, Game, Events)
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
// No external dependencies - pure type definitions

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
// No constants - type definitions only

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: ConnectionInfo
 * Description:
 * - Information sent when connecting to WebSocket server
 * - Includes device identifier and optional user metadata
 */
export interface ConnectionInfo {
  deviceId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interface: ConnectionStatus
 * Description:
 * - Current WebSocket connection status
 * - Tracks connection state, socket ID, device ID, and error information
 */
export interface ConnectionStatus {
  connected: boolean;
  socketId?: string;
  deviceId: string;
  reconnectCount: number;
  serverTime?: string;
  error?: string;
}

/**
 * Interface: RoomInfo
 * Description:
 * - Information about a WebSocket room
 * - Contains room identifier and client count
 */
export interface RoomInfo {
  roomId: string;
  clients: number;
}

/**
 * Interface: RoomMessage
 * Description:
 * - Message sent within a WebSocket room
 * - Includes sender information and timestamp
 */
export interface RoomMessage {
  roomId: string;
  from: string;
  message: unknown;
  timestamp: string;
}

/**
 * Interface: GameAction
 * Description:
 * - Game action event sent through WebSocket
 * - Contains action type, payload, and metadata
 */
export interface GameAction {
  roomId: string;
  from: string;
  action: string;
  payload: unknown;
  timestamp: string;
}

/**
 * Interface: GameState
 * Description:
 * - Game state broadcast through WebSocket
 * - Contains room identifier and state payload
 */
export interface GameState {
  roomId: string;
  state: unknown;
}

/**
 * Type: ConnectionEventType
 * Description:
 * - Union type for connection event types
 * - Represents different connection lifecycle events
 */
export type ConnectionEventType = 'connected' | 'disconnected' | 'reconnecting' | 'error';

/**
 * Interface: ConnectionEvent
 * Description:
 * - Historical connection event record
 * - Tracks connection events with timestamp and optional data
 */
export interface ConnectionEvent {
  type: ConnectionEventType;
  timestamp: Date;
  data?: unknown;
}

/**
 * Interface: WebSocketConfig
 * Description:
 * - Configuration options for WebSocket service
 * - Controls connection behavior, reconnection, and heartbeat settings
 */
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

/**
 * Interface: WebSocketServiceEvents
 * Description:
 * - Event listener callbacks for WebSocket service
 * - Provides typed callbacks for all WebSocket events
 */
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

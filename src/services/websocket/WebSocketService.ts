// ====================================================
// File Name   : WebSocketService.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-11-23
// Last Update : 2025-12-22

// Description:
// - Singleton service for managing WebSocket connections
// - Handles device ID management, reconnection, and heartbeat
// - Provides game-ready API for room and game event management
// - Manages connection state and event listeners

// Notes:
// - Uses singleton pattern for service instance
// - Handles client-side only device ID generation
// - Supports automatic reconnection with configurable attempts
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { io, Socket } from 'socket.io-client';
import {
  ConnectionInfo,
  ConnectionStatus,
  WebSocketConfig,
  WebSocketServiceEvents,
  ConnectionEvent,
} from './types';
import { getOrCreateDeviceId, resetDeviceId } from '@/lib/deviceId';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const HEARTBEAT_INTERVAL_MS = 30000;
const MAX_CONNECTION_HISTORY = 100;
const RECONNECT_DELAY_MS = 100;
const DEFAULT_RECONNECTION_DELAY_MS = 1000;
const DEFAULT_RECONNECTION_DELAY_MAX_MS = 5000;
const DEFAULT_TIMEOUT_MS = 20000;
const RECONNECTION_ATTEMPTS_INFINITE = Infinity;

const TEMP_DEVICE_ID_PREFIX = 'temp-';
const DEVICE_ID_RANDOM_LENGTH = 9;

const ERROR_MESSAGE_NOT_INITIALIZED = 'WebSocketService must be initialized with config first';
const ERROR_MESSAGE_NOT_CONNECTED = 'Not connected to server';

const SOCKET_TRANSPORTS = ['websocket', 'polling'] as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
// Types are imported from ./types.ts

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: WebSocketService
 * Description:
 * - Singleton service for managing WebSocket connections using Socket.IO
 * - Handles device ID management, automatic reconnection, and heartbeat
 * - Provides APIs for room management and game event handling
 * - Tracks connection history and status
 */
export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private deviceId: string;
  private connectionStatus: ConnectionStatus;
  private eventListeners: WebSocketServiceEvents = {};
  private connectionHistory: ConnectionEvent[] = [];
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  /**
   * Constructor: WebSocketService
   * Description:
   * - Private constructor for singleton pattern
   * - Initializes configuration with defaults
   * - Sets up device ID (client-side only)
   * - Auto-connects if configured
   *
   * Parameters:
   * - config (WebSocketConfig): WebSocket configuration options
   */
  private constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS_INFINITE,
      reconnectionDelay: DEFAULT_RECONNECTION_DELAY_MS,
      reconnectionDelayMax: DEFAULT_RECONNECTION_DELAY_MAX_MS,
      timeout: DEFAULT_TIMEOUT_MS,
      heartbeatInterval: HEARTBEAT_INTERVAL_MS,
      ...config,
    };

    if (typeof window !== 'undefined') {
      try {
        this.deviceId = getOrCreateDeviceId();
      } catch (error) {
        console.error('[WebSocketService] Failed to get device ID:', error);
        this.deviceId = `${TEMP_DEVICE_ID_PREFIX}${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, DEVICE_ID_RANDOM_LENGTH)}`;
      }
    } else {
      this.deviceId = '';
    }
    this.connectionStatus = {
      connected: false,
      deviceId: this.deviceId,
      reconnectCount: 0,
    };

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  /**
   * Method: getInstance
   * Description:
   * - Gets or creates singleton instance
   * - Requires config on first call
   *
   * Parameters:
   * - config (WebSocketConfig, optional): Configuration for initial setup
   *
   * Returns:
   * - WebSocketService: Singleton service instance
   *
   * Throws:
   * - Error: If instance doesn't exist and no config provided
   */
  public static getInstance(config?: WebSocketConfig): WebSocketService {
    if (!WebSocketService.instance && config) {
      WebSocketService.instance = new WebSocketService(config);
    } else if (!WebSocketService.instance) {
      throw new Error(ERROR_MESSAGE_NOT_INITIALIZED);
    }
    return WebSocketService.instance;
  }

  /**
   * Method: resetInstance
   * Description:
   * - Resets singleton instance by disconnecting and clearing reference
   *
   * Returns:
   * - void: No return value
   */
  public static resetInstance(): void {
    if (WebSocketService.instance) {
      WebSocketService.instance.disconnect();
      WebSocketService.instance = null;
    }
  }

  /**
   * Method: connect
   * Description:
   * - Establishes WebSocket connection to server
   * - Sets up socket listeners and configuration
   * - Skips if already connected
   *
   * Returns:
   * - void: No return value
   */
  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.isManualDisconnect = false;

    this.socket = io(this.config.url, {
      transports: [...SOCKET_TRANSPORTS],
      timeout: this.config.timeout,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
      autoConnect: true,
    });

    this.setupSocketListeners();
  }

  /**
   * Method: disconnect
   * Description:
   * - Disconnects WebSocket connection
   * - Stops heartbeat and marks as manual disconnect
   *
   * Returns:
   * - void: No return value
   */
  public disconnect(): void {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    this.socket?.disconnect();
  }

  /**
   * Method: reconnect
   * Description:
   * - Manually triggers reconnection by disconnecting and reconnecting after delay
   *
   * Returns:
   * - void: No return value
   */
  public reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
  }

  /**
   * Method: isConnected
   * Description:
   * - Checks if socket is currently connected
   *
   * Returns:
   * - boolean: True if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Method: getStatus
   * Description:
   * - Gets current connection status
   *
   * Returns:
   * - ConnectionStatus: Copy of current connection status
   */
  public getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Method: getDeviceId
   * Description:
   * - Gets current device ID
   *
   * Returns:
   * - string: Device identifier
   */
  public getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * Method: getConnectionHistory
   * Description:
   * - Gets connection event history
   *
   * Returns:
   * - ConnectionEvent[]: Copy of connection history array
   */
  public getConnectionHistory(): ConnectionEvent[] {
    return [...this.connectionHistory];
  }

  /**
   * Method: on
   * Description:
   * - Registers event listeners for WebSocket events
   * - Merges with existing listeners
   *
   * Parameters:
   * - events (WebSocketServiceEvents): Event listener callbacks
   *
   * Returns:
   * - void: No return value
   */
  public on(events: WebSocketServiceEvents): void {
    this.eventListeners = { ...this.eventListeners, ...events };
  }

  /**
   * Method: joinRoom
   * Description:
   * - Joins a WebSocket room
   *
   * Parameters:
   * - roomId (string): Room identifier to join
   *
   * Returns:
   * - void: No return value
   *
   * Throws:
   * - Error: If not connected to server
   */
  public joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error(ERROR_MESSAGE_NOT_CONNECTED);
    }
    this.socket.emit('room:join', { roomId });
  }

  /**
   * Method: leaveRoom
   * Description:
   * - Leaves a WebSocket room
   *
   * Parameters:
   * - roomId (string): Room identifier to leave
   *
   * Returns:
   * - void: No return value
   *
   * Throws:
   * - Error: If not connected to server
   */
  public leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error(ERROR_MESSAGE_NOT_CONNECTED);
    }
    this.socket.emit('room:leave', { roomId });
  }

  /**
   * Method: sendRoomMessage
   * Description:
   * - Sends a message to a WebSocket room
   *
   * Parameters:
   * - roomId (string): Room identifier
   * - message (unknown): Message payload to send
   *
   * Returns:
   * - void: No return value
   *
   * Throws:
   * - Error: If not connected to server
   */
  public sendRoomMessage(roomId: string, message: unknown): void {
    if (!this.socket?.connected) {
      throw new Error(ERROR_MESSAGE_NOT_CONNECTED);
    }
    this.socket.emit('room:message', { roomId, message });
  }

  /**
   * Method: sendGameAction
   * Description:
   * - Sends a game action to a WebSocket room
   *
   * Parameters:
   * - roomId (string): Room identifier
   * - action (string): Action name
   * - payload (unknown): Action payload
   *
   * Returns:
   * - void: No return value
   *
   * Throws:
   * - Error: If not connected to server
   */
  public sendGameAction(roomId: string, action: string, payload: unknown): void {
    if (!this.socket?.connected) {
      throw new Error(ERROR_MESSAGE_NOT_CONNECTED);
    }
    this.socket.emit('game:action', { roomId, action, payload });
  }

  /**
   * Method: sendGameState
   * Description:
   * - Sends game state to a WebSocket room
   *
   * Parameters:
   * - roomId (string): Room identifier
   * - state (unknown): Game state payload
   *
   * Returns:
   * - void: No return value
   *
   * Throws:
   * - Error: If not connected to server
   */
  public sendGameState(roomId: string, state: unknown): void {
    if (!this.socket?.connected) {
      throw new Error(ERROR_MESSAGE_NOT_CONNECTED);
    }
    this.socket.emit('game:state', { roomId, state });
  }

  /**
   * Method: clearDeviceId
   * Description:
   * - Clears and resets device ID using library function
   *
   * Returns:
   * - void: No return value
   */
  public clearDeviceId(): void {
    this.deviceId = resetDeviceId();
  }

  /**
   * Method: simulateDisconnect
   * Description:
   * - Simulates disconnection for testing purposes
   *
   * Returns:
   * - void: No return value
   */
  public simulateDisconnect(): void {
    this.socket?.disconnect();
  }

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: addConnectionEvent
   * Description:
   * - Adds connection event to history
   * - Maintains maximum history size
   *
   * Parameters:
   * - type (ConnectionEvent['type']): Event type
   * - data (unknown, optional): Event data
   *
   * Returns:
   * - void: No return value
   */
  private addConnectionEvent(type: ConnectionEvent['type'], data?: unknown): void {
    const event: ConnectionEvent = {
      type,
      timestamp: new Date(),
      data,
    };
    this.connectionHistory.push(event);

    if (this.connectionHistory.length > MAX_CONNECTION_HISTORY) {
      this.connectionHistory.shift();
    }
  }

  /**
   * Method: setupSocketListeners
   * Description:
   * - Sets up all Socket.IO event listeners
   * - Handles connection, disconnection, errors, and game events
   *
   * Returns:
   * - void: No return value
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.addConnectionEvent('connected');
      this.isManualDisconnect = false;

      const connectionInfo: ConnectionInfo = {
        deviceId: this.deviceId,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      };
      this.socket!.emit('ws:connect', connectionInfo);
    });

    this.socket.on('ws:connected', (data) => {
      this.connectionStatus = {
        connected: true,
        socketId: data.socketId,
        deviceId: data.deviceId,
        reconnectCount: data.reconnectCount,
        serverTime: data.serverTime,
      };
      this.eventListeners.onConnected?.(this.connectionStatus);
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionStatus.connected = false;
      this.addConnectionEvent('disconnected', { reason });
      this.eventListeners.onDisconnected?.(reason);
      this.stopHeartbeat();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error);
      this.connectionStatus.error = error.message;
      this.addConnectionEvent('error', { message: error.message });
      this.eventListeners.onError?.(error);
    });

    this.socket.io.on('reconnect_attempt', (attemptNumber) => {
      this.addConnectionEvent('reconnecting', { attemptNumber });
      this.eventListeners.onReconnecting?.(attemptNumber);
    });

    this.socket.on('ws:error', (data) => {
      console.error('[WS] Server error:', data);
      this.connectionStatus.error = data.message;
      this.eventListeners.onError?.(new Error(data.message));
    });

    this.socket.on('ws:pong', () => {});

    this.socket.on('room:joined', (data) => {
      this.eventListeners.onRoomJoined?.(data);
    });

    this.socket.on('room:left', (data) => {
      this.eventListeners.onRoomLeft?.(data.roomId);
    });

    this.socket.on('room:message', (data) => {
      this.eventListeners.onRoomMessage?.(data);
    });

    this.socket.on('room:user-joined', (data) => {
      this.eventListeners.onRoomUserJoined?.(data);
    });

    this.socket.on('room:user-left', (data) => {
      this.eventListeners.onRoomUserLeft?.(data);
    });

    this.socket.on('game:action', (data) => {
      this.eventListeners.onGameAction?.(data);
    });

    this.socket.on('game:state', (data) => {
      this.eventListeners.onGameState?.(data);
    });
  }

  /**
   * Method: startHeartbeat
   * Description:
   * - Starts heartbeat interval to keep connection alive
   * - Stops existing heartbeat before starting new one
   *
   * Returns:
   * - void: No return value
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ws:heartbeat');
      }
    }, this.config.heartbeatInterval!);
  }

  /**
   * Method: stopHeartbeat
   * Description:
   * - Stops heartbeat interval
   *
   * Returns:
   * - void: No return value
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

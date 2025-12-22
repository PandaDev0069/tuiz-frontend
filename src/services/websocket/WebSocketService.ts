// src/services/websocket/WebSocketService.ts

import { io, Socket } from 'socket.io-client';
import {
  ConnectionInfo,
  ConnectionStatus,
  WebSocketConfig,
  WebSocketServiceEvents,
  ConnectionEvent,
} from './types';
import { getOrCreateDeviceId, resetDeviceId } from '@/lib/deviceId';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

/**
 * WebSocket Service - Singleton for managing WebSocket connections
 * Handles device ID, reconnection, heartbeat, and provides game-ready API
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

  private constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      heartbeatInterval: HEARTBEAT_INTERVAL,
      ...config,
    };

    // Only get device ID on client side
    if (typeof window !== 'undefined') {
      try {
        this.deviceId = getOrCreateDeviceId();
      } catch (error) {
        console.error('[WebSocketService] Failed to get device ID:', error);
        // Generate a temporary device ID if we can't get one
        this.deviceId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    } else {
      // During SSR, use a placeholder
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

  public static getInstance(config?: WebSocketConfig): WebSocketService {
    if (!WebSocketService.instance && config) {
      WebSocketService.instance = new WebSocketService(config);
    } else if (!WebSocketService.instance) {
      throw new Error('WebSocketService must be initialized with config first');
    }
    return WebSocketService.instance;
  }

  public static resetInstance(): void {
    if (WebSocketService.instance) {
      WebSocketService.instance.disconnect();
      WebSocketService.instance = null;
    }
  }

  private addConnectionEvent(type: ConnectionEvent['type'], data?: unknown): void {
    const event: ConnectionEvent = {
      type,
      timestamp: new Date(),
      data,
    };
    this.connectionHistory.push(event);

    // Keep only last 100 events
    if (this.connectionHistory.length > 100) {
      this.connectionHistory.shift();
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[WS] Connected to server');
      this.addConnectionEvent('connected');
      this.isManualDisconnect = false;

      // Send device ID and connection info
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
      console.log('[WS] Registration confirmed', data);
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
      console.log('[WS] Disconnected:', reason);
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
      console.log('[WS] Reconnection attempt:', attemptNumber);
      this.addConnectionEvent('reconnecting', { attemptNumber });
      this.eventListeners.onReconnecting?.(attemptNumber);
    });

    this.socket.on('ws:error', (data) => {
      console.error('[WS] Server error:', data);
      this.connectionStatus.error = data.message;
      this.eventListeners.onError?.(new Error(data.message));
    });

    this.socket.on('ws:pong', () => {
      // Heartbeat acknowledged
    });

    // Room events
    this.socket.on('room:joined', (data) => {
      console.log('[WS] Joined room:', data);
      this.eventListeners.onRoomJoined?.(data);
    });

    this.socket.on('room:left', (data) => {
      console.log('[WS] Left room:', data);
      this.eventListeners.onRoomLeft?.(data.roomId);
    });

    this.socket.on('room:message', (data) => {
      console.log('[WS] Room message:', data);
      this.eventListeners.onRoomMessage?.(data);
    });

    this.socket.on('room:user-joined', (data) => {
      console.log('[WS] User joined room:', data);
      this.eventListeners.onRoomUserJoined?.(data);
    });

    this.socket.on('room:user-left', (data) => {
      console.log('[WS] User left room:', data);
      this.eventListeners.onRoomUserLeft?.(data);
    });

    // Game events
    this.socket.on('game:action', (data) => {
      console.log('[WS] Game action:', data);
      this.eventListeners.onGameAction?.(data);
    });

    this.socket.on('game:state', (data) => {
      console.log('[WS] Game state:', data);
      this.eventListeners.onGameState?.(data);
    });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ws:heartbeat');
      }
    }, this.config.heartbeatInterval!);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Public API
  public connect(): void {
    if (this.socket?.connected) {
      console.log('[WS] Already connected');
      return;
    }

    console.log('[WS] Connecting to', this.config.url);
    this.isManualDisconnect = false;

    this.socket = io(this.config.url, {
      transports: ['websocket', 'polling'],
      timeout: this.config.timeout,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
      autoConnect: true,
    });

    this.setupSocketListeners();
  }

  public disconnect(): void {
    console.log('[WS] Disconnecting');
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    this.socket?.disconnect();
  }

  public reconnect(): void {
    console.log('[WS] Manual reconnect');
    this.disconnect();
    setTimeout(() => this.connect(), 100);
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public getConnectionHistory(): ConnectionEvent[] {
    return [...this.connectionHistory];
  }

  public on(events: WebSocketServiceEvents): void {
    this.eventListeners = { ...this.eventListeners, ...events };
  }

  // Room API
  public joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('room:join', { roomId });
  }

  public leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('room:leave', { roomId });
  }

  public sendRoomMessage(roomId: string, message: unknown): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('room:message', { roomId, message });
  }

  // Game API
  public sendGameAction(roomId: string, action: string, payload: unknown): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('game:action', { roomId, action, payload });
  }

  public sendGameState(roomId: string, state: unknown): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('game:state', { roomId, state });
  }

  // Testing/Debug API
  public clearDeviceId(): void {
    // Use the library function to reset device ID
    this.deviceId = resetDeviceId();
  }

  public simulateDisconnect(): void {
    this.socket?.disconnect();
  }
}

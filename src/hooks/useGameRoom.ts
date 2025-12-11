/**
 * useGameRoom Hook
 * Game room management with real-time player synchronization
 * Wraps useWebSocket with game-specific room logic
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/services/websocket/useWebSocket';
import { gameApi, type Player } from '@/services/gameApi';
import { cfg } from '@/config/config';

// ============================================================================
// TYPES
// ============================================================================

export interface GameRoom {
  gameId: string;
  roomCode: string;
  hostId: string;
  isLocked: boolean;
  playerCount: number;
  maxPlayers: number;
}

export interface GameRoomEvents {
  onPlayerJoined?: (player: Player) => void;
  onPlayerLeft?: (playerId: string) => void;
  onHostChanged?: (newHostId: string) => void;
  onRoomLocked?: (isLocked: boolean) => void;
  onError?: (error: string) => void;
}

export interface UseGameRoomReturn {
  // State
  room: GameRoom | null;
  players: Player[];
  isConnected: boolean;
  isHost: boolean;
  currentPlayer: Player | null;
  error: string | null;

  // Actions
  joinRoom: (gameId: string, displayName: string) => Promise<void>;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => Promise<void>;
  transferHost: (newHostId: string) => void;
  lockRoom: (locked: boolean) => Promise<void>;
  refreshPlayers: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGameRoom(events?: GameRoomEvents): UseGameRoomReturn {
  // State
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs to avoid stale closures
  const playersRef = useRef<Player[]>([]);
  const roomRef = useRef<GameRoom | null>(null);

  useEffect(() => {
    playersRef.current = players;
    roomRef.current = room;
  }, [players, room]);

  // ========================================================================
  // REFRESH PLAYERS (defined early for use in WebSocket callbacks)
  // ========================================================================

  const refreshPlayers = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const { data: playerList, error: apiError } = await gameApi.getPlayers(
        roomRef.current.gameId,
      );

      if (apiError || !playerList) {
        console.error('[useGameRoom] Failed to fetch players:', apiError);
        return;
      }

      setPlayers(playerList);

      // Update room player count
      setRoom((prev) => (prev ? { ...prev, playerCount: playerList.length } : null));
    } catch (err) {
      console.error('[useGameRoom] Refresh players error:', err);
    }
  }, []);

  // WebSocket connection
  const ws = useWebSocket(cfg.apiBase, {
    onConnected: (status) => {
      console.log('[useGameRoom] Connected', status);
      setError(null);
    },
    onDisconnected: (reason) => {
      console.log('[useGameRoom] Disconnected', reason);
      setError('Connection lost. Reconnecting...');
    },
    onError: (err) => {
      const errorMsg = typeof err === 'string' ? err : 'WebSocket error';
      console.error('[useGameRoom] Error:', errorMsg);
      setError(errorMsg);
      events?.onError?.(errorMsg);
    },
    onRoomJoined: (info) => {
      console.log('[useGameRoom] Room joined', info);
      setError(null);
    },
    onRoomLeft: (roomId) => {
      console.log('[useGameRoom] Room left', roomId);
      setRoom(null);
      setPlayers([]);
      setCurrentPlayer(null);
    },
    onRoomUserJoined: (data) => {
      console.log('[useGameRoom] User joined', data);

      // Refresh player list from API when someone joins
      if (roomRef.current) {
        refreshPlayers();
      }

      // Update room player count
      setRoom((prev) => (prev ? { ...prev, playerCount: prev.playerCount + 1 } : null));

      // Notify listeners (data contains socketId, roomId)
      // Player details will be fetched via refreshPlayers
      events?.onPlayerJoined?.(data as unknown as Player);
    },
    onRoomUserLeft: (data) => {
      console.log('[useGameRoom] User left', data);

      // Refresh player list from API when someone leaves
      if (roomRef.current) {
        refreshPlayers();
      }

      // Update room player count
      setRoom((prev) =>
        prev ? { ...prev, playerCount: Math.max(0, prev.playerCount - 1) } : null,
      );

      // Notify listeners (data contains socketId, roomId)
      events?.onPlayerLeft?.(data.socketId);
    },
  });

  // ========================================================================
  // JOIN ROOM
  // ========================================================================

  const joinRoom = useCallback(
    async (gameId: string, displayName: string) => {
      try {
        setError(null);

        // Get device ID from WebSocket service
        const deviceId = ws.status.deviceId;

        // Join game via REST API
        const { data: player, error: apiError } = await gameApi.joinGame(
          gameId,
          displayName,
          deviceId,
        );

        if (apiError || !player) {
          throw new Error(apiError?.message || 'Failed to join game');
        }

        setCurrentPlayer(player);

        // Get game details
        const { data: game, error: gameError } = await gameApi.getGame(gameId);

        if (gameError || !game) {
          throw new Error(gameError?.message || 'Failed to get game details');
        }

        // Set up room state
        setRoom({
          gameId: game.id,
          roomCode: game.room_code,
          hostId: game.user_id,
          isLocked: game.locked,
          playerCount: 0, // Will be updated by player list
          maxPlayers: 400,
        });

        // Join WebSocket room
        ws.joinRoom(game.room_code);

        // Fetch initial player list
        await refreshPlayers();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to join room';
        console.error('[useGameRoom] Join error:', errorMsg);
        setError(errorMsg);
        events?.onError?.(errorMsg);
        throw err;
      }
    },
    [ws, events, refreshPlayers],
  );

  // ========================================================================
  // LEAVE ROOM
  // ========================================================================

  const leaveRoom = useCallback(() => {
    if (roomRef.current) {
      ws.leaveRoom(roomRef.current.roomCode);
      setRoom(null);
      setPlayers([]);
      setCurrentPlayer(null);
      setError(null);
    }
  }, [ws]);

  // ========================================================================
  // KICK PLAYER
  // ========================================================================

  const kickPlayer = useCallback(
    async (playerId: string) => {
      if (!roomRef.current) {
        throw new Error('Not in a room');
      }

      try {
        setError(null);

        const { error: apiError } = await gameApi.kickPlayer(roomRef.current.gameId, playerId);

        if (apiError) {
          throw new Error(apiError.message || 'Failed to kick player');
        }

        // Remove from local state immediately (optimistic update)
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to kick player';
        console.error('[useGameRoom] Kick error:', errorMsg);
        setError(errorMsg);
        events?.onError?.(errorMsg);
        throw err;
      }
    },
    [events],
  );

  // ========================================================================
  // TRANSFER HOST
  // ========================================================================

  const transferHost = useCallback(
    (newHostId: string) => {
      if (!roomRef.current) {
        console.warn('[useGameRoom] Cannot transfer host: not in a room');
        return;
      }

      // Update local state
      setRoom((prev) => (prev ? { ...prev, hostId: newHostId } : null));

      // Notify via WebSocket
      ws.sendGameAction(roomRef.current.roomCode, 'transfer-host', {
        newHostId,
      });

      events?.onHostChanged?.(newHostId);
    },
    [ws, events],
  );

  // ========================================================================
  // LOCK/UNLOCK ROOM
  // ========================================================================

  const lockRoom = useCallback(
    async (locked: boolean) => {
      if (!roomRef.current) {
        throw new Error('Not in a room');
      }

      try {
        setError(null);

        const { data: updatedGame, error: apiError } = await gameApi.lockGame(
          roomRef.current.gameId,
          locked,
        );

        if (apiError || !updatedGame) {
          throw new Error(apiError?.message || 'Failed to lock room');
        }

        // Update local state
        setRoom((prev) => (prev ? { ...prev, isLocked: locked } : null));

        events?.onRoomLocked?.(locked);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to lock room';
        console.error('[useGameRoom] Lock error:', errorMsg);
        setError(errorMsg);
        events?.onError?.(errorMsg);
        throw err;
      }
    },
    [events],
  );

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const isHost = currentPlayer?.is_host ?? false;

  return {
    // State
    room,
    players,
    isConnected: ws.isConnected,
    isHost,
    currentPlayer,
    error,

    // Actions
    joinRoom,
    leaveRoom,
    kickPlayer,
    transferHost,
    lockRoom,
    refreshPlayers,
  };
}

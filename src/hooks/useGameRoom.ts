// ====================================================
// File Name   : useGameRoom.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-11
// Last Update : 2025-12-23
//
// Description:
// - Game room management hook with real-time player synchronization
// - Wraps useWebSocket with game-specific room logic
// - Handles room joining, leaving, player management, and host operations
//
// Notes:
// - Uses WebSocket for real-time updates
// - Manages room state and player list synchronization
// - Supports host operations (kick, transfer host, lock room)
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useEffect, useCallback, useRef } from 'react';

import { useWebSocket } from '@/services/websocket/useWebSocket';
import { gameApi, type Player } from '@/services/gameApi';
import { cfg } from '@/config/config';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const MAX_PLAYERS = 200;
const INITIAL_PLAYER_COUNT = 0;

const ERROR_MESSAGES = {
  NOT_IN_ROOM: 'Not in a room',
  FAILED_TO_JOIN_GAME: 'Failed to join game',
  FAILED_TO_GET_GAME_DETAILS: 'Failed to get game details',
  FAILED_TO_JOIN_ROOM: 'Failed to join room',
  FAILED_TO_KICK_PLAYER: 'Failed to kick player',
  FAILED_TO_LOCK_ROOM: 'Failed to lock room',
  CONNECTION_LOST: 'Connection lost. Reconnecting...',
  MISSING_ROOM_CODE: 'Missing room_code for game; skipping WebSocket join',
} as const;

const GAME_ACTION_TRANSFER_HOST = 'transfer-host';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
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
  room: GameRoom | null;
  players: Player[];
  isConnected: boolean;
  isHost: boolean;
  currentPlayer: Player | null;
  error: string | null;
  joinRoom: (gameId: string, displayName: string) => Promise<void>;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => Promise<void>;
  transferHost: (newHostId: string) => void;
  lockRoom: (locked: boolean) => Promise<void>;
  refreshPlayers: () => Promise<void>;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useGameRoom
 * Description:
 * - Manages game room state and real-time player synchronization
 * - Provides functions for joining/leaving rooms, managing players, and host operations
 * - Handles WebSocket connections and room events
 *
 * Parameters:
 * - events (GameRoomEvents, optional): Event callbacks for room events
 *
 * Returns:
 * - UseGameRoomReturn: Object containing room state, players, and action functions
 */
export function useGameRoom(events?: GameRoomEvents): UseGameRoomReturn {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  const playersRef = useRef<Player[]>([]);
  const roomRef = useRef<GameRoom | null>(null);

  useEffect(() => {
    playersRef.current = players;
    roomRef.current = room;
  }, [players, room]);

  const refreshPlayers = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const { data: playerList, error: apiError } = await gameApi.getPlayers(
        roomRef.current.gameId,
      );

      if (apiError || !playerList) {
        return;
      }

      const playersArray = playerList.players || [];
      setPlayers(playersArray);

      setRoom((prev) => (prev ? { ...prev, playerCount: playersArray.length } : null));
    } catch {}
  }, []);

  const ws = useWebSocket(cfg.apiBase, {
    onConnected: () => {
      setError(null);
    },
    onDisconnected: () => {
      setError(ERROR_MESSAGES.CONNECTION_LOST);
    },
    onError: (err) => {
      const errorMsg = typeof err === 'string' ? err : 'WebSocket error';
      setError(errorMsg);
      events?.onError?.(errorMsg);
    },
    onRoomJoined: () => {
      setError(null);
    },
    onRoomLeft: () => {
      setRoom(null);
      setPlayers([]);
      setCurrentPlayer(null);
    },
    onRoomUserJoined: (data) => {
      if (roomRef.current) {
        refreshPlayers();
      }

      setRoom((prev) => (prev ? { ...prev, playerCount: prev.playerCount + 1 } : null));

      events?.onPlayerJoined?.(data as unknown as Player);
    },
    onRoomUserLeft: (data) => {
      if (roomRef.current) {
        refreshPlayers();
      }

      setRoom((prev) =>
        prev ? { ...prev, playerCount: Math.max(0, prev.playerCount - 1) } : null,
      );

      events?.onPlayerLeft?.(data.socketId);
    },
  });

  const joinRoom = useCallback(
    async (gameId: string, displayName: string) => {
      try {
        setError(null);

        const deviceId = ws.status.deviceId;

        const { data: player, error: apiError } = await gameApi.joinGame(
          gameId,
          displayName,
          deviceId,
        );

        if (apiError || !player) {
          throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_JOIN_GAME);
        }

        setCurrentPlayer(player);

        const { data: game, error: gameError } = await gameApi.getGame(gameId);

        if (gameError || !game) {
          throw new Error(gameError?.message || ERROR_MESSAGES.FAILED_TO_GET_GAME_DETAILS);
        }

        setRoom({
          gameId: game.id,
          roomCode: game.room_code ?? '',
          hostId: game.user_id,
          isLocked: game.locked,
          playerCount: INITIAL_PLAYER_COUNT,
          maxPlayers: MAX_PLAYERS,
        });

        if (!game.room_code) {
          return;
        }
        ws.joinRoom(game.room_code);

        await refreshPlayers();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_JOIN_ROOM;
        setError(errorMsg);
        events?.onError?.(errorMsg);
        throw err;
      }
    },
    [ws, events, refreshPlayers],
  );

  const leaveRoom = useCallback(() => {
    if (roomRef.current) {
      ws.leaveRoom(roomRef.current.roomCode);
      setRoom(null);
      setPlayers([]);
      setCurrentPlayer(null);
      setError(null);
    }
  }, [ws]);

  const kickPlayer = useCallback(
    async (playerId: string) => {
      if (!roomRef.current) {
        throw new Error(ERROR_MESSAGES.NOT_IN_ROOM);
      }

      try {
        setError(null);

        const { error: apiError } = await gameApi.kickPlayer(roomRef.current.gameId, playerId);

        if (apiError) {
          throw new Error(apiError.message || ERROR_MESSAGES.FAILED_TO_KICK_PLAYER);
        }

        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_KICK_PLAYER;
        setError(errorMsg);
        events?.onError?.(errorMsg);
        throw err;
      }
    },
    [events],
  );

  const transferHost = useCallback(
    (newHostId: string) => {
      if (!roomRef.current) {
        return;
      }

      setRoom((prev) => (prev ? { ...prev, hostId: newHostId } : null));

      ws.sendGameAction(roomRef.current.roomCode, GAME_ACTION_TRANSFER_HOST, {
        newHostId,
      });

      events?.onHostChanged?.(newHostId);
    },
    [ws, events],
  );

  const lockRoom = useCallback(
    async (locked: boolean) => {
      if (!roomRef.current) {
        throw new Error(ERROR_MESSAGES.NOT_IN_ROOM);
      }

      try {
        setError(null);

        const { data: updatedGame, error: apiError } = await gameApi.lockGame(
          roomRef.current.gameId,
          locked,
        );

        if (apiError || !updatedGame) {
          throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_LOCK_ROOM);
        }

        setRoom((prev) => (prev ? { ...prev, isLocked: locked } : null));

        events?.onRoomLocked?.(locked);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_LOCK_ROOM;
        setError(errorMsg);
        events?.onError?.(errorMsg);
        throw err;
      }
    },
    [events],
  );

  const isHost = currentPlayer?.is_host ?? false;

  return {
    room,
    players,
    isConnected: ws.isConnected,
    isHost,
    currentPlayer,
    error,
    joinRoom,
    leaveRoom,
    kickPlayer,
    transferHost,
    lockRoom,
    refreshPlayers,
  };
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------

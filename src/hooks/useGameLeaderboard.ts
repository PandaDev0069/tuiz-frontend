// ====================================================
// File Name   : useGameLeaderboard.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-11
// Last Update : 2025-12-30
//
// Description:
// - Manages real-time leaderboard updates, score tracking, and rank changes
// - Handles score animations and final results display
// - Provides WebSocket integration for live leaderboard updates
//
// Notes:
// - Uses WebSocket for real-time updates
// - Supports polling as fallback for leaderboard refresh
// - Handles rank change animations with configurable duration
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useEffect, useCallback, useRef } from 'react';

import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type LeaderboardEntry } from '@/services/gameApi';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const RANK_CHANGE_ANIMATION_DURATION_MS = 3000;
const DEFAULT_AUTO_REFRESH = true;
const DEFAULT_ENABLE_ANIMATIONS = true;

const SOCKET_EVENTS = {
  LEADERBOARD_UPDATE: 'game:leaderboard:update',
  QUESTION_ENDED: 'game:question:ended',
} as const;

const ERROR_MESSAGES = {
  FAILED_TO_FETCH_LEADERBOARD: 'Failed to fetch leaderboard',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface ScoreUpdate {
  playerId: string;
  displayName: string;
  newScore: number;
  pointsAdded: number;
  newRank: number;
  previousRank: number;
  timestamp: Date;
}

export interface RankChange {
  playerId: string;
  displayName: string;
  fromRank: number;
  toRank: number;
  isMovingUp: boolean;
}

export interface GameLeaderboardEvents {
  onScoreUpdate?: (update: ScoreUpdate) => void;
  onRankChange?: (change: RankChange) => void;
  onFinalResults?: (leaderboard: LeaderboardEntry[]) => void;
  onError?: (error: string) => void;
}

export interface UseGameLeaderboardOptions {
  gameId: string;
  playerId?: string;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
  enableAnimations?: boolean;
  events?: GameLeaderboardEvents;
}

export interface UseGameLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  currentPlayerRank: number | null;
  currentPlayerScore: number | null;
  recentScoreUpdates: ScoreUpdate[];
  recentRankChanges: RankChange[];
  loading: boolean;
  error: string | null;
  refreshLeaderboard: () => Promise<void>;
  clearHistory: () => void;
  isConnected: boolean;
  lastUpdateTime: Date | null;
}

interface QuestionEndEvent {
  roomId: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: calculateRankChange
 * Description:
 * - Compares old and new leaderboard entries to detect rank changes
 * - Returns array of rank change objects for players whose rank changed
 *
 * Parameters:
 * - oldLeaderboard (LeaderboardEntry[]): Previous leaderboard state
 * - newLeaderboard (LeaderboardEntry[]): Current leaderboard state
 *
 * Returns:
 * - RankChange[]: Array of rank change objects
 */
function calculateRankChange(
  oldLeaderboard: LeaderboardEntry[],
  newLeaderboard: LeaderboardEntry[],
): RankChange[] {
  const changes: RankChange[] = [];

  newLeaderboard.forEach((newEntry) => {
    const oldEntry = oldLeaderboard.find((e) => e.player_id === newEntry.player_id);

    if (oldEntry && oldEntry.rank !== newEntry.rank) {
      changes.push({
        playerId: newEntry.player_id,
        displayName: newEntry.player_name,
        fromRank: oldEntry.rank,
        toRank: newEntry.rank,
        isMovingUp: newEntry.rank < oldEntry.rank,
      });
    }
  });

  return changes;
}

/**
 * Function: parseLeaderboardData
 * Description:
 * - Parses leaderboard data from API response
 * - Handles both array format and object with entries property
 *
 * Parameters:
 * - data (unknown): Raw data from API response
 *
 * Returns:
 * - LeaderboardEntry[]: Parsed leaderboard entries array
 */
function parseLeaderboardData(data: unknown): LeaderboardEntry[] {
  if (Array.isArray(data)) {
    return data;
  }

  const dataWithEntries = data as { entries?: LeaderboardEntry[] };
  return dataWithEntries?.entries || [];
}

/**
 * Function: processRankChanges
 * Description:
 * - Processes rank changes and emits events
 * - Sets up animation timeout to clear rank changes
 *
 * Parameters:
 * - rankChanges (RankChange[]): Array of rank changes to process
 * - setRecentRankChanges (function): State setter for recent rank changes
 * - events (GameLeaderboardEvents, optional): Event callbacks
 */
function processRankChanges(
  rankChanges: RankChange[],
  setRecentRankChanges: (changes: RankChange[]) => void,
  events?: GameLeaderboardEvents,
): void {
  if (rankChanges.length === 0) return;

  setRecentRankChanges(rankChanges);

  rankChanges.forEach((change) => {
    events?.onRankChange?.(change);
  });

  setTimeout(() => {
    setRecentRankChanges([]);
  }, RANK_CHANGE_ANIMATION_DURATION_MS);
}

/**
 * Hook: useGameLeaderboard
 * Description:
 * - Manages real-time leaderboard updates with WebSocket integration
 * - Provides score tracking, rank change detection, and animations
 * - Supports polling as fallback for leaderboard refresh
 *
 * Parameters:
 * - options (UseGameLeaderboardOptions): Configuration options for the hook
 *
 * Returns:
 * - UseGameLeaderboardReturn: Object containing leaderboard state and actions
 */
export function useGameLeaderboard(options: UseGameLeaderboardOptions): UseGameLeaderboardReturn {
  const {
    gameId,
    playerId,
    autoRefresh = DEFAULT_AUTO_REFRESH,
    refreshIntervalMs,
    enableAnimations = DEFAULT_ENABLE_ANIMATIONS,
    events,
  } = options;
  const { socket, isConnected, isRegistered, joinRoom, leaveRoom } = useSocket();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentScoreUpdates, setRecentScoreUpdates] = useState<ScoreUpdate[]>([]);
  const [recentRankChanges, setRecentRankChanges] = useState<RankChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const listenersSetupRef = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousLeaderboardRef = useRef<LeaderboardEntry[]>([]);
  const refreshLeaderboardRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const currentPlayerRank =
    playerId && leaderboard.length > 0
      ? leaderboard.find((entry) => entry.player_id === playerId)?.rank || null
      : null;

  const currentPlayerScore =
    playerId && leaderboard.length > 0
      ? leaderboard.find((entry) => entry.player_id === playerId)?.score || null
      : null;

  const refreshLeaderboard = useCallback(async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.getLeaderboard(gameId);

      if (apiError || !data) {
        throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_FETCH_LEADERBOARD);
      }

      const leaderboardArray = parseLeaderboardData(data);
      const oldLeaderboard = [...previousLeaderboardRef.current];

      setLeaderboard(leaderboardArray);
      setLastUpdateTime(new Date());
      previousLeaderboardRef.current = leaderboardArray;

      if (enableAnimations && oldLeaderboard.length > 0) {
        const rankChanges = calculateRankChange(oldLeaderboard, leaderboardArray);
        if (rankChanges.length > 0) {
          processRankChanges(rankChanges, setRecentRankChanges, events);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_FETCH_LEADERBOARD;
      setError(errorMessage);
      events?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, enableAnimations, events]);

  useEffect(() => {
    refreshLeaderboardRef.current = refreshLeaderboard;
  }, [refreshLeaderboard]);

  const clearHistory = useCallback(() => {
    setRecentScoreUpdates([]);
    setRecentRankChanges([]);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected || !isRegistered || !gameId) return;
    if (listenersSetupRef.current) return;

    listenersSetupRef.current = true;
    joinRoom(gameId);

    const handleLeaderboardUpdate = () => {
      refreshLeaderboardRef.current?.();
      setLastUpdateTime(new Date());
    };

    const handleQuestionEnd = (data: QuestionEndEvent) => {
      if (data.roomId !== gameId) return;

      if (autoRefresh) {
        refreshLeaderboardRef.current?.();
      }
    };

    socket.on(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
    socket.on(SOCKET_EVENTS.QUESTION_ENDED, handleQuestionEnd);

    return () => {
      socket.off(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
      socket.off(SOCKET_EVENTS.QUESTION_ENDED, handleQuestionEnd);
      leaveRoom(gameId);
      listenersSetupRef.current = false;
    };
  }, [socket, isConnected, isRegistered, gameId, autoRefresh, joinRoom, leaveRoom]);

  useEffect(() => {
    if (!refreshIntervalMs || refreshIntervalMs <= 0) return;

    refreshIntervalRef.current = setInterval(() => {
      refreshLeaderboardRef.current?.();
    }, refreshIntervalMs);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshIntervalMs]);

  useEffect(() => {
    if (gameId) {
      refreshLeaderboardRef.current?.();
    }
  }, [gameId]);

  return {
    leaderboard,
    currentPlayerRank,
    currentPlayerScore,
    recentScoreUpdates,
    recentRankChanges,
    loading,
    error,
    refreshLeaderboard,
    clearHistory,
    isConnected,
    lastUpdateTime,
  };
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------

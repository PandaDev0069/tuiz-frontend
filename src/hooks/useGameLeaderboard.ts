/**
 * useGameLeaderboard Hook
 * Manages real-time leaderboard updates, score tracking, and rank changes
 * Handles score animations and final results display
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type LeaderboardEntry } from '@/services/gameApi';

// ============================================================================
// TYPES
// ============================================================================

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
  playerId?: string; // Optional - to highlight current player
  autoRefresh?: boolean; // Auto-refresh after each question
  refreshIntervalMs?: number; // Polling interval for real-time updates
  enableAnimations?: boolean; // Enable rank change animations
  events?: GameLeaderboardEvents;
}

export interface UseGameLeaderboardReturn {
  // State
  leaderboard: LeaderboardEntry[];
  currentPlayerRank: number | null;
  currentPlayerScore: number | null;
  recentScoreUpdates: ScoreUpdate[];
  recentRankChanges: RankChange[];
  loading: boolean;
  error: string | null;

  // Actions
  refreshLeaderboard: () => Promise<void>;
  clearHistory: () => void;

  // Real-time status
  isConnected: boolean;
  lastUpdateTime: Date | null;
}

interface QuestionEndEvent {
  roomId: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
        displayName: newEntry.display_name,
        fromRank: oldEntry.rank,
        toRank: newEntry.rank,
        isMovingUp: newEntry.rank < oldEntry.rank, // Lower rank number = higher position
      });
    }
  });

  return changes;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGameLeaderboard(options: UseGameLeaderboardOptions): UseGameLeaderboardReturn {
  const {
    gameId,
    playerId,
    autoRefresh = true,
    refreshIntervalMs,
    enableAnimations = true,
    events,
  } = options;
  const { socket, isConnected } = useSocket();

  // State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentScoreUpdates, setRecentScoreUpdates] = useState<ScoreUpdate[]>([]);
  const [recentRankChanges, setRecentRankChanges] = useState<RankChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Refs
  const listenersSetupRef = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousLeaderboardRef = useRef<LeaderboardEntry[]>([]);

  // Derived state
  const currentPlayerRank =
    playerId && leaderboard.length > 0
      ? leaderboard.find((entry) => entry.player_id === playerId)?.rank || null
      : null;

  const currentPlayerScore =
    playerId && leaderboard.length > 0
      ? leaderboard.find((entry) => entry.player_id === playerId)?.score || null
      : null;

  // ========================================================================
  // REST API OPERATIONS
  // ========================================================================

  /**
   * Refresh leaderboard from API
   */
  const refreshLeaderboard = useCallback(async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.getLeaderboard(gameId);

      if (apiError || !data) {
        throw new Error(apiError?.message || 'Failed to fetch leaderboard');
      }

      // Store previous leaderboard for rank change detection
      const oldLeaderboard = [...leaderboard];
      previousLeaderboardRef.current = oldLeaderboard;

      // Update leaderboard
      setLeaderboard(data);
      setLastUpdateTime(new Date());

      // Detect and emit rank changes if animations enabled
      if (enableAnimations && oldLeaderboard.length > 0) {
        const rankChanges = calculateRankChange(oldLeaderboard, data);

        if (rankChanges.length > 0) {
          setRecentRankChanges(rankChanges);

          // Emit events for each rank change
          rankChanges.forEach((change) => {
            events?.onRankChange?.(change);
          });

          // Clear rank changes after animation duration (3 seconds)
          setTimeout(() => {
            setRecentRankChanges([]);
          }, 3000);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('useGameLeaderboard: refreshLeaderboard error', err);
      events?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, leaderboard, enableAnimations, events]);

  /**
   * Clear score update and rank change history
   */
  const clearHistory = useCallback(() => {
    setRecentScoreUpdates([]);
    setRecentRankChanges([]);
  }, []);

  // ========================================================================
  // WEBSOCKET EVENT HANDLERS
  // ========================================================================

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;
    if (listenersSetupRef.current) return;

    console.log(`useGameLeaderboard: Setting up WebSocket listeners for game ${gameId}`);
    listenersSetupRef.current = true;

    // Join game room
    socket.emit('room:join', { roomId: gameId });

    /**
     * Leaderboard update event - trigger refresh to fetch full data
     */
    const handleLeaderboardUpdate = () => {
      console.log('useGameLeaderboard: Leaderboard update received');
      refreshLeaderboard();
      setLastUpdateTime(new Date());
    };

    /**
     * Question end - refresh leaderboard if auto-refresh enabled
     */
    const handleQuestionEnd = (data: QuestionEndEvent) => {
      if (data.roomId !== gameId) return;

      console.log('useGameLeaderboard: Question ended, refreshing leaderboard');

      if (autoRefresh) {
        refreshLeaderboard();
      }
    };

    // Register listeners
    socket.on('game:leaderboard:update', handleLeaderboardUpdate);
    socket.on('game:question:ended', handleQuestionEnd);

    return () => {
      console.log(`useGameLeaderboard: Cleaning up listeners for game ${gameId}`);

      socket.off('game:leaderboard:update', handleLeaderboardUpdate);
      socket.off('game:question:ended', handleQuestionEnd);

      socket.emit('room:leave', { roomId: gameId });

      listenersSetupRef.current = false;
    };
  }, [socket, isConnected, gameId, autoRefresh, refreshLeaderboard]);

  // ========================================================================
  // POLLING (if interval specified)
  // ========================================================================

  useEffect(() => {
    if (!refreshIntervalMs || refreshIntervalMs <= 0) return;

    console.log(`useGameLeaderboard: Setting up polling every ${refreshIntervalMs}ms`);

    refreshIntervalRef.current = setInterval(() => {
      refreshLeaderboard();
    }, refreshIntervalMs);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshIntervalMs, refreshLeaderboard]);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Initial leaderboard fetch
   */
  useEffect(() => {
    if (gameId) {
      refreshLeaderboard();
    }
  }, [gameId, refreshLeaderboard]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // State
    leaderboard,
    currentPlayerRank,
    currentPlayerScore,
    recentScoreUpdates,
    recentRankChanges,
    loading,
    error,

    // Actions
    refreshLeaderboard,
    clearHistory,

    // Real-time status
    isConnected,
    lastUpdateTime,
  };
}

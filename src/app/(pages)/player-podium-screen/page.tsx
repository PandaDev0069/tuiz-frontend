'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayerPodiumScreen } from '@/components/game';
import { LeaderboardEntry } from '@/types/game';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { gameApi } from '@/services/gameApi';

function PlayerPodiumScreenContent() {
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);

  // Get gameId from room code if not provided
  useEffect(() => {
    if (gameId || !roomCode) return;

    const getGameIdFromCode = async () => {
      try {
        const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
        if (storedGameId) {
          setGameId(storedGameId);
          return;
        }

        const { data: game, error } = await gameApi.getGameByCode(roomCode);
        if (error || !game) {
          console.error('Failed to get game by code:', error);
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch (err) {
        console.error('Failed to get game ID:', err);
      }
    };

    getGameIdFromCode();
  }, [roomCode, gameId]);

  const { leaderboard, loading } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: false, // Don't auto-refresh for final results
  });

  // Transform backend LeaderboardEntry to frontend LeaderboardEntry
  const finalEntries: LeaderboardEntry[] = useMemo(() => {
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return [];
    }

    // Store previous ranks for comparison (simplified - in real app, you'd track this)
    const previousRanks = new Map<string, number>();

    return leaderboard.map((entry) => {
      const previousRank = previousRanks.get(entry.player_id) || entry.rank;
      previousRanks.set(entry.player_id, entry.rank);

      let rankChange: 'up' | 'down' | 'same' = 'same';
      if (previousRank && previousRank !== entry.rank) {
        rankChange = entry.rank < previousRank ? 'up' : 'down';
      }

      return {
        playerId: entry.player_id,
        playerName: entry.player_name,
        score: entry.score,
        rank: entry.rank,
        previousRank: previousRank !== entry.rank ? previousRank : undefined,
        rankChange,
      };
    });
  }, [leaderboard]);

  if (!gameId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-white text-xl mb-4">最終結果を読み込み中...</div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (finalEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-gray-600 text-xl">リーダーボードデータがありません。</div>
      </div>
    );
  }

  return <PlayerPodiumScreen entries={finalEntries} />;
}

export default function PlayerPodiumScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerPodiumScreenContent />
    </Suspense>
  );
}

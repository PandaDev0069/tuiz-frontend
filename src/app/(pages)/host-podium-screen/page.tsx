// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-29
// Last Update : 2025-12-29
//
// Description:
// - Host podium screen component
// - Displays final game results and winner podium
// - Shows top players with rankings
//
// Notes:
// - Uses game leaderboard hook for final results
// - Transforms backend data to frontend format
// - No auto-refresh for final results
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { HostPodiumScreen } from '@/components/game';

//----------------------------------------------------
// 3. Hook Imports
//----------------------------------------------------
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';

//----------------------------------------------------
// 4. Service Imports
//----------------------------------------------------
import { gameApi } from '@/services/gameApi';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { LeaderboardEntry } from '@/types/game';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Main Component
//----------------------------------------------------
/**
 * Component: HostPodiumScreenContent
 * Description:
 * - Displays final game results and winner podium
 * - Shows top players with rankings
 */
function HostPodiumScreenContent() {
  //----------------------------------------------------
  // 7.1. URL Parameters & Setup
  //----------------------------------------------------
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);

  //----------------------------------------------------
  // 7.2. Game Flow & State
  //----------------------------------------------------
  const { leaderboard, loading } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: false,
  });

  //----------------------------------------------------
  // 7.3. Effects
  //----------------------------------------------------
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
          toast.error('ゲーム情報の取得に失敗しました');
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch {
        toast.error('ゲームIDの取得に失敗しました');
      }
    };

    getGameIdFromCode();
  }, [roomCode, gameId]);

  //----------------------------------------------------
  // 7.4. Computed Values
  //----------------------------------------------------
  const entries: LeaderboardEntry[] = useMemo(() => {
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return [];
    }

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

  //----------------------------------------------------
  // 7.5. Main Render
  //----------------------------------------------------
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

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-gray-600 text-xl">リーダーボードデータがありません。</div>
      </div>
    );
  }

  return <HostPodiumScreen entries={entries} />;
}

//----------------------------------------------------
// 8. Page Wrapper Component
//----------------------------------------------------
export default function HostPodiumScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostPodiumScreenContent />
    </Suspense>
  );
}

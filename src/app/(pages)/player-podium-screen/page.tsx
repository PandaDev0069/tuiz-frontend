'use client';

import React, { Suspense } from 'react';
import { PlayerPodiumScreen } from '@/components/game';
import { LeaderboardEntry } from '@/types/game';

function PlayerPodiumScreenContent() {
  // Mock final leaderboard data - will be replaced with real data
  const finalEntries: LeaderboardEntry[] = [
    {
      playerId: '1',
      playerName: 'ゆき',
      score: 950,
      rank: 1,
      previousRank: 2,
      rankChange: 'up' as const,
    },
    {
      playerId: '2',
      playerName: 'タクミ',
      score: 920,
      rank: 2,
      previousRank: 1,
      rankChange: 'down' as const,
    },
    {
      playerId: '3',
      playerName: 'ハルカ',
      score: 890,
      rank: 3,
      previousRank: 3,
      rankChange: 'same' as const,
    },
    {
      playerId: '4',
      playerName: 'リョウ',
      score: 850,
      rank: 4,
      previousRank: 5,
      rankChange: 'up' as const,
    },
    {
      playerId: '5',
      playerName: 'ミナ',
      score: 820,
      rank: 5,
      previousRank: 4,
      rankChange: 'down' as const,
    },
    {
      playerId: '6',
      playerName: 'ケンタ',
      score: 780,
      rank: 6,
      previousRank: 6,
      rankChange: 'same' as const,
    },
    {
      playerId: '7',
      playerName: 'サキ',
      score: 750,
      rank: 7,
      previousRank: 8,
      rankChange: 'up' as const,
    },
    {
      playerId: '8',
      playerName: 'ダイ',
      score: 720,
      rank: 8,
      previousRank: 7,
      rankChange: 'down' as const,
    },
  ];

  return <PlayerPodiumScreen entries={finalEntries} />;
}

export default function PlayerPodiumScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerPodiumScreenContent />
    </Suspense>
  );
}

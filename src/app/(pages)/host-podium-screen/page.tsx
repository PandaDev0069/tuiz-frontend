'use client';

import React, { Suspense } from 'react';
import { HostPodiumScreen } from '@/components/game';

function HostPodiumScreenContent() {
  // Mock entries data for podium display
  const entries = [
    {
      playerId: '1',
      playerName: 'Player_001',
      score: 850,
      rank: 1,
      previousRank: 1,
      rankChange: 'same' as const,
    },
    {
      playerId: '2',
      playerName: 'Player_002',
      score: 720,
      rank: 2,
      previousRank: 3,
      rankChange: 'up' as const,
    },
    {
      playerId: '3',
      playerName: 'Player_003',
      score: 680,
      rank: 3,
      previousRank: 2,
      rankChange: 'down' as const,
    },
    {
      playerId: '4',
      playerName: 'Player_004',
      score: 540,
      rank: 4,
      previousRank: 4,
      rankChange: 'same' as const,
    },
    {
      playerId: '5',
      playerName: 'Player_005',
      score: 430,
      rank: 5,
      previousRank: 5,
      rankChange: 'same' as const,
    },
    {
      playerId: '6',
      playerName: 'Player_006',
      score: 380,
      rank: 6,
      previousRank: 6,
      rankChange: 'same' as const,
    },
    {
      playerId: '7',
      playerName: 'Player_007',
      score: 320,
      rank: 7,
      previousRank: 7,
      rankChange: 'same' as const,
    },
    {
      playerId: '8',
      playerName: 'Player_008',
      score: 290,
      rank: 8,
      previousRank: 8,
      rankChange: 'same' as const,
    },
  ];

  return <HostPodiumScreen entries={entries} />;
}

export default function HostPodiumScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostPodiumScreenContent />
    </Suspense>
  );
}

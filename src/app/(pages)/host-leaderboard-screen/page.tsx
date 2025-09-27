'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HostLeaderboardScreen } from '@/components/game';
import { LeaderboardData } from '@/types/game';

function HostLeaderboardScreenContent() {
  const router = useRouter();

  // Mock leaderboard data - will be replaced with real data
  const leaderboardData: LeaderboardData = {
    entries: [
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
        previousRank: 2,
        rankChange: 'down' as const,
      },
      {
        playerId: '5',
        playerName: 'Player_005',
        score: 430,
        rank: 5,
        previousRank: 5,
        rankChange: 'same' as const,
      },
    ],
    questionNumber: 2,
    totalQuestions: 30,
    timeRemaining: 10,
    timeLimit: 10,
  };

  const handleTimeExpired = () => {
    router.push('/host-explanation-screen');
  };

  return (
    <HostLeaderboardScreen leaderboardData={leaderboardData} onTimeExpired={handleTimeExpired} />
  );
}

export default function HostLeaderboardScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostLeaderboardScreenContent />
    </Suspense>
  );
}

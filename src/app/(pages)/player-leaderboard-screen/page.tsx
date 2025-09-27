'use client';

import React, { Suspense } from 'react';
import { PlayerLeaderboardScreen } from '@/components/game';
import { LeaderboardData } from '@/types/game';

function PlayerLeaderboardScreenContent() {
  const leaderboardData: LeaderboardData = {
    entries: [
      { playerId: '11', playerName: 'ゆき', score: 640, rank: 1, rankChange: 'up' },
      { playerId: '12', playerName: 'タクミ', score: 610, rank: 2, rankChange: 'same' },
      { playerId: '13', playerName: 'ハルカ', score: 580, rank: 3, rankChange: 'up' },
      { playerId: '14', playerName: 'リョウ', score: 560, rank: 4, rankChange: 'down' },
      { playerId: '15', playerName: 'ミナ', score: 540, rank: 5, rankChange: 'same' },
    ],
    questionNumber: 2,
    totalQuestions: 30,
    timeRemaining: 8,
    timeLimit: 8,
  };

  const handleTimeExpired = () => {
    console.log('Player leaderboard time expired');
  };

  return (
    <PlayerLeaderboardScreen leaderboardData={leaderboardData} onTimeExpired={handleTimeExpired} />
  );
}

export default function PlayerLeaderboardScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerLeaderboardScreenContent />
    </Suspense>
  );
}

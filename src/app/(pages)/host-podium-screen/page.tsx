// 'use client';

// import React, { Suspense } from 'react';
// import { HostPodiumScreen } from '@/components/game';
// import { LeaderboardData } from '@/types/game';

// function HostPodiumScreenContent() {
//   // Mock LeaderboardData
//   const leaderboardData: LeaderboardData = {
//     entries: [
//       {
//         playerId: '1',
//         playerName: 'Player_001',
//         score: 850,
//         rank: 1,
//         previousRank: 1,
//         rankChange: 'same' as const,
//       },
//       {
//         playerId: '2',
//         playerName: 'Player_002',
//         score: 720,
//         rank: 2,
//         previousRank: 3,
//         rankChange: 'up' as const,
//       },
//       {
//         playerId: '3',
//         playerName: 'Player_003',
//         score: 680,
//         rank: 3,
//         previousRank: 2,
//         rankChange: 'down' as const,
//       },
//       {
//         playerId: '4',
//         playerName: 'Player_004',
//         score: 540,
//         rank: 4,
//         previousRank: 2,
//         rankChange: 'down' as const,
//       },
//       {
//         playerId: '5',
//         playerName: 'Player_005',
//         score: 430,
//         rank: 5,
//         previousRank: 5,
//         rankChange: 'same' as const,
//       },
//     ],
//     questionNumber: 2,
//     totalQuestions: 30,
//     timeRemaining: 10,
//     timeLimit: 10,
//   };

//   return <HostPodiumScreen leaderboardData={leaderboardData} />;
// }

// export default function HostPodiumScreenPage() {
//   return (
//     <Suspense fallback={<div> Loading...</div>}>
//       <HostPodiumScreenContent />
//     </Suspense>
//   );
// }

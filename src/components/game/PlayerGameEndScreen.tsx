// ====================================================
// File Name   : PlayerGameEndScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-25
// Last Update : 2025-12-25
//
// Description:
// - Displays the game end screen for players showing final results
// - Shows player's rank, score, and top 3 leaderboard
// - Provides action buttons to join a new game or return home
// - Displays congratulatory message and game completion status
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js router for default navigation
// - Handles optional callbacks for custom navigation behavior
// ====================================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Home, LogIn } from 'lucide-react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';

import type { LeaderboardEntry } from '@/types/game';

const DEFAULT_ROUTE = '/';
const JOIN_ROUTE = '/join';
const TOP_LEADERBOARD_COUNT = 3;
const RANK_OFFSET = 1;
const DEFAULT_SCORE = 0;
const DEFAULT_PLAYER_NAME = 'プレイヤー';

const RANK_FIRST = 1;
const RANK_SECOND = 2;
const RANK_THIRD = 3;

interface PlayerGameEndScreenProps {
  playerEntry?: LeaderboardEntry;
  entries: LeaderboardEntry[];
  onReturnHome?: () => void;
  onJoinNewGame?: () => void;
}

/**
 * Component: PlayerGameEndScreen
 * Description:
 * - Renders the game end screen for players after a quiz game completes
 * - Displays player's final rank and score in a result card
 * - Shows top 3 leaderboard entries
 * - Provides action buttons for joining a new game or returning home
 *
 * @param {LeaderboardEntry} [playerEntry] - The current player's leaderboard entry
 * @param {LeaderboardEntry[]} entries - All leaderboard entries for the game
 * @param {() => void} [onReturnHome] - Optional callback for returning home (defaults to navigating to '/')
 * @param {() => void} [onJoinNewGame] - Optional callback for joining a new game (defaults to navigating to '/')
 * @returns {React.ReactElement} The game end screen component
 *
 * @example
 * ```tsx
 * <PlayerGameEndScreen
 *   playerEntry={{
 *     playerId: 'player-1',
 *     playerName: 'Player 1',
 *     score: 1000,
 *     rank: 1
 *   }}
 *   entries={leaderboardEntries}
 *   onReturnHome={() => router.push('/dashboard')}
 *   onJoinNewGame={() => router.push('/join')}
 * />
 * ```
 */
export const PlayerGameEndScreen: React.FC<PlayerGameEndScreenProps> = ({
  playerEntry,
  entries,
  onReturnHome,
  onJoinNewGame,
}) => {
  const router = useRouter();

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      router.push(DEFAULT_ROUTE);
    }
  };

  const handleJoinNewGame = () => {
    if (onJoinNewGame) {
      onJoinNewGame();
    } else {
      router.push(JOIN_ROUTE);
    }
  };

  const playerRank =
    playerEntry?.rank ||
    entries.findIndex((e) => e.playerId === playerEntry?.playerId) + RANK_OFFSET ||
    0;
  const playerScore = playerEntry?.score || DEFAULT_SCORE;
  const playerName = playerEntry?.playerName || DEFAULT_PLAYER_NAME;

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center">
              <div className="relative inline-block">
                <span className="text-4xl md:text-6xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  ゲーム終了
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg mt-4"></div>
              <p className="mt-6 text-xl text-gray-200">ありがとうございました！</p>
            </div>

            {playerEntry && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Trophy className={`w-12 h-12 ${getTrophyColor(playerRank)}`} />
                    <div>
                      <div className="text-2xl font-bold text-white">{playerName}</div>
                      <div className="text-sm text-gray-300">最終順位</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-8">
                      <div>
                        <div className="text-5xl font-bold text-white">{playerRank}</div>
                        <div className="text-sm text-gray-300">位</div>
                      </div>
                      <div className="w-px h-16 bg-white/20"></div>
                      <div>
                        <div className="text-5xl font-bold text-cyan-400">
                          {playerScore.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300">ポイント</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {entries.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 text-center">トップ3</h3>
                <div className="space-y-3">
                  {entries.slice(0, TOP_LEADERBOARD_COUNT).map((entry, index) => (
                    <div
                      key={entry.playerId}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        entry.playerId === playerEntry?.playerId
                          ? 'bg-cyan-500/20 border-cyan-400/50'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getRankBadgeColor(index)}`}
                        >
                          {entry.rank}
                        </div>
                        <span className="text-white font-medium">{entry.playerName}</span>
                      </div>
                      <span className="text-white font-bold tabular-nums">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinNewGame}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <LogIn className="w-5 h-5" />
                <span>新しいゲームに参加</span>
              </button>
              <button
                onClick={handleReturnHome}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};

/**
 * Gets the Tailwind CSS color class for the trophy icon based on player rank.
 *
 * @param {number} rank - Player's rank
 * @returns {string} Tailwind CSS color class
 */
function getTrophyColor(rank: number): string {
  if (rank === RANK_FIRST) return 'text-yellow-400';
  if (rank === RANK_SECOND) return 'text-gray-300';
  if (rank === RANK_THIRD) return 'text-orange-400';
  return 'text-blue-400';
}

/**
 * Gets the Tailwind CSS gradient classes for rank badge based on index position.
 *
 * @param {number} index - Index position in the leaderboard (0 = first, 1 = second, 2 = third)
 * @returns {string} Tailwind CSS gradient classes
 */
function getRankBadgeColor(index: number): string {
  if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
  if (index === 1) return 'bg-gradient-to-r from-gray-400 to-gray-600';
  return 'bg-gradient-to-r from-amber-500 to-amber-700';
}

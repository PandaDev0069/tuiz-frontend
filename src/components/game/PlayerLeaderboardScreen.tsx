// ====================================================
// File Name   : PlayerLeaderboardScreen.tsx
// Project     : TUIZ
// Author      : TUIZ Team
// Created     : 2025-09-27
// Last Update : 2025-12-30
//
// Description:
// - Displays the real-time leaderboard screen for players during the game
// - Shows top 5 players with rank changes, scores, and visual indicators
// - Implements countdown timer that triggers callback when expired
// - Displays question counter and time bar
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses internal timer for countdown synchronization
// - Handles timeout navigation separately to avoid race conditions
// ====================================================

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';

import type { LeaderboardData, LeaderboardEntry, RankChange } from '@/types/game';

const TIMER_INTERVAL_MS = 1000;
const NAVIGATION_DELAY_MS = 0;
const TIME_EXPIRED_THRESHOLD = 1;
const TOP_LEADERBOARD_COUNT = 5;

const DEFAULT_RANK_CHANGE_ICON_SIZE = 16;
const DEFAULT_RANK_ICON_SIZE = 24;
const RANK_ICON_SIZE_SMALL = 18;
const RANK_CHANGE_ICON_SIZE_SMALL = 14;

const RANK_FIRST = 1;
const RANK_SECOND = 2;
const RANK_THIRD = 3;
const RANK_FOURTH = 4;
const RANK_FIFTH = 5;

interface PlayerLeaderboardScreenProps {
  leaderboardData: LeaderboardData;
  onTimeExpired?: () => void;
}

interface PlayerLeaderboardItemProps {
  entry: LeaderboardEntry;
}

/**
 * Component: PlayerLeaderboardScreen
 * Description:
 * - Renders the leaderboard screen for players during the game
 * - Displays top 5 players with rank changes, scores, and visual indicators
 * - Shows countdown timer and question counter
 * - Automatically triggers callback when time expires
 *
 * @param {LeaderboardData} leaderboardData - Leaderboard data including entries, question number, time limit
 * @param {() => void} [onTimeExpired] - Callback invoked when the leaderboard time limit expires
 * @returns {React.ReactElement} The leaderboard screen component
 *
 * @example
 * ```tsx
 * <PlayerLeaderboardScreen
 *   leaderboardData={{
 *     entries: leaderboardEntries,
 *     questionNumber: 1,
 *     totalQuestions: 10,
 *     timeLimit: 30
 *   }}
 *   onTimeExpired={() => console.log('Time expired')}
 * />
 * ```
 */
export const PlayerLeaderboardScreen: React.FC<PlayerLeaderboardScreenProps> = ({
  leaderboardData,
  onTimeExpired,
}) => {
  const { entries, questionNumber, totalQuestions, timeLimit } = leaderboardData;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const timeoutTriggered = useRef(false);

  useEffect(() => {
    timeoutTriggered.current = false;
    setCurrentTime(timeLimit);
    setIsTimeExpired(false);
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= TIME_EXPIRED_THRESHOLD) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
            setIsTimeExpired(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [timeLimit]);

  useEffect(() => {
    if (isTimeExpired) {
      const timeoutId = setTimeout(() => {
        onTimeExpired?.();
      }, NAVIGATION_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [isTimeExpired, onTimeExpired]);

  return (
    <PageContainer className="h-screen">
      <Main className="relative h-full">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 flex h-full flex-col pt-24 pb-6">
          <div className="px-5">
            <div className="text-center text-white/90">
              <span className="text-4xl font-bold tracking-[0.25em] text-transparent drop-shadow-sm md:text-5xl bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 bg-clip-text">
                ランキング
              </span>
            </div>
          </div>

          <div className="flex-1 px-4 py-4">
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
              <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3 pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {entries && entries.length > 0 ? (
                  entries
                    .slice(0, TOP_LEADERBOARD_COUNT)
                    .map((entry) => <PlayerLeaderboardItem key={entry.playerId} entry={entry} />)
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-xl text-white/70 mb-2">リーダーボードデータがありません</p>
                      <p className="text-sm text-white/50">ランキングデータを読み込み中...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full shadow-lg"></div>
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-2xl md:text-3xl text-white/80 font-medium">上位5名</p>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};

/**
 * Component: PlayerLeaderboardItem
 * Description:
 * - Renders a single leaderboard entry item with rank, name, score, and visual indicators
 * - Displays rank change icons and special rank icons for top 3
 * - Shows score changes and previous rank information
 *
 * @param {LeaderboardEntry} entry - The leaderboard entry to display
 * @returns {React.ReactElement} The leaderboard item component
 */
const PlayerLeaderboardItem: React.FC<PlayerLeaderboardItemProps> = ({ entry }) => {
  const rankGradient = getRankGradient(entry.rank);
  const rankIcon = getRankIcon(entry.rank, RANK_ICON_SIZE_SMALL);

  return (
    <div
      className={`relative rounded-2xl border px-4 py-4 text-white shadow-md backdrop-blur-sm ${rankGradient}`}
    >
      <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow">
        {getRankChangeIcon(entry.rankChange, RANK_CHANGE_ICON_SIZE_SMALL)}
      </div>

      {rankIcon && (
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
          {rankIcon}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base font-semibold">
            {entry.rank}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide md:text-base">
              {entry.playerName}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="block text-lg font-bold tracking-tight md:text-xl">{entry.score}</span>
            {entry.scoreChange && entry.scoreChange > 0 && (
              <span className="text-sm font-bold text-emerald-300 animate-pulse">
                +{entry.scoreChange}
              </span>
            )}
          </div>
          <span className="text-[11px] text-white/70">ポイント</span>
          {entry.previousRank !== undefined &&
            entry.previousRank !== entry.rank &&
            entry.rankChange && (
              <div className="text-[10px] text-white/60 mt-0.5">
                {entry.rankChange === 'up' && `↑ ${entry.previousRank}位`}
                {entry.rankChange === 'down' && `↓ ${entry.previousRank}位`}
              </div>
            )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white/25"></div>
      <div className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white/25"></div>
    </div>
  );
};

/**
 * Gets the rank change icon component based on the rank change direction.
 *
 * @param {RankChange} rankChange - The direction of rank change ('up', 'down', or 'same')
 * @param {number} [size] - Icon size in pixels (default: 16)
 * @returns {React.ReactElement} The rank change icon component
 */
function getRankChangeIcon(rankChange: RankChange, size: number = DEFAULT_RANK_CHANGE_ICON_SIZE) {
  switch (rankChange) {
    case 'up':
      return <TrendingUp size={size} className="text-emerald-400" />;
    case 'down':
      return <TrendingDown size={size} className="text-rose-400" />;
    case 'same':
    default:
      return <Minus size={size} className="text-slate-400" />;
  }
}

/**
 * Gets the rank icon component for top 3 ranks.
 *
 * @param {number} rank - Player's rank
 * @param {number} [size] - Icon size in pixels (default: 24)
 * @returns {React.ReactElement | null} The rank icon component or null if rank is not top 3
 */
function getRankIcon(
  rank: number,
  size: number = DEFAULT_RANK_ICON_SIZE,
): React.ReactElement | null {
  switch (rank) {
    case RANK_FIRST:
      return <Trophy size={size} className="text-yellow-300" />;
    case RANK_SECOND:
      return <Medal size={size} className="text-slate-200" />;
    case RANK_THIRD:
      return <Award size={size} className="text-amber-500" />;
    default:
      return null;
  }
}

/**
 * Gets the Tailwind CSS gradient classes for rank badge based on rank position.
 *
 * @param {number} rank - Player's rank
 * @returns {string} Tailwind CSS gradient and border classes
 */
function getRankGradient(rank: number): string {
  switch (rank) {
    case RANK_FIRST:
      return 'bg-gradient-to-r from-yellow-400/70 to-yellow-500/70 border-yellow-300/60';
    case RANK_SECOND:
      return 'bg-gradient-to-r from-slate-300/60 to-slate-400/60 border-slate-200/40';
    case RANK_THIRD:
      return 'bg-gradient-to-r from-amber-500/60 to-amber-600/60 border-amber-400/40';
    case RANK_FOURTH:
      return 'bg-gradient-to-r from-blue-400/40 to-blue-500/40 border-blue-300/30';
    case RANK_FIFTH:
      return 'bg-gradient-to-r from-purple-400/40 to-purple-500/40 border-purple-300/30';
    default:
      return 'bg-white/10 border-white/10';
  }
}

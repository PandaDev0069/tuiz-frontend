// ====================================================
// File Name   : HostLeaderboardScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-27
// Last Update : 2025-12-25
//
// Description:
// - Host screen component for displaying leaderboard rankings
// - Shows top 5 players with animated score counters
// - Displays rank changes and special icons for top 3
// - Manages timer countdown and automatic navigation
//
// Notes:
// - Uses staggered animations for entry effects
// - Animates score counters with easing functions
// - Supports manual navigation via next button
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import type { LeaderboardData, LeaderboardEntry, RankChange } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const ANIMATION_START_DELAY_MS = 300;
const TIMER_INTERVAL_MS = 1000;
const NAVIGATION_DELAY_MS = 0;
const TIME_EXPIRED_THRESHOLD = 1;

const ENTRY_ANIMATION_DELAY_MS = 200;
const SCORE_ANIMATION_DELAY_MS = 300;
const SCORE_ANIMATION_DURATION_MS = 1500;
const EASING_POWER = 3;

const TOP_RANK_THRESHOLD = 5;
const TOP_DISPLAY_COUNT = 5;

const RANK_ICON_SIZE = 20;
const RANK_ICON_SIZE_LARGE = 32;
const RANK_CHANGE_ICON_SIZE = 14;

const RANK_COLORS = {
  FIRST: 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-300',
  SECOND: 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-200',
  THIRD: 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400',
  FOURTH: 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300',
  FIFTH: 'bg-gradient-to-r from-purple-400 to-purple-500 border-purple-300',
  DEFAULT: 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface HostLeaderboardScreenProps {
  leaderboardData: LeaderboardData;
  onTimeExpired?: () => void;
  onNext?: () => void;
}

interface LeaderboardEntryComponentProps {
  entry: LeaderboardEntry;
  index: number;
  shouldAnimate: boolean;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: HostLeaderboardScreen
 * Description:
 * - Displays leaderboard screen for host with top 5 players
 * - Shows animated score counters and rank changes
 * - Displays special icons for top 3 players
 * - Manages timer countdown and automatic navigation
 *
 * Parameters:
 * - leaderboardData (LeaderboardData): Leaderboard data with entries and timing
 * - onTimeExpired (function, optional): Callback when timer expires
 * - onNext (function, optional): Callback for manual next action
 *
 * Returns:
 * - JSX.Element: Host leaderboard screen component
 */
export const HostLeaderboardScreen: React.FC<HostLeaderboardScreenProps> = ({
  leaderboardData,
  onTimeExpired,
  onNext,
}) => {
  const { entries, questionNumber, totalQuestions, timeLimit } = leaderboardData;

  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const timeoutTriggered = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, ANIMATION_START_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    timeoutTriggered.current = false;
    setCurrentTime(timeLimit);
    setIsTimeExpired(false);
  }, [timeLimit, questionNumber]);

  useEffect(() => {
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
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 h-full flex flex-col pt-16">
          <div className="px-6 py-3 text-center">
            <div
              className={`transition-all duration-1000 transform ${
                isAnimationStarted
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <div className="relative">
                <span className="text-6xl md:text-8xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  ランキング
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg"></div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 md:px-8 py-2 min-h-0 overflow-hidden">
            <div className="w-full max-w-4xl h-full flex flex-col">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl overflow-hidden">
                <div
                  className={`px-2 ${
                    isAnimationStarted
                      ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
                      : 'overflow-hidden max-h-[32rem]'
                  }`}
                >
                  <div className="space-y-3 md:space-y-4 pt-2">
                    {entries.slice(0, TOP_DISPLAY_COUNT).map((entry, index) => (
                      <LeaderboardEntryComponent
                        key={entry.playerId}
                        entry={entry}
                        index={index}
                        shouldAnimate={isAnimationStarted}
                      />
                    ))}
                  </div>
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

          {onNext && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={onNext}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                次へ
              </button>
            </div>
          )}

          <div className="h-4"></div>
        </div>
      </Main>
    </PageContainer>
  );
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: getRankChangeIcon
 * Description:
 * - Returns appropriate icon component for rank change indicator
 * - Shows trending up/down or minus icon based on rank change
 *
 * Parameters:
 * - rankChange (RankChange): Type of rank change (up, down, same)
 * - size (number, optional): Size of the icon (default: 20)
 *
 * Returns:
 * - React.ReactElement: Icon component for rank change
 */
function getRankChangeIcon(
  rankChange: RankChange,
  size: number = RANK_ICON_SIZE,
): React.ReactElement {
  switch (rankChange) {
    case 'up':
      return <TrendingUp size={size} className="text-green-400" />;
    case 'down':
      return <TrendingDown size={size} className="text-red-400" />;
    case 'same':
    default:
      return <Minus size={size} className="text-gray-400" />;
  }
}

/**
 * Function: getRankIcon
 * Description:
 * - Returns special icon for top 3 ranks (Trophy, Medal, Award)
 * - Returns null for ranks below top 3
 *
 * Parameters:
 * - rank (number): Player rank
 * - size (number, optional): Size of the icon (default: 32)
 *
 * Returns:
 * - React.ReactElement | null: Icon component for top ranks, null otherwise
 */
function getRankIcon(rank: number, size: number = RANK_ICON_SIZE_LARGE): React.ReactElement | null {
  switch (rank) {
    case 1:
      return <Trophy size={size} className="text-yellow-400" />;
    case 2:
      return <Medal size={size} className="text-gray-300" />;
    case 3:
      return <Award size={size} className="text-amber-600" />;
    default:
      return null;
  }
}

/**
 * Function: getRankGradient
 * Description:
 * - Returns Tailwind CSS gradient classes for rank badges
 * - Provides distinct colors for top 5 ranks
 *
 * Parameters:
 * - rank (number): Player rank
 *
 * Returns:
 * - string: Tailwind CSS gradient classes
 */
function getRankGradient(rank: number): string {
  switch (rank) {
    case 1:
      return RANK_COLORS.FIRST;
    case 2:
      return RANK_COLORS.SECOND;
    case 3:
      return RANK_COLORS.THIRD;
    case 4:
      return RANK_COLORS.FOURTH;
    case 5:
      return RANK_COLORS.FIFTH;
    default:
      return RANK_COLORS.DEFAULT;
  }
}

/**
 * Component: LeaderboardEntryComponent
 * Description:
 * - Individual leaderboard entry component with animations
 * - Animates score counter and entry appearance
 * - Shows rank change indicators and special icons for top ranks
 *
 * Parameters:
 * - entry (LeaderboardEntry): Leaderboard entry data
 * - index (number): Index in the leaderboard list
 * - shouldAnimate (boolean): Whether animations should be active
 *
 * Returns:
 * - JSX.Element: Leaderboard entry component
 */
const LeaderboardEntryComponent: React.FC<LeaderboardEntryComponentProps> = ({
  entry,
  index,
  shouldAnimate,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setAnimatedScore(0);
      setIsVisible(false);
      return;
    }

    const targetScore = entry.score;
    const animationIndex = index;

    const entryDelay = animationIndex * ENTRY_ANIMATION_DELAY_MS;
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, entryDelay);

    const scoreDelay = entryDelay + SCORE_ANIMATION_DELAY_MS;
    const scoreTimer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / SCORE_ANIMATION_DURATION_MS, 1);

        const easeOut = 1 - Math.pow(1 - progress, EASING_POWER);
        setAnimatedScore(Math.round(targetScore * easeOut));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateScore);
        }
      };

      animationFrame = requestAnimationFrame(animateScore);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, scoreDelay);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(scoreTimer);
    };
  }, [shouldAnimate, entry.score, index]);

  const rankGradient = getRankGradient(entry.rank);
  const rankIcon = getRankIcon(entry.rank, RANK_ICON_SIZE);

  return (
    <div
      className={`relative p-4 md:p-5 rounded-2xl border-2 ${rankGradient} backdrop-blur-sm shadow-xl transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {entry.rank <= TOP_RANK_THRESHOLD && (
        <div className="absolute -top-1 -left-1 w-6 h-6 md:w-7 md:h-7 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
          {getRankChangeIcon(entry.rankChange, RANK_CHANGE_ICON_SIZE)}
        </div>
      )}

      {rankIcon && (
        <div className="absolute -top-2 -right-2 w-8 h-8 md:w-9 md:h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
          {getRankIcon(entry.rank, RANK_ICON_SIZE)}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
              {entry.rank}
            </span>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-bold text-white drop-shadow-lg">
              {entry.playerName}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg tabular-nums">
            {animatedScore}
          </div>
          <p className="text-xs md:text-sm text-white/80">ポイント</p>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/20 rounded-full"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 bg-white/20 rounded-full"></div>
    </div>
  );
};

//----------------------------------------------------
// 6. Export
//----------------------------------------------------

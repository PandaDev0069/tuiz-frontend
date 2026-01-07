// ====================================================
// File Name   : HostPodiumScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-29
// Last Update : 2025-12-23
//
// Description:
// - Host screen component for displaying final podium results
// - Shows top 3 players on podium with dramatic animations
// - Displays remaining players in a list below
// - Uses bounce easing for score animations
//
// Notes:
// - Uses staggered animations for podium positions
// - Animates score counters with bounce easing
// - Shows sparkles effect for top 3 players
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Sparkles } from 'lucide-react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import type { LeaderboardEntry } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const ANIMATION_START_DELAY_MS = 500;
const ANIMATION_COMPLETE_DELAY_MS = 6000;
const REMAINING_PLAYERS_DELAY_MS = 2000;
const PODIUM_ANIMATION_DELAY_MS = 200;

const SCORE_ANIMATION_DELAY_MS = 800;
const SCORE_ANIMATION_DURATION_MS = 2000;
const SPARKLES_ICON_SIZE = 24;

const TOP_THREE_COUNT = 3;
const REMAINING_PLAYERS_MAX = 8;
const REMAINING_PLAYERS_DISPLAY_COUNT = 5;

const PODIUM_DELAY_SECOND = 800;
const PODIUM_DELAY_FIRST = 1200;
const PODIUM_DELAY_THIRD = 600;
const REMAINING_ITEM_DELAY_BASE_MS = 2200;
const REMAINING_ITEM_STAGGER_MS = 100;

const DEFAULT_RANK_ICON_SIZE = 48;

const EASING_CONSTANT_1 = 1 / 2.75;
const EASING_CONSTANT_2 = 2 / 2.75;
const EASING_CONSTANT_3 = 2.5 / 2.75;
const EASING_MULTIPLIER = 7.5625;
const EASING_OFFSET_1 = 1.5 / 2.75;
const EASING_OFFSET_2 = 2.25 / 2.75;
const EASING_OFFSET_3 = 2.625 / 2.75;
const EASING_VALUE_1 = 0.75;
const EASING_VALUE_2 = 0.9375;
const EASING_VALUE_3 = 0.984375;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface HostPodiumScreenProps {
  entries: LeaderboardEntry[];
  onAnimationComplete?: () => void;
}

interface PodiumPositionProps {
  entry: LeaderboardEntry;
  shouldAnimate: boolean;
  animationDelay: number;
}

interface RemainingPlayersListProps {
  entries: LeaderboardEntry[];
  shouldAnimate: boolean;
}

interface PodiumStyles {
  height: string;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: HostPodiumScreen
 * Description:
 * - Displays final podium screen with top 3 players
 * - Shows remaining players in a list below podium
 * - Manages staggered animations for dramatic effect
 * - Calls completion callback after animations finish
 *
 * Parameters:
 * - entries (LeaderboardEntry[]): Array of leaderboard entries
 * - onAnimationComplete (function, optional): Callback when all animations complete
 *
 * Returns:
 * - JSX.Element: Host podium screen component
 */
export const HostPodiumScreen: React.FC<HostPodiumScreenProps> = ({
  entries,
  onAnimationComplete,
}) => {
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);

  const topThree = entries.slice(0, TOP_THREE_COUNT);
  const remainingPlayers = entries.slice(TOP_THREE_COUNT, REMAINING_PLAYERS_MAX);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, ANIMATION_START_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAnimationStarted && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, ANIMATION_COMPLETE_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [isAnimationStarted, onAnimationComplete]);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 h-full flex flex-col pt-8">
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
                  結果発表
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg"></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 py-4 min-h-0 overflow-hidden">
            <div className="w-full max-w-6xl h-full flex flex-col">
              <div className="flex-1 flex items-end justify-center mb-8">
                <div className="flex items-end justify-center space-x-4 md:space-x-8">
                  {topThree[1] && (
                    <PodiumPosition
                      entry={topThree[1]}
                      shouldAnimate={isAnimationStarted}
                      animationDelay={PODIUM_DELAY_SECOND}
                    />
                  )}

                  {topThree[0] && (
                    <PodiumPosition
                      entry={topThree[0]}
                      shouldAnimate={isAnimationStarted}
                      animationDelay={PODIUM_DELAY_FIRST}
                    />
                  )}

                  {topThree[2] && (
                    <PodiumPosition
                      entry={topThree[2]}
                      shouldAnimate={isAnimationStarted}
                      animationDelay={PODIUM_DELAY_THIRD}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-center pb-4">
                <RemainingPlayersList
                  entries={remainingPlayers}
                  shouldAnimate={isAnimationStarted}
                />
              </div>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: getRankIcon
 * Description:
 * - Returns appropriate icon component for podium rank positions
 * - Crown for 1st, Medal for 2nd, Trophy for 3rd, Star for others
 *
 * Parameters:
 * - rank (number): Player rank
 * - size (number, optional): Size of the icon (default: 48)
 *
 * Returns:
 * - React.ReactElement: Icon component for the rank
 */
function getRankIcon(rank: number, size: number = DEFAULT_RANK_ICON_SIZE): React.ReactElement {
  switch (rank) {
    case 1:
      return <Crown size={size} className="text-yellow-400 drop-shadow-lg" />;
    case 2:
      return <Medal size={size} className="text-gray-300 drop-shadow-lg" />;
    case 3:
      return <Trophy size={size} className="text-amber-600 drop-shadow-lg" />;
    default:
      return <Star size={size} className="text-white drop-shadow-lg" />;
  }
}

/**
 * Function: getPodiumStyles
 * Description:
 * - Returns Tailwind CSS classes and styles for podium positions
 * - Provides distinct colors and heights for each rank
 *
 * Parameters:
 * - rank (number): Player rank (1, 2, 3, or default)
 *
 * Returns:
 * - PodiumStyles: Object containing height, gradient, border, glow, and textColor classes
 */
function getPodiumStyles(rank: number): PodiumStyles {
  switch (rank) {
    case 1:
      return {
        height: 'h-32 md:h-40',
        gradient: 'bg-gradient-to-t from-yellow-500 via-yellow-400 to-yellow-300',
        border: 'border-yellow-300',
        glow: 'shadow-yellow-400/50',
        textColor: 'text-yellow-900',
      };
    case 2:
      return {
        height: 'h-24 md:h-32',
        gradient: 'bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300',
        border: 'border-gray-300',
        glow: 'shadow-gray-400/50',
        textColor: 'text-gray-900',
      };
    case 3:
      return {
        height: 'h-20 md:h-28',
        gradient: 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400',
        border: 'border-amber-400',
        glow: 'shadow-amber-500/50',
        textColor: 'text-amber-900',
      };
    default:
      return {
        height: 'h-16',
        gradient: 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300',
        border: 'border-blue-300',
        glow: 'shadow-blue-400/50',
        textColor: 'text-blue-900',
      };
  }
}

/**
 * Function: easeOutBounce
 * Description:
 * - Bounce easing function for dramatic animation effect
 * - Creates a bouncing effect at the end of animation
 *
 * Parameters:
 * - t (number): Progress value between 0 and 1
 *
 * Returns:
 * - number: Eased progress value
 */
function easeOutBounce(t: number): number {
  if (t < EASING_CONSTANT_1) {
    return EASING_MULTIPLIER * t * t;
  } else if (t < EASING_CONSTANT_2) {
    return EASING_MULTIPLIER * (t -= EASING_OFFSET_1) * t + EASING_VALUE_1;
  } else if (t < EASING_CONSTANT_3) {
    return EASING_MULTIPLIER * (t -= EASING_OFFSET_2) * t + EASING_VALUE_2;
  } else {
    return EASING_MULTIPLIER * (t -= EASING_OFFSET_3) * t + EASING_VALUE_3;
  }
}

/**
 * Function: getRankPositionText
 * Description:
 * - Returns ordinal text for rank position (1st, 2nd, 3rd)
 *
 * Parameters:
 * - rank (number): Player rank
 *
 * Returns:
 * - string: Ordinal text for the rank
 */
function getRankPositionText(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return String(rank);
}

/**
 * Component: PodiumPosition
 * Description:
 * - Individual podium position component with dramatic animations
 * - Animates score counter with bounce easing
 * - Shows sparkles effect for top 3 players
 * - Displays player card and podium base
 *
 * Parameters:
 * - entry (LeaderboardEntry): Leaderboard entry data
 * - shouldAnimate (boolean): Whether animations should be active
 * - animationDelay (number): Delay in milliseconds before animation starts
 *
 * Returns:
 * - JSX.Element: Podium position component
 */
const PodiumPosition: React.FC<PodiumPositionProps> = ({
  entry,
  shouldAnimate,
  animationDelay,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  const podiumStyles = getPodiumStyles(entry.rank);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(false);
      setAnimatedScore(0);
      setShowSparkles(false);
      return;
    }

    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    const scoreTimer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / SCORE_ANIMATION_DURATION_MS, 1);

        const easedProgress = easeOutBounce(progress);
        setAnimatedScore(Math.round(entry.score * easedProgress));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateScore);
        } else {
          setShowSparkles(true);
        }
      };

      animationFrame = requestAnimationFrame(animateScore);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, animationDelay + SCORE_ANIMATION_DELAY_MS);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(scoreTimer);
    };
  }, [shouldAnimate, entry.score, animationDelay]);

  return (
    <div className="relative flex flex-col items-center">
      {showSparkles && entry.rank <= TOP_THREE_COUNT && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-ping">
          <Sparkles size={SPARKLES_ICON_SIZE} className="text-yellow-400" />
        </div>
      )}

      <div
        className={`relative mb-4 p-4 md:p-6 rounded-2xl border-2 backdrop-blur-sm shadow-2xl transition-all duration-1000 transform ${
          isVisible
            ? `opacity-100 translate-y-0 scale-100 ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-2xl`
            : 'opacity-0 translate-y-8 scale-75 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
            {getRankIcon(entry.rank)}
          </div>
        </div>

        <div className="text-center mt-6">
          <div className={`text-3xl md:text-5xl font-black ${podiumStyles.textColor} mb-2`}>
            {getRankPositionText(entry.rank)}
          </div>

          <h3
            className={`text-lg md:text-xl font-bold ${podiumStyles.textColor} mb-2 break-words max-w-[120px] md:max-w-[160px]`}
          >
            {entry.playerName}
          </h3>

          <div className={`text-2xl md:text-3xl font-bold ${podiumStyles.textColor} tabular-nums`}>
            {animatedScore}
          </div>
          <p className={`text-sm ${podiumStyles.textColor} opacity-80`}>ポイント</p>
        </div>

        <div className="absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>

      <div
        className={`w-24 md:w-32 rounded-t-xl border-2 transition-all duration-1000 transform flex items-end justify-center ${
          isVisible
            ? `${podiumStyles.height} ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-2xl`
            : 'h-0 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay + PODIUM_ANIMATION_DELAY_MS}ms` }}
      >
        <div className={`text-4xl md:text-6xl font-black ${podiumStyles.textColor} mb-4`}>
          {entry.rank}
        </div>
      </div>
    </div>
  );
};

/**
 * Component: RemainingPlayersList
 * Description:
 * - Displays list of players ranked 4th and below
 * - Shows with staggered entry animations
 * - Appears after podium animations complete
 *
 * Parameters:
 * - entries (LeaderboardEntry[]): Array of remaining leaderboard entries
 * - shouldAnimate (boolean): Whether animations should be active
 *
 * Returns:
 * - JSX.Element | null: Remaining players list component or null if empty
 */
const RemainingPlayersList: React.FC<RemainingPlayersListProps> = ({ entries, shouldAnimate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, REMAINING_PLAYERS_DELAY_MS);

    return () => clearTimeout(timer);
  }, [shouldAnimate]);

  if (entries.length === 0) return null;

  return (
    <div
      className={`w-full max-w-md transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
        <h4 className="text-xl font-bold text-white mb-4 text-center">その他の順位</h4>
        <div className="space-y-3">
          {entries.slice(0, REMAINING_PLAYERS_DISPLAY_COUNT).map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 transition-all duration-500 transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
              style={{
                transitionDelay: `${REMAINING_ITEM_DELAY_BASE_MS + index * REMAINING_ITEM_STAGGER_MS}ms`,
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{entry.rank}</span>
                </div>
                <span className="text-white font-medium">{entry.playerName}</span>
              </div>
              <span className="text-white font-bold tabular-nums">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

//----------------------------------------------------
// 6. Export
//----------------------------------------------------

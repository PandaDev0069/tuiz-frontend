// ====================================================
// File Name   : PlayerPodiumScreen.tsx
// Project     : TUIZ
// Author      : TUIZ Team
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Displays the podium screen for players showing top 3 winners with dramatic animations
// - Shows remaining players in a list below the podium
// - Implements responsive design with separate mobile and desktop layouts
// - Features animated score counting and sparkle effects for top 3
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses requestAnimationFrame for smooth score animations
// - Implements different easing functions for mobile and desktop
// - Detects mobile screen size dynamically
// ====================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Sparkles } from 'lucide-react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';

import type { LeaderboardEntry } from '@/types/game';

const DEFAULT_RANK_ICON_SIZE = 48;
const MOBILE_RANK_ICON_SIZE = 22;
const MOBILE_SPARKLES_SIZE = 16;
const DESKTOP_SPARKLES_SIZE = 24;

const MOBILE_SCORE_ANIMATION_DURATION_MS = 1500;
const DESKTOP_SCORE_ANIMATION_DURATION_MS = 2000;
const MOBILE_SCORE_ANIMATION_DELAY_MS = 600;
const DESKTOP_SCORE_ANIMATION_DELAY_MS = 800;
const PODIUM_BASE_DELAY_MS = 200;
const MOBILE_REMAINING_PLAYERS_DELAY_MS = 1500;
const DESKTOP_REMAINING_PLAYERS_DELAY_MS = 2000;
const MOBILE_REMAINING_ITEM_BASE_DELAY_MS = 1700;
const DESKTOP_REMAINING_ITEM_BASE_DELAY_MS = 2200;
const REMAINING_ITEM_STAGGER_DELAY_MS = 100;
const ANIMATION_START_DELAY_MS = 500;

const ANIMATION_DELAY_THIRD_PLACE_MS = 600;
const ANIMATION_DELAY_SECOND_PLACE_MS = 800;
const ANIMATION_DELAY_FIRST_PLACE_MS = 1200;

const TOP_PODIUM_COUNT = 3;
const REMAINING_PLAYERS_COUNT = 8;
const TOP_RANK_THRESHOLD = 3;
const MOBILE_BREAKPOINT_PX = 768;

const RANK_FIRST = 1;
const RANK_SECOND = 2;
const RANK_THIRD = 3;

const EASE_OUT_BOUNCE_CONSTANT = 7.5625;
const EASE_OUT_BOUNCE_THRESHOLD_1 = 1 / 2.75;
const EASE_OUT_BOUNCE_THRESHOLD_2 = 2 / 2.75;
const EASE_OUT_BOUNCE_THRESHOLD_3 = 2.5 / 2.75;
const EASE_OUT_BOUNCE_OFFSET_1 = 1.5 / 2.75;
const EASE_OUT_BOUNCE_OFFSET_2 = 2.25 / 2.75;
const EASE_OUT_BOUNCE_OFFSET_3 = 2.625 / 2.75;
const EASE_OUT_BOUNCE_VALUE_1 = 0.75;
const EASE_OUT_BOUNCE_VALUE_2 = 0.9375;
const EASE_OUT_BOUNCE_VALUE_3 = 0.984375;

const EASE_OUT_CUBIC_POWER = 3;

interface PlayerPodiumScreenProps {
  entries: LeaderboardEntry[];
}

interface MobilePodiumPositionProps {
  entry: LeaderboardEntry;
  shouldAnimate: boolean;
  animationDelay: number;
}

interface DesktopPodiumPositionProps {
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
  mobileHeight?: string;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}

/**
 * Component: PlayerPodiumScreen
 * Description:
 * - Renders the podium screen for players showing top 3 winners with dramatic animations
 * - Displays remaining players in a list below the podium
 * - Implements responsive design with separate mobile and desktop layouts
 * - Features animated score counting and sparkle effects for top 3
 *
 * @param {LeaderboardEntry[]} entries - Array of leaderboard entries to display
 * @returns {React.ReactElement} The podium screen component
 *
 * @example
 * ```tsx
 * <PlayerPodiumScreen
 *   entries={[
 *     { playerId: '1', playerName: 'Player 1', score: 1000, rank: 1 },
 *     { playerId: '2', playerName: 'Player 2', score: 800, rank: 2 },
 *     { playerId: '3', playerName: 'Player 3', score: 600, rank: 3 }
 *   ]}
 * />
 * ```
 */
export const PlayerPodiumScreen: React.FC<PlayerPodiumScreenProps> = ({ entries }) => {
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const topThree = entries.slice(0, TOP_PODIUM_COUNT);
  const remainingPlayers = entries.slice(TOP_PODIUM_COUNT, REMAINING_PLAYERS_COUNT);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, ANIMATION_START_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

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
                <span className="text-4xl md:text-6xl lg:text-8xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  結果発表
                </span>
              </div>
              <div className="w-20 h-1 md:w-24 md:h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg"></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 py-4 min-h-0 overflow-hidden">
            <div className="w-full max-w-6xl h-full flex flex-col">
              {isMobile ? (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center mb-6">
                    <div className="w-full overflow-x-auto pb-2">
                      <div className="grid grid-cols-3 gap-4 w-full max-w-md items-end min-w-[21rem] mx-auto">
                        {topThree[1] && (
                          <div className="order-1 flex justify-center">
                            <MobilePodiumPosition
                              entry={topThree[1]}
                              shouldAnimate={isAnimationStarted}
                              animationDelay={ANIMATION_DELAY_SECOND_PLACE_MS}
                            />
                          </div>
                        )}

                        {topThree[0] && (
                          <div className="order-2 flex justify-center">
                            <MobilePodiumPosition
                              entry={topThree[0]}
                              shouldAnimate={isAnimationStarted}
                              animationDelay={ANIMATION_DELAY_FIRST_PLACE_MS}
                            />
                          </div>
                        )}

                        {topThree[2] && (
                          <div className="order-3 flex justify-center">
                            <MobilePodiumPosition
                              entry={topThree[2]}
                              shouldAnimate={isAnimationStarted}
                              animationDelay={ANIMATION_DELAY_THIRD_PLACE_MS}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <MobileRemainingPlayersList
                      entries={remainingPlayers}
                      shouldAnimate={isAnimationStarted}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-end justify-center mb-8">
                    <div className="flex items-end justify-center space-x-4 md:space-x-8">
                      {topThree[1] && (
                        <DesktopPodiumPosition
                          entry={topThree[1]}
                          shouldAnimate={isAnimationStarted}
                          animationDelay={ANIMATION_DELAY_SECOND_PLACE_MS}
                        />
                      )}

                      {topThree[0] && (
                        <DesktopPodiumPosition
                          entry={topThree[0]}
                          shouldAnimate={isAnimationStarted}
                          animationDelay={ANIMATION_DELAY_FIRST_PLACE_MS}
                        />
                      )}

                      {topThree[2] && (
                        <DesktopPodiumPosition
                          entry={topThree[2]}
                          shouldAnimate={isAnimationStarted}
                          animationDelay={ANIMATION_DELAY_THIRD_PLACE_MS}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center pb-4">
                    <DesktopRemainingPlayersList
                      entries={remainingPlayers}
                      shouldAnimate={isAnimationStarted}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};

/**
 * Component: MobilePodiumPosition
 * Description:
 * - Renders a single podium position for mobile layout
 * - Implements compact design optimized for small screens
 * - Features animated score counting and sparkle effects
 *
 * @param {LeaderboardEntry} entry - The leaderboard entry to display
 * @param {boolean} shouldAnimate - Whether animations should be active
 * @param {number} animationDelay - Delay in milliseconds before animation starts
 * @returns {React.ReactElement} The mobile podium position component
 */
const MobilePodiumPosition: React.FC<MobilePodiumPositionProps> = ({
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
        const progress = Math.min(elapsed / MOBILE_SCORE_ANIMATION_DURATION_MS, 1);

        const easeOut = 1 - Math.pow(1 - progress, EASE_OUT_CUBIC_POWER);
        setAnimatedScore(Math.round(entry.score * easeOut));

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
    }, animationDelay + MOBILE_SCORE_ANIMATION_DELAY_MS);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(scoreTimer);
    };
  }, [shouldAnimate, entry.score, animationDelay]);

  return (
    <div className="relative flex flex-col items-center justify-end h-full w-[6rem]">
      {showSparkles && entry.rank <= TOP_RANK_THRESHOLD && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-ping">
          <Sparkles size={MOBILE_SPARKLES_SIZE} className="text-yellow-400" />
        </div>
      )}

      <div
        className={`relative p-3 rounded-xl border-2 backdrop-blur-sm shadow-lg transition-all duration-1000 transform w-full ${
          isVisible
            ? `opacity-100 translate-y-0 scale-100 ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-lg`
            : 'opacity-0 translate-y-4 scale-95 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            {getRankIcon(entry.rank, MOBILE_RANK_ICON_SIZE)}
          </div>
        </div>

        <div className="text-center mt-4">
          <div className={`text-xl font-black ${podiumStyles.textColor} mb-1`}>
            {entry.rank === RANK_FIRST ? '1st' : entry.rank === RANK_SECOND ? '2nd' : '3rd'}
          </div>

          <h3
            className={`text-sm font-bold ${podiumStyles.textColor} mb-1 break-words leading-tight`}
          >
            {entry.playerName}
          </h3>

          <div className={`text-base font-bold ${podiumStyles.textColor} tabular-nums`}>
            {animatedScore}
          </div>
          <p className={`text-xs ${podiumStyles.textColor} opacity-80`}>ポイント</p>
        </div>
      </div>

      <div
        className={`mt-3 w-full rounded-t-lg border-2 transition-all duration-1000 transform flex items-end justify-center ${
          isVisible
            ? `${podiumStyles.mobileHeight ?? podiumStyles.height} ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-lg`
            : 'h-0 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay + PODIUM_BASE_DELAY_MS}ms` }}
      >
        <div className={`text-2xl font-black ${podiumStyles.textColor} mb-3`}>{entry.rank}</div>
      </div>
    </div>
  );
};

/**
 * Component: DesktopPodiumPosition
 * Description:
 * - Renders a single podium position for desktop layout
 * - Implements larger design with more dramatic animations
 * - Features animated score counting with bounce easing and sparkle effects
 *
 * @param {LeaderboardEntry} entry - The leaderboard entry to display
 * @param {boolean} shouldAnimate - Whether animations should be active
 * @param {number} animationDelay - Delay in milliseconds before animation starts
 * @returns {React.ReactElement} The desktop podium position component
 */
const DesktopPodiumPosition: React.FC<DesktopPodiumPositionProps> = ({
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
        const progress = Math.min(elapsed / DESKTOP_SCORE_ANIMATION_DURATION_MS, 1);

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
    }, animationDelay + DESKTOP_SCORE_ANIMATION_DELAY_MS);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(scoreTimer);
    };
  }, [shouldAnimate, entry.score, animationDelay]);

  return (
    <div className="relative flex flex-col items-center">
      {showSparkles && entry.rank <= TOP_RANK_THRESHOLD && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-ping">
          <Sparkles size={DESKTOP_SPARKLES_SIZE} className="text-yellow-400" />
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
            {entry.rank === RANK_FIRST ? '1st' : entry.rank === RANK_SECOND ? '2nd' : '3rd'}
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
        style={{ transitionDelay: `${animationDelay + PODIUM_BASE_DELAY_MS}ms` }}
      >
        <div className={`text-4xl md:text-6xl font-black ${podiumStyles.textColor} mb-4`}>
          {entry.rank}
        </div>
      </div>
    </div>
  );
};

/**
 * Component: MobileRemainingPlayersList
 * Description:
 * - Renders a list of remaining players (4th place and below) for mobile layout
 * - Implements staggered entrance animations
 * - Shows players in a compact list format
 *
 * @param {LeaderboardEntry[]} entries - Array of remaining leaderboard entries
 * @param {boolean} shouldAnimate - Whether animations should be active
 * @returns {React.ReactElement | null} The mobile remaining players list component or null if empty
 */
const MobileRemainingPlayersList: React.FC<RemainingPlayersListProps> = ({
  entries,
  shouldAnimate,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, MOBILE_REMAINING_PLAYERS_DELAY_MS);

    return () => clearTimeout(timer);
  }, [shouldAnimate]);

  if (entries.length === 0) return null;

  return (
    <div
      className={`w-full transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-3 text-center">その他の順位</h4>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 transition-all duration-500 transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
              style={{
                transitionDelay: `${MOBILE_REMAINING_ITEM_BASE_DELAY_MS + index * REMAINING_ITEM_STAGGER_DELAY_MS}ms`,
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{entry.rank}</span>
                </div>
                <span className="text-white font-medium text-sm">{entry.playerName}</span>
              </div>
              <span className="text-white font-bold tabular-nums text-sm">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Component: DesktopRemainingPlayersList
 * Description:
 * - Renders a list of remaining players (4th place and below) for desktop layout
 * - Implements staggered entrance animations
 * - Shows players in a larger list format
 *
 * @param {LeaderboardEntry[]} entries - Array of remaining leaderboard entries
 * @param {boolean} shouldAnimate - Whether animations should be active
 * @returns {React.ReactElement | null} The desktop remaining players list component or null if empty
 */
const DesktopRemainingPlayersList: React.FC<RemainingPlayersListProps> = ({
  entries,
  shouldAnimate,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, DESKTOP_REMAINING_PLAYERS_DELAY_MS);

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
          {entries.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 transition-all duration-500 transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
              style={{
                transitionDelay: `${DESKTOP_REMAINING_ITEM_BASE_DELAY_MS + index * REMAINING_ITEM_STAGGER_DELAY_MS}ms`,
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

/**
 * Gets the rank icon component for podium positions.
 *
 * @param {number} rank - Player's rank
 * @param {number} [size] - Icon size in pixels (default: 48)
 * @returns {React.ReactElement} The rank icon component
 */
function getRankIcon(rank: number, size: number = DEFAULT_RANK_ICON_SIZE): React.ReactElement {
  switch (rank) {
    case RANK_FIRST:
      return <Crown size={size} className="text-yellow-400 drop-shadow-lg" />;
    case RANK_SECOND:
      return <Medal size={size} className="text-gray-300 drop-shadow-lg" />;
    case RANK_THIRD:
      return <Trophy size={size} className="text-amber-600 drop-shadow-lg" />;
    default:
      return <Star size={size} className="text-white drop-shadow-lg" />;
  }
}

/**
 * Gets the podium styles (height, gradient, border, glow, text color) for each rank position.
 *
 * @param {number} rank - Player's rank
 * @returns {PodiumStyles} Object containing Tailwind CSS classes for podium styling
 */
function getPodiumStyles(rank: number): PodiumStyles {
  switch (rank) {
    case RANK_FIRST:
      return {
        height: 'h-32 md:h-40',
        mobileHeight: 'h-24',
        gradient: 'bg-gradient-to-t from-yellow-500 via-yellow-400 to-yellow-300',
        border: 'border-yellow-300',
        glow: 'shadow-yellow-400/50',
        textColor: 'text-yellow-900',
      };
    case RANK_SECOND:
      return {
        height: 'h-24 md:h-32',
        mobileHeight: 'h-20',
        gradient: 'bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300',
        border: 'border-gray-300',
        glow: 'shadow-gray-400/50',
        textColor: 'text-gray-900',
      };
    case RANK_THIRD:
      return {
        height: 'h-20 md:h-28',
        mobileHeight: 'h-16',
        gradient: 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400',
        border: 'border-amber-400',
        glow: 'shadow-amber-500/50',
        textColor: 'text-amber-900',
      };
    default:
      return {
        height: 'h-16',
        mobileHeight: 'h-14',
        gradient: 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300',
        border: 'border-blue-300',
        glow: 'shadow-blue-400/50',
        textColor: 'text-blue-900',
      };
  }
}

/**
 * Ease out bounce easing function for dramatic score animation effect.
 *
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased progress value
 */
function easeOutBounce(t: number): number {
  if (t < EASE_OUT_BOUNCE_THRESHOLD_1) {
    return EASE_OUT_BOUNCE_CONSTANT * t * t;
  } else if (t < EASE_OUT_BOUNCE_THRESHOLD_2) {
    return EASE_OUT_BOUNCE_CONSTANT * (t -= EASE_OUT_BOUNCE_OFFSET_1) * t + EASE_OUT_BOUNCE_VALUE_1;
  } else if (t < EASE_OUT_BOUNCE_THRESHOLD_3) {
    return EASE_OUT_BOUNCE_CONSTANT * (t -= EASE_OUT_BOUNCE_OFFSET_2) * t + EASE_OUT_BOUNCE_VALUE_2;
  } else {
    return EASE_OUT_BOUNCE_CONSTANT * (t -= EASE_OUT_BOUNCE_OFFSET_3) * t + EASE_OUT_BOUNCE_VALUE_3;
  }
}

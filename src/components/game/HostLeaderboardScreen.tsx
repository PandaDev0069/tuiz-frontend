'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardData, LeaderboardEntry, RankChange } from '@/types/game';

// Get rank change icon and color
const getRankChangeIcon = (rankChange: RankChange, size: number = 20) => {
  switch (rankChange) {
    case 'up':
      return <TrendingUp size={size} className="text-green-400" />;
    case 'down':
      return <TrendingDown size={size} className="text-red-400" />;
    case 'same':
    default:
      return <Minus size={size} className="text-gray-400" />;
  }
};

// Get rank icon for top 3
const getRankIcon = (rank: number, size: number = 32) => {
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
};

// Get gradient colors for ranks
const getRankGradient = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-300';
    case 2:
      return 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-200';
    case 3:
      return 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400';
    case 4:
      return 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300';
    case 5:
      return 'bg-gradient-to-r from-purple-400 to-purple-500 border-purple-300';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300';
  }
};

// LeaderboardEntry Component with animations - moved outside to prevent recreation
const LeaderboardEntryComponent: React.FC<{
  entry: LeaderboardEntry;
  index: number;
  shouldAnimate: boolean;
}> = ({ entry, index, shouldAnimate }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setAnimatedScore(0);
      setIsVisible(false);
      return;
    }

    // Capture values to avoid dependency issues
    const targetScore = entry.score;
    const animationIndex = index;

    // Staggered entry animation
    const entryDelay = animationIndex * 200;
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, entryDelay);

    // Score animation
    const scoreDelay = entryDelay + 300;
    const scoreTimer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;
      const duration = 1500;

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
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
  const rankIcon = getRankIcon(entry.rank, 20);

  return (
    <div
      className={`relative p-4 md:p-5 rounded-2xl border-2 ${rankGradient} backdrop-blur-sm shadow-xl transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Rank Change Indicator */}
      <div className="absolute -top-1 -left-1 w-6 h-6 md:w-7 md:h-7 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
        {getRankChangeIcon(entry.rankChange, 14)}
      </div>

      {/* Rank Crown/Medal for top 3 */}
      {rankIcon && (
        <div className="absolute -top-2 -right-2 w-8 h-8 md:w-9 md:h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
          {getRankIcon(entry.rank, 20)}
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Rank Number and Player Name */}
        <div className="flex items-center space-x-3">
          {/* Rank Circle */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
              {entry.rank}
            </span>
          </div>

          {/* Player Name */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-white drop-shadow-lg">
              {entry.playerName}
            </h3>
            <p className="text-xs md:text-sm text-white/80">プレイヤー</p>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg tabular-nums">
            {animatedScore}
          </div>
          <p className="text-xs md:text-sm text-white/80">ポイント</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/20 rounded-full"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 bg-white/20 rounded-full"></div>
    </div>
  );
};

interface HostLeaderboardScreenProps {
  leaderboardData: LeaderboardData;
  onTimeExpired?: () => void; // Callback for when timer expires
}

export const HostLeaderboardScreen: React.FC<HostLeaderboardScreenProps> = ({
  leaderboardData,
}) => {
  const { entries, questionNumber, totalQuestions, timeLimit } = leaderboardData;

  // Animation state
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeLimit);

  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array

  // Internal timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Timer expired - could trigger navigation here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Run once on mount

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        {/* Same background as other host screens */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col pt-16">
          {/* Header Section */}
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

          {/* Leaderboard Container */}
          <div className="flex-1 flex items-center justify-center px-6 md:px-8 py-2 min-h-0 overflow-hidden">
            <div className="w-full max-w-4xl h-full flex flex-col">
              {/* Leaderboard Background Container */}
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl overflow-hidden">
                {/* Top 5 Players - Hide scrollbar during animations */}
                <div
                  className={`px-2 ${
                    isAnimationStarted
                      ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
                      : 'overflow-hidden max-h-[32rem]'
                  }`}
                >
                  <div className="space-y-3 md:space-y-4 pt-2">
                    {entries.slice(0, 5).map((entry, index) => (
                      <LeaderboardEntryComponent
                        key={entry.playerId}
                        entry={entry}
                        index={index}
                        shouldAnimate={isAnimationStarted}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom decoration */}
                <div className="mt-4 flex justify-center items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full shadow-lg"></div>
                  <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                </div>

                {/* Footer info */}
                <div className="mt-3 text-center">
                  <p className="text-base md:text-lg text-white/80 font-medium">
                    トップ 5 プレイヤー
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-4"></div>
        </div>
      </Main>
    </PageContainer>
  );
};

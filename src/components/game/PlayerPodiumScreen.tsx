'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { Trophy, Medal, Crown, Star, Sparkles } from 'lucide-react';
import { LeaderboardEntry } from '@/types/game';

// Get rank icon for podium positions
const getRankIcon = (rank: number, size: number = 48) => {
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
};

// Get podium height and gradient for each position
const getPodiumStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        height: 'h-32 md:h-40',
        mobileHeight: 'h-24',
        gradient: 'bg-gradient-to-t from-yellow-500 via-yellow-400 to-yellow-300',
        border: 'border-yellow-300',
        glow: 'shadow-yellow-400/50',
        textColor: 'text-yellow-900',
      };
    case 2:
      return {
        height: 'h-24 md:h-32',
        mobileHeight: 'h-20',
        gradient: 'bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300',
        border: 'border-gray-300',
        glow: 'shadow-gray-400/50',
        textColor: 'text-gray-900',
      };
    case 3:
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
};

// Mobile Podium Position Component
const MobilePodiumPosition: React.FC<{
  entry: LeaderboardEntry;
  shouldAnimate: boolean;
  animationDelay: number;
}> = ({ entry, shouldAnimate, animationDelay }) => {
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

    // Staggered entrance animation
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    // Score animation
    const scoreTimer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;
      const duration = 1500;

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out bounce for mobile
        const easeOut = 1 - Math.pow(1 - progress, 3);
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
    }, animationDelay + 600);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(scoreTimer);
    };
  }, [shouldAnimate, entry.score, animationDelay]);

  return (
    <div className="relative flex flex-col items-center justify-end h-full w-[6rem]">
      {/* Sparkles Effect */}
      {showSparkles && entry.rank <= 3 && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-ping">
          <Sparkles size={16} className="text-yellow-400" />
        </div>
      )}

      {/* Player Card - Compact for mobile grid */}
      <div
        className={`relative p-3 rounded-xl border-2 backdrop-blur-sm shadow-lg transition-all duration-1000 transform w-full ${
          isVisible
            ? `opacity-100 translate-y-0 scale-100 ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-lg`
            : 'opacity-0 translate-y-4 scale-95 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        {/* Rank Icon */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            {getRankIcon(entry.rank, 22)}
          </div>
        </div>

        {/* Player Info */}
        <div className="text-center mt-4">
          {/* Rank Position */}
          <div className={`text-xl font-black ${podiumStyles.textColor} mb-1`}>
            {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : '3rd'}
          </div>

          {/* Player Name */}
          <h3
            className={`text-sm font-bold ${podiumStyles.textColor} mb-1 break-words leading-tight`}
          >
            {entry.playerName}
          </h3>

          {/* Score with animation */}
          <div className={`text-base font-bold ${podiumStyles.textColor} tabular-nums`}>
            {animatedScore}
          </div>
          <p className={`text-xs ${podiumStyles.textColor} opacity-80`}>ポイント</p>
        </div>
      </div>

      {/* Podium Base */}
      <div
        className={`mt-3 w-full rounded-t-lg border-2 transition-all duration-1000 transform flex items-end justify-center ${
          isVisible
            ? `${podiumStyles.mobileHeight ?? podiumStyles.height} ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-lg`
            : 'h-0 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay + 200}ms` }}
      >
        <div className={`text-2xl font-black ${podiumStyles.textColor} mb-3`}>{entry.rank}</div>
      </div>
    </div>
  );
};

// Desktop Podium Position Component (same as HostPodiumScreen)
const DesktopPodiumPosition: React.FC<{
  entry: LeaderboardEntry;
  shouldAnimate: boolean;
  animationDelay: number;
}> = ({ entry, shouldAnimate, animationDelay }) => {
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

    // Staggered entrance animation
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    // Score animation
    const scoreTimer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;
      const duration = 2000;

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Bounce easing for dramatic effect
        const easeOutBounce = (t: number) => {
          if (t < 1 / 2.75) {
            return 7.5625 * t * t;
          } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
          } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
          } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
          }
        };

        const easedProgress = easeOutBounce(progress);
        setAnimatedScore(Math.round(entry.score * easedProgress));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateScore);
        } else {
          // Show sparkles after score animation completes
          setShowSparkles(true);
        }
      };

      animationFrame = requestAnimationFrame(animateScore);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, animationDelay + 800);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(scoreTimer);
    };
  }, [shouldAnimate, entry.score, animationDelay]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Sparkles Effect */}
      {showSparkles && entry.rank <= 3 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-ping">
          <Sparkles size={24} className="text-yellow-400" />
        </div>
      )}

      {/* Player Card */}
      <div
        className={`relative mb-4 p-4 md:p-6 rounded-2xl border-2 backdrop-blur-sm shadow-2xl transition-all duration-1000 transform ${
          isVisible
            ? `opacity-100 translate-y-0 scale-100 ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-2xl`
            : 'opacity-0 translate-y-8 scale-75 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        {/* Rank Icon */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
            {getRankIcon(entry.rank)}
          </div>
        </div>

        {/* Player Info */}
        <div className="text-center mt-6">
          {/* Rank Position */}
          <div className={`text-3xl md:text-5xl font-black ${podiumStyles.textColor} mb-2`}>
            {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : '3rd'}
          </div>

          {/* Player Name */}
          <h3
            className={`text-lg md:text-xl font-bold ${podiumStyles.textColor} mb-2 break-words max-w-[120px] md:max-w-[160px]`}
          >
            {entry.playerName}
          </h3>

          {/* Score with animation */}
          <div className={`text-2xl md:text-3xl font-bold ${podiumStyles.textColor} tabular-nums`}>
            {animatedScore}
          </div>
          <p className={`text-sm ${podiumStyles.textColor} opacity-80`}>ポイント</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>

      {/* Podium Base */}
      <div
        className={`w-24 md:w-32 rounded-t-xl border-2 transition-all duration-1000 transform flex items-end justify-center ${
          isVisible
            ? `${podiumStyles.height} ${podiumStyles.gradient} ${podiumStyles.border} ${podiumStyles.glow} shadow-2xl`
            : 'h-0 bg-white/10 border-white/20'
        }`}
        style={{ transitionDelay: `${animationDelay + 200}ms` }}
      >
        {/* Podium Rank Number */}
        <div className={`text-4xl md:text-6xl font-black ${podiumStyles.textColor} mb-4`}>
          {entry.rank}
        </div>
      </div>
    </div>
  );
};

// Mobile Remaining Players List Component
const MobileRemainingPlayersList: React.FC<{
  entries: LeaderboardEntry[];
  shouldAnimate: boolean;
}> = ({ entries, shouldAnimate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500); // Show after podium animations

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
              style={{ transitionDelay: `${1700 + index * 100}ms` }}
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

// Desktop Remaining Players List Component (same as HostPodiumScreen)
const DesktopRemainingPlayersList: React.FC<{
  entries: LeaderboardEntry[];
  shouldAnimate: boolean;
}> = ({ entries, shouldAnimate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Show after podium animations

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
              style={{ transitionDelay: `${2200 + index * 100}ms` }}
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

interface PlayerPodiumScreenProps {
  entries: LeaderboardEntry[];
}

export const PlayerPodiumScreen: React.FC<PlayerPodiumScreenProps> = ({ entries }) => {
  // Animation state
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get top 3 and remaining players
  const topThree = entries.slice(0, 3);
  const remainingPlayers = entries.slice(3, 8); // Show up to 5 more players

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Same background as other screens */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col pt-8">
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
                <span className="text-4xl md:text-6xl lg:text-8xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  結果発表
                </span>
              </div>
              <div className="w-20 h-1 md:w-24 md:h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg"></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 py-4 min-h-0 overflow-hidden">
            <div className="w-full max-w-6xl h-full flex flex-col">
              {isMobile ? (
                // Mobile Layout
                <>
                  {/* Mobile Podium Section - Horizontal Grid */}
                  <div className="flex-1 flex flex-col items-center justify-center mb-6">
                    <div className="w-full overflow-x-auto pb-2">
                      <div className="grid grid-cols-3 gap-4 w-full max-w-md items-end min-w-[21rem] mx-auto">
                        {/* 2nd Place - Left */}
                        {topThree[1] && (
                          <div className="order-1 flex justify-center">
                            <MobilePodiumPosition
                              entry={topThree[1]}
                              shouldAnimate={isAnimationStarted}
                              animationDelay={800}
                            />
                          </div>
                        )}

                        {/* 1st Place - Center */}
                        {topThree[0] && (
                          <div className="order-2 flex justify-center">
                            <MobilePodiumPosition
                              entry={topThree[0]}
                              shouldAnimate={isAnimationStarted}
                              animationDelay={1200}
                            />
                          </div>
                        )}

                        {/* 3rd Place - Right */}
                        {topThree[2] && (
                          <div className="order-3 flex justify-center">
                            <MobilePodiumPosition
                              entry={topThree[2]}
                              shouldAnimate={isAnimationStarted}
                              animationDelay={600}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Remaining Players */}
                  <div className="px-4 pb-4">
                    <MobileRemainingPlayersList
                      entries={remainingPlayers}
                      shouldAnimate={isAnimationStarted}
                    />
                  </div>
                </>
              ) : (
                // Desktop Layout - Same as HostPodiumScreen
                <>
                  {/* Desktop Podium Section */}
                  <div className="flex-1 flex items-end justify-center mb-8">
                    <div className="flex items-end justify-center space-x-4 md:space-x-8">
                      {/* 2nd Place */}
                      {topThree[1] && (
                        <DesktopPodiumPosition
                          entry={topThree[1]}
                          shouldAnimate={isAnimationStarted}
                          animationDelay={800}
                        />
                      )}

                      {/* 1st Place (Center, Taller) */}
                      {topThree[0] && (
                        <DesktopPodiumPosition
                          entry={topThree[0]}
                          shouldAnimate={isAnimationStarted}
                          animationDelay={1200}
                        />
                      )}

                      {/* 3rd Place */}
                      {topThree[2] && (
                        <DesktopPodiumPosition
                          entry={topThree[2]}
                          shouldAnimate={isAnimationStarted}
                          animationDelay={600}
                        />
                      )}
                    </div>
                  </div>

                  {/* Desktop Remaining Players */}
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

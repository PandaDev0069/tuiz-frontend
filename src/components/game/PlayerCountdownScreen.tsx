'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';

interface PlayerCountdownScreenProps {
  countdownTime: number;
  onCountdownComplete?: () => void;
  message?: string;
  questionNumber?: number;
  totalQuestions?: number;
  isMobile?: boolean;
}

export const PlayerCountdownScreen: React.FC<PlayerCountdownScreenProps> = ({
  countdownTime,
  onCountdownComplete,
  message = '準備してください！',
  questionNumber,
  totalQuestions,
  isMobile = true,
}) => {
  const [currentTime, setCurrentTime] = useState(countdownTime);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentTime <= 0) {
      onCountdownComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentTime((prev) => prev - 1);
      setIsAnimating(true);

      // Reset animation state after animation completes
      setTimeout(() => setIsAnimating(false), 200);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTime, onCountdownComplete]);

  const getCountdownText = () => {
    if (currentTime > 3) return message;
    if (currentTime > 0) return currentTime.toString();
    return 'スタート！';
  };

  const getCountdownSize = () => {
    if (isMobile) {
      if (currentTime > 3) return 'text-5xl sm:text-6xl';
      if (currentTime > 0) return 'text-7xl sm:text-8xl';
      return 'text-6xl sm:text-7xl';
    } else {
      if (currentTime > 3) return 'text-5xl md:text-6xl lg:text-7xl';
      if (currentTime > 0) return 'text-7xl md:text-8xl lg:text-9xl';
      return 'text-6xl md:text-7xl lg:text-8xl';
    }
  };

  const getCountdownColor = () => {
    if (currentTime > 3) return 'text-white';
    if (currentTime > 0) return 'text-yellow-300';
    return 'text-green-300';
  };

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Background - less animated for mobile performance */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Question Counter - mobile optimized */}
        {questionNumber && totalQuestions && (
          <div className={`absolute z-20 ${isMobile ? 'top-4 left-4' : 'top-6 left-6'}`}>
            <div
              className={`bg-white/90 backdrop-blur-sm rounded-lg ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}`}
            >
              <span className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>
        )}

        {/* Main Countdown Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          {/* Countdown Text/Number - Independent container */}
          <div className="text-center w-full max-w-sm sm:max-w-md">
            <div
              className={`${getCountdownSize()} ${getCountdownColor()} font-bold drop-shadow-2xl transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {getCountdownText()}
            </div>

            {/* Subtitle for preparation message */}
            {currentTime > 3 && (
              <div
                className={`mt-6 text-white/90 drop-shadow-xl ${
                  isMobile ? 'text-lg sm:text-xl' : 'text-xl md:text-2xl lg:text-3xl'
                }`}
              >
                次の問題が始まります
              </div>
            )}
          </div>

          {/* Progress Bar - Completely separate and independent */}
          <div className={`mt-8 w-full mx-auto ${isMobile ? 'max-w-lg' : 'max-w-xl'}`}>
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 via-blue-400/15 to-purple-400/15 rounded-lg blur-sm scale-105"></div>

              {/* Main progress container - Fixed width */}
              <div
                className={`relative bg-white/10 rounded-lg w-full overflow-hidden border border-white/20 backdrop-blur-sm ${
                  isMobile ? 'h-3' : 'h-3.5'
                }`}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>

                {/* Progress fill with multiple layers */}
                <div
                  className="relative h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((countdownTime - currentTime) / countdownTime) * 100}%` }}
                >
                  {/* Base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>

                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-pulse"></div>

                  {/* Moving highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-pulse"></div>

                  {/* Glowing edge */}
                  <div
                    className={`absolute top-0 right-0 h-full bg-white/80 rounded-r-lg shadow-lg ${
                      isMobile ? 'w-1' : 'w-1.5'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal floating particles for mobile performance */}
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white/30 rounded-full animate-bounce ${
                  isAnimating ? 'animate-ping' : ''
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </Main>
    </PageContainer>
  );
};

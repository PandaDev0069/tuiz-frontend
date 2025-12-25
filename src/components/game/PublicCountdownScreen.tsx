'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';

interface PublicCountdownScreenProps {
  countdownTime: number;
  onCountdownComplete?: () => void;
  message?: string;
  questionNumber?: number;
  totalQuestions?: number;
  startedAt?: number; // Server timestamp when countdown started (for synchronization)
}

export const PublicCountdownScreen: React.FC<PublicCountdownScreenProps> = ({
  countdownTime,
  onCountdownComplete,
  message = '準備してください！',
  questionNumber,
  totalQuestions,
  startedAt,
}) => {
  // Calculate initial time based on server timestamp if provided
  const getInitialTime = () => {
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      return Math.max(0, countdownTime - elapsed);
    }
    return countdownTime;
  };

  const [currentTime, setCurrentTime] = useState(getInitialTime);
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
    if (currentTime > 3) return 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl';
    if (currentTime > 0) return 'text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem]';
    return 'text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]';
  };

  const getCountdownColor = () => {
    if (currentTime > 3) return 'text-white';
    if (currentTime > 0) return 'text-yellow-300';
    return 'text-green-300';
  };

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Background */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={true} />
        </div>

        {/* Question Counter */}
        {questionNumber && totalQuestions && (
          <div className="absolute top-8 left-8 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-xl font-semibold text-gray-800">
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>
        )}

        {/* Main Countdown Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {/* Countdown Text/Number - Independent container */}
          <div className="text-center">
            <div
              className={`${getCountdownSize()} ${getCountdownColor()} font-bold drop-shadow-2xl transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {getCountdownText()}
            </div>

            {/* Subtitle for preparation message */}
            {currentTime > 3 && (
              <div className="mt-8 text-2xl md:text-3xl lg:text-4xl text-white/90 drop-shadow-xl">
                次の問題が始まります
              </div>
            )}
          </div>

          {/* Progress Bar - Completely separate and independent */}
          <div className="mt-12 w-full max-w-2xl mx-auto">
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-lg blur-sm scale-105"></div>

              {/* Main progress container - Fixed width, independent of text */}
              <div className="relative bg-white/10 rounded-lg h-4 w-full overflow-hidden border-2 border-white/20 backdrop-blur-sm">
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
                  <div className="absolute top-0 right-0 h-full w-2 bg-white/80 rounded-r-lg shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating particles for extra visual appeal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/30 rounded-full animate-bounce ${
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
      </Main>
    </PageContainer>
  );
};

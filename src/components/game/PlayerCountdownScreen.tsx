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
  startedAt?: number; // Server timestamp when countdown started (for synchronization)
  waitingMessage?: string; // Shown while waiting for startedAt to arrive
}

export const PlayerCountdownScreen: React.FC<PlayerCountdownScreenProps> = ({
  countdownTime,
  onCountdownComplete,
  message = '準備してください！',
  waitingMessage = message,
  questionNumber,
  totalQuestions,
  isMobile = true,
  startedAt,
}) => {
  const SYNC_DURATION_MS = 2000; // 2 seconds minimum sync window

  const computeRemaining = (startTs?: number) => {
    if (!startTs) return countdownTime;
    const elapsedMs = Date.now() - startTs;
    const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
    return Math.max(0, countdownTime - elapsedSec);
  };

  const [isSyncing, setIsSyncing] = useState(true);
  const [syncStartTime, setSyncStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(countdownTime);
  const [isAnimating, setIsAnimating] = useState(false);

  // Track when component mounts or startedAt arrives (whichever is later)
  useEffect(() => {
    const now = Date.now();
    // If startedAt is in the future (server lead time), use it as sync start
    // Otherwise use current time
    const effectiveStart = startedAt && startedAt > now ? startedAt : now;
    setSyncStartTime(effectiveStart);
  }, [startedAt]);

  // Update countdown time continuously during sync window when startedAt is available
  useEffect(() => {
    if (!startedAt) {
      setIsSyncing(true);
      setCurrentTime(countdownTime);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Update countdown time every 100ms during sync window
    const updateCountdown = () => {
      const remaining = computeRemaining(startedAt);
      setCurrentTime(remaining);
    };

    const checkSync = () => {
      const elapsed = Date.now() - syncStartTime;
      if (elapsed >= SYNC_DURATION_MS) {
        // 2 seconds have passed, exit sync mode and let normal countdown take over
        updateCountdown();
        setIsSyncing(false);
        if (intervalId) clearInterval(intervalId);
      } else {
        // Still in sync window, update countdown and check again soon
        updateCountdown();
        const remainingMs = SYNC_DURATION_MS - elapsed;
        timeoutId = setTimeout(checkSync, Math.min(remainingMs, 100));
      }
    };

    // Start updating countdown immediately during sync
    updateCountdown();
    intervalId = setInterval(updateCountdown, 100);
    checkSync();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
    // computeRemaining is stable (no deps) and intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, syncStartTime, countdownTime]);

  useEffect(() => {
    if (isSyncing) return;
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
  }, [currentTime, onCountdownComplete, isSyncing]);

  const getCountdownText = () => {
    // If syncing but we have startedAt, show countdown (it's being calculated)
    if (isSyncing && startedAt) {
      if (currentTime > 3) return message;
      if (currentTime > 0) return currentTime.toString();
      return 'スタート！';
    }
    // If syncing without startedAt, show waiting message
    if (isSyncing) return waitingMessage;
    // Normal countdown display
    if (currentTime > 3) return message;
    if (currentTime > 0) return currentTime.toString();
    return 'スタート！';
  };

  const getCountdownSize = () => {
    // If syncing but showing countdown (startedAt available), use normal countdown sizes
    if (isSyncing && startedAt) {
      if (isMobile) {
        if (currentTime > 3) return 'text-5xl sm:text-6xl';
        if (currentTime > 0) return 'text-7xl sm:text-8xl';
        return 'text-6xl sm:text-7xl';
      } else {
        if (currentTime > 3) return 'text-5xl md:text-6xl lg:text-7xl';
        if (currentTime > 0) return 'text-7xl md:text-8xl lg:text-9xl';
        return 'text-6xl md:text-7xl lg:text-8xl';
      }
    }
    // If syncing without startedAt, show waiting message size
    if (isSyncing) return isMobile ? 'text-5xl sm:text-6xl' : 'text-6xl md:text-7xl lg:text-8xl';
    // Normal countdown sizes
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
    // If syncing but showing countdown (startedAt available), use normal countdown colors
    if (isSyncing && startedAt) {
      if (currentTime > 3) return 'text-white';
      if (currentTime > 0) return 'text-yellow-300';
      return 'text-green-300';
    }
    // If syncing without startedAt, show white
    if (isSyncing) return 'text-white';
    // Normal countdown colors
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
          <div
            className={`text-center w-full ${isMobile ? 'max-w-sm sm:max-w-md' : 'max-w-4xl lg:max-w-5xl xl:max-w-6xl'}`}
          >
            <div
              className={`${getCountdownSize()} ${getCountdownColor()} font-bold drop-shadow-2xl transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {getCountdownText()}
            </div>

            {/* Subtitle for preparation message */}
            {isSyncing && (
              <div
                className={`mt-6 text-white/80 drop-shadow-xl ${
                  isMobile ? 'text-base sm:text-lg' : 'text-lg md:text-xl'
                }`}
              >
                全員の準備を待っています...
              </div>
            )}
            {!isSyncing && currentTime > 3 && (
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
                  style={{
                    width: isSyncing
                      ? '0%'
                      : `${((countdownTime - currentTime) / countdownTime) * 100}%`,
                  }}
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

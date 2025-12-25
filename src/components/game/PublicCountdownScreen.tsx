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
  waitingMessage?: string; // Shown while waiting for startedAt to arrive
}

export const PublicCountdownScreen: React.FC<PublicCountdownScreenProps> = ({
  countdownTime,
  onCountdownComplete,
  message = '準備してください！',
  questionNumber,
  totalQuestions,
  startedAt,
  waitingMessage = message,
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
      if (currentTime > 3) return 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl';
      if (currentTime > 0) return 'text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem]';
      return 'text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]';
    }
    // If syncing without startedAt, show waiting message size
    if (isSyncing) return 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl';
    // Normal countdown sizes
    if (currentTime > 3) return 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl';
    if (currentTime > 0) return 'text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem]';
    return 'text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]';
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
            {isSyncing && (
              <div className="mt-8 text-2xl md:text-3xl lg:text-4xl text-white/80 drop-shadow-xl">
                全員の準備を待っています...
              </div>
            )}
            {!isSyncing && currentTime > 3 && (
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
